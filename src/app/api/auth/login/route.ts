import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyPassword, verifyDummy } from '@/lib/password';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/session';
import { logAudit, extractClientIp } from '@/lib/audit';
import { isRateLimited, recordHit, clearRate, trustedClientIp } from '@/lib/rate-limit';

const INVALID = 'E-mail ou senha inválidos.';
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_ACCOUNT = 10;
const MAX_FAILS_PER_IP = 30;

// Só falhas contam. A senha correta entra sempre, mesmo com a conta com
// tentativas erradas registradas, então ninguém consegue trancar outra pessoa
// fora do sistema apenas errando a senha dela.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const emailKey = email.trim().toLowerCase();
    const ipKey = `login-fail-ip:${trustedClientIp(request)}`;
    const acctKey = `login-fail-user:${emailKey}`;

    const user = await prisma.user.findFirst({
      where: { email: emailKey, active: true },
      include: { branch: true },
    });

    // Mesmo custo de verificação para usuário inexistente e senha errada.
    const ok = user ? verifyPassword(password, user.passwordHash) : verifyDummy(password);

    if (!ok || !user) {
      recordHit(ipKey, WINDOW_MS);
      recordHit(acctKey, WINDOW_MS);
      const byIp = isRateLimited(ipKey, MAX_FAILS_PER_IP);
      const byAccount = isRateLimited(acctKey, MAX_FAILS_PER_ACCOUNT);
      if (byIp.limited || byAccount.limited) {
        const retry = Math.max(byIp.retryAfterSec, byAccount.retryAfterSec);
        return NextResponse.json(
          { error: 'Muitas tentativas de login. Aguarde alguns minutos.' },
          { status: 429, headers: { 'Retry-After': String(retry) } }
        );
      }
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    // Senha correta: zera as falhas da conta e segue.
    clearRate(acctKey);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, createSessionToken(user.id, user.sessionVersion), sessionCookieOptions());

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: `Login de ${user.name} (${user.role})`,
      ipAddress: extractClientIp(request),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchName: user.branch?.name,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro ao autenticar usuário' }, { status: 500 });
  }
}

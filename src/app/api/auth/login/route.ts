import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyPassword, verifyDummy } from '@/lib/password';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/session';
import { logAudit, extractClientIp } from '@/lib/audit';
import { reserve, release, trustedClientIp } from '@/lib/rate-limit';

const INVALID = 'E-mail ou senha inválidos.';
const WINDOW_MS = 15 * 60 * 1000;
// Camadas de limite (tentativas em 15 min):
const LIMIT_PAIR = 10; // conta + IP: barra adivinhação vinda de um IP
const LIMIT_ACCOUNT = 30; // conta, de qualquer IP: barra quem troca de IP
const LIMIT_IP = 100; // IP, em todas as contas: barra espalhamento de senhas

type Reservation = { key: string };

// Cada tentativa é reservada ANTES de checar a senha (síncrono, sem corrida).
// Login correto desfaz a reserva (não conta como falha). Login errado mantém.
// Se qualquer camada já estiver no limite, nada é verificado, nem a senha correta.
function reserveAll(keys: { key: string; limit: number }[]): { ok: true; held: Reservation[] } | { ok: false; retryAfterSec: number } {
  const held: Reservation[] = [];
  for (const { key, limit } of keys) {
    const r = reserve(key, limit, WINDOW_MS);
    if (!r.ok) {
      // Desfaz o que já foi reservado nesta tentativa.
      for (const h of held) release(h.key);
      return { ok: false, retryAfterSec: r.retryAfterSec };
    }
    held.push({ key });
  }
  return { ok: true, held };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const emailKey = email.trim().toLowerCase();
    const ip = trustedClientIp(request);
    const keys = [
      { key: `login-acct:${emailKey}`, limit: LIMIT_ACCOUNT },
      { key: `login-pair:${emailKey}@${ip}`, limit: LIMIT_PAIR },
      // Sem IP identificado, não há contador por IP (evita um balde compartilhado "unknown").
      ...(ip !== 'unknown' ? [{ key: `login-ip:${ip}`, limit: LIMIT_IP }] : []),
    ];

    const reservation = reserveAll(keys);
    if (!reservation.ok) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Aguarde alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(reservation.retryAfterSec) } }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: emailKey, active: true },
      include: { branch: true },
    });

    // Mesmo custo de verificação para usuário inexistente e senha errada.
    const ok = user ? verifyPassword(password, user.passwordHash) : verifyDummy(password);

    if (!ok || !user) {
      // Falha: a reserva fica contada.
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    // Sucesso: a tentativa não conta como falha.
    for (const h of reservation.held) release(h.key);

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

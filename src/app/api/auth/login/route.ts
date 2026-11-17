import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyPassword, verifyDummy } from '@/lib/password';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/session';
import { logAudit, extractClientIp } from '@/lib/audit';

const INVALID = 'E-mail ou senha inválidos.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), active: true },
      include: { branch: true },
    });

    // Same error and same work whether the user exists or the password is wrong.
    const ok = user ? verifyPassword(password, user.passwordHash) : verifyDummy(password);
    if (!user || !ok) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());

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

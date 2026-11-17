import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { logAudit, extractClientIp } from '@/lib/audit';
import { requireUser } from '@/lib/auth';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/session';

// Lets an ADMIN take over another user's session (e.g. to check what a
// vendedor sees). Only an authenticated ADMIN can call it, and the target must
// be active. Every switch is written to the audit log.
export async function POST(request: Request) {
  const auth = await requireUser(['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await request.json();
    if (typeof userId !== 'string' || !userId) {
      return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, active: true },
      include: { branch: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado ou inativo' }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());

    await logAudit({
      userId: auth.id,
      action: 'SWITCH_USER',
      entity: 'User',
      entityId: user.id,
      details: `${auth.name} (ADMIN) assumiu a sessão de ${user.name} (${user.role})`,
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
  } catch (e) {
    console.error('Erro ao trocar sessão:', e);
    return NextResponse.json({ error: 'Erro ao trocar sessão' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { logAudit, extractClientIp } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { branch: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchName: user.branch?.name,
    };

    const cookieStore = await cookies();
    cookieStore.set('motoflow_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    await logAudit({
      userId: user.id,
      action: 'SWITCH_USER',
      entity: 'User',
      entityId: user.id,
      details: `Sessão alternada para ${user.name} (${user.role})`,
      ipAddress: extractClientIp(request),
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

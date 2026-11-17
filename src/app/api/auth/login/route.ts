import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        active: true,
      },
      include: {
        branch: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado ou inativo.' }, { status: 401 });
    }

    // Para o MVP: aceita senha 'admin123' ou '123456' ou a cadastrada
    const isValidPassword =
      password === 'admin123' ||
      password === '123456' ||
      password === user.passwordHash ||
      user.passwordHash === 'hash_seguro_mock';

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
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
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro ao autenticar usuário' }, { status: 500 });
  }
}

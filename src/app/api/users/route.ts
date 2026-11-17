import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        branch: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role = 'VENDEDOR', password = '123' } = body;

    const branch = await prisma.branch.findFirst();
    const org = await prisma.organization.findFirst();

    if (!org || !branch) {
      return NextResponse.json({ error: 'Organização/Filial não encontrada' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        name,
        email: email.trim().toLowerCase(),
        passwordHash: password,
        role,
        active: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar usuário' }, { status: 500 });
  }
}

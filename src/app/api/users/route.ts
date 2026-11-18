import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, USER_ROLES, type UserRole } from '@/lib/auth';
import { hashPassword, MIN_LENGTH } from '@/lib/password';
import { logAudit, extractClientIp } from '@/lib/audit';
import { logError } from '@/lib/logger';
import { withRequest } from '@/lib/request-context';

// Any logged-in user can list the team (used for seller pickers);
// password hashes are never selected.
async function GET_handler() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

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

async function POST_handler(request: Request) {
  const auth = await requireUser(['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, email, role = 'VENDEDOR', password } = body ?? {};

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }
    if (!USER_ROLES.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `A senha deve ter pelo menos ${MIN_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findFirst();
    const org = await prisma.organization.findFirst();

    if (!org || !branch) {
      return NextResponse.json({ error: 'Organização/Filial não encontrada' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role,
        active: true,
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    await logAudit({
      userId: auth.id,
      action: 'CREATE',
      entity: 'User',
      entityId: newUser.id,
      details: `Usuário ${newUser.name} (${newUser.role}) criado por ${auth.name}`,
      ipAddress: extractClientIp(request),
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    logError('Erro ao cadastrar usuário:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar usuário' }, { status: 500 });
  }
}

export const GET = withRequest(GET_handler);
export const POST = withRequest(POST_handler);

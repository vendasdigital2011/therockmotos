import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { SESSION_COOKIE, verifySessionToken } from './session';
import { logError } from './logger';

export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'FINANCEIRO' | 'ESTOQUE';

export const USER_ROLES: readonly UserRole[] = ['ADMIN', 'GERENTE', 'VENDEDOR', 'FINANCEIRO', 'ESTOQUE'];

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchName?: string;
}

// Returns the logged-in user from a verified session cookie, or null.
// Never falls back to another user.
export async function getCurrentUser(): Promise<UserSession | null> {
  // Outside the try: during prerendering cookies() rejects on purpose so Next
  // marks the route dynamic; swallowing that would hide the signal.
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  try {
    const user = await prisma.user.findFirst({
      where: { id: payload.uid, active: true },
      include: { branch: true },
    });
    // Sessão revogada (logout) ou de versão antiga: não vale mais.
    if (!user || payload.v !== user.sessionVersion) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      branchName: user.branch?.name,
    };
  } catch (error) {
    logError('Falha ao validar sessão:', error);
    return null;
  }
}

/**
 * Guard for API route handlers.
 *
 *   const auth = await requireUser(['ADMIN', 'FINANCEIRO']);
 *   if (auth instanceof NextResponse) return auth;
 *   const user = auth;
 *
 * No roles = any logged-in user. Returns 401 without a session, 403 for a
 * role that isn't allowed.
 */
export async function requireUser(roles?: readonly UserRole[]): Promise<UserSession | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  if (roles && !roles.includes(user.role)) {
    return NextResponse.json({ error: 'Acesso negado para o seu perfil.' }, { status: 403 });
  }
  return user;
}

// Verifica se o usuário tem permissão para visualizar custos e margem
export function canViewFinancialCosts(role: string): boolean {
  return role === 'ADMIN' || role === 'GERENTE' || role === 'FINANCEIRO';
}

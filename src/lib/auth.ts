import { cookies } from 'next/headers';
import { prisma } from './prisma';

export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'FINANCEIRO' | 'ESTOQUE';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchName?: string;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('motoflow_session');

    if (sessionCookie && sessionCookie.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        return parsed;
      } catch (e) {
        // Ignora JSON corrompido
      }
    }

    // Padrão: Admin geral cadastrado
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN', active: true },
      include: { branch: true },
    });

    if (!admin) return null;

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role as UserRole,
      branchName: admin.branch?.name,
    };
  } catch {
    return null;
  }
}

// Verifica se o usuário tem permissão para visualizar custos e margem
export function canViewFinancialCosts(role: string): boolean {
  return role === 'ADMIN' || role === 'GERENTE' || role === 'FINANCEIRO';
}

import { NextResponse } from 'next/server';
import { getCurrentUser, canViewFinancialCosts } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  return NextResponse.json({
    user,
    permissions: {
      canViewCosts: canViewFinancialCosts(user.role),
      canManageUsers: user.role === 'ADMIN',
      canManageFinance: user.role === 'ADMIN' || user.role === 'FINANCEIRO',
      canSell: user.role === 'ADMIN' || user.role === 'GERENTE' || user.role === 'VENDEDOR',
    },
  });
}

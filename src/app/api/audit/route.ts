import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Verificação de RBAC (Apenas ADMIN e GERENTE podem ver logs de auditoria)
    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get('motoflow_session')?.value;
    let currentUser: any = null;

    if (sessionEmail) {
      currentUser = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true, name: true, role: true },
      });
    }

    if (!currentUser) {
      currentUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, name: true, role: true },
      });
    }

    if (currentUser?.role === 'VENDEDOR') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas Gestores e Administradores podem auditar os logs.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 250);

    const whereClause: any = {};
    if (action && action !== 'ALL') whereClause.action = action;
    if (entity && entity !== 'ALL') whereClause.entity = entity;
    if (userId && userId !== 'ALL') whereClause.userId = userId;
    if (search) {
      whereClause.details = { contains: search };
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Métricas do Painel de Auditoria
    const totalLogs = await prisma.auditLog.count();
    const priceChangeCount = await prisma.auditLog.count({ where: { action: 'PRICE_CHANGE' } });
    const financialActionsCount = await prisma.auditLog.count({
      where: { action: { in: ['FINANCIAL_BAIXA', 'FINANCIAL_CANCEL', 'FINANCIAL_ENTRY'] } },
    });
    const securityEventsCount = await prisma.auditLog.count({
      where: { action: { in: ['LOGIN', 'SWITCH_USER', 'ACCESS_SENSITIVE', 'USER_CREATE'] } },
    });

    return NextResponse.json({
      logs,
      metrics: {
        total: totalLogs,
        priceChanges: priceChangeCount,
        financialActions: financialActionsCount,
        securityEvents: securityEventsCount,
      },
    });
  } catch (error) {
    console.error('Erro ao listar audit logs:', error);
    return NextResponse.json({ error: 'Erro ao carregar trilha de auditoria' }, { status: 500 });
  }
}

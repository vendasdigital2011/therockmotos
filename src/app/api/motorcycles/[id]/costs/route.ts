import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit, extractClientIp } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'FINANCEIRO', 'ESTOQUE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      category = 'OUTROS',
      description,
      amount,
      isCredit = false,
      status = 'PAGO',
      supplierId,
    } = body;
    const createdByName = auth.name;

    if (!description || !amount) {
      return NextResponse.json({ error: 'Descrição e valor são obrigatórios' }, { status: 400 });
    }

    const moto = await prisma.motorcycle.findUnique({ where: { id } });
    if (!moto) {
      return NextResponse.json({ error: 'Moto não encontrada' }, { status: 404 });
    }

    const cost = await prisma.motorcycleCost.create({
      data: {
        motorcycleId: id,
        category,
        description,
        amount: Number(amount),
        isCredit: Boolean(isCredit),
        status,
        supplierId: supplierId || null,
        createdByName,
      },
      include: {
        supplier: true,
      },
    });

    await logAudit({
      userId: auth.id,
      action: 'COST_ADD',
      entity: 'MotorcycleCost',
      entityId: cost.id,
      details: `Custo agregado de R$ ${Number(amount).toLocaleString('pt-BR')} (${category}: "${description}") lançado para a moto ${moto.brand} ${moto.model} (${moto.plate}) por ${createdByName}.`,
      ipAddress: extractClientIp(request),
    });

    return NextResponse.json(cost, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar custo:', error);
    return NextResponse.json({ error: error.message || 'Erro ao adicionar custo' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'FINANCEIRO', 'ESTOQUE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const costId = searchParams.get('costId');

    if (!costId) {
      return NextResponse.json({ error: 'ID do custo não informado' }, { status: 400 });
    }

    // Scope by motorcycle too, so a cost can't be deleted through another bike's URL.
    const cost = await prisma.motorcycleCost.findFirst({ where: { id: costId, motorcycleId: id } });
    if (!cost) {
      return NextResponse.json({ error: 'Custo não encontrado' }, { status: 404 });
    }

    await prisma.motorcycleCost.delete({
      where: { id: costId },
    });

    if (cost) {
      await logAudit({
        userId: auth.id,
        action: 'COST_DELETE',
        entity: 'MotorcycleCost',
        entityId: costId,
        details: `Custo "${cost.description}" de R$ ${cost.amount.toLocaleString('pt-BR')} estornado/excluído da moto ID ${id} por ${auth.name}.`,
        ipAddress: extractClientIp(request),
      });
    }

    return NextResponse.json({ message: 'Custo removido com sucesso' });
  } catch (error: any) {
    console.error('Erro ao remover custo:', error);
    return NextResponse.json({ error: error.message || 'Erro ao remover custo' }, { status: 500 });
  }
}

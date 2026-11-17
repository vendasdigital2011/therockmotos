import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit, extractClientIp } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      createdByName,
    } = body;

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
        createdByName: createdByName || 'Gestor',
      },
      include: {
        supplier: true,
      },
    });

    await logAudit({
      action: 'COST_ADD',
      entity: 'MotorcycleCost',
      entityId: cost.id,
      details: `Custo agregado de R$ ${Number(amount).toLocaleString('pt-BR')} (${category}: "${description}") lançado para a moto ${moto.brand} ${moto.model} (${moto.plate}) por ${createdByName || 'Gestor'}.`,
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
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const costId = searchParams.get('costId');

    if (!costId) {
      return NextResponse.json({ error: 'ID do custo não informado' }, { status: 400 });
    }

    const cost = await prisma.motorcycleCost.findUnique({ where: { id: costId } });

    await prisma.motorcycleCost.delete({
      where: { id: costId },
    });

    if (cost) {
      await logAudit({
        action: 'COST_DELETE',
        entity: 'MotorcycleCost',
        entityId: costId,
        details: `Custo "${cost.description}" de R$ ${cost.amount.toLocaleString('pt-BR')} estornado/excluído da moto ID ${id}.`,
        ipAddress: extractClientIp(request),
      });
    }

    return NextResponse.json({ message: 'Custo removido com sucesso' });
  } catch (error: any) {
    console.error('Erro ao remover custo:', error);
    return NextResponse.json({ error: error.message || 'Erro ao remover custo' }, { status: 500 });
  }
}

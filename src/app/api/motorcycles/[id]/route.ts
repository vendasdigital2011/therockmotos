import { NextResponse } from 'next/server';
import { requireUser, canViewFinancialCosts } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit, extractClientIp } from '@/lib/audit';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';
import { withRequest } from '@/lib/request-context';

async function GET_handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const moto = await prisma.motorcycle.findUnique({
      where: { id },
      include: {
        costs: {
          include: {
            supplier: {
              select: { id: true, name: true, tradeName: true, roles: true, phone: true },
            },
          },
          orderBy: { date: 'desc' },
        },
        tasks: {
          include: {
            partner: {
              select: { id: true, name: true, tradeName: true, roles: true, phone: true },
            },
          },
          orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        },
        supplier: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!moto) {
      return NextResponse.json({ error: 'Moto não encontrada' }, { status: 404 });
    }

    if (!canViewFinancialCosts(auth.role)) {
      return NextResponse.json({ ...moto, costs: [] });
    }
    return NextResponse.json(moto);
  } catch (error) {
    logError('Erro ao buscar moto:', error);
    return NextResponse.json({ error: 'Erro ao buscar moto' }, { status: 500 });
  }
}

async function PATCH_handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'ESTOQUE', 'VENDEDOR']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const currentMoto = await prisma.motorcycle.findUnique({ where: { id } });
    if (!currentMoto) {
      return NextResponse.json({ error: 'Moto não encontrada' }, { status: 404 });
    }

    // VENDEDOR may only move the status (e.g. reserve a bike), not edit price or data.
    if (auth.role === 'VENDEDOR') {
      const allowed = new Set(['status', 'statusReason', 'userName']);
      const forbidden = Object.keys(body ?? {}).filter((k) => !allowed.has(k) && body[k] !== undefined);
      if (forbidden.length > 0) {
        return NextResponse.json({ error: 'Vendedor só pode alterar a situação da moto.' }, { status: 403 });
      }
    }

    const userName = auth.name;

    // Publicar/retirar da vitrine: só ADMIN e GERENTE.
    const { isPublic } = body ?? {};
    if (isPublic !== undefined && !['ADMIN', 'GERENTE'].includes(auth.role)) {
      return NextResponse.json({ error: 'Somente administrador ou gerente publica a moto na vitrine.' }, { status: 403 });
    }

    const {
      status,
      statusReason,
      publicPrice,
      mileage,
      location,
      condition,
      ownership,
      description,
      imageUrl,
      fipeValue,
      fipeCode,
      fipeRefMonth,
      features,
    } = body;

    // Se o status mudou, registrar no histórico imutável (PRD 03)
    if (status && status !== currentMoto.status) {
      await prisma.motorcycleStatusHistory.create({
        data: {
          motorcycleId: id,
          fromStatus: currentMoto.status,
          toStatus: status,
          reason: statusReason || 'Alteração manual de situação',
          userName: userName || 'Sistema',
        },
      });

      await logAudit({
        userId: auth.id,
        action: 'STATUS_CHANGE',
        entity: 'Motorcycle',
        entityId: id,
        details: `Status da moto ${currentMoto.brand} ${currentMoto.model} (${currentMoto.plate}) alterado de ${currentMoto.status} para ${status}. Motivo: "${statusReason || 'Não especificado'}" por ${userName || 'Usuário'}.`,
        ipAddress: extractClientIp(request),
      });
    }

    // Se o preço de venda mudou, auditar (PRD 10)
    if (publicPrice !== undefined && Number(publicPrice) !== currentMoto.publicPrice) {
      await logAudit({
        userId: auth.id,
        action: 'PRICE_CHANGE',
        entity: 'Motorcycle',
        entityId: id,
        details: `Preço público de venda da moto ${currentMoto.brand} ${currentMoto.model} (${currentMoto.plate}) alterado de R$ ${currentMoto.publicPrice.toLocaleString('pt-BR')} para R$ ${Number(publicPrice).toLocaleString('pt-BR')} por ${userName || 'Gestor'}.`,
        ipAddress: extractClientIp(request),
      });
    }

    if (typeof isPublic === 'boolean' && isPublic !== currentMoto.isPublic) {
      await logAudit({
        userId: auth.id,
        action: isPublic ? 'PUBLISH' : 'UNPUBLISH',
        entity: 'Motorcycle',
        entityId: id,
        details: `Moto ${currentMoto.brand} ${currentMoto.model} ${isPublic ? 'publicada na' : 'retirada da'} vitrine por ${userName}.`,
        ipAddress: extractClientIp(request),
      });
    }

    const updated = await prisma.motorcycle.update({
      where: { id },
      data: {
        status: status || undefined,
        publicPrice: publicPrice !== undefined ? Number(publicPrice) : undefined,
        mileage: mileage !== undefined ? Number(mileage) : undefined,
        location: location || undefined,
        condition: condition || undefined,
        ownership: ownership || undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl || undefined,
        fipeValue: fipeValue !== undefined ? Number(fipeValue) : undefined,
        fipeCode: fipeCode !== undefined ? fipeCode : undefined,
        fipeRefMonth: fipeRefMonth !== undefined ? fipeRefMonth : undefined,
        features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : undefined,
        isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
      },
      include: {
        costs: true,
        tasks: true,
        statusHistory: true,
      },
    });

    if (!canViewFinancialCosts(auth.role)) {
      return NextResponse.json({ ...updated, costs: [] });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    logError('Erro ao atualizar moto:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao atualizar moto') }, { status: 500 });
  }
}

async function DELETE_handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(['ADMIN', 'GERENTE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    // Regra PRD 03: se houver movimentação/venda, não permitir exclusão física, arquivar
    const hasSale = await prisma.sale.findUnique({ where: { motorcycleId: id } });
    if (hasSale) {
      // Arquivar
      await prisma.motorcycle.update({
        where: { id },
        data: { status: 'ARQUIVADA', isPublic: false },
      });
      return NextResponse.json({ message: 'Moto arquivada devido a histórico de venda existente.' });
    }

    await prisma.motorcycle.delete({ where: { id } });
    return NextResponse.json({ message: 'Moto removida com sucesso.' });
  } catch (error: any) {
    logError('Erro ao deletar moto:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao deletar moto') }, { status: 500 });
  }
}

export const GET = withRequest(GET_handler);
export const PATCH = withRequest(PATCH_handler);
export const DELETE = withRequest(DELETE_handler);

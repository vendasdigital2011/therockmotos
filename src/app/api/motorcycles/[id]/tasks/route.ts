import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      type = 'REVISAO_MECANICA',
      title,
      description,
      priority = 'MEDIA',
      status = 'ABERTA',
      assignedTo,
      partnerId,
      dueDate,
      costEstimate,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Título da pendência é obrigatório' }, { status: 400 });
    }

    const task = await prisma.motorcycleTask.create({
      data: {
        motorcycleId: id,
        type,
        title,
        description,
        priority,
        status,
        assignedTo: assignedTo || null,
        partnerId: partnerId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        costEstimate: costEstimate ? Number(costEstimate) : null,
      },
      include: {
        partner: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    logError('Erro ao criar pendência:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao criar pendência') }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { taskId, status, priority, description, costEstimate, dueDate } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'ID da pendência não informado' }, { status: 400 });
    }

    const existing = await prisma.motorcycleTask.findFirst({ where: { id: taskId, motorcycleId: id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pendência não encontrada' }, { status: 404 });
    }

    const updated = await prisma.motorcycleTask.update({
      where: { id: taskId },
      data: {
        status: status || undefined,
        priority: priority || undefined,
        description: description !== undefined ? description : undefined,
        costEstimate: costEstimate !== undefined ? Number(costEstimate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completedAt: status === 'CONCLUIDA' ? new Date() : (status && status !== 'CONCLUIDA' ? null : undefined),
      },
      include: {
        partner: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    logError('Erro ao atualizar pendência:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao atualizar pendência') }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'ESTOQUE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'ID da pendência não informado' }, { status: 400 });
    }

    const existing = await prisma.motorcycleTask.findFirst({ where: { id: taskId, motorcycleId: id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pendência não encontrada' }, { status: 404 });
    }

    await prisma.motorcycleTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Pendência removida com sucesso' });
  } catch (error: any) {
    logError('Erro ao remover pendência:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao remover pendência') }, { status: 500 });
  }
}

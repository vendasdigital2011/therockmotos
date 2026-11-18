import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createServiceOrder,
  finalizeServiceOrder,
  checkWarrantyEligibility,
} from '@/lib/post-sale-services';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';
import { withRequest } from '@/lib/request-context';

async function GET_handler(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const motoId = searchParams.get('motorcycleId');

    if (motoId && searchParams.get('action') === 'check_warranty') {
      const eligibility = await checkWarrantyEligibility(motoId);
      return NextResponse.json(eligibility);
    }

    const orders = await prisma.serviceOrder.findMany({
      include: {
        motorcycle: { select: { id: true, brand: true, model: true, plate: true, yearModel: true } },
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
      },
      orderBy: { openedAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    logError('Erro na API de Serviços/Garantia:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao listar ordens de serviço') }, { status: 500 });
  }
}

async function POST_handler(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { action } = body;

    const userName = auth.name;

    if (action === 'create') {
      const { motorcycleId, customerId, type, complaintDescription, mechanicName, items } = body;
      const os = await createServiceOrder({
        motorcycleId,
        customerId,
        type,
        complaintDescription,
        mechanicName,
        items,
        operatorName: userName,
      });
      return NextResponse.json(os, { status: 201 });
    }

    if (action === 'finalize') {
      const { orderId, solutionNotes } = body;
      const os = await finalizeServiceOrder(orderId, solutionNotes, userName);
      return NextResponse.json(os);
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    logError('Erro ao processar serviço:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro na operação de serviço') }, { status: 500 });
  }
}

export const GET = withRequest(GET_handler);
export const POST = withRequest(POST_handler);

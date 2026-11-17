import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createServiceOrder,
  finalizeServiceOrder,
  checkWarrantyEligibility,
} from '@/lib/post-sale-services';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
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
    console.error('Erro na API de Serviços/Garantia:', error);
    return NextResponse.json({ error: error.message || 'Erro ao listar ordens de serviço' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    let userName = 'Operador';
    try {
      const cookieStore = await cookies();
      const email = cookieStore.get('motoflow_session')?.value;
      if (email) {
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) userName = u.name;
      }
    } catch {}

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
    console.error('Erro ao processar serviço:', error);
    return NextResponse.json({ error: error.message || 'Erro na operação de serviço' }, { status: 500 });
  }
}

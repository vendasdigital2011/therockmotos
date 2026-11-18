import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  issueFiscalDocument,
  createDynamicPixCharge,
  registerRenaveOperation,
} from '@/lib/fiscal-bank-renave';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';

export async function GET(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'FINANCEIRO']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'all';

    const fiscalDocuments = await prisma.fiscalDocument.findMany({
      orderBy: { issuedAt: 'desc' },
      take: 30,
      include: {
        motorcycle: { select: { brand: true, model: true, plate: true } },
        customer: { select: { name: true, document: true } },
      },
    });

    const bankCharges = await prisma.bankCharge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        financialEntry: { select: { description: true, status: true } },
      },
    });

    const renaveOperations = await prisma.renaveOperation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        motorcycle: { select: { brand: true, model: true, plate: true } },
      },
    });

    return NextResponse.json({
      fiscalDocuments,
      bankCharges,
      renaveOperations,
      metrics: {
        totalNFeIssued: fiscalDocuments.filter((d) => d.status === 'AUTORIZADA').length,
        totalPixPending: bankCharges.filter((c) => c.status === 'PENDENTE').length,
        totalPixPaid: bankCharges.filter((c) => c.status === 'PAGO').length,
        totalRenaveActive: renaveOperations.filter((r) => r.status === 'INTEGRADO').length,
      },
    });
  } catch (error: any) {
    logError('Erro na API Fiscal/Bancos/RENAVE:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao carregar dados fiscais') }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'FINANCEIRO']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { action } = body;

    const userName = auth.name;

    // 1. Emissão de NF-e
    if (action === 'issue_nfe') {
      const { type, motorcycleId, customerId, saleId, valorTotal } = body;
      const doc = await issueFiscalDocument({
        type,
        motorcycleId,
        customerId,
        saleId,
        valorTotal: Number(valorTotal),
        operatorName: userName,
      });
      return NextResponse.json(doc);
    }

    // 2. Criação de Pix Dinâmico
    if (action === 'create_pix') {
      const { financialEntryId, amount, customerName, customerDoc, provider } = body;
      const charge = await createDynamicPixCharge({
        financialEntryId,
        amount: Number(amount),
        customerName,
        customerDoc,
        provider,
      });
      return NextResponse.json(charge);
    }

    // 3. Webhook de liquidação bancária (PRD 12B)
    // 4. Operação RENAVE (Entrada ou Saída)
    if (action === 'renave_op') {
      const { motorcycleId, operationType, crvNumero } = body;
      const op = await registerRenaveOperation({
        motorcycleId,
        operationType,
        crvNumero,
        operatorName: userName,
      });
      return NextResponse.json(op);
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    logError('Erro na ação fiscal:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro no módulo fiscal') }, { status: 500 });
  }
}

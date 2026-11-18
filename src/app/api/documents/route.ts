import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateSaleContractHtml,
  generateWarrantyTermHtml,
  generateDepositReceiptHtml,
  generateTrafficResponsibilityHtml,
} from '@/lib/documents';
import { logAudit, extractClientIp } from '@/lib/audit';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';

export async function GET(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'VENDEDOR', 'FINANCEIRO']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('saleId');
    const motorcycleId = searchParams.get('motorcycleId');
    const type = searchParams.get('type');

    const whereClause: any = {};
    if (saleId) whereClause.saleId = saleId;
    if (motorcycleId) whereClause.motorcycleId = motorcycleId;
    if (type && type !== 'ALL') whereClause.type = type;

    const documents = await prisma.documentContract.findMany({
      where: whereClause,
      include: {
        motorcycle: {
          select: {
            id: true,
            brand: true,
            model: true,
            plate: true,
            color: true,
            yearMfg: true,
            yearModel: true,
          },
        },
        sale: {
          include: {
            customer: true,
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    logError('Erro ao listar documentos:', error);
    return NextResponse.json({ error: 'Erro ao listar documentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'VENDEDOR', 'FINANCEIRO']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      type, // CONTRATO_VENDA, TERMO_GARANTIA, RECIBO_SINAL, TERMO_RESPONSABILIDADE
      saleId,
      motorcycleId,
      buyerName,
      buyerDoc,
      buyerRg,
      buyerPhone,
      buyerEmail,
      buyerAddress,
      buyerCity,
      buyerState,
      salePrice,
      entryAmount,
      entryMethod,
      financedAmount,
      tradeInAmount,
      tradeInPlate,
      tradeInModel,
      depositAmount,
      reservationDeadlineDays,
      sellerName,
    } = body;

    let motoData: any = null;
    let customerData: any = null;
    let saleData: any = null;

    if (saleId) {
      saleData = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          motorcycle: true,
          customer: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      });
      if (saleData) {
        motoData = saleData.motorcycle;
        customerData = saleData.customer;
      }
    } else if (motorcycleId) {
      motoData = await prisma.motorcycle.findUnique({
        where: { id: motorcycleId },
      });
    }

    if (!motoData) {
      return NextResponse.json({ error: 'Motocicleta não localizada para geração do documento' }, { status: 400 });
    }

    const buyer = {
      name: buyerName || customerData?.name || 'Comprador Não Informado',
      document: buyerDoc || customerData?.document || '',
      rg: buyerRg || '',
      phone: buyerPhone || customerData?.phone || '',
      email: buyerEmail || customerData?.email || '',
      address: buyerAddress || customerData?.address || '',
      city: buyerCity || customerData?.city || 'Florianópolis',
      state: buyerState || customerData?.state || 'SC',
    };

    const vehicle = {
      brand: motoData.brand,
      model: motoData.model,
      version: motoData.version || '',
      yearFab: motoData.yearMfg,
      yearModel: motoData.yearModel,
      color: motoData.color,
      plate: motoData.plate,
      renavam: motoData.renavam || '',
      chassi: motoData.chassi || '',
      mileage: motoData.mileage,
    };

    const financial = {
      salePrice: Number(salePrice || saleData?.salePrice || motoData.publicPrice || 0),
      entryAmount: Number(entryAmount || saleData?.entryAmount || 0),
      entryMethod: entryMethod || 'PIX / Transferência',
      financedAmount: Number(financedAmount || saleData?.financedAmount || 0),
      tradeInAmount: Number(tradeInAmount || saleData?.tradeInAmount || 0),
      tradeInPlate: tradeInPlate || saleData?.tradeInPlate || '',
      tradeInModel: tradeInModel || saleData?.tradeInModel || '',
      paymentType: saleData?.paymentType || 'A_VISTA',
      depositAmount: Number(depositAmount || 0),
      reservationDeadlineDays: Number(reservationDeadlineDays || 5),
    };

    let title = 'Documento';
    let contentHtml = '';

    switch (type) {
      case 'CONTRATO_VENDA':
        title = `Contrato de Compra e Venda - ${motoData.brand} ${motoData.model} (${motoData.plate ?? 'sem placa'})`;
        contentHtml = generateSaleContractHtml(buyer, vehicle, financial, sellerName || saleData?.seller?.name);
        break;

      case 'TERMO_GARANTIA':
        title = `Termo de Entrega & Garantia 90D - ${motoData.brand} ${motoData.model} (${motoData.plate ?? 'sem placa'})`;
        contentHtml = generateWarrantyTermHtml(buyer, vehicle);
        break;

      case 'RECIBO_SINAL':
        title = `Recibo de Sinal & Reserva - ${motoData.brand} ${motoData.model} (${motoData.plate ?? 'sem placa'})`;
        contentHtml = generateDepositReceiptHtml(buyer, vehicle, financial);
        break;

      case 'TERMO_RESPONSABILIDADE':
        title = `Termo de Responsabilidade sobre Multas - ${motoData.brand} ${motoData.model} (${motoData.plate ?? 'sem placa'})`;
        contentHtml = generateTrafficResponsibilityHtml(buyer, vehicle);
        break;

      default:
        return NextResponse.json({ error: 'Tipo de documento inválido' }, { status: 400 });
    }

    const doc = await prisma.documentContract.create({
      data: {
        type,
        title,
        saleId: saleData?.id || null,
        motorcycleId: motoData.id,
        customerId: customerData?.id || null,
        sellerId: saleData?.sellerId || null,
        contentHtml,
        status: 'GERADO',
      },
      include: {
        motorcycle: true,
        sale: {
          include: { customer: true },
        },
      },
    });

    await logAudit({
      userId: auth.id,
      action: 'DOCUMENT_GENERATE',
      entity: 'DocumentContract',
      entityId: doc.id,
      details: `Documento oficial emitido: "${doc.title}" (Tipo: ${doc.type}).`,
      ipAddress: extractClientIp(request),
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    logError('Erro ao gerar documento:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao gerar documento') }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'VENDEDOR', 'FINANCEIRO']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, status, witness1Name, witness1Doc, witness2Name, witness2Doc } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do documento é obrigatório' }, { status: 400 });
    }

    const updated = await prisma.documentContract.update({
      where: { id },
      data: {
        status: status || undefined,
        signDate: status === 'ASSINADO' ? new Date() : undefined,
        witness1Name: witness1Name !== undefined ? witness1Name : undefined,
        witness1Doc: witness1Doc !== undefined ? witness1Doc : undefined,
        witness2Name: witness2Name !== undefined ? witness2Name : undefined,
        witness2Doc: witness2Doc !== undefined ? witness2Doc : undefined,
      },
    });

    if (status === 'ASSINADO') {
      await logAudit({
        userId: auth.id,
        action: 'DOCUMENT_SIGN',
        entity: 'DocumentContract',
        entityId: updated.id,
        details: `Documento "${updated.title}" registrado como ASSINADO pelas partes.`,
        ipAddress: extractClientIp(request),
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: publicMessage(error, 'Erro ao atualizar documento') }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do documento é obrigatório' }, { status: 400 });
    }

    await prisma.documentContract.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir documento' }, { status: 500 });
  }
}

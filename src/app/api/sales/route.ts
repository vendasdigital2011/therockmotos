import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit, extractClientIp } from '@/lib/audit';
import { autoRemoveSoldVehicleFromPortals } from '@/lib/portal-adapters';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        motorcycle: true,
        customer: true,
        seller: {
          select: { name: true, email: true },
        },
      },
      orderBy: { saleDate: 'desc' },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return NextResponse.json({ error: 'Erro ao listar vendas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      motorcycleId,
      customerName,
      customerPhone,
      customerDocument,
      customerEmail,
      salePrice,
      paymentType, // A_VISTA, FINANCIAMENTO, TROCA
      entryAmount = 0,
      financedAmount = 0,
      tradeInAmount = 0,
      tradeInPlate,
      tradeInBrand = 'Honda',
      tradeInModel,
      tradeInYear = 2020,
      tradeInColor = 'Preta',
      tradeInMileage = 20000,
      notes = '',
    } = body;

    if (!motorcycleId || !customerName || !customerPhone || !salePrice) {
      return NextResponse.json(
        { error: 'Moto, dados do cliente e valor de venda são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Busca a moto e seus custos
    const moto = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
      include: { costs: true },
    });

    if (!moto) {
      return NextResponse.json({ error: 'Moto não encontrada' }, { status: 404 });
    }

    if (moto.status === 'VENDIDA') {
      return NextResponse.json({ error: 'Esta moto já foi vendida anteriormente.' }, { status: 400 });
    }

    // 2. Calcula custo real e lucro bruto
    const costBasis = moto.costs.reduce((acc, c) => acc + c.amount, 0);
    const numSalePrice = Number(salePrice);
    const grossProfit = numSalePrice - costBasis;

    // 3. Localiza o primeiro vendedor ou admin disponível
    const seller = await prisma.user.findFirst();
    if (!seller) {
      return NextResponse.json({ error: 'Nenhum usuário vendedor ativo encontrado' }, { status: 400 });
    }

    // 4. Executa a transação completa
    const result = await prisma.$transaction(async (tx) => {
      // Cria ou atualiza o cliente
      let customer = await tx.customer.findFirst({
        where: { phone: customerPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            document: customerDocument || null,
            email: customerEmail || null,
          },
        });
      }

      // Registra a Venda
      const sale = await tx.sale.create({
        data: {
          motorcycleId: moto.id,
          customerId: customer.id,
          sellerId: seller.id,
          salePrice: numSalePrice,
          costBasis,
          grossProfit,
          paymentType,
          entryAmount: Number(entryAmount),
          financedAmount: Number(financedAmount),
          tradeInAmount: Number(tradeInAmount),
          tradeInPlate: tradeInPlate ? tradeInPlate.toUpperCase().trim() : null,
          tradeInModel: tradeInModel || null,
          notes,
        },
      });

      // Atualiza o status da moto para VENDIDA e remove da vitrine pública
      await tx.motorcycle.update({
        where: { id: moto.id },
        data: {
          status: 'VENDIDA',
          isPublic: false,
        },
      });

      // Se houver moto recebida na troca, insere automaticamente no estoque como EM_PREPARACAO
      let createdTradeInMoto = null;
      if (paymentType === 'TROCA' && tradeInAmount > 0 && tradeInPlate && tradeInModel) {
        const cleanPlate = tradeInPlate.toUpperCase().trim();
        createdTradeInMoto = await tx.motorcycle.create({
          data: {
            branchId: moto.branchId,
            plate: cleanPlate,
            brand: tradeInBrand,
            model: tradeInModel,
            yearMfg: Number(tradeInYear),
            yearModel: Number(tradeInYear),
            color: tradeInColor,
            mileage: Number(tradeInMileage),
            status: 'EM_PREPARACAO',
            publicPrice: Number(tradeInAmount) * 1.25, // sugestão de preço inicial
            location: 'Pátio de Entrada / Trocas',
            description: `Entrada recebida na troca pela venda da moto ${moto.brand} ${moto.model} (${moto.plate}).`,
            costs: {
              create: [
                {
                  category: 'AQUISICAO',
                  description: `Valor de avaliação na troca da venda #${sale.id.slice(0, 8)}`,
                  amount: Number(tradeInAmount),
                },
              ],
            },
          },
        });
      }

      // Gera o título a receber no Financeiro
      await tx.financialEntry.create({
        data: {
          motorcycleId: moto.id,
          type: 'RECEITA',
          category: 'VENDA_MOTO',
          description: `Venda ${moto.brand} ${moto.model} · Cliente ${customer.name}`,
          amount: numSalePrice,
          dueDate: new Date(),
          paymentDate: new Date(),
          status: 'PAGO',
        },
      });

      // Se houver lead com essa moto e telefone, marca como GANHO
      const relatedLead = await tx.lead.findFirst({
        where: { motorcycleId: moto.id },
      });
      if (relatedLead) {
        await tx.lead.update({
          where: { id: relatedLead.id },
          data: { stage: 'GANHO' },
        });
      }

      return { sale, customer, moto, tradeInMoto: createdTradeInMoto };
    });

    await logAudit({
      userId: seller.id,
      action: 'SALE_CREATE',
      entity: 'Sale',
      entityId: result.sale.id,
      details: `Venda formalizada: Moto ${moto.brand} ${moto.model} (${moto.plate}) faturada por R$ ${numSalePrice.toLocaleString('pt-BR')} para o comprador ${customerName}. Margem bruta: R$ ${grossProfit.toLocaleString('pt-BR')}.`,
      ipAddress: extractClientIp(request),
    });

    // PRD 11: Retirada imediata de veículo vendido dos portais integrados
    try {
      await autoRemoveSoldVehicleFromPortals(moto.id, seller.name);
    } catch (portalErr) {
      console.warn('Aviso: falha na despublicação de portais após venda:', portalErr);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao concretizar venda:', error);
    return NextResponse.json({ error: error.message || 'Erro ao concretizar venda' }, { status: 500 });
  }
}

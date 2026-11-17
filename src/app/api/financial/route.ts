import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit, extractClientIp } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // RECEITA, DESPESA
    const status = searchParams.get('status'); // PENDENTE, PAGO, CANCELADO
    const regime = searchParams.get('regime') || 'CAIXA'; // CAIXA ou COMPETENCIA

    // 1. Contas Financeiras / Bancárias
    const accounts = await prisma.financialAccount.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    // 2. Filtros de títulos
    const whereClause: any = {};
    if (type && type !== 'ALL') whereClause.type = type;
    if (status && status !== 'ALL') whereClause.status = status;

    const entries = await prisma.financialEntry.findMany({
      where: whereClause,
      include: {
        financialAccount: {
          select: { id: true, name: true, type: true, bankName: true },
        },
        customer: {
          select: { id: true, name: true, tradeName: true, roles: true, phone: true },
        },
        motorcycle: {
          select: { id: true, brand: true, model: true, plate: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    // 3. Métricas de Caixa
    const now = new Date();
    const saldoTotalContas = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

    const allEntries = await prisma.financialEntry.findMany();

    const totalAReceber = allEntries
      .filter((e) => e.type === 'RECEITA' && e.status === 'PENDENTE')
      .reduce((acc, e) => acc + e.amount, 0);

    const totalAPagar = allEntries
      .filter((e) => e.type === 'DESPESA' && e.status === 'PENDENTE')
      .reduce((acc, e) => acc + e.amount, 0);

    const totalAtrasado = allEntries
      .filter((e) => e.status === 'PENDENTE' && new Date(e.dueDate) < now)
      .reduce((acc, e) => acc + e.amount, 0);

    // 4. Estrutura do DRE Gerencial (Demonstrativo de Resultado)
    // Calcula com base nos registros do mês (regime de Caixa ou Competência)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const dreEntries = allEntries.filter((e) => {
      const dateToCompare = regime === 'CAIXA' ? (e.paymentDate || e.dueDate) : e.competenceDate;
      const d = new Date(dateToCompare);
      return d >= startOfMonth && d <= endOfMonth && (regime === 'CAIXA' ? e.status === 'PAGO' : e.status !== 'CANCELADO');
    });

    // (A) Receita Bruta
    const receitaVendas = dreEntries
      .filter((e) => e.type === 'RECEITA' && e.category === 'VENDA_MOTO')
      .reduce((acc, e) => acc + e.amount, 0);

    const receitaComissoesFinan = dreEntries
      .filter((e) => e.type === 'RECEITA' && e.category === 'COMISSAO_FINANCIAMENTO')
      .reduce((acc, e) => acc + e.amount, 0);

    const outrasReceitas = dreEntries
      .filter((e) => e.type === 'RECEITA' && e.category !== 'VENDA_MOTO' && e.category !== 'COMISSAO_FINANCIAMENTO')
      .reduce((acc, e) => acc + e.amount, 0);

    const receitaBrutaTotal = receitaVendas + receitaComissoesFinan + outrasReceitas;

    // (B) Deduções e Impostos
    const impostosDeducoes = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'IMPOSTOS')
      .reduce((acc, e) => acc + e.amount, 0);

    // (C) Receita Líquida
    const receitaLiquida = Math.max(0, receitaBrutaTotal - impostosDeducoes);

    // (D) Custos Diretos / CMV (Custo das Mercadorias Vendidas)
    const custoAquisicaoMotos = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'AQUISICAO_VEICULO')
      .reduce((acc, e) => acc + e.amount, 0);

    const custoOficinaPecas = dreEntries
      .filter((e) => e.type === 'DESPESA' && (e.category === 'OFICINA_MECANICA' || e.category === 'PECAS' || e.category === 'ESTETICA'))
      .reduce((acc, e) => acc + e.amount, 0);

    const custoDocumentacaoDetran = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'DOCUMENTACAO')
      .reduce((acc, e) => acc + e.amount, 0);

    const cmvTotal = custoAquisicaoMotos + custoOficinaPecas + custoDocumentacaoDetran;

    // (E) Lucro Bruto Operacional (Margem de Contribuição)
    const lucroBruto = receitaLiquida - cmvTotal;
    const margemBrutaPercentual = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

    // (F) Despesas Operacionais Fixas & Variáveis
    const despesasAluguel = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'ALUGUEL')
      .reduce((acc, e) => acc + e.amount, 0);

    const despesasMarketing = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'MARKETING_ANUNCIOS')
      .reduce((acc, e) => acc + e.amount, 0);

    const despesasComissoesPessoal = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'COMISSAO')
      .reduce((acc, e) => acc + e.amount, 0);

    const outrasDespesasOperacionais = dreEntries
      .filter((e) => e.type === 'DESPESA' && e.category === 'DESPESA_OPERACIONAL')
      .reduce((acc, e) => acc + e.amount, 0);

    const totalDespesasOperacionais = despesasAluguel + despesasMarketing + despesasComissoesPessoal + outrasDespesasOperacionais;

    // (G) Resultado Operacional / EBITDA Gerencial
    const resultadoOperacional = lucroBruto - totalDespesasOperacionais;

    // (H) Lucro Líquido Final
    const lucroLiquido = resultadoOperacional;
    const margemLiquidaPercentual = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

    return NextResponse.json({
      accounts,
      entries,
      kpis: {
        saldoTotalContas,
        totalAReceber,
        totalAPagar,
        totalAtrasado,
      },
      dre: {
        periodo: `${now.toLocaleString('pt-BR', { month: 'long' })} / ${now.getFullYear()}`,
        regime,
        receitaBruta: {
          total: receitaBrutaTotal,
          vendasMotos: receitaVendas,
          comissoesFinanciamento: receitaComissoesFinan,
          outrasReceitas: outrasReceitas,
        },
        deducoesImpostos: impostosDeducoes,
        receitaLiquida,
        cmv: {
          total: cmvTotal,
          aquisicaoMotos: custoAquisicaoMotos,
          oficinaEstetica: custoOficinaPecas,
          despachanteDetran: custoDocumentacaoDetran,
        },
        lucroBruto,
        margemBrutaPercentual: margemBrutaPercentual.toFixed(1),
        despesasOperacionais: {
          total: totalDespesasOperacionais,
          aluguelShowroom: despesasAluguel,
          marketingAnuncios: despesasMarketing,
          comissoesEquipe: despesasComissoesPessoal,
          utilidadesGerais: outrasDespesasOperacionais,
        },
        resultadoOperacional,
        lucroLiquido,
        margemLiquidaPercentual: margemLiquidaPercentual.toFixed(1),
      },
    });
  } catch (error: any) {
    console.error('Erro no módulo financeiro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar dados financeiros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = 'DESPESA',
      category = 'DESPESA_OPERACIONAL',
      description,
      amount,
      dueDate,
      costCenter = 'SHOWROOM',
      paymentMethod = 'PIX',
      financialAccountId,
      customerId,
      motorcycleId,
      notes,
    } = body;

    if (!description || !amount || !dueDate) {
      return NextResponse.json({ error: 'Descrição, valor e vencimento são obrigatórios' }, { status: 400 });
    }

    const entry = await prisma.financialEntry.create({
      data: {
        type,
        category,
        description,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        competenceDate: new Date(),
        costCenter,
        paymentMethod,
        financialAccountId: financialAccountId || null,
        customerId: customerId || null,
        motorcycleId: motorcycleId || null,
        notes: notes || null,
        status: 'PENDENTE',
      },
      include: {
        financialAccount: true,
        customer: true,
        motorcycle: true,
      },
    });

    await logAudit({
      action: 'FINANCIAL_ENTRY',
      entity: 'FinancialEntry',
      entityId: entry.id,
      details: `Novo título financeiro lançado: "${entry.description}" (${entry.type}) no valor de R$ ${entry.amount.toLocaleString('pt-BR')}.`,
      ipAddress: extractClientIp(request),
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar título financeiro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar título financeiro' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { entryId, action, financialAccountId, paidAmount, paymentDate } = body;

    if (!entryId) {
      return NextResponse.json({ error: 'ID do lançamento não informado' }, { status: 400 });
    }

    const entry = await prisma.financialEntry.findUnique({ where: { id: entryId } });
    if (!entry) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 });
    }

    if (action === 'BAIXA') {
      const finalPaidAmount = paidAmount !== undefined ? Number(paidAmount) : entry.amount;
      const targetAccountId = financialAccountId || entry.financialAccountId;

      // Executar baixa atômica atualizando o título e o saldo da conta financeira
      const result = await prisma.$transaction(async (tx) => {
        const updatedEntry = await tx.financialEntry.update({
          where: { id: entryId },
          data: {
            status: 'PAGO',
            paidAmount: finalPaidAmount,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            financialAccountId: targetAccountId,
          },
        });

        if (targetAccountId) {
          const delta = entry.type === 'RECEITA' ? finalPaidAmount : -finalPaidAmount;
          await tx.financialAccount.update({
            where: { id: targetAccountId },
            data: {
              currentBalance: { increment: delta },
            },
          });
        }

        return updatedEntry;
      });

      await logAudit({
        action: 'FINANCIAL_BAIXA',
        entity: 'FinancialEntry',
        entityId: entry.id,
        details: `Baixa/liquidação financeira efetuada no título "${entry.description}" no valor de R$ ${finalPaidAmount.toLocaleString('pt-BR')}.`,
        ipAddress: extractClientIp(request),
      });

      return NextResponse.json(result);
    }

    if (action === 'CANCELAR') {
      const updated = await prisma.financialEntry.update({
        where: { id: entryId },
        data: { status: 'CANCELADO' },
      });

      await logAudit({
        action: 'FINANCIAL_CANCEL',
        entity: 'FinancialEntry',
        entityId: entry.id,
        details: `Título financeiro "${entry.description}" (R$ ${entry.amount.toLocaleString('pt-BR')}) foi CANCELADO.`,
        ipAddress: extractClientIp(request),
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro ao atualizar título financeiro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar título financeiro' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
    }

    await prisma.financialEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ message: 'Título excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir título:', error);
    return NextResponse.json({ error: error.message || 'Erro ao excluir título' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireUser, canViewFinancialCosts } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/logger';
import { withRequest } from '@/lib/request-context';

async function GET_handler() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const motorcycles = await prisma.motorcycle.findMany({
      include: {
        costs: true,
        tasks: true,
        supplier: {
          select: { name: true, tradeName: true },
        },
      },
    });

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const financialEntries = await prisma.financialEntry.findMany({
      orderBy: { dueDate: 'asc' },
    });

    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      take: 10,
    });

    const tasks = await prisma.motorcycleTask.findMany({
      include: {
        motorcycle: {
          select: { brand: true, model: true, plate: true },
        },
        partner: {
          select: { name: true, tradeName: true, phone: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    // Cálculos de estoque
    const now = Date.now();
    const totalMotos = motorcycles.length;
    const motosDisponiveis = motorcycles.filter(m => m.status === 'DISPONIVEL').length;
    const motosEmPreparacao = motorcycles.filter(m => m.status === 'EM_PREPARACAO').length;
    const motosReservadas = motorcycles.filter(m => m.status === 'RESERVADA').length;
    const motosVendidas = motorcycles.filter(m => m.status === 'VENDIDA').length;

    // Calcular dias em estoque e capital investido
    let capitalEstoque = 0;
    let valorPotencialVenda = 0;
    let somaDiasEstoque = 0;
    let motosComDias = 0;
    let estoqueCriticoCount = 0;

    const motosFormatadas = motorcycles.map(m => {
      // Custo Real = Soma de custos (deduzindo se for crédito)
      const custoReal = m.costs.reduce((acc, c) => {
        if (c.status === 'CANCELADO') return acc;
        return c.isCredit ? acc - c.amount : acc + c.amount;
      }, 0);

      const diasEmEstoque = Math.max(0, Math.floor((now - new Date(m.entryDate).getTime()) / (1000 * 60 * 60 * 24)));

      if (m.status !== 'VENDIDA' && m.status !== 'ARQUIVADA') {
        capitalEstoque += custoReal;
        valorPotencialVenda += m.publicPrice;
        somaDiasEstoque += diasEmEstoque;
        motosComDias++;
        if (diasEmEstoque > 45) {
          estoqueCriticoCount++;
        }
      }

      const margemBruta = m.publicPrice - custoReal;
      const margemPercentual = m.publicPrice > 0 ? (margemBruta / m.publicPrice) * 100 : 0;

      const pendenciasAbertasMoto = m.tasks.filter(t => t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA').length;

      return {
        id: m.id,
        brand: m.brand,
        model: m.model,
        version: m.version,
        plate: m.plate,
        year: `${m.yearMfg}/${m.yearModel}`,
        status: m.status,
        ownership: m.ownership,
        condition: m.condition,
        location: m.location,
        displacement: m.displacement,
        entryDate: m.entryDate,
        diasEmEstoque,
        publicPrice: m.publicPrice,
        fipeValue: m.fipeValue,
        totalCost: custoReal,
        margemBruta,
        margin: margemPercentual.toFixed(1),
        pendenciasAbertas: pendenciasAbertasMoto,
      };
    });

    const mediaDiasEstoque = motosComDias > 0 ? Math.round(somaDiasEstoque / motosComDias) : 0;
    const lucroPotencialEstoque = Math.max(0, valorPotencialVenda - capitalEstoque);
    const margemMediaProjetada = valorPotencialVenda > 0 ? ((lucroPotencialEstoque / valorPotencialVenda) * 100).toFixed(1) : '0';

    // Lucro realizado das vendas reais
    const lucroRealizadoTotal = sales.reduce((acc, s) => acc + s.grossProfit, 0);

    // Contas a pagar e receber
    const aReceber = financialEntries
      .filter(f => f.type === 'RECEITA' && f.status === 'PENDENTE')
      .reduce((acc, f) => acc + f.amount, 0);

    const aPagar = financialEntries
      .filter(f => f.type === 'DESPESA' && f.status === 'PENDENTE')
      .reduce((acc, f) => acc + f.amount, 0);

    const totalLeads = await prisma.lead.count();

    // Pendências
    const pendenciasAbertas = tasks.filter(t => t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA');
    const pendenciasUrgentes = pendenciasAbertas.filter(t => t.priority === 'URGENTE' || t.priority === 'ALTA');

    const payload = {
      kpis: {
        totalMotos,
        motosDisponiveis,
        motosEmPreparacao,
        motosReservadas,
        motosVendidas,
        capitalEstoque,
        valorPotencialVenda,
        lucroPotencialEstoque,
        margemMediaProjetada,
        mediaDiasEstoque,
        estoqueCriticoCount,
        lucroRealizadoEstimado: lucroRealizadoTotal,
        totalLeads,
        aReceber,
        aPagar,
        totalPendenciasAbertas: pendenciasAbertas.length,
        totalPendenciasUrgentes: pendenciasUrgentes.length,
      },
      motosRecentes: motosFormatadas,
      pendencias: tasks.slice(0, 10),
      leads,
      financeiro: financialEntries,
      vendasRecentes: sales,
    };

    // Perfis sem acesso financeiro não recebem custos, margens, lucro nem contas.
    if (!canViewFinancialCosts(auth.role)) {
      return NextResponse.json({
        ...payload,
        kpis: {
          ...payload.kpis,
          capitalEstoque: null,
          lucroPotencialEstoque: null,
          margemMediaProjetada: null,
          lucroRealizadoEstimado: null,
          aReceber: null,
          aPagar: null,
        },
        motosRecentes: payload.motosRecentes.map(
          ({ totalCost: _t, margemBruta: _m, margin: _p, ...rest }) => rest
        ),
        financeiro: [],
        vendasRecentes: payload.vendasRecentes.map(
          ({ costBasis: _c, grossProfit: _g, ...rest }) => rest
        ),
      });
    }
    return NextResponse.json(payload);
  } catch (error) {
    logError('Erro no dashboard API:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados' }, { status: 500 });
  }
}

export const GET = withRequest(GET_handler);

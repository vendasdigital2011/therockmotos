import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateListingDescription,
  summarizeLeadHistory,
  answerOperationalQuery,
  runAutomationsAndGenerateAlerts,
} from '@/lib/ai-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'alerts';

    if (action === 'run_automations') {
      const generated = await runAutomationsAndGenerateAlerts();
      const alerts = await prisma.systemAlert.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      return NextResponse.json({ success: true, alertsCreated: generated, alerts });
    }

    // Retorna alertas do sistema
    const alerts = await prisma.systemAlert.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = alerts.length;

    return NextResponse.json({ alerts, unreadCount });
  } catch (error: any) {
    console.error('Erro na API de IA:', error);
    return NextResponse.json({ error: 'Erro ao processar requisição de IA' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, motorcycleId, leadId, question, userRole = 'VENDEDOR' } = body;

    // 1. Gerador de Anúncio Comercial
    if (action === 'generate_listing') {
      if (!motorcycleId) {
        return NextResponse.json({ error: 'ID da moto obrigatório' }, { status: 400 });
      }

      const moto = await prisma.motorcycle.findUnique({
        where: { id: motorcycleId },
      });

      if (!moto) {
        return NextResponse.json({ error: 'Moto não encontrada' }, { status: 404 });
      }

      const listing = generateListingDescription(moto);
      return NextResponse.json({ success: true, listing });
    }

    // 2. Resumo Inteligente de Lead
    if (action === 'summarize_lead') {
      if (!leadId) {
        return NextResponse.json({ error: 'ID do lead obrigatório' }, { status: 400 });
      }

      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          motorcycle: true,
          interactions: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!lead) {
        return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
      }

      const summary = summarizeLeadHistory(lead);
      return NextResponse.json({ success: true, summary });
    }

    // 3. Chat Operacional / Perguntas
    if (action === 'chat') {
      if (!question) {
        return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 });
      }

      const answer = await answerOperationalQuery(question, userRole);
      return NextResponse.json({ success: true, answer });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro no processamento de IA:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar IA' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'ID do alerta obrigatório' }, { status: 400 });
    }

    const updated = await prisma.systemAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar alerta' }, { status: 500 });
  }
}

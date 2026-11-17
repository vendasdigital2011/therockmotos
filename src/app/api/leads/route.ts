import { NextResponse } from 'next/server';
import { requireUser, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit, extractClientIp } from '@/lib/audit';

export async function GET(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'VENDEDOR']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const source = searchParams.get('source');
    const assignedToId = searchParams.get('seller');

    const whereClause: any = {};
    if (stage && stage !== 'ALL') whereClause.stage = stage;
    if (source && source !== 'ALL') whereClause.source = source;
    if (assignedToId && assignedToId !== 'ALL') whereClause.assignedToId = assignedToId;

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        motorcycle: {
          select: {
            id: true,
            brand: true,
            model: true,
            plate: true,
            publicPrice: true,
            imageUrl: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { dueDate: 'asc' },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Métricas do Funil
    const allLeads = await prisma.lead.findMany({
      select: { stage: true, source: true, lossReason: true },
    });

    const metrics = {
      total: allLeads.length,
      novos: allLeads.filter((l) => l.stage === 'NOVO').length,
      emContato: allLeads.filter((l) => l.stage === 'CONTATO').length,
      visitaAgendada: allLeads.filter((l) => l.stage === 'VISITA_AGENDADA').length,
      proposta: allLeads.filter((l) => l.stage === 'PROPOSTA').length,
      ganhos: allLeads.filter((l) => l.stage === 'GANHO').length,
      perdidos: allLeads.filter((l) => l.stage === 'PERDIDO').length,
      origens: {
        vitrine: allLeads.filter((l) => l.source === 'VITRINE_SITE').length,
        whatsapp: allLeads.filter((l) => l.source === 'WHATSAPP').length,
        webmotors: allLeads.filter((l) => l.source === 'WEBMOTORS').length,
        olx: allLeads.filter((l) => l.source === 'OLX').length,
        presencial: allLeads.filter((l) => l.source === 'BALCAO_PRESENCIAL' || l.source === 'PRESENCIAL').length,
      },
    };

    return NextResponse.json({ leads, metrics });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json({ error: 'Erro ao buscar leads' }, { status: 500 });
  }
}

// Public endpoint: the website showroom form posts here without a login.
// Anonymous callers can only send contact fields; CRM fields (seller,
// source, budget, notes...) are accepted only from a logged-in team member.
const MAX_FIELD = 500;

export async function POST(request: Request) {
  try {
    const staff = await getCurrentUser();
    const body = await request.json();
    const { name, phone, email, message } = body ?? {};
    let { motorcycleId } = body ?? {};
    const crm = staff ? body : {};
    const {
      source = 'VITRINE_SITE',
      budget,
      assignedToId,
      nextAction,
      nextActionDate,
      notes,
    } = crm;

    if (typeof name !== 'string' || typeof phone !== 'string' || !name.trim() || !phone.trim()) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 });
    }
    if (
      name.length > 120 ||
      phone.length > 30 ||
      (email != null && (typeof email !== 'string' || email.length > 200)) ||
      (message != null && (typeof message !== 'string' || message.length > MAX_FIELD))
    ) {
      return NextResponse.json({ error: 'Dados do contato inválidos' }, { status: 400 });
    }

    // Anonymous leads may only reference a bike that is visible in the showroom.
    if (!staff && motorcycleId) {
      const visible = await prisma.motorcycle.findFirst({
        where: { id: String(motorcycleId), isPublic: true },
        select: { id: true },
      });
      if (!visible) motorcycleId = null;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Verificar duplicidade de lead nos últimos 30 dias (PRD 08)
    const existing = await prisma.lead.findFirst({
      where: {
        phone: { contains: cleanPhone.slice(-8) },
        stage: { notIn: ['GANHO', 'PERDIDO'] },
      },
    });

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        message: message || null,
        motorcycleId: motorcycleId || null,
        source,
        stage: 'NOVO',
        budget: budget ? Number(budget) : null,
        assignedToId: assignedToId || null,
        nextAction: nextAction || 'Realizar primeiro contato e qualificar interesse',
        nextActionDate: nextActionDate ? new Date(nextActionDate) : new Date(Date.now() + 1000 * 60 * 60 * 4),
        notes: notes || (existing ? `[Alerta] Lead com telefone semelhante registrado anteriormente.` : null),
        interactions: {
          create: [
            {
              type: source === 'VITRINE_SITE' ? 'WHATSAPP' : 'ANOTACOES',
              description: `Lead recebido via ${source}. Mensagem: "${message || 'Interesse registrado'}"`,
              authorName: 'Sistema',
            },
          ],
        },
      },
      include: {
        motorcycle: true,
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        interactions: true,
        activities: true,
      },
    });

    // Anonymous visitors get only the confirmation, never the bike record
    // (chassis, RENAVAM, plate) or internal data.
    if (!staff) {
      return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
    }
    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json({ error: error.message || 'Erro ao registrar lead' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'VENDEDOR']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      id,
      leadId,
      stage,
      lossReason,
      assignedToId,
      nextAction,
      nextActionDate,
      notes,
      interactionType,
      interactionDesc,
    } = body;
    const authorName = auth.name;

    const targetId = id || leadId;
    if (!targetId) {
      return NextResponse.json({ error: 'ID do lead é obrigatório' }, { status: 400 });
    }

    const currentLead = await prisma.lead.findUnique({ where: { id: targetId } });
    if (!currentLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    // Se houve mudança de estágio, criar registro de interação
    let interactionCreate: any = undefined;
    if (stage && stage !== currentLead.stage) {
      const reasonText = stage === 'PERDIDO' && lossReason ? ` (Motivo: ${lossReason})` : '';
      interactionCreate = {
        create: [
          {
            type: 'ANOTACOES',
            description: `Estágio alterado de ${currentLead.stage} para ${stage}${reasonText}`,
            authorName,
          },
        ],
      };
    } else if (interactionType && interactionDesc) {
      interactionCreate = {
        create: [
          {
            type: interactionType,
            description: interactionDesc,
            authorName,
          },
        ],
      };
    }

    const updated = await prisma.lead.update({
      where: { id: targetId },
      data: {
        stage: stage || undefined,
        lossReason: lossReason !== undefined ? lossReason : undefined,
        assignedToId: assignedToId !== undefined ? assignedToId : undefined,
        nextAction: nextAction !== undefined ? nextAction : undefined,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
        notes: notes !== undefined ? notes : undefined,
        interactions: interactionCreate,
      },
      include: {
        motorcycle: true,
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        activities: true,
      },
    });

    if (stage && stage !== currentLead.stage) {
      await logAudit({
        userId: auth.id,
        action: stage === 'PERDIDO' ? 'LEAD_LOSS' : 'LEAD_STAGE',
        entity: 'Lead',
        entityId: targetId,
        details: `Lead "${currentLead.name}" movido de ${currentLead.stage} para ${stage}${stage === 'PERDIDO' && lossReason ? ` (Motivo: "${lossReason}")` : ''} por ${authorName}.`,
        ipAddress: extractClientIp(request),
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar lead' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncListingToPortal } from '@/lib/portal-adapters';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';
import { withRequest } from '@/lib/request-context';

async function GET_handler(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const providers = await prisma.integrationProvider.findMany({
      include: {
        listings: {
          include: {
            motorcycle: {
              select: {
                id: true,
                brand: true,
                model: true,
                plate: true,
                yearModel: true,
                publicPrice: true,
                status: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const recentLogs = await prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        provider: { select: { name: true, code: true } },
      },
    });

    const externalLeads = await prisma.externalLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        provider: { select: { name: true, code: true } },
      },
    });

    const totalActiveListings = await prisma.portalListing.count({
      where: { status: 'PUBLISHED' },
    });

    const totalErrors = await prisma.portalListing.count({
      where: { status: 'ERROR' },
    });

    return NextResponse.json({
      // Never send integration secrets to the browser.
      providers: providers.map(({ apiKey, apiSecret, webhookSecret, ...p }) => ({
        ...p,
        hasApiKey: Boolean(apiKey),
        hasApiSecret: Boolean(apiSecret),
        hasWebhookSecret: Boolean(webhookSecret),
      })),
      recentLogs,
      externalLeads,
      metrics: {
        totalActiveListings,
        totalErrors,
        totalProviders: providers.length,
      },
    });
  } catch (error: any) {
    logError('Erro na API de Portais:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao carregar portais') }, { status: 500 });
  }
}

async function POST_handler(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { action, providerCode, motorcycleId, listingAction, payload } = body;

    const userName = auth.name;

    // 1. Sincronização manual ou disparo (PUBLISH, UPDATE, PAUSE, REMOVE)
    if (action === 'sync') {
      if (!providerCode || !motorcycleId || !listingAction) {
        return NextResponse.json({ error: 'Parâmetros insuficientes para sincronização' }, { status: 400 });
      }

      const result = await syncListingToPortal(providerCode, motorcycleId, listingAction, userName);
      return NextResponse.json(result);
    }

    // 2. Webhook simulado ou real de recebimento de Lead
    // 3. Ativar / Desativar canal de integração
    if (action === 'toggle_provider') {
      const { providerId, isActive } = body;
      const updated = await prisma.integrationProvider.update({
        where: { id: providerId },
        data: { isActive },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    logError('Erro ao processar ação de portais:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro no portal') }, { status: 500 });
  }
}

export const GET = withRequest(GET_handler);
export const POST = withRequest(POST_handler);

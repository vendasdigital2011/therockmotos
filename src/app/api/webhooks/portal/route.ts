import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ingestExternalLeadFromWebhook } from '@/lib/portal-adapters';
import { verifyWebhookSignature } from '@/lib/webhook-signature';
import { logAudit, extractClientIp } from '@/lib/audit';

// Webhook público de portais (OLX, Webmotors, iCarros...). Sem login: a
// autenticidade vem da assinatura HMAC com o webhookSecret de cada provedor,
// cadastrado no painel de integrações. Provedor sem segredo fica desativado.
export async function POST(request: Request) {
  const rawBody = await request.text();

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const providerCode = typeof body?.providerCode === 'string' ? body.providerCode : '';
  if (!providerCode || !body?.payload) {
    return NextResponse.json({ error: 'Provedor e payload obrigatórios.' }, { status: 400 });
  }

  const provider = await prisma.integrationProvider.findUnique({ where: { code: providerCode } });
  if (!provider || !provider.webhookSecret || provider.webhookSecret.length < 32) {
    return NextResponse.json({ error: 'Webhook do provedor não configurado.' }, { status: 403 });
  }

  const check = verifyWebhookSignature(rawBody, request.headers.get('x-motoflow-signature'), provider.webhookSecret);
  if (!check.ok) {
    await logAudit({
      userId: null,
      action: 'WEBHOOK_REJECTED',
      entity: 'PortalWebhook',
      entityId: providerCode,
      details: `Webhook do portal ${providerCode} rejeitado: ${check.reason}.`,
      ipAddress: extractClientIp(request),
    });
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  try {
    const result = await ingestExternalLeadFromWebhook(providerCode, body.payload);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar webhook.' }, { status: 422 });
  }
}

import { NextResponse } from 'next/server';
import { processBankWebhook } from '@/lib/fiscal-bank-renave';
import { verifyWebhookSignature } from '@/lib/webhook-signature';
import { logAudit, extractClientIp } from '@/lib/audit';
import { publicMessage } from '@/lib/errors';
import { withRequest } from '@/lib/request-context';

// Webhook público do provedor bancário (baixa automática de cobrança PIX/boleto).
// Não exige login: a autenticidade vem da assinatura HMAC com BANK_WEBHOOK_SECRET.
// Sem o segredo configurado, o endpoint fica desativado.
async function POST_handler(request: Request) {
  const secret = process.env.BANK_WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: 'Webhook bancário não configurado.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const check = verifyWebhookSignature(rawBody, request.headers.get('x-motoflow-signature'), secret);
  if (!check.ok) {
    await logAudit({
      userId: null,
      action: 'WEBHOOK_REJECTED',
      entity: 'BankWebhook',
      entityId: 'bank',
      details: `Webhook bancário rejeitado: ${check.reason}.`,
      ipAddress: extractClientIp(request),
    });
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  if (!body?.txid || typeof body.txid !== 'string') {
    return NextResponse.json({ error: 'txid obrigatório.' }, { status: 400 });
  }

  try {
    // processBankWebhook é idempotente: repetir o mesmo txid retorna ALREADY_PAID.
    const result = await processBankWebhook({
      txid: body.txid,
      endToEndId: body.endToEndId,
      valorPago: body.valorPago !== undefined ? Number(body.valorPago) : undefined,
      dataPagamento: body.dataPagamento,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: publicMessage(error, 'Erro ao processar webhook.') }, { status: 422 });
  }
}

export const POST = withRequest(POST_handler);

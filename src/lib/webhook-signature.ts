import crypto from 'node:crypto';

// Assinatura de webhook: header `X-Motoflow-Signature: t=<unix>,v1=<hex>`,
// onde v1 = HMAC-SHA256(secret, `${t}.${corpoBruto}`).
// O timestamp precisa estar dentro da janela (anti-replay). Comparação em tempo constante.
export const WEBHOOK_TOLERANCE_SEC = 300;

export type SignatureResult = { ok: true } | { ok: false; reason: string };

export function verifyWebhookSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSec: number = Math.floor(Date.now() / 1000)
): SignatureResult {
  if (!header) return { ok: false, reason: 'assinatura ausente' };

  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    })
  );
  const t = Number(parts.t);
  const v1 = parts.v1 ?? '';
  if (!Number.isFinite(t) || !v1) return { ok: false, reason: 'cabeçalho mal formado' };

  if (Math.abs(nowSec - t) > WEBHOOK_TOLERANCE_SEC) {
    return { ok: false, reason: 'timestamp fora da janela' };
  }

  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  const received = Buffer.from(v1, 'hex');
  if (received.length !== expected.length) return { ok: false, reason: 'assinatura inválida' };
  if (!crypto.timingSafeEqual(received, expected)) return { ok: false, reason: 'assinatura inválida' };
  return { ok: true };
}

// Usado pelo remetente (e pelos testes) para gerar o header.
export function signWebhookBody(rawBody: string, secret: string, nowSec: number = Math.floor(Date.now() / 1000)): string {
  const v1 = crypto.createHmac('sha256', secret).update(`${nowSec}.${rawBody}`).digest('hex');
  return `t=${nowSec},v1=${v1}`;
}

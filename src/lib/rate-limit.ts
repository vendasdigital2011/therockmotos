// Limitador simples por chave, em memória.
// Limitação: na Vercel cada instância serverless tem seu próprio contador, então
// o limite é aproximado. Para bloqueio exato, usar armazenamento compartilhado
// (ex.: Redis/Upstash ou tabela no banco).
import type { NextRequest } from 'next/server';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
}

// Conta uma tentativa e informa se passou do limite.
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

// Só consulta, sem contar. Usado para decidir antes de agir.
export function isRateLimited(key: string, limit: number): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) return { limited: false, retryAfterSec: 0 };
  if (current.count >= limit) {
    return { limited: true, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfterSec: 0 };
}

// Registra uma falha (sem decidir nada).
export function recordHit(key: string, windowMs: number): void {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    current.count += 1;
  }
}

export function clearRate(key: string): void {
  buckets.delete(key);
}

// IP do cliente para limites. O primeiro valor de X-Forwarded-For é controlado
// pelo cliente; o último é anexado pela borda da Vercel. Usar sempre o último.
export function trustedClientIp(request: Request | NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Reserva uma tentativa de forma síncrona (checa e conta no mesmo passo, sem await
// no meio), então requisições simultâneas não passam juntas do limite.
export function reserve(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  return rateLimit(key, limit, windowMs);
}

// Desfaz uma reserva (ex.: login correto não deve contar como falha).
export function release(key: string): void {
  const current = buckets.get(key);
  if (current && current.count > 0) current.count -= 1;
}

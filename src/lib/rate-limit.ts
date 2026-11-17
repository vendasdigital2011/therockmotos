// Limitador simples por chave (ex.: IP), em memória.
// Limitação: na Vercel cada instância serverless tem seu próprio contador, então
// o limite é aproximado. Para bloqueio exato, usar um armazenamento compartilhado
// (ex.: Redis/Upstash ou tabela no banco).
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  // Limpeza oportunista para não crescer sem fim.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
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

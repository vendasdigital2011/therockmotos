// Logger central da aplicação (Pino, JSON em stdout/stderr).
// Único ponto de log do servidor: não criar outras instâncias de logger.
//
// Toda linha passa por sanitizeForLog ANTES de sair (formatters.log), então
// segredos e dados pessoais não dependem da disciplina de quem chama.
import pino from 'pino';
import { sanitizeForLog, summarizeErrorMessage } from './log-sanitize';
import { getRequestId } from './request-context';

const isProd = process.env.NODE_ENV === 'production';

const base = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: {
    service: 'motoflow',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // requestId entra em toda linha da requisição em andamento.
  mixin: () => {
    const requestId = getRequestId();
    return requestId ? { requestId } : {};
  },
  formatters: {
    level: (label) => ({ level: label }),
    log: (obj) => sanitizeForLog(obj) as Record<string, unknown>,
  },
});

export const logger = base;

// Erro: uma linha por falha, com contexto. Não logar o mesmo erro em várias camadas:
// quem trata a falha é quem registra.
export function logError(message: string, error?: unknown, context: Record<string, unknown> = {}): void {
  base.error({ ...context, error: toLogError(error) }, message);
}

// Converte o erro em objeto simples já sanitizado. Assim o serializador padrão do Pino
// não vê o Error original (e não inclui a pilha em produção).
function toLogError(error: unknown): unknown {
  // Duck typing: erros de outros contextos (ex.: Prisma) podem não passar em instanceof.
  const looksLikeError =
    error instanceof Error ||
    (typeof error === 'object' && error !== null && typeof (error as any).message === 'string' && typeof (error as any).name === 'string');
  if (looksLikeError) {
    const e = error as { name: string; message: string; stack?: string };
    const sanitized = sanitizeForLog({ name: e.name, message: e.message, code: (error as any).code }) as Record<string, unknown>;
    sanitized.message = sanitizeForLog(summarizeErrorMessage(e.message, e.name));
    if (!isProd && typeof e.stack === 'string' && e.stack.length > 0) {
      sanitized.stack = sanitizeForLog(e.stack);
    }
    if (sanitized.code === undefined) delete sanitized.code;
    return sanitized;
  }
  return sanitizeForLog(error);
}

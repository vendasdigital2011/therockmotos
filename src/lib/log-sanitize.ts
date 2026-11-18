// Sanitização de dados ANTES de qualquer log.
// Sem dependências, para ser testável isoladamente.
//
// - Chaves de segredo: valor vira [REDACTED], em qualquer caixa e em qualquer nível.
// - Dados pessoais: mascarados (mantém só o necessário para operação).
// - Strings: removem Bearer, chaves de serviço e credenciais em URLs de banco.
// - Limites: profundidade, tamanho de string e de array; referências circulares.

export const REDACTED = '[REDACTED]';

// Por substring: pega SESSION_SECRET, webhookSecret, apiKey etc. Não usa "session" solto,
// porque sessionId é campo permitido nos logs.
const SECRET_KEY = /(secret|password|passwd|senha|token|cookie|authorization|apikey|api_key|otp|recoverycode|cvv|privatekey|connectionstring|databaseurl|directurl|sessiontoken)/i;

type MaskFn = (value: string) => string;

const maskDigitsTail = (keep: number): MaskFn => (v) => {
  const d = v.replace(/\D/g, '');
  if (d.length <= keep) return '•'.repeat(4);
  return '•'.repeat(Math.max(d.length - keep, 4)) + d.slice(-keep);
};

const maskEmail: MaskFn = (v) => {
  const at = v.indexOf('@');
  if (at <= 0) return '[REDACTED]';
  return v[0] + '•••' + v.slice(at);
};

// Chaves de dado pessoal -> máscara.
const PII_KEYS: Array<[RegExp, MaskFn]> = [
  [/^(document|cpf|cnpj|documento|cpfcnpj)$/i, maskDigitsTail(2)],
  [/^(phone|telefone|celular|whatsapp)$/i, maskDigitsTail(2)],
  [/^(email|e-mail)$/i, maskEmail],
  [/^(address|endereco|endereço|birthdate|datanascimento|dataNascimento|bankaccount|conta|agencia|agência|chassis|renavam)$/i, () => REDACTED],
];

const STRING_RULES: Array<[RegExp, string]> = [
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]'],
  [/sb_(secret|publishable)_[A-Za-z0-9_-]+/g, 'sb_[REDACTED]'],
  [/(postgres(?:ql)?:\/\/)[^@\s/]+@/gi, '$1[REDACTED]@'],
  [/scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+/g, '[REDACTED_HASH]'],
];

const MAX_DEPTH = 6;
const MAX_STRING = 2000;
const MAX_ARRAY = 50;

export function sanitizeString(value: string): string {
  let out = value;
  for (const [re, rep] of STRING_RULES) out = out.replace(re, rep);
  // Quebras de linha no conteúdo são neutralizadas (evita log injection em texto).
  out = out.replace(/\r?\n/g, '\\n');
  if (out.length > MAX_STRING) out = out.slice(0, MAX_STRING) + '…[truncado]';
  return out;
}

export function sanitizeForLog(input: unknown): unknown {
  return walk(input, 0, new WeakSet());
}

function walk(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitizeString(value);
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return typeof value === 'bigint' ? value.toString() : value;
  }
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (depth >= MAX_DEPTH) return '[profundidade excedida]';

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
      ...(typeof (value as any).code === 'string' ? { code: (value as any).code } : {}),
    };
  }
  if (value instanceof Date) return value.toISOString();

  const obj = value as object;
  if (seen.has(obj)) return '[circular]';
  seen.add(obj);

  if (Array.isArray(obj)) {
    const items = obj.slice(0, MAX_ARRAY).map((v) => walk(v, depth + 1, seen));
    if (obj.length > MAX_ARRAY) items.push(`[+${obj.length - MAX_ARRAY} itens]`);
    return items;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SECRET_KEY.test(k)) {
      out[k] = REDACTED;
      continue;
    }
    const pii = PII_KEYS.find(([re]) => re.test(k));
    if (pii && typeof v === 'string') {
      out[k] = pii[1](v);
      continue;
    }
    out[k] = walk(v, depth + 1, seen);
  }
  return out;
}

// Erros do Prisma trazem a consulta inteira com os valores enviados (payload).
// No log fica só a primeira linha (ex.: "Invalid `prisma.motorcycle.create()` invocation:").
export function summarizeErrorMessage(message: string, name?: string): string {
  const isPrisma = (name ?? '').startsWith('PrismaClient') || /invocation/i.test(message);
  if (!isPrisma) return message;
  const firstLine = message.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? 'Erro de banco de dados';
  return firstLine;
}

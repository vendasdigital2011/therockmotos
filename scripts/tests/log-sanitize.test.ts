// Testes da sanitização de logs. Rodar: node --test scripts/tests/log-sanitize.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForLog, sanitizeString, summarizeErrorMessage, REDACTED } from '../../src/lib/log-sanitize.ts';

const dump = (v: unknown) => JSON.stringify(sanitizeForLog(v));

test('senhas, tokens e cookies nunca aparecem, em qualquer caixa', () => {
  const out = sanitizeForLog({ password: 'x1', Password: 'x2', passwordHash: 'scrypt$1$1$1$AAAA$BBBB', token: 't', Authorization: 'Bearer abc', cookie: 'c', 'set-cookie': 's', apiKey: 'k', SESSION_SECRET: 'z' }) as any;
  for (const k of Object.keys(out)) assert.equal(out[k], REDACTED, `chave ${k}`);
});

test('segredos aninhados em objetos e arrays são redigidos', () => {
  const s = dump({ a: { b: [{ c: { password: 'deep' } }], webhookSecret: 'w' } });
  assert.ok(!s.includes('deep'));
  assert.ok(!s.includes('"w"'));
});

test('CPF e CNPJ ficam mascarados, mantendo só os 2 últimos dígitos', () => {
  const out = sanitizeForLog({ document: '52998224725' }) as any;
  assert.equal(out.document, '•••••••••25');
});

test('telefone e e-mail são mascarados', () => {
  const out = sanitizeForLog({ phone: '48999991001', email: 'pessoa@exemplo.invalid' }) as any;
  assert.equal(out.phone, '•'.repeat(9) + '01');
  assert.equal(out.email, 'p•••@exemplo.invalid');
});

test('endereço, chassi e RENAVAM são redigidos', () => {
  const out = sanitizeForLog({ address: 'Rua X, 10', chassis: '9BW123', renavam: '123' }) as any;
  assert.equal(out.address, REDACTED);
  assert.equal(out.chassis, REDACTED);
  assert.equal(out.renavam, REDACTED);
});

test('Bearer, chave de serviço e credencial de banco em strings são removidos', () => {
  assert.equal(sanitizeString('Authorization: Bearer abc.def-123'), 'Authorization: Bearer [REDACTED]');
  assert.ok(!sanitizeString('chave sb_secret_ABC123xyz').includes('ABC123'));
  assert.equal(sanitizeString('postgresql://postgres:senha@host:5432/db'), 'postgresql://[REDACTED]@host:5432/db');
});

test('quebra de linha é neutralizada (log injection)', () => {
  assert.equal(sanitizeString('linha1\nlinha2\r\nlinha3'), 'linha1\\nlinha2\\nlinha3');
});

test('erro é serializado sem stack e com mensagem sanitizada', () => {
  const err: any = new Error('falha com postgresql://u:segredo@h/db');
  err.code = 'P2002';
  const out = sanitizeForLog({ err }) as any;
  assert.equal(out.err.name, 'Error');
  assert.equal(out.err.code, 'P2002');
  assert.ok(!('stack' in out.err));
  assert.ok(!out.err.message.includes('segredo'));
});

test('strings longas são truncadas', () => {
  const s = sanitizeString('a'.repeat(5000));
  assert.ok(s.length < 2100);
  assert.ok(s.endsWith('[truncado]'));
});

test('arrays longos são limitados', () => {
  const out = sanitizeForLog(Array.from({ length: 80 }, (_, i) => i)) as any[];
  assert.equal(out.length, 51);
  assert.match(String(out[50]), /\+30 itens/);
});

test('referência circular não quebra e profundidade é limitada', () => {
  const a: any = { nome: 'x' };
  a.self = a;
  assert.equal((sanitizeForLog(a) as any).self, '[circular]');

  let deep: any = { v: 'fim' };
  for (let i = 0; i < 12; i++) deep = { n: deep };
  assert.ok(dump(deep).includes('[profundidade excedida]'));
});

test('saída é JSON válido mesmo com entradas estranhas', () => {
  const out = dump({ f: () => 1, big: 10n, d: new Date(0), u: undefined, n: null });
  assert.doesNotThrow(() => JSON.parse(out));
});

test('erro do Prisma: log guarda só a primeira linha, sem o payload', () => {
  const msg = "\nInvalid `prisma.motorcycle.create()` invocation:\n\n{\n  data: { plate: 'ZE49072', brand: 'Honda' }\n}";
  const out = summarizeErrorMessage(msg, 'PrismaClientValidationError');
  assert.equal(out, 'Invalid `prisma.motorcycle.create()` invocation:');
  assert.ok(!out.includes('ZE49072'));
});

test('mensagem comum não é alterada', () => {
  assert.equal(summarizeErrorMessage('Moto não encontrada', 'AppError'), 'Moto não encontrada');
});

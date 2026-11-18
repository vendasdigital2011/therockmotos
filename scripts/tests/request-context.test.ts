// Testes do requestId. Rodar: node --test scripts/tests/request-context.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRequestId, withRequest, getRequestId, REQUEST_ID_HEADER } from '../../src/lib/request-context.ts';

test('identificador válido enviado pelo cliente é mantido', () => {
  assert.equal(resolveRequestId('req_abc12345'), 'req_abc12345');
});

test('identificador inválido é substituído (log injection, tamanho, caracteres)', () => {
  for (const bad of ['', 'curto', 'x'.repeat(65), 'com espaco aqui', 'linha\nquebra', 'a;b=c_d-e']) {
    const id = resolveRequestId(bad);
    assert.match(id, /^req_[0-9a-f]{32}$/, `entrada: ${JSON.stringify(bad)}`);
  }
});

test('sem cabeçalho, gera um id novo a cada chamada', () => {
  const a = resolveRequestId(null);
  const b = resolveRequestId(undefined);
  assert.notEqual(a, b);
});

test('handler envelopado recebe o requestId e o devolve no cabeçalho', async () => {
  let inside: string | undefined;
  const handler = withRequest(async () => {
    inside = getRequestId();
    return Response.json({ ok: true });
  });
  const res = await handler(new Request('http://x/api/teste', { headers: { [REQUEST_ID_HEADER]: 'req_fixo123456' } }));
  assert.equal(inside, 'req_fixo123456');
  assert.equal(res.headers.get(REQUEST_ID_HEADER), 'req_fixo123456');
  assert.deepEqual(await res.json(), { ok: true });
});

test('erro 5xx em JSON inclui requestId no corpo', async () => {
  const handler = withRequest(async () => Response.json({ error: 'Erro ao cadastrar moto' }, { status: 500 }));
  const res = await handler(new Request('http://x/api/teste', { headers: { [REQUEST_ID_HEADER]: 'req_erro123456' } }));
  const body = await res.json();
  assert.equal(body.error, 'Erro ao cadastrar moto');
  assert.equal(body.requestId, 'req_erro123456');
  assert.equal(res.status, 500);
});

test('erro 4xx não é reescrito (mantém corpo original)', async () => {
  const handler = withRequest(async () => Response.json({ error: 'Não autenticado' }, { status: 401 }));
  const res = await handler(new Request('http://x/api/teste'));
  assert.deepEqual(await res.json(), { error: 'Não autenticado' });
  assert.match(res.headers.get(REQUEST_ID_HEADER) || '', /^req_/);
});

test('fora de uma requisição, não há requestId', () => {
  assert.equal(getRequestId(), undefined);
});

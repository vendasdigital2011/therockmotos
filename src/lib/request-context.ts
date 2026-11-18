// Contexto da requisição: requestId criado no início e disponível para todos os logs
// da mesma requisição (via AsyncLocalStorage), sem passar o id por parâmetro.
import { AsyncLocalStorage } from 'node:async_hooks';

export const REQUEST_ID_HEADER = 'x-request-id';

// Aceita só identificadores curtos e seguros. Valor vindo do cliente é usado
// apenas se passar aqui (evita log injection e cabeçalho gigante).
const VALID_ID = /^[A-Za-z0-9_-]{8,64}$/;

export function resolveRequestId(incoming: string | null | undefined): string {
  if (incoming && VALID_ID.test(incoming)) return incoming;
  return 'req_' + crypto.randomUUID().replace(/-/g, '');
}

type Store = { requestId: string };
const storage = new AsyncLocalStorage<Store>();

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

// Envolve um handler de rota: define o requestId, devolve o cabeçalho X-Request-Id e
// inclui requestId no corpo de respostas JSON de erro 5xx (para suporte).
export function withRequest<A extends unknown[]>(
  handler: (request: Request, ...rest: A) => Promise<Response>
) {
  return async (request: Request, ...rest: A): Promise<Response> => {
    const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
    return runWithRequestId(requestId, async () => {
      const response = await handler(request, ...rest);
      return decorate(response, requestId);
    });
  };
}

// Cabeçalho é definido na própria resposta (preserva cookies que o Next aplica depois).
// Só em erro 5xx JSON o corpo é reescrito, para incluir o requestId.
async function decorate(response: Response, requestId: string): Promise<Response> {
  const type = response.headers.get('content-type') || '';
  if (response.status >= 500 && type.includes('application/json')) {
    try {
      const body = await response.clone().json();
      if (body && typeof body === 'object') {
        const headers = new Headers(response.headers);
        headers.set(REQUEST_ID_HEADER, requestId);
        return new Response(JSON.stringify({ ...body, requestId }), { status: response.status, headers });
      }
    } catch {
      // corpo inválido: segue só com o cabeçalho
    }
  }
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

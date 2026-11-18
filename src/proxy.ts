import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';
import { REQUEST_ID_HEADER, resolveRequestId } from './lib/request-context';

// First line of defense: pages under /admin need a validly signed session
// cookie, otherwise the browser is sent to /login. The API routes still check
// the session (and the user's role and active flag) on every request, so this
// is a convenience redirect, not the only check.
//
// Também cria o requestId de cada chamada de API (ou aceita o enviado pelo cliente,
// se for válido) e o repassa à rota e à resposta.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
    const headers = new Headers(request.headers);
    headers.set(REQUEST_ID_HEADER, requestId);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};

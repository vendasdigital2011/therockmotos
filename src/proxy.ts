import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

// First line of defense: pages under /admin need a validly signed session
// cookie, otherwise the browser is sent to /login. The API routes still check
// the session (and the user's role and active flag) on every request, so this
// is a convenience redirect, not the only check.
export function proxy(request: NextRequest) {
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
  matcher: ['/admin/:path*'],
};

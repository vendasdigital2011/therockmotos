import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';
import { withRequest } from '@/lib/request-context';

// Logout revoga a sessão no servidor: incrementa sessionVersion, o que invalida
// todos os cookies antigos desse usuário, inclusive cópias feitas antes.
async function POST_handler() {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (payload) {
    await prisma.user
      .update({ where: { id: payload.uid }, data: { sessionVersion: { increment: 1 } } })
      .catch(() => null); // usuário já removido: apenas limpa o cookie
  }
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}

export const POST = withRequest(POST_handler);

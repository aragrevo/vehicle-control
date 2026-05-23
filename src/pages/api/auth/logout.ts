import type { APIRoute } from 'astro';
import { lucia } from '@/lib/auth';

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  const session = locals.session;

  if (session) {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  return redirect('/login');
};

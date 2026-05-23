import type { APIRoute } from 'astro';
import { logoutUser } from '@/lib/auth-service';

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  if (locals.session) {
    const sessionCookie = await logoutUser(locals.session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  return redirect('/login');
};

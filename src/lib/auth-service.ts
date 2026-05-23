import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { lucia } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';
import { hash, verify } from '@node-rs/argon2';

export async function loginUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return { error: 'Credenciales inválidas' };

  const valid = await verify(user.passwordHash, password);
  if (!valid) return { error: 'Credenciales inválidas' };

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  return { session, sessionCookie, user };
}

export async function registerUser(email: string, password: string, name: string) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return { error: 'El email ya está registrado' };

  const passwordHash = await hash(password);
  const id = createId();

  await db.insert(users).values({ id, email, passwordHash, name });

  const session = await lucia.createSession(id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  return { session, sessionCookie, user: { id, email, name } };
}

export async function logoutUser(sessionId: string) {
  await lucia.invalidateSession(sessionId);
  return lucia.createBlankSessionCookie();
}

export async function requireAuth(locals: App.Locals) {
  if (!locals.user) return null;
  return locals.user;
}

export async function requireAuthRedirect(locals: App.Locals) {
  if (!locals.user) throw new Response(null, { status: 302, headers: { Location: '/login' } });
  return locals.user;
}

export async function requireAuthAPI(locals: App.Locals) {
  if (!locals.user) {
    return { error: new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 }) };
  }
  return { user: locals.user };
}

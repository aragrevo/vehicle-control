import type { APIRoute } from 'astro';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response('Bad request', { status: 400 });
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, id), eq(vehicles.userId, locals.user.id)))
    .limit(1);

  if (!vehicle) {
    return new Response('Not found', { status: 404 });
  }

  const newStatus = vehicle.status === 'active' ? 'inactive' : 'active';

  await db
    .update(vehicles)
    .set({ status: newStatus })
    .where(eq(vehicles.id, id));

  return redirect(`/vehicles/${id}`);
};

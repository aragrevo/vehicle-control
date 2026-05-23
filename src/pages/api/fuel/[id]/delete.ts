import type { APIRoute } from 'astro';
import { db } from '@/db/client';
import { fuelLogs, vehicles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = params;
  const formData = await request.formData();
  const vehicleId = formData.get('vehicleId')?.toString();

  if (!id || !vehicleId) {
    return new Response('Bad request', { status: 400 });
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, locals.user.id)))
    .limit(1);

  if (!vehicle) {
    return new Response('Not found', { status: 404 });
  }

  await db.delete(fuelLogs).where(eq(fuelLogs.id, id));

  return redirect(`/fuel?vehicle=${vehicleId}`);
};

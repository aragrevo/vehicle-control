import type { APIRoute } from 'astro';
import { toggleVehicleStatus } from '@/lib/vehicle-service';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response('Bad request', { status: 400 });
  }

  const newStatus = await toggleVehicleStatus(id, locals.user.id);
  if (!newStatus) {
    return new Response('Not found', { status: 404 });
  }

  return redirect(`/vehicles/${id}`);
};

import type { APIRoute } from 'astro';
import { deleteMaintenance } from '@/lib/maintenance-service';

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

  const deleted = await deleteMaintenance(id, vehicleId, locals.user.id);
  if (!deleted) {
    return new Response('Not found', { status: 404 });
  }

  return redirect(`/maintenance/${vehicleId}`);
};

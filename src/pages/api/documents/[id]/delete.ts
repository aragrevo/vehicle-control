import type { APIRoute } from 'astro';
import { deleteDocument } from '@/lib/document-service';

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response('Bad request', { status: 400 });
  }

  const formData = await request.formData();
  const vehicleId = formData.get('vehicleId')?.toString();

  const deleted = await deleteDocument(id, locals.user.id);
  if (!deleted) {
    return new Response('Not found', { status: 404 });
  }

  return redirect(vehicleId ? `/documents?vehicle=${vehicleId}` : '/documents');
};

import type { APIRoute } from 'astro';
import { addVehiclePhoto, removeVehiclePhoto } from '@/lib/vehicle-service';

export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'No se proporcionaron fotos' }), { status: 400 });
    }

    let photos: string[] = [];
    for (const file of files) {
      try {
        photos = await addVehiclePhoto(id, locals.user.id, file);
      } catch {
        continue;
      }
    }

    return new Response(JSON.stringify({ success: true, photos }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Error al procesar fotos' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const { index } = await request.json();
    const photos = await removeVehiclePhoto(id, locals.user.id, index);
    return new Response(JSON.stringify({ success: true, photos }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Error al eliminar foto' }), { status: 500 });
  }
};

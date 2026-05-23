import type { APIRoute } from 'astro';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, id), eq(vehicles.userId, locals.user.id)))
    .limit(1);

  if (!vehicle) {
    return new Response(JSON.stringify({ error: 'Vehículo no encontrado' }), { status: 404 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];
    
    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'No se proporcionaron fotos' }), { status: 400 });
    }

    const existingPhotos: string[] = vehicle.photos ? JSON.parse(vehicle.photos) : [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }
      
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      existingPhotos.push(dataUrl);
    }

    await db
      .update(vehicles)
      .set({ photos: JSON.stringify(existingPhotos) })
      .where(eq(vehicles.id, id));

    return new Response(JSON.stringify({ success: true, photos: existingPhotos }), { status: 200 });
  } catch (error) {
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

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, id), eq(vehicles.userId, locals.user.id)))
    .limit(1);

  if (!vehicle) {
    return new Response(JSON.stringify({ error: 'Vehículo no encontrado' }), { status: 404 });
  }

  try {
    const { index } = await request.json();
    const photos: string[] = vehicle.photos ? JSON.parse(vehicle.photos) : [];
    
    if (index >= 0 && index < photos.length) {
      photos.splice(index, 1);
      await db
        .update(vehicles)
        .set({ photos: JSON.stringify(photos) })
        .where(eq(vehicles.id, id));
    }

    return new Response(JSON.stringify({ success: true, photos }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al eliminar foto' }), { status: 500 });
  }
};

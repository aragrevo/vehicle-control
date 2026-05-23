import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const FUEL_TYPE_LABELS: Record<string, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  electric: 'Eléctrico',
  hybrid: 'Híbrido',
  lpg: 'GLP',
  cng: 'GNC',
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  oil_change: 'Cambio de aceite',
  tires: 'Neumáticos',
  brakes: 'Frenos',
  revision: 'Revisión',
  other: 'Otro',
};

export const VEHICLE_FUEL_ICONS: Record<string, string> = {
  gasoline: 'local_gas_station',
  diesel: 'local_gas_station',
  electric: 'ev_station',
  hybrid: 'hybrid_car',
  lpg: 'local_gas_station',
  cng: 'local_gas_station',
};

export async function getUserVehicles(userId: string) {
  return db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId))
    .orderBy(desc(vehicles.createdAt));
}

export async function getVehicleById(vehicleId: string, userId: string) {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .limit(1);
  return vehicle ?? null;
}

export async function createVehicle(userId: string, data: {
  plate: string;
  vin?: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  fuelType?: string;
  km?: number;
  photos?: string[];
  nextItvDate?: number;
  insuranceExpiry?: number;
  oilChangeReminder?: boolean;
  nextRevisionKm?: number;
  revisionIntervalKm?: number;
}) {
  const id = createId();
  await db.insert(vehicles).values({
    id,
    userId,
    plate: data.plate,
    vin: data.vin ?? null,
    brand: data.brand,
    model: data.model,
    year: data.year ?? null,
    color: data.color ?? null,
    fuelType: data.fuelType ?? null,
    km: data.km ?? 0,
    status: 'active',
    photos: data.photos ? JSON.stringify(data.photos) : null,
    nextItvDate: data.nextItvDate ?? null,
    insuranceExpiry: data.insuranceExpiry ?? null,
    oilChangeReminder: data.oilChangeReminder ?? true,
    nextRevisionKm: data.nextRevisionKm ?? 15000,
    revisionIntervalKm: data.revisionIntervalKm ?? 15000,
    createdAt: Date.now(),
  });
  return id;
}

export async function updateVehicle(vehicleId: string, userId: string, data: Partial<{
  plate: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: string;
  km: number;
  photos: string[];
  nextItvDate: number;
  insuranceExpiry: number;
  oilChangeReminder: boolean;
  nextRevisionKm: number;
  revisionIntervalKm: number;
  status: string;
}>) {
  const updateData: Record<string, unknown> = {};
  if (data.plate !== undefined) updateData.plate = data.plate;
  if (data.vin !== undefined) updateData.vin = data.vin;
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.model !== undefined) updateData.model = data.model;
  if (data.year !== undefined) updateData.year = data.year;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.fuelType !== undefined) updateData.fuelType = data.fuelType;
  if (data.km !== undefined) updateData.km = data.km;
  if (data.photos !== undefined) updateData.photos = JSON.stringify(data.photos);
  if (data.nextItvDate !== undefined) updateData.nextItvDate = data.nextItvDate;
  if (data.insuranceExpiry !== undefined) updateData.insuranceExpiry = data.insuranceExpiry;
  if (data.oilChangeReminder !== undefined) updateData.oilChangeReminder = data.oilChangeReminder;
  if (data.nextRevisionKm !== undefined) updateData.nextRevisionKm = data.nextRevisionKm;
  if (data.revisionIntervalKm !== undefined) updateData.revisionIntervalKm = data.revisionIntervalKm;
  if (data.status !== undefined) updateData.status = data.status;

  await db
    .update(vehicles)
    .set(updateData)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)));
}

export async function toggleVehicleStatus(vehicleId: string, userId: string) {
  const vehicle = await getVehicleById(vehicleId, userId);
  if (!vehicle) return null;

  const newStatus = vehicle.status === 'active' ? 'inactive' : 'active';
  await updateVehicle(vehicleId, userId, { status: newStatus });
  return newStatus;
}

export async function processPhotoFile(file: File): Promise<string> {
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('La imagen no puede superar 5MB');
  }
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = file.type || 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

export async function addVehiclePhoto(vehicleId: string, userId: string, file: File): Promise<string[]> {
  const vehicle = await getVehicleById(vehicleId, userId);
  if (!vehicle) throw new Error('Vehículo no encontrado');

  const currentPhotos: string[] = vehicle.photos ? JSON.parse(vehicle.photos) : [];
  const photoData = await processPhotoFile(file);
  currentPhotos.push(photoData);

  await updateVehicle(vehicleId, userId, { photos: currentPhotos });
  return currentPhotos;
}

export async function removeVehiclePhoto(vehicleId: string, userId: string, index: number): Promise<string[]> {
  const vehicle = await getVehicleById(vehicleId, userId);
  if (!vehicle) throw new Error('Vehículo no encontrado');

  const currentPhotos: string[] = vehicle.photos ? JSON.parse(vehicle.photos) : [];
  if (index < 0 || index >= currentPhotos.length) throw new Error('Índice de foto inválido');

  currentPhotos.splice(index, 1);
  await updateVehicle(vehicleId, userId, { photos: currentPhotos });
  return currentPhotos;
}

export async function parseVehicleFormData(formData: FormData) {
  const photos: string[] = [];
  const photoFiles = formData.getAll('photos');

  for (const photo of photoFiles) {
    if (photo instanceof File && photo.size > 0) {
      const data = await processPhotoFile(photo);
      photos.push(data);
    }
  }

  return {
    plate: formData.get('plate')?.toString() || '',
    vin: formData.get('vin')?.toString() || undefined,
    brand: formData.get('brand')?.toString() || '',
    model: formData.get('model')?.toString() || '',
    year: formData.get('year') ? parseInt(formData.get('year')!.toString()) : undefined,
    color: formData.get('color')?.toString() || undefined,
    fuelType: formData.get('fuelType')?.toString() || undefined,
    km: formData.get('km') ? parseInt(formData.get('km')!.toString()) : undefined,
    photos: photos.length > 0 ? photos : undefined,
    nextItvDate: formData.get('nextItvDate') ? new Date(formData.get('nextItvDate')!.toString()).getTime() : undefined,
    insuranceExpiry: formData.get('insuranceExpiry') ? new Date(formData.get('insuranceExpiry')!.toString()).getTime() : undefined,
    oilChangeReminder: formData.get('oilChangeReminder') === 'on',
    nextRevisionKm: formData.get('nextRevisionKm') ? parseInt(formData.get('nextRevisionKm')!.toString()) : undefined,
    revisionIntervalKm: formData.get('revisionIntervalKm') ? parseInt(formData.get('revisionIntervalKm')!.toString()) : undefined,
  };
}

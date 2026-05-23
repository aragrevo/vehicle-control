import { db } from '@/db/client';
import { maintenances, vehicles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export async function getVehicleMaintenances(vehicleId: string, userId: string) {
  const vehicle = await verifyVehicleOwnership(vehicleId, userId);
  if (!vehicle) return null;

  const logs = await db
    .select()
    .from(maintenances)
    .where(eq(maintenances.vehicleId, vehicleId))
    .orderBy(desc(maintenances.date));

  return { vehicle, maintenances: logs };
}

export async function verifyVehicleOwnership(vehicleId: string, userId: string) {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .limit(1);
  return vehicle ?? null;
}

export async function createMaintenance(data: {
  vehicleId: string;
  type: string;
  description?: string;
  date?: number;
  km?: number;
  cost?: number;
}) {
  const id = createId();
  await db.insert(maintenances).values({
    id,
    vehicleId: data.vehicleId,
    type: data.type,
    description: data.description ?? null,
    date: data.date ?? Date.now(),
    km: data.km ?? null,
    cost: data.cost ?? null,
  });
  return id;
}

export async function deleteMaintenance(maintenanceId: string, vehicleId: string, userId: string) {
  const vehicle = await verifyVehicleOwnership(vehicleId, userId);
  if (!vehicle) return false;

  await db.delete(maintenances).where(eq(maintenances.id, maintenanceId));
  return true;
}

export async function parseMaintenanceFormData(formData: FormData) {
  return {
    type: formData.get('type')?.toString() || '',
    description: formData.get('description')?.toString() || undefined,
    date: formData.get('date')?.toString()
      ? new Date(formData.get('date')!.toString()).getTime()
      : undefined,
    km: formData.get('km')?.toString()
      ? parseInt(formData.get('km')!.toString())
      : undefined,
    cost: formData.get('cost')?.toString()
      ? parseFloat(formData.get('cost')!.toString())
      : undefined,
  };
}

import { db } from "@/db/client";
import { maintenances, vehicles } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function getUserMaintenances(userId: string) {
  const userVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  if (userVehicles.length === 0) {
    return { vehicles: [], maintenances: [] };
  }

  const vehicleIds = userVehicles.map((v) => v.id);
  const logs = await db
    .select()
    .from(maintenances)
    .where(inArray(maintenances.vehicleId, vehicleIds))
    .orderBy(desc(maintenances.date));

  return { vehicles: userVehicles, maintenances: logs };
}

export async function getVehicleMaintenances(
  vehicleId: string,
  userId: string,
) {
  const vehicle = await verifyVehicleOwnership(vehicleId, userId);
  if (!vehicle) return null;

  const logs = await db
    .select()
    .from(maintenances)
    .where(eq(maintenances.vehicleId, vehicleId))
    .orderBy(desc(maintenances.date));

  return { vehicle, maintenances: logs };
}

export async function verifyVehicleOwnership(
  vehicleId: string,
  userId: string,
) {
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
  updateNextRevision?: boolean;
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

  if (data.km) {
    const [currentVehicle] = await db
      .select({
        km: vehicles.km,
        revisionIntervalKm: vehicles.revisionIntervalKm,
      })
      .from(vehicles)
      .where(eq(vehicles.id, data.vehicleId))
      .limit(1);

    if (
      currentVehicle &&
      (currentVehicle.km === null || data.km > currentVehicle.km)
    ) {
      const updateData: Record<string, unknown> = { km: data.km };

      if (data.updateNextRevision && currentVehicle.revisionIntervalKm) {
        updateData.nextRevisionKm = data.km + currentVehicle.revisionIntervalKm;
      }

      await db
        .update(vehicles)
        .set(updateData)
        .where(eq(vehicles.id, data.vehicleId));
    }
  }

  return id;
}

export async function deleteMaintenance(
  maintenanceId: string,
  vehicleId: string,
  userId: string,
) {
  const vehicle = await verifyVehicleOwnership(vehicleId, userId);
  if (!vehicle) return false;

  await db.delete(maintenances).where(eq(maintenances.id, maintenanceId));
  return true;
}

export async function parseMaintenanceFormData(formData: FormData) {
  return {
    type: formData.get("type")?.toString() || "",
    vehicleId: formData.get("vehicleId")?.toString() || "",
    description: formData.get("description")?.toString() || undefined,
    date: formData.get("date")?.toString()
      ? new Date(formData.get("date")!.toString()).getTime()
      : undefined,
    km: formData.get("km")?.toString()
      ? parseInt(formData.get("km")!.toString())
      : undefined,
    cost: formData.get("cost")?.toString()
      ? parseFloat(formData.get("cost")!.toString())
      : undefined,
    updateNextRevision: formData.get("updateNextRevision") === "on",
  };
}

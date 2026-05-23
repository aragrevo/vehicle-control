import { db } from '@/db/client';
import { fuelLogs, vehicles } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { calculateFuelStats } from '@/lib/fuel';

export { calculateFuelStats };

export async function getUserFuelLogs(userId: string, vehicleId?: string) {
  const userVehicles = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  const vehicleIds = userVehicles.map((v) => v.id);
  if (vehicleIds.length === 0) return [];

  if (vehicleId && vehicleIds.includes(vehicleId)) {
    return db
      .select()
      .from(fuelLogs)
      .where(eq(fuelLogs.vehicleId, vehicleId))
      .orderBy(desc(fuelLogs.date));
  }

  return db
    .select()
    .from(fuelLogs)
    .where(inArray(fuelLogs.vehicleId, vehicleIds))
    .orderBy(desc(fuelLogs.date));
}

export async function createFuelLog(data: {
  vehicleId: string;
  date?: number;
  liters: number;
  pricePerLiter: number;
  total: number;
  km?: number;
}) {
  const id = createId();
  await db.insert(fuelLogs).values({
    id,
    vehicleId: data.vehicleId,
    date: data.date ?? Date.now(),
    liters: data.liters,
    pricePerLiter: data.pricePerLiter,
    total: data.total,
    km: data.km ?? null,
  });

  if (data.km) {
    await db.update(vehicles).set({ km: data.km }).where(eq(vehicles.id, data.vehicleId));
  }

  return id;
}

export async function deleteFuelLog(logId: string, vehicleId: string, userId: string) {
  const [vehicle] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .limit(1);

  if (!vehicle) return false;

  await db.delete(fuelLogs).where(eq(fuelLogs.id, logId));
  return true;
}

export function buildFuelChartData(fuelLogs: Array<{ date: number | null; liters: number; total: number }>, daysWindow = 30) {
  const cutoff = Date.now() - daysWindow * 24 * 60 * 60 * 1000;
  const dailyLiters: Record<string, number> = {};
  const dailyCost: Record<string, number> = {};

  for (const log of fuelLogs) {
    if (!log.date || log.date < cutoff) continue;
    const dayKey = new Date(log.date).toISOString().split('T')[0];
    dailyLiters[dayKey] = (dailyLiters[dayKey] || 0) + log.liters;
    dailyCost[dayKey] = (dailyCost[dayKey] || 0) + log.total;
  }

  const days = Object.keys(dailyLiters).sort();
  const maxLiters = Math.max(...Object.values(dailyLiters), 1);

  return { days, dailyLiters, dailyCost, maxLiters };
}

export function calculateEfficiencyData(fuelLogs: Array<{ date: number | null; liters: number; km: number | null }>, daysWindow = 30) {
  const cutoff = Date.now() - daysWindow * 24 * 60 * 60 * 1000;
  const sorted = [...fuelLogs]
    .filter((f) => f.km !== null && f.date !== null)
    .sort((a, b) => (a.date || 0) - (b.date || 0));

  type EfficiencyPoint = { date: number; lper100km: number; liters: number; km: number };
  const data: EfficiencyPoint[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];
    if (!curr.km || !prev.km || !curr.date || curr.date < cutoff) continue;
    const dist = curr.km - prev.km;
    if (dist <= 0) continue;
    data.push({
      date: curr.date,
      lper100km: (curr.liters / dist) * 100,
      liters: curr.liters,
      km: curr.km,
    });
  }

  const maxEfficiency = Math.max(...data.map((d) => d.lper100km), 1);
  const avgEfficiency = data.length > 0
    ? data.reduce((sum, d) => sum + d.lper100km, 0) / data.length
    : null;

  return { data, maxEfficiency, avgEfficiency };
}

export async function parseFuelFormData(formData: FormData) {
  return {
    vehicleId: formData.get('vehicleId')?.toString() || '',
    date: formData.get('date')?.toString() ? new Date(formData.get('date')!.toString()).getTime() : undefined,
    liters: parseFloat(formData.get('liters')?.toString() || '0'),
    pricePerLiter: parseFloat(formData.get('pricePerLiter')?.toString() || '0'),
    total: parseFloat(formData.get('total')?.toString() || '0'),
    km: formData.get('km')?.toString() ? parseInt(formData.get('km')!.toString()) : undefined,
  };
}

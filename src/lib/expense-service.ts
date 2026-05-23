import { db } from '@/db/client';
import { vehicles, maintenances, fuelLogs } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export type ExpenseItem = {
  date: number | null;
  category: 'fuel' | 'maintenance';
  label: string;
  amount: number;
  details: string;
};

export type MonthGroup = {
  month: string;
  items: ExpenseItem[];
  fuelTotal: number;
  maintenanceTotal: number;
  total: number;
};

export async function getUserExpenses(userId: string, vehicleId?: string) {
  const userVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  const vehicleIds = userVehicles.map((v) => v.id);
  if (vehicleIds.length === 0) return { vehicles: userVehicles, maintenances: [], fuelLogs: [] };

  const filter = vehicleId && vehicleIds.includes(vehicleId) ? vehicleId : null;

  const [userMaintenances, userFuelLogs] = await Promise.all([
    filter
      ? db.select().from(maintenances).where(eq(maintenances.vehicleId, filter)).orderBy(desc(maintenances.date))
      : db.select().from(maintenances).where(inArray(maintenances.vehicleId, vehicleIds)).orderBy(desc(maintenances.date)),
    filter
      ? db.select().from(fuelLogs).where(eq(fuelLogs.vehicleId, filter)).orderBy(desc(fuelLogs.date))
      : db.select().from(fuelLogs).where(inArray(fuelLogs.vehicleId, vehicleIds)).orderBy(desc(fuelLogs.date)),
  ]);

  return { vehicles: userVehicles, maintenances: userMaintenances, fuelLogs: userFuelLogs };
}

export function mergeExpenses(
  fuelLogs: Array<{ date: number | null; liters: number; total: number; pricePerLiter: number }>,
  maintenances: Array<{ date: number | null; type: string; description: string | null; cost: number | null }>
): ExpenseItem[] {
  const MAINTENANCE_LABELS: Record<string, string> = {
    oil_change: 'Cambio de aceite',
    tires: 'Neumáticos',
    brakes: 'Frenos',
    revision: 'Revisión',
    other: 'Otro',
  };

  const items: ExpenseItem[] = [
    ...fuelLogs.map((f): ExpenseItem => ({
      date: f.date,
      category: 'fuel' as const,
      label: 'Combustible',
      amount: f.total,
      details: `${f.liters}L × ${f.pricePerLiter.toFixed(3)} €/L`,
    })),
    ...maintenances.map((m): ExpenseItem => ({
      date: m.date,
      category: 'maintenance' as const,
      label: MAINTENANCE_LABELS[m.type] || m.type,
      amount: m.cost ?? 0,
      details: m.description || '—',
    })),
  ];

  return items.sort((a, b) => (b.date || 0) - (a.date || 0));
}

export function groupByMonth(expenses: ExpenseItem[]): MonthGroup[] {
  const groups = new Map<string, ExpenseItem[]>();

  for (const item of expenses) {
    if (!item.date) continue;
    const key = new Date(item.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries()).map(([month, items]) => ({
    month,
    items,
    fuelTotal: items.filter((i) => i.category === 'fuel').reduce((s, i) => s + i.amount, 0),
    maintenanceTotal: items.filter((i) => i.category === 'maintenance').reduce((s, i) => s + i.amount, 0),
    total: items.reduce((s, i) => s + i.amount, 0),
  }));
}

export function calculateExpenseTotals(expenses: ExpenseItem[]) {
  const fuelTotal = expenses.filter((i) => i.category === 'fuel').reduce((s, i) => s + i.amount, 0);
  const maintenanceTotal = expenses.filter((i) => i.category === 'maintenance').reduce((s, i) => s + i.amount, 0);
  return { grandTotal: fuelTotal + maintenanceTotal, fuelTotal, maintenanceTotal };
}

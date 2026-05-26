import { db } from '@/db/client';
import { vehicles, maintenances, documents, fuelLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getDocumentStatus } from '@/lib/documents';
import { buildFuelChartData, calculateEfficiencyData } from '@/lib/fuel-service';
import { MAINTENANCE_TYPE_LABELS, FUEL_TYPE_LABELS } from '@/lib/vehicle-service';

export async function getVehicleDashboardData(vehicleId: string, userId: string) {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .limit(1);

  if (!vehicle) return null;

  const [vehicleMaintenances, vehicleDocuments, chartFuelLogs] = await Promise.all([
    db.select().from(maintenances).where(eq(maintenances.vehicleId, vehicleId)).orderBy(desc(maintenances.date)).limit(10),
    db.select().from(documents).where(eq(documents.vehicleId, vehicleId)),
    db.select().from(fuelLogs).where(eq(fuelLogs.vehicleId, vehicleId)).orderBy(desc(fuelLogs.date)),
  ]);

  const vehicleFuelLogs = chartFuelLogs.slice(0, 10);
  const chartData = buildFuelChartData(chartFuelLogs);
  const efficiency = calculateEfficiencyData(chartFuelLogs);
  const activityItems = buildActivityTimeline(vehicleFuelLogs, vehicleMaintenances, 8);
  const vehiclePhotos: string[] = vehicle.photos ? JSON.parse(vehicle.photos) : [];

  const itvDoc = vehicleDocuments.find((d) => d.type === 'itv');
  const itvStatus = itvDoc
    ? getDocumentStatus(itvDoc.expiresAt, itvDoc.alertDaysBefore ?? 30)
    : vehicle.nextItvDate
      ? getDocumentStatus(vehicle.nextItvDate, 30)
      : 'unknown';

  const itvDays = getDaysUntil(vehicle.nextItvDate);
  const insuranceDays = getDaysUntil(vehicle.insuranceExpiry);
  const revisionProgress = getRevisionProgress(vehicle);
  const revisionRemaining = vehicle.nextRevisionKm && vehicle.km
    ? Math.max(vehicle.nextRevisionKm - vehicle.km, 0)
    : null;

  const gauges = buildGaugeConfigs(vehicle, itvStatus, itvDays, insuranceDays, revisionProgress, revisionRemaining);

  return {
    vehicle,
    vehiclePhotos,
    vehicleFuelLogs,
    vehicleMaintenances,
    vehicleDocuments,
    chartData,
    efficiency,
    activityItems,
    itvStatus,
    itvDays,
    insuranceDays,
    revisionProgress,
    revisionRemaining,
    gauges,
    fuelTypeLabel: vehicle.fuelType ? FUEL_TYPE_LABELS[vehicle.fuelType] || vehicle.fuelType : 'Sin especificar',
  };
}

export function getDaysUntil(timestamp: number | null): number | null {
  if (!timestamp) return null;
  return Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getRevisionProgress(vehicle: { km: number | null; nextRevisionKm: number | null; revisionIntervalKm: number | null }): number {
  if (!vehicle.km || !vehicle.nextRevisionKm) return 0;
  const interval = vehicle.revisionIntervalKm || 15000;
  const prevRevisionKm = vehicle.nextRevisionKm - interval;
  const progress = ((vehicle.km - prevRevisionKm) / interval) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

type ActivityItem = {
  date: number | null;
  icon: string;
  iconColor: string;
  label: string;
  details: string;
  cost: string | null;
  odometer: number | null;
};

export function buildActivityTimeline(
  fuelLogs: Array<{ date: number | null; liters: number; total: number; km: number | null }>,
  maintenances: Array<{ date: number | null; type: string; description: string | null; cost: number | null; km: number | null }>,
  limit = 8
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...fuelLogs.map((f): ActivityItem => ({
      date: f.date,
      icon: 'local_gas_station',
      iconColor: 'text-primary',
      label: 'Combustible',
      details: `${f.liters}L — ${f.total.toFixed(2)} €`,
      cost: null,
      odometer: f.km,
    })),
    ...maintenances.map((m): ActivityItem => ({
      date: m.date,
      icon: m.type === 'oil_change' ? 'oil_barrel' : m.type === 'tires' ? 'tire_repair' : m.type === 'brakes' ? 'disc_full' : 'build',
      iconColor: 'text-tertiary',
      label: MAINTENANCE_TYPE_LABELS[m.type] || m.type,
      details: m.description || '—',
      cost: m.cost ? `${m.cost.toFixed(2)} €` : null,
      odometer: m.km,
    })),
  ];

  return items.sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, limit);
}

const CIRCUMFERENCE = 2 * Math.PI * 40;

function gaugeOffset(days: number | null, maxDays: number): number {
  if (days === null) return CIRCUMFERENCE;
  const pct = Math.min(Math.max(days / maxDays, 0), 1);
  return CIRCUMFERENCE * (1 - pct);
}

function gaugeColor(status: string, days: number | null, threshold: number): string {
  if (status === 'expired' || (days !== null && days < 0)) return 'text-error';
  if (status === 'expiring' || (days !== null && days <= threshold)) return 'text-tertiary';
  return 'text-primary';
}

export function buildGaugeConfigs(
  vehicle: { nextRevisionKm: number | null; nextItvDate: number | null; insuranceExpiry: number | null },
  itvStatus: string,
  itvDays: number | null,
  insuranceDays: number | null,
  revisionProgress: number,
  revisionRemaining: number | null
) {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

  return [
    {
      label: 'Próxima Revisión',
      value: revisionRemaining !== null ? `${revisionRemaining.toLocaleString()} km` : '—',
      sublabel: vehicle.nextRevisionKm ? `A los ${vehicle.nextRevisionKm.toLocaleString()} km` : 'Sin configurar',
      colorClass: revisionProgress > 90 ? 'text-error' : revisionProgress > 70 ? 'text-tertiary' : 'text-primary',
      percentage: revisionProgress,
      circumference: CIRCUMFERENCE,
    },
    {
      label: 'ITV',
      value: itvDays !== null ? (itvDays > 0 ? `${itvDays} días` : 'Caducada') : 'Sin fecha',
      sublabel: vehicle.nextItvDate ? `Vence: ${new Date(vehicle.nextItvDate).toLocaleDateString('es-ES', dateOptions)}` : 'Sin fecha configurada',
      colorClass: gaugeColor(itvStatus, itvDays, 30),
      percentage: itvDays !== null ? Math.min(Math.max((itvDays / 365) * 100, 0), 100) : 0,
      circumference: CIRCUMFERENCE,
    },
    ...(vehicle.insuranceExpiry ? [{
      label: 'Seguro',
      value: insuranceDays !== null ? (insuranceDays > 0 ? `${insuranceDays} días` : 'Vencido') : 'Sin fecha',
      sublabel: `Vence: ${new Date(vehicle.insuranceExpiry).toLocaleDateString('es-ES', dateOptions)}`,
      colorClass: insuranceDays !== null && insuranceDays < 0 ? 'text-error' : insuranceDays !== null && insuranceDays <= 30 ? 'text-tertiary' : 'text-secondary',
      percentage: insuranceDays !== null ? Math.min(Math.max((insuranceDays / 365) * 100, 0), 100) : 0,
      circumference: CIRCUMFERENCE,
    }] : []),
  ];
}

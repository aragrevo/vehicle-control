export interface FuelLogEntry {
  id: string;
  vehicleId: string;
  date: number | null;
  liters: number;
  pricePerLiter: number;
  total: number;
  km: number | null;
}

export interface FuelStats {
  totalLiters: number;
  totalCost: number;
  avgPricePerLiter: number;
  avgConsumption: number;
  totalRefuels: number;
  minPricePerLiter: number;
  maxPricePerLiter: number;
}

export function calculateFuelStats(fuelLogs: FuelLogEntry[]): FuelStats {
  if (fuelLogs.length === 0) {
    return {
      totalLiters: 0,
      totalCost: 0,
      avgPricePerLiter: 0,
      avgConsumption: 0,
      totalRefuels: 0,
      minPricePerLiter: 0,
      maxPricePerLiter: 0,
    };
  }

  const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  const totalCost = fuelLogs.reduce((sum, f) => sum + f.total, 0);
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

  const prices = fuelLogs.map((f) => f.pricePerLiter);
  const minPricePerLiter = Math.min(...prices);
  const maxPricePerLiter = Math.max(...prices);

  const sortedLogs = [...fuelLogs]
    .filter((f) => f.km !== null && f.date !== null)
    .sort((a, b) => (a.date || 0) - (b.date || 0));

  let totalKmDriven = 0;
  let totalLitersForConsumption = 0;

  for (let i = 1; i < sortedLogs.length; i++) {
    const prev = sortedLogs[i - 1];
    const curr = sortedLogs[i];
    if (prev.km && curr.km) {
      const kmDiff = curr.km - prev.km;
      if (kmDiff > 0) {
        totalKmDriven += kmDiff;
        totalLitersForConsumption += curr.liters;
      }
    }
  }

  const avgConsumption = totalKmDriven > 0
    ? (totalLitersForConsumption / totalKmDriven) * 100
    : 0;

  return {
    totalLiters,
    totalCost,
    avgPricePerLiter,
    avgConsumption,
    totalRefuels: fuelLogs.length,
    minPricePerLiter,
    maxPricePerLiter,
  };
}

export function calculateConsumptionBetweenRefuels(
  prevKm: number,
  currKm: number,
  liters: number
): number {
  const kmDiff = currKm - prevKm;
  if (kmDiff <= 0 || liters <= 0) return 0;
  return (liters / kmDiff) * 100;
}

export function formatFuelDate(timestamp: number | null): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatPrice(price: number): string {
  return price.toFixed(3) + ' €';
}

export function formatLiters(liters: number): string {
  return liters.toFixed(2) + ' L';
}

export function formatTotal(total: number): string {
  return total.toFixed(2) + ' €';
}

export type DocumentStatus = 'valid' | 'expiring' | 'expired' | 'unknown';

export function getDocumentStatus(
  expiresAt: number | null,
  alertDaysBefore: number = 30
): DocumentStatus {
  if (!expiresAt) return 'unknown';

  const now = Date.now();
  const diffDays = Math.ceil(
    (expiresAt - now) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'expired';
  if (diffDays <= alertDaysBefore) return 'expiring';
  return 'valid';
}

export function getStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    valid: 'Vigente',
    expiring: 'Vence pronto',
    expired: 'Caducado',
    unknown: 'Sin fecha',
  };
  return labels[status];
}

export function getStatusVariant(status: DocumentStatus): 'success' | 'warning' | 'danger' | 'gray' {
  const variants: Record<DocumentStatus, 'success' | 'warning' | 'danger' | 'gray'> = {
    valid: 'success',
    expiring: 'warning',
    expired: 'danger',
    unknown: 'gray',
  };
  return variants[status];
}

export function getDocumentTypeLabel(type: string): string {
  const types: Record<string, string> = {
    itv: 'ITV',
    insurance: 'Seguro',
    registration: 'Permiso de circulación',
  };
  return types[type] || type;
}

import { db } from '@/db/client';
import { documents, vehicles } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export { getDocumentStatus, getStatusVariant, getStatusLabel, getDocumentTypeLabel } from '@/lib/documents';

export async function getUserDocuments(userId: string, vehicleId?: string) {
  const userVehicles = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  const vehicleIds = userVehicles.map((v) => v.id);
  if (vehicleIds.length === 0) return [];

  if (vehicleId && vehicleIds.includes(vehicleId)) {
    return db
      .select()
      .from(documents)
      .where(eq(documents.vehicleId, vehicleId))
      .orderBy(desc(documents.expiresAt));
  }

  return db
    .select()
    .from(documents)
    .where(inArray(documents.vehicleId, vehicleIds))
    .orderBy(desc(documents.expiresAt));
}

export async function getDocumentById(documentId: string) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  return doc ?? null;
}

export async function verifyDocumentOwnership(documentId: string, userId: string) {
  const doc = await getDocumentById(documentId);
  if (!doc) return null;

  const [vehicle] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.id, doc.vehicleId), eq(vehicles.userId, userId)))
    .limit(1);

  return vehicle ? doc : null;
}

export async function createDocument(data: {
  vehicleId: string;
  type: string;
  expiresAt?: number;
  alertDaysBefore?: number;
  fileUrl?: string;
}) {
  const id = createId();
  await db.insert(documents).values({
    id,
    vehicleId: data.vehicleId,
    type: data.type,
    expiresAt: data.expiresAt ?? null,
    alertDaysBefore: data.alertDaysBefore ?? 30,
    fileUrl: data.fileUrl ?? null,
  });
  return id;
}

export async function updateDocument(documentId: string, data: Partial<{
  type: string;
  expiresAt: number;
  alertDaysBefore: number;
  fileUrl: string;
}>) {
  const updateData: Record<string, unknown> = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
  if (data.alertDaysBefore !== undefined) updateData.alertDaysBefore = data.alertDaysBefore;
  if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;

  await db.update(documents).set(updateData).where(eq(documents.id, documentId));
}

export async function deleteDocument(documentId: string, userId: string) {
  const doc = await verifyDocumentOwnership(documentId, userId);
  if (!doc) return false;
  await db.delete(documents).where(eq(documents.id, documentId));
  return true;
}

export async function getExpiringDocuments(userId: string) {
  const allDocs = await getUserDocuments(userId);
  const { getDocumentStatus } = await import('@/lib/documents');
  return allDocs.filter((doc) => {
    const status = getDocumentStatus(doc.expiresAt, doc.alertDaysBefore ?? 30);
    return status === 'expiring' || status === 'expired';
  });
}

export async function parseDocumentFormData(formData: FormData) {
  return {
    vehicleId: formData.get('vehicleId')?.toString() || '',
    type: formData.get('type')?.toString() || '',
    expiresAt: formData.get('expiresAt')?.toString()
      ? new Date(formData.get('expiresAt')!.toString()).getTime()
      : undefined,
    alertDaysBefore: formData.get('alertDaysBefore')?.toString()
      ? parseInt(formData.get('alertDaysBefore')!.toString())
      : undefined,
    fileUrl: formData.get('fileUrl')?.toString() || undefined,
  };
}

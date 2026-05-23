import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: integer('created_at'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  plate: text('plate').notNull(),
  vin: text('vin'),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  color: text('color'),
  fuelType: text('fuel_type'),
  km: integer('km').default(0),
  status: text('status').default('active'),
  createdAt: integer('created_at'),
  nextItvDate: integer('next_itv_date'),
  insuranceExpiry: integer('insurance_expiry'),
  oilChangeReminder: integer('oil_change_reminder', { mode: 'boolean' }).default(true),
  nextRevisionKm: integer('next_revision_km').default(15000),
  revisionIntervalKm: integer('revision_interval_km').default(15000),
});

export const maintenances = sqliteTable('maintenances', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  date: integer('date'),
  km: integer('km'),
  cost: real('cost'),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  type: text('type').notNull(),
  expiresAt: integer('expires_at'),
  alertDaysBefore: integer('alert_days_before').default(30),
  fileUrl: text('file_url'),
});

export const fuelLogs = sqliteTable('fuel_logs', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  date: integer('date'),
  liters: real('liters').notNull(),
  pricePerLiter: real('price_per_liter').notNull(),
  total: real('total').notNull(),
  km: integer('km'),
});

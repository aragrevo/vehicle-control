# Control de vehículos — plan de desarrollo

## Stack tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | Astro 5 | Rendimiento, SSR/SSG flexible, islas de interactividad |
| Estilos | Tailwind CSS 4 | Utility-first, integración nativa con Astro |
| Base de datos | Turso (libSQL) | SQLite en el edge, free tier generoso, sin servidor |
| ORM | Drizzle ORM | Ligero, typesafe, compatible con libSQL |
| Auth | Lucia Auth | Simple, sin servicios externos, funciona con Turso |
| Despliegue | Vercel | Integración con Astro SSR, previews por rama |
| Gestor de paquetes | pnpm | Siempre. Sin excepciones. |

---

## Base de datos — Turso (free tier)

- 500 bases de datos gratuitas
- 1 GB de almacenamiento
- SQLite con acceso remoto vía HTTP
- SDK oficial para Node/Edge

```bash
pnpm add @libsql/client drizzle-orm
pnpm add -D drizzle-kit
```

---

## Estructura del proyecto

```
/
├── src/
│   ├── components/        # Componentes Astro y de UI
│   │   ├── vehicles/
│   │   ├── maintenance/
│   │   ├── documents/
│   │   ├── fuel/
│   │   └── ui/            # Componentes base (Card, Badge, Button…)
│   ├── layouts/
│   │   └── AppLayout.astro
│   ├── pages/
│   │   ├── index.astro          # Dashboard
│   │   ├── vehicles/
│   │   │   ├── index.astro      # Listado
│   │   │   ├── [id].astro       # Detalle
│   │   │   └── new.astro        # Alta
│   │   ├── maintenance/
│   │   ├── documents/
│   │   ├── fuel/
│   │   ├── expenses/
│   │   └── api/                 # Endpoints REST (Astro API routes)
│   ├── db/
│   │   ├── schema.ts            # Esquema Drizzle
│   │   └── client.ts            # Cliente Turso
│   ├── lib/
│   │   └── auth.ts              # Lucia Auth
│   └── env.d.ts
├── drizzle.config.ts
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## Esquema de base de datos

```ts
// src/db/schema.ts

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

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
  createdAt: integer('created_at', { mode: 'timestamp' }),
})

export const maintenances = sqliteTable('maintenances', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  date: integer('date', { mode: 'timestamp' }),
  km: integer('km'),
  cost: real('cost'),
})

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  type: text('type').notNull(),   // 'itv' | 'insurance' | 'registration'
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  alertDaysBefore: integer('alert_days_before').default(30),
  fileUrl: text('file_url'),
})

export const fuelLogs = sqliteTable('fuel_logs', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  date: integer('date', { mode: 'timestamp' }),
  liters: real('liters').notNull(),
  pricePerLiter: real('price_per_liter').notNull(),
  total: real('total').notNull(),
  km: integer('km'),
})
```

---

## Fases de desarrollo

### Fase 1 — Scaffolding y configuración

```bash
pnpm create astro@latest vehicle-control -- --template minimal
cd vehicle-control
pnpm astro add tailwind
pnpm astro add vercel
pnpm add @libsql/client drizzle-orm
pnpm add -D drizzle-kit
```

- Configurar Astro en modo SSR (`output: 'server'`, adapter Vercel)
- Conectar Turso: crear DB en turso.tech, guardar `TURSO_URL` y `TURSO_AUTH_TOKEN` en `.env`
- Definir esquema Drizzle y ejecutar primera migración
- Layout base con navegación

### Fase 2 — Vehículos (CRUD)

- Listado de vehículos con tarjeta
- Formulario de alta y edición
- Detalle de vehículo
- Estados (activo, inactivo)

### Fase 3 — Mantenimientos y documentos

- Historial de mantenimientos por vehículo
- Gestión de documentos con fecha de caducidad
- Lógica de estado: al día / vence pronto / caducado

### Fase 4 — Repostajes y gastos

- Formulario de repostaje
- Cálculo de consumo medio
- Vista de gastos agrupados por categoría y mes

### Fase 5 — Dashboard y alertas

- Widgets de resumen en el dashboard
- Listado de próximos vencimientos globales
- Notificaciones por email (Resend, free tier)

### Fase 6 — Pulido y despliegue

- PWA básica (manifest + service worker)
- Responsive mobile
- Variables de entorno en Vercel
- Despliegue a producción

---

## Configuración de Astro

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
})
```

---

## Despliegue en Vercel

1. Conectar el repositorio en vercel.com
2. Framework preset: **Astro** (autodetectado)
3. Añadir variables de entorno:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Cada `push` a `main` despliega en producción; las ramas generan preview URLs

---

## Comandos de referencia

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Migraciones
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Preview local del build
pnpm preview
```

---

## Costes estimados (todo en free tier)

| Servicio | Plan | Límite gratuito |
|---|---|---|
| Vercel | Hobby | 100 GB bandwidth, builds ilimitados |
| Turso | Free | 500 DBs, 1 GB storage, 1B row reads/mes |
| Resend (email) | Free | 3.000 emails/mes |
| **Total** | | **0 €/mes** |

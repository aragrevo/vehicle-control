# 🚗 Vehicle Control

Sistema de gestión de vehículos construido con Astro, Tailwind CSS y Turso.

## Características

- ✅ Registro y autenticación de usuarios
- ✅ CRUD de vehículos
- ✅ Historial de mantenimientos
- ✅ Gestión de documentos con alertas de caducidad
- ✅ Diseño responsivo con sidebar de navegación

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 5 |
| Estilos | Tailwind CSS 3 |
| Base de datos | Turso (libSQL) |
| ORM | Drizzle ORM |
| Auth | Lucia Auth |
| Despliegue | Vercel |

## Requisitos previos

- Node.js 18+
- pnpm
- Cuenta en [Turso](https://turso.tech)

## Configuración

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd vehicle-control
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Crear base de datos en Turso:
```bash
turso db create vehicle-control
turso db tokens create vehicle-control
```

4. Configurar variables de entorno en `.env`:
```env
TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

5. Ejecutar migraciones:
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

6. Iniciar servidor de desarrollo:
```bash
pnpm dev
```

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm drizzle-kit generate` | Generar migraciones |
| `pnpm drizzle-kit migrate` | Ejecutar migraciones |

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/           # Componentes base (Button, Card, Badge)
│   ├── vehicles/     # Componentes de vehículos
│   ├── maintenance/  # Componentes de mantenimiento
│   └── documents/    # Componentes de documentos
├── layouts/
│   └── AppLayout.astro
├── pages/
│   ├── vehicles/     # CRUD de vehículos
│   ├── maintenance/  # Historial de mantenimientos
│   ├── documents/    # Gestión de documentos
│   └── api/          # Endpoints REST
├── db/
│   ├── schema.ts     # Esquema Drizzle
│   └── client.ts     # Cliente Turso
└── lib/
    ├── auth.ts       # Configuración Lucia
    └── documents.ts  # Utilidades de documentos
```

## Base de datos

### Tablas principales

- **users** - Usuarios del sistema
- **sessions** - Sesiones de autenticación
- **vehicles** - Vehículos registrados
- **maintenances** - Historial de mantenimientos
- **documents** - Documentos con fechas de caducidad
- **fuel_logs** - Registro de repostajes (pendiente)

## Despliegue

1. Conectar repositorio en Vercel
2. Configurar variables de entorno:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. Desplegar automáticamente en cada push a `main`

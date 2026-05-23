# AGENTS.md

## Stack

Astro 6 SSR + Tailwind CSS 3 + Turso (libSQL) + Drizzle ORM + Lucia Auth. Deployed to Vercel.

Package manager: **pnpm** — no npm, no yarn, no exceptions.

Node >= 22.12.0 required.

## Commands

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm preview          # Preview production build locally
pnpm db:generate      # Generate Drizzle migration from schema changes
pnpm db:migrate       # Apply pending migrations to Turso
pnpm db:studio        # Open Drizzle Studio (DB browser)
```

There are **no lint, test, typecheck, or format scripts**. Verify correctness manually or by running `pnpm build` (Astro includes type-checking for `.astro` files during build).

## Environment

Two env vars required (loaded via `import.meta.env` in Astro):

- `TURSO_DATABASE_URL` — libSQL connection string
- `TURSO_AUTH_TOKEN` — Turso auth token

These are in `.env` (gitignored). Never commit real tokens.

## Architecture

- **SSR everywhere**: `output: 'server'` in astro.config. Every page/API route runs server-side.
- **Auth flow**: Lucia sessions via middleware (`src/middleware.ts`). Check `locals.user` in pages/API routes. Unauthenticated users redirect to `/login`.
- **API routes**: `src/pages/api/*/` — export named functions (`GET`, `POST`, etc.). Return `Response` objects. Always guard with `locals.user` check.
- **DB client**: `src/db/client.ts` — single Turso client, imported as `db`.
- **Schema**: `src/db/schema.ts` — Drizzle table definitions. Edit here, then `pnpm db:generate` + `pnpm db:migrate`.
- **IDs**: Text-based (cuid2 via `@paralleldrive/cuid2`).
- **Timestamps stored as integers** (Unix ms), not `{ mode: 'timestamp' }` for most columns.

## Design System

Dark-only theme. All color tokens are custom Tailwind classes defined in `tailwind.config.mjs`:

- Surface colors: `bg-surface`, `bg-surface-container`, `bg-surface-container-low`, etc.
- Text: `text-on-surface`, `text-on-surface-variant`, `text-primary`, `text-secondary`
- Status badges: `text-success`/`bg-success-container`, `text-warning`/`bg-warning-container`, `text-error`/`bg-error-container`
- Icons: **Material Symbols Outlined** (loaded via Google Fonts CDN in `global.css`). Use `<span class="material-symbols-outlined">icon_name</span>`.
- Fonts: Inter (body/headings), JetBrains Mono (data/code).

Reusable CSS classes in `src/styles/global.css`:
- `.input-base` — standard text input
- `.select-base` — standard select dropdown
- `.card-interactive` — card with hover glow effect

## Conventions

- **UI language**: Spanish. All labels, messages, and content in Spanish.
- **File naming**: kebab-case for files, PascalCase for component names.
- **Layout**: `AppLayout.astro` for authenticated pages (sidebar + top bar + mobile bottom nav). `AuthLayout.astro` for login/register.
- **Document status logic**: `src/lib/documents.ts` — `getDocumentStatus()` computes `valid | expiring | expired | unknown` from expiry dates. Reuse this, don't rewrite it.
- **Vehicle form**: `src/components/vehicles/VehicleForm.astro` is shared between create and edit.
- **Form patterns**: Pages use Astro server-side form handling. Components are `.astro` files (no React/Svelte islands unless added later).
- **Tailwind spacing**: Use custom tokens (`p-md`, `gap-sm`, `px-lg`, `py-xs`) not raw values — they map to 4px base unit.
- **Border radius**: Use `rounded-md` (default 0.25rem), `rounded-lg` (0.5rem), `rounded-xl` (0.75rem), `rounded-full`.

## DB Schema (key tables)

`users` → `sessions` (Lucia auth), `vehicles` (owned by user), `maintenances` (per vehicle), `documents` (per vehicle, with expiry), `fuel_logs` (per vehicle).

All tables use `text('id').primaryKey()` for IDs.

## Migrations

Three migrations exist in `drizzle/migrations/`. After editing `src/db/schema.ts`:

1. `pnpm db:generate` — creates new migration SQL
2. `pnpm db:migrate` — applies to Turso

Check `drizzle/migrations/meta/` for migration journal.

## Project Plan

See `vehicle-control-plan.md` for feature spec and `vehicle-control-dev-plan.md` for phased development plan and schema reference.

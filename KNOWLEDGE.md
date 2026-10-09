# KNOWLEDGE.md — Contexto del proyecto INPSASEL

> Base de conocimiento para agentes (Claude Code) y desarrolladores. Léelo antes de tocar código.
> Complementa a `CLAUDE.md` (reglas de estilo/flujo). Mantener actualizado cuando cambie la arquitectura.

## 1. Qué es

Sistema web de **registro y gestión de visitas** de **INPSASEL – GERESAT Portuguesa** (en la UI aparece «GENESAT»; Instituto Nacional de
Prevención, Salud y Seguridad Laborales, Venezuela). Permite registrar visitas de ciudadanos/empresas,
consultarlas en un calendario, modificarlas/eliminarlas (solo administradores) e imprimir reportes PDF.

> ⚠️ `README.md` describe la **versión antigua** (Express + HTML + PostgreSQL local + `mobile-viewer/`).
> Esa versión ya **no existe** en el repo. La fuente de verdad es este archivo.

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15.3 (App Router, Server Components, Server Actions, Turbopack en dev) |
| UI | React 19, Tailwind CSS v4 (`@import "tailwindcss"` en `app/globals.css`), shadcn (estilo `radix-lyra`), Phosphor icons |
| Calendario | FullCalendar 6 (`daygrid`, `timegrid`, `interaction`) — transpilado en `next.config.ts` |
| Backend/DB | Supabase (PostgreSQL + Auth) vía `@supabase/ssr` |
| Validación | Zod 3 |
| Lenguaje | TypeScript estricto, alias `@/*` → raíz |
| CI | GitHub Actions: backup diario `pg_dump` (`.github/workflows/supabase-backup.yml`) |

No hay tests automatizados. Verificación mínima: `npx tsc --noEmit` y `npm run lint`.

## 3. Estructura

```
app/
  page.tsx                 → redirige a /menu o /login
  (auth)/login/            → pantalla de login
  (dashboard)/             → layout con Sidebar; requiere sesión
    menu/                  → bienvenida
    visitas/registrar      → alta de visita (todos los roles)
    visitas/modificar      → edición (?codigo=) — solo admin
    visitas/eliminar       → baja — solo admin
    visitas/calendario     → FullCalendar del año en curso, drag&drop para mover fecha
    visitas/hoy            → visitas del día
    visitas/reportes       → reportes masivos por rango (?desde&hasta)
    visitas/reporte        → legacy, redirige a /visitas/calendario
  (print)/                 → layout vacío, páginas para imprimir/PDF
    reporte?codigo=        → reporte individual (RPT-YYYYMMDD-NNN)
    reportes?desde&hasta=  → reporte masivo (RPT-YYYYMMDD-YYYYMMDD)
actions/
  auth.ts                  → loginAction, logoutAction
  visitas.ts               → registrar / modificar / eliminar / mover / fetch
components/
  forms/                   → Login, Registrar, Modificar, Eliminar
  layout/                  → Sidebar, CalendarioGrid (+Wrapper, carga client-only)
  reportes/                → ReporteVisita (plantilla), wizard modal (iframe a /reporte), bulk, botones
lib/
  supabase/server.ts       → createClient() para RSC / Server Actions
  supabase/client.ts       → createClient() para Client Components
  auth/permissions.ts      → userCanManageVisits(roleName)
  validations/             → esquemas Zod (auth, visita) + catálogos (TIPOS, ESTATUS, FUNCIONES, COORDINACIONES)
middleware.ts              → protege todo excepto /login; refresca sesión con getUser()
types/database.ts          → tipos de Supabase (regenerar con npm run types:db)
supabase/migrations/       → migraciones SQL (Supabase)
scripts/                   → seed/migración de usuarios, scripts SQL/JS legacy
schema.sql                 → esquema original (legacy, MAYÚSCULAS); el vigente está en Supabase
```

## 4. Autenticación y permisos

- **Supabase Auth** con email sintético: `username` → `${username}@inpsasel.internal` (`actions/auth.ts`).
- El rol vive en `user.user_metadata.roleName` (además `id_usuario`, `id_rol`, `nombre_completo`).
  Lo cargan `scripts/seed-users.ts` / `scripts/migrate-users.ts` con la Service Role Key.
- `userCanManageVisits(roleName)` (`lib/auth/permissions.ts`):
  - Admin: roles en `FULL_VISIT_ACCESS_ROLE_NAMES` (por defecto `Admin,Administrador`).
  - Solo lectura/registro: `READONLY_VISIT_ROLE_NAME` (por defecto `Registro y calendario`).
- Los permisos se comprueban **en tres capas**: Sidebar (oculta enlaces), page (redirect a `/menu`) y
  Server Action (devuelve error). Mantener las tres al añadir funciones restringidas.
- Usar siempre `supabase.auth.getUser()` en servidor, **nunca** `getSession()`.

## 5. Modelo de datos (Supabase, `public`, minúsculas)

Tablas principales: `visitas`, `contactos`, `usuarios`, `roles`, `empleado`, `departamento`, `empresa`,
`ordenes_trabajo`, `maestra`, `auditoria`.

**`visitas`** (registro principal): `codigo_visita` (único, `VIS-YYYYMMDD-NNN`), `fecha` (date),
`hora` (time), `tipo_visita` (enum), `estatus` (enum), `id_contacto` → `contactos`, `id_usuario`,
`id_orden`, y campos de detalle: `motivo_visita`, `cordinacion_referida` (sic, con una "r"),
`observaciones`, `sexo`, `edad`, `municipio`, `sector`, `cargo`, `funcion`, `actividad_economica`, `funcionario`.

**`contactos`**: `cedula_rif` (UNIQUE, migración `20260707_contactos_integracion.sql`), `nombre_completo`,
`telefono`, `nombre_entidad` (NOT NULL → por defecto `'No especificada'`), `tipo_contacto` (enum).

**Enums**
- `tipo_visita_enum`: Técnica, Comercial, Soporte, Inspección, Personal, Administrativa, Consulta
- `estatus_enum`: Planificada, En Curso, Completada, Revisada, Cancelada, No Programada, Emergencia
- `tipo_contacto_enum`: Individual, Empresa, Organización

Los enums están duplicados en `lib/validations/visita.schema.ts`: **si cambian en BD, actualizar ambos**
y regenerar `types/database.ts`.

## 6. Flujos clave (`actions/visitas.ts`)

- **Registrar**: valida con Zod → `upsertContacto` (onConflict `cedula_rif`) → `resolverOrden`
  (upsert de `ordenes_trabajo` por `codigo_ot`) → `generarCodigoVisita` (máximo del día + 1) → insert.
  Si el insert choca con el UNIQUE de `codigo_visita` (alta simultánea) reintenta hasta 5 veces.
- **Modificar**: requiere admin; re-upsert del contacto/OT y update por `codigo_visita`. Error si no existe.
- **Eliminar**: requiere admin; confirmación en el cliente; error si el código no existe.
- **Mover** (drag&drop del calendario): requiere admin; valida la fecha. Para otros roles el calendario no es arrastrable.
- Validación: los campos vacíos se convierten a `NULL` (así se pueden borrar al modificar); `edad` vacía es válida.
- Formato de hora: el schema recorta a `HH:MM` (`z.preprocess`) porque Postgres devuelve `HH:MM:SS`.
- Fechas "de hoy": usar `hoyLocal()` de `lib/fecha.ts` (America/Caracas), nunca `toISOString()` (UTC).
- Formularios: usar `useAccionFormulario` (`hooks/`) en lugar de `<form action>`; React 19 resetea el
  formulario tras la acción y se perdían los datos al haber errores.
- Colores por estatus del calendario: `ESTATUS_COLOR` en `components/layout/CalendarioGrid.tsx`.

## 7. Variables de entorno

Ver `.env.example`. Nunca commitear `.env*` (ya en `.gitignore`).

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clave pública (anon/publishable) |
| `SUPABASE_SECRET_KEY` | Service Role — **solo scripts** (`seed:users`, `migrate:users`), nunca en runtime |
| `TEMP_PASSWORD` | contraseña temporal en `migrate:users` |
| `READONLY_VISIT_ROLE_NAME`, `FULL_VISIT_ACCESS_ROLE_NAMES` | nombres de roles (opcionales) |

Secrets del workflow de backup (GitHub): `SUPABASE_DB_HOST`, `SUPABASE_DB_USER`, `SUPABASE_DB_NAME`,
`SUPABASE_DB_PASSWORD` (puerto 6543, pooler).

## 8. Comandos

### QA local con Supabase en Docker

```bash
npx supabase init && npx supabase start -x studio,imgproxy,mailpit,realtime,storage-api,edge-runtime,logflare,vector,supavisor,postgres-meta
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f scripts/schema-supabase.sql \
  -f supabase/migrations/20260707_contactos_integracion.sql -f supabase/migrations/20261009_habilitar_rls.sql
# .env.local → NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 y la PUBLISHABLE_KEY que imprime `supabase start`
# Crear usuarios con SUPABASE_SECRET_KEY local: npm run seed:users
```

### Scripts

```bash
npm install
npm run dev            # http://localhost:3000 (Turbopack)
npm run build && npm start
npm run lint
npx tsc --noEmit       # chequeo de tipos
npm run types:db       # regenera types/database.ts desde Supabase
npm run seed:users     # crea usuarios iniciales en Supabase Auth (requiere SUPABASE_SECRET_KEY)
npm run migrate:users  # migra tabla usuarios → Supabase Auth
```

En Windows/PowerShell, al regenerar tipos usar `Out-File -Encoding utf8` (la redirección `>` escribe UTF-16).

## 9. Convenciones

- Código, UI y comentarios en **español**.
- Mutaciones vía **Server Actions** con firma `(prevState, formData) => ActionState` y `useActionState` en el cliente.
- Lecturas en **Server Components** con `createClient()` de `lib/supabase/server`.
- Validar toda entrada con Zod en `lib/validations/`.
- Mobile-first (ver `CLAUDE.md`). El layout del dashboard usa Sidebar fijo `w-64`: revisar en móvil al tocarlo.
- Las páginas de `(print)` no llevan Sidebar; se renderizan en iframe/pestaña para imprimir o guardar como PDF.

## 10. Deuda técnica / pendientes conocidos

- `README.md` desactualizado (describe Express). Reescribir a partir de este documento.
- Credenciales iniciales escritas en claro en `scripts/seed-users.ts` y en `README.md` → mover a variables de entorno y rotarlas.
- RLS: `supabase/migrations/20261009_habilitar_rls.sql` lo activa (bloquea `anon`). **Aplicar en producción**
  desde el SQL Editor de Supabase si aún no está activo.
- El rol se lee de `user_metadata`, que el propio usuario puede modificar con `auth.updateUser()`.
  Lo correcto es moverlo a `app_metadata` (solo editable con service_role).
- Logo cargado desde Bing (`tse3.mm.bing.net`) en Sidebar, login y reportes → mover a `public/`.
- `tsconfig.tsbuildinfo` versionado (debería ignorarse).
- Sin tests automatizados ni CI de lint/typecheck.

## 11. Skills de agente disponibles

`.agents/skills/` (ignorado por git, ver `skills-lock.json`): `supabase` y `supabase-postgres-best-practices`.
Consultarlas para cambios de esquema, índices, RLS o consultas.

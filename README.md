# Sistema de Gestión de Visitas — INPSASEL

Sistema web para registrar, consultar, modificar, reprogramar y eliminar visitas técnicas y comerciales, con calendario, reportes imprimibles y control de acceso por rol.

> Versión actual: **Next.js + Supabase**. Reemplaza a la versión anterior en Express + PostgreSQL con vistas HTML.

## Funcionalidades

- **Inicio de sesión** con Supabase Auth. Todas las rutas, excepto `/login`, están protegidas por `middleware.ts`.
- **Menú principal** (`/menu`).
- **Registrar visita** con contacto (individual, empresa u organización) y orden de trabajo.
- **Visitas de hoy** (`/visitas/hoy`).
- **Calendario** con vista mensual, semanal y diaria (FullCalendar). Permite **mover visitas arrastrándolas**.
- **Modificar** y **eliminar** visitas.
- **Reportes** por visita y por rango, con versión para imprimir (`/reporte`, `/reportes`).
- **Permisos por rol:** los administradores gestionan todo; el rol de solo lectura ("Registro y calendario") solo consulta.
- **Respaldo diario automático** de la base de datos con GitHub Actions (`pg_dump` a las 3:00 UTC, guardado como artefacto).

### Catálogos

- **Tipos de visita:** Técnica, Comercial, Soporte, Inspección, Personal, Administrativa.
- **Estatus:** Procesada, Rechazada, En revisión, Otras.

## Stack

Next.js (App Router, Server Actions, Turbopack) · React · TypeScript · Tailwind CSS · shadcn/ui (Radix) · Supabase (Auth + PostgreSQL) · FullCalendar · Zod · Phosphor Icons.

## Estructura

```
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── menu/
│   │   └── visitas/        # registrar, hoy, calendario, modificar, eliminar, reporte, reportes
│   └── (print)/            # reporte y reportes en formato imprimible
├── actions/                # auth.ts (login/logout), visitas.ts (registrar, modificar, mover, eliminar, consultar)
├── components/
├── lib/
│   ├── auth/permissions.ts # Reglas de acceso por rol
│   ├── supabase/           # Clientes de navegador y servidor
│   └── validations/        # Esquemas Zod (auth, visita)
├── middleware.ts           # Protección de rutas y refresco de sesión
├── schema.sql              # Esquema base
├── supabase/migrations/    # Migraciones (integración de contactos)
├── scripts/                # Creación de tablas y enums, migración y alta de usuarios
├── types/database.ts       # Tipos generados desde Supabase
└── .github/workflows/supabase-backup.yml
```

## Instalación

```bash
npm install
npm run dev                 # http://localhost:3000
```

### Base de datos

1. Crear el esquema con `schema.sql` (o `scripts/schema-supabase.sql`) y aplicar `supabase/migrations/`.
2. Crear usuarios:

```bash
npm run seed:users          # usuarios iniciales
npm run migrate:users       # migrar usuarios de la versión anterior
```

3. Regenerar los tipos de TypeScript cuando cambie el esquema:

```bash
npm run types:db            # desde el proyecto remoto
npm run types:db:local      # desde Supabase local
```

## Variables de entorno (`.env.local`)

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo scripts y servidor) |
| `SUPABASE_PROJECT_ID` | ID del proyecto (generación de tipos) |
| `READONLY_VISIT_ROLE_NAME` | Nombre del rol de solo lectura (por defecto "Registro y calendario") |
| `FULL_VISIT_ACCESS_ROLE_NAMES` | Roles con acceso total, separados por coma (por defecto "Admin,Administrador") |

### Secretos de GitHub (respaldo automático)

`SUPABASE_DB_HOST`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_NAME`.

## Despliegue

Vercel, con las variables de Supabase configuradas en el proyecto.

---

Desarrollado por **Jesús Mariño** en colaboración con [sirwillwallas-jpg](https://github.com/sirwillwallas-jpg).

-- =============================================================================
-- Habilita Row Level Security en todas las tablas de `public`.
--
-- Sin RLS, cualquiera con la clave pública (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
-- visible en el navegador) puede leer, modificar y borrar datos vía la API REST
-- sin iniciar sesión.
--
-- Tras esta migración:
--   - `anon` (sin sesión): sin acceso.
--   - `authenticated`: acceso completo a las tablas que usa la app (igual que hoy).
--     Los permisos por rol (admin vs. registro) siguen aplicándose en el servidor.
--   - service_role (scripts) y el usuario postgres (backup) no se ven afectados.
--
-- Idempotente: puede ejecutarse más de una vez.
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'visitas', 'contactos', 'ordenes_trabajo', 'usuarios', 'roles',
    'empleado', 'departamento', 'empresa', 'maestra', 'auditoria'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_all" ON public.%I', t);
  END LOOP;
END $$;

-- Tablas que usa la app con la sesión del usuario
CREATE POLICY "authenticated_all" ON public.visitas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.contactos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.ordenes_trabajo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Catálogos: solo lectura para usuarios autenticados
CREATE POLICY "authenticated_all" ON public.roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.maestra
  FOR SELECT TO authenticated USING (true);

-- usuarios (contiene hashes de contraseña), empleado, departamento, empresa y auditoria
-- quedan sin políticas → solo accesibles con service_role.

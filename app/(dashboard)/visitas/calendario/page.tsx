import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CalendarioWrapper } from '@/components/layout/CalendarioWrapper'
import { userCanManageVisits } from '@/lib/auth/permissions'
import { hoyLocal } from '@/lib/fecha'

export const metadata: Metadata = { title: 'Calendario de Visitas — INPSASEL' }

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const puedeMover = userCanManageVisits((user?.user_metadata?.roleName as string) ?? '')

  // Año anterior, actual y siguiente para poder navegar entre años sin un calendario vacío
  const year = Number(hoyLocal().slice(0, 4))
  const { data: visitas, error } = await supabase
    .from('visitas')
    .select('codigo_visita, fecha, hora, tipo_visita, estatus, motivo_visita, funcionario, contactos(cedula_rif, nombre_completo)')
    .gte('fecha', `${year - 1}-01-01`)
    .lte('fecha', `${year + 1}-12-31`)
    .order('fecha', { ascending: true })

  if (error) console.error('[CalendarioPage]', error.message)

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Visitas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {puedeMover
              ? 'Arrastra una visita para cambiar su fecha. Haz clic para ver el detalle.'
              : 'Haz clic en una visita para ver el detalle.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-400">
            {visitas?.length ?? 0} {visitas?.length === 1 ? 'visita cargada' : 'visitas cargadas'}
          </span>
          <Link
            href="/visitas/reportes"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: '#1a2744' }}
          >
            Reportes Masivos
          </Link>
        </div>
      </div>

      <CalendarioWrapper visitas={visitas ?? []} puedeMover={puedeMover} />
    </div>
  )
}

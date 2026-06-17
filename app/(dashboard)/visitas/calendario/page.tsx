import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CalendarioWrapper } from '@/components/layout/CalendarioWrapper'

export const metadata: Metadata = { title: 'Calendario de Visitas — INPSASEL' }

export default async function CalendarioPage() {
  const supabase = await createClient()

  const year = new Date().getFullYear()
  const { data: visitas, error } = await supabase
    .from('visitas')
    .select('codigo_visita, fecha, hora, tipo_visita, estatus, motivo_visita, funcionario')
    .gte('fecha', `${year}-01-01`)
    .lte('fecha', `${year}-12-31`)
    .order('fecha', { ascending: true })

  if (error) console.error('[CalendarioPage]', error.message)

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Visitas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Arrastra una visita para cambiar su fecha. Haz clic para ver el detalle.
          </p>
        </div>
        <span className="text-xs text-gray-400">{visitas?.length ?? 0} visitas cargadas</span>
      </div>

      <CalendarioWrapper visitas={visitas ?? []} />
    </div>
  )
}

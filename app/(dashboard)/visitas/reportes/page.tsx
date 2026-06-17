import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'
import { ReportesForm } from '@/components/reportes/ReportesForm'
import { PrintButton } from '@/components/reportes/PrintButton'

export const metadata: Metadata = { title: 'Reportes Masivos — INPSASEL' }

interface PageProps {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}

export default async function ReportesMasivosPage({ searchParams }: PageProps) {
  const { desde, hasta } = await searchParams

  let visitas: Parameters<typeof ReporteVisita>[0]['v'][] = []
  let error: string | null = null

  if (desde && hasta) {
    const supabase = await createClient()
    const { data, error: err } = await supabase
      .from('visitas')
      .select('*')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })

    if (err) error = err.message
    else visitas = data ?? []
  }

  return (
    <>
      {/* Barra de acción — oculta al imprimir */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Reportes Masivos</span>

        <ReportesForm desde={desde} hasta={hasta} total={visitas.length} />

        {visitas.length > 0 && (
          <div className="ml-auto"><PrintButton label={`Imprimir ${visitas.length} reporte${visitas.length !== 1 ? 's' : ''} / Guardar PDF`} /></div>
        )}
      </div>

      {/* Contenido */}
      <div className="pt-20 print:pt-0 bg-gray-100 min-h-screen print:bg-white">
        {error && (
          <p className="no-print text-red-600 text-sm px-6 py-4">{error}</p>
        )}

        {!desde && !hasta && (
          <div className="no-print max-w-md mx-auto mt-20 text-center text-gray-400">
            <p className="text-lg font-semibold mb-2">Selecciona un rango de fechas</p>
            <p className="text-sm">Usa el formulario de arriba para filtrar y luego descarga todos los reportes de ese período.</p>
          </div>
        )}

        {visitas.length === 0 && desde && hasta && !error && (
          <div className="no-print max-w-md mx-auto mt-20 text-center text-gray-400">
            <p className="text-lg font-semibold">Sin visitas en ese período</p>
          </div>
        )}

        {visitas.map((v, idx) => (
          <ReporteVisita key={v.codigo_visita} v={v} idx={idx} />
        ))}
      </div>
    </>
  )
}

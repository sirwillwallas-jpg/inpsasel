import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'
import { ReportesForm } from '@/components/reportes/ReportesForm'
import { BulkReportWizard } from '@/components/reportes/BulkReportWizard'

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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Panel de control */}
      <div className="no-print">
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Reportes Masivos</h1>
          <a href="/visitas/calendario" className="text-sm text-gray-400 hover:text-gray-600">
            ← Calendario
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <ReportesForm desde={desde} hasta={hasta} total={visitas.length} />

          {visitas.length > 0 && desde && hasta && (
            <BulkReportWizard
              count={visitas.length}
              desde={desde}
              hasta={hasta}
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-4">
            {error}
          </p>
        )}

        {!desde && !hasta && (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg font-semibold mb-1">Selecciona un rango de fechas</p>
            <p className="text-sm">Filtra para ver y descargar los reportes del período.</p>
          </div>
        )}

        {visitas.length === 0 && desde && hasta && !error && (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg font-semibold">Sin visitas en ese período</p>
          </div>
        )}
      </div>

      {/* Reportes — visibles en pantalla y al imprimir desde esta página */}
      {visitas.length > 0 && (
        <div>
          {visitas.map((v) => (
            <ReporteVisita key={v.codigo_visita} v={v} />
          ))}
        </div>
      )}
    </div>
  )
}

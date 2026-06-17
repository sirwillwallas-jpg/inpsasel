import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'
import { PrintButton } from '@/components/reportes/PrintButton'

export const metadata: Metadata = { title: 'Reporte de Visita — INPSASEL' }

interface PageProps {
  searchParams: Promise<{ codigo?: string }>
}

export default async function ReportePage({ searchParams }: PageProps) {
  const { codigo } = await searchParams
  if (!codigo) notFound()

  const supabase = await createClient()
  const { data: v } = await supabase
    .from('visitas')
    .select('*')
    .eq('codigo_visita', codigo.trim())
    .single()

  if (!v) notFound()

  return (
    <>
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <span className="text-sm font-semibold text-gray-700">{v.codigo_visita}</span>
        <div className="flex gap-3 items-center">
          <a href="/visitas/calendario" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Volver
          </a>
          <PrintButton label="Imprimir / Guardar PDF" />
        </div>
      </div>
      <div className="pt-16 print:pt-0 bg-gray-100 min-h-screen print:bg-white">
        <ReporteVisita v={v} />
      </div>
    </>
  )
}

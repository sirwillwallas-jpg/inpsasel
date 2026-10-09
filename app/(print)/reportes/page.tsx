import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'
import { PrintButton } from '@/components/reportes/PrintButton'

interface PageProps {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}

export default async function PrintReportesMasivosPage({ searchParams }: PageProps) {
  const { desde, hasta } = await searchParams
  if (!desde || !hasta) notFound()

  const supabase = await createClient()
  const { data: visitas, error } = await supabase
    .from('visitas')
    .select('*, contactos(*), ordenes_trabajo(codigo_ot)')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (error || !visitas?.length) notFound()

  // Código de archivo: RPT-YYYYMMDD-YYYYMMDD (rango de fechas sin guiones)
  const codigoArchivo = `RPT-${desde.replace(/-/g, '')}-${hasta.replace(/-/g, '')}`

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      <title>{codigoArchivo}</title>
      {/* Barra de acciones */}
      <div
        id="print-actions"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: '#1a2744', padding: '10px 16px', gap: 12, flexWrap: 'wrap',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 50,
        }}
      >
        <span style={{ color: '#fff', fontFamily: 'Segoe UI, sans-serif', fontSize: 13, fontWeight: 600 }}>
          {visitas.length} reportes · {desde} → {hasta}
        </span>
        <PrintButton label="🖨 Imprimir / Guardar PDF" />
      </div>

      <div id="print-contenido" style={{ paddingTop: 56, overflowX: 'auto' }}>
        {visitas.map((v) => (
          <ReporteVisita key={v.codigo_visita} v={v} />
        ))}
      </div>

      <style>{`
        @media print {
          #print-actions { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          #print-contenido { padding-top: 0 !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  )
}

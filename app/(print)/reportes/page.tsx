import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'

interface PageProps {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}

export default async function PrintReportesMasivosPage({ searchParams }: PageProps) {
  const { desde, hasta } = await searchParams
  if (!desde || !hasta) notFound()

  const supabase = await createClient()
  const { data: visitas, error } = await supabase
    .from('visitas')
    .select('*')
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
          background: '#1a2744', padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 50,
        }}
      >
        <span style={{ color: '#fff', fontFamily: 'Segoe UI, sans-serif', fontSize: 13, fontWeight: 600 }}>
          {visitas.length} reportes · {desde} → {hasta}
        </span>
        <button
          id="btn-print"
          style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: '#fff', color: '#1a2744', fontSize: 13,
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          🖨 Imprimir / Guardar PDF
        </button>
      </div>

      <div style={{ paddingTop: 56 }}>
        {visitas.map((v) => (
          <ReporteVisita key={v.codigo_visita} v={v} />
        ))}
      </div>

      <style>{`
        @media print {
          #print-actions { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          div[style*="paddingTop"] { padding-top: 0 !important; }
        }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('btn-print').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  )
}

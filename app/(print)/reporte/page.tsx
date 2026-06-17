import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'

interface PageProps {
  searchParams: Promise<{ codigo?: string }>
}

export default async function PrintReportePage({ searchParams }: PageProps) {
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
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      {/* Barra de acciones — solo visible en pantalla */}
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
          {v.codigo_visita}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
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
      </div>

      {/* Reporte */}
      <div style={{ paddingTop: 56 }}>
        <ReporteVisita v={v} />
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

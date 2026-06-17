'use client'

import { useState, useRef, useEffect } from 'react'
import { fetchVisitaAction } from '@/actions/visitas'
import { ReporteVisita } from '@/components/reportes/ReporteVisita'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf: any
  }
}

interface Props {
  codigo: string
  onClose: () => void
}

export function ReporteWizardModal({ codigo, onClose }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visita, setVisita] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchVisitaAction(codigo).then(data => {
      setVisita(data)
      setLoading(false)
    })
  }, [codigo])

  const handlePrint = () => {
    // Inyectar estilo temporal que solo muestra el área del reporte
    const styleId = 'wizard-print-override'
    let style = document.getElementById(styleId) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }
    style.textContent = `
      @media print {
        body > * { visibility: hidden !important; }
        #wizard-print-area,
        #wizard-print-area * { visibility: visible !important; }
        #wizard-print-area {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          z-index: 99999;
        }
      }
    `
    window.print()
    // Limpiar después de imprimir
    const cleanup = () => { style?.remove(); window.removeEventListener('afterprint', cleanup) }
    window.addEventListener('afterprint', cleanup)
  }

  const handleDownload = async () => {
    if (!reportRef.current) return
    setDescargando(true)
    try {
      if (!window.html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          s.onload  = () => resolve()
          s.onerror = () => reject(new Error('No se pudo cargar html2pdf'))
          document.head.appendChild(s)
        })
      }
      await window.html2pdf().set({
        margin:      0,
        filename:    `reporte-${codigo}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(reportRef.current).save()
    } catch {
      alert('Error al generar el PDF. Usa el botón Imprimir en su lugar.')
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
           style={{ maxHeight: '92vh' }}>

        {/* Header del wizard */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: '#1a2744' }}>
          <div>
            <p className="text-white font-bold text-base">Reporte de Visita</p>
            <p className="text-blue-300 text-xs mt-0.5">{codigo}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-gray-400 text-sm">
            Cargando visita...
          </div>
        ) : !visita ? (
          <div className="flex-1 flex items-center justify-center py-20 text-red-500 text-sm">
            No se pudo cargar la visita.
          </div>
        ) : (
          <>
            {/* Vista previa del reporte — escalada para caber en el modal */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div
                style={{
                  transform: 'scale(0.65)',
                  transformOrigin: 'top center',
                  width: '154%',            /* compensa el scale(0.65): 100/0.65 ≈ 154 */
                  marginLeft: '-27%',
                  pointerEvents: 'none',
                }}
              >
                {/* Área de impresión — id usado por el CSS de print */}
                <div id="wizard-print-area">
                  <div ref={reportRef}>
                    <ReporteVisita v={visita} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del wizard con acciones */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
              <p className="text-xs text-gray-400">Elige cómo obtener este reporte</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={descargando}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
                >
                  {descargando ? 'Generando...' : '⬇ Descargar PDF'}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow transition-colors hover:opacity-90"
                  style={{ background: '#1a2744' }}
                >
                  🖨 Imprimir
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf: any
  }
}

interface Props {
  count: number
  filename: string
}

export function BulkReportWizard({ count, filename }: Props) {
  const [descargando, setDescargando] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    const pages = document.querySelectorAll<HTMLElement>('.reporte-pagina')
    if (!pages.length) {
      alert('No hay reportes para descargar.')
      return
    }
    setDescargando(true)
    try {
      if (!window.html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          s.onload  = () => resolve()
          s.onerror = () => reject(new Error('CDN error'))
          document.head.appendChild(s)
        })
      }
      // Clonar todas las páginas en un contenedor temporal
      const container = document.createElement('div')
      pages.forEach(p => container.appendChild(p.cloneNode(true)))

      await window.html2pdf().set({
        margin:      0,
        filename,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(container).save()
    } catch {
      alert('Error al generar el PDF. Usa Imprimir → Guardar como PDF.')
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{count}</span> reporte{count !== 1 ? 's' : ''} listos
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={descargando}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            {descargando ? 'Generando PDF...' : '⬇ Descargar PDF'}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
            style={{ background: '#1a2744' }}
          >
            🖨 Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}

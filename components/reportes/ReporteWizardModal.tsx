'use client'

import { useRef, useState } from 'react'

interface Props {
  codigo: string
  onClose: () => void
}

export function ReporteWizardModal({ codigo, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)

  const src = `/print/reporte?codigo=${encodeURIComponent(codigo)}`

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print()
  }

  const handleDownload = () => {
    // Abre en nueva pestaña para que el usuario guarde como PDF
    window.open(src, '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{ maxWidth: 760, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: '#1a2744' }}
        >
          <div>
            <p className="text-white font-bold text-base">Reporte de Visita</p>
            <p className="text-blue-300 text-xs mt-0.5">{codigo}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Vista previa via iframe */}
        <div className="relative flex-1 overflow-hidden bg-gray-100">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Cargando reporte…
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={src}
            title="Vista previa del reporte"
            onLoad={() => setLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: loaded ? 'block' : 'none',
            }}
          />
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <p className="text-xs text-gray-400">
            ¿Descargar? Usa <strong>Imprimir → Guardar como PDF</strong>
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              ↗ Abrir en nueva pestaña
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
              style={{ background: '#1a2744' }}
            >
              🖨 Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

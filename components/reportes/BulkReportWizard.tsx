'use client'

interface Props {
  count: number
  desde: string
  hasta: string
}

export function BulkReportWizard({ count, desde, hasta }: Props) {
  const handlePrint = () => window.print()

  const handleOpen = () => {
    window.open(
      `/reportes?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
      '_blank'
    )
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{count}</span>{' '}
          reporte{count !== 1 ? 's' : ''} listos para imprimir
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleOpen}
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
  )
}

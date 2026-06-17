'use client'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf: any
  }
}

interface Props {
  filename: string
  label?: string
}

export function ReportActionButtons({ filename, label }: Props) {
  const handlePrint = () => window.print()

  const handleDownload = async () => {
    if (!window.html2pdf) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        s.onload  = () => resolve()
        s.onerror = reject
        document.head.appendChild(s)
      })
    }

    const pages = document.querySelectorAll<HTMLElement>('.reporte-pagina')
    if (!pages.length) return

    const container = document.createElement('div')
    pages.forEach(el => container.appendChild(el.cloneNode(true)))

    await window.html2pdf().set({
      margin:      0,
      filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(container).save()
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-semibold text-gray-700 mr-1">{label}</span>}
      <button
        onClick={handleDownload}
        className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
      >
        ⬇ Descargar PDF
      </button>
      <button
        onClick={handlePrint}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow transition-colors"
        style={{ background: '#1a2744' }}
      >
        🖨 Imprimir
      </button>
    </div>
  )
}

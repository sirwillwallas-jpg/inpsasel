'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  desde?: string
  hasta?: string
  total: number
}

export function ReportesForm({ desde, hasta, total }: Props) {
  const router = useRouter()
  const [d, setD] = useState(desde ?? '')
  const [h, setH] = useState(hasta ?? '')

  const buscar = () => {
    if (d && h) router.push(`/visitas/reportes?desde=${d}&hasta=${h}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-xs text-gray-500 font-semibold">Desde</label>
      <input
        type="date" value={d} onChange={(e) => setD(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <label className="text-xs text-gray-500 font-semibold">Hasta</label>
      <input
        type="date" value={h} onChange={(e) => setH(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={buscar}
        disabled={!d || !h}
        className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: '#1a2744' }}
      >
        Buscar
      </button>
      {total > 0 && (
        <span className="text-xs text-gray-400">{total} visita{total !== 1 ? 's' : ''} encontradas</span>
      )}
    </div>
  )
}

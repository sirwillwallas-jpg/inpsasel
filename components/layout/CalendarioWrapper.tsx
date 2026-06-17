'use client'

import dynamic from 'next/dynamic'

type Visita = {
  codigo_visita: string
  fecha: string
  hora: string
  tipo_visita: string
  estatus: string
  motivo_visita: string | null
  funcionario: string | null
}

const CalendarioGrid = dynamic(
  () => import('@/components/layout/CalendarioGrid').then((m) => m.CalendarioGrid),
  { ssr: false, loading: () => <p className="text-gray-400 text-sm p-4">Cargando calendario...</p> }
)

export function CalendarioWrapper({ visitas }: { visitas: Visita[] }) {
  return <CalendarioGrid visitas={visitas} />
}

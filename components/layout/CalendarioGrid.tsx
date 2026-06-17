'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventDropArg, EventClickArg } from '@fullcalendar/core'
import { useState, useCallback } from 'react'
import { moverVisitaAction } from '@/actions/visitas'

type Visita = {
  codigo_visita: string
  fecha: string
  hora: string
  tipo_visita: string
  estatus: string
  motivo_visita: string | null
  funcionario: string | null
}

type Props = {
  visitas: Visita[]
}

const ESTATUS_COLOR: Record<string, string> = {
  'Planificada':   '#3b82f6',
  'En Curso':      '#eab308',
  'Completada':    '#22c55e',
  'Revisada':      '#a855f7',
  'Cancelada':     '#ef4444',
  'No Programada': '#9ca3af',
  'Emergencia':    '#f97316',
}

export function CalendarioGrid({ visitas }: Props) {
  const [detalle, setDetalle] = useState<Visita | null>(null)
  const [moviendo, setMoviendo] = useState(false)

  const eventos = visitas.map((v) => ({
    id:              v.codigo_visita,
    title:           v.codigo_visita,
    start:           `${v.fecha}T${v.hora}:00`,
    backgroundColor: ESTATUS_COLOR[v.estatus] ?? '#9ca3af',
    borderColor:     ESTATUS_COLOR[v.estatus] ?? '#9ca3af',
    textColor:       '#ffffff',
    extendedProps:   v,
  }))

  const onDrop = useCallback(async (info: EventDropArg) => {
    setMoviendo(true)
    const nuevaFecha = info.event.startStr.split('T')[0]
    const resultado  = await moverVisitaAction(info.event.id, nuevaFecha)
    if (resultado && 'error' in resultado) {
      alert(resultado.error)
      info.revert()
    }
    setMoviendo(false)
  }, [])

  const onClickEvento = useCallback((info: EventClickArg) => {
    setDetalle(info.event.extendedProps as Visita)
  }, [])

  return (
    <div className="space-y-4">
      {moviendo && (
        <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          Actualizando fecha...
        </div>
      )}

      {/* Calendario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 [&_.fc-toolbar-title]:text-lg [&_.fc-toolbar-title]:font-bold [&_.fc-button]:!bg-[#1a2744] [&_.fc-button]:!border-[#1a2744] [&_.fc-button-active]:!bg-[#0f1c36] [&_.fc-day-today]:!bg-blue-50 [&_.fc-event]:cursor-grab [&_.fc-event]:rounded-lg [&_.fc-event]:text-xs [&_.fc-event]:px-1">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          firstDay={1}
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek',
          }}
          buttonText={{
            today:        'Hoy',
            month:        'Mes',
            week:         'Semana',
          }}
          events={eventos}
          editable={true}
          droppable={true}
          eventDrop={onDrop}
          eventClick={onClickEvento}
          height="auto"
          dayMaxEvents={3}
          moreLinkText={(n: number) => `+${n} más`}
        />
      </div>

      {/* Panel de detalle al hacer click */}
      {detalle && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ background: '#1a2744' }}
          >
            <span className="text-sm font-semibold text-white">{detalle.codigo_visita}</span>
            <button
              onClick={() => setDetalle(null)}
              className="text-white/60 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
            <Info label="Fecha"       value={detalle.fecha} />
            <Info label="Hora"        value={detalle.hora} />
            <Info label="Tipo"        value={detalle.tipo_visita} />
            <Info label="Estatus"     value={detalle.estatus} />
            {detalle.funcionario  && <Info label="Funcionario"  value={detalle.funcionario} />}
            {detalle.motivo_visita && (
              <div className="col-span-2">
                <Info label="Motivo" value={detalle.motivo_visita} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(ESTATUS_COLOR).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}

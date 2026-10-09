'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventDropArg, EventClickArg } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es'
import { useState, useCallback } from 'react'
import { moverVisitaAction } from '@/actions/visitas'
import { ReporteWizardModal } from '@/components/reportes/ReporteWizardModal'

// Acepta todos los campos de la tabla para poder renderizar el reporte completo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Visita = Record<string, any> & {
  codigo_visita: string
  fecha: string
  hora: string
  tipo_visita: string
  estatus: string
  motivo_visita?: string | null
  funcionario?: string | null
}

type Props = { visitas: Visita[]; puedeMover: boolean }

const ESTATUS_COLOR: Record<string, string> = {
  'Planificada':   '#3b82f6',
  'En Curso':      '#eab308',
  'Completada':    '#22c55e',
  'Revisada':      '#a855f7',
  'Cancelada':     '#ef4444',
  'No Programada': '#9ca3af',
  'Emergencia':    '#f97316',
}

export function CalendarioGrid({ visitas: visitasIniciales, puedeMover }: Props) {
  // Copia local para reflejar los cambios de fecha tras arrastrar sin recargar la página
  const [visitas, setVisitas]           = useState(visitasIniciales)
  const [detalle, setDetalle]           = useState<Visita | null>(null)
  const [moviendo, setMoviendo]         = useState(false)
  const [wizardCodigo, setWizardCodigo] = useState<string | null>(null)
  const [filtro, setFiltro]             = useState('')

  const visitasFiltradas = filtro.trim()
    ? visitas.filter((v) =>
        String(v.contactos?.cedula_rif ?? '').includes(filtro.trim())
      )
    : visitas

  const eventos = visitasFiltradas.map((v) => ({
    id:              v.codigo_visita,
    title:           `${v.hora?.slice(0, 5)} ${v.tipo_visita}`,
    start:           v.fecha,
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
    } else {
      setVisitas((prev) =>
        prev.map((v) => (v.codigo_visita === info.event.id ? { ...v, fecha: nuevaFecha } : v))
      )
      setDetalle((d) => (d && d.codigo_visita === info.event.id ? { ...d, fecha: nuevaFecha } : d))
    }
    setMoviendo(false)
  }, [])

  const onClickEvento = useCallback((info: EventClickArg) => {
    setDetalle(info.event.extendedProps as Visita)
  }, [])

  return (
    <div className="space-y-4">
      {/* Buscador por código de visita */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 sm:max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-sm">
            🔍
          </span>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por cédula (ej. 12345678)"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
        </div>
        {filtro && (
          <button
            onClick={() => setFiltro('')}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            Limpiar
          </button>
        )}
        {filtro && (
          <span className="text-xs text-gray-400">
            {visitasFiltradas.length} resultado{visitasFiltradas.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {moviendo && (
        <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          Actualizando fecha…
        </div>
      )}

      <div className="calendario-visitas bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4 overflow-x-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          firstDay={1}
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
          events={eventos}
          editable={puedeMover}
          eventDurationEditable={false}
          eventDrop={onDrop}
          eventClick={onClickEvento}
          height="auto"
          dayMaxEvents={3}
          moreLinkText={(n: number) => `+${n} más`}
        />
      </div>

      {/* Panel de detalle */}
      {detalle && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#1a2744' }}>
            <span className="text-sm font-semibold text-white">{detalle.codigo_visita}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWizardCodigo(detalle.codigo_visita)}
                className="text-xs text-blue-300 hover:text-white font-semibold underline"
              >
                Ver Reporte
              </button>
              <button onClick={() => setDetalle(null)} className="text-white/60 hover:text-white text-lg leading-none">×</button>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {detalle.contactos?.nombre_completo && (
              <Info label="Visitante" value={detalle.contactos.nombre_completo} />
            )}
            {detalle.contactos?.cedula_rif && <Info label="Cédula / RIF" value={detalle.contactos.cedula_rif} />}
            <Info label="Fecha"    value={detalle.fecha} />
            <Info label="Hora"     value={detalle.hora?.slice(0, 5)} />
            <Info label="Tipo"     value={detalle.tipo_visita} />
            <Info label="Estatus"  value={detalle.estatus} />
            {detalle.funcionario   && <Info label="Funcionario"  value={detalle.funcionario} />}
            {detalle.motivo_visita && (
              <div className="sm:col-span-2"><Info label="Motivo" value={detalle.motivo_visita} /></div>
            )}
          </div>
          <div className="px-5 pb-4">
            <button
              onClick={() => setWizardCodigo(detalle.codigo_visita)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white shadow transition-colors hover:opacity-90"
              style={{ background: '#1a2744' }}
            >
              📄 Ver Reporte / Descargar PDF
            </button>
          </div>
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(ESTATUS_COLOR).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Wizard modal */}
      {wizardCodigo && (
        <ReporteWizardModal
          codigo={wizardCodigo}
          onClose={() => setWizardCodigo(null)}
        />
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 mt-0.5 break-words">{value || '—'}</p>
    </div>
  )
}

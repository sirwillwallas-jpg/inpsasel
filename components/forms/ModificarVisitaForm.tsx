'use client'

import { useActionState, useState } from 'react'
import { modificarVisitaAction } from '@/actions/visitas'
import {
  TIPOS_VISITA,
  ESTATUS_VISITA,
  FUNCIONES_VISITA,
  COORDINACIONES_VISITA,
} from '@/lib/validations/visita.schema'
import type { Database } from '@/types/database'

type VisitaRow = Database['public']['Tables']['visitas']['Row']

const MUNICIPIOS_PORTUGUESA = [
  'Agua Blanca', 'Araure', 'Esteller', 'Guanare', 'Guanarito',
  'Monseñor José Vicente de Unda', 'Ospino', 'Páez', 'Papelón',
  'San Genaro de Boconoíto', 'San Rafael de Onoto', 'Santa Rosalía',
  'Sucre', 'Turén',
] as const

export function ModificarVisitaForm({ visita }: { visita: VisitaRow }) {
  const [state, action, isPending] = useActionState(modificarVisitaAction, null)

  const [mostrarObservaciones, setMostrarObservaciones] = useState(
    Boolean(visita.observaciones)
  )

  return (
    <form action={action} className="card space-y-6">
      <input type="hidden" name="codigo_visita" value={visita.codigo_visita} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{visita.codigo_visita}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Editando campos modificables</p>
        </div>
        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
          {visita.estatus}
        </span>
      </div>

      {/* ── Datos de la Visita ─────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Datos de la Visita
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha"           name="fecha" type="date" required defaultValue={visita.fecha} />
          <Field label="Hora de Ingreso" name="hora"  type="time" required defaultValue={visita.hora?.slice(0, 5)} />
        </div>
      </fieldset>

      {/* ── Datos del Visitante ────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Datos del Visitante
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Field
            label="Nombre Completo" name="funcionario"
            placeholder="Ej. Juan Pérez"
            defaultValue={visita.funcionario ?? ''}
          />
          <SelectField label="Sexo" name="sexo" defaultValue={visita.sexo ?? ''}>
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </SelectField>

          <Field
            label="Edad" name="edad" type="number"
            placeholder="Edad"
            defaultValue={visita.edad != null ? String(visita.edad) : ''}
          />
          <Field
            label="Motivo de Visita" name="motivo_visita"
            placeholder="Ej. Declaración de Accidentes"
            defaultValue={visita.motivo_visita ?? ''}
          />

          <Field
            label="Cédula / RIF" name="id_contacto" type="number" required
            placeholder="Cédula de Identidad"
            defaultValue={visita.id_contacto != null ? String(visita.id_contacto) : ''}
          />
          {/* telefono_contacto no está en visitas.Row — campo visual sin persistencia directa */}
          <Field label="Teléfono" name="telefono_contacto" placeholder="Ej. +58 412..." />

          <SelectField label="Municipio" name="municipio" defaultValue={visita.municipio ?? ''}>
            <option value="">Seleccionar...</option>
            {MUNICIPIOS_PORTUGUESA.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </SelectField>
          <SelectField label="Sector" name="sector" defaultValue={visita.sector ?? ''}>
            <option value="">Seleccionar...</option>
            <option value="Público">Público</option>
            <option value="Privado">Privado</option>
          </SelectField>

          <Field
            label="Entidad" name="actividad_economica"
            placeholder="Ej. Empresa XYZ"
            defaultValue={visita.actividad_economica ?? ''}
          />
          <Field
            label="Cargo" name="cargo"
            placeholder="Ej. Gerente de Ventas"
            defaultValue={visita.cargo ?? ''}
          />

          <SelectField label="Función" name="funcion" defaultValue={visita.funcion ?? ''}>
            <option value="">Seleccionar...</option>
            {FUNCIONES_VISITA.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </SelectField>
          <Field
            label="Actividad Económica" name="actividad_economica_desc"
            placeholder="Ej. Industria"
          />

          <SelectField label="Estatus de la Solicitud" name="estatus" required defaultValue={visita.estatus}>
            <option value="">Seleccionar...</option>
            {ESTATUS_VISITA.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </SelectField>
          <SelectField label="Coordinación Referida" name="cordinacion_referida" defaultValue={visita.cordinacion_referida ?? ''}>
            <option value="">Seleccionar...</option>
            {COORDINACIONES_VISITA.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectField>

        </div>

        <SelectField label="Tipo de Visita" name="tipo_visita" required defaultValue={visita.tipo_visita}>
          <option value="">Seleccionar...</option>
          {TIPOS_VISITA.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </SelectField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Funcionario" name="funcionario_nombre" placeholder="Nombre del funcionario" />
        </div>
      </fieldset>

      {/* ── Observaciones ──────────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
          <input
            type="checkbox"
            checked={mostrarObservaciones}
            onChange={(e) => setMostrarObservaciones(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700">Observaciones</span>
        </label>
        {mostrarObservaciones && (
          <textarea
            name="observaciones"
            rows={3}
            defaultValue={visita.observaciones ?? ''}
            placeholder="Escribe las observaciones aquí..."
            className="input-field resize-none"
          />
        )}
      </div>

      {/* ── Estado ─────────────────────────────────────────── */}
      {state && 'error' in state && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state && 'success' in state && (
        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {state.success}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full py-3 text-base font-bold">
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}

/* ── Componentes auxiliares ──────────────────────────────── */

function Field({
  label, name, type = 'text', required = false,
  placeholder = '', defaultValue = '',
}: {
  label: string; name: string; type?: string
  required?: boolean; placeholder?: string; defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name} name={name} type={type} required={required}
        placeholder={placeholder} defaultValue={defaultValue}
        className="input-field"
      />
    </div>
  )
}

function SelectField({
  label, name, required = false, defaultValue = '', children,
}: {
  label: string; name: string; required?: boolean
  defaultValue?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select id={name} name={name} required={required} defaultValue={defaultValue} className="input-field">
        {children}
      </select>
    </div>
  )
}

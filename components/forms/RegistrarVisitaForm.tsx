'use client'

import { useActionState, useState } from 'react'
import { registrarVisitaAction } from '@/actions/visitas'
import {
  TIPOS_VISITA,
  ESTATUS_VISITA,
  FUNCIONES_VISITA,
  COORDINACIONES_VISITA,
} from '@/lib/validations/visita.schema'

const MUNICIPIOS_PORTUGUESA = [
  'Agua Blanca',
  'Araure',
  'Esteller',
  'Guanare',
  'Guanarito',
  'Monseñor José Vicente de Unda',
  'Ospino',
  'Páez',
  'Papelón',
  'San Genaro de Boconoíto',
  'San Rafael de Onoto',
  'Santa Rosalía',
  'Sucre',
  'Turén',
] as const

export function RegistrarVisitaForm() {
  const [state, action, isPending] = useActionState(registrarVisitaAction, null)
  const [mostrarObservaciones, setMostrarObservaciones] = useState(false)
  const [mostrarCodigoOT, setMostrarCodigoOT]           = useState(false)

  return (
    <form action={action} className="card space-y-6">

      {/* ── Datos de la Visita ───────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Datos de la Visita
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha" name="fecha" type="date" required />
          <Field label="Hora de Ingreso" name="hora" type="time" required />
        </div>
      </fieldset>

      {/* ── Datos del Visitante ──────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Datos del Visitante
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Nombre Completo | Sexo */}
          <Field
            label="Nombre Completo"
            name="funcionario"
            placeholder="Ej. Juan Pérez"
          />
          <SelectField label="Sexo" name="sexo">
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </SelectField>

          {/* Edad | Motivo de Visita */}
          <Field
            label="Edad"
            name="edad"
            type="number"
            placeholder="Edad"
          />
          <Field
            label="Motivo de Visita"
            name="motivo_visita"
            placeholder="Ej. Declaracion de Accidentes"
          />

          {/* Cédula / RIF | Teléfono */}
          <Field
            label="Cédula / RIF"
            name="id_contacto"
            type="number"
            required
            placeholder="Cédula de Identidad"
          />
          <Field
            label="Teléfono"
            name="telefono_contacto"
            placeholder="Ej. +58 412..."
          />

          {/* Municipio | Sector */}
          <SelectField label="Municipio" name="municipio">
            <option value="">Seleccionar...</option>
            {MUNICIPIOS_PORTUGUESA.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </SelectField>
          <SelectField label="Sector" name="sector">
            <option value="">Seleccionar...</option>
            <option value="Público">Público</option>
            <option value="Privado">Privado</option>
          </SelectField>

          {/* Entidad | Cargo */}
          <Field
            label="Entidad"
            name="actividad_economica"
            placeholder="Ej. Empresa XYZ"
          />
          <Field
            label="Cargo"
            name="cargo"
            placeholder="Ej. Gerente de Ventas"
          />

          {/* Función | Actividad Económica */}
          <SelectField label="Función" name="funcion">
            <option value="">Seleccionar...</option>
            {FUNCIONES_VISITA.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </SelectField>
          <Field
            label="Actividad Económica"
            name="actividad_economica_desc"
            placeholder="Ej. Industria"
          />

          {/* Estatus de la Solicitud | Coordinación Referida */}
          <SelectField label="Estatus de la Solicitud" name="estatus" required>
            <option value="">Seleccionar...</option>
            {ESTATUS_VISITA.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </SelectField>
          <SelectField label="Coordinación Referida" name="cordinacion_referida">
            <option value="">Seleccionar...</option>
            {COORDINACIONES_VISITA.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectField>

        </div>

        {/* Tipo de Visita — fila completa */}
        <SelectField label="Tipo de Visita" name="tipo_visita" required>
          <option value="">Seleccionar...</option>
          {TIPOS_VISITA.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </SelectField>

        {/* Funcionario — mitad del ancho */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Funcionario"
            name="funcionario_nombre"
            placeholder="Nombre del funcionario"
          />
        </div>

      </fieldset>

      {/* ── Añadir Observaciones ─────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
          <input
            type="checkbox"
            checked={mostrarObservaciones}
            onChange={(e) => setMostrarObservaciones(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700">Añadir Observaciones</span>
        </label>
        {mostrarObservaciones && (
          <textarea
            name="observaciones"
            rows={3}
            placeholder="Escribe las observaciones aquí..."
            className="input-field resize-none"
          />
        )}
      </div>

      {/* ── Añadir Código OT ─────────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
          <input
            type="checkbox"
            checked={mostrarCodigoOT}
            onChange={(e) => setMostrarCodigoOT(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700">Añadir Código OT</span>
        </label>
        {mostrarCodigoOT && (
          <Field
            label="Código OT"
            name="codigo_ot"
            placeholder="Ej. OT-2024-001"
          />
        )}
      </div>

      {/* ── Mensajes de estado ───────────────────────────────── */}
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

      {/* ── Botón ────────────────────────────────────────────── */}
      <button type="submit" disabled={isPending} className="btn-primary w-full py-3 text-base font-bold">
        {isPending ? 'Registrando...' : 'Registrar Visita'}
      </button>

    </form>
  )
}

/* ── Componentes auxiliares ──────────────────────────────── */

function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  )
}

function SelectField({
  label,
  name,
  required = false,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select id={name} name={name} required={required} className="input-field">
        {children}
      </select>
    </div>
  )
}
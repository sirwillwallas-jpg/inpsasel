import { z } from 'zod'

export const TIPOS_VISITA = [
  'Técnica', 'Comercial', 'Soporte', 'Inspección',
  'Personal', 'Administrativa', 'Consulta',
] as const

export const ESTATUS_VISITA = [
  'Planificada', 'En Curso', 'Completada', 'Revisada',
  'Cancelada', 'No Programada', 'Emergencia',
] as const

export const FUNCIONES_VISITA = [
  'Delegado de Prevención',
  'Comité de Seguridad y Salud Laboral',
  'Servicio de Salud',
  'Trabajador',
  'Otro',
] as const

export const COORDINACIONES_VISITA = [
  'Inspecciones',
  'Educación',
  'Sanciones',
  'Salud laboral',
  'Psicosocial',
  'Epidemiología',
] as const

/** Convierte '' (input vacío) en null para que el campo se guarde/limpie como NULL. */
const vacioANull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v

const textoOpcional = z.preprocess(
  vacioANull,
  z.string().trim().nullable().optional()
)

export const registrarVisitaSchema = z.object({
  fecha:                z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  hora:                 z.preprocess((v) => typeof v === 'string' ? v.slice(0, 5) : v, z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM')),
  tipo_visita:          z.enum(TIPOS_VISITA, { errorMap: () => ({ message: 'Seleccione el tipo de visita' }) }),
  estatus:              z.enum(ESTATUS_VISITA, { errorMap: () => ({ message: 'Seleccione el estatus' }) }),
  cedula_rif:           z.string().trim().min(1, 'La cédula/RIF es requerida').max(20, 'La cédula/RIF admite máximo 20 caracteres'),
  nombre_completo:      textoOpcional,
  telefono:             z.preprocess(vacioANull, z.string().trim().max(20, 'El teléfono admite máximo 20 caracteres').nullable().optional()),
  nombre_entidad:       textoOpcional,
  cordinacion_referida: textoOpcional,
  observaciones:        textoOpcional,
  motivo_visita:        textoOpcional,
  sexo:                 textoOpcional,
  edad:                 z.preprocess(
    vacioANull,
    z.coerce.number({ invalid_type_error: 'La edad debe ser un número' })
      .int('La edad debe ser un número entero')
      .min(1, 'La edad debe ser mayor que 0')
      .max(120, 'La edad no es válida')
      .nullable()
      .optional()
  ),
  municipio:            textoOpcional,
  sector:               textoOpcional,
  cargo:                textoOpcional,
  funcion:              textoOpcional,
  actividad_economica:  textoOpcional,
  funcionario:          textoOpcional,
  codigo_ot:            z.preprocess(vacioANull, z.string().trim().max(20, 'El código OT admite máximo 20 caracteres').nullable().optional()),
})

export type RegistrarVisitaInput = z.infer<typeof registrarVisitaSchema>

export const eliminarVisitaSchema = z.object({
  codigo_visita: z.string().min(1, 'El código de visita es requerido').trim(),
})

export const buscarVisitaSchema = z.object({
  codigo_visita: z.string().min(1, 'El código de visita es requerido').trim(),
})

export const modificarVisitaSchema = registrarVisitaSchema.extend({
  codigo_visita: z.string().min(1).trim(),
})

export type ModificarVisitaInput = z.infer<typeof modificarVisitaSchema>

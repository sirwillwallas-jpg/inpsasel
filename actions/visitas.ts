'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { userCanManageVisits } from '@/lib/auth/permissions'
import { esFechaValida } from '@/lib/fecha'
import {
  registrarVisitaSchema,
  eliminarVisitaSchema,
  modificarVisitaSchema,
} from '@/lib/validations/visita.schema'

export type ActionState = { error: string } | { success: string } | null

type SupabaseServer = Awaited<ReturnType<typeof createClient>>

/** Código de error de Postgres para violación de restricción UNIQUE. */
const PG_UNIQUE_VIOLATION = '23505'
const MAX_REINTENTOS_CODIGO = 5

function revalidarVistasVisitas() {
  revalidatePath('/visitas/hoy')
  revalidatePath('/visitas/calendario')
}

/** Genera un codigo unico: VIS-YYYYMMDD-NNN. El contador se basa en el maximo existente. */
async function generarCodigoVisita(
  supabase: SupabaseServer,
  fecha: string
): Promise<string> {
  const fechaStr = fecha.replace(/-/g, '')
  const prefijo  = `VIS-${fechaStr}-`

  const { data } = await supabase
    .from('visitas')
    .select('codigo_visita')
    .like('codigo_visita', `${prefijo}%`)
    .order('codigo_visita', { ascending: false })
    .limit(1)

  let siguiente = 1
  if (data && data.length > 0) {
    const sufijo = parseInt(data[0].codigo_visita.replace(prefijo, ''), 10)
    if (!isNaN(sufijo)) siguiente = sufijo + 1
  }

  return `${prefijo}${String(siguiente).padStart(3, '0')}`
}

async function upsertContacto(
  supabase: SupabaseServer,
  c: {
    cedula_rif: string
    nombre_completo?: string | null
    telefono?: string | null
    nombre_entidad?: string | null
  }
): Promise<number | null> {
  const { data, error } = await supabase
    .from('contactos')
    .upsert({
      cedula_rif: c.cedula_rif,
      nombre_completo: c.nombre_completo ?? null,
      telefono: c.telefono ?? null,
      nombre_entidad: c.nombre_entidad || 'No especificada',
      tipo_contacto: 'Individual',
    }, { onConflict: 'cedula_rif' })
    .select('id_contacto')
    .single()

  if (error || !data) {
    console.error('upsertContacto:', error?.message)
    return null
  }

  return data.id_contacto
}

/**
 * Devuelve el id de la orden de trabajo con ese código, creándola si no existe.
 * `undefined` → el campo no vino en el formulario (no tocar id_orden).
 * `null`      → el campo vino vacío (desvincular la orden).
 */
async function resolverOrden(
  supabase: SupabaseServer,
  codigoOt: string | null | undefined
): Promise<{ id_orden?: number | null } | { error: string }> {
  if (codigoOt === undefined) return {}
  if (codigoOt === null) return { id_orden: null }

  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .upsert({ codigo_ot: codigoOt }, { onConflict: 'codigo_ot' })
    .select('id_orden')
    .single()

  if (error || !data) {
    console.error('resolverOrden:', error?.message)
    return { error: 'No se pudo guardar el código OT.' }
  }

  return { id_orden: data.id_orden }
}

export async function registrarVisitaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = Object.fromEntries(formData.entries())
  const parsed = registrarVisitaSchema.safeParse(raw)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Datos invalidos'
    return { error: firstError }
  }

  const idUsuario = user.user_metadata?.id_usuario
    ? Number(user.user_metadata.id_usuario)
    : null

  const {
    cedula_rif,
    nombre_completo,
    telefono,
    nombre_entidad,
    codigo_ot,
    ...visitaData
  } = parsed.data

  const id_contacto = await upsertContacto(supabase, {
    cedula_rif,
    nombre_completo,
    telefono,
    nombre_entidad,
  })

  if (!id_contacto) {
    return { error: 'No se pudo guardar el contacto del visitante.' }
  }

  const orden = await resolverOrden(supabase, codigo_ot)
  if ('error' in orden) return orden

  // Reintenta si otro registro simultáneo tomó el mismo código (UNIQUE en codigo_visita).
  for (let intento = 0; intento < MAX_REINTENTOS_CODIGO; intento++) {
    const codigo_visita = await generarCodigoVisita(supabase, visitaData.fecha)

    const { error } = await supabase.from('visitas').insert({
      ...visitaData,
      ...orden,
      codigo_visita,
      id_contacto,
      id_usuario: idUsuario,
    })

    if (!error) {
      revalidarVistasVisitas()
      return { success: `Visita ${codigo_visita} registrada correctamente.` }
    }

    if (error.code !== PG_UNIQUE_VIOLATION) {
      console.error('registrarVisita:', error.message)
      return { error: 'No se pudo registrar la visita.' }
    }
  }

  return { error: 'No se pudo generar un código de visita único. Intente de nuevo.' }
}

export async function eliminarVisitaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roleName = (user.user_metadata?.roleName as string) ?? ''
  if (!userCanManageVisits(roleName)) {
    return { error: 'No tiene permisos para eliminar visitas.' }
  }

  const parsed = eliminarVisitaSchema.safeParse({
    codigo_visita: formData.get('codigo_visita'),
  })

  if (!parsed.success) {
    return { error: 'Codigo de visita invalido.' }
  }

  const { data, error } = await supabase
    .from('visitas')
    .delete()
    .eq('codigo_visita', parsed.data.codigo_visita)
    .select('codigo_visita')

  if (error) {
    console.error('eliminarVisita:', error.message)
    return { error: 'No se pudo eliminar la visita.' }
  }

  if (!data || data.length === 0) {
    return { error: `No existe ninguna visita con código "${parsed.data.codigo_visita}".` }
  }

  revalidarVistasVisitas()
  return { success: `Visita ${parsed.data.codigo_visita} eliminada correctamente.` }
}

export async function modificarVisitaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roleName = (user.user_metadata?.roleName as string) ?? ''
  if (!userCanManageVisits(roleName)) {
    return { error: 'No tiene permisos para modificar visitas.' }
  }

  const raw = Object.fromEntries(formData.entries())
  const parsed = modificarVisitaSchema.safeParse(raw)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Datos invalidos'
    return { error: firstError }
  }

  const {
    codigo_visita,
    cedula_rif,
    nombre_completo,
    telefono,
    nombre_entidad,
    codigo_ot,
    ...visitaData
  } = parsed.data

  const id_contacto = await upsertContacto(supabase, {
    cedula_rif,
    nombre_completo,
    telefono,
    nombre_entidad,
  })

  if (!id_contacto) {
    return { error: 'No se pudo guardar el contacto del visitante.' }
  }

  const orden = await resolverOrden(supabase, codigo_ot)
  if ('error' in orden) return orden

  const { data, error } = await supabase
    .from('visitas')
    .update({
      ...visitaData,
      ...orden,
      id_contacto,
    })
    .eq('codigo_visita', codigo_visita)
    .select('codigo_visita')

  if (error) {
    console.error('modificarVisita:', error.message)
    return { error: 'No se pudo modificar la visita.' }
  }

  if (!data || data.length === 0) {
    return { error: `No existe ninguna visita con código "${codigo_visita}".` }
  }

  revalidarVistasVisitas()
  return { success: `Visita ${codigo_visita} actualizada correctamente.` }
}

export async function moverVisitaAction(
  codigoVisita: string,
  nuevaFecha: string
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const roleName = (user.user_metadata?.roleName as string) ?? ''
  if (!userCanManageVisits(roleName)) {
    return { error: 'No tiene permisos para mover visitas.' }
  }

  if (!esFechaValida(nuevaFecha)) {
    return { error: 'Fecha inválida.' }
  }

  const { data, error } = await supabase
    .from('visitas')
    .update({ fecha: nuevaFecha })
    .eq('codigo_visita', codigoVisita)
    .select('codigo_visita')

  if (error) {
    console.error('moverVisita:', error.message)
    return { error: 'No se pudo mover la visita.' }
  }

  if (!data || data.length === 0) {
    return { error: 'La visita ya no existe.' }
  }

  revalidarVistasVisitas()
  return { success: `Visita movida al ${nuevaFecha}.` }
}

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { userCanManageVisits } from '@/lib/auth/permissions'
import {
  registrarVisitaSchema,
  eliminarVisitaSchema,
  modificarVisitaSchema,
} from '@/lib/validations/visita.schema'

export type ActionState = { error: string } | { success: string } | null

/** Genera un codigo unico: VIS-YYYYMMDD-NNN. El contador se basa en el maximo existente. */
async function generarCodigoVisita(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  c: {
    cedula_rif: string
    nombre_completo?: string
    telefono?: string
    nombre_entidad?: string
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

  return data.id_contacto as number
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

  const codigo_visita = await generarCodigoVisita(supabase, visitaData.fecha)

  const { error } = await supabase.from('visitas').insert({
    ...visitaData,
    codigo_visita,
    id_contacto,
    id_usuario: idUsuario,
  })

  if (error) {
    console.error('registrarVisita:', error.message)
    return { error: error.message }
  }

  revalidatePath('/visitas/hoy')
  revalidatePath('/visitas/calendario')
  return { success: `Visita ${codigo_visita} registrada correctamente.` }
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

  const { error } = await supabase
    .from('visitas')
    .delete()
    .eq('codigo_visita', parsed.data.codigo_visita)

  if (error) {
    return { error: 'No se pudo eliminar la visita.' }
  }

  revalidatePath('/visitas/hoy')
  redirect('/menu')
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

  const { error } = await supabase
    .from('visitas')
    .update({
      ...visitaData,
      id_contacto,
    })
    .eq('codigo_visita', codigo_visita)

  if (error) {
    console.error('modificarVisita:', error.message)
    return { error: 'No se pudo modificar la visita.' }
  }

  revalidatePath('/visitas/hoy')
  return { success: `Visita ${codigo_visita} actualizada correctamente.` }
}

export async function moverVisitaAction(
  codigoVisita: string,
  nuevaFecha: string
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('visitas')
    .update({ fecha: nuevaFecha })
    .eq('codigo_visita', codigoVisita)

  if (error) return { error: error.message }

  revalidatePath('/visitas/calendario')
  return { success: `Visita movida al ${nuevaFecha}.` }
}

export async function fetchVisitaAction(codigoVisita: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('visitas')
    .select('*, contactos(*)')
    .eq('codigo_visita', codigoVisita.trim())
    .single()
  return data ?? null
}

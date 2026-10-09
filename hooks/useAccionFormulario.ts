'use client'

import { useActionState, useRef, startTransition, type FormEvent } from 'react'

export type Estado = { error: string } | { success: string } | null

/**
 * Envuelve una Server Action para usarla con `onSubmit` en lugar de `<form action>`.
 *
 * En React 19 `<form action={...}>` resetea los campos no controlados al terminar la acción,
 * lo que borra lo que el usuario escribió cuando hay un error de validación y, en formularios
 * de edición, vuelve a mostrar los valores viejos tras guardar. Aquí el formulario solo se
 * limpia si `resetEnExito` es true y la acción devolvió `success`.
 */
export function useAccionFormulario(
  accion: (prev: Estado, formData: FormData) => Promise<Estado>,
  opciones: { resetEnExito?: boolean; confirmar?: (fd: FormData) => boolean } = {}
) {
  const formRef = useRef<HTMLFormElement>(null)

  const [state, dispatch, isPending] = useActionState(
    async (prev: Estado, formData: FormData): Promise<Estado> => {
      const resultado = await accion(prev, formData)
      if (opciones.resetEnExito && resultado && 'success' in resultado) {
        formRef.current?.reset()
      }
      return resultado
    },
    null
  )

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (opciones.confirmar && !opciones.confirmar(formData)) return
    startTransition(() => dispatch(formData))
  }

  return { state, isPending, formRef, onSubmit }
}

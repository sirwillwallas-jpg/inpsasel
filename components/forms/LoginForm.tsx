'use client'

import { useAccionFormulario } from '@/hooks/useAccionFormulario'
import { loginAction } from '@/actions/auth'

export function LoginForm({ next }: { next?: string }) {
  const { state, isPending, onSubmit } = useAccionFormulario(loginAction)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="input-field"
          placeholder="Ingresa tu usuario"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      {state && 'error' in state && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}

/** Zona horaria de la sede (Portuguesa, Venezuela). */
export const ZONA_HORARIA = 'America/Caracas'

/**
 * Fecha actual en formato YYYY-MM-DD según la hora de Venezuela.
 * `new Date().toISOString()` usa UTC y a partir de las 20:00 (UTC-4) devuelve el día siguiente.
 */
export function hoyLocal(): string {
  // 'en-CA' formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Valida que un string sea una fecha real con formato YYYY-MM-DD. */
export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false
  const d = new Date(`${fecha}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(fecha)
}

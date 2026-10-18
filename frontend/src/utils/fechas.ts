const UN_DIA_MS = 24 * 60 * 60 * 1000

/** Fecha de hoy como "YYYY-MM-DD" en hora local (toISOString usa UTC). */
export function hoyLocalYmd(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/** Convierte "YYYY-MM-DD" a la medianoche local de ese día. */
export function ymdAFecha(ymd: string): Date {
  return new Date(`${ymd}T00:00:00`)
}

export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-PY')
}

export type EstadoEntrega = 'vencido' | 'falta-poco' | 'a-tiempo'

export function estadoEntrega(timestampEntrega: number): EstadoEntrega {
  const hoy = ymdAFecha(hoyLocalYmd()).getTime()
  if (timestampEntrega < hoy) return 'vencido'
  if (timestampEntrega - Date.now() <= UN_DIA_MS) return 'falta-poco'
  return 'a-tiempo'
}

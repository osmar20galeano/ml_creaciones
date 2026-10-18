/** Fecha de hoy como "YYYY-MM-DD" en hora local (toISOString usa UTC). */
export function hoyLocalYmd(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/** "2026-10-25" → "25/10/2026" */
export function formatearYmd(ymd: string): string {
  const [anio, mes, dia] = ymd.split('-')
  return `${dia}/${mes}/${anio}`
}

/** Fecha que guarda SQLite ("YYYY-MM-DD HH:MM:SS", en UTC) mostrada en hora local. */
export function formatearFechaHoraBd(valor: string): string {
  const fecha = new Date(`${valor.replace(' ', 'T')}Z`)
  return fecha.toLocaleString('es-PY', { dateStyle: 'short', timeStyle: 'short' })
}

export type Urgencia = 'vencido' | 'hoy' | 'manana' | 'a-tiempo'

/** Qué tan cerca está la fecha de entrega, para destacar pedidos urgentes. */
export function urgenciaEntrega(fechaEntrega: string): Urgencia {
  const hoy = hoyLocalYmd()
  if (fechaEntrega < hoy) return 'vencido'
  if (fechaEntrega === hoy) return 'hoy'
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const mananaYmd = `${manana.getFullYear()}-${String(manana.getMonth() + 1).padStart(2, '0')}-${String(manana.getDate()).padStart(2, '0')}`
  return fechaEntrega === mananaYmd ? 'manana' : 'a-tiempo'
}

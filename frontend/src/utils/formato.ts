export function formatearGuaranies(valor: number): string {
  return `${(Number.isFinite(valor) ? valor : 0).toLocaleString('es-PY')} ₲`
}

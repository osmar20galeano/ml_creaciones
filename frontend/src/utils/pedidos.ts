import type { EstadoPedido, Pedido } from '../types'

export const ESTADOS: Record<EstadoPedido, { etiqueta: string; color: string; icono: string }> = {
  pendiente: { etiqueta: 'Pendiente', color: 'bg-secondary', icono: 'bi-hourglass-split' },
  en_preparacion: { etiqueta: 'En preparación', color: 'bg-info text-dark', icono: 'bi-scissors' },
  listo: { etiqueta: 'Listo', color: 'bg-warning text-dark', icono: 'bi-gift' },
  entregado: { etiqueta: 'Entregado', color: 'bg-success', icono: 'bi-check-circle' },
  cancelado: { etiqueta: 'Cancelado', color: 'bg-danger', icono: 'bi-x-circle' },
}

/** Siguiente paso natural del pedido (null si ya terminó). */
export const SIGUIENTE_ESTADO: Record<EstadoPedido, EstadoPedido | null> = {
  pendiente: 'en_preparacion',
  en_preparacion: 'listo',
  listo: 'entregado',
  entregado: null,
  cancelado: null,
}

export function textoEntrega(pedido: Pick<Pedido, 'metodoEntrega' | 'direccion'>) {
  return pedido.metodoEntrega === 'delivery' ? `🛵 Envío: ${pedido.direccion ?? ''}` : '🏪 Retiro en local'
}

export function textoPago(metodoPago: Pedido['metodoPago']) {
  return metodoPago === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'
}

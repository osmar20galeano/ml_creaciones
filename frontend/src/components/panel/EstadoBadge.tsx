import type { EstadoPedido } from '../../types'
import { ESTADOS } from '../../utils/pedidos'

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const { etiqueta, color, icono } = ESTADOS[estado]
  return (
    <span className={`badge ${color}`}>
      <i className={`bi ${icono} me-1`} />
      {etiqueta}
    </span>
  )
}

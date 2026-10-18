import { useState } from 'react'
import type { FiltroPedidos } from '../../api/tienda'
import type { EstadoPedido, Pedido } from '../../types'
import { formatearFechaHoraBd, formatearYmd, urgenciaEntrega } from '../../utils/fechas'
import { formatearGuaranies } from '../../utils/formato'
import { ESTADOS, SIGUIENTE_ESTADO, textoEntrega, textoPago } from '../../utils/pedidos'
import { EstadoBadge } from './EstadoBadge'

const FILTROS: { valor: FiltroPedidos; etiqueta: string }[] = [
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'entregado', etiqueta: 'Entregados' },
  { valor: 'cancelado', etiqueta: 'Cancelados' },
  { valor: 'todos', etiqueta: 'Todos' },
]

interface Props {
  pedidos: Pedido[]
  cargando: boolean
  error: string | null
  filtro: FiltroPedidos
  onFiltro: (filtro: FiltroPedidos) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => Promise<void>
}

function AvisoUrgencia({ pedido }: { pedido: Pedido }) {
  if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') return null
  const urgencia = urgenciaEntrega(pedido.fechaEntrega)
  if (urgencia === 'vencido') return <span className="badge bg-dark ms-1">Atrasado</span>
  if (urgencia === 'hoy') return <span className="badge bg-danger ms-1">Hoy</span>
  if (urgencia === 'manana') return <span className="badge bg-warning text-dark ms-1">Mañana</span>
  return null
}

function AccionesPedido({ pedido, onCambiarEstado }: { pedido: Pedido; onCambiarEstado: Props['onCambiarEstado'] }) {
  const [ocupado, setOcupado] = useState(false)
  const siguiente = SIGUIENTE_ESTADO[pedido.estado]
  if (!siguiente) return null

  async function cambiar(estado: EstadoPedido) {
    if (estado === 'cancelado' && !confirm(`¿Cancelar el pedido de ${pedido.clienteNombre}? Se devolverá el stock.`)) return
    setOcupado(true)
    try {
      await onCambiarEstado(pedido, estado)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="d-flex flex-wrap gap-1 mt-1">
      <button type="button" className="btn btn-sm btn-success" disabled={ocupado} onClick={() => cambiar(siguiente)}>
        {ESTADOS[siguiente].etiqueta} →
      </button>
      <button type="button" className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => cambiar('cancelado')}>
        Cancelar
      </button>
    </div>
  )
}

export function TablaPedidos({ pedidos, cargando, error, filtro, onFiltro, onCambiarEstado }: Props) {
  return (
    <div className="card card-custom mb-4">
      <div className="card-header card-header-custom d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 className="mb-0">Agenda de Pedidos</h5>
        <div className="btn-group btn-group-sm" role="group" aria-label="Filtrar pedidos">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              className={`btn ${filtro === f.valor ? 'btn-custom' : 'btn-outline-secondary bg-white'}`}
              onClick={() => onFiltro(f.valor)}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle table-custom">
            <thead>
              <tr>
                <th>Cliente / Detalles</th>
                <th>Producto</th>
                <th>Fechas</th>
                <th>Estado / Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando && pedidos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-3">
                    <span className="spinner-border spinner-border-sm text-warning" />
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-3">No hay pedidos en esta lista.</td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <strong>{pedido.clienteNombre}</strong>
                      {pedido.usuarioId === null && <span className="badge bg-light text-muted border ms-1">en local</span>}
                      <br />
                      <small className="text-purple">{textoEntrega(pedido)}</small>
                      <br />
                      <small className="text-success fw-bold">Pago: {textoPago(pedido.metodoPago)}</small>
                      <br />
                      <small className="text-muted">Obs: {pedido.detalles || 'Ninguna'}</small>
                    </td>
                    <td>
                      <span>{pedido.productoNombre}</span>
                      <br />
                      <strong className="text-dark">{formatearGuaranies(pedido.precio)}</strong>
                    </td>
                    <td>
                      <small>
                        Hecho: {formatearFechaHoraBd(pedido.creadoEn)}
                        <br />
                        <strong>Entrega: {formatearYmd(pedido.fechaEntrega)}</strong>
                        <AvisoUrgencia pedido={pedido} />
                      </small>
                    </td>
                    <td>
                      <EstadoBadge estado={pedido.estado} />
                      <AccionesPedido pedido={pedido} onCambiarEstado={onCambiarEstado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

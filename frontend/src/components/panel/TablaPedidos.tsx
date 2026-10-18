import { useTienda } from '../../hooks/useTienda'
import type { Pedido } from '../../types'
import { estadoEntrega } from '../../utils/fechas'
import { formatearGuaranies } from '../../utils/formato'

function AccionesPedido({ pedido }: { pedido: Pedido }) {
  const { finalizarPedido, cancelarPedido, mostrarAlerta } = useTienda()
  const estado = estadoEntrega(pedido.timestampEntrega)

  return (
    <div className="d-flex flex-wrap align-items-center gap-1">
      <button
        type="button"
        className="btn btn-sm btn-success"
        onClick={() => {
          finalizarPedido(pedido.id)
          mostrarAlerta(`¡Pedido de ${pedido.cliente} completado con éxito! ✨`, 'success')
        }}
      >
        Finalizar ✓
      </button>
      {estado === 'vencido' && <span className="badge bg-dark">Vencido</span>}
      {estado === 'falta-poco' && <span className="badge bg-danger">Falta poco</span>}
      {estado === 'a-tiempo' && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => {
            cancelarPedido(pedido.id)
            mostrarAlerta('El pedido fue cancelado correctamente.', 'info')
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  )
}

export function TablaPedidos() {
  const { pedidos, limpiarPedidos, mostrarAlerta } = useTienda()

  function handleLimpiar() {
    if (pedidos.length === 0) {
      mostrarAlerta('La agenda de pedidos ya se encuentra vacía.', 'warning')
      return
    }
    if (confirm('¿Estás seguro de que deseas limpiar TODOS los pedidos del día?')) {
      limpiarPedidos()
      mostrarAlerta('Se ha limpiado toda la agenda de pedidos correctamente. 🗑️', 'info')
    }
  }

  return (
    <div className="card card-custom mb-4">
      <div className="card-header card-header-custom">
        <h5 className="mb-0">Agenda de Pedidos Confirmados</h5>
      </div>
      <div className="card-body">
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
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-3">No hay pedidos registrados en la agenda.</td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <strong>{pedido.cliente}</strong>
                      <br />
                      <small className="text-purple">{pedido.modalidad}</small>
                      <br />
                      <small className="text-success fw-bold">Pago: {pedido.pago}</small>
                      <br />
                      <small className="text-muted">Obs: {pedido.detalles}</small>
                    </td>
                    <td>
                      <span>{pedido.producto}</span>
                      <br />
                      <strong className="text-dark">{formatearGuaranies(pedido.precio)}</strong>
                    </td>
                    <td>
                      <small>
                        Hecho: {pedido.fechaPedido}
                        <br />
                        <strong>Entrega: {pedido.fechaEntrega}</strong>
                      </small>
                    </td>
                    <td>
                      <AccionesPedido pedido={pedido} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-end mt-2">
          <button type="button" className="btn btn-sm btn-danger" onClick={handleLimpiar}>
            Limpiar Agenda del Día
          </button>
        </div>
      </div>
    </div>
  )
}

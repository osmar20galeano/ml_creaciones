import { useState } from 'react'
import { Link } from 'react-router'
import { mensajeDeError } from '../api/http'
import { tiendaApi } from '../api/tienda'
import { Alerta } from '../components/panel/Alerta'
import { EstadoBadge } from '../components/panel/EstadoBadge'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useTienda } from '../hooks/useTienda'
import type { EstadoPedido, Pedido, Presupuesto } from '../types'
import { formatearFechaHoraBd, formatearYmd } from '../utils/fechas'
import { formatearGuaranies } from '../utils/formato'
import { textoEntrega, textoPago } from '../utils/pedidos'

const PASOS: EstadoPedido[] = ['pendiente', 'en_preparacion', 'listo', 'entregado']
const NOMBRE_PASO: Record<EstadoPedido, string> = {
  pendiente: 'Recibido',
  en_preparacion: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

/** Línea de progreso: Recibido → Preparando → Listo → Entregado. */
function Progreso({ estado }: { estado: EstadoPedido }) {
  if (estado === 'cancelado') return null
  const actual = PASOS.indexOf(estado)
  return (
    <div className="progreso-pedido d-flex justify-content-between mt-3">
      {PASOS.map((paso, i) => (
        <div key={paso} className={`progreso-paso ${i <= actual ? 'hecho' : ''}`}>
          <span className="progreso-punto" />
          <small>{NOMBRE_PASO[paso]}</small>
        </div>
      ))}
    </div>
  )
}

function TarjetaPedido({ pedido, onCancelar }: { pedido: Pedido; onCancelar: (p: Pedido) => Promise<void> }) {
  const [ocupado, setOcupado] = useState(false)

  return (
    <div className="card card-custom h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h6 className="text-gold mb-1">{pedido.productoNombre}</h6>
            <small className="text-muted">Pedido #{pedido.id} · {formatearFechaHoraBd(pedido.creadoEn)}</small>
          </div>
          <EstadoBadge estado={pedido.estado} />
        </div>

        <ul className="list-unstyled small mt-3 mb-0">
          <li><strong>Monto:</strong> {formatearGuaranies(pedido.precio)}</li>
          <li><strong>Entrega:</strong> {formatearYmd(pedido.fechaEntrega)} · {textoEntrega(pedido)}</li>
          <li><strong>Pago:</strong> {textoPago(pedido.metodoPago)}</li>
          {pedido.detalles && <li><strong>Obs:</strong> {pedido.detalles}</li>}
        </ul>

        <Progreso estado={pedido.estado} />

        {pedido.estado === 'pendiente' && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger mt-3"
            disabled={ocupado}
            onClick={async () => {
              setOcupado(true)
              try {
                await onCancelar(pedido)
              } finally {
                setOcupado(false)
              }
            }}
          >
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  )
}

export function MisPedidos() {
  const { usuario } = useAuth()
  const { mostrarAlerta, recargarProductos } = useTienda()
  const pedidos = useCarga(tiendaApi.misPedidos, [] as Pedido[])
  const presupuestos = useCarga(tiendaApi.misPresupuestos, [] as Presupuesto[])

  async function cancelar(pedido: Pedido) {
    if (!confirm(`¿Seguro que quieres cancelar tu pedido de ${pedido.productoNombre}?`)) return
    try {
      await tiendaApi.cancelarMiPedido(pedido.id)
      mostrarAlerta('Tu pedido fue cancelado.', 'info')
      void recargarProductos()
    } catch (err) {
      mostrarAlerta(mensajeDeError(err, 'No se pudo cancelar el pedido.'), 'danger')
    }
    await pedidos.recargar()
  }

  const activos = pedidos.datos.filter((p) => p.estado !== 'entregado' && p.estado !== 'cancelado')
  const historial = pedidos.datos.filter((p) => p.estado === 'entregado' || p.estado === 'cancelado')

  return (
    <main className="container mb-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h4 className="text-secondary mb-0">Mis pedidos</h4>
        <Link to="/" className="btn btn-custom btn-sm">
          <i className="bi bi-plus-lg me-1" /> Nuevo pedido
        </Link>
      </div>
      <p className="text-muted small">
        Hola <strong>{usuario?.nombre}</strong>, acá puedes seguir el estado de tus pedidos.
      </p>

      <Alerta />
      {pedidos.error && <div className="alert alert-danger">{pedidos.error}</div>}

      {pedidos.cargando && pedidos.datos.length === 0 ? (
        <div className="text-center py-5"><span className="spinner-border text-warning" /></div>
      ) : pedidos.datos.length === 0 ? (
        <div className="card card-custom">
          <div className="card-body text-center py-5">
            <i className="bi bi-bag-heart fs-1 text-gold" />
            <p className="mt-2 mb-3">Todavía no hiciste ningún pedido.</p>
            <Link to="/" className="btn btn-custom">Ver el catálogo</Link>
          </div>
        </div>
      ) : (
        <>
          <h6 className="text-purple mt-4">En curso ({activos.length})</h6>
          {activos.length === 0 ? (
            <p className="text-muted small">No tienes pedidos en curso.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-3">
              {activos.map((p) => (
                <div className="col" key={p.id}><TarjetaPedido pedido={p} onCancelar={cancelar} /></div>
              ))}
            </div>
          )}

          {historial.length > 0 && (
            <>
              <h6 className="text-purple mt-4">Historial ({historial.length})</h6>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {historial.map((p) => (
                  <div className="col" key={p.id}><TarjetaPedido pedido={p} onCancelar={cancelar} /></div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {presupuestos.datos.length > 0 && (
        <>
          <h6 className="text-purple mt-5">Mis presupuestos</h6>
          <div className="table-responsive">
            <table className="table table-sm align-middle table-custom">
              <thead>
                <tr><th>Producto</th><th>Monto estimado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {presupuestos.datos.map((pres) => (
                  <tr key={pres.id}>
                    <td>{pres.productoNombre}</td>
                    <td className="text-gold fw-bold">{formatearGuaranies(pres.costo)}</td>
                    <td><small>{formatearFechaHoraBd(pres.creadoEn)}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}

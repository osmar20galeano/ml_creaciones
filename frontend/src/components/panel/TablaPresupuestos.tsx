import type { Presupuesto } from '../../types'
import { formatearFechaHoraBd } from '../../utils/fechas'
import { formatearGuaranies } from '../../utils/formato'

interface Props {
  presupuestos: Presupuesto[]
  cargando: boolean
  error: string | null
  onBorrar: (presupuesto: Presupuesto) => void
}

export function TablaPresupuestos({ presupuestos, cargando, error, onBorrar }: Props) {
  return (
    <div className="card card-custom">
      <div className="card-header bg-light border-bottom text-dark">
        <h5 className="mb-0">Presupuestos</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-striped table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto Cotizado</th>
                <th>Costo Estimado</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando && presupuestos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-2">
                    <span className="spinner-border spinner-border-sm text-warning" />
                  </td>
                </tr>
              ) : presupuestos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-2">No hay cotizaciones registradas.</td>
                </tr>
              ) : (
                presupuestos.map((pres) => (
                  <tr key={pres.id}>
                    <td>
                      <strong>{pres.clienteNombre}</strong>
                      {pres.usuarioId !== null && <span className="badge bg-light text-muted border ms-1">web</span>}
                      {pres.detalles && <div className="small text-muted">Obs: {pres.detalles}</div>}
                    </td>
                    <td>{pres.productoNombre}</td>
                    <td className="text-gold fw-bold">{formatearGuaranies(pres.costo)}</td>
                    <td><small>{formatearFechaHoraBd(pres.creadoEn)}</small></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        aria-label={`Borrar presupuesto de ${pres.clienteNombre}`}
                        onClick={() => onBorrar(pres)}
                      >
                        ❌
                      </button>
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

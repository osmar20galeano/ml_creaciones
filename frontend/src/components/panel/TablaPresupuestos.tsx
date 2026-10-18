import { useTienda } from '../../hooks/useTienda'
import { formatearGuaranies } from '../../utils/formato'

export function TablaPresupuestos() {
  const { presupuestos, borrarPresupuesto, limpiarPresupuestos, mostrarAlerta } = useTienda()

  function handleLimpiar() {
    if (presupuestos.length === 0) {
      mostrarAlerta('No hay presupuestos guardados para eliminar.', 'warning')
      return
    }
    if (confirm('¿Deseas eliminar todo el historial de presupuestos emitidos?')) {
      limpiarPresupuestos()
      mostrarAlerta('Historial de presupuestos vaciado con éxito.', 'info')
    }
  }

  return (
    <div className="card card-custom">
      <div className="card-header bg-light border-bottom text-dark">
        <h5 className="mb-0">Presupuestos Especiales Enviados</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto Cotizado</th>
                <th>Costo Estimado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {presupuestos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-2">No hay cotizaciones registradas.</td>
                </tr>
              ) : (
                presupuestos.map((pres) => (
                  <tr key={pres.id}>
                    <td><strong>{pres.cliente}</strong></td>
                    <td>{pres.producto}</td>
                    <td className="text-gold fw-bold">{formatearGuaranies(pres.costo)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        aria-label={`Borrar presupuesto de ${pres.cliente}`}
                        onClick={() => borrarPresupuesto(pres.id)}
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
        <div className="text-end mt-2">
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleLimpiar}>
            Limpiar Historial de Presupuestos
          </button>
        </div>
      </div>
    </div>
  )
}

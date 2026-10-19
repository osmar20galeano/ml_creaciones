import { useState } from 'react'
import { formatearGuaranies } from '../../utils/formato'

/** Valores de ejemplo: el grupo debe reemplazarlos por los reales durante la exposición. */
const EJEMPLO = { fijos: 1_500_000, precio: 80_000, variable: 40_000 }

function CampoGs({ id, etiqueta, ayuda, valor, onChange }: {
  id: string
  etiqueta: string
  ayuda: string
  valor: number
  onChange: (n: number) => void
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold mb-1">{etiqueta}</label>
      <div className="input-group">
        <span className="input-group-text">₲</span>
        <input
          id={id}
          type="number"
          className="form-control"
          min={0}
          step={1000}
          value={valor}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
      <div className="form-text">{ayuda}</div>
    </div>
  )
}

/** Punto de equilibrio: cuántos pedidos por mes cubren los costos fijos. */
export function CalculadoraEquilibrio() {
  const [fijos, setFijos] = useState(EJEMPLO.fijos)
  const [precio, setPrecio] = useState(EJEMPLO.precio)
  const [variable, setVariable] = useState(EJEMPLO.variable)

  const margen = precio - variable
  const margenPct = precio > 0 ? Math.round((margen / precio) * 100) : 0
  const pedidos = margen > 0 ? Math.ceil(fijos / margen) : null
  const esEjemplo = fijos === EJEMPLO.fijos && precio === EJEMPLO.precio && variable === EJEMPLO.variable

  return (
    <div className="calculadora">
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <CampoGs
            id="calc-fijos"
            etiqueta="Costos fijos por mes"
            ayuda="Servicios, espacio de trabajo, mantenimiento, publicidad."
            valor={fijos}
            onChange={setFijos}
          />
          <CampoGs
            id="calc-precio"
            etiqueta="Precio promedio de un pedido"
            ayuda="Ticket promedio según los productos más vendidos."
            valor={precio}
            onChange={setPrecio}
          />
          <CampoGs
            id="calc-variable"
            etiqueta="Costo variable promedio por pedido"
            ayuda="Insumos, packaging y delivery de un pedido."
            valor={variable}
            onChange={setVariable}
          />
          {esEjemplo && (
            <p className="small text-muted mb-0">
              <i className="bi bi-info-circle me-1" />
              Valores de ejemplo: cámbialos para ver el resultado con datos reales.
            </p>
          )}
        </div>

        <div className="col-12 col-md-6">
          <div className="calculadora-resultado">
            <div className="calculadora-dato">
              <span>Margen por pedido</span>
              <strong className={margen > 0 ? '' : 'text-danger'}>
                {formatearGuaranies(margen)} <small>({margenPct} %)</small>
              </strong>
            </div>
            <div className="calculadora-principal">
              {pedidos !== null ? (
                <>
                  <span className="calculadora-numero">{pedidos}</span>
                  <span>pedidos por mes para cubrir los costos fijos</span>
                  <small>≈ {Math.ceil(pedidos / 4)} por semana · ventas de {formatearGuaranies(pedidos * precio)}</small>
                </>
              ) : (
                <span className="text-danger">El precio debe ser mayor que el costo variable para que el negocio sea viable.</span>
              )}
            </div>
            <p className="calculadora-formula">
              Punto de equilibrio = Costos fijos ÷ (Precio − Costo variable)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

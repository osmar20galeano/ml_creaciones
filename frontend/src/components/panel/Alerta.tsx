import { useTienda } from '../../hooks/useTienda'

export function Alerta() {
  const { alerta, cerrarAlerta } = useTienda()
  if (!alerta) return null

  return (
    <div className={`alert alert-${alerta.tipo} alert-dismissible shadow-sm`} role="alert">
      {alerta.mensaje}
      <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarAlerta} />
    </div>
  )
}

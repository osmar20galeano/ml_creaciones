import { negocio } from '../../data/negocio'

export function DatosBancarios() {
  const { banco } = negocio
  return (
    <div className="alert alert-light border-gold p-2 mb-3 small">
      <strong>Datos para Transferencia:</strong>
      <br />• Banco: {banco.nombre}
      <br />• Alias: <strong>{banco.alias}</strong>
      <br />
      <span className="text-muted text-xs">* Favor enviar el comprobante por WhatsApp al confirmar el Pedido, ¡Gracias!</span>
    </div>
  )
}

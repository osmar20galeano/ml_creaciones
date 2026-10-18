import { negocio } from '../../data/negocio'
import type { Producto } from '../../types'
import { formatearGuaranies } from '../../utils/formato'
import { StockBadge } from './StockBadge'

interface Props {
  producto: Producto
  stock: number
  /** Si no se pasa (vista pública), el botón abre WhatsApp para consultar el producto. */
  onSeleccionar?: (producto: Producto) => void
}

export function ProductoCard({ producto, stock, onSeleccionar }: Props) {
  const agotado = stock <= 0
  const mensajeWhatsapp = `Hola M.L. Creaciones, quiero consultar por: ${producto.nombre}`
  const urlWhatsapp = `https://wa.me/${negocio.whatsapp.numero}?text=${encodeURIComponent(mensajeWhatsapp)}`

  return (
    <div className="card h-100 card-custom">
      <div className="contenedor-img-catalogo">
        <img src={producto.imagen} className="card-img-top img-catalogo" alt={producto.nombre} loading="lazy" />
      </div>
      <div className="card-body text-center d-flex flex-column">
        <h5 className="card-title text-gold">{producto.nombre}</h5>
        <p className="card-text text-muted small">{producto.descripcion}</p>
        <h4 className="text-dark">
          {formatearGuaranies(producto.precioMin)} a {formatearGuaranies(producto.precioMax)}
        </h4>
        <p className="mb-3">
          Stock disponible: <StockBadge stock={stock} /> un.
        </p>
        {onSeleccionar ? (
          <button
            type="button"
            className="btn btn-custom w-100 mt-auto"
            disabled={agotado}
            onClick={() => onSeleccionar(producto)}
          >
            {agotado ? 'Sin stock' : 'Seleccionar para Pedido'}
          </button>
        ) : (
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-custom w-100 mt-auto">
            <i className="bi bi-whatsapp me-1" /> Consultar
          </a>
        )}
      </div>
    </div>
  )
}

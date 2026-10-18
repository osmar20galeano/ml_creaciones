import type { ReactNode } from 'react'
import { negocio } from '../../data/negocio'
import type { Producto } from '../../types'
import { formatearGuaranies } from '../../utils/formato'
import { StockBadge } from './StockBadge'

interface Props {
  producto: Producto
  /** Botón principal de la tarjeta (depende de quién mira el catálogo). */
  accion: ReactNode
}

export function ProductoCard({ producto, accion }: Props) {
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
          Stock disponible: <StockBadge stock={producto.stock} /> un.
        </p>
        <div className="mt-auto">
          {accion}
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" className="d-inline-block small link-local mt-2">
            <i className="bi bi-whatsapp me-1" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

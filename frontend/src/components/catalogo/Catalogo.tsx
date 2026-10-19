import type { ReactNode } from 'react'
import { useTienda } from '../../hooks/useTienda'
import type { Producto } from '../../types'
import { ProductoCard } from './ProductoCard'

export function Catalogo({ accion }: { accion: (producto: Producto) => ReactNode }) {
  const { productos, cargandoProductos, errorProductos } = useTienda()

  return (
    <section className="mb-5">
      <h4 className="mb-3 text-secondary">Catálogo de Productos Disponibles</h4>

      {cargandoProductos && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando catálogo…</span>
          </div>
        </div>
      )}

      {errorProductos && <div className="alert alert-danger">{errorProductos}</div>}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {productos.map((producto) => (
          <div className="col" key={producto.id}>
            <ProductoCard producto={producto} accion={accion(producto)} />
          </div>
        ))}
      </div>
    </section>
  )
}

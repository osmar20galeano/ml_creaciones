import { productos } from '../../data/productos'
import { useTienda } from '../../hooks/useTienda'
import type { Producto } from '../../types'
import { ProductoCard } from './ProductoCard'

export function Catalogo({ onSeleccionar }: { onSeleccionar?: (producto: Producto) => void }) {
  const { stockDe } = useTienda()

  return (
    <section className="mb-5">
      <h4 className="mb-3 text-secondary">Catálogo de Productos Disponibles</h4>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {productos.map((producto) => (
          <div className="col" key={producto.id}>
            <ProductoCard producto={producto} stock={stockDe(producto.id)} onSeleccionar={onSeleccionar} />
          </div>
        ))}
      </div>
    </section>
  )
}

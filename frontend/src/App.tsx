import { useRef, useState } from 'react'
import { Catalogo } from './components/catalogo/Catalogo'
import { Navbar } from './components/layout/Navbar'
import { TablaPedidos } from './components/panel/TablaPedidos'
import { TablaPresupuestos } from './components/panel/TablaPresupuestos'
import { FormularioPedido } from './components/pedido/FormularioPedido'
import { useTienda } from './hooks/useTienda'
import type { Producto } from './types'

export default function App() {
  const { mostrarAlerta } = useTienda()
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const formularioRef = useRef<HTMLDivElement>(null)

  function seleccionarProducto(producto: Producto) {
    setProductoSeleccionado(producto)
    formularioRef.current?.scrollIntoView({ behavior: 'smooth' })
    mostrarAlerta(`Seleccionaste: ${producto.nombre}. Digita el monto acordado y completa los datos.`, 'info')
  }

  return (
    <>
      <Navbar />
      <main className="container mb-5">
        <Catalogo onSeleccionar={seleccionarProducto} />

        <div className="row">
          <div className="col-12 col-lg-4 mb-4" ref={formularioRef}>
            <FormularioPedido producto={productoSeleccionado} onLimpiarProducto={() => setProductoSeleccionado(null)} />
          </div>
          <div className="col-12 col-lg-8">
            <TablaPedidos />
            <TablaPresupuestos />
          </div>
        </div>
      </main>
    </>
  )
}

import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Catalogo } from '../components/catalogo/Catalogo'
import { FormularioPedido } from '../components/pedido/FormularioPedido'
import { useAuth } from '../hooks/useAuth'
import { useTienda } from '../hooks/useTienda'
import type { Producto } from '../types'

export function Tienda() {
  const { usuario } = useAuth()
  const { productos, mostrarAlerta } = useTienda()
  const navigate = useNavigate()
  const [productoId, setProductoId] = useState<string | null>(null)
  const formularioRef = useRef<HTMLDivElement>(null)

  const productoSeleccionado = productos.find((p) => p.id === productoId) ?? null
  const esCliente = usuario?.rol === 'cliente'

  function seleccionarProducto(producto: Producto) {
    setProductoId(producto.id)
    // Esperamos a que el formulario aparezca antes de desplazarnos hasta él.
    requestAnimationFrame(() => formularioRef.current?.scrollIntoView({ behavior: 'smooth' }))
    mostrarAlerta(`Elegiste: ${producto.nombre}. Completa los datos de tu pedido.`, 'info')
  }

  function accion(producto: Producto) {
    const agotado = producto.stock <= 0
    if (agotado) {
      return (
        <button type="button" className="btn btn-custom w-100" disabled>
          Sin stock
        </button>
      )
    }
    if (!usuario) {
      return (
        <Link to="/login" state={{ desde: '/' }} className="btn btn-custom w-100">
          <i className="bi bi-bag-heart me-1" /> Ingresa para pedir
        </Link>
      )
    }
    if (usuario.rol === 'admin') {
      return (
        <Link to="/admin" className="btn btn-outline-secondary w-100">
          Gestionar en el panel
        </Link>
      )
    }
    return (
      <button type="button" className="btn btn-custom w-100" onClick={() => seleccionarProducto(producto)}>
        <i className="bi bi-bag-heart me-1" /> Pedir este producto
      </button>
    )
  }

  return (
    <main className="container mb-5">
      <Catalogo accion={accion} />

      {esCliente && productoSeleccionado && (
        <div className="row justify-content-center" ref={formularioRef}>
          <div className="col-12 col-md-8 col-lg-6">
            <FormularioPedido
              producto={productoSeleccionado}
              onLimpiarProducto={() => setProductoId(null)}
              onGuardado={() => navigate('/mis-pedidos')}
            />
          </div>
        </div>
      )}
    </main>
  )
}

import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import imagenPromoMayoristas from '../assets/img/promo_mayoristas.jpg'
import imagenPromoRegalos from '../assets/img/promo_regalos.jpg'
import { Catalogo } from '../components/catalogo/Catalogo'
import { FormularioPedido } from '../components/pedido/FormularioPedido'
import { useAuth } from '../hooks/useAuth'
import { useTienda } from '../hooks/useTienda'
import type { Producto } from '../types'

const promociones = [
  {
    imagen: imagenPromoRegalos,
    alt: 'Afiche "¡Regalos que dejan huella!" de M.L. Creaciones: remeras, vasos, tazas, agendas y termos personalizados, canastas navideñas y regalos empresariales para fin de año. Pedí presupuesto al 0984 676 117; envíos a todo el país',
  },
  {
    imagen: imagenPromoMayoristas,
    alt: 'Afiche de M.L. Creaciones con precios mayoristas y minoristas: sublimaciones, regalos personalizados, fotocopias, impresiones, stickers, remeras, souvenirs para eventos y centros de mesa. Tel. 0984 676 117; envíos a todo el país',
  },
]

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
      <section className="mb-5">
        <h4 className="mb-3 text-secondary">Promociones</h4>
        <div className="row g-4">
          {promociones.map((promo) => (
            <div className="col-12 col-md-6" key={promo.imagen}>
              <a href={promo.imagen} target="_blank" rel="noopener noreferrer" className="d-block">
                <img
                  src={promo.imagen}
                  alt={promo.alt}
                  className="img-fluid rounded-4 shadow-sm"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </a>
            </div>
          ))}
        </div>
      </section>

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

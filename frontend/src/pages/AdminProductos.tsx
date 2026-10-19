import { useCallback, useState } from 'react'
import { mensajeDeError } from '../api/http'
import { tiendaApi } from '../api/tienda'
import { AdminNav } from '../components/admin/AdminNav'
import { ModalProducto } from '../components/admin/ModalProducto'
import { StockBadge } from '../components/catalogo/StockBadge'
import { Alerta } from '../components/panel/Alerta'
import { useCarga } from '../hooks/useCarga'
import { useTienda } from '../hooks/useTienda'
import type { Producto } from '../types'
import { formatearGuaranies } from '../utils/formato'

/** Normaliza para buscar sin importar mayúsculas ni tildes. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function FilaProducto({
  producto,
  onEditar,
  onCambio,
}: {
  producto: Producto
  onEditar: () => void
  onCambio: (accion: () => Promise<Producto>, mensaje: (p: Producto) => string) => Promise<void>
}) {
  const [ocupado, setOcupado] = useState(false)

  async function ejecutar(accion: () => Promise<Producto>, mensaje: (p: Producto) => string) {
    setOcupado(true)
    try {
      await onCambio(accion, mensaje)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className={`card card-custom mb-2 ${producto.activo ? '' : 'producto-oculto'}`}>
      <div className="card-body py-2 d-flex flex-wrap align-items-center gap-3">
        <img src={producto.imagen} alt="" className="miniatura-producto" />

        <div className="flex-grow-1" style={{ minWidth: 180 }}>
          <div className="fw-bold text-gold">
            {producto.nombre}
            {!producto.activo && <span className="badge bg-secondary ms-2">Oculto</span>}
          </div>
          <div className="small text-muted text-truncate" style={{ maxWidth: 360 }}>
            {producto.descripcion || 'Sin descripción'}
          </div>
          <div className="small">
            {formatearGuaranies(producto.precioMin)} a {formatearGuaranies(producto.precioMax)}
          </div>
        </div>

        <div className="d-flex align-items-center gap-1" aria-label={`Stock de ${producto.nombre}`}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={ocupado || producto.stock <= 0}
            aria-label="Quitar una unidad"
            onClick={() => ejecutar(() => tiendaApi.ajustarStock(producto.id, -1), (p) => `Stock de ${p.nombre}: ${p.stock}`)}
          >
            −
          </button>
          <span className="px-1"><StockBadge stock={producto.stock} /></span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={ocupado}
            aria-label="Sumar una unidad"
            onClick={() => ejecutar(() => tiendaApi.ajustarStock(producto.id, 1), (p) => `Stock de ${p.nombre}: ${p.stock}`)}
          >
            +
          </button>
        </div>

        <div className="d-flex gap-1">
          <button type="button" className="btn btn-sm btn-custom" onClick={onEditar} disabled={ocupado}>
            <i className="bi bi-pencil me-1" /> Editar
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={ocupado}
            title={producto.activo ? 'Ocultar del catálogo' : 'Mostrar en el catálogo'}
            onClick={() =>
              ejecutar(
                () => tiendaApi.editarProducto(producto.id, { activo: !producto.activo }),
                (p) => (p.activo ? `${p.nombre} vuelve a verse en el catálogo.` : `${p.nombre} quedó oculto del catálogo.`),
              )
            }
          >
            <i className={`bi ${producto.activo ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminProductos() {
  const { mostrarAlerta, recargarProductos } = useTienda()
  const productos = useCarga(tiendaApi.todosLosProductos, [] as Producto[])
  const [busqueda, setBusqueda] = useState('')
  // undefined = modal cerrado, null = producto nuevo
  const [editando, setEditando] = useState<Producto | null | undefined>(undefined)

  const recargarLista = productos.recargar
  const actualizarTodo = useCallback(async () => {
    // El catálogo público también cambia (precios, stock, fotos, visibles).
    await Promise.all([recargarLista(), recargarProductos()])
  }, [recargarLista, recargarProductos])

  async function aplicarCambio(accion: () => Promise<Producto>, mensaje: (p: Producto) => string) {
    try {
      const producto = await accion()
      mostrarAlerta(mensaje(producto), 'success')
    } catch (err) {
      mostrarAlerta(mensajeDeError(err, 'No se pudo guardar el cambio.'), 'danger')
    }
    await actualizarTodo()
  }

  const cerrarModal = useCallback(() => setEditando(undefined), [])

  const termino = normalizar(busqueda.trim())
  const visibles = productos.datos.filter(
    (p) => !termino || normalizar(`${p.nombre} ${p.descripcion}`).includes(termino),
  )
  const sinStock = productos.datos.filter((p) => p.activo && p.stock <= 0).length

  return (
    <main className="container mb-5">
      <AdminNav />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h4 className="text-secondary mb-0">
          Productos <span className="text-muted fs-6">({productos.datos.length})</span>
        </h4>
        <button type="button" className="btn btn-custom" onClick={() => setEditando(null)}>
          <i className="bi bi-plus-lg me-1" /> Nuevo producto
        </button>
      </div>

      <Alerta />
      {productos.error && <div className="alert alert-danger">{productos.error}</div>}
      {sinStock > 0 && (
        <div className="alert alert-warning py-2 small">
          <i className="bi bi-exclamation-triangle me-1" />
          {sinStock === 1 ? 'Hay 1 producto visible sin stock.' : `Hay ${sinStock} productos visibles sin stock.`} Los
          clientes lo ven, pero no pueden pedirlo.
        </div>
      )}

      <div className="input-group mb-3" style={{ maxWidth: 400 }}>
        <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar producto…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {productos.cargando && productos.datos.length === 0 ? (
        <div className="text-center py-5"><span className="spinner-border text-warning" /></div>
      ) : visibles.length === 0 ? (
        <p className="text-muted">No hay productos que coincidan con la búsqueda.</p>
      ) : (
        visibles.map((p) => (
          <FilaProducto key={p.id} producto={p} onEditar={() => setEditando(p)} onCambio={aplicarCambio} />
        ))
      )}

      {editando !== undefined && (
        <ModalProducto
          producto={editando}
          onCerrar={cerrarModal}
          onGuardado={(p, esNuevo) => {
            setEditando(undefined)
            mostrarAlerta(esNuevo ? `Producto "${p.nombre}" creado. ✨` : `Cambios guardados en "${p.nombre}".`, 'success')
            void actualizarTodo()
          }}
        />
      )}
    </main>
  )
}

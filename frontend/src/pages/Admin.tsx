import { useCallback, useRef, useState } from 'react'
import { mensajeDeError } from '../api/http'
import { tiendaApi, type FiltroPedidos } from '../api/tienda'
import { Catalogo } from '../components/catalogo/Catalogo'
import { TablaPedidos } from '../components/panel/TablaPedidos'
import { TablaPresupuestos } from '../components/panel/TablaPresupuestos'
import { FormularioPedido } from '../components/pedido/FormularioPedido'
import { useCarga } from '../hooks/useCarga'
import { useTienda } from '../hooks/useTienda'
import type { EstadoPedido, Pedido, Presupuesto, Producto } from '../types'
import { ESTADOS } from '../utils/pedidos'

export function Admin() {
  const { productos, mostrarAlerta, recargarProductos } = useTienda()
  const [productoId, setProductoId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroPedidos>('activos')
  const formularioRef = useRef<HTMLDivElement>(null)

  // Se busca en la lista actual para que el stock esté siempre al día.
  const productoSeleccionado = productos.find((p) => p.id === productoId) ?? null

  const cargarPedidos = useCallback(() => tiendaApi.pedidos(filtro), [filtro])
  const pedidos = useCarga(cargarPedidos, [] as Pedido[])
  const presupuestos = useCarga(tiendaApi.presupuestos, [] as Presupuesto[])

  function seleccionarProducto(producto: Producto) {
    setProductoId(producto.id)
    formularioRef.current?.scrollIntoView({ behavior: 'smooth' })
    mostrarAlerta(`Seleccionaste: ${producto.nombre}. Digita el monto acordado y completa los datos.`, 'info')
  }

  async function cambiarEstado(pedido: Pedido, estado: EstadoPedido) {
    try {
      await tiendaApi.cambiarEstado(pedido.id, estado)
      mostrarAlerta(`Pedido de ${pedido.clienteNombre}: ${ESTADOS[estado].etiqueta.toLowerCase()}.`, 'success')
      if (estado === 'cancelado') void recargarProductos()
    } catch (err) {
      mostrarAlerta(mensajeDeError(err, 'No se pudo actualizar el pedido.'), 'danger')
    }
    await pedidos.recargar()
  }

  async function borrarPresupuesto(presupuesto: Presupuesto) {
    if (!confirm(`¿Borrar el presupuesto de ${presupuesto.clienteNombre}?`)) return
    try {
      await tiendaApi.borrarPresupuesto(presupuesto.id)
      await presupuestos.recargar()
    } catch (err) {
      mostrarAlerta(mensajeDeError(err, 'No se pudo borrar el presupuesto.'), 'danger')
    }
  }

  return (
    <main className="container mb-5">
      <Catalogo
        accion={(producto) => (
          <button
            type="button"
            className="btn btn-custom w-100"
            disabled={producto.stock <= 0}
            onClick={() => seleccionarProducto(producto)}
          >
            {producto.stock <= 0 ? 'Sin stock' : 'Seleccionar para Pedido'}
          </button>
        )}
      />

      <div className="row">
        <div className="col-12 col-lg-4 mb-4" ref={formularioRef}>
          <FormularioPedido
            producto={productoSeleccionado}
            onLimpiarProducto={() => setProductoId(null)}
            onGuardado={(tipo) => void (tipo === 'pedido' ? pedidos.recargar() : presupuestos.recargar())}
          />
        </div>
        <div className="col-12 col-lg-8">
          <TablaPedidos
            pedidos={pedidos.datos}
            cargando={pedidos.cargando}
            error={pedidos.error}
            filtro={filtro}
            onFiltro={setFiltro}
            onCambiarEstado={cambiarEstado}
          />
          <TablaPresupuestos
            presupuestos={presupuestos.datos}
            cargando={presupuestos.cargando}
            error={presupuestos.error}
            onBorrar={borrarPresupuesto}
          />
        </div>
      </div>
    </main>
  )
}

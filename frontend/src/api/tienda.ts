import { imagenDe } from '../data/imagenes'
import type {
  DatosProducto,
  EstadoPedido,
  MetodoEntrega,
  MetodoPago,
  Pedido,
  Presupuesto,
  Producto,
  ProductoApi,
} from '../types'
import { pedir } from './http'

export interface NuevoPedido {
  productoId: string
  /** Solo para el admin (pedidos de clientes sin cuenta). */
  clienteNombre?: string
  precio: number
  metodoEntrega: MetodoEntrega
  direccion?: string
  metodoPago: MetodoPago
  fechaEntrega: string
  detalles: string
}

export interface NuevoPresupuesto {
  productoId: string
  clienteNombre?: string
  costo: number
  detalles: string
}

export type FiltroPedidos = EstadoPedido | 'activos' | 'todos'

function query(filtro: FiltroPedidos) {
  return filtro === 'todos' ? '' : `?estado=${filtro}`
}

function conImagen(p: ProductoApi): Producto {
  return { ...p, imagen: p.imagenUrl ?? imagenDe(p.id) }
}

type RespuestaProducto = Promise<{ producto: ProductoApi }>
const producto = (r: RespuestaProducto) => r.then((d) => conImagen(d.producto))

export const tiendaApi = {
  productos: () => pedir<{ productos: ProductoApi[] }>('/productos').then((d) => d.productos.map(conImagen)),

  // Productos (solo admin)
  todosLosProductos: () =>
    pedir<{ productos: ProductoApi[] }>('/productos/todos').then((d) => d.productos.map(conImagen)),
  crearProducto: (datos: DatosProducto) => producto(pedir('/productos', 'POST', datos)),
  editarProducto: (id: string, cambios: Partial<DatosProducto>) => producto(pedir(`/productos/${id}`, 'PATCH', cambios)),
  ajustarStock: (id: string, cambio: number) => producto(pedir(`/productos/${id}/stock`, 'POST', { cambio })),
  subirImagen: (id: string, archivo: File) => {
    const datos = new FormData()
    datos.append('imagen', archivo)
    return producto(pedir(`/productos/${id}/imagen`, 'PUT', datos))
  },
  quitarImagen: (id: string) => producto(pedir(`/productos/${id}/imagen`, 'DELETE')),

  crearPedido: (datos: NuevoPedido) => pedir<{ pedido: Pedido }>('/pedidos', 'POST', datos).then((d) => d.pedido),
  misPedidos: () => pedir<{ pedidos: Pedido[] }>('/pedidos/mios').then((d) => d.pedidos),
  cancelarMiPedido: (id: number) =>
    pedir<{ pedido: Pedido }>(`/pedidos/${id}/cancelar`, 'POST', {}).then((d) => d.pedido),

  // Solo admin
  pedidos: (filtro: FiltroPedidos) => pedir<{ pedidos: Pedido[] }>(`/pedidos${query(filtro)}`).then((d) => d.pedidos),
  cambiarEstado: (id: number, estado: EstadoPedido) =>
    pedir<{ pedido: Pedido }>(`/pedidos/${id}/estado`, 'PATCH', { estado }).then((d) => d.pedido),

  crearPresupuesto: (datos: NuevoPresupuesto) =>
    pedir<{ presupuesto: Presupuesto }>('/presupuestos', 'POST', datos).then((d) => d.presupuesto),
  misPresupuestos: () => pedir<{ presupuestos: Presupuesto[] }>('/presupuestos/mios').then((d) => d.presupuestos),
  presupuestos: () => pedir<{ presupuestos: Presupuesto[] }>('/presupuestos').then((d) => d.presupuestos),
  borrarPresupuesto: (id: number) => pedir<{ ok: true }>(`/presupuestos/${id}`, 'DELETE'),
}

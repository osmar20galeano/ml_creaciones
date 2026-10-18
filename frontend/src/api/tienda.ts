import { imagenDe } from '../data/imagenes'
import type { EstadoPedido, MetodoEntrega, MetodoPago, Pedido, Presupuesto, Producto } from '../types'
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

export const tiendaApi = {
  productos: () =>
    pedir<{ productos: Omit<Producto, 'imagen'>[] }>('/productos').then((d) =>
      d.productos.map((p) => ({ ...p, imagen: imagenDe(p.id) })),
    ),

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

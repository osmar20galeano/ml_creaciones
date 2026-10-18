import { createContext } from 'react'
import type { Alerta, MetodoEntrega, MetodoPago, Pedido, Presupuesto, TipoAlerta } from '../types'

export interface NuevoPedido {
  productoId: string
  cliente: string
  precio: number
  metodoEntrega: MetodoEntrega
  direccion: string
  metodoPago: MetodoPago
  fechaEntrega: string // YYYY-MM-DD
  detalles: string
}

export interface NuevoPresupuesto {
  productoId: string
  cliente: string
  costo: number
}

export interface TiendaContextValue {
  pedidos: Pedido[]
  presupuestos: Presupuesto[]
  stockDe: (productoId: string) => number
  alerta: Alerta | null
  mostrarAlerta: (mensaje: string, tipo: TipoAlerta) => void
  cerrarAlerta: () => void
  /** Devuelve false si no hay stock. */
  confirmarPedido: (nuevo: NuevoPedido) => boolean
  finalizarPedido: (id: string) => void
  cancelarPedido: (id: string) => void
  limpiarPedidos: () => void
  agregarPresupuesto: (nuevo: NuevoPresupuesto) => void
  borrarPresupuesto: (id: string) => void
  limpiarPresupuestos: () => void
}

export const TiendaContext = createContext<TiendaContextValue | null>(null)

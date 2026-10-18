import { createContext } from 'react'
import type { Alerta, Producto, TipoAlerta } from '../types'

export interface TiendaContextValue {
  productos: Producto[]
  cargandoProductos: boolean
  errorProductos: string | null
  /** Vuelve a pedir productos a la API (por ejemplo, después de un pedido cambia el stock). */
  recargarProductos: () => Promise<void>
  alerta: Alerta | null
  mostrarAlerta: (mensaje: string, tipo: TipoAlerta) => void
  cerrarAlerta: () => void
}

export const TiendaContext = createContext<TiendaContextValue | null>(null)

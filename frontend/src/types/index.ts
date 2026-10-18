export interface Producto {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  precioMin: number
  precioMax: number
  stockInicial: number
}

export type MetodoEntrega = 'retiro' | 'delivery'
export type MetodoPago = 'efectivo' | 'transferencia'

/**
 * Mantiene la forma que guardaba la versión anterior (js/app.js) en
 * localStorage, para no perder pedidos ya cargados. `productoId` es nuevo:
 * los pedidos viejos no lo tienen y por eso no pueden devolver stock.
 */
export interface Pedido {
  id: string
  productoId?: string
  cliente: string
  producto: string
  precio: number
  modalidad: string
  pago: string
  fechaPedido: string
  fechaEntrega: string
  detalles: string
  timestampEntrega: number
}

export interface Presupuesto {
  id: string
  cliente: string
  producto: string
  costo: number
}

export type TipoAlerta = 'success' | 'info' | 'warning' | 'danger'

export interface Alerta {
  id: number
  mensaje: string
  tipo: TipoAlerta
}

/** Producto tal como lo devuelve la API, más su imagen local. */
export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precioMin: number
  precioMax: number
  stock: number
  imagen: string
}

export type MetodoEntrega = 'retiro' | 'delivery'
export type MetodoPago = 'efectivo' | 'transferencia'
export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'

export interface Pedido {
  id: number
  usuarioId: number | null
  clienteNombre: string
  productoId: string
  productoNombre: string
  precio: number
  metodoEntrega: MetodoEntrega
  direccion: string | null
  metodoPago: MetodoPago
  fechaEntrega: string // YYYY-MM-DD
  detalles: string
  estado: EstadoPedido
  creadoEn: string // "YYYY-MM-DD HH:MM:SS" en UTC
  actualizadoEn: string
}

export interface Presupuesto {
  id: number
  usuarioId: number | null
  clienteNombre: string
  productoId: string
  productoNombre: string
  costo: number
  detalles: string
  creadoEn: string
}

export type TipoAlerta = 'success' | 'info' | 'warning' | 'danger'

export interface Alerta {
  id: number
  mensaje: string
  tipo: TipoAlerta
}

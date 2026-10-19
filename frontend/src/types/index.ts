/** Producto tal como lo devuelve la API. */
export interface ProductoApi {
  id: string
  nombre: string
  descripcion: string
  precioMin: number
  precioMax: number
  stock: number
  activo: boolean
  /** Foto subida por el admin; null si usa la imagen incluida en la web. */
  imagenUrl: string | null
}

/** Producto listo para mostrar: `imagen` siempre tiene algo (la subida, la incluida o el logo). */
export interface Producto extends ProductoApi {
  imagen: string
}

export type DatosProducto = Pick<ProductoApi, 'nombre' | 'descripcion' | 'precioMin' | 'precioMax' | 'stock' | 'activo'>

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

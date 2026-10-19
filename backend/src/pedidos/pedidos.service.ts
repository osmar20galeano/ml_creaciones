import type { z } from 'zod'
import type { SesionPayload } from '../auth/tokens.js'
import {
  db,
  enTransaccion,
  type EstadoPedido,
  type PedidoFila,
  type PresupuestoFila,
  type ProductoFila,
  type Usuario,
} from '../db.js'
import { ErrorHttp } from '../errores.js'
import { avisarCambioEstado, avisarPedidoCreado, avisarPresupuesto } from './notificaciones.js'
import type { crearPedidoSchema, crearPresupuestoSchema } from './pedidos.schemas.js'

type DatosPedido = z.infer<typeof crearPedidoSchema>
type DatosPresupuesto = z.infer<typeof crearPresupuestoSchema>

const formatoGs = new Intl.NumberFormat('es-PY')

/** Fecha de hoy "YYYY-MM-DD" en la hora local del servidor. */
function hoyYmd() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// --- Conversión de filas de la BD a JSON para el frontend ---

function pedidoJson(p: PedidoFila) {
  return {
    id: p.id,
    usuarioId: p.usuario_id,
    clienteNombre: p.cliente_nombre,
    productoId: p.producto_id,
    productoNombre: p.producto_nombre,
    precio: p.precio,
    metodoEntrega: p.metodo_entrega,
    direccion: p.direccion,
    metodoPago: p.metodo_pago,
    fechaEntrega: p.fecha_entrega,
    detalles: p.detalles,
    estado: p.estado,
    creadoEn: p.creado_en,
    actualizadoEn: p.actualizado_en,
  }
}

function presupuestoJson(p: PresupuestoFila) {
  return {
    id: p.id,
    usuarioId: p.usuario_id,
    clienteNombre: p.cliente_nombre,
    productoId: p.producto_id,
    productoNombre: p.producto_nombre,
    costo: p.costo,
    detalles: p.detalles,
    creadoEn: p.creado_en,
  }
}

// --- Productos ---

const productoPorId = db.prepare('SELECT * FROM productos WHERE id = ? AND activo = 1')
const descontarStock = db.prepare('UPDATE productos SET stock = stock - 1 WHERE id = ? AND stock > 0')
const devolverStock = db.prepare('UPDATE productos SET stock = stock + 1 WHERE id = ?')

function obtenerProducto(id: string) {
  const producto = productoPorId.get(id) as ProductoFila | undefined
  if (!producto) throw new ErrorHttp(404, 'Ese producto no existe o ya no está disponible.')
  return producto
}

function validarMonto(producto: ProductoFila, monto: number) {
  if (monto < producto.precio_min || monto > producto.precio_max) {
    throw new ErrorHttp(
      400,
      `El monto para ${producto.nombre} debe estar entre ${formatoGs.format(producto.precio_min)} ₲ y ${formatoGs.format(producto.precio_max)} ₲.`,
      'MONTO_FUERA_DE_RANGO',
    )
  }
}

/** El cliente pide a su nombre; el admin puede cargar el pedido de otra persona. */
function nombreCliente(sesion: SesionPayload, nombreEnviado: string | undefined) {
  if (sesion.rol === 'admin') {
    if (!nombreEnviado) throw new ErrorHttp(400, 'Ingresa el nombre del cliente.')
    return { usuarioId: null, nombre: nombreEnviado }
  }
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(Number(sesion.sub)) as Usuario | undefined
  if (!usuario) throw new ErrorHttp(401, 'Debes iniciar sesión')
  return { usuarioId: usuario.id, nombre: usuario.nombre }
}

// --- Pedidos ---

const pedidoPorId = db.prepare('SELECT * FROM pedidos WHERE id = ?')
const insertarPedido = db.prepare(
  `INSERT INTO pedidos (usuario_id, cliente_nombre, producto_id, producto_nombre, precio,
                        metodo_entrega, direccion, metodo_pago, fecha_entrega, detalles)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
)
const actualizarEstado = db.prepare(
  "UPDATE pedidos SET estado = ?, actualizado_en = datetime('now') WHERE id = ? RETURNING *",
)

export function crearPedido(sesion: SesionPayload, datos: DatosPedido) {
  const producto = obtenerProducto(datos.productoId)
  validarMonto(producto, datos.precio)
  if (datos.fechaEntrega < hoyYmd()) {
    throw new ErrorHttp(400, 'La fecha de entrega no puede ser anterior a hoy.')
  }
  const cliente = nombreCliente(sesion, datos.clienteNombre)

  const pedido = enTransaccion(() => {
    if (descontarStock.run(producto.id).changes === 0) {
      throw new ErrorHttp(409, `Se agotó el stock de ${producto.nombre}.`, 'SIN_STOCK')
    }
    return insertarPedido.get(
      cliente.usuarioId,
      cliente.nombre,
      producto.id,
      producto.nombre,
      datos.precio,
      datos.metodoEntrega,
      datos.metodoEntrega === 'delivery' ? (datos.direccion ?? null) : null,
      datos.metodoPago,
      datos.fechaEntrega,
      datos.detalles,
    ) as unknown as PedidoFila
  })

  avisarPedidoCreado(pedido)
  return pedidoJson(pedido)
}

export function listarPedidos(filtro: { usuarioId?: number; estado?: EstadoPedido | 'activos' }) {
  const condiciones: string[] = []
  const valores: (string | number)[] = []

  if (filtro.usuarioId !== undefined) {
    condiciones.push('usuario_id = ?')
    valores.push(filtro.usuarioId)
  }
  if (filtro.estado === 'activos') {
    condiciones.push("estado NOT IN ('entregado', 'cancelado')")
  } else if (filtro.estado) {
    condiciones.push('estado = ?')
    valores.push(filtro.estado)
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  // Los activos se ordenan por fecha de entrega (lo más urgente primero); el resto, lo más nuevo primero.
  const orden = filtro.estado === 'activos' ? 'fecha_entrega ASC, id ASC' : 'id DESC'
  const filas = db.prepare(`SELECT * FROM pedidos ${where} ORDER BY ${orden}`).all(...valores) as unknown as PedidoFila[]
  return filas.map(pedidoJson)
}

function obtenerPedido(id: number) {
  const pedido = pedidoPorId.get(id) as PedidoFila | undefined
  if (!pedido) throw new ErrorHttp(404, 'No encontramos ese pedido.')
  return pedido
}

const ESTADOS_FINALES: EstadoPedido[] = ['entregado', 'cancelado']

/** Mueve el pedido de estado y avisa por correo. Cancelar devuelve el stock. */
export function cambiarEstado(id: number, estado: EstadoPedido, porCliente = false) {
  const pedido = obtenerPedido(id)
  if (ESTADOS_FINALES.includes(pedido.estado)) {
    throw new ErrorHttp(400, `Este pedido ya está ${pedido.estado === 'entregado' ? 'entregado' : 'cancelado'} y no se puede modificar.`)
  }
  if (pedido.estado === estado) return pedidoJson(pedido)

  const actualizado = enTransaccion(() => {
    if (estado === 'cancelado') devolverStock.run(pedido.producto_id)
    return actualizarEstado.get(estado, id) as unknown as PedidoFila
  })
  avisarCambioEstado(actualizado, porCliente)
  return pedidoJson(actualizado)
}

/** Cliente: solo puede cancelar sus propios pedidos mientras sigan pendientes. */
export function cancelarPedidoPropio(sesion: SesionPayload, id: number) {
  const pedido = obtenerPedido(id)
  if (pedido.usuario_id !== Number(sesion.sub)) {
    throw new ErrorHttp(404, 'No encontramos ese pedido.')
  }
  if (pedido.estado !== 'pendiente') {
    throw new ErrorHttp(400, 'Solo puedes cancelar pedidos que todavía están pendientes. Escríbenos por WhatsApp.')
  }
  return cambiarEstado(id, 'cancelado', true)
}

// --- Presupuestos ---

const insertarPresupuesto = db.prepare(
  `INSERT INTO presupuestos (usuario_id, cliente_nombre, producto_id, producto_nombre, costo, detalles)
   VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
)

export function crearPresupuesto(sesion: SesionPayload, datos: DatosPresupuesto) {
  const producto = obtenerProducto(datos.productoId)
  validarMonto(producto, datos.costo)
  const cliente = nombreCliente(sesion, datos.clienteNombre)
  const fila = insertarPresupuesto.get(
    cliente.usuarioId,
    cliente.nombre,
    producto.id,
    producto.nombre,
    datos.costo,
    datos.detalles,
  ) as unknown as PresupuestoFila
  if (sesion.rol === 'cliente') avisarPresupuesto(fila)
  return presupuestoJson(fila)
}

export function listarPresupuestos(usuarioId?: number) {
  const filas = (
    usuarioId === undefined
      ? db.prepare('SELECT * FROM presupuestos ORDER BY id DESC').all()
      : db.prepare('SELECT * FROM presupuestos WHERE usuario_id = ? ORDER BY id DESC').all(usuarioId)
  ) as unknown as PresupuestoFila[]
  return filas.map(presupuestoJson)
}

export function borrarPresupuesto(id: number) {
  if (db.prepare('DELETE FROM presupuestos WHERE id = ?').run(id).changes === 0) {
    throw new ErrorHttp(404, 'No encontramos ese presupuesto.')
  }
}

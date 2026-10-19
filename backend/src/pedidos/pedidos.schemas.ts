import { z } from 'zod'

export const ESTADOS_PEDIDO = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'] as const

const base = {
  productoId: z.string().min(1, 'Elige un producto'),
  // Solo lo usa el admin, para cargar pedidos de clientes sin cuenta.
  clienteNombre: z.string().trim().min(2, 'Ingresa el nombre del cliente').max(80).optional(),
  detalles: z.string().trim().max(500).default(''),
}

export const crearPedidoSchema = z
  .object({
    ...base,
    precio: z.coerce.number().int('El monto debe ser un número entero'),
    metodoEntrega: z.enum(['retiro', 'delivery']),
    direccion: z.string().trim().max(200).optional(),
    metodoPago: z.enum(['efectivo', 'transferencia']),
    fechaEntrega: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige una fecha de entrega'),
  })
  .refine((d) => d.metodoEntrega !== 'delivery' || (d.direccion && d.direccion.length >= 3), {
    message: 'Ingresa la dirección de envío',
    path: ['direccion'],
  })

export const crearPresupuestoSchema = z.object({
  ...base,
  costo: z.coerce.number().int('El monto debe ser un número entero'),
})

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS_PEDIDO),
})

export const filtroPedidosSchema = z.object({
  estado: z.enum([...ESTADOS_PEDIDO, 'activos']).optional(),
})

export const idSchema = z.coerce.number().int().positive()

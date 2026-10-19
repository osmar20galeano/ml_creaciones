import { z } from 'zod'

const MAXIMO_GS = 100_000_000

const precio = z.coerce
  .number()
  .int('Los precios deben ser números enteros')
  .min(0, 'El precio no puede ser negativo')
  .max(MAXIMO_GS, 'El precio es demasiado alto')

const campos = {
  nombre: z.string().trim().min(2, 'El nombre es muy corto').max(80, 'El nombre es muy largo'),
  descripcion: z.string().trim().max(300, 'La descripción es muy larga (máximo 300 caracteres)'),
  precioMin: precio,
  precioMax: precio,
  stock: z.coerce.number().int('El stock debe ser un número entero').min(0, 'El stock no puede ser negativo').max(100_000),
  activo: z.boolean(),
}

const rangoValido = {
  check: (d: { precioMin?: number; precioMax?: number }) =>
    d.precioMin === undefined || d.precioMax === undefined || d.precioMin <= d.precioMax,
  opciones: { message: 'El precio mínimo no puede ser mayor que el máximo', path: ['precioMax'] },
}

export const crearProductoSchema = z
  .object({ ...campos, descripcion: campos.descripcion.default(''), activo: campos.activo.default(true) })
  .refine(rangoValido.check, rangoValido.opciones)

export const editarProductoSchema = z
  .object(campos)
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'No hay cambios para guardar')
  .refine(rangoValido.check, rangoValido.opciones)

export const ajustarStockSchema = z.object({
  cambio: z.coerce.number().int().refine((n) => n !== 0, 'El cambio no puede ser 0'),
})

export const productoIdSchema = z.string().regex(/^[a-z0-9-]{1,60}$/, 'Producto inválido')

import type { z } from 'zod'
import { db, type ProductoFila } from '../db.js'
import { ErrorHttp } from '../errores.js'
import { borrarArchivoImagen, guardarArchivoImagen, urlImagen } from './imagenes.js'
import type { crearProductoSchema, editarProductoSchema } from './productos.schemas.js'

type DatosNuevo = z.infer<typeof crearProductoSchema>
type Cambios = z.infer<typeof editarProductoSchema>

export function productoJson(p: ProductoFila) {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precioMin: p.precio_min,
    precioMax: p.precio_max,
    stock: p.stock,
    activo: p.activo === 1,
    imagenUrl: urlImagen(p.imagen),
  }
}

const porId = db.prepare('SELECT * FROM productos WHERE id = ?')

function obtener(id: string) {
  const producto = porId.get(id) as ProductoFila | undefined
  if (!producto) throw new ErrorHttp(404, 'No encontramos ese producto.')
  return producto
}

/** Catálogo público (solo visibles) o completo para el admin. */
export function listarProductos(incluirOcultos = false) {
  const where = incluirOcultos ? '' : 'WHERE activo = 1'
  const filas = db.prepare(`SELECT * FROM productos ${where} ORDER BY rowid`).all() as unknown as ProductoFila[]
  return filas.map(productoJson)
}

/** "Ramos de Rosas Naturales" → "ramos-de-rosas-naturales" (sin repetir uno existente). */
function generarId(nombre: string) {
  const base =
    nombre
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'producto'

  let id = base
  for (let n = 2; porId.get(id); n++) id = `${base}-${n}`
  return id
}

export function crearProducto(datos: DatosNuevo) {
  const fila = db
    .prepare(
      `INSERT INTO productos (id, nombre, descripcion, precio_min, precio_max, stock, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(
      generarId(datos.nombre),
      datos.nombre,
      datos.descripcion,
      datos.precioMin,
      datos.precioMax,
      datos.stock,
      datos.activo ? 1 : 0,
    ) as unknown as ProductoFila
  return productoJson(fila)
}

const COLUMNAS: Record<keyof Cambios, string> = {
  nombre: 'nombre',
  descripcion: 'descripcion',
  precioMin: 'precio_min',
  precioMax: 'precio_max',
  stock: 'stock',
  activo: 'activo',
}

export function editarProducto(id: string, cambios: Cambios) {
  const actual = obtener(id)

  // Si solo cambia uno de los dos precios, se valida contra el que ya estaba guardado.
  const min = cambios.precioMin ?? actual.precio_min
  const max = cambios.precioMax ?? actual.precio_max
  if (min > max) throw new ErrorHttp(400, 'El precio mínimo no puede ser mayor que el máximo.')

  const claves = Object.keys(cambios) as (keyof Cambios)[]
  const asignaciones = claves.map((k) => `${COLUMNAS[k]} = ?`).join(', ')
  const valores = claves.map((k) => {
    const v = cambios[k]
    return typeof v === 'boolean' ? (v ? 1 : 0) : (v as string | number)
  })

  const fila = db
    .prepare(`UPDATE productos SET ${asignaciones} WHERE id = ? RETURNING *`)
    .get(...valores, id) as unknown as ProductoFila
  return productoJson(fila)
}

/** Suma o resta unidades sin dejar el stock en negativo. */
export function ajustarStock(id: string, cambio: number) {
  obtener(id)
  const fila = db
    .prepare('UPDATE productos SET stock = stock + ? WHERE id = ? AND stock + ? >= 0 RETURNING *')
    .get(cambio, id, cambio) as ProductoFila | undefined
  if (!fila) throw new ErrorHttp(400, 'El stock no puede quedar en negativo.')
  return productoJson(fila)
}

export async function cambiarImagen(id: string, archivo: Express.Multer.File | undefined) {
  const actual = obtener(id)
  const nombre = await guardarArchivoImagen(id, archivo)
  const fila = db.prepare('UPDATE productos SET imagen = ? WHERE id = ? RETURNING *').get(nombre, id) as unknown as ProductoFila
  await borrarArchivoImagen(actual.imagen)
  return productoJson(fila)
}

/** Vuelve a la imagen original incluida en la web (o al logo, si es un producto nuevo). */
export async function quitarImagen(id: string) {
  const actual = obtener(id)
  const fila = db.prepare('UPDATE productos SET imagen = NULL WHERE id = ? RETURNING *').get(id) as unknown as ProductoFila
  await borrarArchivoImagen(actual.imagen)
  return productoJson(fila)
}

import { randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import multer from 'multer'
import { config } from '../config.js'
import { ErrorHttp } from '../errores.js'

// Junto a la base de datos (backend/data/), que ya está fuera de git.
export const CARPETA_IMAGENES = resolve(dirname(config.DATABASE_PATH), 'uploads', 'productos')
mkdirSync(CARPETA_IMAGENES, { recursive: true })

const TAMANO_MAXIMO = 5 * 1024 * 1024

/** Recibe un único archivo en el campo "imagen", en memoria, para revisarlo antes de guardarlo. */
export const recibirImagen = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
}).single('imagen')

/**
 * Detecta el formato por los primeros bytes del archivo (no por el nombre ni por
 * lo que dice el navegador, que se pueden falsificar).
 */
function detectarFormato(datos: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (datos.length < 12) return null
  if (datos[0] === 0xff && datos[1] === 0xd8 && datos[2] === 0xff) return 'jpg'
  if (datos.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (datos.toString('ascii', 0, 4) === 'RIFF' && datos.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

/** Guarda la imagen y devuelve el nombre de archivo. */
export async function guardarArchivoImagen(productoId: string, archivo: Express.Multer.File | undefined) {
  if (!archivo) throw new ErrorHttp(400, 'Elige una imagen para subir.')

  const formato = detectarFormato(archivo.buffer)
  if (!formato) throw new ErrorHttp(400, 'La imagen debe ser JPG, PNG o WebP.')

  // El sufijo aleatorio evita que el navegador muestre la foto vieja guardada en caché.
  const nombre = `${productoId}-${randomBytes(4).toString('hex')}.${formato}`
  await writeFile(join(CARPETA_IMAGENES, nombre), archivo.buffer)
  return nombre
}

export async function borrarArchivoImagen(nombre: string | null) {
  if (!nombre) return
  await unlink(join(CARPETA_IMAGENES, nombre)).catch(() => undefined)
}

export function urlImagen(nombre: string | null) {
  return nombre ? `/api/uploads/productos/${nombre}` : null
}

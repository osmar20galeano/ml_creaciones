import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { config } from '../config.js'
import { db, type CodigoVerificacion } from '../db.js'
import { ErrorHttp } from '../errores.js'

const VIGENCIA_MS = 15 * 60 * 1000
const ESPERA_REENVIO_MS = 60 * 1000
const MAX_INTENTOS = 5

function hashCodigo(codigo: string) {
  return createHmac('sha256', config.JWT_SECRET).update(codigo).digest('hex')
}

/**
 * Códigos de 6 dígitos de un solo uso (confirmar cuenta, recuperar contraseña).
 * Se guardan hasheados, vencen a los 15 min, aceptan 5 intentos y se pueden
 * reenviar cada 60 s.
 */
export function gestorCodigos(tabla: 'codigos_verificacion' | 'codigos_recuperacion') {
  const ultimo = db.prepare(`SELECT * FROM ${tabla} WHERE usuario_id = ? ORDER BY id DESC LIMIT 1`)
  const borrarTodos = db.prepare(`DELETE FROM ${tabla} WHERE usuario_id = ?`)
  const insertar = db.prepare(`INSERT INTO ${tabla} (usuario_id, codigo_hash, expira_en, creado_en) VALUES (?, ?, ?, ?)`)
  const sumarIntento = db.prepare(`UPDATE ${tabla} SET intentos = intentos + 1 WHERE id = ?`)

  function borrar(usuarioId: number) {
    borrarTodos.run(usuarioId)
  }

  return {
    borrar,

    /** Segundos que faltan para poder pedir otro código (0 si ya se puede). */
    esperaRestante(usuarioId: number) {
      const fila = ultimo.get(usuarioId) as CodigoVerificacion | undefined
      if (!fila) return 0
      return Math.max(0, Math.ceil((fila.creado_en + ESPERA_REENVIO_MS - Date.now()) / 1000))
    },

    /** Genera un código nuevo (anula los anteriores) y lo manda con `enviar`. */
    async emitir(usuarioId: number, enviar: (codigo: string) => Promise<void>) {
      const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0')
      const ahora = Date.now()

      borrar(usuarioId)
      insertar.run(usuarioId, hashCodigo(codigo), ahora + VIGENCIA_MS, ahora)

      try {
        await enviar(codigo)
      } catch (err) {
        borrar(usuarioId)
        console.error('Error enviando correo:', err)
        throw new ErrorHttp(502, 'No pudimos enviar el correo con el código. Intenta de nuevo en unos minutos.')
      }
    },

    /** Lanza ErrorHttp si el código no sirve; si es correcto, lo consume. */
    comprobar(usuarioId: number, codigo: string) {
      const fila = ultimo.get(usuarioId) as CodigoVerificacion | undefined
      if (!fila) {
        throw new ErrorHttp(400, 'El código no es válido. Pide uno nuevo.', 'SIN_CODIGO')
      }

      if (fila.expira_en < Date.now()) {
        borrar(usuarioId)
        throw new ErrorHttp(400, 'El código venció. Pide uno nuevo.', 'CODIGO_VENCIDO')
      }

      if (fila.intentos >= MAX_INTENTOS) {
        borrar(usuarioId)
        throw new ErrorHttp(429, 'Demasiados intentos. Pide un código nuevo.', 'DEMASIADOS_INTENTOS')
      }

      const esperado = Buffer.from(fila.codigo_hash, 'hex')
      const recibido = Buffer.from(hashCodigo(codigo), 'hex')
      if (!timingSafeEqual(esperado, recibido)) {
        sumarIntento.run(fila.id)
        const quedan = MAX_INTENTOS - fila.intentos - 1
        if (quedan <= 0) {
          borrar(usuarioId)
          throw new ErrorHttp(429, 'Demasiados intentos. Pide un código nuevo.', 'DEMASIADOS_INTENTOS')
        }
        throw new ErrorHttp(400, `Código incorrecto. Te quedan ${quedan} intento${quedan === 1 ? '' : 's'}.`, 'CODIGO_INCORRECTO')
      }

      borrar(usuarioId)
    },
  }
}

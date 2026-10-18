import bcrypt from 'bcryptjs'
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { config } from '../config.js'
import { db, type CodigoVerificacion, type Usuario } from '../db.js'
import { ErrorHttp } from '../errores.js'
import { enviarCodigoVerificacion } from '../mail.js'

const VIGENCIA_CODIGO_MS = 15 * 60 * 1000
const ESPERA_REENVIO_MS = 60 * 1000
const MAX_INTENTOS = 5
const COSTO_BCRYPT = 10

// Hash fijo para comparar cuando el correo no existe y así tardar lo mismo.
const HASH_FALSO = bcrypt.hashSync('contraseña-inexistente', COSTO_BCRYPT)

const buscarPorEmail = db.prepare('SELECT * FROM usuarios WHERE email = ?')
const insertarUsuario = db.prepare(
  "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'cliente') RETURNING *",
)
const actualizarPendiente = db.prepare('UPDATE usuarios SET nombre = ?, password_hash = ? WHERE id = ?')
const marcarVerificado = db.prepare('UPDATE usuarios SET verificado = 1 WHERE id = ?')
const ultimoCodigo = db.prepare('SELECT * FROM codigos_verificacion WHERE usuario_id = ? ORDER BY id DESC LIMIT 1')
const borrarCodigos = db.prepare('DELETE FROM codigos_verificacion WHERE usuario_id = ?')
const insertarCodigo = db.prepare(
  'INSERT INTO codigos_verificacion (usuario_id, codigo_hash, expira_en, creado_en) VALUES (?, ?, ?, ?)',
)
const sumarIntento = db.prepare('UPDATE codigos_verificacion SET intentos = intentos + 1 WHERE id = ?')

function hashCodigo(codigo: string) {
  return createHmac('sha256', config.JWT_SECRET).update(codigo).digest('hex')
}

function obtenerUsuario(email: string) {
  return buscarPorEmail.get(email) as Usuario | undefined
}

/** Segundos que faltan para poder pedir otro código (0 si ya se puede). */
function esperaRestante(usuarioId: number) {
  const ultimo = ultimoCodigo.get(usuarioId) as CodigoVerificacion | undefined
  if (!ultimo) return 0
  return Math.max(0, Math.ceil((ultimo.creado_en + ESPERA_REENVIO_MS - Date.now()) / 1000))
}

async function emitirCodigo(usuario: Usuario) {
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const ahora = Date.now()

  borrarCodigos.run(usuario.id)
  insertarCodigo.run(usuario.id, hashCodigo(codigo), ahora + VIGENCIA_CODIGO_MS, ahora)

  try {
    await enviarCodigoVerificacion(usuario.email, usuario.nombre, codigo)
  } catch (err) {
    borrarCodigos.run(usuario.id)
    console.error('Error enviando correo:', err)
    throw new ErrorHttp(502, 'No pudimos enviar el correo con el código. Intenta de nuevo en unos minutos.')
  }
}

export async function registrar(datos: { nombre: string; email: string; password: string }) {
  const existente = obtenerUsuario(datos.email)
  if (existente?.verificado) {
    throw new ErrorHttp(409, 'Ese correo ya tiene una cuenta. Inicia sesión.', 'YA_REGISTRADO')
  }

  const passwordHash = await bcrypt.hash(datos.password, COSTO_BCRYPT)

  if (existente) {
    // Se registró antes pero nunca confirmó: actualizamos sus datos.
    actualizarPendiente.run(datos.nombre, passwordHash, existente.id)
    if (esperaRestante(existente.id) === 0) {
      await emitirCodigo({ ...existente, nombre: datos.nombre })
    }
    return
  }

  const usuario = insertarUsuario.get(datos.nombre, datos.email, passwordHash) as unknown as Usuario
  try {
    await emitirCodigo(usuario)
  } catch (err) {
    // Sin correo enviado no tiene sentido dejar la cuenta a medias.
    db.prepare('DELETE FROM usuarios WHERE id = ?').run(usuario.id)
    throw err
  }
}

export function verificar(email: string, codigo: string): Usuario {
  const usuario = obtenerUsuario(email)
  if (usuario?.verificado) {
    throw new ErrorHttp(400, 'Esta cuenta ya está confirmada. Inicia sesión.', 'YA_VERIFICADO')
  }

  const registro = usuario && (ultimoCodigo.get(usuario.id) as CodigoVerificacion | undefined)
  if (!usuario || !registro) {
    throw new ErrorHttp(400, 'El código no es válido. Pide uno nuevo.', 'SIN_CODIGO')
  }

  if (registro.expira_en < Date.now()) {
    borrarCodigos.run(usuario.id)
    throw new ErrorHttp(400, 'El código venció. Pide uno nuevo.', 'CODIGO_VENCIDO')
  }

  if (registro.intentos >= MAX_INTENTOS) {
    borrarCodigos.run(usuario.id)
    throw new ErrorHttp(429, 'Demasiados intentos. Pide un código nuevo.', 'DEMASIADOS_INTENTOS')
  }

  const esperado = Buffer.from(registro.codigo_hash, 'hex')
  const recibido = Buffer.from(hashCodigo(codigo), 'hex')
  if (!timingSafeEqual(esperado, recibido)) {
    sumarIntento.run(registro.id)
    const quedan = MAX_INTENTOS - registro.intentos - 1
    if (quedan <= 0) {
      borrarCodigos.run(usuario.id)
      throw new ErrorHttp(429, 'Demasiados intentos. Pide un código nuevo.', 'DEMASIADOS_INTENTOS')
    }
    throw new ErrorHttp(400, `Código incorrecto. Te quedan ${quedan} intento${quedan === 1 ? '' : 's'}.`, 'CODIGO_INCORRECTO')
  }

  marcarVerificado.run(usuario.id)
  borrarCodigos.run(usuario.id)
  return { ...usuario, verificado: 1 }
}

export async function reenviarCodigo(email: string) {
  const usuario = obtenerUsuario(email)
  if (!usuario) {
    throw new ErrorHttp(404, 'No encontramos una cuenta con ese correo. Regístrate primero.')
  }
  if (usuario.verificado) {
    throw new ErrorHttp(400, 'Esta cuenta ya está confirmada. Inicia sesión.', 'YA_VERIFICADO')
  }

  const espera = esperaRestante(usuario.id)
  if (espera > 0) {
    throw new ErrorHttp(429, `Espera ${espera} segundos para pedir otro código.`, 'ESPERA_REENVIO')
  }

  await emitirCodigo(usuario)
}

export async function login(email: string, password: string): Promise<Usuario> {
  const usuario = obtenerUsuario(email)
  const correcta = await bcrypt.compare(password, usuario?.password_hash ?? HASH_FALSO)
  if (!usuario || !correcta) {
    throw new ErrorHttp(401, 'Correo o contraseña incorrectos.')
  }

  if (!usuario.verificado) {
    if (esperaRestante(usuario.id) === 0) await emitirCodigo(usuario)
    throw new ErrorHttp(403, 'Tu cuenta aún no está confirmada. Te enviamos un código a tu correo.', 'NO_VERIFICADO')
  }

  return usuario
}

export function buscarPorId(id: number) {
  return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) as Usuario | undefined
}

import bcrypt from 'bcryptjs'
import { db, type Usuario } from '../db.js'
import { ErrorHttp } from '../errores.js'
import { avisarCambioPassword, enviarCodigoRecuperacion, enviarCodigoVerificacion } from '../mail.js'
import { gestorCodigos } from './codigos.js'

const COSTO_BCRYPT = 10

// Hash fijo para comparar cuando el correo no existe y así tardar lo mismo.
const HASH_FALSO = bcrypt.hashSync('contraseña-inexistente', COSTO_BCRYPT)

const codigosVerificacion = gestorCodigos('codigos_verificacion')
const codigosRecuperacion = gestorCodigos('codigos_recuperacion')

const buscarPorEmail = db.prepare('SELECT * FROM usuarios WHERE email = ?')
const insertarUsuario = db.prepare(
  "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'cliente') RETURNING *",
)
const actualizarPendiente = db.prepare('UPDATE usuarios SET nombre = ?, password_hash = ? WHERE id = ?')
const marcarVerificado = db.prepare('UPDATE usuarios SET verificado = 1 WHERE id = ?')
const cambiarPassword = db.prepare(
  // Cambiar la contraseña confirma el correo (probó que lo recibe) y cierra las demás sesiones.
  'UPDATE usuarios SET password_hash = ?, verificado = 1, sesion_version = sesion_version + 1 WHERE id = ? RETURNING *',
)

function obtenerUsuario(email: string) {
  return buscarPorEmail.get(email) as Usuario | undefined
}

function emitirCodigoVerificacion(usuario: Usuario) {
  return codigosVerificacion.emitir(usuario.id, (codigo) =>
    enviarCodigoVerificacion(usuario.email, usuario.nombre, codigo),
  )
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
    if (codigosVerificacion.esperaRestante(existente.id) === 0) {
      await emitirCodigoVerificacion({ ...existente, nombre: datos.nombre })
    }
    return
  }

  const usuario = insertarUsuario.get(datos.nombre, datos.email, passwordHash) as unknown as Usuario
  try {
    await emitirCodigoVerificacion(usuario)
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
  if (!usuario) {
    throw new ErrorHttp(400, 'El código no es válido. Pide uno nuevo.', 'SIN_CODIGO')
  }

  codigosVerificacion.comprobar(usuario.id, codigo)
  marcarVerificado.run(usuario.id)
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

  const espera = codigosVerificacion.esperaRestante(usuario.id)
  if (espera > 0) {
    throw new ErrorHttp(429, `Espera ${espera} segundos para pedir otro código.`, 'ESPERA_REENVIO')
  }

  await emitirCodigoVerificacion(usuario)
}

export async function login(email: string, password: string): Promise<Usuario> {
  const usuario = obtenerUsuario(email)
  const correcta = await bcrypt.compare(password, usuario?.password_hash ?? HASH_FALSO)
  if (!usuario || !correcta) {
    throw new ErrorHttp(401, 'Correo o contraseña incorrectos.')
  }

  if (!usuario.verificado) {
    if (codigosVerificacion.esperaRestante(usuario.id) === 0) await emitirCodigoVerificacion(usuario)
    throw new ErrorHttp(403, 'Tu cuenta aún no está confirmada. Te enviamos un código a tu correo.', 'NO_VERIFICADO')
  }

  return usuario
}

/**
 * Paso 1 de "Olvidé mi contraseña". No dice si el correo existe (la respuesta
 * es siempre la misma), para que nadie pueda averiguar quién tiene cuenta.
 */
export async function solicitarRecuperacion(email: string) {
  const usuario = obtenerUsuario(email)
  if (!usuario) return
  // Si pidió uno hace menos de 60 s, el que tiene sigue sirviendo.
  if (codigosRecuperacion.esperaRestante(usuario.id) > 0) return

  await codigosRecuperacion.emitir(usuario.id, (codigo) =>
    enviarCodigoRecuperacion(usuario.email, usuario.nombre, codigo),
  )
}

/** Paso 2: con el código correcto, guarda la nueva contraseña. */
export async function restablecerPassword(email: string, codigo: string, password: string): Promise<Usuario> {
  const usuario = obtenerUsuario(email)
  if (!usuario) {
    throw new ErrorHttp(400, 'El código no es válido. Pide uno nuevo.', 'SIN_CODIGO')
  }

  codigosRecuperacion.comprobar(usuario.id, codigo)

  const hash = await bcrypt.hash(password, COSTO_BCRYPT)
  const actualizado = cambiarPassword.get(hash, usuario.id) as unknown as Usuario
  codigosVerificacion.borrar(usuario.id)

  avisarCambioPassword(actualizado.email, actualizado.nombre).catch((err) =>
    console.error('✉️  No se pudo enviar el aviso de cambio de contraseña:', err),
  )
  return actualizado
}

export function buscarPorId(id: number) {
  return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) as Usuario | undefined
}

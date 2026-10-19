import { Router, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { usuarioPublico, type Usuario } from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'
import * as auth from './auth.service.js'
import { emailSchema, loginSchema, registroSchema, restablecerSchema, verificarSchema } from './schemas.js'
import { cerrarSesion, crearSesion } from './tokens.js'

function iniciarSesion(res: Response, usuario: Usuario) {
  crearSesion(res, { sub: String(usuario.id), rol: usuario.rol, v: usuario.sesion_version })
}

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos desde este dispositivo. Espera unos minutos.' },
})

export const authRouter = Router()

authRouter.post('/registro', limitador, async (req, res) => {
  const datos = registroSchema.parse(req.body)
  await auth.registrar(datos)
  res.status(201).json({ ok: true, email: datos.email })
})

authRouter.post('/verificar', limitador, (req, res) => {
  const { email, codigo } = verificarSchema.parse(req.body)
  const usuario = auth.verificar(email, codigo)
  iniciarSesion(res, usuario)
  res.json({ usuario: usuarioPublico(usuario) })
})

authRouter.post('/reenviar-codigo', limitador, async (req, res) => {
  const { email } = emailSchema.parse(req.body)
  await auth.reenviarCodigo(email)
  res.json({ ok: true })
})

authRouter.post('/login', limitador, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  const usuario = await auth.login(email, password)
  iniciarSesion(res, usuario)
  res.json({ usuario: usuarioPublico(usuario) })
})

authRouter.post('/olvide', limitador, async (req, res) => {
  const { email } = emailSchema.parse(req.body)
  await auth.solicitarRecuperacion(email)
  // Misma respuesta exista o no la cuenta.
  res.json({ ok: true })
})

authRouter.post('/restablecer', limitador, async (req, res) => {
  const { email, codigo, password } = restablecerSchema.parse(req.body)
  const usuario = await auth.restablecerPassword(email, codigo, password)
  iniciarSesion(res, usuario)
  res.json({ usuario: usuarioPublico(usuario) })
})

authRouter.post('/logout', (_req, res) => {
  cerrarSesion(res)
  res.json({ ok: true })
})

authRouter.get('/yo', requireAuth, (req, res) => {
  const usuario = auth.buscarPorId(Number(req.sesion!.sub))
  if (!usuario) {
    cerrarSesion(res)
    res.status(401).json({ error: 'Debes iniciar sesión' })
    return
  }
  res.json({ usuario: usuarioPublico(usuario) })
})

import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { usuarioPublico } from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'
import * as auth from './auth.service.js'
import { emailSchema, loginSchema, registroSchema, verificarSchema } from './schemas.js'
import { cerrarSesion, crearSesion } from './tokens.js'

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
  crearSesion(res, { sub: String(usuario.id), rol: usuario.rol })
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
  crearSesion(res, { sub: String(usuario.id), rol: usuario.rol })
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

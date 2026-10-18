import type { Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export type Rol = 'admin' | 'cliente'

export interface SesionPayload {
  sub: string
  rol: Rol
}

export const COOKIE_SESION = 'ml_sesion'
const DURACION_MS = 7 * 24 * 60 * 60 * 1000

export function crearSesion(res: Response, payload: SesionPayload) {
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: DURACION_MS / 1000 })
  res.cookie(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.esProduccion,
    maxAge: DURACION_MS,
    path: '/',
  })
}

export function cerrarSesion(res: Response) {
  res.clearCookie(COOKIE_SESION, { path: '/' })
}

export function leerSesion(token: string | undefined): SesionPayload | null {
  if (!token) return null
  try {
    const datos = jwt.verify(token, config.JWT_SECRET)
    if (typeof datos === 'string' || !datos.sub) return null
    return { sub: datos.sub, rol: datos.rol as Rol }
  } catch {
    return null
  }
}

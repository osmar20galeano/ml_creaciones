import type { NextFunction, Request, Response } from 'express'
import { cerrarSesion, COOKIE_SESION, leerSesion, type Rol, type SesionPayload } from '../auth/tokens.js'
import { db } from '../db.js'

declare module 'express-serve-static-core' {
  interface Request {
    sesion?: SesionPayload
  }
}

const versionDeSesion = db.prepare('SELECT sesion_version FROM usuarios WHERE id = ?')

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sesion = leerSesion(req.cookies?.[COOKIE_SESION])
  const usuario = sesion && (versionDeSesion.get(Number(sesion.sub)) as { sesion_version: number } | undefined)
  // Sin cookie, usuario borrado o contraseña cambiada desde otro dispositivo.
  if (!sesion || !usuario || usuario.sesion_version !== sesion.v) {
    if (sesion) cerrarSesion(res)
    res.status(401).json({ error: 'Debes iniciar sesión' })
    return
  }
  req.sesion = sesion
  next()
}

export function requireRol(rol: Rol) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (req.sesion?.rol !== rol) {
        res.status(403).json({ error: 'No tienes permiso para esto' })
        return
      }
      next()
    })
  }
}

import { pedir } from './http'

export { ErrorApi } from './http'

export type Rol = 'admin' | 'cliente'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
}

export interface DatosRegistro {
  nombre: string
  email: string
  password: string
  confirmarPassword: string
}

export const authApi = {
  yo: () => pedir<{ usuario: Usuario }>('/auth/yo').then((d) => d.usuario),
  registrar: (datos: DatosRegistro) => pedir<{ email: string }>('/auth/registro', 'POST', datos),
  verificar: (email: string, codigo: string) =>
    pedir<{ usuario: Usuario }>('/auth/verificar', 'POST', { email, codigo }).then((d) => d.usuario),
  reenviarCodigo: (email: string) => pedir<{ ok: true }>('/auth/reenviar-codigo', 'POST', { email }),
  login: (email: string, password: string) =>
    pedir<{ usuario: Usuario }>('/auth/login', 'POST', { email, password }).then((d) => d.usuario),
  logout: () => pedir<{ ok: true }>('/auth/logout', 'POST', {}),
}

import { createContext } from 'react'
import type { DatosRegistro, Usuario } from '../api/auth'

export interface AuthContextValue {
  usuario: Usuario | null
  /** true mientras se consulta si ya hay una sesión abierta. */
  cargando: boolean
  login: (email: string, password: string) => Promise<Usuario>
  registrar: (datos: DatosRegistro) => Promise<void>
  verificar: (email: string, codigo: string) => Promise<Usuario>
  reenviarCodigo: (email: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

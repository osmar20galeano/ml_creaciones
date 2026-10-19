import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type DatosRegistro, type Usuario } from '../api/auth'
import { AuthContext, type AuthContextValue } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    authApi
      .yo()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const u = await authApi.login(email, password)
    setUsuario(u)
    return u
  }, [])

  const registrar = useCallback(async (datos: DatosRegistro) => {
    await authApi.registrar(datos)
  }, [])

  const verificar = useCallback(async (email: string, codigo: string) => {
    const u = await authApi.verificar(email, codigo)
    setUsuario(u)
    return u
  }, [])

  const reenviarCodigo = useCallback(async (email: string) => {
    await authApi.reenviarCodigo(email)
  }, [])

  const solicitarRecuperacion = useCallback(async (email: string) => {
    await authApi.olvide(email)
  }, [])

  const restablecerPassword = useCallback(
    async (email: string, codigo: string, password: string, confirmarPassword: string) => {
      const u = await authApi.restablecer({ email, codigo, password, confirmarPassword })
      setUsuario(u)
      return u
    },
    [],
  )

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined)
    setUsuario(null)
  }, [])

  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      login,
      registrar,
      verificar,
      reenviarCodigo,
      solicitarRecuperacion,
      restablecerPassword,
      logout,
    }),
    [usuario, cargando, login, registrar, verificar, reenviarCodigo, solicitarRecuperacion, restablecerPassword, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

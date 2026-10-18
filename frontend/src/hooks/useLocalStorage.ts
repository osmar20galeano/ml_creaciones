import { useEffect, useState } from 'react'

function leer<T>(clave: string, inicial: T): T {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado === null ? inicial : (JSON.parse(guardado) as T)
  } catch {
    return inicial
  }
}

/** useState que se guarda en localStorage. Si el navegador lo bloquea, funciona solo en memoria. */
export function useLocalStorage<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => leer(clave, inicial))

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      // Sin almacenamiento disponible (modo privado, cuota llena…).
    }
  }, [clave, valor])

  return [valor, setValor] as const
}

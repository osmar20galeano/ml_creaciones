import { useEffect, useState } from 'react'

/** Segundos que faltan (baja de a 1 por segundo) y una función para reiniciar. */
export function useCuentaRegresiva(inicial: number) {
  const [restante, setRestante] = useState(inicial)

  useEffect(() => {
    if (restante <= 0) return
    const t = setTimeout(() => setRestante((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [restante])

  return [restante, setRestante] as const
}

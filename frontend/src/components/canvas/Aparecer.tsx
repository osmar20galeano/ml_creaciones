import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Muestra su contenido con una animación suave cuando entra en pantalla. */
export function Aparecer({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return (
    <div ref={ref} className={`aparecer ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

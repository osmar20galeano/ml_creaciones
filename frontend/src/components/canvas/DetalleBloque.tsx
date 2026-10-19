import { useEffect, useRef } from 'react'
import { bloques, type IdBloque } from '../../data/canvas'
import { ContenidoBloque } from './ContenidoBloque'

const ordenados = [...bloques].sort((a, b) => a.numero - b.numero)

interface Props {
  id: IdBloque
  onIr: (id: IdBloque) => void
  onCerrar: () => void
}

/** Ventana con la justificación de un bloque; ← → recorren los 9 bloques en orden. */
export function DetalleBloque({ id, onIr, onCerrar }: Props) {
  const indice = ordenados.findIndex((b) => b.id === id)
  const bloque = ordenados[indice]
  const anterior = ordenados[indice - 1]
  const siguiente = ordenados[indice + 1]
  const cuerpo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  useEffect(() => {
    cuerpo.current?.scrollTo({ top: 0 })
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'ArrowRight' && siguiente) onIr(siguiente.id)
      if (e.key === 'ArrowLeft' && anterior) onIr(anterior.id)
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [anterior, siguiente, onIr, onCerrar])

  return (
    <div className="detalle-fondo" onClick={onCerrar}>
      <div
        className={`detalle-panel area-${bloque.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="detalle-cabecera">
          <span className="detalle-numero">{bloque.numero}</span>
          <div className="flex-grow-1">
            <small className="detalle-paso">Bloque {bloque.numero} de 9</small>
            <h3 id="detalle-titulo" className="detalle-titulo">
              <i className={`bi ${bloque.icono} me-2`} />
              {bloque.titulo}
            </h3>
          </div>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
        </header>

        <div className="detalle-progreso" aria-hidden="true">
          <span style={{ width: `${(bloque.numero / 9) * 100}%` }} />
        </div>

        <div className="detalle-cuerpo" ref={cuerpo}>
          <ContenidoBloque bloque={bloque} onIr={onIr} />
        </div>

        <footer className="detalle-pie">
          <button type="button" className="btn btn-outline-secondary" disabled={!anterior} onClick={() => anterior && onIr(anterior.id)}>
            <i className="bi bi-arrow-left me-1" />
            <span className="d-none d-sm-inline">{anterior ? anterior.titulo : 'Anterior'}</span>
          </button>
          <span className="detalle-ayuda d-none d-md-inline">Usa ← → del teclado</span>
          {siguiente ? (
            <button type="button" className="btn btn-custom" onClick={() => onIr(siguiente.id)}>
              <span className="d-none d-sm-inline">{siguiente.titulo}</span>
              <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-custom" onClick={onCerrar}>
              Terminar recorrido <i className="bi bi-check2 ms-1" />
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

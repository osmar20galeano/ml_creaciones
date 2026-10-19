import { useState } from 'react'
import { bloques, type IdBloque } from '../../data/canvas'

/** Conexiones en ambos sentidos, para resaltar al pasar el mouse. */
const relacionados = new Map<IdBloque, Set<IdBloque>>()
for (const b of bloques) {
  for (const { con } of b.conexiones) {
    if (!relacionados.has(b.id)) relacionados.set(b.id, new Set())
    if (!relacionados.has(con)) relacionados.set(con, new Set())
    relacionados.get(b.id)!.add(con)
    relacionados.get(con)!.add(b.id)
  }
}

/** El lienzo de Osterwalder: 9 bloques en su disposición clásica. */
export function LienzoCanvas({ onAbrir }: { onAbrir: (id: IdBloque) => void }) {
  const [activo, setActivo] = useState<IdBloque | null>(null)
  const vecinos = activo ? relacionados.get(activo) : undefined

  return (
    <div className={`lienzo ${activo ? 'lienzo-enfocado' : ''}`}>
      {bloques.map((b) => {
        const estado = !activo ? '' : b.id === activo ? 'es-activo' : vecinos?.has(b.id) ? 'es-vecino' : 'es-lejano'
        return (
          <button
            key={b.id}
            type="button"
            className={`lienzo-bloque area-${b.id} ${estado}`}
            onMouseEnter={() => setActivo(b.id)}
            onMouseLeave={() => setActivo(null)}
            onFocus={() => setActivo(b.id)}
            onBlur={() => setActivo(null)}
            onClick={() => onAbrir(b.id)}
            aria-label={`${b.numero}. ${b.titulo}: ver justificación`}
          >
            <span className="lienzo-cabecera">
              <span className="lienzo-numero">{b.numero}</span>
              <i className={`bi ${b.icono} lienzo-icono`} />
            </span>
            <span className="lienzo-titulo">{b.titulo}</span>
            <ul className="lienzo-sintesis">
              {b.sintesis.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <span className="lienzo-ver">
              Ver justificación <i className="bi bi-arrow-right-short" />
            </span>
          </button>
        )
      })}
    </div>
  )
}

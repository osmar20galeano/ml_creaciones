import { bloques, type Bloque, type IdBloque } from '../../data/canvas'
import { TextoMarcado } from './TextoMarcado'

const porId = new Map(bloques.map((b) => [b.id, b]))

interface Props {
  bloque: Bloque
  /** Si se pasa, las conexiones son botones que llevan a ese bloque. */
  onIr?: (id: IdBloque) => void
}

/** Justificación completa de un bloque y sus conexiones con el resto del modelo. */
export function ContenidoBloque({ bloque, onIr }: Props) {
  return (
    <>
      <p className="canvas-pregunta">
        <i className="bi bi-question-circle me-2" />
        {bloque.pregunta}
      </p>

      {bloque.justificacion.parrafos.map((p, i) => (
        <p key={i}>
          <TextoMarcado texto={p} />
        </p>
      ))}
      {bloque.justificacion.puntos && (
        <ul className="canvas-lista">
          {bloque.justificacion.puntos.map((p, i) => (
            <li key={i}>
              <TextoMarcado texto={p} />
            </li>
          ))}
        </ul>
      )}

      <h4 className="canvas-subtitulo">
        <i className="bi bi-link-45deg me-1" /> Coherencia con otros bloques
      </h4>
      <div className="canvas-conexiones">
        {bloque.conexiones.map(({ con, motivo }) => {
          const destino = porId.get(con)!
          const contenido = (
            <>
              <span className="canvas-chip-titulo">
                <i className={`bi ${destino.icono} me-1`} />
                {destino.numero}. {destino.titulo}
              </span>
              <span className="canvas-chip-motivo">{motivo}</span>
            </>
          )
          return onIr ? (
            <button key={con} type="button" className="canvas-chip" onClick={() => onIr(con)}>
              {contenido}
            </button>
          ) : (
            <div key={con} className="canvas-chip">
              {contenido}
            </div>
          )
        })}
      </div>
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Aparecer } from '../components/canvas/Aparecer'
import { CalculadoraEquilibrio } from '../components/canvas/CalculadoraEquilibrio'
import { ContenidoBloque } from '../components/canvas/ContenidoBloque'
import { DetalleBloque } from '../components/canvas/DetalleBloque'
import { LienzoCanvas } from '../components/canvas/LienzoCanvas'
import { TextoMarcado } from '../components/canvas/TextoMarcado'
import { bloques, catalogo, conclusion, proyecto, sistemaWeb, type IdBloque } from '../data/canvas'
import { negocio } from '../data/negocio'
import '../styles/canvas.css'
import { formatearGuaranies } from '../utils/formato'

const SECCIONES = [
  { id: 'metodologia', etiqueta: 'Metodología' },
  { id: 'ficha', etiqueta: 'Ficha' },
  { id: 'lienzo', etiqueta: 'Lienzo' },
  { id: 'bloques', etiqueta: '9 bloques' },
  { id: 'numeros', etiqueta: 'Números' },
  { id: 'sistema', etiqueta: 'Sistema web' },
  { id: 'conclusion', etiqueta: 'Conclusión' },
]

const AREAS = [
  { titulo: 'Clientes', icono: 'bi-people', bloques: 'Segmentos · Canales · Relación', clase: 'area-clientes' },
  { titulo: 'Oferta', icono: 'bi-gift', bloques: 'Propuesta de valor', clase: 'area-oferta' },
  { titulo: 'Infraestructura', icono: 'bi-gear', bloques: 'Actividades · Recursos · Socios', clase: 'area-infra' },
  { titulo: 'Viabilidad', icono: 'bi-graph-up', bloques: 'Ingresos · Costos', clase: 'area-viabilidad' },
]

const PRECIO_TOPE = Math.max(...catalogo.map((c) => c.max))
const porId = new Map(bloques.map((b) => [b.id, b]))
const ordenados = [...bloques].sort((a, b) => a.numero - b.numero)

const irA = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function VolverInicio({ className = '' }: { className?: string }) {
  return (
    <Link to="/login" className={`btn btn-custom ${className}`}>
      <i className="bi bi-house-door me-1" /> Volver al inicio
    </Link>
  )
}

export function ModeloCanvas() {
  const [abierto, setAbierto] = useState<IdBloque | null>(null)
  const [expandido, setExpandido] = useState<IdBloque | null>('propuesta')
  const cerrar = useCallback(() => setAbierto(null), [])

  useEffect(() => {
    document.title = `Modelo Canvas · ${proyecto.nombre}`
    window.scrollTo({ top: 0 })
    return () => {
      document.title = 'M.L. Creaciones - Sistema Comercial'
    }
  }, [])

  return (
    <div className="canvas-pagina">
      {/* Barra superior fija */}
      <nav className="canvas-nav">
        <div className="container d-flex align-items-center gap-3">
          <button type="button" className="canvas-marca" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={negocio.logo} alt="" />
            <span className="d-none d-sm-inline">Modelo Canvas</span>
          </button>
          <div className="canvas-nav-links d-none d-lg-flex">
            {SECCIONES.map((s) => (
              <button key={s.id} type="button" onClick={() => irA(s.id)}>
                {s.etiqueta}
              </button>
            ))}
          </div>
          <VolverInicio className="btn-sm ms-auto" />
        </div>
      </nav>

      {/* Portada */}
      <header className="canvas-hero">
        <div className="container text-center">
          <img src={negocio.logo} alt={proyecto.nombre} className="canvas-hero-logo" />
          <p className="canvas-hero-materia">
            Trabajo Práctico · {proyecto.materia}
            <br />
            {proyecto.carrera}
          </p>
          <h1 className="canvas-hero-titulo">Modelo de Negocio Canvas</h1>
          <p className="canvas-hero-nombre">{proyecto.nombre}</p>
          <p className="canvas-hero-slogan">“{proyecto.slogan}”</p>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            <button type="button" className="btn btn-custom btn-lg" onClick={() => irA('lienzo')}>
              <i className="bi bi-grid-3x3-gap me-2" />
              Ver el lienzo
            </button>
            <button type="button" className="btn btn-outline-light btn-lg" onClick={() => setAbierto('propuesta')}>
              <i className="bi bi-play-circle me-2" />
              Recorrido guiado 1 → 9
            </button>
          </div>
          <button type="button" className="canvas-hero-bajar" onClick={() => irA('metodologia')} aria-label="Bajar">
            <i className="bi bi-chevron-double-down" />
          </button>
        </div>
      </header>

      <main>
        {/* 1. Metodología */}
        <section id="metodologia" className="canvas-seccion">
          <div className="container">
            <Aparecer>
              <p className="canvas-etiqueta">Introducción</p>
              <h2 className="canvas-h2">¿Qué es el Modelo Canvas?</h2>
              <div className="row g-4 align-items-center">
                <div className="col-12 col-lg-6">
                  <p className="canvas-lead">
                    El <strong>Business Model Canvas</strong> es una herramienta creada por <strong>Alexander Osterwalder</strong>{' '}
                    junto a Yves Pigneur (2010) para describir, analizar y diseñar modelos de negocio en una sola hoja.
                  </p>
                  <p>
                    Divide el negocio en <strong>9 bloques</strong> que responden cuatro preguntas: <em>para quién</em> creamos
                    valor, <em>qué</em> ofrecemos, <em>cómo</em> lo hacemos y <em>cuánto</em> cuesta y genera. Su fuerza está en
                    mostrar las relaciones: un cambio en un bloque impacta en los demás.
                  </p>
                  <p className="mb-0">
                    En este trabajo aplicamos el Canvas a <strong>{proyecto.nombre}</strong>, un emprendimiento de regalos
                    personalizados que además desarrolló su propia tienda web para ordenar las ventas.
                  </p>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="row g-3">
                    {AREAS.map((a) => (
                      <div className="col-6" key={a.titulo}>
                        <div className={`canvas-area ${a.clase}`}>
                          <i className={`bi ${a.icono}`} />
                          <strong>{a.titulo}</strong>
                          <span>{a.bloques}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Aparecer>
          </div>
        </section>

        {/* 2. Ficha del proyecto */}
        <section id="ficha" className="canvas-seccion canvas-seccion-alt">
          <div className="container">
            <Aparecer>
              <p className="canvas-etiqueta">Desarrollo</p>
              <h2 className="canvas-h2">Ficha del proyecto</h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="ficha-tarjeta">
                    <i className="bi bi-shop" />
                    <h3>Nombre comercial</h3>
                    <p className="ficha-destacado">{proyecto.nombre}</p>
                    <p className="text-muted mb-0">“{proyecto.slogan}”</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="ficha-tarjeta">
                    <i className="bi bi-tag" />
                    <h3>Rubro</h3>
                    <p className="mb-0">{proyecto.rubro}</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="ficha-tarjeta">
                    <i className="bi bi-compass" />
                    <h3>Misión</h3>
                    <p className="mb-0">{proyecto.mision}</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="ficha-tarjeta">
                    <i className="bi bi-eye" />
                    <h3>Visión</h3>
                    <p className="mb-0">{proyecto.vision}</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="ficha-tarjeta ficha-problema">
                    <i className="bi bi-lightbulb" />
                    <h3>Problema o necesidad que resuelve</h3>
                    <p className="mb-0">{proyecto.problema}</p>
                  </div>
                </div>
              </div>
            </Aparecer>
          </div>
        </section>

        {/* 3. Lienzo gráfico */}
        <section id="lienzo" className="canvas-seccion">
          <div className="container-xl">
            <Aparecer>
              <p className="canvas-etiqueta text-center">El lienzo</p>
              <h2 className="canvas-h2 text-center">Lienzo Canvas de {proyecto.nombre}</h2>
              <p className="text-center text-muted mb-4">
                <i className="bi bi-hand-index me-1" />
                Pasa el mouse sobre un bloque para ver con cuáles se conecta, y tócalo para leer su justificación.
              </p>
              <LienzoCanvas onAbrir={setAbierto} />
            </Aparecer>
          </div>
        </section>

        {/* 4. Justificación de los 9 bloques */}
        <section id="bloques" className="canvas-seccion canvas-seccion-alt">
          <div className="container">
            <Aparecer>
              <p className="canvas-etiqueta">Análisis</p>
              <h2 className="canvas-h2">Justificación de los 9 bloques</h2>
            </Aparecer>
            <div className="acordeon">
              {ordenados.map((b) => {
                const abiertoAqui = expandido === b.id
                return (
                  <div key={b.id} className={`acordeon-item area-${b.id} ${abiertoAqui ? 'abierto' : ''}`}>
                    <button
                      type="button"
                      className="acordeon-boton"
                      aria-expanded={abiertoAqui}
                      onClick={() => setExpandido(abiertoAqui ? null : b.id)}
                    >
                      <span className="acordeon-numero">{b.numero}</span>
                      <i className={`bi ${b.icono} acordeon-icono`} />
                      <span className="acordeon-titulo">{b.titulo}</span>
                      <i className="bi bi-chevron-down acordeon-flecha" />
                    </button>
                    {abiertoAqui && (
                      <div className="acordeon-cuerpo">
                        <ContenidoBloque
                          bloque={b}
                          onIr={(id) => {
                            setExpandido(id)
                            requestAnimationFrame(() => irA('bloques'))
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. Ingresos y costos */}
        <section id="numeros" className="canvas-seccion">
          <div className="container">
            <Aparecer>
              <p className="canvas-etiqueta">Viabilidad financiera</p>
              <h2 className="canvas-h2">Ingresos y costos</h2>
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <h3 className="canvas-h3">
                    <i className="bi bi-cash-coin me-2" />
                    Rangos de precio del catálogo
                  </h3>
                  <p className="text-muted small">
                    Cada producto tiene un precio mínimo y máximo; el final depende de la personalización.
                  </p>
                  <div className="rangos">
                    {catalogo.map((c) => (
                      <div className="rango" key={c.producto}>
                        <div className="rango-texto">
                          <span>{c.producto}</span>
                          <span className="text-muted">
                            {formatearGuaranies(c.min)} – {formatearGuaranies(c.max)}
                          </span>
                        </div>
                        <div className="rango-pista">
                          <span
                            className="rango-barra"
                            style={{
                              left: `${(c.min / PRECIO_TOPE) * 100}%`,
                              width: `${Math.max(((c.max - c.min) / PRECIO_TOPE) * 100, 2)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <h3 className="canvas-h3">
                    <i className="bi bi-calculator me-2" />
                    Punto de equilibrio
                  </h3>
                  <p className="text-muted small">
                    ¿Cuántos pedidos al mes hacen falta para cubrir los costos fijos? Modifica los valores.
                  </p>
                  <CalculadoraEquilibrio />
                </div>
              </div>
            </Aparecer>
          </div>
        </section>

        {/* 6. Sistema web */}
        <section id="sistema" className="canvas-seccion canvas-seccion-oscura">
          <div className="container">
            <Aparecer>
              <p className="canvas-etiqueta">Innovación</p>
              <h2 className="canvas-h2">El sistema web dentro del modelo</h2>
              <p className="canvas-lead mb-4">
                La tienda online que desarrollamos no es un extra: materializa varios bloques del Canvas.
              </p>
              <div className="row g-3">
                {sistemaWeb.map((s) => {
                  const b = porId.get(s.bloque)!
                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={s.bloque}>
                      <button type="button" className="sistema-tarjeta" onClick={() => setAbierto(s.bloque)}>
                        <span className="sistema-bloque">
                          <i className={`bi ${b.icono} me-1`} />
                          {b.numero}. {b.titulo}
                        </span>
                        <span>{s.funcion}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="text-center mt-4">
                <Link to="/" className="btn btn-outline-light">
                  <i className="bi bi-shop me-1" /> Ver la tienda funcionando
                </Link>
              </div>
            </Aparecer>
          </div>
        </section>

        {/* 7. Conclusión */}
        <section id="conclusion" className="canvas-seccion">
          <div className="container">
            <Aparecer>
              <p className="canvas-etiqueta">Cierre</p>
              <h2 className="canvas-h2">Conclusión</h2>
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="conclusion-tarjeta">
                    <h3 className="canvas-h3">
                      <i className="bi bi-mortarboard me-2" />
                      Lecciones aprendidas
                    </h3>
                    <ul className="canvas-lista mb-0">
                      {conclusion.lecciones.map((l) => (
                        <li key={l}>
                          <TextoMarcado texto={l} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="conclusion-tarjeta">
                    <h3 className="canvas-h3">
                      <i className="bi bi-check2-circle me-2" />
                      Viabilidad del proyecto
                    </h3>
                    <ul className="canvas-lista mb-0">
                      {conclusion.viabilidad.map((v) => (
                        <li key={v}>
                          <TextoMarcado texto={v} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Aparecer>
          </div>
        </section>
      </main>

      <footer className="canvas-footer">
        <div className="container text-center">
          <h2 className="canvas-footer-titulo">¡Gracias por leer!</h2>
          <p className="mb-4">{proyecto.nombre} · “{proyecto.slogan}”</p>
          <VolverInicio className="btn-lg" />
          <p className="canvas-referencias">
            Referencias: A. Osterwalder e Y. Pigneur, <em>Generación de Modelos de Negocio</em>, Deusto, 2011 (orig.{' '}
            <em>Business Model Generation</em>, Wiley, 2010) · Strategyzer AG, “The Business Model Canvas”,
            strategyzer.com/canvas.
          </p>
        </div>
      </footer>

      {abierto && <DetalleBloque id={abierto} onIr={setAbierto} onCerrar={cerrar} />}
    </div>
  )
}

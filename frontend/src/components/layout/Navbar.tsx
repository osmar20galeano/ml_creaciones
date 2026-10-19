import { Link } from 'react-router'
import { negocio } from '../../data/negocio'
import { MenuUsuario } from './MenuUsuario'

export function Navbar() {
  const urlWhatsapp = `https://wa.me/${negocio.whatsapp.numero}?text=${encodeURIComponent(negocio.whatsapp.mensaje)}`

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm mb-4">
      <div className="container d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
        <Link className="navbar-brand d-flex align-items-center flex-column flex-sm-row text-center text-sm-start" to="/">
          <img src={negocio.logo} alt={negocio.nombre} className="logo-tienda me-sm-3 mb-2 mb-sm-0" />
          <div className="d-flex flex-column justify-content-center">
            <span className="fw-bold navbar-brand-custom mb-0 lh-1">{negocio.nombre}</span>
            <small className="italic-slogan mt-1">✨ {negocio.slogan}</small>
          </div>
        </Link>

        <div className="d-flex gap-3 justify-content-center my-2 my-lg-0">
          {negocio.redes.map((red) => (
            <a
              key={red.nombre}
              href={red.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`social-icon ${red.clase}`}
              title={`Síguenos en ${red.nombre}`}
              aria-label={red.nombre}
            >
              <i className={`bi ${red.icono}`} />
            </a>
          ))}
        </div>

        <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success shadow-sm">
          <i className="bi bi-whatsapp" /> Enviar WhatsApp
        </a>

        <MenuUsuario />
      </div>
    </nav>
  )
}

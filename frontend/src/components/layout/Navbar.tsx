import { negocio } from '../../data/negocio'

export function Navbar() {
  const urlWhatsapp = `https://wa.me/${negocio.whatsapp.numero}?text=${encodeURIComponent(negocio.whatsapp.mensaje)}`

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm mb-4">
      <div className="container d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
        <a className="navbar-brand d-flex align-items-center flex-column flex-sm-row text-center text-sm-start" href="#">
          <img src={negocio.logo} alt={negocio.nombre} className="logo-tienda me-sm-3 mb-2 mb-sm-0" />
          <div className="d-flex flex-column justify-content-center">
            <span className="fw-bold navbar-brand-custom mb-0 lh-1">{negocio.nombre}</span>
            <small className="italic-slogan mt-1">✨ {negocio.slogan}</small>
          </div>
        </a>

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

        <div className="text-center text-lg-end">
          <div className="mb-1">
            <span className="text-muted small d-block d-sm-inline me-sm-2">📍 Nuestras Sedes:</span>
            {negocio.sedes.map((sede) => (
              <a key={sede.nombre} href={sede.mapa} target="_blank" rel="noopener noreferrer" className="link-local me-2">
                <i className="bi bi-geo-alt-fill text-danger" /> {sede.nombre}
              </a>
            ))}
          </div>
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success mt-1 shadow-sm">
            <i className="bi bi-whatsapp" /> Enviar WhatsApp
          </a>
        </div>
      </div>
    </nav>
  )
}

import { NavLink } from 'react-router'

const SECCIONES = [
  { ruta: '/admin', etiqueta: 'Pedidos', icono: 'bi-receipt' },
  { ruta: '/admin/productos', etiqueta: 'Productos', icono: 'bi-box-seam' },
]

/** Pestañas del panel de administración. */
export function AdminNav() {
  return (
    <ul className="nav nav-pills admin-nav mb-4">
      {SECCIONES.map((s) => (
        <li className="nav-item" key={s.ruta}>
          <NavLink to={s.ruta} end className="nav-link">
            <i className={`bi ${s.icono} me-1`} />
            {s.etiqueta}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

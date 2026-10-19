import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { mensajeDeError } from '../../api/http'
import { tiendaApi } from '../../api/tienda'
import { imagenDe } from '../../data/imagenes'
import type { DatosProducto, Producto } from '../../types'
import { formatearGuaranies } from '../../utils/formato'

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 5

interface Props {
  /** null = producto nuevo */
  producto: Producto | null
  onCerrar: () => void
  onGuardado: (producto: Producto, esNuevo: boolean) => void
}

export function ModalProducto({ producto, onCerrar, onGuardado }: Props) {
  const esNuevo = producto === null

  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [precioMin, setPrecioMin] = useState(producto ? String(producto.precioMin) : '')
  const [precioMax, setPrecioMax] = useState(producto ? String(producto.precioMax) : '')
  const [stock, setStock] = useState(producto ? String(producto.stock) : '0')
  const [activo, setActivo] = useState(producto?.activo ?? true)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
  const [quitarFoto, setQuitarFoto] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Bloquea el scroll de la página y permite cerrar con Escape.
  useEffect(() => {
    document.body.classList.add('modal-open')
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', alPresionar)
    }
  }, [onCerrar])

  // Libera la memoria de la vista previa anterior al cambiarla o al cerrar.
  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia)
    }
  }, [vistaPrevia])

  function elegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const elegido = e.target.files?.[0]
    e.target.value = ''
    if (!elegido) return
    if (!TIPOS_IMAGEN.includes(elegido.type)) {
      setError('La imagen debe ser JPG, PNG o WebP.')
      return
    }
    if (elegido.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen pesa demasiado (máximo ${MAX_MB} MB).`)
      return
    }
    setError('')
    setArchivo(elegido)
    setQuitarFoto(false)
    setVistaPrevia(URL.createObjectURL(elegido))
  }

  // Qué foto se ve ahora mismo: la recién elegida, o la guardada (o la original si se va a quitar la subida).
  let imagenActual = vistaPrevia
  if (!imagenActual && producto) imagenActual = quitarFoto ? imagenDe(producto.id) : producto.imagen
  const tieneFotoSubida = !!producto?.imagenUrl && !quitarFoto && !archivo

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const datos: DatosProducto = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precioMin: Number.parseInt(precioMin, 10),
      precioMax: Number.parseInt(precioMax, 10),
      stock: Number.parseInt(stock, 10),
      activo,
    }
    if (datos.nombre.length < 2) return setError('Ingresa el nombre del producto.')
    if ([datos.precioMin, datos.precioMax, datos.stock].some((n) => Number.isNaN(n) || n < 0)) {
      return setError('Los precios y el stock deben ser números de 0 en adelante.')
    }
    if (datos.precioMin > datos.precioMax) return setError('El precio mínimo no puede ser mayor que el máximo.')

    setGuardando(true)
    try {
      let guardado = esNuevo ? await tiendaApi.crearProducto(datos) : await tiendaApi.editarProducto(producto.id, datos)
      if (archivo) guardado = await tiendaApi.subirImagen(guardado.id, archivo)
      else if (quitarFoto) guardado = await tiendaApi.quitarImagen(guardado.id)
      onGuardado(guardado, esNuevo)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el producto.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-producto">
        <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header card-header-custom">
              <h5 className="modal-title" id="titulo-modal-producto">
                {esNuevo ? 'Nuevo producto' : `Editar: ${producto.nombre}`}
              </h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="row g-4">
                <div className="col-12 col-md-5">
                  <label className="form-label">Foto</label>
                  <div className="foto-producto mb-2">
                    {imagenActual ? (
                      <img src={imagenActual} alt="Vista previa" />
                    ) : (
                      <div className="text-muted small text-center px-3">
                        <i className="bi bi-image fs-1 d-block" />
                        Sin foto todavía
                      </div>
                    )}
                  </div>
                  <label className="btn btn-outline-secondary btn-sm w-100 mb-2">
                    <i className="bi bi-upload me-1" /> {imagenActual ? 'Cambiar foto' : 'Subir foto'}
                    <input type="file" accept={TIPOS_IMAGEN.join(',')} hidden onChange={elegirArchivo} />
                  </label>
                  {archivo && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-muted w-100 p-0"
                      onClick={() => {
                        setArchivo(null)
                        setVistaPrevia(null)
                      }}
                    >
                      Descartar foto nueva
                    </button>
                  )}
                  {tieneFotoSubida && (
                    <button type="button" className="btn btn-link btn-sm text-danger w-100 p-0" onClick={() => setQuitarFoto(true)}>
                      Quitar foto subida
                    </button>
                  )}
                  <div className="form-text">JPG, PNG o WebP, hasta {MAX_MB} MB. Se ve mejor si es cuadrada o apaisada.</div>
                </div>

                <div className="col-12 col-md-7">
                  <div className="mb-3">
                    <label htmlFor="prod-nombre" className="form-label">Nombre</label>
                    <input
                      id="prod-nombre"
                      className="form-control"
                      required
                      maxLength={80}
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      autoFocus={esNuevo}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="prod-descripcion" className="form-label">Descripción</label>
                    <textarea
                      id="prod-descripcion"
                      className="form-control"
                      rows={2}
                      maxLength={300}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                    <div className="form-text text-end">{descripcion.length}/300</div>
                  </div>

                  <div className="row g-2 mb-1">
                    <div className="col-6">
                      <label htmlFor="prod-min" className="form-label">Precio mínimo (₲)</label>
                      <input
                        id="prod-min"
                        type="number"
                        className="form-control"
                        min={0}
                        step={1000}
                        required
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="prod-max" className="form-label">Precio máximo (₲)</label>
                      <input
                        id="prod-max"
                        type="number"
                        className="form-control"
                        min={0}
                        step={1000}
                        required
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                      />
                    </div>
                  </div>
                  {precioMin && precioMax && (
                    <div className="form-text mb-3">
                      En el catálogo se verá: <strong>{formatearGuaranies(Number(precioMin))} a {formatearGuaranies(Number(precioMax))}</strong>
                    </div>
                  )}

                  <div className="row g-2 align-items-end">
                    <div className="col-6">
                      <label htmlFor="prod-stock" className="form-label">Stock (unidades)</label>
                      <input
                        id="prod-stock"
                        type="number"
                        className="form-control"
                        min={0}
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <div className="form-check form-switch mb-2">
                        <input
                          id="prod-activo"
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={activo}
                          onChange={(e) => setActivo(e.target.checked)}
                        />
                        <label htmlFor="prod-activo" className="form-check-label">
                          {activo ? 'Visible en el catálogo' : 'Oculto'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCerrar} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-custom" disabled={guardando}>
                {guardando ? <span className="spinner-border spinner-border-sm" /> : esNuevo ? 'Crear producto' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  )
}

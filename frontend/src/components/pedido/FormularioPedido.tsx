import { useState, type FormEvent } from 'react'
import { mensajeDeError } from '../../api/http'
import { tiendaApi } from '../../api/tienda'
import { useAuth } from '../../hooks/useAuth'
import { useTienda } from '../../hooks/useTienda'
import type { MetodoEntrega, MetodoPago, Producto } from '../../types'
import { hoyLocalYmd } from '../../utils/fechas'
import { formatearGuaranies } from '../../utils/formato'
import { Alerta } from '../panel/Alerta'
import { DatosBancarios } from './DatosBancarios'

interface Props {
  producto: Producto | null
  onLimpiarProducto: () => void
  /** Se llama después de guardar un pedido o presupuesto. */
  onGuardado?: (tipo: 'pedido' | 'presupuesto') => void
}

export function FormularioPedido({ producto, onLimpiarProducto, onGuardado }: Props) {
  const { usuario } = useAuth()
  const { mostrarAlerta, recargarProductos } = useTienda()
  // El admin carga pedidos de cualquier cliente; el cliente pide a su nombre.
  const esAdmin = usuario?.rol === 'admin'

  const [cliente, setCliente] = useState('')
  const [precio, setPrecio] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('retiro')
  const [direccion, setDireccion] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
  const [detalles, setDetalles] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Al elegir otro producto del catálogo, el monto arranca en su precio mínimo.
  const [productoAnteriorId, setProductoAnteriorId] = useState<string | null>(null)
  if ((producto?.id ?? null) !== productoAnteriorId) {
    setProductoAnteriorId(producto?.id ?? null)
    setPrecio(producto ? String(producto.precioMin) : '')
  }

  const hoy = hoyLocalYmd()

  function limpiarFormulario() {
    setCliente('')
    setFechaEntrega('')
    setMetodoEntrega('retiro')
    setDireccion('')
    setMetodoPago('efectivo')
    setDetalles('')
    onLimpiarProducto()
  }

  /** Devuelve el monto si es válido; si no, muestra la alerta y devuelve null. */
  function validarMonto(prod: Producto, tipoAlerta: 'danger' | 'warning'): number | null {
    const monto = Number.parseInt(precio, 10)
    if (!monto || monto < prod.precioMin || monto > prod.precioMax) {
      mostrarAlerta(
        `El monto debe estar entre ${formatearGuaranies(prod.precioMin)} y ${formatearGuaranies(prod.precioMax)}.`,
        tipoAlerta,
      )
      return null
    }
    return monto
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!producto) {
      mostrarAlerta('Por favor, selecciona primero un producto del catálogo.', 'danger')
      return
    }

    const monto = validarMonto(producto, 'danger')
    if (monto === null) return

    if (fechaEntrega < hoy) {
      mostrarAlerta('La fecha de entrega no puede ser anterior a la fecha de hoy.', 'danger')
      return
    }

    setGuardando(true)
    try {
      await tiendaApi.crearPedido({
        productoId: producto.id,
        clienteNombre: esAdmin ? cliente.trim() : undefined,
        precio: monto,
        metodoEntrega,
        direccion: metodoEntrega === 'delivery' ? direccion.trim() : undefined,
        metodoPago,
        fechaEntrega,
        detalles: detalles.trim(),
      })
      limpiarFormulario()
      mostrarAlerta(
        esAdmin ? 'Pedido agendado correctamente. 🚀' : '¡Pedido enviado! Te avisaremos cuando esté listo. 🚀',
        'success',
      )
      onGuardado?.('pedido')
    } catch (err) {
      mostrarAlerta(mensajeDeError(err, 'No se pudo registrar el pedido.'), 'danger')
    } finally {
      // El stock pudo cambiar (por este pedido o por otro cliente).
      void recargarProductos()
      setGuardando(false)
    }
  }

  async function handlePresupuesto() {
    if ((esAdmin && !cliente.trim()) || !producto) {
      mostrarAlerta(
        esAdmin ? 'Completa el nombre del cliente y el producto para cotizar.' : 'Elige un producto para cotizar.',
        'warning',
      )
      return
    }

    const monto = validarMonto(producto, 'warning')
    if (monto === null) return

    setGuardando(true)
    try {
      const presupuesto = await tiendaApi.crearPresupuesto({
        productoId: producto.id,
        clienteNombre: esAdmin ? cliente.trim() : undefined,
        costo: monto,
        detalles: detalles.trim(),
      })
      limpiarFormulario()
      mostrarAlerta(`Presupuesto generado para ${presupuesto.clienteNombre} 📝`, 'success')
      onGuardado?.('presupuesto')
    } catch (err) {
      mostrarAlerta(mensajeDeError(err, 'No se pudo generar el presupuesto.'), 'danger')
    } finally {
      setGuardando(false)
    }
  }

  const sinStock = producto !== null && producto.stock <= 0

  return (
    <div className="card card-custom">
      <div className="card-header card-header-custom text-center">
        <h5 className="mb-0">{esAdmin ? 'Procesar Pedido / Presupuesto' : 'Hacer mi pedido'}</h5>
      </div>
      <div className="card-body">
        <Alerta />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="cliente" className="form-label">Cliente (Nombre completo)</label>
            <input
              type="text"
              className="form-control"
              id="cliente"
              required={esAdmin}
              readOnly={!esAdmin}
              value={esAdmin ? cliente : (usuario?.nombre ?? '')}
              onChange={(e) => setCliente(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="producto-seleccionado" className="form-label">Producto Elegido</label>
            <input
              type="text"
              className="form-control"
              id="producto-seleccionado"
              readOnly
              placeholder="Haz clic en un producto del catálogo"
              value={producto?.nombre ?? ''}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="precio-producto" className="form-label text-purple fw-bold">Monto / Precio del Pedido (₲)</label>
            <div className="input-group">
              <span className="input-group-text bg-light fw-bold text-muted">₲</span>
              <input
                type="number"
                className="form-control fw-bold text-dark"
                id="precio-producto"
                placeholder="Ej: 75000"
                required
                min={producto?.precioMin ?? 1}
                max={producto?.precioMax}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
            <div className="form-text text-muted small mt-1">
              {producto ? (
                <>
                  💡 Rango permitido para este producto: <strong>{formatearGuaranies(producto.precioMin)}</strong> a{' '}
                  <strong>{formatearGuaranies(producto.precioMax)}</strong>.
                </>
              ) : (
                'Selecciona un producto para visualizar sus límites sugeridos.'
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="fecha-entrega" className="form-label">Fecha de Entrega Solicitada</label>
            <input
              type="date"
              className="form-control"
              id="fecha-entrega"
              required
              min={hoy}
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="metodo-entrega" className="form-label">Método de Entrega</label>
            <select
              className="form-select"
              id="metodo-entrega"
              value={metodoEntrega}
              onChange={(e) => setMetodoEntrega(e.target.value as MetodoEntrega)}
            >
              <option value="retiro">Retirar del Local</option>
              <option value="delivery">Envío / Delivery</option>
            </select>
          </div>

          {metodoEntrega === 'delivery' && (
            <div className="mb-3">
              <label htmlFor="direccion-envio" className="form-label">Dirección de Envío (Ciudad / Indicaciones)</label>
              <input
                type="text"
                className="form-control"
                id="direccion-envio"
                placeholder="Ej: Centro de Caacupé..."
                required
                minLength={3}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="metodo-pago" className="form-label">Método de Pago</label>
            <select
              className="form-select"
              id="metodo-pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          {metodoPago === 'transferencia' && <DatosBancarios />}

          <div className="mb-3">
            <label htmlFor="detalles" className="form-label">Especificaciones del Producto que quisieras agregar</label>
            <textarea
              className="form-control"
              id="detalles"
              rows={2}
              maxLength={500}
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
            />
          </div>

          <div className="row g-2">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handlePresupuesto}
                disabled={guardando}
              >
                {esAdmin ? 'Generar Presupuesto' : 'Pedir Presupuesto'}
              </button>
            </div>
            <div className="col-6">
              <button type="submit" className="btn btn-custom w-100" disabled={sinStock || guardando}>
                {guardando ? <span className="spinner-border spinner-border-sm" /> : 'Comprar / Pedir'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

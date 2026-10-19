import { config } from '../config.js'
import { db, type EstadoPedido, type PedidoFila, type PresupuestoFila } from '../db.js'
import { botonHtml, enviarCorreo, escaparHtml } from '../mail.js'

const formatoGs = new Intl.NumberFormat('es-PY')
const gs = (monto: number) => `${formatoGs.format(monto)} ₲`

/** "2026-10-25" → "25/10/2026" */
function fecha(ymd: string) {
  const [anio, mes, dia] = ymd.split('-')
  return `${dia}/${mes}/${anio}`
}

const urlMisPedidos = `${config.FRONTEND_URL}/mis-pedidos`
const urlPanel = `${config.FRONTEND_URL}/admin`

/**
 * Los avisos nunca deben frenar ni romper la operación principal:
 * se envían en segundo plano y, si fallan, solo queda el error en el registro.
 */
function enSegundoPlano(descripcion: string, envio: () => Promise<void>) {
  envio().catch((err) => console.error(`✉️  No se pudo enviar "${descripcion}":`, err))
}

function emailDelUsuario(usuarioId: number | null) {
  if (usuarioId === null) return null
  const fila = db.prepare('SELECT email FROM usuarios WHERE id = ?').get(usuarioId) as { email: string } | undefined
  return fila?.email ?? null
}

function textoEntrega(p: PedidoFila) {
  return p.metodo_entrega === 'delivery' ? `Envío a ${p.direccion ?? ''}` : 'Retiro en el local'
}

function textoPago(p: PedidoFila) {
  return p.metodo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia bancaria'
}

/** Tabla con el resumen del pedido (HTML) y su versión en texto plano. */
function resumen(p: PedidoFila) {
  const filas: [string, string][] = [
    ['Pedido', `#${p.id}`],
    ['Producto', p.producto_nombre],
    ['Monto', gs(p.precio)],
    ['Entrega', `${fecha(p.fecha_entrega)} · ${textoEntrega(p)}`],
    ['Pago', textoPago(p)],
  ]
  if (p.detalles) filas.push(['Detalles', p.detalles])

  const html = `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${filas
        .map(
          ([k, v]) => `<tr>
            <td style="padding:6px 8px;background:#fce4ec;color:#4a148c;font-weight:bold;width:32%;border-bottom:1px solid #fff">${k}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f5f5f5">${escaparHtml(v)}</td>
          </tr>`,
        )
        .join('')}
    </table>`
  const texto = filas.map(([k, v]) => `${k}: ${v}`).join('\n')
  return { html, texto }
}

function saludo(nombre: string) {
  return `<p>¡Hola, <strong>${escaparHtml(nombre)}</strong>!</p>`
}

const recordatorioTransferencia = (p: PedidoFila) =>
  p.metodo_pago === 'transferencia'
    ? `<p style="font-size:13px;color:#757575">💳 Recuerda enviarnos el comprobante de la transferencia por
       <a href="https://wa.me/${config.WHATSAPP_NUMERO}" style="color:#4a148c">WhatsApp</a>.</p>`
    : ''

// --- Mensajes al cliente según el estado ---

const MENSAJE_ESTADO: Record<Exclude<EstadoPedido, 'pendiente'>, { asunto: string; titulo: string; cuerpo: (p: PedidoFila) => string }> = {
  en_preparacion: {
    asunto: 'Estamos preparando tu pedido',
    titulo: '🎨 ¡Manos a la obra!',
    cuerpo: () => 'Ya estamos preparando tu pedido con mucho cariño. Te avisamos cuando esté listo.',
  },
  listo: {
    asunto: '¡Tu pedido está listo!',
    titulo: '🎁 ¡Tu pedido está listo!',
    cuerpo: (p) =>
      p.metodo_entrega === 'retiro'
        ? 'Ya puedes pasar a retirarlo por nuestro local.'
        : `Pronto sale hacia ${escaparHtml(p.direccion ?? 'tu dirección')}.`,
  },
  entregado: {
    asunto: '¡Gracias por tu compra!',
    titulo: '✅ Pedido entregado',
    cuerpo: () => 'Esperamos que te encante. ¡Gracias por elegirnos! Nos encantaría ver una foto en Instagram 💛',
  },
  cancelado: {
    asunto: 'Tu pedido fue cancelado',
    titulo: '❌ Pedido cancelado',
    cuerpo: () => 'Tu pedido fue cancelado. Si tienes dudas o quieres reprogramarlo, escríbenos por WhatsApp.',
  },
}

// --- Avisos públicos ---

/** Pedido nuevo: confirmación al cliente (si tiene cuenta) y aviso a la tienda (si lo hizo el cliente). */
export function avisarPedidoCreado(pedido: PedidoFila) {
  const email = emailDelUsuario(pedido.usuario_id)
  const { html, texto } = resumen(pedido)

  if (email) {
    enSegundoPlano(`pedido #${pedido.id} recibido`, () =>
      enviarCorreo({
        para: email,
        asunto: `📦 Recibimos tu pedido #${pedido.id}`,
        texto: `Hola ${pedido.cliente_nombre}, recibimos tu pedido.\n\n${texto}\n\nPuedes seguirlo en ${urlMisPedidos}`,
        html: `
          ${saludo(pedido.cliente_nombre)}
          <p>Recibimos tu pedido 💛 Te vamos a avisar por este medio cada vez que cambie de estado.</p>
          ${html}
          ${recordatorioTransferencia(pedido)}
          <div style="text-align:center">${botonHtml('Ver mis pedidos', urlMisPedidos)}</div>`,
      }),
    )

    enSegundoPlano(`aviso a la tienda del pedido #${pedido.id}`, () =>
      enviarCorreo({
        para: config.NOTIFICAR_A,
        asunto: `🔔 Nuevo pedido web de ${pedido.cliente_nombre} (#${pedido.id})`,
        responderA: email,
        texto: `Nuevo pedido de ${pedido.cliente_nombre} (${email}).\n\n${texto}\n\nPanel: ${urlPanel}`,
        html: `
          <p><strong>${escaparHtml(pedido.cliente_nombre)}</strong> (${escaparHtml(email)}) hizo un pedido desde la web.</p>
          ${html}
          <div style="text-align:center">${botonHtml('Abrir el panel', urlPanel)}</div>`,
      }),
    )
  }
}

/** Cambio de estado: aviso al cliente; si el que cancela es el cliente, aviso a la tienda. */
export function avisarCambioEstado(pedido: PedidoFila, porCliente: boolean) {
  if (pedido.estado === 'pendiente') return
  const email = emailDelUsuario(pedido.usuario_id)
  const { html, texto } = resumen(pedido)

  if (porCliente && pedido.estado === 'cancelado') {
    enSegundoPlano(`aviso de cancelación del pedido #${pedido.id}`, () =>
      enviarCorreo({
        para: config.NOTIFICAR_A,
        responderA: email ?? undefined,
        asunto: `🔔 ${pedido.cliente_nombre} canceló su pedido #${pedido.id}`,
        texto: `${pedido.cliente_nombre} canceló su pedido. El stock ya se devolvió.\n\n${texto}`,
        html: `
          <p><strong>${escaparHtml(pedido.cliente_nombre)}</strong> canceló su pedido. El stock ya se devolvió.</p>
          ${html}`,
      }),
    )
    return
  }

  if (!email) return
  const mensaje = MENSAJE_ESTADO[pedido.estado]
  enSegundoPlano(`pedido #${pedido.id} → ${pedido.estado}`, () =>
    enviarCorreo({
      para: email,
      asunto: `${mensaje.asunto} (#${pedido.id})`,
      texto: `Hola ${pedido.cliente_nombre}. ${mensaje.asunto}.\n\n${texto}\n\nMis pedidos: ${urlMisPedidos}`,
      html: `
        <h3 style="color:#4a148c;text-align:center;margin-top:0">${mensaje.titulo}</h3>
        ${saludo(pedido.cliente_nombre)}
        <p>${mensaje.cuerpo(pedido)}</p>
        ${html}
        <div style="text-align:center">${botonHtml('Ver mis pedidos', urlMisPedidos)}</div>`,
    }),
  )
}

/** Presupuesto pedido por un cliente desde la web: aviso a la tienda. */
export function avisarPresupuesto(presupuesto: PresupuestoFila) {
  const email = emailDelUsuario(presupuesto.usuario_id)
  if (!email) return

  const detalles = presupuesto.detalles ? `\nDetalles: ${presupuesto.detalles}` : ''
  enSegundoPlano(`aviso de presupuesto #${presupuesto.id}`, () =>
    enviarCorreo({
      para: config.NOTIFICAR_A,
      asunto: `🔔 ${presupuesto.cliente_nombre} pidió un presupuesto`,
      responderA: email,
      texto: `${presupuesto.cliente_nombre} (${email}) pidió presupuesto de ${presupuesto.producto_nombre} por ${gs(presupuesto.costo)}.${detalles}`,
      html: `
        <p><strong>${escaparHtml(presupuesto.cliente_nombre)}</strong> (${escaparHtml(email)}) pidió un presupuesto:</p>
        <ul>
          <li><strong>Producto:</strong> ${escaparHtml(presupuesto.producto_nombre)}</li>
          <li><strong>Monto estimado:</strong> ${gs(presupuesto.costo)}</li>
          ${presupuesto.detalles ? `<li><strong>Detalles:</strong> ${escaparHtml(presupuesto.detalles)}</li>` : ''}
        </ul>
        <p>Respóndele directamente a este correo o por WhatsApp.</p>
        <div style="text-align:center">${botonHtml('Abrir el panel', urlPanel)}</div>`,
    }),
  )
}

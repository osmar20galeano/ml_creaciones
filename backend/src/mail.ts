import nodemailer from 'nodemailer'
import { config } from './config.js'

const transporte = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.GMAIL_USER, pass: config.GMAIL_APP_PASSWORD },
})

export function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

/** Botón dorado para los correos. */
export function botonHtml(texto: string, url: string) {
  return `<a href="${escaparHtml(url)}" style="display:inline-block;background:#d4af37;color:#fff;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:6px;margin-top:8px">${escaparHtml(texto)}</a>`
}

/** Envoltorio común con el logo de texto, colores y pie de la tienda. */
function plantilla(contenido: string) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#fafafa;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #f8bbd0;border-top:5px solid #d4af37;border-radius:10px;padding:28px">
      <div style="text-align:center">
        <h2 style="color:#b3922e;margin:0 0 4px">M.L. Creaciones &amp; Regalos</h2>
        <p style="color:#757575;font-style:italic;margin:0 0 24px">Detalles que emocionan, regalos que perduran</p>
      </div>
      <div style="color:#333;line-height:1.5">${contenido}</div>
    </div>
    <p style="text-align:center;color:#9e9e9e;font-size:12px;margin-top:16px">Este es un correo automático.</p>
  </div>`
}

interface Correo {
  para: string
  asunto: string
  /** HTML del cuerpo (los datos del usuario deben pasar por escaparHtml). */
  html: string
  texto: string
  /** A quién le llega la respuesta si tocan "Responder" (por defecto, a la tienda). */
  responderA?: string
}

export async function enviarCorreo({ para, asunto, html, texto, responderA }: Correo) {
  if (config.MAIL_MODO === 'consola') {
    console.log(`\n✉️  [MAIL_MODO=consola] Para: ${para}${responderA ? ` (responder a: ${responderA})` : ''}\n   Asunto: ${asunto}\n${texto.replace(/^/gm, '   │ ')}\n`)
    return
  }
  await transporte.sendMail({
    from: `"M.L. Creaciones" <${config.GMAIL_USER}>`,
    to: para,
    replyTo: responderA,
    subject: asunto,
    text: texto,
    html: plantilla(html),
  })
}

function bloqueCodigo(codigo: string) {
  return `<div style="font-size:34px;letter-spacing:10px;font-weight:bold;color:#4a148c;background:#fce4ec;border-radius:8px;padding:14px;margin:18px 0;text-align:center">${codigo}</div>`
}

export async function enviarCodigoVerificacion(destino: string, nombre: string, codigo: string) {
  await enviarCorreo({
    para: destino,
    asunto: `${codigo} es tu código de M.L. Creaciones`,
    texto: `Hola ${nombre}, tu código para confirmar tu cuenta es ${codigo}. Vence en 15 minutos.`,
    html: `
      <p style="text-align:center">¡Hola, <strong>${escaparHtml(nombre)}</strong>! Este es tu código para confirmar tu cuenta:</p>
      ${bloqueCodigo(codigo)}
      <p style="color:#757575;font-size:13px;text-align:center">El código vence en 15 minutos. Si no creaste una cuenta, ignora este correo.</p>`,
  })
}

export async function enviarCodigoRecuperacion(destino: string, nombre: string, codigo: string) {
  await enviarCorreo({
    para: destino,
    asunto: `${codigo} es tu código para restablecer la contraseña`,
    texto: `Hola ${nombre}, tu código para restablecer la contraseña es ${codigo}. Vence en 15 minutos. Si no lo pediste, ignora este correo: tu contraseña no cambia.`,
    html: `
      <p style="text-align:center">¡Hola, <strong>${escaparHtml(nombre)}</strong>! Pediste restablecer tu contraseña. Este es tu código:</p>
      ${bloqueCodigo(codigo)}
      <p style="color:#757575;font-size:13px;text-align:center">El código vence en 15 minutos.<br>
      Si no lo pediste tú, ignora este correo: tu contraseña sigue siendo la misma.</p>`,
  })
}

export async function avisarCambioPassword(destino: string, nombre: string) {
  const cuando = new Date().toLocaleString('es-PY', { dateStyle: 'long', timeStyle: 'short' })
  await enviarCorreo({
    para: destino,
    asunto: '🔒 Tu contraseña fue cambiada',
    texto: `Hola ${nombre}, la contraseña de tu cuenta de M.L. Creaciones se cambió el ${cuando}. Si no fuiste tú, escríbenos por WhatsApp cuanto antes (${config.WHATSAPP_NUMERO}).`,
    html: `
      <p>¡Hola, <strong>${escaparHtml(nombre)}</strong>!</p>
      <p>La contraseña de tu cuenta se cambió el <strong>${cuando}</strong>. Por seguridad, cerramos las sesiones abiertas en otros dispositivos.</p>
      <p style="background:#fff8e1;border-left:4px solid #d4af37;padding:10px 12px;font-size:14px">
        ¿No fuiste tú? Escríbenos por <a href="https://wa.me/${config.WHATSAPP_NUMERO}" style="color:#4a148c">WhatsApp</a> cuanto antes.
      </p>`,
  })
}

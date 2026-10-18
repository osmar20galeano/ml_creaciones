import nodemailer from 'nodemailer'
import { config } from './config.js'

const transporte = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.GMAIL_USER, pass: config.GMAIL_APP_PASSWORD },
})

function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export async function enviarCodigoVerificacion(destino: string, nombre: string, codigo: string) {
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#fafafa;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #f8bbd0;border-top:5px solid #d4af37;border-radius:10px;padding:28px;text-align:center">
      <h2 style="color:#b3922e;margin:0 0 4px">M.L. Creaciones &amp; Regalos</h2>
      <p style="color:#757575;font-style:italic;margin:0 0 24px">Detalles que emocionan, regalos que perduran</p>
      <p style="color:#333">¡Hola, <strong>${escaparHtml(nombre)}</strong>! Este es tu código para confirmar tu cuenta:</p>
      <div style="font-size:34px;letter-spacing:10px;font-weight:bold;color:#4a148c;background:#fce4ec;border-radius:8px;padding:14px;margin:18px 0">${codigo}</div>
      <p style="color:#757575;font-size:13px">El código vence en 15 minutos. Si no creaste una cuenta, ignora este correo.</p>
    </div>
  </div>`

  await transporte.sendMail({
    from: `"M.L. Creaciones" <${config.GMAIL_USER}>`,
    to: destino,
    subject: `${codigo} es tu código de M.L. Creaciones`,
    text: `Hola ${nombre}, tu código para confirmar tu cuenta es ${codigo}. Vence en 15 minutos.`,
    html,
  })
}

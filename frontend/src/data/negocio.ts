import logo from '../assets/img/logo.jpg'

// TODO: reemplazar los usuarios de redes y el número de WhatsApp (son de ejemplo).
export const negocio = {
  nombre: 'M.L. Creaciones & Regalos',
  slogan: 'Detalles que emocionan, regalos que perduran',
  logo,
  redes: [
    { nombre: 'Instagram', clase: 'instagram', icono: 'bi-instagram', url: 'https://www.instagram.com/tu_usuario' },
    { nombre: 'Facebook', clase: 'facebook', icono: 'bi-facebook', url: 'https://www.facebook.com/tu_pagina' },
    { nombre: 'TikTok', clase: 'tiktok', icono: 'bi-tiktok', url: 'https://www.tiktok.com/@tu_usuario' },
  ],
  sedes: [
    { nombre: 'Sede Caacupé', mapa: 'https://maps.google.com/?q=Caacupé+Centro' },
    { nombre: 'Sede Atyrá', mapa: 'https://maps.google.com/?q=Atyrá+Centro' },
  ],
  whatsapp: {
    numero: '595981000000',
    mensaje: 'Hola M.L. Creaciones, quiero consultar sobre un pedido',
  },
  banco: {
    nombre: 'Visión Banco',
    cuenta: '14529840',
    titular: 'M.L. Creaciones',
  },
} as const

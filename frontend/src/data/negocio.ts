import logo from '../assets/img/logo.jpg'

export const negocio = {
  nombre: 'M.L. Creaciones & Regalos',
  slogan: 'Detalles que emocionan, regalos que perduran',
  logo,
  redes: [
    { nombre: 'Instagram', clase: 'instagram', icono: 'bi-instagram', url: 'https://www.instagram.com/m.lcreacionesatyra' },
    // Para sumar Facebook o TikTok:
    // { nombre: 'Facebook', clase: 'facebook', icono: 'bi-facebook', url: 'https://www.facebook.com/...' },
    // { nombre: 'TikTok', clase: 'tiktok', icono: 'bi-tiktok', url: 'https://www.tiktok.com/@...' },
  ],
  sedes: [
    { nombre: 'Sede Caacupé', mapa: 'https://maps.google.com/?q=Caacupé+Centro' },
    { nombre: 'Sede Atyrá', mapa: 'https://maps.google.com/?q=Atyrá+Centro' },
  ],
  whatsapp: {
    numero: '595984676117', // +595 984 676117
    mensaje: 'Hola M.L. Creaciones, quiero consultar sobre un pedido',
  },
  banco: {
    nombre: 'Visión Banco',
    cuenta: '14529840',
    titular: 'M.L. Creaciones',
  },
} as const

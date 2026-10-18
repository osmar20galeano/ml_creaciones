import type { Producto } from '../types'
import tazas from '../assets/img/tazas.jpg'
import remera from '../assets/img/remera.jpg'
import cuadro from '../assets/img/cuadro.jpg'
import comboCumple from '../assets/img/combo_cumple.jpg'
import ramo from '../assets/img/ramo.png'
import maquillaje from '../assets/img/maquillaje.jpg'
import golosinas from '../assets/img/golosinas.jpg'
import instantanea from '../assets/img/instantanea.jpg'
import llaveros from '../assets/img/llaveros.jpg'

// Única fuente de precios: la tarjeta los muestra y el formulario valida con
// los mismos valores. Precios en guaraníes.
export const productos: Producto[] = [
  {
    id: 'taza',
    nombre: 'Taza Personalizada',
    descripcion: 'Tazas cerámicas, mágicas o de chopp con diseño a elección.',
    imagen: tazas,
    precioMin: 25000,
    precioMax: 45000,
    stockInicial: 20,
  },
  {
    id: 'remera',
    nombre: 'Remeras Sublimadas',
    descripcion: 'Tejido tacto algodón con estampados full color duraderos.',
    imagen: remera,
    precioMin: 40000,
    precioMax: 75000,
    stockInicial: 15,
  },
  {
    id: 'cuadro',
    nombre: 'Cuadros Personalizados',
    descripcion: 'Marcos de madera con collage de fotos o diseños motivacionales.',
    imagen: cuadro,
    precioMin: 35000,
    precioMax: 120000,
    stockInicial: 8,
  },
  {
    id: 'combo-cumple',
    nombre: 'Combos para Cumpleaños',
    descripcion: 'Kits con globos personalizados, carteles y sorpresitas básicas.',
    imagen: comboCumple,
    precioMin: 70000,
    precioMax: 250000,
    stockInicial: 5,
  },
  {
    id: 'ramo-rosas',
    nombre: 'Ramos de Rosas Naturales',
    descripcion: 'Rosas frescas importadas envueltas en fino papel craft o coreano.',
    imagen: ramo,
    precioMin: 50000,
    precioMax: 280000,
    stockInicial: 10,
  },
  {
    id: 'ramo-maquillaje',
    nombre: 'Ramos de Maquillajes',
    descripcion: 'Arreglos creativos compuestos por labiales, paletas y rímel.',
    imagen: maquillaje,
    precioMin: 40000,
    precioMax: 200000,
    stockInicial: 3,
  },
  {
    id: 'ramo-golosinas',
    nombre: 'Ramos de Golosinas',
    descripcion: 'Estructuras repletas de chocolates, gomitas y snacks preferidos.',
    imagen: golosinas,
    precioMin: 35000,
    precioMax: 150000,
    stockInicial: 12,
  },
  {
    id: 'fotos-instantaneas',
    nombre: 'Fotos Instantáneas',
    descripcion: 'Impresiones estilo tipo Polaroid con laminado protector de brillo.',
    imagen: instantanea,
    precioMin: 5000,
    precioMax: 35000,
    stockInicial: 30,
  },
  {
    id: 'llaveros',
    nombre: 'Llaveros con Fotos',
    descripcion: 'Llaveros acrílicos o metálicos bifaciales con fotos impresas.',
    imagen: llaveros,
    precioMin: 5000,
    precioMax: 15000,
    stockInicial: 2,
  },
]

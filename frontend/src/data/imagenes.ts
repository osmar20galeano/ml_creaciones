import tazas from '../assets/img/tazas.jpg'
import remera from '../assets/img/remera.jpg'
import cuadro from '../assets/img/cuadro.jpg'
import comboCumple from '../assets/img/combo_cumple.jpg'
import ramo from '../assets/img/ramo.png'
import maquillaje from '../assets/img/maquillaje.jpg'
import golosinas from '../assets/img/golosinas.jpg'
import instantanea from '../assets/img/instantanea.jpg'
import llaveros from '../assets/img/llaveros.jpg'
import logo from '../assets/img/logo.jpg'

// Los productos (nombre, precios, stock) vienen de la API; acá solo se asocia
// cada `id` con su foto. Al agregar un producto nuevo en el backend, sumar su imagen.
const imagenes: Record<string, string> = {
  taza: tazas,
  remera,
  cuadro,
  'combo-cumple': comboCumple,
  'ramo-rosas': ramo,
  'ramo-maquillaje': maquillaje,
  'ramo-golosinas': golosinas,
  'fotos-instantaneas': instantanea,
  llaveros,
}

export function imagenDe(productoId: string) {
  return imagenes[productoId] ?? logo
}

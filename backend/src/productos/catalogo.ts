/**
 * Catálogo inicial. Se carga en la base de datos solo la primera vez
 * (si el producto no existe); después el stock y los precios viven en la BD.
 * Los `id` coinciden con las imágenes del frontend (frontend/src/data/productos.ts).
 */
export const catalogoInicial = [
  { id: 'taza', nombre: 'Taza Personalizada', descripcion: 'Tazas cerámicas, mágicas o de chopp con diseño a elección.', precioMin: 25000, precioMax: 45000, stock: 20 },
  { id: 'remera', nombre: 'Remeras Sublimadas', descripcion: 'Tejido tacto algodón con estampados full color duraderos.', precioMin: 40000, precioMax: 75000, stock: 15 },
  { id: 'cuadro', nombre: 'Cuadros Personalizados', descripcion: 'Marcos de madera con collage de fotos o diseños motivacionales.', precioMin: 35000, precioMax: 120000, stock: 8 },
  { id: 'combo-cumple', nombre: 'Combos para Cumpleaños', descripcion: 'Kits con globos personalizados, carteles y sorpresitas básicas.', precioMin: 70000, precioMax: 250000, stock: 5 },
  { id: 'ramo-rosas', nombre: 'Ramos de Rosas Naturales', descripcion: 'Rosas frescas importadas envueltas en fino papel craft o coreano.', precioMin: 50000, precioMax: 280000, stock: 10 },
  { id: 'ramo-maquillaje', nombre: 'Ramos de Maquillajes', descripcion: 'Arreglos creativos compuestos por labiales, paletas y rímel.', precioMin: 40000, precioMax: 200000, stock: 3 },
  { id: 'ramo-golosinas', nombre: 'Ramos de Golosinas', descripcion: 'Estructuras repletas de chocolates, gomitas y snacks preferidos.', precioMin: 35000, precioMax: 150000, stock: 12 },
  { id: 'fotos-instantaneas', nombre: 'Fotos Instantáneas', descripcion: 'Impresiones estilo tipo Polaroid con laminado protector de brillo.', precioMin: 5000, precioMax: 35000, stock: 30 },
  { id: 'llaveros', nombre: 'Llaveros con Fotos', descripcion: 'Llaveros acrílicos o metálicos bifaciales con fotos impresas.', precioMin: 5000, precioMax: 15000, stock: 2 },
]

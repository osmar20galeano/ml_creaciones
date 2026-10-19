/**
 * Contenido del TP "Modelo de Negocio Canvas" (Liderazgo y Desarrollo Emprendedor).
 * Todo el texto de la página /canvas sale de acá: para corregir algo, editar este archivo.
 */

export type IdBloque =
  | 'propuesta'
  | 'segmentos'
  | 'canales'
  | 'relacion'
  | 'ingresos'
  | 'recursos'
  | 'actividades'
  | 'socios'
  | 'costos'

export interface Bloque {
  id: IdBloque
  /** Orden de la consigna (1 = Propuesta de Valor … 9 = Estructura de Costos). */
  numero: number
  titulo: string
  icono: string
  /** Pregunta guía del bloque según Osterwalder. */
  pregunta: string
  /** Síntesis para el lienzo gráfico (3 o 4 ideas cortas). */
  sintesis: string[]
  /** Justificación detallada: párrafos y listas. */
  justificacion: { parrafos: string[]; puntos?: string[] }
  /** Bloques con los que se relaciona y por qué (coherencia del modelo). */
  conexiones: { con: IdBloque; motivo: string }[]
}

export const proyecto = {
  materia: 'Liderazgo y Desarrollo Emprendedor',
  carrera: 'Ingeniería Informática – 3.º Año · UniNorte',
  nombre: 'M.L. Creaciones & Regalos',
  slogan: 'Detalles que emocionan, regalos que perduran',
  rubro: 'Comercial · Regalos personalizados y artículos para ocasiones especiales, con canal de venta digital',
  mision:
    'Crear regalos personalizados que transmitan emociones, con atención cercana, calidad en cada detalle y entregas a tiempo.',
  vision:
    'Ser la tienda de regalos personalizados de referencia en la región, uniendo el trabajo artesanal con una experiencia de compra digital simple y confiable.',
  problema:
    'Encontrar un regalo único y significativo para una fecha especial lleva tiempo: las opciones de las tiendas son genéricas, y los emprendimientos que personalizan suelen tomar pedidos de forma desordenada por mensajes, sin precios claros ni seguimiento. El cliente no sabe si su pedido llegará a tiempo, y el negocio pierde pedidos, controla mal su stock y no puede crecer.',
}

/** Rangos del catálogo inicial del sistema (en guaraníes). */
export const catalogo = [
  { producto: 'Llaveros con fotos', min: 5000, max: 15000 },
  { producto: 'Fotos instantáneas', min: 5000, max: 35000 },
  { producto: 'Tazas personalizadas', min: 25000, max: 45000 },
  { producto: 'Ramos de golosinas', min: 35000, max: 150000 },
  { producto: 'Cuadros personalizados', min: 35000, max: 120000 },
  { producto: 'Remeras sublimadas', min: 40000, max: 75000 },
  { producto: 'Ramos de maquillaje', min: 40000, max: 200000 },
  { producto: 'Ramos de rosas naturales', min: 50000, max: 280000 },
  { producto: 'Combos de cumpleaños', min: 70000, max: 250000 },
]

export const bloques: Bloque[] = [
  {
    id: 'propuesta',
    numero: 1,
    titulo: 'Propuesta de Valor',
    icono: 'bi-gift',
    pregunta: '¿Qué valor entregamos y qué problema resolvemos?',
    sintesis: [
      'Regalos 100 % personalizados',
      'Precios claros desde 5.000 ₲',
      'Pedido online con seguimiento',
      'Retiro o delivery',
    ],
    justificacion: {
      parrafos: [
        'El cliente no compra una taza o un ramo: compra la emoción de quien lo recibe. Por eso la propuesta combina productos personalizados con una experiencia de compra que da tranquilidad, desde que elige hasta que entrega el regalo.',
      ],
      puntos: [
        '**Personalización total:** tazas, remeras, cuadros, ramos de rosas, de maquillaje y de golosinas, combos, fotos instantáneas y llaveros, con diseño, nombre o foto a elección.',
        '**Precios transparentes:** cada producto muestra su rango de precio en el catálogo, para todos los presupuestos (de 5.000 ₲ a 280.000 ₲).',
        '**Compra simple y segura:** el cliente crea su cuenta, hace el pedido online y sigue su estado (recibido → preparando → listo → entregado).',
        '**Avisos automáticos** por correo en cada etapa, sin tener que preguntar.',
        '**Flexibilidad:** retiro en el local o delivery, y pago en efectivo o por transferencia.',
      ],
    },
    conexiones: [
      { con: 'segmentos', motivo: 'Responde a la necesidad de regalar algo único en fechas especiales.' },
      { con: 'actividades', motivo: 'Se cumple gracias al diseño y la producción personalizada.' },
      { con: 'canales', motivo: 'La web y las redes hacen visible y accesible la propuesta.' },
      { con: 'relacion', motivo: 'El seguimiento del pedido es parte del valor entregado.' },
    ],
  },
  {
    id: 'segmentos',
    numero: 2,
    titulo: 'Segmentos de Clientes',
    icono: 'bi-people',
    pregunta: '¿Para quién creamos valor?',
    sintesis: [
      'Jóvenes y adultos de 15 a 45 años',
      'Parejas y familias en fechas especiales',
      'Estudiantes y grupos de amigos',
      'Empresas e instituciones',
    ],
    justificacion: {
      parrafos: [
        'El modelo apunta a un **mercado segmentado**: personas que quieren hacer un regalo con significado y valoran el detalle personal por sobre el precio más bajo. Se distinguen segmentos con necesidades y momentos de compra distintos:',
      ],
      puntos: [
        '**Personas de 15 a 45 años**, activas en redes sociales, que celebran cumpleaños, aniversarios y graduaciones.',
        '**Parejas y familias** en fechas pico: San Valentín, Día de la Madre, Día del Padre, Día de la Amistad y Navidad.',
        '**Estudiantes y grupos de amigos** que buscan regalos accesibles (llaveros, fotos instantáneas, tazas).',
        '**Empresas e instituciones** que necesitan obsequios para clientes o colaboradores; se atienden con presupuestos a medida.',
      ],
    },
    conexiones: [
      { con: 'propuesta', motivo: 'Cada segmento valora la personalización y el detalle.' },
      { con: 'canales', motivo: 'Son usuarios de Instagram y WhatsApp: ahí se los encuentra.' },
      { con: 'ingresos', motivo: 'Los distintos rangos de precio cubren a todos los segmentos.' },
    ],
  },
  {
    id: 'canales',
    numero: 3,
    titulo: 'Canales',
    icono: 'bi-megaphone',
    pregunta: '¿Cómo llegamos a nuestros clientes?',
    sintesis: ['Instagram @m.lcreacionesatyra', 'WhatsApp', 'Tienda web propia', 'Retiro en el local o delivery'],
    justificacion: {
      parrafos: [
        'Los canales acompañan al cliente en cada fase de la compra, combinando canales propios y directos:',
      ],
      puntos: [
        '**Conocimiento:** Instagram muestra los trabajos terminados y las promociones de cada fecha especial.',
        '**Evaluación:** el catálogo web muestra fotos, descripción, rango de precios y stock disponible.',
        '**Compra:** pedido online desde la tienda web, o consulta directa por WhatsApp.',
        '**Entrega:** retiro en el local o delivery a domicilio.',
        '**Postventa:** correos automáticos con el estado del pedido y contacto por WhatsApp ante cualquier duda.',
      ],
    },
    conexiones: [
      { con: 'segmentos', motivo: 'Elegidos según dónde están los clientes.' },
      { con: 'socios', motivo: 'Dependen de plataformas como Instagram, WhatsApp y Gmail.' },
      { con: 'costos', motivo: 'Generan costos de publicidad, delivery y tecnología.' },
    ],
  },
  {
    id: 'relacion',
    numero: 4,
    titulo: 'Relación con Clientes',
    icono: 'bi-heart',
    pregunta: '¿Qué relación espera cada segmento?',
    sintesis: ['Asistencia personal y cercana', 'Autoservicio en la web', 'Avisos automáticos por correo', 'Comunidad en Instagram'],
    justificacion: {
      parrafos: [
        'La relación busca **fidelizar**: que quien regaló una vez vuelva en la próxima fecha especial. Se combinan varios tipos de relación:',
      ],
      puntos: [
        '**Asistencia personal:** atención por WhatsApp para definir diseños, frases y detalles del pedido.',
        '**Autoservicio:** cada cliente tiene su cuenta y ve en "Mis pedidos" el estado y el historial.',
        '**Servicios automatizados:** correos de confirmación, preparación, pedido listo y entrega.',
        '**Comunidad:** clientes que comparten fotos de sus regalos en Instagram, lo que genera confianza y recomendación.',
      ],
    },
    conexiones: [
      { con: 'propuesta', motivo: 'El seguimiento del pedido es parte del valor.' },
      { con: 'actividades', motivo: 'Requiere atención al cliente y gestión de pedidos.' },
      { con: 'recursos', motivo: 'Se apoya en la plataforma web y en el equipo de atención.' },
    ],
  },
  {
    id: 'ingresos',
    numero: 5,
    titulo: 'Fuentes de Ingreso',
    icono: 'bi-cash-coin',
    pregunta: '¿Por qué valor están dispuestos a pagar?',
    sintesis: ['Venta por pedido personalizado', 'Combos y fechas especiales', 'Presupuestos a medida', 'Efectivo o transferencia'],
    justificacion: {
      parrafos: [
        'El ingreso principal es la **venta de cada pedido**. El precio final se define dentro del rango de cada producto, según el nivel de personalización, el tamaño y los materiales (fijación de precios según características del producto).',
        'Los ingresos son **estacionales**: crecen en las fechas pico (San Valentín, Día de la Madre, Día de la Amistad, Navidad), cuando conviene ofrecer combos. Los pedidos grandes, como los de empresas o eventos, se cotizan con presupuestos a medida. El cobro es en **efectivo** o por **transferencia** al alias de Ueno Bank.',
      ],
    },
    conexiones: [
      { con: 'segmentos', motivo: 'Precios escalonados para cada tipo de cliente.' },
      { con: 'propuesta', motivo: 'Se cobra la personalización, no solo el producto.' },
      { con: 'costos', motivo: 'El margen surge de restar los costos de cada pedido.' },
    ],
  },
  {
    id: 'recursos',
    numero: 6,
    titulo: 'Recursos Clave',
    icono: 'bi-tools',
    pregunta: '¿Qué recursos necesita la propuesta de valor?',
    sintesis: ['Equipos de sublimación e impresión', 'Insumos y stock', 'Plataforma web y marca', 'Equipo creativo'],
    justificacion: {
      parrafos: ['Los recursos se agrupan en cuatro tipos:'],
      puntos: [
        '**Físicos:** equipos de sublimación e impresión, plancha térmica, herramientas de armado y un espacio de trabajo; insumos como tazas, remeras, marcos, flores, golosinas y packaging.',
        '**Intelectuales:** la marca y su identidad visual, los diseños propios, la base de clientes y la **plataforma web** (catálogo, cuentas, pedidos y panel de gestión).',
        '**Humanos:** el equipo de diseño, producción, atención al cliente y entregas.',
        '**Financieros:** capital de trabajo para comprar insumos antes de las fechas pico.',
      ],
    },
    conexiones: [
      { con: 'actividades', motivo: 'Son los medios con los que se produce y se vende.' },
      { con: 'socios', motivo: 'Los insumos llegan de los proveedores.' },
      { con: 'costos', motivo: 'Mantenerlos y reponerlos es parte de la estructura de costos.' },
    ],
  },
  {
    id: 'actividades',
    numero: 7,
    titulo: 'Actividades Clave',
    icono: 'bi-scissors',
    pregunta: '¿Qué actividades requiere la propuesta de valor?',
    sintesis: ['Diseño personalizado', 'Producción y armado', 'Gestión de pedidos y stock', 'Marketing en redes'],
    justificacion: {
      parrafos: ['Las actividades combinan **producción** artesanal con **gestión** digital:'],
      puntos: [
        '**Diseño:** adaptar cada producto a lo que pide el cliente (fotos, nombres, frases, colores).',
        '**Producción:** sublimar, imprimir, enmarcar y armar los ramos y combos con cuidado en la terminación.',
        '**Gestión de pedidos:** registrar cada pedido, avanzar su estado en el panel y cumplir la fecha de entrega.',
        '**Compras y stock:** reponer insumos y mantener el stock actualizado en el catálogo.',
        '**Marketing:** publicar trabajos y promociones en Instagram, sobre todo antes de las fechas pico.',
        '**Entregas:** coordinar retiros y deliveries.',
      ],
    },
    conexiones: [
      { con: 'propuesta', motivo: 'Convierten la idea de regalo en un producto real.' },
      { con: 'recursos', motivo: 'Usan los equipos, insumos y la plataforma.' },
      { con: 'socios', motivo: 'Parte de la logística y los insumos se terceriza.' },
    ],
  },
  {
    id: 'socios',
    numero: 8,
    titulo: 'Socios Clave',
    icono: 'bi-diagram-3',
    pregunta: '¿Quiénes son nuestros aliados y proveedores?',
    sintesis: ['Proveedores de insumos', 'Servicio de delivery', 'Banco (Ueno)', 'Plataformas digitales'],
    justificacion: {
      parrafos: [
        'Las alianzas permiten **reducir riesgos** y conseguir recursos que no conviene producir internamente:',
      ],
      puntos: [
        '**Proveedores de insumos:** tazas y remeras para sublimar, marcos, flores naturales, golosinas, cosméticos y packaging.',
        '**Servicio de delivery** o mensajería para las entregas a domicilio.',
        '**Ueno Bank:** recepción de transferencias por alias.',
        '**Plataformas digitales:** Instagram y WhatsApp (Meta) para difusión y contacto, y Gmail para los avisos automáticos.',
        '**Alianzas potenciales:** organizadores de eventos y salones de fiesta para combos y regalos corporativos.',
      ],
    },
    conexiones: [
      { con: 'recursos', motivo: 'Abastecen insumos y servicios.' },
      { con: 'actividades', motivo: 'Se encargan de la logística y el cobro.' },
      { con: 'canales', motivo: 'Las plataformas son los canales de comunicación.' },
    ],
  },
  {
    id: 'costos',
    numero: 9,
    titulo: 'Estructura de Costos',
    icono: 'bi-calculator',
    pregunta: '¿Cuáles son los costos más importantes del modelo?',
    sintesis: ['Insumos y packaging (variables)', 'Servicios y equipos (fijos)', 'Publicidad y delivery', 'Tecnología y comisiones'],
    justificacion: {
      parrafos: [
        'El modelo está **orientado al valor**: se prioriza la calidad y la personalización por sobre competir por el precio más bajo. Los costos se organizan así:',
      ],
      puntos: [
        '**Costos variables** (dependen de cada pedido): insumos, packaging, impresión y delivery.',
        '**Costos fijos** (mensuales): servicios (energía, internet, teléfono), alquiler o espacio de trabajo y mantenimiento de equipos.',
        '**Marketing:** publicidad paga en Instagram en fechas especiales.',
        '**Tecnología:** la plataforma web es de desarrollo propio; publicarla en internet costaría un servidor (aprox. US$5 por mes) y un dominio.',
        '**Comisiones bancarias** por transferencias, si correspondieran.',
        '**Economías de escala:** comprar insumos al por mayor antes de las fechas pico reduce el costo por unidad.',
      ],
    },
    conexiones: [
      { con: 'recursos', motivo: 'Mantener equipos e insumos genera costos.' },
      { con: 'actividades', motivo: 'Producir y entregar cada pedido tiene un costo variable.' },
      { con: 'ingresos', motivo: 'Deben cubrirse con el margen de cada venta.' },
    ],
  },
]

/** Cómo el sistema web materializa cada bloque del modelo. */
export const sistemaWeb: { bloque: IdBloque; funcion: string }[] = [
  { bloque: 'propuesta', funcion: 'Catálogo con fotos, precios por rango y stock en tiempo real.' },
  { bloque: 'canales', funcion: 'Tienda web propia, integrada con WhatsApp e Instagram.' },
  { bloque: 'relacion', funcion: 'Cuentas verificadas por correo, "Mis pedidos" y avisos automáticos en cada estado.' },
  { bloque: 'ingresos', funcion: 'Pedidos y presupuestos con monto validado según el rango de cada producto.' },
  { bloque: 'actividades', funcion: 'Panel de administración: agenda de pedidos, estados y fechas de entrega.' },
  { bloque: 'recursos', funcion: 'Gestión de productos, stock y fotos desde el panel, sin tocar código.' },
  { bloque: 'costos', funcion: 'Control de stock que evita vender sin insumos; tecnología de bajo costo (código propio).' },
]

export const conclusion = {
  lecciones: [
    'El Canvas obliga a ver el negocio completo en una sola hoja: cambiar un bloque (por ejemplo, sumar delivery) impacta en canales, socios y costos al mismo tiempo.',
    'La propuesta de valor no es el producto en sí, sino la emoción y la tranquilidad que recibe el cliente; todo el modelo se ordena alrededor de esa idea.',
    'La tecnología resolvió problemas concretos del emprendimiento: pedidos desordenados, stock sin control y falta de seguimiento para el cliente.',
    'Trabajar en equipo con roles claros (diseño, producción, atención, tecnología) es tan importante como la idea de negocio.',
  ],
  viabilidad: [
    'Inversión inicial baja: los equipos son accesibles y la plataforma web se desarrolló sin costo de licencias.',
    'Margen atractivo: el precio se basa en el valor de la personalización, no solo en el costo del insumo.',
    'Demanda recurrente: las fechas especiales se repiten cada año y generan picos de venta previsibles.',
    'Riesgos a controlar: la estacionalidad, la competencia en redes sociales y la dependencia de proveedores, que se mitigan con planificación de compras, una identidad de marca fuerte y varios proveedores por insumo.',
  ],
}

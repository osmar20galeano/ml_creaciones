# TP: Modelo de Negocio Canvas

**Materia:** Liderazgo y Desarrollo Emprendedor
**Carrera:** Ingeniería Informática, 3.º año, UniNorte
**Puntaje:** 10 puntos (escrito: 6 · exposición: 4)
**Modalidad:** grupal (5 a 7 integrantes)
**Entrega del escrito:** 30 de octubre · **Exposiciones:** 30 de octubre y 6 de noviembre (orden por sorteo)

## Consigna

Aplicar el **Business Model Canvas** de Alexander Osterwalder a una idea de negocio:

1. Investigar la metodología Canvas.
2. Definir la idea de negocio (en nuestro caso: **M.L. Creaciones & Regalos**).
3. Desarrollar analíticamente los 9 bloques.
4. Redactar el informe escrito y defenderlo en una exposición oral.

### Estructura del escrito (6 pts)

- **Carátula:** datos institucionales, materia, docente, integrantes y fecha.
- **Introducción:** fundamentos de la metodología y presentación del emprendimiento.
- **Desarrollo:**
  - Ficha del proyecto: nombre comercial, rubro, misión, visión y problema que resuelve.
  - Lienzo Canvas gráfico con los 9 bloques.
  - Justificación de cada bloque: 1. Propuesta de Valor · 2. Segmentos de Clientes · 3. Canales · 4. Relación con Clientes · 5. Fuentes de Ingreso · 6. Recursos Clave · 7. Actividades Clave · 8. Socios Clave · 9. Estructura de Costos.
- **Conclusión:** lecciones aprendidas y viabilidad.

### Rúbrica

| Criterio | Puntos |
|---|---|
| Investigación y contextualización (problema, propuesta de valor, justificación) | 1 |
| Coherencia entre los 9 bloques | 2 |
| Profundidad técnica (costos e ingresos; socios, actividades y recursos) | 2 |
| Estructura y redacción | 1 |
| Exposición: liderazgo y trabajo en equipo | 1 |
| Exposición: claridad y síntesis | 1 |
| Exposición: pitch y persuasión | 1 |
| Exposición: defensa y argumentación | 1 |

Exposición: 10 a 12 minutos más 3 de preguntas, con soporte visual.

## Dónde verlo

- **En internet (para la profe):** https://osmar20galeano.github.io/ml_creaciones/
- **En la compu del equipo:** `npm run dev` y luego http://localhost:5173/login → "Conoce el proyecto"
- Para actualizar la versión de internet después de cambiar textos: `npm run publicar:canvas`

## Cómo lo cubre la página `/canvas`

| Requisito | Sección de la página |
|---|---|
| Introducción a la metodología | "¿Qué es el Modelo Canvas?" (y las 4 áreas) |
| Ficha del proyecto | "Ficha del proyecto" |
| Lienzo gráfico | "Lienzo": disposición clásica; al pasar el mouse se ven las conexiones |
| Justificación de los 9 bloques | "Justificación de los 9 bloques" (acordeón) y "Recorrido guiado 1 → 9" (ventana con ← →) |
| Coherencia del modelo | "Coherencia con otros bloques" dentro de cada bloque |
| Profundidad financiera | "Ingresos y costos": rangos de precio reales y calculadora de punto de equilibrio |
| Conclusión | "Lecciones aprendidas" y "Viabilidad del proyecto" |

**Para revisar antes de exponer:**
- Todo el texto está en `frontend/src/data/canvas.ts`. La misión, la visión, los segmentos y los recursos son una propuesta: ajústenlos a la realidad del negocio.
- La calculadora trae **valores de ejemplo**. Durante la exposición, pongan los costos y precios reales.
- La página **no reemplaza el escrito impreso ni las diapositivas** que pide la consigna.

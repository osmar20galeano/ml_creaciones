# M.L. Creaciones & Regalos

Sistema comercial (catálogo, pedidos y presupuestos) de M.L. Creaciones — sedes Caacupé y Atyrá.

## Estructura

```
docs/       Documentación (TP en formato IEEE)
frontend/   App web: React + TypeScript + Vite + Bootstrap 5.3
```

## Frontend

Requiere Node 20 o superior.

```bash
cd frontend
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # compila a frontend/dist
npm run lint     # revisa el código con oxlint
```

### Dónde cambiar cada cosa

| Qué | Archivo |
|---|---|
| Productos, precios, stock inicial e imágenes | `frontend/src/data/productos.ts` |
| Redes, sedes, WhatsApp y datos bancarios | `frontend/src/data/negocio.ts` |
| Colores de la marca | `frontend/src/styles/variables.css` |
| Estilos generales | `frontend/src/styles/global.css` |

Por ahora los pedidos, presupuestos y el stock se guardan en el `localStorage` del navegador.

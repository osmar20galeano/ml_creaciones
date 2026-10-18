# M.L. Creaciones & Regalos

Sistema comercial (catálogo, pedidos y presupuestos) de M.L. Creaciones — sedes Caacupé y Atyrá.

## Estructura

```
docs/       Documentación (TP en formato IEEE)
backend/    API: Node + Express + TypeScript + SQLite (node:sqlite)
frontend/   App web: React + TypeScript + Vite + Bootstrap 5.3
```

## Cómo correrlo

Requiere **Node 24** o superior (usa el SQLite que trae Node).

```bash
npm run instalar                      # instala raíz, backend y frontend
cp backend/.env.example backend/.env  # y completar los valores (ver abajo)
npm run seed                          # crea la cuenta de administrador
npm run dev                           # API en :3000 + web en http://localhost:5173
```

### backend/.env

| Variable | Qué es |
|---|---|
| `JWT_SECRET` | clave para firmar las sesiones (≥ 32 caracteres aleatorios) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Gmail que envía los códigos y su [contraseña de aplicación](https://myaccount.google.com/apppasswords) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | cuenta de administrador que crea `npm run seed` |

`backend/.env` y la base de datos (`backend/data/`) **no se suben a git**.

## Módulos y rutas

| Ruta | Quién | Qué |
|---|---|---|
| `/` | todos | catálogo público (consultas por WhatsApp) |
| `/registro` → `/verificar` | visitantes | crear cuenta: llega un código de 6 dígitos al Gmail |
| `/login` | visitantes | iniciar sesión |
| `/bienvenida` | clientes | saludo de cuenta confirmada |
| `/admin` | administrador | pedidos, presupuestos y stock |

API (`/api/auth`): `POST registro`, `POST verificar`, `POST reenviar-codigo`, `POST login`, `POST logout`, `GET yo`.
La sesión es una cookie `httpOnly` con JWT (7 días). Los códigos vencen en 15 minutos, admiten 5 intentos y se pueden reenviar cada 60 s.

### Dónde cambiar cada cosa

| Qué | Archivo |
|---|---|
| Productos, precios, stock inicial e imágenes | `frontend/src/data/productos.ts` |
| Redes, sedes, WhatsApp y datos bancarios | `frontend/src/data/negocio.ts` |
| Colores de la marca | `frontend/src/styles/variables.css` |
| Estilos generales | `frontend/src/styles/global.css` |

Por ahora los pedidos, presupuestos y el stock se guardan en el `localStorage` del navegador (pasarlos al backend es el siguiente paso).

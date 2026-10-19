# M.L. Creaciones & Regalos

Sistema comercial (catálogo, pedidos y presupuestos) de M.L. Creaciones.

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
npm run publicar:canvas               # publica la página del Canvas en GitHub Pages
```

**Modelo Canvas publicado:** https://osmar20galeano.github.io/ml_creaciones/

## Producción (VPS)

La tienda completa funciona en **https://srv2071565.hstgr.cloud** (Ubuntu + Nginx + HTTPS de Let's Encrypt).

| Archivo | Para qué |
|---|---|
| `deploy/instalar-sistema.sh` | Instalación inicial con sudo: Nginx, Certbot, servicio y certificado |
| `deploy/ml-creaciones.service` | Servicio systemd que mantiene la tienda encendida |
| `deploy/nginx-ml-creaciones.conf` | Nginx como proxy hacia el backend (127.0.0.1:3000) |
| `deploy/actualizar.sh` | Baja los cambios de GitHub, compila y reinicia (sin contraseña) |
| `deploy/respaldo.sh` | Copia diaria de la base de datos y las fotos (últimos 14 días) |

### backend/.env

| Variable | Qué es |
|---|---|
| `JWT_SECRET` | clave para firmar las sesiones (≥ 32 caracteres aleatorios) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Gmail que envía los códigos y su [contraseña de aplicación](https://myaccount.google.com/apppasswords) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | cuenta de administrador que crea `npm run seed` |

`backend/.env` y `backend/data/` (base de datos y fotos subidas) **no se suben a git**. Para hacer una copia de seguridad, copia esa carpeta.

## Módulos y rutas

| Ruta | Quién | Qué |
|---|---|---|
| `/` | todos | catálogo con stock en vivo; los clientes con sesión hacen su pedido acá |
| `/canvas` | todos | presentación del TP: Modelo de Negocio Canvas (ver `docs/TP_Canvas_consigna.md`) |
| `/registro` → `/verificar` | visitantes | crear cuenta: llega un código de 6 dígitos al Gmail |
| `/login` | visitantes | iniciar sesión |
| `/recuperar` | visitantes | olvidé mi contraseña: código por correo + contraseña nueva |
| `/bienvenida` | clientes | saludo de cuenta confirmada |
| `/mis-pedidos` | clientes | sus pedidos con el estado (recibido → preparando → listo → entregado) y presupuestos |
| `/admin` | administrador | agenda de pedidos con filtros y cambio de estado, presupuestos, carga de pedidos en el local |
| `/admin/productos` | administrador | crear y editar productos, precios, stock (+/−), foto y ocultar/mostrar |

### API

| Ruta | Quién | Qué |
|---|---|---|
| `POST /api/auth/registro` · `verificar` · `reenviar-codigo` · `login` · `logout`, `GET /api/auth/yo` | todos | cuenta y sesión |
| `POST /api/auth/olvide` · `restablecer` | todos | recuperar contraseña (no revela si el correo existe; cambiarla cierra las otras sesiones) |
| `GET /api/productos` | todos | catálogo con stock (solo productos visibles) |
| `GET /api/productos/todos` · `POST /api/productos` · `PATCH /api/productos/:id` · `POST /api/productos/:id/stock` | admin | gestionar productos |
| `PUT` / `DELETE /api/productos/:id/imagen` | admin | subir (JPG/PNG/WebP, máx. 5 MB) o quitar la foto |
| `POST /api/pedidos` | con sesión | crear pedido (descuenta stock) |
| `GET /api/pedidos/mios` · `POST /api/pedidos/:id/cancelar` | cliente | sus pedidos; cancelar mientras esté pendiente |
| `GET /api/pedidos?estado=activos` · `PATCH /api/pedidos/:id/estado` | admin | agenda y cambio de estado (cancelar devuelve stock) |
| `POST /api/presupuestos`, `GET /api/presupuestos/mios` | con sesión | pedir y ver presupuestos |
| `GET /api/presupuestos` · `DELETE /api/presupuestos/:id` | admin | ver y borrar presupuestos |

La sesión es una cookie `httpOnly` con JWT (7 días). Los códigos vencen en 15 minutos, admiten 5 intentos y se pueden reenviar cada 60 s.

### Dónde cambiar cada cosa

| Qué | Archivo |
|---|---|
| Productos, precios, stock y fotos | desde el panel: **Admin → Productos** |
| Catálogo inicial (primera vez que se crea la BD) | `backend/src/productos/catalogo.ts` |
| Fotos incluidas de los productos iniciales | `frontend/src/data/imagenes.ts` (las que sube el admin van a `backend/data/uploads/`) |
| Redes, WhatsApp y datos bancarios | `frontend/src/data/negocio.ts` |
| Colores de la marca | `frontend/src/styles/variables.css` |
| Estilos generales | `frontend/src/styles/global.css` |

Productos, stock, pedidos y presupuestos se guardan en la base de datos del backend (`backend/data/ml.db`).

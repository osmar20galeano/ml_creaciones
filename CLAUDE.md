# M.L. Creaciones & Regalos — contexto del proyecto

Sistema web de una tienda de regalos personalizados. Es, a la vez, el proyecto de **dos trabajos prácticos** de Ingeniería Informática (UniNorte, sede Caacupé):

| Materia | Qué se entrega | Dónde está |
|---|---|---|
| **Liderazgo y Desarrollo Emprendedor** | Modelo de Negocio Canvas del emprendimiento: informe escrito y exposición oral (entrega y exposición: 30 de octubre y 6 de noviembre) | Página **`/canvas`** de la web; consigna en `docs/TP_Canvas_consigna.md` |
| **Programación III** | Informe técnico IEEE del sistema | `docs/TP_ML_Creaciones_IEEE_v2.docx` (rama `documento-tp`) |

El equipo expone desde su computadora. Recorrido para la presentación: `http://localhost:5173/login` → botón **"Conoce el proyecto"** → `/canvas` → **"Volver al inicio"**.

**Versión pública del Canvas (sin login ni backend):** https://osmar20galeano.github.io/ml_creaciones/
- Se sirve desde la rama `gh-pages`, que se genera con `npm run publicar:canvas` (script `scripts/publicar-canvas.sh`). **No editar `gh-pages` a mano.**
- Compila `frontend/canvas.html` + `src/main-canvas.tsx` con `vite.canvas.config.ts` (`VITE_SOLO_CANVAS=true`: "Volver al inicio" sube al principio y el link a la tienda lleva al repositorio).
- Después de cambiar `src/data/canvas.ts`, volver a correr `npm run publicar:canvas` para actualizar la web pública.

## Cómo correrlo

```bash
npm run dev          # desde la raíz: API (:3000) + web (http://localhost:5173)
npm run seed         # crea/actualiza el admin desde backend/.env
npm run publicar:canvas  # publica la página del Canvas en GitHub Pages
```

- **Producción:** https://srv2071565.hstgr.cloud (VPS Hostinger del usuario, Ubuntu 26.04). Ver "Servidor" abajo.
- En local (`npm run dev`) es el entorno de desarrollo: su base de datos ya **no** es la real.
- `backend/.env` (clave de Gmail, admin) y `backend/data/` (base SQLite y fotos) **no van a git**. El repo es público.

## Servidor (VPS)

- Acceso: `ssh -i ~/.ssh/id_ed25519_vps osmar@2.24.204.122`. El usuario `osmar` tiene `sudo` **con contraseña**: los pasos con sudo los ejecuta el usuario en su terminal.
- Proyecto en `~/ml_creaciones` (rama `canvas`), con Node 24 vía nvm **solo para este proyecto**. El Node 22 del sistema lo usa Hermes Agent y otros proyectos del usuario: **no tocarlos**.
- Servicio systemd `ml-creaciones` (`deploy/ml-creaciones.service`): el backend en 127.0.0.1:3000 entrega la API y `frontend/dist`. Nginx hace de proxy, con HTTPS de Let's Encrypt (renovación automática).
- **Actualizar** después de hacer push: `ssh … 'bash ~/ml_creaciones/deploy/actualizar.sh'`. No pide contraseña: sudoers permite solo `systemctl restart ml-creaciones`.
- Registros: `journalctl -u ml-creaciones -n 50` (sin sudo).
- Respaldo diario a las 3:30 (cron del usuario) en `~/respaldos/ml_creaciones` (14 días).
- `backend/.env` del VPS es propio (JWT_SECRET distinto, `NODE_ENV=production`, FRONTEND_URL con el dominio). Nunca sobrescribirlo con el local.

## Estructura

- `frontend/`: React 19 + TypeScript + Vite + Bootstrap 5.3 + React Router.
  - `src/pages/`: una página por ruta. `ModeloCanvas.tsx` es la presentación del TP.
  - `src/data/canvas.ts`: **todo el texto del Canvas** (ficha, 9 bloques, conclusión). Para corregir contenido, editar acá.
  - `src/data/negocio.ts`: Instagram, WhatsApp (+595 984 676117) y alias de Ueno Bank (6547001).
- `backend/`: Node 24 + Express 5 + TypeScript (`tsx`) + `node:sqlite`.
  - `src/auth/`: registro con código por Gmail, login, recuperar contraseña, sesiones JWT en cookie httpOnly.
  - `src/pedidos/`: pedidos, presupuestos y avisos por correo.
  - `src/productos/`: catálogo, stock y fotos (panel admin).

Roles: visitante (catálogo), cliente (pedidos, "Mis pedidos") y admin (`/admin`, `/admin/productos`).

## Decisiones del negocio (no volver a proponer salvo que lo pidan)

- Pagos: **solo efectivo y transferencia** al alias de Ueno. Sin pasarela de tarjetas; el comprobante se envía por WhatsApp.
- Sin sedes ni ubicaciones en la web.
- Nunca construir formularios que pidan datos de tarjeta.

## Convenciones

- Todo en **español**: interfaz, mensajes, comentarios y commits.
- Cada cambio en una **rama nueva desde `main`**; push solo cuando el usuario lo pide:
  `git -c credential.helper= -c credential.helper='!gh auth git-credential' push -u origin <rama>`
  (git tiene guardada otra cuenta; `gh` usa la del dueño del repo).
- Antes de terminar: `npm run build` y `npm run lint` en `frontend/`, y `npx tsc --noEmit` en `backend/`.
- Para probar la API sin tocar los datos reales ni mandar correos, usar una instancia aislada:
  `PORT=3001 MAIL_MODO=consola DATABASE_PATH=<carpeta temporal>/ml.db npx tsx src/index.ts`

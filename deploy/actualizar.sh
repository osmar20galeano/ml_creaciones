#!/usr/bin/env bash
# Actualiza la web en el VPS con lo último de GitHub (no necesita contraseña).
# Uso (en el VPS): bash ~/ml_creaciones/deploy/actualizar.sh [rama]
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use --silent 24

raiz="$(cd "$(dirname "$0")/.." && pwd)"
rama="${1:-$(git -C "$raiz" branch --show-current)}"

echo "▶ Descargando cambios de GitHub ($rama)…"
git -C "$raiz" fetch -q origin
git -C "$raiz" checkout -q "$rama"
git -C "$raiz" pull -q --ff-only origin "$rama"

echo "▶ Instalando dependencias y compilando…"
(cd "$raiz/backend" && npm ci --no-audit --no-fund --loglevel=error)
(cd "$raiz/frontend" && npm ci --no-audit --no-fund --loglevel=error && npm run build --silent)

echo "▶ Reiniciando el servicio…"
sudo -n /usr/bin/systemctl restart ml-creaciones
sleep 3
systemctl is-active --quiet ml-creaciones && echo "✅ Actualizado: https://srv2071565.hstgr.cloud" || {
  echo "❌ El servicio no arrancó. Registros:"; journalctl -u ml-creaciones -n 30 --no-pager; exit 1;
}

#!/usr/bin/env bash
# Copia de seguridad de la base de datos y las fotos. Guarda los últimos 14 días.
# Se ejecuta todos los días con cron (ver "crontab -l" en el VPS).
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use --silent 24

datos="$(cd "$(dirname "$0")/../backend/data" && pwd)"
destino="$HOME/respaldos/ml_creaciones"
fecha="$(date +%F)"
mkdir -p "$destino"

# VACUUM INTO hace una copia consistente aunque el servidor esté funcionando.
rm -f "$destino/ml-$fecha.db"
node -e "new (require('node:sqlite').DatabaseSync)(process.argv[1]).exec(\"VACUUM INTO '\" + process.argv[2] + \"'\")" \
  "$datos/ml.db" "$destino/ml-$fecha.db"
tar -czf "$destino/fotos-$fecha.tar.gz" -C "$datos" uploads

find "$destino" -type f -mtime +14 -delete
echo "Respaldo $fecha listo en $destino"

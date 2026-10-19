#!/usr/bin/env bash
# Arranca el backend (API + web compilada) con el Node 24 instalado por nvm.
# Lo ejecuta el servicio systemd "ml-creaciones"; ver deploy/ml-creaciones.service.
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use --silent 24
cd "$(dirname "$0")/../backend"
exec ./node_modules/.bin/tsx src/index.ts

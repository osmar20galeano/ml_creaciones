#!/usr/bin/env bash
# Publica la página del Modelo Canvas en GitHub Pages (rama gh-pages).
# Uso: npm run publicar:canvas   (desde la raíz del proyecto)
# Resultado: https://osmar20galeano.github.io/ml_creaciones/
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
repo="$(git -C "$raiz" remote get-url origin)"

echo "▶ Compilando la versión estática del Canvas…"
(cd "$raiz/frontend" && npm run build:canvas)

temporal="$(mktemp -d)"
trap 'rm -rf "$temporal"' EXIT
cp -r "$raiz/frontend/dist-canvas/." "$temporal/"
touch "$temporal/.nojekyll"   # que GitHub sirva los archivos tal cual, sin procesarlos

echo "▶ Subiendo a la rama gh-pages…"
cd "$temporal"
git init -q -b gh-pages
git add -A
git commit -q -m "Publicar Modelo Canvas ($(date '+%Y-%m-%d %H:%M'))"
# git tiene guardada otra cuenta: se usan las credenciales de gh (dueño del repo).
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -q -f "$repo" gh-pages

echo "✅ Publicado. En 1–2 minutos se ve en https://osmar20galeano.github.io/ml_creaciones/"

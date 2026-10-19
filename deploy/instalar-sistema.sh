#!/usr/bin/env bash
# Parte de la instalación que necesita permisos de administrador.
# Uso (en el VPS): sudo bash ~/ml_creaciones/deploy/instalar-sistema.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "❌ Ejecutalo con sudo: sudo bash $0"; exit 1; }

DIR="$(cd "$(dirname "$0")" && pwd)"
DOMINIO="srv2071565.hstgr.cloud"
USUARIO="osmar"

echo "▶ 1/6 Instalando Nginx y Certbot…"
apt-get update -q
DEBIAN_FRONTEND=noninteractive apt-get install -y -q nginx certbot python3-certbot-nginx

echo "▶ 2/6 Creando el servicio ml-creaciones (arranca solo al reiniciar el VPS)…"
install -m 644 "$DIR/ml-creaciones.service" /etc/systemd/system/ml-creaciones.service
systemctl daemon-reload
systemctl enable --now ml-creaciones
sleep 3
systemctl is-active --quiet ml-creaciones || { journalctl -u ml-creaciones -n 30 --no-pager; exit 1; }

echo "▶ 3/6 Configurando Nginx…"
install -m 644 "$DIR/nginx-ml-creaciones.conf" /etc/nginx/sites-available/ml-creaciones
ln -sf /etc/nginx/sites-available/ml-creaciones /etc/nginx/sites-enabled/ml-creaciones
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "▶ 4/6 Firewall…"
if ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full'
else
  echo "   (ufw no está activo: no se cambia nada)"
fi

echo "▶ 5/6 Permisos para actualizar la web sin contraseña…"
# Solo permite reiniciar este servicio (sin paginador, así no abre ninguna terminal como root).
echo "$USUARIO ALL=(root) NOPASSWD: /usr/bin/systemctl restart ml-creaciones" > /etc/sudoers.d/ml-creaciones
chmod 440 /etc/sudoers.d/ml-creaciones
visudo -cf /etc/sudoers.d/ml-creaciones
# Para leer los registros del servicio sin sudo.
usermod -aG systemd-journal "$USUARIO"

echo "▶ 6/6 Certificado HTTPS (Let's Encrypt)…"
certbot --nginx -d "$DOMINIO" --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo "✅ Listo: https://$DOMINIO"

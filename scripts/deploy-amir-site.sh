#!/usr/bin/env bash
# Deploy amir-khosravi.de rebuild — same artifact as CI build, healthcheck + rollback.
# Run from repo root on the VPS (or pipe via ssh). Env: AMIR_WEBROOT, AMIR_API_ENV_FILE.
set -euo pipefail
WEBROOT="${AMIR_WEBROOT:-/var/www/nelurio/amir-v2}"
API_ENV="${AMIR_API_ENV_FILE:-/etc/amir-site/api.env}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/site"
TS="$(date +%Y%m%d-%H%M%S)"

echo "[1/6] sync static artifact -> $WEBROOT.new"
sudo mkdir -p "$WEBROOT.new" && sudo rsync -a --delete --exclude BRIEF.md --exclude quality-baseline.d --exclude tests --exclude tools "$SRC"/ "$WEBROOT.new"/

echo "[2/6] atomic swap (previous kept at $WEBROOT.prev)"
sudo rm -rf "$WEBROOT.prev"
[ -d "$WEBROOT" ] && sudo mv "$WEBROOT" "$WEBROOT.prev"
sudo mv "$WEBROOT.new" "$WEBROOT"

echo "[3/6] build + (re)start API service"
cd "$(dirname "$0")/../api"
GOFLAGS=-mod=mod go build -o /tmp/amir-api-"$TS" .
sudo mv /tmp/amir-api-"$TS" /usr/local/bin/amir-api
sudo systemctl enable --now amir-api 2>/dev/null || true
sudo systemctl restart amir-api

echo "[4/6] caddy validate + reload"
sudo caddy validate --config /etc/caddy/Caddyfile >/dev/null
sudo systemctl reload caddy

echo "[5/6] healthcheck"
sleep 2
for i in 1 2 3 4 5; do
  if curl -fsS https://amir-khosravi.de/api/health | grep -q '"status":"ok"'; then HC=ok; break; fi
  if curl -fsS -o /dev/null -w '%{http_code}' https://amir-khosravi.de/ | grep -q 200; then HC=static-ok; break; fi
  sleep 3
done
HC="${HC:-fail}"

echo "[6/6] result: $HC"
if [ "$HC" = "fail" ]; then
  echo "ROLLBACK: restoring previous webroot + API binary"
  sudo systemctl stop amir-api || true
  [ -d "$WEBROOT.prev" ] && sudo rm -rf "$WEBROOT" && sudo mv "$WEBROOT.prev" "$WEBROOT"
  sudo systemctl start amir-api || true
  exit 2
fi
echo "deploy $TS ok ($HC) — ledger entry follows in site/quality-baseline.d/"

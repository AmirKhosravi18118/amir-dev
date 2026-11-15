#!/usr/bin/env bash
# Push the CI artifact (git archive of site/ at HEAD) to the VPS and swap it in.
# Usage: scripts/push-amir-artifact.sh   (from repo root; deploy-amir-site.sh runs server-side)
set -euo pipefail
VPS="${AMIR_VPS:-ubuntu@92.5.111.34}"
KEY="${AMIR_SSH_KEY:-$HOME/.ssh/nelurio-oracle.key}"
EX="--exclude BRIEF.md --exclude quality-baseline.d --exclude tests --exclude tools"

git archive HEAD site | gzip > /tmp/amir-site.tar.gz
scp -q -i "$KEY" /tmp/amir-site.tar.gz "$VPS":/tmp/
# NOTE: never `scp -r` a directory here — it nests into a subdir and rsync ships a stale tree (bug seen 2026-11-15).
ssh -i "$KEY" "$VPS" "
  set -e
  rm -rf /tmp/amir-x && mkdir /tmp/amir-x && tar -xzf /tmp/amir-site.tar.gz -C /tmp/amir-x
  sudo rsync -a --delete $EX /tmp/amir-x/site/ /var/www/nelurio/amir-v2/
  rm -rf /tmp/amir-x /tmp/amir-site.tar.gz
  curl -s -o /dev/null -w 'live %{http_code}\n' https://amir-khosravi.de/
  curl -s https://amir-khosravi.de/api/health
"

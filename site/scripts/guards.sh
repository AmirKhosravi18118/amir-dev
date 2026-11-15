#!/usr/bin/env bash
# Firewall Phase 3 guards — amir-khosravi.de. Exit 0=pass 1=warn 2=fail.
# Usage: guards.sh [--self-test]
set -uo pipefail
cd "$(dirname "$0")/../.."   # repo root
FAIL=0
run() { # name command...
  local name="$1"; shift
  if "$@" >/tmp/guard-$name.out 2>&1; then echo "PASS $name"
  else echo "FAIL $name"; sed -n '1,15p' /tmp/guard-$name.out; FAIL=2; fi
}

run i18n-complete   node site/tests/check-build.mjs
run gallery-actions node --test site/tests/gallery-actions.test.cjs

# forbidden patterns: secrets/console.log outside allowed files
if grep -rnE "console\.log|AKIA[0-9A-Z]{16}|BEGIN (RSA )?PRIVATE KEY" site/js site/css --include='*.js' --include='*.css' \
   | grep -v quality-baseline; then echo "FAIL forbidden-patterns"; FAIL=2; else echo "PASS forbidden-patterns"; fi

# hardcoded colours outside tokens.css (and qr.svg which must be literal)
if grep -rnE "#[0-9a-fA-F]{3,8}\b" site/css site --include='*.css' | grep -v "css/tokens.css" | grep -v "quality-baseline" \
   | grep -v "site/en\|site/i18n"; then echo "FAIL hardcoded-colours"; FAIL=2; else echo "PASS hardcoded-colours"; fi

if [ "${1:-}" = "--self-test" ]; then
  echo "--- self-test: inject violations into a temp copy, expect guards to turn red ---"
  T="$(mktemp -d)"; cp -r site "$T/site"; rm -rf "$T/site/node_modules"
  ( cd "$T"
    # 1. missing i18n key
    node -e "const fs=require('fs');let h=fs.readFileSync('site/index.html','utf8');fs.writeFileSync('site/index.html',h.replace(/data-t=\"[a-z.]+\"/,'data-t=\"zz.bogus.key\"'))"
    if node "$PWD/site/tests/check-build.mjs" >/dev/null 2>&1; then echo "SELF-FAIL i18n guard did not trip"; FAIL=2; else echo "SELF-PASS i18n-injection trips guard"; fi
    # 2. hardcoded colour
    printf '.x{color:#123456}\n' >> site/css/site.css
    if node "$PWD/site/tests/check-build.mjs" >/dev/null 2>&1; then echo "SELF-FAIL colour guard did not trip"; FAIL=2; else echo "SELF-PASS colour-injection trips guard"; fi
  )
  rm -rf "$T"
  [ "$FAIL" = 0 ] && echo "SELF-TEST GREEN" || echo "SELF-TEST RED"
  exit "$FAIL"
fi
exit "$FAIL"

#!/usr/bin/env bash
# Firewall Phase 5 meta-guard (R1–R5) — amir-khosravi.de CI contract.
set -uo pipefail
cd "$(dirname "$0")/.."
FAIL=0
CI=.github/workflows/amir-site.yml
[ -f "$CI" ] || { echo "FAIL R0 $CI missing"; exit 2; }
# R1: every guard is called in CI
for g in guards.sh; do grep -q "$g" "$CI" || { echo "FAIL R1 $g not in CI"; FAIL=2; }; done
grep -q "go test" "$CI" || { echo "FAIL R1 go test not in CI"; FAIL=2; }
grep -q "go vet" "$CI" || { echo "FAIL R1 go vet not in CI"; FAIL=2; }
grep -q "check-build.mjs" "$CI" || { echo "FAIL R1 check-build not in CI"; FAIL=2; }
# R2: guards runnable with --self-test
bash site/scripts/guards.sh --self-test >/dev/null 2>&1 || { echo "FAIL R2 guards self-test red"; FAIL=2; }
# R3: actions pinned by SHA
if grep -nE "uses: [^@]+@(v[0-9]+|master|main)" "$CI"; then echo "FAIL R3 unpinned action"; FAIL=2; fi
# R4: no swallowed failures
grep -nE "continue-on-error|\|\| true" "$CI" && { echo "FAIL R4 swallowed failure"; FAIL=2; }
# R5: ledger exists and is append-only in spirit (has at least one entry)
ls site/quality-baseline.d/*.md >/dev/null 2>&1 || { echo "FAIL R5 ledger empty"; FAIL=2; }
[ "$FAIL" = 0 ] && echo "META-GUARD GREEN (R1–R5)" || echo "META-GUARD RED"
exit "$FAIL"

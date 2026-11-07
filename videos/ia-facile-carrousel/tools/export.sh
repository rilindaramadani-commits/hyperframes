#!/usr/bin/env bash
# Exporte les 5 slides du carrousel en PNG 1080x1350 dans export/.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf .hyperframes/export && npx hyperframes snapshot --at 0.5,1.5,2.5,3.5,4.5 --no-end -o .hyperframes/export
mkdir -p export
i=1; for f in .hyperframes/export/frame-0*-at-*.png; do cp "$f" "export/ia-facile-slide-$i.png"; i=$((i+1)); done
ls -la export

#!/usr/bin/env bash
# Regenerate one Kokoro clip per line (French voice ff_siwis), then assemble.
set -e
cd "$(dirname "$0")/.."
python3 - <<'PY' > /tmp/vo_lines.tsv
import json
for l in json.load(open("tools/voice.json"))["lines"]:
    print(l["id"] + "\t" + l["say"])
PY
while IFS=$'\t' read -r id say; do
  npx hyperframes tts "$say" -v ff_siwis -s 1.05 -o "tools/vo-lines/$id.wav" --json >/dev/null
done < /tmp/vo_lines.tsv
python3 tools/build_voice.py

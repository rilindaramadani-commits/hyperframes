"""Root composition timing ← the plan timing (tools/timing.json).

Sets the root duration, the start/duration of each text block (hook, the three errors, outro,
captions) and of the voice/music beds, so a new voice-over only needs this script re-run.
Run from the project root:
    python3 tools/sync_index.py
"""
import json
import re

tim = json.load(open("tools/timing.json"))
P, TOTAL = tim["plan"], tim["total"]
S = lambda pid: P[pid]["start"]
fmt = lambda x: f"{round(x, 3):g}"

blocks = {
    "block-hook": (0, S("p03")),
    "block-err1": (S("p03"), S("p07")),
    "block-err2": (S("p07"), S("p11")),
    "block-err3": (S("p11"), S("p15")),
    "block-outro": (S("p15"), TOTAL),
    "block-captions": (0, TOTAL),
    "voiceover": (0, TOTAL),
    "music": (0, TOTAL),
}

s = open("index.html").read()
for el, (a, b) in blocks.items():
    pat = re.compile(rf'(id="{el}"[^>]*?data-start=")[^"]*("[^>]*?data-duration=")[^"]*(")')
    s, n = pat.subn(lambda m: f"{m.group(1)}{fmt(a)}{m.group(2)}{fmt(b - a)}{m.group(3)}", s)
    assert n == 1, el
# root composition duration
s, n = re.subn(r'(data-composition-id="main"[^>]*?data-duration=")[^"]*(")', rf"\g<1>{fmt(TOTAL)}\g<2>", s, flags=re.S)
assert n == 1, "root"
open("index.html", "w").write(s)
for el, (a, b) in blocks.items():
    print(f"{el:15s} {a:6.2f} → {b:6.2f}")
print("total", TOTAL)

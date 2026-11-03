"""Place the sound effects in index.html (between the SFX markers).

Each cue = (picture time, file, volume): the clip starts so that its loudest moment lands one
frame after the picture (light before sound). Files: assets/audio/sfx/*.mp3 (Pixabay licence).
"""
import re, subprocess
import numpy as np

SR = 48000
FRAME = 1 / 30
CUES = [
    (0.50, "typing", 0.30),          # the consultant types the vague question
    (1.55, "click-soft", 0.45),      # send
    (2.98, "error", 0.16),           # "réponse générique" stamp
    (3.75, "whoosh", 0.32),          # camera pulls back to the AI hub
    *[(5.10 + i * 0.16, ["pop", "click-soft"][i % 2], 0.30 if i % 2 == 0 else 0.4) for i in range(5)],  # cubes land
    *[(t0 - 0.05, ["whoosh-short", "whoosh"][i % 2], 0.24) for i, t0 in enumerate([7.0, 9.0, 11.0, 13.0, 15.0])],
    *[(t0 + 0.32, ["pop", "click"][i % 2], 0.26) for i, t0 in enumerate([7.0, 9.0, 11.0, 13.0, 15.0])],  # letter tile
    (9.82, "click-soft", 0.5),       # the arrow taps the task
    (11.2, "sparkle", 0.22),         # the assistant materialises
    (13.32, "key-press", 0.4),       # the console prints
    (16.08, "pop", 0.3),             # gold check on the template
    (16.92, "whoosh", 0.3),          # into the giant screen
    (17.8, "typing", 0.22), (19.1, "typing", 0.2),   # the prompt types itself
    *[(t, ["click-soft", "click"][i % 2], 0.36) for i, t in enumerate([20.85, 21.45, 22.05, 22.65, 23.25])],
    (24.0, "whoosh-short", 0.3),     # screen splits in two
    (27.05, "whoosh", 0.34),         # chocolate curtain
    (28.62, "impact-bass-1", 0.42),  # the RILI SUCCESS cube lands
]


def peak_offset(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.abs(np.frombuffer(raw, dtype=np.float32))
    w = int(0.005 * SR)
    e = np.convolve(x, np.ones(w) / w, mode="same")
    return float(np.argmax(e) / SR), len(x) / SR


cache = {}
lines = []
lane_end = {}
for k, (t, name, vol) in enumerate(sorted(CUES)):
    f = f"assets/audio/sfx/{name}.mp3"
    if f not in cache:
        cache[f] = peak_offset(f)
    pk, dur = cache[f]
    start = max(0.0, t if name == "typing" else t + FRAME - pk)
    dur = min(dur, 30 - start)
    lane = next(l for l in range(11, 40) if lane_end.get(l, -1) <= start)
    lane_end[lane] = start + dur
    lines.append(f'      <audio id="sfx-{k:02d}" src="{f}" data-start="{start:.3f}" data-duration="{dur:.3f}" data-track-index="{lane}" data-volume="{vol}"></audio>')
html = open("index.html", encoding="utf-8").read()
html = re.sub(r"(<!-- SFX:BEGIN[^\n]*\n).*?(\s*<!-- SFX:END -->)", lambda m: m.group(1) + "\n".join(lines) + m.group(2), html, flags=re.S)
open("index.html", "w", encoding="utf-8").write(html)
for f, (pk, d) in cache.items():
    print(f"{f}: peak at {pk:.3f}s of {d:.2f}s")
print(len(lines), "cues")

"""Import a full voice-over recording and rebuild the plan timing around it.

    python3 tools/import_voice.py <recording> <spans.json> [tempo]

spans.json holds the speech span (start, end in seconds of the recording) of each plan p01..p17,
found from the pauses between sentences. The recording is cleaned (high-pass, loudness), optionally
sped up (pitch-preserving), cut into one clip per plan (assets/audio/vo/pXX.wav), and assets/plan.json
is retimed so every plan holds its clip plus the breathing room the visuals need.
Then run: build_plan.py, align_words.py, build_plan.py (cues from words), make_audio.py,
duck_music.py, build_sfx.py, sync_index.py.
"""
import json
import subprocess
import sys
import wave

import numpy as np

src, spans_path = sys.argv[1], sys.argv[2]
tempo = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
SR = 48000
spans = json.load(open(spans_path))
ids = spans["ids"]
old = {p["id"]: p for p in json.load(open("assets/plan.json"))["plans"]}

raw = subprocess.run(
    ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", src, "-af", f"highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11,atempo={tempo}", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
    capture_output=True, check=True,
).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

PRE, POST = 0.06, 0.14  # keep breaths/decays around each sentence
# silence needed after each plan's speech so cuts, rewinds and exits never step on the voice
GAP = {"p02": 0.35, "p05": 0.55, "p06": 0.85, "p09": 0.55, "p10": 0.85, "p13": 0.6, "p14": 0.6, "p17": 1.1}
LEAD = 0.1
clips, meta, plans = {}, {}, []
t = 0.0
for k, pid in enumerate(ids):
    a, b = spans["spans"][k]
    a, b = a / tempo, b / tempo
    i0, i1 = max(0, int((a - PRE) * SR)), min(len(x), int((b + POST) * SR))
    c = x[i0:i1].copy()
    # tighten dead air inside the sentence: pauses longer than MAXP keep MAXP (cut in their middle)
    hop = int(0.01 * SR)
    nf = len(c) // hop
    db = 20 * np.log10(np.sqrt((c[: nf * hop].reshape(nf, hop) ** 2).mean(1)) + 1e-9)
    quiet = db < (np.percentile(db, 99) - 30)
    keep = np.ones(len(c), dtype=bool)
    MAXP = 0.32
    j = int(PRE / 0.01) + 2
    while j < nf - int(POST / 0.01) - 2:
        if quiet[j]:
            e = j
            while e < nf and quiet[e]:
                e += 1
            ln = (e - j) * 0.01
            if ln > MAXP + 0.04:
                cut = ln - MAXP
                m0 = int((j * 0.01 + MAXP / 2) * SR)
                keep[m0 : m0 + int(cut * SR)] = False
            j = e
        else:
            j += 1
    c = c[keep]
    f = int(0.012 * SR)
    c[:f] *= np.linspace(0, 1, f)
    c[-f:] *= np.linspace(1, 0, f)
    clips[pid] = c
    clen = len(c) / SR
    lead = LEAD if k else 0.15
    need = lead + clen + GAP.get(pid, 0.22)
    dur = round(max(need, old[pid]["dur"] * 0.9), 2)
    plans.append({"id": pid, "start": round(t, 3), "dur": dur, "lead": lead})
    meta[pid] = {"dur": round(clen, 3), "speechStart": PRE, "speechEnd": round(clen - POST, 3), "sr": SR, "peak": round(float(np.max(np.abs(c))), 3)}
    t = round(t + dur, 3)
    with wave.open(f"assets/audio/vo/{pid}.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(c, -1, 1) * 32767).astype(np.int16).tobytes())
total = round(t, 2)
json.dump({"fps": 30, "total": total, "plans": plans}, open("assets/plan.json", "w"), indent=1)
json.dump(meta, open("tools/vo_meta.json", "w"), indent=1)
# the full voice track at its final positions
n = int(total * SR)
vo = np.zeros(n, dtype=np.float32)
for p in plans:
    c = clips[p["id"]]
    i0 = int((p["start"] + p["lead"]) * SR)
    vo[i0 : i0 + len(c)] += c[: max(0, min(len(c), n - i0))]
st = np.stack([vo, vo], 1)
with wave.open("assets/audio/voiceover.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("total", total)
for p in plans:
    print(p["id"], p["start"], p["dur"], meta[p["id"]]["dur"])

"""Music bed (104 BPM, F major, minimal modern) shaped by the edit's cue sheet + an SFX library.

Deterministic (seeded). Usage: python3 tools/make_audio.py assets/plan.json assets/audio
"""
import json
import sys
import wave

import numpy as np

SR = 48000
PLAN = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
TOTAL = PLAN["total"]
P = {p["id"]: p for p in PLAN["plans"]}
rng = np.random.default_rng(11)


def write(name, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    m = np.max(np.abs(x)) + 1e-9
    x = x / m * peak
    with wave.open(f"{OUT}/{name}.wav", "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def fft_conv(x, ir):
    n = len(x) + len(ir) - 1
    N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:n]


def reverb(x, seconds=2.2, decay=3.0, mix=0.3, seed=1):
    r = np.random.default_rng(seed)
    n = int(SR * seconds)
    t = np.arange(n) / SR
    outs = []
    for _ in range(2):
        noise = np.convolve(r.standard_normal(n), np.ones(6) / 6, mode="same")
        ir = noise * np.exp(-decay * t)
        k = int(0.01 * SR)
        ir[:k] *= np.linspace(0, 1, k)
        ir /= np.sqrt(np.sum(ir ** 2))
        outs.append(fft_conv(x, ir)[: len(x)])
    wet = np.stack(outs, 1)
    return np.stack([x, x], 1) * (1 - mix) + wet * mix * 1.6


def filt(x, lo=None, hi=None):
    N = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(N, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, N)


def env(L, a, r, curve=2.0):
    e = np.ones(L)
    na, nr = min(int(a * SR), L), min(int(r * SR), L)
    if na:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def tail(x, s=0.05):
    m = int(s * SR)
    x = x.copy()
    x[-m:] *= np.linspace(1, 0, m)[:, None] if x.ndim == 2 else np.linspace(1, 0, m)
    return x


# ============================================================ MUSIC
BPM = 104
BEAT = 60 / BPM
GRID0 = 2.6  # first downbeat lands on the hook's "3 ERREURS" (title lands just before « saboter »)
try:
    _sab = next(w for w in json.load(open("tools/words.json")) if w["plan"] == "p01" and w["w"].startswith("saboter"))
    GRID0 = round(_sab["s"] - 0.26, 3)
except (FileNotFoundError, StopIteration):
    pass
n = int(SR * (TOTAL + 0.2))
t = np.arange(n) / SR


def end_of(pid):
    return P[pid]["start"] + P[pid]["dur"]


# cue sheet derived from the plan
REWINDS = [(end_of("p05") - 0.4, end_of("p05")), (end_of("p09") - 0.4, end_of("p09")), (end_of("p13") - 0.5, end_of("p13"))]
DRUM_OFF = [
    (0, GRID0),
    (REWINDS[0][0], P["p06"]["start"] + 1.15),
    (REWINDS[1][0], P["p10"]["start"] + 1.15),
    (P["p13"]["start"], P["p14"]["start"] + 1.6),
    (P["p16"]["start"], P["p17"]["start"]),
]
LOWPASS = [(P["p13"]["start"], REWINDS[2][0])]
END_HIT = TOTAL - 0.75


def in_any(x, spans):
    return any(a <= x < b for a, b in spans)


drums = np.zeros(n)
bass = np.zeros(n)
keys = np.zeros(n)
pad = np.zeros(n)


def add(buf, at, sig):
    i0 = int(at * SR)
    if i0 >= len(buf):
        return
    L = min(len(sig), len(buf) - i0)
    if i0 < 0:
        sig = sig[-i0:]
        L = min(len(sig), len(buf))
        i0 = 0
    buf[i0 : i0 + L] += sig[:L]


def kick(amp=1.0):
    L = int(0.45 * SR)
    tt = np.arange(L) / SR
    f = 46 + 90 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 8) * amp


clap_src = filt(rng.standard_normal(int(0.25 * SR)), 900, 6000)


def clap(amp=1.0):
    L = len(clap_src)
    tt = np.arange(L) / SR
    e = np.zeros(L)
    for k, d in enumerate((0, 0.009, 0.018)):
        i = int(d * SR)
        e[i:] += np.exp(-(tt[: L - i]) * (60 if k < 2 else 18))
    return clap_src * e * amp * 0.5


hat_src = filt(rng.standard_normal(int(0.08 * SR)), 7000, 15000)


def hat(amp=1.0, decay=55):
    tt = np.arange(len(hat_src)) / SR
    return hat_src * np.exp(-tt * decay) * amp


def pluck(f, amp=1.0, L=0.9):
    N = int(L * SR)
    tt = np.arange(N) / SR
    s = (np.sin(2 * np.pi * f * tt + 1.4 * np.exp(-tt * 10) * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 5.5)
         + 0.25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 9))
    a = int(0.003 * SR)
    s[:a] *= np.linspace(0, 1, a)
    return s * amp


CHORDS = [  # (bass root, chord tones) one per bar
    (41, [65, 69, 72, 76, 79]),  # Fmaj9
    (45, [64, 67, 69, 72, 76]),  # Am7
    (38, [62, 65, 69, 72, 76]),  # Dm9
    (36, [60, 64, 67, 72, 74]),  # Cadd9
]
ARP = [0, 2, 4, 3, 1, 3, 2, 4]
bars = int((TOTAL - GRID0) / (4 * BEAT)) + 3
for b in range(-2, bars):
    t_bar = GRID0 + b * 4 * BEAT
    root, tones = CHORDS[b % 4]
    # pad (always on, slow attack)
    if t_bar < TOTAL:
        L = int(4 * BEAT * SR * 1.25)
        tt = np.arange(L) / SR
        s = np.zeros(L)
        for m in tones[:4]:
            for det in (-0.0015, 0.0015):
                s += np.sin(2 * np.pi * hz(m) * (1 + det) * tt) + 0.2 * np.sin(4 * np.pi * hz(m) * tt)
        add(pad, max(0, t_bar - 0.15), s * env(L, 0.8, 1.0) * 0.045)
    for step in range(8):
        ts = t_bar + step * BEAT / 2
        if ts < 0 or ts >= END_HIT:
            continue
        drum_on = not in_any(ts, DRUM_OFF)
        # pluck arp (8ths), sparser when drums are off
        if (drum_on or step % 2 == 0) and not in_any(ts, REWINDS):
            m = tones[ARP[step]] + (12 if (b % 2 and step in (3, 7)) else 0)
            add(keys, ts, pluck(hz(m), 0.16 if step % 2 == 0 else 0.11))
        if not drum_on:
            continue
        beat = step / 2
        if step in (0, 4) or (step == 3 and b % 2):
            add(drums, ts, kick(0.9 if step in (0, 4) else 0.55))
        if step in (2, 6):
            add(drums, ts, clap(0.8))
        add(drums, ts, hat(0.32 if step % 2 else 0.22))
        add(drums, ts + BEAT / 4, hat(0.12, 80))
        if step == 0:
            L = int(4 * BEAT * SR * 0.95)
            tt = np.arange(L) / SR
            add(bass, ts, np.sin(2 * np.pi * hz(root) * tt) * env(L, 0.02, 0.4) * 0.5)

# sidechain pump on keys/pad/bass from the kick grid
pump = np.ones(n)
for b in range(-2, bars):
    for k in (0, 2):
        ts = GRID0 + b * 4 * BEAT + k * BEAT
        if ts < 0 or in_any(ts, DRUM_OFF):
            continue
        i0 = int(ts * SR)
        L = int(0.32 * SR)
        if i0 + L < n:
            pump[i0 : i0 + L] = np.minimum(pump[i0 : i0 + L], 0.55 + 0.45 * np.linspace(0, 1, L) ** 0.7)

keys = filt(keys, None, 5200)
mix = pad * pump + keys * pump * 1.0 + bass * pump * 0.9
mixst = reverb(mix, 2.4, 2.8, 0.28)
mixst += np.stack([drums, drums], 1) * 0.55

# final chord hit
L = int(1.2 * SR)
tt = np.arange(L) / SR
hit = np.zeros(L)
for m in (53, 65, 69, 72, 76, 81):
    hit += pluck(hz(m), 0.14, 1.2)[:L]
i0 = int(END_HIT * SR)
mixst[i0 : i0 + L] += reverb(hit, 2.0, 2.5, 0.35)[: max(0, min(L, len(mixst) - i0))]
add_kick = kick(1.0)
mixst[i0 : i0 + len(add_kick)] += np.stack([add_kick, add_kick], 1)[: max(0, min(len(add_kick), len(mixst) - i0))] * 0.55

# low-pass suspense window
for a, b in LOWPASS:
    i0, i1 = int(a * SR), int(b * SR)
    seg = mixst[i0:i1].copy()
    lp = np.stack([filt(seg[:, 0], None, 700), filt(seg[:, 1], None, 700)], 1)
    fade = int(0.15 * SR)
    w = np.ones(i1 - i0)
    w[:fade] = np.linspace(0, 1, fade)
    w[-fade:] = np.linspace(1, 0, fade)
    mixst[i0:i1] = seg * (1 - w[:, None]) + lp * w[:, None] * 0.8

# tape stops on the rewinds: the last 0.4 s slows to a halt
for a, b in REWINDS:
    i0, i1 = int(a * SR), int(b * SR)
    L = i1 - i0
    src = mixst[i0 - L : i1].copy()  # material leading into the stop
    rate = np.linspace(1.0, 0.0, L) ** 1.3
    pos = np.cumsum(rate)
    pos = pos / pos[-1] * (L * 0.55)
    idx = np.clip(pos.astype(int) + L // 2, 0, len(src) - 1)
    stop = src[idx] * np.linspace(1, 0.15, L)[:, None]
    mixst[i0:i1] = stop

# CTA lift (+4 dB) and master fades
lift = np.ones(len(mixst))
c0 = int(P["p17"]["start"] * SR)
lift[c0:] = 10 ** (4 / 20)
mixst *= lift[:, None]
fi = int(0.5 * SR)
mixst[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2
mixst = mixst[: int(TOTAL * SR)]
fo = int(0.5 * SR)
mixst[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
mixst = np.tanh(mixst / (np.max(np.abs(mixst)) + 1e-9) * 1.3) / np.tanh(1.3)
write("music", mixst)

# ============================================================ SFX
def noise(L, seed=3):
    return np.random.default_rng(seed).standard_normal(int(L * SR))


def sweep_tone(f0, f1, L, dec):
    N = int(L * SR)
    tt = np.arange(N) / SR
    f = f0 * (f1 / f0) ** (tt / L)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * dec)


def bell(f, L=1.2, amp=1.0):
    N = int(L * SR)
    tt = np.arange(N) / SR
    s = (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 9)
         + 0.2 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 16))
    a = int(0.002 * SR)
    s[:a] *= np.linspace(0, 1, a)
    return s * amp


def whoosh(L=1.0, lo0=250, hi0=800, lo1=1500, hi1=7000, seed=3, rise=False):
    N = int(L * SR)
    src = noise(L, seed)
    out = np.zeros(N)
    win, hop = 2048, 512
    w = np.hanning(win)
    f = np.fft.rfftfreq(win, 1 / SR)
    for i in range(0, N - win, hop):
        p = i / (N - win)
        lo = lo0 + (lo1 - lo0) * p
        hi = hi0 + (hi1 - hi0) * p
        X = np.fft.rfft(src[i : i + win] * w)
        g = np.exp(-0.5 * ((np.log(np.maximum(f, 1)) - np.log((lo + hi) / 2)) / 0.6) ** 2)
        out[i : i + win] += np.fft.irfft(X * g, win) * w
    tt = np.arange(N) / SR
    shape = (tt / L) ** 2.2 if rise else np.sin(np.pi * np.clip(tt / L, 0, 1)) ** 1.6
    return out * shape



def S(*xs):
    """Sum signals of different lengths (zero-padded)."""
    L = max(len(x) for x in xs)
    out = np.zeros(L)
    for x in xs:
        out[: len(x)] += x
    return out

sfx = {}
# droplet, amplified with a long tail
N = int(0.5 * SR)
tt = np.arange(N) / SR
d = np.sin(2 * np.pi * np.cumsum(700 + 1600 * (1 - np.exp(-tt * 45))) / SR) * np.exp(-tt * 20)
sfx["drop"] = reverb(d, 2.2, 3.0, 0.5, 5)
# light ceramic crack
c = np.zeros(int(0.5 * SR))
for k, at in enumerate((0, 0.035, 0.06, 0.11)):
    burst = filt(noise(0.04, 20 + k), 1500, 9000) * np.exp(-np.arange(int(0.04 * SR)) / SR * 90)
    i = int(at * SR)
    c[i : i + len(burst)] += burst * (1 - 0.18 * k)
c = S(c, 0.4 * bell(2600, 0.5)[: len(c)] * np.exp(-np.arange(len(c)) / SR * 14))
sfx["crack"] = reverb(c, 1.0, 5, 0.25, 6)
sfx["whoosh"] = reverb(whoosh(0.9, seed=4), 1.2, 4, 0.25, 7)
sfx["suck"] = reverb(whoosh(0.65, 300, 900, 2500, 9000, seed=8, rise=True), 0.8, 6, 0.2, 9)
sfx["riser"] = reverb(S(whoosh(1.1, 200, 600, 2500, 10000, seed=12, rise=True), 0.3 * sweep_tone(220, 880, 1.1, 0) * (np.arange(int(1.1 * SR)) / SR / 1.1) ** 3), 1.0, 4, 0.3, 10)
N = int(0.9 * SR)
tt = np.arange(N) / SR
imp = S(np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-tt * 18)) / SR) * np.exp(-tt * 5), 0.15 * filt(noise(0.9, 30), 80, 900) * np.exp(-tt * 12))
sfx["impact"] = reverb(imp, 1.6, 3.5, 0.3, 11)
for k, m in enumerate((84, 88, 91)):
    sfx[f"pop-{k+1}"] = reverb(S(sweep_tone(hz(m) * 1.6, hz(m), 0.18, 22), 0.3 * bell(hz(m), 0.3)), 0.9, 6, 0.25, 12 + k)
sfx["tick"] = reverb(S(filt(noise(0.012, 40), 2500, 12000) * np.hanning(int(0.012 * SR)), 0.25 * bell(3200, 0.12)), 0.5, 10, 0.15, 14)
for k, m in enumerate((93, 95, 97, 100)):
    sfx[f"clink-{k+1}"] = reverb(S(bell(hz(m), 0.7, 1.0), 0.5 * bell(hz(m) * 1.5, 0.4)), 1.0, 6, 0.25, 15 + k)
# wood creak: low saw with wobbly pitch
N = int(0.9 * SR)
tt = np.arange(N) / SR
f = 95 + 30 * np.sin(2 * np.pi * 7 * tt) + 40 * tt
saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
sfx["creak"] = reverb(filt(saw, 200, 1800) * env(N, 0.05, 0.3) * 0.6, 0.8, 6, 0.2, 21)
g = np.zeros(int(1.0 * SR))
for k in range(9):
    b = filt(noise(0.006, 50 + k), 3000, 9000) * np.hanning(int(0.006 * SR))
    i = int((0.05 + k * 0.1) * SR)
    g[i : i + len(b)] += b * (0.6 + 0.05 * k)
sfx["gauge"] = reverb(g, 0.6, 8, 0.2, 22)
dr = np.zeros(int(1.4 * SR))
for k in range(9):
    i = int((0.05 + 0.13 * k + 0.03 * np.sin(k * 3.1)) * SR)
    dd = sweep_tone(900 + 90 * k, 2400 + 60 * k, 0.12, 30)
    dr[i : i + len(dd)] += dd * (0.6 + 0.04 * k)
sfx["drips"] = reverb(dr, 1.4, 4, 0.35, 23)
# finger snap
N = int(0.25 * SR)
tt = np.arange(N) / SR
sn = S(filt(noise(0.25, 60), 1800, 5500) * np.exp(-tt * 75), 0.5 * np.sin(2 * np.pi * 1200 * tt) * np.exp(-tt * 120))
sfx["snap"] = reverb(sn, 0.9, 6, 0.3, 24)
# tape rewind: chirpy reversed noise with falling pitch
N = int(0.45 * SR)
tt = np.arange(N) / SR
rw = S(filt(noise(0.45, 61), 600, 5000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * (14 + 30 * tt) * tt))), 0.3 * sweep_tone(1800, 300, 0.45, 2))
sfx["rewind"] = reverb(rw * env(N, 0.04, 0.12), 0.6, 8, 0.2, 25)
sh = np.zeros(int(2.4 * SR))
for k, m in enumerate((88, 91, 95, 98, 100, 103)):
    b = bell(hz(m), 2.0, 0.8 ** k)
    i = int(k * 0.06 * SR)
    sh[i : i + len(b)] += b[: len(sh) - i]
sfx["shimmer"] = reverb(sh, 2.4, 2.6, 0.45, 26)
bd = np.zeros(int(1.6 * SR))
for k, (at, f0) in enumerate(((0.1, 3800), (0.22, 4200), (0.7, 3600), (0.82, 4400), (0.95, 4000))):
    ch = sweep_tone(f0, f0 * 1.25, 0.07, 18)
    i = int(at * SR)
    bd[i : i + len(ch)] += ch * 0.5
sfx["birds"] = reverb(bd, 1.0, 5, 0.3, 27)
for k, m in enumerate((79, 83, 86)):
    sfx[f"check-{k+1}"] = reverb(S(bell(hz(m), 0.6), 0.4 * sweep_tone(hz(m) * 2, hz(m), 0.05, 40)), 0.8, 6, 0.2, 28 + k)
N = int(0.35 * SR)
tt = np.arange(N) / SR
sfx["bonk"] = reverb(np.sin(2 * np.pi * np.cumsum(260 - 80 * tt) / SR) * np.exp(-tt * 18) * 0.9, 0.5, 9, 0.15, 31)
sfx["door"] = reverb(S(whoosh(0.8, 120, 400, 300, 1200, seed=32) * 0.8, 0.4 * filt(noise(0.8, 33), 60, 300) * env(int(0.8 * SR), 0.02, 0.5)), 1.0, 5, 0.25, 33)
N = int(2.2 * SR)
tt = np.arange(N) / SR
up = sum(np.sin(2 * np.pi * hz(m) * tt) for m in (84, 88, 91, 96)) * env(N, 0.9, 0.9) * 0.25
sfx["uvpad"] = reverb(S(up, 0.08 * filt(noise(2.2, 34), 4000, 11000) * env(N, 0.9, 0.9)), 2.0, 2.5, 0.4, 34)
sfx["tink"] = reverb(bell(hz(98), 0.4, 0.8), 0.8, 7, 0.3, 35)
sfx["wind"] = reverb(filt(noise(1.6, 36), 200, 1400) * env(int(1.6 * SR), 0.6, 0.7) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.8 * np.arange(int(1.6 * SR)) / SR)), 1.0, 4, 0.2, 36)
sfx["cap"] = reverb(S(sweep_tone(900, 300, 0.12, 30), 0.4 * filt(noise(0.12, 37), 800, 4000) * np.exp(-np.arange(int(0.12 * SR)) / SR * 50)), 0.6, 8, 0.2, 37)
sfx["film"] = reverb(S(whoosh(0.7, 500, 1500, 1500, 6000, seed=38), 0.2 * sweep_tone(400, 1400, 0.7, 1.5)), 0.9, 5, 0.3, 38)
sfx["ting"] = reverb(S(bell(hz(103), 0.5, 0.7), bell(hz(98), 0.5, 0.5)), 1.0, 5, 0.35, 39)
N = int(0.35 * SR)
tt = np.arange(N) / SR
sfx["page"] = reverb(S(filt(noise(0.35, 40), 800, 7000) * np.exp(-((tt - 0.08) / 0.05) ** 2) * 0.9, 0.2 * filt(noise(0.35, 41), 200, 900) * np.exp(-tt * 25)), 0.5, 9, 0.15, 40)
N = int(0.6 * SR)
tt = np.arange(N) / SR
grain = filt(noise(0.6, 42), 1500, 9000)
sfx["sandflip"] = reverb(grain * env(N, 0.03, 0.35) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 37 * tt))), 0.6, 8, 0.2, 42)
N = int(3.0 * SR)
sfx["sand"] = reverb(filt(noise(3.0, 43), 2500, 9000) * env(N, 0.4, 0.8) * 0.35, 0.6, 8, 0.15, 43)
for k, m in enumerate((76, 81, 79)):
    sfx[f"plop-{k+1}"] = reverb(sweep_tone(hz(m) * 0.7, hz(m) * 1.4, 0.12, 25), 0.7, 7, 0.25, 44 + k)
sfx["tock"] = reverb(S(filt(noise(0.03, 47), 900, 4000) * np.hanning(int(0.03 * SR)), 0.5 * bell(1400, 0.15)), 0.4, 12, 0.12, 47)
# accelerating hi-hat roll
L = 4.2
roll = np.zeros(int(L * SR))
tpos, step = 0.0, 0.5
while tpos < L - 0.1:
    h = hat(0.5 + 0.4 * tpos / L, 60)
    i = int(tpos * SR)
    roll[i : i + len(h)] += h[: len(roll) - i]
    tpos += step
    step = max(0.06, step * 0.86)
sfx["hats"] = reverb(roll, 0.8, 6, 0.15, 48)
sfx["click"] = reverb(S(filt(noise(0.02, 49), 1000, 6000) * np.hanning(int(0.02 * SR)), 0.5 * sweep_tone(700, 400, 0.08, 40)), 0.5, 10, 0.15, 49)
ch = np.zeros(int(2.2 * SR))
for k, m in enumerate((77, 81, 84, 89)):
    b = bell(hz(m), 2.0, 0.85 ** k)
    i = int(k * 0.05 * SR)
    ch[i : i + len(b)] += b[: len(ch) - i]
sfx["chime"] = reverb(ch, 2.2, 2.8, 0.4, 50)

for name, x in sfx.items():
    write(f"sfx-{name}", tail(np.asarray(x)))
print("ok", len(sfx), "sfx")

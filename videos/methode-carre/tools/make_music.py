"""Corporate electronic bed for the CARRÉ reel — 120 BPM, D minor, one bar = 2 s = one CARRÉ station.

Deterministic (seeded numpy synthesis, royalty-free by construction). Ducks itself under
assets/audio/voiceover.wav. Usage: python3 tools/make_music.py
"""
import wave
import numpy as np

SR = 48000
TOTAL = 30.0
N = int(SR * TOTAL)
BPM = 120
BEAT = 60 / BPM          # 0.5 s
BAR = 4 * BEAT           # 2 s
rng = np.random.default_rng(23)
T = np.arange(N) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(L, a, r, curve=2.0):
    e = np.ones(L)
    na, nr = min(int(a * SR), L), min(int(r * SR), L)
    if na:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def lp(x, fc):
    """One-pole low-pass, fc may be an array (sweeps)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def lp_fast(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))


def hp_fast(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4), len(x))


def add(buf, at, sig, gain=1.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i : i + len(sig)] += sig * gain


def saw(f, L, detune=0.0):
    t = np.arange(L) / SR
    out = np.zeros(L)
    for d in (-detune, 0, detune):
        ph = (t * f * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / 3


# ------------------------------------------------------------------ drums
def kick():
    L = int(0.42 * SR)
    t = np.arange(L) / SR
    f = 46 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = rng.standard_normal(L) * np.exp(-t * 420) * 0.25
    return np.tanh((body + click) * 1.6)


def clap():
    L = int(0.3 * SR)
    t = np.arange(L) / SR
    n = hp_fast(rng.standard_normal(L), 900)
    e = np.zeros(L)
    for d in (0, 0.011, 0.022):
        k = int(d * SR)
        e[k:] += np.exp(-(t[: L - k]) * 60)
    e += np.exp(-t * 14) * 0.35
    return n * e * 0.5


def hat(open_=False):
    L = int((0.22 if open_ else 0.06) * SR)
    t = np.arange(L) / SR
    n = hp_fast(rng.standard_normal(L), 7000)
    return n * np.exp(-t * (18 if open_ else 90)) * 0.35


def pluck(m, L=0.32):
    n = int(L * SR)
    t = np.arange(n) / SR
    x = saw(hz(m), n, 0.004) * 0.6 + np.sin(2 * np.pi * hz(m + 12) * t) * 0.25
    return lp_fast(x, 3800) * np.exp(-t * 9)


# ------------------------------------------------------------------ harmony: Dm9 · Bbmaj7 · Fadd9 · C(add9)/E, one chord per bar
CHORDS = [
    (38, [62, 65, 69, 72, 76]),   # Dm9
    (34, [62, 65, 69, 70, 74]),   # Bbmaj7
    (41, [60, 65, 69, 72, 67]),   # Fadd9
    (40, [60, 64, 67, 71, 74]),   # C/E add9
]
music = {k: np.zeros(N) for k in ("kick", "clap", "hat", "bass", "pad", "arp", "fx")}
nbars = int(np.ceil(TOTAL / BAR))
for b in range(nbars):
    t0 = b * BAR
    root, tones = CHORDS[b % 4]
    # pad: wide detuned saws, slow attack, filtered
    L = int(BAR * SR) + int(0.4 * SR)
    pad = sum(saw(hz(m), L, 0.006) for m in tones[:4]) / 4
    pad = lp_fast(pad, 1600) * env(L, 0.35, 0.5, 1.5)
    add(music["pad"], t0, pad, 0.55)
    # bass: 8th-note pulse on the root, octave pop on the last 8th
    for k in range(8):
        m = root + (12 if k == 7 else 0)
        L = int(0.24 * SR)
        x = saw(hz(m), L, 0.002) + 0.6 * np.sin(2 * np.pi * hz(m) * np.arange(L) / SR)
        x = lp_fast(x, 520) * env(L, 0.004, 0.12, 1.0)
        add(music["bass"], t0 + k * BEAT / 2, x, 0.6)
    # arp: 16ths across the chord tones
    pat = [0, 2, 1, 3, 4, 3, 1, 2]
    for k in range(16):
        m = tones[pat[k % 8]] + 12
        add(music["arp"], t0 + k * BEAT / 4, pluck(m, 0.22), 0.32 if k % 4 else 0.42)
    # drums
    for k in range(4):
        add(music["kick"], t0 + k * BEAT, kick(), 1.0)
        add(music["hat"], t0 + k * BEAT + BEAT / 2, hat(k == 3), 1.0)
        add(music["hat"], t0 + k * BEAT + BEAT / 4, hat(), 0.45)
        add(music["hat"], t0 + k * BEAT + 3 * BEAT / 4, hat(), 0.45)
    for k in (1, 3):
        add(music["clap"], t0 + k * BEAT, clap(), 1.0)


def win(a, b, fade=0.05):
    """1 inside [a, b), soft edges."""
    e = np.clip((T - a) / fade + 1, 0, 1) * np.clip((b - T) / fade + 1, 0, 1)
    return e


# arrangement — 0-4 intro (pad + filtered arp), 4 kick/bass enter, 7-17 full groove (one bar per letter),
# 17-24 groove + open arp while the prompt builds, 23.5 riser, 24 full, 27 stop → final chord + tail
intro = win(0, 4.0)
music["kick"] *= win(4.0, 27.0) * (1 - win(23.0, 24.0) * 0.9)
music["clap"] *= win(7.0, 27.0) * (1 - win(23.0, 24.0))
music["hat"] *= win(1.0, 27.0) * (0.5 + 0.5 * win(4.0, 27.0))
music["bass"] *= win(4.0, 27.0) * (1 - win(23.0, 24.0) * 0.7)
music["arp"] = music["arp"] * win(0, 27.0)
# intro arp opens up from a muffled filter
arp_lp = lp_fast(music["arp"], 900)
music["arp"] = music["arp"] * (1 - intro) + arp_lp * intro * 1.6
music["pad"] *= win(0, 27.4)

# riser into the comparison (23 → 24)
L = int(1.0 * SR)
t = np.arange(L) / SR
r = hp_fast(rng.standard_normal(L), 1200) * (t / t[-1]) ** 2.2 * 0.5
add(music["fx"], 23.0, r)
# final chord on the logo (27.62) with a long tail
L = int(2.4 * SR)
t = np.arange(L) / SR
ch = sum(saw(hz(m), L, 0.005) for m in [50, 57, 62, 65, 69, 74]) / 6
ch = lp_fast(ch, 2400) * np.exp(-t * 1.1) * env(L, 0.01, 0.6, 1.0)
low = np.sin(2 * np.pi * hz(38) * t) * np.exp(-t * 2.0)
add(music["fx"], 27.62, ch * 0.9 + low * 0.6)
add(music["fx"], 27.62, kick(), 0.9)

# sidechain pump on pad / bass / arp from the kick grid
pump = np.ones(N)
for b in range(nbars * 4):
    at = b * BEAT
    if 4.0 <= at < 27.0 and not (23.0 <= at < 24.0):
        i = int(at * SR)
        L = int(0.32 * SR)
        seg = 1 - 0.55 * np.exp(-np.arange(L) / SR * 11)
        pump[i : i + L] = np.minimum(pump[i : i + L], seg[: max(0, min(L, N - i))])
mix = (
    music["kick"] * 0.85 + music["clap"] * 0.5 + music["hat"] * 0.55
    + (music["bass"] * 0.8 + music["pad"] * 0.5 + music["arp"] * 0.45) * pump + music["fx"] * 0.7
)

# duck under the voice: -9 dB while she speaks, 60 ms attack / 250 ms release
raw = open("assets/audio/voiceover.wav", "rb")
with wave.open(raw) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64)[::2] / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
win_n = int(0.02 * SR)
lvl = np.sqrt(np.convolve(v ** 2, np.ones(win_n) / win_n, mode="same"))
speaking = (lvl > 0.01).astype(np.float64)
# smooth: fast attack, slow release
g = np.empty(N)
acc = 0.0
att, rel = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.25 * SR))
for i in range(N):
    c = att if speaking[i] > acc else rel
    acc = c * acc + (1 - c) * speaking[i]
    g[i] = acc
duck = 1 - g * (1 - 10 ** (-9 / 20))
mix *= duck

# master: gentle fades, normalise, true peak under -1 dBFS
mix *= np.clip(T / 0.15, 0, 1) * np.clip((TOTAL - T) / 0.8, 0, 1)
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3)
mix = mix / np.max(np.abs(mix)) * 0.85
st = np.stack([mix, mix], 1)
# a touch of width on pad/arp via a 12 ms delay on the right
d = int(0.012 * SR)
st[d:, 1] = 0.8 * st[d:, 1] + 0.2 * mix[:-d]
with wave.open("assets/audio/music.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("music.wav", TOTAL, "s")

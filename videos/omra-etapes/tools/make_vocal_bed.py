"""Original vocal bed for the Omra video — hummed voices only, no instrument, no lyrics.

This is NOT a recording of an existing nashid or artist: it is an original, procedurally
synthesised piece (formant "humming" voices) written for this project. A held drone (ison)
on D carries a slow hummed melody in maqam Bayati (D, E half-flat, F, G, A, Bb, C), shaped
to the scene timing in tools/timing.json, with a soft fade-in and a long fade-out.

Deterministic (seeded). Usage:
    python3 tools/make_vocal_bed.py tools/timing.json assets/audio/fond-vocal.wav
Then encode:  ffmpeg -y -i assets/audio/fond-vocal.wav -c:a libmp3lame -b:a 192k assets/audio/fond-vocal.mp3
"""
import json
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

SR = 32000
TIMING = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
TOTAL = float(TIMING["total"])
SC = {s["id"]: s["start"] for s in TIMING["scenes"]}
N = int(round(TOTAL * SR))
rng = np.random.default_rng(1447)

D3 = 146.832  # tonic
# Maqam Bayati on D, in cents above the tonic (E is a half-flat: 150 cents)
DEG = {"C": -200, "D": 0, "Eh": 150, "F": 300, "G": 500, "A": 700, "Bb": 800, "c": 1000,
       "d": 1200, "eh": 1350, "f": 1500, "g": 1700, "a": 1900, "A2": -500, "G2": -700}

# Vowel formants (Hz, bandwidth Hz, gain)
VOWELS = {
    "mm": [(260, 70, 1.0), (1000, 160, 0.10), (2300, 220, 0.04)],
    "oo": [(330, 80, 1.0), (760, 110, 0.45), (2400, 200, 0.07)],
    "aa": [(720, 110, 1.0), (1150, 130, 0.65), (2600, 220, 0.12)],
}


def smooth_noise(n, rate_hz, seed):
    """Seeded smooth random curve in [-1, 1] (control-rate noise, cubic-ish interpolated)."""
    r = np.random.default_rng(seed)
    k = max(4, int(n / SR * rate_hz) + 4)
    pts = r.uniform(-1, 1, k)
    x = np.linspace(0, k - 3, n)
    return np.interp(x, np.arange(k), pts)


def formant_gain(freq, vowel_mix):
    """Spectral envelope at `freq` (array) for a blend {vowel: weight}."""
    g = np.zeros_like(freq)
    for v, w in vowel_mix.items():
        for f, bw, a in VOWELS[v]:
            g += w * a / (1 + ((freq - f) / (bw / 2)) ** 2)
    # gentle glottal tilt + floor so upper harmonics stay airy
    return g + 0.012


def voice(f0, amp, vowel_mix, seed, breath=0.04, vib_depth=0.0035, vib_rate=5.1):
    """One hummed voice. f0/amp: per-sample arrays. Returns mono signal."""
    n = len(f0)
    r = np.random.default_rng(seed)
    t = np.arange(n) / SR
    vib_on = np.clip(np.convolve(amp > 1e-3, np.ones(int(0.9 * SR)) / (0.9 * SR), "same"), 0, 1)
    vib = 1 + vib_depth * vib_on * np.sin(2 * np.pi * (vib_rate + 0.25 * smooth_noise(n, 0.3, seed + 1)) * t
                                          + r.uniform(0, 2 * np.pi))
    drift = 2 ** (6 * smooth_noise(n, 0.5, seed + 2) / 1200)  # +-6 cents wander
    f = f0 * vib * drift
    phase = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros(n)
    shimmer = 1 + 0.05 * smooth_noise(n, 3.0, seed + 3)
    fmax = 4800
    kmax = int(fmax / np.min(f0[f0 > 0])) if np.any(f0 > 0) else 1
    for k in range(1, kmax + 1):
        fk = k * f0[::64]
        g = formant_gain(fk, vowel_mix) / k ** 0.6
        g = np.where(fk < fmax, g, 0.0)
        g = np.repeat(g, 64)[:n]
        out += g * np.sin(k * phase)
    # breath: noise shaped by the first formant region
    b = r.standard_normal(n)
    sos = signal.butter(2, [250, 2800], btype="band", fs=SR, output="sos")
    b = signal.sosfilt(sos, b) * breath
    return (out * shimmer + b) * amp


def pitch_track(notes, glide=0.18):
    """notes: list of (t0, t1, degree). Returns per-sample f0 (0 where silent) with glides."""
    cents = np.full(N, np.nan)
    for t0, t1, d in notes:
        cents[int(t0 * SR):int(t1 * SR)] = DEG[d]
    # hold the last value through gaps so glides start from the previous note
    idx = np.where(~np.isnan(cents), np.arange(N), 0)
    np.maximum.accumulate(idx, out=idx)
    held = cents[idx]
    held = np.where(np.isnan(held), 0, held)
    k = int(glide * SR)
    held = np.convolve(np.pad(held, (k, k), mode="edge"), np.ones(k) / k, "same")[k:-k]
    return D3 * 2 ** (held / 1200)


def envelope(segments, attack=0.6, release=0.9):
    """segments: list of (t0, t1, level). Attack/release follower at 1 kHz control rate."""
    cr = 1000
    n = int(TOTAL * cr) + 1
    tgt = np.zeros(n)
    for t0, t1, lv in segments:
        a, b = int(t0 * cr), int(t1 * cr)
        tgt[a:b] = np.maximum(tgt[a:b], lv)
    e = np.zeros(n)
    ca, crl = 1 / (attack * cr / 3), 1 / (release * cr / 3)
    v = 0.0
    for i in range(n):
        v += (tgt[i] - v) * (ca if tgt[i] > v else crl)
        e[i] = v
    return np.interp(np.arange(N) / SR, np.arange(n) / cr, e)


def phrase(start, seq, level=1.0):
    """seq: list of (degree, seconds). Legato phrase: notes back to back, per-note swell."""
    notes, segs = [], []
    t = start
    for d, dur in seq:
        notes.append((t, t + dur, d))
        segs.append((t, t + dur, level))
        t += dur
    return notes, segs, t


def pan(x, p):
    """p in [-1, 1]; equal-power."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


# ---------------------------------------------------------------- composition
S = SC
mel = [
    # Intro: entering, around the tonic
    (S["s1-intro"] + 4.5, [("D", 1.6), ("Eh", 0.8), ("F", 2.2), ("Eh", 0.9), ("D", 2.6)]),
    # Ihram / Miqat
    (S["s2-ihram"] + 1.5, [("F", 1.4), ("G", 1.6), ("A", 2.4), ("G", 0.9), ("F", 1.0), ("Eh", 1.2), ("D", 2.6)]),
    (S["s2-ihram"] + 14.0, [("A2", 1.2), ("C", 1.0), ("D", 2.2), ("Eh", 0.8), ("F", 1.8), ("Eh", 0.9), ("D", 3.0)]),
    (S["s2-ihram"] + 24.0, [("D", 1.0), ("F", 1.2), ("G", 2.6), ("F", 1.0), ("Eh", 2.6)]),
    # Arrival: rising towards the fifth
    (S["s3-arrivee"] + 1.0, [("F", 1.2), ("G", 1.2), ("A", 1.4), ("Bb", 1.0), ("A", 2.6), ("G", 1.0), ("A", 3.0)]),
    # Tawaf: circling motif
    (S["s4-tawaf"] + 2.0, [("A", 1.6), ("G", 0.8), ("F", 0.8), ("G", 1.6), ("A", 2.0), ("G", 1.0), ("F", 1.2), ("Eh", 1.0), ("D", 2.6)]),
    (S["s4-tawaf"] + 16.5, [("D", 1.0), ("Eh", 0.8), ("F", 1.4), ("G", 1.2), ("F", 0.9), ("Eh", 0.9), ("F", 1.6), ("Eh", 1.0), ("D", 3.4)]),
    # Prayer: one long, quiet line
    (S["s5-priere"] + 3.0, [("F", 2.8), ("Eh", 1.6), ("D", 4.6)]),
    # Sa'i: going and returning between two poles
    (S["s6-sai"] + 2.0, [("D", 1.2), ("F", 1.0), ("A", 2.2), ("G", 0.8), ("F", 0.8), ("D", 2.2)]),
    (S["s6-sai"] + 11.5, [("D", 1.0), ("F", 1.0), ("A", 1.6), ("Bb", 0.8), ("A", 1.4), ("G", 0.9), ("F", 0.9), ("Eh", 0.9), ("D", 2.6)]),
    # Hair: release, descending
    (S["s7-cheveux"] + 1.5, [("G", 1.6), ("F", 1.0), ("Eh", 1.0), ("D", 2.0), ("C", 1.0), ("D", 3.4)]),
    # Conclusion: final ascent and cadence
    (S["s8-conclusion"] + 1.0, [("D", 1.2), ("F", 1.2), ("G", 1.4), ("A", 2.8), ("G", 1.0), ("F", 1.2), ("Eh", 1.4), ("D", 5.0)]),
]

mix = np.zeros((N, 2))

# Melody: three hummed voices in unison ("oo" opening to "aa" at phrase peaks)
mel_notes, mel_segs = [], []
for st, seq in mel:
    n_, s_, _ = phrase(st, seq)
    mel_notes += n_
    mel_segs += s_
f_mel = pitch_track(mel_notes) * 2  # melody one octave above the drone (D4 register)
a_mel = envelope(mel_segs, 0.45, 0.8)
for i, (det, p) in enumerate([(0, 0.0), (6, -0.35), (-7, 0.35)]):
    f = f_mel * 2 ** (det / 1200)
    vx = voice(f, a_mel * (1.0 if i == 0 else 0.7), {"oo": 0.75, "aa": 0.25}, seed=100 + i,
               vib_rate=5.0 + 0.3 * i)
    mix += pan(vx, p) * 0.55

# Drone (ison): D + A, "mm"/"oo", several voices each; shifts to G + D for the hair scene
drone_parts = [
    ("D", [(0, S["s7-cheveux"] + 0.5, 1.0), (S["s8-conclusion"] - 0.5, TOTAL, 1.0)]),
    ("A2", [(0, S["s7-cheveux"] + 0.5, 0.55), (S["s8-conclusion"] - 0.5, TOTAL, 0.55)]),
    ("G2", [(S["s7-cheveux"], S["s8-conclusion"], 0.9)]),
]
for j, (deg, segs) in enumerate(drone_parts):
    f0 = np.full(N, D3 * 2 ** (DEG[deg] / 1200))
    env = envelope(segs, 2.5, 2.5)
    # breathing swell, like a choir taking turns to breathe
    env *= 0.82 + 0.18 * (0.5 + 0.5 * smooth_noise(N, 0.12, 300 + j))
    for i, (det, p) in enumerate([(-5, -0.6), (4, 0.6), (0, 0.0)]):
        vx = voice(f0 * 2 ** (det / 1200), env, {"mm": 0.6, "oo": 0.4}, seed=200 + 10 * j + i,
                   breath=0.02, vib_depth=0.0015, vib_rate=4.6 + 0.2 * i)
        mix += pan(vx, p) * 0.32

# Low octave (D2) under everything, very soft
f0 = np.full(N, D3 / 2)
env = envelope([(0, TOTAL, 1.0)], 3.0, 3.0)
mix += pan(voice(f0, env, {"mm": 1.0}, seed=400, breath=0.0, vib_depth=0.001), 0) * 0.22

# ---------------------------------------------------------------- hall reverb
def hall_ir(seconds=3.6, seed=7):
    r = np.random.default_rng(seed)
    n = int(SR * seconds)
    t = np.arange(n) / SR
    chans = []
    for c in range(2):
        noise = r.standard_normal(n)
        noise = signal.sosfilt(signal.butter(2, 5200, fs=SR, output="sos"), noise)
        ir = noise * np.exp(-t * 6.9 / seconds)
        ir[: int(0.012 * SR)] = 0
        for d, g in [(0.017, 0.5), (0.029, 0.35), (0.041, 0.28), (0.058, 0.2)]:
            ir[int((d + 0.003 * c) * SR)] += g
        chans.append(ir / np.sqrt(np.sum(ir ** 2)))
    return chans


irs = hall_ir()
wet = np.stack([signal.fftconvolve(mix[:, c], irs[c])[:N] for c in range(2)], 1)
out = mix * 0.72 + wet * 0.55

# Tone: remove rumble and fizz
sos_hp = signal.butter(2, 70, btype="high", fs=SR, output="sos")
sos_lp = signal.butter(2, 8500, btype="low", fs=SR, output="sos")
out = signal.sosfiltfilt(sos_lp, signal.sosfiltfilt(sos_hp, out, axis=0), axis=0)

# Fades: progressive start, long elegant end
t = np.arange(N) / SR
fade_in = np.clip(t / 5.0, 0, 1) ** 1.6
fade_out = np.clip((TOTAL - t) / 7.0, 0, 1) ** 1.4
out *= (fade_in * fade_out)[:, None]

# Loudness: discreet bed (-21 LUFS), peaks under -3 dBFS
meter = pyln.Meter(SR)
out = pyln.normalize.loudness(out, meter.integrated_loudness(out), -21.0)
pk = np.max(np.abs(out))
if pk > 0.7:
    out *= 0.7 / pk

out48 = signal.resample_poly(out, 3, 2, axis=0)  # 32 kHz -> 48 kHz
out48 = out48[: int(round(TOTAL * 48000))]
sf.write(OUT, out48, 48000, subtype="PCM_16")
print(f"wrote {OUT}: {len(out48) / 48000:.3f}s, LUFS={meter.integrated_loudness(out):.1f}, peak={np.max(np.abs(out48)):.2f}")

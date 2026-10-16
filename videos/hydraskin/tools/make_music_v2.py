"""HydraSkin music v2 — « luxury skincare commercial music, elegant spa ambient, soft piano,
delicate glass-like textures, warm atmospheric pads, subtle cinematic progression, premium beauty
brand, serene and modern, no vocals, no strong beat; designed to sit under a French female
voice-over; smooth fade-in and elegant fade-out » (client brief).

Synthesised locally (no music-generation service is reachable from this session). Deterministic.
D-flat major, ~58 BPM feel, no drums. Sections follow the narrated cut (88 s).
Usage: python3 tools/make_music_v2.py assets/audio/music.wav
"""
import sys
import wave

import numpy as np

SR = 48000
TOTAL = 88.0
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(23)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def fft_conv(x, ir):
    n = len(x) + len(ir) - 1
    n2 = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, n2) * np.fft.rfft(ir, n2), n2)[:n]


def hall(x, seconds=4.5, decay=1.5, seed=3):
    r = np.random.default_rng(seed)
    n = int(SR * seconds)
    tt = np.arange(n) / SR
    out = []
    for _ in range(2):
        ir = np.convolve(r.standard_normal(n), np.ones(10) / 10, mode="same") * np.exp(-decay * tt)
        ir[: int(0.02 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        out.append(fft_conv(x, ir)[: len(x)])
    return np.stack(out, 1)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def env(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


# harmony: (start s, chord tones midi) — Dbmaj9, Bbm9, Gbmaj7#11, Absus → lift to Ebm11, Gbmaj9, Absus, Dbmaj9
CH = [
    (0.0, [49, 56, 60, 63, 65]), (11.9, [46, 53, 56, 60, 61]), (19.0, [42, 49, 53, 58, 60]),
    (26.3, [44, 51, 54, 56, 63]), (36.6, [49, 56, 60, 63, 65]), (42.3, [39, 46, 49, 54, 58]),
    (52.0, [42, 49, 53, 56, 61]), (59.0, [46, 53, 56, 60, 65]), (66.0, [44, 51, 56, 58, 63]),
    (74.5, [49, 56, 60, 63, 68]), (88.0, None),
]

# ---- warm pads: soft saw-like additive voices, slow swells, brightness rises with the film
pad = np.zeros(N)
for (s0, tones), (s1, _) in zip(CH, CH[1:]):
    a, b = int(s0 * SR), min(N, int((s1 + 2.5) * SR))
    tt = np.arange(b - a) / SR
    L = s1 - s0
    e = np.minimum(1, tt / 2.2) * np.clip((L + 2.5 - tt) / 2.5, 0, 1)
    for m in tones:
        for det in (-0.09, 0.0, 0.08):
            f = hz(m) * (1 + det / 100)
            ph = rng.uniform(0, 6.28)
            for k in range(1, 6):
                pad[a:b] += np.sin(2 * np.pi * f * k * tt + ph * k) * e * (0.05 / k ** 1.6)
    pad[a:b] += np.sin(2 * np.pi * hz(tones[0] - 12) * tt) * e * 0.10  # soft sub
pad = lowpass(pad, 1100) * 0.65 + lowpass(pad, 2600) * env([(0, 0.0), (26, 0.15), (52, 0.35), (70, 0.4), (88, 0.2)])

# ---- soft felt piano: a sparse motif, call and answer, never a pattern grid
pno = np.zeros(N)


def piano(start, midi, vel, length=4.0):
    a = int(start * SR)
    if a >= N:
        return
    b = min(N, a + int(length * SR))
    tt = np.arange(b - a) / SR
    f = hz(midi)
    body = (np.sin(2 * np.pi * f * tt) + 0.28 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / 0.6)
            + 0.08 * np.sin(6 * np.pi * f * tt) * np.exp(-tt / 0.3))
    pno[a:b] += body * (1 - np.exp(-tt / 0.008)) * np.exp(-tt / 1.4) * vel


MOTIF = [(0.0, 2), (0.9, 4), (1.6, 3), (3.0, 1)]  # beats in seconds, index into chord tones (+1 oct)
phrase_starts = [1.2, 6.0, 13.0, 20.5, 28.0, 33.0, 43.5, 53.0, 57.5, 61.0, 67.0, 76.0, 81.0]
for i, ps in enumerate(phrase_starts):
    tones = [c for s, c in CH if c is not None and s <= ps][-1]
    for j, (dt, idx) in enumerate(MOTIF):
        if i % 2 and j == 3:  # answer phrases resolve upward
            idx = 4
        piano(ps + dt, tones[idx] + 12, 0.16 + 0.03 * ((i * 7 + j) % 3) / 2)
# held line (36.6–42.3): a single low note, then silence for the voice
piano(36.8, 49 + 12, 0.12, 5.0)
# final resolution under the end card
for k, m in enumerate([61, 68, 72, 75, 80]):
    piano(75.6 + 0.14 * k, m, 0.12, 7.0)

# ---- glass textures: soft FM bells high up, sparse, with a shimmering octave echo
glass = np.zeros(N)


def bell(start, midi, vel):
    a = int(start * SR)
    if a >= N:
        return
    b = min(N, a + int(5.0 * SR))
    tt = np.arange(b - a) / SR
    f = hz(midi)
    mod = np.sin(2 * np.pi * f * 3.5 * tt) * 1.4 * np.exp(-tt / 0.5)
    tone = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt / 1.6) * (1 - np.exp(-tt / 0.004))
    glass[a:b] += tone * vel
    c = min(N, a + int(0.38 * SR))
    d = min(N, c + (b - a))
    glass[c:d] += tone[: d - c] * vel * 0.35  # echo


bell_times = [3.4, 9.2, 15.5, 18.8, 22.4, 24.5, 30.0, 39.0, 45.5, 50.8, 55.0, 59.2, 63.6, 68.6, 71.0, 75.5, 84.0]
for i, bt in enumerate(bell_times):
    tones = [c for s, c in CH if c is not None and s <= bt][-1]
    bell(bt, tones[(i * 2) % 5] + 36, 0.05)

mix = pad + pno * 0.9 + glass
# subtle cinematic progression: overall level per section; space left for the voice
mix *= env([(0, 0.0), (3.0, 0.55), (12, 0.7), (26.3, 0.78), (36.6, 0.55), (42.3, 0.75),
            (52, 0.85), (66, 0.95), (74.5, 0.8), (84, 0.6), (88, 0.0)])
st = hall(mix) * 0.42 + np.stack([mix, mix], 1) * 0.68
st[:, 1] = np.roll(st[:, 1], int(0.0009 * SR))
# smooth fade-in (3 s) and elegant fade-out (last 4 s, equal-power)
fi = int(3.0 * SR)
st[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi))[:, None] ** 2
fo = int(4.0 * SR)
st[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo))[:, None]
st = st / (np.max(np.abs(st)) + 1e-9) * 0.6
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok")

"""HydraSkin sound: a discreet, warm instrumental bed (70 BPM, D major) that follows the
storyboard's sections, plus two marks only — a soft glass "tink" (title reveals) and an
almost inaudible air swell (glass-blade transitions).

Deterministic (seeded). Usage: python3 tools/make_audio.py assets/audio
"""
import sys
import wave

import numpy as np

SR = 48000
OUT = sys.argv[1]
TOTAL = 78.0
BEAT = 60 / 70
rng = np.random.default_rng(7)


def write(name, x, peak):
    x = np.asarray(x, float)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
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


def reverb(x, seconds=3.2, decay=2.2, mix=0.38, seed=1):
    r = np.random.default_rng(seed)
    n = int(SR * seconds)
    t = np.arange(n) / SR
    outs = []
    for _ in range(2):
        ir = np.convolve(r.standard_normal(n), np.ones(8) / 8, mode="same") * np.exp(-decay * t)
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        outs.append(fft_conv(x, ir)[: len(x)])
    return np.stack([x, x], 1) * (1 - mix) + np.stack(outs, 1) * mix * 1.5


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


N = int(TOTAL * SR)
t = np.arange(N) / SR

# chord plan: (start beat, root midi, chord tones) — Dmaj9, Bm9, Gmaj7(#11), Asus4 → A
CHORDS = [
    (62, [62, 66, 69, 73, 76]),   # Dmaj9
    (59, [59, 62, 66, 69, 73]),   # Bm9
    (55, [55, 59, 62, 66, 73]),   # Gmaj7#11
    (57, [57, 62, 64, 69, 71]),   # Asus4(9)
]
BAR = 4 * BEAT
CH_LEN = 2 * BAR  # 6.86 s per chord


def chord_at(time):
    return CHORDS[int(time // CH_LEN) % 4]


def env_section(time):
    """Overall arrangement level per section of the film (0..1)."""
    pts = [(0, .55), (3.2, .7), (8, .85), (20, .9), (31.4, .6), (34, .45), (37, .8),
           (46, .95), (60, 1.0), (65, .8), (74, .6), (78, 0)]
    xs, ys = zip(*pts)
    return np.interp(time, xs, ys)


# pad: slow-attack chord tones, three detuned sines each, low-passed
pad = np.zeros(N)
for k in range(int(TOTAL // CH_LEN) + 1):
    root, tones = CHORDS[k % 4]
    s0 = k * CH_LEN
    a, b = int(s0 * SR), min(N, int((s0 + CH_LEN + 1.6) * SR))
    if a >= N:
        break
    tt = np.arange(b - a) / SR
    e = np.minimum(1, tt / 1.8) * np.clip((CH_LEN + 1.6 - tt) / 1.6, 0, 1)
    for m in tones[:4]:
        for det in (-0.07, 0, 0.06):
            pad[a:b] += np.sin(2 * np.pi * hz(m - 12) * (1 + det / 100) * tt + rng.uniform(0, 6.28)) * e * 0.12
    pad[a:b] += np.sin(2 * np.pi * hz(root - 24) * tt) * e * 0.22  # soft sub
pad = lowpass(pad, 1400)

# felt-piano arpeggio: soft notes with fast attack, long decay, gentle hammer
pno = np.zeros(N)


def note(start, midi, vel, length=3.2):
    a = int(start * SR)
    if a >= N:
        return
    b = min(N, a + int(length * SR))
    tt = np.arange(b - a) / SR
    f = hz(midi)
    e = (1 - np.exp(-tt / 0.006)) * np.exp(-tt / 1.1)
    tone = np.sin(2 * np.pi * f * tt) + .32 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / .5) + .1 * np.sin(6 * np.pi * f * tt) * np.exp(-tt / .25)
    pno[a:b] += tone * e * vel


PATTERN = [0, 2, 1, 3, 2, 4, 1, 3]  # indexes into chord tones, eighth notes
step = BEAT / 2
s = 0.0
i = 0
while s < TOTAL - 3:
    root, tones = chord_at(s)
    sec = s
    dense = 8 <= sec < 31.4 or 37 <= sec < 65
    sparse = sec < 8 or 65 <= sec
    held = 31.4 <= sec < 37
    play = (dense and i % 2 == 0) or (dense and i % 8 in (3, 7)) or (sparse and i % 4 == 0)
    if held:
        play = False
    if play:
        vel = 0.18 + 0.05 * ((i * 37) % 7) / 7
        note(s + 0.004 * ((i * 13) % 5), tones[PATTERN[i % 8]] + 12, vel)
    s += step
    i += 1

# resolution: a held D major chord under the end card
for m, d in ((62, 0), (66, .12), (69, .24), (74, .36), (78, .5)):
    note(65.8 + d, m + 12, .16, 6.0)

mix = pad * 0.9 + pno
mix *= env_section(t)
mix[: int(1.5 * SR)] *= np.linspace(0, 1, int(1.5 * SR))
st = reverb(mix)
# tiny stereo width on the piano
st[:, 0] = st[:, 0] * 1.0
st[:, 1] = np.roll(st[:, 1], int(0.0007 * SR))
write("music", st, 0.6)

# glass tink: inharmonic partials, quick decay, long airy tail
n = int(2.8 * SR)
tt = np.arange(n) / SR
tink = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in
           ((2637, 1, .55), (3951, .55, .38), (5274, .3, .26), (6890, .18, .16)))
tink *= 1 - np.exp(-tt / .002)
write("sfx-tink", reverb(tink, 2.4, 2.8, .45, 3), 0.5)

# air swell: band-limited noise, slow rise and fall (~1.4 s)
n = int(1.8 * SR)
tt = np.arange(n) / SR
noise = rng.standard_normal(n)
air = lowpass(noise, 2200) - lowpass(noise, 300)
air *= np.sin(np.pi * np.clip(tt / 1.5, 0, 1)) ** 2
write("sfx-air", reverb(air, 1.6, 3.0, .35, 5), 0.35)
print("ok")

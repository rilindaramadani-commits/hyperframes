"""Music bed carved under the voice: sidechain-style ducking from the voice-over envelope.

music.wav + voiceover.wav -> music-bed.wav (music ~18 dB under the voice while it speaks,
back up in the gaps and +4 dB on the call to action, which is baked into music.wav).
Run from the project root: python3 tools/duck_music.py
"""
import wave

import numpy as np


def read(path):
    with wave.open(path) as f:
        sr = f.getframerate()
        ch = f.getnchannels()
        x = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    return x.reshape(-1, ch), sr


music, sr = read("assets/audio/music.wav")
vo, sr2 = read("assets/audio/voiceover.wav")
assert sr == sr2
n = min(len(music), len(vo))
music, vo = music[:n], vo[:n]
# voice activity envelope: RMS over 20 ms, fast attack / slow release
hop = int(sr * 0.01)
frames = n // hop
v = vo.mean(axis=1)[: frames * hop].reshape(frames, hop)
rms = np.sqrt((v**2).mean(axis=1) + 1e-12)
act = np.clip((20 * np.log10(rms + 1e-9) + 42) / 14, 0, 1)
env = np.zeros(frames)
a_up, a_dn = np.exp(-1 / 3), np.exp(-1 / 28)  # 30 ms attack, 280 ms release
for i in range(frames):
    prev = env[i - 1] if i else 0
    env[i] = act[i] + (prev - act[i]) * (a_up if act[i] > prev else a_dn)
gain_db = -11.0 * env  # duck depth while speaking
gain = 10 ** (gain_db / 20)
g = np.repeat(gain, hop)
g = np.concatenate([g, np.full(n - len(g), g[-1])])
bed = music * g[:, None] * 0.42  # base level of the bed under the narration
peak = np.max(np.abs(bed))
print("bed peak", round(float(peak), 3))
out = (np.clip(bed, -1, 1) * 32767).astype(np.int16)
with wave.open("assets/audio/music-bed.wav", "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(sr)
    f.writeframes(out.tobytes())

"""New soundtrack on the finished film, without re-rendering its frames.

The 3D film takes ~2 h to render; a change that only touches the sound (voice effect, volumes, SFX)
does not need new frames. This copies every <audio> element of index.html verbatim (with its
data-fx-chain) into a temporary blank composition, renders that with HyperFrames — the identical
mix in about a minute — and muxes its soundtrack onto the film (video stream copied untouched).
The temporary composition is deleted afterwards so the project keeps a single root.
Run from the project root:
    python3 tools/remix_audio.py renders/skincare-3-erreurs.mp4 renders/out.mp4
"""
import os
import re
import subprocess
import sys

film, out = sys.argv[1], sys.argv[2]
TMP_HTML = "audio-mix.html"
TMP_MP4 = "renders/.audio-mix.mp4"

s = open("index.html").read()
total = re.search(r'data-composition-id="main"[^>]*?data-duration="([^"]+)"', s, re.S).group(1)
audio = re.findall(r"^\s*<audio [^\n]*</audio>$", s, re.M)
html = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=360, height=640" />
    <title>Audio mix (temporary, tools/remix_audio.py)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      html, body {{ margin: 0; width: 360px; height: 640px; background: #000; overflow: hidden; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="360" data-height="640">
{chr(10).join(a.rstrip() for a in audio)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""
open(TMP_HTML, "w").write(html)
print(len(audio), "audio elements, duration", total)
try:
    subprocess.run(["npx", "--yes", "hyperframes@0.8.149", "render", "-c", TMP_HTML, "-o", TMP_MP4], check=True, stdout=subprocess.DEVNULL)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", film, "-i", TMP_MP4, "-map", "0:v", "-map", "1:a", "-c", "copy", "-movflags", "+faststart", out], check=True)
finally:
    os.remove(TMP_HTML)
    if os.path.exists(TMP_MP4):
        os.remove(TMP_MP4)
print("→", out)

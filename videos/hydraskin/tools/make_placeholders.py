"""Provisional shots: palette-true tone studies of each planned shot, encoded as
15 s H.264 clips so the real AI clips (or institute footage) can replace them file
for file (same name, same folder) without touching the compositions.

Deterministic (seeded). Usage: python3 tools/make_placeholders.py assets/media
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = sys.argv[1]
W, H = 1080, 1920
FONT = os.path.join(os.path.dirname(__file__), "..", "assets", "fonts", "jost-latin-400-normal.woff2")


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def vgrad(top, bottom):
    t = np.linspace(0, 1, H)[:, None, None]
    a, b = np.array(hexrgb(top), float), np.array(hexrgb(bottom), float)
    return np.broadcast_to(a * (1 - t) + b * t, (H, W, 3)).copy()


def _paint(img, draw_mask, color, alpha, blur):
    # blur the coverage mask only, so soft edges never pick up dark halos
    mask = Image.new("L", (W, H), 0)
    draw_mask(ImageDraw.Draw(mask), int(255 * alpha))
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    layer = Image.new("RGBA", (W, H), hexrgb(color) + (255,))
    layer.putalpha(mask)
    img.alpha_composite(layer)


def blob(img, cx, cy, rx, ry, color, alpha, blur):
    _paint(img, lambda d, a: d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=a), color, alpha, blur)


def band(img, x0, y0, x1, y1, color, alpha, blur, radius=40):
    _paint(img, lambda d, a: d.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=a), color, alpha, blur)


def finish(img, name, label, seed):
    rng = np.random.default_rng(seed)
    a = np.asarray(img.convert("RGB"), float)
    a += rng.normal(0, 4.2, (H, W, 1))  # soft grain
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    try:
        f = ImageFont.truetype("DejaVuSans.ttf", 26)
    except OSError:
        f = ImageFont.load_default()
    txt = f"{name} · {label} · plan provisoire"
    tw = d.textlength(txt, font=f)
    d.rounded_rectangle([W - tw - 96, 120, W - 60, 172], radius=12, outline=(100, 45, 61), width=2)
    d.text((W - tw - 78, 132), txt, fill=(100, 45, 61), font=f)
    png = os.path.join(OUT, f"{name}.png")
    img.save(png)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", png, "-t", "15", "-r", "30",
                    "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-pix_fmt", "yuv420p",
                    "-g", "450", "-crf", "26", "-movflags", "+faststart", os.path.join(OUT, f"{name}.mp4")], check=True)
    os.remove(png)


def base(top, bottom):
    return Image.fromarray(vgrad(top, bottom).astype(np.uint8)).convert("RGBA")


SHOTS = {}


def shot(fn):
    SHOTS[fn.__name__.replace("_", "-").upper()] = fn
    return fn


@shot
def img_01():  # macro peau
    im = base("#D9AE95", "#C3937A")
    blob(im, 620, 820, 620, 760, "#E8C6AF", .9, 160)
    blob(im, 300, 1300, 380, 420, "#B98A72", .35, 140)
    return im, "macro de peau"


@shot
def img_02():  # goutte de sérum sur verre
    im = base("#EFE6DA", "#D8C5B2")
    blob(im, 860, 1620, 260, 200, "#642D3D", .35, 120)
    blob(im, 560, 1180, 70, 90, "#F7F2EB", .95, 6)
    blob(im, 548, 1162, 22, 26, "#FFFFFF", .8, 4)
    blob(im, 560, 1300, 30, 120, "#F7F2EB", .45, 18)
    return im, "goutte de sérum"


@shot
def img_08():  # cabine + machine
    im = base("#EADFD2", "#D6C2AE")
    band(im, 0, 0, 1080, 1920, "#F7F2EB", .35, 0, 0)
    band(im, 620, 880, 980, 1500, "#F2ECE4", .95, 6, 30)   # machine
    band(im, 700, 960, 900, 1120, "#D8C5B2", .9, 4, 16)
    band(im, 40, 1260, 600, 1420, "#F4EEE6", .95, 6, 24)   # table
    band(im, 120, 1240, 360, 1290, "#642D3D", .8, 4, 10)   # serviette bordeaux
    blob(im, 300, 380, 360, 300, "#FBF7F1", .8, 120)       # fenêtre
    return im, "machine en cabine"


def face(im, cx, cy, s=1.0, tone="#DDB096"):
    blob(im, cx, cy, int(230 * s), int(300 * s), tone, .95, 30)
    blob(im, cx - int(60 * s), cy - int(40 * s), int(120 * s), int(140 * s), "#E9C6AF", .7, 60)
    band(im, cx - int(240 * s), cy - int(380 * s), cx + int(240 * s), cy - int(250 * s), "#F2EBE2", .9, 20, 60)  # bandeau


def hand(im, x, y, ang=0):
    blob(im, x, y, 120, 70, "#D7A98E", .95, 18)
    band(im, x + 60, y + 40, x + 260, y + 120, "#642D3D", .9, 8, 30)  # manche bordeaux


def tip(im, x, y):
    band(im, x - 22, y - 160, x + 22, y + 10, "#F4EEE6", .98, 3, 22)
    blob(im, x, y + 10, 26, 26, "#FFFFFF", .7, 4)


@shot
def img_04():  # nettoyage
    im = base("#E9DCCD", "#D3BCA6")
    face(im, 540, 900)
    hand(im, 360, 980)
    hand(im, 720, 1000)
    return im, "nettoyage"


@shot
def img_05():  # exfoliation
    im = base("#EADDCF", "#D5BFA9")
    face(im, 520, 1000, 1.25)
    tip(im, 560, 700)
    return im, "exfoliation"


@shot
def img_06():  # extraction
    im = base("#E8DACB", "#D2BBA4")
    face(im, 500, 980, 1.35)
    tip(im, 540, 880)
    return im, "extraction"


@shot
def img_07():  # hydratation
    im = base("#EBDFD2", "#D6C1AB")
    face(im, 470, 960, 1.3, "#E0B59B")
    tip(im, 640, 900)
    return im, "hydratation"


@shot
def img_09():  # écoute
    im = base("#EDE2D5", "#D8C5B2")
    face(im, 360, 640, .8)
    blob(im, 720, 560, 170, 220, "#C99E86", .9, 30)
    band(im, 560, 820, 960, 1500, "#642D3D", .75, 30, 120)   # tunique bordeaux
    blob(im, 470, 700, 70, 40, "#D7A98E", .95, 10)            # main sur la joue
    return im, "écoute et observation"


@shot
def img_10():  # textures produits
    im = base("#EFE5D9", "#D8C5B2")
    band(im, 120, 260, 300, 820, "#F4EEE6", .7, 30, 40)
    band(im, 780, 300, 960, 760, "#F4EEE6", .6, 30, 40)
    band(im, 520, 1380, 1000, 1520, "#642D3D", .55, 40, 40)
    blob(im, 520, 1060, 300, 140, "#D7A98E", .95, 16)            # dos de la main
    blob(im, 560, 1030, 150, 60, "#FAF6F0", .95, 10)             # crème
    return im, "textures produits"


@shot
def img_11():  # masque modelant
    im = base("#EAE0D3", "#D6C3AF")
    face(im, 500, 980, 1.3)
    blob(im, 560, 1040, 200, 150, "#CDBBA6", .9, 20)
    band(im, 700, 1080, 900, 1130, "#9C8B7D", .9, 4, 20)  # spatule
    hand(im, 860, 1150)
    return im, "masque modelant"


@shot
def img_13():  # massage
    im = base("#EDE3D7", "#D8C5B2")
    face(im, 540, 940, 1.3)
    hand(im, 330, 1020)
    hand(im, 760, 1020)
    return im, "massage du visage"


@shot
def img_14():  # visage détendu
    im = base("#F1E8DD", "#DCC9B5")
    face(im, 540, 860, 1.4, "#E3BAA0")
    blob(im, 300, 300, 400, 300, "#FBF7F1", .6, 120)
    return im, "visage détendu"


@shot
def img_15():  # cabine lumineuse
    im = base("#F5EEE5", "#E1D2C1")
    blob(im, 760, 380, 520, 420, "#FDFAF5", .9, 140)
    band(im, 80, 1560, 640, 1680, "#E9DFD2", .95, 6, 18)
    band(im, 120, 1500, 520, 1570, "#642D3D", .7, 10, 16)
    band(im, 760, 1300, 860, 1640, "#F4EEE6", .8, 20, 30)
    return im, "cabine lumineuse"


os.makedirs(OUT, exist_ok=True)
for i, (name, fn) in enumerate(SHOTS.items()):
    im, label = fn()
    finish(im, name, label, i + 1)
    print(name)

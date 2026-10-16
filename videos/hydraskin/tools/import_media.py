"""Place the shot media into the slots (assets/media/IMG-xx.mp4).

Photos are cropped to 9:16 around a focus point and encoded as 15 s stills (the scenes add the
camera move). Clips from the institute footage are cut on its own edit points, slowed down
(motion-interpolated) and held on their last frame to 15 s. Source files live in assets/source/.

Usage: python3 tools/import_media.py            (all slots)
       python3 tools/import_media.py IMG-04 ...  (some slots)
"""
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "assets", "source")
GEN = os.path.join(ROOT, "assets", "generated", "lovable")
OUT = os.path.join(ROOT, "assets", "media")
W, H = 1080, 1920

# Current set: AI-generated images (Lovable, 1088x1920, same virtual client in every shot), at the
# client's request not to use her own photos. slot -> ("photo", file in assets/generated/lovable, fx, fy)
SLOTS = {
    "IMG-01": ("photo", "img-01-peau-macro.jpg", None, None),    # macro peau, yeux clos
    "IMG-02": ("photo", "img-02-serum.jpg", None, None),         # pipette et goutte de sérum
    "IMG-04": ("photo", "img-04-nettoyage.jpg", None, None),     # nettoyage aux mains
    "IMG-05": ("photo", "img-05-exfoliation.jpg", None, None),   # embout sur le front
    "IMG-06": ("photo", "img-06-extraction.jpg", None, None),    # embout sur l'aile du nez
    "IMG-07": ("photo", "img-07-hydratation.jpg", None, None),   # embout sur la joue
    "IMG-09": ("photo", "img-09-observation.jpg", None, None),   # toucher, observation de la peau
    "IMG-10": ("photo", "img-10-produits.jpg", None, None),      # texture crème, flacons sans étiquette
    "IMG-11": ("photo", "img-11-masque.jpg", None, None),        # masque au pinceau
    "IMG-13": ("photo", "img-13-massage.jpg", None, None),       # massage du visage
    "IMG-14": ("photo", "img-14-detendu.jpg", None, None),       # visage détendu après le soin
    "IMG-15": ("photo", "img-15-cabine.jpg", None, None),        # cabine vide
}

# Previous set: the client's own media in assets/source/ (kept for reference, not used).
# slot -> ("photo", file, focus_x, focus_y) | ("clip", file, start, end, slowdown)
SLOTS_CLIENT = {
    "IMG-01": ("photo", "peau-macro.png", None, None),          # macro peau, yeux clos
    "IMG-02": ("photo", "serum-pipette.png", None, None),       # pipette et goutte de sérum
    "IMG-08": ("photo", "machine-cabine.jpg", 760, None),       # la machine de l'institut
    "IMG-04": ("clip", "soin-institut.mov", 3.30, 4.48, 3.3),   # nettoyage : vapeur, mains gantées
    "IMG-05": ("clip", "soin-institut.mov", 4.52, 5.54, 3.6),   # travail de la peau, mains gantées
    "IMG-06": ("photo", "profil-nez.jpg", 720, None),           # zone du nez (extraction)
    "IMG-07": ("photo", "serum-joue.jpg", 760, None),           # sérum sur la joue (hydratation)
    "IMG-09": ("photo", "toucher-joue.png", None, None),        # toucher, observation de la peau
    "IMG-10": ("photo", "creme-joue.jpg", 520, None),           # texture crème
    "IMG-11": ("clip", "soin-institut.mov", 5.60, 6.60, 5.0),   # masque
    "IMG-13": ("clip", "soin-institut.mov", 6.66, 8.78, 2.7),   # massage du visage
    "IMG-14": ("clip", "soin-institut.mov", 8.82, 9.86, 7.0),   # visage détendu (plan large seulement : la barre de verre reste sous le visage)
    "IMG-15": ("photo", "cabine-amani.png", 540, None),         # cabine AMANI SKIN
}


def crop_916(im, fx, fy):
    w, h = im.size
    if w / h > W / H:  # too wide: crop width around fx
        cw = round(h * W / H)
        cx = w / 2 if fx is None else fx
        x0 = int(min(max(cx - cw / 2, 0), w - cw))
        box = (x0, 0, x0 + cw, h)
    else:  # too tall: crop height around fy
        ch = round(w * H / W)
        cy = h / 2 if fy is None else fy
        y0 = int(min(max(cy - ch / 2, 0), h - ch))
        box = (0, y0, w, y0 + ch)
    return im.crop(box).resize((W, H), Image.LANCZOS)


def run(args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error"] + args, check=True)


def photo(slot, name, fx, fy):
    src = os.path.join(GEN, name) if os.path.exists(os.path.join(GEN, name)) else os.path.join(SRC, name)
    im = crop_916(Image.open(src).convert("RGB"), fx, fy)
    png = os.path.join(OUT, f"{slot}.png")
    im.save(png)
    run(["-loop", "1", "-i", png, "-t", "15", "-r", "30", "-c:v", "libx264", "-preset", "medium",
         "-tune", "stillimage", "-crf", "17", "-pix_fmt", "yuv420p", *GOP, *SDR, "-movflags", "+faststart",
         os.path.join(OUT, f"{slot}.mp4")])
    os.remove(png)


# iPhone footage is HDR (HLG / BT.2020). Tone-map it to SDR BT.709 first: an HDR-tagged clip
# switches the whole render to the layered HDR path, which drops the glass and text layers.
TONEMAP = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:t=linear:npl=203,format=gbrpf32le,"
           "zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,")
SDR = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
GOP = ["-g", "30", "-keyint_min", "30"]  # dense keyframes: frame-exact seeking in render


def clip(slot, name, a, b, slow):
    vf = (TONEMAP + f"setpts={slow}*(PTS-STARTPTS),"
          "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,"
          f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
          "tpad=stop_mode=clone:stop_duration=15,format=yuv420p")
    run(["-ss", f"{a}", "-to", f"{b}", "-i", os.path.join(SRC, name), "-an", "-vf", vf, "-t", "15",
         "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "18", *GOP, *SDR, "-movflags", "+faststart",
         os.path.join(OUT, f"{slot}.mp4")])


for slot in sys.argv[1:] or SLOTS:
    spec = SLOTS[slot]
    (photo if spec[0] == "photo" else clip)(slot, *spec[1:])
    print(slot, "ok")

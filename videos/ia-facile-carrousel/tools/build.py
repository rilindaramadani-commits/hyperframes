"""Génère le carrousel IA FACILE (5 slides fixes, 1080x1350) à partir du style de la vidéo.

Usage : python3 tools/build.py   (depuis videos/ia-facile-carrousel)
Les textes sont identiques à ceux de ../ia-facile (version vidéo).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEO = ROOT.parent / "ia-facile"

style = re.search(r"<style>.*?</style>", (VIDEO / "index.html").read_text(), re.S).group(0)
style = style.replace("height: 1920px;", "height: 1350px;")
style = style.replace(
    "</style>",
    """  /* carrousel: progress bar + swipe hint */
      .pg {
        position: absolute;
        left: 60px;
        right: 60px;
        top: 56px;
        height: 12px;
        display: flex;
        gap: 12px;
      }
      .pg i {
        flex: 1;
        border-radius: 6px;
        background: rgba(18, 18, 18, 0.2);
      }
      .pg i.on {
        background: var(--ink);
      }
      .swipe {
        position: absolute;
        right: 60px;
        bottom: 56px;
        display: flex;
        align-items: center;
        gap: 18px;
        font-size: 34px;
        font-weight: 700;
      }
      .swipe .arr {
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: var(--ai);
        border: 4px solid var(--ink);
        box-shadow: 6px 6px 0 var(--ink);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>""",
)

SLIDES = []


def slide(n, css, body, dark=False):
    pg = "".join('<i class="on"></i>' if i < n else "<i></i>" for i in range(5))
    swipe = (
        '<div class="swipe" id="c%d-swipe"><span>Swipe</span><span class="arr">'
        '<svg width="38" height="38" viewBox="0 0 40 40" fill="none" stroke="#fff" stroke-width="6" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="M6 20 H33 M22 8 L34 20 L22 32" /></svg>'
        "</span></div>" % n
        if n < 5
        else ""
    )
    html = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <!-- Carrousel IA FACILE — slide {n}/5 (image fixe). Généré par tools/build.py. -->
  </head>
  <body>
    <template>
      <style>
        #c{n}-bg {{
          position: absolute;
          inset: 0;
          background: {"var(--ai)" if dark else "var(--ground)"};
          color: {"#fff" if dark else "var(--ink)"};
        }}
{css}
      </style>
      <div id="root" data-composition-id="c{n}" data-width="1080" data-height="1350">
        <div id="c{n}-bg">
          <div class="pg" id="c{n}-pg">{pg}</div>
{body}
          {swipe}
        </div>
      </div>
      <script>
        window.__timelines["c{n}"] = gsap.timeline({{ paused: true }});
      </script>
    </template>
  </body>
</html>
"""
    (ROOT / "compositions" / f"c{n}.html").write_text(html)
    SLIDES.append(n)


# ---------- 1. couverture ----------
slide(1, """
        #c1-ia { position: absolute; left: 52px; top: 150px; font-family: var(--font-display);
          font-size: 300px; line-height: 0.9; letter-spacing: -0.02em; }
        #c1-tilt { position: absolute; left: 44px; top: 440px; transform: rotate(-4deg); transform-origin: left center; }
        #c1-facile { display: inline-block; padding: 4px 34px 18px; background: var(--ai); color: #fff;
          border: 6px solid var(--ink); box-shadow: 16px 16px 0 var(--ink); font-family: var(--font-display);
          font-size: 214px; line-height: 1; letter-spacing: -0.02em; }
        #c1-bub { top: 800px; max-width: 760px; }
        #c1-lede { top: 1030px; }
""", """
          <div id="c1-ia">L'IA</div>
          <div id="c1-tilt"><div id="c1-facile">FACILE</div></div>
          <div class="bubble ai" id="c1-bub">Promis, c'est plus simple que tu crois.</div>
          <p class="lede" id="c1-lede">5 étapes pour t'y mettre.<br />Sans jargon. Sans coder.</p>
""")

# ---------- 2. c'est quoi ----------
slide(2, """
        #c2-title { top: 140px; }
        #c2-me { top: 400px; max-width: 700px; }
        #c2-ai { top: 640px; max-width: 900px; }
        #c2-lede { top: 930px; }
""", """
          <div class="h1" id="c2-title">C'est quoi,<br />l'IA&nbsp;?</div>
          <div class="bubble me" id="c2-me">Explique-moi l'IA simplement.</div>
          <div class="bubble ai" id="c2-ai">Un programme qui a lu des tonnes de textes. Tu lui écris, il te répond.</div>
          <p class="lede" id="c2-lede">Pas besoin de coder&nbsp;:<br />tu écris <span class="mark">comme tu parles.</span></p>
""")

# ---------- 3. usages ----------
ROW_CSS = """
        #c3-title { top: 140px; }
        #c3-title .y { color: var(--ground); }
        .c3-row { position: absolute; left: 60px; width: 948px; height: 236px; display: flex; align-items: center;
          gap: 34px; padding: 0 36px; background: var(--paper); color: var(--ink); border: 5px solid var(--ink);
          border-radius: 30px; box-shadow: 12px 12px 0 var(--ink); }
        .c3-ico { flex: 0 0 140px; height: 140px; border: 5px solid var(--ink); border-radius: 26px;
          background: var(--ground); display: flex; align-items: center; justify-content: center; }
        .c3-txt b { display: block; font-family: var(--font-display); font-size: 54px; line-height: 1.05; text-transform: uppercase; }
        .c3-txt span { display: block; margin-top: 10px; font-size: 34px; font-weight: 500; line-height: 1.25; }
        #c3-r1 { top: 400px; } #c3-r2 { top: 662px; } #c3-r3 { top: 924px; }
"""
ICONS = [
    '<svg class="ico" width="86" height="86" viewBox="0 0 86 86" fill="none" stroke="#121212" stroke-width="6" stroke-linejoin="round"><rect x="6" y="16" width="74" height="54" rx="8" /><path d="M8 20 L43 47 L78 20" /></svg>',
    '<svg class="ico" width="86" height="86" viewBox="0 0 86 86" fill="none" stroke="#121212" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6 H54 L72 24 V80 H16 Z" /><path d="M54 6 V24 H72" /><path d="M28 40 H60 M28 54 H60 M28 68 H48" /></svg>',
    '<svg class="ico" width="86" height="86" viewBox="0 0 86 86" fill="none" stroke="#121212" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M43 8 C26 8 16 20 16 34 C16 45 23 51 28 57 V64 H58 V57 C63 51 70 45 70 34 C70 20 60 8 43 8 Z" /><path d="M31 74 H55 M35 82 H51" /></svg>',
]
ROWS = [
    ("Écrire", "« Rédige un mail poli pour décaler mon rendez-vous. »"),
    ("Résumer", "« Résume ce texte en 5 points simples. »"),
    ("Trouver des idées", "« 10 idées de repas rapides pour la semaine. »"),
]
rows = "\n".join(
    f'          <div class="c3-row" id="c3-r{i+1}"><div class="c3-ico">{ICONS[i]}</div>'
    f'<div class="c3-txt"><b>{t}</b><span>{ex}</span></div></div>'
    for i, (t, ex) in enumerate(ROWS)
)
slide(3, ROW_CSS, """
          <div class="h1" id="c3-title"><span class="y">3 usages</span><br />pour démarrer</div>
""" + rows + "\n", dark=True)

# ---------- 4. formule ----------
slide(4, """
        #c4-title { top: 140px; }
        #c4-eq { position: absolute; left: 60px; right: 60px; top: 400px; display: flex; flex-wrap: wrap;
          align-items: center; row-gap: 26px; column-gap: 18px; }
        .tag { display: inline-block; padding: 10px 24px 14px; border: 5px solid var(--ink); border-radius: 16px;
          box-shadow: 8px 8px 0 var(--ink); font-family: var(--font-display); font-size: 50px; line-height: 1;
          text-transform: uppercase; }
        .plus { font-family: var(--font-display); font-size: 56px; line-height: 1; }
        .tag.role { background: var(--ai); color: #fff; } .tag.tache { background: var(--tomato); }
        .tag.ctx { background: var(--mint); } .tag.fmt { background: var(--pink); }
        #c4-bub { top: 680px; left: 60px; right: 72px; font-size: 46px; line-height: 1.42; }
        .hl { padding: 2px 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
        .hl.role { background: var(--t-ai); } .hl.tache { background: var(--t-tomato); }
        .hl.ctx { background: var(--t-mint); } .hl.fmt { background: var(--t-pink); }
""", """
          <div class="h1" id="c4-title">La formule<br />du bon prompt</div>
          <div id="c4-eq">
            <span class="tag role">Rôle</span><span class="plus">+</span>
            <span class="tag tache">Tâche</span><span class="plus">+</span>
            <span class="tag ctx">Contexte</span><span class="plus">+</span>
            <span class="tag fmt">Format</span>
          </div>
          <div class="bubble me" id="c4-bub">
            <span class="hl role">Tu es coach sportif.</span>
            <span class="hl tache">Crée-moi un programme de 20&nbsp;min</span>
            <span class="hl ctx">pour débutant, sans matériel.</span>
            <span class="hl fmt">Présente-le en liste.</span>
          </div>
""")

# ---------- 5. défi + CTA ----------
CHK = ('<div class="c5-box"><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M7 25 L19 37 L41 11" '
       'stroke="#2B44FF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /></svg></div>')
slide(5, """
        #c5-title { top: 140px; }
        .c5-item { position: absolute; left: 60px; right: 60px; display: flex; align-items: center; gap: 30px;
          font-size: 42px; font-weight: 600; line-height: 1.22; }
        .c5-box { flex: 0 0 76px; height: 76px; border: 5px solid var(--ink); border-radius: 16px; background: var(--paper);
          box-shadow: 6px 6px 0 var(--ink); display: flex; align-items: center; justify-content: center; }
        #c5-i1 { top: 400px; } #c5-i2 { top: 540px; } #c5-i3 { top: 680px; }
        #c5-warn { position: absolute; left: 60px; right: 60px; top: 840px; display: flex; align-items: center; gap: 22px;
          font-size: 36px; font-weight: 600; }
        #c5-warn .bang { flex: 0 0 56px; height: 56px; border-radius: 50%; background: var(--tomato); border: 4px solid var(--ink);
          display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 34px; }
        #c5-tilt { position: absolute; left: 60px; right: 60px; top: 990px; transform: rotate(-2deg); }
        #c5-cta { display: flex; align-items: center; gap: 30px; padding: 26px 36px; background: var(--ai); color: #fff;
          border: 6px solid var(--ink); box-shadow: 14px 14px 0 var(--ink); }
        #c5-cta b { display: block; font-family: var(--font-display); font-size: 84px; line-height: 1; text-transform: uppercase; }
        #c5-cta span { display: block; margin-top: 8px; font-size: 34px; font-weight: 600; line-height: 1.2; }
""", f"""
          <div class="h1" id="c5-title">Ton défi<br />du jour</div>
          <div class="c5-item" id="c5-i1">{CHK}<div>Ouvre l'assistant IA de ton choix.</div></div>
          <div class="c5-item" id="c5-i2">{CHK}<div>Teste la formule sur un vrai besoin.</div></div>
          <div class="c5-item" id="c5-i3">{CHK}<div>Ajuste&nbsp;: « plus court », « plus simple ».</div></div>
          <div id="c5-warn"><span class="bang">!</span><span>Vérifie toujours les infos importantes.</span></div>
          <div id="c5-tilt"><div id="c5-cta">
            <svg width="70" height="90" viewBox="0 0 70 90" fill="#FFE24A" stroke="#121212" stroke-width="5" stroke-linejoin="round"><path d="M8 6 H62 V84 L35 64 L8 84 Z" /></svg>
            <div><b>Enregistre</b><span>ce post, et partage-le à quelqu'un qui débute.</span></div>
          </div></div>
""")

hosts = "\n".join(
    f'      <div id="c{n}" data-composition-id="c{n}" data-composition-src="compositions/c{n}.html" '
    f'data-start="{n-1}" data-duration="1" data-track-index="1" data-track-kind="graphics" '
    f'data-width="1080" data-height="1350" style="z-index: 1"></div>'
    for n in SLIDES
)
index = f"""<!doctype html>
<html
  lang="fr"
  data-composition-variables='[
    {{"id":"ground","type":"color","label":"Fond","default":"#FFE24A"}},
    {{"id":"ink","type":"color","label":"Encre","default":"#121212"}},
    {{"id":"ai","type":"color","label":"Couleur IA (accent)","default":"#2B44FF"}}
  ]'
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1350" />
    <!-- IA FACILE — carrousel Instagram 4:5. Une seconde par slide ; export PNG : tools/export.sh -->
    <script src="assets/vendor/gsap.min.js"></script>
    {style}
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="5" data-width="1080" data-height="1350" data-fps="30">
      <div id="ground"></div>
{hosts}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(index)
print("ok", SLIDES)

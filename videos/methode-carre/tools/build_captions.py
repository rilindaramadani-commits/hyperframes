"""Write compositions/captions.html from assets/vo.js (French subtitles, 2-4 words per group)."""
import json, re, html

vo = json.loads(re.search(r"window\.VO = (.*);", open("assets/vo.js", encoding="utf-8").read(), re.S).group(1))
SKIP = {"l9"}  # the end card shows the closing line itself
groups = []
for L in vo:
    if L["id"] in SKIP:
        continue
    cur = []
    WEAK = {"à", "de", "ce", "que", "tu", "et", "pour", "les", "la", "tes", "ton", "mais"}
    ws = L["words"]
    for k, w in enumerate(ws):
        cur.append(w)
        punct = re.search(r"[,.:?!…]$", w["text"])
        full = len(cur) >= 4 and k + 1 < len(ws) and len(cur) + len(ws) - k - 1 > 5
        if full:
            # never end a group on a weak word: carry it into the next group
            carry = []
            while len(cur) > 2 and cur[-1]["text"].lower() in WEAK:
                carry.insert(0, cur.pop())
            groups.append(cur); cur = carry
        elif punct:
            groups.append(cur); cur = []
    if cur:
        groups.append(cur)
# a lone short word joins the previous group of the same line when it fits
items = []
for g in groups:
    start = max(0.1, g[0]["start"] - 0.06)
    end = g[-1]["end"] + 0.12
    items.append({"start": start, "end": end, "words": [w["text"] for w in g]})
for a, b in zip(items, items[1:]):
    if a["end"] > b["start"] - 0.02:
        a["end"] = b["start"] - 0.02
    elif b["start"] - a["end"] < 0.35:
        a["end"] = b["start"] - 0.02  # keep the band steady between close groups

divs, js = [], []
for i, it in enumerate(items):
    words = "".join(f'<span class="cw">{html.escape(w)}</span> ' for w in it["words"]).strip()
    divs.append(f'        <div class="cap" id="cap-{i}"><span class="cap-band">{words}</span></div>')
    js.append(f'          show("#cap-{i}", {it["start"]:.2f}, {it["end"]:.2f});')

out = f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <!-- Sous-titres français — généré par tools/build_captions.py depuis assets/vo.js -->
  </head>
  <body>
    <template>
      <style>
        #root {{ position: absolute; inset: 0; pointer-events: none; }}
        .cap {{ position: absolute; left: 0; right: 0; top: 1196px; text-align: center; opacity: 0; }}
        .cap-band {{
          display: inline-block; max-width: 900px; padding: 12px 28px 16px; border-radius: 14px;
          background: rgba(30, 20, 14, 0.9); color: #f8f5ef; border: 2px solid rgba(201, 169, 106, 0.55);
          font-family: "Plus Jakarta Sans", sans-serif; font-weight: 800; font-size: 48px; line-height: 1.18;
        }}
      </style>
      <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(divs)}
      </div>
      <script>
        (function () {{
          const tl = gsap.timeline({{ paused: true }});
          function show(sel, a, b) {{
            tl.fromTo(sel, {{ opacity: 0, y: 10 }}, {{ opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }}, a);
            tl.to(sel, {{ opacity: 0, duration: 0.08, ease: "power2.in" }}, b - 0.08);
            tl.set(sel, {{ opacity: 0, visibility: "hidden" }}, b);
          }}
{chr(10).join(js)}
          window.__timelines["captions"] = tl;
        }})();
      </script>
    </template>
  </body>
</html>
'''
open("compositions/captions.html", "w", encoding="utf-8").write(out)
for it in items:
    print(f'{it["start"]:6.2f} {it["end"]:6.2f}  {" ".join(it["words"])}')

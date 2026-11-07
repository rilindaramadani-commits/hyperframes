# IA FACILE — carrousel Instagram (5 slides, 4:5)

**Images finales : `export/ia-facile-slide-1.png` … `ia-facile-slide-5.png`** (1080×1350).

1. **L'IA FACILE** — « Promis, c'est plus simple que tu crois. » · 5 étapes, sans jargon, sans coder.
2. **C'est quoi, l'IA ?** — un programme qui a lu des tonnes de textes ; tu écris comme tu parles.
3. **3 usages pour démarrer** — Écrire · Résumer · Trouver des idées (avec un exemple de prompt chacun).
4. **La formule du bon prompt** — Rôle + Tâche + Contexte + Format, exemple surligné.
5. **Ton défi du jour** — 3 étapes, « vérifie toujours les infos importantes », CTA « Enregistre ».

La version vidéo animée est dans `../ia-facile` (même design, mêmes textes).

## Modifier / régénérer

Les slides sont générées par `tools/build.py` (textes et mise en page, style repris de la vidéo),
puis exportées en PNG :

```bash
python3 tools/build.py      # régénère index.html + compositions/c1..c5.html
./tools/export.sh           # écrit export/ia-facile-slide-N.png
```

Chaque slide occupe 1 s sur la timeline (0,5 s = slide 1, 1,5 s = slide 2…). Les avertissements
`line_unread` de `hyperframes check` sont sans objet ici : ce sont des images fixes, pas une vidéo.

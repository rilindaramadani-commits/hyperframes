# HydraSkin — vidéo glassmorphism (HyperFrames)

Vidéo verticale 1080×1920, 30 i/s, 78 s, pour Instagram Reels et TikTok. Direction artistique Bordeaux & Beige,
verre dépoli. Le brief est dans `BRIEF.md`, le storyboard validé dans `STORYBOARD.md` (planche : `storyboard.html`),
la voix off dans `SCRIPT.md`, les plans à tourner ou à générer dans `PLANS-A-TOURNER.md`, et le système visuel dans `frame.md`.

## État

- **Animation, verre, textes, rail, transitions, musique** : faits.
- **Images** : les 13 fichiers `assets/media/IMG-xx.mp4` sont des **plans provisoires** (études de ton
  étiquetées). Pour mettre les vrais plans, remplacez chaque fichier par le clip réel (même nom, 9:16,
  5 s ou plus), sans toucher au code. Les annotations de la scène 3 (`compositions/f3-technologie.html`)
  pointent des points de contact provisoires : à recaler sur les vrais clips.
- **Voix off** : pas encore enregistrée (aucun service de synthèse vocale disponible dans cette session).
  Elle viendra sur sa propre piste dans `index.html`. La durée réelle de la voix fera foi : les scènes seront
  recalées dessus et la musique creusée sous la voix.
- **Écran final** : AMANI SKIN ; l'emplacement des coordonnées affiche « Coordonnées · à confirmer » tant
  que la cliente ne les a pas fournies.

## Structure

| Scène | Temps | Fichier |
| --- | --- | --- |
| 1 · Accroche | 0–8,4 s | `compositions/f1-accroche.html` |
| 2 · Le principe | 7,2–20,4 s | `compositions/f2-principe.html` |
| 3 · La technologie en action | 19,4–33,0 s | `compositions/f3-technologie.html` |
| 4 · Un soin personnalisé | 31,4–46,6 s | `compositions/f4-personnalise.html` |
| 5 · L'expérience premium | 45,4–65,8 s | `compositions/f5-experience.html` |
| 6 · Signature | 64,4–78,0 s | `compositions/f6-signature.html` |

Les scènes se chevauchent sur chaque transition ; la scène sortante est au-dessus. Dans chaque script, les
temps sont écrits en temps absolu du film (fonction `A()`), comme dans le storyboard.

- `assets/hydraskin.css` — polices, palette, verre (`.glass`, variable `--g` = degré de dépoli), rail, filets.
- `assets/audio/` — musique (70 BPM, ré majeur) et deux sons (tink de verre, souffle d'air), synthétisés par
  `tools/make_audio.py`.
- `tools/make_placeholders.py` — régénère les plans provisoires.

## Commandes

```bash
npx hyperframes preview      # Studio
npx hyperframes check        # vérifications
npx hyperframes render -q delivery -o renders/hydraskin.mp4
```

# HydraSkin — vidéo glassmorphism (HyperFrames)

Vidéo verticale 1080×1920, 30 i/s, 78 s, pour Instagram Reels et TikTok. Direction artistique Bordeaux & Beige,
verre dépoli. Le brief est dans `BRIEF.md`, le storyboard validé dans `STORYBOARD.md` (planche : `storyboard.html`),
la voix off dans `SCRIPT.md`, les plans à tourner ou à générer dans `PLANS-A-TOURNER.md`, et le système visuel dans `frame.md`.

## État

- **Film final** : `hydraskin_promo.mp4` (88 s, 1080×1920, SDR), avec la voix off `hydraskin_voiceover_v2.mp3`
  (Google Cloud TTS, fr-FR-Chirp3-HD-Despina, utilisée telle quelle, à partir de 3,4 s) et la musique `assets/audio/music.wav`.
- **Images** : 12 images générées par IA avec Lovable (1088×1920), à la demande de la cliente de ne pas
  utiliser ses propres photos. Les originaux sont dans `assets/generated/lovable/` ;
  `tools/import_media.py` les place dans les plans `assets/media/IMG-xx.mp4`. L'écran final affiche
  « Images virtuelles ». Les médias de la cliente (`assets/source/`) sont conservés, mais ne sont plus utilisés.
- **Temps** : les scènes sont écrites sur la grille du storyboard (78 s) et calées sur la narration (88 s) par
  la carte de temps `assets/timewarp.js`.
- **Écran final** : AMANI SKIN, @amani__skin · 07 66 85 43 74 (coordonnées fournies par la cliente).

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

# Publicité « Institut de beauté » — 3D isométrique (HyperFrames)

Vidéo verticale 1080×1920, 30 s, 30 i/s. Rendu final : `renders/institut-beaute-iso.mp4`.

## À personnaliser (placeholders)

Toutes les infos entre crochets sont des **placeholders** à remplacer :

| Placeholder | Fichier(s) |
| --- | --- |
| `[LOGO]` | `compositions/s1-intro.html`, `compositions/s5-cta.html` (élément `.logo-text` ; remplaçable par un `<img src="assets/logo.svg">`) |
| `[NOM DE L’INSTITUT]` | `compositions/s1-intro.html`, `compositions/s5-cta.html` |
| `[INSTAGRAM]`, `[TÉLÉPHONE]`, `[SITE INTERNET]` | `compositions/s5-cta.html` |

Vous pouvez aussi les modifier directement dans le Studio (`npx hyperframes preview`) en cliquant sur le texte.

## Structure

- `index.html` — composition racine : canvas 3D, voiles, light leaks, musique & SFX, et les 5 scènes.
- `assets/world.js` — l'institut 3D (Three.js, caméra orthographique isométrique) : espace regard, espace soin visage, accueil, salon détente ; mouvements de caméra par scène ; produits skincare flottants (scène 3).
- `compositions/s1-intro.html` … `s5-cta.html` — textes et graphismes de chaque scène (loupe cils & sourcils en scène 2).
- `assets/audio/` — musique (60 BPM, ré majeur) et SFX synthétisés pour ce projet (libres de droits).
- `assets/fonts/` — Marcellus (titres) et Jost (textes), embarquées localement.

## Commandes

```bash
npx hyperframes preview      # Studio
npx hyperframes check        # vérifications
npx hyperframes render -q delivery -o renders/institut-beaute-iso.mp4
```

# Publicité « Institut de beauté » — 3D isométrique (HyperFrames)

Vidéo verticale 1080×1920, 30 s, 30 i/s. Rendu final : `renders/institut-beaute-iso.mp4`.

## Marque

Signature **AMANI SKIN — Beauté · Soin · Confiance** en ouverture (scène 1) et en clôture (scène 5).
C'est une recréation typographique (Italiana + Jost) d'après vos affiches. Si vous avez le fichier
logo officiel (SVG ou PNG transparent), placez-le dans `assets/` et remplacez le bloc `.lockup` de
`compositions/s1-intro.html` et `compositions/s5-cta.html`.

## À compléter (placeholders)

| Placeholder | Fichier |
| --- | --- |
| `[INSTAGRAM]`, `[TÉLÉPHONE]`, `[SITE INTERNET]` | `compositions/s5-cta.html` |

Modifiables aussi directement dans le Studio (`npx hyperframes preview`) en cliquant sur le texte.

## Structure

- `index.html` — composition racine : canvas 3D, voiles, light leaks, musique & SFX, et les 5 scènes.
- `assets/world.js` — l'institut 3D (Three.js, caméra orthographique isométrique) : espace regard, espace soin visage, accueil, salon détente ; mouvements de caméra par scène ; produits skincare flottants (scène 3).
- `compositions/s1-intro.html` … `s5-cta.html` — textes et graphismes de chaque scène (loupe cils & sourcils en scène 2).
- `assets/audio/` — musique (60 BPM, ré majeur) et SFX synthétisés pour ce projet (libres de droits).
- `assets/fonts/` — Italiana (signature AMANI), Marcellus (titres) et Jost (textes), embarquées localement.

## Commandes

```bash
npx hyperframes preview      # Studio
npx hyperframes check        # vérifications
npx hyperframes render -q delivery -o renders/institut-beaute-iso.mp4
```

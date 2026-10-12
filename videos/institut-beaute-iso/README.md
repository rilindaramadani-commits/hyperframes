# Publicité « Institut de beauté » — 3D isométrique (HyperFrames)

Vidéo verticale 1080×1920, 30 s, 30 i/s. Rendu final : `renders/amani-skin-pub-3d.mp4`.

## Marque & contenus

- **Logo** : le mot « AMANI » de `assets/brand/amani-wordmark.png` est extrait de la photo du logo
  fournie (logo embossé) ; la ligne « SKIN », les filets et le point sont redessinés en vectoriel.
  Pour une netteté parfaite, remplacez ce PNG par l'export officiel (même nom de fichier, fond transparent).
- **Prestations** : Lash lift coréen (avec ou sans teinture), Brow lift — Soin Glass Skin, HydraSkin Signature.
- **Formules signature** : Glow & Gaze (Lash lift coréen + Soin Glass Skin), Amani Signature
  (HydraSkin + Masque modelant + Massage drainant).
- **Contacts** : Instagram @amani__skin · 07 66 85 43 74 (`compositions/s5-cta.html`).

## Minutage

| Scène | Temps | Fichier |
| --- | --- | --- |
| Intro — AMANI SKIN, « Révélez votre beauté » | 0–4 s | `compositions/s1-intro.html` |
| Soins du regard | 4–10 s | `compositions/s2-regard.html` |
| Soins de la peau | 10–16 s | `compositions/s3-peau.html` |
| Votre moment beauté → Formules signature | 16–23 s | `compositions/s4-experience.html` |
| Réservez votre rendez-vous | 23–30 s | `compositions/s5-cta.html` |

## Structure

- `index.html` — composition racine : canvas 3D, voiles, light leaks, musique & SFX, et les 5 scènes.
- `assets/world.js` — l'institut 3D (Three.js, caméra orthographique isométrique) : espace regard, espace soin visage, accueil, salon détente ; mouvements de caméra par scène ; produits skincare flottants (scène 3).
- `compositions/s1-intro.html` … `s5-cta.html` — textes et graphismes de chaque scène (loupe cils & sourcils en scène 2).
- `assets/audio/` — musique (60 BPM, ré majeur) et SFX synthétisés pour ce projet (libres de droits).
- `assets/fonts/` — Marcellus (titres) et Jost (textes), embarquées localement.
- `assets/brand/` — logo AMANI (wordmark).

## Commandes

```bash
npx hyperframes preview      # Studio
npx hyperframes check        # vérifications
npx hyperframes render -q delivery -o renders/institut-beaute-iso.mp4
```

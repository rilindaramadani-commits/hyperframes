# Couverture Instagram — Reel « La méthode CARRÉ » (Remotion)

Projet créé avec `npx create-video --blank` (Remotion 4). L'image de fond `public/hub-render.png` est une
image du film HyperFrames (`../methode-carre`, 23,6 s) ; les tuiles C·A·R·R·É tombent avec `spring()`.

```bash
npm install
npx remotion still CoverStill out/couverture-instagram.png      # couverture fixe 1080×1920
npx remotion render CoverAnimated out/couverture-animee.mp4     # version animée 1,5 s
npm run dev                                                     # Remotion Studio
```

Dans un conteneur sans accès à remotion.media, ajoute `--browser-executable=/opt/pw-browsers/chromium`.

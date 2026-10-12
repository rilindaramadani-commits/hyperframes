# 3 erreurs skincare — vidéo verticale 3D (HyperFrames)

Vidéo éducative 1080 × 1920, 59,5 s, 30 i/s : « 3 erreurs à ne surtout pas faire si tu veux réussir ta
skincare ». Rendu 100 % HyperFrames : Three.js (monde 3D) + GSAP (titres, sous-titres, effets de caméra).

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Composition racine : canvas 3D, calque d'interface, effets (flou de plongée, rembobinage, bloom), voix, musique et 95 effets sonores |
| `assets/world/core.js` | Rendu (tone mapping, ombres, environnement studio), matières physiques, textures procédurales, caméra longue focale, post-traitement (profondeur de champ, bloom, grain) |
| `assets/world/props.js` | Flacons en verre physique avec étiquettes, bloc de peau en coupe, étagères, plateau, calendrier, sablier, eucalyptus, marque-page, ciel |
| `assets/world/stages.js` | Studio + table en travertin et 3 plateaux ; scènes 01 (étagères), 02 (coiffeuse du matin, mur qui s'ouvre sur le ciel), 03 (présentoir) |
| `assets/world/ui.js` | Interface 2D ancrée sur la 3D : étiquettes à filet, jauge de tolérance, checklist du matin, tags « NOUVEAU », « ? » |
| `assets/world/main.js` | Chorégraphie complète (caméra, objets, lumière, interface) en fonction du temps |
| `compositions/` | Typographie : accroche, titres d'erreurs + mots-clés, récap 1-2-3, phrase finale, CTA, sous-titres |
| `assets/plan.json` → `tools/build_plan.py` → `assets/plan.js` | Minutage des 17 plans et des repères (plongées, rembobinages…) |
| `tools/align_words.py` → `assets/words.js` | Minutage mot à mot de la voix off (sous-titres, synchronisation des actions) |
| `tools/duck_music.py` | Musique abaissée automatiquement sous la voix (`music-bed.wav`) |

## Commandes

```bash
npx hyperframes lint
npx hyperframes snapshot --at 3.3,17.6,31.3,46.2,55.4 -o snapshots
npx hyperframes render -q delivery -o renders/skincare-3-erreurs.mp4
```

Changer de voix : remplacer les clips `assets/audio/vo/pXX.wav`, ajuster `assets/plan.json`, puis lancer
`tools/build_plan.py`, `tools/align_words.py` et `tools/duck_music.py`.

Le logo AMANI SKIN et `@amani__skin` apparaissent discrètement sur le CTA final (`compositions/c-outro.html`, bloc `#oc-sign`) : supprimer ce bloc pour une version sans marque.

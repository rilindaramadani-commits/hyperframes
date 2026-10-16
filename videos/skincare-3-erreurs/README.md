# 3 erreurs skincare — vidéo verticale 3D (HyperFrames)

Vidéo éducative 1080 × 1920, 68,6 s, 30 i/s : « 3 erreurs à ne surtout pas faire si tu veux réussir ta
skincare ». Rendu 100 % HyperFrames : Three.js (monde 3D) + GSAP (titres, sous-titres, effets de caméra).

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Composition racine : canvas 3D, calque d'interface, effets (flou de plongée, rembobinage, bloom), voix, musique et 94 effets sonores |
| `assets/world/core.js` | Rendu (tone mapping, ombres, environnement studio), matières physiques, textures procédurales, caméra longue focale, post-traitement (profondeur de champ, bloom, grain) |
| `assets/world/props.js` | Flacons en verre physique avec étiquettes, bloc de peau en coupe, étagères, plateau, calendrier, sablier, eucalyptus, marque-page, ciel |
| `assets/world/stages.js` | Studio + table en travertin et 3 plateaux ; scènes 01 (étagères), 02 (coiffeuse du matin, mur qui s'ouvre sur le ciel), 03 (présentoir) |
| `assets/world/ui.js` | Interface 2D ancrée sur la 3D : étiquettes à filet, jauge de tolérance, checklist du matin, tags « NOUVEAU », « ? » |
| `assets/world/main.js` | Chorégraphie complète (caméra, objets, lumière, interface) en fonction du temps |
| `compositions/` | Typographie : accroche, titres d'erreurs + mots-clés, récap 1-2-3, phrase finale, CTA, sous-titres |
| `assets/plan.json` → `tools/build_plan.py` → `assets/plan.js` | Minutage des 17 plans et des repères (plongées, rembobinages…) |
| `tools/align_words.py` → `assets/words.js` | Minutage mot à mot de la voix off (sous-titres, synchronisation des actions) |
| `tools/import_voice.py` | Import d'un enregistrement complet de la voix off : nettoyage, découpe en 17 clips, nouveau minutage (`tools/voice_spans.json`) |
| `tools/make_audio.py` | Musique (104 BPM) et bibliothèque d'effets sonores, calées sur le minutage |
| `tools/duck_music.py` | Musique abaissée automatiquement sous la voix (`music-bed.wav`) |
| `tools/build_sfx.py` | Placement des effets sonores dans `index.html` à partir du minutage plans + mots |
| `tools/sync_index.py` | Début / durée des blocs texte, de la voix et de la musique, durée totale de la composition |
| `tools/remix_audio.py` | Nouvelle bande-son sur le film sans refaire les images : rend le mixage seul (~1 min) puis le pose sur la vidéo |

## Commandes

```bash
npx hyperframes lint
npx hyperframes snapshot --at 3.4,13.9,28.3,37,45,58.9,66.8 -o snapshots
npx hyperframes render -q delivery -o renders/skincare-3-erreurs.mp4
```

Changer de voix (tout le montage suit le minutage : caméra, objets, titres, sous-titres, sons) :

```bash
python3 tools/import_voice.py <enregistrement> tools/voice_spans.json 1.08   # spans = début/fin de chaque phrase
python3 tools/build_plan.py && python3 tools/align_words.py && python3 tools/build_plan.py
python3 tools/make_audio.py assets/plan.json assets/audio
python3 tools/duck_music.py && python3 tools/build_sfx.py && python3 tools/sync_index.py
```

Voix : légère réverbération de pièce (effet `reverb` HyperFrames, `data-fx-chain` sur `#voiceover` dans `index.html` :
taille 0,6, amortissement 0,45, wet 0,3). Pour la doser après un changement de son uniquement :
`python3 tools/remix_audio.py renders/skincare-3-erreurs.mp4 renders/nouveau.mp4` (le film n'est pas re-rendu).

Le logo AMANI SKIN et `@amani__skin` apparaissent discrètement sur le CTA final (`compositions/c-outro.html`, bloc `#oc-sign`) : supprimer ce bloc pour une version sans marque.

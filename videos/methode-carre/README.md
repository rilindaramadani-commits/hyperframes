# RILI SUCCESS — « La méthode CARRÉ en 30 secondes » (HyperFrames)

Reel Instagram 1080 × 1920, 30 s, 30 i/s. Rendu final : `renders/methode-carre-reel.mp4`.
Couverture : `renders/couverture-instagram.png` (Remotion, projet `../methode-carre-cover`).
Livrables écrits (storyboard, prompts Kling/Runway, voix off chronométrée, CapCut, légende) : `LIVRABLES.md`.

Fin : « Et si l'IA pouvait convenir à tous » (aucun nom de marque dans la vidéo).

Style : scène sombre inspirée de la référence de la cliente (fond noir, sol en grille dorée en perspective,
grands titres blancs centrés, surtitre doré espacé, mot-clé doré), palette RILI SUCCESS, fin sur fond chocolat.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Composition racine : fond, grille, canvas 3D, voiles, rideau chocolat, scènes, sous-titres, voix, musique, effets |
| `assets/world.js` | Monde 3D isométrique (Three.js) : bureau, hub IA (écran géant, cerveau holographique, 5 cubes dorés), 5 stations C·A·R·R·É, flux de données, cube logo. Dessiné uniquement depuis le temps HyperFrames |
| `assets/vendor/remotion-motion.js` | `spring()`, `interpolate()`, `Easing` de Remotion 4 empaquetés pour le navigateur (`tools/remotion-motion.entry.js`) : ressorts des cubes, tuiles et textes |
| `compositions/s1-hook.html` … `s6-signature.html` | Textes des 6 scènes du storyboard |
| `compositions/captions.html` | Sous-titres français (généré) |
| `tools/voice.json` → `tools/make_voice.sh` / `build_voice.py` | Voix off Kokoro (ff_siwis), une ligne par phrase, minutage → `assets/audio/voiceover.wav` + `assets/vo.js` |
| `tools/build_captions.py` | Sous-titres depuis `assets/vo.js` |
| `tools/make_music.py` | Musique électronique corporate 120 BPM (1 mesure = 1 lettre), baissée sous la voix |
| `tools/place_sfx.py` | Effets sonores (Pixabay, `assets/audio/sfx/`) calés une image après l'action |

## Commandes

```bash
npx hyperframes preview
npx hyperframes check
npx hyperframes render -q delivery -o renders/methode-carre-reel.mp4
```

Changer la voix : modifier `tools/voice.json` (champ `say` = texte prononcé, `text` = sous-titre), puis
`tools/make_voice.sh && python3 tools/build_captions.py && python3 tools/make_music.py`.

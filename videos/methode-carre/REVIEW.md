# Relecture — rendu v1 (renders/methode-carre-reel.mp4)

- Format : H.264 1080 × 1920, 30 i/s, 30,0 s ; AAC 48 kHz. Loudness mesurée -15,6 LUFS intégrés, crête -2,9 dBFS
  (mesure ffmpeg ebur128, pas une écoute).
- Images vérifiées (renders/frames/) : accroche lisible dès la 1re image ; cubes alignés à 6,2 s ; une station par
  lettre (8,4 / 10,2 / 12,4 / 14,4 / 16,4 s) avec titre + sous-titre sans chevauchement ; prompt complet et 5 parties
  allumées à 22,4 s ; comparaison vague / CARRÉ à 25,9 s ; phrase de fin « Et si l'IA pouvait convenir à tous » sous le cube « IA » sur chocolat à 29,5 s.
- `hyperframes check` : avertissements restants assumés —
  - `line_unread` sur les phrases de la scène 3 (1,6 s à l'écran pour 1,7 s conseillées) : imposé par le brief
    (5 composantes en 10 s) ; la voix off répète chaque consigne ;
  - `canvas_content_at_edge` : le monde 3D est volontairement plein cadre ;
  - avertissements WebGL « GPU stall due to ReadPixels » : rendu logiciel du conteneur, sans effet sur l'image.
- Défauts repérés puis corrigés : titres qui chevauchaient l'écran du bureau, cube logo hors champ, écran géant trop
  bas, cubes sous les sous-titres, pastilles du prompt qui recouvraient la ligne précédente, voile clair sur l'écran.
- Style révisé d'après la référence de la cliente (scène sombre à grille, titres blancs centrés, surtitre doré).
- v2 : nom RILI SUCCESS retiré de la vidéo (logotype, cube « RS » → « IA », barre de l'écran géant, voix off) et remplacé
  par « Et si l'IA pouvait convenir à tous » (texte écran + voix off à 27,9 s), à la demande de la cliente.

# SPEC — La méthode CARRÉ en 30 secondes (RILI SUCCESS)

GOAL:    à la fin, un débutant sait écrire un prompt en 5 blocs (Contexte, Action, Rôle, Résultat, Exemple)
         et associe la méthode à RILI SUCCESS.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, MP4 H.264 + AAC.
TIME:    30 s x 30 = 900 frames. Musique 120 BPM = 15 frames par temps, 60 frames par mesure.
         La voix est l'horloge : chaque titre tombe sur le mot qui le dit.

LOOK:    (révisé après la référence de la cliente : Short « tuto pour débutants » — scène sombre, grille en perspective,
          grands titres blancs centrés, surtitre coloré espacé, mot-clé en couleur ; l'orange devient le doré RILI SUCCESS)
  ground   noir #0F0F0F (radial #1A1512 au centre), sol 3D en pierre sombre #1B1612 quadrillé de filets dorés à 32 %,
           grille CSS dorée en perspective (rotateX 64°, pas 150 px) et lueur chaude en bas ; grain 6 %, vignette 50 %.
           Scène 6 : chocolat profond #3B2418 -> #1E120B.
  ink      blanc cassé #F8F5EF pour les titres, doré #C9A96A pour le surtitre et le mot-clé.
  accent   doré #C9A96A (métal 3D : metalness 1, roughness 0.32, env 0.55). À l'écran : la lettre CARRÉ
           de la scène en cours, les surlignages du prompt, la signature finale. Un seul accent par plan.
  type     titres Archivo Black 80-90 px centrés, interlettrage -3.5 %, 3 lignes max ; surtitre Plus Jakarta Sans 800 30 px,
           capitales, interlettrage +30 %, doré.
           mots-clés CARRÉ Sora 800 caps 64 px, interlettrage +6 %. Texte courant Plus Jakarta Sans 600, 44 px.
           Sous-titres Plus Jakarta Sans 800, 48 px, blanc cassé sur bande chocolat 78 % ajustée au texte.
           Interface IA (écrans) : Plus Jakarta Sans 500, 30-34 px.
  medium   3D isométrique « studio de conseil tech » : caméra orthographique, élévation 32°, azimut 45° ± 12°.
           Plateau en pierre beige (#D8C3AE, roughness 0.85) cerclé d'un filet doré ; mobilier noir mat
           (#0F0F0F, roughness 0.55) et noyer chocolat (#3B2418, roughness 0.6) ; écrans en verre noir
           (roughness 0.12) avec interfaces dessinées en canvas ; cubes en or brossé, lettres gravées chocolat.
  light    clé chaude #FFF1DE intensité 2.4 depuis haut-gauche (az 135°, élév 55°), ombres PCF douces radius 5,
           remplissage #FFE6D0 0.5, rim froid #DCE6FF 0.35 depuis l'arrière ; environnement RoomEnvironment 0.45.
           Ombre de contact sous chaque objet (biais -0.0004).

OBJECTS:
  - poste de travail : bureau noyer + pieds noirs, écran 27" (cadre noir, pied alu), clavier, tasse, lampe
    articulée ; consultant·e assis·e (costume noir, chemise beige, cheveux courts chocolat, proportions adultes 1:7).
  - hub IA : socle cylindrique noir à anneau doré, cerveau holographique filaire doré (2 hémisphères,
    lignes de gyrus), grand écran vertical flottant (interface IA), flux de données (tubes fins + impulsions dorées).
  - 5 cubes dorés 0.9 u, lettres C A R R É gravées chocolat sur la face avant.
  - stations : C = maquette d'open space miniature + tableau de bord ; A = écran de tâches + flèche dorée 3D ;
    R = assistant IA (androïde élancé, costume chocolat, visière noire, anneau doré, badge « Expert marketing ») ;
    R = borne d'interface qui imprime un document structuré ; É = écran avec deux modèles de documents.

MOTION:
  enter     ressort Remotion damping 15, stiffness 140, mass 1 (≈ 24 frames, dépassement 3 %) sur position/échelle.
  text in   masque + translation 100 % -> 0, expo.out 18 frames ; mots décalés de 3 frames.
  exit      power2.in 9 frames, jamais pendant que le texte est lu.
  camera    cubic in-out 15-18 frames pour les déplacements entre stations, puis dérive lente sine (zoom 6 %, az 4°).
  stagger   cubes : 4 frames ; lignes de documents : 2 frames.

SHOTS:
  1  000-120  bureau, plan serré sur le consultant et l'écran. La question vague se tape (« Écris un post sur l'IA »),
              réponse générique grisée. Titre dès la frame 0 : « Tu n'obtiens pas les bonnes réponses avec ChatGPT ? ».
              Son : touches clavier, petit « erreur » sourd sur la réponse. Passage : la caméra recule vers le hub.
  2  120-210  hub IA : l'écran s'ouvre (ligne -> panneau), le cerveau s'allume, 5 cubes tombent en ressort et
              s'alignent C A R R É. Titre « Découvre la méthode CARRÉ. » sur « méthode CARRÉ ». Son : whoosh + 5 pops.
  3  210-510  vol à travers le monde, une station par lettre (60 frames chacune), chaque station surgit du sol avec sa
              propre animation. Titre : grande lettre dorée + mot + phrase de la cliente. Son : whoosh court au départ
              de chaque station, pop sur la lettre.
  4  510-720  la caméra plonge dans le grand écran du hub ; l'interface plein cadre tape le prompt complet, puis les
              5 parties s'illuminent C, A, R, R, É (une toutes les 18 frames) avec leur pastille-lettre.
  5  720-810  comparaison : à gauche demande vague (grise, réponse floue), à droite demande CARRÉ (dorée, tableau de
              7 jours net). Titre « Structure tes prompts. Améliore tes résultats. »
  6  810-900  rideau chocolat ; les 5 cubes fusionnent en un cube doré qui pivote et se pose ; logotype RILI SUCCESS
              avec reflet doré ; « L'IA devient plus simple quand tu sais l'utiliser. » ; tient 1.5 s.

SAFE:    rien d'écrit au-dessus de 168 px ni sous 1330 px ; titres 200-560 px ; monde 3D 520-1180 px ;
         sous-titres 1190-1310 px ; marges latérales 72 px (rail d'actions Instagram à droite : rien de lu au-delà de 960 px
         sous 900 px de hauteur).

BANNED:  (fond sombre et titres centrés autorisés : ils viennent de la référence de la cliente) néon, lens flares, particules
         décoratives ; dégradés violets/bleus, glassmorphism ; papier crème + serif + labels mono ; tout centré qui
         apparaît en fondu en même temps ; texte qui bouge pendant la lecture ; logo dans un coin ; trois cartes en ligne ;
         fleurs, bougies, déco féminine, cartoon/enfantin ; carillons synthétiques.

QA:      f0 (accroche lisible), 2.8 s (réponse générique), 6.2 s (cubes alignés), 8, 10, 12, 14, 16 s (chaque station +
         titre), 20.5 s (prompt complet), 23.5 s (5 parties allumées), 25.8 s (comparaison), 29.4 s (signature).

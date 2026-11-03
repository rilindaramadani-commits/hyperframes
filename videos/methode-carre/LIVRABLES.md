# RILI SUCCESS — « La méthode CARRÉ en 30 secondes »
Reel Instagram 9:16 · 1080 × 1920 · 30 s · 30 i/s · voix off féminine FR · sous-titres FR

**Fichiers produits**

| Fichier | Contenu |
| --- | --- |
| `renders/methode-carre-reel.mp4` | La vidéo finale (3D isométrique Three.js rendue par HyperFrames, voix, sous-titres incrustés, musique, effets) |
| `renders/couverture-instagram.png` | Couverture 1080 × 1920 (rendue avec Remotion, projet `../methode-carre-cover/`) |
| `assets/audio/voiceover.wav` · `music.wav` | Voix off seule et musique seule (pour un remontage CapCut) |
| `LIVRABLES.md` | Ce document : storyboard, prompts Kling/Runway, cohérence, voix off, textes, CapCut, légende |

---

## 1. Storyboard complet

Un seul monde 3D continu (plateau de conseil tech isométrique) que la caméra traverse : bureau → hub IA → 5 stations CARRÉ → écran géant → comparaison → signature. Style repris de ta référence (Short « tuto pour débutants ») : scène noire, sol en grille dorée en perspective, grands titres blancs centrés, surtitre doré en capitales espacées, mot-clé en doré. Mobilier noir mat et noyer chocolat ; or brossé pour tout ce qui appartient à la méthode.

| # | Temps | Image | Mouvement caméra | Texte écran | Son |
| --- | --- | --- | --- | --- | --- |
| 1 | 0,0–4,0 s | Bureau tech miniature : consultant·e en costume noir, écran 27" « Assistant IA ». La question vague se tape (« Écris un post sur l'IA. »), une réponse générique grise s'affiche, tampon « RÉPONSE GÉNÉRIQUE ». La personne se recule, pas convaincue. | Plan serré par-dessus l'épaule, lente avancée ; à 3,5 s grand recul vers le hub. | « Tu n'obtiens pas les **bonnes réponses** avec ChatGPT ? » (présent dès la 1re image = vignette) | Clavier, clic d'envoi, petit son d'erreur sourd, whoosh |
| 2 | 4,0–7,0 s | Hub IA : socle noir cerclé d'or, grand écran qui s'ouvre d'une ligne à un panneau, cerveau holographique filaire doré à droite, flux de données dorés au sol. Cinq cubes dorés C·A·R·R·É tombent un à un (ressort) et s'alignent. | Plan large qui se resserre doucement. | « Découvre la méthode **C A R R É** » (les 5 lettres tombent avec les cubes) | Whoosh + 5 « pop » sur les atterrissages, la batterie entre |
| 3a | 7–9 s | **C · Contexte** : une maquette d'open space surgit du sol (bureaux, mini-personnages, salle de réunion) + tableau de bord dont les barres montent. | Glissement latéral vers la station, légère dérive. | **C — CONTEXTE** · « Explique ta situation. » | Whoosh court, pop sur la lettre |
| 3b | 9–11 s | **A · Action** : écran « Mes tâches » ; une flèche dorée 3D arrive en arc et tape « Créer un calendrier de contenu », la ligne s'allume et se coche. | Glissement vers la station suivante. | **A — ACTION** · « Précise ce que tu veux. » | Clic au moment du tap |
| 3c | 11–13 s | **R · Rôle** : un assistant IA (androïde élancé, costume chocolat, visière noire, anneau doré) se matérialise de bas en haut sous un anneau de scan, puis présente ; badge « Rôle · Expert marketing ». | Idem. | **R — RÔLE** · « Donne un rôle à ton IA. » | Scintillement de matérialisation |
| 3d | 13–15 s | **R · Résultat** : une console noire imprime un document qui se redresse — « Calendrier de contenu — 7 jours », tableau Lun→Dim qui se remplit ligne par ligne. | Idem. | **R — RÉSULTAT** · « Décris le résultat attendu. » | Touche « impression » |
| 3e | 15–17 s | **É · Exemple** : écran « Exemples » ; deux modèles de documents (Modèle A / Modèle B) sortent de l'écran, une coche dorée se pose. | Idem. | **É — EXEMPLE** · « Montre-lui un exemple. » | Pop sur la coche |
| 4 | 17–24 s | L'écran géant du hub plein cadre : le prompt complet se tape, chaque bloc précédé de sa pastille-lettre ; les cubes viennent se placer juste sous l'écran. À partir de 20,8 s, les 5 parties s'illuminent dans l'ordre C, A, R, R, É et chaque cube se soulève avec sa partie. | Plongée dans l'écran, puis cadrage frontal, très lente avancée. | Le prompt lui-même (voir §5) | Frappe clavier, 5 clics sur les illuminations, montée (riser) à 23 s |
| 5 | 24–27 s | L'écran se divise en deux : à gauche « Demande vague » (gris, lignes floues, « ✕ Générique, peu utile ») ; à droite « Méthode CARRÉ » (or, tableau 7 jours net, « ✓ Précis, prêt à publier »). | Léger recul. | « Structure tes prompts. Améliore tes **résultats**. » | Whoosh au partage, groove complet |
| 6 | 27–30 s | Rideau chocolat en diagonale ; les 5 cubes reviennent puis fusionnent en un grand cube doré gravé « RS » qui pivote et se pose ; logotype RILI SUCCESS avec reflet doré ; phrase finale. | Fixe, très léger recul. | **RILI SUCCESS** · « L'IA devient plus simple quand tu sais l'utiliser. » | Accord final + impact grave sur le cube |

---

## 2. Prompts de génération vidéo (Kling / Runway / Seedance)

À utiliser si tu veux une version « générée » en plus de la version HyperFrames. Format 9:16, 5 s par plan (Kling 2.x / Runway Gen-4), puis montage CapCut (§6). **Toujours coller le bloc STYLE à la fin de chaque prompt** et, si l'outil le permet, donner en image de départ la capture de la scène correspondante (`renders/frames/scene-*.png`, tirées de la vidéo HyperFrames) en image de départ.

**Bloc STYLE (à coller partout)**
> Premium 3D isometric miniature diorama, orthographic camera, 32° elevation, soft studio lighting with warm key light from upper left and soft contact shadows, realistic materials: matte black furniture, walnut wood in chocolate brown #3B2418, dark stone floor with a thin gold grid, brushed gold metal #C9A96A, near-black background #0F0F0F with a faint gold perspective grid and a warm glow at the bottom, beige #D8C3AE and off-white #F8F5EF only as small highlights. Clean, technological, cinematic, professional AI consulting studio. No flowers, no candles, no feminine decor, no cartoon, no childish characters, no neon, no purple or blue gradients. Vertical 9:16, smooth slow camera.

**Négatif (Runway/Kling « negative prompt »)**
> cartoon, toy-like, childish, flowers, candles, beauty salon, lifestyle, neon glow, lens flare, purple, blue gradient, glitch, text artifacts, distorted hands, warped letters, extra limbs, low poly, blurry

| Scène | Prompt |
| --- | --- |
| 1 (0–4 s) | Isometric 3D miniature tech office. A professional consultant in a black suit sits at a walnut desk in front of a large black monitor showing an AI chat interface. They type a short vague question; a long grey generic answer appears and a small red "generic answer" stamp shows. The consultant leans back, unconvinced. Camera slowly pushes in over the shoulder, then pulls back. + STYLE |
| 2 (4–7 s) | Isometric 3D AI hub on a round black pedestal with a thin gold ring. A large floating screen opens from a thin line into a panel. A golden wireframe hologram of a brain rotates on a projector next to it, thin gold data lines pulse along the floor. Five brushed-gold cubes engraved with the letters C, A, R, R, É fall one after another with a soft bounce and line up in front of the screen. Camera slowly moves closer. + STYLE |
| 3a Contexte | A miniature open-space office rises from a dark plinth with a gold edge: four small desks with glowing screens, tiny professionals working, a round meeting table, and a wall dashboard whose bar chart grows. A gold cube with the letter C floats beside it. Camera glides in from the left. + STYLE |
| 3b Action | A black task-list monitor on an aluminium stand. A glossy golden 3D arrow flies in on an arc and taps the line "Créer un calendrier de contenu"; the line lights up gold and gets a check mark. A gold cube with the letter A floats beside it. + STYLE |
| 3c Rôle | A sleek professional AI assistant android (chocolate-brown suit, ivory head shell, black visor, gold collar ring) materialises from bottom to top inside a rising golden scan ring on a round black pad, then makes a welcoming gesture. A floating badge reads "Expert marketing". A gold cube with the letter R floats beside it. + STYLE |
| 3d Résultat | A black glass console with a glowing gold slot prints a perfectly structured cream document that slides out and stands up: title "Calendrier de contenu — 7 jours" and a clean table Monday to Sunday filling row by row. A gold cube with the letter R floats beside it. + STYLE |
| 3e Exemple | A wide black monitor shows "Exemples"; two document templates (Modèle A, Modèle B) step out of the screen towards the camera, a gold check mark disc lands on the first one. A gold cube with the letter É floats beside it. + STYLE |
| 4 (17–24 s) | Front view of a giant black AI screen with a thin gold frame on a hub pedestal. A long prompt types itself line by line; five segments light up one after another in gold. Below the screen, five gold cubes C A R R É lift one by one in sync. Very slow push-in. (Le texte exact doit être incrusté au montage : les IA vidéo déforment le texte.) + STYLE |
| 5 (24–27 s) | The giant screen splits into two screens side by side: left one grey and dull with blurry lines, right one dark with gold accents showing a neat 7-day content table. Slight pull-back. + STYLE |
| 6 (27–30 s) | A deep chocolate background (#3B2418 to #1E120B). Five gold cubes converge and fuse into one larger brushed-gold cube engraved "RS", which rotates a quarter turn and settles with a soft light sweep. Elegant, minimal, premium. Leave the lower third empty for the logo text. |

> Astuce : générer chaque plan 2 à 3 fois et garder la meilleure prise ; les lettres sur les cubes et tout le texte des écrans sont plus fiables en incrustation CapCut qu'en génération.

---

## 3. Cohérence visuelle entre les scènes

- **Un seul monde** : le même plateau sombre quadrillé d'or, cerclé d'un filet doré, dans tous les plans ; la caméra se déplace, le décor ne change pas (sauf scène 6, fond chocolat demandé).
- **Caméra** : isométrique orthographique, élévation 32°, azimut 45° ± 6° ; mouvements lents (ease in-out), jamais de rotation rapide.
- **Lumière** : clé chaude haut-gauche, ombres douces vers le bas-droite, même intensité partout ; pas de néon ni de lens flare.
- **Matières** : noir mat (mobilier, écrans), noyer chocolat (bureaux), or brossé (cubes, flèche, filets, anneaux), pierre sombre quadrillée d'or (sol), écrans d'interface sombres #14110F avec texte blanc cassé.
- **Or = la méthode** : seuls les éléments CARRÉ sont dorés (cubes, flèche, pastilles, surlignages). Un seul accent doré par plan dans le texte.
- **Personnages** : adultes, proportions réalistes, tenues sobres (noir, chocolat, beige) ; l'assistant IA est un androïde élégant, jamais un robot jouet.
- **Typographie** (style de la référence) : titres Archivo Black blancs, centrés, très gros ; surtitre Plus Jakarta Sans ExtraBold en capitales espacées dorées ; mot-clé en doré ; logotype en Sora ExtraBold.
- **Zones sûres Instagram** : rien d'écrit au-dessus de 168 px ni sous 1330 px ; titres entre 230 et 560 px ; sous-titres vers 1196 px.

---

## 4. Voix off chronométrée

Voix féminine française (synthèse locale Kokoro « Siwis », vitesse 1,05). Le texte de la cliente est conservé ; la ligne de la scène 5 reprend son texte écran pour éviter 6 s sans voix.

| Début | Fin | Texte |
| --- | --- | --- |
| 0,30 | 3,37 | Tu utilises ChatGPT, mais tes réponses sont trop vagues ? |
| 4,20 | 5,31 | Essaie la méthode CARRÉ ! |
| 7,10 | 8,97 | Contexte : explique ta situation. |
| 9,10 | 10,66 | Action : précise ta demande. |
| 11,05 | 12,83 | Rôle : donne une expertise à ton IA. |
| 13,05 | 14,78 | Résultat : décris ce que tu attends. |
| 15,00 | 17,02 | Exemple : montre-lui ce que tu souhaites. |
| 18,10 | 21,30 | Cinq éléments pour structurer tes prompts et mieux guider ton IA. |
| 24,15 | 26,58 | Structure tes prompts. Améliore tes résultats. *(ajout)* |
| 28,05 | 29,07 | RILI SUCCESS. |

Pour l'enregistrer toi-même ou avec une autre voix (ElevenLabs, CapCut « Texte en voix ») : garde ces débuts de phrase, le montage est calé dessus. Avec un nouvel enregistrement, remplace `assets/audio/voiceover.wav` (même minutage) ou envoie-le-moi pour recaler.

---

## 5. Textes à afficher

| Temps | Texte |
| --- | --- |
| 0–3,9 s | Tu n'obtiens pas **les bonnes réponses** avec ChatGPT ? |
| 4,1–6,9 s | Découvre la méthode **C A R R É** |
| 7–9 s | C — CONTEXTE · Explique ta situation. |
| 9–11 s | A — ACTION · Précise ce que tu veux. |
| 11–13 s | R — RÔLE · Donne un rôle à ton IA. |
| 13–15 s | R — RÉSULTAT · Décris le résultat attendu. |
| 15–17 s | É — EXEMPLE · Montre-lui un exemple. |
| 17,7–24 s (écran) | **[R]** Tu es un expert en marketing digital. **[C]** Je lance un compte Instagram sur l'IA. **[A]** Crée un calendrier de contenu de 7 jours **[R]** sous forme de tableau, avec des exemples de publications dans un style pédagogique et professionnel. **[É]** Voici un exemple du ton souhaité… |
| 24–27 s | Structure tes prompts. Améliore tes **résultats**. |
| 24–27 s (écrans) | Demande vague · « Écris un post sur l'IA. » · ✕ Générique, peu utile — Méthode CARRÉ · tableau Lun→Dim · ✓ Précis, prêt à publier |
| 27–30 s | **RILI SUCCESS** · L'IA devient plus simple quand tu sais l'utiliser. |

Sous-titres : incrustés dans la vidéo (groupes de 2 à 5 mots, Plus Jakarta Sans ExtraBold 48 px, blanc cassé sur bande chocolat).

---

## 6. Montage CapCut

La vidéo `methode-carre-reel.mp4` est déjà montée et mixée : tu peux la publier telle quelle. Pour la retoucher ou remonter une version Kling/Runway :

1. **Projet** : Nouveau projet → format 9:16, 1080 × 1920, 30 i/s.
2. **Vidéo** : importe `methode-carre-reel.mp4` (ou tes plans générés dans l'ordre du storyboard, coupés aux temps du §1 : 4 s · 3 s · 5 × 2 s · 7 s · 3 s · 3 s).
3. **Transitions** (seulement pour des plans générés) : « Fondu » 0,2 s entre 1→2 ; « Glisser à gauche » 0,3 s entre les stations 3a→3e ; « Zoom avant » 0,3 s entre 3e→4 ; « Volet » diagonal 0,5 s entre 5→6.
4. **Voix** : piste audio `voiceover.wav` au début (0 s). Volume 100 %. Réduction de bruit : désactivée.
5. **Musique** : `music.wav` (déjà baissée sous la voix) à 50 %, ou une piste de la bibliothèque CapCut « Corporate / Tech » ~120 BPM à 15–20 % avec « Atténuation automatique » activée. Fondu sortant 0,8 s.
6. **Texte** : si tu remontes des plans générés, ajoute les textes du §5 (police proche : « Archivo Black » ou « Montserrat Black », 80–90, centré, blanc #F8F5EF, mot-clé en #C9A96A ; surtitre en capitales espacées dorées). Animation d'entrée « Remontée » 0,4 s.
7. **Sous-titres** : Texte → Sous-titres automatiques → Français ; style : police grasse, blanc #F8F5EF, fond #1E140E à 90 % avec contour doré fin, position à 62 % de la hauteur ; corrige « Tchatte GPT » → « ChatGPT » et « IA ».
8. **Effets sonores** (pour des plans générés) : Audio → Effets → « Whoosh » sur chaque changement de station, « Pop » sur les cubes, « Clavier » à 0,5 s et 17,8 s.
9. **Couleur** : pas de filtre sur la vidéo HyperFrames. Sur des plans générés : Ajuster → Température +5, Saturation −5, Vignette 10.
10. **Export** : 1080p, 30 i/s, débit « Recommandé », puis publie avec la couverture du §7.

---

## 7. Couverture Instagram

`renders/couverture-instagram.png` (1080 × 1920) — rendue avec Remotion (`../methode-carre-cover`, commande `npx remotion still CoverStill out/couverture-instagram.png`) à partir d'une image du film :
fond noir (style de ta référence) · « TUTO IA POUR DÉBUTANTS » · « La méthode » · 5 tuiles dorées **C A R R É** · « en **30 secondes** » · l'écran géant du film avec les 5 cubes · signature RILI SUCCESS.
Le titre tient dans le recadrage 3:4 de la grille du profil (zone 240–1680 px). Une version animée de 1,5 s existe aussi (`CoverAnimated`).

---

## 8. Légende Instagram + hashtags

> **La méthode CARRÉ en 30 secondes** 🟫
>
> Tu poses une question à ChatGPT et la réponse est trop vague ? Le problème n'est pas l'IA : c'est le prompt.
>
> Structure-le en 5 blocs :
> 🟨 **C** — Contexte : explique ta situation
> 🟨 **A** — Action : précise ce que tu veux
> 🟨 **R** — Rôle : donne une expertise à ton IA
> 🟨 **R** — Résultat : décris le format attendu
> 🟨 **É** — Exemple : montre-lui le ton souhaité
>
> 💾 Enregistre ce Reel pour ton prochain prompt.
> 💬 Écris « CARRÉ » en commentaire et je t'envoie un modèle prêt à copier.
>
> **RILI SUCCESS** — Apprends l'IA. Développe tes compétences. Passe à l'action.
>
> #intelligenceartificielle #ia #chatgpt #prompt #promptengineering #methodecarre #chatgptfrance #iafrance #outilsia #productivite #businessdigital #formationia #apprendrelia #automatisation #entrepreneur #astucesia #marketingdigital #rilisuccess

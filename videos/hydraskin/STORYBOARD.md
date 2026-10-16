---
format: 1080x1920
duration: 78s
message: "HydraSkin associe la technologie d'une machine professionnelle, des produits choisis et des gestes manuels dans un soin complet qui s'adapte à chaque peau."
arc: Accroche → Principe → Technologie en action → Personnalisation → Expérience → Signature
audience: clientes et futures clientes de l'institut (Instagram, TikTok)
mode: collaborative
sketch: storyboard.html
version: v2
---

# HydraSkin — storyboard v2

## Changes from v1

- Palette remplacée par « Bordeaux & Beige » (demande de la cliente) : « modifier uniquement la palette et l'identité chromatique ». Scénario, contenus, textes, voix off et animations inchangés. Le bleu très pâle des repères techniques est supprimé, ces repères passent en bordeaux lie-de-vin.

## Locked

- Plan v2 validé par la cliente (scénario, textes, voix off, transitions, palette Bordeaux & Beige).
- Images : clips vidéo IA pour les gestes, images fixes en complément seulement si nécessaire.
- Voix : synthèse féminine, douce, naturelle, professionnelle.
- Écran final : AMANI SKIN ; coordonnées uniquement celles fournies par la cliente.

## Still open

- Validation de la planche de croquis (`storyboard.html`).
- (réglé) Coordonnées confirmées : @amani__skin · 07 66 85 43 74.
- Accès à un service de génération (images et clips) et de voix.

## Décisions

- **Message** : HydraSkin, c'est la technologie, des produits choisis et des gestes manuels, réunis dans un soin qui s'adapte à chaque peau.
- **Public et arc** : clientes et futures clientes. Accroche sensorielle → principe en 4 étapes → la machine et le geste → la personnalisation (séquence essentielle) → l'expérience premium → signature et appel à l'action.
- **Format** : 1080×1920, 30 i/s, environ 78 s, voix off française et musique instrumentale discrète. Pas de sous-titres intégraux : les textes à l'écran complètent la voix.
- **Zone utile** : textes entre y = 240 et y = 1500, x = 72 à 940. Hors de cette zone, l'interface Reels/TikTok recouvre l'image (en-tête, description, boutons à droite).
- **Fil conducteur (spine)** : deux devices.
  1. **La lame de verre**, une seule plaque de verre dépoli qui traverse le film. Elle révèle le titre, devient la carte d'étape, se réduit en puce pendant l'action, se dédouble en trois feuillets pour la personnalisation, puis revient exactement à sa place d'origine pour la signature (rappel de la scène 1).
  2. **Le rail du protocole**, un filet vertical très fin à gauche. Il porte 4 points en scène 2 (les étapes machine) et 3 points de plus en scène 5 (produits, masque, massage). Complet à 65 s, il montre que le soin est un tout.
- **Plan maintenu** : scène 4, 34,0 → 37,0 s. « Chaque peau a ses besoins. » reste seul à l'écran, sans mouvement à part la respiration de l'image.
- **Direction des transitions** : une seule règle, de bas en haut. La lame de verre entre par le bas et sort par le haut, et l'image suivante se révèle derrière elle.

## Direction artistique

- **Univers** : campagne de skincare de luxe éclairée en lumière du jour diffuse. Peau réelle avec son grain (non lissée), cabine épurée en beige lin et ivoire crème, textures en macro, une texture douce (grain léger) sur les aplats beige lin. Les images restent au premier plan. Le motion design structure le film et explique, le verre signe le style.
- **Palette — Bordeaux & Beige** (`frame.md`) : beige lin `#D8C5B2`, couleur dominante des fonds et des panneaux · ivoire crème `#F7F2EB`, lumière, espaces et éléments doux · bordeaux lie-de-vin `#642D3D`, couleur signature, titres secondaires et accents graphiques (rail, numéros, filets, annotations) · bordeaux profond `#40232C`, textes importants et contrastes. Luxe discret et chaleureux : ni rouge vif, ni rose bonbon, ni dorure.
- **Typographie** :
  - Jost 300/400/500, sans-sérif géométrique, contemporaine et très lisible : étapes, mots-clés, légendes, CTA.
  - Instrument Serif, éditoriale : seulement « HydraSkin » et deux phrases-clés.
  - La tension entre les deux a un sens : Jost porte la technologie, Instrument Serif porte le geste.
  - Tailles minimales : titre 200 px, phrases 96 px, étapes 64 px, texte 40 px, étiquettes 26 px.
- **Glassmorphism, le système** :
  - Remplissage dégradé ivoire crème → beige lin (`#F7F2EB` à 48 % → `#D8C5B2` à 26 %), flou d'arrière-plan 22 px, saturation 112 %.
  - Bord ivoire crème 1,5 px à 70 %, liseré intérieur lumineux en haut, ombre douce teintée bordeaux profond (`#40232C` à 18 %), rayon de 34 px.
  - **Un seul reflet** par apparition : une bande diagonale qui traverse la surface une fois, puis s'arrête.
  - **Révélation** : le verre ne « glisse » pas comme une carte. Il se dépolit sur place, le flou montant de 0 à 22 px pendant que l'opacité suit, comme une buée qui se forme, puis le texte se pose dessus.
  - **Disparition** : le flou retombe et l'image redevient nette dessous.
  - **Profondeur** : photo (push-in lent 1,00 → 1,06) · verre (parallaxe à environ 60 % du mouvement de la photo) · texte et filets, nets.
  - **Ponctuel** : au plus une plaque principale et une puce à la fois. Le verre ne couvre jamais un visage, des mains ou la zone de contact de l'appareil.
- **Motion design** :
  - Filets de 1,5 px qui se tracent (`svg-path-draw`), annotations reliées au geste par un trait fin et un point.
  - Mise au point sélective (`depth-of-field-blur`) pour rendre le texte lisible sans cacher l'image.
  - Push-in de caméra lents (`multi-phase-camera`).
  - Chaque mouvement explique, guide le regard ou met une information en valeur.
- **Son** :
  - Musique instrumentale contemporaine et discrète (piano feutré, nappes chaudes, environ 70 BPM), creusée sous la voix.
  - Deux marques sonores seulement : un « tink » de verre très doux sur les deux apparitions de « HydraSkin », et un souffle d'air à peine audible sur les trois transitions de lame.

## Transitions (carte des coutures)

| Couture | Temps | Transition | Motivation |
| --- | --- | --- | --- |
| 1 → 2 | 7,2–8,4 s | **Lame de verre** : la plaque du titre s'étire sur tout l'écran et monte. L'image suivante se révèle nette derrière son bord inférieur. | Le verre « emporte » l'accroche et ouvre l'explication. |
| 2 → 3 | 19,4–20,4 s | **Carte → puce** (`card-morph-anchor`) : la carte d'étape se rétracte en puce en haut à gauche, la photo de la machine cède la place au premier geste (fondu, 0,6 s). | On passe du principe à l'action sans perdre le repère d'étape. |
| 3 → 4 | 31,4–33,0 s | **Mise au point qui s'ouvre** : l'image se défocalise en un flou crémeux, un voile beige lin monte. | L'attention quitte la machine pour la personne. |
| 4 → 5 | 45,4–46,6 s | **Feuillets qui s'écartent** : les trois feuillets de verre glissent vers le haut, chacun à sa vitesse, et dévoilent la texture produit. | Le soin adapté se « déplie » en expérience. |
| 5 → 6 | 64,4–65,8 s | **Fondu lumineux** vers une image très claire. La lame de verre remonte à sa place de la scène 1. | Rappel : la boucle se referme sur la signature. |

À l'intérieur des scènes : fondus enchaînés de 0,5 à 0,7 s motivés par le mouvement (le geste continue d'un plan à l'autre). Ni flash, ni zoom brusque, ni volet de banque d'effets.

## Interdits (propres à cette vidéo)

- Aucune marque tierce, aucun logo ni écran de marque sur la machine. Aucun nom d'ingrédient, de technologie brevetée ou de chiffre technique.
- Pas d'avant/après, pas de « résultats », pas de vocabulaire médical (« traitement », « patiente », « pores dilatés soignés »…).
- Pas de grille de cartes identiques, pas de verre sur un visage, pas de reflet en boucle, pas d'irisation, pas de néon.
- Deux échecs de mouvement à éviter : **le diaporama**, où chaque plan devient une carte nouvelle sans continuité (d'où le rail et la lame qui persistent), et **l'économiseur d'écran**, des dérives décoratives qui ne disent rien.

## Vérifications de cohérence et de lisibilité (v2)

- **Fidélité au protocole** : les étapes affichées et dites sont exactement celles fournies (nettoyer, exfolier, extraire les impuretés, hydrater, plus produits premium, masques dont modelants selon les besoins, massage du visage). Rien n'est ajouté. « Diagnostic » n'est pas présenté comme une étape : la voix dit seulement que le soin s'adapte au type de peau, à son état et aux préoccupations.
- **Personnalisation** : la formule « s'adapte à votre peau, et non l'inverse » et la mention « selon les besoins » sur le masque évitent de laisser croire à un protocole identique pour toutes.
- **Allégations** : aucune promesse de résultat. Les seuls bénéfices évoqués sont l'expérience (« un vrai moment de détente ») et le fait que le soin soit complet et adapté.
- **Lisibilité verticale** :
  - Chaque texte reste au moins 2,5 s à l'écran pour 6 mots au plus, et au moins 3 s pour une phrase.
  - Contraste : bordeaux profond `#40232C` sur verre beige lin et ivoire crème au-dessus d'images claires (contraste 8,4:1 sur beige lin, 12,6:1 sur ivoire crème) ; bordeaux lie-de-vin `#642D3D` réservé aux titres secondaires et étiquettes (6,3:1 sur beige lin, 9,5:1 sur ivoire crème). Un voile ivoire crème est ajouté sous le verre si une image est trop contrastée. Contrôle WCAG AA par `hyperframes check`.
  - Tout le texte est dans la zone utile.
- **Images générées par IA** :
  - Machine générique sans logo, mains et peau réalistes, sans avant/après.
  - En France, la loi du 9 juin 2023 sur l'influence commerciale impose la mention « Image virtuelle » sur les visages et silhouettes générés par IA dans une communication commerciale diffusée par un influenceur. Par prudence, une mention discrète « Images virtuelles » est prévue sur l'écran final tant que les images générées ne sont pas remplacées par de vrais plans. À faire valider de votre côté : ce n'est pas un avis juridique.
  - Les conditions d'utilisation commerciale du service de génération sont aussi à vérifier.

## Frame 1 — Accroche

- scene: Macro de peau en lumière du jour, puis texture de sérum ; une plaque de verre se dépolit au centre et « HydraSkin » s'y révèle.
- duration: 8s
- poster: 6.2
- transition_in: fade-from-cream
- status: animated
- src: compositions/f1-accroche.html
- voiceover: "HydraSkin. Un soin du visage complet, où la technologie rencontre le geste."
- blueprint: titlecard-reveal (adapté) + rules depth-of-field-blur, multi-phase-camera ; registre text-shimmer (une passe)

**0,0–3,2 s · IMG-01, macro de peau.** Joue en lumière latérale douce, grain réel. Mise au point qui se fait (flou 14 px → 0) et push-in lent de 1,00 à 1,05. Musique seule, aucun texte : on regarde la peau.

**3,2–8,0 s · IMG-02, goutte de sérum translucide** qui roule lentement sur une surface de verre ivoire crème (fondu de 0,7 s, la goutte continue le mouvement de la lumière).

- 3,4 s : la plaque de verre (720 × 520, centrée, y ≈ 760) se dépolit sur place, avec un « tink » doux.
- 3,6 s : « HydraSkin » (Instrument Serif, 210 px, bordeaux profond `#40232C`) se pose, lettres qui montent de 24 px avec un léger fondu (power3.out, 1,0 s). Un seul reflet traverse ensuite la plaque (1,2 s).
- 5,0 s : en dessous, « La technologie au service de votre peau. » (Jost 300, 42 px), qui apparaît par un masque de bas en haut.
- 3,0–8,0 s : un filet fin de 220 px se trace sous le titre.

**Voix** : « HydraSkin. » à 3,6 s (l'apparition tombe sur le mot), puis « Un soin du visage complet, où la technologie rencontre le geste. » de 4,6 à 7,6 s.

**Couture sortante** : lame de verre vers le haut (7,2–8,4 s).

**Pourquoi** : la qualité et la précision se lisent avant toute explication. Le nom arrive porté par l'image.

**Interdit** : pas de logo animé tape-à-l'œil, pas de lettres qui rebondissent.

## Frame 2 — Le principe

- scene: Cabine et machine floutées en profondeur ; le rail du protocole se trace à gauche ; une seule carte de verre présente tour à tour les 4 étapes avec un petit schéma au trait.
- duration: 12s
- poster: 17.0
- transition_in: glass-blade-up
- status: animated
- src: compositions/f2-principe.html
- voiceover: "Le principe : quatre étapes, réalisées avec une machine professionnelle de soin de la peau. Nettoyer. Exfolier. Extraire les impuretés. Hydrater."
- blueprint: fixed-anchor-cycle (une carte fixe dont le contenu change) + rules svg-path-draw, depth-of-field-blur

**8,0–20,0 s · IMG-08, la machine professionnelle dans la cabine**, plan moyen, sans aucun logo. Pendant le texte, l'image passe à un flou de 10 px avec un voile beige lin de 22 %, pour que la carte reste lisible et la machine identifiable.

- 8,6 s : étiquette « LE PROTOCOLE » (Jost 500, 26 px, capitales, +0,18 em, bordeaux lie-de-vin) en haut à gauche, y = 300.
- 8,8–10,4 s : le **rail** se trace verticalement (x = 120, y = 560 → 1380), avec 4 points vides.
- 13,8 s : la **carte d'étape** (x = 200 → 940, y ≈ 820, 740 × 420) se dépolit. Elle contient :
  - le numéro (Jost 300, 30 px, bordeaux lie-de-vin) ;
  - le verbe (Jost 400, 72 px, bordeaux profond) ;
  - un petit schéma au trait de 1,5 px, en bordeaux lie-de-vin à 70 %, en bas de la carte.
- Le contenu change sur le mot dit, avec un fondu croisé vertical de 0,4 s :

| Temps | Carte | Schéma au trait (symbolique, non scientifique) |
| --- | --- | --- |
| 13,8 s | « 01 — Nettoyer » | une ligne de surface ondulée qui se lisse de gauche à droite |
| 15,0 s | « 02 — Exfolier » | de fins grains sur la ligne qui s'éclaircissent au passage d'un trait |
| 16,2 s | « 03 — Extraire » + « les impuretés » (Jost 300, 40 px) | quelques points qui quittent la ligne vers le haut et disparaissent |
| 17,8 s | « 04 — Hydrater » | une goutte au trait qui se remplit doucement d'un lavis beige lin |

- À chaque étape, le point correspondant du rail se remplit (bordeaux lie-de-vin) et son libellé s'inscrit à côté (Jost 400, 30 px) : « Nettoyer », « Exfolier », « Extraire », « Hydrater ».
- À 19,0 s, les quatre libellés sont visibles sur le rail : on a la vue d'ensemble.

**Couture sortante** : la carte se rétracte en puce en haut à gauche (19,4–20,4 s).

**Pourquoi** : rendre le processus compréhensible en 12 s, sans le déformer. Une seule plaque de verre, et un rail qui accumule les étapes au lieu de les faire défiler.

**Interdit** : pas de coupe de peau en 3D ni de flèches pseudo-médicales, pas de quatre cartes en grille.

## Frame 3 — La technologie en action

- scene: Quatre gros plans de gestes réels (nettoyage, exfoliation, extraction, hydratation) ; une puce de verre indique l'étape ; trois annotations au trait fin pointent le geste.
- duration: 12s
- poster: 27.5
- transition_in: card-to-chip
- status: animated
- src: compositions/f3-technologie.html
- voiceover: "Pendant le soin, la machine accompagne chaque étape. Le geste, lui, reste précis et attentif, zone après zone."
- blueprint: rules viewport-change (push-in vers le point de contact), svg-path-draw (annotations), card-morph-anchor (puce), depth-of-field-blur

**Plans** (chacun avec un push-in lent vers le point de contact, et un léger flou de bougé au fondu, 0,5 s) :

| Temps | Image | Puce (verre, 999 px de rayon, y = 270) | Annotation au trait (point sur le geste → filet → libellé Jost 400, 32 px) |
| --- | --- | --- | --- |
| 20,0–23,0 s | IMG-04, nettoyage, mains de l'esthéticienne sur le visage | « 01 · Nettoyer » | aucune (la puce suffit) |
| 23,0–26,0 s | IMG-05, exfoliation, pièce à main sur le front | « 02 · Exfolier » | « Précision » |
| 26,0–29,0 s | IMG-06, extraction, pièce à main sur l'aile du nez | « 03 · Extraire » | « Chaque zone du visage » |
| 29,0–32,0 s | IMG-07, hydratation, pièce à main sur la joue | « 04 · Hydrater » | « Technologie professionnelle » |

- La puce contient un mini-rail de 4 points qui progresse. Son texte change par fondu vertical de 0,35 s.
- Chaque annotation se trace en 0,6 s, reste 1,8 s, puis se rétracte. Elle n'est jamais posée sur le visage : elle part du point de contact et sort vers l'espace libre.

**Voix** : 20,6–28,0 s. De 28 à 32 s, la musique respire.

**Couture sortante** : la mise au point s'ouvre (31,4–33,0 s).

**Pourquoi** : montrer la machine et le geste réels. Les annotations désignent l'action au lieu de la décorer.

**Interdit** : pas de cadres de « détection » façon IA, pas de lignes lumineuses, pas d'annotation sur chaque plan.

## Frame 4 — Un soin personnalisé

- scene: Plan maintenu sur fond crémeux « Chaque peau a ses besoins. », puis l'esthéticienne observe la peau ; trois feuillets de verre en profondeur portent les critères ; ils s'alignent en « Le soin s'adapte à votre peau. »
- duration: 14s
- poster: 41.0
- transition_in: focus-pull
- status: animated
- src: compositions/f4-personnalise.html
- voiceover: "Car chaque peau a ses besoins. Son type, son état, ce qui vous préoccupe… Le soin s'adapte à votre peau, et non l'inverse."
- blueprint: kinetic-type-beats (phrase posée) + registre camera-rig-depth-stack (trois feuillets en profondeur, parallaxe et mise au point) + rule depth-of-field-blur

**32,0–37,0 s · fond, IMG-07 défocalisé** (flou 28 px), voile beige lin de 55 %, avec la texture douce.

- 33,2 s : « Chaque peau a ses besoins. » (Instrument Serif, 104 px, deux lignes, calé à gauche, x = 72, y ≈ 820) apparaît mot à mot en fondu doux (0,9 s, power2.out).
- **34,0–37,0 s : PLAN MAINTENU**, rien ne bouge.

**37,0–46,0 s · IMG-09, l'esthéticienne effleure la joue de la cliente en l'observant, échange de regards.** Mise au point qui se fait (37,0–38,0 s), push-in 1,00 → 1,04.

- **Trois feuillets de verre** (560 × 130, rayon 34, à droite et en bas, en diagonale, sans toucher les visages), à trois profondeurs différentes (parallaxe 40, 60 et 80 %). Chaque libellé est en Jost 400, 40 px :
  - 37,4 s : « Type de peau »
  - 38,6 s : « État de la peau »
  - 39,8 s : « Vos préoccupations »
- 42,0 s : les trois feuillets s'alignent en une seule pile nette (mise au point sur le premier plan), et la phrase « Le soin s'adapte à votre peau. » apparaît dessous : Jost 400 et 64 px, avec « votre peau » en Instrument Serif italique.
- 43,4 s : une étiquette discrète apparaît, « PROTOCOLE ADAPTÉ SELON LES BESOINS IDENTIFIÉS » (Jost 500, 24 px, bordeaux lie-de-vin).

**Voix** : 33,2–35,4 s, puis 37,2–41,6 s, puis 42,0–45,4 s.

**Couture sortante** : les feuillets s'écartent vers le haut (45,4–46,6 s).

**Pourquoi** : c'est la séquence essentielle. Elle montre que le soin part de la peau de chaque cliente, sans laisser croire à un protocole automatique.

**Interdit** : pas de « test de peau » ni d'appareil de diagnostic inventé, pas de jauges, pas de pourcentages.

## Frame 5 — L'expérience premium

- scene: Textures de produits, masque modelant, massage du visage en gros plans ; petites étiquettes de verre ; le rail du protocole se complète ; trois mots s'alignent : Technologie · Produits · Gestes.
- duration: 19s
- poster: 62.5
- transition_in: glass-sheets-part
- status: animated
- src: compositions/f5-experience.html
- voiceover: "Viennent ensuite les produits : des cosmétiques de qualité premium, choisis selon vos besoins. Un masque, modelant lorsque votre peau en a besoin. Puis un massage du visage, pour un vrai moment de détente. La technologie, des produits choisis, des gestes manuels : c'est cette alliance qui fait HydraSkin."
- blueprint: rules multi-phase-camera (gros plans), ambient-glow-bloom (reflet unique sur la texture), svg-path-draw (rail qui se complète) ; registre light-sweep-pass (une passe de lumière sur le dernier plan)

**Plans** (images au premier plan ; le verre ne sert qu'aux étiquettes) :

| Temps | Image | Étiquette (puce de verre en bas à gauche, y ≈ 1380, Jost 400, 34 px) | Rail |
| --- | --- | --- | --- |
| 46,0–50,6 s | IMG-10, textures produits en macro : crème travaillée au doigt, flacons sans étiquette | « Produits premium » (47,0 s) | point 5 |
| 50,6–54,8 s | IMG-11, application du masque modelant au pinceau ou à la spatule | « Masque modelant · selon les besoins » (51,6 s) | point 6 |
| 54,8–60,0 s | IMG-13, massage du visage, mains sur les pommettes et le contour | « Massage du visage » (55,6 s) | point 7 |
| 60,0–65,0 s | IMG-14, visage détendu, yeux clos, lumière douce (sans avant/après) | barre de verre : « Technologie · Produits · Gestes » | complet |

- Le rail réapparaît fin à gauche (x = 72, plus discret qu'en scène 2), avec ses 4 premiers points déjà pleins. Il ajoute un point à chaque étiquette.
- 60,2, 61,4 et 62,4 s : sur la voix, les trois mots s'inscrivent un par un sur une seule barre de verre (840 × 140, y ≈ 1240), séparés par des filets fins. Les trois mots sont en bordeaux profond, les filets en bordeaux lie-de-vin.
- 62,8 s : une seule passe de lumière traverse le dernier plan.

**Voix** : 46,6–51,0 s, puis 51,4–54,6 s, puis 55,2–59,6 s, puis 60,0–64,6 s.

**Couture sortante** : fondu lumineux, et la lame remonte (64,4–65,8 s).

**Pourquoi** : le confort, la qualité et l'expertise se montrent par l'image. La barre finale dit la complémentarité, qui est le message du film.

**Interdit** : aucun nom de produit ni d'ingrédient, pas de packshot de marque, pas de pétales ou de bulles décoratives.

## Frame 6 — Signature

- scene: Image très claire et épurée ; la plaque de verre revient à sa place de la scène 1 ; « HydraSkin », la signature, l'appel à l'action, puis l'emplacement logo, nom et coordonnées de l'institut.
- duration: 13s
- poster: 75.0
- transition_in: luminous-fade
- status: animated
- src: compositions/f6-signature.html
- voiceover: "HydraSkin. Un soin expert, pensé pour votre peau. Découvrez votre prochain rituel de soin."
- blueprint: titlecard-reveal + logo-assemble-lockup (verrouillage final) ; registre text-shimmer (une passe)

**65,0–78,0 s · IMG-15, cabine ivoire crème et beige lin baignée de lumière** (serviette pliée, flacon sans étiquette, plante, tout en flou doux), voile ivoire crème de 30 %.

- 65,8 s : la plaque de verre se dépolit **à la même position et à la même taille qu'en scène 1** (rappel de la scène 1).
- 66,2 s : « HydraSkin » (Instrument Serif, 210 px), avec un « tink » et une seule passe de reflet.
- 67,4 s : « Un soin expert, pensé pour votre peau. » (Jost 300, 42 px).
- 71,0 s : la plaque remonte de 200 px (nudge, 0,9 s) pour faire de la place. Une puce de verre apparaît dessous : « Découvrez votre prochain rituel de soin. » (Jost 400, 36 px).
- 73,4 s : **emplacement de l'institut**, en bas de la zone utile (y ≈ 1240 → 1480) :
  - logo (hauteur 90 px), avec un filet fin au-dessus ;
  - nom de l'institut (Jost 500, 30 px, capitales, +0,18 em) ;
  - Instagram · téléphone (Jost 400, 30 px).
  - Par défaut, à confirmer : AMANI SKIN ; coordonnées : uniquement celles fournies par la cliente.
- 74,0 s : mention « Images virtuelles » (Jost 400, 22 px, bordeaux lie-de-vin), en bas à gauche dans la zone utile, tant que des images générées sont utilisées.
- 74,0–77,4 s : tout reste tenu, l'image respire à peine. De 77,4 à 78,0 s, fondu vers l'ivoire crème.

**Voix** : « HydraSkin. » à 66,2 s, puis 67,4–70,4 s et 71,0–73,6 s.

**Pourquoi** : finir sur la signature et une invitation sobre, en laissant le temps de lire les coordonnées.

**Interdit** : pas de bouton « Réservez maintenant » clignotant, pas d'écran final figé sans respiration, pas de surcharge d'informations.

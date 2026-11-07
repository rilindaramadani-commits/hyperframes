GOAL:    le débutant se dit « ok, je peux le faire » et enregistre le post pour tester la formule.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps (vidéo) · 1080 x 1350 PNG x5 (carrousel, projet ../ia-facile-carrousel)
TIME:    34 s x 30 = 1020 frames. Pas de musique intégrée (ajoutée dans l'appli), SFX seuls.
LOOK:    médium = une appli de messagerie posée sur un aplat.
         ground #FFE24A plat (S3 : #2B44FF plein) · ink #121212 · paper #FFFFFF · accent IA #2B44FF
         (bulles de l'IA, bloc FACILE, CTA uniquement).
         Marqueurs de la formule : RÔLE #2B44FF / TÂCHE #FF5B3A / CONTEXTE #1FC48A / FORMAT #FF7CC6,
         surlignage en teinte claire (#C9D0FF #FFD0C4 #BDF0DA #FFD3EC).
         Display : Archivo Black, capitales, 104-118 px titres, 300 px « L'IA », tracking -1 %.
         Body : Poppins 600, 42-46 px, interlignage 1.28.
         Bulles : bord 5 px ink, rayon 36 px (coin de la queue 8 px), ombre dure 12/12 px ink 100 %.
OBJECTS: bulle utilisateur (blanche, à droite), bulle IA (cobalt, à gauche), indicateur « … »,
         barre de saisie avec bouton d'envoi, cases à cocher, icônes trait 6 px (enveloppe, page, ampoule).
MOTION:  arrivée bulle : scale 0.6→1 depuis la queue, back.out(1.2) 0.45 s (amortissement ~0.8) ·
         titres : par mot, blur 6→0 + opacity, 0.13 s, 0.07 s d'écart · sortie : power3.in 0.4 s ·
         swipe : x 0→-1080 + blur 12 px power3.in 0.4 s, entrée x 360→0 expo.out 0.55 s.
SHOTS:   S1 0-4.5   Couverture : « L'IA / FACILE » à l'image dès la frame 0, bulle IA 0.5 s, accroche 1.3 s ;
                    sort en défilant vers le haut (fil de discussion). pop / whoosh.
         S2 4.5-12  « C'est quoi, l'IA ? » : question tapée puis envoyée, « … », réponse mot à mot,
                    « tu écris comme tu parles » ; la bulle IA grossit jusqu'à remplir l'écran (cobalt).
         S3 12-19.5 Fond cobalt : 3 usages en liste verticale (Écrire / Résumer / Trouver des idées) ;
                    sort en swipe vers la gauche.
         S4 19.5-27.5 « La formule du bon prompt » : 4 étiquettes, prompt tapé puis envoyé,
                    chaque morceau surligné dans la couleur de son étiquette ; swipe.
         S5 27.5-34 « Ton défi du jour » : 3 cases cochées, rappel « vérifie », CTA « Enregistre » (riser→impact).
BANNED:  fond sombre/void, glow, dégradés violet/bleu, glassmorphism, crème + serif, pastilles « 01/02 »,
         labels mono en capitales, trois cartes côte à côte, tout centré, tout qui fond-et-monte,
         texte qui bouge pendant la lecture, logo dans un coin, emoji (non rendus de façon fiable).
QA:      1.0 (couverture lisible), 8.5 (réponse IA complète), 11.6 (bulle plein écran), 17 (3 usages),
         25 (formule surlignée), 33 (CTA), coutures 4.5 / 12 / 19.5 / 27.5, rien de lisible sous 1330 px
         hors barre de saisie (décor).

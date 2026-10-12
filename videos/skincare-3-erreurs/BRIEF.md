---
workflow: general-video
flow: automation
storyboard: yes
message: "Une bonne skincare, ce n'est pas d'en faire plus : c'est de faire les bonnes choses, régulièrement."
destination: tiktok-reels-shorts
aspect: 1080x1920
language: fr
length: 57s
angle: listicle
---

## Intent

Vidéo éducative courte « 3 erreurs à ne surtout pas faire si tu veux réussir ta skincare ».
Ton expert mais accessible, moderne, dynamique, légèrement premium, pédagogique sans être
scolaire. 100 % 3D isométrique (labo cosmétique premium), animée dans HyperFrames.

## Assets

- Storyboard de production validé : https://claude.ai/code/artifact/4e320ad3-3abb-4169-bc1a-2a5152932673
  (17 plans, voix off, caméra, transitions, textes, sons).
- Voix off : voix française locale Kokoro (`ff_siwis`, via `hyperframes tts`) — la voix Everygen
  « Zara » n'était pas disponible (abonnement requis). Remplaçable par un autre fichier sans toucher
  au montage : un clip par plan dans `assets/audio/vo/`, puis `tools/build_plan.py` et `tools/align_words.py`.

## Customizations

- Direction validée en cours de production : rendu réaliste, élégant, épuré, premium, **sans personnages**
  (style pub cosmétique haut de gamme) ; la voix off porte l'experte.
- Fil rouge : table en travertin dans un studio, 3 plateaux ronds numérotés ; plongée dans chaque plateau.
- Bloc de peau stylisé (tuiles = barrière) réutilisé ; jauge de tolérance ; checklist du matin ;
  rayons UV + film SPF ; calendrier + sablier ; récap 1-2-3 ; phrase finale ; CTA « Enregistre ».
- Mots-clés à l'écran : « Plus ≠ mieux », « Le SPF, ce n'est pas une option. »,
  « La régularité > le changement permanent ».
- Sous-titres incrustés, musique 100–110 BPM, effets sonores discrets.

## Notes

- Aucune image médicale ou anxiogène ; pas de promesse de résultat.
- Vidéo réalisée uniquement avec HyperFrames (Three.js + GSAP), pas de génération vidéo IA.
- Option : logo AMANI SKIN discret sur le CTA final.

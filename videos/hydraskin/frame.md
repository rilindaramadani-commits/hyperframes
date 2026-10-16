---
name: HydraSkin — verre ivoire
colors:
  ivory: "#F6F1EA"        # fond, lumière des images
  offwhite: "#FBF8F3"     # verre (teinte de remplissage), cartes
  sand: "#E9DFD2"         # beige clair, plans de fond, filets secondaires
  nude: "#D8C1AD"         # tons nude, ombres chaudes, aplats de profondeur
  taupe: "#9C8B7D"        # taupe très doux : numéros, légendes, repères
  ink: "#352C26"          # texte principal (brun-taupe profond, jamais noir pur)
  ink-soft: "#5E5249"     # texte secondaire
  mist: "#CBD8DF"         # bleu très pâle : uniquement les repères « technologie » (scènes 2-3)
  accent: "#B4866D"       # nude rosé : point focal unique par plan (numéro d'étape actif, point du rail)
typography:
  display: { family: "Instrument Serif", weights: [400], style: "normal + italic", use: "HydraSkin, deux phrases-clés éditoriales" }
  sans: { family: "Jost", weights: [300, 400, 500], use: "tout le reste : étapes, mots-clés, légendes, CTA" }
  sizes: { hero: "200-230px", statement: "96-112px", step: "64-72px", body: "40-46px", label: "26-30px (500, +0.18em, capitales)" }
  tracking: { display: "-0.02em", labels: "+0.18em" }
glass:
  fill: "linear-gradient(160deg, rgba(251,248,243,0.46), rgba(246,241,234,0.22))"
  backdrop: "blur(22px) saturate(112%)"
  border: "1.5px solid rgba(255,255,255,0.62)"
  inner-highlight: "inset 0 1.5px 0 rgba(255,255,255,0.75)"
  shadow: "0 40px 80px -30px rgba(53,44,38,0.22)"
  radius: "34px (cartes) · 999px (puces) · 0 (lame de transition)"
  sheen: "bande diagonale blanche 0 → 0.35 → 0, une seule passe par apparition"
spacing:
  gutter: 72px
  safe-zone: "contenu texte entre y=240 et y=1500, x=72 à 940 (interface Reels/TikTok)"
motion:
  ease-in: "power3.out (entrées), expo.out (révélations de verre)"
  ease-out: "power2.in (sorties), sine.inOut (dérives, respirations)"
  durations: "entrées 0.7-1.1 s, révélation de verre 1.2-1.6 s, transitions 1.0-1.4 s"
  camera: "push-in lent 1.00 → 1.06 par plan, jamais de zoom brusque"
---

## Overview

Verre ivoire sur photographie réaliste et lumineuse. Le verre est un instrument de lecture, pas un décor :
il apparaît seulement quand une information doit être lue, puis se retire et rend l'image.

## Tension typographique

Jost (géométrique, précise) porte la technologie et le protocole. Instrument Serif (éditoriale, humaine)
porte le geste et la promesse. Elle n'apparaît que sur « HydraSkin » et sur deux phrases-clés.

## Composition Rules

- Trois plans de profondeur : photo (plan 0, push-in lent) · verre (plan 1, se déplace à ~60 % de la vitesse
  de la photo, ce qui crée la parallaxe) · texte et filets (plan 2, net, sur le verre).
- Au maximum un panneau de verre principal et une puce par plan. Jamais de grille de cartes identiques.
- Le verre ne couvre jamais le visage, les mains ou la zone de contact de l'appareil.
- Ancrage : texte calé à gauche (x = 72) ou en bas du tiers central, jamais centré-flottant, sauf au titre et à l'écran final.

## Do / Don't

- Do : flou léger qui laisse lire l'image, filets blancs 1.5 px, un seul reflet par apparition, ombres chaudes.
- Don't : verre opaque, contours lumineux, néon, irisation ou holographie, dégradé de texte, noir ou blanc purs,
  interface science-fiction, transitions de banque d'effets.

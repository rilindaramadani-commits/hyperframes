---
name: HydraSkin — Bordeaux & Beige, verre lin
colors:
  linen: "#D8C5B2"        # beige lin — couleur dominante des fonds et des panneaux
  cream: "#F7F2EB"        # ivoire crème — lumière, espaces, éléments doux, voiles
  bordeaux: "#642D3D"     # bordeaux lie-de-vin — couleur signature : titres secondaires, accents graphiques (rail, numéros, filets, annotations)
  bordeaux-deep: "#40232C" # bordeaux profond — textes importants et contrastes
  # Dérivés autorisés (opacités des quatre teintes, jamais de nouvelle teinte) :
  #   texte secondaire = bordeaux-deep à 78 % · filets = bordeaux à 70 % · ombres = bordeaux-deep à 18 %
typography:
  display: { family: "Instrument Serif", weights: [400], style: "normal + italic", use: "HydraSkin, deux phrases-clés éditoriales" }
  sans: { family: "Jost", weights: [300, 400, 500], use: "tout le reste : étapes, mots-clés, légendes, CTA" }
  sizes: { hero: "200-230px", statement: "96-112px", step: "64-72px", body: "40-46px", label: "26-30px (500, +0.18em, capitales)" }
  tracking: { display: "-0.02em", labels: "+0.18em" }
glass:
  fill: "linear-gradient(160deg, rgba(247,242,235,0.48), rgba(216,197,178,0.26))"
  backdrop: "blur(22px) saturate(108%)"
  border: "1.5px solid rgba(247,242,235,0.70)"
  inner-highlight: "inset 0 1.5px 0 rgba(247,242,235,0.85)"
  shadow: "0 40px 80px -30px rgba(64,35,44,0.18)"
  radius: "34px (cartes) · 999px (puces) · 0 (lame de transition)"
  sheen: "bande diagonale ivoire crème 0 → 0.35 → 0, une seule passe par apparition"
  texture: "grain doux 3-4 % sur les aplats beige lin (texture papier/lin, déterministe)"
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

Luxe discret, chaleureux et contemporain : verre beige lin et ivoire crème sur photographie réaliste et lumineuse, signé d'un bordeaux lie-de-vin. Le verre est un instrument de lecture, pas un décor :
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

- Do : flou léger qui laisse lire l'image, filets ivoire crème ou bordeaux 1.5 px, un seul reflet par apparition, ombres teintées bordeaux profond, textures douces.
- Don't : rouge vif, rose bonbon, dorures, verre opaque, contours lumineux, néon, irisation ou holographie, dégradé de texte, noir ou blanc purs,
  interface science-fiction, transitions de banque d'effets.

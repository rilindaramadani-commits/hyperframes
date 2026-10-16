---
message: "La Omra se vit étape par étape : ihram, Tawaf, prière, Sa‘i, cheveux — avec sincérité et recueillement."
audience: musulmans francophones qui préparent ou découvrent la Omra
mode: autonomous
canvas: 1080x1920
fps: 30
duration: 157
---

# Les étapes de la Omra — plan de production

Concept : **« le fil de lumière »** — un unique fil doré guide le regard d'étape en étape : il trace la
frontière du Miqat, tourne sept fois autour de la Kaaba, va et vient entre Safa et Marwa, puis revient
à la Kaaba. Fond commun nocturne (vert émeraude très sombre, halo doré, poussière de lumière) ; chaque
scène entre et sort par un fondu sur ce fond, ce qui donne un enchaînement continu et calme.

Typographie : Marcellus (titres, capitales romaines « gravées ») · Jost 300/400 (explications) ·
Amiri (arabe). Palette : nuit `#06110d`, émeraude `#0f3d2e` / `#1f7a5a`, ivoire `#f5efe2`, sable `#d9c7a3`,
or `#c9a45c` / `#e6c98a`.

Zones sûres TikTok/Reels : textes clés entre y = 200 et y = 1560, marge droite ≥ 120 px.

## Frame 1
- status: built
- src: compositions/s1-intro.html
- time: 0–12 s
- rules: ambient-glow-bloom, sine-wave-loop
- beat: Fond noir → la Kaaba (vue 3/4, ceinture dorée, porte) se révèle dans un halo doré, minarets en
  silhouette. Titre « La Omra : les étapes essentielles », sous-titre « Un guide pour accomplir ce voyage spirituel ».

## Frame 2
- status: built
- src: compositions/s2-ihram.html
- time: 12–42 s
- rules: svg-path-draw, discrete-text-sequence
- beat: Étape 1. Carte stylisée : La Mecque au centre, anneau des cinq Miqat ; un trait de lumière
  approche et s'illumine en franchissant le Miqat. Ihram + intention (Pilier) ; ne pas franchir le Miqat
  sans ihram (Obligation) ; tenues ; interdits. Puis la Talbiya phrase par phrase : arabe, translittération
  qui se compose, traduction française en sous-titre (Sunna, majorité).

## Frame 3
- status: built
- src: compositions/s3-arrivee.html
- time: 42–56 s
- rules: viewport-change, ambient-glow-bloom
- beat: Façade d'arcades de la Masjid al-Haram ; poussée de caméra à travers l'arche centrale vers la
  Kaaba. Entrer avec respect, pied droit, invocation d'entrée (Muslim) ; se diriger vers la Kaaba ;
  la Talbiya cesse au début du Tawaf.

## Frame 4
- status: built
- src: compositions/s4-tawaf.html
- time: 56–86 s
- rules: svg-path-draw, counting-dynamic-scale
- beat: Étape 2. Vue du dessus : Kaaba, Hijr Ismaïl, Maqam Ibrahim, ligne de la Pierre noire. Un point
  lumineux fait 7 tours dans le sens inverse des aiguilles d'une montre, la Kaaba à sa gauche ; compteur 1→7.
  Pilier · état de pureté · invocations libres, aucune invocation obligatoire par tour · Coran 2:201
  rapporté entre le coin yéménite et la Pierre noire.

## Frame 5
- status: built
- src: compositions/s5-priere.html
- time: 86–99 s
- rules: ambient-glow-bloom, svg-path-draw
- beat: Étape 3. Pictogramme d'arche de mihrab et Maqam Ibrahim, deux points de lumière (1, 2).
  Deux rak‘a (Sunna, majorité), derrière le Maqam si possible, sinon ailleurs dans la mosquée, sans gêner ;
  Zamzam (Sunna).

## Frame 6
- status: built
- src: compositions/s6-sai.html
- time: 99–126 s
- rules: svg-path-draw, discrete-text-sequence
- beat: Étape 4. Carte verticale : Safa (bas) — Marwa (haut), zone des lumières vertes. Un indicateur fait
  sept trajets : Safa→Marwa = 1, Marwa→Safa = 2 … le 7e se termine à Marwa. Pilier (majorité).

## Frame 7
- status: built
- src: compositions/s7-cheveux.html
- time: 126–141 s
- rules: svg-path-draw, ambient-glow-bloom
- beat: Étape 5. Fil doré coupé net (symbole sobre). Hommes : rasage (préférable) ou raccourcissement ;
  femmes : extrémité des cheveux (≈ une phalange). Fin de la Omra et sortie de l'ihram. Obligation (majorité).

## Frame 8
- status: built
- src: compositions/s8-conclusion.html
- time: 141–157 s
- rules: ambient-glow-bloom, sine-wave-loop
- beat: Retour à la Kaaba, lumière douce, lent rapproché. « Qu'Allah accepte votre Omra. » puis
  « Qu'Il vous accorde sincérité, facilité et acceptation. » Fondu final image + son.

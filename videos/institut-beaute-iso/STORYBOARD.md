---
mode: autonomous
message: "Un institut haut de gamme où l'on vient sublimer son regard et sa peau — réservez votre moment."
---

One continuous Three.js isometric world (`assets/world.js`, one canvas, camera
shots keyed on time) under one text/graphics sub-composition per scene
(`compositions/s*.html`). Root timeline in `index.html` drives veils + light leaks.

## Frame 1
status: animated
src: compositions/s1-intro.html + assets/world.js; (0–4s)
motion: rules/3d-camera-flight + rules/ambient-glow-bloom; text: rules/discrete-text-sequence
beat: Vue globale de l'institut, caméra qui avance ; [LOGO] + [NOM DE L'INSTITUT] ; « Révélez votre beauté ».

## Frame 2
status: animated
src: compositions/s2-regard.html + assets/world.js; (4–10s)
motion: rules/multi-phase-camera (glide to lash zone) + rules/svg-path-draw (loupe eye, lashes, brows) + rules/particle-burst (sparkles)
beat: « SOINS DU REGARD » → « Sublimez vos cils & vos sourcils » → Lash lift coréen ◇ Brow lift (avec ou sans teinture).

## Frame 3
status: animated
src: compositions/s3-peau.html + assets/world.js; (10–16s)
motion: rules/multi-phase-camera (glide to facial zone) + rules/depth-scatter-assemble (floating skincare)
beat: « SOINS DE LA PEAU » → « Une peau lumineuse, fraîche et sublimée » → Soin Glass Skin ◇ HydraSkin Signature.

## Frame 4
status: animated
src: compositions/s4-experience.html + assets/world.js; (16–23s)
motion: rules/orbit-3d-entry (pull-out + slow isometric rotation) + rules/ambient-glow-bloom
beat: « Votre moment beauté » → « Prenez soin de vous » → « Formules signature » : Glow & Gaze, Amani Signature.

## Frame 5
status: animated
src: compositions/s5-cta.html + assets/world.js; (23–30s)
motion: blueprints/titlecard-reveal (CTA lockup) + final fade
beat: logo AMANI SKIN ; « Réservez votre rendez-vous » ; « Soins du regard • Soins de la peau » ; @amani__skin · 07 66 85 43 74.

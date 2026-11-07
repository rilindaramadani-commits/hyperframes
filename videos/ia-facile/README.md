# IA FACILE — version vidéo (Reels / TikTok / Shorts)

Vidéo verticale 1080×1920, 30 fps, **34 s**, version animée du carrousel 5 slides
(`../ia-facile-carrousel`). Mêmes textes, même design (univers « appli de messagerie »).

**Fichier final : `renders/ia-facile.mp4`**

| Scène | Temps | Contenu | Transition de sortie |
| --- | --- | --- | --- |
| S1 | 0–4,5 s | Couverture « L'IA / FACILE », bulle de l'IA, accroche | le fil de discussion défile vers le haut |
| S2 | 4,5–12 s | « C'est quoi, l'IA ? » : question tapée + envoyée, « … », réponse | la bulle de l'IA envahit l'écran (iris cobalt) |
| S3 | 12–19,5 s | 3 usages : Écrire / Résumer / Trouver des idées (fond cobalt) | swipe vers la gauche |
| S4 | 19,5–27,5 s | La formule : Rôle + Tâche + Contexte + Format, exemple surligné | swipe vers la gauche |
| S5 | 27,5–34 s | Défi du jour (3 cases cochées), rappel « vérifie », CTA « Enregistre » | — |

- Barre de progression façon carrousel en haut, barre de saisie en bas (décor, sous la zone lisible).
- Tout le texte lisible reste entre 168 et 1330 px (zone sûre Reels/TikTok).
- Son : effets seuls (pops, clics d'envoi, whoosh, coches, riser → impact sur le CTA), repris de la
  bibliothèque de `../skincare-3-erreurs`. **Pas de musique intégrée** : à ajouter dans l'appli
  (sons tendance Instagram/TikTok), ou une piste Artlist peut être placée sur demande.
- Couleurs modifiables dans le panneau Variables du Studio (fond, encre, couleur IA).

## Commandes

```bash
npx hyperframes preview          # Studio
npx hyperframes check            # contrôle complet
npx hyperframes render --quality delivery -o renders/ia-facile.mp4
```

`SPEC.md` : la direction (palette, typo, mouvements, plans). `BRIEF.md` : la demande et les choix faits.

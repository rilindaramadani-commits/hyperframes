# Les étapes de la Omra — motion design (HyperFrames)

Vidéo verticale 1080 × 1920, 30 i/s, 2 min 47 s (167 s), en français : les grandes étapes de la Omra,
de l'ihram à la sortie de l'état de sacralisation. Rendu 100 % HyperFrames (HTML + SVG + GSAP),
illustrations vectorielles originales — aucune photo, aucun personnage, aucune représentation figurative.

Export final : `omra_motion_design.mp4` (dans ce dossier).

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Composition racine : polices, typographie partagée (`.o-*`), montage des 8 scènes, fond sonore |
| `compositions/bg.html` | Fond nocturne commun (halos émeraude et or, poussière de lumière, grain) |
| `compositions/s1-intro.html` … `s8-conclusion.html` | Les 8 scènes (voir `STORYBOARD.md`) |
| `compositions/voile.html` | Ouverture depuis le noir et fondu final au noir |
| `assets/art/art.js` | Illustrations réutilisables : Kaaba vue 3/4, minaret |
| `assets/audio/fond-vocal.mp3` | Fond vocal original (voir ci-dessous) |
| `tools/timing.json` | Minutage des scènes (début / fin), partagé par l'audio |
| `tools/make_vocal_bed.py` | Génère le fond vocal à partir de `timing.json` |

| Scène | Début | Durée |
| --- | --- | --- |
| 1 Introduction | 0 s | 12 s |
| 2 Ihram, Miqat et Talbiya | 12 s | 33 s |
| 3 Arrivée à la Masjid al-Haram | 45 s | 16 s |
| 4 Tawaf (7 tours) | 61 s | 32 s |
| 5 Deux unités de prière | 93 s | 14 s |
| 6 Sa‘i (7 trajets) | 107 s | 28 s |
| 7 Rasage / raccourcissement | 135 s | 16 s |
| 8 Conclusion | 151 s | 16 s |

## Commandes

```bash
npx hyperframes check
npx hyperframes snapshot --at 6,28,53,77,100,121,143,159 -o snapshots
npx hyperframes render -q delivery -o omra_motion_design.mp4
```

## Son : fond vocal original, emplacement pour un nashid

`assets/audio/fond-vocal.mp3` n'est **pas** un nashid d'un artiste : c'est une pièce originale composée
pour ce projet et synthétisée par `tools/make_vocal_bed.py` — voix humées (bourdon sur ré + mélodie lente
en maqam Bayati), sans instrument, sans paroles, à −21 LUFS, avec fondus. Aucun droit tiers.

Pour utiliser un vrai nashid dont la licence autorise la publication :

1. copier le fichier dans `assets/audio/` (167 s ou plus) ;
2. changer `src` de `<audio id="nashid">` dans `index.html` ;
3. ajuster `data-volume` si besoin (l'automation de volume du même élément fait déjà le fondu d'entrée
   sur 4 s et le fondu de sortie de 160 s à 167 s) ;
4. relancer le rendu.

Régénérer le fond vocal après un changement de minutage :

```bash
pip install numpy scipy soundfile pyloudnorm
python3 tools/make_vocal_bed.py tools/timing.json assets/audio/fond-vocal.wav
ffmpeg -y -i assets/audio/fond-vocal.wav -c:a libmp3lame -b:a 192k assets/audio/fond-vocal.mp3
```

## Contenu religieux — choix rédactionnels

- Statuts affichés selon l'avis majoritaire, avec mention des divergences : intention/ihram (pilier),
  ihram au Miqat (obligation), Talbiya (sunna ; obligatoire selon certaines écoles), Tawaf (pilier, en
  état de pureté), deux rak‘a (sunna selon la majorité), Sa‘i (pilier selon la majorité), rasage ou
  raccourcissement (obligation selon la majorité).
- Formules citées, toutes authentiques : la Talbiya (Bukhari, Muslim) ; l'invocation d'entrée à la
  mosquée (Muslim) ; Coran 2:201 entre le coin yéménite et la Pierre noire. Aucune invocation n'est
  présentée comme obligatoire pour un tour donné.
- Carte des Miqat stylisée, distances non à l'échelle (mentionné à l'écran).
- Polices : Marcellus, Jost, Amiri (SIL Open Font License, fichiers dans `assets/fonts/`).

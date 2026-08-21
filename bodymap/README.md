# Kinexus — Body Map

Référence officielle de la Body Map interactive. Ce dossier contient les fonds anatomiques
figés et le fichier maître qui accueillera les régions musculaires interactives.

## Fichiers

| Fichier | Rôle |
|---|---|
| `master_body.svg` | **Fichier de travail et de référence officielle.** Contient les fonds Face/Dos et les 22 régions interactives (vides pour l'instant). C'est ce fichier qui est ouvert dans Figma pour le tracé. |
| `background_front.svg` | Export autonome du fond Face — sauvegarde canonique, figée. |
| `background_back.svg` | Export autonome du fond Dos — sauvegarde canonique, figée. |

## Architecture

```
MasterBody
  Background              (verrouillé — jamais modifié par le logiciel ni par le tracé)
    Front
    Back
  InteractiveRegions      (une forme indépendante par muscle x côté)
    Front
    Back
```

Chaque groupe `InteractiveRegions/<vue>` partage exactement le même repère local que son
`Background/<vue>` correspondant (aucun décalage de `transform` entre les deux). Un tracé
réalisé au-dessus du calque Background verrouillé tombe donc directement dans le bon espace
de coordonnées, sans conversion.

## Convention de nommage des IDs (définitive)

```
<vue>_<muscle>_<côté>
```

- `vue` : `front` | `back`
- `muscle` : slug en snake_case, sans accent (voir table ci-dessous)
- `côté` : `g` (gauche) | `d` (droit)

Exemples : `front_quadriceps_g`, `back_ischio_jambiers_d`

Le préfixe de vue est volontairement présent même si aucune collision n'existe aujourd'hui
entre les listes Face et Dos — il rend chaque ID lisible et sans ambiguïté hors contexte
(dans le code applicatif, dans un sélecteur CSS, dans les logs), et protège contre une
collision future si la liste de muscles s'étend.

### Table muscle → slug

**Face**

| Muscle | Slug |
|---|---|
| Quadriceps | `quadriceps` |
| Adducteurs | `adducteurs` |
| Fléchisseurs de hanche | `flechisseurs_hanche` |
| Tibial antérieur | `tibial_anterieur` |
| Fibulaires | `fibulaires` |

**Dos**

| Muscle | Slug |
|---|---|
| Grand fessier | `grand_fessier` |
| Moyen fessier | `moyen_fessier` |
| Ischio-jambiers | `ischio_jambiers` |
| Gastrocnémiens | `gastrocnemiens` |
| Soléaire | `soleaire` |
| Tibial postérieur | `tibial_posterieur` |

## Règles

- **Background ne se dessine jamais, ne se colore jamais.** C'est un calque de référence
  statique, verrouillé dans l'outil de tracé.
- **InteractiveRegions ne fixe jamais de couleur.** Chaque `<path>` est une forme fermée sans
  `fill` figé — la couleur (vert/jaune/orange/rouge) est assignée dynamiquement par Kinexus
  selon le statut clinique de la fonction concernée, jamais codée en dur dans le SVG.
- **Une région = un `<path>` indépendant**, jamais un groupe. Un `id` par région, stable, jamais
  renommé après création (le code applicatif s'y accroche directement).
- Tant qu'un muscle n'est pas encore tracé, son `<path>` existe déjà dans le fichier avec son
  `id` définitif, mais sans attribut `d` — c'est l'état actuel des 22 régions.

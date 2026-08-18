# Cartographie clinique — rôle vs faisabilité — HYP-EXP-01 (Explosivité)

Même principe qu'HYP-FOR-01/HYP-PUI-01. Sources : `HYP_ARCHITECTURE_PHASE_C.md` (fiche
Explosivité), `CARTOGRAPHIE_CLINIQUE_HYP_EXPLOSIVITE.md`,
`INVENTAIRE_COMPLET_VARIABLES_NORMEES.md`.

---

## A — Variables diagnostiques

| Variable | Test | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|---|
| `cmj_conc_rfd` | CMJ | Diagnostique (`CLI030`, ≥2/4 visées, 2 seulement mesurées) | Aucune | Bloqué |
| `cmj_conc_impulse_100` | CMJ | Diagnostique | Aucune | Bloqué |

Rappel documenté (non une découverte de cette cartographie) : Vierge_7 vise 4 variables
(`CMJ_RFD100`/`150`/`200` + `CMJ_IMPULSE100MS`), Kinexus n'en calcule réellement que 2 —
`cmj_conc_rfd` (proxy non fenêtré) et `cmj_conc_impulse_100` (correspondance directe). Les 2 autres
n'existent même pas comme calcul dans Kinexus (pas seulement sans norme).

## B — Variables confirmatives

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `cmj_peak_power` | Confirmative | NORMS très large | **Opérationnel** |
| `cmj_conc_peak_force` | Confirmative | Aucune | Bloqué |
| `cmj_conc_mean_force` | Confirmative | Aucune | Bloqué |
| `cmj_conc_impulse` | Confirmative | Aucune | Bloqué |

## C — Variables explicatives

| Variable / famille | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `imtp_rfd100`/`rfd200`/`ttpf`, `slimtp_*`, `iso_belt_squat_*`, `sl_iso_push_*`, `iso_squat_hold_*` | Explicative physiologique | Aucune, sur aucune de ces variables | Bloqué en totalité |
| Cinétique segmentaire (11 familles RFD) | Explicative physiologique | Aucune | Bloqué |
| `cmj_depth` | Explicative biomécanique | NORMS (8 pop.) | **Opérationnel** |
| `cmj_conc_duration` | Explicative biomécanique | Aucune | Bloqué |
| `cmj_rsi_mod` | Explicative biomécanique | THRESHOLDS + NORMS large | **Opérationnel** |
| `cmj_ecc_mean_power` | Explicative biomécanique | NORMS (2 pop. seulement) | Partiel |
| `cmj_ecc_peak_vel` | Explicative biomécanique | NORMS (8 pop.) | **Opérationnel** |
| `cmj_braking_rfd` | Explicative biomécanique | 🔧 correspondance de nommage inférée (`CMJ_ECC_DECEL_RFD`), non confirmée par le praticien | NORMS large — **opérationnel si la correspondance de nom est validée** |

**Constat notable** : Explosivité est la seule qualité de cette session où le Niveau 1
(diagnostique) est intégralement bloqué alors que 3 de ses 6 variables explicatives biomécaniques
(`cmj_depth`, `cmj_rsi_mod`, `cmj_ecc_peak_vel`) sont déjà opérationnelles. Le diagnostic ne peut
pas encore être posé, mais une partie de l'explication pourrait déjà être documentée si un
diagnostic existait par ailleurs.

## D — Variables modificatrices / précision

Aucune variable de précision/asymétrie spécifiquement documentée pour Explosivité dans les sources
consultées (`HYP_ARCHITECTURE_PHASE_C.md` ne mentionne aucun mécanisme d'asymétrie propre à cette
qualité, contrairement à Force/`CLI012`).

## E — Validation croisée

| Élément | Rôle clinique | Faisabilité |
|---|---|---|
| Puissance (qualité voisine) | `cmj_peak_power` partagé comme confirmative d'Explosivité et diagnostique principal de Puissance — cohérence croisée possible entre les deux qualités | `cmj_peak_power` opérationnel des deux côtés |
| Aucune décomposition segmentaire dédiée | Un déficit d'Explosivité renvoie, comme Puissance, au Niveau 2 de Force en cas de besoin d'explication segmentaire | Même faisabilité que le Niveau 2 de Force |

---

## Tableau récapitulatif rôle × norme

| Variable | Rôle clinique | Norme Kinexus | Source à rechercher | Utilisable maintenant |
|---|---|---|---|---|
| `cmj_conc_rfd` | Diagnostique | Non | Norme interne ou littérature (RFD concentrique CMJ) | Non |
| `cmj_conc_impulse_100` | Diagnostique | Non | Norme interne ou littérature | Non |
| `cmj_peak_power` | Confirmative | Oui | — | Oui |
| `cmj_conc_peak_force`/`mean_force`/`impulse` | Confirmative | Non | Norme interne | Non |
| `imtp_rfd100`/`200` (et toute la famille RFD) | Explicative | Non | Norme à construire | Non |
| `cmj_depth` | Explicative | Oui | — | Oui |
| `cmj_rsi_mod` | Explicative | Oui | — | Oui |
| `cmj_ecc_peak_vel` | Explicative | Oui | — | Oui |
| `cmj_ecc_mean_power` | Explicative | Partiel (2 pop.) | Élargir la couverture existante | Partiel |
| `cmj_braking_rfd` | Explicative | Oui (sous réserve de nommage) | Confirmation du praticien sur la correspondance `CMJ_ECC_DECEL_RFD` | Partiel — techniquement oui, cliniquement à valider |

---

## Voies de normes potentielles

| Variable/famille | Voie(s) envisageable(s) |
|---|---|
| `cmj_conc_rfd`/`cmj_conc_impulse_100` | 2. Normes de littérature (RFD/impulsion CMJ concentrique bien documentées en recherche) · 3. Norme interne Kinexus |
| `cmj_conc_peak_force`/`mean_force`/`impulse` | 3. Norme interne · 1. VALD si un rapport CMJ plus complet existe |
| RFD/TTPF isométrique (IMTP/SLIMTP/Belt Squat/Push/Squat Hold) | 2. Littérature · 3. Norme interne — même famille que pour Force/Puissance, une seule norme RFD isométrique pourrait servir plusieurs qualités à la fois |
| `cmj_conc_duration` | 2. Littérature biomécanique CMJ |

---

## Synthèse par priorité

### DIAGNOSTIC → variables nécessaires
`cmj_conc_rfd`, `cmj_conc_impulse_100` — 0/2 automatisables, bloque tout le Niveau 1.

### EXPLICATION → variables utiles
RFD isométrique (bloqué), `cmj_depth`/`cmj_rsi_mod`/`cmj_ecc_peak_vel` (déjà opérationnels).

### PRÉCISION → variables complémentaires
Aucune documentée spécifiquement pour Explosivité.

### NORMES → ce qui est disponible actuellement
`cmj_peak_power` (confirmative), 3 des 6 variables explicatives biomécaniques.

### BLOCAGES → ce qui manque pour automatiser
Les 2 seules variables diagnostiques réellement mesurées n'ont aucune norme — c'est le blocage
prioritaire à lever avant toute implémentation, plus prioritaire que les variables explicatives
(déjà partiellement opérationnelles).

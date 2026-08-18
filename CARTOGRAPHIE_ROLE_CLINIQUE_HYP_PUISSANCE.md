# Cartographie clinique — rôle vs faisabilité — HYP-PUI-01 (Puissance)

Même principe qu'HYP-FOR-01 : rôle clinique et faisabilité normative sont deux colonnes
distinctes. Sources : `HYP_ARCHITECTURE_PHASE_C.md` (fiche Puissance),
`CARTOGRAPHIE_CLINIQUE_HYP_PUISSANCE.md`, `INVENTAIRE_COMPLET_VARIABLES_NORMEES.md` — l'inventaire
étant exhaustif (extraction programmatique de `NORMS`/`THRESHOLDS`), toute variable CMJ absente de
sa liste des 10 variables normées est certainement sans norme aujourd'hui, pas seulement
non vérifiée.

---

## A — Variables diagnostiques

| Variable | Test | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|---|
| `cmj_peak_power` | CMJ | Diagnostique principal (`CLI040`, 2/2 requis conjointement) | NORMS très large (41 pop. + 4 par âge) | **Automatisable, opérationnel** |
| `slcmj_peak_power` | SLCMJ | Diagnostique principal unilatéral (`CLI040`, 2/2) | Aucune | Bloqué — la règle "2/2" est aujourd'hui inatteignable |
| `dj_peak_prop_power` | DJ | Diagnostique **secondaire** (suppléance uniquement si `cmj_peak_power` indisponible, jamais en renfort à poids égal — gel point 5) | Aucune | Bloqué |
| `sldj_peak_prop_power` | SLDJ | Diagnostique secondaire | Aucune | Bloqué |
| `cmjr_peak_power` | CMJR | Diagnostique secondaire | Aucune | Bloqué |

## B — Variables confirmatives

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `cmj_height` | Confirmative (jamais diagnostique — gel point 6) | THRESHOLDS + NORMS très large (52 pop. + 6 par âge) | **Opérationnel** |
| `single_hop_distance` | Confirmative | Aucune | Bloqué |
| `triple_hop_distance` | Confirmative | Aucune | Bloqué |

## C — Variables explicatives

| Variable / famille | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `imtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf`, `slimtp_*` | Explicative physiologique | Aucune (aucune de ces variables) | Bloqué |
| `profil_fv_nkg`, `profil_fv_v0` | Explicative physiologique (profil force-vitesse) | Aucune | Bloqué |
| Force segmentaire `_n`/`_nkg` (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `sl_iso_push`, `iso_belt_squat`, `iso_squat_hold` — 11 familles, sans `sh_iso_*`) | Explicative physiologique | Variable selon groupe — voir `CARTOGRAPHIE_ROLE_CLINIQUE_HYP_FORCE.md` §A/D pour le détail des 8 groupes partagés ; `sl_iso_push`/`iso_belt_squat` opérationnels ; `iso_squat_hold` sans norme identifiée | Partiel |
| Stratégie CMJ/SLCMJ (29 KPIs documentés, ex. `cmj_peak_vel`, `cmj_tto`, `cmj_conc_mean_force`, `cmj_conc_rfd`, `cmj_braking_duration`) | Explicative biomécanique | 8 des 29 déjà confirmées normées ailleurs dans l'inventaire (`cmj_depth`, `cmj_ecc_peak_vel`, `cmj_ecc_mean_power`, `cmj_rsi_mod`, `cmj_ft_ct_ratio`, `cmj_braking_rfd`, `cmj_force_zero_vel`, `cmj_landing_peak_force`) ; les autres (dont `cmj_peak_vel`, `cmj_tto`, `cmj_conc_mean_force`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_braking_duration`) confirmées absentes de l'inventaire exhaustif | Partiel — voir note ci-dessous |

**Note sur les 29 KPI de stratégie** : la vérification exhaustive KPI par KPI des 29 n'est pas
refaite ici ; `INVENTAIRE_COMPLET_VARIABLES_NORMEES.md` étant une extraction programmatique
complète de `NORMS`/`THRESHOLDS`, toute variable CMJ n'y figurant pas est certainement sans norme
(pas simplement "non vérifiée ici").

## D — Variables modificatrices / précision

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| Asymétries CMJ (`computeAsymEngine`, phase concentrique/propulsive) | Modificateur — jamais générateur | Mécanisme générique déjà existant (percentiles internes au moteur biomécanique, pas des seuils cliniques HYP) | Opérationnel comme *mécanisme*, mais son usage clinique pour Puissance n'est pas documenté dans la fiche — à ne pas implémenter sans confirmation |

## E — Validation croisée

| Élément | Rôle clinique | Faisabilité |
|---|---|---|
| Niveau 2 de **Force** (`CLI200`-`211`) | Un déficit de puissance expliqué par la force segmentaire renvoie au Niveau 2 de Force — Puissance n'a pas de section segmentaire propre | Même faisabilité que le Niveau 2 de Force (voir `CARTOGRAPHIE_ROLE_CLINIQUE_HYP_FORCE.md`) |
| Explosivité (qualité voisine) | `CLI040` cite "Force" et "Explosivité" comme explicatives au niveau *qualité*, pas variable | Dépend de l'implémentation d'Explosivité elle-même (aujourd'hui bloquée, voir cartographie dédiée) |

---

## Tableau récapitulatif rôle × norme

| Variable | Rôle clinique | Norme Kinexus | Source à rechercher | Utilisable maintenant |
|---|---|---|---|---|
| `cmj_peak_power` | Diagnostique | Oui | — | Oui |
| `slcmj_peak_power` | Diagnostique | Non | VALD (rapport SLCMJ) ou norme interne | Non |
| `dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power` | Diagnostique secondaire | Non | VALD/interne | Non |
| `cmj_height` | Confirmative | Oui | — | Oui |
| `single_hop_distance`/`triple_hop_distance` | Confirmative | Non | VALD/littérature (hop tests largement documentés) | Non |
| `profil_fv_nkg`/`v0` | Explicative | Non | Norme interne (profil calculé par Kinexus lui-même, pourrait générer sa propre distribution longitudinale) | Non |
| `cmj_conc_rfd`, `cmj_conc_mean_force`, `cmj_peak_vel`, `cmj_tto` | Explicative | Non | Norme à construire (littérature CMJ concentrique) | Non |

---

## Voies de normes potentielles

| Variable/famille | Voie(s) envisageable(s) |
|---|---|
| `slcmj_peak_power` | 1. VALD (rapport SLCMJ dédié, non présent dans le dépôt) · 4. Norme sportive spécifique (le SLCMJ est un test moins standardisé que le CMJ bilatéral) |
| Preuves diagnostiques secondaires (DJ/SLDJ/CMJR peak power) | 1. VALD · 3. Norme interne (dérivée d'une cohorte Kinexus existante) |
| `single_hop_distance`/`triple_hop_distance` | 2. Normes de littérature (largement publiées pour le retour au sport) · 4. Normes sportives |
| `profil_fv_nkg`/`v0` | 3. Norme interne (calcul déjà fait par Kinexus, distribution à construire sur les athlètes déjà suivis) · 5. Données longitudinales individuelles (suivi intra-athlète, moins pertinent pour un seuil populationnel) |
| Stratégie CMJ (KPI restants) | 2. Littérature biomécanique CMJ · 3. Norme interne |

---

## Synthèse par priorité

### DIAGNOSTIC → variables nécessaires
`cmj_peak_power` (opérationnel), `slcmj_peak_power` (bloquant — la règle "2/2" ne peut jamais être
remplie sans lui).

### EXPLICATION → variables utiles
IMTP/SLIMTP RFD, profil force-vitesse, stratégie CMJ/SLCMJ — 8/29 KPI de stratégie déjà normés
via d'autres qualités (Absorption notamment), le reste bloqué.

### PRÉCISION → variables complémentaires
Force segmentaire (11 familles, partiellement normée — voir Force) ; asymétrie CMJ (mécanisme
disponible, usage clinique pour Puissance non documenté).

### NORMES → ce qui est disponible actuellement
`cmj_peak_power`, `cmj_height`, et 8 KPI de stratégie CMJ/SLCMJ partagés avec d'autres qualités.

### BLOCAGES → ce qui manque pour automatiser
`slcmj_peak_power` — bloque structurellement la règle diagnostique documentée. Aucune norme pour
les 3 preuves secondaires, les confirmatives hop tests, ni la majorité des variables explicatives.

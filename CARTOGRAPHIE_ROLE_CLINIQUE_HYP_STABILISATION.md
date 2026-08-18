# Cartographie clinique — rôle vs faisabilité — HYP-STAB-01 (Stabilisation)

Même principe. Sources : `HYP_ARCHITECTURE_PHASE_C.md` (fiche Stabilisation),
`CARTOGRAPHIE_CLINIQUE_HYP_STABILISATION.md`, `INVENTAIRE_COMPLET_VARIABLES_NORMEES.md`.

---

## A — Variables diagnostiques

| Variable | Test | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|---|
| `sls_ttf` | Single Leg Stand | Diagnostique (`CLI070`, ≥2 preuves — mais `CLI070` ne cite littéralement que SLS, voir note) | Aucune | Bloqué |
| `sls_cop_path` | SLS | Diagnostique | Aucune | Bloqué |
| `sls_cop_vel` | SLS | Diagnostique | Aucune | Bloqué |
| `sls_ellipse_area` | SLS | Diagnostique | Aucune | Bloqué |
| `sls_cop_range_ml` | SLS | Diagnostique | Aucune | Bloqué |
| `sls_cop_range_ap` | SLS | Diagnostique | Aucune | Bloqué |
| `sls_mean_velocity` | SLS | Diagnostique | Aucune | Bloqué |
| `eo_surface` | Eyes Open | Diagnostique | Aucune | Bloqué |
| `ef_surface` | Eyes Closed | Diagnostique | Aucune | Bloqué |
| `landing_uni_tts` | Landing unilatéral | Diagnostique contextuel (fiche de qualité — absent des orientations `CLI070`/`CLI071` elles-mêmes, écart déjà documenté, non arbitré) | THRESHOLDS | **Automatisable, opérationnel** |
| `landing_bi_tts` | Land and Hold | Diagnostique contextuel | THRESHOLDS | **Automatisable, opérationnel** |

**Point de méthode important pour cette qualité** : sur 11 variables diagnostiques documentées,
**9 sont cliniquement pertinentes mais aujourd'hui sans aucune norme** (le cœur même du modèle SLS/
EO/EF, présenté par la fiche comme le pilier de Stabilisation). Elles restent ici dans la
cartographie — ne pas les considérer comme retirées du raisonnement clinique.

## B — Variables confirmatives

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| Mêmes 7 KPI SLS (double rôle diagnostique/confirmatif selon la source) | Confirmative | Aucune | Bloqué |
| `strobo_surface` | Confirmative (double rôle avec explicative) | Aucune | Bloqué |
| `landing_uni_tts`/`landing_bi_tts` | Confirmative (double rôle avec diagnostique) | THRESHOLDS | **Opérationnel** |

## C — Variables explicatives

| Variable / famille | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `hip_abd_rfd100`/`rfd200` | Explicative physiologique | Aucune | Bloqué |
| `hip_ext_rfd100`/`rfd200` | Explicative physiologique | Aucune | Bloqué |
| `hip_add_rfd100` | Explicative physiologique | Aucune | Bloqué |
| `inv_iso_rfd100` | Explicative physiologique | Aucune | Bloqué |
| `ev_iso_rfd100` | Explicative physiologique | Aucune | Bloqué |
| `df_iso_rfd100` | Explicative physiologique | Aucune | Bloqué |
| `wblt_distance` | Explicative physiologique (mobilité de cheville expliquant une stratégie de stabilisation compensée) | THRESHOLDS (déjà opérationnel pour Mobilité) | **Opérationnel** |
| `sls_cop_path`/`cop_vel`/`cop_range_ml`/`cop_range_ap`/`ellipse_area`/`mean_velocity` (double rôle) | Explicative biomécanique | Aucune | Bloqué |
| `strobo_surface`/`landing_uni_tts`/`landing_bi_tts` (triple rôle) | Explicative biomécanique | `landing_*` opérationnel, `strobo` bloqué | Partiel |

## D — Variables modificatrices / précision

Aucun mécanisme d'asymétrie propre à Stabilisation documenté au-delà des variables déjà listées
(SLS et Landing sont eux-mêmes intrinsèquement unilatéraux ou bilatéraux selon le test, pas de LSI
inter-test spécifique documenté dans la fiche).

## E — Validation croisée

| Élément | Rôle clinique | Faisabilité |
|---|---|---|
| Contrôle Sensori-moteur (`HYP-CSM-01`, suspendue) | `CLI090` couvre EO/EC/Strobo/SLS ensemble comme déclencheur unique — différenciation potentielle avec `CLI070` (SLS seul), non traitée tant que `HYP-CSM-01` reste suspendue par instruction explicite | Sans objet — qualité suspendue |
| `ybt_composite` | **Non documenté** dans la fiche Stabilisation ni dans `CLI070`/`CLI071` — normé (THRESHOLDS) mais sans rôle clinique établi pour cette qualité dans les sources consultées | Constat factuel, aucun rôle attribué ici (pas de rôle inventé) |

---

## Tableau récapitulatif rôle × norme

| Variable | Rôle clinique | Norme Kinexus | Source à rechercher | Utilisable maintenant |
|---|---|---|---|---|
| `sls_ttf`/`cop_path`/`cop_vel`/`ellipse_area`/`cop_range_ml`/`cop_range_ap`/`mean_velocity` | Diagnostique | Non | VALD (rapport SLS dédié) ou norme interne | Non |
| `eo_surface`/`ef_surface` | Diagnostique | Non | VALD/littérature (Romberg quotient largement documenté) | Non |
| `landing_uni_tts`/`landing_bi_tts` | Diagnostique | Oui | — | Oui |
| `strobo_surface` | Confirmative/explicative | Non | VALD/interne | Non |
| `hip_abd`/`hip_ext`/`hip_add`/`inv_iso`/`ev_iso`/`df_iso` (RFD) | Explicative | Non | Norme à construire (même famille RFD que Force) | Non |
| `wblt_distance` | Explicative | Oui | — | Oui |

---

## Voies de normes potentielles

| Variable/famille | Voie(s) envisageable(s) |
|---|---|
| SLS (7 KPI) | 1. VALD (rapport dédié équilibre unipodal, non présent dans le dépôt) · 2. Littérature (largement publiée pour le temps de maintien, l'aire d'ellipse) · 4. Norme sportive/population générale |
| EO/EF (surfaces) | 2. Littérature (test de Romberg, très documenté) · 3. Norme interne |
| `strobo_surface` | 1. VALD (test moins standard, norme probablement propre à Kinexus/VALD) · 3. Norme interne |
| RFD hanche/cheville (Stabilisation) | 2. Littérature · 3. Norme interne — même famille RFD que Force, mutualisable |

---

## Synthèse par priorité

### DIAGNOSTIC → variables nécessaires
11 variables documentées ; seules 2 (`landing_uni_tts`, `landing_bi_tts`) automatisables, et elles
ne sont pas le déclencheur `CLI070` littéral (SLS). Le cœur diagnostique documenté (SLS/EO/EF,
9 variables) est entièrement bloqué.

### EXPLICATION → variables utiles
`wblt_distance` opérationnel ; toute la famille RFD hanche/cheville bloquée.

### PRÉCISION → variables complémentaires
Aucune documentée au-delà des variables déjà listées.

### NORMES → ce qui est disponible actuellement
`landing_uni_tts`, `landing_bi_tts`, `wblt_distance`.

### BLOCAGES → ce qui manque pour automatiser
Le cœur diagnostique de Stabilisation (SLS, EO, EF — 9 des 11 variables) est intégralement sans
norme. C'est la qualité où le décalage entre couverture documentaire (fiche complète, 4 familles
de tests) et couverture normative réelle (2 variables opérationnelles, situées hors du
déclencheur `CLI070` littéral) est le plus marqué de toute la cartographie à ce jour.

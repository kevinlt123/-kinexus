# Cartographie clinique — rôle vs faisabilité — HYP-END-01 (Endurance)

Même principe. Sources : `HYP_ARCHITECTURE_PHASE_C.md` (fiche Endurance),
`CARTOGRAPHIE_CLINIQUE_HYP_ENDURANCE.md`, `INVENTAIRE_COMPLET_VARIABLES_NORMEES.md`.

---

## A — Variables diagnostiques

| Variable | Test | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|---|
| `heel_raise_reps` | Heel Raise | Diagnostique (`CLI080`, ≥2 preuves) | THRESHOLDS | **Automatisable, opérationnel** |
| `repeated_hop_n_hops` | Hop Test | Diagnostique (fiche de qualité ; omis de `CLI080`, écart mineur déjà noté sans conséquence) | Aucune | Bloqué |
| `repeated_hop_rsi_fatigue` | Hop Test | Diagnostique | Aucune | Bloqué |
| `repeated_hop_height_fatigue` | Hop Test | Diagnostique | Aucune | Bloqué |
| `repeated_hop_ct_drift` | Hop Test | Diagnostique | Aucune | Bloqué |
| `repeated_hop_stiffness_fatigue` | Hop Test | Diagnostique | Aucune | Bloqué |

Sur 6 variables diagnostiques documentées, 1 seule est automatisable — insuffisant pour la règle
"2 preuves" telle que documentée, mais **les 5 variables `repeated_hop_*` restent dans le
raisonnement clinique**, marquées non automatisables plutôt que supprimées.

## B — Variables confirmatives

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `repeated_hop_mean_height` | Confirmative | Aucune | Bloqué |
| `repeated_hop_mean_rsi` | Confirmative | Aucune | Bloqué |
| `repeated_hop_mean_peak_force` | Confirmative | Aucune | Bloqué |
| `repeated_hop_mean_ct` | Confirmative | Aucune | Bloqué |
| `repeated_hop_best_height` | Confirmative | Aucune | Bloqué |
| `repeated_hop_best_rsi` | Confirmative | Aucune | Bloqué |
| `repeated_hop_height_cv` | Confirmative | Aucune | Bloqué |
| `repeated_hop_ct_cv` | Confirmative | Aucune | Bloqué |
| `repeated_hop_rsi_cv` | Confirmative | Aucune | Bloqué |

**Constat** : la totalité de la couche confirmative documentée pour Endurance dépend d'un seul
test (Repeated Hop), lui-même intégralement sans norme aujourd'hui — la couche confirmative est
donc, en pratique, tout aussi bloquée que la couche diagnostique au-delà de `heel_raise_reps`.

## C — Variables explicatives

| Variable / famille | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `imtp_n`/`nkg`, `slimtp_n`/`nkg` | Explicative physiologique | Aucune | Bloqué |
| `iso_belt_squat_n`/`nkg` | Explicative physiologique | NORMS (13 pop. + 2 générales) | **Opérationnel** |
| `sl_iso_push_n`/`nkg` | Explicative physiologique | NORMS (3 pop.) + THRESHOLDS (`nkg`) | **Opérationnel** |
| Force segmentaire complète (11 familles `_n`/`_nkg`) | Explicative physiologique | Variable selon groupe — voir `CARTOGRAPHIE_ROLE_CLINIQUE_HYP_FORCE.md` | Partiel |
| Cinétique complète (15 familles RFD) | Explicative physiologique | Aucune, sur aucune famille | Bloqué en totalité |

## D — Variables modificatrices / précision

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `repeated_hop_mean_ct`/`ct_drift`/`height_cv`/`ct_cv`/`rsi_cv` (double rôle confirmatif/explicatif) | Précision — dégradation/variabilité intra-série | Aucune | Bloqué |
| `repeated_hop_mean_height`/`best_height`/`mean_rsi`/`best_rsi`/`mean_peak_force` (double rôle) | Précision | Aucune | Bloqué |
| `repeated_hop_mean_stiffness` | Aucun rôle assigné par les sources, sur aucune orientation `CLI###` ni fiche | Aucune | **NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES** — conservé tel quel, aucun rôle inventé |

## E — Validation croisée

| Élément | Rôle clinique | Faisabilité |
|---|---|---|
| Force / Explosivité (qualités citées par `CLI080` comme explicatives au niveau *qualité*) | Un déficit d'Endurance peut être mis en regard d'un déficit de Force/Explosivité déjà établi | Dépend de la faisabilité de ces deux qualités elles-mêmes (Force partielle, Explosivité bloquée) |
| Aucune décomposition segmentaire dédiée | — | — |

---

## Tableau récapitulatif rôle × norme

| Variable | Rôle clinique | Norme Kinexus | Source à rechercher | Utilisable maintenant |
|---|---|---|---|---|
| `heel_raise_reps` | Diagnostique | Oui | — | Oui |
| `repeated_hop_n_hops` | Diagnostique | Non | VALD (rapport Hop Test dédié) ou norme interne | Non |
| `repeated_hop_rsi_fatigue`/`height_fatigue`/`ct_drift`/`stiffness_fatigue` | Diagnostique | Non | VALD/norme interne — indices de fatigue, peu documentés en littérature générale | Non |
| `repeated_hop_mean_*`/`best_*`/`*_cv` (9 variables confirmatives) | Confirmative | Non | VALD/norme interne | Non |
| `iso_belt_squat_n`/`sl_iso_push_n` | Explicative | Oui | — | Oui |
| Cinétique RFD (15 familles) | Explicative | Non | Norme à construire (même famille que Force/Explosivité, mutualisable) | Non |
| `repeated_hop_mean_stiffness` | Non déterminable | Non | Sans objet tant que le rôle n'est pas clarifié | Non |

---

## Voies de normes potentielles

| Variable/famille | Voie(s) envisageable(s) |
|---|---|
| Repeated Hop (toutes variables, diagnostique + confirmatif) | 1. VALD (rapport Hop Test dédié, non présent dans le dépôt) · 3. Norme interne (cohorte Kinexus) · 4. Norme sportive (les protocoles de hop répété varient beaucoup selon le sport) |
| `imtp_n`/`slimtp_n` (déjà bloqués pour Force) | Mêmes voies que documentées dans `CARTOGRAPHIE_ROLE_CLINIQUE_HYP_FORCE.md` — une norme ajoutée bénéficierait aux deux qualités simultanément |
| Cinétique RFD (15 familles) | 2. Littérature · 3. Norme interne — mutualisable avec Force/Puissance/Explosivité/Stabilisation, qui partagent toutes ce même blocage |

---

## Synthèse par priorité

### DIAGNOSTIC → variables nécessaires
6 variables documentées ; 1 seule (`heel_raise_reps`) automatisable — insuffisant pour la règle
"2 preuves".

### EXPLICATION → variables utiles
`iso_belt_squat_n`/`sl_iso_push_n` opérationnels ; le reste (IMTP/SLIMTP, cinétique RFD complète)
bloqué.

### PRÉCISION → variables complémentaires
9 variables confirmatives/de précision Repeated Hop, toutes bloquées ; `repeated_hop_mean_stiffness`
sans rôle déterminable.

### NORMES → ce qui est disponible actuellement
`heel_raise_reps`, `iso_belt_squat_n`/`nkg`, `sl_iso_push_n`/`nkg`.

### BLOCAGES → ce qui manque pour automatiser
Le test Repeated Hop — pivot de la couche diagnostique ET confirmative documentée pour Endurance —
est intégralement sans norme, sur ses 14 KPI. C'est le blocage prioritaire : une seule source
normative pour ce test lèverait à la fois le déficit diagnostique et confirmatif de la qualité.

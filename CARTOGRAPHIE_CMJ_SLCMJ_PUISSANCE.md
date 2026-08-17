# Cartographie clinique CMJ / SLCMJ pour HYP-PUI-01

**Statut** : cartographie clinique, pas une nouvelle architecture. Aucun code modifié, aucune règle
HYP créée ou changée, aucune nouvelle variable. Chaque nom vérifié directement dans `index.html`
(`TESTS`, `CMJ_VAR_META`) ou dans les documents déjà audités.

**Légende** : 🔴 Diagnostique · 🟠 Confirmative · 🟡 Explicative · ⚪ Non utilisée pour Puissance ·
SOURCE EXPLICITE / INFERENCE / NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES.

---

## Réponse directe aux 7 questions posées

1. **Diagnostic** : `cmj_peak_power` et `slcmj_peak_power`, exclusivement, requis conjointement
   (2/2). Rien d'autre ne diagnostique Puissance.
2. **Explication** : 15 KPI de stratégie CMJ + 14 KPI de stratégie SLCMJ (§4-§5), plus les familles
   physiologiques hors CMJ/SLCMJ (Force, RFD, TTPF, Profil F-V — hors périmètre de ce document,
   déjà cartographiées ailleurs).
3. **Stratégie d'exécution** : les 29 KPI ci-dessus peuvent *documenter* une exécution atypique,
   mais ne *prouvent* jamais seuls une stratégie au sens clinique (§9) — nuance centrale de ce
   document.
4. **Squat Jump** : n'existe pas dans Kinexus. Aucun rôle, faute d'exister (§7).
5. **Autres tests de saut** : DJ/SLDJ/CMJR/hop tests ont des ensembles diagnostiques **disjoints**
   de Puissance (Réactivité, Absorption) — leur rôle pour Puissance se limite à une suppléance
   diagnostique secondaire ou une confirmation fonctionnelle, jamais un diagnostic direct (§8).
6. **CMJ vs SLCMJ** : même logique explicative, mais **`slcmj_height` n'est jamais utilisée** pour
   Puissance — asymétrie déjà présente dans les sources, signalée en §5.
7. **Utilité pratique post-détection** : §6 et matrice §4-§5 donnent, variable par variable, ce
   qu'un praticien peut réellement en tirer.

---

## 1. Diagnostic direct de Puissance 🔴

| Variable | Test | Unité | Sens du déficit | Rôle exact | Source | Condition de génération |
|---|---|---|---|---|---|---|
| `cmj_peak_power` | CMJ (TESTS key `peak_power`) | W/kg | `dir:max` — bas = déficit | Diagnostique principal (bilatéral) | 🟢 SOURCE EXPLICITE, `HYP_ARCHITECTURE_PHASE_C.md` | Génère `HYP-PUI-01` (état Suspectée) si seule ; fait franchir Retenue **uniquement conjointement** avec `slcmj_peak_power` (2/2, `CLI040`) |
| `slcmj_peak_power` | SLCMJ | W/kg | `dir:max` | Diagnostique principal (unilatéral) | 🟢 SOURCE EXPLICITE | idem, symétrique |

**Aucune autre variable CMJ/SLCMJ n'a un rôle diagnostique direct.** Vérifié contre l'intégralité des
kpis CMJ/SLCMJ réels (§4-§5) — `rsi_mod`, `conc_impulse`, `height`, etc. n'apparaissent dans aucune
liste diagnostique de Puissance dans `CARTOGRAPHIE_VARIABLES_HYP.md`.

**Distinction demandée, respectée** : `cmj_peak_power`/`slcmj_peak_power` sont les variables qui
*calculent/évaluent* Puissance (rôle diagnostique). Les 29 KPI de stratégie (§4-§5) sont
*explicatives* — jamais diagnostiques. Certaines variables CMJ (`rsi_mod`, `conc_rfd`,
`conc_impulse_100`, `braking_rfd`, `ecc_peak_vel`…) appartiennent au CMJ mais servent **d'autres
qualités** (Explosivité, Absorption, Réactivité) — recensées en §4 sous ⚪ pour éviter toute
confusion.

---

## 2. Confirmation de Puissance 🟠

| Variable | Ce qu'elle mesure | Pourquoi confirmative | Diagnostique complétée | Qualité(s) |
|---|---|---|---|---|
| `cmj_height` | Hauteur de saut (cm) | Tâche fonctionnelle cohérente avec un déficit de puissance de pic | `cmj_peak_power`/`slcmj_peak_power` | Puissance uniquement |
| `single_hop_distance` | Distance de saut horizontal unipodal (cm) | Tâche fonctionnelle horizontale convergente | idem | **Puissance ET Réactivité** (partagée, `CARTOGRAPHIE_VARIABLES_HYP.md` lignes 87-88 et 491-492) |
| `triple_hop_distance` | Distance de saut triple unipodal (cm) | idem, tâche répétée | idem | **Puissance ET Réactivité** |

**Constat à signaler explicitement** : `slcmj_height` **n'est jamais confirmative de Puissance** —
contrairement à `cmj_height`. Aucune variable SLCMJ n'a de rôle confirmatif pour Puissance dans les
sources consultées. 🟢 SOURCE EXPLICITE (absence constatée dans `CARTOGRAPHIE_VARIABLES_HYP.md`).

`crossover_hop_distance` est confirmative de **Réactivité uniquement**, jamais de Puissance —
signalé pour éviter une confusion avec `single_hop`/`triple_hop`, qui elles sont partagées.

---

## 3. Explication du déficit — principe

29 variables biomécaniques (15 CMJ + 14 SLCMJ), aucune transformée automatiquement en preuve —
détail complet dans les tableaux §4-§5. Reprise stricte de `CARTOGRAPHIE_VARIABLES_HYP.md` et
`HYP_ARCHITECTURE_PHASE_C.md`, vérifiée contre le code réel (`TESTS`, `CMJ_VAR_META`).

---

## 4. Tableau CMJ complet

*Test CMJ réel (`index.html:112-121`) : 46 KPI au total (hors 10 variables d'asymétrie regroupées en
une ligne). Colonne "Mécanisme expliqué" = ce que le KPI documente, pas une conclusion clinique.*

| Variable | Mesure | Unité | Déficit | Rôle HYP-PUI | Mécanisme documenté | Source |
|---|---|---|---|---|---|---|
| `cmj_peak_power` | Puissance de pic | W/kg | `max` | 🔴 Diagnostique | — | 🟢 |
| `cmj_height` | Hauteur de saut | cm | `max` | 🟠 Confirmative | Résultat fonctionnel global | 🟢 |
| `cmj_peak_vel` | Vitesse de pic | m/s | `max` | 🟡 Explicative | Stratégie, transversal | 🟢 appartenance / 🟠 mécanisme |
| `cmj_tto` | Temps de contraction total | ms | `min` | 🟡 Explicative | Stratégie, transversal (dénominateur RSI-Mod/FT:CT) | 🟢 |
| `cmj_depth` | Profondeur du contre-mouvement | cm | `max` | 🟡 Explicative | Stratégie (unloading) | 🟢 — **variable partagée**, également confirmative Absorption |
| `cmj_conc_mean_force` | Force moyenne, phase concentrique | N/kg | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `cmj_conc_mean_vel` | Vitesse moyenne, phase concentrique | m/s | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `cmj_conc_rfd` | RFD concentrique (proxy non fenêtré) | N/s | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 — **variable partagée**, également **diagnostique d'Explosivité** |
| `cmj_conc_duration` | Durée phase concentrique | ms | `min` | 🟡 Explicative | Stratégie (concentric) | 🟢 — **variable partagée**, également explicative Explosivité et confirmative Absorption |
| `cmj_conc_displacement` | Amplitude phase concentrique | cm | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `cmj_braking_duration` | Durée phase de freinage | ms | `min` | 🟡 Explicative | Stratégie (unloading/braking) | 🟢 |
| `cmj_propulsion_eff` | Efficacité de propulsion | % | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `cmj_braking_eff` | Efficacité de freinage | % | `max` | 🟡 Explicative | Stratégie (braking) | 🟢 |
| `cmj_ft_ct_ratio` | Ratio temps de vol / temps de contact | — | `max` | 🟡 Explicative | Stratégie (flight, résultat) | 🟢 |
| `cmj_ecc_decel` | Décélération excentrique | m/s² | `max` | 🟡 Explicative | Stratégie (braking) | 🟢 |
| `cmj_landing_rfd` | RFD à l'atterrissage | N/s | `min` | 🟡 Explicative | Stratégie (landing) | 🟢 |
| `cmj_landing_mean_power` | Puissance moyenne à l'atterrissage | W/kg | `min` | 🟡 Explicative | Stratégie (landing) | 🟢 |
| `cmj_rsi_mod` | Indice de rebond modifié | — | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — utilisée par **Explosivité** (explicative biomécanique) |
| `cmj_conc_impulse` | Impulsion concentrique | Ns/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — confirmative **Explosivité** |
| `cmj_conc_peak_force` | Force de pic, phase concentrique | N/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — confirmative **Explosivité et Absorption** |
| `cmj_conc_impulse_100` | Impulsion concentrique à 100ms | Ns/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — **diagnostique d'Explosivité** |
| `cmj_ecc_peak_vel` | Vitesse de pic excentrique | m/s | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — **diagnostique d'Absorption**, explicative Explosivité |
| `cmj_ecc_mean_power` | Puissance moyenne excentrique | W/kg | — | ⚪ Non utilisée pour Puissance | — | 🟢 — **diagnostique d'Absorption**, explicative Explosivité |
| `cmj_braking_rfd` | RFD de la phase de freinage | N/kg/s | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — **diagnostique d'Absorption**, explicative Explosivité — **à ne pas confondre avec `cmj_conc_rfd`** (phases différentes) |
| `cmj_braking_impulse` | Impulsion de freinage | Ns/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 — **diagnostique d'Absorption** |
| `cmj_ecc_peak_force` | Force de pic excentrique | N/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE — non repérée dans une autre liste HYP### des sources consultées |
| `cmj_ecc_mean_force` | Force moyenne excentrique | N/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_conc_mean_power` | Puissance moyenne concentrique | W/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE pour HYP### — utilisée par le moteur biomécanique par phase (profil Propulsif), architecture distincte |
| `cmj_conc_peak_vel` | Vitesse de pic concentrique | m/s | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_braking_peak_force` | Force de pic, phase de freinage | N/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_braking_rfd_abs` | RFD de freinage (version absolue) | N/s | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 jamais utilisée pour un score, `CMJ_VAR_META` tier "info" explicitement |
| `cmj_braking_power` | Puissance de freinage | W/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_landing_peak_force` | Force de pic à l'atterrissage | N/kg | `min` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE pour HYP### — Absorption utilise `landing_uni`/`landing_bi`/`sllt`, pas `cmj_landing_peak_force` |
| `cmj_landing_mean_force` | Force moyenne à l'atterrissage | N/kg | `min` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_landing_impulse` | Impulsion à l'atterrissage | Ns/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_landing_duration` | Durée de la phase d'atterrissage | ms | `max` | ⚪ Non utilisée pour Puissance | — | 🟢 tier "info", profil Absorbeur (moteur biomécanique, hors HYP###) |
| `cmj_time_to_stab` | Temps de stabilisation | s | `min` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE pour HYP### — Absorption utilise `landing_uni_tts`/`landing_bi_tts`/`sllt_tts`, pas `cmj_time_to_stab` |
| `cmj_post_landing_stability` | Stabilité post-atterrissage | — | `min` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_force_zero_vel` | Force à vitesse nulle | N/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE pour HYP### — moteur biomécanique par phase uniquement |
| `cmj_force_peak_power` | Force au pic de puissance | N/kg | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| `cmj_flight_time` | Temps de vol | ms | `max` | ⚪ Non utilisée pour Puissance | — | 🔴 NON DÉTERMINABLE |
| 10 variables d'asymétrie (`ecc_decel_rfd_asym`, `ecc_decel_impulse_asym`, `conc_force_impulse_asym`, `force_peak_power_asym`, `p2_conc_impulse_asym`, `landing_peak_force_asym`, + variantes G/D) | Écarts gauche/droite | % ou unité native | `min` | ⚪ Non utilisée pour Puissance | — | 🟢 alimentent `computeAsymEngine`, lecture seule, jamais génératrices pour aucune qualité (`KINEXUS_REASONING_ENGINE_V1.md` §6) |

**15 variables 🟡 explicatives confirmées pour Puissance** ; 1 🔴 diagnostique ; 3 🟠 confirmatives
(dont 2 partagées avec Réactivité) ; le reste ⚪, avec statut précisé plutôt que simplement omis.

---

## 5. Tableau SLCMJ complet

*Test SLCMJ réel (`index.html:123`) : 16 KPI au total.*

| Variable | Mesure | Unité | Déficit | Rôle HYP-PUI | Mécanisme documenté | Source |
|---|---|---|---|---|---|---|
| `slcmj_peak_power` | Puissance de pic, unilatéral | W/kg | `max` | 🔴 Diagnostique | — | 🟢 |
| `slcmj_rsi_mod` | Indice de rebond modifié, unilatéral | — | `max` | 🟡 Explicative | Stratégie (flight, par analogie) | 🟢 |
| `slcmj_peak_conc_force` | Force de pic, phase concentrique | N/kg | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `slcmj_peak_conc_vel` | Vitesse de pic, phase concentrique | m/s | `max` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `slcmj_edrfd_bm` | RFD de freinage relatif au poids | N/s/kg | `max` | 🟡 Explicative | Stratégie (braking) | 🟢 |
| `slcmj_braking_rfd` | RFD de freinage, version absolue | N/s | `max` | 🟡 Explicative | Stratégie (braking) | 🟢 — coexiste avec `slcmj_edrfd_bm`, deux clés distinctes (contrairement au CMJ) |
| `slcmj_peak_braking_force` | Force de pic, phase de freinage | N/kg | `max` | 🟡 Explicative | Stratégie (braking) | 🟢 |
| `slcmj_braking_impulse` | Impulsion de freinage | Ns/kg | `max` | 🟡 Explicative | Stratégie (braking) | 🟢 |
| `slcmj_depth` | Profondeur du contre-mouvement | cm | `max` | 🟡 Explicative | Stratégie (unloading) | 🟢 |
| `slcmj_contraction_time` | Temps de contraction total | ms | `min` | 🟡 Explicative | Stratégie (transversal) | 🟢 |
| `slcmj_ecc_duration` | Durée phase excentrique | ms | `min` | 🟡 Explicative | Stratégie (braking) | 🟢 |
| `slcmj_conc_duration` | Durée phase concentrique | ms | `min` | 🟡 Explicative | Stratégie (concentric) | 🟢 |
| `slcmj_peak_landing_force` | Force de pic à l'atterrissage | N/kg | `min` | 🟡 Explicative | Stratégie (landing) | 🟢 |
| `slcmj_landing_impulse` | Impulsion à l'atterrissage | Ns/kg | `max` | 🟡 Explicative | Stratégie (landing) | 🟢 |
| `slcmj_time_to_stab` | Temps de stabilisation | s | `min` | 🟡 Explicative | Stratégie (landing) | 🟢 — **homonymie de mesure** avec la variable diagnostique de Stabilisation (`landing_uni_tts`), tests différents |
| `slcmj_height` | Hauteur de saut, unilatéral | cm | `max` | ⚪ **Non utilisée pour Puissance** | — | 🟢 absence constatée — **contrairement à `cmj_height`, confirmative** ; aucun autre rôle HYP### repéré → 🔴 NON DÉTERMINABLE ailleurs |

**14 variables 🟡 explicatives** ; 1 🔴 diagnostique ; **0 🟠 confirmative** (constat déjà signalé
en §2) ; 1 ⚪ (`slcmj_height`).

**Différence CMJ/SLCMJ, demandée explicitement (§6)** : le CMJ contribue une variable confirmative
(`cmj_height`) que le SLCMJ n'apporte pas — le SLCMJ ne fournit, pour Puissance, que du diagnostic et
de l'explicatif, jamais de confirmation directe. `single_hop`/`triple_hop` (tests séparés du SLCMJ)
jouent ce rôle de confirmation fonctionnelle unilatérale à la place.

---

## 6. Synthèse — qu'est-ce qui détermine « Puissance ↓ » ?

```
PUISSANCE DIAGNOSTIQUÉE
    ↓
cmj_peak_power ↓  +  slcmj_peak_power ↓  (2/2, conjoint)
    ↓
HYP-PUI-01 (Retenue)


POURQUOI LA PUISSANCE EST-ELLE DÉFICITAIRE ?
    ↓
┌─────────────┬─────────────┬──────────────────┬───────────────────────┐
│   Force     │     RFD     │   Profil F-V      │  Stratégie biomécanique│
│ (hors CMJ)  │ (hors CMJ)  │  (hors CMJ)        │  15 KPI CMJ + 14 SLCMJ │
└─────────────┴─────────────┴──────────────────┴───────────────────────┘
```

Seule la case "Stratégie biomécanique" relève du périmètre CMJ/SLCMJ de ce document — les trois
autres (Force, RFD, Profil Force-Vitesse) sont hors CMJ/SLCMJ, déjà cartographiées dans
`HYP_PUI_CAPACITE_STRATEGIE_V1.md`, non reprises ici.

**Variables réellement utiles au praticien une fois Puissance détectée** (question 7) : les 15+14
variables 🟡 (§4-§5), à lire par phase (unloading → braking → concentric → flight → landing) pour
situer *où*, dans le mouvement de saut, l'exécution diverge — sans jamais, seules, constituer une
preuve de stratégie (§9).

---

## 7. Squat Jump

**Vérification directe dans le code** : `index.html:3187` — commentaire explicite : *"EUR est
explicitement reporté en V2 (le test Squat Jump n'existe pas encore dans KINEXUS...)"*.

**Réponse : D — aucune fonction dans HYP-PUI-01.** Ni diagnostique, ni confirmative, ni explicative
— **le test n'existe tout simplement pas** dans Kinexus à ce jour. 🟢 SOURCE EXPLICITE, vérifié
directement dans le code, pas une supposition. Aucun rôle ne lui est attribué au motif qu'il serait
physiologiquement pertinent, conformément à la consigne.

---

## 8. Autres tests de saut

| Test | Puissance | Réactivité | Explosivité | Absorption | Rôle |
|---|---|---|---|---|---|
| **DJ** (`dj_rsi`) | — | 🔴 Diagnostique principal | — | — | Diagnostic exclusif de Réactivité |
| **DJ** (`dj_peak_prop_power`) | 🔴 Diagnostique **secondaire** (suppléance uniquement) | — | — | — | Ne s'active que si CMJ/SLCMJ indisponibles, jamais en renfort |
| **DJ** (7 autres KPI) | — | 🟠 Confirmative / 🟡 Explicative | — | 🟠 Confirmative / 🟡 Explicative (double rôle) | Réactivité et Absorption uniquement |
| **SLDJ** | idem, symétrique unilatéral | idem | — | idem | idem |
| **CMJR** (`cmjr_peak_power`) | 🔴 Diagnostique **secondaire** (suppléance) | — | — | — | idem logique que DJ |
| **CMJR** (6 autres KPI, dont `cmjr_mean_rsi`) | — | 🟡 Explicative (**jamais diagnostique**, malgré une contradiction relevée entre deux sections de Vierge_7 déjà tranchée en faveur de la fiche de qualité) | — | — | Réactivité uniquement |
| **Single Hop** | 🟠 Confirmative | 🟠 Confirmative | — | — | Partagée Puissance/Réactivité |
| **Triple Hop** | 🟠 Confirmative | 🟠 Confirmative | — | — | Partagée Puissance/Réactivité |
| **Crossover Hop** | — | 🟠 Confirmative | — | — | Réactivité uniquement, jamais Puissance |
| **Repeated Hop** | — | — | — | — | Non repéré dans les listes de variables des qualités Puissance/Réactivité/Explosivité/Absorption consultées → 🔴 NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES |

**Pourquoi ces tests ne sont jamais des preuves diagnostiques de Puissance** : l'ensemble diagnostique
de `HYP-PUI-01` est **strictement limité** à `cmj_peak_power`/`slcmj_peak_power` — condition la plus
stricte de tout le corpus V1 (2/2, `CLI040`). DJ/SLDJ/CMJR n'y figurent qu'en **rang secondaire**,
réservé explicitement à la suppléance (gel, point 5, `KINEXUS_REASONING_ENGINE_V1.md` §3) — ils ne
renforcent jamais un diagnostic déjà établi par les tests principaux. Leur ensemble diagnostique
propre (Réactivité : `dj_rsi`/`sldj_rsi`) est **disjoint** de celui de Puissance — validé
explicitement en Phase D (*"aucune contamination croisée"*), rappelé dans
`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §5 (Profil 8).

---

## 9. Relation avec la Stratégie d'exécution

**A — variables qui disent "l'athlète manque de Puissance"** : `cmj_peak_power`,
`slcmj_peak_power` uniquement (§1).

**B — variables qui disent "pourquoi cette Puissance est déficitaire"** : les 4 familles
physiologiques (Force, RFD, TTPF, Profil F-V, hors CMJ) — capacité.

**C — variables qui peuvent documenter "comment l'athlète produit/exécute cette Puissance"** : les 29
KPI CMJ/SLCMJ de stratégie (§4-§5).

**D — variables qui ne permettent pas de distinguer capacité vs stratégie** : **c'est le cas de
toutes les 29 variables C prises isolément.** Point central, déjà établi dans
`HYP_PUI_CAPACITE_STRATEGIE_V1.md`/`HYP_PUI01_REGLE_FINALE_GELEE.md`, reconfirmé ici au niveau
variable : une anomalie sur `cmj_conc_mean_force` (par exemple) documente un fait biomécanique
(force moyenne concentrique hors norme), mais ne devient une **preuve de stratégie** que si les
conditions de la règle gelée sont satisfaites (Force **et** RFD testées, biomécanique anormale) —
jamais du seul fait que la variable biomécanique est anormale. 🟢, application directe de la règle
déjà gelée, aucune extension nouvelle ici.

**Distinction à ne jamais confondre, répétée volontairement** : "variable biomécanique anormale" ≠
"preuve de stratégie". Les 29 variables C répondent toutes, individuellement, à la question "que
s'est-il passé pendant le mouvement ?" — aucune ne répond seule à la question "est-ce la cause du
déficit de puissance, une conséquence d'un déficit de capacité, ou une compensation ?" (question déjà
signalée non discriminable au niveau causal, `HYP_PUI_CAPACITE_STRATEGIE_V1.md` §7).

---

## 10. Cas concrets

### CAS 1 — `cmj_peak_power`↓, `slcmj_peak_power`↓, tout le reste normal
HYP peut dire : Puissance diagnostiquée (2/2). Rien d'autre — aucun mécanisme, aucune branche
Capacité ni Stratégie. C'est le cas « signal isolé » déjà documenté ailleurs, non résolu par ce
document.

### CAS 2 — + variables de force CMJ/SLCMJ ↓
**Point de vigilance** : aucune des 29 variables CMJ/SLCMJ de stratégie ne s'appelle "force" au sens
de la branche Capacité — la "force" mesurée par CMJ/SLCMJ (`cmj_conc_mean_force`,
`slcmj_peak_conc_force`, etc.) appartient à la catégorie **biomécanique/stratégie**, pas à la
catégorie **physiologique/capacité** (§9, distinction B vs C). Si ces variables sont anormales,
HYP peut ajouter : un signal de stratégie (à confirmer selon la règle gelée), **pas** un signal de
capacité — la capacité physiologique se lit sur IMTP/SLIMTP/segmentaire, jamais sur le CMJ/SLCMJ
lui-même.

### CAS 3 — + biomécanique anormale, Force + RFD évaluées et normales
Selon la règle gelée : couverture satisfaite, condition 4 satisfaite (pas de déficience
physiologique) → **STRATÉGIE**.

### CAS 4 — Force↓, RFD normale, biomécanique anormale
Capacité : signal faible (1 famille). Couverture Stratégie satisfaite (Force et RFD toutes deux
testées, même si Force déficitaire). Condition 4 non satisfaite (une déficience existe) →
**MIXTE** (capacité signal faible + stratégie retenue), selon la résolution gelée.

### CAS 5 — Force + RFD non suffisamment évaluées, biomécanique anormale
Couverture non satisfaite → Stratégie ne peut jamais être retenue, quelle que soit l'anomalie
biomécanique observée → **NON DISCRIMINABLE**. Pas parce que la biomécanique n'est pas parlante,
mais parce que l'absence de test sur Force/RFD interdit d'exclure qu'un déficit de capacité non
détecté explique en réalité le déficit.

### CAS 6 — Force↓, RFD↓, biomécanique anormale
Capacité : retenue (2 familles distinctes). Couverture Stratégie satisfaite. Condition 4 non
satisfaite → **MIXTE** (capacité retenue + stratégie retenue), conformément à la règle gelée.

---

## Rappel — rien n'est modifié

Ce document consolide en un seul endroit lisible ce qui existait déjà, dispersé, dans
`CARTOGRAPHIE_VARIABLES_HYP.md`, `INTERPRETATION_VARIABLES_PUISSANCE.md`,
`HYP_ARCHITECTURE_PHASE_B/C.md` et le code réel. Aucune nouvelle règle, aucun nouveau rôle attribué à
une variable, aucune contradiction trouvée avec les documents déjà gelés — seuls quelques rôles
« non déterminables » ont été signalés comme tels plutôt que comblés par supposition.

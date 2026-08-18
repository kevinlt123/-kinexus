# Inventaire complet des variables normées — Kinexus

**Statut** : inventaire uniquement. Aucun code modifié, aucun seuil créé, aucune recherche
externe. Produit par extraction **programmatique** directe des objets `THRESHOLDS`/`NORMS`/`TESTS`
d'`index.html` (`eval()` de la tranche `var C={...}` → avant `SUPABASE CONFIG`, même convention que
`tests/*.test.js`) — pas par lecture manuelle ou estimation. Chaque ligne de ce document est
vérifiable en relançant la même extraction.

---

## 1. Définition d'une variable normée

Une variable est retenue ici si et seulement si le code contient, à l'exécution, une information
permettant à `applyThr(key,val,pop,age)` (ou au mécanisme réellement utilisé par
`computeTestStatus`) de retourner autre chose que `null` pour au moins une combinaison
(population, âge) réelle :

- **A. `NORMS`** — une entrée `NORMS[population][testKey_kpiKey]` existe (bandes de percentiles,
  flat ou par tranche d'âge `{maxAge,vals}`).
- **B. `THRESHOLDS`** — une entrée `THRESHOLDS[testKey_kpiKey]` existe (bandes catégorielles fixes,
  utilisées par `applyThr` en repli quand `NORMS` ne couvre pas la population de l'athlète).
- **C. Autre mécanisme réel** — recherché, aucun trouvé en dehors de A/B pour les variables listées
  ici (pas de troisième mécanisme de seuil dans `index.html`).

Un poids `TFM` n'est **jamais** compté comme norme. Une mention documentaire ("source VALD",
"normes disponibles") sans entrée `NORMS`/`THRESHOLDS` réelle n'est **jamais** comptée.

---

## 2. Inventaire exhaustif — union NORMS ∪ THRESHOLDS

**39 variables** au total possèdent une norme ou un seuil réellement exploitable dans `index.html`
(24 dans `THRESHOLDS`, 20 dans `NORMS`, 5 dans les deux : `cmj_height`, `cmj_rsi_mod`, `dj_rsi`,
`slcmj_height`, `sldj_rsi`).

| Variable exacte | Test | Mécanisme | Direction | Unité | Fonction de classification |
|---|---|---|---|---|---|
| `cmj_braking_rfd` | `cmj` (Countermovement Jump) | A — NORMS (15 pop. flat + 4 par âge) | max | N/kg/s | `applyThr` |
| `cmj_depth` | `cmj` | A — NORMS (8 pop. flat) | max | cm | `applyThr` |
| `cmj_ecc_mean_power` | `cmj` | A — NORMS (2 pop. flat) | max | W/kg | `applyThr` |
| `cmj_ecc_peak_vel` | `cmj` | A — NORMS (8 pop. flat) | max | m/s | `applyThr` |
| `cmj_force_zero_vel` | `cmj` | A — NORMS (7 pop. flat) | max | N/kg | `applyThr` |
| `cmj_ft_ct_ratio` | `cmj` | A — NORMS (33 pop. flat + 4 par âge) | max | ratio | `applyThr` |
| `cmj_height` | `cmj` | **A+B** — NORMS (52 pop. flat + 6 par âge), repli THRESHOLDS (vert 35/jaune 28/orange 22) | max | cm | `applyThr` |
| `cmj_landing_peak_force` | `cmj` | A — NORMS (4 pop. flat) | min | N/kg | `applyThr` |
| `cmj_peak_power` | `cmj` | A — NORMS (41 pop. flat + 4 par âge) | max | W/kg | `applyThr` |
| `cmj_rsi_mod` | `cmj` | **A+B** — NORMS (20 pop. flat + 4 par âge), repli THRESHOLDS (vert 0.8/jaune 0.6/orange 0.4) | max | ratio | `applyThr` |
| `dj_rsi` | `dj` (Drop Jump) | **A+B** — NORMS (18 pop. flat), repli THRESHOLDS (vert 1.5/jaune 1.0/orange 0.7) | max | ratio | `applyThr` |
| `gastro_iso_nkg` | `gastro_iso` | B — THRESHOLDS (vert 2.0/jaune 1.6/orange 1.2) | max | N/kg | `applyThr` |
| `heel_raise_reps` | `heel_raise` | B — THRESHOLDS (vert 25/jaune 20/orange 15) | max | reps | `applyThr` |
| `hip_abd_n` | `hip_abd` | A — NORMS (3 pop. flat, `foot_*`) | max | N | `applyThr` |
| `hip_abd_nkg` | `hip_abd` | B — THRESHOLDS (vert 2.0/jaune 1.6/orange 1.2) | max | N/kg | `applyThr` |
| `hip_add_n` | `hip_add` | A — NORMS (3 pop. flat, `foot_*`) | max | N | `applyThr` |
| `hip_add_nkg` | `hip_add` | B — THRESHOLDS (vert 1.8/jaune 1.4/orange 1.0) | max | N/kg | `applyThr` |
| `hip_ext_nkg` | `hip_ext` | B — THRESHOLDS (vert 2.5/jaune 2.0/orange 1.5) | max | N/kg | `applyThr` |
| `hip_flex_n` | `hip_flex` | A — NORMS (3 pop. flat, `foot_*`) | max | N | `applyThr` |
| `hip_flex_nkg` | `hip_flex` | B — THRESHOLDS (vert 2.0/jaune 1.6/orange 1.2) | max | N/kg | `applyThr` |
| `hip_rot_ext_nkg` | `hip_rot_ext` | B — THRESHOLDS (vert 1.3/jaune 1.0/orange 0.7) | max | N/kg | `applyThr` |
| `hip_rot_int_nkg` | `hip_rot_int` | B — THRESHOLDS (vert 1.2/jaune 0.9/orange 0.6) | max | N/kg | `applyThr` |
| `iso_belt_squat_n` | `iso_belt_squat` | A — NORMS (13 pop. flat + 2 par âge) | max | N | `applyThr` |
| `iso_belt_squat_nkg` | `iso_belt_squat` | A — NORMS (13 pop. flat, pas de repli B) | max | N/kg | `applyThr` |
| `knee_ext_nkg` | `knee_ext` | B — THRESHOLDS (vert 3.0/jaune 2.5/orange 2.0) | max | N/kg | `applyThr` |
| `knee_flex_nkg` | `knee_flex` | B — THRESHOLDS (vert 1.8/jaune 1.5/orange 1.2) | max | N/kg | `applyThr` |
| `landing_bi_tts` | `landing_bi` (Land and Hold) | B — THRESHOLDS (vert 0.6/jaune 1.0/orange 1.5) | min | s | `applyThr` |
| `landing_uni_tts` | `landing_uni` | B — THRESHOLDS (vert 0.8/jaune 1.2/orange 1.8) | min | s | `applyThr` |
| `sh_iso_9020_nkg` | `sh_iso_9020` | B — THRESHOLDS (vert 2.0/jaune 1.6/orange 1.2) | max | N/kg | `applyThr` |
| `sh_iso_9090_nkg` | `sh_iso_9090` | B — THRESHOLDS (vert 1.5/jaune 1.2/orange 0.9) | max | N/kg | `applyThr` |
| `sl_iso_push_n` | `sl_iso_push` | A — NORMS (3 pop. flat, `foot_*`) | max | N | `applyThr` |
| `sl_iso_push_nkg` | `sl_iso_push` | B — THRESHOLDS (vert 2.5/jaune 2.0/orange 1.5) | max | N/kg | `applyThr` |
| `slcmj_height` | `slcmj` (Single Leg Jump) | **A+B** — NORMS (5 pop. flat), repli THRESHOLDS (vert 30/jaune 24/orange 18) | max | cm | `applyThr` |
| `sldj_rsi` | `sldj` (Single Leg Drop Jump) | **A+B** — NORMS (3 pop. flat), repli THRESHOLDS (vert 1.2/jaune 0.8/orange 0.5) | max | ratio | `applyThr` |
| `sldj_tts` | `sldj` | B — THRESHOLDS (vert 0.8/jaune 1.2/orange 1.8) | min | s | `applyThr` |
| `soleus_iso_n` | `soleus_iso` | A — NORMS (3 pop. flat, `foot_*`) | max | N | `applyThr` |
| `soleus_iso_nkg` | `soleus_iso` | B — THRESHOLDS (vert 2.5/jaune 2.0/orange 1.5) | max | N/kg | `applyThr` |
| `wblt_distance` | `wblt` (Weight-Bearing Lunge Test) | B — THRESHOLDS (vert 12/jaune 10/orange 8) | max | cm | `applyThr` |
| `ybt_composite` | `ybt` (Y-Balance Test) | B — THRESHOLDS (vert 95/jaune 85/orange 75) | max | % | `applyThr` |

---

## 3. NORMS — détail

20 variables couvertes, sur **58 populations** distinctes (extraites une par une de `NORMS`) :

`foot_m_senior`, `foot_f_senior`, `foot_f_youth`, `bball_m_ncaa`, `bball_f_ncaa`, `bball_m_pro`,
`fd_amfootball`, `fd_bball_m`, `fd_bball_f`, `fd_soccer_m`, `fd_soccer_f`, `fd_afl_m`, `fd_afl_f`,
`fd_track_m`, `fd_track_f`, `fd_rugby_m`, `fd_rugby_f`, `fd_hockey_m`, `fd_hockey_f`, `general_m`,
`general_f`, `bball2425_ncaa_m`, `bball2425_ncaa_f`, `bball2425_nbl`, `bball2425_euroleague`,
`bball2425_bleague`, `tennis_m`, `tennis_f`, `football_f`, `football_m`, `football_youth_m`,
`football_f_age`, `football_youth_m_age`, `football_f_pro`, `football_f_college`,
`rugby_union_m`, `rugby_league_m`, `mma_m`, `handball_m`, `nba_m`, `bball_general`,
`weightlifting_m`, `weightlifting_f`, `college_volleyball_m`, `college_gymnastics_m`,
`college_gymnastics_f`, `college_swim_f`, `college_swim_m`, `college_track_f`, `college_track_m`,
`college_bball_f`, `college_bball_m`, `college_soccer_f`, `college_soccer_m`, `allied_health_m`,
`allied_health_f`, `endurance_m`, `endurance_f`.

Deux natures de couverture : **flat** (une seule bande, sans distinction d'âge) et **par âge**
(structure `{maxAge,vals}`, seulement pour `general_m`/`general_f`, `football_f_age`,
`football_youth_m_age`, `allied_health_m`/`f` — 5 populations utilisent ce mécanisme, jamais
d'autres).

Constat de portée par variable, sans extrapoler : `cmj_height`/`cmj_peak_power`/`cmj_ft_ct_ratio`
sont les variables les plus largement couvertes (33 à 58 populations) ; `cmj_ecc_mean_power` est la
moins couverte (2 populations, `foot_f_senior`/`foot_f_youth` uniquement — aucune couverture
masculine). Les variables Force segmentaires (`hip_abd_n`, `hip_add_n`, `hip_flex_n`,
`soleus_iso_n`) et `sl_iso_push_n` partagent exactement les 3 mêmes populations football
(`foot_m_senior`/`foot_f_senior`/`foot_f_youth`), issues d'un seul rapport source.

---

## 4. THRESHOLDS — détail

24 entrées au total dans l'objet `THRESHOLDS` (`index.html:1214`). Toutes catégorielles fixes
(4 bandes : vert/jaune/orange/rouge implicite en dessous d'orange), indépendantes de la population.

**Priorité NORMS → THRESHOLDS**, vérifiée dans `applyThr` : `NORMS` est toujours tenté en premier
(si `pop` et `NORMS[pop][key]` existent) ; `THRESHOLDS` n'est utilisé que si `NORMS` ne couvre pas
la population de l'athlète, ou si aucune population n'est sélectionnée. **Ce repli n'existe que
pour les 5 variables listées en §2 marquées A+B** — pour les 19 autres variables `THRESHOLDS` sans
`NORMS`, c'est l'unique mécanisme ; pour les 15 variables `NORMS` sans `THRESHOLDS`, l'absence de
couverture `NORMS` rend la variable non classifiable, sans filet de sécurité.

---

## 5. Variables partiellement normées

Variables dont la classification dépend strictement de la population sélectionnée pour l'athlète
(pas de repli universel) :

| Variable | Couverture réelle | Risque |
|---|---|---|
| `cmj_ecc_mean_power` | 2 populations seulement (`foot_f_*`) | Non classifiable hors ces 2 populations, y compris pour un homme |
| `cmj_landing_peak_force` | 4 populations (`bball2425_*`) | Non classifiable hors basketball NCAA/pro |
| `hip_abd_n`/`hip_add_n`/`hip_flex_n`/`soleus_iso_n`/`sl_iso_push_n` | 3 populations football uniquement | Non classifiable pour tout sport hors football |
| `iso_belt_squat_n`/`nkg` | 13-15 populations sport + général | Large mais toujours borné à ces populations |
| `dj_rsi`/`cmj_height`/`cmj_rsi_mod`/`slcmj_height`/`sldj_rsi` | Repli THRESHOLDS disponible | **Non partielles en pratique** — toujours classifiables même hors couverture NORMS |

Les 5 variables `A+B` (repli THRESHOLDS) ne doivent **pas** être classées "partielles" au même
titre que les autres : elles sont universellement classifiables, seule leur *précision* (percentile
réel vs. bande générique) varie selon la population.

---

## 6. Variables sans norme exploitable — synthèse par famille

| Famille | Variables sans norme exploitable | Nombre |
|---|---|---|
| IMTP / SLIMTP | `imtp_n`, `imtp_nkg`, `slimtp_n`, `slimtp_nkg` | 4 |
| Force segmentaire — absolu (`_n`) sans couverture | `knee_ext_n`, `knee_flex_n`, `hip_ext_n`, `gastro_iso_n` | 4 |
| Force segmentaire — chevilles/épaule bloquées | `df_iso_n`/`nkg`, `inv_iso_n`/`nkg`, `ev_iso_n`/`nkg`, `sh_iso_3030_n`/`nkg`, `sh_iso_6060_n`/`nkg` | 10 |
| RFD/TTPF (tous tests, diagnostiques et segmentaires) | `*_rfd50`/`100`/`150`/`200`, `*_ttpf` — aucune variable de ce type normée, sur aucun test | ~60+ (non dénombrées une à une, famille entière) |
| CMJ concentrique (Explosivité) | `cmj_conc_rfd`, `cmj_conc_impulse_100`, `cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_conc_impulse` | 5 |
| CMJ Core Absorption restant | `cmj_braking_impulse`, `cmj_braking_duration` | 2 |
| SLCMJ (hors `height`) | `slcmj_peak_power` et l'ensemble des autres KPI SLCMJ | ≥1 (peak_power confirmé bloquant) |
| DJ/SLDJ (hors `rsi`, `tts`) | `dj_contact_time`, `dj_peak_prop_force`, `dj_peak_prop_power`, `dj_leg_stiffness`, `dj_height`, `dj_landing_impulse`, `dj_peak_landing_force`, équivalents `sldj_*` | ≥14 |
| CMJR (entièrement) | `cmjr_mean_rsi`, `cmjr_peak_power`, `cmjr_mean_ct`, `cmjr_mean_stiffness`, etc. | famille entière |
| Hop tests (Single/Triple/Crossover/Side Hop) | `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance`, `side_hop_reps` | 4 |
| Repeated Hop | `repeated_hop_n_hops`, `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue`, + 9 autres KPI | famille entière (14 KPI) |
| Équilibre/proprioception | `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity`, `eo_surface`, `ef_surface`, `strobo_surface` | famille entière (10 KPI) |
| Landing/SLLT (hors `tts`) | `sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`, `sllt_cop_path`, `landing_bi_peak_landing_force` | 6 |
| Y-Balance (composantes) | `ybt_ant`, `ybt_pm`, `ybt_pl` (seul `ybt_composite` est normé) | 3 |
| IMTP/SLIMTP RFD/TTPF (déjà comptés dans RFD/TTPF ci-dessus) | — | — |

---

## 7. Matrice des 8 qualités HYP — calculée à partir de l'inventaire réel

| Qualité HYP | Variables diagnostiques documentées | Normées (dans cet inventaire) | Non normées | Niveau réellement activable |
|---|---|---|---|---|
| **Mobilité** | `wblt_distance` | `wblt_distance` (1/1) | — | **Plein** (1 preuve suffit, règle documentée) |
| **Réactivité** | `dj_rsi`, `sldj_rsi` | Les deux (2/2), repli THRESHOLDS | — | **Plein** (règle "2/2" atteignable) |
| **Absorption** (déjà implémentée, HYP-ABS-01 V2) | `cmj_braking_rfd`, `cmj_force_zero_vel`, `cmj_braking_impulse` (Core documenté) | `cmj_braking_rfd`, `cmj_force_zero_vel` (2/3) | `cmj_braking_impulse` | **Partiel** (2/3 Core, population-dépendant) |
| **Force** | `imtp_n`, `slimtp_n`, `iso_belt_squat_n`, `sl_iso_push_n` | `iso_belt_squat_n`, `sl_iso_push_n` (2/4) | `imtp_n`, `slimtp_n` | **Partiel** (2/4, population-dépendant) |
| **Stabilisation** | 7 KPI `sls`, `eo_surface`, `ef_surface`, `landing_uni_tts`, `landing_bi_tts` | `landing_uni_tts`, `landing_bi_tts` (2/10) | `sls_*` (7), `eo_surface`, `ef_surface` | **Partiel, fragile** — les 2 variables normées ne sont pas le déclencheur documenté par `CLI070` (SLS) |
| **Puissance** | `cmj_peak_power`, `slcmj_peak_power` (+3 secondaires) | `cmj_peak_power` (1/2 principales) | `slcmj_peak_power` + 3 secondaires | **Bloqué** — règle stricte "2/2" inatteignable |
| **Explosivité** | `cmj_conc_rfd`, `cmj_conc_impulse_100` | Aucune (0/2) | Les deux | **Bloqué** en totalité |
| **Endurance** | `heel_raise_reps` + 5 variables `repeated_hop_*` | `heel_raise_reps` (1/6) | 5 variables `repeated_hop_*` | **Bloqué** — règle "2 preuves" inatteignable |

**Constat additionnel, hors périmètre des 8 fiches consultées** : `cmj_ft_ct_ratio` et
`ybt_composite` sont normés (THRESHOLDS et/ou NORMS) mais **ne figurent dans la liste diagnostique
d'aucune des 8 fiches HYP consultées** — ni comme diagnostique, ni comme explicative nommée. Fait
constaté, non interprété davantage ici.

---

## 8. Priorités d'implémentation

### PRIORITÉ 1 — implémentable presque immédiatement
- **Réactivité** : les deux variables diagnostiques (`dj_rsi`, `sldj_rsi`) sont normées, toujours
  classifiables (repli THRESHOLDS), la règle de convergence est déjà documentée et gelée
  (`ARBITRAGE_CLINIQUE_REACTIVITE.md`), et aucun code de production ne l'implémente encore.

### PRIORITÉ 2 — partiellement implémentable
- **Force** : 2 des 4 variables diagnostiques opérationnelles (population-dépendant) — un
  HYP-FOR-01 en mode dégradé documenté est réalisable, à l'image de HYP-ABS-01 V2.
- **Stabilisation** : seules 2 des 10 variables documentées sont normées (`landing_uni_tts`/
  `landing_bi_tts`), et elles ne correspondent pas au déclencheur `CLI070` documenté (SLS) — toute
  implémentation devrait explicitement documenter cet écart plutôt que le lisser.

### PRIORITÉ 3 — bloquée par absence de normes
- **Puissance** : règle stricte "2/2" inatteignable (`slcmj_peak_power` sans norme).
- **Explosivité** : 0 des 2 variables diagnostiques réellement mesurées n'est normée.
- **Endurance** : 1 seule des 6 variables diagnostiques documentées est normée, la règle "2
  preuves" reste inatteignable.

*(Absorption et Mobilité ne figurent pas dans ce classement — déjà implémentées.)*

---

## 9. Conclusion

**Réponse à la question posée** : parmi toutes les variables mesurées par Kinexus, **39** peuvent
aujourd'hui être interprétées avec une référence normative réelle (`NORMS` et/ou `THRESHOLDS`).
Parmi les 8 qualités HYP, **Réactivité** est la seule non encore implémentée dont la règle
documentée est intégralement atteignable avec les données actuelles.

### Résumé très court

- **Variables normées/exploitables** : 39 (24 via `THRESHOLDS`, 20 via `NORMS`, 5 par les deux).
- **Variables partiellement normées** (couverture population étroite, sans repli) : 7
  (`cmj_ecc_mean_power`, `cmj_landing_peak_force`, `hip_abd_n`, `hip_add_n`, `hip_flex_n`,
  `soleus_iso_n`, `sl_iso_push_n`).
- **Principales familles sans normes** : IMTP/SLIMTP, RFD/TTPF (toutes variantes, tous tests), CMJ
  concentrique (Explosivité), SLCMJ (hors hauteur), DJ/SLDJ (hors RSI/TTS), CMJR entier, tous les
  hop tests, Repeated Hop, équilibre/proprioception (SLS/EO/EF/Strobo), Landing/SLLT (hors TTS).
- **Qualité HYP la plus immédiatement implémentable** : **Réactivité**.
- **Qualité HYP la plus bloquée** : **Explosivité** (0 variable diagnostique normée) — à égalité de
  sévérité avec Endurance (1/6) et Puissance (règle stricte inatteignable), mais Explosivité est la
  seule dont **aucune** des deux variables diagnostiques réellement mesurées n'a de norme.

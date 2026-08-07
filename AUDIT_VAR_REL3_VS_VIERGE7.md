# Audit VAR_REL3 / TFM vs Vierge_7 — trace de travail

## Statut de ce document

Document de travail (pas normatif) pour la Phase A du chantier HYP### validé le 07/08/2026 — voir
`KINEXUS_CLINICAL_ARCHITECTURE.md`, section "Évolution validée (07/08)". Trace, qualité par
qualité, les écarts entre le mécanisme actuel (`TFM`/`VAR_REL3`, pondéré) et la spécification
externe Vierge_7 (diagnostique/confirmative/explicative), pour justifier chaque changement lors de
la Phase B/C. Mis à jour après chaque qualité auditée, dans l'ordre où elles sont traitées.

**Méthode** : pour chaque qualité, comparaison variable par variable entre le texte intégral de
Vierge_7 (rôle assigné) et les entrées `VAR_REL3` taguées `function` = cette qualité (bucket actuel
`measures`/`estimates`, avec leur `poids`). Vierge_7 n'est pas traité comme une vérité à reproduire
à l'identique : toute incohérence, redondance ou ambiguïté relevée dans Vierge_7 lui-même est
signalée séparément, pas corrigée silencieusement.

**Légende des statuts** : ✅ conforme · ⚠️ à reclasser · ❌ en excès (à retirer du diagnostic) ·
🚫 exclusion violée · ➕ manquant.

**Échelle de gravité** (ajoutée à partir de l'audit Absorption, validée par le praticien le
07/08) : 🟢 Conforme · 🟡 Écart mineur · 🟠 Écart important · 🔴 Écart critique. Attribuée par
variable/motif quand utile, et systématiquement en synthèse par qualité (point 9 de la structure
ci-dessous).

**Structure fixe par qualité, à partir de l'audit Absorption** (validée par le praticien le
07/08) : 1. Résumé exécutif — 2. Variables diagnostiques conformes — 3. Variables diagnostiques en
excès — 4. À reclasser en confirmatives — 5. À reclasser en explicatives physiologiques — 6. À
reclasser en explicatives biomécaniques — 7. Exclues par Vierge_7 mais actuellement utilisées —
8. Variables manquantes — 9. Gravité globale de l'écart — 10. Incohérences internes de Vierge_7 —
11. Impact attendu sur le moteur HYP###. Les qualités Puissance/Réactivité ci-dessous suivent une
structure en 9 points légèrement différente (pré-validation de ce standard) ; elles ne sont pas
rétroactivement réécrites, seul le format des qualités suivantes change.

**Politique sur les incohérences Vierge_7** : signalées systématiquement (où elles apparaissent,
pourquoi elles semblent contradictoires, quelle serait la meilleure interprétation selon moi) mais
**jamais corrigées ni tranchées unilatéralement** — la décision revient au praticien.

---

## 0. Anomalie technique transversale découverte pendant l'audit (indépendante de Vierge_7)

**Constat** : `VAR_REL3` mélange, sur le champ `function`, deux orthographes différentes pour au
moins 4 des 10 qualités — la forme accentuée officielle (celle qui figure dans `FUNCTIONS` /
`FN_KEY`, ex. `"Réactivité"`) et une forme non accentuée qui n'existe nulle part ailleurs dans le
code (ex. `"Reactivite"`). `computeQualityStatus()` (ligne 4070) compare par égalité stricte
(`m.function===qualityName`) : toute entrée taguée avec l'orthographe non accentuée **ne compte
donc jamais** dans le score de la qualité correspondante. Ce n'est pas une variante de lecture
possible, c'est une donnée totalement inerte — vérifié en confirmant qu'aucune fonction du code
(pas de normalisation d'accents) ne relit jamais cette orthographe.

| Forme inerte trouvée | Nb d'entrées `measures`/`estimates` concernées |
|---|---|
| `"Reactivite"` (vs `"Réactivité"`) | 87 |
| `"Explosivite"` (vs `"Explosivité"`) | 129 |
| `"Controle Frontal"` (vs `"Contrôle Frontal"`) | 65 |
| `"Mobilite"` (vs `"Mobilité"`) | 21 |

Soit **302 relations variable→qualité** (sur les ~2000+ entrées de `VAR_REL3`) qui ont été
saisies avec l'intention de compter dans le score actuel mais qui, en pratique, n'y contribuent
pour rien depuis leur création — le comportement observé du moteur pondéré aujourd'hui est donc
*encore plus étroit* que ce que la lecture brute de `VAR_REL3` laisse penser pour ces 4 qualités.

**Pourquoi je le signale ici plutôt que de le corriger silencieusement** : corriger uniquement
l'orthographe (sans revoir le bucket/poids) activerait d'un coup des variables jusqu'ici inertes,
avec le poids (souvent `Determinante`) qu'elles portent déjà — ce qui peut introduire de nouvelles
violations vis-à-vis de Vierge_7 plutôt que d'en résoudre. Exemple concret trouvé pendant l'audit
Réactivité ci-dessous : les 7 variables `cmjr_*` sont taguées `"Reactivite"`/`Determinante`
(inertes aujourd'hui) — un simple correctif d'orthographe les ferait entrer au niveau diagnostique
maximal, alors que Vierge_7 les classe en confirmatives/explicatives biomécaniques, jamais en
diagnostique.

**Recommandation** : ne pas faire de correctif ponctuel isolé sur l'orthographe. Traiter cette
anomalie comme faisant partie de la reconstruction de la Phase C (le rôle de chaque variable sera
de toute façon réattribué à cette étape, à partir de Vierge_7). Si le praticien souhaite un
correctif immédiat indépendant du calendrier Phase A→C (par exemple parce que cela fausse déjà des
scores en production sur Explosivité/Contrôle Frontal/Mobilité), me le signaler explicitement —
ce n'est pas une décision que je prends seul.

---

## 1. Puissance

### 1.1 — Variables diagnostiques conformes (déjà correctes)

| Variable | Test | VAR_REL3 (bucket/poids) | Vierge_7 (rôle) |
|---|---|---|---|
| `cmj_peak_power` | CMJ | measures / Determinante | Diagnostique principal |
| `slcmj_peak_power` | SLCMJ | measures / Determinante | Diagnostique principal unilatéral |

Seulement **2 variables** sur les ~148 entrées taguées "Puissance" dans `VAR_REL3` sont à la fois
présentes et correctement classées comme diagnostiques selon Vierge_7.

### 1.2 — Variables diagnostiques en excès (à retirer du diagnostic)

Toutes taguées `measures`/`Determinante` (donc traitées aujourd'hui comme diagnostiques) alors que
Vierge_7 les classe ailleurs :

| Variable(s) | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `imtp_n`, `imtp_rfd200`, `imtp_ttpf` | measures / Determinante | Explicative physiologique (production de force globale) |
| `slimtp_n`, `slimtp_nkg`, `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | measures / Determinante | Explicative physiologique |
| `profil_fv_nkg`, `profil_fv_v0` | measures / Determinante | Explicative physiologique (chaîne force-vitesse) |
| `cmj_peak_vel`, `cmj_tto`, `cmj_depth`, `cmj_ecc_peak_vel`, `cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_conc_displacement`, `cmj_braking_duration`, `cmj_propulsion_eff`, `cmj_braking_eff`, `cmj_ft_ct_ratio`, `cmj_ecc_decel`, `cmj_landing_rfd`, `cmj_landing_mean_power` | measures / Determinante (16 variables) | Explicative biomécanique CMJ ("décrivent la stratégie... ne doivent pas construire le diagnostic") |
| `slcmj_rsi_mod`, `slcmj_peak_conc_force`, `slcmj_peak_conc_vel`, `slcmj_edrfd_bm`, `slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_depth`, `slcmj_contraction_time`, `slcmj_ecc_duration`, `slcmj_conc_duration`, `slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab` | measures / Determinante (14 variables) | Explicative biomécanique SLCMJ |

**32 variables** actuellement traitées comme diagnostiques déterminantes du score de Puissance,
alors qu'aucune d'entre elles ne l'est selon Vierge_7 — c'est le cœur du problème "tout contribue
un peu à tout".

### 1.3 — Variables à reclasser en confirmatives

| Variable | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `cmj_height` | estimates / Majeure | Confirmative |
| `dj_peak_prop_power` | estimates / Moderee | Diagnostique principal contextuel (**pas confirmative — voir 1.2bis ci-dessous**) |
| `sldj_peak_prop_power` | estimates / Moderee | Diagnostique principal contextuel unilatéral (idem) |
| `cmjr_peak_power` | estimates / Moderee | Diagnostique contextuel (idem) |
| `single_hop_distance`, `triple_hop_distance` | estimates / Moderee | Confirmative (tests horizontaux/fonctionnels) |

**1.2bis — Cas particulier** : `dj_peak_prop_power`, `sldj_peak_prop_power` et `cmjr_peak_power`
sont aujourd'hui sous-classées (`estimates`/Moderee, niveau confirmatif) alors que Vierge_7 les
désigne comme diagnostiques — seulement *contextuelles* (utilisées quand CMJ/SLCMJ ne sont pas
disponibles ou pour compléter). Distinction à trancher en Phase C : Vierge_7 ne prévoit pas encore
de sous-catégorie "diagnostique contextuel" dans le modèle HYP### — proposition : traiter ces trois
variables comme des **preuves diagnostiques secondaires** de la même hypothèse que
`cmj_peak_power`/`slcmj_peak_power`, jamais comme confirmatives d'une autre nature.

### 1.4 — Variables à reclasser en explicatives physiologiques

| Variable(s) | VAR_REL3 aujourd'hui | Note |
|---|---|---|
| `knee_ext_*`, `knee_flex_*`, `soleus_iso_*`, `gastro_iso_*`, `hip_flex_*`, `hip_ext_*`, `hip_abd_*`, `hip_add_*`, `sl_iso_push_*`, `iso_belt_squat_*`, `iso_squat_hold_*` (force segmentaire + globale) | estimates / Mineure→Majeure selon le KPI | Vierge_7 : "Production de force globale/segmentaire" — explicatif physiologique, jamais diagnostique/confirmatif |
| `hip_rot_int_nkg`, `hip_rot_ext_nkg` | estimates / Mineure | Absent de la liste Vierge_7 pour Puissance — probablement du même groupe "force segmentaire", à confirmer |
| `rs_hip_push_*`, `rs_knee_push_*`, `rs_ankle_push_*` | non tagués Puissance actuellement | Vierge_7 : "Appuis spécifiques/propulsion locale" — explicatif physiologique — ➕ **manquant**, voir 1.6 |

### 1.5 — Variables à reclasser en explicatives biomécaniques

Déjà couvert en 1.2 pour le CMJ/SLCMJ (16 + 14 variables) — même liste, autre angle : ces variables
ne doivent pas disparaître de `VAR_REL3`, seulement changer de rôle (diagnostique → explicatif
biomécanique).

### 1.6 — Variables manquantes par rapport à Vierge_7 (➕)

| Variable | Rôle Vierge_7 | Statut dans VAR_REL3 |
|---|---|---|
| `cmj_conc_mean_power`, `cmj_conc_peak_power` | Confirmative | Absentes du tag Puissance (existent sous d'autres noms proches — `cmj_conc_peak_force`/`cmj_conc_mean_force` — **à vérifier si confusion puissance/force dans le nommage actuel, pas seulement un oubli**) |
| `cmj_time_to_take_off` | Confirmative | Probablement déjà présent sous `cmj_tto` (à confirmer — simple différence de nommage, pas un manque réel) |
| `slcmj_height`, `slcmj_ft_ct_ratio` | Confirmative | Absentes |
| `dj_height`, `dj_rsi`, `dj_contact_time`, `dj_leg_stiffness` | Confirmative | Absentes (seules `dj_peak_landing_force`/`dj_landing_impulse` sont taguées, en excès de poids — voir 1.3) |
| `sldj_height`, `sldj_rsi`, `sldj_tts`, `sldj_contact_time`, `sldj_leg_stiffness`, `sldj_peak_landing_force`, `sldj_landing_impulse` | Confirmative | Absentes |
| `rs_hip_push_*`, `rs_knee_push_*`, `rs_ankle_push_*` | Explicative physiologique | Absentes (voir 1.4) |

### 1.7 — Variables explicitement exclues du diagnostic (🚫 violations trouvées)

| Variable | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `wblt_distance` | estimates / Mineure pour Puissance | **Exclusion explicite** — "variables de mobilité/équilibre/contrôle sensoriel... ne doivent pas construire le diagnostic de puissance" |

Une seule violation d'exclusion trouvée pour cette qualité, mais elle est directe et non ambiguë.
Aucune trace d'asymétries, de variables d'absorption pure (`landing_*_tts`, `sllt_*`) ni de tests
d'endurance/résistance (`heel_raise_reps`, `repeated_hop_*`) taguées Puissance dans `VAR_REL3` —
conforme à l'exclusion Vierge_7 sur ces points.

**Anomalie annexe (hors exclusion Vierge_7, propre au code actuel)** : `sh_iso_9020` et
`sh_iso_6060` sont tagués Puissance (Mineure) alors que `sh_iso_9090` et `sh_iso_3030` — même
famille de test — ne le sont pas. Vierge_7 ne mentionne d'ailleurs aucun `sh_iso_*` pour Puissance.
Incohérence interne au code, indépendante de Vierge_7 : à corriger par suppression complète de la
famille `sh_iso_*` du tag Puissance plutôt que par alignement partiel.

**Test Kinexus non couvert par Vierge_7** : `seated_calf_raise_*` et `standing_calf_raise_*` sont
tagués Puissance (Moderee) dans `VAR_REL3` mais n'apparaissent dans **aucune** liste de la section
Puissance de Vierge_7 (ni diagnostique, ni confirmative, ni explicative, ni exclue). Vierge_7 ne les
oublie pas ailleurs par hasard : ces tests n'existent tout simplement pas dans son référentiel
(document conçu autour d'un socle CMJ/SLCMJ/IMTP/segmentaire, sans ces variantes de mollet). **À
clarifier avec le praticien avant Phase B** : ces tests suivent-ils la même logique que
`soleus_iso`/`gastro_iso` (explicatif physiologique), ou faut-il les considérer hors-scope de
Puissance ?

### 1.8 — Incohérences relevées dans Vierge_7 lui-même (signalement, pas correction silencieuse)

1. **Jump Height, diagnostique ou confirmative ? Contradiction interne.** Le tableau récapitulatif
   en tête du document Vierge_7 ("Exemple : Qualité Puissance", tableau à colonnes
   Priorité/ID Kinexus/Variable/Rôle) liste `CMJ_JH` (Jump Height) et `SLCMJ_JH` avec le rôle
   **"Diagnostique"**, au même titre que Peak Power/BM. Mais la section détaillée qui suit
   immédiatement (`PREUVES DIAGNOSTIQUES` / `PREUVES CONFIRMATIVES`) ne retient que
   `cmj_peak_power`/`slcmj_peak_power` comme diagnostiques et **rétrograde `cmj_height` en
   confirmative**. Les deux sections se contredisent sur le rôle d'une variable pourtant centrale
   et intuitive pour un praticien. À trancher explicitement avant Phase C : le tableau récapitulatif
   est-il une erreur (rôle simplifié pour l'exemple), ou la section détaillée est-elle celle qui
   fait foi ?
2. **CMJR : mêmes variables listées à la fois en confirmatives et en explicatives biomécaniques.**
   `cmjr_mean_rebound_height`, `cmjr_peak_power`, `cmjr_mean_rsi`, `cmjr_mean_stiffness`
   apparaissent identiquement dans la section "Preuves confirmatives" (bloc CMJR) et dans la
   section "Preuves explicatives biomécaniques" (bloc CMJR, qui ajoute seulement `mean_ct`,
   `rsi_decay`, `stiffness_decay`). Cela contredit la propre règle énoncée par Vierge_7 en
   introduction ("chaque variable de Kinexus ait un statut officiel, indépendamment des qualités") —
   qui implique un rôle unique par variable × qualité. Soit un doublon rédactionnel à corriger, soit
   une nuance volontaire (une variable peut confirmer ET expliquer simultanément) qu'il faut alors
   documenter comme règle générale plutôt que comme cas isolé du CMJR.
3. **Statut de `dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power` : "diagnostique
   contextuel" n'est pas un rôle défini par la grille en 3 niveaux du document.** Le principe
   fondamental de Vierge_7 (page 1) ne connaît que 3 niveaux (diagnostique/confirmative/
   explicative). "Contextuel" est un qualificatif ajouté informellement à certaines variables
   diagnostiques (DJ, SLDJ, CMJR) sans définition formelle de ce que ce mot change dans le
   raisonnement — voir 1.3bis ci-dessus pour la proposition de traitement en Phase C.

### 1.9 — Impact attendu sur le moteur après correction

- Le score de Puissance ne sera plus influencé numériquement par ~146 des 148 variables
  actuellement taguées — seules 2 à 5 variables diagnostiques (selon l'arbitrage du point 1.3bis)
  porteront le diagnostic.
- Conséquence clinique directe : un athlète avec un déficit isolé de force segmentaire (ex.
  quadriceps) mais un `cmj_peak_power` normal ne sera plus vu comme "Puissance diminuée" — ce que
  le modèle pondéré actuel peut produire aujourd'hui puisque `knee_ext_nkg` y contribue (Majeure)
  au score de Puissance. C'est très probablement la source concrète des faux positifs/dilutions
  que la nouvelle architecture cherche à éliminer.
- Un déficit isolé de WBLT (mobilité) ne pourra plus, même marginalement, abaisser le score de
  Puissance (violation d'exclusion corrigée).
- Les variables retirées du diagnostic (IMTP, SLIMTP, profil F-V, CMJ/SLCMJ biomécaniques) ne
  disparaissent pas de Kinexus : elles deviennent les preuves explicatives qui alimenteront le Fil
  de Raisonnement et la génération d'hypothèses concurrentes (ex. distinguer "déficit de puissance
  par manque de force" vs "déficit de puissance par stratégie/timing").

---

## 2. Réactivité

*Tests Vierge_7 pour cette qualité : DJ, SLDJ, CMJR, tests horizontaux/fonctionnels (single/triple/
crossover hop), test à rebonds répétés (repeated_hop). Note : le CMJ "simple" n'apparaît dans
aucune section de Réactivité — seuls les tests de rebond/contact rapide y figurent.*

### 2.1 — Variables diagnostiques conformes (déjà correctes)

| Variable | Test | VAR_REL3 (bucket/poids) | Vierge_7 (rôle) |
|---|---|---|---|
| `dj_rsi` | DJ | measures / Determinante | Diagnostique principal |
| `sldj_rsi` | SLDJ | measures / Determinante | Diagnostique principal unilatéral |

Seules **2 variables** sur les 25 entrées actives (orthographe correcte) taguées "Réactivité"
sont diagnostiques selon Vierge_7 — même ratio que pour Puissance. Note mineure : `dj_rsi` possède
aussi une entrée `estimates`/Majeure dupliquée et sans effet (le code priorise `measures` si
présent) — doublon de saisie sans conséquence, à nettoyer en Phase C.

### 2.2 — Variables diagnostiques en excès (à retirer du diagnostic)

| Variable(s) | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `dj_contact_time` | measures / Determinante | Confirmative + explicative biomécanique |
| `sldj_contact_time` | measures / Determinante | Confirmative + explicative biomécanique |
| `repeated_hop_best_rsi`, `repeated_hop_mean_ct`, `repeated_hop_mean_rsi` | measures / Determinante | **Exclusion explicite** — "Variables d'endurance / fatigue" (voir 2.7, violation la plus sévère relevée à ce stade de l'audit) |

**5 des 7 variables** actuellement au poids diagnostique maximal ne devraient pas y être — dont 3
qui sont en réalité des exclusions explicites de Vierge_7, pas de simples reclassements.

### 2.3 — Variables à reclasser en confirmatives

| Variable | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `dj_height` | estimates / Majeure | Confirmative |
| `sldj_height` | estimates / Majeure | Confirmative |
| `dj_peak_prop_force`, `dj_peak_prop_power` | estimates / Moderee | Confirmative + explicative biomécanique (double rôle, voir 2.8) |
| `dj_leg_stiffness` | estimates / Majeure | Confirmative + explicative biomécanique (double rôle) |

Ces 5 variables sont déjà dans le bon bucket directionnel (`estimates`, pas `measures`) — seul le
rôle formel change, pas de correction de poids majeure attendue.

### 2.4 — Variables à reclasser en explicatives physiologiques

| Variable(s) | VAR_REL3 aujourd'hui | Note |
|---|---|---|
| `gastro_iso_rfd150`, `knee_ext_rfd150`, `soleus_iso_rfd150` | estimates / Majeure | Vierge_7 : "Production de force rapide" (RFD globale/segmentaire) — explicatif physiologique, jamais diagnostique/confirmatif |

**Anomalie de tagging trouvée en marge (pas un simple reclassement)** : `gastro_iso_nkg`,
`soleus_iso_nkg` (estimates/Moderee) et `knee_ext_nkg`, `knee_flex_nkg` (estimates/Mineure) sont
également tagués Réactivité aujourd'hui. Or ce sont des KPIs de **force maximale** (`nkg`), pas de
vitesse de production de force (`rfd`) — Vierge_7 ne cite strictement que la famille `*_rfd*` pour
l'explicatif physiologique de Réactivité, jamais les KPIs de force max. Traitement recommandé :
❌ retrait pur (mauvaise catégorie conceptuelle), pas reclassement — la force maximale segmentaire
est déjà couverte comme explicatif physiologique de Puissance (voir audit 1.4), l'ajouter aussi à
Réactivité revient à la même dilution "tout contribue à tout" identifiée sur Puissance.

### 2.5 — Variables à reclasser en explicatives biomécaniques

Même liste qu'en 2.3 (DJ : `dj_contact_time`, `dj_leg_stiffness`, `dj_peak_landing_force` [➕
manquant, voir 2.6], `dj_landing_impulse` [➕ manquant], `dj_peak_prop_force`, `dj_peak_prop_power`
— plus `dj_braking_impulse`, absent de Kinexus, voir 2.6). Vierge_7 documente la même variable à la
fois comme confirmative et explicative biomécanique pour DJ/SLDJ — cf. 2.8 point 2, qui rejoint et
renforce un constat déjà fait sur Puissance (CMJR).

### 2.6 — Variables manquantes par rapport à Vierge_7 (➕)

| Variable | Rôle Vierge_7 | Statut dans VAR_REL3 |
|---|---|---|
| `dj_landing_impulse`, `dj_peak_landing_force` | Confirmative + explicative biomécanique | Taguées, mais sous l'orthographe **inerte** `"Reactivite"` (voir section 0) — ne comptent pas aujourd'hui |
| `sldj_tts`, `sldj_peak_prop_force`, `sldj_leg_stiffness`, `sldj_landing_impulse`, `sldj_peak_landing_force` | Confirmative + explicative biomécanique | Idem, orthographe inerte |
| `sldj_peak_prop_power` | Confirmative + explicative biomécanique | Absente pour Réactivité sous toute orthographe (taguée uniquement Puissance) |
| `dj_braking_impulse` | Explicative biomécanique | N'existe **pas du tout** comme variable dans `VAR_REL3`, quelle que soit la qualité — KPI absent de Kinexus |
| `cmjr_mean_rsi`, `cmjr_mean_ct`, `cmjr_peak_power`, `cmjr_mean_rebound_height`, `cmjr_mean_stiffness`, `cmjr_rsi_decay`, `cmjr_stiffness_decay` | Confirmative (+ explicative biomécanique pour les 6 premières) | Taguées, mais toutes sous l'orthographe **inerte** `"Reactivite"`/Determinante — inertes aujourd'hui, et le poids qu'elles portent (Determinante) est de toute façon trop élevé par rapport à leur rôle Vierge_7 |
| `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance` | Confirmative | Taguées Puissance/Propulsion, jamais Réactivité — alors que Vierge_7 les cite comme preuve confirmative des deux qualités simultanément |
| `repeated_hop` (variable "test", sans suffixe KPI) | Confirmative | N'existe pas comme clé dans `VAR_REL3` — Kinexus ne modélise ce test qu'au niveau KPI (`repeated_hop_mean_rsi`, etc.), jamais au niveau test global. Décalage de granularité avec Vierge_7, voir 2.8 point 1 |
| Familles RFD complètes (`rfd50/100/200/ttpf`) pour `knee_ext`, `gastro_iso`, `soleus_iso` (seul `rfd150` est tagué) + familles entièrement absentes pour Réactivité : `hip_flex_rfd*`, `hip_ext_rfd*`, `hip_abd_rfd*`, `hip_add_rfd*`, `df_iso_rfd*`, `inv_iso_rfd*`, `ev_iso_rfd*`, `sh_iso_9020/9090/3030/6060_rfd*`, `imtp_rfd100/200/ttpf`, `slimtp_rfd100/200/ttpf`, `iso_belt_squat_rfd*`, `sl_iso_push_rfd*`, `iso_squat_hold_rfd*`, `profil_fv_nkg/v0` | Explicative physiologique | Quasi totalement absentes du tag Réactivité — sur ~90 variables listées par Vierge_7 dans cette section, seules 3 (`*_rfd150` de 3 familles) sont taguées aujourd'hui |

Le dernier point est le plus large en volume, mais le moins urgent cliniquement : ce sont des
preuves explicatives (jamais diagnostiques), leur absence actuelle prive le Fil de Raisonnement de
profondeur explicative mais ne fausse aucun score.

### 2.7 — Variables explicitement exclues du diagnostic (🚫 violations trouvées)

| Variable | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `wblt_distance` | estimates / Mineure | **Exclusion explicite** — mobilité/équilibre/contrôle sensoriel ne doivent pas construire le diagnostic de réactivité (même violation que sur Puissance) |
| `repeated_hop_best_rsi`, `repeated_hop_mean_ct`, `repeated_hop_mean_rsi` | measures / **Determinante** | **Exclusion explicite** — "Variables d'endurance / fatigue" |

**C'est la violation la plus sévère identifiée dans l'audit à ce stade** : contrairement à
`wblt_distance` (poids Mineure sur Puissance), ces 3 variables `repeated_hop` sont actives, taguées
avec l'orthographe correcte, et pèsent au niveau **Determinante** — le niveau de poids maximal,
identique à celui de `dj_rsi`/`sldj_rsi`. Concrètement, un athlète dont le RSI se dégrade sur des
contacts répétés (signal de fatigue/endurance selon Vierge_7) peut aujourd'hui faire chuter le
score de Réactivité au même titre qu'un déficit réel de restitution rapide de force au premier
contact — deux phénomènes cliniquement différents que le modèle actuel ne distingue pas.

Aucune variable d'asymétrie (`*_asym`) n'est taguée Réactivité dans `VAR_REL3` — conforme à
l'exclusion Vierge_7 sur ce point (aucune violation trouvée ici, contrairement au point ci-dessus).

### 2.8 — Incohérences relevées dans Vierge_7 lui-même (signalement, pas correction silencieuse)

1. **Contradiction interne sur le rôle de `repeated_hop`.** La section "Preuves confirmatives"
   cite le test `repeated_hop` (sans suffixe) comme confirmant "la capacité à répéter des contacts
   et à maintenir une restitution efficace dans le temps". Quelques paragraphes plus loin, la
   section "Variables exclues" liste explicitement `repeated_hop_mean_rsi`, `repeated_hop_mean_ct`,
   `repeated_hop_best_rsi` (entre autres) comme des "variables d'endurance / fatigue" à exclure du
   diagnostic de réactivité — ce sont précisément les KPIs qui mesureraient "la restitution
   efficace dans le temps" évoquée en confirmative. Kinexus n'ayant pas de variable "test global"
   `repeated_hop` (uniquement des KPIs suffixés), cette contradiction n'est pas seulement
   rédactionnelle : elle empêche de savoir quel KPI concret rattacher à la preuve confirmative
   promise par le document. À trancher avant Phase C : soit un sous-ensemble précis des KPIs
   `repeated_hop_*` est confirmatif (lesquels ?), soit le test entier est exclu et la phrase
   "Preuves confirmatives" doit être retirée ou reformulée.
2. **Le chevauchement confirmative / explicative biomécanique observé sur CMJR (Puissance, voir
   1.8 point 2) se reproduit à l'identique sur DJ et SLDJ.** `dj_contact_time`, `dj_leg_stiffness`,
   `dj_peak_landing_force`, `dj_landing_impulse`, `dj_peak_prop_force`, `dj_peak_prop_power` (et
   l'équivalent SLDJ) apparaissent mot pour mot dans les deux sections. Ce n'est donc plus un cas
   isolé propre au CMJR : c'est un motif récurrent chez Vierge_7 (au moins 3 tests sur les 2
   qualités auditées à ce stade). Je recommande de ne plus le signaler qualité par qualité mais de
   le traiter une fois pour toutes en Phase B : soit codifier explicitement "une variable brute
   de test peut être simultanément confirmative ET explicative biomécanique" comme règle générale
   du modèle HYP###, soit fusionner ces deux sections quand leur contenu est identique.

### 2.9 — Impact attendu sur le moteur après correction

- Comme pour Puissance, le diagnostic de Réactivité reposera sur 2 variables (`dj_rsi`/`sldj_rsi`)
  au lieu des 7 actuelles au poids maximal — confirmation d'un motif qui se dessine sur les deux
  premières qualités auditées : Kinexus semble conçu autour d'un unique "KPI flagship" bilatéral +
  unilatéral par qualité, le reste étant systématiquement démoté en confirmatif/explicatif. Utile à
  garder en tête comme heuristique de conception pour la Phase B/C plutôt que de re-découvrir ce
  schéma qualité par qualité.
- Correction clinique la plus significative : un athlète en fatigue de contacts répétés (RSI qui
  se dégrade sur `repeated_hop`) ne sera plus vu comme ayant une "Réactivité diminuée" par ce seul
  signal — ce sera reclassé comme signal d'endurance/fatigue, une hypothèse clinique distincte.
- La correction de l'orthographe inerte (section 0) devra être faite *en même temps* que la
  requalification des rôles CMJR/DJ/SLDJ manquants (2.6), pas avant ni séparément — sinon elle
  activerait 8 variables à Determinante que Vierge_7 ne veut jamais au niveau diagnostique.
- Un déficit isolé de WBLT (mobilité) ne pourra plus abaisser, même marginalement, le score de
  Réactivité (violation d'exclusion corrigée, même logique que pour Puissance).

---

## 3. Absorption

### 3.1 — Résumé exécutif

Absorption a une structure diagnostique beaucoup plus large que Puissance/Réactivité : Vierge_7 y
définit **4 familles diagnostiques** (Landing unipodal, Landing bipodal, SLLT, CMJ phase
excentrique — 20 KPIs), pas 2 KPIs isolés. Résultat contrasté par famille :

- **SLLT : 100 % conforme.** Les 5 KPIs diagnostiques attendus par Vierge_7 sont exactement ceux
  tagués `measures`/Determinante dans `VAR_REL3`. Aucun écart.
- **Landing unipodal / Landing bipodal : écart critique, mais de nature différente des qualités
  précédentes.** Vierge_7 attend chacun 4-5 KPIs diagnostiques par test ; Kinexus n'a
  **littéralement aucune autre variable que `_tts`** dans son catalogue pour ces deux tests
  (`landing_uni_peak_landing_force`, `landing_uni_loading_rate`, `landing_uni_impulse`,
  `landing_uni_cop_path` — et leurs équivalents bipodaux — n'existent nulle part dans `VAR_REL3`,
  sous aucune qualité). Ce n'est donc pas un problème de classification à corriger en Phase C, mais
  un **manque de capture de données** en amont (pipeline d'extraction des KPIs de ces deux tests).
- **CMJ phase excentrique : quasi non implémenté comme preuve diagnostique.** 1 seule des 6
  variables attendues est taguée pour Absorption (`cmj_ecc_mean_power`, et seulement à Majeure, pas
  Determinante). Ici il y a un vrai souci de **correspondance de nommage** : Kinexus utilise une
  famille `cmj_braking_*` (impulse/peak_force/rfd/duration/eff/power) là où Vierge_7 écrit
  `cmj_ecc_dec_*` / `ecc_decel_*` — vraisemblablement le même phénomène physique (phase de
  freinage/décélération excentrique du CMJ) sous deux conventions de nommage différentes. À
  vérifier avec le praticien avant Phase C : correspondance 1-pour-1 à documenter, pas une absence
  réelle.
- **`wblt_distance` : violation la plus sévère trouvée dans l'audit à ce stade.** Tagué
  `measures`/Determinante ET `estimates`/Mineure simultanément pour Absorption (double entrée),
  alors que Vierge_7 le classe uniquement en explicatif physiologique mineur ("Mobilité
  disponible"). Contrairement au `wblt_distance` de Puissance (Mineure) ou au `repeated_hop` de
  Réactivité (Determinante mais au moins cohérent dans son bucket), ici la variable est présente
  **aux deux niveaux à la fois**, dont le plus élevé.
- Côté positif : **aucune violation d'exclusion active** trouvée (les 16 variables que Vierge_7
  exclut explicitement du diagnostic d'Absorption — réactivité pure, force max sans freinage,
  endurance — ne sont taguées Absorption nulle part dans `VAR_REL3`). Première qualité où la liste
  d'exclusion est intégralement respectée.

### 3.2 — Variables diagnostiques conformes (déjà correctes)

| Variable | Test | VAR_REL3 (bucket/poids) | Vierge_7 (rôle) |
|---|---|---|---|
| `landing_uni_tts` | Landing unipodal | measures / Determinante | Diagnostique principal |
| `landing_bi_tts` | Landing bipodal | measures / Determinante | Diagnostique principal de base |
| `sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`, `sllt_cop_path` | SLLT | measures / Determinante (5/5) | Diagnostique principal unilatéral — **famille intégralement conforme** |

### 3.3 — Variables diagnostiques en excès (à retirer du diagnostic)

| Variable(s) | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `wblt_distance` | measures / **Determinante** (+ estimates/Mineure, doublon) | Explicative physiologique uniquement — jamais diagnostique. 🔴 |
| `cmj_landing_impulse` | measures / Determinante | Confirmative (liste "CMJ") |
| `cmj_landing_peak_force`, `cmj_landing_mean_force`, `cmj_time_to_stab` | measures / Determinante | Ne figurent sous aucun nom dans le diagnostic Vierge_7 — `cmj_landing_peak_force` correspond probablement à `cmj_peak_landing_force` (confirmative, ordre des mots inversé, voir 3.8) ; `cmj_landing_mean_force`/`cmj_time_to_stab` n'ont aucun équivalent identifié |
| `cmj_braking_impulse`, `cmj_braking_peak_force`, `cmj_braking_rfd` | measures / Determinante | Aucun nom identique dans Vierge_7 — correspondance probable avec `cmj_ecc_dec_impulse`/`cmj_ecc_dec_rfd` (diagnostique, phase excentrique), à confirmer — voir 3.1 et 3.8 |

### 3.4 — Variables à reclasser en confirmatives

| Variable | VAR_REL3 aujourd'hui | Vierge_7 |
|---|---|---|
| `dj_landing_impulse`, `dj_peak_landing_force`, `sldj_landing_impulse`, `sldj_peak_landing_force` | estimates / Moderee | Confirmative (déjà bien bucketées, formaliser le rôle) |
| `cmj_braking_duration` | estimates / Moderee | Confirmative + explicative biomécanique (double rôle, motif déjà noté en 1.8/2.8 — pas re-détaillé ici) |

### 3.5 — Variables à reclasser en explicatives physiologiques

| Variable(s) | VAR_REL3 aujourd'hui | Note |
|---|---|---|
| Famille RFD partiellement taguée (`imtp_rfd200`, `slimtp_rfd100/200`, `iso_belt_squat_rfd200`, `sl_iso_push_rfd100/200`, `knee_ext_rfd200`, `soleus_iso_rfd200`, `gastro_iso_rfd200`, `hip_abd_rfd100`, `hip_add_rfd100`) | estimates / Moderee-Mineure | Déjà dans le bon bucket, formaliser le rôle "production de force excentrique" |
| `sls_ttf` | estimates / Majeure | Seul proxy Kinexus existant pour "Qualité du contrôle moteur" (voir 3.8 — Vierge_7 utilise des noms génériques `postural_control`/`single_leg_balance` qui n'existent pas comme clés Kinexus) |

### 3.6 — Variables à reclasser en explicatives biomécaniques

Même chevauchement confirmative/explicative-biomécanique déjà documenté 2 fois (1.8, 2.8) : DJ/SLDJ
landing (3.4) et CMJ freinage (`cmj_braking_duration`, `cmj_ecc_mean_power`) réapparaissent
identiques dans les deux sections chez Vierge_7. Motif désormais confirmé sur 3 qualités
consécutives — traité une fois pour toutes en Phase B (voir 2.8 point 2), pas re-détaillé qualité
par qualité à partir d'ici.

### 3.7 — Variables explicitement exclues mais actuellement utilisées (🚫)

**Aucune trouvée.** Les 16 variables que Vierge_7 exclut du diagnostic d'Absorption
(réactivité pure : `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`, `cmjr_mean_rebound_height`,
`single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance`,
`repeated_hop_mean_rsi` ; force maximale sans freinage : `q_iso_pvf`, `soleus_iso_pvf`,
`gastro_iso_pvf`, `imtp_pvf` ; endurance/répétition : `heel_raise_reps`,
`repeated_hop_ct_drift`, `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`) ne sont
taguées Absorption sous aucune orthographe dans `VAR_REL3`. 🟢 Première liste d'exclusion
intégralement respectée dans l'audit.

### 3.8 — Variables manquantes par rapport à Vierge_7 (➕)

| Variable | Rôle Vierge_7 | Statut dans VAR_REL3 |
|---|---|---|
| `landing_uni_peak_landing_force`, `landing_uni_loading_rate`, `landing_uni_impulse`, `landing_uni_cop_path` | Diagnostique principal | **N'existent pas du tout** comme clés — `landing_uni_tts` est la seule variable que Kinexus capture pour ce test. Gap de données, pas de classification |
| `landing_bi_peak_landing_force`, `landing_bi_loading_rate`, `landing_bi_impulse` | Diagnostique principal de base | Idem — `landing_bi_tts` est la seule variable existante |
| `cmj_ecc_peak_velocity`, `cmj_ecc_dec_rfd`, `cmj_ecc_dec_impulse` | Diagnostique principal indirect | `cmj_ecc_peak_vel` existe (probable même variable, nom légèrement différent) mais n'est taguée aucune qualité pour Absorption ; `cmj_ecc_dec_rfd`/`cmj_ecc_dec_impulse` n'existent sous ce nom nulle part — correspondance probable `cmj_braking_rfd`/`cmj_braking_impulse` (voir 3.1) |
| `cmj_ecc_dec_impulse_asym`, `cmj_ecc_dec_rfd_asym` | Diagnostique principal indirect | N'existent sous aucun nom — Kinexus ne capture pas d'asymétrie de freinage excentrique pour le CMJ (mouvement bilatéral, cohérent, mais à confirmer que ce n'est pas un vrai manque produit) |
| `cmj_countermovement_depth`, `cmj_ecc_duration`, `cmj_fts`, `cmj_peak_landing_force` | Confirmative | N'existent sous aucun nom (le "cmj_depth"/"cmj_tto" existants dans `VAR_REL3` sont peut-être les mêmes variables sous un autre nom — à vérifier) |
| `cmj_rsi_mod` | Confirmative (bloc CMJ) | Existe, mais tagué seulement Réactivité/Propulsion — jamais Absorption |
| `dj_contact_time`, `sldj_contact_time` | Confirmative | Existent, mais tagués seulement Réactivité — jamais Absorption (un test qui sert plusieurs qualités doit porter plusieurs tags, motif déjà vu sur Puissance/Réactivité avec `single_hop_distance` etc.) |
| Asymétries de freinage (`ecc_decel_rfd_asym`, `ecc_decel_impulse_asym`, `landing_peak_force_asym`, `landing_impulse_asym`, `sllt_loading_rate_asym`, `sllt_tts_asym`) | Confirmative | N'existent sous aucun nom dans `VAR_REL3`. **Point à vérifier avec le praticien avant de les classer comme un vrai manque** : Kinexus a un moteur d'asymétrie séparé (`computeAsymEngine`, hors `VAR_REL3`) — il est possible que ce rôle confirmatif soit déjà couvert ailleurs dans le pipeline, auquel cas il ne s'agit pas d'une lacune mais d'une séparation architecturale volontaire à documenter, pas à corriger |
| `postural_control`, `sensorimotor_control`, `single_leg_balance`, `reaction_to_perturbation` | Explicative physiologique | N'existent sous aucun nom Kinexus littéral. `sls_ttf` (Single Leg Stance, tagué Absorption/Majeure) est le seul proxy identifié ; `eo_surface`/`ef_surface`/`strobo_surface` existent aussi mais ne sont tagués que Stabilisation/Contrôle moteur, jamais Absorption |
| Reste de la famille RFD "production de force excentrique" (`imtp_rfd100`, `iso_belt_squat_rfd100`, `knee_ext_rfd100/150`, `soleus_iso_rfd100`, `gastro_iso_rfd100`, `hip_ext_rfd100`, `hip_flex_rfd100`) | Explicative physiologique | Couverture partielle et irrégulière — le `rfd200` de chaque famille est souvent tagué, le `rfd100` souvent absent, sans logique apparente |

### 3.9 — Gravité globale de l'écart

**🔴 Critique.** Deux raisons distinctes, cumulatives :
1. `wblt_distance` en double tag Determinante pour une qualité où Vierge_7 ne l'admet qu'en
   explicatif mineur — même classe de gravité que le `repeated_hop` de Réactivité (2.7).
2. Contrairement à Puissance/Réactivité où l'écart est presque entièrement un problème de
   *classification* (bonnes variables, mauvais bucket), Absorption cumule un problème de
   classification **et** un problème de **couverture de données** : 2 des 4 familles
   diagnostiques (Landing unipodal, Landing bipodal) reposent sur 80 % de KPIs que Kinexus ne
   capture tout simplement pas aujourd'hui. Une reconstruction Phase C ne suffira pas seule à
   corriger ce point — il faudra une décision produit sur l'enrichissement de l'extraction de ces
   deux tests, indépendamment du calendrier HYP###.

### 3.10 — Incohérences internes de Vierge_7

1. **Nommage `ecc_decel_*` vs `cmj_ecc_dec_*` au sein du même document.** La section diagnostique
   "CMJ phase excentrique" utilise `cmj_ecc_dec_rfd` / `cmj_ecc_dec_impulse` (préfixe `cmj_`,
   suffixe `_dec_`). La section explicative biomécanique "Stratégie de freinage" utilise
   `ecc_decel_rfd` / `ecc_decel_impulse` (pas de préfixe `cmj_`, `_decel_` au lieu de `_dec_`), et
   la section confirmative "Asymétries de freinage" utilise encore une troisième forme
   (`ecc_decel_rfd_asym`). *Où* : sections "PREUVES DIAGNOSTIQUES" / "PREUVES EXPLICATIVES
   BIOMÉCANIQUES" / "PREUVES CONFIRMATIVES" de la fiche Absorption. *Pourquoi c'est contradictoire* :
   rien n'indique explicitement si ces trois graphies désignent la même variable physique (phase de
   décélération excentrique du CMJ) ou des variables réellement distinctes (une générique
   "toutes phases confondues", une spécifique au CMJ). *Mon interprétation* : il s'agit très
   probablement de la même variable écrite de façon incohérente à trois endroits du document — le
   préfixe `cmj_` semble accidentel dans un cas et omis dans l'autre par inattention rédactionnelle
   plutôt que par intention. À trancher avec le praticien avant Phase C, car cela conditionne
   directement le mapping à faire avec le nommage réel de Kinexus (`cmj_braking_rfd`/
   `cmj_braking_impulse`, voir 3.1/3.8).
2. **Confirmative/explicative biomécanique dupliquées (CMJ, DJ/SLDJ)** — motif désormais observé
   sur 3 qualités consécutives (1.8 pt.2, 2.8 pt.2, ici). Je ne le re-détaille plus par qualité :
   il faudra une règle générale en Phase B (voir 2.8 pt.2).

### 3.11 — Impact attendu sur le moteur HYP###

- Le diagnostic d'Absorption devra s'appuyer sur les 5 KPIs SLLT (déjà solides) en priorité, avec
  `landing_uni_tts`/`landing_bi_tts` comme diagnostic complémentaire — mais avec une confiance
  mécaniquement plafonnée tant que le reste des KPIs de ces deux tests n'est pas capturé (le
  modèle HYP### pourra formellement représenter cette limite comme un niveau de preuve
  "modéré" au lieu de "fort" pour ces deux tests, même en l'absence d'anomalie clinique — ce n'est
  pas un problème clinique, c'est un problème d'instrumentation).
- Une fois la correspondance de nommage confirmée avec le praticien (3.10 pt.1), les KPIs
  `cmj_braking_*` existants pourront couvrir la case "CMJ phase excentrique" sans développement
  supplémentaire — bonne nouvelle, ce n'est probablement pas un vrai manque produit.
- Retirer `wblt_distance` du niveau diagnostique d'Absorption élimine un biais clinique direct :
  un déficit de mobilité de cheville ne pourra plus, à lui seul, faire chuter le score d'Absorption
  — il redevient un facteur explicatif parmi d'autres.
- Point à trancher avec le praticien avant Phase C, indépendant de HYP### : les asymétries de
  freinage (3.8) sont-elles déjà couvertes par le moteur d'asymétrie séparé, ou faut-il vraiment
  les ajouter comme preuves confirmatives dans le nouveau modèle de raisonnement ?

---

## 4. Force

*(en attente — la duplication identifiée dans Vierge_7 doit être résolue avant l'audit de cette
qualité — voir échange initial)*

---

## Qualités restantes à auditer

Stabilisation · Mobilité (Cheville) · Force (bloquée, voir section 4) · Explosivité ·
Contrôle Frontal · Contrôle Sensoriel · Endurance

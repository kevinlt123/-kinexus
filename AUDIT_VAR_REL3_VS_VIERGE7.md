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

## 3. Force

*(en attente — la duplication identifiée dans Vierge_7 doit être résolue avant l'audit de cette
qualité — voir échange initial)*

---

## Qualités restantes à auditer

Absorption · Stabilisation · Mobilité (Cheville) · Force (bloquée, voir section 3) · Explosivité ·
Contrôle Frontal · Contrôle Sensoriel · Endurance

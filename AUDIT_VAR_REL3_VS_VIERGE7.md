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

## 2. Force

*(en attente — la duplication identifiée dans Vierge_7 doit être résolue avant l'audit de cette
qualité — voir échange initial)*

---

## Qualités restantes à auditer

Explosivité · Réactivité · Absorption · Stabilisation · Contrôle Frontal · Contrôle Sensoriel ·
Endurance · Mobilité

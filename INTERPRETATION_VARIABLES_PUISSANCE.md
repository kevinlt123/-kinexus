# Interprétation clinique des variables explicatives de Puissance (HYP-PUI-01)

**Statut** : interprétation clinique variable par variable, pas une évolution d'architecture. Aucun
code, aucune nouvelle règle de décision, aucune nouvelle variable.

**Périmètre** : exclusivement les variables déjà listées comme explicatives de `HYP-PUI-01` dans
`CARTOGRAPHIE_VARIABLES_HYP.md`, reprises telles quelles dans `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` et
`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`. Aucune variable ajoutée, aucune retirée.

**Sources consultées pour ce document** (aucune autre) :
- `CARTOGRAPHIE_VARIABLES_HYP.md`, `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`,
  `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` — liste des variables et statuts déjà établis.
- `HYP_ARCHITECTURE_PHASE_C.md`, `HYP_ARCHITECTURE_PHASE_B.md` — catégorisation explicative
  d'origine.
- `index.html` (constantes `TESTS`, lignes 82-125, et `CMJ_VAR_META`, lignes 180-219) — **utilisé
  uniquement pour retrouver le libellé exact, l'unité et le sens de seuil (`dir:'max'`/`dir:'min'`)
  déjà codés dans l'application**, c'est-à-dire le niveau A ("ce que la variable mesure
  réellement") tel qu'il existe déjà dans Kinexus. Aucune donnée Vierge_7 n'est relue au-delà de ce
  qui est déjà cité dans les documents ci-dessus. `CMJ_VAR_META` appartient au moteur biomécanique
  par phase (`tier`/`weight`), une architecture distincte de HYP### — seuls le `phase` et le
  `valdName` sont réutilisés ici, jamais le `tier`/`weight`, pour éviter toute confusion entre les
  deux moteurs.

**Légende des statuts de preuve** (imposée par la mission — trois valeurs seulement) :
- **SOURCE EXPLICITE** — écrit littéralement dans une source ci-dessus.
- **INFERENCE** — cohérent avec les sources, non écrit littéralement.
- **NON DOCUMENTÉ** — absence d'information constatée.

*Convention appliquée strictement dans ce document* : le libellé Kinexus d'une variable (nom,
unité, sens du seuil `dir`) est **SOURCE EXPLICITE** — il est littéralement codé dans l'application.
Toute interprétation physiologique **au-delà** du libellé (ce qu'une valeur basse/haute *signifie
cliniquement*) est **INFERENCE**, sauf lorsque le document source lui-même formule explicitement
cette interprétation — auquel cas la formulation exacte est citée. Un mécanisme explicatif jugé
"physiologiquement plausible" mais non écrit dans les sources est marqué **NON DOCUMENTÉ**, jamais
présenté comme une conclusion.

---

## 1. Variables analysées — périmètre exact

Reprise strictement identique à `CARTOGRAPHIE_VARIABLES_HYP.md` (section Puissance, "Variables
explicatives"), 63 variables au total :

| Famille | Variables | Nombre |
|---|---|---|
| Force absolue/relative — IMTP | `imtp_n`, `imtp_nkg` | 2 |
| Force absolue/relative — SLIMTP | `slimtp_n`, `slimtp_nkg` | 2 |
| RFD/TTPF — IMTP | `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | 3 |
| RFD/TTPF — SLIMTP | `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | 3 |
| Profil force-vitesse | `profil_fv_nkg`, `profil_fv_v0` | 2 |
| Force segmentaire (n/nkg uniquement, 11 tests) | `knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `sl_iso_push`, `iso_belt_squat`, `iso_squat_hold` (×`n`,`nkg`) | 22 |
| Stratégie biomécanique CMJ | `cmj_peak_vel`, `cmj_tto`, `cmj_depth`, `cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_conc_displacement`, `cmj_braking_duration`, `cmj_propulsion_eff`, `cmj_braking_eff`, `cmj_ft_ct_ratio`, `cmj_ecc_decel`, `cmj_landing_rfd`, `cmj_landing_mean_power` | 15 |
| Stratégie biomécanique SLCMJ | `slcmj_rsi_mod`, `slcmj_peak_conc_force`, `slcmj_peak_conc_vel`, `slcmj_edrfd_bm`, `slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_depth`, `slcmj_contraction_time`, `slcmj_ecc_duration`, `slcmj_conc_duration`, `slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab` | 14 |
| **Total** | | **63** |

**Note explicative sur `sh_iso_*`** : les 4 tests d'épaule (`sh_iso_9020/9090/3030/6060`) figurent dans
la liste explicative de **Force** mais **pas** dans celle de Puissance — déjà signalé dans
`HYP_ARCHITECTURE_PHASE_C.md` et repris dans `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §3.A. Non repris
ici, conformément au périmètre.

### Choix de présentation pour ce document

63 fiches individuelles strictement identiques dans leur structure produiraient une redondance qui
nuirait à la lisibilité demandée ("je veux pouvoir prendre n'importe quelle variable... et
comprendre immédiatement"). Deux familles sont **structurellement répétitives** — même type de
mesure, seul le muscle ou le test change :
- **Force absolue/relative** (`_n`/`_nkg`, 13 tests) — une fiche par type de KPI (`_n`, `_nkg`),
  appliquée par table à chacun des 13 tests concernés.
- **RFD/TTPF** (`imtp`/`slimtp` uniquement) — une fiche par type de KPI (`_rfd100`, `_rfd200`,
  `_ttpf`), appliquée par table aux deux tests concernés.

Les 31 variables restantes (`profil_fv` ×2, stratégie CMJ ×15, stratégie SLCMJ ×14) sont
**mécaniquement distinctes** les unes des autres (phases biomécaniques différentes) et reçoivent
chacune une fiche individuelle complète, au format demandé. La section 5 (matrice causale) restitue
ensuite les 63 variables une par une, sans regroupement, pour l'usage "recherche rapide."

---

## 2. Distinction stricte des niveaux A/B/C/D — démonstration

Avant les fiches, un exemple entièrement travaillé, au format demandé par la mission, sur
`cmj_ecc_peak_vel` — **attention** : cette variable **n'appartient pas** à la liste explicative de
Puissance (elle est diagnostique/explicative d'Absorption, cf. `CARTOGRAPHIE_VARIABLES_HYP.md`
section Absorption). Elle sert ici uniquement d'illustration de méthode, comme demandé par
l'exemple de la mission — la fiche réelle correspondante pour Puissance se trouve en §3.4
(`cmj_ecc_peak_vel` n'y figure pas ; l'équivalent réellement explicatif de Puissance dans la même
phase biomécanique est `cmj_ecc_decel`, traité en §3.4).

```
cmj_ecc_peak_vel ↓ (variable d'illustration, hors périmètre Puissance)

A. Ce que la variable mesure réellement
   Libellé Kinexus : "Peak Eccentric Velocity (m/s)", dir:max (index.html, TESTS/cmj).
   → SOURCE EXPLICITE.

B. Ce que sa valeur basse/haute signifie
   dir:max signifie qu'une valeur BASSE est le sens du seuil de déficit dans le moteur de
   classification de Kinexus (applyThr). Une interprétation physiologique plus fine ("vitesse
   excentrique de descente insuffisante") n'est pas formulée littéralement dans les documents
   HYP### consultés.
   → INFERENCE pour l'interprétation physiologique ; SOURCE EXPLICITE pour le sens du seuil.

C. Ce qu'elle peut expliquer dans HYP
   N'appartient à aucune liste explicative de Puissance — n'explique donc rien pour HYP-PUI-01.
   → SOURCE EXPLICITE (absence constatée dans `CARTOGRAPHIE_VARIABLES_HYP.md`).

D. Ce que le moteur peut réellement conclure
   Rien, pour Puissance. Cette variable est mobilisable uniquement pour `HYP-ABS-01`.
   → SOURCE EXPLICITE.
```

Ce même enchaînement A→B→C→D structure chacune des fiches suivantes, via ses sections SI BASSE / SI
HAUTE / MÉCANISME / ORIENTATION CLI — sans répéter les lettres à chaque fois, par souci de
lisibilité, mais en respectant strictement la même discipline de preuve.

---

## 3. Fiches

### 3.1 Famille — Force absolue (`_n`)

### VARIABLE
`imtp_n`, `slimtp_n`, `knee_ext_n`, `knee_flex_n`, `soleus_iso_n`, `gastro_iso_n`, `hip_flex_n`,
`hip_ext_n`, `hip_abd_n`, `hip_add_n`, `sl_iso_push_n`, `iso_belt_squat_n`, `iso_squat_hold_n`

### TEST
Un test isométrique différent par variable (voir table d'application ci-dessous).

### RÔLE HYP
Explicative physiologique de `HYP-PUI-01`.

### SI VARIABLE BASSE
Libellé Kinexus commun aux 13 tests : *"Force absolue (N)"*, `dir:max` — une valeur basse est le
sens du déficit (`index.html`, `TESTS`). SOURCE EXPLICITE pour la mesure et le sens du seuil.
Interprétation : capacité à produire un pic de force maximale insuffisante sur le groupe musculaire
testé, en valeur absolue (non ajustée au poids de corps). INFERENCE au-delà du libellé littéral.

### SI VARIABLE HAUTE
Aucune signification négative attribuée par les sources à une valeur haute — `dir:max` indique
seulement qu'une valeur haute est la direction normale/désirée dans le moteur de seuil. NON
DOCUMENTÉ pour toute interprétation allant au-delà ("force excessive", "surcompensation").

### MÉCANISME
Catégorie "Force absolue/relative" citée comme explicative de Puissance (SOURCE EXPLICITE, §3.A de
`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`) : une capacité de production de force insuffisante peut
limiter la production de puissance mécanique lors du saut, la puissance étant mécaniquement le
produit force×vitesse. Ce lien mécanique général (force→puissance) n'est pas détaillé plus finement
par les sources pour chaque groupe musculaire pris individuellement. INFERENCE au-delà de la
catégorie globale "Force".

### ORIENTATION CLI
`CLI040` — aucune orientation mécanisme-spécifique ni segment-spécifique n'existe pour Puissance
(contrairement à Force, `CLI200`-`213`). SOURCE EXPLICITE (absence constatée,
`HYP_ARCHITECTURE_PHASE_C.md` : *"Aucun lien segmentaire dédié"*).

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, appartenance à la catégorie explicative, absence de CLI dédié) /
INFERENCE (interprétation physiologique fine, mécanisme précis par muscle).

**Table d'application (13 tests)**

| Variable `_n` | Test (libellé Kinexus) |
|---|---|
| `imtp_n` | Isometric Mid-Thigh Pull |
| `slimtp_n` | Single Leg Isometric Mid-Thigh Pull |
| `knee_ext_n` | Knee Extension |
| `knee_flex_n` | Knee Flexion |
| `soleus_iso_n` | Single Leg Seated Isometric Calf Raise |
| `gastro_iso_n` | Single Leg Standing Isometric Calf Raise |
| `hip_flex_n` | Hip Flexion |
| `hip_ext_n` | Hip Extension |
| `hip_abd_n` | Hip Abduction |
| `hip_add_n` | Hip Adduction |
| `sl_iso_push_n` | Single Leg Isometric Squat Hold |
| `iso_belt_squat_n` | Isometric Belt Squat |
| `iso_squat_hold_n` | Isometric Squat Hold |

---

### 3.2 Famille — Force relative au poids de corps (`_nkg`)

### VARIABLE
`imtp_nkg`, `slimtp_nkg`, `knee_ext_nkg`, `knee_flex_nkg`, `soleus_iso_nkg`, `gastro_iso_nkg`,
`hip_flex_nkg`, `hip_ext_nkg`, `hip_abd_nkg`, `hip_add_nkg`, `sl_iso_push_nkg`,
`iso_belt_squat_nkg`, `iso_squat_hold_nkg`

### TEST
Mêmes 13 tests que §3.1.

### RÔLE HYP
Explicative physiologique de `HYP-PUI-01`.

### SI VARIABLE BASSE
Libellé Kinexus commun : *"Peak Force (N/kg)"*, `dir:max`. SOURCE EXPLICITE. Interprétation : force
maximale insuffisante **une fois rapportée au poids de corps** — un profil qui pourrait diverger de
`_n` (voir comparaison §4). INFERENCE au-delà du libellé.

### SI VARIABLE HAUTE
NON DOCUMENTÉ (même statut que §3.1).

### MÉCANISME
Identique à §3.1 (catégorie "Force absolue/relative"), avec la nuance "relative" plutôt
qu'"absolue" — SOURCE EXPLICITE pour la distinction absolu/relatif elle-même (déjà présente pour
l'orientation `CLI040`/`CLI041` de Puissance au niveau du diagnostic, §3 de
`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`, mais **non reprise explicitement** au niveau explicatif
segmentaire par les sources — traiter le lien "force relative segmentaire faible → oriente vers
`CLI041`" serait une extrapolation). INFERENCE pour ce lien précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE (absence de CLI dédié).

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (interprétation et lien avec `CLI041`).

**Table d'application** : identique à §3.1 (mêmes 13 tests, suffixe `_nkg`).

---

### 3.3 Famille — RFD (`_rfd100`, `_rfd200`) — IMTP/SLIMTP uniquement

**Point de méthode important** : le format d'exemple donné par la mission cite `imtp_rfd50` et
`imtp_rfd150` — ces deux KPI **existent** dans Kinexus (`index.html`, test `imtp`), mais **ne
figurent pas** dans la liste explicative de Puissance (`CARTOGRAPHIE_VARIABLES_HYP.md`,
`HYP_ARCHITECTURE_PHASE_C.md` : seuls `rfd100`/`rfd200`/`ttpf` sont cités pour Puissance). Ce
document ne les traite donc pas comme explicatifs de Puissance — signalé plutôt que silencieusement
ignoré, conformément au périmètre imposé ("ne pas ajouter de variables").

### VARIABLE
`imtp_rfd100`, `imtp_rfd200`, `slimtp_rfd100`, `slimtp_rfd200`

### TEST
Isometric Mid-Thigh Pull / Single Leg Isometric Mid-Thigh Pull.

### RÔLE HYP
Explicative physiologique de `HYP-PUI-01`.

### SI VARIABLE BASSE
Libellés Kinexus : *"RFD 0-100ms (N/s)"*, *"RFD 0-200ms (N/s)"*, `dir:max`. SOURCE EXPLICITE.
Interprétation : capacité insuffisante à développer de la force **rapidement** (dans les 100 ou 200
premières millisecondes de la contraction), distincte de la capacité à atteindre une force
**maximale** (mesurée par `_n`/`_nkg`, sans contrainte de temps). INFERENCE pour cette distinction
appliquée spécifiquement à Puissance — voir la réserve de statut détaillée en §3.4 du prototype
(catégorisation "mécanisme B distinct" jugée INFERENCE pour Puissance, SOURCE EXPLICITE seulement
pour Explosivité/`CLI030`).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Une production de force lente pourrait limiter la puissance de pic si le temps disponible pour
développer la force pendant le mouvement de saut est court — un raisonnement biomécanique standard,
**non formulé littéralement** dans les documents HYP### pour Puissance. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, appartenance) / INFERENCE (mécanisme, distinction avec la force maximale).

---

### VARIABLE
`imtp_ttpf`, `slimtp_ttpf`

### TEST
Isometric Mid-Thigh Pull / Single Leg Isometric Mid-Thigh Pull.

### RÔLE HYP
Explicative physiologique de `HYP-PUI-01`.

### SI VARIABLE BASSE
Libellé Kinexus : *"Time to Peak Force (ms)"*, `dir:min` — **ici, une valeur BASSE est la direction
normale/désirée** (sens de seuil inversé par rapport aux autres variables de cette famille). SOURCE
EXPLICITE. Une valeur **haute** est donc le sens du déficit pour cette variable précise — signalé
explicitement pour éviter une lecture erronée par analogie avec `_n`/`_nkg`/`_rfd*`.

### SI VARIABLE HAUTE
Temps nécessaire pour atteindre la force de pic anormalement long. INFERENCE pour l'interprétation
("production de force lente"), SOURCE EXPLICITE pour le sens du seuil (`dir:min`).

### MÉCANISME
Même famille que RFD100/200 (rapidité de production de force) — cohérent avec, mais redondant par
rapport à, un RFD bas. Les sources ne précisent pas si `ttpf` et `rfd100`/`rfd200` doivent être lus
comme deux mécanismes indépendants ou comme deux mesures d'un seul phénomène (voir §4).

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme).

---

### 3.4 Profil force-vitesse

### VARIABLE
`profil_fv_nkg`

### TEST
Profil Force-Vitesse (test bilatéral).

### RÔLE HYP
Explicative physiologique de `HYP-PUI-01`.

### SI VARIABLE BASSE
Libellé Kinexus : *"F0 (N/kg)"*, `dir:max`. SOURCE EXPLICITE. `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`
précise : *"capacité de force du profil force-vitesse"* — la composante force théorique du modèle
force-vitesse (extrapolation à vitesse nulle). SOURCE EXPLICITE pour cette qualification.

### SI VARIABLE HAUTE
NON DOCUMENTÉ au-delà du sens de seuil (`dir:max` = haute est la direction normale).

### MÉCANISME
Un F0 bas oriente, selon `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` (Profil 2, Arbre C), vers un profil
"orienté déficit de force" plutôt que "déficit de vitesse" — **INFERENCE**, déjà signalé comme tel
dans le prototype : cohérent avec la signification physique du modèle force-vitesse, mais aucune
orientation `CLI###` distincte ne cible ce sous-profil.

### ORIENTATION CLI
`CLI040`, sans distinction du sous-profil F0/V0. SOURCE EXPLICITE (absence de CLI dédié).

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, appartenance à la catégorie) / INFERENCE (lecture du sous-profil).

---

### VARIABLE
`profil_fv_v0`

### TEST
Profil Force-Vitesse.

### RÔLE HYP
Explicative physiologique de `HYP-PUI-01`.

### SI VARIABLE BASSE
Libellé Kinexus : *"V0 (m/s)"*, `dir:max`. SOURCE EXPLICITE. Composante vitesse théorique du modèle
force-vitesse (extrapolation à force nulle) — SOURCE EXPLICITE
(`LOGIQUE_CLINIQUE_VARIABLES_HYP.md` : *"composante vitesse du profil force-vitesse"*).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Un V0 bas oriente vers un profil "orienté déficit de vitesse" — INFERENCE, même statut que
`profil_fv_nkg` ci-dessus.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (lecture du sous-profil).

---

### 3.5 Stratégie biomécanique — CMJ (15 variables, organisées par phase VALD)

*Organisation par phase reprise de `CMJ_VAR_META` (`index.html`, lignes 180-219) — SOURCE
EXPLICITE, seule classification par phase disponible dans les sources pour ces variables.*

#### Phase Unloading

### VARIABLE
`cmj_depth`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique ("stratégie d'expression du CMJ").

### SI VARIABLE BASSE
Libellé : *"Countermovement Depth (cm)"*, `dir:max`. SOURCE EXPLICITE. `valdName` : "Countermovement
Depth" (`CMJ_VAR_META`). Une contre-mouvement moins profond que la normale. INFERENCE pour toute
lecture clinique au-delà de la mesure elle-même.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Catégorie "Stratégie d'expression du CMJ/SLCMJ" citée comme explicative de Puissance (SOURCE
EXPLICITE, `HYP_ARCHITECTURE_PHASE_C.md`). Un contre-mouvement de profondeur non optimale peut
modifier la production de puissance sans que la capacité de force sous-jacente soit en cause — lien
mécanique standard, non détaillé davantage par les sources. INFERENCE au-delà de la catégorie.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, catégorie) / INFERENCE (mécanisme précis).

---

### VARIABLE
`cmj_braking_duration`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Braking Phase Duration (ms)"*, `dir:min` — une valeur **basse** est la direction
normale/désirée ; une valeur **haute** est le sens du déficit (inversion à signaler, comme pour
`ttpf`). SOURCE EXPLICITE. `valdName` : "Eccentric Deceleration Phase Duration" (`CMJ_VAR_META`,
avec note : rattachement à la phase "Unloading" par choix Kinexus, la variable étant nativement une
mesure VALD de phase 2).

### SI VARIABLE HAUTE
Phase de freinage anormalement longue. INFERENCE pour l'interprétation.

### MÉCANISME
Même catégorie "stratégie d'expression". INFERENCE pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme).

---

#### Phase Braking (freinage excentrique)

### VARIABLE
`cmj_ecc_decel`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Eccentric Deceleration (m/s²)"*, `dir:max`. SOURCE EXPLICITE. `CMJ_VAR_META` : phase
braking, tier "info" (métrique affichée en contexte, non pondérée dans le moteur biomécanique par
phase — une architecture distincte, non pertinente pour son rôle explicatif HYP).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Catégorie "stratégie", phase de freinage excentrique. INFERENCE pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`cmj_braking_eff`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Braking Efficiency (%)"*, `dir:max`. SOURCE EXPLICITE. `CMJ_VAR_META` : phase braking,
tier info.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Catégorie "stratégie", efficacité de la phase de freinage. INFERENCE pour le mécanisme précis reliant
une efficacité de freinage réduite à une puissance de pic réduite.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

#### Phase Concentric (propulsion)

### VARIABLE
`cmj_conc_mean_force`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Concentric Mean Force (N/kg)"*, `dir:max`. SOURCE EXPLICITE. `valdName` : "Concentric
Mean Force" (`CMJ_VAR_META`, tier master).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Force moyenne développée pendant la phase de poussée — proche conceptuellement de la famille "Force"
(§3.1/3.2) mais mesurée spécifiquement pendant le mouvement de saut plutôt qu'en isométrique. Ce
rapprochement conceptuel (isométrique vs dynamique) n'est **pas formulé** comme tel dans les
sources. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme, rapprochement avec la famille Force).

---

### VARIABLE
`cmj_conc_mean_vel`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Concentric Mean Velocity (m/s)"*, `dir:max`. SOURCE EXPLICITE. `CMJ_VAR_META` : phase
concentric, tier info.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Rapprochement conceptuel possible avec la composante vitesse du profil force-vitesse (`profil_fv_v0`,
§3.4), non formulé comme tel par les sources. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme, rapprochement avec profil F-V).

---

### VARIABLE
`cmj_conc_rfd`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique de Puissance **et** diagnostique principal d'Explosivité (`HYP-EXP-01`,
`CARTOGRAPHIE_VARIABLES_HYP.md` section Explosivité) — rôle double, déjà documenté, signalé ici
explicitement.

### SI VARIABLE BASSE
Libellé : *"Concentric Rate of Force (N/s)"*, `dir:max`. SOURCE EXPLICITE. `HYP_ARCHITECTURE_PHASE_B.md`
précise que cette variable est la *"meilleure approximation mesurée du RFD concentrique précoce visé
par Vierge_7"* — non fenêtrée précisément sur les intervalles temporels visés à l'origine (limite
instrumentale documentée pour Explosivité, ADR-006). SOURCE EXPLICITE pour cette réserve.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Pour Puissance : catégorie "stratégie", RFD pendant la phase de propulsion du saut. Le fait que
cette même variable soit diagnostique pour Explosivité est cohérent avec le fait que `CLI040`
(Puissance) cite Explosivité comme qualité explicative possible (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`
§3.E) — mais ce rapprochement variable-à-variable reste **INFERENCE** : Vierge_7 cite la relation au
niveau qualité (Explosivité→Puissance), pas au niveau de cette variable précise.

### ORIENTATION CLI
`CLI040` pour Puissance ; `CLI030` pour Explosivité (rôle diagnostique, hors périmètre de ce
document). SOURCE EXPLICITE pour les deux rattachements, pris séparément.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, double rôle documenté, limite instrumentale) / INFERENCE (rapprochement
variable-à-variable avec Explosivité).

---

### VARIABLE
`cmj_conc_duration`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Concentric Duration (ms)"*, `dir:min` — inversion de seuil, une valeur **haute** est le
sens du déficit. SOURCE EXPLICITE. `CMJ_VAR_META` : phase concentric, tier info.

### SI VARIABLE HAUTE
Phase de poussée anormalement longue. INFERENCE pour l'interprétation.

### MÉCANISME
Catégorie "stratégie", durée de la phase de propulsion. INFERENCE pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme).

---

### VARIABLE
`cmj_conc_displacement`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Concentric Displacement (cm)"*, `dir:max`. SOURCE EXPLICITE. `CMJ_VAR_META` : phase
concentric, tier info.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Amplitude de la phase de poussée. INFERENCE pour le mécanisme précis reliant ce paramètre à une
puissance de pic réduite.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`cmj_propulsion_eff`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Propulsion Efficiency (%)"*, `dir:max`. SOURCE EXPLICITE. `CMJ_VAR_META` : phase
concentric, tier info.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Catégorie "stratégie". INFERENCE pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`cmj_peak_vel`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Peak Velocity (m/s)"*, `dir:max`. SOURCE EXPLICITE. Distincte de `conc_peak_vel`
("Concentric Peak Velocity") — les deux métriques coexistent dans Kinexus sans être interchangeables
(`index.html`, note explicite ligne 224-226 : *"Peak Velocity — distincte de conc_peak_vel"*). SOURCE
EXPLICITE pour cette distinction, à ne pas confondre lors de toute lecture future.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Catégorie "stratégie". Note complémentaire, SOURCE EXPLICITE : cette variable est identifiée dans
`index.html` comme *"discriminante dans 2 profils biomécaniques (Propulsif ET Explosif)"* — une
observation du moteur biomécanique par phase (architecture distincte de HYP###), citée ici pour
information, sans transposition automatique vers un mécanisme HYP validé. INFERENCE si utilisée
comme mécanisme explicatif HYP.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, distinction avec `conc_peak_vel`) / INFERENCE (transposition du constat
biomécanique vers un mécanisme HYP).

---

#### Phase Flight (résultat)

### VARIABLE
`cmj_ft_ct_ratio`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"FT:CT Ratio"*, `dir:max`. SOURCE EXPLICITE. `valdName` : "FT:CT" (`CMJ_VAR_META`, tier
master, phase flight).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Rapport temps de vol / temps de contact — variable de phase "résultat" selon `CMJ_VAR_META` (*"ne
produit aucune force propre"*, SOURCE EXPLICITE, ligne 198). Un FT:CT bas reflète une performance de
saut globalement réduite, cohérent avec un déficit de puissance sans en préciser la cause en amont.
INFERENCE pour cette lecture.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

#### Phase Landing (atterrissage)

### VARIABLE
`cmj_landing_rfd`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Landing RFD (N/s)"*, `dir:min` — inversion de seuil, une valeur **haute** est le sens du
déficit. SOURCE EXPLICITE. `CMJ_VAR_META` : phase landing, tier info.

### SI VARIABLE HAUTE
Taux de développement de force à l'atterrissage anormalement élevé. INFERENCE pour l'interprétation.

### MÉCANISME
Variable de phase d'atterrissage — postérieure à la production de puissance elle-même (qui se
produit en phase concentrique/propulsion). Son inclusion dans la liste explicative de Puissance
plutôt que d'Absorption (qui utilise des variables d'atterrissage comme diagnostiques) n'est pas
davantage justifiée par les sources au-delà de la catégorie générale "stratégie CMJ". INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme, justification de son
appartenance à Puissance plutôt qu'à Absorption).

---

### VARIABLE
`cmj_landing_mean_power`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Landing Mean Power (W/kg)"*, `dir:min` — inversion de seuil, une valeur **haute** est le
sens du déficit. SOURCE EXPLICITE. `CMJ_VAR_META` : phase landing, tier info.

### SI VARIABLE HAUTE
Puissance moyenne à l'atterrissage anormalement élevée. INFERENCE.

### MÉCANISME
Même remarque que `cmj_landing_rfd` — variable de phase postérieure à la production de puissance.
INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme).

---

### VARIABLE
`cmj_tto`

### TEST
Countermovement Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Time to Take Off (ms)"*, `dir:min` — une valeur basse est la direction normale ; une
valeur **haute** est le sens du déficit. SOURCE EXPLICITE. `CMJ_VAR_META.tto` précise : *"Time to
Take Off = temps de contraction total, dénominateur de RSI-Mod/FT:CT ; pas une variable de phase VALD
en soi"* — SOURCE EXPLICITE pour cette qualification transversale (elle intervient dans le calcul
d'autres indices plutôt que de représenter une phase isolée).

### SI VARIABLE HAUTE
Temps de contraction total anormalement long. INFERENCE.

### MÉCANISME
Variable transversale plutôt que spécifique à une phase — son rôle explicatif exact pour Puissance
au-delà de la catégorie générale "stratégie" n'est pas détaillé. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, rôle transversal) / INFERENCE (mécanisme).

---

### 3.6 Stratégie biomécanique — SLCMJ (14 variables)

**Avertissement de méthode** : contrairement au CMJ, **aucune métadonnée de phase équivalente à
`CMJ_VAR_META` n'existe dans `index.html` pour SLCMJ**. Le regroupement par phase ci-dessous est donc
une **organisation de présentation par analogie** avec le CMJ, **INFERENCE**, pas une classification
SOURCE EXPLICITE comme pour le CMJ. Seuls le libellé, l'unité et le `dir` de chaque KPI (issus de
`index.html`, `TESTS`/`slcmj`) restent SOURCE EXPLICITE.

#### Phase Unloading (par analogie)

### VARIABLE
`slcmj_depth`

### TEST
Single Leg Jump (SLCMJ).

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Countermovement Depth (cm)"*, `dir:max`. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Équivalent unilatéral de `cmj_depth` (§3.5). INFERENCE pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme, regroupement de phase par analogie).

---

#### Phase Braking (par analogie)

### VARIABLE
`slcmj_edrfd_bm`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"EDRFD / BM (N/s/kg)"*, `dir:max`. SOURCE EXPLICITE. Équivalent unilatéral de la variable
CMJ de référence "Eccentric Deceleration RFD/BM" (`braking_rfd` dans `CMJ_VAR_META`, tier master,
poids le plus élevé de la famille braking selon la même source) — SOURCE EXPLICITE pour ce
rapprochement de nommage (`valdName` partagé entre les deux tests dans `index.html`).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Taux de développement de force pendant la phase de freinage excentrique unilatérale. INFERENCE pour
le lien précis avec la puissance de pic.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, rapprochement de nommage avec le CMJ) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_braking_rfd`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Braking RFD (N/s)"*, `dir:max`. SOURCE EXPLICITE. **Distincte** de `slcmj_edrfd_bm`
ci-dessus (version non normalisée au poids de corps, deux clés séparées coexistant dans `index.html`
pour SLCMJ — à la différence du CMJ où `braking_rfd`/`braking_rfd_abs` jouent ce rôle). SOURCE
EXPLICITE pour la coexistence des deux variables, signalée pour éviter toute confusion.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Même famille que `slcmj_edrfd_bm`, version absolue plutôt que relative au poids de corps. INFERENCE
pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, distinction absolu/relatif) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_peak_braking_force`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Peak Braking Force (N/kg)"*, `dir:max`. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Force de pic pendant la phase de freinage unilatérale. INFERENCE pour le mécanisme précis.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_braking_impulse`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Braking Impulse (Ns/kg)"*, `dir:max`. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Impulsion pendant la phase de freinage unilatérale. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_ecc_duration`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Eccentric Duration (ms)"*, `dir:min` — une valeur basse est la direction normale ; une
valeur **haute** est le sens du déficit. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
Phase excentrique anormalement longue. INFERENCE.

### MÉCANISME
Durée de la phase de freinage/chargement unilatérale. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme).

---

#### Phase Concentric (par analogie)

### VARIABLE
`slcmj_peak_conc_force`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Peak Concentric Force (N/kg)"*, `dir:max`. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Équivalent unilatéral de `cmj_conc_mean_force` (proche conceptuellement, "peak" plutôt que "mean").
INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme, rapprochement avec le CMJ).

---

### VARIABLE
`slcmj_peak_conc_vel`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Peak Concentric Velocity (m/s)"*, `dir:max`. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Équivalent unilatéral conceptuel de `cmj_conc_mean_vel`/`cmj_peak_vel`. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_conc_duration`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Concentric Duration (ms)"*, `dir:min` — inversion de seuil, une valeur **haute** est le
sens du déficit. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
Phase de poussée unilatérale anormalement longue. INFERENCE.

### MÉCANISME
Équivalent unilatéral de `cmj_conc_duration`. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_contraction_time`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Contraction Time (ms)"*, `dir:min` — inversion de seuil. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
Temps de contraction total anormalement long. INFERENCE.

### MÉCANISME
Équivalent unilatéral conceptuel de `cmj_tto` (variable transversale plutôt que de phase). INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme, rapprochement avec `cmj_tto`).

---

#### Phase Flight (par analogie)

### VARIABLE
`slcmj_rsi_mod`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"RSI Mod"*, `dir:max`. SOURCE EXPLICITE. Équivalent unilatéral de `cmj_rsi_mod`
(variable de phase flight du CMJ selon `CMJ_VAR_META`, tier master).

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Indice composite de qualité du rebond (référence croisée : `CMJ_VAR_META` désigne `rsi_mod` comme
variable de phase "flight", résultat global plutôt que production de force isolée). INFERENCE pour
son rôle explicatif précis dans Puissance.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

#### Phase Landing (par analogie)

### VARIABLE
`slcmj_peak_landing_force`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique de Puissance **et** confirmative/diagnostique dans d'autres qualités
(`landing_uni`/SLLT pour Absorption — variables distinctes mais famille conceptuelle proche,
`CARTOGRAPHIE_VARIABLES_HYP.md`). Signalé pour éviter une confusion inter-qualités.

### SI VARIABLE BASSE
Libellé : *"Peak Landing Force (N/kg)"*, `dir:min` — une valeur basse est la direction normale ; une
valeur **haute** est le sens du déficit. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
Force de pic à l'atterrissage anormalement élevée. INFERENCE.

### MÉCANISME
Variable de phase d'atterrissage, postérieure à la production de puissance. Même remarque que
`cmj_landing_rfd`/`cmj_landing_mean_power` (§3.5) : son rattachement à Puissance plutôt qu'à
Absorption n'est pas justifié plus finement par les sources au-delà de la catégorie "stratégie
CMJ/SLCMJ". INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, sens de seuil inversé) / INFERENCE (mécanisme, justification de son
rattachement à Puissance).

---

### VARIABLE
`slcmj_landing_impulse`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Landing Impulse (Ns/kg)"*, `dir:max`. SOURCE EXPLICITE.

### SI VARIABLE HAUTE
NON DOCUMENTÉ.

### MÉCANISME
Même remarque que `slcmj_peak_landing_force`. INFERENCE.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure) / INFERENCE (mécanisme).

---

### VARIABLE
`slcmj_time_to_stab`

### TEST
Single Leg Jump.

### RÔLE HYP
Explicative biomécanique.

### SI VARIABLE BASSE
Libellé : *"Time to Stabilization (s)"*, `dir:min` — une valeur basse est la direction normale ; une
valeur **haute** est le sens du déficit. SOURCE EXPLICITE. Variable structurellement identique
(même nom, même unité) à celle utilisée comme **diagnostique principal** de Stabilisation
(`HYP-STAB-01`, via les tests Landing/SLLT — `CARTOGRAPHIE_VARIABLES_HYP.md`). Signalé explicitement :
il s'agit ici de la version issue du test SLCMJ, pas de la version Landing/SLLT utilisée par
Stabilisation — même grandeur physique mesurée par des tests différents. SOURCE EXPLICITE pour cette
homonymie, déjà repérée comme un point de vigilance dans `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`
(section Stabilisation, marquée [INFERENCE] pour le rôle explicatif de `wblt_distance`, situation
analogue de variable partagée entre plusieurs qualités).

### SI VARIABLE HAUTE
Temps de stabilisation anormalement long après l'atterrissage du SLCMJ. INFERENCE.

### MÉCANISME
Variable de phase d'atterrissage. INFERENCE pour son rôle explicatif précis dans Puissance plutôt
que comme signal autonome de contrôle de l'atterrissage.

### ORIENTATION CLI
`CLI040`. SOURCE EXPLICITE.

### NIVEAU DE PREUVE
SOURCE EXPLICITE (mesure, homonymie avec la variable diagnostique de Stabilisation) / INFERENCE
(mécanisme).

---

## 4. Comparer les variables entre elles

### Famille IMTP/SLIMTP (`_n`, `_nkg`, `_rfd100`, `_rfd200`, `_ttpf`)

**Commun** : même test, même contraction isométrique (Mid-Thigh Pull), même architecture de mesure
(force en fonction du temps) dont chaque KPI extrait une caractéristique différente.

**Différent** :
- `_n`/`_nkg` mesurent une **magnitude** (force de pic atteinte, en valeur absolue ou relative au
  poids), sans dimension temporelle.
- `_rfd100`/`_rfd200` mesurent une **pente** (force développée dans un intervalle de temps fixe
  depuis le début de la contraction).
- `_ttpf` mesure un **délai** (temps pour atteindre la force de pic, sans contrainte sur la
  magnitude atteinte).

**Représentent-elles des mécanismes réellement distincts dans les sources ?** Les cinq KPI sont
listés comme des variables explicatives séparées, ce qui établit leur **appartenance distincte** à
l'ensemble explicatif (SOURCE EXPLICITE). Mais la **catégorisation en mécanismes cliniquement
distincts** ("magnitude de force" vs "vitesse de production de force") n'est formulée explicitement,
dans le corpus consulté, que pour Explosivité (`CLI030`), pas pour Puissance elle-même — déjà noté en
§3.B du prototype. Pour Puissance : **NON DISCRIMINABLE AVEC LES SOURCES ACTUELLES** entre "ce sont
deux mécanismes cliniquement distincts" et "ce sont cinq mesures d'un seul mécanisme de force
sous-jacent, capturées sous des angles différents".

**Combinaison actuelle** : le moteur V1 ne combine pas ces cinq KPI selon une règle de vote ou de
pondération formalisée pour Puissance — chacun est individuellement une preuve explicative
convergente ou non (`KINEXUS_REASONING_ENGINE_V1.md` §3 : "cumulable... non substituable"). Rien ne
permet de dire aujourd'hui, par exemple, si `imtp_n` normal + `imtp_rfd100` déficitaire doit être lu
différemment de `imtp_n` déficitaire + `imtp_rfd100` normal. **NON DISCRIMINABLE AVEC LES SOURCES
ACTUELLES.**

### Famille Force segmentaire (`_n`/`_nkg`, 11 tests)

**Commun** : même paire de KPI (magnitude absolue/relative), même architecture de test isométrique,
même statut explicatif pour Puissance (aucun RFD segmental inclus, à la différence d'autres
qualités).

**Différent** : le groupe musculaire/articulaire testé (genou, cheville, hanche, tronc — selon le
test).

**Mécanismes distincts ?** Les 11 tests mesurent la **même grandeur physique** (force isométrique de
pic) sur des structures anatomiques différentes. Rien dans les sources ne hiérarchise ces 11 tests
entre eux pour Puissance (contrairement à Force, où le Niveau 2 `CLI200`-`213` établit une
correspondance test→orientation segmentaire précise). Un déficit sur `hip_ext_n` et un déficit sur
`gastro_iso_n` sont, du point de vue du moteur HYP-PUI-01, **strictement équivalents** — les deux
convergent vers le même mécanisme générique "Force" et la même orientation `CLI040`. **NON
DISCRIMINABLE AVEC LES SOURCES ACTUELLES** entre les 11 tests, pour Puissance spécifiquement (rappel :
pour Force elle-même, cette discrimination existe via `CLI200`-`213`, hors périmètre de ce document).

### Famille Stratégie CMJ (15 KPI, phases distinctes)

**Commun** : appartenance à la catégorie "stratégie d'expression du CMJ/SLCMJ" (SOURCE EXPLICITE),
tous mesurés lors du même essai de saut.

**Différent** : phase biomécanique (unloading/braking/concentric/flight/landing — SOURCE EXPLICITE
via `CMJ_VAR_META`), et nature physique de la mesure (durée, force, vitesse, ratio, efficacité).

**Mécanismes distincts ?** Contrairement à la famille segmentaire, ces 15 KPI mesurent des
**phénomènes physiquement différents** (freinage, propulsion, résultat, atterrissage) — la
distinction de phase est SOURCE EXPLICITE, pas une supposition. Mais le passage de "phase
biomécanique différente" à "cause clinique distincte de la puissance" **n'est pas établi** par les
sources — c'est une catégorisation descriptive du mouvement, pas une nosologie causale validée pour
HYP-PUI-01. **NON DISCRIMINABLE AVEC LES SOURCES ACTUELLES** au niveau causal, malgré une réelle
distinction au niveau descriptif/biomécanique.

### Famille Stratégie SLCMJ (14 KPI)

Mêmes constats que la famille CMJ, avec une réserve supplémentaire déjà signalée (§3.6) : le
regroupement par phase est lui-même INFERENCE pour SLCMJ (pas de `CMJ_VAR_META` équivalent). **NON
DISCRIMINABLE AVEC LES SOURCES ACTUELLES**, avec un niveau de preuve encore plus bas que pour le CMJ
sur le regroupement lui-même.

---

## 5. Matrice causale

| Variable | Bas = | Haut = | Mécanisme potentiel | Explique Puissance ? | Orientation CLI | Preuve |
|---|---|---|---|---|---|---|
| `imtp_n` | Force absolue insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `imtp_nkg` | Force relative insuffisante | non documenté | Force (magnitude, relative) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `imtp_rfd100` | Production de force lente (100ms) | non documenté | RFD | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `imtp_rfd200` | Production de force lente (200ms) | non documenté | RFD | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `imtp_ttpf` | (haut = déficit, voir colonne Haut) | Délai pour atteindre le pic anormalement long | RFD | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slimtp_n` | Force absolue insuffisante (unilatéral) | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slimtp_nkg` | Force relative insuffisante (unilatéral) | non documenté | Force (magnitude, relative) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slimtp_rfd100` | Production de force lente (unilatéral) | non documenté | RFD | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slimtp_rfd200` | Production de force lente (unilatéral) | non documenté | RFD | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slimtp_ttpf` | (haut = déficit) | Délai anormalement long (unilatéral) | RFD | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `profil_fv_nkg` | Composante force (F0) insuffisante | non documenté | Profil force-vitesse | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `profil_fv_v0` | Composante vitesse (V0) insuffisante | non documenté | Profil force-vitesse | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `knee_ext_n`/`_nkg` | Force du quadriceps insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `knee_flex_n`/`_nkg` | Force des ischio-jambiers insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `soleus_iso_n`/`_nkg` | Force du soléaire insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `gastro_iso_n`/`_nkg` | Force des gastrocnémiens insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `hip_flex_n`/`_nkg` | Force des fléchisseurs de hanche insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `hip_ext_n`/`_nkg` | Force des extenseurs de hanche insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `hip_abd_n`/`_nkg` | Force des abducteurs de hanche insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `hip_add_n`/`_nkg` | Force des adducteurs de hanche insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `sl_iso_push_n`/`_nkg` | Force chaîne extensrice unilatérale insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `iso_belt_squat_n`/`_nkg` | Force chaîne extensrice bilatérale insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `iso_squat_hold_n`/`_nkg` | Force chaîne extensrice bilatérale insuffisante | non documenté | Force (magnitude) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_depth` | Contre-mouvement moins profond | non documenté | Stratégie (unloading) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_braking_duration` | (haut = déficit) | Phase de freinage anormalement longue | Stratégie (unloading/braking) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_ecc_decel` | Décélération excentrique insuffisante | non documenté | Stratégie (braking) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_braking_eff` | Efficacité de freinage réduite | non documenté | Stratégie (braking) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_conc_mean_force` | Force moyenne de poussée insuffisante | non documenté | Stratégie (concentric) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_conc_mean_vel` | Vitesse moyenne de poussée insuffisante | non documenté | Stratégie (concentric) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_conc_rfd` | RFD concentrique insuffisant | non documenté | Stratégie (concentric) / lien qualité avec Explosivité | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_conc_duration` | (haut = déficit) | Phase de poussée anormalement longue | Stratégie (concentric) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_conc_displacement` | Amplitude de poussée réduite | non documenté | Stratégie (concentric) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_propulsion_eff` | Efficacité de propulsion réduite | non documenté | Stratégie (concentric) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_peak_vel` | Vitesse de pic insuffisante | non documenté | Stratégie (transversal) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_ft_ct_ratio` | Ratio vol/contact réduit | non documenté | Stratégie (flight, résultat) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_landing_rfd` | (haut = déficit) | RFD d'atterrissage anormalement élevé | Stratégie (landing) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_landing_mean_power` | (haut = déficit) | Puissance moyenne d'atterrissage anormalement élevée | Stratégie (landing) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `cmj_tto` | (haut = déficit) | Temps de contraction total anormalement long | Stratégie (transversal) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_rsi_mod` | Indice de rebond unilatéral réduit | non documenté | Stratégie (flight, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_peak_conc_force` | Force de pic concentrique unilatérale insuffisante | non documenté | Stratégie (concentric, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_peak_conc_vel` | Vitesse de pic concentrique unilatérale insuffisante | non documenté | Stratégie (concentric, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_edrfd_bm` | RFD de freinage unilatéral (relatif) insuffisant | non documenté | Stratégie (braking, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_braking_rfd` | RFD de freinage unilatéral (absolu) insuffisant | non documenté | Stratégie (braking, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_peak_braking_force` | Force de pic de freinage unilatérale insuffisante | non documenté | Stratégie (braking, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_braking_impulse` | Impulsion de freinage unilatérale insuffisante | non documenté | Stratégie (braking, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_depth` | Contre-mouvement unilatéral moins profond | non documenté | Stratégie (unloading, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_contraction_time` | (haut = déficit) | Temps de contraction total unilatéral anormalement long | Stratégie (transversal, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_ecc_duration` | (haut = déficit) | Phase excentrique unilatérale anormalement longue | Stratégie (braking, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_conc_duration` | (haut = déficit) | Phase concentrique unilatérale anormalement longue | Stratégie (concentric, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_peak_landing_force` | (haut = déficit) | Force de pic d'atterrissage unilatérale anormalement élevée | Stratégie (landing, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_landing_impulse` | Impulsion d'atterrissage unilatérale réduite | non documenté | Stratégie (landing, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |
| `slcmj_time_to_stab` | (haut = déficit) | Temps de stabilisation unilatéral anormalement long | Stratégie (landing, analogie) | Oui | `CLI040` | SOURCE EXPLICITE / INFERENCE |

*Colonne "Preuve" lue comme : SOURCE EXPLICITE pour la mesure/l'appartenance à l'ensemble
explicatif ; INFERENCE pour le mécanisme et l'interprétation clinique. Détail complet par variable en
§3.*

---

## 6. Profils cliniques

*Reprise du même principe que `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §5-6, appliquée ici au niveau
variable plutôt qu'au niveau famille de mécanisme.*

### Profil A — Puissance ↓ + Force ↓ + RFD ↓
`cmj_peak_power`↓ + `slcmj_peak_power`↓ (diagnostic) ; `imtp_n`↓ ou `slimtp_n`↓ (Force) ;
`imtp_rfd100`↓ ou `slimtp_rfd100`↓ (RFD).

**Ce que le moteur peut dire** : les deux catégories de preuve (magnitude et RFD) convergent, le
support progresse jusqu'à Retenue/Forte si une confirmative convergente accompagne également
(`KINEXUS_REASONING_ENGINE_V1.md` §2). L'orientation produite est `CLI040`.
**Ce qu'il ne peut pas dire** : si le déficit de magnitude ou le déficit de RFD est la cause
principale, ou si les deux relèvent en réalité d'un seul phénomène sous-jacent (la distinction
magnitude/RFD étant elle-même NON DISCRIMINABLE AVEC LES SOURCES ACTUELLES pour Puissance, §4). Le
moteur ne peut actuellement pas hiérarchiser ces causes.

### Profil B — Puissance ↓ + Force normale + RFD ↓
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; `imtp_n`/`slimtp_n` normaux ; `imtp_rfd100`/`slimtp_rfd100`↓.

**Ce que le moteur peut dire** : l'explicative RFD seule suffit à faire progresser le support
jusqu'à Forte (§3 : "cumulable... non substituable" — l'une des deux catégories suffit). Orientation
`CLI040`, identique au Profil A.
**Ce qu'il ne peut pas dire** : que ce profil constitue cliniquement une entité différente du Profil
A — aucune orientation distincte n'existe pour ce sous-cas. Le moteur ne peut actuellement pas
hiérarchiser ces causes, ni signaler que "RFD isolé" mérite une lecture clinique différente de
"Force + RFD".

### Profil C — Puissance ↓ + Force normale + RFD normale + variables biomécaniques anormales
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; toute la famille Force/RFD (§3.1-3.3) normale ; une ou
plusieurs variables de stratégie CMJ/SLCMJ (§3.5-3.6) anormales.

**Ce que le moteur peut dire** : la catégorie explicative biomécanique, à elle seule, peut faire
progresser le support jusqu'à Forte. Orientation `CLI040`, identique aux profils A et B.
**Ce qu'il ne peut pas dire** : laquelle, parmi les 29 variables de stratégie CMJ/SLCMJ, est la plus
pertinente si plusieurs sont anormales simultanément — aucune priorisation intra-catégorie
n'existe non plus. Le moteur ne peut actuellement pas hiérarchiser ces causes.

**Rappel explicite, comme demandé** : pour les trois profils, et pour toute combinaison
supplémentaire de variables individuelles au sein d'une même catégorie ou entre catégories, **le
moteur ne peut actuellement pas hiérarchiser ces causes.** Aucune règle de priorisation
n'existe dans les sources consultées (confirmé identiquement en §6 de
`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`).

---

## 7. Point essentiel : ce que le moteur sait vraiment dire

**"Si un patient présente une Puissance déficitaire, quelles informations supplémentaires HYP
peut-il réellement utiliser pour expliquer ce déficit ?"**

Il peut mobiliser, variable par variable, 61 signaux explicatifs distincts (magnitude de force sur
13 tests, RFD/TTPF sur 2 tests, profil force-vitesse sur 2 composantes, 29 KPI de stratégie
biomécanique CMJ/SLCMJ) et déterminer, pour chacun, s'il est convergent ou non avec le déficit
diagnostiqué. Cette granularité est réelle : le moteur ne se contente pas de dire "Puissance
faible", il peut dire "Puissance faible **et** force du quadriceps controlatéral normale **et**
temps de contact d'atterrissage du SLCMJ anormalement long" — une richesse d'information brute déjà
disponible aujourd'hui, avant toute nouvelle règle.

**"Quelles informations possède-t-il mais ne sait-il pas encore interpréter ?"**

- La distinction entre "déficit de magnitude de force" et "déficit de vitesse de production de
  force" (RFD/TTPF), pour Puissance spécifiquement — les deux catégories de variables existent et
  sont mobilisables, mais leur statut de mécanismes réellement distincts reste INFERENCE, pas
  SOURCE EXPLICITE (§3.B du prototype, confirmé en §4 de ce document).
- Le rattachement précis de chacune des 29 variables de stratégie CMJ/SLCMJ à un sous-mécanisme
  clinique nommé — le moteur sait qu'elles appartiennent à la catégorie "stratégie", pas ce que
  chacune signifie individuellement au-delà de sa définition biomécanique brute.
- Le rôle exact des variables de phase "landing" (`cmj_landing_rfd`, `cmj_landing_mean_power`,
  `slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab`) au sein de l'explication
  d'un déficit de *puissance* plutôt que d'un déficit d'*absorption* — ces variables sont présentes
  dans les deux qualités (directement ou par homonymie de mesure), sans que la distinction de leur
  rôle causal respectif ne soit détaillée.

**"Quelles informations lui manquent pour pouvoir réellement différencier les causes ?"**

- Une règle de priorisation entre mécanismes simultanément déficitaires (§6) — absente des sources,
  décision clinique en attente.
- Un seuil ou une règle de calcul pour `CLI041` (puissance relative) — silence de Vierge_7 déjà
  documenté (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §5, Profil 7).
- Une correspondance formalisée entre les 29 KPI de stratégie et des orientations cliniques
  différenciées — aujourd'hui, toutes convergent vers `CLI040` sans distinction (§8 ci-dessous).
- Une clarification du statut de `slcmj_time_to_stab` (et des variables de landing en général) :
  appartient-il réellement à l'explication de Puissance, ou sa présence dans cette liste relève-t-elle
  d'un choix de regroupement (variable mesurée pendant le même essai) plutôt que d'un lien causal
  vérifié ? NON DOCUMENTÉ — question ouverte, pas tranchée par ce document.

---

## 8. Orientations — vue par variable

Conformément à la consigne, aucune nouvelle orientation n'est créée. Le tableau ci-dessous reprend
chaque **mécanisme** (pas chaque variable individuellement, la matrice §5 assurant déjà ce niveau de
détail) et signale explicitement la convergence déjà identifiée.

| Mécanisme | Variables concernées | `CLI###` existant | Orientation |
|---|---|---|---|
| Force absolue/relative (magnitude) | 26 variables (`_n`/`_nkg` × 13 tests) | `CLI040` | Augmenter la puissance maximale |
| RFD / vitesse de production de force | 6 variables (`imtp`/`slimtp` × `rfd100`/`rfd200`/`ttpf`) | `CLI040` | idem |
| Profil force-vitesse | 2 variables | `CLI040` | idem |
| Stratégie biomécanique CMJ | 15 variables | `CLI040` | idem |
| Stratégie biomécanique SLCMJ | 14 variables | `CLI040` | idem |
| Puissance en valeur relative au poids | (lecture du diagnostic, pas une variable explicative séparée) | `CLI041` | Augmenter la puissance relative |

**Constat à signaler explicitement, comme demandé** : **61 des 63 variables explicatives de
Puissance (toutes sauf la lecture absolu/relatif elle-même) convergent aujourd'hui vers une seule et
même orientation, `CLI040`**, quel que soit le mécanisme réellement en cause. Ce n'est ni un problème
de mesure (les 63 variables sont mesurées et distinguées individuellement, §3-5), ni un problème de
raisonnement (le moteur distingue correctement quelles variables convergent et lesquelles ne
convergent pas, §2 et §6), **mais un problème de granularité des orientations `CLI###` elles-mêmes** :
Vierge_7 ne définit, pour Puissance, que deux orientations globales (`CLI040`/`CLI041`), sans
déclinaison par mécanisme — à la différence de Force, dont le Niveau 2 (`CLI200`-`213`) décline
l'orientation par groupe musculaire. Ce constat est purement descriptif : il ne recommande aucune
création de nouvelle orientation, conformément à la consigne.

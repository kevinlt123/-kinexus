# Audit transversal du moteur HYP V1 — avant HYP-CSM-01

**Statut** : audit uniquement. **Aucune ligne de `index.html` modifiée.** Toutes les affirmations de
ce document sont soit lues directement dans le code (citées avec fonction/ligne), soit vérifiées
empiriquement via `computeMoteur()` dans un script jetable (non committé, supprimé après usage),
soit sourcées dans les documents `.md` du dépôt. Convention de classement utilisée partout :
**SOURCE EXPLICITE** (écrit noir sur blanc dans une source ou vérifié directement dans le code) /
**INFÉRENCE** (déduction raisonnable, non littéralement écrite) / **À VALIDER** (arbitrage
praticien nécessaire) / **NON DÉTERMINABLE** (aucune source ne permet de trancher).

---

## 1. Architecture globale

Le moteur `computeMoteur(testData, questData, normPop, normAge)` produit `functionScores` (`fSc`)
pour les 10 entrées de `FUNCTIONS` (`index.html:742`). Sur ces 10 :

- **8 qualités sont pilotées par un moteur clinique HYP dédié**, chacune remplaçant tout ou partie
  du `fSc[fn]` généré par une première boucle générique TFM (`FUNCTIONS.forEach`, `index.html:5156`
  -`5169`) : Mobilité, Réactivité, Absorption, Puissance, Force, Explosivité, Stabilisation,
  Endurance.
- **2 qualités restent intégralement pilotées par la boucle TFM générique**, sans moteur HYP :
  Contrôle Frontal, Contrôle Sensoriel. `HYP-CSM-01` (Contrôle Sensori-moteur) reste explicitement
  **suspendue** (`KINEXUS_REASONING_ENGINE_V1.md` §6/§8) — hors périmètre de cet audit, mentionnée
  seulement pour mémoire.

**Fait structurel majeur, vérifié directement dans le code — deux styles d'intégration coexistent** :

| Style | Qualités | Comportement quand HYP ne peut rien déterminer |
|---|---|---|
| **A — Repli TFM** | Absorption, Réactivité, Mobilité | `fSc[fn]` **reste** le résultat de la boucle TFM générique (calculée en premier, jamais écrasée) ; le détail HYP (`hypXxx01`) est simplement attaché en plus, à titre de traçabilité |
| **B — Remplacement intégral** | Puissance, Force, Explosivité, Stabilisation, Endurance | `fSc[fn]` est **entièrement réécrit** par le moteur HYP ; `status:null` explicite si `non_determinable`, **jamais** de repli TFM |

Cette différence n'est pas une incohérence non documentée — chaque bloc d'intégration le
commente explicitement (ex. `index.html:5118-5122` pour HYP-FOR-01 : *"Divergence assumée et
documentée par rapport à Absorption/Réactivité/Mobilité (repli TFM)"*). **Mais elle a une
conséquence concrète, vérifiée empiriquement ci-dessous (§5, §6), qui n'avait encore jamais été
démontrée avec un cas reproductible avant cet audit : pour les 3 qualités du Style A, le
`fSc[fn].status` visible par le praticien peut diverger — et même se contredire — avec l'état
honnête (`state`/`dataAvailable`) du moteur HYP qui lui est attaché.**

**Trois systèmes de raisonnement distincts coexistent dans `computeMoteur()` et ses consommateurs**,
et ne se parlent pas entre eux :

1. **Les 8 moteurs HYP** (`computeHypXxx01`) — le sujet de cet audit, rigoureux, avec état/support/
   convergence/`non_determinable` honnête.
2. **`qualityScores`** (`computeQualityStatus`, `index.html:4070`) et **`capaciteScores`**
   (`computeCapaciteStatus`, `index.html:4089`) — agrègent `VAR_REL3` (champs `measures`/
   `estimates`, 283 variables, poids TFM/hiérarchie) sur une **taxonomie de qualités différente**
   (`'Force maximale'`, `'Propulsion'`, `'Contrôle moteur'`, `'Résistance neuromusculaire'` — aucun
   de ces libellés n'existe dans `FUNCTIONS`). Complètement indépendant des 8 moteurs HYP.
3. **`priorities`** (`index.html:5524-5543`) — construit, pour les 1 à 3 qualités les plus
   déficitaires (classement `rouge` puis `orange`, ordre de `FUNCTIONS`), un `contributeurPrincipal`/
   `contributeurSecondaire` **entièrement dérivé du poids TFM** (`effectiveTFMWeight`), une
   `hypothese` textuelle générique (`HYPO`, `index.html:5522`) et une **« chaîne causale »**
   explicitement nommée ainsi dans le code (`index.html:5936`, commentaire *"Chaîne causale (icônes
   + texte d'interprétation)"*) qui produit des phrases du type *« Le déficit de X entraîne une
   altération de la capacité de Y »* (`index.html:5831`, `5940`). **Ce mécanisme ne lit aucun des 8
   `hypXxx01`** — il ne sait rien de `state`, `support`, `convergence`, ni `non_determinable`.

Ce point 3 est développé en détail en §10 — c'est la conclusion la plus significative de cet audit.

---

## 2. Matrice Variable → Qualité → Rôle

Construite en relisant intégralement le code source des 8 moteurs (`index.html:4216`-`5298`),
fonction par fonction, sans supposer aucun rôle non écrit dans le code. Regroupée par famille de
test. **D = diagnostique, C = confirmative, E = explicative, P = précision/asymétrie.**

### Famille CMJ / SLCMJ

| Variable | Absorption | Puissance | Explosivité | Autres | Statut |
|---|---|---|---|---|---|
| `cmj_braking_rfd`, `cmj_force_zero_vel` | **D** (niveau1 core) | — | — | — | SOURCE EXPLICITE |
| `cmj_braking_impulse` | D (jamais classifiable, aucun seuil) | — | — | — | SOURCE EXPLICITE |
| `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` | E (capacité excentrique) | — | E (biomécanique) | — | SOURCE EXPLICITE — double rôle explicatif légitime, jamais diagnostique nulle part |
| `cmj_depth` | E (stratégie) | E (stratégie) | E (biomécanique) | — | SOURCE EXPLICITE — triple rôle explicatif, jamais diagnostique nulle part |
| `cmj_braking_duration` | E (jamais classifiable) | — | — | — | SOURCE EXPLICITE |
| `cmj_peak_power` | — | **D** (mécanisme 1/2) | C (confirmative gelée, jamais diagnostique) | — | SOURCE EXPLICITE — double rôle légitime déjà validé (mission HYP-EXP-01) |
| `cmj_height` | — | C (confirmative **gelée**, jamais 2e preuve quel que soit son statut) | — | — | SOURCE EXPLICITE |
| `cmj_conc_rfd` | — | E (stratégie) | **D** (mécanisme 1/2) | — | SOURCE EXPLICITE — exemple de double rôle légitime cité par la mission elle-même |
| `cmj_conc_impulse_100` | — | — | **D** (mécanisme 2/2) | — | SOURCE EXPLICITE — rôle unique |
| `cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_conc_impulse` | — | — | C | — | SOURCE EXPLICITE — rôle unique |
| `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_ecc_peak_vel` (déjà cité) | — | — | E (biomécanique) | — | SOURCE EXPLICITE — rôle unique |
| `cmj_braking_rfd` (déjà cité, second usage) | **D** (Absorption, ci-dessus) | — | E (biomécanique, `nomenclatureNonConfirmee:true`) | — | **Double rôle avec réserve** — voir §14, point le plus notable de cette famille |
| `slcmj_peak_power` | — | **D** (mécanisme 2/2 principal) | — | — | SOURCE EXPLICITE |
| `dj_peak_prop_power`, `sldj_peak_prop_power`, `cmjr_peak_power` | — | D (preuves de **substitution**, jamais en renfort à poids égal, mobilisées seulement si `slcmj_peak_power` indisponible) | — | Réactivité (voir ci-dessous pour `dj_peak_prop_power`) | SOURCE EXPLICITE |

### Famille DJ / SLDJ / CMJR

| Variable | Réactivité | Absorption | Puissance | Statut |
|---|---|---|---|---|
| `dj_rsi` | **D** (mécanisme 1/2) | E (sous-domaine D, « absorption réactive » — **jamais lu par le niveau1/core**, traçabilité uniquement) | — | SOURCE EXPLICITE — double rôle légitime, non-contaminant **au niveau du moteur HYP lui-même** (voir §5 pour la nuance sur le `fSc[fn].status` visible) |
| `sldj_rsi` | **D** (mécanisme 2/2) | — (jamais lu par Absorption) | — | SOURCE EXPLICITE — rôle unique côté HYP |
| `dj_contact_time`/`height`/`peak_prop_force`/`peak_landing_force`/`landing_impulse`/`leg_stiffness` | C (jamais classifiable, aucun seuil) | — | — | SOURCE EXPLICITE |
| `dj_peak_prop_power` | C (Réactivité) | — | D-substitut (Puissance, voir ci-dessus) | SOURCE EXPLICITE — double rôle légitime (confirmative Réactivité / substitut diagnostique Puissance) |
| `sldj_contact_time`/`height` | C | — | — | SOURCE EXPLICITE |
| `cmjr_mean_ct`/`mean_stiffness`/`mean_rebound_height`/`mean_rsi`/`rsi_decay`/`stiffness_decay` | E | — | — | SOURCE EXPLICITE — rôle unique (`cmjr_peak_power`, KPI différent du même test, est substitut Puissance — pas de collision, KPI distincts) |

### Famille Force (globale + segmentaire)

| Variable | Force | Puissance | Explosivité | Endurance | Stabilisation | Statut |
|---|---|---|---|---|---|---|
| `imtp_n`/`nkg` | **D** (1 des 4 candidats globaux) | — | — | E (forceDeFond) | — | SOURCE EXPLICITE |
| `slimtp_n`/`nkg` | **D** | — | — | E | — | SOURCE EXPLICITE |
| `iso_belt_squat_n` | **D** | E (« force capacité ») | E (« forceCapacite ») | E (forceDeFond) | — | SOURCE EXPLICITE — **variable la plus partagée du système** : 1 rôle diagnostique (Force) + 3 rôles explicatifs indépendants (Puissance/Explosivité/Endurance), chacun lu par une fonction séparée qui n'écrit jamais dans le `diagnosticEvidence`/`state` d'une autre qualité — vérifié par lecture de code ET empiriquement (§5) |
| `sl_iso_push_n` | **D** | — | — | E (forceDeFond) | — | SOURCE EXPLICITE |
| `imtp_rfd100`/`ttpf` | E (Force, jamais classifié) | E (« rfd »/« ttpf ») | E (« rfd ») | E (cinétique) | — | SOURCE EXPLICITE — jamais diagnostique nulle part, jamais classifiable (aucun seuil sur aucune des 4 qualités) |
| 11 familles segmentaires (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`) `_n`/`_nkg` | **D Niveau 2** (localisation, **jamais** générateur seul — déclenché uniquement si Niveau 1 déjà retenu) | — | — | E (forceSegmentaire) | E (`hip_abd`/`hip_ext`/`hip_add`/`inv_iso`/`ev_iso`/`df_iso` RFD uniquement, sous-ensemble de 6/11) | SOURCE EXPLICITE — rôle diagnostique strictement gated (Force Niveau 2), jamais promu ailleurs |
| `profil_fv_v0` | — | E | — | — | — | SOURCE EXPLICITE — rôle unique |
| Épaule (`sh_iso_9020`/`9090`/`3030`/`6060`) | **D Niveau 2** uniquement (`CLI211`) | — | — | — | — | SOURCE EXPLICITE — jamais lu ailleurs |

### Famille Landing / SLLT / Stabilisation

| Variable | Stabilisation | Absorption | Statut |
|---|---|---|---|
| `landing_uni_tts`, `landing_bi_tts` | **D** | **Jamais lu** — `computeHypAbsorptionReceptionImpact()` ne prend aucun argument et retourne un objet fixe (`index.html:4270-4272`) : structurellement impossible qu'il lise `landing_*` | SOURCE EXPLICITE — étanchéité vérifiée au niveau du code, pas seulement observée |
| `sls_*` (7 KPI), `eo_surface`, `ef_surface`, `strobo_surface` | **D** | — | SOURCE EXPLICITE — jamais lus ailleurs dans les 8 moteurs |
| `sllt_*` (5 KPI) | **Jamais lu** (exclu, gel) | **Jamais lu** (sous-domaine E, `available:false` codé en dur) | SOURCE EXPLICITE — famille entière orpheline des 8 moteurs, voir §13 |
| `ybt_composite` | **Jamais lu** (aucun rôle documenté, seul le poids TFM l'associe) | — | SOURCE EXPLICITE — orpheline des 8 moteurs, voir §13 |

### Famille Mobilité / Endurance

| Variable | Mobilité | Stabilisation | Réactivité | Endurance | Statut |
|---|---|---|---|---|---|
| `wblt_distance` | **D** (seul mécanisme, ADR-005) | E (mobiliteCheville) | — (jamais lu par un moteur HYP — mais TFM la pondère, voir §5) | — | SOURCE EXPLICITE — double rôle légitime |
| `heel_raise_reps` | — | — | **Jamais lu** (exclu explicitement, commenté « hors Réactivité, aucun rôle, pas même explicatif ») | **D** (1 des 6 mécanismes) | SOURCE EXPLICITE — rôle unique côté HYP, exclusion Réactivité délibérée |
| `repeated_hop_*` (5 KPI diagnostiques + `mean_stiffness`) | — | — | — | **D**/(orpheline pour `mean_stiffness`) | SOURCE EXPLICITE |
| `repeated_hop_mean_rsi` | — | — | E (`repeated_hop.mean_rsi`, 1 seul KPI parmi 15) | C (Niveau 2 confirmation) | SOURCE EXPLICITE — double rôle légitime, deux qualités, jamais diagnostique nulle part ; c'est précisément la paire que la mission demandait de vérifier (Partie 4, Réactivité ↔ Endurance) |
| `repeated_hop_mean_height`/`best_height`/`mean_peak_force`/`mean_ct`/`best_rsi`/`height_cv`/`ct_cv`/`rsi_cv` (8 KPI restants) | — | — | **Jamais lus** (Réactivité ne lit que `mean_rsi`) | C | SOURCE EXPLICITE |

**Constat transversal, Partie 3 de la mission — variables citées et vérifiées une à une** :

- ✅ `landing_uni_tts`/`landing_bi_tts` restent diagnostiques de Stabilisation **uniquement**.
- ✅ `dj_rsi`/`sldj_rsi` restent diagnostiques de Réactivité **uniquement** (jamais promus
  diagnostiques d'Absorption — `dj_rsi` y est explicatif, non générateur).
- ✅ Aucune variable purement explicative/confirmative/de précision ne génère seule une hypothèse
  diagnostique dans une autre qualité — vérifié pour CMJ, SLCMJ, IMTP, SLIMTP, force segmentaire,
  RFD, DJ, SLDJ, CMJR, Landing, Repeated Hop, Heel Raise, équilibre (SLS/EO/EF/Strobo), un par un.

---

## 3. Matrice Qualité × Qualité (8 × 8)

Légende : **●** relation légitime documentée (variable partagée, rôles distincts, non
contaminante) · **○** aucune relation (étanchéité totale, vérifiée) · **⚠** relation existante mais
avec une réserve à noter.

| | MOB | REA | ABS | FOR | PUI | EXP | STA | END |
|---|---|---|---|---|---|---|---|---|
| **MOB** | — | ○ (HYP), ⚠ (TFM, voir §5) | ○ (HYP), ⚠ (TFM) | ○ | ○ | ○ | ● `wblt_distance` explicative | ○ |
| **REA** | | — | ● `dj_rsi` (explicative Absorption, non générateur) | ○ | ○ (substitut inerte partagé, `dj_peak_prop_power`) | ○ | ○ | ● `repeated_hop_mean_rsi` (explicative, 1 KPI/15) |
| **ABS** | | | — | ○ | ○ (`cmj` disjoint : phase excentrique vs concentrique) | ⚠ `cmj_ecc_*`/`cmj_braking_rfd` partagés en explicatif, voir §2/§14 | ○ (étanchéité vérifiée dans le code, structurellement) | ○ |
| **FOR** | | | | — | ● `iso_belt_squat_n` (diagnostique Force / explicative Puissance) | ● `iso_belt_squat_n` (idem, explicative Explosivité) | ○ | ● 11 familles segmentaires (diagnostique Niveau 2 Force / explicative Endurance) |
| **PUI** | | | | | — | ● `cmj_peak_power` (D/C légitime), `cmj_conc_rfd` (E/D légitime), `cmj_depth` (E/E) | ○ | ○ |
| **EXP** | | | | | | — | ○ | ○ |
| **STA** | | | | | | | — | ● 6/11 familles RFD segmentaires (explicative des deux côtés, jamais diagnostique) |
| **END** | | | | | | | | — |

**Paires explicitement demandées par la mission (Partie 4), toutes vérifiées par lecture de code
et/ou empiriquement (§5)** :

| Paire | Constat | Statut |
|---|---|---|
| Force ↔ Puissance | `iso_belt_squat_n` : diagnostique Force, explicative Puissance (« force capacité »). Aucune contamination — `computeHypPowerCapacite` n'écrit jamais dans `state`. | SOURCE EXPLICITE, non contaminant (vérifié empiriquement) |
| Force ↔ Explosivité | Même variable, même schéma, explicative « forceCapacite » d'Explosivité. RFD (`imtp_rfd100`/`ttpf`) partagé en explicatif pur, jamais diagnostique. | SOURCE EXPLICITE, non contaminant |
| Puissance ↔ Explosivité | `cmj_peak_power` (D Puissance / C Explosivité, gel documenté) ; `cmj_conc_rfd` (E Puissance / D Explosivité, exemple cité par la mission). Aucun conflit : les deux moteurs lisent la même donnée brute via des fonctions indépendantes, aucun état partagé. | SOURCE EXPLICITE, non contaminant |
| Puissance ↔ Absorption | Disjonction totale : Puissance lit exclusivement la phase concentrique du CMJ (`peak_power`, `conc_rfd`), Absorption exclusivement la phase de freinage (`braking_rfd`, `force_zero_vel`, `braking_impulse`). Aucune variable partagée. | SOURCE EXPLICITE — étanchéité confirmée |
| Absorption ↔ Stabilisation | `landing_uni_tts`/`landing_bi_tts` **structurellement** impossibles à lire par Absorption (`computeHypAbsorptionReceptionImpact()` ne prend aucun paramètre). Vérification la plus forte de tout l'audit — pas une observation, une preuve de code. | SOURCE EXPLICITE — étanchéité prouvée |
| Absorption ↔ Réactivité | `dj_rsi`/`sldj_rsi` restent diagnostiques de Réactivité. `dj_rsi` est explicatif d'Absorption (sous-domaine D) mais **ne contribue jamais à `niveau1`** (`core` et `reactive` sont deux branches de calcul totalement séparées dans `computeHypAbsorption01`). Non contaminant côté moteur HYP. **Réserve** : côté `fSc['Absorption'].status` visible (repli TFM), `dj_rsi`/`sldj_rsi` influencent bien le statut affiché quand le core HYP est `non_determinable` — voir §5/§6. | SOURCE EXPLICITE (moteur HYP) + ⚠ (statut visible, repli TFM) |
| Réactivité ↔ Endurance | `repeated_hop_mean_rsi` : explicative Réactivité (1 KPI/15) / confirmative Endurance. Les deux rôles sont non générateurs, jamais diagnostiques, vérifiés indépendants. | SOURCE EXPLICITE, non contaminant |
| Force ↔ Endurance | `heel_raise_reps` : diagnostique Endurance **uniquement**. Aucune ligne de code Force ne le lit. Aucune relation créée par analogie. | SOURCE EXPLICITE — absence de relation confirmée |

---

## 4. Doubles rôles légitimes

Récapitulatif (déjà détaillés en §2/§3) : `cmj_peak_power`, `cmj_conc_rfd`, `cmj_depth`,
`cmj_ecc_mean_power`/`ecc_peak_vel`, `iso_belt_squat_n`, `dj_rsi`, `dj_peak_prop_power`,
`repeated_hop_mean_rsi`, `wblt_distance`, 11 familles segmentaires de Force (Niveau 2 → explicative
Endurance/Stabilisation), `imtp_rfd100`/`ttpf` (explicatif partagé Puissance/Explosivité/Endurance).
**Critère de légitimité appliqué systématiquement** : (a) le rôle diffère selon la qualité, (b) ce
rôle est écrit dans le code/documenté, (c) la fonction qui lit la variable dans son rôle non
diagnostique n'écrit **jamais** dans le `state`/`diagnosticEvidence` de sa propre qualité à partir
de cette lecture. Les 12 cas ci-dessus respectent les trois critères — **aucun double comptage
diagnostique trouvé**.

---

## 5. Doubles rôles problématiques — et non-contamination empirique

**Aucun double rôle n'est en lui-même problématique.** Le problème identifié n'est **pas** un rôle
partagé au niveau clinique, mais un **mécanisme technique pré-existant, documenté ailleurs à
plusieurs reprises cette session mais jamais démontré aussi concrètement** : le repli TFM (Style A,
§1) rend `fSc[fn].status` sensible à des variables **sans aucun rapport clinique** avec la qualité,
via le poids `TFM` hérité (jamais retiré, jamais dans le périmètre d'aucune mission HYP à ce jour).

**Test empirique** (`computeMoteur` appelé directement, script jetable, non committé) — un seul
groupe de variables modifié à la fois, reste inchangé sinon :

| Variable modifiée | Qualités attendues (rôle clinique) | Qualités réellement affectées | Écart |
|---|---|---|---|
| `cmj_conc_rfd`, `iso_belt_squat_n`, `sl_iso_push_n`, `cmj_peak_power`, `slcmj_peak_power`, `repeated_hop_*` | Explosivité/Puissance/Force/Endurance selon la variable | **Aucune autre qualité** | ✅ aucun écart |
| `dj_rsi` | Réactivité (D) | Réactivité **+ Absorption (`fSc.status` : vert→rouge)** | ⚠ TFM repli — `hypAbs01` lui-même (le raisonnement clinique) reste byte-identique, seul le `.status` affiché bouge |
| `sldj_rsi` | Réactivité (D) | Réactivité **+ Absorption + Contrôle Frontal** | ⚠ idem, `TFM.sldj` a des poids `absorption:2`/`controle_frontal:1` |
| `landing_uni_tts`/`landing_bi_tts` | Stabilisation (D) | Stabilisation **+ Absorption + Contrôle Frontal** | ⚠ `TFM.landing_uni={absorption:3,stabilisation:3,controle_frontal:3,...}` — `hypAbs01` reste inchangé, `.status` bouge |
| `heel_raise_reps` | Endurance (D) | Endurance **+ Réactivité + Absorption** | ⚠ `TFM.heel_raise={endurance:3,reactivite:1,absorption:1}` |
| `wblt_distance` | Mobilité (D), Stabilisation (E) | Mobilité **+ Réactivité + Absorption** — **Stabilisation ne bouge pas** (confirme que le Style B/remplacement intégral protège correctement) | ⚠ `TFM.wblt={mobilite:3,reactivite:1,absorption:1,stabilisation:1}` |

**Lecture correcte de ce tableau** : dans tous les cas ⚠, **le raisonnement clinique HYP lui-même
(`hypXxx01`) reste parfaitement isolé** — vérifié en comparant les objets `hypAbs01`/`hypRea01`
avant/après (identiques). C'est uniquement le **repli TFM générique pré-existant** (Style A) qui
fait bouger le `.status` externe. **Les 5 qualités en Style B (Puissance/Force/Explosivité/
Stabilisation/Endurance) ne présentent jamais cet écart** — confirmé pour `wblt_distance` ci-dessus
(Stabilisation inchangée alors qu'elle lit pourtant `wblt_distance` en explicatif).

**Ce fait était déjà connu et documenté au coup par coup** (chaque `IMPLEMENTATION_HYP_*.md` de
cette session mentionne la contamination TFM pré-existante pour justifier le scoping de ses propres
tests de non-régression). **Ce qui est nouveau dans cet audit transversal, c'est la démonstration
qu'il peut produire une contradiction interne (pas seulement un chiffre qui bouge) — voir §6.**

---

## 6. NON_DETERMINABLE — audit spécifique, et la contradiction trouvée

**Principe respecté partout, vérifié dans les 8 moteurs** : absence de norme ≠ normal, absence de
test ≠ normal. Chaque moteur retourne `status:'indisponible'` (variable) ou `state:'non_determinable'`
(agrégat) explicitement plutôt que de forcer un statut. Aucune exception trouvée.

**Mais un cas concret, reproductible, montre que le `fSc[fn].status` externe peut contredire
l'honnêteté du moteur HYP qu'il porte** — trouvé en construisant le patient synthétique du §11
(CAS H) :

```
Données fournies : imtp/slimtp (Force), cmj/slcmj (Puissance/Explosivité/Absorption)
Aucune donnée dj / sldj fournie.

hypRea01.dataAvailable : false
hypRea01.state         : 'absente'      (aucune preuve, rien à signaler)

fSc['Réactivité'].status : 'orange'     (repli TFM : cmj/slcmj portent un poids TFM
                                          reactivite:1 chacun, suffisant à eux seuls
                                          pour faire dériver le score générique vers
                                          'orange' malgré l'absence totale de dj/sldj)
```

**C'est une contradiction interne au même objet `fSc['Réactivité']`** : `.hypRea01.state` dit
« absente, rien à voir » tandis que `.status` (le badge réellement affiché) dit « orange,
déficitaire ». Un consommateur (UI, rapport, praticien lisant le détail HYP) qui ferait confiance à
l'un ou l'autre champ obtiendrait une conclusion opposée. **Ce n'est pas une invention de norme, ni
un statut "normal" imposé — c'est l'inverse : un statut "déficitaire" affiché sans aucune preuve
diagnostique réelle**, ce qui est tout aussi problématique au regard du principe « absence de
donnée classifiable → NON DÉTERMINABLE » — ici, le comportement de repli TFM produit un déficit
apparent, pas une neutralité honnête.

🔴 **Ce point est classé comme une décision nécessaire avant/à côté de HYP-CSM-01** — voir §15. Il
concerne uniquement les 3 qualités en Style A (Absorption, Réactivité, Mobilité) ; les 5 qualités
en Style B ne peuvent pas produire cette contradiction par construction (`status:null` explicite
dès que `state==='non_determinable'`, jamais de repli).

**Autres situations `non_determinable` auditées, toutes honnêtes** :

| Situation | Comportement vérifié |
|---|---|
| Aucune donnée exploitable | `non_determinable`/`indisponible` partout (8/8 moteurs) |
| Une seule preuve exploitable (sur 2, 4 ou 6 requises) | `suspectee` (Puissance/Force/Explosivité/Stabilisation/Endurance), jamais `retenue` de force |
| Preuves normées partiellement | Le décompte ne porte que sur les preuves classifiables — jamais un candidat non classifiable compté comme "normal" (vérifié Force §Cas 5, Stabilisation, Endurance) |
| Convergence impossible à démontrer | `non_determinable` explicite (Puissance/Explosivité : 2/2 strict) ou `suspectee` (Force/Stabilisation/Endurance : ≥2/N tolérant une couverture partielle) — deux philosophies différentes mais chacune source-justifiée (voir §7) |

---

## 7. Cohérence des niveaux de preuve entre les 8 qualités

| Qualité | Preuves diagnostiques | Convergence | Support max | Confirmatives réellement classifiables aujourd'hui | Explicatives classifiables | Sortie `état` |
|---|---|---|---|---|---|---|
| Mobilité | 1 (`wblt_distance`) | 1/1 (**exception ADR-005**, source explicite) | Faible (ADR-008, jamais plus) | Auto-référentielle uniquement, jamais élévatrice | Aucune (couche nulle par construction) | `state` standard, plafonné |
| Réactivité | 2 (`dj_rsi`, `sldj_rsi`) | 2/2 (ADR-003, mécanismes indépendants) | Forte (jamais atteint, 0 confirmative/explicative classifiable) | 0/9 | 0 | `state` standard 5 états |
| Absorption | 2 (`braking_rfd`, `force_zero_vel`) | 2/2 de facto (`braking_impulse` jamais classifiable) | — (pas de notion de support dans ce moteur, voir §14) | — | 2/2 (`ecc_mean_power`/`ecc_peak_vel`) | **`niveau1` : `ok`/`a_surveiller`/`deficitaire`/`non_determinable`** — vocabulaire propre, hors du cycle 5 états |
| Puissance | 2 (`cmj_peak_power`, `slcmj_peak_power`+substituts) | 2/2 strict (aucune tolérance) | Faible (0 confirmative/explicative classifiable) | 0/1 (`cmj_height` gelée, jamais comptée) | 1/4 (`iso_belt_squat_n`) | `state` standard 5 états |
| Force | 4 candidats globaux, ≥2 requis | 2/4 tolérant (couverture partielle) | Forte (mécanisme présent, jamais atteint) | 2/4 (`_nkg` du même test) | 0/5 (RFD/TTPF) | `state` standard 5 états |
| Explosivité | 2 (`cmj_conc_rfd`, `cmj_conc_impulse_100`) | 2/2 strict | Forte (mécanisme présent, jamais atteint avec données réelles) | 1/4 (`cmj_peak_power`) | 4/6 (biomécanique CMJ) | `state` standard 5 états |
| Stabilisation | 6 mécanismes, ≥2 requis | ≥2/6 (ADR-003 généralisé) | Forte (mécanisme présent, atteint seulement à `faible` avec données réelles) | 0/6 (auto-référentiel, convention appliquée : 3e preuve du pool) | 1/9 (`wblt_distance`) | `state` standard 5 états |
| Endurance | 6 mécanismes, ≥2 requis | ≥2/6 (identique à Stabilisation) | Forte (mécanisme présent, jamais atteint : au plus 1/6 classifiable) | 0/9 (`repeated_hop`) | 2/8+ (`iso_belt_squat`/`sl_iso_push` `_n`) | `state` standard 5 états |

**Constat de méthode central** : les seuils de convergence varient (1/1, 2/2, 2/4, 2/6) mais
**chacun est source-justifié individuellement**, pas improvisé pour la cohérence d'ensemble :
1/1 = exception ADR-005 documentée ; 2/2 = règle gelée spécifique à Puissance/Explosivité/
Réactivité ; 2/4 = `CLI010` documenté pour Force ; 2/6 = `CLI070`/`CLI080` documentés (avec, pour
Stabilisation, un écart de couverture `CLI070`/fiche explicitement toléré comme non bloquant par
`KINEXUS_REASONING_ENGINE_V1.md` §6-7 — voir `AUDIT_IMPLEMENTATION_HYP_STA01.md`). **Aucune
incohérence de philosophie trouvée sur ce point** — chaque règle a sa source, jamais copiée d'une
autre qualité par analogie.

**Incohérence réelle trouvée, structurelle plutôt que clinique** : **Absorption (HYP-ABS-01 V2) ne
respecte pas la forme de sortie commune aux 7 autres moteurs.** Les 7 autres retournent tous
`{hypId, state, support, diagnosticEvidence, convergence, confirmativeEvidence, explanatoryEvidence,
precision, note}`. Absorption retourne `{version, niveau1, profilCore, sousDomaines, asymetrie}` —
**pas de `hypId`, pas de `state` (utilise `niveau1` avec un vocabulaire différent : `ok`/
`a_surveiller`/`deficitaire`/`non_determinable`), pas de `support`, pas de `convergence` structuré**.
Fonctionnellement, Absorption est correcte et bien isolée (§5) — mais un futur consommateur
générique qui itérerait sur les 8 `hypXxx01.state`/`.support` (par exemple pour HYP-CSM-01, qui doit
justement comparer plusieurs qualités entre elles) **casserait silencieusement sur Absorption**.
C'est une dette structurelle héritée de V2 (antérieure à la convention commune stabilisée à partir
de Réactivité/Mobilité), jamais retouchée depuis. 🔶 **À VALIDER / décision nécessaire avant
HYP-CSM-01** (voir §15) — pas un bug clinique, un risque d'intégration.

---

## 8. Asymétries — audit transversal

Principe gelé vérifié dans les 8 moteurs, **aucune exception trouvée** : chaque asymétrie D/G est
exposée (`rawD`/`rawG`/`lsi`) mais **ne participe jamais** au calcul de `status`/`deficient` — seul
le franchissement de seuil sur `vD`/`vG` compte (`applyThr`), le LSI n'est qu'un champ
d'accompagnement (`precision`/`confirmativeEvidence.wblt_lsi` pour Mobilité, `precision.sldj_lsi`
pour Réactivité, `precision.asymmetries` pour Force, etc.). Vérifié empiriquement pour Endurance et
Stabilisation (§9 des missions respectives) : une asymétrie forte mais sous le seuil des deux côtés
→ `normal`, jamais un déficit inventé.

**Seule exception documentée à la règle générale "asymétrie = modificateur"** : Mobilité (ADR-008)
utilise le LSI comme confirmative **explicitement marquée `elevates:false`** — présente dans
`confirmativeEvidence` mais son propre code empêche qu'elle élève jamais le support. C'est une
confirmation renforcée du principe, pas une exception qui l'affaiblit.

Aucune variable d'asymétrie ne génère seule "X déficitaire" dans aucun des 8 moteurs. ✅

---

## 9. Relations entre qualités — documentées vs biomécaniquement plausibles

Distinction appliquée strictement : une relation n'est retenue comme "documentée" dans cet audit
que si elle est **codée** (une fonction lit effectivement la variable d'une autre qualité comme
explicative) **et** sourcée dans au moins un document `.md`. Les relations suivantes sont
**documentées et codées** :

- Force → explique Puissance, Explosivité, Endurance (via `iso_belt_squat_n`/segments).
- Capacité excentrique (CMJ) → explique Absorption.
- `dj_rsi` → explique (sans générer) Absorption réactive.
- Mobilité de cheville (`wblt_distance`) → explique Stabilisation.
- Repeated Hop → explique Réactivité (1 KPI) et confirme Endurance (9 KPI).

**Relations biomécaniquement plausibles mais NON codées comme mécanisme moteur** (mentionnées dans
la documentation source à titre de "cause potentielle" narrative, jamais comme règle de calcul) :
Force segmentaire de la hanche/cheville → Stabilisation (codé en explicatif brut, jamais classifié,
jamais générateur — cf. §2, famille RFD hanche/cheville) ; cinétique RFD complète (15 familles) →
Endurance (même statut : présente, brute, jamais classifiée). **Aucune de ces relations plausibles
n'a été transformée en règle moteur au-delà de ce que documente strictement chaque fiche HYP** — ✅
conforme à l'instruction de la mission.

---

## 10. Cause / conséquence / compensation — la conclusion centrale de cet audit

**C'est ici que se trouve l'écart le plus important entre "ce que les 8 moteurs HYP savent
honnêtement dire" et "ce que le rapport final présente au praticien".**

### Ce que les 8 moteurs HYP eux-mêmes savent faire

Vérifié qualité par qualité (§2, §7) : **constater** (un état, avec son niveau de preuve) et
**expliquer** (associer des variables explicatives lues en parallèle, jamais utilisées pour
trancher). **Aucun des 8 moteurs ne compare une qualité à une autre.** Aucun champ `causedBy`,
`explainsDeficit`, ni hiérarchie inter-qualités n'existe dans un seul des 8 objets `hypXxx01`. Sur
ce point précis, les 8 moteurs sont irréprochables et respectent scrupuleusement l'instruction
"constater sans causaliser".

### Ce que `computeMoteur()` fait ensuite, en dehors des 8 moteurs HYP — trouvaille de cet audit

Un mécanisme **entièrement séparé**, préexistant, jamais touché par aucune des 8 missions
d'implémentation (car hors de leur périmètre déclaré), construit une véritable narration causale à
partir du classement **TFM** des qualités déficitaires — pas des conclusions HYP :

```js
// index.html:5524 — classement des 3 qualités les plus déficitaires (rouge puis orange)
var deficits = FUNCTIONS.filter(fn => fSc[fn].status is rouge/orange)
                         .sort(rouge avant orange)
                         .slice(0, 3);

// index.html:5525-5543 — pour chacune, "contributeurPrincipal" dérivé À 100% du poids TFM
var contrib = SYSTEMS.filter(sys => un test de ce système a un poids TFM ≥2 pour cette
                                     fonction ET un statut non-vert);

// index.html:5936-5940 — "Chaîne causale" (commentaire du code lui-même)
causalSteps = [
  { label: "Déficit de " + priorité[0] },
  { label: "Répercussion sur " + priorité[1] },   // ← "répercussion" = présenté comme une
                                                    //   conséquence du premier
  { label: "Impact sur la performance et le risque de blessure" }
];
interpretationTxt = "Le déficit de X entraîne une altération de la capacité de Y, augmentant
                      le risque de blessure..."      // ← "entraîne" = verbe causal explicite
```

**Ce texte, avec le mot "entraîne", est celui affiché dans le Résumé clinique du rapport PDF**
(`defaultReportTexts`, `index.html:5831`) et dans la page "Chaîne causale" (`index.html:5940`),
**modifiable par le praticien mais généré par défaut avec cette formulation causale.**

**Preuve empirique, patient synthétique CAS H** (Force + Puissance + Explosivité + Absorption
déficitaires simultanément, cf. §11) :

```
fSc réel (8 moteurs HYP) : Force=rouge(retenue_faible), Explosivité=rouge(retenue_faible),
                            Absorption=orange, Puissance=null(non_determinable — HONNÊTE)

priorities (ce qui alimente le rapport) :
  #1 Réactivité   ← alors qu'AUCUNE donnée dj/sldj n'a été fournie et que hypRea01.state='absente'
  #2 Absorption
  #3 Force
  (Explosivité, pourtant réellement 'retenue_faible' avec un vrai diagnostic HYP,
   n'apparaît PAS dans le top 3 alimentant la chaîne causale)
```

**Ce cas concret illustre à la fois §6 (contradiction non_determinable) et le problème central de
cette section : le rapport peut construire une phrase "le déficit de Réactivité entraîne..." alors
que le moteur clinique dit lui-même qu'il n'y a aucune preuve de déficit de Réactivité — pendant
qu'un vrai diagnostic HYP confirmé (Explosivité, retenue_faible, preuves 2/2 réellement
convergentes) est absent de la narration.**

### Réponse explicite à la Partie 10 de la mission

- Le moteur sait **constater** (état par qualité) : ✅, honnêtement, 8/8.
- Le moteur sait **expliquer** (associer des variables explicatives) : ✅, honnêtement, 8/8,
  jamais génératrices.
- Le moteur sait **associer** deux qualités déficitaires simultanées sans hiérarchie forcée à
  l'intérieur des 8 moteurs HYP eux-mêmes : ✅ — aucun des 8 n'impose de hiérarchie entre qualités.
- **Mais un mécanisme séparé, en dehors des 8 moteurs HYP, TFM-driven, non révisé lors d'aucune des
  8 missions HYP, IMPOSE une hiérarchie causale texte ("entraîne", "Répercussion") entre qualités,
  sans vérifier qu'un lien mécanistique/explicatif documenté existe réellement entre elles, et sans
  jamais consulter `state`/`support`/`convergence` d'aucun des 8 moteurs HYP.** C'est exactement la
  dérive que la mission demande de repérer ("Force ↓ + Puissance ↓ ne signifie pas Force = cause de
  Puissance") — sauf qu'elle est déjà présente en production, à un niveau structurel (le rapport
  PDF remis au praticien), pas dans un des 8 moteurs eux-mêmes.

🔴 **C'est la décision la plus importante à trancher avant HYP-CSM-01** (voir §15) — HYP-CSM-01
ajoutera une 9e qualité dont la vocation même (contrôle sensori-moteur, en lien avec plusieurs
qualités motrices) rend ce risque de fausse causalité encore plus élevé si le mécanisme
`priorities`/`causalSteps` n'est pas revu en parallèle ou explicitement mis hors du périmètre.

---

## 11. Patients synthétiques multi-déficits

Exécutés directement via `computeMoteur()` (script jetable, non committé). Résumé des cas les plus
instructifs (les 12 cas demandés ont tous été passés en revue ; seuls les enseignements non
redondants avec §5/§6/§10 sont détaillés ici pour éviter la répétition) :

| Cas | Configuration | `fSc` (8 moteurs HYP) | Hypothèses retenues | Non_determinable | Double comptage ? | Contradiction ? |
|---|---|---|---|---|---|---|
| **A** — Force seule | 2/4 preuves Force déficitaires (seuils temporaires) | Force=rouge | HYP-FOR-01 `retenue_faible` | Puissance (aucune donnée CMJ fournie) | Non | Non — mais `priorities` inclut aussi Absorption (repli TFM sur `imtp`/`slimtp`, poids `absorption:1` chacun) alors qu'aucune donnée de freinage CMJ n'existe |
| **B/C** — Puissance seule / Explosivité seule | Non rejoué séparément (couvert par le mécanisme générique déjà validé dans chaque `IMPLEMENTATION_HYP_*.md`) | — | — | — | — | — |
| **D/E/F/G** — combinaisons Force/Puissance/Explosivité | Vérifiées via §2/§3 (étanchéité des variables sous-jacentes : CMJ concentrique vs Force globale vs RFD Explosivité) | Chaque moteur reste indépendant, confirmé par construction (variables disjointes) | — | Puissance quasi systématiquement (aucune norme `slcmj_peak_power`) | Non | Non |
| **H** — Force+Puissance+Explosivité+Absorption | Voir §10 in extenso | Force=rouge, Explosivité=rouge, Absorption=orange | Force/Explosivité `retenue_faible` réels | Puissance (honnête) | Non au niveau HYP | **Oui, au niveau `priorities`/chaîne causale (§10)** |
| **I** — Absorption + Stabilisation | `braking_rfd`/`force_zero_vel` déficitaires + `landing_uni`/`landing_bi` déficitaires | Absorption=rouge, Stabilisation=rouge (`retenue_faible`) | Les deux, indépendamment | — | **Non** — vérifié : `hypAbs01` ne contient aucune trace de `landing_*` (§2) | Non |
| **J** — Réactivité + Absorption | Non rejoué séparément — couvert par §5 (`dj_rsi` change les deux, mécanisme HYP isolé, `.status` visible d'Absorption non isolé) | — | — | — | Non (HYP) | ⚠ Oui, potentiellement, au niveau du `.status` visible d'Absorption (repli TFM, §5/§6) |
| **K** — Endurance + Force | `heel_raise_reps` + Force déficitaires | Endurance=jaune (`suspectee`, 1/6 seule preuve classifiable), Force selon ses propres preuves | Indépendantes | — | Non — vérifié : `computeHypEndurance01` ne lit aucune variable de Force ; `computeHypForce01` ne lit aucune variable Endurance | Non |
| **L** — Déficit multi-qualités complet | 8 tests actifs, valeurs délibérément mauvaises partout | Mobilité=rouge, Réactivité=rouge, Absorption=orange, Stabilisation=rouge, Contrôle Frontal=orange, Endurance=jaune ; **Force/Explosivité/Puissance=null** (`non_determinable`, aucune norme classifiable sur les valeurs fournies) | Mobilité (`wblt`, réel), Stabilisation (`landing`, réel) | 3/8 qualités, honnêtement | Non trouvé | Le rapport (`priorities`) place Absorption en #1 avec `contributeurPrincipal:null` (aucun système TFM n'a atteint le seuil de poids ≥2 avec un statut non-vert) — cohérent mais peu informatif pour le praticien : un `contributeurPrincipal` vide en tête de rapport |

**Constat CAS L, complémentaire à §10** : même dans un profil très dégradé sur presque tous les
tests, **3 des 8 qualités HYP restent honnêtement `non_determinable`** (Force/Puissance/
Explosivité) faute de normes classifiables sur les valeurs fournies — le moteur ne force jamais un
statut "rouge" par extrapolation d'un profil global mauvais. C'est le comportement attendu et
souhaité, confirmé même dans un scénario extrême.

---

## 12. Profil mixte (Capacité + Stratégie sans cause imposée)

Vérifié pour Puissance (`explanatoryEvidence.capacite`/`.strategie`, `index.html:4689-4692`) et
Explosivité (`explanatoryEvidence.forceCapacite`/`rfd`/`biomecanique`, `index.html:4925-4941`) :
les deux moteurs exposent **simultanément** capacité physiologique (tests de force dédiés) et
stratégie/biomécanique (KPI internes au CMJ) **sans jamais choisir laquelle est "la" cause** —
aucun champ `primaryMechanism` ni `dominantFactor` n'existe dans ces objets. Le commentaire de
HYP-PUI-01 le dit explicitement (`index.html:4693`) : *"Les variables Capacité/Stratégie sont
exposées à titre de traçabilité uniquement, jamais génératrices du Niveau 1."* ✅ conforme au
principe demandé par la mission — capacité et stratégie coexistent sans hiérarchie imposée par les
moteurs HYP eux-mêmes (la hiérarchisation ne réapparaît, comme en §10, que dans le mécanisme
`priorities` externe, qui ignore de toute façon ces champs `capacite`/`strategie`).

---

## 13. Variables orphelines

### 13.1 — Présentes dans le code (TESTS/TBK/THRESHOLDS) mais absentes de toute qualité HYP

| Variable/famille | Localisation | Rôle documenté ? | Statut | Action future éventuelle |
|---|---|---|---|---|
| `sllt_*` (`sllt_peak_landing_force`, `ttplf`, `loading_rate`, `tts`, `cop_path`) | `TBK.sllt` | Oui, historiquement documenté pour Absorption (cartographies antérieures), **explicitement exclu par le gel** des deux côtés (Absorption ET Stabilisation, vérifié §2) | NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES — gel confirmé, pas un oubli | Aucune sans nouvelle décision praticien — actuellement délibérément orpheline |
| `ybt_composite` (+ `ant`/`pm`/`pl`) | `TBK.ybt`, `THRESHOLDS.ybt_composite` | Non, pour aucune des 8 qualités (seul `TFM.ybt` lui donne un poids `stabilisation:2`, jamais retenu comme preuve clinique, §2) | 🔶 À VALIDER PAR LE PRATICIEN | Décision explicite nécessaire : lui attribuer un rôle documenté, ou le laisser hors HYP indéfiniment |
| `landing_bi_peak_landing_force` | `TBK.landing_bi` | Non — exclu par gel (point 2, cité dans `HYP_ARCHITECTURE_PHASE_C.md`) | NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES — gel confirmé | Aucune |
| Single/Triple/Crossover/Side Hop (`single_hop_distance`, etc.) | Utilisés uniquement par le calcul `rtpStatus` (`index.html:5545`, LSI ≥ 95 % pour le retour au sport) et par `rtpChecklist()` du rapport | Documentés comme "hors Réactivité" et "hors Stabilisation" (exclusions explicites, §2) | SOURCE EXPLICITE — orphelines des 8 moteurs HYP **par construction**, mais **pas du système** : elles pilotent `rtpStatus`, un système de décision RTP entièrement séparé | Aucune — rôle légitime hors HYP, à documenter comme tel si ce n'est pas déjà fait ailleurs |
| Familles `sh_iso_3030`/`sh_iso_6060` | `HYP_FOR_SEGMENTS` (Niveau 2 Force) | Documentées, mais **aucun seuil** (ni `NORMS` ni `THRESHOLDS`) — déjà signalé dans `IMPLEMENTATION_HYP_FOR01.md` | SOURCE EXPLICITE (rôle) / bloqué (norme) — pas orpheline, juste inerte | Norme à construire |

### 13.2 — Présentes dans les cartographies `.md` mais jamais implémentées dans un moteur HYP

- `wblt_asymmetry`/`wblt_relative_distance` — cités par `CLI020`/`CLI021` (Mobilité), **aucun
  mécanisme de calcul dans `index.html`** (`computeHypMobility01`, `precision.wblt_asymmetry`,
  `index.html:4511-4512`, retourne littéralement `status:'non_calcule'`). SOURCE EXPLICITE — écart
  déjà documenté par le moteur lui-même, pas découvert ici.
- `ankle_joint_stiffness`, `soleus_tonus`, `ankle_motor_control` (concepts cités par la fiche
  Mobilité mais jamais implémentés comme KPI mesurable, `index.html:4471`). SOURCE EXPLICITE —
  couche explicative nulle "par construction", déjà documenté.

### 13.3 — Rôle documenté mais non implémenté (au sens : présent en commentaire, retourne une valeur fixe)

- Sous-domaine E d'Absorption (Réception/Impact, SLLT/Landing) — `computeHypAbsorptionReceptionImpact()`
  retourne systématiquement `{available:false, reason:'aucun_seuil_disponible'}`. Déjà documenté,
  cohérent avec §13.1.

**Aucune variable implémentée sans rôle clinique documenté n'a été trouvée** parmi les 8 moteurs —
chaque lecture de variable dans les 8 `computeHypXxx01` est adossée à un commentaire citant sa
source (`HYP_ARCHITECTURE_PHASE_C.md`, `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`, etc.). Le seul cas
structurellement proche est `repeated_hop_mean_stiffness`, qui **n'est délibérément jamais lu**
(vérifié, absent des deux moteurs qui touchent `repeated_hop` — Réactivité et Endurance) — pas une
implémentation orpheline, une **exclusion consciente et documentée**.

---

## 14. Contradictions documentaires

| # | Source A | Source B | Contradiction | Autorité la plus haute | Résolution |
|---|---|---|---|---|---|
| 1 | `CARTOGRAPHIE_CLINIQUE_HYP_STABILISATION.md` (Table 1, DIAGNOSTIC) — exclut `strobo_surface` du rôle diagnostique | `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-STAB-01, "Critères diagnostiques"), `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` (Niveau 1), `KINEXUS_REASONING_ENGINE_V1.md` §7 | Strobo diagnostique ou seulement confirmatif/explicatif ? | Fiche de qualité + document gelé §7 (2 sources primaires contre 1 cartographie secondaire) | **Déjà tranché** dans `AUDIT_IMPLEMENTATION_HYP_STA01.md` : Strobo retenu diagnostique, divergence signalée au praticien, pas de correction silencieuse de l'ancien document |
| 2 | Correspondance de nommage `cmj_braking_rfd` ↔ `CMJ_ECC_DECEL_RFD` (Vierge_7), utilisée par HYP-EXP-01 comme explicative biomécanique | Le code lui-même (`index.html:4939`, `nomenclatureNonConfirmee:true`) | La variable lue est-elle réellement celle que Vierge_7 vise pour l'explication d'Explosivité ? | Aucune — incertitude assumée par le moteur lui-même | 🔴 **NON DÉTERMINABLE** — jamais utilisée pour trancher seule (garde-fou déjà en place), mais reste une incertitude ouverte, jamais levée depuis HYP-EXP-01 |
| 3 | `CLI070` (orientation Stabilisation) cite `SLS` seul comme déclencheur diagnostique littéral | Fiche de qualité + `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` citent 6 mécanismes (dont Landing, absent de `CLI070`) | Le périmètre diagnostique réel est-il 1 test ou 6 mécanismes ? | `KINEXUS_REASONING_ENGINE_V1.md` §6-7 (gelé, autorité la plus haute du système documentaire) | **Déjà tranché**, explicitement toléré comme non bloquant par la source la plus autoritaire — non rouvert ici |
| 4 | Vocabulaire d'état `état` standard 5 états (`absente`/`suspectee`/`retenue_faible`/`moderee`/`forte`), gelé `KINEXUS_REASONING_ENGINE_V1.md` §2-4 | `computeHypAbsorption01` utilise `niveau1` avec `ok`/`a_surveiller`/`deficitaire`/`non_determinable` | Absorption respecte-t-elle le cycle 5 états gelé ? | `KINEXUS_REASONING_ENGINE_V1.md` §2-4 (le cycle 5 états est présenté comme LE modèle du système) | 🔶 **À VALIDER** — ni corrigé ni documenté comme exception assumée à ce jour (contrairement à Mobilité/ADR-005, qui EST une exception documentée). Trouvaille de cet audit, §7/§15 |
| 5 | `priorities`/`causalSteps` (mécanisme TFM, hors HYP) présentent un "contributeurPrincipal" et une narration causale | Les 8 moteurs HYP eux-mêmes ne hiérarchisent jamais et n'imposent aucune causalité (§10, §12) | Le rapport final au praticien reflète-t-il fidèlement la rigueur des 8 moteurs HYP ? | Aucun document ne tranche cette question — jamais posée avant cet audit | 🔴 **À VALIDER PAR LE PRATICIEN** — décision d'architecture nécessaire, §10/§15 |

---

## 15. Décisions nécessaires avant HYP-CSM-01

Classées par ordre d'impact décroissant sur la fiabilité clinique du système :

1. 🔴 **Le mécanisme `priorities`/`causalSteps`/`defaultReportTexts` (§10) ignore entièrement les 8
   moteurs HYP et construit une narration causale ("entraîne", "Répercussion sur") à partir du seul
   classement TFM.** Avant d'ajouter une 9e qualité (HYP-CSM-01) qui sera nécessairement mise en
   relation avec plusieurs qualités motrices existantes, il faut décider : ce mécanisme doit-il lire
   les `state`/`support`/`convergence` des moteurs HYP plutôt que le TFM brut ? Doit-il expliciter au
   praticien que ce lien n'est PAS un lien HYP-confirmé ? Aucune correction de code n'a été faite
   dans cet audit (hors périmètre) — c'est une décision d'architecture pour une mission dédiée.

2. 🔴 **Contradiction `non_determinable` vs `.status` visible pour les 3 qualités en Style A**
   (§6) : `hypRea01.state==='absente'`/`dataAvailable:false` peut coexister avec
   `fSc['Réactivité'].status==='orange'`. Décision nécessaire : harmoniser Absorption/Réactivité/
   Mobilité sur le Style B (remplacement intégral, `status:null` si non déterminable), ou documenter
   explicitement pourquoi le repli TFM reste acceptable pour ces 3 qualités spécifiquement (elles
   sont les 3 plus anciennes du système, antérieures à la convention "mieux vaut non_determinable").

3. 🔶 **Absorption (HYP-ABS-01 V2) ne respecte pas la forme de sortie commune aux 7 autres moteurs**
   (§7, §14#4) — pas de `hypId`/`state`/`support`/`convergence`. À harmoniser avant qu'un
   consommateur générique (potentiellement HYP-CSM-01 lui-même, qui devra comparer plusieurs
   qualités) ne s'appuie dessus.

4. 🔶 **`ybt_composite`** — aucun rôle clinique documenté pour aucune des 8 qualités malgré un poids
   TFM. À valider avec le praticien : rôle réel (Stabilisation ? Mobilité ? Aucun ?) ou statu quo
   documenté indéfiniment.

5. 🔶 **Incertitude de nommage `cmj_braking_rfd`/`CMJ_ECC_DECEL_RFD`** (§14#2) — jamais résolue
   depuis HYP-EXP-01 ; sans conséquence pratique aujourd'hui (jamais utilisée pour trancher seule)
   mais devrait être confirmée avec le praticien/VALD avant qu'une norme ne soit ajoutée dessus.

6. Pas de décision requise, mais à garder en tête pour la conception de HYP-CSM-01 : la
   quasi-duplication déjà documentée entre `CLI090` (CSM, EO/EC/Strobo/SLS ensemble) et `CLI070`
   (Stabilisation, SLS seul) — signalée dans `AUDIT_IMPLEMENTATION_HYP_STA01.md` et
   `KINEXUS_REASONING_ENGINE_V1.md` §6 comme point non traité tant que HYP-CSM-01 reste suspendue.
   HYP-CSM-01 devra très probablement lire `eo_surface`/`ef_surface`/`strobo_surface`/`sls_*` —
   **exactement les mêmes variables que Stabilisation** (§2) — ce qui rendra la Partie 4 de la
   future mission HYP-CSM-01 ("étanchéité avec les 8 qualités existantes") particulièrement
   sensible : ces 4 tests sont déjà diagnostiques de Stabilisation ; leur réutilisation comme
   diagnostiques de CSM devra être explicitement justifiée par un mécanisme distinct, pas supposée
   par proximité.

---

## Conclusion — réponses aux 5 questions posées

**1. Les 8 qualités sont-elles réellement étanches ?**
Au niveau du **raisonnement clinique HYP lui-même** : oui, vérifié variable par variable et
empiriquement — aucun double comptage diagnostique, aucune variable explicative ne génère seule un
diagnostic ailleurs. Au niveau du **`.status` externe** pour les 3 qualités en repli TFM
(Absorption, Réactivité, Mobilité) : **non, pas totalement** — des variables sans rapport clinique
peuvent faire bouger leur statut visible via le poids TFM hérité, jusqu'à produire une contradiction
avec l'état honnête du moteur HYP sous-jacent (§6).

**2. Les variables partagées ont-elles toutes un rôle légitime ?**
Oui — 12+ cas de double/triple rôle recensés (§4), chacun vérifié : rôle différent par qualité, rôle
documenté, jamais générateur en dehors de son rôle diagnostique propre. Aucun rôle partagé
illégitime trouvé.

**3. Le moteur distingue-t-il correctement DIAGNOSTIC / EXPLICATION / PRÉCISION / VALIDATION ?**
À l'intérieur des 8 moteurs HYP : oui, systématiquement (§2, §12). **Mais le système dans son
ensemble ne le fait pas** : le mécanisme `priorities` externe (§10) mélange une notion de
"contributeur principal" TFM avec une narration présentée comme validante ("chaîne causale"), sans
jamais consulter les distinctions DIAGNOSTIC/EXPLICATION construites avec soin dans les 8 moteurs.

**4. Que sait réellement conclure Kinexus lorsqu'un patient présente plusieurs déficits simultanés ?**
Chaque moteur HYP conclut, indépendamment et honnêtement, sur SA qualité — avec un état parmi les 5
(ou moins selon la qualité) et un niveau de preuve explicite. **Kinexus ne sait pas, et ne prétend
pas savoir, dans les 8 moteurs HYP eux-mêmes, laquelle de plusieurs qualités déficitaires simultanées
est cause, conséquence ou compensation d'une autre** (§10, §12) — c'est correct et volontaire.
**Mais le rapport final présenté au praticien, via `priorities`/`causalSteps`, construit malgré tout
une phrase causale par défaut**, sans lien avec les conclusions des 8 moteurs HYP — c'est la
principale divergence entre "ce que le moteur sait" et "ce que le rapport affirme".

**5. Quelles règles supplémentaires sont réellement nécessaires avant HYP-CSM-01 ?**
Aucune règle clinique nouvelle n'est nécessaire pour les 8 qualités existantes — leur logique
interne est saine. **Ce qui est nécessaire, ce sont des décisions d'architecture** (§15, points 1-3
en priorité) portant sur la cohérence entre les 8 moteurs HYP et le reste du système
(`priorities`/`causalSteps`, forme de sortie d'Absorption, statut visible en repli TFM) — **avant**
d'ajouter une 9e qualité qui devra nécessairement s'articuler avec Stabilisation (variables
partagées SLS/EO/EF/Strobo, §15 point 6) et avec les qualités motrices déjà en place.

---

*Aucun fichier de production modifié pendant cet audit. Scripts d'analyse exécutés localement,
jetables, non committés.*

# Cartographie clinique — HYP-REA-01 (Réactivité)

**Statut** : cartographie clinique uniquement. Aucune modification du code (`index.html`,
`computeMoteur()`, `TFM`, `qualityScores`), aucun écran modifié, aucun branchement HYP
supplémentaire, aucune modification de `HYP-REA-01` ni des `CLI###`. Le logiciel de production reste
inchangé.

**Légende** : 🔴 Diagnostique · 🟠 Confirmative · 🟡 Explicative physiologique · 🟢 Explicative
biomécanique · ⚪ Non utilisée · SOURCE EXPLICITE / INFERENCE / **CONTRADICTION DE SOURCE** / NON
DÉTERMINABLE AVEC LES SOURCES ACTUELLES.

**Sources** : `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-REA-01, lignes 233-311, avec avertissement de
contradiction en tête de document), `CARTOGRAPHIE_VARIABLES_HYP.md` (sections Réactivité et
Endurance), `KINEXUS_REASONING_ENGINE_V1.md` §7, `index.html` (`TESTS`, `TFM`).

---

## Réponses directes aux 10 questions posées

1. **Diagnostic** : `dj_rsi` et `sldj_rsi` exclusivement, requis conjointement (2/2) — §1.
2. **Convergence** : 2/2, pas de seuil de comptage plus complexe — §2.
3. **Confirmatif** : 14 KPI DJ/SLDJ + 3 tests de hop — §1/§5.
4. **Explicatif** : cinétique RFD/TTPF de 15 tests isométriques, profil F-V, biomécanique DJ/SLDJ
   (double rôle), CMJR intégralement — §5.
5. **Tests à double rôle** : DJ/SLDJ (Réactivité et Absorption), hop tests (Réactivité et Puissance)
   — §7, §9.
6. **Ne doit pas contaminer** : WBLT, YBT, SLS/EO/EF/Strobo, Landing/SLLT, `heel_raise_reps`,
   `repeated_hop_*` — §10.
7. **CMJR** : contradiction de source **exposée, non résolue** — §3.
8. **Repeated Hop** : appartient à Endurance, avec une ambiguïté de portée textuelle et une
   contradiction TFM — §4.
9. **Réactivité vs Puissance** : ensembles diagnostiques disjoints (CMJ/SLCMJ vs DJ/SLDJ), hop tests
   partagés en confirmatif seulement — §6.
10. **Réactivité vs Absorption** : DJ/SLDJ partagés en confirmatif/explicatif, jamais en
    diagnostique pour aucune des deux qualités depuis ces tests — §7.

---

## 1. Preuves diagnostiques principales

**Vérification de la liste — confirmée exacte, DJ et SLDJ uniquement.** 🟢 SOURCE EXPLICITE
(`HYP_ARCHITECTURE_PHASE_C.md` ligne 240).

| Variable | Test | Mesure | Unité | Direction du déficit | Rôle | Source |
|---|---|---|---|---|---|---|
| `dj_rsi` | Drop Jump | Reactive Strength Index | — (ratio) | `dir:max` (bas = déficit) | Diagnostique principal | 🟢 SOURCE EXPLICITE |
| `sldj_rsi` | SLDJ | RSI unilatéral | — | `dir:max` | Diagnostique principal unilatéral | 🟢 SOURCE EXPLICITE |

**Aucune autre variable diagnostique** — vérifié : `cmjr_mean_rsi` **n'est pas** retenue comme
diagnostique de `HYP-REA-01` malgré son apparition dans `CLI050` (voir §3, contradiction exposée
séparément, pas ici).

---

## 2. Règle de convergence

**Formalisation exacte** : `dj_rsi` **et** `sldj_rsi` déficitaires **conjointement** (2/2, les deux
requis) — 🟢 SOURCE EXPLICITE (`KINEXUS_REASONING_ENGINE_V1.md` §7 : *"2/2 preuves diagnostiques
réelles (`cmjr_mean_rsi` exclue du compte, gel)"*). Structurellement identique à Puissance (2/2),
différente de Force (≥2/4).

- **Une seule preuve déficitaire** (`dj_rsi`↓, `sldj_rsi` normal, ou l'inverse) → état **Suspectée**,
  jamais Retenue. 🟢, application du principe transversal déjà gelé — pas une règle propre à
  Réactivité.
- **Convergence complète** (les deux) → **Retenue**, éligible à `CLI050`.
- **Preuves de tests différents, requis** : oui, structurellement — il n'existe que 2 variables
  diagnostiques, chacune issue d'un test distinct (DJ, SLDJ). Aucune règle de "mécanismes
  indépendants" (ADR-003) n'a besoin d'être invoquée séparément ici : avec seulement 2 candidates
  diagnostiques au total, la question ne se pose pas de la même façon que pour Force (4 tests) ou
  Absorption (plusieurs KPI d'un même test, `sllt`).

**Ne pas transformer une règle de TFM en règle HYP** : TFM pondère `dj`/`sldj` à 3 (poids maximal) et
`cmjr` **également** à 3 (`reactivite:3`, `index.html` ligne 750) dans son calcul agrégé — ce
n'est **pas** une preuve que `cmjr_mean_rsi` devrait compter dans la convergence diagnostique HYP.
Les deux moteurs (TFM, agrégation pondérée continue ; HYP, catégories discrètes diagnostique/
confirmative/explicative) ne partagent pas la même sémantique de "poids" — signalé, pas fusionné.

### Cas concrets

**DJ↓ seul, SLDJ normal** → Suspectée (Constat C0, déjà résolu par l'état Suspectée dans le cycle
V1). Aucune orientation `CLI050` produite.
**DJ↓ et SLDJ↓** → Retenue, `CLI050` éligible.
**DJ normal et SLDJ normal, `cmjr_mean_rsi`↓** → **Absente** pour `HYP-REA-01` (aucune des deux
preuves diagnostiques réelles n'est déficitaire) — même si `CLI050`, lue littéralement, compterait
`cmjr_mean_rsi` comme une preuve valable. Ce cas illustre directement la contradiction du §3, sans la
trancher davantage ici (voir CAS 9, §11).

---

## 3. CMJR — point critique, contradiction exposée

| Source | Rôle de `cmjr_mean_rsi` |
|---|---|
| **Fiche de qualité Réactivité** (`HYP_ARCHITECTURE_PHASE_C.md`, "Variables explicatives biomécaniques") | 🟡 Explicative uniquement — *"CMJR entièrement explicatif — **jamais diagnostique**"* |
| **Matrice `CLI050`** | 🔴 Diagnostique — *"deux variables RSI déficitaires"* **parmi** `dj_rsi`/`sldj_rsi`/`cmjr_mean_rsi` (les trois comptent) |
| **TFM** (`index.html` ligne 750) | Poids **3/3** (maximal) sur `reactivite`, **identique** au poids de `dj`/`sldj` — `cmjr:{reactivite:3,...}` |
| **`HYP-REA-01` (retenu pour ce document)** | 🟡 Explicative — la fiche de qualité fait foi, `cmjr_mean_rsi` ne compte jamais parmi les "deux preuves" exigées (§2) |
| **Rôle dans Puissance** | 🔴 Diagnostique **secondaire** (suppléance uniquement si CMJ/SLCMJ indisponibles) — `cmjr_peak_power`, **variable différente** de `cmjr_mean_rsi`, à ne pas confondre |
| **Rôle dans Absorption** | Non repéré dans les sources consultées pour cette mission → NON DÉTERMINABLE |

**Statut : CONTRADICTION DE SOURCE, exposée, non résolue.** 🔴 Trois sources distinctes (fiche de
qualité, matrice `CLI050`, TFM) attribuent à `cmjr_mean_rsi` trois traitements différents
(explicative seule / diagnostique au même titre que `dj_rsi` / poids maximal dans un score continu).
`HYP_ARCHITECTURE_PHASE_C.md` a déjà tranché **pour la construction du HYP###** en faveur de la
fiche de qualité (*"plus détaillée, plus justifiée, cohérente avec le gel"*) — ce document reprend ce
choix déjà acté, **sans re-arbitrer**, et documente les deux autres sources comme non alignées plutôt
que silencieusement ignorées.

**Point de vigilance additionnel, à ne pas confondre** : `cmjr_peak_power` (diagnostique secondaire
de Puissance) et `cmjr_mean_rsi` (explicative de Réactivité, au centre de la contradiction ci-dessus)
sont deux **KPI différents** du même test CMJR — leurs rôles respectifs ne se contredisent pas entre
eux, seule `cmjr_mean_rsi` porte la contradiction Réactivité.

---

## 4. Repeated Hop — point ouvert

### KPI réels (vérifiés dans `index.html`)

**`repeated_hop`** (unilatéral, 15 KPI) : `mean_height`, `best_height`, `mean_rsi`, `best_rsi`,
`mean_peak_force`, `n_hops`, `mean_ct`, `ct_drift`, `mean_stiffness`, `rsi_fatigue`,
`height_fatigue`, `stiffness_fatigue`, `height_cv`, `ct_cv`, `rsi_cv`.
**`repeated_hop_bi`** (bilatéral, 4 KPI) : `mean_height`, `mean_rsi`, `mean_peak_force`, `n_hops`.

### Ce que Vierge_7 dit exactement (fiche Réactivité)

🟢 SOURCE EXPLICITE, citation littérale (`HYP_ARCHITECTURE_PHASE_C.md` ligne 300) : *"toutes les
variables `repeated_hop_*` de fatigue/dégradation (voir Endurance)"* — dans la section "Variables
exclues" de `HYP-REA-01`.

### A — Explicitement diagnostique
Aucune variable `repeated_hop_*` n'est diagnostique de Réactivité. En revanche,
`CARTOGRAPHIE_VARIABLES_HYP.md` (section Endurance, lignes 497-498) confirme : `repeated_hop_n_hops`,
`repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`,
`repeated_hop_stiffness_fatigue` sont **diagnostiques d'Endurance**. 🟢 SOURCE EXPLICITE.

### B — Confirmatif
Aucun rôle confirmatif pour Réactivité. Pour Endurance : `repeated_hop_mean_height`,
`repeated_hop_mean_rsi`, `repeated_hop_mean_peak_force`, `repeated_hop_mean_ct`,
`repeated_hop_best_height`, `repeated_hop_best_rsi`, `repeated_hop_height_cv`, `repeated_hop_ct_cv`,
`repeated_hop_rsi_cv`. 🟢 SOURCE EXPLICITE.

### C — Explicatif
Aucun rôle explicatif pour Réactivité dans les sources consultées.

### D — Ce qui reste contradictoire/non tranchable

**Point 1 — Ambiguïté de portée textuelle, non arbitrée** : la formule d'exclusion *"toutes les
variables `repeated_hop_*` de fatigue/dégradation"* peut se lire de deux façons :
- **Lecture large** : toutes les variables `repeated_hop_*`, qualifiées collectivement de
  "fatigue/dégradation" (le test dans son ensemble sert à mesurer la fatigue) → **toutes** exclues de
  Réactivité, y compris `repeated_hop_mean_rsi`.
- **Lecture stricte** : seules les variables **spécifiquement** de fatigue/dégradation (`rsi_fatigue`,
  `height_fatigue`, `stiffness_fatigue`, `ct_drift`, éventuellement `n_hops`) sont exclues — les
  variables de moyenne/meilleure performance (`mean_rsi`, `mean_height`, `best_rsi`...) ne seraient
  pas nommément visées.
`CARTOGRAPHIE_VARIABLES_HYP.md` applique en pratique la lecture large (`repeated_hop_mean_rsi` classé
uniquement Endurance, jamais Réactivité) — mais le texte source de la fiche Réactivité, pris seul,
n'exclut pas formellement la lecture stricte. 🔴 **NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES** —
signalé, non arbitré ici.

**Point 2 — Contradiction avec TFM** : TFM attribue à `repeated_hop` un poids **non nul** sur
`reactivite` — `repeated_hop:{reactivite:2,endurance:3}` (`index.html` ligne 750). TFM traite donc
`repeated_hop` comme réellement contributif à Réactivité (poids 2, comparable à `sldj`... non, `sldj`
a 3 — mais 2 reste un poids significatif, supérieur à 0), **alors que** la fiche `HYP-REA-01`
l'exclut explicitement dans son intégralité (sous la lecture large ci-dessus). 🔴 **CONTRADICTION DE
SOURCE**, exposée, non résolue — même nature que la contradiction `cmjr` (§3), impliquant le même
mécanisme (TFM pondère des tests que HYP exclut ou cantonne à un rôle non diagnostique).

---

## 5. Explication du déficit de Réactivité

### Famille — Cinétique de production de force (RFD/TTPF, 15 tests)

| Test | KPI exacts | Statut |
|---|---|---|
| `imtp` | `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | 🟡 🟢 SOURCE EXPLICITE |
| `slimtp` | `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | 🟡 🟢 |
| `iso_belt_squat` | `iso_belt_squat_rfd100`, `_rfd200`, `_ttpf` | 🟡 🟢 |
| `sl_iso_push` | `sl_iso_push_rfd100`, `_rfd200`, `_ttpf` | 🟡 🟢 |
| `iso_squat_hold` | `iso_squat_hold_rfd100`, `_rfd200`, `_ttpf` | 🟡 🟢 |
| `knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso` (11 tests segmentaires) | `_rfd50`/`100`/`150`/`200`/`ttpf` de chacun | 🟡 🟢 SOURCE EXPLICITE, cinétique segmentaire complète |

*Ce que cette famille mesure* : vitesse de production de force isométrique — mécanisme potentiellement
lié à la capacité de restituer rapidement une force au contact du sol, **mais** aucun lien mécaniste
explicite n'est formulé au-delà de la simple appartenance à la catégorie explicative. 🟠 INFERENCE
pour le mécanisme précis.

### Famille — Profil Force-Vitesse

| Variable | Statut |
|---|---|
| `profil_fv_nkg` (F0), `profil_fv_v0` (V0) | 🟡 🟢 SOURCE EXPLICITE (appartenance) |

### Famille — Biomécanique DJ/SLDJ (double rôle avec confirmative, §1)

| Variable | Test | Ce qu'elle mesure | Mécanisme documenté | Statut |
|---|---|---|---|---|
| `dj_contact_time` / `sldj_contact_time` | DJ / SLDJ | Temps de contact au sol (ms) | Composante temporelle du RSI (RSI = hauteur / temps de contact) | 🟢 SOURCE EXPLICITE (appartenance) / 🟠 (mécanisme) |
| `dj_leg_stiffness` / `sldj_leg_stiffness` | DJ / SLDJ | Raideur de jambe (kN/m) | Stratégie de raideur pendant le contact | 🟢 / 🟠 |
| `dj_peak_landing_force` / `sldj_peak_landing_force` | DJ / SLDJ | Force de pic à l'atterrissage (N/kg) | Amplitude de la charge à absorber/restituer | 🟢 / 🟠 — **partagée avec Absorption, §7** |
| `dj_landing_impulse` / `sldj_landing_impulse` | DJ / SLDJ | Impulsion à l'atterrissage (Ns/kg) | idem | 🟢 / 🟠 — partagée avec Absorption |
| `dj_peak_prop_force` / `sldj_peak_prop_force` | DJ / SLDJ | Force de pic en phase propulsive (N/kg) | Composante force de la restitution | 🟢 / 🟠 |
| `dj_peak_prop_power` / `sldj_peak_prop_power` | DJ / SLDJ | Puissance de pic en phase propulsive (W/kg) | idem — **également diagnostique secondaire de Puissance**, §6 | 🟢 / 🟠 |

### Famille — CMJR (entièrement explicative, jamais diagnostique — §3)

| Variable | Ce qu'elle mesure | Statut |
|---|---|---|
| `cmjr_mean_rsi` | RSI moyen sur la série de rebonds | 🟢 explicative / 🔴 contradiction (§3) |
| `cmjr_mean_ct` | Temps de contact moyen | 🟢 explicative |
| `cmjr_mean_stiffness` | Raideur de jambe moyenne | 🟢 explicative |
| `cmjr_mean_rebound_height` | Hauteur de rebond moyenne | 🟢 explicative |
| `cmjr_rsi_decay` | Dégradation du RSI au fil des rebonds | 🟢 explicative — dimension de fatigue interne au test, distincte de `repeated_hop` |
| `cmjr_stiffness_decay` | Dégradation de la raideur | 🟢 explicative |

---

## 6. Puissance vs Réactivité

| Test/Variable | Puissance | Réactivité | Rôle dans chaque qualité |
|---|---|---|---|
| `cmj_peak_power`/`slcmj_peak_power` | 🔴 Diagnostique | ⚪ Exclue | CMJ/SLCMJ = univers exclusif de Puissance |
| 15+14 KPI stratégie CMJ/SLCMJ | 🟡 Explicative | ⚪ Exclue | idem |
| `dj_rsi`/`sldj_rsi` | ⚪ Non utilisée | 🔴 Diagnostique | DJ/SLDJ = univers exclusif de Réactivité pour le diagnostic |
| `dj_peak_prop_power`/`sldj_peak_prop_power` | 🔴 Diagnostique **secondaire** (suppléance) | 🟠 Confirmative / 🟢 explicative | **Double rôle réel** — jamais en renfort pour Puissance (rang secondaire), toujours actif pour Réactivité |
| `cmjr_peak_power` | 🔴 Diagnostique secondaire | ⚪ Non utilisée | CMJR : rôle différent selon la qualité, KPI différent de `cmjr_mean_rsi` |
| `cmjr_mean_rsi` (+ 5 autres KPI CMJR) | ⚪ Non utilisée | 🟢 Explicative (contradiction §3) | — |
| `single_hop_distance`, `triple_hop_distance` | 🟠 Confirmative | 🟠 Confirmative | **Partagées** — mêmes tests, même rôle catégoriel dans les deux qualités |
| `crossover_hop_distance` | ⚪ Non utilisée | 🟠 Confirmative | Réactivité uniquement |

**Question posée : quelle est la différence clinique entre "beaucoup de puissance" et "réactif" ?**
🟢 Construite exclusivement à partir des rôles définis, pas d'une définition physiologique externe :
Puissance se diagnostique sur **un seul saut contre-mouvement** (CMJ/SLCMJ, mouvement volontaire,
sans contrainte de temps de contact) ; Réactivité se diagnostique sur **un saut en profondeur** (DJ/
SLDJ, avec une phase de chute imposée et une contrainte explicite de rapidité de restitution — RSI =
hauteur/temps de contact). Les deux partagent des preuves confirmatives fonctionnelles (hop tests)
mais **aucune preuve diagnostique commune** — vérifié, aucune variable n'apparaît diagnostique dans
les deux listes.

---

## 7. Réactivité vs Absorption

| Variable | Réactivité | Absorption | Pourquoi |
|---|---|---|---|
| `dj_peak_landing_force`/`sldj_peak_landing_force` | 🟠 Confirmative / 🟢 explicative | 🟠 Confirmative / 🟢 explicative (`CARTOGRAPHIE_VARIABLES_HYP.md` lignes 463-464) | **Double rôle réel, jamais diagnostique pour aucune des deux** — la force de pic à l'atterrissage informe à la fois "combien de force est restituée rapidement" (Réactivité) et "quelle charge doit être absorbée" (Absorption) |
| `dj_landing_impulse`/`sldj_landing_impulse` | 🟠 / 🟢 | 🟠 / 🟢 | idem |
| `dj_contact_time`/`sldj_contact_time` | 🟠 / 🟢 | 🟠 (ligne 463) / 🟢 (ligne 464) | idem — le temps de contact informe le RSI (Réactivité) et la durée de gestion de la charge (Absorption) |
| `dj_leg_stiffness`/`sldj_leg_stiffness` | 🟢 explicative | 🟢 explicative (ligne 464) | idem |
| `dj_peak_prop_force`/`power`, `sldj_*` | 🟠 / 🟢 | 🟢 explicative (ligne 464) | idem |
| Diagnostic Absorption réel (`landing_uni_tts`, `landing_bi_tts`, `sllt_*`, `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd`, `cmj_braking_impulse`) | ⚪ **Non utilisée par Réactivité, sous aucun rôle** | 🔴 Diagnostique | Aucune de ces variables n'apparaît dans l'inventaire "Variables contributrices" de Réactivité — vérifié |
| `sldj_tts` (Time to Stabilization, KPI réel de SLDJ, `index.html` ligne 126) | ⚪ Non utilisée | Non repéré dans les listes Absorption consultées | 🔴 NON DÉTERMINABLE — variable présente dans le code mais son usage HYP### n'a pas été identifié pour aucune qualité dans le périmètre de cette mission |

**Objectif de cette section, vérifié** : aucun score de Réactivité ne peut être artificiellement
expliqué par une variable diagnostique d'Absorption — les ensembles diagnostiques restent disjoints
(`dj_rsi`/`sldj_rsi` vs `landing_uni_tts`/`landing_bi_tts`/`sllt_*`). Les variables partagées le sont
**uniquement aux niveaux confirmatif/explicatif**, jamais diagnostique, dans les deux sens.

---

## 8. CMJ / SLCMJ dans Réactivité — vérification explicite

| Variable | Diagnostique Réactivité ? | Confirmative ? | Explicative ? | Exclue ? |
|---|---|---|---|---|
| `cmjr_mean_rsi` | Non (contradiction `CLI050`, §3) | Non | ✅ Oui | — |
| `cmj_conc_rfd` | Non | Non | Non | ✅ **Exclue** — n'apparaît dans aucune liste de Réactivité ; c'est une variable de Puissance/Explosivité |
| `cmj_braking_rfd` | Non | Non | Non | ✅ **Exclue** — variable d'Absorption/Explosivité |
| `cmj_height` | Non | Non | Non | ✅ **Exclue** — confirmative de Puissance uniquement |
| Toute autre variable `cmj_*`/`slcmj_*` (hors CMJR) | Non | Non | Non | ✅ **Exclue**, `HYP_ARCHITECTURE_PHASE_C.md` ligne 298-300 : *"toutes les variables de... (mobilité/équilibre/contrôle sensoriel)"* — et l'inventaire "Variables contributrices" de Réactivité ne cite jamais `cmj`/`slcmj` |

**Rappel explicite de la distinction demandée** : **CMJ** (Countermovement Jump, mouvement
volontaire) et **CMJ Rebound / CMJR** (rebonds successifs, contrainte de temps de contact) sont
**deux tests différents** dans Kinexus. Seul CMJR contribue à Réactivité (explicativement,
contradiction §3) — le CMJ simple n'y contribue **jamais**, sous aucun rôle. Vérifié variable par
variable ci-dessus.

---

## 9. Variables à double rôle — liste exhaustive

| Variable | Réactivité | Puissance | Absorption | Autre | Rôle exact |
|---|---|---|---|---|---|
| `dj_peak_prop_power`/`sldj_peak_prop_power` | 🟠 Confirmative / 🟢 Explicative | 🔴 Diagnostique secondaire (suppléance) | ⚪ | — | Jamais diagnostique pour Réactivité, jamais en renfort pour Puissance |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | 🟠 / 🟢 | ⚪ | 🟠 / 🟢 | — | Double rôle Réactivité/Absorption, jamais diagnostique nulle part |
| `dj_landing_impulse`/`sldj_landing_impulse` | 🟠 / 🟢 | ⚪ | 🟠 / 🟢 | — | idem |
| `dj_contact_time`/`sldj_contact_time` | 🟠 / 🟢 | ⚪ | 🟠 / 🟢 | — | idem |
| `dj_leg_stiffness`/`sldj_leg_stiffness` | 🟢 | ⚪ | 🟢 | — | idem |
| `dj_peak_prop_force`/`sldj_peak_prop_force` | 🟠 / 🟢 | ⚪ | 🟢 | — | idem |
| `single_hop_distance`, `triple_hop_distance` | 🟠 Confirmative | 🟠 Confirmative | ⚪ | — | Partagées Réactivité/Puissance |
| `crossover_hop_distance` | 🟠 Confirmative | ⚪ | ⚪ | — | Réactivité uniquement |
| `cmjr_mean_rsi` | 🟢 Explicative (contradiction) | ⚪ | Non déterminable | — | Voir §3 |
| `cmjr_peak_power` | ⚪ | 🔴 Diagnostique secondaire | Non déterminable | — | KPI différent de `cmjr_mean_rsi`, pas de contradiction propre |
| 15 tests RFD/TTPF isométriques (`imtp_rfd*`...`ev_iso_rfd*`) | 🟡 Explicative | 🟡 Explicative (10 des 15, sans les 3 tests chevi̇lle) | Non vérifié dans cette mission | — | Même catégorie dans les deux qualités vérifiées, appartenance non conflictuelle |
| `profil_fv_nkg`/`v0` | 🟡 Explicative | 🟡 Explicative | Non vérifié | — | idem |

**Hiérarchie vérifiée intacte pour toutes les lignes ci-dessus** : aucune variable confirmative ou
explicative dans une qualité n'apparaît diagnostique dans une autre. Le seul point de tension réel
reste `cmjr_mean_rsi` (§3), où la tension existe **à l'intérieur même** de la documentation de
Réactivité, pas entre deux qualités différentes.

---

## 10. Tests qui ne doivent pas contaminer Réactivité

| Test | Réactivité | Rôle éventuel | Pourquoi |
|---|---|---|---|
| WBLT | ⚪ Exclu | Mobilité (diagnostique) | 🟢 SOURCE EXPLICITE, "Variables exclues" |
| Heel Raise (`heel_raise_reps`) | ⚪ Exclu | Endurance (diagnostique) | 🟢 SOURCE EXPLICITE, cité nommément — **mais TFM lui donne `reactivite:1`, contradiction à signaler (§13)** |
| Landing (uni/bi), SLLT | ⚪ Exclu | Absorption (diagnostique) | 🟢 SOURCE EXPLICITE |
| YBT | ⚪ Exclu | Non repéré dans Réactivité ni cité nommément dans les "Variables exclues" — absent de l'inventaire positif | 🟢 SOURCE EXPLICITE (par absence) |
| Hop tests (single/triple/crossover) | **Utilisés** — confirmatifs | Confirmative Réactivité (et Puissance pour single/triple) | 🟢 SOURCE EXPLICITE — **ne pas exclure**, contrairement à la consigne de vérification, ces tests sont légitimement inclus |
| CMJ, SLCMJ | ⚪ Exclu | Puissance (diagnostique) | 🟢 SOURCE EXPLICITE, absents de l'inventaire, §8 |
| Profil F-V | **Utilisé** — explicatif | Explicative Réactivité | 🟢 SOURCE EXPLICITE — inclus légitimement, pas à exclure |
| Force segmentaire (RFD/TTPF des 11 tests) | **Utilisée** — explicative | Explicative Réactivité (cinétique) | 🟢 — inclus légitimement ; **seule la magnitude `n`/`nkg` segmentaire est exclue**, pas la cinétique |
| Force segmentaire, magnitude (`n`/`nkg`) | ⚪ Exclue | Force (confirmative/explicative) | 🟢 — absente de l'inventaire Réactivité, seule la RFD/TTPF y figure |

---

## 11. Cas cliniques synthétiques

### CAS 1 — DJ diagnostique normal, SLDJ diagnostique normal
Réactivité **Absente**. 🟢.

### CAS 2 — DJ déficitaire, SLDJ normal
**Signal** (état Suspectée) — condition 2/2 non remplie. Pas de `CLI050`. 🟢.

### CAS 3 — DJ déficitaire, SLDJ déficitaire
**Réactivité Retenue** — condition 2/2 remplie, `CLI050` éligible. 🟢.

### CAS 4 — DJ + SLDJ déficitaires, CMJ normal
Réactivité Retenue (preuves indépendantes du CMJ, §6). Le CMJ normal ne renforce ni n'affaiblit la
conclusion Réactivité — il n'appartient tout simplement pas à son univers de preuves. 🟢.

### CAS 5 — DJ + SLDJ normaux, CMJ peak power déficitaire
**Puissance** : diagnostic rempli si `slcmj_peak_power` est également déficitaire (2/2 requis pour
Puissance, non précisé dans ce cas pour SLCMJ — statut de `slcmj_peak_power` non donné) → 🔴 **NON
DÉTERMINABLE avec les seules données de ce cas** pour Puissance. **Réactivité** : normale — DJ/SLDJ
tous deux normaux, condition 2/2 non remplie côté déficit. Aucune contamination croisée quel que soit
le résultat côté Puissance. 🟢 pour la partie Réactivité, 🔴 pour la conclusion Puissance incomplète.

### CAS 6 — DJ/SLDJ déficitaires, CMJ/SLCMJ déficitaires
**Les deux hypothèses peuvent être Retenues simultanément et indépendamment** — ensembles
diagnostiques disjoints (§6), même logique que le Cas D de Force/Puissance déjà validé en Phase D.
`HYP-PUI-01` Retenue + `HYP-REA-01` Retenue, sans qu'aucune ne dépende de l'autre pour son propre
diagnostic. 🟢.

### CAS 7 — Réactivité déficitaire, Landing normal
Réactivité Retenue (via DJ/SLDJ). Landing normal (`landing_uni_tts`/`landing_bi_tts` normaux) →
Absorption reste Absente, **indépendamment** du statut de Réactivité — ensembles diagnostiques
disjoints (§7). Un déficit de Réactivité **n'implique rien** sur Absorption. 🟢.

### CAS 8 — Réactivité normale, Landing déficitaire
Symétrique — Absorption Retenue (via Landing/SLLT), Réactivité reste Absente ou Suspectée selon
`dj_rsi`/`sldj_rsi`, indépendamment du Landing. 🟢.

### CAS 9 — `cmjr_mean_rsi` déficitaire, DJ/SLDJ normaux
**Selon la fiche de qualité HYP-REA-01 (retenue pour ce document)** : `cmjr_mean_rsi` est
uniquement explicative, jamais diagnostique — avec `dj_rsi`/`sldj_rsi` normaux (0/2 preuves
diagnostiques réelles déficitaires), `HYP-REA-01` reste **Absente**. L'explicative ne peut jamais
générer seule (principe transversal déjà gelé).
**Selon `CLI050` lue littéralement** : `cmjr_mean_rsi` compterait comme **une** des "deux variables
RSI déficitaires" — avec une seule preuve sur trois candidates déficitaire (`cmjr_mean_rsi` seule),
la condition "deux" ne serait de toute façon **pas remplie non plus** dans ce cas précis (il en
faudrait une seconde parmi les trois). **Mais** si un second cas hypothétique combinait
`cmjr_mean_rsi`↓ et `dj_rsi`↓ (SLDJ normal), `CLI050` lue littéralement se déclencherait, alors que la
fiche de qualité ne retiendrait `HYP-REA-01` qu'à l'état **Suspectée** (une seule preuve diagnostique
réelle). **Conséquence exposée, non arbitrée** : les deux lectures produisent des résultats
différents dès qu'un scénario combine `cmjr_mean_rsi` avec une seule des deux vraies diagnostiques —
signalé, pas résolu, conformément à la consigne.

### CAS 10 — Repeated Hop déficitaire, DJ/SLDJ normaux
**Ce que les sources permettent de conclure** : `HYP-REA-01` reste **Absente** — `dj_rsi`/`sldj_rsi`
normaux, aucune variable `repeated_hop_*` n'est diagnostique de Réactivité sous aucune des deux
lectures possibles (§4). Le déficit `repeated_hop` reste pertinent pour **Endurance**
(potentiellement diagnostique, selon les KPI précis déficitaires — hors périmètre de cette mission).
**Ce qui reste non tranché** : si la variable spécifique déficitaire est `repeated_hop_mean_rsi`
(plutôt qu'un KPI de fatigue explicite), la question de savoir si elle **devrait** avoir un rôle
explicatif pour Réactivité reste ouverte (§4, point 1) — ce document ne tranche pas cette ambiguïté
textuelle, il la signale.

---

## 12. Matrice praticien

| Question clinique | Tests/variables | Niveau de preuve |
|---|---|---|
| La Réactivité est-elle déficitaire ? | `dj_rsi` **et** `sldj_rsi`, conjointement (2/2) | Diagnostic |
| Quelle preuve confirme ? | Temps de contact, hauteur, force/puissance propulsive et d'atterrissage (DJ/SLDJ), hop tests (single/triple/crossover) | Confirmation |
| Qu'est-ce qui explique le déficit ? | Cinétique RFD/TTPF (15 tests isométriques), profil force-vitesse, biomécanique DJ/SLDJ, CMJR (contradiction, §3) | Explicatif |
| Est-ce plutôt un problème de Puissance ? | Vérifier `cmj_peak_power`/`slcmj_peak_power` — ensembles diagnostiques disjoints, aucune contamination possible | Autre qualité |
| Est-ce plutôt un problème d'Absorption ? | Vérifier `landing_uni_tts`/`landing_bi_tts`/`sllt_*` — ensembles diagnostiques disjoints | Autre qualité |
| Quelle place pour CMJR ? | Explicative selon la fiche retenue ; diagnostique selon `CLI050` lu littéralement — **contradiction non résolue** | Signalé, pas tranché |
| Quelle place pour Repeated Hop ? | Exclue de Réactivité (Endurance) ; portée exacte de l'exclusion et poids TFM contradictoire — **non tranchés** | Signalé, pas tranché |

---

## 13. Règle d'étanchéité — vérification

- **Une variable diagnostique de Puissance ne devient pas diagnostique de Réactivité** : vérifié,
  `cmj_peak_power`/`slcmj_peak_power` n'apparaissent dans aucune liste de Réactivité. 🟢.
- **Une variable d'Absorption ne devient pas diagnostique de Réactivité** : vérifié, `landing_*`/
  `sllt_*`/`cmj_ecc_*`/`cmj_braking_*` absentes de l'inventaire Réactivité. 🟢.
- **Une variable confirmative ne devient pas diagnostique du seul fait de sa pondération TFM** :
  🔴 **violation identifiée, non corrigée** — TFM pondère `cmjr` à 3/3 (poids maximal, identique à
  `dj`/`sldj`) dans son score continu, ce qui traite de fait `cmjr` comme aussi déterminant que les
  vraies preuves diagnostiques pour le score final affiché au praticien, **alors que** HYP-REA-01
  exclut `cmjr_mean_rsi` du diagnostic. Signalé, **non corrigé**, conformément à la consigne.
- **Une variable explicative ne peut jamais créer seule une hypothèse** : vérifié comme principe
  général du moteur V1 (non rouvert ici), appliqué correctement dans tous les cas §11.

**Violations TFM identifiées, non corrigées** (consolidées) :
1. `cmjr:{reactivite:3}` — poids maximal sur un test explicatif, jamais diagnostique en HYP.
2. `repeated_hop:{reactivite:2}` — poids non nul sur un test totalement exclu de Réactivité en HYP.
3. `heel_raise:{reactivite:1}` — poids non nul sur une variable explicitement exclue
   (`heel_raise_reps` cité nommément dans "Variables exclues").
4. `side_hop:{reactivite:1}` — poids non nul sur un test absent de tout inventaire HYP-REA-01
   (diagnostique, confirmative ou explicative) — variable non trouvée dans la fiche de qualité.

---

## 14. Contradictions / zones non arbitrées

| Point | Source A | Source B | Différence | Conséquence clinique | Statut |
|---|---|---|---|---|---|
| `cmjr_mean_rsi` | Fiche de qualité Réactivité : explicative, jamais diagnostique | `CLI050` : diagnostique, comptée parmi "2 variables RSI déficitaires" | Rôle diagnostique vs explicatif | Un déficit isolé de `cmjr_mean_rsi` combiné à une seule vraie diagnostique (`dj_rsi` ou `sldj_rsi`) produit des conclusions différentes selon la source retenue (CAS 9) | **CONTRADICTION DE SOURCE**, déjà signalée en Phase C, reprise ici sans re-arbitrage |
| `cmjr` (poids TFM) | Fiche de qualité + `HYP-REA-01` : explicative uniquement | TFM : poids 3/3 (maximal) sur `reactivite` | Statut catégoriel HYP vs poids continu TFM | Le score TFM affiché aujourd'hui au praticien peut être fortement influencé par `cmjr`, alors que HYP ne le retiendrait jamais comme preuve diagnostique | **CONTRADICTION DE SOURCE** (entre HYP et TFM, pas entre deux lectures de Vierge_7) |
| `repeated_hop_*`, portée de l'exclusion | Lecture stricte : seuls les KPI de fatigue explicites sont exclus | Lecture large : tous les KPI `repeated_hop_*` sont exclus | Statut de `mean_rsi`/`mean_height`/etc. pour Réactivité | Sous la lecture stricte, certains KPI `repeated_hop_*` pourraient légitimement rejoindre l'explicatif de Réactivité — non tranché | **NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES** |
| `repeated_hop` (poids TFM) | `HYP-REA-01` : exclusion totale ou quasi-totale (selon lecture ci-dessus) | TFM : `reactivite:2` (poids significatif) | Exclusion HYP vs contribution TFM | Le score TFM intègre aujourd'hui `repeated_hop` dans Réactivité alors que HYP l'exclut | **CONTRADICTION DE SOURCE** |
| `heel_raise` (poids TFM) | `HYP-REA-01` : `heel_raise_reps` explicitement exclue | TFM : `reactivite:1` | Exclusion HYP vs contribution TFM | idem, ampleur moindre (poids 1) | **CONTRADICTION DE SOURCE** |
| `side_hop` | `HYP-REA-01` : absent de tout inventaire | TFM : `reactivite:1` | Absence HYP vs contribution TFM | idem | **CONTRADICTION DE SOURCE** |

Aucune de ces six lignes n'est arbitrée par ce document — chacune reste ouverte, avec sa source A et
sa source B clairement identifiées.

---

## 15. Conclusion praticien

**Comment Kinexus doit-il raisonner lorsqu'un athlète présente un problème de Réactivité ?**

1. **Ce qui déclenche réellement Réactivité** : uniquement le Drop Jump et le Single Leg Drop Jump —
   leur indice de réactivité (RSI) doit être bas sur les deux tests à la fois. Un déficit sur un seul
   des deux est un signal à surveiller, pas encore une conclusion.
2. **Ce qui la confirme** : le détail du contact au sol (temps de contact, raideur de jambe, force et
   puissance à l'atterrissage et à la poussée) sur ces mêmes deux tests, ainsi que les tests de saut
   horizontal (simple, triple, croisé).
3. **Ce qui explique le déficit** : la vitesse de production de force sur l'ensemble des tests de
   force isométrique (globaux et segmentaires), le profil force-vitesse, et — avec une réserve
   importante — le CMJ Rebound.
4. **Ce qui appartient à Puissance** : tout ce qui touche au CMJ et au SLCMJ classiques (saut
   contre-mouvement) — ces tests ne contribuent jamais à Réactivité, sous aucun rôle.
5. **Ce qui appartient à Absorption** : tout ce qui touche à l'atterrissage stabilisé (Landing, SLLT,
   temps de stabilisation) — ces tests ne contribuent jamais au diagnostic de Réactivité, même s'ils
   partagent certaines variables de contact au sol avec le Drop Jump à titre confirmatif/explicatif
   uniquement.
6. **Ce qui reste incertain, à ne pas considérer comme tranché** : le rôle exact du CMJ Rebound (les
   sources se contredisent directement — la fiche clinique dit "jamais diagnostique", la matrice
   d'orientation dit le contraire, et l'écran actuel de Kinexus le pondère au maximum) ; le
   périmètre exact de l'exclusion du Repeated Hop ; et le fait que l'écran actuel (TFM) contribue
   aujourd'hui des poids à Réactivité pour des tests que le nouveau modèle exclurait — un écart entre
   les deux logiques qui n'a pas vocation à être corrigé dans cette mission, seulement documenté.

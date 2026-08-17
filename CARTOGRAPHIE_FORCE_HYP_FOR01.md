# Cartographie clinique — HYP-FOR-01 (Force)

**Statut** : cartographie clinique uniquement. Aucune modification du code (`index.html`,
`computeMoteur()`, `TFM`, `qualityScores`), aucun écran modifié, aucun branchement HYP
supplémentaire. Le logiciel de production reste inchangé.

**Légende** : 🔴 Diagnostique · 🟠 Confirmative · 🟡 Explicative physiologique · 🟢 Explicative
biomécanique · ⚪ Non utilisée pour Force · SOURCE EXPLICITE / INFERENCE / NON DÉTERMINABLE.

**Sources** : `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-FOR-01, lignes 70-157 — la plus détaillée du
corpus, avec une liste explicite de "Variables exclues"), `CARTOGRAPHIE_VARIABLES_HYP.md` (section
Force), `index.html` (`TESTS`) pour les libellés/unités/`dir`.

---

## Réponses directes aux 7 questions posées

1. **Diagnostic** : `imtp_n`, `slimtp_n`, `iso_belt_squat_n`, `sl_iso_push_n` — exactement les 4
   tests déjà identifiés, confirmés exhaustifs (§1).
2. **Confirmation** : les mêmes 4 tests, version `_nkg` (relative au poids) — jamais d'autres
   variables (§3).
3. **Explication de l'origine** : force segmentaire (11 groupes + épaule), cinétique RFD/TTPF des
   tests globaux et segmentaires, tests run-specific (§4-§5).
4. **Ne doivent jamais déterminer Force seules** : toute variable segmentaire ou RFD/TTPF, quel que
   soit son ampleur — condition de rejet documentée en §6.
5. **Décomposition segmentaire** : 11 segments + épaule, chacun avec sa propre orientation `CLI2xx`,
   condition à deux volets (global **et** local) — §5-§6.
6. **Global vs segmentaire** : `imtp`/`slimtp`/`iso_belt_squat`/`sl_iso_push` sont globaux ; les 11
   tests segmentaires + `sh_iso_*` + `rs_*` sont segmentaires/complémentaires — jamais globaux (§7).
7. **Ne doit surtout pas contaminer Force** : toutes les variables CMJ/SLCMJ/DJ/SLDJ/CMJR — **exclusion
   explicite de la fiche source elle-même** (§8-§9).

---

## 1. Preuve diagnostique principale

**Vérification de la liste des 4 tests globaux — confirmée exacte et complète.** 🟢 SOURCE EXPLICITE
(`HYP_ARCHITECTURE_PHASE_C.md` §"Critères diagnostiques", ligne 77) : aucun cinquième test global
n'existe dans les sources.

| Test | Nom exact Kinexus | KPI diagnostique | Unité | Direction du déficit | Rôle | Source |
|---|---|---|---|---|---|---|
| Isometric Mid-Thigh Pull | `imtp` | `imtp_n` | N | `dir:max` (bas = déficit) | Diagnostique | 🟢 SOURCE EXPLICITE |
| Single Leg Isometric Mid-Thigh Pull | `slimtp` | `slimtp_n` | N | `dir:max` | Diagnostique | 🟢 |
| Isometric Belt Squat | `iso_belt_squat` | `iso_belt_squat_n` | N | `dir:max` | Diagnostique | 🟢 |
| Single Leg Isometric Squat Hold | `sl_iso_push` | `sl_iso_push_n` | N | `dir:max` | Diagnostique | 🟢 |

**Condition de convergence** : `CLI010` — **au moins 2 des 4 variables diagnostiques déficitaires**
(pas 4/4 comme pour Puissance, pas 1/1 comme pour Mobilité). 🟢 SOURCE EXPLICITE. Retenue comme
condition d'activation de `HYP-FOR-01` par cohérence directe avec `CLI010`, sans ajout.

**Point de vigilance, respecté** : ces 4 tests sont diagnostiques **parce que Vierge_7 les nomme
ainsi dans la fiche de qualité**, pas parce qu'ils "mesurent de la force" — plusieurs autres tests
mesurent également de la force (les 11 segmentaires, `rs_*`) sans être diagnostiques (§4-§5).

---

## 2. Variables diagnostiques, KPI par KPI

| Variable | Test | Mesure | Unité | Déficit | Rôle | Source |
|---|---|---|---|---|---|---|
| `imtp_n` | IMTP | Force isométrique de pic, bilatéral | N | bas | 🔴 Diagnostique | 🟢 |
| `slimtp_n` | SLIMTP | Force isométrique de pic, unilatéral | N | bas | 🔴 Diagnostique | 🟢 |
| `iso_belt_squat_n` | Iso Belt Squat | Force isométrique de pic, bilatéral | N | bas | 🔴 Diagnostique | 🟢 |
| `sl_iso_push_n` | SL Iso Push | Force isométrique de pic, unilatéral | N | bas | 🔴 Diagnostique | 🟢 |

Aucun regroupement — les 4 variables restent listées individuellement, conformément à la consigne.

---

## 3. Force absolue vs force relative

| Variable | Rôle | Statut |
|---|---|---|
| `imtp_n` / `slimtp_n` / `iso_belt_squat_n` / `sl_iso_push_n` | 🔴 Diagnostique | 🟢 SOURCE EXPLICITE |
| `imtp_nkg` / `slimtp_nkg` / `iso_belt_squat_nkg` / `sl_iso_push_nkg` | 🟠 Confirmative | 🟢 SOURCE EXPLICITE |

**Deux preuves indépendantes, ou non ?** 🟢 **Non, ce ne sont pas deux preuves indépendantes** —
`_n` et `_nkg` sont la **même mesure** (force isométrique de pic) exprimée deux fois (valeur absolue
et relative au poids de corps), pas deux mécanismes distincts. La preuve directe est structurelle,
pas déduite : `CLI011` ("Améliorer la force relative") ne se déclenche que lorsque **le diagnostic
global (`_n`) est normal mais la relative (`_nkg`) est diminuée** — si `_nkg` ajoutait une preuve
diagnostique indépendante, elle contribuerait au comptage `≥2/4` de `CLI010` ; ce n'est pas le cas,
elle a sa **propre** orientation distincte (`CLI011`), séparée du comptage diagnostique. Aucune règle
de convergence n'est inventée ici — c'est la structure même des deux orientations (`CLI010` vs
`CLI011`) qui l'établit.

**Rôle de `_nkg`** : uniquement confirmatif du diagnostic global, **et** déclencheur d'une orientation
distincte (`CLI011`) quand elle diverge du diagnostic global — jamais un critère diagnostique
supplémentaire en tant que tel.

---

## 4. RFD / TTPF dans Force

| KPI | Rôle dans Force | Test source | Rôle dans Puissance | Rôle dans Explosivité | Statut |
|---|---|---|---|---|---|
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | 🟡 Explicative physiologique ("cinétique de production de force") | IMTP | Explicative physiologique (même variable, rôle identique) | Explicative physiologique | 🟢 appartenance / 🟠 statut de mécanisme distinct |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | 🟡 Explicative | SLIMTP | idem | idem | 🟢 / 🟠 |
| `iso_belt_squat_rfd100`, `_rfd200`, `_ttpf` | 🟡 Explicative | Iso Belt Squat | ⚪ non utilisée | Explicative | 🟢 / 🟠 |
| `sl_iso_push_rfd100`, `_rfd200`, `_ttpf` | 🟡 Explicative | SL Iso Push | ⚪ non utilisée | Explicative | 🟢 / 🟠 |
| `knee_ext_rfd50`-`200`/`ttpf` (et les 10 autres tests segmentaires, même structure) | 🟡 Explicative segmentaire | 11 tests segmentaires | ⚪ non utilisée (Puissance n'a pas de RFD segmental) | Explicative (Réactivité/Explosivité, hors périmètre) | 🟢 / 🟠 |
| `sh_iso_9020`/`9090`/`3030`/`6060` `_rfd100`/`_rfd200`/`_ttpf` (pas de `rfd50`/`rfd150` pour l'épaule) | 🟡 Explicative segmentaire (épaule) | 4 tests d'épaule | ⚪ non utilisée | ⚪ non utilisée | 🟢 |

**Aucun RFD/TTPF n'est diagnostique ni confirmatif pour Force** — vérifié contre la liste exhaustive
des "Critères diagnostiques"/"Critères confirmatifs" de la fiche source (§76-80), qui ne contiennent
que des `_n`/`_nkg`. 🟢 SOURCE EXPLICITE (absence constatée).

**Point de vigilance directement demandé, confirmé par les faits** : `imtp_rfd100` est explicative
pour Force **et** pour Puissance **et** pour Explosivité simultanément — son rôle explicatif dans une
qualité n'implique rien sur son rôle dans une autre, et elle n'est diagnostique **nulle part** dans
les 3 qualités vérifiées.

---

## 5. Force segmentaire

**12 groupes, tous confirmés** — la liste de la mission (quadriceps, ischio-jambiers, hip
flexion/extension/abduction/adduction, dorsiflexion/inversion/éversion, soléaire, gastrocnémien,
épaule) correspond exactement à `CLI200`-`CLI211`. 🟢 SOURCE EXPLICITE, aucun ajout ni omission.

| Segment | Test Kinexus | KPI confirmatif | KPI explicatif | `CLI` | Condition d'activation |
|---|---|---|---|---|---|
| Quadriceps | `knee_ext` | `knee_ext_n`/`nkg` | `knee_ext_rfd50`-`200`/`ttpf` | `CLI200` | Global déficitaire **ET** local confirmé |
| Ischio-jambiers | `knee_flex` | `knee_flex_n`/`nkg` | `knee_flex_rfd50`-`200`/`ttpf` | `CLI203` | idem |
| Soléaire | `soleus_iso` | `soleus_iso_n`/`nkg` | `soleus_iso_rfd50`-`200`/`ttpf` | `CLI201` | idem |
| Gastrocnémien | `gastro_iso` | `gastro_iso_n`/`nkg` | `gastro_iso_rfd50`-`200`/`ttpf` | `CLI202` | idem |
| Fléchisseurs de hanche | `hip_flex` | `hip_flex_n`/`nkg` | `hip_flex_rfd50`-`200`/`ttpf` | `CLI207` | idem |
| Extenseurs de hanche | `hip_ext` | `hip_ext_n`/`nkg` | `hip_ext_rfd50`-`200`/`ttpf` | `CLI204` | idem |
| Abducteurs de hanche | `hip_abd` | `hip_abd_n`/`nkg` | `hip_abd_rfd50`-`200`/`ttpf` | `CLI205` | idem |
| Adducteurs de hanche | `hip_add` | `hip_add_n`/`nkg` | `hip_add_rfd50`-`200`/`ttpf` | `CLI206` | idem |
| Dorsiflexeurs | `df_iso` | `df_iso_n`/`nkg` | `df_iso_rfd50`-`200`/`ttpf` | `CLI208` | idem |
| Inverseurs | `inv_iso` | `inv_iso_n`/`nkg` | `inv_iso_rfd50`-`200`/`ttpf` | `CLI209` | idem |
| Éverseurs | `ev_iso` | `ev_iso_n`/`nkg` | `ev_iso_rfd50`-`200`/`ttpf` | `CLI210` | idem |
| Épaule | `sh_iso_9020`/`9090`/`3030`/`6060` | `_n`/`nkg` des 4 variantes | `_rfd100`/`_rfd200`/`ttpf` des 4 variantes | `CLI211` | idem — identifiée uniquement via `CLI211`, absente de la fiche de qualité elle-même (🔧 rapprochement de nommage documenté, `HYP_ARCHITECTURE_PHASE_C.md` ligne 47-54) |

**Ce qui est diagnostique globalement** : rien dans ce tableau — les 12 lignes sont toutes
confirmatives/explicatives **locales**, jamais diagnostiques de `HYP-FOR-01` lui-même (§1, §6).

**Orientations composites au-dessus du tableau** :
- `CLI212` — "Améliorer la force unilatérale globale" : ≥2 tests **unilatéraux globaux**
  déficitaires (`slimtp_n`, `sl_iso_push_n`).
- `CLI213` — "Réduire un déficit local multiple" : ≥3 groupes musculaires segmentaires déficitaires
  **simultanément**.

Ces deux orientations ne remplacent jamais les `CLI200`-`211` individuelles — elles s'ajoutent quand
leur propre condition est remplie. 🟢 SOURCE EXPLICITE, aucune hiérarchie inventée entre segments.

---

## 6. Règle global → segmentaire (formalisée, déjà documentée)

**Condition exacte, citée telle quelle** (`HYP_ARCHITECTURE_PHASE_C.md`, ligne 142) :
*"au moins une variable diagnostique globale déficitaire ET déficit local [du segment] confirmé"*.

🟢 SOURCE EXPLICITE — un déficit segmentaire seul, sans déficit global, ne déclenche **aucune**
orientation `CLI2xx`.

### CAS A — Force globale normale, Quadriceps déficitaire
Condition `CLI200` : volet global **non rempli** (aucune des 4 diagnostiques déficitaire). → **Aucune
orientation `CLI200` ne se déclenche.** `HYP-FOR-01` reste à l'état Absente (ou Suspectée si une
seule diagnostique globale, hors quadriceps, était isolément déficitaire — non précisé ici). Le
déficit de quadriceps reste une observation locale isolée, sans traduction clinique au niveau Force
tant que le volet global n'est pas rempli. 🟢, application directe et littérale de la condition.

### CAS B — Force globale déficitaire, Quadriceps déficitaire
Les deux volets de `CLI200` sont remplis. → `HYP-FOR-01` Retenue (≥2/4 global) **et** `CLI200`
déclenchée conjointement. 🟢.

### CAS C — Force globale déficitaire, Quadriceps normal, Ischio-jambiers déficitaire
Volet global rempli (via d'autres tests que le quadriceps, qui reste normal). `CLI200` (quadriceps)
**ne se déclenche pas** (local non confirmé) ; `CLI203` (ischio-jambiers) **se déclenche** (local
confirmé). Chaque segment est évalué **indépendamment** des autres — aucun segment ne bloque ni ne
conditionne l'évaluation d'un autre. 🟢.

### CAS D — Force globale déficitaire, plusieurs groupes segmentaires déficitaires
Chaque `CLI2xx` concerné se déclenche indépendamment (comme en CAS C, généralisé). **Si ≥3 groupes
sont déficitaires simultanément**, `CLI213` ("réduire un déficit local multiple") s'ajoute
**au-dessus** des orientations individuelles — pas à leur place. Présentation : toutes les
orientations segmentaires concernées, plus `CLI213` si le seuil de 3 est atteint. 🟢, aucune
hiérarchie entre muscles inventée — le seuil "3" est le seul chiffre présent dans la source, retenu
tel quel, pas construit par ce document.

---

## 7. Matrice Absolu / Relatif / Segmentaire

| Type de preuve | Exemple | Diagnostique global | Explicatif | Niveau segmentaire |
|---|---|---|---|---|
| Force absolue globale | `imtp_n` | ✅ Oui | — | Non (test global) |
| Force relative globale | `imtp_nkg` | ❌ Non (confirmative + orientation propre `CLI011`) | — | Non |
| RFD/TTPF globale | `imtp_rfd100` | ❌ Non | ✅ Oui (physiologique, "cinétique") | Non |
| Force absolue segmentaire | `knee_ext_n` | ❌ Non | ✅ Oui (confirmative du lien `CLI200`) | ✅ Oui |
| Force relative segmentaire | `knee_ext_nkg` | ❌ Non | ✅ Oui | ✅ Oui |
| RFD/TTPF segmentaire | `knee_ext_rfd100` | ❌ Non | ✅ Oui (explicative du lien `CLI200`) | ✅ Oui |
| Force segmentaire épaule | `sh_iso_9020_n` | ❌ Non | ✅ Oui | ✅ Oui (`CLI211`) |
| Biomécanique run-specific | `rs_hip_push_n` | ❌ Non | ✅ Oui (biomécanique, pas physiologique) | Non (catégorie séparée, absente de `CLI200`-`211`) |

**Séparation Force globale / relative / segmentaire, résumée** : la Force **globale** se diagnostique
sur 4 tests précis (absolue = diagnostic, relative = confirmative/orientation propre) ; la Force
**segmentaire** ne diagnostique jamais rien elle-même — elle confirme/explique **où** un déficit déjà
diagnostiqué globalement pourrait se situer, jamais **si** un déficit existe.

---

## 8. Variables CMJ / SLCMJ — vérification explicite

**Aucune des variables citées en exemple par la mission (`cmj_mean_force`, `cmj_peak_force`,
impulsions, RFD, puissance, vitesse) n'apparaît nulle part dans la fiche `HYP-FOR-01`.** 🟢 SOURCE
EXPLICITE — la fiche source contient une section dédiée, **"Variables exclues"**, qui le confirme
littéralement (`HYP_ARCHITECTURE_PHASE_C.md` ligne 155) : *"Toutes les variables de CMJ, SLCMJ, DJ,
SLDJ, CMJR (puissance)"* sont explicitement exclues de Force.

| Variable (exemples cités) | Force = diagnostique ? | Force = confirmative ? | Force = explicative ? | Force = aucune fonction ? |
|---|---|---|---|---|
| `cmj_conc_mean_force` | Non | Non | Non | ✅ Aucune (utilisée par Puissance, §4 de `CARTOGRAPHIE_CMJ_SLCMJ_PUISSANCE.md`) |
| `cmj_conc_peak_force` | Non | Non | Non | ✅ Aucune (utilisée par Explosivité/Absorption) |
| `cmj_peak_power`/`slcmj_peak_power` | Non | Non | Non | ✅ Aucune (diagnostique de Puissance) |
| `cmj_conc_rfd`, `cmj_conc_impulse_100` | Non | Non | Non | ✅ Aucune (Puissance/Explosivité) |
| Toute variable CMJ/SLCMJ, sans exception | Non | Non | Non | ✅ Aucune |

**Confirmation de l'objectif de cette section** : la distinction "force produite pendant un CMJ" ≠
"capacité de force maximale" n'est pas seulement conceptuelle ici — elle est **structurellement
imposée** par Vierge_7 elle-même via l'exclusion explicite, pas une interprétation de ce document.

---

## 9. Tests de Puissance / Réactivité / Absorption — vérification de non-contamination

| Test | Contamine Force ? | Statut |
|---|---|---|
| CMJ (toutes variables) | Non | 🟢 SOURCE EXPLICITE — "Variables exclues" |
| SLCMJ (toutes variables) | Non | 🟢 idem |
| DJ (toutes variables) | Non | 🟢 idem, cité nommément |
| SLDJ (toutes variables) | Non | 🟢 idem |
| CMJR (toutes variables) | Non | 🟢 idem |
| Single Hop / Triple Hop / Crossover Hop | Non | 🟢 — absentes de l'inventaire "Variables contributrices" (ligne 148-152), qui liste exhaustivement les 19 tests réellement utilisés par Force ; leur absence de cette liste positive vaut confirmation, la mention explicite "toutes les variables de CMJ/SLCMJ/DJ/SLDJ/CMJR" ne les nomme pas individuellement mais aucun hop test n'apparaît nulle part dans la fiche |
| Landing (uni/bi), SLLT (Absorption) | Non | 🟢 SOURCE EXPLICITE, cité nommément dans "Variables exclues" |
| SLS/EO/EF/Strobo (Stabilisation) | Non | 🟢 idem |
| WBLT (Mobilité) | Non | 🟢 idem |

**Conclusion** : l'univers variable de `HYP-FOR-01` est **entièrement composé de tests
isométriques** (4 globaux + 11 segmentaires + 4 épaule + 3 run-specific = 19 tests, 22 tests si l'on
compte les 4 variantes `sh_iso_*` séparément) — **aucun test dynamique/de saut n'y contribue, sous
aucun rôle**, contrairement à Puissance qui repose exclusivement sur CMJ/SLCMJ pour son diagnostic.
C'est la différence structurelle la plus nette entre les deux qualités.

---

## Rappel — rien n'est modifié

Cartographie uniquement. `index.html`, `computeMoteur()`, `TFM`, `qualityScores`, les écrans, et
tout branchement HYP existant ou futur restent inchangés par ce document.

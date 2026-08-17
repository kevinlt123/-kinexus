# Comparaison transversale Force vs Puissance — validation de l'étanchéité

**Statut** : vérification croisée uniquement. Aucun code modifié, aucune règle HYP changée, aucun
seuil créé, aucune harmonisation artificielle entre les deux qualités.

**Sources** : `CARTOGRAPHIE_FORCE_HYP_FOR01.md`, `CARTOGRAPHIE_CMJ_SLCMJ_PUISSANCE.md`,
`CARTOGRAPHIE_VARIABLES_HYP.md`, `HYP_ARCHITECTURE_PHASE_C.md`, `PHASE_D_LOGICAL_VALIDATION.md`,
`KINEXUS_REASONING_ENGINE_V1.md`, `index.html` (vérification directe de `cmj_peak_power`).

**Légende** : 🔴 Diagnostique · 🟠 Confirmative · 🟡 Explicative · SOURCE EXPLICITE / INFERENCE /
NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES.

---

## Réponse directe à la question posée

> Quand Kinexus dit qu'un athlète a un déficit de FORCE, la preuve vient exclusivement de 4 tests
> isométriques globaux (≥2/4). Quand il dit un déficit de PUISSANCE, la preuve vient exclusivement
> de 2 tests de saut (2/2, les deux requis). **Ces deux ensembles de preuves ne se recoupent
> jamais** — aucune variable n'est diagnostique dans les deux qualités à la fois. Ce qui *peut* se
> recouper, ce sont des variables qui **expliquent** l'une ou l'autre — et ce document identifie
> précisément lesquelles, pour qu'aucune ne soit jamais confondue avec une preuve diagnostique.

---

## 1. Comparaison des preuves diagnostiques

| Qualité | Tests diagnostiques | Variables diagnostiques | Convergence | Variables explicitement exclues |
|---|---|---|---|---|
| **FORCE** | IMTP, SLIMTP, Iso Belt Squat, SL Iso Push | `imtp_n`, `slimtp_n`, `iso_belt_squat_n`, `sl_iso_push_n` | **≥2/4** (`CLI010`) | 🟢 SOURCE EXPLICITE — section "Variables exclues" de la fiche : toutes les variables CMJ/SLCMJ/DJ/SLDJ/CMJR, WBLT, SLS/EO/EF/Strobo, Landing/SLLT |
| **PUISSANCE** | CMJ, SLCMJ (DJ/SLDJ/CMJR uniquement en suppléance secondaire, jamais en renfort) | `cmj_peak_power`, `slcmj_peak_power` | **2/2** (les deux requis — condition la **plus stricte** du corpus V1, `CLI040`) | 🟠 pas de section "Variables exclues" dédiée dans la fiche Puissance — mais aucune variable isométrique (IMTP/SLIMTP/segmentaire/etc.) n'a de rôle diagnostique, seulement explicatif (§3) |

**Différence de rigueur de convergence, à ne pas aplatir** : Force accepte un déficit sur 2 tests
parmi 4 (50%) ; Puissance exige les 2 tests disponibles sur 2 (100%). Aucune tentative
d'harmonisation n'est faite ici — les deux règles restent telles quelles.

---

## 2. Tests qui ne doivent pas contaminer Force

*Reprise de `CARTOGRAPHIE_FORCE_HYP_FOR01.md` §8-9, consolidée ici.*

| Test | Exclu ? | Pourquoi | Statut |
|---|---|---|---|
| CMJ, SLCMJ | Oui | Cité nommément dans "Variables exclues" | 🟢 SOURCE EXPLICITE |
| DJ, SLDJ, CMJR | Oui | idem | 🟢 SOURCE EXPLICITE |
| Hop tests (single/triple/crossover) | Oui | Absents de l'inventaire "Variables contributrices" (liste positive exhaustive de 19 tests) | 🟢 SOURCE EXPLICITE (par absence de la liste positive) |
| Landing (uni/bi), SLLT | Oui | Cité nommément | 🟢 SOURCE EXPLICITE |
| WBLT | Oui | Cité nommément | 🟢 SOURCE EXPLICITE |
| SLS/EO/EF/Strobo | Oui | Cité nommément | 🟢 SOURCE EXPLICITE |

---

## 3. Tests qui ne doivent pas contaminer Puissance (le miroir)

**Distinction centrale de cette section, respectée strictement** : "peut expliquer Puissance" ≠
"peut diagnostiquer Puissance".

| Test/variable | Peut expliquer Puissance ? | Peut diagnostiquer Puissance ? | Statut |
|---|---|---|---|
| `imtp_n`/`nkg`/`rfd*`/`ttpf` | ✅ Oui — 🟡 explicative physiologique | ❌ **Jamais** | 🟢 SOURCE EXPLICITE pour les deux réponses |
| `slimtp_n`/`nkg`/`rfd*`/`ttpf` | ✅ Oui | ❌ Jamais | 🟢 |
| `iso_belt_squat_n`/`nkg` | ✅ Oui — 🟡 explicative | ❌ Jamais | 🟢 — **alors même que ces variables sont diagnostiques pour Force** (§5, cas le plus important de ce document) |
| `sl_iso_push_n`/`nkg` | ✅ Oui | ❌ Jamais | 🟢 — même remarque |
| `iso_squat_hold_n`/`nkg` | ✅ Oui | ❌ Jamais | 🟢 — **variable non utilisée par Force du tout** (absente de son inventaire, §5) |
| 8 tests segmentaires partagés (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`) | ✅ Oui (`n`/`nkg` uniquement, pas de RFD/TTPF pour Puissance) | ❌ Jamais | 🟢 |
| `df_iso`, `inv_iso`, `ev_iso` (segmentaires chevi̇lle) | ❌ **Non — absentes de la liste explicative de Puissance** | ❌ Jamais | 🟢 SOURCE EXPLICITE (absence constatée) — utilisées par Force uniquement |
| `sh_iso_*` (épaule) | ❌ Non | ❌ Jamais | 🟢 — Force uniquement |
| `rs_hip_push`/`rs_knee_push`/`rs_ankle_push` | ❌ Non | ❌ Jamais | 🟢 — Force uniquement |
| `profil_fv_nkg`/`v0` | ✅ Oui | ❌ Jamais | 🟢 — n'appartient à aucune liste Force |

La règle générale déjà validée (`KINEXUS_REASONING_ENGINE_V1.md` §3 : l'explicative *"jamais seule"*
ne génère ni ne fait franchir le seuil) s'applique ici sans exception — aucune des variables
ci-dessus ne peut, quelle que soit son ampleur, diagnostiquer `HYP-PUI-01` à la place de
`cmj_peak_power`/`slcmj_peak_power`.

---

## 4. Cas cliniques croisés

### CAS 1 — Force globale ↓, Puissance normale
Force : ≥2/4 déficitaires → Retenue. Puissance : `cmj_peak_power`/`slcmj_peak_power` normaux →
Absente. **Preuves totalement indépendantes** — aucune variable diagnostique de Force n'est
diagnostique de Puissance. 🟢.

### CAS 2 — Force globale normale, Puissance ↓
Symétrique : `cmj_peak_power`/`slcmj_peak_power` déficitaires (2/2) → Puissance Retenue ; les 4
tests de Force normaux (ou <2/4 déficitaires) → Force reste Absente. 🟢.

### CAS 3 — Force globale ↓, Puissance ↓
**Les deux diagnostics peuvent coexister** — déjà validé explicitement en Phase D (*"Cas D... les
deux hypothèses peuvent s'activer indépendamment sans contamination croisée"*,
`PHASE_D_LOGICAL_VALIDATION.md`). **Preuves indépendantes, confirmé** : aucune variable diagnostique
commune. Un lien narratif est possible côté Puissance (sa couche explicative peut citer Force comme
mécanisme, §6) — mais ce lien n'est jamais une dépendance diagnostique, seulement explicative. 🟢.

### CAS 4 — IMTP↓, CMJ biomécaniquement anormal, `cmj_peak_power` normal, `slcmj_peak_power` normal
**Force** : `imtp_n` seul déficitaire = 1/4 → condition `≥2/4` non remplie → Force reste **Suspectée**,
pas Retenue (statut des 3 autres tests non précisé dans le cas ; si tous normaux, Force reste
Suspectée sur ce seul signal).
**Puissance** : diagnostic non rempli (`cmj_peak_power`/`slcmj_peak_power` normaux) → **Absente**.
**Stratégie** : sans objet — la question Capacité/Stratégie ne se pose que si `HYP-PUI-01` est
Retenue (`HYP_PUI01_REGLE_FINALE_GELEE.md`), ce qui n'est pas le cas ici. L'anomalie biomécanique CMJ
reste une observation isolée, sans conclusion de qualité rattachée. 🟢, aucune contamination.

### CAS 5 — IMTP normal, SLIMTP normal, `cmj_peak_power`↓, `slcmj_peak_power`↓
**Puissance** : 2/2 → Retenue.
**Force** : IMTP et SLIMTP normaux (2 tests sur 4) — **statut d'Iso Belt Squat et SL Iso Push non
précisé par le cas** → 🔴 **NON DÉTERMINABLE avec les seules données de ce cas** : si ces deux
derniers tests sont également normaux, Force reste Absente ; s'ils sont déficitaires, Force pourrait
être Retenue indépendamment. Ne pas conclure au-delà de ce qui est donné.
**Capacité (Puissance)** : IMTP/SLIMTP étant normaux, ils ne contribuent aucun signal de déficit à
la branche Capacité de Puissance — si aucune autre variable physiologique de Puissance n'est
renseignée déficitaire, ce cas relève du "signal isolé" déjà documenté (aucun mécanisme identifié),
pas d'une conclusion Force ou Stratégie forcée.

### CAS 6 — Force globale ↓, Quadriceps segmentaire ↓, `cmj_peak_power`↓, `slcmj_peak_power`↓
**Force** : Retenue (condition globale supposée remplie) ; `knee_ext_n`/`nkg` déficitaire confirme le
volet local de `CLI200` (condition globale + locale réunies, `CARTOGRAPHIE_FORCE_HYP_FOR01.md` §6) →
`CLI200` déclenchée.
**Puissance** : Retenue indépendamment (2/2).
**Point clé, à ne pas manquer** : `knee_ext_n`/`nkg` est **également** une variable explicative de
Puissance (§5) — elle joue donc **deux rôles simultanés et légitimes**, dans deux hypothèses
distinctes : (1) confirme l'origine segmentaire du déficit de Force (`CLI200`), et (2) contribue,
séparément, au signal de la branche Capacité de Puissance (1 famille physiologique déficitaire —
"signal faible", insuffisant seul pour "retenue" selon la règle gelée, `HYP_PUI01_REGLE_FINALE_GELEE.md`).
**Conclusions légitimes** : `HYP-FOR-01` Retenue + `CLI200` (quadriceps) ; `HYP-PUI-01` Retenue,
Capacité — signal faible (via la même variable, dans son rôle explicatif propre à Puissance). Aucune
duplication diagnostique — chaque rôle reste dans sa catégorie (confirmative locale pour Force,
explicative pour Puissance).

### CAS 7 — Force globale normale, Quadriceps segmentaire ↓, CMJ/SLCMJ anormaux (biomécanique)
**La faiblesse segmentaire peut-elle faire baisser Force ?** **Non** — condition globale non remplie
(`HYP_ARCHITECTURE_PHASE_C.md`, condition `CLI200` : *"global déficitaire ET local confirmé"*) → un
déficit segmentaire seul ne crée ni ne fait progresser aucune conclusion Force. Déjà établi (CAS A,
`CARTOGRAPHIE_FORCE_HYP_FOR01.md` §6), reconfirmé ici. 🟢.
**Peut-elle faire baisser Puissance ?** **Non plus, directement** — `cmj_peak_power`/`slcmj_peak_power`
ne sont pas dits déficitaires dans ce cas (seule une anomalie **biomécanique**, pas de puissance de
pic, est mentionnée) → `HYP-PUI-01` n'est même pas diagnostiquée (Absente). Sans diagnostic
Puissance, aucune couche explicative — Capacité ou Stratégie — ne s'active. Le déficit segmentaire de
quadriceps et l'anomalie biomécanique CMJ restent, tous deux, des observations locales isolées,
**sans effet sur le score d'aucune des deux qualités**. 🟢 — démonstration directe de l'étanchéité
recherchée par cette mission.

---

## 5. Variables à double rôle

| Variable | Force | Puissance | Rôle dans chaque qualité |
|---|---|---|---|
| `imtp_n` | 🔴 Diagnostique | 🟡 Explicative | Force : un des 4 tests globaux. Puissance : capacité (Branche Capacité). |
| `slimtp_n` | 🔴 Diagnostique | 🟡 Explicative | idem, unilatéral |
| `imtp_nkg` | 🟠 Confirmative | 🟡 Explicative | Force : confirme le global + oriente `CLI011` si divergent. Puissance : capacité. |
| `slimtp_nkg` | 🟠 Confirmative | 🟡 Explicative | idem |
| **`iso_belt_squat_n`** | 🔴 **Diagnostique** | 🟡 **Explicative** | **Cas le plus critique du document** — un des 4 tests diagnostiques de Force, et simultanément une variable explicative de Puissance |
| **`sl_iso_push_n`** | 🔴 **Diagnostique** | 🟡 **Explicative** | idem — même criticité |
| `iso_belt_squat_nkg`, `sl_iso_push_nkg` | 🟠 Confirmative | 🟡 Explicative | idem, versions relatives |
| `imtp_rfd100`/`rfd200`/`ttpf`, `slimtp_*` | 🟡 Explicative | 🟡 Explicative | Même catégorie dans les deux qualités — pas de conflit de rôle, mais partagées |
| `knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add` (`n`/`nkg`, 8 tests) | 🟡 Explicative segmentaire | 🟡 Explicative | Partagées, même catégorie dans les deux — Force ajoute en plus le RFD/TTPF de ces tests (non partagé, §3) |
| `df_iso`, `inv_iso`, `ev_iso` (`n`/`nkg`/`rfd*`/`ttpf`) | 🟡 Explicative segmentaire | ⚪ Non utilisée | Force uniquement |
| `iso_squat_hold_n`/`nkg` | ⚪ **Non utilisée par Force** | 🟡 Explicative | Puissance uniquement — absente de l'inventaire Force |
| `sh_iso_*`, `rs_hip_push`/`rs_knee_push`/`rs_ankle_push` | 🟡 Explicative | ⚪ Non utilisée | Force uniquement |
| `cmj_peak_power`, `slcmj_peak_power` | ⚪ Explicitement exclue | 🔴 Diagnostique | Puissance uniquement |
| 29 KPI CMJ/SLCMJ de stratégie | ⚪ Explicitement exclue | 🟡 Explicative | Puissance uniquement |

**Constat central de cette section** : 4 variables (`iso_belt_squat_n`/`nkg`, `sl_iso_push_n`/`nkg`)
sont **diagnostiques ou confirmatives pour Force** et **explicatives pour Puissance** — le cas le
plus sensible identifié. La hiérarchie déjà validée (diagnostique/confirmative pour Force,
explicative "jamais seule" pour Puissance) empêche structurellement toute contamination : ces
variables ne peuvent **jamais** faire à elles seules progresser `HYP-PUI-01` au-delà de l'état
Absente, quel que soit leur poids dans Force. 🟢 SOURCE EXPLICITE pour l'existence du double rôle ;
🟢 pour l'absence de contamination (garantie par la hiérarchie déjà gelée, non rouverte ici).

**Découverte complémentaire, à signaler** : la "force segmentaire" de Force (11 tests :
`knee_ext`...`ev_iso`) et la "force segmentaire" citée dans la fiche Puissance (*"mêmes que
Force"*) **ne sont pas exactement le même ensemble de 11 tests**. Force inclut `df_iso`/`inv_iso`/
`ev_iso` (cheville) mais pas `iso_belt_squat`/`sl_iso_push`/`iso_squat_hold` (ce sont, pour Force, des
tests globaux ou non-utilisés) ; Puissance inclut `iso_belt_squat`/`sl_iso_push`/`iso_squat_hold` mais
pas `df_iso`/`inv_iso`/`ev_iso`. Seuls **8 tests** sont réellement partagés à l'identique
(quadriceps, ischio-jambiers, soléaire, gastrocnémien, 4 mouvements de hanche). 🟢 SOURCE EXPLICITE,
vérifié par comparaison directe des deux listes — la formule *"mêmes que Force"* de la fiche Phase C
de Puissance est **imprécise** au sens strict ; signalé ici plutôt que silencieusement reproduit.

---

## 6. Force segmentaire → explique-t-elle Puissance ?

**A — Explicitement documenté** : les 8 tests segmentaires partagés (§5) sont **littéralement**
listés comme explicatifs de Puissance dans `HYP_ARCHITECTURE_PHASE_C.md` — un déficit segmentaire
sur l'un d'eux **peut légitimement contribuer** à la couche explicative de `HYP-PUI-01` (Branche
Capacité), au même titre que n'importe quelle autre variable physiologique. 🟢.

**B — Plausible/inféré, non démontré** : qu'un déficit segmentaire **isolé** (une seule famille)
suffise à expliquer **fortement** un déficit de Puissance — la règle de convergence déjà gelée
(`Q2 = C`, ≥2 familles distinctes) s'y oppose : un seul segment déficitaire ne produit qu'un signal
faible, jamais une Capacité "retenue" à lui seul. 🟠 INFERENCE (application directe d'une règle déjà
validée, pas une nouvelle déduction).

**C — Non démontrable avec les sources actuelles** : si le fait que `HYP-FOR-01` **elle-même** soit
Retenue (au niveau qualité entière, pas variable par variable) ajoute une explication supplémentaire
à Puissance, au-delà du simple partage des 8 variables individuelles. `CLI040` cite "Force" comme
qualité explicative possible (niveau d'abstraction qualité-à-qualité), mais — exactement comme déjà
signalé pour Explosivité (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §3.E) — **aucun mécanisme n'opérationnalise
cette citation** au niveau variable. 🔴 NON DÉTERMINABLE — ne pas inventer de règle de propagation
qualité-à-qualité ici.

---

## 7. Absolu vs Relatif

| Dimension | Force | Puissance |
|---|---|---|
| Variable "absolue" | `imtp_n` etc. — Newtons (N), **variable distincte** de la version relative | `cmj_peak_power` — **déjà exprimée en W/kg** (`valdName` VALD : *"Peak Power / BM"*, vérifié directement dans `index.html` `CMJ_VAR_META`) |
| Variable "relative" | `imtp_nkg` etc. — N/kg, **KPI séparé, stocké indépendamment** | Aucune variable "puissance absolue" distincte (en W, non rapportée au poids) n'existe dans `TESTS`/`CMJ_VAR_META` — vérifié, aucune trouvée |
| Rôle diagnostique de l'absolu | 🔴 Diagnostique | 🔴 Diagnostique (mais déjà en valeur relative) |
| Rôle de la version relative | 🟠 Confirmative + orientation propre (`CLI011`) | Non applicable structurellement — il n'existe pas de second KPI à comparer |

**🔴 Point structurel important, non symétrique entre les deux qualités** : contrairement à ce que la
paire `CLI040`/`CLI041` (Puissance) pourrait laisser supposer par analogie avec `CLI010`/`CLI011`
(Force), **Puissance ne dispose pas de deux variables stockées séparément** (une absolue en W, une
relative en W/kg) permettant une comparaison directe équivalente à `imtp_n` vs `imtp_nkg`. La seule
variable diagnostique de Puissance (`cmj_peak_power`) est **déjà** une mesure relative au poids de
corps. **La mécanique exacte permettant de distinguer "Puissance absolue" (`CLI040`) de "Puissance
relative" (`CLI041`) reste, avec les seules données actuellement stockées par Kinexus, NON
DÉTERMINABLE** — ce n'est pas seulement le seuil numérique de `CLI041` qui manque (déjà signalé
ailleurs), c'est la variable elle-même qui semble absente de l'inventaire vérifié. Signalé
explicitement plutôt que supposé résolu par analogie avec Force.

---

## 8. Règle d'étanchéité proposée

> *"Une variable ne peut faire progresser une qualité que si son rôle dans cette qualité est
> explicitement défini comme diagnostique. Les variables explicatives expliquent, elles ne
> diagnostiquent pas. Les variables confirmatives renforcent, elles ne créent pas seules le
> diagnostic. Les variables d'une autre qualité ne contaminent pas le score."*

**Vérification de compatibilité avec les documents HYP existants** : 🟢 **déjà entièrement
compatible, sans modification nécessaire.** Cette règle est une reformulation exacte de la hiérarchie
déjà gelée dans `KINEXUS_REASONING_ENGINE_V1.md` §3 (*"le niveau diagnostique a toujours l'autorité
sur l'existence de l'état... confirmative et explicative ne peuvent jamais générer ni faire
seuil"*). Les cas §4 et le tableau §5 démontrent, variable par variable, que cette règle produit déjà
les résultats attendus sans aucune exception trouvée dans le périmètre Force/Puissance. Aucune
nouvelle règle n'est créée par cette formulation — elle consolide ce qui existe déjà.

---

## 9. Matrice finale

| Variable/Test | FORCE diagnostic | FORCE explicatif | PUISSANCE diagnostic | PUISSANCE explicatif | Autre |
|---|---|---|---|---|---|
| `imtp_n`/`nkg` | ✅ (`n`) / — (`nkg` confirmative) | — | — | ✅ | — |
| `slimtp_n`/`nkg` | ✅ / — | — | — | ✅ | — |
| `iso_belt_squat_n`/`nkg` | ✅ / — | — | — | ✅ | — |
| `sl_iso_push_n`/`nkg` | ✅ / — | — | — | ✅ | — |
| `iso_squat_hold_n`/`nkg` | — | — | — | ✅ | — |
| `imtp_rfd*`/`ttpf`, `slimtp_rfd*`/`ttpf` | — | ✅ | — | ✅ | Explicative Explosivité aussi |
| 8 tests segmentaires partagés (`n`/`nkg`) | — | ✅ | — | ✅ | — |
| RFD/TTPF des 8 tests partagés | — | ✅ | — | ⚪ (Puissance n'utilise pas leur RFD) | — |
| `df_iso`/`inv_iso`/`ev_iso` | — | ✅ | — | ⚪ | — |
| `sh_iso_*` | — | ✅ | — | ⚪ | — |
| `rs_hip_push`/`rs_knee_push`/`rs_ankle_push` | — | ✅ | — | ⚪ | — |
| `profil_fv_nkg`/`v0` | — | ⚪ | — | ✅ | — |
| `cmj_peak_power`/`slcmj_peak_power` | ⚪ **exclue** | — | ✅ | — | — |
| 29 KPI stratégie CMJ/SLCMJ | ⚪ **exclue** | — | — | ✅ | — |
| `cmj_height`, `single_hop_distance`, `triple_hop_distance` | ⚪ | — | — | 🟠 confirmative | Réactivité aussi (hop tests) |

---

## 10. Conclusion praticien

**Comment Kinexus doit-il raisonner quand un patient présente à la fois un déficit de Force et/ou de
Puissance ?**

Force et Puissance se diagnostiquent chacune sur leurs propres tests, sans jamais se contaminer :
Force regarde uniquement quatre poussées isométriques maximales (au moins deux doivent être
faibles) ; Puissance regarde uniquement deux sauts verticaux (les deux doivent être faibles ensemble
— une exigence plus stricte). Un patient peut avoir l'un des deux déficits, les deux, ou aucun, et
Kinexus les établit chacun indépendamment, sans qu'une faiblesse sur un test de force fasse
automatiquement baisser le score de puissance, ni l'inverse.

Là où les deux qualités se rejoignent, c'est dans l'**explication**. Une même mesure de force
isométrique — par exemple la force du quadriceps, ou même certains des tests globaux de Force
eux-mêmes (Iso Belt Squat, SL Iso Push) — peut servir à la fois à comprendre *pourquoi* la Force
globale est basse (en pointant vers un segment précis) et à comprendre *pourquoi* la Puissance est
basse (en indiquant qu'un manque de capacité physique, plutôt qu'un problème d'exécution du saut, en
est la cause probable). Ce n'est jamais une duplication ni une confusion : la même donnée éclaire
deux questions cliniques différentes, chacune restant décidée par ses propres preuves diagnostiques.

Un point à connaître : un déficit localisé sur un seul muscle, sans déficit global de Force ni sans
que les deux sauts ne soient réellement faibles, ne fait baisser ni l'une ni l'autre qualité — c'est
une observation qui reste en attente, pas une conclusion. Et la distinction "Puissance absolue" vs
"Puissance relative au poids" ne fonctionne pas exactement comme pour la Force : Kinexus ne conserve
aujourd'hui qu'une seule mesure de puissance de pic, déjà exprimée par rapport au poids de corps — un
point qui mériterait d'être clarifié avant de s'appuyer dessus.

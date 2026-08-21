# Audit du réseau relationnel HYP / TFM avant branchement de HYP-CSM-01

## Statut de ce document

Audit **documentaire et de lecture de code uniquement**. Aucune ligne de `index.html` n'a été
modifiée. Aucune relation n'a été ajoutée ni supprimée. `HYP_QUALITY_RELATIONS`, les 8 moteurs HYP
et `computeHypClinicalSynthesis01` (commit `65ffd6b`) sont strictement tels que poussés. Toutes les
affirmations de ce document sont sourcées soit par une lecture directe de `index.html` (référence
`fichier:ligne`), soit par citation explicite d'un document `.md` déjà présent dans le dépôt.

---

## 1. Objectif

Déterminer si le réseau relationnel actuellement exploitable par `computeHypClinicalSynthesis01`
(HYP-CSM-01, commit `65ffd6b`) est suffisamment complet, fiable et non-ambigu pour produire une
synthèse clinique réellement utile, **avant** tout branchement à l'UI ou au PDF. Cartographier,
classer et comparer — pas corriger, pas enrichir, pas décider seul.

---

## 0. ⚠️ Constat préalable — collision d'identifiant `HYP-CSM-01`

Avant toute autre analyse, un fait de gouvernance doit être signalé explicitement, conformément à
`CLAUDE.md` ("toute contradiction avec l'architecture existante doit être signalée, jamais résolue
silencieusement").

**L'identifiant `HYP-CSM-01` était déjà réservé, dans l'historique documentaire du projet, à une
qualité complètement différente : « Contrôle Sensori-Moteur ».**

- `HYP_ARCHITECTURE_FREEZE.md` (point 1, ligne 426) : *"Stabilisation vs Contrôle Sensori-moteur —
  `HYP-CSM-01` **suspendue** en Phase C (non implémentée), conservée documentée dans la fiche 7,
  réactivable dès qu'une preuve distinctive existe."*
- `DECISION_MEMO_CSM.md` (document dédié, 83 lignes) statue explicitement sur le maintien de cette
  suspension, en analysant `CLI090`/`CLI091`/`CLI092` (orientations cliniques propres à Contrôle
  Sensori-Moteur — dépendance visuelle, réponse aux perturbations posturales).
- `AUDIT_TFM_VS_HYP_QUALITES.md` (§4) confirme que la qualité TFM « Contrôle Sensoriel » n'a, à ce
  jour, aucun chemin de calcul actif, précisément parce que `HYP-CSM-01` (Contrôle Sensori-Moteur)
  reste suspendue.

**La mission « HYP-CSM-01 : Moteur de synthèse clinique multi-qualités » de cette session a réutilisé
le même identifiant pour un concept entièrement différent** (Clinical Synthesis / Multi-Quality —
une couche de synthèse au-dessus des 8 moteurs, pas une 9ᵉ qualité diagnostique). Cet engin est
maintenant en production (`index.html`, commit `65ffd6b` : `HYP_CSM_QUALITIES`,
`computeHypClinicalSynthesis01`, etc.), sous le même nom `HYP-CSM-01` que celui gelé pour
« Contrôle Sensori-Moteur ».

**Conséquence concrète** : si le praticien décide un jour de réactiver la qualité suspendue
« Contrôle Sensori-Moteur » (ce que `HYP_ARCHITECTURE_FREEZE.md` prévoit explicitement comme
réversible), elle porterait le même identifiant `HYP-CSM-01` qu'un moteur de synthèse déjà
livré et sans rapport clinique avec elle — collision de nom dans le code (`csmId:'HYP-CSM-01'`),
dans la documentation (deux `IMPLEMENTATION_HYP_CSM01*.md` possibles) et dans toute conversation
future avec le praticien.

**Ceci n'est pas corrigé dans cet audit** (hors périmètre — mission read-only). C'est une décision
d'architecture qui doit être tranchée par le praticien avant toute suite : soit renommer le moteur
de synthèse déjà livré (ex. `HYP-CSM-01` → `HYP-SYNTH-01` ou `KINEXUS-CSM-01`, changement purement
identifiant, sans impact sur la logique), soit acter formellement que « Contrôle Sensori-Moteur »
ne sera jamais réactivé sous ce nom. Voir §17 (recommandation) pour la mise en garde associée à la
décision finale de cet audit.

---

## 2. Sources analysées

**Code** (`index.html`, lecture directe, ligne par ligne pour chaque structure citée) :
`HYP_QUALITY_RELATIONS`/`findHypQualityRelation` (4237-4260), `buildMultiQualityNarrative`
(4262-4309), `VAR_REL3` (4009, 283 variables), `TFM` (750), `deriveRootCauses`/`rootCausesHTML`
(4032-4066), `computeQualityStatus`/`computeCapaciteStatus`/`capaciteHTML` (4068-4122),
`CAPACITES_DATA` (4012), `SYS_COMPENSATIONS` (1184), `STR_QUAL_DETAIL` (1196-1212), `HYPO`/`ORI`
(5950-5951), `priorities` (5952-5971), `CMJ_PHASE_TO_QUALITY` (2208-2220), `computeMoteur()`
return (5983), rendu on-screen (`tab==='fonctions'/'capacites'/'variables'/'hypotheses'/
'raisonnement'`, 8296-8330), rendu PDF (`buildSportifReport`, occurrences `p.hypothese`/
`p.contributeurPrincipal`, 6516-8324), `computeHypClinicalSynthesis01` et ses helpers
(commit `65ffd6b`).

**Documents** : `AUDIT_TRANSVERSAL_HYP_V1.md` (référence principale, déjà très complet sur la
matrice qualité×qualité), `AUDIT_TFM_VS_HYP_QUALITES.md`, `HYP_ARCHITECTURE_FREEZE.md`,
`DECISION_MEMO_CSM.md`, `HYP_VARIABLE_MATRIX.md`, `HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md`,
`IMPLEMENTATION_HYP_V1_NORMALIZATION.md`, `IMPLEMENTATION_HYP_CSM01.md`, `AUDIT_TFM_VS_VIERGE7.md`,
`AUDIT_VAR_REL3_VS_VIERGE7.md` (consultés pour contexte historique, non ré-audités ligne à ligne —
déjà digérés par la construction même des 8 moteurs HYP).

**Suite de tests** : `tests/hypClinicalSynthesis01.test.js` (22 cas déjà vérifiés, réutilisés comme
preuve empirique du comportement réel de CSM aux §8/§9 ci-dessous plutôt que rejoués).

---

## 3. Inventaire complet des relations trouvées dans le code

| # | Structure | Fichier:ligne | Nature | Granularité | Niveau de preuve actuel | Utilisation actuelle | Utilisable par CSM ? |
|---|---|---|---|---|---|---|---|
| 1 | `HYP_QUALITY_RELATIONS` | `index.html:4246` | Relation QUALITÉ→QUALITÉ (8 entrées) | Qualité×Qualité | Codé + documenté (transcription vérifiée des 8 moteurs, `AUDIT_TRANSVERSAL_HYP_V1.md` §3/§9) | `buildMultiQualityNarrative`, `computeHypClinicalSynthesis01` | **Oui — déjà utilisée, c'est le registre actuel de CSM** |
| 2 | `VAR_REL3` — `explains`/`explainedBy` | `index.html:4009` | Relation VARIABLE→VARIABLE (3625/3239 liens sur 283 variables) | Variable×Variable | Mixte : 85 variables `measuresSource:'document'`, 198 `'algorithmique_TFM'` | `deriveRootCauses` (§ « Causes probables » par test), `varRelHTML` (onglet Variables) | **Non directement** — granularité variable, pas qualité ; nécessite curation avant tout usage qualité-niveau |
| 3 | `VAR_REL3` — `correlatedWith` | idem | Relation VARIABLE↔VARIABLE symétrique, sans direction causale (3734 liens) | Variable×Variable | Idem (mixte) | `varRelHTML` uniquement (affichage) | Non |
| 4 | `VAR_REL3` — `refinedBy` | idem | Variable "grossière" → variable "fine" du même test (2844 liens) | Variable×Variable, intra-test | Idem | `varRelHTML` uniquement | Non — hors périmètre qualité |
| 5 | `VAR_REL3` — `verifyWith` | idem | Groupes de variables corrélées "à vérifier ensemble" (275 liens) | Variable×Variable, inter-test | Idem | `varRelHTML` uniquement | Non |
| 6 | `VAR_REL3` — `measures` | idem | Variable→QUALITÉ, poids toujours `Determinante` (256 liens) | Variable→Qualité | Mixte, vocabulaire partiellement non aligné sur `FUNCTIONS` (voir §7) | `computeQualityStatus`, `computeCapaciteStatus` | **Non sans reconciliation de vocabulaire — voir §14/§6** |
| 7 | `VAR_REL3` — `estimates` | idem | Variable→QUALITÉ, poids `Mineure`/`Moderee`/`Majeure` (867 liens) | Variable→Qualité | Idem | `computeQualityStatus`, `computeCapaciteStatus` | Idem |
| 8 | `VAR_REL3` — `influences` | idem | Variable→MÉCANISME biomécanique nommé (639 liens, 18 mécanismes) | Variable→Mécanisme | Non gradué (pas de `poids` séparé du texte) | `varRelHTML` uniquement | Non aujourd'hui — piste V2 (§15) |
| 9 | `TFM` | `index.html:750` | Relation TEST→QUALITÉ pondérée (poids 1-3, 44 tests) | Test→Qualité | Non gradué par preuve clinique — poids historique, jamais audité relation par relation (objet de `AUDIT_TFM_VS_VIERGE7.md`, en cours qualité par qualité) | `priorities` (`contributeurPrincipal`), `effectiveTFMWeight`, `computeQualityStatus`, onglet `'fonctions'` | **Non pour CSM** — c'est le réseau que HYP a précisément été construit pour ne plus utiliser comme preuve diagnostique |
| 10 | `CAPACITES_DATA` | `index.html:4012` | QUALITÉ→CAPACITÉ FONCTIONNELLE (Saut/Accélération/Réception/CoD), pondérée | Qualité→Capacité composite | `document` (référentiel clinique fourni, cf. commentaire `:4087`) | `computeCapaciteStatus`, onglet `'capacites'` (**live, on-screen**) | Non — granularité différente (capacité, pas qualité), et alimenté par `computeQualityStatus` (VAR_REL3), pas par HYP |
| 11 | `SYS_COMPENSATIONS` | `index.html:1184` | SYSTÈME (muscle/structure)→liste de compensations narratives | Système→Narration | `document` (implicite, non sourcé ligne à ligne) | **Calculé (`priorities[i].compensations`) mais jamais rendu — mort à l'affichage** (vérifié : aucune occurrence de `.compensations` en dehors de son affectation) | Non branché, latent |
| 12 | `STR_QUAL_DETAIL` | `index.html:1200` | SYSTÈME→QUALITÉ, avec Contribution/Confiance/Spécificité/Sens | Système→Qualité | `document`, avec avertissement explicite dans le code : *"champs vides dans le document source [...] à valider par l'équipe clinique"* (`:1198`) | Affichage uniquement, onglet `'raisonnement'` (Expert), transparence déjà correcte | Non — display-only, pas de statut calculé |
| 13 | `HYPO` (map narrative par qualité) | `index.html:5950` | QUALITÉ→phrase causale-orientée, paramétrée par `contributeurPrincipal` (système TFM) | Qualité→Narration | Codé, jamais sourcé par un document clinique distinct | **Live, très largement affiché** (voir §4 — c'est le point le plus sensible de cet audit) | Non — TFM-driven, non gatée par HYP |
| 14 | `priorities[i].contributeurPrincipal`/`.contributeurSecondaire` | `index.html:5954-5956` | QUALITÉ→SYSTÈME "responsable" (via poids TFM, premier candidat non-vert dans l'ordre `SYSTEMS`) | Qualité→Système | Poids `TFM`, pas de gate HYP | **Live** — alimente `HYPO`, titre "Priorité principale" du rapport | Non |
| 15 | `deriveRootCauses`/`rootCausesHTML` | `index.html:4034/4051` | VARIABLE→VARIABLE(S) amont, classées par poids+sévérité | Variable→Variable | `VAR_REL3.explainedBy`, mixte | **Calculé (`priorities[i].rootCauses`) mais `rootCausesHTML` jamais appelé — mort à l'affichage** | Non branché, latent |
| 16 | `CMJ_PHASE_TO_QUALITY` | `index.html:2220` | Phase biomécanique CMJ→libellé pseudo-qualité | Phase→Label | Auto-documenté comme non équivalent pour 4/5 phases (commentaire `:2213-2219`) | `computeMouvementAnalysis` (Fil de Raisonnement, système séparé) | Non — même le code reconnaît l'absence d'équivalence |
| 17 | `HYP_CSM_QUALITIES`/`HYP_CSM_HYP_KEY`/`computeHypClinicalSynthesis*` | `index.html` (post commit 65ffd6b) | Consommateur des 8 sorties HYP + relais de `HYP_QUALITY_RELATIONS` | Qualité→Qualité (dérivé) | Hérite du niveau de preuve de sa source (#1) | Actif, non branché UI/PDF | — (c'est l'objet audité, pas une source) |

**Constat immédiat** : sur 17 structures relationnelles identifiées, **une seule** (#1,
`HYP_QUALITY_RELATIONS`) est aujourd'hui gatée par les règles diagnostiques HYP et consommée par
CSM. Les structures #9 (`TFM`), #13 (`HYPO`) et #14 (`contributeurPrincipal`) sont **actives et
visibles au praticien aujourd'hui**, en dehors de toute logique HYP — voir §4.

---

## 4. ⚠️ Deux risques de contradiction déjà actifs en production (indépendants de CSM)

Ces deux points ne sont pas des défauts de `HYP_QUALITY_RELATIONS` ni de
`computeHypClinicalSynthesis01` — ils préexistent, dans des parties du rapport que ni la mission de
normalisation (B) ni la mission CSM (C) n'ont touchées (la mission B l'indique elle-même
explicitement : *"seule la phrase reliant DEUX qualités entre elles est concernée"*,
`index.html:4276`). Ils sont documentés ici parce qu'ils déterminent si le réseau relationnel
*global* (pas seulement `HYP_QUALITY_RELATIONS`) est prêt pour une synthèse clinique cohérente.

### 4.1 — `capaciteScores`/`qualityScores` : un second calcul de statut de qualité, non gaté par HYP

`computeQualityStatus(qualityName,...)` (`index.html:4070`) recalcule un statut par qualité à partir
d'une moyenne pondérée de **tous** les statuts bruts de tests dont `VAR_REL3.measures`/`.estimates`
pointent vers cette qualité — **indépendamment de tout moteur HYP, de toute règle de convergence, de
tout niveau de preuve.** Il est appelé pour neuf libellés
(`['Force maximale','Explosivité','Puissance','Réactivité','Propulsion','Absorption',
'Stabilisation','Contrôle moteur','Résistance neuromusculaire']`, `index.html:5978`), dont **cinq
partagent exactement le nom d'une qualité HYP** : Explosivité, Puissance, Réactivité, Absorption,
Stabilisation.

- `qualityScores` (le résultat) n'est **jamais rendu** dans l'UI ni le PDF (vérifié : aucune
  occurrence de `.qualityScores` en dehors de son calcul, `index.html:5977-5979`) — **mort à
  l'affichage aujourd'hui.**
- `capaciteScores`, en revanche, **est rendu, en direct, dans l'onglet `'capacites'`**
  (`index.html:8312-8322`) : chaque sous-capacité (ex. « Sécurité du saut ») affiche un ✓/✗ par
  qualité contributrice, coloré par le statut renvoyé par `computeQualityStatus` — pour
  Absorption/Stabilisation/Puissance/Réactivité/Explosivité, **un statut visuellement présent à
  côté**, mais **calculé différemment**, de celui affiché dans l'onglet `'fonctions'`
  (`fSc[f].status`, HYP-driven depuis la mission de normalisation).

**Concrètement** : un praticien peut aujourd'hui voir « Réactivité — orange » dans l'onglet
Fonctions (source `hypRea01`, honnête, gouverné par les règles de convergence 2/2 ADR-003) et
« Réactivité — ✓ » (ou l'inverse) dans l'onglet Capacités pour le même bilan, la même qualité, le
même patient — parce que ce second badge vient d'une moyenne pondérée TFM/VAR_REL3 qui ignore
totalement `state`/`support`/`convergence`. **C'est exactement le pattern de contradiction que la
mission de normalisation a corrigé pour `fSc[fn].status` lui-même** (repli TFM, cf.
`AUDIT_TRANSVERSAL_HYP_V1.md` §5/§6) — sauf qu'il ré-apparaît ici, intact, dans une structure
parallèle (`capaciteScores`) que cette mission n'a jamais eu dans son périmètre.

### 4.2 — `p.hypothese`/`contributeurPrincipal` : narration causale TFM toujours active, à l'endroit le plus visible du rapport

`AUDIT_TRANSVERSAL_HYP_V1.md` §10 avait déjà identifié que `priorities`/`causalSteps` construisait
une narration causale ("entraîne", "Répercussion sur") à partir du seul classement TFM. La mission
de normalisation (B) a corrigé la partie **inter-qualités** de ce mécanisme
(`buildMultiQualityNarrative`, remplace `conclusion`/`consequences`/`causalSteps`). **Elle n'a pas
touché — et le dit explicitement dans son propre commentaire — le champ `hypothese` par qualité**
(`HYPO[fn](main)`, `index.html:5950/5959/5970`), ni `contributeurPrincipal`/`contributeurSecondaire`
(`main`/`sec`, dérivés à 100 % du poids `TFM`, `index.html:5954-5956`, sélection = premier système
non-vert rencontré dans l'ordre déclaratif de `SYSTEMS`, **pas** un classement par sévérité).

Ce champ `hypothese` reste la phrase **la plus visible du rapport** : elle alimente le libellé
"Priorité principale" et le champ "🔍 Pourquoi ?" à au moins 8 emplacements distincts du PDF
(`index.html:6516,6521,6529,6611,6614,6911,7779-7780,8324`), y compris la première page de synthèse.
Exemple concret généré par le code actuel (`HYPO['Réactivité']`, `:5950`) :

> *« Le déficit de réactivité observé semble principalement influencé par une altération du système
> [contributeurPrincipal].»*

Ce `[contributeurPrincipal]` provient de `TFM`, pas de `hypRea01.explanatoryEvidence` — il peut donc
citer un système que le moteur HYP-REA-01 n'a jamais lu comme preuve explicative, et il n'est
**jamais mis en regard de `state`/`support`** de la qualité en question. **Ce n'est pas une
contradiction "état vs état"** comme au §4.1 (le badge de statut, lui, est bien HYP-driven depuis la
mission B) — **c'est une contradiction "statut honnête vs explication non-vérifiée juste en
dessous"**, dans le même bloc visuel, pour toutes les qualités, dans tous les rapports générés
aujourd'hui.

**Ces deux points ne bloquent pas, en eux-mêmes, un branchement futur de CSM** (CSM n'écrit dans
aucun des deux). Mais ils signifient que **brancher CSM sans traiter #4.1/#4.2 ferait cohabiter,
dans le même rapport, trois niveaux de rigueur différents pour la même qualité** : `fSc.status`
(HYP, rigoureux), `capaciteScores`/`hypothese` (TFM, non gatés), et la future synthèse CSM (HYP,
rigoureuse). C'est un signal direct pour la conclusion de cet audit (§17).

---

## 5. Classification des relations

**A — ASSOCIATION** · **B — HYPOTHÈSE EXPLICATIVE** · **C — CAUSALITÉ** · **D — NON DÉTERMINABLE**
· **E — OBSOLÈTE/CONTRADICTOIRE**

| Relation | Source | Classe | Justification |
|---|---|---|---|
| Force → Puissance | `HYP_QUALITY_RELATIONS` | **B** | `iso_belt_squat_n` diagnostique Force / explicative Puissance, non-générateur, vérifié empiriquement non-contaminant (`AUDIT_TRANSVERSAL_HYP_V1.md` §3) |
| Force → Explosivité | `HYP_QUALITY_RELATIONS` | **B** | Même schéma, RFD partagé en explicatif pur |
| Force → Endurance | `HYP_QUALITY_RELATIONS` | **B** | 11 familles segmentaires, explicatives, jamais diagnostiques pour Endurance |
| Force → Stabilisation | `HYP_QUALITY_RELATIONS` | **B**, mais voir §7 (relation potentiellement trop forte) | RFD hanche/cheville lu en explicatif brut par Stabilisation, **jamais classifié ni généré** selon `AUDIT_TRANSVERSAL_HYP_V1.md` §9 — la formulation « hypothèse explicative » reste défendable mais l'évidence sous-jacente est plus faible que pour Force→Puissance |
| Puissance → Explosivité | `HYP_QUALITY_RELATIONS` | **B** | `cmj_peak_power`, confirmative documentée, gel explicite |
| Explosivité → Puissance | `HYP_QUALITY_RELATIONS` | **B** | `cmj_conc_rfd`, explicative « stratégie » — relation inverse et indépendante de la précédente, pas une redite (voir §7) |
| Mobilité → Stabilisation | `HYP_QUALITY_RELATIONS` | **B** | `wblt_distance`, seule variable explicative non nulle de Mobilité |
| Réactivité → Endurance | `HYP_QUALITY_RELATIONS` | **B** | `repeated_hop_mean_rsi`, rôle partagé explicative/confirmative, 1 KPI/15 côté Réactivité |
| Réactivité → Absorption (`dj_rsi`) | Codée dans `computeHypAbsorption01`, **absente de `HYP_QUALITY_RELATIONS`** | **B — non exploitée** | `AUDIT_TRANSVERSAL_HYP_V1.md` §3/§9 la documente explicitement comme "SOURCE EXPLICITE (moteur HYP)", non contaminante — candidate directe §6 |
| Force (segments) → Réactivité/Puissance/Explosivité/Endurance (variables `EP` de `HYP_VARIABLE_MATRIX.md`) | Codées comme explicatives dans plusieurs moteurs, **jamais promues** au niveau qualité | **D** (au niveau qualité) | Chaque lien existe variable par variable, dans le moteur HYP concerné, mais n'a jamais été audité comme "relation qualité→qualité" au sens de `HYP_QUALITY_RELATIONS` — statut qualité-niveau non déterminable sans cet audit dédié |
| Absorption ↔ Stabilisation | `TFM.landing_uni={absorption:3,stabilisation:3,...}` (poids partagé) | **E, du point de vue TFM ; ○ confirmé côté HYP** | `AUDIT_TRANSVERSAL_HYP_V1.md` §3 : *"structurellement impossibles à lire par Absorption (`computeHypAbsorptionReceptionImpact()` ne prend aucun paramètre)"* — preuve de code, pas une observation. Le poids TFM partagé ne doit **jamais** être lu comme une hypothèse explicative — cf. CAS 7 (§8) |
| Puissance ↔ Absorption | `TFM.cmj={puissance:3,absorption:2}` (poids partagé) | **E, du point de vue TFM ; ○ confirmé côté HYP** | Disjonction totale confirmée : phase concentrique (Puissance) vs phase de freinage (Absorption) du même test, aucune variable commune |
| `contributeurPrincipal` (TFM) → `hypothese` (texte narratif) | `index.html:5950-5970` | **C, potentiellement** | Formulation *"semble principalement influencé par"* — non gatée par HYP, non vérifiée relation par relation ; à traiter comme causalité non démontrée tant qu'elle n'est pas revue (§4.2) |
| `capaciteScores[q]` (TFM/VAR_REL3) vs `fSc[q].status` (HYP) | `index.html:4070/5978` | **E, potentiellement, cas par cas** | Pas une relation entre deux qualités mais **deux mesures concurrentes de la même qualité** — signalé séparément car ce n'est pas le même type d'ambiguïté que les autres lignes de ce tableau (§4.1) |

---

## 6. Comparaison TFM ↔ HYP ↔ HYP-CSM

| Relation | Présente TFM (poids partagé) | Présente HYP (moteur) | Présente `HYP_QUALITY_RELATIONS` | Statut | Utilisable CSM aujourd'hui |
|---|---|---|---|---|---|
| Force → Puissance | Oui (`knee_ext`,`imtp`... poids 2-3 sur les deux) | Oui (`iso_belt_squat_n`) | **Oui** | B | ✅ Oui |
| Force → Explosivité | Oui | Oui | **Oui** | B | ✅ Oui |
| Puissance → Explosivité | Oui (`cmj`/`slcmj` poids 3 sur les deux) | Oui (`cmj_peak_power`) | **Oui** | B | ✅ Oui |
| Absorption → Stabilisation | Oui (`landing_uni/bi`, `sllt` poids 2-3 sur les deux) | **Non — étanchéité prouvée par le code** | Non | E (TFM) / ○ (HYP) | ❌ Non — et ne doit jamais l'être |
| Absorption → Réactivité | Oui (`dj`/`sldj` poids 2-3 partagé) | **Oui**, non générateur (`dj_rsi`) | **Non — manquante** | B non exploitée | ⚠️ Candidate (§9) |
| Réactivité → Absorption | Idem | Oui (symétrique au précédent) | Non | B non exploitée | ⚠️ Candidate |
| Stabilisation → Absorption | Oui (`sllt`,`landing_uni` poids partagé) | Non identifié comme relation codée dans les 8 moteurs | Non | D | ❌ Non déterminable |
| Mobilité → autres qualités | Oui, large (`wblt` contribue à 4 qualités TFM) | Uniquement → Stabilisation | **Oui (Mobilité→Stabilisation)** | B | ✅ Oui, pour cette seule paire |
| Endurance → autres qualités | Oui (`repeated_hop`,`heel_raise` poids partagé Réactivité/Absorption) | Uniquement Réactivité→Endurance (sens inverse, explicatif) | **Oui (Réactivité→Endurance)** | B | ✅ Oui, sens Réactivité→Endurance uniquement — **pas** Endurance→Réactivité ni Endurance→Absorption |

**Lecture transversale** : sur les 28 paires possibles entre les 8 qualités HYP, **8 relations
existent aujourd'hui dans `HYP_QUALITY_RELATIONS`** (deux d'entre elles, Puissance↔Explosivité,
couvrent la même paire dans les deux sens). **1 paire supplémentaire (Réactivité↔Absorption) est
codée et documentée mais absente du registre.** Les **19 autres paires** sont soit prouvées comme
n'ayant aucune relation (Absorption↔Stabilisation, Puissance↔Absorption — étanchéité **positive**,
un résultat clinique en soi), soit non déterminables avec les sources actuelles (aucune relation
codée trouvée, ce qui n'est pas la même chose qu'une relation activement infirmée).

---

## 7. Relations trop faibles / trop fortes par rapport aux données disponibles

**Potentiellement trop fortes** (formulées comme hypothèse explicative alors que la preuve
sous-jacente est ténue) :

- **Force → Stabilisation** : la variable support (RFD hanche/cheville, 6/11 familles) est lue en
  explicatif brut par `computeHypStabilisation01` mais **n'est jamais classifiée ni comptée dans la
  convergence** (`AUDIT_TRANSVERSAL_HYP_V1.md` §9) — la relation existe au sens "la variable est
  lue", mais son poids clinique réel dans le raisonnement de Stabilisation est proche de nul
  aujourd'hui. La formulation CSM ("hypothèse explicative possible... sans en établir la cause")
  reste honnête, mais un praticien pourrait lui accorder plus de poids que ce que le moteur
  Stabilisation lui-même lui accorde en interne.

**Potentiellement redondantes, sans être fausses** :

- **Puissance → Explosivité ET Explosivité → Puissance simultanément** : les deux relations sont
  indépendamment vraies et codées (`cmj_peak_power` d'un côté, `cmj_conc_rfd` de l'autre), donc
  aucune des deux n'est "trop forte" individuellement. Mais dans un profil où Puissance **et**
  Explosivité sont toutes deux objectivées (CAS 4, §8), `computeHypClinicalSynthesisRelationships`
  génère **les deux phrases symétriques** ("Puissance peut expliquer Explosivité" et
  "Explosivité peut expliquer Puissance") dans la même synthèse — comportement correct au regard de
  la règle "jamais de hiérarchie imposée", mais susceptible de lire comme redondant pour le
  praticien. À noter pour une future itération de présentation (pas un défaut du registre lui-même).

**Pas de relation identifiée comme trop faible** dans le registre actuel — les 8 entrées de
`HYP_QUALITY_RELATIONS` respectent toutes le critère à 3 conditions déjà validé par
`AUDIT_TRANSVERSAL_HYP_V1.md` §4 (rôle différent selon la qualité, documenté dans le code, jamais
générateur croisé).

---

## 8. Cas cliniques synthétiques (12 cas mandatés)

Comportement réel de `computeHypClinicalSynthesis01`, vérifié soit directement par
`tests/hypClinicalSynthesis01.test.js` (22 cas déjà exécutés et verts), soit par lecture directe de
la logique (`computeHypClinicalSynthesisRelationships`/`Narrative`) pour les combinaisons non
couvertes littéralement par un test nommé.

| Cas | HYP objectiverait | Relations activables | Relations non activables | CSM peut légitimement dire | CSM ne doit surtout pas dire |
|---|---|---|---|---|---|
| **1** — Force ↓ seule | `objectified:[Force]` | Aucune (nécessite 2 qualités objectivées) | Force→Puissance/Explosivité/Endurance/Stabilisation, toutes `not_supported` (silencieuses dans la narration) | "Un déficit est objectivé pour Force." | Rien sur Puissance/Explosivité — elles ne sont pas mentionnées |
| **2** — Puissance ↓ seule | `objectified:[Puissance]` | Aucune | Force→Puissance (`not_supported`, Force non objectivée) | "Un déficit est objectivé pour Puissance." | "Le déficit de Force explique la Puissance" — Force n'est même pas testée/déficitaire ici |
| **3** — Force ↓ + Puissance ↓ | `objectified:[Force,Puissance]` | Force→Puissance : `explanatory_hypothesis` | — | "Le déficit de Force constitue une hypothèse explicative possible du déficit de Puissance (...), sans en établir la cause." | "La Force est responsable du déficit de Puissance" |
| **4** — Force ↓ + Puissance ↓ + Explosivité ↓ | 3 objectivées | Force→Puissance, Force→Explosivité, Puissance→Explosivité **et** Explosivité→Puissance (bidirectionnel, §7) | — | 4 phrases d'hypothèse explicative distinctes, jamais hiérarchisées ; `limitations` rappelle explicitement l'absence de hiérarchie causale | Une chaîne "Force → Puissance → Explosivité" présentée comme séquence causale (§10) |
| **5** — Force normale + Puissance ↓ | `objectified:[Puissance]` (Force = `absente`, non objectivée) | Aucune | Force→Puissance : `not_supported` (Force non objectivée), absente de la narration | "Un déficit est objectivé pour Puissance." | Toute mention de Force comme facteur — la relation `not_supported` reste dans `relationships` (traçable) mais **jamais** dans `narrative.relationsExplicatives` |
| **6** — Force non_determinable + Puissance ↓ | `objectified:[Puissance]`, `nonDeterminable:[Force]` | Aucune | Force→Puissance : `not_applicable_non_determinable`, texte "la contribution de Force ne peut pas être déterminée..." | "Un déficit est objectivé pour Puissance. Non déterminable pour Force — non déterminable n'équivaut jamais à normal." | "Force n'est pas en cause" (faux — Force est non déterminable, pas normale) ; "Force explique Puissance" (faux — non objectivée) |
| **7** — Absorption ↓ + Stabilisation ↓ | 2 objectivées | Aucune relation documentée (étanchéité HYP prouvée, §5) | Absorption↔Stabilisation : absente du registre par construction | "Les déficits de Absorption et de Stabilisation sont concomitants... aucune relation explicative documentée entre eux." (`concordant_no_relation`) | Toute hypothèse explicative entre les deux — le TFM partage un poids (`landing_uni`), mais HYP a **prouvé structurellement** l'absence de lien, et CSM respecte fidèlement cette étanchéité |
| **8** — Absorption ↓ + Réactivité ↓ | 2 objectivées | Aucune dans le registre actuel (relation `dj_rsi` codée mais non transcrite, §6) | — | "Déficits concordants, sans relation explicative documentée." (techniquement correct, mais sous-exploite une preuve déjà codée — voir §6/§9) | — |
| **9** — Réactivité ↓ seule | `objectified:[Réactivité]` | Aucune | Réactivité→Endurance : `not_supported` | "Un déficit est objectivé pour Réactivité." | Rien sur Endurance |
| **10** — Stabilisation ↓ seule | `objectified:[Stabilisation]` | Aucune | Force→Stabilisation, Mobilité→Stabilisation : `not_supported` | "Un déficit est objectivé pour Stabilisation." | Rien sur Force/Mobilité |
| **11** — Profil multi-déficits (5-7 qualités) | Jusqu'à 7/8 objectivées (vérifié CAS 5/9 de `tests/hypClinicalSynthesis01.test.js`) | Toutes les paires documentées applicables + `concordant_no_relation` pour le reste | — | Constat factuel de toutes les qualités objectivées, hypothèses explicatives disponibles listées à plat, `limitations` répète explicitement l'absence de hiérarchie même à 7 qualités | Désigner un "déficit principal" — vérifié par test qu'aucun champ `rank`/`priority` n'existe |
| **12** — Aucune qualité objectivement déficitaire | `objectified:[]` | — | — | "Aucun déficit n'est objectivé par les moteurs HYP avec les données actuellement disponibles." — qualités `non_determinable` listées séparément, jamais fusionnées avec "normal" | "Profil normal" si des qualités sont en réalité `non_determinable` plutôt que `absente` |

---

## 9. Test critique de non-causalité

**Force ↓ + Puissance ↓, relation documentée** → CSM produit : *"Le déficit de Force constitue une
hypothèse explicative possible du déficit de Puissance (`iso_belt_squat_n`...), sans en établir la
cause."* Jamais *"La Force est responsable du déficit de Puissance."* — vérifié par
`tests/hypClinicalSynthesis01.test.js` (recherche positive interdite de tout motif
`/(est|constitue)\s+(le|la)\s+(déficit|cause)\s+principal/i`).

**Force normale + Puissance ↓** → la relation `Force→Puissance` ne crée jamais un déficit de Force :
`qualities['Force'].objectified` reste `false`, `qualities['Force'].state` reste `'absente'`, aucun
champ de `computeHypClinicalSynthesis01` ne transforme un état "absente" en "retenue". Vérifié
structurellement : CSM ne lit jamais/n'écrit jamais dans `h.state` (accès en lecture seule sur la
référence `functionScores[q][hypKey]`, jamais de mutation — vérifié par comparaison JSON
avant/après, CAS 19/20 du fichier de tests).

**Force non_determinable + Puissance ↓** → la relation ne transforme jamais Force en déficit ni en
normal : `csmIsNonDeterminable(h)` reste vrai, la relation bascule en
`not_applicable_non_determinable`, jamais en `explanatory_hypothesis` ni en `concordant_no_relation`.

Ces trois garanties sont **structurelles** (le code de `computeHypClinicalSynthesisRelationships`
ne peut matériellement pas produire un autre résultat que celui décrit — la condition
`a.objectified&&b.objectified` est un ET strict, jamais contourné), pas seulement vérifiées par
test — le test sert de preuve empirique complémentaire, pas de seule garantie.

---

## 10. Relations transversales et chaînes

**Force → Puissance → Explosivité** (chaîne à 2 sauts) : CSM **ne construit jamais de chaîne**. Les
relations `Force→Puissance` et `Puissance→Explosivité` (ou `Explosivité→Puissance`) sont générées
**indépendamment**, chacune évaluée sur ses deux qualités propres, jamais combinées en séquence.
Aucune structure de graphe transitif n'existe dans `computeHypClinicalSynthesisRelationships` — la
boucle est un simple `HYP_QUALITY_RELATIONS.forEach`, sans propagation. Un profil Force↓+Puissance↓+
Explosivité↓ (CAS 4, §8) produit donc *"Déficits concordants"* + jusqu'à 4 hypothèses explicatives
**pairwise**, jamais *"Force cause Puissance qui cause Explosivité."*

**Absorption → Réactivité** (chaîne potentielle, non actuellement dans le registre) : comme la
relation elle-même est absente de `HYP_QUALITY_RELATIONS` aujourd'hui (§6/§9), aucune chaîne ne peut
se former par ce biais non plus — confirmé par construction plutôt que par test dédié.

---

## 11. Relations capacité/stratégie

`csmCapaciteStrategieNote` (`index.html`, post-commit) reste strictement limité aux deux qualités où
cette distinction existe déjà, nativement, dans le moteur HYP source :

- **Puissance** : lit `explanatoryEvidence.capacite.force` (déjà exposé par `computeHypPower01`,
  jamais générateur de `state` selon `AUDIT_TRANSVERSAL_HYP_V1.md` §12).
- **Explosivité** : lit `explanatoryEvidence.forceCapacite`/`biomecanique` (idem,
  `computeHypExplosivite01`).

Pour les 6 autres qualités, `csmCapaciteStrategieNote` retourne `null` sans exception — **aucune
variable explicative n'est promue au rang diagnostique** en dehors de ce que le moteur source
expose déjà lui-même comme tel. C'est une conséquence directe du fait que CSM ne lit que
`functionScores`, jamais `testData`/`VAR_REL3` directement — garantie structurelle, pas seulement
comportementale.

---

## 12. Asymétries

CSM ne recalcule jamais d'asymétrie : le champ `precision` de sa sortie est une **copie directe**
(par référence, jamais reconstruite) de `hypXxx01.precision` pour chaque qualité
(`computeHypClinicalSynthesis01`, boucle `HYP_CSM_QUALITIES.forEach` sur `precision[q]=h.precision`).
La règle gelée « asymétrie = modificateur/précision, jamais diagnostic global »
(`AUDIT_TRANSVERSAL_HYP_V1.md` §8, vérifiée sans exception dans les 8 moteurs) est donc héritée
automatiquement par CSM, sans logique additionnelle à auditer séparément ici.

**Hors périmètre CSM mais pertinent pour le réseau relationnel global** : `TFM`/`VAR_REL3` ne
portent aucune notion d'asymétrie (LSI) — ce sont des structures agrégées D+G. Aucune relation
TFM/legacy utilisant une asymétrie comme preuve diagnostique n'a été trouvée dans l'inventaire du
§3.

---

## 13. Variables sans normes

**Constat déjà documenté, réutilisé ici sans le redériver** (`AUDIT_TRANSVERSAL_HYP_V1.md` §13.1) :
les familles `sh_iso_3030`/`sh_iso_6060` (Force, Niveau 2) sont documentées comme rôle explicatif
mais n'ont aujourd'hui **aucun seuil** (`NORMS`/`THRESHOLDS`) — inertes, pas absentes.

**Constat propre à cet audit** : dans `VAR_REL3`, **198 variables sur 283 (70 %)** ont
`measuresSource:'algorithmique_TFM'` plutôt que `'document'` — c'est-à-dire que leur lien
`measures`/`estimates` vers une qualité provient d'un héritage automatique du poids `TFM`, **pas**
d'une lecture du référentiel clinique fourni. Le code lui-même l'affiche déjà en transparence à
l'écran (`srcTag`, `index.html:4157`, `' (référentiel clinique)'` vs `' (calculé)'`) — bonne
pratique existante, à conserver telle quelle. Pour toute future extension de
`HYP_QUALITY_RELATIONS`, ce champ doit être le premier filtre : une relation
`measuresSource:'algorithmique_TFM'` ne peut pas, en l'état, être promue au rang B (hypothèse
explicative) sans revalidation clinique — elle reste, par défaut, une classe D (non déterminable
cliniquement, même si calculable statistiquement).

**Absence de norme ≠ normal, réaffirmé** : aucune occurrence trouvée, dans l'inventaire du §3, d'une
structure qui transformerait une variable non normée en statut "normal" par défaut — `applyThr`
retourne `null` en l'absence de seuil, jamais un statut positif par défaut (vérifié pour `TFM`,
`VAR_REL3`, et les 8 moteurs HYP).

---

## 14. Richesse du TFM — ce qui reste à portée de main pour une future extension

**Ne pas réduire CSM à `HYP_QUALITY_RELATIONS` serait prématuré aujourd'hui**, pour trois raisons
concrètes établies par cet audit :

1. **Vocabulaire non aligné.** `VAR_REL3.measures`/`.estimates` référencent 15 libellés de qualité,
   dont 6 n'existent dans aucune des deux taxonomies officielles (`FUNCTIONS`/`HYP_CSM_QUALITIES`) :
   `'Force maximale'`, `'Contrôle moteur'`, `'Résistance neuromusculaire'`, `'Propulsion'`,
   `'Explosivite'`/`'Reactivite'` (sans accent, doublons probables de `'Explosivité'`/`'Réactivité'`
   avec accent — non résolu, non vérifié ici, à signaler). Toute portée de VAR_REL3 vers CSM
   nécessite d'abord une réconciliation de vocabulaire, qui n'a jamais été faite.
2. **Preuve mixte.** 70 % des entrées `VAR_REL3` sont `algorithmique_TFM` (§13) — la même prudence
   qui a motivé la construction de HYP (ne pas confondre poids TFM et preuve clinique) s'applique
   à toute tentative de réutiliser VAR_REL3 telle quelle pour CSM.
3. **Granularité variable, pas qualité.** `HYP_QUALITY_RELATIONS` a été construit en vérifiant,
   moteur par moteur, qu'une variable est *diagnostique/confirmative* d'une qualité **et**
   *explicative, non générative*, d'une autre (méthode documentée dans
   `AUDIT_TRANSVERSAL_HYP_V1.md` §3/§9). C'est un travail de curation clinique, pas une extraction
   automatique de `VAR_REL3` — la richesse du TFM (283 variables, 18 mécanismes biomécaniques
   nommés) est réelle, mais elle est **au mauvais niveau de granularité** pour alimenter CSM
   directement, sans repasser par ce travail de vérification manuel.

**Ce qui est néanmoins exploitable dès aujourd'hui, sans travail de curation supplémentaire** : la
relation Réactivité→Absorption (`dj_rsi`), déjà vérifiée non-contaminante au niveau du **moteur
HYP lui-même** (pas de VAR_REL3) par `AUDIT_TRANSVERSAL_HYP_V1.md` §3/§9 — c'est la seule relation
candidate qui satisfait déjà, aujourd'hui, les mêmes critères que les 8 relations actuelles de
`HYP_QUALITY_RELATIONS`. Voir §16.

---

## 15. HYP_CSM_QUALITIES actuel — audit détaillé (Partie 5 de la mission)

Pour chacune des 8 entrées de `HYP_QUALITY_RELATIONS` :

| Relation | 1. Correctement définie ? | 2. Suffisamment précise ? | 3. Les deux qualités objectivables par HYP ? | 4. Utilisable comme hypothèse explicative ? | 5. Cas où limiter à association ? | 6. Risque de causalité abusive ? |
|---|---|---|---|---|---|---|
| Force→Puissance | Oui | Oui (`via` cite la variable exacte) | Oui, les deux | Oui, déjà utilisée ainsi | Si Force non objectivée (CAS 5/6, §8) — déjà géré par le gate | Faible — formulation systématiquement non-causale, vérifié par test |
| Force→Explosivité | Oui | Oui | Oui | Oui | Idem | Faible |
| Force→Endurance | Oui | Oui | Oui | Oui | Idem | Faible |
| Force→Stabilisation | Oui | Moyenne — preuve sous-jacente jamais classifiée (§7) | Oui | Oui, avec réserve de robustesse clinique (§7) | Idem + cas où le lien RFD reste non classifiable même si les deux qualités le sont | Faible dans le texte généré, mais le lien source est ténu — à surveiller si le praticien override |
| Puissance→Explosivité | Oui | Oui | Oui | Oui | Idem | Faible |
| Explosivité→Puissance | Oui | Oui | Oui | Oui, mais redondant avec la ligne précédente si les deux qualités sont objectivées (§7) | Idem | Faible, mais lisibilité à surveiller (double phrase symétrique) |
| Mobilité→Stabilisation | Oui | Oui (seule variable explicative de Mobilité) | Oui | Oui | Idem | Faible |
| Réactivité→Endurance | Oui | Oui (1 KPI/15, poids clinique réel modeste) | Oui | Oui | Cas où seul le KPI partagé est disponible — déjà couvert par le gate objectivation | Faible |

**Conclusion de cette partie** : les 8 relations existantes sont **correctement gatées et
correctement formulées** — aucune ne pose de risque de causalité abusive dans le texte généré
aujourd'hui. Les deux réserves identifiées (Force→Stabilisation, robustesse de preuve modeste ;
Puissance↔Explosivité, redondance de lecture) sont des nuances de qualité de restitution, pas des
défauts de gouvernance.

---

## 16. Candidates for future CSM

| Relation | Origine | Type | Intérêt potentiel | Niveau de preuve | Compatible HYP ? | À ajouter plus tard ? |
|---|---|---|---|---|---|---|
| **Réactivité → Absorption** (`dj_rsi`) | Codée dans `computeHypAbsorption01`, documentée `AUDIT_TRANSVERSAL_HYP_V1.md` §3/§9 | B (hypothèse explicative) | Comble le seul cas (CAS 8, §8) où une paire pourtant objectivée aujourd'hui retombe en simple association alors qu'une preuve codée existe | Élevé — vérifié non-contaminant côté moteur HYP lui-même (pas VAR_REL3) | Oui, déjà conforme aux 3 critères de légitimité (§4 de `AUDIT_TRANSVERSAL_HYP_V1.md`) | **Oui, candidate la plus solide** — même niveau de rigueur que les 8 relations déjà en registre |
| Force segmentaire hanche/cheville → Stabilisation (renforcement) | Déjà partiellement dans le registre (Force→Stabilisation), mais la preuve reste non classifiée | B, faible | Documenterait explicitement la faiblesse relative déjà notée en §7/§15 plutôt que de la laisser implicite | Faible (jamais classifié) | Oui, mais nécessiterait un champ `evidenceLevel` explicite pour ne pas sur-représenter la robustesse (voir §17 V2) | À discuter seulement si `HYP_CSM_RELATIONS_V2` introduit une graduation de preuve |
| Repeated Hop / mécanismes `influences` (`SSC_RAPIDE`, `RESTITUTION_ENERGIE_ELASTIQUE`) | `VAR_REL3.influences`, 639 liens, 18 mécanismes nommés | Physiologique (mécanisme, pas qualité) | Enrichirait le `via` des relations existantes avec un langage mécanistique plus clinique que "variable X" | Mixte (document/algorithmique_TFM, non distingué par mécanisme) | Nécessite d'abord la réconciliation de vocabulaire (§14) | Piste V2 uniquement — pas mûr |
| Toute relation `capaciteScores`/`STR_QUAL_DETAIL` | §4.1/§3 | — | Aucun — ce sont des structures parallèles à réconcilier avec HYP, pas des candidates d'enrichissement de `HYP_QUALITY_RELATIONS` | — | Non, tant que #4.1 n'est pas résolu | Non — nécessite d'abord une décision d'architecture (§17), pas un simple ajout |

---

## 17. Proposition conceptuelle — `HYP_CSM_RELATIONS_V2` (non implémentée)

Structure proposée à titre de discussion uniquement, pour une mission future dédiée si le praticien
en valide le principe :

```js
// PROPOSITION — NON IMPLÉMENTÉE. Ne pas coder à partir de cet audit sans mission dédiée.
var HYP_CSM_RELATIONS_V2 = [
  {
    source: 'Force',
    target: 'Puissance',
    relationType: 'explicative',          // jamais 'causale' par défaut
    evidenceLevel: 'document',            // 'document' | 'algorithmique_TFM' | 'code_verifie_non_source'
    direction: 'unidirectionnelle',       // vs 'bidirectionnelle' (cf. Puissance/Explosivité, §7)
    conditions: ['source.objectified===true', 'target.objectified===true'],
    allowedNarrative: 'peut constituer une hypothèse explicative possible, sans en établir la cause',
    forbiddenNarrative: ['est responsable de', 'entraîne', 'cause principale'],
    sourceOfTruth: 'iso_belt_squat_n (HYP-PUI-01, explanatoryEvidence.capacite.force)',
    clinicalNotes: 'Transcription de HYP_QUALITY_RELATIONS existant, aucune modification de preuve.'
  },
  {
    source: 'Réactivité',
    target: 'Absorption',
    relationType: 'explicative',
    evidenceLevel: 'code_verifie_non_source',  // codé et vérifié non-contaminant, mais jamais
                                                 // formellement promu au registre HYP_QUALITY_RELATIONS
    direction: 'unidirectionnelle',
    conditions: ['source.objectified===true', 'target.objectified===true'],
    allowedNarrative: 'peut constituer une hypothèse explicative possible, sans en établir la cause',
    forbiddenNarrative: ['est responsable de', 'entraîne', 'cause principale'],
    sourceOfTruth: 'dj_rsi (HYP-ABS-01 V2, sous-domaine réactif, non générateur — AUDIT_TRANSVERSAL_HYP_V1.md §3/§9)',
    clinicalNotes: 'Candidate §16 — nécessite validation praticien avant tout ajout au registre actif.'
  }
  // ... et ainsi de suite pour les 6 autres relations existantes + toute future candidate validée
];
```

**Ce que ce V2 apporterait par rapport au registre actuel** : un champ `evidenceLevel` explicite
(aujourd'hui implicite, seulement documenté en commentaire) permettant de distinguer, au moment du
rendu, une relation "document clinique" d'une relation "code vérifié mais jamais sourcée" — et un
champ `forbiddenNarrative` qui rendrait auditable, automatiquement (test unitaire générique plutôt
que cas par cas comme aujourd'hui), l'absence de tout vocabulaire causal.

**Ce que ce V2 n'est pas** : une invitation à porter VAR_REL3 en bloc dans CSM. §14 explique
pourquoi ce serait prématuré (vocabulaire non aligné, preuve à 70 % non sourcée cliniquement,
granularité variable et non qualité).

---

## 18. Conclusion clinique

**Ce qui fonctionne déjà, vérifié et solide** : les 8 relations de `HYP_QUALITY_RELATIONS`, le gate
d'objectivation double (`a.objectified&&b.objectified`), le traitement honnête du
`non_determinable`, l'absence totale de hiérarchie/chaîne causale, l'héritage correct de la
discipline "asymétrie = modificateur" et "capacité/stratégie sans cause imposée" — tout ceci est
vérifié structurellement (pas seulement par test) et se comporte exactement comme demandé sur les
12 cas cliniques et les tests de non-causalité (§8/§9/§10).

**Ce qui manque ou reste ambigu** :
- 1 relation code-vérifiée et documentée (Réactivité→Absorption) n'a jamais été portée au registre,
  ce qui fait retomber un cas réel (CAS 8) en simple association alors qu'une preuve existe déjà ;
- 19 des 28 paires possibles restent non déterminables faute d'audit dédié (pas faute de preuve
  activement infirmée) ;
- 2 mécanismes actifs en production (§4.1 `capaciteScores`, §4.2 `hypothese`/`contributeurPrincipal`)
  restent entièrement TFM-driven, non gatés par HYP, et affichés au praticien dans le même rapport
  que le futur CSM — un risque de contradiction déjà réel aujourd'hui, indépendant de CSM lui-même,
  mais qui deviendrait plus visible si CSM est branché sans le traiter ou, a minima, sans
  l'expliciter au praticien ;
- une collision d'identifiant non résolue (`HYP-CSM-01`, §0) doit être tranchée avant toute
  communication externe sur ce nom.

### Décision

**B — RÉSEAU SUFFISANT MAIS INCOMPLET.**

Le socle que `HYP-CSM-01` utilise aujourd'hui (`HYP_QUALITY_RELATIONS`) est correct, prudent et
suffisant pour produire, **sur les paires qu'il couvre**, une synthèse clinique honnête et non
causaliste — rien n'oblige à l'enrichir avant de pouvoir raisonner dessus. Mais le réseau **global**
(TFM + VAR_REL3 + les structures narratives adjacentes) contient à la fois une relation
immédiatement exploitable et non exploitée (§16) et deux mécanismes actifs qui, eux, ne respectent
pas encore la discipline HYP (§4). Un branchement UI/PDF aujourd'hui exposerait le praticien à trois
niveaux de rigueur différents pour la même qualité dans le même rapport — ce n'est pas un défaut de
CSM, c'est un défaut de ce qui l'entoure déjà en production.

**Recommandation pour la mission suivante** (à valider par le praticien, non décidée ici) :
traiter §0 (collision de nom) et à défaut au moins documenter §4 (les deux mécanismes TFM
concurrents) avant le branchement UI/PDF ; évaluer l'ajout de Réactivité→Absorption au registre
(§16) séparément, car c'est un simple ajout d'une relation déjà prouvée, pas une décision
d'architecture.

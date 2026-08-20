# Audit et migration des derniers consommateurs cliniques TFM avant branchement de HYP-CSM-01

## Statut de ce document

Audit **documentaire et de lecture de code uniquement**, complété par des exécutions directes de
`computeMoteur()` via un script jetable, non committé (convention déjà utilisée par
`AUDIT_TRANSVERSAL_HYP_V1.md`). **Aucune ligne de `index.html` n'a été modifiée.** Aucune relation
ajoutée ou supprimée, aucun seuil créé, aucune règle HYP touchée. Ce document approfondit et
prolonge `AUDIT_RELATIONNEL_HYP_TFM_CSM.md` (§4.1/§4.2) sur les deux mécanismes qu'il avait
identifiés comme actifs et non gatés par HYP : `capaciteScores` et `hypothese`/`contributeurPrincipal`.

---

## 1. Objectif

Identifier précisément les derniers chemins cliniques encore pilotés par TFM (indépendamment de
HYP), déterminer leur rôle réel dans l'application, démontrer empiriquement leurs divergences
possibles avec HYP, cartographier tous leurs consommateurs, et proposer — sans l'appliquer — une
architecture de migration vers `HYP → DIAGNOSTIC / TFM → RELATIONS / CSM → SYNTHÈSE / UI-PDF →
CONCLUSION UNIQUE`.

---

## 2. Sources analysées

**Code** (`index.html`) : boucle générique `fSc` (5741-5762), les 8 blocs de remplacement HYP
(5763-5947, dont `tfmFallback`), `computeQualityStatus`/`computeCapaciteStatus`/`capaciteHTML`
(4068-4122), `CAPACITES_DATA` (4012), `VAR_REL3.measures`/`.estimates` (4009, 283 variables),
`priorities`/`HYPO`/`ORI` (5950-5971), `muscleLsiFor` (6377-6389), tous les points de rendu de
`p.hypothese`/`p.contributeurPrincipal`/`capaciteScores` (`buildSportifReport` 6269-6884,
`buildExpertReport` 6884-7275, `AnalyseView` 7652-8284, `ExpertView` 8284-8358).

**Documents** : `AUDIT_RELATIONNEL_HYP_TFM_CSM.md` (référence directe de cette mission),
`AUDIT_TRANSVERSAL_HYP_V1.md` (§5/§6/§10, mécanisme déjà partiellement documenté),
`HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md`, `IMPLEMENTATION_HYP_V1_NORMALIZATION.md`,
`HYP_VARIABLE_MATRIX.md` (rôles D/C/EP/EB par test et par qualité, utilisés en §10),
`HYP_ARCHITECTURE_FREEZE.md`, `DECISION_MEMO_CSM.md` (collision d'identifiant, §14).

**Exécutions empiriques** : script jetable (extraction identique à `tests/*.test.js` :
`code.indexOf('var C={')`→`'// ── SUPABASE CONFIG'`, `eval()`), 5 scénarios synthétiques rejoués
directement sur `computeMoteur()`, résultats reproduits intégralement en §8 (non committé, comme
pour l'audit transversal).

---

## 3. Audit complet de `capaciteScores`

### Cartographie DONNÉES → TFM/VAR_REL3 → calcul → `capaciteScores` → affichage

| Étape | Fichier:ligne | Fonction/variable | Rôle | Qualité(s) concernée(s) | Statut produit | Affiché où |
|---|---|---|---|---|---|---|
| 1 | `index.html:4009` | `VAR_REL3[testKey_kpiKey].measures`/`.estimates` | Table brute variable→qualité, poids `Determinante`/`Majeure`/`Moderee`/`Mineure` | 9 libellés (voir §3 tableau ci-dessous) | — | interne |
| 2 | `index.html:4070` | `computeQualityStatus(qualityName,testData,pop,age)` | Parcourt les 283 variables, retient celles dont `measures`/`.estimates` pointent vers `qualityName` (égalité stricte de chaîne), pondère par `POIDS_RANK`, moyenne pondérée des statuts bruts (`kpiStatus`) | Une qualité à la fois | `vert`/`jaune`/`orange`/`rouge`/`null` | interne |
| 3 | `index.html:4012` | `CAPACITES_DATA` | Table QUALITÉ→CAPACITÉ (Saut/Accélération/Réception/CoD), pondérée | Force maximale, Propulsion, Explosivité, Réactivité, Contrôle moteur, Absorption, Stabilisation, Puissance | — | interne |
| 4 | `index.html:4089` | `computeCapaciteStatus(capKey,testData,pop,age)` | Appelle `computeQualityStatus` pour chaque qualité contributrice d'une sous-capacité, moyenne pondérée | Toutes les qualités de `CAPACITES_DATA` | `vert`/`jaune`/`orange`/`rouge`/`null` par sous-capacité | interne |
| 5 | `index.html:5977-5979` | `qualityScores` (dans `computeMoteur()`) | `computeQualityStatus` appelé pour 9 libellés fixes | `['Force maximale','Explosivité','Puissance','Réactivité','Propulsion','Absorption','Stabilisation','Contrôle moteur','Résistance neuromusculaire']` | objet `{qualité: statut}` | **Calculé, jamais rendu — mort à l'affichage** (aucune occurrence de `.qualityScores` en dehors de son calcul) |
| 6 | `index.html:5981-5982` | `capaciteScores` (dans `computeMoteur()`) | `computeCapaciteStatus` pour chacune des 4 capacités | Idem, via `CAPACITES_DATA` | objet `{capacité: {label, sousCapacites:[...]}}` | **Live** |
| 7 | `index.html:4106-4122` | `capaciteHTML(capResult)` | Rendu HTML : ✓/✗ par qualité contributrice, coloré par son statut | idem | — | **Onglet `'capacites'` (`ExpertView`, `index.html:8312-8322`), on-screen uniquement — pas dans le PDF** |

### Toutes les fonctions qui lisent `capaciteScores`

Une seule, confirmée par grep exhaustif (`res.capaciteScores` n'apparaît qu'à cet endroit) :
`ExpertView`, onglet `'capacites'` (`index.html:8315`). **`capaciteScores` n'est lu ni par
`buildSportifReport`, ni par `buildExpertReport`, ni par `AnalyseView`, ni par `HistoriqueView`.**
Le PDF n'est donc pas exposé à ce mécanisme précis — seul l'écran l'est, dans un onglet dédié de la
vue Expert.

---

## 4. Audit de `hypothese`

### Cartographie DONNÉES → TFM → `hypothese`/`contributeurPrincipal` → narration → PDF/UI

```
tSt (statuts bruts par test, kpiStatus/applyThr)
   → TFM[testKey][functionKey]  (poids 1-3, index.html:750)
   → contrib = SYSTEMS.filter(sys => un test de ce système a TFM ≥2 pour cette fonction
                                       ET un statut non-vert)
                       .filter(s => sysSc[s] non-vert)                    (index.html:5954-5956)
   → main = contrib[0]  (PREMIER élément trouvé dans l'ordre déclaratif de SYSTEMS,
                          PAS un classement par sévérité — index.html:743)
   → contributeurPrincipal = main
   → hypothese = HYPO[fonction](main)     (index.html:5950, 5959, 5970)
   → rendu : buildSportifReport (PDF athlète), buildExpertReport (PDF expert),
             AnalyseView (écran), ExpertView onglet 'hypotheses' (écran)
```

### Variables et qualités utilisées

- **Variable de sélection** : `TFM[testKey][fk]` uniquement — jamais `VAR_REL3`, jamais
  `hypXxx01.explanatoryEvidence`.
- **Qualité concernée** : les 10 `FUNCTIONS`, sans exclusion — `HYPO` définit une phrase pour
  chacune, y compris Contrôle Frontal et Contrôle Sensoriel (qui n'ont aucun moteur HYP).
- **`priorities` lui-même EST gaté par HYP** (fait important, à ne pas perdre) : `deficits =
  FUNCTIONS.filter(fn => fSc[fn].status==='rouge'||'orange')` (`index.html:5952`) — depuis la
  mission de normalisation, `fSc[fn].status` pour les 8 qualités HYP **est** `hypXxx01.status`. Une
  qualité que HYP considère `non_determinable` (`status:null`) **n'entre jamais dans `priorities`**,
  donc **n'a jamais de champ `hypothese` généré** — vérifié empiriquement (§8, CAS 1/2 : Puissance
  `non_determinable` n'apparaît dans aucune `priorities`).
- **Ce qui N'EST PAS gaté par HYP** : une fois qu'une qualité **est** dans `priorities` (parce que
  HYP l'a confirmée rouge/orange), le `contributeurPrincipal`/`hypothese` qui l'accompagne **ignore
  totalement** `state`/`support`/`convergence`/`explanatoryEvidence` de son propre moteur HYP — il
  cite un **système anatomique** (muscle/structure), sélectionné uniquement par poids `TFM`.
- **`HYP_QUALITY_RELATIONS` n'est jamais consulté par ce mécanisme** — c'est un système disjoint de
  celui utilisé par `buildMultiQualityNarrative`/CSM.
- **Le système peut-il produire une hypothèse sans preuve HYP ?** Pour la qualité elle-même : non
  (gate `priorities` en amont). **Pour le "contributeur" cité dans le texte : oui** — rien
  n'exige que ce système apparaisse dans `hypXxx01.explanatoryEvidence`. Démontré concrètement en
  §10 : `knee_ext` porte un poids `TFM.force=3` (le poids maximal) alors que
  `HYP_VARIABLE_MATRIX.md` (Partie 1) le classe **`EP`** (explicatif physiologique) — **pas
  diagnostique** — pour la qualité Force dans le moteur HYP-FOR-01 lui-même. Le poids `TFM` maximal
  et le rôle HYP réel divergent structurellement pour ce test précis.

### Occurrences de `contributeurPrincipal` au-delà de `hypothese`

Une chaîne supplémentaire, non mentionnée dans l'audit précédent : `contributeurPrincipal` alimente
aussi `muscleLsiFor(p.contributeurPrincipal)` (`index.html:6377-6389`, appelé `:6603-6606` et
`:6734-6736` dans `buildSportifReport`) pour produire le **critère de sortie RTP** affiché dans le
PDF athlète (`sortieTxt`, ex. *"LSI Quadriceps ≥ 95 %"*) — un objectif de retour au sport
entièrement dérivé du système TFM sélectionné, jamais vérifié par rapport aux preuves HYP de la
qualité concernée.

---

## 5. Audit de `contributeurPrincipal` — mécanisme de sélection

Code exact (`index.html:5954-5956`) :

```js
var contrib = SYSTEMS.filter(function(sys){
  return (SYSTEM_TESTS[sys]||[]).some(function(t){
    return effectiveTFMWeight(t,fk)>=2 && tSt[t] && tSt[t]!=='vert';
  });
}).filter(function(s){ return sysSc[s] && sysSc[s]!=='vert'; });
var main = contrib[0] || null;
```

**Réponse à la question fondamentale de la mission (Partie 10)** : le système ne choisit pas le
contributeur au score TFM le plus élevé parmi les candidats — il prend le **premier élément qui
satisfait le filtre, dans l'ordre déclaratif fixe de `SYSTEMS`** (`'Quadriceps'`,
`'Ischio-jambiers'`, `'Fléchisseurs de hanche'`, ... `index.html:743`). C'est en réalité **pire que
"le TFM le plus élevé"** du point de vue de la rigueur clinique : c'est un **ordre alphabétique/
déclaratif arbitraire** parmi les systèmes qui franchissent un seuil binaire (`TFM≥2` ET non-vert),
sans aucune pondération de sévérité entre eux. Deux patients avec des profils de déficit identiques
sauf sur l'ordre de saisie des tests obtiendraient potentiellement le même `contributeurPrincipal`
(l'ordre `SYSTEMS` est fixe, indépendant des données), mais deux systèmes également déficitaires ne
sont jamais départagés par sévérité réelle — seul celui qui apparaît en premier dans `SYSTEMS` est
retenu, l'autre disparaît silencieusement de la narration.

---

## 6. Autres consommateurs TFM à conclusion clinique — inventaire complémentaire

Au-delà de `capaciteScores` et `hypothese`/`contributeurPrincipal`, déjà couverts :

- **`sortieTxt`/critère RTP** (§4, via `muscleLsiFor`) — nouveau consommateur identifié dans cette
  mission, dérivé de `contributeurPrincipal`.
- **`tfmFallback`** (`fSc[fn].tfmFallback` pour les 8 qualités HYP) — **déjà neutralisé** par la
  mission de normalisation : conservé mais jamais affiché comme statut clinique. Pas un
  consommateur actif, mentionné ici uniquement pour confirmer qu'il ne s'ajoute pas à la liste.
- **`fSc['Contrôle Frontal']`/`fSc['Contrôle Sensoriel']`** — restent la sortie de la boucle
  générique TFM (§ boucle `5741-5762`) en permanence, **par construction, faute de moteur HYP** —
  ce n'est pas une divergence (il n'existe rien avec quoi diverger), mais ces deux qualités
  continuent de produire un statut affiché (`fSc[fn].status`) et priorisé
  (`priorities`/`hypothese`) sans jamais passer par HYP, aujourd'hui et pour l'avenir prévisible
  (cf. `DECISION_MEMO_CSM.md`, suspension maintenue).

---

## 7. Divergences HYP / TFM — matrice

| Qualité | HYP source de vérité (`state`/`status`) | `capaciteScores` (`computeQualityStatus`, TFM/VAR_REL3) | Peut diverger ? | Visible au praticien ? | Conséquence |
|---|---|---|---|---|---|
| Réactivité | `hypRea01.state`/`fSc.status` | `computeQualityStatus('Réactivité',...)` | Oui en théorie (variables `estimates`/`measures` distinctes) — **non observé dans les scénarios testés** (§8, CAS 1 : les deux restent `null`), car peu de variables `VAR_REL3` ciblent `'Réactivité'` avec l'orthographe accentuée exacte | Oui, onglet Capacités | Risque réel mais plus rare que pour Puissance/Explosivité/Absorption dans les scénarios testés |
| Absorption | `hypAbs01.niveau1`/`fSc.status` | `computeQualityStatus('Absorption',...)` | **Oui, observé** (§8 CAS 1/2/5 : HYP `non_determinable`, TFM `rouge`) | Oui, onglet Capacités | Le praticien peut voir "Absorption = rouge" dans Capacités alors que le moteur HYP-ABS-01 n'a produit aucune conclusion |
| Stabilisation | `hypSta01.state`/`fSc.status` | `computeQualityStatus('Stabilisation',...)` | Oui en théorie — non observé dans les scénarios testés (§8) | Oui, onglet Capacités | À surveiller, non démontré empiriquement ici |
| Puissance | `hypPui01.state`/`fSc.status` | `computeQualityStatus('Puissance',...)` | **Oui, observé et net** (§8 CAS 1/2/6 : HYP `non_determinable`, TFM `rouge`, notamment via `imtp_n`/`slimtp_n` qui "mesurent" Puissance en `Determinante` dans `VAR_REL3` — un test Force fait basculer un statut Puissance affiché) | Oui, onglet Capacités, 4 sous-capacités différentes simultanément | Divergence la plus forte et la plus reproductible de cet audit |
| Explosivité | `hypExp01.state`/`fSc.status` | `computeQualityStatus('Explosivité',...)` | **Oui, observé** (§8 CAS 1 : HYP `non_determinable`, TFM `rouge` via `cmj_peak_power`) | Oui, onglet Capacités | Même mécanisme que Puissance |

**Cas testés explicitement (Partie 2 de la mission)** :

- **HYP absent (`fSc[fn]` inexistant) mais TFM déficitaire** : non applicable aux 8 qualités HYP —
  `fSc[fn]` existe toujours pour elles (au minimum `status:null`) depuis la mission de
  normalisation ; ne s'observe que pour un test totalement hors `TFM` (aucun cas trouvé dans
  l'inventaire).
- **HYP `non_determinable` mais TFM `normal`** : possible en théorie (aucune variable `VAR_REL3`
  pertinente n'était déficitaire) — non contredit par les scénarios testés, cas "silencieux", sans
  conséquence visible.
- **HYP `non_determinable` mais TFM `déficitaire`** : ✅ **confirmé empiriquement à 3 reprises**
  (§8) — le cas le plus fréquent et le plus problématique.
- **HYP déficitaire et TFM déficitaire** : ✅ observé (§8 CAS 5, Force+Puissance) — cohérent, pas
  une divergence, mentionné pour complétude de la matrice demandée.

---

## 8. Cas de dérive clinique — preuves empiriques

Résultats réels de `computeMoteur()` (script jetable, extraction identique à `tests/*.test.js`,
non committé). `fSc.status` = statut affiché (HYP pour les 8 qualités concernées) ;
`computeQualityStatus` = statut TFM/VAR_REL3 sous-jacent à `capaciteScores`.

### CAS 1 — Réactivité HYP absente, mais un test à poids TFM `reactivite` existe (`cmj`, mauvaise valeur, aucune donnée `dj`/`sldj`)

```
Réactivité    | fSc.status(HYP)=null | HYP.state=absente (dataAvailable=false) | computeQualityStatus=null
Puissance     | fSc.status(HYP)=null | HYP.state=non_determinable              | computeQualityStatus=rouge
Explosivité   | fSc.status(HYP)=null | HYP.state=non_determinable              | computeQualityStatus=rouge
```

**Que voit le praticien ?** Dans l'onglet Fonctions : Puissance et Explosivité sans badge coloré
(statut `null`, honnête). Dans l'onglet Capacités : **9 lignes affichant "rouge"** pour Puissance et
Explosivité, réparties sur les 4 capacités (Saut, Accélération, Réception, Changement de direction)
— un praticien naviguant de l'onglet Fonctions à l'onglet Capacités verrait deux lectures
opposées de la même qualité pour le même bilan.

### CAS 2 — Puissance HYP `non_determinable` (aucune donnée `cmj`/`slcmj`), Force déficitaire (`imtp`/`slimtp`)

```
Force      | fSc.status(HYP)=rouge | HYP.state=retenue_faible   | computeQualityStatus=rouge   (cohérent)
Puissance  | fSc.status(HYP)=null  | HYP.state=non_determinable | computeQualityStatus=rouge   (DIVERGENT)
Absorption | fSc.status(HYP)=null  | HYP.state=non_determinable | computeQualityStatus=rouge   (DIVERGENT)
```

**Que voit le praticien ?** `priorities`/`hypothese` restent corrects : seule Force apparaît
(*"Le déficit de force semble compatible avec une altération des capacités de production de force
maximale."*) — Puissance n'est **pas** mentionnée dans "Priorité principale"/"Pourquoi ?" (bonne
nouvelle, ce canal reste gaté par HYP). **Mais l'onglet Capacités affiche "Puissance = rouge" et
"Absorption = rouge"** à plusieurs endroits — la cause directe, vérifiée dans `VAR_REL3` :
`imtp_n`/`slimtp_n` (des tests de Force) "mesurent" Puissance en poids `Determinante` et "estiment"
Absorption en `Mineure` — un test de Force fait donc directement basculer le badge Capacités de deux
autres qualités, sans qu'aucune donnée de saut (`cmj`/`slcmj`) n'ait jamais été fournie.

### CAS 3/4 — Force `non_determinable` (test `EP` seul, sans candidat diagnostique HYP), Puissance déficitaire, relation `Force→Puissance` documentée

```
Force     | fSc.status(HYP)=null  | HYP.state=non_determinable | (knee_ext fourni, TFM.force=3, mais rôle HYP = EP, pas diagnostique)
Puissance | fSc.status(HYP)=rouge | HYP.state=retenue_faible
priorities: #1 Puissance | contributeurPrincipal=null | hypothese="Les données de puissance sont compatibles avec une contribution importante des qualités force-vitesse."
```

**Le système peut-il encore écrire que Force explique Puissance ?** Non, dans ce scénario précis
`contributeurPrincipal` reste `null` (le système `'Quadriceps'` ne franchit pas le filtre
`sysSc!=='vert'` avec les données fournies) — mais ceci est **contingent aux données du scénario**,
pas garanti structurellement : le filtre de sélection (§5) ne vérifie **jamais** que le test
utilisé (`knee_ext`) est un candidat diagnostique HYP pour Force — il vérifie seulement
`TFM.knee_ext.force>=2` (poids réel : 3, maximal) et un statut non-vert. **Rien n'empêche
structurellement qu'un autre profil de données fasse émerger `'Quadriceps'` comme
`contributeurPrincipal` de Puissance alors que `hypFor01` reste `non_determinable`** — la garantie
observée ici tient à la configuration du scénario, pas à une règle du code qui l'interdirait.
`buildMultiQualityNarrative`/CSM, eux, l'interdisent structurellement (gate
`a.objectified&&b.objectified`, `AUDIT_RELATIONNEL_HYP_TFM_CSM.md` §9) — `hypothese`/
`contributeurPrincipal` n'ont pas cette garantie.

### CAS 5 — Force déficitaire ET Puissance déficitaire, relation HYP existante

```
Force     | fSc.status(HYP)=rouge | HYP.state=retenue_faible
Puissance | fSc.status(HYP)=rouge | HYP.state=retenue_faible
priorities:
  #1 Force     | hypothese="Le déficit de force semble compatible avec une altération des capacités de production de force maximale."
  #2 Puissance | hypothese="Les données de puissance sont compatibles avec une contribution importante des qualités force-vitesse."
```

**L'hypothèse explicative est-elle formulée correctement ?** Les deux phrases restent **séparées,
par qualité** — aucun lien explicite "Force explique Puissance" n'est construit par ce mécanisme
(`HYPO` ne connaît pas `HYP_QUALITY_RELATIONS`). C'est `buildMultiQualityNarrative` (mission de
normalisation, hors `priorities[i].hypothese`) qui produit la phrase inter-qualités correcte
("hypothèse explicative... sans en établir la cause") dans `conclusion`/`consequences`. **Les deux
mécanismes coexistent aujourd'hui, sans se contredire dans ce cas précis, mais sans non plus être
unifiés** — le rapport contient à la fois la phrase prudente inter-qualités
(`buildMultiQualityNarrative`) et deux phrases mono-qualité non gatées par `HYP_QUALITY_RELATIONS`
(`hypothese`).

### CAS 6 — Force normale, Puissance déficitaire, relation TFM `Force→Puissance`

Équivalent au CAS 3/4 avec Force réellement `absente` (normale) plutôt que `non_determinable` :
même mécanisme de sélection (§5), même absence de garantie structurelle que `contributeurPrincipal`
ne puisse jamais citer un système lié à Force. Aucun scénario testé n'a fait apparaître ce cas
concrètement, mais la garantie manque **structurellement**, pas seulement empiriquement — voir §9.

---

## 9. Analyse `non_determinable`

**Constat central, confirmé par les CAS 1/2 (§8)** : la règle *"non_determinable ≠ normal ≠
déficitaire"* est **respectée à la lettre par `fSc[fn].status`** (reste `null`, jamais forcé) mais
**activement violée par `capaciteScores`** dans son rôle d'affichage : une qualité que HYP déclare
`non_determinable` peut être présentée, dans l'onglet Capacités, avec un badge **"rouge"** —
c'est-à-dire non pas "normal" (ce que la règle interdit explicitement) mais **son inverse tout aussi
problématique : un déficit affirmé sans aucune preuve diagnostique HYP réelle**. C'est exactement le
même type de violation que celle déjà démontrée par `AUDIT_TRANSVERSAL_HYP_V1.md` §6 pour l'ancien
repli TFM (`fSc[fn].status`, corrigé depuis) — sauf que `capaciteScores` n'a **jamais** été couvert
par cette correction, parce qu'il s'agit d'un pipeline de calcul entièrement différent
(`computeQualityStatus`/`VAR_REL3`, pas la boucle générique `TFM` corrigée en mission de
normalisation).

**Ce que `capaciteScores` peut légitimement rester** : une donnée exploratoire/secondaire, à
condition d'être clairement reconnaissable comme telle (nom, position, couleur/style distincts d'un
badge diagnostique). Aujourd'hui, visuellement, ✓/✗ colorés dans l'onglet Capacités sont
indiscernables, dans leur présentation, d'une conclusion clinique — rien dans l'UI actuelle ne
signale au praticien que cette source est différente de `fSc[fn].status`.

---

## 10. Architecture cible (rappel, non modifiée dans cette mission)

```
HYP  (8 moteurs) ─────► DIAGNOSTIC (status clinique visible, source unique de vérité)
                              │
TFM / VAR_REL3 ───────► RELATIONS / INFORMATION SECONDAIRE (jamais affichée comme diagnostic)
                              │
HYP-CSM-01 ───────────► SYNTHÈSE CLINIQUE (consomme HYP + HYP_QUALITY_RELATIONS uniquement)
                              │
UI / PDF ─────────────► UNE SEULE CONCLUSION CLINIQUE COHÉRENTE PAR QUALITÉ
```

**Ce que CSM peut déjà remplacer** (fonction pure, non modifiée dans cette mission, comportement
vérifié par `tests/hypClinicalSynthesis01.test.js` et par `AUDIT_RELATIONNEL_HYP_TFM_CSM.md` §8/§9) :
la narration inter-qualités **prudente** (association vs hypothèse explicative vs non
déterminable) — c'est-à-dire, conceptuellement, la partie de `buildMultiQualityNarrative` qui existe
déjà, en mieux structuré (sortie typée plutôt que 2 chaînes de texte).

**Ce que CSM ne peut PAS encore remplacer** :
- `capaciteScores` — granularité différente (capacité fonctionnelle composite, pas qualité seule) ;
  CSM n'a aucune notion de "Saut"/"Accélération"/"Réception"/"Changement de direction".
- `hypothese`/`contributeurPrincipal` — CSM ne désigne jamais de système anatomique responsable
  (hors périmètre par construction : il ne lit que `functionScores`, jamais `SYSTEM_TESTS`/`TFM`) ;
  remplacer ce texte demanderait soit d'accepter sa disparition (le praticien perd la mention
  "quel muscle/structure"), soit de construire un mécanisme séparé, gouverné par HYP
  (`explanatoryEvidence` de chaque moteur plutôt que `TFM`), qui n'existe pas aujourd'hui.
- `sortieTxt`/critère RTP LSI — dépend de `contributeurPrincipal`, donc hérite du même manque.

**Informations manquantes pour une migration complète** : aucun des 8 moteurs HYP n'expose
aujourd'hui de mapping "quel système anatomique corrobore ce diagnostic" de façon structurée et
homogène (`explanatoryEvidence` existe mais son schéma diffère d'un moteur à l'autre, cf.
`AUDIT_TRANSVERSAL_HYP_V1.md` §7 sur l'hétérogénéité déjà notée pour Absorption V2) — un
remplacement propre de `contributeurPrincipal` par une source HYP-gouvernée demanderait d'abord de
normaliser cette exposition, ce qui est un travail en soi, pas un simple branchement.

**Consommateurs qui devront être migrés** : voir cartographie complète §11.

---

## 11. Cartographie des consommateurs

| Consommateur | Source actuelle | Type | Visible ? | HYP disponible pour cette qualité ? | Migration nécessaire ? |
|---|---|---|---|---|---|
| Onglet **Capacités** (`ExpertView`, `:8312-8322`) | `capaciteScores` (`computeQualityStatus`/`VAR_REL3`) | Badge ✓/✗ par qualité contributrice | Oui, écran uniquement | Oui pour Réactivité/Absorption/Stabilisation/Puissance/Explosivité — non pour Force maximale/Propulsion/Contrôle moteur/Résistance neuromusculaire (pas de nom HYP correspondant) | **Oui** — au minimum, distinguer visuellement des 5 qualités qui ont un homonyme HYP |
| "Priorité principale" (kpiCard, `buildSportifReport` `:6516/6521/6529`, `AnalyseView` `:7779-7780`) | `priorities[0].hypothese`/`.contributeurPrincipal` | Titre + sous-texte, 1ʳᵉ page du rapport | Oui, PDF + écran | Oui (qualité elle-même gatée par HYP) mais **le contributeur cité, non** | **Oui** — le badge/titre est HYP-honnête, le texte en dessous ne l'est pas |
| "🔍 Pourquoi ?" (`buildSportifReport` `:6614`) | `p.hypothese` | Texte explicatif par priorité | Oui, PDF | Qualité oui, contributeur non | **Oui** |
| Fiches priorités (`buildExpertReport` `:6911`) | `p.hypothese`/`.contributeurPrincipal` | Liste imprimée | Oui, PDF expert | Idem | **Oui** |
| Onglet **Hypothèses** (`ExpertView` `:8324`) | `p.hypothese`/`.contributeurPrincipal` | Cartes | Oui, écran | Idem | **Oui** |
| Critère de sortie RTP / `sortieTxt` (`buildSportifReport` `:6603-6606,6734-6736`) | `muscleLsiFor(p.contributeurPrincipal)` | Texte d'objectif RTP | Oui, PDF | Dérive de `contributeurPrincipal`, donc non | **Oui**, une fois `contributeurPrincipal` traité |
| `qualityScores` (`:5977-5979`) | `computeQualityStatus` | — | **Non, jamais rendu** | — | Non urgent — mort à l'affichage, mais à traiter en même temps que `capaciteScores` par cohérence de code |
| `compensations` (`priorities[i].compensations`, `SYS_COMPENSATIONS`) | TFM (`main`) | — | **Non, jamais rendu** | — | Non urgent — latent |
| `rootCauses`/`rootCausesHTML` (`:4034/4051`) | `VAR_REL3.explainedBy` | — | **Non, `rootCausesHTML` jamais appelé** | — | Non urgent — latent |
| Onglet **Fonctions** (`:8296`) | `fSc[f].status` | Badge | Oui | **Déjà HYP** (mission de normalisation) | Non — déjà migré |
| Onglet **Variables** (`:8298-8311`) | `VAR_REL3` via `varRelHTML` | Détail par variable, transparence `measuresSource` | Oui, écran | N/A — affiché explicitement comme donnée de calcul, pas comme diagnostic | Non — déjà correctement étiqueté comme secondaire |
| Onglet **Raisonnement** (`:8327-8330`) | `STR_QUAL_DETAIL` | Contribution/Confiance/Spécificité/Sens | Oui, écran | N/A — déjà étiqueté "à valider par l'équipe clinique" dans le code | Non — déjà correctement étiqueté |
| Export (CSV/JSON éventuel) | Non trouvé — aucune fonction d'export de `capaciteScores`/`hypothese` identifiée dans le code | — | — | — | N/A |

---

## 12. Migration sans perte d'information — principe appliqué à chaque mécanisme

**`capaciteScores`** : l'information (moyenne pondérée VAR_REL3 par capacité fonctionnelle) reste
utile *en tant que telle* — elle répond à une question différente de HYP ("qu'est-ce que
l'ensemble des tests, y compris ceux hors diagnostic HYP, suggère à propos de cette capacité
composite ?"). Elle ne doit simplement plus **se substituer visuellement** à `fSc[qualité].status`
pour les 5 qualités homonymes. Proposition de principe (non appliquée, §13) : conserver le calcul
tel quel, distinguer sa présentation.

**`hypothese`/`contributeurPrincipal`** : l'information "quel système anatomique contribue" reste
cliniquement utile et n'existe nulle part ailleurs dans le système (HYP ne désigne jamais de
système). Elle ne doit plus être formulée comme si elle provenait d'une analyse HYP, et ne doit
jamais apparaître pour une qualité que HYP n'a pas confirmée (déjà le cas aujourd'hui, à préserver).

---

## 13. Proposition technique (architecture de migration minimale — non appliquée)

| Mécanisme | Option | Justification |
|---|---|---|
| `capaciteScores`/`qualityScores`/`computeQualityStatus` | **1. Conserver** le calcul, **2. repositionner** sa présentation | Aucune perte de la richesse VAR_REL3 (`AUDIT_RELATIONNEL_HYP_TFM_CSM.md` §14) ; renommer conceptuellement le résultat affiché en `tfmCapacityScore` (ou équivalent) et l'étiqueter explicitement "information TFM secondaire, non diagnostique" dans l'onglet Capacités — en particulier pour les 5 qualités homonymes de HYP |
| `hypothese` (texte narratif) | **2. Repositionner** | Garder la mention du système anatomique (utile), mais la sortir du champ nommé `hypothese` qui suggère une conclusion clinique gouvernée ; envisager un préfixe explicite ("Élément TFM associé : ...") distinct du statut HYP affiché juste au-dessus |
| `contributeurPrincipal` | **2. Repositionner**, avec correction de la règle de sélection | Ne plus utiliser un simple "premier candidat dans l'ordre `SYSTEMS`" — au minimum documenter cette limite au praticien tant qu'aucune repriorisation par sévérité n'est développée ; ne jamais l'utiliser seul comme preuve d'un lien causal avec la qualité |
| `sortieTxt`/critère RTP (`muscleLsiFor`) | **1. Conserver** | Objectif RTP basé sur un LSI mesuré reste une donnée factuelle utile (asymétrie réelle) — le risque n'est pas la mesure elle-même mais son habillage narratif hérité de `contributeurPrincipal` |
| `buildMultiQualityNarrative`/`HYP_QUALITY_RELATIONS` (inter-qualités) | **Déjà migré** (mission de normalisation) | Aucune action |
| CSM (`computeHypClinicalSynthesis01`) | **4. Cible du remplacement futur** pour la narration inter-qualités, une fois branché | Ne remplace ni `capaciteScores` ni `contributeurPrincipal` (granularités différentes, §10) |
| `qualityScores` (mort), `compensations` (mort), `rootCausesHTML` (mort) | **1. Conserver tel quel**, aucune urgence | Non affichés — aucun risque clinique actif, à traiter par cohérence de code seulement si `computeQualityStatus`/`VAR_REL3.explainedBy` sont retravaillés pour d'autres raisons |

**Aucune suppression proposée pour aucun mécanisme** — conforme à l'interdiction absolue de la
mission.

---

## 14. Collision d'identifiant `HYP-CSM-01` (rappel consolidé)

- **Identifiant historique** : `HYP-CSM-01` = « Contrôle Sensori-Moteur », 9ᵉ qualité candidate,
  **suspendue** en Phase C (`HYP_ARCHITECTURE_FREEZE.md` point 1, ligne 426 ; analyse de
  réactivation dans `DECISION_MEMO_CSM.md`, recommandation : maintien de la suspension).
- **Identifiant actuel** : `HYP-CSM-01` = moteur de synthèse clinique multi-qualités (`Clinical
  Synthesis / Multi-Quality`), livré commit `65ffd6b`, `csmId:'HYP-CSM-01'` dans le code
  (`index.html`, post-commit), documenté dans `IMPLEMENTATION_HYP_CSM01.md`.
- **Fichiers concernés** : `index.html` (`HYP_CSM_QUALITIES`, `computeHypClinicalSynthesis01`,
  `csmId`), `IMPLEMENTATION_HYP_CSM01.md`, `tests/hypClinicalSynthesis01.test.js`,
  `AUDIT_RELATIONNEL_HYP_TFM_CSM.md` (qui documente déjà la collision), le présent document.
- **Risque de collision** : inchangé depuis le précédent audit — si « Contrôle Sensori-Moteur » est
  un jour réactivée, elle porterait le même identifiant qu'un moteur déjà en production, sans
  rapport clinique.
- **Proposition à évaluer, non appliquée** : conserver `HYP-CSM-01` pour la synthèse
  multi-qualités (déjà en production, coût de renommage non nul), réserver un nouvel identifiant
  (ex. `HYP-CSMOT-01` ou équivalent) à « Contrôle Sensori-Moteur » si elle est un jour réactivée.
  **Décision explicitement laissée au praticien** — non tranchée ici, comme demandé.

---

## 15. Tests nécessaires pour la future migration (proposés, non écrits)

1. **HYP prévaut sur `capaciteScores`** : pour les 5 qualités homonymes, si `fSc[q].status` est
   non-null, l'affichage clinique principal doit toujours refléter `fSc[q].status`, jamais
   `computeQualityStatus(q,...)`.
2. **`capaciteScores` ne peut plus écraser `fSc.status`** : test de non-régression garantissant
   qu'aucun code futur ne réassigne `fSc[q].status = capaciteScores[...]` ou équivalent.
3. **`non_determinable` reste `non_determinable`** : pour chaque qualité HYP à `null`, vérifier que
   la présentation choisie (quelle qu'elle soit après migration) ne produit ni "vert/normal" ni un
   badge de sévérité (`orange`/`rouge`) sans mention explicite "non déterminable".
4. **TFM ne peut pas créer un déficit absent de HYP** : reproduire les CAS 1/2/6 de ce document
   comme tests automatisés — `fSc[q].status===null` doit rester vrai quel que soit le statut
   `computeQualityStatus`/`capaciteScores` correspondant.
5. **TFM peut continuer à fournir une information secondaire** : test positif — vérifier que
   `computeQualityStatus`/`capaciteScores` restent calculables et non vidés par la migration (pas
   de suppression, seulement un repositionnement de présentation).
6. **`contributeurPrincipal` ne crée pas de causalité automatique** : vérifier qu'aucun texte généré
   ne contient de formulation causale forte ("est responsable de", "entraîne") associée à
   `contributeurPrincipal` — même type de garde-fou regex que celui déjà utilisé pour CSM
   (`AUDIT_RELATIONNEL_HYP_TFM_CSM.md` §9).
7. **CSM devient la source de la synthèse inter-qualités** : test de non-régression garantissant que
   toute narration inter-qualités affichée provient de `buildMultiQualityNarrative`/CSM, jamais
   d'une reconstruction ad hoc parallèle.
8. **Aucune relation TFM n'est supprimée** : `git diff --stat` sur `TFM`/`VAR_REL3`/
   `CAPACITES_DATA` doit rester vide lors de toute mission de migration future qui ne les concerne
   pas explicitement.
9. **Aucune règle HYP n'est modifiée** : identique aux gardes déjà en place pour les missions
   précédentes (`diff --stat` sur les 8 `computeHypXxx01`).
10. **UI/PDF affichent une seule conclusion clinique cohérente** : test bout-en-bout (scénario
    CAS 1/2 de ce document) vérifiant qu'aucun écran ni PDF n'affiche simultanément deux statuts
    contradictoires pour la même qualité du même bilan.

---

## 16. Décisions restant à prendre (récapitulatif, aucune tranchée ici)

1. Collision `HYP-CSM-01` (§14) — renommer le moteur de synthèse déjà livré, ou réserver un
   identifiant différent à « Contrôle Sensori-Moteur ».
2. Nom/namespace cible pour la donnée `capaciteScores` repositionnée (`tfmFallback`,
   `tfmCapacityScore`, autre — §7 de la mission, explicitement non choisi ici).
3. Faut-il conserver `contributeurPrincipal` sous sa forme actuelle (premier candidat dans l'ordre
   `SYSTEMS`) ou investir dans une repriorisation par sévérité réelle avant migration ? Question
   ouverte, distincte de la question de gouvernance HYP elle-même.
4. Faut-il un nouveau champ, structuré et gouverné par HYP (`explanatoryEvidence` harmonisé entre
   les 8 moteurs), pour remplacer à terme la fonction informative de `contributeurPrincipal` — ou
   accepter que cette information reste, explicitement, une donnée TFM secondaire non gouvernée par
   HYP ?
5. Faut-il traiter `qualityScores`/`compensations`/`rootCausesHTML` (morts à l'affichage) dans la
   même mission que `capaciteScores`/`hypothese`, ou les laisser latents indéfiniment ?

---

## 17. Conclusion

**Ce qui est déjà correctement gouverné** : `fSc[fn].status` pour les 8 qualités HYP (mission de
normalisation), le gate `priorities` sur `fSc.status` (empêche une qualité `non_determinable`
d'apparaître dans "Priorité principale"), `buildMultiQualityNarrative` (narration inter-qualités
prudente), les onglets Variables/Raisonnement (déjà étiquetés comme données secondaires non
diagnostiques).

**Ce qui reste TFM-driven et non gouverné par HYP, avec divergence démontrée empiriquement** :
`capaciteScores` (onglet Capacités, en direct, pour 5 qualités homonymes de HYP — divergence
observée et reproductible pour Puissance/Explosivité/Absorption) et le texte
`contributeurPrincipal`/critère RTP associé (`sortieTxt`) qui en dérive — sans divergence de badge
observée dans les scénarios testés, mais sans garantie structurelle qui l'empêcherait.

**Aucun de ces deux mécanismes n'invente de diagnostic pour une qualité que HYP n'a pas déjà
confirmée** (le gate `priorities`→`fSc.status` protège ce point précis) — la divergence documentée
ici est plus étroite que ce qu'un lecteur pressé pourrait craindre, mais elle est réelle,
reproductible et déjà visible à l'écran aujourd'hui pour `capaciteScores`.

### Décision

**B — MIGRATION PARTIELLE.**

Justification : la migration ne peut pas être "immédiate" (option A) car aucun des deux mécanismes
n'a d'équivalent HYP-gouverné prêt à le remplacer intégralement sans perte d'information
(`capaciteScores` répond à une question de granularité différente — capacité composite, pas
qualité seule ; `contributeurPrincipal` désigne un système anatomique que HYP ne désigne jamais).
Mais elle n'exige pas non plus un nouvel audit complet (option C) : le périmètre est maintenant
précisément cartographié (§11), les divergences sont démontrées et reproductibles (§8), et une
partie du système (`priorities`→`fSc.status`, `buildMultiQualityNarrative`) est **déjà** migrée et
fonctionne correctement comme garde-fou en amont. Ce qui reste à faire est un travail de
**repositionnement de présentation** (distinguer visuellement TFM-secondaire de HYP-diagnostic),
pas une nouvelle campagne d'investigation — d'où **migration partielle**, prête à être planifiée dès
que le praticien aura tranché les points ouverts du §16.

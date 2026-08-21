# Audit de cohérence narrative — CSM vs anciennes narrations

## Statut de ce document

Audit **documentaire, de lecture de code et d'exécution empirique uniquement** (`computeMoteur()`
rejoué directement via un script jetable non committé, plus une vérification en direct dans le
navigateur — app servie localement, React chargé depuis une copie locale car le CDN est bloqué par
la politique réseau de cet environnement, aucune autre différence). **Aucune ligne de `index.html`
n'a été modifiée.** Aucun moteur HYP, `computeHypClinicalSynthesis01`, `HYP_QUALITY_RELATIONS`,
`TFM`, `VAR_REL3`, `capaciteScores`, `priorities`, `causalSteps`, `hypothese`,
`contributeurPrincipal`, l'UI ou le PDF n'ont été touchés.

**Constat central de cet audit, à lire avant tout le reste** : en testant les cas mandatés, un
**bug pré-existant, réel et à impact clinique direct** a été découvert dans le mécanisme de tri de
`priorities` (`index.html:6022`) — indépendant de tout travail des 4 missions précédentes (HYP,
migration TFM, branchement CSM). Il est documenté en détail au §5/§8 CAS 7/§16, et détermine la
conclusion finale de cet audit (§22).

---

## 1. Objectif

Déterminer si, pour un même patient, toutes les sorties narratives de Kinexus (CSM,
`priorities`/`hypothese`/`contributeurPrincipal`, `causalSteps`, onglets UI, sections PDF)
racontent une histoire clinique cohérente — ou si certaines peuvent diverger, se contredire, ou
induire le praticien en erreur.

---

## 2. Architecture actuelle

```
8 HYP ──► fSc (functionScores, source de vérité diagnostique, gouvernée par HYP depuis la
           migration de normalisation)
   │
   ├──► computeHypClinicalSynthesis01(fSc) ──► clinicalSynthesis ──► UI (onglet "Synthèse
   │                                                                  clinique") / PDF (section 4)
   │
   └──► priorities (deficits=FUNCTIONS.filter(rouge/orange).sort(...).slice(0,3), TFM pour
         contributeurPrincipal/hypothese, gouverné par le rôle HYP réel depuis la migration TFM)
              │
              ├──► HYPO[fn](main) ──► "hypothese" ──► "Pourquoi ?"/onglet Hypothèses
              ├──► buildMultiQualityNarrative(pri) ──► conclusion/consequences/causalSteps ──►
              │     "Chaîne causale"/"Avis clinique" (résumé PDF, AnalyseView)
              └──► orientation/deficitTests/okTests/sortieTxt ──► "Priorités d'intervention"/RTP
```

Deux pipelines narratifs **distincts, tous deux dérivés de `fSc`, mais avec des logiques de
sélection différentes** : CSM (flat, toutes les qualités objectivées, jamais de hiérarchie) et
`priorities` (top-3 seulement, hiérarchisé par sévérité — c'est précisément ce tri qui s'avère
buggé, §5).

---

## 3. Inventaire des narrations

| Sortie | Fonction | Source (fichier:ligne) | Données utilisées | HYP consulté ? | TFM consulté ? | UI/PDF | Formulation |
|---|---|---|---|---|---|---|---|
| `clinicalSynthesis` (`computeHypClinicalSynthesis01`) | Synthèse multi-qualités | `index.html` (bloc CSM, avant `computeMoteur`) | `fSc` uniquement | Oui, exclusivement | Non | Onglet "Synthèse clinique" (`:8388`+), PDF sportif section 4 (`:6712`+), PDF expert (`:7007`+) | "Un déficit est objectivé pour...", "hypothèse explicative possible... sans en établir la cause", "non déterminable... jamais équivaut à normal" |
| `priorities[i].status` | Statut de la qualité priorisée | `deficits` (`:6022`) + `fSc[fn].status` | `fSc` | Oui (le statut lui-même) | — | Badges "Priorité principale"/onglet Hypothèses/Orientations | Couleur vert/jaune/orange/rouge |
| `priorities[i].hypothese` | Texte "Pourquoi ?" | `HYPO[fn](main)` ou `tfmSecondaryContributorNote` (`:6058`+) | `TFM` (sélection du contributeur), gouverné par rôle HYP depuis la migration | Oui, pour le gate du contributeur | Oui, pour la sélection elle-même | "🔍 Pourquoi ?" (PDF sportif `:6774`+), fiches (PDF expert), onglet Hypothèses | "Le déficit de X semble compatible avec une altération de..." |
| `priorities[i].contributeurPrincipal` | Système anatomique associé | `contribGated` (`:6031`) | `TFM`/`SYSTEM_TESTS`, gate rôle HYP | Oui (gate) | Oui (sélection) | "Priorité principale" (titre), critère de sortie RTP (`muscleLsiFor`) | Nom de système (ex. "Quadriceps") |
| `causalSteps`/`conclusion`/`consequences` (`buildMultiQualityNarrative`) | Narration inter-qualités (top-2 seulement) | `index.html` (juste après `HYP_QUALITY_RELATIONS`) | `pri[0]`/`pri[1]` (donc `priorities`, **hérite de son tri**) | Oui (gate association/hypothèse explicative via `HYP_QUALITY_RELATIONS`) | Indirectement (via `priorities`) | "Chaîne causale principale" (PDF sportif, page 1 section 2 "Avis clinique"), AnalyseView écran | "Le bilan met en évidence des déficits concordants de X et de Y...", "hypothèse explicative... sans en établir la cause" |
| `priorities[i].orientation`/`deficitTests`/`okTests`/`sortieTxt` | Plan de prise en charge | `ORI[fn]`, `TFM`, `muscleLsiFor` | `TFM` | Non (texte fixe par qualité) | Oui | "Priorités d'intervention" (PDF), onglet Orientations | Recommandations génériques par qualité |
| Onglet **Fonctions** / tableau "Fonctions évaluées" | Diagnostic détaillé par qualité | `fSc[fn].status` | `fSc` | Oui, exclusivement | Non | Écran + PDF expert | Badge coloré, sans texte narratif |
| Onglet **Capacités** | Information TFM secondaire | `capaciteScores` (gouverné par `fSc` depuis la migration TFM) | `VAR_REL3`/`TFM`, gate HYP | Oui (gate) | Oui (calcul) | Écran uniquement | Badge + mention "Information relationnelle TFM" si divergence |
| "01 · Synthèse globale" (Retour au sport/Risque global/Priorité principale/Évolution) | Cartes de synthèse rapide | `rtpStatus`, `priorities[0]` | `fSc`/`TFM` | Oui (indirect, via `priorities`) | Oui (indirect) | Écran (AnalyseView), en tête du PDF | "AUCUNE"/nom de qualité, "FAIBLE"/"ÉLEVÉ" |
| "03 · Synthèse clinique" (Points forts/Points limitants, AnalyseView écran) | **Nom identique à l'onglet CSM, contenu différent** | `deficits` (même tri que `priorities`, `:7900`+ zone AnalyseView) | `fSc` | Oui | Non | Écran uniquement (AnalyseView, pas le nouvel onglet Expert) | Liste de qualités avec icône ⚠/✓ |

**Point de vigilance immédiat, avant même le fond** : le libellé **"Synthèse clinique" existe
maintenant à DEUX endroits différents avec deux contenus différents** — la carte "03 · SYNTHÈSE
CLINIQUE" de l'écran Analyse (points forts/points limitants, dérivée de `deficits`, **donc soumise
au bug §5**) et le nouvel onglet Expert "Synthèse clinique" (dérivé de `clinicalSynthesis`,
correct). Un même nom pour deux sources différentes est, en soi, un facteur de confusion
documenté au §15/§16.

---

## 4. Source de vérité de chaque sortie

| Type d'information | Source de vérité actuelle | Conforme à la règle cible ? |
|---|---|---|
| Diagnostic par qualité (`state`/`status`/`support`/`convergence`) | `fSc[quality]` (HYP) | ✅ Oui, depuis la mission de normalisation |
| Synthèse multi-qualités (quelles qualités objectivées, quelles relations) | `clinicalSynthesis` (CSM) | ✅ Oui, depuis le branchement |
| **Quelle qualité est LA priorité / apparaît dans "Chaîne causale"** | `priorities` (tri `deficits`) | ❌ **Non — le tri lui-même est buggé (§5), peut désigner une qualité moins sévère ou hors HYP** |
| Relations qualité↔qualité | `HYP_QUALITY_RELATIONS` (consulté à la fois par CSM et par `buildMultiQualityNarrative`) | ✅ Oui pour le principe, ⚠ mais les DEUX consommateurs n'examinent pas le même sous-ensemble de paires (§8, CAS 7) |
| Information TFM secondaire | `capaciteScores`/`VAR_REL3`/`TFM` | ✅ Oui, depuis la migration TFM |
| Contributeur anatomique | `contributeurPrincipal` (gate rôle HYP) | ✅ Oui pour la légitimité du contributeur cité, ⚠ mais sa **sélection** hérite indirectement du même risque si `priorities` en amont est mal trié (le contributeur est calculé qualité par qualité, donc individuellement correct, mais son ordre d'apparition dans le rapport suit `priorities`) |

---

## 5. CSM vs `priorities` — et la découverte du bug de tri

### Le mécanisme

```js
// index.html:6022
var deficits=FUNCTIONS.filter(function(fn){return fSc[fn]&&(fSc[fn].status==='rouge'||fSc[fn].status==='orange');})
  .sort(function(a,b){return({rouge:0,orange:1}[fSc[a].status]||2)-({rouge:0,orange:1}[fSc[b].status]||2);})
  .slice(0,3);
```

L'intention est claire (commentaire implicite du code lui-même et de tous les documents de cette
session) : trier `rouge` avant `orange`. **Mais `{rouge:0,orange:1}['rouge']` vaut littéralement
`0`, et `0` est une valeur "falsy" en JavaScript — l'opérateur `||2` s'applique donc aussi à
`rouge`, qui devient `0||2 = 2`.** `orange` (`1`) reste `1` (`1` est "truthy"). Résultat vérifié
empiriquement, isolément, hors de toute logique métier :

```js
var fSc={Force:{status:'rouge'},Puissance:{status:'rouge'},Stabilisation:{status:'rouge'},'Contrôle Frontal':{status:'orange'}};
// tri réel obtenu : ['Contrôle Frontal', 'Force', 'Puissance']  (Stabilisation, pourtant 'rouge', EXCLUE du top-3)
```

**`orange` (rang réel 1) passe systématiquement avant `rouge` (rang réel 2)** — l'inverse de
l'intention. Ce n'est pas un cas limite : c'est la règle générale, à chaque fois qu'un profil
mélange des qualités `rouge` et `orange` (situation clinique courante — peu de patients ont
uniquement des déficits au maximum de sévérité).

### Conséquence directe sur `priorities`, `contributeurPrincipal`, `hypothese`, `causalSteps`

Ce bug **n'a jamais été introduit ni touché par aucune des 4 missions précédentes** (audit
relationnel, audit migration, implémentation migration, branchement CSM) — `deficits` n'a été lu
que par elles, jamais modifié. Il pré-existe. Mais ses conséquences se propagent à **tout ce qui
dépend de `priorities`** :

- `priorities[0]` (badge "Priorité principale", en tête du rapport) peut être une qualité `orange`,
  voire une qualité **sans moteur HYP** (Contrôle Frontal/Contrôle Sensoriel, purement TFM), **alors
  qu'une qualité `rouge` réellement confirmée par HYP existe et n'apparaît nulle part** dans le
  top-3 si 4 qualités ou plus sont déficitaires avec un mélange de sévérités.
- `causalSteps`/`conclusion`/`consequences` (page "Chaîne causale principale"/"Avis clinique") ne
  discutent QUE de `pri[0]`/`pri[1]` — avec le tri buggé, ils peuvent bâtir toute la narration
  inter-qualités sur une paire qui n'inclut PAS la qualité la plus sévère du patient.
- `contributeurPrincipal`/`hypothese` de cette même qualité mal-priorisée occupent la place
  visuelle la plus importante du rapport (première carte, "Pourquoi ?").

**CSM, lui, est structurellement immunisé contre ce bug** : `computeHypClinicalSynthesisRelationships`
et `objectified` ne trient jamais par sévérité — ils listent TOUTES les qualités objectivées, dans
l'ordre fixe de `HYP_CSM_QUALITIES`, sans jamais utiliser ce comparateur défectueux.

### Preuve empirique complète

Scénario : Force (rouge), Puissance (rouge), Stabilisation (rouge) réellement déficitaires selon
HYP (3 moteurs HYP concordants), plus Contrôle Frontal (orange, TFM générique, pas de moteur HYP)
via un effet de bord du poids TFM partagé de `landing_uni`/`landing_bi` :

| Sortie | Contenu réel obtenu |
|---|---|
| `fSc` | Force=rouge, Puissance=rouge, Stabilisation=rouge, Contrôle Frontal=orange |
| **`priorities` (top-3)** | **#1 Contrôle Frontal (orange), #2 Force (rouge), #3 Puissance (rouge) — Stabilisation absente** |
| **`causalSteps`/conclusion** | **"Le bilan met en évidence des déficits concordants de contrôle frontal et de force."** — Stabilisation jamais mentionnée, alors que sa relation avec Force (`Force→Stabilisation`, documentée) existe |
| **`clinicalSynthesis.objectified`** | **Force, Puissance, Stabilisation** (les 3 qualités HYP réellement confirmées — correct) |
| **`clinicalSynthesis.explanatoryHypotheses`** | **Force→Puissance ET Force→Stabilisation** (les deux relations documentées, correctement toutes les deux exploitées) |

**Le praticien qui lit uniquement "Chaîne causale principale"/"Priorité principale" reçoit une
histoire incomplète et partiellement incorrecte (une qualité hors-HYP présentée comme priorité
n°1, une qualité réellement confirmée — Stabilisation — absente de toute narration prioritaire) ;
celui qui lit l'onglet/section "Synthèse clinique" reçoit l'histoire complète et correcte.** C'est
la divergence la plus significative trouvée par cet audit.

---

## 6. CSM vs `hypothese`

Hors de l'effet du bug §5 (qui affecte QUELLE qualité apparaît, pas la formulation elle-même) :
les textes `HYPO[fn](main)` restent, individuellement, non causalistes ("semble compatible avec",
"pourrait être expliqué par") — vérifié à nouveau, aucune occurrence de vocabulaire causal fort. Le
gate de rôle HYP (migration précédente) empêche `contributeurPrincipal` de citer un système sans
rôle documenté. **Aucune divergence de formulation trouvée entre CSM et `hypothese` prise
individuellement, qualité par qualité** — la seule divergence est celle du §5 (quelle qualité est
mise en avant, pas comment elle est décrite une fois choisie).

---

## 7. CSM vs `contributeurPrincipal`

Cas `knee_ext` (§11 de la mission) retesté : rôle `segmental` correctement détecté, formulation
`tfmSecondaryContributorNote` utilisée ("à titre explicatif — ne constitue pas une preuve
diagnostique"), jamais transformé en cause par CSM (CSM ne lit jamais `contributeurPrincipal`).
**Aucune divergence trouvée** au niveau du contenu de ce champ lui-même — seule sa **position** dans
le rapport (via `priorities`) hérite du bug §5.

---

## 8. CSM vs `causalSteps`

`causalSteps` ne construit jamais de chaîne à 3 maillons causaux (`Force→Puissance→Explosivité`) —
confirmé par lecture du code (`buildMultiQualityNarrative` ne considère que `pri[0]`/`pri[1]`, les
qualités 3+ sont ajoutées comme "déficit concordant" isolé, jamais chaînées). **Sur ce point précis
(pas de chaîne automatique), `causalSteps` et CSM sont cohérents.** La divergence réelle n'est pas
une fausse chaîne créée, mais une **relation réelle omise** parce que `causalSteps` ne regarde que
2 qualités sur N (§5, CAS 7) — un problème de **couverture**, pas de **causalité inventée**.

---

## 9. CSM vs UI

L'onglet Expert "Synthèse clinique" (nouveau) est fidèle à CSM (branchement direct, aucune
reformulation au-delà de l'habillage badge/carte — confirmé §13 de la mission de branchement et
revérifié ici). **Mais l'écran AnalyseView (page "Analyse", distincte de la vue Expert) construit
sa propre carte "03 · SYNTHÈSE CLINIQUE" à partir de `deficits`/`priorities`, pas de
`clinicalSynthesis`** — donc soumise au même bug §5. Vérifié visuellement dans le navigateur (voir
capture d'écran jointe à la conversation) : sur le scénario testé (IMTP/SLIMTP sans norme réelle,
donc Force `non_determinable`), les deux zones concordaient (aucun déficit nulle part) — mais rien
dans le code ne garantit cette concordance dans un scénario multi-déficits mixte comme celui du §5,
où les deux zones raconteraient des histoires différentes sur le même écran.

---

## 10. CSM vs PDF

| Section PDF | Source | Diagnostic HYP ? | CSM ? | TFM ? | Risque de contradiction |
|---|---|---|---|---|---|
| "Résumé clinique" (`globalDesc`, `conclusion`) | `buildMultiQualityNarrative(pri)` | Indirect (via `priorities`) | Non | Indirect | **Élevé — hérite du bug §5** |
| "Priorité principale" (kpiCard) | `pri[0]` | Indirect | Non | Indirect | **Élevé — hérite du bug §5** |
| "Pourquoi ? Où ?" / Avis clinique (frise) | `friseSteps`, `pri[0]` | Indirect | Non | Indirect | **Élevé — hérite du bug §5** |
| "Priorités d'intervention" | `pri.slice(0,3)` | Indirect | Non | Oui | **Élevé — hérite du bug §5** |
| **"Synthèse clinique" (section 4, nouvelle)** | `clinicalSynthesis` | **Direct** | **Oui** | Non | **Nul — non affectée par le bug §5** |
| Onglet/tableau "Fonctions évaluées" | `fSc` | Direct | Non | Non | Nul |
| Page "Qualités fonctionnelles" (détail, page 2) | `fSc` par qualité | Direct | Non | Non | Nul |
| Asymétries majeures | LSI brut | Non | Non | Non | Nul (jamais présenté comme diagnostic) |

**Constat central de cette matrice** : dans le PDF actuel, la section la plus fiable
("Synthèse clinique") est aussi la **plus récente et la moins visible** (page 1, en bas, après 3
autres sections qui, elles, peuvent véhiculer une histoire incomplète ou biaisée par le bug §5). Un
praticien pressé, qui ne lit que le haut de la page 1 ("Résumé clinique"/"Priorité
principale"/"Pourquoi ? Où ?"), est le plus exposé au risque.

---

## 11. 15 cas synthétiques

| Cas | HYP | CSM | `priorities` | `hypothese` | `contributeurPrincipal` | `causalSteps`/conclusion | UI | PDF | Contradiction |
|---|---|---|---|---|---|---|---|---|---|
| 1 — Rien de déficitaire | Tout `null`/`vert` | `objectified=[]`, 8 `nonDeterminable` | `[]` | — | — | "Profil équilibré" | Cohérent | Cohérent | Aucune |
| 2 — Force seule | Force=rouge | `objectified=['Force']` | `[Force#1]` | HYPO['Force'] | selon rôle HYP | "déficit de force" | Cohérent | Cohérent | Aucune |
| 3 — Puissance seule | Puissance=rouge | `['Puissance']` | `[Puissance#1]` | HYPO['Puissance'] | selon rôle | "déficit de puissance" | Cohérent | Cohérent | Aucune |
| 4 — Force+Puissance | Les deux rouge | `['Force','Puissance']`, relation `explanatory_hypothesis` | `[Force#1,Puissance#2]` (2 seulement, pas de bug possible à 2 éléments homogènes) | idem | idem | "hypothèse explicative... sans en établir la cause" | Cohérent | Cohérent | Aucune |
| 5 — Force déf. + Puissance non_det. | Force=rouge, Puissance=`null` | `['Force']`, Puissance en `nonDeterminable` | `[Force#1]` (Puissance exclue, gate `fSc.status`) | HYPO['Force'] seul | — | "déficit de force" seul | Cohérent | Cohérent | Aucune |
| 6 — Force non_det. + Puissance déf. | Symétrique du 5 | `['Puissance']`, Force en `nonDeterminable` | `[Puissance#1]` | HYPO['Puissance'] seul | — | "déficit de puissance" seul | Cohérent | Cohérent | Aucune |
| 7 — Force+Puissance+Stabilisation (+Contrôle Frontal via TFM) | 3 qualités HYP rouge | `['Force','Puissance','Stabilisation']`, 2 relations (Force→Puissance, Force→Stabilisation) | **`[ContrôleFrontal#1(orange), Force#2, Puissance#3]` — Stabilisation EXCLUE** | Contrôle Frontal en tête, pas de mention HYP | Contrôle Frontal en tête | **"déficits concordants de contrôle frontal et de force" — Stabilisation jamais mentionnée** | Carte "03" reprend le même tri buggé | "Priorité principale"/"Chaîne causale" = Contrôle Frontal | **🔴 CRITIQUE — voir §5** |
| 8 — Absorption seule | Absorption=rouge | `['Absorption']` | `[Absorption#1]` | HYPO['Absorption'] | selon rôle | "déficit de absorption" | Cohérent | Cohérent | Aucune |
| 9 — Absorption+Stabilisation | Les deux rouge (2 éléments, pas de bug possible) | `['Absorption','Stabilisation']`, **aucune relation** (étanchéité HYP prouvée) | `[Absorption#1,Stabilisation#2]` | idem | idem | "déficits concordants... sans relation explicative documentée" | Cohérent | Cohérent | Aucune |
| 10 — Réactivité seule | `hypRea01.state='suspectee'` → `status='jaune'` | `objectified=[]` (jaune n'objective pas), Réactivité en `suspected` | `[]` (jaune hors filtre rouge/orange) | — | — | "Profil équilibré" | Cohérent | Cohérent | Aucune (les deux se taisent de la même façon sur une simple suspicion) |
| 11 — Mobilité seule | Données insuffisantes → `fSc` absent | `nonDeterminable` (8) | `[]` | — | — | "Profil équilibré" | Cohérent | Cohérent | Aucune |
| 12 — Endurance seule | `state='suspectee'` → `jaune` | `objectified=[]`, `suspected=['Endurance']` | `[]` | — | — | "Profil équilibré" | Cohérent | Cohérent | Aucune |
| 13 — Réactivité(jaune)+Puissance(rouge), aucune relation HYP | Puissance rouge, Réactivité jaune | `['Puissance']` seul (jaune non objectivé) | `[Puissance#1]` | HYPO['Puissance'] | selon rôle | "déficit de puissance" seul | Cohérent | Cohérent | Aucune |
| 14 — Force+Puissance, relation autorisée | Les deux rouge | Relation `explanatory_hypothesis` | `[Force#1,Puissance#2]` | idem | idem | Relation formulée en "hypothèse explicative" (jamais plus forte) | Cohérent | Cohérent | Aucune (déjà couvert par CAS 4) |
| 15 — TFM riche (283 var.) mais HYP peu déterminable (IMTP/SLIMTP sans norme réelle) | 6-8 qualités `non_determinable` | `nonDeterminable` élevé, `objectified=[]` | `[]` (aucune qualité ne franchit le seuil `fSc.status`) | — | — | "Profil équilibré" (texte identique, alors que le TFM sous-jacent pourrait suggérer un déficit — non affiché nulle part comme diagnostic) | **Vérifié en direct dans le navigateur** — cohérent | Cohérent | Aucune (le TFM riche reste correctement cantonné à l'onglet Capacités, jamais promu diagnostic) |

**Bilan des 15 cas** : 14/15 parfaitement cohérents (souvent parce que `priorities` et CSM
"se taisent" de la même façon quand HYP n'objective rien — un bon signe, pas un artefact). **Le
seul cas contradictoire (CAS 7) est aussi le plus clinique et réaliste : un patient avec 3 déficits
HYP-confirmés de sévérités mêlées.** Ce n'est pas un cas exotique — c'est un profil ordinaire.

---

## 12. `non_determinable`

Réaffirmé pour CSM et pour `priorities` pris individuellement : aucun chemin trouvé, dans les 15
cas ni dans le code lui-même, où `non_determinable` devient "normal" ou "déficitaire" sans passer
par une vraie preuve HYP. Le gate `fSc.status` (migration de normalisation) protège correctement ce
point pour `priorities`, `capaciteScores`, et CSM en hérite. **Le bug §5 ne viole jamais cette
règle** — il ne transforme jamais un `non_determinable` en diagnostic ; il désordonne seulement le
classement ENTRE qualités déjà légitimement déficitaires (rouge/orange). C'est une distinction
importante : le bug est un problème de **priorisation**, pas de **fabrication de diagnostic**.

---

## 13. Non-causalité

Confirmé sur les 15 cas et par relecture : aucune formulation `"X entraîne Y"`/`"X est responsable
de Y"`/`"cause principale"` trouvée dans CSM ni dans `hypothese`/`causalSteps`/`conclusion`
générés aujourd'hui. Le mot "entraîne" reste absent de toute génération automatique (confirmé par
grep sur les templates actuels). **Le bug §5 est un problème de sélection, jamais un problème de
causalité inventée** — même la mauvaise qualité choisie en priorité n'est jamais présentée comme
"causant" une autre.

---

## 14. Asymétries

Aucune narration (CSM, `hypothese`, `causalSteps`, onglets) ne construit de conclusion à partir
d'une asymétrie seule — confirmé par relecture, cohérent avec `AUDIT_RELATIONNEL_HYP_TFM_CSM.md`
§12 (déjà vérifié, non re-audité en détail ici). Le tableau "Asymétries majeures" du PDF reste
descriptif (LSI %), jamais requalifié en "déficit de X".

---

## 15. Redondances

| Exemple | Classe |
|---|---|
| CSM "Un déficit est objectivé pour Force" vs badge "Force = Critique" (onglet Fonctions) | **A — cohérent et utile** (l'un est la synthèse en prose, l'autre le diagnostic brut ; même source, deux niveaux de détail légitimes) |
| CSM "hypothèse explicative possible... sans en établir la cause" vs `causalSteps` "hypothèse explicative... sans en établir la cause" (CAS 4/14) | **B — redondant mais acceptable** (formulation quasi identique, deux endroits différents du rapport — pas nuisible, juste non-DRY) |
| Carte "03 · SYNTHÈSE CLINIQUE" (AnalyseView) vs onglet "Synthèse clinique" (ExpertView) | **C — redondant ET nuisible à la lisibilité** — même nom, sources différentes (`deficits` buggé vs `clinicalSynthesis` correct), peuvent afficher des listes de qualités différentes sous un intitulé identique |
| "Priorité principale" (PDF) vs `objectified[0]` de CSM en cas de bug §5 | **D — contradictoire** (voir §5/§11 CAS 7) |

---

## 16. Contradictions classées

| Sévérité | Source | Exemple concret | Cause | Impact | Correction potentielle (non appliquée) |
|---|---|---|---|---|---|
| 🔴 **CRITIQUE** | `deficits` (`index.html:6022`), donc `priorities`/`hypothese`/`contributeurPrincipal`/`causalSteps`/toutes les sections PDF/écran qui en dérivent | CAS 7 : Stabilisation (rouge, HYP-confirmée) absente de toute narration prioritaire ; Contrôle Frontal (orange, hors HYP) présentée comme "Priorité principale" | `({rouge:0,orange:1}[status]||2)` — `0` est falsy en JS, `rouge` retombe sur le fallback `2`, pire que `orange` (`1`) | Le praticien lisant le haut du rapport PDF peut manquer la qualité la plus sévère et se voir présenter, comme priorité clinique n°1, une qualité sans preuve HYP | Remplacer `||2` par une table qui ne dépend pas de la falsy-ness de `0` (ex. `hasOwnProperty` ou `??` / valeur explicite pour "absent"), ou inverser l'échelle (`{rouge:2,orange:1}` avec tri décroissant) — **décision et implémentation à valider par le praticien, hors périmètre de cet audit** |
| 🟠 **IMPORTANTE** | `buildMultiQualityNarrative` (limité à `pri[0]`/`pri[1]`) | Même CAS 7 : une relation HYP réellement documentée (Force→Stabilisation) n'est jamais mentionnée dans "Chaîne causale principale" alors que CSM la couvre | Conception initiale limitée à 2 qualités, jamais étendue lors du branchement CSM (hors périmètre de cette mission-là) | Sous-couverture des relations réelles dans le PDF/écran principal — non trompeur en soi (pas de fausse info), mais incomplet | Étendre `buildMultiQualityNarrative` à toutes les paires objectivées (comme CSM), ou le remplacer par une lecture de `clinicalSynthesis` — décision à arbitrer |
| 🟡 **MINEURE** | Nom "Synthèse clinique" utilisé deux fois (AnalyseView vs ExpertView) | §9/§15 | Coïncidence de nommage, pas de logique commune | Confusion possible pour le praticien naviguant entre les deux vues | Renommer l'une des deux zones (ex. "Résumé" pour l'ancienne carte AnalyseView) |
| ⚪ **AUCUNE** | Tous les autres mécanismes audités (§6/§7/§8/§12/§13/§14) | — | — | — | — |

---

## 17. Architecture narrative cible

```
DIAGNOSTIC     → HYP (fSc)                              [déjà en place]
SYNTHÈSE       → CSM (clinicalSynthesis)                 [déjà en place, branché]
RELATIONS      → HYP_QUALITY_RELATIONS (exploitées PAR CSM pour toutes les paires,
                  PAR buildMultiQualityNarrative pour 2 qualités seulement — écart à combler)
NARRATION      → CSM à terme, prioritairement            [pas encore le cas — priorities reste la
                                                            source du haut de page PDF/AnalyseView]
UI / PDF       → CSM + diagnostics individuels en priorité d'affichage, `priorities` en
                  complément (plan de prise en charge, contributeur anatomique) une fois son tri
                  corrigé
```

**Condition préalable à toute centralisation autour de CSM** : corriger le bug §5. Tant que
`priorities` reste mal trié, le "faire converger vers CSM" ne suffit pas à lui seul — il faudrait
soit corriger le tri, soit déplacer la responsabilité de sélection de "qualité prioritaire" vers un
mécanisme qui n'a pas ce défaut (CSM lui-même n'a pas de notion de priorité — il faudrait en créer
une, ce que la mission de branchement a explicitement exclu comme périmètre, à raison).

---

## 18. Recommandations par mécanisme

| Mécanisme | Recommandation | Justification |
|---|---|---|
| `priorities` (sélection/tri) | **E — à arbitrer cliniquement**, mais en pratique **corriger le bug §5 est un préalable technique, pas clinique** — la règle voulue ("rouge avant orange") est déjà décidée, seule son implémentation est fautive | Ce n'est pas une question de choix clinique, c'est un bug d'implémentation d'une règle déjà actée |
| `hypothese`/`contributeurPrincipal` (contenu) | **C — rendre secondaire/informationnel** (déjà largement le cas depuis la migration TFM) | Formulations individuellement correctes, mais dépendent de `priorities` pour leur ordre d'apparition |
| `causalSteps`/`conclusion`/`consequences` | **B — alimenter à terme par CSM** (étendre à toutes les paires objectivées, pas seulement `pri[0]`/`pri[1]`) | Couverture actuellement incomplète (§8/§16 IMPORTANTE) ; CSM a déjà la bonne logique, il "suffirait" de la brancher ici aussi |
| "Pourquoi ? Où ?" / "Priorité principale" (PDF, cartes) | **E — à arbitrer**, conditionnellement à la correction du §5 | Actuellement risqué (CRITIQUE) tant que le tri sous-jacent reste buggé |
| Carte "03 · Synthèse clinique" (AnalyseView) | **D — remplacer par une lecture de `clinicalSynthesis`** (le nouvel onglet Expert le fait déjà correctement — dupliquer la même logique ici, pas la réinventer) | Elle porte déjà le même nom que la version correcte ; les faire converger résout à la fois §15/§16 (MINEURE) et une partie du §16 (CRITIQUE, si sa source change) |

---

## 19. Recommandation PDF

**Réorganisation autour de** `1. Synthèse CSM · 2. Diagnostics HYP · 3. Explications/relations ·
4. Détails des tests` **recommandée à moyen terme**, mais **pas avant que le bug §5 soit corrigé** —
réorganiser l'ordre visuel sans corriger la source ne résoudrait pas la contradiction, seulement sa
position dans la page. Court terme (sans réorganisation) : la section CSM existante (page 1, en bas)
gagnerait à être remontée plus haut, avant "Priorité principale"/"Pourquoi ? Où ?", pour que le
praticien la rencontre avant les sections potentiellement affectées par le bug — **recommandation,
non appliquée ici**.

---

## 20. Recommandation UI

**"Synthèse clinique" (onglet Expert) devrait devenir la couche narrative principale** consultée en
premier par le praticien pour une vue multi-qualités — elle est aujourd'hui la seule à ne jamais
pouvoir être affectée par le bug §5. La carte "03 · Synthèse clinique" d'AnalyseView, avec son nom
identique mais sa source différente, devrait converger vers la même logique (§18) plutôt que de
coexister sous un nom dupliqué.

---

## 21. Décisions restant à prendre

1. **Corriger le bug de tri `deficits` (§5)** — décision technique quasi-certaine (la règle voulue
   est déjà connue), mais nécessite une mission dédiée avec ses propres tests de non-régression
   (impact large : `priorities`, `hypothese`, `contributeurPrincipal`, `causalSteps`, RTP, PDF ×2,
   AnalyseView) — **non appliqué dans cet audit, conformément à l'interdiction absolue de la
   mission**.
2. Étendre `buildMultiQualityNarrative` à toutes les paires objectivées (comme CSM), ou le
   remplacer par une consommation directe de `clinicalSynthesis.relationships`.
3. Faire converger la carte "03 · Synthèse clinique" d'AnalyseView vers `clinicalSynthesis` plutôt
   que vers `deficits`.
4. Renommage éventuel pour lever l'ambiguïté des deux "Synthèse clinique" en attendant la
   convergence du point 3.
5. Repositionnement de la section CSM plus haut dans le PDF (avant "Priorité principale").
6. Décisions déjà identifiées par les audits précédents et toujours ouvertes (collision
   `HYP-CSM-01`, nom final de `capaciteScores`) — inchangées, non retraitées ici.

---

## 22. Conclusion

**Sur 15 cas testés, 14 sont parfaitement cohérents entre CSM et les anciennes narrations** — la
migration de normalisation et la migration TFM ont fait un travail solide : le gate HYP protège
correctement `non_determinable`, aucune causalité automatique n'est générée nulle part, les
formulations restent prudentes partout. **Mais le seul cas contradictoire trouvé (CAS 7, §5/§11)
n'est pas marginal : c'est un profil multi-déficits de sévérités mêlées — un scénario clinique
ordinaire, pas un cas limite construit artificiellement.** Le bug qui le cause est un défaut
d'implémentation JavaScript classique (`0` falsy), pré-existant, indépendant de tout travail HYP/CSM,
mais dont l'impact clinique est direct : la section la plus visible du rapport ("Priorité
principale", "Chaîne causale principale") peut désigner une qualité moins sévère, voire hors
périmètre HYP, à la place de la qualité réellement la plus déficitaire — alors que la nouvelle
section "Synthèse clinique" (CSM), elle, reste toujours correcte.

### Décision finale

**C — CONTRADICTIONS À CORRIGER AVANT UTILISATION CLINIQUE.**

Non pas parce que CSM et les anciennes narrations seraient globalement incompatibles (le bilan des
15 cas montre le contraire), mais parce que le bug identifié au §5 affecte directement la partie du
rapport la plus consultée (la première page, les premières cartes) dans un scénario clinique
courant, et peut faire apparaître, comme priorité affichée au praticien, une qualité qui n'est ni
la plus sévère ni même toujours confirmée par HYP. Tant que ce point précis n'est pas corrigé, le
haut du rapport PDF et la carte "03 · Synthèse clinique" d'AnalyseView ne doivent pas être considérés
comme fiables pour identifier LA priorité clinique d'un patient à déficits multiples et de
sévérités mêlées — seule la section/onglet "Synthèse clinique" issue de CSM (non affectée) l'est
aujourd'hui pour cet usage précis.

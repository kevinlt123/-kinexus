# Phase I — Audit technique : cartographie réelle vs. cartographie théorique

## Statut de ce document

Audit uniquement. Aucun code écrit, aucun refactoring, aucun changement de comportement, aucun
commit fonctionnel. Toutes les affirmations ci-dessous sont reliées à une lecture directe de
`/home/user/-kinexus/index.html` (6824 lignes, vérifié inchangé — dernier commit touchant ce fichier :
`abf507e`, aucune modification locale en attente) effectuée dans le cadre de cette Phase, pas
reprises telles quelles de `PHASE_G_IMPLEMENTATION_PLAN.md`/`PHASE_H_TECHNICAL_SPECIFICATION.md`
sans re-vérification. Toute extrapolation non directement lue dans le code est marquée
**[HYPOTHÈSE]**.

---

# 1. Executive Summary

La quasi-totalité des faits cités par `PHASE_G_IMPLEMENTATION_PLAN.md`/
`PHASE_H_TECHNICAL_SPECIFICATION.md` (signatures, lignes, statut mort de `qualityScores`, absence
de persistance des scores calculés) est **confirmée par relecture directe**. Deux écarts réels ont
été trouvés :

1. **Erreur de localisation** — l'appel à `computeMoteur()` cité en `:4711` comme faisant partie
   d'`AnalyseView` (`PHASE_G_IMPLEMENTATION_PLAN.md` §1.2) se trouve en réalité **à l'intérieur de
   `buildSportifReport()`** (mode rééducation, comparaison au bilan précédent lors de la génération
   du PDF) — une fonction et un contexte différents de ceux indiqués. Erreur de fait, signalée
   explicitement (§2, §3.1).
2. **Sous-cartographie significative d'`ExpertView`** — la cartographie théorique décrivait 4
   onglets ("fonctions/variations/capacités/systèmes"). La lecture directe en révèle **9** :
   `fonctions, kpi, variables, capacites, systemes, hypotheses, orientations, couverture,
   raisonnement`. Deux de ces onglets non documentés portent des noms **littéralement identiques**
   à des concepts centraux de HYP### (`'hypotheses'`, `'orientations'`), et un troisième
   (`'raisonnement'`) porte le même nom que la vue `FilDeRaisonnementView` sans être la même
   fonctionnalité. C'est le risque le plus concret découvert par cet audit (§4, §5).

Aucun blocage caché n'a été trouvé pour H1 ou H3. `qualityScores` est confirmé mort par recherche
exhaustive, sous réserve d'une limite méthodologique explicitement signalée (§3.3). Le modèle de
persistance décrit en `PHASE_H_TECHNICAL_SPECIFICATION.md` §6 ("rien n'est stocké, tout est
recalculé") est confirmé exactement : le bilan persisté ne contient que
`{type, sousType, commentaire, id, date, statut, testData, questData, reportOverrides}` — aucun
champ calculé.

---

# 2. Validation du plan Phase G

| Élément vérifié | Statut | Détail |
|---|---|---|
| `TFM` déclaré `:750`, `FUNCTIONS`/`SYSTEMS` `:742-743` | ✅ Confirmé | Lecture directe, contenu exact repris en §3.2 |
| `effectiveTFMWeight()` `:793`, `testReportState()` `:801` | ✅ Confirmé | — |
| `computeMoteur()` déclaré `:4184`, retour `:4244` | ✅ Confirmé | — |
| Appels `computeMoteur()` : `ReportPreview :5254`, `AnalyseView :5920/:5938`, `HistoriqueView :6627-6628` | ✅ Confirmé | — |
| Appel `computeMoteur()` `:4711` attribué à `AnalyseView` | 🔴 **Infirmé** | En réalité dans `buildSportifReport()` (§1, §3.1) |
| `qualityScores` mort, aucun consommateur | ✅ Confirmé | Recherche exhaustive, limite méthodologique notée §3.3 |
| `VAR_REL3` déclaré `:4009`, accès dynamique `testKey_kpiKey` | ✅ Confirmé | `:4035, :4072-4073, :4126, :6553` |
| `computeAsymEngine()` `:3111`, appelé par `computeMouvementAnalysis` `:3371` | ✅ Confirmé | — |
| `FilDeRaisonnementView` `:3763`, `buildRaisonnementBoardCMJ` `:3908` | ✅ Confirmé | — |
| `ExpertView` — 4 onglets (`fonctions/variations/capacités/systèmes`) | 🟠 **Partiellement infirmé** | 9 onglets réels, 5 non documentés (§1, §4) |
| `Dashboard` — aucune donnée de scoring lue | ✅ Confirmé | `:5537`, ne lit que `props.athletes` |
| `HistoriqueView` — sous-onglet d'`AnalyseView`, aucune route `App` de premier niveau | ✅ Confirmé | Bloc de routage `App()` `:6809-6816` ne contient aucune entrée `historique` |
| `QualityConfigView` — dépendance cachée à `TFM` via `qualityVarState` | ✅ Confirmé | `:5399, :782-786, :5402, :5449` |
| Rien n'est persisté hormis `testData/questData/reportOverrides` | ✅ Confirmé | §3.1 (Rapport PDF), structure du `bilan` vérifiée `:5657, :5873, :5909, :6816` |
| Aucun identifiant `HYP`/`CLI` existant dans le code | ✅ Confirmé | Recherche exhaustive, aucune occurrence |

---

# 3. Cartographie réelle du code

*Fichier unique pour tous les éléments : `/home/user/-kinexus/index.html`.*

## 3.1 `computeMoteur()`
- **Fonction** : `:4184-4244`. **Entrées** : `(testData, questData, normPop, normAge)`. **Sorties** :
  `{functionScores, systemScores, testStatuses, priorities, rtpStatus, qualityScores,
  capaciteScores}` (`:4244`).
- **Consommateurs réels (corrigé)** :
  - `buildSportifReport()` — **`:4711`**, PAS `AnalyseView` comme indiqué en Phase G. Contexte : mode
    de rapport `'reeducation'` (`:4707`), calcule `reeducPrevRes` pour comparer le bilan courant au
    bilan précédent et afficher un delta d'évolution (`reeducEvolution`, `:4716`) directement dans le
    PDF généré.
  - `ReportPreview` — `:5254` (`res=useMemo(...)`).
  - `AnalyseView` — `:5920` (`res` principal), `:5938` (comparaison au bilan précédent pour l'écran,
    logique distincte de celle de `buildSportifReport`).
  - `HistoriqueView` — `:6627`, `:6628` (bilans A/B).
- **Dépendances** : `TFM`/`effectiveTFMWeight` (`:4191-4192,4216,4218-4219`), `computeTestStatus`
  (`:4186`), `computeQualityStatus`/`computeCapaciteStatus` (`:4240,4243`), `HYPO`/`ORI` (tables de
  texte canné, `:4220,4231` — voir §4).
- **Impact potentiel HYP###** : coexistence pure en Shadow Mode — aucune modification requise pour
  H1/H3.

## 3.2 `TFM`
- **Déclaration** : `:750`, objet unique `TFM[testKey][functionKey]=poids(1-3)`, 44 clés de test.
- **`FUNCTIONS`** (`:742`) : **10 valeurs** — `['Mobilité','Force','Explosivité','Puissance',
  'Réactivité','Absorption','Stabilisation','Contrôle Frontal','Contrôle Sensoriel','Endurance']`.
  ⚠️ Point vérifié pour la première fois dans cet audit (voir §4) : **2 des 10 valeurs
  (`'Contrôle Frontal'`, `'Contrôle Sensoriel'`) n'ont aucun équivalent HYP### direct** — ni
  suspendu, ni actif. `HYP-CSM-01` (Contrôle Sensori-moteur) est un **9ᵉ** nom, distinct des deux.
- **Entrées/sorties** : référentiel statique, pas de calcul. **Consommateurs** : `computeMoteur()`,
  `testReportState()`, `QualityConfigView`. **Impact HYP###** : conservé sans modification à toute
  étape du Shadow Mode (déjà établi, reconfirmé).

## 3.3 `qualityScores`
- **Localisation exacte** : `:4238` (déclaration), `:4239-4241` (boucle sur **9 noms de qualité
  codés en dur**, distincts de `FUNCTIONS` — `'Force maximale','Explosivité','Puissance',
  'Réactivité','Propulsion','Absorption','Stabilisation','Contrôle moteur','Résistance
  neuromusculaire'`), `:4244` (retour).
- **Recherche de consommation** : recherche exhaustive du littéral `qualityScores` (52→3
  occurrences utiles après filtrage des faux positifs `capaciteScores`/`computeQualityStatus`) :
  toutes les occurrences sont à la définition/au retour, aucune lecture ailleurs. Recherche
  complémentaire de patterns d'accès dynamique susceptibles de masquer un consommateur indirect
  (`JSON.stringify(res)`, `Object.keys(res)`, `Object.entries(res)`, spread `...res`,
  `localStorage`+`res`) : **aucune occurrence trouvée**.
- **Limite méthodologique explicitement signalée** : cette recherche ne peut pas exclure avec une
  certitude absolue un accès **entièrement dynamique** de la forme `res[uneVariable]` où
  `uneVariable` vaudrait la chaîne `'qualityScores'` sans que le littéral `qualityScores` n'apparaisse
  nulle part dans le code — mais aucun motif générique de ce type (itération sur les clés de `res`,
  accès par variable calculée) n'a été trouvé ailleurs dans le fichier. **[HYPOTHÈSE]** : sur la base
  du style de code observé (accès systématiquement par littéral partout ailleurs dans le fichier),
  la probabilité d'un tel accès caché est jugée très faible, sans pouvoir être formellement écartée
  à 100 %.
- **Conclusion** : mort confirmé, avec la réserve méthodologique ci-dessus explicitement notée.

## 3.4 `functionScores`
- **Production** : `:4187-4208` (calcul), `:4244` (retour sous la clé `functionScores`).
- **52 occurrences du littéral au total.** Consommateurs directs, tous vérifiés ligne par ligne :
  `AnalyseView` (`:5924-5925,5939-5942`), `ExpertView` (`:6548`), `buildSportifReport`/
  `buildExpertReport` (`:4534,5147`), `HistoriqueView` (`:6646`), `computeMouvementAnalysis`
  (`:3345`, 4ᵉ paramètre, propagé à `syntheseCoherenceQualites`, `dossierPreuvesPhase`,
  `candidatsSecondaires`, `computeConfianceKinexus`, `explicationConclusionPhase`,
  `computeMoteurAlerte`, `buildRaisonnementBoardCMJ` via `analysis.functionScores` `:3966`).
- **Nouveau : `FN_GAUGE_PCT`** (`:6435` — `{vert:92,jaune:66,orange:42,rouge:18}`) — table de
  conversion catégorie→pourcentage, non documentée dans `PHASE_G_IMPLEMENTATION_PLAN.md`. Utilisée
  à 3 endroits pour calculer un delta d'évolution numérique entre deux bilans à partir du statut
  catégoriel de `functionScores` : `buildSportifReport` (`:4714-4715`, mode rééducation) et
  `AnalyseView` (`:5941-5942`). Voir §4.
- **Impact HYP###** : conservé intégralement en V1/Shadow Mode. `FN_GAUGE_PCT` est un mécanisme à
  reconsidérer si `functionScores` est un jour remplacé (Stade 3) — aucun équivalent numérique n'est
  prévu pour le modèle à support Faible/Modérée/Forte.

## 3.5 `VAR_REL3`
- **Déclaration** : `:4009`. **Accès dynamique confirmé** : clé `testKey+'_'+kpiKey` (`:4035,
  :4126, :6553`), itération complète via `Object.keys(VAR_REL3)` dans `computeQualityStatus`
  (`:4072-4073`).
- **Consommateurs** : `computeQualityStatus` (`:4070-4085`, alimente `capaciteScores` **vivant** et
  `qualityScores` **mort**), `deriveRootCauses` (racines de causes, boucle `priorities` de
  `computeMoteur`), `varRelHTML` (`:4125-4169`, onglet `'variables'` d'`ExpertView`).
- **Impact HYP###** : conservé, rôle orthogonal — non concerné par H1/H3.

## 3.6 `computeAsymEngine()`
- **Déclaration** : `:3111`. **Entrées** : `(cmjValues, pop, age)`. **Sorties** : `{phases,
  confiances, priorite1-3, asymetriesSecondaires, nonConcluantes, phasesSymetriques,
  cartographie}`.
- **Consommateur unique direct** : `computeMouvementAnalysis()` (`:3371`), stocké verbatim
  (`:3376-3377`, commentaire explicite *"Exposé tel quel (jamais recalculé)"*). Lu ensuite par
  `asymPhaseSummary()` (`:3408-3425`), consommée par `MouvementView` et `buildRaisonnementBoardCMJ`
  (`:3914`).
- **Impact HYP###** : lecture seule pour `HYP-ABS-01` (gel, point 3) — confirmé disponible
  uniquement quand `computeMouvementAnalysis()` a déjà été appelé (donc pas dans `ReportPreview`/
  `HistoriqueView`, qui ne l'appellent jamais — confirmé, aucune occurrence de
  `computeMouvementAnalysis` dans ces deux fonctions).

## 3.7 Fil de Raisonnement
- **`FilDeRaisonnementView`** : `:3763-3902`. **`buildRaisonnementBoardCMJ`** : `:3908-4000`.
- **Entrées** : `analysis` (résultat complet de `computeMouvementAnalysis`), `contextLabel`.
- **Monté** : `:6165`, sous-onglet `view==='raisonnementClinique'` d'`AnalyseView`, conditionné à
  `mouvementAnalysis` non nul.
- ⚠️ **Collision de nom découverte** : `ExpertView` possède un onglet **également nommé
  `'raisonnement'`** (`:6588-6593`), sans rapport fonctionnel — affiche les relations statiques
  structure→qualité (`STR_QUAL_DETAIL`, `SYS_COMPENSATIONS`), pas le raisonnement biomécanique
  dynamique du Fil de Raisonnement. Voir §4.
- **Impact HYP###** : intégration = décision produit non tranchée (déjà noté), confirmé sans
  modification requise pour H1/H3.

## 3.8 Priorisation
Deux mécanismes distincts confirmés, aucun troisième trouvé (recherche `priorit` insensible à la
casse sur tout le fichier) :
- **Priorités fonction** — `:4213-4232` dans `computeMoteur()`, top-3 (`slice(0,3)`, `:4213`)
  déficits triés rouge puis orange, enrichis via `HYPO[fn]`/`ORI[fn]` (§4).
- **Priorisation clinique (Mouvement)** — `computePriorisationClinique()` (`:2634-2645`), appelée
  depuis `computeMouvementAnalysis` (`:3355`).
- **Impact HYP###** : le premier mécanisme dépend directement de `functionScores` — sa
  redéfinition en Stade 3 devra être conçue (déjà noté en Phase H §4), pas un point nouveau.

## 3.9 Dashboard
- **`:5537`**. Confirmé : lit uniquement `props.athletes`. Aucune donnée de scoring, aucune ligne
  ne référence `functionScores`/`res`/`TFM`/`VAR_REL3` à l'intérieur de cette fonction. **Impact
  HYP### : nul, à toute étape.**

## 3.10 Rapport PDF
- **`buildSportifReport`** `:4533-...`, **`buildExpertReport`** `:5146-...`, assemblage
  `buildFullReportHtml` `:5183`, `printReport` `:5211`, `downloadReportHtml` `:5231`.
- **Découverte** : `buildSportifReport` contient son **propre appel interne à `computeMoteur()`**
  (`:4711`, voir §3.1) — la fonction de génération du PDF n'est donc pas un simple consommateur
  passif de `res`, elle recalcule elle-même un second `computeMoteur()` dans certains cas (mode
  rééducation). **Ceci est un point que `PHASE_G_IMPLEMENTATION_PLAN.md` a mal attribué à
  `AnalyseView`.**
- **Impact HYP###** : le futur ajout de sections `CLI###`/support (Stade 3) devra tenir compte de ce
  second point de calcul interne, pas seulement du `res` reçu en paramètre.

## 3.11 Historique
- **`HistoriqueView`** `:6619-...`. Confirmé : deux appels `computeMoteur()` indépendants
  (`:6627-6628`), aucun appel à `computeMouvementAnalysis()` (recherche exhaustive dans la fonction :
  aucune occurrence). Uniquement monté via `view==='historique'` (`:6166`) dans `AnalyseView` —
  confirmé absent du switch `screen===...` de `App()` (`:6809-6816`).

## 3.12 ExpertView
- **`:6545-...`**, `tab` initialisé à `'fonctions'` (`:6546`).
- **9 onglets réels, confirmés par lecture directe** (correction majeure de la cartographie
  théorique) :

| Onglet (`tab===`) | Ligne | Contenu |
|---|---|---|
| `'fonctions'` (défaut) | implicite | Jauges par fonction (`fSc`) |
| `'kpi'` | `:6558` | `ResultsBrowser` (navigateur de résultats bruts) |
| `'variables'` | `:6559` | Relations `VAR_REL3` (`varRelHTML`) |
| `'capacites'` | `:6573` | `capaciteScores` |
| `'systemes'` | `:6584` | `systemScores` par système anatomique |
| **`'hypotheses'`** | `:6585` | Liste `pri` (priorités TFM), affiche `p.hypothese` — texte canné issu de `HYPO[fn]` |
| **`'orientations'`** | `:6586` | Liste `pri`, affiche `p.orientation` — texte canné issu de `ORI[fn]` |
| `'couverture'` | `:6587` | Barre de couverture (%) par fonction, `sc.coverage` |
| **`'raisonnement'`** | `:6588` | Relations statiques structure→qualité (`STR_QUAL_DETAIL`) — **sans lien avec `FilDeRaisonnementView`** |

- **Impact HYP### — le plus significatif de cet audit** : les onglets `'hypotheses'` et
  `'orientations'` existent déjà, aujourd'hui, dans le moteur TFM — et portent les noms français
  exacts que le Shadow Mode (Étape 2, `PHASE_H_TECHNICAL_SPECIFICATION.md` §5) devra employer pour
  afficher les résultats HYP###/CLI###. Voir §4/§5 pour le risque et §8 pour la correction de plan
  proposée.

## 3.13 QualityConfigView
- **`:5399-...`**. Lit/écrit `qualityProfilesState` (`:782, :5402, :5449`), persisté via
  `saveQualityProfilesState()`/`localStorage` (`:770-778`). Gouverne `qualityVarState()`/
  `effectiveTFMWeight()` (`:786-796`), donc l'intégralité du calcul de `functionScores`.
- **Confirmé** : dépendance cachée déjà identifiée en Phase G — reconfirmée ici avec les lignes
  exactes de persistance (`:770-778`), non citées précédemment.

---

# 4. Dépendances cachées découvertes

1. **`buildSportifReport()` appelle `computeMoteur()` en interne** (`:4711`) — pas seulement
   `AnalyseView`. Erreur d'attribution dans `PHASE_G_IMPLEMENTATION_PLAN.md` §1.2, à corriger (§8).
2. **`FN_GAUGE_PCT`** (`:6435`) — mécanisme de conversion catégorie→pourcentage non documenté,
   utilisé pour l'affichage d'évolution entre bilans (`buildSportifReport`, `AnalyseView`). Aucun
   équivalent prévu pour un support Faible/Modérée/Forte — à concevoir si l'affichage d'évolution
   doit un jour porter sur `hypotheses` plutôt que `functionScores` (Stade 3, hors périmètre H1-H7).
3. **Collision de noms `'hypotheses'`/`'orientations'` (ExpertView, `:6585-6586`)** — noms français
   identiques aux concepts `HYP###`/orientations `CLI###`, déjà utilisés par le moteur TFM existant
   pour du texte canné (`HYPO`/`ORI`). Risque de confusion praticien et développeur si le Shadow
   Mode réutilise ces libellés sans distinction (§5).
4. **Collision de nom `'raisonnement'` (ExpertView `:6588` vs `FilDeRaisonnementView`)** — deux
   fonctionnalités totalement différentes portant le même nom d'onglet/de concept.
5. **`FUNCTIONS` (TFM) contient `'Contrôle Frontal'` et `'Contrôle Sensoriel'`, deux qualités sans
   correspondance HYP### exacte.** `'Contrôle Frontal'` était déjà connu comme non audité
   (`HYP_ARCHITECTURE_FREEZE.md`, "Ce qui reste hors de ce gel" — `ybt` sans domicile). **Nouveau
   dans cet audit** : la correspondance implicite `'Contrôle Sensoriel'` (TFM) ↔ `HYP-CSM-01`
   "Contrôle Sensori-moteur" n'a **jamais été explicitement vérifiée** dans les Phases A-H — les deux
   noms diffèrent, et rien ne garantit qu'ils couvrent le même périmètre clinique. **[HYPOTHÈSE]** :
   il s'agit probablement de la même qualité sous deux graphies différentes (cohérent avec les
   autres écarts de nommage déjà documentés entre TFM et Vierge_7), mais ce document ne le confirme
   pas — à vérifier avant tout affichage comparatif TFM/HYP### en Shadow Mode qui utiliserait le nom
   `FUNCTIONS` de TFM comme clé de correspondance automatique.
6. **`QualityConfigView` persiste via `localStorage`** (`QUALITY_PROFILES_LS_KEY`, `:770-778`),
   confirmé indépendant du stockage des bilans eux-mêmes (`LS_KEY`, `:4352-4353`) — deux mécanismes
   de persistance distincts dans la même application, à ne pas confondre lors de la conception du
   Stade 3 (dépréciation de `QualityConfigView`).

---

# 5. Risques techniques

- **Collision de nommage UI (le plus concret)** — si l'onglet Shadow Mode (H9/H11) est libellé
  "Hypothèses" ou "Orientations" sans qualificatif distinctif, un praticien pourrait confondre le
  panneau expérimental HYP### avec les onglets `'hypotheses'`/`'orientations'` déjà existants dans
  `ExpertView` (texte canné TFM, sans rapport). Risque directement actionnable : nommer la nouvelle
  surface de façon non ambiguë (ex. "HYP### (expérimental)"), pas seulement "Hypothèses".
- **Erreur d'attribution de `PHASE_G_IMPLEMENTATION_PLAN.md`** (`:4711`) — si un futur travail sur
  `computeMoteur()` se base sur la cartographie théorique sans revérification, un point d'appel réel
  (`buildSportifReport`, mode rééducation) serait manqué.
- **Correspondance `'Contrôle Sensoriel'`/`HYP-CSM-01` non vérifiée** — risque faible à court terme
  (`HYP-CSM-01` reste suspendue), mais à traiter avant toute réactivation future de cette qualité.
- **Limite méthodologique sur `qualityScores`** (§3.3) — risque résiduel très faible mais non
  strictement nul d'un accès dynamique non détecté par recherche textuelle.

---

# 6. Impact sur H1

**H1 (audit de couverture `THRESHOLDS`) reste pleinement faisable, sans correction de son
périmètre.** Aucune des découvertes ci-dessus ne concerne `THRESHOLDS`, `applyThr()` (`:3516`, lu et
confirmé conforme à la description de `PHASE_G_IMPLEMENTATION_PLAN.md` §1.14) ou les normes
population. **Aucun prérequis oublié identifié pour ce module.**

---

# 7. Impact sur H3

**H3 (objets de données `Hypothesis`/`Support`/etc.) reste pleinement faisable, sans correction.**
Ces objets sont des structures nouvelles, indépendantes du code existant — aucune des découvertes de
cet audit ne touche au modèle de données lui-même. **Aucun prérequis oublié identifié pour ce
module.**

---

# 8. Corrections éventuelles du plan H1-H14

1. **Correction factuelle** — `PHASE_G_IMPLEMENTATION_PLAN.md` §1.2 attribue l'appel `computeMoteur()`
   de la ligne `:4711` à `AnalyseView` ; il appartient en réalité à `buildSportifReport()`. À corriger
   dans une future révision de ce document (pas fait ici — hors périmètre "audit uniquement").
2. **Complément recommandé, non bloquant** — ajouter à H9 (Shadow Mode Étape 1) un critère de
   nommage explicite : la surface d'affichage HYP###/CLI### ne doit **jamais** réutiliser les libellés
   nus "Hypothèses"/"Orientations"/"Raisonnement" déjà présents dans `ExpertView`, pour éviter la
   collision documentée en §4/§5. Ceci ne modifie pas l'effort ni la dépendance de H9 telle que
   déjà estimée en `PHASE_H_TECHNICAL_SPECIFICATION.md` §8 — c'est une précision de contenu, pas un
   nouveau module.
3. **Point à vérifier avant H8 (Absorption), pas avant H1-H7** — confirmer si nécessaire la
   correspondance `'Contrôle Sensoriel'`↔`HYP-CSM-01` avant toute réactivation de `HYP-CSM-01` (hors
   périmètre H1-H14 actuel, `HYP-CSM-01` restant suspendue).
4. **Aucune correction de dépendance, d'effort ou de risque déjà estimé pour H1-H7** — les
   découvertes de cet audit affinent la documentation mais ne changent aucune estimation du tableau
   `PHASE_H_TECHNICAL_SPECIFICATION.md` §8.

---

# 9. Recommandation avant implémentation

**H1 et H3 peuvent démarrer sans modification de leur périmètre.** Aucune dépendance cachée
bloquante n'a été trouvée pour ces deux modules. La seule action recommandée avant d'atteindre H9
(pas avant H1/H3) est d'inscrire la contrainte de nommage UI (§8, point 2) dans les critères
d'acceptation de ce module, pour éviter un risque de confusion praticien déjà concrètement
identifié dans le code existant plutôt que théorique. La correction d'attribution `:4711` (§8, point
1) est mineure et documentaire — elle n'affecte aucune décision technique déjà prise, mais devrait
être répercutée dans `PHASE_G_IMPLEMENTATION_PLAN.md` par souci d'exactitude, lors d'une prochaine
révision de ce document.

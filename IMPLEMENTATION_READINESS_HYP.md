# Implementation Readiness — Code actuel → Plan d'intégration HYP###

## Statut

Fin des audits théoriques. Décisions considérées comme acquises et non redébattues ici : Contrôle
Frontal n'est pas une qualité HYP### autonome ; `HYP-CSM-01` reste suspendue ; les 8 qualités
actives sont Mobilité, Force, Puissance, Réactivité, Explosivité, Absorption, Stabilisation,
Endurance. Aucun code écrit dans ce document. Base : `PHASE_G_IMPLEMENTATION_PLAN.md`,
`PHASE_H_TECHNICAL_SPECIFICATION.md`, `PHASE_I_CODE_REALITY_CHECK.md`,
`AUDIT_TFM_VS_HYP_QUALITES.md`, `AUDIT_IMPACT_SUPPRESSION_CONTROLE_FRONTAL.md` — toutes déjà
vérifiées contre le code réel. Aucune nouvelle lecture de Vierge_7, aucun ADR rouvert.

---

# 1. Modules du code actuel concernés par un remplacement progressif de TFM

| Module | Fichier:ligne | Nature du changement requis |
|---|---|---|
| `computeMoteur()` | `index.html:4184` | **Aucun changement en LOT 1-3.** En LOT 4 : dérivation de `functionScores` retirée de la boucle pondérée `TFM`/`effectiveTFMWeight` pour les 8 qualités actives — le reste de la fonction (`testStatuses`, `systemScores`, `rtpStatus`, `capaciteScores`) reste inchangé (déjà établi, `PHASE_G_IMPLEMENTATION_PLAN.md` §3.1). |
| `TFM` / `effectiveTFMWeight()` / `qualityVarState()` | `:750, :793, :786` | Inchangés à toute étape sauf LOT 4, où ils cessent d'alimenter les 8 qualités actives mais **doivent continuer d'exister** pour Contrôle Frontal/Contrôle Sensoriel (aucun remplaçant, §4). |
| *(nouveau)* `HYP_CATALOG` | — | Nouvelle donnée statique, additive, aucun fichier existant modifié au-delà de son ajout. |
| *(nouveau)* `computeHypothesisEngine()` | — | Nouvelle fonction pure, additive, réutilise `computeTestStatus()`/`applyThr()` sans les modifier. |
| `AnalyseView` | `:5914` | Point d'intégration naturel : ajout d'un appel à `computeHypothesisEngine()` à côté de `res=computeMoteur()` (`:5920`). |
| `buildSportifReport()` | `:4533` | Contient son propre appel interne à `computeMoteur()` (`:4711`, mode rééducation — déjà signalé en Phase I comme mal attribué à `AnalyseView`). Deux points de calcul à traiter, pas un seul. |
| `buildExpertReport()` | `:5146` | Tableau `FUNCTIONS.forEach` (`:5156`) à faire évoluer en LOT 4 uniquement. |
| `HistoriqueView` | `:6619` | Deux appels `computeMoteur()` indépendants (`:6627-6628`) — n'appelle jamais `computeMouvementAnalysis()`. |
| `ExpertView` | `:6545` | Onglet `'fonctions'` (`:6557`) et `'couverture'` (`:6587`) à faire évoluer en LOT 4. Onglets `'hypotheses'`/`'orientations'`/`'raisonnement'` **déjà existants sous ces noms** (`:6585,6586,6588`) — collision de nommage à traiter dès LOT 2. |
| `computeMouvementAnalysis()` et sa chaîne (`syntheseCoherenceQualites`, `dossierPreuvesPhase`, `candidatsSecondaires`, `computeConfianceKinexus`, `explicationConclusionPhase`, `computeMoteurAlerte`) | `:3345` et suivants | Prend `functionScores` en 4ᵉ paramètre, le propage à toute la chaîne. **Dépendance cachée majeure** (§4) — non triviale à faire évoluer sans casser le Fil de Raisonnement. |
| `QualityConfigView` | `:5399` | Dépend entièrement de `TFM`/`qualityVarState`. Devient partiellement obsolète pour 8 qualités en LOT 4, doit rester pleinement fonctionnel pour Contrôle Frontal/Sensoriel. |

---

# 2. Cartographie par écran

| Écran | Données TFM utilisées aujourd'hui | Données HYP### devant les remplacer | Données inchangées |
|---|---|---|---|
| **Dashboard** | Aucune | Aucune | Tout (`props.athletes` uniquement) |
| **Rapport PDF** | `fSc` (10 qualités), `pri` (top-3), item RTP nommé `['Contrôle Frontal','Mobilité','Absorption']`, 2ᵉ `computeMoteur()` interne (rééducation) | `hypotheses`/`support`/`clinicalOrientations` pour les 8 qualités actives | `testStatuses`, `systemScores`, `rtpStatus` (calcul indépendant, hop-tests + ACL-RSI) |
| **Historique** | `functionScores` ×2 bilans, 10 qualités | `hypotheses` ×2 bilans, 8 qualités | Mécanisme de sélection des bilans, comparaison par paire |
| **ExpertView** | `fSc` (onglets `fonctions`/`couverture`), `pri` (onglets `hypotheses`/`orientations`, texte `HYPO`/`ORI`) | `hypotheses`/`support` (nouvel onglet ou onglet `fonctions` refondu) | Onglets `capacites`, `systemes`, `variables`, `kpi`, `raisonnement` (orthogonaux) |
| **Priorisation (fonction)** | `FUNCTIONS.filter` top-3 sur `fSc` | Règles de priorisation par support (Fort d'abord) — **non codées, seulement décrites qualitativement** dans `KINEXUS_REASONING_ENGINE_V1.md` Partie 4 | Aucune |
| **Fil de Raisonnement** | `analysis.functionScores` (registre narratif, `countMoteurs`) | Dépend de la résolution du wiring `functionScores` dans `computeMouvementAnalysis` — non résolu | Threads, preuves biomécaniques, `asymEngine` |
| **MouvementView** | Reçoit `analysis` complet en prop (inclut `functionScores` en interne) — usage direct non vérifié en détail dans ce document | *(à vérifier avant LOT 3/4)* | Affichage des phases/asymétries, a priori indépendant |
| **RTP** | Indépendant de `functionScores` pour le calcul cœur (LSI hop-tests + ACL-RSI) ; dépendant pour l'item checklist PDF (`Contrôle Frontal`/Mobilité/Absorption) | `HYP-MOB-01`/`HYP-ABS-01` pour l'item checklist ; `Contrôle Frontal` sans remplaçant (§4) | Calcul cœur du statut RTP |
| **AnalyseView** | `res=computeMoteur()`, distribué à tous les sous-écrans | Point d'ajout de `computeHypothesisEngine()` | Routage interne, sélection d'onglet |

---

# 3. Tableau Écran → Objet → Action

| Écran | Objet actuel | Objet futur | Action |
|---|---|---|---|
| Dashboard | — | — | **Conserver** (aucun changement, aucune étape) |
| Rapport PDF | `fSc`/`pri` (rapport sportif/expert) | `hypotheses`/`support`/`clinicalOrientations` | **Remplacer** (LOT 4 uniquement) |
| Rapport PDF | Item RTP `'Contrôle Frontal'` (`:4618`) | Aucun remplaçant HYP### connu | **Question ouverte** — ni conserver ni supprimer tranché ici (§4) |
| Rapport PDF | 2ᵉ `computeMoteur()` interne (`:4711`) | À traiter explicitement, pas oublié | **Remplacer** (avec le reste de `buildSportifReport`) |
| Historique | Comparaison `functionScores` | Comparaison `hypotheses` | **Remplacer** (LOT 4) |
| ExpertView | Onglet `'fonctions'`/`'couverture'` | Nouvel onglet ou refonte | **Remplacer** (LOT 4) ; **Conserver** en LOT 2-3 (coexistence) |
| ExpertView | Onglets `'hypotheses'`/`'orientations'`/`'raisonnement'` (texte `HYPO`/`ORI`, TFM) | — | **Déprécier** à terme (LOT 4), **Conserver** jusque-là — collision de nom à gérer dès LOT 2 |
| ExpertView | Onglets `capacites`/`systemes`/`variables`/`kpi` | — | **Conserver**, aucune étape ne les concerne |
| Priorisation (fonction) | `FUNCTIONS.filter` top-3 | Règles par support — non spécifiées en détail | **Remplacer** (LOT 4, nécessite conception supplémentaire) |
| Priorisation (Mouvement) | `computePriorisationClinique(...,functionScores,...)` | À définir | **Remplacer ou conserver en lecture parallèle** — non tranché (§4) |
| Fil de Raisonnement | `dossierPreuvesPhase`/`countMoteurs` | À définir | **Conserver** en LOT 1-3, dépendant de la décision Priorisation (Mouvement) pour LOT 4 |
| `QualityConfigView` | `TFM`/`qualityVarState`, 10 qualités | Sans objet pour 8 qualités ; reste utile pour 2 | **Déprécier partiellement** — état mixte non résolu (§4) |
| `computeMoteur()` | Boucle pondérée `TFM` | Retirée pour 8 qualités, conservée pour 2 | **Remplacer partiellement** (LOT 4) |
| `TFM`/`FUNCTIONS` | Référentiel complet, 10 qualités | Référentiel réduit à 2 qualités (Contrôle Frontal/Sensoriel) | **Conserver**, jamais supprimé (aucune qualité HYP### ne les remplace) |

---

# 4. Risques réels d'implémentation

## Dépendances cachées
- **`functionScores` irrigue toute la chaîne Mouvement/Phases** (`computeMouvementAnalysis` et 6
  fonctions en aval, jusqu'au Fil de Raisonnement). C'est la dépendance la plus sérieuse identifiée :
  remplacer `functionScores` par `hypotheses` implique soit de maintenir `functionScores` calculé
  indéfiniment en parallèle (coexistence permanente pour cette seule chaîne), soit de re-câbler une
  fonctionnalité récemment construite et déjà testée (`countMoteurs`, les 3 registres narratifs).
- **`buildSportifReport()` calcule un second `computeMoteur()` en interne** (`:4711`, mode
  rééducation) — un point de calcul facile à manquer si l'on raisonne uniquement en termes de "quel
  écran affiche `res.functionScores`".
- **`QualityConfigView`** perd son objet pour 8 qualités mais doit rester pleinement opérant pour 2
  — un état hybride, pas un simple "à déprécier".

## Doublons
- Le calcul `computeMoteur()` apparaît déjà 6 fois dans le code pour un seul bilan potentiellement
  affiché (`ReportPreview`, `AnalyseView` ×2, `buildSportifReport`, `HistoriqueView` ×2) — ajouter
  `computeHypothesisEngine()` au même rythme sans mutualisation augmenterait le nombre de calculs
  redondants par écran.

## Effets de bord
- Modifier la définition de "priorité (fonction)" (§3, ligne Priorisation) affecte simultanément
  `ExpertView`, les deux fonctions de rapport PDF, et `AnalyseView` (niveau de risque affiché) — un
  seul changement de règle avec 4 points d'impact simultanés.

## Conflits de nommage
- Les onglets **déjà existants** `'hypotheses'`/`'orientations'`/`'raisonnement'` dans `ExpertView`
  (`:6585,6586,6588`) portent les noms français que le Shadow Mode devra employer pour HYP###/CLI###
  — risque de confusion praticien déjà documenté (`PHASE_I_CODE_REALITY_CHECK.md` §4/§5), à traiter
  dès le premier affichage visible (LOT 2), pas en fin de projet.

## Incompatibilités avec les rapports historiques
- `bilan.reportOverrides.priorities` (édité manuellement par le praticien depuis `ReportPreview`,
  persisté par bilan) est structuré autour des noms de fonctions TFM. Si la structure de
  "priorité" change de forme en LOT 4, les surcharges déjà enregistrées sur des bilans existants
  risquent de ne plus correspondre au nouveau format — un risque de compatibilité concret, propre
  aux données déjà produites par les praticiens, pas seulement au code.
- Aucune autre incompatibilité de persistance identifiée : `testData`/`questData` (seules données
  brutes stockées) restent inchangés, tout bilan existant reste recalculable par
  `computeHypothesisEngine()` dès son implémentation (déjà établi,
  `PHASE_H_TECHNICAL_SPECIFICATION.md` §6).

---

# 5. Le plus petit morceau de HYP### implémentable sans casser le logiciel

**Réponse : un `HYP_CATALOG` limité à `HYP-MOB-01` (Mobilité) seule, associé à
`computeHypothesisEngine()` restreint à cette unique qualité, calculé mais non branché sur aucun
écran existant — invisible du praticien.**

Justification, par élimination :
- Mobilité est la seule qualité au cycle d'états **entièrement résolu et sans ambiguïté** :
  exception à seuil unique validée (ADR-005), aucun palier Modéré/Fort à gérer de façon incertaine
  (ADR-008 tranche déjà leur inatteignabilité), aucune dépendance à `asymEngine` (contrairement à
  Absorption), aucune segmentation Niveau 2 (contrairement à Force), aucune `InstrumentConfidence`
  (contrairement à Explosivité), aucune exception de convergence encore non rédigée (contrairement à
  Absorption/SLLT).
- Elle ne nécessite la modification d'**aucun fichier ni fonction existante** : `HYP_CATALOG`
  (Mobilité) et `computeHypothesisEngine()` (restreint) sont des ajouts purs, non appelés depuis
  `computeMoteur()`, `AnalyseView`, ou tout autre point de rendu déjà en production.
- Elle réutilise uniquement des primitives déjà existantes et non modifiées (`computeTestStatus()`/
  `applyThr()`).
- Elle est directement vérifiable contre les cas déjà rédigés dans `PHASE_D_LOGICAL_VALIDATION.md`
  (Cas A, D, E + vérification dédiée pour `HYP-MOB-01`) sans qu'aucune nouvelle fixture de test ne
  soit à concevoir.

**Ce n'est délibérément pas encore une fonctionnalité visible ou utile au praticien** — c'est la plus
petite unité qui prouve que le moteur HYP### peut exister dans le code sans toucher à un seul
comportement observable aujourd'hui.

---

# 6. Roadmap technique en lots

## LOT 1 — Fondations invisibles
- **Objectif** : le moteur HYP### existe, se calcule, ne s'affiche nulle part.
- **Modules impactés** : ajout de `HYP_CATALOG` (Mobilité, puis extension aux 6 autres qualités
  sans ambiguïté ouverte — Force, Puissance, Réactivité, Explosivité, Stabilisation, Endurance) et
  de `computeHypothesisEngine()`. Aucun fichier existant modifié au-delà de ces ajouts.
- **Risque** : faible — code additif, zéro consommateur, zéro écran touché.
- **Dépendances** : audit de couverture `THRESHOLDS` (`PHASE_H_TECHNICAL_SPECIFICATION.md`, module
  H1), objets de données (module H3) — déjà spécifiés, aucune nouvelle dépendance introduite ici.

## LOT 2 — Shadow Mode visible
- **Objectif** : le praticien peut voir un résultat HYP###, clairement isolé, sans qu'il affecte un
  seul écran existant.
- **Modules impactés** : `AnalyseView` (ajout de l'appel `computeHypothesisEngine()` à côté de
  `res=computeMoteur()`), une surface d'affichage nouvelle et isolée. Traitement explicite de la
  collision de nommage avec les onglets `'hypotheses'`/`'orientations'`/`'raisonnement'` déjà
  existants dans `ExpertView` — condition de sortie de ce lot, pas un détail différable.
- **Risque** : modéré — premier point de contact praticien, risque de confusion si l'étiquetage
  n'est pas strict.
- **Dépendances** : LOT 1 terminé et validé (suite de tests basée sur `PHASE_D_LOGICAL_VALIDATION.md`).

## LOT 3 — Extension et validation croisée
- **Objectif** : élargir la couverture (Absorption si l'exception SLLT est disponible), comparer
  HYP### et TFM sur un échantillon de bilans réels, étendre `HistoriqueView`.
- **Modules impactés** : `HistoriqueView` (extension de la comparaison), wiring `asymEngine` en
  lecture seule pour `HYP-ABS-01`, éventuellement une section supplémentaire (additive) dans
  `ReportPreview`.
- **Risque** : modéré à élevé — touche des écrans déjà utilisés en production, même en ajout pur ;
  dépend d'une dépendance externe non technique (rédaction de l'exception SLLT) pour Absorption.
- **Dépendances** : LOT 2 jugé concluant par le praticien ; décisions produit (persistance,
  intégration au Fil de Raisonnement) tranchées.

## LOT 4 — Bascule effective
- **Objectif** : HYP### devient la source Niveau 1 principale pour les 8 qualités actives.
- **Modules impactés** : `computeMoteur()` (retrait de la boucle `TFM` pour ces 8 qualités
  uniquement), re-câblage de tous les consommateurs de `functionScores` (`ExpertView`, rapports PDF
  ×2 dont le point de calcul interne de `buildSportifReport`, `HistoriqueView`, priorisation
  fonction), résolution de la dépendance `functionScores` dans la chaîne Mouvement/Fil de
  Raisonnement (§4), traitement explicite de `QualityConfigView`.
- **Risque** : élevé — la surface la plus large de tous les lots, changement de modèle mental
  praticien, aucun filet de sécurité si un consommateur est oublié.
- **Dépendances** : LOT 3 validé ; **question non résolue à ce jour, condition préalable à ce
  lot** : que devient le calcul TFM de Contrôle Frontal et Contrôle Sensoriel une fois la boucle
  pondérée retirée pour les 8 qualités actives — les décisions déjà validées tranchent qu'elles ne
  deviennent pas des qualités HYP###, pas ce que `TFM` devient pour elles à ce moment précis.

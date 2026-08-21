# Cartographie des moteurs Kinexus — architecture réelle

## Statut de ce document

Document de travail (pas normatif), produit à la demande du praticien le 07/08/2026 suite à la
découverte, pendant l'audit Phase A (`AUDIT_VAR_REL3_VS_VIERGE7.md`), que `VAR_REL3` — audité
jusqu'ici comme "le" mécanisme pondéré — ne pilote pas les qualités affichées au praticien.
Objectif : cartographier le système **réel**, tel qu'il existe dans `index.html`, avant toute
décision sur la suite de la Phase A. Aucune modification de code. Toute affirmation ci-dessous est
vérifiée par recherche exhaustive des points d'appel (`grep`) dans le fichier — quand une hypothèse
n'a pas pu être vérifiée avec certitude, c'est signalé explicitement comme telle plutôt que présenté
comme un fait.

---

## 1. Vue d'ensemble — le système a deux sous-systèmes indépendants

Kinexus contient en réalité **deux clusters de moteurs largement indépendants**, qui correspondent
aux "Niveau 1 Qualités" et "Niveau 2 Phases" de `KINEXUS_CLINICAL_ARCHITECTURE.md` :

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NIVEAU 1 — QUALITÉS (10 fonctions : Mobilité/Force/Explosivité/         │
│  Puissance/Réactivité/Absorption/Stabilisation/Contrôle Frontal/         │
│  Contrôle Sensoriel/Endurance)                                          │
│                                                                           │
│  TFM (test→fonction, poids 1-3)                                         │
│    └─▶ computeMoteur()                                                  │
│          ├─▶ functionScores  ───────────────┐  ACTIF — seul système     │
│          ├─▶ priorities (+ hypothese/        │  réellement affiché      │
│          │   orientation via tables HYPO/ORI)│  (jauges/priorités/      │
│          ├─▶ systemScores, testStatuses      │  hypothèses/rapport)     │
│          ├─▶ rtpStatus                       │                          │
│          │                                    │                          │
│  VAR_REL3 (KPI→fonction, poids 4 niveaux,    │                          │
│  Contribution/Confiance/Spécificité/Sens)    │                          │
│    ├─▶ computeQualityStatus(9 noms) ─▶ qualityScores  ❌ MOTEUR FANTÔME │
│    ├─▶ computeCapaciteStatus() ─▶ capaciteScores  ✅ ACTIF (Capacités,  │
│    │                                                ExpertView only)    │
│    └─▶ varRelHTML() ✅ ACTIF mais périphérique (détail 1 variable,      │
│                         ExpertView only)                                │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ functionScores transmis en entrée (lecture seule,
                              │ "principe d'étanchéité" déjà documenté)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NIVEAU 2/3 — PHASES CMJ & PROFILS (cluster "Mouvement")                │
│  Indépendant de VAR_REL3. 9 moteurs orchestrés par                       │
│  computeMouvementAnalysis(bilan,pop,age,functionScores) :                │
│                                                                           │
│  computeBiomecaEngine (phases) ─▶ computeCoherenceEngine (transitions)  │
│    ─▶ computeAllBiomechanicalProfiles/computeSignatureBiomecanique      │
│      (Niveau 3 Profils) ─▶ computeSyntheseBiomecanique/                 │
│      computeSyntheseExperteKinexus ─▶                                   │
│      computeMoteurRaisonnementBiomecanique (Fil de Raisonnement)        │
│        ─▶ computePriorisationClinique (priorité1/2/3, PHASE-level,      │
│            distinct des "priorities" Niveau 1 ci-dessus)                │
│        ─▶ computeConfianceKinexus (+ primitive computeIndiceConfiance,  │
│            référentiel CONFIANCE_SIGNAUX_PHASE)                         │
│        ─▶ explicationConclusionPhase, computeMoteurAlerte               │
│  computeAsymEngine (+ computeConfianceAsymetrie) — asymétries/phase     │
│  computeIndicesBiomecaniques — RSI-Mod/FT:CT/DSI                        │
│                                                                           │
│  ✅ ACTIF — consommé par MouvementView, FilDeRaisonnementView            │
│  (toutes deux dans l'onglet AnalyseView) et par la section "Mouvement"  │
│  du rapport PDF (buildSportifReport, uniquement si CMJ actif)           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Point clé** : le cluster Niveau 2 ne lit ni `VAR_REL3` ni `qualityScores`/`capaciteScores` — sa
seule dépendance au Niveau 1 est `functionScores` (TFM), reçu en lecture seule pour distinguer, dans
le Fil de Raisonnement, un "déficit confirmé" (constat biomécanique qui trouve un écho dans une
qualité déjà déficitaire selon TFM) d'un "signal isolé" (aucun écho) — logique déjà documentée dans
`KINEXUS_CLINICAL_ARCHITECTURE.md` et confirmée dans le code (commentaires lignes 3334-3343).

---

## 2. Table des moteurs — nom, rôle, entrées, sorties, consommateurs, statut

### Niveau 1 — Qualités

| Moteur | Rôle | Entrées | Sorties | Écrans consommateurs (vérifié) | Statut |
|---|---|---|---|---|---|
| `TFM` (données, ligne 750) + `computeMoteur()` (ligne 4184) | Calcule le statut (vert/jaune/orange/rouge) des 10 FUNCTIONS, les priorités cliniques (top 3 déficits), une hypothèse et une orientation par priorité (via tables `HYPO`/`ORI`, texte-modèle paramétré par le "contributeur système" principal) | `testData`, `questData`, `normPop`, `normAge` | `functionScores`, `priorities` (avec `hypothese`/`orientation` éditables par le praticien), `systemScores`, `testStatuses`, `rtpStatus` | `ReportPreview` (rapport PDF, l.5254), `AnalyseView` (dashboard, l.5920), `HistoriqueView` (comparaison, l.6627-6628) | **✅ ACTIF — seul moteur réellement affiché pour les qualités, priorités, hypothèses, orientations, jauges** |
| `VAR_REL3` (données, ligne 4009) + `computeQualityStatus()` (ligne 4070) | Calcule le statut d'"une qualité" par moyenne pondérée des KPIs dont `measures`/`estimates` pointent vers elle | `qualityName`, `testData`, `pop`, `age` | Un statut unique | Appelé à 2 endroits seulement (voir lignes suivantes) — **jamais directement par un écran** | Primitive interne, pas un moteur autonome |
| … via `qualityScores` (calculé l.4238-4240, liste hardcodée de 9 noms sans "Mobilité") | — | `computeQualityStatus()` × 9 | `qualityScores` (objet) | **Aucun** — recherche exhaustive de `qualityScores` dans tout le fichier : 3 occurrences, toutes dans sa propre définition (l.4238/4240/4244). Jamais lu ailleurs | **❌ MOTEUR FANTÔME — calculé, jamais consommé** |
| … via `computeCapaciteStatus()` (l.4089) → `capaciteScores` (l.4242-4243) | Calcule le statut de 4 "Capacités" (Saut/Accélération/Réception/Changement de direction), chacune décomposée en sous-capacités elles-mêmes composées de qualités VAR_REL3 (noms propres : Propulsion, Force maximale, Contrôle moteur, Résistance neuromusculaire — définis dans `CAPACITES_DATA`, l.4012) | `capKey`, `testData`, `pop`, `age` | `capaciteScores[capKey]` | `ExpertView` uniquement (l.6576, panneau "Capacités") — **pas dans le rapport PDF** (vérifié : absent de `buildSportifReport`/`buildExpertReport`) | **✅ ACTIF mais périmètre étroit — Expert View seulement** |
| `varRelHTML()` (l.4125) | Affiche le détail d'une variable (MEASURES/ESTIMATES/EXPLAINED_BY/EXPLAINS/CORRELATED_WITH/REFINED_BY/INFLUENCES) directement depuis `VAR_REL3` | `testKey`, `kpiKey`, `testData`, `pop`, `age` | Fragment HTML | `ExpertView` uniquement (l.6569, popup détail d'un KPI) | **✅ ACTIF mais périphérique — un seul point d'appel** |

### Niveau 2/3 — Phases CMJ, Cohérence, Profils, Raisonnement (cluster "Mouvement")

| Moteur | Rôle | Écrans consommateurs (vérifié) | Statut |
|---|---|---|---|
| `computeBiomecaEngine`/`computeBiomecaPhase` (l.1590/1538) | Statut + conclusion par phase CMJ (Unloading/Braking/Concentric/Flight/Landing) | Via `computeMouvementAnalysis` uniquement | ✅ Actif |
| `computeCoherenceEngine` (l.1721) | Cohérence des transitions entre phases | idem | ✅ Actif |
| `computeAllBiomechanicalProfiles`/`computeSignatureBiomecanique` (l.2025/2064) | Niveau 3 — profils biomécaniques (discriminants/confirmatoires/descriptifs) | idem | ✅ Actif |
| `computeSyntheseBiomecanique`/`computeSyntheseExperteKinexus` (l.2295/2357) | Synthèse inter-niveaux | idem | ✅ Actif |
| `computeMoteurRaisonnementBiomecanique` (l.2478) | Croisement profils × phases → matière du Fil de Raisonnement | idem | ✅ Actif |
| `computePriorisationClinique` (l.2634) | **`priorite1`/`priorite2`/`priorite3` — priorités au niveau PHASE, distinctes des `priorities` Niveau 1 ci-dessus** | `MouvementView` (l.3400/3479/3585/3588), `FilDeRaisonnementView`/`buildRaisonnementBoardCMJ` (l.3909), rapport PDF section Mouvement (l.5087) | ✅ Actif |
| `computeConfianceKinexus` (l.2767) + primitive `computeIndiceConfiance` (l.2689) + référentiel `CONFIANCE_SIGNAUX_PHASE` (l.2727) | Indice de confiance par phase | Via `computeMouvementAnalysis` (l.3362) | ✅ Actif |
| `explicationConclusionPhase` (l.2800) | Texte d'explication par phase | idem | ✅ Actif |
| `computeMoteurAlerte` (l.2916) | Alertes transversales | idem | ✅ Actif |
| `computeAsymEngine` (l.3111) + `computeConfianceAsymetrie` (l.3100) | Asymétries G/D par phase + confiance associée | idem | ✅ Actif |
| `computeIndicesBiomecaniques` (l.3258) | Indices RSI-Mod / FT:CT / DSI | idem | ✅ Actif |
| `computeMouvementAnalysis` (l.3345) | **Point d'entrée unique** — orchestre les 9 moteurs ci-dessus pour un bilan CMJ, reçoit `functionScores` (Niveau 1) en 4e paramètre optionnel | `ReportPreview`/`buildSportifReport` (l.4550, section "Mouvement"), `AnalyseView` (l.5922) | ✅ Actif |

---

## 3. Qui produit quoi (réponse directe aux questions du praticien)

| Sortie visible | Produite par | Confirmé par |
|---|---|---|
| **Qualités** (statut vert/jaune/orange/rouge des 10 FUNCTIONS, jauges) | `TFM` → `computeMoteur().functionScores` | Seul point d'écriture des jauges (`FunctionGaugeCard`, `RadarChart` lisent `fSc`) |
| **Capacités** (Saut/Accélération/Réception/Changement de direction) | `VAR_REL3` → `computeCapaciteStatus().capaciteScores` | l.6576, ExpertView uniquement |
| **Hypothèses** (Niveau 1, "Pourquoi ?" dans le rapport/dashboard) | `TFM` → tables statiques `HYPO`/`ORI` (l.4211-4212), phrase-modèle paramétrée par le contributeur système principal — **éditable manuellement par le praticien** (`updatePriority`, l.5295) | l.4778/4876/5173, etc. |
| **Hypothèses** (Niveau 2, Fil de Raisonnement — narration dynamique liée aux profils biomécaniques) | Cluster Mouvement → `computeMoteurRaisonnementBiomecanique`/`composeNarrativeParagraph` | `FilDeRaisonnementView` |
| **Orientations cliniques** (Niveau 1) | `TFM` → table statique `ORI` | l.4877/5004/6139 |
| **Priorités** (Niveau 1 — fonction déficitaire) | `TFM` → `computeMoteur().priorities` | Rapport + dashboard + ExpertView |
| **Priorités** (Niveau 2 — phase CMJ) | Cluster Mouvement → `computePriorisationClinique` (`priorite1/2/3`) | `MouvementView`/`FilDeRaisonnementView`/rapport section Mouvement |
| **Jauges** | `TFM` → `functionScores` | `FunctionGaugeCard`, `RadarChart` |
| **Rapports (PDF)** | Les deux clusters : `computeMoteur()` (TFM) pour la partie Qualités/Priorités, `computeMouvementAnalysis()` (cluster Mouvement, lui-même alimenté par `functionScores`) pour la section Mouvement — **jamais `VAR_REL3`/`qualityScores`/`capaciteScores`** | `buildSportifReport`/`buildExpertReport`, vérifié absence de `capaciteScores` |
| **Indicateurs de confiance** | Deux mécanismes distincts : `computeConfianceKinexus` (confiance par phase, Niveau 2, référentiel `CONFIANCE_SIGNAUX_PHASE`) et `computeConfianceAsymetrie` (confiance des constats d'asymétrie) — **aucun indicateur de confiance au Niveau 1 Qualités** (TFM n'a pas de notion de confiance ; `computeCapaciteStatus` non plus) | l.2767/l.3100 |

---

## 4. Quelles couches sont réellement utilisées — inventaire actif/fantôme

| Objet | Statut | Preuve |
|---|---|---|
| `TFM` | ✅ Actif, cœur du système | Seule source de `functionScores`, elle-même consommée partout |
| `functionScores` | ✅ Actif | Consommé par 3 écrans directement + tout le cluster Mouvement en entrée |
| `qualityScores` (VAR_REL3, 9 noms) | ❌ **Moteur fantôme confirmé** — calculé, jamais lu | 0 consommateur trouvé sur l'ensemble du fichier |
| `capaciteScores` (VAR_REL3) | ✅ Actif mais étroit | 1 seul écran (ExpertView), absent du rapport |
| `varRelHTML` (VAR_REL3) | ✅ Actif mais périphérique | 1 seul point d'appel (détail d'une variable, ExpertView) |
| Cluster Mouvement (9 moteurs Niveau 2/3) | ✅ Actif, système complet et autonome | Alimente 2 écrans + 1 section de rapport |
| `computeIndiceConfiance` | Primitive interne réutilisée (pas un moteur autonome) | Appelée par 2 moteurs de confiance différents, jamais par l'UI directement |

**Aucun autre "moteur fantôme" identifié** au-delà de `qualityScores` — tous les autres objets
calculés par `computeMoteur()`/`computeMouvementAnalysis()` ont au moins un consommateur UI vérifié.
Note de prudence : cette cartographie couvre les moteurs de raisonnement clinique (l'objet de la
Phase A) ; elle n'a pas cherché exhaustivement d'éventuel code mort dans les couches import CSV,
authentification ou persistance, hors périmètre de cette mission.

---

## 5. Mission 3 — Vérification de l'hypothèse des "3 générations"

**Hypothèse du praticien** : TFM (historique) → VAR_REL3 (intermédiaire) → HYP### (futur).

**Verdict : partiellement confirmée, avec une nuance importante à ne pas perdre.**

- **TFM est bien le système historique et actuellement seul actif pour les qualités** — confirmé
  sans ambiguïté (section 2-3 ci-dessus).
- **HYP### est bien future et non codée** — confirmé, cohérent avec
  `KINEXUS_CLINICAL_ARCHITECTURE.md` ("Statut d'implémentation : pas encore codé").
- **VAR_REL3 n'est pas une "génération intermédiaire" au sens d'un remplacement partiel de TFM en
  cours de bascule.** C'est plus précis que ça : VAR_REL3 est un graphe de relations plus riche
  (KPI par KPI, avec Contribution/Confiance/Spécificité/Sens, poids à 4 niveaux au lieu de 3),
  construit dans un premier temps comme donnée pilote (tâches #46-51 de l'historique de session)
  puis étendu (#17/22), avec l'intention apparente de nourrir le raisonnement clinique — mais son
  intégration s'est arrêtée à mi-chemin : elle alimente réellement 2 fonctionnalités périphériques
  (Capacités, détail de variable) et un troisième point (`qualityScores`) qui a été écrit mais
  jamais branché à un écran. **TFM n'a jamais été mis en cause ni partiellement retiré** au profit
  de VAR_REL3 — les deux coexistent depuis le début, sans jamais avoir été conçus comme des étapes
  successives d'une même migration linéaire.
- **Recouvrement** : `computeQualityStatus()` (VAR_REL3) et `computeMoteur()`'s `fSc` (TFM)
  calculent conceptuellement la même chose (un statut par qualité) de deux façons différentes, à
  partir de deux sources de poids différentes (`TFM` vs `VAR_REL3`), sans jamais être comparés ni
  réconciliés dans le code.
- **Redondance** : `qualityScores` est un calcul pur perdu — un cycle de calcul pour un résultat
  jamais affiché.
- **Contradiction potentielle non vérifiée** : puisque `TFM` et `VAR_REL3` utilisent des poids
  indépendants pour les mêmes couples test/qualité, il est probable (mais non encore vérifié
  qualité par qualité) que leurs statuts respectifs divergent parfois pour un même bilan — sujet
  pertinent pour la Mission 2 (audit TFM), pas tranché ici.

**Conclusion pour la suite** : le HYP### futur remplacera vraisemblablement TFM (le système qui
compte aujourd'hui), pas VAR_REL3. VAR_REL3 restera pertinent pour Capacités et le détail de
variable indépendamment du sort de TFM/HYP###, sauf décision contraire du praticien.

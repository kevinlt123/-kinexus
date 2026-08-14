# Phase G — Plan d'implémentation du moteur HYP### V1

## Statut de ce document

Le chantier de conception clinique est terminé. Source de vérité clinique unique :
`KINEXUS_REASONING_ENGINE_V1.md`. Vierge_7 n'est plus consulté sauf absence d'information dans ce
document. **Ce document ne code rien, ne modifie aucune règle clinique validée, ne crée aucune règle
métier nouvelle, ne rouvre aucun ADR, ne réinterprète rien de `KINEXUS_REASONING_ENGINE_V1.md`.**
Il transforme l'architecture déjà gelée en plan d'implémentation logicielle.

**Règle de méthode explicitement imposée** : aucun moteur, fonction ou écran existant n'est présumé
supprimable. Pour chaque composant cartographié en §1, §3 démontre explicitement son devenir —
conservé / remplacé / encapsulé / déprécié / supprimé — avec justification, jamais par défaut.

Toutes les références de ligne sont vérifiées sur `/home/user/-kinexus/index.html` (6824 lignes).

---

# 1 — État actuel du système

## 1.1 Schéma complet des flux de données

```
                                   testData (bilan)
                                        │
                    ┌───────────────────┼────────────────────────┐
                    ▼                   ▼                        ▼
           computeTestStatus()    TFM + effectiveTFMWeight   VAR_REL3
           (:4171, par test,      (:750/793, poids            (:4009, graphe
            seuils THRESHOLDS      test→fonction)              KPI-à-KPI,
            :1214/applyThr)             │                       4 tiers poids)
                    │                   ▼                        │
                    │            computeMoteur()          ┌──────┼──────┐
                    │              (:4184)                ▼      ▼      ▼
                    │           ┌──────┼──────────┐  computeQuality  varRelHTML
                    │           ▼      ▼          ▼    Status(:4070)  (:4125)
                    │      functionScores systemScores priorities  │      │
                    │        (:4187)      (:4187)     (:4213)      ▼      ▼
                    │           │            │           │   qualityScores  ExpertView
                    │           │            │           │    (:4238, MORT)  (relations)
                    │           │            │           │        capaciteScores
                    │           │            │           │         (:4093, VIVANT)
                    │           │            │           │
              testStatuses  rtpStatus   (retournés ensemble par computeMoteur, :4244)
                    │                            │
        ┌───────────┴───────┬────────────────────┴───────────────┬─────────────┐
        ▼                   ▼                                    ▼             ▼
   TestEntry          ReportPreview                         AnalyseView   HistoriqueView
   (:5789/5883,        (:5251, res propre)                  (:5914, res    (:6619, 2×res
    statut en saisie)        │                                principal,    A/B, compare
                              ▼                                :5920)       functionScores)
                        buildSportifReport/                      │
                        buildExpertReport                        ├──► ExpertView (:6545,
                        (:4533/:5146)                             │    fSc/sysSc/tSt/pri/
                              │                                    │    capaciteScores/VAR_REL3)
                              ▼                                    │
                        PDF (rapport)                              ├──► computeMouvementAnalysis()
                                                                    │    (:3345, functionScores
                                                                    │    en 4ᵉ paramètre)
                                                                    │         │
                                                                    │         ├──► computeAsymEngine()
                                                                    │         │    (:3111, cmjValues)
                                                                    │         │         │
                                                                    │         │         ▼
                                                                    │         │    asymEngine (:3376,
                                                                    │         │    stocké dans le
                                                                    │         │    résultat, jamais
                                                                    │         │    relu par computeMoteur)
                                                                    │         │
                                                                    │         ├──► computePriorisationClinique()
                                                                    │         │    (:2634, dossierPreuvesPhase
                                                                    │         │    :2560, countMoteurs :2585)
                                                                    │         │
                                                                    │         └──► asymPhaseSummary()
                                                                    │              (:3408, lit cartographie
                                                                    │              d'asymEngine)
                                                                    │                   │
                                                                    ├──► MouvementView (:3581, :6160)
                                                                    │
                                                                    └──► buildRaisonnementBoardCMJ()
                                                                         (:3908) → FilDeRaisonnementView
                                                                         (:3763, :6165) — lit
                                                                         analysis.functionScores (:3966),
                                                                         dossier.countMoteurs (:3951),
                                                                         asymPhaseSummary (:3914)

  Dashboard (:5537) — hors de ce schéma : lit uniquement la liste des athlètes, aucune donnée
  de scoring.
  QualityConfigView (:5399) — écrit dans qualityVarState, lu par effectiveTFMWeight — seul point
  d'édition humaine du poids TFM.
```

## 1.2 Qui calcule quoi (table de référence)

| Fonction/objet | Ligne | Calcule | À partir de |
|---|---|---|---|
| `computeTestStatus()` | `:4171` | Statut vert/jaune/orange/rouge d'**un test** | `applyThr()`/`THRESHOLDS`/normes population |
| `computeQualityStatus()` | `:4070` | Statut d'**une qualité** (nommage VAR_REL3, distinct de `FUNCTIONS`) | `VAR_REL3`, `POIDS_RANK` |
| `computeMoteur()` | `:4184` | `functionScores, systemScores, testStatuses, priorities, rtpStatus, qualityScores, capaciteScores` | `TFM`/`effectiveTFMWeight`, `SYSTEM_TESTS`, `VAR_REL3` (via `computeQualityStatus`/`computeCapaciteStatus`) |
| `computeAsymEngine()` | `:3111` | Asymétries par phase CMJ | `cmjValues` (issu du bilan) |
| `computeMouvementAnalysis()` | `:3345` | Analyse biomécanique complète (phases, cohérence, priorisation clinique, asymEngine, alertes) | `bilan`, `pop`, `age`, **`functionScores`** (lecture seule, sens Qualités→Phases) |
| `computePriorisationClinique()` | `:2634` | Phases prioritaires (Mouvement) | `dossierPreuvesPhase()`, lui-même lecteur de `functionScores` |
| `buildRaisonnementBoardCMJ()` | `:3908` | Le "board" affiché par le Fil de Raisonnement | `computeMouvementAnalysis()`'s résultat complet |

## 1.3 Qui consomme quoi (table de référence)

| Consommateur | Ligne | Lit |
|---|---|---|
| `AnalyseView` | `:5914` | `computeMoteur()` (`res`, `:5920`) + `computeMouvementAnalysis(...,res.functionScores)` (`:5922`) |
| `ExpertView` | `:6545` | `res.functionScores/systemScores/testStatuses/priorities/capaciteScores` + `VAR_REL3` direct |
| `ReportPreview` | `:5251` | `computeMoteur()` propre (`:5254`) |
| `HistoriqueView` | `:6619` | `computeMoteur()` ×2 (`:6627-6628`) — **n'appelle jamais** `computeMouvementAnalysis()` |
| `buildSportifReport`/`buildExpertReport` | `:4533`/`:5146` | `functionScores/systemScores/priorities/rtpStatus/testStatuses` |
| `FilDeRaisonnementView` (via `buildRaisonnementBoardCMJ`) | `:3763`/`:3908` | `analysis.functionScores` (`:3966`), `dossier.countMoteurs` (`:3951`), `analysis.priorisation`, `asymPhaseSummary(analysis)` |
| `MouvementView` | `:3581` | `analysis` complet (props depuis `AnalyseView`, `:6160`) |
| `TestEntry` | `:5789` | `computeTestStatus()` (`:5883`, statut live en saisie) |
| `QualityConfigView` | `:5399` | `qualityVarState` (écrit), lu ensuite par `effectiveTFMWeight` |
| `Dashboard` | `:5537` | Uniquement `props.athletes` — **aucune donnée de scoring** |

## 1.4 Qui affiche quoi (table de référence)

| Écran | Affiche |
|---|---|
| Dashboard | Roster athlètes, recherche/filtre — aucune qualité/hypothèse |
| ExpertView | Jauges par fonction (`fSc`), systèmes, capacités, relations VAR_REL3 |
| MouvementView | Phases biomécaniques, asymétries, profils |
| FilDeRaisonnementView | Threads narratifs par phase prioritaire, 3 registres (déficit confirmé/signal isolé/observation) |
| HistoriqueView | Comparaison `functionScores` entre 2 bilans |
| ReportPreview → PDF | Rapport sportif/expert (fonctions, systèmes, priorités, RTP) |
| QualityConfigView | Édition des poids TFM par le praticien |

---

# 2 — Architecture cible HYP### V1

## 2.1 Flux cible

```
                                   testData (bilan)
                                        │
                    ┌───────────────────┼───────────────────────────────┐
                    ▼                   ▼                                ▼
           computeTestStatus()    TFM (inchangé,             computeHypothesisEngine()
           (RÉUTILISÉ tel quel     coexiste)                       [NOUVEAU]
            comme primitive             │                                │
            d'évaluation)               ▼                     ┌──────────┼──────────┐
                    │              computeMoteur()             ▼          ▼          ▼
                    │              (inchangé)              hypotheses  cliOrientations
                    │                    │                 (8 HYP###)   (par HYP Retenue)
                    │              functionScores                │
                    │                    │                        │  (lecture seule,
                    │                    │                        │   gel point 3)
                    │                    ▼                        │◄────────────┐
                    │           (tous consommateurs actuels,      │             │
                    │            §1.3, INCHANGÉS en V1)           │      asymEngine (déjà
                    │                                             │      calculé par
                    └─────────────────────────────────────────────┘      computeMouvementAnalysis)
                                                                    │
                                            Nouvelle surface d'affichage isolée
                                            (V1 hybride/shadow, §4-§5)
```

## 2.2 Objets métier
`HYP_CATALOG` (référentiel statique, transcription figée de `HYP_ARCHITECTURE_PHASE_C.md`),
`Evidence`, `HypothesisResult`, `CLIOrientationResult`, `SupportMetadata`,
`InstrumentalConfidence`. Interfaces complètes et exemple JSON en §6 (Étape 3).

## 2.3 États
Cycle à 5 états gelé, non modifié : `ABSENTE → SUSPECTÉE → RETENUE/FAIBLE → RETENUE/MODÉRÉE →
RETENUE/FORTE`. Exception Mobilité : `ABSENTE → RETENUE` direct. État Réfutée : non implémenté
(ADR-002). `HYP-CSM-01` : aucun état calculé (suspendue).

## 2.4 Dépendances (nouvelles, du moteur cible)
`computeHypothesisEngine(testData, normPop, normAge, asymEngine?)` dépend de :
`HYP_CATALOG` (nouveau, statique) ; `computeTestStatus()`/`applyThr()` (existant, réutilisé sans
modification) ; `THRESHOLDS`/normes population (existant, à auditer pour couverture — §8) ;
optionnellement `asymEngine` (existant, lecture seule, pour `HYP-ABS-01` uniquement).
**Ne dépend pas** de `TFM`, `VAR_REL3`, ni `functionScores`.

---

# 3 — Analyse d'impact

## 3.1 Devenir de chaque composant existant (démontré, pas supposé)

| Composant | Ligne | Devenir | Justification |
|---|---|---|---|
| **`TFM`** | `:750` | **Conservé** (V1 hybride/shadow) → **Déprécié** seulement après bascule V2 confirmée, jamais supprimé par anticipation | Pilote 100 % de l'UI actuelle ; sa suppression avant que tous ses consommateurs (§1.3) soient re-câblés casserait l'application en production |
| **`effectiveTFMWeight()`/`qualityVarState`** | `:793` | **Conservé**, dépendance cachée identifiée | `QualityConfigView` (écran entier) n'a de sens que tant que TFM existe — sa dépréciation devra être traitée explicitement au même moment que celle de TFM, pas oubliée |
| **`computeMoteur()`** | `:4184` | **Conservé intégralement en V1** ; **partiellement encapsulé/réduit en V2** | Produit 7 objets distincts. HYP### ne concerne que `functionScores` conceptuellement. `testStatuses`, `systemScores`, `rtpStatus`, `capaciteScores` sont **orthogonaux** à HYP### et doivent continuer d'exister sous une forme ou une autre même après toute bascule — la fonction entière ne peut jamais être "supprimée", seule sa boucle d'agrégation pondérée (TFM) serait un jour retirée |
| **`functionScores`** | `:4187` | **Conservé en V1** ; **remplacé en V2** par `hypotheses`/`cliOrientations`, mais uniquement après re-câblage démontré de chacun de ses 6+ consommateurs (§1.3) | Aucun retrait avant re-câblage complet vérifié |
| **`qualityScores`** | `:4238` | **Supprimable en toute sécurité, à tout moment** | Recherche exhaustive : **aucun consommateur nulle part dans le fichier** (§8.1). Seul composant de cette table dont la suppression est déjà justifiée indépendamment de HYP### |
| **`VAR_REL3`** | `:4009` | **Conservé, non touché** | Alimente `capaciteScores` (vivant, question clinique différente) et `varRelHTML`/`deriveRootCauses` (navigateur exploratoire, vivant). HYP_CATALOG est un référentiel **nouveau et distinct**, pas un remplacement de VAR_REL3 |
| **`computeQualityStatus()`** | `:4070` | **Conservé** | Appelé par `computeCapaciteStatus` (vivant) en plus du `qualityScores` mort — retrait impossible sans casser `capaciteScores` |
| **`computeTestStatus()`/`applyThr()`** | `:4171` | **Conservé, réutilisé comme dépendance partagée** | Devient une primitive commune à `computeMoteur()` ET `computeHypothesisEngine()` — modification future à traiter avec double vigilance (impact sur 2 moteurs, pas 1) |
| **`THRESHOLDS`** | `:1214` | **Conservé, extension potentielle à auditer** | Couverture actuelle étroite (24 clés) ; possible besoin d'extension pour certaines variables diagnostiques/confirmatives/explicatives des fiches HYP### — audit préalable requis (§8.2), pas une suppression ni une réécriture |
| **`computeAsymEngine()`** | `:3111` | **Conservé, gagne un nouveau consommateur** (lecture seule) | Aucune modification de son interface ; `HYP-ABS-01` devient un second lecteur de son résultat, au même titre que `asymPhaseSummary()` aujourd'hui |
| **`computeMouvementAnalysis()`** | `:3345` | **Conservé** | Continue de produire `asymEngine`/`priorisation`/`alertes` indépendamment de HYP### ; simple extension possible du paramétrage si `ReportPreview`/`HistoriqueView` doivent un jour y accéder aussi (décision produit, §7) |
| **`FilDeRaisonnementView`/`buildRaisonnementBoardCMJ`** | `:3763`/`:3908` | **Conservé en V1** ; **encapsulé/étendu en V2 si décision produit favorable** (§7), jamais par défaut | Le registre narratif (`countMoteurs`) continue de fonctionner sans HYP### ; toute intégration reste une extension explicite, non automatique |
| **`buildSportifReport`/`buildExpertReport`** | `:4533`/`:5146` | **Conservé en V1** ; **étendu (nouvelles sections), pas remplacé, en V2** | La checklist RTP et les sections systèmes/tests restent indépendantes de HYP### |
| **`Dashboard`** | `:5537` | **Non touché, à aucune étape** | Ne lit aucune donnée de scoring (§1.4) — hors du périmètre de tout ce chantier |
| **`ExpertView`** | `:6545` | **Conservé en V1** (gagne un onglet) ; **encapsulé en V2** (l'onglet "fonctions" changerait de source de données) | Les onglets systèmes/capacités/relations restent inchangés dans tous les cas |
| **`HistoriqueView`** | `:6619` | **Conservé en V1** ; **étendu en V2** (comparaison sur `hypotheses` en plus de/à la place de `functionScores`) | Suit le même patron déjà utilisé pour `functionScores` — aucune architecture nouvelle |
| **`QualityConfigView`** | `:5399` | **Conservé tant que TFM existe** ; **à traiter explicitement (déprécié ou redéfini) au moment de la dépréciation de TFM, jamais oublié** | Dépendance cachée directe sur `qualityVarState`/TFM — un re-câblage V2 qui l'ignorerait laisserait un écran de configuration sans effet réel, une régression silencieuse |

## 3.2 Modules touchés (toute étape confondue)
`computeMoteur()` (partiellement, en V2 seulement) ; `ExpertView` (ajout d'onglet) ; `HistoriqueView`
(extension) ; `ReportPreview`/rapports PDF (extension, V2) ; `AnalyseView` (nouveau point de montage
pour la surface HYP###) ; `QualityConfigView` (à traiter explicitement en V2).

## 3.3 Modules non touchés (à aucune étape de ce plan)
`Dashboard`, `AthleteForm`, `AthleteProfile`, `BilanForm`, `TestEntry` (hormis sa dépendance déjà
existante à `computeTestStatus`, inchangée), `computeAsymEngine()` (interface), `VAR_REL3`,
`computeQualityStatus()`, `capaciteScores`.

## 3.4 Risques de régression
- Un consommateur de `functionScores` oublié lors d'un futur re-câblage V2 (§1.3 sert de check-list
  exhaustive à revérifier à ce moment).
- `QualityConfigView` rendu silencieusement inopérant si sa dépendance à TFM n'est pas traitée
  explicitement au moment voulu.
- Modification de `computeTestStatus()`/`applyThr()` impactant simultanément `computeMoteur()` et
  `computeHypothesisEngine()` sans que les deux impacts soient testés.
- Confusion praticien si HYP### et TFM affichent des lectures divergentes sans étiquetage clair de
  ce qui est expérimental.

---

# 4 — Stratégies possibles

## Option A — Remplacement direct de TFM
Retirer `TFM`/l'agrégation pondérée et câbler directement tous les consommateurs sur
`computeHypothesisEngine()`, en une seule étape.
- **Avantages** : pas de période de double maintenance, résout immédiatement la critique de fond
  (agrégation pondérée non justifiable) qui a motivé tout ce chantier.
- **Inconvénients/risques** : **aucun filet de sécurité** — un `HYP_CATALOG` mal transcrit ou une
  couverture `THRESHOLDS` insuffisante (§8.2, non encore auditée) produirait des résultats
  cliniquement faux en production dès le premier bilan, sans période de comparaison pour les
  détecter ; change le modèle mental du praticien (4 couleurs → 5 états + support) sans transition ;
  `QualityConfigView` devient inopérant du jour au lendemain si non traité en amont.

## Option B — Coexistence permanente TFM + HYP###
Les deux moteurs tournent indéfiniment côte à côte, chacun avec ses propres écrans/consommateurs,
sans jamais fusionner ni retirer l'un des deux.
- **Avantages** : aucun risque de régression sur les écrans existants, à aucun horizon.
- **Inconvénients/risques** : ne résout jamais la critique de fond qui a motivé le chantier
  clinique (le praticien continuerait de voir un score pondéré non justifiable à côté du
  raisonnement par hypothèses) ; double maintenance permanente ; risque de confusion durable si les
  deux moteurs divergent sur un même bilan sans que l'un des deux fasse autorité.

## Option C — Shadow mode HYP### avant bascule
`computeHypothesisEngine()` est développé et exposé sur une surface **isolée et clairement
labellisée expérimentale**, sans jamais remplacer les écrans existants, pendant une période de
validation ; une décision de bascule (vers l'Option A, éventuellement partielle/progressive) n'est
prise qu'après cette période, sur la base de résultats comparés.
- **Avantages** : combine la sécurité de B (zéro risque de régression pendant la validation) et la
  trajectoire de A (bascule effective, pas un statu quo permanent) ; les 8×5 cas de
  `PHASE_D_LOGICAL_VALIDATION.md` fournissent déjà une base de tests théoriques prête à l'emploi
  pour cette période ; permet de détecter une erreur de transcription `HYP_CATALOG` ou un trou de
  couverture `THRESHOLDS` **avant** qu'un résultat erroné n'atteigne un écran consulté en pratique
  clinique.
- **Inconvénients/risques** : période de double maintenance temporaire (mais bornée, contrairement
  à B) ; nécessite une discipline d'étiquetage UI stricte pour éviter la confusion praticien pendant
  la période shadow ; retarde le bénéfice clinique final par rapport à A.

---

# 5 — Recommandation argumentée

## Option recommandée
**Option C — Shadow mode avant bascule.**

## Pourquoi
Option A expose directement le praticien à tout défaut de transcription du `HYP_CATALOG` ou trou de
couverture `THRESHOLDS` — deux risques concrets et non encore éliminés à ce stade (§8.2). Option B
abandonne l'objectif même du chantier clinique (sortir d'une agrégation pondérée jugée non
justifiable) au profit d'une sécurité permanente qui n'a de sens que temporairement. Option C est la
seule qui **teste réellement le moteur sur données réelles avant toute conséquence clinique**, tout
en gardant une trajectoire claire vers l'objectif final — elle ne renonce ni à la sécurité, ni à la
finalité.

## Risques (de l'option recommandée)
Période de double maintenance (bornée) ; nécessité d'un étiquetage UI sans ambiguïté ; risque que la
période shadow s'éternise sans critère de sortie explicite si aucune échéance/critère de bascule
n'est fixé (décision produit, hors périmètre de ce document).

## Effort
Modéré à Élevé pour la mise en place du shadow mode (dominé par la transcription `HYP_CATALOG`, pas
par la complexité algorithmique) ; effort de bascule ultérieure (vers A, partielle ou totale) non
estimé ici — dépend des résultats de la période de validation, à replanifier à ce moment.

---

# 6 — Plan d'implémentation détaillé

**Étape 1 — Audit de couverture `THRESHOLDS`.** Vérifier, pour chaque variable diagnostique/
confirmative/explicative citée par les 8 fiches `HYP_ARCHITECTURE_PHASE_C.md`, qu'un seuil normatif
est effectivement résolvable (via `THRESHOLDS` ou les normes population/âge existantes). Produit un
inventaire des trous de couverture, sans les combler ici — préalable technique, aucune dépendance
externe.

**Étape 2 — Rédaction de `HYP_CATALOG`** pour les 7 qualités sans exception ouverte (Force,
Puissance, Réactivité, Explosivité, Stabilisation, Endurance, Mobilité) — transcription fidèle de
`HYP_ARCHITECTURE_PHASE_C.md`, structure définie en §2.2/exemples en annexe technique (interfaces
et JSON déjà produits lors de la première version de ce plan, reproduits ci-dessous pour mémoire) :

```typescript
type HypothesisState =
  | 'absente' | 'suspectee'
  | 'retenue_faible' | 'retenue_moderee' | 'retenue_forte';
  // 'refutee' volontairement absent du V1 — ADR-002

type EvidenceCategory =
  | 'diagnostique' | 'diagnostique_secondaire'
  | 'confirmative' | 'explicative_physio' | 'explicative_biomeca';

interface EvidenceRef {
  testKey: string; kpiKey: string; category: EvidenceCategory;
  mechanismId: string;   // règle de convergence par mécanismes indépendants
  status: 'deficitaire' | 'normal' | 'indisponible';
}

interface SupportMetadata { level: 'faible' | 'moderee' | 'forte'; }

interface InstrumentalConfidence {   // HYP-EXP-01 uniquement — ADR-006
  level: 'limitee' | 'complete'; reason: string; affectedEvidence: string[];
}

interface HypothesisResult {
  hypId: string; qualityName: string; state: HypothesisState;
  support: SupportMetadata | null;
  instrumentalConfidence?: InstrumentalConfidence;
  evidence: EvidenceRef[];
  convergentDiagnosticCount: number; independentMechanismsCount: number;
  triggeredCLI: string[];
}

interface CLIOrientationResult {
  cliId: string; hypId: string; triggered: boolean;
  supportMetadata: SupportMetadata; segment?: string;  // Niveau 2, Force uniquement
}

interface HypothesisEngineResult {
  hypotheses: Record<string, HypothesisResult>;
  cliOrientations: Record<string, CLIOrientationResult>;
  suspendedHypotheses: string[];  // ['HYP-CSM-01']
  computedAt: string; engineVersion: 'V1';
}
```

**Étape 3 — Implémentation de `computeHypothesisEngine()`** : cycle d'états, rôle des preuves,
convergence par mécanismes indépendants, affaiblissement plafonnant (ADR-001) — réutilise
`computeTestStatus()`/`applyThr()` sans les modifier.

**Étape 4 — `InstrumentalConfidence` (Explosivité) et filtrage segmental Niveau 2 (Force,
`CLI200`-`213`)** — logiques déjà spécifiées, pas de nouvelle décision requise.

**Étape 5 — Différer `HYP-ABS-01`** jusqu'à rédaction de l'exception SLLT (dépendance externe,
praticien) ; wiring `asymEngine` en lecture seule une fois cette exception disponible.

**Étape 6 — Surface shadow mode** : nouvel onglet isolé (ex. dans `AnalyseView`/`ExpertView`),
libellé explicitement expérimental, affichant `hypotheses`/`cliOrientations` sans toucher aux
écrans existants.

**Étape 7 — Suite de validation** (voir §7) exécutée avant toute exposition à un usage clinique
réel, même en shadow mode.

**Étape 8 — Période de validation praticien** sur données réelles, comparaison HYP### vs TFM,
critère de sortie à définir par le praticien (décision produit).

**Étape 9 — Décision de bascule** (replanification vers Option A, totale ou progressive) — hors
périmètre de ce document, à documenter séparément le moment venu.

---

# 7 — Critères de validation

## Tests unitaires
Le moteur `computeHypothesisEngine()` doit être testable indépendamment de l'UI, en isolant chaque
règle : génération (Absente→Suspectée), franchissement de seuil, montée de support, affaiblissement
plafonnant, exceptions Mobilité/Explosivité.

## Tests cliniques
Comparaison, sur un échantillon de bilans réels déjà saisis dans Kinexus, des sorties
`computeHypothesisEngine()` vs `computeMoteur()` — revue par le praticien, pas un test automatisé
(seul le praticien peut juger de la plausibilité clinique d'un résultat).

## Cas de validation
Les **8×5 cas théoriques de `PHASE_D_LOGICAL_VALIDATION.md`** (Cas A à E par HYP, déjà rédigés,
déjà résolus par déduction pure) constituent une base de cas de validation directement réutilisable
comme oracle — aucune nouvelle rédaction de cas n'est nécessaire pour démarrer.

## Cas limites
Cas E (valeurs proches du seuil) de chaque fiche ; état `indisponible` d'une variable (KPI non
mesuré sur ce bilan) ; cycle dégénéré de Mobilité (pas de Suspectée) ; `HYP-EXP-01` avec
`InstrumentalConfidence` active ; état "Retenue sans `CLI###`" pour Stabilisation/Landing isolé ;
`HYP-CSM-01` (doit rester non calculée, jamais une exception silencieusement ignorée).

---

# 8 — Dette technique existante

## 8.1 `qualityScores` — moteur fantôme confirmé
Produit `:4238-4241`, retourné `:4244`. Recherche exhaustive : **aucun consommateur dans tout le
fichier**. Seul élément de cette cartographie dont la suppression est déjà justifiée indépendamment
de HYP###, avec preuve à l'appui (pas une supposition).

## 8.2 Couverture `THRESHOLDS` — dette préexistante, plus visible avec HYP###
`THRESHOLDS` (`:1214`) ne couvre que 24 clés `test_kpi`. TFM, par son agrégation pondérée
multi-tests, est structurellement tolérant aux trous de couverture individuels ; un raisonnement par
hypothèses, plus dépendant du statut précis de chaque variable nommée, l'est moins. **Audit requis
avant l'Étape 2** (§6), pas une suppression ni une réécriture de `THRESHOLDS` lui-même.

## 8.3 Doublons de calcul
`computeMoteur()` est appelé deux fois pour un même bilan dans `AnalyseView` (`:5920` principal,
plus la comparaison au bilan précédent `:4711`/`:5938`) — redondance préexistante, sans lien direct
avec HYP### mais à surveiller si `computeHypothesisEngine()` est ajouté au même point de rendu (coût
de calcul cumulé).

## 8.4 Dépendances cachées
`QualityConfigView`/`qualityVarState` → `effectiveTFMWeight` (§3.1) : un écran entier de
configuration praticien n'a de sens que tant que TFM pilote `functionScores`. `HistoriqueView`/
`ReportPreview` → absence d'appel à `computeMouvementAnalysis()` (§1.3) : dépendance cachée
inverse — ces deux écrans ne peuvent pas afficher l'évidence d'asymétrie d'`HYP-ABS-01` sans une
extension explicite, faute d'accès à `asymEngine` aujourd'hui.

## 8.5 Moteurs inutilisés — recherche exhaustive
Seul `qualityScores` (§8.1) est confirmé mort. Aucun autre moteur cartographié en §1 n'est sans
consommateur — `computeQualityStatus()`, bien qu'alimentant en partie le mort `qualityScores`,
reste vivant via `capaciteScores` (§3.1) et ne doit pas être traité comme du code mort par
extension hâtive.

---

# 9 — Estimation de complexité par module

| Module | Complexité | Justification |
|---|---|---|
| Audit couverture `THRESHOLDS` | 🟢 Faible | Vérification systématique, pas de développement |
| `HYP_CATALOG` (7 qualités) | 🟠 Élevée | Volume de transcription, risque d'erreur silencieuse |
| `computeHypothesisEngine()` — cycle + preuves | 🟡 Moyenne | Logique déjà spécifiée (`KINEXUS_REASONING_ENGINE_V1.md` §2-§4), traduction directe |
| Réutilisation `computeTestStatus`/`applyThr` | 🟢 Faible | Primitive déjà existante |
| `CLIOrientationResult` + filtrage segmental Force | 🟡 Moyenne | Condition à deux niveaux, un seul cas particulier |
| `SupportMetadata`/`InstrumentalConfidence` | 🟢 Faible | Structures simples |
| Exception Absorption/SLLT | 🟡 Moyenne (en attente) | Bloquée par une dépendance externe (rédaction praticien), pas par la complexité technique elle-même |
| Surface shadow mode (UI isolée) | 🟡 Moyenne | Nouveau composant, aucune refonte d'écran existant |
| Wiring `asymEngine` (AnalyseView) | 🟢 Faible | `computeMouvementAnalysis()` déjà appelé au même endroit |
| Wiring `asymEngine` (ReportPreview/Historique) | 🟡 Moyenne | Nécessite un appel à `computeMouvementAnalysis()` absent aujourd'hui |
| Traitement explicite de `QualityConfigView` (dépendance cachée) | 🟡 Moyenne | Non technique en soi, mais oubli à haut risque de régression silencieuse |
| Bascule complète vers Option A (si décidée après la période shadow) | 🔴 Élevée | Re-câblage large surface (6+ sites), changement de modèle mental praticien, hors périmètre chiffré de ce plan |

---

**Ce document ne constitue pas une autorisation d'implémentation.** Il décrit ce qu'il faudrait
construire, dans quel ordre, et ce que chaque composant existant devient explicitement à chaque
étape. Le déclenchement effectif du développement, ainsi que la décision de sortie du shadow mode,
restent des décisions du praticien.

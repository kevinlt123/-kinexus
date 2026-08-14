# Phase H — Spécification technique du moteur HYP### V1

## Statut de ce document

Dernière étape avant codage. Sources de vérité : `KINEXUS_REASONING_ENGINE_V1.md` (clinique) et
`PHASE_G_IMPLEMENTATION_PLAN.md` (architecture). Vierge_7 non consulté sauf absence d'information
dans ces deux documents. **Ce document ne code rien, ne modifie aucune règle métier, ne rouvre
aucun ADR, ne crée aucune hypothèse clinique nouvelle.** Toute zone où la précision technique
requise dépasse ce que les documents source spécifient est nommée explicitement comme ambiguïté
résiduelle (§9.2) plutôt que résolue silencieusement.

---

# 1 — Modèle de données

## 1.1 Schéma conceptuel

```
HYP_CATALOG (référentiel statique, 8 entrées actives + 1 suspendue)
     │
     ▼
Hypothesis ──1:N──► DiagnosticEvidence
     │        1:N──► ConfirmativeEvidence
     │        1:N──► ExplanatoryEvidence
     │        1:1──► Convergence
     │        1:1──► TransitionState (son état courant)
     │        0:1──► Support (présent ssi état ∈ Retenue/*)
     │        0:1──► InstrumentConfidence (HYP-EXP-01 uniquement)
     │        1:N──► ClinicalOrientation
     ▼
ClinicalOrientation ──N:1──► Hypothesis (parent)
                      0:1──► Support (copié du parent — ADR-004)
```

## 1.2 Objets métier

### `Hypothesis`
- **Rôle** : représente l'évaluation complète d'une hypothèse HYP### pour un bilan donné.
- **Description** : objet racine du moteur, entièrement dérivé (jamais construit incrémentalement,
  toujours recalculé — §6).
- **Propriétés/types** :

| Propriété | Type | Contrainte |
|---|---|---|
| `hypId` | `string` | Un des 8 identifiants actifs (`HYP-FOR-01`…`HYP-MOB-01`) — jamais `HYP-CSM-01` (suspendue, absente de cette structure) |
| `qualityName` | `string` | Nom de qualité tel que `HYP_ARCHITECTURE_PHASE_C.md` |
| `state` | `TransitionState` | Voir §1.2/`TransitionState` |
| `support` | `Support \| null` | `null` ssi `state ∈ {'absente','suspectee'}` |
| `instrumentConfidence` | `InstrumentConfidence \| undefined` | Présent ssi `hypId === 'HYP-EXP-01'` |
| `diagnosticEvidence` | `DiagnosticEvidence[]` | Toujours peuplé, quel que soit `state` (transparence — §1.3) |
| `confirmativeEvidence` | `ConfirmativeEvidence[]` | Idem |
| `explanatoryEvidence` | `ExplanatoryEvidence[]` | Idem |
| `convergence` | `Convergence` | Voir §1.2/`Convergence` |
| `triggeredOrientations` | `string[]` (`cliId[]`) | `[]` si `state !== 'retenue_*'`, ou si Retenue sans orientation correspondante (cas Stabilisation/Landing — non une erreur) |

- **Relations** : 1—N vers les trois catégories de preuve, 1—1 vers `Convergence`, 0—N vers
  `ClinicalOrientation` (Force peut en avoir plusieurs — Niveau 1 + Niveau 2 segmentaires).

### `ClinicalOrientation`
- **Rôle** : résultat de l'évaluation d'une orientation `CLI###` associée à une `Hypothesis`.
- **Propriétés** :

| Propriété | Type | Contrainte |
|---|---|---|
| `cliId` | `string` | `CLI010`…`CLI213` |
| `hypId` | `string` | Référence la `Hypothesis` parente |
| `level` | `1 \| 2` | 2 uniquement pour `HYP-FOR-01` (`CLI200`-`213`) |
| `triggered` | `boolean` | `true` ssi `parent.state` commence par `'retenue_'` **et** (pour niveau 2) le déficit segmental correspondant est confirmé |
| `supportMetadata` | `Support` | Copie de `parent.support` — ADR-004, jamais un second seuil |
| `segment` | `string \| undefined` | Présent ssi `level === 2` (ex. `'quadriceps'`) |

- **Relations** : N—1 vers `Hypothesis`.

### `Support`
- **Rôle** : métadonnée de niveau de confiance (Faible/Modérée/Forte), transmise à l'affichage —
  jamais un second seuil de déclenchement (ADR-004).
- **Propriétés** : `{ level: 'faible' | 'moderee' | 'forte' }`.
- **Contrainte** : dérivé mécaniquement de `Hypothesis.state` (`retenue_faible→'faible'`, etc.) —
  objet distinct malgré cette dérivation 1:1, précisément pour servir de **frontière de transport**
  entre le moteur interne et la couche `ClinicalOrientation`/affichage, conformément à la demande
  explicite d'ADR-004 (« métadonnée d'affichage »).

### `InstrumentConfidence`
- **Rôle** : confiance instrumentale, strictement séparée du support clinique (ADR-006) —
  `HYP-EXP-01` exclusivement.
- **Propriétés** :

| Propriété | Type | Contrainte |
|---|---|---|
| `level` | `'limitee' \| 'complete'` | `'limitee'` tant que le RFD fenêtré n'est pas mesuré (gel, point 4) |
| `reason` | `string` | Texte fixe, ex. *"RFD non fenêtré — proxy `cmj_conc_rfd` remplace 3 des 4 variables visées"* |
| `affectedEvidence` | `string[]` | `kpiKey[]` concernés, ex. `['cmj_conc_rfd']` |

- **Contrainte structurante (ADR-006)** : **n'influence jamais** `state` ni `support` — objet
  strictement parallèle, jamais lu par le moteur d'états.

### `DiagnosticEvidence`
- **Rôle** : seule catégorie habilitée à générer une hypothèse et à faire franchir le seuil de
  convergence.
- **Propriétés** :

| Propriété | Type | Contrainte |
|---|---|---|
| `testKey` / `kpiKey` | `string` | Référence catalogue Kinexus existant |
| `mechanismId` | `string` | Regroupe les KPIs d'un même test/mécanisme — utilisé par `Convergence` (règle ADR-003) |
| `status` | `'deficitaire' \| 'normal' \| 'indisponible'` | `'indisponible'` si le KPI n'est pas mesuré sur ce bilan |
| `rank` | `'principal' \| 'secondaire' \| undefined` | `'secondaire'` uniquement pour `HYP-PUI-01` (gel, point 5) |

- **Contrainte (gel, point 5)** : une preuve `rank:'secondaire'` n'est évaluée/comptée que si la
  preuve `'principal'` du même mécanisme a `status:'indisponible'` — jamais en renfort à poids égal
  d'une preuve principale disponible.

### `ConfirmativeEvidence`
- **Rôle** : ne génère ni ne fait jamais franchir le seuil — fait progresser Faible→Modérée si
  convergente, plafonne (ADR-001) si discordante.
- **Propriétés** : `{ testKey, kpiKey, status: 'deficitaire' | 'normal' | 'indisponible' }`.
- **Contrainte** : évaluée et enregistrée quel que soit `Hypothesis.state` (y compris Absente/
  Suspectée) pour transparence, mais **sans effet** sur la classification tant que l'état Retenue
  n'est pas atteint (le support, qu'elle graduerait, n'existe pas encore — §2).

### `ExplanatoryEvidence`
- **Rôle** : fait progresser Modérée→Forte si convergente (physiologique et biomécanique
  cumulables, jamais substituables l'une à l'autre), plafonne si discordante.
- **Propriétés** : `{ testKey, kpiKey, kind: 'physiologique' | 'biomecanique', status }`.
- **Contrainte** : même règle de transparence que `ConfirmativeEvidence` (toujours enregistrée,
  effective seulement une fois Modérée atteint).

### `Convergence`
- **Rôle** : encapsule la règle de convergence par mécanismes indépendants (ADR-003) — détermine si
  et quand le seuil diagnostique est franchi.
- **Propriétés** :

| Propriété | Type | Contrainte |
|---|---|---|
| `requiredMechanisms` | `number` | 2 par défaut (7 qualités) ; **1** pour Mobilité (ADR-005) ; **non défini pour Absorption** tant que l'exception SLLT n'est pas rédigée (voir §2.3) |
| `distinctMechanismsObserved` | `number` | Compte des `mechanismId` distincts dont au moins une `DiagnosticEvidence` est `'deficitaire'` |
| `thresholdMet` | `boolean` | `distinctMechanismsObserved >= requiredMechanisms` |
| `mechanismsInvolved` | `string[]` | `mechanismId[]` déficitaires |
| `ruleVariant` | `'default' \| 'mobilite_exception' \| 'absorption_exception_pending'` | Trace explicitement quelle variante de la règle de convergence a été appliquée — utile pour audit/débogage |

### `TransitionState`
- **Rôle** : type énuméré des états du cycle de vie, plus une trace de transition optionnelle pour
  l'explicabilité.
- **Type** :
```typescript
type TransitionState =
  | 'absente'
  | 'suspectee'
  | 'retenue_faible'
  | 'retenue_moderee'
  | 'retenue_forte';
  // 'refutee' délibérément absent — voir §2, contrainte explicite : ne pas construire de
  // mécanisme de réfutation en V1 (ADR-002 non validé). Le nom reste théoriquement retenu dans
  // KINEXUS_REASONING_ENGINE_V1.md, mais aucun type/valeur technique ne lui est réservé ici —
  // réserver une valeur d'enum inutilisable reviendrait à construire une partie du mécanisme.
```
- **Trace de transition (recommandée, engineering pur, pas une règle clinique)** :
```typescript
interface TransitionLogEntry {
  from: TransitionState;
  to: TransitionState;
  triggeredByEvidenceIds: string[];   // `${testKey}_${kpiKey}` des preuves déterminantes
  reason: 'diagnostic_convergence' | 'confirmative_convergence' | 'explanatory_convergence'
        | 'affaiblissement_plafonnant' | 'mobilite_exception_direct';
}
```

## 1.3 Interfaces TypeScript complètes

```typescript
type TransitionState =
  | 'absente' | 'suspectee'
  | 'retenue_faible' | 'retenue_moderee' | 'retenue_forte';

type EvidenceStatus = 'deficitaire' | 'normal' | 'indisponible';

interface DiagnosticEvidence {
  testKey: string; kpiKey: string; mechanismId: string;
  status: EvidenceStatus;
  rank?: 'principal' | 'secondaire';   // HYP-PUI-01 uniquement
}

interface ConfirmativeEvidence {
  testKey: string; kpiKey: string; status: EvidenceStatus;
}

interface ExplanatoryEvidence {
  testKey: string; kpiKey: string; kind: 'physiologique' | 'biomecanique'; status: EvidenceStatus;
}

interface Convergence {
  requiredMechanisms: number;
  distinctMechanismsObserved: number;
  thresholdMet: boolean;
  mechanismsInvolved: string[];
  ruleVariant: 'default' | 'mobilite_exception' | 'absorption_exception_pending';
}

interface Support { level: 'faible' | 'moderee' | 'forte'; }

interface InstrumentConfidence {   // HYP-EXP-01 uniquement — ADR-006
  level: 'limitee' | 'complete';
  reason: string;
  affectedEvidence: string[];
}

interface ClinicalOrientation {
  cliId: string; hypId: string; level: 1 | 2;
  triggered: boolean; supportMetadata: Support;
  segment?: string;   // Niveau 2, HYP-FOR-01 uniquement
}

interface Hypothesis {
  hypId: string; qualityName: string; state: TransitionState;
  support: Support | null;
  instrumentConfidence?: InstrumentConfidence;
  diagnosticEvidence: DiagnosticEvidence[];
  confirmativeEvidence: ConfirmativeEvidence[];
  explanatoryEvidence: ExplanatoryEvidence[];
  convergence: Convergence;
  triggeredOrientations: string[];
}

interface HypothesisEngineResult {
  hypotheses: Record<string, Hypothesis>;              // 8 clés actives
  clinicalOrientations: Record<string, ClinicalOrientation>;
  suspendedHypotheses: string[];                          // ['HYP-CSM-01']
  computedAt: string;
  engineVersion: 'V1';
  hypCatalogVersion: string;                              // traçabilité du référentiel utilisé
}
```

## 1.4 Structure JSON cible (exemple)

```json
{
  "engineVersion": "V1",
  "hypCatalogVersion": "2026-08-14",
  "computedAt": "2026-08-14T10:00:00Z",
  "hypotheses": {
    "HYP-FOR-01": {
      "hypId": "HYP-FOR-01", "qualityName": "Force", "state": "retenue_forte",
      "support": { "level": "forte" },
      "diagnosticEvidence": [
        { "testKey": "imtp", "kpiKey": "n", "mechanismId": "imtp", "status": "deficitaire" },
        { "testKey": "iso_belt_squat", "kpiKey": "n", "mechanismId": "iso_belt_squat", "status": "deficitaire" }
      ],
      "confirmativeEvidence": [
        { "testKey": "imtp", "kpiKey": "nkg", "status": "deficitaire" }
      ],
      "explanatoryEvidence": [
        { "testKey": "knee_ext", "kpiKey": "n", "kind": "physiologique", "status": "deficitaire" }
      ],
      "convergence": {
        "requiredMechanisms": 2, "distinctMechanismsObserved": 2, "thresholdMet": true,
        "mechanismsInvolved": ["imtp", "iso_belt_squat"], "ruleVariant": "default"
      },
      "triggeredOrientations": ["CLI010", "CLI200"]
    },
    "HYP-EXP-01": {
      "hypId": "HYP-EXP-01", "qualityName": "Explosivité", "state": "retenue_moderee",
      "support": { "level": "moderee" },
      "instrumentConfidence": {
        "level": "limitee",
        "reason": "RFD non fenêtré — proxy cmj_conc_rfd remplace 3 des 4 variables visées",
        "affectedEvidence": ["cmj_conc_rfd"]
      },
      "diagnosticEvidence": [], "confirmativeEvidence": [], "explanatoryEvidence": [],
      "convergence": { "requiredMechanisms": 2, "distinctMechanismsObserved": 2, "thresholdMet": true, "mechanismsInvolved": ["cmj_conc_rfd", "cmj_conc_impulse_100"], "ruleVariant": "default" },
      "triggeredOrientations": ["CLI030"]
    }
  },
  "clinicalOrientations": {
    "CLI010": { "cliId": "CLI010", "hypId": "HYP-FOR-01", "level": 1, "triggered": true, "supportMetadata": { "level": "forte" } },
    "CLI200": { "cliId": "CLI200", "hypId": "HYP-FOR-01", "level": 2, "triggered": true, "supportMetadata": { "level": "forte" }, "segment": "quadriceps" }
  },
  "suspendedHypotheses": ["HYP-CSM-01"]
}
```

---

# 2 — Machine à états

## 2.1 Transitions détaillées

### Absente → Suspectée
- **Condition d'entrée** : ≥1 `DiagnosticEvidence.status === 'deficitaire'`, ET `Convergence.thresholdMet === false`.
- **Condition de maintien** : à réévaluation, le seuil reste non franchi.
- **Condition de progression** (→ Retenue/Faible) : `Convergence.thresholdMet` devient `true`.
- **Condition d'affaiblissement** : **non applicable** — `support` n'existe pas encore
  (`null`), rien à plafonner. Les `ConfirmativeEvidence`/`ExplanatoryEvidence` discordantes sont
  enregistrées mais sans effet.

### Suspectée → Retenue/Faible
- **Condition d'entrée** : `Convergence.thresholdMet === true`.
- **Condition de maintien** : aucune `ConfirmativeEvidence` convergente (`deficitaire`).
- **Condition de progression** (→ Retenue/Modérée) : voir ci-dessous.
- **Condition d'affaiblissement** : sans effet observable (Faible est déjà le plancher de
  `Support`) — preuve enregistrée par transparence uniquement.

### Retenue/Faible → Retenue/Modérée
- **Condition d'entrée** : venant de Retenue/Faible uniquement.
- **Condition de progression** : ≥1 `ConfirmativeEvidence.status === 'deficitaire'` convergente.
- **Condition de maintien** (reste à Faible) : aucune confirmative déficitaire.
- **Condition d'affaiblissement** : une `ConfirmativeEvidence`/`ExplanatoryEvidence` discordante
  (`'normal'`) plafonne la progression au palier déjà atteint — **n'annule jamais** une
  `DiagnosticEvidence` existante (ADR-001).
  ⚠️ **Précision non tranchée par les documents source** — voir §9.2 : le comportement exact
  lorsqu'une confirmative convergente **et** une confirmative discordante coexistent
  simultanément pour la même hypothèse n'est disambiguë par aucun document validé. Ce document
  décrit le mécanisme tel que spécifié (progression par convergence, plafonnement par discordance)
  sans trancher leur interaction conjointe — à valider avant codage.

### Retenue/Modérée → Retenue/Forte
- **Condition d'entrée** : venant de Retenue/Modérée uniquement.
- **Condition de progression** : ≥1 `ExplanatoryEvidence.status === 'deficitaire'` (physiologique
  OU biomécanique — cumulables, non substituables l'une à l'autre).
- **Condition de maintien** (reste à Modérée) : aucune explicative déficitaire.
- **Condition d'affaiblissement** : même mécanique de plafonnement que ci-dessus, même précision
  non tranchée (§9.2) en cas de coexistence convergente/discordante.

## 2.2 État Réfutée
**Non implémenté en V1, par contrainte explicite de cette phase.** Aucune valeur d'énumération,
aucune condition d'entrée, aucun mécanisme de transition n'est défini ici pour cet état — conforme
à ADR-002 (non validé) et à l'instruction explicite de ne pas inventer de mécanisme de réfutation.

## 2.3 Exceptions documentées

### Exception Mobilité (ADR-005)
- `Convergence.requiredMechanisms = 1`, `ruleVariant = 'mobilite_exception'`.
- Transition directe **Absente → Retenue/Faible**, aucun état Suspectée traversé (structurellement
  impossible : il n'existe qu'un seul mécanisme diagnostique, donc aucun seuil intermédiaire à ne
  pas encore atteindre).
- `ExplanatoryEvidence` : ensemble vide par construction (`HYP_ARCHITECTURE_PHASE_C.md` — couche
  explicative nulle) → **Retenue/Forte structurellement inatteignable**.
- ⚠️ **Atteignabilité de Retenue/Modérée non tranchée** (§9.2) : la confirmative de Mobilité est
  auto-référentielle (dérivée de la même mesure que le diagnostique, pas un mécanisme indépendant)
  — sous la règle de diversité des mécanismes (ADR-003), il n'est pas certain qu'elle compte comme
  une convergence valable. `KINEXUS_REASONING_ENGINE_V1.md` mentionne "Faible/Modérée" sans
  trancher ce point précis.

### Exception Explosivité (ADR-006)
- Cycle standard à 5 états, **support non plafonné** — peut atteindre Retenue/Forte normalement si
  diagnostique + confirmative + explicative convergent.
- `InstrumentConfidence` calculée **indépendamment**, jamais lue par le moteur d'états — objet
  strictement parallèle (voir §1.2).

### Exception Absorption (SLLT)
- `Convergence.requiredMechanisms` et le regroupement précis des `mechanismId` pour les 5 KPIs
  diagnostiques de SLLT **ne sont pas définis par ce document** — en attente de la rédaction
  explicite de l'exception demandée par le praticien (ADR-003, `KINEXUS_REASONING_ENGINE_V1.md`
  §9.3). `ruleVariant = 'absorption_exception_pending'` documente cet état d'attente dans le
  modèle de données lui-même plutôt que de forcer une valeur arbitraire.
- **Conséquence pour l'implémentation** : `HYP-ABS-01` ne peut pas être câblée avec la même
  certitude que les 7 autres qualités tant que ce point n'est pas résolu — traité comme un module
  différé (§8, module H8), pas comme un blocage du reste du moteur.

---

# 3 — Moteur HYP###

## 3.1 Entrées

| Entrée | Source | Rôle |
|---|---|---|
| `tests` | `bilan.testData` (existant, inchangé) | Valeurs brutes des KPIs |
| `variables` | Résolues depuis `tests` via `applyThr()`/normes population-âge (existant) | Statuts `deficitaire`/`normal`/`indisponible` par KPI |
| `asymétries` | `asymEngine` (`computeAsymEngine()`, existant), lecture seule | `HYP-ABS-01` uniquement, une fois disponible (dépend de `computeMouvementAnalysis()`) |
| `métadonnées` | `normPop`, `normAge` (existants) | Résolution des seuils normatifs |

## 3.2 Sorties
`hypotheses` (`Record<string,Hypothesis>`), `support` (embarqué dans chaque `Hypothesis`),
`instrumentConfidence` (embarqué, `HYP-EXP-01`), `clinicalOrientations`
(`Record<string,ClinicalOrientation>`) — structure complète en §1.3/1.4.

## 3.3 Pipeline complet, ordre d'exécution, dépendances

```
ÉTAPE 0 — Prérequis (déjà existants, non modifiés)
   testData (bilan) ──► applyThr()/computeTestStatus() [primitives réutilisées telles quelles]
   (optionnel, pour HYP-ABS-01) computeMouvementAnalysis() déjà exécuté ──► asymEngine disponible

ÉTAPE 1 — Résolution des preuves, par HYP actif (boucle sur 7-8 qualités, indépendantes entre elles)
   Pour chaque hypId ∈ HYP_CATALOG (hors HYP-CSM-01, suspendue) :
     1a. Évaluer DiagnosticEvidence[] (règle gel point 5 pour HYP-PUI-01 : substitution
         principal→secondaire si indisponible)
     1b. Calculer Convergence (regroupement par mechanismId, requiredMechanisms selon exception
         §2.3) → détermine state ∈ {absente, suspectee, retenue_*}

ÉTAPE 2 — Graduation du support (uniquement si state ∈ Retenue/*)
   2a. Évaluer ConfirmativeEvidence[] → Faible ou Modérée
   2b. Évaluer ExplanatoryEvidence[] (physio + biomeca) → Modérée ou Forte
   2c. Appliquer l'affaiblissement plafonnant (ADR-001) sur toute preuve discordante

ÉTAPE 3 — Cas spécifique HYP-EXP-01
   3a. Calculer InstrumentConfidence en parallèle, sans dépendance aux étapes 1-2

ÉTAPE 4 — Cas spécifique HYP-ABS-01 (DÉPEND de l'étape 0/asymEngine)
   4a. Intégrer les évidences d'asymétrie comme ConfirmativeEvidence/ExplanatoryEvidence en
       lecture seule (gel, point 3) — n'affecte jamais la génération/le seuil (diagnostique reste
       seul habilité)

ÉTAPE 5 — Évaluation des orientations CLI###
   Pour chaque Hypothesis avec state ∈ Retenue/* :
     5a. Évaluer la/les orientation(s) Niveau 1 (CLI010-092 selon qualité)
     5b. Pour HYP-FOR-01 uniquement : évaluer les orientations Niveau 2 segmentaires
         (CLI200-213), gate additionnel sur ExplanatoryEvidence segmentaire spécifique
     5c. Copier Support du parent dans supportMetadata (ADR-004) — jamais un second seuil

ÉTAPE 6 — Assemblage
   Construire HypothesisEngineResult { hypotheses, clinicalOrientations, suspendedHypotheses:
   ['HYP-CSM-01'], computedAt, engineVersion:'V1', hypCatalogVersion }
```

## 3.4 Schéma de flux détaillé

```
                     testData / normPop / normAge
                              │
              ┌───────────────┴───────────────────┐
              ▼                                     ▼
   applyThr()/computeTestStatus()        computeMouvementAnalysis()
   [primitive existante, réutilisée]      [existant — si déjà appelé dans
              │                            l'écran courant]
              │                                     │
              │                                     ▼
              │                              asymEngine (lecture seule)
              │                                     │
              ▼                                     │
   ┌─────────────────────────────────────┐          │
   │   computeHypothesisEngine()          │◄─────────┘ (optionnel,
   │   [NOUVEAU]                          │             HYP-ABS-01 seulement)
   │                                       │
   │  ÉTAPE 1 (×8 qualités, indépendantes) │
   │  ÉTAPE 2 (graduation support)         │
   │  ÉTAPE 3 (InstrumentConfidence, EXP)  │
   │  ÉTAPE 4 (asymEngine, ABS, si dispo)  │
   │  ÉTAPE 5 (CLI### + segmental Force)   │
   │  ÉTAPE 6 (assemblage)                 │
   └───────────────────┬───────────────────┘
                        ▼
              HypothesisEngineResult
                        │
                        ▼
         Surface d'affichage isolée (Shadow Mode — §5)
```

---

# 4 — Intégration au système existant

*Reprend et complète, composant par composant, la table de devenir déjà établie en
`PHASE_G_IMPLEMENTATION_PLAN.md` §3.1 — non réinterprétée, précisée au niveau lu/produit.*

| Composant | Ce qui est lu | Ce qui est produit | Ce qui est remplacé | Ce qui est conservé |
|---|---|---|---|---|
| **`computeMoteur()`** | `testData`, `TFM`, `VAR_REL3` | `functionScores, systemScores, testStatuses, priorities, rtpStatus, qualityScores, capaciteScores` | Rien en V1/shadow ; en Stade 3 (§5), seule sa boucle d'agrégation pondérée productrice de `functionScores` deviendrait obsolète | `testStatuses`, `systemScores`, `rtpStatus`, `capaciteScores` — orthogonaux à HYP###, conservés à toute étape |
| **`TFM`** | Rien (référentiel statique) | Poids test→fonction | Rien avant Stade 3 confirmé | Structure elle-même — jamais supprimée par anticipation |
| **`VAR_REL3`** | Rien (référentiel statique) | `capaciteScores` (via `computeQualityStatus`), `varRelHTML` | Rien — HYP_CATALOG est un référentiel distinct, pas un remplacement | Intégralement conservé, aucune étape ne le concerne |
| **`computeAsymEngine()`** | `cmjValues`, `pop`, `age` | `phases, confiances, priorite1-3, cartographie` | Rien | Interface intégralement inchangée — gagne un second lecteur (`HYP-ABS-01`, lecture seule) |
| **Fil de Raisonnement** (`FilDeRaisonnementView`/`buildRaisonnementBoardCMJ`) | `analysis.functionScores`, `dossier.countMoteurs`, `analysis.priorisation` | Le "board" narratif (threads, registres) | Rien en V1/shadow | Registre narratif actuel intégralement conservé ; intégration HYP### = **décision produit distincte**, non automatique (§9.3) |
| **Dashboard** | `props.athletes` uniquement | Roster affiché | Rien, à aucune étape | Intégralement — hors périmètre de tout ce chantier |
| **Rapport PDF** (`buildSportifReport`/`buildExpertReport`) | `functionScores, systemScores, priorities, rtpStatus, testStatuses` | HTML du rapport | Rien en V1/shadow ; extension (nouvelles sections CLI###/support) envisageable en Stade 3, jamais un remplacement des sections RTP/systèmes | Checklist RTP et sections systèmes/tests, indépendantes de HYP### à toute étape |
| **Historique** (`HistoriqueView`) | `functionScores` de 2 bilans (`computeMoteur()` ×2) | Comparaison delta | Rien en V1/shadow | Mécanisme de comparaison ×2 bilans, réutilisable tel quel pour `hypotheses` en Stade 3 |
| **ExpertView** | `res.functionScores/systemScores/testStatuses/priorities/capaciteScores`, `VAR_REL3` | Jauges par onglet | Rien en V1/shadow ; onglet "fonctions" seul concerné en Stade 3 | Onglets systèmes/capacités/relations, indépendants de HYP### à toute étape |
| **Priorisation** (fonction, `computeMoteur()` `:4213-4232`) | `functionScores` en cours de calcul | Top-3 fonctions déficitaires | Rien en V1/shadow ; en Stade 3, une priorisation équivalente devrait être redéfinie à partir des `Hypothesis` Retenue (support Fort en premier — cohérent avec `KINEXUS_REASONING_ENGINE_V1.md` §Partie 4, non réinventé ici) | Le mécanisme de priorisation clinique (Mouvement, `computePriorisationClinique`) reste totalement indépendant, non concerné |

---

# 5 — Shadow Mode : les trois étapes

## Étape 1 — TFM actif + HYP### silencieux
- **Données calculées** : `HypothesisEngineResult` complet, calculé à chaque bilan (même patron que
  `computeMoteur()` aujourd'hui — dérivé, pas stocké).
- **Données affichées** : **aucune** au praticien. Accès limité à un contexte technique
  (log/panneau de développement non routé dans la navigation normale).
- **Risques** : aucun risque clinique (rien n'est montré) ; risque technique de surcoût de calcul si
  le moteur tourne sur chaque rendu sans contrôle ; risque de fuite accidentelle du panneau
  technique en navigation normale si mal isolé.
- **Critères de sortie** : audit de couverture `THRESHOLDS` complété sans trou critique pour les 7
  qualités prêtes (Phase G §8.2/H1) ; suite de tests (§7) basée sur les cas Phase D, exécutée avec
  succès sur `HYP_CATALOG` (7 qualités).

## Étape 2 — TFM affiché + HYP### affiché
- **Données calculées** : identiques à l'étape 1.
- **Données affichées** : `functionScores` (écrans existants, inchangés) **et**
  `hypotheses`/`clinicalOrientations` sur une surface nouvelle, isolée, explicitement labellisée
  "expérimental" — jamais fusionnées dans un même composant sans distinction visuelle claire.
- **Risques** : confusion praticien si l'étiquetage n'est pas strict ; sur-confiance prématurée
  dans le panneau expérimental avant la fin de la période de validation.
- **Critères de sortie** : période de validation praticien sur données réelles jugée concluante par
  le praticien lui-même (aucun critère numérique substitué à ce jugement) ; absence de divergence
  jugée cliniquement problématique entre les deux moteurs sur l'échantillon revu ; décision
  explicite sur le sort de `HYP-ABS-01` (inclus si l'exception SLLT est résolue d'ici là, sinon
  explicitement exclu de cette étape sans bloquer les 7 autres).

## Étape 3 — HYP### principal
- **Données calculées** : `HypothesisEngineResult` devient la donnée Niveau 1 faisant autorité ;
  la boucle d'agrégation pondérée de `TFM` à l'intérieur de `computeMoteur()` devient obsolète (pas
  supprimée par anticipation — voir table §4).
- **Données affichées** : `hypotheses`/`clinicalOrientations` deviennent la vue principale dans
  `ExpertView`/`ReportPreview`/`HistoriqueView` ; `functionScores` peut rester accessible en vue
  secondaire pendant une période de transition (décision produit, non tranchée ici).
- **Risques** : les plus élevés de toute la migration — re-câblage de 6+ points de consommation
  (`PHASE_G_IMPLEMENTATION_PLAN.md` §1.3), `QualityConfigView` rendu inopérant si son sort n'est pas
  explicitement traité en amont (§4 table, ligne TFM), changement de modèle mental praticien.
- **Critères d'entrée** (il n'y a pas d'étape suivante dont "sortir") : Étape 2 validée + décision
  explicite du praticien de procéder + sort de `QualityConfigView` tranché + `HYP-ABS-01` résolue ou
  explicitement différée avec accord du praticien.

---

# 6 — Persistance

## Ce qui doit être stocké
**Rien de nouveau, par défaut.** `HypothesisEngineResult` reste une donnée dérivée, recalculée à la
demande — cohérence stricte avec le traitement actuel de `functionScores` (jamais persisté dans
`bilan`, toujours recalculé, `PHASE_G_IMPLEMENTATION_PLAN.md` §3.1/§6 Étape 1).

## Ce qui peut être recalculé
**L'intégralité du résultat**, à tout moment, à partir de `testData` déjà stocké (inchangé) — la
fonction est pure (`testData, normPop, normAge, asymEngine?`). Aucune dépendance à un état
intermédiaire conservé entre deux calculs.

## Format recommandé
Aucun nouveau format de persistance requis pour les Étapes 1-2 du Shadow Mode. **Si** un besoin
d'audit/traçabilité historique est confirmé par le praticien (question ouverte,
`KINEXUS_REASONING_ENGINE_V1.md` §3.3, non tranchée par ce document), le format de secours
recommandé serait un instantané JSON de `HypothesisEngineResult` (structure §1.4), taggé
`hypCatalogVersion`, ajouté en complément — jamais en remplacement — du recalcul par défaut.

## Compatibilité avec l'historique existant
`HistoriqueView` fonctionne aujourd'hui sans aucune persistance de `functionScores` (calcul ×2,
comparaison directe — §1 de la cartographie). Le même patron s'applique sans modification à
`hypotheses` le moment venu (§4, ligne Historique) — aucune incompatibilité.

## Migration des anciens bilans
**Aucune migration nécessaire.** Le moteur étant une fonction pure de `testData` (format de
stockage inchangé), tout bilan existant est évaluable par `computeHypothesisEngine()` dès
l'implémentation, sans transformation des données déjà enregistrées.

---

# 7 — Stratégie de tests

## 7.1 Tests unitaires
Par objet/règle isolée : calcul de `Convergence` (seuil par défaut, exception Mobilité) ;
plafonnement par affaiblissement (ADR-001) ; substitution `principal`→`secondaire` (gel, point 5,
`HYP-PUI-01`) ; dérivation de `Support` depuis `state` ; indépendance d'`InstrumentConfidence`
vis-à-vis de `state`/`support` (`HYP-EXP-01`) ; déclenchement `ClinicalOrientation` (Niveau 1 et
filtrage segmental Niveau 2, `HYP-FOR-01`).

## 7.2 Tests d'intégration
`computeHypothesisEngine()` complet, sur des fixtures `testData` synthétiques reproduisant chacun
des cas déjà rédigés dans `PHASE_D_LOGICAL_VALIDATION.md` (voir §7.4 ci-dessous — réutilisation
directe, aucune rédaction de cas nécessaire).

## 7.3 Tests cliniques
Revue par le praticien de `HypothesisEngineResult` calculé sur un échantillon de bilans réels déjà
saisis — jugement qualitatif humain, non automatisable (identique à
`PHASE_G_IMPLEMENTATION_PLAN.md` §7).

## 7.4 Tests de non-régression
Vérifier que `functionScores`/`TFM`/tout consommateur existant produit une sortie **strictement
identique** avant/après l'ajout du moteur HYP### — garanti par construction tant que les Étapes 1-2
du Shadow Mode restent additives (aucune modification de code existant).

## 7.5 Cas par qualité — nominal / limite / contradictoire

| HYP_ID | Cas nominal (Phase D) | Cas limite (Phase D) | Cas contradictoire (Phase D) |
|---|---|---|---|
| `HYP-FOR-01` | Cas A — 4/4 diagnostiques ↓ | Cas E — 2 tests à la frontière du seuil | Cas D — Force↓/Puissance↓/Réactivité normale, ensembles disjoints, validé sans contamination ; + Cas C (déficit segmentaire isolé, doit rester Absente) |
| `HYP-PUI-01` | Cas A — 2/2 | Cas B — 1/2 (CMJ_PP↓ seul) → **doit produire `suspectee`**, plus testable directement grâce à cet état | Cas de Phase E Partie 3 — diagnostique↓ + confirmative (Hop) normale → vérifie l'absence d'effet de l'affaiblissement tant que `support` est `null` |
| `HYP-REA-01` | Cas A — dj_rsi + sldj_rsi ↓ | Cas B — 1/2 → `suspectee` | Cas D (disjoint, validé) + test dédié : `cmjr_mean_rsi` ne doit jamais compter dans `Convergence.mechanismsInvolved` |
| `HYP-EXP-01` | Cas A — 2/2 mesurées ↓ | Cas B — 1/2 → `suspectee` (chemin de convergence structurellement fermé, seules 2 variables existent) | 3 scénarios de proxy (RFD précoce/tardif, Phase D) — vérifie `InstrumentConfidence.level==='limitee'` présent et `support` **non plafonné** même à `forte` |
| `HYP-ABS-01` | Cas A — 4 preuves, ≥2 tests différents | Cas B — **non testable avec certitude tant que l'exception SLLT n'est pas rédigée** (§2.3) — test à écrire après H8 | Cas D partagé avec Stabilisation (validé, disjoint) + vérification Peak Landing Force/Loading Rate/TTS |
| `HYP-STAB-01` | Cas A — SLS ≥2/7 | Cas E — SLS juste sous le seuil + EO/EF/Strobo nettement anormaux (illustre l'incohérence `CLI070`) | Cas D (disjoint d'Absorption, validé) + test dédié de l'état "Retenue sans `CLI###`" (Landing isolé → `triggeredOrientations: []`, pas une erreur) |
| `HYP-END-01` | Cas A — 2/5 `repeated_hop` | Cas B — `heel_raise_reps` seul (statut "local" non tranché — le test doit documenter l'absence de convergence, pas lever d'erreur) | Cas D (disjoint des 7 autres) + test "fatigue progressive vs réactivité" (bonne séparation déjà validée) |
| `HYP-MOB-01` | Cas A — `wblt_distance`↓ seul → `retenue_faible` **direct**, `suspectee` jamais traversé | Structurellement non applicable (une seule variable, déjà noté Phase D) — test dédié : vérifier qu'aucun autre chemin n'active `HYP-MOB-01` | Aucun cas contradictoire identifiable par construction (base de preuve minimale) — absence de cas à documenter comme résultat de test légitime |

---

# 8 — Plan de développement

| Module | Contenu | Dépendances | Effort | Risque | Prérequis |
|---|---|---|---|---|---|
| **H1** | Audit de couverture `THRESHOLDS` pour les 8 fiches | Aucune | Faible | Faible | Aucun — **quick win** |
| **H2** | `HYP_CATALOG` (7 qualités hors Absorption) | H1 | Élevé | Élevé (transcription) | H1 terminé |
| **H3** | Objets de données (`Support`/`InstrumentConfidence`/`Evidence*`/`Convergence`/`TransitionState`) | Aucune | Faible | Faible | Aucun — **quick win**, parallélisable à H1/H2 |
| **H4** | `computeHypothesisEngine()` — cycle, preuves, convergence, affaiblissement | H2, H3 | Moyen | Moyen (ambiguïté §9.2 à trancher) | H1, H2, H3 |
| **H5** | `InstrumentConfidence` (Explosivité) + filtrage segmental Niveau 2 (Force) | H4 | Faible-Moyen | Faible | H4 |
| **H6** | Suite de tests (§7) | H4, H5 | Moyen | Faible | H4 — **quick win relatif** (cas déjà rédigés en Phase D) |
| **H7** | Wiring `asymEngine` en lecture seule (AnalyseView) | H4 | Faible | Faible | H4 — **quick win** |
| **H8** | `HYP-ABS-01` complet | Exception SLLT rédigée (**dépendance externe, praticien**) + H4 | Moyen | Moyen | Bloqué en dehors du chemin critique technique |
| **H9** | Shadow Mode Étape 1 (silencieux) | H4-H7 | Faible | Faible | H4-H7 |
| **H10** | Exécution suite de validation + audit résultats | H9 | Faible (technique) | Moyen (délai praticien) | H9 |
| **H11** | Shadow Mode Étape 2 (double affichage) | H10 validé | Moyen | Moyen (confusion praticien) | H10 |
| **H12** | Période de validation praticien réelle | H11 | — (délai calendaire) | Faible technique | H11 |
| **H13** | Traitement explicite de `QualityConfigView` | Décision produit | Moyen | Élevé si oublié | Anticipé avant H14 |
| **H14** | Bascule Shadow Mode Étape 3 | H12 validé + H13 + décisions produit `PHASE_G_IMPLEMENTATION_PLAN.md` §7.2 | Élevé | Élevé | Tout ce qui précède |

## Quick wins
H1, H3, H6, H7 — faible effort, faible risque, démarrables immédiatement ou dès H4.

## Chemin critique
`H1 → H2 → H4 → H9 → H10 → H11 → H12 → H14` (H13 en parallèle, avant H14). `H5`/`H6`/`H7` se
branchent sur `H4` sans bloquer la suite du chemin. `H8` (Absorption) est **hors chemin critique** —
bloqué par une dépendance externe non technique, peut rejoindre le flux à tout moment une fois
débloqué, sans retarder les 7 autres qualités.

---

# 9 — Validation finale

## 9.1 Architecture technique cible complète
Voir §1 (modèle de données), §2 (machine à états), §3 (moteur et pipeline), §4 (intégration), §5
(shadow mode), §6 (persistance).

## 9.2 Liste des ambiguïtés restantes
1. **Affaiblissement en cas de coexistence** — comportement non tranché quand une preuve
   confirmative/explicative convergente et une preuve discordante de la même catégorie apparaissent
   simultanément pour la même hypothèse (§2.1).
2. **Atteignabilité de Retenue/Modérée pour Mobilité** — la confirmative auto-référentielle
   compte-t-elle comme convergence valable sous la règle de diversité des mécanismes (ADR-003) ?
   (§2.3).
3. **Regroupement des mécanismes SLLT pour Absorption** — exception non rédigée par le praticien à
   ce jour (§2.3, §8 module H8).
4. **Besoin d'audit/traçabilité historique** — non confirmé, conditionnerait le format de
   persistance de secours (§6).
5. **Intégration au Fil de Raisonnement** — décision produit non prise (§4).
6. **Extension `ReportPreview`/`HistoriqueView` pour `asymEngine`** — décision produit non prise
   (§4, §5 Étape 2).

## 9.3 Décisions encore nécessaires avant codage
Trancher (ou documenter un défaut explicite pour) les points 1 et 2 de §9.2 avant d'implémenter H4 ;
obtenir la rédaction de l'exception SLLT avant H8 ; décisions produit déjà identifiées et non
redécidées ici (`PHASE_G_IMPLEMENTATION_PLAN.md` §7.2) : lieu d'affichage du Shadow Mode, extension
`asymEngine` pour Historique/Rapport, persistance, calendrier de bascule.

## 9.4 Liste des modules implémentables immédiatement
H1, H3 (dès maintenant, en parallèle) ; H2, H4, H5, H6, H7 (dès H1/H2/H3 terminés) — soit
l'intégralité du moteur pour 7 des 8 qualités actives. Seul H8 (Absorption) reste hors de cette
liste, pour une raison externe, pas technique.

## 9.5 Risques techniques majeurs
Couverture `THRESHOLDS` insuffisante (H1 non fait) ; erreurs de transcription silencieuses dans
`HYP_CATALOG` (H2) ; ambiguïté d'affaiblissement non tranchée avant H4 (§9.2.1) ; sens de lecture
inversé pour `asymEngine` mal câblé (H7/H8) ; `QualityConfigView` orphelin si H13 est oublié ou
traité trop tard ; surface de re-câblage large et changement de modèle mental praticien à H14
(risque le plus élevé de tout le plan, déjà qualifié "Élevé" en `PHASE_G_IMPLEMENTATION_PLAN.md`
§4/§9).

## 9.6 Recommandation finale de lancement
Démarrer **H1 et H3 immédiatement, en parallèle** — aucune dépendance, aucun risque. Enchaîner H2
dès H1 terminé. Trancher les ambiguïtés §9.2.1/§9.2.2 (ou documenter un défaut explicite validé par
le praticien) avant d'engager H4. Poursuivre H4→H7→H9 comme un bloc cohérent formant l'Étape 1 du
Shadow Mode. **Ne pas fixer de date pour H14** (bascule finale) avant la fin de la période de
validation praticien (H12) — cette dernière reste, comme dans `PHASE_G_IMPLEMENTATION_PLAN.md`, une
décision du praticien, pas une suite automatique de calendrier technique. `H8` (Absorption) suit son
propre chemin, indépendant, dès que l'exception SLLT est disponible.

---

**Ce document constitue la dernière spécification avant développement.** Sous réserve des points
listés en §9.2/§9.3, l'implémentation de H1 à H7 (7 des 8 qualités actives) peut commencer sans
décision métier ou architecturale supplémentaire.

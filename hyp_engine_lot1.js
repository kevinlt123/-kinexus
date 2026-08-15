// LOT 1 — Moteur HYP### restreint à HYP-MOB-01 (Mobilité).
//
// Additif pur, conforme à IMPLEMENTATION_READINESS_HYP.md §5/§6 (LOT 1) : ce fichier ne modifie,
// ne redéfinit et n'appelle aucune fonction ou variable existante d'index.html. Il consomme en
// LECTURE SEULE trois primitives déjà existantes (applyThr, bestVal, autoLSI), injectées via le
// paramètre `deps` plutôt que redéfinies ici, pour ne jamais diverger de leur comportement réel.
// N'est chargé, référencé ou appelé depuis aucun écran, aucun composant, aucune vue de l'application
// — voir tests/hypEngineLot1.test.js pour la seule façon dont ce fichier est exécuté aujourd'hui.
//
// Conception : ADR-005 (seuil à 1 preuve, pas d'état "suspectee"), ADR-008 (confirmative
// auto-référentielle neutralisée, support plafonné à 'faible', couche explicative structurellement
// vide) — décisions déjà validées, non rouvertes ici. Structure des objets :
// PHASE_H_TECHNICAL_SPECIFICATION.md §1.

// ────────────────────────────────────────────────────────────────────────────────────────────
// HYP_CATALOG — référentiel statique, HYP-MOB-01 uniquement (transcription de
// HYP_ARCHITECTURE_PHASE_C.md, section HYP-MOB-01, non réinterprétée).
// ────────────────────────────────────────────────────────────────────────────────────────────
var HYP_CATALOG = {
  'HYP-MOB-01': {
    qualityName: 'Mobilité',
    diagnostic: [
      { testKey: 'wblt', kpiKey: 'distance', mechanismId: 'wblt', rank: 'principal' }
    ],
    // Auto-référentielle (dérivée de la même mesure que le diagnostique) — ADR-008.
    confirmative: [
      { testKey: 'wblt', kpiKey: 'distance_lsi', mechanismId: 'wblt' }
    ],
    // Couche explicative nulle pour Mobilité — HYP_ARCHITECTURE_PHASE_C.md, fait déjà établi.
    explanatoryPhysio: [],
    explanatoryBiomeca: [],
    convergence: { requiredMechanisms: 1, ruleVariant: 'mobilite_exception' },
    clinicalOrientations: [
      { cliId: 'CLI020', level: 1 }
    ]
  }
};

// ────────────────────────────────────────────────────────────────────────────────────────────
// Évaluation de la preuve diagnostique wblt_distance.
//
// wblt est un test unilatéral à 1 KPI (TBK.wblt : bilateral:false, kpis:[{key:'distance',
// dir:'max'}]). Réutilise applyThr/bestVal/autoLSI — les mêmes primitives que computeTestStatus()
// applique déjà à tout test unilatéral (index.html:4171-4182) — plutôt que computeTestStatus()
// lui-même, dont la logique d'agrégation multi-KPI et d'escalade (poids, majorité de tests
// orange/rouge) est conçue pour des tests à plusieurs KPI et n'a pas de sens pour un test à un
// seul KPI. Un côté (D ou G) suffisamment déficitaire (orange/rouge) rend la preuve déficitaire —
// même lecture "pire côté" que celle déjà appliquée ailleurs dans Kinexus, pas une règle nouvelle.
// ────────────────────────────────────────────────────────────────────────────────────────────
function evaluateWbltDistance(data, pop, age, deps) {
  var applyThr = deps.applyThr, bestVal = deps.bestVal, autoLSI = deps.autoLSI;
  if (!data || !data.active) return { status: 'indisponible', lsi: null };
  var dTrials = ((data.D || {}).trials || {}).distance || [];
  var gTrials = ((data.G || {}).trials || {}).distance || [];
  var vD = bestVal(dTrials, 'max');
  var vG = bestVal(gTrials, 'max');
  var sD = applyThr('wblt_distance', vD, pop, age);
  var sG = applyThr('wblt_distance', vG, pop, age);
  var lsi = data.lsiAuto != null ? data.lsiAuto : autoLSI(vD, vG);
  var sides = [sD, sG].filter(Boolean);
  if (!sides.length) return { status: 'indisponible', lsi: lsi };
  var deficient = sides.some(function (s) { return s === 'rouge' || s === 'orange'; });
  return { status: deficient ? 'deficitaire' : 'normal', lsi: lsi };
}

// ────────────────────────────────────────────────────────────────────────────────────────────
// computeHypothesisEngine(testData, normPop, normAge, deps) -> HypothesisEngineResult
//
// Fonction pure. `deps = { applyThr, bestVal, autoLSI }`. Restreint à HYP-MOB-01 pour ce LOT —
// `hypotheses` ne contient qu'une clé. Structure de retour conforme à
// PHASE_H_TECHNICAL_SPECIFICATION.md §1.3/§1.4.
// ────────────────────────────────────────────────────────────────────────────────────────────
function computeHypothesisEngine(testData, normPop, normAge, deps) {
  var entry = HYP_CATALOG['HYP-MOB-01'];
  var wbltData = (testData || {}).wblt;
  var evalResult = evaluateWbltDistance(wbltData, normPop, normAge, deps);

  var diagnosticEvidence = [{
    testKey: 'wblt', kpiKey: 'distance', mechanismId: 'wblt', status: evalResult.status
  }];

  // Confirmative toujours évaluée et enregistrée (transparence — PHASE_H_TECHNICAL_SPECIFICATION.md
  // §1.2, ConfirmativeEvidence) mais JAMAIS appliquée pour faire progresser le support : c'est la
  // traduction directe d'ADR-008 (ruleVariant='mobilite_exception' désactive la convergence
  // confirmative pour cette qualité).
  var confirmativeEvidence = [{
    testKey: 'wblt', kpiKey: 'distance_lsi',
    status: evalResult.lsi == null ? 'indisponible' : (evalResult.status === 'deficitaire' ? 'deficitaire' : 'normal')
  }];

  var deficient = evalResult.status === 'deficitaire';

  var convergence = {
    requiredMechanisms: entry.convergence.requiredMechanisms,
    distinctMechanismsObserved: deficient ? 1 : 0,
    thresholdMet: deficient,
    mechanismsInvolved: deficient ? ['wblt'] : [],
    ruleVariant: entry.convergence.ruleVariant
  };

  // ADR-005 : Absente -> Retenue/Faible direct, aucun état "suspectee" (mécanisme unique — aucun
  // seuil de convergence intermédiaire n'existe structurellement pour cette qualité).
  var state = deficient ? 'retenue_faible' : 'absente';

  // ADR-008 : support plafonné à 'faible'. 'moderee' nécessiterait une confirmative indépendante
  // (absente, cf. ci-dessus) ; 'forte' nécessiterait une explicative (couche vide par construction
  // — explanatoryEvidence reste [] ci-dessous, aucun code de garde supplémentaire requis).
  var support = deficient ? { level: 'faible' } : null;

  var triggeredCLI = [];
  var clinicalOrientations = {};
  entry.clinicalOrientations.forEach(function (cli) {
    var triggered = state === 'retenue_faible';
    clinicalOrientations[cli.cliId] = {
      cliId: cli.cliId, hypId: 'HYP-MOB-01', level: cli.level,
      triggered: triggered, supportMetadata: support
    };
    if (triggered) triggeredCLI.push(cli.cliId);
  });

  var hypothesis = {
    hypId: 'HYP-MOB-01',
    qualityName: entry.qualityName,
    state: state,
    support: support,
    diagnosticEvidence: diagnosticEvidence,
    confirmativeEvidence: confirmativeEvidence,
    explanatoryEvidence: [],
    convergence: convergence,
    triggeredOrientations: triggeredCLI
  };

  return {
    hypotheses: { 'HYP-MOB-01': hypothesis },
    clinicalOrientations: clinicalOrientations,
    suspendedHypotheses: ['HYP-CSM-01'],
    computedAt: new Date().toISOString(),
    engineVersion: 'V1',
    hypCatalogVersion: 'lot1-mobilite-only'
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HYP_CATALOG: HYP_CATALOG, computeHypothesisEngine: computeHypothesisEngine, evaluateWbltDistance: evaluateWbltDistance };
}

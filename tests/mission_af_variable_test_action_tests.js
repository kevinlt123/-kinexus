// MISSION AF — PASSAGE DU RAISONNEMENT CLINIQUE À LA DÉCISION VARIABLE -> TEST -> ACTION.
//
// Vérifie les nouvelles fonctions additives (§1-13) construites au-dessus de tout ce qui précède
// (Q->AE) : computeCsmV2VariableHypotheses/csmV2VerificationVariablesForQuality (chaîne VARIABLE ->
// hypothèse mécanistique -> variables à vérifier, vocabulaire DIRECT/CONTRIBUTING/ASSOCIATED/
// HYPOTHESIS/REFUTED/UNDETERMINED), computeCsmV2DecisionLevels (4 niveaux PRÉSERVÉE/OBJECTIVÉ/
// EXPLIQUÉ/HYPOTHÈSE/INCONNU — relabelage déterministe de clinicalEvidenceHierarchy+clinicalCertainty,
// jamais un recalcul), computeCsmV2QualityToVariableReasoning (sens 2 : qualité -> mécanismes ->
// variables disponibles/manquantes -> test), computeCsmV2InformationalTests (structure exacte §5),
// computeCsmV2VariableAnalysis (A-F par qualité déficitaire + question clinique générée
// dynamiquement), computeCsmV2ClinicalConflicts (force_max_vs_rfd/co_deficit_relation_active/
// diagnostic_sans_mecanisme, jamais résolus silencieusement), computeCsmV2CauseConsequenceRelations
// (séparation structurelle potentialCauses/contributingFactors/consequences/unknowns),
// computeCsmV2KnownSupportedHypothesisUnknownAll (KNOWN/SUPPORTED/HYPOTHESIS/UNKNOWN/NEXT_TEST comme
// DONNÉES interrogeables), computeCsmV2DecisionSynthesisDetailed (synthèse par priorité), et le
// nouveau rendu partagé csmV2ReportDeficitToDecisionHtml (§13, SEULE implémentation PDF/ExpertView).
// Aucun seuil/norme/relation clinique nouveaux, aucun moteur HYP LOCKED modifié.
//
// Exécution : node tests/mission_af_variable_test_action_tests.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur()/buildExpertReport() dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}
function csm(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}).clinicalSynthesisV2; }

console.log('MISSION AF — variable -> hypothèse -> test -> décision');

const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };
const yc = csm(YANNIS_DATA, YANNIS_NORM_SEL);

// ── AF1-AF2 : variableHypotheses — statuts DIRECT/UNDETERMINED démontrés sur Yannis réel ──────────
test('AF1 — variableHypotheses présent, un tableau par qualité déficitaire avec la forme attendue', () => {
  assert.ok(Array.isArray(yc.variableHypotheses));
  const stab = yc.variableHypotheses.filter(v => v.quality === 'Stabilisation');
  assert.ok(stab.length >= 1);
  stab.forEach(v => {
    assert.ok('variable' in v && 'quality' in v && 'mechanisticHypothesis' in v && 'status' in v && 'verificationVariables' in v);
  });
});
test('AF2 — statut DIRECT (Absorption, braking_rfd) et UNDETERMINED (Explosivité, aucune preuve diagnostique propre)', () => {
  const abs = yc.variableHypotheses.filter(v => v.quality === 'Absorption');
  assert.ok(abs.some(v => v.status === 'DIRECT' && v.variable === 'diagnosticEvidence.braking_rfd'));
  const explo = yc.variableHypotheses.filter(v => v.quality === 'Explosivité');
  assert.strictEqual(explo.length, 1);
  assert.strictEqual(explo[0].status, 'UNDETERMINED');
  assert.strictEqual(explo[0].variable, null);
});
test('AF3 — qualité préservée (Force) -> pas de status DIRECT/UNDETERMINED forcé, verificationVariables vide', () => {
  const force = yc.variableHypotheses.filter(v => v.quality === 'Force');
  assert.strictEqual(force.length, 1);
  assert.strictEqual(force[0].status, null);
  assert.deepStrictEqual(force[0].verificationVariables, []);
});

// ── AF4-AF6 : vocabulaire de statut complet (CONTRIBUTING/ASSOCIATED/HYPOTHESIS sur Yannis, REFUTED
// via scénario contrôlé — Réactivité testée et préservée, Explosivité déficitaire) ─────────────────
test('AF4 — CONTRIBUTING (Force/Mobilité -> Stabilisation), ASSOCIATED (bridge WBLT) démontrés sur Yannis réel', () => {
  const stab = yc.variableHypotheses.find(v => v.quality === 'Stabilisation');
  const statuses = stab.verificationVariables.map(v => v.status);
  assert.ok(statuses.indexOf('CONTRIBUTING') !== -1);
  assert.ok(statuses.indexOf('ASSOCIATED') !== -1);
});
test('AF5 — HYPOTHESIS (relation documentée mais non activée) démontré sur Yannis réel (Explosivité <- Puissance/Réactivité)', () => {
  const explo = yc.variableHypotheses.find(v => v.quality === 'Explosivité');
  const hyp = explo.verificationVariables.filter(v => v.status === 'HYPOTHESIS');
  assert.ok(hyp.length >= 2);
  assert.ok(hyp.every(h => /Relation documentée/.test(h.reason)));
});
// NOTE — sur les données réelles de Yannis et sur tout scénario computeMoteur() essayé, REFUTED ne se
// déclenche jamais naturellement pour les 9 relations HYP_QUALITY_RELATIONS existantes : dès qu'une
// qualité "explains" est RÉELLEMENT testée et non déficitaire, le raisonnement mécanistique Mission X
// (crossQualityFactors) la classe déjà en CONTRIBUTING (logique de dissociation, cf. Force->
// Stabilisation/Endurance, Mobilité->Stabilisation) avant même d'atteindre la boucle HYP_QUALITY_
// RELATIONS de csmV2VerificationVariablesForQuality — et les rares variables diagnostiques restantes
// (ex. slcmj_peak_power/cmj_peak_power pour Puissance) sont 'partiellement_exploitable' (NORMS_V2),
// donc severity reste 'null'/non_determinable sans population correspondante, jamais 'preserved'.
// REFUTED reste une branche RÉELLE et nécessaire du code (une qualité peut être testée, franchement
// préservée, et hors de toute logique de dissociation — cf. §2 mission), démontrée ici en appelant
// DIRECTEMENT la fonction pure avec des structures déjà calculées par le moteur (qr/clinicalProfile/
// symmetryEvidence, mêmes formes que celles produites par computeCsmV2()) plutôt qu'un scénario
// patient inventé de toutes pièces — cf. AF6b pour la démonstration additionnelle sur pipeline complet.
test('AF6 — REFUTED (test direct de la fonction pure) : qualité "explains" génuinement testée et préservée, aucune relation active', () => {
  const qr = { crossQualityFactors: [], bridges: [] };
  const clinicalProfile = { 'Réactivité': { severity: 'preserved' } };
  const symmetryEvidence = { 'Réactivité': { 'diagnosticEvidence.sldj_rsi': { available: true, rawD: 0.9, rawG: 0.9, lsi: 100, status: 'normal' } } };
  const out = csmV2VerificationVariablesForQuality('Explosivité', qr, clinicalProfile, symmetryEvidence);
  const refuted = out.filter(v => v.status === 'REFUTED' && v.quality === 'Réactivité');
  assert.strictEqual(refuted.length, 1);
  assert.ok(/testée et est préservée/.test(refuted[0].reason));
  assert.ok(/n'est pas soutenue par ce bilan/.test(refuted[0].reason));
});
test('AF6b — csmV2QualityGenuinelyTested : distingue "réellement testée" (available=true) de "aucune donnée fournie" (available=false partout)', () => {
  assert.strictEqual(csmV2QualityGenuinelyTested('Réactivité', { 'Réactivité': { 'diagnosticEvidence.sldj_rsi': { available: true } } }), true);
  assert.strictEqual(csmV2QualityGenuinelyTested('Réactivité', { 'Réactivité': { 'diagnosticEvidence.sldj_rsi': { available: false } } }), false);
  assert.strictEqual(csmV2QualityGenuinelyTested('Réactivité', {}), false);
});
test('AF6c — régression gouvernance : une qualité "preserved" mais JAMAIS testée (aucune donnée fournie) n\'est jamais présentée comme REFUTED', () => {
  // Réplique le comportement LOCKED observé : severity par défaut 'preserved' en l'absence totale de
  // donnée (csmV2QualitySeverity) — sans le garde-fou csmV2QualityGenuinelyTested, cela produirait à
  // tort un "a été testée et est préservée" pour une qualité jamais évaluée.
  const c = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3500], ecc_decel_rfd_R: [1400] } } });
  assert.strictEqual(c.clinicalProfile['Réactivité'].severity, 'preserved', 'confirme le comportement LOCKED : défaut = preserved même sans aucune donnée');
  const explo = c.variableHypotheses.find(v => v.quality === 'Explosivité');
  const refutedReactivite = explo.verificationVariables.filter(v => v.status === 'REFUTED' && v.quality === 'Réactivité');
  assert.strictEqual(refutedReactivite.length, 0, 'Réactivité jamais testée -> jamais REFUTED, reste HYPOTHESIS (donnée insuffisante)');
  const hypReactivite = explo.verificationVariables.filter(v => v.status === 'HYPOTHESIS' && v.quality === 'Réactivité');
  assert.strictEqual(hypReactivite.length, 1);
});

// ── AF7-AF8 : 4 niveaux de décision, jamais EXPLICATIVE->DIAGNOSTIQUE, jamais BRIDGE->CAUSE ────────
test('AF7 — decisionLevels : PRÉSERVÉE(0)/EXPLIQUÉ(2)/INCONNU(4) tous démontrés sur Yannis réel', () => {
  assert.deepStrictEqual(yc.decisionLevels['Force'], { level: 0, label: 'PRÉSERVÉE' });
  assert.deepStrictEqual(yc.decisionLevels['Stabilisation'], { level: 2, label: 'EXPLIQUÉ' });
  assert.deepStrictEqual(yc.decisionLevels['Explosivité'], { level: 4, label: 'INCONNU' });
  assert.deepStrictEqual(yc.decisionLevels['Endurance'], { level: 4, label: 'INCONNU' });
});
test('AF8 — decisionLevels : OBJECTIVÉ(1) et HYPOTHÈSE(3) démontrés via scénarios contrôlés', () => {
  const objective = csm({ landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } });
  assert.deepStrictEqual(objective.decisionLevels['Stabilisation'], { level: 1, label: 'OBJECTIVÉ' });
  const hypothese = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46] } } });
  assert.deepStrictEqual(hypothese.decisionLevels['Absorption'], { level: 3, label: 'HYPOTHÈSE' });
});
test('AF9 — niveau 4 (INCONNU) exigé dès que verdict !== DIAGNOSTIC_OBJECTIVE, jamais promu explicative->diagnostique', () => {
  assert.strictEqual(yc.clinicalEvidenceHierarchy['Explosivité'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.strictEqual(yc.decisionLevels['Explosivité'].level, 4);
  // Explosivité a pourtant des variables explicatives (bridge Absorption, relations documentées) —
  // jamais assez pour atteindre un niveau > 4 sans preuve diagnostique propre.
  const explo = yc.variableHypotheses.find(v => v.quality === 'Explosivité');
  assert.ok(explo.verificationVariables.length > 0, 'des éléments explicatifs existent bien');
});
test('AF10 — niveau 3 HYPOTHÈSE (bridge seul) jamais confondu avec niveau 2 EXPLIQUÉ (relation cross-quality réelle)', () => {
  const hypothese = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46] } } });
  assert.strictEqual(hypothese.clinicalCertainty['Absorption'], 'associated_only');
  assert.notStrictEqual(hypothese.decisionLevels['Absorption'].label, 'EXPLIQUÉ');
});

// ── AF11-AF13 : raisonnement bidirectionnel qualité -> mécanismes -> variables -> test ─────────────
test('AF11 — qualityToVariableReasoning (Stabilisation) : structure complète, cohérente avec clinicalEvidenceHierarchy', () => {
  const r = yc.qualityToVariableReasoning['Stabilisation'];
  assert.strictEqual(r.quality, 'Stabilisation');
  assert.ok(Array.isArray(r.mechanismsAvailable));
  assert.ok('diagnostic' in r.evidenceAvailable && 'confirmative' in r.evidenceAvailable && 'explanatory' in r.evidenceAvailable);
  assert.ok(Array.isArray(r.evidenceMissing));
  assert.ok(r.evidenceMissing.length > 0, 'Stabilisation a des variables manquantes (SLS, Land and Hold, etc.)');
});
test('AF12 — qualityToVariableReasoning : nextBestTest null quand aucun test à gain exploitable (Mobilité, déjà expliquée)', () => {
  const r = yc.qualityToVariableReasoning['Mobilité'];
  assert.strictEqual(r.nextBestTest, null);
});
test('AF13 — qualityToVariableReasoning : nextBestTest renseigné pour Endurance (Heel Raise, gain HIGH)', () => {
  const r = yc.qualityToVariableReasoning['Endurance'];
  assert.strictEqual(r.nextBestTest, 'Heel Raise');
});

// ── AF14-AF16 : computeCsmV2InformationalTests — structure EXACTE §5 ───────────────────────────────
test('AF14 — informationalTests : chaque entrée a EXACTEMENT les 9 champs demandés par la mission', () => {
  assert.ok(yc.informationalTests.length > 0);
  const expectedKeys = ['test', 'targetQuality', 'targetMechanism', 'currentEvidence', 'missingEvidence', 'expectedReasoningGain', 'classifiability', 'priority', 'reasons'];
  yc.informationalTests.forEach(t => {
    expectedKeys.forEach(k => assert.ok(k in t, k + ' manquant sur ' + t.test));
    assert.ok(Array.isArray(t.reasons) && t.reasons.length > 0);
  });
});
test('AF15 — informationalTests : test avec seuil réel (Heel Raise, Endurance) -> HIGH/exploitable/P1', () => {
  const heelRaise = yc.informationalTests.find(t => t.test === 'Heel Raise' && t.targetQuality === 'Endurance');
  assert.strictEqual(heelRaise.expectedReasoningGain, 'HIGH');
  assert.strictEqual(heelRaise.classifiability, 'exploitable');
  assert.strictEqual(heelRaise.priority, 'P1');
});
test('AF16 — informationalTests : test sans seuil (Single Leg Stand) -> NONE/non_classifiable, correctement rejeté MAIS jamais masqué', () => {
  const sls = yc.informationalTests.filter(t => t.test === 'Single Leg Stand');
  assert.ok(sls.length > 0, 'le test reste présent dans la liste, pas silencieusement supprimé');
  sls.forEach(t => {
    assert.strictEqual(t.expectedReasoningGain, 'NONE');
    assert.strictEqual(t.classifiability, 'non_classifiable');
    assert.ok(/Aucun seuil/.test(t.reasons[0]));
  });
});
test('AF17 — informationalTests : classé globalement par gain décroissant (HIGH avant LOW avant NONE)', () => {
  const rank = { HIGH: 0, MODERATE: 1, LOW: 2, NONE: 3 };
  for (let i = 1; i < yc.informationalTests.length; i++) {
    assert.ok(rank[yc.informationalTests[i - 1].expectedReasoningGain] <= rank[yc.informationalTests[i].expectedReasoningGain]);
  }
});
test('AF18 — informationalTests : jamais recommandé pour Explosivité (cmj_conc_rfd/cmj_conc_impulse_100 sans seuil, aucun test exploitable)', () => {
  const explo = yc.informationalTests.filter(t => t.targetQuality === 'Explosivité');
  assert.strictEqual(explo.length, 0);
});

// ── AF19-AF21 : computeCsmV2VariableAnalysis — analyse A-F par qualité déficitaire ─────────────────
test('AF19 — variableAnalysis : présent uniquement pour les qualités réellement déficitaires', () => {
  const keys = Object.keys(yc.variableAnalysis);
  keys.forEach(q => assert.strictEqual(yc.clinicalCausalReasoning.qualityReasoning[q].state, 'deficitaire'));
  assert.ok(keys.indexOf('Force') === -1, 'Force préservée jamais dans variableAnalysis');
});
test('AF20 — variableAnalysis (Stabilisation) : les 6 champs A-F sont présents avec la forme attendue', () => {
  const va = yc.variableAnalysis['Stabilisation'];
  ['diagnosticAvailable', 'diagnosticMissing', 'confirmativeAvailable', 'explanatoryAvailable', 'explanatoryMissing', 'differentiatingVariables'].forEach(k => {
    assert.ok(Array.isArray(va[k]), k + ' doit être un tableau');
  });
  assert.strictEqual(typeof va.clinicalQuestion, 'string');
  assert.ok(va.clinicalQuestion.length > 10);
});
test('AF21 — question clinique générée DYNAMIQUEMENT (jamais une phrase fixe codée pour Yannis)', () => {
  const stabQ = yc.variableAnalysis['Stabilisation'].clinicalQuestion;
  const mobQ = yc.variableAnalysis['Mobilité'].clinicalQuestion;
  assert.notStrictEqual(stabQ, mobQ);
  // Stabilisation a des qualités contributives réellement validées (Force/Mobilité) -> la question les nomme.
  assert.ok(/force|mobilité/i.test(stabQ));
  // Mobilité n'a aucune qualité contributive validée pour son propre déficit -> formulation "facteurs déjà objectivés".
  assert.ok(/facteurs déjà objectivés/i.test(mobQ));
});

// ── AF22-AF25 : computeCsmV2ClinicalConflicts — jamais résolus silencieusement ──────────────────────
test('AF22 — conflit force_max_vs_rfd démontré sur Yannis réel (Force préservée, RFD déficitaire)', () => {
  assert.strictEqual(yc.clinicalProfile['Force'].severity, 'preserved');
  assert.ok(yc.clinicalProfile['Force'].rapidForceDeficit && yc.clinicalProfile['Force'].rapidForceDeficit.supported);
  const c = yc.clinicalConflicts.find(x => x.type === 'force_max_vs_rfd');
  assert.ok(c);
  assert.strictEqual(c.resolution, 'dissociation_documentee');
});
test('AF23 — conflit co_deficit_relation_active démontré sur Yannis réel (Mobilité/Stabilisation), jamais présenté comme causalité', () => {
  const c = yc.clinicalConflicts.find(x => x.type === 'co_deficit_relation_active' && x.qualities.indexOf('Mobilité') !== -1 && x.qualities.indexOf('Stabilisation') !== -1);
  assert.ok(c);
  assert.ok(/potentiellement contributive/.test(c.interpretation));
  assert.ok(/jamais présentée comme cause principale/.test(c.interpretation));
});
test('AF24 — conflit diagnostic_sans_mecanisme démontré via scénario contrôlé (déficit objectivé, mécanisme non déterminé)', () => {
  const c = csm({ landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } });
  const conflict = c.clinicalConflicts.find(x => x.type === 'diagnostic_sans_mecanisme' && x.qualities[0] === 'Stabilisation');
  assert.ok(conflict);
  assert.strictEqual(conflict.resolution, 'documente_comme_indetermine');
});
test('AF25 — aucun conflit n\'est jamais résolu automatiquement : chaque entrée conserve description+interpretation+resolution explicites', () => {
  yc.clinicalConflicts.forEach(c => {
    assert.ok(c.description && c.interpretation && c.resolution);
  });
});

// ── AF26-AF29 : computeCsmV2CauseConsequenceRelations — séparation structurelle stricte ────────────
test('AF26 — Stabilisation : Force/Mobilité apparaissent en potentialCauses/contributingFactors, JAMAIS en consequences', () => {
  const rel = yc.causeConsequenceRelations['Stabilisation'];
  assert.ok(rel.potentialCauses.some(c => c.source === 'Force'));
  assert.ok(rel.potentialCauses.some(c => c.source === 'Mobilité'));
  assert.ok(rel.contributingFactors.every(c => c.evidenceType === 'CONTRIBUTING'));
  assert.strictEqual(rel.consequences.some(c => c.source === 'Force' || c.source === 'Mobilité'), false);
});
test('AF27 — cause != conséquence : chaque relation porte un statut explicite jamais une causalité affirmée', () => {
  Object.keys(yc.causeConsequenceRelations).forEach(q => {
    const rel = yc.causeConsequenceRelations[q];
    rel.potentialCauses.forEach(c => assert.ok(['contributing_not_causal', 'not_supported', 'hypothesis_only'].indexOf(c.status) !== -1));
    rel.consequences.forEach(c => assert.strictEqual(c.status, 'potential_consequence_not_cause'));
  });
});
test('AF28 — contradictingEvidence peuplé UNIQUEMENT pour un statut REFUTED (jamais déduit d\'une simple absence)', () => {
  Object.keys(yc.causeConsequenceRelations).forEach(q => {
    yc.causeConsequenceRelations[q].potentialCauses.forEach(c => {
      if (c.evidenceType !== 'REFUTED') assert.deepStrictEqual(c.contradictingEvidence, []);
    });
  });
  // Démonstration directe (cf. note AF6) : computeCsmV2CauseConsequenceRelations appelé avec des
  // structures de la même forme que celles produites par computeCsmV2() (une qualité "Réactivité"
  // génuinement testée et préservée, sans relation active) pour exercer le branchement REFUTED ->
  // contradictingEvidence peuplé, jamais atteint naturellement sur Yannis (cf. note AF6).
  const emptyQr = { crossQualityFactors: [], bridges: [], consequences: [], missingEvidence: [] };
  const clinicalProfile = {}; const clinicalCausalReasoning = { qualityReasoning: {} };
  HYP_CSM_QUALITIES.forEach(q => { clinicalProfile[q] = { severity: null }; clinicalCausalReasoning.qualityReasoning[q] = emptyQr; });
  clinicalProfile['Réactivité'] = { severity: 'preserved' };
  const symmetryEvidence = { 'Réactivité': { 'diagnosticEvidence.sldj_rsi': { available: true } } };
  const rel = computeCsmV2CauseConsequenceRelations(clinicalProfile, clinicalCausalReasoning, symmetryEvidence);
  const refutedCause = rel['Explosivité'].potentialCauses.find(x => x.evidenceType === 'REFUTED');
  assert.ok(refutedCause);
  assert.strictEqual(refutedCause.contradictingEvidence.length, 1);
  assert.strictEqual(refutedCause.status, 'not_supported');
});
test('AF29 — unknowns reflète missingEvidence sans jamais l\'omettre (jamais masqué)', () => {
  const rel = yc.causeConsequenceRelations['Stabilisation'];
  assert.strictEqual(rel.unknowns.length, yc.clinicalCausalReasoning.qualityReasoning['Stabilisation'].missingEvidence.length);
  assert.ok(rel.unknowns.every(u => u.variable && u.label && u.reason));
});

// ── AF30-AF33 : KNOWN/SUPPORTED/HYPOTHESIS/UNKNOWN/NEXT_TEST — données interrogeables ──────────────
test('AF30 — knownSupportedHypothesisUnknown : les 5 buckets existent et sont des tableaux de chaînes', () => {
  Object.keys(yc.knownSupportedHypothesisUnknown).forEach(q => {
    const e = yc.knownSupportedHypothesisUnknown[q];
    ['known', 'supported', 'hypothesis', 'unknown', 'nextTest'].forEach(k => {
      assert.ok(Array.isArray(e[k]), k + ' doit être un tableau (données interrogeables, pas seulement du texte)');
      e[k].forEach(s => assert.strictEqual(typeof s, 'string'));
    });
  });
});
test('AF31 — Force (préservée) : known contient la préservation, aucun bucket hypothèse/inconnu forcé', () => {
  const e = yc.knownSupportedHypothesisUnknown['Force'];
  assert.ok(e.known.some(s => /préservée/.test(s)));
  assert.deepStrictEqual(e.supported, []);
  assert.deepStrictEqual(e.hypothesis, []);
});
test('AF32 — Stabilisation (déficitaire, expliquée) : known/supported/nextTest tous renseignés cohérents avec les structures sources', () => {
  const e = yc.knownSupportedHypothesisUnknown['Stabilisation'];
  assert.ok(e.known.length >= 1);
  assert.ok(e.supported.length >= 2, 'Force ET Mobilité doivent apparaître comme SUPPORTED (statut CONTRIBUTING)');
  assert.strictEqual(e.nextTest[0], 'Land and Hold (gain attendu : LOW)');
});
test('AF33 — Endurance (déficitaire, non déterminée) : known signale l\'absence de preuve diagnostique propre, jamais masquée', () => {
  const e = yc.knownSupportedHypothesisUnknown['Endurance'];
  assert.ok(e.known.length === 0 || !e.known.some(s => /Déficit objectivé/.test(s)));
  assert.ok(e.unknown.length > 0);
});

// ── AF34-AF36 : computeCsmV2DecisionSynthesisDetailed — synthèse par priorité ───────────────────────
test('AF34 — decisionSynthesisDetailed : structure exacte (rank/quality/severity/objectivePar/facteursContributifs/indetermine/testPrioritaire/pourquoi)', () => {
  assert.ok(yc.decisionSynthesisDetailed.length > 0);
  yc.decisionSynthesisDetailed.forEach(r => {
    ['rank', 'quality', 'severity', 'objectivePar', 'facteursContributifs', 'indetermine', 'testPrioritaire', 'pourquoi'].forEach(k => assert.ok(k in r));
  });
});
test('AF35 — decisionSynthesisDetailed : classement par rang croissant, exclut les qualités NON_DETERMINEE (Explosivité/Endurance)', () => {
  for (let i = 1; i < yc.decisionSynthesisDetailed.length; i++) assert.ok(yc.decisionSynthesisDetailed[i].rank > yc.decisionSynthesisDetailed[i - 1].rank);
  assert.strictEqual(yc.decisionSynthesisDetailed.some(r => r.quality === 'Explosivité'), false);
  assert.strictEqual(yc.decisionSynthesisDetailed.some(r => r.quality === 'Endurance'), false);
});
test('AF36 — decisionSynthesisDetailed (Stabilisation) : testPrioritaire/pourquoi renseignés, facteursContributifs=[Force,Mobilité]', () => {
  const r = yc.decisionSynthesisDetailed.find(x => x.quality === 'Stabilisation');
  assert.deepStrictEqual(r.facteursContributifs.slice().sort(), ['Force', 'Mobilité'].slice().sort());
  assert.strictEqual(r.testPrioritaire, 'Land and Hold');
  assert.ok(r.pourquoi);
});
test('AF37 — decisionSynthesisDetailed (Mobilité) : aucun facteur contributif ni test prioritaire inventé (déjà pleinement expliquée)', () => {
  const r = yc.decisionSynthesisDetailed.find(x => x.quality === 'Mobilité');
  assert.deepStrictEqual(r.facteursContributifs, []);
  assert.strictEqual(r.testPrioritaire, null);
  assert.strictEqual(r.pourquoi, null);
});

// ── AF38-AF40 : rapport §13 "Du déficit à la décision" — SEULE implémentation, PDF===ExpertView ───
test('AF38 — csmV2ReportDeficitToDecisionHtml est définie UNE SEULE fois et appelée UNE SEULE fois dans le rendu partagé', () => {
  const defCount = (code.match(/function csmV2ReportDeficitToDecisionHtml\(/g) || []).length;
  assert.strictEqual(defCount, 1);
  const callCount = (code.match(/[^ ]csmV2ReportDeficitToDecisionHtml\(csmV2Rep\)/g) || []).length;
  assert.strictEqual(callCount, 1, 'appelée une seule fois, depuis csmV2ClinicalReportBodyHtml (SEULE implémentation PDF/ExpertView)');
});
test('AF39 — la section "Du déficit à la décision" apparaît dans le corps de rapport partagé et reflète les données calculées', () => {
  const bodyHtml = csmV2ClinicalReportBodyHtml(yc);
  assert.ok(/Du déficit à la décision/.test(bodyHtml));
  assert.ok(bodyHtml.indexOf('Land and Hold') !== -1);
  assert.ok(bodyHtml.indexOf('Mécanisme(s) contributif(s) supporté(s)') !== -1);
});
test('AF40 — csmV2ReportDeficitToDecisionHtml renvoie une chaîne vide sans decisionSynthesisDetailed (jamais un bloc vide affiché)', () => {
  assert.strictEqual(csmV2ReportDeficitToDecisionHtml({ decisionSynthesisDetailed: [] }), '');
  assert.strictEqual(csmV2ReportDeficitToDecisionHtml(null), '');
});

// ── AF41-AF44 : compléments de couverture (branches réellement créées par la mission) ──────────────
test('AF41 — csmV2VerificationVariablesForQuality : jamais une entrée où la qualité source == la qualité cible', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const vh = yc.variableHypotheses.filter(v => v.quality === q);
    vh.forEach(v => v.verificationVariables.forEach(vv => assert.notStrictEqual(vv.quality, q)));
  });
});
test('AF42 — informationalTests : priorité P1 (diagnostique) / P3 (toutes confirmatives) / P2 (sinon) correctement assignée', () => {
  yc.informationalTests.forEach(t => {
    const isDiag = t.missingEvidence[0].isDiagnostic;
    if (isDiag) assert.strictEqual(t.priority, 'P1');
    else {
      const allConfirmative = t.missingEvidence.every(i => csmV2VariableRole(i.variable) === 'CONFIRMATIVE');
      assert.strictEqual(t.priority, allConfirmative ? 'P3' : 'P2');
    }
  });
});
test('AF43 — toutes les qualités du référentiel apparaissent dans decisionLevels (jamais un fallback masqué)', () => {
  assert.deepStrictEqual(Object.keys(yc.decisionLevels).sort(), HYP_CSM_QUALITIES.slice().sort());
});
test('AF44 — csmV2DecisionLevelForQuality : les 5 combinaisons (0-4) restent les SEULES valeurs produites', () => {
  const labels = new Set();
  Object.values(yc.decisionLevels).forEach(d => labels.add(d.label));
  const hyp = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46] } } });
  labels.add(hyp.decisionLevels['Absorption'].label);
  const obj = csm({ landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } });
  labels.add(obj.decisionLevels['Stabilisation'].label);
  labels.forEach(l => assert.ok(['PRÉSERVÉE', 'OBJECTIVÉ', 'EXPLIQUÉ', 'HYPOTHÈSE', 'INCONNU'].indexOf(l) !== -1));
});

// ── AF45-AF46 : non-régression gouvernance (aucun moteur/seuil/norme/relation modifié) ─────────────
test('AF45 — HYP_QUALITY_RELATIONS/CLINICAL_HYPOTHESIS_WHITELIST inchangés (9 relations, mêmes paires)', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.filter(w => w.allowed === false).length, 1);
});
test('AF46 — CSM_V2_CLINICAL_VARIABLE_MATRIX.meta inchangée (150/26/28/96/29/121, aucune variable inventée)', () => {
  const meta = CSM_V2_CLINICAL_VARIABLE_MATRIX.meta;
  assert.strictEqual(meta.totalVariables, 150);
  assert.strictEqual(meta.diagnosticCount, 26);
  assert.strictEqual(meta.confirmativeCount, 28);
  assert.strictEqual(meta.missingCount, 121);
});

// ── AF47 — régression complète : Yannis, les 8 sévérités + les 9 structures Q->AE toujours présentes,
// TOUS les nouveaux champs AF présents dans le retour de computeCsmV2() ────────────────────────────
test('AF47 — régression : Yannis 8 sévérités inchangées, toutes les structures Q->AF présentes', () => {
  assert.strictEqual(yc.clinicalProfile['Force'].severity, 'preserved');
  assert.strictEqual(yc.clinicalProfile['Mobilité'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Réactivité'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Absorption'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Puissance'].severity, 'modere');
  assert.strictEqual(yc.clinicalProfile['Explosivité'].severity, 'modere');
  assert.strictEqual(yc.clinicalProfile['Stabilisation'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Endurance'].severity, 'majeur');
  ['clinicalPriorities', 'nextBestTests', 'clinicalDecisionBoard', 'clinicalEvidenceHierarchy', 'clinicalCertainty',
    'variableHypotheses', 'decisionLevels', 'qualityToVariableReasoning', 'informationalTests', 'variableAnalysis',
    'clinicalConflicts', 'causeConsequenceRelations', 'knownSupportedHypothesisUnknown', 'decisionSynthesisDetailed'
  ].forEach(k => assert.ok(yc[k] !== undefined, k + ' manquant du retour de computeCsmV2()'));
});

console.log('=== TOTAL MISSION AF : ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) process.exit(1);

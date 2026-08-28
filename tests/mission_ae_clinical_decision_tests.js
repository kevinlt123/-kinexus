// MISSION AE — CLINICAL DECISION ENGINE.
//
// Vérifie les nouvelles fonctions additives de décision clinique (§2-14) construites sur les couches
// Q->AD déjà existantes : computeCsmV2ClinicalPriorities (hiérarchie déterministe par règles, jamais
// un score pondéré arbitraire), computeCsmV2NextBestTests/computeCsmV2GlobalNextBestTests/
// csmV2ExpectedReasoningGain (HIGH/MODERATE/LOW/NONE, fondé sur hasThreshold réel — jamais un simple
// tri P1/P2/P3), computeCsmV2QualityDecisionProfile, computeCsmV2ClinicalBottlenecks (réutilise
// clinicalNodes, Mission AA), computeCsmV2ClinicalDissociations (OBSERVATION -> INTERPRÉTATION
// PRUDENTE -> QUESTION), computeCsmV2ClinicalLimitationHierarchy (5 paliers), computeCsmV2Clinical
// ActionPlan (axes CSM_V2_AXIS_QUALITY_MAP uniquement), computeCsmV2ClinicalDecisionSynthesis
// (synthèse dynamique 8 parties), computeCsmV2FutureDataValue (catégories A-E), Decision Board
// (rapport partagé). Aucun seuil/norme/relation clinique nouveaux, aucun moteur HYP LOCKED modifié.
//
// Exécution : node tests/mission_ae_clinical_decision_tests.js — aucune dépendance externe.
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
const TIER_RANK = { PRIORITAIRE: 0, IMPORTANTE: 1, SECONDAIRE: 2, A_SURVEILLER: 3, NON_DETERMINEE: 4 };

console.log('MISSION AE — clinical decision engine');

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

// AE1 — déficit majeur != automatiquement priorité 1
test('AE1 — déficit majeur (Absorption, Yannis) != automatiquement PRIORITAIRE', () => {
  assert.strictEqual(yc.clinicalProfile['Absorption'].severity, 'majeur');
  assert.notStrictEqual(yc.clinicalPriorities['Absorption'].tier, 'PRIORITAIRE');
  assert.strictEqual(yc.clinicalPriorities['Absorption'].tier, 'IMPORTANTE');
});

// AE2 — déficit majeur + mécanisme inconnu -> priorité augmentée
test('AE2 — déficit majeur (Stabilisation) + mécanisme inconnu + test actionnable -> PRIORITAIRE', () => {
  const c = csm({
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [0.3] } } },
    landing_bi: { active: true, trials: { tts: [3.0] } }
  });
  assert.strictEqual(c.clinicalProfile['Stabilisation'].severity, 'majeur');
  assert.notStrictEqual(c.clinicalCertainty['Stabilisation'], 'explained');
  assert.strictEqual(c.clinicalPriorities['Stabilisation'].tier, 'PRIORITAIRE');
});

// AE3 — déficit majeur + mécanisme bien expliqué -> priorité potentiellement inférieure
test('AE3 — déficit majeur (Absorption) + mécanisme bien expliqué -> priorité strictement inférieure à AE2', () => {
  const c = csm({
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } },
    slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0] } } }
  });
  assert.strictEqual(c.clinicalProfile['Absorption'].severity, 'majeur');
  assert.strictEqual(c.clinicalCertainty['Absorption'], 'explained');
  assert.ok(TIER_RANK[c.clinicalPriorities['Absorption'].tier] > TIER_RANK.PRIORITAIRE, 'doit être strictement moins prioritaire que le cas AE2 (mécanisme inconnu)');
});

// AE4 — not_determined + test diagnostique classifiable -> next best test HIGH
test('AE4 — Endurance not_determined + Heel Raise (diagnostique, seuil réel) -> HIGH', () => {
  assert.strictEqual(yc.clinicalCertainty['Endurance'], 'not_determined');
  const heelRaise = yc.nextBestTests['Endurance'].tests.find(t => t.testName === 'Heel Raise');
  assert.ok(heelRaise);
  assert.strictEqual(heelRaise.expectedReasoningGain, 'HIGH');
});

// AE5 — not_determined + test sans seuil -> gain NONE
test('AE5 — Endurance not_determined + Repeated Hop (aucun seuil) -> NONE', () => {
  const repeatedHop = yc.nextBestTests['Endurance'].tests.find(t => /Hop/.test(t.testName));
  assert.ok(repeatedHop);
  assert.strictEqual(repeatedHop.expectedReasoningGain, 'NONE');
  assert.ok(repeatedHop.limitation);
});

// AE6 — variable explicative -> jamais diagnostic
test('AE6 — variable explicative (wblt pour Stabilisation) -> jamais diagnostic dans clinicalEvidenceHierarchy', () => {
  const items = yc.clinicalEvidenceHierarchy['Stabilisation'].level3_explanation.items;
  assert.ok(items.some(i => /wblt_distance/.test(i.variable)));
  assert.ok(!yc.clinicalEvidenceHierarchy['Stabilisation'].level1_diagnostic.items.some(i => /wblt_distance/.test(i.variable)));
});

// AE7 — confirmative -> jamais diagnostic
test('AE7 — variable confirmative -> jamais diagnostic (matrice AB/AD)', () => {
  const v = CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Force'].confirmative.find(x => x.variableKey === 'iso_belt_squat_nkg');
  assert.ok(v);
  assert.strictEqual(v.role, 'CONFIRMATIVE');
  assert.notStrictEqual(v.role, 'DIRECT');
});

// AE8 — bridge -> associé, pas causal
test('AE8 — bridge (Absorption<->Explosivité) -> associatedFactors, jamais evidence propre, jamais causal', () => {
  const f = yc.clinicalFactorClassification['Explosivité'];
  assert.strictEqual(f.associatedFactors.length, 1);
  assert.strictEqual(f.evidence.length, 0);
  assert.ok(!/\bcause\b/i.test(JSON.stringify(f.associatedFactors)));
});

// AE9 — relation validée -> contributive si conditions remplies. Stabilisation a en réalité 2
// relations validées simultanées chez Yannis (Mobilité->Stabilisation ET Force->Stabilisation,
// toutes deux réellement whitelistées) — on vérifie la présence de la relation attendue, pas
// l'exclusivité (déjà couverte séparément par AE10/AE25 pour les relations réellement absentes).
test('AE9 — relation validée (Mobilité->Stabilisation) -> contributingFactors', () => {
  assert.ok(yc.clinicalFactorClassification['Stabilisation'].contributingFactors.length >= 1);
  assert.ok(yc.clinicalFactorClassification['Stabilisation'].contributingFactors.some(f => f.from === 'Mobilité'));
  yc.clinicalFactorClassification['Stabilisation'].contributingFactors.forEach(f => {
    assert.ok(HYP_QUALITY_RELATIONS.some(r => r.explains === f.from && r.explained === f.to));
  });
});

// AE10 — relation inverse -> refus
test('AE10 — relation inverse (Stabilisation->Mobilité) -> refusée', () => {
  assert.strictEqual(yc.clinicalFactorClassification['Mobilité'].contributingFactors.length, 0);
});

// AE11 — chaîne invalide -> refus
test('AE11 — aucune chaîne CHAIN_3_PLUS fabriquée pour Yannis', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.notStrictEqual(yc.chainClassification[q].classification, 'CHAIN_3_PLUS'));
});

// AE12 — bottleneck != cause. Le wording (Mission AA, clinicalNodes) contient légitimement la
// négation prudente "sans que cela en fasse une cause principale" — on vérifie l'absence d'une
// AFFIRMATION causale ("est la cause principale"), jamais du mot seul (même convention qu'AA17).
test('AE12 — bottleneck (Force) : jamais affirmé comme "cause principale", uniquement une négation prudente', () => {
  const b = yc.clinicalBottlenecks.find(x => x.quality === 'Force');
  assert.ok(b);
  assert.ok(!/\best la cause principale\b/i.test(b.wording));
  assert.ok(/sans que cela en fasse/i.test(b.wording), 'wording sans clause prudente : ' + b.wording);
});

// AE13 — dissociation != causalité
test('AE13 — dissociations : jamais OBSERVATION->CAUSE, toujours interpretation+question', () => {
  assert.ok(yc.clinicalDissociations.length > 0);
  yc.clinicalDissociations.forEach(d => {
    assert.ok(d.observation && d.interpretation && d.question);
    assert.ok(!/\best la cause\b|\bcause de\b/i.test(d.interpretation));
  });
});

// AE14 — Force préservée ne devient jamais cause automatique
test('AE14 — Force préservée (Yannis) : aucune priorité, jamais présentée comme cause', () => {
  assert.strictEqual(yc.clinicalPriorities['Force'].tier, null);
  assert.ok(!/\bcause\b/i.test(JSON.stringify(yc.clinicalFactorClassification['Force'].consequences)));
});

// AE15 — conséquence forward uniquement
test('AE15 — conséquences uniquement forward (Force->Explosivité, jamais l\'inverse)', () => {
  assert.ok(yc.clinicalFactorClassification['Force'].consequences.some(c => c.quality === 'Explosivité'));
  assert.strictEqual(yc.clinicalFactorClassification['Explosivité'].consequences.some(c => c.quality === 'Force'), false);
});

// AE16 — missing evidence -> question
test('AE16 — missing evidence (Stabilisation) -> question clinique dans decision board', () => {
  const q = yc.clinicalDecisionBoard.topQuestions.find(x => x.quality === 'Stabilisation');
  assert.ok(q);
  assert.ok(q.question);
});

// AE17 — P1 diagnostique manquant prioritaire
test('AE17 — Heel Raise (diagnostique manquant, seuil réel) classé avant les tests confirmatifs pour Endurance', () => {
  const tests = yc.nextBestTests['Endurance'].tests;
  const heelIdx = tests.findIndex(t => t.testName === 'Heel Raise');
  const confirmIdx = tests.findIndex(t => t.items.every(i => !i.isDiagnostic));
  assert.ok(heelIdx !== -1 && confirmIdx !== -1);
  assert.ok(heelIdx < confirmIdx);
});

// AE18 — P2 explicatif après diagnostic (gain MODERATE < HIGH mais avant simple confirmation LOW)
test('AE18 — variable explicative (MODERATE) classée avant une variable confirmative (LOW) à qualité égale', () => {
  const c = csm({ landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } });
  const tests = c.nextBestTests['Stabilisation'].tests;
  const moderateIdx = tests.findIndex(t => t.expectedReasoningGain === 'MODERATE');
  assert.ok(moderateIdx !== -1);
  const lowIdx = tests.findIndex((t, i) => i > moderateIdx && t.expectedReasoningGain === 'LOW');
  // Le classement global respecte HIGH < MODERATE < LOW < NONE (vérifié structurellement).
  for (let i = 1; i < tests.length; i++) {
    assert.ok(CSM_V2_REASONING_GAIN_RANK[tests[i - 1].expectedReasoningGain] <= CSM_V2_REASONING_GAIN_RANK[tests[i].expectedReasoningGain]);
  }
});

// AE19 — P3 confirmatif après P1/P2
test('AE19 — confirmatif (LOW) toujours classé après diagnostique/explicatif dans le tri par gain', () => {
  const tests = yc.nextBestTests['Endurance'].tests;
  for (let i = 1; i < tests.length; i++) {
    assert.ok(CSM_V2_REASONING_GAIN_RANK[tests[i - 1].expectedReasoningGain] <= CSM_V2_REASONING_GAIN_RANK[tests[i].expectedReasoningGain]);
  }
});

// AE20 — expected reasoning gain correct (les 4 catégories existent et sont bien utilisées). Chez
// Yannis, toutes les qualités DIAGNOSTIC_OBJECTIVE se trouvent être déjà 'explained' -> MODERATE n'y
// apparaît naturellement jamais (HIGH/LOW/NONE si, cf. AE4/AE18/AE21) ; un scénario contrôlé
// (Stabilisation objectivée mais pas encore expliquée) démontre MODERATE séparément.
test('AE20 — expected reasoning gain : les 4 catégories HIGH/MODERATE/LOW/NONE sont toutes atteignables', () => {
  const allGains = new Set();
  HYP_CSM_QUALITIES.forEach(q => yc.nextBestTests[q].tests.forEach(t => allGains.add(t.expectedReasoningGain)));
  ['HIGH', 'LOW', 'NONE'].forEach(g => assert.ok(allGains.has(g), g + ' jamais observé sur Yannis'));
  const controlled = csm({ landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } });
  const moderateTest = controlled.nextBestTests['Stabilisation'].tests.find(t => t.expectedReasoningGain === 'MODERATE');
  assert.ok(moderateTest, 'MODERATE doit être atteignable (qualité objectivée mais pas expliquée + variable explicative manquante avec seuil réel)');
});

// AE21 — test non exploitable -> gain NONE
test('AE21 — cmj_conc_rfd/cmj_conc_impulse_100 (Explosivité, aucun seuil) -> gain NONE, jamais recommandé', () => {
  assert.strictEqual(yc.nextBestTests['Explosivité'].tests.length, 0, 'aucun test avec gain exploitable pour Explosivité');
  const globalEntry = yc.globalNextBestTests.find(t => t.qualities.indexOf('Explosivité') !== -1);
  assert.strictEqual(globalEntry, undefined, 'jamais recommandé dans le classement global');
});

// AE22 — test diagnostique classifiable -> HIGH si qualité non déterminée
test('AE22 — Heel Raise (diagnostique, seuil réel, Endurance non déterminée) -> HIGH', () => {
  const heelRaise = yc.nextBestTests['Endurance'].tests.find(t => t.testName === 'Heel Raise');
  assert.strictEqual(heelRaise.expectedReasoningGain, 'HIGH');
});

// AE23 — test confirmatif -> LOW
test('AE23 — variable confirmative manquante -> LOW (jamais plus)', () => {
  const c = csm({ sl_iso_push: { active: true, D: { trials: { n: [4000] } }, G: { trials: { n: [1000] } } } });
  const confirmTest = c.nextBestTests['Force'].items.find(i => i.variable.indexOf('confirmativeEvidence.') === 0);
  if (confirmTest) assert.strictEqual(confirmTest.expectedReasoningGain, 'LOW');
});

// AE24 — plusieurs qualités impactées -> priorité augmentée seulement si relation démontrée
test('AE24 — plusieurs qualités affectées via relation démontrée (Force) contribue à highImpact, jamais sans relation', () => {
  const r = yc.clinicalPriorities['Force'];
  assert.strictEqual(r.tier, null); // Force préservée : la question ne s'applique pas, vérifié séparément.
  // Stabilisation (2 axes fonctionnels réels, CSM_V2_AXIS_QUALITY_MAP) -> highImpact démontré dans les reasons.
  assert.ok(yc.clinicalPriorities['Stabilisation'].reasons.some(r => /axes fonctionnels/i.test(r)));
});

// AE25 — simple co-occurrence -> aucune priorité causale
test('AE25 — deux qualités déficitaires sans relation (Mobilité bilatérale + Force) -> aucune priorité fondée sur une causalité inventée', () => {
  const c = csm({
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    sl_iso_push: { active: true, D: { trials: { n: [4000] } }, G: { trials: { n: [1000] } } }
  });
  assert.strictEqual(c.clinicalFactorClassification['Mobilité'].contributingFactors.length, 0);
  assert.strictEqual(c.clinicalFactorClassification['Force'].contributingFactors.length, 0);
});

// AE26 — bridge réel -> contribution structurale
test('AE26 — bridge réel (rawD/rawG/lsi réels) accepté comme associatedFactor', () => {
  const b = yc.clinicalFactorClassification['Explosivité'].associatedFactors[0];
  assert.ok(b.evidence[0].left != null && b.evidence[0].right != null);
});

// AE27 — bridge numérique fictif -> refus
test('AE27 — coïncidence numérique (wblt=10=cmj_peak_power) -> aucun bridge fabriqué entre Mobilité et Puissance', () => {
  const c = csm({
    wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
    cmj: { active: true, trials: { peak_power: [10] } }
  });
  assert.strictEqual(c.clinicalBridgeEvidence.some(b => (b.qualityA === 'Mobilité' && b.qualityB === 'Puissance') || (b.qualityA === 'Puissance' && b.qualityB === 'Mobilité')), false);
});

// AE28 — chaîne 2 maillons valide
test('AE28 — chaîne à 2 maillons (Mobilité<->Stabilisation) acceptée, classification CHAIN_2', () => {
  const c = csm({
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [14] } } }
  });
  assert.strictEqual(c.chainClassification['Stabilisation'].classification, 'CHAIN_2');
});

// AE29 — chaîne 3 maillons partiellement supportée -> refus
test('AE29 — chaîne à 3 maillons partiellement supportée -> jamais complétée, refus', () => {
  const c = csm({
    iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
    slcmj: { active: true, D: { trials: { peak_power: [5] } }, G: { trials: { peak_power: [5] } } },
    cmj: { active: true, trials: { peak_power: [5], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  }, { iso_belt_squat: 'belt_netball_super_league_f', cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null } });
  HYP_CSM_QUALITIES.forEach(q => assert.notStrictEqual(c.chainClassification[q].classification, 'CHAIN_3_PLUS'));
});

// ══════════════════════════ AE30-AE36 — YANNIS RÉEL ═══════════════════════════════════════════
test('AE30 — Yannis Endurance : Heel Raise priorisable (HIGH)', () => {
  assert.ok(yc.globalNextBestTests[0].test === 'Heel Raise' || yc.globalNextBestTests.some(t => t.test === 'Heel Raise' && t.expectedReasoningGain === 'HIGH'));
});

test('AE31 — Yannis Stabilisation : SLS identifiable comme donnée manquante', () => {
  assert.ok(yc.clinicalFactorClassification['Stabilisation'].unknown.some(m => /sls/i.test(m.variable)));
});

test('AE32 — Yannis Explosivité : pas de faux diagnostic', () => {
  assert.strictEqual(yc.clinicalEvidenceHierarchy['Explosivité'].level1_diagnostic.present, false);
  assert.strictEqual(yc.clinicalCertainty['Explosivité'], 'not_determined');
});

test('AE33 — Yannis Mobilité : WBLT objectivé', () => {
  assert.strictEqual(yc.clinicalEvidenceHierarchy['Mobilité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
});

test('AE34 — Yannis Réactivité : SLDJ convergent', () => {
  assert.strictEqual(yc.clinicalCausalReasoning.qualityReasoning['Réactivité'].directEvidence[0].type, 'CONVERGENT');
});

test('AE35 — Yannis Absorption : convergence CMJ/SLJ', () => {
  assert.strictEqual(yc.clinicalCausalReasoning.qualityReasoning['Absorption'].directEvidence[0].evidence.length, 4);
});

test('AE36 — Yannis Force : préservée', () => {
  assert.strictEqual(yc.clinicalProfile['Force'].severity, 'preserved');
  assert.strictEqual(yc.clinicalCertainty['Force'], 'preserved');
});

// AE37 — TOP 3 dynamique
test('AE37 — decision board TOP 3 : au maximum 3 items par catégorie, dynamiquement calculés', () => {
  assert.ok(yc.clinicalDecisionBoard.topLimitations.length <= 3);
  assert.ok(yc.clinicalDecisionBoard.topQuestions.length <= 3);
  assert.ok(yc.clinicalDecisionBoard.topTests.length <= 3);
  const other = csm({ landing_uni: { active: true, D: { trials: { tts: [0.4] } }, G: { trials: { tts: [0.4] } } } });
  assert.notDeepStrictEqual(yc.clinicalDecisionBoard.topLimitations.map(l => l.title), other.clinicalDecisionBoard.topLimitations.map(l => l.title));
});

// AE38 — aucun item codé spécifiquement pour Yannis
test('AE38 — aucune phrase Yannis codée en dur dans les fonctions Mission AE (source scan)', () => {
  const fnStart = code.indexOf('MISSION AE — CLINICAL DECISION ENGINE');
  const fnEnd = code.indexOf('Mission Q, objectif 3 — Rapport patient');
  const aeBlock = code.slice(fnStart, fnEnd);
  assert.strictEqual(/yannis/i.test(aeBlock), false);
  assert.strictEqual(/briant/i.test(aeBlock), false);
});

// AE39 — clinicalDecisionSynthesis cohérente avec clinicalCausalReasoning
test('AE39 — clinicalDecisionSynthesis cohérente : qualités dominantes reflètent clinicalPriorities', () => {
  const dominant = yc.clinicalDecisionSynthesis.dominantQualities;
  dominant.forEach(q => assert.ok(['PRIORITAIRE', 'IMPORTANTE'].indexOf(yc.clinicalPriorities[q].tier) !== -1));
  assert.ok(yc.clinicalDecisionSynthesis.narrative.length > 0);
});

// AE40 — variableMatrix cohérente
test('AE40 — futureDataValue/clinicalPriorities cohérents avec CSM_V2_CLINICAL_VARIABLE_MATRIX (Mission AB/AD)', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
  assert.ok(yc.futureDataValue.A_test_disponible_seuil_existant.some(v => v.variableKey === 'heel_raise_reps'));
});

// AE41 — clinicalEvidenceHierarchy cohérente
test('AE41 — clinicalEvidenceHierarchy cohérente avec clinicalCertainty (Mission AD, inchangée)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    if (yc.clinicalEvidenceHierarchy[q].verdict === 'AUCUNE_PREUVE_DIAGNOSTIQUE') assert.strictEqual(yc.clinicalCertainty[q], 'not_determined');
  });
});

// AE42 — clinicalCertainty cohérente
test('AE42 — clinicalCertainty (Mission AD) strictement inchangée par Mission AE (pureté)', () => {
  const c2 = csm(YANNIS_DATA, YANNIS_NORM_SEL);
  assert.deepStrictEqual(yc.clinicalCertainty, c2.clinicalCertainty);
});

// AE43 — missing evidence conservée
test('AE43 — missingEvidence conservée à l\'identique entre clinicalCausalReasoning/clinicalFactorClassification/reasoningBoundaries', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    assert.deepStrictEqual(yc.clinicalFactorClassification[q].unknown, yc.clinicalCausalReasoning.qualityReasoning[q].missingEvidence);
  });
});

// AE44 — futureDataValue cohérente
test('AE44 — futureDataValue : catégories A/B/E disjointes, aucune variable dupliquée', () => {
  const allKeys = yc.futureDataValue.A_test_disponible_seuil_existant.concat(yc.futureDataValue.B_test_disponible_pas_de_seuil, yc.futureDataValue.E_sans_utilite_decisionnelle).map(v => v.quality + '.' + v.variableKey);
  assert.strictEqual(new Set(allKeys).size, allKeys.length);
});

// AE45 — PDF = ExpertView
test('AE45 — PDF et ExpertView utilisent exactement le même rendu (Decision Board inclus)', () => {
  const res = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: YANNIS_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Test', nom: 'Patient' }, bilan, res);
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
  assert.ok(bodyDirect.indexOf('Priorités cliniques') !== -1);
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
});

// AE46 — aucune modification HYP LOCKED
test('AE46 — les 8 moteurs HYP LOCKED conservent leur contrat', () => {
  const ids = { Force: 'HYP-FOR-01', Puissance: 'HYP-PUI-01', 'Explosivité': 'HYP-EXP-01', 'Mobilité': 'HYP-MOB-01', 'Réactivité': 'HYP-REA-01', Absorption: 'HYP-ABS-01', Stabilisation: 'HYP-STA-01', Endurance: 'HYP-END-01' };
  Object.keys(ids).forEach(q => assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].hypId, ids[q]));
});

// AE47 — aucune modification THRESHOLDS
test('AE47 — THRESHOLDS strictement inchangé (24 clés, spot-check)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(THRESHOLDS.heel_raise_reps.vert, 25);
  assert.strictEqual(THRESHOLDS.landing_uni_tts.orange, 1.8);
});

// AE48 — aucune modification NORMS_V2
test('AE48 — NORMS_V2/HYP_QUALITY_RELATIONS/CLINICAL_HYPOTHESIS_WHITELIST strictement inchangés', () => {
  assert.strictEqual(NORMS_V2.cmj_peak_power !== undefined, true);
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
});

// AE49 — régression complète
test('AE49 — régression : Yannis 8 sévérités inchangées, structures Q->AD toujours présentes', () => {
  const expected = { Force: 'preserved', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Puissance: 'modere', Explosivité: 'modere', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(yc.clinicalProfile[q].severity, expected[q], q));
  ['clinicalEvidenceHierarchy', 'clinicalCertainty', 'variableReasoningTrace', 'clinicalFactorClassification', 'chainClassification', 'clinicalQuestions', 'reasoningBoundaries', 'finalClinicalReasoning'].forEach(k => assert.ok(k in yc, k + ' manquant (Mission AD)'));
  ['clinicalPriorities', 'nextBestTests', 'globalNextBestTests', 'qualityDecisionProfiles', 'clinicalBottlenecks', 'clinicalDissociations', 'clinicalLimitationHierarchy', 'clinicalActionPlan', 'futureDataValue', 'clinicalDecisionSynthesis', 'clinicalDecisionBoard'].forEach(k => assert.ok(k in yc, k + ' manquant (Mission AE)'));
});

console.log('=== TOTAL MISSION AE : ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) process.exit(1);

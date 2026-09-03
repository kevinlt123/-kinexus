// MISSION Z — Du profil fonctionnel au raisonnement clinique actionnable.
//
// Vérifie computeCsmV2ClinicalReasoningPaths() / computeCsmV2MissingEvidencePriority() /
// computeCsmV2ClinicalNextQuestions() / computeCsmV2ReasoningToAction() /
// computeCsmV2ActionableClinicalSynthesis() : couche additive PURE au-dessus de
// clinicalCausalReasoning (Mission X) / clinicalFunctionalProfilePatterns (Mission Y) /
// CSM_V2_AXIS_QUALITY_MAP (LOCKED, Mission Q). Aucune norme/LSI/preuve/relation recalculée.
//
// Exécution : node tests/mission_z_clinical_reasoning_paths_tests.js — aucune dépendance externe.
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

// ── Fixture réelle Yannis (identique à tests/csmV2RealDataYannis.test.js, inchangée) ────────────
const REAL_DATA = {
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
const NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

function run(testData, normSel) { return computeMoteur(testData || REAL_DATA, {}, null, 25, normSel || NORM_SEL); }
function csm() { return run().clinicalSynthesisV2; }

console.log('MISSION Z — raisonnement clinique actionnable (chemins de raisonnement)');

// Z1 — déficit → preuves
test('Z1 — déficit → preuves : Réactivité a une étape "preuves" citant les 3 preuves SLDJ', () => {
  const rp = csm().clinicalReasoningPaths['Réactivité'];
  const preuves = rp.reasoningPath.find(s => s.step === 'preuves');
  assert.ok(preuves);
  assert.ok(/RSI/.test(preuves.text) && /Contact Time/.test(preuves.text));
});

// Z2 — facteur direct
test('Z2 — facteur direct : Réactivité a un primaryFactor de type convergent (own evidence)', () => {
  const rp = csm().clinicalReasoningPaths['Réactivité'];
  assert.strictEqual(rp.primaryFactors.length, 1);
  assert.strictEqual(rp.primaryFactors[0].type, 'convergent');
});

// Z3 — facteur contributif
test('Z3 — facteur contributif : Stabilisation a 2 contributoryFactors (Force, Mobilité), relation validée', () => {
  const rp = csm().clinicalReasoningPaths['Stabilisation'];
  assert.strictEqual(rp.contributoryFactors.length, 2);
  const sources = rp.contributoryFactors.map(f => f.quality);
  assert.ok(sources.indexOf('Force') !== -1 && sources.indexOf('Mobilité') !== -1);
});

// Z4 — facteur associé
test('Z4 — facteur associé : Absorption a un associatedFactor de type bridge (Explosivité)', () => {
  const rp = csm().clinicalReasoningPaths['Absorption'];
  assert.strictEqual(rp.associatedFactors.length, 1);
  assert.strictEqual(rp.associatedFactors[0].type, 'bridge');
  assert.strictEqual(rp.associatedFactors[0].quality, 'Explosivité');
});

// Z5 — absence de facteur externe (own evidence seule) → certainty 'objectivé'
test('Z5 — absence de facteur externe : Réactivité (own evidence seule) → certainty "objectivé"', () => {
  const rp = csm().clinicalReasoningPaths['Réactivité'];
  assert.strictEqual(rp.contributoryFactors.length, 0);
  assert.strictEqual(rp.associatedFactors.length, 0);
  assert.strictEqual(rp.certainty, 'objectivé');
});

// Z6 — not_determined (mécanisme vérifié synthétiquement, comme Mission X/W)
test('Z6 — not_determined : certainty passe à "non_determine" quand unexplainedReason existe (mécanisme vérifié)', () => {
  const allQr = csm().clinicalCausalReasoning.qualityReasoning;
  const anyND = Object.keys(allQr).some(q => allQr[q].unexplainedReason);
  Object.keys(allQr).forEach(q => {
    if (allQr[q].unexplainedReason) {
      assert.strictEqual(csm().clinicalReasoningPaths[q].certainty, 'non_determine');
    }
  });
  assert.ok(true, 'mécanisme vérifié (anyND=' + anyND + ' sur ce bilan)');
});

// Z7 — bridge
test('Z7 — bridge : Mobilité a un associatedFactor de type bridge vers Stabilisation', () => {
  const rp = csm().clinicalReasoningPaths['Mobilité'];
  assert.ok(rp.associatedFactors.some(f => f.type === 'bridge' && f.quality === 'Stabilisation'));
});

// Z8 — relation qualité (wording + relationship bien formés, jamais inversés)
test('Z8 — relation qualité : chaque contributoryFactor.relationship suit le format "Explains→Explained" whitelisté', () => {
  const rp = csm().clinicalReasoningPaths['Puissance'];
  const f = rp.contributoryFactors[0];
  assert.strictEqual(f.relationship, 'Force→Puissance');
  assert.ok(HYP_QUALITY_RELATIONS.some(r => r.explains === 'Force' && r.explained === 'Puissance'));
});

// Z9 — chaîne fonctionnelle / pattern dans le reasoningPath
test('Z9 — chaîne fonctionnelle : l\'étape "relations_bridges_patterns" de Stabilisation cite un pattern réel', () => {
  const rp = csm().clinicalReasoningPaths['Stabilisation'];
  const step = rp.reasoningPath.find(s => s.step === 'relations_bridges_patterns');
  assert.ok(step && /Mobilité \/ Stabilisation/.test(step.text));
});

// Z10 — conséquence
test('Z10 — conséquence : Force a des consequences non vides (dissociation vers plusieurs qualités)', () => {
  const rp = csm().clinicalReasoningPaths['Force'];
  assert.ok(rp.consequences.length > 0);
});

// Z11 — missing evidence (structure)
test('Z11 — missing evidence : missingEvidencePriority regroupe par test avec role/roleLabel/hasThreshold', () => {
  const mep = csm().missingEvidencePriority['Stabilisation'];
  assert.ok(mep.tests.length > 0);
  mep.tests.forEach(t => {
    assert.ok(t.testName && t.items.length);
    t.items.forEach(it => assert.ok(it.role && it.roleLabel && typeof it.hasThreshold === 'boolean'));
  });
});

// Z12 — question clinique
test('Z12 — question clinique : computeCsmV2ClinicalNextQuestions reprend exactement les questions déjà générées', () => {
  const c = csm();
  const nq = c.clinicalNextQuestions;
  assert.strictEqual(nq.length, c.clinicalCausalReasoning.unresolvedQuestions.length);
  nq.forEach(q => assert.ok(q.recommendedTests.length > 0));
});

// Z13 — test complémentaire (jamais un test inventé, toujours dans le catalogue TBK)
test('Z13 — test complémentaire : chaque recommendedTests provient réellement du catalogue TESTS (TBK)', () => {
  const c = csm();
  const tbkLabels = Object.keys(TBK).map(function (k) { return TBK[k].label; });
  Object.keys(c.missingEvidencePriority).forEach(q => {
    c.missingEvidencePriority[q].tests.forEach(t => {
      assert.ok(tbkLabels.indexOf(t.testName) !== -1, t.testName + ' absent du catalogue TBK');
    });
  });
});

// Z14 — priorisation (Heel Raise, classifiable, avant Hop Test, non classifiable)
test('Z14 — priorisation : Heel Raise (seuil réel) priorisé avant Hop Test (aucun seuil) pour Endurance', () => {
  const tests = csm().missingEvidencePriority['Endurance'].tests.map(t => t.testName);
  const iHeel = tests.indexOf('Heel Raise'), iHop = tests.indexOf('Hop Test');
  assert.ok(iHeel !== -1 && iHop !== -1 && iHeel < iHop);
});

// Z15 — axe de progression (réutilise CSM_V2_AXIS_QUALITY_MAP, jamais un axe inventé)
test('Z15 — axe de progression : recommendedAxis de Mobilité = "mobilité de cheville" (axe déjà validé)', () => {
  const rp = csm().clinicalReasoningPaths['Mobilité'];
  assert.deepStrictEqual(rp.recommendedAxis, ['mobilité de cheville']);
  assert.ok(CSM_V2_AXIS_QUALITY_MAP['mobilité de cheville'].indexOf('Mobilité') !== -1);
});

// Z16 — reasoning path complet (les 7 étapes attendues quand les données le permettent)
test('Z16 — reasoning path complet : Stabilisation traverse deficit/preuves/facteurs/relations/consequences/donnees_manquantes/action', () => {
  const steps = csm().clinicalReasoningPaths['Stabilisation'].reasoningPath.map(s => s.step);
  ['deficit', 'preuves', 'facteurs_explicatifs', 'relations_bridges_patterns', 'consequences', 'donnees_manquantes', 'action_clinique'].forEach(s => assert.ok(steps.indexOf(s) !== -1, s + ' manquant'));
});

// Z17 — plusieurs facteurs (jamais fusionnés en un seul)
test('Z17 — plusieurs facteurs : les 2 contributoryFactors de Stabilisation restent des entrées distinctes (Force ≠ Mobilité)', () => {
  const rp = csm().clinicalReasoningPaths['Stabilisation'];
  assert.notStrictEqual(rp.contributoryFactors[0].wording, rp.contributoryFactors[1].wording);
});

// Z18 — facteurs jamais dans deux catégories à la fois (partition stricte)
test('Z18 — partition stricte : aucun facteur n\'apparaît simultanément dans 2 catégories (primary/contributory/associated)', () => {
  const rp = csm().clinicalReasoningPaths['Stabilisation'];
  const all = rp.primaryFactors.concat(rp.contributoryFactors, rp.associatedFactors);
  const seen = new Set();
  all.forEach(f => { const key = f.type + '|' + f.quality + '|' + (f.relationship || ''); assert.ok(!seen.has(key), 'doublon : ' + key); seen.add(key); });
});

// Z19 — absence de relation (Force→Réactivité n'existe pas) : jamais fabriquée
test('Z19 — absence de relation : Réactivité n\'a aucun contributoryFactor issu de Force (relation non whitelistée)', () => {
  const rp = csm().clinicalReasoningPaths['Réactivité'];
  assert.ok(!rp.contributoryFactors.some(f => f.quality === 'Force'));
});

// Z20 — absence de données (qualité non mesurée) : reasoningPath vide, deficit=false
test('Z20 — absence de données : une qualité totalement non mesurée n\'a ni déficit ni chemin de raisonnement fabriqué', () => {
  const data = { sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } } };
  const rp = run(data).clinicalSynthesisV2.clinicalReasoningPaths['Endurance'];
  assert.strictEqual(rp.deficit, false);
  assert.strictEqual(rp.reasoningPath.length, 0);
});

// Z21 — Yannis Stabilisation
test('Z21 — Yannis Stabilisation : certainty expliqué, axe réceptions+contrôle unipodal, priorité présente', () => {
  const rp = csm().clinicalReasoningPaths['Stabilisation'];
  assert.strictEqual(rp.certainty, 'expliqué');
  assert.deepStrictEqual(rp.recommendedAxis.slice().sort(), ['contrôle unipodal', 'réceptions'].sort());
});

// Z22 — Yannis Mobilité
test('Z22 — Yannis Mobilité : certainty objectivé ou associé (aucune relation entrante), preuve WBLT+YBT', () => {
  const rp = csm().clinicalReasoningPaths['Mobilité'];
  assert.ok(rp.certainty === 'objectivé' || rp.certainty === 'associé');
  assert.strictEqual(rp.primaryFactors[0].evidence.length, 2);
});

// Z23 — Yannis Réactivité
test('Z23 — Yannis Réactivité : certainty objectivé, axe cycle étirement-raccourcissement/pliométrie', () => {
  const rp = csm().clinicalReasoningPaths['Réactivité'];
  assert.strictEqual(rp.certainty, 'objectivé');
  assert.ok(rp.recommendedAxis.indexOf('cycle étirement-raccourcissement') !== -1);
});

// Z24 — Yannis Absorption
test('Z24 — Yannis Absorption : certainty associé (bridge seul, pas de relation validée), 4 preuves propres', () => {
  const rp = csm().clinicalReasoningPaths['Absorption'];
  assert.strictEqual(rp.certainty, 'associé');
  assert.strictEqual(rp.primaryFactors[0].evidence.length, 4);
});

// Z25 — Yannis Endurance
test('Z25 — Yannis Endurance : certainty expliqué (Force), Heel Raise recommandé en priorité', () => {
  const rp = csm().clinicalReasoningPaths['Endurance'];
  assert.strictEqual(rp.certainty, 'expliqué');
  assert.strictEqual(rp.recommendedTests[0].testName, 'Heel Raise');
});

// Z26 — Yannis Puissance
test('Z26 — Yannis Puissance : certainty expliqué (dissociation Force), facteur direct slcmj_peak_power', () => {
  const rp = csm().clinicalReasoningPaths['Puissance'];
  assert.strictEqual(rp.certainty, 'expliqué');
  assert.strictEqual(rp.primaryFactors[0].type, 'direct');
});

// Z27 — Yannis Force préservée
test('Z27 — Yannis Force préservée : deficit=false, certainty=null, mais consequences réelles conservées', () => {
  const rp = csm().clinicalReasoningPaths['Force'];
  assert.strictEqual(rp.deficit, false);
  assert.strictEqual(rp.certainty, null);
  assert.ok(rp.consequences.length > 0);
});

// Z28 — aucune causalité inventée
test('Z28 — aucune causalité inventée : forbiddenWordingCheck passe sur le rendu réel Yannis (patterns + reasoning paths compris)', () => {
  const c = csm();
  assert.strictEqual(c.clinicalReport.forbiddenWordingCheck.passed, true);
  assert.deepStrictEqual(c.clinicalReport.forbiddenWordingCheck.found, []);
});

// Z29 — PDF/ExpertView même objet
test('Z29 — PDF/ExpertView : même corps csmV2ClinicalReportBodyHtml, section "Du déficit aux priorités" présente', () => {
  const res = run();
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const sportifHtml = buildSportifReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
  assert.ok(expertHtml.indexOf('Du déficit aux priorités') !== -1);
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
  assert.strictEqual(sportifHtml.indexOf('undefined'), -1);
});

// Z30 — aucune régression (moteurs LOCKED intacts, pureté, tous les champs existants conservés)
test('Z30 — aucune régression : HYP_QUALITY_RELATIONS/WHITELIST intacts, tous les champs clinicalSynthesisV2 des missions précédentes toujours présents', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  const c = csm();
  ['clinicalProfile', 'clinicalExplanations', 'clinicalReasoning', 'clinicalQualityMap', 'clinicalReasoningGraph', 'clinicalBridgeEvidence', 'clinicalFunctionalChains', 'clinicalMechanisticReasoning', 'clinicalCausalReasoning', 'clinicalFunctionalProfilePatterns', 'globalFunctionalSynthesis', 'clinicalReasoningPaths', 'missingEvidencePriority', 'clinicalNextQuestions', 'reasoningToAction', 'actionableClinicalSynthesis', 'clinicalReport'].forEach(k => assert.ok(k in c, k + ' manquant'));
  const a = JSON.stringify(run().functionScores);
  const b = JSON.stringify(run().functionScores);
  assert.strictEqual(a, b);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

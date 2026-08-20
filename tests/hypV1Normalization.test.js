// Tests unitaires — Normalisation architecturale HYP V1 (mission "HYP = source de vérité,
// TFM = réseau relationnel conservé, priorities/causalSteps ne génère plus de causalité à partir
// du seul classement TFM").
//
// Ne teste PAS à nouveau les règles cliniques de chaque qualité (déjà couvertes exhaustivement par
// tests/hypAbsorption01.test.js, hypReactivity01.test.js, hypMobility01.test.js, hypPower01.test.js,
// hypForce01.test.js, hypExplosivity01.test.js, hypStabilization01.test.js, hypEndurance01.test.js —
// tous réexécutés sans modification de leurs assertions cliniques, hormis 4 assertions de repli TFM
// devenues obsolètes par cette mission, mises à jour dans leurs fichiers respectifs). Se concentre
// strictement sur les points de la mission de normalisation : contrat commun, source de vérité,
// conservation du TFM, et interdiction de causalité TFM seule.
//
// Exécution : node tests/hypV1Normalization.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var C={');
const end = code.indexOf('// ── SUPABASE CONFIG');
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur() dans index.html.');
const slice = code.slice(start, end);

global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok — ' + name);
  } catch (e) {
    failed++;
    console.log('  FAIL — ' + name);
    console.log('    ' + e.message);
  }
}

var POP = 'general_m_senior', AGE = 30;
var CONTRACT_FIELDS = ['hypId', 'quality', 'state', 'status', 'support', 'convergence', 'diagnostic', 'confirmative', 'explanatory', 'precision', 'limitations'];

console.log('TEST 1 — Les 8 moteurs retournent le contrat commun (hypId/quality/state/status/support/convergence/diagnostic/confirmative/explanatory/precision/limitations)');
test('Les 8 fonctions computeHypXxx01 exposent tous les champs du contrat commun, sans donnée manquante', () => {
  var engines = {
    Mobilité: computeHypMobility01({}, POP, AGE),
    Réactivité: computeHypReactivity01({}, POP, AGE),
    Absorption: computeHypAbsorption01({}, POP, AGE),
    Force: computeHypForce01({}, POP, AGE),
    Puissance: computeHypPower01({}, POP, AGE),
    Explosivité: computeHypExplosivity01({}, POP, AGE),
    Stabilisation: computeHypStabilization01({}, POP, AGE),
    Endurance: computeHypEndurance01({}, POP, AGE)
  };
  Object.keys(engines).forEach(function (q) {
    var h = engines[q];
    CONTRACT_FIELDS.forEach(function (f) {
      assert.ok(f in h, q + ' : champ de contrat manquant « ' + f + ' »');
    });
    assert.strictEqual(h.quality, q, q + ' : hyp.quality incorrect');
    assert.ok(Array.isArray(h.limitations), q + ' : limitations doit être un tableau');
  });
});

console.log('\nTEST 2 — Les informations spécifiques déjà existantes sont conservées (aucune régression de champ)');
test('Puissance conserve activeSecondProof/substitution ; Force conserve segments/relativeOrientation ; Absorption conserve niveau1/sousDomaines/asymetrie', () => {
  var pui = computeHypPower01({}, POP, AGE);
  assert.ok('activeSecondProof' in pui);
  assert.ok('substitution' in pui);
  var force = computeHypForce01({}, POP, AGE);
  assert.ok('segments' in force);
  assert.ok('relativeOrientation' in force);
  var abs = computeHypAbsorption01({}, POP, AGE);
  assert.ok('niveau1' in abs);
  assert.ok('sousDomaines' in abs);
  assert.ok('asymetrie' in abs);
  var sta = computeHypStabilization01({}, POP, AGE);
  assert.ok('convergence' in sta && 'ruleVariant' in sta.convergence);
  var end = computeHypEndurance01({}, POP, AGE);
  assert.ok('convergence' in end && 'ruleVariant' in end.convergence);
});

console.log('\nTEST 3 — Absorption respecte désormais le contrat, comportement clinique strictement identique avant/après');
var POP_CMJ = 'bball2425_ncaa_m';
function cmjAbs(vals) { var trials = {}; Object.keys(vals).forEach(function (k) { trials[k] = [vals[k]]; }); return { active: true, trials: trials }; }
test('niveau1 (raisonnement clinique original) produit exactement les mêmes valeurs que documentées avant la normalisation', () => {
  var ok = computeHypAbsorption01({ cmj: cmjAbs({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }) }, POP_CMJ, 26);
  assert.strictEqual(ok.niveau1, 'ok');
  assert.strictEqual(ok.state, 'absente'); // relabelage bijectif, aucun recalcul
  assert.strictEqual(ok.status, 'vert');
  var def = computeHypAbsorption01({ cmj: cmjAbs({ braking_rfd: 1, force_zero_vel: 1, braking_impulse: 40 }) }, POP_CMJ, 26);
  assert.strictEqual(def.niveau1, 'deficitaire');
  assert.strictEqual(def.state, 'retenue_faible');
  assert.strictEqual(def.status, 'rouge');
  assert.strictEqual(def.profilCore, 'non_couvert_impulse_non_classifiable'); // inchangé
});
test('Absorption : capacité excentrique, stratégie, DJ RSI (sous-domaine D) et TTS/SLLT (sous-domaine E) inchangés', () => {
  var td = { cmj: cmjAbs({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5, ecc_mean_power: 10, depth: 5 }), dj: { active: true, trials: { rsi: [2.0] } } };
  var h = computeHypAbsorption01(td, POP_CMJ, 26);
  assert.strictEqual(h.sousDomaines.B_capaciteExcentrique.ecc_mean_power.raw, 10);
  assert.strictEqual(h.sousDomaines.C_strategie.depth.raw, 5);
  assert.strictEqual(h.sousDomaines.D_absorptionReactive.dj_rsi.raw, 2.0);
  assert.strictEqual(h.sousDomaines.E_receptionImpact.available, false);
  // Alias de contrat pointent vers les MÊMES objets, aucune duplication de logique.
  assert.strictEqual(h.explanatory.capaciteExcentrique, h.sousDomaines.B_capaciteExcentrique);
  assert.strictEqual(h.diagnostic, h.sousDomaines.A_core);
});

console.log('\nTEST 4/5/6 — HYP devient la source de vérité du statut pour Mobilité/Réactivité/Absorption, le TFM ne peut plus le contredire');
test('Mobilité : aucune donnée wblt -> status:null, jamais un statut TFM contradictoire', () => {
  var td = { hip_abd: { active: true, D: { trials: { n: [1] } }, G: { trials: { n: [1] } } } }; // TFM aurait pu pondérer d'autres tests
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Mobilité'].status, null);
  assert.strictEqual(r.functionScores['Mobilité'].hypMob01.dataAvailable, false);
});
test('Réactivité : aucune donnée dj/sldj mais cmj/slcmj déficitaires (poids TFM reactivite non nul) -> status:null quand même, jamais un statut dérivé du TFM', () => {
  var td = { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Réactivité'].hypRea01.state, 'absente');
  assert.strictEqual(r.functionScores['Réactivité'].hypRea01.dataAvailable, false);
  assert.strictEqual(r.functionScores['Réactivité'].status, null, 'contradiction trouvée par AUDIT_TRANSVERSAL_HYP_V1.md §6 -- doit être corrigée');
});
test('Absorption : aucune donnée CMJ mais dj/landing déficitaires (poids TFM absorption non nul) -> status:null quand même', () => {
  var td = { dj: { active: true, trials: { rsi: [0.1] } }, landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Absorption'].hypAbs01.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Absorption'].status, null);
});

console.log('\nTEST 4bis — TFM conservé comme source relationnelle (tfmFallback jamais supprimé)');
test('tfmFallback est exposé sur Absorption/Réactivité/Mobilité (peut être non-null si des tests génériques sont actifs)', () => {
  var td = { dj: { active: true, trials: { rsi: [0.1] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok('tfmFallback' in r.functionScores['Absorption']);
  assert.ok('tfmFallback' in r.functionScores['Réactivité']);
  assert.ok('tfmFallback' in r.functionScores['Mobilité']);
  // dj a un poids TFM non nul pour absorption -> le repli générique existe toujours en parallèle, non affiché comme statut.
  assert.notStrictEqual(r.functionScores['Absorption'].tfmFallback, null);
});

console.log('\nTEST 7/8/9 — Puissance/Force/Explosivité restent non_determinable en l\'absence de normes (comportement clinique inchangé)');
test('Puissance : slcmj_peak_power non normé -> non_determinable malgré cmj_peak_power classifiable', () => {
  var r = computeMoteur({ cmj: { active: true, trials: { peak_power: [10] } } }, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Puissance'].hypPui01.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Puissance'].status, null);
});
test('Force : imtp_n/slimtp_n non normés, iso_belt_squat_n/sl_iso_push_n absents -> non_determinable', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Force'].hypFor01.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Force'].status, null);
});
test('Explosivité : cmj_conc_rfd/cmj_conc_impulse_100 non normés -> non_determinable', () => {
  var r = computeMoteur({ cmj: { active: true, trials: { conc_rfd: [1], conc_impulse_100: [1] } } }, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Explosivité'].hypExp01.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Explosivité'].status, null);
});

console.log('\nTEST 10/11 — Stabilisation et Endurance conservent leur comportement actuel (retenue_faible réellement atteignable avec des données réelles)');
test('Stabilisation : landing_uni_tts + landing_bi_tts tous deux déficitaires -> retenue_faible, comme avant la normalisation', () => {
  var r = computeMoteur({ landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }, landing_bi: { active: true, trials: { tts: [2.5] } } }, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Stabilisation'].hypSta01.state, 'retenue_faible');
  assert.ok(r.functionScores['Stabilisation'].status === 'orange' || r.functionScores['Stabilisation'].status === 'rouge');
});
test('Endurance : heel_raise_reps déficitaire seul -> suspectee, comme avant la normalisation', () => {
  var r = computeMoteur({ heel_raise: { active: true, D: { trials: { reps: [10] } }, G: { trials: { reps: [10] } } } }, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Endurance'].hypEnd01.state, 'suspectee');
  assert.strictEqual(r.functionScores['Endurance'].status, 'jaune');
});

console.log('\nTEST 12 — cmj_conc_rfd conserve son double rôle (diagnostique Explosivité / explicative Puissance)');
test('cmj_conc_rfd est diagnostique dans hypExp01, explicative (jamais diagnostique) dans hypPui01', () => {
  var td = { cmj: { active: true, trials: { conc_rfd: [10], peak_power: [10] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok('cmj_conc_rfd' in r.functionScores['Explosivité'].hypExp01.diagnosticEvidence);
  assert.ok('cmj_conc_rfd' in r.functionScores['Puissance'].hypPui01.explanatoryEvidence.strategie);
  assert.strictEqual('cmj_conc_rfd' in r.functionScores['Puissance'].hypPui01.diagnosticEvidence, false);
});

console.log('\nTEST 13 — DJ/SLDJ conservent leur rôle diagnostique Réactivité (jamais promus Absorption)');
test('dj_rsi/sldj_rsi restent diagnostiques de Réactivité uniquement ; jamais dans hypAbs01.diagnostic', () => {
  var td = { dj: { active: true, trials: { rsi: [3.0] } }, sldj: { active: true, D: { trials: { rsi: [3.0] } }, G: { trials: { rsi: [3.0] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok('dj_rsi' in r.functionScores['Réactivité'].hypRea01.diagnosticEvidence);
  assert.ok('sldj_rsi' in r.functionScores['Réactivité'].hypRea01.diagnosticEvidence);
  assert.strictEqual(JSON.stringify(r.functionScores['Absorption'].hypAbs01.diagnostic).indexOf('dj_rsi'), -1);
});

console.log('\nTEST 14 — TTS Landing conserve son rôle diagnostique Stabilisation (jamais réintroduit dans Absorption)');
test('landing_uni_tts/landing_bi_tts restent diagnostiques de Stabilisation uniquement', () => {
  var td = { landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }, landing_bi: { active: true, trials: { tts: [2.5] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok('landing_uni_tts' in r.functionScores['Stabilisation'].hypSta01.diagnostic);
  assert.strictEqual(JSON.stringify(r.functionScores['Absorption'].hypAbs01).indexOf('landing_uni_tts'), -1);
});

console.log('\nTEST 15 — Aucune contamination entre qualités (isolation, spot-check)');
test('Modifier uniquement Force ne modifie ni Puissance ni Explosivité ni Endurance', () => {
  var base = { cmj: { active: true, trials: { peak_power: [10] } } };
  var tdA = Object.assign({}, base, { imtp: { active: true, trials: { n: [1000] } } });
  var tdB = Object.assign({}, base, { imtp: { active: true, trials: { n: [10] } } });
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  ['Puissance', 'Explosivité', 'Endurance'].forEach(function (fn) {
    assert.strictEqual(rA.functionScores[fn].status, rB.functionScores[fn].status, fn + ' a changé');
  });
});

console.log('\nTEST 16 — Aucun double comptage diagnostique (une variable diagnostique d\'une qualité n\'apparaît jamais comme diagnostique d\'une autre)');
test('iso_belt_squat_n est diagnostique de Force uniquement, jamais dans diagnosticEvidence de Puissance/Explosivité/Endurance', () => {
  var td = { iso_belt_squat: { active: true, trials: { n: [4500] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok('iso_belt_squat_n' in r.functionScores['Force'].hypFor01.diagnosticEvidence);
  assert.strictEqual('iso_belt_squat_n' in (r.functionScores['Puissance'].hypPui01.diagnosticEvidence || {}), false);
  assert.strictEqual('iso_belt_squat_n' in (r.functionScores['Explosivité'].hypExp01.diagnosticEvidence || {}), false);
  assert.strictEqual('iso_belt_squat_n' in (r.functionScores['Endurance'].hypEnd01.diagnosticEvidence || {}), false);
});

console.log('\nTEST PARTIE 13 — cas causalité spécifique de la mission');
test('Réactivité HYP=absente (aucune donnée) : ne peut plus produire une narration "déficit de Réactivité" via priorities/causalSteps', () => {
  var td = { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Réactivité'].status, null);
  assert.strictEqual(r.priorities.some(function (p) { return p.fonction === 'Réactivité'; }), false, 'Réactivité ne doit plus apparaître dans priorities sans preuve HYP réelle');
});
test('Force + Puissance : aucune narration "Force entraîne Puissance" générée automatiquement (buildMultiQualityNarrative)', () => {
  var n = buildMultiQualityNarrative([{ fonction: 'Force', status: 'rouge', contributeurPrincipal: null }, { fonction: 'Puissance', status: 'rouge', contributeurPrincipal: null }]);
  assert.strictEqual(n.consequences.indexOf('entraîne'), -1);
  assert.ok(n.consequences.indexOf('hypothèse explicative') !== -1, 'relation Force->Puissance documentée -> doit être formulée en hypothèse explicative, jamais en cause');
});
test('Relation HYP documentée (Force -> Stabilisation) -> "hypothèse explicative", jamais "cause"/"entraîne"', () => {
  var n = buildMultiQualityNarrative([{ fonction: 'Force', status: 'rouge', contributeurPrincipal: null }, { fonction: 'Stabilisation', status: 'rouge', contributeurPrincipal: null }]);
  assert.strictEqual(n.consequences.indexOf('entraîne'), -1);
  assert.ok(n.consequences.indexOf('hypothèse explicative') !== -1);
  assert.ok(n.consequences.indexOf('sans en établir la cause') !== -1);
});
test('Aucune relation HYP documentée (Puissance + Réactivité) -> "déficits concordants" uniquement, aucun lien explicatif inventé', () => {
  var n = buildMultiQualityNarrative([{ fonction: 'Puissance', status: 'rouge', contributeurPrincipal: null }, { fonction: 'Réactivité', status: 'rouge', contributeurPrincipal: null }]);
  assert.strictEqual(n.consequences.indexOf('entraîne'), -1);
  assert.strictEqual(n.consequences.indexOf('hypothèse explicative'), -1);
  assert.ok(n.consequences.indexOf('concordant') !== -1);
});
test('Une seule qualité déficitaire -> simple constat, aucune narration inter-qualités', () => {
  var n = buildMultiQualityNarrative([{ fonction: 'Force', status: 'rouge', contributeurPrincipal: null }]);
  assert.strictEqual(n.causalSteps.length, 2); // Déficit de Force + Impact (jamais de 2e qualité)
});
test('Aucune qualité déficitaire -> narration entièrement vide (null), aucun crash', () => {
  var n = buildMultiQualityNarrative([]);
  assert.strictEqual(n.conclusion, null);
  assert.strictEqual(n.consequences, null);
  assert.deepStrictEqual(n.causalSteps, []);
});
test('3e priorité éventuelle : jamais chaînée causalement, "Déficit concordant" uniquement, jamais "Répercussion sur"', () => {
  var n = buildMultiQualityNarrative([
    { fonction: 'Force', status: 'rouge', contributeurPrincipal: null },
    { fonction: 'Puissance', status: 'rouge', contributeurPrincipal: null },
    { fonction: 'Explosivité', status: 'rouge', contributeurPrincipal: null }
  ]);
  var labels = n.causalSteps.map(function (s) { return s.label; });
  assert.ok(labels.some(function (l) { return l.indexOf('Déficit concordant de explosivité') !== -1; }));
  assert.strictEqual(labels.some(function (l) { return l.indexOf('Répercussion') !== -1; }), false);
});

console.log('\nTEST 14 (non-régression) — testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores/priorities restent produits normalement');
test('Structure complète de computeMoteur inchangée par la normalisation', () => {
  var r = computeMoteur({ cmj: { active: true, trials: { peak_power: [10] } } }, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
  assert.ok(Array.isArray(r.priorities));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

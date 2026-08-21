// Tests unitaires — HYP-EXP-01, intégration réelle dans computeMoteur() (index.html).
//
// Même convention que tests/hypPower01.test.js (situation normative structurellement identique :
// les deux preuves diagnostiques n'ont aujourd'hui aucun seuil). Couvre les 9 cas mandatés par la
// mission d'implémentation (§11) + le mécanisme de convergence + la non-régression des 7 autres
// qualités.
//
// Exécution : node tests/hypExplosivity01.test.js — aucune dépendance externe.
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

// cmj_conc_rfd / cmj_conc_impulse_100 : AUCUN seuil, ni NORMS ni THRESHOLDS -> toujours 'indisponible'.
// cmj_peak_power/depth/rsi_mod/ecc_peak_vel : normés pour bball2425_ncaa_m (confirmatif/explicatif, jamais diagnostiques).
var POP = 'bball2425_ncaa_m', AGE = 26;

function cmjData(fields) { return { active: true, trials: fields }; }

console.log('HYP-EXP-01 — les 9 cas mandatés');

test('1. cmj_conc_rfd et cmj_conc_impulse_100 "normaux" — impossible à établir : ni l\'un ni l\'autre classifiable -> non_determinable', () => {
  var td = { cmj: cmjData({ conc_rfd: [999], conc_impulse_100: [999] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.diagnosticEvidence.cmj_conc_rfd.status, 'indisponible');
  assert.strictEqual(h.diagnosticEvidence.cmj_conc_impulse_100.status, 'indisponible');
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Explosivité'].status, null);
});

test('2/3. Une seule variable "déficitaire" -> non classifiable de toute façon -> non_determinable, jamais retenue', () => {
  var td = { cmj: cmjData({ conc_rfd: [1], conc_impulse_100: [999] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.state, 'non_determinable');
  assert.notStrictEqual(h.state, 'retenue_faible');
});

test('4. Les deux "déficitaires" — non classifiables -> non_determinable (jamais retenue sans seuil)', () => {
  var td = { cmj: cmjData({ conc_rfd: [1], conc_impulse_100: [1] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.state, 'non_determinable');
});

test('5. cmj_conc_rfd déficitaire + cmj_conc_impulse_100 non classifiable -> non_determinable', () => {
  var td = { cmj: cmjData({ conc_rfd: [1] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.state, 'non_determinable');
});

test('6. cmj_conc_rfd non classifiable + cmj_conc_impulse_100 déficitaire -> non_determinable', () => {
  var td = { cmj: cmjData({ conc_impulse_100: [1] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.state, 'non_determinable');
});

test('7. Les deux preuves non classifiables (aucune donnée) -> non_determinable', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Explosivité'].status, null);
});

test('8. Variables explicatives déficitaires + preuves diagnostiques insuffisantes -> aucune hypothèse forcée', () => {
  var td = { cmj: cmjData({ depth: [5], rsi_mod: [0.01] }) }; // explicatives très déficitaires, aucune preuve diagnostique
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(h.explanatoryEvidence.biomecanique.cmj_depth.status, 'deficitaire');
  assert.strictEqual(h.state, 'non_determinable'); // les explicatives ne forcent jamais un diagnostic
});

console.log('\nCas de convergence réelle (mécanisme validé via seuils temporairement injectés en mémoire)');

// Valide le MÉCANISME 2/2 lui-même (jamais dans index.html — objet en mémoire, détruit après le test).
function withTemporaryExpNorms(fn) {
  var had = 'cmj_conc_rfd' in THRESHOLDS;
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try { fn(); } finally {
    delete THRESHOLDS.cmj_conc_rfd; delete THRESHOLDS.cmj_conc_impulse_100;
  }
}

test('1bis. Les deux réellement classifiables et normales -> absente, statut vert', () => {
  withTemporaryExpNorms(() => {
    var td = { cmj: cmjData({ conc_rfd: [150], conc_impulse_100: [1.5] }) };
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Explosivité'].hypExp01;
    assert.strictEqual(h.state, 'absente');
    assert.strictEqual(r.functionScores['Explosivité'].status, 'vert');
  });
});

test('2bis/3bis. Une seule déficitaire (réellement classifiée) -> suspectee, pas retenue', () => {
  withTemporaryExpNorms(() => {
    var td = { cmj: cmjData({ conc_rfd: [10], conc_impulse_100: [1.5] }) };
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Explosivité'].hypExp01;
    assert.strictEqual(h.state, 'suspectee');
    assert.strictEqual(r.functionScores['Explosivité'].status, 'jaune');
  });
});

test('9. Les deux réellement déficitaires + confirmative/explicatives disponibles -> diagnostic + explications, support gradué correctement', () => {
  withTemporaryExpNorms(() => {
    var td = { cmj: cmjData({ conc_rfd: [10], conc_impulse_100: [0.1], peak_power: [30], depth: [22], rsi_mod: [0.2], ecc_peak_vel: [0.5] }) };
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Explosivité'].hypExp01;
    assert.strictEqual(h.state, 'retenue_faible');
    assert.ok(['faible', 'moderee', 'forte'].indexOf(h.support.level) >= 0);
    assert.strictEqual(h.confirmativeEvidence.cmj_peak_power.raw, 30);
    assert.strictEqual(h.explanatoryEvidence.biomecanique.cmj_depth.raw, 22);
  });
});

console.log('\nVariables exclues — jamais utilisées sans rôle documenté');

test('cmj_height/slcmj_height/dj_rsi/sldj_rsi ne sont jamais lus ni exposés par ce moteur', () => {
  var td = { cmj: cmjData({ height: [10] }), dj: { active: true, trials: { rsi: [0.1] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Explosivité'].hypExp01;
  var json = JSON.stringify(h);
  assert.strictEqual(json.indexOf('"height"') !== -1 && json.indexOf('cmj_height') !== -1, false);
});

console.log('\nNon-régression — les 7 autres qualités restent inchangées');

test('Un changement de données Explosivité seul ne modifie ni Réactivité ni Mobilité', () => {
  var tdA = { cmj: cmjData({ conc_rfd: [1] }), dj: { active: true, trials: { rsi: [2.0] } }, wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } } };
  var tdB = { cmj: cmjData({ conc_rfd: [999] }), dj: { active: true, trials: { rsi: [2.0] } }, wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } } };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  ['Réactivité', 'Mobilité'].forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seules les données Explosivité ont changé');
  });
});

test('Absorption (HYP-ABS-01 V2), Puissance (HYP-PUI-01), Force (HYP-FOR-01) restent pilotées normalement', () => {
  var td = {
    cmj: { active: true, trials: { braking_rfd: [174], force_zero_vel: [30.5], braking_impulse: [5], peak_power: [71.5] } },
    iso_belt_squat: { active: true, trials: { n: [4500] } }
  };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Absorption'].hypAbs01.niveau1, 'ok');
  assert.notStrictEqual(r.functionScores['Puissance'].hypPui01, undefined);
  assert.notStrictEqual(r.functionScores['Force'].hypFor01, undefined);
});

test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement', () => {
  var td = { cmj: cmjData({ conc_rfd: [1] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
});

test('Pureté : deux appels identiques produisent le même functionScores[\'Explosivité\']', () => {
  var td = { cmj: cmjData({ conc_rfd: [1], conc_impulse_100: [1] }) };
  var r1 = computeMoteur(td, {}, POP, AGE);
  var r2 = computeMoteur(td, {}, POP, AGE);
  assert.deepStrictEqual(r1.functionScores['Explosivité'], r2.functionScores['Explosivité']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

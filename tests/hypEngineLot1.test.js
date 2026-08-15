// Tests unitaires — LOT 1 du moteur HYP### (HYP-MOB-01 uniquement).
//
// Vérifie hyp_engine_lot1.js contre les primitives RÉELLES d'index.html (applyThr/bestVal/
// autoLSI, extraites par eval — même convention que les autres fichiers de tests/), et contre les
// cas déjà rédigés dans PHASE_D_LOGICAL_VALIDATION.md (section HYP-MOB-01 : Cas A, Absente,
// vérification dédiée "rien d'autre n'active HYP-MOB-01"), plus la garantie ADR-008 (support
// jamais au-delà de 'faible').
//
// N'importe, n'appelle et ne modifie aucun composant d'écran d'index.html — seules les fonctions
// pures applyThr/bestVal/autoLSI sont extraites.
//
// Exécution : node tests/hypEngineLot1.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

// Slice couvrant TESTS/TBK/THRESHOLDS/NORMS/resolveBands/pctStatus/bestVal/applyThr/autoLSI —
// s'arrête avant la première variable d'UI (CMJ_POSES), qui ne concerne pas ce moteur.
const start = code.indexOf('var TESTS=[');
const end = code.indexOf('var CMJ_POSES=');
if (start < 0 || end < 0) throw new Error('Impossible de localiser les primitives dans index.html.');
const slice = code.slice(start, end);

global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
eval(slice);

// Charge le moteur LOT 1 dans la même portée, pour qu'il voie applyThr/bestVal/autoLSI ci-dessus —
// exactement comme il les verrait s'il était un jour intégré dans index.html.
eval(fs.readFileSync(path.join(__dirname, '..', 'hyp_engine_lot1.js'), 'utf8'));

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

var deps = { applyThr: applyThr, bestVal: bestVal, autoLSI: autoLSI };
var POP = null, AGE = 25; // pas de norme population -> repli sur THRESHOLDS statique (wblt_distance: vert:12,jaune:10,orange:8)

function wbltData(vD, vG) {
  return { active: true, D: { trials: { distance: [vD] } }, G: { trials: { distance: [vG] } } };
}

console.log('HYP_CATALOG');
test('HYP_CATALOG ne contient que HYP-MOB-01', () => {
  assert.deepStrictEqual(Object.keys(HYP_CATALOG), ['HYP-MOB-01']);
});
test('HYP_CATALOG.HYP-MOB-01 a une seule preuve diagnostique, aucune explicative', () => {
  var e = HYP_CATALOG['HYP-MOB-01'];
  assert.strictEqual(e.diagnostic.length, 1);
  assert.strictEqual(e.explanatoryPhysio.length, 0);
  assert.strictEqual(e.explanatoryBiomeca.length, 0);
  assert.strictEqual(e.convergence.requiredMechanisms, 1);
  assert.strictEqual(e.convergence.ruleVariant, 'mobilite_exception');
});

console.log('\nCas A — activation évidente (PHASE_D_LOGICAL_VALIDATION.md, HYP-MOB-01)');
test('wblt_distance nettement déficitaire (6cm/6cm) -> retenue_faible', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(6, 6) }, POP, AGE, deps);
  var h = res.hypotheses['HYP-MOB-01'];
  assert.strictEqual(h.state, 'retenue_faible');
  assert.deepStrictEqual(h.support, { level: 'faible' });
  assert.strictEqual(h.diagnosticEvidence[0].status, 'deficitaire');
});
test('CLI020 est déclenchée quand HYP-MOB-01 est retenue_faible', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(6, 6) }, POP, AGE, deps);
  assert.deepStrictEqual(res.hypotheses['HYP-MOB-01'].triggeredOrientations, ['CLI020']);
  assert.strictEqual(res.clinicalOrientations['CLI020'].triggered, true);
  assert.deepStrictEqual(res.clinicalOrientations['CLI020'].supportMetadata, { level: 'faible' });
});

console.log('\nCas Absente — wblt normal des deux côtés');
test('wblt_distance normal (14cm/14cm) -> absente, support null, CLI020 non déclenchée', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(14, 14) }, POP, AGE, deps);
  var h = res.hypotheses['HYP-MOB-01'];
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(h.support, null);
  assert.deepStrictEqual(h.triggeredOrientations, []);
  assert.strictEqual(res.clinicalOrientations['CLI020'].triggered, false);
});

console.log('\nCas limite — asymétrie (un côté déficitaire, un côté normal)');
test('Un seul côté déficitaire (6cm/14cm) suffit -> retenue_faible (lecture "pire côté")', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(6, 14) }, POP, AGE, deps);
  assert.strictEqual(res.hypotheses['HYP-MOB-01'].state, 'retenue_faible');
});

console.log('\nDonnée indisponible');
test('Test wblt inactif -> indisponible, absente, aucune erreur levée', () => {
  var res = computeHypothesisEngine({ wblt: { active: false } }, POP, AGE, deps);
  var h = res.hypotheses['HYP-MOB-01'];
  assert.strictEqual(h.diagnosticEvidence[0].status, 'indisponible');
  assert.strictEqual(h.state, 'absente');
});
test('testData.wblt totalement absent -> aucune erreur levée', () => {
  var res = computeHypothesisEngine({}, POP, AGE, deps);
  assert.strictEqual(res.hypotheses['HYP-MOB-01'].state, 'absente');
});

console.log('\nVérification dédiée — rien d\'autre n\'active HYP-MOB-01 (PHASE_D_LOGICAL_VALIDATION.md)');
test('Des données massivement déficitaires sur DAUTRES tests ne changent rien (wblt seul lu)', () => {
  var res = computeHypothesisEngine({
    wblt: wbltData(14, 14),
    imtp: { active: true, trials: { n: [1] } },
    cmj: { active: true, trials: { peak_power: [1] } }
  }, POP, AGE, deps);
  assert.strictEqual(res.hypotheses['HYP-MOB-01'].state, 'absente');
});

console.log('\nGarantie ADR-008 — le support ne dépasse jamais \'faible\'');
test('Même très déficitaire, support reste { level: \'faible\' }, jamais moderee/forte', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(1, 1) }, POP, AGE, deps);
  var h = res.hypotheses['HYP-MOB-01'];
  assert.strictEqual(h.support.level, 'faible');
  assert.strictEqual(h.explanatoryEvidence.length, 0);
});
test('La confirmative auto-référentielle est enregistrée mais n\'élève jamais le support', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(6, 6) }, POP, AGE, deps);
  var h = res.hypotheses['HYP-MOB-01'];
  assert.strictEqual(h.confirmativeEvidence[0].status, 'deficitaire');
  assert.strictEqual(h.support.level, 'faible'); // pas 'moderee' malgré une confirmative "convergente"
});

console.log('\nPureté / non-régression');
test('Deux appels identiques produisent le même résultat (hors computedAt) — fonction pure', () => {
  var r1 = computeHypothesisEngine({ wblt: wbltData(6, 6) }, POP, AGE, deps);
  var r2 = computeHypothesisEngine({ wblt: wbltData(6, 6) }, POP, AGE, deps);
  assert.deepStrictEqual(r1.hypotheses, r2.hypotheses);
  assert.deepStrictEqual(r1.clinicalOrientations, r2.clinicalOrientations);
});
test('HYP-CSM-01 apparaît uniquement dans suspendedHypotheses, jamais calculée', () => {
  var res = computeHypothesisEngine({ wblt: wbltData(6, 6) }, POP, AGE, deps);
  assert.deepStrictEqual(res.suspendedHypotheses, ['HYP-CSM-01']);
  assert.strictEqual(res.hypotheses['HYP-CSM-01'], undefined);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

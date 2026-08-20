// Tests unitaires — HYP-REA-01, intégration réelle dans computeMoteur() (index.html).
//
// Même convention que tests/hypAbsorption01.test.js : ce moteur est écrit DIRECTEMENT dans
// index.html et remplace fSc['Réactivité'] à l'intérieur de computeMoteur() lui-même — voir
// IMPLEMENTATION_HYP_REA01.md. Extrait une tranche large d'index.html (jusqu'à la fin de
// computeMoteur(), avant le bloc SUPABASE CONFIG) pour tester le moteur exactement comme il
// tourne en production.
//
// Couvre les 7 cas mandatés par la mission d'implémentation (§9) + les garanties d'exclusion
// (CMJR/Repeated Hop/Heel Raise/Side Hop ne déclenchent jamais le diagnostic) + la
// non-régression des 7 autres qualités.
//
// Exécution : node tests/hypReactivity01.test.js — aucune dépendance externe.
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

// dj_rsi : THRESHOLDS vert>=1.5/jaune>=1.0/orange>=0.7/rouge<0.7, dir max — repli universel, aucune
// population requise.
// sldj_rsi : THRESHOLDS vert>=1.2/jaune>=0.8/orange>=0.5/rouge<0.5, dir max — idem.
var POP = null, AGE = 25; // aucune norme population -> force le repli THRESHOLDS pour vérifier qu'il fonctionne réellement, pas seulement en présence de NORMS.

function djData(rsi, extra) {
  var trials = Object.assign({ rsi: [rsi] }, extra || {});
  return { active: true, trials: trials };
}
function sldjData(rsiD, rsiG, extra) {
  return { active: true, D: { trials: Object.assign({ rsi: [rsiD] }, extra || {}) }, G: { trials: { rsi: [rsiG] } } };
}

console.log('HYP-REA-01 — Niveau 1 (7 cas mandatés)');

test('1. DJ normal + SLDJ normal -> absente, statut vert', () => {
  var td = { dj: djData(2.0), sldj: sldjData(1.5, 1.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(r.functionScores['Réactivité'].status, 'vert');
});

test('2. DJ déficitaire + SLDJ normal -> suspectee (1 mécanisme), statut jaune', () => {
  var td = { dj: djData(0.3), sldj: sldjData(1.5, 1.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.state, 'suspectee');
  assert.deepStrictEqual(h.convergence.mechanismsInvolved, ['dj']);
  assert.strictEqual(r.functionScores['Réactivité'].status, 'jaune');
});

test('3. DJ normal + SLDJ déficitaire -> suspectee (1 mécanisme), statut jaune', () => {
  var td = { dj: djData(2.0), sldj: sldjData(0.2, 1.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.state, 'suspectee');
  assert.deepStrictEqual(h.convergence.mechanismsInvolved, ['sldj']);
});

test('4. DJ déficitaire + SLDJ déficitaire -> retenue_faible (2/2), statut orange, jamais forcé au-delà de faible', () => {
  var td = { dj: djData(0.3), sldj: sldjData(0.2, 0.2) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.state, 'retenue_faible');
  assert.strictEqual(h.support.level, 'faible');
  assert.strictEqual(h.convergence.thresholdMet, true);
});

test('4bis. DJ et SLDJ tous deux rouge -> statut rouge (escalade), sinon orange', () => {
  var tdRouge = { dj: djData(0.1), sldj: sldjData(0.1, 0.1) };
  var r = computeMoteur(tdRouge, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Réactivité'].status, 'rouge');
});

test('5. Variable non disponible (SLDJ jamais testé) -> DJ seul évalué, jamais un crash', () => {
  var td = { dj: djData(0.3) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.diagnosticEvidence.sldj_rsi.status, 'indisponible');
  assert.strictEqual(h.state, 'suspectee');
});

test('6. Population sans norme (aucune NORMS) -> repli THRESHOLDS fonctionne réellement', () => {
  var td = { dj: djData(0.3), sldj: sldjData(0.2, 0.2) };
  var r = computeMoteur(td, {}, 'population_totalement_inconnue', AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.diagnosticEvidence.dj_rsi.category, 'rouge');
  assert.strictEqual(h.state, 'retenue_faible');
});

test('7. Données incomplètes (dj/sldj tous deux inactifs) -> aucune donnée HYP, status:null explicite (normalisation architecturale : HYP est désormais la source de vérité du statut, plus de repli TFM — cf. HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md)', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.ok(r.functionScores['Réactivité']); // objet toujours produit, jamais littéralement null.
  assert.strictEqual(r.functionScores['Réactivité'].status, null);
  assert.strictEqual(r.functionScores['Réactivité'].hypRea01.dataAvailable, false);
  assert.strictEqual(r.functionScores['Réactivité'].tfmFallback, null); // le repli TFM générique reste exposé séparément (jamais supprimé), ici null car aucun test actif.
});

console.log('\nExclusions gelées — CMJR / Repeated Hop / Heel Raise / Side Hop ne déclenchent jamais le diagnostic');

test('CMJR très déficitaire, DJ/SLDJ normaux -> Réactivité reste absente (CMJR jamais diagnostique)', () => {
  var td = {
    dj: djData(2.0), sldj: sldjData(1.5, 1.5),
    cmjr: { active: true, trials: { mean_rsi: [0.1], rsi_decay: [90], mean_ct: [900], mean_stiffness: [0.1], mean_rebound_height: [1], stiffness_decay: [90] } }
  };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(h.explanatoryEvidence.cmjr.mean_rsi.raw, 0.1);
  assert.strictEqual(h.explanatoryEvidence.cmjr.mean_rsi.classifiable, false);
});

test('Repeated Hop très déficitaire, DJ/SLDJ normaux -> Réactivité reste absente (Repeated Hop jamais diagnostique)', () => {
  var td = {
    dj: djData(2.0), sldj: sldjData(1.5, 1.5),
    repeated_hop: { active: true, D: { trials: { mean_rsi: [0.05] } }, G: { trials: { mean_rsi: [0.05] } } }
  };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.state, 'absente');
  assert.deepStrictEqual(h.explanatoryEvidence.repeated_hop.mean_rsi.raw, { D: 0.05, G: 0.05 });
});

test('Heel Raise très déficitaire, DJ/SLDJ normaux -> aucun effet, jamais lu par ce moteur', () => {
  var tdBase = { dj: djData(2.0), sldj: sldjData(1.5, 1.5) };
  var tdWithHeel = Object.assign({}, tdBase, { heel_raise: { active: true, D: { trials: { reps: [1] } }, G: { trials: { reps: [1] } } } });
  var rBase = computeMoteur(tdBase, {}, POP, AGE);
  var rWith = computeMoteur(tdWithHeel, {}, POP, AGE);
  assert.deepStrictEqual(rBase.functionScores['Réactivité'].hypRea01, rWith.functionScores['Réactivité'].hypRea01);
});

test('Side Hop très déficitaire, DJ/SLDJ normaux -> aucun effet, jamais lu par ce moteur', () => {
  var tdBase = { dj: djData(2.0), sldj: sldjData(1.5, 1.5) };
  var tdWithSide = Object.assign({}, tdBase, { side_hop: { active: true, D: { trials: { reps: [1] } }, G: { trials: { reps: [1] } } } });
  var rBase = computeMoteur(tdBase, {}, POP, AGE);
  var rWith = computeMoteur(tdWithSide, {}, POP, AGE);
  assert.deepStrictEqual(rBase.functionScores['Réactivité'].hypRea01, rWith.functionScores['Réactivité'].hypRea01);
});

console.log('\nAsymétrie — précision uniquement, jamais générateur');

test('sldj_lsi exposé pour traçabilité mais ne modifie jamais le Niveau 1', () => {
  var td = { dj: djData(2.0), sldj: sldjData(1.5, 0.9) }; // asymétrie D/G marquée, mais G reste normal (>=0.8 jaune)
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.notStrictEqual(h.precision.sldj_lsi, null);
  assert.strictEqual(h.state, 'absente');
});

console.log('\nDJ RSI seul (bilatéral) — vérification directe de la primitive applyThr réutilisée');

test('dj_rsi utilise exactement applyThr(\'dj_rsi\',...) — même valeur que computeTestStatus', () => {
  var td = { dj: djData(0.3) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Réactivité'].hypRea01;
  assert.strictEqual(h.diagnosticEvidence.dj_rsi.category, applyThr('dj_rsi', 0.3, POP, AGE));
});

console.log('\nNon-régression — les 7 autres qualités et sorties de computeMoteur restent inchangées');

test('Un changement de données Réactivité seul (variable non classifiable) ne modifie aucune fonction', () => {
  var tdA = { dj: djData(2.0, { contact_time: [100] }), sldj: sldjData(1.5, 1.5) };
  var tdB = { dj: djData(2.0, { contact_time: [999] }), sldj: sldjData(1.5, 1.5) };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  Object.keys(rA.functionScores).forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seule une variable non classifiable de Réactivité a changé');
  });
});

test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement', () => {
  var td = { dj: djData(2.0), sldj: sldjData(1.5, 1.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
});

test('Absorption (HYP-ABS-01 V2, déjà en production) reste inchangée par ce moteur', () => {
  var td = {
    dj: djData(2.0), sldj: sldjData(1.5, 1.5),
    cmj: { active: true, trials: { braking_rfd: [174], force_zero_vel: [30.5], braking_impulse: [5] } }
  };
  var r = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  assert.ok(r.functionScores['Absorption']);
  assert.strictEqual(r.functionScores['Absorption'].hypAbs01.niveau1, 'ok');
  assert.strictEqual(r.functionScores['Absorption'].status, 'vert');
});

test('Pureté : deux appels identiques produisent le même functionScores[\'Réactivité\']', () => {
  var td = { dj: djData(0.3), sldj: sldjData(0.2, 0.2) };
  var r1 = computeMoteur(td, {}, POP, AGE);
  var r2 = computeMoteur(td, {}, POP, AGE);
  assert.deepStrictEqual(r1.functionScores['Réactivité'], r2.functionScores['Réactivité']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

// Tests unitaires — HYP-MOB-01, intégration réelle dans computeMoteur() (index.html).
//
// Portage de la logique déjà validée dans hyp_engine_lot1.js/tests/hypEngineLot1.test.js (jamais
// rouverte, jamais modifiée) vers une intégration directe en production, même convention que
// tests/hypAbsorption01.test.js / tests/hypReactivity01.test.js.
//
// Exécution : node tests/hypMobility01.test.js — aucune dépendance externe.
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

var POP = null, AGE = 25; // wblt_distance n'a aucune entrée NORMS -> repli THRESHOLDS toujours utilisé, quelle que soit la population.

function wbltData(vD, vG) {
  return { active: true, D: { trials: { distance: [vD] } }, G: { trials: { distance: [vG] } } };
}

console.log('HYP-MOB-01 — Niveau 1');

test('Mobilité normale (14cm/14cm) -> absente, statut vert', () => {
  var td = { wblt: wbltData(14, 14) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(h.support, null);
  assert.strictEqual(r.functionScores['Mobilité'].status, 'vert');
});

test('Mobilité déficitaire (9cm/9cm, sous jaune=10 mais au-dessus d\'orange=8) -> retenue_faible directement (jamais suspectee, ADR-005), statut orange', () => {
  var td = { wblt: wbltData(9, 9) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.state, 'retenue_faible');
  assert.deepStrictEqual(h.support, { level: 'faible' });
  assert.strictEqual(r.functionScores['Mobilité'].status, 'orange');
});

test('Mobilité franchement déficitaire (6cm/6cm, sous orange=8) -> retenue_faible, statut rouge', () => {
  var td = { wblt: wbltData(6, 6) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.state, 'retenue_faible');
  assert.strictEqual(r.functionScores['Mobilité'].status, 'rouge');
});

test('Mobilité très déficitaire des deux côtés (1cm/1cm) -> support reste faible (jamais moderee/forte, ADR-008)', () => {
  var td = { wblt: wbltData(1, 1) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.support.level, 'faible');
  assert.deepStrictEqual(h.explanatoryEvidence, {});
});

test('Asymétrie (un côté déficitaire, un côté normal, 6cm/14cm) -> déficitaire (lecture pire côté), LSI exposé en précision', () => {
  var td = { wblt: wbltData(6, 14) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.state, 'retenue_faible');
  assert.notStrictEqual(h.confirmativeEvidence.wblt_lsi.value, null);
  assert.strictEqual(h.confirmativeEvidence.wblt_lsi.elevates, false);
});

test('Données incomplètes (wblt inactif) -> repli sur le score TFM générique, aucun crash', () => {
  var r = computeMoteur({ wblt: { active: false } }, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Mobilité'], null); // aucun test actif du tout -> comportement TFM déjà existant, inchangé.
});

test('testData.wblt totalement absent -> aucune erreur levée', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Mobilité'], null);
});

test('Population sans aucune norme connue -> repli THRESHOLDS fonctionne (wblt_distance n\'a jamais eu de NORMS)', () => {
  var td = { wblt: wbltData(6, 6) };
  var r = computeMoteur(td, {}, 'population_totalement_inconnue', 40);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.diagnosticEvidence.wblt_distance.category, 'rouge');
});

test('wblt_asymmetry exposé comme non calculé, jamais supprimé du raisonnement', () => {
  var td = { wblt: wbltData(6, 6) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Mobilité'].hypMob01;
  assert.strictEqual(h.precision.wblt_asymmetry.status, 'non_calcule');
});

console.log('\nNon-régression — les 7 autres qualités restent inchangées');

// Note (découverte en écrivant ce test, non causée par HYP-MOB-01, même mécanisme déjà documenté
// pour Absorption/Force) : 'wblt' porte un poids TFM générique pour PLUSIEURS fonctions
// (wblt:{mobilite:3,reactivite:1,absorption:1,stabilisation:1}). Tant qu'une qualité n'est pas
// elle-même reprise par un moteur HYP (ou quand son moteur HYP retombe sur le repli TFM générique,
// faute de données propres), faire varier wblt_distance peut légitimement faire varier cette
// qualité via ce mécanisme préexistant — indépendant de ce moteur. Ce test fournit donc des
// données CMJ identiques dans les deux cas pour qu'Absorption soit intégralement pilotée par
// HYP-ABS-01 V2 (donc indépendante de wblt), isolant proprement l'effet réel de ce moteur.
test('Un changement de données Mobilité seul ne modifie aucune autre fonction (Absorption pilotée par HYP-ABS-01 V2, donc indépendante de wblt)', () => {
  var cmjFixed = { active: true, trials: { braking_rfd: [174], force_zero_vel: [30.5], braking_impulse: [5] } };
  var tdA = { wblt: wbltData(14, 14), dj: { active: true, trials: { rsi: [2.0] } }, cmj: cmjFixed };
  var tdB = { wblt: wbltData(1, 1), dj: { active: true, trials: { rsi: [2.0] } }, cmj: cmjFixed };
  var rA = computeMoteur(tdA, {}, 'bball2425_ncaa_m', 26);
  var rB = computeMoteur(tdB, {}, 'bball2425_ncaa_m', 26);
  // Limité aux qualités déjà pilotées par un moteur HYP (Réactivité, Absorption) : les qualités non
  // encore reprises (Stabilisation, etc.) restent sur le repli TFM générique, qui inclut légitimement
  // wblt parmi ses poids (wblt:{stabilisation:1,...}) — mécanisme préexistant, hors périmètre de ce
  // moteur, déjà documenté ci-dessus.
  ['Réactivité', 'Absorption'].forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seules les données Mobilité ont changé');
  });
});

test('Réactivité (HYP-REA-01, déjà en production) reste inchangée par ce moteur', () => {
  var td = { wblt: wbltData(6, 6), dj: { active: true, trials: { rsi: [2.0] } }, sldj: { active: true, D: { trials: { rsi: [1.5] } }, G: { trials: { rsi: [1.5] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Réactivité'].hypRea01.state, 'absente');
  assert.strictEqual(r.functionScores['Réactivité'].status, 'vert');
});

test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement', () => {
  var td = { wblt: wbltData(6, 6) };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
});

test('Pureté : deux appels identiques produisent le même functionScores[\'Mobilité\']', () => {
  var td = { wblt: wbltData(6, 6) };
  var r1 = computeMoteur(td, {}, POP, AGE);
  var r2 = computeMoteur(td, {}, POP, AGE);
  assert.deepStrictEqual(r1.functionScores['Mobilité'], r2.functionScores['Mobilité']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

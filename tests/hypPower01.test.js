// Tests unitaires — HYP-PUI-01, intégration réelle dans computeMoteur() (index.html).
//
// Même convention que tests/hypAbsorption01.test.js / hypReactivity01.test.js / hypMobility01.test.js.
// Couvre les 10 cas mandatés par la mission d'implémentation (§10) + les garanties d'exclusion
// (cmj_height ne devient jamais une deuxième preuve, aucune variable explicative ne crée le
// diagnostic seule) + la non-régression des 7 autres qualités.
//
// Point clé testé partout : ce moteur diverge délibérément d'Absorption/Réactivité/Mobilité —
// quand la convergence 2/2 n'est pas déterminable, fSc['Puissance'].status est explicitement
// `null`, jamais un repli sur l'ancien score TFM (mission : "mieux vaut NON DÉTERMINABLE qu'un
// diagnostic faux").
//
// Exécution : node tests/hypPower01.test.js — aucune dépendance externe.
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

// cmj_peak_power : NORMS large, ex. bball2425_ncaa_m: [47.1,53.7,57.8,63.1,71.5] (percentiles).
// slcmj_peak_power : AUCUN seuil, ni NORMS ni THRESHOLDS -> toujours 'indisponible'.
var POP = 'bball2425_ncaa_m', AGE = 26;

function cmjData(peakPower, height) {
  var trials = { peak_power: [peakPower] };
  if (height != null) trials.height = [height];
  return { active: true, trials: trials };
}
function slcmjData(vD, vG) {
  return { active: true, D: { trials: { peak_power: [vD] } }, G: { trials: { peak_power: [vG] } } };
}
function djData(propPower) {
  return { active: true, trials: { peak_prop_power: [propPower] } };
}

console.log('HYP-PUI-01 — les 10 cas mandatés');

test('1. CMJ normal + SLCMJ "normal" — impossible à établir : slcmj jamais classifiable -> non_determinable', () => {
  var td = { cmj: cmjData(71.5), slcmj: slcmjData(50, 50) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.diagnosticEvidence.slcmj_peak_power.status, 'indisponible');
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Puissance'].status, null);
});

test('2. CMJ déficitaire + SLCMJ non classifiable -> non_determinable (jamais "normale")', () => {
  var td = { cmj: cmjData(20), slcmj: slcmjData(50, 50) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.diagnosticEvidence.cmj_peak_power.status, 'deficitaire');
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Puissance'].status, null);
});

test('3. CMJ non testé + SLCMJ non classifiable -> non_determinable', () => {
  var td = { slcmj: slcmjData(50, 50) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.state, 'non_determinable');
});

test('4. Données complètement insuffisantes (aucun test actif) -> non_determinable, status null', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Puissance'].status, null);
});

test('5. CMJ déficitaire + substitution DJ tentée mais non classifiable -> reste non_determinable (jamais "normale" via un substitut inerte)', () => {
  var td = { cmj: cmjData(20), dj: djData(30) }; // slcmj absent -> substitution tentée -> dj_peak_prop_power lu mais non classifiable (aucun seuil)
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.substitution.candidates.dj_peak_prop_power.raw, 30); // bien lu...
  assert.strictEqual(h.substitution.candidates.dj_peak_prop_power.status, 'indisponible'); // ...mais jamais classifié (aucun seuil)
  assert.strictEqual(h.substitution.active, false); // aucun substitut classifiable -> jamais promu deuxième preuve
  assert.strictEqual(h.state, 'non_determinable');
});

test('6. CMJ déficitaire + cmj_height déficitaire -> cmj_height ne devient JAMAIS une deuxième preuve', () => {
  var td = { cmj: cmjData(20, 15) }; // height=15cm très bas
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.confirmativeEvidence.cmj_height.countsAsDiagnostic, false);
  assert.strictEqual(h.convergence.mechanismsInvolved.indexOf('cmj_height'), -1);
  assert.strictEqual(h.state, 'non_determinable'); // toujours bloqué par slcmj, cmj_height n'aide jamais à contourner
});

test('7. Variables explicatives (Capacité/Stratégie) déficitaires sans convergence 2/2 -> ne créent jamais HYP-PUI-01', () => {
  var td = {
    cmj: cmjData(71.5), // normal
    iso_belt_squat: { active: true, trials: { n: [1] } }, // très déficitaire
    imtp: { active: true, trials: { rfd100: [1], ttpf: [999] } }
  };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.explanatoryEvidence.capacite.force.iso_belt_squat_n.raw, 1);
  assert.strictEqual(h.state, 'non_determinable'); // capacité déficitaire n'influence jamais le Niveau 1
});

test('8. Données complètement insuffisantes -> non_determinable (doublon explicite du cas 4, formulation mission)', () => {
  var r = computeMoteur({ cmj: { active: false } }, {}, POP, AGE);
  var h = r.functionScores['Puissance'].hypPui01;
  assert.strictEqual(h.state, 'non_determinable');
});

console.log('\nCas de convergence réelle (population et données permettant une classification complète des DEUX preuves — via un substitut classifiable simulé pour valider le mécanisme)');

// Ces cas valident le MÉCANISME de convergence lui-même (2/2, 1/2, 0/2) en simulant une norme
// temporaire injectée directement dans NORMS pour la preuve de substitution — AUCUNE norme n'est
// ajoutée dans index.html, ceci reste un objet en mémoire créé et détruit par ce test, pour prouver
// que le moteur est réellement prêt à exploiter une deuxième preuve dès qu'elle existera.
function withTemporaryDjNorm(fn) {
  var had = NORMS[POP] && ('dj_peak_prop_power' in NORMS[POP]);
  var prev = had ? NORMS[POP].dj_peak_prop_power : undefined;
  NORMS[POP] = NORMS[POP] || {};
  NORMS[POP].dj_peak_prop_power = [10, 20, 30, 40, 50];
  try { fn(); } finally {
    if (had) NORMS[POP].dj_peak_prop_power = prev; else delete NORMS[POP].dj_peak_prop_power;
  }
}

test('Convergence 2/2 réelle (via substitut temporairement normé) -> retenue_faible, jamais forcé au-delà de faible', () => {
  withTemporaryDjNorm(() => {
    var td = { cmj: cmjData(20), dj: djData(5) }; // les deux nettement déficitaires
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Puissance'].hypPui01;
    assert.strictEqual(h.state, 'retenue_faible');
    assert.strictEqual(h.support.level, 'faible');
    assert.strictEqual(r.functionScores['Puissance'].status === 'orange' || r.functionScores['Puissance'].status === 'rouge', true);
  });
});

test('1 preuve sur 2 déficitaire (via substitut temporairement normé) -> suspectee, jamais retenue', () => {
  withTemporaryDjNorm(() => {
    var td = { cmj: cmjData(71.5), dj: djData(5) }; // cmj normal, substitut déficitaire
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Puissance'].hypPui01;
    assert.strictEqual(h.state, 'suspectee');
    assert.strictEqual(r.functionScores['Puissance'].status, 'jaune');
  });
});

test('0 preuve sur 2 déficitaire (via substitut temporairement normé) -> absente, statut vert', () => {
  withTemporaryDjNorm(() => {
    var td = { cmj: cmjData(71.5), dj: djData(50) };
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Puissance'].hypPui01;
    assert.strictEqual(h.state, 'absente');
    assert.strictEqual(r.functionScores['Puissance'].status, 'vert');
  });
});

console.log('\nNon-régression — les 7 autres qualités restent inchangées');

// Note (même mécanisme déjà documenté pour Absorption/Réactivité/Mobilité, non causé par ce
// moteur) : cmj_peak_power appartient au test 'cmj', dont le statut agrégé (computeTestStatus)
// alimente encore, via le repli TFM générique, plusieurs qualités non encore pilotées par HYP
// (Force, Explosivité, Endurance, Stabilisation — cmj:{force:1,explosivite:3,...}), ET le repli
// TFM générique d'Absorption elle-même quand son Core HYP est non déterminable (aucune donnée
// braking_rfd/force_zero_vel fournie ici). Ce test isole donc Réactivité et Mobilité, seules
// qualités dont l'indépendance vis-à-vis de cmj_peak_power est garantie ici (ni l'une ni l'autre
// ne lit jamais 'cmj').
test('Un changement de données Puissance seul ne modifie pas Réactivité ni Mobilité', () => {
  var tdA = { cmj: cmjData(20), dj: { active: true, trials: { rsi: [2.0] } } };
  var tdB = { cmj: cmjData(71.5), dj: { active: true, trials: { rsi: [2.0] } } };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  ['Réactivité', 'Mobilité'].forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seules les données Puissance ont changé');
  });
});

test('Réactivité (HYP-REA-01) et Mobilité (HYP-MOB-01), déjà en production, restent pilotées normalement', () => {
  var td = { cmj: cmjData(20), dj: { active: true, trials: { rsi: [2.0] } }, wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Réactivité'].hypRea01.state, 'absente');
  assert.strictEqual(r.functionScores['Mobilité'].hypMob01.state, 'absente');
});

test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement', () => {
  var td = { cmj: cmjData(20) };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
});

test('Pureté : deux appels identiques produisent le même functionScores[\'Puissance\']', () => {
  var td = { cmj: cmjData(20), slcmj: slcmjData(50, 50) };
  var r1 = computeMoteur(td, {}, POP, AGE);
  var r2 = computeMoteur(td, {}, POP, AGE);
  assert.deepStrictEqual(r1.functionScores['Puissance'], r2.functionScores['Puissance']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

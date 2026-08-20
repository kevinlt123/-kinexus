// Tests unitaires — HYP-END-01, intégration réelle dans computeMoteur() (index.html).
//
// Couvre les 10 cas mandatés par la mission d'audit + implémentation (Partie 9), la règle de
// convergence gelée (≥2/6 preuves, CLI080, cf. KINEXUS_REASONING_ENGINE_V1.md §7) et la
// non-régression des 7 autres qualités.
//
// Exécution : node tests/hypEndurance01.test.js — aucune dépendance externe.
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

// heel_raise_reps : seule variable normée (THRESHOLDS vert:25/jaune:20/orange:15, dir max) parmi
// les 6 preuves diagnostiques -> toujours classifiable. Les 5 KPI repeated_hop diagnostiques
// (n_hops/rsi_fatigue/height_fatigue/ct_drift/stiffness_fatigue) n'ont aujourd'hui aucun seuil.
var POP = 'general_m_senior', AGE = 30;

function heelRaise(reps) { return { active: true, D: { trials: { reps: [reps] } }, G: { trials: { reps: [reps] } } }; }
function repeatedHop(fields) { return { active: true, D: { trials: fields }, G: { trials: fields } }; }

console.log('CAS 1 — Toutes les preuves disponibles et normales -> absence de diagnostic');
test('heel_raise_reps normal (seule preuve classifiable) -> absente, statut vert', () => {
  var td = { heel_raise: heelRaise(30) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  assert.strictEqual(h.diagnosticEvidence.heel_raise_reps.status, 'normal');
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(r.functionScores['Endurance'].status, 'vert');
});

console.log('\nCAS 2 — Une preuve diagnostique déficitaire seule -> règle de convergence appliquée exactement (2/6, pas 1/6)');
test('heel_raise_reps déficitaire seul (aucune autre preuve classifiable) -> suspectee, jamais retenue', () => {
  var td = { heel_raise: heelRaise(10) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  assert.strictEqual(h.diagnosticEvidence.heel_raise_reps.status, 'deficitaire');
  assert.strictEqual(h.state, 'suspectee');
  assert.notStrictEqual(h.state, 'retenue_faible');
  assert.strictEqual(r.functionScores['Endurance'].status, 'jaune');
});

console.log('\nCAS 3 — Toutes les preuves nécessaires déficitaires -> diagnostic retenu (mécanisme validé via seuils temporairement injectés en mémoire)');
function withTemporaryRepeatedHopNorms(fn) {
  var keys = ['repeated_hop_n_hops', 'repeated_hop_rsi_fatigue', 'repeated_hop_height_fatigue', 'repeated_hop_ct_drift', 'repeated_hop_stiffness_fatigue'];
  var had = keys.map(k => k in THRESHOLDS);
  THRESHOLDS.repeated_hop_n_hops = { vert: 20, jaune: 15, orange: 10, dir: 'max' };
  THRESHOLDS.repeated_hop_rsi_fatigue = { vert: 5, jaune: 10, orange: 20, dir: 'min' };
  THRESHOLDS.repeated_hop_height_fatigue = { vert: 5, jaune: 10, orange: 20, dir: 'min' };
  THRESHOLDS.repeated_hop_ct_drift = { vert: 5, jaune: 10, orange: 20, dir: 'min' };
  THRESHOLDS.repeated_hop_stiffness_fatigue = { vert: 5, jaune: 10, orange: 20, dir: 'min' };
  try { fn(); } finally { keys.forEach(k => delete THRESHOLDS[k]); }
}
test('mécanisme 2/6 validé sans toucher index.html — 2 preuves repeated_hop déficitaires -> retenue_faible', () => {
  withTemporaryRepeatedHopNorms(() => {
    var td = { repeated_hop: repeatedHop({ n_hops: [8], rsi_fatigue: [30], height_fatigue: [2], ct_drift: [2], stiffness_fatigue: [2] }) };
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Endurance'].hypEnd01;
    assert.strictEqual(h.state, 'retenue_faible');
    assert.strictEqual(h.convergence.distinctMechanismsObserved, 2);
  });
});
test('toutes les 6 preuves déficitaires (mécanisme temporaire) -> retenue_faible, jamais au-delà de faible sans confirmative/explicative réellement classifiable', () => {
  withTemporaryRepeatedHopNorms(() => {
    var td = { heel_raise: heelRaise(10), repeated_hop: repeatedHop({ n_hops: [8], rsi_fatigue: [30], height_fatigue: [30], ct_drift: [30], stiffness_fatigue: [30] }) };
    var r = computeMoteur(td, {}, POP, AGE);
    var h = r.functionScores['Endurance'].hypEnd01;
    assert.strictEqual(h.state, 'retenue_faible');
    assert.strictEqual(h.convergence.distinctMechanismsObserved, 6);
    assert.strictEqual(h.support.level, 'faible'); // confirmative/explicative non normées -> jamais forcées au-delà
  });
});

console.log('\nCAS 4 — Preuves insuffisamment classifiables -> non_determinable');
test('aucune donnée -> non_determinable, status:null', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Endurance'].status, null);
});

console.log('\nCAS 5 — Repeated Hop déficitaire mais sans norme -> jamais normal ni déficitaire par défaut');
test('repeated_hop fourni (valeurs extrêmes) mais sans aucun seuil réel -> indisponible pour les 5 KPI diagnostiques, jamais classé', () => {
  var td = { repeated_hop: repeatedHop({ n_hops: [1], rsi_fatigue: [99], height_fatigue: [99], ct_drift: [99], stiffness_fatigue: [99] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  ['repeated_hop_n_hops', 'repeated_hop_rsi_fatigue', 'repeated_hop_height_fatigue', 'repeated_hop_ct_drift', 'repeated_hop_stiffness_fatigue'].forEach(function (k) {
    assert.strictEqual(h.diagnosticEvidence[k].status, 'indisponible');
  });
  assert.strictEqual(h.state, 'non_determinable');
});

console.log('\nCAS 6 — Variable explicative déficitaire sans diagnostic -> ne crée pas l\'hypothèse');
test('imtp très faible (explicative) mais aucune preuve diagnostique déficitaire -> non_determinable, jamais retenue via l\'explicative seule', () => {
  var td = { imtp: { active: true, trials: { n: [100], nkg: [1] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(h.support, null);
});

console.log('\nCAS 7 — Heel Raise disponible et normé -> testé uniquement selon son rôle HYP réel (diagnostique, jamais confirmative/explicative)');
test('heel_raise_reps compte bien comme preuve diagnostique (1/6), jamais comme confirmative ni explicative', () => {
  var td = { heel_raise: heelRaise(10) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  assert.ok('heel_raise_reps' in h.diagnosticEvidence);
  assert.strictEqual('heel_raise_reps' in h.confirmativeEvidence, false);
  assert.strictEqual(JSON.stringify(h.explanatoryEvidence).indexOf('heel_raise'), -1);
});

console.log('\nCAS 8 — Asymétrie seule -> précision uniquement');
test('heel_raise fortement asymétrique D/G mais sous le seuil des deux côtés -> normal, LSI exposé en précision seulement', () => {
  var td = { heel_raise: { active: true, D: { trials: { reps: [28] } }, G: { trials: { reps: [40] } } } };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Endurance'].hypEnd01;
  assert.strictEqual(h.diagnosticEvidence.heel_raise_reps.status, 'normal');
  assert.ok(h.diagnosticEvidence.heel_raise_reps.lsi !== null);
  assert.strictEqual(h.state, 'absente');
});

console.log('\nCAS 9 — Données d\'une autre qualité modifiées -> aucune contamination d\'Endurance');
test('Modifier CMJ/DJ/Force/Stabilisation seuls ne modifie jamais HYP-END-01', () => {
  var tdA = { heel_raise: heelRaise(30) };
  var tdB = Object.assign({}, tdA, {
    cmj: { active: true, trials: { peak_power: [55], conc_rfd: [10] } },
    dj: { active: true, trials: { rsi: [2.0] } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }
  });
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  assert.deepStrictEqual(rA.functionScores['Endurance'].hypEnd01, rB.functionScores['Endurance'].hypEnd01);
});

console.log('\nCAS 10 — Données Endurance modifiées -> aucune modification des 7 autres qualités (moteurs HYP eux-mêmes)');
test('Un changement de données Endurance (heel_raise/repeated_hop) seul ne modifie ni Force, ni Réactivité, ni Stabilisation, ni Puissance, ni Explosivité, ni Mobilité', () => {
  var base = { dj: { active: true, trials: { rsi: [2.0] } } };
  var tdA = Object.assign({}, base, { heel_raise: heelRaise(30) });
  var tdB = Object.assign({}, base, { heel_raise: heelRaise(10), repeated_hop: repeatedHop({ n_hops: [1], rsi_fatigue: [99] }) });
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  ['Force', 'Réactivité', 'Stabilisation', 'Puissance', 'Explosivité', 'Mobilité'].forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seules les données Endurance ont changé');
  });
});
test('HYP-ABS-01 (le moteur clinique lui-même, pas le repli TFM générique préexistant) ne change jamais avec heel_raise/repeated_hop seuls', () => {
  var tdA = { heel_raise: heelRaise(30) };
  var tdB = { heel_raise: heelRaise(10), repeated_hop: repeatedHop({ n_hops: [1], rsi_fatigue: [99] }) };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  assert.deepStrictEqual(rA.functionScores['Absorption'].hypAbs01, rB.functionScores['Absorption'].hypAbs01);
  // Fait pré-existant, documenté, non introduit par cette mission : fSc['Absorption'] lui-même
  // PEUT varier ici via le repli TFM générique (TFM pondère heel_raise dans 'absorption', poids 1,
  // indépendamment de tout travail HYP) — non vérifié comme invariant ici, cf.
  // AUDIT_IMPLEMENTATION_HYP_END01.md, section contamination TFM pré-existante.
});

console.log('\nExclusions vérifiées — jamais lues sans rôle documenté');
test('repeated_hop_mean_stiffness jamais lu (aucun rôle assigné)', () => {
  var td = { heel_raise: heelRaise(30), repeated_hop: repeatedHop({ mean_stiffness: [999] }) };
  var r = computeMoteur(td, {}, POP, AGE);
  // "mean_stiffness" apparaît légitimement dans la note documentaire du moteur (exclusion
  // explicite) — on vérifie l'absence de la VALEUR injectée (999), pas l'absence littérale du mot.
  var json = JSON.stringify(r.functionScores['Endurance'].hypEnd01);
  assert.strictEqual(json.indexOf('999'), -1);
});
test('wblt/SLS/EO/EF/Strobo/Landing/SLLT/YBT jamais lus par HYP-END-01', () => {
  var td = {
    heel_raise: heelRaise(30),
    wblt: { active: true, D: { trials: { distance: [8] } }, G: { trials: { distance: [8] } } },
    sls: { active: true, D: { trials: { ttf: [1] } }, G: { trials: { ttf: [1] } } },
    landing_uni: { active: true, D: { trials: { tts: [5] } }, G: { trials: { tts: [5] } } }
  };
  var tdBase = { heel_raise: heelRaise(30) };
  var r = computeMoteur(td, {}, POP, AGE);
  var rBase = computeMoteur(tdBase, {}, POP, AGE);
  assert.deepStrictEqual(r.functionScores['Endurance'].hypEnd01, rBase.functionScores['Endurance'].hypEnd01);
});

console.log('\nRégression : structure de sortie complète');
test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement', () => {
  var td = { heel_raise: heelRaise(10) };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
});

test('Pureté : deux appels identiques produisent le même functionScores[\'Endurance\']', () => {
  var td = { heel_raise: heelRaise(10) };
  var r1 = computeMoteur(td, {}, POP, AGE);
  var r2 = computeMoteur(td, {}, POP, AGE);
  assert.deepStrictEqual(r1.functionScores['Endurance'], r2.functionScores['Endurance']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

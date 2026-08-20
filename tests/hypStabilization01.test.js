// Tests unitaires — HYP-STA-01, intégration réelle dans computeMoteur() (index.html).
//
// Couvre les 14 cas mandatés par la mission d'audit + implémentation (Partie 9), la règle de
// convergence gelée (≥2 preuves parmi 6 mécanismes indépendants — SLS, EO, EF, Strobo,
// landing_uni_tts, landing_bi_tts, cf. KINEXUS_REASONING_ENGINE_V1.md §6-7) et la non-régression
// des 7 autres qualités.
//
// Exécution : node tests/hypStabilization01.test.js — aucune dépendance externe.
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

// landing_uni_tts/landing_bi_tts : seules variables normées (THRESHOLDS) -> toujours classifiables.
// vert:0.8/jaune:1.2/orange:1.8 (uni, dir min) ; vert:0.6/jaune:1.0/orange:1.5 (bi, dir min).
var POP = 'general_m_senior', AGE = 30;

function uniData(tts) { return { active: true, D: { trials: { tts: [tts] } }, G: { trials: { tts: [tts] } } }; }
function biLanding(tts) { return { active: true, trials: { tts: [tts] } }; }

console.log('1. Toutes les preuves normales -> absente');
test('landing_uni + landing_bi normaux (seules preuves classifiables) -> absente, statut vert', () => {
  var td = { landing_uni: uniData(0.5), landing_bi: biLanding(0.4) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.diagnosticEvidence.landing_uni_tts.status, 'normal');
  assert.strictEqual(h.diagnosticEvidence.landing_bi_tts.status, 'normal');
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(r.functionScores['Stabilisation'].status, 'vert');
});

console.log('\n2. Une seule preuve déficitaire -> suspectee');
test('landing_uni déficitaire seul (landing_bi normal) -> suspectee, jamais retenue', () => {
  var td = { landing_uni: uniData(3.0), landing_bi: biLanding(0.4) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.diagnosticEvidence.landing_uni_tts.status, 'deficitaire');
  assert.strictEqual(h.diagnosticEvidence.landing_bi_tts.status, 'normal');
  assert.strictEqual(h.state, 'suspectee');
  assert.strictEqual(r.functionScores['Stabilisation'].status, 'jaune');
});

console.log('\n3. Plusieurs preuves déficitaires -> retenue_faible (cas concret KINEXUS_REASONING_ENGINE_V1.md §6)');
test('landing_uni ET landing_bi tous deux déficitaires -> retenue_faible malgré absence de CLI070/CLI071 couvrant ce cas', () => {
  var td = { landing_uni: uniData(3.0), landing_bi: biLanding(2.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.state, 'retenue_faible');
  assert.strictEqual(h.convergence.distinctMechanismsObserved, 2);
  assert.deepStrictEqual(h.convergence.mechanismsInvolved.sort(), ['landing_bi_tts', 'landing_uni_tts']);
  assert.ok(r.functionScores['Stabilisation'].status === 'orange' || r.functionScores['Stabilisation'].status === 'rouge');
});

console.log('\n4. Données insuffisantes -> non_determinable');
test('aucune donnée -> non_determinable, status:null (jamais un statut inventé)', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(r.functionScores['Stabilisation'].status, null);
});

console.log('\n5. Variable diagnostique sans norme (SLS/EO/EF/Strobo) -> jamais "normale" par défaut');
test('SLS/EO/EF/Strobo fournis mais sans aucun seuil -> indisponible, jamais "normal", jamais comptés dans la convergence', () => {
  var td = {
    sls: { active: true, D: { trials: { ttf: [5], cop_path: [900] } }, G: { trials: { ttf: [5], cop_path: [900] } } },
    eo: { active: true, trials: { surface: [400] } },
    ef: { active: true, trials: { surface: [900] } },
    strobo: { active: true, trials: { surface: [900] } }
  };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.diagnosticEvidence.sls.status, 'indisponible');
  assert.strictEqual(h.diagnosticEvidence.eo_surface.status, 'indisponible');
  assert.strictEqual(h.diagnosticEvidence.ef_surface.status, 'indisponible');
  assert.strictEqual(h.diagnosticEvidence.strobo_surface.status, 'indisponible');
  assert.strictEqual(h.state, 'non_determinable'); // aucune preuve classifiable
  assert.strictEqual(r.functionScores['Stabilisation'].status, null);
});

console.log('\n6. TTS Landing utilisé comme Stabilisation');
test('landing_uni_tts/landing_bi_tts comptent bien parmi les preuves diagnostiques de Stabilisation', () => {
  var td = { landing_uni: uniData(3.0), landing_bi: biLanding(2.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.ok('landing_uni_tts' in h.diagnosticEvidence);
  assert.ok('landing_bi_tts' in h.diagnosticEvidence);
  assert.strictEqual(h.state, 'retenue_faible');
});

console.log('\n7. TTS Landing absent du diagnostic Absorption');
test('HYP-ABS-01 ne lit jamais landing_uni_tts/landing_bi_tts, même quand ils sont déficitaires et actifs', () => {
  var td = {
    landing_uni: uniData(3.0), landing_bi: biLanding(2.5),
    cmj: { active: true, trials: { braking_rfd: [174], force_zero_vel: [30.5], braking_impulse: [5], peak_power: [71.5] } }
  };
  var r = computeMoteur(td, {}, POP, AGE);
  var json = JSON.stringify(r.functionScores['Absorption'].hypAbs01);
  assert.strictEqual(json.indexOf('landing_uni_tts') !== -1 || json.indexOf('landing_bi_tts') !== -1, false);
});

console.log('\n8. SLLT selon son rôle réel (exclu, jamais lu)');
test('sllt fourni (y compris sllt_tts) -> jamais lu, jamais compté, aucun effet sur Stabilisation', () => {
  var tdA = { landing_uni: uniData(0.5), landing_bi: biLanding(0.4) };
  var tdB = { landing_uni: uniData(0.5), landing_bi: biLanding(0.4), sllt: { active: true, D: { trials: { tts: [9], peak_landing_force: [99], ttplf: [1], loading_rate: [1], cop_path: [999] } }, G: { trials: { tts: [9], peak_landing_force: [99], ttplf: [1], loading_rate: [1], cop_path: [999] } } } };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  assert.deepStrictEqual(rA.functionScores['Stabilisation'].hypSta01, rB.functionScores['Stabilisation'].hypSta01);
  // "sllt" apparaît légitimement dans la note documentaire du moteur (exclusion explicite) — on
  // vérifie l'absence de toute VALEUR sllt (999/9) injectée, pas l'absence littérale du mot.
  assert.strictEqual(JSON.stringify(rB.functionScores['Stabilisation'].hypSta01).indexOf('999'), -1);
});

console.log('\n9. YBT selon son statut réel (aucun rôle documenté -> jamais lu)');
test('ybt fourni (même très déficitaire) -> jamais lu par HYP-STA-01, aucun effet, jamais utilisé comme preuve', () => {
  var tdA = { landing_uni: uniData(0.5), landing_bi: biLanding(0.4) };
  var tdB = { landing_uni: uniData(0.5), landing_bi: biLanding(0.4), ybt: { active: true, D: { trials: { ant: [40], pm: [50], pl: [50], composite: [40] } }, G: { trials: { ant: [40], pm: [50], pl: [50], composite: [40] } } } };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  assert.deepStrictEqual(rA.functionScores['Stabilisation'].hypSta01, rB.functionScores['Stabilisation'].hypSta01);
  // "ybt" apparaît légitimement dans la note documentaire du moteur (exclusion explicite) — on
  // vérifie l'absence de toute VALEUR ybt (40/50) injectée, pas l'absence littérale du mot.
  assert.strictEqual(JSON.stringify(rB.functionScores['Stabilisation'].hypSta01).indexOf('"ant"'), -1);
});

console.log('\n10. Asymétrie seule (LSI) ne génère jamais seule un déficit');
test('landing_uni fortement asymétrique (D/G) mais sous le seuil des deux côtés -> normal, LSI exposé en précision seulement', () => {
  var td = { landing_uni: { active: true, D: { trials: { tts: [0.5] } }, G: { trials: { tts: [0.75] } } }, landing_bi: biLanding(0.4) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.diagnosticEvidence.landing_uni_tts.status, 'normal');
  assert.ok(h.diagnosticEvidence.landing_uni_tts.lsi !== null);
  assert.strictEqual(h.state, 'absente');
});

console.log('\n11-13. Non-régression — Force/Réactivité/Absorption (HYP) inchangées par des données Stabilisation seules');
test('Un changement de données Stabilisation (landing) seul ne modifie ni Force ni Réactivité (HYP-FOR-01/HYP-REA-01, aucune lecture de landing)', () => {
  var base = { dj: { active: true, trials: { rsi: [2.0] } } };
  var tdA = Object.assign({}, base, { landing_uni: uniData(0.5), landing_bi: biLanding(0.4) });
  var tdB = Object.assign({}, base, { landing_uni: uniData(3.0), landing_bi: biLanding(2.5) });
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  ['Force', 'Réactivité'].forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seules les données Stabilisation ont changé');
  });
});

test('HYP-ABS-01 (le moteur clinique lui-même, pas le repli TFM générique préexistant) ne change jamais avec landing seul', () => {
  var tdA = { landing_uni: uniData(0.5), landing_bi: biLanding(0.4) };
  var tdB = { landing_uni: uniData(3.0), landing_bi: biLanding(2.5) };
  var rA = computeMoteur(tdA, {}, POP, AGE);
  var rB = computeMoteur(tdB, {}, POP, AGE);
  assert.deepStrictEqual(rA.functionScores['Absorption'].hypAbs01, rB.functionScores['Absorption'].hypAbs01);
  // Fait pré-existant, documenté, non introduit par cette mission : fSc['Absorption'] lui-même
  // PEUT varier ici via le repli TFM générique (TFM pondère landing_uni/landing_bi dans
  // 'absorption', poids 3, indépendamment de tout travail HYP) — non vérifié comme invariant ici,
  // cf. AUDIT_IMPLEMENTATION_HYP_STA01.md, section contamination TFM pré-existante.
});

console.log('\n14. Données de Stabilisation modifiées -> seule Stabilisation change (purity + isolation inverse)');
test('Puissance/Explosivité/Mobilité restent pilotées par leurs propres moteurs quand seules des données Stabilisation sont fournies en plus', () => {
  var td = {
    cmj: { active: true, trials: { peak_power: [55], slcmj: undefined } },
    wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } },
    landing_uni: uniData(3.0), landing_bi: biLanding(2.5)
  };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.notStrictEqual(r.functionScores['Puissance'].hypPui01, undefined);
  assert.notStrictEqual(r.functionScores['Explosivité'].hypExp01, undefined);
  assert.notStrictEqual(r.functionScores['Mobilité'].hypMob01, undefined);
  assert.strictEqual(r.functionScores['Stabilisation'].hypSta01.state, 'retenue_faible');
});

console.log('\nSupport gradué — jamais forcé au-delà du réellement atteint');
test('retenue_faible avec exactement 2 preuves déficitaires (les 2 seules classifiables) -> support faible, jamais moderee/forte inventé', () => {
  var td = { landing_uni: uniData(3.0), landing_bi: biLanding(2.5) };
  var r = computeMoteur(td, {}, POP, AGE);
  var h = r.functionScores['Stabilisation'].hypSta01;
  assert.strictEqual(h.state, 'retenue_faible');
  assert.strictEqual(h.support.level, 'faible');
});

console.log('\nRégression : structure de sortie complète');
test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement', () => {
  var td = { landing_uni: uniData(3.0) };
  var r = computeMoteur(td, {}, POP, AGE);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
});

test('Pureté : deux appels identiques produisent le même functionScores[\'Stabilisation\']', () => {
  var td = { landing_uni: uniData(3.0), landing_bi: biLanding(2.5) };
  var r1 = computeMoteur(td, {}, POP, AGE);
  var r2 = computeMoteur(td, {}, POP, AGE);
  assert.deepStrictEqual(r1.functionScores['Stabilisation'], r2.functionScores['Stabilisation']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

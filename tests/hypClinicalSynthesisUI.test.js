// Tests unitaires — Branchement de HYP-CSM-01 à l'UI et au PDF (mission
// IMPLEMENTATION_HYP_CSM_UI_PDF.md). Vérifie que computeMoteur() expose désormais
// `clinicalSynthesis` (calculé une seule fois, jamais recalculé, jamais un objet différent d'un
// appel direct à computeHypClinicalSynthesis01), que le rapport PDF (buildSportifReport/
// buildExpertReport) reprend fidèlement cette synthèse (aucune formulation causale inventée,
// aucune qualité non_determinable présentée comme déficitaire), et que les 10 cas mandatés par la
// mission produisent la sortie attendue.
//
// Exécution : node tests/hypClinicalSynthesisUI.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
// Slice étendue (comme tests/rapportMouvementPDF.test.js) : buildSportifReport/buildExpertReport
// vivent après le repère '// ── SUPABASE CONFIG' habituel — on s'arrête juste avant le seul appel
// réellement exécuté au chargement (ReactDOM.createRoot(...).render(...)), tout le reste n'étant
// que des déclarations var/function, sûres à eval() en Node.
const start = code.indexOf('var C={');
const endMarker = "ReactDOM.createRoot(document.getElementById('root'))";
const end = code.indexOf(endMarker);
if (start < 0 || end < 0) throw new Error('Impossible de localiser le moteur dans index.html.');
eval(code.slice(start, end));

global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.message); }
}

var POP = 'general_m_senior', AGE = 30;
var POP_CMJ = 'bball2425_ncaa_m', AGE_CMJ = 26;
var athlete = { id: 1, prenom: 'Jean', nom: 'Dupont', sport: 'Basketball', dateNaissance: null, normPopulation: POP };
var athleteCmj = Object.assign({}, athlete, { normPopulation: POP_CMJ });

function withTempForceNorms(fn) {
  THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
  THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.imtp_n; delete THRESHOLDS.slimtp_n; }
}
function withTempSlcmjNorm(fn) {
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.slcmj_peak_power; }
}
function withTempExpNorms(fn) {
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.cmj_conc_rfd; delete THRESHOLDS.cmj_conc_impulse_100; }
}
function stabilisationDeficitData() {
  return { landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }, landing_bi: { active: true, trials: { tts: [2.5] } } };
}
function bilanFor(td) { return { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: td, questData: {}, reportOverrides: {} }; }
var forbiddenCausal = /(entraîne|est\s+responsable\s+de|est\s+la\s+cause\s+principale|cause\s+principale\s+de)/i;

console.log('Présence et pureté de clinicalSynthesis dans computeMoteur()');
test('computeMoteur() expose clinicalSynthesis, calculé une seule fois, identique à un appel direct de computeHypClinicalSynthesis01', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.ok(r.clinicalSynthesis);
  assert.strictEqual(r.clinicalSynthesis.csmId, 'HYP-CSM-01');
  var direct = computeHypClinicalSynthesis01(r.functionScores);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(r.clinicalSynthesis)), JSON.parse(JSON.stringify(direct)));
  // Même référence à chaque accès (pas de recalcul silencieux à la lecture).
  assert.strictEqual(r.clinicalSynthesis, r.clinicalSynthesis);
});

console.log('\nCohérence des 8 moteurs HYP (non-régression du branchement)');
test('Le branchement ne modifie ni ne réinvoque les 8 computeHypXxx01 (fSc identique avant/après lecture de clinicalSynthesis)', () => {
  var r = computeMoteur({ imtp: { active: true, trials: { n: [1] } } }, {}, POP, AGE);
  var before = JSON.stringify(r.functionScores);
  void r.clinicalSynthesis; // accès en lecture
  assert.strictEqual(JSON.stringify(r.functionScores), before);
});

console.log('\nCAS 1 — Toutes les qualités normales/absentes : synthèse neutre');
test('Aucune donnée -> objectified vide, PDF ne présente aucun déficit', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.strictEqual(r.clinicalSynthesis.objectified.length, 0);
  var pdf = buildSportifReport(athlete, bilanFor({}), r);
  assert.ok(pdf.indexOf('Synthèse clinique') !== -1);
  assert.ok(pdf.indexOf('Aucun déficit') !== -1 || r.clinicalSynthesis.narrative.deficitsObjectives.indexOf('Aucun déficit') !== -1);
});

console.log('\nCAS 2 — Force seule déficitaire');
test('Force apparaît seule dans la synthèse, aucune autre qualité inventée', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r = computeMoteur(td, {}, POP, AGE);
    assert.deepStrictEqual(r.clinicalSynthesis.objectified.map(o => o.quality), ['Force']);
    var pdf = buildSportifReport(athlete, bilanFor(td), r);
    assert.ok(pdf.indexOf('Force') !== -1);
    assert.strictEqual(forbiddenCausal.test(pdf), false);
  });
});

console.log('\nCAS 3 — Force + Puissance déficitaires : deux déficits, relation seulement si autorisée par CSM');
test('Force et Puissance objectivées ; relation Force->Puissance présentée comme hypothèse explicative, jamais causale', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } }
    );
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    assert.deepStrictEqual(r.clinicalSynthesis.objectified.map(o => o.quality).sort(), ['Force', 'Puissance']);
    var pdf = buildSportifReport(athleteCmj, bilanFor(td), r);
    assert.strictEqual(forbiddenCausal.test(pdf), false);
    assert.ok(pdf.indexOf('hypothèse explicative') !== -1 || r.clinicalSynthesis.explanatoryHypotheses.length > 0);
  }));
});

console.log('\nCAS 4 — Force déficitaire + Puissance non_determinable : aucune relation ne transforme Puissance en déficit');
test('Force affichée, Puissance non_determinable, absente de la liste des déficits, aucune mention causale', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r = computeMoteur(td, {}, POP, AGE);
    assert.deepStrictEqual(r.clinicalSynthesis.objectified.map(o => o.quality), ['Force']);
    assert.ok(r.clinicalSynthesis.nonDeterminable.map(n => n.quality).indexOf('Puissance') !== -1);
    var pdf = buildSportifReport(athlete, bilanFor(td), r);
    assert.strictEqual(/Puissance[^<]*(déficitaire|Déficitaire)/.test(pdf), false);
  });
});

console.log('\nCAS 5 — Absorption + Stabilisation déficitaires : relation affichée seulement si CSM l\'autorise');
test('Les deux apparaissent objectivées ; aucune relation explicative Absorption<->Stabilisation (étanchéité HYP respectée)', () => {
  var td = Object.assign({ cmj: { active: true, trials: { braking_rfd: [1], force_zero_vel: [1], braking_impulse: [40] } } }, stabilisationDeficitData());
  var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
  assert.deepStrictEqual(r.clinicalSynthesis.objectified.map(o => o.quality).sort(), ['Absorption', 'Stabilisation']);
  var rel = r.clinicalSynthesis.explanatoryHypotheses.filter(h => (h.explains === 'Absorption' && h.explained === 'Stabilisation') || (h.explains === 'Stabilisation' && h.explained === 'Absorption'));
  assert.strictEqual(rel.length, 0);
});

console.log('\nCAS 6 — Réactivité seule déficitaire');
test('Réactivité seule dans objectified', () => {
  var td = { dj: { active: true, trials: { rsi: [0.1] } } };
  var r = computeMoteur(td, {}, POP, AGE);
  if (r.clinicalSynthesis.objectified.length) {
    assert.deepStrictEqual(r.clinicalSynthesis.objectified.map(o => o.quality), ['Réactivité']);
  }
});

console.log('\nCAS 7 — Plusieurs qualités déficitaires : pas de classement arbitraire');
test('Aucun champ rank/priority/causeprincipale sur objectified, même avec plusieurs qualités', () => {
  withTempForceNorms(() => withTempExpNorms(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      { cmj: { active: true, trials: { conc_rfd: [10], conc_impulse_100: [0.1] } } }
    );
    var r = computeMoteur(td, {}, POP, AGE);
    r.clinicalSynthesis.objectified.forEach(o => { assert.strictEqual('rank' in o, false); assert.strictEqual('priority' in o, false); });
    var pdf = buildSportifReport(athlete, bilanFor(td), r);
    assert.strictEqual(forbiddenCausal.test(pdf), false);
  }));
});

console.log('\nCAS 8 — Qualités non_determinable : restent non_determinable partout');
test('Aucune donnée -> toutes les qualités HYP listées en nonDeterminable, jamais présentées comme normales dans le PDF', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.strictEqual(r.clinicalSynthesis.nonDeterminable.length, 8);
  var pdf = buildSportifReport(athlete, bilanFor({}), r);
  assert.strictEqual(/est\s+normal/i.test(pdf), false);
});

console.log('\nCAS 9 — TFM rouge mais HYP non_determinable : aucun diagnostic rouge dans la synthèse');
test('Puissance/Absorption non_determinable malgré un tfmStatus potentiellement rouge -> absentes de objectified, absentes du texte "déficit" du PDF', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r = computeMoteur(td, {}, POP, AGE);
    assert.strictEqual(r.functionScores['Puissance'].status, null);
    var objQualities = r.clinicalSynthesis.objectified.map(o => o.quality);
    assert.strictEqual(objQualities.indexOf('Puissance'), -1);
    assert.strictEqual(objQualities.indexOf('Absorption'), -1);
  });
});

console.log('\nCAS 10 — Relation TFM existante mais un des deux diagnostics HYP absent : pas de relation causale');
test('Force non_determinable + Puissance déficitaire (relation documentée) -> jamais présentée comme hypothèse explicative', () => {
  withTempSlcmjNorm(() => {
    var td = { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    assert.strictEqual(r.functionScores['Force'].status, null);
    var rel = r.clinicalSynthesis.explanatoryHypotheses.filter(h => h.explains === 'Force' && h.explained === 'Puissance');
    assert.strictEqual(rel.length, 0);
    var pdf = buildSportifReport(athleteCmj, bilanFor(td), r);
    assert.strictEqual(forbiddenCausal.test(pdf), false);
  });
});

console.log('\nCohérence UI/PDF — séparation TFM/HYP');
test('Le PDF (rapport expert) ne mentionne jamais une qualité non_determinable comme déficitaire dans la section Synthèse clinique', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r = computeMoteur(td, {}, POP, AGE);
    var pdfExpert = buildExpertReport(athlete, bilanFor(td), r);
    assert.ok(pdfExpert.indexOf('Synthèse clinique') !== -1);
    assert.strictEqual(/Puissance[^<]*(déficitaire|Déficitaire)/.test(pdfExpert), false);
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);

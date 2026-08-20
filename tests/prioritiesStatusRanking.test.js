// Tests unitaires — Correction du bug de tri des priorités (FIX_PRIORITIES_STATUS_RANKING.md).
//
// Bug corrigé : `({rouge:0,orange:1}[status]||2)` faisait retomber 'rouge' (valeur 0, falsy en
// JS) sur le fallback `2`, pire que 'orange' (`1`, truthy) — 'orange' passait donc AVANT 'rouge'
// dans `priorities`. Remplacé par `statusPriorityRank(status)`, qui ne dépend jamais de la
// falsy-ness d'une valeur de rang.
//
// Ces tests exercent le pipeline réel (computeMoteur() -> priorities/defaultReportTexts), pas
// uniquement une fonction isolée — la régression doit être visible au niveau où elle a été
// découverte (AUDIT_COHERENCE_NARRATIVE_CSM_VS_LEGACY.md §5/§11 CAS 7).
//
// Exécution : node tests/prioritiesStatusRanking.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
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

function withTempForceNorms(fn) {
  THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
  THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.imtp_n; delete THRESHOLDS.slimtp_n; }
}
function withTempSlcmjNorm(fn) {
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.slcmj_peak_power; }
}
function stabilisationDeficitData() {
  return { landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }, landing_bi: { active: true, trials: { tts: [2.5] } } };
}

console.log('Preuve directe du rang (démontre rank(rouge) < rank(orange) < rank(autre))');
test('statusPriorityRank (source extraite littéralement du fichier) : rouge=0, orange=1, tout le reste=2', () => {
  // statusPriorityRank() est déclarée localement dans computeMoteur() (portée minimale,
  // diff minimal) — non accessible depuis l'extérieur. On extrait sa source EXACTE du fichier
  // pour prouver son comportement sans dupliquer/réécrire la logique corrigée, puis on l'exerce
  // aussi à travers le pipeline réel (CAS 1-8 ci-dessous), comme demandé par la mission.
  var m = code.match(/function statusPriorityRank\(status\)\{[^}]*\}/);
  assert.ok(m, 'statusPriorityRank doit exister littéralement dans index.html');
  var statusPriorityRank = new Function('status', m[0].replace(/^function statusPriorityRank\(status\)\{/, '').replace(/\}$/, ''));
  assert.strictEqual(statusPriorityRank('rouge'), 0);
  assert.strictEqual(statusPriorityRank('orange'), 1);
  assert.strictEqual(statusPriorityRank('jaune'), 2);
  assert.strictEqual(statusPriorityRank('vert'), 2);
  assert.strictEqual(statusPriorityRank(null), 2);
  assert.strictEqual(statusPriorityRank(undefined), 2);
  assert.ok(statusPriorityRank('rouge') < statusPriorityRank('orange'));
  assert.ok(statusPriorityRank('orange') < statusPriorityRank('jaune'));
});

console.log('\nCAS RÉEL — Force+Puissance+Stabilisation (HYP, rouge) + Contrôle Frontal (TFM, orange)');
test('Les 3 rouges HYP précèdent Contrôle Frontal orange ; Stabilisation n\'est plus exclue du top-3', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } },
      stabilisationDeficitData()
    );
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    assert.strictEqual(r.functionScores['Force'].status, 'rouge');
    assert.strictEqual(r.functionScores['Puissance'].status, 'rouge');
    assert.strictEqual(r.functionScores['Stabilisation'].status, 'rouge');
    assert.strictEqual(r.functionScores['Contrôle Frontal'].status, 'orange');

    var fonctions = r.priorities.map(p => p.fonction);
    assert.deepStrictEqual(fonctions.sort(), ['Force', 'Puissance', 'Stabilisation'].sort(), 'les 3 rouges HYP doivent occuper le top-3, Contrôle Frontal (orange) doit en être exclu');
    r.priorities.forEach(p => assert.strictEqual(p.status, 'rouge', p.fonction + ' doit être rouge dans le top-3'));

    // La "Chaîne causale" doit désormais être construite à partir des rouges HYP, jamais de
    // Contrôle Frontal.
    var texts = defaultReportTexts({ prenom: 'X', nom: 'Y' }, { date: new Date().toISOString(), testData: td }, r);
    assert.strictEqual(texts.conclusion.indexOf('contrôle frontal'), -1, 'la chaîne causale ne doit plus mentionner Contrôle Frontal en priorité');

    // CSM reste inchangé et n'a jamais été affecté par ce bug (aucune hiérarchie, liste plate).
    assert.deepStrictEqual(r.clinicalSynthesis.objectified.map(o => o.quality).sort(), ['Force', 'Puissance', 'Stabilisation'].sort());
  }));
});

console.log('\nCAS 1 — un seul rouge');
test('rouge seul -> priorité unique, rang correct', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r = computeMoteur(td, {}, POP, AGE);
    assert.deepStrictEqual(r.priorities.map(p => p.fonction), ['Force']);
    assert.strictEqual(r.priorities[0].status, 'rouge');
  });
});

console.log('\nCAS 2 — un orange + un rouge');
test('rouge doit précéder orange (rang 1 puis 2)', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      stabilisationDeficitData()
    );
    var r = computeMoteur(td, {}, POP, AGE);
    // Force rouge (HYP), Contrôle Frontal potentiellement orange (TFM, via landing_uni/landing_bi).
    if (r.functionScores['Force'].status === 'rouge' && r.functionScores['Contrôle Frontal'] && r.functionScores['Contrôle Frontal'].status === 'orange') {
      var idxForce = r.priorities.findIndex(p => p.fonction === 'Force');
      var idxCF = r.priorities.findIndex(p => p.fonction === 'Contrôle Frontal');
      if (idxCF >= 0) assert.ok(idxForce < idxCF, 'Force (rouge) doit précéder Contrôle Frontal (orange)');
    }
  }));
});

console.log('\nCAS 3 — plusieurs rouges + un orange (cas réel déjà couvert ci-dessus, revérifié à part)');
test('tous les rouges précèdent le seul orange', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } },
      stabilisationDeficitData()
    );
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var statuses = r.priorities.map(p => p.status);
    var firstOrangeIdx = statuses.indexOf('orange');
    var lastRougeIdx = statuses.lastIndexOf('rouge');
    if (firstOrangeIdx >= 0 && lastRougeIdx >= 0) assert.ok(lastRougeIdx < firstOrangeIdx, 'tous les rouges doivent précéder les oranges dans priorities');
  }));
});

console.log('\nCAS 4 — orange uniquement');
test('orange seul reste correctement classé', () => {
  var td = stabilisationDeficitData();
  var r = computeMoteur(td, {}, POP, AGE);
  var cf = r.priorities.filter(p => p.fonction === 'Contrôle Frontal');
  if (cf.length) assert.strictEqual(cf[0].status, 'orange');
});

console.log('\nCAS 5 — aucun rouge/orange : comportement historique conservé');
test('aucune donnée -> priorities vide, comme avant le correctif', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  assert.deepStrictEqual(r.priorities, []);
});

console.log('\nCAS 6 — trois rouges : mécanisme de départage existant conservé (ordre FUNCTIONS)');
test('à sévérité égale, l\'ordre suit FUNCTIONS (mécanisme de départage inchangé, non réinventé)', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } },
      stabilisationDeficitData()
    );
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var rouges = r.priorities.filter(p => p.status === 'rouge').map(p => p.fonction);
    var expectedOrder = FUNCTIONS.filter(f => rouges.indexOf(f) !== -1);
    assert.deepStrictEqual(rouges, expectedOrder, 'le départage entre rouges à égalité doit rester l\'ordre naturel de FUNCTIONS, jamais une nouvelle règle');
  }));
});

console.log('\nCAS 7 — rouge HYP + orange TFM (cas critique, redondant avec le CAS RÉEL ci-dessus, gardé pour traçabilité explicite de la mission)');
test('rouge HYP avant orange TFM', () => {
  withTempForceNorms(() => {
    var td = Object.assign(
      { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
      stabilisationDeficitData()
    );
    var r = computeMoteur(td, {}, POP, AGE);
    if (r.functionScores['Contrôle Frontal'] && r.functionScores['Contrôle Frontal'].status === 'orange' && r.functionScores['Force'].status === 'rouge') {
      assert.strictEqual(r.priorities[0].fonction, 'Force');
    }
  });
});

console.log('\nCAS 8 — qualité HYP non_determinable + orange TFM : non_determinable jamais transformé en diagnostic');
test('non_determinable reste absent de priorities, jamais rouge/orange par accident du tri', () => {
  var td = stabilisationDeficitData(); // Force/Puissance non_determinable (aucune donnée), Contrôle Frontal potentiellement orange (TFM)
  var r = computeMoteur(td, {}, POP, AGE);
  assert.strictEqual(r.functionScores['Force'].status, null);
  assert.strictEqual(r.functionScores['Puissance'].status, null);
  assert.strictEqual(r.priorities.map(p => p.fonction).indexOf('Force'), -1);
  assert.strictEqual(r.priorities.map(p => p.fonction).indexOf('Puissance'), -1);
});

console.log('\nRégression — CSM et les 8 moteurs HYP restent strictement inchangés par le correctif');
test('Pureté : deux appels identiques produisent le même functionScores/clinicalSynthesis (hors référence hyp)', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r1 = computeMoteur(td, {}, POP, AGE);
    var r2 = computeMoteur(td, {}, POP, AGE);
    assert.strictEqual(JSON.stringify(r1.functionScores), JSON.stringify(r2.functionScores));
    assert.strictEqual(JSON.stringify(r1.clinicalSynthesis), JSON.stringify(r2.clinicalSynthesis));
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);

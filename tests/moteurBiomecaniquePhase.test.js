// Tests unitaires — Moteur Biomécanique par phase (computeBiomecaPhase / computeBiomecaEngine).
//
// Décision d'architecture du praticien (04/08) : la qualité scientifique prime sur la symétrie
// du modèle. Une variable de phase (CMJ_VAR_META) n'est plus classée "master"/"support" de façon
// figée pour décider si elle participe au score — elle est désormais "principale" (participe au
// score) dès lors qu'elle est biomécaniquement pertinente (tier != 'info') ET que NORMS possède
// des percentiles pour elle dans la population active ; sinon elle reste "secondaire" (jamais
// dans le score, uniquement dans les explications/le niveau Expert). Ce fichier vérifie
// exclusivement cette couche de catégorisation dynamique + le nouveau plancher "minimum 2
// variables principales" — pas les moteurs en aval (déjà couverts par leurs propres tests).
//
// Exécution : node tests/moteurBiomecaniquePhase.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var TESTS=[');
const endMarker = '// Population de normes à utiliser';
const end = code.indexOf(endMarker);
if (start < 0 || end < 0) throw new Error('Impossible de localiser le moteur dans index.html.');
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

console.log('Moteur Biomécanique par phase — catégorisation dynamique principale/secondaire');

// Phase 'braking' : ecc_mean_power (w1.0), force_zero_vel (w1.5), braking_rfd (w2.0),
// braking_impulse (w1.0, historiquement 'support') — 4 variables biomécaniquement pertinentes.
const brakingVals = { ecc_mean_power: 40, force_zero_vel: 30, braking_rfd: 8000, braking_impulse: 3 };

test('une variable sans normes pour la population active est classée "secondaire", jamais dans le score', () => {
  NORMS.test_biomeca_partial = {
    cmj_ecc_mean_power: [10, 20, 40, 60, 75],
    cmj_force_zero_vel: [8, 15, 30, 45, 55]
    // braking_rfd et braking_impulse : aucune norme -> doivent rester 'secondaire'.
  };
  const r = computeBiomecaPhase('braking', brakingVals, 'test_biomeca_partial', 24);
  const byKey = k => r.entries.find(e => e.kpiKey === k);
  assert.strictEqual(byKey('ecc_mean_power').tier, 'principale');
  assert.strictEqual(byKey('force_zero_vel').tier, 'principale');
  assert.strictEqual(byKey('braking_rfd').tier, 'secondaire');
  assert.strictEqual(byKey('braking_impulse').tier, 'secondaire');
  // Les variables secondaires gardent leur valeur brute (pour les explications/niveau Expert)
  // mais n'ont jamais de percentile.
  assert.strictEqual(byKey('braking_rfd').rawVal, 8000);
  assert.strictEqual(byKey('braking_rfd').percentile, null);
});

test('promotion automatique : la même variable devient "principale" dès que NORMS lui donne des bandes, sans toucher au moteur', () => {
  NORMS.test_biomeca_promu = {
    cmj_ecc_mean_power: [10, 20, 40, 60, 75],
    cmj_force_zero_vel: [8, 15, 30, 45, 55],
    cmj_braking_rfd: [2000, 4000, 8000, 12000, 16000] // ajoutée après coup, aucune modif de code
  };
  const r = computeBiomecaPhase('braking', brakingVals, 'test_biomeca_promu', 24);
  const byKey = k => r.entries.find(e => e.kpiKey === k);
  assert.strictEqual(byKey('braking_rfd').tier, 'principale', 'braking_rfd doit être promue "principale" dès que NORMS la couvre');
  assert.strictEqual(byKey('braking_rfd').status, 'ok');
  assert.ok(byKey('braking_rfd').percentile != null);
});

test('le score ne doit JAMAIS être influencé par une variable secondaire, même avec une valeur extrême', () => {
  NORMS.test_biomeca_score_a = {
    cmj_ecc_mean_power: [10, 20, 40, 60, 75],
    cmj_force_zero_vel: [8, 15, 30, 45, 55]
  };
  const valsModeres = { ecc_mean_power: 40, force_zero_vel: 30, braking_rfd: 8000, braking_impulse: 3 };
  const valsExtreme = { ecc_mean_power: 40, force_zero_vel: 30, braking_rfd: 19999, braking_impulse: 0.2 };
  const rA = computeBiomecaPhase('braking', valsModeres, 'test_biomeca_score_a', 24);
  const rB = computeBiomecaPhase('braking', valsExtreme, 'test_biomeca_score_a', 24);
  assert.ok(rA.sufficient && rB.sufficient);
  // braking_rfd/braking_impulse sont 'secondaire' dans cette population (aucune norme) : leur
  // valeur brute, même extrême dans un sens ou l'autre, ne doit rien changer au score.
  assert.strictEqual(rA.score, rB.score);
  // Le score doit correspondre exactement à la moyenne pondérée des 2 seules variables
  // principales (w1.0 et w1.5), jamais aux 4 variables du référentiel.
  const pEcc = rA.entries.find(e => e.kpiKey === 'ecc_mean_power').percentile;
  const pForce = rA.entries.find(e => e.kpiKey === 'force_zero_vel').percentile;
  const attendu = (1.0 * pEcc + 1.5 * pForce) / (1.0 + 1.5);
  assert.ok(Math.abs(rA.score - attendu) < 1e-9);
});

test('plancher "minimum 2 variables principales" : 1 seule variable normée -> phase insuffisante même si le ratio (1/1) passerait seul', () => {
  NORMS.test_biomeca_une_seule = {
    cmj_braking_rfd: [2000, 4000, 8000, 12000, 16000]
    // Seule braking_rfd est normée -> 1 principale disponible, ratio 1/1=100% mais < minimum 2.
  };
  const r = computeBiomecaPhase('braking', brakingVals, 'test_biomeca_une_seule', 24);
  assert.strictEqual(r.sufficient, false);
  assert.ok(/minimum requis 2/.test(r.reason), 'le motif doit citer le plancher minimum de 2 variables principales, obtenu: ' + r.reason);
});

test('avec 2 variables principales disponibles (le plancher), la phase devient exploitable', () => {
  NORMS.test_biomeca_deux = {
    cmj_ecc_mean_power: [10, 20, 40, 60, 75],
    cmj_force_zero_vel: [8, 15, 30, 45, 55]
  };
  const r = computeBiomecaPhase('braking', brakingVals, 'test_biomeca_deux', 24);
  assert.strictEqual(r.sufficient, true);
  assert.strictEqual(r.masterAvailable, 2);
  assert.strictEqual(r.masterTotal, 2);
});

test('aucune norme du tout pour la population -> toutes les variables biomécaniquement pertinentes restent secondaires, phase insuffisante', () => {
  NORMS.test_biomeca_vide = {};
  const r = computeBiomecaPhase('braking', brakingVals, 'test_biomeca_vide', 24);
  assert.strictEqual(r.sufficient, false);
  assert.ok(r.entries.every(e => e.tier === 'secondaire'));
});

test('les variables "contextuelles" (tier info du référentiel, ex. ecc_peak_force) n\'apparaissent jamais dans les entries de la phase', () => {
  NORMS.test_biomeca_deux2 = {
    cmj_ecc_mean_power: [10, 20, 40, 60, 75],
    cmj_force_zero_vel: [8, 15, 30, 45, 55]
  };
  const r = computeBiomecaPhase('braking', brakingVals, 'test_biomeca_deux2', 24);
  const keys = r.entries.map(e => e.kpiKey);
  assert.ok(!keys.includes('ecc_peak_force'), 'ecc_peak_force est tier "info" (contextuelle) : ne doit jamais figurer dans entries');
  assert.ok(!keys.includes('ecc_decel'));
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

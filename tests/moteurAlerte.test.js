// Tests unitaires — Moteur d'Alerte (détection automatique de situations inhabituelles).
//
// Décision du praticien (04/08) : le logiciel doit détecter automatiquement les situations
// inhabituelles (incohérences physiologiques, conclusions contradictoires entre moteurs, valeurs
// incompatibles, données manquantes, confiance faible) sans jamais modifier les résultats — une
// alerte attire seulement l'attention du clinicien et doit toujours être expliquée (pourquoi,
// quelles variables, quelles vérifications recommandées). Ce fichier vérifie que
// computeMoteurAlerte() est un pur composeur qui scanne fidèlement les résultats déjà produits
// par les autres moteurs — ceux-ci ont leurs propres tests.
//
// Exécution : node tests/moteurAlerte.test.js — aucune dépendance externe.
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

function fakePhaseResult(cfg) {
  return {
    phase: cfg.phase, sufficient: cfg.sufficient !== false, score: cfg.score,
    reason: cfg.reason || null,
    entries: cfg.entries || [],
    coherenceBand: cfg.coherenceLabel ? { label: cfg.coherenceLabel } : null,
    masterAvailable: cfg.masterAvailable != null ? cfg.masterAvailable : 4,
    masterTotal: cfg.masterTotal != null ? cfg.masterTotal : 4
  };
}
function fakePhases(cfg) {
  const out = {};
  CMJ_PHASES.forEach(p => { out[p] = cfg[p] ? fakePhaseResult(Object.assign({ phase: p }, cfg[p])) : { phase: p, sufficient: true, coherenceBand: { label: 'Bonne cohérence' }, entries: [], masterAvailable: 4, masterTotal: 4 }; });
  return out;
}

console.log('Moteur d\'Alerte');

test('ne génère aucune alerte quand tout est cohérent, complet et confiant', () => {
  const phases = fakePhases({});
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  assert.strictEqual(r.nombre, 0);
  assert.deepStrictEqual(r.alertes, []);
});

test('incohérence biomécanique (globalWarnings) -> alerte "incoherence_biomecanique" explicable avec variables concernées', () => {
  const phases = fakePhases({});
  const warnings = [{ level: 'incoherence_biomecanique', ok: false, blocking: false, check: 'RSI-Mod cohérent avec Jump Height / Contraction Time', variables: ['rsi_mod', 'height', 'tto'], reason: 'RSI-Mod déclaré (2.1) incohérent avec Jump Height (35 cm) et Contraction Time (250 ms).' }];
  const r = computeMoteurAlerte(phases, [], {}, null, warnings);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].type, 'incoherence_biomecanique');
  assert.deepStrictEqual(r.alertes[0].variablesConcernees, ['rsi_mod', 'height', 'tto']);
  assert.ok(r.alertes[0].raison.includes('RSI-Mod'));
  assert.ok(r.alertes[0].verificationsRecommandees.length > 0);
});

test('conclusions contradictoires entre moteurs (incoherences du Moteur de Raisonnement) -> alerte dédiée', () => {
  const phases = fakePhases({});
  const raisonnement = {
    croisements: [],
    incoherences: [{ profil: 'Propulsif', cible: 'concentric', concordance: { reason: 'Discordance importante entre le moteur biomécanique et le moteur des profils.' } }]
  };
  const r = computeMoteurAlerte(phases, [], {}, raisonnement, []);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].type, 'conclusions_contradictoires');
  assert.ok(r.alertes[0].variablesConcernees.includes('Propulsif'));
  assert.ok(r.alertes[0].variablesConcernees.includes('Concentric'));
});

test('données manquantes (phase insuffisante) -> alerte dédiée reprenant la raison déjà calculée', () => {
  const phases = fakePhases({ braking: { sufficient: false, reason: 'Données insuffisantes pour interpréter cette phase (1/4 variables maîtresses disponibles, seuil requis 50%).' } });
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].type, 'donnees_manquantes');
  assert.ok(r.alertes[0].raison.includes('1/4'));
});

test('données manquantes (profil insuffisant) -> alerte dédiée', () => {
  const phases = fakePhases({});
  const profiles = [{ id: 'absorbeur', nom: 'Absorbeur', result: { sufficient: false, reason: 'Aucune variable discriminante exploitable.' } }];
  const r = computeMoteurAlerte(phases, profiles, {}, null, []);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].type, 'donnees_manquantes');
  assert.strictEqual(r.alertes[0].variablesConcernees[0], 'Absorbeur');
});

test('confiance faible (via computeConfianceKinexus) -> alerte dédiée, mais jamais si la phase est déjà insuffisante (pas de double alerte)', () => {
  const phases = fakePhases({
    braking: {
      // cohérence interne faible + aucune autre donnée dispo -> confiance basse mais phase "sufficient"
      coherenceLabel: 'Très faible cohérence', masterAvailable: 1, masterTotal: 4,
      entries: [{ tier: 'master', status: 'ok', percentile: 10 }]
    }
  });
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  const types = r.alertes.map(a => a.type);
  assert.ok(types.includes('confiance_faible'), 'attendu une alerte de confiance faible');
  // Une seule alerte pour braking (pas de doublon "données manquantes" puisque phase.sufficient===true ici).
  assert.strictEqual(r.alertes.filter(a => a.variablesConcernees.includes('Braking')).length, 1);
});

test('une alerte ne modifie jamais les résultats passés en entrée (lecture seule)', () => {
  const phases = fakePhases({ braking: { sufficient: false, reason: 'test' } });
  const before = JSON.parse(JSON.stringify(phases));
  computeMoteurAlerte(phases, [], {}, null, []);
  const after = JSON.parse(JSON.stringify(phases));
  assert.deepStrictEqual(after, before, 'le moteur d\'alerte ne doit jamais muter les résultats des autres moteurs');
});

test('chaque alerte expose les 3 éléments exigés : pourquoi, quelles variables, quelles vérifications', () => {
  const phases = fakePhases({ braking: { sufficient: false, reason: 'test' } });
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  r.alertes.forEach(a => {
    assert.ok(a.raison, 'raison manquante');
    assert.ok(Array.isArray(a.variablesConcernees), 'variablesConcernees doit être un tableau');
    assert.ok(Array.isArray(a.verificationsRecommandees) && a.verificationsRecommandees.length > 0, 'verificationsRecommandees manquantes');
  });
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

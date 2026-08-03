// Tests unitaires — Synthèse Experte Kinexus (composition des deux niveaux d'analyse).
//
// Décision d'architecture du praticien (04/08) : Profils biomécaniques (Niveau 1, stratégie) et
// Analyse par phase (Niveau 2, priorités) sont deux analyses indépendantes, toujours combinées,
// jamais l'une au détriment de l'autre. Ce fichier vérifie uniquement la couche de composition
// (computeSyntheseExperteKinexus) — les deux analyses sous-jacentes ont leurs propres tests
// (biomechanicalProfileEngine.test.js pour les profils ; le moteur de phase n'a pas encore de
// suite dédiée persistée, vérifié manuellement lors de son développement).
//
// Exécution : node tests/syntheseExperteKinexus.test.js — aucune dépendance externe.
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

// Helper : construit une sortie computeSignatureBiomecanique à partir de percentiles fictifs,
// sans dépendre du moteur de percentile (ce fichier teste la composition, pas le calcul sous-
// jacent, déjà couvert par biomechanicalProfileEngine.test.js).
function fakeProfileResults(scores) {
  return Object.keys(scores).map(nom => ({
    id: nom.toLowerCase(), nom,
    result: { sufficient: scores[nom] != null, percentileGlobal: scores[nom] }
  }));
}

// Helper : construit une sortie minimale de computeSyntheseBiomecanique (Niveau 2) suffisante
// pour computeSyntheseExperteKinexus, qui ne lit que .priorites.principale[0].phase.
function fakeSynthesePhases(phaseLimitanteKey) {
  return { priorites: { principale: phaseLimitanteKey ? [{ phase: phaseLimitanteKey }] : [] } };
}

console.log('Synthèse Experte Kinexus');

test("reproduction de l'exemple du praticien : Propulsif dominant + Braking limitant", () => {
  const signature = computeSignatureBiomecanique(fakeProfileResults({
    Propulsif: 91, Absorbeur: 54, Réactif: 48, Explosif: 43
  }));
  const synthese = computeSyntheseExperteKinexus(fakeSynthesePhases('braking'), signature);
  assert.strictEqual(synthese.profilPhrase, 'Le sportif utilise principalement une stratégie propulsive.');
  assert.strictEqual(synthese.phasePhrase, 'La principale limitation biomécanique concerne la phase de Braking.');
  assert.ok(synthese.syntheseCombinee.includes('dominante propulsive'));
  assert.ok(synthese.syntheseCombinee.includes('phase de Braking'));
  assert.ok(synthese.syntheseCombinee.includes('facteur limitant'));
});

test('accord grammatical correct pour les 5 profils (aucune faute générée automatiquement)', () => {
  const expected = {
    Propulsif: 'dominante propulsive',
    Absorbeur: "dominante d'absorption",
    Réactif: 'dominante réactive',
    Explosif: 'dominante explosive',
    Contrôle: 'dominante de contrôle'
  };
  Object.keys(expected).forEach(dominant => {
    const scores = { Propulsif: 40, Absorbeur: 40, Réactif: 40, Explosif: 40, Contrôle: 40 };
    scores[dominant] = 95;
    const signature = computeSignatureBiomecanique(fakeProfileResults(scores));
    const synthese = computeSyntheseExperteKinexus(fakeSynthesePhases('landing'), signature);
    assert.ok(synthese.syntheseCombinee.includes(expected[dominant]),
      dominant + ' -> attendu "' + expected[dominant] + '" dans: ' + synthese.syntheseCombinee);
  });
});

test('profils insuffisants : juxtapose les deux phrases sans fusionner (jamais inventer)', () => {
  const synthese = computeSyntheseExperteKinexus(fakeSynthesePhases('braking'), { sufficient: false });
  assert.ok(synthese.syntheseCombinee.includes('phase de Braking'));
  assert.ok(synthese.syntheseCombinee.includes('non déterminable'));
  assert.ok(!synthese.syntheseCombinee.includes('dominante'), 'ne doit jamais inventer un profil dominant');
});

test('aucune phase limitante identifiée : phasePhrase le signale explicitement', () => {
  const signature = computeSignatureBiomecanique(fakeProfileResults({ Propulsif: 80, Absorbeur: 78 }));
  const synthese = computeSyntheseExperteKinexus(fakeSynthesePhases(null), signature);
  assert.strictEqual(synthese.phasePhrase, "Aucune phase n'a été identifiée comme facteur limitant biomécanique.");
});

test('signature homogène (aucun profil dominant) : le dit explicitement, jamais un profil inventé', () => {
  const signature = computeSignatureBiomecanique(fakeProfileResults({
    Propulsif: 90, Absorbeur: 89, Réactif: 91, Explosif: 88
  }));
  assert.strictEqual(signature.profilDominant, null);
  const synthese = computeSyntheseExperteKinexus(fakeSynthesePhases('unloading'), signature);
  assert.ok(synthese.profilPhrase.includes('homogène'));
});

test('reglePriorite : toujours présente, rappelle que ni les profils ni les phases ne se substituent', () => {
  const signature = computeSignatureBiomecanique(fakeProfileResults({ Propulsif: 91, Absorbeur: 54, Réactif: 48, Explosif: 43 }));
  const synthese = computeSyntheseExperteKinexus(fakeSynthesePhases('braking'), signature);
  assert.ok(synthese.reglePriorite.includes('jamais'));
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

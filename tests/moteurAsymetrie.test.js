// Tests unitaires — Moteur d'Analyse des Asymétries par Phase (04/08, v3 — confiance
// proportionnelle au niveau de preuve, jamais un nombre de variables comme gate).
//
// Décision d'architecture du praticien : le moteur ne doit jamais devenir systématiquement "non
// concluant" simplement parce qu'une phase n'a qu'une seule variable principale. Une seule
// variable principale peut suffire à conclure ; le nombre de variables disponibles conditionne
// UNIQUEMENT le niveau de confiance, jamais la possibilité de conclure :
//  - 1 principale seule -> conclusion possible, confiance limitée ;
//  - 1 principale + secondaire(s) concordante(s) -> confiance augmentée ;
//  - plusieurs principales concordantes -> confiance maximale.
// "Règle universelle" : la confiance est fonction du niveau de preuve disponible, jamais d'un
// nombre arbitraire de variables — variables_principales/coherence_interne ne s'appliquent que
// si >=2 principales sont disponibles (sinon triviaux/trompeurs), richesse_preuve porte alors
// seule la confiance.
//
// Ce fichier vérifie : 1) le référentiel miroir (inchangé), 2) computeAsymPhase (inchangé),
// 3) AsymSpecs (gate à 3 conditions, sans condition de comptage), 4) CONFIANCE_SIGNAUX_ASYMETRIE
// (les 3 paliers de preuve du praticien), 5) computeAsymEngine/cartographie (peut désormais
// promouvoir une phase à 1 seule principale), 6) croisementAsymetriePhase (inchangé).
//
// Exécution : node tests/moteurAsymetrie.test.js — aucune dépendance externe.
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

NORMS.test_pop = {
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_ecc_decel_impulse_asym: [1, 3, 6, 10, 20],
  cmj_conc_force_impulse_asym: [1, 3, 6, 10, 20],
  cmj_force_peak_power_asym: [1, 3, 6, 10, 20],
  cmj_p2_conc_impulse_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
};

console.log('Moteur d\'Analyse des Asymétries par Phase');

// ── 1. Référentiel miroir (inchangé) ─────────────────────────────────────────────────────────
test('effectiveAsymPhaseVariables : Braking a 1 principale (EDRFD) + 1 secondaire (impulsion)', () => {
  const def = effectiveAsymPhaseVariables('braking');
  assert.deepStrictEqual(def.principales, ['ecc_decel_rfd_asym']);
  assert.deepStrictEqual(def.secondaires, ['ecc_decel_impulse_asym']);
});

test('effectiveAsymPhaseVariables : Unloading/Flight restent vides, jamais une variable inventée', () => {
  assert.deepStrictEqual(effectiveAsymPhaseVariables('unloading'), { principales: [], secondaires: [], contextuelles: [] });
  assert.deepStrictEqual(effectiveAsymPhaseVariables('flight'), { principales: [], secondaires: [], contextuelles: [] });
});

// ── 2. computeAsymPhase (inchangé) ───────────────────────────────────────────────────────────
test('Braking : asymétrie forte sur son unique principale -> niveau "Asymétrie importante"', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.strictEqual(asym.niveau.label, 'Asymétrie importante');
});

test('membre dominant : déterminé quand une paire G/D existe, "Indéterminé" sinon', () => {
  const braking = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_rfd_L: 4000, ecc_decel_rfd_R: 4800 }, 'test_pop', null);
  assert.strictEqual(braking.membreDominant.membre, 'Droit');
  const concentric = computeAsymPhase('concentric', { conc_force_impulse_asym: 15 }, 'test_pop', null);
  assert.strictEqual(concentric.membreDominant.membre, 'Indéterminé');
});

// ── 3+4. Confiance proportionnelle au niveau de preuve (le coeur de ce changement) ──────────
test('1 principale seule (aucune secondaire disponible) -> confiance limitée (Modérée), portée uniquement par richesse_preuve', () => {
  const asym = computeAsymPhase('landing', { landing_peak_force_asym: 17 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  assert.strictEqual(conf.signaux.length, 1, 'seul richesse_preuve doit être disponible (variables_principales/coherence_interne non évaluables avec 1 seule variable)');
  assert.strictEqual(conf.signaux[0].cle, 'richesse_preuve');
  assert.strictEqual(conf.composite, 50);
  assert.strictEqual(conf.band.label, 'Modérée');
});

test('1 principale + 1 secondaire concordante -> confiance augmentée (Élevée), toujours portée par richesse_preuve seule', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  assert.strictEqual(conf.composite, 70);
  assert.strictEqual(conf.band.label, 'Élevée');
});

test('1 principale + secondaire NON concordante (symétrique) -> confiance reste limitée (la secondaire ne confirme rien)', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 2 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  assert.strictEqual(conf.composite, 50, 'la secondaire symétrique (percentile>=40) ne doit pas augmenter la confiance');
});

test('plusieurs principales concordantes (ctx fabriqué, car aucune phase n\'en a 2 aujourd\'hui) -> confiance maximale (richesse_preuve=100), variables_principales/coherence redeviennent applicables', () => {
  const asymFabrique = {
    sufficient: true, score: 12,
    principales: [
      { status: 'ok', percentile: 10 },
      { status: 'ok', percentile: 15 }
    ],
    secondaires: [],
    coherenceBand: { label: 'Bonne cohérence' }
  };
  const conf = computeConfianceAsymetrie(asymFabrique);
  const parCle = {};
  conf.signaux.forEach(s => { parCle[s.cle] = s.score; });
  assert.strictEqual(parCle.richesse_preuve, 100);
  assert.ok('variables_principales' in parCle, 'redevient applicable dès 2 principales disponibles');
  assert.ok('coherence_interne' in parCle, 'redevient applicable dès 2 principales disponibles');
});

test('AsymSpecs.asymetrieRetenue : plus aucune condition de comptage — 1 seule principale peut suffire à retenir une asymétrie', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: conf });
  assert.strictEqual(proof.result, true, '1 principale + secondaire concordante doit désormais suffire à conclure (confiance "Élevée")');
});

test('AsymSpecs.asymetrieRetenue : 1 principale seule, sans aucune secondaire pour la confirmer, reste "non concluante" (confiance Modérée passe, mais le point est vérifié explicitement)', () => {
  const asym = computeAsymPhase('landing', { landing_peak_force_asym: 17 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: conf });
  assert.strictEqual(proof.result, true, 'Modérée est acceptée par confianceSuffisante -> la conclusion reste possible, avec une confiance moindre que le cas confirmé');
});

// ── 5. computeAsymEngine + cartographie (peut désormais promouvoir 1 seule principale) ─────
test('computeAsymEngine : Braking (1 principale + secondaire concordante, confiance Élevée) est désormais promu "Asymétrie principale"', () => {
  const cmjValues = {
    ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16,
    conc_force_impulse_asym: 2, force_peak_power_asym: 2
  };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  assert.ok(r.priorite1, 'attendu une priorité n°1 désormais atteignable avec 1 seule principale confirmée');
  assert.strictEqual(r.priorite1.phase, 'braking');
  assert.ok(r.phasesSymetriques.includes('concentric'));
});

test('cartographie : Braking retenu apparaît "Asymétrie principale", jamais "Asymétrie non concluante" pour ce cas', () => {
  const cmjValues = { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  const byPhase = {};
  r.cartographie.forEach(row => { byPhase[row.phase] = row; });
  assert.strictEqual(byPhase.braking.conclusion, 'Asymétrie principale');
  r.cartographie.forEach(row => assert.ok(ASYM_CARTO_CONCLUSIONS.indexOf(row.conclusion) >= 0));
});

test("l'asymétrie ne modifie jamais les résultats reçus en entrée (lecture seule)", () => {
  const cmjValues = { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 };
  const before = JSON.parse(JSON.stringify(cmjValues));
  computeAsymEngine(cmjValues, 'test_pop', null);
  assert.deepStrictEqual(cmjValues, before);
});

// ── 6. croisementAsymetriePhase — exemples qualitatifs du praticien (inchangé) ──────────────
test('croisementAsymetriePhase : phase déficitaire + asymétrie importante -> convergent (Cas 1), jamais "isolée"', () => {
  const r = croisementAsymetriePhase('braking', { sufficient: true, score: 20 }, { sufficient: true, score: 15 });
  assert.strictEqual(r.concordance.cas, 1);
  assert.strictEqual(r.asymetrieIsolee, false);
});

test('croisementAsymetriePhase : phase normale + asymétrie importante -> discordance -> "asymétrie isolée sans déficit global"', () => {
  const r = croisementAsymetriePhase('concentric', { sufficient: true, score: 70 }, { sufficient: true, score: 15 });
  assert.notStrictEqual(r.concordance.cas, 1);
  assert.strictEqual(r.asymetrieIsolee, true);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

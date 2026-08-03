// Tests unitaires — Moteur d'Analyse des Asymétries par Phase (04/08).
//
// Spécification du praticien : identifier si une asymétrie significative est présente, dans
// quelle phase, quelles variables l'expliquent, et si elle constitue une priorité clinique —
// totalement indépendant des profils biomécaniques, des qualités physiques et des percentiles
// absolus. Réutilise entièrement l'architecture déjà construite (ThresholdBandClassifier,
// Specification Pattern, Moteur de Confiance générique, validateClinicalConcordance) : ce fichier
// vérifie que cette réutilisation fonctionne correctement, pas les primitives elles-mêmes (déjà
// testées dans leurs propres suites).
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

// Population de normes fictive, injectée directement dans NORMS (déjà défini par l'eval), pour
// tester le moteur sans dépendre de données normatives réelles (qui n'existent pas encore pour
// les variables d'asymétrie — gap signalé séparément). Bandes = [p5,p25,p50,p75,p95], valeurs
// brutes croissantes ; la direction 'min' déjà déclarée dans TBK pour ces KPIs fait le reste.
NORMS.test_pop = {
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_ecc_decel_impulse_asym: [1, 3, 6, 10, 20],
  cmj_conc_force_impulse_asym: [1, 3, 6, 10, 20],
  cmj_force_peak_power_asym: [1, 3, 6, 10, 20],
  cmj_p2_conc_impulse_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
};

console.log('Moteur d\'Analyse des Asymétries par Phase');

test('Unloading/Flight : aucune variable de référentiel -> toujours données insuffisantes, jamais une variable inventée', () => {
  const u = computeAsymPhase('unloading', {}, 'test_pop', null);
  const f = computeAsymPhase('flight', {}, 'test_pop', null);
  assert.strictEqual(u.sufficient, false);
  assert.strictEqual(f.sufficient, false);
  assert.ok(u.reason.includes('Aucune variable'));
});

test('Braking : asymétrie forte et cohérente sur les 2 principales -> niveau "Asymétrie importante"', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.ok(asym.score < 25, 'score attendu bas (asymétrie forte), obtenu ' + asym.score);
  assert.strictEqual(asym.niveau.label, 'Asymétrie importante');
  assert.strictEqual(asym.variablesResponsables.length, 2);
});

test('Concentric : quasi-symétrique sur les 2 principales -> niveau "Symétrique", ne doit pas être retenu comme prioritaire', () => {
  const asym = computeAsymPhase('concentric', { conc_force_impulse_asym: 2, force_peak_power_asym: 2 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.ok(asym.score > 75, 'score attendu haut (symétrique), obtenu ' + asym.score);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: computeConfianceAsymetrie(asym) });
  assert.strictEqual(proof.result, false);
});

test('Landing : une seule variable principale disponible -> reste calculable, secondaires vides gérées sans planter', () => {
  const asym = computeAsymPhase('landing', { landing_peak_force_asym: 15 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.strictEqual(asym.principales.length, 1);
  assert.strictEqual(asym.secondaires.length, 0);
  const conf = computeConfianceAsymetrie(asym);
  assert.strictEqual(conf.exclus.some(e => e.cle === 'donnees_secondaires'), true, 'le signal donnees_secondaires doit être exclu (jamais un 0 inventé) quand il n\'y a aucune secondaire définie');
});

test('côté dominant : déterminé quand une paire G/D existe (Braking), "indéterminé" sinon (Concentric)', () => {
  const brakingWithSides = computeAsymPhase('braking', {
    ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16,
    ecc_decel_rfd_L: 4000, ecc_decel_rfd_R: 4800
  }, 'test_pop', null);
  assert.strictEqual(brakingWithSides.coteDominant.cote, 'D', 'RFD plus élevé à droite (dir max) -> côté droit dominant');

  const concentric = computeAsymPhase('concentric', { conc_force_impulse_asym: 15, force_peak_power_asym: 15 }, 'test_pop', null);
  assert.strictEqual(concentric.coteDominant.cote, 'indéterminé', 'aucune paire G/D définie pour les KPIs concentriques -> jamais un côté inventé');
});

test('Moteur de Confiance générique réutilisé fidèlement : mêmes structures que computeIndiceConfiance', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  assert.ok('composite' in conf && 'band' in conf && 'signaux' in conf && 'exclus' in conf);
});

test("computeAsymEngine : classement multi-phases — Braking (forte asymétrie cohérente) prioritaire, Concentric symétrique jamais promu", () => {
  const cmjValues = {
    ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16,
    conc_force_impulse_asym: 2, force_peak_power_asym: 2,
    landing_peak_force_asym: 15
  };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  assert.ok(r.priorite1, 'attendu une priorité n°1');
  assert.strictEqual(r.priorite1.phase, 'braking');
  assert.ok(r.phasesSymetriques.includes('concentric'));
});

test('AsymSpecs.asymetrieRetenue : "asymétrie non concluante" quand la cohérence interne est trop faible malgré un score bas', () => {
  // Les deux principales de Braking tirent dans des sens opposés (une très asymétrique, une très
  // symétrique) -> score global bas mais cohérence interne faible -> jamais retenu tel quel.
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 19, ecc_decel_impulse_asym: 1 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: conf });
  assert.strictEqual(proof.result, false);
  assert.strictEqual(AsymSpecs.coherenceInterneSuffisante.isSatisfiedBy({ asym }).result, false);
});

test('croisementAsymetriePhase : phase déficitaire + asymétrie importante -> convergent (Cas 1), jamais "isolée" (exemple du praticien)', () => {
  const phaseResult = { sufficient: true, score: 20 };
  const asymResult = { sufficient: true, score: 15 };
  const r = croisementAsymetriePhase('braking', phaseResult, asymResult);
  assert.strictEqual(r.concordance.cas, 1);
  assert.strictEqual(r.asymetrieIsolee, false);
});

test('croisementAsymetriePhase : phase normale + asymétrie importante -> discordance -> "asymétrie isolée sans déficit global" (2e exemple du praticien)', () => {
  const phaseResult = { sufficient: true, score: 70 };
  const asymResult = { sufficient: true, score: 15 };
  const r = croisementAsymetriePhase('concentric', phaseResult, asymResult);
  assert.notStrictEqual(r.concordance.cas, 1);
  assert.strictEqual(r.asymetrieIsolee, true);
});

test("l'asymétrie ne modifie jamais les résultats reçus en entrée (lecture seule)", () => {
  const cmjValues = { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 };
  const before = JSON.parse(JSON.stringify(cmjValues));
  computeAsymEngine(cmjValues, 'test_pop', null);
  assert.deepStrictEqual(cmjValues, before);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

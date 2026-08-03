// Tests unitaires — Moteur d'Analyse des Asymétries par Phase (04/08, v2 — miroir du Moteur
// Biomécanique de performance).
//
// Décision d'architecture du praticien : ce moteur doit être le miroir exact du Moteur
// Biomécanique de performance (CMJ_VAR_META) — chaque variable de performance a son équivalent
// d'asymétrie quand celui-ci existe, avec le même rôle conservé (master->principale,
// support->secondaire, info->contextuelle). Une asymétrie ne doit jamais être conclue sur une
// seule variable (>=2 principales convergentes requises). Ce fichier vérifie :
//  1. effectiveAsymPhaseVariables() : la dérivation miroir depuis CMJ_VAR_META.
//  2. computeAsymPhase() : le calcul par phase (score/cohérence/membre dominant).
//  3. AsymSpecs : le gate à 4 conditions, y compris la règle ">=2 principales" testée
//     indépendamment de la disponibilité réelle des données (avec un ctx fabriqué).
//  4. computeAsymEngine()/cartographieAsymetries() : la synthèse structurée par phase.
//  5. croisementAsymetriePhase() : les 2 exemples qualitatifs du praticien (inchangés).
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

// Population de normes fictive (gap réel signalé séparément : aucune norme d'asymétrie n'existe
// encore dans NORMS aujourd'hui). Bandes = [p5,p25,p50,p75,p95], valeurs brutes croissantes.
NORMS.test_pop = {
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_ecc_decel_impulse_asym: [1, 3, 6, 10, 20],
  cmj_conc_force_impulse_asym: [1, 3, 6, 10, 20],
  cmj_force_peak_power_asym: [1, 3, 6, 10, 20],
  cmj_p2_conc_impulse_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
};

console.log('Moteur d\'Analyse des Asymétries par Phase');

// ── 1. Référentiel miroir ────────────────────────────────────────────────────────────────────
test('effectiveAsymPhaseVariables : miroir fidèle de CMJ_VAR_META — Braking a 1 principale (EDRFD) + 1 secondaire (impulsion)', () => {
  const def = effectiveAsymPhaseVariables('braking');
  assert.deepStrictEqual(def.principales, ['ecc_decel_rfd_asym']);
  assert.deepStrictEqual(def.secondaires, ['ecc_decel_impulse_asym']);
});

test('effectiveAsymPhaseVariables : Concentric a 1 principale (conc_force_impulse_asym, fusion VALD) + 1 secondaire + p2 en contextuelle', () => {
  const def = effectiveAsymPhaseVariables('concentric');
  assert.deepStrictEqual(def.principales, ['conc_force_impulse_asym']);
  assert.deepStrictEqual(def.secondaires, ['force_peak_power_asym']);
  assert.ok(def.contextuelles.includes('p2_conc_impulse_asym'));
});

test('effectiveAsymPhaseVariables : Unloading/Flight restent vides (aucun équivalent d\'asymétrie confirmé), jamais une variable inventée', () => {
  assert.deepStrictEqual(effectiveAsymPhaseVariables('unloading'), { principales: [], secondaires: [], contextuelles: [] });
  assert.deepStrictEqual(effectiveAsymPhaseVariables('flight'), { principales: [], secondaires: [], contextuelles: [] });
});

test('effectiveAsymPhaseVariables : Landing n\'a qu\'une seule variable (aucune secondaire possible avec les correspondances confirmées)', () => {
  const def = effectiveAsymPhaseVariables('landing');
  assert.deepStrictEqual(def.principales, ['landing_peak_force_asym']);
  assert.deepStrictEqual(def.secondaires, []);
});

// ── 2. computeAsymPhase() ────────────────────────────────────────────────────────────────────
test('Unloading/Flight : toujours données insuffisantes (0 variable principale)', () => {
  const u = computeAsymPhase('unloading', {}, 'test_pop', null);
  const f = computeAsymPhase('flight', {}, 'test_pop', null);
  assert.strictEqual(u.sufficient, false);
  assert.strictEqual(f.sufficient, false);
});

test('Braking : asymétrie forte sur son unique principale -> niveau "Asymétrie importante", cohérence triviale (une seule valeur)', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.strictEqual(asym.niveau.label, 'Asymétrie importante');
  assert.strictEqual(asym.coherenceInterne, 0, 'stdDevOf sur une seule valeur = 0 (déjà le comportement existant, pas une invention)');
});

test('Concentric : quasi-symétrique -> niveau "Symétrique"', () => {
  const asym = computeAsymPhase('concentric', { conc_force_impulse_asym: 2, force_peak_power_asym: 2 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.ok(asym.score > 75);
});

test('membre dominant : déterminé quand une paire G/D existe (Braking), "Indéterminé" sinon (Concentric, aucune paire connue)', () => {
  const braking = computeAsymPhase('braking', {
    ecc_decel_rfd_asym: 17, ecc_decel_rfd_L: 4000, ecc_decel_rfd_R: 4800
  }, 'test_pop', null);
  assert.strictEqual(braking.membreDominant.membre, 'Droit', 'RFD plus élevé à droite (dir max) -> membre droit dominant');

  const concentric = computeAsymPhase('concentric', { conc_force_impulse_asym: 15 }, 'test_pop', null);
  assert.strictEqual(concentric.membreDominant.membre, 'Indéterminé');
});

// ── 3. AsymSpecs (gate à 4 conditions) ───────────────────────────────────────────────────────
test('CONSÉQUENCE SIGNALÉE : avec les données actuelles (<=1 principale par phase), AsymSpecs.asymetrieRetenue ne peut jamais être vrai', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: conf });
  assert.strictEqual(proof.result, false);
  const detail = AsymSpecs.plusieursVariablesPrincipalesConvergentes.isSatisfiedBy({ asym });
  assert.strictEqual(detail.result, false, 'une seule principale ne peut jamais satisfaire ">=2 convergentes"');
});

test('AsymSpecs.plusieursVariablesPrincipalesConvergentes : la règle elle-même est correcte, vérifiée avec un ctx fabriqué à 2 principales (indépendamment de la disponibilité réelle des données)', () => {
  const asymDeuxPrincipalesConvergentes = {
    principales: [
      { status: 'ok', percentile: 15 },
      { status: 'ok', percentile: 10 }
    ]
  };
  const asymUneSeuleConvergente = {
    principales: [
      { status: 'ok', percentile: 15 },
      { status: 'ok', percentile: 80 }
    ]
  };
  assert.strictEqual(AsymSpecs.plusieursVariablesPrincipalesConvergentes.isSatisfiedBy({ asym: asymDeuxPrincipalesConvergentes }).result, true);
  assert.strictEqual(AsymSpecs.plusieursVariablesPrincipalesConvergentes.isSatisfiedBy({ asym: asymUneSeuleConvergente }).result, false);
});

// ── 4. computeAsymEngine() + cartographie ────────────────────────────────────────────────────
test('computeAsymEngine : Braking visiblement asymétrique mais non concluant (1 seule principale) apparaît en "Asymétrie non concluante", jamais promu prioritaire', () => {
  const cmjValues = {
    ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16,
    conc_force_impulse_asym: 2, force_peak_power_asym: 2,
    landing_peak_force_asym: 3
  };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  assert.strictEqual(r.priorite1, null, 'aucune phase ne peut être promue tant que la règle ">=2 principales" n\'est pas assouplie ou les données enrichies');
  assert.ok(r.nonConcluantes.some(e => e.phase === 'braking'));
  assert.ok(r.phasesSymetriques.includes('concentric'));
  assert.ok(r.phasesSymetriques.includes('landing'));
});

test('cartographie : une ligne par phase, conclusion catégorielle contrôlée (jamais une phrase)', () => {
  const cmjValues = {
    ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16,
    conc_force_impulse_asym: 2, force_peak_power_asym: 2
  };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  assert.strictEqual(r.cartographie.length, 5);
  const byPhase = {};
  r.cartographie.forEach(row => { byPhase[row.phase] = row; });
  assert.strictEqual(byPhase.unloading.conclusion, 'Données insuffisantes');
  assert.strictEqual(byPhase.flight.conclusion, 'Données insuffisantes');
  assert.strictEqual(byPhase.braking.conclusion, 'Asymétrie non concluante');
  assert.strictEqual(byPhase.concentric.conclusion, 'Symétrique');
  ASYM_CARTO_CONCLUSIONS.forEach(() => {}); // référentiel des conclusions valides, sanity import
  r.cartographie.forEach(row => assert.ok(ASYM_CARTO_CONCLUSIONS.indexOf(row.conclusion) >= 0));
});

test("l'asymétrie ne modifie jamais les résultats reçus en entrée (lecture seule)", () => {
  const cmjValues = { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 };
  const before = JSON.parse(JSON.stringify(cmjValues));
  computeAsymEngine(cmjValues, 'test_pop', null);
  assert.deepStrictEqual(cmjValues, before);
});

// ── 5. croisementAsymetriePhase() — exemples qualitatifs du praticien (inchangé) ────────────
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

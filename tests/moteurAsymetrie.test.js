// Tests unitaires — Moteur d'Analyse des Asymétries par Phase.
//
// Décision d'architecture du praticien (04/08, v4) : "les deux moteurs [Biomécanique de
// performance et Asymétrie] doivent rester des miroirs conceptuels — les règles doivent être
// identiques." La classification principale/secondaire/contextuelle d'une variable d'asymétrie
// n'est plus dérivée du tier ÉDITORIAL (master/support) de la variable de performance équivalente
// — elle est désormais DYNAMIQUE, pilotée par la disponibilité réelle de normes d'asymétrie pour
// la population active (effectiveAsymPhaseVariables(phaseKey,pop) + phaseVarHasNorms), exactement
// comme le Moteur Biomécanique de performance. Un plancher ADAPTATIF partagé
// (effectiveMinVariablesPrincipales(totalEligible) = min(2,totalEligible)) protège le score de
// phase : Braking/Concentric (2 variables biomécaniquement pertinentes chacun) exigent 2
// principales normées ; Landing (1 seule variable pertinente, structurellement, pour toujours)
// garde la règle validée le 04/08 "1 principale peut suffire" — jamais une exigence
// structurellement impossible à satisfaire.
//
// CONSÉQUENCE IMPORTANTE testée explicitement ci-dessous : avec le référentiel actuel
// (ASYM_PERFORMANCE_EQUIVALENT), computeAsymPhase ne peut plus jamais être "sufficient" avec
// exactement 1 principale + 1 secondaire simultanément pour Braking/Concentric (soit les 2
// variables sont normées, soit la phase est insuffisante) — le palier intermédiaire de
// CONFIANCE_SIGNAUX_ASYMETRIE ("1 principale + secondaire concordante -> confiance augmentée")
// reste donc en place mais dormant aujourd'hui, testé ici via un contexte fabriqué plutôt que via
// computeAsymPhase (il s'activera automatiquement si une phase reçoit un 3e équivalent
// d'asymétrie confirmé).
//
// Ce fichier vérifie : 1) le référentiel miroir dynamique (nouveau), 2) computeAsymPhase + le
// plancher adaptatif (nouveau), 3) AsymSpecs (gate à 3 conditions, inchangé), 4)
// CONFIANCE_SIGNAUX_ASYMETRIE (les 3 paliers de preuve du praticien, adapté au nouveau plancher),
// 5) computeAsymEngine/cartographie, 6) croisementAsymetriePhase (inchangé).
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

// Couverture COMPLÈTE (les 6 clés d'asymétrie confirmées) — sert à démontrer la promotion
// dynamique et les scénarios "2 principales".
NORMS.test_pop = {
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_ecc_decel_impulse_asym: [1, 3, 6, 10, 20],
  cmj_conc_force_impulse_asym: [1, 3, 6, 10, 20],
  cmj_force_peak_power_asym: [1, 3, 6, 10, 20],
  cmj_p2_conc_impulse_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
};
// Couverture PARTIELLE (uniquement les équivalents historiquement "master") — sert à démontrer
// que le rôle secondaire est bien piloté par l'absence de normes, jamais par un tag figé.
NORMS.test_pop_partiel = {
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_conc_force_impulse_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
  // ecc_decel_impulse_asym et force_peak_power_asym : aucune norme -> restent 'secondaire'.
};

console.log('Moteur d\'Analyse des Asymétries par Phase');

// ── 1. Référentiel miroir DYNAMIQUE (nouveau) ───────────────────────────────────────────────
test('effectiveAsymPhaseVariables : avec couverture partielle, Braking a 1 principale (EDRFD, normée) + 1 secondaire (impulsion, non normée)', () => {
  const def = effectiveAsymPhaseVariables('braking', 'test_pop_partiel');
  assert.deepStrictEqual(def.principales, ['ecc_decel_rfd_asym']);
  assert.deepStrictEqual(def.secondaires, ['ecc_decel_impulse_asym']);
});

test('promotion automatique : la même variable "impulsion" devient principale dès que la population possède ses normes, sans toucher au moteur', () => {
  const defPartiel = effectiveAsymPhaseVariables('braking', 'test_pop_partiel');
  const defComplet = effectiveAsymPhaseVariables('braking', 'test_pop');
  assert.deepStrictEqual(defPartiel.secondaires, ['ecc_decel_impulse_asym']);
  assert.deepStrictEqual(defComplet.principales.sort(), ['ecc_decel_impulse_asym', 'ecc_decel_rfd_asym']);
  assert.deepStrictEqual(defComplet.secondaires, []);
});

test('effectiveAsymPhaseVariables : Unloading/Flight restent vides quelle que soit la population, jamais une variable inventée', () => {
  assert.deepStrictEqual(effectiveAsymPhaseVariables('unloading', 'test_pop'), { principales: [], secondaires: [], contextuelles: [] });
  assert.deepStrictEqual(effectiveAsymPhaseVariables('flight', 'test_pop'), { principales: [], secondaires: [], contextuelles: [] });
});

// ── 2. computeAsymPhase + plancher adaptatif (nouveau) ──────────────────────────────────────
test('Landing (1 seule variable biomécaniquement pertinente, pour toujours) : le plancher adaptatif redescend à 1 -> suffisant avec sa seule principale', () => {
  const asym = computeAsymPhase('landing', { landing_peak_force_asym: 17 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.strictEqual(asym.niveau.label, 'Asymétrie importante');
});

test('Braking (2 variables biomécaniquement pertinentes) : le plancher adaptatif exige 2 -> insuffisant avec 1 seule principale même fortement asymétrique', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, false);
  assert.ok(/minimum requis 2/.test(asym.reason), 'attendu: motif citant le plancher de 2, obtenu: ' + asym.reason);
});

test('Braking : avec ses 2 variables biomécaniquement pertinentes normées et renseignées -> score calculé, aucune secondaire ne subsiste', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  assert.strictEqual(asym.sufficient, true);
  assert.strictEqual(asym.principales.length, 2);
  assert.strictEqual(asym.secondaires.length, 0);
  assert.strictEqual(asym.niveau.label, 'Asymétrie importante');
});

test('membre dominant : déterminé quand une paire G/D existe, "Indéterminé" sinon', () => {
  const braking = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16, ecc_decel_rfd_L: 4000, ecc_decel_rfd_R: 4800 }, 'test_pop', null);
  assert.strictEqual(braking.membreDominant.membre, 'Droit');
  const concentric = computeAsymPhase('concentric', { conc_force_impulse_asym: 15, force_peak_power_asym: 15 }, 'test_pop', null);
  assert.strictEqual(concentric.membreDominant.membre, 'Indéterminé');
});

// ── 3+4. Confiance proportionnelle au niveau de preuve (inchangé dans son principe, adapté au plancher) ──
test('1 principale seule (Landing, aucune secondaire ne peut jamais exister pour cette phase) -> confiance limitée (Modérée), portée uniquement par richesse_preuve', () => {
  const asym = computeAsymPhase('landing', { landing_peak_force_asym: 17 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  assert.strictEqual(conf.signaux.length, 1, 'seul richesse_preuve doit être disponible (variables_principales/coherence_interne non évaluables avec 1 seule variable)');
  assert.strictEqual(conf.signaux[0].cle, 'richesse_preuve');
  assert.strictEqual(conf.composite, 50);
  assert.strictEqual(conf.band.label, 'Modérée');
});

test('richesse_preuve : "1 principale + secondaire concordante -> confiance augmentée" — palier aujourd\'hui dormant pour Braking/Concentric (le plancher adaptatif=2 empêche computeAsymPhase de produire cet état), vérifié via un contexte fabriqué', () => {
  const asymFabrique = {
    sufficient: true, score: 16,
    principales: [{ status: 'ok', percentile: 17 }],
    secondaires: [{ status: 'ok', percentile: 16 }]
  };
  const conf = computeConfianceAsymetrie(asymFabrique);
  assert.strictEqual(conf.composite, 70);
  assert.strictEqual(conf.band.label, 'Élevée');
});

test('richesse_preuve : secondaire NON concordante (symétrique) -> confiance reste limitée (contexte fabriqué, même palier dormant)', () => {
  const asymFabrique = {
    sufficient: true, score: 17,
    principales: [{ status: 'ok', percentile: 17 }],
    secondaires: [{ status: 'ok', percentile: 90 }]
  };
  const conf = computeConfianceAsymetrie(asymFabrique);
  assert.strictEqual(conf.composite, 50, 'la secondaire symétrique (percentile>=40) ne doit pas augmenter la confiance');
});

test('plusieurs principales concordantes -> confiance maximale (richesse_preuve=100) : DÉSORMAIS ATTEIGNABLE RÉELLEMENT via Braking promu à 2 principales (avant le 04/08, ceci nécessitait un contexte fabriqué, aucune phase n\'avait jamais 2 principales)', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const parCle = {};
  conf.signaux.forEach(s => { parCle[s.cle] = s.score; });
  assert.strictEqual(parCle.richesse_preuve, 100);
  assert.ok('variables_principales' in parCle, 'redevient applicable dès 2 principales disponibles');
  assert.ok('coherence_interne' in parCle, 'redevient applicable dès 2 principales disponibles');
});

// ── AsymSpecs.asymetrieRetenue (inchangé) ───────────────────────────────────────────────────
test('AsymSpecs.asymetrieRetenue : Braking promu à 2 principales concordantes -> confiance maximale, asymétrie retenue', () => {
  const asym = computeAsymPhase('braking', { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: conf });
  assert.strictEqual(proof.result, true);
});

test('AsymSpecs.asymetrieRetenue : Landing, 1 principale seule (aucune secondaire possible), reste retenue avec une confiance moindre (règle du 04/08 : jamais un nombre de variables comme gate)', () => {
  const asym = computeAsymPhase('landing', { landing_peak_force_asym: 17 }, 'test_pop', null);
  const conf = computeConfianceAsymetrie(asym);
  const proof = AsymSpecs.asymetrieRetenue.isSatisfiedBy({ asym, confiance: conf });
  assert.strictEqual(proof.result, true, 'Modérée est acceptée par confianceSuffisante -> la conclusion reste possible, avec une confiance moindre que le cas confirmé');
});

// ── 5. computeAsymEngine + cartographie ─────────────────────────────────────────────────────
test('computeAsymEngine : Braking promu à 2 principales concordantes -> "Asymétrie principale" ; Concentric symétrique sur ses 2 principales -> phase symétrique', () => {
  const cmjValues = {
    ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16,
    conc_force_impulse_asym: 2, force_peak_power_asym: 2
  };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  assert.ok(r.priorite1, 'attendu une priorité n°1 (Braking, 2 principales concordantes)');
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

test('cartographie : Braking avec 1 seule valeur renseignée (couverture normative complète mais donnée manquante pour la 2e) -> "Données insuffisantes", jamais une conclusion inventée', () => {
  const cmjValues = { ecc_decel_rfd_asym: 17 };
  const r = computeAsymEngine(cmjValues, 'test_pop', null);
  const byPhase = {};
  r.cartographie.forEach(row => { byPhase[row.phase] = row; });
  assert.strictEqual(byPhase.braking.conclusion, 'Données insuffisantes');
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

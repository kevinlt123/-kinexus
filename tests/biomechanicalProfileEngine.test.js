// Tests unitaires — BiomechanicalProfileEngine (moteur générique des profils biomécaniques).
//
// Aucune dépendance externe (pas de framework de test : l'application n'a pas de système de
// build). Exécution : node tests/biomechanicalProfileEngine.test.js
//
// Le moteur est extrait directement d'index.html (source de vérité unique — ce fichier ne
// redéfinit jamais la logique testée, il l'importe en évaluant le script de la page).
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

// La slice doit couvrir le moteur générique ET ses dépendances déclarées plus loin dans le
// fichier (le référentiel BiomechanicalProfiles, la Signature biomécanique) : le hoisting des
// déclarations de fonction au sein d'un même eval() les rend disponibles quel que soit leur
// ordre, tant qu'elles sont incluses dans la slice.
const start = code.indexOf('var TESTS=[');
const endMarker = '// ── MOTEUR DE SYNTHÈSE BIOMÉCANIQUE ──';
const end = code.indexOf(endMarker);
if (start < 0 || end < 0) throw new Error('Impossible de localiser le moteur dans index.html — vérifier que les repères (var TESTS=[ / ' + endMarker + ') existent toujours.');
const slice = code.slice(start, end);

// Stub minimal de localStorage (le profil de configuration actif se charge au chargement du
// script ; aucun profil sauvegardé en environnement de test -> profil "Par défaut").
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

// Population de normes synthétique : bandes [p5,p25,p50,p75,p95] identiques pour toutes les
// variables de test utilisées ci-dessous, afin de connaître le percentile attendu à l'avance.
NORMS.__test_pop = {
  cmj_var_a: [10, 25, 50, 75, 90],
  cmj_var_b: [10, 25, 50, 75, 90],
  cmj_var_c: [10, 25, 50, 75, 90],
  cmj_var_d: [10, 25, 50, 75, 90],
  cmj_var_e: [10, 25, 50, 75, 90]
};

console.log('BiomechanicalProfileEngine');

test('profil complet (toutes les discriminantes disponibles) : percentileGlobal calculé', () => {
  const def = BiomechanicalProfileDefinition('t1', 'TestComplet', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante'),
    ProfileVariable('cmj:var_c', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 50, 'cmj:var_b': 50, 'cmj:var_c': 50 });
  assert.strictEqual(result.sufficient, true);
  assert.strictEqual(result.percentileGlobal, 50);
  assert.strictEqual(result.discriminantesAvailable, 3);
  assert.strictEqual(result.discriminantesTotal, 3);
});

test('profil avec variables manquantes (confirmatoires absentes) : reste calculable', () => {
  const def = BiomechanicalProfileDefinition('t2', 'TestPartiel', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante')
  ], [
    ProfileVariable('cmj:var_c', 'confirmatoire')
  ], []);
  // var_c absente du dict de percentiles -> doit être ignorée, jamais une équivalence inventée.
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 80, 'cmj:var_b': 80 });
  assert.strictEqual(result.sufficient, true);
  const confEntry = result.entries.find(e => e.variableId === 'cmj:var_c');
  assert.strictEqual(confEntry.available, false);
  assert.strictEqual(confEntry.percentile, null);
  assert.strictEqual(result.percentileGlobal, 80);
});

test('profil sans variables discriminantes : insuffisant, jamais un score inventé', () => {
  const def = BiomechanicalProfileDefinition('t3', 'TestVide', 'desc', [], [
    ProfileVariable('cmj:var_a', 'confirmatoire')
  ], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 90 });
  assert.strictEqual(result.sufficient, false);
  assert.strictEqual(result.percentileGlobal, null);
  assert.ok(/Aucune variable discriminante/.test(result.reason));
});

test('profil hétérogène : cohérence interne faible, conclusion le signale', () => {
  const def = BiomechanicalProfileDefinition('t4', 'TestHeterogene', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 95, 'cmj:var_b': 5 });
  assert.strictEqual(result.sufficient, true);
  assert.ok(['Faible cohérence', 'Très faible cohérence'].includes(result.coherenceBand.label),
    'cohérence attendue faible, obtenu: ' + result.coherenceBand.label);
  assert.strictEqual(result.conclusionAutomatique.heterogene, true);
  assert.ok(result.conclusionAutomatique.text.includes('hétérogène'));
});

test('profil homogène : cohérence interne forte, conclusion ne signale pas d\'hétérogénéité', () => {
  const def = BiomechanicalProfileDefinition('t5', 'TestHomogene', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante'),
    ProfileVariable('cmj:var_c', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 72, 'cmj:var_b': 75, 'cmj:var_c': 78 });
  assert.strictEqual(result.sufficient, true);
  assert.ok(['Très forte cohérence', 'Bonne cohérence'].includes(result.coherenceBand.label),
    'cohérence attendue forte, obtenu: ' + result.coherenceBand.label);
  assert.strictEqual(result.conclusionAutomatique.heterogene, false);
});

test('cohérence interne : valeur numérique = écart-type des percentiles discriminants', () => {
  const def = BiomechanicalProfileDefinition('t6', 'TestStdDev', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 60, 'cmj:var_b': 40 });
  // stdDevOf([60,40]) = écart-type de population = 10
  assert.strictEqual(result.coherenceInterne, 10);
});

test('variables fortes : percentile >= 60 correctement identifiées', () => {
  const def = BiomechanicalProfileDefinition('t7', 'TestFortes', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante'),
    ProfileVariable('cmj:var_c', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 90, 'cmj:var_b': 65, 'cmj:var_c': 50 });
  const fortesIds = result.variablesFortes.map(e => e.variableId).sort();
  assert.deepStrictEqual(fortesIds, ['cmj:var_a', 'cmj:var_b']);
});

test('variables faibles : percentile < 40 correctement identifiées', () => {
  const def = BiomechanicalProfileDefinition('t8', 'TestFaibles', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante'),
    ProfileVariable('cmj:var_c', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 10, 'cmj:var_b': 35, 'cmj:var_c': 60 });
  const faiblesIds = result.variablesFaibles.map(e => e.variableId).sort();
  assert.deepStrictEqual(faiblesIds, ['cmj:var_a', 'cmj:var_b']);
});

test('pondération par rôle : confirmatoire pèse 0.5, descriptive pèse 0 (par défaut)', () => {
  const def = BiomechanicalProfileDefinition('t9', 'TestPoids', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante')
  ], [
    ProfileVariable('cmj:var_b', 'confirmatoire')
  ], [
    ProfileVariable('cmj:var_c', 'descriptive')
  ]);
  // discriminante=100 (poids 1), confirmatoire=0 (poids 0.5), descriptive=0 (poids 0, exclue)
  // attendu : (100*1 + 0*0.5) / (1+0.5) = 66.67
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 100, 'cmj:var_b': 0, 'cmj:var_c': 0 });
  assert.ok(Math.abs(result.percentileGlobal - 66.666667) < 0.01, 'obtenu: ' + result.percentileGlobal);
});

test('poids par défaut robustes même avec profileEngineRoleWeights:{} en config (régression)', () => {
  // Le profil de config "Par défaut" seed profileEngineRoleWeights:{} (objet vide mais présent).
  // Un repli naïf ("cfg.profileEngineRoleWeights || DEFAULT") retomberait sur {} (truthy) et
  // mettrait tous les poids à 0 -> percentileGlobal toujours null. Non-régression explicite.
  const def = BiomechanicalProfileDefinition('t9b', 'TestPoidsDefaut', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante')
  ], [], []);
  const result = BiomechanicalProfileEngine.compute(def, { 'cmj:var_a': 42 });
  assert.strictEqual(result.sufficient, true);
  assert.strictEqual(result.percentileGlobal, 42);
});

test('resolveProfilePercentiles : réutilise normPercentile, ignore les variables absentes/invalides', () => {
  const def = BiomechanicalProfileDefinition('t10', 'TestResolve', 'desc', [
    ProfileVariable('cmj:var_a', 'discriminante'),
    ProfileVariable('cmj:var_b', 'discriminante')
  ], [], []);
  // var_a présente et valide, var_b totalement absente des valeurs de l'athlète.
  const percentiles = resolveProfilePercentiles(def, { cmj: { var_a: 50 } }, '__test_pop', 26);
  assert.strictEqual(percentiles['cmj:var_a'], 50);
  assert.strictEqual('cmj:var_b' in percentiles, false);
});

test('BiomechanicalProfiles : référentiel migré (5 profils, structure Discriminante/Confirmatoire/Descriptive)', () => {
  assert.strictEqual(Array.isArray(BiomechanicalProfiles), true);
  assert.strictEqual(BiomechanicalProfiles.length, 5);
  const ids = BiomechanicalProfiles.map(p => p.id).sort();
  assert.deepStrictEqual(ids, ['absorbeur', 'controle', 'explosif', 'propulsif', 'reactif']);
  BiomechanicalProfiles.forEach(def => {
    assert.ok(def.variablesDiscriminantes.length >= 1, def.nom + ' doit avoir au moins 1 variable discriminante');
    const allRoles = BiomechanicalProfileEngine.listVariables(def).map(v => v.role);
    allRoles.forEach(r => assert.ok(['discriminante', 'confirmatoire', 'descriptive'].includes(r)));
  });
});

test('BiomechanicalProfileEngine : ne référence jamais un nom de profil dans sa propre logique', () => {
  // Vérification structurelle : le moteur ne doit connaître aucun des 5 libellés de profil.
  const engineSource = BiomechanicalProfileEngine.compute.toString() + BiomechanicalProfileEngine.listVariables.toString();
  ['Propulsif', 'Absorbeur', 'Réactif', 'Explosif', 'Contrôle'].forEach(label => {
    assert.ok(!engineSource.includes(label), 'le moteur ne doit jamais mentionner "' + label + '"');
  });
});

test('intégration : computeAllBiomechanicalProfiles + computeSignatureBiomecanique bout en bout', () => {
  // Population de normes synthétique couvrant toutes les variables réellement utilisées par les
  // 5 profils migrés (voir BiomechanicalProfiles), pour un test d'intégration réaliste.
  const vars = ['peak_power', 'peak_vel', 'conc_impulse', 'force_peak_power', 'conc_mean_power',
    'height', 'flight_time', 'force_zero_vel', 'braking_rfd', 'landing_peak_force', 'landing_impulse',
    'ecc_mean_power', 'time_to_stab', 'landing_duration', 'rsi_mod', 'ft_ct_ratio', 'conc_impulse_100',
    'landing_peak_force_asym', 'ecc_decel_rfd_asym', 'force_peak_power_asym', 'depth'];
  const pop = {};
  vars.forEach(v => { pop['cmj_' + v] = [10, 25, 50, 75, 90]; });
  pop.dj_rsi = [1.0, 1.5, 2.0, 2.5, 3.0];
  NORMS.__integration_pop = pop;

  const valuesByTest = {
    cmj: {
      peak_power: 60, peak_vel: 3.0, conc_impulse: 2.6, force_peak_power: 22, conc_mean_power: 40,
      height: 40, flight_time: 570, force_zero_vel: 20, braking_rfd: 3400, landing_peak_force: 36,
      landing_impulse: 2.2, ecc_mean_power: 23, time_to_stab: 0.55, landing_duration: 240,
      rsi_mod: 0.65, ft_ct_ratio: 1.35, conc_impulse_100: 1.2,
      landing_peak_force_asym: 5, ecc_decel_rfd_asym: 6, force_peak_power_asym: 4, depth: 33
    },
    dj: { rsi: 2.2 }
  };

  const profileResults = computeAllBiomechanicalProfiles(valuesByTest, '__integration_pop', 26);
  assert.strictEqual(profileResults.length, 5);
  profileResults.forEach(pr => {
    assert.ok(pr.result.sufficient, pr.nom + ' devrait être calculable avec ce jeu de données complet');
  });

  const signature = computeSignatureBiomecanique(profileResults);
  assert.strictEqual(signature.sufficient, true);
  assert.ok(typeof signature.signature === 'string' && signature.signature.startsWith('Signature biomécanique'));
  assert.ok(Array.isArray(signature.facteursLimitantsRelatifs));
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

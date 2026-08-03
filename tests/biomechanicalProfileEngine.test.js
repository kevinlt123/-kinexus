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
// fichier (testKpiDir, effectiveProfilTier, etc., dans la section historique "PROFILS
// BIOMÉCANIQUES") : le hoisting des déclarations de fonction au sein d'un même eval() les rend
// disponibles quel que soit leur ordre, tant qu'elles sont incluses dans la slice.
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

test('le moteur ne connaît aucun profil par son nom (référentiel vide par défaut)', () => {
  assert.strictEqual(Array.isArray(BiomechanicalProfiles), true);
  assert.strictEqual(BiomechanicalProfiles.length, 0,
    'BiomechanicalProfiles doit rester vide tant que les profils ne sont pas définis avec le praticien');
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

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

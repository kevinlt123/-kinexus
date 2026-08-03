// Tests unitaires — Correctif d'import ForceDecks (04/08).
//
// Décision du praticien : toutes les variables utilisées par les profils biomécaniques doivent
// être importées automatiquement depuis un export ForceDecks réel lorsqu'elles sont présentes
// dans le fichier. Bug réel trouvé en vérifiant cette exigence : conc_peak_force/conc_peak_vel/
// braking_peak_force (clés utilisées par CMJ_VAR_META/TBK pour le test 'cmj') étaient enregistrées
// dans FD_KPI_PATTERNS sous des clés inversées (peak_conc_force/peak_conc_vel/peak_braking_force),
// et de nombreuses variables du référentiel des profils n'avaient tout simplement aucun motif de
// colonne. Ce fichier vérifie que l'import complet fonctionne désormais pour toutes les variables
// utilisées par les 5 profils biomécaniques, sans rien recalculer côté moteur.
//
// Exécution : node tests/importForceDecks.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

// Même repère de départ que les autres suites ('var TESTS=[') : parseCSV/FD_KPI_PATTERNS/
// importForceDecks vivent avant ce repère mais après la directive 'use strict' du tout début du
// fichier — démarrer à 'var TESTS=[' évite d'inclure cette directive dans la portion évaluée
// (sinon eval() s'exécute en mode strict et un eval direct en mode strict n'exporte plus ses
// déclarations var/function vers la portée englobante, cf. bug déjà rencontré dans ce projet).
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

// Construit un CSV ForceDecks minimal à une ligne, pour le test 'CMJ', avec les colonnes fournies.
function fdCsv(cols) {
  const headers = ['Test Type', 'BW [KG]', ...Object.keys(cols)];
  const values = ['CMJ', '80', ...Object.values(cols)];
  return headers.join(',') + '\n' + values.join(',');
}

console.log('Correctif import ForceDecks');

test("bug corrigé : 'Concentric Peak Force' est importé sous la clé conc_peak_force (cmj), plus jamais perdu par l'inversion peak_conc_force", () => {
  const parsed = parseCSV(fdCsv({ 'Concentric Peak Force [N/kg]': '35.2' }));
  const r = importForceDecks(parsed);
  assert.ok(r.cmj, 'le test cmj doit être détecté');
  assert.ok(r.cmj.trials.conc_peak_force, 'conc_peak_force doit être rempli');
  assert.strictEqual(r.cmj.trials.conc_peak_force[0], 35.2);
});

test("bug corrigé : 'Braking Peak Force' est importé sous braking_peak_force (cmj)", () => {
  const parsed = parseCSV(fdCsv({ 'Braking Peak Force [N/kg]': '22.1' }));
  const r = importForceDecks(parsed);
  assert.strictEqual(r.cmj.trials.braking_peak_force[0], 22.1);
});

test("clé historique conservée : 'slcmj' (Single Leg Jump) utilise réellement peak_conc_force — toujours importable", () => {
  // slcmj n'est pas bilatéral -> l'import n'y capte que des colonnes suffixées (L)/(R).
  const headers = ['Test Type', 'BW [KG]', 'Peak Concentric Force [N/kg] (L)', 'Peak Concentric Force [N/kg] (R)'];
  const values = ['SLCMJ', '80', '30.5', '31.2'];
  const parsed = parseCSV(headers.join(',') + '\n' + values.join(','));
  const r = importForceDecks(parsed);
  assert.ok(r.slcmj, 'le test slcmj doit être détecté');
  assert.strictEqual(r.slcmj.G.trials.peak_conc_force[0], 30.5);
  assert.strictEqual(r.slcmj.D.trials.peak_conc_force[0], 31.2);
});

test('toutes les variables principales/secondaires des 5 profils biomécaniques sont importables depuis un export CMJ complet', () => {
  const cols = {
    'Peak Power / BM [W/kg]': '45.0',
    'Concentric Mean Force [N/kg]': '18.2',
    'Concentric Mean Power [W/kg]': '30.1',
    'Concentric Impulse [Ns/kg]': '2.1',
    'Force at Peak Power [N/kg]': '16.0',
    'Force at Zero Velocity [N/kg]': '14.5',
    'Eccentric Deceleration RFD [N/s]': '5200',
    'Eccentric Mean Power [W/kg]': '12.3',
    'Eccentric Deceleration Impulse [Ns/kg]': '1.1',
    'RSI-modified': '0.55',
    'FT:CT Ratio': '1.2',
    'Concentric Impulse 100ms [Ns/kg]': '1.6',
    'Concentric RFD [N/s]': '4100',
    'Concentric Peak Velocity [m/s]': '2.8',
    'Time to Stabilization [s]': '0.45',
    'Peak Landing Force [N/kg]': '28.0',
    'Peak Landing Force (Asym) [%]': '8.5',
    'Post Landing Stability': '0.9'
  };
  const parsed = parseCSV(fdCsv(cols));
  const r = importForceDecks(parsed);
  const expected = {
    peak_power: 45.0, conc_mean_force: 18.2, conc_mean_power: 30.1, conc_impulse: 2.1,
    force_peak_power: 16.0, force_zero_vel: 14.5, braking_rfd: 5200, ecc_mean_power: 12.3,
    braking_impulse: 1.1, rsi_mod: 0.55, ft_ct_ratio: 1.2, conc_impulse_100: 1.6, conc_rfd: 4100,
    conc_peak_vel: 2.8, time_to_stab: 0.45, landing_peak_force: 28.0, landing_peak_force_asym: 8.5,
    post_landing_stability: 0.9
  };
  Object.keys(expected).forEach(k => {
    assert.ok(r.cmj.trials[k], 'kpi manquant après import: ' + k);
    assert.strictEqual(r.cmj.trials[k][0], expected[k], 'valeur incorrecte pour ' + k);
  });
});

test("asymétrie : 'Peak Landing Force (Asym)' ne pollue pas la valeur non-suffixée landing_peak_force", () => {
  const parsed = parseCSV(fdCsv({
    'Peak Landing Force [N/kg]': '28.0',
    'Peak Landing Force (Asym) [%]': '8.5'
  }));
  const r = importForceDecks(parsed);
  assert.strictEqual(r.cmj.trials.landing_peak_force[0], 28.0);
  assert.strictEqual(r.cmj.trials.landing_peak_force_asym[0], 8.5);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

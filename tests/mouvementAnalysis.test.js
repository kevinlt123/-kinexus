// Tests unitaires — computeMouvementAnalysis / phaseEvidence : branchement du Moteur d'Asymétrie (05/08).
//
// Bug réel trouvé en construisant le rapport PDF et le Fil de Raisonnement (fichiers de référence
// UX fournis par le praticien) : computeAsymEngine (déjà figé, déjà testé dans
// moteurAsymetrie.test.js) n'était jamais appelé par computeMouvementAnalysis — MouvementView,
// déjà en production, n'avait donc jamais accès à une conclusion d'asymétrie. En creusant plus
// loin, un second bug empêchait même une correction naïve de fonctionner : resolveCmjValues() ne
// résolvait que les clés de CMJ_VAR_META (les 19+1 variables de phase), jamais les clés
// d'asymétrie ni Gauche/Droite — computeAsymEngine aurait donc toujours reçu un cmjValues vide
// pour ces clés, quelles que soient les données réellement importées.
//
// Ce fichier vérifie les deux correctifs bout en bout : resolveCmjValues résout désormais aussi
// les clés d'asymétrie/G-D, computeMouvementAnalysis expose asymEngine, et phaseEvidence()
// traduit fidèlement la cartographie déjà produite par ce moteur (jamais un nouveau calcul).
//
// Exécution : node tests/mouvementAnalysis.test.js — aucune dépendance externe.
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

console.log('computeMouvementAnalysis / phaseEvidence — branchement du Moteur d\'Asymétrie');

// Population couvrant à la fois les normes de phase (Braking) et les normes d'asymétrie
// correspondantes, pour que la phase ET l'asymétrie soient toutes deux "sufficient".
NORMS.test_mv_pop = {
  cmj_ecc_mean_power: [10, 20, 40, 60, 75],
  cmj_force_zero_vel: [8, 15, 30, 45, 55],
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_ecc_decel_impulse_asym: [1, 3, 6, 10, 20]
};

test("resolveCmjValues résout désormais les clés d'asymétrie et G/D, pas seulement CMJ_VAR_META", () => {
  const bilan = {
    testData: {
      cmj: {
        active: true,
        trials: {
          ecc_mean_power: [40], force_zero_vel: [30],
          ecc_decel_rfd_asym: [17], ecc_decel_impulse_asym: [16],
          ecc_decel_rfd_L: [60], ecc_decel_rfd_R: [70]
        }
      }
    }
  };
  const vals = resolveCmjValues(bilan);
  assert.strictEqual(vals.ecc_decel_rfd_asym, 17, "clé d'asymétrie absente de cmjValues avant le correctif");
  assert.strictEqual(vals.ecc_decel_impulse_asym, 16);
  assert.strictEqual(vals.ecc_decel_rfd_L, 60, 'clé G/D absente de cmjValues avant le correctif');
  assert.strictEqual(vals.ecc_decel_rfd_R, 70);
});

test('computeMouvementAnalysis expose asymEngine (résultat de computeAsymEngine, aucun recalcul)', () => {
  const bilan = { testData: { cmj: { active: true, trials: {
    ecc_mean_power: [40], force_zero_vel: [30],
    ecc_decel_rfd_asym: [17], ecc_decel_impulse_asym: [16]
  } } } };
  const analysis = computeMouvementAnalysis(bilan, 'test_mv_pop', 24);
  assert.ok(analysis.asymEngine, 'asymEngine doit être présent dans le résultat');
  assert.strictEqual(analysis.asymEngine.phases.braking.sufficient, true);
  const carto = analysis.asymEngine.cartographie.find(c => c.phase === 'braking');
  assert.strictEqual(carto.conclusion, 'Asymétrie principale');
});

test("phaseEvidence ajoute une ligne 'Asymétrie' confirmée quand la cartographie retient la phase, avec le membre dominant si connu", () => {
  const bilan = { testData: { cmj: { active: true, trials: {
    ecc_mean_power: [40], force_zero_vel: [30],
    ecc_decel_rfd_asym: [17], ecc_decel_impulse_asym: [16],
    ecc_decel_rfd_L: [60], ecc_decel_rfd_R: [70]
  } } } };
  const analysis = computeMouvementAnalysis(bilan, 'test_mv_pop', 24);
  const preuves = phaseEvidence('braking', analysis);
  const row = preuves.find(p => p.tag === 'Asymétrie');
  assert.ok(row, "aucune ligne 'Asymétrie' trouvée dans les preuves de la phase Braking");
  assert.strictEqual(row.label, 'Asymétrie principale');
  assert.ok(row.val.indexOf('Confirmée') === 0);
  // ecc_decel_rfd_L/R : dir='max' (RFD plus élevé = meilleur) -> R (70) > L (60) -> le membre
  // le plus performant (Droit) est retourné comme "membre dominant" par asymMembreDominant().
  assert.ok(row.val.indexOf('droit') >= 0, "membre dominant attendu 'droit' (R=70 > L=60, dir max) dans le libellé : " + row.val);
});

test("phaseEvidence n'ajoute aucune ligne 'Asymétrie' quand la phase d'asymétrie est elle-même insuffisante (aucune conclusion inventée)", () => {
  const bilan = { testData: { cmj: { active: true, trials: {
    ecc_mean_power: [40], force_zero_vel: [30]
    // Aucune valeur d'asymétrie fournie -> asymEngine.phases.braking.sufficient===false.
  } } } };
  const analysis = computeMouvementAnalysis(bilan, 'test_mv_pop', 24);
  const preuves = phaseEvidence('braking', analysis);
  assert.ok(!preuves.some(p => p.tag === 'Asymétrie'), "une ligne 'Asymétrie' a été ajoutée alors que l'asymétrie de cette phase est insuffisante");
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

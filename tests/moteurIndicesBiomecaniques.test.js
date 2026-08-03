// Tests unitaires — Moteur des Indices Biomécaniques (04/08).
//
// Décision d'architecture du praticien : PAS un "Moteur des Composites" indépendant — les
// indices biomécaniques (RSI-Mod, FT:CT, DSI) ne sont jamais un moteur décisionnel principal, ne
// génèrent jamais seuls une priorité/hypothèse/conclusion. Ils servent uniquement à confirmer,
// nuancer ou contextualiser une conclusion déjà produite par un autre moteur — jamais l'inverse.
// EUR est explicitement reporté en V2 (pas de test Squat Jump dans KINEXUS).
//
// Ce fichier vérifie : 1) computeIndicesBiomecaniques() (résolution RSI-Mod/FT:CT/DSI, données
// manquantes gérées sans invention) ; 2) croisementIndiceConclusion() (les 2 exemples exacts du
// praticien : confirme / nuance).
//
// Exécution : node tests/moteurIndicesBiomecaniques.test.js — aucune dépendance externe.
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

// Normes fictives (gap réel signalé : aucune norme DSI n'existe encore dans NORMS aujourd'hui).
NORMS.test_pop = {
  cmj_rsi_mod: [0.2, 0.35, 0.5, 0.65, 0.9],
  cmj_ft_ct_ratio: [0.5, 0.8, 1.1, 1.4, 1.8]
};

console.log('Moteur des Indices Biomécaniques');

test('RSI-Mod : résolu depuis la variable CMJ déjà existante (aucun recalcul), percentile via normPercentile standard', () => {
  const r = computeIndicesBiomecaniques({ cmj: { rsi_mod: 0.3 } }, 'test_pop', null);
  assert.strictEqual(r.rsi_mod.resultat.sufficient, true);
  assert.strictEqual(r.rsi_mod.resultat.value, 0.3);
  assert.ok(r.rsi_mod.resultat.percentile < 40, 'RSI-Mod bas -> percentile bas');
});

test('FT:CT : même philosophie, variable CMJ existante réinterprétée', () => {
  const r = computeIndicesBiomecaniques({ cmj: { ft_ct_ratio: 1.5 } }, 'test_pop', null);
  assert.strictEqual(r.ft_ct.resultat.sufficient, true);
  assert.ok(r.ft_ct.resultat.percentile > 60);
});

test('DSI : ratio inter-tests CMJ conc_peak_force / IMTP nkg calculé fidèlement', () => {
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 }, imtp: { nkg: 40 } }, 'test_pop', null);
  assert.ok(Math.abs(r.dsi.resultat.value - 0.6) < 1e-9);
});

test('DSI : donnée IMTP manquante -> non exploitable, jamais un ratio inventé', () => {
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 } }, 'test_pop', null);
  assert.strictEqual(r.dsi.resultat.sufficient, false);
});

test('DSI : gap de données signalé — aucune norme DSI dans NORMS aujourd\'hui -> percentile toujours indisponible même avec un ratio valide', () => {
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 }, imtp: { nkg: 40 } }, 'test_pop', null);
  assert.strictEqual(r.dsi.resultat.percentile, null);
  assert.strictEqual(r.dsi.resultat.sufficient, false, 'sans percentile interprétable, l\'indice reste non exploitable pour une comparaison');
  assert.ok(r.dsi.resultat.reason.includes('0.60'), 'le ratio brut doit rester visible dans la raison malgré l\'absence de norme');
});

test("exemple du praticien : Braking déficitaire + RSI-Mod faible -> l'indice CONFIRME (Cas 1, convergent)", () => {
  const indice = { sufficient: true, percentile: 15 };
  const r = croisementIndiceConclusion(indice, 20); // score externe = phase Braking déficitaire (score bas)
  assert.strictEqual(r.concordance.cas, 1);
  assert.strictEqual(r.role, 'confirme');
});

test("exemple du praticien : Concentric performante + DSI faible -> l'indice NUANCE (discordance), jamais une nouvelle conclusion", () => {
  const indice = { sufficient: true, percentile: 15 };
  const r = croisementIndiceConclusion(indice, 85); // score externe = phase Concentric performante (score haut)
  assert.notStrictEqual(r.concordance.cas, 1);
  assert.strictEqual(r.role, 'nuance');
});

test('croisementIndiceConclusion : indice non exploitable -> jamais un rôle inventé', () => {
  const r = croisementIndiceConclusion({ sufficient: false }, 80);
  assert.strictEqual(r.sufficient, false);
  assert.strictEqual(r.role, undefined);
});

test('le moteur des indices ne modifie jamais les données reçues en entrée (lecture seule)', () => {
  const valuesByTest = { cmj: { rsi_mod: 0.3, conc_peak_force: 24 }, imtp: { nkg: 40 } };
  const before = JSON.parse(JSON.stringify(valuesByTest));
  computeIndicesBiomecaniques(valuesByTest, 'test_pop', null);
  assert.deepStrictEqual(valuesByTest, before);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

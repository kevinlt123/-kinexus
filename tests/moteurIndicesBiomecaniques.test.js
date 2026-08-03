// Tests unitaires — Moteur des Indices Biomécaniques (04/08, indice d'expression dynamique
// généricisé — le test isométrique de référence est configurable, jamais l'IMTP câblé en dur).
//
// Décision d'architecture du praticien : PAS un "Moteur des Composites" indépendant — les
// indices biomécaniques (RSI-Mod, FT:CT, Indice d'expression dynamique de la force) ne sont
// jamais un moteur décisionnel principal, ne génèrent jamais seuls une priorité/hypothèse/
// conclusion. Ils servent uniquement à confirmer, nuancer ou contextualiser une conclusion déjà
// produite par un autre moteur — jamais l'inverse. EUR est explicitement reporté en V2 (pas de
// test Squat Jump dans KINEXUS). "DSI" (littérature, spécifique à l'IMTP) n'est plus qu'un cas
// particulier de l'indice d'expression dynamique quand le test configuré est l'IMTP — la
// référence par défaut V1 est désormais Iso Belt Squat.
//
// Ce fichier vérifie : 1) computeIndicesBiomecaniques() (résolution RSI-Mod/FT:CT/indice
// d'expression dynamique, données manquantes gérées sans invention, dénominateur configurable
// avec tables de normes isolées par test) ; 2) croisementIndiceConclusion() (les 2 exemples
// exacts du praticien : confirme / nuance).
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

// Normes fictives (gap réel signalé : aucune norme d'expression dynamique n'existe encore dans
// NORMS aujourd'hui, quel que soit le test isométrique). Table pour Iso Belt Squat (référence V1)
// volontairement absente ici pour vérifier le gap ; une table IMTP est ajoutée pour un des tests
// afin de vérifier que le moteur ne mélange jamais les deux (clé virtuelle "<test>_iedf").
NORMS.test_pop = {
  cmj_rsi_mod: [0.2, 0.35, 0.5, 0.65, 0.9],
  cmj_ft_ct_ratio: [0.5, 0.8, 1.1, 1.4, 1.8],
  imtp_iedf_ratio: [0.5, 0.65, 0.8, 0.95, 1.1]
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

test('Indice d\'expression dynamique : référence par défaut = Iso Belt Squat, jamais IMTP câblé en dur', () => {
  assert.strictEqual(effectiveIndiceExpressionDynamiqueDenominateur(), 'iso_belt_squat');
});

test('Indice d\'expression dynamique : ratio CMJ conc_peak_force / Iso Belt Squat nkg (référence V1) calculé fidèlement', () => {
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 }, iso_belt_squat: { nkg: 40 } }, 'test_pop', null);
  assert.ok(Math.abs(r.indice_expression_dynamique.resultat.value - 0.6) < 1e-9);
  assert.strictEqual(r.indice_expression_dynamique.resultat.denominateurTest, 'iso_belt_squat');
});

test('Indice d\'expression dynamique : donnée du test isométrique manquante -> non exploitable, jamais un ratio inventé', () => {
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 } }, 'test_pop', null);
  assert.strictEqual(r.indice_expression_dynamique.resultat.sufficient, false);
});

test('Indice d\'expression dynamique : gap de données signalé — aucune norme Iso Belt Squat aujourd\'hui -> percentile indisponible même avec un ratio valide', () => {
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 }, iso_belt_squat: { nkg: 40 } }, 'test_pop', null);
  assert.strictEqual(r.indice_expression_dynamique.resultat.percentile, null);
  assert.strictEqual(r.indice_expression_dynamique.resultat.sufficient, false, 'sans percentile interprétable, l\'indice reste non exploitable pour une comparaison');
  assert.ok(r.indice_expression_dynamique.resultat.reason.includes('0.60'), 'le ratio brut doit rester visible dans la raison malgré l\'absence de norme');
});

test('Indice d\'expression dynamique : le dénominateur est configurable — IMTP reste utilisable sans modifier l\'algorithme', () => {
  const cfg = activeBiomecaProfile().config;
  cfg.indiceExpressionDynamiqueDenominateur = 'imtp';
  try {
    const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 }, imtp: { nkg: 30 } }, 'test_pop', null);
    assert.strictEqual(r.indice_expression_dynamique.resultat.denominateurTest, 'imtp');
    assert.ok(Math.abs(r.indice_expression_dynamique.resultat.value - 0.8) < 1e-9);
    // Une table de normes IMTP a été fournie (imtp_iedf_ratio) -> percentile désormais interprétable,
    // preuve que les tables de normes sont bien isolées par test isométrique configuré.
    assert.notStrictEqual(r.indice_expression_dynamique.resultat.percentile, null);
  } finally {
    delete cfg.indiceExpressionDynamiqueDenominateur; // ne pas polluer les autres tests
  }
});

test('Indice d\'expression dynamique : les normes IMTP ne sont jamais réutilisées pour Iso Belt Squat (tables isolées par test)', () => {
  // Table imtp_iedf_ratio existe, mais iso_belt_squat_iedf_ratio n'existe pas -> doit rester
  // indisponible même si un ratio comparable a été renseigné pour IMTP juste avant.
  const r = computeIndicesBiomecaniques({ cmj: { conc_peak_force: 24 }, iso_belt_squat: { nkg: 40 } }, 'test_pop', null);
  assert.strictEqual(r.indice_expression_dynamique.resultat.percentile, null);
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
  const valuesByTest = { cmj: { rsi_mod: 0.3, conc_peak_force: 24 }, iso_belt_squat: { nkg: 40 } };
  const before = JSON.parse(JSON.stringify(valuesByTest));
  computeIndicesBiomecaniques(valuesByTest, 'test_pop', null);
  assert.deepStrictEqual(valuesByTest, before);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

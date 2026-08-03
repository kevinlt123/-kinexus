// Tests unitaires — Moteur d'Alerte (couche transversale, 04/08).
//
// Décision d'architecture du praticien : Confiance / Explication / Alerte forment UNE seule
// architecture. Ce fichier vérifie deux niveaux :
//  1. evaluateAlertRules() : la primitive générique (ne connaît aucune règle métier — reçoit un
//     référentiel de règles (données) + un contexte, et se contente d'exécuter rule.detect(ctx)).
//  2. ALERT_RULES + computeMoteurAlerte() : le référentiel des 5 déclencheurs du praticien et
//     l'adaptateur de domaine qui construit le contexte (dont les confiances par phase, calculées
//     via computeConfianceKinexus — une seule chaîne Confiance -> Alerte, jamais un second calcul).
//
// Important : aucune alerte ne doit contenir de texte rédigé pour le rapport — seulement des
// codes, des identifiants et des données déjà produites par des moteurs antérieurs (passées telles
// quelles comme preuves).
//
// Exécution : node tests/moteurAlerte.test.js — aucune dépendance externe.
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

function fakePhaseResult(cfg) {
  return {
    phase: cfg.phase, sufficient: cfg.sufficient !== false, score: cfg.score,
    reason: cfg.reason || null,
    entries: cfg.entries || [],
    coherenceBand: cfg.coherenceLabel ? { label: cfg.coherenceLabel } : null,
    masterAvailable: cfg.masterAvailable != null ? cfg.masterAvailable : 4,
    masterTotal: cfg.masterTotal != null ? cfg.masterTotal : 4
  };
}
function fakePhases(cfg) {
  const out = {};
  CMJ_PHASES.forEach(p => { out[p] = cfg[p] ? fakePhaseResult(Object.assign({ phase: p }, cfg[p])) : { phase: p, sufficient: true, coherenceBand: { label: 'Bonne cohérence' }, entries: [], masterAvailable: 4, masterTotal: 4 }; });
  return out;
}

console.log('Moteur d\'Alerte');

// ── 1. Primitive générique evaluateAlertRules() ─────────────────────────────────────────────
test('primitive générique : ne connaît aucune règle métier — exécute fidèlement des règles totalement arbitraires', () => {
  const rules = [
    { id: 'toujours', gravite: 'info', verificationCodes: ['X'], detect: () => [{ preuves: { a: 1 }, variablesConcernees: ['a'] }] },
    { id: 'jamais', gravite: 'info', verificationCodes: [], detect: () => [] }
  ];
  const r = evaluateAlertRules(rules, { peuImporte: true });
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].id, 'toujours');
  assert.deepStrictEqual(r.alertes[0].preuves, { a: 1 });
});

test('primitive générique : une règle peut détecter plusieurs occurrences (une alerte par occurrence)', () => {
  const rules = [{ id: 'multi', gravite: 'info', detect: (ctx) => ctx.items.map(i => ({ preuves: { i }, variablesConcernees: [i] })) }];
  const r = evaluateAlertRules(rules, { items: ['x', 'y', 'z'] });
  assert.strictEqual(r.nombre, 3);
});

test('primitive générique : aucune alerte structurée ne contient de champ texte rédigé (contrat "objets structurés uniquement")', () => {
  const rules = [{ id: 'test', gravite: 'moderee', verificationCodes: ['CODE_A'], detect: () => [{ preuves: { valeur: 42 }, variablesConcernees: ['x'] }] }];
  const r = evaluateAlertRules(rules, {});
  const keys = Object.keys(r.alertes[0]);
  assert.deepStrictEqual(keys.sort(), ['gravite', 'id', 'preuves', 'variablesConcernees', 'verificationCodes'].sort());
});

// ── 2. Référentiel ALERT_RULES + adaptateur computeMoteurAlerte() (bilan CMJ) ───────────────
test('ne génère aucune alerte quand tout est cohérent, complet et confiant', () => {
  const phases = fakePhases({});
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  assert.strictEqual(r.nombre, 0);
  assert.deepStrictEqual(r.alertes, []);
});

test('incohérence biomécanique (globalWarnings) -> alerte "incoherence_biomecanique" avec preuves et variables concernées', () => {
  const phases = fakePhases({});
  const warnings = [{ level: 'incoherence_biomecanique', ok: false, blocking: false, check: 'RSI-Mod cohérent avec Jump Height / Contraction Time', variables: ['rsi_mod', 'height', 'tto'], reason: 'RSI-Mod déclaré (2.1) incohérent avec Jump Height (35 cm) et Contraction Time (250 ms).' }];
  const r = computeMoteurAlerte(phases, [], {}, null, warnings);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].id, 'incoherence_biomecanique');
  assert.deepStrictEqual(r.alertes[0].variablesConcernees, ['rsi_mod', 'height', 'tto']);
  assert.strictEqual(r.alertes[0].preuves.check, 'RSI-Mod cohérent avec Jump Height / Contraction Time');
  assert.ok(r.alertes[0].verificationCodes.length > 0);
});

test('conclusions contradictoires entre moteurs (incoherences du Moteur de Raisonnement) -> alerte dédiée', () => {
  const phases = fakePhases({});
  const raisonnement = {
    croisements: [],
    incoherences: [{ profil: 'Propulsif', cible: 'concentric', concordance: { cas: 3, reason: 'Discordance importante.' } }]
  };
  const r = computeMoteurAlerte(phases, [], {}, raisonnement, []);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].id, 'conclusions_contradictoires');
  assert.strictEqual(r.alertes[0].preuves.cas, 3);
  assert.ok(r.alertes[0].variablesConcernees.includes('Propulsif'));
  assert.ok(r.alertes[0].variablesConcernees.includes('concentric'));
});

test('données manquantes (phase insuffisante) -> alerte dédiée reprenant les données déjà calculées (masterAvailable/masterTotal)', () => {
  const phases = fakePhases({ braking: { sufficient: false, reason: 'Données insuffisantes.', masterAvailable: 1, masterTotal: 4 } });
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].id, 'donnees_manquantes_phase');
  assert.strictEqual(r.alertes[0].preuves.phase, 'braking');
});

test('données manquantes (profil insuffisant) -> alerte dédiée', () => {
  const phases = fakePhases({});
  const profiles = [{ id: 'absorbeur', nom: 'Absorbeur', result: { sufficient: false, reason: 'Aucune variable discriminante exploitable.' } }];
  const r = computeMoteurAlerte(phases, profiles, {}, null, []);
  assert.strictEqual(r.nombre, 1);
  assert.strictEqual(r.alertes[0].id, 'donnees_manquantes_profil');
  assert.strictEqual(r.alertes[0].variablesConcernees[0], 'Absorbeur');
});

test('confiance faible (via computeConfianceKinexus, réutilisée et non recalculée) -> alerte dédiée, jamais en doublon d\'une phase déjà insuffisante', () => {
  const phases = fakePhases({
    braking: {
      coherenceLabel: 'Très faible cohérence', masterAvailable: 1, masterTotal: 4,
      entries: [{ tier: 'master', status: 'ok', percentile: 10 }]
    }
  });
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  const confianceAlertes = r.alertes.filter(a => a.id === 'confiance_faible');
  assert.strictEqual(confianceAlertes.length, 1, 'attendu une seule alerte de confiance faible, pour braking');
  assert.strictEqual(confianceAlertes[0].variablesConcernees[0], 'braking');
  // la preuve embarque directement la sortie du Moteur de Confiance (pas un recalcul, pas une phrase)
  assert.ok('composite' in confianceAlertes[0].preuves.confiance);
  assert.ok('band' in confianceAlertes[0].preuves.confiance);
});

test('une alerte ne modifie jamais les résultats passés en entrée (lecture seule)', () => {
  const phases = fakePhases({ braking: { sufficient: false, reason: 'test' } });
  const before = JSON.parse(JSON.stringify(phases));
  computeMoteurAlerte(phases, [], {}, null, []);
  const after = JSON.parse(JSON.stringify(phases));
  assert.deepStrictEqual(after, before, 'le moteur d\'alerte ne doit jamais muter les résultats des autres moteurs');
});

test('chaque alerte expose des codes de vérification contrôlés (pas de phrase) et des variables concernées structurées', () => {
  const phases = fakePhases({ braking: { sufficient: false, reason: 'test' } });
  const r = computeMoteurAlerte(phases, [], {}, null, []);
  r.alertes.forEach(a => {
    assert.ok(Array.isArray(a.variablesConcernees), 'variablesConcernees doit être un tableau');
    assert.ok(Array.isArray(a.verificationCodes), 'verificationCodes doit être un tableau de codes');
    a.verificationCodes.forEach(code => assert.ok(/^[A-Z_]+$/.test(code), 'un code de vérification ne doit jamais être une phrase: ' + code));
  });
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

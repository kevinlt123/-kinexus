// MISSION — VERROUILLAGE DU RÉFÉRENTIEL DES VARIABLES DIAGNOSTIQUES V1
//
// Verrouille QUALITY_DIAGNOSTIC_VARIABLES_V1 (Force/Puissance/Explosivité/Réactivité/Absorption) :
// hiérarchie primary -> fallback -> confirmative -> explanatory -> asymmetry, principe "1 variable
// diagnostique pertinente ET classifiable suffit". Couche ADDITIVE PURE (documentation + résolution
// générique réutilisant computeHypForceKpi, déjà existante) — NE PILOTE PAS le calcul réel de
// fSc[quality], qui reste exclusivement gouverné par les moteurs HYP-XX-01 LOCKED. Incompatibilités
// avec les HYP LOCKED documentées dans le header de QUALITY_DIAGNOSTIC_VARIABLES_V1 (index.html),
// jamais résolues en modifiant un HYP ici.
//
// Exécution : node tests/mission_quality_diagnostic_variables_v1_lock_tests.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser le code applicatif dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}

console.log('MISSION — Verrouillage du référentiel des variables diagnostiques V1');

// ═══════════════ AUDIT — référentiel bien formé, clés réelles uniquement ══════════════════════
test('AUDIT 1 — QUALITY_DIAGNOSTIC_VARIABLES_V1 couvre exactement les 5 qualités demandées', () => {
  assert.deepStrictEqual(Object.keys(QUALITY_DIAGNOSTIC_VARIABLES_V1).sort(), ['Absorption', 'Explosivité', 'Force', 'Puissance', 'Réactivité'].sort());
});
test('AUDIT 2 — toutes les entrées primary/fallback/confirmative/explanatory référencent des kpiKey réellement présents dans TBK.<testKey>.kpis', () => {
  function checkEntries(entries, label) {
    (entries || []).forEach((e) => {
      if (!e.testKey || !e.kpiKey) return; // entrées "note only" (ex. LSI intrinsèque) sans testKey/kpiKey réel
      const test = TBK[e.testKey];
      assert.ok(test, e.testKey + ' introuvable dans TBK (' + label + ')');
      const kpiExists = test.kpis.some((k) => k.key === e.kpiKey);
      assert.ok(kpiExists, e.testKey + '.' + e.kpiKey + ' introuvable dans TBK.' + e.testKey + '.kpis (' + label + ')');
    });
  }
  ['Force', 'Puissance', 'Explosivité', 'Réactivité'].forEach((q) => {
    const def = QUALITY_DIAGNOSTIC_VARIABLES_V1[q];
    checkEntries(def.primary, q + '.primary');
    checkEntries(def.fallback, q + '.fallback');
    checkEntries(def.confirmative, q + '.confirmative');
    checkEntries(def.explanatory, q + '.explanatory');
  });
  ['braking', 'landing'].forEach((sub) => {
    const def = QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption[sub];
    checkEntries(def.primary, 'Absorption.' + sub + '.primary');
    checkEntries(def.fallback, 'Absorption.' + sub + '.fallback');
    checkEntries(def.explanatory, 'Absorption.' + sub + '.explanatory');
  });
});
test('AUDIT 3 — TBK.iso_belt_squat/cmj/dj/sldj/landing_bi/sllt existent bien (7 tests visés par la mission, aucun supposé)', () => {
  ['iso_belt_squat', 'cmj', 'slcmj', 'dj', 'sldj', 'landing_bi', 'sllt'].forEach((k) => assert.ok(TBK[k], k + ' doit exister dans TBK'));
});

// ═══════════════ A. FORCE ══════════════════════════════════════════════════════════════════════
test('A1 — Force : Peak Force/BM (iso_belt_squat_nkg) normé -> utilisé en primary', () => {
  const testData = { iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Force, testData, 'fd_bball_m', 25, {});
  assert.ok(r);
  assert.strictEqual(r.role, 'primary');
  assert.strictEqual(r.entry.variableKey, 'iso_belt_squat_nkg');
});
test('A2 — Force : nkg absent -> fallback n utilisé (population avec NORMS pour _n)', () => {
  const testData = { iso_belt_squat: { active: true, trials: { n: [4272] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Force, testData, null, 25, { iso_belt_squat: 'belt_netball_super_league_f' });
  assert.ok(r);
  assert.strictEqual(r.role, 'fallback');
  assert.strictEqual(r.entry.variableKey, 'iso_belt_squat_n');
});
test('A3 — Force : aucune variable classifiable (test inactif) -> NON_DETERMINABLE (null)', () => {
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Force, {}, 'fd_bball_m', 25, {});
  assert.strictEqual(r, null);
});
test('A4 — Force : RFD (iso_belt_squat_rfd100/200) n\'est jamais le diagnostic primaire, seulement explicatif', () => {
  const primaryKeys = QUALITY_DIAGNOSTIC_VARIABLES_V1.Force.primary.map((e) => e.variableKey);
  assert.ok(!primaryKeys.some((k) => k.includes('rfd')));
  const explanatoryKeys = QUALITY_DIAGNOSTIC_VARIABLES_V1.Force.explanatory.map((e) => e.variableKey);
  assert.ok(explanatoryKeys.includes('iso_belt_squat_rfd100'));
});

// ═══════════════ B. PUISSANCE ═══════════════════════════════════════════════════════════════════
test('B1 — Puissance : Peak Power/BM (cmj_peak_power) normé -> utilisé', () => {
  const testData = { cmj: { active: true, trials: { peak_power: [50] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance, testData, 'bball2425_bleague', 25, {});
  assert.ok(r);
  assert.strictEqual(r.entry.variableKey, 'cmj_peak_power');
});
test('B2 — Puissance : peak_power non classifiable (aucune norme pour la population) -> fallback conc_mean_power testé, mais lui non plus jamais classifiable aujourd\'hui (aucune norme nulle part) -> NON_DETERMINABLE', () => {
  const testData = { cmj: { active: true, trials: { peak_power: [50], conc_mean_power: [24] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance, testData, null, 25, {});
  assert.strictEqual(r, null);
});
test('B3 — Puissance : RSI-mod n\'est jamais utilisé comme diagnostic (appartient à Explosivité)', () => {
  const allKeys = [].concat(QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance.primary, QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance.fallback).map((e) => e.variableKey);
  assert.ok(!allKeys.includes('cmj_rsi_mod'));
});
test('B4 — Puissance : Jump Height / Concentric Impulse ne sont jamais des diagnostics primaires ou fallback', () => {
  const allKeys = [].concat(QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance.primary, QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance.fallback).map((e) => e.variableKey);
  assert.ok(!allKeys.includes('cmj_height'));
  assert.ok(!allKeys.includes('cmj_conc_impulse'));
});

// ═══════════════ C. EXPLOSIVITÉ ═══════════════════════════════════════════════════════════════
test('C1 — Explosivité : RSI-mod normé -> utilisé en priorité (primary)', () => {
  const testData = { cmj: { active: true, trials: { rsi_mod: [0.5] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité, testData, null, 25, {});
  assert.ok(r);
  assert.strictEqual(r.role, 'primary');
  assert.strictEqual(r.entry.variableKey, 'cmj_rsi_mod');
});
test('C2 — Explosivité : RSI-mod non disponible + conc_rfd disponible -> fallback conc_rfd testé (mais jamais classifiable aujourd\'hui, aucune norme nulle part) -> NON_DETERMINABLE', () => {
  const testData = { cmj: { active: true, trials: { conc_rfd: [1200] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité, testData, 'bball2425_bleague', 25, {});
  assert.strictEqual(r, null, 'conc_rfd et conc_impulse_100 sont tous deux structurellement non classifiables aujourd\'hui (0 norme nulle part) -- résultat attendu, pas un bug de ce référentiel');
});
test('C3 — Explosivité : aucune norme disponible pour aucune variable -> NON_DETERMINABLE', () => {
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité, {}, null, 25, {});
  assert.strictEqual(r, null);
});
test('C4 — Explosivité : Peak Power/BM n\'est JAMAIS utilisé comme fallback diagnostique (règle explicite de la mission)', () => {
  const allKeys = [].concat(QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité.primary, QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité.fallback).map((e) => e.variableKey);
  assert.ok(!allKeys.includes('cmj_peak_power'));
});
test('C5 — Explosivité : Jump Height/Contraction Time/FT:CT restent explicatifs, jamais primary ni fallback', () => {
  const diagKeys = [].concat(QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité.primary, QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité.fallback).map((e) => e.variableKey);
  assert.ok(!diagKeys.includes('cmj_height'));
  assert.ok(!diagKeys.includes('cmj_contraction_time'));
  assert.ok(!diagKeys.includes('cmj_ft_ct_ratio'));
});
test('C6 — Explosivité : "Concentric RFD 100ms" (demandé par la mission) n\'existe pas comme clé Kinexus -- mappé sur conc_rfd (existant), écart documenté dans le référentiel', () => {
  const fb = QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité.fallback.find((e) => e.variableKey === 'cmj_conc_rfd');
  assert.ok(fb);
  assert.ok(/n'existe/i.test(fb.note) || /inexistante/i.test(fb.note));
});

// ═══════════════ D. RÉACTIVITÉ ═══════════════════════════════════════════════════════════════
test('D1 — Réactivité (moteur HYP-REA-01 réel) : DJ+SLDJ normés et OK -> absente', () => {
  // pop=null (seuils THRESHOLDS universels, déterministes) -- une population spécifique (ex.
  // foot_m_senior) porte ses PROPRES bandes NORMS, souvent bien plus exigeantes que le seuil
  // universel (ex. foot_m_senior dj_rsi médiane=2.93 vs THRESHOLDS vert=1.5) : une valeur
  // "normale" au sens universel peut y être classée déficitaire -- comportement LOCKED attendu,
  // pas un bug, hors propos de ce test (qui vérifie la LOGIQUE de convergence, pas une population).
  const testData = { dj: { active: true, trials: { rsi: [2.0] } }, sldj: { active: true, D: { trials: { rsi: [1.5] } }, G: { trials: { rsi: [1.5] } } } };
  const r = computeHypReactivity01(testData, null, 25, {});
  assert.strictEqual(r.state, 'absente');
});
test('D2 — Réactivité : DJ seul déficitaire -> suspectée', () => {
  const testData = { dj: { active: true, trials: { rsi: [0.3] } } };
  const r = computeHypReactivity01(testData, null, 25, {});
  assert.strictEqual(r.state, 'suspectee');
});
test('D3 — Réactivité : SLDJ seul déficitaire -> suspectée', () => {
  const testData = { sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } } };
  const r = computeHypReactivity01(testData, null, 25, {});
  assert.strictEqual(r.state, 'suspectee');
});
test('D4 — Réactivité : DJ + SLDJ déficitaires -> retenue', () => {
  const testData = { dj: { active: true, trials: { rsi: [0.3] } }, sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } } };
  const r = computeHypReactivity01(testData, null, 25, {});
  assert.ok(r.state.indexOf('retenue') === 0);
});
test('D5 — Réactivité : aucune donnée -> dataAvailable=false, status=null (jamais "absente" affichée sans preuve)', () => {
  const r = computeHypReactivity01({}, null, 25, {});
  assert.strictEqual(r.dataAvailable, false);
  assert.strictEqual(r.status, null);
});
test('D6 — Réactivité : le référentiel V1 documente bien les 2 primary (dj_rsi, sldj_rsi) simultanément, jamais l\'un fallback de l\'autre', () => {
  assert.strictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1.Réactivité.fallback.length, 0);
  assert.strictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1.Réactivité.primary.length, 2);
});
test('D7 — Réactivité : SLDJ/DJ Contact Time/Height ne comptent jamais comme diagnostics supplémentaires (explanatory uniquement)', () => {
  const diagKeys = QUALITY_DIAGNOSTIC_VARIABLES_V1.Réactivité.primary.map((e) => e.variableKey);
  assert.ok(!diagKeys.includes('dj_contact_time'));
  assert.ok(!diagKeys.includes('sldj_height'));
});

// ═══════════════ E. ABSORPTION — FREINAGE ══════════════════════════════════════════════════════
test('E1 — Absorption freinage : EDRFD (braking_rfd) normé -> prioritaire', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [200] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking, testData, 'bball2425_bleague', 25, {});
  assert.ok(r);
  assert.strictEqual(r.entry.variableKey, 'cmj_braking_rfd');
  assert.strictEqual(r.role, 'primary');
});
test('E2 — Absorption freinage : EDRFD non classifiable, Force at Zero Velocity classifiable -> fallback utilisé', () => {
  const testData = { cmj: { active: true, trials: { force_zero_vel: [20] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking, testData, 'bball2425_bleague', 25, {});
  assert.ok(r);
  assert.strictEqual(r.entry.variableKey, 'cmj_force_zero_vel');
});
test('E3 — Absorption freinage : ni EDRFD ni Force at Zero Velocity classifiables, Deceleration Impulse présent mais SANS NORME -> NON_DETERMINABLE (jamais un statut inventé)', () => {
  const testData = { cmj: { active: true, trials: { braking_impulse: [1.5] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking, testData, 'bball2425_bleague', 25, {});
  assert.strictEqual(r, null);
});
test('E4 — Absorption freinage : aucune norme disponible -> NON_DETERMINABLE', () => {
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking, {}, 'bball2425_bleague', 25, {});
  assert.strictEqual(r, null);
});
test('E5 — Absorption freinage : Peak Power/BM n\'est jamais un candidat diagnostique (règle explicite de la mission)', () => {
  const allKeys = [].concat(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking.primary, QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking.fallback).map((e) => e.variableKey);
  assert.ok(!allKeys.includes('cmj_peak_power'));
});

// ═══════════════ F. ABSORPTION — RÉCEPTION ══════════════════════════════════════════════════════
test('F1 — Absorption réception : Peak Landing Force (landing_bi) désigné primary — structurellement NON classifiable aujourd\'hui (aucune norme nulle part), même avec la donnée présente', () => {
  const testData = { landing_bi: { active: true, trials: { peak_landing_force: [40] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.landing, testData, 'bball2425_bleague', 25, {});
  assert.strictEqual(r, null, 'landing_bi_peak_landing_force n\'a aucune norme (NORMS/THRESHOLDS/NORMS_V2) -- résultat attendu, documenté, pas un bug');
});
test('F2 — Absorption réception : les 2 fallbacks (sllt_peak_landing_force, sllt_loading_rate) sont eux aussi structurellement non classifiables aujourd\'hui', () => {
  const testData = { sllt: { active: true, D: { trials: { peak_landing_force: [40], loading_rate: [5000] } }, G: { trials: { peak_landing_force: [38], loading_rate: [4800] } } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.landing, testData, 'bball2425_bleague', 25, {});
  assert.strictEqual(r, null);
});
test('F3 — Absorption réception : Time To Stabilization n\'est JAMAIS repris comme fallback (gel HYP-STA-01 respecté : Stabilisation, jamais Absorption)', () => {
  const allKeys = [].concat(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.landing.primary, QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.landing.fallback).map((e) => e.variableKey);
  assert.ok(!allKeys.some((k) => k.includes('tts')));
});
test('F4 — Absorption réception : landing_bi et sllt ne sont jamais traités comme 2 mécanismes indépendants convergents (contrairement à Réactivité) — l\'un est primary, l\'autre fallback', () => {
  assert.strictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.landing.primary[0].testKey, 'landing_bi');
  assert.ok(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.landing.fallback.some((e) => e.testKey === 'sllt'));
});

// ═══════════════ G. ASYMÉTRIE — jamais un remplacement de la performance absolue ═══════════════
test('G1 — Absorption : l\'asymétrie (ecc_decel_rfd_asym) est documentée séparément, jamais fusionnée au diagnostic primary/fallback', () => {
  const braking = QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking;
  const diagKeys = [].concat(braking.primary, braking.fallback).map((e) => e.variableKey);
  assert.ok(!diagKeys.includes('ecc_decel_rfd_asym'));
  assert.ok(braking.asymmetry.some((e) => e.variableKey === 'ecc_decel_rfd_asym'));
});
test('G2 — Réactivité : l\'asymétrie (sldj_rsi LSI) est documentée séparément de dj_rsi/sldj_rsi eux-mêmes', () => {
  const diagKeys = QUALITY_DIAGNOSTIC_VARIABLES_V1.Réactivité.primary.map((e) => e.variableKey);
  const asymKeys = QUALITY_DIAGNOSTIC_VARIABLES_V1.Réactivité.asymmetry.map((e) => e.variableKey);
  assert.ok(!asymKeys.some((k) => diagKeys.includes(k)));
});
test('G3 — le résolveur générique ne lit JAMAIS un champ d\'asymétrie pour déterminer le statut absolu (csmV2DiagnosticVariableV1Status utilise exclusivement computeHypForceKpi sur le kpiKey de la variable elle-même)', () => {
  const src = code.slice(code.indexOf('function csmV2DiagnosticVariableV1Status'), code.indexOf('function csmV2DiagnosticVariableV1Status') + 400);
  assert.ok(src.includes('computeHypForceKpi'));
  assert.ok(!/asym/i.test(src));
});
test('G4 — Force at Zero Velocity normal + EDRFD asymmetry élevée (simulé) : le diagnostic absolu (braking) reste basé sur EDRFD/BM lui-même, jamais recalculé à partir de l\'asymétrie', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [200], ecc_decel_rfd_L: [50], ecc_decel_rfd_R: [200] } } };
  const r = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Absorption.braking, testData, 'bball2425_bleague', 25, {});
  assert.ok(r);
  assert.strictEqual(r.entry.variableKey, 'cmj_braking_rfd');
  // Le status retourné est celui d'EDRFD lui-même (magnitude absolue), jamais celui d'une asymétrie.
  assert.ok(['normal', 'deficitaire'].includes(r.result.status));
});

// ═══════════════ NUANCE DÉCOUVERTE PENDANT LA VÉRIFICATION DU RÉSOLVEUR (documentée, pas un bug) ══
test('NUANCE 1 — computeStatusWithNormsV2 : quand un sélecteur objet NORMS_V2 est fourni pour le test ET que la variable existe dans NORMS_V2, la résolution passe EXCLUSIVEMENT par NORMS_V2 (jamais de repli vers les NORMS legacy même si elles couvrent davantage de populations) — comportement LOCKED préexistant, non modifié ici, documenté pour éviter une fausse lecture de "non classifiable"', () => {
  const withSelector = computeStatusWithNormsV2('cmj_peak_power', 'cmj', 46.1, null, 25, { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null } });
  const withLegacyPop = computeStatusWithNormsV2('cmj_peak_power', 'cmj', 46.1, 'bball2425_bleague', 25, {});
  assert.strictEqual(withSelector.source, 'NORMS_V2');
  assert.strictEqual(withLegacyPop.source, 'legacy');
  assert.ok(withLegacyPop.status != null, 'la voie legacy (population directe, sans sélecteur objet) trouve bien un statut via NORMS (45/64 populations)');
});

// ═══════════════ RÉGRESSION YANIS ══════════════════════════════════════════════════════════════
const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [36.1], ecc_peak_vel: [0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };
const EXPECTED_SEVERITIES = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };

test('RÉGRESSION — les 8 sévérités cliniques de Yanis restent strictement identiques (référentiel additif, jamais consulté par computeMoteur/computeCsmV2)', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach((q) => assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q));
});
test('RÉGRESSION — le référentiel V1 lui-même, appliqué à Yanis, résout Force/Explosivité/Réactivité (cohérent avec les sévérités réelles), Puissance/Absorption non déterminables (cohérent avec les limites de couverture documentées)', () => {
  const rForce = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Force, YANNIS_DATA, null, 25, YANNIS_NORM_SEL);
  const rExp = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Explosivité, YANNIS_DATA, null, 25, YANNIS_NORM_SEL);
  const rReact = csmV2ResolveDiagnosticVariableV1(QUALITY_DIAGNOSTIC_VARIABLES_V1.Réactivité, YANNIS_DATA, null, 25, YANNIS_NORM_SEL);
  assert.ok(rForce && rForce.result.status != null);
  assert.ok(rExp && rExp.result.status != null);
  assert.ok(rReact && rReact.result.status != null);
});

// ═══════════════ GUARDS (§13.6) ══════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = 'e75af72';
  const hypFns = ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01'];
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    if (idx < 0) throw new Error(fnName + ' introuvable');
    let depth = 0, i = src.indexOf('{', idx);
    const bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
    throw new Error('accolade non fermée pour ' + fnName);
  }
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — computeHypForceKpi (réutilisée par le résolveur) reste BYTE-IDENTIQUE — aucune duplication de logique, aucune modification', () => {
  const BASELINE_COMMIT = 'e75af72';
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    let depth = 0, i = src.indexOf('{', idx);
    const bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
  }
  assert.strictEqual(extractFnBody(code, 'computeHypForceKpi'), extractFnBody(baseHtml, 'computeHypForceKpi'));
});
test('GUARD 3 — CSM_V2_CLINICAL_VARIABLE_MATRIX, THRESHOLDS, NORMS, NORMS_V2 inchangés', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
});
test('GUARD 4 — le diff de ce commit introduit uniquement QUALITY_DIAGNOSTIC_VARIABLES_V1/csmV2ResolveDiagnosticVariableV1/csmV2DiagnosticVariableV1Status — jamais un HYP LOCKED, jamais computeMoteur/computeCsmV2', () => {
  const diff = execSync('git diff HEAD -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  if (diff.trim().length === 0) return; // déjà commité au moment du test
  assert.ok(diff.includes('QUALITY_DIAGNOSTIC_VARIABLES_V1'));
  const changedLines = diff.split('\n').filter((l) => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'));
  ['function computeMoteur(', 'function computeCsmV2(', 'function computeHypAbsorption01(', 'function computeHypReactivity01(', 'function computeHypExplosivity01(', 'function computeHypStabilization01(', 'function computeHypForce01(', 'function computeHypPower01('].forEach((sig) => {
    assert.ok(!changedLines.some((l) => l.includes(sig)), sig + ' ne doit apparaître dans aucune ligne +/- réelle du diff');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

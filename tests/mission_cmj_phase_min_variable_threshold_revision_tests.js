// RÉVISION VALIDÉE PAR LE PRATICIEN — seuil minimum de variables principales pour qu'une phase CMJ
// soit exploitable (Moteur Biomécanique de performance) : 2 -> 1.
//
// CONTEXTE : l'audit de couverture NORMS (conversation praticien) a montré que Concentric et
// Landing ne dépassent JAMAIS 1 variable principale normée, dans AUCUNE des 64 populations du
// catalogue NORM_POPULATIONS — un plancher à 2 (règle initiale du praticien, 04/08) rendait donc
// ces 2 phases structurellement et définitivement inexploitables, quelle que soit la population
// choisie pour le patient. Le praticien a explicitement validé le passage à 1 variable minimum
// ("Non 1 variable c'est ok").
//
// PORTÉE DU CHANGEMENT (scopée au strict nécessaire, additive/config uniquement) :
//   - defaultBiomecaProfilesState().profiles[0].config.minVariablesPrincipales : 2 -> 1
//   - effectiveMinVariablesPrincipales() : valeur de repli (cfg.minVariablesPrincipales==null) : 2 -> 1
// AUCUN autre seuil, NORME, moteur HYP-XX-01 ou structure CSM V2 touché. Le Moteur Biomécanique de
// performance (computeBiomecaPhase/computeBiomecaEngine) et le Moteur des Qualités cliniques
// (computeMoteur/computeCsmV2/HYP-XX-01) restent deux pipelines strictement séparés (déjà établi
// dans les missions précédentes) : ce changement ne peut donc, par construction, avoir aucun
// impact sur les sévérités cliniques des 8 qualités.
//
// Exécution : node tests/mission_cmj_phase_min_variable_threshold_revision_tests.js
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

console.log('RÉVISION — seuil minimum de variables principales CMJ (2 -> 1), validé par le praticien');

// Valeurs CMJ plausibles (dans CMJ_PLAUSIBLE_RANGE) pour TOUTES les variables master/support des 5
// phases — le but est d'isoler l'effet de la COUVERTURE NORMS de la population, jamais d'être
// limité par les données du sujet lui-même.
const CMJ_VALUES_ALL_PLAUSIBLE = {
  depth: 35, ecc_peak_vel: 0.9, ecc_duration: 350, ecc_mean_power: 20, force_zero_vel: 20,
  braking_rfd: 200, braking_impulse: 1.5, braking_duration: 180, ecc_peak_power: 15,
  peak_power: 50, conc_mean_force: 25, conc_impulse_100: 1.0, conc_impulse: 1.2, force_peak_power: 25,
  height: 32, ft_ct_ratio: 1.1, rsi_mod: 0.6, flight_time: 550,
  landing_peak_force: 40, time_to_stab: 1.0, landing_impulse: 1.5
};

// ═══════════════ TEST 1-2 — le nouveau seuil par défaut est bien 1 (plus 2) ═══════════════════
test('TEST 1 — defaultBiomecaProfilesState().profiles[0].config.minVariablesPrincipales === 1', () => {
  assert.strictEqual(defaultBiomecaProfilesState().profiles[0].config.minVariablesPrincipales, 1);
});
test('TEST 2 — effectiveMinVariablesPrincipales() (sans totalEligible, config non surchargée) === 1', () => {
  assert.strictEqual(effectiveMinVariablesPrincipales(), 1);
});
test('TEST 3 — effectiveMinVariablesPrincipales(totalEligible) : plancher adaptatif toujours min(1,totalEligible), jamais >1', () => {
  assert.strictEqual(effectiveMinVariablesPrincipales(5), 1);
  assert.strictEqual(effectiveMinVariablesPrincipales(1), 1);
  assert.strictEqual(effectiveMinVariablesPrincipales(0), 0); // aucune variable éligible par nature -> jamais une exigence impossible
});

// ═══════════════ TEST 4-6 — Concentric/Landing, jamais exploitables avec seuil=2, le deviennent
// avec seuil=1 dès qu'1 seule variable est normée+disponible pour la population ═══════════════
test('TEST 4 — Concentric (bball2425_ncaa_m, 1 seule variable normée = peak_power) devient exploitable', () => {
  const r = computeBiomecaPhase('concentric', CMJ_VALUES_ALL_PLAUSIBLE, 'bball2425_ncaa_m', 25);
  assert.strictEqual(r.sufficient, true);
  assert.strictEqual(r.masterAvailable, 1);
  assert.ok(r.score != null && r.score >= 0 && r.score <= 100, 'un percentile de phase doit être produit');
});
test('TEST 5 — Landing (bball2425_ncaa_m, 1 seule variable normée = landing_peak_force) devient exploitable', () => {
  const r = computeBiomecaPhase('landing', CMJ_VALUES_ALL_PLAUSIBLE, 'bball2425_ncaa_m', 25);
  assert.strictEqual(r.sufficient, true);
  assert.strictEqual(r.masterAvailable, 1);
});
test('TEST 6 — bball2425_ncaa_m atteint désormais 5/5 phases exploitables (percentile + delta réels sur toutes les phases)', () => {
  const eng = computeBiomecaEngine(CMJ_VALUES_ALL_PLAUSIBLE, 'bball2425_ncaa_m', 25);
  const sufficientCount = CMJ_PHASES.filter((p) => eng.phases[p].sufficient).length;
  assert.strictEqual(sufficientCount, 5);
  CMJ_PHASES.forEach((p) => {
    assert.ok(eng.phases[p].delta !== undefined, p + ' doit avoir un delta relatif calculé (comparaison de position entre phases)');
  });
});

// ═══════════════ TEST 7 — la population ACTUELLE de Yanis (college_swim_m) gagne Concentric sans
// changer de population (2/5 au lieu d'1/5) ═══════════════════════════════════════════════════
test('TEST 7 — college_swim_m (population actuelle de Yanis) : Concentric devient exploitable en plus de Flight (2/5, était 1/5)', () => {
  const eng = computeBiomecaEngine(CMJ_VALUES_ALL_PLAUSIBLE, 'college_swim_m', 25);
  assert.strictEqual(eng.phases.flight.sufficient, true);
  assert.strictEqual(eng.phases.concentric.sufficient, true);
  assert.strictEqual(eng.phases.unloading.sufficient, false); // 0 variable normée pour cette population -> reste non exploitable, à raison
  assert.strictEqual(eng.phases.braking.sufficient, false);
  assert.strictEqual(eng.phases.landing.sufficient, false);
  const sufficientCount = CMJ_PHASES.filter((p) => eng.phases[p].sufficient).length;
  assert.strictEqual(sufficientCount, 2);
});

// ═══════════════ TEST 8 — foot_m_senior : 4/5 (tout sauf Landing, qui n'a AUCUNE variable normée
// dans ce fichier, pas même 1 — 1 variable minimum ne peut jamais produire quelque chose ex nihilo) ══
test('TEST 8 — foot_m_senior atteint 4/5 (Landing reste non exploitable : 0 variable normée disponible, jamais forcé à 1)', () => {
  const eng = computeBiomecaEngine(CMJ_VALUES_ALL_PLAUSIBLE, 'foot_m_senior', 25);
  const sufficientCount = CMJ_PHASES.filter((p) => eng.phases[p].sufficient).length;
  assert.strictEqual(sufficientCount, 4);
  assert.strictEqual(eng.phases.landing.sufficient, false);
  assert.strictEqual(eng.phases.landing.masterAvailable, 0);
});

// ═══════════════ TEST 9 — garde-fou : 0 variable normée reste TOUJOURS non exploitable, même avec
// le seuil abaissé à 1 — jamais un percentile de phase produit sans aucune preuve ═════════════
test('TEST 9 — 0 variable normée pour une phase -> reste non exploitable (seuil=1 n\'invente jamais une preuve absente)', () => {
  const r = computeBiomecaPhase('landing', CMJ_VALUES_ALL_PLAUSIBLE, 'foot_m_senior', 25);
  assert.strictEqual(r.sufficient, false);
  assert.strictEqual(r.score, null);
  assert.ok(/insuffisantes/i.test(r.reason));
});

// ═══════════════ TEST 10 — aucune donnée patient du tout (testData vide) reste 0/0, jamais
// transformé en faux positif par le nouveau seuil ══════════════════════════════════════════════
test('TEST 10 — aucune valeur CMJ fournie (patient sans données) -> phase reste non exploitable, 0/0', () => {
  const r = computeBiomecaPhase('flight', {}, 'bball2425_ncaa_m', 25);
  assert.strictEqual(r.sufficient, false);
  assert.strictEqual(r.masterAvailable, 0);
});

// ═══════════════ TEST 11 — le Moteur d'Asymétrie (déjà doté d'un plancher adaptatif à 1 pour les
// phases structurellement mono-variable) n'est ni cassé ni redondant avec cette révision ═══════
test('TEST 11 — effectiveAsymPhaseVariables reste inchangée dans son comportement (fonction non touchée par cette révision)', () => {
  const r1 = effectiveAsymPhaseVariables('landing', 'foot_f_senior');
  assert.ok(Array.isArray(r1.principales) && Array.isArray(r1.secondaires) && Array.isArray(r1.contextuelles));
});

// ═══════════════ TEST 12-13 — régression Yanis : les 8 sévérités cliniques restent strictement
// identiques (le Moteur Biomécanique et le Moteur des Qualités sont deux pipelines séparés) ════
const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_CMJ_SELECTION = { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null };
const YANNIS_NORM_SEL = { cmj: YANNIS_CMJ_SELECTION, iso_belt_squat: 'belt_netball_super_league_f' };
const EXPECTED_SEVERITIES = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };

test('TEST 12 — régression Yanis : les 8 sévérités cliniques restent strictement identiques', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach((q) => { assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q); });
});
test('TEST 13 — qualityDiagnosticSufficiency (fix précédent) reste cohérent, non affecté par cette révision (pipelines séparés)', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  ['Mobilité', 'Réactivité', 'Force', 'Stabilisation'].forEach((q) => {
    assert.strictEqual(csm.qualityDiagnosticSufficiency[q].sufficientDiagnosticEvidence, true);
  });
});

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = '9bd8568';
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
test('GUARD 2 — THRESHOLDS/NORMS/NORMS_V2/CSM_V2_CLINICAL_VARIABLE_MATRIX inchangés (révision scopée au seul seuil de phase CMJ)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
});
test('GUARD 3 — CMJ_VAR_META, ASYM_PERFORMANCE_EQUIVALENT, NORM_POPULATIONS (64) inchangés (aucune variable/population ajoutée ou retirée)', () => {
  assert.strictEqual(NORM_POPULATIONS.length, 64);
  assert.ok(CMJ_VAR_META.braking_rfd && CMJ_VAR_META.braking_rfd.phase === 'braking' && CMJ_VAR_META.braking_rfd.weight === 2.0);
  assert.ok(ASYM_PERFORMANCE_EQUIVALENT.braking_rfd === 'ecc_decel_rfd_asym');
});
test('GUARD 4 — le commit de CETTE révision (18a6a3c) touchait bien la config du seuil minVariablesPrincipales — fait historique immuable, vérifié sur ce commit précis (une mission ULTÉRIEURE distincte et explicitement validée a depuis modifié index.html ailleurs — attendu, hors périmètre de cette garde)', () => {
  const diff = execSync('git diff 18a6a3c~1 18a6a3c -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.ok(diff.includes('minVariablesPrincipales'));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

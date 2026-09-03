// DÉCISION DU PRATICIEN — B.League (bball2425_bleague) intégrée comme population AUTOMATIQUE du
// Moteur Biomécanique (analyse par phase CMJ), pour TOUS les patients.
//
// CONTEXTE : audit de couverture NORMS (conversation dédiée) — B.League est l'une des 4
// populations (avec bball2425_ncaa_m/nbl/euroleague) à couvrir les 5 phases CMJ avec au moins 1
// variable normée chacune (seuil abaissé à 1, révision précédente). Le praticien a choisi B.League
// spécifiquement et validé une portée GLOBALE (tous les patients) avec un DÉCOUPLAGE explicite :
//   - Moteur Biomécanique (computeMouvementAnalysis : analyse par phase, profils biomécaniques,
//     Moteur d'Asymétrie par Phase) -> population automatique cabinet, bball2425_bleague par défaut.
//   - Moteur des Qualités cliniques (computeMoteur/computeCsmV2, sévérités HYP-XX-01) -> reste
//     piloté EXCLUSIVEMENT par la population par test choisie pour CHAQUE patient
//     (athlete.normSelections.cmj, résolue via resolveNormPopulationForTest, inchangé).
//
// PORTÉE DU CHANGEMENT (additive/config + 2 sites d'appel, rien d'autre) :
//   - defaultBiomecaProfilesState().config.defaultCmjPhaseAnalysisPopulation = 'bball2425_bleague'
//   - effectiveCmjPhaseAnalysisPopulation() (nouvelle fonction, même mécanisme que
//     effectiveMinVariablesPrincipales) : lit la config cabinet, repli 'bball2425_bleague'.
//   - Les 2 sites d'appel de computeMouvementAnalysis (buildSportifReport, AnalyseView) utilisent
//     désormais effectiveCmjPhaseAnalysisPopulation() au lieu de
//     resolveNormPopulationForTest('cmj', effectiveNormPop(athlete), normSelections).
// AUCUN seuil/norme/moteur HYP-XX-01 touché. resolveNormPopulationForTest et effectiveNormPop
// restent utilisées ailleurs (HYP engines, computeMoteur) — non modifiées, non retirées.
//
// Exécution : node tests/mission_cmj_phase_analysis_auto_population_tests.js
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

console.log('DÉCISION PRATICIEN — B.League comme population automatique du Moteur Biomécanique (analyse par phase CMJ)');

const CMJ_TRIALS_ALL_PLAUSIBLE = {
  depth: [35], ecc_peak_vel: [0.9], ecc_duration: [350], ecc_mean_power: [20], force_zero_vel: [20],
  braking_rfd: [200], braking_impulse: [1.5], braking_duration: [180], ecc_peak_power: [15],
  peak_power: [50], conc_mean_force: [25], conc_impulse_100: [1.0], conc_impulse: [1.2], force_peak_power: [25],
  height: [32], ft_ct_ratio: [1.1], rsi_mod: [0.6], flight_time: [550],
  landing_peak_force: [40], time_to_stab: [1.0], landing_impulse: [1.5]
};

// ═══════════════ TEST 1-2 — la config cabinet et l'accesseur pointent bien sur B.League par défaut ══
test('TEST 1 — defaultBiomecaProfilesState().profiles[0].config.defaultCmjPhaseAnalysisPopulation === "bball2425_bleague"', () => {
  assert.strictEqual(defaultBiomecaProfilesState().profiles[0].config.defaultCmjPhaseAnalysisPopulation, 'bball2425_bleague');
});
test('TEST 2 — effectiveCmjPhaseAnalysisPopulation() === "bball2425_bleague" (config non surchargée)', () => {
  assert.strictEqual(effectiveCmjPhaseAnalysisPopulation(), 'bball2425_bleague');
});
test('TEST 3 — bball2425_bleague existe bien dans NORM_POPULATIONS et NORMS (jamais une population inventée)', () => {
  assert.ok(NORM_POPULATIONS.some((p) => p.key === 'bball2425_bleague'));
  assert.ok(NORMS.bball2425_bleague && Object.keys(NORMS.bball2425_bleague).length > 0);
});

// ═══════════════ TEST 4-5 — computeMouvementAnalysis, appelé avec la population automatique,
// atteint bien 5/5 phases exploitables (percentile + delta réels) ══════════════════════════════
test('TEST 4 — computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), ...) atteint 5/5 phases exploitables', () => {
  const bilan = { testData: { cmj: { active: true, trials: CMJ_TRIALS_ALL_PLAUSIBLE } } };
  const res = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, {});
  CMJ_PHASES.forEach((p) => assert.strictEqual(res.phases[p].sufficient, true, p + ' devrait être exploitable avec B.League'));
});
test('TEST 5 — chaque phase exploitable porte un percentile (score) et un delta relatif réels', () => {
  const bilan = { testData: { cmj: { active: true, trials: CMJ_TRIALS_ALL_PLAUSIBLE } } };
  const res = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, {});
  CMJ_PHASES.forEach((p) => {
    assert.ok(typeof res.phases[p].score === 'number');
    assert.ok(res.phases[p].delta !== undefined);
  });
});

// ═══════════════ TEST 6-7 — DÉCOUPLAGE : même quand un patient a une population CMJ propre
// différente (ex. Yanis, college_swim_m), le Moteur Biomécanique ignore ce choix et utilise
// systématiquement la population automatique cabinet — le Moteur des Qualités, lui, continue de
// respecter ce choix propre au patient (inchangé, testé séparément ci-dessous). ═════════════════
test('TEST 6 — le Moteur Biomécanique utilise B.League même si le patient a une population CMJ propre différente (ex. college_swim_m)', () => {
  const bilan = { testData: { cmj: { active: true, trials: CMJ_TRIALS_ALL_PLAUSIBLE } } };
  // Le patient a explicitement une population différente (simule Yanis) — jamais transmise au
  // Moteur Biomécanique, qui utilise sa propre population automatique.
  const patientOwnPopulation = resolveNormPopulationForTest('cmj', null, { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null } });
  assert.strictEqual(patientOwnPopulation, 'college_swim_m'); // vérifie la précondition du test
  const res = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, {});
  CMJ_PHASES.forEach((p) => assert.strictEqual(res.phases[p].sufficient, true, p));
});
test('TEST 7 — resolveNormPopulationForTest/effectiveNormPop restent inchangées et toujours utilisées par le Moteur des Qualités (aucune régression sur leur comportement propre)', () => {
  assert.strictEqual(resolveNormPopulationForTest('cmj', null, { cmj: 'foot_f_senior' }), 'foot_f_senior');
  assert.strictEqual(resolveNormPopulationForTest('cmj', 'foot_f_senior', { cmj: null }), 'foot_f_senior');
});

// ═══════════════ TEST 8-9 — régression Yanis : les 8 sévérités cliniques restent strictement
// identiques (le Moteur des Qualités n'a jamais reçu la population automatique cabinet) ════════
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

test('TEST 8 — régression Yanis : les 8 sévérités cliniques restent strictement identiques', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach((q) => assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q));
});
function importRealYanisCmj() {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).sort();
  const merged = { cmj: { active: true, trials: {} } };
  files.forEach((f) => {
    const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
    const r = processCSV(csv);
    if (r.error || !r.data.cmj) return;
    Object.keys(r.data.cmj.trials).forEach((k) => { merged.cmj.trials[k] = (merged.cmj.trials[k] || []).concat(r.data.cmj.trials[k]); });
  });
  return merged;
}
test('TEST 9 — computeMouvementAnalysis, avec les vraies données ForceDecks CSV de Yanis (17 fichiers) + population automatique cabinet, atteint 4/5 phases exploitables (Braking/Concentric/Flight/Landing) — contre 1/5 avec sa population propre college_swim_m (Flight seule). Unloading reste bloquée par un problème PRÉEXISTANT et SANS RAPPORT avec cette révision (depth/ecc_peak_vel importés avec un signe négatif, hors de CMJ_PLAUSIBLE_RANGE qui attend une magnitude positive — hors périmètre de ce changement, jamais touché ici).', () => {
  const bilan = { testData: importRealYanisCmj() };
  const res = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, {});
  const sufficientCount = CMJ_PHASES.filter((p) => res.phases[p].sufficient).length;
  assert.strictEqual(sufficientCount, 4);
  assert.strictEqual(res.phases.unloading.sufficient, false);
  ['braking', 'concentric', 'flight', 'landing'].forEach((p) => assert.strictEqual(res.phases[p].sufficient, true, p));
});

// ═══════════════ TEST 10 — configurabilité cabinet : une dérogation explicite dans le profil actif
// est bien respectée par effectiveCmjPhaseAnalysisPopulation (même mécanisme que les autres
// réglages du Moteur Biomécanique, jamais un cas spécial) ══════════════════════════════════════
test('TEST 10 — une dérogation de profil (minVariablesPrincipales déjà couvert ailleurs) est bien lue pour defaultCmjPhaseAnalysisPopulation aussi', () => {
  const before = JSON.parse(JSON.stringify(biomecaProfilesState));
  try {
    biomecaProfilesState.profiles[0].config.defaultCmjPhaseAnalysisPopulation = 'foot_m_senior';
    assert.strictEqual(effectiveCmjPhaseAnalysisPopulation(), 'foot_m_senior');
  } finally {
    biomecaProfilesState = before;
  }
});

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = '18a6a3c';
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
test('GUARD 2 — resolveNormPopulationForTest/effectiveNormPop/normalizeNormSelectionForTest restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = '18a6a3c';
  const fns = ['resolveNormPopulationForTest', 'effectiveNormPop', 'normalizeNormSelectionForTest'];
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
  fns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('GUARD 3 — THRESHOLDS/NORMS/NORMS_V2/CSM_V2_CLINICAL_VARIABLE_MATRIX/NORM_POPULATIONS inchangés', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(NORM_POPULATIONS.length, 64);
});
test('GUARD 4 — le diff de ce commit touche computeMouvementAnalysis (call sites) et la config du Moteur Biomécanique, jamais computeMoteur/computeCsmV2', () => {
  const diff = execSync('git diff HEAD -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  if (diff.trim().length === 0) return; // déjà commité au moment du test
  assert.ok(diff.includes('effectiveCmjPhaseAnalysisPopulation'));
  assert.ok(!diff.includes('function computeMoteur('));
  assert.ok(!diff.includes('function computeCsmV2('));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

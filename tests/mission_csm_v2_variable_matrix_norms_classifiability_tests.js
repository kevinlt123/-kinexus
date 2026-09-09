// MISSION P0 — RÉPARER LA CLASSIFIABILITÉ CSM V2 VIA NORMS.
//
// Objectif : csmV2VariableMatrixClassifiability() ne consultait jusqu'ici que THRESHOLDS et
// NORMS_V2, jamais NORMS (le référentiel par population) — des variables réellement classifiables
// par le moteur clinique (ex. cmj_braking_rfd/cmj_force_zero_vel via applyThr(key,val,pop,age),
// déjà utilisées telles quelles par HYP-ABS-01 LOCKED) étaient donc déclarées à tort
// 'non_classifiable' par la matrice d'audit CSM_V2_CLINICAL_VARIABLE_MATRIX. Cette suite vérifie
// que la fonction reconnaît désormais les 3 sources (THRESHOLDS/NORMS_V2/NORMS), en réutilisant
// exclusivement la convention déjà existante (lookup plat NORMS[pop][key], identique à
// applyThr/resolveNormPopulationForTest — jamais un nouveau système de sélection de population),
// sans jamais dégrader vers "if(NORMS[key])return'exploitable'" (une seule entrée ne suffit pas :
// il faut soit une population confirmée et couverte, soit — à défaut de contexte patient — le
// niveau 'partiellement_exploitable', jamais 'exploitable' par défaut), et sans modifier aucun
// moteur HYP-XX-01, aucun seuil, aucune norme.
//
// Exécution : node tests/mission_csm_v2_variable_matrix_norms_classifiability_tests.js — aucune
// dépendance externe.
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

console.log('MISSION P0 — Classifiabilité CSM V2 via NORMS (csmV2VariableMatrixClassifiability)');

// ═══════════════════ 1-2 — COMPORTEMENT PRÉEXISTANT INCHANGÉ (THRESHOLDS / NORMS_V2) ═════════════
test('TEST 1 — THRESHOLDS : comportement inchangé -> exploitable (universel, aucune population requise)', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.cmj_rsi_mod'), 'exploitable');
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.cmj_height'), 'exploitable');
  // Même résultat qu'une population soit fournie ou non : THRESHOLDS reste prioritaire et universel.
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.cmj_rsi_mod', 'fd_bball_m'), 'exploitable');
});
test('TEST 2 — NORMS_V2 : comportement inchangé -> partiellement_exploitable', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.imtp_n'), 'partiellement_exploitable');
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.cmj_peak_power'), 'partiellement_exploitable');
});

// ═══════════════════ 3-5 — NOUVELLE LOGIQUE NORMS ═════════════════════════════════════════════════
test('TEST 3 — NORMS + population fournie ET couverte -> exploitable', () => {
  assert.strictEqual(NORMS['fd_bball_m']['iso_belt_squat_nkg'] != null, true);
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.iso_belt_squat_nkg', 'fd_bball_m'), 'exploitable');
});
test('TEST 4 — NORMS + population fournie NON couverte -> jamais "exploitable" à tort (retombe sur partiellement_exploitable car couvert ailleurs)', () => {
  assert.strictEqual(NORMS['foot_m_senior']['iso_belt_squat_nkg'], undefined);
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.iso_belt_squat_nkg', 'foot_m_senior'), 'partiellement_exploitable');
});
test('TEST 5 — aucune couverture nulle part (ni THRESHOLDS, ni NORMS_V2, ni NORMS) -> non_classifiable', () => {
  assert.strictEqual(THRESHOLDS['variable_totalement_inexistante_xyz'], undefined);
  assert.strictEqual(NORMS_V2['variable_totalement_inexistante_xyz'], undefined);
  Object.keys(NORMS).forEach((p) => assert.strictEqual(NORMS[p]['variable_totalement_inexistante_xyz'], undefined));
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.variable_totalement_inexistante_xyz'), 'non_classifiable');
});

// ═══════════════════ 6-13 — VARIABLES SPÉCIFIQUES DE L'AUDIT (§CONTEXTE) ═════════════════════════
test('TEST 6 — cmj_braking_rfd (alias diagnosticEvidence.braking_rfd, 19 populations NORMS) -> partiellement_exploitable sans population, exploitable avec une population couverte', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.braking_rfd'), 'partiellement_exploitable');
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.braking_rfd', 'bball2425_bleague'), 'exploitable');
  assert.strictEqual(csmV2VariableMatrixClassifiability('cmj_braking_rfd'), 'partiellement_exploitable');
});
test('TEST 7 — cmj_force_zero_vel (alias diagnosticEvidence.force_zero_vel, 7 populations NORMS) -> partiellement_exploitable', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.force_zero_vel'), 'partiellement_exploitable');
  assert.strictEqual(csmV2VariableMatrixClassifiability('cmj_force_zero_vel'), 'partiellement_exploitable');
});
test('TEST 7b — braking_impulse reste non_classifiable (aucune couverture NORMS/THRESHOLDS/NORMS_V2 même après alias)', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.braking_impulse'), 'non_classifiable');
});
test('TEST 8 — iso_belt_squat_n (21 populations NORMS) -> partiellement_exploitable', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.iso_belt_squat_n'), 'partiellement_exploitable');
});
test('TEST 9 — sl_iso_push_n (3 populations NORMS) -> partiellement_exploitable', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.sl_iso_push_n'), 'partiellement_exploitable');
});
test('TEST 10 — iso_belt_squat_nkg (19 populations NORMS) -> partiellement_exploitable sans population', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.iso_belt_squat_nkg'), 'partiellement_exploitable');
});
test('TEST 11 — cmj_depth (8 populations NORMS) -> partiellement_exploitable', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.cmj_depth'), 'partiellement_exploitable');
});
test('TEST 12 — cmj_ecc_peak_vel (8 populations NORMS) -> partiellement_exploitable', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('diagnosticEvidence.cmj_ecc_peak_vel'), 'partiellement_exploitable');
});
test('TEST 13 — cmj_landing_peak_force (4 populations NORMS, §6 de la mission) : la fonction DOIT la reconnaître si on la lui soumet, sans qu\'elle soit déclarée diagnostique ni ajoutée à un moteur HYP', () => {
  assert.strictEqual(csmV2VariableMatrixClassifiability('cmj_landing_peak_force'), 'partiellement_exploitable');
  assert.strictEqual(csmV2VariableMatrixClassifiability('cmj_landing_peak_force', 'bball2425_ncaa_m'), 'exploitable');
  // Non déclarée diagnostique : absente de QUALITY_DIAGNOSTIC_VARIABLES_V1.
  const flatV1 = JSON.stringify(QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.strictEqual(flatV1.indexOf('cmj_landing_peak_force') === -1, true, 'cmj_landing_peak_force ne doit PAS être déclarée diagnostique V1');
});

// ═══════════════════ 14-15 — YANIS : COMPLÉTUDE ABSORPTION / FORCE ═══════════════════════════════
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
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

test('TEST 14 — YANIS : complétude Absorption passe de 0/3 à 2/3 variables diagnostiques classifiables (braking_rfd + force_zero_vel classifiables, braking_impulse non_classifiable)', () => {
  const res = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const absAudit = res.clinicalSynthesisV2.clinicalCompletenessAudit['Absorption'];
  const byKey = {};
  absAudit.diagnostic.forEach((v) => { byKey[v.variableKey.split('.').pop()] = v.classifiability; });
  assert.strictEqual(byKey['braking_rfd'], 'partiellement_exploitable');
  assert.strictEqual(byKey['force_zero_vel'], 'partiellement_exploitable');
  assert.strictEqual(byKey['braking_impulse'], 'non_classifiable');
  const classifiableCount = absAudit.diagnostic.filter((v) => v.classifiability !== 'non_classifiable').length;
  assert.strictEqual(classifiableCount, 2, 'Absorption doit passer à 2/3 variables diagnostiques classifiables (avant cette mission : 0/3)');
  assert.strictEqual(absAudit.diagnostic.length, 3);
});
test('TEST 15 — YANIS : complétude Force bénéficie de la même correction (iso_belt_squat_n/iso_belt_squat_nkg désormais classifiables)', () => {
  const res = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const forceAudit = res.clinicalSynthesisV2.clinicalCompletenessAudit['Force'];
  const classifiableCount = forceAudit.diagnostic.filter((v) => v.classifiability !== 'non_classifiable').length;
  assert.strictEqual(classifiableCount >= 3, true, 'Force doit compter au moins 3 variables diagnostiques désormais classifiables');
});

// ═══════════════════ 16-18 — NON-RÉGRESSION : AUCUN MOTEUR HYP, AUCUNE NORME, AUCUN SEUIL ═══════
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
const BASELINE_COMMIT = 'HEAD';
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1};')({ _d: {}, getItem() { return null; }, setItem() {} });

test('TEST 16 — YANIS : aucun verdict HYP (state/status/severity des 8 qualités) ne change entre avant (HEAD) et après cette mission', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Explosivité', 'Absorption', 'Mobilité', 'Réactivité', 'Stabilisation', 'Endurance'].forEach((q) => {
    assert.deepStrictEqual(after.functionScores[q], before.functionScores[q], q + ' : sortie HYP ne doit pas changer (le fix ne touche que la couche audit/classifiabilité)');
    assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile[q].severity, before.clinicalSynthesisV2.clinicalProfile[q].severity, q);
  });
});
test('TEST 17 — GUARD : NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1 restent deep-equal à HEAD (aucun seuil, aucune norme, aucune clé inventée)', () => {
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
});
test('TEST 18 — GUARD : les 8 moteurs HYP-XX-01 + computeCsmV2 + computeHypForceKpi restent BYTE-IDENTIQUES à HEAD', () => {
  const fns = ['computeHypExplosivity01', 'computeHypAbsorption01', 'computeHypForce01', 'computeHypMobility01',
    'computeHypPower01', 'computeHypReactivity01', 'computeHypStabilization01', 'computeHypEndurance01',
    'computeHypForceKpi', 'computeCsmV2'];
  fns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée par cette mission — interdit'));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

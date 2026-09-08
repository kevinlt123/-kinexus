// MISSION — CORRECTION CLINIQUE CIBLÉE HYP-ABS-01 : ABSORPTION.
//
// Objectif : distinguer explicitement, dans la sortie de HYP-ABS-01, les 2 composantes
// fonctionnelles d'Absorption : A. FREINAGE CMJ (braking_rfd/force_zero_vel/braking_impulse) et
// B. RÉCEPTION/LANDING (peak_landing_force/loading_rate). Le freinage préserve EXACTEMENT la
// logique historique déjà en vigueur (niveau1 : 2 classifiables déficitaires -> deficient, 1 ->
// watch, 0 -> not_determinable ; braking_impulse jamais classifiable, jamais compté). La réception
// reste NOT_DETERMINABLE tant qu'aucun référentiel classifiable n'existe pour ses 2 variables
// (landing_bi_peak_landing_force / sllt_peak_landing_force / sllt_loading_rate — aucun seuil ni
// norme nulle part) — ses valeurs brutes sont désormais réellement extraites quand disponibles
// (l'ancienne version ne les lisait même pas), mais ne contribuent jamais au statut global, qui
// reste piloté exclusivement par le freinage (aucune nouvelle règle de fusion inventée). Time To
// Stabilization reste exclu (Stabilisation, jamais Absorption).
//
// Exécution : node tests/mission_hyp_abs01_absorption_correction_tests.js — aucune dépendance externe.
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

console.log('MISSION — Correction clinique ciblée HYP-ABS-01 : Absorption (freinage/réception)');

const POP = 'bball2425_bleague', AGE = 25;

// ═══════════════════ TESTS 1-4 — FREINAGE (logique historique préservée) ══════════════════════
test('TEST 1 — 2 variables de freinage déficitaires -> braking=deficient, absorption=deficient', () => {
  var r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [15] } } }, POP, AGE, {});
  assert.strictEqual(r.braking.niveau, 'deficitaire');
  assert.strictEqual(r.braking.state, 'retenue_faible');
  assert.strictEqual(r.state, 'retenue_faible');
  assert.strictEqual(r.status, 'rouge');
});
test('TEST 2 — 1 seule variable de freinage déficitaire -> braking=watch, absorption=watch', () => {
  var r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [30] } } }, POP, AGE, {});
  assert.strictEqual(r.braking.variables.braking_rfd.status, 'rouge');
  assert.strictEqual(r.braking.variables.force_zero_vel.status, 'vert');
  assert.strictEqual(r.braking.niveau, 'a_surveiller');
  assert.strictEqual(r.braking.state, 'suspectee');
  assert.strictEqual(r.state, 'suspectee');
});
test('TEST 3 — aucune variable de freinage classifiable -> braking=not_determinable, absorption=not_determinable', () => {
  var r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_impulse: [1.5] } } }, POP, AGE, {});
  assert.strictEqual(r.braking.niveau, 'non_determinable');
  assert.strictEqual(r.braking.state, 'non_determinable');
  assert.strictEqual(r.state, 'non_determinable');
  assert.strictEqual(r.status, null);
});
test('TEST 4 — braking_impulse : valeur brute présente mais non classifiable -> ne compte JAMAIS comme preserved ni deficient', () => {
  var r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_impulse: [1.5], braking_rfd: [130], force_zero_vel: [30] } } }, POP, AGE, {});
  assert.strictEqual(r.braking.variables.braking_impulse.raw, 1.5);
  assert.strictEqual(r.braking.variables.braking_impulse.status, null);
  assert.strictEqual(r.braking.variables.braking_impulse.classifiable, false);
  // Les 2 autres variables classifiables (preserved) déterminent seules le niveau -> absente, jamais
  // influencé par la présence de braking_impulse.
  assert.strictEqual(r.braking.niveau, 'ok');
  assert.strictEqual(r.state, 'absente');
});

// ═══════════════════ TEST 5 — RÉCEPTION/LANDING disponible mais non normée ═════════════════════
test('TEST 5 — landing disponible (Peak Landing Force + Loading Rate) mais aucun référentiel -> landing=not_determinable, aucune classification artificielle', () => {
  var r = computeHypAbsorption01({
    landing_bi: { active: true, trials: { peak_landing_force: [40] } },
    sllt: { active: true, D: { trials: { peak_landing_force: [40], loading_rate: [5000] } }, G: { trials: { peak_landing_force: [38], loading_rate: [4800] } } }
  }, POP, AGE, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.status, null);
  assert.strictEqual(r.landing.available, true);
  assert.strictEqual(r.landing.variables.peak_landing_force.raw, 40);
  assert.strictEqual(r.landing.variables.peak_landing_force.classifiable, false);
  assert.strictEqual(r.landing.variables.peak_landing_force.status, null);
  assert.strictEqual(r.landing.variables.sllt_peak_landing_force.rawD, 40);
  assert.strictEqual(r.landing.variables.sllt_peak_landing_force.rawG, 38);
  assert.strictEqual(r.landing.variables.sllt_peak_landing_force.classifiable, false);
  assert.strictEqual(r.landing.variables.sllt_loading_rate.rawD, 5000);
  assert.strictEqual(r.landing.variables.sllt_loading_rate.rawG, 4800);
  assert.strictEqual(r.landing.variables.sllt_loading_rate.classifiable, false);
});

// ═══════════════════ TESTS 6-8 — STATUT GLOBAL (landing ne pilote jamais le global) ════════════
test('TEST 6 — freinage deficient + landing not_determinable -> absorption global = deficient (braking/landing exposés séparément)', () => {
  var r = computeHypAbsorption01({
    cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [15] } },
    landing_bi: { active: true, trials: { peak_landing_force: [40] } }
  }, POP, AGE, {});
  assert.strictEqual(r.braking.state, 'retenue_faible');
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.state, 'retenue_faible');
});
test('TEST 7 — freinage watch + landing not_determinable -> absorption global = watch', () => {
  var r = computeHypAbsorption01({
    cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [30] } },
    sllt: { active: true, D: { trials: { loading_rate: [5000] } }, G: { trials: { loading_rate: [4800] } } }
  }, POP, AGE, {});
  assert.strictEqual(r.braking.state, 'suspectee');
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.state, 'suspectee');
});
test('TEST 8 — freinage not_determinable + landing not_determinable -> absorption = not_determinable', () => {
  var r = computeHypAbsorption01({}, POP, AGE, {});
  assert.strictEqual(r.braking.state, 'non_determinable');
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.state, 'non_determinable');
});

// ═══════════════════ TEST 9 — LANDING NE MODIFIE JAMAIS LE FREINAGE ════════════════════════════
test('TEST 9 — ajouter des données Landing ne change strictement rien au statut du freinage (avec ou sans, résultat identique)', () => {
  var withoutLanding = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [30] } } }, POP, AGE, {});
  var withLanding = computeHypAbsorption01({
    cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [30] } },
    landing_bi: { active: true, trials: { peak_landing_force: [999] } },
    sllt: { active: true, D: { trials: { peak_landing_force: [999], loading_rate: [999999] } }, G: { trials: { peak_landing_force: [1], loading_rate: [1] } } }
  }, POP, AGE, {});
  assert.deepStrictEqual(withLanding.braking, withoutLanding.braking);
  assert.strictEqual(withLanding.state, withoutLanding.state);
  assert.strictEqual(withLanding.status, withoutLanding.status);
});

// ═══════════════════ TEST 10 — TTS NE DEVIENT JAMAIS UNE VARIABLE D'ABSORPTION ═════════════════
test('TEST 10 — Time To Stabilization (landing_uni/sllt tts) n\'est jamais lu ni exposé comme preuve diagnostique d\'Absorption', () => {
  var r = computeHypAbsorption01({
    landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
    sllt: { active: true, D: { trials: { tts: [1.5], peak_landing_force: [40] } }, G: { trials: { tts: [1.1], peak_landing_force: [38] } } }
  }, POP, AGE, {});
  var serialized = JSON.stringify(r);
  assert.ok(serialized.indexOf('"tts"') === -1, 'aucune clé "tts" ne doit apparaître dans la sortie de HYP-ABS-01');
  assert.ok(!Object.prototype.hasOwnProperty.call(r.landing.variables, 'tts'));
  // Les autres variables landing restent, elles, correctement extraites (tts n'exclut rien d'autre).
  assert.strictEqual(r.landing.variables.sllt_peak_landing_force.rawD, 40);
});

// ═══════════════════ TEST 11 — SÉPARATION EXPLICITE DES COMPOSANTES ════════════════════════════
test('TEST 11 — la sortie distingue explicitement braking.status/state et landing.status/state', () => {
  var r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [15] } } }, POP, AGE, {});
  assert.ok(r.braking && typeof r.braking === 'object');
  assert.ok(r.landing && typeof r.landing === 'object');
  assert.ok('status' in r.braking && 'state' in r.braking);
  assert.ok('status' in r.landing && 'state' in r.landing);
  assert.notStrictEqual(r.braking, r.landing);
});

// ═══════════════════ TEST 12 — AUCUN SEUIL INVENTÉ ═════════════════════════════════════════════
test('TEST 12 — audit automatique : aucune nouvelle entrée dans THRESHOLDS/NORMS/NORMS_V2', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  ['landing_bi_peak_landing_force', 'sllt_peak_landing_force', 'sllt_loading_rate'].forEach((k) => {
    assert.strictEqual(THRESHOLDS[k], undefined, k + ' ne doit avoir aucun seuil');
    assert.strictEqual(NORMS_V2[k], undefined, k + ' ne doit avoir aucune entrée NORMS_V2');
    Object.keys(NORMS).forEach((pop) => assert.strictEqual(NORMS[pop][k], undefined, pop + '.' + k + ' ne doit avoir aucune norme'));
  });
});

// ═══════════════════ YANIS — avant/après ═══════════════════════════════════════════════════════
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

// RÉVISÉ (synchronisation) : BASELINE_COMMIT='HEAD' (728939f) prédate ÉGALEMENT la mission
// ULTÉRIEURE et distincte MISSION_HYP_EXP01_RSI_MOD (encore non commitée) — un baseline "HEAD brut"
// ferait donc apparaître le delta d'Explosivité comme un faux positif de CETTE mission-ci. Le
// baseline correct isole la SEULE modification de cette mission (HYP-ABS-01) : on part du code
// ACTUEL (qui inclut déjà, légitimement, le fix Explosivité) et on y RÉINJECTE, par substitution de
// texte, les corps de computeHypAbsorption01/computeHypAbsorptionReceptionImpact tels qu'ils
// existaient à HEAD (avant CETTE mission) — aucune autre fonction n'est touchée par la substitution.
const BASELINE_COMMIT = 'HEAD';
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);

function replaceFnBody(src, fnName, newBody) {
  const marker = 'function ' + fnName + '(';
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(fnName + ' introuvable');
  let depth = 0, i = src.indexOf('{', idx);
  const bodyStart = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(0, bodyStart) + newBody + src.slice(i);
}
let isolatedSlice = slice;
['computeHypAbsorption01', 'computeHypAbsorptionReceptionImpact'].forEach((fn) => {
  isolatedSlice = replaceFnBody(isolatedSlice, fn, extractFnBody(baseCode, fn));
});
const baseSandbox = new Function('localStorage', isolatedSlice + '\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

test('YANIS — avant/après : Absorption state/status/severity strictement inchangés (changement purement structurel/additif), braking/landing désormais exposés séparément', () => {
  var before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  var after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  var absBefore = before.functionScores['Absorption'].hypAbs01;
  var absAfter = after.functionScores['Absorption'].hypAbs01;
  console.log('    AVANT — state=' + absBefore.state + ' status=' + absBefore.status + ' severity=' + before.clinicalSynthesisV2.clinicalProfile['Absorption'].severity);
  console.log('    APRÈS — state=' + absAfter.state + ' status=' + absAfter.status + ' severity=' + after.clinicalSynthesisV2.clinicalProfile['Absorption'].severity + ' braking.state=' + absAfter.braking.state + ' landing.state=' + absAfter.landing.state + ' landing.available=' + absAfter.landing.available);
  assert.strictEqual(absAfter.state, absBefore.state);
  assert.strictEqual(absAfter.status, absBefore.status);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Absorption'].severity, before.clinicalSynthesisV2.clinicalProfile['Absorption'].severity);
  // braking.state reprend exactement l'ancien niveau1/state global (aucune divergence possible :
  // braking EST la seule composante qui pilotait déjà state/status avant cette mission).
  assert.strictEqual(absAfter.braking.state, absBefore.state);
  assert.strictEqual(absAfter.landing.state, 'non_determinable');
  assert.strictEqual(absAfter.landing.available, true, 'sllt fournit des valeurs brutes réelles (Yanis) -> extraites, jamais classifiées');
});
test('YANIS — les 7 autres qualités restent byte-identiques (changement strictement localisé à Absorption)', () => {
  var before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  var after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Explosivité', 'Mobilité', 'Réactivité', 'Stabilisation', 'Endurance'].forEach((q) => {
    assert.deepStrictEqual(after.functionScores[q], before.functionScores[q], q + ' ne doit pas changer');
    assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile[q].severity, before.clinicalSynthesisV2.clinicalProfile[q].severity, q);
  });
});

// ═══════════════════ GUARDS ═════════════════════════════════════════════════════════════════════
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

test('GUARD 1 — les 7 autres moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES (computeHypAbsorption01 modifié par cette mission ; computeHypExplosivity01 déjà modifié par MISSION_HYP_EXP01_RSI_MOD, sans rapport, vérifié par sa propre suite dédiée)', () => {
  const hypFns = ['computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypStabilization01', 'computeHypEndurance01'];
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée'));
  assert.notStrictEqual(extractFnBody(code, 'computeHypAbsorption01'), extractFnBody(baseCode, 'computeHypAbsorption01'), 'computeHypAbsorption01 doit avoir changé (cette mission)');
});
test('GUARD 2 — THRESHOLDS inchangé (24 clés)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
});
test('GUARD 3 — NORMS inchangé (64 populations, deep-equal contre le commit de référence)', () => {
  const baseTh = new Function('localStorage', baseSlice + '\nreturn {NORMS:NORMS};')({ _d: {}, getItem() { return null; }, setItem() {} });
  assert.deepStrictEqual(NORMS, baseTh.NORMS);
});
test('GUARD 4 — NORMS_V2 inchangé (deep-equal contre le commit de référence)', () => {
  const baseV2 = new Function('localStorage', baseSlice + '\nreturn {NORMS_V2:NORMS_V2};')({ _d: {}, getItem() { return null; }, setItem() {} });
  assert.deepStrictEqual(NORMS_V2, baseV2.NORMS_V2);
});
test('GUARD 5 — THRESHOLDS deep-equal contre le commit de référence', () => {
  const baseTh = new Function('localStorage', baseSlice + '\nreturn {THRESHOLDS:THRESHOLDS};')({ _d: {}, getItem() { return null; }, setItem() {} });
  assert.deepStrictEqual(THRESHOLDS, baseTh.THRESHOLDS);
});
test('GUARD 6 — QUALITY_DIAGNOSTIC_VARIABLES_V1 inchangé (deep-equal)', () => {
  const baseV1 = new Function('localStorage', baseSlice + '\nreturn {QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1};')({ _d: {}, getItem() { return null; }, setItem() {} });
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseV1.QUALITY_DIAGNOSTIC_VARIABLES_V1);
});
test('GUARD 7 — CSM_V2_CLINICAL_VARIABLE_MATRIX inchangée par CETTE mission (deep-equal contre le baseline isolé, qui inclut déjà légitimement MISSION_HYP_EXP01_RSI_MOD, sans rapport) : HYP-ABS-01 conserve exactement le même diagnosticEvidence/confirmativeEvidence/explanatoryEvidence qu\'avant cette mission (braking/landing sont des champs additifs, jamais lus par la matrice dérivée)', () => {
  assert.deepStrictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 151);
});
test('GUARD 8 — computeHypForceKpi (ForceKpi) reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypForceKpi'), extractFnBody(baseCode, 'computeHypForceKpi'));
});
test('GUARD 9 — computeCsmV2 reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeCsmV2'), extractFnBody(baseCode, 'computeCsmV2'));
});
test('GUARD 10 — computeHypMobilityWblt reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypMobilityWblt'), extractFnBody(baseCode, 'computeHypMobilityWblt'));
});
test('GUARD 11 — computeAsymEngine reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeAsymEngine'), extractFnBody(baseCode, 'computeAsymEngine'));
});
test('GUARD 12 — computeMoteur reste BYTE-IDENTIQUE (aucune ligne de branchement touchée)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'));
});
test('GUARD 13 — le diff fonctionnel de cette mission se limite à computeHypAbsorption01 et computeHypAbsorptionReceptionImpact (signature étendue, extraction landing) — jamais un autre moteur', () => {
  assert.notStrictEqual(extractFnBody(code, 'computeHypAbsorptionReceptionImpact'), extractFnBody(baseCode, 'computeHypAbsorptionReceptionImpact'), 'computeHypAbsorptionReceptionImpact doit avoir changé (extraction landing)');
  ['computeHypAbsorptionCore', 'computeHypAbsorptionCapaciteEcc', 'computeHypAbsorptionStrategie', 'computeHypAbsorptionReactive', 'computeHypAbsorptionAsymetrie'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' n\'aurait jamais dû changer (logique de freinage historique préservée à l\'identique)');
  });
});
test('GUARD 14 — git diff --check passe (vérifié séparément par le rapport de mission ; ici, contrôle qu\'aucun conflit de fusion n\'est présent dans index.html)', () => {
  assert.strictEqual(code.indexOf('<<<<<<<'), -1);
  assert.strictEqual(code.indexOf('>>>>>>>'), -1);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

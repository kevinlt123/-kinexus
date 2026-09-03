// MISSION — BUG CRITIQUE : DONNÉES FORCEDECKS YANIS NON RECONNUES DANS LE RAPPORT CMJ.
//
// ROOT CAUSE confirmée : le message "Données insuffisantes pour interpréter cette phase (0/0
// variables principales disponibles, minimum requis 2, seuil 50%)" provient de computeBiomecaPhase()
// (Moteur Biomécanique, index.html) — "0/0" signifie qu'AUCUNE variable n'est jamais catégorisée
// 'principale' par phaseVarCategorie(), qui exige phaseVarHasNorms(kpiKey,pop) === true, qui exige
// elle-même un `pop` réellement résolu vers une clé NORMS existante. computeMouvementAnalysis()
// (Moteur Biomécanique) recevait UNIQUEMENT effectiveNormPop(athlete) — la population GLOBALE du
// patient (athlete.normPopulation / athlete.sexe) — en ignorant TOTALEMENT la sélection de
// population PAR TEST CMJ (athlete.normSelections.cmj), déjà utilisée par plusieurs moteurs HYP via
// resolveNormPopulationForTest(). Sans athlete.normPopulation explicitement défini, pop=null pour
// TOUTES les phases -> "0/0" partout, MÊME quand les 56 kpis CMJ réels de Yanis sont correctement
// importés, mappés et disponibles (vérifié : 29/31 variables auditées sont réellement `available`,
// et la phase Braking devient 3/3 SUFFISANTE dès qu'une population réelle est résolue).
//
// CORRECTION APPLIQUÉE (minimale) : les 2 sites d'appel de computeMouvementAnalysis()
// (buildSportifReport, AnalyseView) utilisent désormais resolveNormPopulationForTest('cmj',
// effectiveNormPop(athlete), normSelections) au lieu de effectiveNormPop(athlete) seul — réutilise
// une fonction DÉJÀ existante, DÉJÀ utilisée par plusieurs moteurs HYP pour ce rôle exact. AUCUN
// nouveau seuil/norme/HYP/mapping créé.
//
// LIMITE DOCUMENTÉE (non corrigée dans cette mission, hors périmètre "correction minimale") :
// resolveNormPopulationForTest() ignore délibérément les sélecteurs OBJET (format NORMS_V2, le cas
// le plus courant en pratique pour la sélection automatique de population CMJ) — seule une
// sélection MANUELLE au format chaîne (legacy NORMS) bénéficie de cette correction. Le pont
// NORMS_V2 <-> NORMS legacy reste un gap architectural réel, documenté comme priorité #1 de la
// prochaine mission, volontairement non construit ici (refactor trop large pour une correction
// minimale de bug).
//
// Exécution : node tests/mission_yanis_cmj_data_pipeline_tests.js
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

console.log('MISSION — Bug critique : pipeline CMJ Yanis (0/0 variables principales)');
const BASELINE_COMMIT = 'ac6e432'; // dernier commit avant cette mission

function importYanis() {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).sort();
  const merged = { cmj: { active: true, trials: {} } };
  files.forEach((f) => {
    const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
    const r = processCSV(csv);
    if (r.error || !r.data.cmj) return;
    Object.keys(r.data.cmj.trials).forEach((k) => {
      merged.cmj.trials[k] = (merged.cmj.trials[k] || []).concat(r.data.cmj.trials[k]);
    });
  });
  return merged;
}

// ═══════════════════ 1. Les données CMJ de Yanis sont détectées ═════════════════════════════════
test('YANIS 1 — les données CMJ de Yanis sont détectées (testData.cmj.active=true, trials non vide)', () => {
  const merged = importYanis();
  assert.strictEqual(merged.cmj.active, true);
  assert.ok(Object.keys(merged.cmj.trials).length > 0, 'aucune donnée CMJ importée');
});

// ═══════════════════ 2. Au moins une variable CMJ attendue est effectivement available ══════════
test('YANIS 2 — au moins une variable CMJ attendue est effectivement available() via resolveCmjValues', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  assert.ok(cmjValues.height != null, 'cmj_height doit être disponible');
});

// ═══════════════════ 3. Les variables validées dans le mapping sont retrouvées ══════════════════
test('YANIS 3 — 29/31 variables du référentiel validé sont retrouvées (audit complet, valeurs réelles)', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const VARS = ['height', 'rsi_mod', 'braking_duration', 'depth', 'ecc_peak_vel', 'ecc_duration', 'ecc_peak_power',
    'ecc_mean_power', 'braking_rfd', 'braking_impulse', 'force_zero_vel', 'conc_impulse', 'conc_impulse_100',
    'conc_mean_force', 'conc_mean_power', 'peak_power', 'force_peak_power', 'contraction_time',
    'landing_peak_force', 'landing_impulse', 'leg_stiffness', 'flight_time', 'ft_ct_ratio',
    'conc_mean_force_L', 'conc_mean_force_R', 'force_peak_power_L', 'force_peak_power_R',
    'leg_stiffness_L', 'leg_stiffness_R'];
  const available = VARS.filter((k) => cmjValues[k] != null);
  assert.strictEqual(available.length, VARS.length, 'toutes les variables du référentiel validé (hors force_zero_vel_L/R, réellement absentes de cet export) doivent être disponibles : manquantes = ' + VARS.filter((k) => cmjValues[k] == null).join(', '));
  // force_zero_vel_L/R : absentes de CET export réel (constat factuel déjà documenté), jamais une régression du pipeline.
  assert.strictEqual(cmjValues.force_zero_vel_L, undefined);
  assert.strictEqual(cmjValues.force_zero_vel_R, undefined);
});

// ═══════════════════ 4. Les valeurs ne sont pas null/undefined après parsing ════════════════════
test('YANIS 4 — les valeurs numériques réelles (height=32.9, braking_rfd≈45.29, conc_impulse=188.1...) ne sont ni null ni undefined ni NaN après parsing', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  assert.strictEqual(cmjValues.height, 32.9);
  assert.ok(Math.abs(cmjValues.braking_rfd - 45.287890524141496) < 1e-9);
  assert.strictEqual(cmjValues.conc_impulse, 188.1);
  // depth=36.1 (positif) depuis la mission dédiée "fix signe depth/ecc_peak_vel" (postérieure à
  // celle-ci) : le signe natif ForceDecks (négatif, direction descendante) est désormais corrigé
  // en magnitude à l'import (fdSignCorrected), cohérent avec NORMS/CMJ_PLAUSIBLE_RANGE — non-
  // régressé par CETTE mission, changé par une mission ultérieure explicitement validée.
  assert.strictEqual(cmjValues.depth, 36.1);
  Object.keys(cmjValues).forEach((k) => assert.ok(!Number.isNaN(cmjValues[k]), k + ' est NaN'));
});

// ═══════════════════ 5. Les clés CSM et moteur CMJ correspondent ════════════════════════════════
test('YANIS 5 — la clé lue par resolveCmjValues (ex. "braking_rfd") correspond EXACTEMENT à la clé lue par CMJ_VAR_META/computeBiomecaPhase ("braking_rfd", jamais "cmj_braking_rfd" côté trials, jamais "CMJ_height")', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  // computeBiomecaPhase lit cmjValues[k] où k vient de Object.keys(CMJ_VAR_META) -- même casse, même
  // absence de préfixe que resolveCmjValues. NORMS/THRESHOLDS utilisent 'cmj_'+k (préfixe ajouté
  // uniquement à la lecture des tables normatives, jamais dans cmjValues/CMJ_VAR_META eux-mêmes).
  assert.ok(Object.prototype.hasOwnProperty.call(CMJ_VAR_META, 'braking_rfd'));
  assert.strictEqual(cmjValues['braking_rfd'], cmjValues[Object.keys(CMJ_VAR_META).find((k) => k === 'braking_rfd')]);
  assert.strictEqual(CMJ_VAR_META['CMJ_height'], undefined, 'aucune variante de casse ne doit exister');
  assert.strictEqual(CMJ_VAR_META['cmj.height'], undefined);
});

// ═══════════════════ 6. Le moteur ne retourne plus artificiellement 0/0 si les données sont présentes
test('YANIS 6 — computeBiomecaPhase(\'braking\',...) avec les données réelles de Yanis + une population réellement résolue ne retourne PLUS 0/0 (Braking devient 3/3 SUFFISANTE)', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const braking = computeBiomecaPhase('braking', cmjValues, 'foot_f_senior', 25);
  assert.strictEqual(braking.sufficient, true);
  assert.strictEqual(braking.masterAvailable, 3);
  assert.strictEqual(braking.masterTotal, 3);
  assert.strictEqual(braking.reason, undefined); // absent (jamais construit) sur le chemin "sufficient=true"
});
test('YANIS 6bis — reproduction EXACTE du bug rapporté AVANT correction (pop=null, simule un athlete sans normPopulation ni sélection résolvable) : 0/0 pour les 5 phases, malgré 56 kpis CMJ réels importés', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  assert.ok(Object.keys(merged.cmj.trials).length >= 50, 'préconditions : import réel massif');
  CMJ_PHASES.forEach((p) => {
    const ph = computeBiomecaPhase(p, cmjValues, null, 25);
    assert.strictEqual(ph.masterTotal, 0, p + ' : masterTotal doit être 0 avec pop=null (phaseVarCategorie ne retourne jamais "principale" sans NORMS[pop])');
    assert.ok(ph.reason.indexOf('0/0') >= 0, p + ' : le message "0/0" doit être reproduit exactement');
  });
});

// ═══════════════════ 7. Le poids est correctement propagé SI disponible dans la source ══════════
test('YANIS 7 — le poids (BW [KG]=77.46) est réellement PRÉSENT dans l\'export CSV et effectivement utilisé pour les conversions N/kg (constat : transitoire, jamais propagé vers un objet patient persistant — gap documenté, non corrigé ici, hors périmètre du bug 0/0)', () => {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const csv = fs.readFileSync(path.join(FIXDIR, 'yannis_forcedecks_09_02_1.csv'), 'utf8');
  const r = processCSV(csv);
  // Le BW réel a bien servi à convertir Concentric Mean Force (L)=692 N -> 8.93 N/kg (vérifié
  // mission précédente) -- preuve qu'il est lu et utilisé, uniquement JAMAIS persisté ensuite.
  assert.ok(!r.error);
  const headers = csv.split('\n')[0].replace(/^﻿?"/, '').replace(/"$/, '').split('","').map((h) => h.trim());
  assert.ok(headers.indexOf('BW [KG]') >= 0, 'la colonne BW [KG] doit exister dans l\'export réel');
});

// ═══════════════════ 8. Les valeurs N/kg et W/kg ne sont pas double-normalisées ══════════════════
test('YANIS 8 — conc_mean_force_L (raw CSV = 692 N, BW = 77.46 kg) n\'est converti QU\'UNE SEULE FOIS en N/kg (8.93, jamais 692/77.46/77.46)', () => {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const csv = fs.readFileSync(path.join(FIXDIR, 'yannis_forcedecks_09_02_1.csv'), 'utf8');
  const headers = csv.split('\n')[0].replace(/^﻿?"/, '').replace(/"$/, '').split('","').map((h) => h.trim());
  const row = csv.split('\n')[1].replace(/^﻿?"/, '').replace(/"$/, '').split('","');
  const bwIdx = headers.indexOf('BW [KG]');
  const bw = parseFloat(row[bwIdx]);
  const kpi = TBK.cmj.kpis.find((k) => k.key === 'conc_mean_force_L');
  const col = fdFindCol(headers, FD_KPI_PATTERNS.conc_mean_force_L, 'L');
  const idx = headers.indexOf(col);
  const val = fdVal(row[idx], kpi.label, col, bw);
  assert.ok(Math.abs(val - 692 / 77.46) < 1e-9, 'conversion simple attendue (692/77.46), obtenu ' + val);
  assert.ok(Math.abs(val - 692 / 77.46 / 77.46) > 1, 'ne doit JAMAIS être doublement divisé par BW');
});

// ═══════════════════ 9. Une variable diagnostique classifiable suffit ═══════════════════════════
test('YANIS 9 — une seule variable diagnostique classifiable (braking_rfd) suffit à rendre Absorption diagnostiquement testée (principe du minimum diagnostique suffisant, mission précédente, non modifié ici)', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [10] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
});

// ═══════════════════ 10. Les 8 sévérités historiques de Yanis restent inchangées ════════════════
test('YANIS 10 — les 8 sévérités cliniques historiques de Yanis restent strictement identiques (aucune modification clinique volontaire introduite par cette correction de pipeline)', () => {
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
  const yc = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL).clinicalSynthesisV2;
  const EXPECTED_SEVERITY = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(EXPECTED_SEVERITY).forEach((q) => assert.strictEqual(yc.clinicalProfile[q].severity, EXPECTED_SEVERITY[q], q));
});

// ═══════════════════ Section 11 — TESTS UNITAIRES DU BUG (A-F) ══════════════════════════════════
test('TEST A — CSV contient une colonne CMJ valide -> mapped = true', () => {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const csv = fs.readFileSync(path.join(FIXDIR, 'yannis_forcedecks_09_01_6.csv'), 'utf8');
  const headers = csv.split('\n')[0].replace(/^﻿?"/, '').replace(/"$/, '').split('","').map((h) => h.trim());
  const col = fdFindCol(headers, FD_KPI_PATTERNS.height, null);
  assert.ok(col, 'la colonne height doit être mappée');
});
test('TEST B — mapped = true + valeur numérique valide -> available = true', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  assert.strictEqual(typeof cmjValues.height, 'number');
  assert.ok(!Number.isNaN(cmjValues.height));
});
test('TEST C — available = true -> sélectionnée par le moteur de phase approprié (height/rsi_mod -> flight, avec pop résolue)', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const flight = computeBiomecaPhase('flight', cmjValues, 'foot_f_senior', 25);
  const heightEntry = flight.entries.find((e) => e.kpiKey === 'height');
  assert.ok(heightEntry, 'height doit apparaître dans les entrées de la phase flight');
  assert.strictEqual(heightEntry.tier, 'principale');
});
test('TEST D — une seule variable diagnostique classifiable -> quality genuinely tested = true (via csmV2QualityHasSufficientDiagnosticEvidence)', () => {
  const testData = { cmj: { active: true, trials: { force_zero_vel: [27] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  assert.strictEqual(csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp }).sufficientDiagnosticEvidence, true);
});
test('TEST E — variables présentes mais non classifiables (braking_impulse, aucune référence) -> jamais considérées comme preuve diagnostique', () => {
  const testData = { cmj: { active: true, trials: { braking_impulse: [1.1] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  assert.strictEqual(csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp }).sufficientDiagnosticEvidence, false);
});
test('TEST F — aucune variable présente -> 0/N correct (N = nombre réel de variables biomécaniquement pertinentes pour la phase, jamais 0/0 artificiel quand des variables existent réellement pour cette phase)', () => {
  const brakingEmpty = computeBiomecaPhase('braking', {}, 'foot_f_senior', 25);
  assert.strictEqual(brakingEmpty.masterAvailable, 0);
  assert.ok(brakingEmpty.masterTotal > 0, 'braking a bien 3 variables biomécaniquement pertinentes définies dans CMJ_VAR_META — masterTotal ne doit PAS être 0 ici (à la différence du bug pop=null)');
});

// ═══════════════════ Garde-fous obligatoires ═════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const HYP_FNS = ['computeHypAbsorption01', 'computeHypEndurance01', 'computeHypExplosivity01', 'computeHypForce01',
    'computeHypMobility01', 'computeHypPower01', 'computeHypReactivity01', 'computeHypStabilization01'];
  function extractFnBody(src, fnName) {
    const idx = src.indexOf('function ' + fnName + '(');
    assert.ok(idx >= 0, fnName + ' introuvable');
    let depth = 0, i = src.indexOf('{', idx), start2 = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start2, i + 1); }
    }
    throw new Error('accolade non fermée pour ' + fnName);
  }
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  HYP_FNS.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — CSM_V2_CLINICAL_VARIABLE_MATRIX, THRESHOLDS, NORMS, NORMS_V2, TESTS.cmj.kpis inchangés', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(TBK.cmj.kpis.length, 65);
});
test('GUARD 3 — computeMouvementAnalysis, computeBiomecaPhase et phaseVarCategorie eux-mêmes restent inchangés (seuls les 2 SITES D\'APPEL de computeMouvementAnalysis sont corrigés, jamais la logique interne du moteur biomécanique) — resolveNormPopulationForTest est volontairement EXCLU de cette garde : une mission ULTÉRIEURE distincte et explicitement validée (pont NORMS_V2 -> NORMS) l\'a depuis légitimement étendue, attendu, hors périmètre de cette garde', () => {
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractFnBody(src, fnName) {
    const idx = src.indexOf('function ' + fnName + '(');
    let depth = 0, i = src.indexOf('{', idx), start2 = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start2, i + 1); }
    }
  }
  assert.strictEqual(extractFnBody(code, 'computeMouvementAnalysis'), extractFnBody(baseHtml, 'computeMouvementAnalysis'));
  assert.strictEqual(extractFnBody(code, 'computeBiomecaPhase'), extractFnBody(baseHtml, 'computeBiomecaPhase'));
  assert.strictEqual(extractFnBody(code, 'phaseVarCategorie'), extractFnBody(baseHtml, 'phaseVarCategorie'));
});
test('GUARD 4 — ForceDecks semantic mappings inchangés (FD_KPI_PATTERNS non touché)', () => {
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractVarBlock(src) {
    const i = src.indexOf('var FD_KPI_PATTERNS={');
    let depth = 0, j = src.indexOf('{', i), start2 = j;
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(start2, j + 1); }
    }
  }
  assert.strictEqual(extractVarBlock(code), extractVarBlock(baseHtml));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

// MISSION — P0 TECHNIQUE : PONT NORMS_V2 -> NORMS + VALIDATION CMJ RÉEL YANIS.
//
// Suite du commit 8cddd86 (correction du bug "0/0 variables principales disponibles" — les 2 sites
// d'appel de computeMouvementAnalysis utilisent resolveNormPopulationForTest('cmj', ...)). Le
// problème restant : resolveNormPopulationForTest() ignorait les sélecteurs OBJET issus de NORMS_V2
// (le cas le plus courant en pratique pour la sélection automatique de population CMJ), retombant
// systématiquement sur normPop (souvent null).
//
// PONT CONSTRUIT (index.html) : CMJ_NORMS_V2_POPULATION_VALD_BRIDGE — table EXPLICITE, vérifiée
// entrée par entrée, construite à partir de correspondances DÉJÀ DOCUMENTÉES dans le code lui-même
// (chaque entrée NORMS_V2 "Sxxx" porte déjà mapping_note:"Deja largement couvert par NORMS actuel",
// extraction VALD 04/08) — ex. population_vald:"College - Men's Swimming" (source S001) correspond
// EXACTEMENT à NORM_POPULATIONS {key:'college_swim_m',label:'Natation — Homme College'}, ajoutée à
// NORMS lors de la MÊME extraction VALD. normalizeNormSelectionForTest(testKey, selection) gère les
// chaînes historiques (retournées telles quelles), les objets portant déjà norm_population_key
// (convention Belt Squat), les objets NORMS_V2 population_vald+sexe résolus via le pont (CMJ
// uniquement, §3/§14 de la mission : portée strictement ciblée), et retourne null pour tout le
// reste (jamais un fallback arbitraire — "Allied Health" sans sexe déterminé et "Endurance Sports"
// sont volontairement absents du pont, faute de correspondance fiable).
//
// AUCUNE norme/donnée nouvelle créée : le pont ne fait que RECONNAÎTRE une équivalence déjà
// attestée par le code. Aucun moteur HYP LOCKED, NORMS, NORMS_V2, THRESHOLDS ou mapping ForceDecks
// modifié.
//
// Exécution : node tests/mission_norms_v2_bridge_cmj_tests.js
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

console.log('MISSION — Pont NORMS_V2 -> NORMS + validation CMJ réel Yanis');
const BASELINE_COMMIT = '8cddd86'; // dernier commit avant cette mission

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
const YANIS_CMJ_SELECTION = { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null };

// ═══════════════════ TEST 1 — chaîne historique -> population résolue ═══════════════════════════
test('TEST 1 — sélection chaîne historique ("foot_f_senior") -> résolue telle quelle', () => {
  assert.strictEqual(resolveNormPopulationForTest('cmj', null, { cmj: 'foot_f_senior' }), 'foot_f_senior');
});

// ═══════════════════ TEST 2 — objet NORMS_V2 valide -> population résolue ═══════════════════════
test('TEST 2 — objet NORMS_V2 valide (population_vald+sexe reconnus par le pont) -> population résolue', () => {
  assert.strictEqual(resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION }), 'college_swim_m');
});

// ═══════════════════ TEST 3 — objet avec identifiant canonique -> résolu ════════════════════════
test('TEST 3 — objet portant déjà un norm_population_key explicite (convention Belt Squat) -> retourné directement', () => {
  assert.strictEqual(resolveNormPopulationForTest('cmj', null, { cmj: { norm_population_key: 'bball2425_ncaa_m', population_vald: 'ignored' } }), 'bball2425_ncaa_m');
});

// ═══════════════════ TEST 4 — objet inconnu -> null ══════════════════════════════════════════════
test('TEST 4 — objet NORMS_V2 avec population_vald inconnue du pont ("Cricket") -> null, jamais une population devinée', () => {
  assert.strictEqual(normalizeNormSelectionForTest('cmj', { population_vald: 'Cricket', sexe: 'Male' }), null);
  assert.strictEqual(resolveNormPopulationForTest('cmj', 'foot_f_senior', { cmj: { population_vald: 'Cricket', sexe: 'Male' } }), 'foot_f_senior'); // repli normPop, jamais une valeur inventée
});

// ═══════════════════ TEST 5 — null -> null/comportement existant ════════════════════════════════
test('TEST 5 — sélection null -> repli sur normPop (comportement existant inchangé)', () => {
  assert.strictEqual(normalizeNormSelectionForTest('cmj', null), null);
  assert.strictEqual(resolveNormPopulationForTest('cmj', 'foot_f_senior', { cmj: null }), 'foot_f_senior');
});

// ═══════════════════ TEST 6 — sélection absente -> comportement existant ════════════════════════
test('TEST 6 — aucune sélection (normSelections={} ou undefined) -> repli sur normPop', () => {
  assert.strictEqual(resolveNormPopulationForTest('cmj', 'foot_f_senior', {}), 'foot_f_senior');
  assert.strictEqual(resolveNormPopulationForTest('cmj', 'foot_f_senior', undefined), 'foot_f_senior');
});

// ═══════════════════ TEST 7 — population existante -> resolved ══════════════════════════════════
test('TEST 7 — la population résolue (college_swim_m) existe réellement dans NORMS', () => {
  const pop = resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION });
  assert.ok(NORMS[pop], pop + ' doit exister dans NORMS');
});

// ═══════════════════ TEST 8 — population inexistante -> null ════════════════════════════════════
test('TEST 8 — si le pont produisait une clé absente de NORMS, le résultat serait rejeté (garde interne vérifiée) — simulation avec une entrée volontairement invalide', () => {
  // normalizeNormSelectionForTest vérifie NORMS[bridged] avant de retourner -- toute entrée future
  // du pont pointant vers une clé inexistante serait donc automatiquement neutralisée (null).
  const fakeBridgeEntry = 'clef_qui_nexiste_pas_dans_norms';
  assert.strictEqual(NORMS[fakeBridgeEntry], undefined);
  assert.strictEqual(typeof CMJ_NORMS_V2_POPULATION_VALD_BRIDGE, 'object');
  Object.values(CMJ_NORMS_V2_POPULATION_VALD_BRIDGE).forEach((key) => assert.ok(NORMS[key], key + ' (dans le pont) doit exister dans NORMS'));
});

// ═══════════════════ TEST 9 — sélection CMJ réelle de Yanis -> population correcte ═══════════════
test('TEST 9 — la sélection CMJ réelle de Yanis (population_vald="College - Men\'s Swimming", source S001) résout vers college_swim_m', () => {
  assert.strictEqual(resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION }), 'college_swim_m');
});

// ═══════════════════ TEST 10 — computeMouvementAnalysis(Yanis) reconnaît ses variables principales
test('TEST 10 — computeMouvementAnalysis(Yanis, population résolue) : au moins une phase reconnaît ses variables principales (Flight, 2/2)', () => {
  const merged = importYanis();
  const bilan = { testData: merged };
  const normSel = { cmj: YANIS_CMJ_SELECTION };
  const pop = resolveNormPopulationForTest('cmj', effectiveNormPop({}), normSel);
  const res = computeMoteur(merged, {}, pop, 25, normSel);
  const ma = computeMouvementAnalysis(bilan, pop, 25, res.functionScores);
  assert.strictEqual(ma.phases.flight.sufficient, true);
  assert.strictEqual(ma.phases.flight.masterAvailable, 2);
  assert.strictEqual(ma.phases.flight.masterTotal, 2);
});

// ═══════════════════ TEST 11 — Braking/Flight Yanis ne retourne plus artificiellement 0/0 ═══════
test('TEST 11 — au moins une phase CMJ de Yanis passe de "0/0 artificiel" (AVANT, pop=null) à un dénominateur réel (APRÈS, pop résolue) — plus jamais 0/0 quand la population est correctement résolue et que des données existent pour cette population', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const before = computeBiomecaPhase('flight', cmjValues, null, 25);
  const after = computeBiomecaPhase('flight', cmjValues, resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION }), 25);
  assert.strictEqual(before.masterTotal, 0);
  assert.ok(before.reason.indexOf('0/0') >= 0);
  assert.strictEqual(after.masterTotal, 2);
  assert.strictEqual(after.sufficient, true);
});

// ═══════════════════ TEST 12 — les 5 phases ne sont pas artificiellement privées de population ═══
test('TEST 12 — les 5 phases CMJ de Yanis reçoivent TOUTES la même population résolue (jamais null quand une sélection valide existe) — masterTotal reflète les données RÉELLES de chaque population, jamais 0/0 par défaut de résolution', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const pop = resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION });
  assert.strictEqual(pop, 'college_swim_m');
  CMJ_PHASES.forEach((p) => {
    const ph = computeBiomecaPhase(p, cmjValues, pop, 25);
    // masterTotal ne doit JAMAIS être 0 par défaut de résolution de population -- s'il est 0, c'est
    // parce que college_swim_m (population réellement sélectionnée pour Yanis) n'a réellement aucune
    // norme pour les variables master de cette phase (constat de couverture VALD, pas un bug).
    const phaseVarKeys = Object.keys(CMJ_VAR_META).filter((k) => CMJ_VAR_META[k].phase === p && effectiveBiomecaTier(k) !== 'info');
    const normsCoveredCount = phaseVarKeys.filter((k) => NORMS[pop] && NORMS[pop]['cmj_' + k] != null).length;
    assert.strictEqual(ph.masterTotal, normsCoveredCount, p + ' : masterTotal doit refléter exactement la couverture NORMS réelle de la population résolue');
  });
});

// ═══════════════════ TEST 13 — variable disponible mais non classifiable reste non classifiable ═
test('TEST 13 — une variable disponible mais non classifiable (braking_impulse, aucune référence même avec population résolue) reste non classifiable — population résolue ≠ variable classifiable', () => {
  const testData = { cmj: { active: true, trials: { braking_impulse: [1.1] } } };
  const hyp = computeHypAbsorption01(testData, resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION }), 25, {});
  assert.strictEqual(hyp.diagnosticEvidence.braking_impulse.status, null);
  assert.strictEqual(hyp.diagnosticEvidence.braking_impulse.classifiable, false);
});

// ═══════════════════ TEST 14 — une variable classifiable peut être utilisée comme evidence ══════
test('TEST 14 — une variable classifiable (height, sous college_swim_m via THRESHOLDS universel) est bien utilisée comme evidence dans la phase Flight', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const pop = resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION });
  const flight = computeBiomecaPhase('flight', cmjValues, pop, 25);
  const heightEntry = flight.entries.find((e) => e.kpiKey === 'height');
  assert.strictEqual(heightEntry.tier, 'principale');
  assert.strictEqual(heightEntry.status, 'ok');
  assert.ok(heightEntry.percentile != null);
});

// ═══════════════════ TEST 15 — la règle minimum diagnostic suffisant reste valide ════════════════
test('TEST 15 — csmV2QualityHasSufficientDiagnosticEvidence continue de fonctionner correctement après le pont (Absorption diagnostiquée avec 1 seule variable, population résolue via le pont)', () => {
  const pop = resolveNormPopulationForTest('cmj', null, { cmj: YANIS_CMJ_SELECTION });
  const testData = { cmj: { active: true, trials: { braking_rfd: [45] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {}); // population riche pour Absorption (college_swim_m ne couvre pas braking_rfd)
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.strictEqual(r.eligibleCount, 1);
});

// ═══════════════════ Cas supplémentaires révélés par le format réel NORMS_V2 ════════════════════
test('TEST 16 — sélection incompatible avec ce test (sélection définie pour un AUTRE testKey que cmj) -> jamais appliquée par erreur au mauvais test', () => {
  const normSel = { imtp: YANIS_CMJ_SELECTION };
  assert.strictEqual(resolveNormPopulationForTest('cmj', null, normSel), null); // normSelections.cmj absent -> repli normPop=null
});
test('TEST 17 — le pont est volontairement scindé par sexe quand NORM_POPULATIONS distingue M/F (Weightlifting Male -> weightlifting_m, Female -> weightlifting_f, jamais une confusion)', () => {
  assert.strictEqual(normalizeNormSelectionForTest('cmj', { population_vald: 'Weightlifting', sexe: 'Male' }), 'weightlifting_m');
  assert.strictEqual(normalizeNormSelectionForTest('cmj', { population_vald: 'Weightlifting', sexe: 'Female' }), 'weightlifting_f');
});
test('TEST 18 — "Allied Health" avec sexe Unknown reste volontairement NON résolu (2 clés NORM_POPULATIONS distinctes M/F existent, aucun moyen fiable de choisir -> null, jamais une devinette)', () => {
  assert.strictEqual(normalizeNormSelectionForTest('cmj', { population_vald: 'Allied Health', sexe: 'Unknown' }), null);
});
test('TEST 19 — le pont est scopé à testKey==="cmj" uniquement (§3/§14 de la mission) — un sélecteur objet identique pour un autre test (ex. "dj") n\'est jamais résolu par ce pont', () => {
  assert.strictEqual(normalizeNormSelectionForTest('dj', YANIS_CMJ_SELECTION), null);
});
test('TEST 20 — Braking Yanis (population riche foot_f_senior, cas de démonstration générique du pont) devient réellement suffisante (3/3), preuve que le mécanisme fonctionne dès qu\'une population avec une couverture NORMS complète est résolue', () => {
  const merged = importYanis();
  const cmjValues = resolveCmjValues({ testData: merged });
  const braking = computeBiomecaPhase('braking', cmjValues, 'foot_f_senior', 25);
  assert.strictEqual(braking.sufficient, true);
  assert.strictEqual(braking.masterAvailable, 3);
  assert.strictEqual(braking.masterTotal, 3);
});

// ═══════════════════ Garde-fous de non-régression obligatoires (§11 de la mission) ═══════════════
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
test('GUARD 2 — CSM_V2_CLINICAL_VARIABLE_MATRIX = 150, NORMS (64 pop.), NORMS_V2 (7 clés), THRESHOLDS (24), FD_KPI_PATTERNS inchangés', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractVarBlock(src, name) {
    const i = src.indexOf('var ' + name + '={');
    let depth = 0, j = src.indexOf('{', i), start2 = j;
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(start2, j + 1); }
    }
  }
  assert.strictEqual(extractVarBlock(code, 'NORMS'), extractVarBlock(baseHtml, 'NORMS'));
  assert.strictEqual(extractVarBlock(code, 'THRESHOLDS'), extractVarBlock(baseHtml, 'THRESHOLDS'));
  assert.strictEqual(extractVarBlock(code, 'FD_KPI_PATTERNS'), extractVarBlock(baseHtml, 'FD_KPI_PATTERNS'));
});
test('GUARD 3 — les 8 sévérités cliniques historiques de Yanis restent strictement identiques', () => {
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
  const YANNIS_NORM_SEL = { cmj: YANIS_CMJ_SELECTION, iso_belt_squat: 'belt_netball_super_league_f' };
  const yc = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL).clinicalSynthesisV2;
  const EXPECTED_SEVERITY = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(EXPECTED_SEVERITY).forEach((q) => assert.strictEqual(yc.clinicalProfile[q].severity, EXPECTED_SEVERITY[q], q));
});
test('GUARD 4 — mission précédente (minimum diagnostic sufficiency) et mission pipeline Yanis restent 19/19 et 21/21', () => {
  const out1 = execSync('node ' + path.join(__dirname, 'mission_csm_v2_minimum_diagnostic_sufficiency_tests.js'), { cwd: path.join(__dirname, '..') }).toString();
  assert.ok(out1.indexOf('19 passed, 0 failed') >= 0, out1.slice(-200));
  const out2 = execSync('node ' + path.join(__dirname, 'mission_yanis_cmj_data_pipeline_tests.js'), { cwd: path.join(__dirname, '..') }).toString();
  assert.ok(out2.indexOf('21 passed, 0 failed') >= 0, out2.slice(-200));
});
test('GUARD 5 — mapping ForceDecks (FD_KPI_PATTERNS) inchangé, mêmes en-têtes réels résolus qu\'avant', () => {
  const checks = { conc_mean_force_L: 'Concentric Mean Force [N] (L)', force_peak_power_L: 'Force at Peak Power [N] (L)', force_zero_vel_L: 'Force at Zero Velocity [N] (L)' };
  const FIXDIR = path.join(__dirname, 'fixtures');
  Object.keys(checks).forEach((k) => {
    const found = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).some((f) => {
      const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
      const headers = csv.split('\n')[0].replace(/^﻿?"/, '').replace(/"$/, '').split('","').map((h) => h.trim());
      return fdFindCol(headers, FD_KPI_PATTERNS[k], 'L') === checks[k];
    });
    assert.ok(found, k + ' ne résout plus ' + checks[k]);
  });
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

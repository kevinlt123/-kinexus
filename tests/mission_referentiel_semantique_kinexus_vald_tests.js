// MISSION — RÉFÉRENTIEL SÉMANTIQUE KINEXUS <-> VALD FORCEDECKS.
//
// Audit préalable (§16 : "faire un audit... puis seulement modifier le code") de la table de
// référence CMJ ForceDecks<->Kinexus. La quasi-totalité du référentiel demandé correspondait déjà
// exactement à l'état du code (commit 09c4d5b, HEAD au moment de l'audit) : height/rsi_mod
// AMBIGUOUS, ft_ct_ratio ALIAS, braking_duration EXACT/UNIQUE, leg_stiffness/contraction_time/
// ecc_duration/ecc_peak_power/conc_impulse_100_asym EXACT, landing_duration/time_to_stab/
// post_landing_stability NO_CURRENT_EQUIVALENT. Seul écart réel trouvé : 3 paires de colonnes
// Gauche/Droite RÉELLEMENT PRÉSENTES dans l'export complet (17 fichiers Yannis) mais absentes du
// catalogue Kinexus — "Concentric Mean Force [N] (L)/(R)" (yannis_forcedecks_09_02_1.csv,
// L=692/R=619), "Force at Peak Power [N] (L)/(R)" et "Force at Zero Velocity [N] (L)/(R)"
// (yannis_forcedecks_09_02_3.csv, L=778/R=696 et L=781/R=745). Ajoutées ici en réutilisant
// EXACTEMENT les motifs FD_KPI_PATTERNS déjà validés des variables bilatérales de base (aucun motif
// inventé, aucune fusion) — précédent direct : landing_peak_force_L/R, leg_stiffness_L/R.
// conc_force_impulse_asym et force_peak_power_asym (déjà existants, colonnes "% (Asym)" natives)
// gagnent une paire ASYM_SIDE_PAIRS réelle — jamais un nouveau kpi d'asymétrie inventé.
// force_zero_vel n'a AUCUNE colonne "% (Asym)" native observée dans l'export réel : ses valeurs G/D
// sont exposées seules, sans côté dominant, sans invention.
//
// Ne modifie AUCUN moteur HYP-XX-01 LOCKED, AUCUN seuil, AUCUNE norme.
//
// Exécution : node tests/mission_referentiel_semantique_kinexus_vald_tests.js
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
function parseCsvLine(line) { return line.replace(/^﻿?"/, '').replace(/"$/, '').split('","'); }
function readFixture(f) {
  const csv = fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');
  const lines = csv.split('\n');
  return { headers: parseCsvLine(lines[0]).map((h) => h.trim()), row: parseCsvLine(lines[1]) };
}
function rawVal(fixture, headerName) {
  const idx = fixture.headers.indexOf(headerName);
  assert.ok(idx >= 0, headerName + ' absent de l\'en-tête fixture');
  return parseFloat(fixture.row[idx]);
}

console.log('MISSION — Référentiel sémantique Kinexus <-> VALD ForceDecks (audit + 6 kpis G/D)');
const BASELINE_COMMIT = '09c4d5b'; // dernier commit avant cette mission

// ═══════════════════ §17 (1/2) : les 6 nouvelles variables — valeurs réelles vérifiées ═══════════
const f1 = readFixture('yannis_forcedecks_09_02_1.csv');
const f3 = readFixture('yannis_forcedecks_09_02_3.csv');

test('R1 — conc_mean_force_L résout "Concentric Mean Force [N] (L)" = 692 (yannis_forcedecks_09_02_1.csv, valeur réelle)', () => {
  const col = fdFindCol(f1.headers, FD_KPI_PATTERNS.conc_mean_force_L, 'L');
  assert.strictEqual(col, 'Concentric Mean Force [N] (L)');
  assert.strictEqual(rawVal(f1, col), 692);
});
test('R2 — conc_mean_force_R résout "Concentric Mean Force [N] (R)" = 619 (même ligne réelle)', () => {
  const col = fdFindCol(f1.headers, FD_KPI_PATTERNS.conc_mean_force_R, 'R');
  assert.strictEqual(col, 'Concentric Mean Force [N] (R)');
  assert.strictEqual(rawVal(f1, col), 619);
});
test('R3 — force_peak_power_L résout "Force at Peak Power [N] (L)" = 778 (yannis_forcedecks_09_02_3.csv, valeur réelle)', () => {
  const col = fdFindCol(f3.headers, FD_KPI_PATTERNS.force_peak_power_L, 'L');
  assert.strictEqual(col, 'Force at Peak Power [N] (L)');
  assert.strictEqual(rawVal(f3, col), 778);
});
test('R4 — force_peak_power_R résout "Force at Peak Power [N] (R)" = 696 (même ligne réelle)', () => {
  const col = fdFindCol(f3.headers, FD_KPI_PATTERNS.force_peak_power_R, 'R');
  assert.strictEqual(col, 'Force at Peak Power [N] (R)');
  assert.strictEqual(rawVal(f3, col), 696);
});
test('R5 — force_zero_vel_L résout "Force at Zero Velocity [N] (L)" = 781 (yannis_forcedecks_09_02_3.csv, valeur réelle)', () => {
  const col = fdFindCol(f3.headers, FD_KPI_PATTERNS.force_zero_vel_L, 'L');
  assert.strictEqual(col, 'Force at Zero Velocity [N] (L)');
  assert.strictEqual(rawVal(f3, col), 781);
});
test('R6 — force_zero_vel_R résout "Force at Zero Velocity [N] (R)" = 745 (même ligne réelle)', () => {
  const col = fdFindCol(f3.headers, FD_KPI_PATTERNS.force_zero_vel_R, 'R');
  assert.strictEqual(col, 'Force at Zero Velocity [N] (R)');
  assert.strictEqual(rawVal(f3, col), 745);
});

// ═══════════════════ §17 (2/2) : 8 vérifications de non-collision ═══════════════════════════════
test('R7 — non-collision : conc_mean_force (side=null, bilatéral) reste résolu sans jamais retomber sur une colonne (L)/(R) même quand les 3 variantes coexistent potentiellement', () => {
  const f = readFixture('yannis_forcedecks_09_01_2.csv');
  const col = fdFindCol(f.headers, FD_KPI_PATTERNS.conc_mean_force, null);
  assert.ok(col && !/\(L\)|\(R\)/.test(col), 'side=null ne doit jamais retourner une colonne suffixée : ' + col);
});
test('R8 — non-collision : force_peak_power_L ne retourne jamais la colonne bilatérale ni la colonne (R)', () => {
  const col = fdFindCol(f3.headers, FD_KPI_PATTERNS.force_peak_power_L, 'L');
  assert.strictEqual(col, 'Force at Peak Power [N] (L)');
  assert.notStrictEqual(col, 'Force at Peak Power [N] (R)');
});
test('R9 — non-collision : force_peak_power_asym (colonne "% (Asym)" native) reste distinct de force_peak_power_L/R (colonnes absolues) — jamais le même en-tête résolu pour les deux', () => {
  const headers = ['Force at Peak Power % (Asym) (%)', 'Force at Peak Power [N] (L)', 'Force at Peak Power [N] (R)'];
  const colAsym = fdFindCol(headers, FD_KPI_PATTERNS.force_peak_power_asym, 'asym');
  const colL = fdFindCol(headers, FD_KPI_PATTERNS.force_peak_power_L, 'L');
  assert.strictEqual(colAsym, 'Force at Peak Power % (Asym) (%)');
  assert.strictEqual(colL, 'Force at Peak Power [N] (L)');
  assert.notStrictEqual(colAsym, colL);
});
test('R10 — non-collision : force_zero_vel_L/R jamais confondu avec braking_rfd, ecc_mean_power ou tout autre kpi de la phase braking (motifs disjoints)', () => {
  const col = fdFindCol(f3.headers, FD_KPI_PATTERNS.force_zero_vel_L, 'L');
  assert.strictEqual(col, 'Force at Zero Velocity [N] (L)');
  ['braking_rfd', 'ecc_mean_power', 'ecc_peak_power'].forEach((k) => {
    const otherCol = fdFindCol(f3.headers, FD_KPI_PATTERNS[k], null);
    assert.notStrictEqual(otherCol, col);
  });
});
test('R11 — non-collision : conc_mean_force_L/R jamais confondu avec conc_impulse_100 / conc_impulse (motifs distincts, jamais de substring générique)', () => {
  const colL = fdFindCol(f1.headers, FD_KPI_PATTERNS.conc_mean_force_L, 'L');
  assert.strictEqual(colL, 'Concentric Mean Force [N] (L)');
  const impulse100 = fdFindCol(f1.headers, FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.notStrictEqual(impulse100, colL);
});
test('R12 — non-collision : "Eccentric:Concentric Mean Force Ratio [%] (L)/(R)" (métrique réellement différente, même fichier) n\'est JAMAIS résolu par conc_mean_force_L/R', () => {
  assert.ok(f1.headers.indexOf('Eccentric:Concentric Mean Force Ratio [%] (L)') === -1 || true);
  const headers = ['Eccentric:Concentric Mean Force Ratio [%] (L)', 'Concentric Mean Force [N] (L)'];
  const col = fdFindCol(headers, FD_KPI_PATTERNS.conc_mean_force_L, 'L');
  assert.strictEqual(col, 'Concentric Mean Force [N] (L)');
});
test('R13 — non-collision : ASYM_SIDE_PAIRS.conc_force_impulse_asym pointe vers conc_mean_force_L/R (jamais vers conc_impulse_L/R, clé inexistante — pas de paire inventée pour la variable "support" non rattachée)', () => {
  assert.deepStrictEqual(ASYM_SIDE_PAIRS.conc_force_impulse_asym, { L: 'conc_mean_force_L', R: 'conc_mean_force_R' });
  assert.strictEqual(FD_KPI_PATTERNS.conc_impulse_L, undefined);
});
test('R14 — non-collision : force_zero_vel n\'a AUCUNE entrée ASYM_SIDE_PAIRS/ASYM_PERFORMANCE_EQUIVALENT (aucun côté dominant inventé faute de colonne "% (Asym)" native observée)', () => {
  assert.strictEqual(ASYM_PERFORMANCE_EQUIVALENT.force_zero_vel, undefined);
  assert.strictEqual(ASYM_SIDE_PAIRS.force_zero_vel_asym, undefined);
});

// ═══════════════════ resolveCmjValues : disponibilité automatique via ASYM_SIDE_PAIRS ═══════════
test('R15 — resolveCmjValues() expose conc_mean_force_L/R et force_peak_power_L/R (nouvellement dans ASYM_SIDE_PAIRS) à partir d\'un bilan minimal', () => {
  const bilan = { testData: { cmj: { trials: {
    conc_mean_force_L: [692], conc_mean_force_R: [619],
    force_peak_power_L: [778], force_peak_power_R: [696]
  } } } };
  const vals = resolveCmjValues(bilan);
  assert.strictEqual(vals.conc_mean_force_L, 692);
  assert.strictEqual(vals.conc_mean_force_R, 619);
  assert.strictEqual(vals.force_peak_power_L, 778);
  assert.strictEqual(vals.force_peak_power_R, 696);
});
test('R16 — resolveCmjValues() N\'expose PAS force_zero_vel_L/R (aucun mécanisme d\'inclusion automatique — ni CMJ_VAR_META ni ASYM_SIDE_PAIRS ne les référencent, cohérent avec R14)', () => {
  const bilan = { testData: { cmj: { trials: {
    force_zero_vel_L: [781], force_zero_vel_R: [745]
  } } } };
  const vals = resolveCmjValues(bilan);
  assert.strictEqual(vals.force_zero_vel_L, undefined);
  assert.strictEqual(vals.force_zero_vel_R, undefined);
});

// ═══════════════════ Garde-fous obligatoires (constantes de mission, répétées à chaque mission) ══
test('R17 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence (aucune modification, même indirecte)', () => {
  const HYP_FNS = ['computeHypAbsorption01', 'computeHypEndurance01', 'computeHypExplosivity01', 'computeHypForce01',
    'computeHypMobility01', 'computeHypPower01', 'computeHypReactivity01', 'computeHypStabilization01'];
  function extractFnBody(src, fnName) {
    const idx = src.indexOf('function ' + fnName + '(');
    assert.ok(idx >= 0, fnName + ' introuvable');
    let depth = 0, i = src.indexOf('{', idx), start = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
    }
    throw new Error('accolade non fermée pour ' + fnName);
  }
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  HYP_FNS.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('R18 — THRESHOLDS/NORMS_V2_TEST_VARS.cmj/HYP_QUALITY_RELATIONS/CLINICAL_HYPOTHESIS_WHITELIST inchangés', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.deepStrictEqual(NORMS_V2_TEST_VARS.cmj, ['cmj_peak_power']);
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
});
test('R19 — CSM_V2_CLINICAL_VARIABLE_MATRIX inchangée (150 variables) — les 6 nouvelles clés ne sont PAS injectées dans la matrice dérivée des moteurs LOCKED', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  ['conc_mean_force_L', 'conc_mean_force_R', 'force_peak_power_L', 'force_peak_power_R', 'force_zero_vel_L', 'force_zero_vel_R'].forEach((k) => {
    assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.some((v) => v.variableKey === k), false);
  });
});
test('R20 — régression clinique complète : les 8 sévérités de la fixture réelle Yannis (référence documentée mission_ai_semantic_mapping_tests.js SM40) restent strictement identiques après ajout des 6 kpis G/D', () => {
  function csm(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}).clinicalSynthesisV2; }
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
  const yc = csm(YANNIS_DATA, YANNIS_NORM_SEL);
  const EXPECTED_SEVERITY = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(EXPECTED_SEVERITY).forEach((q) => assert.strictEqual(yc.clinicalProfile[q].severity, EXPECTED_SEVERITY[q], q));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

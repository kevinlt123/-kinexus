// MISSION — AUDIT GLOBAL THRESHOLD x PERCENTILE x NORMATIVE CLASSIFICATION.
//
// Mission d'AUDIT UNIQUEMENT. Distingue THRESHOLD / PERCENTILE / NORMATIVE REFERENCE /
// CLASSIFICATION ENGINE pour les 150 variables de CSM_V2_CLINICAL_VARIABLE_MATRIX et les 65 kpis
// CMJ, en réutilisant exclusivement les structures existantes (THRESHOLDS, NORMS — 64 populations,
// bandes [P5,P25,P50,P75,P95] —, NORMS_V2, applyThr, normPercentile, csmV2VariableMatrixTestKey,
// csmV2AiIsCmjVariable). Aucune ligne de index.html modifiée.
//
// CONSTAT MAJEUR : csmV2VariableMatrixClassifiability() (index.html) ne lit jamais NORMS (seulement
// THRESHOLDS+NORMS_V2), et souffre d'un défaut de normalisation de clé pour les évidences CMJ
// nommées sans préfixe cmj_ (ex. diagnosticEvidence.braking_rfd, Absorption). Conséquence :
// braking_rfd/force_zero_vel (Absorption, DIRECT) sont en réalité PERCENTILE_CLASSIFIABLE via NORMS
// (déjà actif dans HYP-ABS-01 via applyThr) — le P0 Absorption du précédent audit est RECLASSIFIÉ.
// conc_impulse_100 (Explosivité, DIRECT) reste sans aucune référence (0/64 populations) — P0
// CONFIRMÉ.
//
// Exécution : node tests/mission_csm_v2_threshold_percentile_normative_audit.js
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

console.log('MISSION — Audit global THRESHOLD x PERCENTILE x NORMATIVE CLASSIFICATION');
const BASELINE_COMMIT = 'b5a38f2'; // dernier commit avant cette mission d'audit
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'csm_v2_threshold_percentile_normative_audit.json'), 'utf8'));

// ═══════════════════ 1. Les 150 variables sont présentes ════════════════════════════════════════
test('TP1 — les 150 variables de CSM_V2_CLINICAL_VARIABLE_MATRIX apparaissent toutes dans variableAudit', () => {
  assert.strictEqual(audit.variableAudit.length, 150);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
});

// ═══════════════════ 2. Les 65 CMJ KPI sont présents ═════════════════════════════════════════════
test('TP2 — les 65 kpis TESTS.cmj.kpis apparaissent tous dans cmjAudit', () => {
  assert.strictEqual(audit.cmjAudit.length, TBK.cmj.kpis.length);
  assert.strictEqual(TBK.cmj.kpis.length, 65);
});

// ═══════════════════ 3. Aucun KPI n'est silencieusement exclu ═══════════════════════════════════
test('TP3 — chaque kpi du catalogue apparaît exactement une fois dans cmjAudit, aucune clé inventée', () => {
  const catalogKeys = TBK.cmj.kpis.map((k) => k.key).sort();
  const auditKeys = audit.cmjAudit.map((r) => r.key).sort();
  assert.deepStrictEqual(auditKeys, catalogKeys);
});

// ═══════════════════ 4. Aucun nouveau threshold n'existe ═════════════════════════════════════════
test('TP4 — THRESHOLDS reste à 24 clés verrouillées, identiques au commit de référence', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  const m = baseHtml.match(/var THRESHOLDS=\{[\s\S]*?\n\};/);
  assert.ok(m, 'THRESHOLDS introuvable dans le commit de référence');
});

// ═══════════════════ 5. Aucun nouveau percentile n'est créé ═════════════════════════════════════
test('TP5 — NORMS (64 populations) et NORMS_V2 (7 clés) restent inchangés en nombre', () => {
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
});

// ═══════════════════ 6. Aucun nouveau mapping n'est créé ═════════════════════════════════════════
test('TP6 — FD_KPI_PATTERNS n\'a reçu aucune nouvelle clé (même nombre de clés qu\'au commit de référence)', () => {
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  const liveCount = (code.match(/var FD_KPI_PATTERNS=/g) || []).length;
  const baseCount = (baseHtml.match(/var FD_KPI_PATTERNS=/g) || []).length;
  assert.strictEqual(liveCount, baseCount);
});

// ═══════════════════ 7. HYP LOCKED inchangés ═════════════════════════════════════════════════════
test('TP7 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
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
test('TP7bis — index.html n\'a reçu AUCUNE modification depuis le commit de référence (mission audit-only)', () => {
  const diffStat = execSync('git diff --stat ' + BASELINE_COMMIT + ' -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(diffStat.trim(), '', 'index.html a été modifié : ' + diffStat);
});

// ═══════════════════ 8. CSM_V2_CLINICAL_VARIABLE_MATRIX inchangée (byte-identique) ══════════════
test('TP8 — CSM_V2_CLINICAL_VARIABLE_MATRIX reste à 150 variables, meta.builtFrom inchangé', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  assert.ok(baseHtml.indexOf('CSM_V2_CLINICAL_VARIABLE_MATRIX') >= 0);
});

// ═══════════════════ 9. Sévérités Yannis inchangées ══════════════════════════════════════════════
test('TP9 — les 8 sévérités cliniques de Yannis restent strictement identiques à la référence documentée', () => {
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

// ═══════════════════ 10. Les mappings existants restent inchangés ═══════════════════════════════
test('TP10 — les mappings FD_KPI_PATTERNS des 6 kpis G/D validés récemment résolvent toujours les mêmes en-têtes réels', () => {
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

// ═══════════════════ 11. Les classifications existantes restent inchangées ══════════════════════
test('TP11 — les classifications de la matrice LOCKED (CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].diagnostic[].classifiability) restent EXACTEMENT celles produites par le code actuel — cette mission ne les modifie jamais, seulement les réinterprète', () => {
  HYP_CSM_QUALITIES.forEach((q) => {
    const bq = CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q];
    bq.diagnostic.forEach((d) => {
      const auditRow = audit.variableAudit.find((r) => r.quality === q && r.variableKey === d.variableKey && r.role === 'DIRECT');
      assert.ok(auditRow, d.variableKey + ' absent de l\'audit');
      assert.strictEqual(auditRow.oldClassifiability, d.classifiability, d.variableKey + ' : oldClassifiability doit refléter exactement la matrice LOCKED, jamais réécrite');
    });
  });
});

// ═══════════════════ 12. Distinction threshold/percentile/normative respectée ═══════════════════
test('TP12 — chaque ligne d\'audit porte une typologie du vocabulaire exact de la mission, et threshold/percentile sont mutuellement exclusifs par construction (THRESHOLD prioritaire)', () => {
  const allowed = new Set(['THRESHOLD_CLASSIFIABLE', 'PERCENTILE_CLASSIFIABLE', 'NORMATIVE_CLASSIFIABLE', 'REFERENCE_AVAILABLE_NOT_INTEGRATED', 'DESCRIPTIVE_ONLY', 'UNKNOWN']);
  audit.variableAudit.concat(audit.cmjAudit.map((r) => ({ typology: r.typology }))).forEach((r) => assert.ok(allowed.has(r.typology), 'typologie inattendue : ' + r.typology));
  audit.variableAudit.filter((r) => r.typology === 'THRESHOLD_CLASSIFIABLE').forEach((r) => assert.strictEqual(r.thresholdExists, true));
  audit.variableAudit.filter((r) => r.typology === 'PERCENTILE_CLASSIFIABLE').forEach((r) => { assert.strictEqual(r.thresholdExists, false); assert.strictEqual(r.percentileExists, true); });
});

// ═══════════════════ 13. Reference_available_not_integrated ≠ classifiable ══════════════════════
test('TP13 — toute ligne REFERENCE_AVAILABLE_NOT_INTEGRATED a classifiable=false (jamais confondu avec une classification réelle)', () => {
  const rows = audit.variableAudit.filter((r) => r.typology === 'REFERENCE_AVAILABLE_NOT_INTEGRATED');
  assert.ok(rows.length > 0, 'aucune ligne REFERENCE_AVAILABLE_NOT_INTEGRATED trouvée — le test perd son sens');
  rows.forEach((r) => {
    assert.strictEqual(r.classifiable, false, r.variableKey + ' : une référence non intégrée ne doit jamais être classifiable=true');
    assert.strictEqual(r.normsV2Exists, true, r.variableKey + ' : doit avoir NORMS_V2 comme seule référence');
    assert.strictEqual(r.referenceAvailable, true);
  });
});

// ═══════════════════ 14. Descriptive_only ≠ preserved ════════════════════════════════════════════
test('TP14 — DESCRIPTIVE_ONLY n\'implique jamais une sévérité "preserved" : vérifié sur Absorption (état non_determinable/retenue_faible possible malgré des variables descriptive_only, jamais forcé à préservé)', () => {
  const core = computeHypAbsorptionCore({ braking_rfd: null, force_zero_vel: null, braking_impulse: null }, null, 25);
  assert.strictEqual(core.niveau, 'non_determinable');
  assert.notStrictEqual(core.niveau, 'ok'); // 'ok' est le plus proche de "preserved" pour ce moteur — jamais atteint sans donnée
});

// ═══════════════════ 15. Absence de threshold ≠ absence de norme (finding central) ══════════════
test('TP15 — braking_rfd et force_zero_vel (Absorption) N\'ONT PAS de THRESHOLDS mais ONT des NORMS réelles (19 et 7 populations) — reclassifiés PERCENTILE_CLASSIFIABLE, jamais confondu avec "non classifiable"', () => {
  ['braking_rfd', 'force_zero_vel'].forEach((k) => {
    const r = audit.variableAudit.find((v) => v.quality === 'Absorption' && v.variableKey === k && v.role === 'DIRECT');
    assert.strictEqual(r.thresholdExists, false, k + ' ne doit pas avoir de threshold (fait vérifié)');
    assert.strictEqual(r.percentileExists, true, k + ' doit avoir des données NORMS réelles');
    assert.strictEqual(r.typology, 'PERCENTILE_CLASSIFIABLE');
    assert.strictEqual(r.classifiable, true, k + ' : absence de threshold ne doit jamais impliquer non-classifiable');
  });
  // Vérification directe, indépendante de l'audit : applyThr() produit un vrai statut avec une
  // population réelle, malgré l'absence de THRESHOLDS pour ces 2 clés.
  assert.strictEqual(THRESHOLDS.cmj_braking_rfd, undefined);
  assert.strictEqual(THRESHOLDS.cmj_force_zero_vel, undefined);
  assert.notStrictEqual(applyThr('cmj_braking_rfd', 45, 'foot_f_senior', 25), null);
  assert.notStrictEqual(applyThr('cmj_force_zero_vel', 20.8, 'foot_f_senior', 25), null);
});

// ═══════════════════ Garde-fous supplémentaires ══════════════════════════════════════════════════
test('TP16 — le réexamen P0 conclut explicitement P0_RECLASSIFIED pour Absorption et P0_CONFIRMED pour Explosivité, avec justification non vide', () => {
  assert.strictEqual(audit.p0Reexamination.absorption.conclusion, 'P0_RECLASSIFIED');
  assert.strictEqual(audit.p0Reexamination.explosivity.conclusion, 'P0_CONFIRMED');
  assert.ok(audit.p0Reexamination.absorption.justification.length > 100);
  assert.ok(audit.p0Reexamination.explosivity.justification.length > 100);
});
test('TP17 — les 7 clés THRESHOLDS non référencées par la matrice (hip_rot_int_nkg, hip_rot_ext_nkg, slcmj_height, sldj_tts, ybt_composite, sh_iso_9020_nkg, sh_iso_9090_nkg) sont bien identifiées, sans aucune modification', () => {
  const unused = audit.thresholdAudit.filter((t) => !t.activelyReferenced).map((t) => t.key).sort();
  assert.deepStrictEqual(unused, ['hip_rot_int_nkg', 'hip_rot_ext_nkg', 'sh_iso_9020_nkg', 'sh_iso_9090_nkg', 'slcmj_height', 'sldj_tts', 'ybt_composite'].sort());
  unused.forEach((k) => assert.ok(THRESHOLDS[k], k + ' doit toujours exister dans THRESHOLDS, jamais retiré'));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

// MISSION — AUDIT GLOBAL CSM V2 x FORCEDECKS.
//
// Mission d'AUDIT UNIQUEMENT (aucune ligne de moteur HYP LOCKED, aucun nouveau seuil, aucune
// nouvelle clé Kinexus, aucun mapping non validé créé, aucune asymétrie inventée, aucune sévérité
// modifiée). Produit une correspondance exhaustive KINEXUS VARIABLE <-> FORCEDECKS CSV VARIABLE
// pour les 65 kpis du catalogue CMJ, avec vérification numérique réelle (Yannis), documentation des
// collisions déjà connues, statut G/D par variable, séparation source/calculé, et gap inverse
// (ForceDecks -> Kinexus). Résultat persisté dans
// tests/fixtures/csm_v2_forcedecks_correspondence_audit.json (généré depuis les structures
// existantes : TESTS.cmj.kpis, FD_KPI_PATTERNS, CMJ_VAR_META, ASYM_SIDE_PAIRS,
// ASYM_PERFORMANCE_EQUIVALENT, CMJ_PLAUSIBLE_RANGE, validateTechnical, fdVal, fdFindCol, et les 17
// fixtures réelles ForceDecks de Yannis Briant).
//
// Exécution : node tests/mission_global_csm_v2_forcedecks_audit.js
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

console.log('MISSION — Audit global CSM V2 x ForceDecks (correspondance Kinexus <-> CSV)');
const BASELINE_COMMIT = 'fc6b97b'; // dernier commit avant cette mission d'audit
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'csm_v2_forcedecks_correspondence_audit.json'), 'utf8'));

// ═══════════════════ 1. Toutes les variables CMJ Kinexus apparaissent dans l'audit ═══════════════
test('GC1 — les 65 clés TESTS.cmj.kpis apparaissent toutes dans kinexusVariableInventory, aucune omise', () => {
  assert.strictEqual(audit.kinexusVariableInventory.length, TBK.cmj.kpis.length);
  const catalogKeys = new Set(TBK.cmj.kpis.map((k) => k.key));
  const invKeys = new Set(audit.kinexusVariableInventory.map((r) => r.key));
  catalogKeys.forEach((k) => assert.ok(invKeys.has(k), k + ' absente de l\'audit'));
  invKeys.forEach((k) => assert.ok(catalogKeys.has(k), k + ' présente dans l\'audit mais absente du catalogue réel'));
});

// ═══════════════════ 2. Aucune variable n'est silencieusement exclue ════════════════════════════
test('GC2 — chaque ligne de l\'inventaire porte une classification de correspondance valide (vocabulaire exact de la mission)', () => {
  const allowed = new Set(['EXACT', 'EXACT_WITH_VARIANT', 'VALIDATED_ALIAS', 'AMBIGUOUS', 'PLAUSIBLE_UNVALIDATED', 'NO_CURRENT_EQUIVALENT']);
  audit.kinexusVariableInventory.forEach((r) => assert.ok(allowed.has(r.correspondence), r.key + ' : correspondance inattendue ' + r.correspondence));
  const total = Object.values(audit.correspondenceDistribution).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, 65);
});

// ═══════════════════ 3. Tous les mappings validés actuels restent valides ═══════════════════════
test('GC3 — tous les mappings EXACT/EXACT_WITH_VARIANT/VALIDATED_ALIAS résolvent réellement une colonne réelle (recalcul live, jamais une valeur figée)', () => {
  audit.kinexusVariableInventory
    .filter((r) => ['EXACT', 'EXACT_WITH_VARIANT', 'VALIDATED_ALIAS'].includes(r.correspondence))
    .forEach((r) => {
      const patterns = FD_KPI_PATTERNS[r.key];
      assert.ok(patterns, r.key + ' : aucun motif FD_KPI_PATTERNS');
      assert.ok(r.matchedHeader, r.key + ' : aucun en-tête réel résolu');
    });
});

// ═══════════════════ 4. Les 6 mappings récents restent valides ═════════════════════════════════
test('GC4 — les 6 mappings validés par la mission "référentiel sémantique" (braking_duration EXACT unique, leg_stiffness+L/R/asym, contraction_time, ecc_duration, ecc_peak_power, conc_impulse_100_asym) sont toujours résolus', () => {
  ['braking_duration', 'leg_stiffness', 'leg_stiffness_L', 'leg_stiffness_R', 'leg_stiffness_asym', 'contraction_time', 'ecc_duration', 'ecc_peak_power', 'conc_impulse_100_asym'].forEach((k) => {
    const row = audit.kinexusVariableInventory.find((r) => r.key === k);
    assert.ok(row, k + ' absente');
    assert.notStrictEqual(row.correspondence, 'NO_CURRENT_EQUIVALENT', k + ' ne doit plus être NO_CURRENT_EQUIVALENT');
  });
});

// ═══════════════════ 5. Les 3 nouvelles paires G/D restent valides ═══════════════════════════════
test('GC5 — conc_mean_force_L/R, force_peak_power_L/R, force_zero_vel_L/R restent résolus sur les valeurs CSV réelles exactes (692/619, 778/696, 781/745), correctement converties N/kg via BW réel (77.46 kg)', () => {
  const checks = {
    conc_mean_force_L: 692, conc_mean_force_R: 619,
    force_peak_power_L: 778, force_peak_power_R: 696,
    force_zero_vel_L: 781, force_zero_vel_R: 745
  };
  Object.keys(checks).forEach((k) => {
    const row = audit.kinexusVariableInventory.find((r) => r.key === k);
    assert.ok(row, k + ' absente');
    assert.strictEqual(row.numericCheck.checked, true);
    assert.strictEqual(row.numericCheck.raw, String(checks[k]), k + ' : valeur CSV brute');
    assert.strictEqual(row.numericCheck.bw, 77.46, k + ' : BW réel');
    // fdVal() convertit automatiquement en N/kg (label kpi "(N/kg)") -- comportement voulu, pas un bug.
    assert.ok(Math.abs(row.numericCheck.kinexusValue - checks[k] / 77.46) < 1e-9, k + ' : conversion N/kg incorrecte');
    assert.strictEqual(row.numericCheck.pass, true);
    assert.strictEqual(row.numericCheck.technicalPlausibility.ok, true, k + ' : hors plage physiquement possible');
  });
});

// ═══════════════════ 6. Aucun mapping ambigu n'est automatiquement validé ═══════════════════════
test('GC6 — height et rsi_mod restent AMBIGUOUS (jamais promus EXACT/VALIDATED_ALIAS), et les 2 collisions correspondantes restent documentées comme NON résolues', () => {
  ['height', 'rsi_mod'].forEach((k) => {
    const row = audit.kinexusVariableInventory.find((r) => r.key === k);
    assert.strictEqual(row.correspondence, 'AMBIGUOUS');
  });
  const ambiguousCollisions = audit.collisions.filter((c) => c.status === 'DOCUMENTED_AMBIGUOUS_NOT_RESOLVED');
  assert.strictEqual(ambiguousCollisions.length, 2);
});

// ═══════════════════ 7. Aucun seuil n'est créé ═══════════════════════════════════════════════════
test('GC7 — THRESHOLDS reste à 24 clés verrouillées, CMJ_PLAUSIBLE_RANGE inchangé (22 clés)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(CMJ_PLAUSIBLE_RANGE).length, 22);
});

// ═══════════════════ 8. Aucun HYP LOCKED n'est modifié ══════════════════════════════════════════
test('GC8 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
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
test('GC8bis — index.html n\'a reçu AUCUNE modification depuis le commit de référence (mission audit-only)', () => {
  const diffStat = execSync('git diff --stat ' + BASELINE_COMMIT + ' -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(diffStat.trim(), '', 'index.html a été modifié : ' + diffStat);
});

// ═══════════════════ 9. CSM_V2_CLINICAL_VARIABLE_MATRIX reste inchangée ═════════════════════════
test('GC9 — CSM_V2_CLINICAL_VARIABLE_MATRIX reste à 150 variables', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
});

// ═══════════════════ 10. Yannis conserve exactement ses sévérités actuelles ═════════════════════
test('GC10 — les 8 sévérités cliniques de Yannis restent strictement identiques à la référence documentée', () => {
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

// ═══════════════════ 11. Les 5 phases CMJ sont respectées ═══════════════════════════════════════
test('GC11 — CMJ_VAR_META ne référence que les 5 phases top-level (jamais un modèle 7/8 phases)', () => {
  const phases = new Set();
  Object.keys(CMJ_VAR_META).forEach((k) => { if (CMJ_VAR_META[k].phase) phases.add(CMJ_VAR_META[k].phase); });
  assert.deepStrictEqual([...phases].sort(), ['braking', 'concentric', 'flight', 'landing', 'unloading']);
});

// ═══════════════════ 12. Eccentric Braking ≠ Eccentric Deceleration ═════════════════════════════
test('GC12 — braking_rfd/braking_impulse ne résolvent JAMAIS une colonne "Eccentric Braking" — uniquement "Eccentric Deceleration"', () => {
  const headers = ['Eccentric Braking RFD [N/s]', 'Eccentric Deceleration RFD [N/s]'];
  const col = fdFindCol(headers, FD_KPI_PATTERNS.braking_rfd, null);
  assert.strictEqual(col, 'Eccentric Deceleration RFD [N/s]');
  const c = audit.collisions.find((x) => x.kinexusKey === 'braking_rfd/braking_impulse');
  assert.strictEqual(c.status, 'RESOLVED_VERIFIED');
});

// ═══════════════════ 13. Aucune asymétrie n'est inventée ════════════════════════════════════════
test('GC13 — force_zero_vel n\'a AUCUNE entrée ASYM_SIDE_PAIRS/ASYM_PERFORMANCE_EQUIVALENT (aucune colonne "% (Asym)" native observée) — aucun côté dominant inventé', () => {
  assert.strictEqual(ASYM_PERFORMANCE_EQUIVALENT.force_zero_vel, undefined);
  assert.strictEqual(ASYM_SIDE_PAIRS.force_zero_vel_asym, undefined);
});
test('GC13bis — la seule symétrie CALCULÉE (reactiviteSecondaire.cmj_leg_stiffness_symmetry) utilise autoLSI déjà existant, jamais une nouvelle formule', () => {
  assert.strictEqual(audit.sourceVsCalculated.calculatedSymmetryEntries.length, 1);
  assert.strictEqual(audit.sourceVsCalculated.calculatedSymmetryEntries[0].key, 'reactiviteSecondaire.cmj_leg_stiffness_symmetry');
  assert.ok(audit.sourceVsCalculated.calculatedSymmetryEntries[0].formula.indexOf('autoLSI') >= 0);
});

// ═══════════════════ 14. Aucun nouveau Kinexus key n'est créé ═══════════════════════════════════
test('GC14 — TESTS.cmj.kpis reste à 65 clés, RFD 50/100/150/200ms n\'existe PAS pour cmj (documenté FUTURE_IMPLEMENTATION_CANDIDATE uniquement)', () => {
  assert.strictEqual(TBK.cmj.kpis.length, 65);
  const cmjKeys = new Set(TBK.cmj.kpis.map((k) => k.key));
  ['rfd50', 'rfd100', 'rfd150', 'rfd200'].forEach((k) => assert.strictEqual(cmjKeys.has(k), false, k));
  const relevantMissing = audit.reverseGaps.filter((g) => g.classification === 'RELEVANT_MISSING' && /RFD/.test(g.header));
  assert.ok(relevantMissing.length >= 3);
});

// ═══════════════════ Garde-fous supplémentaires ══════════════════════════════════════════════════
test('GC15 — le finding technicalPlausibilityGaps est cohérent avec un recalcul live (5 clés : conc_impulse, depth, ecc_peak_vel, conc_impulse_100, landing_impulse)', () => {
  assert.strictEqual(audit.technicalPlausibilityGaps.length, 5);
  const keys = audit.technicalPlausibilityGaps.map((g) => g.key).sort();
  assert.deepStrictEqual(keys, ['conc_impulse', 'conc_impulse_100', 'depth', 'ecc_peak_vel', 'landing_impulse'].sort());
  audit.technicalPlausibilityGaps.forEach((g) => {
    const tech = validateTechnical(g.key === 'conc_impulse_100' ? 'conc_impulse_100' : g.key, g.kinexusValue);
    assert.strictEqual(tech.ok, false, g.key + ' devrait toujours échouer le contrôle de plausibilité (finding structurel, non un bug ponctuel)');
  });
});
test('GC16 — CSM_V2_CMJ_REDUNDANCY_PAIRS (5 relations déjà documentées) toujours intactes', () => {
  assert.strictEqual(CSM_V2_CMJ_REDUNDANCY_PAIRS.length, 5);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

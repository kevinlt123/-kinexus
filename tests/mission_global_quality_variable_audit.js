// MISSION AI — GLOBAL QUALITY × VARIABLE AUDIT POST-ADDITIONS.
//
// Mission d'AUDIT UNIQUEMENT (aucune ligne de moteur HYP LOCKED, aucun nouveau seuil, aucune
// nouvelle variable, aucune relation clinique inventée, aucune sévérité modifiée). Produit un audit
// exhaustif de la couverture des 8 qualités CSM V2 par variable, en réutilisant exclusivement des
// structures déjà existantes (CSM_V2_CLINICAL_VARIABLE_MATRIX, clinicalCompletenessAudit — Mission
// AH, symmetryEvidence, CMJ_VAR_META, TESTS.cmj.kpis, FD_KPI_PATTERNS, ASYM_SIDE_PAIRS,
// ASYM_PERFORMANCE_EQUIVALENT, THRESHOLDS, l'audit ForceDecks déjà commité). Le résultat de l'audit
// est persisté dans tests/fixtures/csm_v2_global_quality_variable_audit.json (généré à partir de
// ces structures, jamais inventé).
//
// Exécution : node tests/mission_global_quality_variable_audit.js
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

console.log('MISSION AI — Global Quality x Variable Audit (post-additions)');
const BASELINE_COMMIT = '54a513f'; // dernier commit avant cette mission d'audit
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'csm_v2_global_quality_variable_audit.json'), 'utf8'));

// ═══════════════════ 1. Les 8 qualités sont présentes ═══════════════════════════════════════════
test('GA1 — les 8 qualités CSM V2 sont présentes (HYP_CSM_QUALITIES == audit.qualitySummary)', () => {
  assert.strictEqual(HYP_CSM_QUALITIES.length, 8);
  assert.strictEqual(audit.qualitySummary.length, 8);
  const auditQualities = new Set(audit.qualitySummary.map((q) => q.quality));
  HYP_CSM_QUALITIES.forEach((q) => assert.ok(auditQualities.has(q), q + ' absente de l\'audit'));
});

// ═══════════════════ 2. Chaque qualité possède une entrée d'audit complète ══════════════════════
test('GA2 — chaque qualité possède une entrée d\'audit avec diagnostic/confirmative/explanatory/coverage/robustness/topGapLevel', () => {
  audit.qualitySummary.forEach((q) => {
    ['hypId', 'diagnostic', 'confirmative', 'explanatory', 'symmetryEvidenceKeys', 'classifiable', 'coverage', 'robustness', 'topGapLevel'].forEach((f) => {
      assert.ok(Object.prototype.hasOwnProperty.call(q, f), q.quality + ' : champ ' + f + ' manquant');
    });
  });
});

// ═══════════════════ 3. Les variables HYP LOCKED sont présentes (diagnostic count > 0) ══════════
test('GA3 — chaque qualité a au moins 1 variable diagnostique issue des moteurs HYP LOCKED (CSM_V2_CLINICAL_VARIABLE_MATRIX)', () => {
  HYP_CSM_QUALITIES.forEach((q) => {
    const bq = CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q];
    assert.ok(bq.diagnostic.length >= 1, q + ' : aucune variable diagnostique LOCKED');
  });
});

// ═══════════════════ 4. Les variables secondaires sont distinguées ══════════════════════════════
test('GA4 — les variables secondaires (evidence additive) sont distinguées des variables LOCKED (namespace *Secondaire.cmj_*, jamais dans diagnosticEvidence/confirmativeEvidence/explanatoryEvidence des moteurs)', () => {
  const cmjTrials = {};
  TBK.cmj.kpis.forEach((k) => { cmjTrials[k.key] = [1]; });
  const testData = { cmj: { active: true, trials: cmjTrials } };
  const se = computeMoteur(testData, {}, null, 25, {}).clinicalSynthesisV2.symmetryEvidence;
  const secNs = ['absorptionSecondaire', 'puissanceSecondaire', 'reactiviteSecondaire', 'explosiviteSecondaire'];
  let foundSecondary = 0;
  Object.keys(se).forEach((q) => Object.keys(se[q] || {}).forEach((k) => {
    if (secNs.some((ns) => k.startsWith(ns + '.'))) {
      foundSecondary++;
      assert.strictEqual(se[q][k].role === 'diagnostic', false, k + ' : une evidence secondaire ne doit jamais porter le rôle diagnostic');
    }
  }));
  assert.ok(foundSecondary > 0, 'aucune evidence secondaire trouvée avec des données CMJ complètes');
});

// ═══════════════════ 5. Aucun nouveau seuil n'a été créé ════════════════════════════════════════
test('GA5 — THRESHOLDS reste à 24 clés verrouillées (aucun nouveau seuil créé par cette mission d\'audit)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
});

// ═══════════════════ 6. Aucun moteur HYP n'a été modifié (byte-identique) ═══════════════════════
test('GA6 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
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
  const hashes = {};
  HYP_FNS.forEach((fn) => {
    const liveBody = extractFnBody(code, fn);
    const baseBody = extractFnBody(baseHtml, fn);
    assert.strictEqual(liveBody, baseBody, fn + ' a été modifiée');
    hashes[fn] = liveBody.length;
  });
  // Snapshot de longueur (proxy simple, déjà couvert byte-à-byte ci-dessus) — utile pour détecter
  // une future dérive sans re-belier tout le corps de fonction.
  assert.ok(Object.values(hashes).every((n) => n > 0));
});
test('GA6bis — le commit de CETTE mission d\'audit (fc6b97b) lui-même n\'avait modifié AUCUNE ligne de index.html — fait historique immuable, vérifié sur ce commit précis (une mission ULTÉRIEURE distincte et explicitement validée, principe du minimum diagnostique suffisant, a depuis modifié index.html — attendu, hors périmètre de cette garde)', () => {
  const diffStat = execSync('git diff --stat fc6b97b~1 fc6b97b -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(diffStat.trim(), '', 'le commit fc6b97b aurait dû ne toucher aucune ligne de index.html : ' + diffStat);
});

// ═══════════════════ 7. Les mappings récemment validés sont retrouvés ═══════════════════════════
test('GA7 — les 6 mappings G/D validés par la mission précédente (conc_mean_force_L/R, force_peak_power_L/R, force_zero_vel_L/R) sont retrouvés dans l\'inventaire CMJ, statut MAPPED', () => {
  ['conc_mean_force_L', 'conc_mean_force_R', 'force_peak_power_L', 'force_peak_power_R', 'force_zero_vel_L', 'force_zero_vel_R'].forEach((k) => {
    const row = audit.cmjInventory.find((r) => r.key === k);
    assert.ok(row, k + ' absent de l\'inventaire audit');
    assert.strictEqual(row.fdAuditStatus, 'MAPPED');
    assert.strictEqual(row.fdPatternExists, true);
  });
});

// ═══════════════════ 8. Les variables refusées précédemment restent refusées ════════════════════
test('GA8 — conc_displacement (refusé explicitement par le praticien, mission mapping sémantique) reste NO_CURRENT_MAPPING / non ajouté au catalogue avec un mapping réel', () => {
  assert.ok(TBK.cmj.kpis.some((k) => k.key === 'conc_displacement'), 'conc_displacement doit rester au catalogue (existant avant, jamais retiré)');
  assert.strictEqual(FD_KPI_PATTERNS.conc_displacement === undefined || FD_KPI_PATTERNS.conc_displacement.length <= 1, true);
  const rows = require(path.join(__dirname, 'fixtures', 'cmj_mapping_extraction_report.json')).table1_dictionnaire_cmj_kinexus;
  const row = rows.find((r) => r.key === 'conc_displacement');
  assert.ok(row, 'conc_displacement absent du rapport d\'extraction');
  assert.strictEqual(row.mappingStatus, 'NO_CURRENT_MAPPING');
});

// ═══════════════════ 9. CMJ RFD100/150/200 n'est pas créé comme clé Kinexus ═════════════════════
test('GA9 — RFD 50/100/150/200ms n\'existe PAS comme clé TBK.cmj.kpis, n\'a AUCUNE entrée CMJ_VAR_META, et n\'est consommé par AUCUN moteur HYP pour le test cmj (documenté FUTURE_IMPLEMENTATION_CANDIDATE, jamais créé)', () => {
  const cmjKeys = new Set(TBK.cmj.kpis.map((k) => k.key));
  ['rfd50', 'rfd100', 'rfd150', 'rfd200'].forEach((k) => {
    assert.strictEqual(cmjKeys.has(k), false, k + ' ne doit PAS exister comme clé cmj');
    assert.strictEqual(CMJ_VAR_META[k], undefined, k + ' ne doit avoir aucune entrée CMJ_VAR_META');
  });
  const hasCmjUsage = CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.some((v) => (v.test === 'cmj') && /rfd(50|100|150|200)$/.test(v.variableKey));
  assert.strictEqual(hasCmjUsage, false);
  assert.strictEqual(audit.cmjRfdWindowedAudit.usedByAnyHypEngineForCmj, false);
  assert.strictEqual(audit.cmjRfdWindowedAudit.existsInTBKcmj.rfd100, false);
  assert.strictEqual(audit.cmjRfdWindowedAudit.existsInCmjVarMeta.rfd100, false);
});
test('GA9bis — les colonnes réelles "Concentric RFD - 50/100/200ms" existent bien dans l\'export ForceDecks réel (constat factuel, jamais implémenté)', () => {
  const found = audit.cmjRfdWindowedAudit.realForceDecksColumnsFound;
  assert.ok(found.length > 0);
  const bilateral = found.filter((r) => !/\(L\)|\(R\)|Asym/.test(r.header));
  assert.strictEqual(bilateral.length, 3); // 50ms, 100ms, 200ms bilatéral (pas de 150ms observé)
  bilateral.forEach((r) => { assert.strictEqual(r.presentInAudit, true); assert.strictEqual(r.status, 'UNMAPPED_CANDIDATE'); });
});

// ═══════════════════ 10. Les 5 phases CMJ sont respectées (jamais 7/8) ══════════════════════════
test('GA10 — le phaseSummary de l\'audit ne contient EXACTEMENT que les 5 phases top-level (UNLOADING/BRAKING/CONCENTRIC/FLIGHT_OUTPUT/LANDING), jamais un modèle 7/8 phases', () => {
  const phases = Object.keys(audit.phaseSummary).sort();
  assert.deepStrictEqual(phases, ['BRAKING', 'CONCENTRIC', 'FLIGHT_OUTPUT', 'LANDING', 'UNLOADING'].sort());
});
test('GA10bis — CMJ_VAR_META lui-même ne référence que ces 5 phases (jamais de 6e/7e/8e phase) — sous-phase "eccentric_deceleration" autorisée sous BRAKING uniquement', () => {
  const phases = new Set();
  Object.keys(CMJ_VAR_META).forEach((k) => { if (CMJ_VAR_META[k].phase) phases.add(CMJ_VAR_META[k].phase); });
  assert.deepStrictEqual([...phases].sort(), ['braking', 'concentric', 'flight', 'landing', 'unloading']);
  Object.keys(CMJ_VAR_META).forEach((k) => {
    if (CMJ_VAR_META[k].subPhase) assert.strictEqual(CMJ_VAR_META[k].phase, 'braking', k + ' : sous-phase hors braking');
  });
});

// ═══════════════════ 11. Les 8 sévérités Yannis sont identiques à la baseline ═══════════════════
test('GA11 — les 8 sévérités cliniques de Yannis restent strictement identiques à la référence documentée (mission_ai_semantic_mapping_tests.js SM40)', () => {
  assert.strictEqual(audit.yannisCheck.severitiesMatchBaseline, true);
  const EXPECTED_SEVERITY = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(EXPECTED_SEVERITY).forEach((q) => assert.strictEqual(audit.yannisCheck.severities[q], EXPECTED_SEVERITY[q], q));
});
test('GA11bis — pour Yannis, aucune evidence secondaire CMJ (namespace *Secondaire.cmj_*) ne se déclenche (son import CMJ ne contient aucune des 8 clés récemment ajoutées) — confirme que les ajouts n\'ont transformé aucune qualité en diagnostic artificiel', () => {
  assert.strictEqual(audit.yannisCheck.secondaryEvidenceOnlyAdditive.emptyAsExpected, true);
  assert.deepStrictEqual(audit.yannisCheck.secondaryEvidenceOnlyAdditive.found, []);
});

// ═══════════════════ Garde-fous supplémentaires ══════════════════════════════════════════════════
test('GA12 — aucune nouvelle relation clinique : HYP_QUALITY_RELATIONS/CLINICAL_HYPOTHESIS_WHITELIST restent à 9 chacun', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
});
test('GA13 — CSM_V2_CLINICAL_VARIABLE_MATRIX reste à 150 variables (aucune variable ajoutée par cette mission d\'audit)', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
});
test('GA14 — TESTS.cmj.kpis reste à 65 clés (aucune nouvelle clé créée par cette mission d\'audit, notamment aucune clé RFD windowed)', () => {
  assert.strictEqual(TBK.cmj.kpis.length, 65);
});
test('GA15 — les 5 redondances déjà documentées (CSM_V2_CMJ_REDUNDANCY_PAIRS) sont reprises telles quelles dans l\'audit, aucune suppression de variable', () => {
  assert.strictEqual(audit.redundancyPairs.length, 5);
  const pairs = audit.redundancyPairs.map((p) => p.primary + '/' + p.secondary).sort();
  assert.deepStrictEqual(pairs, [
    'conc_mean_force/conc_impulse', 'ecc_mean_power/ecc_peak_power', 'height/flight_time',
    'peak_power/conc_mean_power', 'rsi_mod/ft_ct_ratio'
  ].sort());
  // Toutes les clés référencées existent toujours dans le catalogue (aucune suppression).
  const catalogKeys = new Set(TBK.cmj.kpis.map((k) => k.key));
  audit.redundancyPairs.forEach((p) => {
    assert.ok(catalogKeys.has(p.primary), p.primary + ' supprimé du catalogue');
    assert.ok(catalogKeys.has(p.secondary), p.secondary + ' supprimé du catalogue');
  });
});
test('GA16 — priorityGapsByQuality couvre les 8 qualités, niveaux uniquement P0/P1/P2/P3', () => {
  const allowed = new Set(['P0', 'P1', 'P2', 'P3']);
  HYP_CSM_QUALITIES.forEach((q) => {
    assert.ok(Array.isArray(audit.priorityGapsByQuality[q]));
    audit.priorityGapsByQuality[q].forEach((g) => assert.ok(allowed.has(g.level), 'niveau inattendu : ' + g.level));
  });
});
test('GA17 — Absorption et Explosivité sont bien identifiées P0 (aucune variable diagnostique classifiable) — constat factuel, pas une invention', () => {
  assert.ok(audit.priorityGapsByQuality['Absorption'].some((g) => g.level === 'P0'));
  assert.ok(audit.priorityGapsByQuality['Explosivité'].some((g) => g.level === 'P0'));
  const bqAbs = CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Absorption'];
  assert.strictEqual(bqAbs.diagnostic.some((d) => d.classifiability === 'exploitable' || d.classifiability === 'partiellement_exploitable'), false);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

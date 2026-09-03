// MISSION — EXTRACTION DU MAPPING CMJ ACTUEL KINEXUS <-> FORCEDECKS.
//
// Mission d'EXTRACTION PURE (lecture seule) : produire une cartographie fiable du mapping CMJ
// ACTUEL. Aucune variable/mapping/engine/threshold/norme n'est ajouté, retiré ni modifié ici.
// Ces tests vérifient précisément CETTE garantie de non-modification, en plus de la complétude de
// l'extraction elle-même (les 274 headers ForceDecks CMJ classés, aucun oublié).
//
// Aucune modification de index.html n'a été nécessaire pour cette mission — toutes les données
// proviennent de structures déjà existantes (TESTS.cmj.kpis, CMJ_VAR_META, FD_KPI_PATTERNS,
// CSM_V2_CLINICAL_VARIABLE_MATRIX, THRESHOLDS, NORMS_V2_TEST_VARS) lues telles quelles.
//
// Exécution : node tests/mission_cmj_mapping_extraction_tests.js — aucune dépendance externe.
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

console.log('MISSION — extraction du mapping CMJ actuel Kinexus <-> ForceDecks');

// ═══════════════════════ Non-modification (garde-fous obligatoires §8) ══════════════════════════
test('E1 — la mission d\'extraction ORIGINALE (commit 0765771) n\'avait modifié AUCUNE ligne de index.html — fait historique immuable, vérifié sur ce commit précis (une mission ULTÉRIEURE distincte et explicitement validée, evidence secondaire par qualité, a depuis modifié index.html — attendu, hors périmètre de cette garde)', () => {
  const stat = execSync('git diff --stat 0765771~1 0765771 -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(stat.trim(), '', 'le commit 0765771 aurait dû ne toucher aucune ligne de index.html : ' + stat);
});
test('E2 — TESTS.cmj.kpis : 59 clés (51 + 8 evidence secondaire, mission ULTÉRIEURE validée : ecc_duration, ecc_peak_power, leg_stiffness+L/R/asym, contraction_time, conc_impulse_100_asym)', () => {
  assert.strictEqual(TBK.cmj.kpis.length, 59);
});
test('E3 — THRESHOLDS inchangé : toujours 24 clés verrouillées', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
});
test('E4 — NORMS_V2_TEST_VARS.cmj inchangé (population percentile CMJ)', () => {
  assert.deepStrictEqual(NORMS_V2_TEST_VARS.cmj, ['cmj_peak_power']);
});
test('E5 — HYP_QUALITY_RELATIONS et CLINICAL_HYPOTHESIS_WHITELIST inchangés (9 relations chacun)', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
});
test('E6 — CSM_V2_CLINICAL_VARIABLE_MATRIX inchangée (150 variables au total, meta.builtFrom identique)', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
});
test('E7 — le mapping FD_KPI_PATTERNS existant n\'a pas changé : l\'audit déjà commité (forcedecks_cmj_semantic_mapping_audit.json) reste reproductible à l\'identique', () => {
  const committed = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'forcedecks_cmj_semantic_mapping_audit.json'), 'utf8'));
  // Reproduit exactement le calcul déjà utilisé pour produire ce fichier (mêmes 17 fixtures réelles).
  function parseCsvLine(line) { return line.replace(/^﻿?"/, '').replace(/"$/, '').split('","'); }
  const FIXDIR = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).sort();
  const META = new Set(['Name', 'ExternalId', 'Test Type', 'Date', 'Time', 'BW [KG]', 'Reps', 'Tags', 'Additional Load [kg]']);
  let recognizedBy = {};
  let allHeaders = new Set();
  files.forEach((f) => {
    const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
    const lines = csv.split('\n');
    const headers = parseCsvLine(lines[0]).map((h) => h.trim());
    headers.forEach((h) => allHeaders.add(h));
    TBK.cmj.kpis.forEach((kpi) => {
      const patterns = FD_KPI_PATTERNS[kpi.key];
      if (!patterns) return;
      const side = /_asym$/.test(kpi.key) ? 'asym' : (/_L$/.test(kpi.key) ? 'L' : (/_R$/.test(kpi.key) ? 'R' : null));
      const col = fdFindCol(headers, patterns, side);
      if (col) recognizedBy[col.trim()] = kpi.key;
    });
  });
  const liveRecognizedCount = Object.keys(recognizedBy).length;
  const committedRecognizedCount = committed.filter((r) => r.status !== 'UNMAPPED_CANDIDATE' && r.status !== 'METADATA').length;
  assert.strictEqual(liveRecognizedCount, committedRecognizedCount, 'le nombre de mappings AVANT/APRÈS cette mission diffère (§8 : doit être identique)');
});

// ═══════════════════════ Extraction : TABLE 1 (dictionnaire CMJ Kinexus) ════════════════════════
const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'cmj_mapping_extraction_report.json'), 'utf8'));
test('E8 — TABLE 1 couvre exactement les 59 clés du catalogue TESTS.cmj.kpis (51 + 8 evidence secondaire, mission ultérieure validée), aucune inventée', () => {
  const t1 = report.table1_dictionnaire_cmj_kinexus;
  assert.strictEqual(t1.length, 59);
  const catalogKeys = new Set(TBK.cmj.kpis.map((k) => k.key));
  t1.forEach((r) => assert.ok(catalogKeys.has(r.key), r.key + ' absent du catalogue réel'));
});
test('E9 — 50 clés Kinexus CMJ ont au moins 1 en-tête ForceDecks reconnu (42 + 8 evidence secondaire) ; les 9 mêmes clés restent NO_CURRENT_MAPPING (liste exacte inchangée — aucune des 8 nouvelles clés n\'y figure, cohérent)', () => {
  const t1 = report.table1_dictionnaire_cmj_kinexus;
  const mapped = t1.filter((r) => r.mappingStatus !== 'NO_CURRENT_MAPPING');
  const unmapped = t1.filter((r) => r.mappingStatus === 'NO_CURRENT_MAPPING').map((r) => r.key).sort();
  assert.strictEqual(mapped.length, 50);
  assert.deepStrictEqual(unmapped, ['braking_eff', 'conc_displacement', 'ecc_decel', 'landing_duration', 'peak_vel', 'post_landing_stability', 'propulsion_eff', 'time_to_stab', 'tto']);
});

// ═══════════════════════ Extraction : TABLE 3 (274 headers, statut EXACT/ALIAS/VARIANT/...) ═════
test('E10 — TABLE 3 classe la TOTALITÉ des 274 headers réels + 9 métadonnées (283 lignes), aucun oublié', () => {
  assert.strictEqual(report.table3_forcedecks_vers_kinexus.length, 283);
  const nonMeta = report.table3_forcedecks_vers_kinexus.filter((r) => r.correspondance !== 'N/A_METADATA');
  assert.strictEqual(nonMeta.length, 274);
});
test('E11 — statuts TABLE 3 conformes au vocabulaire de la mission (EXACT/ALIAS/VARIANT/AMBIGUOUS/NO_CURRENT_EQUIVALENT/N/A_METADATA), somme exacte', () => {
  const counts = {};
  report.table3_forcedecks_vers_kinexus.forEach((r) => { counts[r.correspondance] = (counts[r.correspondance] || 0) + 1; });
  const allowed = new Set(['EXACT', 'ALIAS', 'VARIANT', 'AMBIGUOUS', 'NO_CURRENT_EQUIVALENT', 'N/A_METADATA']);
  Object.keys(counts).forEach((s) => assert.ok(allowed.has(s), 'statut inattendu : ' + s));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, 283);
  // braking_duration résolu (mission ultérieure validée, evidence secondaire) : 6 -> 4 AMBIGUOUS
  // (height x2, rsi_mod x2). NO_CURRENT_EQUIVALENT diminue d'autant (+ CMJ Stiffness désormais
  // mappée) : 228 -> 221.
  assert.strictEqual(counts.AMBIGUOUS, 4);
  assert.strictEqual(counts.NO_CURRENT_EQUIVALENT, 221);
});
test('E12 — aucun header ForceDecks n\'est silencieusement ignoré : union TABLE3 == union des 17 fichiers fixtures réels', () => {
  function parseCsvLine(line) { return line.replace(/^﻿?"/, '').replace(/"$/, '').split('","'); }
  const FIXDIR = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).sort();
  let allHeaders = new Set();
  files.forEach((f) => {
    const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
    parseCsvLine(csv.split('\n')[0]).forEach((h) => allHeaders.add(h.trim()));
  });
  const table3Headers = new Set(report.table3_forcedecks_vers_kinexus.map((r) => r.forcedecks));
  allHeaders.forEach((h) => assert.ok(table3Headers.has(h), h + ' absent de TABLE 3'));
  assert.strictEqual(allHeaders.size, table3Headers.size);
});

// ═══════════════════════ Extraction : TABLE 7 (redondances) ═════════════════════════════════════
test('E13 — TABLE 7 (redondances) ne contient QUE des variantes absolu/BW d\'une variable déjà mappée en N/kg ou W/kg (jamais une variable de définition/méthode différente)', () => {
  const t7 = report.table7_redondances_probables;
  assert.ok(t7.length > 0);
  // "Concentric RFD / BM" et "Concentric Impulse (Abs) / BM" exclus volontairement : conc_rfd est
  // canoniquement en N/s absolu (pas N/kg), et (Abs)/BM a une valeur réelle non cohérente avec une
  // simple division par la masse (cf. rapport) — jamais classés redondants sans certitude.
  assert.strictEqual(t7.indexOf('Concentric RFD / BM [N/s/kg]'), -1);
  assert.strictEqual(t7.indexOf('Concentric Impulse (Abs) / BM [N s/kg]'), -1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

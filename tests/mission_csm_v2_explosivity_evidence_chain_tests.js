// MISSION P1 — RECONNECTER cmj_rsi_mod À LA CHAÎNE DE PREUVE CSM V2.2.
//
// Cause exacte du bug (audit §1) : `clinicalProfile[q].keyFindings` (computeCsmV2ClinicalProfile,
// Étape J) n'est alimenté QUE par `symmetryEvidence[q]` (axe LSI D/G, csmV2QualitySeverity ->
// deficientSymmetryEntries). Or cmj (CMJ) est un test BILATÉRAL : cmj_rsi_mod n'a et n'aura jamais
// de symmetryEvidence (aucune distinction D/G, cf. HYP-EXP-01 `precision.note`, jamais modifiée).
// Résultat : même quand HYP-EXP-01 classe déjà cmj_rsi_mod comme preuve diagnostique PRIMARY
// déficitaire (diagnosticEvidence.cmj_rsi_mod.status==='deficitaire', role:'primary', LOCKED),
// `keyFindings` restait vide pour Explosivité -> `qualityReasoning.directEvidence` vide ->
// `clinicalEvidenceHierarchy.level1_diagnostic.present=false` -> `verdict='AUCUNE_PREUVE_
// DIAGNOSTIQUE'` -> `completenessStatus='NOT_DETERMINED'`, alors même que le moteur HYP-EXP-01 avait
// déjà objectivé le déficit (state='retenue_faible'/status='orange'/severity='majeur').
//
// Correctif (ciblé Explosivité uniquement, computeCsmV2ClinicalProfile) : relit tel quel
// `hyp.diagnosticEvidence.cmj_rsi_mod.status` (déjà calculé par HYP-EXP-01 LOCKED, jamais recalculé
// ici) et, uniquement si 'deficitaire', ajoute une entrée à `keyFindings` de la même FORME qu'une
// entrée symmetryEvidence mais avec `lsi:null` (aucune asymétrie réelle — cmj est bilatéral). Les 2
// narrations "asymétries D/G objectivées" (Profil E / Grande Synthèse) sont mises à jour pour ne
// compter que les entrées avec `lsi!=null`, afin de ne jamais prétendre à tort qu'une preuve absolue
// constitue une asymétrie D/G.
//
// Exécution : node tests/mission_csm_v2_explosivity_evidence_chain_tests.js — aucune dépendance
// externe.
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

console.log('MISSION P1 — Reconnecter cmj_rsi_mod à la chaîne de preuve CSM V2.2');

// ═══════════════════ YANIS — AVANT / APRÈS ═════════════════════════════════════════════════════
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

// MISSION P2BIS (correction méthodologie BASELINE_COMMIT) : 'HEAD' était correct au moment de la
// rédaction initiale, mais est devenu trivial dès la fusion du commit de cette mission dans main
// (HEAD == code courant). Baseline historique vérifiée : 1705d63 est le commit immédiatement
// PARENT de a8f02bd (le commit qui contient cette mission Explosivité), confirmé via
// `git show -s --format='%P' a8f02bd` -> 1705d63 (MISSION P0 NORMS, fonction distincte).
// Ce fichier utilise une comparaison DIRECTE (baseSlice brut, sans isolation) : baseSandbox
// représente donc l'intégralité du code à 1705d63, y compris pour les qualités non concernées par
// cette mission. TEST 13 exclut désormais 'Absorption' de la liste : 1705d63 prédate aussi la
// mission ULTÉRIEURE et distincte P1BIS (commit 64caaaf, intégration de cmj_landing_peak_force dans
// Absorption/Landing) qui modifie légitimement computeHypAbsorptionReceptionImpact — cette mission
// P1BIS est déjà testée et validée indépendamment dans son propre fichier de tests dédié
// (mission_cmj_landing_peak_force_absorption_tests.js). Comparer 'Absorption' ici ferait apparaître
// ce delta, réel mais SANS RAPPORT avec Explosivité, comme un faux positif de CETTE mission-ci.
const BASELINE_COMMIT = '1705d63';
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

test('TEST 1 — YANIS avant/après : HYP-EXP-01 (state/status/severity) strictement inchangé, seul completenessStatus/verdict/certainty changent (NOT_DETERMINED -> COMPLETE, AUCUNE_PREUVE_DIAGNOSTIQUE -> DIAGNOSTIC_OBJECTIVE, not_determined -> explained)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.functionScores['Explosivité'], before.functionScores['Explosivité'], 'HYP-EXP-01 doit rester strictement inchangé');
  const beforeAudit = before.clinicalSynthesisV2.clinicalCompletenessAudit['Explosivité'];
  const afterAudit = after.clinicalSynthesisV2.clinicalCompletenessAudit['Explosivité'];
  assert.strictEqual(beforeAudit.completenessStatus, 'NOT_DETERMINED');
  assert.strictEqual(afterAudit.completenessStatus, 'COMPLETE');
  assert.strictEqual(before.clinicalSynthesisV2.clinicalEvidenceHierarchy['Explosivité'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.strictEqual(after.clinicalSynthesisV2.clinicalEvidenceHierarchy['Explosivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(before.clinicalSynthesisV2.clinicalCertainty['Explosivité'], 'not_determined');
  assert.strictEqual(after.clinicalSynthesisV2.clinicalCertainty['Explosivité'], 'explained');
  // Le diagnosticStatus (Mission AI, csmV2AiDiagnosticStatus, lit la matrice directement) était déjà
  // correct depuis MISSION_HYP_EXP01_RSI_MOD et reste inchangé par cette mission-ci.
  assert.strictEqual(before.clinicalSynthesisV2.clinicalDiagnosticChain['Explosivité'].diagnosticStatus, 'classifiable_absolute');
  assert.strictEqual(after.clinicalSynthesisV2.clinicalDiagnosticChain['Explosivité'].diagnosticStatus, 'classifiable_absolute');
});

// ═══════════════════ 2-3 — CLASSIFIABLE / NON CLASSIFIABLE ════════════════════════════════════
test('TEST 2 — RSI-mod classifiable et déficitaire -> completeness cohérente (DIAGNOSTIC_OBJECTIVE, jamais NOT_DETERMINED)', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  const csm = r.clinicalSynthesisV2;
  assert.strictEqual(r.functionScores['Explosivité'].hypExp01.diagnosticEvidence.cmj_rsi_mod.status, 'deficitaire');
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Explosivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.notStrictEqual(csm.clinicalCompletenessAudit['Explosivité'].completenessStatus, 'NOT_DETERMINED');
});
test('TEST 3 — RSI-mod non classifiable (absent, aucune donnée cmj) -> aucune fausse preuve ajoutée, verdict reste AUCUNE_PREUVE_DIAGNOSTIQUE/NON_DETERMINABLE', () => {
  const r = computeMoteur({}, {}, null, 25, {});
  const csm = r.clinicalSynthesisV2;
  assert.strictEqual(r.functionScores['Explosivité'].hypExp01.diagnosticEvidence.cmj_rsi_mod.status, 'indisponible');
  assert.strictEqual(csm.clinicalProfile['Explosivité'].keyFindings.some((k) => k.variable === 'diagnosticEvidence.cmj_rsi_mod'), false);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Explosivité'].verdict, 'NON_DETERMINABLE_SANS_DONNEE');
});

// ═══════════════════ 4-5 — POPULATION NORMS COUVERTE / NON COUVERTE ═══════════════════════════
// cmj_rsi_mod est classifiée via un seuil UNIVERSEL (THRESHOLDS.cmj_rsi_mod, LOCKED, jamais recalculé
// ici) : dès qu'une valeur brute existe, HYP-EXP-01 la classe indépendamment du choix de population
// (aucune norme par population ne peut donc jamais "débloquer" ni "bloquer" cette classification à
// elle seule — comportement de computeStatusWithNormsV2, LOCKED, hors périmètre de cette mission).
// La couche CSM se contente de relire ce statut déjà tranché, quelle que soit la population fournie —
// exactement l'exigence de la mission ("ne pas dupliquer le diagnostic").
test('TEST 4 — population NORMS couverte (Yanis) : classifiabilité identique à celle décidée par HYP-EXP-01', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const hyp = r.functionScores['Explosivité'].hypExp01;
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings.find((k) => k.variable === 'diagnosticEvidence.cmj_rsi_mod');
  assert.strictEqual(hyp.diagnosticEvidence.cmj_rsi_mod.status, 'deficitaire');
  assert.ok(kf, 'la preuve doit être présente quand HYP-EXP-01 classe cmj_rsi_mod déficitaire');
  assert.strictEqual(kf.left, hyp.diagnosticEvidence.cmj_rsi_mod.raw);
});
test('TEST 5 — population NORMS non couverte / inconnue : la CSM suit fidèlement HYP-EXP-01 (seuil universel), jamais une classification inventée par la couche CSM elle-même', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.5] } } }, {}, 'population_totalement_inexistante_xyz', 25, {});
  const hyp = r.functionScores['Explosivité'].hypExp01;
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings.find((k) => k.variable === 'diagnosticEvidence.cmj_rsi_mod');
  // La CSM ne fait QUE relire hyp.diagnosticEvidence.cmj_rsi_mod.status : présence/absence de la
  // preuve dans keyFindings est strictement dérivée de ce champ LOCKED, jamais d'un nouveau calcul.
  assert.strictEqual(!!kf, hyp.diagnosticEvidence.cmj_rsi_mod.status === 'deficitaire');
});

// ═══════════════════ 6-7 — DÉFICITAIRE / PRÉSERVÉ ═══════════════════════════════════════════════
test('TEST 6 — RSI-mod déficitaire -> entrée keyFindings ajoutée, status="deficient"', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings.find((k) => k.variable === 'diagnosticEvidence.cmj_rsi_mod');
  assert.ok(kf);
  assert.strictEqual(kf.status, 'deficient');
  assert.strictEqual(kf.lsi, null, 'cmj est bilatéral : jamais de LSI pour cette preuve absolue');
});
test('TEST 7 — RSI-mod préservé (normal) -> aucune entrée ajoutée, jamais compté comme preuve déficitaire, verdict QUALITE_PRESERVEE', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { rsi_mod: [1.2] } } }, {}, null, 25, {});
  const hyp = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(hyp.diagnosticEvidence.cmj_rsi_mod.status, 'normal');
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings.find((k) => k.variable === 'diagnosticEvidence.cmj_rsi_mod');
  assert.strictEqual(kf, undefined);
  assert.strictEqual(r.clinicalSynthesisV2.clinicalEvidenceHierarchy['Explosivité'].verdict, 'QUALITE_PRESERVEE');
});

// ═══════════════════ 8-10 — HIÉRARCHIE PRIMARY / SECONDARY ═════════════════════════════════════
test('TEST 8 — RSI-mod (PRIMARY) prime devant les secondaires : quand rsi_mod est classifiable, HYP-EXP-01 ignore intégralement conc_rfd/conc_impulse_100 pour le state/status (diagnosticPath="cmj_rsi_mod_primary") — la CSM ne lit que cmj_rsi_mod, jamais les secondaires', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1], conc_rfd: [99999], conc_impulse_100: [99999] } } }, {}, null, 25, {});
  const hyp = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(hyp.convergence.diagnosticPath, 'cmj_rsi_mod_primary');
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings;
  assert.ok(kf.some((k) => k.variable === 'diagnosticEvidence.cmj_rsi_mod'));
  assert.strictEqual(kf.some((k) => k.variable.indexOf('conc_rfd') !== -1 || k.variable.indexOf('conc_impulse_100') !== -1), false, 'les secondaires ne doivent jamais apparaître comme preuve PRIMARY ajoutée par cette mission');
});
test('TEST 9 — conc_rfd non normé ne devient jamais PRIMARY : aucun seuil/norme -> toujours "indisponible", jamais injecté dans keyFindings par cette mission', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { conc_rfd: [99999] } } }, {}, null, 25, {});
  const hyp = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(hyp.diagnosticEvidence.cmj_conc_rfd.status, 'indisponible');
  assert.strictEqual(hyp.diagnosticEvidence.cmj_conc_rfd.role, 'secondary');
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('conc_rfd') !== -1), false);
});
test('TEST 10 — conc_impulse_100 non normé ne devient jamais PRIMARY : même garantie', () => {
  const r = computeMoteur({ cmj: { active: true, trials: { conc_impulse_100: [99999] } } }, {}, null, 25, {});
  const hyp = r.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(hyp.diagnosticEvidence.cmj_conc_impulse_100.status, 'indisponible');
  assert.strictEqual(hyp.diagnosticEvidence.cmj_conc_impulse_100.role, 'secondary');
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('conc_impulse_100') !== -1), false);
});

// ═══════════════════ 11 — PEAK POWER RESTE POWER ═══════════════════════════════════════════════
test('TEST 11 — cmj_peak_power reste rattachée à Puissance, jamais utilisée comme preuve diagnostique d\'Explosivité par cette mission', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const kf = r.clinicalSynthesisV2.clinicalProfile['Explosivité'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('peak_power') !== -1), false, 'peak_power ne doit jamais apparaître dans les keyFindings ajoutés à Explosivité');
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Puissance'].diagnostic.some((v) => v.variableKey.indexOf('peak_power') !== -1) || CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Puissance'].confirmative.some((v) => v.variableKey.indexOf('peak_power') !== -1), true, 'peak_power doit rester une variable de Puissance dans la matrice, inchangée');
});

// ═══════════════════ 12-13 — NON-RÉGRESSION HYP / AUTRES QUALITÉS ═════════════════════════════
test('TEST 12 — YANIS : verdict HYP-EXP-01 (state/status/severity/support) strictement identique avant/après', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.functionScores['Explosivité'], before.functionScores['Explosivité']);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Explosivité'].severity, before.clinicalSynthesisV2.clinicalProfile['Explosivité'].severity);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Explosivité'].state, before.clinicalSynthesisV2.clinicalProfile['Explosivité'].state);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Explosivité'].status, before.clinicalSynthesisV2.clinicalProfile['Explosivité'].status);
});
test('TEST 13 — YANIS : les 6 autres qualités restent byte-identiques (functionScores + clinicalProfile + clinicalCompletenessAudit) — Absorption exclue (cf. commentaire BASELINE_COMMIT : delta réel mais dû à la mission ULTÉRIEURE et distincte P1BIS, 64caaaf, déjà testée à part)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Réactivité', 'Mobilité', 'Stabilisation', 'Endurance'].forEach((q) => {
    assert.deepStrictEqual(after.functionScores[q], before.functionScores[q], q + ' functionScores ne doit pas changer');
    assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalProfile[q], before.clinicalSynthesisV2.clinicalProfile[q], q + ' clinicalProfile ne doit pas changer');
    assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalCompletenessAudit[q], before.clinicalSynthesisV2.clinicalCompletenessAudit[q], q + ' clinicalCompletenessAudit ne doit pas changer');
  });
});

// ═══════════════════ 14-16 — COHÉRENCE DE LA CHAÎNE ═══════════════════════════════════════════
test('TEST 14 — clinicalEvidenceHierarchy Explosivité cohérente (Yanis) : level1_diagnostic présent, contient exactement diagnosticEvidence.cmj_rsi_mod, jamais un doublon ni une variable étrangère', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const h = r.clinicalSynthesisV2.clinicalEvidenceHierarchy['Explosivité'];
  assert.strictEqual(h.level1_diagnostic.present, true);
  assert.strictEqual(h.level1_diagnostic.items.length, 1);
  assert.strictEqual(h.level1_diagnostic.items[0].variable, 'diagnosticEvidence.cmj_rsi_mod');
  assert.strictEqual(h.verdict, 'DIAGNOSTIC_OBJECTIVE');
});
test('TEST 15 — completenessStatus Explosivité cohérent avec le diagnostic réel (Yanis) : COMPLETE, jamais NOT_DETERMINED alors qu\'un diagnostic est objectivé', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.strictEqual(r.clinicalSynthesisV2.clinicalCompletenessAudit['Explosivité'].completenessStatus, 'COMPLETE');
});
test('TEST 16 — diagnosticStatus (Mission AI, clinicalDiagnosticChain) cohérent avec clinicalEvidenceHierarchy : les deux couches reconnaissent désormais la même preuve PRIMARY (plus de désynchronisation)', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = r.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalDiagnosticChain['Explosivité'].diagnosticStatus, 'classifiable_absolute');
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Explosivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.ok(csm.clinicalDiagnosticChain['Explosivité'].classifiableDiagnosticVariables.some((v) => v.variableKey === 'cmj_rsi_mod'));
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
test('GUARD 1 — les 7 autres moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES (y compris HYP-EXP-01 : cette mission ne modifie que la couche CSM, jamais le moteur) — computeHypAbsorption01 exclu (cf. commentaire BASELINE_COMMIT : la mission ULTÉRIEURE et distincte P1BIS, 64caaaf, modifie légitimement ce moteur ; ce delta réel est déjà couvert par mission_cmj_landing_peak_force_absorption_tests.js, hors périmètre de CETTE mission Explosivité)', () => {
  ['computeHypExplosivity01', 'computeHypForce01', 'computeHypMobility01',
    'computeHypPower01', 'computeHypReactivity01', 'computeHypStabilization01', 'computeHypEndurance01']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 2 — computeHypForceKpi (ForceKpi), computeAsymEngine, computeAsymPhase restent BYTE-IDENTIQUES', () => {
  ['computeHypForceKpi', 'computeAsymEngine', 'computeAsymPhase'].forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 3 — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal (aucune norme, aucun seuil, aucune variable/rôle modifié)', () => {
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 4 — le diff fonctionnel de cette mission se limite à computeCsmV2ClinicalProfile (keyFindings additif Explosivité) et aux 2 narrations "asymétries D/G" (filtre lsi!=null) — jamais computeMoteur/computeCsmV2/computeHypXxx01/CSM_V2_CLINICAL_VARIABLE_MATRIX — computeCsmV2ClinicalCertaintyForQuality exclu (cf. mission ULTÉRIEURE et distincte P5, qui élargit son gate d\'entrée à state===\'suspectee\' pour toutes les qualités ; ce delta réel est déjà couvert par mission_p5_csm_mechanistic_reasoning_suspectee_tests.js, hors périmètre de CETTE mission Explosivité)', () => {
  assert.strictEqual(extractFnBody(code, 'computeCsmV2ClinicalProfile') === extractFnBody(baseCode, 'computeCsmV2ClinicalProfile'), false, 'computeCsmV2ClinicalProfile doit avoir changé (cette mission)');
  ['computeMoteur', 'computeCsmV2', 'csmV2QualitySeverity', 'csmV2ClinicalReasoningForQuality', 'csmV2ExplanatoryFactorsForQuality', 'csmV2EvidenceHierarchyForQuality', 'csmV2AhCompletenessStatus'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' ne doit pas être modifiée — cette mission ne fait que réinjecter une preuve déjà calculée dans keyFindings, jamais recalculer la logique en aval');
  });
});
test('GUARD 5 — git diff --check ne signale aucun conflit de fusion dans index.html', () => {
  const out = execSync('git diff --check -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(out.trim(), '');
});
// MISSION P2BIS §7 — méthodologie : BASELINE_COMMIT doit être un ancêtre historique FIXE de HEAD,
// jamais HEAD lui-même. Ce test reste vrai indéfiniment : BASELINE_COMMIT est un SHA immuable, et
// HEAD ne peut jamais redevenir égal à un ancêtre strict au fil de l'évolution normale du dépôt.
test('MÉTHODOLOGIE — BASELINE_COMMIT est un ancêtre historique fixe de HEAD, jamais HEAD lui-même (garantit une comparaison avant/après réelle, non triviale, y compris après fusion dans main)', () => {
  const headSha = execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..') }).toString().trim();
  const baselineSha = execSync('git rev-parse ' + BASELINE_COMMIT, { cwd: path.join(__dirname, '..') }).toString().trim();
  assert.notStrictEqual(baselineSha, headSha, 'BASELINE_COMMIT ne doit jamais résoudre au commit HEAD courant (sinon avant===après, comparaison triviale)');
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + baselineSha + ' HEAD', { cwd: path.join(__dirname, '..') }); isAncestor = true; } catch (e) { isAncestor = false; }
  assert.strictEqual(isAncestor, true, 'BASELINE_COMMIT doit être un ancêtre strict de HEAD (état réellement PRÉ-mission, jamais un commit hors branche)');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

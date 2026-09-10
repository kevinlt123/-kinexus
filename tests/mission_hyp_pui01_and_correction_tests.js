// MISSION P2 CIBLÉE — HYP-PUI-01 : AUDITER PUIS CORRIGER LE AND STRICT SI ET SEULEMENT SI JUSTIFIÉ.
//
// DÉCISION DE CETTE MISSION : le AND strict (cmj_peak_power ET slcmj_peak_power classifiables
// conjointement) N'EST PAS MODIFIÉ. L'audit démontre qu'il s'agit d'une règle clinique DÉLIBÉRÉE et
// DOCUMENTÉE (CLI040, cf. CARTOGRAPHIE_CLINIQUE_HYP_PUISSANCE.md — "la condition la plus stricte
// identifiée dans toute la matrice Niveau 1"), et non d'un faux blocage structurel analogue à
// l'ancien bug d'Explosivité (où la preuve, déjà classifiable, n'était simplement jamais consultée
// par la couche CSM). Ici, slcmj_peak_power EST réellement classifiable via NORMS_V2 dès qu'une
// population est explicitement sélectionnée (comportement vérifié ci-dessous, TEST NORMS-V2) — le
// document CARTOGRAPHIE (qui affirmait "2/2 structurellement inatteignable, slcmj_peak_power
// n'ayant aucune entrée NORMS/THRESHOLDS") est donc lui-même DÉSORMAIS OBSOLÈTE sur ce point précis
// (NORMS_V2 a été enrichie par une mission ultérieure, jamais vérifiée par ce document) — mais sa
// conclusion clinique (CLI040 est une règle documentée et validée, pas un accident) reste valide et
// gouverne la décision de cette mission. Le AND exige simplement, comme partout ailleurs dans
// Kinexus pour les variables NORMS_V2, une sélection de population EXPLICITE et DÉLIBÉRÉE pour
// CHACUN des deux tests (cmj ET slcmj) — jamais un choix automatique implicite. Ce fichier est donc
// une suite d'AUDIT/VERROUILLAGE du comportement actuel (HYP-PUI-01 byte-identique, aucune ligne
// modifiée), pas une suite de correction.
//
// Exécution : node tests/mission_hyp_pui01_and_correction_tests.js — aucune dépendance externe.
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

console.log('MISSION P2 CIBLÉE — HYP-PUI-01 : audit du AND cmj_peak_power/slcmj_peak_power (AUCUNE MODIFICATION)');

// Population réelle NORMS_V2 couvrant À LA FOIS cmj_peak_power et slcmj_peak_power (Rugby Union,
// source S003) — bandes : cmj [P25=48,P50=53,P75=58], slcmj [P25=29,P50=33,P75=37].
const SEL = { population_vald: 'Rugby Union', source_id: 'S003', sexe: 'Unknown', age_band: null };
const NORM_SEL = { cmj: SEL, slcmj: SEL };
function run(cmjPP, slcmjD, slcmjG, normSel) {
  const testData = {};
  if (cmjPP !== undefined) testData.cmj = { active: true, trials: { peak_power: [cmjPP] } };
  if (slcmjD !== undefined || slcmjG !== undefined) testData.slcmj = { active: true, D: { trials: { peak_power: [slcmjD] } }, G: { trials: { peak_power: [slcmjG] } } };
  return computeHypPower01(testData, null, 25, normSel || NORM_SEL);
}

// ═══════════════════ A. COMPORTEMENT ACTUEL (1-4) ══════════════════════════════════════════════
test('TEST 1 — CMJ seul classifiable (SLCMJ absent) : cmj classifiable, slcmj indisponible, state=non_determinable', () => {
  const r = run(70, undefined, undefined);
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'normal');
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 2 — SLCMJ seul classifiable (CMJ absent) : slcmj classifiable, cmj indisponible, state=non_determinable', () => {
  const r = run(undefined, 45, 45);
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'normal');
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 3 — les deux classifiables : state réel produit (jamais non_determinable)', () => {
  const r = run(70, 45, 45);
  assert.notStrictEqual(r.state, 'non_determinable');
  assert.strictEqual(r.state, 'absente');
});
test('TEST 4 — aucun classifiable : state=non_determinable', () => {
  const r = run(undefined, undefined, undefined);
  assert.strictEqual(r.state, 'non_determinable');
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'indisponible');
});

// ═══════════════════ B. DONNÉES MANQUANTES (5-7) ═══════════════════════════════════════════════
test('TEST 5 — CMJ classifiable + SLCMJ absent : non_determinable (données manquantes, jamais un diagnostic partiel)', () => {
  const r = run(30, undefined, undefined);
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 6 — CMJ absent + SLCMJ classifiable : non_determinable', () => {
  const r = run(undefined, 15, 15);
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 7 — CMJ absent + SLCMJ absent : non_determinable', () => {
  const r = run(undefined, undefined, undefined);
  assert.strictEqual(r.state, 'non_determinable');
});

// ═══════════════════ C. CLASSIFICATION (8-11) — LA QUESTION CENTRALE DE LA MISSION ════════════
test('TEST 8 — CMJ déficitaire + SLCMJ absent : reste non_determinable (jamais "Power déficitaire" sur une seule preuve, cf. CLI040)', () => {
  const r = run(30, undefined, undefined);
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'deficitaire');
  assert.strictEqual(r.state, 'non_determinable', 'le AND est une règle documentée (CLI040) : une seule preuve, même déficitaire, ne suffit jamais');
});
test('TEST 9 — CMJ préservé + SLCMJ absent : reste non_determinable (jamais "Power preserved" sur une seule preuve)', () => {
  const r = run(70, undefined, undefined);
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'normal');
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 10 — CMJ absent + SLCMJ déficitaire : reste non_determinable', () => {
  const r = run(undefined, 15, 15);
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'deficitaire');
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 11 — CMJ absent + SLCMJ préservé : reste non_determinable', () => {
  const r = run(undefined, 45, 45);
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'normal');
  assert.strictEqual(r.state, 'non_determinable');
});

// ═══════════════════ D. DOUBLE PREUVE (12-15) ══════════════════════════════════════════════════
test('TEST 12 — les deux préservés -> absente/vert', () => {
  const r = run(70, 45, 45);
  assert.strictEqual(r.state, 'absente');
  assert.strictEqual(r.status, 'vert');
});
test('TEST 13 — les deux déficitaires -> retenue_faible/rouge', () => {
  const r = run(30, 15, 15);
  assert.strictEqual(r.state, 'retenue_faible');
  assert.strictEqual(r.status, 'rouge');
});
test('TEST 14 — CMJ déficitaire / SLCMJ préservé (conflit) : suspectee/jaune — règle de conflit déjà existante (1 mécanisme/2), jamais une majorité ou une priorité inventée', () => {
  const r = run(30, 45, 45);
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.status, 'jaune');
});
test('TEST 15 — CMJ préservé / SLCMJ déficitaire (conflit) : suspectee/jaune, même règle de conflit', () => {
  const r = run(70, 15, 15);
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.status, 'jaune');
});

// ═══════════════════ E. NON-CLASSIFIABLE (16-18) ════════════════════════════════════════════════
test('TEST 16 — valeur brute présente mais norme absente (aucune population fournie) -> indisponible, jamais compté comme preserved', () => {
  const r = run(70, 45, 45, {});
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.state, 'non_determinable');
});
test('TEST 17 — valeur absente -> indisponible (pas de raw du tout)', () => {
  const r = run(undefined, undefined, undefined);
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.raw, null);
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'indisponible');
});
test('TEST 18 — population non couverte -> indisponible', () => {
  const badSel = { population_vald: 'population_totalement_inexistante_xyz', source_id: 'ZZZ', sexe: 'Unknown', age_band: null };
  const r = run(70, 45, 45, { cmj: badSel, slcmj: badSel });
  assert.strictEqual(r.diagnosticEvidence.cmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.diagnosticEvidence.slcmj_peak_power.status, 'indisponible');
  assert.strictEqual(r.state, 'non_determinable');
});

// ═══════════════════ F. SÉPARATION (19-20) ══════════════════════════════════════════════════════
test('TEST 19 — cmj_peak_power reste rattachée à Puissance, jamais déplacée vers Explosivité', () => {
  assert.ok(QUALITY_DIAGNOSTIC_VARIABLES_V1['Puissance'].primary.some((v) => v.variableKey === 'cmj_peak_power'));
  assert.strictEqual((QUALITY_DIAGNOSTIC_VARIABLES_V1['Explosivité'].primary || []).some((v) => v.variableKey === 'cmj_peak_power'), false);
});
test('TEST 20 — l\'asymétrie SLCMJ (LSI) ne remplace jamais une preuve absolue : diagnosticEvidence.slcmj_peak_power.status reste dérivé de la classification absolue (D/G vs NORMS_V2), symmetryEvidence exposée séparément, jamais fusionnée dans .status', () => {
  const r = run(undefined, 15, 45); // fort LSI (asymétrie) mais UNE jambe déficitaire, l'autre non
  const slcmj = r.diagnosticEvidence.slcmj_peak_power;
  assert.ok('symmetryEvidence' in slcmj, 'symmetryEvidence doit rester un champ séparé');
  assert.notStrictEqual(slcmj.status, slcmj.symmetryEvidence.status, 'le statut absolu (pire côté vs NORMS) et le statut de symétrie (LSI) sont deux jugements distincts, jamais confondus');
  // Le statut absolu suit la règle "pire côté" déjà existante (jamais l'asymétrie elle-même) :
  assert.strictEqual(slcmj.status, 'deficitaire', 'le pire côté (15, rouge) détermine le statut absolu, pas le LSI');
});

// ═══════════════════ NORMS_V2 : preuve que le AND n\'est PAS structurellement inatteignable ═════
test('TEST NORMS-V2 — slcmj_peak_power EST réellement classifiable via NORMS_V2 dès qu\'une population est explicitement sélectionnée (contredit l\'affirmation obsolète de CARTOGRAPHIE_CLINIQUE_HYP_PUISSANCE.md)', () => {
  const res = computeStatusWithNormsV2('slcmj_peak_power', 'slcmj', 38, null, 25, { slcmj: SEL });
  assert.strictEqual(res.source, 'NORMS_V2');
  assert.strictEqual(res.clinicallyActive, true);
  assert.notStrictEqual(res.status, null);
});
test('TEST NORMS-V2 bis — sans sélection explicite de population pour slcmj, le "legacy" (THRESHOLDS/NORMS plats) ne couvre effectivement AUCUNE population pour slcmj_peak_power (vérifié, pas supposé)', () => {
  assert.strictEqual(THRESHOLDS['slcmj_peak_power'], undefined);
  Object.keys(NORMS).forEach((pop) => assert.strictEqual(NORMS[pop]['slcmj_peak_power'], undefined, pop + '.slcmj_peak_power ne doit avoir aucune entrée'));
});

// ═══════════════════ PROFILS SYNTHÉTIQUES (§11, mémoire uniquement) ═════════════════════════════
test('PROFIL A — CMJ Power bonne / SLCMJ absent -> non_determinable (documenté)', () => {
  assert.strictEqual(run(70, undefined, undefined).state, 'non_determinable');
});
test('PROFIL B — CMJ Power déficitaire / SLCMJ absent -> non_determinable (documenté)', () => {
  assert.strictEqual(run(30, undefined, undefined).state, 'non_determinable');
});
test('PROFIL C — CMJ absent / SLCMJ Power bonne -> non_determinable (documenté)', () => {
  assert.strictEqual(run(undefined, 45, 45).state, 'non_determinable');
});
test('PROFIL D — CMJ absent / SLCMJ Power déficitaire -> non_determinable (documenté)', () => {
  assert.strictEqual(run(undefined, 15, 15).state, 'non_determinable');
});
test('PROFIL E — deux bons -> absente/vert', () => {
  const r = run(70, 45, 45);
  assert.strictEqual(r.state, 'absente');
  assert.strictEqual(r.status, 'vert');
});
test('PROFIL F — deux déficitaires -> retenue_faible/rouge', () => {
  const r = run(30, 15, 15);
  assert.strictEqual(r.state, 'retenue_faible');
  assert.strictEqual(r.status, 'rouge');
});
test('PROFIL G — conflit CMJ bon / SLCMJ déficitaire -> suspectee/jaune', () => {
  const r = run(70, 15, 15);
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.status, 'jaune');
});
test('PROFIL H — conflit CMJ déficitaire / SLCMJ bon -> suspectee/jaune', () => {
  const r = run(30, 45, 45);
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.status, 'jaune');
});

// ═══════════════════ YANIS — AVANT/APRÈS (§12, fixture jamais modifiée) ═════════════════════════
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

test('YANIS — aucune modification apportée à HYP-PUI-01 : documente que ni cmj_peak_power ni slcmj_peak_power ne sont classifiables pour ce bilan précis (deux raisons SÉPARÉES, sans rapport avec le AND lui-même), donc le AND n\'a aucun effet observable ici', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const hyp = r.functionScores['Puissance'].hypPui01;
  // cmj_peak_power : raw présent (46.1) mais NON classifiable — le sélecteur Yanis utilise une
  // apostrophe droite ("College - Men's Swimming") alors que l'entrée réelle NORMS_V2 utilise une
  // apostrophe typographique ("College - Men’s Swimming") : décalage d'encodage préexistant,
  // documenté ici, HORS PÉRIMÈTRE de cette mission (jamais la fixture Yanis, jamais NORMS_V2
  // modifiés — cf. périmètre §1).
  assert.strictEqual(hyp.diagnosticEvidence.cmj_peak_power.raw, 46.1);
  assert.strictEqual(hyp.diagnosticEvidence.cmj_peak_power.status, 'indisponible');
  const mismatchConfirmed = NORMS_V2.cmj_peak_power.some((e) => e.source_id === 'S001' && e.population_vald !== "College - Men's Swimming" && e.population_vald.indexOf('Men') !== -1);
  assert.ok(mismatchConfirmed, 'confirme le décalage d\'apostrophe déjà présent dans NORMS_V2 (S001), non introduit par cette mission');
  // slcmj_peak_power : raw présent (26.6/29.6) mais NON classifiable — aucun sélecteur normSelections.slcmj
  // n'est fourni dans la fixture Yanis (jamais fabriqué ici) -> repli "legacy" -> aucune norme plate.
  assert.strictEqual(hyp.diagnosticEvidence.slcmj_peak_power.rawD, 26.6);
  assert.strictEqual(hyp.diagnosticEvidence.slcmj_peak_power.rawG, 29.6);
  assert.strictEqual(hyp.diagnosticEvidence.slcmj_peak_power.status, 'indisponible');
  assert.strictEqual(YANNIS_NORM_SEL.slcmj, undefined, 'aucun sélecteur slcmj dans la fixture Yanis — jamais ajouté par cette mission');
  // Statut HYP avant = après (aucune modification) : non_determinable, car AUCUNE des deux preuves
  // n'est classifiable pour ce bilan précis — pas une démonstration du AND lui-même.
  assert.strictEqual(hyp.state, 'non_determinable');
  assert.strictEqual(hyp.status, null);
});
test('YANIS — sévérité/diagnosticStatus/completenessStatus documentés (couche CSM, dérivée en partie de l\'asymétrie slcmj — mécanisme préexistant, sans rapport avec le AND HYP-PUI-01, non modifié par cette mission)', () => {
  const r = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = r.clinicalSynthesisV2;
  // La sévérité/le verdict de Puissance chez Yanis proviennent de symmetryEvidence (LSI slcmj_peak_power,
  // 89.9%, 'deficient') — un mécanisme déjà existant et commun aux 8 qualités (Mission Étape J,
  // jamais introduit ni modifié ici), INDÉPENDANT du AND absolu HYP-PUI-01 audité par cette mission.
  assert.strictEqual(csm.clinicalProfile['Puissance'].severity, 'modere');
  assert.ok(csm.clinicalProfile['Puissance'].keyFindings.some((k) => k.variable.indexOf('slcmj_peak_power') !== -1));
});

// ═══════════════════ GUARDS (§14) — AUCUNE MODIFICATION, TOUT DOIT ÊTRE BYTE-IDENTIQUE ═════════
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

test('GUARD 1 — HYP-PUI-01 et TOUS ses helpers restent BYTE-IDENTIQUES à HEAD (aucune modification, cette mission est un audit)', () => {
  ['computeHypPower01', 'computeHypPowerCmj', 'computeHypPowerSlcmj', 'computeHypPowerSubstitutes', 'computeHypPowerCapacite', 'computeHypPowerStrategie']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit (cette mission n\'implémente aucune correction)'));
});
test('GUARD 2 — les 7 autres HYP (dont HYP-EXP-01/HYP-ABS-01) restent BYTE-IDENTIQUES', () => {
  ['computeHypExplosivity01', 'computeHypAbsorption01', 'computeHypForce01', 'computeHypMobility01',
    'computeHypReactivity01', 'computeHypStabilization01', 'computeHypEndurance01']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 3 — applyThr/pctStatus/computeStatusWithNormsV2/computeAsymEngine/computeHypForceKpi/computeCsmV2/computeMoteur restent BYTE-IDENTIQUES', () => {
  ['applyThr', 'pctStatus', 'computeStatusWithNormsV2', 'computeAsymEngine', 'computeAsymPhase', 'computeHypForceKpi', 'computeCsmV2', 'computeMoteur']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 4 — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal (aucune norme/seuil/rôle modifié)', () => {
  const baseStart = baseCode.indexOf('var C={');
  const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
  const baseSlice = baseCode.slice(baseStart, baseEnd);
  const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 5 — git diff --check ne signale aucun conflit de fusion dans index.html (fichier non modifié par cette mission)', () => {
  const out = execSync('git diff --check -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(out.trim(), '');
  const status = execSync('git status --porcelain -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(status.trim(), '', 'index.html ne doit apparaître dans aucun diff — cette mission ne modifie aucun code clinique');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

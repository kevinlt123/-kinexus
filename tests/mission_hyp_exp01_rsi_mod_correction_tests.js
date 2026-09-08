// MISSION — CORRECTION CLINIQUE CIBLÉE HYP-EXP-01 : EXPLOSIVITÉ
//
// cmj_conc_rfd/cmj_conc_impulse_100 (preuves diagnostiques d'origine) n'ont jamais eu de seuil (ni
// NORMS ni THRESHOLDS) -> HYP-EXP-01 était structurellement non_determinable pour tout patient réel.
// cmj_rsi_mod dispose d'un seuil universel (THRESHOLDS.cmj_rsi_mod) et de NORMS pour 24 populations
// -> validée par le praticien comme preuve diagnostique PRIMARY (cmj_conc_rfd/cmj_conc_impulse_100
// deviennent SECONDARY/historique, repli uniquement si cmj_rsi_mod n'est pas classifiable).
//
// Modification strictement scopée à computeHypExplosivity01 (+ ajout additif du champ `source` dans
// computeHypExplosivityCmjKpi, réutilisée uniquement par Explosivité, cf. index.html). Aucun autre
// moteur HYP, aucun seuil/norme, aucune structure de référence touchée.
//
// Exécution : node tests/mission_hyp_exp01_rsi_mod_correction_tests.js
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

console.log('MISSION — Correction clinique ciblée HYP-EXP-01 : Explosivité');

var POP = 'bball2425_ncaa_m', AGE = 26;
function cmjTd(fields) { return { cmj: { active: true, trials: fields } }; }

// ═══════════════ TEST 1 — RSI-mod déficient ══════════════════════════════════════════════════════
test('TEST 1 — RSI-mod disponible + classifiable + deficient -> HYP-EXP-01 = deficient (retenue_faible)', () => {
  var h = computeHypExplosivity01(cmjTd({ rsi_mod: [0.2] }), POP, AGE, {});
  assert.strictEqual(h.diagnostic.cmj_rsi_mod.classifiable, true);
  assert.strictEqual(h.diagnostic.cmj_rsi_mod.status, 'deficitaire');
  assert.strictEqual(h.state, 'retenue_faible');
  assert.strictEqual(h.status, 'rouge');
  assert.strictEqual(h.convergence.diagnosticPath, 'cmj_rsi_mod_primary');
});

// ═══════════════ TEST 2 — RSI-mod préservé ═══════════════════════════════════════════════════════
test('TEST 2 — RSI-mod disponible + classifiable + preserved -> HYP-EXP-01 = preserved (absente)', () => {
  var h = computeHypExplosivity01(cmjTd({ rsi_mod: [1.0] }), POP, AGE, {});
  assert.strictEqual(h.diagnostic.cmj_rsi_mod.classifiable, true);
  assert.strictEqual(h.diagnostic.cmj_rsi_mod.status, 'normal');
  assert.strictEqual(h.state, 'absente');
  assert.strictEqual(h.status, 'vert');
  assert.strictEqual(h.convergence.diagnosticPath, 'cmj_rsi_mod_primary');
});

// ═══════════════ TEST 3 — RSI-mod indisponible + 2 secondaires déficitaires (fallback historique) ═
test('TEST 3 — RSI-mod non classifiable + conc_rfd ET conc_impulse_100 classifiables+deficient (seuils injectés) -> fallback historique -> deficient', () => {
  var had1 = 'cmj_conc_rfd' in THRESHOLDS, had2 = 'cmj_conc_impulse_100' in THRESHOLDS;
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try {
    var h = computeHypExplosivity01(cmjTd({ conc_rfd: [10], conc_impulse_100: [0.1] }), POP, AGE, {});
    assert.strictEqual(h.diagnostic.cmj_rsi_mod.classifiable, false, 'prérequis : RSI-mod non fourni -> non classifiable');
    assert.strictEqual(h.diagnostic.cmj_conc_rfd.classifiable, true);
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.classifiable, true);
    assert.strictEqual(h.diagnostic.cmj_conc_rfd.status, 'deficitaire');
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.status, 'deficitaire');
    assert.strictEqual(h.state, 'retenue_faible');
    assert.strictEqual(h.convergence.diagnosticPath, 'secondaire_historique_fallback');
  } finally {
    if (!had1) delete THRESHOLDS.cmj_conc_rfd;
    if (!had2) delete THRESHOLDS.cmj_conc_impulse_100;
  }
});

// ═══════════════ TEST 4 — RSI-mod indisponible + 1 secondaire déficitaire classifiable ═══════════
test('TEST 4 — RSI-mod non classifiable + UNE seule secondaire classifiable+deficient (l\'autre non classifiable, seuil non injecté) -> suspectee (statut historique pour 1 preuve déficitaire)', () => {
  var had = 'cmj_conc_rfd' in THRESHOLDS;
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  try {
    var h = computeHypExplosivity01(cmjTd({ conc_rfd: [10] }), POP, AGE, {});
    assert.strictEqual(h.diagnostic.cmj_rsi_mod.classifiable, false);
    assert.strictEqual(h.diagnostic.cmj_conc_rfd.classifiable, true);
    assert.strictEqual(h.diagnostic.cmj_conc_rfd.status, 'deficitaire');
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.classifiable, false, 'prérequis : la 2e secondaire reste non classifiable (aucun seuil injecté)');
    assert.strictEqual(h.state, 'suspectee');
    assert.strictEqual(h.convergence.diagnosticPath, 'secondaire_historique_fallback');
  } finally {
    if (!had) delete THRESHOLDS.cmj_conc_rfd;
  }
});

// ═══════════════ TEST 5 — RSI-mod indisponible + 0 secondaire classifiable ═══════════════════════
test('TEST 5 — RSI-mod non classifiable + conc_rfd/conc_impulse_100 non classifiables (aucun seuil réel) -> NON DÉTERMINABLE, surtout PAS preserved', () => {
  var h = computeHypExplosivity01(cmjTd({ conc_rfd: [1], conc_impulse_100: [1] }), POP, AGE, {});
  assert.strictEqual(h.diagnostic.cmj_rsi_mod.classifiable, false);
  assert.strictEqual(h.diagnostic.cmj_conc_rfd.classifiable, false, 'prérequis : aucun seuil réel pour conc_rfd aujourd\'hui');
  assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.classifiable, false, 'prérequis : aucun seuil réel pour conc_impulse_100 aujourd\'hui');
  assert.strictEqual(h.state, 'non_determinable');
  assert.notStrictEqual(h.state, 'absente', 'jamais preserved quand aucune preuve n\'est exploitable');
  assert.strictEqual(h.status, null);
});

// ═══════════════ TEST 6 — variable non classifiable ne compte jamais, ne contribue jamais au quorum
test('TEST 6 — une valeur brute présente mais sans seuil/norme ne compte ni comme preserved ni comme deficient, et ne contribue jamais au quorum', () => {
  var had = 'cmj_conc_rfd' in THRESHOLDS;
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  try {
    // conc_rfd classifiable+preserved (150>=vert) ; conc_impulse_100 valeur brute présente MAIS sans
    // seuil -> non classifiable. Si elle comptait comme "preserved", 2 preuves non-déficitaires
    // donneraient 'absente' de la même façon qu'avec 1 seule -> ce test isole le cas où SEULE la
    // variable classifiable doit compter (1 classifiable, 0 déficitaire -> absente, jamais un effet
    // du tout de la valeur brute non classifiable).
    var h = computeHypExplosivity01(cmjTd({ conc_rfd: [150], conc_impulse_100: [999] }), POP, AGE, {});
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.classifiable, false, 'prérequis : conc_impulse_100 reste non classifiable malgré une valeur brute présente');
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.status, 'indisponible', 'jamais "normal" ni "deficitaire" pour une variable non classifiable');
    assert.strictEqual(h.convergence.mechanismsInvolved.indexOf('cmj_conc_impulse_100'), -1, 'ne doit jamais apparaître comme mécanisme observé');
    assert.strictEqual(h.state, 'absente', 'seule cmj_conc_rfd (classifiable, non déficitaire) compte -> absente, jamais un état différent à cause de la valeur brute non classifiable');
  } finally {
    if (!had) delete THRESHOLDS.cmj_conc_rfd;
  }
});

// ═══════════════ TEST 7 — priorité RSI-mod (preserved malgré secondaires artificiellement deficient)
test('TEST 7 — RSI-mod classifiable+preserved, secondaires artificiellement déficitaires/classifiables -> diagnostic reste PRESERVED (RSI-mod est la preuve primaire, jamais écrasée par les secondaires)', () => {
  var had1 = 'cmj_conc_rfd' in THRESHOLDS, had2 = 'cmj_conc_impulse_100' in THRESHOLDS;
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try {
    var h = computeHypExplosivity01(cmjTd({ rsi_mod: [1.0], conc_rfd: [1], conc_impulse_100: [0.01] }), POP, AGE, {});
    assert.strictEqual(h.diagnostic.cmj_rsi_mod.status, 'normal');
    assert.strictEqual(h.diagnostic.cmj_conc_rfd.status, 'deficitaire', 'prérequis : la secondaire est bien artificiellement déficitaire');
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.status, 'deficitaire', 'prérequis : la secondaire est bien artificiellement déficitaire');
    assert.strictEqual(h.state, 'absente');
    assert.strictEqual(h.status, 'vert');
    assert.strictEqual(h.convergence.diagnosticPath, 'cmj_rsi_mod_primary');
  } finally {
    if (!had1) delete THRESHOLDS.cmj_conc_rfd;
    if (!had2) delete THRESHOLDS.cmj_conc_impulse_100;
  }
});

// ═══════════════ TEST 8 — priorité RSI-mod (deficient malgré secondaires artificiellement preserved)
test('TEST 8 — RSI-mod classifiable+deficient, secondaires artificiellement préservées/classifiables -> diagnostic DEFICIENT (RSI-mod prime toujours)', () => {
  var had1 = 'cmj_conc_rfd' in THRESHOLDS, had2 = 'cmj_conc_impulse_100' in THRESHOLDS;
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try {
    var h = computeHypExplosivity01(cmjTd({ rsi_mod: [0.2], conc_rfd: [150], conc_impulse_100: [1.5] }), POP, AGE, {});
    assert.strictEqual(h.diagnostic.cmj_rsi_mod.status, 'deficitaire');
    assert.strictEqual(h.diagnostic.cmj_conc_rfd.status, 'normal', 'prérequis : la secondaire est bien artificiellement préservée');
    assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.status, 'normal', 'prérequis : la secondaire est bien artificiellement préservée');
    assert.strictEqual(h.state, 'retenue_faible');
    assert.strictEqual(h.status, 'rouge');
    assert.strictEqual(h.convergence.diagnosticPath, 'cmj_rsi_mod_primary');
  } finally {
    if (!had1) delete THRESHOLDS.cmj_conc_rfd;
    if (!had2) delete THRESHOLDS.cmj_conc_impulse_100;
  }
});

// ═══════════════ TEST 9 — absence totale de données ══════════════════════════════════════════════
test('TEST 9 — aucune variable exploitable (CMJ inactif) -> non déterminable, aucun fallback artificiel', () => {
  var h = computeHypExplosivity01({}, POP, AGE, {});
  assert.strictEqual(h.diagnostic.cmj_rsi_mod.classifiable, false);
  assert.strictEqual(h.diagnostic.cmj_conc_rfd.classifiable, false);
  assert.strictEqual(h.diagnostic.cmj_conc_impulse_100.classifiable, false);
  assert.strictEqual(h.state, 'non_determinable');
  assert.strictEqual(h.status, null);
});

// ═══════════════ TEST 10 — structure de traceability ═════════════════════════════════════════════
test('TEST 10 — la sortie identifie explicitement RSI-mod=PRIMARY, conc_rfd/conc_impulse_100=SECONDARY, et la classifiabilité réelle de chacune', () => {
  var h = computeHypExplosivity01(cmjTd({ rsi_mod: [0.2] }), POP, AGE, {});
  var rsi = h.diagnostic.cmj_rsi_mod, rfd = h.diagnostic.cmj_conc_rfd, imp = h.diagnostic.cmj_conc_impulse_100;
  [rsi, rfd, imp].forEach(function (e) {
    ['status', 'raw', 'category', 'source', 'role', 'unit', 'classifiable', 'justification'].forEach(function (f) {
      assert.ok(f in e, 'champ de traçabilité manquant : ' + f);
    });
  });
  assert.strictEqual(rsi.role, 'primary');
  assert.strictEqual(rfd.role, 'secondary');
  assert.strictEqual(imp.role, 'secondary');
  assert.strictEqual(rsi.classifiable, true);
  assert.strictEqual(rfd.classifiable, false);
  assert.strictEqual(imp.classifiable, false);
  assert.strictEqual(rsi.raw, 0.2);
  assert.strictEqual(rsi.unit, 'ratio');
});

// ═══════════════ Non-régression du contrat HYP V1 commun ═════════════════════════════════════════
test('Le contrat HYP V1 commun (hypId/quality/state/status/support/convergence/diagnostic/diagnosticEvidence/confirmative/confirmativeEvidence/explanatory/explanatoryEvidence/precision/limitations/note) reste intégralement exposé', () => {
  var h = computeHypExplosivity01(cmjTd({ rsi_mod: [0.2] }), POP, AGE, {});
  ['hypId', 'quality', 'state', 'status', 'support', 'convergence', 'diagnostic', 'diagnosticEvidence', 'confirmative', 'confirmativeEvidence', 'explanatory', 'explanatoryEvidence', 'precision', 'limitations', 'note'].forEach(function (f) {
    assert.ok(f in h, 'champ de contrat manquant : ' + f);
  });
  assert.strictEqual(h.hypId, 'HYP-EXP-01');
  assert.strictEqual(h.quality, 'Explosivité');
  assert.ok(Array.isArray(h.limitations));
});
test('Peak Power n\'est jamais utilisé comme preuve diagnostique d\'Explosivité (appartient à Puissance dans QUALITY_DIAGNOSTIC_VARIABLES_V1)', () => {
  var h = computeHypExplosivity01(cmjTd({ peak_power: [50] }), POP, AGE, {});
  assert.strictEqual('cmj_peak_power' in h.diagnostic, false);
  assert.ok(QUALITY_DIAGNOSTIC_VARIABLES_V1.Puissance.primary.some(function (e) { return e.variableKey === 'cmj_peak_power'; }), 'prérequis : cmj_peak_power reste bien la variable de Puissance dans le référentiel V1');
});

// ═══════════════ YANIS / patient de référence — avant / après ════════════════════════════════════
console.log('\nYANIS — patient de référence, avant/après');
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
const BASELINE_COMMIT = '728939f'; // dernier commit avant cette mission
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {computeMoteur:computeMoteur,computeHypForceKpi:computeHypForceKpi,computeCsmV2:typeof computeCsmV2!=="undefined"?computeCsmV2:null,NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

const beforeOut = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
const afterOut = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);

test('YANIS — statut Explosivité AVANT cette mission : non_determinable (documenté, jamais recalculé ici)', () => {
  assert.strictEqual(beforeOut.functionScores['Explosivité'].hypExp01.state, 'non_determinable');
  assert.strictEqual(beforeOut.functionScores['Explosivité'].status, null);
  assert.strictEqual(beforeOut.clinicalSynthesisV2.clinicalProfile['Explosivité'].severity, 'modere', 'AVANT : sévérité CSM V2 dérivée du repli TFM (HYP non déterminable)');
});
test('YANIS — statut Explosivité APRÈS cette mission : déterminable via cmj_rsi_mod=0.34 (classe "rouge", déficitaire)', () => {
  var hyp = afterOut.functionScores['Explosivité'].hypExp01;
  assert.strictEqual(hyp.diagnostic.cmj_rsi_mod.raw, 0.34);
  assert.strictEqual(hyp.diagnostic.cmj_rsi_mod.category, 'rouge');
  assert.strictEqual(hyp.diagnostic.cmj_rsi_mod.classifiable, true);
  assert.strictEqual(hyp.diagnostic.cmj_rsi_mod.source, 'legacy', 'résolu via THRESHOLDS.cmj_rsi_mod (seuil universel) — aucune entrée NORMS_V2/NORMS pour ce sélecteur de population Yanis');
  assert.strictEqual(hyp.convergence.diagnosticPath, 'cmj_rsi_mod_primary');
  assert.strictEqual(hyp.state, 'retenue_faible');
  assert.strictEqual(afterOut.functionScores['Explosivité'].status, 'orange');
  assert.strictEqual(afterOut.clinicalSynthesisV2.clinicalProfile['Explosivité'].severity, 'majeur', 'APRÈS : sévérité CSM V2 dérivée du vrai diagnostic HYP (déficitaire), plus du repli TFM');
});
test('YANIS — les 7 AUTRES qualités restent EXACTEMENT identiques avant/après (changement strictement scopé à Explosivité)', () => {
  // Absorption exclue de la comparaison structurelle stricte (functionScores) : une mission
  // ULTÉRIEURE et distincte (MISSION_HYP_ABS01_ABSORPTION_CORRECTION, sans rapport avec Explosivité)
  // lui a depuis ajouté les champs additifs braking/landing — sa sévérité CSM V2, elle, reste
  // strictement vérifiée ci-dessous comme les 6 autres qualités.
  const OTHER = ['Force', 'Puissance', 'Mobilité', 'Réactivité', 'Stabilisation', 'Endurance'];
  OTHER.forEach(function (q) {
    assert.deepStrictEqual(afterOut.functionScores[q], beforeOut.functionScores[q], q + ' a changé alors que seule Explosivité devait être affectée');
    assert.strictEqual(afterOut.clinicalSynthesisV2.clinicalProfile[q].severity, beforeOut.clinicalSynthesisV2.clinicalProfile[q].severity, q + ' : sévérité CSM V2 a changé');
  });
  assert.strictEqual(afterOut.clinicalSynthesisV2.clinicalProfile['Absorption'].severity, beforeOut.clinicalSynthesisV2.clinicalProfile['Absorption'].severity, 'Absorption : sévérité CSM V2 a changé');
});

console.log('\nRÉSUMÉ YANIS :');
console.log('  Avant : Explosivité = non_determinable (status=null, severity CSM V2="modere" via repli TFM)');
console.log('  Après : Explosivité = retenue_faible (status=orange, severity CSM V2="majeur")');
console.log('  Variable ayant permis le changement : cmj_rsi_mod (PRIMARY, désormais consommée)');
console.log('  Valeur RSI-mod : 0.34  |  Classification : rouge (déficitaire, seuil universel THRESHOLDS.cmj_rsi_mod {vert:0.8,jaune:0.6,orange:0.4})');
console.log('  Source normative : legacy/THRESHOLDS (aucune entrée NORMS/NORMS_V2 pour le sélecteur de population de ce patient)');
console.log('  Les 7 autres qualités : strictement inchangées');

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
console.log('\nGUARDS');
function extractFnBody(src, fnName) {
  const marker = 'function ' + fnName + '(';
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(fnName + ' introuvable');
  let depth = 0, i = src.indexOf('{', idx), bodyStart = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
  }
  throw new Error('accolade non fermée pour ' + fnName);
}

test('GUARD 1 — les 6 AUTRES moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES (jamais Explosivité, seule fonction volontairement modifiée par cette mission ; computeHypAbsorption01 exclu séparément — modifié par une mission ULTÉRIEURE et distincte, MISSION_HYP_ABS01_ABSORPTION_CORRECTION, vérifiée par sa propre suite dédiée)', () => {
  const OTHER_HYP_FNS = ['computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypStabilization01', 'computeHypEndurance01'];
  OTHER_HYP_FNS.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' n\'aurait jamais dû changer'));
  assert.notStrictEqual(extractFnBody(code, 'computeHypExplosivity01'), extractFnBody(baseCode, 'computeHypExplosivity01'), 'computeHypExplosivity01 DOIT avoir changé — sinon cette mission n\'a pas eu lieu');
});
test('GUARD 2 — computeHypForceKpi reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypForceKpi'), extractFnBody(baseCode, 'computeHypForceKpi'));
});
test('GUARD 3 — computeCsmV2 reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeCsmV2'), extractFnBody(baseCode, 'computeCsmV2'));
});
test('GUARD 4 — computeMoteur reste BYTE-IDENTIQUE (aucun câblage modifié, seul le moteur HYP-EXP-01 qu\'il appelle a changé)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'));
});
test('GUARD 5 — NORMS/THRESHOLDS/NORMS_V2 STRICTEMENT inchangés (deep-equal) — aucun nouveau seuil créé', () => {
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
});
test('GUARD 6 — QUALITY_DIAGNOSTIC_VARIABLES_V1 inchangé (deep-equal)', () => {
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
});
// RÉVISÉ (finding fait pendant cette mission) : CSM_V2_CLINICAL_VARIABLE_MATRIX n'est PAS une
// donnée de référence statique — c'est une IIFE qui INTROSPECTE STRUCTURELLEMENT les 8 moteurs
// computeHypXxx01 eux-mêmes à chaque chargement (cf. son propre meta.builtFrom : "Introspection
// structurelle des 8 moteurs computeHypXxx01..."). Un deep-equal contre la baseline est donc
// impossible à satisfaire dès qu'un moteur HYP change légitimement de diagnosticEvidence — ce que
// cette mission fait explicitement et intentionnellement pour Explosivité. La garantie réellement
// utile n'est pas "la matrice ne change jamais" mais "la FORMULE qui la construit ne change jamais,
// et son delta se limite exactement à ce que le nouveau diagnosticEvidence de HYP-EXP-01 implique".
test('GUARD 7 — la FORMULE qui dérive CSM_V2_CLINICAL_VARIABLE_MATRIX (l\'IIFE elle-même) reste BYTE-IDENTIQUE ; seul son résultat évolue, exactement à hauteur de l\'ajout de cmj_rsi_mod au diagnosticEvidence d\'Explosivité', () => {
  function extractMatrixIIFE(src) {
    const marker = 'var CSM_V2_CLINICAL_VARIABLE_MATRIX=(function(){';
    const idx = src.indexOf(marker);
    assert.ok(idx >= 0, 'IIFE introuvable');
    const iifeStart = src.indexOf('(function(){', idx);
    let depth = 0, i = src.indexOf('{', iifeStart), bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(idx, i + 4); }
    }
    throw new Error('accolade non fermée pour l\'IIFE de la matrice');
  }
  assert.strictEqual(extractMatrixIIFE(code), extractMatrixIIFE(baseCode), 'la formule de dérivation de la matrice ne doit jamais être modifiée par cette mission');

  const before = baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX;
  const after = CSM_V2_CLINICAL_VARIABLE_MATRIX;
  // Toutes les qualités AUTRES qu'Explosivité restent identiques dans byQuality (le delta est
  // strictement localisé).
  Object.keys(before.byQuality || {}).forEach((q) => {
    if (q === 'Explosivité') return;
    assert.deepStrictEqual(after.byQuality[q], before.byQuality[q], q + ' n\'aurait jamais dû changer dans la matrice dérivée');
  });
  // Pour Explosivité : le seul delta attendu est l'apparition de cmj_rsi_mod en diagnostic DIRECT
  // exploitable ; cmj_conc_rfd/cmj_conc_impulse_100 restent des entrées non_classifiable inchangées.
  const beforeExpDiag = before.byQuality['Explosivité'].diagnostic.map((e) => e.variableKey).sort();
  const afterExpDiag = after.byQuality['Explosivité'].diagnostic.map((e) => e.variableKey).sort();
  assert.deepStrictEqual(afterExpDiag, [...beforeExpDiag, 'cmj_rsi_mod'].sort(), 'le seul ajout attendu au diagnostic d\'Explosivité est cmj_rsi_mod');
  const rsiEntry = after.byQuality['Explosivité'].diagnostic.find((e) => e.variableKey === 'cmj_rsi_mod');
  assert.strictEqual(rsiEntry.classifiability, 'exploitable');
  assert.strictEqual(rsiEntry.role, 'DIRECT');
  ['cmj_conc_rfd', 'cmj_conc_impulse_100'].forEach((k) => {
    const b = before.byQuality['Explosivité'].diagnostic.find((e) => e.variableKey === k);
    const a = after.byQuality['Explosivité'].diagnostic.find((e) => e.variableKey === k);
    assert.deepStrictEqual(a, b, k + ' ne doit pas changer dans la matrice dérivée');
  });
  // Compteurs globaux : +1 sur diagnosticCount/classifiableCount/totalVariables, tout le reste
  // (confirmativeCount/explanatoryCount/missingCount) strictement inchangé.
  assert.strictEqual(after.meta.diagnosticCount, before.meta.diagnosticCount + 1);
  assert.strictEqual(after.meta.classifiableCount, before.meta.classifiableCount + 1);
  assert.strictEqual(after.meta.totalVariables, before.meta.totalVariables + 1);
  assert.strictEqual(after.meta.confirmativeCount, before.meta.confirmativeCount);
  assert.strictEqual(after.meta.explanatoryCount, before.meta.explanatoryCount);
  assert.strictEqual(after.meta.missingCount, before.meta.missingCount);
});
test('GUARD 8 — le diff fonctionnel de cette mission se limite à computeHypExplosivity01 et computeHypExplosivityCmjKpi (ajout additif du champ `source`) — jamais un autre moteur', () => {
  assert.notStrictEqual(extractFnBody(code, 'computeHypExplosivityCmjKpi'), extractFnBody(baseCode, 'computeHypExplosivityCmjKpi'), 'computeHypExplosivityCmjKpi doit avoir changé (ajout additif de `source`)');
  ['computeHypExplosivityConfirmative', 'computeHypExplosivityExplanatory', 'hypStatusFromState', 'computeStatusWithNormsV2', 'computeAsymEngine', 'computeAsymPhase', 'computeBiomecaPhase'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' n\'aurait jamais dû changer');
  });
});

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

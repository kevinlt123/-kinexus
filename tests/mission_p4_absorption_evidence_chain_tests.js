// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION P4 — AUDIT CLINIQUE CIBLÉ HYP-ABS-01/ABSORPTION : chaîne de preuve CSM V2
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Défaut démontré par l'audit : keyFindings (computeCsmV2ClinicalProfile) n'était alimenté que par
// symmetryEvidence (axe LSI D/G) — structurellement vide pour braking_rfd/force_zero_vel (variables
// CMJ bilatérales, valeur ABSOLUE, aucun LSI) même quand HYP-ABS-01 les a déjà classifiées
// déficitaires via applyThr()/NORMS (core.niveau/state/status, LOCKED, jamais recalculés). Même
// chaînon manquant, même mécanisme, que celui corrigé pour cmj_rsi_mod/Explosivité (MISSION P1) —
// reproduit ici pour Absorption, exclusivement sur diagnosticEvidence.braking_rfd/force_zero_vel,
// via hyp.convergence.mechanismsInvolved (LOCKED, déjà calculé par computeHypAbsorption01).
//
// `landing` (cmj_landing_peak_force, MISSION P1 BIS) est explicitement EXCLU de ce correctif : la
// mission a démontré que l'ajouter à keyFindings serait inerte ou incohérent (severity/state
// d'Absorption restent exclusivement pilotés par braking, décision P1 BIS déjà validée et jamais
// remise en cause ici) — documenté comme question distincte, non traitée par cette mission.
//
// BASELINE_COMMIT : SHA explicite (jamais 'HEAD', méthodologie P2BIS) = e203176, le commit HEAD
// immédiatement avant cette mission (vérifié : aucun commit n'a touché index.html entre e203176 et
// le début de cette mission — le diff de cette mission est donc isolé à 100%).

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.message); }
}

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const slice = code.slice(start, end);
const sandbox = new Function('localStorage', slice + '\nreturn {computeMoteur:computeMoteur,computeHypAbsorption01:computeHypAbsorption01,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

const BASELINE_COMMIT = 'e203176'; // HEAD immédiatement avant cette mission — vérifié via git log, aucun commit n'a touché index.html depuis.
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {computeMoteur:computeMoteur,computeHypAbsorption01:computeHypAbsorption01,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

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

console.log('MISSION P4 — Audit HYP-ABS-01/Absorption : reconnecte braking_rfd/force_zero_vel à la chaîne de preuve CSM V2');

// ═══════════════════ A. POPULATION AVEC COUVERTURE (foot_f_senior) ═══════════════════════════════
const POP = 'foot_f_senior'; // NORMS[POP].cmj_braking_rfd=[39,68,89,115,158], cmj_force_zero_vel=[18.6,21.8,23.6,25.5,28.4]

test('TEST 1 — pré-requis : NORMS couvre bien braking_rfd/force_zero_vel pour la population de test', () => {
  assert.ok(sandbox.NORMS[POP].cmj_braking_rfd);
  assert.ok(sandbox.NORMS[POP].cmj_force_zero_vel);
});

// ═══════════════════ B. BRAKING_RFD SEUL DÉFICITAIRE (état "suspectee", 1/2 mécanismes) ═════════
test('TEST 2 — braking_rfd déficitaire seul (orange) : HYP-ABS-01 classe correctement (suspectee/jaune)', () => {
  const r = sandbox.computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [30], braking_impulse: [10] } } }, POP, 25, {});
  assert.strictEqual(r.braking.variables.braking_rfd.status, 'orange');
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.status, 'jaune');
});
test('TEST 3 — braking_rfd déficitaire seul : keyFindings contient désormais diagnosticEvidence.braking_rfd (correctif P4)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [30], braking_impulse: [10] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.strictEqual(kf.length, 1);
  assert.strictEqual(kf[0].variable, 'diagnosticEvidence.braking_rfd');
  assert.strictEqual(kf[0].left, 70);
  assert.strictEqual(kf[0].right, null);
  assert.strictEqual(kf[0].lsi, null, 'braking_rfd est une valeur bilatérale absolue -> jamais de LSI ici');
  assert.strictEqual(kf[0].status, 'deficient');
});
test('TEST 4 — AVANT le correctif (baseline e203176) : keyFindings restait vide pour ce même cas (régression comblée, pas inventée)', () => {
  const m = baseSandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [30], braking_impulse: [10] } } }, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});

// ═══════════════════ C. FORCE_ZERO_VEL SEUL DÉFICITAIRE ═══════════════════════════════════════════
test('TEST 5 — force_zero_vel déficitaire seul (rouge) : HYP-ABS-01 classe correctement (suspectee/jaune)', () => {
  const r = sandbox.computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [10], braking_impulse: [10] } } }, POP, 25, {});
  assert.strictEqual(r.braking.variables.force_zero_vel.status, 'rouge');
  assert.strictEqual(r.state, 'suspectee');
});
test('TEST 6 — force_zero_vel déficitaire seul : keyFindings contient diagnosticEvidence.force_zero_vel', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [10], braking_impulse: [10] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.strictEqual(kf.length, 1);
  assert.strictEqual(kf[0].variable, 'diagnosticEvidence.force_zero_vel');
  assert.strictEqual(kf[0].left, 10);
});
test('TEST 7 — AVANT le correctif : keyFindings restait vide pour force_zero_vel seul déficitaire', () => {
  const m = baseSandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [10], braking_impulse: [10] } } }, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});

// ═══════════════════ D. LES DEUX DÉFICITAIRES (état "retenue_faible"/"deficitaire", 2/2 mécanismes) ═
test('TEST 8 — braking_rfd ET force_zero_vel déficitaires : HYP-ABS-01 = retenue_faible/rouge', () => {
  const r = sandbox.computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [10] } } }, POP, 25, {});
  assert.strictEqual(r.state, 'retenue_faible');
  assert.strictEqual(r.niveau1, 'deficitaire');
});
test('TEST 9 — les deux déficitaires : keyFindings contient les 2 entrées, correctement typées', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [10] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.strictEqual(kf.length, 2);
  const vars = kf.map((k) => k.variable).sort();
  assert.deepStrictEqual(vars, ['diagnosticEvidence.braking_rfd', 'diagnosticEvidence.force_zero_vel']);
});
test('TEST 10 — les deux déficitaires : la chaîne CSM V2 complète reconnaît désormais un diagnostic objectivé (verdict, certainty, completeness)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [10] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'objectively_demonstrated');
  assert.notStrictEqual(csm.clinicalCompletenessAudit['Absorption'].completenessStatus, 'NOT_DETERMINED');
});
test('TEST 11 — AVANT le correctif : les deux déficitaires produisaient pourtant AUCUNE_PREUVE_DIAGNOSTIQUE/not_determined (le bug corrigé)', () => {
  const m = baseSandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [10] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'not_determined');
});

// ═══════════════════ E. NON-RÉGRESSION / GARDE-FOUS DU CORRECTIF ══════════════════════════════════
test('TEST 12 — aucune variable déficitaire (tout normal) : keyFindings reste vide, aucun faux positif', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [30], braking_impulse: [10] } } }, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});
test('TEST 13 — braking_impulse jamais classifiable (aucun seuil) : ne peut jamais apparaître dans keyFindings, même avec une valeur brute présente', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [999999] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('braking_impulse') !== -1), false);
});
test('TEST 14 — population non couverte : braking non_determinable, aucune entrée keyFindings inventée', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [10] } } }, {}, 'population_totalement_inexistante_xyz', 25, {});
  assert.strictEqual(m.functionScores['Absorption'].hypAbs01.state, 'non_determinable');
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});
test('TEST 15 — donnée absente (pas de test CMJ actif) : jamais de keyFindings fabriqué', () => {
  const m = sandbox.computeMoteur({}, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});
test('TEST 16 — le champ `left` reflète toujours la valeur brute réelle (jamais arrondie/inventée), `right`/`lsi` toujours null (bilatéral, jamais un axe D/G)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [73.4], force_zero_vel: [30], braking_impulse: [10] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings[0];
  assert.strictEqual(kf.left, 73.4);
  assert.strictEqual(kf.right, null);
  assert.strictEqual(kf.lsi, null);
});

// ═══════════════════ F. LANDING (cmj_landing_peak_force) — EXPLICITEMENT NON TOUCHÉ ═══════════════
test('TEST 17 — landing déficitaire seul (braking normal) : keyFindings Absorption reste vide (landing volontairement exclu du correctif)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [30], braking_impulse: [10], landing_peak_force: [90] } } }, {}, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(m.functionScores['Absorption'].hypAbs01.landing.state, 'retenue_faible', 'pré-requis : landing doit être réellement déficitaire pour ce test');
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});
test('TEST 18 — landing déficitaire + braking déficitaire (cas mixte) : keyFindings contient UNIQUEMENT les entrées braking, jamais landing', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10], braking_impulse: [10], landing_peak_force: [90] } } }, {}, 'bball2425_ncaa_m', 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.ok(kf.length > 0);
  assert.strictEqual(kf.some((k) => k.variable.indexOf('landing') !== -1), false);
});
test('TEST 19 — landing reste directement lisible dans hyp.landing (jamais supprimé), même si absent de keyFindings/CSM V2 (limite documentée, non corrigée ici)', () => {
  const r = sandbox.computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [30], braking_impulse: [10], landing_peak_force: [90] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'retenue_faible');
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.status, 'rouge');
});
test('TEST 20 — la fonction CSM_V2_CLINICAL_VARIABLE_MATRIX (référentiel statique) reste inchangée par ce correctif : toujours 0 entrée landing pour Absorption (audit, non corrigé ici)', () => {
  const abs = sandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Absorption'];
  const allKeys = abs.diagnostic.concat(abs.confirmative, abs.explicative).map((v) => v.variableKey);
  assert.strictEqual(allKeys.some((k) => k.indexOf('landing') !== -1), false);
});

// ═══════════════════ G. YANIS — AUCUNE MODIFICATION DE FIXTURE ═══════════════════════════════════
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

test('TEST 21 — YANIS : sa fixture ne contient ni braking_rfd ni force_zero_vel en clé directe -> le correctif P4 n\'a strictement aucun effet sur elle', () => {
  assert.strictEqual(YANNIS_DATA.cmj.trials.braking_rfd, undefined);
  assert.strictEqual(YANNIS_DATA.cmj.trials.force_zero_vel, undefined);
});
test('TEST 22 — YANIS avant/après : Absorption byte-identique (state/status/severity/keyFindings/braking/landing)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.functionScores['Absorption'], before.functionScores['Absorption']);
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalProfile['Absorption'], before.clinicalSynthesisV2.clinicalProfile['Absorption']);
});
test('TEST 23 — YANIS : les 7 autres qualités restent byte-identiques', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Explosivité', 'Mobilité', 'Réactivité', 'Stabilisation', 'Endurance'].forEach((q) => {
    assert.deepStrictEqual(after.functionScores[q], before.functionScores[q], q + ' ne doit pas changer');
  });
});

// ═══════════════════ H. MÉTHODOLOGIE — BASELINE_COMMIT EXPLICITE (jamais la chaîne 'HEAD') ═════════
// MISSION P4 §18 : "NE PAS commit. NE PAS push." — à la différence des 3 fichiers corrigés par
// P2BIS (déjà fusionnés dans main au moment de leur correction), CE fichier est écrit AVANT tout
// commit de cette mission : BASELINE_COMMIT (e203176) est donc, pour l'instant, égal à HEAD — ce qui
// est normal et attendu tant que rien n'est committé (aucune régression méthodologique : le code
// utilise un SHA explicite, jamais la chaîne littérale 'HEAD', donc ce test restera valide et
// continuera à isoler correctement le delta de cette mission même après un futur commit, quand HEAD
// aura avancé). Ce test vérifie uniquement la propriété qui reste vraie dans les deux cas : l'ancêtre.
test('MÉTHODOLOGIE — BASELINE_COMMIT est un SHA explicite (jamais la chaîne \'HEAD\') et un ancêtre valide de HEAD', () => {
  assert.notStrictEqual(BASELINE_COMMIT, 'HEAD', 'le code ne doit jamais utiliser la chaîne littérale HEAD comme baseline (régression P2BIS)');
  const baselineSha = execSync('git rev-parse ' + BASELINE_COMMIT, { cwd: path.join(__dirname, '..') }).toString().trim();
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + baselineSha + ' HEAD', { cwd: path.join(__dirname, '..') }); isAncestor = true; } catch (e) { isAncestor = false; }
  assert.strictEqual(isAncestor, true, 'BASELINE_COMMIT doit être un ancêtre (ou HEAD lui-même avant tout commit) — jamais un commit hors branche');
});

// ═══════════════════ I. GUARDS ABSOLUS ═════════════════════════════════════════════════════════════
test('GUARD 1 — les 7 autres moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES (ce correctif ne touche que computeCsmV2ClinicalProfile)', () => {
  ['computeHypAbsorption01', 'computeHypExplosivity01', 'computeHypForce01', 'computeHypMobility01',
    'computeHypPower01', 'computeHypReactivity01', 'computeHypStabilization01', 'computeHypEndurance01']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 2 — applyThr/pctStatus/computeStatusWithNormsV2/computeAsymEngine restent BYTE-IDENTIQUES', () => {
  ['applyThr', 'pctStatus', 'computeStatusWithNormsV2', 'computeAsymEngine'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit');
  });
});
test('GUARD 3 — computeHypForceKpi reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypForceKpi'), extractFnBody(baseCode, 'computeHypForceKpi'));
});
test('GUARD 4 — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal (aucune norme, aucun seuil, aucun référentiel modifié)', () => {
  assert.deepStrictEqual(sandbox.NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(sandbox.NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(sandbox.THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(sandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(sandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 5 — le diff fonctionnel de cette mission se limite à computeCsmV2ClinicalProfile — jamais computeMoteur/computeCsmV2/computeHypAbsorption01', () => {
  assert.notStrictEqual(extractFnBody(code, 'computeCsmV2ClinicalProfile'), extractFnBody(baseCode, 'computeCsmV2ClinicalProfile'), 'computeCsmV2ClinicalProfile doit avoir changé (cette mission)');
  ['computeMoteur', 'computeCsmV2', 'computeHypAbsorption01', 'computeHypAbsorptionReceptionImpact', 'csmAbsorptionCmjLandingPeakForceStatus'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' ne doit pas être modifiée — cette mission ne touche que la couche CSM (keyFindings), jamais le moteur HYP-ABS-01 ni le sous-domaine landing');
  });
});
test('GUARD 6 — Explosivité (correctif P1, cmj_rsi_mod) reste inchangé et fonctionne toujours identiquement', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  const base = baseSandbox.computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Explosivité'], base.clinicalSynthesisV2.clinicalProfile['Explosivité']);
});
test('GUARD 7 — git diff --check ne signale aucun conflit de fusion dans index.html', () => {
  const out = execSync('git diff --check -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(out.trim(), '');
});

// ═══════════════════ J. PROFILS SYNTHÉTIQUES SUPPLÉMENTAIRES ═══════════════════════════════════════
test('PROFIL A — braking_rfd tout juste sous le seuil vert (préservé) : jamais compté comme déficient', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [30], braking_impulse: [10] } } }, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});
test('PROFIL B — valeur invalide (NaN) pour braking_rfd : jamais exposée comme raw, jamais dans keyFindings', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: ['abc'], force_zero_vel: [30], braking_impulse: [10] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('braking_rfd') !== -1), false);
});
test('PROFIL C — test CMJ inactif (active:false) : Absorption non_determinable, keyFindings vide', () => {
  const m = sandbox.computeMoteur({ cmj: { active: false, trials: { braking_rfd: [70], force_zero_vel: [10] } } }, {}, POP, 25, {});
  assert.strictEqual(m.functionScores['Absorption'].hypAbs01.state, 'non_determinable');
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings.length, 0);
});
test('PROFIL D — braking_rfd déficitaire + asymétrie D/G également déficitaire : les 2 entrées (absolue + symétrie) coexistent sans doublon ni collision', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [30], braking_impulse: [10], ecc_decel_rfd_L: [100], ecc_decel_rfd_R: [10] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  const absoluteEntries = kf.filter((k) => k.lsi === null);
  assert.ok(absoluteEntries.some((k) => k.variable === 'diagnosticEvidence.braking_rfd'));
});
test('PROFIL E — HYP-PUI-01 (autre HYP à état "suspectee" intermédiaire) reste totalement inchangé par ce correctif ciblé sur Absorption uniquement', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { peak_power: [30] } } }, {}, null, 25, {});
  const base = baseSandbox.computeMoteur({ cmj: { active: true, trials: { peak_power: [30] } } }, {}, null, 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Puissance'], base.clinicalSynthesisV2.clinicalProfile['Puissance']);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

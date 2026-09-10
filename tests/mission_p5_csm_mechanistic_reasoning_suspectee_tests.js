// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION P5 — AUDIT TRANSVERSAL CSM V2 : computeCsmV2MechanisticReasoning, traitement de 'suspectee'
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DÉCISION B : le gate littéral `state==='deficitaire'` était trop strict, mais un niveau
// intermédiaire EXISTAIT DÉJÀ dans le modèle (jamais inventé) : csmV2ExplanatoryFactorsForQuality
// distingue déjà 'direct' (1 preuve propre) de 'convergent' (≥2), et
// computeCsmV2ClinicalCertaintyForQuality distingue déjà 'objectively_supported' de
// 'objectively_demonstrated' — chemin DÉJÀ emprunté aujourd'hui par les qualités à mécanisme UNIQUE
// (Explosivité/cmj_rsi_mod, Mobilité/wblt_distance, ADR-005) dont l'état passe directement à
// 'deficitaire'. 'suspectee' (6/8 qualités à mécanismes multiples : Force, Puissance, Absorption,
// Réactivité, Stabilisation, Endurance) porte la même information (1 mécanisme diagnostique
// réellement déficitaire, via une norme réelle) mais en était exclu sans justification démontrée.
//
// 3 gates corrigés (widening minimal, jamais une nouvelle règle) :
//   1. computeCsmV2MechanisticReasoning : r.explanatoryFactors / r.missingEvidence
//   2. computeCsmV2CausalReasoning : var deficient
//   3. computeCsmV2ClinicalCertaintyForQuality : gate d'entrée qr.state
//
// IMPORTANT (constat de l'audit) : ce correctif seul ne rend PAS visible le diagnostic pour toutes
// les qualités, car keyFindings (computeCsmV2ClinicalProfile) reste alimenté UNIQUEMENT par
// symmetryEvidence (LSI D/G) pour 7 des 8 qualités — Absorption est la SEULE à bénéficier déjà d'une
// réinjection de preuve absolue (braking_rfd/force_zero_vel, MISSION P4). Pour Réactivité/
// Stabilisation/Force/Endurance, `state==='suspectee'` est désormais correctement éligible au
// raisonnement, mais reste sans keyFindings tant qu'un correctif P4-like dédié n'est pas appliqué à
// CHAQUE qualité (hors périmètre de P5, cf. rapport final). Ce fichier teste et documente précisément
// cette distinction — jamais un correctif supplémentaire non autorisé.
//
// BASELINE_COMMIT : SHA explicite (jamais 'HEAD') = ad14ffb, le commit P4 validé et fusionné dans
// main (vérifié : `git show ad14ffb:index.html` prédate strictement les 3 correctifs P5 ci-dessus).

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

const BASELINE_COMMIT = 'ad14ffb'; // commit P4 validé et fusionné dans main — vérifié via git log.
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

console.log("MISSION P5 — Audit transversal CSM V2 : traitement de l'état 'suspectee' dans computeCsmV2MechanisticReasoning");

const POP = 'foot_f_senior'; // NORMS[POP].cmj_braking_rfd=[39,68,89,115,158], cmj_force_zero_vel=[18.6,21.8,23.6,25.5,28.4]

// ═══════════════════ A. PROFIL A — AUCUNE DONNÉE DIAGNOSTIQUE ═══════════════════════════════════
test('PROFIL A — aucune donnée : Absorption = non_determinable, keyFindings vide, certainty not_determined', () => {
  const m = sandbox.computeMoteur({}, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'non_determinable');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'NON_DETERMINABLE_SANS_DONNEE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'not_determined');
});

// ═══════════════════ B. PROFIL B — 1 MÉCANISME DÉFICITAIRE (AUTRE INDISPONIBLE) ═════════════════
test('PROFIL B — braking_rfd déficitaire, force_zero_vel indisponible (aucune trial) : state=suspectee', () => {
  const r = sandbox.computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [70] } } }, POP, 25, {});
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.braking.variables.force_zero_vel.status, null);
});
test('PROFIL B — CSM : verdict désormais DIAGNOSTIC_OBJECTIVE, certainty objectively_supported (jamais demonstrated/explained)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'suspectee');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.length, 1);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'objectively_supported');
  assert.notStrictEqual(csm.clinicalCertainty['Absorption'], 'objectively_demonstrated');
  assert.notStrictEqual(csm.clinicalCertainty['Absorption'], 'explained');
});
test('PROFIL B — AVANT le correctif P5 (baseline ad14ffb) : le même cas produisait AUCUNE_PREUVE_DIAGNOSTIQUE/not_determined (le gate corrigé)', () => {
  const m = baseSandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'not_determined');
});

// ═══════════════════ C. PROFIL C — 1 DÉFICITAIRE + 1 NON CLASSIFIABLE ═══════════════════════════
test('PROFIL C — braking_rfd déficitaire, braking_impulse présent mais jamais classifiable : même résultat que PROFIL B (impulse ignoré)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], braking_impulse: [999] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'suspectee');
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'objectively_supported');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.some((k) => k.variable.indexOf('braking_impulse') !== -1), false);
});

// ═══════════════════ D. PROFIL D — 2 MÉCANISMES DÉFICITAIRES (COMPORTEMENT P4 CONSERVÉ) ═════════
test('PROFIL D — braking_rfd ET force_zero_vel déficitaires : state=deficitaire, verdict DIAGNOSTIC_OBJECTIVE, certainty objectively_demonstrated (inchangé depuis P4)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'deficitaire');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.length, 2);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'objectively_demonstrated');
});
test('PROFIL D — comportement strictement identique avant/après P5 (2 mécanismes déjà validé par P4, non affecté par ce correctif)', () => {
  const before = baseSandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10] } } }, {}, POP, 25, {});
  const after = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10] } } }, {}, POP, 25, {});
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalProfile['Absorption'], before.clinicalSynthesisV2.clinicalProfile['Absorption']);
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalEvidenceHierarchy['Absorption'], before.clinicalSynthesisV2.clinicalEvidenceHierarchy['Absorption']);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalCertainty['Absorption'], before.clinicalSynthesisV2.clinicalCertainty['Absorption']);
});

// ═══════════════════ E. PROFIL E — 2 MÉCANISMES PRÉSERVÉS ═══════════════════════════════════════
test('PROFIL E — braking_rfd ET force_zero_vel préservés : QUALITE_PRESERVEE, jamais affecté par le correctif', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [160], force_zero_vel: [30] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].severity, 'preserved');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'QUALITE_PRESERVEE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'preserved');
});

// ═══════════════════ F. PROFIL F — 1 DÉFICITAIRE + 1 PRÉSERVÉ ═══════════════════════════════════
test('PROFIL F — braking_rfd déficitaire + force_zero_vel préservé : state=suspectee (identique à PROFIL B), verdict désormais objectif', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [30] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'suspectee');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.length, 1);
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings[0].variable, 'diagnosticEvidence.braking_rfd');
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Absorption'], 'objectively_supported');
});

// ═══════════════════ G. PROFIL G — DONNÉE NON CLASSIFIABLE (POPULATION NON COUVERTE) ════════════
test('PROFIL G — braking_rfd présent mais population non couverte : jamais une preuve de préservation, reste non_determinable', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [10] } } }, {}, 'population_totalement_inexistante_xyz', 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'non_determinable');
  assert.strictEqual(csm.clinicalProfile['Absorption'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Absorption'].verdict, 'NON_DETERMINABLE_SANS_DONNEE');
  assert.notStrictEqual(csm.clinicalCertainty['Absorption'], 'preserved');
});

// ═══════════════════ H. PROFIL H — DONNÉE ABSENTE ═══════════════════════════════════════════════
test('PROFIL H — cmj inactif : jamais une preuve de préservation', () => {
  const m = sandbox.computeMoteur({ cmj: { active: false, trials: { braking_rfd: [70], force_zero_vel: [10] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Absorption'].state, 'non_determinable');
  assert.notStrictEqual(csm.clinicalCertainty['Absorption'], 'preserved');
});

// ═══════════════════ I. CONFLIT (VALEUR NON FINIE / INVALIDE) ═══════════════════════════════════
test('CONFLIT — braking_rfd valeur non-finie (NaN) : jamais exposée dans keyFindings (garde P4 conservée), jamais promue par erreur', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: ['abc'], force_zero_vel: [30] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Absorption'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('braking_rfd') !== -1), false);
});
test('VALEUR MANQUANTE — force_zero_vel = tableau vide : traité comme indisponible, jamais préservé ni déficitaire', () => {
  const r = sandbox.computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [70], force_zero_vel: [] } } }, POP, 25, {});
  assert.strictEqual(r.braking.variables.force_zero_vel.status, null);
  assert.strictEqual(r.state, 'suspectee');
});

// ═══════════════════ J. AUTRES QUALITÉS — TRANSVERSALITÉ DU GATE ════════════════════════════════
test('RÉACTIVITÉ — dj_rsi seul déficitaire (sldj absent) : state=suspectee désormais correctement éligible au raisonnement (directEvidence non vide au niveau causal)', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Réactivité'].state, 'suspectee');
});
test('RÉACTIVITÉ — limite documentée (hors périmètre P5) : keyFindings reste vide pour dj_rsi (pas de correctif P4-like pour cette qualité) -> verdict reste AUCUNE_PREUVE_DIAGNOSTIQUE malgré le gate corrigé, car aucune preuve n\'atteint keyFindings', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Réactivité'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.strictEqual(csm.clinicalCertainty['Réactivité'], 'not_determined');
});
test('RÉACTIVITÉ — comportement identique avant/après P5 (gate corrigé mais sans effet observable, confirmé)', () => {
  const before = baseSandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const after = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalEvidenceHierarchy['Réactivité'], before.clinicalSynthesisV2.clinicalEvidenceHierarchy['Réactivité']);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalCertainty['Réactivité'], before.clinicalSynthesisV2.clinicalCertainty['Réactivité']);
});
test('STABILISATION — landing_uni_tts déficitaire D seul (G absent, aucun LSI) : state=suspectee, même limite documentée (keyFindings vide, hors périmètre P5)', () => {
  const m = sandbox.computeMoteur({ landing_uni: { active: true, D: { trials: { tts: [2.5] } } } }, {}, null, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Stabilisation'].state, 'suspectee');
  assert.strictEqual(csm.clinicalProfile['Stabilisation'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Stabilisation'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
});
test('STABILISATION — landing_uni_tts asymétrique D/G réellement déficitaire (LSI) : keyFindings DÉJÀ alimenté nativement (symmetryEvidence, pas besoin de correctif P4-like) -> verdict/certainty déjà corrects, MAIS state global promu à deficitaire (pas suspectee) par la règle de sévérité existante, non liée à P5', () => {
  const m = sandbox.computeMoteur({ landing_uni: { active: true, D: { trials: { tts: [2.5] } }, G: { trials: { tts: [0.5] } } } }, {}, null, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Stabilisation'].state, 'deficitaire', 'une asymétrie LSI réelle déclenche evidencedDeficient -> deficitaire, indépendamment de P5');
  assert.ok(csm.clinicalProfile['Stabilisation'].keyFindings.length > 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Stabilisation'].verdict, 'DIAGNOSTIC_OBJECTIVE');
});
test('PUISSANCE — AND strict CLI040 (P2, STOP validé) reste totalement inchangé : cmj_peak_power seul classifiable-déficitaire, slcmj indisponible -> non_determinable (jamais suspectee), le gate P5 ne s\'applique jamais ici', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { peak_power: [20] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Puissance'].state, 'non_determinable');
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Puissance'].verdict, 'NON_DETERMINABLE_SANS_DONNEE');
  const before = baseSandbox.computeMoteur({ cmj: { active: true, trials: { peak_power: [20] } } }, {}, POP, 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Puissance'], before.clinicalSynthesisV2.clinicalProfile['Puissance']);
});
test('EXPLOSIVITÉ — mécanisme UNIQUE (cmj_rsi_mod), jamais d\'état suspectee (ADR/contrat HYP-EXP-01) : comportement identique avant/après P5', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  const before = baseSandbox.computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Explosivité'], before.clinicalSynthesisV2.clinicalProfile['Explosivité']);
  assert.strictEqual(m.clinicalSynthesisV2.clinicalCertainty['Explosivité'], 'objectively_supported', 'mécanisme unique déficitaire = certainty déjà objectively_supported, AVANT et APRÈS P5, jamais impacté');
});
test('MOBILITÉ — mécanisme UNIQUE (wblt_distance, ADR-005, jamais suspectee) : comportement identique avant/après P5', () => {
  const m = sandbox.computeMoteur({ wblt: { active: true, D: { trials: { distance: [4] } }, G: { trials: { distance: [4] } } } }, {}, null, 25, {});
  const before = baseSandbox.computeMoteur({ wblt: { active: true, D: { trials: { distance: [4] } }, G: { trials: { distance: [4] } } } }, {}, null, 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Mobilité'], before.clinicalSynthesisV2.clinicalProfile['Mobilité']);
});

// ═══════════════════ K. YANIS — AUCUNE MODIFICATION DE FIXTURE ═══════════════════════════════════
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

test('YANIS — avant/après : functionScores strictement identiques (8 qualités)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.functionScores, before.functionScores);
});
test('YANIS — avant/après : clinicalProfile (8 qualités) strictement identique', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalProfile, before.clinicalSynthesisV2.clinicalProfile);
});
test('YANIS — avant/après : clinicalEvidenceHierarchy et clinicalCertainty strictement identiques (8 qualités)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalEvidenceHierarchy, before.clinicalSynthesisV2.clinicalEvidenceHierarchy);
  assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalCertainty, before.clinicalSynthesisV2.clinicalCertainty);
});
test('YANIS — aucune de ses 8 qualités n\'atteint un état suspectee avec une preuve nouvellement visible (confirmation directe de la non-régression)', () => {
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Explosivité', 'Mobilité', 'Réactivité', 'Absorption', 'Stabilisation', 'Endurance'].forEach((q) => {
    const p = after.clinicalSynthesisV2.clinicalProfile[q];
    if (p.state === 'suspectee') assert.strictEqual(p.keyFindings.length, 0, q + ' : si suspectee, keyFindings doit rester vide pour Yanis (aucune donnée braking_rfd/force_zero_vel dans sa fixture)');
  });
});

// ═══════════════════ L. CAS SYNTHÉTIQUES EXTRÊMES ═══════════════════════════════════════════════
test('EXTRÊME — braking_rfd exactement à la borne vert/jaune : jamais compté comme déficient (borne stricte respectée)', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [115], force_zero_vel: [30] } } }, {}, POP, 25, {});
  assert.notStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'].state, 'suspectee');
});
test('EXTRÊME — valeur négative aberrante pour braking_rfd : traitée comme une valeur réelle par applyThr (comportement HYP LOCKED, non modifié par P5), jamais un crash', () => {
  assert.doesNotThrow(() => {
    sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [-999], force_zero_vel: [30] } } }, {}, POP, 25, {});
  });
});
test('EXTRÊME — 2 patients synthétiques consécutifs (pureté) : computeMoteur produit un résultat strictement identique pour les mêmes entrées', () => {
  const a = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70] } } }, {}, POP, 25, {});
  const b = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70] } } }, {}, POP, 25, {});
  assert.deepStrictEqual(a.clinicalSynthesisV2.clinicalProfile['Absorption'], b.clinicalSynthesisV2.clinicalProfile['Absorption']);
});

// ═══════════════════ M. MÉTHODOLOGIE — BASELINE_COMMIT EXPLICITE ═══════════════════════════════
test('MÉTHODOLOGIE — BASELINE_COMMIT est un SHA explicite (jamais la chaîne \'HEAD\') et un ancêtre valide de HEAD', () => {
  assert.notStrictEqual(BASELINE_COMMIT, 'HEAD');
  const baselineSha = execSync('git rev-parse ' + BASELINE_COMMIT, { cwd: path.join(__dirname, '..') }).toString().trim();
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + baselineSha + ' HEAD', { cwd: path.join(__dirname, '..') }); isAncestor = true; } catch (e) { isAncestor = false; }
  assert.strictEqual(isAncestor, true);
});

// ═══════════════════ N. GUARDS ABSOLUS ═══════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES (ce correctif ne touche que la couche CSM générique)', () => {
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
test('GUARD 4 — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal', () => {
  assert.deepStrictEqual(sandbox.NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(sandbox.NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(sandbox.THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(sandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(sandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 5 — computeCsmV2ClinicalProfile (correctif P4) reste BYTE-IDENTIQUE : P5 ne touche jamais keyFindings lui-même, seulement son exploitation en aval', () => {
  assert.strictEqual(extractFnBody(code, 'computeCsmV2ClinicalProfile'), extractFnBody(baseCode, 'computeCsmV2ClinicalProfile'), 'computeCsmV2ClinicalProfile ne doit pas être modifiée par P5');
});
test('GUARD 6 — le diff fonctionnel de cette mission se limite à computeCsmV2MechanisticReasoning, computeCsmV2CausalReasoning et computeCsmV2ClinicalCertaintyForQuality — jamais computeMoteur/computeCsmV2/computeHypAbsorption01/csmV2ExplanatoryFactorsForQuality/csmV2EvidenceHierarchyForQuality', () => {
  ['computeCsmV2MechanisticReasoning', 'computeCsmV2CausalReasoning', 'computeCsmV2ClinicalCertaintyForQuality'].forEach((fn) => {
    assert.notStrictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' doit avoir changé (cette mission)');
  });
  ['computeMoteur', 'computeCsmV2', 'computeHypAbsorption01', 'csmV2ExplanatoryFactorsForQuality', 'csmV2EvidenceHierarchyForQuality', 'csmV2ClinicalExplanationForQuality', 'csmV2QualitySeverity'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' ne doit pas être modifiée — cette mission élargit exclusivement 3 gates d\'entrée, jamais la logique de classification direct/convergent ni la sévérité HYP');
  });
});
test('GUARD 7 — git diff --check ne signale aucun conflit de fusion dans index.html', () => {
  const out = execSync('git diff --check -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(out.trim(), '');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

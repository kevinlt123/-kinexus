// MISSION — CSM V2 : PRINCIPE DU MINIMUM DIAGNOSTIQUE SUFFISANT.
//
// "Une variable diagnostique pertinente, valide, disponible et classifiable suffit à diagnostiquer
// une qualité. Les variables supplémentaires servent à confirmer, expliquer, contextualiser ou
// rechercher des dissociations — elles ne sont jamais obligatoires pour établir le diagnostic."
//
// Implémentation : nouvelle couche additive PURE dans la couche CSM V2 (jamais dans un moteur HYP
// LOCKED, jamais dans CSM_V2_CLINICAL_VARIABLE_MATRIX) :
//   - csmV2QualityHasSufficientDiagnosticEvidence(quality, functionScores) : lit
//     functionScores[quality].diagnosticEvidence (l'objet DÉJÀ produit par le moteur HYP
//     correspondant, avec les VRAIES données du patient), identifie les feuilles via
//     csmV2VariableMatrixLeafKeys (Mission AB, LOCKED, réutilisée telle quelle), et considère une
//     feuille "éligible" si son .status est une classification réelle (ni null, ni 'indisponible' —
//     les 2 seuls placeholders "aucune donnée" déjà utilisés par les moteurs LOCKED eux-mêmes).
//     sufficientDiagnosticEvidence = eligibleCount >= 1 (jamais >= 2, jamais un décompte du
//     catalogue total).
//   - computeCsmV2QualityDiagnosticSufficiency(functionScores) : applique la fonction ci-dessus aux
//     8 qualités, exposé comme nouveau champ ADDITIF `qualityDiagnosticSufficiency` sur l'objet
//     retourné par computeCsmV2() — aucun champ existant modifié.
//
// Aucun moteur HYP-XX-01 n'est modifié. CSM_V2_CLINICAL_VARIABLE_MATRIX n'est pas modifiée (elle
// reste la référence STATIQUE, testData={}, indépendante du patient). Les 8 sévérités Yannis restent
// inchangées (changement purement additif : un nouveau champ, aucun champ existant recalculé).
//
// Exécution : node tests/mission_csm_v2_minimum_diagnostic_sufficiency_tests.js
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

console.log('MISSION — CSM V2 : principe du minimum diagnostique suffisant');
const BASELINE_COMMIT = 'cb619a8'; // dernier commit avant cette mission

// ═══════════════════ TEST 1 — 1 diagnostic classifiable → diagnostiquée ═════════════════════════
test('TEST 1 — Mobilité (1 seule variable diagnostique au catalogue) avec donnée réelle classifiable → diagnostiquée', () => {
  const hyp = computeHypMobility01({ wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } } }, null, 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Mobilité', { Mobilité: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.strictEqual(r.eligibleCount, 1);
});

// ═══════════════════ TEST 2 — 0 diagnostic classifiable → NOT_DETERMINED ═══════════════════════
test('TEST 2 — Explosivité sans aucune donnée → 0 diagnostic classifiable → non diagnostiquée', () => {
  const hyp = computeHypExplosivity01({}, null, null, null);
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Explosivité', { Explosivité: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, false);
  assert.strictEqual(r.eligibleCount, 0);
});

// ═══════════════════ TEST 3 — 1 diagnostic + plusieurs explanatory → diagnostiquée via le diagnostic seul
test('TEST 3 — Absorption avec force_zero_vel seul classifiable (braking_rfd/braking_impulse absents) + plusieurs explanatory (ecc_mean_power, depth...) présents → diagnostiquée UNIQUEMENT grâce à force_zero_vel', () => {
  const testData = { cmj: { active: true, trials: { force_zero_vel: [27], ecc_mean_power: [6.2], depth: [-30], braking_duration: [250] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  assert.ok(Object.keys(hyp.explanatory.capaciteExcentrique || {}).length > 0 || Object.keys(hyp.explanatory.strategie || {}).length > 0, 'préconditions : explanatory doit être peuplé');
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.strictEqual(r.eligibleCount, 1);
  assert.strictEqual(r.primaryDiagnosticVariable, 'force_zero_vel');
});

// ═══════════════════ TEST 4 — plusieurs diagnostics concordants → diagnostiquée + convergence ══
test('TEST 4 — Absorption avec braking_rfd ET force_zero_vel tous deux déficients (concordants) → diagnostiquée, 2 preuves éligibles, convergence HYP inchangée (niveau1=deficitaire, logique LOCKED)', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [10], force_zero_vel: [10] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.strictEqual(r.eligibleCount, 2);
  assert.strictEqual(hyp.niveau1, 'deficitaire'); // convergence LOCKED inchangée : 2/2 déficients
});

// ═══════════════════ TEST 5 — diagnostics discordants → diagnostiquée + conflit (logique existante)
test('TEST 5 — Absorption avec braking_rfd déficient et force_zero_vel normal (discordants) → diagnostiquée (2 preuves éligibles), niveau1=a_surveiller (logique de convergence LOCKED, jamais modifiée)', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [10], force_zero_vel: [27] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.strictEqual(r.eligibleCount, 2);
  assert.strictEqual(hyp.niveau1, 'a_surveiller');
});

// ═══════════════════ TEST 6 — uniquement confirmative/explanatory → NOT_DETERMINED ══════════════
test('TEST 6 — Force avec uniquement des variables confirmative/explanatory disponibles (aucun diagnostic) → non diagnostiquée', () => {
  // sl_iso_push (confirmative uniquement dans HYP-FOR-01) sans imtp/slimtp/iso_belt_squat/sl_iso_push
  // en DIRECT -- on simule un moteur dont diagnosticEvidence est vide mais confirmativeEvidence peuplé.
  const fakeHyp = { diagnosticEvidence: {}, confirmativeEvidence: { imtp_nkg: { raw: 30, status: 'vert' } } };
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Force', { Force: fakeHyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, false);
  assert.strictEqual(r.diagnosticVariableCount, 0);
});

// ═══════════════════ TEST 7 — Absorption avec braking_rfd classifiable → diagnostiquée ═════════
test('TEST 7 — Absorption avec braking_rfd SEUL classifiable → diagnostiquée', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [10] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.deepStrictEqual(r.eligibleDiagnosticEvidence.map((e) => e.variableKey), ['braking_rfd']);
});

// ═══════════════════ TEST 8 — Absorption avec force_zero_vel classifiable → diagnostiquée ══════
test('TEST 8 — Absorption avec force_zero_vel SEUL classifiable → diagnostiquée', () => {
  const testData = { cmj: { active: true, trials: { force_zero_vel: [27] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.deepStrictEqual(r.eligibleDiagnosticEvidence.map((e) => e.variableKey), ['force_zero_vel']);
});

// ═══════════════════ TEST 9 — uniquement braking_impulse (non classifiable) → NOT_DETERMINED ═══
test('TEST 9 — Absorption avec UNIQUEMENT braking_impulse (aucune référence, ni NORMS ni THRESHOLDS) → non diagnostiquée', () => {
  const testData = { cmj: { active: true, trials: { braking_impulse: [1.1] } } };
  const hyp = computeHypAbsorption01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, false);
  assert.strictEqual(r.eligibleCount, 0);
  assert.strictEqual(r.diagnosticVariableCount, 3); // le catalogue reste 3, seule l'éligibilité est 0
});

// ═══════════════════ TEST 10 — Explosivité conc_impulse_100 sans référence → NOT_DETERMINED ════
test('TEST 10 — Explosivité avec conc_impulse_100 fourni mais SANS référence (aucun seuil/norme) → non diagnostiquée', () => {
  const testData = { cmj: { active: true, trials: { conc_impulse_100: [1.2] } } };
  const hyp = computeHypExplosivity01(testData, 'foot_f_senior', 25, {});
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Explosivité', { Explosivité: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, false);
  assert.strictEqual(r.eligibleCount, 0);
});

// ═══════════════════ TEST 11 — simulation d'une future variable Explosivité classifiable ═══════
test('TEST 11 — simulation d\'UNE future variable diagnostique Explosivité correctement classifiable (ex. RFD-100ms hypothétique, seuil validé) → Explosivité diagnostiquée avec CETTE SEULE variable (fonction générique, jamais spécifique à une clé)', () => {
  // Simule un moteur HYP-EXP-01 hypothétique dont une NOUVELLE variable a été validée (seuil/norme
  // réel) -- jamais implémenté dans le vrai HYP-EXP-01 (LOCKED, intouché), uniquement pour prouver
  // que csmV2QualityHasSufficientDiagnosticEvidence ne code en dur AUCUNE clé.
  const fakeHyp = { diagnosticEvidence: { conc_rfd_100_hypothetical: { raw: 1500, status: 'jaune' }, conc_impulse_100: { raw: 1.2, status: 'indisponible' } } };
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Explosivité', { Explosivité: fakeHyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, true);
  assert.strictEqual(r.eligibleCount, 1);
  assert.strictEqual(r.primaryDiagnosticVariable, 'conc_rfd_100_hypothetical');
});

// ═══════════════════ TEST 12 — NORMS sans population compatible → ne compte pas ═════════════════
test('TEST 12 — braking_rfd avec une donnée réelle mais AUCUNE population sélectionnée (pop=null) → applyThr() retombe sur THRESHOLDS (absent pour ce kpi) → non éligible, jamais compté comme preuve disponible', () => {
  const testData = { cmj: { active: true, trials: { braking_rfd: [10] } } };
  const hyp = computeHypAbsorption01(testData, null, null, {}); // pop=null explicite
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, false);
  assert.strictEqual(r.eligibleCount, 0);
  assert.strictEqual(applyThr('cmj_braking_rfd', 10, null, 25), null); // vérification directe, indépendante
});

// ═══════════════════ TEST 13 — variable explanatory classifiable ne rend jamais diagnostiquée ══
test('TEST 13 — une variable EXPLANATORY classifiable (ex. absorptionReactive.dj_rsi, exploitable via THRESHOLDS.dj_rsi) ne rend JAMAIS la qualité diagnostiquée si aucun diagnostic n\'est éligible (rôle jamais confondu)', () => {
  const testData = { cmj: { active: true, trials: { braking_impulse: [1.1] } }, dj: { active: true, trials: { rsi: [1.2] } } };
  const hyp = computeHypAbsorption01(testData, null, null, {});
  // Préconditions : l'explanatory dj_rsi est bien classifiable (THRESHOLDS.dj_rsi existe), preuve
  // qu'une info riche est disponible ailleurs -- sans jamais faire diagnostiquer la qualité.
  assert.ok(hyp.explanatory.absorptionReactive && hyp.explanatory.absorptionReactive.dj_rsi, 'préconditions : dj_rsi doit être présent en explanatory');
  const r = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hyp });
  assert.strictEqual(r.sufficientDiagnosticEvidence, false, 'une variable explanatory classifiable ne doit jamais suffire au diagnostic');
});

// ═══════════════════ TEST 14 — régression Yannis : 8 sévérités inchangées ═══════════════════════
test('TEST 14 — régression Yannis : les 8 sévérités cliniques restent strictement identiques (changement purement additif, aucun champ existant recalculé)', () => {
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
  const out = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const yc = out.clinicalSynthesisV2;
  const EXPECTED_SEVERITY = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(EXPECTED_SEVERITY).forEach((q) => assert.strictEqual(yc.clinicalProfile[q].severity, EXPECTED_SEVERITY[q], q));
  // Le nouveau champ additif est bien présent et cohérent (mais ne modifie rien d'existant).
  assert.ok(yc.qualityDiagnosticSufficiency, 'le nouveau champ additif qualityDiagnosticSufficiency doit être exposé');
  HYP_CSM_QUALITIES.forEach((q) => assert.ok(Object.prototype.hasOwnProperty.call(yc.qualityDiagnosticSufficiency, q)));
});

// ═══════════════════ Garde-fous supplémentaires (§14 mission) ═══════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence (aucune ligne touchée)', () => {
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
test('GUARD 2 — CSM_V2_CLINICAL_VARIABLE_MATRIX reste à 150 variables, aucun champ recalculé (référence STATIQUE, jamais touchée par cette mission)', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
});
test('GUARD 3 — aucun nouveau seuil/norme : THRESHOLDS (24), NORMS (64 populations), NORMS_V2 (7 clés) inchangés', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
});
test('GUARD 4 — aucune nouvelle clé Kinexus/mapping ForceDecks : TESTS.cmj.kpis reste à 65 clés', () => {
  assert.strictEqual(TBK.cmj.kpis.length, 65);
});
test('GUARD 5 — le commit de CETTE mission (ac6e432) était purement additif dans index.html — fait historique immuable, vérifié sur ce commit précis (une mission ULTÉRIEURE distincte et explicitement validée, correction du bug pipeline CMJ Yanis, a depuis légitimement modifié 2 lignes existantes — attendu, hors périmètre de cette garde)', () => {
  const diffStat = execSync('git diff --stat ac6e432~1 ac6e432 -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.ok(diffStat.trim().length > 0, 'le commit ac6e432 devait modifier index.html');
  const diffNumstat = execSync('git diff --numstat ac6e432~1 ac6e432 -- index.html', { cwd: path.join(__dirname, '..') }).toString().trim();
  const parts = diffNumstat.split(/\s+/);
  const deletions = parseInt(parts[1], 10);
  assert.strictEqual(deletions, 0, 'le commit ac6e432 aurait dû ne supprimer/modifier aucune ligne existante : ' + diffNumstat);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

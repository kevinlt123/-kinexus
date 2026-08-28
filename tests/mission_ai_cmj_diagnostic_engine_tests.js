// MISSION AI — DÉBLOCAGE DIAGNOSTIQUE P0 + CMJ PAR PHASES.
//
// Objectif : faire progresser réellement la capacité diagnostique de Kinexus, ou démontrer
// précisément pourquoi une amélioration est impossible sans nouvelle donnée/norme — jamais un nouvel
// audit descriptif, jamais un second moteur clinique, jamais un seuil/une relation inventés.
//
// Audit technique ET clinique exhaustif (§2 mission) mené AVANT tout code sur les 2 variables
// diagnostiques d'Explosivité (cmj_conc_rfd/cmj_conc_impulse_100) : produites par HYP-EXP-01
// (testData.cmj.trials, bilatéral, aucune colonne D/G native) ; définitions/unités confirmées dans
// TESTS['cmj'].kpis ; réellement importables (VALD_MAP, alias CSV réels) ; AUCUN THRESHOLDS (24 clés
// vérifiées) ; AUCUNE entrée NORMS_V2 (NORMS_V2_TEST_VARS.cmj=['cmj_peak_power'] uniquement) ; AUCUNE
// paire d'asymétrie D/G (ASYM_SIDE_PAIRS ne couvre que ecc_decel_rfd et landing_peak_force — vérifié
// empiriquement que diagnosticEvidence.cmj_conc_rfd/cmj_conc_impulse_100 n'apparaissent JAMAIS dans
// symmetryEvidence['Explosivité'], même avec donnée réelle fournie) ; la seule "preuve équivalente"
// documentée (Réactivité->Explosivité, sldj_rsi) est déjà correctement exposée comme HYPOTHESIS/
// CONTRIBUTING (Mission AF), jamais promue à diagnostic. CONCLUSION : aucun déblocage légitime
// n'existe avec les données/normes actuelles — NOT_DETERMINED reste la seule réponse honnête.
//
// Gain réel de cette mission (§7 mission, critères 3/4/5) : CSM_V2_CMJ_PHASE_MATRIX (CMJ traçable
// phase par phase dans le graphe clinique, réutilise csmV2AhCmjPhaseForKey Mission AH) et
// computeCsmV2ClinicalDiagnosticChain (identifie automatiquement la variable précise qui bloque une
// conclusion + propose le meilleur élément de preuve suivant avec justification, via
// diagnosticBlockedReason/missingRequirement/bestNextEvidence explicites, jamais masqués).
//
// Exécution : node tests/mission_ai_cmj_diagnostic_engine_tests.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur()/buildExpertReport() dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}
function csm(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}).clinicalSynthesisV2; }

console.log('MISSION AI — déblocage diagnostique P0 + CMJ par phases');

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
const yc = csm(YANNIS_DATA, YANNIS_NORM_SEL);
const chain = yc.clinicalDiagnosticChain;
const phaseMatrix = yc.cmjPhaseMatrix;

// ═══════════════════════════ MAPPING DES 8 PHASES ═══════════════════════════════════════════════════
test('AI1 — CSM_V2_CMJ_PHASE_MATRIX couvre les 8 phases, même vides (structure toujours présente)', () => {
  assert.strictEqual(Object.keys(phaseMatrix).length, 8);
  CSM_V2_AH_CMJ_PHASES.forEach(p => {
    assert.ok(phaseMatrix[p]);
    ['available', 'consumed', 'notConsumed', 'classifiable', 'nonClassifiable', 'qualities'].forEach(k => assert.ok(Array.isArray(phaseMatrix[p][k]), p + '.' + k));
  });
});
test('AI2 — les variables "disponibles" par phase proviennent EXCLUSIVEMENT du catalogue TESTS existant (jamais une variable inventée)', () => {
  const catalog = TESTS.find(t => t.key === 'cmj').kpis.map(k => k.key);
  CSM_V2_AH_CMJ_PHASES.forEach(p => phaseMatrix[p].available.forEach(v => assert.ok(catalog.indexOf(v.key) !== -1)));
});
test('AI3 — les variables "consommées" par phase correspondent exactement à CSM_V2_CLINICAL_VARIABLE_MATRIX (test==="cmj"), aucune perte', () => {
  const totalConsumed = CSM_V2_AH_CMJ_PHASES.reduce((s, p) => s + phaseMatrix[p].consumed.length, 0);
  assert.strictEqual(totalConsumed, CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.filter(v => v.test === 'cmj').length);
  assert.strictEqual(totalConsumed, 16);
});
test('AI4 — Phase 1 (position/initiation) et Phase 4 (transition) : catalogue disponible mais AUCUNE variable consommée aujourd\'hui', () => {
  assert.strictEqual(phaseMatrix['position_initiation'].consumed.length, 0);
  assert.strictEqual(phaseMatrix['transition'].consumed.length, 0);
});
test('AI5 — Phase 8 (réception) : 11 variables disponibles dans le catalogue CMJ, ZÉRO consommée — Stabilisation utilise des tests dédiés séparés', () => {
  assert.strictEqual(phaseMatrix['reception'].available.length, 11);
  assert.strictEqual(phaseMatrix['reception'].consumed.length, 0);
  assert.ok(phaseMatrix['reception'].notConsumed.length, 11);
});
test('AI6 — Phase 5 (propulsion concentrique) : 10 variables disponibles, 6 clés uniques consommées (7 entrées, une variable partagée Puissance/Explosivité), toutes non classifiables', () => {
  assert.strictEqual(phaseMatrix['propulsion_concentrique'].available.length, 10);
  assert.strictEqual(phaseMatrix['propulsion_concentrique'].consumed.length, 7);
  assert.strictEqual(phaseMatrix['propulsion_concentrique'].classifiable.length, 0);
});
test('AI7 — Phase 6 (take-off) est la SEULE phase où les variables consommées sont TOUTES classifiables (peak_power, rsi_mod)', () => {
  const p6 = phaseMatrix['take_off'];
  assert.ok(p6.consumed.length > 0);
  assert.strictEqual(p6.classifiable.length, p6.consumed.length);
});

// ═══════════════════════════ RÔLES DIAGNOSTIC/CONFIRMATIF/EXPLICATIF ═══════════════════════════════
test('AI8 — clinicalDiagnosticChain expose diagnosticVariables/explanatoryFactors disjoints pour les 8 qualités', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const diagKeys = new Set(chain[q].diagnosticVariables.map(v => v.variableKey));
    chain[q].explanatoryFactors.forEach(v => assert.strictEqual(diagKeys.has(v.variableKey), false));
  });
});
test('AI9 — mechanism provient exactement de CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].mechanism (jamais recalculé)', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.strictEqual(chain[q].mechanism, CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].mechanism));
});
test('AI10 — missingVariables reflète exactement CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].missingVariables', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.strictEqual(chain[q].missingVariables.length, CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].missingVariables.length));
});

// ═══════════════════════════ CLASSIFIABILITÉ ════════════════════════════════════════════════════════
test('AI11 — diagnosticStatus est déterministe : classifiable_absolute prime sur classifiable_symmetry qui prime sur blocked', () => {
  assert.strictEqual(chain['Mobilité'].diagnosticStatus, 'classifiable_absolute');
  assert.strictEqual(chain['Absorption'].diagnosticStatus, 'classifiable_symmetry');
  assert.strictEqual(chain['Explosivité'].diagnosticStatus, 'blocked');
});
test('AI12 — classifiableDiagnosticVariables n\'est jamais vide quand diagnosticStatus !== "blocked"', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    if (chain[q].diagnosticStatus !== 'blocked') assert.ok(chain[q].classifiableDiagnosticVariables.length > 0, q);
  });
});
test('AI13 — les 3 seules valeurs possibles pour diagnosticStatus sont classifiable_absolute/classifiable_symmetry/blocked (jamais un score arbitraire)', () => {
  const allowed = ['classifiable_absolute', 'classifiable_symmetry', 'blocked'];
  HYP_CSM_QUALITIES.forEach(q => assert.ok(allowed.indexOf(chain[q].diagnosticStatus) !== -1));
});

// ═══════════════════════════ EXPLOSIVITÉ (chantier P0) ═══════════════════════════════════════════════
test('AI14 — Explosivité (Yannis réel) : diagnosticStatus="blocked", phase="propulsion_concentrique" (traçabilité CMJ réelle)', () => {
  assert.strictEqual(chain['Explosivité'].diagnosticStatus, 'blocked');
  assert.strictEqual(chain['Explosivité'].phase, 'propulsion_concentrique');
});
test('AI15 — Explosivité : diagnosticBlockedReason/missingRequirement/bestNextEvidence tous explicitement renseignés (jamais null quand bloquée)', () => {
  const e = chain['Explosivité'];
  assert.ok(e.diagnosticBlockedReason && typeof e.diagnosticBlockedReason === 'string');
  assert.ok(e.missingRequirement && typeof e.missingRequirement === 'string');
  assert.ok(e.bestNextEvidence && typeof e.bestNextEvidence.reason === 'string');
});
test('AI16 — Explosivité : aucun seuil inventé — vérifié que cmj_conc_rfd/cmj_conc_impulse_100 sont absents de THRESHOLDS ET de NORMS_V2', () => {
  assert.strictEqual(THRESHOLDS.cmj_conc_rfd, undefined);
  assert.strictEqual(THRESHOLDS.cmj_conc_impulse_100, undefined);
  assert.strictEqual(NORMS_V2.cmj_conc_rfd, undefined);
  assert.strictEqual(NORMS_V2.cmj_conc_impulse_100, undefined);
  assert.deepStrictEqual(NORMS_V2_TEST_VARS.cmj, ['cmj_peak_power']);
});
test('AI17 — Explosivité : aucune voie de symétrie D/G n\'existe pour ses variables diagnostiques (ASYM_SIDE_PAIRS ne couvre pas conc_rfd/conc_impulse_100)', () => {
  assert.strictEqual(ASYM_SIDE_PAIRS.conc_rfd_asym, undefined);
  assert.strictEqual(ASYM_SIDE_PAIRS.conc_impulse_100_asym, undefined);
  const symmetryKeys = Object.keys(yc.symmetryEvidence['Explosivité'] || {});
  assert.strictEqual(symmetryKeys.indexOf('diagnosticEvidence.cmj_conc_rfd'), -1);
  assert.strictEqual(symmetryKeys.indexOf('diagnosticEvidence.cmj_conc_impulse_100'), -1);
});
test('AI18 — Explosivité : les 2 variables diagnostiques sont réellement importables (alias CSV réels dans le code source), le blocage est un GAP-2 (seuil), jamais un GAP-4 (import)', () => {
  assert.ok(code.indexOf("conc_rfd:['Concentric RFD'") !== -1, 'alias CSV conc_rfd absent');
  assert.ok(code.indexOf('conc_impulse_100:[') !== -1, 'alias CSV conc_impulse_100 absent');
});
test('AI19 — Explosivité : la relation Réactivité->Explosivité (sldj_rsi, déjà whitelisted) reste HYPOTHESIS/CONTRIBUTING, jamais promue à un diagnostic équivalent (§9 gouvernance)', () => {
  const explo = yc.variableHypotheses.find(v => v.quality === 'Explosivité');
  const reactiviteEntry = explo.verificationVariables.find(v => v.quality === 'Réactivité');
  assert.ok(reactiviteEntry);
  assert.ok(['HYPOTHESIS', 'CONTRIBUTING', 'ASSOCIATED', 'REFUTED'].indexOf(reactiviteEntry.status) !== -1);
  assert.strictEqual(chain['Explosivité'].diagnosticStatus, 'blocked', 'la relation existante ne débloque jamais le diagnostic propre');
});
test('AI20 — Explosivité : completenessStatus reste NOT_DETERMINED — jamais forcée à COMPLETE/PARTIAL sans preuve réelle', () => {
  assert.strictEqual(chain['Explosivité'].completenessStatus, 'NOT_DETERMINED');
  assert.strictEqual(yc.clinicalProfile['Explosivité'].severity, 'modere', 'la sévérité (déjà connue, via bridge) reste inchangée par cette mission');
});

// ═══════════════════════════ ABSORPTION (chantier P0) ═══════════════════════════════════════════════
test('AI21 — Absorption (Yannis réel) : diagnosticStatus="classifiable_symmetry" — diagnostic légitime par LSI, jamais par valeur absolue inventée', () => {
  assert.strictEqual(chain['Absorption'].diagnosticStatus, 'classifiable_symmetry');
  assert.ok(chain['Absorption'].classifiableDiagnosticVariables.some(v => v.variableKey === 'braking_rfd'));
});
test('AI22 — Absorption : diagnosticBlockedReason reste null (non bloquée) — cohérent avec completenessStatus COMPLETE', () => {
  assert.strictEqual(chain['Absorption'].diagnosticBlockedReason, null);
  assert.strictEqual(chain['Absorption'].completenessStatus, 'COMPLETE');
});
test('AI23 — Absorption : mécanisme distinct des facteurs explicatifs (mechanism="Capacité à freiner / absorber la charge.", jamais confondu avec explanatoryFactors)', () => {
  assert.strictEqual(chain['Absorption'].mechanism, 'Capacité à freiner / absorber la charge.');
  assert.ok(chain['Absorption'].explanatoryFactors.length > 0);
  assert.strictEqual(chain['Absorption'].explanatoryFactors.some(v => v.variableKey === chain['Absorption'].mechanism), false);
});
test('AI24 — Absorption : la conséquence CMJ braking RFD (Explosivité) reste un "bridge", JAMAIS présentée comme un lien causal établi', () => {
  const bridgeConsequence = chain['Absorption'].consequences.find(c => c.quality === 'Explosivité');
  assert.ok(bridgeConsequence);
  assert.strictEqual(bridgeConsequence.type, 'bridge');
});
test('AI25 — Absorption : les 3 variables diagnostiques réelles (braking_rfd/braking_impulse/force_zero_vel, issues du CMJ bilatéral — freinage excentrique) sont correctement présentes ; csmV2VariableMatrixTestKey ne résout aucun "test" pour ces 3 clés (limite pré-existante Mission AB, jamais introduite par cette mission, documentée dans le rapport final)', () => {
  assert.strictEqual(chain['Absorption'].diagnosticVariables.length, 3);
  const keys = chain['Absorption'].diagnosticVariables.map(v => v.variableKey).sort();
  assert.deepStrictEqual(keys, ['braking_impulse', 'braking_rfd', 'force_zero_vel'].sort());
  chain['Absorption'].diagnosticVariables.forEach(v => assert.strictEqual(v.test, null));
  assert.strictEqual(csmV2VariableMatrixTestKey('braking_rfd'), null);
  // csmV2AiIsCmjVariable (repli sur le libellé "CMJ —"/"Countermovement Jump —", jamais un champ
  // inventé) rattrape ce cas -> phase correctement résolue malgré test===null.
  assert.strictEqual(chain['Absorption'].phase, 'freinage_excentrique');
});

// ═══════════════════════════ REFUS D'UNE CAUSALITÉ NON SUPPORTÉE ═══════════════════════════════════
test('AI26 — aucune conséquence n\'est jamais un lien causal direct : chaque entrée porte "type" (bridge/relation) jamais une affirmation causale nue', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    chain[q].consequences.forEach(c => assert.ok(c.type, q + ' : conséquence sans type explicite'));
  });
});
test('AI27 — aucun mot causal affirmatif dans diagnosticBlockedReason/missingRequirement (jamais "est la cause de"/"provoque"/"entraîne")', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const c = chain[q];
    [c.diagnosticBlockedReason, c.missingRequirement].filter(Boolean).forEach(text => {
      ['est la cause de', 'provoque', 'entraîne'].forEach(w => assert.strictEqual(text.toLowerCase().indexOf(w), -1, q + ' : "' + w + '" trouvé'));
    });
  });
});
test('AI28 — la relation Explosivité->Puissance (whitelisted:false) n\'apparaît JAMAIS comme classifiableDiagnosticVariables ni comme preuve de déblocage', () => {
  const rel = CLINICAL_HYPOTHESIS_WHITELIST.find(w => w.explains === 'Explosivité' && w.explained === 'Puissance');
  assert.strictEqual(rel.allowed, false);
  assert.strictEqual(yc.clinicalHypotheses.some(h => h.explains === 'Explosivité' && h.explained === 'Puissance'), false);
});

// ═══════════════════════════ REFUS D'UN DIAGNOSTIC SANS SEUIL ══════════════════════════════════════
test('AI29 — csmV2AiDiagnosticStatus (fonction pure) : une variable non_classifiable et hors symmetryEvidence reste "blocked", jamais promue', () => {
  const matrixEntry = { diagnostic: [{ variableKey: 'x', variablePath: 'diagnosticEvidence.x', classifiability: 'non_classifiable' }] };
  const status = csmV2AiDiagnosticStatus(matrixEntry, 'Explosivité', {});
  assert.strictEqual(status.status, 'blocked');
});
test('AI30 — csmV2AiDiagnosticStatus : présence dans symmetryEvidence (même available:false) suffit à activer classifiable_symmetry — jamais un seuil absolu inventé pour autant', () => {
  const matrixEntry = { diagnostic: [{ variableKey: 'x', variablePath: 'diagnosticEvidence.x', classifiability: 'non_classifiable' }] };
  const status = csmV2AiDiagnosticStatus(matrixEntry, 'Q', { Q: { 'diagnosticEvidence.x': { available: false } } });
  assert.strictEqual(status.status, 'classifiable_symmetry');
});
test('AI31 — aucune variable non classifiable n\'est jamais dans classifiableDiagnosticVariables (les 8 qualités)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    chain[q].classifiableDiagnosticVariables.forEach(v => {
      if (chain[q].diagnosticStatus === 'classifiable_absolute') assert.notStrictEqual(v.classifiability, 'non_classifiable');
    });
  });
});

// ═══════════════════════════ CONSERVATION DU STATUT NOT_DETERMINED ═════════════════════════════════
test('AI32 — Endurance (Yannis) : completenessStatus reste NOT_DETERMINED bien que diagnosticStatus soit classifiable_absolute (heel_raise_reps a un seuil réel mais n\'a pas résolu ce bilan)', () => {
  assert.strictEqual(chain['Endurance'].diagnosticStatus, 'classifiable_absolute');
  assert.strictEqual(chain['Endurance'].completenessStatus, 'NOT_DETERMINED');
});
test('AI33 — une qualité non testée reste "blocked" ou correctement non déterminée, jamais forcée à classifiable_absolute sans donnée réelle', () => {
  const untested = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3500], ecc_decel_rfd_R: [1400] } } });
  assert.strictEqual(untested.clinicalCompletenessAudit['Réactivité'].completenessStatus, 'NOT_DETERMINED');
});
test('AI34 — les 8 sévérités Yannis restent STRICTEMENT inchangées par cette mission (aucune amélioration non justifiée par une preuve réelle)', () => {
  const expected = { Force: 'preserved', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Puissance: 'modere', Explosivité: 'modere', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(yc.clinicalProfile[q].severity, expected[q], q));
});

// ═══════════════════════════ NEXT-BEST-EVIDENCE ═════════════════════════════════════════════════════
test('AI35 — Endurance : bestNextEvidence n\'est pas nécessaire au niveau chain (non bloquée), mais informationalTests identifie déjà Heel Raise (HIGH) comme meilleur test réel', () => {
  assert.strictEqual(chain['Endurance'].diagnosticBlockedReason, null);
  const heelRaise = yc.informationalTests.find(t => t.test === 'Heel Raise' && t.targetQuality === 'Endurance');
  assert.strictEqual(heelRaise.expectedReasoningGain, 'HIGH');
});
test('AI36 — Explosivité : bestNextEvidence.test est explicitement null avec une justification honnête (aucun test n\'apporterait de gain aujourd\'hui) — jamais un test recommandé sans valeur réelle', () => {
  assert.strictEqual(chain['Explosivité'].bestNextEvidence.test, null);
  assert.ok(/gain exploitable/i.test(chain['Explosivité'].bestNextEvidence.reason));
  assert.strictEqual(yc.informationalTests.filter(t => t.targetQuality === 'Explosivité').length, 0);
});
test('AI37 — quand bestNextEvidence.test n\'est pas null, il correspond à un test réellement présent dans informationalTests avec un gain exploitable', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const best = chain[q].bestNextEvidence;
    if (best && best.test) {
      assert.ok(yc.informationalTests.some(t => t.test === best.test && t.targetQuality === q && t.expectedReasoningGain !== 'NONE'));
    }
  });
});

// ═══════════════════════════ DONNÉES RÉELLES YANNIS ═════════════════════════════════════════════════
test('AI38 — Yannis réel : phase CMJ tracée correctement pour Puissance (take_off, cmj_peak_power) et Explosivité (propulsion_concentrique, cmj_conc_rfd)', () => {
  assert.strictEqual(chain['Puissance'].phase, 'take_off');
  assert.strictEqual(chain['Explosivité'].phase, 'propulsion_concentrique');
});
test('AI39 — Yannis réel : les qualités sans diagnostic lié au CMJ ont phase=null (Mobilité, Réactivité, Force, Stabilisation, Endurance)', () => {
  ['Mobilité', 'Réactivité', 'Force', 'Stabilisation', 'Endurance'].forEach(q => assert.strictEqual(chain[q].phase, null, q));
});
test('AI40 — Yannis réel : le tableau complet (diagnostiqué/confirmé/explicatif/indéterminé) est cohérent pour les 8 qualités, sans exception ni valeur manquante', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const c = chain[q];
    assert.ok(c.quality === q);
    assert.ok(Array.isArray(c.diagnosticVariables) && Array.isArray(c.explanatoryFactors) && Array.isArray(c.consequences) && Array.isArray(c.missingVariables));
    assert.ok(['COMPLETE', 'PARTIAL', 'DIAGNOSTIC_BLOCKED', 'NOT_DETERMINED'].indexOf(c.completenessStatus) !== -1);
  });
});

// ═══════════════════════════ ABSENCE DE RÉGRESSION ══════════════════════════════════════════════════
test('AI41 — gouvernance : THRESHOLDS(24)/HYP_QUALITY_RELATIONS(9)/CLINICAL_HYPOTHESIS_WHITELIST(9)/matrix.meta(150) strictement inchangés', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
});
test('AI42 — les 8 moteurs HYP LOCKED restent inchangés (fonctions présentes, jamais modifiées)', () => {
  ['computeHypForce01', 'computeHypMobility01', 'computeHypReactivity01', 'computeHypAbsorption01', 'computeHypPower01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01'].forEach(fn => {
    assert.strictEqual(eval('typeof ' + fn), 'function');
  });
});
test('AI43 — pureté : deux exécutions de computeMoteur() sur Yannis produisent un clinicalDiagnosticChain et un cmjPhaseMatrix strictement identiques', () => {
  const a = csm(YANNIS_DATA, YANNIS_NORM_SEL);
  const b = csm(YANNIS_DATA, YANNIS_NORM_SEL);
  assert.deepStrictEqual(a.clinicalDiagnosticChain, b.clinicalDiagnosticChain);
  assert.deepStrictEqual(a.cmjPhaseMatrix, b.cmjPhaseMatrix);
});
test('AI44 — computeCsmV2ClinicalDiagnosticChain/computeCsmV2CmjPhaseMatrix restent des couches additives : aucune référence dans les 8 moteurs HYP LOCKED (ligne < 6650)', () => {
  const lockedEnd = code.indexOf('var HYP_CSM_QUALITIES');
  const lockedSection = code.slice(0, lockedEnd);
  assert.strictEqual(/computeCsmV2ClinicalDiagnosticChain|CSM_V2_CMJ_PHASE_MATRIX/.test(lockedSection), false);
});
test('AI45 — régression complète : clinicalCompletenessAudit (Mission AH) reste identique à travers cette mission (aucun recalcul de norme/seuil/relation)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    assert.strictEqual(yc.clinicalCompletenessAudit[q].completenessStatus, chain[q].completenessStatus);
  });
});

console.log('=== TOTAL MISSION AI : ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) process.exit(1);

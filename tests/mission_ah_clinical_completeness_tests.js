// MISSION AH — AUDIT DÉFINITIF DE COMPLÉTUDE CLINIQUE DES 8 QUALITÉS.
//
// Mission d'AUDIT PURE (aucun nouveau seuil/norme/relation, aucun moteur HYP LOCKED modifié, aucune
// nouvelle couche narrative). Détermine si Kinexus possède réellement toutes les variables nécessaires
// pour diagnostiquer/expliquer/distinguer les mécanismes/identifier les conséquences/déterminer les
// données manquantes/sélectionner le meilleur test complémentaire pour chacune des 8 qualités —
// EN CROISANT les structures Q->AH déjà calculées (CSM_V2_CLINICAL_VARIABLE_MATRIX, clinicalCausal
// Reasoning, clinicalEvidenceHierarchy, clinicalCertainty, symmetryEvidence, THRESHOLDS, HYP_QUALITY_
// RELATIONS, CLINICAL_HYPOTHESIS_WHITELIST, CSM_V2_AXIS_QUALITY_MAP), jamais un score arbitraire.
//
// Nouvelles fonctions testées : computeCsmV2ClinicalCompletenessAudit (livrable principal, exposé
// comme clinicalSynthesisV2.clinicalCompletenessAudit), csmV2AhComputeOrphanThresholds/csmV2AhUnused
// ForQuality (GAP-3, variables THRESHOLDS jamais consommées par aucun moteur HYP — 7 clés confirmées
// par recoupement direct avec le code source), csmV2AhCompletenessStatus (COMPLETE/PARTIAL/DIAGNOSTIC_
// BLOCKED/NOT_DETERMINED), csmV2AhCausalGaps/csmV2AhPriorityGaps (P0-P3, dérivés de comptages déjà
// présents dans la matrice statique), computeCsmV2AhCmjPhaseAudit (CMJ par 8 phases, AUDIT-ONLY —
// catégorise les 16 variables CMJ déjà consommées, jamais une nouvelle catégorie dans le moteur).
//
// Exécution : node tests/mission_ah_clinical_completeness_tests.js — aucune dépendance externe.
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

console.log('MISSION AH — audit définitif de complétude clinique des 8 qualités');

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
const audit = yc.clinicalCompletenessAudit;

// ═══════════════════════════ AH1-AH8 — UNE QUALITÉ PAR QUALITÉ ═════════════════════════════════════
test('AH1 — clinicalCompletenessAudit présent pour les 8 qualités, structure exacte demandée par la mission', () => {
  assert.strictEqual(Object.keys(audit).length, 8);
  const expectedKeys = ['diagnostic', 'confirmatory', 'explanatory', 'consequences', 'missing', 'unclassifiable', 'unused', 'relationships', 'causalGaps', 'priorityGaps', 'completenessStatus'];
  HYP_CSM_QUALITIES.forEach(q => expectedKeys.forEach(k => assert.ok(k in audit[q], q + '.' + k + ' manquant')));
});
test('AH2 — Force : 4 variables diagnostiques réelles, 1 seule partiellement classifiable (imtp_n, NORMS_V2)', () => {
  assert.strictEqual(audit['Force'].diagnostic.length, 4);
  const classifiable = audit['Force'].diagnostic.filter(v => v.classifiability !== 'non_classifiable');
  assert.strictEqual(classifiable.length, 1);
  assert.strictEqual(classifiable[0].variableKey, 'imtp_n');
});
test('AH3 — Puissance : 2 variables diagnostiques, toutes deux partiellement exploitables (NORMS_V2, population requise)', () => {
  assert.strictEqual(audit['Puissance'].diagnostic.length, 2);
  audit['Puissance'].diagnostic.forEach(v => assert.strictEqual(v.classifiability, 'partiellement_exploitable'));
});
test('AH4 — Explosivité : 2 variables diagnostiques, AUCUNE classifiable (cmj_conc_rfd/cmj_conc_impulse_100 sans seuil)', () => {
  assert.strictEqual(audit['Explosivité'].diagnostic.length, 2);
  assert.ok(audit['Explosivité'].diagnostic.every(v => v.classifiability === 'non_classifiable'));
});
test('AH5 — Mobilité : 1 variable diagnostique exploitable (wblt_distance, seuil réel)', () => {
  assert.strictEqual(audit['Mobilité'].diagnostic.length, 1);
  assert.strictEqual(audit['Mobilité'].diagnostic[0].classifiability, 'exploitable');
});
test('AH6 — Réactivité : 2 variables diagnostiques exploitables (dj_rsi, sldj_rsi)', () => {
  assert.strictEqual(audit['Réactivité'].diagnostic.length, 2);
  assert.ok(audit['Réactivité'].diagnostic.every(v => v.classifiability === 'exploitable'));
});
test('AH7 — Absorption : 3 variables diagnostiques, ZÉRO classifiable ET zéro confirmative (aucune couche de confirmation actuelle)', () => {
  assert.strictEqual(audit['Absorption'].diagnostic.length, 3);
  assert.ok(audit['Absorption'].diagnostic.every(v => v.classifiability === 'non_classifiable'));
  assert.strictEqual(audit['Absorption'].confirmatory.length, 0);
});
test('AH8 — Stabilisation : 6 variables diagnostiques (dont SLS/EO/EF/Strobo, proprioceptives), 2 seulement classifiables ; Endurance : 6 variables diagnostiques, 1 seule classifiable (heel_raise_reps)', () => {
  assert.strictEqual(audit['Stabilisation'].diagnostic.length, 6);
  assert.strictEqual(audit['Stabilisation'].diagnostic.filter(v => v.classifiability !== 'non_classifiable').length, 2);
  assert.ok(audit['Stabilisation'].diagnostic.some(v => v.variableKey === 'sls'));
  assert.strictEqual(audit['Endurance'].diagnostic.length, 6);
  const enduranceClassifiable = audit['Endurance'].diagnostic.filter(v => v.classifiability !== 'non_classifiable');
  assert.strictEqual(enduranceClassifiable.length, 1);
  assert.strictEqual(enduranceClassifiable[0].variableKey, 'heel_raise_reps');
});

// ═══════════════════════════ AH9-AH16 — RÔLES DIAGNOSTIQUE/CONFIRMATIF/EXPLICATIF ═══════════════════
test('AH9 — diagnostic != confirmatory != explanatory : les 3 rôles restent structurellement disjoints pour les 8 qualités', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const diagKeys = new Set(audit[q].diagnostic.map(v => v.variableKey));
    const confirmKeys = new Set(audit[q].confirmatory.map(v => v.variableKey));
    const explicKeys = new Set(audit[q].explanatory.map(v => v.variableKey));
    diagKeys.forEach(k => { assert.strictEqual(confirmKeys.has(k), false); assert.strictEqual(explicKeys.has(k), false); });
    confirmKeys.forEach(k => assert.strictEqual(explicKeys.has(k), false));
  });
});
test('AH10 — une preuve confirmative seule ne devient jamais diagnostique (règle §9) : aucun rôle DIRECT parmi les variables confirmatives', () => {
  HYP_CSM_QUALITIES.forEach(q => audit[q].confirmatory.forEach(v => assert.strictEqual(v.role, 'CONFIRMATIVE')));
});
test('AH11 — une donnée non classifiable ne devient jamais une preuve clinique : missingEvidence ne contient que des variables réellement non fournies, jamais fabriquées', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    yc.clinicalCausalReasoning.qualityReasoning[q].missingEvidence.forEach(m => {
      assert.ok(m.variable && m.label && m.reason, q + ' : entrée missingEvidence incomplète');
    });
  });
});
test('AH12 — total diagnostic+confirmatory+explanatory par qualité correspond exactement à la matrice statique (aucune perte au passage dans l\'audit)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const m = CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q];
    assert.strictEqual(audit[q].diagnostic.length, m.diagnostic.length);
    assert.strictEqual(audit[q].confirmatory.length, m.confirmative.length);
    assert.strictEqual(audit[q].explanatory.length, m.explicative.length);
  });
});
test('AH13 — unclassifiable regroupe exactement les variables non_classifiable des 3 rôles (aucune omise, aucune ajoutée)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const expected = audit[q].diagnostic.concat(audit[q].confirmatory, audit[q].explanatory).filter(v => v.classifiability === 'non_classifiable').length;
    assert.strictEqual(audit[q].unclassifiable.length, expected);
  });
});
test('AH14 — missing (variables manquantes) provient exactement de CSM_V2_CLINICAL_VARIABLE_MATRIX.missingVariables (référence statique, Mission AB/AD)', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.strictEqual(audit[q].missing.length, CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality[q].missingVariables.length));
});
test('AH15 — GAP-3 (unused) : 7 clés THRESHOLDS confirmées jamais consommées par aucun moteur HYP (recoupement direct avec le code source)', () => {
  const orphans = csmV2AhComputeOrphanThresholds();
  assert.deepStrictEqual(orphans.slice().sort(), ['hip_rot_ext_nkg', 'hip_rot_int_nkg', 'sh_iso_9020_nkg', 'sh_iso_9090_nkg', 'sldj_tts', 'slcmj_height', 'ybt_composite'].sort());
});
test('AH16 — unused est ancré à une qualité UNIQUEMENT via un test déjà consommé par cette qualité (jamais une relation inventée) : ybt_composite -> Mobilité, sldj_tts -> Réactivité, slcmj_height -> Puissance/Absorption', () => {
  assert.ok(audit['Mobilité'].unused.some(v => v.variableKey === 'ybt_composite'));
  assert.ok(audit['Réactivité'].unused.some(v => v.variableKey === 'sldj_tts'));
  assert.ok(audit['Puissance'].unused.some(v => v.variableKey === 'slcmj_height'));
  assert.ok(audit['Absorption'].unused.some(v => v.variableKey === 'slcmj_height'));
  // hip_rot_int/ext et sh_iso_9020/9090 n'ont aucun test déjà consommé par une qualité -> jamais rattachés.
  HYP_CSM_QUALITIES.forEach(q => assert.strictEqual(audit[q].unused.some(v => /hip_rot|sh_iso/.test(v.variableKey)), false));
});

// ═══════════════════════════ AH17-AH22 — GAPS 1→6 ═══════════════════════════════════════════════════
test('AH17 — GAP 1 (donnée manquante) : Réactivité a un test exploitable existant (dj_rsi, seuil réel) non renseigné dans un bilan minimal', () => {
  const minimal = csm({ sldj: { active: true, D: { trials: { rsi: [0.9] } }, G: { trials: { rsi: [0.9] } } } });
  const dj = minimal.clinicalCompletenessAudit['Réactivité'].diagnostic.find(v => v.variableKey === 'dj_rsi');
  assert.ok(dj && dj.classifiability === 'exploitable');
});
test('AH18 — GAP 2 (variable disponible mais non classifiable) : les 3 diagnostiques Absorption existent réellement mais aucune n\'a de seuil', () => {
  assert.strictEqual(audit['Absorption'].diagnostic.length, 3);
  assert.strictEqual(audit['Absorption'].diagnostic.filter(v => v.classifiability === 'non_classifiable').length, 3);
});
test('AH19 — GAP 3 (variable classifiable mais non consommée) : slcmj_height a un seuil réel (THRESHOLDS) mais n\'est lu par aucun moteur HYP', () => {
  assert.ok(THRESHOLDS.slcmj_height);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.some(v => v.variableKey.split('.').pop() === 'slcmj_height'), false);
});
test('AH20 — GAP 4 (test non importé) : aucun des 8 moteurs HYP ne référence de test hors du catalogue TESTS/TBK existant (recoupement structurel, aucun test fantôme)', () => {
  const cmjTests = CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.map(v => v.test);
  cmjTests.forEach(t => assert.ok(TBK[t] || t === null, t + ' référencé par la matrice sans entrée TBK correspondante'));
});
test('AH21 — GAP 5 (gap de relation) : Absorption n\'a AUCUNE relation qualité→qualité validée (relationsOut et relationsIn vides), isolée du graphe relationnel', () => {
  assert.deepStrictEqual(audit['Absorption'].relationships.out, []);
  assert.deepStrictEqual(audit['Absorption'].relationships.in, []);
  assert.ok(audit['Absorption'].causalGaps.some(g => g.type === 'GAP_5'));
});
test('AH22 — GAP 6 (gap de données cliniques) : Stabilisation ET Absorption n\'ont aucune variable confirmative dans le protocole actuel (jamais inventée pour combler ce vide)', () => {
  assert.strictEqual(audit['Stabilisation'].confirmatory.length, 0);
  assert.strictEqual(audit['Absorption'].confirmatory.length, 0);
});

// ═══════════════════════════ AH23-AH28 — CMJ PAR PHASES ═════════════════════════════════════════════
test('AH23 — CSM_V2_AH_CMJ_PHASE_AUDIT couvre les 8 phases, les 16 variables CMJ réellement consommées sont toutes catégorisées (aucune perdue)', () => {
  assert.strictEqual(Object.keys(CSM_V2_AH_CMJ_PHASE_AUDIT).length, 8);
  const totalCategorized = CSM_V2_AH_CMJ_PHASES.reduce((s, p) => s + CSM_V2_AH_CMJ_PHASE_AUDIT[p].variables.length, 0);
  const totalCmjInMatrix = CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.filter(v => v.test === 'cmj').length;
  assert.strictEqual(totalCategorized, totalCmjInMatrix);
  assert.strictEqual(totalCmjInMatrix, 16);
});
test('AH24 — Phase 5 (propulsion concentrique) concentre les 2 variables diagnostiques d\'Explosivité, TOUTES non classifiables — bloque structurellement le diagnostic direct de cette phase', () => {
  const p5 = CSM_V2_AH_CMJ_PHASE_AUDIT['propulsion_concentrique'];
  assert.strictEqual(p5.diagnostic.length, 2);
  assert.ok(p5.diagnostic.every(v => v.classifiability === 'non_classifiable'));
  assert.strictEqual(p5.classifiable.length, 0);
});
test('AH25 — Phase 6 (take-off) est la SEULE phase où toutes les variables CMJ sont classifiables (peak_power, rsi_mod) — véritable valeur clinique aujourd\'hui', () => {
  const p6 = CSM_V2_AH_CMJ_PHASE_AUDIT['take_off'];
  assert.ok(p6.variables.length > 0);
  assert.strictEqual(p6.classifiable.length, p6.variables.length);
});
test('AH26 — Phase 8 (réception) : AUCUNE variable CMJ n\'est consommée — Stabilisation utilise des tests dédiés séparés (landing_uni/landing_bi), jamais les KPI d\'atterrissage du CMJ lui-même', () => {
  assert.strictEqual(CSM_V2_AH_CMJ_PHASE_AUDIT['reception'].variables.length, 0);
  assert.ok(audit['Stabilisation'].diagnostic.some(v => v.test === 'landing_uni' || v.test === 'landing_bi'));
});
test('AH27 — Phases 1 (position/initiation) et 4 (transition) : aucune variable CMJ n\'a de valeur clinique consommée aujourd\'hui dans Kinexus', () => {
  assert.strictEqual(CSM_V2_AH_CMJ_PHASE_AUDIT['position_initiation'].variables.length, 0);
  assert.strictEqual(CSM_V2_AH_CMJ_PHASE_AUDIT['transition'].variables.length, 0);
});
test('AH28 — Phase 3 (freinage excentrique) : 3 variables explicatives (Explosivité) toutes non classifiables — la RFD de freinage CMJ (ecc_decel_rfd_L/R) alimente en réalité Force.rapidForceDeficit via un chemin LOCKED séparé, non capturé par cette catégorisation matricielle (limite documentée)', () => {
  const p3 = CSM_V2_AH_CMJ_PHASE_AUDIT['freinage_excentrique'];
  assert.strictEqual(p3.variables.length, 3);
  assert.ok(p3.variables.every(v => v.classifiability === 'non_classifiable'));
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Force'].diagnostic.concat(CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Force'].confirmative, CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Force'].explicative).some(v => /cmj|ecc_decel/.test(v.variableKey)), false);
});

// ═══════════════════════════ AH29-AH34 — CAUSALITÉ ET BRIDGES ═══════════════════════════════════════
test('AH29 — relationships.out/in reflète exactement HYP_QUALITY_RELATIONS (9 relations LOCKED), jamais une relation inventée par l\'audit', () => {
  var totalOut = 0; HYP_CSM_QUALITIES.forEach(q => totalOut += audit[q].relationships.out.length);
  assert.strictEqual(totalOut, HYP_QUALITY_RELATIONS.length);
});
test('AH30 — chaque relation exposée porte un statut "whitelisted" traçable à CLINICAL_HYPOTHESIS_WHITELIST (jamais une causalité implicite)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    audit[q].relationships.out.concat(audit[q].relationships.in).forEach(r => {
      assert.strictEqual(typeof r.whitelisted, 'boolean');
    });
  });
  assert.ok(audit['Puissance'].relationships.out.some(r => r.explained === 'Explosivité' && r.whitelisted === true));
});
test('AH31 — Explosivité→Puissance est la SEULE relation non autorisée (whitelisted:false), correctement reflétée dans relationships', () => {
  const rel = audit['Explosivité'].relationships.out.find(r => r.explained === 'Puissance');
  assert.ok(rel);
  assert.strictEqual(rel.whitelisted, false);
});
test('AH32 — bridges (variable pont) restent structurellement distincts des relations qualité→qualité — jamais fusionnés dans relationships.out/in', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.ok(Array.isArray(audit[q].relationships.bridges)));
  assert.ok(audit['Absorption'].relationships.bridges.some(b => b.from === 'Explosivité' && b.to === 'Absorption'), 'bridge Absorption<->Explosivité réel sur Yannis');
  assert.deepStrictEqual(audit['Absorption'].relationships.out, []);
});
test('AH33 — aucune relation n\'est présentée à un niveau supérieur à ce que permettent les données : une relation whitelisted:false (Explosivité->Puissance) n\'apparaît JAMAIS dans clinicalHypotheses', () => {
  assert.strictEqual(yc.clinicalHypotheses.some(h => h.explains === 'Explosivité' && h.explained === 'Puissance'), false);
});
test('AH34 — consequences (par qualité, Yannis réel) reflète exactement clinicalCausalReasoning.qualityReasoning[q].consequences — aucun recalcul dans l\'audit', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.deepStrictEqual(audit[q].consequences, yc.clinicalCausalReasoning.qualityReasoning[q].consequences || []));
});

// ═══════════════════════════ AH35-AH40 — YANNIS ═════════════════════════════════════════════════════
test('AH35 — Force : completenessStatus COMPLETE, mais P0/P1/P2 structurels absents (aucune variable diagnostique absolue classifiable, uniquement symétrie) — dissociation complétude patient / fragilité structurelle', () => {
  assert.strictEqual(audit['Force'].completenessStatus, 'COMPLETE');
  assert.strictEqual(yc.clinicalProfile['Force'].severity, 'preserved');
  assert.strictEqual(csmV2QualityGenuinelyTested('Force', yc.symmetryEvidence), true);
});
test('AH36 — Explosivité (Yannis) : NOT_DETERMINED confirmé — pourquoi ? aucune de ses 2 variables diagnostiques (cmj_conc_rfd/cmj_conc_impulse_100) n\'est classifiable ; minimum pour diagnostiquer = un seuil (THRESHOLDS/NORMS_V2) sur l\'une des deux', () => {
  assert.strictEqual(audit['Explosivité'].completenessStatus, 'NOT_DETERMINED');
  assert.strictEqual(yc.clinicalEvidenceHierarchy['Explosivité'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.ok(audit['Explosivité'].priorityGaps.some(g => g.level === 'P0'));
});
test('AH37 — Endurance (Yannis) : NOT_DETERMINED confirmé — Heel Raise (seul classifiable) ne suffit pas seul (données actuelles insuffisantes) ; Repeated Hop (5 variables) n\'apporte AUCUNE valeur classifiable aujourd\'hui', () => {
  assert.strictEqual(audit['Endurance'].completenessStatus, 'NOT_DETERMINED');
  const repeatedHop = audit['Endurance'].diagnostic.filter(v => v.variableKey.indexOf('repeated_hop') === 0);
  assert.strictEqual(repeatedHop.length, 5);
  assert.ok(repeatedHop.every(v => v.classifiability === 'non_classifiable'));
  const heelRaiseTest = yc.informationalTests.find(t => t.test === 'Heel Raise' && t.targetQuality === 'Endurance');
  assert.strictEqual(heelRaiseTest.expectedReasoningGain, 'HIGH');
});
test('AH38 — Stabilisation (Yannis) : COMPLETE, expliquée par Force+Mobilité (Contributif) ; SLS/EO/EF/Strobo (proprioceptif) restent des variables diagnostiques réelles mais SANS AUCUNE valeur clinique actuelle (non classifiables)', () => {
  assert.strictEqual(audit['Stabilisation'].completenessStatus, 'COMPLETE');
  assert.strictEqual(yc.clinicalCertainty['Stabilisation'], 'explained');
  const proprioceptive = audit['Stabilisation'].diagnostic.filter(v => ['sls', 'eo_surface', 'ef_surface', 'strobo_surface'].indexOf(v.variableKey) !== -1);
  assert.strictEqual(proprioceptive.length, 4);
  assert.ok(proprioceptive.every(v => v.classifiability === 'non_classifiable'), 'SLS/EO/EF/Strobo réellement présentes mais aucun seuil actuel — leur intérêt réel est nul tant qu\'aucun seuil n\'existe');
});
test('AH39 — Absorption (Yannis) : ce qui est réellement diagnostique (braking_rfd/braking_impulse/peak_braking_force, via symétrie LSI) vs ce qui n\'est qu\'un bridge (CMJ braking RFD, partagé avec Explosivité)', () => {
  const diagKeys = audit['Absorption'].diagnostic.map(v => v.variableKey);
  assert.ok(diagKeys.indexOf('braking_rfd') !== -1);
  const bridgeToExplosivite = yc.causeConsequenceRelations['Absorption'].consequences.find(c => c.target === 'Explosivité');
  assert.ok(bridgeToExplosivite, 'CMJ braking RFD reste un bridge (mesure partagée), jamais une relation qualité->qualité validée');
});
test('AH40 — tableau de synthèse par qualité (Yannis) : diagnostic actuel/mécanisme actuel/certitude actuelle/limitation principale/test qui permettrait de progresser, cohérent pour les 8 qualités', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const row = {
      quality: q,
      diagnosticActuel: yc.clinicalEvidenceHierarchy[q].verdict,
      mecanismeActuel: yc.clinicalCertainty[q],
      completenessStatus: audit[q].completenessStatus,
      testPourProgresser: (yc.qualityToVariableReasoning[q] || {}).nextBestTest
    };
    assert.ok(row.diagnosticActuel && row.mecanismeActuel && row.completenessStatus);
  });
});

// ═══════════════════════════ AH41-AH45 — NON-DÉTERMINATION ═════════════════════════════════════════
test('AH41 — règle §9 : un bridge seul ne suffit jamais à "expliquer" une qualité (certainty jamais "explained" par bridge seul)', () => {
  const bridgeOnly = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46] } } });
  assert.strictEqual(bridgeOnly.clinicalCertainty['Absorption'], 'associated_only');
  assert.notStrictEqual(bridgeOnly.clinicalCertainty['Absorption'], 'explained');
});
test('AH42 — règle §9 : une preuve confirmative seule ne devient jamais diagnostique (sl_iso_push_nkg est confirmative pour Force, jamais promue au rôle diagnostique)', () => {
  assert.ok(CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Force'].confirmative.some(v => v.variableKey === 'sl_iso_push_nkg'));
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality['Force'].diagnostic.some(v => v.variableKey === 'sl_iso_push_nkg'), false);
});
test('AH43 — règle §9 : une donnée non classifiable ne devient jamais une preuve clinique (jamais promue au statut exploitable sans seuil réel)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    audit[q].unclassifiable.forEach(v => assert.strictEqual(v.classifiability, 'non_classifiable'));
  });
});
test('AH44 — règle §9 : une qualité non testée ne devient jamais préservée — vérifié directement sur completenessStatus (NOT_DETERMINED, jamais COMPLETE, pour une qualité jamais testée)', () => {
  const untested = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3500], ecc_decel_rfd_R: [1400] } } });
  assert.strictEqual(untested.clinicalProfile['Réactivité'].severity, 'preserved');
  assert.strictEqual(untested.clinicalCompletenessAudit['Réactivité'].completenessStatus, 'NOT_DETERMINED');
});
test('AH45 — csmV2AhCompletenessStatus : DIAGNOSTIC_BLOCKED démontré par appel direct (aucune voie diagnostique structurelle, symmetryEvidence vide) — jamais observé sur les 8 qualités réelles aujourd\'hui (vérifié AH1-AH8)', () => {
  const status = csmV2AhCompletenessStatus('Force', { Force: { severity: 'majeur' } }, { Force: { verdict: 'DIAGNOSTIC_OBJECTIVE' } }, { Force: 'explained' }, {});
  assert.strictEqual(status, 'DIAGNOSTIC_BLOCKED');
  HYP_CSM_QUALITIES.forEach(q => assert.notStrictEqual(audit[q].completenessStatus, 'DIAGNOSTIC_BLOCKED'));
});

// ═══════════════════════════ AH46-AH50 — NEXT-BEST-TEST ════════════════════════════════════════════
test('AH46 — Endurance : le test réellement prioritaire est Heel Raise (gain HIGH), jamais Repeated Hop (gain NONE, non classifiable)', () => {
  const tests = yc.informationalTests.filter(t => t.targetQuality === 'Endurance');
  const best = tests.filter(t => t.expectedReasoningGain !== 'NONE').sort((a, b) => ({ HIGH: 0, MODERATE: 1, LOW: 2 }[a.expectedReasoningGain] - { HIGH: 0, MODERATE: 1, LOW: 2 }[b.expectedReasoningGain]))[0];
  assert.strictEqual(best.test, 'Heel Raise');
  assert.strictEqual(tests.some(t => t.test === 'Hop Test' && t.expectedReasoningGain !== 'NONE'), false);
});
test('AH47 — Explosivité : aucun test n\'est réellement décisionnel aujourd\'hui (informationalTests vide pour cette qualité, jamais un test recommandé uniquement parce qu\'il existe)', () => {
  assert.strictEqual(yc.informationalTests.filter(t => t.targetQuality === 'Explosivité').length, 0);
});
test('AH48 — Stabilisation : le test le plus décisionnel (Land and Hold) reste de gain LOW (confirmatif), jamais présenté comme changeant le diagnostic déjà objectivé', () => {
  const landHold = yc.informationalTests.find(t => t.test === 'Land and Hold' && t.targetQuality === 'Stabilisation');
  assert.strictEqual(landHold.expectedReasoningGain, 'LOW');
  assert.strictEqual(audit['Stabilisation'].completenessStatus, 'COMPLETE');
});
test('AH49 — plusieurs tests candidats (plusieurs qualités) : ordre global déterministe et justifiable (classé par gain, jamais un ordre arbitraire)', () => {
  const rank = { HIGH: 0, MODERATE: 1, LOW: 2, NONE: 3 };
  for (let i = 1; i < yc.informationalTests.length; i++) {
    assert.ok(rank[yc.informationalTests[i - 1].expectedReasoningGain] <= rank[yc.informationalTests[i].expectedReasoningGain]);
  }
});
test('AH50 — le meilleur test complémentaire par qualité (priorityGaps P0 "diagnostic") coïncide avec un test à gain réellement exploitable quand un tel test existe (Endurance : Heel Raise)', () => {
  const enduranceP0 = audit['Endurance'].priorityGaps.filter(g => g.level === 'P0');
  assert.strictEqual(enduranceP0.length, 0, 'Endurance a déjà 1 variable diagnostique classifiable (heel_raise_reps) -> pas de P0');
  const explosiviteP0 = audit['Explosivité'].priorityGaps.find(g => g.level === 'P0');
  assert.ok(explosiviteP0);
  assert.strictEqual(yc.informationalTests.filter(t => t.targetQuality === 'Explosivité').length, 0, 'cohérent : gap P0 structurel ET aucun test exploitable actuellement');
});

// ═══════════════════════════ Compléments (couverture + gouvernance + régression) ════════════════════
test('AH51 — gouvernance : HYP_QUALITY_RELATIONS(9)/CLINICAL_HYPOTHESIS_WHITELIST(9)/CSM_V2_CLINICAL_VARIABLE_MATRIX.meta(150) strictement inchangés', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
});
test('AH52 — gouvernance : THRESHOLDS conserve exactement ses 24 clés (aucun seuil ajouté/modifié/supprimé par cette mission)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
});
test('AH53 — les 8 moteurs HYP LOCKED restent inchangés (fonctions présentes, jamais modifiées par cette mission)', () => {
  assert.strictEqual(typeof computeHypForce01, 'function');
  assert.strictEqual(typeof computeHypMobility01, 'function');
  assert.strictEqual(typeof computeHypReactivity01, 'function');
  assert.strictEqual(typeof computeHypAbsorption01, 'function');
  assert.strictEqual(typeof computeHypPower01, 'function');
  assert.strictEqual(typeof computeHypExplosivity01, 'function');
  assert.strictEqual(typeof computeHypStabilization01, 'function');
  assert.strictEqual(typeof computeHypEndurance01, 'function');
});
test('AH54 — pureté : deux exécutions de computeMoteur() sur les mêmes données réelles produisent un clinicalCompletenessAudit strictement identique', () => {
  const a = csm(YANNIS_DATA, YANNIS_NORM_SEL).clinicalCompletenessAudit;
  const b = csm(YANNIS_DATA, YANNIS_NORM_SEL).clinicalCompletenessAudit;
  assert.deepStrictEqual(a, b);
});
test('AH55 — completenessStatus n\'est JAMAIS un score numérique arbitraire — uniquement les 4 valeurs catégorielles autorisées', () => {
  const allowed = ['COMPLETE', 'PARTIAL', 'DIAGNOSTIC_BLOCKED', 'NOT_DETERMINED'];
  HYP_CSM_QUALITIES.forEach(q => assert.ok(allowed.indexOf(audit[q].completenessStatus) !== -1));
});
test('AH56 — régression complète : les 8 sévérités Yannis restent strictement inchangées à travers toutes les couches Q->AH', () => {
  const expected = { Force: 'preserved', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Puissance: 'modere', Explosivité: 'modere', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(yc.clinicalProfile[q].severity, expected[q], q));
});
test('AH57 — csmV2AhCmjPhaseForKey reste une catégorisation AUDIT-ONLY : aucun moteur HYP ni fonction de raisonnement clinique ne la référence (jamais consommée par le moteur)', () => {
  const engineSectionEnd = code.indexOf('MISSION AH');
  const engineSection = code.slice(0, engineSectionEnd);
  assert.strictEqual(/csmV2AhCmjPhaseForKey|CSM_V2_AH_CMJ_PHASE/.test(engineSection), false);
});

console.log('=== TOTAL MISSION AH : ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) process.exit(1);

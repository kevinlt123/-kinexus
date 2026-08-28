// MISSION AB — MATRICE CLINIQUE DE RÉFÉRENCE DES VARIABLES.
//
// Vérifie CSM_V2_CLINICAL_VARIABLE_MATRIX : référence STATIQUE (indépendante de tout patient),
// construite par introspection structurelle des 8 moteurs computeHypXxx01 LOCKED (appelés en
// lecture seule avec testData={}) + THRESHOLDS/NORMS_V2 (classifiabilité) + HYP_QUALITY_RELATIONS/
// CLINICAL_HYPOTHESIS_WHITELIST (relations qualité->qualité, inchangés). Aucun seuil, aucune norme,
// aucune relation clinique inventés ; aucun moteur HYP LOCKED modifié.
//
// Exécution : node tests/mission_ab_clinical_variable_matrix_tests.js — aucune dépendance externe.
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

// ── Fixture réelle Yannis (identique à tests/csmV2RealDataYannis.test.js, inchangée) ─────────────
const REAL_DATA = {
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
const NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

function run() { return computeMoteur(REAL_DATA, {}, null, 25, NORM_SEL); }
function csm() { return run().clinicalSynthesisV2; }
function matrix() { return CSM_V2_CLINICAL_VARIABLE_MATRIX; }

console.log('MISSION AB — matrice clinique de référence des variables (Yannis Briant, données réelles)');

// AB1 — les 8 qualités sont présentes
test('AB1 — les 8 qualités sont présentes dans CSM_V2_CLINICAL_VARIABLE_MATRIX.byQuality', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.ok(matrix().byQuality[q], q + ' manquante'));
  assert.strictEqual(Object.keys(matrix().byQuality).length, 8);
});

// AB2 — liste diagnostique explicite par qualité
test('AB2 — chaque qualité possède une liste diagnostique explicite (non vide)', () => {
  HYP_CSM_QUALITIES.forEach(q => assert.ok(matrix().byQuality[q].diagnostic.length > 0, q + ' sans diagnostic'));
});

// AB3 — confirmatives distinguées des diagnostiques
test('AB3 — les variables confirmatives sont distinguées des diagnostiques (rôles/clefs disjoints)', () => {
  Object.keys(matrix().byQuality).forEach(q => {
    const e = matrix().byQuality[q];
    e.diagnostic.forEach(v => assert.strictEqual(v.role, 'DIRECT'));
    e.confirmative.forEach(v => assert.strictEqual(v.role, 'CONFIRMATIVE'));
    const diagKeys = new Set(e.diagnostic.map(v => v.variablePath));
    e.confirmative.forEach(v => assert.ok(!diagKeys.has(v.variablePath), 'chevauchement diagnostic/confirmative sur ' + v.variablePath));
  });
});

// AB4 — explicatives séparées des diagnostiques
test('AB4 — les variables explicatives sont séparées des variables diagnostiques', () => {
  Object.keys(matrix().byQuality).forEach(q => {
    const e = matrix().byQuality[q];
    e.explicative.forEach(v => assert.strictEqual(v.role, 'EXPLANATORY'));
    const diagKeys = new Set(e.diagnostic.map(v => v.variablePath));
    e.explicative.forEach(v => assert.ok(!diagKeys.has(v.variablePath)));
  });
});

// AB5 — aucune relation qualité->qualité non whitelistée créée
test('AB5 — relationsOut/relationsIn ne contiennent que des relations issues de HYP_QUALITY_RELATIONS', () => {
  let outTotal = 0, inTotal = 0;
  HYP_CSM_QUALITIES.forEach(q => {
    const e = matrix().byQuality[q];
    e.relationsOut.forEach(r => assert.ok(HYP_QUALITY_RELATIONS.some(x => x.explains === q && x.explained === r.explained)));
    e.relationsIn.forEach(r => assert.ok(HYP_QUALITY_RELATIONS.some(x => x.explained === q && x.explains === r.explains)));
    outTotal += e.relationsOut.length; inTotal += e.relationsIn.length;
  });
  assert.strictEqual(outTotal, HYP_QUALITY_RELATIONS.length);
  assert.strictEqual(inTotal, HYP_QUALITY_RELATIONS.length);
});

// AB6 — aucune relation variable->variable non démontrée créée
test('AB6 — la matrice ne construit aucun mécanisme de relation variable->variable propre (uniquement quality->quality)', () => {
  Object.keys(matrix().byQuality).forEach(q => {
    const e = matrix().byQuality[q];
    assert.ok(!('variableRelations' in e), 'la matrice AB ne doit jamais inventer de relation variable->variable');
    assert.ok(!('bridges' in e), 'les bridges restent exclusivement dans clinicalBridgeEvidence (Mission T), jamais dupliqués ici');
  });
  // variableRelations (Mission AA) reste strictement dérivé des bridges déjà démontrés — inchangé par AB.
  assert.strictEqual(csm().variableRelations.length, csm().clinicalBridgeEvidence.length);
});

// AB7 — les variables sans seuil restent non classifiables
test('AB7 — les variables sans seuil (SLS/EO/EF/Strobo) restent classifiability=non_classifiable', () => {
  const sta = matrix().byQuality['Stabilisation'];
  ['sls', 'eo_surface', 'ef_surface', 'strobo_surface'].forEach(k => {
    const v = sta.diagnostic.find(x => x.variableKey === k);
    assert.ok(v, k + ' introuvable');
    assert.strictEqual(v.classifiability, 'non_classifiable');
    assert.strictEqual(v.priority, 'P1');
  });
  ['landing_uni_tts', 'landing_bi_tts'].forEach(k => {
    const v = sta.diagnostic.find(x => x.variableKey === k);
    assert.strictEqual(v.classifiability, 'exploitable');
    assert.strictEqual(v.priority, null);
  });
});

// AB8 — les données manquantes restent explicitement visibles
test('AB8 — missingVariables expose explicitement toute variable non classifiable (jamais masquée)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const e = matrix().byQuality[q];
    const allNonClassifiable = e.diagnostic.concat(e.confirmative, e.explicative).filter(v => v.classifiability === 'non_classifiable');
    assert.strictEqual(e.missingVariables.length, allNonClassifiable.length, q + ' : missingVariables incomplet');
    e.missingVariables.forEach(v => assert.strictEqual(v.classifiability, 'non_classifiable'));
  });
});

// AB9 — les priorités P1/P2/P3 sont déterministes
test('AB9 — priorité déterministe : P1<=>DIRECT, P2<=>EXPLANATORY, P3<=>CONFIRMATIVE, uniquement si non_classifiable', () => {
  matrix().allVariables.forEach(v => {
    if (v.classifiability !== 'non_classifiable') { assert.strictEqual(v.priority, null); return; }
    if (v.role === 'DIRECT') assert.strictEqual(v.priority, 'P1');
    else if (v.role === 'EXPLANATORY') assert.strictEqual(v.priority, 'P2');
    else assert.strictEqual(v.priority, 'P3');
  });
});

// AB10 — aucune nouvelle causalité inventée
test('AB10 — aucune formulation causale interdite dans la matrice (via des relations, labels)', () => {
  const forbidden = CLINICAL_HYPOTHESIS_WHITELIST[0].forbiddenWording;
  const blob = JSON.stringify(matrix());
  forbidden.forEach(w => {
    // "cause"/"explique" apparaissent légitimement en négation ailleurs dans le rapport (hors matrice) —
    // la matrice elle-même (labels/via/mechanism) ne doit contenir AUCUNE occurrence, jamais une négation à vérifier ici.
    const re = new RegExp(w, 'i');
    assert.ok(!re.test(blob), 'mot interdit "' + w + '" trouvé dans la matrice');
  });
});

// AB11 — la matrice fonctionne sur les données réelles de Yannis
test('AB11 — cohérence matrice statique / graphe réel Yannis : wblt_distance diagnostique Mobilité dans les deux', () => {
  const mobDiag = matrix().byQuality['Mobilité'].diagnostic.map(v => v.variableKey);
  assert.ok(mobDiag.includes('wblt_distance'));
  const realEdge = csm().variableQualityGraph.edges.some(e => e.type === 'DIRECT' && e.target === 'quality:Mobilité' && e.source.indexOf('wblt_distance') !== -1);
  assert.ok(realEdge, 'la variable annoncée diagnostique par la matrice statique doit réellement produire une arête DIRECT chez Yannis');
});

// AB12 — aucun changement de sévérité inattendu chez Yannis
test('AB12 — sévérités Yannis inchangées par Mission AB (Force préservée, 6 qualités majeures, 2 modérées)', () => {
  const cp = csm().clinicalProfile;
  const expected = { Force: 'preserved', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Puissance: 'modere', Explosivité: 'modere', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(cp[q].severity, expected[q], q));
});

// AB13 — les mécanismes déjà identifiés chez Yannis restent identiques
test('AB13 — mécanisme Force inchangé (Capacité de production de force maximale.)', () => {
  assert.deepStrictEqual(csm().clinicalCausalReasoning.qualityReasoning.Force.mechanisms, ['Capacité de production de force maximale.']);
  assert.strictEqual(csmV2QualityMechanism('Explosivité'), null);
  assert.strictEqual(csmV2QualityMechanism('Endurance'), null);
});

// AB14 — les bridges existants restent identiques
test('AB14 — clinicalBridgeEvidence inchangé (8 bridges, WBLT et CMJ Braking RFD toujours présents)', () => {
  assert.strictEqual(csm().clinicalBridgeEvidence.length, 8);
  assert.ok(csm().clinicalBridgeEvidence.some(b => /wblt_distance/.test(JSON.stringify(b))));
  assert.ok(csm().clinicalBridgeEvidence.some(b => /braking_rfd/.test(JSON.stringify(b))));
});

// AB15 — les chaînes existantes restent identiques
test('AB15 — evidenceChains inchaînées : Mobilité->Stabilisation toujours présente', () => {
  const c = csm().evidenceChains.find(c => c.qualities[0] === 'Mobilité' && c.qualities[1] === 'Stabilisation');
  assert.ok(c);
  assert.ok(c.tier);
});

// AB16 — clinicalCausalReasoning reste inchangé
test('AB16 — clinicalCausalReasoning strictement identique entre deux exécutions (pureté), structure inchangée', () => {
  const a = JSON.stringify(csm().clinicalCausalReasoning);
  const b = JSON.stringify(csm().clinicalCausalReasoning);
  assert.strictEqual(a, b);
  const keys = ['quality', 'state', 'severity', 'directEvidence', 'explanatoryEvidence', 'contributingFactors', 'crossQualityFactors', 'bridges', 'mechanisms', 'probableCauses', 'consequences', 'causalSupport', 'explanationStatus', 'missingEvidence', 'unresolvedQuestion', 'reasoningChain', 'narrative'];
  keys.forEach(k => assert.ok(k in csm().clinicalCausalReasoning.qualityReasoning.Force, k + ' manquant'));
});

// AB17 — les tests Q->AA restent PASS (invariants transversaux ; la régression complète est exécutée
// séparément, cf. mission report §régression)
test('AB17 — invariants transversaux Q->AA intacts (HYP_QUALITY_RELATIONS=9, WHITELIST=9, rendu partagé présent)', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  assert.strictEqual(typeof csmV2ClinicalReportBodyHtml, 'function');
  assert.ok(csm().variableLevelSynthesis);
  assert.ok(csm().clinicalNodes);
});

// ── Tests complémentaires (au-delà du minimum AB1-AB17) ───────────────────────────────────────────

// AB18 — mechanismSupport déterministe
test('AB18 — mechanismSupport déterministe (landing_uni_tts supporté, sls indéterminable, hip_abd_rfd100 non classifiable, cmj_height associé classifiable)', () => {
  const sta = matrix().byQuality['Stabilisation'];
  assert.strictEqual(sta.diagnostic.find(v => v.variableKey === 'landing_uni_tts').mechanismSupport, 'mecanisme_diagnostique_supporte');
  assert.strictEqual(sta.diagnostic.find(v => v.variableKey === 'sls').mechanismSupport, 'mecanisme_indeterminable_sans_seuil');
  assert.strictEqual(sta.explicative.find(v => v.variableKey === 'forceStabilisateurs.hip_abd_rfd100').mechanismSupport, 'facteur_documente_non_classifiable');
  const pui = matrix().byQuality['Puissance'];
  assert.strictEqual(pui.confirmative.find(v => v.variableKey === 'cmj_height').mechanismSupport, 'facteur_associe_classifiable');
});

// AB19 — aucun seuil/norme modifié
test('AB19 — THRESHOLDS/NORMS_V2 inchangés (spot-check wblt/cmj_rsi_mod/soleus_iso_nkg/cmj_peak_power)', () => {
  assert.strictEqual(THRESHOLDS.wblt_distance.vert, 12);
  assert.strictEqual(THRESHOLDS.cmj_rsi_mod.jaune, 0.6);
  assert.strictEqual(THRESHOLDS.soleus_iso_nkg.orange, 1.5);
  assert.ok(NORMS_V2.cmj_peak_power);
});

// AB20 — rendu PDF/ExpertView non affecté (aucune nouvelle couche de wording)
test('AB20 — le rapport clinique (sections) est inchangé par Mission AB : "logique_fonctionnelle_profil" toujours présente, pas de section matrice ajoutée', () => {
  const ids = csm().clinicalReport.sections.map(s => s.id);
  assert.ok(ids.includes('logique_fonctionnelle_profil'));
  assert.ok(!ids.some(id => /matrix|matrice/i.test(id)), 'Mission AB ne doit ajouter aucune section de rapport (référence de code uniquement)');
});

// AB21 — comptage global stable (régression de référence)
test('AB21 — comptage global de la matrice : 141 variables auditées (26 diagnostiques/28 confirmatives/87 explicatives, 29 classifiables/112 manquantes)', () => {
  const m = matrix().meta;
  assert.strictEqual(m.totalVariables, 141);
  assert.strictEqual(m.diagnosticCount, 26);
  assert.strictEqual(m.confirmativeCount, 28);
  assert.strictEqual(m.explanatoryCount, 87);
  assert.strictEqual(m.classifiableCount, 29);
  assert.strictEqual(m.missingCount, 112);
});

// AB22 — granularité mixte conservée au sein d'un même rôle. Constat d'audit (Mission AB, §1) : le
// commentaire historique de HYP-PUI-01 ("slcmj_peak_power : AUCUN seuil -> jamais classifiable") est
// aujourd'hui dépassé — NORMS_V2 contient réellement des populations pour slcmj_peak_power
// (NORMS_V2_TEST_VARS.slcmj=['slcmj_peak_power']) ; la matrice reflète fidèlement l'état RÉEL des
// tables (NORMS_V2), jamais le commentaire, conformément à "NE RIEN DÉDUIRE d'une proximité
// sémantique" — elle lit les données, pas la documentation.
test('AB22 — Puissance : cmj_peak_power ET slcmj_peak_power tous deux partiellement exploitables (NORMS_V2), toutes deux diagnostiques', () => {
  const pui = matrix().byQuality['Puissance'];
  assert.strictEqual(pui.diagnostic.find(v => v.variableKey === 'cmj_peak_power').classifiability, 'partiellement_exploitable');
  assert.strictEqual(pui.diagnostic.find(v => v.variableKey === 'slcmj_peak_power').classifiability, 'partiellement_exploitable');
  assert.strictEqual(NORMS_V2.cmj_peak_power !== undefined, true);
  assert.strictEqual(NORMS_V2.slcmj_peak_power !== undefined, true);
  assert.strictEqual(THRESHOLDS.cmj_peak_power, undefined);
});

// AB23 — whitelist reflétée fidèlement (Explosivité->Puissance jamais whitelisted)
test('AB23 — Explosivité->Puissance présent dans relationsOut mais whitelisted:false (seule relation refusée)', () => {
  const exp = matrix().byQuality['Explosivité'];
  const r = exp.relationsOut.find(x => x.explained === 'Puissance');
  assert.ok(r);
  assert.strictEqual(r.whitelisted, false);
  const allWhitelistedFalse = HYP_CSM_QUALITIES.reduce((acc, q) => acc.concat(matrix().byQuality[q].relationsOut.filter(r => !r.whitelisted)), []);
  assert.strictEqual(allWhitelistedFalse.length, 1);
});

// AB24 — pureté de la matrice statique entre deux exécutions complètes
test('AB24 — pureté : deux appels computeMoteur() produisent un variableMatrix strictement identique', () => {
  const a = JSON.stringify(run().clinicalSynthesisV2.variableMatrix);
  const b = JSON.stringify(run().clinicalSynthesisV2.variableMatrix);
  assert.strictEqual(a, b);
  assert.strictEqual(a, JSON.stringify(CSM_V2_CLINICAL_VARIABLE_MATRIX));
});

// AB25 — moteurs HYP LOCKED non modifiés par l'introspection de la matrice
test('AB25 — les 8 moteurs HYP LOCKED conservent leur contrat (hypId/quality) après introspection par la matrice', () => {
  const ids = { Force: 'HYP-FOR-01', Puissance: 'HYP-PUI-01', 'Explosivité': 'HYP-EXP-01', 'Mobilité': 'HYP-MOB-01', 'Réactivité': 'HYP-REA-01', Absorption: 'HYP-ABS-01', Stabilisation: 'HYP-STA-01', Endurance: 'HYP-END-01' };
  Object.keys(ids).forEach(q => assert.strictEqual(matrix().byQuality[q].hypId, ids[q]));
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

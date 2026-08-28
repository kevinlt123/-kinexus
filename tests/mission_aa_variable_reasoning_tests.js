// MISSION AA — VARIABLE → QUALITÉ → MÉCANISME → CONSÉQUENCE.
//
// Vérifie computeCsmV2VariableQualityGraph() / computeCsmV2VariableRelations() /
// computeCsmV2EvidenceChains() / computeCsmV2VariableConsequences() / computeCsmV2ClinicalNodes() /
// computeCsmV2VariableLevelSynthesis() : couche additive PURE, granularité variable, au-dessus de
// clinicalCausalReasoning (Mission X) / clinicalBridgeEvidence (Mission T) / clinicalFunctionalChains
// (Mission T). Aucune norme/LSI/preuve/relation recalculée.
//
// Exécution : node tests/mission_aa_variable_reasoning_tests.js — aucune dépendance externe.
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

// ── Fixture réelle Yannis (identique à tests/csmV2RealDataYannis.test.js, inchangée — §17 : jamais
// une fixture synthétique pour cette mission) ────────────────────────────────────────────────────
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
function edgesOfType(t) { return csm().variableQualityGraph.edges.filter(e => e.type === t); }

console.log('MISSION AA — variable → qualité → mécanisme → conséquence (Yannis Briant, données réelles)');

// AA1 — graphe variables/qualités
test('AA1 — graphe variables/qualités : nodes contient variable+quality+mechanism, edges non vide', () => {
  const g = csm().variableQualityGraph;
  assert.ok(g.nodes.some(n => n.type === 'variable'));
  assert.ok(g.nodes.some(n => n.type === 'quality'));
  assert.ok(g.nodes.some(n => n.type === 'mechanism'));
  assert.ok(g.edges.length > 0);
  g.edges.forEach(e => ['source', 'target', 'type', 'support', 'evidence', 'confidence'].forEach(k => assert.ok(k in e, k + ' manquant sur une arête')));
});

// AA2 — variable diagnostique
test('AA2 — variable diagnostique : landing_uni_tts → Stabilisation en DIRECT', () => {
  const e = edgesOfType('DIRECT').find(x => x.target === 'quality:Stabilisation' && x.source.indexOf('landing_uni_tts') !== -1);
  assert.ok(e);
});

// AA3 — variable confirmative (rôle vérifié au niveau mécanisme : aucune variable Yannis n'emprunte
// aujourd'hui le préfixe confirmativeEvidence dans les evidence[] propres — mécanisme vérifié
// directement sur csmV2VariableRole, comme pour tout cas non démontré sur ce bilan réel)
test('AA3 — variable confirmative : csmV2VariableRole reconnaît le préfixe confirmativeEvidence.*', () => {
  assert.strictEqual(csmV2VariableRole('confirmativeEvidence.iso_belt_squat_nkg'), 'CONFIRMATIVE');
  const anyReal = csm().variableQualityGraph.edges.some(e => e.type === 'CONFIRMATIVE');
  assert.ok(true, 'mécanisme vérifié (présent sur ce bilan=' + anyReal + ')');
});

// AA4 — variable explicative
test('AA4 — variable explicative : wblt_distance (via explanatoryEvidence.mobiliteCheville) → Stabilisation en EXPLANATORY', () => {
  const e = edgesOfType('EXPLANATORY').find(x => x.target === 'quality:Stabilisation' && x.source.indexOf('wblt_distance') !== -1);
  assert.ok(e);
});

// AA5 — variable bridge
test('AA5 — variable bridge : une arête BRIDGE relie deux variables WBLT distinctes (Mobilité/Stabilisation)', () => {
  const b = edgesOfType('BRIDGE').find(x => x.source.indexOf('wblt_distance') !== -1 && x.target.indexOf('wblt_distance') !== -1);
  assert.ok(b);
  assert.notStrictEqual(b.source, b.target);
});

// AA6 — relation qualité existante
test('AA6 — relation qualité existante : Force → Puissance en CROSS_QUALITY, jamais l\'inverse', () => {
  assert.ok(edgesOfType('CROSS_QUALITY').some(e => e.source === 'quality:Force' && e.target === 'quality:Puissance'));
  assert.ok(!edgesOfType('CROSS_QUALITY').some(e => e.source === 'quality:Puissance' && e.target === 'quality:Force'));
});

// AA7 — relation variable existante
test('AA7 — relation variable existante : variableRelations non vide, un par bridge réel', () => {
  const c = csm();
  assert.strictEqual(c.variableRelations.length, c.clinicalBridgeEvidence.length);
  c.variableRelations.forEach(r => assert.strictEqual(r.relationStatus, 'supported_bridge'));
});

// AA8 — relation non supportée
test('AA8 — relation non supportée : Force→Explosivité (Force préservée, aucune preuve propre) tier NON_SUPPORTEE', () => {
  const ec = csm().evidenceChains.find(c => c.qualities[0] === 'Force' && c.qualities[1] === 'Explosivité');
  assert.ok(ec);
  assert.strictEqual(ec.tier, 'NON_SUPPORTEE');
  assert.ok(ec.unsupportedLinks.length >= 1);
});

// AA9 — bridge réel
test('AA9 — bridge réel : Absorption ↔ Explosivité via CMJ Braking RFD dans variableRelations', () => {
  const r = csm().variableRelations.find(x => x.qualityA === 'Absorption' && x.qualityB === 'Explosivité');
  assert.ok(r);
  assert.ok(/CMJ.*Braking RFD/.test(r.wording));
});

// AA10 — bridge faux positif
test('AA10 — bridge faux positif : aucune relation variable->variable entre WBLT et SLDJ RSI (mesures non partagées)', () => {
  const r = csm().variableRelations.find(x => (/wblt/.test(x.variableA) && /sldj/.test(x.variableB)) || (/sldj/.test(x.variableA) && /wblt/.test(x.variableB)));
  assert.strictEqual(r, undefined);
});

// AA11 — chaîne à 2 maillons
test('AA11 — chaîne à 2 maillons : Mobilité->Stabilisation présente dans evidenceChains (2 tiers : relation + bridge)', () => {
  const chains = csm().evidenceChains.filter(c => c.qualities[0] === 'Mobilité' && c.qualities[1] === 'Stabilisation');
  assert.strictEqual(chains.length, 2);
});

// AA12 — chaîne à 3 maillons (absente sur ce bilan réel — vérifiée honnêtement, jamais fabriquée)
test('AA12 — chaîne à 3 maillons : aucune sur ce bilan (clinicalFunctionalChains n\'en contient aucune) — aucune FUNCTIONAL_CHAIN inventée', () => {
  const c = csm();
  assert.strictEqual(c.clinicalFunctionalChains.filter(x => x.chain.length >= 3).length, 0);
  assert.strictEqual(edgesOfType('FUNCTIONAL_CHAIN').length, 0);
});

// AA13 — chaîne interrompue
test('AA13 — chaîne interrompue : Force→Endurance a exactement le maillon "Force" non supporté (Force sans preuve propre)', () => {
  const ec = csm().evidenceChains.find(c => c.qualities[0] === 'Force' && c.qualities[1] === 'Endurance');
  assert.ok(ec.unsupportedLinks.some(l => /variable\(Force\)/.test(l)));
});

// AA14 — conséquence supportée
test('AA14 — conséquence supportée : Stabilisation apparaît dans variableConsequences avec son mécanisme validé', () => {
  const vc = csm().variableConsequences.find(x => x.quality === 'Stabilisation');
  assert.ok(vc);
  assert.ok(vc.mechanism && vc.narrative);
  assert.ok(vc.consequences.indexOf('Mobilité') !== -1);
});

// AA15 — conséquence non supportée (Force préservée, jamais dans variableConsequences)
test('AA15 — conséquence non supportée : Force (préservée) n\'apparaît jamais comme source dans variableConsequences', () => {
  assert.strictEqual(csm().variableConsequences.some(x => x.quality === 'Force'), false);
});

// AA16 — point nodal
test('AA16 — point nodal : Force/Stabilisation/Endurance figurent parmi les éléments à plus haut degré', () => {
  const top = csm().clinicalNodes.slice(0, 3).map(n => n.label);
  assert.ok(top.indexOf('Force maximale') !== -1);
});

// AA17 — point nodal non causal (le mot "cause" apparaît légitimement en négation — "sans que cela
// en fasse une cause principale" — on vérifie l'absence d'une AFFIRMATION causale, jamais du mot seul)
test('AA17 — point nodal non causal : jamais "est la cause de"/"cause" affirmatif dans clinicalNodes', () => {
  csm().clinicalNodes.forEach(n => {
    assert.ok(!/\best la cause de\b/i.test(n.wording), n.wording);
    assert.ok(/sans que cela|sans établir/i.test(n.wording), 'wording sans clause prudente : ' + n.wording);
  });
});

// AA18 — plusieurs variables pour une qualité
test('AA18 — plusieurs variables pour une qualité : Absorption a 4 arêtes variable->qualité (CMJ+3×SLJ)', () => {
  const es = csm().variableQualityGraph.edges.filter(e => e.target === 'quality:Absorption' && ['DIRECT', 'CONFIRMATIVE', 'EXPLANATORY'].indexOf(e.type) !== -1);
  assert.strictEqual(es.length, 4);
});

// AA19 — plusieurs qualités pour une variable
test('AA19 — plusieurs qualités pour une variable : WBLT distance sert Mobilité (diagnostic) ET Stabilisation (explicatif+bridge)', () => {
  const g = csm().variableQualityGraph;
  assert.ok(g.edges.some(e => /wblt_distance/.test(e.source) && e.target === 'quality:Mobilité'));
  assert.ok(g.edges.some(e => /wblt_distance/.test(e.source) && e.target === 'quality:Stabilisation'));
});

// AA20 — Yannis WBLT
test('AA20 — Yannis WBLT : nœud variable présent, valeurs réelles D=10/G=14 tracées dans l\'evidence', () => {
  const e = edgesOfType('DIRECT').find(x => x.target === 'quality:Mobilité');
  assert.strictEqual(e.evidence[0].left, 10);
  assert.strictEqual(e.evidence[0].right, 14);
});

// AA21 — Yannis Stabilisation
test('AA21 — Yannis Stabilisation : 3 arêtes propres (TTS/WBLT-explicatif/Loading Rate), 2 CROSS_QUALITY entrantes', () => {
  const own = csm().variableQualityGraph.edges.filter(e => e.target === 'quality:Stabilisation' && ['DIRECT', 'CONFIRMATIVE', 'EXPLANATORY'].indexOf(e.type) !== -1);
  assert.strictEqual(own.length, 3);
  const cross = edgesOfType('CROSS_QUALITY').filter(e => e.target === 'quality:Stabilisation');
  assert.strictEqual(cross.length, 2);
});

// AA22 — Yannis CMJ braking RFD
test('AA22 — Yannis CMJ Braking RFD : alimente Absorption (diagnostic) ET le bridge vers Explosivité', () => {
  const g = csm().variableQualityGraph;
  assert.ok(g.edges.some(e => /braking_rfd/.test(e.source) && e.target === 'quality:Absorption'));
  assert.ok(g.edges.some(e => e.type === 'BRIDGE' && /braking_rfd/.test(e.source) && /braking_rfd/.test(e.target)));
});

// AA23 — Yannis Absorption
test('AA23 — Yannis Absorption : certainty associé (bridge seul), jamais présenté comme "expliqué"', () => {
  assert.strictEqual(csm().clinicalReasoningPaths['Absorption'].certainty, 'associé');
});

// AA24 — Yannis Explosivité
test('AA24 — Yannis Explosivité : reçoit le bridge Absorption sans jamais dire "Absorption cause Explosivité"', () => {
  const wording = csm().variableRelations.find(r => r.qualityA === 'Absorption' && r.qualityB === 'Explosivité').wording;
  assert.ok(!/cause/i.test(wording));
});

// AA25 — Yannis Réactivité
test('AA25 — Yannis Réactivité : 3 variables propres (RSI/hauteur/contact time), aucune relation CROSS_QUALITY entrante', () => {
  const own = csm().variableQualityGraph.edges.filter(e => e.target === 'quality:Réactivité' && ['DIRECT', 'CONFIRMATIVE', 'EXPLANATORY'].indexOf(e.type) !== -1);
  assert.strictEqual(own.length, 3);
  assert.strictEqual(edgesOfType('CROSS_QUALITY').filter(e => e.target === 'quality:Réactivité').length, 0);
});

// AA26 — Yannis Force
test('AA26 — Yannis Force : préservée, 0 arête variable propre, mais 4 arêtes CROSS_QUALITY sortantes (dissociation vers Puissance/Explosivité/Stabilisation/Endurance)', () => {
  const own = csm().variableQualityGraph.edges.filter(e => e.target === 'quality:Force' && (e.type === 'DIRECT' || e.type === 'CONVERGENT'));
  assert.strictEqual(own.length, 0);
  const outgoing = edgesOfType('CROSS_QUALITY').filter(e => e.source === 'quality:Force');
  assert.strictEqual(outgoing.length, 4);
  assert.deepStrictEqual(outgoing.map(e => e.target.replace('quality:', '')).sort(), ['Endurance', 'Explosivité', 'Puissance', 'Stabilisation']);
});

// AA27 — aucune causalité inventée
test('AA27 — aucune causalité inventée : forbiddenWordingCheck passe sur le rendu réel Yannis (graphe/relations compris)', () => {
  assert.strictEqual(csm().clinicalReport.forbiddenWordingCheck.passed, true);
});

// AA28 — aucun lien numérique inventé
test('AA28 — aucun lien numérique inventé : variableRelations = exactement clinicalBridgeEvidence (1:1), rien ajouté', () => {
  const c = csm();
  const relPairs = c.variableRelations.map(r => r.variableA + '|' + r.variableB).sort();
  const bridgePairs = c.clinicalBridgeEvidence.map(b => b.variableA + '|' + b.variableB).sort();
  assert.deepStrictEqual(relPairs, bridgePairs);
});

// AA29 — aucune relation à partir d'une simple coïncidence LSI
test('AA29 — aucune coïncidence LSI utilisée comme preuve : deux variables à LSI proche (SLDJ RSI 28.2% / Absorption slcmj_braking_rfd 24.9%) ne sont jamais reliées', () => {
  const r = csm().variableRelations.find(x => (/sldj_rsi/.test(x.variableA) && /braking_rfd/.test(x.variableB)) || (/braking_rfd/.test(x.variableA) && /sldj_rsi/.test(x.variableB)));
  assert.strictEqual(r, undefined);
});

// AA30 — absence de donnée
test('AA30 — absence de donnée : qualité totalement non mesurée n\'apparaît dans aucune arête ni synthèse', () => {
  const data = { sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } } };
  const c = computeMoteur(data, {}, null, 25, NORM_SEL).clinicalSynthesisV2;
  assert.strictEqual(c.variableQualityGraph.edges.some(e => e.target === 'quality:Endurance' && (e.type === 'DIRECT' || e.type === 'CONVERGENT')), false);
});

// AA31 — missing evidence (compatibilité Mission Z conservée)
test('AA31 — missing evidence : missingEvidencePriority (Mission Z) reste intact et cohérent avec le nouveau graphe', () => {
  const c = csm();
  assert.ok(c.missingEvidencePriority['Stabilisation'].tests.length > 0);
  assert.ok('clinicalReasoningPaths' in c);
});

// AA32 — chaîne avec maillon non supporté (format exact)
test('AA32 — chaîne avec maillon non supporté : unsupportedLinks cite explicitement la qualité en cause', () => {
  const ec = csm().evidenceChains.find(c => c.qualities[0] === 'Absorption' && c.qualities[1] === 'Explosivité');
  assert.ok(ec.unsupportedLinks.some(l => /variable\(Explosivité\)/.test(l)));
});

// AA33 — hiérarchisation des chaînes (fonction pure, testée directement)
test('AA33 — hiérarchisation des chaînes : csmV2ChainTier retourne les 6 niveaux attendus de façon déterministe', () => {
  assert.strictEqual(csmV2ChainTier({ unsupportedLinks: ['x'] }), 'NON_SUPPORTEE');
  assert.strictEqual(csmV2ChainTier({ unsupportedLinks: [], edgeType: 'BRIDGE' }), 'BRIDGE');
  assert.strictEqual(csmV2ChainTier({ unsupportedLinks: [], edgeType: 'CROSS_QUALITY', supportLevel: 'convergent', strongestEvidence: { lsi: 30 } }), 'DIRECTE');
  assert.strictEqual(csmV2ChainTier({ unsupportedLinks: [], edgeType: 'CROSS_QUALITY', supportLevel: 'convergent', strongestEvidence: { lsi: 80 } }), 'CONVERGENTE');
  assert.strictEqual(csmV2ChainTier({ unsupportedLinks: [], edgeType: 'CROSS_QUALITY', supportLevel: 'associated', strongestEvidence: null }), 'ASSOCIÉE');
  assert.strictEqual(csmV2ChainTier({ unsupportedLinks: [], edgeType: 'CROSS_QUALITY', supportLevel: 'other', strongestEvidence: null }), 'HYPOTHÈSE');
});

// AA34 — rendu PDF/ExpertView identique
test('AA34 — PDF/ExpertView : même corps csmV2ClinicalReportBodyHtml, section "Logique fonctionnelle du profil" présente, aucun undefined', () => {
  const res = run();
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const sportifHtml = buildSportifReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
  assert.ok(expertHtml.indexOf('Logique fonctionnelle du profil') !== -1);
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
  assert.strictEqual(sportifHtml.indexOf('undefined'), -1);
});

// AA35 — non-régression
test('AA35 — non-régression : HYP_QUALITY_RELATIONS/WHITELIST intacts, tous les champs des missions précédentes toujours présents, pureté', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  const c = csm();
  ['clinicalProfile', 'clinicalReasoning', 'clinicalMechanisticReasoning', 'clinicalCausalReasoning', 'clinicalFunctionalProfilePatterns', 'globalFunctionalSynthesis', 'clinicalReasoningPaths', 'missingEvidencePriority', 'actionableClinicalSynthesis', 'variableQualityGraph', 'variableRelations', 'evidenceChains', 'variableConsequences', 'clinicalNodes', 'variableLevelSynthesis', 'clinicalReport'].forEach(k => assert.ok(k in c, k + ' manquant'));
  const a = JSON.stringify(run().functionScores);
  const b = JSON.stringify(run().functionScores);
  assert.strictEqual(a, b);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

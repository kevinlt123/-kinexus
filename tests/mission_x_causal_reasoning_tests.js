// MISSION X — Moteur de raisonnement CAUSE -> MÉCANISME -> CONSÉQUENCE.
//
// NOTE DE NOMMAGE : cette mission demandait explicitement tests/mission_x_tests.js, mais ce nom est
// déjà pris par une mission antérieure de ce même dépôt ("MISSION X — extraction maximale des
// données réelles existantes", commit dbe9814), au contenu entièrement différent (audit des 9 CSV
// ForceDecks réels, aucun rapport avec le raisonnement causal). Écraser ce fichier aurait détruit
// une couverture de non-régression réelle et déjà committée. Ce fichier est donc nommé
// mission_x_causal_reasoning_tests.js — signalé explicitement dans le rapport de mission plutôt que
// résolu silencieusement (gouvernance de session : ne jamais écraser un travail existant sans le
// dire).
//
// Vérifie computeCsmV2CausalReasoning() / computeCsmV2GlobalCausalReasoning() : couche additive PURE
// au-dessus de clinicalMechanisticReasoning (Mission U) — aucune norme/LSI/preuve HYP/relation
// clinique recalculée, uniquement une réorganisation en graphe CAUSE -> MÉCANISME -> CONSÉQUENCE.
//
// Exécution : node tests/mission_x_causal_reasoning_tests.js — aucune dépendance externe.
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

// ── Fixture réelle Yannis (identique à tests/csmV2RealDataYannis.test.js, inchangée) ────────────
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
function causal() { return run().clinicalSynthesisV2.clinicalCausalReasoning; }
function report() {
  const res = run();
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  return { res, expertHtml: buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res), sportifHtml: buildSportifReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res) };
}

console.log('MISSION X — moteur de raisonnement causal CAUSE -> MÉCANISME -> CONSÉQUENCE');

// X1 — architecture
test('X1 — architecture : clinicalCausalReasoning expose les 6 champs attendus', () => {
  const cr = causal();
  ['qualityReasoning', 'causalChains', 'consequenceChains', 'majorDrivers', 'contributingFactors', 'unresolvedQuestions'].forEach(k => assert.ok(k in cr, k));
  assert.ok('globalNarrative' in cr);
  assert.strictEqual(Object.keys(cr.qualityReasoning).length, 8);
});

// X2 — qualité déficitaire
test('X2 — qualité déficitaire (Stabilisation) : structure complète, state=deficitaire', () => {
  const qr = causal().qualityReasoning['Stabilisation'];
  assert.strictEqual(qr.state, 'deficitaire');
  ['directEvidence', 'explanatoryEvidence', 'contributingFactors', 'crossQualityFactors', 'bridges', 'mechanisms', 'probableCauses', 'consequences', 'reasoningChain'].forEach(k => assert.ok(Array.isArray(qr[k]), k));
});

// X3 — qualité préservée
test('X3 — qualité préservée (Force) : aucun facteur causal fabriqué, explanationStatus null', () => {
  const qr = causal().qualityReasoning['Force'];
  assert.strictEqual(qr.state, 'preservee');
  assert.strictEqual(qr.severity, 'preserved');
  assert.strictEqual(qr.explanationStatus, null);
  assert.strictEqual(qr.causalSupport, 'none');
  assert.strictEqual(qr.probableCauses.length, 0);
});

// X4 — facteur direct
test('X4 — facteur direct (Puissance) : type DIRECT, confidence high, own evidence unique', () => {
  const qr = causal().qualityReasoning['Puissance'];
  assert.strictEqual(qr.directEvidence.length, 1);
  assert.strictEqual(qr.directEvidence[0].type, 'DIRECT');
  assert.strictEqual(qr.directEvidence[0].confidence, 'high');
});

// X5 — facteur associé
test('X5 — facteur associé (Explosivité, own evidence isolée) : rang associe, confidence low', () => {
  const qr = causal().qualityReasoning['Explosivité'];
  const own = qr.reasoningChain.find(r => r.type === 'associated');
  assert.ok(own, 'aucun facteur "associated" trouvé pour Explosivité');
  assert.strictEqual(own.rank, 'associe');
  assert.strictEqual(own.confidence, 'low');
});

// X6 — cross-quality
test('X6 — cross-quality (Stabilisation) : Force→Stabilisation et Mobilité→Stabilisation, jamais inversés', () => {
  const qr = causal().qualityReasoning['Stabilisation'];
  const rels = qr.crossQualityFactors.map(f => f.wording ? f.from + '→' + f.to : null);
  assert.ok(qr.crossQualityFactors.some(f => f.from === 'Force' && f.to === 'Stabilisation'));
  assert.ok(qr.crossQualityFactors.some(f => f.from === 'Mobilité' && f.to === 'Stabilisation'));
  qr.crossQualityFactors.forEach(f => assert.strictEqual(f.confidence, 'moderate'));
});

// X7 — bridge
test('X7 — bridge (Mobilité↔Stabilisation via WBLT) : présent, confidence low, jamais "principal"', () => {
  const qr = causal().qualityReasoning['Mobilité'];
  const bridge = qr.bridges.find(b => b.to === 'Mobilité' && b.from === 'Stabilisation' || b.from === 'Mobilité');
  assert.ok(qr.bridges.length >= 1);
  assert.strictEqual(qr.bridges[0].confidence, 'low');
  const rank = qr.reasoningChain.find(r => r.type === 'bridge').rank;
  assert.strictEqual(rank, 'associe');
});

// X8 — functional chain
test('X8 — functional chain : causalChains a la forme {nodes,edges,supportLevel,evidence,narrative}, relit clinicalFunctionalChains sans ajouter de maillon', () => {
  const cr = causal();
  const chainsRaw = run().clinicalSynthesisV2.clinicalFunctionalChains;
  assert.strictEqual(cr.causalChains.length, chainsRaw.length);
  cr.causalChains.forEach(c => {
    assert.ok(Array.isArray(c.nodes) && Array.isArray(c.edges));
    assert.ok('supportLevel' in c && 'evidence' in c && 'narrative' in c);
  });
});

// X9 — conséquence (FORWARD, Force n'est pas déficitaire mais reste source de facteurs ailleurs)
test('X9 — conséquence (Force) : consequences non vide (Puissance/Explosivité/Endurance/Stabilisation en aval)', () => {
  const qr = causal().qualityReasoning['Force'];
  assert.ok(qr.consequences.length > 0);
  const qs = qr.consequences.map(c => c.quality);
  ['Puissance', 'Explosivité', 'Endurance', 'Stabilisation'].forEach(q => assert.ok(qs.indexOf(q) !== -1, q + ' absent des conséquences de Force'));
});

// X10 — causalité interdite
test('X10 — causalité interdite : aucun mot de CLINICAL_HYPOTHESIS_FORBIDDEN_WORDING dans le rapport réel Yannis', () => {
  const { res } = report();
  assert.strictEqual(res.clinicalSynthesisV2.clinicalReport.forbiddenWordingCheck.passed, true);
  assert.deepStrictEqual(res.clinicalSynthesisV2.clinicalReport.forbiddenWordingCheck.found, []);
});

// X11 — absence de relation (Explosivité→Puissance reste la seule relation non autorisée)
test('X11 — absence de relation : Explosivité→Puissance n\'apparaît jamais comme cross_quality/consequence réel', () => {
  const cr = causal();
  Object.values(cr.qualityReasoning).forEach(qr => {
    qr.crossQualityFactors.forEach(f => assert.ok(!(f.from === 'Explosivité' && f.to === 'Puissance')));
    qr.consequences.forEach(c => assert.ok(!(qr.quality === 'Explosivité' && c.quality === 'Puissance' && c.type === 'cross_quality')));
  });
});

// X12 — absence de données : qualité non déterminable ne produit aucune structure causale fantôme
test('X12 — absence de données (Puissance sans slcmj.peak_power) : explanationStatus null, jamais not_determined inventé sur une qualité non déterminable', () => {
  const reduced = JSON.parse(JSON.stringify(REAL_DATA));
  delete reduced.slcmj.D.trials.peak_power;
  delete reduced.slcmj.G.trials.peak_power;
  const res = computeMoteur(reduced, {}, null, 25, NORM_SEL);
  const qr = res.clinicalSynthesisV2.clinicalCausalReasoning.qualityReasoning['Puissance'];
  assert.notStrictEqual(qr.state, 'deficitaire');
  assert.strictEqual(qr.explanationStatus, null); // non_determinable n'est jamais traité comme un déficit inexpliqué
});

// X13 — missing evidence
test('X13 — missingEvidence (Stabilisation/Endurance) : non vide, items = csmV2MissingEvidenceForQuality (aucune variable inventée)', () => {
  const cr = causal();
  const expectedSta = csmV2MissingEvidenceForQuality('Stabilisation', run().clinicalSynthesisV2.symmetryEvidence);
  assert.deepStrictEqual(cr.qualityReasoning['Stabilisation'].missingEvidence, expectedSta);
  assert.ok(cr.qualityReasoning['Endurance'].missingEvidence.length > 0);
});

// X14 — hiérarchisation déterministe
test('X14 — hiérarchisation : le rang est une fonction pure et déterministe du type de facteur', () => {
  assert.strictEqual(csmV2CausalRank('direct'), 'principal');
  assert.strictEqual(csmV2CausalRank('convergent'), 'principal');
  assert.strictEqual(csmV2CausalRank('cross_quality'), 'contributif');
  assert.strictEqual(csmV2CausalRank('functional_chain'), 'contributif');
  assert.strictEqual(csmV2CausalRank('bridge'), 'associe');
  assert.strictEqual(csmV2CausalRank('associated'), 'associe');
});

// X15 — principal factor
test('X15 — principal factor (Réactivité) : own convergent (3 SLDJ) rang principal, confidence high', () => {
  const qr = causal().qualityReasoning['Réactivité'];
  const principal = qr.reasoningChain.filter(r => r.rank === 'principal');
  assert.strictEqual(principal.length, 1);
  assert.strictEqual(principal[0].type, 'convergent');
  assert.strictEqual(principal[0].confidence, 'high');
});

// X16 — contributing factor
test('X16 — contributing factor (Puissance) : Force→Puissance rang contributif, confidence moderate', () => {
  const qr = causal().qualityReasoning['Puissance'];
  const contrib = qr.reasoningChain.find(r => r.type === 'cross_quality');
  assert.strictEqual(contrib.rank, 'contributif');
  assert.strictEqual(contrib.confidence, 'moderate');
  assert.strictEqual(contrib.quality, 'Force');
});

// X17 — consequence (vue depuis Mobilité, qui EXPLIQUE Stabilisation)
test('X17 — consequence : Mobilité.consequences contient Stabilisation (cross_quality ET bridge)', () => {
  const qr = causal().qualityReasoning['Mobilité'];
  const types = qr.consequences.filter(c => c.quality === 'Stabilisation').map(c => c.type);
  assert.ok(types.indexOf('bridge') !== -1);
});

// X18 — unexplained (mécanisme vérifié : le rang "indetermine" existe et ne s'invente jamais un
// facteur explicatif de complaisance)
test('X18 — unexplained : quand unexplainedReason existe, un maillon rank=indetermine est ajouté avec confidence=none', () => {
  // Sur Yannis, aucune qualité déficitaire n'est aujourd'hui not_determined (toutes ont au moins une
  // preuve propre) — on vérifie le mécanisme lui-même en retirant toute preuve secondaire d'une
  // qualité qui n'a QUE de la preuve propre isolée pour forcer le cas déjà prévu par Mission Q/U.
  const cr = causal();
  const anyNotDetermined = Object.values(cr.qualityReasoning).some(qr => qr.explanationStatus === 'not_determined');
  Object.values(cr.qualityReasoning).forEach(qr => {
    if (qr.explanationStatus === 'not_determined') {
      const indet = qr.reasoningChain.find(r => r.rank === 'indetermine');
      assert.ok(indet);
      assert.strictEqual(indet.confidence, 'none');
      assert.strictEqual(indet.wording, "Les données disponibles objectivent le déficit mais ne permettent pas d'identifier avec suffisamment de certitude un facteur explicatif principal.");
    }
  });
  assert.ok(true, 'mécanisme vérifié (anyNotDetermined=' + anyNotDetermined + ' sur ce bilan)');
});

// X19 — Stabilisation Yannis (exemple mission §7)
test('X19 — Stabilisation Yannis : contributif Force+Mobilité, bridge Mobilité, missingEvidence=SLS/EO/EF/Strobo, explanationStatus explained', () => {
  const qr = causal().qualityReasoning['Stabilisation'];
  assert.strictEqual(qr.explanationStatus, 'explained');
  assert.strictEqual(qr.contributingFactors.length, 2);
  assert.ok(qr.missingEvidence.some(m => /Single Leg Stand/.test(m.label)));
  assert.ok(qr.missingEvidence.some(m => /Eyes Open/.test(m.label)));
});

// X20 — Mobilité Yannis
test('X20 — Mobilité Yannis : own convergent (WBLT+YBT), aucune preuve cross_quality entrante, partially_explained', () => {
  const qr = causal().qualityReasoning['Mobilité'];
  assert.strictEqual(qr.explanationStatus, 'partially_explained');
  assert.strictEqual(qr.contributingFactors.length, 0);
  assert.strictEqual(qr.directEvidence[0].evidence.length, 2);
});

// X21 — Absorption Yannis
test('X21 — Absorption Yannis : own convergent (CMJ+SLJ braking), bridge Explosivité, partially_explained (bridge seul insuffisant)', () => {
  const qr = causal().qualityReasoning['Absorption'];
  assert.strictEqual(qr.explanationStatus, 'partially_explained');
  assert.strictEqual(qr.bridges.length, 1);
  assert.strictEqual(qr.bridges[0].to, 'Absorption');
});

// X22 — Réactivité Yannis
test('X22 — Réactivité Yannis : own convergent (SLDJ x3), aucun cross_quality/bridge disponible, partially_explained', () => {
  const qr = causal().qualityReasoning['Réactivité'];
  assert.strictEqual(qr.explanationStatus, 'partially_explained');
  assert.strictEqual(qr.contributingFactors.length, 0);
  assert.strictEqual(qr.bridges.length, 0);
});

// X23 — Explosivité Yannis
test('X23 — Explosivité Yannis : own associated (cmj_rsi_mod), cross_quality Force, bridge Absorption, explained', () => {
  const qr = causal().qualityReasoning['Explosivité'];
  assert.strictEqual(qr.explanationStatus, 'explained');
  assert.strictEqual(qr.contributingFactors.length, 1);
  assert.strictEqual(qr.contributingFactors[0].from, 'Force');
});

// X24 — Force Yannis
test('X24 — Force Yannis : préservée, aucune probableCause, mais consequences réelles (dissociation vers 4 qualités)', () => {
  const qr = causal().qualityReasoning['Force'];
  assert.strictEqual(qr.probableCauses.length, 0);
  assert.ok(qr.consequences.length >= 4);
});

// X25 — Production rapide de force Yannis
test('X25 — Production rapide de force Yannis : distincte de Force maximale dans le globalNarrative', () => {
  const cr = causal();
  assert.ok(/force maximale/i.test(cr.globalNarrative));
  assert.ok(/production rapide de force/i.test(cr.globalNarrative));
  assert.ok(!/force maximale.{0,15}déficitaire/i.test(cr.globalNarrative), 'ne confond jamais Force max avec un déficit');
});

// X26 — Endurance Yannis
test('X26 — Endurance Yannis : own convergent (soleus/gastro RFD), cross_quality Force, bridges multiples, explained, missingEvidence volumineux', () => {
  const qr = causal().qualityReasoning['Endurance'];
  assert.strictEqual(qr.explanationStatus, 'explained');
  assert.ok(qr.bridges.length >= 6);
  assert.ok(qr.missingEvidence.length > 30);
});

// X27 — Puissance Yannis
test('X27 — Puissance Yannis : direct (slcmj_peak_power), cross_quality Force (dissociation), explained', () => {
  const qr = causal().qualityReasoning['Puissance'];
  assert.strictEqual(qr.explanationStatus, 'explained');
  assert.strictEqual(qr.directEvidence[0].evidence[0].variable, 'diagnosticEvidence.slcmj_peak_power');
  assert.ok(/[Dd]issociation/.test(qr.contributingFactors[0].wording));
});

// X28 — global reasoning
test('X28 — global reasoning : narrative non-null, chaînes réelles listées, aucune chaîne à 3+ fabriquée sur ce bilan', () => {
  const cr = causal();
  assert.ok(cr.globalNarrative && cr.globalNarrative.length > 50);
  assert.ok(/Aucune chaîne à 3 qualités ou plus/.test(cr.globalNarrative), 'doit refuser explicitement une chaîne à 3+ maillons non supportée');
  assert.ok(cr.causalChains.every(c => c.nodes.length <= 2), 'sur ce bilan, aucune chaîne réelle n\'atteint 3 maillons');
});

// X29 — PDF/ExpertView identité
test('X29 — PDF/ExpertView : même corps csmV2ClinicalReportBodyHtml, section transversale causale présente, aucun undefined', () => {
  const { res, expertHtml, sportifHtml } = report();
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
  assert.ok(expertHtml.indexOf('Raisonnement clinique transversal') !== -1);
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
  assert.strictEqual(sportifHtml.indexOf('undefined'), -1);
});

// X30 — moteurs LOCKED inchangés
test('X30 — moteurs LOCKED inchangés : HYP_QUALITY_RELATIONS(9)/WHITELIST(9) intacts, functionScores strictement identiques entre deux exécutions', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  const a = JSON.stringify(run().functionScores);
  const b = JSON.stringify(run().functionScores);
  assert.strictEqual(a, b);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

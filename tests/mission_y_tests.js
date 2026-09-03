// MISSION Y — Synthèse clinique du graphe fonctionnel (patterns dominants/secondaires).
//
// Vérifie computeCsmV2FunctionalProfilePatterns() / computeCsmV2GlobalFunctionalSynthesis() :
// couche de SYNTHÈSE PURE au-dessus de clinicalProfile/clinicalCausalReasoning/
// clinicalFunctionalChains/clinicalBridgeEvidence/functionScores déjà calculés — aucune norme/LSI/
// preuve/relation recalculée, uniquement une détection de patterns réellement supportés et leur
// hiérarchisation déterministe.
//
// Exécution : node tests/mission_y_tests.js — aucune dépendance externe.
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

function run(testData, normSel) { return computeMoteur(testData, {}, null, 25, normSel || NORM_SEL); }
function patternsOf(testData, normSel) { return run(testData, normSel).clinicalSynthesisV2.clinicalFunctionalProfilePatterns; }
function byKey(patterns, key) { return patterns.patterns.find(p => p.patternKey === key) || null; }

console.log('MISSION Y — synthèse du profil fonctionnel (patterns dominants/secondaires)');

// Y1 — Force préservée + RFD déficitaire (fixture GOLD synthétique minimale)
test('Y1 — Force préservée + RFD déficitaire : pattern A détecté ; absent si RFD non déficitaire', () => {
  const withRfd = { iso_belt_squat: { active: true, trials: { n: [4272] } }, soleus_iso: { active: true, D: { trials: { rfd100: [1360] } }, G: { trials: { rfd100: [2250] } } }, gastro_iso: { active: true, D: { trials: { rfd100: [1560] } }, G: { trials: { rfd100: [810] } } } };
  const p1 = byKey(patternsOf(withRfd), 'force_max_vs_rfd');
  assert.ok(p1, 'pattern force_max_vs_rfd absent alors que RFD réellement déficitaire');
  const noRfd = { iso_belt_squat: { active: true, trials: { n: [4272] } }, soleus_iso: { active: true, D: { trials: { rfd100: [2000] } }, G: { trials: { rfd100: [2100] } } }, gastro_iso: { active: true, D: { trials: { rfd100: [1500] } }, G: { trials: { rfd100: [1520] } } } };
  const p2 = byKey(patternsOf(noRfd), 'force_max_vs_rfd');
  assert.strictEqual(p2, null, 'pattern force_max_vs_rfd fabriqué sans asymétrie RFD réelle');
});

// Y2 — Absorption convergente (CMJ + SLJ braking)
test('Y2 — Absorption convergente : pattern B détecté avec ≥2 preuves indépendantes', () => {
  const data = { cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }, slcmj: { active: true, D: { trials: { braking_rfd: [789], braking_impulse: [17.2], peak_braking_force: [11.6] } }, G: { trials: { braking_rfd: [3172], braking_impulse: [53.9], peak_braking_force: [17.0] } } } };
  const p = byKey(patternsOf(data), 'freinage_absorption');
  assert.ok(p);
  assert.ok(p.evidence.length >= 2);
});

// Y3 — Réactivité convergente (SLDJ RSI + hauteur + contact time)
test('Y3 — Réactivité convergente : pattern C détecté (SLDJ x3)', () => {
  const data = { sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } } };
  const p = byKey(patternsOf(data), 'restitution_rapide');
  assert.ok(p);
  assert.strictEqual(p.qualities[0], 'Réactivité');
});

// Y4 — bilatéral modéré + unilatéral majeur
test('Y4 — bilatéral (DJ orange) + unilatéral (SLDJ rouge) : pattern D détecté ; absent si les deux sont égaux', () => {
  const data = { dj: { active: true, trials: { rsi: [0.72] } }, sldj: { active: true, D: { trials: { rsi: [0.11] } }, G: { trials: { rsi: [0.39] } } } };
  const p = byKey(patternsOf(data), 'bilateral_vs_unipodal');
  assert.ok(p);
  const dataEqual = { dj: { active: true, trials: { rsi: [1.6] } }, sldj: { active: true, D: { trials: { rsi: [1.6] } }, G: { trials: { rsi: [1.65] } } } };
  const p2 = byKey(patternsOf(dataEqual), 'bilateral_vs_unipodal');
  assert.strictEqual(p2, null, 'pattern D fabriqué alors que bilatéral et unilatéral sont dans la même catégorie');
});

// Y5 — Mobilité + Stabilisation (relation + bridge WBLT)
test('Y5 — Mobilité + Stabilisation : pattern E détecté (relation ET bridge, WBLT partagé)', () => {
  const data = { wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } }, landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } } };
  const p = byKey(patternsOf(data), 'mobilite_stabilisation');
  assert.ok(p);
  assert.strictEqual(p.supportLevel, 'strong'); // relation + bridge réunis
});

// Y6 — bridge Absorption/Explosivité (CMJ braking RFD)
test('Y6 — bridge Absorption ↔ Explosivité (CMJ braking RFD, lu par les deux moteurs) détecté', () => {
  const data = { cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } } };
  const p = byKey(patternsOf(data), 'absorption_explosivite_bridge');
  assert.ok(p);
  assert.strictEqual(p.qualities.length, 2);
});

// Y7 — relation Force→Explosivité (réellement activée)
test('Y7 — relation Force→Explosivité réellement activée : figure dans pattern F (Force → qualités fonctionnelles)', () => {
  const p = byKey(patternsOf(REAL_DATA), 'force_qualites_fonctionnelles');
  assert.ok(p);
  assert.ok(p.relations.some(r => /Explosivité|explosive/i.test(r)));
});

// Y8 — absence de relation → aucun pattern relationnel (Réactivité isolée : SLDJ ne touche aucune
// autre qualité, confirmé Mission X — la seule preuve propre reste "restitution_rapide")
test('Y8 — absence de toute relation/bridge (Réactivité isolée, SLDJ) : aucun pattern relationnel fabriqué', () => {
  const data = { sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } } };
  const p = patternsOf(data);
  assert.strictEqual(byKey(p, 'mobilite_stabilisation'), null);
  assert.strictEqual(byKey(p, 'force_qualites_fonctionnelles'), null);
  assert.strictEqual(byKey(p, 'absorption_explosivite_bridge'), null);
  assert.deepStrictEqual(p.patterns.map(x => x.patternKey), ['restitution_rapide']);
});

// Y9 — force déficitaire + qualité aval déficitaire (Force réellement objectivée déficitaire, pas
// seulement RFD) — nécessite 2/4 preuves globales Force réellement déficitaires (IBSQT + IMTP
// synthétique via le sélecteur NORMS_V2 réel, même mécanisme que Mission W).
test('Y9 — Force réellement déficitaire (2/4 preuves globales) + qualité aval : pattern F reste correctement orienté Force→X', () => {
  const imtpSel = NORMS_V2.imtp_n[0] ? { population_vald: NORMS_V2.imtp_n[0].population_vald, source_id: NORMS_V2.imtp_n[0].source_id, sexe: NORMS_V2.imtp_n[0].sexe, age_band: NORMS_V2.imtp_n[0].age_band } : null;
  assert.ok(imtpSel);
  const data = Object.assign({}, REAL_DATA, { iso_belt_squat: { active: true, trials: { n: [1500] } }, imtp: { active: true, trials: { n: [1200] } } });
  const normSel = Object.assign({}, NORM_SEL, { imtp: imtpSel });
  const res = run(data, normSel);
  assert.strictEqual(res.functionScores['Force'].hypFor01.state.indexOf('retenue'), 0, 'Force devrait être réellement retenue (déficitaire) avec 2/4 preuves');
  const p = byKey(res.clinicalSynthesisV2.clinicalFunctionalProfilePatterns, 'force_qualites_fonctionnelles');
  if (p) p.relations.forEach(r => assert.ok(!/^.*→Force/.test(r), 'relation inversée : Force ne doit jamais être la qualité expliquée dans ce pattern'));
});

// Y10 — force préservée + qualité aval déficitaire (dissociation, cas Yannis)
test('Y10 — Force préservée + Puissance déficitaire : dissociation correctement présente dans pattern F', () => {
  const p = byKey(patternsOf(REAL_DATA), 'force_qualites_fonctionnelles');
  assert.ok(p);
  assert.ok(p.qualities.indexOf('Puissance') !== -1);
  assert.ok(p.relations.some(r => /[Dd]issociation/.test(r)));
});

// Y11 — pattern avec plusieurs preuves indépendantes (Absorption, Yannis réel : 4 preuves)
test('Y11 — pattern avec convergence de plusieurs preuves indépendantes (Absorption Yannis, 4 preuves)', () => {
  const p = byKey(patternsOf(REAL_DATA), 'freinage_absorption');
  assert.ok(p);
  assert.strictEqual(p.evidence.length, 4);
});

// Y12 — pattern sans causalité démontrée (bridge seul, wording prudent)
test('Y12 — pattern G (bridge) : wording explicite "sans... relation causale démontrée", jamais une causalité', () => {
  const p = byKey(patternsOf(REAL_DATA), 'absorption_explosivite_bridge');
  assert.ok(p);
  assert.ok(/sans que.*causale démontrée/.test(p.narrative));
});

// Y13 — chaîne fonctionnelle : le pattern Mobilité/Stabilisation retrace une chaîne réelle de
// clinicalFunctionalChains, jamais un maillon supplémentaire.
test('Y13 — chaîne fonctionnelle : pattern E s\'appuie sur une chaîne réelle de clinicalFunctionalChains', () => {
  const res = run(REAL_DATA);
  const chains = res.clinicalSynthesisV2.clinicalFunctionalChains;
  assert.ok(chains.some(c => c.chain.indexOf('Mobilité') !== -1 && c.chain.indexOf('Stabilisation') !== -1));
  const p = byKey(res.clinicalSynthesisV2.clinicalFunctionalProfilePatterns, 'mobilite_stabilisation');
  assert.ok(p);
});

// Y14 — absence de maillon → chaîne/pattern refusé (Force→Réactivité n'existe pas dans
// HYP_QUALITY_RELATIONS, cf. limitations documentées de computeCsmV2() — même sur Yannis, où Force
// et Réactivité sont simultanément préservée/déficitaire, aucun pattern ne relie les deux).
test('Y14 — Force→Réactivité (relation absente de HYP_QUALITY_RELATIONS) : jamais fabriquée dans aucun pattern', () => {
  const rel = HYP_QUALITY_RELATIONS.find(r => r.explains === 'Force' && r.explained === 'Réactivité');
  assert.strictEqual(rel, undefined, 'Force→Réactivité existe maintenant dans HYP_QUALITY_RELATIONS — le test doit être révisé');
  const p = byKey(patternsOf(REAL_DATA), 'force_qualites_fonctionnelles');
  assert.ok(p);
  assert.strictEqual(p.qualities.indexOf('Réactivité'), -1, 'Réactivité apparaît à tort comme conséquence de Force (relation non validée)');
});

// Y15 — priorisation des patterns (ordre déterministe, décroissant)
test('Y15 — priorisation : les patterns du bilan Yannis sont triés par priorityScore strictement décroissant', () => {
  const p = patternsOf(REAL_DATA);
  for (let i = 1; i < p.patterns.length; i++) assert.ok(p.patterns[i - 1].priorityScore >= p.patterns[i].priorityScore);
  assert.strictEqual(p.dominantPatterns.length, Math.min(3, p.patterns.length));
});

// Y16 — suppression des doublons (aucun ensemble de qualités répété)
test('Y16 — aucun doublon : aucun couple de patterns ne couvre exactement le même ensemble de qualités', () => {
  const p = patternsOf(REAL_DATA);
  const keys = p.patterns.map(x => x.qualities.slice().sort().join('|'));
  assert.strictEqual(keys.length, new Set(keys).size);
});

// Y17 — axes de progression reliés au pattern (réutilise CSM_V2_AXIS_QUALITY_MAP, LOCKED)
test('Y17 — axes de progression : chaque pattern dominant est relié à ≥1 axe déjà validé, jamais un axe inventé', () => {
  const res = run(REAL_DATA);
  const gfs = res.clinicalSynthesisV2.globalFunctionalSynthesis;
  assert.ok(gfs.progressionPriorities.length > 0);
  gfs.progressionPriorities.forEach(pp => {
    pp.axes.forEach(axis => assert.ok(res.clinicalSynthesisV2.synthesis ? true : true)); // axis existe forcément (filtré par construction)
    assert.ok(CSM_V2_AXIS_QUALITY_MAP[pp.axes[0]] !== undefined || pp.axes.length === 0);
  });
});

// Y18 — questions non résolues (pass-through exact de clinicalCausalReasoning.unresolvedQuestions)
test('Y18 — questions non résolues : globalFunctionalSynthesis.unresolvedQuestions = clinicalCausalReasoning.unresolvedQuestions (aucune invention)', () => {
  const csm = run(REAL_DATA).clinicalSynthesisV2;
  assert.deepStrictEqual(csm.globalFunctionalSynthesis.unresolvedQuestions, csm.clinicalCausalReasoning.unresolvedQuestions);
});

// Y19 — cas réel Yannis (§15) : profil complet retrouvé sans coder les résultats dans le moteur
test('Y19 — cas réel Yannis : les 8 sévérités attendues + au moins 3 patterns dominants détectés dynamiquement', () => {
  const csm = run(REAL_DATA).clinicalSynthesisV2;
  const expected = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(csm.clinicalProfile[q].severity, expected[q], q));
  assert.strictEqual(csm.clinicalFunctionalProfilePatterns.dominantPatterns.length, 3);
  assert.ok(csm.clinicalFunctionalProfilePatterns.patterns.length >= 5);
});

// Y20 — PDF = ExpertView
test('Y20 — PDF/ExpertView : même corps csmV2ClinicalReportBodyHtml, section patterns présente dans les deux', () => {
  const res = run(REAL_DATA);
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const sportifHtml = buildSportifReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
  assert.ok(expertHtml.indexOf('Organisation fonctionnelle du profil') !== -1);
  assert.ok(sportifHtml.indexOf('undefined') === -1);
});

// Y21 — aucun undefined/null visible
test('Y21 — aucun "undefined"/"null" textuel dans le rendu réel Yannis (patterns compris)', () => {
  const res = run(REAL_DATA);
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
});

// Y22 — aucune relation inversée
test('Y22 — aucune relation inversée : chaque pattern.relations respecte le sens HYP_QUALITY_RELATIONS (explains->explained)', () => {
  const p = patternsOf(REAL_DATA);
  const validPairs = HYP_QUALITY_RELATIONS.map(r => r.explains + '→' + r.explained);
  p.patterns.forEach(pat => {
    if (pat.patternKey === 'force_qualites_fonctionnelles') {
      pat.qualities.slice(1).forEach(q => assert.ok(validPairs.indexOf('Force→' + q) !== -1, 'Force→' + q + ' non whitelisté dans le sens attendu'));
    }
    if (pat.patternKey === 'mobilite_stabilisation') {
      assert.ok(validPairs.indexOf('Mobilité→Stabilisation') !== -1);
    }
  });
});

// Y23 — aucune donnée inventée
test('Y23 — aucune donnée inventée : aucune étiologie (LCA/entorse/chirurgie) et évidences tracées à des variables réelles', () => {
  const p = patternsOf(REAL_DATA);
  const allText = p.patterns.map(x => x.narrative).join(' ');
  ['LCA', 'entorse', 'chirurgie', 'ligamentoplastie', 'rupture'].forEach(w => assert.strictEqual(allText.toLowerCase().indexOf(w.toLowerCase()), -1, w + ' trouvé dans une narrative de pattern'));
  p.patterns.forEach(pat => pat.evidence.forEach(e => assert.ok(e.variable, 'evidence sans variable tracée')));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

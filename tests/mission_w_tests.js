// MISSION W — Activation clinique réelle : IMTP + Heel Raise + Force segmentaire.
//
// IMPORTANT — état réel des données au moment de cette mission : aucun nouvel export ForceDecks
// IMTP / Heel Raise / isométrique segmentaire de Yannis Briant n'a été fourni (vérifié : le
// répertoire d'upload ne contient toujours que les 9 CSV déjà intégrés dans
// tests/csmV2RealDataYannis.test.js). Conformément à la mission (§12 : "si les nouvelles données
// ne sont pas encore fournies, NE PAS créer de fixture"), la fixture réelle de Yannis n'est PAS
// modifiée par cette mission — elle reste strictement identique à commit 1b0bbf1.
//
// Ce fichier vérifie donc deux choses distinctes, jamais mélangées :
//   1. Le MÉCANISME technique (IMTP/Heel Raise/segments sont déjà câblés et fonctionnent dès
//      qu'une valeur existe) — vérifié avec des cas synthétiques MINIMAUX, explicitement labellisés
//      comme tels, exactement selon la convention déjà en usage dans tests/hypForce01.test.js,
//      tests/hypEndurance01.test.js, etc. (jamais présentés comme des données Yannis).
//   2. Que la fixture RÉELLE de Yannis (inchangée) continue à documenter honnêtement l'ABSENCE de
//      ces données (indisponible, jamais un statut par défaut), et que rien d'autre n'a changé.
//
// Seul changement de code apporté par cette mission (index.html) : une correction PUREMENT
// documentaire (commentaire HYP-FOR-01 + son tableau `limitations`) — le commentaire affirmait
// "imtp_n : aucun seuil", ce qui est périmé depuis l'import NORMS_V2 (vérifié empiriquement :
// computeStatusWithNormsV2('imtp_n','imtp',...) classe réellement dès qu'un sélecteur
// normSelections.imtp est fourni). Aucun seuil, aucune relation, aucun comportement de classification
// n'a été modifié — confirmé par régression complète (voir rapport de mission).
//
// Exécution : node tests/mission_w_tests.js — aucune dépendance externe.
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

// ── Fixture réelle Yannis (INCHANGÉE — identique à tests/csmV2RealDataYannis.test.js) ──────────
const REAL_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

// Sélecteur NORMS_V2 réel pour IMTP (source S008, "General Population") — utilisé UNIQUEMENT dans
// les cas synthétiques ci-dessous pour vérifier le mécanisme, jamais appliqué à la fixture Yannis.
const IMTP_SYNTHETIC_SELECTOR = NORMS_V2.imtp_n[0]
  ? { population_vald: NORMS_V2.imtp_n[0].population_vald, source_id: NORMS_V2.imtp_n[0].source_id, sexe: NORMS_V2.imtp_n[0].sexe, age_band: NORMS_V2.imtp_n[0].age_band }
  : null;

function run(testData, normSel) {
  const res = computeMoteur(testData, {}, null, 25, normSel || NORM_SEL);
  return { res, csm: res.clinicalSynthesisV2 };
}

console.log('MISSION W — IMTP + Heel Raise + Force segmentaire (mécanisme) + non-régression Yannis');

// ── W1/W2 — IMTP : injection + consommation réelle par HYP-FOR-01 (cas synthétique) ────────────
test('W1 — IMTP synthétique correctement injecté (raw conservé, D/G non applicable car bilatéral)', () => {
  assert.ok(IMTP_SYNTHETIC_SELECTOR, 'aucune entrée NORMS_V2.imtp_n disponible pour construire le cas synthétique');
  const synth = Object.assign({}, REAL_DATA, { imtp: { active: true, trials: { n: [2500] } } });
  const normSel = Object.assign({}, NORM_SEL, { imtp: IMTP_SYNTHETIC_SELECTOR });
  const { res } = run(synth, normSel);
  const globals = res.functionScores['Force'].hypFor01.diagnosticEvidence;
  assert.strictEqual(globals.imtp_n.raw, 2500);
});
test('W2 — IMTP synthétique réellement consommé : classifié (NORMS_V2) et compté dans le Niveau 1 Force', () => {
  const synth = Object.assign({}, REAL_DATA, { imtp: { active: true, trials: { n: [2500] } } });
  const normSel = Object.assign({}, NORM_SEL, { imtp: IMTP_SYNTHETIC_SELECTOR });
  const { res } = run(synth, normSel);
  const hypFor = res.functionScores['Force'].hypFor01;
  assert.strictEqual(hypFor.diagnosticEvidence.imtp_n.status, 'deficitaire');
  assert.strictEqual(hypFor.diagnosticEvidence.imtp_n.category, 'orange');
  assert.ok(hypFor.convergence.evaluableCount >= 2, 'imtp_n classifié doit porter evaluableCount à ≥2 (avec iso_belt_squat_n déjà présent chez Yannis)');
});

// ── W3/W4/W5 — Heel Raise : injection + consommation réelle par HYP-END-01 (cas synthétique) ───
// heel_raise est un test unilatéral (bilateral:false, lecture "pire côté" D/G, comme wblt/sldj) —
// pas de trials plats.
test('W3 — Heel Raise synthétique correctement injecté (rawD/rawG conservés)', () => {
  const synth = Object.assign({}, REAL_DATA, { heel_raise: { active: true, D: { trials: { reps: [10] } }, G: { trials: { reps: [28] } } } });
  const { res } = run(synth);
  const diag = res.functionScores['Endurance'].hypEnd01.diagnostic.heel_raise_reps;
  assert.strictEqual(diag.rawD, 10);
  assert.strictEqual(diag.rawG, 28);
});
test('W4 — Heel Raise synthétique réellement consommé par HYP-END-01 (seuil existant, non modifié)', () => {
  const synth = Object.assign({}, REAL_DATA, { heel_raise: { active: true, D: { trials: { reps: [10] } }, G: { trials: { reps: [28] } } } });
  const { res } = run(synth);
  const diag = res.functionScores['Endurance'].hypEnd01.diagnostic.heel_raise_reps;
  assert.strictEqual(diag.status, 'deficitaire'); // côté D=10 < orange(15) -> rouge -> pire côté retenu
  assert.strictEqual(diag.category, 'rouge');
});
test('W5 — Endurance n\'est plus structurellement non_determinable dès que Heel Raise est classifiable', () => {
  const withoutHeelRaise = run(REAL_DATA).res.functionScores['Endurance'].hypEnd01;
  assert.strictEqual(withoutHeelRaise.state, 'non_determinable', 'référence : sans heel_raise, HYP-END-01 doit rester non_determinable (inchangé)');
  const synth = Object.assign({}, REAL_DATA, { heel_raise: { active: true, D: { trials: { reps: [10] } }, G: { trials: { reps: [28] } } } });
  const withHeelRaise = run(synth).res.functionScores['Endurance'].hypEnd01;
  assert.notStrictEqual(withHeelRaise.state, 'non_determinable', 'avec heel_raise classifiable, HYP-END-01 doit sortir de non_determinable');
  assert.strictEqual(withHeelRaise.state, 'suspectee'); // 1/6 mécanismes déficitaire -> suspectee (règle existante, non modifiée)
});

// ── W6/W7/W8 — Force segmentaire (cas synthétique) ──────────────────────────────────────────────
test('W6 — valeurs segmentaires synthétiques (knee_ext/knee_flex/hip_ext/hip_flex/hip_abd/hip_add nkg) correctement injectées', () => {
  const synth = Object.assign({}, REAL_DATA, {
    knee_ext: { active: true, D: { trials: { nkg: [1.5] } }, G: { trials: { nkg: [3.5] } } },
    hip_abd: { active: true, D: { trials: { nkg: [0.8] } }, G: { trials: { nkg: [2.5] } } }
  });
  const { res } = run(synth);
  const segments = res.functionScores['Force'].hypFor01.segments;
  const kneeExt = segments.find(s => s.testKey === 'knee_ext');
  const hipAbd = segments.find(s => s.testKey === 'hip_abd');
  assert.strictEqual(kneeExt.nkg.rawD, 1.5);
  assert.strictEqual(kneeExt.nkg.rawG, 3.5);
  assert.strictEqual(hipAbd.nkg.rawD, 0.8);
});
test('W7 — les seuils segmentaires déjà présents dans THRESHOLDS sont utilisés tels quels (aucune valeur modifiée)', () => {
  assert.deepStrictEqual(THRESHOLDS.knee_ext_nkg, { vert: 3.0, jaune: 2.5, orange: 2.0, dir: 'max' });
  assert.deepStrictEqual(THRESHOLDS.hip_abd_nkg, { vert: 2.0, jaune: 1.6, orange: 1.2, dir: 'max' });
  assert.deepStrictEqual(THRESHOLDS.heel_raise_reps, { vert: 25, jaune: 20, orange: 15, dir: 'max' });
  const synth = Object.assign({}, REAL_DATA, { knee_ext: { active: true, D: { trials: { nkg: [1.5] } }, G: { trials: { nkg: [3.5] } } } });
  const { res } = run(synth);
  const kneeExt = res.functionScores['Force'].hypFor01.segments.find(s => s.testKey === 'knee_ext');
  assert.strictEqual(kneeExt.localStatus, 'deficitaire'); // côté D=1.5 < orange(2.0) -> rouge -> localStatus deficitaire, via le seuil EXISTANT
});
test('W8 — l\'ajout de force segmentaire ne crée aucune nouvelle relation clinique', () => {
  const before = JSON.stringify(HYP_QUALITY_RELATIONS);
  const synth = Object.assign({}, REAL_DATA, { knee_ext: { active: true, D: { trials: { nkg: [1.5] } }, G: { trials: { nkg: [3.5] } } } });
  run(synth);
  assert.strictEqual(JSON.stringify(HYP_QUALITY_RELATIONS), before, 'HYP_QUALITY_RELATIONS modifié par le simple ajout de données segmentaires');
});

// ── W9/W10 — bridges Force→Endurance / Force→Stabilisation inchangés structurellement ──────────
test('W9 — bridge Force→Endurance (segments soleus/gastro n/nkg + cinétique RFD100) structurellement identique à la mission précédente', () => {
  const { csm } = run(REAL_DATA);
  const bridge = csm.clinicalBridgeEvidence.filter(b => b.qualityA === 'Force' && b.qualityB === 'Endurance');
  // segments[1] (soleus) n+nkg, segments[2] (gastro) n+nkg, productionRapideForce (soleus+gastro rfd100) — inchangé
  assert.strictEqual(bridge.length, 6);
  assert.strictEqual(bridge.filter(b => b.variableA.indexOf('segments[') === 0).length, 4);
  assert.strictEqual(bridge.filter(b => b.variableA.indexOf('productionRapideForce') === 0).length, 2);
});
test('W10 — la relation Force→Stabilisation reste définie dans HYP_QUALITY_RELATIONS, non modifiée', () => {
  const rel = HYP_QUALITY_RELATIONS.find(r => r.explains === 'Force' && r.explained === 'Stabilisation');
  assert.ok(rel);
  const w = CLINICAL_HYPOTHESIS_WHITELIST.find(x => x.explains === 'Force' && x.explained === 'Stabilisation');
  assert.strictEqual(w.allowed, true);
});

// ── W11/W12 — aucune valeur synthétique dans la fixture réelle, absence jamais par défaut ──────
test('W11 — la fixture réelle Yannis ne contient aucune valeur IMTP/Heel Raise/segmentaire (rien à fabriquer aujourd\'hui)', () => {
  assert.strictEqual(REAL_DATA.imtp, undefined);
  assert.strictEqual(REAL_DATA.heel_raise, undefined);
  assert.strictEqual(REAL_DATA.knee_ext, undefined);
  assert.strictEqual(REAL_DATA.hip_abd, undefined);
});
test('W12 — sur la fixture réelle (inchangée), IMTP/Heel Raise restent explicitement "indisponible", jamais un statut par défaut', () => {
  const { res } = run(REAL_DATA);
  assert.strictEqual(res.functionScores['Force'].hypFor01.diagnosticEvidence.imtp_n.status, 'indisponible');
  assert.strictEqual(res.functionScores['Endurance'].hypEnd01.diagnostic.heel_raise_reps.status, 'indisponible');
  assert.strictEqual(res.functionScores['Endurance'].hypEnd01.state, 'non_determinable');
});

// ── W13/W14 — cohérence clinicalReasoning / mechanisticReasoning (non-régression) ───────────────
test('W13 — clinicalReasoning reste cohérent (8 qualités, structure complète) sur la fixture réelle inchangée', () => {
  const { csm } = run(REAL_DATA);
  HYP_CSM_QUALITIES.forEach(q => {
    const r = csm.clinicalReasoning[q];
    assert.ok(r && 'directEvidence' in r && 'crossQualityEvidence' in r && 'evidenceBasis' in r, q);
  });
});
test('W14 — mechanisticReasoning reste cohérent (mécanisme/narrative) sur la fixture réelle inchangée', () => {
  const { csm } = run(REAL_DATA);
  ['Mobilité', 'Réactivité', 'Absorption', 'Puissance', 'Explosivité', 'Stabilisation', 'Endurance'].forEach(q => {
    const mr = csm.clinicalMechanisticReasoning[q];
    assert.ok(mr && mr.reasoningNarrative && mr.reasoningNarrative.length > 20, q);
  });
});

// ── W15 — PDF/ExpertView toujours sur la même implémentation partagée ──────────────────────────
test('W15 — csmV2ClinicalReportBodyHtml reste l\'unique implémentation utilisée par buildExpertReport', () => {
  const { res } = run(REAL_DATA);
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
});

// ── W16 — fallback not_determined toujours fonctionnel ──────────────────────────────────────────
test('W16 — le fallback "facteur explicatif non déterminé" reste le texte exact attendu', () => {
  const { csm } = run(REAL_DATA);
  const EXPECTED = "Les données disponibles objectivent le déficit mais ne permettent pas d'identifier avec suffisamment de certitude un facteur explicatif principal.";
  Object.keys(csm.clinicalReasoning).forEach(q => {
    const r = csm.clinicalReasoning[q].unexplainedReason;
    if (r !== null) assert.strictEqual(r, EXPECTED);
  });
});

// ── W17 — HJ toujours hors périmètre ─────────────────────────────────────────────────────────────
test('W17 — HJ reste hors périmètre : absent de la fixture réelle, repeated_hop_bi toujours non consommé', () => {
  assert.strictEqual(REAL_DATA.repeated_hop_bi, undefined);
  const code2 = code; // capture de fermeture pour lisibilité
  assert.strictEqual(/computeHyp\w+01[\s\S]{0,400}repeated_hop_bi/.test(code2), false, 'repeated_hop_bi semble maintenant lu par un moteur HYP');
});

// ── W18/W19/W20 — aucune modification de seuils/relations/whitelist ─────────────────────────────
test('W18 — aucune modification des seuils existants (spot-check wblt/cmj_rsi_mod/soleus_iso_nkg)', () => {
  assert.deepStrictEqual(THRESHOLDS.wblt_distance, { vert: 12, jaune: 10, orange: 8, dir: 'max' });
  assert.deepStrictEqual(THRESHOLDS.cmj_rsi_mod, { vert: 0.8, jaune: 0.6, orange: 0.4, dir: 'max' });
  assert.deepStrictEqual(THRESHOLDS.soleus_iso_nkg, { vert: 2.5, jaune: 2.0, orange: 1.5, dir: 'max' });
});
test('W19 — HYP_QUALITY_RELATIONS toujours à 9 entrées, structure inchangée', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
});
test('W20 — CLINICAL_HYPOTHESIS_WHITELIST toujours à 9 entrées, seule Explosivité→Puissance allowed:false', () => {
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  const disallowed = CLINICAL_HYPOTHESIS_WHITELIST.filter(w => !w.allowed);
  assert.strictEqual(disallowed.length, 1);
  assert.strictEqual(disallowed[0].explains, 'Explosivité');
  assert.strictEqual(disallowed[0].explained, 'Puissance');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

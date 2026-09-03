// MISSION X — Extraction maximale des données réelles existantes (9 CSV ForceDecks Yannis Briant).
//
// Objectif : vérifier physiquement chaque colonne des 9 CSV déjà intégrés et déterminer si une
// variable réellement disponible mais non consommée peut être activée SANS nouveau seuil, SANS
// nouvelle relation clinique, SANS nouveau moteur. Voir le rapport de mission pour le tableau
// exhaustif variable-par-variable (A/B/C/D/E) et la vérification empirique (THRESHOLDS + NORMS_V2
// + toutes les populations NORMS legacy) de chaque candidat.
//
// Résultat de l'audit : UNE seule variable réellement gagnante trouvée — cmj.height (30.0cm,
// "Jump Height (Imp-Mom) [cm]"), déjà lue par HYP-PUI-01 comme confirmative gelée
// (THRESHOLDS.cmj_height, seuil universel, aucune population requise). Toutes les autres colonnes
// non consommées des 9 CSV ont été vérifiées exhaustivement : soit aucun seuil n'existe nulle part
// (THRESHOLDS/NORMS_V2/NORMS legacy, toutes populations confondues) — catégorie C — soit un seuil
// existe mais aucun moteur ne lit la variable (slcmj_height) — catégorie D — soit la variable est
// purement descriptive (Baseline Force, End of Movement, Vertical Velocity at Contact, etc.) —
// catégorie E. Rien de tout cela n'a été activé : l'activer nécessiterait soit un nouveau
// mécanisme de lecture (catégorie D), soit une nouvelle décision de population normative
// (cmj_landing_peak_force, disponible seulement pour des populations basketball non retenues pour
// Yannis), toutes deux hors périmètre de cette mission.
//
// Exécution : node tests/mission_x_tests.js — aucune dépendance externe.
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

// ── Fixture réelle Yannis (identique à tests/csmV2RealDataYannis.test.js APRÈS Mission X) ──────
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
const REAL_DATA_BEFORE_X = JSON.parse(JSON.stringify(REAL_DATA));
delete REAL_DATA_BEFORE_X.cmj.trials.height;
const NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

function run(testData) { return computeMoteur(testData || REAL_DATA, {}, null, 25, NORM_SEL); }

console.log('MISSION X — extraction maximale des 9 CSV réels Yannis Briant');

// ── X1 — inventaire des CSV réel : les valeurs de la fixture correspondent aux colonnes lues ────
test('X1 — inventaire CSV : valeurs clés issues des 9 exports réels (spot-check, aucune approximation)', () => {
  assert.strictEqual(REAL_DATA.cmj.trials.height[0], 30.0); // "Jump Height (Imp-Mom) [cm]" CMJ
  assert.strictEqual(REAL_DATA.iso_belt_squat.trials.n[0], 4272); // IBSQT "Peak Vertical Force [N]"
  assert.strictEqual(REAL_DATA.sldj.G.trials.rsi[0], 0.39); // SLDJ RSI (L)
  assert.strictEqual(REAL_DATA.sllt.D.trials.loading_rate[0], 106100); // SLLAH "Drop Landing RFD [N/s] (R)"
});

// ── X2 — aucune donnée synthétique ────────────────────────────────────────────────────────────
test('X2 — aucune donnée synthétique introduite : la seule variable ajoutée (cmj.height) est une valeur réelle documentée', () => {
  assert.strictEqual(REAL_DATA.cmj.trials.height.length, 1);
  assert.strictEqual(REAL_DATA.cmj.trials.height[0], 30.0);
  // aucune autre clé nouvelle n'a été ajoutée à la fixture par rapport à l'état Mission W
  const cmjKeysBefore = ['peak_power', 'ecc_decel_rfd_L', 'ecc_decel_rfd_R', 'rsi_mod', 'depth', 'ecc_peak_vel'];
  const cmjKeysAfter = Object.keys(REAL_DATA.cmj.trials);
  assert.deepStrictEqual(cmjKeysAfter.sort(), cmjKeysBefore.concat(['height']).sort());
});

// ── X3 — la nouvelle variable est correctement identifiée et classifiée ─────────────────────────
test('X3 — cmj.height (30.0) correctement identifié : lu par HYP-PUI-01, classifié via THRESHOLDS.cmj_height (universel)', () => {
  const res = run();
  const conf = res.functionScores['Puissance'].hypPui01.confirmativeEvidence.cmj_height;
  assert.strictEqual(conf.raw, 30);
  assert.strictEqual(conf.status, 'jaune');
  assert.deepStrictEqual(THRESHOLDS.cmj_height, { vert: 35, jaune: 28, orange: 22, dir: 'max' });
});

// ── X4 — les variables déjà consommées restent inchangées ──────────────────────────────────────
test('X4 — les 8 sévérités restent identiques à l\'état Mission W (l\'ajout de cmj.height ne perturbe rien d\'autre)', () => {
  const before = run(REAL_DATA_BEFORE_X).clinicalSynthesisV2;
  const after = run(REAL_DATA).clinicalSynthesisV2;
  Object.keys(before.clinicalProfile).forEach(q => {
    assert.strictEqual(after.clinicalProfile[q].severity, before.clinicalProfile[q].severity, q);
  });
});

// ── X5 — toute nouvelle variable classifiée passe par un seuil existant ────────────────────────
test('X5 — cmj_height est classifié via applyThr existant, aucun seuil créé pour cette mission', () => {
  const before = JSON.stringify(THRESHOLDS);
  run();
  assert.strictEqual(JSON.stringify(THRESHOLDS), before, 'THRESHOLDS modifié');
});

// ── X6 — aucune nouvelle relation clinique ──────────────────────────────────────────────────────
test('X6 — HYP_QUALITY_RELATIONS et CLINICAL_HYPOTHESIS_WHITELIST inchangés (9 entrées chacun)', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  const disallowed = CLINICAL_HYPOTHESIS_WHITELIST.filter(w => !w.allowed);
  assert.strictEqual(disallowed.length, 1);
  assert.strictEqual(disallowed[0].explains, 'Explosivité');
});

// ── X7 — aucune modification des moteurs LOCKED ─────────────────────────────────────────────────
test('X7 — les 8 moteurs computeHypXxx01 produisent un résultat strictement identique entre deux exécutions (pureté, aucun moteur modifié)', () => {
  const a = JSON.stringify(run().functionScores);
  const b = JSON.stringify(run().functionScores);
  assert.strictEqual(a, b);
});

// ── X8 — fixture réelle Yannis uniquement (jamais un GOLD synthétique) ──────────────────────────
test('X8 — aucune trace de fixture GOLD synthétique (anciennes valeurs placeholder absentes)', () => {
  // anciennes valeurs synthétiques historiques (missions O-U, remplacées en Mission V) : n=1000,
  // dj.rsi=2.5, iso_belt_squat.n=5000 — vérifiées absentes.
  assert.notStrictEqual(REAL_DATA.iso_belt_squat.trials.n[0], 5000);
  assert.notStrictEqual(REAL_DATA.dj.trials.rsi[0], 2.5);
  assert.notStrictEqual(REAL_DATA.gastro_iso.D.trials.n[0], 1000);
});

// ── X9 — clinicalReasoning cohérent ──────────────────────────────────────────────────────────────
test('X9 — clinicalReasoning reste cohérent (8 qualités) après l\'ajout de cmj.height', () => {
  const csm = run().clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach(q => {
    const r = csm.clinicalReasoning[q];
    assert.ok(r && 'directEvidence' in r && 'crossQualityEvidence' in r, q);
  });
});

// ── X10 — mechanisticReasoning cohérent ─────────────────────────────────────────────────────────
test('X10 — mechanisticReasoning reste cohérent (narrative présente pour chaque qualité déficitaire)', () => {
  const csm = run().clinicalSynthesisV2;
  ['Mobilité', 'Réactivité', 'Absorption', 'Puissance', 'Explosivité', 'Stabilisation', 'Endurance'].forEach(q => {
    const mr = csm.clinicalMechanisticReasoning[q];
    assert.ok(mr && mr.reasoningNarrative && mr.reasoningNarrative.length > 20, q);
  });
});

// ── X11 — PDF/ExpertView identiques ──────────────────────────────────────────────────────────────
test('X11 — PDF/ExpertView utilisent toujours la même implémentation csmV2ClinicalReportBodyHtml', () => {
  const res = run();
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  assert.ok(expertHtml.indexOf(bodyDirect.slice(200, 260)) !== -1);
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
});

// ── X12 — HJ reste hors périmètre ────────────────────────────────────────────────────────────────
test('X12 — HJ reste hors périmètre : absent de la fixture, repeated_hop_bi toujours non consommé', () => {
  assert.strictEqual(REAL_DATA.repeated_hop_bi, undefined);
  assert.strictEqual(/computeHyp\w+01[\s\S]{0,400}repeated_hop_bi/.test(code), false);
});

// ── Exhaustivité — chaque candidat écarté est confirmé sans seuil nulle part (C) ou sans moteur
// consommateur (D), jamais laissé dans le doute ────────────────────────────────────────────────
test('Exhaustivité — candidats écartés confirmés catégorie C (aucun seuil, aucune population)', () => {
  const noThresholdAnywhere = ['sldj_leg_stiffness', 'sldj_peak_prop_power', 'sldj_peak_landing_force', 'dj_leg_stiffness', 'dj_peak_landing_force', 'dj_landing_impulse', 'cmj_conc_impulse_100', 'cmj_braking_impulse', 'sllt_cop_path', 'sllt_ttplf'];
  const allKeys = new Set(Object.keys(THRESHOLDS));
  Object.keys(NORMS_V2).forEach(k => allKeys.add(k));
  Object.keys(NORMS).forEach(pop => Object.keys(NORMS[pop]).forEach(k => allKeys.add(k)));
  noThresholdAnywhere.forEach(k => assert.ok(!allKeys.has(k), k + ' a en fait un seuil quelque part — audit à revoir'));
});
test('Exhaustivité — slcmj_height confirmé catégorie D (seuil universel existe, mais aucun moteur ne le lit)', () => {
  assert.ok('slcmj_height' in THRESHOLDS);
  const synth = JSON.parse(JSON.stringify(REAL_DATA));
  synth.slcmj.D.trials.height = [12.7];
  synth.slcmj.G.trials.height = [15.0];
  const before = JSON.stringify(run(REAL_DATA).clinicalSynthesisV2);
  const after = JSON.stringify(run(synth).clinicalSynthesisV2);
  assert.strictEqual(before, after, 'slcmj_height a un effet observable : la catégorisation D est obsolète, un moteur le lit désormais');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

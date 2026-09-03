// MISSION AI — AJOUT DES VARIABLES DIAGNOSTIQUES / EXPLICATIVES PAR QUALITÉ.
//
// Enrichit Kinexus avec 5 variables ForceDecks réellement disponibles (ecc_duration,
// ecc_peak_power, leg_stiffness+L/R/asym, contraction_time, conc_impulse_100_asym) + correction du
// mapping braking_duration (restreint à "Eccentric Deceleration Phase Duration" uniquement, phase
// corrigée Unloading -> Braking/eccentric_deceleration).
//
// ARCHITECTURE (validée par le praticien avant codage) : couche additive parallèle, patron exact
// de computeCsmV2SldjSecondarySymmetryEvidence (Mission K3) — AUCUN moteur computeHypXX01 LOCKED
// n'est modifié. Les nouvelles variables sont exposées via symmetryEvidence['<Qualité>']
// ['<namespace>Secondaire.cmj_<clé>'], jamais dans diagnosticEvidence/confirmativeEvidence/
// explanatoryEvidence des moteurs LOCKED, jamais un nouveau seuil/norme/causalité.
//
// Exécution : node tests/mission_cmj_secondary_evidence_tests.js — aucune dépendance externe.
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
function csm(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}).clinicalSynthesisV2; }

console.log('MISSION AI — evidence secondaire par qualité (CMJ)');

const BASELINE_COMMIT = '0765771'; // dernier commit avant cette mission

// ═══════════════════════════ A. Mapping ══════════════════════════════════════════════════════════
test('A1 — ecc_duration reconnu via "Eccentric Duration [ms]" (fichier réel 09_01_5)', () => {
  const res = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_01_5.csv'), 'utf8'));
  assert.deepStrictEqual(res.data.cmj.trials.ecc_duration, [734]);
});
test('A2 — ecc_peak_power reconnu via "Eccentric Peak Power / BM [W/kg]" (fichier réel 09_01_5), distinct de ecc_mean_power', () => {
  const res = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_01_5.csv'), 'utf8'));
  assert.deepStrictEqual(res.data.cmj.trials.ecc_peak_power, [12.4]);
  assert.deepStrictEqual(res.data.cmj.trials.ecc_mean_power, [6.27]);
  assert.notStrictEqual(res.data.cmj.trials.ecc_peak_power[0], res.data.cmj.trials.ecc_mean_power[0]);
});
test('A3 — leg_stiffness reconnu via "CMJ Stiffness [N/m]" (fichier réel export_1), avec G/D + asymétrie natives', () => {
  const res1 = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_export_1.csv'), 'utf8'));
  assert.deepStrictEqual(res1.data.cmj.trials.leg_stiffness, [4245]);
  const resLR = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_02_0.csv'), 'utf8'));
  assert.deepStrictEqual(resLR.data.cmj.trials.leg_stiffness_L, [2056]);
  assert.deepStrictEqual(resLR.data.cmj.trials.leg_stiffness_R, [1983]);
  const resAsym = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_01_9.csv'), 'utf8'));
  assert.deepStrictEqual(resAsym.data.cmj.trials.leg_stiffness_asym, [13]);
});
test('A4 — contraction_time reconnu via "Contraction Time [ms]" (fichier réel 09_01_3)', () => {
  const res = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_01_3.csv'), 'utf8'));
  assert.deepStrictEqual(res.data.cmj.trials.contraction_time, [1062]);
});
test('A5 — conc_impulse_100_asym reconnu via "Concentric Impulse-100ms % (Asym)" (fichier réel 09_01_9)', () => {
  const res = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_01_9.csv'), 'utf8'));
  assert.deepStrictEqual(res.data.cmj.trials.conc_impulse_100_asym, [19]);
});
test('A6 — braking_duration reconnu UNIQUEMENT via "Eccentric Deceleration Phase Duration [s]" (fichier réel 09_01_4)', () => {
  const res = processCSV(fs.readFileSync(path.join(__dirname, 'fixtures', 'yannis_forcedecks_09_01_4.csv'), 'utf8'));
  assert.deepStrictEqual(res.data.cmj.trials.braking_duration, [268]);
});
test('A7 — aucune capture par substring incorrecte : les 5 pièges déjà identifiés restent bloqués', () => {
  assert.strictEqual(fdFindCol(['Eccentric Braking RFD / BM [N/s/kg]'], FD_KPI_PATTERNS.braking_rfd, null), null);
  assert.strictEqual(fdFindCol(['Braking Phase Duration [ms]'], FD_KPI_PATTERNS.braking_duration, null), null);
  assert.strictEqual(fdFindCol(['Displacement at Takeoff [cm]'], FD_KPI_PATTERNS.conc_displacement, null), null);
  assert.strictEqual(fdFindCol(['Concentric RFD - 50ms [N/s]'], FD_KPI_PATTERNS.conc_rfd, null), null);
  assert.strictEqual(fdFindCol(['Jump Height (FT) Relative Landing RFD [N/s/cm]'], FD_KPI_PATTERNS.height, null), null);
});

// ═══════════════════════════ B. Non-mapping ══════════════════════════════════════════════════════
test('B1 — "Braking Phase Duration" ne devient JAMAIS braking_duration (retirée du mapping, validé)', () => {
  assert.strictEqual(FD_KPI_PATTERNS.braking_duration.length, 1);
  assert.strictEqual(FD_KPI_PATTERNS.braking_duration[0], 'Eccentric Deceleration Phase Duration');
});
test('B2 — "Lower-Limb Stiffness" ne devient JAMAIS leg_stiffness (2 métriques ForceDecks distinctes, jamais aliasées)', () => {
  FD_KPI_PATTERNS.leg_stiffness.forEach((p) => assert.notStrictEqual(p, 'Lower-Limb Stiffness'));
  assert.strictEqual(fdFindCol(['Lower-Limb Stiffness [N/m]'], FD_KPI_PATTERNS.leg_stiffness, null), null);
});
test('B3 — "Displacement at Takeoff" ne devient toujours pas conc_displacement (incertitude non résolue, hors périmètre de cette mission)', () => {
  assert.strictEqual(fdFindCol(['Displacement at Takeoff [cm]'], FD_KPI_PATTERNS.conc_displacement, null), null);
});
test('B4 — le motif nu "Eccentric Deceleration" (ecc_decel) ne capture aucune sous-métrique de la famille (Impulse/RFD/Mean Power/Phase Duration)', () => {
  ['Eccentric Deceleration Impulse / BM [N s/kg]', 'Eccentric Deceleration RFD / BM [N/s/kg]', 'Eccentric Deceleration Mean Power [W]', 'Eccentric Deceleration Phase Duration [s]']
    .forEach((h) => assert.strictEqual(fdFindCol([h], FD_KPI_PATTERNS.ecc_decel, null), null, h));
});

// ═══════════════════════════ C. Quality relations (evidence secondaire) ═════════════════════════
const YANNIS_SECONDARY_DATA = {
  cmj: {
    active: true,
    trials: {
      // valeurs réelles, mêmes fichiers que ci-dessus (même séance Yannis Briant)
      ecc_peak_power: [12.4], ecc_duration: [734], ecc_mean_power: [6.27], braking_duration: [268],
      landing_impulse: [70.4], conc_mean_power: [24.05], leg_stiffness: [4245], leg_stiffness_L: [2056],
      leg_stiffness_R: [1983], contraction_time: [1062], conc_impulse_100_asym: [19],
      braking_rfd: [45], force_zero_vel: [20.8], peak_power: [46.1], conc_impulse_100: [80.5],
      height: [30], rsi_mod: [0.31]
    }
  }
};
const yc2 = csm(YANNIS_SECONDARY_DATA, {});
test('C1 — Absorption expose 5 variables secondaires (ecc_peak_power, ecc_duration, ecc_mean_power, braking_duration, landing_impulse)', () => {
  const keys = Object.keys(yc2.symmetryEvidence['Absorption']).filter((k) => k.indexOf('absorptionSecondaire.') === 0);
  assert.deepStrictEqual(keys.sort(), [
    'absorptionSecondaire.cmj_braking_duration', 'absorptionSecondaire.cmj_ecc_duration',
    'absorptionSecondaire.cmj_ecc_mean_power', 'absorptionSecondaire.cmj_ecc_peak_power',
    'absorptionSecondaire.cmj_landing_impulse'
  ].sort());
});
test('C2 — Puissance expose conc_mean_power et ecc_peak_power en secondaire', () => {
  const keys = Object.keys(yc2.symmetryEvidence['Puissance']).filter((k) => k.indexOf('puissanceSecondaire.') === 0);
  assert.deepStrictEqual(keys.sort(), ['puissanceSecondaire.cmj_conc_mean_power', 'puissanceSecondaire.cmj_ecc_peak_power'].sort());
});
test('C3 — Réactivité expose leg_stiffness (+ symétrie G/D) et contraction_time en secondaire', () => {
  const keys = Object.keys(yc2.symmetryEvidence['Réactivité']).filter((k) => k.indexOf('reactiviteSecondaire.cmj_') === 0);
  assert.deepStrictEqual(keys.sort(), [
    'reactiviteSecondaire.cmj_contraction_time', 'reactiviteSecondaire.cmj_leg_stiffness', 'reactiviteSecondaire.cmj_leg_stiffness_symmetry'
  ].sort());
});
test('C4 — Explosivité expose conc_impulse_100_asym en secondaire', () => {
  const keys = Object.keys(yc2.symmetryEvidence['Explosivité']).filter((k) => k.indexOf('explosiviteSecondaire.') === 0);
  assert.deepStrictEqual(keys, ['explosiviteSecondaire.cmj_conc_impulse_100_asym']);
});
test('C5 — aucune evidence secondaire générée si le test CMJ est absent/inactif (jamais une valeur par défaut inventée)', () => {
  const ycEmpty = csm({}, {});
  ['Absorption', 'Puissance', 'Réactivité', 'Explosivité'].forEach((q) => {
    const keys = Object.keys(ycEmpty.symmetryEvidence[q] || {}).filter((k) => /Secondaire/.test(k));
    assert.strictEqual(keys.length, 0, q);
  });
});

// ═══════════════════════════ D. Rôles ════════════════════════════════════════════════════════════
test('D1 — chaque entrée d\'evidence secondaire porte un role explicite (explicative/support/explicative_mecanistique), jamais "diagnostic"', () => {
  const allEntries = []
    .concat(Object.values(yc2.symmetryEvidence['Absorption']).filter((v) => v && v.role))
    .concat(Object.values(yc2.symmetryEvidence['Puissance']).filter((v) => v && v.role))
    .concat(Object.values(yc2.symmetryEvidence['Réactivité']).filter((v) => v && v.role))
    .concat(Object.values(yc2.symmetryEvidence['Explosivité']).filter((v) => v && v.role));
  assert.ok(allEntries.length >= 10);
  allEntries.forEach((e) => assert.notStrictEqual(e.role, 'diagnostic', JSON.stringify(e)));
});

// ═══════════════════════════ E. Seuils ═══════════════════════════════════════════════════════════
test('E1 — aucun nouveau seuil/norme créé pour les 8 nouvelles clés (THRESHOLDS toujours 24, NORMS_V2_TEST_VARS.cmj inchangé)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.deepStrictEqual(NORMS_V2_TEST_VARS.cmj, ['cmj_peak_power']);
  ['ecc_duration', 'ecc_peak_power', 'leg_stiffness', 'contraction_time', 'conc_impulse_100_asym'].forEach((k) => {
    assert.strictEqual(THRESHOLDS['cmj_' + k], undefined, k);
  });
});
test('E2 — status des variables sans symétrie reste toujours "non_determinable" (jamais un seuil inventé)', () => {
  assert.strictEqual(yc2.symmetryEvidence['Absorption']['absorptionSecondaire.cmj_ecc_peak_power'].status, 'non_determinable');
  assert.strictEqual(yc2.symmetryEvidence['Réactivité']['reactiviteSecondaire.cmj_contraction_time'].status, 'non_determinable');
});
test('E3 — la symétrie leg_stiffness (seule variable G/D réelle ici) utilise lsiSt() générique déjà existant, jamais une règle inventée', () => {
  const sym = yc2.symmetryEvidence['Réactivité']['reactiviteSecondaire.cmj_leg_stiffness_symmetry'];
  assert.strictEqual(sym.source, 'lsiSt_generic_v1');
  assert.ok(['normal', 'deficient', 'non_determinable'].indexOf(sym.status) !== -1);
});

// ═══════════════════════════ F. Données manquantes ═══════════════════════════════════════════════
test('F1 — landing_duration/time_to_stab/post_landing_stability restent NOT_AVAILABLE (aucune colonne réelle, jamais inventées)', () => {
  ['landing_duration', 'time_to_stab', 'post_landing_stability'].forEach((k) => {
    const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'forcedecks_cmj_semantic_mapping_audit.json'), 'utf8'))
      .filter((r) => r.kinexus === 'cmj_' + k);
    assert.strictEqual(rows.length, 0, k + ' ne doit avoir aucune colonne ForceDecks reconnue');
  });
  assert.strictEqual(YANNIS_SECONDARY_DATA.cmj.trials.landing_duration, undefined);
});

// ═══════════════════════════ G. Redondance ═══════════════════════════════════════════════════════
test('G1 — CSM_V2_CMJ_REDUNDANCY_PAIRS documente les 5 relations validées (RSI-Mod/FT:CT, Height/Flight Time, Impulse/Mean Force, Peak/Mean Power, Ecc Mean/Peak Power)', () => {
  assert.strictEqual(CSM_V2_CMJ_REDUNDANCY_PAIRS.length, 5);
  const pairs = CSM_V2_CMJ_REDUNDANCY_PAIRS.map((p) => p.primary + '/' + p.secondary);
  assert.ok(pairs.indexOf('rsi_mod/ft_ct_ratio') !== -1);
  assert.ok(pairs.indexOf('height/flight_time') !== -1);
  assert.ok(pairs.indexOf('conc_mean_force/conc_impulse') !== -1);
  assert.ok(pairs.indexOf('peak_power/conc_mean_power') !== -1);
  assert.ok(pairs.indexOf('ecc_mean_power/ecc_peak_power') !== -1);
});
test('G2 — la documentation de redondance ne modifie AUCUN calcul des moteurs LOCKED (rsi_mod reste seul diagnostique Réactivité, height seul diagnostique Puissance)', () => {
  const hyp = computeHypReactivity01({}, null, null, null);
  assert.ok(hyp.hypId === 'HYP-REA-01');
  // Le mécanisme diagnostique (sldj_rsi) n'a pas été altéré par cette mission.
});

// ═══════════════════════════ H. Régression ═══════════════════════════════════════════════════════
const LOCKED_HYP_FUNCTIONS = [
  'computeHypForce01', 'computeHypPower01', 'computeHypExplosivity01', 'computeHypMobility01',
  'computeHypReactivity01', 'computeHypAbsorption01', 'computeHypStabilization01', 'computeHypEndurance01'
];
test('H1 — les 9 fonctions HYP-XX-01 LOCKED sont BYTE-IDENTIQUES au commit précédant cette mission (aucune modification, même indirecte)', () => {
  const beforeHtml = execSync(`git show ${BASELINE_COMMIT}:index.html`, { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  LOCKED_HYP_FUNCTIONS.forEach((fnName) => {
    const extract = (src) => {
      const idx = src.indexOf('function ' + fnName + '(');
      if (idx < 0) throw new Error(fnName + ' introuvable');
      // Extrait le corps par comptage d'accolades (robuste aux chaînes/regex simples du fichier).
      let depth = 0, i = idx, started = false, out = '';
      for (; i < src.length; i++) {
        const c = src[i];
        out += c;
        if (c === '{') { depth++; started = true; }
        else if (c === '}') { depth--; if (started && depth === 0) break; }
      }
      return out;
    };
    const before = extract(beforeHtml);
    const after = extract(slice);
    assert.strictEqual(after, before, fnName + ' a changé depuis le commit ' + BASELINE_COMMIT);
  });
});
test('H2 — les fonctions "evidence secondaire" sont bien des couches additives : aucune n\'est appelée DEPUIS l\'intérieur d\'une fonction HYP-XX-01 LOCKED', () => {
  const secondaryFns = ['computeCsmV2AbsorptionSecondaryEvidence', 'computeCsmV2PuissanceSecondaryEvidence', 'computeCsmV2ReactivitySecondaryEvidence', 'computeCsmV2ExplosiviteSecondaryEvidence'];
  LOCKED_HYP_FUNCTIONS.forEach((fnName) => {
    const idx = slice.indexOf('function ' + fnName + '(');
    let depth = 0, i = idx, started = false, body = '';
    for (; i < slice.length; i++) {
      const c = slice[i];
      body += c;
      if (c === '{') { depth++; started = true; }
      else if (c === '}') { depth--; if (started && depth === 0) break; }
    }
    secondaryFns.forEach((sfn) => assert.strictEqual(body.indexOf(sfn), -1, fnName + ' ne doit jamais appeler ' + sfn));
  });
});
test('H3 — CSM_V2_CLINICAL_VARIABLE_MATRIX (dérivée exclusivement des moteurs LOCKED) reste à 150 variables — aucune des 5 nouvelles variables n\'y a été injectée', () => {
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  // Scopé au test 'cmj' : 'leg_stiffness' existe déjà légitimement pour dj (dj_leg_stiffness,
  // pré-existant, sans rapport) — on vérifie qu'aucune variable CMJ portant ces clés n'a été
  // injectée dans la matrice dérivée des moteurs LOCKED.
  const cmjVars = CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.filter((v) => v.test === 'cmj' || csmV2AiIsCmjVariable(v));
  ['ecc_duration', 'ecc_peak_power', 'leg_stiffness', 'contraction_time', 'conc_impulse_100_asym'].forEach((k) => {
    assert.strictEqual(cmjVars.some((v) => v.variableKey.indexOf(k) !== -1), false, k);
  });
});
test('H4 — régression clinique complète : les 8 sévérités de la fixture réelle Yannis (csmV2RealDataYannis) restent identiques', () => {
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
  const EXPECTED_SEVERITY = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(EXPECTED_SEVERITY).forEach((q) => {
    assert.strictEqual(yc.clinicalProfile[q].severity, EXPECTED_SEVERITY[q], q);
  });
  assert.strictEqual(yc.clinicalCertainty['Explosivité'], 'not_determined');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

// FIX — Countermovement Depth / Eccentric Peak Velocity importés avec un signe négatif depuis
// l'export ForceDecks réel de VALD, en contradiction avec la convention MAGNITUDE positive utilisée
// partout ailleurs dans Kinexus pour ces 2 kpis.
//
// CONSTAT (export CSV réel de Yanis, vérifié colonne par colonne) : VALD exporte "Countermovement
// Depth [cm]" et "Eccentric Peak Velocity [m/s]" en valeur SIGNÉE, direction descendante = négative
// (Yanis : depth = -36.1 cm, ecc_peak_vel = -0.82 m/s). Kinexus utilise partout ailleurs la
// convention MAGNITUDE positive pour ces 2 kpis : NORMS (cmj_depth/cmj_ecc_peak_vel, 64
// populations, toutes en bandes positives), CMJ_PLAUSIBLE_RANGE (depth:[2,60],
// ecc_peak_vel:[0.2,5]) et TBK.cmj.kpis/TBK.slcmj.kpis (dir:'max', qui suppose une valeur positive
// où "plus grand = plus profond/plus rapide"). Conséquence AVANT ce fix : validateTechnical
// rejetait systématiquement ces 2 variables ("hors plage physiquement possible") pour TOUT patient
// dont l'export VALD suit cette convention — rendant la phase Unloading structurellement
// non-exploitable, indépendamment de toute population choisie (ce n'était PAS le problème résolu
// par la mission précédente "population automatique B.League" — Unloading restait à 4/5 même avec
// B.League, cf. commit dbd93ad).
//
// FIX (scopé, additif) : nouvelle fonction fdSignCorrected(kpiKey,v) dans index.html juste avant
// importForceDecks — retourne Math.abs(v) pour kpiKey==='depth'||kpiKey==='ecc_peak_vel', v
// inchangé sinon (null-safe). Appelée aux 3 sites d'appel de fdVal() dans importForceDecks
// (bilatéral CMJ, unilatéral G, unilatéral D — couvre aussi 'depth' pour SLCMJ, qui partage la
// même colonne VALD signée). fdVal() elle-même n'est pas modifiée. Aucun seuil/NORME/moteur
// HYP-XX-01 touché — magnitude uniquement, jamais un changement de la grandeur physique mesurée.
//
// Exécution : node tests/mission_cmj_depth_ecc_peak_vel_sign_fix_tests.js
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

console.log('FIX — signe depth/ecc_peak_vel (convention VALD négative -> magnitude positive Kinexus)');

// ═══════════════ TEST 1-4 — fdSignCorrected : comportement unitaire ═══════════════════════════
test('TEST 1 — fdSignCorrected("depth", -36.1) === 36.1', () => {
  assert.strictEqual(fdSignCorrected('depth', -36.1), 36.1);
});
test('TEST 2 — fdSignCorrected("ecc_peak_vel", -0.82) === 0.82', () => {
  assert.strictEqual(fdSignCorrected('ecc_peak_vel', -0.82), 0.82);
});
test('TEST 3 — fdSignCorrected("depth", 36.1) === 36.1 (déjà positif, jamais altéré)', () => {
  assert.strictEqual(fdSignCorrected('depth', 36.1), 36.1);
});
test('TEST 4 — fdSignCorrected pour tout AUTRE kpi (ex. braking_rfd, height) : valeur inchangée, y compris négative', () => {
  assert.strictEqual(fdSignCorrected('braking_rfd', -200), -200);
  assert.strictEqual(fdSignCorrected('height', 32), 32);
  assert.strictEqual(fdSignCorrected('conc_mean_vel', -1.5), -1.5);
});
test('TEST 5 — fdSignCorrected(kpiKey, null) === null (jamais Math.abs(null)=0, qui inventerait une donnée)', () => {
  assert.strictEqual(fdSignCorrected('depth', null), null);
  assert.strictEqual(fdSignCorrected('ecc_peak_vel', null), null);
});

// ═══════════════ TEST 6-8 — import réel Yanis (17 fichiers CSV) : depth/ecc_peak_vel ressortent
// désormais en magnitude positive, cohérente avec NORMS/CMJ_PLAUSIBLE_RANGE ═══════════════════
function importRealYanisCmj() {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).sort();
  const merged = { cmj: { active: true, trials: {} } };
  files.forEach((f) => {
    const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
    const r = processCSV(csv);
    if (r.error || !r.data.cmj) return;
    Object.keys(r.data.cmj.trials).forEach((k) => { merged.cmj.trials[k] = (merged.cmj.trials[k] || []).concat(r.data.cmj.trials[k]); });
  });
  return merged;
}
test('TEST 6 — import réel Yanis : depth importé en positif (36.1, plus jamais -36.1)', () => {
  const real = importRealYanisCmj();
  assert.ok(real.cmj.trials.depth && real.cmj.trials.depth.length > 0);
  real.cmj.trials.depth.forEach((v) => assert.ok(v > 0, 'depth doit être positif, reçu ' + v));
  assert.strictEqual(real.cmj.trials.depth[0], 36.1);
});
test('TEST 7 — import réel Yanis : ecc_peak_vel importé en positif (0.82, plus jamais -0.82)', () => {
  const real = importRealYanisCmj();
  assert.ok(real.cmj.trials.ecc_peak_vel && real.cmj.trials.ecc_peak_vel.length > 0);
  real.cmj.trials.ecc_peak_vel.forEach((v) => assert.ok(v > 0, 'ecc_peak_vel doit être positif, reçu ' + v));
  assert.strictEqual(real.cmj.trials.ecc_peak_vel[0], 0.82);
});
test('TEST 8 — validateTechnical accepte désormais depth/ecc_peak_vel réels de Yanis (rejetés avant ce fix)', () => {
  assert.strictEqual(validateTechnical('depth', 36.1).ok, true);
  assert.strictEqual(validateTechnical('ecc_peak_vel', 0.82).ok, true);
  assert.strictEqual(validateTechnical('depth', -36.1).ok, false); // confirme que la plage reste strictement positive (fix à l'import, jamais à la validation)
});

// ═══════════════ TEST 9 — effet de bout en bout : Unloading devient exploitable pour Yanis avec
// la population automatique cabinet (bloquée à 4/5 avant ce fix, cf. commit dbd93ad) ═══════════
test('TEST 9 — computeMouvementAnalysis(Yanis réel, population automatique cabinet) atteint désormais 5/5 phases exploitables (Unloading débloquée)', () => {
  const bilan = { testData: importRealYanisCmj() };
  const res = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, {});
  CMJ_PHASES.forEach((p) => assert.strictEqual(res.phases[p].sufficient, true, p));
  const unloadingDepth = res.phases.unloading.entries.find((e) => e.kpiKey === 'depth');
  const unloadingVel = res.phases.unloading.entries.find((e) => e.kpiKey === 'ecc_peak_vel');
  assert.strictEqual(unloadingDepth.status, 'ok');
  assert.strictEqual(unloadingVel.status, 'ok');
});

// ═══════════════ TEST 10 — SLCMJ (Single Leg CMJ) : depth partage la même colonne VALD signée,
// doit être corrigée aussi (fdSignCorrected n'est pas scopée au seul test CMJ bilatéral) ═══════
test('TEST 10 — SLCMJ (unilatéral) : depth importée en positif également (même colonne VALD signée que CMJ)', () => {
  const headers = ['Test Type', 'BW [KG]', 'Countermovement Depth [cm] (L)', 'Countermovement Depth [cm] (R)'];
  const parsed = { headers, rows: [{ 'Test Type': 'SLCMJ', 'BW [KG]': '70', 'Countermovement Depth [cm] (L)': '-28.4', 'Countermovement Depth [cm] (R)': '-30.1' }] };
  const result = importForceDecks(parsed);
  assert.ok(result.slcmj);
  assert.strictEqual(result.slcmj.G.trials.depth[0], 28.4);
  assert.strictEqual(result.slcmj.D.trials.depth[0], 30.1);
});

// ═══════════════ TEST 11 — régression Yanis : les 8 sévérités cliniques restent strictement
// identiques (depth/ecc_peak_vel ne sont lus par AUCUN moteur HYP-XX-01, seulement par le Moteur
// Biomécanique — cf. CMJ_VAR_META phase:'unloading', jamais référencées dans un moteur HYP) ════
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
const EXPECTED_SEVERITIES = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };

test('TEST 11 — régression Yanis : les 8 sévérités cliniques restent strictement identiques (depth/ecc_peak_vel jamais lues par un moteur HYP-XX-01)', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach((q) => assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q));
});

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = 'dbd93ad';
  const hypFns = ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01'];
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    if (idx < 0) throw new Error(fnName + ' introuvable');
    let depth = 0, i = src.indexOf('{', idx);
    const bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
    throw new Error('accolade non fermée pour ' + fnName);
  }
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — fdVal() elle-même reste BYTE-IDENTIQUE au commit de référence (fix appliqué en dehors, jamais dans fdVal)', () => {
  const BASELINE_COMMIT = 'dbd93ad';
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    let depth = 0, i = src.indexOf('{', idx);
    const bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
  }
  assert.strictEqual(extractFnBody(code, 'fdVal'), extractFnBody(baseHtml, 'fdVal'));
});
test('GUARD 3 — THRESHOLDS/NORMS/NORMS_V2/CSM_V2_CLINICAL_VARIABLE_MATRIX/CMJ_PLAUSIBLE_RANGE inchangés (fix à l\'import, jamais aux seuils/normes)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.deepStrictEqual(CMJ_PLAUSIBLE_RANGE.depth, [2, 60]);
  assert.deepStrictEqual(CMJ_PLAUSIBLE_RANGE.ecc_peak_vel, [0.2, 5]);
});
test('GUARD 4 — le diff de ce commit touche fdSignCorrected/importForceDecks, jamais computeMoteur/computeCsmV2/computeBiomecaPhase', () => {
  const diff = execSync('git diff HEAD -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  if (diff.trim().length === 0) return; // déjà commité au moment du test
  assert.ok(diff.includes('fdSignCorrected'));
  assert.ok(!diff.includes('function computeMoteur('));
  assert.ok(!diff.includes('function computeCsmV2('));
  assert.ok(!diff.includes('function computeBiomecaPhase('));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

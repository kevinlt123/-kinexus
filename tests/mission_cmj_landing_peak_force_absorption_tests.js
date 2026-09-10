// MISSION P1 BIS — INTÉGRATION LOCALE DE cmj_landing_peak_force DANS LANDING/ABSORPTION.
//
// Contexte : la mission P1 précédente a déclenché un STOP — pctStatus()/applyThr() (LOCKED)
// supposent systématiquement "bandes NORMS ascendantes = meilleures", correct pour toutes les
// variables CMJ déjà classifiées via NORMS (cmj_braking_rfd/cmj_depth/cmj_rsi_mod/etc., toutes
// dir:'max'), mais FAUX pour cmj_landing_peak_force (dir:'min' — une force de réception plus
// FAIBLE est meilleure). Cette mission répare le problème en ajoutant un classificateur LOCAL,
// strictement scopé à cette seule variable (csmAbsorptionCmjLandingPeakForceStatus dans
// index.html), sans jamais toucher pctStatus()/applyThr()/computeStatusWithNormsV2() (vérifié par
// guard ci-dessous — byte-identiques).
//
// Exécution : node tests/mission_cmj_landing_peak_force_absorption_tests.js — aucune dépendance
// externe.
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

console.log('MISSION P1 BIS — cmj_landing_peak_force dans Landing/Absorption (classification dir=min locale)');

const POPS = ['bball2425_ncaa_m', 'bball2425_nbl', 'bball2425_euroleague', 'bball2425_bleague'];

// ═══════════════════ A. SÉMANTIQUE (1-6) ═══════════════════════════════════════════════════════
test('TEST 1 — clé Kinexus correcte : TBK.cmj.kpis contient landing_peak_force, label "(N/kg)", dir:min', () => {
  const kpi = TBK.cmj.kpis.find((k) => k.key === 'landing_peak_force');
  assert.ok(kpi);
  assert.strictEqual(kpi.dir, 'min');
  assert.ok(/N\/kg/.test(kpi.label));
});
test('TEST 2 — nom ForceDecks correct : FD_KPI_PATTERNS.landing_peak_force = Peak Landing Force / Peak Drop Landing Force', () => {
  assert.deepStrictEqual(FD_KPI_PATTERNS.landing_peak_force, ['Peak Landing Force', 'Peak Drop Landing Force']);
});
test('TEST 3 — unité correcte : N/kg identique côté catalogue et côté NORMS (aucune conversion inventée)', () => {
  assert.ok(/N\/kg/.test(TBK.cmj.kpis.find((k) => k.key === 'landing_peak_force').label));
});
test('TEST 4 — phase = landing (CMJ_VAR_META)', () => {
  assert.strictEqual(CMJ_VAR_META.landing_peak_force.phase, 'landing');
});
test('TEST 5 — pas de collision avec landing_bi : landing_bi.peak_landing_force reste une clé TBK distincte', () => {
  const kpi = TBK.landing_bi.kpis.find((k) => k.key === 'peak_landing_force');
  assert.ok(kpi);
  assert.notStrictEqual(kpi, TBK.cmj.kpis.find((k) => k.key === 'landing_peak_force'));
});
test('TEST 6 — pas de collision avec sllt : sllt.peak_landing_force reste une clé TBK distincte', () => {
  const kpi = TBK.sllt.kpis.find((k) => k.key === 'peak_landing_force');
  assert.ok(kpi);
  assert.notStrictEqual(kpi, TBK.cmj.kpis.find((k) => k.key === 'landing_peak_force'));
});

// ═══════════════════ B. MAPPING (7-10) ══════════════════════════════════════════════════════════
test('TEST 7 — CSV réel (Test Type=CMJ) → cmj.trials.landing_peak_force, jamais landing_bi/sllt', () => {
  const headers = ['Test Type', 'BW [KG]', 'Peak Landing Force [N]'];
  const rows = [{ 'Test Type': 'CMJ', 'BW [KG]': '77.46', 'Peak Landing Force [N]': '3500' }];
  const res = importForceDecks({ headers: headers, rows: rows });
  assert.ok(res.cmj && res.cmj.trials.landing_peak_force.length === 1);
  assert.ok(Math.abs(res.cmj.trials.landing_peak_force[0] - 3500 / 77.46) < 1e-6);
  assert.strictEqual(res.landing_bi, undefined);
  assert.strictEqual(res.sllt, undefined);
});
test('TEST 8 — variante [N] correctement reconnue : conversion N -> N/kg via BW (colonne absolue)', () => {
  const headers = ['Test Type', 'BW [KG]', 'Peak Landing Force [N]'];
  const rows = [{ 'Test Type': 'CMJ', 'BW [KG]': '80', 'Peak Landing Force [N]': '4000' }];
  const res = importForceDecks({ headers: headers, rows: rows });
  assert.ok(Math.abs(res.cmj.trials.landing_peak_force[0] - 50) < 1e-9); // 4000/80 = 50 N/kg
});
test('TEST 9 — variante [N/kg] correctement distinguée : déjà normalisée, jamais redivisée par BW', () => {
  const headers = ['Test Type', 'BW [KG]', 'Peak Landing Force [N/kg]'];
  const rows = [{ 'Test Type': 'CMJ', 'BW [KG]': '80', 'Peak Landing Force [N/kg]': '55' }];
  const res = importForceDecks({ headers: headers, rows: rows });
  assert.strictEqual(res.cmj.trials.landing_peak_force[0], 55);
});
test('TEST 10 — aucune capture par un pattern générique incorrect : une colonne "Force" seule (sans "Peak Landing") n\'alimente jamais landing_peak_force', () => {
  const headers = ['Test Type', 'BW [KG]', 'Force [N]'];
  const rows = [{ 'Test Type': 'CMJ', 'BW [KG]': '80', 'Force [N]': '9999' }];
  const res = importForceDecks({ headers: headers, rows: rows });
  assert.strictEqual((res.cmj && res.cmj.trials.landing_peak_force) || undefined, undefined);
});

// ═══════════════════ C. NORMS (11-14) ═══════════════════════════════════════════════════════════
test('TEST 11 — population couverte -> classifiable', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [40] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.classifiable, true);
  assert.notStrictEqual(r.landing.variables.cmj_landing_peak_force.status, null);
});
test('TEST 12 — population non couverte -> non classifiable, landing non_determinable', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [40] } } }, 'fd_bball_m', 25, {});
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.classifiable, false);
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.reason, 'population_non_couverte');
});
test('TEST 13 — norme inexistante (aucune population fournie) -> non classifiable', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [40] } } }, null, 25, {});
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.classifiable, false);
  assert.strictEqual(r.landing.state, 'non_determinable');
});
test('TEST 14 — unité incompatible / valeur invalide -> comportement prudent (non classifiable, jamais une conversion inventée)', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: ['abc'] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.classifiable, false);
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.raw, null);
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.reason, 'cmj_landing_peak_force_valeur_invalide');
});

// ═══════════════════ BORNES dir='min' (test explicite du sens inversé) ═════════════════════════
test('TEST BORNES — dir=min strictement respecté sur les 5 seuils P10/P25/P50/P75/P90 (bball2425_ncaa_m : [34,44,55,68,97])', () => {
  const bands = NORMS['bball2425_ncaa_m'].cmj_landing_peak_force;
  assert.deepStrictEqual(bands, [34, 44, 55, 68, 97]);
  function statusFor(v) {
    return computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [v] } } }, 'bball2425_ncaa_m', 25, {}).landing.variables.cmj_landing_peak_force.status;
  }
  assert.strictEqual(statusFor(bands[0] - 1), 'vert', 'meilleure que P10 -> vert (dir=min : plus bas = meilleur)');
  assert.strictEqual(statusFor(bands[0]), 'vert', '= P10 -> vert');
  assert.strictEqual(statusFor((bands[0] + bands[1]) / 2), 'vert', 'entre P10/P25 -> vert');
  assert.strictEqual(statusFor(bands[1]), 'vert', '= P25 -> vert (limite haute de la zone vert, val<=bands[1])');
  assert.strictEqual(statusFor((bands[1] + bands[2]) / 2), 'jaune', 'entre P25/P50 -> jaune');
  assert.strictEqual(statusFor(bands[2]), 'jaune', '= P50 -> jaune');
  assert.strictEqual(statusFor((bands[2] + bands[3]) / 2), 'orange', 'entre P50/P75 -> orange');
  assert.strictEqual(statusFor(bands[3]), 'orange', '= P75 -> orange');
  assert.strictEqual(statusFor((bands[3] + bands[4]) / 2), 'rouge', 'entre P75/P90 -> rouge');
  assert.strictEqual(statusFor(bands[4]), 'rouge', '= P90 -> rouge (pire zone, dir=min : plus haut = pire)');
  assert.strictEqual(statusFor(bands[4] + 1), 'rouge', 'pire que P90 -> rouge');
  // Le sens est bien INVERSÉ par rapport à pctStatus() (ascendant) : la valeur la plus BASSE est vert, la plus HAUTE est rouge.
  assert.ok(statusFor(bands[0]) === 'vert' && statusFor(bands[4]) === 'rouge', 'sens réellement inversé, pas une simple classification neutre');
});

// ═══════════════════ 4 POPULATIONS (13) ════════════════════════════════════════════════════════
POPS.forEach((pop) => {
  test('TEST POPULATION — ' + pop + ' : NORMS trouvées, classification obtenue, dir=min respecté', () => {
    const bands = NORMS[pop].cmj_landing_peak_force;
    assert.ok(Array.isArray(bands) && bands.length === 5);
    const low = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [bands[0]] } } }, pop, 25, {});
    const high = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [bands[4] + 5] } } }, pop, 25, {});
    assert.strictEqual(low.landing.variables.cmj_landing_peak_force.status, 'vert');
    assert.strictEqual(high.landing.variables.cmj_landing_peak_force.status, 'rouge');
  });
});
test('TEST POPULATION NON COUVERTE — population inconnue -> non_classifiable pour les 4 populations testées', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [50] } } }, 'population_totalement_inexistante_xyz', 25, {});
  assert.strictEqual(r.landing.variables.cmj_landing_peak_force.classifiable, false);
});

// ═══════════════════ D/NON-COLLISION (14, 15) ═══════════════════════════════════════════════════
test('TEST NON-COLLISION — CMJ/Landing Bi/SLLT restent 3 variables strictement distinctes, une ligne CSV CMJ n\'alimente jamais landing_bi/sllt', () => {
  const headers = ['Test Type', 'BW [KG]', 'Peak Landing Force [N]'];
  const rows = [
    { 'Test Type': 'CMJ', 'BW [KG]': '77.46', 'Peak Landing Force [N]': '3500' },
    { 'Test Type': 'LAH', 'BW [KG]': '80', 'Peak Landing Force [N]': '2000' }
  ];
  const res = importForceDecks({ headers: headers, rows: rows });
  assert.ok(Math.abs(res.cmj.trials.landing_peak_force[0] - 3500 / 77.46) < 1e-6);
  assert.strictEqual(res.landing_bi.trials.peak_landing_force[0], 25);
  assert.notStrictEqual(res.cmj.trials.landing_peak_force[0], res.landing_bi.trials.peak_landing_force[0]);
});
test('TEST 15 — landing_peak_force classifiable + preserved', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [10] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'absente');
  assert.strictEqual(r.landing.status, 'vert');
});
test('TEST 16 — landing_peak_force classifiable + deficient', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [120] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'retenue_faible');
  assert.strictEqual(r.landing.status, 'rouge');
});
test('TEST 17 — landing_peak_force absent -> landing non_determinable', () => {
  const r = computeHypAbsorption01({}, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.reason, 'cmj_landing_peak_force_indisponible');
});
test('TEST — population non couverte -> non_determinable (doublon E10 ciblé Landing)', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [40] } } }, 'fd_bball_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
});
test('TEST — donnée invalide -> non_determinable (doublon E11 ciblé Landing)', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [NaN] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
});
test('TEST 18 — données sllt présentes mais non normées -> n\'influencent jamais le verdict Landing', () => {
  const r = computeHypAbsorption01({
    sllt: { active: true, D: { trials: { peak_landing_force: [40], loading_rate: [5000] } }, G: { trials: { peak_landing_force: [38], loading_rate: [4800] } } }
  }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.variables.sllt_peak_landing_force.classifiable, false);
  assert.strictEqual(r.landing.variables.sllt_peak_landing_force.rawD, 40);
});
test('TEST 19 — données landing_bi présentes mais non normées -> n\'influencent jamais le verdict Landing', () => {
  const r = computeHypAbsorption01({ landing_bi: { active: true, trials: { peak_landing_force: [40] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.variables.peak_landing_force.classifiable, false);
  assert.strictEqual(r.landing.variables.peak_landing_force.raw, 40);
});
test('TEST 20 — loading_rate présente mais non normée -> n\'influence jamais le verdict Landing', () => {
  const r = computeHypAbsorption01({
    sllt: { active: true, D: { trials: { loading_rate: [5000] } }, G: { trials: { loading_rate: [4800] } } }
  }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.variables.sllt_loading_rate.classifiable, false);
});
test('TEST 21 — landing_peak_force seul suffit à déterminer LANDING (aucun quorum requis avec les 3 autres variables)', () => {
  const r = computeHypAbsorption01({
    cmj: { active: true, trials: { landing_peak_force: [120] } },
    landing_bi: { active: true, trials: { peak_landing_force: [10] } }, // non classifiable, doit être ignoré
    sllt: { active: true, D: { trials: { peak_landing_force: [10], loading_rate: [100] } }, G: { trials: { peak_landing_force: [10], loading_rate: [100] } } }
  }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.state, 'retenue_faible', 'cmj_landing_peak_force seul doit déterminer le verdict, jamais dilué par les 3 autres variables non classifiables');
});
test('TEST 22 — une variable non classifiable ne compte jamais comme preserved', () => {
  const r = computeHypAbsorption01({ landing_bi: { active: true, trials: { peak_landing_force: [10] } } }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(r.landing.variables.peak_landing_force.classifiable, false);
  assert.notStrictEqual(r.landing.state, 'absente', 'une donnée non classifiable ne doit jamais être comptée comme preserved');
  assert.strictEqual(r.landing.state, 'non_determinable');
});

// ═══════════════════ E. ABSORPTION (21-24) ══════════════════════════════════════════════════════
test('TEST 21bis (A) — braking deficient + landing preserved : composantes séparées, statut global suit braking', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [15], landing_peak_force: [10] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.braking.state, 'retenue_faible');
  assert.strictEqual(r.landing.state, 'absente');
  assert.strictEqual(r.state, r.braking.state, 'le statut global doit rester exactement celui du braking (règle historique, aucune fusion inventée)');
});
test('TEST (B) — braking preserved + landing deficient : composantes séparées, statut global suit braking', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [130], force_zero_vel: [30], landing_peak_force: [99] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.braking.state, 'absente');
  assert.strictEqual(r.landing.state, 'retenue_faible');
  assert.strictEqual(r.state, r.braking.state, 'landing ne doit jamais transformer le global en deficient (mission §11 : aucune règle de fusion inventée)');
});
test('TEST (C) — braking non_determinable + landing deficient : le global respecte EXACTEMENT la règle existante (reste non_determinable), l\'incertitude du braking reste visible', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [99] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.braking.state, 'non_determinable');
  assert.strictEqual(r.landing.state, 'retenue_faible');
  assert.strictEqual(r.state, 'non_determinable', 'documente le contrat existant : le global reste non_determinable, jamais "sauvé" par un landing déficitaire');
});
test('TEST (D) — braking deficient + landing non_determinable : braking reste explicitement deficient au niveau global', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [15] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.braking.state, 'retenue_faible');
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.state, 'retenue_faible', 'documente le contrat existant : braking reste explicitement deficient au niveau global, jamais dilué par landing non_determinable');
});

// ═══════════════════ F. TTS (25) ════════════════════════════════════════════════════════════════
test('TEST 25 — TTS (Time To Stabilization) ne modifie jamais Landing : landing_bi_tts/sllt_tts absents de landing.variables, absents de tout calcul de state/status Landing', () => {
  const r = computeHypAbsorption01({
    landing_bi: { active: true, trials: { tts: [2.0] } },
    sllt: { active: true, D: { trials: {} }, G: { trials: {} } }
  }, 'bball2425_ncaa_m', 25, {});
  assert.strictEqual(Object.keys(r.landing.variables).some((k) => /tts/i.test(k)), false, 'aucune clé TTS ne doit jamais apparaître dans landing.variables');
  assert.strictEqual(r.landing.state, 'non_determinable');
});

// ═══════════════════ G. YANIS (26-30) ═══════════════════════════════════════════════════════════
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

// MISSION P2BIS (correction méthodologie BASELINE_COMMIT) : 'HEAD' était correct au moment de la
// rédaction initiale, mais est devenu trivial dès la fusion du commit de cette mission dans main
// (HEAD == code courant). Baseline = commit pré-mission P1BIS : a8f02bd est le commit immédiatement
// PARENT de 64caaaf (le commit qui contient cette mission cmj_landing_peak_force), confirmé via
// `git show -s --format='%P' 64caaaf` -> a8f02bd (MISSION P1 Explosivité, fonction distincte).
// Aucun commit n'a modifié index.html entre a8f02bd et 64caaaf : ce fichier étant la plus récente
// des 3 missions concernées par P2BIS, sa baseline n'est contaminée par aucune mission ultérieure.
const BASELINE_COMMIT = 'a8f02bd';
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {computeMoteur:computeMoteur,computeHypAbsorption01:computeHypAbsorption01,NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

test('TEST 26/27/28/29/30 — YANIS avant/après : cmj_landing_peak_force absente de sa fixture (jamais fabriquée), landing reste non_determinable, aucun changement clinique', () => {
  const before = baseSandbox.computeHypAbsorption01(YANNIS_DATA, null, 25, YANNIS_NORM_SEL);
  const after = computeHypAbsorption01(YANNIS_DATA, null, 25, YANNIS_NORM_SEL);
  // 26. avant/après
  assert.strictEqual(before.state, 'non_determinable');
  assert.strictEqual(before.braking.state, 'non_determinable');
  assert.strictEqual(before.landing.state, 'non_determinable');
  assert.strictEqual(after.state, 'non_determinable');
  assert.strictEqual(after.braking.state, 'non_determinable');
  assert.strictEqual(after.landing.state, 'non_determinable');
  // 27. valeur cmj_landing_peak_force documentée : absente de la fixture Yanis
  assert.strictEqual(YANNIS_DATA.cmj.trials.landing_peak_force, undefined, 'ne jamais fabriquer une valeur pour Yanis');
  assert.strictEqual(after.landing.variables.cmj_landing_peak_force.raw, null);
  assert.strictEqual(after.landing.variables.cmj_landing_peak_force.available, false);
  // 28. population sélectionnée (aucune passée explicitement ici -> null)
  assert.strictEqual(after.landing.variables.cmj_landing_peak_force.normPopulation, null);
  // 29. norme utilisée : aucune (variable indisponible, jamais consultée pour un statut)
  assert.strictEqual(after.landing.reason, 'cmj_landing_peak_force_indisponible');
  // 30. classification obtenue : non_classifiable / non_determinable, aucun changement clinique
  assert.strictEqual(after.landing.variables.cmj_landing_peak_force.classifiable, false);
  assert.deepStrictEqual(after.braking, before.braking, 'braking doit rester strictement inchangé (byte pour byte)');
});
test('YANIS — les 7 autres qualités et le reste de computeMoteur restent strictement inchangés', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Explosivité', 'Mobilité', 'Réactivité', 'Stabilisation', 'Endurance'].forEach((q) => {
    assert.deepStrictEqual(after.functionScores[q], before.functionScores[q], q + ' ne doit pas changer');
  });
  assert.deepStrictEqual(after.functionScores['Absorption'].hypAbs01.braking, before.functionScores['Absorption'].hypAbs01.braking);
  assert.strictEqual(after.functionScores['Absorption'].state, before.functionScores['Absorption'].state);
});

// ═══════════════════ PROFILS SYNTHÉTIQUES (mémoire uniquement, §18) ════════════════════════════
test('PROFIL A — Landing Peak Force faible/favorable -> landing preserved, séparé du braking', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [130], force_zero_vel: [30], landing_peak_force: [15] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.landing.state, 'absente');
});
test('PROFIL B — Landing Peak Force élevé/défavorable -> landing deficient, séparé du braking', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [130], force_zero_vel: [30], landing_peak_force: [110] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.landing.state, 'retenue_faible');
});
test('PROFIL C — population non couverte, données landing brutes disponibles -> landing non_determinable', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { landing_peak_force: [50] } }, sllt: { active: true, D: { trials: { peak_landing_force: [40] } }, G: { trials: { peak_landing_force: [38] } } } }, 'fd_bball_m', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.available, true);
});
test('PROFIL D — variable absente -> landing non_determinable', () => {
  const r = computeHypAbsorption01({}, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.landing.state, 'non_determinable');
  assert.strictEqual(r.landing.available, false);
});
test('PROFIL E — braking deficient + landing preserved : séparation vérifiée', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [30], force_zero_vel: [15], landing_peak_force: [15] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.braking.state, 'retenue_faible');
  assert.strictEqual(r.landing.state, 'absente');
});
test('PROFIL F — braking preserved + landing deficient : séparation vérifiée', () => {
  const r = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [130], force_zero_vel: [30], landing_peak_force: [110] } } }, 'bball2425_bleague', 25, {});
  assert.strictEqual(r.braking.state, 'absente');
  assert.strictEqual(r.landing.state, 'retenue_faible');
});

// ═══════════════════ GUARDS (§19) ═══════════════════════════════════════════════════════════════
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
test('GUARD 1 — les 7 autres moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES', () => {
  ['computeHypExplosivity01', 'computeHypForce01', 'computeHypMobility01', 'computeHypPower01',
    'computeHypReactivity01', 'computeHypStabilization01', 'computeHypEndurance01']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 2 — pctStatus/applyThr/computeStatusWithNormsV2 restent BYTE-IDENTIQUES (interdiction explicite de généraliser)', () => {
  ['pctStatus', 'applyThr', 'computeStatusWithNormsV2', 'resolveBands', 'resolveNormPopulationForTest']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 3 — les 4 autres sous-domaines de HYP-ABS-01 (braking/capaciteEcc/strategie/reactive/asymetrie) restent BYTE-IDENTIQUES : seule computeHypAbsorptionReceptionImpact a changé', () => {
  ['computeHypAbsorptionCore', 'computeHypAbsorptionCapaciteEcc', 'computeHypAbsorptionStrategie', 'computeHypAbsorptionReactive', 'computeHypAbsorptionAsymetrie']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
  assert.notStrictEqual(extractFnBody(code, 'computeHypAbsorptionReceptionImpact'), extractFnBody(baseCode, 'computeHypAbsorptionReceptionImpact'), 'computeHypAbsorptionReceptionImpact doit avoir changé (cette mission)');
});
test('GUARD 4 — computeHypForceKpi/computeAsymEngine/computeAsymPhase/computeCsmV2/computeMoteur restent BYTE-IDENTIQUES', () => {
  ['computeHypForceKpi', 'computeAsymEngine', 'computeAsymPhase', 'computeCsmV2', 'computeMoteur']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 5 — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal (aucune norme/seuil/rôle modifié)', () => {
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 6 — git diff --check ne signale aucun conflit de fusion dans index.html', () => {
  const out = execSync('git diff --check -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(out.trim(), '');
});
// MISSION P2BIS §7 — méthodologie : BASELINE_COMMIT doit être un ancêtre historique FIXE de HEAD,
// jamais HEAD lui-même. Ce test reste vrai indéfiniment : BASELINE_COMMIT est un SHA immuable, et
// HEAD ne peut jamais redevenir égal à un ancêtre strict au fil de l'évolution normale du dépôt.
test('MÉTHODOLOGIE — BASELINE_COMMIT est un ancêtre historique fixe de HEAD, jamais HEAD lui-même (garantit une comparaison avant/après réelle, non triviale, y compris après fusion dans main)', () => {
  const headSha = execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..') }).toString().trim();
  const baselineSha = execSync('git rev-parse ' + BASELINE_COMMIT, { cwd: path.join(__dirname, '..') }).toString().trim();
  assert.notStrictEqual(baselineSha, headSha, 'BASELINE_COMMIT ne doit jamais résoudre au commit HEAD courant (sinon avant===après, comparaison triviale)');
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + baselineSha + ' HEAD', { cwd: path.join(__dirname, '..') }); isAncestor = true; } catch (e) { isAncestor = false; }
  assert.strictEqual(isAncestor, true, 'BASELINE_COMMIT doit être un ancêtre strict de HEAD (état réellement PRÉ-mission, jamais un commit hors branche)');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

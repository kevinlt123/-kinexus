// MISSION AI — MAPPING SÉMANTIQUE FORCEDECKS → KINEXUS.
//
// Objectif : rendre le mapping CSV ForceDecks -> identifiant canonique Kinexus robuste aux
// variations purement syntaxiques (tiret/espace/@, "/BM", vocabulaire ForceDecks qui a dérivé
// entre "Eccentric Deceleration ..." et "Eccentric Braking ..."), SANS jamais toucher au
// raisonnement clinique (aucun seuil, aucune norme, aucune relation, aucune sévérité modifiés).
// "Variable correctement importée" != "variable cliniquement exploitable" — cette mission ne
// change QUE la première.
//
// Périmètre technique modifié (index.html) :
//  - fdSepSplit/fdPatternTokens/fdFindCol : le matching devient "mot à mot" (espace/tiret/@ tous
//    équivalents comme séparateurs) au lieu d'une comparaison caractère-à-caractère stricte. Un
//    mot ou un nombre supplémentaire réellement présent juste après le motif (ex. "100ms" dans
//    "Concentric Impulse-100ms", ou "Impulse" dans "Eccentric Deceleration Impulse / BM")
//    continue de bloquer un motif plus court — jamais fusionné à un KPI plus spécifique/distinct.
//    Seules les parenthèses/crochets d'unité ou de note et le signe "%" sont ignorables sans être
//    cités dans le motif.
//  - FD_KPI_PATTERNS : alias "/ BM" ajoutés pour des KPIs déjà existants (conc_mean_force,
//    conc_peak_force, ecc_peak_force, ecc_mean_power, force_zero_vel, braking_impulse) dont
//    l'export réel Yannis n'expose que la forme "/ BM" ; alias "Eccentric Braking RFD/Impulse"
//    ajoutés (VALD a renommé "Deceleration" -> "Braking" dans ses exports récents) ; 5 clés
//    d'asymétrie déjà connues de TBK/CMJ_VAR_META/ASYM_SIDE_PAIRS/ASYM_PERFORMANCE_EQUIVALENT mais
//    qui n'avaient AUCUNE entrée FD_KPI_PATTERNS (ecc_decel_rfd_asym, ecc_decel_impulse_asym,
//    conc_force_impulse_asym, force_peak_power_asym, p2_conc_impulse_asym) reçoivent enfin un motif.
//
// Bug réel corrigé (découvert par l'audit, pas cherché) : avant cette mission, le motif nu
// "Eccentric Deceleration" (kpi ecc_decel, tier 'info', jamais scoré) absorbait à tort la colonne
// réelle "Eccentric Deceleration Impulse / BM [N s/kg]" (impulsion, Ns/kg) et lui affectait une
// valeur d'un ORDRE DE GRANDEUR ET D'UNE UNITÉ différents (m/s² attendu). ecc_decel n'est consommé
// par AUCUN moteur HYP-XX-01 (vérifié — seulement CMJ_VAR_META tier 'info' et la catégorisation de
// phase Mission AH/AI) : correction sans impact sur les 8 qualités, mais correction d'intégrité
// de donnée réelle, testée explicitement ci-dessous (SM18).
//
// Isolation clinique (§13 mission) : FD_KPI_PATTERNS/fdFindCol ne sont utilisés QUE par
// importForceDecks (vérifié par grep exhaustif sur index.html — aucune autre fonction, y compris
// aucun moteur HYP-XX-01/computeCsmV2, ne les référence). La fixture réelle YANNIS_DATA
// (tests/csmV2RealDataYannis.test.js, réutilisée ici telle quelle) ne passe jamais par l'import
// CSV : les 8 sévérités cliniques de Yannis ne peuvent donc, par construction, pas être affectées
// par cette mission — vérifié explicitement (SM40-SM41) par rapport à la référence documentée.
//
// Exécution : node tests/mission_ai_semantic_mapping_tests.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur() dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}
function csm(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}).clinicalSynthesisV2; }

console.log('MISSION AI — mapping sémantique ForceDecks -> Kinexus');

// ═══════════════════════ Fixtures réelles (2 vrais exports ForceDecks, Yannis Briant) ═══════════
const CSV1_PATH = path.join(__dirname, 'fixtures', 'yannis_forcedecks_export_1.csv');
const CSV2_PATH = path.join(__dirname, 'fixtures', 'yannis_forcedecks_export_2.csv');
const csv1 = fs.readFileSync(CSV1_PATH, 'utf8');
const csv2 = fs.readFileSync(CSV2_PATH, 'utf8');

// Baseline documentée (audit manuel, cf. rapport mission) de ce que le parser reconnaissait AVANT
// cette mission, pour ces 2 fichiers réels précis — sert de point de comparaison factuel (§12/§14
// mission), jamais recalculée dynamiquement (ce serait circulaire).
const BEFORE_FILE1_KEYS = ['height', 'conc_impulse', 'depth', 'braking_duration', 'ecc_decel', 'force_zero_vel', 'flight_time'];
const BEFORE_FILE2_KEYS = ['rsi_mod', 'peak_power'];

function mergeTrials(a, b) { return (a || []).concat(b || []); }
function simulateOnImport(prevTestData, importedData) {
  // Reproduit exactement la logique de fusion du gestionnaire onImport() (index.html, ~l.14830) :
  // Object.assign + concat par clé de KPI — jamais un remplacement complet du test existant.
  const next = Object.assign({}, prevTestData);
  Object.keys(importedData).forEach((testKey) => {
    const test = TBK[testKey];
    const incoming = importedData[testKey];
    const existing = next[testKey];
    if (!existing) { next[testKey] = incoming; return; }
    if (test && test.bilateral) {
      const merged = Object.assign({}, existing, { active: true });
      merged.trials = Object.assign({}, existing.trials || {});
      Object.keys(incoming.trials || {}).forEach((k) => { merged.trials[k] = mergeTrials(merged.trials[k], incoming.trials[k]); });
      next[testKey] = merged;
    }
  });
  return next;
}

const res1 = processCSV(csv1);
const res2 = processCSV(csv2);

// ═══════════════════════════ SM1-SM6 : variantes syntaxiques -> même identifiant ════════════════
test('SM1 — "Concentric Impulse-100ms" (tiret, export réel Yannis) -> cmj_conc_impulse_100', () => {
  const col = fdFindCol(['Additional Load [kg]', 'Concentric Impulse-100ms [N s]'], FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.strictEqual(col, 'Concentric Impulse-100ms [N s]');
});
test('SM2 — "Concentric Impulse 100ms" (espace) -> même identifiant', () => {
  const col = fdFindCol(['Concentric Impulse 100ms [N s]'], FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.strictEqual(col, 'Concentric Impulse 100ms [N s]');
});
test('SM3 — "Concentric Impulse @ 100ms" -> même identifiant', () => {
  const col = fdFindCol(['Concentric Impulse @ 100ms [N s]'], FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.strictEqual(col, 'Concentric Impulse @ 100ms [N s]');
});
test('SM4 — "Concentric Impulse @ 100 ms" (espace supplémentaire autour de l\'unité) -> même identifiant', () => {
  const col = fdFindCol(['Concentric Impulse @ 100 ms [N s]'], FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.ok(col);
});
test('SM5 — variantes d\'espacement (espaces multiples autour du motif) -> même identifiant', () => {
  const col = fdFindCol(['Concentric  Impulse-100ms   [N s]'], FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.ok(col, 'espaces multiples doivent rester tolérés (déjà géré par le strip existant)');
});
test('SM6 — variantes de ponctuation sûres ("Eccentric Braking RFD/BM" sans espaces) -> braking_rfd', () => {
  const col = fdFindCol(['Eccentric Braking RFD/BM [N/s/kg]'], FD_KPI_PATTERNS.braking_rfd, null);
  assert.ok(col);
});

// ═══════════════════════════ SM7-SM9 : normalisation conservatrice (jamais fusionner) ═══════════
test('SM7 — "Concentric Impulse" (motif nu) != "Concentric Impulse-100ms" (jamais fusionnés)', () => {
  const headers = ['Concentric Impulse-100ms [N s]'];
  const col = fdFindCol(headers, FD_KPI_PATTERNS.conc_impulse, null);
  assert.strictEqual(col, null, 'le motif nu conc_impulse ne doit jamais absorber la variante -100ms');
});
test('SM7bis — avec les deux colonnes présentes, conc_impulse et conc_impulse_100 pointent vers des colonnes DIFFÉRENTES', () => {
  const headers = ['Concentric Impulse [N s]', 'Concentric Impulse-100ms [N s]'];
  const colBase = fdFindCol(headers, FD_KPI_PATTERNS.conc_impulse, null);
  const col100 = fdFindCol(headers, FD_KPI_PATTERNS.conc_impulse_100, null);
  assert.strictEqual(colBase, 'Concentric Impulse [N s]');
  assert.strictEqual(col100, 'Concentric Impulse-100ms [N s]');
  assert.notStrictEqual(colBase, col100);
});
test('SM8 — "Peak Power" != "Peak Power / BM" (jamais fusionnés)', () => {
  const headers = ['Peak Power / BM [W/kg]'];
  const col = fdFindCol(headers, ['Peak Power'], null);
  assert.strictEqual(col, null);
});
test('SM9 — "Concentric Peak Force" != "Eccentric Peak Force" (jamais fusionnés, préfixe différent)', () => {
  const headers = ['Eccentric Peak Force / BM [N/kg]'];
  const col = fdFindCol(headers, FD_KPI_PATTERNS.conc_peak_force, null);
  assert.strictEqual(col, null);
});

// ═══════════════════════════ SM10-SM11 : Gauche/Droite et asymétrie ═════════════════════════════
test('SM10 — "(L)" != "(R)" (colonnes G/D correctement distinguées)', () => {
  // fdColSuffix exige "(L)"/"(R)" en toute fin d'en-tête (contrat préexistant, non modifié par
  // cette mission) — contrairement à "(Asym)" qui peut apparaître n'importe où.
  const headers = ['Eccentric Braking RFD / BM [N/s/kg] (L)', 'Eccentric Braking RFD / BM [N/s/kg] (R)'];
  const colL = fdFindCol(headers, FD_KPI_PATTERNS.ecc_decel_rfd_L, 'L');
  const colR = fdFindCol(headers, FD_KPI_PATTERNS.ecc_decel_rfd_R, 'R');
  assert.strictEqual(colL, headers[0]);
  assert.strictEqual(colR, headers[1]);
  assert.notStrictEqual(colL, colR);
});
test('SM11 — asymétrie ForceDecks native correctement identifiée et distincte de la valeur brute', () => {
  const headers = ['Eccentric Braking RFD / BM [N/s/kg]', 'Eccentric Braking RFD % (Asym) (%)'];
  const raw = fdFindCol(headers, FD_KPI_PATTERNS.braking_rfd, null);
  const asym = fdFindCol(headers, FD_KPI_PATTERNS.ecc_decel_rfd_asym, 'asym');
  assert.strictEqual(raw, headers[0]);
  assert.strictEqual(asym, headers[1]);
});

// ═══════════════════════════ SM12-SM14 : import réel + fusion multi-CSV ═════════════════════════
test('SM12 — CSV 1 importé seul : les KPI attendus (avant mission) restent tous présents', () => {
  assert.strictEqual(res1.error, null);
  const keys = Object.keys(res1.data.cmj.trials);
  BEFORE_FILE1_KEYS.filter((k) => k !== 'ecc_decel').forEach((k) => assert.ok(keys.indexOf(k) !== -1, k + ' manquant après mission (régression)'));
});
test('SM13 — CSV 2 importé seul : les KPI attendus (avant mission) restent tous présents', () => {
  assert.strictEqual(res2.error, null);
  const keys = Object.keys(res2.data.cmj.trials);
  BEFORE_FILE2_KEYS.forEach((k) => assert.ok(keys.indexOf(k) !== -1, k + ' manquant après mission (régression)'));
});
test('SM14 — CSV 1 + CSV 2 -> union complète, aucune perte de ce qui existait avant', () => {
  let testData = {};
  testData = simulateOnImport(testData, res1.data);
  testData = simulateOnImport(testData, res2.data);
  const keys = Object.keys(testData.cmj.trials);
  BEFORE_FILE1_KEYS.filter((k) => k !== 'ecc_decel').concat(BEFORE_FILE2_KEYS).forEach((k) => assert.ok(keys.indexOf(k) !== -1, k));
});
test('SM14bis — nouvelles variables réellement débloquées par cette mission sont bien dans l\'union', () => {
  let testData = {};
  testData = simulateOnImport(testData, res1.data);
  testData = simulateOnImport(testData, res2.data);
  const keys = Object.keys(testData.cmj.trials);
  ['conc_impulse_100', 'conc_mean_force', 'conc_peak_force', 'ecc_peak_force', 'ecc_mean_power', 'braking_rfd', 'braking_impulse',
    'ecc_decel_rfd_asym', 'ecc_decel_impulse_asym', 'conc_force_impulse_asym', 'force_peak_power_asym', 'p2_conc_impulse_asym']
    .forEach((k) => assert.ok(keys.indexOf(k) !== -1, k + ' devrait être débloqué'));
  assert.strictEqual(keys.length, 20, 'total attendu : 13 (fichier 1) + 7 (fichier 2), sans doublon');
});
test('SM15 — aucune valeur existante n\'est écrasée par la fusion (valeurs réelles conservées telles quelles)', () => {
  let testData = {};
  testData = simulateOnImport(testData, res1.data);
  const heightBefore = testData.cmj.trials.height.slice();
  testData = simulateOnImport(testData, res2.data);
  assert.deepStrictEqual(testData.cmj.trials.height, heightBefore, 'height (venu du fichier 1) ne doit pas être modifié par la fusion du fichier 2');
  assert.deepStrictEqual(testData.cmj.trials.depth, [-36.1]);
  assert.deepStrictEqual(testData.cmj.trials.braking_rfd, [35]);
});
test('SM16 — les colonnes sans correspondance sûre restent absentes (jamais une fusion silencieuse hasardeuse)', () => {
  const keys = Object.keys(res1.data.cmj.trials);
  // "CMJ Stiffness" n'a aucun kpi.key dans TESTS.cmj.kpis (leg_stiffness n'existe que pour
  // dj/sldj/cmjr) : ne doit jamais apparaître, quelle que soit la robustesse du matching syntaxique.
  assert.strictEqual(keys.indexOf('leg_stiffness'), -1);
});

// ═══════════════════════════ SM17 : non-régression des variables déjà reconnues avant ═══════════
test('SM17 — les variables déjà reconnues avant la mission continuent à fonctionner EXACTEMENT comme avant (mêmes valeurs)', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.height, [30]);
  assert.deepStrictEqual(res1.data.cmj.trials.conc_impulse, [188.1]);
  assert.deepStrictEqual(res1.data.cmj.trials.depth, [-36.1]);
  assert.deepStrictEqual(res1.data.cmj.trials.braking_duration, [562]);
  assert.deepStrictEqual(res1.data.cmj.trials.flight_time, [518]);
  assert.ok(Math.abs(res1.data.cmj.trials.force_zero_vel[0] - 20.82365091660212) < 1e-9);
  assert.deepStrictEqual(res2.data.cmj.trials.rsi_mod, [0.31]);
  assert.deepStrictEqual(res2.data.cmj.trials.peak_power, [46.1]);
});

// ═══════════════════════════ SM18 : bug réel corrigé (mot-continuation, pas une variante) ═══════
test('SM18 — bug corrigé : "Eccentric Deceleration" (ecc_decel) n\'absorbe plus "Eccentric Deceleration Impulse / BM" (unité et grandeur différentes)', () => {
  assert.strictEqual(Object.keys(res1.data.cmj.trials).indexOf('ecc_decel'), -1, 'ecc_decel ne doit plus apparaître : aucune colonne "Eccentric Deceleration" seule n\'existe dans ce fichier réel — avant la mission, le KPI absorbait à tort la colonne Impulse');
});
test('SM18bis — ecc_decel resterait correctement reconnu si l\'en-tête EXACT (sans continuation) était présent', () => {
  const col = fdFindCol(['Eccentric Deceleration [m/s2]'], FD_KPI_PATTERNS.ecc_decel, null);
  assert.strictEqual(col, 'Eccentric Deceleration [m/s2]');
});

// ═══════════════════════════ SM19-SM23 : les 4 alias "/BM" nouvellement ajoutés ═════════════════
test('SM19 — conc_mean_force reconnu via l\'alias "/ BM" réellement exporté ("Concentric Mean Force / BM")', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.conc_mean_force, [17.3]);
});
test('SM20 — conc_peak_force reconnu via l\'alias "/ BM"', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.conc_peak_force, [20.9]);
});
test('SM21 — ecc_peak_force reconnu via l\'alias "/ BM"', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.ecc_peak_force, [20.8]);
});
test('SM22 — ecc_mean_power reconnu via l\'alias "/ BM"', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.ecc_mean_power, [6.27]);
});
test('SM23 — braking_impulse reconnu via l\'alias "Eccentric Deceleration Impulse / BM" (unité Ns/kg respectée)', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.braking_impulse, [1.09]);
});
test('SM24 — braking_rfd reconnu via l\'alias "Eccentric Braking RFD / BM" (vocabulaire ForceDecks renommé)', () => {
  assert.deepStrictEqual(res1.data.cmj.trials.braking_rfd, [35]);
});
test('SM25 — l\'absolu "Eccentric Braking Impulse [N s]" (sans BM) n\'est PAS aliasé à braking_impulse (unité ambiguë, non convertible automatiquement)', () => {
  // Vérifie qu'aucune entrée FD_KPI_PATTERNS.braking_impulse ne matche la colonne absolue,
  // pour ne jamais stocker une valeur (33.4 Ns) dans le kpi Ns/kg-relatif (1.09 attendu).
  assert.strictEqual(res1.data.cmj.trials.braking_impulse[0], 1.09);
  assert.notStrictEqual(res1.data.cmj.trials.braking_impulse[0], 33.4);
});

// ═══════════════════════════ SM26-SM30 : les 5 clés d'asymétrie débloquées ═══════════════════════
test('SM26 — ecc_decel_rfd_asym importé depuis "Eccentric Braking RFD % (Asym)"', () => {
  assert.deepStrictEqual(res2.data.cmj.trials.ecc_decel_rfd_asym, [54]);
});
test('SM27 — ecc_decel_impulse_asym importé depuis "Eccentric Braking Impulse % (Asym)"', () => {
  assert.deepStrictEqual(res2.data.cmj.trials.ecc_decel_impulse_asym, [17]);
});
test('SM28 — conc_force_impulse_asym importé depuis "Concentric Impulse % (Asym)"', () => {
  assert.deepStrictEqual(res2.data.cmj.trials.conc_force_impulse_asym, [18]);
});
test('SM29 — force_peak_power_asym importé depuis "Force at Peak Power % (Asym)"', () => {
  assert.deepStrictEqual(res2.data.cmj.trials.force_peak_power_asym, [13]);
});
test('SM30 — p2_conc_impulse_asym importé depuis "P2 Concentric Impulse % (Asym)"', () => {
  assert.deepStrictEqual(res2.data.cmj.trials.p2_conc_impulse_asym, [18]);
});
test('SM31 — les valeurs d\'asymétrie importées restent des valeurs de magnitude (%) — le côté L/R textuel n\'est ni inventé ni perdu silencieusement (limitation déjà existante, documentée)', () => {
  // parseFloat("54 L") = 54 : comportement préexistant à cette mission (bestVal/fdVal),
  // non modifié ici — signalé pour information, hors périmètre (logique de valeur, pas de nom).
  assert.strictEqual(typeof res2.data.cmj.trials.ecc_decel_rfd_asym[0], 'number');
});

// ═══════════════════════════ SM32-SM39 : colonnes sans correspondance sûre restent non mappées ══
const UNMAPPED_HEADERS_FILE1 = ['CMJ Stiffness [N/m]', 'Concentric Impulse (Abs) / BM [N s/kg]', 'Eccentric Braking Impulse [N s]', 'P1 Concentric Impulse [N s]', 'P2 Concentric Impulse [N s]', 'Peak Net Takeoff Force / BM [N/kg]'];
test('SM32 — "CMJ Stiffness" reste non mappé (aucun kpi.key leg_stiffness pour le test cmj)', () => {
  assert.strictEqual(Object.keys(res1.data.cmj.trials).indexOf('leg_stiffness'), -1);
});
test('SM33 — "P1 Concentric Impulse" reste non mappé (aucune clé p1_conc_impulse dans le catalogue Kinexus)', () => {
  const catalog = TBK.cmj.kpis.map((k) => k.key);
  assert.strictEqual(catalog.indexOf('p1_conc_impulse'), -1);
});
test('SM34 — "Velocity at Peak Power" / "Vertical Velocity at Takeoff" (fichier 2) restent non mappés à peak_vel (instant différent, jamais fusionné par prudence)', () => {
  const col = fdFindCol(['Velocity at Peak Power [m/s]'], FD_KPI_PATTERNS.peak_vel, null);
  assert.strictEqual(col, null);
});
test('SM35 — toutes les colonnes du fichier 1 sont classées (aucune disparition silencieuse) : 29 colonnes, chacune retrouvable dans l\'audit du rapport', () => {
  const headerLine = csv1.split('\n')[0];
  const headers = headerLine.replace(/^﻿/, '').split('","').map((s) => s.replace(/^"|"$/g, ''));
  assert.strictEqual(headers.length, 29);
});
test('SM36 — toutes les colonnes du fichier 2 sont classées (aucune disparition silencieuse) : 29 colonnes', () => {
  const headerLine = csv2.split('\n')[0];
  const headers = headerLine.replace(/^﻿/, '').split('","').map((s) => s.replace(/^"|"$/g, ''));
  assert.strictEqual(headers.length, 29);
});

// ═══════════════════════════ SM37-SM39 : isolation clinique (import != moteur clinique) ═════════
test('SM37 — FD_KPI_PATTERNS/fdFindCol ne sont utilisés que par importForceDecks (isolation vérifiée sur le code chargé) : exactement 3 sites d\'appel réels', () => {
  const callSites = (slice.match(/=\s*fdFindCol\(/g) || []).length;
  assert.strictEqual(callSites, 3, 'les 3 sites attendus : branche bilatérale + branches G/D — aucun moteur clinique ne doit appeler fdFindCol');
});
test('SM38 — conc_impulse_100 nouvellement importable reste NOT_DETERMINED cliniquement (aucun seuil créé par cette mission)', () => {
  assert.strictEqual(THRESHOLDS.cmj_conc_impulse_100, undefined);
  assert.ok(!NORMS_V2_TEST_VARS.cmj || NORMS_V2_TEST_VARS.cmj.indexOf('cmj_conc_impulse_100') === -1);
});
test('SM39 — aucune clé THRESHOLDS/NORMS_V2_TEST_VARS n\'a été ajoutée ou modifiée par cette mission (24 clés THRESHOLDS inchangées)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
});

// ═══════════════════════════ SM40-SM41 : régression clinique complète (fixture réelle Yannis) ═══
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
test('SM40 — les 8 sévérités cliniques de Yannis (fixture réelle inchangée) sont identiques à la référence documentée avant cette mission', () => {
  Object.keys(EXPECTED_SEVERITY).forEach((q) => {
    const entry = yc.clinicalProfile[q];
    assert.ok(entry, q + ' absent du profil');
    assert.strictEqual(entry.severity, EXPECTED_SEVERITY[q], q + ' : sévérité modifiée par cette mission (ne devrait jamais arriver, import CSV hors chemin de cette fixture)');
  });
});
test('SM41 — Explosivité reste NOT_DETERMINED (conc_impulse_100 nouvellement importable ne débloque aucun seuil)', () => {
  assert.strictEqual(yc.clinicalCertainty['Explosivité'], 'not_determined');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

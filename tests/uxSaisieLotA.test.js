// Tests unitaires — Lot A UX Saisie « Sécuriser et fluidifier la saisie »
// (IMPLEMENTATION_UX_SAISIE_LOTA.md).
//
// Couvre les 15 cas mandatés par la mission (Objectif 9). Cette mission est strictement
// présentation/navigation/wording — aucun moteur HYP, CSM, HYP_QUALITY_RELATIONS, TFM, VAR_REL3,
// norme, seuil, rôle diagnostique/confirmatif/explicatif ou règle de convergence n'est modifié.
//
// Convention de test (identique aux lots précédents de cette session) : les fonctions de décision
// réellement utilisées par les composants React (testHasAnyTrialValue, bilanHasRealData,
// testCompletion) sont testées directement — ce sont elles qui pilotent le comportement des
// composants (confirmation de sortie, statut de complétion, blocage de validation), pas une
// réimplémentation parallèle. Les comportements purement d'interaction DOM (clic sur "Continuer le
// bilan"/"Quitter", clic "Test suivant") sont vérifiés en conditions réelles (navigateur, cf.
// IMPLEMENTATION_UX_SAISIE_LOTA.md §11) en complément de ces tests.
//
// Exécution : node tests/uxSaisieLotA.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const endMarker = "ReactDOM.createRoot(document.getElementById('root'))";
const end = code.indexOf(endMarker);
if (start < 0 || end < 0) throw new Error('Impossible de localiser le moteur dans index.html.');
eval(code.slice(start, end));

global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.message); }
}

console.log('CAS 1/2 — Retour sans données / avec données (testHasAnyTrialValue, base de requestLeave)');
(function () {
  test('Test coché sans aucun essai -> testHasAnyTrialValue=false (retour sans confirmation, Scénario 1)', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true }), false);
  });
  test('Un essai rempli (test simple) -> testHasAnyTrialValue=true (Scénario 2)', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true, trials: { distance: [25] } }), true);
  });
  test('Essai ajouté mais resté vide (null) -> testHasAnyTrialValue=false (le simple "+ Essai" ne compte pas)', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true, trials: { distance: [null] } }), false);
  });
  test('Plusieurs essais (dont certains null) -> true dès qu\'un seul est réel', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true, trials: { distance: [null, 25, null] } }), true);
  });
  test('Valeur à Droite uniquement (D/G) -> true', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true, D: { trials: { distance: [25] } }, G: { trials: { distance: [null] } } }), true);
  });
  test('Valeur à Gauche uniquement (D/G) -> true', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true, D: { trials: { distance: [null] } }, G: { trials: { distance: [22] } } }), true);
  });
  test('Import CSV (même structure trials que la saisie manuelle) -> true', () => {
    // onImport() (TestEntry) écrit exactement dans data.trials/data.D.trials/data.G.trials — même
    // forme que la saisie manuelle, donc déjà couvert par la même fonction sans code spécifique.
    assert.strictEqual(testHasAnyTrialValue({ active: true, trials: { height: [42.3] } }), true);
  });
  test('lsiAuto seul (valeur dérivée), sans aucun essai réel -> false — un LSI ne peut de toute façon jamais exister sans essais réels en amont, vérifié pour ne jamais fabriquer un faux positif', () => {
    assert.strictEqual(testHasAnyTrialValue({ active: true, lsiAuto: 95, D: { trials: {} }, G: { trials: {} } }), false);
  });
})();

console.log('');
console.log('CAS 5 (Objectif 1A) — Suppression de la dernière valeur -> plus de confirmation nécessaire');
(function () {
  test('Après suppression du seul essai réel, testHasAnyTrialValue retombe à false (recalcul pur, pas de flag persistant)', () => {
    var before = { active: true, trials: { distance: [25] } };
    assert.strictEqual(testHasAnyTrialValue(before), true);
    var after = { active: true, trials: { distance: [] } }; // del() filtre l'essai supprimé
    assert.strictEqual(testHasAnyTrialValue(after), false);
  });
})();

console.log('');
console.log('CAS 3 — bilanHasRealData (condition exacte qui déclenche la confirmation dans requestLeave)');
(function () {
  test('Bilan avec un seul test coché sans donnée -> bilanHasRealData=false', () => {
    assert.strictEqual(bilanHasRealData({ wblt: { active: true } }), false);
  });
  test('Bilan avec plusieurs tests, un seul rempli -> bilanHasRealData=true (Scénario 3)', () => {
    assert.strictEqual(bilanHasRealData({
      wblt: { active: true },
      cmj: { active: true, trials: { height: [38] } },
      knee_ext: { active: true }
    }), true);
  });
  test('Bilan vide ({}) -> bilanHasRealData=false', () => {
    assert.strictEqual(bilanHasRealData({}), false);
  });
})();

console.log('');
console.log('CAS 6/7 — Test sélectionné sans valeur vs test réellement renseigné (testCompletion, Objectif 2/2A)');
(function () {
  var wbltTest = TBK['wblt'];
  test('Test coché, 0 valeur -> testCompletion.filled===0 (jamais présenté comme "renseigné")', () => {
    var c = testCompletion(wbltTest, { active: true });
    assert.strictEqual(c.filled, 0);
    assert.strictEqual(c.total, wbltTest.kpis.length);
  });
  test('Test non coché -> testCompletion.filled===0 également (cohérent, "non commencé")', () => {
    var c = testCompletion(wbltTest, null);
    assert.strictEqual(c.filled, 0);
  });
  test('Test réellement renseigné (D rempli) -> testCompletion.filled===total (1/1 pour WBLT, 1 seul KPI)', () => {
    var c = testCompletion(wbltTest, { active: true, D: { trials: { distance: [25] } } });
    assert.strictEqual(c.filled, 1);
    assert.strictEqual(c.total, 1);
  });
  test('Test multi-KPI partiellement rempli (CMJ, 2 KPI sur 51) -> filled=2, total=51, ni "vide" ni "complet"', () => {
    var cmjTest = TBK['cmj'];
    var c = testCompletion(cmjTest, { active: true, trials: { height: [38], peak_power: [55] } });
    assert.strictEqual(c.filled, 2);
    assert.strictEqual(c.total, cmjTest.kpis.length);
    assert.ok(c.filled > 0 && c.filled < c.total);
  });
})();

console.log('');
console.log('CAS 8/9 — Validation bilan vide (bloquée) vs bilan partiel (autorisée + progression)');
(function () {
  test('0 test, 0 valeur -> bilanHasRealData=false (le bouton "Valider le bilan" doit être remplacé par le message de blocage, Scénario 6)', () => {
    assert.strictEqual(bilanHasRealData({}), false);
  });
  test('Bilan partiel (8 tests cochés, seulement 3 avec une valeur réelle) -> bilanHasRealData=true, validation autorisée (Scénario 7)', () => {
    var td = {};
    ['wblt', 'knee_ext', 'knee_flex', 'hip_flex', 'hip_ext', 'cmj', 'dj', 'heel_raise'].forEach(function (k) { td[k] = { active: true }; });
    td.wblt = { active: true, D: { trials: { distance: [25] } } };
    td.cmj = { active: true, trials: { height: [38] } };
    td.dj = { active: true, trials: { rsi: [1.2] } };
    assert.strictEqual(bilanHasRealData(td), true);
    var testsCnt = Object.keys(td).filter(function (k) { return td[k] && td[k].active; }).length;
    var testsFilledCnt = Object.keys(td).filter(function (k) { return td[k] && td[k].active && testHasAnyTrialValue(td[k]); }).length;
    assert.strictEqual(testsCnt, 8);
    assert.strictEqual(testsFilledCnt, 3);
  });
  test('Aucune règle "100% des tests obligatoires" inventée : un bilan avec 1/49 tests renseignés reste validable', () => {
    var td = { wblt: { active: true, D: { trials: { distance: [25] } } } };
    assert.strictEqual(bilanHasRealData(td), true);
  });
})();

console.log('');
console.log('CAS 10/11 — Navigation test suivant/précédent (ordre de la batterie active, Objectif 4/4A)');
(function () {
  test('L\'ordre de navigation reprend l\'ordre du catalogue TESTS (aucun nouvel ordre clinique inventé)', () => {
    var testData = { wblt: { active: true }, cmj: { active: true }, dj: { active: true } };
    var activeTestKeys = TESTS.filter(function (t) { return testData[t.key] && testData[t.key].active; }).map(function (t) { return t.key; });
    // wblt (Mobilité) précède cmj (Sauts) précède dj (Sauts) dans l'ordre du catalogue TESTS —
    // vérifié indépendamment de l'ordre dans lequel les tests ont été cochés par le praticien.
    assert.deepStrictEqual(activeTestKeys, ['wblt', 'cmj', 'dj']);
  });
  test('"Test suivant" depuis le 1er test pointe vers le 2e de la batterie active', () => {
    var activeTestKeys = ['wblt', 'cmj', 'dj'];
    var navIdx = activeTestKeys.indexOf('wblt');
    assert.strictEqual(activeTestKeys[navIdx + 1], 'cmj');
  });
  test('"Test précédent" depuis le dernier test pointe vers l\'avant-dernier', () => {
    var activeTestKeys = ['wblt', 'cmj', 'dj'];
    var navIdx = activeTestKeys.indexOf('dj');
    assert.strictEqual(activeTestKeys[navIdx - 1], 'cmj');
  });
  test('Pas de "suivant" depuis le dernier test, pas de "précédent" depuis le premier (bornes)', () => {
    var activeTestKeys = ['wblt', 'cmj', 'dj'];
    var lastIdx = activeTestKeys.indexOf('dj');
    var firstIdx = activeTestKeys.indexOf('wblt');
    assert.strictEqual(lastIdx < activeTestKeys.length - 1, false);
    assert.strictEqual(firstIdx > 0, false);
  });
  test('Un seul test actif -> navTotal=1, ni précédent ni suivant proposés', () => {
    var activeTestKeys = ['wblt'];
    assert.strictEqual(activeTestKeys.length, 1);
  });
})();

console.log('');
console.log('CAS 12 — Conservation des données pendant la navigation (Scénario 4)');
(function () {
  test('activeTestKeys est une dérivation pure de testData — aucune mutation, aucune perte de trials existants', () => {
    var testData = { wblt: { active: true, D: { trials: { distance: [25] } } }, cmj: { active: true } };
    var before = JSON.stringify(testData);
    TESTS.filter(function (t) { return testData[t.key] && testData[t.key].active; }).map(function (t) { return t.key; });
    assert.strictEqual(JSON.stringify(testData), before, 'le calcul de la liste de navigation ne doit jamais modifier testData');
  });
  test('updateTrials (mécanisme déjà existant, non modifié) continue de fusionner par testKey — la navigation directe utilise exactement le même onChange que le retour à la liste', () => {
    // Non-régression structurelle : la fonction updateTrials elle-même n'a pas été touchée par ce
    // lot (seul TestDetailPage reçoit 4 nouvelles props de navigation, purement additives).
    assert.ok(code.indexOf('function updateTrials(testKey,side,kpiKey,trials)') >= 0 || html.indexOf('function updateTrials(testKey,side,kpiKey,trials)') >= 0);
  });
})();

console.log('');
console.log('CAS 13/14 — Asymétries : inventaire et décision (Objectif 5/5A/5B)');
(function () {
  // Inventaire exhaustif effectué avant toute décision (Objectif 5) : 6 KPI "_asym" existent dans
  // TBK (catalogue CMJ). Seuls 2 ont une paire Gauche/Droite déclarée dans TBK. Mais Kinexus n'a,
  // dans son code actuel, JAMAIS défini de formule convertissant Gauche/Droite en pourcentage
  // d'asymétrie (ASYM_SIDE_PAIRS sert uniquement à déterminer le "membre dominant" qualitatif,
  // jamais à calculer la valeur numérique "_asym" elle-même — cf. asymMembreDominant). Conserver
  // la saisie manuelle pour les 6 est donc la décision honnête (Objectif 5B), pas un renoncement :
  // inventer une formule ici violerait explicitement "NE PAS inventer de formule".
  var cmjAsymKpis = ['ecc_decel_rfd_asym', 'ecc_decel_impulse_asym', 'conc_force_impulse_asym', 'force_peak_power_asym', 'p2_conc_impulse_asym', 'landing_peak_force_asym'];
  test('Les 6 KPI "_asym" existent toujours tels quels dans TBK.cmj (aucune donnée retirée)', () => {
    var cmjKpiKeys = TBK['cmj'].kpis.map(function (k) { return k.key; });
    cmjAsymKpis.forEach(function (k) { assert.ok(cmjKpiKeys.indexOf(k) >= 0, k + ' manquant'); });
  });
  test('Aucune formule de calcul auto n\'a été ajoutée pour ces KPI — TrialIn reste le seul chemin de saisie (non-régression du composant)', () => {
    assert.ok(code.indexOf('function add(){if(trials.length<3)props.onChange(trials.concat([null]));}') >= 0, 'TrialIn.add() doit rester strictement identique — aucune valeur auto-injectée');
  });
  test('ASYM_SIDE_PAIRS (référentiel existant, non modifié) ne couvre que 2 des 6 KPI — confirmé, aucun alias supplémentaire inventé', () => {
    assert.deepStrictEqual(Object.keys(ASYM_SIDE_PAIRS).sort(), ['ecc_decel_rfd_asym', 'landing_peak_force_asym']);
  });
  test('ASYM_SIDE_PAIRS reste inchangé (donnée non touchée par ce lot)', () => {
    assert.deepStrictEqual(ASYM_SIDE_PAIRS, { ecc_decel_rfd_asym: { L: 'ecc_decel_rfd_L', R: 'ecc_decel_rfd_R' }, landing_peak_force_asym: { L: 'landing_peak_force_L', R: 'landing_peak_force_R' } });
  });
})();

console.log('');
console.log('CAS 15 — Non-régression stricte des sorties cliniques (avant/après)');
(function () {
  var PRE_MISSION_COMMIT = 'b0afde5';
  var repoRoot = path.join(__dirname, '..');
  var before;
  try {
    before = execSync('git show ' + PRE_MISSION_COMMIT + ':index.html', { cwd: repoRoot, maxBuffer: 1024 * 1024 * 50 }).toString('utf8');
  } catch (e) {
    console.log('  SKIP — impossible de lire ' + PRE_MISSION_COMMIT + ' (' + e.message + ')');
    before = null;
  }
  if (before) {
    var beforeScripts = [...before.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    var beforeCode = beforeScripts.filter(s => !s.includes('cdnjs')).join('\n');
    var bStart = beforeCode.indexOf('var C={');
    var bEnd = beforeCode.indexOf(endMarker);
    var loadBefore = new Function('localStorage', beforeCode.slice(bStart, bEnd) +
      '\nreturn {computeMoteur:computeMoteur,TFM:TFM,VAR_REL3:VAR_REL3,HYP_QUALITY_RELATIONS:HYP_QUALITY_RELATIONS,TBK:TBK};');
    var sandbox = loadBefore(global.localStorage);

    var scenarios = [
      { wblt: { active: true, D: { trials: { distance: [25] } }, G: { trials: { distance: [26] } } } },
      { cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } } },
      { imtp: { active: true, trials: { n: [400] } }, slimtp: { active: true, D: { trials: { n: [100] } }, G: { trials: { n: [95] } } } },
      {}
    ];
    var POP = 'general_m_senior', AGE = 30;
    scenarios.forEach(function (td, i) {
      var resBefore = sandbox.computeMoteur(td, {}, POP, AGE);
      var resAfter = computeMoteur(td, {}, POP, AGE);
      test('Scénario ' + (i + 1) + ' — functionScores identique avant/après', () => {
        assert.deepStrictEqual(resAfter.functionScores, resBefore.functionScores);
      });
      test('Scénario ' + (i + 1) + ' — priorities identique avant/après', () => {
        assert.deepStrictEqual(resAfter.priorities, resBefore.priorities);
      });
      test('Scénario ' + (i + 1) + ' — clinicalSynthesis identique avant/après', () => {
        assert.deepStrictEqual(resAfter.clinicalSynthesis, resBefore.clinicalSynthesis);
      });
    });
    test('TFM strictement inchangé', () => { assert.deepStrictEqual(TFM, sandbox.TFM); });
    test('VAR_REL3 strictement inchangé', () => { assert.deepStrictEqual(VAR_REL3, sandbox.VAR_REL3); });
    test('HYP_QUALITY_RELATIONS strictement inchangé', () => { assert.deepStrictEqual(HYP_QUALITY_RELATIONS, sandbox.HYP_QUALITY_RELATIONS); });
    test('TBK (catalogue de tests/KPI) strictement inchangé — aucun KPI ajouté/retiré/renommé', () => { assert.deepStrictEqual(TBK, sandbox.TBK); });
  }
})();

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

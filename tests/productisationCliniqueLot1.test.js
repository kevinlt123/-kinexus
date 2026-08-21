// Tests unitaires — Lot Productisation clinique 1 « Nettoyage du langage praticien »
// (IMPLEMENTATION_PRODUCTISATION_CLINIQUE_LOT1.md).
//
// Couvre les 12 catégories mandatées par la mission : absence de HYP-XXX-NN / « moteur HYP » brut /
// « à valider par l'équipe clinique » / vocabulaire anglais (Explained by / Explains / Correlated
// with) dans les surfaces praticien réellement rendues (PDF sportif, PDF expert, chaînes UI
// statiques), formulation correcte des relations explicatives (non causale) et du non-déterminable
// à preuve partielle, et non-régression stricte des sorties cliniques (functionScores, 8 moteurs
// HYP, clinicalSynthesis, priorities, HYP_QUALITY_RELATIONS, TFM) entre le commit pré-mission
// (b6e3e6a, dernier commit avant ce lot) et l'état courant.
//
// Cette mission est strictement présentation/wording — aucun moteur HYP, CSM, HYP_QUALITY_RELATIONS,
// TFM, VAR_REL3, seuil, norme ou règle de convergence n'est modifié. Ces tests exercent le pipeline
// réel (computeMoteur -> functionScores/clinicalSynthesis/priorities -> buildFullReportHtml /
// varRelHTML), jamais une réécriture parallèle.
//
// Exécution : node tests/productisationCliniqueLot1.test.js — aucune dépendance externe.
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

var athlete = { id: 1, prenom: 'Léo', nom: 'Fournier', sport: 'Basketball', dateNaissance: '1999-04-02', normPopulation: 'bball2425_ncaa_m' };
function makeBilan(td) { return { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: td, questData: {}, reportOverrides: {} }; }

var HYP_ID_RE = /HYP-[A-Z]{3}-\d{2}/;
var CAUSAL_WORDS = ['est la cause de', 'provoque', 'entraîne une altération', 'entraîne un déficit', 'est causé par', 'à cause de'];

// ── 1/2 — Scénario flagship : Mobilité ET Stabilisation objectivées + relation HYP_QUALITY_RELATIONS ──
console.log('1/2 — Relation explicative Mobilité -> Stabilisation (wblt_distance / HYP-STA-01)');
(function () {
  var POP = 'general_m_senior', AGE = 30;
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, POP, AGE);
  test('Pré-requis : Mobilité et Stabilisation toutes deux objectivées (déficitaires)', () => {
    assert.ok(res.functionScores['Mobilité'].hypMob01.state.indexOf('retenue') === 0);
    assert.ok(res.functionScores['Stabilisation'].hypSta01.state.indexOf('retenue') === 0);
  });
  var rel = findHypQualityRelation('Mobilité', 'Stabilisation');
  test('Relation HYP_QUALITY_RELATIONS toujours présente et inchangée (non modifiée par la mission)', () => {
    assert.ok(rel);
    assert.strictEqual(rel.via, 'wblt_distance (explicative « mobilité de cheville » de HYP-STA-01)');
  });
  var relationships = res.clinicalSynthesis.relationships;
  var explanatory = relationships.filter(function (r) { return r.level === 'explanatory_hypothesis'; });
  test('Au moins une relation explicative détectée par CSM (non modifié)', () => {
    assert.ok(explanatory.length >= 1);
  });
  var cleanText = csmCleanExplanatoryText(explanatory[0]);
  test('csmCleanExplanatoryText — aucun identifiant HYP-XXX-NN dans la phrase affichée', () => {
    assert.ok(!HYP_ID_RE.test(cleanText), 'fuite : ' + cleanText);
  });
  test('csmCleanExplanatoryText — aucun nom de variable technique brut (wblt_distance) affiché', () => {
    assert.ok(cleanText.indexOf('wblt_distance') === -1, 'fuite : ' + cleanText);
  });
  test('csmCleanExplanatoryText — registre "hypothèse explicative", jamais "cause"', () => {
    assert.ok(cleanText.indexOf('hypothèse explicative') >= 0 || cleanText.indexOf('explicative') >= 0, cleanText);
    CAUSAL_WORDS.forEach(function (w) { assert.ok(cleanText.toLowerCase().indexOf(w) === -1, 'mot causal "' + w + '" dans : ' + cleanText); });
  });
  test('csmCleanExplanatoryText — la phrase mentionne bien "mobilité de cheville" (glose extraite du via)', () => {
    assert.ok(cleanText.indexOf('mobilité de cheville') >= 0, cleanText);
  });

  var pdfSportif = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  var pdfExpert = buildFullReportHtml('expert', athlete, makeBilan(td), res);

  test('PDF sportif — aucun identifiant HYP-XXX-NN dans le rendu', () => {
    assert.ok(!HYP_ID_RE.test(pdfSportif));
  });
  test('PDF expert — aucun identifiant HYP-XXX-NN dans le rendu', () => {
    assert.ok(!HYP_ID_RE.test(pdfExpert));
  });
  test('PDF sportif — aucun "moteur HYP" brut', () => {
    assert.ok(pdfSportif.indexOf('moteur HYP') === -1);
  });
  test('PDF expert — aucun "moteur HYP" brut', () => {
    assert.ok(pdfExpert.indexOf('moteur HYP') === -1);
  });
  test('PDF sportif — section "Relations explicatives possibles" présente et sans wblt_distance brut', () => {
    assert.ok(pdfSportif.indexOf('Relations explicatives possibles') >= 0);
    assert.ok(pdfSportif.indexOf('wblt_distance') === -1);
  });
  test('PDF expert — section "Relations explicatives possibles" présente et sans wblt_distance brut', () => {
    assert.ok(pdfExpert.indexOf('Relations explicatives possibles') >= 0);
    assert.ok(pdfExpert.indexOf('wblt_distance') === -1);
  });
  test('PDF sportif / expert — aucun mot d\'escalade causale ("provoque", "entraîne une altération", ...)', () => {
    CAUSAL_WORDS.forEach(function (w) {
      assert.ok(pdfSportif.toLowerCase().indexOf(w) === -1, 'PDF sportif contient "' + w + '"');
      assert.ok(pdfExpert.toLowerCase().indexOf(w) === -1, 'PDF expert contient "' + w + '"');
    });
  });
})();

// ── 3 — Non-déterminable à preuve partielle (Puissance : CMJ déficitaire + SLCMJ non classifiable) ──
console.log('');
console.log('3 — Non déterminable à preuve partielle (Puissance)');
(function () {
  var POP = 'bball2425_ncaa_m', AGE = 26;
  var td = {
    cmj: { active: true, trials: { peak_power: [20] } },
    slcmj: { active: true, D: { trials: { peak_power: [50] } }, G: { trials: { peak_power: [50] } } }
  };
  var res = computeMoteur(td, {}, POP, AGE);
  var h = res.functionScores['Puissance'].hypPui01;
  test('Pré-requis : Puissance non_determinable malgré une preuve diagnostique partielle (cmj_peak_power classifiable)', () => {
    assert.strictEqual(h.state, 'non_determinable');
    assert.strictEqual(h.diagnosticEvidence.cmj_peak_power.status, 'deficitaire');
  });
  test('csmNonDeterminableHasPartialEvidence détecte correctement la preuve partielle (fonction non modifiée)', () => {
    assert.strictEqual(csmNonDeterminableHasPartialEvidence('Puissance', res.clinicalSynthesis), true);
  });
  var pdfSportif = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  var pdfExpert = buildFullReportHtml('expert', athlete, makeBilan(td), res);
  test('PDF sportif — phrase enrichie "les mesures sont disponibles, mais les références..."', () => {
    assert.ok(pdfSportif.indexOf('les mesures sont disponibles, mais les références nécessaires') >= 0);
    assert.ok(pdfSportif.indexOf('ne sont pas actuellement exploitables dans cette population') >= 0);
  });
  test('PDF expert — même phrase enrichie', () => {
    assert.ok(pdfExpert.indexOf('les mesures sont disponibles, mais les références nécessaires') >= 0);
  });
  test('PDF sportif — ancienne formulation "Diagnostic non déterminable avec les données normatives actuellement disponibles pour" disparue', () => {
    assert.ok(pdfSportif.indexOf('Diagnostic non déterminable avec les données normatives actuellement disponibles pour') === -1);
  });
})();

// ── 4 — Vocabulaire anglais de varRelHTML entièrement francisé ──
console.log('');
console.log('4 — varRelHTML : vocabulaire francisé');
(function () {
  test('VAR_REL3 non vide (pré-requis du test)', () => { assert.ok(Object.keys(VAR_REL3).length > 0); });
  var out = varRelHTML('cmj', 'peak_power', { active: true }, null, null);
  test('varRelHTML("cmj","peak_power") — aucun "Explained by"', () => { assert.ok(out.indexOf('Explained by') === -1); });
  test('varRelHTML — aucun "Explains ("', () => { assert.ok(out.indexOf('Explains (') === -1); });
  test('varRelHTML — aucun "Correlated with"', () => { assert.ok(out.indexOf('Correlated with') === -1); });
  test('varRelHTML — aucun "Refined by"', () => { assert.ok(out.indexOf('Refined by') === -1); });
  test('varRelHTML — libellés français présents ("amont"/"aval"/"liées" conservés dans le nouveau vocabulaire)', () => {
    assert.ok(out.indexOf('Expliqué par (amont)') >= 0);
    assert.ok(out.indexOf('Peut contribuer à (aval)') >= 0);
    assert.ok(out.indexOf('Associé à (liées)') >= 0);
  });
})();

// ── 5 — "à valider par l'équipe clinique" absent des surfaces praticien (Variables/Raisonnement) ──
console.log('');
console.log('5 — Notes internes retirées des surfaces praticien');
(function () {
  test('Onglet Variables — texte d\'intro ne contient plus "à valider par l\'équipe clinique"', () => {
    assert.ok(html.indexOf('283 variables du logiciel') >= 0, 'texte d\'intro introuvable (pré-requis du test)');
    var idx = html.indexOf('283 variables du logiciel');
    var seg = html.slice(idx, idx + 400);
    assert.ok(seg.indexOf("à valider par l'équipe clinique") === -1, seg);
  });
  test('Onglet Raisonnement — texte d\'intro ne contient plus "doivent être validées par l\'équipe clinique"', () => {
    assert.ok(html.indexOf('référentiel de raisonnement clinique KINEXUS') >= 0, 'texte d\'intro introuvable (pré-requis du test)');
    var idx = html.indexOf('référentiel de raisonnement clinique KINEXUS');
    var seg = html.slice(idx, idx + 400);
    assert.ok(seg.indexOf("doivent être validées par l'équipe clinique") === -1, seg);
  });
})();

// ── 6 — Identifiant HYP retiré de csmSafeQualityNote / capaciteHTML ──
console.log('');
console.log('6 — Identifiant HYP retiré des notes de qualité / capacités');
(function () {
  test('"(non déterminable — HYP)" disparu (capaciteHTML)', () => {
    assert.ok(html.indexOf('(non déterminable — HYP)') === -1);
  });
  test('"Qualités objectivées par un moteur HYP" disparu (libellé Priorités d\'intervention)', () => {
    assert.ok(html.indexOf('Qualités objectivées par un moteur HYP') === -1);
  });
})();

// ── 7 — Non-régression stricte : mêmes sorties cliniques avant/après la mission ──
console.log('');
console.log('7 — Non-régression stricte des sorties cliniques (avant/après)');
(function () {
  var PRE_MISSION_COMMIT = 'b6e3e6a';
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
    // new Function (pas vm.createContext) : même royaume/realm que le code courant, donc les
    // objets construits par le code "avant" partagent le même Object.prototype que ceux du code
    // "après" -- indispensable pour qu'assert.deepStrictEqual compare le contenu et non le realm.
    var loadBefore = new Function('localStorage', beforeCode.slice(bStart, bEnd) +
      '\nreturn {computeMoteur:computeMoteur,TFM:TFM,HYP_QUALITY_RELATIONS:HYP_QUALITY_RELATIONS};');
    var sandbox = loadBefore(global.localStorage);

    var scenarios = [
      { wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } } },
      {
        wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
        landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
        landing_bi: { active: true, trials: { tts: [2.5] } }
      },
      { cmj: { active: true, trials: { peak_power: [20] } }, slcmj: { active: true, D: { trials: { peak_power: [50] } }, G: { trials: { peak_power: [50] } } } },
      { cmj: { active: true, trials: { peak_power: [71.5] } } },
      {}
    ];
    var POP = 'bball2425_ncaa_m', AGE = 26;
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
    test('HYP_QUALITY_RELATIONS strictement inchangé (structure de données, non le wording qui en dérive)', () => {
      assert.deepStrictEqual(HYP_QUALITY_RELATIONS, sandbox.HYP_QUALITY_RELATIONS);
    });
    test('TFM strictement inchangé', () => {
      assert.deepStrictEqual(TFM, sandbox.TFM);
    });
  }
})();

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

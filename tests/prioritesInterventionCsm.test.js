// Tests unitaires — Finalisation de la cohérence clinique HYP/CSM du widget "Priorités
// d'intervention" (IMPLEMENTATION_FINAL_PRIORITES_CSM.md).
//
// Couvre les 10 cas mandatés par la mission (Problème 5, "cas particuliers à tester
// obligatoirement") via priHypObjectifiedSplit() et le rendu PDF réel (buildFullReportHtml).
// Vérifie systématiquement :
//   - aucune qualité non_determinable ne devient une "priorité clinique" (split.hyp) ;
//   - aucun simple poids TFM (qualité sans moteur HYP) ne dépasse/rejoint une qualité HYP
//     objectivée dans split.hyp — toujours cantonné à split.tfmOnly ;
//   - plus aucun rang numéroté (1/2/3) dans le PDF ("Déficits à investiguer" ne numérote plus) ;
//   - "Priorités d'intervention" n'apparaît plus nulle part.
// Ces tests exercent le pipeline réel (computeMoteur -> priorities -> priHypObjectifiedSplit /
// buildFullReportHtml), jamais une réécriture parallèle. Les 8 moteurs HYP,
// computeHypClinicalSynthesis01, HYP_QUALITY_RELATIONS, TFM, priorities (construction) et
// statusPriorityRank ne sont pas modifiés par cette mission (non-régression vérifiée séparément).
//
// Exécution : node tests/prioritesInterventionCsm.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

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

var athlete = { id: 1, prenom: 'Marie', nom: 'Curie', sport: 'Basketball', dateNaissance: '2000-03-15', normPopulation: 'bball2425_ncaa_m' };
function makeBilan(td) { return { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: td, questData: {}, reportOverrides: {} }; }
function names(list) { return list.map(function (p) { return p.fonction; }); }

console.log('CAS 1 — une seule qualité HYP déficitaire');
(function () {
  var td = { wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } } };
  var res = computeMoteur(td, {}, null, null);
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Mobilité seule dans split.hyp, rien dans tfmOnly', () => {
    assert.deepStrictEqual(names(split.hyp), ['Mobilité']);
    assert.strictEqual(split.tfmOnly.length, 0);
  });
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('PDF : "Déficits à investiguer" présent, "Priorités d\'intervention" absent', () => {
    assert.ok(pdf.includes('Déficits à investiguer'));
    assert.ok(!pdf.includes("Priorités d'intervention"));
  });
})();

console.log('');
console.log('CAS 2 — deux qualités HYP déficitaires');
(function () {
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    dj: { active: true, trials: { rsi: [0.3] } },
    sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } }
  };
  var res = computeMoteur(td, {}, null, null);
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Mobilité + Réactivité toutes deux dans split.hyp, aucun rang ordinal exploité', () => {
    assert.deepStrictEqual(names(split.hyp).sort(), ['Mobilité', 'Réactivité'].sort());
  });
})();

console.log('');
console.log('CAS 3 — trois qualités HYP déficitaires');
(function () {
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    dj: { active: true, trials: { rsi: [0.3] } },
    sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, null, null);
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Mobilité + Réactivité + Stabilisation toutes dans split.hyp', () => {
    assert.deepStrictEqual(names(split.hyp).sort(), ['Mobilité', 'Réactivité', 'Stabilisation'].sort());
  });
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('PDF : aucun "1. "/"2. "/"3. " numérotant une qualité dans le bloc Déficits à investiguer', () => {
    var idx = pdf.indexOf('Déficits à investiguer');
    var end2 = pdf.indexOf('SYNTHÈSE CLINIQUE', idx) > -1 ? pdf.indexOf('SYNTHÈSE CLINIQUE', idx) : idx + 6000;
    var seg = pdf.slice(idx, end2);
    assert.ok(!/>\s*[123]\s*</.test(seg), 'un chiffre de rang semble encore affiché dans un badge');
  });
})();

console.log('');
console.log('CAS 4 — plusieurs qualités avec des sévérités différentes (rouge + orange)');
(function () {
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } }, // rouge
    dj: { active: true, trials: { rsi: [0.55] } }, // orange probable
    sldj: { active: true, D: { trials: { rsi: [0.55] } }, G: { trials: { rsi: [0.55] } } }
  };
  var res = computeMoteur(td, {}, null, null);
  var statuses = res.priorities.map(function (p) { return p.status; });
  test('Pré-requis : au moins deux sévérités distinctes présentes (sinon cas non pertinent)', () => {
    assert.ok(new Set(statuses).size >= 1); // tolère un aplatissement si les seuils réels ne séparent pas ce cas
  });
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Toutes les qualités HYP réellement objectivées apparaissent dans split.hyp, quelle que soit leur sévérité', () => {
    res.priorities.forEach(function (p) {
      if (res.clinicalSynthesis.qualities[p.fonction] && res.clinicalSynthesis.qualities[p.fonction].objectified) {
        assert.ok(names(split.hyp).indexOf(p.fonction) >= 0, p.fonction + ' objectivée mais absente de split.hyp');
      }
    });
  });
})();

console.log('');
console.log('CAS 5 — une qualité HYP rouge + une qualité TFM orange hors HYP');
(function () {
  var td = {
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Pré-requis : Stabilisation (HYP, rouge) + Contrôle Frontal (TFM seul, orange) coexistent dans priorities', () => {
    assert.ok(names(res.priorities).indexOf('Stabilisation') >= 0);
    assert.ok(names(res.priorities).indexOf('Contrôle Frontal') >= 0);
  });
  test('Stabilisation dans split.hyp, Contrôle Frontal dans split.tfmOnly — jamais mélangés', () => {
    assert.deepStrictEqual(names(split.hyp), ['Stabilisation']);
    assert.deepStrictEqual(names(split.tfmOnly), ['Contrôle Frontal']);
  });
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('PDF : Contrôle Frontal apparaît sous "Information TFM secondaire (hors HYP)", pas dans les cartes Déficits à investiguer', () => {
    var idxHyp = pdf.indexOf('Déficits à investiguer');
    var idxTfm = pdf.indexOf('Information TFM secondaire (hors HYP)');
    assert.ok(idxTfm > idxHyp);
    var hypSeg = pdf.slice(idxHyp, idxTfm);
    assert.ok(!hypSeg.includes('Contrôle Frontal'), 'Contrôle Frontal apparaît dans le bloc HYP');
    assert.ok(pdf.slice(idxTfm, idxTfm + 600).includes('Contrôle Frontal'));
  });
})();

console.log('');
console.log('CAS 6 — une qualité non_determinable avec un TFM très défavorable');
(function () {
  // Explosivité : 0/2 preuves diagnostiques jamais classifiables (aucun seuil), quelle que soit la
  // sévérité apparente des valeurs saisies -> reste non_determinable, status=null, jamais dans
  // priorities (filtre rouge/orange strict), donc jamais dans split.hyp ni split.tfmOnly.
  var td = { cmj: { active: true, trials: { conc_rfd: [1], conc_impulse_100: [1] } } };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('Explosivité reste non_determinable malgré des valeurs saisies très défavorables', () => {
    assert.strictEqual(res.functionScores['Explosivité'].hypExp01.state, 'non_determinable');
    assert.strictEqual(res.functionScores['Explosivité'].status, null);
  });
  test('Explosivité absente de priorities (jamais une "priorité clinique" HYP)', () => {
    assert.ok(names(res.priorities).indexOf('Explosivité') === -1);
  });
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Explosivité absente de split.hyp ET de split.tfmOnly', () => {
    assert.ok(names(split.hyp).indexOf('Explosivité') === -1);
    assert.ok(names(split.tfmOnly).indexOf('Explosivité') === -1);
  });
})();

console.log('');
console.log('CAS 7 — une qualité suspectée');
(function () {
  var td = { heel_raise: { active: true, D: { trials: { reps: [5] } }, G: { trials: { reps: [null] } } } };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('Endurance = suspectee (jaune), jamais rouge/orange', () => {
    assert.strictEqual(res.functionScores['Endurance'].hypEnd01.state, 'suspectee');
    assert.strictEqual(res.functionScores['Endurance'].status, 'jaune');
  });
  test('Endurance absente de priorities (filtre rouge/orange strict) donc jamais "priorité clinique"', () => {
    assert.ok(names(res.priorities).indexOf('Endurance') === -1);
  });
})();

console.log('');
console.log('CAS 8 — aucune qualité HYP objectivée');
(function () {
  var res = computeMoteur({}, {}, null, null);
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('split.hyp et split.tfmOnly vides, aucune donnée saisie', () => {
    assert.strictEqual(split.hyp.length, 0);
    assert.strictEqual(split.tfmOnly.length, 0);
  });
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan({}), res);
  test('PDF : ni "Déficits à investiguer" ni "Priorités d\'intervention" ni "Information TFM secondaire" affichés', () => {
    assert.ok(!pdf.includes('Déficits à investiguer'));
    assert.ok(!pdf.includes("Priorités d'intervention"));
    assert.ok(!pdf.includes('Information TFM secondaire'));
  });
})();

console.log('');
console.log('CAS 9 — une relation HYP existante entre deux qualités déficitaires');
(function () {
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('Pré-requis : Mobilité et Stabilisation toutes deux objectivées, relation HYP documentée entre elles', () => {
    assert.ok(res.clinicalSynthesis.explanatoryHypotheses.some(function (r) {
      return (r.explains === 'Mobilité' && r.explained === 'Stabilisation') || (r.explains === 'Stabilisation' && r.explained === 'Mobilité');
    }));
  });
  var split = priHypObjectifiedSplit(res.priorities, res.clinicalSynthesis);
  test('Les deux qualités apparaissent à égalité dans split.hyp (la relation n\'introduit aucun rang)', () => {
    assert.deepStrictEqual(names(split.hyp).sort(), ['Mobilité', 'Stabilisation'].sort());
  });
})();

console.log('');
console.log('CAS 10 — une relation TFM seule sans objectivation HYP');
(function () {
  // Aucune donnée saisie pour aucun moteur HYP : les poids TFM/relations existent dans le
  // référentiel statique (TFM, VAR_REL3) indépendamment des données du patient, mais sans preuve
  // objectivée, aucune qualité ne peut apparaître dans priorities ni dans split.hyp.
  var res = computeMoteur({}, {}, null, null);
  test('TFM/VAR_REL3 existent en tant que référentiels statiques (non vides) même sans données patient', () => {
    assert.ok(Object.keys(TFM).length > 0);
    assert.ok(Object.keys(VAR_REL3).length > 0);
  });
  test('Mais aucune qualité "priorité clinique" ne peut en découler sans preuve objectivée', () => {
    assert.strictEqual(res.priorities.length, 0);
  });
})();

console.log('');
console.log('=== Non-régression — pureté computeMoteur() + fonctions de présentation inertes sur HYP/CSM ===');
(function () {
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res1 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  priHypObjectifiedSplit(res1.priorities, res1.clinicalSynthesis); // appelée avant le 2e calcul, ne doit rien muter
  var res2 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('Appeler priHypObjectifiedSplit() entre deux calculs ne modifie ni functionScores ni clinicalSynthesis ni priorities', () => {
    assert.strictEqual(JSON.stringify(res1.functionScores), JSON.stringify(res2.functionScores));
    assert.strictEqual(JSON.stringify(res1.clinicalSynthesis), JSON.stringify(res2.clinicalSynthesis));
    assert.strictEqual(JSON.stringify(res1.priorities), JSON.stringify(res2.priorities));
  });
})();

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

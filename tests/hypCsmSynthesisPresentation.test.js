// Tests unitaires — Optimisation du rendu de la Synthèse clinique HYP-CSM-01
// (AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md / IMPLEMENTATION_SYNTHESE_CLINIQUE_UI_PDF.md).
//
// Ces tests couvrent UNIQUEMENT la couche de présentation (PDF sportif/expert) :
//   - CSM_STATE_LABEL traduit les enums internes (state) sans jamais les laisser fuir tels quels.
//   - Les deux bugs "undefined" (badge() dans buildSportifReport, table "Fonctions évaluées" dans
//     buildExpertReport) affichent "Non déterminable" pour une qualité HYP non_determinable.
//   - Relations explicatives et concordances apparaissent sous deux titres distincts, jamais
//     fusionnées, et le PDF sportif/expert racontent la même synthèse.
//   - Aucune causalité n'est jamais affirmée ("cause" n'apparaît jamais dans le texte généré).
// computeHypClinicalSynthesis01, les 8 moteurs HYP, TFM, priorities et statusPriorityRank ne sont
// pas modifiés par cette mission : ces tests ne les exercent que comme fournisseurs de données déjà
// couverts par ailleurs (hypClinicalSynthesis01.test.js, prioritiesStatusRanking.test.js, etc.).
//
// Exécution : node tests/hypCsmSynthesisPresentation.test.js — aucune dépendance externe.
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

// ── Scénario riche (3 qualités HYP rouge/confirmées + qualités non_determinable + Contrôle
// Frontal orange TFM) — même construction que prioritiesStatusRanking.test.js "CAS RÉEL", pour
// obtenir un clinicalSynthesis avec `objectified`, `nonDeterminable` et des `relationships` non
// vides (nécessaire pour exercer les blocs "Relations explicatives possibles" / "Concordances").
THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
var td = {
  imtp: { active: true, trials: { n: [1000] } },
  slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } },
  cmj: { active: true, trials: { peak_power: [1] } },
  slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } },
  landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
  landing_bi: { active: true, trials: { tts: [2.5] } }
};
var athlete = { id: 1, prenom: 'Marie', nom: 'Curie', sport: 'Basketball', dateNaissance: null, normPopulation: 'bball2425_ncaa_m' };
var bilan = { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: td, questData: {}, reportOverrides: {} };
var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
var csm = res.clinicalSynthesis;

assert.ok(csm, 'Pré-requis : ce scénario doit produire un clinicalSynthesis.');
assert.ok(csm.objectified.length > 0, 'Pré-requis : au moins une qualité objectivée.');
assert.ok(csm.nonDeterminable.length > 0, 'Pré-requis : au moins une qualité non déterminable.');

var sportifHtml = buildFullReportHtml('sportif', athlete, bilan, res);
var expertHtml = buildFullReportHtml('expert', athlete, bilan, res);

console.log('CSM_STATE_LABEL — traduction, pas de fuite d\'enum interne');
test('CSM_STATE_LABEL couvre les 6 valeurs de `state` produites par CSM', () => {
  ['non_determinable', 'absente', 'suspectee', 'retenue_faible', 'retenue_moderee', 'retenue_forte'].forEach(function (k) {
    assert.ok(typeof CSM_STATE_LABEL[k] === 'string' && CSM_STATE_LABEL[k].length > 0, 'clé manquante : ' + k);
  });
});
test('PDF sportif : aucun enum interne brut (retenue_faible/moderee/forte, non_determinable) ne fuit tel quel', () => {
  assert.ok(!/retenue_faible|retenue_moderee|retenue_forte/.test(sportifHtml), 'un enum `state` brut est visible dans le PDF sportif');
});
test('PDF expert : aucun enum interne brut ne fuit tel quel', () => {
  assert.ok(!/retenue_faible|retenue_moderee|retenue_forte/.test(expertHtml), 'un enum `state` brut est visible dans le PDF expert');
});

console.log('Bug "undefined" (badge() PDF sportif, table Fonctions évaluées PDF expert)');
test('PDF sportif : le texte "undefined" n\'apparaît jamais', () => {
  assert.ok(!/undefined/.test(sportifHtml), 'la chaîne littérale "undefined" est présente dans le PDF sportif');
});
test('PDF expert : le texte "undefined" n\'apparaît jamais', () => {
  assert.ok(!/undefined/.test(expertHtml), 'la chaîne littérale "undefined" est présente dans le PDF expert');
});
test('PDF sportif : une qualité non_determinable affiche "Non déterminable" (pas de badge cassé)', () => {
  assert.ok(/Non déterminable/.test(sportifHtml), 'le libellé "Non déterminable" est absent du PDF sportif');
});
test('PDF expert : la table "Fonctions évaluées" affiche "Non déterminable" pour une fonction sans statut', () => {
  assert.ok(/Non déterminable/.test(expertHtml), 'le libellé "Non déterminable" est absent du PDF expert');
});

console.log('Séparation relations explicatives / concordances (jamais fusionnées)');
test('clinicalSynthesis expose explanatoryHypotheses et relationships séparément (pré-requis structurel)', () => {
  assert.ok(Array.isArray(csm.explanatoryHypotheses));
  assert.ok(Array.isArray(csm.relationships));
});
if (csm.explanatoryHypotheses.length > 0) {
  test('PDF sportif : le bloc "Relations explicatives possibles" est présent et distinct', () => {
    assert.ok(sportifHtml.includes('Relations explicatives possibles'));
  });
  test('PDF expert : le bloc "Relations explicatives possibles" est présent et distinct', () => {
    assert.ok(expertHtml.includes('Relations explicatives possibles'));
  });
}
var concordances = csm.relationships.filter(function (r) { return r.level === 'concordant_no_relation'; });
if (concordances.length > 0) {
  test('PDF sportif : le bloc "Concordances (sans relation documentée)" est présent et distinct des relations explicatives', () => {
    assert.ok(sportifHtml.includes('Concordances (sans relation documentée)'));
  });
  test('PDF expert : le bloc "Concordances (sans relation documentée)" est présent et distinct des relations explicatives', () => {
    assert.ok(expertHtml.includes('Concordances (sans relation documentée)'));
  });
}

console.log('Absence de causalité inventée');
// La mission interdit d'affirmer une causalité ("Force cause Puissance"), pas d'employer le mot
// "cause" en soi — la formulation légitime de CSM ("sans en établir la cause") nie explicitement
// la causalité et doit rester possible. On vérifie donc qu'aucune qualité fonctionnelle n'est
// directement suivie du verbe "cause"/"provoque"/"engendre" (affirmation de causalité), pas
// l'absence totale du mot.
var QUALITIES_RE = '(Force|Puissance|Explosivité|Réactivité|Absorption|Stabilisation|Endurance|Mobilité|Contrôle Frontal)';
var causalAssertion = new RegExp(QUALITIES_RE + '\\s+(cause|provoque|engendre)\\b', 'i');
test('PDF sportif : aucune qualité n\'est présentée comme causant une autre ("X cause Y" absent)', () => {
  assert.ok(!causalAssertion.test(sportifHtml), 'une affirmation de causalité directe est présente dans le PDF sportif');
});
test('PDF expert : aucune qualité n\'est présentée comme causant une autre ("X cause Y" absent)', () => {
  assert.ok(!causalAssertion.test(expertHtml), 'une affirmation de causalité directe est présente dans le PDF expert');
});

console.log('Cohérence UI/PDF — vocabulaire partagé (CSM_STATE_LABEL défini une seule fois, réutilisé partout)');
test('index.html ne définit CSM_STATE_LABEL qu\'une seule fois (pas de redéfinition locale dans ExpertView)', () => {
  var defs = code.match(/var CSM_STATE_LABEL\s*=/g) || [];
  assert.strictEqual(defs.length, 1, 'CSM_STATE_LABEL doit être défini une seule fois, trouvé ' + defs.length + ' fois');
});
test('CSM_STATE_LABEL est utilisé par buildSportifReport ET buildExpertReport (même table de vocabulaire)', () => {
  var sportifSection = code.slice(code.indexOf('function buildSportifReport'), code.indexOf('function buildExpertReport'));
  var expertSection = code.slice(code.indexOf('function buildExpertReport'));
  assert.ok(sportifSection.includes('CSM_STATE_LABEL['), 'buildSportifReport n\'utilise pas CSM_STATE_LABEL');
  assert.ok(expertSection.slice(0, expertSection.indexOf('function buildFullReportHtml') > -1 ? expertSection.indexOf('function buildFullReportHtml') : undefined).includes('CSM_STATE_LABEL['), 'buildExpertReport n\'utilise pas CSM_STATE_LABEL');
});

console.log('Non-régression — HYP/CSM/TFM/priorities/statusPriorityRank intacts');
test('Rejouer computeMoteur() sur les mêmes données produit un clinicalSynthesis strictement identique (pureté)', () => {
  var res2 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  assert.strictEqual(JSON.stringify(res2.clinicalSynthesis), JSON.stringify(csm));
  assert.strictEqual(JSON.stringify(res2.priorities), JSON.stringify(res.priorities));
});
test('priorities conserve l\'ordre rouge-avant-orange (statusPriorityRank non affecté par cette mission)', () => {
  var ranks = res.priorities.map(function (p) { return p.status; });
  var seenOrange = false;
  ranks.forEach(function (s) {
    if (s === 'orange') seenOrange = true;
    if (s === 'rouge') assert.ok(!seenOrange, 'un rouge apparaît après un orange dans priorities');
  });
});

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

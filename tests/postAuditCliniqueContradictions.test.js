// Tests unitaires — Correction des contradictions cliniques post-audit final HYP/CSM
// (IMPLEMENTATION_POST_AUDIT_CLINIQUE_V1.md).
//
// Couvre les 3 cas mandatés par la mission (Problème 6) :
//   CAS A — un état "suspectee" reste "suspectee" à tous les niveaux (HYP/CSM/UI-source/PDF),
//           jamais transformé en normal, déficitaire confirmé ou non déterminable.
//   CAS B — une qualité HYP objectivée + une qualité non déterminable + une relation TFM
//           existante ne produisent jamais de texte causal legacy ("cause", "influencé par",
//           "entraîne") si HYP/CSM ne l'autorise pas.
//   CAS C — plusieurs qualités HYP déficitaires : CSM ne crée aucun rang automatique, aucune
//           qualité n'est présentée comme "priorité principale", tous les déficits restent
//           visibles, relations et concordances restent séparées.
// Ces tests exercent le pipeline réel (computeMoteur -> clinicalSynthesis -> buildFullReportHtml),
// jamais une réécriture parallèle. computeHypClinicalSynthesis01, les 8 moteurs HYP, TFM,
// HYP_QUALITY_RELATIONS, priorities et statusPriorityRank ne sont pas modifiés par cette mission :
// non-régression vérifiée séparément (voir §13 du diff / suite complète).
//
// Exécution : node tests/postAuditCliniqueContradictions.test.js — aucune dépendance externe.
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

console.log('=== CAS A — SUSPECTÉE ===');
(function () {
  // heel_raise est unilatéral (bilateral:false dans TESTS) — un seul côté rempli suffit à rendre
  // heel_raise_reps classifiable, seul mécanisme sur 6 jamais classifiable pour Endurance (les 5
  // repeated_hop restent sans seuil) : reps=5 < seuil orange (15) -> déficitaire, 1/6 -> 'suspectee'.
  var td = { heel_raise: { active: true, D: { trials: { reps: [5] } }, G: { trials: { reps: [null] } } } };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);

  test('HYP (hypEnd01.state) = suspectee', () => {
    assert.strictEqual(res.functionScores['Endurance'].hypEnd01.state, 'suspectee');
  });
  test('functionScores.Endurance.status = jaune (jamais vert/rouge/orange)', () => {
    assert.strictEqual(res.functionScores['Endurance'].status, 'jaune');
  });
  test('CSM.suspected contient Endurance', () => {
    assert.deepStrictEqual(res.clinicalSynthesis.suspected.map(s => s.quality), ['Endurance']);
  });
  test('CSM.objectified NE contient PAS Endurance (jamais transformée en déficit confirmé)', () => {
    assert.ok(!res.clinicalSynthesis.objectified.some(o => o.quality === 'Endurance'));
  });
  test('CSM.nonDeterminable NE contient PAS Endurance (jamais transformée en non déterminable)', () => {
    assert.ok(!res.clinicalSynthesis.nonDeterminable.some(n => n.quality === 'Endurance'));
  });
  test('csmSafeQualityNote(Endurance) renvoie la formulation "suspectee", jamais "normal"', () => {
    var note = csmSafeQualityNote('Endurance', res.clinicalSynthesis);
    assert.ok(/convergence diagnostique/.test(note));
    assert.ok(!/normal/i.test(note));
  });
  test('ExpertView (source) : bloc "Qualités suspectées" lit bien csm.suspected (jamais csm.objectified/nonDeterminable pour cette section)', () => {
    var tabStart = code.indexOf("tab==='synthese'&&(function(){");
    var tabEnd = code.indexOf("tab==='fonctions'&&", tabStart);
    assert.ok(tabStart >= 0 && tabEnd > tabStart, 'bloc onglet Synthèse clinique introuvable dans ExpertView');
    var block = code.slice(tabStart, tabEnd);
    assert.ok(block.includes('Qualités suspectées'), 'bloc "Qualités suspectées" introuvable dans ExpertView');
    assert.ok(block.includes('csm.suspected'), 'le bloc ne lit pas csm.suspected');
  });

  var sportifHtml = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  var expertHtml = buildFullReportHtml('expert', athlete, makeBilan(td), res);
  test('PDF sportif : "Qualités suspectées" + Endurance présents', () => {
    assert.ok(sportifHtml.includes('Qualités suspectées'));
    var idx = sportifHtml.indexOf('Qualités suspectées');
    assert.ok(sportifHtml.slice(idx, idx + 300).includes('Endurance'));
  });
  test('PDF expert : "Qualités suspectées" + Endurance présents', () => {
    assert.ok(expertHtml.includes('Qualités suspectées'));
    var idx = expertHtml.indexOf('Qualités suspectées');
    assert.ok(expertHtml.slice(idx, idx + 300).includes('Endurance'));
  });
  test('PDF sportif : Endurance jamais listée dans "Non déterminable avec les données..."', () => {
    var idx = sportifHtml.indexOf('Non déterminable avec les données actuellement disponibles pour');
    var seg = sportifHtml.slice(idx, idx + 200);
    assert.ok(!seg.includes('Endurance'));
  });
})();

console.log('');
console.log('=== CAS B — CONTRADICTION LEGACY ===');
(function () {
  // Réactivité objectivée (dj+sldj déficitaires), Puissance non déterminable (cmj_peak_power
  // déficitaire mais slcmj_peak_power jamais classifiable) : une relation TFM existe pourtant sur
  // ces deux tests (poids TFM historiques), terreau classique de l'ancienne narration causale
  // ("X entraîne/cause/est principalement influencé par Y") que HYP/CSM n'autorise pas ici.
  var td = {
    dj: { active: true, trials: { rsi: [0.3] } },
    sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } },
    cmj: { active: true, trials: { peak_power: [25] } },
    slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);

  test('Pré-requis : Réactivité objectivée, Puissance non déterminable', () => {
    assert.ok(res.clinicalSynthesis.objectified.some(o => o.quality === 'Réactivité'));
    assert.ok(res.clinicalSynthesis.nonDeterminable.some(n => n.quality === 'Puissance'));
  });

  var sportifHtml = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  var expertHtml = buildFullReportHtml('expert', athlete, makeBilan(td), res);
  // "cause" seul n'est pas interdit : CSM l'emploie légitimement en le NIANT ("sans en établir la
  // cause", cf. csmRelationshipNarrative) — ce qui est interdit, c'est une qualité affirmée comme
  // causant/influençant directement une autre (même pattern que hypCsmSynthesisPresentation.test.js).
  var QUALITIES_RE = '(Force|Puissance|Explosivité|Réactivité|Absorption|Stabilisation|Endurance|Mobilité|Contrôle Frontal)';
  var forbidden = new RegExp(QUALITIES_RE + '\\s+(cause|provoque|engendre)\\b|est (principalement )?responsable de|semble (principalement )?influencé par|entraîne (une|un|de)', 'i');
  test('PDF sportif : aucun texte causal legacy ("X cause Y"/"influencé par"/"entraîne")', () => {
    assert.ok(!forbidden.test(sportifHtml), 'texte causal trouvé : ' + (sportifHtml.match(forbidden) || [])[0]);
  });
  test('PDF expert : aucun texte causal legacy', () => {
    assert.ok(!forbidden.test(expertHtml), 'texte causal trouvé : ' + (expertHtml.match(forbidden) || [])[0]);
  });
  test('csmSafeQualityNote(Réactivité) : jamais causal, cohérent avec l\'état CSM réel', () => {
    var note = csmSafeQualityNote('Réactivité', res.clinicalSynthesis);
    assert.ok(!forbidden.test(note));
  });
  test('csmSafeQualityNote(Puissance) : renvoie le libellé non-déterminable, jamais une conclusion causale', () => {
    var note = csmSafeQualityNote('Puissance', res.clinicalSynthesis);
    assert.ok(note.indexOf(CSM_STATE_LABEL.non_determinable) === 0);
  });
  test('Onglet "Hypothèses" (source) : n\'affiche plus p.hypothese brut, route via csmSafeQualityNote', () => {
    var tabStart = code.indexOf("tab==='hypotheses'&&h('div'");
    var tabEnd = code.indexOf("tab==='orientations'&&", tabStart);
    assert.ok(tabStart >= 0 && tabEnd > tabStart, 'bloc onglet Hypothèses introuvable');
    var block = code.slice(tabStart, tabEnd);
    assert.ok(block.includes('csmSafeQualityNote(p.fonction,res.clinicalSynthesis)'));
    assert.ok(!/'«\s*'\+p\.hypothese\+'\s*»'/.test(block), 'le texte legacy brut p.hypothese est encore affiché directement');
  });
})();

console.log('');
console.log('=== CAS C — MULTIPLES DÉFICITS ===');
(function () {
  // Mobilité + Réactivité + Stabilisation toutes rouges (via wblt / dj+sldj / landing_uni+landing_bi
  // — les 3 qualités universellement classifiables sans dépendance de population, cf.
  // AUDIT_FINAL_CLINIQUE_KINEXUS_V1.md §4), à sévérité strictement identique.
  var td = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    dj: { active: true, trials: { rsi: [0.3] } },
    sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);

  test('Pré-requis : 3 qualités rouges à égalité de sévérité dans priorities', () => {
    var top3 = res.priorities.slice(0, 3).map(p => p.status);
    assert.deepStrictEqual(top3, ['rouge', 'rouge', 'rouge']);
  });
  test('topSeverityGroup(priorities) retourne les 3 qualités à égalité, pas un seul élément', () => {
    var group = topSeverityGroup(res.priorities);
    assert.strictEqual(group.length, 3);
  });
  test('CSM ne crée aucun champ de rang/priorité (objectified reste un ensemble non ordonné par importance)', () => {
    res.clinicalSynthesis.objectified.forEach(o => {
      assert.ok(!('rank' in o) && !('priority' in o) && !('causePrincipale' in o));
    });
  });

  var sportifHtml = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  var expertHtml = buildFullReportHtml('expert', athlete, makeBilan(td), res);
  test('PDF sportif : "Priorité principale" n\'apparaît plus nulle part (3 qualités à égalité)', () => {
    assert.ok(!sportifHtml.includes('Priorité principale'));
  });
  test('PDF sportif : "Déficits objectivés" affiche bien les 3 qualités à égalité (jamais une seule, cf. topSeverityGroup)', () => {
    var idx = sportifHtml.indexOf('Déficits objectivés');
    assert.ok(idx >= 0);
    var seg = sportifHtml.slice(idx, idx + 300);
    // La valeur affichée peut utiliser le nom du contributeur TFM (ex. "Cheville" pour Mobilité,
    // mécanisme inchangé, cf. buildSportifReport) plutôt que le nom de la qualité elle-même — donc
    // vérifié ici par le SÉPARATEUR " · " (3 éléments joints), pas par les noms exacts.
    assert.strictEqual((seg.match(/ · /g) || []).length >= 2, true, 'les 3 qualités à égalité ne semblent pas toutes affichées (séparateur " · " absent ou incomplet)');
  });
  test('PDF sportif : les 3 qualités objectivées apparaissent (badges) dans la section Synthèse clinique elle-même', () => {
    var idx = sportifHtml.indexOf('Un déficit est objectivé pour');
    assert.ok(idx >= 0);
    var seg = sportifHtml.slice(Math.max(0, idx - 400), idx + 300);
    ['Mobilité', 'Réactivité', 'Stabilisation'].forEach(q => assert.ok(seg.includes(q), q + ' absente de la section Synthèse clinique'));
  });
  test('Relations et concordances restent séparées (deux titres distincts) dans le PDF sportif', () => {
    var idxRel = sportifHtml.indexOf('Relations explicatives possibles');
    var idxConc = sportifHtml.indexOf('Concordances (sans relation documentée)');
    assert.ok(idxRel >= 0 && idxConc >= 0 && idxRel !== idxConc);
  });
  test('PDF expert : "Priorité principale" n\'apparaît nulle part (buildExpertReport ne l\'a jamais utilisée)', () => {
    assert.ok(!expertHtml.includes('Priorité principale'));
  });
  test('AnalyseView (source) : carte dashboard utilise topSeverityGroup, plus un seul pri[0] désigné "Priorité principale"', () => {
    var m = code.match(/'Déficits objectivés'\)[\s\S]{0,700}/);
    assert.ok(m, 'carte "Déficits objectivés" introuvable dans AnalyseView');
    assert.ok(m[0].includes('topSeverityGroup') || code.includes('var topGroup=topSeverityGroup(pri)'));
  });
})();

console.log('');
console.log('=== Non-régression — pureté computeMoteur() (HYP/CSM inchangés par cette mission) ===');
(function () {
  var td = {
    dj: { active: true, trials: { rsi: [0.3] } },
    sldj: { active: true, D: { trials: { rsi: [0.2] } }, G: { trials: { rsi: [0.2] } } },
    heel_raise: { active: true, D: { trials: { reps: [5] } }, G: { trials: { reps: [null] } } }
  };
  var res1 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var res2 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('Deux appels identiques à computeMoteur() produisent functionScores/clinicalSynthesis strictement identiques', () => {
    assert.strictEqual(JSON.stringify(res1.functionScores), JSON.stringify(res2.functionScores));
    assert.strictEqual(JSON.stringify(res1.clinicalSynthesis), JSON.stringify(res2.clinicalSynthesis));
    assert.strictEqual(JSON.stringify(res1.priorities), JSON.stringify(res2.priorities));
  });
})();

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

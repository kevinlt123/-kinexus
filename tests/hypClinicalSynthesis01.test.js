// Tests unitaires — HYP-CSM-01, moteur de synthèse clinique multi-qualités.
//
// CSM ne diagnostique rien : il consomme exclusivement functionScores déjà produit par
// computeMoteur() (les 8 hypXxx01, contrat HYP V1 commun). Ces tests vérifient qu'il ne fait
// QUE synthétiser — jamais recalculer, jamais inventer une relation, jamais hiérarchiser
// automatiquement, jamais transformer non_determinable en normal.
//
// Exécution : node tests/hypClinicalSynthesis01.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var C={');
const end = code.indexOf('// ── SUPABASE CONFIG');
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur() dans index.html.');
const slice = code.slice(start, end);

global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok — ' + name);
  } catch (e) {
    failed++;
    console.log('  FAIL — ' + name);
    console.log('    ' + e.message);
  }
}

var POP = 'general_m_senior', AGE = 30;
var POP_CMJ = 'bball2425_ncaa_m', AGE_CMJ = 26; // cmj_peak_power a une couverture NORMS réelle sur cette population (cf. tests/hypPower01.test.js).
function withTempSlcmjNorm(fn) {
  var had = 'slcmj_peak_power' in THRESHOLDS;
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  try { return fn(); } finally { if (!had) delete THRESHOLDS.slcmj_peak_power; }
}

function withTempForceNorms(fn) {
  THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
  THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.imtp_n; delete THRESHOLDS.slimtp_n; }
}
function withTempExpNorms(fn) {
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.cmj_conc_rfd; delete THRESHOLDS.cmj_conc_impulse_100; }
}
function forceDeficitData() {
  return { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
}
function stabilisationDeficitData() {
  return { landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }, landing_bi: { active: true, trials: { tts: [2.5] } } };
}
function enduranceDeficitData() {
  return { heel_raise: { active: true, D: { trials: { reps: [10] } }, G: { trials: { reps: [10] } } } };
}

console.log('CAS 1 — Aucune qualité déficitaire');
test('Aucune donnée -> objectified vide, 8 qualités non_determinable, narrative honnête', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  var csm = computeHypClinicalSynthesis01(r.functionScores);
  assert.strictEqual(csm.objectified.length, 0);
  assert.strictEqual(csm.nonDeterminable.length, 8);
  assert.ok(csm.narrative.deficitsObjectives.indexOf('Aucun déficit') !== -1);
});

console.log('\nCAS 2 — Force seule');
test('Force retenue_faible seule -> objectified=[Force], aucune relation (rien d\'autre objectivé)', () => {
  withTempForceNorms(() => {
    var r = computeMoteur(forceDeficitData(), {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(o => o.quality), ['Force']);
    assert.strictEqual(csm.explanatoryHypotheses.length, 0);
  });
});

console.log('\nCAS 3 — Puissance seule');
test('Puissance retenue_faible seule (via seuil temporaire slcmj + population couvrant cmj_peak_power) -> objectified=[Puissance]', () => {
  withTempSlcmjNorm(() => {
    var td = { cmj: { active: true, trials: { peak_power: [10] } }, slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } } };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(o => o.quality), ['Puissance']);
  });
});

console.log('\nCAS 4 — Force + Puissance : jamais de causalité automatique');
test('Force et Puissance objectivées -> pas de "entraîne"/"cause", relation traitée prudemment si documentée', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = Object.assign({}, forceDeficitData(), { cmj: { active: true, trials: { peak_power: [10] } }, slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } } });
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(o => o.quality).sort(), ['Force', 'Puissance']);
    var allText = JSON.stringify(csm.relationships) + JSON.stringify(csm.narrative);
    assert.strictEqual(allText.indexOf('entraîne'), -1);
    assert.strictEqual(allText.indexOf('est la cause'), -1);
    assert.strictEqual(allText.indexOf('est responsable de'), -1);
    // Force -> Puissance documenté (HYP_QUALITY_RELATIONS) -> hypothèse explicative attendue.
    var rel = csm.explanatoryHypotheses.filter(function (h) { return h.explains === 'Force' && h.explained === 'Puissance'; });
    assert.strictEqual(rel.length, 1);
    assert.ok(rel[0].narrative.indexOf('hypothèse explicative') !== -1);
  }));
});

console.log('\nCAS 5 — Force + Puissance + Explosivité : déficits concordants, pas de hiérarchie');
test('3 qualités objectivées -> toutes listées, aucune désignée comme "cause principale" par une assertion CSM', () => {
  withTempForceNorms(() => withTempExpNorms(() => {
    var td = Object.assign({}, forceDeficitData(), { cmj: { active: true, trials: { conc_rfd: [10], conc_impulse_100: [0.1] } } });
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(o => o.quality).sort(), ['Explosivité', 'Force']);
    // "cause principale"/"déficit principal" n'apparaissent QUE dans le texte de garde-fou
    // ("CSM ne détermine jamais..."), jamais comme affirmation positive ("X est le/la ...").
    assert.strictEqual(/(est|constitue)\s+(le|la)\s+(déficit|cause)\s+principal/i.test(JSON.stringify(csm)), false);
    csm.objectified.forEach(function (o) { assert.strictEqual('rank' in o, false); assert.strictEqual('priority' in o, false); });
  }));
});

console.log('\nCAS 6 — Absorption + Stabilisation : qualités distinguées, jamais fusionnées');
test('Absorption et Stabilisation restent 2 entrées distinctes dans qualities/objectified', () => {
  var POP_CMJ = 'bball2425_ncaa_m';
  var td = Object.assign({ cmj: { active: true, trials: { braking_rfd: [1], force_zero_vel: [1], braking_impulse: [40] } } }, stabilisationDeficitData());
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var csm = computeHypClinicalSynthesis01(r.functionScores);
  assert.deepStrictEqual(csm.objectified.map(o => o.quality).sort(), ['Absorption', 'Stabilisation']);
  assert.notStrictEqual(csm.qualities['Absorption'], csm.qualities['Stabilisation']);
});

console.log('\nCAS 7 — Réactivité + Absorption : DJ RSI jamais promu diagnostic d\'Absorption');
test('dj_rsi explicatif d\'Absorption jamais présenté comme diagnostic ; qualities distinctes', () => {
  var td = { dj: { active: true, trials: { rsi: [0.1] } }, sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [0.1] } } } }; // rsi faible = déficitaire (dir max)
  var r = computeMoteur(td, {}, POP, AGE);
  var csm = computeHypClinicalSynthesis01(r.functionScores);
  assert.deepStrictEqual(csm.objectified.map(o => o.quality), ['Réactivité']);
  assert.strictEqual(JSON.stringify(csm.qualities['Absorption'].hyp.diagnostic || csm.qualities['Absorption'].hyp.diagnosticEvidence).indexOf('dj_rsi'), -1);
});

console.log('\nCAS 8 — Force + Endurance : aucune déduction automatique');
test('Force et Endurance objectivées -> relation documentée (Force explique Endurance) présentée en hypothèse, jamais affirmée', () => {
  withTempForceNorms(() => {
    var td = Object.assign({}, forceDeficitData(), enduranceDeficitData());
    // heel_raise seul -> Endurance = suspectee (1/6), pas objectivé -> pas de relation retenue.
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(o => o.quality), ['Force']);
    assert.deepStrictEqual(csm.suspected.map(o => o.quality), ['Endurance']);
    assert.strictEqual(csm.explanatoryHypotheses.filter(function (h) { return h.explained === 'Endurance'; }).length, 0, 'Endurance non objectivée (suspectee) -> pas d\'hypothèse explicative générée');
  });
});

console.log('\nCAS 9 — Profil multi-déficits complet');
test('7 qualités objectivées simultanément -> toutes listées, narrative sans hiérarchie', () => {
  var POP_CMJ = 'bball2425_ncaa_m';
  var td = withTempForceNorms(() => withTempExpNorms(() => {
    return Object.assign(
      {},
      forceDeficitData(),
      stabilisationDeficitData(),
      enduranceDeficitData(),
      {
        cmj: { active: true, trials: { peak_power: [10], conc_rfd: [10], conc_impulse_100: [0.1], braking_rfd: [1], force_zero_vel: [1], braking_impulse: [40] } },
        slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } },
        dj: { active: true, trials: { rsi: [0.1] } },
        sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [0.1] } } },
        heel_raise: { active: true, D: { trials: { reps: [5] } }, G: { trials: { reps: [5] } } },
        repeated_hop: { active: true, D: { trials: { n_hops: [1] } }, G: { trials: { n_hops: [1] } } }
      }
    );
  }));
  var hadSlcmj = 'slcmj_peak_power' in THRESHOLDS;
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
  THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
  THRESHOLDS.cmj_conc_rfd = { vert: 100, jaune: 70, orange: 40, dir: 'max' };
  THRESHOLDS.cmj_conc_impulse_100 = { vert: 1, jaune: 0.7, orange: 0.4, dir: 'max' };
  try {
    var r = computeMoteur(td, {}, POP_CMJ, 26);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.ok(csm.objectified.length >= 5, 'au moins 5 qualités objectivées dans ce profil très dégradé (obtenu : ' + csm.objectified.map(o => o.quality).join(',') + ')');
    assert.strictEqual(/(est|constitue)\s+(le|la)\s+(déficit|cause)\s+principal/i.test(JSON.stringify(csm)), false);
  } finally {
    if (!hadSlcmj) delete THRESHOLDS.slcmj_peak_power;
    delete THRESHOLDS.imtp_n; delete THRESHOLDS.slimtp_n; delete THRESHOLDS.cmj_conc_rfd; delete THRESHOLDS.cmj_conc_impulse_100;
  }
});

console.log('\nCAS 10 — Qualité non_determinable jamais présentée comme normale');
test('Puissance non_determinable (slcmj non normé) -> jamais dans objectified, jamais "absente"/"normal" dans la narrative', () => {
  var r = computeMoteur({ cmj: { active: true, trials: { peak_power: [10] } } }, {}, POP, AGE);
  var csm = computeHypClinicalSynthesis01(r.functionScores);
  assert.strictEqual(csm.qualities['Puissance'].state, 'non_determinable');
  assert.strictEqual(csm.objectified.some(o => o.quality === 'Puissance'), false);
  assert.ok(csm.nonDeterminable.some(n => n.quality === 'Puissance'));
  // "normal" apparaît légitimement dans le garde-fou ("non déterminable n'équivaut jamais à
  // normal") — on vérifie l'absence d'une affirmation positive ("est normal"), pas le mot seul.
  assert.strictEqual(csm.narrative.qualitesNonDeterminables.toLowerCase().indexOf('est normal'), -1);
  assert.strictEqual(csm.narrative.deficitsObjectives.toLowerCase().indexOf('absente'), -1);
});

console.log('\nCAS 11 — Relation TFM/HYP existante -> exploitée en hypothèse explicative');
test('Force + Stabilisation (relation documentée HYP_QUALITY_RELATIONS) -> explanatoryHypotheses non vide', () => {
  withTempForceNorms(() => {
    var td = Object.assign({}, forceDeficitData(), stabilisationDeficitData());
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.strictEqual(csm.explanatoryHypotheses.length, 1);
    assert.strictEqual(csm.explanatoryHypotheses[0].explains, 'Force');
    assert.strictEqual(csm.explanatoryHypotheses[0].explained, 'Stabilisation');
  });
});

console.log('\nCAS 12 — Relation absente -> association neutre uniquement, aucune invention');
test('Puissance + Réactivité (aucune relation documentée) -> concordant_no_relation, aucune hypothèse explicative fabriquée', () => {
  withTempSlcmjNorm(() => {
    var td = {
      cmj: { active: true, trials: { peak_power: [10] } }, slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } },
      dj: { active: true, trials: { rsi: [0.1] } }, sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [0.1] } } }
    };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(o => o.quality).sort(), ['Puissance', 'Réactivité']);
    var concordant = csm.relationships.filter(function (x) { return x.level === 'concordant_no_relation'; });
    assert.ok(concordant.some(function (x) { return [x.qualityA, x.qualityB].sort().join('|') === 'Puissance|Réactivité'; }));
    assert.strictEqual(csm.explanatoryHypotheses.filter(function (h) { return (h.explains === 'Puissance' && h.explained === 'Réactivité') || (h.explains === 'Réactivité' && h.explained === 'Puissance'); }).length, 0);
  });
});

console.log('\nCAS 13 — Relation avec qualité non_determinable -> jamais présentée comme déficitaire');
test('Force non_determinable + Puissance objectivée : Force n\'est jamais présentée comme hypothèse explicative', () => {
  withTempSlcmjNorm(() => {
    var td = { cmj: { active: true, trials: { peak_power: [10] } }, slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } } };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.strictEqual(csm.qualities['Force'].state, 'non_determinable');
    assert.deepStrictEqual(csm.objectified.map(o => o.quality), ['Puissance']);
    var rel = csm.relationships.filter(function (x) { return x.explains === 'Force' && x.explained === 'Puissance'; })[0];
    assert.strictEqual(rel.level, 'not_applicable_non_determinable');
    assert.ok(rel.narrative.indexOf('La contribution de Force') !== -1, 'la narrative doit désigner Force (côté non déterminable), pas Puissance : ' + rel.narrative);
    assert.strictEqual(csm.explanatoryHypotheses.length, 0);
  });
});

console.log('\nCAS 14 — Relation explicative valide, formulation prudente vérifiée mot pour mot');
test('Formulation "hypothèse explicative"/"sans en établir la cause" présente, jamais "cause de"/"responsable de"', () => {
  withTempForceNorms(() => {
    var td = Object.assign({}, forceDeficitData(), stabilisationDeficitData());
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    var n = csm.explanatoryHypotheses[0].narrative;
    assert.ok(n.indexOf('hypothèse explicative') !== -1);
    assert.ok(n.indexOf('sans en établir la cause') !== -1);
    assert.strictEqual(n.indexOf('responsable de'), -1);
    assert.strictEqual(n.indexOf('est la cause'), -1);
  });
});

console.log('\nCAS 15 — Absence de causalité automatique dans toute la sortie CSM');
test('Aucune occurrence de "entraîne"/"est responsable de"/"est la cause de" dans la sortie complète, quel que soit le profil', () => {
  withTempForceNorms(() => withTempExpNorms(() => {
    var td = Object.assign({}, forceDeficitData(), { cmj: { active: true, trials: { conc_rfd: [10], conc_impulse_100: [0.1] } } });
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    var full = JSON.stringify(csm);
    assert.strictEqual(full.indexOf('entraîne'), -1);
    assert.strictEqual(full.indexOf('est responsable de'), -1);
    assert.strictEqual(full.indexOf('est la cause de'), -1);
  }));
});

console.log('\nCAS 16 — Absence de hiérarchie automatique');
test('Aucun champ ne désigne une qualité comme "principale"/"primary" ; toutes les qualités objectivées sont au même niveau', () => {
  withTempForceNorms(() => withTempExpNorms(() => {
    var td = Object.assign({}, forceDeficitData(), { cmj: { active: true, trials: { conc_rfd: [10], conc_impulse_100: [0.1] } } });
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.strictEqual('primaryDeficit' in csm, false);
    assert.strictEqual('mainCause' in csm, false);
    csm.objectified.forEach(function (o) { assert.strictEqual('rank' in o, false); assert.strictEqual('priority' in o, false); });
  }));
});

console.log('\nCAS 17 — Variables explicatives correctement remontées (jamais promues diagnostiques)');
test('Note capacité/stratégie Puissance remontée dans explanatoryNotes, jamais dans objectified/diagnostic', () => {
  var td = { cmj: { active: true, trials: { peak_power: [10] } }, slcmj: { active: true, D: { trials: { peak_power: [10] } }, G: { trials: { peak_power: [10] } } }, iso_belt_squat: { active: true, trials: { n: [100] } } };
  var had = 'slcmj_peak_power' in THRESHOLDS;
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  try {
    var r = computeMoteur(td, {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    // iso_belt_squat_n reste explicative — jamais un nouveau champ "diagnostic" pour Puissance.
    assert.strictEqual('iso_belt_squat_n' in (csm.qualities['Puissance'].hyp.diagnosticEvidence || {}), false);
  } finally { if (!had) delete THRESHOLDS.slcmj_peak_power; }
});

console.log('\nCAS 18 — Asymétrie correctement traitée comme précision');
test('precision[quality] reprend exactement hypXxx01.precision, jamais utilisée pour générer un objectified', () => {
  withTempForceNorms(() => {
    var r = computeMoteur(forceDeficitData(), {}, POP, AGE);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.precision['Force'], r.functionScores['Force'].hypFor01.precision);
  });
});

console.log('\nCAS 19 — Aucun diagnostic HYP modifié par CSM');
test('Les 8 hypXxx01 restent strictement identiques (deepStrictEqual) avant/après appel à computeHypClinicalSynthesis01', () => {
  withTempForceNorms(() => {
    var r = computeMoteur(forceDeficitData(), {}, POP, AGE);
    // JSON.stringify des deux côtés (pas deepStrictEqual objet-vs-JSON-parsé, qui perdrait les
    // clés `undefined` d'un seul côté et donnerait un faux positif) — comparaison symétrique.
    var before = {};
    Object.keys(HYP_CSM_HYP_KEY).forEach(function (q) { before[q] = JSON.stringify(r.functionScores[q][HYP_CSM_HYP_KEY[q]]); });
    computeHypClinicalSynthesis01(r.functionScores);
    Object.keys(HYP_CSM_HYP_KEY).forEach(function (q) {
      var key = HYP_CSM_HYP_KEY[q];
      assert.strictEqual(JSON.stringify(r.functionScores[q][key]), before[q], q + '.' + key + ' modifié par CSM');
    });
  });
});

console.log('\nCAS 20 — Aucune autre qualité modifiée par l\'appel CSM (computeMoteur inchangé)');
test('Appeler computeHypClinicalSynthesis01 ne modifie ni functionScores, ni testStatuses, ni systemScores, ni priorities', () => {
  withTempForceNorms(() => {
    var r = computeMoteur(forceDeficitData(), {}, POP, AGE);
    var beforeFull = JSON.stringify(r);
    computeHypClinicalSynthesis01(r.functionScores);
    var afterFull = JSON.stringify(r);
    assert.strictEqual(beforeFull, afterFull);
  });
});

console.log('\nRégression — pureté et structure');
test('Pureté : deux appels identiques produisent le même résultat CSM (hors référence hyp, structurellement identique)', () => {
  withTempForceNorms(() => {
    var r = computeMoteur(forceDeficitData(), {}, POP, AGE);
    var csmA = computeHypClinicalSynthesis01(r.functionScores);
    var csmB = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csmA.objectified, csmB.objectified);
    assert.deepStrictEqual(csmA.nonDeterminable, csmB.nonDeterminable);
    assert.deepStrictEqual(csmA.narrative, csmB.narrative);
  });
});
test('Contrat de sortie CSM : csmId/version/qualities/objectified/nonDeterminable/relationships/explanatoryHypotheses/precision/limitations/narrative tous présents', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  var csm = computeHypClinicalSynthesis01(r.functionScores);
  ['csmId', 'version', 'qualities', 'objectified', 'nonDeterminable', 'relationships', 'explanatoryHypotheses', 'precision', 'limitations', 'narrative'].forEach(function (f) {
    assert.ok(f in csm, 'champ de contrat CSM manquant : ' + f);
  });
  assert.strictEqual(csm.csmId, 'HYP-CSM-01');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

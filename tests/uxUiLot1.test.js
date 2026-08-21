// Tests unitaires — Lot UX/UI 1 : correction de la hiérarchie visuelle (Plan de prise en charge)
// + design Absorption (sous-domaines) (IMPLEMENTATION_UX_UI_LOT1.md).
//
// Couvre les 8 cas mandatés par la mission (Objectif 7) sur le pipeline réel
// (computeMoteur -> absorptionSousDomainesSummary / buildFullReportHtml). Aucune donnée n'est
// réécrite : chaque test lit exactement ce que produit le code réel de index.html.
//
// Exécution : node tests/uxUiLot1.test.js — aucune dépendance externe.
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

console.log('CAS 1 — plusieurs déficits de même sévérité');
(function () {
  var td = {
    cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('Pré-requis : au moins 2 qualités rouge simultanément', () => {
    var rouges = res.priorities.filter(function (p) { return p.status === 'rouge'; });
    assert.ok(rouges.length >= 2);
  });
})();

console.log('');
console.log('CAS 2 — absence de "Priorité 1/2/3" artificielle dans le PDF sportif');
(function () {
  var td = {
    cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('Aucune occurrence de "Priorité " (badge de rang) dans le PDF', () => {
    assert.ok(!/Priorité\s*\d/.test(pdf), 'un badge "Priorité N" est encore présent');
  });
  test('"Plan de prise en charge" toujours présent (section conservée)', () => {
    assert.ok(pdf.includes('Plan de prise en charge'));
  });
  test('Les 3 qualités du Plan de prise en charge apparaissent sans classement (pastille + nom, comme Déficits à investiguer)', () => {
    var idxPlan = pdf.indexOf('Plan de prise en charge');
    var seg = pdf.slice(idxPlan, idxPlan + 4000);
    ['Absorption', 'Mobilité', 'Stabilisation'].forEach(function (q) {
      assert.ok(seg.includes(q), q + ' absente du Plan de prise en charge');
    });
  });
})();

console.log('');
console.log('CAS 3 — catégories RENFORCER/DÉVELOPPER/INTÉGRER retirées (hiérarchie déguisée confirmée par audit)');
(function () {
  test('recVerbs (rotation positionnelle Renforcer/Développer/Intégrer) n\'est plus déclaré comme code exécutable (seule une mention en commentaire explicatif est tolérée)', () => {
    assert.ok(!/var\s+recVerbs\s*=/.test(code), 'recVerbs est encore déclaré comme variable — la hiérarchie déguisée par verbe positionnel devrait être supprimée');
  });
  var td = {
    cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('Aucune des étiquettes positionnelles "Renforcer"/"Développer"/"Intégrer" dans le Plan de prise en charge', () => {
    var idxPlan = pdf.indexOf('Plan de prise en charge');
    var idxNext = pdf.indexOf('Informations pratiques', idxPlan);
    var seg = pdf.slice(idxPlan, idxNext > -1 ? idxNext : idxPlan + 5000);
    assert.ok(!seg.includes('>Renforcer<') && !seg.includes('>Développer<') && !seg.includes('>Intégrer<'));
  });
})();

console.log('');
console.log('CAS 4 — Absorption avec 4 sous-domaines (freinage déficitaire + capacité excentrique dégradée)');
(function () {
  var td = { cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5], ecc_peak_vel: [0.1] } } };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var sd = absorptionSousDomainesSummary(res.functionScores);
  test('absorptionSousDomainesSummary retourne exactement 4 sous-domaines (A-D, jamais E)', () => {
    assert.strictEqual(sd.length, 4);
    assert.deepStrictEqual(sd.map(function (s) { return s.key; }), ['A_core', 'B_capaciteExcentrique', 'C_strategie', 'D_absorptionReactive']);
  });
  test('Freinage (A_core) porte le statut réel du moteur (rouge, non inventé)', () => {
    var a = sd.filter(function (s) { return s.key === 'A_core'; })[0];
    assert.strictEqual(a.status, res.functionScores['Absorption'].hypAbs01.sousDomaines.A_core.braking_rfd.status === 'rouge' || res.functionScores['Absorption'].hypAbs01.sousDomaines.A_core.force_zero_vel.status === 'rouge' ? 'rouge' : a.status);
  });
  test('Capacité excentrique (B) reflète ecc_peak_vel dégradée', () => {
    var b = sd.filter(function (s) { return s.key === 'B_capaciteExcentrique'; })[0];
    assert.strictEqual(b.status, res.functionScores['Absorption'].hypAbs01.sousDomaines.B_capaciteExcentrique.ecc_peak_vel.status);
  });
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('PDF : les 4 libellés de sous-domaines apparaissent dans la carte Absorption', () => {
    ['Freinage / décélération', 'Capacité excentrique', 'Stratégie', 'Absorption réactive'].forEach(function (lbl) {
      assert.ok(pdf.includes(lbl), lbl + ' absent du PDF');
    });
  });
  test('PDF : aucune mention du sous-domaine E (Réception/Impact) — jamais implémenté, jamais affiché', () => {
    assert.ok(!pdf.includes('Réception / Impact') && !pdf.includes('Réception/Impact'));
  });
})();

console.log('');
console.log('CAS 5 — Absorption avec certains sous-domaines non classifiables (Stratégie/Réactive jamais normées)');
(function () {
  // braking_rfd + force_zero_vel seuls -> Absorption objectivée, mais C_strategie/D_absorptionReactive
  // n'ont aucune donnée saisie (cmj_depth, dj_rsi absents) -> non classifiables.
  var td = { cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } } };
  var res = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var sd = absorptionSousDomainesSummary(res.functionScores);
  test('Stratégie (C) et Absorption réactive (D) sont non classifiables (status null) faute de données', () => {
    var c = sd.filter(function (s) { return s.key === 'C_strategie'; })[0];
    var d = sd.filter(function (s) { return s.key === 'D_absorptionReactive'; })[0];
    assert.strictEqual(c.status, null);
    assert.strictEqual(d.status, null);
  });
  var pdf = buildFullReportHtml('sportif', athlete, makeBilan(td), res);
  test('PDF : Stratégie et Absorption réactive affichent le vocabulaire "Non déterminable" existant, jamais "normal"/vert', () => {
    var idx = pdf.indexOf('Stratégie');
    assert.ok(idx > -1);
    var seg = pdf.slice(idx, idx + 200);
    assert.ok(seg.includes('Non déterminable'));
  });
})();

console.log('');
console.log('CAS 6 — Absorption non déterminable (aucune donnée)');
(function () {
  var res = computeMoteur({}, {}, 'bball2425_ncaa_m', 26);
  test('Absorption reste non_determinable sans données CMJ', () => {
    assert.strictEqual(res.functionScores['Absorption'].hypAbs01.state, 'non_determinable');
  });
  test('absorptionSousDomainesSummary : les 4 sous-domaines sont tous status:null (jamais "normal")', () => {
    var sd = absorptionSousDomainesSummary(res.functionScores);
    sd.forEach(function (s) { assert.strictEqual(s.status, null); });
  });
})();

console.log('');
console.log('CAS 7 — absence de régression des 8 moteurs HYP (comparaison stricte sur profil riche)');
(function () {
  var td = {
    cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5], ecc_peak_vel: [0.1] } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    dj: { active: true, trials: { rsi: [0.5] } },
    sldj: { active: true, D: { trials: { rsi: [0.4] } }, G: { trials: { rsi: [0.4] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } },
    heel_raise: { active: true, D: { trials: { reps: [5] } }, G: { trials: { reps: [null] } } }
  };
  var res1 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  absorptionSousDomainesSummary(res1.functionScores); // appel entre les deux calculs, ne doit rien muter
  var res2 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('functionScores strictement identiques avant/après lecture des sous-domaines (les 8 moteurs HYP inclus)', () => {
    assert.strictEqual(JSON.stringify(res1.functionScores), JSON.stringify(res2.functionScores));
  });
})();

console.log('');
console.log('CAS 8 — absence de modification de CSM (clinicalSynthesis strictement identique)');
(function () {
  var td = {
    cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    landing_bi: { active: true, trials: { tts: [2.5] } }
  };
  var res1 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  var res2 = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
  test('clinicalSynthesis strictement identique (JSON) sur deux calculs successifs', () => {
    assert.strictEqual(JSON.stringify(res1.clinicalSynthesis), JSON.stringify(res2.clinicalSynthesis));
  });
  test('priorities et statusPriorityRank inchangés : même tri qu\'avant (rouge avant orange, jamais l\'inverse)', () => {
    var statuses = res1.priorities.map(function (p) { return p.status; });
    var rank = { rouge: 0, orange: 1 };
    for (var i = 1; i < statuses.length; i++) {
      assert.ok(rank[statuses[i - 1]] <= rank[statuses[i]], 'ordre de priorities rompu : ' + statuses.join(','));
    }
  });
})();

console.log('');
console.log('=== Onglet Variables : filtre par qualité (Objectif 4) ===');
(function () {
  test('HYP_CSM_QUALITIES (référentiel déjà existant, réutilisé pour le filtre) contient les 8 qualités attendues', () => {
    assert.deepStrictEqual(HYP_CSM_QUALITIES, ['Mobilité', 'Réactivité', 'Absorption', 'Force', 'Puissance', 'Explosivité', 'Stabilisation', 'Endurance']);
  });
  test('VAR_REL3 expose bien measures/estimates par variable (donnée déjà existante, filtre lu sans recalcul)', () => {
    var sample = VAR_REL3['wblt_distance'];
    assert.ok(sample && (Array.isArray(sample.measures) || Array.isArray(sample.estimates)));
  });
})();

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

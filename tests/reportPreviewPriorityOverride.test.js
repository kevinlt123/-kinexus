// Tests unitaires — FIX_REPORT_PREVIEW_PRIORITY_OVERRIDE.md
//
// Bug corrigé : le composant ReportPreview (~L7697) matérialisait toujours un objet
// `reportOverrides.priorities` dès son ouverture, même sans aucune décision du praticien. Le
// rapport (buildSportifReport, prioCardOverridden=reportOv.priorities!=null, ~L6811) interprétait
// alors cette simple présence comme « le praticien a validé une priorité clinique explicite » et
// affichait « Priorité principale » avec une seule qualité choisie — au lieu du comportement
// normalisé « Déficits objectivés » (toutes les qualités à égalité de sévérité, sans classement),
// utilisé par le bouton de téléchargement direct (printReport, qui passe le bilan brut).
//
// Ces tests exercent le VRAI composant ReportPreview (hooks React réels via un mini moteur de
// rendu à état persistant, pas une fonction isolée), pour prouver le comportement au niveau où le
// bug a été découvert : ouverture de l'aperçu -> HTML produit dans l'iframe -> téléchargement.
//
// Exécution : node tests/reportPreviewPriorityOverride.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const endMarker = "ReactDOM.createRoot(document.getElementById('root'))";
const end = code.indexOf(endMarker);
if (end < 0) throw new Error('Impossible de localiser le moteur dans index.html.');
const src = code.slice(0, end);

// ── Mini moteur de hooks React (state réel, persistant entre rendus, pour exercer le VRAI
// ReportPreview — pas une simulation de sa logique interne) ────────────────────────────────────
function makeReactStub() {
  var hooks = [];
  var hookIndex = 0;
  function useState(init) {
    var i = hookIndex++;
    if (!(i in hooks)) hooks[i] = { value: typeof init === 'function' ? init() : init };
    var cell = hooks[i];
    function setState(v) { cell.value = typeof v === 'function' ? v(cell.value) : v; }
    return [cell.value, setState];
  }
  function useRef(init) {
    var i = hookIndex++;
    if (!(i in hooks)) hooks[i] = { current: init };
    return hooks[i];
  }
  function useMemo(fn, deps) {
    var i = hookIndex++;
    var cell = hooks[i];
    var changed = !cell || !deps || !cell.deps || deps.length !== cell.deps.length || deps.some(function (d, j) { return !Object.is(d, cell.deps[j]); });
    if (changed) { var value = fn(); hooks[i] = { value: value, deps: deps }; return value; }
    return cell.value;
  }
  function useEffect() { /* ReportPreview n'utilise pas useEffect — no-op de sécurité */ }
  function createElement(type, props) {
    var children = Array.prototype.slice.call(arguments, 2);
    return { type: type, props: props || {}, children: children };
  }
  function renderOnce(componentFn, props) { hookIndex = 0; return componentFn(props); }
  return { React: { useState: useState, useRef: useRef, useMemo: useMemo, useEffect: useEffect, createElement: createElement, Fragment: Symbol('Fragment') }, renderOnce: renderOnce };
}

// ── Fakes DOM minimalistes (mêmes que le harness utilisé tout au long de cette session) ────────
function makeEl() {
  var el = {
    style: {}, children: [], attrs: {},
    appendChild: function (c) { this.children.push(c); return c; }, removeChild: function () {},
    setAttribute: function (k, v) { this.attrs[k] = v; }, click: function () {},
    addEventListener: function () {}, removeEventListener: function () {},
    getBoundingClientRect: function () { return { width: 0, height: 0, top: 0, left: 0 }; },
  };
  return el;
}
var fakeStorage = (function () {
  var store = {};
  return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; }, clear: function () { store = {}; } };
})();
var fakeDocument = { getElementById: function () { return makeEl(); }, createElement: function () { return makeEl(); }, body: makeEl(), addEventListener: function () {}, removeEventListener: function () {}, write: function () {}, close: function () {} };
var fakeWindow = { devicePixelRatio: 1, open: function () { return { document: { write: function () {}, close: function () {} } }; }, print: function () {}, addEventListener: function () {}, removeEventListener: function () {}, location: { href: '' } };
var fakeURL = { createObjectURL: function () { return 'blob:fake'; }, revokeObjectURL: function () {} };

function loadEngine() {
  var stub = makeReactStub();
  var wrapped = new Function(
    'localStorage', 'document', 'window', 'React', 'ReactDOM', 'URL', 'navigator',
    src + '\nreturn {computeMoteur:computeMoteur, buildFullReportHtml:buildFullReportHtml, THRESHOLDS:THRESHOLDS, ReportPreview:ReportPreview, printReport:printReport};'
  );
  var mod = wrapped(fakeStorage, fakeDocument, fakeWindow, stub.React, { createRoot: function () { return { render: function () {} }; } }, fakeURL, {});
  mod.renderOnce = stub.renderOnce;
  return mod;
}

// ── Utilitaires d'inspection de l'arbre d'éléments produit par ReportPreview(props) ────────────
function walk(node, visit) {
  if (Array.isArray(node)) { node.forEach(function (n) { walk(n, visit); }); return; }
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (Array.isArray(node.children)) node.children.forEach(function (c) { walk(c, visit); });
}
function findBySubstring(tree, text) {
  var found = null;
  walk(tree, function (node) {
    if (found) return;
    if (Array.isArray(node.children) && node.children.some(function (c) { return typeof c === 'string' && c.indexOf(text) !== -1; })) found = node;
  });
  return found;
}
function findByPlaceholder(tree, placeholder) {
  var found = null;
  walk(tree, function (node) { if (!found && node.props && node.props.placeholder === placeholder) found = node; });
  return found;
}
function findIframeSrcDoc(tree) {
  var found = null;
  walk(tree, function (node) { if (!found && node.type === 'iframe') found = node.props.srcDoc; });
  return found;
}

var passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok — ' + name); } catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.stack); } }

var POP_CMJ = 'bball2425_ncaa_m', AGE_CMJ = 26;
function withTempForceNorms(THRESHOLDS, fn) {
  THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
  THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.imtp_n; delete THRESHOLDS.slimtp_n; }
}
function withTempSlcmjNorm(THRESHOLDS, fn) {
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.slcmj_peak_power; }
}
function stabilisationDeficitData() {
  return { landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } }, landing_bi: { active: true, trials: { tts: [2.5] } } };
}
// Mobilité + Absorption critique (scénario réellement utilisé pour l'audit pré-fusion et le
// contrôle de déploiement de main — 12 tests, athlète Léo Fournier).
function mobiliteAbsorptionTd() {
  return {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5], peak_eccentric_vel: [0.1], eccentric_mean_power: [1] } },
    landing_uni: { active: true, D: { trials: { tts: [3.0] } }, G: { trials: { tts: [3.0] } } },
    iso_belt_squat: { active: true, trials: { n: [900] } },
    knee_extension: { active: true, D: { trials: { n: [80] } }, G: { trials: { n: [75] } } },
    knee_flexion: { active: true, D: { trials: { n: [40] } }, G: { trials: { n: [38] } } },
    hip_flexion: { active: true, D: { trials: { n: [60] } }, G: { trials: { n: [58] } } },
    hip_extension: { active: true, D: { trials: { n: [90] } }, G: { trials: { n: [88] } } },
    single_hop: { active: true, D: { trials: { distance: [180] } }, G: { trials: { distance: [175] } } },
    triple_hop: { active: true, D: { trials: { distance: [520] } }, G: { trials: { distance: [500] } } },
    imtp: { active: true, trials: { n: [1800], nkg: [21.2], rfd200: [3200] } },
    y_balance: { active: true, D: { trials: { composite: [95] } }, G: { trials: { composite: [92] } } },
  };
}
function makeAthlete() { return { id: 'rp', prenom: 'Léo', nom: 'Fournier', sexe: 'M', dateNaissance: '2000-03-15', sport: 'Basketball', poste: 'Ailier', taille: 190, poids: 85, normPopulation: POP_CMJ }; }
function makeBilan(td, overrides) { return { id: 'rpbilan', date: new Date().toISOString(), type: 'Performance', sousType: 'Pré-saison', testData: td, questData: {}, reportOverrides: overrides || null }; }

function noopSave() {}
function renderPreview(mod, athlete, bilan, onSave) {
  var props = { athlete: athlete, bilan: bilan, onClose: function () {}, onSave: onSave || noopSave };
  return mod.renderOnce(mod.ReportPreview, props);
}

console.log('CAS 1 — Mobilité + Absorption, même sévérité critique, aucune priorité personnalisée');
test('Aperçu (sans édition) affiche "Déficits objectivés" avec Mobilité + Absorption, jamais "Priorité principale"', function () {
  var mod = loadEngine();
  var athlete = makeAthlete();
  var bilan = makeBilan(mobiliteAbsorptionTd());
  var res = mod.computeMoteur(bilan.testData, {}, athlete.normPopulation, 26);
  assert.strictEqual(res.functionScores['Mobilité'].status, 'rouge');
  assert.strictEqual(res.functionScores['Absorption'].status, 'rouge');

  var tree = renderPreview(mod, athlete, bilan);
  var fullHtml = findIframeSrcDoc(tree);
  assert.ok(fullHtml, "l'iframe d'aperçu doit exister");
  assert.strictEqual(fullHtml.indexOf('Priorité principale') !== -1, false, 'aucune "Priorité principale" ne doit apparaître sans décision explicite du praticien');
  assert.ok(fullHtml.indexOf('Déficits objectivés') !== -1, 'le titre neutre "Déficits objectivés" doit être utilisé par défaut');
  assert.ok(/MOBILIT.*ABSORPTION|ABSORPTION.*MOBILIT/i.test(fullHtml), 'Mobilité ET Absorption doivent apparaître ensemble, à égalité');

  // Cohérence stricte avec le téléchargement direct (bouton "Rapport PDF", sans passer par l'aperçu)
  var directHtml = mod.buildFullReportHtml('sportif', athlete, bilan, res);
  assert.ok(directHtml.indexOf('Priorité principale') === -1);
  assert.ok(directHtml.indexOf('Déficits objectivés') !== -1);
});

console.log('\nCAS 2 — trois qualités de même sévérité (Force, Puissance, Stabilisation), aucune priorité personnalisée');
test('Les 3 qualités apparaissent à égalité, aucun classement 1/2/3, aucune "Priorité principale"', function () {
  var mod = loadEngine();
  withTempForceNorms(mod.THRESHOLDS, function () {
    withTempSlcmjNorm(mod.THRESHOLDS, function () {
      var td = Object.assign(
        { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } },
        { cmj: { active: true, trials: { peak_power: [1] } }, slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } } },
        stabilisationDeficitData()
      );
      var athlete = makeAthlete();
      var bilan = makeBilan(td);
      var res = mod.computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
      assert.deepStrictEqual(res.priorities.map(function (p) { return p.fonction; }).sort(), ['Force', 'Puissance', 'Stabilisation'].sort());

      var tree = renderPreview(mod, athlete, bilan);
      var fullHtml = findIframeSrcDoc(tree);
      assert.strictEqual(fullHtml.indexOf('Priorité principale') !== -1, false);
      assert.ok(fullHtml.indexOf('Déficits objectivés') !== -1);
      assert.ok(fullHtml.indexOf('FORCE') !== -1 && fullHtml.indexOf('PUISSANCE') !== -1 && fullHtml.indexOf('STABILISATION') !== -1, 'les 3 qualités doivent toutes apparaître, à égalité');
      assert.strictEqual(/[^0-9]1\s*[·.]\s*FORCE|1\.\s*Force/i.test(fullHtml), false, 'aucun classement numéroté 1/2/3 ne doit apparaître');
    });
  });
});

console.log('\nCAS 3 — une seule qualité objectivée, aucune priorité personnalisée');
test('Le titre reste "Déficits objectivés" (jamais transformé en "Priorité principale") pour une qualité unique', function () {
  var mod = loadEngine();
  withTempForceNorms(mod.THRESHOLDS, function () {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var athlete = makeAthlete();
    var bilan = makeBilan(td);
    var res = mod.computeMoteur(td, {}, 'general_m_senior', 30);
    assert.deepStrictEqual(res.priorities.map(function (p) { return p.fonction; }), ['Force']);

    var tree = renderPreview(mod, athlete, bilan);
    var fullHtml = findIframeSrcDoc(tree);
    assert.strictEqual(fullHtml.indexOf('Priorité principale') !== -1, false, 'une seule qualité déficitaire ne doit pas, à elle seule, déclencher "Priorité principale"');
    assert.ok(fullHtml.indexOf('Déficits objectivés') !== -1);
  });
});

console.log('\nCAS 4 — aucune qualité objectivée');
test('Aucune "Priorité principale" quand aucun déficit n\'est objectivé', function () {
  var mod = loadEngine();
  var athlete = makeAthlete();
  var bilan = makeBilan({});
  var res = mod.computeMoteur({}, {}, 'general_m_senior', 30);
  assert.deepStrictEqual(res.priorities, []);

  var tree = renderPreview(mod, athlete, bilan);
  var fullHtml = findIframeSrcDoc(tree);
  assert.strictEqual(fullHtml.indexOf('Priorité principale') !== -1, false);
});

console.log('\nCAS 5 — le praticien modifie réellement une priorité et l\'enregistre');
test('Une édition explicite (via les vrais handlers du composant) déclenche "Priorité principale" et se sauvegarde', function () {
  var mod = loadEngine();
  var athlete = makeAthlete();
  var bilan = makeBilan(mobiliteAbsorptionTd());
  var props = { athlete: athlete, bilan: bilan, onClose: function () {}, onSave: function (overrides) { savedOverrides = overrides; } };
  var savedOverrides = null;

  // 1er rendu : aperçu fermé, comme un praticien qui vient d'ouvrir l'écran.
  var tree = mod.renderOnce(mod.ReportPreview, props);
  var htmlBeforeEdit = findIframeSrcDoc(tree);
  assert.strictEqual(htmlBeforeEdit.indexOf('Priorité principale') !== -1, false, 'avant toute édition, le comportement neutre doit s\'appliquer');

  // Ouvre le panneau d'édition (clic réel sur "✎ Modifier le rapport", via le vrai handler).
  var editBtn = findBySubstring(tree, 'Modifier le rapport');
  assert.ok(editBtn && editBtn.props.onClick, 'le bouton "Modifier le rapport" doit exister avec son vrai handler');
  editBtn.props.onClick();
  tree = mod.renderOnce(mod.ReportPreview, props);

  // Modifie réellement la 1ère priorité (vrai onChange du champ "Fonction / titre").
  var fonctionInput = findByPlaceholder(tree, 'Fonction / titre');
  assert.ok(fonctionInput && fonctionInput.props.onChange, 'le champ de la priorité éditable doit exister');
  fonctionInput.props.onChange({ target: { value: 'Cheville (décision clinique du praticien)' } });
  tree = mod.renderOnce(mod.ReportPreview, props);

  var htmlAfterEdit = findIframeSrcDoc(tree);
  assert.ok(htmlAfterEdit.indexOf('Priorité principale') !== -1, 'après une édition réelle, "Priorité principale" doit apparaître — c\'est désormais le jugement du praticien');
  assert.ok(htmlAfterEdit.indexOf('CHEVILLE') !== -1, 'le libellé édité par le praticien doit apparaître dans le rapport');

  // Enregistre (vrai handler "Enregistrer").
  var saveBtn = findBySubstring(tree, 'Enregistrer');
  assert.ok(saveBtn && saveBtn.props.onClick);
  saveBtn.props.onClick();
  assert.ok(savedOverrides && savedOverrides.priorities != null, 'la décision explicite doit être persistée dans reportOverrides.priorities');
  assert.strictEqual(savedOverrides.priorities[0].fonction, 'Cheville (décision clinique du praticien)');

  // Ré-ouverture ultérieure (nouveau montage) : la décision sauvegardée doit être respectée.
  var bilan2 = makeBilan(mobiliteAbsorptionTd(), savedOverrides);
  var tree2 = renderPreview(mod, athlete, bilan2);
  var html2 = findIframeSrcDoc(tree2);
  assert.ok(html2.indexOf('Priorité principale') !== -1, 'une décision déjà enregistrée doit être respectée dès la ré-ouverture, sans nouvelle édition');
});

console.log('\nCAS 6 — ouvrir l\'aperçu puis télécharger directement, sans aucune modification');
test('Le PDF obtenu depuis l\'aperçu (sans édition) est cohérent avec le téléchargement direct', function () {
  var mod = loadEngine();
  var athlete = makeAthlete();
  var bilan = makeBilan(mobiliteAbsorptionTd());
  var res = mod.computeMoteur(bilan.testData, {}, athlete.normPopulation, 26);

  var tree = renderPreview(mod, athlete, bilan);
  var htmlFromPreviewDownload = findIframeSrcDoc(tree); // == fullHtml utilisé par le vrai handleDownload
  var htmlFromDirectDownload = mod.buildFullReportHtml('sportif', athlete, bilan, res); // == printReport('sportif', ...)

  assert.strictEqual(htmlFromPreviewDownload, htmlFromDirectDownload, 'les deux chemins doivent produire un HTML strictement identique quand rien n\'a été explicitement enregistré');
});

console.log('\nNon-régression — le fix ne touche à aucune sortie clinique');
test('functionScores / clinicalSynthesis / priorities / HYP_QUALITY_RELATIONS restent strictement inchangés autour du rendu de l\'aperçu', function () {
  var mod = loadEngine();
  var athlete = makeAthlete();
  var bilan = makeBilan(mobiliteAbsorptionTd());
  var res1 = mod.computeMoteur(bilan.testData, {}, athlete.normPopulation, 26);
  renderPreview(mod, athlete, bilan); // ouvrir l'aperçu ne doit rien modifier
  var res2 = mod.computeMoteur(bilan.testData, {}, athlete.normPopulation, 26);
  assert.strictEqual(JSON.stringify(res1.functionScores), JSON.stringify(res2.functionScores));
  assert.strictEqual(JSON.stringify(res1.clinicalSynthesis), JSON.stringify(res2.clinicalSynthesis));
  assert.strictEqual(JSON.stringify(res1.priorities), JSON.stringify(res2.priorities));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);

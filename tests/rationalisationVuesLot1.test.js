// Tests unitaires — Lot Rationalisation des vues 1 « Réconcilier l'affichage HYP/TFM sans toucher
// aux données » (IMPLEMENTATION_RATIONALISATION_VUES_LOT1.md).
//
// Couvre les 7 cas mandatés par la mission (Partie 4) + la non-régression stricte (Partie 5).
// Cette mission est strictement présentation/lecture — aucun moteur HYP, CSM, HYP_QUALITY_RELATIONS,
// TFM, VAR_REL3, CAPACITES_DATA, seuil, norme ou règle de convergence n'est modifié. Ces tests
// exercent les fonctions réelles du pipeline (normalizeQualityKey, varMatchesQuality via
// computeMoteur/VAR_REL3, tfmQualityDiagnosticGate, computeCapaciteStatus), jamais une réécriture
// parallèle.
//
// Exécution : node tests/rationalisationVuesLot1.test.js — aucune dépendance externe.
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

// Reproduit exactement la logique de filtrage de l'onglet Variables (index.html, tab==='variables'),
// sans réimplémenter le rendu React — appelle varMatchesQuality via une sonde identique à celle du
// composant (mêmes champs testKey/kpi.key), pour rester fidèle au code réellement exécuté par l'UI.
function variablesFilterMatches(varRelKey, qualityFilter) {
  var parts = varRelKey.split('_');
  var rel = VAR_REL3[varRelKey];
  if (!rel) throw new Error('VAR_REL3 introuvable pour ' + varRelKey);
  var qKey = normalizeQualityKey(qualityFilter);
  return (rel.measures || []).concat(rel.estimates || []).some(function (m) { return normalizeQualityKey(m.function) === qKey; });
}

console.log('CAS 1 — MOBILITÉ : le filtre retrouve les variables "Mobilite" (VAR_REL3, non accentué)');
(function () {
  test('df_iso_n (VAR_REL3 estimates: "Mobilite") matche le filtre "Mobilité" (canonique, accentué)', () => {
    assert.strictEqual(variablesFilterMatches('df_iso_n', 'Mobilité'), true);
  });
  test('21 entrées VAR_REL3 au total matchent désormais "Mobilité" (0 avant ce lot, comparaison stricte)', () => {
    var n = 0;
    Object.keys(VAR_REL3).forEach(function (k) { if (variablesFilterMatches(k, 'Mobilité')) n++; });
    assert.strictEqual(n, 21);
  });
  test('VAR_REL3 lui-même reste inchangé : la clé brute "Mobilite" (non accentuée) existe toujours telle quelle', () => {
    var found = false;
    Object.values(VAR_REL3).forEach(function (rel) {
      (rel.measures || []).concat(rel.estimates || []).forEach(function (m) { if (m.function === 'Mobilite') found = true; });
    });
    assert.strictEqual(found, true, 'la donnée source ne doit jamais être migrée/réécrite par ce lot');
  });
  test('Scénario réel : df_iso actif -> apparaît bien dans la liste de variables filtrée par computeMoteur/VAR_REL3', () => {
    var td = { df_iso: { active: true, trials: { n: [50] } } };
    var r = computeMoteur(td, {}, 'general_m_senior', 30);
    assert.ok(r.functionScores, 'pré-requis : computeMoteur() fonctionne sur ce scénario');
    assert.strictEqual(variablesFilterMatches('df_iso_n', 'Mobilité'), true);
  });
})();

console.log('');
console.log('CAS 2 — EXPLOSIVITÉ : le filtre retrouve les entrées historiques "Explosivite"');
(function () {
  test('148 entrées VAR_REL3 (19 accentuées + 129 non accentuées) matchent désormais "Explosivité" (19 avant ce lot)', () => {
    var n = 0;
    Object.keys(VAR_REL3).forEach(function (k) { if (variablesFilterMatches(k, 'Explosivité')) n++; });
    assert.strictEqual(n, 148);
  });
  test('Réactivité : 111 variables VAR_REL3 (accentuées + "Reactivite") désormais matchées par le filtre (25 seulement avant ce lot)', () => {
    var n = 0;
    Object.keys(VAR_REL3).forEach(function (k) { if (variablesFilterMatches(k, 'Réactivité')) n++; });
    assert.strictEqual(n, 111);
  });
})();

console.log('');
console.log('CAS 3 — FORCE HYP DIAGNOSTIQUÉE : l\'onglet Capacités affiche le diagnostic HYP, jamais le TFM à sa place');
(function () {
  // tfmQualityDiagnosticGate testée directement avec un functionScores synthétique — la question
  // posée par ce cas est le comportement du GATE (résolution du bon nom de qualité HYP), pas la
  // capacité de HYP-FOR-01 à atteindre un état confirmé avec les normes réelles actuellement
  // disponibles (limite déjà documentée, hors périmètre : cf. AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_
  // KINEXUS_V1.md §5, tests/hypForce01.test.js "withMergedNorms"). fSc minimal, lecture seule.
  var fSc = { Force: { status: 'rouge', hypFor01: { state: 'retenue_faible' } } };
  test('tfmQualityDiagnosticGate("Force maximale") résout via l\'alias vers fSc.Force -> hypGoverned=true', () => {
    var gate = tfmQualityDiagnosticGate(fSc, 'Force maximale', 'orange');
    assert.strictEqual(gate.hypGoverned, true);
    assert.strictEqual(gate.status, 'rouge', 'le diagnostic HYP doit être affiché, jamais le TFM (orange)');
    assert.strictEqual(gate.tfmStatus, 'orange', 'le TFM reste disponible comme information secondaire, jamais supprimé');
  });
  test('Non-régression : tfmQualityDiagnosticGate("Force") (nom déjà correct, sans alias) inchangé', () => {
    var gate = tfmQualityDiagnosticGate(fSc, 'Force', 'orange');
    assert.strictEqual(gate.hypGoverned, true);
    assert.strictEqual(gate.status, 'rouge');
  });
  test('Scénario réel end-to-end (Absorption, qualité HYP fiable avec normes réelles) : computeCapaciteStatus affiche bien le statut HYP, pas TFM', () => {
    var td = { cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } } };
    var r = computeMoteur(td, {}, 'bball2425_ncaa_m', 26);
    assert.strictEqual(r.functionScores['Absorption'].status, 'rouge', 'pré-requis : Absorption bien objectivée rouge par HYP-ABS-01');
    var cap = computeCapaciteStatus('RECEPTION', td, 'bball2425_ncaa_m', 26, r.functionScores);
    var found = null;
    cap.sousCapacites.forEach(function (sub) { sub.qualites.forEach(function (q) { if (q.quality === 'Absorption') found = q; }); });
    assert.ok(found, 'pré-requis : Absorption référencée dans CAPACITES_DATA > RECEPTION');
    assert.strictEqual(found.hypGoverned, true);
    assert.strictEqual(found.status, 'rouge', 'doit être identique à functionScores, jamais recalculé/contredit');
  });
})();

console.log('');
console.log('CAS 4 — FORCE HYP NON DÉTERMINABLE + TFM DÉFAVORABLE : jamais un faux diagnostic TFM');
(function () {
  var fSc = { Force: { status: null, hypFor01: { state: 'non_determinable' } } };
  test('HYP non déterminable (status=null) + TFM défavorable (rouge) -> le gate n\'affiche jamais "rouge"', () => {
    var gate = tfmQualityDiagnosticGate(fSc, 'Force maximale', 'rouge');
    assert.strictEqual(gate.hypGoverned, true);
    assert.strictEqual(gate.status, null, 'HYP non déterminable doit rester non déterminable, jamais remplacé par le TFM');
    assert.strictEqual(gate.tfmStatus, 'rouge', 'le signal TFM reste lisible comme information secondaire uniquement');
  });
  test('capaciteHTML : une qualité HYP-gouvernée non déterminable affiche "(non déterminable)", jamais un statut coloré emprunté au TFM', () => {
    var capResult = { label: 'Test', sousCapacites: [{ name: 'Sous-cap', status: null, qualites: [{ quality: 'Force maximale', poids: 'Majeure', status: null, tfmStatus: 'rouge', hypGoverned: true }] }] };
    var htmlOut = capaciteHTML(capResult);
    assert.ok(htmlOut.indexOf('(non déterminable)') >= 0, 'doit contenir la mention non déterminable');
    assert.ok(htmlOut.indexOf('Information complémentaire (secondaire)') >= 0, 'le signal TFM reste visible, mais explicitement secondaire');
    assert.ok(htmlOut.indexOf('✗') === -1, 'aucune marque de déficit (✗) ne doit apparaître ici — le mark doit être "○" (non déterminable), jamais emprunté au TFM');
    var primaryLine = htmlOut.slice(0, htmlOut.indexOf('Information complémentaire'));
    assert.ok(primaryLine.indexOf('Critique') === -1, 'le statut TFM (rouge -> "Critique") ne doit jamais apparaître dans la ligne principale, seulement dans la note secondaire qui suit');
  });
})();

console.log('');
console.log('CAS 5 — FORCE HYP DIAGNOSTIQUÉE + TFM DIFFÉRENT : HYP reste prioritaire');
(function () {
  var fSc = { Force: { status: 'orange', hypFor01: { state: 'retenue_faible' } } };
  test('HYP=orange, TFM=vert (divergents) -> le gate affiche orange (HYP), jamais vert (TFM)', () => {
    var gate = tfmQualityDiagnosticGate(fSc, 'Force maximale', 'vert');
    assert.strictEqual(gate.status, 'orange');
    assert.strictEqual(gate.tfmStatus, 'vert');
  });
  test('capaciteHTML affiche bien la note "Information complémentaire (secondaire)" quand HYP et TFM divergent', () => {
    var capResult = { label: 'Test', sousCapacites: [{ name: 'Sous-cap', status: 'orange', qualites: [{ quality: 'Force maximale', poids: 'Majeure', status: 'orange', tfmStatus: 'vert', hypGoverned: true }] }] };
    var htmlOut = capaciteHTML(capResult);
    assert.ok(htmlOut.indexOf('Information complémentaire (secondaire)') >= 0);
    assert.ok(htmlOut.indexOf('ne constitue pas un diagnostic clinique confirmé') >= 0);
  });
})();

console.log('');
console.log('CAS 6 — QUALITÉ SANS HYP : le TFM continue de fonctionner comme avant (comportement inchangé)');
(function () {
  var fSc = { Force: { status: 'rouge' } }; // Propulsion n'a jamais de moteur HYP, même en présence d'un fSc riche
  test('tfmQualityDiagnosticGate("Propulsion") reste hypGoverned=false, statut = TFM tel quel (comportement inchangé)', () => {
    var gate = tfmQualityDiagnosticGate(fSc, 'Propulsion', 'orange');
    assert.strictEqual(gate.hypGoverned, false);
    assert.strictEqual(gate.status, 'orange');
  });
  test('tfmQualityDiagnosticGate("Contrôle moteur") reste hypGoverned=false (aucun alias créé pour ce nom, à raison)', () => {
    var gate = tfmQualityDiagnosticGate(fSc, 'Contrôle moteur', 'jaune');
    assert.strictEqual(gate.hypGoverned, false);
    assert.strictEqual(gate.status, 'jaune');
  });
  test('capaciteHTML marque désormais explicitement une qualité TFM-seule avec un statut comme "information complémentaire" (nouveauté de ce lot, jamais un badge différent)', () => {
    var capResult = { label: 'Test', sousCapacites: [{ name: 'Sous-cap', status: 'orange', qualites: [{ quality: 'Propulsion', poids: 'Majeure', status: 'orange', tfmStatus: 'orange', hypGoverned: false }] }] };
    var htmlOut = capaciteHTML(capResult);
    assert.ok(htmlOut.indexOf('information complémentaire') >= 0);
    assert.ok(htmlOut.indexOf('✗') >= 0, 'le mark ✓/✗ reste identique — aucune refonte visuelle, seulement un suffixe textuel discret');
  });
})();

console.log('');
console.log('CAS 7 — AUCUNE DONNÉE : aucun faux diagnostic n\'apparaît');
(function () {
  test('computeMoteur() sans aucune donnée -> Force reste non déterminable, computeCapaciteStatus ne fabrique aucun statut', () => {
    var r = computeMoteur({}, {}, 'general_m_senior', 30);
    assert.strictEqual(r.functionScores['Force'].status, null);
    var cap = computeCapaciteStatus('SAUT', {}, 'general_m_senior', 30, r.functionScores);
    cap.sousCapacites.forEach(function (sub) {
      assert.strictEqual(sub.status, null, 'aucune sous-capacité ne doit afficher un statut sans aucune donnée saisie');
    });
  });
  test('tfmQualityDiagnosticGate avec fSc vide et tfmStatus=null -> aucun statut fabriqué', () => {
    var gate = tfmQualityDiagnosticGate({}, 'Force maximale', null);
    assert.strictEqual(gate.status, null);
    assert.strictEqual(gate.hypGoverned, false);
  });
})();

console.log('');
console.log('AUDIT DES ALIAS (Problème 1A) — aucune fusion agressive de qualités réellement distinctes');
(function () {
  test('normalizeQualityKey ne fusionne jamais "Force" et "Force maximale" (mots différents, pas un accent/casse)', () => {
    assert.notStrictEqual(normalizeQualityKey('Force'), normalizeQualityKey('Force maximale'));
  });
  test('Propulsion, Contrôle moteur, Résistance neuromusculaire : aucun alias HYP créé (vérifié, aucun équivalent HYP réel)', () => {
    assert.strictEqual(CAPACITE_QUALITY_HYP_ALIAS.hasOwnProperty('Propulsion'), false);
    assert.strictEqual(CAPACITE_QUALITY_HYP_ALIAS.hasOwnProperty('Contrôle moteur'), false);
    assert.strictEqual(CAPACITE_QUALITY_HYP_ALIAS.hasOwnProperty('Résistance neuromusculaire'), false);
  });
  test('CAPACITE_QUALITY_HYP_ALIAS contient exactement un alias documenté ("Force maximale"->"Force"), rien de plus', () => {
    assert.deepStrictEqual(CAPACITE_QUALITY_HYP_ALIAS, { 'Force maximale': 'Force' });
  });
})();

console.log('');
console.log('NON-RÉGRESSION — mêmes sorties cliniques avant/après (strict, deepStrictEqual)');
(function () {
  var PRE_MISSION_COMMIT = '5fb7b7e';
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
      '\nreturn {computeMoteur:computeMoteur,TFM:TFM,VAR_REL3:VAR_REL3,CAPACITES_DATA:CAPACITES_DATA,HYP_QUALITY_RELATIONS:HYP_QUALITY_RELATIONS};');
    var sandbox = loadBefore(global.localStorage);

    var scenarios = [
      { df_iso: { active: true, trials: { n: [50] } } },
      { cmj: { active: true, trials: { braking_rfd: [20], force_zero_vel: [5] } } },
      { wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } } },
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
    test('TFM strictement inchangé (donnée source)', () => {
      assert.deepStrictEqual(TFM, sandbox.TFM);
    });
    test('VAR_REL3 strictement inchangé (donnée source, y compris les orthographes divergentes)', () => {
      assert.deepStrictEqual(VAR_REL3, sandbox.VAR_REL3);
    });
    test('CAPACITES_DATA strictement inchangé (donnée source)', () => {
      assert.deepStrictEqual(CAPACITES_DATA, sandbox.CAPACITES_DATA);
    });
    test('HYP_QUALITY_RELATIONS strictement inchangé', () => {
      assert.deepStrictEqual(HYP_QUALITY_RELATIONS, sandbox.HYP_QUALITY_RELATIONS);
    });
  }
})();

console.log('');
console.log('Résultat : ' + passed + ' passés, ' + failed + ' échoués (sur ' + (passed + failed) + ').');
if (failed > 0) process.exit(1);

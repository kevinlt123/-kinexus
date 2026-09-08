// MISSION — BRANCHEMENT CLINIQUE DE L'ASYMÉTRIE WBLT
//
// Branche wbltAsymmetryBand(diffCm) (référentiel WBLT_ASYM_BANDS_CM, mission précédente) dans la
// couche de PRÉSENTATION des rapports (buildSportifReport, buildExpertReport) via 2 nouvelles
// fonctions PURES ET ADDITIVES, jamais un recalcul indépendant de la mesure :
//   - computeWbltAsymmetryPresentation(fSc) : donnée structurée {label,disponible,rawD,rawG,
//     valeur,unite,statut,source,referentiel} — lit EXCLUSIVEMENT fSc['Mobilité'].hypMob01.
//     diagnostic.wblt_distance.rawD/rawG (déjà résolus par computeHypMobilityWblt, jamais
//     recalculés depuis testData).
//   - wbltAsymmetryPanelInnerHtml(fSc) : rendu HTML partagé par les 2 rapports, jamais fusionné
//     avec l'affichage du statut Mobilité (fSc['Mobilité'].status / hypMob01.status), qui continue
//     d'être affiché ailleurs exactement comme avant cette mission.
//
// AUCUN moteur verrouillé modifié : computeHypMobilityWblt, computeHypMobility01, les 8
// computeHypXxx01, computeAsymEngine, computeAsymPhase restent BYTE-IDENTIQUES (GUARDs ci-dessous).
// AUCUNE nouvelle norme : NORMS/THRESHOLDS/NORMS_V2 STRICTEMENT inchangés (deep-equal).
//
// Exécution : node tests/mission_branchement_clinique_wblt_tests.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser le code applicatif dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}

console.log('MISSION — Branchement clinique de l\'asymétrie WBLT');

var POP = 'general_m_senior', AGE = 26;
function wbltTestData(D, G) {
  var wblt = { active: true, D: {}, G: {} };
  if (D != null) wblt.D = { trials: { distance: [D] } };
  if (G != null) wblt.G = { trials: { distance: [G] } };
  return { wblt: wblt };
}
function fScFor(D, G) {
  var td = wbltTestData(D, G);
  var res = computeMoteur(td, {}, POP, AGE);
  return { fSc: res.functionScores, res: res, td: td };
}

// ═══════════════ AUDIT — chemin de branchement (fait, jamais supposé) ════════════════════════════
test('AUDIT — fSc[\'Mobilité\'].hypMob01.diagnostic.wblt_distance expose bien rawD/rawG déjà résolus (le chemin réellement consommé)', () => {
  const { fSc } = fScFor(20, 24);
  const wblt = fSc['Mobilité'].hypMob01.diagnostic.wblt_distance;
  assert.strictEqual(wblt.rawD, 20);
  assert.strictEqual(wblt.rawG, 24);
});
test('AUDIT — computeWbltAsymmetryPresentation/wbltAsymmetryPanelInnerHtml n\'apparaissent dans le code source d\'aucun des 8 HYP ni de computeAsymEngine/computeAsymPhase/computeHypMobilityWblt', () => {
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    let depth = 0, i = src.indexOf('{', idx), bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
  }
  ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeAsymEngine', 'computeAsymPhase', 'computeHypMobilityWblt'].forEach((fn) => {
    const body = extractFnBody(code, fn);
    assert.ok(body.indexOf('computeWbltAsymmetryPresentation') === -1 && body.indexOf('wbltAsymmetryPanelInnerHtml') === -1, fn + ' ne doit jamais appeler la nouvelle couche de présentation');
  });
});

// ═══════════════ PARTIE A — Les 6 cas de bornes exigés par la mission ═══════════════════════════
[
  { D: 24, G: 22.51, diff: 1.49, statut: 'vert' },
  { D: 24, G: 22.5, diff: 1.5, statut: 'jaune' },
  { D: 24, G: 21.01, diff: 2.99, statut: 'jaune' },
  { D: 24, G: 21, diff: 3, statut: 'orange' },
  { D: 24, G: 19, diff: 5, statut: 'orange' },
  { D: 24, G: 18.99, diff: 5.01, statut: 'rouge' },
].forEach(({ D, G, diff, statut }) => {
  test('D=' + D + ' / G=' + G + ' -> diff=' + diff + ' -> statut "' + statut + '"', () => {
    const { fSc } = fScFor(D, G);
    const info = computeWbltAsymmetryPresentation(fSc);
    assert.strictEqual(info.disponible, true);
    assert.strictEqual(info.valeur, diff);
    assert.strictEqual(info.statut, statut);
    assert.strictEqual(info.unite, 'cm');
    assert.strictEqual(info.source, 'WBLT');
    assert.strictEqual(info.referentiel, 'WBLT_ASYM_BANDS_CM');
  });
});

// ═══════════════ PARTIE B — Données manquantes : jamais une couleur inventée ═════════════════════
test('D absent -> disponible=false, valeur=null, statut="non_determinable" (jamais vert)', () => {
  const { fSc } = fScFor(null, 24);
  const info = computeWbltAsymmetryPresentation(fSc);
  assert.strictEqual(info.disponible, false);
  assert.strictEqual(info.valeur, null);
  assert.strictEqual(info.statut, 'non_determinable');
  assert.strictEqual(info.rawG, 24);
  assert.strictEqual(info.rawD, null);
});
test('G absent -> disponible=false, valeur=null, statut="non_determinable" (jamais vert)', () => {
  const { fSc } = fScFor(20, null);
  const info = computeWbltAsymmetryPresentation(fSc);
  assert.strictEqual(info.disponible, false);
  assert.strictEqual(info.valeur, null);
  assert.strictEqual(info.statut, 'non_determinable');
  assert.strictEqual(info.rawD, 20);
  assert.strictEqual(info.rawG, null);
});
test('Les deux côtés absents (WBLT actif mais aucun essai) -> disponible=false, statut="non_determinable"', () => {
  const { fSc } = fScFor(null, null);
  const info = computeWbltAsymmetryPresentation(fSc);
  assert.strictEqual(info.disponible, false);
  assert.strictEqual(info.valeur, null);
  assert.strictEqual(info.statut, 'non_determinable');
});
test('WBLT jamais testé du tout (test inactif) -> rawD/rawG null, panneau HTML absent (jamais un panneau vide inventé)', () => {
  const res = computeMoteur({}, {}, POP, AGE);
  const info = computeWbltAsymmetryPresentation(res.functionScores);
  assert.strictEqual(info.disponible, false);
  assert.strictEqual(info.statut, 'non_determinable');
  assert.strictEqual(wbltAsymmetryPanelInnerHtml(res.functionScores), null, 'sans aucune donnée WBLT, aucun panneau ne doit être rendu (ni vide, ni "non déterminable" sans raison)');
});
test('Données identiques (D=G=20cm) -> diff=0cm -> "vert" (jamais une exception pour l\'égalité)', () => {
  const { fSc } = fScFor(20, 20);
  const info = computeWbltAsymmetryPresentation(fSc);
  assert.strictEqual(info.disponible, true);
  assert.strictEqual(info.valeur, 0);
  assert.strictEqual(info.statut, 'vert');
});

// ═══════════════ PARTIE C — HYP-MOB-01 conserve exactement son comportement antérieur ════════════
// Pour chacun des cas ci-dessus (bornes + données manquantes), le statut/diagnostic HYP-MOB-01 doit
// être IDENTIQUE, que la nouvelle couche de présentation soit consultée ou non — jamais un effet de
// bord de computeWbltAsymmetryPresentation sur fSc ou sur un nouvel appel de computeHypMobility01.
[
  [24, 22.51], [24, 22.5], [24, 21.01], [24, 21], [24, 19], [24, 18.99],
  [null, 24], [20, null], [null, null], [20, 20],
].forEach(([D, G]) => {
  test('HYP-MOB-01 identique avec/sans lecture de la présentation WBLT (D=' + D + ', G=' + G + ')', () => {
    const td = wbltTestData(D, G);
    const before = computeHypMobility01(td, POP, AGE);
    computeWbltAsymmetryPresentation({ Mobilité: { hypMob01: before } }); // lecture, jamais un recalcul
    const after = computeHypMobility01(td, POP, AGE);
    assert.deepStrictEqual(before, after, 'computeHypMobility01 doit être un calcul pur, jamais affecté par la couche de présentation');
  });
});
test('Exemple illustratif de la mission (D=20, G=24) : WBLT asymmetry et statut Mobility restent 2 informations distinctes, jamais fusionnées', () => {
  const { fSc } = fScFor(20, 24);
  const wbltInfo = computeWbltAsymmetryPresentation(fSc);
  assert.strictEqual(wbltInfo.valeur, 4);
  assert.strictEqual(wbltInfo.statut, 'orange');
  // Avec ces valeurs absolues précises (THRESHOLDS wblt_distance, dir:max), les 2 côtés D et G
  // restent au-dessus du seuil 'vert' -> HYP-MOB-01 = 'vert'/'absente' (pas 'deficitaire') : les
  // valeurs numériques exactes de l'exemple illustratif de la mission ne changent rien au principe
  // vérifié ici (2 signaux indépendants, jamais mélangés) — vérifié empiriquement, jamais supposé.
  assert.strictEqual(fSc['Mobilité'].status, 'vert');
  assert.strictEqual(fSc['Mobilité'].hypMob01.state, 'absente');
  assert.notStrictEqual(wbltInfo.statut, fSc['Mobilité'].status, 'les 2 statuts (WBLT orange vs Mobility vert) divergent bel et bien ici — la preuve qu\'ils ne sont jamais dérivés l\'un de l\'autre');
});

// ═══════════════ PARTIE D — Branchement réel dans les 2 rapports ═════════════════════════════════
test('buildSportifReport affiche le panneau "WBLT — Asymétrie" séparément du statut Mobilité, avec les bonnes valeurs', () => {
  const athlete = { id: 1, prenom: 'Jean', nom: 'Dupont', sport: 'Basketball', dateNaissance: '2000-01-01', normPopulation: POP };
  const { fSc, res, td } = fScFor(20, 24);
  const bilan = { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: td, questData: {} };
  const out = buildSportifReport(athlete, bilan, res);
  const idx = out.indexOf('WBLT — Asymétrie');
  assert.ok(idx >= 0, 'le panneau WBLT doit apparaître dans le rapport sportif');
  const seg = out.slice(idx, idx + 600);
  assert.ok(seg.indexOf('24 cm G') >= 0 && seg.indexOf('20 cm D') >= 0);
  assert.ok(seg.indexOf('Asymétrie : 4 cm') >= 0);
  assert.ok(seg.indexOf('ORANGE') >= 0);
});
test('buildExpertReport affiche le panneau "WBLT — Asymétrie" séparément du statut Mobilité (table "Fonctions évaluées")', () => {
  const athlete = { id: 1, prenom: 'Jean', nom: 'Dupont', sport: 'Basketball', dateNaissance: '2000-01-01', normPopulation: POP };
  const { fSc, res, td } = fScFor(20, 24);
  const bilan = { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: td, questData: {} };
  const out = buildExpertReport(athlete, bilan, res);
  const idxWblt = out.indexOf('WBLT — Asymétrie');
  const idxTable = out.indexOf('Fonctions évaluées');
  assert.ok(idxWblt >= 0 && idxTable >= 0);
  assert.ok(idxWblt < idxTable, 'le panneau WBLT doit être distinct de la table "Fonctions évaluées" qui porte le statut Mobility');
  assert.ok(out.slice(idxWblt, idxWblt + 600).indexOf('ORANGE') >= 0);
});
test('Sans donnée WBLT du tout, aucun panneau "WBLT — Asymétrie" n\'apparaît dans aucun des 2 rapports (jamais un panneau inventé)', () => {
  const athlete = { id: 1, prenom: 'Jean', nom: 'Dupont', sport: 'Basketball', dateNaissance: '2000-01-01', normPopulation: POP };
  const res = computeMoteur({}, {}, POP, AGE);
  const bilan = { id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Test', testData: {}, questData: {} };
  assert.ok(buildSportifReport(athlete, bilan, res).indexOf('WBLT — Asymétrie') === -1);
  assert.ok(buildExpertReport(athlete, bilan, res).indexOf('WBLT — Asymétrie') === -1);
});

// ═══════════════ PARTIE E — Guards : aucun moteur verrouillé modifié, aucune nouvelle norme ══════
const BASELINE_COMMIT = 'HEAD'; // dernier commit avant les missions WBLT (working tree = leurs seuls diffs)
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

function extractFnBody(src, fnName) {
  const marker = 'function ' + fnName + '(';
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(fnName + ' introuvable');
  let depth = 0, i = src.indexOf('{', idx), bodyStart = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
  }
  throw new Error('accolade non fermée pour ' + fnName);
}

test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES', () => {
  const hypFns = ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01'];
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — computeHypMobilityWblt reste BYTE-IDENTIQUE (sa formule de wbltDiffCm et sa décision normal/deficient à 1.5cm ne sont ni recalculées ni remplacées)', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypMobilityWblt'), extractFnBody(baseCode, 'computeHypMobilityWblt'));
});
test('GUARD 3 — computeAsymEngine et computeAsymPhase restent BYTE-IDENTIQUES', () => {
  assert.strictEqual(extractFnBody(code, 'computeAsymEngine'), extractFnBody(baseCode, 'computeAsymEngine'));
  assert.strictEqual(extractFnBody(code, 'computeAsymPhase'), extractFnBody(baseCode, 'computeAsymPhase'));
});
test('GUARD 4 — QUALITY_DIAGNOSTIC_VARIABLES_V1 et CSM_V2_CLINICAL_VARIABLE_MATRIX inchangés (deep-equal)', () => {
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 5 — NORMS/THRESHOLDS/NORMS_V2 STRICTEMENT inchangés (deep-equal) — aucune nouvelle norme créée pour ce branchement', () => {
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
});
// GUARD 6 : BASELINE_COMMIT='HEAD' (bbf7390) prédate aussi la mission précédente (référentiel WBLT,
// encore non commitée) — wbltAsymmetryBand n'existe donc pas dans baseCode. On vérifie ici
// directement, sans dépendre du commit HEAD, que la RÈGLE elle-même (bornes 1.5/3/5) n'a pas été
// altérée par CETTE mission : comportement identique à celui déjà verrouillé et testé de façon
// exhaustive dans tests/mission_normes_asymetrie_wblt_tests.js (mission précédente).
test('GUARD 6 — wbltAsymmetryBand/WBLT_ASYM_BANDS_CM n\'ont pas été redéfinis par cette mission (mêmes bornes que la mission précédente)', () => {
  assert.deepStrictEqual(WBLT_ASYM_BANDS_CM, { vert: { max: 1.5, inclusive: false }, jaune: { max: 3, inclusive: false }, orange: { max: 5, inclusive: true }, rouge: { max: Infinity, inclusive: true } });
  assert.strictEqual(wbltAsymmetryBand(1.49), 'vert');
  assert.strictEqual(wbltAsymmetryBand(5.01), 'rouge');
});
// GUARD 7 : computeMouvementAnalysis est volontairement EXCLU de cette comparaison contre HEAD — une
// mission ULTÉRIEURE DISTINCTE et déjà validée (MISSION_RESTAURATION_NORMES_ASYMETRIE, 5e argument
// asymPop) l'a légitimement modifiée avant celle-ci ; son propre fichier de garde dédié
// (tests/mission_restauration_normes_asymetrie_tests.js, GUARD 8) couvre déjà précisément cette
// fonction. Cette mission-ci ne la touche pas davantage (aucune ligne supplémentaire).
test('GUARD 7 — le diff fonctionnel de cette mission se limite à computeWbltAsymmetryPresentation/wbltAsymmetryPanelInnerHtml + leurs 2 points d\'appel (buildSportifReport, buildExpertReport) — jamais computeMoteur/computeCsmV2/computeHypMobility01/computeHypMobilityWblt/computeAsymEngine/computeAsymPhase', () => {
  assert.strictEqual(typeof computeWbltAsymmetryPresentation, 'function');
  assert.strictEqual(typeof wbltAsymmetryPanelInnerHtml, 'function');
  assert.strictEqual(baseCode.indexOf('function computeWbltAsymmetryPresentation('), -1, 'ne doit pas déjà exister avant cette mission');
  ['computeMoteur', 'computeCsmV2', 'computeHypMobility01', 'computeHypMobilityWblt', 'computeAsymEngine', 'computeAsymPhase'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' n\'aurait jamais dû changer');
  });
});

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

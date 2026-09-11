// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 8 : Vue Tests interactive (couche DATA/EVIDENCE)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : TestsView + TestResultCard/TestsFamilyFilter/TestsOverviewHeader/TestResultDetail/
// testResultCardState/testKpiUnit. Délègue à ResultsBrowser (déjà existant, étendu de façon
// additive avec initialSel) pour le détail par variable — aucune deuxième implémentation. Couche
// de présentation uniquement — computeMoteur/HYP/CSM V2/NORMS/THRESHOLDS/LSI/asymétries/relations/
// mappings ForceDecks/TestDetailPage (saisie) ne sont pas modifiés (vérifié par guards ci-dessous +
// snapshot clinique avant/après, voir rapport de phase).
//
// BASELINE_COMMIT : 37bfcb4 (Phase 7), strictement avant cette phase.

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.message); }
}

const REPO = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');

const BASELINE_COMMIT = '37bfcb4';
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');

function extractFnBody(src, fnName) {
  const marker = 'function ' + fnName + '(';
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(fnName + ' introuvable');
  let depth = 0, i = src.indexOf('{', idx);
  const bodyStart = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
  }
  throw new Error('accolade non fermée pour ' + fnName);
}

const sandboxSrc = code.slice(code.indexOf('var C={'), code.indexOf("ReactDOM.createRoot(document.getElementById('root'))"));
const baseSandboxSrc = baseCode.slice(baseCode.indexOf('var C={'), baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))"));
const sandbox = new Function('localStorage', sandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,TESTS:TESTS,TBK:TBK,SYSTEM_TESTS:SYSTEM_TESTS,TEST_FAMILIES:TEST_FAMILIES};")({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,TESTS:TESTS,TBK:TBK,SYSTEM_TESTS:SYSTEM_TESTS};")({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 8 : Vue Tests interactive');

// ── 1. Route Tests : vraie vue, plus un alias de l'onglet Expert > Résultats ──────────────────────
test("1 — TestsView est définie et App() en fait la cible de la barre secondaire \"Tests\" (plus un alias de view:'expert',tab:'kpi')", () => {
  assert.ok(code.includes('function TestsView(props){'), 'TestsView introuvable.');
  const appBody = extractFnBody(code, 'App');
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable.');
  assert.ok(/\{key:'tests',label:'Tests',target:\{screen:'analyse',view:'tests'\}\}/.test(m[1]), 'La destination "Tests" doit cibler view:\'tests\' (TestsView).');
});

test("2 — AnalyseView route view==='tests' vers TestsView, sans nouvelle route App(), et masque les blocs 01-06 pour cette vue", () => {
  const body = extractFnBody(code, 'AnalyseView');
  assert.ok(/view==='tests'&&h\(TestsView,/.test(body), 'AnalyseView doit rendre TestsView pour view===\'tests\'.');
  assert.ok(body.indexOf("view!=='tests'") >= 0, 'Les blocs 01-06 doivent être masqués pour view===\'tests\'.');
});

// ── 2. Familles de tests : taxonomie existante réutilisée, jamais inventée ────────────────────────
test('3 — TEST_FAMILIES est une constante globale (hissée depuis buildSportifReport, référentiel PDF déjà existant), réutilisée à l\'identique par TestsFamilyFilter, jamais une nouvelle taxonomie', () => {
  assert.ok(code.includes('var TEST_FAMILIES=['), 'TEST_FAMILIES doit être globale.');
  assert.deepStrictEqual(sandbox.TEST_FAMILIES, [
    { label: 'Force', icon: '🏋️', cats: ['Force Globale', 'Force Segmentaire'] },
    { label: 'Puissance', icon: '⚡', cats: ['Force-Vitesse', 'Sauts', 'Landing'] },
    { label: 'Fonction', icon: '🎯', cats: ['Tests Fonctionnels', 'Mobilité', 'Sensoriel'] }
  ], 'TEST_FAMILIES doit reprendre exactement les 3 familles/8 catégories déjà utilisées par le rapport PDF.');
  const reportBody = extractFnBody(code, 'buildSportifReport');
  assert.ok(!/var TEST_FAMILIES=\[/.test(reportBody), 'buildSportifReport ne doit plus déclarer sa propre copie locale — doit déléguer à la constante globale.');
});

test('4 — TestsFamilyFilter filtre via de vrais <button>, compteurs (réalisé/total) dérivés directement de TESTS/testData, jamais une nouvelle donnée', () => {
  const body = extractFnBody(code, 'TestsFamilyFilter');
  assert.ok(/h\('button',\{/.test(body), 'Doit utiliser de vrais <button>.');
  assert.ok(body.includes('TEST_FAMILIES.map'), 'Doit itérer sur TEST_FAMILIES existant.');
  assert.ok(body.includes('testHasAnyTrialValue(td[t.key])'), 'Le compteur "réalisés" doit réutiliser testHasAnyTrialValue existant, jamais un nouveau critère.');
});

// ── 3. Carte test : aucune valeur recalculée ──────────────────────────────────────────────────────
test('5 — testResultCardState ne recalcule jamais LSI/asymétrie/statut/percentile : réutilise pres.asymItems (unilatéral, déjà calculé Phase 4) et bestVal/computeStatusWithNormsV2 (bilatéral, même appel que KpiResultCard)', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(body.includes('pres.asymItems'), 'Doit lire pres.asymItems déjà calculé.');
  assert.ok(body.includes('computeStatusWithNormsV2(') && body.includes('bestVal('), 'Doit réutiliser bestVal/computeStatusWithNormsV2, mêmes fonctions que KpiResultCard.');
  assert.ok(!/autoLSI\(|lsiSt\(/.test(body), 'testResultCardState ne doit jamais recalculer LSI/asymétrie elle-même.');
});

test('6 — TestResultCard affiche la valeur principale et son unité (testKpiUnit, même regex que cmjVarUnit/computeAnalysePresentation) sans jamais inventer une unité', () => {
  const cardBody = extractFnBody(code, 'TestResultCard');
  assert.ok(cardBody.includes('st.value') && cardBody.includes('st.unit'), 'Doit afficher value/unit déjà dérivés.');
  const unitBody = extractFnBody(code, 'testKpiUnit');
  assert.ok(unitBody.includes("label.match(/\\(([^)]+)\\)/)"), 'testKpiUnit doit extraire l\'unité du label existant.');
});

// ── 4. D/G, LSI, asymétrie existants ──────────────────────────────────────────────────────────────
test('7 — D/G affichés tels quels (st.dV/st.gV) pour un test unilatéral, jamais recalculés', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(body.includes('asym.dV') && body.includes('asym.gV'), 'D/G doivent provenir de pres.asymItems (déjà calculé), jamais recalculés.');
});

test('8 — LSI affiché tel quel (asym.lsi), jamais recalculé', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(body.includes('lsi:asym.lsi'), 'LSI doit provenir de pres.asymItems tel quel.');
});

test('9 — Asymétrie (statut du LSI) reprise telle quelle (asym.status), jamais une nouvelle règle de classification', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(body.includes('status:asym.status'), 'Le statut associé au LSI doit provenir de pres.asymItems tel quel.');
});

// ── 5. Statut existant ────────────────────────────────────────────────────────────────────────────
test("10 — Statut existant affiché via le composant Badge partagé (système visuel déjà existant), jamais un nouveau statut", () => {
  const cardBody = extractFnBody(code, 'TestResultCard');
  assert.ok(cardBody.includes('h(Badge,{status:st.status'), 'Doit réutiliser Badge (système visuel existant).');
});

// ── 6. Distinction des 4 états (A/B/C/D) ──────────────────────────────────────────────────────────
test('11 — Test non réalisé (état C) explicitement distingué ("not_done"), jamais transformé en statut positif', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(body.includes("return{state:'not_done'") , 'Doit retourner explicitement l\'état not_done.');
  const cardBody = extractFnBody(code, 'TestResultCard');
  assert.ok(cardBody.includes("'○ Non réalisé'") && cardBody.includes("'Pas de donnée disponible'"), 'Doit afficher un libellé honnête, jamais "Optimal".');
});

test('12 — Test réalisé mais non classifiable (état B) explicitement distingué ("unclassifiable") quand une valeur existe sans statut applicable', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(/status\?'ok':'unclassifiable'/.test(body), 'Doit distinguer explicitement le cas où best existe mais status est null.');
});

test('13 — Donnée partielle (état D) explicitement distinguée ("partial") pour un test unilatéral dont un seul côté est renseigné, ou un test bilatéral sans valeur sur le KPI principal', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(body.includes("if(best==null)return{state:'partial'"), 'Bilatéral sans valeur principale -> partial.');
  assert.ok(body.includes("return{state:'partial',test:test,dV:vD,gV:vG"), 'Unilatéral avec un seul côté -> partial, jamais un LSI inventé.');
});

test('14 — Aucun faux "Optimal" : un test sans donnée ne peut jamais recevoir st.status (Badge) ni un libellé positif par défaut', () => {
  const body = extractFnBody(code, 'testResultCardState');
  assert.ok(!/state:'not_done'[^}]*status:/.test(body.replace(/\n/g, ' ')), 'L\'état not_done ne doit jamais porter de champ status.');
});

// ── 7. Détail test ─────────────────────────────────────────────────────────────────────────────────
test('15 — Clic sur un test ouvre TestResultDetail qui délègue à ResultsBrowser (déjà existant, étendu par initialSel) — aucune deuxième implémentation du rendu KPI', () => {
  const detailBody = extractFnBody(code, 'TestResultDetail');
  assert.ok(detailBody.includes('h(ResultsBrowser,{testData:bilan.testData') && detailBody.includes('initialSel:testKey'), 'TestResultDetail doit déléguer à ResultsBrowser avec initialSel.');
  const rbBody = extractFnBody(code, 'ResultsBrowser');
  assert.ok(rbBody.includes('props.initialSel'), 'ResultsBrowser doit accepter initialSel (extension additive, Phase 8 §14).');
});

// ── 8. Navigation qualité/Biomécanique/Pourquoi si relation existante ────────────────────────────
test('16 — Navigation vers une qualité UNIQUEMENT si la relation test->qualité existe déjà (TFM, référentiel existant) ET que la qualité est réellement affichée (pres.evFns) — jamais un nouveau mapping', () => {
  const body = extractFnBody(code, 'TestResultDetail');
  assert.ok(body.includes('Object.keys(TFM[testKey]||{})'), 'Doit lire TFM[testKey] tel quel (référentiel existant).');
  assert.ok(body.includes('pres.evFns.indexOf(ql)>=0'), 'Ne doit proposer le lien que si la qualité est réellement affichée (même critère que functionRelTests).');
  assert.deepStrictEqual(sandbox.TFM, baseSandbox.TFM, 'TFM a changé — cette phase ne doit ajouter aucune relation test -> qualité.');
});

test('17 — [Pourquoi ?] n\'apparaît que pour une qualité déjà reliée au test (même filtre TFM/pres.evFns) — jamais une relation créée uniquement pour afficher ce bouton', () => {
  const body = extractFnBody(code, 'TestResultDetail');
  assert.ok(body.includes('onOpenPourquoi&&h(') , 'Le bouton Pourquoi doit être conditionné par la même liste qualLinks (déjà filtrée).');
  assert.ok(!/onOpenPourquoi\([^)]*testKey/.test(body), '[Pourquoi ?] doit être appelé avec la qualité liée (ql), jamais directement avec le testKey (Pourquoi n\'est pas un écran de détail de test, §10 mission).');
});

// ── 9. Absence de nouvelle relation clinique / recalcul / nouveaux seuils / modification des engines ──
test('18 — GUARD — Aucune nouvelle relation clinique : SYSTEM_TESTS/TFM/TESTS/TBK inchangés vs baseline (37bfcb4)', () => {
  ['SYSTEM_TESTS', 'TFM', 'TESTS', 'TBK'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit créer aucune nouvelle relation/mapping.');
  });
});

test('19 — GUARD — Aucun recalcul : bestVal/computeStatusWithNormsV2/autoLSI/lsiSt/applyThr/computeAnalysePresentation restent BYTE-IDENTIQUES vs baseline (37bfcb4)', () => {
  ['bestVal', 'computeStatusWithNormsV2', 'autoLSI', 'lsiSt', 'applyThr', 'computeAnalysePresentation', 'testHasAnyTrialValue', 'testCompletion'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§19).');
  });
});

test('20 — GUARD — Aucun nouveau seuil/norme : NORMS/NORMS_V2/THRESHOLDS inchangés vs baseline (37bfcb4)', () => {
  ['NORMS', 'NORMS_V2', 'THRESHOLDS'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucun seuil/norme.');
  });
});

test('21 — GUARD — Les moteurs cliniques (computeMoteur, 8 HYP-XX-01, computeCsmV2, computeHypClinicalSynthesis01, moteur biomécanique) restent BYTE-IDENTIQUES vs baseline (37bfcb4)', () => {
  ['computeMoteur', 'computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeCsmV2', 'computeHypClinicalSynthesis01', 'computeBiomecaEngine', 'computeMouvementAnalysis'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§19).');
  });
});

// ── 10. Réutilisation ResultsBrowser ───────────────────────────────────────────────────────────────
test('22 — ResultsBrowser lui-même n\'est étendu que de façon additive (nouvelle ligne initialSel, reste du corps inchangé) — même KpiResultCard, même rendu bilatéral/unilatéral qu\'avant cette phase', () => {
  const rbBody = extractFnBody(code, 'ResultsBrowser');
  const baseRbBody = extractFnBody(baseCode, 'ResultsBrowser');
  assert.ok(rbBody.length > baseRbBody.length, 'ResultsBrowser doit être étendu (initialSel), pas raccourci.');
  assert.ok(rbBody.includes('h(KpiResultCard,'), 'Doit continuer à déléguer à KpiResultCard (aucune duplication).');
  assert.strictEqual(extractFnBody(code, 'KpiResultCard'), extractFnBody(baseCode, 'KpiResultCard'), 'KpiResultCard ne doit pas être modifié par cette phase.');
});

// ── 11. Non-régression TestDetailPage (saisie) ────────────────────────────────────────────────────
test('23 — GUARD — TestDetailPage (saisie/édition) reste BYTE-IDENTIQUE vs baseline (37bfcb4) — jamais transformée en écran de résultats', () => {
  assert.strictEqual(extractFnBody(code, 'TestDetailPage'), extractFnBody(baseCode, 'TestDetailPage'), 'TestDetailPage a changé — interdit (§0/§18 mission : ne jamais casser la saisie).');
});

// ── 12. Non-régression AnalyseView / ExpertView ───────────────────────────────────────────────────
test('24 — Non-régression : ExpertView reste inchangée, et le sélecteur interne d\'AnalyseView propose la nouvelle destination "Tests" sans supprimer l\'onglet Expert existant', () => {
  assert.strictEqual(extractFnBody(code, 'ExpertView'), extractFnBody(baseCode, 'ExpertView'), 'ExpertView ne doit pas être modifiée par cette phase.');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes("['tests','Tests']"), 'Le sélecteur interne doit proposer la nouvelle destination Tests.');
  assert.ok(analyseBody.includes("['expert','Expert']"), 'L\'onglet Expert doit rester accessible, non supprimé.');
});

// ── 13. Responsive ────────────────────────────────────────────────────────────────────────────────
test('25 — TestsView compose sa grille de cartes avec repeat(auto-fit,minmax(...)) — empilement naturel desktop/tablette, aucune largeur fixe qui déborderait à 834px', () => {
  const body = extractFnBody(code, 'TestsView');
  assert.ok(/gridTemplateColumns:'repeat\(auto-fit,minmax\(/.test(body), 'La grille de TestResultCard doit être responsive (auto-fit/minmax), jamais une largeur fixe.');
});

// ── 14. Accessibilité de base ─────────────────────────────────────────────────────────────────────
test('26 — Les éléments interactifs (TestResultCard, TestsFamilyFilter) sont de vrais <button> — jamais un <div onClick>', () => {
  ['TestResultCard', 'TestsFamilyFilter'].forEach((comp) => {
    const body = extractFnBody(code, comp);
    assert.ok(/h\('button',\{type:'button'/.test(body), comp + ' doit utiliser un vrai <button type="button">.');
  });
});

test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX/TFM/FN_KEY restent inchangés vs baseline (37bfcb4)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX', 'TFM', 'FN_KEY'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/référentiel.');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

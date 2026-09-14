// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 10 : Audit + intégration UX globale
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : intégration/cohérence pure entre les vues déjà livrées par les Phases 1-9 — AUCUN
// nouveau raisonnement clinique, AUCUNE nouvelle route App(), AUCUN nouveau routeur parallèle.
// Deux corrections de câblage de navigation, toutes deux dans le mécanisme EXISTANT :
//   (1) onGotoRapport (SyntheseView/BodyMapView/BiomecaView/TestsView) bascule désormais vers
//       ReportView (setView('rapport')) au lieu du PDF direct (props.onPreview) — cohérent avec la
//       barre secondaire persistante dont "Rapport" pointe vers ReportView depuis la Phase 9. Le PDF
//       reste atteignable, mais DEPUIS ReportView (onDownloadPdf:props.onPreview, inchangé).
//   (2) Le mécanisme testsSelectedTest/initialSelectedTest construit en Phase 8 (§14), resté mort
//       (aucun setter destructuré), est câblé via un unique handler goToTest(tk) réutilisé par les
//       3 boutons "Voir le test" qui connaissent déjà un test précis (PreuvesPrincipalesCard,
//       BiomecaResponsibleVariables, BodyMapStructureDetail) — jamais une deuxième machine de routing.
//
// BASELINE_COMMIT : 9a2a749 (Phase 9), strictement avant cette phase.

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

const BASELINE_COMMIT = '9a2a749';
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
function countOccurrences(src, needle) {
  let n = 0, i = 0;
  while ((i = src.indexOf(needle, i)) >= 0) { n++; i += needle.length; }
  return n;
}

const sandboxSrc = code.slice(code.indexOf('var C={'), code.indexOf("ReactDOM.createRoot(document.getElementById('root'))"));
const baseSandboxSrc = baseCode.slice(baseCode.indexOf('var C={'), baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))"));
const EXPORTS = "\nreturn {computeMoteur:computeMoteur,computeCsmV2:computeCsmV2,computeHypClinicalSynthesis01:computeHypClinicalSynthesis01,computeBiomecaEngine:(typeof computeBiomecaEngine!=='undefined'?computeBiomecaEngine:null),computeMouvementAnalysis:computeMouvementAnalysis,computePriorisationClinique:computePriorisationClinique,computeAnalysePresentation:computeAnalysePresentation,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,TFM:TFM,SYSTEM_TESTS:SYSTEM_TESTS,CMJ_PHASE_TO_QUALITY:CMJ_PHASE_TO_QUALITY,STR_QUAL_DETAIL:STR_QUAL_DETAIL,TEST_FAMILIES:TEST_FAMILIES,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,buildSportifReport:buildSportifReport,buildExpertReport:buildExpertReport};";
const sandbox = new Function('localStorage', sandboxSrc + EXPORTS)({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + EXPORTS)({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 10 : Audit + intégration UX globale');

// ── 1-2. Analyse Expert n'est jamais la route par défaut ──────────────────────────────────────────
test('1 — secondaryView est initialisé à \'synthese\' (jamais \'expert\') et secondaryTarget retombe sur SECONDARY_NAV[0] (\'synthese\') si non trouvé', () => {
  const appBody = extractFnBody(code, 'App');
  assert.ok(/var \[secondaryView,setSecondaryView\]=useState\('synthese'\);/.test(appBody), 'secondaryView doit démarrer sur \'synthese\'.');
  assert.ok(/SECONDARY_NAV\.filter\(function\(it\)\{return it\.key===secondaryView;\}\)\[0\]\|\|SECONDARY_NAV\[0\]/.test(appBody), 'secondaryTarget doit retomber sur SECONDARY_NAV[0] (=\'synthese\') si secondaryView ne correspond à aucune entrée.');
});
test('2 — Chaque point d\'entrée d\'un bilan (Home, BilansGlobalView, AthleteProfile) réinitialise explicitement secondaryView à \'synthese\' — jamais de valeur résiduelle (ex. \'rapport\'/\'biomeca\') pouvant faire atterrir sur une autre vue', () => {
  const appBody = extractFnBody(code, 'App');
  const entryCount = countOccurrences(appBody, "setCurBilan(b);setSecondaryView('synthese');setNavNonce(function(n){return n+1;});setScreen('analyse');");
  assert.ok(entryCount >= 3, 'Les 3 points d\'entrée connus (Home/BilansGlobalView/AthleteProfile) doivent tous réinitialiser secondaryView=\'synthese\' avant setScreen(\'analyse\') (trouvé ' + entryCount + ').');
});

// ── 3-6. Correction "Boutons Rapport" (P1) ─────────────────────────────────────────────────────────
test('3 — onGotoRapport de SyntheseView/BodyMapView/BiomecaView/TestsView bascule vers ReportView (setView(\'rapport\')), jamais directement le PDF', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const m = analyseBody.match(/onGotoRapport:function\(\)\{setView\('rapport'\);\}/g) || [];
  assert.strictEqual(m.length, 4, 'Les 4 sites d\'appel (SyntheseView, BodyMapView, BiomecaView, TestsView) doivent tous utiliser onGotoRapport:function(){setView(\'rapport\');} (trouvé ' + m.length + ').');
  assert.ok(!/onGotoRapport:props\.onPreview/.test(analyseBody), 'Plus aucun onGotoRapport ne doit pointer directement vers props.onPreview (PDF direct).');
});
test('4 — props.onPreview (accès direct au PDF) n\'a que 2 sites d\'usage dans AnalyseView : le raccourci permanent de la sidebar ("👁 Aperçu du rapport") et onDownloadPdf de ReportView — plus aucun des 4 onGotoRapport corrigés ne s\'y branche', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(ReportView,\{[\s\S]*?onDownloadPdf:props\.onPreview\}\)/.test(analyseBody), 'ReportView doit toujours recevoir onDownloadPdf:props.onPreview.');
  assert.ok(analyseBody.includes("h(Btn,{small:true,onClick:props.onPreview,style:{width:'100%'}},'👁 Aperçu du rapport')"), 'Le raccourci sidebar "👁 Aperçu du rapport" doit rester intact.');
  assert.strictEqual(countOccurrences(analyseBody, 'props.onPreview'), 2, 'props.onPreview ne doit apparaître qu\'à ces 2 sites précis (sidebar + ReportView), plus aucun autre (les 4 onGotoRapport ne doivent plus s\'y brancher).');
});
test('5 — ReportView n\'est définie qu\'une seule fois (aucune duplication introduite par la correction du câblage Rapport)', () => {
  assert.strictEqual(countOccurrences(code, 'function ReportView(props){'), 1, 'ReportView doit rester une définition unique.');
});
test('6 — Le sélecteur interne d\'AnalyseView et SECONDARY_NAV restent inchangés (7 destinations, mêmes clés/labels/targets) — la correction ne touche que le CÂBLAGE, jamais la liste des routes', () => {
  const appBody = extractFnBody(code, 'App');
  const baseAppBody = extractFnBody(baseCode, 'App');
  const extractNav = (s) => s.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/)[1];
  assert.strictEqual(extractNav(appBody), extractNav(baseAppBody), 'SECONDARY_NAV doit rester byte-identique vs Phase 9.');
  assert.strictEqual(extractFnBody(code, 'App').match(/function goSecondary\(item\)\{[^}]*\}/)[0], extractFnBody(baseCode, 'App').match(/function goSecondary\(item\)\{[^}]*\}/)[0], 'goSecondary doit rester byte-identique vs Phase 9 (aucun second routeur).');
});

// ── 7-13. Câblage du mécanisme "Voir le test" (P1) ─────────────────────────────────────────────────
test('7 — testsSelectedTest a désormais un setter (setTestsSelectedTest) — le mécanisme Phase 8 §14 n\'est plus mort', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/var \[testsSelectedTest,setTestsSelectedTest\]=useState\(null\);/.test(analyseBody), 'testsSelectedTest doit exposer son setter.');
});
test('8 — Un unique handler goToTest(tk) centralise setTestsSelectedTest+setView(\'tests\') — pas de duplication de ce couple à chaque site d\'appel (audit de duplication §mission)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/function goToTest\(tk\)\{setTestsSelectedTest\(tk\);setView\('tests'\);\}/.test(analyseBody), 'goToTest doit exister exactement sous cette forme.');
  assert.strictEqual(countOccurrences(analyseBody, 'setTestsSelectedTest('), 1, 'setTestsSelectedTest ne doit être appelé qu\'à un seul endroit (dans goToTest) — aucune seconde machine de routing.');
});
test('9 — goToTest est bien réutilisé (jamais réimplémenté) par BodyMapView, BiomecaView, QualiteDetailView et PourquoiView', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(BodyMapView,\{[\s\S]{0,400}?onGotoTest:goToTest/.test(analyseBody), 'BodyMapView doit recevoir onGotoTest:goToTest.');
  assert.ok(/h\(BiomecaView,\{[\s\S]{0,400}?onGotoTest:goToTest/.test(analyseBody), 'BiomecaView doit recevoir onGotoTest:goToTest.');
  assert.ok(/h\(QualiteDetailView,\{[\s\S]{0,400}?onGotoTest:goToTest/.test(analyseBody), 'QualiteDetailView doit recevoir onGotoTest:goToTest.');
  assert.ok(/h\(PourquoiView,\{[\s\S]{0,400}?onGotoTest:goToTest/.test(analyseBody), 'PourquoiView doit recevoir onGotoTest:goToTest.');
});
test('10 — PreuvesPrincipalesCard (utilisée par QualiteDetailView ET PourquoiView) appelle onGotoTest(tk) avec le test précisément connu par ligne de preuve, en priorité sur le saut générique onGotoExpertTab(\'kpi\')', () => {
  const cardBody = extractFnBody(code, 'PreuvesPrincipalesCard');
  assert.ok(/onGotoTest\?onGotoTest\(tk\):onGotoExpertTab\('kpi'\)/.test(cardBody), 'Le bouton "Voir le test →" doit préférer onGotoTest(tk) à onGotoExpertTab(\'kpi\').');
});
test('11 — BiomecaResponsibleVariables (toujours relative au test \'cmj\') appelle goToTest(\'cmj\') via onGotoTest — jamais un test ambigu ou faux', () => {
  const viewBody = extractFnBody(code, 'BiomecaView');
  assert.ok(viewBody.includes("onGotoTest:props.onGotoTest?function(){props.onGotoTest('cmj');}:(props.onGotoExpertTab&&function(){props.onGotoExpertTab('kpi');})"), 'BiomecaView doit transmettre onGotoTest(\'cmj\') à BiomecaResponsibleVariables, avec repli sur onGotoExpertTab si onGotoTest absent.');
});
test('12 — BodyMapStructureDetail : "Voir les tests" ouvre directement le test via goToTest UNIQUEMENT quand exactement un test actif est identifiable pour la structure (activeTests.length===1) — jamais une présélection ambiguë entre plusieurs tests', () => {
  const detailBody = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(detailBody.includes('var singleTest=activeTests.length===1?activeTests[0]:null;'), 'La détection du cas non-ambigu (exactement 1 test actif) doit être explicite.');
  assert.ok(detailBody.includes('var effGoto=(singleTest&&onGotoTest)?function(){onGotoTest(singleTest);}:onGotoTests;'), 'effGoto doit préférer onGotoTest(singleTest) au cas non-ambigu, sinon repli sur onGotoTests (générique).');
});
test('13 — Aucune présélection anatomique inventée : BodyMapStructureDetail continue de dériver activeTests EXCLUSIVEMENT de SYSTEM_TESTS[sys] déjà existant (aucune nouvelle table structure->test)', () => {
  const detailBody = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(detailBody.includes('var activeTests=testKeys.filter(function(tk){return td[tk]&&td[tk].active;});'), 'activeTests doit rester dérivé de testKeys=SYSTEM_TESTS[sys] (inchangé Phase 6), jamais une nouvelle logique.');
});

// ── 14-16. Aucune nouvelle machine de routing / state parallèle ──────────────────────────────────
test('14 — Aucun nouveau state de type returnView/selectedTestKey générique n\'a été introduit : le seul state ajouté est le setter de testsSelectedTest (déjà déclaré en Phase 8, complété ici)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const baseAnalyseBody = extractFnBody(baseCode, 'AnalyseView');
  const useStateCount = (s) => (s.match(/useState\(/g) || []).length;
  assert.strictEqual(useStateCount(analyseBody), useStateCount(baseAnalyseBody), 'Le nombre de useState() dans AnalyseView doit rester inchangé (aucun nouveau state de routing ajouté, seul un setter manquant a été complété).');
  assert.ok(!/returnView|selectedQualityKey|selectedStructureKey/.test(analyseBody), 'Aucun state returnView/selectedQualityKey/selectedStructureKey ne devait être nécessaire — non introduit.');
});
test('15 — Retour Pourquoi -> Qualité toujours garanti par openPourquoi (byte-identique vs Phase 9), jamais un second mécanisme de retour', () => {
  assert.strictEqual(
    extractFnBody(code, 'AnalyseView').match(/function openPourquoi\(fq\)\{[^}]*\}/)[0],
    extractFnBody(baseCode, 'AnalyseView').match(/function openPourquoi\(fq\)\{[^}]*\}/)[0],
    'openPourquoi doit rester byte-identique vs Phase 9.'
  );
});
test('16 — Rapport -> Biomécanique -> retour -> Rapport : BiomecaView expose déjà son propre bouton "📄 Rapport" (onGotoRapport), désormais correctement câblé vers ReportView (setView(\'rapport\')), sans nouveau mécanisme de pile de navigation', () => {
  const biomecaBody = extractFnBody(code, 'BiomecaView');
  assert.ok(biomecaBody.includes("props.onGotoRapport&&h(Btn,{onClick:props.onGotoRapport},'📄 Rapport')"), 'BiomecaView doit garder son bouton "📄 Rapport" existant, simplement mieux câblé côté appelant.');
});

// ── 17-19. Aucune modification clinique (GUARDS) ───────────────────────────────────────────────────
test('17 — GUARD — computeMoteur/computeCsmV2/computeHypClinicalSynthesis01/computeMouvementAnalysis/computePriorisationClinique/computeAnalysePresentation restent BYTE-IDENTIQUES vs baseline (9a2a749)', () => {
  ['computeMoteur', 'computeCsmV2', 'computeHypClinicalSynthesis01', 'computeMouvementAnalysis', 'computePriorisationClinique', 'computeAnalysePresentation'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — cette phase est UX/intégration uniquement.');
  });
});
test('18 — GUARD — NORMS/NORMS_V2/THRESHOLDS/TFM/SYSTEM_TESTS/CMJ_PHASE_TO_QUALITY/STR_QUAL_DETAIL/TEST_FAMILIES/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal vs baseline (9a2a749)', () => {
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'TFM', 'SYSTEM_TESTS', 'CMJ_PHASE_TO_QUALITY', 'STR_QUAL_DETAIL', 'TEST_FAMILIES', 'CSM_V2_CLINICAL_VARIABLE_MATRIX'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/relation/mapping.');
  });
});
test('19 — GUARD — buildSportifReport/buildExpertReport (contenu PDF) restent BYTE-IDENTIQUES vs baseline (9a2a749)', () => {
  assert.strictEqual(extractFnBody(code, 'buildSportifReport'), extractFnBody(baseCode, 'buildSportifReport'), 'buildSportifReport a changé — le PDF ne doit pas être touché par cette phase.');
  assert.strictEqual(extractFnBody(code, 'buildExpertReport'), extractFnBody(baseCode, 'buildExpertReport'), 'buildExpertReport a changé — le PDF ne doit pas être touché par cette phase.');
});

// ── 20-21. Analyse Expert reste une zone optionnelle / avancée ────────────────────────────────────
test('20 — Analyse Expert (view==\'expert\') n\'est jamais la cible de secondaryTarget par défaut ni des points d\'entrée bilan : seule la sélection explicite "Analyse Expert" de la barre secondaire y mène', () => {
  const appBody = extractFnBody(code, 'App');
  const navBlock = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/)[1];
  const exprIdx = navBlock.indexOf("key:'analyseexpert'");
  const synthIdx = navBlock.indexOf("key:'synthese'");
  assert.ok(synthIdx >= 0 && exprIdx > synthIdx, '\'synthese\' doit rester la première entrée de SECONDARY_NAV (fallback par défaut), \'analyseexpert\' une entrée explicite parmi d\'autres.');
});
test('21 — Aucune vue clinique (Synthèse/Qualités/Pourquoi/Body Map/Biomécanique/Tests/Rapport) ne force un passage par Analyse Expert pour être comprise : plusieurs vues exposent leur propre bouton "Analyse Expert" comme option, jamais une redirection automatique ni un view initial forcé à \'expert\'', () => {
  const optionalExpertButtons = (code.match(/Analyse [Ee]xpert/g) || []).length;
  assert.ok(optionalExpertButtons >= 5, 'Le passage par Analyse Expert doit rester une option explicite (bouton), présente à plusieurs endroits, jamais un passage obligé (trouvé ' + optionalExpertButtons + ').');
  assert.ok(!/setView\('expert'\);setView/.test(code), 'Aucune séquence ne doit forcer automatiquement view=\'expert\' en cascade depuis une autre vue.');
});

// ── 22-24. Cohérence des boutons "Pourquoi ?" / labels ─────────────────────────────────────────────
test('22 — Tous les boutons "Pourquoi ?" utilisent uniformément openPourquoi (aucune seconde implémentation locale)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes('onOpenPourquoi:openPourquoi'), 'onOpenPourquoi doit être transmis via la référence directe à openPourquoi.');
  assert.strictEqual(countOccurrences(analyseBody, 'function openPourquoi'), 1, 'openPourquoi ne doit être défini qu\'une seule fois.');
});
test('23 — Le libellé "Rapport" de la barre secondaire persistante et le bouton "📋 Voir le rapport"/"📄 Rapport" internes pointent tous vers la même destination (ReportView), sans ambiguïté de destination pour un même mot', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/onGotoRapport:function\(\)\{setView\('rapport'\);\}/.test(analyseBody));
  const appBody = extractFnBody(code, 'App');
  assert.ok(appBody.includes("{key:'rapport',label:'Rapport',target:{screen:'analyse',view:'rapport'}}"), 'La barre secondaire "Rapport" doit cibler view:\'rapport\' (ReportView), identique aux boutons internes.');
});
test('24 — Le "⬇ Rapport PDF" / "👁 Aperçu du rapport" de la sidebar (accès direct et permanent au PDF, indépendant de la vue courante) reste byte-identique — ce raccourci volontaire n\'est pas concerné par la correction "Boutons Rapport"', () => {
  const sidebarBlock = "h(Btn,{small:true,onClick:props.onEdit,style:{width:'100%'}},'✎ Modifier'),\n        h(Btn,{small:true,onClick:props.onPreview,style:{width:'100%'}},'👁 Aperçu du rapport'),\n        h('div',{style:{position:'relative'}},\n          h(Btn,{small:true,onClick:function(){setShowPrintMenu(function(v){return!v;});},style:{width:'100%'}},'⬇ Rapport PDF'),";
  assert.ok(code.includes(sidebarBlock), 'Le bloc sidebar Modifier/Aperçu/Rapport PDF doit rester byte-identique.');
  assert.ok(baseCode.includes(sidebarBlock), 'Ce même bloc doit déjà exister identique dans la baseline (9a2a749) — confirme qu\'il n\'a pas été touché par cette phase.');
});

// ── 25-27. Accessibilité / duplication des nouveaux éléments ───────────────────────────────────────
test('25 — Les nouveaux points de navigation "Voir le test" restent de vrais éléments interactifs (h(Btn,...) ou <button> natif), jamais un <div onClick> inaccessible', () => {
  const cardBody = extractFnBody(code, 'PreuvesPrincipalesCard');
  assert.ok(/h\('button',\{onClick:function\(\)\{onGotoTest\?onGotoTest\(tk\):onGotoExpertTab\('kpi'\);\}/.test(cardBody), 'Le bouton "Voir le test →" doit rester un <button> natif.');
  const detailBody = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(/h\(Btn,\{onClick:effGoto\}/.test(detailBody), 'Le bouton "Voir les tests" doit rester un composant Btn (bouton natif sous-jacent).');
});
test('26 — Aucune duplication introduite : le triplet setOpenQuality/setView(\'qualites\') et le triplet setExpertTabTarget/setView(\'expert\') ne sont pas redéfinis une fois de plus par cette phase (nombre d\'occurrences inchangé vs baseline)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const baseAnalyseBody = extractFnBody(baseCode, 'AnalyseView');
  assert.strictEqual(countOccurrences(analyseBody, "setExpertTabTarget(tab);setView('expert');"), countOccurrences(baseAnalyseBody, "setExpertTabTarget(tab);setView('expert');"), 'Le nombre de closures onGotoExpertTab ne doit pas augmenter (cette phase répare onGotoRapport/onGotoTest, pas onGotoExpertTab).');
});
test('27 — Aucun bouton mort introduit : goToTest et les callbacks onGotoTest ajoutés sont systématiquement appelés depuis un site de rendu réel (pas de handler déclaré puis jamais branché)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes('function goToTest(tk)'), 'goToTest doit être défini.');
  assert.ok(countOccurrences(analyseBody, 'onGotoTest:goToTest') >= 4, 'goToTest doit être effectivement branché à au moins 4 vues (BodyMapView, BiomecaView, QualiteDetailView, PourquoiView).');
});

// ── 28-30. Intégrité globale de la mission ─────────────────────────────────────────────────────────
test('28 — GUARD — Les 8 moteurs HYP-XX-01 restent BYTE-IDENTIQUES vs baseline (9a2a749)', () => {
  ['computeHypForce01', 'computeHypExplosivity01', 'computeHypAbsorption01', 'computeHypStability01', 'computeHypMobility01', 'computeHypEndurance01', 'computeHypCoordination01', 'computeHypControl01']
    .filter((fn) => code.includes('function ' + fn + '('))
    .forEach((fn) => {
      assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette phase.');
    });
});
test('29 — Snapshot clinique (extraction statique) : aucune ligne contenant functionScores/systemScores/clinicalSynthesis/clinicalSynthesisV2 n\'a été ajoutée/retirée dans AnalyseView au-delà des props déjà transmises telles quelles', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const baseAnalyseBody = extractFnBody(baseCode, 'AnalyseView');
  ['res.functionScores', 'res.systemScores', 'res.clinicalSynthesis', 'res.clinicalSynthesisV2'].forEach((ref) => {
    assert.strictEqual(countOccurrences(analyseBody, ref), countOccurrences(baseAnalyseBody, ref), ref + ' — nombre de références inchangé attendu (aucun nouveau calcul/lecture ajouté par cette phase).');
  });
});
test('30 — git diff --check ne signale aucun conflit de fusion dans index.html (fichier effectivement modifié par cette phase, mais proprement)', () => {
  const out = execSync('git diff --check -- index.html', { cwd: REPO }).toString();
  assert.strictEqual(out.trim(), '', 'git diff --check doit être vide (aucun marqueur de conflit).');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

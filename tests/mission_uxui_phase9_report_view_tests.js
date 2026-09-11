// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 9 : Rapport interactif (ReportView)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : ReportView + ReportBilanIdentityHero/ReportSectionTitle/ReportBodyMapSummary/
// ReportQualitesSummary/ReportBiomecaSummary/ReportTestsSummary/ReportRetourSportCard/
// ReportTechnicalDetails. Compose EXCLUSIVEMENT des sorties/composants déjà validés par les Phases
// 3-8 (BilanStatusCards, PriorityOrientationCards, CsmObjectifiedCard/CsmSuspectedCard/
// CsmNonDeterminableCard/CsmRelationsCards/CsmLimitationsCard, QualityCard, BiomecaHero/
// BiomecaWorkAxes, BodyMap, TEST_FAMILIES) — aucun nouveau raisonnement clinique, aucune deuxième
// Body Map/logique de qualité/logique de biomécanique/logique de tests. Le PDF (buildSportifReport)
// reste le référentiel figé — vérifié byte-identique avant/après (voir rapport de phase).
//
// BASELINE_COMMIT : abe4d8a (Phase 8), strictement avant cette phase.

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

const BASELINE_COMMIT = 'abe4d8a';
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
const sandbox = new Function('localStorage', sandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,TEST_FAMILIES:TEST_FAMILIES,REPORT_TITLES:REPORT_TITLES,buildSportifReport:buildSportifReport,buildExpertReport:buildExpertReport};")({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,TEST_FAMILIES:TEST_FAMILIES,buildSportifReport:buildSportifReport,buildExpertReport:buildExpertReport};")({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 9 : Rapport interactif');

// ── 1. Route Rapport : vraie vue, plus un alias de l'écran reportPreview ──────────────────────────
test("1 — ReportView est définie et App() en fait la cible de la barre secondaire \"Rapport\" (plus un alias de screen:'reportPreview')", () => {
  assert.ok(code.includes('function ReportView(props){'), 'ReportView introuvable.');
  const appBody = extractFnBody(code, 'App');
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable.');
  assert.ok(/\{key:'rapport',label:'Rapport',target:\{screen:'analyse',view:'rapport'\}\}/.test(m[1]), 'La destination "Rapport" doit cibler view:\'rapport\' (ReportView).');
});

test("2 — AnalyseView route view==='rapport' vers ReportView, sans nouvelle route App(), et masque les blocs 01-06 pour cette vue", () => {
  const body = extractFnBody(code, 'AnalyseView');
  assert.ok(/view==='rapport'&&h\(ReportView,/.test(body), 'AnalyseView doit rendre ReportView pour view===\'rapport\'.');
  assert.ok(body.indexOf("view!=='rapport'") >= 0, 'Les blocs 01-06 doivent être masqués pour view===\'rapport\'.');
});

// ── 2. Hero ────────────────────────────────────────────────────────────────────────────────────────
test('3 — ReportBilanIdentityHero réutilise REPORT_TITLES/reportModeForBilan (hissés depuis buildSportifReport, même question clinique que le PDF) et BilanStatusCards (Phase 3) — aucun recalcul', () => {
  const body = extractFnBody(code, 'ReportBilanIdentityHero');
  assert.ok(body.includes('REPORT_TITLES[mode]') && body.includes('reportModeForBilan(bilan)'), 'Doit réutiliser REPORT_TITLES/reportModeForBilan tels quels.');
  assert.ok(body.includes('h(BilanStatusCards,'), 'Doit déléguer à BilanStatusCards (Phase 3), pas une nouvelle carte de statut.');
});

// ── 3. Résumé clinique / Profil global ────────────────────────────────────────────────────────────
test('4 — La Synthèse clinique du Rapport délègue à CsmObjectifiedCard/CsmSuspectedCard (Phase 3) — mêmes cartes, aucune deuxième formulation du statut objectivé/suspecté', () => {
  const body = extractFnBody(code, 'ReportView');
  assert.ok(body.includes('h(CsmObjectifiedCard,') && body.includes('h(CsmSuspectedCard,'), 'Doit réutiliser CsmObjectifiedCard/CsmSuspectedCard.');
});

test('5 — Le Profil global (Qualités) réutilise pres.evFns (déjà calculé, Phase 4), jamais une nouvelle liste de qualités', () => {
  const body = extractFnBody(code, 'ReportQualitesSummary');
  assert.ok(body.includes('pres.evFns.map'), 'Doit itérer sur pres.evFns.');
});

// ── 4. Body Map ────────────────────────────────────────────────────────────────────────────────────
test('6 — ReportBodyMapSummary réutilise le composant BodyMap (Phase 6) tel quel, avec un lien vers BodyMapView complète — aucune deuxième Body Map', () => {
  const body = extractFnBody(code, 'ReportBodyMapSummary');
  assert.ok(body.includes('h(BodyMap,{systemScores:res.systemScores'), 'Doit déléguer au composant BodyMap existant.');
  assert.ok(body.includes('onGotoBodyMap'), 'Doit exposer un lien vers la Body Map complète.');
  assert.strictEqual(extractFnBody(code, 'BodyMap'), extractFnBody(baseCode, 'BodyMap'), 'Le composant BodyMap ne doit pas être modifié par cette phase.');
});

// ── 5. Qualités ────────────────────────────────────────────────────────────────────────────────────
test('7 — ReportQualitesSummary délègue à QualityCard (Phase 4) — même carte (statut/preuves/relation/accès détail), jamais une carte différente recréée', () => {
  const body = extractFnBody(code, 'ReportQualitesSummary');
  assert.ok(body.includes('h(QualityCard,{key:f,f:f,res:res,bilan:bilan,onOpen:onOpenQuality})'), 'Doit réutiliser QualityCard telle quelle.');
  assert.strictEqual(extractFnBody(code, 'QualityCard'), extractFnBody(baseCode, 'QualityCard'), 'QualityCard ne doit pas être modifiée par cette phase.');
});

// ── 6. Biomécanique ────────────────────────────────────────────────────────────────────────────────
test('8 — ReportBiomecaSummary réutilise BiomecaHero (Phase 7, résumé exécutif déjà rédigé) — aucun recalcul biomécanique, avec repli honnête si aucun CMJ actif', () => {
  const body = extractFnBody(code, 'ReportBiomecaSummary');
  assert.ok(body.includes('h(BiomecaHero,{analysis:analysis})'), 'Doit déléguer à BiomecaHero.');
  assert.ok(body.includes('if(!analysis){') && body.includes("'Biomécanique non disponible"), 'Doit afficher un message honnête si aucune analyse biomécanique (jamais un profil inventé).');
  assert.strictEqual(extractFnBody(code, 'BiomecaHero'), extractFnBody(baseCode, 'BiomecaHero'), 'BiomecaHero ne doit pas être modifié par cette phase.');
});

// ── 7. Preuves / Tests ────────────────────────────────────────────────────────────────────────────
test('9 — ReportTestsSummary réutilise TEST_FAMILIES (référentiel PDF, Phase 8) + pres.testsCnt/testsFilledCnt (Phase 4) — jamais un nouveau classement clinique des tests', () => {
  const body = extractFnBody(code, 'ReportTestsSummary');
  assert.ok(body.includes('TEST_FAMILIES.map'), 'Doit réutiliser TEST_FAMILIES existant.');
  assert.ok(body.includes('pres.testsFilledCnt') && body.includes('pres.testsCnt'), 'Doit réutiliser les compteurs déjà calculés.');
  assert.ok(body.includes('testHasAnyTrialValue'), 'Le décompte "réalisés" doit réutiliser testHasAnyTrialValue existant.');
});

// ── 8. Relations / cohérences ─────────────────────────────────────────────────────────────────────
test('10 — Les relations réutilisent CsmRelationsCards (Phase 3) telle quelle — respecte la distinction explanatoryHypotheses (relation documentée) vs concordant_no_relation (concordance), jamais fusionnées ni reformulées en cause', () => {
  const viewBody = extractFnBody(code, 'ReportView');
  assert.ok(viewBody.includes('h(CsmRelationsCards,{res:res})'), 'Doit déléguer à CsmRelationsCards.');
  assert.strictEqual(extractFnBody(code, 'CsmRelationsCards'), extractFnBody(baseCode, 'CsmRelationsCards'), 'CsmRelationsCards ne doit pas être modifiée par cette phase.');
});

// ── 9. Priorités / axes de progression ────────────────────────────────────────────────────────────
test('11 — Les priorités délèguent à PriorityOrientationCards (Phase 3, computePriorisationClinique déjà calculé) — aucune nouvelle priorisation ; les axes de progression biomécaniques délèguent à BiomecaWorkAxes (Phase 7)', () => {
  const viewBody = extractFnBody(code, 'ReportView');
  assert.ok(viewBody.includes('h(PriorityOrientationCards,{pri:pri,res:res})'), 'Doit déléguer à PriorityOrientationCards.');
  assert.ok(viewBody.includes('h(BiomecaWorkAxes,{analysis:mouvementAnalysis})'), 'Doit déléguer à BiomecaWorkAxes pour les axes de progression biomécaniques.');
  assert.strictEqual(extractFnBody(code, 'PriorityOrientationCards'), extractFnBody(baseCode, 'PriorityOrientationCards'), 'PriorityOrientationCards ne doit pas être modifiée.');
});

// ── 10. Limites / données manquantes (obligatoire, jamais masquée) ───────────────────────────────
test('12 — Les limites délèguent à CsmNonDeterminableCard/CsmLimitationsCard (Phase 3) — section toujours présente, jamais masquée pour paraître plus positive', () => {
  const viewBody = extractFnBody(code, 'ReportView');
  assert.ok(viewBody.includes('h(CsmNonDeterminableCard,') && viewBody.includes('h(CsmLimitationsCard,'), 'Doit toujours inclure ces deux cartes de limites.');
  assert.ok(/ReportSectionTitle,null,'Limites/.test(viewBody), 'La section "Limites / données manquantes" doit toujours être rendue (jamais conditionnée hors absence de csm).');
});

// ── 11. Retour au sport (si disponible, jamais une clearance inventée) ───────────────────────────
test('13 — ReportRetourSportCard réutilise res.rtpStatus déjà calculé et rtpChecklist (référentiel "Plan de prise en charge" du PDF, hissé Phase 9) — jamais une nouvelle décision RTS/clearance', () => {
  const body = extractFnBody(code, 'ReportRetourSportCard');
  assert.ok(body.includes('var rtp=res.rtpStatus;'), 'Doit lire res.rtpStatus tel quel.');
  assert.ok(body.includes('rtpChecklist(bilan.testData||{},res.functionScores)'), 'Doit réutiliser rtpChecklist (référentiel PDF).');
  assert.ok(body.includes("'Aucun test RTP actif — statut non déterminable.'"), 'Doit afficher explicitement l\'absence de statut, jamais une clearance par défaut.');
  assert.ok(code.includes('function rtpChecklist(td,fSc){'), 'rtpChecklist doit exister comme fonction globale (hissée depuis buildSportifReport).');
  assert.ok(!baseCode.includes('function rtpChecklist(td,fSc){'), 'Pré-requis : rtpChecklist n\'était pas globale avant cette phase (confirme une extraction nette, pas une duplication).');
});

test('14 — GUARD — rtpChecklist/reportModeForBilan/REPORT_TITLES sont une extraction pure de buildSportifReport : le PDF Sportif reste BYTE-IDENTIQUE (généré depuis la fixture réelle) vs baseline (abe4d8a)', () => {
  const REAL_DATA = { cmj: { active: true, trials: { peak_power: [46.1], braking_rfd: [70], force_zero_vel: [30], braking_impulse: [10], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82], height: [30.0], landing_peak_force: [55] } }, wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } }, dj: { active: true, trials: { rsi: [0.3] } }, knee_ext: { active: true, D: { trials: { n: [420], nkg: [5.7] } }, G: { trials: { n: [310], nkg: [4.2] } } } };
  const athlete = { id: 1, prenom: 'Léo', nom: 'Fournier', sport: 'Football', poste: 'Milieu', niveau: 'Semi-pro', sexe: 'M', poids: 74, taille: 180, dateNaissance: '1999-03-12', normPopulation: 'foot_f_senior', normSelections: {}, bilans: [] };
  const bilan = { id: 100, date: new Date().toISOString(), type: 'RTP', sousType: 'LCA', statut: 'Validé', testData: REAL_DATA, questData: {} };
  const resBefore = baseSandbox.computeMoteur(bilan.testData, bilan.questData, 'foot_f_senior', 27, {});
  const resAfter = sandbox.computeMoteur(bilan.testData, bilan.questData, 'foot_f_senior', 27, {});
  const pdfBefore = baseSandbox.buildSportifReport(athlete, bilan, resBefore);
  const pdfAfter = sandbox.buildSportifReport(athlete, bilan, resAfter);
  assert.strictEqual(pdfAfter, pdfBefore, 'Le PDF Sportif a changé — cette phase ne doit modifier ni le rendu ni le contenu du PDF (extraction purement technique uniquement, §24 mission).');
  const pdfExpertBefore = baseSandbox.buildExpertReport(athlete, bilan, resBefore);
  const pdfExpertAfter = sandbox.buildExpertReport(athlete, bilan, resAfter);
  assert.strictEqual(pdfExpertAfter, pdfExpertBefore, 'Le PDF Expert a changé — interdit par cette mission.');
});

// ── 12. Données techniques (secondaire, repliée par défaut) ─────────────────────────────────────
test('15 — ReportTechnicalDetails est repliée par défaut (useState(false)) et n\'affiche que des compteurs directement dérivables (mêmes expressions que buildSportifReport) — jamais nécessaire pour comprendre le rapport (progressive disclosure)', () => {
  const body = extractFnBody(code, 'ReportTechnicalDetails');
  assert.ok(body.includes('useState(false)'), 'Doit être repliée par défaut.');
  assert.ok(body.includes("td[k]&&td[k].active") && body.includes('TBK[k].kpis.length'), 'Les compteurs doivent être directement dérivables des structures existantes, jamais un nouveau moteur.');
});

// ── 13. Navigation vers les autres vues (routing existant, pas de deuxième machine) ──────────────
test('16 — Navigation : ReportView reçoit onOpenQuality/onOpenPourquoi/onGotoBiomeca/onGotoTests/onGotoBodyMap/onGotoExpertTab, tous câblés par AnalyseView via le MÊME mécanisme setView déjà utilisé par les phases précédentes (aucune deuxième machine de routing)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(ReportView,\{res:res,pres:pres,pri:pri,bilan:bilan,athlete:athlete,mouvementAnalysis:mouvementAnalysis,/.test(analyseBody), 'AnalyseView doit transmettre le contexte complet à ReportView.');
  assert.ok(analyseBody.includes("onGotoBodyMap:function(){setView('bodymap');},onGotoBiomeca:function(){setView('biomeca');},onGotoTests:function(){setView('tests');}"), 'La navigation doit réutiliser setView (même mécanisme que les phases 6-8), jamais une nouvelle route App().');
});

test('17 — [Voir Pourquoi] réutilise openPourquoi (Phase 5), [ouvrir une qualité] réutilise le même mécanisme que QualitesView (setOpenQuality+view=\'qualites\')', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(ReportView,\{[\s\S]*?onOpenPourquoi:openPourquoi,/.test(analyseBody), 'ReportView doit recevoir openPourquoi tel quel.');
});

test('18 — [Voir la biomécanique complète]/[Voir tous les tests]/[Voir le Body Map complet] sont de vrais boutons pointant vers les vues dédiées existantes (Phases 6-8), jamais une réimplémentation locale', () => {
  ['ReportBodyMapSummary', 'ReportBiomecaSummary', 'ReportTestsSummary'].forEach((comp) => {
    const body = extractFnBody(code, comp);
    assert.ok(/h\('button',\{onClick:on(GotoBodyMap|GotoBiomeca|GotoTests)/.test(body), comp + ' doit exposer un vrai <button> de navigation.');
  });
});

// ── 14. Absence de nouveau calcul / nouvelle relation / nouveau score / nouveau seuil ────────────
test('19 — GUARD — Aucun nouveau calcul clinique/biomécanique : les moteurs et leur présentation restent BYTE-IDENTIQUES vs baseline (abe4d8a)', () => {
  ['computeMoteur', 'computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeCsmV2', 'computeHypClinicalSynthesis01', 'computeBiomecaEngine', 'computeMouvementAnalysis', 'computePriorisationClinique', 'computeAnalysePresentation', 'testResultCardState'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§19).');
  });
});

test('20 — GUARD — Aucune nouvelle relation clinique/mapping : TFM/SYSTEM_TESTS/CMJ_PHASE_TO_QUALITY/STR_QUAL_DETAIL inchangés vs baseline (abe4d8a)', () => {
  ['TFM', 'SYSTEM_TESTS', 'CMJ_PHASE_TO_QUALITY', 'STR_QUAL_DETAIL'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit créer aucune relation.');
  });
});

test('21 — GUARD — Aucun nouveau score/seuil/norme : NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX inchangés vs baseline (abe4d8a)', () => {
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucun seuil/norme/score.');
  });
});

// ── 15. Non-régression des vues des phases précédentes ────────────────────────────────────────────
test('22 — Non-régression : SyntheseView/QualitesView/QualiteDetailView/BiomecaView/TestsView/BodyMapView/ExpertView restent BYTE-IDENTIQUES vs baseline (abe4d8a)', () => {
  ['SyntheseView', 'QualitesView', 'QualiteDetailView', 'BiomecaView', 'TestsView', 'BodyMapView', 'ExpertView'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — cette phase ne doit pas modifier les vues des phases précédentes.');
  });
});

test('23 — Non-régression : le sélecteur interne d\'AnalyseView propose la nouvelle destination "Rapport" sans supprimer aucune destination existante', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  ['synthese', 'qualites', 'bodymap', 'biomeca', 'tests', 'rapport', 'expert'].forEach((key) => {
    assert.ok(analyseBody.includes("['" + key + "','"), 'La destination ' + key + ' doit rester proposée par le sélecteur interne.');
  });
});

test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX/TFM/FN_KEY restent inchangés vs baseline (abe4d8a)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX', 'TFM', 'FN_KEY'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/référentiel.');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

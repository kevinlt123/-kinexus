// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 11 : QA final + polish UX
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : audit final + corrections P1/P2 UNIQUEMENT présentationnelles. AUCUNE modification
// clinique (HYP-XX-01, CSM V2, NORMS/NORMS_V2/THRESHOLDS, TFM, relations, functionScores,
// systemScores, clinicalSynthesis(V2), biomeca engines, mouvementAnalysis, raisonnementBoard,
// calculs de test/asymétrie/LSI/percentile, classifications, contenu PDF).
//
// Trois corrections appliquées, toutes purement présentationnelles :
//   P1 (§2 "Cohérence des statuts") — computeAnalysePresentation : riskLevel valait 'FAIBLE' dans
//       les deux branches du ternaire (pri.length?'FAIBLE':'FAIBLE'), donc un bilan SANS AUCUNE
//       donnée affichait "Risque global : FAIBLE" en vert — indiscernable d'un bilan réellement
//       propre. bilanHasRealData (déjà utilisée pour canValidate) distingue maintenant les deux cas :
//       "Non évalué" (neutre, C.muted) quand aucune donnée n'existe. Aucun recalcul de pri/norme/seuil.
//   P1 (§9 "Doublons") — Les Blocs 01-06 (résumé "Synthèse globale"/Body Map/Synthèse clinique)
//       n'étaient jamais masqués pour view==='qualites' (contrairement à bodymap/biomeca/tests/
//       rapport, chacun masqué dès sa propre vue dédiée livrée), dupliquant au-dessus de la grille
//       QualitesView (Phase 4) un contenu quasi identique. Masqué au même titre que les autres vues
//       dédiées — aucun contenu supprimé, seulement cette vue rejoint le pattern déjà établi.
//   P2 (§1 "Cohérence de la navigation") — Le sélecteur interne legacy (barre sous le contenu
//       Expert/Mouvement/Fil de Raisonnement/Historique) affichait "Expert" alors que la barre
//       secondaire persistante affiche "Analyse Expert" pour la même destination (view==='expert') —
//       harmonisé au même libellé, aucune clé/fonction renommée.
//
// BASELINE_COMMIT : 7996301 (Phase 10), strictement avant cette phase.

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

const BASELINE_COMMIT = '7996301';
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
const EXPORTS = "\nreturn {computeMoteur:computeMoteur,computeCsmV2:computeCsmV2,computeHypClinicalSynthesis01:computeHypClinicalSynthesis01,computeMouvementAnalysis:computeMouvementAnalysis,computePriorisationClinique:computePriorisationClinique,computeAnalysePresentation:computeAnalysePresentation,bilanHasRealData:bilanHasRealData,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,TFM:TFM,SC:SC,SBG:SBG,SL:SL,buildSportifReport:buildSportifReport,buildExpertReport:buildExpertReport};";
const sandbox = new Function('localStorage', sandboxSrc + EXPORTS)({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + EXPORTS)({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 11 : QA final + polish UX');

// ── 1. Navigation globale ──────────────────────────────────────────────────────────────────────
test('1 — Navigation globale (Accueil/Athlètes/Bilans/Analyse/Données) inchangée par cette phase', () => {
  const appBody = extractFnBody(code, 'App');
  ['Accueil', 'Athlètes', 'Bilans', 'Analyse', 'Données'].forEach((label) => {
    assert.ok(appBody.includes("'" + label + "'") || code.includes("'" + label + "'"), 'Le libellé global ' + label + ' doit rester présent.');
  });
});

// ── 2. Navigation secondaire ────────────────────────────────────────────────────────────────────
test('2 — SECONDARY_NAV (barre secondaire persistante) reste byte-identique vs baseline Phase 10 (7996301)', () => {
  const extractNav = (s) => extractFnBody(s, 'App').match(/var SECONDARY_NAV=\[([\s\S]*?)\];/)[1];
  assert.strictEqual(extractNav(code), extractNav(baseCode), 'SECONDARY_NAV ne doit pas changer en Phase 11 (polish uniquement, pas de nouvelle route).');
});

// ── 3. Synthèse ─────────────────────────────────────────────────────────────────────────────────
test('3 — SyntheseView reste byte-identique vs baseline Phase 10 (non concernée par les corrections)', () => {
  assert.strictEqual(extractFnBody(code, 'SyntheseView'), extractFnBody(baseCode, 'SyntheseView'), 'SyntheseView ne doit pas changer.');
});

// ── 4. Qualités ─────────────────────────────────────────────────────────────────────────────────
test('4 — QualitesView/QualiteDetailView restent byte-identiques ; seule la visibilité des Blocs 01-06 (AnalyseView) change pour view===\'qualites\'', () => {
  assert.strictEqual(extractFnBody(code, 'QualitesView'), extractFnBody(baseCode, 'QualitesView'), 'QualitesView ne doit pas changer.');
  assert.strictEqual(extractFnBody(code, 'QualiteDetailView'), extractFnBody(baseCode, 'QualiteDetailView'), 'QualiteDetailView ne doit pas changer.');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/view!=='synthese'&&view!=='bodymap'&&view!=='biomeca'&&view!=='tests'&&view!=='rapport'&&view!=='qualites'&&h\('div',null,/.test(analyseBody), 'Les Blocs 01-06 doivent désormais être masqués aussi pour view===\'qualites\' (correctif P1 duplication).');
});

// ── 5. Pourquoi ─────────────────────────────────────────────────────────────────────────────────
test('5 — PourquoiView et openPourquoi restent byte-identiques (niveaux de preuve/sémantique inchangés)', () => {
  assert.strictEqual(extractFnBody(code, 'PourquoiView'), extractFnBody(baseCode, 'PourquoiView'), 'PourquoiView ne doit pas changer.');
  const openPourquoi = (s) => extractFnBody(s, 'AnalyseView').match(/function openPourquoi\(fq\)\{[^}]*\}/)[0];
  assert.strictEqual(openPourquoi(code), openPourquoi(baseCode), 'openPourquoi doit rester byte-identique.');
});

// ── 6. Biomécanique ─────────────────────────────────────────────────────────────────────────────
test('6 — BiomecaView reste byte-identique (aucune duplication avec Synthèse constatée, non modifiée)', () => {
  assert.strictEqual(extractFnBody(code, 'BiomecaView'), extractFnBody(baseCode, 'BiomecaView'), 'BiomecaView ne doit pas changer.');
});

// ── 7. Tests ────────────────────────────────────────────────────────────────────────────────────
test('7 — TestsView/TestResultDetail restent byte-identiques ; un test non réalisé n\'affiche jamais un statut positif', () => {
  assert.strictEqual(extractFnBody(code, 'TestsView'), extractFnBody(baseCode, 'TestsView'), 'TestsView ne doit pas changer.');
  const testsBody = extractFnBody(code, 'TestsView');
  assert.ok(testsBody.includes('Non réalisé'), 'Un test non actif doit rester explicitement marqué "Non réalisé".');
});

// ── 8. Body Map ─────────────────────────────────────────────────────────────────────────────────
test('8 — BodyMapView/BodyMapStructureDetail restent byte-identiques ; repli explicite "Pas de donnée disponible" toujours présent (jamais "Optimal" par défaut)', () => {
  assert.strictEqual(extractFnBody(code, 'BodyMapView'), extractFnBody(baseCode, 'BodyMapView'), 'BodyMapView ne doit pas changer.');
  assert.strictEqual(extractFnBody(code, 'BodyMapStructureDetail'), extractFnBody(baseCode, 'BodyMapStructureDetail'), 'BodyMapStructureDetail ne doit pas changer.');
  assert.ok(code.includes("function bodyMapStatusLabel(status){return status?SL[status]:'Pas de donnée disponible';}"), 'bodyMapStatusLabel doit toujours replier sur "Pas de donnée disponible", jamais un statut inventé.');
});

// ── 9. Rapport ──────────────────────────────────────────────────────────────────────────────────
test('9 — ReportView reste byte-identique ; onDownloadPdf toujours câblé sur props.onPreview (PDF atteignable depuis le Rapport)', () => {
  assert.strictEqual(extractFnBody(code, 'ReportView'), extractFnBody(baseCode, 'ReportView'), 'ReportView ne doit pas changer.');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(ReportView,\{[\s\S]*?onDownloadPdf:props\.onPreview\}\)/.test(analyseBody), 'ReportView doit conserver onDownloadPdf:props.onPreview.');
});

// ── 10. Analyse Expert ──────────────────────────────────────────────────────────────────────────
test('10 — ExpertView reste byte-identique ; le libellé interne "Expert" devient "Analyse Expert" (harmonisation), sans renommage de la clé de vue ni de fonction', () => {
  assert.strictEqual(extractFnBody(code, 'ExpertView'), extractFnBody(baseCode, 'ExpertView'), 'ExpertView ne doit pas changer.');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes("['expert','Analyse Expert']"), 'Le libellé interne doit désormais afficher "Analyse Expert".');
  assert.ok(!analyseBody.includes("['expert','Expert']"), 'L\'ancien libellé "Expert" ne doit plus apparaître pour cette destination.');
  assert.ok(analyseBody.includes("onClick:function(){setView(v[0]);}"), 'La clé de vue (\'expert\') et son handler setView restent inchangés — seul le texte affiché change.');
});

// ── 11. États vides ─────────────────────────────────────────────────────────────────────────────
test('11 — Un bilan sans aucune donnée affiche explicitement "Non évalué"/"Aucune donnée disponible pour ce bilan" (jamais un écran vide ni un risque "FAIBLE" trompeur)', () => {
  const sandboxTest = new Function('localStorage', sandboxSrc + "\nreturn {computeMoteur:computeMoteur,computeAnalysePresentation:computeAnalysePresentation};")({ _d: {}, getItem() { return null; }, setItem() {} });
  const emptyRes = sandboxTest.computeMoteur({}, {}, null, 30, {});
  const emptyBilan = { id: 1, date: new Date().toISOString(), testData: {}, questData: {} };
  const athlete = { id: 1, prenom: 'X', nom: 'Y', bilans: [emptyBilan] };
  const pres = sandboxTest.computeAnalysePresentation(emptyBilan, athlete, 25, emptyRes);
  assert.strictEqual(pres.riskLevel, 'Non évalué', 'Un bilan sans donnée doit afficher "Non évalué", jamais "FAIBLE".');
  assert.strictEqual(pres.riskSub, 'Aucune donnée disponible pour ce bilan', 'Le sous-texte doit expliciter l\'absence de donnée, jamais "Aucun facteur limitant identifié" (trompeur).');
});

// ── 12. États non déterminables ─────────────────────────────────────────────────────────────────
test('12 — Badge() ne rend jamais rien quand status est null/undefined (jamais un statut par défaut positif)', () => {
  assert.ok(code.includes('function Badge(props){\n  if(!props.status)return null;'), 'Badge doit retourner null pour un status absent — jamais un badge par défaut.');
});

// ── 13. Absence de faux positif ─────────────────────────────────────────────────────────────────
test('13 — Un bilan réellement propre (données présentes, pri vide) garde "FAIBLE" en vert ; seule l\'absence TOTALE de donnée bascule sur "Non évalué"', () => {
  const sandboxTest = new Function('localStorage', sandboxSrc + "\nreturn {computeAnalysePresentation:computeAnalysePresentation,C:C};")({ _d: {}, getItem() { return null; }, setItem() {} });
  const cleanRes = { functionScores: { Mobilité: { status: 'vert' } }, priorities: [] };
  const cleanBilan = { id: 1, date: new Date().toISOString(), testData: { wblt: { active: true, D: { trials: { distance: [55] } }, G: { trials: { distance: [56] } } } }, questData: {} };
  const athlete = { id: 1, prenom: 'X', nom: 'Y', bilans: [cleanBilan] };
  const pres = sandboxTest.computeAnalysePresentation(cleanBilan, athlete, 25, cleanRes);
  assert.strictEqual(pres.riskLevel, 'FAIBLE', 'Un bilan avec données réelles et 0 priorité doit rester "FAIBLE" (pas de régression du cas réellement propre).');
  assert.strictEqual(pres.riskCol, sandboxTest.C.vert, 'La couleur doit rester verte pour un bilan réellement propre.');
});

// ── 14. Navigation imbriquée ────────────────────────────────────────────────────────────────────
test('14 — Rapport → Qualité → Pourquoi reste possible via les mêmes callbacks (onOpenQuality/onOpenPourquoi) déjà câblés en Phase 9/10, aucun nouveau niveau de routing', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(ReportView,\{[\s\S]{0,300}?onOpenQuality:function\(f\)\{setOpenQuality\(f\);setView\('qualites'\);\}/.test(analyseBody), 'ReportView doit toujours pouvoir ouvrir une qualité via le mécanisme existant.');
  assert.ok(/h\(ReportView,\{[\s\S]{0,400}?onOpenPourquoi:openPourquoi/.test(analyseBody), 'ReportView doit toujours pouvoir ouvrir Pourquoi via openPourquoi (même callback partout).');
});

// ── 15. Conservation du contexte ────────────────────────────────────────────────────────────────
test('15 — goToTest/openQuality/pourquoiQuality restent des states locaux à AnalyseView (mêmes athlete/bilan/res transmis tels quels, jamais rechargés)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes('function goToTest(tk){setTestsSelectedTest(tk);setView(\'tests\');}'), 'goToTest doit rester le seul mécanisme de présélection de test.');
  assert.ok(!/computeMoteur\(/.test(analyseBody.replace(/\/\/[^\n]*/g, '')) || analyseBody.match(/computeMoteur\(/g).length <= (baseCode.includes('AnalyseView') ? countOccurrences(extractFnBody(baseCode, 'AnalyseView'), 'computeMoteur(') : 0) + 1, 'Aucun nouveau recalcul computeMoteur ne doit être introduit dans AnalyseView.');
});

// ── 16. Cohérence des statuts ───────────────────────────────────────────────────────────────────
test('16 — SC/SBG/SL restent la SEULE table couleur/libellé de statut (deep-equal vs baseline), jamais une nouvelle couleur ou un nouveau libellé clinique introduit', () => {
  assert.deepStrictEqual(sandbox.SC, baseSandbox.SC, 'SC (couleurs de statut) ne doit pas changer.');
  assert.deepStrictEqual(sandbox.SBG, baseSandbox.SBG, 'SBG (fonds de statut) ne doit pas changer.');
  assert.deepStrictEqual(sandbox.SL, baseSandbox.SL, 'SL (libellés de statut vert/jaune/orange/rouge) ne doit pas changer.');
});

// ── 17. Cohérence des libellés ──────────────────────────────────────────────────────────────────
test('17 — "Non évalué" (FunctionGaugeCard, demande praticien validée) et "Non déterminable" (QualityCard/Badge) restent deux libellés INTENTIONNELLEMENT distincts pour deux nuances différentes — aucun des deux renommé par cette phase', () => {
  assert.ok(code.includes("status?col:C.muted,fontWeight:800,fontSize:11,letterSpacing:'0.02em',marginTop:2,marginBottom:7,textAlign:'center'}},status?SL[status]:'Non évalué')"), 'FunctionGaugeCard doit garder "Non évalué" (validé praticien, mission_qualites_display_redesign).');
  assert.ok(code.includes("status?SL[status]:'Non déterminable'"), 'QualityCard doit garder "Non déterminable".');
});

// ── 18. Boutons Rapport ─────────────────────────────────────────────────────────────────────────
test('18 — Les 4 onGotoRapport (Phase 10) restent inchangés (setView(\'rapport\')) ; cette phase ne les retouche pas', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.strictEqual((analyseBody.match(/onGotoRapport:function\(\)\{setView\('rapport'\);\}/g) || []).length, 4, 'Les 4 sites onGotoRapport doivent rester câblés vers ReportView.');
});

// ── 19. selectedTest ────────────────────────────────────────────────────────────────────────────
test('19 — testsSelectedTest/goToTest (Phase 10) restent inchangés par cette phase (aucun second mécanisme introduit)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const baseAnalyseBody = extractFnBody(baseCode, 'AnalyseView');
  const extractGoToTest = (s) => s.match(/var \[testsSelectedTest,setTestsSelectedTest\]=useState\(null\);\n  function goToTest\(tk\)\{setTestsSelectedTest\(tk\);setView\('tests'\);\}/);
  assert.ok(extractGoToTest(analyseBody), 'goToTest doit rester présent tel quel.');
  assert.ok(extractGoToTest(baseAnalyseBody), 'Pré-requis : goToTest devait déjà exister dans la baseline Phase 10.');
});

// ── 20. selectedQuality ─────────────────────────────────────────────────────────────────────────
test('20 — openQuality/setOpenQuality (Phase 4) restent inchangés par cette phase', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes("var [openQuality,setOpenQuality]=useState(null);"), 'openQuality doit rester le seul state de sélection de qualité.');
});

// ── 21. Responsive ──────────────────────────────────────────────────────────────────────────────
test('21 — Aucune largeur fixe (px) introduite par les corrections Phase 11 (uniquement des changements de logique JS/texte, pas de style ajouté)', () => {
  const OLD_RISK = "  // Risque global : dérivé de la sévérité des priorités d'intervention (aucun chiffre inventé).\n  var riskLevel=pri.some(function(p){return p.status==='rouge';})?'ÉLEVÉ':pri.some(function(p){return p.status==='orange';})?'MODÉRÉ':pri.length?'FAIBLE':'FAIBLE';";
  assert.ok(extractFnBody(baseCode, 'computeAnalysePresentation').includes(OLD_RISK), 'Pré-requis : ancien bloc riskLevel attendu dans la baseline.');
  assert.ok(!/width:\d+px/.test(extractFnBody(code, 'computeAnalysePresentation')), 'computeAnalysePresentation ne doit contenir aucune largeur fixe (fonction de calcul pure, pas de style).');
});

// ── 22. Accessibilité ───────────────────────────────────────────────────────────────────────────
test('22 — Les boutons du sélecteur interne (libellé harmonisé "Analyse Expert") restent de vrais <button> natifs, focusables/activables au clavier', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/map\(function\(v\)\{return h\('button',\{key:v\[0\],onClick:function\(\)\{setView\(v\[0\]\);\}/.test(analyseBody), 'Le sélecteur interne doit continuer à générer de vrais <button>.');
});

// ── 23. Absence d'erreur JS ─────────────────────────────────────────────────────────────────────
test('23 — Syntaxe globale valide (le fichier complet s\'évalue sans erreur de syntaxe) après les 3 corrections de cette phase', () => {
  assert.doesNotThrow(() => { new Function(sandboxSrc); }, 'Le bloc moteur/présentation doit rester syntaxiquement valide.');
});

// ── 24. Absence de route parallèle ──────────────────────────────────────────────────────────────
test('24 — Aucune nouvelle route App()/second routeur introduit : App() reste byte-identique vs baseline Phase 10', () => {
  assert.strictEqual(extractFnBody(code, 'App'), extractFnBody(baseCode, 'App'), 'App() (screen/secondaryView/navNonce/SECONDARY_NAV/goSecondary) ne doit pas changer — toutes les corrections Phase 11 vivent dans AnalyseView/computeAnalysePresentation.');
});

// ── GUARDS cliniques (non-régression stricte) ──────────────────────────────────────────────────
test('GUARD — computeMoteur/computeCsmV2/computeHypClinicalSynthesis01/computeMouvementAnalysis/computePriorisationClinique restent BYTE-IDENTIQUES vs baseline (7996301)', () => {
  ['computeMoteur', 'computeCsmV2', 'computeHypClinicalSynthesis01', 'computeMouvementAnalysis', 'computePriorisationClinique'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette phase (QA + polish uniquement).');
  });
});
test('GUARD — NORMS/NORMS_V2/THRESHOLDS/TFM restent deep-equal vs baseline (7996301)', () => {
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'TFM'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — interdit par cette phase.');
  });
});
test('GUARD — buildSportifReport/buildExpertReport (contenu PDF) restent BYTE-IDENTIQUES vs baseline (7996301)', () => {
  assert.strictEqual(extractFnBody(code, 'buildSportifReport'), extractFnBody(baseCode, 'buildSportifReport'), 'buildSportifReport ne doit pas changer.');
  assert.strictEqual(extractFnBody(code, 'buildExpertReport'), extractFnBody(baseCode, 'buildExpertReport'), 'buildExpertReport ne doit pas changer.');
});
test('GUARD — computeAnalysePresentation ne diffère de la baseline (7996301) QUE par la correction riskLevel/riskCol/riskSub (P1 §2) — rien d\'autre', () => {
  const OLD = "  // Risque global : dérivé de la sévérité des priorités d'intervention (aucun chiffre inventé).\n  var riskLevel=pri.some(function(p){return p.status==='rouge';})?'ÉLEVÉ':pri.some(function(p){return p.status==='orange';})?'MODÉRÉ':pri.length?'FAIBLE':'FAIBLE';\n  var riskCol=riskLevel==='ÉLEVÉ'?C.rouge:riskLevel==='MODÉRÉ'?C.orange:C.vert;\n  var riskSub=pri.length===0?'Aucun facteur limitant identifié':pri.length===1?'1 facteur limitant identifié':pri.length+' facteurs limitants identifiés';";
  const NEW = "  // Risque global : dérivé de la sévérité des priorités d'intervention (aucun chiffre inventé).\n  // CORRECTIF (Mission UX/UI V1, Phase 11, §2) : pri.length?'FAIBLE':'FAIBLE' renvoyait la même\n  // valeur dans les deux branches — un bilan sans AUCUNE donnée (pri vide faute de mesure, jamais\n  // faute de déficit) affichait \"FAIBLE\" en vert, indiscernable d'un bilan réellement propre.\n  // bilanHasRealData (déjà utilisé plus bas pour canValidate) distingue les deux cas sans recalcul\n  // clinique : \"Non évalué\" (neutre, jamais positif) quand aucune donnée n'existe.\n  var hasRealData=bilanHasRealData(bilan.testData||{});\n  var riskLevel=!hasRealData?'Non évalué':pri.some(function(p){return p.status==='rouge';})?'ÉLEVÉ':pri.some(function(p){return p.status==='orange';})?'MODÉRÉ':'FAIBLE';\n  var riskCol=!hasRealData?C.muted:riskLevel==='ÉLEVÉ'?C.rouge:riskLevel==='MODÉRÉ'?C.orange:C.vert;\n  var riskSub=!hasRealData?'Aucune donnée disponible pour ce bilan':pri.length===0?'Aucun facteur limitant identifié':pri.length===1?'1 facteur limitant identifié':pri.length+' facteurs limitants identifiés';";
  const base = extractFnBody(baseCode, 'computeAnalysePresentation');
  assert.ok(base.includes(OLD), 'Pré-requis : bloc riskLevel attendu absent de la baseline (test à corriger).');
  assert.strictEqual(extractFnBody(code, 'computeAnalysePresentation'), base.replace(OLD, NEW), 'computeAnalysePresentation contient un changement au-delà de la correction P1 du riskLevel.');
});
test('GUARD — AnalyseView ne diffère de la baseline (7996301) QUE par : (a) le masquage des Blocs 01-06 pour view===\'qualites\' (P1 §9), (b) le libellé "Expert"->"Analyse Expert" (P2 §1) — rien d\'autre', () => {
  const OLD_MASK = "      // 'rapport' (Mission UX/UI V1, Phase 9) masqué au même titre que les autres vues dédiées.\n      view!=='synthese'&&view!=='bodymap'&&view!=='biomeca'&&view!=='tests'&&view!=='rapport'&&h('div',null,";
  const NEW_MASK = "      // 'rapport' (Mission UX/UI V1, Phase 9) masqué au même titre que les autres vues dédiées.\n      // 'qualites' (Mission UX/UI V1, Phase 11, §9 \"Doublons\") : CORRECTIF — cet oubli de la Phase 4\n      // faisait apparaître les Blocs 01-06 (dont un résumé \"Synthèse globale\"/Body Map/Synthèse\n      // clinique quasi identique) AU-DESSUS de la grille QualitesView, dupliquant son propre contenu.\n      // Masqué au même titre que les autres vues dédiées ci-dessus, aucun changement de contenu.\n      view!=='synthese'&&view!=='bodymap'&&view!=='biomeca'&&view!=='tests'&&view!=='rapport'&&view!=='qualites'&&h('div',null,";
  const OLD_LABEL = "border:'1px solid '+C.border,marginBottom:16,width:'fit-content',flexWrap:'wrap'}},\n        (mouvementAnalysis?[['synthese','Synthèse'],['qualites','Qualités'],['bodymap','Body Map'],['biomeca','Biomécanique'],['tests','Tests'],['rapport','Rapport'],['expert','Expert'],['mouvement','Mouvement'],['raisonnementClinique','Fil de Raisonnement'],['historique','Historique']]:[['synthese','Synthèse'],['qualites','Qualités'],['bodymap','Body Map'],['tests','Tests'],['rapport','Rapport'],['expert','Expert'],['historique','Historique']]";
  const NEW_LABEL = "border:'1px solid '+C.border,marginBottom:16,width:'fit-content',flexWrap:'wrap'}},\n        // Libellé 'Expert' -> 'Analyse Expert' (Mission UX/UI V1, Phase 11, §1 \"Cohérence de la\n        // navigation\") : CORRECTIF cosmétique — cette même destination (view==='expert') était déjà\n        // nommée \"Analyse Expert\" par la barre secondaire persistante (SECONDARY_NAV) ; seul le\n        // libellé change ici, aucune clé/route/fonction renommée.\n        (mouvementAnalysis?[['synthese','Synthèse'],['qualites','Qualités'],['bodymap','Body Map'],['biomeca','Biomécanique'],['tests','Tests'],['rapport','Rapport'],['expert','Analyse Expert'],['mouvement','Mouvement'],['raisonnementClinique','Fil de Raisonnement'],['historique','Historique']]:[['synthese','Synthèse'],['qualites','Qualités'],['bodymap','Body Map'],['tests','Tests'],['rapport','Rapport'],['expert','Analyse Expert'],['historique','Historique']]";
  let base = extractFnBody(baseCode, 'AnalyseView');
  assert.ok(base.includes(OLD_MASK), 'Pré-requis : ancien masquage des Blocs 01-06 attendu dans la baseline.');
  assert.ok(base.includes(OLD_LABEL), 'Pré-requis : ancien libellé "Expert" attendu dans la baseline.');
  const reconstructed = base.replace(OLD_MASK, NEW_MASK).replace(OLD_LABEL, NEW_LABEL);
  assert.strictEqual(extractFnBody(code, 'AnalyseView'), reconstructed, 'AnalyseView contient un changement au-delà des 2 corrections P1/P2 documentées ci-dessus.');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

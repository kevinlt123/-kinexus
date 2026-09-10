// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 3 : nouvel écran Synthèse clinique (écran principal du bilan)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : extraction/repositionnement/hiérarchisation des informations déjà produites par
// AnalyseView/ExpertView dans une nouvelle vue SyntheseView (screen 'analyse', view 'synthese').
// Couche de présentation uniquement — computeMoteur/computeCsmV2/HYP/NORMS/THRESHOLDS ne sont pas
// modifiés (vérifié par guards ci-dessous + snapshot clinique avant/après, voir rapport de phase).
//
// BASELINE_COMMIT : f8d623b (Phase 2), strictement avant cette phase.

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

const BASELINE_COMMIT = 'f8d623b';
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

const sandbox = new Function(
  'localStorage',
  code.slice(code.indexOf('var C={'), code.indexOf("ReactDOM.createRoot(document.getElementById('root'))")) +
  "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLE_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};"
)({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function(
  'localStorage',
  baseCode.slice(baseCode.indexOf('var C={'), baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))")) +
  "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLE_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};"
)({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 3 : Synthèse clinique (nouvel écran principal du bilan)');

// ── 1. Accessibilité / atterrissage par défaut ──────────────────────────────────────────────────
test('1 — SyntheseView est définie et App() en fait la cible de la barre secondaire "Synthèse"', () => {
  assert.ok(code.includes('function SyntheseView(props){'), 'SyntheseView introuvable.');
  const appBody = extractFnBody(code, 'App');
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable.');
  assert.ok(/\{key:'synthese',label:'Synthèse',target:\{screen:'analyse',view:'synthese'\}\}/.test(m[1]), 'La destination "Synthèse" de la barre secondaire doit cibler view:\'synthese\' (SyntheseView), pas un onglet d\'ExpertView.');
});

test('2 — À l\'ouverture d\'un bilan (App), secondaryView est initialisé à \'synthese\' et le seed initialView correspondant est bien transmis à AnalyseView', () => {
  const appBody = extractFnBody(code, 'App');
  assert.ok(/var \[secondaryView,setSecondaryView\]=useState\('synthese'\);/.test(appBody), 'secondaryView doit démarrer sur \'synthese\'.');
  assert.ok(/initialView:secondaryTarget\.view/.test(appBody), 'AnalyseView doit recevoir initialView dérivé de secondaryTarget.');
});

test('3 — AnalyseView route bien view===\'synthese\' vers SyntheseView', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/view==='synthese'&&h\(SyntheseView,\{/.test(analyseBody), 'AnalyseView doit rendre SyntheseView pour view===\'synthese\'.');
});

// ── 2. Les 8 qualités (Profil global) ────────────────────────────────────────────────────────────
test('4 — SyntheseView affiche le Profil global via FunctionGaugeCard, sur pres.evFns (dérivé de res.functionScores, DISPLAYED_FUNCTIONS) — jamais un nouveau statut', () => {
  const body = extractFnBody(code, 'SyntheseView');
  assert.ok(/h\(FunctionGaugeCard,\{key:f,label:f,sc:res\.functionScores\[f\]\}\)/.test(body), 'Le profil global doit utiliser FunctionGaugeCard avec le statut déjà calculé (res.functionScores[f]).');
  assert.ok(/pres\.evFns\.map/.test(body), 'Le profil global doit itérer sur pres.evFns (dérivé pur, computeAnalysePresentation).');
});

// ── 3. Distinction déficitaire / suspectée / non déterminable ───────────────────────────────────
test('5 — Ce qui ressort utilise CsmObjectifiedCard (csm.objectified) ET CsmSuspectedCard (csm.suspected) séparément — jamais fusionnés', () => {
  const body = extractFnBody(code, 'SyntheseView');
  assert.ok(/h\(CsmObjectifiedCard,\{res:res\}\)/.test(body), 'CsmObjectifiedCard manquant dans "Ce qui ressort".');
  assert.ok(/h\(CsmSuspectedCard,\{res:res\}\)/.test(body), 'CsmSuspectedCard manquant dans "Ce qui ressort".');
});

test('6 — CsmObjectifiedCard lit exclusivement csm.objectified, CsmSuspectedCard exclusivement csm.suspected (aucun mélange)', () => {
  const objBody = extractFnBody(code, 'CsmObjectifiedCard');
  const susBody = extractFnBody(code, 'CsmSuspectedCard');
  assert.ok(objBody.includes('csm.objectified'), 'CsmObjectifiedCard doit lire csm.objectified.');
  assert.ok(!/csm\.suspected|csm\.nonDeterminable/.test(objBody), 'CsmObjectifiedCard ne doit jamais lire csm.suspected/nonDeterminable.');
  assert.ok(susBody.includes('csm.suspected'), 'CsmSuspectedCard doit lire csm.suspected.');
  assert.ok(!/csm\.objectified|csm\.nonDeterminable/.test(susBody), 'CsmSuspectedCard ne doit jamais lire csm.objectified/nonDeterminable.');
});

test('7 — Limites/données manquantes affiche CsmNonDeterminableCard (csm.nonDeterminable), distinct des deux précédentes', () => {
  const body = extractFnBody(code, 'SyntheseView');
  assert.ok(/h\(CsmNonDeterminableCard,\{res:res\}\)/.test(body), 'CsmNonDeterminableCard manquant dans "Limites / données manquantes".');
  const ndBody = extractFnBody(code, 'CsmNonDeterminableCard');
  assert.ok(ndBody.includes('csm.nonDeterminable'), 'CsmNonDeterminableCard doit lire csm.nonDeterminable.');
  assert.ok(!/csm\.objectified|csm\.suspected/.test(ndBody), 'CsmNonDeterminableCard ne doit jamais lire csm.objectified/suspected.');
});

// ── 4. Priorités : ordre respecté, aucun ranking inventé ────────────────────────────────────────
test('8 — Priorités (Section 3) délègue à PriorityOrientationCards(pri,res), sans nouveau tri ni rang numéroté', () => {
  const body = extractFnBody(code, 'SyntheseView');
  assert.ok(/h\(PriorityOrientationCards,\{pri:pri,res:res\}\)/.test(body), 'La section Priorités doit utiliser PriorityOrientationCards avec pri tel quel (res.priorities), sans nouveau tri.');
  const pocBody = extractFnBody(code, 'PriorityOrientationCards');
  assert.ok(!/\.sort\(/.test(pocBody), 'PriorityOrientationCards ne doit introduire aucun nouveau tri (l\'ordre vient de pri/split, déjà calculés).');
  assert.ok(pocBody.includes('priHypObjectifiedSplit(pri,res.clinicalSynthesis)'), 'Doit réutiliser priHypObjectifiedSplit tel quel (aucun nouveau système de ranking).');
});

// ── 5. Relations : jamais transformées en causalité ─────────────────────────────────────────────
test('9 — Relations/cohérences distingue explanatoryHypotheses (relation documentée) et concordances (level===\'concordant_no_relation\'), jamais fusionnées', () => {
  const body = extractFnBody(code, 'CsmRelationsCards');
  assert.ok(body.includes('csm.explanatoryHypotheses'), 'CsmRelationsCards doit lire csm.explanatoryHypotheses.');
  assert.ok(body.includes("r.level==='concordant_no_relation'"), 'Les concordances doivent rester filtrées sur level===\'concordant_no_relation\' (registre distinct), jamais un texte causal inventé.');
});

// ── 6. Aucun recalcul clinique introduit dans l'UI ───────────────────────────────────────────────
test('10 — SyntheseView ne calcule aucun statut/seuil/relation : elle ne fait qu\'appeler computeAnalysePresentation et lire res/pri déjà fournis en props', () => {
  const body = extractFnBody(code, 'SyntheseView');
  assert.ok(!/computeMoteur\(|computeCsmV2\(|applyThr\(|computeStatusWithNormsV2\(/.test(body), 'SyntheseView ne doit appeler aucune fonction de calcul clinique — seulement lire res/pres/pri déjà fournis.');
});

test('11 — computeAnalysePresentation est une extraction pure : BYTE-IDENTIQUE (à la déclaration de fonction près) au bloc qui vivait dans AnalyseView avant cette phase', () => {
  const fnBody = extractFnBody(code, 'computeAnalysePresentation');
  // Vérifie que chaque expression clé du bloc original (baseline Phase 2, où ce calcul vivait
  // encore inline dans AnalyseView) est reprise à l'identique dans la nouvelle fonction partagée.
  const baseAnalyseBody = extractFnBody(baseCode, 'AnalyseView');
  [
    "var testsCnt=Object.keys(td).filter(function(k){return td[k]&&td[k].active;}).length;",
    "var canValidate=bilanHasRealData(td);",
    "var forces=evFns.filter(function(f){return fSc[f].status==='vert';});",
    "var causalSteps=buildMultiQualityNarrative(pri).causalSteps;"
  ].forEach((expr) => {
    assert.ok(baseAnalyseBody.includes(expr), 'Pré-requis : expression attendue absente de la baseline (test à corriger).');
    assert.ok(fnBody.includes(expr), 'computeAnalysePresentation doit reprendre littéralement : ' + expr);
  });
});

test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX restent inchangés (byte-identique / deep-equal) vs baseline (f8d623b)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil.');
  });
});

test('GUARD — Les moteurs HYP-CSM-01/CSM V2 (computeHypClinicalSynthesis01, computeCsmV2) restent BYTE-IDENTIQUES vs baseline (f8d623b)', () => {
  ['computeHypClinicalSynthesis01', 'computeCsmV2'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§9).');
  });
});

// ── 7. Navigation vers les autres vues ──────────────────────────────────────────────────────────
test('12 — SyntheseView expose des boutons de navigation vers Analyse Expert et le Rapport, qui restent internes à AnalyseView (aucune nouvelle route App() introduite)', () => {
  const synthBody = extractFnBody(code, 'SyntheseView');
  assert.ok(/onGotoExpertTab/.test(synthBody), 'SyntheseView doit exposer un point de navigation vers Expert (onGotoExpertTab).');
  assert.ok(/onGotoRapport/.test(synthBody), 'SyntheseView doit exposer un point de navigation vers le Rapport (onGotoRapport).');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/onGotoExpertTab:function\(tab\)\{setExpertTabTarget\(tab\);setView\('expert'\);\}/.test(analyseBody), 'onGotoExpertTab doit rester une navigation interne à AnalyseView (setView), sans nouvelle route App().');
  assert.ok(/onGotoRapport:props\.onPreview/.test(analyseBody), 'onGotoRapport doit réutiliser props.onPreview déjà câblé par App() (aucun nouveau chemin).');
});

// ── 8. Aucune duplication critique ───────────────────────────────────────────────────────────────
test('13 — Les blocs 01-06 d\'AnalyseView sont masqués pour view===\'synthese\' (pas de double affichage avec SyntheseView)', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/view!=='synthese'&&h\('div',null,/.test(analyseBody), 'Les blocs 01-06 doivent être conditionnés à view!==\'synthese\'.');
});

test('14 — ExpertView délègue (ne duplique pas) le rendu de l\'onglet Synthèse clinique/Orientations aux composants partagés réutilisés par SyntheseView', () => {
  const expertBody = extractFnBody(code, 'ExpertView');
  assert.ok(expertBody.includes("tab==='synthese'&&(!res.clinicalSynthesis?"), 'ExpertView doit conditionner l\'onglet Synthèse clinique sur res.clinicalSynthesis, comme avant.');
  assert.ok(expertBody.includes('h(CsmObjectifiedCard,{res:res})') && expertBody.includes('h(CsmSuspectedCard,{res:res})') && expertBody.includes('h(CsmNonDeterminableCard,{res:res})') && expertBody.includes('h(CsmRelationsCards,{res:res})') && expertBody.includes('h(CsmLimitationsCard,{res:res})'), 'ExpertView doit déléguer l\'onglet Synthèse clinique aux 5 cartes partagées (pas de JSX inline dupliqué).');
  assert.ok(!/csm\.objectified\.map|csm\.suspected\.map|csm\.nonDeterminable\.map/.test(expertBody), 'ExpertView ne doit plus contenir de rendu inline dupliqué de ces listes (doit passer par les composants partagés).');
  assert.ok(/tab==='orientations'&&h\(PriorityOrientationCards,\{pri:pri,res:res\}\)/.test(expertBody), 'ExpertView doit déléguer l\'onglet Orientations à PriorityOrientationCards (pas de JSX inline dupliqué).');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

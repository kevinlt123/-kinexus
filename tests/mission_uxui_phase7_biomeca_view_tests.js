// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 7 : Biomécanique interactive (vue dédiée "comment le mouvement est
// organisé")
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : BiomecaView + BiomecaHero/BiomecaOrganizationCard/BiomecaPhaseProfile/
// BiomecaLimitingPhaseCard/BiomecaResponsibleVariables/BiomecaCoherenceCard/BiomecaWorkAxes/
// BiomecaDataTechnique/BiomecaPhaseCycleStrip (extrait de MouvementView). Couche de présentation
// uniquement — le moteur biomécanique existant (computeBiomecaEngine/computeCoherenceEngine/
// computeSyntheseBiomecanique/computeMoteurRaisonnementBiomecanique/computePriorisationClinique/
// computeMouvementAnalysis) n'est pas modifié, ni HYP/CSM V2/NORMS/THRESHOLDS (vérifié par guards
// ci-dessous + snapshot clinique avant/après, voir rapport de phase).
//
// BASELINE_COMMIT : 7052dcd (Phase 6), strictement avant cette phase.

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

const BASELINE_COMMIT = '7052dcd';
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
const sandbox = new Function('localStorage', sandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,CMJ_PHASES:CMJ_PHASES,CMJ_PHASE_LABEL:CMJ_PHASE_LABEL,CMJ_PHASE_TO_QUALITY:CMJ_PHASE_TO_QUALITY,CMJ_VAR_META:CMJ_VAR_META};")({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,CMJ_PHASES:CMJ_PHASES,CMJ_PHASE_LABEL:CMJ_PHASE_LABEL,CMJ_PHASE_TO_QUALITY:CMJ_PHASE_TO_QUALITY,CMJ_VAR_META:CMJ_VAR_META};")({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 7 : Biomécanique interactive');

// ── 1. Route Biomécanique : vraie vue, plus un alias de l'onglet 'mouvement' ──────────────────────
test("1 — BiomecaView est définie et App() en fait la cible de la barre secondaire \"Biomécanique\" (plus un alias de la vue 'mouvement')", () => {
  assert.ok(code.includes('function BiomecaView(props){'), 'BiomecaView introuvable.');
  const appBody = extractFnBody(code, 'App');
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable.');
  assert.ok(/\{key:'biomecanique',label:'Biomécanique',target:\{screen:'analyse',view:'biomeca'\}\}/.test(m[1]), 'La destination "Biomécanique" doit cibler view:\'biomeca\' (BiomecaView), pas view:\'mouvement\'.');
});

test("2 — AnalyseView route view==='biomeca' vers BiomecaView (garde mouvementAnalysis), sans nouvelle route App(), et masque les blocs 01-06 pour cette vue", () => {
  const body = extractFnBody(code, 'AnalyseView');
  assert.ok(/view==='biomeca'&&mouvementAnalysis&&h\(BiomecaView,/.test(body), 'AnalyseView doit rendre BiomecaView pour view===\'biomeca\' (uniquement si mouvementAnalysis existe).');
  assert.ok(body.indexOf("view!=='biomeca'") >= 0, 'Les blocs 01-06 doivent être masqués pour view===\'biomeca\'.');
});

// ── 2. Rendu Hero : reprend tel quel syntheseBiomecanique.resume (8 champs déjà rédigés) ─────────
test('3 — BiomecaHero affiche les 8 champs de analysis.syntheseBiomecanique.resume tels quels (aucun recalcul, aucune reformulation)', () => {
  const body = extractFnBody(code, 'BiomecaHero');
  assert.ok(body.includes('var resume=props.analysis.syntheseBiomecanique.resume;'), 'Doit lire syntheseBiomecanique.resume tel quel.');
  ['niveauBiomecaniqueGlobal', 'organisationBiomecanique', 'principalPointFort', 'principalFacteurLimitant', 'transitionLimitante', 'potentielProgression', 'coherenceAvecLesQualites', 'confianceGlobale'].forEach((champ) => {
    assert.ok(body.includes('resume.' + champ), 'Le champ ' + champ + ' (déjà rédigé par le moteur) doit être affiché.');
  });
});

// ── 3. Profil global / Organisation ───────────────────────────────────────────────────────────────
test('4 — BiomecaOrganizationCard affiche syntheseBiomecanique.organisation ET signature (profils) séparément, sans les fusionner ni inventer de causalité', () => {
  const body = extractFnBody(code, 'BiomecaOrganizationCard');
  assert.ok(body.includes('var org=analysis.syntheseBiomecanique.organisation;'), 'Doit lire organisation tel quel.');
  assert.ok(body.includes('var sig=analysis.signature;'), 'Doit lire signature (profils biomécaniques) tel quel — module indépendant, jamais confondu.');
  assert.ok(body.includes('org.label') && body.includes('org.reason'), 'Doit afficher label+reason déjà produits.');
});

// ── 4. Phase limitante ────────────────────────────────────────────────────────────────────────────
test('5 — BiomecaLimitingPhaseCard met en avant EXCLUSIVEMENT la phase déjà désignée par priorisation.priorite1 (jamais une déduction locale), et réutilise phasePresentation (même fonction que MouvementView)', () => {
  const body = extractFnBody(code, 'BiomecaLimitingPhaseCard');
  assert.ok(body.includes('var pri1=analysis.priorisation.priorite1;'), 'Doit lire priorisation.priorite1 tel quel.');
  assert.ok(body.includes('phasePresentation(pri1.phase,analysis)'), 'Doit réutiliser phasePresentation, jamais une seconde logique de présentation de phase.');
  assert.ok(body.includes('resume.principalFacteurLimitant'), 'Cas "aucune priorité" doit réutiliser le texte déjà rédigé du résumé exécutif, jamais un nouveau texte.');
});

// ── 5. Transition limitante ────────────────────────────────────────────────────────────────────────
test('6 — La transition limitante provient de analysis.coherence.transitionLaPlusLimitante (Moteur de Cohérence Inter-Phases, déjà calculé), jamais une nouvelle comparaison de phases', () => {
  const body = extractFnBody(code, 'BiomecaLimitingPhaseCard');
  assert.ok(body.includes('var transition=analysis.coherence.transitionLaPlusLimitante;'), 'Doit lire transitionLaPlusLimitante tel quel.');
});

// ── 6. Variables responsables ─────────────────────────────────────────────────────────────────────
test('7 — BiomecaResponsibleVariables affiche EXCLUSIVEMENT ph.variablesResponsables (déjà filtré par le Moteur Biomécanique), avec nom/valeur/unité/percentile — jamais un recalcul de LSI/asymétrie/seuil/score', () => {
  const body = extractFnBody(code, 'BiomecaResponsibleVariables');
  assert.ok(body.includes('var vars=ph.variablesResponsables||[];'), 'Doit lire variablesResponsables tel quel.');
  assert.ok(body.includes('v.rawVal') && body.includes('cmjVarUnit(v.kpiKey)') && body.includes('pctlContext(v.percentile)'), 'Doit afficher rawVal/unité/percentile déjà calculés.');
  assert.ok(!/autoLSI\(|lsiSt\(/.test(body), 'BiomecaResponsibleVariables ne doit jamais recalculer LSI/asymétrie.');
});

test('8 — cmjVarUnit lit l\'unité déjà déclarée dans TBK.cmj.kpis (même regex que computeAnalysePresentation), jamais une unité inventée', () => {
  const body = extractFnBody(code, 'cmjVarUnit');
  assert.ok(body.includes('TBK.cmj') && body.includes("label.match(/\\(([^)]+)\\)/)"), 'Doit extraire l\'unité du label existant, comme computeAnalysePresentation.');
});

// ── 7. Cohérence / incohérences ───────────────────────────────────────────────────────────────────
test('9 — BiomecaCoherenceCard utilise EXCLUSIVEMENT coherence.conclusionGlobale/ruptures et raisonnement.syntheseFinale.incoherencesDetectees (déjà calculés) — jamais un diagnostic clinique construit ici', () => {
  const body = extractFnBody(code, 'BiomecaCoherenceCard');
  assert.ok(body.includes('coherence.conclusionGlobale'), 'Doit afficher la conclusion globale déjà calculée.');
  assert.ok(body.includes('coherence.ruptures'), 'Doit afficher les ruptures déjà calculées.');
  assert.ok(body.includes('analysis.raisonnement.syntheseFinale.incoherencesDetectees'), 'Doit afficher les incohérences profil/qualité déjà calculées et formatées.');
});

test('10 — Incohérences : chaque texte de rupture provient de r.text déjà rédigé par computeTransition (CMJ_TRANSITION_TEMPLATES), jamais une nouvelle formulation causale', () => {
  const body = extractFnBody(code, 'BiomecaCoherenceCard');
  assert.ok(body.includes('r.text'), 'Doit réutiliser le texte déjà rédigé de la rupture.');
  assert.strictEqual(extractFnBody(code, 'computeTransition'), extractFnBody(baseCode, 'computeTransition'), 'computeTransition a changé — cette phase est UX uniquement.');
});

// ── 8. Axes de travail ────────────────────────────────────────────────────────────────────────────
test('11 — BiomecaWorkAxes reprend tel quel raisonnement.syntheseFinale.axesDeTravail (texte déjà rédigé) et conserve phase/variables/confiance d\'origine, sans le transformer en prescription', () => {
  const body = extractFnBody(code, 'BiomecaWorkAxes');
  assert.ok(body.includes('sf.axesDeTravail'), 'Doit afficher axesDeTravail tel quel.');
  assert.ok(body.includes('CMJ_PHASE_LABEL[pri1.phase]') && body.includes('sf.variablesResponsables'), 'Doit conserver la phase concernée et les variables responsables d\'origine.');
  assert.ok(!/exercice|répétition|série|entraînement/i.test(body), 'Ne doit jamais transformer l\'axe en prescription (aucun vocabulaire d\'exercice inventé).');
});

// ── 9. Phase sans données : jamais présentée comme normale ────────────────────────────────────────
test('12 — Une phase insuffisante (BiomecaPhaseProfile) est affichée distinctement ("Donnée insuffisante"), jamais fusionnée avec un niveau normal/positif', () => {
  const body = extractFnBody(code, 'BiomecaPhaseProfile');
  assert.ok(body.includes("if(!ph||!ph.sufficient){"), 'Doit distinguer explicitement le cas insuffisant.');
  assert.ok(body.includes("'Donnée insuffisante'"), 'Doit afficher un libellé honnête d\'absence de données.');
});

test('13 — Le bandeau de cycle (BiomecaPhaseCycleStrip) désactive/estompe visuellement une phase sans donnée (opacity réduite, bouton disabled) — jamais colorée comme une phase normale/altérée', () => {
  const body = extractFnBody(code, 'BiomecaPhaseCycleStrip');
  assert.ok(body.includes('disabled:!sufficient'), 'Le bouton doit être désactivé si la phase est insuffisante.');
  assert.ok(body.includes('opacity:sufficient?1:.35'), 'Une phase sans donnée doit être visuellement distincte (opacité réduite).');
  assert.ok(body.includes('col=sufficient?phaseColor(p,analysis):C.border'), 'Une phase sans donnée ne doit jamais utiliser la couleur de statut (phaseColor), uniquement un gris neutre (C.border).');
});

// ── 10. Absence de recalcul / nouveaux seuils / nouvelle relation clinique ────────────────────────
test('14 — GUARD — Aucun des moteurs biomécaniques n\'est modifié (computeBiomecaEngine/computeBiomecaPhase/computeCoherenceEngine/computeSyntheseBiomecanique/computeMoteurRaisonnementBiomecanique/computePriorisationClinique/computeMouvementAnalysis/phasePresentation/phaseEvidence/biomecaPhaseConclusion) — BYTE-IDENTIQUES vs baseline (7052dcd)', () => {
  ['computeBiomecaEngine', 'computeBiomecaPhase', 'computeCoherenceEngine', 'computeSyntheseBiomecanique', 'computeMoteurRaisonnementBiomecanique', 'computePriorisationClinique', 'computeMouvementAnalysis', 'phasePresentation', 'phaseEvidence', 'biomecaPhaseConclusion', 'computeSignatureBiomecanique', 'computeSyntheseExperteKinexus'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§13).');
  });
});

test('15 — GUARD — Aucun nouveau seuil/norme biomécanique (BiomecaSpecs, CMJ_VAR_META, CMJ_PHASE_TO_QUALITY, THRESHOLDS/NORMS) n\'est introduit — inchangés vs baseline', () => {
  assert.strictEqual(extractFnBody(code, 'biomecaPhaseConclusion'), extractFnBody(baseCode, 'biomecaPhaseConclusion'));
  ['CMJ_PHASES', 'CMJ_PHASE_LABEL', 'CMJ_PHASE_TO_QUALITY', 'CMJ_VAR_META', 'NORMS', 'THRESHOLDS'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucun seuil/norme/référentiel biomécanique.');
  });
});

test('16 — GUARD — Aucune nouvelle relation clinique (CMJ_PHASE_TO_QUALITY réutilisé tel quel — seul braking->Absorption correspond à une qualité réellement calculée, jamais une équivalence inventée pour les 4 autres)', () => {
  const body = extractFnBody(code, 'BiomecaLimitingPhaseCard');
  assert.ok(body.includes('CMJ_PHASE_TO_QUALITY[pri1.phase]'), 'Doit réutiliser CMJ_PHASE_TO_QUALITY existant, jamais un nouveau mapping.');
  assert.ok(body.includes('analysis.functionScores&&analysis.functionScores[qualiteLabel]'), 'Ne doit proposer la navigation qualité que si functionScores confirme réellement son existence (jamais une qualité supposée).');
});

// ── 11. Navigation vers source/test si disponible ─────────────────────────────────────────────────
test("17 — [Voir le test] réutilise onGotoExpertTab('kpi') (vue Résultats existante, même pattern que Phases 5/6), aucune nouvelle route", () => {
  const viewBody = extractFnBody(code, 'BiomecaView');
  assert.ok(viewBody.includes("props.onGotoExpertTab&&function(){props.onGotoExpertTab('kpi');}"), 'BiomecaView doit câbler [Voir le test] vers onGotoExpertTab(\'kpi\').');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(BiomecaView,\{analysis:mouvementAnalysis,/.test(analyseBody), 'AnalyseView doit transmettre le contexte (analysis) complet à BiomecaView.');
});

// ── 12. Responsive : pas de nouvelle règle CSS spécifique nécessaire (cartes empilées par défaut) ─
test('18 — BiomecaView compose ses sections en colonne unique (display:flex,flexDirection:column) — empilement propre par défaut sur toutes largeurs, aucun débordement horizontal fixe', () => {
  const body = extractFnBody(code, 'BiomecaView');
  assert.ok(body.includes("flexDirection:'column'"), 'La composition doit être en colonne (empilement naturel desktop/tablette).');
});

// ── 13. Accessibilité de base ─────────────────────────────────────────────────────────────────────
test('19 — Les éléments interactifs de la Biomécanique sont de vrais <button> (BiomecaPhaseCycleStrip, BiomecaPhaseProfile, BiomecaDataTechnique) — jamais un <div onClick>', () => {
  ['BiomecaPhaseCycleStrip', 'BiomecaPhaseProfile', 'BiomecaDataTechnique'].forEach((comp) => {
    const body = extractFnBody(code, comp);
    assert.ok(/h\('button',\{/.test(body), comp + ' doit utiliser un vrai <button>.');
  });
});

// ── 14. Délégation / réutilisation ────────────────────────────────────────────────────────────────
test('20 — MouvementView délègue à BiomecaPhaseCycleStrip (extraction, pas une deuxième implémentation du bandeau de phases)', () => {
  const mvBody = extractFnBody(code, 'MouvementView');
  assert.ok(mvBody.includes('h(BiomecaPhaseCycleStrip,{analysis:analysis,active:active,onSelect:setActive})'), 'MouvementView doit déléguer à BiomecaPhaseCycleStrip.');
  const occurrences = code.split('function BiomecaPhaseCycleStrip(').length - 1;
  assert.strictEqual(occurrences, 1, 'BiomecaPhaseCycleStrip doit être défini une seule fois (UNE SEULE implémentation).');
});

// ── 15. Non-régression AnalyseView / ExpertView ───────────────────────────────────────────────────
test('21 — Non-régression : ExpertView (onglets Fonctions/Systèmes) et le sélecteur interne d\'AnalyseView restent inchangés au-delà de l\'ajout de la destination "Biomécanique"', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(analyseBody.includes("['biomeca','Biomécanique']"), 'Le sélecteur interne doit proposer la nouvelle destination Biomécanique.');
  assert.ok(analyseBody.includes("['mouvement','Mouvement']"), 'L\'ancien onglet Mouvement (drill-down expert) doit rester accessible, non supprimé.');
  assert.strictEqual(extractFnBody(code, 'ExpertView'), extractFnBody(baseCode, 'ExpertView'), 'ExpertView ne doit pas être modifiée par cette phase.');
});

test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX/TFM/FN_KEY restent inchangés vs baseline (7052dcd)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX', 'TFM', 'FN_KEY'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/référentiel.');
  });
});

test('GUARD — Les 8 moteurs HYP-XX-01 et computeCsmV2/computeHypClinicalSynthesis01 restent BYTE-IDENTIQUES vs baseline (7052dcd)', () => {
  ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeCsmV2', 'computeHypClinicalSynthesis01'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission.');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

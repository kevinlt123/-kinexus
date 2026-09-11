// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 5 : « Pourquoi ? » — preuves, raisonnement et limites
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : PourquoiView (parcours complet conclusion -> preuves -> hiérarchie de preuve ->
// raisonnement CSM V2 -> relations/concordances -> limites d'une qualité), UNE SEULE implémentation
// (§10 mission) ouverte à l'identique depuis SyntheseView et QualiteDetailView. Couche de
// présentation uniquement — computeMoteur/HYP/CSM V2/NORMS/THRESHOLDS/LSI/relations/priorités ne
// sont pas modifiés (vérifié par guards ci-dessous + snapshot clinique avant/après, voir rapport de
// phase).
//
// BASELINE_COMMIT : d307223 (Phase 4), strictement avant cette phase.

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

const BASELINE_COMMIT = 'd307223';
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
const sandbox = new Function('localStorage', sandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY};")({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY};")({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 5 : « Pourquoi ? » — preuves, raisonnement et limites');

// ── 1. PourquoiView existe et est atteignable depuis SyntheseView ET QualiteDetailView ───────────
test('1 — PourquoiView est définie', () => {
  assert.ok(code.includes('function PourquoiView(props){'), 'PourquoiView introuvable.');
});

test('2 — AnalyseView possède un état pourquoiQuality + openPourquoi(), câblé à la fois vers SyntheseView (onOpenPourquoi) et QualiteDetailView (onOpenPourquoi)', () => {
  const body = extractFnBody(code, 'AnalyseView');
  assert.ok(/var \[pourquoiQuality,setPourquoiQuality\]=useState\(null\);/.test(body), 'pourquoiQuality doit être un état local d\'AnalyseView (pas une nouvelle route App()).');
  assert.ok(/function openPourquoi\(fq\)\{/.test(body), 'openPourquoi() introuvable.');
  assert.ok(/h\(SyntheseView,\{[\s\S]*?onOpenPourquoi:openPourquoi\}\)/.test(body), 'SyntheseView doit recevoir onOpenPourquoi.');
  assert.ok(/h\(QualiteDetailView,\{[\s\S]*?onOpenPourquoi:openPourquoi\}\)/.test(body), 'QualiteDetailView doit recevoir onOpenPourquoi.');
  assert.ok(/pourquoiQuality&&h\(PourquoiView,/.test(body), 'AnalyseView doit rendre PourquoiView quand pourquoiQuality est défini.');
});

test("3 — UNE SEULE implémentation (§10) : PourquoiView réutilise EXACTEMENT les mêmes composants que QualiteDetailView (ConclusionCard/PreuvesPrincipalesCard/ConcordancesRelationsCard/LimitesCard), jamais une deuxième version du même raisonnement", () => {
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  const pvBody = extractFnBody(code, 'PourquoiView');
  ['ConclusionCard', 'PreuvesPrincipalesCard', 'ConcordancesRelationsCard', 'LimitesCard'].forEach((comp) => {
    assert.ok(qdBody.includes('h(' + comp + ','), 'QualiteDetailView doit utiliser ' + comp + '.');
    assert.ok(pvBody.includes('h(' + comp + ','), 'PourquoiView doit utiliser ' + comp + ' (même implémentation que QualiteDetailView).');
  });
  // Chaque composant partagé n'existe qu'une seule fois dans tout le fichier (pas de duplication
  // sous un autre nom pour l'un ou l'autre écran).
  ['ConclusionCard', 'PreuvesPrincipalesCard', 'ConcordancesRelationsCard', 'LimitesCard'].forEach((comp) => {
    const occurrences = code.split('function ' + comp + '(').length - 1;
    assert.strictEqual(occurrences, 1, comp + ' doit être défini une seule fois (UNE SEULE implémentation).');
  });
});

// ── 2. Section A — Conclusion : statut + résumé existants, aucune nouvelle causalité ─────────────
test('4 — ConclusionCard (Section A) lit exclusivement csmSafeQualityNote(f,res.clinicalSynthesis) — aucun texte inventé', () => {
  const body = extractFnBody(code, 'ConclusionCard');
  assert.ok(body.includes('csmSafeQualityNote(f,res.clinicalSynthesis)'), 'ConclusionCard doit réutiliser csmSafeQualityNote existant, jamais un nouveau texte.');
});

// ── 3. Section B — Preuves principales : test, valeur, unité, statut, D/G, LSI, jamais recalculés ─
test('5 — PreuvesPrincipalesCard (Section B) affiche test/statut/D-G/LSI déjà calculés (testStatuses, pres.asymItems), sans appeler autoLSI/lsiSt', () => {
  const body = extractFnBody(code, 'PreuvesPrincipalesCard');
  assert.ok(body.includes('res.testStatuses[tk]'), 'Doit lire le statut déjà calculé (res.testStatuses).');
  assert.ok(body.includes('pres.asymItems.filter(function(a){return a.testKey===tk;})'), 'Doit retrouver D/G/LSI déjà calculés via testKey (pres.asymItems), jamais un recalcul.');
  assert.ok(!/autoLSI\(|lsiSt\(/.test(body), 'PreuvesPrincipalesCard ne doit jamais recalculer LSI/asymétrie.');
});

// ── 4. Section C — Hiérarchie de preuve : uniquement si la structure existe déjà (CSM V2) ────────
test('6 — CsmV2HierarchyCard (Section C) lit exclusivement res.clinicalSynthesisV2.clinicalEvidenceHierarchy[f] déjà calculé (Mission AD §2), ne s\'affiche que si la structure existe, et ne recalcule aucun des 6 niveaux', () => {
  assert.ok(code.includes('function CsmV2HierarchyCard(props){'), 'CsmV2HierarchyCard introuvable.');
  const body = extractFnBody(code, 'CsmV2HierarchyCard');
  assert.ok(body.includes('res.clinicalSynthesisV2'), 'Doit lire res.clinicalSynthesisV2.');
  assert.ok(body.includes('csmV2.clinicalEvidenceHierarchy&&csmV2.clinicalEvidenceHierarchy[f]'), 'Doit lire clinicalEvidenceHierarchy[f] déjà calculé.');
  assert.ok(/if\(!hier\)return null;/.test(body), 'Doit retourner null (ne rien afficher) si la structure n\'existe pas pour cette qualité — jamais une hiérarchie inventée.');
  // Les 6 niveaux affichés sont exactement ceux déjà produits par csmV2EvidenceHierarchyForQuality
  // (Mission AD §2, index.html) — jamais un 7e niveau inventé ici.
  ['level1_diagnostic', 'level2_confirmation', 'level3_explanation', 'level4_relation', 'level5_bridge', 'level6_chain'].forEach((lvl) => {
    assert.ok(code.includes("['" + lvl + "'"), 'Le niveau ' + lvl + ' (déjà calculé par le moteur) doit être repris tel quel.');
  });
  // Vérifie que le moteur qui produit réellement ces 6 niveaux + verdict existe et n'est pas modifié
  // par cette phase (guard supplémentaire, ciblé sur la fonction source de la Section C).
  assert.strictEqual(extractFnBody(code, 'csmV2EvidenceHierarchyForQuality'), extractFnBody(baseCode, 'csmV2EvidenceHierarchyForQuality'), 'csmV2EvidenceHierarchyForQuality a changé — cette phase est UX uniquement, aucun recalcul de hiérarchie de preuve.');
});

// ── 5. Section D/E/G — Raisonnement CSM V2 : réutilise LITTÉRALEMENT csmV2ReportPrincipalDeficitCardHtml ──
test('7 — CsmV2RaisonnementCard (Sections D/E/G) réutilise LITTÉRALEMENT csmV2ReportPrincipalDeficitCardHtml — la même fonction qui produit déjà le Compte rendu clinique CSM V2 d\'ExpertView/PDF — aucune nouvelle prose clinique inventée, et ne s\'affiche que si le profil existe', () => {
  assert.ok(code.includes('function CsmV2RaisonnementCard(props){'), 'CsmV2RaisonnementCard introuvable.');
  const body = extractFnBody(code, 'CsmV2RaisonnementCard');
  assert.ok(body.includes('csmV2ReportPrincipalDeficitCardHtml(1,f,csmV2)'), 'Doit réutiliser littéralement csmV2ReportPrincipalDeficitCardHtml, jamais une réécriture.');
  assert.ok(/if\(!csmV2\|\|!csmV2\.clinicalProfile\|\|!csmV2\.clinicalProfile\[f\]\)return null;/.test(body), 'Doit retourner null si le profil CSM V2 n\'existe pas pour cette qualité.');
  // La fonction réutilisée elle-même doit rester strictement inchangée par cette phase.
  assert.strictEqual(extractFnBody(code, 'csmV2ReportPrincipalDeficitCardHtml'), extractFnBody(baseCode, 'csmV2ReportPrincipalDeficitCardHtml'), 'csmV2ReportPrincipalDeficitCardHtml a changé — interdit par cette mission (§1, moteur clinique).');
});

// ── 6. Vocabulaire CSM V2 jamais causal : ASSOCIATED/HYPOTHESIS/REFUTED jamais présentés comme cause ──
test('8 — Le vocabulaire CSM V2 réutilisé (CONTRIBUTING/ASSOCIATED/HYPOTHESIS/REFUTED via CSM_V2_VERIFICATION_STATUS_LABEL) reste inchangé — jamais reformulé en "cause"', () => {
  assert.strictEqual(extractFnBody(code, 'csmV2ReportPrincipalDeficitLineHtml'), extractFnBody(baseCode, 'csmV2ReportPrincipalDeficitLineHtml'), 'csmV2ReportPrincipalDeficitLineHtml a changé.');
  const m = code.match(/var CSM_V2_VERIFICATION_STATUS_LABEL=\{[^}]*\};/);
  const mBase = baseCode.match(/var CSM_V2_VERIFICATION_STATUS_LABEL=\{[^}]*\};/);
  assert.ok(m && mBase && m[0] === mBase[0], 'CSM_V2_VERIFICATION_STATUS_LABEL (vocabulaire Contributif/Associé/Hypothèse/Hypothèse infirmée) ne doit pas changer.');
});

// ── 7. Section D (V1) — Concordances/relations : jamais transformées en causalité ─────────────────
test('9 — ConcordancesRelationsCard (Section D, V1) reste filtrée par les champs déjà existants (explains/explained, qualityA/qualityB) — même logique que Phase 4, jamais un nouveau critère', () => {
  const body = extractFnBody(code, 'ConcordancesRelationsCard');
  assert.ok(body.includes('rel.explains===f||rel.explained===f'), 'Filtre explanatoryHypotheses inchangé.');
  assert.ok(body.includes("r.level==='concordant_no_relation'&&(r.qualityA===f||r.qualityB===f)"), 'Filtre concordances inchangé.');
});

// ── 8. Section F — Limites : distinction stricte, jamais "non déterminable" = "normal" ───────────
test('10 — LimitesCard (Section F) distingue non-déterminable/suspectée sans jamais transformer l\'un en statut normal', () => {
  const body = extractFnBody(code, 'LimitesCard');
  assert.ok(body.includes("Non déterminable n\\'équivaut jamais à normal"), 'Le message doit explicitement écarter toute confusion avec un statut normal.');
});

// ── 9. Section 5 mission : distinction absolue statut vs LSI/asymétrie ───────────────────────────
test("11 — PreuvesPrincipalesCard affiche le LSI comme une dimension SÉPARÉE du statut (jamais une déduction 'LSI=X% => déficit' construite dans la vue) — le statut affiché reste testStatus/Badge, jamais dérivé du LSI localement", () => {
  const body = extractFnBody(code, 'PreuvesPrincipalesCard');
  assert.ok(body.includes("LSI '+asym.lsi+'%'"), 'Le LSI doit être affiché tel quel.');
  assert.ok(!/asym\.lsi\s*[<>=]/.test(body), 'PreuvesPrincipalesCard ne doit jamais comparer/interpréter le LSI elle-même (aucun seuil recalculé dans la vue).');
  assert.ok(body.includes('h(Badge,{status:testStatus,small:true})'), 'Le statut affiché doit rester le statut de test déjà calculé (res.testStatuses), jamais dérivé du LSI par la vue.');
});

// ── 10. Section 11 mission (Design) : aucun jargon interne exposé dans PourquoiView ───────────────
test('12 — PourquoiView (corps propre, hors composants réutilisés) n\'expose aucun jargon interne (hypId/csmId/poids TFM/nom de fonction moteur)', () => {
  const body = extractFnBody(code, 'PourquoiView');
  assert.ok(!/hypId|csmId|TFM\[|computeMoteur|computeCsmV2\(|computeHyp[A-Za-z]+01\(/.test(body), 'PourquoiView ne doit jamais exposer hypId/csmId/poids TFM/appel direct à un moteur — réservé à Analyse Expert.');
});

// ── 11. Section 9 mission (Navigation) : contexte préservé, [Retour] -> QualiteDetailView ────────
test('13 — Navigation : [Voir le test]/[Voir les données]/[Analyse expert] réutilisent onGotoExpertTab (kpi/variables/csmv2, onglets existants, aucune nouvelle route App()), et [Retour] ramène vers QualiteDetailView (openQuality reste fixé sur la même qualité)', () => {
  const pvBody = extractFnBody(code, 'PourquoiView');
  assert.ok(pvBody.includes("onGotoExpertTab('kpi')"), '[Voir le test] doit cibler l\'onglet Résultats existant (kpi).');
  assert.ok(pvBody.includes("onGotoExpertTab('variables')"), '[Voir les données] doit cibler l\'onglet Variables existant.');
  assert.ok(pvBody.includes("onGotoExpertTab('csmv2')"), '[Analyse expert] doit cibler l\'onglet CSM V2 existant.');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/function openPourquoi\(fq\)\{setOpenQuality\(fq\);setPourquoiQuality\(fq\);setView\('qualites'\);\}/.test(analyseBody), 'openPourquoi doit fixer openQuality+view sur la qualité concernée AVANT ouverture, pour que [Retour] (qui ne vide que pourquoiQuality) ramène sur QualiteDetailView de la même qualité.');
  assert.ok(/onBack:function\(\)\{setPourquoiQuality\(null\);\}/.test(analyseBody), '[Retour] doit se contenter de vider pourquoiQuality (sans toucher openQuality/view), pour ramener sur QualiteDetailView.');
});

// ── 12. Entrées depuis SyntheseView ET QualiteDetailView, contenu identique (Section 12 mission) ──
test('14 — Les points d\'entrée "Pourquoi ?" de SyntheseView (CsmObjectifiedCard/CsmSuspectedCard) et de QualiteDetailView appellent le MÊME callback onOpenPourquoi vers la MÊME PourquoiView', () => {
  assert.ok(code.includes('function CsmObjectifiedCard(props){'), 'CsmObjectifiedCard introuvable.');
  const objBody = extractFnBody(code, 'CsmObjectifiedCard');
  const susBody = extractFnBody(code, 'CsmSuspectedCard');
  assert.ok(objBody.includes('onOpenPourquoi(o.quality)'), 'CsmObjectifiedCard doit exposer un lien "Pourquoi ?" par qualité.');
  assert.ok(susBody.includes('onOpenPourquoi(s.quality)'), 'CsmSuspectedCard doit exposer un lien "Pourquoi ?" par qualité.');
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  assert.ok(qdBody.includes('props.onOpenPourquoi&&h(Btn,{primary:true,onClick:function(){props.onOpenPourquoi(f);}}'), 'QualiteDetailView doit exposer un bouton [Pourquoi ?] utilisant le même callback.');
});

// ── 13. Régression : ExpertView Synthèse clinique/Orientations, ResultsBrowser, CsmObjectifiedCard/CsmSuspectedCard sans onOpenPourquoi restent inchangés ──
test("15 — ExpertView (onglet Synthèse clinique) ne fournit pas onOpenPourquoi à CsmObjectifiedCard/CsmSuspectedCard — le bouton \"Pourquoi ?\" ne s'affiche donc que dans le nouveau parcours (Synthèse/Qualités du bilan), jamais dans l'onglet Expert historique", () => {
  const expertBody = extractFnBody(code, 'ExpertView');
  assert.ok(/h\(CsmObjectifiedCard,\{res:res\}\)/.test(expertBody), 'ExpertView doit continuer à appeler CsmObjectifiedCard sans onOpenPourquoi (comportement Phase 3 inchangé).');
  assert.ok(/h\(CsmSuspectedCard,\{res:res\}\)/.test(expertBody), 'ExpertView doit continuer à appeler CsmSuspectedCard sans onOpenPourquoi (comportement Phase 3 inchangé).');
});

// ── 14. Non-régression stricte des moteurs cliniques ──────────────────────────────────────────────
test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX/TFM/FN_KEY restent inchangés vs baseline (d307223)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX', 'TFM', 'FN_KEY'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/référentiel.');
  });
});

test('GUARD — Les 8 moteurs HYP-XX-01 et computeCsmV2/computeHypClinicalSynthesis01 restent BYTE-IDENTIQUES vs baseline (d307223)', () => {
  ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeCsmV2', 'computeHypClinicalSynthesis01'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§1).');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

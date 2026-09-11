// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 4 : vue « Qualités » + détail d'une qualité
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : QualitesView (grille des 8 qualités) + QualiteDetailView (synthèse/preuves/relations/
// limites d'une qualité), accessibles depuis la barre secondaire. Couche de présentation
// uniquement — computeMoteur/HYP/CSM V2/NORMS/THRESHOLDS/LSI/priorités ne sont pas modifiés
// (vérifié par guards ci-dessous + snapshot clinique avant/après, voir rapport de phase).
//
// BASELINE_COMMIT : 4dac231 (Phase 3), strictement avant cette phase.

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

const BASELINE_COMMIT = '4dac231';
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

console.log("MISSION UX/UI V1 — PHASE 4 : vue Qualités + détail d'une qualité");

// ── 1. Accessibilité depuis la barre secondaire ─────────────────────────────────────────────────
test("1 — QualitesView/QualiteDetailView sont définies et App() en fait la cible de la barre secondaire \"Qualités\"", () => {
  assert.ok(code.includes('function QualitesView(props){'), 'QualitesView introuvable.');
  assert.ok(code.includes('function QualiteDetailView(props){'), 'QualiteDetailView introuvable.');
  const appBody = extractFnBody(code, 'App');
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable.');
  assert.ok(/\{key:'qualites',label:'Qualités',target:\{screen:'analyse',view:'qualites'\}\}/.test(m[1]), 'La destination "Qualités" doit cibler view:\'qualites\' (QualitesView), pas un onglet d\'ExpertView.');
});

test('2 — AnalyseView route view===\'qualites\' vers QualitesView (grille) ou QualiteDetailView (openQuality défini), sans nouvelle route App()', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/var \[openQuality,setOpenQuality\]=useState\(null\);/.test(analyseBody), 'openQuality doit être un état local d\'AnalyseView (pas une nouvelle route App()).');
  assert.ok(/view==='qualites'&&\(openQuality\s*\?\s*h\(QualiteDetailView,/.test(analyseBody), 'AnalyseView doit rendre QualiteDetailView quand openQuality est défini.');
  assert.ok(/:\s*h\(QualitesView,/.test(analyseBody), 'AnalyseView doit rendre QualitesView (grille) sinon.');
});

// ── 2. Les 8 qualités, toujours affichées, même donnée que SyntheseView (pas de 3e logique) ─────
test('3 — QualitesView itère sur pres.evFns (même donnée que SyntheseView, Phase 3), jamais un nouveau calcul de liste de qualités', () => {
  const body = extractFnBody(code, 'QualitesView');
  assert.ok(/pres\.evFns\.map/.test(body), 'QualitesView doit itérer sur pres.evFns, comme SyntheseView (Phase 3) — pas de 3e logique de présentation.');
});

test('4 — QualityCard lit le statut directement depuis res.functionScores[f], jamais un nouveau statut, et ne retombe jamais sur "Optimal"/Préservée en l\'absence de données', () => {
  const body = extractFnBody(code, 'QualityCard');
  assert.ok(body.includes('res.functionScores[f]'), 'QualityCard doit lire res.functionScores[f] tel quel.');
  assert.ok(/status\?SL\[status\]:'Non déterminable'/.test(body), 'Sans statut réel, QualityCard doit afficher "Non déterminable", jamais un statut par défaut positif.');
  assert.ok(!/:'Préservée'|:'Optimal'/.test(body.replace(/SL\[status\]/g, '')), 'QualityCard ne doit jamais coder en dur "Préservée"/"Optimal" comme repli.');
});

// ── 3. Preuves principales : réutilise functionRelTests/FunctionEvidenceChips (extraits d'ExpertView) ──
test("5 — functionRelTests/FunctionEvidenceChips sont extraits d'ExpertView et réutilisés par QualityCard/QualiteDetailView (pas de duplication)", () => {
  assert.ok(code.includes('function functionRelTests(f,td){'), 'functionRelTests introuvable.');
  assert.ok(code.includes('function FunctionEvidenceChips(props){'), 'FunctionEvidenceChips introuvable.');
  const expertBody = extractFnBody(code, 'ExpertView');
  assert.ok(expertBody.includes('h(FunctionEvidenceChips,{f:f,td:td})'), "ExpertView (onglet Fonctions) doit déléguer à FunctionEvidenceChips, pas dupliquer le calcul de relTests.");
  assert.ok(!/TFM\)\.filter\(function\(tk\)\{return TFM\[tk\]\[fk\]/.test(expertBody), "ExpertView ne doit plus contenir le filtre TFM inline (déplacé dans functionRelTests).");
  const qcBody = extractFnBody(code, 'QualityCard');
  assert.ok(qcBody.includes('functionRelTests(f,bilan.testData||{})'), 'QualityCard doit réutiliser functionRelTests pour compter les preuves.');
  // Relogé (Mission UX/UI V1, Phase 5, §10) : la liste des preuves de QualiteDetailView vit
  // désormais dans PreuvesPrincipalesCard, extraite pour être réutilisée à l'identique par la
  // nouvelle PourquoiView — même exigence sémantique (functionRelTests réutilisé, jamais dupliqué),
  // seule la localisation du corps de fonction change.
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  assert.ok(qdBody.includes('h(PreuvesPrincipalesCard,'), 'QualiteDetailView doit déléguer à PreuvesPrincipalesCard pour lister les preuves.');
  const ppBody = extractFnBody(code, 'PreuvesPrincipalesCard');
  assert.ok(ppBody.includes('functionRelTests(f,td)'), 'PreuvesPrincipalesCard doit réutiliser functionRelTests pour lister les preuves.');
});

test('6 — functionRelTests filtre sur TFM (référentiel constant) et testData actif — même logique exacte qu\'avant cette phase, jamais un nouveau seuil', () => {
  const body = extractFnBody(code, 'functionRelTests');
  assert.strictEqual(body, "{\n  var fk=FN_KEY[f];\n  return Object.keys(TFM).filter(function(tk){return TFM[tk][fk]&&td[tk]&&td[tk].active;}).sort(function(a,b){return TFM[b][fk]-TFM[a][fk];});\n}",
    'functionRelTests doit reprendre exactement le filtre/tri qui vivait dans ExpertView avant cette phase.');
});

// ── 4. D/G/LSI déjà calculés, jamais recalculés ─────────────────────────────────────────────────
test("7 — L'enrichissement testKey des asymItems (computeAnalysePresentation) est additif : aucune valeur gV/dV/lsi/status existante n'est modifiée", () => {
  const fnBody = extractFnBody(code, 'computeAnalysePresentation');
  assert.ok(fnBody.includes("asymItems.push({testKey:test.key,label:test.label.replace(/^Single Leg /,''),gV:roundStep(gV,kpi.step),dV:roundStep(dV,kpi.step),unit:unitM?unitM[1]:'',lsi:lsi,status:lsiSt(lsi)});"),
    'asymItems doit conserver exactement gV/dV/unit/lsi/status déjà calculés, avec testKey en ajout pur.');
  // Confirme que la baseline (avant cette phase) ne construisait pas déjà testKey (donc c'est un
  // ajout net et non un renommage silencieux d'un champ existant).
  const baseFnBody = extractFnBody(baseCode, 'computeAnalysePresentation');
  assert.ok(!baseFnBody.includes('testKey:test.key'), 'Pré-requis : testKey ne devait pas exister avant cette phase (sinon ce n\'est pas un ajout net).');
});

// Relogé (Mission UX/UI V1, Phase 5, §10) : tests 8/9/10 vérifiaient des blocs qui vivent désormais
// dans PreuvesPrincipalesCard/ConcordancesRelationsCard/LimitesCard — extraits de QualiteDetailView
// pour devenir l'UNIQUE implémentation partagée avec la nouvelle PourquoiView. Même exigence
// sémantique exacte qu'avant cette phase, seule la fonction inspectée change.
test('8 — QualiteDetailView (via PreuvesPrincipalesCard) associe les preuves D/G/LSI via testKey (pres.asymItems), jamais un recalcul de LSI/asymétrie', () => {
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  assert.ok(qdBody.includes('h(PreuvesPrincipalesCard,'), 'QualiteDetailView doit déléguer à PreuvesPrincipalesCard.');
  const body = extractFnBody(code, 'PreuvesPrincipalesCard');
  assert.ok(body.includes("pres.asymItems.filter(function(a){return a.testKey===tk;})"), 'PreuvesPrincipalesCard doit retrouver le D/G/LSI déjà calculé via testKey, jamais recalculer autoLSI/lsiSt.');
  assert.ok(!/autoLSI\(|lsiSt\(/.test(body), 'PreuvesPrincipalesCard ne doit jamais appeler autoLSI/lsiSt elle-même.');
});

// ── 5. Concordances/relations : jamais transformées en causalité, toujours scopées à la qualité ──
test('9 — Concordances/relations (via ConcordancesRelationsCard) sont filtrées par les champs déjà existants (explains/explained pour les hypothèses, qualityA/qualityB pour les concordances), jamais un nouveau critère', () => {
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  assert.ok(qdBody.includes('h(ConcordancesRelationsCard,'), 'QualiteDetailView doit déléguer à ConcordancesRelationsCard.');
  const body = extractFnBody(code, 'ConcordancesRelationsCard');
  assert.ok(body.includes("rel.explains===f||rel.explained===f"), 'Le filtre des hypothèses explicatives doit utiliser explains/explained (champs déjà produits par computeHypClinicalSynthesis01).');
  assert.ok(body.includes("r.level==='concordant_no_relation'&&(r.qualityA===f||r.qualityB===f)"), 'Le filtre des concordances doit utiliser level/qualityA/qualityB (champs déjà produits).');
  assert.ok(body.includes('csmCleanExplanatoryText(rel)'), 'Les hypothèses explicatives doivent être formatées via csmCleanExplanatoryText existant (jamais un nouveau texte causal).');
});

// ── 6. Limites : qualité non déterminable / suspectée, jamais confondues ────────────────────────
test('10 — Limites (via LimitesCard) distingue non-déterminable (csm.nonDeterminable) et suspectée (csm.suspected), réutilise csmNonDeterminableHasPartialEvidence/csmSuspectedNote existants', () => {
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  assert.ok(qdBody.includes('h(LimitesCard,'), 'QualiteDetailView doit déléguer à LimitesCard.');
  const body = extractFnBody(code, 'LimitesCard');
  assert.ok(body.includes("(csm.nonDeterminable||[]).some(function(n){return n.quality===f;})"), 'isNonDeterminable doit être dérivé de csm.nonDeterminable.');
  assert.ok(body.includes("(csm.suspected||[]).some(function(s){return s.quality===f;})"), 'isSuspected doit être dérivé de csm.suspected.');
  assert.ok(body.includes('csmNonDeterminableHasPartialEvidence(f,csm)') && body.includes('csmSuspectedNote(f)'), 'Doit réutiliser les helpers existants, jamais une nouvelle formulation.');
});

// ── 7. Navigation : aucune nouvelle route App() ─────────────────────────────────────────────────
test("11 — Les boutons de navigation (Voir le test/Voir les résultats/Voir l'analyse expert) réutilisent onGotoExpertTab, déjà câblé en Phase 3 (aucune nouvelle route App())", () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/onGotoExpertTab:function\(tab\)\{setExpertTabTarget\(tab\);setView\('expert'\);\}\}\)/.test(analyseBody.replace(/\s+/g, ' ')) || /onGotoExpertTab:function\(tab\)\{setExpertTabTarget\(tab\);setView\('expert'\);\}/.test(analyseBody), 'QualiteDetailView doit recevoir le même onGotoExpertTab qu\'utilise SyntheseView.');
  const qdBody = extractFnBody(code, 'QualiteDetailView');
  assert.ok(qdBody.includes("props.onGotoExpertTab('kpi')") && qdBody.includes("props.onGotoExpertTab('fonctions')"), 'QualiteDetailView doit utiliser onGotoExpertTab avec les onglets existants (kpi/fonctions), sans nouvelle route.');
});

// ── 8. Aucune duplication critique ───────────────────────────────────────────────────────────────
test("12 — L'onglet Fonctions d'ExpertView ne contient plus le rendu inline dupliqué (délègue à FunctionEvidenceChips)", () => {
  const expertBody = extractFnBody(code, 'ExpertView');
  assert.ok(!/relTests\.map\(function\(tk\)\{var w=TFM/.test(expertBody), 'Le rendu des chips ne doit plus être inline dans ExpertView.');
});

// ── 9. Non-régression stricte des moteurs cliniques ──────────────────────────────────────────────
test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX/TFM/FN_KEY restent inchangés vs baseline (4dac231)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX', 'TFM', 'FN_KEY'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/référentiel.');
  });
});

test('GUARD — Les 8 moteurs HYP-XX-01 et computeCsmV2/computeHypClinicalSynthesis01 restent BYTE-IDENTIQUES vs baseline (4dac231)', () => {
  ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeCsmV2', 'computeHypClinicalSynthesis01'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§1).');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

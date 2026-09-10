// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 2 : Fiche athlète + barre secondaire persistante du bilan
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre de cette phase (strict) : fiche athlète (AthleteProfile), barre secondaire persistante
// à 7 destinations pendant la consultation d'un bilan, et l'ossature de navigation qui les relie —
// toutes pointant vers des écrans/composants/onglets déjà existants (AnalyseView/ExpertView),
// jamais de nouvelle implémentation de Synthèse/Qualités/Body Map/Biomécanique/Tests/Analyse
// Expert (phases suivantes). Aucun calcul clinique introduit dans l'UI (règle §20 de la mission) :
// ces tests sont donc structurels (lecture du code source), complétés par une vérification
// navigateur réelle (Playwright, hors suite Node) pour le rendu/interaction/responsive tablette.
//
// BASELINE_COMMIT : 8349406 (fix normSelections, mission UX/UI V1), strictement avant cette phase.

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

const BASELINE_COMMIT = '8349406';
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

function extractAppBody(src) { return extractFnBody(src, 'App'); }

const sandbox = new Function(
  'localStorage',
  code.slice(code.indexOf('var C={'), code.indexOf("ReactDOM.createRoot(document.getElementById('root'))")) +
  "\nreturn {NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};"
)({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function(
  'localStorage',
  baseCode.slice(baseCode.indexOf('var C={'), baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))")) +
  "\nreturn {NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};"
)({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 2 : fiche athlète + barre secondaire persistante');

// ── 1. Fiche athlète ─────────────────────────────────────────────────────────────────────────
test("AthleteProfile expose un lien de retour (onBack) rendu conditionnellement, sans casser l'usage existant sans cette prop", () => {
  const body = extractFnBody(code, 'AthleteProfile');
  assert.ok(/props\.onBack&&h\('button'/.test(body), 'AthleteProfile doit rendre un bouton de retour uniquement si onBack est fourni (rétrocompatible).');
});

test('AthleteProfile affiche le dernier bilan à partir des données déjà présentes (a.bilans), sans nouvelle donnée', () => {
  const body = extractFnBody(code, 'AthleteProfile');
  assert.ok(/var\s+lastBilan\s*=\s*a\.bilans&&a\.bilans\.length\?a\.bilans\[a\.bilans\.length-1\]:null;/.test(body), 'lastBilan doit être lu directement depuis a.bilans (dernier élément), jamais recalculé ou inventé.');
});

test('AthleteProfile conserve la liste complète des bilans (aucune fonctionnalité retirée)', () => {
  const body = extractFnBody(code, 'AthleteProfile');
  assert.ok(/Bilans \(/.test(body), 'La liste des bilans doit rester affichée intégralement, la fiche simplifiée ne doit pas la remplacer.');
  assert.ok(/onDuplicate|onDeleteBilan/.test(body), 'Les actions existantes (dupliquer/supprimer un bilan) doivent rester présentes.');
});

// ── 2. Barre secondaire : 7 destinations, toutes vers des écrans/onglets déjà existants ─────────
test('App() définit la barre secondaire avec exactement les 7 destinations demandées', () => {
  const appBody = extractAppBody(code);
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable dans App().');
  const expectedLabels = ['Synthèse', 'Qualités', 'Biomécanique', 'Tests', 'Body Map', 'Rapport', 'Analyse Expert'];
  expectedLabels.forEach((label) => {
    assert.ok(m[1].includes("label:'" + label + "'"), 'Destination manquante dans la barre secondaire : ' + label);
  });
  const count = (m[1].match(/\{key:/g) || []).length;
  assert.strictEqual(count, 7, 'La barre secondaire doit comporter exactement 7 destinations (elle en compte ' + count + ').');
});

test("Chaque destination de la barre secondaire pointe vers un écran/vue/onglet déjà existant (aucun nouveau composant d'écran)", () => {
  const appBody = extractAppBody(code);
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/)[1];
  // Les seuls screens autorisés à cette phase sont 'analyse' (AnalyseView, déjà existant) et
  // 'reportPreview' (ReportPreview, déjà existant) — jamais un nouveau screen.
  const screens = [...m.matchAll(/screen:'(\w+)'/g)].map((x) => x[1]);
  screens.forEach((s) => assert.ok(s === 'analyse' || s === 'reportPreview', 'Destination inattendue hors périmètre Phase 2 : screen=' + s));
  // Les onglets ciblés doivent tous faire partie des 11 sous-onglets déjà existants d'ExpertView.
  const existingTabs = ['fonctions', 'synthese', 'csmv2', 'kpi', 'variables', 'capacites', 'systemes', 'hypotheses', 'orientations', 'couverture', 'raisonnement'];
  const tabs = [...m.matchAll(/tab:'(\w+)'/g)].map((x) => x[1]);
  tabs.forEach((t) => assert.ok(existingTabs.indexOf(t) >= 0, "L'onglet ciblé '" + t + "' n'existe pas dans ExpertView — Phase 2 ne doit créer aucun nouvel onglet."));
});

test("La navigation secondaire (goSecondary) ne modifie ni l'athlète, ni le bilan, ni la liste des athlètes — uniquement l'écran/la vue affichés", () => {
  const appBody = extractAppBody(code);
  const m = appBody.match(/function goSecondary\(item\)\{([\s\S]*?)\}\n/);
  assert.ok(m, 'goSecondary introuvable.');
  assert.ok(!/setCurId|setCurBilan|setAthletes/.test(m[1]), "goSecondary ne doit jamais toucher curId/curBilan/athletes — seulement l'écran (setScreen) et la vue active (setSecondaryView/setNavNonce).");
  assert.ok(/setScreen\(item\.target\.screen\)/.test(m[1]), 'goSecondary doit naviguer vers item.target.screen.');
});

// ── 3. AnalyseView/ExpertView restent utilisables sans les nouvelles props (comportement par défaut inchangé) ──
test("AnalyseView reste par défaut sur la vue 'expert' si initialView n'est pas fourni (comportement identique à avant Phase 2)", () => {
  const body = extractFnBody(code, 'AnalyseView');
  assert.ok(/useState\(props\.initialView\|\|'expert'\)/.test(body), "AnalyseView doit retomber sur 'expert' par défaut, exactement comme avant cette phase.");
});

test("ExpertView reste par défaut sur l'onglet 'fonctions' si initialTab n'est pas fourni (comportement identique à avant Phase 2)", () => {
  const body = extractFnBody(code, 'ExpertView');
  assert.ok(/useState\(props\.initialTab\|\|'fonctions'\)/.test(body), "ExpertView doit retomber sur 'fonctions' par défaut, exactement comme avant cette phase.");
});

test('Le contexte du bilan (bilan.testData/questData, athlete, normSelections) transmis à AnalyseView est inchangé par cette phase', () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const baseAnalyseBody = extractFnBody(baseCode, 'AnalyseView');
  // computeMoteur doit continuer à être appelé avec exactement les mêmes arguments qu'avant Phase 2.
  const callRegex = /computeMoteur\(bilan\.testData,bilan\.questData,effectiveNormPop\(athlete\),athleteAge,effNormSel\)/;
  assert.ok(callRegex.test(analyseBody), "L'appel à computeMoteur ne doit pas avoir changé.");
  assert.ok(callRegex.test(baseAnalyseBody), 'Vérification de cohérence : le même appel existait déjà avant cette phase.');
});

// ── 4. Non-régression stricte des moteurs cliniques ──────────────────────────────────────────
test('GUARD — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal à la baseline (8349406)', () => {
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'QUALITY_DIAGNOSTIC_VARIABLES_V1', 'CSM_V2_CLINICAL_VARIABLE_MATRIX'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase est UX/navigation uniquement.');
  });
});

test('GUARD — computeMoteur/computeMouvementAnalysis/buildRaisonnementBoardCMJ restent BYTE-IDENTIQUES à la baseline (8349406)', () => {
  ['computeMoteur', 'computeMouvementAnalysis', 'buildRaisonnementBoardCMJ'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — aucun moteur ne doit être touché par cette phase.');
  });
});

test("GUARD — AnalyseView n'a changé que par l'ajout du seed initialView/initialExpertTab et l'offset sticky de sa colonne (44px pour la barre secondaire) — rien d'autre", () => {
  // Substitutions littérales exactes (aucune regex approximative) : chaque token remplacé est la
  // chaîne précise ajoutée par cette phase, reconvertie vers son équivalent baseline. Si le corps
  // obtenu n'est alors plus strictement égal à la baseline, c'est qu'autre chose a changé.
  const currentComment =
    "  // initialView/initialExpertTab (Mission UX/UI V1, Phase 2) : seed d'affichage uniquement, fournis\n" +
    "  // par la barre secondaire persistante de App() pour faire atterrir l'utilisateur sur la vue\n" +
    "  // demandée à l'ouverture du bilan — aucun recalcul, aucune nouvelle donnée : ce sont exactement\n" +
    "  // les mêmes `view`/`tab` internes qui existaient déjà, seulement pré-remplis. AnalyseView reste\n" +
    "  // parfaitement utilisable sans ces props (comportement identique à avant : 'expert' par défaut).\n" +
    "  var [view,setView]=useState(props.initialView||'expert');";
  const baselineDecl = "  var [view,setView]=useState('expert');";
  let body = extractFnBody(code, 'AnalyseView');
  assert.ok(body.includes(currentComment), 'Le commentaire/seed attendu est introuvable tel quel — vérifier une éventuelle reformulation non documentée.');
  body = body.split(currentComment).join(baselineDecl);
  body = body.split(",initialTab:props.initialExpertTab").join('');
  body = body.split("minHeight:'calc(100vh - 136px)'").join("minHeight:'calc(100vh - 96px)'");
  body = body.split("position:'sticky',top:136,").join("position:'sticky',top:96,");
  assert.strictEqual(body, extractFnBody(baseCode, 'AnalyseView'), "AnalyseView a changé au-delà du seed initialView/initialExpertTab et de l'offset sticky attendus pour cette phase.");
});

test("GUARD — ExpertView n'a changé que par l'ajout du seed initialTab — rien d'autre", () => {
  const currentComment =
    "  // initialTab (Mission UX/UI V1, Phase 2) : seed d'affichage fourni par la barre secondaire\n" +
    "  // persistante (App()), pour faire atterrir sur le sous-onglet correspondant à la vue demandée\n" +
    "  // (ex. \"Qualités\" -> 'fonctions', \"Tests\" -> 'kpi'). Aucun recalcul : mêmes onglets, mêmes\n" +
    "  // composants, simplement présélectionnés. Comportement inchangé si non fourni ('fonctions').\n" +
    "  var [tab,setTab]=useState(props.initialTab||'fonctions');";
  const baselineDecl = "  var [tab,setTab]=useState('fonctions');";
  let body = extractFnBody(code, 'ExpertView');
  assert.ok(body.includes(currentComment), 'Le commentaire/seed attendu est introuvable tel quel — vérifier une éventuelle reformulation non documentée.');
  body = body.split(currentComment).join(baselineDecl);
  // ExpertView contient également le fix normSelections (mission précédente, déjà verrouillé par
  // son propre test dédié) — on l'ignore ici, hors périmètre de cette phase, en le neutralisant
  // avant comparaison à la baseline 8349406 qui le contient déjà.
  assert.strictEqual(body, extractFnBody(baseCode, 'ExpertView'), "ExpertView a changé au-delà du seed initialTab attendu pour cette phase.");
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

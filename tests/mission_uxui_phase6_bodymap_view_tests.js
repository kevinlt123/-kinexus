// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — PHASE 6 : Body Map interactif (vraie vue de navigation clinique)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Périmètre : BodyMapView (nouvelle vue dédiée), BodyMapStructureList/Button (sélection réellement
// interactive), BodyMapStructureDetail (panneau de détail). Encapsule BodyMap/muscleMapHTML/
// muscleMapChipsHTML existants SANS LES MODIFIER. Couche de présentation uniquement —
// computeMoteur/HYP/CSM V2/NORMS/THRESHOLDS/LSI/asymétries/relations/mappings ForceDecks ne sont pas
// modifiés (vérifié par guards ci-dessous + snapshot clinique avant/après, voir rapport de phase).
//
// BASELINE_COMMIT : 61924dc (Phase 5), strictement avant cette phase.

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

const BASELINE_COMMIT = '61924dc';
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
const sandbox = new Function('localStorage', sandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,STR_QUAL_DETAIL:STR_QUAL_DETAIL,SYSTEM_TESTS:SYSTEM_TESTS,SYSTEMS:SYSTEMS,MM_SYSTEM_ORDER:MM_SYSTEM_ORDER};")({ _d: {}, getItem() { return null; }, setItem() {} });
const baseSandbox = new Function('localStorage', baseSandboxSrc + "\nreturn {computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX,TFM:TFM,FN_KEY:FN_KEY,STR_QUAL_DETAIL:STR_QUAL_DETAIL,SYSTEM_TESTS:SYSTEM_TESTS,SYSTEMS:SYSTEMS,MM_SYSTEM_ORDER:MM_SYSTEM_ORDER};")({ _d: {}, getItem() { return null; }, setItem() {} });

console.log('MISSION UX/UI V1 — PHASE 6 : Body Map interactif');

// ── 1. BodyMap accessible depuis la barre secondaire, comme vraie vue (pas un onglet Expert) ─────
test('1 — BodyMapView est définie et App() en fait la cible de la barre secondaire "Body Map" (plus un simple onglet Expert)', () => {
  assert.ok(code.includes('function BodyMapView(props){'), 'BodyMapView introuvable.');
  const appBody = extractFnBody(code, 'App');
  const m = appBody.match(/var SECONDARY_NAV=\[([\s\S]*?)\];/);
  assert.ok(m, 'SECONDARY_NAV introuvable.');
  assert.ok(/\{key:'bodymap',label:'Body Map',target:\{screen:'analyse',view:'bodymap'\}\}/.test(m[1]), 'La destination "Body Map" doit cibler view:\'bodymap\' (BodyMapView), pas un onglet d\'ExpertView.');
});

test("2 — AnalyseView route view==='bodymap' vers BodyMapView, sans nouvelle route App(), et masque les blocs 01-06 pour cette vue (pas de double Body Map)", () => {
  const body = extractFnBody(code, 'AnalyseView');
  assert.ok(/view==='bodymap'&&h\(BodyMapView,/.test(body), 'AnalyseView doit rendre BodyMapView pour view===\'bodymap\'.');
  assert.ok(/view!=='synthese'&&view!=='bodymap'&&h\('div',null,/.test(body), 'Les blocs 01-06 (incluant l\'ancien Body Map statique) doivent être masqués pour view===\'bodymap\'.');
});

// ── 2. Structures existantes détectées : uniquement celles déjà représentées ──────────────────────
test('3 — BodyMapStructureList itère exclusivement sur MM_SYSTEM_ORDER (structures déjà représentées dans le Body Map), jamais une nouvelle liste inventée, et "Sensoriel" (jamais dessiné) en est exclu', () => {
  const body = extractFnBody(code, 'BodyMapStructureList');
  assert.ok(body.includes('MM_SYSTEM_ORDER.map'), 'BodyMapStructureList doit itérer sur MM_SYSTEM_ORDER.');
  assert.strictEqual(sandbox.MM_SYSTEM_ORDER.indexOf('Sensoriel'), -1, 'Sensoriel ne doit jamais être ajouté (jamais représenté dans le Body Map actuel).');
  assert.deepStrictEqual(sandbox.MM_SYSTEM_ORDER, baseSandbox.MM_SYSTEM_ORDER, 'MM_SYSTEM_ORDER ne doit pas changer (aucune structure ajoutée/retirée).');
});

// ── 3. muscleMapHTML/BodyMap encapsulés, jamais modifiés ──────────────────────────────────────────
test('4 — muscleMapHTML/muscleMapChipsHTML/BodyMap restent BYTE-IDENTIQUES vs baseline (encapsulés par BodyMapView, jamais modifiés)', () => {
  assert.strictEqual(extractFnBody(code, 'muscleMapHTML'), extractFnBody(baseCode, 'muscleMapHTML'), 'muscleMapHTML a changé — doit rester encapsulé tel quel (§12 mission).');
  assert.strictEqual(extractFnBody(code, 'muscleMapChipsHTML'), extractFnBody(baseCode, 'muscleMapChipsHTML'), 'muscleMapChipsHTML a changé — doit rester encapsulé tel quel.');
  assert.strictEqual(extractFnBody(code, 'BodyMap'), extractFnBody(baseCode, 'BodyMap'), 'BodyMap (wrapper React existant) a changé — doit rester encapsulé tel quel.');
  const viewBody = extractFnBody(code, 'BodyMapView');
  assert.ok(viewBody.includes('h(BodyMap,{systemScores:sysSc'), 'BodyMapView doit réutiliser le composant BodyMap existant (visuel inchangé), pas le redessiner.');
});

// ── 4. Structure sélectionnable, état sélectionné, focus clavier ─────────────────────────────────
test('5 — Chaque structure devient sélectionnable via un vrai <button> natif (focusable/activable au clavier par défaut), avec état sélectionné visuellement distinct (aria-pressed)', () => {
  const body = extractFnBody(code, 'BodyMapStructureButton');
  assert.ok(/h\('button',\{/.test(body), 'Doit être un vrai élément <button> (accessibilité clavier native).');
  assert.ok(body.includes("'aria-pressed':selected"), 'Doit exposer aria-pressed pour l\'état sélectionné (accessibilité).');
  assert.ok(body.includes("border:'1px solid '+(selected?C.teal:C.border)"), 'L\'état sélectionné doit être visuellement distinct (bordure), pas seulement une couleur de statut.');
});

test('6 — BodyMapView gère un état selected local (useState), sans nouvelle route App(), et affiche BodyMapStructureDetail seulement quand une structure est sélectionnée', () => {
  const body = extractFnBody(code, 'BodyMapView');
  assert.ok(/var \[selected,setSelected\]=useState\(null\);/.test(body), 'selected doit être un état local de BodyMapView.');
  assert.ok(/selected\s*\n?\s*\?h\(BodyMapStructureDetail,/.test(body.replace(/\s+/g, ' ')), 'BodyMapStructureDetail doit être affiché uniquement quand selected est défini.');
});

// ── 5. Panneau de détail : statut, D/G/LSI, qualités et tests associés ────────────────────────────
test('7 — BodyMapStructureDetail affiche le statut depuis res.systemScores[sys] déjà calculé (jamais un nouveau statut), avec repli explicite "Pas de donnée disponible" si null', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes('var status=res.systemScores[sys];'), 'Doit lire res.systemScores[sys] tel quel.');
  assert.ok(body.includes("'Pas de donnée disponible'"), 'Doit afficher explicitement "Pas de donnée disponible" si aucun statut (jamais "Optimal" par défaut, §6 mission).');
  assert.ok(!/status\s*\|\|\s*'vert'|status\s*\|\|\s*'preserved'/.test(body), 'Ne doit jamais retomber sur un statut positif par défaut.');
});

test('8 — Les données D/G/LSI proviennent EXCLUSIVEMENT de pres.asymItems déjà calculé (Phase 4, via testKey), jamais un recalcul de LSI/asymétrie', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes('pres.asymItems.filter(function(a){return a.testKey===tk;})[0]'), 'Doit retrouver le D/G/LSI déjà calculé via testKey (même technique que PreuvesPrincipalesCard, Phase 4/5).');
  assert.ok(!/autoLSI\(|lsiSt\(/.test(body), 'BodyMapStructureDetail ne doit jamais appeler autoLSI/lsiSt elle-même (aucun recalcul, §1/§8 mission).');
});

test('9 — LSI affiché tel quel (jamais réinterprété comme un déficit absolu) : la valeur vient de a.lsi, jamais d\'une comparaison à un seuil recalculée dans la vue', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes("'LSI '+a.lsi+'%'"), 'Le LSI doit être affiché tel quel (a.lsi), sans reformulation.');
  assert.ok(!/a\.lsi\s*[<>=]/.test(body), 'BodyMapStructureDetail ne doit jamais comparer/interpréter le LSI elle-même (aucune règle de seuil recalculée).');
});

// ── 6. Relations structure -> qualité : uniquement celles déjà existantes (STR_QUAL_DETAIL) ──────
test('10 — Les "Qualités associées" proviennent EXCLUSIVEMENT de STR_QUAL_DETAIL[sys] déjà existant, jamais une nouvelle association anatomie -> qualité inventée', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes('var qualRel=STR_QUAL_DETAIL[sys]||null;'), 'Doit lire STR_QUAL_DETAIL[sys] tel quel.');
  assert.strictEqual(extractFnBody(code, 'BodyMapStructureDetail').includes('STR_QUAL_DETAIL[sys]'), true);
  // STR_QUAL_DETAIL lui-même doit rester inchangé (référentiel existant, jamais étendu pour cette phase).
  assert.deepStrictEqual(sandbox.STR_QUAL_DETAIL, baseSandbox.STR_QUAL_DETAIL, 'STR_QUAL_DETAIL a changé — cette phase ne doit ajouter aucune association anatomie -> qualité.');
});

test('11 — Relation inexistante (qualité absente de STR_QUAL_DETAIL[sys]) : rien n\'est affiché à sa place (jamais une relation inventée à partir du nom de la structure)', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes("qualKeys.length===0"), 'Doit gérer explicitement le cas où aucune relation n\'existe pour cette structure.');
  assert.ok(body.includes("'Aucune relation documentée pour cette structure.'"), 'Doit afficher un message honnête d\'absence de relation, jamais une relation construite.');
});

test('12 — Directe -> présentée comme telle, Indirecte -> formulation prudente (§9 mission) — reprend spécificite déjà existant, jamais un nouvel enum DIRECT/ASSOCIATED inventé', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes("rel.specificite==='Directe'"), 'Doit distinguer sur le champ specificite déjà existant.');
  assert.ok(body.includes('relation directe') && body.includes('association indirecte'), 'Doit employer une formulation prudente pour Indirecte, distincte de Directe.');
});

// ── 7. Tests associés : uniquement ceux réellement reliés (SYSTEM_TESTS + actifs) ─────────────────
test('13 — "Tests associés" et [Voir les tests] réutilisent SYSTEM_TESTS[sys] filtré sur les tests réellement actifs (td[tk].active), jamais une nouvelle liste de tests inventée', () => {
  const body = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(body.includes('var testKeys=SYSTEM_TESTS[sys]||[];'), 'Doit lire SYSTEM_TESTS[sys] tel quel.');
  assert.ok(body.includes('testKeys.filter(function(tk){return td[tk]&&td[tk].active;})'), 'Doit filtrer sur les tests réellement actifs dans le bilan.');
  assert.deepStrictEqual(sandbox.SYSTEM_TESTS, baseSandbox.SYSTEM_TESTS, 'SYSTEM_TESTS a changé — aucun nouveau mapping structure -> test ne doit être inventé.');
});

// ── 8. Navigation : test/qualité, contexte préservé ───────────────────────────────────────────────
test('14 — [Voir les tests] réutilise onGotoExpertTab(\'kpi\') (vue Tests existante), la navigation vers une qualité réutilise le même mécanisme que QualitesView (setOpenQuality+view=\'qualites\'), et le contexte athlète/bilan est conservé (mêmes props res/pres/bilan/athlete transmises telles quelles)', () => {
  const viewBody = extractFnBody(code, 'BodyMapView');
  assert.ok(viewBody.includes("onGotoExpertTab:function(tab){setExpertTabTarget(tab);setView('expert');}") === false, 'BodyMapView ne définit pas onGotoExpertTab elle-même (reçu en prop depuis AnalyseView).');
  const analyseBody = extractFnBody(code, 'AnalyseView');
  assert.ok(/h\(BodyMapView,\{res:res,pres:pres,bilan:bilan,athlete:athlete,/.test(analyseBody), 'AnalyseView doit transmettre res/pres/bilan/athlete (contexte complet) à BodyMapView.');
  assert.ok(analyseBody.includes("onOpenQuality:function(f){setOpenQuality(f);setView('qualites');}"), 'La navigation vers une qualité doit réutiliser openQuality/view=\'qualites\', comme QualitesView (Phase 4), pas une nouvelle route.');
  const detailBody = extractFnBody(code, 'BodyMapStructureDetail');
  assert.ok(detailBody.includes('onGotoTests&&activeTests.length>0&&h(Btn,{onClick:onGotoTests}'), '[Voir les tests] doit être présent et piloté par onGotoTests (kpi, vue existante).');
});

// ── 9. Aucune modification clinique (HYP/CSM V2/NORMS/THRESHOLDS/mappings ForceDecks) ─────────────
test('GUARD — computeMoteur/NORMS/NORMS_V2/THRESHOLDS/CSM_V2_CLINICAL_VARIABLE_MATRIX/TFM/FN_KEY/STR_QUAL_DETAIL/SYSTEM_TESTS/SYSTEMS restent inchangés vs baseline (61924dc)', () => {
  assert.strictEqual(extractFnBody(code, 'computeMoteur'), extractFnBody(baseCode, 'computeMoteur'), 'computeMoteur a changé — cette phase est UX uniquement.');
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'CSM_V2_CLINICAL_VARIABLE_MATRIX', 'TFM', 'FN_KEY', 'STR_QUAL_DETAIL', 'SYSTEM_TESTS', 'SYSTEMS'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — cette phase ne doit toucher aucune norme/seuil/référentiel/mapping.');
  });
});

test('GUARD — Les 8 moteurs HYP-XX-01 et computeCsmV2/computeHypClinicalSynthesis01 restent BYTE-IDENTIQUES vs baseline (61924dc)', () => {
  ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01', 'computeCsmV2', 'computeHypClinicalSynthesis01'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — interdit par cette mission (§1).');
  });
});

test('GUARD — computeAnalysePresentation (source de pres.asymItems) reste BYTE-IDENTIQUE vs baseline (61924dc)', () => {
  assert.strictEqual(extractFnBody(code, 'computeAnalysePresentation'), extractFnBody(baseCode, 'computeAnalysePresentation'), 'computeAnalysePresentation a changé — le Body Map ne doit consommer que des D/G/LSI déjà calculés par cette fonction inchangée.');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

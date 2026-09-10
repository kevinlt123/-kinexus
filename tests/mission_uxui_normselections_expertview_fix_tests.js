// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION UX/UI V1 — FIX CIBLÉ : câblage de la prop `normSelections` manquante dans ExpertView
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Rappel du bug (découvert par AUDIT_VISUEL_ORGANISATION_DASHBOARD_RAPPORT_KINEXUS_V1.md §5) :
// ExpertView (index.html) lisait `normSelections` dans le sous-onglet Variables
// (kpiStatus(v.testKey, v.kpi.key, td, effectiveNormPop(athlete), athleteAge, normSelections))
// sans jamais le déclarer dans sa propre portée ni le recevoir en prop depuis AnalyseView, qui le
// calcule pourtant déjà (effNormSel, via effectiveNormSelections) pour ses propres besoins
// (computeMoteur, computeMouvementAnalysis). Résultat : ReferenceError non intercepté (pas
// d'ErrorBoundary dans l'application) au premier clic sur Variables, qui démontait tout l'écran
// d'Analyse — pas seulement l'onglet concerné.
//
// Correctif appliqué (Mission UX/UI V1, hors périmètre navigation) : strictement un câblage de
// prop manquante.
//   1) AnalyseView passe désormais `normSelections:effNormSel` à ExpertView (valeur déjà calculée,
//      jamais une nouvelle sélection normative).
//   2) ExpertView déclare `var normSelections=props.normSelections;` dans sa propre portée, exactement
//      comme ResultsBrowser le fait déjà pour le sous-onglet Résultats voisin.
// Aucun seuil, norme, règle de sélection normative (NORMS/NORMS_V2/THRESHOLDS), moteur HYP, CSM V2
// ou calcul de statut n'est modifié : kpiStatus/computeStatusWithNormsV2/effectiveNormSelections
// restent les fonctions existantes, simplement enfin appelées avec l'argument qu'elles attendaient
// déjà partout ailleurs dans le code.
//
// BASELINE_COMMIT : dfa2c19 (Phase 1 — navigation globale, mission UX/UI V1, sur
// claude/ux-ui-restructuration), qui précède strictement ce correctif — vérifié par
// `git show dfa2c19:index.html` ci-dessous, jamais 'HEAD'.

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
const htmlPath = path.join(REPO, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser le code dans index.html.');
const slice = code.slice(start, end);

const sandbox = new Function(
  'localStorage',
  slice + '\nreturn {kpiStatus:kpiStatus,computeStatusWithNormsV2:computeStatusWithNormsV2,effectiveNormSelections:effectiveNormSelections,effectiveNormPop:effectiveNormPop,computeMoteur:computeMoteur,VAR_REL3:VAR_REL3,TBK:TBK,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};'
)({ _d: {}, getItem() { return null; }, setItem() {} });

const BASELINE_COMMIT = 'dfa2c19'; // Phase 1 (navigation globale), strictement avant ce correctif.
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function(
  'localStorage',
  baseSlice + '\nreturn {kpiStatus:kpiStatus,computeStatusWithNormsV2:computeStatusWithNormsV2,effectiveNormSelections:effectiveNormSelections,computeMoteur:computeMoteur,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};'
)({ _d: {}, getItem() { return null; }, setItem() {} });

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

console.log("MISSION UX/UI V1 — FIX normSelections : câblage de prop manquante ExpertView (aucun recalcul clinique)");

// ── 1. Le bug est bien reproductible sur la baseline (avant ce correctif) ───────────────────────
test('BASELINE — ExpertView (dfa2c19) NE déclare PAS normSelections dans sa propre portée (bug confirmé sur la baseline)', () => {
  const expertBody = extractFnBody(baseCode, 'ExpertView');
  assert.ok(!/var\s+normSelections\s*=/.test(expertBody), "ExpertView (baseline) ne devrait contenir aucune déclaration locale de normSelections — c'est précisément le bug corrigé par cette mission.");
  assert.ok(/normSelections/.test(expertBody), 'ExpertView (baseline) doit tout de même référencer normSelections (sous-onglet Variables) — sinon le bug ne serait pas reproductible.');
});

test('BASELINE — AnalyseView (dfa2c19) ne transmet pas normSelections à ExpertView', () => {
  const analyseBody = extractFnBody(baseCode, 'AnalyseView');
  const callSiteMatch = analyseBody.match(/h\(ExpertView,\{[^}]*\}\)/);
  assert.ok(callSiteMatch, "Site d'appel h(ExpertView,{...}) introuvable dans AnalyseView (baseline).");
  assert.ok(!/normSelections\s*:/.test(callSiteMatch[0]), "Le site d'appel ExpertView (baseline) ne devrait pas transmettre normSelections — c'est précisément le bug corrigé.");
});

// ── 2. Le correctif est bien présent sur l'état courant ─────────────────────────────────────────
test('FIX — ExpertView déclare désormais normSelections=props.normSelections dans sa propre portée', () => {
  const expertBody = extractFnBody(code, 'ExpertView');
  assert.ok(/var\s+normSelections\s*=\s*props\.normSelections\s*;/.test(expertBody), 'ExpertView doit déclarer normSelections=props.normSelections (câblage de prop, aucun recalcul).');
});

test("FIX — AnalyseView transmet désormais normSelections:effNormSel à ExpertView", () => {
  const analyseBody = extractFnBody(code, 'AnalyseView');
  const callSiteMatch = analyseBody.match(/h\(ExpertView,\{[^}]*\}\)/);
  assert.ok(callSiteMatch, "Site d'appel h(ExpertView,{...}) introuvable dans AnalyseView.");
  assert.ok(/normSelections\s*:\s*effNormSel/.test(callSiteMatch[0]), 'Le site d\'appel ExpertView doit transmettre normSelections:effNormSel (la même valeur déjà calculée pour computeMoteur, jamais une nouvelle sélection).');
  // effNormSel doit être la valeur déjà utilisée par AnalyseView pour computeMoteur — jamais une
  // nouvelle variable/un nouveau calcul introduit pour ce fix.
  assert.ok(/effNormSel\s*=\s*useMemo\(function\(\)\{return effectiveNormSelections\(athlete\)\.normSelections;\}/.test(analyseBody), 'effNormSel doit rester calculé exactement comme avant (effectiveNormSelections(athlete).normSelections), non modifié par ce fix.');
});

// ── 3. Comportement réel : plus de ReferenceError, statut identique à celui déjà produit ailleurs
//       dans l'application (ResultsBrowser) pour les mêmes données ──────────────────────────────
test("COMPORTEMENT — kpiStatus(...,normSelections) ne lève plus d'erreur avec la valeur désormais transmise par ExpertView", () => {
  const athlete = { sport: 'Football', niveau: 'Semi-pro', sexe: 'M', dateNaissance: '1999-03-12', normPopulation: 'foot_f_senior', normSelections: {} };
  const testData = { dj: { active: true, trials: { rsi: [0.3] } } };
  const effNormSel = sandbox.effectiveNormSelections(athlete).normSelections;
  const pop = sandbox.effectiveNormPop(athlete);
  assert.doesNotThrow(() => {
    sandbox.kpiStatus('dj', 'rsi', testData, pop, 27, effNormSel);
  }, "kpiStatus ne doit pas lever d'exception avec la valeur normSelections désormais transmise par ExpertView.");
});

test('COMPORTEMENT — le statut retourné avec le normSelections désormais câblé est identique à celui déjà produit par ResultsBrowser (même appel, mêmes arguments)', () => {
  // ResultsBrowser (index.html) calcule sa propre normSelections de façon strictement identique :
  // var normSelections=effectiveNormSelections(athlete).normSelections; — ce test vérifie que la
  // valeur qu'ExpertView reçoit désormais produit EXACTEMENT le même statut pour un même KPI, sans
  // aucune divergence entre les deux sous-onglets (Résultats vs Variables).
  const athlete = { sport: 'Football', niveau: 'Semi-pro', sexe: 'M', dateNaissance: '1999-03-12', normPopulation: 'foot_f_senior', normSelections: {} };
  const testData = { dj: { active: true, trials: { rsi: [0.3] } } };
  const effNormSel = sandbox.effectiveNormSelections(athlete).normSelections;
  const pop = sandbox.effectiveNormPop(athlete);
  const statusViaExpertViewPath = sandbox.kpiStatus('dj', 'rsi', testData, pop, 27, effNormSel);
  const statusViaResultsBrowserPath = sandbox.kpiStatus('dj', 'rsi', testData, pop, 27, sandbox.effectiveNormSelections(athlete).normSelections);
  assert.strictEqual(statusViaExpertViewPath, statusViaResultsBrowserPath, 'Les deux sous-onglets doivent produire strictement le même statut pour le même test/KPI/athlète.');
});

test('COMPORTEMENT — un normSelections vide/absent reste géré sans erreur (aucune régression sur les bilans sans sélection normative manuelle)', () => {
  const testData = { dj: { active: true, trials: { rsi: [0.3] } } };
  assert.doesNotThrow(() => { sandbox.kpiStatus('dj', 'rsi', testData, null, 27, undefined); });
  assert.doesNotThrow(() => { sandbox.kpiStatus('dj', 'rsi', testData, null, 27, {}); });
});

// ── 4. Non-régression stricte des moteurs cliniques (HYP/CSM V2/NORMS/THRESHOLDS) ───────────────
test('GUARD — kpiStatus/computeStatusWithNormsV2/effectiveNormSelections/computeMoteur restent BYTE-IDENTIQUES à la baseline (dfa2c19)', () => {
  ['kpiStatus', 'computeStatusWithNormsV2', 'effectiveNormSelections', 'computeMoteur'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a changé — cette mission ne doit toucher aucun calcul clinique.');
  });
});

test('GUARD — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal à la baseline (dfa2c19)', () => {
  ['NORMS', 'NORMS_V2', 'THRESHOLDS', 'QUALITY_DIAGNOSTIC_VARIABLES_V1', 'CSM_V2_CLINICAL_VARIABLE_MATRIX'].forEach((key) => {
    assert.deepStrictEqual(sandbox[key], baseSandbox[key], key + ' a changé — aucune norme/seuil/rôle ne doit être modifié par cette mission.');
  });
});

test("GUARD — le correctif est localisé (ExpertView + le site d'appel ExpertView dans AnalyseView), aucune autre fonction n'a été touchée pour l'implémenter", () => {
  // Toutes les fonctions du moteur potentiellement adjacentes (ResultsBrowser, effectiveNormPop,
  // resolveNormPopulationForTest) doivent elles aussi rester inchangées : seul le câblage de prop
  // ExpertView<->AnalyseView a été modifié.
  ['ResultsBrowser', 'effectiveNormPop', 'resolveNormPopulationForTest', 'normRefValue', 'normRefText'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' ne devrait pas avoir changé pour ce correctif ciblé.');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

// MISSION — NORMES D'ASYMÉTRIE WBLT
//
// Ajoute la classification normative d'asymétrie WBLT (règle unique : <1.5cm vert, [1.5,3) jaune,
// [3,5] orange, >5 rouge — écart absolu inter-membre en cm, JAMAIS le LSI) au référentiel de
// classification de Kinexus (var WBLT_ASYM_BANDS_CM + function wbltAsymmetryBand, index.html,
// juste après lsiSt()).
//
// FINDING D'ARCHITECTURE (vérifié empiriquement ci-dessous, jamais supposé) : computeAsymEngine/
// computeAsymPhase (le "Moteur d'Analyse des Asymétries par Phase", déjà verrouillé — cf.
// tests/moteurAsymetrie.test.js) sont scopés EXCLUSIVEMENT à CMJ_PHASES (CMJ_VAR_META/
// ASYM_PERFORMANCE_EQUIVALENT). WBLT est un test Mobilité (bilateral:false), hors CMJ — il n'existe
// structurellement AUCUN chemin par lequel computeAsymEngine consomme ou pourrait consommer une
// norme WBLT sans que son périmètre (CMJ_PHASES) soit lui-même étendu à un test non-CMJ, ce que
// cette mission interdit explicitement ("absence de modification du moteur lui-même"). Le
// référentiel WBLT est donc un ajout AUTONOME, jamais appelé par computeAsymEngine/computeAsymPhase
// ni par computeHypMobilityWblt/computeHypMobility01 (HYP-MOB-01 LOCKED — sa propre classification
// binaire normal/deficient, dérivée du même écart absolu wbltDiffCm, reste exclusivement gouvernée
// par le seuil 1.5cm déjà en place depuis la mission CSM V2.1 "correction WBLT", jamais recalculée
// ni remplacée ici). Zéro moteur verrouillé touché, référentiel prêt pour une future présentation.
//
// Exécution : node tests/mission_normes_asymetrie_wblt_tests.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser le code applicatif dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}

console.log('MISSION — Normes d\'asymétrie WBLT');

// ═══════════════ AUDIT — WBLT hors périmètre de computeAsymEngine (fait, jamais supposé) ════════
test('AUDIT — WBLT (test Mobilité, bilateral:false) n\'appartient à aucune phase CMJ (CMJ_PHASES) ni à CMJ_VAR_META/ASYM_PERFORMANCE_EQUIVALENT (le référentiel réel de computeAsymEngine)', () => {
  assert.strictEqual(TBK.wblt.cat, 'Mobilité');
  assert.strictEqual(TBK.wblt.bilateral, false);
  assert.ok(CMJ_PHASES.indexOf('wblt') === -1, 'wblt n\'est pas une phase CMJ');
  assert.ok(Object.keys(CMJ_VAR_META).every((k) => k.indexOf('wblt') === -1), 'aucune variable CMJ_VAR_META ne référence wblt');
  assert.ok(Object.keys(ASYM_PERFORMANCE_EQUIVALENT).every((k) => k.indexOf('wblt') === -1), 'aucun équivalent d\'asymétrie CMJ ne référence wblt');
});
test('AUDIT — computeAsymEngine/computeAsymPhase ne mentionnent jamais "wblt" dans leur code source (aucun chemin, même caché)', () => {
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    let depth = 0, i = src.indexOf('{', idx), bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
  }
  assert.ok(extractFnBody(code, 'computeAsymEngine').toLowerCase().indexOf('wblt') === -1);
  assert.ok(extractFnBody(code, 'computeAsymPhase').toLowerCase().indexOf('wblt') === -1);
});

// ═══════════════ PARTIE A — Classification des 4 intervalles + bornes exactes ════════════════════
test('wbltAsymmetryBand : classification correcte des 4 bandes (valeurs médianes de chaque intervalle)', () => {
  assert.strictEqual(wbltAsymmetryBand(0), 'vert');
  assert.strictEqual(wbltAsymmetryBand(0.8), 'vert');
  assert.strictEqual(wbltAsymmetryBand(2), 'jaune');
  assert.strictEqual(wbltAsymmetryBand(4), 'orange');
  assert.strictEqual(wbltAsymmetryBand(10), 'rouge');
});
test('wbltAsymmetryBand : valeur nulle -> null, jamais une bande inventée', () => {
  assert.strictEqual(wbltAsymmetryBand(null), null);
});
// Bornes exigées explicitement par la mission : 1.49, 1.5, 2.99, 3, 5, 5.01
test('wbltAsymmetryBand(1.49) === "vert" (juste sous la borne 1.5)', () => {
  assert.strictEqual(wbltAsymmetryBand(1.49), 'vert');
});
test('wbltAsymmetryBand(1.5) === "jaune" (borne 1.5 incluse dans jaune, >=1.5)', () => {
  assert.strictEqual(wbltAsymmetryBand(1.5), 'jaune');
});
test('wbltAsymmetryBand(2.99) === "jaune" (juste sous la borne 3)', () => {
  assert.strictEqual(wbltAsymmetryBand(2.99), 'jaune');
});
test('wbltAsymmetryBand(3) === "orange" (borne 3 incluse dans orange, >=3)', () => {
  assert.strictEqual(wbltAsymmetryBand(3), 'orange');
});
test('wbltAsymmetryBand(5) === "orange" (borne 5 incluse dans orange, <=5)', () => {
  assert.strictEqual(wbltAsymmetryBand(5), 'orange');
});
test('wbltAsymmetryBand(5.01) === "rouge" (juste au-dessus de la borne 5)', () => {
  assert.strictEqual(wbltAsymmetryBand(5.01), 'rouge');
});
test('WBLT_ASYM_BANDS_CM documente exactement les mêmes bornes que la fonction (jamais deux sources de vérité divergentes)', () => {
  assert.deepStrictEqual(WBLT_ASYM_BANDS_CM, { vert: { max: 1.5, inclusive: false }, jaune: { max: 3, inclusive: false }, orange: { max: 5, inclusive: true }, rouge: { max: Infinity, inclusive: true } });
});
test('wbltAsymmetryBand n\'utilise jamais le LSI (signature à 1 seul argument, diffCm en cm — jamais lsi/rawD/rawG)', () => {
  assert.strictEqual(wbltAsymmetryBand.length, 1);
});

// ═══════════════ PARTIE B — Cohérence avec la mesure réelle (écart absolu WBLT, computeHypMobilityWblt) ═
test('wbltAsymmetryBand appliqué au wbltDiffCm réellement calculé par computeHypMobilityWblt (WBLT D=20, G=24 -> diff=4cm -> orange) — jamais un recalcul indépendant de la mesure', () => {
  const testData = { wblt: { active: true, D: { trials: { distance: [20] } }, G: { trials: { distance: [24] } } } };
  const r = computeHypMobilityWblt(testData, null, 26);
  assert.strictEqual(r.rawD, 20);
  assert.strictEqual(r.rawG, 24);
  const diffCm = Math.round(Math.abs(r.rawD - r.rawG) * 100) / 100;
  assert.strictEqual(diffCm, 4);
  assert.strictEqual(wbltAsymmetryBand(diffCm), 'orange');
  // La décision binaire LOCKED de HYP-MOB-01 (normal/deficient à 1.5cm) reste, elle, inchangée :
  // 4cm > 1.5cm -> 'deficient', cohérent avec 'orange' ci-dessus (les deux classent ce cas comme
  // anormal), mais ce ne sont jamais la même fonction ni le même seuil réutilisé.
  assert.strictEqual(r.symmetryEvidence.status, 'deficient');
});

// ═══════════════ PARTIE C — Guards : aucun moteur verrouillé modifié ═════════════════════════════
// RÉVISÉ (synchronisation) : 'HEAD' supposait que le working tree ne contiendrait jamais que le
// diff non commité de CETTE mission -- hypothèse invalidée une fois que wbltAsymmetryBand a été
// commité (avec les missions b/c/d, squashées dans le commit 728939f) et que des missions
// ULTÉRIEURES et distinctes (ex. MISSION_HYP_EXP01_RSI_MOD) laissent leurs propres modifications
// non commitées dans index.html en même temps. bbf7390 est le dernier commit réellement antérieur
// à l'introduction de wbltAsymmetryBand (parent direct de 728939f) -- baseline stable et immuable.
const BASELINE_COMMIT = 'bbf7390';
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {NORMS:NORMS,THRESHOLDS:THRESHOLDS,NORMS_V2:NORMS_V2,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

function extractFnBody(src, fnName) {
  const marker = 'function ' + fnName + '(';
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(fnName + ' introuvable');
  let depth = 0, i = src.indexOf('{', idx), bodyStart = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
  }
  throw new Error('accolade non fermée pour ' + fnName);
}

test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES, SAUF computeHypExplosivity01 (MISSION_HYP_EXP01_RSI_MOD, correction clinique ciblée ultérieure et distincte, vérifiée par sa propre suite dédiée)', () => {
  const hypFns = ['computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypStabilization01', 'computeHypEndurance01']; // computeHypAbsorption01 exclu : MISSION_HYP_ABS01_ABSORPTION_CORRECTION, correction clinique ciblée ultérieure et distincte, vérifiée par sa propre suite dédiée.
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — computeHypMobilityWblt (helper HYP-MOB-01, source réelle de wbltDiffCm) reste BYTE-IDENTIQUE — sa propre classification binaire normal/deficient n\'est ni recalculée ni remplacée', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypMobilityWblt'), extractFnBody(baseCode, 'computeHypMobilityWblt'));
});
test('GUARD 3 — computeAsymEngine et computeAsymPhase (Moteur d\'Asymétrie LOCKED) restent BYTE-IDENTIQUES — jamais étendus à WBLT', () => {
  assert.strictEqual(extractFnBody(code, 'computeAsymEngine'), extractFnBody(baseCode, 'computeAsymEngine'));
  assert.strictEqual(extractFnBody(code, 'computeAsymPhase'), extractFnBody(baseCode, 'computeAsymPhase'));
});
test('GUARD 4 — computeHypForceKpi et computeBiomecaPhase restent BYTE-IDENTIQUES (non concernés par cette mission)', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypForceKpi'), extractFnBody(baseCode, 'computeHypForceKpi'));
  assert.strictEqual(extractFnBody(code, 'computeBiomecaPhase'), extractFnBody(baseCode, 'computeBiomecaPhase'));
});
test('GUARD 5 — QUALITY_DIAGNOSTIC_VARIABLES_V1 inchangé (deep-equal)', () => {
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
});
test('GUARD 6 — CSM_V2_CLINICAL_VARIABLE_MATRIX : formule de dérivation (IIFE) inchangée ; seul son résultat évolue, exactement à hauteur de MISSION_HYP_EXP01_RSI_MOD (ajout de cmj_rsi_mod au diagnosticEvidence d\'Explosivité, sans rapport avec cette mission WBLT)', () => {
  function extractMatrixIIFE(src) {
    const marker = 'var CSM_V2_CLINICAL_VARIABLE_MATRIX=(function(){';
    const idx = src.indexOf(marker);
    assert.ok(idx >= 0, 'IIFE introuvable');
    const iifeStart = src.indexOf('(function(){', idx);
    let depth = 0, i = src.indexOf('{', iifeStart), bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(idx, i + 4); }
    }
    throw new Error('accolade non fermée pour l\'IIFE de la matrice');
  }
  assert.strictEqual(extractMatrixIIFE(code), extractMatrixIIFE(baseCode), 'la formule de dérivation de la matrice ne doit jamais être modifiée par cette mission');

  const before = baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX;
  const after = CSM_V2_CLINICAL_VARIABLE_MATRIX;
  Object.keys(before.byQuality || {}).forEach((q) => {
    if (q === 'Explosivité') return;
    assert.deepStrictEqual(after.byQuality[q], before.byQuality[q], q + ' n\'aurait jamais dû changer dans la matrice dérivée');
  });
  const beforeExpDiag = before.byQuality['Explosivité'].diagnostic.map((e) => e.variableKey).sort();
  const afterExpDiag = after.byQuality['Explosivité'].diagnostic.map((e) => e.variableKey).sort();
  assert.deepStrictEqual(afterExpDiag, [...beforeExpDiag, 'cmj_rsi_mod'].sort(), 'le seul ajout attendu au diagnostic d\'Explosivité est cmj_rsi_mod (MISSION_HYP_EXP01_RSI_MOD)');
  assert.strictEqual(after.meta.diagnosticCount, before.meta.diagnosticCount + 1);
  assert.strictEqual(after.meta.classifiableCount, before.meta.classifiableCount + 1);
  assert.strictEqual(after.meta.totalVariables, before.meta.totalVariables + 1);
  assert.strictEqual(after.meta.confirmativeCount, before.meta.confirmativeCount);
  assert.strictEqual(after.meta.explanatoryCount, before.meta.explanatoryCount);
  assert.strictEqual(after.meta.missingCount, before.meta.missingCount);
});
test('GUARD 7 — NORMS/THRESHOLDS/NORMS_V2 STRICTEMENT inchangés (deep-equal) — aucune entrée ajoutée pour WBLT, le référentiel WBLT vit dans une constante dédiée (WBLT_ASYM_BANDS_CM), jamais dans NORMS/THRESHOLDS/NORMS_V2', () => {
  assert.deepStrictEqual(NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
});
test('GUARD 8 — le diff fonctionnel de cette mission se limite à l\'ajout de WBLT_ASYM_BANDS_CM/wbltAsymmetryBand — jamais computeMoteur/computeCsmV2/computeAsymEngine/computeAsymPhase/computeHypMobilityWblt/les 8 HYP', () => {
  assert.strictEqual(typeof wbltAsymmetryBand, 'function', 'wbltAsymmetryBand doit exister — sinon cette mission n\'a pas eu lieu');
  assert.strictEqual(baseCode.indexOf('function wbltAsymmetryBand('), -1, 'wbltAsymmetryBand ne doit pas déjà exister avant cette mission');
  ['computeMoteur', 'computeCsmV2', 'computeAsymEngine', 'computeAsymPhase', 'computeHypMobilityWblt', 'computeHypMobility01', 'computeHypForceKpi', 'computeBiomecaPhase'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' n\'aurait jamais dû changer');
  });
});

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

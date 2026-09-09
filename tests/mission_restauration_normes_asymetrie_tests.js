// MISSION — RESTAURATION DES NORMES D'ASYMÉTRIE EN PRODUCTION
//
// RÉGRESSION CORRIGÉE : le commit dbd93ad ("decision: B.League comme population automatique du
// Moteur Biomécanique (analyse par phase CMJ)") avait fait passer la MÊME population
// (effectiveCmjPhaseAnalysisPopulation() = 'bball2425_bleague') au Moteur Biomécanique de phase ET
// au Moteur d'Analyse des Asymétries par Phase dans computeMouvementAnalysis(). Audit de couverture
// NORMS (ci-dessous, AUDIT 1) : bball2425_bleague, et en réalité AUCUNE des 64 populations du
// catalogue, ne couvre la moindre variable d'asymétrie confirmée (cmj_*_asym) -> le Moteur
// d'Asymétrie répondait "Données insuffisantes" pour les 5 phases, pour TOUT patient réel, quelle
// que soit sa sévérité — alors qu'avant dbd93ad, la population transmise était
// effectiveNormPop(athlete) (population réellement assignée au patient), seule à pouvoir un jour
// porter des normes d'asymétrie (cf. fixtures de test qui, elles, en définissent).
//
// CORRECTIF (scopé, additif) : computeMouvementAnalysis(bilan,pop,age,functionScores,asymPop)
// reçoit un 5e paramètre OPTIONNEL, jamais utilisé que par le seul appel à computeAsymEngine
// (asymPop||pop). Omis -> comportement STRICTEMENT inchangé (asymPop retombe sur pop), donc aucune
// régression sur les appels directs déjà verrouillés par d'autres suites (tests/moteurAsymetrie.
// test.js, tests/filDeRaisonnement.test.js, etc., qui n'utilisent jamais ce 5e argument). Les 2
// SEULS appelants réels (buildSportifReport, AnalyseView) transmettent désormais
// effectiveNormPop(athlete) comme asymPop — restaurant exactement le chemin de données d'avant
// dbd93ad pour le Moteur d'Asymétrie SEUL — tout en conservant bball2425_bleague pour le Moteur de
// Phase (décision produit distincte, jamais remise en cause ici).
//
// NE TOUCHE JAMAIS : computeAsymEngine, computeAsymPhase (Moteur d'Asymétrie, déjà verrouillé),
// les 8 moteurs HYP-XX-01, computeHypForceKpi, computeBiomecaPhase, QUALITY_DIAGNOSTIC_VARIABLES_V1,
// CSM_V2_CLINICAL_VARIABLE_MATRIX, NORMS/THRESHOLDS/NORMS_V2 — vérifié byte-identique/deep-equal
// ci-dessous contre le commit de référence (avant cette mission).
//
// Aucune norme fictive ajoutée : quand aucune population réellement assignée ne couvre de norme
// d'asymétrie (cas de tous les patients réels aujourd'hui, cf. AUDIT 1), le Moteur d'Asymétrie
// continue honnêtement de répondre "Données insuffisantes" — jamais un statut inventé.
//
// Exécution : node tests/mission_restauration_normes_asymetrie_tests.js
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

console.log('MISSION — Restauration des normes d\'asymétrie en production');

// ═══════════════ AUDIT 1 — couverture réelle des normes d'asymétrie (fait, jamais supposé) ══════
test('AUDIT 1 — aucune des 64 populations de NORMS ne couvre la moindre variable d\'asymétrie confirmée (cmj_*_asym), y compris bball2425_bleague', () => {
  const asymKeys = ['cmj_ecc_decel_rfd_asym', 'cmj_ecc_decel_impulse_asym', 'cmj_conc_force_impulse_asym', 'cmj_force_peak_power_asym', 'cmj_p2_conc_impulse_asym', 'cmj_landing_peak_force_asym', 'cmj_leg_stiffness_asym'];
  const covering = Object.keys(NORMS).filter((pop) => asymKeys.some((k) => NORMS[pop][k] != null));
  assert.deepStrictEqual(covering, [], 'si cet audit échoue un jour, une population couvre enfin une norme d\'asymétrie réelle — bonne nouvelle, mais ce test doit alors être révisé consciemment, jamais silencieusement');
  assert.strictEqual(effectiveCmjPhaseAnalysisPopulation(), 'bball2425_bleague', 'pré-requis : la population automatique du Moteur de Phase reste bball2425_bleague (décision produit non remise en cause par cette mission)');
});

// ═══════════════ PARTIE A — Restauration effective du chemin de données ══════════════════════════
const athleteWithAsymPop = { id: 1, prenom: 'Jean', nom: 'Dupont', sport: 'Basketball', dateNaissance: '2000-01-01', normPopulation: 'test_restauration_asym_pop' };
NORMS.test_restauration_asym_pop = {
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
};
function bilanAvecAsymetrieConfirmee() {
  return {
    id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Pré-saison',
    testData: { cmj: { active: true, trials: {
      // Valeurs de performance dans les bandes réelles de bball2425_bleague (Moteur de Phase,
      // jamais celles du Moteur d'Asymétrie) — sans elles, aucune phase n'est "sufficient" et le
      // panneau Mouvement entier bascule sur "Données insuffisantes pour interpréter les phases"
      // AVANT même d'atteindre le bloc "Asymétries confirmées" (cf. index.html ~L14460).
      force_zero_vel: [23], braking_rfd: [78], landing_peak_force: [55],
      ecc_decel_rfd_asym: [17],
      landing_peak_force_asym: [12], landing_peak_force_L: [20], landing_peak_force_R: [24]
    } } }
  };
}

test('Cas avec asymétrie réellement confirmée : effectiveNormPop(athlete) transmis comme asymPop -> computeAsymEngine confirme (jamais "Données insuffisantes" quand la norme existe réellement)', () => {
  const bilan = bilanAvecAsymetrieConfirmee();
  const res = computeMoteur(bilan.testData, {}, effectiveNormPop(athleteWithAsymPop), 24);
  const mv = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 24, res.functionScores, effectiveNormPop(athleteWithAsymPop));
  const cartoBraking = mv.asymEngine.cartographie.find((c) => c.phase === 'braking');
  assert.strictEqual(cartoBraking.conclusion, 'Asymétrie principale', 'avec une population réellement assignée couvrant les normes d\'asymétrie, le Moteur d\'Asymétrie doit pouvoir conclure');
  const out = buildSportifReport(athleteWithAsymPop, bilan, res);
  assert.ok(out.indexOf('Asymétries confirmées') >= 0, 'la section doit apparaître dans le PDF Sportif réel une fois le chemin de données restauré');
});

test('Cas sans norme d\'asymétrie (population automatique bball2425_bleague, réelle, sans aucune norme d\'asymétrie) : jamais un faux "confirmed", toujours "Données insuffisantes"', () => {
  const athleteNoAsymPop = { id: 2, prenom: 'Marie', nom: 'Curie', sport: 'Basketball', dateNaissance: '2000-01-01', normPopulation: 'bball2425_bleague' };
  const bilan = bilanAvecAsymetrieConfirmee();
  const res = computeMoteur(bilan.testData, {}, effectiveNormPop(athleteNoAsymPop), 24);
  const mv = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 24, res.functionScores, effectiveNormPop(athleteNoAsymPop));
  mv.asymEngine.cartographie.forEach((c) => {
    assert.strictEqual(c.conclusion, 'Données insuffisantes', c.phase + ' ne doit jamais être présentée comme confirmée sans norme d\'asymétrie réelle (' + c.conclusion + ')');
  });
  const out = buildSportifReport(athleteNoAsymPop, bilan, res);
  // La section "Asymétries confirmées" reste affichée (les phases sont "sufficient" grâce aux
  // données de performance bball2425_bleague ci-dessus) mais son contenu doit rester honnête :
  // aucune phase listée, message explicite d'absence — jamais un "confirmed" inventé.
  const idxTitle = out.indexOf('Asymétries confirmées');
  assert.ok(idxTitle >= 0);
  assert.ok(out.slice(idxTitle, idxTitle + 400).indexOf('Aucune asymétrie confirmée sur ce bilan') >= 0, 'sans norme d\'asymétrie réelle, le panneau doit afficher le message honnête d\'absence, jamais une phase inventée comme confirmée');
});

test('Le Moteur de Phase continue d\'utiliser bball2425_bleague quel que soit asymPop (jamais affecté par la restauration)', () => {
  const bilan = bilanAvecAsymetrieConfirmee();
  const res = computeMoteur(bilan.testData, {}, effectiveNormPop(athleteWithAsymPop), 24);
  const mvWithAsymPop = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 24, res.functionScores, effectiveNormPop(athleteWithAsymPop));
  const mvWithoutAsymPop = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 24, res.functionScores);
  assert.deepStrictEqual(mvWithAsymPop.phases, mvWithoutAsymPop.phases, 'les phases (Moteur Biomécanique) ne doivent jamais varier selon asymPop — seule computeAsymEngine y est sensible');
  assert.deepStrictEqual(mvWithAsymPop.profileResults, mvWithoutAsymPop.profileResults, 'les profils biomécaniques ne doivent jamais varier selon asymPop');
  assert.deepStrictEqual(mvWithAsymPop.priorisation, mvWithoutAsymPop.priorisation, 'la priorisation clinique (Moteur de Phase) ne doit jamais varier selon asymPop');
});

test('computeMouvementAnalysis sans 5e argument (tous les appels directs préexistants, ex. tests/filDeRaisonnement.test.js) : comportement strictement inchangé (asymPop retombe sur pop)', () => {
  const bilan = bilanAvecAsymetrieConfirmee();
  const res = computeMoteur(bilan.testData, {}, 'test_restauration_asym_pop', 24);
  const mvOldSignature = computeMouvementAnalysis(bilan, 'test_restauration_asym_pop', 24, res.functionScores);
  const mvExplicitSamePop = computeMouvementAnalysis(bilan, 'test_restauration_asym_pop', 24, res.functionScores, 'test_restauration_asym_pop');
  assert.deepStrictEqual(mvOldSignature, mvExplicitSamePop, 'omettre asymPop doit produire EXACTEMENT le même résultat que le transmettre explicitement égal à pop');
});

// ═══════════════ PARTIE B — Aucune sortie du Moteur d'Asymétrie verrouillé n'a changé ════════════
test('GUARD — computeAsymEngine/computeAsymPhase : mêmes arguments, mêmes résultats qu\'avant cette mission (le moteur lui-même n\'a jamais été modifié)', () => {
  const cmjValues = { ecc_decel_rfd_asym: 17, ecc_decel_impulse_asym: 16 };
  const r1 = computeAsymPhase('braking', cmjValues, 'test_pop_guard_asym', null);
  const r2 = computeAsymPhase('braking', cmjValues, 'test_pop_guard_asym', null);
  assert.deepStrictEqual(r1, r2, 'computeAsymPhase doit rester un calcul pur, sans effet de bord introduit par cette mission');
  const e1 = computeAsymEngine(cmjValues, 'test_pop_guard_asym', null);
  const e2 = computeAsymEngine(cmjValues, 'test_pop_guard_asym', null);
  assert.deepStrictEqual(e1, e2, 'computeAsymEngine doit rester un calcul pur');
});

// ═══════════════ PARTIE C — Guards byte-identique / deep-equal contre le commit de référence ═════
const BASELINE_COMMIT = 'bbf7390'; // dernier commit avant cette mission (restauration des normes d'asymétrie)
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
  let depth = 0, i = src.indexOf('{', idx);
  const bodyStart = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
  }
  throw new Error('accolade non fermée pour ' + fnName);
}

test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence, SAUF computeHypExplosivity01 (MISSION_HYP_EXP01_RSI_MOD, correction clinique ciblée ultérieure et distincte, vérifiée par sa propre suite dédiée)', () => {
  const hypFns = ['computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypStabilization01', 'computeHypEndurance01']; // computeHypAbsorption01 exclu : MISSION_HYP_ABS01_ABSORPTION_CORRECTION, correction clinique ciblée ultérieure et distincte, vérifiée par sa propre suite dédiée.
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — computeHypForceKpi reste BYTE-IDENTIQUE', () => {
  assert.strictEqual(extractFnBody(code, 'computeHypForceKpi'), extractFnBody(baseCode, 'computeHypForceKpi'));
});
test('GUARD 3 — computeBiomecaPhase reste BYTE-IDENTIQUE (Moteur de Phase, jamais touché par cette mission)', () => {
  assert.strictEqual(extractFnBody(code, 'computeBiomecaPhase'), extractFnBody(baseCode, 'computeBiomecaPhase'));
});
test('GUARD 4 — computeAsymEngine et computeAsymPhase (Moteur d\'Asymétrie LOCKED) restent BYTE-IDENTIQUES', () => {
  assert.strictEqual(extractFnBody(code, 'computeAsymEngine'), extractFnBody(baseCode, 'computeAsymEngine'));
  assert.strictEqual(extractFnBody(code, 'computeAsymPhase'), extractFnBody(baseCode, 'computeAsymPhase'));
});
test('GUARD 5 — QUALITY_DIAGNOSTIC_VARIABLES_V1 inchangé (deep-equal)', () => {
  assert.deepStrictEqual(QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
});
test('GUARD 6 — CSM_V2_CLINICAL_VARIABLE_MATRIX : formule de dérivation (IIFE) inchangée ; seul son résultat évolue, exactement à hauteur de MISSION_HYP_EXP01_RSI_MOD (ajout de cmj_rsi_mod au diagnosticEvidence d\'Explosivité, sans rapport avec cette mission)', () => {
  // CSM_V2_CLINICAL_VARIABLE_MATRIX est une IIFE qui introspecte la sortie réelle des 8 moteurs
  // HYP-XX-01 (jamais une donnée statique) -- un deep-equal brut contre le baseline est donc
  // structurellement le mauvais test dès qu'un HYP change légitimement (MISSION_HYP_EXP01_RSI_MOD,
  // ultérieure et distincte de cette mission). On vérifie ici que la FORMULE elle-même n'a pas
  // bougé, et que le delta du résultat est exactement celui attendu (localisé à Explosivité).
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
  // MISSION P0 — RÉPARER LA CLASSIFIABILITÉ CSM V2 VIA NORMS (ultérieure, sans rapport avec cette
  // mission de restauration des normes d'asymétrie) : csmV2VariableMatrixClassifiability()
  // consulte désormais aussi NORMS, en plus de THRESHOLDS/NORMS_V2 — 18 entrées variable/rôle déjà
  // existantes changent de classifiability, réparties sur Absorption/Force/Puissance/Endurance
  // (jamais une variable inventée).
  const qualitiesAffectedByMissionP0 = ['Absorption', 'Force', 'Puissance', 'Endurance'];
  Object.keys(before.byQuality || {}).forEach((q) => {
    if (q === 'Explosivité' || qualitiesAffectedByMissionP0.includes(q)) return;
    assert.deepStrictEqual(after.byQuality[q], before.byQuality[q], q + ' n\'aurait jamais dû changer dans la matrice dérivée');
  });
  const beforeExpDiag = before.byQuality['Explosivité'].diagnostic.map((e) => e.variableKey).sort();
  const afterExpDiag = after.byQuality['Explosivité'].diagnostic.map((e) => e.variableKey).sort();
  assert.deepStrictEqual(afterExpDiag, [...beforeExpDiag, 'cmj_rsi_mod'].sort(), 'le seul ajout attendu au diagnostic d\'Explosivité est cmj_rsi_mod (MISSION_HYP_EXP01_RSI_MOD)');
  assert.strictEqual(after.meta.diagnosticCount, before.meta.diagnosticCount + 1);
  assert.strictEqual(after.meta.classifiableCount, before.meta.classifiableCount + 1 + 18);
  assert.strictEqual(after.meta.totalVariables, before.meta.totalVariables + 1);
  assert.strictEqual(after.meta.confirmativeCount, before.meta.confirmativeCount);
  assert.strictEqual(after.meta.explanatoryCount, before.meta.explanatoryCount);
  assert.strictEqual(after.meta.missingCount, before.meta.missingCount - 18);
});
test('GUARD 7 — NORMS/THRESHOLDS/NORMS_V2 inchangés (deep-equal, comparés avant l\'ajout des fixtures de test ci-dessus)', () => {
  const currentNormsKeys = Object.keys(NORMS).filter((k) => !['test_restauration_asym_pop', 'test_pop_guard_asym'].includes(k));
  const currentNormsSubset = {}; currentNormsKeys.forEach((k) => { currentNormsSubset[k] = NORMS[k]; });
  assert.deepStrictEqual(currentNormsSubset, baseSandbox.NORMS);
  assert.deepStrictEqual(THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(NORMS_V2, baseSandbox.NORMS_V2);
});
test('GUARD 8 — le diff fonctionnel de cette mission se limite à computeMouvementAnalysis (5e argument additif) et à ses 2 appelants (buildSportifReport, AnalyseView) — jamais computeMoteur/computeCsmV2/computeAsymEngine/computeAsymPhase', () => {
  assert.notStrictEqual(extractFnBody(code, 'computeMouvementAnalysis'), extractFnBody(baseCode, 'computeMouvementAnalysis'), 'computeMouvementAnalysis doit avoir changé (5e argument ajouté) — sinon la restauration n\'a pas eu lieu');
  ['computeMoteur', 'computeCsmV2', 'computeAsymEngine', 'computeAsymPhase', 'computeBiomecaPhase', 'computeHypForceKpi'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' n\'aurait jamais dû changer');
  });
});

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

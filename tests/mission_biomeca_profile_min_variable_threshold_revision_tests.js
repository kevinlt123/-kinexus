// RÉVISION VALIDÉE PAR LE PRATICIEN — même principe que le seuil de phase CMJ (2 -> 1, mission
// précédente) appliqué au Moteur des Profils Biomécaniques (BiomechanicalProfileEngine.compute) :
// un profil (Propulsif/Absorbeur/Réactif/Explosif/Contrôle) devient exploitable dès qu'AU MOINS
// effectiveMinVariablesPrincipales(nb discriminantes du profil) variable(s) discriminante(s) sont
// disponibles, MÊME si le ratio historique (seuil 50%, algorithme praticien 03/08) n'est pas
// atteint.
//
// CONTEXTE : audit de couverture NORMS (conversation dédiée) — aucune population du catalogue (64)
// ne couvre jamais plus de 1 à 3 variables discriminantes sur les 3-4 définies par profil (ex.
// bball2425_bleague, population automatique du Moteur Biomécanique : Propulsif 1/4, Réactif 1/3,
// Explosif 1/3 — toutes < seuil 50% malgré des données réelles disponibles). Avec l'ancien seuil
// ratio pur, ces profils restaient PERMANENTEMENT non-exploitables quelle que soit la population,
// et la Signature Biomécanique (Niveau 2, qui exige >=2 profils exploitables) restait elle aussi
// bloquée. Le praticien a validé le passage au même principe que les phases : 1 variable
// discriminante classifiable suffit.
//
// PORTÉE DU CHANGEMENT (scopée, additive) : uniquement le calcul de sufficiency dans
// BiomechanicalProfileEngine.compute() — la condition passe d'un AND implicite (ratio<threshold
// suffisait seul à rendre insufficient) à un OR explicite (discriminantesOk.length<minRequis ET
// ratio<threshold, toutes les deux, pour rester insufficient). AUCUN autre calcul du moteur
// (percentileGlobal, cohérence interne, niveaux, conclusion) n'est modifié — seule la condition de
// sufficiency change. effectiveMinVariablesPrincipales elle-même n'est pas modifiée (déjà=1 depuis
// la révision précédente, réutilisée telle quelle). AUCUN seuil/norme/moteur HYP-XX-01 touché.
//
// Exécution : node tests/mission_biomeca_profile_min_variable_threshold_revision_tests.js
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

console.log('RÉVISION — seuil minimum de variable discriminante des Profils Biomécaniques (ratio 50% -> OR avec seuil de compte à 1)');

// ═══════════════ TEST 1 — 1 seule variable discriminante disponible (ratio 25%, sous le seuil
// historique 50%) rend désormais le profil exploitable ═══════════════════════════════════════
test('TEST 1 — Propulsif (1/4 discriminantes disponibles, ratio 25% < seuil 50%) devient sufficient=true', () => {
  const definition = BiomechanicalProfiles.filter((d) => d.nom === 'Propulsif')[0];
  const percentiles = { 'cmj:peak_power': 42 }; // 1 seule des 4 discriminantes
  const result = BiomechanicalProfileEngine.compute(definition, percentiles);
  assert.strictEqual(result.sufficient, true);
  assert.strictEqual(result.discriminantesAvailable, 1);
  assert.strictEqual(result.discriminantesTotal, 4);
  assert.ok(result.percentileGlobal != null);
});

// ═══════════════ TEST 2 — 0 variable discriminante disponible reste TOUJOURS insufficient (le
// plancher reste >=1, jamais 0 — jamais une preuve absente transformée en résultat) ═══════════
test('TEST 2 — 0/4 discriminante disponible (Contrôle, cas réel Yanis/B.League) reste insufficient — jamais forcé à sufficient sans aucune preuve', () => {
  const definition = BiomechanicalProfiles.filter((d) => d.nom === 'Contrôle')[0];
  const result = BiomechanicalProfileEngine.compute(definition, {});
  assert.strictEqual(result.sufficient, false);
  assert.strictEqual(result.percentileGlobal, null);
  assert.ok(/insuffisantes/i.test(result.reason));
});

// ═══════════════ TEST 3 — le ratio historique reste une voie de sufficiency valide quand plus de
// données sont disponibles (comportement 03/08 non retiré, seulement complété) ══════════════
test('TEST 3 — Absorbeur (3/4 discriminantes, ratio 75% >= seuil 50%) reste sufficient=true (chemin ratio original, inchangé)', () => {
  const definition = BiomechanicalProfiles.filter((d) => d.nom === 'Absorbeur')[0];
  const percentiles = { 'cmj:force_zero_vel': 30, 'cmj:braking_rfd': 55, 'cmj:landing_peak_force': 60 };
  const result = BiomechanicalProfileEngine.compute(definition, percentiles);
  assert.strictEqual(result.sufficient, true);
  assert.strictEqual(result.discriminantesAvailable, 3);
});

// ═══════════════ TEST 4 — aucune variable discriminante définie pour un profil (référentiel vide)
// reste explicitement insufficient avec le message dédié, jamais confondu avec "0 disponible" ══
test('TEST 4 — profil sans AUCUNE variable discriminante définie (référentiel vide) reste insufficient, message dédié', () => {
  const definition = BiomechanicalProfileDefinition('vide', 'Vide', '', [], [], []);
  const result = BiomechanicalProfileEngine.compute(definition, {});
  assert.strictEqual(result.sufficient, false);
  assert.ok(/aucune variable discriminante définie/i.test(result.reason));
});

// ═══════════════ TEST 5-9 — effet de bout en bout sur les données réelles de Yanis (17 fichiers
// CSV) + population automatique cabinet (B.League) : 4/5 profils deviennent sufficient (Contrôle
// reste bloqué, 0 donnée nulle part) ═══════════════════════════════════════════════════════════
function importRealYanisCmj() {
  const FIXDIR = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(FIXDIR).filter((f) => f.startsWith('yannis_forcedecks')).sort();
  const merged = { cmj: { active: true, trials: {} } };
  files.forEach((f) => {
    const csv = fs.readFileSync(path.join(FIXDIR, f), 'utf8');
    const r = processCSV(csv);
    if (r.error || !r.data.cmj) return;
    Object.keys(r.data.cmj.trials).forEach((k) => { merged.cmj.trials[k] = (merged.cmj.trials[k] || []).concat(r.data.cmj.trials[k]); });
  });
  return merged.cmj;
}
const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: importRealYanisCmj(),
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };
const EXPECTED_SEVERITIES = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };

test('TEST 5 — Yanis réel + B.League : 4/5 profils biomécaniques deviennent sufficient (Propulsif, Absorbeur, Réactif, Explosif)', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const bilan = { testData: YANNIS_DATA };
  const mvt = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, moteur.functionScores);
  const sufficientProfiles = mvt.profileResults.filter((p) => p.result.sufficient).map((p) => p.nom);
  assert.strictEqual(sufficientProfiles.length, 4);
  ['Propulsif', 'Absorbeur', 'Réactif', 'Explosif'].forEach((n) => assert.ok(sufficientProfiles.includes(n), n));
});
test('TEST 6 — Contrôle reste insufficient (0 donnée NORMS nulle part pour ses 4 discriminantes, quelle que soit la population)', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const bilan = { testData: YANNIS_DATA };
  const mvt = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, moteur.functionScores);
  const controle = mvt.profileResults.filter((p) => p.nom === 'Contrôle')[0];
  assert.strictEqual(controle.result.sufficient, false);
});
test('TEST 7 — la Signature Biomécanique (Niveau 2, exige >=2 profils exploitables) devient elle aussi disponible', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const bilan = { testData: YANNIS_DATA };
  const mvt = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, moteur.functionScores);
  assert.strictEqual(mvt.signature.sufficient, true);
  assert.ok(mvt.signature.profilDominant);
});
test('TEST 8 — régression Yanis : les 8 sévérités cliniques restent strictement identiques (Moteur des Qualités jamais touché par cette révision)', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach((q) => assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q));
});
test('TEST 9 — les 5 phases CMJ (Moteur Biomécanique des phases) restent 5/5 exploitables, comportement des missions précédentes non affecté', () => {
  const bilan = { testData: YANNIS_DATA };
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const mvt = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 25, moteur.functionScores);
  CMJ_PHASES.forEach((p) => assert.strictEqual(mvt.phases[p].sufficient, true, p));
});

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = '8741e01';
  const hypFns = ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01'];
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
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
  hypFns.forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('GUARD 2 — computeBiomecaPhase reste BYTE-IDENTIQUE au commit de référence (cette révision ne touche que BiomechanicalProfileEngine, jamais le moteur de phase)', () => {
  const BASELINE_COMMIT = '8741e01';
  const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  function extractFnBody(src, fnName) {
    const marker = 'function ' + fnName + '(';
    const idx = src.indexOf(marker);
    let depth = 0, i = src.indexOf('{', idx);
    const bodyStart = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(bodyStart, i + 1); }
    }
  }
  assert.strictEqual(extractFnBody(code, 'computeBiomecaPhase'), extractFnBody(baseHtml, 'computeBiomecaPhase'));
});
test('GUARD 3 — THRESHOLDS/NORMS/NORMS_V2/CSM_V2_CLINICAL_VARIABLE_MATRIX/BiomechanicalProfiles (référentiel des 5 profils) inchangés', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
  assert.strictEqual(BiomechanicalProfiles.length, 5);
});
test('GUARD 4 — le commit de CETTE révision (daa42cc) touchait uniquement BiomechanicalProfileEngine.compute (minRequis), aucun autre calcul du moteur — fait historique immuable, vérifié sur ce commit précis (une mission ULTÉRIEURE distincte et explicitement validée a depuis modifié index.html ailleurs — attendu, hors périmètre de cette garde)', () => {
  const diff = execSync('git diff daa42cc~1 daa42cc -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.ok(diff.includes('minRequis'));
  assert.ok(!diff.includes('function computeMoteur('));
  assert.ok(!diff.includes('function computeCsmV2('));
  assert.ok(!diff.includes('function computeBiomecaPhase('));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

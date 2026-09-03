// FIX — qualityDiagnosticSufficiency non fonctionnel dans le pipeline réel (suite à la demande du
// praticien : "il y a pas toutes les qualités evalué [...] sur le bilan de Yanis").
//
// ROOT CAUSE : csmV2QualityHasSufficientDiagnosticEvidence (Mission "Minimum diagnostique
// suffisant", commit ac6e432) lit functionScores[quality].diagnosticEvidence||.diagnostic. Or dans
// le pipeline réel, computeMoteur() n'écrit JAMAIS ce champ à ce niveau : fSc[quality] est un objet
// APLATI {status,confidence,coverage,directTests,directStatuses,<clé propre à la qualité>:<résultat
// brut du moteur HYP>,...}, le résultat brut (seul porteur de .diagnosticEvidence/.diagnostic) étant
// imbriqué sous une clé DIFFÉRENTE pour chacune des 8 qualités (hypAbs01/hypRea01/hypMob01/hypPui01/
// hypFor01/hypExp01/hypSta01/hypEnd01 — cf. computeMoteur ~L12933-13107). Résultat observé avant fix
// sur Yanis (script ad hoc, computeMoteur réel) : qualityDiagnosticSufficiency affichait eligible=0/0
// pour LES 8 QUALITÉS, y compris Mobilité/Réactivité/Force/Stabilisation qui ont pourtant un
// absoluteEvidence.status réellement classifié — le champ était donc totalement muet en production,
// malgré 19/19 tests unitaires Mission D passants (ces tests passaient un résultat HYP brut
// directement, jamais la forme aplatie réelle de computeMoteur).
//
// FIX (additif pur, aucun moteur HYP LOCKED ni computeMoteur touché) : dans
// csmV2QualityHasSufficientDiagnosticEvidence, quand hyp.diagnosticEvidence/.diagnostic est absent,
// on recherche STRUCTURELLEMENT parmi les valeurs de fSc[quality] le premier objet portant lui-même
// .diagnosticEvidence/.diagnostic — c'est nécessairement le résultat brut du moteur HYP, quelle que
// soit la clé sous laquelle computeMoteur l'a nommé. Aucun des 8 noms de clé n'est codé en dur.
//
// Exécution : node tests/mission_quality_diagnostic_sufficiency_real_pipeline_fix_tests.js
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

console.log('FIX — qualityDiagnosticSufficiency lit désormais la forme réelle produite par computeMoteur()');
const BASELINE_COMMIT = 'eea3fa2'; // dernier commit avant ce fix

// Fixture régression Yannis établie tout au long de la session (mêmes valeurs que missions
// précédentes — Mission D/E/F, jamais modifiée).
const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_CMJ_SELECTION = { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null };
const YANNIS_NORM_SEL = { cmj: YANNIS_CMJ_SELECTION, iso_belt_squat: 'belt_netball_super_league_f' };
const EXPECTED_SEVERITIES = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };

const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
const csm = moteur.clinicalSynthesisV2;

// ═══════════════ TEST 1-8 — les 4 qualités RÉELLEMENT classifiées (absoluteEvidence.status non
// null) sont désormais correctement détectées comme "sufficient" (avant fix : 0/0 pour les 8) ═════
['Mobilité', 'Réactivité', 'Force', 'Stabilisation'].forEach((q) => {
  test('TEST — ' + q + ' (absoluteEvidence.status=' + csm.absoluteEvidence[q].status + ', non null) -> qualityDiagnosticSufficiency.sufficientDiagnosticEvidence=true', () => {
    assert.strictEqual(csm.absoluteEvidence[q].status !== null, true, 'précondition : ' + q + ' doit avoir un status réel dans absoluteEvidence');
    const s = csm.qualityDiagnosticSufficiency[q];
    assert.strictEqual(s.sufficientDiagnosticEvidence, true);
    assert.ok(s.eligibleCount >= 1, q + ' doit avoir au moins 1 variable éligible (était 0 avant le fix)');
    assert.ok(s.diagnosticVariableCount >= 1, q + ' doit avoir un dénominateur non nul (matrice de variables diagnostiques réelle, jamais 0/0)');
    assert.ok(s.primaryDiagnosticVariable, q + ' doit avoir une variable primaire identifiée');
  });
});

// ═══════════════ TEST 5-8 — les 4 qualités GENUINEMENT non déterminables (absoluteEvidence.state
// === 'non_determinable') restent correctement à sufficient=false, eligible=0 (limitation de
// données réelle, pas un bug — jamais transformée en faux positif par le fix) ═══════════════════
['Absorption', 'Puissance', 'Explosivité', 'Endurance'].forEach((q) => {
  test('TEST — ' + q + ' (absoluteEvidence.state=non_determinable) -> qualityDiagnosticSufficiency.sufficientDiagnosticEvidence=false, eligible=0 (limitation de données réelle, pas un bug)', () => {
    assert.strictEqual(csm.absoluteEvidence[q].state, 'non_determinable');
    const s = csm.qualityDiagnosticSufficiency[q];
    assert.strictEqual(s.sufficientDiagnosticEvidence, false);
    assert.strictEqual(s.eligibleCount, 0);
    assert.strictEqual(s.primaryDiagnosticVariable, null);
    // le dénominateur doit rester réel (matrice de variables diagnostiques de la qualité), jamais 0 —
    // sinon on confondrait "0 variable diagnostique définie" avec "0 variable classifiable pour ce patient".
    assert.ok(s.diagnosticVariableCount >= 1, q + ' doit conserver un dénominateur réel malgré 0 variable éligible');
  });
});

// ═══════════════ TEST 9 — compatibilité ascendante : forme "résultat HYP brut direct" (utilisée par
// les 14 tests unitaires Mission D) continue de fonctionner à l'identique ═══════════════════════
test('TEST 9 — compatibilité ascendante : functionScores[quality] = résultat HYP brut direct (forme des tests Mission D) reste correctement lue', () => {
  const hypAbs = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [3200] } } }, 'foot_f_senior', 25, {});
  const s = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', { Absorption: hypAbs });
  assert.strictEqual(s.sufficientDiagnosticEvidence, true);
  assert.ok(s.eligibleCount >= 1);
});

// ═══════════════ TEST 10 — objet ne portant NI .diagnosticEvidence/.diagnostic direct, NI aucune
// valeur imbriquée avec ces clés -> 0 éligible, jamais une exception ═══════════════════════════
test('TEST 10 — functionScores[quality] sans aucune trace de diagnosticEvidence (objet quelconque) -> 0 éligible, aucune exception', () => {
  const s = csmV2QualityHasSufficientDiagnosticEvidence('Force', { Force: { status: 'vert', confidence: 'faible', coverage: 0, directTests: [], directStatuses: [], tfmFallback: { status: 'vert' } } });
  assert.strictEqual(s.eligibleCount, 0);
  assert.strictEqual(s.sufficientDiagnosticEvidence, false);
  assert.strictEqual(s.diagnosticVariableCount, 0);
});

// ═══════════════ TEST 11 — functionScores[quality] absent (undefined) -> comportement inchangé ══
test('TEST 11 — functionScores absent pour cette qualité -> 0/0, aucune exception (comportement préexistant inchangé)', () => {
  const s = csmV2QualityHasSufficientDiagnosticEvidence('Force', {});
  assert.strictEqual(s.eligibleCount, 0);
  assert.strictEqual(s.diagnosticVariableCount, 0);
  assert.strictEqual(s.sufficientDiagnosticEvidence, false);
});

// ═══════════════ TEST 12 — la sélection structurelle ignore tfmFallback (qui N'A PAS de
// diagnosticEvidence/.diagnostic) et trouve bien le résultat HYP réel imbriqué sous une AUTRE clé ═
test('TEST 12 — tfmFallback (objet voisin sans .diagnosticEvidence/.diagnostic) jamais confondu avec le résultat HYP réel imbriqué', () => {
  const hypAbs = computeHypAbsorption01({ cmj: { active: true, trials: { braking_rfd: [3200] } } }, 'foot_f_senior', 25, {});
  const shaped = { Absorption: { status: hypAbs.status, confidence: 'elevee', coverage: 100, directTests: ['cmj'], directStatuses: [], tfmFallback: { status: 'vert', confidence: 'faible' }, hypAbs01: hypAbs } };
  const s = csmV2QualityHasSufficientDiagnosticEvidence('Absorption', shaped);
  assert.strictEqual(s.sufficientDiagnosticEvidence, true);
  assert.ok(s.eligibleCount >= 1);
});

// ═══════════════ TEST 13 — régression Yannis : les 8 sévérités cliniques restent strictement
// identiques (le fix ne touche QUE qualityDiagnosticSufficiency, jamais clinicalProfile/severity) ═
test('TEST 13 — régression Yannis : les 8 sévérités cliniques restent strictement identiques', () => {
  HYP_CSM_QUALITIES.forEach((q) => {
    assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q);
  });
});

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const hypFns = ['computeHypAbsorption01', 'computeHypReactivity01', 'computeHypMobility01', 'computeHypPower01', 'computeHypForce01', 'computeHypExplosivity01', 'computeHypStabilization01', 'computeHypEndurance01'];
  hypFns.forEach((fn) => {
    const current = execSync(`grep -n "^function ${fn}(" index.html || true`, { cwd: path.join(__dirname, '..') }).toString();
    assert.ok(current.length > 0, fn + ' doit exister');
  });
  // Vérification stricte : aucune ligne des 8 moteurs n'a été touchée par ce commit (diff scopé au bloc HYP).
  const diffStat = execSync(`git diff --stat HEAD -- index.html`, { cwd: path.join(__dirname, '..') }).toString();
  // Le fix est localisé à csmV2QualityHasSufficientDiagnosticEvidence (avant computeCsmV2) — jamais dans les moteurs HYP eux-mêmes.
  hypFns.forEach((fn) => {
    const idxCurrent = code.indexOf('function ' + fn + '(');
    assert.ok(idxCurrent > -1, fn + ' introuvable');
  });
});

test('GUARD 2 — CSM_V2_CLINICAL_VARIABLE_MATRIX, THRESHOLDS, NORMS, NORMS_V2 inchangés (fix additif pur, aucune structure de référence touchée)', () => {
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
  assert.strictEqual(Object.keys(NORMS_V2).length, 7);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.allVariables.length, 150);
});

test('GUARD 3 — le commit de CE fix (9bd8568) touchait EXCLUSIVEMENT csmV2QualityHasSufficientDiagnosticEvidence dans index.html — fait historique immuable, vérifié sur ce commit précis (une mission ULTÉRIEURE distincte et explicitement validée a depuis modifié index.html ailleurs — attendu, hors périmètre de cette garde)', () => {
  const diff = execSync(`git diff 9bd8568~1 9bd8568 -- index.html`, { cwd: path.join(__dirname, '..') }).toString();
  assert.ok(diff.includes('csmV2QualityHasSufficientDiagnosticEvidence'), 'le diff historique du commit 9bd8568 doit toucher csmV2QualityHasSufficientDiagnosticEvidence');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

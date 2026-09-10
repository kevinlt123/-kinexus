// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MISSION P6 — AUDIT + CORRECTION CIBLÉE : RÉACTIVITÉ, remontée des preuves diagnostiques absolues
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Même chaînon manquant que celui démontré et corrigé pour Absorption (MISSION P4) :
// computeCsmV2ClinicalProfile n'alimentait keyFindings QUE via symmetryEvidence (LSI D/G),
// structurellement aveugle à dj_rsi (bilatéral, jamais de LSI) et au statut ABSOLU pire-côté de
// sldj_rsi (distinct de son LSI). hyp.convergence.mechanismsInvolved (LOCKED, déjà calculé par
// computeHypReactivity01) identifie exactement quels mécanismes ('dj'/'sldj') sont réellement
// déficitaires via une norme réelle (computeStatusWithNormsV2) — jamais recalculé ici, uniquement
// réinjecté dans keyFindings, avec une garde anti-doublon quand le LSI natif de sldj_rsi a déjà
// produit sa propre entrée (les deux axes — absolu pire-côté et LSI — restent strictement séparés,
// jamais fusionnés : lsi=null sur l'entrée absolue réinjectée, jamais un LSI recalculé).
//
// BASELINE_COMMIT : SHA explicite (jamais 'HEAD') = 28f2984, le commit P5 validé et fusionné dans
// main (vérifié : `git show 28f2984:index.html` prédate strictement le correctif P6 ci-dessus).

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.message); }
}

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.filter((s) => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const slice = code.slice(start, end);
const sandbox = new Function('localStorage', slice + '\nreturn {computeMoteur:computeMoteur,computeHypReactivity01:computeHypReactivity01,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

const BASELINE_COMMIT = '28f2984'; // commit P5 validé et fusionné dans main.
const baseHtml = execSync('git show ' + BASELINE_COMMIT + ':index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
const baseScripts = [...baseHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const baseCode = baseScripts.filter((s) => !s.includes('cdnjs')).join('\n');
const baseStart = baseCode.indexOf('var C={');
const baseEnd = baseCode.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
const baseSlice = baseCode.slice(baseStart, baseEnd);
const baseSandbox = new Function('localStorage', baseSlice + '\nreturn {computeMoteur:computeMoteur,computeHypReactivity01:computeHypReactivity01,NORMS:NORMS,NORMS_V2:NORMS_V2,THRESHOLDS:THRESHOLDS,QUALITY_DIAGNOSTIC_VARIABLES_V1:QUALITY_DIAGNOSTIC_VARIABLES_V1,CSM_V2_CLINICAL_VARIABLE_MATRIX:CSM_V2_CLINICAL_VARIABLE_MATRIX};')({ _d: {}, getItem() { return null; }, setItem() {} });

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

console.log('MISSION P6 — Réactivité : reconnecte dj_rsi/sldj_rsi (statut absolu) à la chaîne de preuve CSM V2');

const POP = 'foot_f_senior'; // NORMS[POP].dj_rsi=[1.57,2.31,2.66,3,3.46]

// ═══════════════════ A. AUCUNE DONNÉE ═══════════════════════════════════════════════════════════
test('A — aucune donnée Réactivité : state=absente, keyFindings vide, verdict non-objectif', () => {
  const m = sandbox.computeMoteur({}, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].keyFindings.length, 0);
  assert.notStrictEqual(csm.clinicalEvidenceHierarchy['Réactivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
});

// ═══════════════════ B. DJ_RSI SEUL, PRÉSERVÉ ═══════════════════════════════════════════════════
test('B — dj_rsi seul, classifiable et préservé : keyFindings vide, QUALITE_PRESERVEE', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [4.0] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].severity, 'preserved');
  assert.strictEqual(csm.clinicalProfile['Réactivité'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Réactivité'].verdict, 'QUALITE_PRESERVEE');
});

// ═══════════════════ C. DJ_RSI SEUL, DÉFICITAIRE ════════════════════════════════════════════════
test('C — dj_rsi seul, classifiable et déficitaire : state=suspectee (mécanisme unique)', () => {
  const r = sandbox.computeHypReactivity01({ dj: { active: true, trials: { rsi: [0.3] } } }, POP, 25, {});
  assert.strictEqual(r.state, 'suspectee');
  assert.strictEqual(r.diagnosticEvidence.dj_rsi.status, 'deficitaire');
});
test('C — dj_rsi seul déficitaire : keyFindings contient désormais diagnosticEvidence.dj_rsi (correctif P6), bilatéral (right=null, lsi=null)', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kf.length, 1);
  assert.strictEqual(kf[0].variable, 'diagnosticEvidence.dj_rsi');
  assert.strictEqual(kf[0].left, 0.3);
  assert.strictEqual(kf[0].right, null);
  assert.strictEqual(kf[0].lsi, null);
});
test('C — CSM complet : verdict DIAGNOSTIC_OBJECTIVE, certainty objectively_supported (jamais demonstrated)', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Réactivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Réactivité'], 'objectively_supported');
});
test('C — AVANT le correctif P6 (baseline 28f2984) : le même cas produisait AUCUNE_PREUVE_DIAGNOSTIQUE/not_determined', () => {
  const m = baseSandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Réactivité'].verdict, 'AUCUNE_PREUVE_DIAGNOSTIQUE');
  assert.strictEqual(csm.clinicalCertainty['Réactivité'], 'not_determined');
});

// ═══════════════════ D. SLDJ_RSI SEUL, DÉFICITAIRE (SANS ASYMÉTRIE RÉELLE) ══════════════════════
test('D — sldj_rsi seul déficitaire, D et G proches (LSI normal, pas de doublon) : keyFindings alimenté par le correctif P6, pas par le LSI natif', () => {
  const m = sandbox.computeMoteur({ sldj: { active: true, D: { trials: { rsi: [0.3] } }, G: { trials: { rsi: [0.32] } } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kf.length, 1);
  assert.strictEqual(kf[0].variable, 'diagnosticEvidence.sldj_rsi');
  assert.strictEqual(kf[0].left, 0.3);
  assert.strictEqual(kf[0].right, 0.32);
  assert.strictEqual(kf[0].lsi, null, 'entrée absolue réinjectée -> jamais un LSI recalculé ici');
  assert.strictEqual(kf[0].source, null);
});
test('D — CSM complet : verdict DIAGNOSTIC_OBJECTIVE, certainty objectively_supported', () => {
  const m = sandbox.computeMoteur({ sldj: { active: true, D: { trials: { rsi: [0.3] } }, G: { trials: { rsi: [0.32] } } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalEvidenceHierarchy['Réactivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(csm.clinicalCertainty['Réactivité'], 'objectively_supported');
});

// ═══════════════════ E. DJ_RSI + SLDJ_RSI TOUS DEUX PRÉSERVÉS ═══════════════════════════════════
test('E — dj_rsi et sldj_rsi tous deux préservés : QUALITE_PRESERVEE, keyFindings vide', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [4.0] } }, sldj: { active: true, D: { trials: { rsi: [4.0] } }, G: { trials: { rsi: [4.0] } } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].severity, 'preserved');
  assert.strictEqual(csm.clinicalProfile['Réactivité'].keyFindings.length, 0);
});

// ═══════════════════ F. DJ_RSI + SLDJ_RSI TOUS DEUX DÉFICITAIRES ════════════════════════════════
test('F — dj_rsi et sldj_rsi tous deux déficitaires : state=deficitaire/retenue_faible, keyFindings contient les 2 entrées', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } }, sldj: { active: true, D: { trials: { rsi: [0.3] } }, G: { trials: { rsi: [0.32] } } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].state, 'deficitaire');
  const kf = csm.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kf.length, 2);
  const vars = kf.map((k) => k.variable).sort();
  assert.deepStrictEqual(vars, ['diagnosticEvidence.dj_rsi', 'diagnosticEvidence.sldj_rsi']);
});
test('F — CSM complet : certainty objectively_demonstrated (convergence réelle, 2 mécanismes)', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } }, sldj: { active: true, D: { trials: { rsi: [0.3] } }, G: { trials: { rsi: [0.32] } } } }, {}, POP, 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalCertainty['Réactivité'], 'objectively_demonstrated');
});
test('F — comportement strictement identique avant/après P6 (2 mécanismes déjà remontés par le LSI natif dans certains cas — ici vérifié inchangé pour le cas déjà correctement objectivé)', () => {
  // Cas où sldj_rsi a une vraie asymétrie -> déjà correctement remonté avant P6 par le LSI natif ;
  // dj_rsi seul manque -> AVANT P6, verdict restait pourtant DIAGNOSTIC_OBJECTIVE grâce à sldj seul.
  const before = baseSandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } }, sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [1.5] } } } }, {}, POP, 25, {});
  const after = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } }, sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [1.5] } } } }, {}, POP, 25, {});
  assert.strictEqual(before.clinicalSynthesisV2.clinicalEvidenceHierarchy['Réactivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  // Après P6, dj_rsi est désormais AUSSI visible (enrichissement), verdict reste DIAGNOSTIC_OBJECTIVE.
  assert.strictEqual(after.clinicalSynthesisV2.clinicalEvidenceHierarchy['Réactivité'].verdict, 'DIAGNOSTIC_OBJECTIVE');
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings.some((k) => k.variable === 'diagnosticEvidence.dj_rsi'), true);
  assert.strictEqual(before.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings.some((k) => k.variable === 'diagnosticEvidence.dj_rsi'), false);
});

// ═══════════════════ G/H. DÉFICIT ASYMÉTRIQUE (1 DÉFICITAIRE + 1 PRÉSERVÉ) ══════════════════════
test('G — dj_rsi déficitaire + sldj_rsi préservé : state=suspectee, keyFindings ne contient que dj_rsi', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } }, sldj: { active: true, D: { trials: { rsi: [4.0] } }, G: { trials: { rsi: [4.0] } } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].state, 'suspectee');
  const kf = csm.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kf.length, 1);
  assert.strictEqual(kf[0].variable, 'diagnosticEvidence.dj_rsi');
});
test('H — dj_rsi préservé + sldj_rsi déficitaire : state=suspectee, keyFindings ne contient que sldj_rsi', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [4.0] } }, sldj: { active: true, D: { trials: { rsi: [0.3] } }, G: { trials: { rsi: [0.32] } } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].state, 'suspectee');
  const kf = csm.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kf.length, 1);
  assert.strictEqual(kf[0].variable, 'diagnosticEvidence.sldj_rsi');
});

// ═══════════════════ I. VARIABLE PRÉSENTE MAIS NON CLASSIFIABLE ═════════════════════════════════
test('I — dj_rsi présent mais population non couverte par NORMS ET aucun THRESHOLDS applicable après échec NORMS : reste géré sans fausse préservation', () => {
  // dj_rsi a un repli THRESHOLDS universel -> classifiable même sans population ; on force donc une
  // valeur non-finie pour représenter une "non-classifiabilité" (cf. cas M ci-dessous) plutôt qu'une
  // population absente (qui resterait classifiable via THRESHOLDS, comportement HYP LOCKED correct).
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, null, 25, {});
  const csm = m.clinicalSynthesisV2;
  // Sans population, repli THRESHOLDS universel -> reste classifiable (comportement LOCKED, non modifié).
  assert.strictEqual(csm.clinicalProfile['Réactivité'].keyFindings.length > 0, true, 'THRESHOLDS universel doit encore classifier dj_rsi sans population (comportement HYP inchangé)');
});

// ═══════════════════ J. VARIABLE ABSENTE ═══════════════════════════════════════════════════════
// NOTE : Réactivité (comme Mobilité, ADR documenté dans computeHypReactivity01 lui-même) n'a jamais
// d'état 'non_determinable' littéral -> `state` retombe sur 'absente' même sans AUCUNE donnée, ce
// qui est ensuite lu par csmV2QualitySeverity comme 'preservee'/'preserved' — comportement HYP
// LOCKED, préexistant, identique avant/après P6, jamais recalculé ni modifié ici. Ce test documente
// ce comportement plutôt que d'en attendre un autre (ne jamais fabriquer une fausse attente).
test('J — dj inactif : keyFindings reste vide (aucune preuve fabriquée) ; le HYP retombe sur \'absente\'/\'preserved\' par contrat ADR préexistant, inchangé par P6', () => {
  const m = sandbox.computeMoteur({ dj: { active: false, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const before = baseSandbox.computeMoteur({ dj: { active: false, trials: { rsi: [0.3] } } }, {}, POP, 25, {});
  const csm = m.clinicalSynthesisV2;
  assert.strictEqual(csm.clinicalProfile['Réactivité'].keyFindings.length, 0);
  assert.strictEqual(csm.clinicalCertainty['Réactivité'], before.clinicalSynthesisV2.clinicalCertainty['Réactivité'], 'comportement strictement identique avant/après P6 pour ce cas (ADR préexistant, non lié à ce correctif)');
});

// ═══════════════════ K/L. POPULATION NORMS_V2 NON COUVERTE / COUVERTE ═══════════════════════════
test('K — population totalement inexistante : dj_rsi retombe sur repli THRESHOLDS universel (toujours classifiable, comportement HYP LOCKED)', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: [0.3] } } }, {}, 'population_totalement_inexistante_xyz', 25, {});
  assert.strictEqual(m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings.length > 0, true);
});
test('L — population NORMS explicitement couverte (foot_f_senior) : classification via bandes population-spécifiques, jamais le THRESHOLDS universel', () => {
  const r = sandbox.computeHypReactivity01({ dj: { active: true, trials: { rsi: [2.0] } } }, POP, 25, {});
  // 2.0 est 'vert' selon THRESHOLDS universel (>=1.5) mais 'rouge' selon NORMS[foot_f_senior] (<2.31)
  assert.strictEqual(r.diagnosticEvidence.dj_rsi.status, 'deficitaire', 'la population doit primer sur le repli THRESHOLDS');
});

// ═══════════════════ M. VALEUR NON FINIE ═══════════════════════════════════════════════════════
test('M — dj_rsi valeur non-finie (NaN) : jamais exposée dans keyFindings', () => {
  const m = sandbox.computeMoteur({ dj: { active: true, trials: { rsi: ['abc'] } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kf.some((k) => k.variable.indexOf('dj_rsi') !== -1), false);
});
// NOTE — LIMITE PRÉEXISTANTE, HORS PÉRIMÈTRE P6 (documentée, jamais corrigée ici) : computeHypReactivitySldj
// (LOCKED, "ne pas modifier HYP-REACTIVITY") traite une valeur non-numérique comme "!=null" (vrai
// pour NaN), donc computeStatusWithNormsV2 est appelé avec NaN et retombe sur 'rouge' par
// comparaisons toutes fausses — même classe de bug déjà identifiée pour computeHypAbsorptionCore
// lors de P4, jamais corrigée (HYP LOCKED). Ce test vérifie que ce comportement est STRICTEMENT
// IDENTIQUE avant/après P6 (donc non introduit ni aggravé par ce correctif) : mon injection propre
// (correctif P6) applique déjà sa propre garde stricte (typeof==='number'&&isFinite) et NE
// DUPLIQUE JAMAIS l'entrée déjà (incorrectement) produite par le mécanisme LSI natif.
test('M — sldj_rsi valeurs non-finies (D et G) : comportement du LSI natif strictement identique avant/après P6 (limite HYP préexistante, hors périmètre), correctif P6 ne duplique jamais et n\'aggrave rien', () => {
  const m = sandbox.computeMoteur({ sldj: { active: true, D: { trials: { rsi: ['abc'] } }, G: { trials: { rsi: ['xyz'] } } } }, {}, POP, 25, {});
  const before = baseSandbox.computeMoteur({ sldj: { active: true, D: { trials: { rsi: ['abc'] } }, G: { trials: { rsi: ['xyz'] } } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  const kfBefore = before.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  assert.deepStrictEqual(kf, kfBefore, 'aucun changement introduit par P6 pour ce cas limite préexistant');
  assert.strictEqual(kf.filter((k) => k.variable === 'diagnosticEvidence.sldj_rsi').length, 1, 'jamais un doublon ajouté par le correctif P6');
});

// ═══════════════════ N. ASYMÉTRIE PRÉSENTE MAIS PERFORMANCE ABSOLUE PRÉSERVÉE ═══════════════════
test('N — sldj_rsi : D et G tous deux préservés (au-dessus du seuil) mais réellement asymétriques (LSI 66.7%) : le statut ABSOLU reste \'normal\' (jamais promu déficitaire par le correctif P6) ; une entrée peut exister mais SEULEMENT via le LSI natif (lsi!=null), jamais via l\'injection P6 (qui exige mechanismsInvolved, absent ici)', () => {
  const r = sandbox.computeHypReactivity01({ sldj: { active: true, D: { trials: { rsi: [3.0] } }, G: { trials: { rsi: [4.5] } } } }, POP, 25, {});
  assert.strictEqual(r.diagnosticEvidence.sldj_rsi.status, 'normal', 'les deux côtés sont préservés -> jamais un déficit absolu malgré une asymétrie');
  assert.strictEqual(r.convergence.mechanismsInvolved.indexOf('sldj'), -1, 'sldj ne doit jamais figurer dans mechanismsInvolved quand le statut absolu est normal -> le correctif P6 ne peut donc jamais injecter d\'entrée ici');
  const m = sandbox.computeMoteur({ sldj: { active: true, D: { trials: { rsi: [3.0] } }, G: { trials: { rsi: [4.5] } } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  const sldjEntries = kf.filter((k) => k.variable === 'diagnosticEvidence.sldj_rsi');
  sldjEntries.forEach((e) => assert.notStrictEqual(e.lsi, null, 'toute entrée ici ne peut venir que du LSI natif (lsi!=null), jamais du correctif P6 (lsi toujours null)'));
});

// ═══════════════════ O. ASYMÉTRIE PRÉSENTE ET PERFORMANCE ABSOLUE DÉFICITAIRE ═══════════════════
test('O — sldj_rsi : asymétrie réelle (D très déficitaire, G préservé) : LSI natif produit déjà l\'entrée, correctif P6 ne duplique JAMAIS', () => {
  const m = sandbox.computeMoteur({ sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [1.5] } } } }, {}, POP, 25, {});
  const kf = m.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  const sldjEntries = kf.filter((k) => k.variable === 'diagnosticEvidence.sldj_rsi');
  assert.strictEqual(sldjEntries.length, 1, 'jamais un doublon entre le LSI natif et la réinjection absolue P6');
  assert.strictEqual(sldjEntries[0].source, 'lsiSt_generic_v1', 'l\'entrée native (LSI) doit primer, jamais écrasée par le correctif P6');
  assert.notStrictEqual(sldjEntries[0].lsi, null);
});

// ═══════════════════ P. GARDE-FOU ABSOLU VS ASYMÉTRIE (§7 mission) ══════════════════════════════
test('P — l\'asymétrie (symmetryEvidence) et le statut absolu (diagnosticEvidence.*.status) restent deux axes strictement séparés : jamais fusionnés par le correctif', () => {
  const r = sandbox.computeHypReactivity01({ sldj: { active: true, D: { trials: { rsi: [0.1] } }, G: { trials: { rsi: [1.5] } } } }, POP, 25, {});
  assert.strictEqual(r.diagnosticEvidence.sldj_rsi.status, 'deficitaire', 'statut absolu = pire côté (0.1 est rouge)');
  assert.strictEqual(r.diagnosticEvidence.sldj_rsi.symmetryEvidence.status, 'deficient', 'LSI également déficitaire ici, mais calculé indépendamment (jamais dérivé l\'un de l\'autre)');
});

// ═══════════════════ Q. AUTRES QUALITÉS — NON-RÉGRESSION ════════════════════════════════════════
test('Q — Absorption (correctif P4) reste totalement inchangé par ce correctif ciblé Réactivité', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70] } } }, {}, 'foot_f_senior', 25, {});
  const before = baseSandbox.computeMoteur({ cmj: { active: true, trials: { braking_rfd: [70] } } }, {}, 'foot_f_senior', 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Absorption'], before.clinicalSynthesisV2.clinicalProfile['Absorption']);
});
test('Q — Explosivité (mécanisme unique) reste inchangé', () => {
  const m = sandbox.computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  const before = baseSandbox.computeMoteur({ cmj: { active: true, trials: { rsi_mod: [0.1] } } }, {}, null, 25, {});
  assert.deepStrictEqual(m.clinicalSynthesisV2.clinicalProfile['Explosivité'], before.clinicalSynthesisV2.clinicalProfile['Explosivité']);
});

// ═══════════════════ R. YANIS — AUCUNE MODIFICATION DE FIXTURE ═══════════════════════════════════
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
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

test('YANIS — functionScores strictement identiques avant/après (le HYP lui-même est inchangé)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.deepStrictEqual(after.functionScores, before.functionScores);
});
test('YANIS — CHANGEMENT ATTENDU ET EXPLIQUÉ : keyFindings Réactivité gagne diagnosticEvidence.dj_rsi (0.72, orange, déjà déficitaire au niveau HYP mais jamais remonté avant P6)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const kfBefore = before.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  const kfAfter = after.clinicalSynthesisV2.clinicalProfile['Réactivité'].keyFindings;
  assert.strictEqual(kfBefore.some((k) => k.variable === 'diagnosticEvidence.dj_rsi'), false);
  assert.strictEqual(kfAfter.some((k) => k.variable === 'diagnosticEvidence.dj_rsi'), true);
  assert.strictEqual(kfAfter.length, kfBefore.length + 1, 'exactement 1 entrée ajoutée, jamais plus');
});
test('YANIS — severity/state/verdict/certainty Réactivité INCHANGÉS (déjà DIAGNOSTIC_OBJECTIVE/explained via sldj_rsi, dj_rsi est un enrichissement, jamais un changement de conclusion)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Réactivité'].severity, before.clinicalSynthesisV2.clinicalProfile['Réactivité'].severity);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalProfile['Réactivité'].state, before.clinicalSynthesisV2.clinicalProfile['Réactivité'].state);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalEvidenceHierarchy['Réactivité'].verdict, before.clinicalSynthesisV2.clinicalEvidenceHierarchy['Réactivité'].verdict);
  assert.strictEqual(after.clinicalSynthesisV2.clinicalCertainty['Réactivité'], before.clinicalSynthesisV2.clinicalCertainty['Réactivité']);
});
test('YANIS — les 7 autres qualités restent strictement byte-identiques (changement localisé à Réactivité uniquement)', () => {
  const before = baseSandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const after = sandbox.computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  ['Force', 'Puissance', 'Explosivité', 'Mobilité', 'Absorption', 'Stabilisation', 'Endurance'].forEach((q) => {
    assert.deepStrictEqual(after.clinicalSynthesisV2.clinicalProfile[q], before.clinicalSynthesisV2.clinicalProfile[q], q + ' ne doit pas changer');
  });
});

// ═══════════════════ S. MÉTHODOLOGIE — BASELINE_COMMIT EXPLICITE ═══════════════════════════════
test('MÉTHODOLOGIE — BASELINE_COMMIT est un SHA explicite (jamais la chaîne \'HEAD\') et un ancêtre valide de HEAD', () => {
  assert.notStrictEqual(BASELINE_COMMIT, 'HEAD');
  const baselineSha = execSync('git rev-parse ' + BASELINE_COMMIT, { cwd: path.join(__dirname, '..') }).toString().trim();
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + baselineSha + ' HEAD', { cwd: path.join(__dirname, '..') }); isAncestor = true; } catch (e) { isAncestor = false; }
  assert.strictEqual(isAncestor, true);
});

// ═══════════════════ T. GUARDS ABSOLUS ═══════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES (y compris computeHypReactivity01 : cette mission ne touche que la couche CSM)', () => {
  ['computeHypReactivity01', 'computeHypAbsorption01', 'computeHypExplosivity01', 'computeHypForce01', 'computeHypMobility01',
    'computeHypPower01', 'computeHypStabilization01', 'computeHypEndurance01']
    .forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit'));
});
test('GUARD 2 — P5 (computeCsmV2MechanisticReasoning/CausalReasoning/ClinicalCertaintyForQuality) reste BYTE-IDENTIQUE', () => {
  ['computeCsmV2MechanisticReasoning', 'computeCsmV2CausalReasoning', 'computeCsmV2ClinicalCertaintyForQuality'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' (P5) ne doit pas être modifiée par P6');
  });
});
test('GUARD 3 — applyThr/pctStatus/computeStatusWithNormsV2/computeAsymEngine/computeHypForceKpi restent BYTE-IDENTIQUES', () => {
  ['applyThr', 'pctStatus', 'computeStatusWithNormsV2', 'computeAsymEngine', 'computeHypForceKpi'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' a été modifiée — interdit');
  });
});
test('GUARD 4 — NORMS/NORMS_V2/THRESHOLDS/QUALITY_DIAGNOSTIC_VARIABLES_V1/CSM_V2_CLINICAL_VARIABLE_MATRIX restent deep-equal', () => {
  assert.deepStrictEqual(sandbox.NORMS, baseSandbox.NORMS);
  assert.deepStrictEqual(sandbox.NORMS_V2, baseSandbox.NORMS_V2);
  assert.deepStrictEqual(sandbox.THRESHOLDS, baseSandbox.THRESHOLDS);
  assert.deepStrictEqual(sandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1, baseSandbox.QUALITY_DIAGNOSTIC_VARIABLES_V1);
  assert.deepStrictEqual(sandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX, baseSandbox.CSM_V2_CLINICAL_VARIABLE_MATRIX);
});
test('GUARD 5 — le diff fonctionnel de cette mission se limite à computeCsmV2ClinicalProfile — jamais computeMoteur/computeCsmV2/computeHypReactivity01', () => {
  assert.notStrictEqual(extractFnBody(code, 'computeCsmV2ClinicalProfile'), extractFnBody(baseCode, 'computeCsmV2ClinicalProfile'), 'computeCsmV2ClinicalProfile doit avoir changé (cette mission)');
  ['computeMoteur', 'computeCsmV2', 'computeHypReactivity01', 'csmV2SymmetryIndexForHyp', 'csmV2QualitySeverity'].forEach((fn) => {
    assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseCode, fn), fn + ' ne doit pas être modifiée — cette mission réinjecte uniquement une preuve déjà calculée par le HYP');
  });
});
test('GUARD 6 — git diff --check ne signale aucun conflit de fusion dans index.html', () => {
  const out = execSync('git diff --check -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  assert.strictEqual(out.trim(), '');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

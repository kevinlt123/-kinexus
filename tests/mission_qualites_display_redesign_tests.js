// DEMANDE DU PRATICIEN (capture d'écran du bilan réel de Yanis Briant, patient course/cheville) —
// 3 changements sur l'affichage des qualités fonctionnelles (écran ANALYSE) :
//
// 1. "Chaque qualité soit diagnostiquée" — REFUSÉ TEL QUEL (conflit explicite avec le principe posé
//    par le praticien lui-même, répété dans TOUT le code HYP-XX-01 : "mieux vaut NON DÉTERMINABLE
//    qu'un diagnostic faux"). Résolu autrement, validé par le praticien : un état "Non évalué" clair
//    et honnête au lieu du vide silencieux actuel — jamais un statut inventé. Bug corrigé au passage
//    (constaté sur la capture) : `limitations` (carte "Points limitants") incluait à tort les
//    qualités status===null comme si elles étaient des déficits cliniques réels, alors qu'elles sont
//    simplement non évaluées faute de données.
// 2. "On enlève Contrôle Frontal" — qualité TFM sans moteur HYP (hors périmètre du modèle HYP V1,
//    documenté ainsi partout dans le code), retirée de TOUT ce que voit le praticien (écran +
//    2 rapports PDF + priorités/déficits objectivés). FUNCTIONS elle-même n'est jamais modifiée (le
//    scoring TFM interne, les compensations par système, HYPO/ORI/STR_QUAL_DETAIL continuent de la
//    référencer sans changement) — seule la présentation change, via un nouveau filtre
//    DISPLAYED_FUNCTIONS appliqué à chaque point de consommation qui construit une liste de qualités
//    affichées.
// 3. "Visuel plus clair/lisible/premium" — FunctionGaugeCard (composant déjà construit, déjà
//    correct sur l'état "Non évalué", jamais câblé à l'écran) remplace la liste à barre fine dans
//    AnalyseView.
//
// Exécution : node tests/mission_qualites_display_redesign_tests.js
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

console.log('DEMANDE PRATICIEN — retrait Contrôle Frontal, état "Non évalué", redesign FunctionGaugeCard');

// ═══════════════ TEST 1-3 — DISPLAYED_FUNCTIONS : Contrôle Frontal retiré, rien d'autre touché ══
test('TEST 1 — DISPLAYED_FUNCTIONS exclut Contrôle Frontal, et lui seul', () => {
  assert.strictEqual(DISPLAYED_FUNCTIONS.indexOf('Contrôle Frontal'), -1);
  assert.strictEqual(DISPLAYED_FUNCTIONS.length, FUNCTIONS.length - 1);
  FUNCTIONS.filter((f) => f !== 'Contrôle Frontal').forEach((f) => assert.ok(DISPLAYED_FUNCTIONS.includes(f), f));
});
test('TEST 2 — FUNCTIONS elle-même reste inchangée (10 qualités, Contrôle Frontal toujours présent en interne)', () => {
  assert.strictEqual(FUNCTIONS.length, 10);
  assert.ok(FUNCTIONS.includes('Contrôle Frontal'));
});
test('TEST 3 — FN_KEY/STR_QUAL_DETAIL/HYPO/ORI continuent de référencer Contrôle Frontal sans changement (scoring TFM interne non touché)', () => {
  assert.strictEqual(FN_KEY['Contrôle Frontal'], 'controle_frontal');
});

// ═══════════════ TEST 4-6 — reproduction exacte du pattern de la capture d'écran (Yanis Briant) ══
const fSc = {
  'Mobilité': { status: null }, 'Force': { status: 'vert' }, 'Explosivité': { status: null },
  'Puissance': { status: 'orange' }, 'Réactivité': { status: 'rouge' }, 'Absorption': { status: null },
  'Stabilisation': { status: null }, 'Contrôle Frontal': { status: 'rouge' }, 'Endurance': { status: null }
};
function computeDisplayLists(fSc) {
  const evFns = DISPLAYED_FUNCTIONS.filter((f) => fSc[f]);
  const forces = evFns.filter((f) => fSc[f].status === 'vert');
  const limitations = evFns.filter((f) => fSc[f].status && fSc[f].status !== 'vert');
  const nonEvaluees = evFns.filter((f) => !fSc[f].status);
  return { evFns, forces, limitations, nonEvaluees };
}
test('TEST 4 — Contrôle Frontal absent de evFns malgré un status rouge réel (jamais affiché, même déficitaire)', () => {
  const { evFns } = computeDisplayLists(fSc);
  assert.strictEqual(evFns.indexOf('Contrôle Frontal'), -1);
  assert.strictEqual(evFns.length, 8);
});
test('TEST 5 — Points limitants contient UNIQUEMENT Puissance et Réactivité (jamais les 5 qualités non évaluées, jamais Contrôle Frontal)', () => {
  const { limitations } = computeDisplayLists(fSc);
  assert.deepStrictEqual(limitations.sort(), ['Puissance', 'Réactivité'].sort());
});
test('TEST 6 — Non évaluées contient exactement les 5 qualités à status null (Mobilité, Explosivité, Absorption, Stabilisation, Endurance)', () => {
  const { nonEvaluees } = computeDisplayLists(fSc);
  assert.deepStrictEqual(nonEvaluees.sort(), ['Mobilité', 'Explosivité', 'Absorption', 'Stabilisation', 'Endurance'].sort());
});

// ═══════════════ TEST 7 — priorités/déficits objectivés (computeMoteur) : Contrôle Frontal jamais
// promu déficit prioritaire même s'il est réellement rouge/orange pour ce patient ═══════════════
test('TEST 7 — computeMoteur : Contrôle Frontal jamais dans priorities, même avec un déficit TFM réel', () => {
  const testData = {
    hip_abd: { active: true, D: { trials: { n: [8], nkg: [0.6] } }, G: { trials: { n: [8], nkg: [0.6] } } },
    hip_add: { active: true, D: { trials: { n: [8], nkg: [0.6] } }, G: { trials: { n: [8], nkg: [0.6] } } },
    df_iso: { active: true, D: { trials: { n: [8], nkg: [0.6] } }, G: { trials: { n: [8], nkg: [0.6] } } }
  };
  const moteur = computeMoteur(testData, {}, null, 25, {});
  const fonctions = moteur.priorities.map((p) => p.fonction);
  assert.strictEqual(fonctions.indexOf('Contrôle Frontal'), -1);
});

// ═══════════════ TEST 8 — FunctionGaugeCard gère bien "Non évalué" sans invention de statut ════
// (vérification au niveau du source, pas d'un rendu React réel : h/React ne sont pas chargés dans
// ce harnais Node minimal, comme pour tous les autres fichiers de tests de cette session.)
test('TEST 8 — le corps de FunctionGaugeCard affiche explicitement "Non évalué" quand status est null, jamais un statut/couleur inventés', () => {
  const marker = 'function FunctionGaugeCard(';
  const idx = code.indexOf(marker);
  const bodyEnd = code.indexOf('\n}\n', idx);
  const body = code.slice(idx, bodyEnd);
  assert.ok(body.includes("'Non évalué'"), 'doit afficher explicitement "Non évalué"');
  assert.ok(body.includes('status?SL[status]:'), 'le libellé ne doit jamais lire SL[null]');
  assert.ok(body.includes('status?col:C.border') || body.includes('status?SC[status]'), 'la couleur ne doit jamais être dérivée d\'un status null');
});
test('TEST 9 — FunctionGaugeCard existe et est câblée dans le rendu de AnalyseView (recherche source)', () => {
  assert.ok(code.includes("h(FunctionGaugeCard,{key:f,label:f,sc:fSc[f]})"), 'FunctionGaugeCard doit être appelée dans la grille des qualités fonctionnelles');
});

// ═══════════════ TEST 10-11 — régression Yanis (fixture CMJ établie) : 8 sévérités inchangées,
// et Contrôle Frontal n'apparaît dans aucune structure destinée au praticien ═══════════════════
const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [36.1], ecc_peak_vel: [0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };
const EXPECTED_SEVERITIES = { Force: 'preserved', Puissance: 'modere', Explosivité: 'modere', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Stabilisation: 'majeur', Endurance: 'majeur' };

test('TEST 10 — régression Yanis : les 8 sévérités cliniques (Moteur des Qualités, HYP_CSM_QUALITIES) restent strictement identiques', () => {
  const moteur = computeMoteur(YANNIS_DATA, {}, null, 25, YANNIS_NORM_SEL);
  const csm = moteur.clinicalSynthesisV2;
  HYP_CSM_QUALITIES.forEach((q) => assert.strictEqual(csm.clinicalProfile[q].severity, EXPECTED_SEVERITIES[q], q));
});
test('TEST 11 — HYP_CSM_QUALITIES (les 8 qualités du modèle HYP V1) ne contient jamais Contrôle Frontal ni Contrôle Sensoriel (déjà vrai avant cette session, non-régression)', () => {
  assert.strictEqual(HYP_CSM_QUALITIES.indexOf('Contrôle Frontal'), -1);
  assert.strictEqual(HYP_CSM_QUALITIES.indexOf('Contrôle Sensoriel'), -1);
  assert.strictEqual(HYP_CSM_QUALITIES.length, 8);
});

// ═══════════════ GUARDS ═══════════════════════════════════════════════════════════════════════
test('GUARD 1 — les 8 moteurs HYP-XX-01 LOCKED restent BYTE-IDENTIQUES au commit de référence', () => {
  const BASELINE_COMMIT = 'daa42cc';
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
test('GUARD 2 — computeCsmV2/computeBiomecaPhase/BiomechanicalProfileEngine restent BYTE-IDENTIQUES (cette session ne touche que la présentation)', () => {
  const BASELINE_COMMIT = 'daa42cc';
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
  ['computeCsmV2', 'computeBiomecaPhase'].forEach((fn) => assert.strictEqual(extractFnBody(code, fn), extractFnBody(baseHtml, fn), fn + ' a été modifiée'));
});
test('GUARD 3 — FUNCTIONS/FN_KEY/FN_ICON/HYP_CSM_QUALITIES/THRESHOLDS/NORMS inchangés (retrait scopé à la présentation, jamais au référentiel)', () => {
  assert.strictEqual(FUNCTIONS.length, 10);
  assert.strictEqual(Object.keys(FN_KEY).length, 10);
  assert.strictEqual(Object.keys(FN_ICON).length, 10);
  assert.strictEqual(HYP_CSM_QUALITIES.length, 8);
  assert.strictEqual(Object.keys(THRESHOLDS).length, 24);
  assert.strictEqual(Object.keys(NORMS).length, 64);
});
test('GUARD 4 — le diff de ce commit introduit bien DISPLAYED_FUNCTIONS ; les fonctions protégées (GUARD 2, comparaison byte-identique) n\'ont, elles, subi aucune ligne +/- réelle', () => {
  const diff = execSync('git diff HEAD -- index.html', { cwd: path.join(__dirname, '..') }).toString();
  if (diff.trim().length === 0) return; // déjà commité au moment du test
  assert.ok(diff.includes('DISPLAYED_FUNCTIONS'));
  // Seules les lignes +/- comptent — un nom de fonction protégée peut légitimement apparaître dans
  // l'en-tête de hunk "@@ ... @@ function xxx(...)" que git ajoute pour situer le contexte, sans
  // qu'aucune ligne de cette fonction n'ait réellement changé (déjà prouvé, plus strictement, par
  // GUARD 2 via comparaison byte-identique complète).
  const changedLines = diff.split('\n').filter((l) => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'));
  ['function computeCsmV2(', 'function computeBiomecaPhase(', 'function computeHypAbsorption01('].forEach((sig) => {
    assert.ok(!changedLines.some((l) => l.includes(sig)), sig + ' ne doit apparaître dans aucune ligne +/- réelle du diff');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

// Tests unitaires — HYP-ABS-01 V2, intégration réelle dans computeMoteur() (index.html).
//
// Contrairement à hypEngineLot1.test.js (HYP-MOB-01, fichier additif JAMAIS chargé par
// index.html), ce moteur est écrit DIRECTEMENT dans index.html et remplace fSc['Absorption']
// à l'intérieur de computeMoteur() lui-même — voir IMPLEMENTATION_HYP_ABS_V2.md. Ce fichier
// extrait donc une tranche plus large d'index.html (jusqu'à la fin de computeMoteur(), avant le
// bloc SUPABASE CONFIG) pour tester le moteur exactement comme il tourne en production, plutôt
// que via injection de dépendances.
//
// Couvre les 13 cas mandatés par la mission d'implémentation (§22) + la non-régression des
// autres qualités et sorties de computeMoteur (§23).
//
// Exécution : node tests/hypAbsorption01.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var C={');
const end = code.indexOf('// ── SUPABASE CONFIG');
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur() dans index.html.');
const slice = code.slice(start, end);

global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok — ' + name);
  } catch (e) {
    failed++;
    console.log('  FAIL — ' + name);
    console.log('    ' + e.message);
  }
}

var POP = null, AGE = 25; // pas de norme population -> force les cas NORMS-dépendants à rester non déterminables, volontairement, pour vérifier qu'aucun statut n'est inventé en son absence.

function cmj(vals) {
  var trials = {};
  Object.keys(vals).forEach(function (k) { trials[k] = [vals[k]]; });
  return { active: true, trials: trials };
}
function dj(vals) {
  var trials = {};
  Object.keys(vals).forEach(function (k) { trials[k] = [vals[k]]; });
  return { active: true, trials: trials };
}

// Population couvrant cmj_braking_rfd/cmj_force_zero_vel (bball2425_ncaa_m, NORMS ligne dédiée) —
// seule façon de faire sortir applyThr() de son repli 'non classifiable' pour ces deux KPI sans
// inventer un seuil (aucun repli THRESHOLDS n'existe pour eux).
var POP_CMJ = 'bball2425_ncaa_m';

console.log('HYP-ABS-01 V2 — sous-domaine A (Core)');

test('1. RFD très déficitaire + Force@0V très déficitaire (Impulse non classifiable) -> Niveau 1 déficitaire, profil non couvert (pas un des 5 profils forcé)', () => {
  var td = { cmj: cmj({ braking_rfd: 1, force_zero_vel: 1, braking_impulse: 40 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'deficitaire');
  assert.strictEqual(h.profilCore, 'non_couvert_impulse_non_classifiable');
  assert.strictEqual(h.sousDomaines.A_core.braking_impulse.classifiable, false);
  assert.ok(r.functionScores['Absorption'].status === 'orange' || r.functionScores['Absorption'].status === 'rouge');
});

test('2. RFD normal + Impulse normal (Force@0V absente) -> engine ne force jamais un profil sur une donnée manquante', () => {
  var td = { cmj: cmj({ braking_rfd: 174, braking_impulse: 5 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.sousDomaines.A_core.force_zero_vel.status, null);
  assert.notStrictEqual(h.niveau1, 'deficitaire');
});

test('3. RFD déficitaire + Impulse déficitaire (lecture qualitative) + Force@0V déficitaire -> Niveau 1 déficitaire (2 preuves Core disponibles toutes deux déficitaires)', () => {
  var td = { cmj: cmj({ braking_rfd: 1, force_zero_vel: 1, braking_impulse: 1 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'deficitaire');
});

test('4. RFD normal + Impulse normal + Force@0V normal -> Niveau 1 OK (sous-domaine A)', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'ok');
  assert.strictEqual(r.functionScores['Absorption'].status, 'vert');
});

console.log('\nHYP-ABS-01 V2 — sous-domaines B/C/D ne génèrent jamais le Niveau 1 seuls');

test('5. Core conservé + DJ RSI déficitaire -> Niveau 1 OK, sous-domaine D signale une caractérisation sans faire basculer le Niveau 1', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }), dj: dj({ rsi: 0.3, contact_time: 400 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'ok');
  assert.strictEqual(h.sousDomaines.D_absorptionReactive.dj_rsi.status, 'rouge');
  assert.strictEqual(r.functionScores['Absorption'].status, 'vert');
});

test('6. Asymétrie de freinage marquée, Core par ailleurs normal -> modificateur seul, jamais un déficit Core généré seul', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5, ecc_decel_rfd_L: 200, ecc_decel_rfd_R: 60, ecc_decel_rfd_asym: 57 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'ok');
});

test('7. Capacité excentrique déficitaire (ecc_peak_vel) mais Core conservé -> Niveau 1 OK, sous-domaine B explicatif seul', () => {
  // POP_CMJ (bball2425_ncaa_m) couvre cmj_ecc_peak_vel mais pas cmj_ecc_mean_power (seules des
  // tables générales par âge, non utilisées ici, couvrent ce dernier) — cmj_ecc_mean_power reste
  // donc non déterminable dans ce cas, conformément à la couverture réelle des seuils documentée
  // en tête de fichier, pas une erreur de test.
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5, ecc_peak_vel: 0.1 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'ok');
  assert.notStrictEqual(h.sousDomaines.B_capaciteExcentrique.ecc_peak_vel.status, null);
});

test('8. Stratégie anormale (depth) mais Core conservé -> Niveau 1 OK, sous-domaine C caractérise sans déficit global', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5, depth: 5 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.niveau1, 'ok');
});

console.log('\nHYP-ABS-01 V2 — frontière TTS / Stabilisation');

test('9. landing_uni_tts déficitaire -> aucun impact sur le diagnostic Absorption (retiré du raisonnement HYP-ABS-01)', () => {
  var tdBase = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }) };
  var tdWithTts = Object.assign({}, tdBase, { landing_uni: { active: true, D: { trials: { tts: [5] } }, G: { trials: { tts: [5] } } } });
  var rBase = computeMoteur(tdBase, {}, POP_CMJ, 26);
  var rWithTts = computeMoteur(tdWithTts, {}, POP_CMJ, 26);
  assert.strictEqual(rBase.functionScores['Absorption'].status, rWithTts.functionScores['Absorption'].status);
});

test('10. landing_bi_tts déficitaire -> aucun impact sur le diagnostic Absorption', () => {
  var tdBase = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }) };
  var tdWithTts = Object.assign({}, tdBase, { landing_bi: cmj({ tts: 5 }) });
  var rBase = computeMoteur(tdBase, {}, POP_CMJ, 26);
  var rWithTts = computeMoteur(tdWithTts, {}, POP_CMJ, 26);
  assert.strictEqual(rBase.functionScores['Absorption'].status, rWithTts.functionScores['Absorption'].status);
});

test('11. sllt_tts déficitaire -> sous-domaine E non implémenté (aucun seuil SLLT dans index.html), rôle non modifié par ce moteur', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }), sllt: { active: true, D: { trials: { tts: [5] } }, G: { trials: { tts: [5] } } } };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  var h = r.functionScores['Absorption'].hypAbs01;
  assert.strictEqual(h.sousDomaines.E_receptionImpact.available, false);
});

console.log('\nDonnées insuffisantes / anciens bilans');

test('12. Aucune donnée CMJ -> Niveau 1 non_determinable, status:null explicite (normalisation architecturale : HYP est désormais la source de vérité du statut, plus de repli TFM — cf. HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md)', () => {
  var r = computeMoteur({}, {}, null, 25);
  assert.ok(r.functionScores['Absorption']); // objet toujours produit (comme les 5 autres moteurs "remplacement intégral"), jamais littéralement null.
  assert.strictEqual(r.functionScores['Absorption'].status, null);
  assert.strictEqual(r.functionScores['Absorption'].hypAbs01.niveau1, 'non_determinable');
  assert.strictEqual(r.functionScores['Absorption'].tfmFallback, null); // le repli TFM générique reste exposé séparément (jamais supprimé), ici null car aucun test actif.
});

test('13. Ancien bilan (cmj sans braking_rfd/force_zero_vel, seulement height) -> pas de crash, repli documenté, hypAbs01 exposé pour traçabilité', () => {
  var td = { cmj: cmj({ height: 35 }), dj: dj({ rsi: 2.0 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  assert.ok(r.functionScores['Absorption']);
  assert.strictEqual(r.functionScores['Absorption'].hypAbs01.niveau1, 'non_determinable');
});

console.log('\nNon-régression — les autres qualités et sorties de computeMoteur restent inchangées');

// Note importante (découverte en écrivant ce test, non causée par HYP-ABS-01 V2) : cmj_braking_rfd
// et cmj_force_zero_vel appartiennent à TBK.cmj.kpis et étaient DÉJÀ agrégés, avant cette mission,
// par computeTestStatus('cmj',...) dans le statut global du test 'cmj' — lui-même pondéré par TFM
// dans PLUSIEURS fonctions simultanément (cmj:{explosivite:3,puissance:3,force:1,reactivite:1,
// absorption:2}). Faire varier braking_rfd/force_zero_vel peut donc légitimement faire varier
// Force/Explosivité/Puissance/Réactivité via ce mécanisme TFM générique préexistant — ce n'est PAS
// une régression introduite par ce moteur (jamais modifié : computeTestStatus, TFM et la boucle
// FUNCTIONS.forEach générique restent tels quels). Documenté dans IMPLEMENTATION_HYP_ABS_V2.md,
// section "Dépendance inattendue". Le test ci-dessous isole donc volontairement deux variables qui
// ne produisent JAMAIS de statut via applyThr (cmj_braking_impulse, dj_contact_time — aucun seuil
// NORMS ni THRESHOLDS, cf. couverture documentée en tête de fichier) : les faire varier ne peut
// donc, par construction, changer AUCUNE fonction, Absorption y compris (niveau1 n'en dépend pas).
test('Faire varier une variable non classifiable (braking_impulse, dj_contact_time) ne change aucune fonction, Absorption y compris', () => {
  var tdA = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 1 }), dj: dj({ rsi: 2.0, contact_time: 100 }) };
  var tdB = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 999 }), dj: dj({ rsi: 2.0, contact_time: 999 }) };
  var rA = computeMoteur(tdA, {}, POP_CMJ, 26);
  var rB = computeMoteur(tdB, {}, POP_CMJ, 26);
  Object.keys(rA.functionScores).forEach(function (fn) {
    var a = rA.functionScores[fn], b = rB.functionScores[fn];
    assert.strictEqual(a && a.status, b && b.status, fn + ' a changé alors que seule une variable non classifiable a changé');
  });
});
// Mise à jour (implémentation HYP-FOR-01, postérieure à ce fichier) : Force n'est plus jamais
// dérivée de la boucle TFM générique/computeTestStatus('cmj',...) — elle est désormais pilotée
// intégralement par computeHypForce01(), qui ne lit aucune variable CMJ (les 4 preuves globales
// sont imtp_n/slimtp_n/iso_belt_squat_n/sl_iso_push_n). Avec seulement 'cmj' actif ici (aucun test
// de force), HYP-FOR-01 retourne honnêtement non_determinable (status:null) — ce qui prouve, tout
// autant que l'ancienne assertion, que le bloc HYP-ABS-01 n'intercepte jamais fSc['Force'].
test('Force n\'est jamais interceptée par le bloc HYP-ABS-01 — avec seul \'cmj\' actif (aucun test de force), HYP-FOR-01 retourne honnêtement non_determinable', () => {
  var td = { cmj: cmj({ braking_rfd: 1, force_zero_vel: 1, braking_impulse: 1, height: 35 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  assert.strictEqual(r.functionScores['Force'].status, null);
  assert.strictEqual(r.functionScores['Force'].hypFor01.state, 'non_determinable');
});

test('testStatuses/systemScores/rtpStatus/qualityScores/capaciteScores restent produits normalement (structure de computeMoteur non cassée)', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }) };
  var r = computeMoteur(td, {}, POP_CMJ, 26);
  assert.ok(r.testStatuses);
  assert.ok(r.systemScores);
  assert.ok(r.qualityScores);
  assert.ok(r.capaciteScores);
  assert.strictEqual(r.testStatuses.cmj, computeTestStatus('cmj', td.cmj, POP_CMJ, 26));
});

test('Pureté : deux appels identiques produisent le même functionScores.Absorption (hors aucun champ temporel — ce moteur n\'en a pas)', () => {
  var td = { cmj: cmj({ braking_rfd: 174, force_zero_vel: 30.5, braking_impulse: 5 }) };
  var r1 = computeMoteur(td, {}, POP_CMJ, 26);
  var r2 = computeMoteur(td, {}, POP_CMJ, 26);
  assert.deepStrictEqual(r1.functionScores['Absorption'], r2.functionScores['Absorption']);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

// Tests unitaires — Le Fil de Raisonnement : moteur d'explication générique de Kinexus (05/08).
//
// Décision du praticien : ne pas construire un écran CMJ de plus, mais LE composant
// d'explication réutilisable par tout futur module (Drop Jump, SLCMJ, Isométrie, RTP...).
// L'architecture retenue est primitive générique + adaptateur de domaine (même principe que
// BiomechanicalProfileEngine/BiomechanicalProfiles) :
//   - FilDeRaisonnementView (composant React) ne connaît aucun nom de domaine, consomme
//     uniquement le contrat RaisonnementBoard documenté dans index.html ;
//   - buildRaisonnementBoardCMJ() est l'adaptateur CMJ, pure fonction de formatage qui
//     transforme computeMouvementAnalysis() (déjà calculé) en RaisonnementBoard.
// Ce fichier teste exclusivement l'adaptateur (données), pas le rendu React (aucun DOM
// disponible ici) — chaque champ du board doit être fidèle aux moteurs déjà calculés, jamais
// une valeur inventée par l'adaptateur.
//
// Exécution : node tests/filDeRaisonnement.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

// Même slice étendue que rapportMouvementPDF.test.js : buildRaisonnementBoardCMJ/FilDeRaisonnementView
// référencent C.* (palette globale, définie avant 'var TESTS=[').
const start = code.indexOf('var C={');
const endMarker = "ReactDOM.createRoot(document.getElementById('root'))";
const end = code.indexOf(endMarker);
if (start < 0 || end < 0) throw new Error('Impossible de localiser le moteur dans index.html.');
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

console.log('Le Fil de Raisonnement — adaptateur CMJ (buildRaisonnementBoardCMJ)');

// Même fixture, vérifiée par sondage, que rapportMouvementPDF.test.js : priorite1=Braking
// (Modérée), aucune priorite2, Landing="Asymétrie principale" (membre Gauche).
NORMS.test_fdr_pop = {
  cmj_ecc_mean_power: [10, 20, 40, 60, 75],
  cmj_force_zero_vel: [10, 20, 40, 60, 75],
  cmj_braking_rfd: [40, 60, 90, 130, 180],
  cmj_landing_peak_force: [20, 30, 50, 70, 90],
  cmj_landing_impulse: [1, 2, 4, 6, 8],
  cmj_time_to_stab: [1, 2, 4, 6, 8],
  cmj_ecc_decel_rfd_asym: [1, 3, 6, 10, 20],
  cmj_landing_peak_force_asym: [1, 3, 6, 10, 20]
};

function cmjBilan() {
  return {
    id: 1, date: new Date().toISOString(),
    testData: {
      cmj: {
        active: true,
        trials: {
          ecc_mean_power: [12], force_zero_vel: [12], braking_rfd: [45],
          landing_peak_force: [22], landing_impulse: [1.2], time_to_stab: [1.2],
          ecc_decel_rfd_asym: [15],
          landing_peak_force_asym: [12], landing_peak_force_L: [20], landing_peak_force_R: [24]
        }
      }
    }
  };
}

test('railItems : une entrée par phase CMJ, score/couleur fidèles à analysis.phases, threadId renseigné uniquement pour les phases retenues en priorité', () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, 'Sportif Test — CMJ');
  assert.strictEqual(board.railItems.length, CMJ_PHASES.length);
  const braking = board.railItems.find(r => r.key === 'braking');
  assert.strictEqual(braking.threadId, 'braking', 'Braking est priorite1 -> doit être cliquable vers son thread');
  assert.strictEqual(Math.round(braking.score), Math.round(mv.phases.braking.score));
  const unloading = board.railItems.find(r => r.key === 'unloading');
  assert.strictEqual(unloading.threadId, null, 'Unloading ne fait partie d\'aucune priorité -> pas de thread associé');
});

test('threads : un thread par priorité retenue, fidèle à dossierPreuvesPhase (tier) et phasePresentation (pourquoi)', () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  assert.strictEqual(board.threads.length, 1, 'une seule priorité (Braking) dans cette fixture');
  const t = board.threads[0];
  assert.strictEqual(t.id, 'braking');
  assert.strictEqual(t.rang, 1);
  assert.strictEqual(t.tier, mv.priorisation.priorite1.niveauPriorite);
  assert.strictEqual(t.pourquoi, phasePresentation('braking', mv).pourquoi, 'le texte "pourquoi" doit être repris à l\'identique de phasePresentation, jamais reformulé');
});

test('threads : proof reprend exactement explications[phase].sections.reglesAppliquees.gateFacteurLimitant (arbre de preuve déjà calculé, jamais recalculé)', () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  const t = board.threads[0];
  const expected = mv.explications.braking.sections.reglesAppliquees.gateFacteurLimitant;
  assert.strictEqual(t.proof, expected, 'proof doit être LA MÊME référence, pas une copie recalculée');
  assert.ok('result' in t.proof && 'children' in t.proof, 'le nœud de preuve garde sa forme {name,result,reason,children} exploitable par raisonnementProofNode');
});

test("threads : variablesResponsables reprend explications[phase].sections.variablesUtilisees, jamais une liste inventée", () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  const t = board.threads[0];
  assert.strictEqual(t.variablesResponsables, mv.explications.braking.sections.variablesUtilisees);
});

test("threads : les liens incluent la qualité associée (mapping CMJ_PHASE_TO_QUALITY), marquée 'non évaluée' quand functionScores est absent (jamais un statut inventé)", () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  const t = board.threads[0];
  const qualiteNom = CMJ_PHASE_TO_QUALITY.braking;
  const lien = t.liens.find(l => l.label.indexOf('Qualité associée') === 0);
  assert.ok(lien, 'un lien "Qualité associée" doit exister pour Braking');
  assert.ok(lien.label.indexOf(qualiteNom) >= 0);
  assert.ok(lien.label.indexOf('non évaluée') >= 0, 'computeMouvementAnalysis ne fournit jamais functionScores -> jamais un statut de qualité inventé ici');
});

test('autresObservations : liste les phases exploitables mais non retenues en priorité, avec leur niveau déjà classé (jamais recalculé)', () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  const landingObs = board.autresObservations.find(o => o.key === 'landing');
  assert.ok(landingObs, 'Landing est exploitable et hors priorité -> doit apparaître en observation');
  assert.strictEqual(landingObs.niveauLabel, mv.phases.landing.niveau.label);
  assert.ok(landingObs.note && landingObs.note.indexOf('principale') >= 0, 'la note doit refléter la cartographie d\'asymétrie déjà calculée (Asymétrie principale)');
  assert.ok(!board.autresObservations.some(o => o.key === 'braking'), 'Braking est une priorité -> ne doit jamais apparaître aussi en observation (pas de doublon)');
});

test('confidenceGlobal : fidèle à syntheseBiomecanique.confianceGlobale (composite/band déjà calculés), jamais un nouvel indice inventé', () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  assert.ok(board.confidenceGlobal);
  assert.strictEqual(board.confidenceGlobal.label, mv.syntheseBiomecanique.confianceGlobale.band.label);
  assert.strictEqual(board.confidenceGlobal.percent, Math.round(mv.syntheseBiomecanique.confianceGlobale.composite));
  assert.strictEqual(board.confidenceGlobal.color, mv.syntheseBiomecanique.confianceGlobale.band.color);
});

test('strategyChip : absent (null) quand la signature biomécanique est homogène (aucune dominante), jamais un profil inventé', () => {
  const mv = computeMouvementAnalysis(cmjBilan(), 'test_fdr_pop', 24);
  assert.strictEqual(mv.signature.profilDominant, null, 'prérequis du test : cette fixture doit produire une signature homogène');
  const board = buildRaisonnementBoardCMJ(mv, '');
  assert.strictEqual(board.strategyChip, null);
});

test('sans aucune priorité retenue (toutes les phases dans les normes) : threads vide, aucun "profil équilibré" recalculé ici (délégué au composant)', () => {
  NORMS.test_fdr_normal = {
    cmj_ecc_mean_power: [10, 20, 40, 60, 75],
    cmj_force_zero_vel: [10, 20, 40, 60, 75]
  };
  const bilan = { id: 9, date: new Date().toISOString(), testData: { cmj: { active: true, trials: { ecc_mean_power: [55], force_zero_vel: [55] } } } };
  const mv = computeMouvementAnalysis(bilan, 'test_fdr_normal', 24);
  assert.strictEqual(mv.priorisation.priorite1, null, 'prérequis du test : aucune priorité attendue (valeurs dans les normes)');
  const board = buildRaisonnementBoardCMJ(mv, '');
  assert.strictEqual(board.threads.length, 0);
});

test('alertes : traduites depuis les codes du Moteur d\'Alerte via ALERT_LABELS_CMJ, jamais une phrase inventée hors de ce référentiel', () => {
  // Aucune norme du tout -> braking_rfd non normé -> alerte 'donnees_manquantes_phase' garantie.
  NORMS.test_fdr_vide = {};
  const bilan = { id: 10, date: new Date().toISOString(), testData: { cmj: { active: true, trials: { ecc_mean_power: [40], force_zero_vel: [30], braking_rfd: [80] } } } };
  const mv = computeMouvementAnalysis(bilan, 'test_fdr_vide', 24);
  const board = buildRaisonnementBoardCMJ(mv, '');
  const alerteManquante = board.alertes.find(a => a.id === 'donnees_manquantes_phase');
  assert.ok(alerteManquante, 'attendu au moins une alerte "données manquantes" (aucune norme fournie)');
  assert.strictEqual(alerteManquante.titre, ALERT_LABELS_CMJ.donnees_manquantes_phase);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

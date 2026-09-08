// Tests unitaires — Section Mouvement (CMJ) du rapport PDF sportif (buildSportifReport).
//
// Décision du praticien (05/08) : les 4 fichiers de référence UX (kinexus_reasoning_ui.html,
// kinexus_movement_experience_6.html, kinexus_rapport_pdf.html, kinexus_ux_concepts.html)
// deviennent la documentation de référence de Kinexus. kinexus_rapport_pdf.html spécifie une
// section Mouvement (frise + priorité clinique + point de vigilance secondaire + asymétries
// confirmées + stratégie dominante + synthèse) absente du rapport jusqu'ici. Le praticien a
// confirmé qu'elle occupe une 3e page dédiée (le rapport passe de 2 à 3 pages uniquement quand un
// CMJ actif existe pour le bilan — jamais figé à 2 ni à 3).
//
// Ce fichier vérifie : la page 3 n'apparaît que si CMJ est actif, la numérotation "Page X/N"
// s'adapte dynamiquement (2 ou 3), et le contenu de la page 3 reflète fidèlement ce que
// computeMouvementAnalysis a déjà calculé (aucune valeur inventée dans buildSportifReport).
//
// Exécution : node tests/rapportMouvementPDF.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

// Slice étendue par rapport aux autres suites : buildSportifReport/computeMoteur/poseSilhouetteHTML
// vivent après le repère 'var TESTS=[...]// Population de normes à utiliser' habituel. On démarre
// donc à 'var C={' (palette globale, nécessaire à phaseColor/poseSilhouetteHTML) et on s'arrête
// juste avant le seul appel réellement exécuté au chargement (ReactDOM.createRoot(...).render(...))
// — tout ce qui précède n'est que des déclarations var/function, sûres à eval() en Node.
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

console.log('Rapport PDF sportif — section Mouvement (page 3)');

const athlete = { id: 1, prenom: 'Jean', nom: 'Dupont', sport: 'Basketball', dateNaissance: '2000-01-01', normPopulation: 'test_pdf_pop' };

// Population couvrant à la fois les normes de phase (Braking), les normes des variables
// discriminantes du profil Absorbeur (-> convergence profil<->phase sur Braking) et les normes
// d'asymétrie de Landing — valeurs vérifiées au préalable (script de sondage) pour produire
// deterministement : priorite1 = Braking (Modérée), aucune priorite2, Landing = "Asymétrie
// principale" avec membre dominant Gauche.
NORMS.test_pdf_pop = {
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
    id: 1, date: new Date().toISOString(), type: 'Performance', sousType: 'Pré-saison',
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

// RÉVISÉ (synchronisation) : le total de pages n'est plus seulement 2 ou 3. Une mission ULTÉRIEURE
// et validée ("feat(csm-v2): plain-language patient report page", commit 566457f, postérieure à ce
// fichier) ajoute une 4e page conditionnelle ("Synthèse pour le sportif", CSM V2) dès que
// csmV2PatientHasContent est vrai — totalPages = 2 + (CMJ actif ? 1 : 0) + (contenu CSM V2 patient ?
// 1 : 0) (cf. index.html, totalPages juste avant buildSportifReport). Les 2 tests ci-dessous
// dérivent désormais le nombre de pages attendu de ce même calcul (jamais un chiffre figé), pour ne
// plus se désynchroniser à la prochaine page ajoutée légitimement.
function expectedTotalPages(res, hasCmj) {
  // Reproduit exactement la même lecture que buildSportifReport (index.html, csmV2Patient/
  // csmV2PatientHasContent juste avant totalPages) — jamais une approximation du champ.
  var csmV2Patient = res.clinicalSynthesisV2 ? csmV2PatientNarrative(res.clinicalSynthesisV2.clinicalProfile, res.clinicalSynthesisV2.synthesis) : null;
  var hasCsmV2PatientContent = !!(csmV2Patient && csmV2Patient.findings.length);
  return 2 + (hasCmj ? 1 : 0) + (hasCsmV2PatientContent ? 1 : 0);
}

test('bilan sans CMJ actif : le nombre de pages reste celui du bilan de base (aucune section Mouvement)', () => {
  const bilan = { id: 2, date: new Date().toISOString(), type: 'Performance', testData: {} };
  const res = computeMoteur(bilan.testData, bilan.questData, effectiveNormPop(athlete), 24);
  const out = buildSportifReport(athlete, bilan, res);
  const pageCount = (out.match(/class="print-page"/g) || []).length;
  const expected = expectedTotalPages(res, false);
  assert.strictEqual(pageCount, expected, 'sans CMJ actif, le nombre de pages doit correspondre exactement à 2 + (contenu CSM V2 patient ? 1 : 0), jamais figé à 2');
  assert.ok(out.indexOf('PAGE 1/' + expected) >= 0);
  assert.ok(out.indexOf('PAGE 2/' + expected) >= 0);
  assert.ok(out.indexOf('COUNTER MOVEMENT JUMP') < 0, 'la section Mouvement ne doit jamais apparaître sans CMJ actif');
});

test('bilan avec CMJ actif : le rapport gagne la page Mouvement en plus du total de base, numérotation dynamique', () => {
  const bilan = cmjBilan();
  const res = computeMoteur(bilan.testData, bilan.questData, effectiveNormPop(athlete), 24);
  const out = buildSportifReport(athlete, bilan, res);
  const pageCount = (out.match(/class="print-page"/g) || []).length;
  const expected = expectedTotalPages(res, true);
  assert.strictEqual(pageCount, expected, 'avec CMJ actif, le nombre de pages doit correspondre exactement à 3 + (contenu CSM V2 patient ? 1 : 0), jamais figé à 3');
  assert.ok(out.indexOf('PAGE 1/' + expected) >= 0);
  assert.ok(out.indexOf('PAGE 2/' + expected) >= 0);
  assert.ok(out.indexOf('PAGE 3/' + expected) >= 0);
  assert.ok(out.indexOf('COUNTER MOVEMENT JUMP') >= 0);
});

test('page 3 : la priorité clinique affichée est fidèle à computeMouvementAnalysis (Braking, Très forte grâce à la convergence profil+qualité), jamais un texte inventé', () => {
  const bilan = cmjBilan();
  const res = computeMoteur(bilan.testData, bilan.questData, effectiveNormPop(athlete), 24);
  // computeMouvementAnalysis reçoit désormais functionScores (05/08) : avec cette fixture,
  // Absorption (qualité associée à Braking) est aussi déficitaire -> countMoteurs=2 -> "Très
  // forte" plutôt que "Modérée" (qui restait le plafond tant que functionScores valait null).
  const mv = computeMouvementAnalysis(bilan, effectiveNormPop(athlete), 24, res.functionScores);
  assert.strictEqual(mv.priorisation.priorite1.phase, 'braking', 'prérequis du test : la fixture doit produire Braking comme priorité n°1');
  assert.strictEqual(mv.priorisation.priorite1.niveauPriorite, 'Très forte');
  assert.strictEqual(mv.priorisation.priorite1.qualiteDeficiente, true, 'Absorption doit être détectée déficitaire -> déficit confirmé (registre 1 de KINEXUS_CLINICAL_ARCHITECTURE.md)');
  assert.strictEqual(mv.priorisation.priorite2, null, 'prérequis du test : aucune priorité secondaire attendue avec cette fixture');
  const out = buildSportifReport(athlete, bilan, res);
  assert.ok(out.indexOf('Priorité clinique · Très forte') >= 0, 'le rapport doit reprendre exactement le niveauPriorite déjà calculé, avec functionScores branché comme dans buildSportifReport');
  assert.ok(out.indexOf(CMJ_PHASE_LABEL.braking) >= 0, 'le rapport doit nommer la phase Braking');
  assert.ok(out.indexOf('Point de vigilance secondaire') < 0, 'aucune priorité 2 dans cette fixture -> aucune ligne de vigilance secondaire ne doit apparaître');
});

// ═══════════════ RÉGRESSION RESTAURÉE (MISSION_RESTAURATION_NORMES_ASYMETRIE, 07/09) ═══════════
// Cause d'origine (désormais corrigée dans index.html, computeMouvementAnalysis/buildSportifReport/
// AnalyseView) : le commit dbd93ad avait fait passer la MÊME population (effectiveCmjPhaseAnalysisPopulation,
// 'bball2425_bleague') au Moteur Biomécanique de phase ET au Moteur d'Asymétrie — bball2425_bleague
// ne couvrant AUCUNE norme d'asymétrie du catalogue (audit : 0/64 populations), le second était
// structurellement mort. Restauration : computeMouvementAnalysis reçoit désormais un 5e argument
// optionnel (asymPop), et les 2 appelants réels (buildSportifReport, AnalyseView) transmettent
// effectiveNormPop(athlete) pour l'Asymétrie — exactement le chemin de données d'avant dbd93ad —
// tout en conservant bball2425_bleague pour le Moteur de Phase (jamais modifié, décision produit
// distincte). Aucun seuil, aucune norme, aucun moteur HYP/CSM V2 touché — voir le commentaire
// détaillé sur computeMouvementAnalysis dans index.html pour le détail complet.
// Le mv calculé ci-dessous reproduit donc exactement l'appel réel (double population), pas un
// appel à population unique comme avant cette restauration.
//
// CONSÉQUENCE OBSERVÉE, DISTINCTE DE LA RÉGRESSION RESTAURÉE : une fois la donnée d'asymétrie
// réellement rétablie, Landing n'obtient plus "Asymétrie principale" mais "Asymétrie secondaire" —
// non pas un nouveau bug, mais l'effet, déjà validé et déjà testé ailleurs (tests/moteurAsymetrie.
// test.js, tests/filDeRaisonnement.test.js — même fixture, même constat), du plancher adaptatif du
// Moteur d'Asymétrie révisé de 2 à 1 (18a6a3c) : Braking (déjà priorité n°1 du Moteur de Phase, cf.
// test précédent) devient désormais AUSSI éligible à l'asymétrie et devance Landing. C'est le
// Moteur d'Asymétrie qui tranche cela lui-même (aucune règle nouvelle introduite ici) ; la
// restauration du chemin de données le rend simplement à nouveau observable sur cette fixture.
test("page 3 : l'asymétrie confirmée de Landing (membre Gauche) est reprise fidèlement depuis asymPhaseSummary/cartographieAsymetries", () => {
  const bilan = cmjBilan();
  const res = computeMoteur(bilan.testData, bilan.questData, effectiveNormPop(athlete), 24);
  const mv = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 24, res.functionScores, effectiveNormPop(athlete));
  const cartoLanding = mv.asymEngine.cartographie.find(c => c.phase === 'landing');
  assert.strictEqual(cartoLanding.conclusion, 'Asymétrie secondaire', 'prérequis du test, révisé : avec le plancher adaptatif=1 (18a6a3c) déjà validé, Braking devance désormais Landing -> "secondaire", cf. tests/filDeRaisonnement.test.js pour le même constat sur cette fixture');
  const out = buildSportifReport(athlete, bilan, res);
  assert.ok(out.indexOf('Asymétries confirmées') >= 0, 'la section doit apparaître : la donnée d\'asymétrie réelle est de nouveau exploitable (régression restaurée)');
  assert.ok(out.indexOf(CMJ_PHASE_LABEL.landing) >= 0 && out.indexOf('membre gauche') >= 0, 'le libellé doit citer Landing et le membre dominant (Gauche) déjà déterminé par asymMembreDominant');
});

test('page 3 : synthèse reprend mot pour mot raisonnement.syntheseFinale.axesDeTravail, jamais reformulée', () => {
  const bilan = cmjBilan();
  const res = computeMoteur(bilan.testData, bilan.questData, effectiveNormPop(athlete), 24);
  const mv = computeMouvementAnalysis(bilan, effectiveCmjPhaseAnalysisPopulation(), 24, res.functionScores, effectiveNormPop(athlete));
  const out = buildSportifReport(athlete, bilan, res);
  assert.ok(out.indexOf(mv.raisonnement.syntheseFinale.axesDeTravail) >= 0, 'la phrase de synthèse doit être reprise à l\'identique, jamais réécrite dans le rapport');
});

test("page 3 : sans aucune phase exploitable, un message honnête d'insuffisance de données s'affiche, jamais un 'profil équilibré' inventé", () => {
  const bilan = { id: 3, date: new Date().toISOString(), type: 'Performance', testData: { cmj: { active: true, trials: {} } } };
  const res = computeMoteur(bilan.testData, bilan.questData, effectiveNormPop(athlete), 24);
  const out = buildSportifReport(athlete, bilan, res);
  const expected = expectedTotalPages(res, true);
  assert.ok(out.indexOf('PAGE 3/' + expected) >= 0, 'le CMJ est actif -> la page doit exister même sans données suffisantes');
  assert.ok(out.indexOf('Données insuffisantes pour interpréter les phases') >= 0);
  assert.ok(out.indexOf('0/5 phases exploitables') >= 0);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

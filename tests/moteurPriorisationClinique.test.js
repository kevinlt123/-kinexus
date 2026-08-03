// Tests unitaires — Moteur de Priorisation Clinique.
//
// Décision du praticien (04/08) : transformer les analyses biomécaniques déjà calculées
// (Moteur Biomécanique, Profils Biomécaniques, Qualités physiques, Moteur de Raisonnement) en
// priorités d'intervention (Priorité 1/2/3), sans effectuer aucun nouveau calcul biomécanique.
// Ce fichier vérifie uniquement la couche de priorisation (dossierPreuvesPhase /
// computePriorisationClinique) — les analyses sous-jacentes ont leurs propres tests.
//
// Exécution : node tests/moteurPriorisationClinique.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var TESTS=[');
const endMarker = '// Population de normes à utiliser';
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

function fakeProfileResults(scores) {
  return Object.keys(scores).map(nom => ({
    id: nom.toLowerCase(), nom,
    result: { sufficient: scores[nom] != null, percentileGlobal: scores[nom] }
  }));
}

// Phases fictives : seuls les champs lus par le moteur de priorisation sont fournis
// (sufficient/score/niveau.label pour le filtre de candidature, variablesResponsables pour le
// dossier de preuves). Le label de niveau est fourni directement plutôt que recalculé, pour ne
// tester que la couche de priorisation (le classement niveau absolu -> label a ses propres tests
// dans le moteur biomécanique de phase).
function fakePhases(cfg) {
  const out = {};
  CMJ_PHASES.forEach(p => {
    if (cfg[p]) {
      out[p] = {
        phase: p, sufficient: true, score: cfg[p].score,
        niveau: { label: cfg[p].label },
        variablesResponsables: cfg[p].vars || []
      };
    } else {
      out[p] = { phase: p, sufficient: false };
    }
  });
  return out;
}

// Moteur de Raisonnement fictif : seuls .croisements[].{profil,sufficient,concordance.cas} et
// .indiceCoherenceGlobale.band.label sont lus par dossierPreuvesPhase.
function fakeRaisonnement(croisements, indiceLabel) {
  return {
    croisements: croisements.map(c => ({ profil: c.profil, sufficient: c.sufficient !== false, concordance: { cas: c.cas } })),
    indiceCoherenceGlobale: { band: indiceLabel ? { label: indiceLabel } : null }
  };
}

console.log('Moteur de Priorisation Clinique');

test("exemple du praticien : Braking déficitaire + tous les signaux convergents -> Priorité n°1 (Très forte)", () => {
  const phases = fakePhases({ braking: { score: 25, label: 'Déficitaire', vars: ['var1', 'var2'] } });
  const profiles = fakeProfileResults({ Absorbeur: 15 });
  const qualites = { Force: 15 }; // CMJ_PHASE_TO_QUALITY.braking === 'Force' dans le code actuel
  const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cas: 1 }], 'Très forte cohérence');
  const r = computePriorisationClinique(phases, null, profiles, qualites, raisonnement);
  assert.ok(r.priorite1, 'attendu une priorité n°1');
  assert.strictEqual(r.priorite1.phase, 'braking');
  assert.strictEqual(r.priorite1.niveauPriorite, 'Très forte');
  assert.strictEqual(r.priorite1.profilDeficient, true);
  assert.strictEqual(r.priorite1.qualiteDeficiente, true);
  assert.strictEqual(r.priorite1.coherenceForte, true);
});

test("exemple du praticien : Propulsion (Concentric) à 55e percentile, dans les normes -> pas de priorité", () => {
  const phases = fakePhases({ concentric: { score: 55, label: 'Dans les normes', vars: [] } });
  const profiles = fakeProfileResults({ Propulsif: 85 });
  const qualites = { Puissance: 70 };
  const raisonnement = fakeRaisonnement([{ profil: 'Propulsif', cas: 1 }], 'Faible cohérence');
  const r = computePriorisationClinique(phases, null, profiles, qualites, raisonnement);
  assert.strictEqual(r.priorite1, null);
  assert.strictEqual(r.priorite2, null);
  assert.strictEqual(r.priorite3, null);
  assert.strictEqual(r.autresObservations.length, 0, 'une phase dans les normes ne doit même pas être candidate');
});

test("règle impérative : un déficit isolé (aucun moteur convergent) reste en autres observations, jamais promu", () => {
  const phases = fakePhases({ landing: { score: 20, label: 'Déficitaire', vars: ['v1'] } });
  const profiles = fakeProfileResults({ Contrôle: 70 }); // non déficient
  const qualites = { Absorption: 70 }; // non déficiente
  const raisonnement = fakeRaisonnement([], null);
  const r = computePriorisationClinique(phases, null, profiles, qualites, raisonnement);
  assert.strictEqual(r.priorite1, null);
  assert.strictEqual(r.autresObservations.length, 1);
  assert.strictEqual(r.autresObservations[0].phase, 'landing');
  assert.strictEqual(r.autresObservations[0].niveauPriorite, 'Faible');
});

test("palier Forte : deux moteurs convergents mais sans cohérence forte ni >=2 variables -> Forte (pas Très forte)", () => {
  const phases = fakePhases({ braking: { score: 22, label: 'Déficitaire', vars: ['var1'] } });
  const profiles = fakeProfileResults({ Absorbeur: 18 });
  const qualites = { Force: 15 };
  const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cas: 1 }], 'Modérée cohérence');
  const r = computePriorisationClinique(phases, null, profiles, qualites, raisonnement);
  assert.strictEqual(r.priorite1.niveauPriorite, 'Forte');
});

test("palier Modérée : un seul moteur convergent (profil déficient, qualité normale)", () => {
  const phases = fakePhases({ landing: { score: 20, label: 'Déficitaire', vars: ['v1'] } });
  const profiles = fakeProfileResults({ Contrôle: 15 });
  const qualites = { Absorption: 70 };
  const raisonnement = fakeRaisonnement([], null);
  const r = computePriorisationClinique(phases, null, profiles, qualites, raisonnement);
  assert.strictEqual(r.priorite1.niveauPriorite, 'Modérée');
});

test('classement multi-candidats : Très forte devant Modérée, ordre priorite1/priorite2 respecté', () => {
  const phases = fakePhases({
    braking: { score: 25, label: 'Déficitaire', vars: ['var1', 'var2'] },
    landing: { score: 20, label: 'Déficitaire', vars: ['v1'] }
  });
  const profiles = fakeProfileResults({ Absorbeur: 15, Contrôle: 15 });
  const qualites = { Force: 15, Absorption: 70 };
  const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cas: 1 }], 'Très forte cohérence');
  const r = computePriorisationClinique(phases, null, profiles, qualites, raisonnement);
  assert.strictEqual(r.priorite1.phase, 'braking');
  assert.strictEqual(r.priorite1.niveauPriorite, 'Très forte');
  assert.strictEqual(r.priorite2.phase, 'landing');
  assert.strictEqual(r.priorite2.niveauPriorite, 'Modérée');
  assert.strictEqual(r.priorite3, null);
});

test('aucune phase sous les normes : aucune priorité, aucune observation', () => {
  const phases = fakePhases({});
  const r = computePriorisationClinique(phases, null, [], {}, fakeRaisonnement([], null));
  assert.strictEqual(r.priorite1, null);
  assert.strictEqual(r.autresObservations.length, 0);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

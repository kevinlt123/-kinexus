// Tests unitaires — Moteur de Confiance (indice de confiance par conclusion).
//
// Décision du praticien (04/08) : chaque conclusion Kinexus doit être accompagnée d'un indice de
// confiance qui ne dépend jamais d'une seule variable, mais du niveau de convergence entre les
// différents moteurs (variables concordantes, cohérence interne du profil, cohérence interne de
// la phase, cohérence entre profils et phases, qualité des données, cohérence avec les qualités
// physiques). Ce fichier vérifie uniquement computeConfianceKinexus() — les moteurs sous-jacents
// (Moteur Biomécanique, Profils Biomécaniques, Moteur de Raisonnement, Étape 7 qualités) ont
// leurs propres tests.
//
// Exécution : node tests/moteurConfiance.test.js — aucune dépendance externe.
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

// Phase fictive minimale mais réaliste : seuls les champs lus par le Moteur de Confiance sont
// fournis (sufficient/score/entries pour variableConcordance, coherenceBand, masterAvailable/Total).
function fakePhaseResult(cfg) {
  return {
    phase: cfg.phase, sufficient: true, score: cfg.score,
    entries: cfg.entries || [],
    coherenceBand: cfg.coherenceLabel ? { label: cfg.coherenceLabel } : null,
    masterAvailable: cfg.masterAvailable != null ? cfg.masterAvailable : 4,
    masterTotal: cfg.masterTotal != null ? cfg.masterTotal : 4
  };
}
function fakePhases(cfg) {
  const out = {};
  CMJ_PHASES.forEach(p => { out[p] = cfg[p] ? fakePhaseResult(Object.assign({ phase: p }, cfg[p])) : { phase: p, sufficient: false }; });
  return out;
}
function fakeProfileResults(defs) {
  // defs: { NomProfil: { percentileGlobal, coherenceLabel } }
  return Object.keys(defs).map(nom => ({
    id: nom.toLowerCase(), nom,
    result: {
      sufficient: true, percentileGlobal: defs[nom].percentileGlobal,
      coherenceBand: defs[nom].coherenceLabel ? { label: defs[nom].coherenceLabel } : null
    }
  }));
}
function fakeRaisonnement(croisements) {
  return {
    croisements: croisements.map(c => ({
      profil: c.profil, type: c.type || 'phase', cible: c.cible, sufficient: c.sufficient !== false,
      concordance: { cas: c.cas, reason: 'concordance test cas ' + c.cas }
    }))
  };
}

console.log('Moteur de Confiance');

test('les 6 facteurs demandés par le praticien sont bien tous présents dans niveaux', () => {
  const phases = fakePhases({ braking: { score: 20, entries: [], coherenceLabel: 'Bonne cohérence' } });
  const r = computeConfianceKinexus('braking', phases, [], {}, fakeRaisonnement([]));
  ['variables', 'profilInterne', 'phaseInterne', 'profilPhase', 'donnees', 'qualite'].forEach(k => {
    assert.ok(k in r.niveaux, 'facteur manquant: ' + k);
  });
});

test('tous les signaux convergents (rouge/faible partout) -> confiance Très élevée', () => {
  const phases = fakePhases({
    braking: {
      score: 15, coherenceLabel: 'Très forte cohérence', masterAvailable: 4, masterTotal: 4,
      entries: [
        { tier: 'master', status: 'ok', percentile: 10 },
        { tier: 'master', status: 'ok', percentile: 15 },
        { tier: 'master', status: 'ok', percentile: 20 },
        { tier: 'master', status: 'ok', percentile: 12 }
      ]
    }
  });
  const profiles = fakeProfileResults({ Absorbeur: { percentileGlobal: 15, coherenceLabel: 'Très forte cohérence' } });
  const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cible: 'braking', cas: 1 }]);
  const coherenceQualitesInput = { Absorption: { status: 'rouge' } };
  const r = computeConfianceKinexus('braking', phases, profiles, coherenceQualitesInput, raisonnement);
  assert.strictEqual(r.signauxDisponibles, 6, 'les 6 facteurs doivent être exploitables ici');
  assert.strictEqual(r.band.label, 'Très élevée');
});

test('aucune dépendance disponible (profils/raisonnement/qualités absents) -> facteurs correspondants exclus, jamais inventés', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Cohérence moyenne', entries: [] } });
  const r = computeConfianceKinexus('braking', phases, [], {}, null);
  assert.strictEqual(r.niveaux.profilInterne.score, null);
  assert.strictEqual(r.niveaux.profilPhase.score, null);
  assert.strictEqual(r.niveaux.qualite.score, null);
  // phaseInterne (cohérence interne de phase) et donnees restent évaluables sans ces dépendances.
  assert.notStrictEqual(r.niveaux.phaseInterne.score, null);
  assert.notStrictEqual(r.niveaux.donnees.score, null);
});

test('phase insuffisante -> composite et band null, jamais une valeur inventée', () => {
  const phases = fakePhases({});
  const r = computeConfianceKinexus('braking', phases, [], {}, null);
  assert.strictEqual(r.composite, null);
  assert.strictEqual(r.band, null);
  assert.strictEqual(r.signauxDisponibles, 0);
});

test('facteur "données" reprend fidèlement masterAvailable/masterTotal de la phase (aucun nouveau ratio)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', masterAvailable: 2, masterTotal: 4, entries: [] } });
  const r = computeConfianceKinexus('braking', phases, [], {}, null);
  assert.strictEqual(r.niveaux.donnees.score, 50);
});

test('facteur "profil<->phase" traduit fidèlement les Cas 1/2/3 de validateClinicalConcordance (100/50/0)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', entries: [] } });
  [[1, 100], [2, 50], [3, 0]].forEach(([cas, score]) => {
    const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cible: 'braking', cas }]);
    const r = computeConfianceKinexus('braking', phases, [], {}, raisonnement);
    assert.strictEqual(r.niveaux.profilPhase.score, score, 'cas ' + cas + ' -> score attendu ' + score);
  });
});

test('phase sans correspondance profil définie (ex. Unloading/Flight) : facteurs profil dégradent proprement, sans inventer de mapping', () => {
  const phases = fakePhases({ unloading: { score: 40, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const r = computeConfianceKinexus('unloading', phases, fakeProfileResults({ Absorbeur: { percentileGlobal: 50 } }), {}, fakeRaisonnement([{ profil: 'Absorbeur', cible: 'braking', cas: 1 }]));
  assert.strictEqual(r.niveaux.profilPhase.score, null);
  assert.strictEqual(r.niveaux.profilInterne.score, null);
});

test('bande confianceKinexus utilise les libellés exacts demandés (Très élevée/Élevée/Modérée/Faible/Très faible)', () => {
  const labels = effectiveBiomecaBands('confianceKinexus').map(b => b.label);
  assert.deepStrictEqual(labels, ['Très élevée', 'Élevée', 'Modérée', 'Faible', 'Très faible']);
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

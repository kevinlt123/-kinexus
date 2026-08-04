// Tests unitaires — Moteur de Raisonnement Biomécanique (croisement Profils <-> Phases).
//
// Décision d'architecture du praticien (04/08) : ne plus analyser indépendamment les profils
// biomécaniques et les phases biomécaniques — croiser automatiquement les deux pour détecter la
// cohérence (ou l'incohérence) entre les deux analyses. Ce fichier vérifie uniquement la couche
// de croisement/raisonnement ; les analyses sous-jacentes ont leurs propres tests
// (biomechanicalProfileEngine.test.js pour les profils).
//
// Exécution : node tests/moteurRaisonnementBiomecanique.test.js — aucune dépendance externe.
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
// Phases/coherence fictives : seuls les champs lus par croisementProfilPhase/computeMoteurRaison
// nementBiomecanique sont fournis (score/sufficient pour les phases, sens/sufficient pour les
// transitions, priorites.principale/variablesResponsables pour la synthèse).
function fakePhases(scoresByPhase) {
  const out = {};
  CMJ_PHASES.forEach(p => {
    out[p] = scoresByPhase[p] != null
      ? { phase: p, sufficient: true, score: scoresByPhase[p], variablesResponsables: [] }
      : { phase: p, sufficient: false };
  });
  return out;
}
function fakeCoherence(transitionSensByKey) {
  return {
    transitions: CMJ_TRANSITIONS.map(t => ({
      key: t.key, from: t.from, to: t.to,
      sufficient: transitionSensByKey[t.key] != null,
      sens: transitionSensByKey[t.key]
    }))
  };
}
function fakeSyntheseBiomecanique(principalPhaseKey) {
  return { priorites: { principale: principalPhaseKey ? [{ phase: principalPhaseKey }] : [] } };
}

console.log('Moteur de Raisonnement Biomécanique');

test('cohérence : Absorbeur faible + Braking faible -> convergent (Cas 1)', () => {
  const profiles = fakeProfileResults({ Absorbeur: 15 });
  const phases = fakePhases({ braking: 10 });
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const c = r.croisements.find(x => x.profil === 'Absorbeur');
  assert.strictEqual(c.sufficient, true);
  assert.strictEqual(c.concordance.cas, 1);
  assert.ok(c.concordance.reason.includes('convergent'));
});

test('cohérence : Propulsif élevé + Concentric élevée -> convergent (Cas 1)', () => {
  const profiles = fakeProfileResults({ Propulsif: 90 });
  const phases = fakePhases({ concentric: 88 });
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const c = r.croisements.find(x => x.profil === 'Propulsif');
  assert.strictEqual(c.concordance.cas, 1);
});

test('cohérence : Réactif élevé + transition Braking->Concentric performante -> convergent (Cas 1)', () => {
  const profiles = fakeProfileResults({ Réactif: 85 });
  const phases = fakePhases({});
  const coherence = fakeCoherence({ braking_concentric: 'similaire' });
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const c = r.croisements.find(x => x.profil === 'Réactif');
  assert.strictEqual(c.type, 'transition');
  assert.strictEqual(c.cibleOrdinal, 'eleve');
  assert.strictEqual(c.concordance.cas, 1);
});

test('cohérence : Contrôle faible + Landing faible -> convergent (Cas 1)', () => {
  const profiles = fakeProfileResults({ Contrôle: 20 });
  const phases = fakePhases({ landing: 18 });
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const c = r.croisements.find(x => x.profil === 'Contrôle');
  assert.strictEqual(c.concordance.cas, 1);
});

test("incohérence : Propulsif TRÈS élevé + Concentric faible -> discordance détectée et signalée", () => {
  const profiles = fakeProfileResults({ Propulsif: 97 });
  const phases = fakePhases({ concentric: 12 });
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique('concentric');
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const c = r.croisements.find(x => x.profil === 'Propulsif');
  assert.strictEqual(c.concordance.cas, 3);
  assert.strictEqual(r.incoherences.length, 1);
  assert.strictEqual(r.incoherences[0].profil, 'Propulsif');
  assert.ok(r.syntheseFinale.incoherencesDetectees[0].includes('Propulsif'));
});

test('référentiel figé (04/08) : Explosif référence Concentric + transition Braking->Concentric, comme Propulsif', () => {
  const explosif = PROFIL_PHASE_CORRESPONDENCE.find(c => c.profil === 'Explosif');
  assert.ok(explosif, 'Explosif doit maintenant avoir une correspondance (référentiel complété par le praticien)');
  assert.deepStrictEqual(explosif.phases, ['concentric']);
  assert.deepStrictEqual(explosif.transitions, ['braking_concentric']);
});

test('collection : Propulsif ET Explosif référencent tous deux concentric -> 2 croisements exploitables, aucun écrasé', () => {
  const profiles = fakeProfileResults({ Propulsif: 90, Explosif: 85 });
  const phases = fakePhases({ concentric: 88 });
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const concentriques = r.croisements.filter(c => c.type === 'phase' && c.cible === 'concentric');
  assert.strictEqual(concentriques.length, 2, 'Propulsif et Explosif doivent produire chacun leur propre croisement');
  assert.deepStrictEqual(concentriques.map(c => c.profil).sort(), ['Explosif', 'Propulsif']);
});

test('indice de cohérence globale : 100% de convergence -> Très forte cohérence', () => {
  const profiles = fakeProfileResults({ Absorbeur: 20, Propulsif: 85, Contrôle: 22 });
  const phases = fakePhases({ braking: 18, concentric: 87, landing: 20 });
  const coherence = fakeCoherence({ braking_concentric: 'similaire' });
  // Réactif absent -> croisement insuffisant, exclu du calcul plutôt que faussé.
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const exploitables = r.croisements.filter(c => c.sufficient);
  assert.ok(exploitables.every(c => c.concordance.cas === 1));
  assert.strictEqual(r.indiceCoherenceGlobale.band.label, 'Très forte cohérence');
});

test('indice de cohérence globale : croisements insuffisants exclus, jamais une valeur inventée', () => {
  const profiles = fakeProfileResults({}); // aucun profil calculable
  const phases = fakePhases({});
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique(null);
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  assert.strictEqual(r.croisements.every(c => !c.sufficient), true);
  assert.strictEqual(r.indiceCoherenceGlobale.score, null);
  assert.strictEqual(r.indiceCoherenceGlobale.band, null);
});

test('synthèse finale : les 5 points imposés sont tous présents', () => {
  const profiles = fakeProfileResults({ Propulsif: 97 });
  const phases = fakePhases({ concentric: 12 });
  const coherence = fakeCoherence({});
  const synthese = fakeSyntheseBiomecanique('concentric');
  const r = computeMoteurRaisonnementBiomecanique(profiles, phases, coherence, synthese);
  const sf = r.syntheseFinale;
  ['strategieDominante', 'phaseLimitantePrioritaire', 'variablesResponsables', 'coherenceBiomecanique', 'axesDeTravail'].forEach(k => {
    assert.ok(k in sf, 'champ manquant: ' + k);
  });
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

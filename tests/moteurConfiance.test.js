// Tests unitaires — Moteur de Confiance (couche transversale, 04/08).
//
// Décision d'architecture du praticien : Confiance / Explication / Alerte forment UNE seule
// architecture, entièrement générique et data-driven — aucune règle métier codée en dur dans les
// fonctions "moteur". Ce fichier vérifie deux niveaux :
//  1. computeIndiceConfiance() : la primitive générique (ne connaît ni phase, ni profil, ni
//     qualité — seulement une liste de signaux {cle,score,poidsDefaut}).
//  2. computeConfianceKinexus() : l'adaptateur de domaine qui construit ces signaux pour une
//     phase via le référentiel CONFIANCE_SIGNAUX_PHASE, sans dupliquer le calcul de l'agrégat.
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
function signal(cle, score, poidsDefaut) { return { cle, score, poidsDefaut: poidsDefaut != null ? poidsDefaut : 1 }; }

console.log('Moteur de Confiance');

// ── 1. Primitive générique computeIndiceConfiance() ─────────────────────────────────────────
test('primitive générique : fonctionne avec des clés de signaux totalement arbitraires (aucune connaissance de domaine)', () => {
  const r = computeIndiceConfiance([signal('foo', 80), signal('bar', 40), signal('baz', null)]);
  assert.strictEqual(r.total, 3);
  assert.strictEqual(r.exclus.length, 1);
  assert.strictEqual(r.exclus[0].cle, 'baz');
  assert.strictEqual(r.signaux.length, 2);
  assert.strictEqual(r.composite, 60); // moyenne simple (80+40)/2, poids par défaut égaux
});

test('primitive générique : aucun signal disponible -> composite/band null, jamais une valeur inventée', () => {
  const r = computeIndiceConfiance([signal('foo', null), signal('bar', null)]);
  assert.strictEqual(r.composite, null);
  assert.strictEqual(r.band, null);
  assert.strictEqual(r.exclus.length, 2);
});

test('primitive générique : les poids sont respectés et les contributions (contributionPct) somment à 100', () => {
  const r = computeIndiceConfiance([signal('a', 100, 3), signal('b', 0, 1)]);
  assert.strictEqual(r.composite, 75); // (100*3 + 0*1) / 4
  const sumPct = r.signaux.reduce((s, x) => s + x.contributionPct, 0);
  assert.ok(Math.abs(sumPct - 100) < 0.2, 'les contributions doivent sommer à ~100%');
});

test('primitive générique : poidsOverride prime sur poidsDefaut (config-driven, pas figé dans le moteur)', () => {
  const r = computeIndiceConfiance([signal('a', 100, 1), signal('b', 0, 1)], { a: 9, b: 1 });
  assert.ok(r.composite > 85, 'le poids personnalisé doit faire dominer le signal "a"');
});

// ── 2. Adaptateur de domaine computeConfianceKinexus() (phase CMJ) ──────────────────────────
test('les 6 facteurs du référentiel CONFIANCE_SIGNAUX_PHASE sont bien représentés (disponibles + exclus = 6)', () => {
  const phases = fakePhases({ braking: { score: 20, entries: [], coherenceLabel: 'Bonne cohérence' } });
  const r = computeConfianceKinexus('braking', phases, [], {}, fakeRaisonnement([]));
  assert.strictEqual(r.total, 6);
  assert.strictEqual(r.signaux.length + r.exclus.length, 6);
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
  const functionScores = { Absorption: { status: 'rouge' } };
  const r = computeConfianceKinexus('braking', phases, profiles, functionScores, raisonnement);
  assert.strictEqual(r.signaux.length, 6, 'les 6 facteurs doivent être exploitables ici');
  assert.strictEqual(r.band.label, 'Très élevée');
});

test('dépendances absentes (profils/raisonnement/qualités non fournis) -> signaux correspondants exclus, jamais inventés', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Cohérence moyenne', entries: [] } });
  const r = computeConfianceKinexus('braking', phases, [], {}, null);
  const exclusCles = r.exclus.map(e => e.cle);
  assert.ok(exclusCles.includes('profilInterne'));
  assert.ok(exclusCles.includes('profilPhase'));
  assert.ok(exclusCles.includes('qualite'));
  const dispoCles = r.signaux.map(s => s.cle);
  assert.ok(dispoCles.includes('phaseInterne'));
  assert.ok(dispoCles.includes('donnees'));
});

test('phase insuffisante -> composite et band null, jamais une valeur inventée', () => {
  const phases = fakePhases({});
  const r = computeConfianceKinexus('braking', phases, [], {}, null);
  assert.strictEqual(r.composite, null);
  assert.strictEqual(r.band, null);
  assert.strictEqual(r.exclus.length, 6);
});

test('facteur "données" reprend fidèlement masterAvailable/masterTotal de la phase (aucun nouveau ratio)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', masterAvailable: 2, masterTotal: 4, entries: [] } });
  const r = computeConfianceKinexus('braking', phases, [], {}, null);
  const donnees = r.signaux.find(s => s.cle === 'donnees');
  assert.strictEqual(donnees.score, 50);
});

test('facteur "profil<->phase" traduit fidèlement les Cas 1/2/3 de validateClinicalConcordance (100/50/0)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', entries: [] } });
  [[1, 100], [2, 50], [3, 0]].forEach(([cas, score]) => {
    const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cible: 'braking', cas }]);
    const r = computeConfianceKinexus('braking', phases, [], {}, raisonnement);
    const profilPhase = r.signaux.find(s => s.cle === 'profilPhase');
    assert.strictEqual(profilPhase.score, score, 'cas ' + cas + ' -> score attendu ' + score);
  });
});

test('phase sans correspondance profil définie (ex. Unloading/Flight) : signaux profil exclus, sans inventer de mapping', () => {
  const phases = fakePhases({ unloading: { score: 40, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const raisonnement = fakeRaisonnement([{ profil: 'Absorbeur', cible: 'braking', cas: 1 }]);
  const r = computeConfianceKinexus('unloading', phases, fakeProfileResults({ Absorbeur: { percentileGlobal: 50 } }), {}, raisonnement);
  const exclusCles = r.exclus.map(e => e.cle);
  assert.ok(exclusCles.includes('profilPhase'));
  assert.ok(exclusCles.includes('profilInterne'));
});

test('bande confianceKinexus utilise les libellés exacts demandés (Très élevée/Élevée/Modérée/Faible/Très faible)', () => {
  const labels = effectiveBiomecaBands('confianceKinexus').map(b => b.label);
  assert.deepStrictEqual(labels, ['Très élevée', 'Élevée', 'Modérée', 'Faible', 'Très faible']);
});

test('ajouter un signal au référentiel CONFIANCE_SIGNAUX_PHASE le fait apparaître automatiquement dans les poids (data-driven, rien à recopier)', () => {
  const before = CONFIANCE_SIGNAUX_PHASE.length;
  CONFIANCE_SIGNAUX_PHASE.push({ cle: 'test_temporaire', poidsDefaut: 2, extractor: () => 42 });
  try {
    const w = effectiveConfianceKinexusWeights();
    assert.strictEqual(w.test_temporaire, 2);
  } finally {
    CONFIANCE_SIGNAUX_PHASE.length = before; // nettoyage : ne pas polluer les autres tests
  }
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

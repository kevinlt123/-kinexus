// Tests unitaires — Moteur d'Explication (traçabilité complète de chaque conclusion).
//
// Décision du praticien (04/08) : toutes les conclusions Kinexus doivent être explicables —
// jamais de boîte noire. Pour chaque conclusion, 7 éléments sont exigés : règles appliquées,
// variables utilisées, percentiles concernés, seuils franchis, profils impliqués, phases
// impliquées, niveau de confiance. Ce fichier vérifie que explicationConclusionPhase() est un
// pur composeur qui rassemble fidèlement ce que les autres moteurs ont déjà calculé, sans jamais
// recalculer ni inventer une information — les moteurs sous-jacents ont leurs propres tests.
//
// Exécution : node tests/moteurExplication.test.js — aucune dépendance externe.
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

// Phase fictive réaliste : niveau/deltaBand/coherenceBand fournis directement (bandes déjà
// testées dans le moteur biomécanique de phase), entries avec percentiles réels pour vérifier la
// fidélité de la restitution variables/percentiles.
function fakePhaseResult(cfg) {
  return {
    phase: cfg.phase, sufficient: true, score: cfg.score,
    entries: cfg.entries || [],
    niveau: cfg.niveauLabel ? { label: cfg.niveauLabel } : null,
    deltaBand: cfg.deltaLabel ? { label: cfg.deltaLabel } : null,
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
    result: { sufficient: true, percentileGlobal: defs[nom].percentileGlobal, coherenceBand: null }
  }));
}

console.log('Moteur d\'Explication');

test('phase insuffisante -> explicable:false, aucune conclusion inventée', () => {
  const phases = fakePhases({});
  const r = explicationConclusionPhase('braking', phases, [], {}, null, null);
  assert.strictEqual(r.explicable, false);
  assert.ok(r.raison.length > 0);
});

test('les 7 éléments exigés par le praticien sont tous présents pour une conclusion explicable', () => {
  const phases = fakePhases({
    braking: {
      score: 20, niveauLabel: 'Déficitaire', deltaLabel: 'Écart majeur', coherenceLabel: 'Bonne cohérence',
      entries: [{ tier: 'master', status: 'ok', percentile: 18, kpiKey: 'brk_x', valdName: 'Braking X' }]
    }
  });
  const r = explicationConclusionPhase('braking', phases, [], {}, null, null);
  assert.strictEqual(r.explicable, true);
  ['reglesAppliquees', 'variablesUtilisees', 'percentilesConcernes', 'seuilsFranchis', 'profilsImpliques', 'phasesImpliquees', 'niveauConfiance'].forEach(k => {
    assert.ok(k in r, 'élément manquant: ' + k);
  });
});

test('variables utilisées + percentiles concernés reflètent fidèlement les entries de la phase (aucune valeur inventée)', () => {
  const phases = fakePhases({
    braking: {
      score: 20, coherenceLabel: 'Bonne cohérence',
      entries: [
        { tier: 'master', status: 'ok', percentile: 18, kpiKey: 'brk_x', valdName: 'Braking X' },
        { tier: 'master', status: 'technical_error', percentile: null, kpiKey: 'brk_y', valdName: 'Braking Y' }
      ]
    }
  });
  const r = explicationConclusionPhase('braking', phases, [], {}, null, null);
  assert.strictEqual(r.variablesUtilisees.length, 1, 'seules les variables status===ok doivent apparaître');
  assert.strictEqual(r.variablesUtilisees[0].kpi, 'Braking X');
  assert.strictEqual(r.variablesUtilisees[0].percentile, 18);
  assert.strictEqual(r.percentilesConcernes[0].percentile, 18);
});

test('seuils franchis reprend fidèlement niveau/deltaBand/coherenceBand de la phase, jamais recalculés', () => {
  const phases = fakePhases({ braking: { score: 20, niveauLabel: 'Déficitaire', deltaLabel: 'Écart majeur', coherenceLabel: 'Bonne cohérence', entries: [] } });
  const r = explicationConclusionPhase('braking', phases, [], {}, null, null);
  const labels = r.seuilsFranchis.map(s => s.label);
  assert.ok(labels.includes('Déficitaire'));
  assert.ok(labels.includes('Écart majeur'));
  assert.ok(labels.includes('Bonne cohérence'));
});

test('profils impliqués : réutilise la correspondance profil<->phase existante (Braking -> Absorbeur)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const profiles = fakeProfileResults({ Absorbeur: { percentileGlobal: 15 } });
  const r = explicationConclusionPhase('braking', phases, profiles, {}, null, null);
  assert.strictEqual(r.profilsImpliques.length, 1);
  assert.strictEqual(r.profilsImpliques[0].nom, 'Absorbeur');
  assert.strictEqual(r.profilsImpliques[0].percentileGlobal, 15);
});

test('aucune correspondance profil définie (Unloading) : profils impliqués reste vide, jamais un mapping inventé', () => {
  const phases = fakePhases({ unloading: { score: 40, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const r = explicationConclusionPhase('unloading', phases, fakeProfileResults({ Absorbeur: { percentileGlobal: 15 } }), {}, null, null);
  assert.strictEqual(r.profilsImpliques.length, 0);
});

test('phases impliquées inclut la phase elle-même + les transitions adjacentes déjà définies (CMJ_TRANSITIONS)', () => {
  const phases = fakePhases({ concentric: { score: 40, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const r = explicationConclusionPhase('concentric', phases, [], {}, null, null);
  assert.ok(r.phasesImpliquees.includes('concentric'));
  const attendues = CMJ_TRANSITIONS.filter(t => t.from === 'concentric' || t.to === 'concentric').map(t => t.key);
  attendues.forEach(k => assert.ok(r.phasesImpliquees.includes(k), 'transition manquante: ' + k));
});

test('niveau de confiance réutilise intégralement computeConfianceKinexus (même objet structurel)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const r = explicationConclusionPhase('braking', phases, [], {}, null, null);
  const direct = computeConfianceKinexus('braking', phases, [], {}, null);
  assert.deepStrictEqual(r.niveauConfiance, direct);
});

test('règle de priorisation incluse quand dossierPreuves est fourni, absente sinon (jamais inventée)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const withDossier = explicationConclusionPhase('braking', phases, [], {}, null, { niveauPriorite: 'Très forte', countMoteurs: 2, coherenceForte: true, variablesResponsables: ['a', 'b'] });
  assert.strictEqual(withDossier.reglesAppliquees.priorisation.niveauPriorite, 'Très forte');
  assert.strictEqual(withDossier.reglesAppliquees.priorisation.variablesResponsablesCount, 2);

  const withoutDossier = explicationConclusionPhase('braking', phases, [], {}, null, null);
  assert.strictEqual(withoutDossier.reglesAppliquees.priorisation, null);
});

test('règles appliquées inclut l\'arbre de preuve complet du Specification Pattern (gate facteur limitant)', () => {
  const phases = fakePhases({ braking: { score: 20, coherenceLabel: 'Bonne cohérence', entries: [] } });
  const r = explicationConclusionPhase('braking', phases, [], {}, null, null);
  assert.ok('result' in r.reglesAppliquees.gateFacteurLimitant, 'doit exposer le résultat du gate');
  assert.ok('children' in r.reglesAppliquees.gateFacteurLimitant, 'doit exposer l\'arbre de preuve (Specification Pattern .and())');
});

console.log('');
console.log(passed + ' réussi(s), ' + failed + ' échoué(s)');
if (failed > 0) process.exit(1);

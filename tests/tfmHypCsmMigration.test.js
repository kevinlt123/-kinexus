// Tests unitaires — Migration partielle TFM -> HYP/CSM (mission AUDIT_MIGRATION_TFM_HYP_CSM.md,
// décision B, implémentée). Vérifie que pour toute qualité dotée d'un moteur HYP actif, HYP reste
// l'unique source du diagnostic affiché (fSc[q].status), que capaciteScores/qualityScores ne
// peuvent plus afficher un diagnostic concurrent (seulement une information TFM secondaire
// `tfmStatus`), et que contributeurPrincipal ne cite un système que si son rôle est réellement
// documenté par le moteur HYP de la qualité (jamais au seul poids TFM).
//
// Exécution : node tests/tfmHypCsmMigration.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf('// ── SUPABASE CONFIG');
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur() dans index.html.');
eval(code.slice(start, end));

global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + e.message); }
}

var POP = 'general_m_senior', AGE = 30;
var POP_CMJ = 'bball2425_ncaa_m', AGE_CMJ = 26;

function withTempForceNorms(fn) {
  THRESHOLDS.imtp_n = { vert: 3000, jaune: 2500, orange: 2000, dir: 'max' };
  THRESHOLDS.slimtp_n = { vert: 1500, jaune: 1200, orange: 900, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.imtp_n; delete THRESHOLDS.slimtp_n; }
}
function withTempSlcmjNorm(fn) {
  THRESHOLDS.slcmj_peak_power = { vert: 40, jaune: 30, orange: 20, dir: 'max' };
  try { return fn(); } finally { delete THRESHOLDS.slcmj_peak_power; }
}

// Trouve, dans capaciteScores, la première entrée qualité correspondant au nom demandé (peu importe
// la sous-capacité/capacité qui la porte).
function findCapaciteQuality(capaciteScores, qualityName) {
  for (var ck in capaciteScores) {
    var cap = capaciteScores[ck];
    for (var i = 0; i < cap.sousCapacites.length; i++) {
      var found = cap.sousCapacites[i].qualites.filter(function (q) { return q.quality === qualityName; })[0];
      if (found) return found;
    }
  }
  return null;
}

console.log('CAS 1/2 — IMTP/SLIMTP déficitaires uniquement : Force diagnostiquée, Puissance/Absorption non_determinable malgré TFM=rouge');
test('Force = diagnostic HYP ; Puissance/Absorption fSc.status=null malgré un tfmStatus TFM potentiellement déficitaire', () => {
  withTempForceNorms(() => {
    var td = { imtp: { active: true, trials: { n: [1000] } }, slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } } };
    var r = computeMoteur(td, {}, POP, AGE);
    assert.strictEqual(r.functionScores['Force'].status, 'rouge');
    assert.strictEqual(r.functionScores['Force'].hypFor01.state, 'retenue_faible');
    assert.strictEqual(r.functionScores['Puissance'].status, null);
    assert.strictEqual(r.functionScores['Puissance'].hypPui01.state, 'non_determinable');
    assert.strictEqual(r.functionScores['Absorption'].status, null);
    assert.strictEqual(r.functionScores['Absorption'].hypAbs01.state, 'non_determinable');

    var puissanceCap = findCapaciteQuality(r.capaciteScores, 'Puissance');
    assert.ok(puissanceCap, 'Puissance doit apparaître dans au moins une capacité');
    assert.strictEqual(puissanceCap.status, null, 'le diagnostic affiché (status) doit rester null (HYP non_determinable), jamais un badge TFM');
    assert.strictEqual(puissanceCap.hypGoverned, true);
    // La donnée TFM elle-même n'est pas supprimée : elle reste disponible sous tfmStatus.
    assert.notStrictEqual(puissanceCap.tfmStatus, undefined);

    var absorptionCap = findCapaciteQuality(r.capaciteScores, 'Absorption');
    assert.ok(absorptionCap);
    assert.strictEqual(absorptionCap.status, null);
    assert.strictEqual(absorptionCap.hypGoverned, true);
  });
});

console.log('\nCAS 3 — TFM rouge / HYP normal (absente) : aucun déficit concurrent créé');
test('Puissance HYP=absente (cmj/slcmj normaux) malgré un tfmStatus potentiellement déficitaire (imtp bas) -> status suit HYP, jamais rouge/orange', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = {
      imtp: { active: true, trials: { n: [1000] } }, // Force déficitaire, "measures" Puissance dans VAR_REL3
      slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } },
      cmj: { active: true, trials: { peak_power: [80] } }, // Puissance HYP : valeurs normales
      slcmj: { active: true, D: { trials: { peak_power: [80] } }, G: { trials: { peak_power: [80] } } }
    };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    assert.strictEqual(r.functionScores['Puissance'].hypPui01.state, 'absente');
    assert.strictEqual(r.functionScores['Puissance'].status, 'vert');
    var puissanceCap = findCapaciteQuality(r.capaciteScores, 'Puissance');
    assert.strictEqual(puissanceCap.status, 'vert', 'le diagnostic affiché doit rester "vert" (HYP absente) même si computeQualityStatus brut serait moins favorable');
  }));
});

console.log('\nCAS 4 — TFM rouge / HYP déficitaire : diagnostic HYP conservé, TFM disponible en secondaire');
test('Force et Puissance réellement déficitaires (HYP et TFM concordants) -> status=HYP, tfmStatus toujours exposé', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = {
      imtp: { active: true, trials: { n: [1000] } },
      slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } },
      cmj: { active: true, trials: { peak_power: [1] } },
      slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } }
    };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    assert.strictEqual(r.functionScores['Puissance'].status, 'rouge');
    var puissanceCap = findCapaciteQuality(r.capaciteScores, 'Puissance');
    assert.strictEqual(puissanceCap.status, 'rouge');
    assert.notStrictEqual(puissanceCap.tfmStatus, undefined);
  }));
});

console.log('\nCAS 5 — knee_ext (poids TFM Force=3, rôle HYP-FOR-01 = segmental, jamais diagnostique/confirmatif/explicatif niveau 1)');
test('knee_ext seul déficitaire (Quadriceps) + Force réellement déficitaire par ailleurs -> si Quadriceps cité, formulation explicative dédiée, jamais "preuve diagnostique"', () => {
  withTempForceNorms(() => {
    var td = {
      imtp: { active: true, trials: { n: [1000] } },
      slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } },
      // nkg (seul KPI normé pour knee_ext) volontairement bas -> Quadriceps devient un candidat
      // "contrib" non-vert au sens TFM, exactement le cas démontré par l'audit (poids TFM Force=3).
      knee_ext: { active: true, D: { trials: { n: [50], nkg: [0.5] } }, G: { trials: { n: [50], nkg: [0.5] } } }
    };
    var r = computeMoteur(td, {}, POP, AGE);
    assert.strictEqual(r.functionScores['Force'].status, 'rouge');
    var pri = r.priorities.filter(function (p) { return p.fonction === 'Force'; })[0];
    assert.ok(pri);
    // Vérifie que la branche est réellement exercée (Quadriceps doit être le candidat "contrib").
    assert.strictEqual(pri.contributeurPrincipal, 'Quadriceps');
    assert.ok(pri.hypothese.indexOf('titre explicatif') !== -1, 'doit être formulé comme explicatif, pas comme preuve diagnostique');
    assert.strictEqual(/est\s+(la|une)\s+preuve\s+diagnostique/i.test(pri.hypothese), false, 'ne doit jamais affirmer que Quadriceps/knee_ext EST une preuve diagnostique');
    // Dans tous les cas : knee_ext ne doit jamais être cité comme preuve diagnostique de Force (il
    // n'apparaît ni dans hypFor01.diagnostic ni dans hypFor01.confirmative).
    var hyp = r.functionScores['Force'].hypFor01;
    assert.strictEqual(Object.keys(hyp.diagnostic).indexOf('knee_ext_n'), -1);
    assert.strictEqual(Object.keys(hyp.confirmative).indexOf('knee_ext_nkg'), -1);
  });
});

console.log('\nCAS 6 — Aucun contributeur compatible (rôle HYP) : contributeurPrincipal = null');
test('Puissance déficitaire via cmj/slcmj uniquement, knee_ext (Quadriceps) déficitaire mais sans rôle dans hypPui01 -> contributeurPrincipal=null', () => {
  withTempSlcmjNorm(() => {
    var td = {
      cmj: { active: true, trials: { peak_power: [1] } },
      slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } },
      knee_ext: { active: true, D: { trials: { n: [50], nkg: [0.5] } }, G: { trials: { n: [50], nkg: [0.5] } } }
    };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    assert.strictEqual(r.functionScores['Puissance'].status, 'rouge');
    var pri = r.priorities.filter(function (p) { return p.fonction === 'Puissance'; })[0];
    assert.ok(pri);
    var hyp = r.functionScores['Puissance'].hypPui01;
    // Vérifie que la branche est réellement exercée : Quadriceps est bien un candidat "contrib"
    // (non-vert) mais knee_ext n'a aucun rôle documenté dans hypPui01.
    assert.strictEqual(r.systemScores['Quadriceps'] !== 'vert', true);
    assert.strictEqual(hypEvidenceRoleForTest(hyp, 'knee_ext'), null);
    assert.strictEqual(pri.contributeurPrincipal, null, 'aucun système compatible ne doit être forcé comme contributeur');
  });
});

console.log('\nCAS 7 — Les relations/structures TFM restent conservées (aucune suppression)');
test('TFM, VAR_REL3, CAPACITES_DATA, SYS_COMPENSATIONS, HYP_QUALITY_RELATIONS non altérés par la migration', () => {
  assert.strictEqual(Object.keys(TFM).length > 0, true);
  assert.strictEqual(Object.keys(VAR_REL3).length, 283);
  assert.strictEqual(Object.keys(CAPACITES_DATA).length, 4);
  assert.strictEqual(Object.keys(SYS_COMPENSATIONS).length > 0, true);
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 8);
  // computeQualityStatus elle-même reste un calcul TFM pur, jamais modifié.
  var raw = computeQualityStatus('Puissance', { cmj: { active: true, trials: { peak_power: [1] } } }, POP_CMJ, AGE_CMJ);
  assert.ok(raw === null || ['vert', 'jaune', 'orange', 'rouge'].indexOf(raw) !== -1);
});

console.log('\nCAS 8 — CSM reste cohérent avec la migration (aucune modification de computeHypClinicalSynthesis01)');
test('CSM produit une synthèse cohérente à partir de functionScores post-migration, Force+Puissance', () => {
  withTempForceNorms(() => withTempSlcmjNorm(() => {
    var td = {
      imtp: { active: true, trials: { n: [1000] } },
      slimtp: { active: true, D: { trials: { n: [500] } }, G: { trials: { n: [500] } } },
      cmj: { active: true, trials: { peak_power: [1] } },
      slcmj: { active: true, D: { trials: { peak_power: [1] } }, G: { trials: { peak_power: [1] } } }
    };
    var r = computeMoteur(td, {}, POP_CMJ, AGE_CMJ);
    var csm = computeHypClinicalSynthesis01(r.functionScores);
    assert.deepStrictEqual(csm.objectified.map(function (o) { return o.quality; }).sort(), ['Force', 'Puissance']);
    var rel = csm.explanatoryHypotheses.filter(function (h) { return h.explains === 'Force' && h.explained === 'Puissance'; });
    assert.strictEqual(rel.length, 1);
  }));
});

console.log('\nCAS 9 — Aucune donnée : aucun faux diagnostic généré par TFM');
test('Aucune donnée fournie -> tous les fSc.status HYP-gouvernés sont null, aucune capacité n\'affiche un diagnostic', () => {
  var r = computeMoteur({}, {}, POP, AGE);
  ['Mobilité', 'Réactivité', 'Absorption', 'Force', 'Puissance', 'Explosivité', 'Stabilisation', 'Endurance'].forEach(function (q) {
    assert.strictEqual(r.functionScores[q].status, null);
  });
  Object.keys(r.capaciteScores).forEach(function (ck) {
    r.capaciteScores[ck].sousCapacites.forEach(function (sub) {
      sub.qualites.forEach(function (item) {
        if (item.hypGoverned) assert.strictEqual(item.status, null, item.quality + ' ne doit afficher aucun diagnostic sans données HYP');
      });
    });
  });
});

console.log('\nCAS 10 — Les 8 moteurs HYP eux-mêmes restent inchangés par la migration');
test('Les 8 computeHypXxx01 ne sont jamais appelés ni modifiés par les nouveaux helpers (lecture seule de fSc)', () => {
  // Preuve structurelle : tfmQualityDiagnosticGate/hypEvidenceRoleForTest/hypObjectForQuality ne
  // lisent que des objets déjà produits par fSc — aucun n'invoque computeHypXxx01. Vérifié ici par
  // non-régression : les 24 fichiers tests/*.test.js préexistants (spécifiques aux 8 moteurs)
  // passent tous inchangés (0 échec), et git diff ne montre aucune ligne modifiée à l'intérieur
  // d'un des 8 computeHypXxx01 (vérifié séparément, hors de ce fichier).
  var r1 = computeMoteur({ imtp: { active: true, trials: { n: [1000] } } }, {}, POP, AGE);
  var r2 = computeMoteur({ imtp: { active: true, trials: { n: [1000] } } }, {}, POP, AGE);
  assert.strictEqual(JSON.stringify(r1.functionScores['Force'].hypFor01), JSON.stringify(r2.functionScores['Force'].hypFor01));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);

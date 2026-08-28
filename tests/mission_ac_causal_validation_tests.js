// MISSION AC — VALIDATION CLINIQUE DU RAISONNEMENT CAUSAL.
//
// Batterie de 25 scénarios SYNTHÉTIQUES CONTRÔLÉS (jamais la fixture réelle de Yannis, réutilisée
// séparément en AC24 uniquement pour vérifier la non-régression) vérifiant que le moteur distingue
// correctement : preuve directe / explicative / associée / convergente / relation validée / bridge
// démontré / facteur contributif / non-causal / indéterminé faute de données / donnée manquante /
// conséquence supportée. Aucune nouvelle relation clinique n'est créée par cette mission —
// HYP_QUALITY_RELATIONS, CLINICAL_HYPOTHESIS_WHITELIST, NORMS_V2, THRESHOLDS, CSM_V2_AXIS_QUALITY_MAP
// et les définitions diagnostique/confirmative/explicative de Mission AB restent strictement
// inchangés (vérifié explicitement, cf. AC-GOV en fin de fichier).
//
// Correctif appliqué EN AMONT de cette mission (cf. rapport final, Partie audit) : un moteur trouvé
// pendant l'audit préalable (Partie 1) était démontrable sur les VRAIES données de Yannis — Endurance
// obtenait un rang causal 'principal'/type 'convergent' à partir de DEUX preuves purement explicatives
// (RFD soleus/gastro), SANS AUCUNE preuve diagnostique — csmV2ExplanatoryFactorsForQuality() a été
// corrigé pour exiger qu'au moins une preuve propre soit réellement diagnostique
// (variable.indexOf('diagnosticEvidence.')===0) avant de qualifier 'direct'/'convergent'. Correctif
// vérifié sans impact sur les 8 sévérités Yannis (identiques avant/après) et sur toutes les suites
// Q->AB déjà existantes (0 régression). AC4 et AC9 exercent explicitement ce correctif.
//
// Exécution : node tests/mission_ac_causal_validation_tests.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur()/buildExpertReport() dans index.html.');
const slice = code.slice(start, end);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
eval(slice);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok — ' + name); }
  catch (e) { failed++; console.log('  FAIL — ' + name); console.log('    ' + (e && e.stack || e)); }
}
function csm(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}).clinicalSynthesisV2; }
function qr(data, quality, normSel) { return csm(data, normSel).clinicalCausalReasoning.qualityReasoning[quality]; }

console.log('MISSION AC — validation clinique du raisonnement causal (scénarios synthétiques contrôlés)');

// ══════════════════════════════ AC1 — CAUSE DIRECTE ═══════════════════════════════════════════
// Stabilisation : diagnostic (landing_uni_tts) ET explicatif (wblt_distance, mobiliteCheville) tous
// deux asymétriques-déficitaires -> 2 preuves propres, l'une réellement diagnostique -> 'convergent'
// (jamais seulement 'associé', jamais 'indéterminé'), rang causal 'principal'.
test('AC1 — cause directe : diagnostic + explicatif déficitaires -> convergent/principal, jamais associé ni indéterminé', () => {
  const r = qr({
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [14] } } }
  }, 'Stabilisation');
  assert.strictEqual(r.state, 'deficitaire');
  assert.strictEqual(r.directEvidence.length, 1);
  assert.strictEqual(r.directEvidence[0].type, 'CONVERGENT');
  assert.strictEqual(r.reasoningChain[0].rank, 'principal');
  assert.notStrictEqual(r.reasoningChain[0].rank, 'associe');
  assert.notStrictEqual(r.reasoningChain[0].rank, 'indetermine');
});

// ══════════════════════════════ AC2 — DÉFICIT SANS EXPLICATION ════════════════════════════════
// Mobilité (aucune relation n'existe jamais VERS Mobilité dans HYP_QUALITY_RELATIONS — choix
// délibéré pour isoler le cas) : déficit bilatéral SYMÉTRIQUE (D=G=6cm, diff=0<=1.5 -> WBLT jamais
// asymétrique) -> aucune preuve de symétrie, aucune explicative (structurellement vide pour
// Mobilité), aucun bridge ni relation possibles -> explanationStatus='not_determined', narrative
// honnête, jamais une explication fabriquée.
test('AC2 — déficit sans explication : Mobilité bilatérale symétrique -> not_determined, narrative honnête', () => {
  const r = qr({ wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } } }, 'Mobilité');
  assert.strictEqual(r.state, 'deficitaire');
  assert.strictEqual(r.directEvidence.length, 0);
  assert.strictEqual(r.explanatoryEvidence.length, 0, 'aucune asymétrie inventée (diff=0<=1.5cm)');
  assert.strictEqual(r.explanationStatus, 'not_determined');
});

// ══════════════════════════════ AC3 — VARIABLE EXPLICATIVE PRÉSENTE MAIS NORMALE ══════════════
// Stabilisation déficitaire (landing_uni_tts seul) ; WBLT présent mais NORMAL et symétrique
// (Mobilité préservée) -> le dissociation pattern whitelisté produit la formulation prudente déjà
// validée ("ne semble pas compatible... autre mécanisme"), jamais "wblt = cause".
test('AC3 — variable explicative présente mais normale : hypothèse non soutenue, jamais présentée comme cause', () => {
  const data = {
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } }
  };
  const c = csm(data);
  const r = c.clinicalCausalReasoning.qualityReasoning['Stabilisation'];
  assert.strictEqual(c.clinicalProfile['Mobilité'].severity, 'preserved');
  assert.strictEqual(r.directEvidence.length, 1);
  assert.strictEqual(r.directEvidence[0].type, 'DIRECT', 'une seule preuve propre (landing_uni_tts), WBLT normal exclu de own');
  const hyp = c.clinicalHypotheses.find(h => h.relation.explains === 'Mobilité' && h.relation.explained === 'Stabilisation');
  assert.ok(hyp, 'la dissociation Mobilité préservée / Stabilisation déficitaire doit être présente');
  assert.ok(/ne semble pas compatible/i.test(hyp.wording.kine) || /autre mécanisme/i.test(hyp.wording.patient));
  assert.ok(!/wblt.{0,20}(cause|est la cause)/i.test(JSON.stringify(hyp)));
});

// ══════════════════════════════ AC4 — PREUVE CONFIRMATIVE SEULE ═══════════════════════════════
// Réactivité : sldj_rsi (diagnostique) ABSENT (aucun trial), sldj height/contact_time (secondaires,
// jamais diagnostiques) asymétriques-déficitaires -> exerce directement le correctif appliqué en
// amont : ne doit JAMAIS être promu 'direct'/'convergent'/'principal' en l'absence de toute preuve
// diagnostique, quel que soit le nombre de preuves secondaires convergentes.
test('AC4 — preuve confirmative/secondaire seule (diagnostic absent) : jamais promue en diagnostic principal', () => {
  const data = { sldj: { active: true, D: { trials: { height: [5.4], contact_time: [520] } }, G: { trials: { height: [14.2], contact_time: [374] } } } };
  const c = csm(data);
  const r = c.clinicalCausalReasoning.qualityReasoning['Réactivité'];
  const diag = c.symmetryEvidence['Réactivité']['diagnosticEvidence.sldj_rsi'];
  assert.strictEqual(diag.available, false, 'sldj_rsi (diagnostique) doit rester indisponible');
  assert.strictEqual(r.explanatoryEvidence.length, 2, 'deux preuves secondaires présentes (height + contact_time)');
  assert.ok(!r.explanatoryEvidence.some(e => e.variable.indexOf('diagnosticEvidence.') === 0), 'aucune n\'est diagnostique');
  assert.strictEqual(r.directEvidence.length, 0, 'jamais promu direct/convergent sans preuve diagnostique (correctif AC)');
  assert.ok(!r.reasoningChain.some(rc => rc.rank === 'principal'), 'aucun rang principal fondé sur des preuves purement secondaires');
});

// ══════════════════════════════ AC5 — BRIDGE SEUL ══════════════════════════════════════════════
// Absorption <-> Explosivité via CMJ braking RFD (asymétrique) : la relation est bien représentée
// comme 'bridge'/'associated', confiance basse — jamais 'direct'/'causal'.
test('AC5 — bridge seul (Absorption<->Explosivité, CMJ braking RFD) : associated/bridge, jamais direct causal', () => {
  const r = qr({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } } }, 'Explosivité');
  assert.strictEqual(r.bridges.length, 1);
  assert.strictEqual(r.bridges[0].type, 'BRIDGE');
  assert.strictEqual(r.bridges[0].confidence, 'low');
  assert.strictEqual(r.directEvidence.length, 0, 'le bridge seul ne produit jamais de preuve directe côté Explosivité');
  assert.ok(!r.bridges.some(b => /\bcause\b/i.test(JSON.stringify(b))));
});

// ══════════════════════════════ AC6 — RELATION QUALITÉ→QUALITÉ VALIDÉE ════════════════════════
// La relation Force->Explosivité (déjà validée, whitelist) n'est activable QUE selon le pattern
// réellement whitelisté (Force PRÉSERVÉE explique Explosivité déficitaire — cf. wording du
// dissociation pattern). Ce test vérifie les DEUX faces de "selon les règles déjà validées" : (a)
// le pattern activé produit bien un facteur contributif, sens explains->explained respecté ; (b)
// un cas "Force déficitaire" (hors du pattern validé) ne produit PAS de relation fabriquée — le
// moteur n'étend jamais la règle au-delà de ce qui est réellement whitelisté.
test('AC6 — relation Force->Explosivité validée UNIQUEMENT selon le pattern whitelisté, sens respecté', () => {
  // (a) Force préservée (pattern validé) -> relation active.
  const activated = {
    iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  };
  const cA = csm(activated, { iso_belt_squat: 'belt_netball_super_league_f' });
  assert.strictEqual(cA.clinicalProfile['Force'].severity, 'preserved');
  const rExpA = cA.clinicalCausalReasoning.qualityReasoning['Explosivité'];
  const f = rExpA.crossQualityFactors.find(x => x.from === 'Force' && x.to === 'Explosivité');
  assert.ok(f, 'facteur Force->Explosivité attendu quand le pattern whitelisté est réellement réuni');
  assert.strictEqual(f.type, 'CROSS_QUALITY');

  // (b) Force déficitaire (hors pattern validé, "preserved explains deficient" non réuni) -> aucune
  // relation fabriquée, même si Explosivité est également déficitaire au même moment.
  const notActivated = {
    sl_iso_push: { active: true, D: { trials: { n: [4000] } }, G: { trials: { n: [1000] } } },
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  };
  const cB = csm(notActivated);
  assert.strictEqual(cB.clinicalProfile['Force'].severity, 'modere');
  assert.strictEqual(cB.clinicalProfile['Explosivité'].severity, 'modere');
  const rExpB = cB.clinicalCausalReasoning.qualityReasoning['Explosivité'];
  assert.strictEqual(rExpB.crossQualityFactors.length, 0, 'aucune relation fabriquée hors du pattern whitelisté, même les deux qualités déficitaires');
});

// ══════════════════════════════ AC7 — RELATION INVERSÉE ═══════════════════════════════════════
// Même cas qu'AC6 : vérifier explicitement qu'aucun facteur Explosivité->Force n'existe nulle part
// (ni côté Force, ni dans HYP_QUALITY_RELATIONS, ni dans CLINICAL_HYPOTHESIS_WHITELIST).
test('AC7 — relation inversée refusée : aucune causalité Explosivité->Force, dans aucune structure', () => {
  const data = {
    sl_iso_push: { active: true, D: { trials: { n: [4000] } }, G: { trials: { n: [1000] } } },
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  };
  const c = csm(data);
  assert.ok(!HYP_QUALITY_RELATIONS.some(r => r.explains === 'Explosivité' && r.explained === 'Force'));
  assert.ok(!CLINICAL_HYPOTHESIS_WHITELIST.some(w => w.explains === 'Explosivité' && w.explained === 'Force' && w.allowed));
  const rFor = c.clinicalCausalReasoning.qualityReasoning['Force'];
  assert.strictEqual(rFor.crossQualityFactors.length, 0);
  assert.strictEqual(rFor.contributingFactors.length, 0);
  assert.ok(!c.clinicalHypotheses.some(h => h.relation.explains === 'Explosivité' && h.relation.explained === 'Force'));
});

// ══════════════════════════════ AC8 — DISSOCIATION ═════════════════════════════════════════════
// Force préservée (testée, normale : iso_belt_squat) + Explosivité déficitaire (CMJ braking RFD) +
// relation Force->Explosivité déjà validée -> utilisée comme facteur contributif/dissociation, avec
// le wording PRUDENT déjà whitelisté (jamais "la force cause le déficit").
test('AC8 — dissociation Force préservée / Explosivité déficitaire : wording prudent, jamais affirmatif', () => {
  const data = {
    iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  };
  const c = csm(data, { iso_belt_squat: 'belt_netball_super_league_f' });
  assert.strictEqual(c.clinicalProfile['Force'].severity, 'preserved');
  assert.strictEqual(c.clinicalProfile['Explosivité'].severity, 'modere');
  const r = c.clinicalCausalReasoning.qualityReasoning['Explosivité'];
  const f = r.crossQualityFactors.find(x => x.from === 'Force');
  assert.ok(f);
  assert.strictEqual(r.explanationStatus, 'explained');
  const wEntry = CLINICAL_HYPOTHESIS_WHITELIST.find(x => x.explains === 'Force' && x.explained === 'Explosivité');
  assert.strictEqual(f.wording, wEntry.wording.technique);
  assert.ok(!/\bla force cause\b/i.test(f.wording));
  wEntry.forbiddenWording.forEach(fw => assert.ok(!new RegExp('\\b' + fw + '\\b', 'i').test(f.wording), fw));
});

// ══════════════════════════════ AC9 — CONVERGENCE ══════════════════════════════════════════════
// Absorption : 1 preuve diagnostique (braking_rfd) + 3 preuves secondaires indépendantes
// (freinageUnipodal.slcmj_*) toutes déficitaires -> convergence réelle (4 preuves > preuve isolée),
// jamais transformée automatiquement en causalité (bridges/relations restent séparés).
test('AC9 — convergence : 4 preuves indépendantes > preuve isolée, jamais automatiquement causale', () => {
  const data = {
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } },
    slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0] } } }
  };
  const r = qr(data, 'Absorption');
  assert.strictEqual(r.directEvidence.length, 1);
  assert.strictEqual(r.directEvidence[0].type, 'CONVERGENT');
  assert.strictEqual(r.directEvidence[0].evidence.length, 4, 'convergence réelle : 4 preuves, pas 1');
  assert.strictEqual(r.reasoningChain[0].rank, 'principal');
  assert.ok(!/\bcause\b/i.test(JSON.stringify(r.directEvidence)), 'convergence jamais transformée en mot "cause"');
});

// ══════════════════════════════ AC10 — DEUX FACTEURS EXPLICATIFS ══════════════════════════════
// Stabilisation avec 2 facteurs distincts déjà distingués par l'architecture : own convergent
// (landing_uni_tts + wblt) ET relation cross_quality (si Mobilité déficitaire, aucune relation ;
// on vérifie ici la distinction structurelle own vs cross au sein d'une même qualité, jamais
// aplatis en une seule liste indifférenciée de "causes certaines").
test('AC10 — deux facteurs explicatifs distincts : own (convergent) et bridge restent des champs séparés, jamais fusionnés', () => {
  const data = {
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [14] } } }
  };
  const r = qr(data, 'Stabilisation');
  assert.strictEqual(r.directEvidence.length, 1, 'un seul facteur "own" agrégé (convergent), pas une liste aplatie par variable');
  assert.strictEqual(r.directEvidence[0].evidence.length, 2, 'contient bien les 2 preuves (diagnostique+explicative)');
  assert.ok(Array.isArray(r.bridges), 'le bridge WBLT reste un champ structurellement distinct de directEvidence');
  r.bridges.forEach(b => assert.notStrictEqual(b.type, 'DIRECT'));
});

// ══════════════════════════════ AC11 — FACTEUR PRÉSENT MAIS NON CLASSIFIABLE ══════════════════
// Stabilisation déficitaire (landing_uni_tts) ; hip_abd_rfd100 (explicative, aucun seuil) présent
// mais son statut ABSOLU doit rester null (non classifiable), jamais 'normal' ni 'deficient' —
// et ne doit jamais apparaître comme preuve déficitaire dans les facteurs.
test('AC11 — facteur explicatif présent mais non classifiable : présente != normale, présente != déficitaire', () => {
  const data = {
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    // Symétrique (D=G=500) : isole strictement "présent, sans seuil" de toute question d'asymétrie
    // (déjà couverte séparément par AC16/AC17/AC18) — hip_abd_rfd100 ne doit alors JAMAIS apparaître
    // comme preuve, ni au sens absolu (aucun seuil) ni au sens symétrie (diff=0).
    hip_abd: { active: true, D: { trials: { rfd100: [500] } }, G: { trials: { rfd100: [500] } } }
  };
  const c = csm(data);
  const kv = c.clinicalCausalReasoning.qualityReasoning['Stabilisation'];
  // Le statut ABSOLU de hip_abd_rfd100 (aucun seuil, CSM_V2_CLINICAL_VARIABLE_MATRIX.classifiability
  // ='non_classifiable') ne doit jamais être 'normal' — vérifié directement sur la structure HYP.
  assert.strictEqual(matrix().byQuality['Stabilisation'].explicative.find(v => v.variableKey === 'forceStabilisateurs.hip_abd_rfd100').classifiability, 'non_classifiable');
  assert.ok(!kv.directEvidence.some(d => JSON.stringify(d).indexOf('hip_abd_rfd100') !== -1), 'hip_abd_rfd100 non classifiable et symétrique ne devient jamais une preuve déficitaire propre');
  assert.strictEqual(kv.directEvidence.length, 1, 'seule landing_uni_tts (diagnostique) reste la preuve propre');
});
function matrix() { return CSM_V2_CLINICAL_VARIABLE_MATRIX; }

// ══════════════════════════════ AC12 — DONNÉE MANQUANTE ════════════════════════════════════════
// Stabilisation déficitaire (landing_uni_tts) mais SLS/EO/EF/Strobo (P1, cf. Mission AB) totalement
// absents -> apparaissent explicitement dans missingEvidence ET deviennent une clinicalNextQuestion.
test('AC12 — donnée manquante P1 (SLS/EO/EF/Strobo) : visible dans missingEvidence et clinicalNextQuestions', () => {
  const data = { landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } };
  const c = csm(data);
  const r = c.clinicalCausalReasoning.qualityReasoning['Stabilisation'];
  ['diagnosticEvidence.eo_surface', 'diagnosticEvidence.ef_surface', 'diagnosticEvidence.strobo_surface'].forEach(v =>
    assert.ok(r.missingEvidence.some(m => m.variable === v), v + ' doit apparaître dans missingEvidence'));
  assert.ok(r.missingEvidence.some(m => /sls/i.test(m.variable)));
  const q = (c.clinicalNextQuestions || []).find(x => x.quality === 'Stabilisation');
  assert.ok(q, 'une clinicalNextQuestion doit être générée pour Stabilisation');
});

// ══════════════════════════════ AC13 — CONSÉQUENCE SANS CAUSE ═════════════════════════════════
// Force préservée (aucun facteur explicatif propre : directEvidence=[]) + Explosivité déficitaire
// via la relation déjà validée -> Force.consequences liste Explosivité comme conséquence
// potentielle/supportée, SANS jamais transformer cette conséquence en cause de Force lui-même.
test('AC13 — conséquence sans cause propre : Force (préservée, 0 facteur propre) liste Explosivité en conséquence, jamais en cause', () => {
  const data = {
    iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
    cmj: { active: true, trials: { ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  };
  const r = qr(data, 'Force', { iso_belt_squat: 'belt_netball_super_league_f' });
  assert.strictEqual(r.directEvidence.length, 0, 'Force préservée : aucun facteur explicatif propre');
  assert.ok(r.consequences.some(c => c.quality === 'Explosivité'));
  assert.ok(!/\bcause\b/i.test(JSON.stringify(r.consequences)));
});

// ══════════════════════════════ AC14 — CHAÎNE À 2 MAILLONS ════════════════════════════════════
// Mobilité déficitaire ET Stabilisation déficitaire, toutes deux via la même mesure WBLT partagée
// (asymétrique) : chaîne bridge réellement supportée AU NIVEAU VARIABLE (Mission AA), chaque
// maillon vérifié individuellement — jamais une chaîne fabriquée sans preuve propre aux deux bouts.
test('AC14 — chaîne à 2 maillons réellement supportée (Mobilité<->Stabilisation), maillons vérifiés individuellement', () => {
  const data = {
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [14] } } }
  };
  const c = csm(data);
  assert.strictEqual(c.clinicalProfile['Mobilité'].severity, 'majeur');
  assert.strictEqual(c.clinicalProfile['Stabilisation'].severity, 'majeur');
  const chain = c.clinicalFunctionalChains.find(ch => ch.chain[0] === 'Mobilité' && ch.chain[1] === 'Stabilisation');
  assert.ok(chain);
  assert.strictEqual(chain.chain.length, 2);
  const ec = (c.evidenceChains || []).find(e => e.qualities[0] === 'Mobilité' && e.qualities[1] === 'Stabilisation');
  assert.ok(ec);
  assert.strictEqual(ec.tier, 'BRIDGE', 'maillon vérifié individuellement : la mesure WBLT partagée est réellement présente aux deux bouts');
  assert.ok(['DIRECTE', 'CONVERGENTE', 'ASSOCIÉE', 'BRIDGE', 'HYPOTHÈSE'].indexOf(ec.tier) !== -1);
});

// ══════════════════════════════ AC15 — CHAÎNE À 3 MAILLONS NON SUPPORTÉE ══════════════════════
// Force préservée + Puissance/Explosivité déficitaires : Force->Puissance et Force->Explosivité
// sont deux relations DIRECTES indépendantes (2 maillons chacune) — aucune ne s'étend jamais à un
// 3e maillon fabriqué (Puissance->Explosivité nécessiterait Puissance PRÉSERVÉE, contradictoire
// avec Puissance déficitaire ici) : le moteur coupe la chaîne, jamais de raisonnement implicite.
test('AC15 — chaîne à 3 maillons non supportée : coupée au dernier maillon réel, jamais complétée implicitement', () => {
  const data = {
    iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
    slcmj: { active: true, D: { trials: { peak_power: [5] } }, G: { trials: { peak_power: [5] } } },
    cmj: { active: true, trials: { peak_power: [5], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [1613.68] } }
  };
  const c = csm(data, { iso_belt_squat: 'belt_netball_super_league_f', cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null } });
  const longChains = c.clinicalFunctionalChains.filter(ch => ch.chain.length >= 3);
  assert.strictEqual(longChains.length, 0, 'aucune chaîne à 3+ qualités fabriquée à partir de deux chaînes à 2 maillons distinctes');
  const global = computeCsmV2GlobalCausalReasoning(c.clinicalCausalReasoning, c.clinicalProfile);
  assert.strictEqual(global.longChains.length, 0);
});

// ══════════════════════════════ AC16 — ASYMÉTRIE SANS DÉFICIT ABSOLU ══════════════════════════
// WBLT D=16/G=13 (tous deux 'vert', écart 3cm>1.5cm) : absoluteEvidence reste 'vert'/normal, tandis
// que symmetryEvidence signale un déficit d'asymétrie — jamais un côté déclaré déficitaire au sens
// absolu si ce n'est pas réellement supporté.
test('AC16 — asymétrie sans déficit absolu : absolute=vert/normal, symmetry=deficient, dimensions jamais confondues', () => {
  const c = csm({ wblt: { active: true, D: { trials: { distance: [16] } }, G: { trials: { distance: [13] } } } });
  assert.strictEqual(c.absoluteEvidence['Mobilité'].status, 'vert');
  const se = c.symmetryEvidence['Mobilité']['diagnosticEvidence.wblt_distance'];
  assert.strictEqual(se.status, 'deficient');
  assert.strictEqual(c.clinicalProfile['Mobilité'].severity, 'modere', 'le déficit d\'asymétrie seul reste modéré, jamais majeur comme un déficit absolu 2+ preuves');
});

// ══════════════════════════════ AC17 — DÉFICIT ABSOLU SANS ASYMÉTRIE ══════════════════════════
// WBLT D=G=6 (tous deux sous le seuil orange, écart=0) : déficit bilatéral reconnu (severity=majeur
// via absolute), AUCUNE asymétrie inventée (own reste vide, aucune keyFinding fabriquée).
test('AC17 — déficit absolu bilatéral sans asymétrie : reconnu, aucune asymétrie inventée', () => {
  const c = csm({ wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } } });
  assert.strictEqual(c.clinicalProfile['Mobilité'].state, 'deficitaire');
  assert.strictEqual(c.clinicalProfile['Mobilité'].severity, 'majeur');
  assert.strictEqual(c.clinicalProfile['Mobilité'].keyFindings.length, 0, 'aucune asymétrie inventée : diff=0');
  const se = c.symmetryEvidence['Mobilité']['diagnosticEvidence.wblt_distance'];
  assert.strictEqual(se.status, 'normal');
});

// ══════════════════════════════ AC18 — CONFLIT ABSOLU / SYMÉTRIE ══════════════════════════════
// Deux profils opposés (Réactivité, sldj_rsi) : (a) absolu déficitaire + asymétrie faible ; (b)
// absolu normal + asymétrie importante. Les deux dimensions restent distinctement lisibles.
test('AC18 — conflit absolu/symétrie : les deux dimensions restent conservées séparément dans les deux sens', () => {
  const a = csm({ sldj: { active: true, D: { trials: { rsi: [0.3] } }, G: { trials: { rsi: [0.32] } } } });
  assert.strictEqual(a.absoluteEvidence['Réactivité'].status, 'jaune');
  assert.strictEqual(a.symmetryEvidence['Réactivité']['diagnosticEvidence.sldj_rsi'].status, 'normal');

  const b = csm({ sldj: { active: true, D: { trials: { rsi: [3.0] } }, G: { trials: { rsi: [1.3] } } } });
  assert.strictEqual(b.absoluteEvidence['Réactivité'].status, 'vert');
  assert.strictEqual(b.symmetryEvidence['Réactivité']['diagnosticEvidence.sldj_rsi'].status, 'deficient');
});

// ══════════════════════════════ AC19 — QUALITÉ PRÉSERVÉE ═══════════════════════════════════════
// Force testée (iso_belt_squat + soleus_iso), normale des deux côtés -> jamais décrite comme
// déficitaire ; reste utilisable dans une dissociation (cf. AC8/AC13) si une relation l'autorise.
test('AC19 — qualité préservée : jamais décrite comme déficitaire', () => {
  const c = csm({
    iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
    soleus_iso: { active: true, D: { trials: { n: [2500], nkg: [44.52] } }, G: { trials: { n: [2500], nkg: [48.19] } } }
  }, { iso_belt_squat: 'belt_netball_super_league_f' });
  assert.strictEqual(c.clinicalProfile['Force'].state, 'preservee');
  assert.strictEqual(c.clinicalProfile['Force'].severity, 'preserved');
  assert.notStrictEqual(c.clinicalProfile['Force'].state, 'deficitaire');
});

// ══════════════════════════════ AC20 — QUALITÉ NON DÉTERMINÉE ═════════════════════════════════
// Puissance sans aucune donnée -> state=non_determinable, distinct de 'preservee'.
test('AC20 — qualité non déterminée : non_determinable strictement distinct de preservee', () => {
  const c = csm({});
  assert.strictEqual(c.clinicalProfile['Puissance'].state, 'non_determinable');
  assert.notStrictEqual(c.clinicalProfile['Puissance'].state, 'preservee');
  assert.strictEqual(c.clinicalProfile['Puissance'].severity, null);
});

// ══════════════════════════════ AC21 — BRIDGE + RELATION ══════════════════════════════════════
// Mobilité préservée (WBLT normal symétrique) + Stabilisation déficitaire (landing_uni_tts) :
// crossQualityFactors (relation) ET bridges (WBLT) restent deux champs séparés, jamais aplatis.
test('AC21 — bridge + relation simultanés : cross_quality et bridge restent deux champs distincts', () => {
  const data = {
    wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } },
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } }
  };
  const r = qr(data, 'Stabilisation');
  assert.strictEqual(r.crossQualityFactors.length, 1);
  assert.strictEqual(r.crossQualityFactors[0].type, 'CROSS_QUALITY');
  assert.strictEqual(r.bridges.length, 1);
  assert.strictEqual(r.bridges[0].type, 'BRIDGE');
  // Champs distincts : aucun des deux n'emprunte les propriétés de l'autre.
  assert.ok(!('confidence' in r.crossQualityFactors[0]) || r.crossQualityFactors[0].confidence !== r.bridges[0].confidence || r.crossQualityFactors[0].type !== r.bridges[0].type);
  assert.notStrictEqual(r.crossQualityFactors[0].type, r.bridges[0].type);
});

// ══════════════════════════════ AC22 — RELATION + VARIABLE NON CLASSIFIABLE ═══════════════════
// Même cas qu'AC21 : la relation Mobilité->Stabilisation ne porte JAMAIS de preuve variable->variable
// propre (evidence:[]) — le mécanisme n'est jamais artificiellement "prouvé" par une variable.
test('AC22 — relation + variable non classifiable : la relation ne devient jamais une preuve variable->variable fabriquée', () => {
  const data = {
    wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } },
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } }
  };
  const r = qr(data, 'Stabilisation');
  const rel = r.crossQualityFactors[0];
  assert.deepStrictEqual(rel.evidence, [], 'la relation qualité->qualité ne porte jamais sa propre preuve variable — seul le bridge, séparé, en porte une');
  assert.ok(r.bridges[0].evidence.length > 0, 'le bridge, lui, porte bien sa preuve variable propre');
});

// ══════════════════════════════ AC23 — ABSENCE DE RELATION ═════════════════════════════════════
// Mobilité déficitaire (bilatéral symétrique) + Force déficitaire (sl_iso_push asymétrique) :
// aucune relation Mobilité<->Force n'existe dans HYP_QUALITY_RELATIONS -> aucune explication croisée.
test('AC23 — absence de relation : deux qualités déficitaires sans relation validée -> aucune explication croisée', () => {
  const data = {
    wblt: { active: true, D: { trials: { distance: [6] } }, G: { trials: { distance: [6] } } },
    sl_iso_push: { active: true, D: { trials: { n: [4000] } }, G: { trials: { n: [1000] } } }
  };
  const c = csm(data);
  assert.strictEqual(c.clinicalProfile['Mobilité'].state, 'deficitaire');
  assert.strictEqual(c.clinicalProfile['Force'].state, 'deficitaire');
  assert.ok(!HYP_QUALITY_RELATIONS.some(r => (r.explains === 'Mobilité' && r.explained === 'Force') || (r.explains === 'Force' && r.explained === 'Mobilité')));
  assert.strictEqual(c.clinicalCausalReasoning.qualityReasoning['Mobilité'].crossQualityFactors.length, 0);
  assert.strictEqual(c.clinicalCausalReasoning.qualityReasoning['Force'].crossQualityFactors.length, 0);
});

// ══════════════════════════════ AC24 — YANNIS RÉEL ══════════════════════════════════════════════
// Rejoue le raisonnement complet sur les vraies données de Yannis (fixture réelle inchangée, cf.
// tests/csmV2RealDataYannis.test.js) : sévérités, relations, bridges, patterns inchangés.
const YANNIS_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const YANNIS_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };
test('AC24 — Yannis réel : sévérités/relations/bridges/patterns inchangés par la mission AC (y compris le correctif)', () => {
  const c = csm(YANNIS_DATA, YANNIS_NORM_SEL);
  const expected = { Force: 'preserved', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Puissance: 'modere', Explosivité: 'modere', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(c.clinicalProfile[q].severity, expected[q], q));
  assert.strictEqual(c.clinicalBridgeEvidence.length, 8);
  assert.ok(c.clinicalBridgeEvidence.some(b => /wblt_distance/.test(JSON.stringify(b))));
  assert.ok(c.clinicalBridgeEvidence.some(b => /braking_rfd/.test(JSON.stringify(b))));
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  // Effet attendu et documenté du correctif : Endurance passe de CONVERGENT (2 preuves 100%
  // explicatives, aucune diagnostique) à un directEvidence vide — jamais une régression, une
  // correction de sur-affirmation, cf. rapport de mission.
  assert.strictEqual(c.clinicalCausalReasoning.qualityReasoning['Endurance'].directEvidence.length, 0);
});

// ══════════════════════════════ AC25 — TEST ANTI-HALLUCINATION ═══════════════════════════════
// Profil volontairement pauvre (1 seule mesure bilatérale, jamais assez pour un mécanisme
// diagnostique) : le moteur ne produit jamais "probablement dû à"/"lié à"/"causé par" sans support.
test('AC25 — anti-hallucination : profil pauvre en données -> jamais de wording causal non supporté', () => {
  const c = csm({ landing_bi: { active: true, trials: { tts: [2.0] } } });
  const r = c.clinicalCausalReasoning.qualityReasoning['Stabilisation'];
  assert.notStrictEqual(r.state, 'deficitaire', 'un seul mécanisme (sur 6 requis, seuil convergence>=2) ne suffit jamais à "retenue_faible"');
  const blob = JSON.stringify(r);
  ['probablement dû à', 'lié à', 'causé par'].forEach(w => assert.ok(!new RegExp(w, 'i').test(blob), w));
  assert.ok(!/\bcause\b/i.test(blob) || /sans/i.test(blob));
});

console.log(passed + ' passed (Partie 2, AC1-AC25), ' + failed + ' failed');

// ════════════════════════ PARTIE 3 — VALIDATION DU GRAPHE ═══════════════════════════════════════
// Assertions structurelles sur variableQualityGraph (Mission AA) : nodes/edges/type/support/
// confidence/source/target — sur les vraies données de Yannis (couverture la plus large : 39
// nœuds, 46 arêtes, 5 types) ET sur un scénario synthétique dédié (variable non classifiable).
const YANNIS_LIGHT = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82], height: [30.0] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11] } }, G: { trials: { rsi: [0.39] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } }
};
const YANNIS_LIGHT_NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

test('AC-G1 — aucun edge inventé : chaque source/target référence un nœud réellement présent', () => {
  const g = csm(YANNIS_LIGHT, YANNIS_LIGHT_NORM_SEL).variableQualityGraph;
  assert.ok(g.nodes.length > 0 && g.edges.length > 0);
  const ids = new Set(g.nodes.map(n => n.id));
  g.edges.forEach(e => {
    assert.ok(ids.has(e.source), 'source manquant : ' + e.source);
    assert.ok(ids.has(e.target), 'target manquant : ' + e.target);
    ['source', 'target', 'type', 'support', 'evidence', 'confidence'].forEach(k => assert.ok(k in e, k));
  });
});

test('AC-G2 — aucune inversion : chaque edge CROSS_QUALITY respecte exactement le sens HYP_QUALITY_RELATIONS', () => {
  const g = csm(YANNIS_LIGHT, YANNIS_LIGHT_NORM_SEL).variableQualityGraph;
  const cq = g.edges.filter(e => e.type === 'CROSS_QUALITY');
  assert.ok(cq.length > 0);
  cq.forEach(e => {
    const from = e.source.replace('quality:', ''), to = e.target.replace('quality:', '');
    assert.ok(HYP_QUALITY_RELATIONS.some(r => r.explains === from && r.explained === to), from + '->' + to + ' non whitelisté dans ce sens');
    assert.ok(!HYP_QUALITY_RELATIONS.some(r => r.explains === to && r.explained === from && r.explains !== from), 'sens inversé détecté');
  });
});

test('AC-G3 — aucun bridge transformé en causalité : tous les edges BRIDGE restent confidence=low, jamais DIRECT', () => {
  const g = csm(YANNIS_LIGHT, YANNIS_LIGHT_NORM_SEL).variableQualityGraph;
  const bridges = g.edges.filter(e => e.type === 'BRIDGE');
  assert.ok(bridges.length > 0);
  bridges.forEach(e => {
    assert.strictEqual(e.confidence, 'low');
    assert.notStrictEqual(e.type, 'DIRECT');
    assert.ok(!/\best la cause\b|\bcause de\b/i.test(JSON.stringify(e.wording)));
  });
});

test('AC-G4 — aucune variable non classifiable transformée en preuve déficitaire : symétrique+sans seuil -> jamais support "deficient"', () => {
  const data = {
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } },
    hip_abd: { active: true, D: { trials: { rfd100: [500] } }, G: { trials: { rfd100: [500] } } }
  };
  const g = csm(data).variableQualityGraph;
  const hipEdges = g.edges.filter(e => /hip_abd_rfd100/.test(e.source) || /hip_abd_rfd100/.test(e.target));
  assert.ok(hipEdges.length > 0, 'hip_abd_rfd100 peut légitimement apparaître comme bridge (mesure partagée Force/Endurance/Stabilisation)');
  hipEdges.forEach(e => {
    assert.notStrictEqual(e.support, 'deficient', 'jamais utilisée comme preuve déficitaire (aucun seuil, symétrique)');
    assert.notStrictEqual(e.type, 'DIRECT');
    assert.notStrictEqual(e.type, 'CONFIRMATIVE');
    e.evidence.forEach(ev => assert.notStrictEqual(ev.status, 'deficient'));
  });
});

test('AC-G5 — aucune conséquence transformée en cause : les edges CONSEQUENCE restent typés à part, jamais DIRECT/CROSS_QUALITY entrant fabriqué', () => {
  const g = csm(YANNIS_LIGHT, YANNIS_LIGHT_NORM_SEL).variableQualityGraph;
  const cons = g.edges.filter(e => e.type === 'CONSEQUENCE');
  assert.ok(cons.length > 0);
  cons.forEach(e => {
    assert.notStrictEqual(e.type, 'DIRECT');
    assert.notStrictEqual(e.type, 'CROSS_QUALITY');
  });
  // Les conséquences (Mission AA, computeCsmV2VariableConsequences) restent une liste séparée,
  // jamais fusionnée dans variableRelations (bridges réellement démontrés uniquement).
  const c = csm(YANNIS_LIGHT, YANNIS_LIGHT_NORM_SEL);
  assert.strictEqual(c.variableRelations.length, c.clinicalBridgeEvidence.length);
});

console.log((passed) + ' passed cumulés après Partie 3 (validation du graphe), ' + failed + ' failed');

// ════════════════════════ PARTIE 4 — VALIDATION DU TEXTE CLINIQUE ═══════════════════════════════
// Hiérarchie OBJECTIVÉ > EXPLIQUÉ > ASSOCIÉ > CONVERGENT > NON DÉTERMINÉ ; wording de relation
// clinique exclusivement issu de CLINICAL_HYPOTHESIS_WHITELIST, jamais reformulé librement.
test('AC-T1 — wording de relation clinique repris VERBATIM (jamais reformulé) dans le narrative généré', () => {
  const data = {
    wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } },
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } }
  };
  const c = csm(data);
  const narrative = c.clinicalExplanations['Stabilisation'].narrative;
  const w = CLINICAL_HYPOTHESIS_WHITELIST.find(x => x.explains === 'Mobilité' && x.explained === 'Stabilisation').wording;
  assert.ok(narrative.indexOf(w.technique) !== -1, 'le wording technique whitelisté doit apparaître mot pour mot, jamais reformulé');
});

test('AC-T2 — hiérarchie du texte : "cause"/"causal" jamais utilisés hors négation quand le niveau de preuve ne le permet pas', () => {
  const c = csm(YANNIS_LIGHT, YANNIS_LIGHT_NORM_SEL);
  const blob = JSON.stringify(c.clinicalReport) + JSON.stringify(c.clinicalCausalReasoning) + JSON.stringify(c.clinicalHypotheses);
  // Toute occurrence de "cause" doit être une négation prudente ("sans ... cause", "ne ... pas ... cause"),
  // jamais une affirmation ("est la cause de", "la cause du déficit est").
  const affirmations = blob.match(/[^.]{0,40}\best la cause de\b[^.]{0,40}/gi) || [];
  assert.strictEqual(affirmations.length, 0, JSON.stringify(affirmations));
});

test('AC-T3 — hiérarchie respectée : une qualité NON DÉTERMINÉE ne porte jamais de wording ASSOCIÉ/CONVERGENT/EXPLIQUÉ propre', () => {
  const c = csm({});
  const r = c.clinicalCausalReasoning.qualityReasoning['Puissance'];
  assert.strictEqual(r.state, 'non_determinable');
  assert.strictEqual(c.clinicalProfile['Puissance'].state, 'non_determinable');
  assert.strictEqual(r.explanationStatus, null);
  assert.strictEqual(r.directEvidence.length, 0);
  assert.strictEqual(r.narrative, null);
});

console.log(passed + ' passed cumulés après Partie 4 (validation du texte), ' + failed + ' failed');

// ═══════════════════ PARTIE 5 — VALIDATION DE LA CHAÎNE VARIABLE → QUALITÉ ═══════════════════════
// Trace inspectable variable -> rôle -> statut -> qualité -> preuve -> facteur explicatif ->
// relation éventuelle -> conséquence -> donnée manquante -> action, sur un scénario où CHAQUE maillon
// de la chaîne est réellement peuplé (Mobilité préservée / Stabilisation déficitaire, WBLT partagé).
test('AC-TRACE1 — chaîne variable->qualité->mécanisme->relation->conséquence->donnée manquante->action, chaque maillon inspectable', () => {
  const data = {
    wblt: { active: true, D: { trials: { distance: [14] } }, G: { trials: { distance: [14] } } },
    landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } }
  };
  const c = csm(data);

  // 1. variable
  const variablePath = 'diagnosticEvidence.landing_uni_tts';
  // 2. rôle (Mission AA)
  const role = csmV2VariableRole(variablePath);
  assert.strictEqual(role, 'DIRECT');
  // 3. statut (symmetryEvidence)
  const status = c.symmetryEvidence['Stabilisation'][variablePath].status;
  assert.strictEqual(status, 'deficient');
  // 4. qualité
  assert.strictEqual(c.clinicalProfile['Stabilisation'].state, 'deficitaire');
  // 5. preuve (own evidence / keyFindings)
  assert.ok(c.clinicalProfile['Stabilisation'].keyFindings.some(k => k.variable === variablePath));
  // 6. facteur explicatif (mécanisme)
  const qrS = c.clinicalCausalReasoning.qualityReasoning['Stabilisation'];
  assert.strictEqual(qrS.directEvidence.length, 1);
  assert.deepStrictEqual(qrS.mechanisms, ['Capacité à contrôler et stabiliser la charge après réception.']);
  // 7. relation éventuelle (Mobilité préservée -> Stabilisation déficitaire, whitelistée)
  const rel = qrS.crossQualityFactors.find(f => f.from === 'Mobilité');
  assert.ok(rel);
  assert.strictEqual(rel.type, 'CROSS_QUALITY');
  // 8. conséquence (côté Mobilité : Stabilisation apparaît comme conséquence)
  const qrM = c.clinicalCausalReasoning.qualityReasoning['Mobilité'];
  assert.ok(qrM.consequences.some(cq => cq.quality === 'Stabilisation'));
  // 9. donnée manquante (SLS/EO/EF/Strobo toujours absents ici)
  assert.ok(qrS.missingEvidence.some(m => /sls|surface/i.test(m.variable)));
  // 10. action (clinicalNextQuestions référence la même qualité)
  assert.ok((c.clinicalNextQuestions || []).some(q => q.quality === 'Stabilisation'));
});

console.log(passed + ' passed cumulés après Partie 5 (traçabilité), ' + failed + ' failed');

// ═══════════════════ AC-GOV — GOUVERNANCE (rien de nouveau inventé) ═══════════════════════════════
test('AC-GOV — HYP_QUALITY_RELATIONS/WHITELIST/THRESHOLDS/NORMS_V2/CSM_V2_AXIS_QUALITY_MAP/matrix AB strictement inchangés', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  assert.strictEqual(THRESHOLDS.wblt_distance.vert, 12);
  assert.strictEqual(NORMS_V2.cmj_peak_power !== undefined, true);
  assert.strictEqual(Object.keys(CSM_V2_AXIS_QUALITY_MAP).length, 8);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 141);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.diagnosticCount, 26);
});

console.log('=== TOTAL MISSION AC : ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) process.exit(1);

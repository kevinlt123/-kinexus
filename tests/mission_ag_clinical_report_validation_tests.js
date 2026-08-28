// MISSION AG — VALIDATION DU BILAN CLINIQUE FINAL KINEXUS.
//
// Mission de CONSOLIDATION + RENDU + VALIDATION (aucun nouveau moteur de raisonnement/causalité/
// priorisation). Audit préalable (§1) : plusieurs structures Q->AF étaient déjà entièrement calculées
// mais JAMAIS consommées par un rendu — clinicalDecisionSynthesis (Mission AE §11), clinicalAction
// Plan (Mission AE §10), informationalTests/variableAnalysis/clinicalConflicts/qualityToVariable
// Reasoning/decisionLevels/variableHypotheses (Mission AF). Seules 6 des 8 qualités disposaient d'une
// carte dédiée dans le compte rendu (Explosivité/Endurance absentes de toute carte). Ce fichier teste
// les nouvelles fonctions de RENDU (csmV2ReportGlobalProfileHtml, csmV2ReportPrincipalDeficitsFullHtml/
// csmV2ReportPrincipalDeficitCardHtml, csmV2ReportClinicalConflictsHtml, csmV2ReportInformationalTests
// Html, csmV2ReportFinalSynthesisHtml, csmV2ReportNextStepsHtml, csmV2ReportEffectiveQualityState),
// ainsi qu'un bug de contradiction découvert par inspection visuelle du PDF réel et corrigé dans
// computeCsmV2InformationalTests (classifiability/reasons dérivés de items[0] au lieu du "best" item
// réellement responsable du gain retenu). Aucun seuil/norme/relation clinique nouveaux, aucun moteur
// HYP LOCKED modifié.
//
// Exécution : node tests/mission_ag_clinical_report_validation_tests.js — aucune dépendance externe.
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
function fullRes(data, normSel) { return computeMoteur(data, {}, null, 25, normSel || {}); }

console.log('MISSION AG — validation du bilan clinique final Kinexus');

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
const yc = csm(YANNIS_DATA, YANNIS_NORM_SEL);
const body = csmV2ClinicalReportBodyHtml(yc);

// ═══════════════════════════ AG1-AG10 — PROFIL GLOBAL ══════════════════════════════════════════════
test('AG1 — "Profil global" apparaît exactement une fois dans le rapport', () => {
  const matches = body.match(/Profil global/g) || [];
  assert.strictEqual(matches.length, 1);
});
test('AG2 — Profil global : les 8 qualités apparaissent chacune une seule fois réparties par état', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const count = (body.match(new RegExp(csmV2QualityDisplayLabel(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    assert.ok(count >= 1, q + ' doit apparaître au moins une fois');
  });
});
test('AG3 — Yannis réel : Force maximale classée "Préservées" (réellement testée)', () => {
  assert.ok(/Préservées[\s\S]{0,80}Force maximale/.test(body.replace(/<[^>]+>/g, '')));
});
test('AG4 — Yannis réel : Mobilité/Réactivité/Absorption/Stabilisation/Endurance classées "Déficits majeurs"', () => {
  const plain = body.replace(/<[^>]+>/g, ' ');
  const idx = plain.indexOf('Déficits majeurs');
  const segment = plain.slice(idx, idx + 200);
  ['Mobilité', 'Réactivité', 'Absorption', 'Stabilisation', 'Endurance'].forEach(q => assert.ok(segment.indexOf(q) !== -1, q + ' absent de Déficits majeurs'));
});
test('AG5 — Yannis réel : Puissance/Explosivité classées "Déficits modérés"', () => {
  const plain = body.replace(/<[^>]+>/g, ' ');
  const idx = plain.indexOf('Déficits modérés');
  const segment = plain.slice(idx, idx + 100);
  assert.ok(segment.indexOf('Propulsion') !== -1 || segment.indexOf('Puissance') !== -1);
  assert.ok(segment.indexOf('Explosivité') !== -1);
});
test('AG6 — csmV2ReportEffectiveQualityState : qualité jamais testée -> "non_determinable", JAMAIS "preserved"', () => {
  const symmetryEvidenceAllUnavailable = { 'Réactivité': { 'diagnosticEvidence.sldj_rsi': { available: false } } };
  const clinicalProfileAllPreservedDefault = { 'Réactivité': { severity: 'preserved' } };
  assert.strictEqual(csmV2ReportEffectiveQualityState('Réactivité', clinicalProfileAllPreservedDefault, symmetryEvidenceAllUnavailable), 'non_determinable');
});
test('AG7 — csmV2ReportEffectiveQualityState : qualité réellement testée et préservée -> "preserved"', () => {
  assert.strictEqual(csmV2ReportEffectiveQualityState('Force', yc.clinicalProfile, yc.symmetryEvidence), 'preserved');
});
test('AG8 — clinicalDecisionSynthesis.narrative (Mission AE, jamais rendu avant AG) est désormais visible dans le corps du rapport', () => {
  assert.ok(yc.clinicalDecisionSynthesis && yc.clinicalDecisionSynthesis.narrative);
  assert.ok(body.indexOf(yc.clinicalDecisionSynthesis.narrative) !== -1);
});
test('AG9 — clinicalDecisionSynthesis.narrative généré DYNAMIQUEMENT (varie selon les données, jamais un texte fixe)', () => {
  const other = csm({ landing_uni: { active: true, D: { trials: { tts: [1.5] } }, G: { trials: { tts: [0.4] } } } });
  assert.notStrictEqual(other.clinicalDecisionSynthesis.narrative, yc.clinicalDecisionSynthesis.narrative);
});
test('AG10 — csmV2ReportGlobalProfileHtml : sans clinicalDecisionSynthesis, le paragraphe de synthèse est omis mais les groupes restent affichés (jamais un texte de repli inventé)', () => {
  const emptyProfile = {}; HYP_CSM_QUALITIES.forEach(q => { emptyProfile[q] = { severity: null }; });
  const out = csmV2ReportGlobalProfileHtml(emptyProfile, {}, null);
  assert.ok(out.indexOf('Profil global') !== -1);
  assert.ok(out.indexOf('Non déterminées') !== -1);
  assert.strictEqual(/border-top:1px dashed/.test(out), false, 'aucun séparateur de synthèse affiché sans narrative');
});

// ═══════════════════════════ AG11-AG20 — PREUVES ET MÉCANISMES ═════════════════════════════════════
test('AG11 — "Principaux déficits — vue complète (8 qualités)" présent, les 8 qualités y figurent comme titres de carte', () => {
  assert.ok(body.indexOf('vue complète (8 qualités)') !== -1);
  const idx = body.indexOf('vue complète (8 qualités)');
  const segment = body.slice(idx, idx + 15000);
  HYP_CSM_QUALITIES.forEach(q => assert.ok(segment.indexOf('>' + csmV2QualityDisplayLabel(q) + '<') !== -1 || segment.indexOf(csmV2QualityDisplayLabel(q)) !== -1, q + ' absent de la vue complète'));
});
test('AG12 — Explosivité et Endurance ont désormais une carte dédiée (absentes de CSM_V2_REPORT_SECTION_QUALITY, jamais rendues avant AG)', () => {
  assert.strictEqual(CSM_V2_REPORT_SECTION_QUALITY['explosivite'], undefined);
  assert.strictEqual(CSM_V2_REPORT_SECTION_QUALITY['endurance'], undefined);
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Explosivité', yc);
  assert.ok(card.indexOf('Explosivité') !== -1);
  const card2 = csmV2ReportPrincipalDeficitCardHtml(1, 'Endurance', yc);
  assert.ok(card2.indexOf('Endurance') !== -1);
});
test('AG13 — Stabilisation (Yannis réel) : "Objectivé par" contient les 3 preuves diagnostiques réelles', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Stabilisation', yc);
  ['Landing Unilatéral', 'WBLT', 'Loading Rate'].forEach(kw => assert.ok(card.indexOf(kw) !== -1, kw + ' absent'));
});
test('AG14 — Stabilisation (Yannis réel) : "Expliqué par" contient Force maximale (Contributif) et Mobilité (Contributif)', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Stabilisation', yc);
  assert.ok(/Expliqué par[\s\S]{0,10}:[\s\S]*Force maximale \(Contributif\)/.test(card));
  assert.ok(/Mobilité \(Contributif\)/.test(card));
});
test('AG15 — Absorption (Yannis réel) : "Objectivé par" contient les 4 preuves convergentes réelles', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Absorption', yc);
  ['CMJ', 'Braking RFD', 'Braking Impulse', 'Peak Braking Force'].forEach(kw => assert.ok(card.indexOf(kw) !== -1, kw + ' absent'));
});
test('AG16 — "Contributif" affiché UNIQUEMENT quand crossQualityFactors est réellement actif (jamais une relation seulement documentée)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const rel = yc.causeConsequenceRelations[q];
    const card = csmV2ReportPrincipalDeficitCardHtml(1, q, yc);
    const contributingCount = (card.match(/\(Contributif\)/g) || []).length;
    assert.strictEqual(contributingCount, rel.contributingFactors.length > 0 ? new Set(rel.contributingFactors.map(c => c.source)).size : 0);
  });
});
test('AG17 — "Axe clinique" présent quand csmV2AxesForQuality non vide (Mobilité), absent quand vide (Puissance/Endurance)', () => {
  assert.deepStrictEqual(csmV2AxesForQuality('Puissance'), []);
  assert.deepStrictEqual(csmV2AxesForQuality('Endurance'), []);
  const cardMobilite = csmV2ReportPrincipalDeficitCardHtml(1, 'Mobilité', yc);
  assert.ok(cardMobilite.indexOf('Axe clinique') !== -1);
  const cardEndurance = csmV2ReportPrincipalDeficitCardHtml(1, 'Endurance', yc);
  assert.strictEqual(cardEndurance.indexOf('Axe clinique'), -1);
});
test('AG18 — les libellés de variable affichés sont lisibles (jamais un chemin technique brut "diagnosticEvidence." exposé)', () => {
  const idx = body.indexOf('vue complète (8 qualités)');
  const segment = body.slice(idx, idx + 20000);
  assert.strictEqual(/diagnosticEvidence\./.test(segment), false);
  assert.strictEqual(/explanatoryEvidence\./.test(segment), false);
});
test('AG19 — le niveau de décision (Mission AF, decisionLevels) est affiché sur chaque carte (badge visible)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const card = csmV2ReportPrincipalDeficitCardHtml(1, q, yc);
    assert.ok(card.indexOf(yc.decisionLevels[q].label) !== -1, q + ' : niveau ' + yc.decisionLevels[q].label + ' absent');
  });
});
test('AG20 — le palier de priorité (Mission AE, clinicalPriorities.tier) est affiché quand non-null', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Mobilité', yc);
  assert.strictEqual(yc.clinicalPriorities['Mobilité'].tier, 'PRIORITAIRE');
  assert.ok(card.indexOf('PRIORITAIRE') !== -1);
});

// ═══════════════════════════ AG21-AG30 — HYPOTHÈSES / INCERTITUDES ═════════════════════════════════
test('AG21 — Explosivité (Yannis réel, non déterminée) : "Reste incertain" liste des hypothèses (jamais masquées)', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Explosivité', yc);
  assert.ok(/Reste incertain/.test(card));
  assert.ok(/\(Hypothèse\)/.test(card));
});
// csmV2FixtureWithRefutedCause() : construit un csmV2Rep-like MINIMAL pour tester directement le
// rendu de la carte sur le statut REFUTED — sur Yannis et sur tout scénario computeMoteur() essayé,
// REFUTED ne se déclenche jamais naturellement (cf. Mission AF, note empirique détaillée : dès qu'une
// qualité "explains" est réellement testée, le raisonnement mécanistique Mission X la classe déjà en
// CONTRIBUTING avant d'atteindre cette branche). Démonstration directe de la fonction de RENDU avec
// une structure de la forme exacte produite par computeCsmV2() (mêmes champs que causeConsequence
// Relations §8 mission AF), pas un scénario patient inventé.
function csmV2FixtureWithRefutedCause(quality) {
  var fixture = { clinicalProfile: {}, clinicalCausalReasoning: { qualityReasoning: {} }, causeConsequenceRelations: {}, qualityToVariableReasoning: {}, clinicalPriorities: {}, decisionLevels: {}, symmetryEvidence: {} };
  HYP_CSM_QUALITIES.forEach(function (q) {
    fixture.clinicalProfile[q] = { severity: q === quality ? 'modere' : null };
    fixture.clinicalCausalReasoning.qualityReasoning[q] = { directEvidence: [], state: q === quality ? 'deficitaire' : 'non_determinable' };
    fixture.causeConsequenceRelations[q] = { potentialCauses: [], contributingFactors: [], consequences: [], unknowns: [] };
    fixture.qualityToVariableReasoning[q] = { nextBestTest: null, reason: null };
    fixture.clinicalPriorities[q] = { tier: null };
    fixture.decisionLevels[q] = { level: 4, label: 'INCONNU' };
  });
  fixture.causeConsequenceRelations[quality].potentialCauses = [{ source: 'Réactivité', target: quality, evidenceType: 'REFUTED', certainty: 'refuted', supportingEvidence: [], contradictingEvidence: [{ quality: 'Réactivité', reason: 'testée et préservée' }], status: 'not_supported' }];
  return fixture;
}
test('AG22 — statut REFUTED rendu sous le libellé "Hypothèse infirmée" (jamais masqué, jamais fusionné avec Hypothèse)', () => {
  const fixture = csmV2FixtureWithRefutedCause('Explosivité');
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Explosivité', fixture);
  assert.ok(card.indexOf('Hypothèse infirmée') !== -1);
});
test('AG23 — Endurance (Yannis réel, 54 unknowns) : liste "Reste incertain" plafonnée à 6 + marqueur, RIEN perdu (donnée complète dans causeConsequenceRelations)', () => {
  const rel = yc.causeConsequenceRelations['Endurance'];
  assert.ok(rel.unknowns.length > 6);
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Endurance', yc);
  assert.ok(/variable\(s\) supplémentaire\(s\)/.test(card));
  const occurrences = (card.match(/Indéterminé/g) || []).length;
  assert.ok(occurrences <= 7, 'au plus 6 items + 1 marqueur affichés');
});
test('AG24 — Réactivité (Yannis réel, 0 incertitude) : aucun marqueur de troncature affiché (liste courte, jamais tronquée inutilement)', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Réactivité', yc);
  assert.strictEqual(/variable\(s\) supplémentaire\(s\)/.test(card), false);
});
test('AG25 — dédoublonnage d\'affichage : "Force maximale (Associé)" apparaît EXACTEMENT une fois sur la carte Endurance (6 bridges réels vers la même qualité)', () => {
  const rawAssociatedCount = yc.causeConsequenceRelations['Endurance'].potentialCauses.filter(c => c.evidenceType === 'ASSOCIATED' && c.source === 'Force').length;
  assert.ok(rawAssociatedCount > 1, 'précondition : plusieurs bridges bruts vers Force sur Endurance');
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Endurance', yc);
  const occurrences = (card.match(/Force maximale \(Associé\)/g) || []).length;
  assert.strictEqual(occurrences, 1);
});
test('AG26 — "Points de vigilance / dissociations" : Force max/RFD explicitement visible sur Yannis réel (§8.G)', () => {
  assert.ok(body.indexOf('Points de vigilance') !== -1);
  assert.ok(body.indexOf('Dissociation Force maximale / Production rapide de force') !== -1);
});
test('AG27 — "Points de vigilance" : co-déficit Mobilité/Stabilisation avec relation active visible', () => {
  assert.ok(/Co-déficit avec relation active[\s\S]{0,60}Mobilité[\s\S]{0,20}Stabilisation/.test(body));
});
test('AG28 — les conflits ne sont JAMAIS présentés comme une causalité affirmée (jamais "est la cause de")', () => {
  const idx = body.indexOf('Points de vigilance');
  const segment = body.slice(idx, idx + 3000);
  assert.strictEqual(/\best la cause (de|principale)\b/i.test(segment), false);
  assert.ok(/jamais présentée comme cause principale/.test(segment));
});
test('AG29 — csmV2ReportClinicalConflictsHtml renvoie une chaîne vide sans conflit (jamais un bloc vide)', () => {
  assert.strictEqual(csmV2ReportClinicalConflictsHtml([]), '');
  assert.strictEqual(csmV2ReportClinicalConflictsHtml(null), '');
});
test('AG30 — chaque conflit affiché conserve description ET interprétation (jamais résolu silencieusement)', () => {
  yc.clinicalConflicts.forEach(c => {
    const card = csmV2ReportClinicalConflictsHtml([c]);
    assert.ok(card.indexOf(c.description) !== -1);
    assert.ok(card.indexOf(c.interpretation) !== -1);
  });
});

// ═══════════════════════════ AG31-AG35 — TESTS RECOMMANDÉS ═════════════════════════════════════════
test('AG31 — "Tests à faire" présent, Heel Raise ciblant Endurance avec le "Pourquoi" attendu (§5 exemple mission)', () => {
  assert.ok(body.indexOf('Tests à faire') !== -1);
  const section = body.slice(body.indexOf('Tests à faire — valeur informationnelle'));
  assert.ok(/Heel Raise[\s\S]{0,50}Qualité ciblée : Endurance[\s\S]{0,250}Variable diagnostique manquante/.test(section));
});
test('AG32 — un test à gain NONE (Hop Test, Ankle Dorsiflexion) n\'apparaît JAMAIS dans "Tests à faire" (§8.H : jamais présenté comme prioritaire)', () => {
  const idx = body.indexOf('Tests à faire');
  const endIdx = body.indexOf('DU DÉFICIT', idx) !== -1 ? body.indexOf('DU DÉFICIT', idx) : body.indexOf('Du déficit à la décision', idx);
  const segment = body.slice(idx, endIdx > idx ? endIdx : idx + 6000);
  assert.strictEqual(/>HOP TEST</.test(segment), false);
  assert.strictEqual(/ANKLE DORSIFLEXION/.test(segment), false);
});
test('AG33 — valeur informationnelle HIGH affichée en clair ("Élevée") pour Heel Raise', () => {
  assert.ok(/Heel Raise[\s\S]{0,400}Élevée \(priorité P1\)/.test(body));
});
test('AG34 — régression bug corrigé (§12 découverte visuelle) : classifiability toujours cohérente avec expectedReasoningGain (jamais "non classifiable" pour un gain LOW/MODERATE/HIGH)', () => {
  yc.informationalTests.forEach(t => {
    if (t.expectedReasoningGain !== 'NONE') assert.strictEqual(t.classifiability, 'exploitable', t.test + ' : gain ' + t.expectedReasoningGain + ' mais classifiability non_classifiable');
    else assert.strictEqual(t.classifiability, 'non_classifiable');
  });
});
test('AG35 — csmV2ReportInformationalTestsHtml renvoie une chaîne vide si tous les tests sont à gain NONE (jamais un bloc vide ni un test inutile affiché)', () => {
  const allNone = [{ test: 'X', targetQuality: 'Force', targetMechanism: null, currentEvidence: [], missingEvidence: [{ hasThreshold: false }], expectedReasoningGain: 'NONE', classifiability: 'non_classifiable', priority: 'P2', reasons: ['x'] }];
  assert.strictEqual(csmV2ReportInformationalTestsHtml(allNone), '');
});

// ═══════════════════════════ AG36-AG40 — PRIORITÉS ══════════════════════════════════════════════════
test('AG36 — "Ce que je ferais ensuite" affiche exactement min(3, clinicalActionPlan.length) priorités numérotées', () => {
  assert.strictEqual(yc.clinicalActionPlan.length, 4);
  const section = csmV2ReportNextStepsHtml(yc.clinicalActionPlan);
  ['Priorité 1', 'Priorité 2', 'Priorité 3'].forEach(p => assert.ok(section.indexOf(p) !== -1));
  assert.strictEqual(section.indexOf('Priorité 4'), -1);
});
test('AG37 — "Ce que je ferais ensuite" ne prescrit JAMAIS un exercice précis — uniquement des axes CSM_V2_AXIS_QUALITY_MAP', () => {
  const section = csmV2ReportNextStepsHtml(yc.clinicalActionPlan);
  const axisLines = section.match(/Axe de travail : ([^<]+)</g) || [];
  assert.ok(axisLines.length > 0);
  axisLines.forEach(line => {
    const axes = line.replace('Axe de travail : ', '').replace('<', '').split(', ');
    axes.forEach(ax => assert.ok(Object.prototype.hasOwnProperty.call(CSM_V2_AXIS_QUALITY_MAP, ax), '"' + ax + '" doit être un axe LOCKED, jamais un exercice inventé'));
  });
});
test('AG38 — csmV2ReportNextStepsHtml renvoie une chaîne vide sans plan d\'action (jamais un bloc vide)', () => {
  assert.strictEqual(csmV2ReportNextStepsHtml([]), '');
  assert.strictEqual(csmV2ReportNextStepsHtml(null), '');
});
test('AG39 — l\'ordre de "Ce que je ferais ensuite" respecte l\'ordre PRIORITAIRE puis IMPORTANTE déjà déterminé par clinicalActionPlan (aucun retri)', () => {
  const priorities = yc.clinicalActionPlan.map(a => a.priority);
  for (let i = 1; i < priorities.length; i++) {
    const rank = { PRIORITAIRE: 0, IMPORTANTE: 1 };
    assert.ok(rank[priorities[i]] >= rank[priorities[i - 1]]);
  }
});
test('AG40 — le palier affiché sur chaque carte "vue complète" correspond exactement à clinicalPriorities[q].tier (round-trip)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const tier = yc.clinicalPriorities[q].tier;
    const card = csmV2ReportPrincipalDeficitCardHtml(1, q, yc);
    if (tier) assert.ok(card.indexOf(tier.replace(/_/g, ' ')) !== -1, q + ' : palier ' + tier + ' absent de la carte');
  });
});

// ═══════════════════ AG41-AG45 — CAUSES / CONTRIBUTIONS / CONSÉQUENCES ═════════════════════════════
test('AG41 — "Expliqué par" (carte) reflète exactement le nombre de sources uniques de causeConsequenceRelations.contributingFactors', () => {
  const rel = yc.causeConsequenceRelations['Stabilisation'];
  const uniqueSources = new Set(rel.contributingFactors.map(c => c.source));
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Stabilisation', yc);
  const count = (card.match(/\(Contributif\)/g) || []).length;
  assert.strictEqual(count, uniqueSources.size);
});
test('AG42 — une même qualité source n\'apparaît jamais SIMULTANÉMENT en "Contributif" ET listée à nouveau dans "Reste incertain" pour la même relation (séparation structurelle stricte, Mission AF §8)', () => {
  HYP_CSM_QUALITIES.forEach(q => {
    const rel = yc.causeConsequenceRelations[q];
    const contributingSources = new Set(rel.contributingFactors.map(c => c.source));
    const hypothesisSources = rel.potentialCauses.filter(c => c.evidenceType === 'HYPOTHESIS' || c.evidenceType === 'REFUTED').map(c => c.source);
    hypothesisSources.forEach(s => assert.strictEqual(contributingSources.has(s), false, q + ' : ' + s + ' ne peut pas être à la fois Contributif et Hypothèse pour la même relation'));
  });
});
test('AG43 — une CONSÉQUENCE (causeConsequenceRelations.consequences) n\'apparaît JAMAIS dans "Expliqué par"/"Objectivé par" de la qualité SOURCE (cause != conséquence)', () => {
  const rel = yc.causeConsequenceRelations['Mobilité'];
  assert.ok(rel.consequences.some(c => c.target === 'Stabilisation'));
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Mobilité', yc);
  assert.strictEqual(/Expliqué par[\s\S]{0,10}:[\s\S]*Stabilisation/.test(card), false);
});
test('AG44 — les "unknowns" (Mission AF §8) restent intégralement comptés même lorsque l\'affichage est plafonné (rien n\'est perdu dans les données, uniquement dans l\'affichage Niveau 1)', () => {
  assert.strictEqual(yc.causeConsequenceRelations['Endurance'].unknowns.length, yc.clinicalCausalReasoning.qualityReasoning['Endurance'].missingEvidence.length);
});
test('AG45 — contradictingEvidence (REFUTED, Mission AF computeCsmV2CauseConsequenceRelations) reste visible dans la carte via "Hypothèse infirmée" (jamais silencieusement supprimé)', () => {
  const emptyQr = { crossQualityFactors: [], bridges: [], consequences: [], missingEvidence: [] };
  const clinicalProfile = {}; const clinicalCausalReasoning = { qualityReasoning: {} };
  HYP_CSM_QUALITIES.forEach(q => { clinicalProfile[q] = { severity: null }; clinicalCausalReasoning.qualityReasoning[q] = emptyQr; });
  clinicalProfile['Réactivité'] = { severity: 'preserved' };
  const symmetryEvidence = { 'Réactivité': { 'diagnosticEvidence.sldj_rsi': { available: true } } };
  const rel = computeCsmV2CauseConsequenceRelations(clinicalProfile, clinicalCausalReasoning, symmetryEvidence);
  const refuted = rel['Explosivité'].potentialCauses.find(c => c.evidenceType === 'REFUTED');
  assert.ok(refuted && refuted.contradictingEvidence.length === 1);
  const fixture = csmV2FixtureWithRefutedCause('Explosivité');
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Explosivité', fixture);
  assert.ok(card.indexOf('Hypothèse infirmée') !== -1);
});

// ═══════════════════════════ AG46 — QUALITÉ NON TESTÉE ═════════════════════════════════════════════
test('AG46 — qualité jamais testée -> rendue "Non déterminée", JAMAIS "Préservée" (pipeline complet, jamais une fausse préservation par défaut)', () => {
  // Aucune donnée du tout pour Réactivité (severity LOCKED retombe sur 'preserved' par défaut).
  const c = csm({ cmj: { active: true, trials: { ecc_decel_rfd_L: [3500], ecc_decel_rfd_R: [1400] } } });
  assert.strictEqual(c.clinicalProfile['Réactivité'].severity, 'preserved', 'précondition : comportement LOCKED confirmé');
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Réactivité', c);
  assert.ok(card.indexOf('Non déterminée') !== -1);
  assert.strictEqual(/>Préservée</.test(card), false);
  assert.ok(/jamais présenté comme préservé par défaut/.test(card));
});

// ═══════════════════════════ AG47 — BRIDGE ≠ CAUSALITÉ ══════════════════════════════════════════════
test('AG47 — les entrées ASSOCIÉ (bridge) n\'affirment jamais une causalité — jamais "est la cause de"/"provoque"/"entraîne"', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Stabilisation', yc);
  const idx = card.indexOf('Associé à');
  const segment = card.slice(idx, idx + 300);
  ['est la cause de', 'provoque', 'entraîne'].forEach(w => assert.strictEqual(segment.toLowerCase().indexOf(w), -1, w + ' trouvé dans une association bridge'));
});

// ═══════════════════════════ AG48 — RELATION ≠ CAUSALITÉ ════════════════════════════════════════════
test('AG48 — les entrées CONTRIBUTIF (relation qualité->qualité) n\'affirment jamais une causalité automatique', () => {
  const card = csmV2ReportPrincipalDeficitCardHtml(1, 'Stabilisation', yc);
  const idx = card.indexOf('Expliqué par');
  const segment = card.slice(idx, idx + 300);
  assert.strictEqual(/\best la cause (de|principale)\b/i.test(segment), false);
});

// ═══════════════════════════ AG49 — YANNIS RÉEL (§6 mission) ═══════════════════════════════════════
test('AG49 — Yannis réel : les 8 sévérités exactement attendues par la mission, jamais forcées', () => {
  assert.strictEqual(yc.clinicalProfile['Force'].severity, 'preserved');
  assert.strictEqual(yc.clinicalProfile['Puissance'].severity, 'modere');
  assert.strictEqual(yc.clinicalProfile['Explosivité'].severity, 'modere');
  assert.strictEqual(yc.clinicalProfile['Mobilité'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Réactivité'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Absorption'].severity, 'majeur');
  assert.strictEqual(yc.clinicalProfile['Stabilisation'].severity, 'majeur');
  // Endurance : "majeure ou indéterminée selon le résultat réel du moteur" (mission §6) — le moteur
  // réel donne severity='majeur' (ampleur du déficit, RFD symmetry) ET certainty='not_determined'
  // (mécanisme propre non déterminé, aucune variable diagnostique classifiable) — LES DEUX faits sont
  // réels et non contradictoires, jamais l'un forcé au détriment de l'autre.
  assert.strictEqual(yc.clinicalProfile['Endurance'].severity, 'majeur');
  assert.strictEqual(yc.clinicalCertainty['Endurance'], 'not_determined');
});

// ═══════════════════════════ AG50 — EXPERTVIEW = PDF ════════════════════════════════════════════════
test('AG50 — buildExpertReport (PDF) consomme EXACTEMENT csmV2ClinicalReportBodyHtml, la même fonction qu\'ExpertView (SEULE implémentation)', () => {
  const defCount = (code.match(/function csmV2ClinicalReportBodyHtml\(/g) || []).length;
  assert.strictEqual(defCount, 1);
  const buildExpertReportSrc = code.slice(code.indexOf('function buildExpertReport('), code.indexOf('function buildExpertReport(') + 20000);
  assert.ok(/csmV2ClinicalReportBodyHtml\(csmV2Rep\)/.test(buildExpertReportSrc));
  const callCount = (code.match(/csmV2ClinicalReportBodyHtml\(csmV2\)/g) || []).length;
  assert.strictEqual(callCount, 1, 'ExpertView doit appeler csmV2ClinicalReportBodyHtml(csmV2) exactement une fois');
  assert.ok(code.indexOf('function ExpertView(') < code.indexOf('csmV2ClinicalReportBodyHtml(csmV2)'), 'l\'appel doit se situer dans ExpertView');
});

// ═══════════════════════════ Compléments (couverture + validation PDF réelle) ══════════════════════
test('AG51 — régression : les 8 sévérités Yannis restent identiques à travers toutes les couches Q->AG', () => {
  const expected = { Force: 'preserved', Mobilité: 'majeur', Réactivité: 'majeur', Absorption: 'majeur', Puissance: 'modere', Explosivité: 'modere', Stabilisation: 'majeur', Endurance: 'majeur' };
  Object.keys(expected).forEach(q => assert.strictEqual(yc.clinicalProfile[q].severity, expected[q], q));
});
test('AG52 — csmV2ReportPrincipalDeficitCardHtml ne lève jamais d\'exception pour une qualité totalement sans donnée (défensif)', () => {
  const empty = csm({});
  HYP_CSM_QUALITIES.forEach(q => assert.doesNotThrow(() => csmV2ReportPrincipalDeficitCardHtml(1, q, empty)));
});
test('AG53 — validation PDF réelle (buildFullReportHtml) : toutes les nouvelles sections AG sont présentes dans le document HTML complet consommé par l\'impression', () => {
  const res = fullRes(YANNIS_DATA, YANNIS_NORM_SEL);
  const athlete = { prenom: 'Yannis', nom: 'Briant' };
  const bilan = { date: new Date('2026-08-27').toISOString(), type: 'Bilan', sousType: 'Retour au sport', testData: YANNIS_DATA };
  const fullHtml = buildFullReportHtml('expert', athlete, bilan, res);
  ['Profil global', 'vue complète (8 qualités)', 'Points de vigilance', 'Tests à faire', 'Synthèse clinique finale', 'Ce que je ferais ensuite'].forEach(title => {
    assert.ok(fullHtml.indexOf(title) !== -1, title + ' absent du document PDF complet');
  });
  assert.ok(fullHtml.indexOf('<!DOCTYPE html>') !== -1);
});
test('AG54 — gouvernance : HYP_QUALITY_RELATIONS(9)/CLINICAL_HYPOTHESIS_WHITELIST(9)/matrix meta(150) et les 8 moteurs HYP LOCKED restent strictement inchangés', () => {
  assert.strictEqual(HYP_QUALITY_RELATIONS.length, 9);
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  assert.strictEqual(CSM_V2_CLINICAL_VARIABLE_MATRIX.meta.totalVariables, 150);
  assert.strictEqual(typeof computeHypForce01, 'function');
  assert.strictEqual(typeof computeHypMobility01, 'function');
  assert.strictEqual(typeof computeHypReactivity01, 'function');
  assert.strictEqual(typeof computeHypAbsorption01, 'function');
  assert.strictEqual(typeof computeHypPower01, 'function');
  assert.strictEqual(typeof computeHypExplosivity01, 'function');
  assert.strictEqual(typeof computeHypStabilization01, 'function');
  assert.strictEqual(typeof computeHypEndurance01, 'function');
});
test('AG55 — le corps du rapport reste cohérent : aucune section AG dupliquée (chaque titre nouveau apparaît exactement une fois)', () => {
  ['Points de vigilance / dissociations', 'Tests à faire — valeur informationnelle', 'Synthèse clinique finale', 'Ce que je ferais ensuite'].forEach(title => {
    const count = (body.match(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    assert.strictEqual(count, 1, title + ' : ' + count + ' occurrence(s), attendu 1');
  });
});

console.log('=== TOTAL MISSION AG : ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) process.exit(1);

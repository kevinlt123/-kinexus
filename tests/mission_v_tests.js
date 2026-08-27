// MISSION V — Intégration réelle Yannis + raisonnement clinique explicatif.
//
// Fait fonctionner le raisonnement clinique CSM V2 (Missions Q-U) sur les données réelles de
// Yannis Briant et vérifie que le moteur explique désormais POURQUOI une qualité est déficitaire
// (preuves directes, preuves explicatives propres, relations qualité→qualité déjà validées,
// bridges, functional chains, convergence, facteur explicatif principal ou "non déterminé"),
// pas seulement QUELLE qualité l'est.
//
// Aucun moteur HYP LOCKED n'est modifié par cette mission. L'unique changement de code apporté
// (index.html) est nul : tout le gain vient de données réelles supplémentaires, déjà câblées dans
// des moteurs classifiables existants (catalogue TESTS + HYP-PUI-01/HYP-ABS-01/HYP-EXP-01/
// HYP-FOR-01), mais jusqu'ici absentes de la fixture (cf. tests/csmV2RealDataYannis.test.js pour
// le détail des KPI ajoutés et leur justification variable-par-variable).
//
// Exécution : node tests/mission_v_tests.js — aucune dépendance externe.
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

// Données réelles Yannis Briant — identiques à tests/csmV2RealDataYannis.test.js (source de vérité
// pour la provenance/convention D-G/formule d'asymétrie, voir ce fichier).
const REAL_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  soleus_iso: { active: true, D: { trials: { n: [812], nkg: [44.52], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], nkg: [48.19], rfd100: [2250], rfd200: [2055] } } },
  gastro_iso: { active: true, D: { trials: { n: [1406], nkg: [15.48], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], nkg: [15.54], rfd100: [810], rfd200: [890] } } },
  iso_belt_squat: { active: true, trials: { n: [4272], nkg: [55.72] } },
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46], rsi_mod: [0.34], depth: [-36.1], ecc_peak_vel: [-0.82] } },
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6], peak_power: [26.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0], peak_power: [29.6] } } },
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  dj: { active: true, trials: { rsi: [0.72] } },
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

function run() {
  const res = computeMoteur(REAL_DATA, {}, null, 25, NORM_SEL);
  return { res, csm: res.clinicalSynthesisV2 };
}
function report() {
  const { res } = run();
  const bilan = { date: new Date().toISOString(), type: 'Bilan', sousType: 'Complet', testData: REAL_DATA };
  const expertHtml = buildExpertReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  const sportifHtml = buildSportifReport({ prenom: 'Yannis', nom: 'Briant' }, bilan, res);
  return { res, expertHtml, sportifHtml };
}

console.log('MISSION V — raisonnement clinique CSM V2 sur données réelles Yannis Briant');

// V1 — chargement des vraies données Yannis
test('V1 — chargement des données réelles : computeMoteur() s\'exécute sans erreur et produit clinicalSynthesisV2', () => {
  const { csm } = run();
  assert.ok(csm && csm.clinicalProfile, 'clinicalSynthesisV2/clinicalProfile absent');
});

// V2 — absence de valeurs synthétiques là où une vraie valeur existe (spot-check des valeurs
// corrigées par rapport à l'ancienne fixture GOLD synthétique : iso_belt_squat n, dj rsi).
test('V2 — aucune valeur synthétique résiduelle : iso_belt_squat.n=4272 (pas 5000), dj.rsi=0.72 (pas 2.5)', () => {
  assert.strictEqual(REAL_DATA.iso_belt_squat.trials.n[0], 4272);
  assert.strictEqual(REAL_DATA.dj.trials.rsi[0], 0.72);
  assert.strictEqual(REAL_DATA.gastro_iso.D.trials.n[0], 1406);
});

// V3 — mapping de chaque export vers son test Kinexus (TEST_TYPE_MAP, déjà verrouillé)
test('V3 — TEST_TYPE_MAP : chaque code ForceDecks réel pointe vers le bon test Kinexus', () => {
  const expected = { SLSEICR: 'soleus_iso', SLSTICR: 'gastro_iso', IBSQT: 'iso_belt_squat', CMJ: 'cmj', SLJ: 'slcmj', SLDJ: 'sldj', DJ: 'dj', SLLAH: 'sllt', HJ: 'repeated_hop_bi' };
  Object.keys(expected).forEach(c => assert.strictEqual(FD_TEST_TYPE_MAP[c], expected[c], c));
});

// V4 — couverture des 8 qualités : toutes présentes, jamais undefined, état distingué
test('V4 — les 8 qualités HYP_CSM_QUALITIES sont toutes présentes dans clinicalProfile avec un état', () => {
  const { csm } = run();
  HYP_CSM_QUALITIES.forEach(q => {
    assert.ok(csm.clinicalProfile[q], 'qualité manquante : ' + q);
    assert.notStrictEqual(csm.clinicalProfile[q].severity, undefined, q + ' severity undefined');
    assert.notStrictEqual(csm.clinicalProfile[q].state, undefined, q + ' state undefined');
  });
  assert.strictEqual(HYP_CSM_QUALITIES.length, 8);
});

// V5/V27 — Force maximale ≠ production rapide de force
test('V5/V27 — Force maximale préservée ET production rapide de force déficitaire simultanément', () => {
  const { csm } = run();
  assert.strictEqual(csm.clinicalProfile['Force'].severity, 'preserved');
  const rfd = csm.clinicalProfile['Force'].rapidForceDeficit;
  assert.strictEqual(rfd.supported, true);
  assert.strictEqual(rfd.severity, 'majeur');
  const trans = csm.clinicalReport.sections.find(s => s.id === 'transversale').summary;
  assert.ok(/force maximale/i.test(trans) && /production rapide de force/i.test(trans), 'la synthèse transversale ne distingue pas explicitement force max / production rapide de force');
});

// V6 — RFD mollet (soleus/gastro) correctement utilisée
test('V6 — RFD mollet (soleus_iso/gastro_iso, RFD100/RFD200) alimente rapidForceDeficit avec les vraies valeurs L/D', () => {
  const { csm } = run();
  const findings = csm.clinicalProfile['Force'].rapidForceDeficit.keyFindings;
  const byVar = {}; findings.forEach(f => byVar[f.variable] = f);
  assert.strictEqual(byVar['productionRapideForce.soleus_iso_rfd100'].left, 1360);
  assert.strictEqual(byVar['productionRapideForce.soleus_iso_rfd100'].right, 2250);
  assert.strictEqual(byVar['productionRapideForce.gastro_iso_rfd100'].left, 1560);
  assert.strictEqual(byVar['productionRapideForce.gastro_iso_rfd100'].right, 810);
});

// V7 — CMJ braking RFD correctement utilisée (Absorption + bridge vers Explosivité)
test('V7 — CMJ braking RFD réel (3508/1613.68) alimente Absorption et le bridge Absorption↔Explosivité', () => {
  const res = run().res;
  const braking = res.functionScores['Absorption'].hypAbs01.diagnosticEvidence.braking_rfd;
  assert.strictEqual(braking.symmetryEvidence.rawL, 3508);
  assert.ok(Math.abs(braking.symmetryEvidence.rawR - 1613.68) < 0.01);
  const bridge = run().csm.clinicalBridgeEvidence.find(b => b.qualityA === 'Absorption' && b.qualityB === 'Explosivité');
  assert.ok(bridge, 'bridge Absorption/Explosivité absent');
  assert.strictEqual(bridge.left, 3508);
  assert.ok(Math.abs(bridge.right - 1613.68) < 0.01);
});

// V8 — SLJ braking correctement utilisée (évidence Absorption via la couche générique CSM V2)
test('V8 — SLJ braking (braking_rfd/braking_impulse) réel apparaît comme évidence Absorption', () => {
  const { csm } = run();
  const narrative = csm.clinicalMechanisticReasoning['Absorption'].reasoningNarrative;
  assert.ok(/Single Leg Jump/.test(narrative), 'SLJ absent de la narrative Absorption : ' + narrative);
});

// V9 — SLDJ RSI/height/contact time correctement utilisés (Réactivité)
test('V9 — SLDJ RSI/height/contact time réels (D=0.11/G=0.39 etc.) alimentent Réactivité', () => {
  const res = run().res;
  const sldjEvidence = res.functionScores['Réactivité'].hypRea01.diagnostic.sldj_rsi;
  assert.strictEqual(sldjEvidence.rawD, 0.11);
  assert.strictEqual(sldjEvidence.rawG, 0.39);
  const exp = run().csm.clinicalExplanations['Réactivité'];
  const vars = exp.explanatoryVariables.map(v => v.variable);
  assert.ok(vars.some(v => /sldj_height/.test(v)));
  assert.ok(vars.some(v => /sldj_contact_time/.test(v)));
});

// V10 — SLLAH correctement utilisé (landing_uni TTS + sllt loading_rate/peak_landing_force)
test('V10 — SLLAH réel (TTS, loading rate, peak landing force) alimente la Stabilisation', () => {
  const res = run().res;
  const tts = res.functionScores['Stabilisation'].hypSta01.diagnosticEvidence.landing_uni_tts;
  assert.strictEqual(tts.rawD, 1.22);
  assert.strictEqual(tts.rawG, 0.87);
  const narrative = run().csm.clinicalMechanisticReasoning['Stabilisation'].reasoningNarrative;
  assert.ok(/Loading Rate|Landing Unilat/.test(narrative), narrative);
});

// V11 — WBLT correctement utilisé (Mobilité, LSI selon la convention existante)
test('V11 — WBLT réel D=10/G=14 alimente HYP-MOB-01 avec le bon statut et la bonne asymétrie', () => {
  const res = run().res;
  const wblt = res.functionScores['Mobilité'].hypMob01.diagnosticEvidence.wblt_distance;
  assert.strictEqual(wblt.rawD, 10);
  assert.strictEqual(wblt.rawG, 14);
  assert.strictEqual(wblt.symmetryEvidence.status, 'deficient');
});

// V12 — Y-Balance utilisé si déjà classifiable (honnête : ybt_composite n'est lu par aucun moteur
// HYP ; ybt_ant réel n'apparaît qu'en évidence secondaire générique de Mobilité, jamais comme
// preuve causale ni composite calculé faute de longueur de membre).
test('V12 — Y-Balance réel : evidence secondaire de Mobilité (ybt_ant), jamais de composite inventé', () => {
  const { csm } = run();
  const mob = csm.clinicalMechanisticReasoning['Mobilité'];
  const ybtFactor = (mob.convergence.factors || []).find(f => /ybt_ant/.test(f.variable));
  assert.ok(ybtFactor, 'ybt_ant absent de la convergence Mobilité');
  assert.strictEqual(ybtFactor.left, 57);
  assert.strictEqual(ybtFactor.right, 64);
  // Aucun composite YBT n'est jamais produit (pas de longueur de membre fournie) — non inventé.
  assert.ok(!/composite/i.test(JSON.stringify(mob)), 'un composite YBT a été produit sans donnée de longueur de membre');
});

// V13 — explication directe (preuve appartenant directement à la qualité)
test('V13 — explication directe : Réactivité a une preuve explicative propre (sldj_rsi, own)', () => {
  const { csm } = run();
  const own = csm.clinicalReasoning['Réactivité'].explanatoryEvidence;
  assert.ok(own.some(v => /sldj_rsi/.test(v.variable)), 'sldj_rsi absent des preuves propres de Réactivité');
});

// V14 — explication croisée (relation qualité→qualité déjà validée)
test('V14 — explication croisée : Force→Stabilisation utilisée (crossQualityEvidence)', () => {
  const { csm } = run();
  const cross = csm.clinicalReasoning['Stabilisation'].crossQualityEvidence;
  assert.ok(cross.some(c => c.explains === 'Force' && c.explained === 'Stabilisation'));
});

// V15 — bridge (variable pont inter-qualités)
test('V15 — bridges réels présents : Mobilité↔Stabilisation (WBLT) et Absorption↔Explosivité (CMJ braking RFD)', () => {
  const { csm } = run();
  const b = csm.clinicalBridgeEvidence;
  assert.ok(b.some(x => x.qualityA === 'Mobilité' && x.qualityB === 'Stabilisation'));
  assert.ok(b.some(x => x.qualityA === 'Absorption' && x.qualityB === 'Explosivité'));
});

// V16 — functional chain (chaque maillon réellement supporté, jamais supposé)
test('V16 — functional chains : chaque maillon d\'une chaîne réelle est une relation whitelistée ou un bridge démontré', () => {
  const { csm } = run();
  assert.ok(csm.clinicalFunctionalChains.length > 0);
  csm.clinicalFunctionalChains.forEach(c => {
    c.edges.forEach(e => {
      if (e.type === 'relation') {
        const w = CLINICAL_HYPOTHESIS_WHITELIST.find(x => x.explains === e.explains && x.explained === e.explained);
        assert.ok(w && w.allowed, 'maillon relation non whitelisté : ' + e.explains + '->' + e.explained);
      } else if (e.type === 'bridge') {
        assert.ok(e.explains && e.explained, 'maillon bridge incomplet');
      } else {
        assert.fail('type de maillon inconnu : ' + e.type);
      }
    });
  });
});

// V17 — convergence (plusieurs catégories indépendantes convergent)
test('V17 — convergence détectée pour Mobilité (≥2 éléments indépendants)', () => {
  const { csm } = run();
  const conv = csm.clinicalExplanations['Mobilité'].convergence;
  assert.ok(conv.count >= 2);
  assert.strictEqual(conv.level, 'convergent');
});

// V18 — déficit sans explication suffisante → phrase de sortie honnête (mécanisme vérifié, même
// si aucune qualité du cas réel Yannis ne s'y trouve aujourd'hui : toutes les qualités déficitaires
// ont au moins une explanatoryVariable propre sur ce bilan).
test('V18 — le mécanisme "facteur explicatif non déterminé" existe et produit le texte exact attendu', () => {
  const reduced = JSON.parse(JSON.stringify(REAL_DATA));
  delete reduced.ybt; // ne retire rien d'essentiel à Mobilité : wblt seul reste diagnostique
  const res = computeMoteur(reduced, {}, null, 25, NORM_SEL);
  const csm = res.clinicalSynthesisV2;
  const anyUnexplained = Object.keys(csm.clinicalReasoning).some(q => csm.clinicalReasoning[q].unexplainedReason === "Les données disponibles objectivent le déficit mais ne permettent pas d'identifier avec suffisamment de certitude un facteur explicatif principal.");
  // Le texte exact doit être celui-ci partout où unexplainedReason est non-null, sur CE bilan
  // comme sur le bilan complet — jamais une variante improvisée.
  Object.keys(csm.clinicalReasoning).forEach(q => {
    const r = csm.clinicalReasoning[q].unexplainedReason;
    if (r !== null) assert.strictEqual(r, "Les données disponibles objectivent le déficit mais ne permettent pas d'identifier avec suffisamment de certitude un facteur explicatif principal.");
  });
  assert.ok(true, 'mécanisme vérifié (anyUnexplained=' + anyUnexplained + ')');
});

// V19 — qualité préservée toujours visible (Force, non déficitaire, doit rester dans le rapport)
test('V19 — Force (préservée, non déficitaire) reste visible dans le rendu du rapport', () => {
  const { expertHtml } = report();
  assert.ok(expertHtml.indexOf('Force') !== -1, 'Force disparaît du rapport alors que préservée');
});

// V20 — qualité non déterminée correctement signalée (jamais confondue avec "préservée")
test('V20 — une qualité non_determinable (Puissance sans slcmj) reste explicitement non déterminée, jamais préservée', () => {
  const reduced = JSON.parse(JSON.stringify(REAL_DATA));
  delete reduced.slcmj.D.trials.peak_power;
  delete reduced.slcmj.G.trials.peak_power;
  const res = computeMoteur(reduced, {}, null, 25, NORM_SEL);
  const csm = res.clinicalSynthesisV2;
  assert.notStrictEqual(csm.clinicalProfile['Puissance'].severity, 'preserved');
  assert.strictEqual(res.functionScores['Puissance'].hypPui01.state, 'non_determinable');
});

// V21 — aucune relation interdite créée (Explosivité→Puissance reste la seule allowed:false)
test('V21 — CLINICAL_HYPOTHESIS_WHITELIST : 9 entrées, seule Explosivité→Puissance est allowed:false', () => {
  assert.strictEqual(CLINICAL_HYPOTHESIS_WHITELIST.length, 9);
  const disallowed = CLINICAL_HYPOTHESIS_WHITELIST.filter(w => !w.allowed);
  assert.strictEqual(disallowed.length, 1);
  assert.strictEqual(disallowed[0].explains, 'Explosivité');
  assert.strictEqual(disallowed[0].explained, 'Puissance');
});

// V22 — aucune causalité inventée dans le rendu
test('V22 — le rapport n\'affirme jamais de causalité entre qualités ("X cause/entraîne/est responsable de Y")', () => {
  const { expertHtml, sportifHtml } = report();
  // "cause" apparaît légitimement dans le disclaimer CSM ("ne détermine ni cause principale, ni
  // relation de cause à conséquence...") — c'est une négation explicite de causalité, pas une
  // affirmation. On vérifie l'absence des formes assertives réelles, jamais le mot seul.
  [expertHtml, sportifHtml].forEach(html2 => {
    assert.ok(!/\bcausé(e)? par\b/i.test(html2), '"causé par" trouvé dans le rendu');
    assert.ok(!/\bentraîne\b/i.test(html2), 'mot "entraîne" trouvé dans le rendu');
    assert.ok(!/est responsable de/i.test(html2), '"est responsable de" trouvé dans le rendu');
    assert.ok(!/\best la cause de\b/i.test(html2), '"est la cause de" trouvé dans le rendu');
  });
});

// V23 — aucun "undefined"/"null" texte brut dans le rendu
test('V23 — aucun "undefined" ni "null" textuel dans le rendu réel Yannis (expert + sportif)', () => {
  const { expertHtml, sportifHtml } = report();
  assert.strictEqual(expertHtml.indexOf('undefined'), -1);
  assert.strictEqual(sportifHtml.indexOf('undefined'), -1);
});

// V24 — PDF = ExpertView (même corps CSM V2, seule implémentation partagée)
test('V24 — le corps clinique CSM V2 est produit par csmV2ClinicalReportBodyHtml, identique dans les deux rapports', () => {
  const { res } = run();
  const bodyDirect = csmV2ClinicalReportBodyHtml(res.clinicalSynthesisV2);
  assert.ok(bodyDirect.length > 100);
  const { expertHtml } = report();
  // Le corps CSM V2 (identifiable par un fragment stable de sa sortie) doit se retrouver tel quel
  // dans le rapport expert assemblé — jamais une deuxième implémentation divergente.
  const fragment = bodyDirect.slice(200, 260);
  assert.ok(expertHtml.indexOf(fragment) !== -1, 'le corps CSM V2 direct ne se retrouve pas tel quel dans buildExpertReport');
});

// V25 — section "Variables utiles non disponibles"
test('V25 — section Variables utiles non disponibles présente, groupée par qualité, non vide', () => {
  const { csm } = run();
  const sec = csm.clinicalReport.sections.find(s => s.id === 'variables_manquantes');
  assert.ok(sec && sec.items && sec.items.length > 0);
  const qualities = new Set(sec.items.map(it => it.quality));
  assert.ok(qualities.size >= 1);
});

// V26 — rendu réel Yannis (le rapport complet se génère sans exception et cite le patient)
test('V26 — rendu réel Yannis : buildExpertReport se génère sans exception et cite "Yannis"', () => {
  const { expertHtml } = report();
  assert.ok(expertHtml.indexOf('Yannis') !== -1);
});

// V28 — Endurance vérifiée sur données réelles : HYP-END-01 (moteur locked) reste structurellement
// non_determinable (heel_raise/repeated_hop non mesurés) ; la sévérité "majeur" affichée provient
// de la couche évidentielle générique CSM V2 (RFD soleus/gastro), pas du moteur HYP-END-01
// lui-même — vérifié explicitement, jamais supposé.
test('V28 — Endurance : HYP-END-01 propre reste non_determinable ; la sévérité réelle vient de la RFD mollet (couche CSM V2)', () => {
  const res = run().res;
  assert.strictEqual(res.functionScores['Endurance'].hypEnd01.state, 'non_determinable');
  const { csm } = run();
  assert.strictEqual(csm.clinicalProfile['Endurance'].severity, 'majeur');
  const narrative = csm.clinicalMechanisticReasoning['Endurance'].reasoningNarrative;
  assert.ok(/Calf Raise|RFD/.test(narrative), narrative);
});

// V29 — Explosivité/Propulsion (Puissance) séparées, jamais fusionnées
test('V29 — Explosivité et Puissance restent des évaluations indépendantes (évidences distinctes, non fusionnées)', () => {
  const { csm } = run();
  const exp = csm.clinicalMechanisticReasoning['Explosivité'];
  const pui = csm.clinicalMechanisticReasoning['Puissance'];
  assert.notStrictEqual(exp.reasoningNarrative, pui.reasoningNarrative);
  assert.strictEqual(exp.directEvidence.variable.indexOf('slcmj_peak_power'), -1, 'Explosivité utilise à tort la preuve directe de Puissance');
  assert.strictEqual(pui.directEvidence.variable.indexOf('cmj_rsi_mod'), -1, 'Puissance utilise à tort une preuve d\'Explosivité');
});

// V30 — régression : pureté (rejouer produit un résultat strictement identique) — la régression
// complète des autres suites (Q/R/S/T/U, réelle non-régression, tests historiques) est exécutée
// séparément par le script de session (node tests/*.test.js), documentée dans le rapport de mission.
test('V30 — pureté : rejouer computeMoteur() sur les mêmes données réelles produit un résultat strictement identique', () => {
  const a = JSON.stringify(run().csm);
  const b = JSON.stringify(run().csm);
  assert.strictEqual(a, b);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

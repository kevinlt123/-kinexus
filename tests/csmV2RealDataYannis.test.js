// CSM V2 — non-régression sur données réelles (Yannis Briant), en remplacement de la fixture
// synthétique utilisée pendant le développement des missions O à U du moteur de raisonnement
// clinique CSM V2 (computeCsmV2, index.html).
//
// Provenance : 9 exports ForceDecks réels (SLSTICR, CMJ, SLSEICR, IBSQT, SLJ, HJ, SLLAH, SLDJ, DJ)
// + WBLT/Y-Balance saisis manuellement par le praticien, fournis le 2026-08-27. Chaque valeur
// ci-dessous est reprise telle quelle depuis les CSV (colonnes exactes vérifiées via
// csv.DictReader — cf. historique de session), sans arrondi ni approximation ajoutés.
//
// Convention Kinexus : D (Droit) = colonne "R" (Right) du CSV ForceDecks, G (Gauche) = colonne
// "L" (Left). Pour les paires asymétriques sans colonnes (L)/(R) dédiées (ex : CMJ bilatéral, qui
// ne fournit qu'une valeur agrégée + un % d'asymétrie nommé), le côté nommé dans l'annotation
// "(Asym)(%)" porte la valeur agrégée telle quelle ; l'autre côté est dérivé de
// asym% = |grand-petit|/grand (formule confirmée par recoupement sur les tests à colonnes
// (L)/(R) explicites, où elle reproduit exactement les deux valeurs publiées).
//
// Note HJ (Hop Test bilatéral) : le fichier fourni ne comporte aucune colonne (L)/(R) — aucune
// asymétrie n'y est mesurable — et sa clé interne (repeated_hop_bi) n'est consommée par aucun
// moteur HYP du code actuel. Son intégration clinique réelle nécessiterait soit un seuil de
// classification inventé (interdit), soit un nouveau moteur HYP additif (hors périmètre de ce
// commit, signalé au praticien comme item de mission future). HJ n'apparaît donc pas ci-dessous.
//
// Exécution : node tests/csmV2RealDataYannis.test.js — aucune dépendance externe.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

const start = code.indexOf('var C={');
const end = code.indexOf('// ── SUPABASE CONFIG');
if (start < 0 || end < 0) throw new Error('Impossible de localiser computeMoteur() dans index.html.');
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

const REAL_DATA = {
  wblt: { active: true, D: { trials: { distance: [10] } }, G: { trials: { distance: [14] } } },
  ybt: { active: true, D: { trials: { ant: [55, 56, 57] } }, G: { trials: { ant: [63, 64, 64] } } },
  // SLSEICR (Single Leg Seated Isometric Calf Raise) → soleus_iso
  soleus_iso: { active: true, D: { trials: { n: [812], rfd100: [1360], rfd200: [1450] } }, G: { trials: { n: [879], rfd100: [2250], rfd200: [2055] } } },
  // SLSTICR (Single Leg Standing Isometric Calf Raise) → gastro_iso
  gastro_iso: { active: true, D: { trials: { n: [1406], rfd100: [1560], rfd200: [1415] } }, G: { trials: { n: [1411], rfd100: [810], rfd200: [890] } } },
  // IBSQT bilatéral
  iso_belt_squat: { active: true, trials: { n: [4272] } },
  // CMJ bilatéral — Peak Power/BM = 46.1 W/kg ; Eccentric Deceleration RFD agrégé = 3508 N/s,
  // asym 54% côté L (côté nommé = valeur agrégée ; R dérivé = 3508 * (1 - 0.54))
  cmj: { active: true, trials: { peak_power: [46.1], ecc_decel_rfd_L: [3508], ecc_decel_rfd_R: [3508 * 0.46] } },
  // SLJ (Single Leg Jump) → slcmj
  slcmj: { active: true, D: { trials: { braking_impulse: [17.2], braking_rfd: [789], peak_braking_force: [11.6] } }, G: { trials: { braking_impulse: [53.9], braking_rfd: [3172], peak_braking_force: [17.0] } } },
  // SLDJ (Single Leg Drop Jump)
  sldj: { active: true, D: { trials: { rsi: [0.11], height: [5.4], contact_time: [520] } }, G: { trials: { rsi: [0.39], height: [14.2], contact_time: [374] } } },
  // DJ bilatéral
  dj: { active: true, trials: { rsi: [0.72] } },
  // SLLAH (Single Leg Land And Hold) → landing_uni (TTS) + sllt (force/vitesse de charge)
  landing_uni: { active: true, D: { trials: { tts: [1.22] } }, G: { trials: { tts: [0.87] } } },
  sllt: { active: true, D: { trials: { peak_landing_force: [4.76], loading_rate: [106100] } }, G: { trials: { peak_landing_force: [4.55], loading_rate: [52060] } } }
};
const NORM_SEL = { cmj: { population_vald: "College - Men's Swimming", source_id: 'S001', sexe: 'Unknown', age_band: null }, iso_belt_squat: 'belt_netball_super_league_f' };

function run() {
  const res = computeMoteur(REAL_DATA, {}, null, 25, NORM_SEL);
  return res.clinicalSynthesisV2;
}

console.log('CSM V2 — non-régression données réelles Yannis Briant');

test('Profil global : 8 qualités présentes avec la sévérité attendue sur données réelles', () => {
  const csm = run();
  const expected = {
    'Mobilité': 'majeur', 'Réactivité': 'majeur', 'Absorption': 'majeur',
    'Force': 'preserved', 'Puissance': 'null', 'Explosivité': 'modere',
    'Stabilisation': 'majeur', 'Endurance': 'majeur'
  };
  Object.keys(expected).forEach(q => {
    assert.ok(csm.clinicalProfile[q], 'qualité manquante : ' + q);
    assert.strictEqual(String(csm.clinicalProfile[q].severity), expected[q], q + ' : sévérité attendue ' + expected[q] + ', obtenu ' + csm.clinicalProfile[q].severity);
  });
});

test('rapidForceDeficit (Force) : déficit majeur objectivé par 4 findings soleus/gastro RFD', () => {
  const csm = run();
  const rfd = csm.clinicalProfile['Force'].rapidForceDeficit;
  assert.strictEqual(rfd.supported, true);
  assert.strictEqual(rfd.severity, 'majeur');
  assert.strictEqual(rfd.keyFindings.length, 4);
});

test('Rapport : sections transversale / conclusion / organisation_fonctionnelle non vides', () => {
  const csm = run();
  ['transversale', 'conclusion', 'organisation_fonctionnelle'].forEach(id => {
    const sec = csm.clinicalReport.sections.find(s => s.id === id);
    assert.ok(sec, 'section manquante : ' + id);
    const txt = sec.summary || sec.text;
    assert.ok(txt && txt.length > 20, 'section vide ou trop courte : ' + id);
  });
});

test('Raisonnement mécanistique : narrative présente pour chaque qualité déficitaire', () => {
  const csm = run();
  ['Mobilité', 'Réactivité', 'Absorption', 'Explosivité', 'Stabilisation', 'Endurance'].forEach(q => {
    const mr = csm.clinicalMechanisticReasoning[q];
    assert.ok(mr && mr.reasoningNarrative && mr.reasoningNarrative.length > 20, 'narrative manquante ou vide : ' + q);
  });
});

test('Bridges fonctionnels réels : Mobilité↔Stabilisation (WBLT) et Absorption↔Explosivité (CMJ braking RFD)', () => {
  const csm = run();
  const orga = csm.clinicalReport.sections.find(s => s.id === 'organisation_fonctionnelle').text;
  assert.ok(orga.indexOf('Mobilité') !== -1 && orga.indexOf('Stabilisation') !== -1, 'bridge Mobilité/Stabilisation absent du texte');
  assert.ok(orga.indexOf('Absorption') !== -1 && orga.indexOf('Explosivité') !== -1, 'bridge Absorption/Explosivité absent du texte');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);

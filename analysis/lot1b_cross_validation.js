// LOT 1B — Validation croisée TFM.mobilite <-> HYP-MOB-01.
//
// Outil d'analyse HORS PRODUCTION. Ne modifie, n'importe et n'appelle rien depuis index.html au
// sens applicatif : il évalue le fichier dans un processus Node isolé pour accéder en LECTURE
// SEULE à computeMoteur()/computeTestStatus()/effectiveNormPop() (les fonctions réelles), et
// charge séparément hyp_engine_lot1.js (LOT 1). Aucune UI, aucun Shadow Mode, aucune écriture
// dans index.html.
//
// Décompose la divergence TFM <-> HYP en DEUX effets mesurés séparément plutôt que confondus :
//   (1) "dilution" — TFM.mobilite agrège wblt (poids 3) + df_iso/inv_iso/ev_iso/ybt (poids 1-2),
//       alors que HYP-MOB-01 ne lit que wblt (règle Vierge_7 : "la mobilité de cheville repose
//       exclusivement sur ce test", déjà actée dans HYP_ARCHITECTURE_PHASE_C.md).
//   (2) "modèle d'état" — même pour wblt SEUL, computeTestStatus() pondère le signal LSI (poids 3)
//       et applique une escalade catégorielle (statut rouge direct -> plafond jaune ; ≥2
//       signaux majeurs -> orange), alors que computeHypothesisEngine() (LOT 1) retient
//       uniquement "un côté rouge/orange => déficitaire", sans LSI ni escalade.
//
// Usage :
//   node analysis/lot1b_cross_validation.js [chemin/vers/bilans.json]
//
// Sans argument : utilise un jeu de bilans SYNTHÉTIQUES (voir SYNTHETIC_BILANS ci-dessous),
// explicitement construits pour exercer les deux effets ci-dessus — PAS des bilans réels. Voir
// LOT1B_CROSS_VALIDATION_REPORT.md, section "Limite méthodologique", pour la raison : aucun
// corpus de bilans réels n'est accessible dans cet environnement (persistance uniquement en
// localStorage navigateur, jamais exportée ni committée dans le dépôt).
//
// Format attendu du fichier JSON, si fourni : un tableau d'objets
// { id, athlete: {normPopulation, sexe, dateNaissance|age}, testData: {...} }.

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.filter(s => !s.includes('cdnjs')).join('\n');

// Même tranche que tests/rapportMouvementPDF.test.js — seule tranche déjà prouvée, dans ce
// dépôt, pour exposer computeMoteur()/computeTestStatus()/effectiveNormPop() sans erreur de
// chargement (couvre l'intégralité du corps de calcul, s'arrête avant le bootstrap React).
const start = code.indexOf('var C={');
const end = code.indexOf("ReactDOM.createRoot(document.getElementById('root'))");
if (start < 0 || end < 0) throw new Error('Impossible de localiser le corps de calcul dans index.html.');
const slice = code.slice(start, end);

global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
eval(slice);
eval(fs.readFileSync(path.join(__dirname, '..', 'hyp_engine_lot1.js'), 'utf8'));

var deps = { applyThr: applyThr, bestVal: bestVal, autoLSI: autoLSI };

// ────────────────────────────────────────────────────────────────────────────────────────────
// Jeu de bilans SYNTHÉTIQUES — voir avertissement en tête de fichier.
// ────────────────────────────────────────────────────────────────────────────────────────────
function uni(kpiKey, vD, vG) {
  var trials = {}; trials[kpiKey] = [vD];
  var trialsG = {}; trialsG[kpiKey] = [vG];
  return { active: true, D: { trials: trials }, G: { trials: trialsG } };
}
function wblt(vD, vG) { return uni('distance', vD, vG); }
function dfIso(vD, vG) { return uni('n', vD, vG); }
function ybtGood() { return { active: true, D: { trials: { ant: [70], pm: [90], pl: [85], composite: [95] } }, G: { trials: { ant: [70], pm: [90], pl: [85], composite: [95] } } }; }
function ybtBad() { return { active: true, D: { trials: { ant: [40], pm: [55], pl: [50], composite: [55] } }, G: { trials: { ant: [40], pm: [55], pl: [50], composite: [55] } } }; }

var SYNTHETIC_BILANS = [
  { id: 'B01-concordant-normal', athlete: {}, testData: {
    wblt: wblt(14, 14), df_iso: dfIso(300, 300), inv_iso: dfIso(200, 200), ev_iso: dfIso(200, 200), ybt: ybtGood()
  } },
  { id: 'B02-concordant-deficitaire-uniforme', athlete: {}, testData: {
    wblt: wblt(6, 6), df_iso: dfIso(80, 80), inv_iso: dfIso(60, 60), ev_iso: dfIso(60, 60), ybt: ybtBad()
  } },
  { id: 'B03-dilution-tfm-masque-hyp-positif', athlete: {}, testData: {
    wblt: wblt(6, 6), df_iso: dfIso(300, 300), inv_iso: dfIso(200, 200), ev_iso: dfIso(200, 200), ybt: ybtGood()
  } },
  { id: 'B04-dilution-tfm-signale-hyp-absent', athlete: {}, testData: {
    wblt: wblt(14, 14), df_iso: dfIso(80, 80), inv_iso: dfIso(60, 60), ev_iso: dfIso(60, 60), ybt: ybtBad()
  } },
  { id: 'B05-wblt-seul-lsi-faible-cotes-normaux', athlete: {}, testData: {
    // Chaque côté individuellement >= seuil orange (8) mais LSI dégradé (asymétrie D/G marquée) —
    // isole l'effet "LSI pondéré" de computeTestStatus(), absent de HYP-MOB-01.
    wblt: wblt(9, 15)
  } },
  { id: 'B06-asymetrie-franche-un-cote-rouge', athlete: {}, testData: {
    wblt: wblt(4, 14), df_iso: dfIso(300, 300), inv_iso: dfIso(200, 200), ev_iso: dfIso(200, 200), ybt: ybtGood()
  } },
  { id: 'B07-wblt-indisponible', athlete: {}, testData: {
    df_iso: dfIso(300, 300), ybt: ybtGood()
  } },
  { id: 'B08-wblt-seul-aucun-autre-test-actif-deficitaire', athlete: {}, testData: {
    wblt: wblt(6, 6)
  } },
  { id: 'B09-wblt-seul-aucun-autre-test-actif-normal', athlete: {}, testData: {
    wblt: wblt(14, 14)
  } },
  { id: 'B10-borderline-jaune-des-deux-cotes', athlete: {}, testData: {
    wblt: wblt(10, 10), df_iso: dfIso(300, 300), inv_iso: dfIso(200, 200), ev_iso: dfIso(200, 200), ybt: ybtGood()
  } }
];

var inputPath = process.argv[2];
var bilans = SYNTHETIC_BILANS;
var usingSynthetic = true;
if (inputPath) {
  bilans = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  usingSynthetic = false;
}

// ────────────────────────────────────────────────────────────────────────────────────────────
function deficit(status) {
  if (status == null) return null;
  return status === 'rouge' || status === 'orange';
}
function fmtDef(d) { return d === null ? 'indisponible' : (d ? 'déficitaire' : 'normal'); }

var rows = [];
bilans.forEach(function (b) {
  var athlete = b.athlete || {};
  var age = athlete.age || 25;
  var pop = null;
  try { pop = effectiveNormPop(athlete); } catch (e) { pop = null; }

  var res = computeMoteur(b.testData || {}, {}, pop, age);
  var tfmFull = res.functionScores['Mobilité']; // undefined si aucune couverture

  var wbltOnlyTFM = null;
  if ((b.testData || {}).wblt) {
    wbltOnlyTFM = computeTestStatus('wblt', b.testData.wblt, pop, age);
  }

  var hypRes = computeHypothesisEngine(b.testData || {}, pop, age, deps);
  var hyp = hypRes.hypotheses['HYP-MOB-01'];

  var dTfmFull = tfmFull ? deficit(tfmFull.status) : null;
  var dWbltOnly = deficit(wbltOnlyTFM);
  var dHyp = hyp.state === 'retenue_faible';

  var otherTestsActive = ['df_iso', 'inv_iso', 'ev_iso', 'ybt'].some(function (k) { return (b.testData || {})[k] && (b.testData || {})[k].active; });

  var concordant = dTfmFull === dHyp;
  var cause = '—';
  if (!concordant) {
    var dilutionEffect = otherTestsActive && dTfmFull !== dWbltOnly;
    var modeleEffect = dWbltOnly !== dHyp && dWbltOnly !== null;
    if (dTfmFull == null || dHyp == null && wbltOnlyTFM == null) {
      cause = 'anomalie potentielle (couverture manquante à vérifier)';
    } else if (dilutionEffect && !modeleEffect) {
      cause = 'différence attendue (dilution TFM sur df_iso/inv_iso/ev_iso/ybt)';
    } else if (modeleEffect && !dilutionEffect) {
      cause = 'différence due au modèle d\'état (LSI pondéré + escalade dans computeTestStatus, absents de HYP-MOB-01)';
    } else if (dilutionEffect && modeleEffect) {
      cause = 'différence attendue (dilution) ET différence de modèle — deux effets cumulés';
    } else {
      cause = 'anomalie potentielle (divergence non expliquée par dilution ni par le modèle d\'état)';
    }
  }

  rows.push({
    id: b.id || '(sans id)',
    tfmStatus: tfmFull ? tfmFull.status : '(non couvert)',
    tfmDeficit: fmtDef(dTfmFull),
    wbltOnlyStatus: wbltOnlyTFM || '(indisponible)',
    hypState: hyp.state,
    hypDeficit: fmtDef(dHyp),
    diagEvidence: hyp.diagnosticEvidence.map(function (e) { return e.testKey + '_' + e.kpiKey + '=' + e.status; }).join(', '),
    confEvidence: hyp.confirmativeEvidence.map(function (e) { return e.testKey + '_' + e.kpiKey + '=' + e.status; }).join(', '),
    concordant: concordant,
    cause: cause
  });
});

// ────────────────────────────────────────────────────────────────────────────────────────────
// Rapport
// ────────────────────────────────────────────────────────────────────────────────────────────
var lines = [];
lines.push('# LOT 1B — Résultat de la validation croisée TFM.mobilite ↔ HYP-MOB-01');
lines.push('');
lines.push('*Généré par `analysis/lot1b_cross_validation.js` — ' + new Date().toISOString() + '*');
lines.push('');
if (usingSynthetic) {
  lines.push('**⚠️ Jeu de données SYNTHÉTIQUE** — aucun bilan réel n\'a été fourni en argument ' +
    '(`node analysis/lot1b_cross_validation.js chemin/vers/export.json`). Les 10 bilans ci-dessous ' +
    'sont construits pour exercer délibérément les deux effets de divergence identifiés (dilution, ' +
    'modèle d\'état), pas pour représenter une population réelle. Voir la section "Limite ' +
    'méthodologique" du rapport pour les instructions d\'export d\'un corpus réel.');
} else {
  lines.push('Bilans chargés depuis `' + inputPath + '`.');
}
lines.push('');
lines.push('| Bilan | TFM (statut / déficit) | HYP-MOB-01 (état / déficit) | Concordant ? | Cause |');
lines.push('|---|---|---|---|---|');
rows.forEach(function (r) {
  lines.push('| ' + r.id + ' | ' + r.tfmStatus + ' / ' + r.tfmDeficit + ' | ' + r.hypState + ' / ' + r.hypDeficit +
    ' | ' + (r.concordant ? '✅ Oui' : '❌ Non') + ' | ' + r.cause + ' |');
});
lines.push('');
lines.push('## Détail des preuves par bilan');
lines.push('');
lines.push('| Bilan | Preuve diagnostique (HYP) | Preuve confirmative (HYP) | Statut wblt seul (TFM, `computeTestStatus`) |');
lines.push('|---|---|---|---|');
rows.forEach(function (r) {
  lines.push('| ' + r.id + ' | ' + r.diagEvidence + ' | ' + r.confEvidence + ' | ' + r.wbltOnlyStatus + ' |');
});

var total = rows.length;
var concordantCount = rows.filter(function (r) { return r.concordant; }).length;
var discordantCount = total - concordantCount;
var causeCounts = {};
rows.filter(function (r) { return !r.concordant; }).forEach(function (r) {
  causeCounts[r.cause] = (causeCounts[r.cause] || 0) + 1;
});

lines.push('');
lines.push('## Résumé');
lines.push('');
lines.push('- **Bilans analysés** : ' + total);
lines.push('- **Taux de concordance** : ' + concordantCount + '/' + total + ' (' + Math.round(100 * concordantCount / total) + ' %)');
lines.push('- **Taux de divergence** : ' + discordantCount + '/' + total + ' (' + Math.round(100 * discordantCount / total) + ' %)');
lines.push('');
lines.push('### Typologie des divergences');
lines.push('');
if (discordantCount === 0) {
  lines.push('Aucune divergence observée sur ce jeu de bilans.');
} else {
  Object.keys(causeCounts).forEach(function (c) {
    lines.push('- ' + causeCounts[c] + ' — ' + c);
  });
}

var report = lines.join('\n') + '\n';
console.log(report);
fs.writeFileSync(path.join(__dirname, '..', 'LOT1B_CROSS_VALIDATION_REPORT.md'), report);

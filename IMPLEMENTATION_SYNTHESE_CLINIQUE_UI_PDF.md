# Implémentation — Optimisation du rendu de la Synthèse clinique HYP-CSM-01

Suite directe de `AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md`. Diff : `index.html` **+68/-11 lignes**
(`git diff --stat`), un seul fichier de code modifié, un fichier de test ajouté. Aucune ligne des 8
moteurs HYP, de `computeHypClinicalSynthesis01()`, `HYP_QUALITY_RELATIONS`, `TFM`, `VAR_REL3`,
`priorities`, `statusPriorityRank()` n'est touchée (confirmé par lecture du diff : les 5 zones
modifiées sont toutes à l'intérieur de `buildSportifReport`, `buildExpertReport`, `ExpertView`, ou
la nouvelle constante globale `CSM_STATE_LABEL`).

---

## 1. `CSM_STATE_LABEL` — vocabulaire unique partagé UI + PDF

**Avant** : aucune table de libellés dans le PDF (la phrase narrative brute de CSM était affichée
telle quelle, avec un risque de fuite d'enum) ; l'UI définissait sa propre table **locale**, à
l'intérieur du bloc `tab==='synthese'`, avec un accord grammatical légèrement différent
(`'Confirmée — support faible'`, féminin).

**Après** : une seule constante globale, déclarée juste avant `computeMoteur(`, consommée
identiquement par l'UI, `buildSportifReport` et `buildExpertReport` :

```js
var CSM_STATE_LABEL={non_determinable:'Non déterminable',absente:'Absente',suspectee:'Suspectée',
  retenue_faible:'Confirmé — support faible',retenue_moderee:'Confirmé — support modéré',
  retenue_forte:'Confirmé — support fort'};
```

Pourquoi côté présentation et pas côté `computeHypClinicalSynthesis01` : la fonction produit un
`state` interne (`retenue_faible`, etc.) volontairement générique — c'est à la couche
d'affichage de choisir comment le traduire pour un contexte donné (UI compacte vs PDF imprimé). Ne
change aucune valeur produite par CSM, uniquement son étiquette affichée.

## 2. Correction des deux bugs "undefined"

### 2.1 `buildSportifReport` — `badge(s,txt)`

**Avant** :
```js
function badge(s,txt){return '<span ...background:'+bgMap[s]+';color:'+txtMap[s]+'">'+(txt||lblMap[s])+'</span>';}
```
Pour `s===null` (qualité `non_determinable`), `bgMap[null]`/`txtMap[null]`/`lblMap[null]` valent
tous `undefined` → le HTML généré contient littéralement le texte `"undefined"`.

**Après** :
```js
function badge(s,txt){
  if(!s)return '<span style="...background:#F1F5F9;color:#64748B">'+(txt||'Non déterminable')+'</span>';
  return '<span style="...background:'+bgMap[s]+';color:'+txtMap[s]+'">'+(txt||lblMap[s])+'</span>';
}
```
Comportement pour `s` non-null strictement inchangé (branche existante non modifiée, seule une
branche de garde ajoutée en amont).

### 2.2 `buildExpertReport` — table "Fonctions évaluées"

**Avant** :
```js
FUNCTIONS.forEach(function(fn){var sc=fSc[fn];if(!sc)return;
  html+='<tr><td>'+fn+'</td><td><span class="print-badge '+sc.status+'">'+SL[sc.status]+'</span></td>...';});
```
Même défaut : `sc.status===null` → classe CSS `"print-badge null"` (sans style associé) et
`SL[null]===undefined`, affiché tel quel.

**Après** :
```js
FUNCTIONS.forEach(function(fn){var sc=fSc[fn];if(!sc)return;
  var statusHtml=sc.status?'<span class="print-badge '+sc.status+'">'+SL[sc.status]+'</span>'
    :'<span class="print-badge" style="background:#F1F5F9;color:#64748B">Non déterminable</span>';
  html+='<tr><td>'+fn+'</td><td>'+statusHtml+'</td>...';});
```

Vérifié par capture d'écran réelle avant/après (voir audit §1.2/§20) : les deux PDF affichent
désormais un badge gris "Non déterminable" propre, plus jamais le texte "undefined".

## 3. Phrase "déficits objectivés" — vocabulaire clinique plutôt qu'enum brut

Dans `buildSportifReport` et `buildExpertReport`, reconstruction locale de la phrase à partir des
champs structurés déjà produits par CSM (`objectified`), au lieu d'afficher
`csmPdf.narrative.deficitsObjectives` telle quelle :

```js
var csmDeficitsTxt = csmPdf.objectified.length
  ? 'Un déficit est objectivé pour : '+csmPdf.objectified.map(function(o){
      return o.quality+' ('+(CSM_STATE_LABEL[o.state]||o.state).toLowerCase()+')';
    }).join(', ')+'.'
  : csmPdf.narrative.deficitsObjectives;
```

Les mêmes qualités, dans le même état — seule la mise en mots change. Le fallback
`csmPdf.narrative.deficitsObjectives` (phrase originale de CSM) est conservé pour le cas où
`objectified` est vide, garantissant qu'aucune information n'est perdue si la structure évolue.
`narrative.qualitesNonDeterminables` et `narrative.limites` restent utilisés **mot pour mot**,
non modifiés (déjà rédigés en français clinique propre, confirmé lors de l'audit).

## 4. Séparation "Relations explicatives possibles" / "Concordances (sans relation documentée)"

Remplace, dans les trois emplacements (UI, PDF sportif, PDF expert), l'unique bloc fusionné
(`csm.narrative.relationsExplicatives`, un paragraphe unique) par une lecture séparée de deux
champs déjà structurés par CSM (aucun nouveau calcul) :

```js
var concordances = csm.relationships.filter(function(r){ return r.level==='concordant_no_relation'; });
```
- `csm.explanatoryHypotheses` (déjà pré-filtré par CSM, `level==='explanatory_hypothesis'`) → bloc
  "Relations explicatives possibles", accent visuel distinct (bordure gauche teal en UI et PDF
  sportif ; libellé majuscule discret en PDF expert).
- `concordances` (filtré localement, lecture seule) → bloc "Concordances (sans relation
  documentée)", style plus neutre/muted.

Chaque bloc n'apparaît que si le tableau correspondant n'est pas vide ; sinon un message explicite
("Aucune — …") en UI, rien en PDF (évite un bloc vide dans un document imprimé).

## 5. Fichier de test ajouté

`tests/hypCsmSynthesisPresentation.test.js` — 18 tests, détaillés dans l'audit §18. Exerce le
pipeline réel : `computeMoteur()` → `buildFullReportHtml('sportif'|'expert', …)`, jamais une
fonction isolée réécrite en parallèle.

## 6. Ce qui n'a volontairement pas été modifié

- L'ordre des blocs (déficits → non-déterminable → relations → concordances → limites) : jugé déjà
  conforme au modèle à 4 niveaux visé par la mission.
- Les couleurs/styles de badges existants (`bgMap`/`txtMap`/`lblMap`, `Badge` React,
  `print-badge` CSS) : repris à l'identique, aucune nouvelle palette introduite.
- `csm.narrative.qualitesNonDeterminables` et `csm.narrative.limites` : utilisés mot pour mot,
  déjà clairs.
- La vue `AnalyseView` (gauge-list `SL[status]`, ~ligne 7977) et l'occurrence `ord[status]||0` de
  `HistoriqueView` (`index.html:8528`) : signalées dans l'audit, hors périmètre strict de cette
  mission, non modifiées.
- Aucune fiche de qualité individuelle (onglets Fonctions/Résultats/Variables/Capacités) : non
  touchée, la Synthèse clinique reste une passerelle vers elles, pas un remplacement.

## 7. Résultat final

- Diff : `index.html` +68/-11 lignes ; `tests/hypCsmSynthesisPresentation.test.js` créé (nouveau).
- Suite complète : 29 fichiers `tests/*.test.js`, **0 échec**.
- `node --check` sur le script extrait : `SYNTAX_OK`.
- Rendu réel vérifié par capture d'écran (PDF sportif et PDF expert, scénario à 3 qualités rouges +
  qualités non déterminables + concordance TFM) : plus de texte "undefined", vocabulaire clinique
  cohérent entre UI et PDF, relations explicatives et concordances visuellement distinctes.

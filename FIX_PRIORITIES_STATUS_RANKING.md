# Correction — bug de tri des statuts dans `priorities`

## Statut

Correction ciblée, diff minimal (`index.html` : **+6/-1 lignes**, `git diff --stat`). Aucun moteur
HYP, `computeHypClinicalSynthesis01`, `HYP_QUALITY_RELATIONS`, `TFM`, `VAR_REL3`, `capaciteScores`,
seuil, norme, convergence, couleur ou élément de design n'a été modifié. 28 fichiers
`tests/*.test.js` (27 préexistants + 1 nouveau), 0 échec.

---

## 1. Bug identifié

`index.html:6022` (avant correction) :

```js
var deficits=FUNCTIONS.filter(function(fn){return fSc[fn]&&(fSc[fn].status==='rouge'||fSc[fn].status==='orange');})
  .sort(function(a,b){return({rouge:0,orange:1}[fSc[a].status]||2)-({rouge:0,orange:1}[fSc[b].status]||2);})
  .slice(0,3);
```

## 2. Pourquoi `0 || 2` était incorrect

`{rouge:0,orange:1}['rouge']` vaut littéralement `0`. En JavaScript, `0` est une valeur "falsy" —
l'opérateur `||` l'ignore et retombe sur l'opérande de droite. `0 || 2` vaut donc `2`, pas `0`.
`{rouge:0,orange:1}['orange']` vaut `1`, une valeur "truthy" — `1 || 2` vaut `1`, la valeur
attendue. Résultat : **`rouge` obtenait le rang réel `2` (pire), `orange` le rang `1` (meilleur)** —
l'inverse exact de l'intention du code (`rouge:0` dans la table voulait dire "priorité la plus
haute"). Confirmé isolément, hors de toute logique métier :

```js
var fSc={A:{status:'rouge'},B:{status:'orange'}};
({rouge:0,orange:1}[fSc.A.status]||2) // -> 2 (rouge, faussement "pire" que orange)
({rouge:0,orange:1}[fSc.B.status]||2) // -> 1 (orange, faussement "meilleur" que rouge)
```

Ni les 8 moteurs HYP, ni CSM (`computeHypClinicalSynthesis01`), ni `TFM`/`VAR_REL3` n'utilisent ce
comparateur — recherche exhaustive effectuée (`AUDIT_COHERENCE_NARRATIVE_CSM_VS_LEGACY.md` puis
revérifiée pour cette mission) sur toutes les occurrences de `{rouge:0,...}` dans `index.html` (9
occurrences trouvées, une seule utilisait le pattern fautif `||`) — les 8 autres comparent les rangs
directement (`rank[b]<rank[a]?b:a` ou soustraction directe `STATUS_RANK[a]-STATUS_RANK[b]`, sans
`||`, donc jamais affectées par cette faiblesse). **Seule `priorities` (via `deficits`) était
concernée.**

Une occurrence apparentée (mais non fautive dans son résultat, jamais causalement liée au bug
reproduit) a été repérée à titre de vigilance et volontairement **non touchée**, conformément au
périmètre strict de cette mission (« ne corriger que les occurrences réellement liées au classement
des statuts [dans `priorities`] ») : `index.html:8528`,
`var ord={vert:3,jaune:2,orange:1,rouge:0}` (comparaison d'évolution entre deux bilans,
`HistoriqueView`) utilise aussi `ord[status]||0` — mais le fallback (`0`) coïncide ici avec le rang
légitime de `rouge` (`0`), donc rouge n'est jamais mal classé par rapport à orange/jaune/vert dans
cette vue. Un risque résiduel plus étroit existe (un statut `null`/absent y serait confondu avec
`rouge` plutôt qu'exclu), mais il s'agit d'un mécanisme entièrement différent (évolution
inter-bilans, pas `priorities`/chaîne causale), hors du périmètre de cette mission — **signalé, non
corrigé**, à traiter séparément si le praticien le juge utile.

## 3. Cas clinique reproduit

Force, Puissance, Stabilisation confirmées `rouge` par leurs moteurs HYP respectifs ; Contrôle
Frontal (sans moteur HYP, purement TFM) à `orange` via un effet de bord de poids partagé
(`landing_uni`/`landing_bi`).

**Avant correction** :

```
priorities (top-3) : #1 Contrôle Frontal (orange), #2 Force (rouge), #3 Puissance (rouge)
Stabilisation (rouge) : ABSENTE du top-3
"Chaîne causale principale" : "Le bilan met en évidence des déficits concordants de contrôle
                                frontal et de force." — Stabilisation jamais mentionnée.
```

**Après correction** (rejoué avec les mêmes données, `index.html` corrigé) :

```
priorities (top-3) : #1 Force (rouge), #2 Puissance (rouge), #3 Stabilisation (rouge)
Contrôle Frontal (orange) : correctement exclu du top-3
"Chaîne causale principale" : "Le bilan met en évidence des déficits concordants de force et de
                                puissance." — les 3 rouges HYP occupent le top-3, Contrôle Frontal
                                n'apparaît plus en tête.
clinicalSynthesis.objectified : ['Force','Puissance','Stabilisation'] — RIGOUREUSEMENT IDENTIQUE
                                avant/après (CSM n'a jamais été affecté par ce bug).
```

## 4. Correction appliquée

```js
// index.html, dans computeMoteur(), juste avant la construction de `deficits`
function statusPriorityRank(status){if(status==='rouge')return 0;if(status==='orange')return 1;return 2;}
var deficits=FUNCTIONS.filter(function(fn){return fSc[fn]&&(fSc[fn].status==='rouge'||fSc[fn].status==='orange');})
  .sort(function(a,b){return statusPriorityRank(fSc[a].status)-statusPriorityRank(fSc[b].status);})
  .slice(0,3);
```

`statusPriorityRank` ne dépend jamais de la falsy-ness d'une valeur numérique — chaque branche
retourne une valeur explicite (`0`/`1`/`2`), jamais issue d'un `||`. Fonction déclarée localement
dans `computeMoteur()` (portée minimale, cohérente avec le principe de diff minimal — elle n'est
utilisée qu'à cet unique endroit).

## 5. Comportement avant

- `rouge` → rang réel `2` (pire que prévu).
- `orange` → rang réel `1` (meilleur que prévu).
- Résultat : `orange` systématiquement classé avant `rouge` dans `priorities`, dans toute la chaîne
  qui en dépend (`hypothese`, `contributeurPrincipal`, `causalSteps`/`conclusion`/`consequences`,
  "Priorité principale", "Priorités d'intervention", RTP, PDF sportif et expert).
- Une qualité `rouge` peut être totalement exclue du top-3 si 4 qualités ou plus sont déficitaires
  avec un mélange de sévérités (cas reproduit §3).

## 6. Comportement après

- `rouge` → rang `0` (le meilleur, donc trié en premier).
- `orange` → rang `1`.
- Tout le reste (statut absent/non classifiable dans ce contexte) → rang `2`, comportement
  historique conservé pour ce cas (jamais rencontré en pratique puisque `deficits` filtre déjà sur
  `rouge`/`orange` uniquement avant le tri).
- À sévérité égale, le départage reste exactement celui d'avant (ordre naturel de `FUNCTIONS`,
  aucune nouvelle règle inventée — vérifié par test, CAS 6).

## 7. Tests ajoutés

`tests/prioritiesStatusRanking.test.js` — 11 tests, tous verts :

1. Preuve directe du rang (`rank(rouge)=0 < rank(orange)=1 < rank(autre)=2`), en extrayant et
   exécutant la fonction **littéralement telle qu'elle existe dans `index.html`** (pas une
   réécriture parallèle qui pourrait diverger silencieusement du code réel).
2. **Cas réel reproduit** (Force+Puissance+Stabilisation rouge HYP + Contrôle Frontal orange TFM) —
   exercé à travers le pipeline complet (`computeMoteur()` → `priorities` → `defaultReportTexts()`
   → texte de la chaîne causale), pas une fonction isolée, conformément à l'exigence de la mission.
   Vérifie explicitement que Stabilisation n'est plus exclue et que "contrôle frontal" ne figure
   plus dans la conclusion.
3. CAS 1 à 8 mandatés (un seul rouge ; un orange + un rouge ; plusieurs rouges + un orange ; orange
   seul ; aucun rouge/orange ; trois rouges avec départage inchangé ; rouge HYP + orange TFM ;
   qualité `non_determinable` + orange TFM — vérifie que `non_determinable` n'est jamais transformé
   en diagnostic par le tri corrigé).
4. Pureté : deux appels identiques à `computeMoteur()` produisent des `functionScores`/
   `clinicalSynthesis` rigoureusement identiques (JSON strictement égal) — confirme que ni les 8
   moteurs HYP ni CSM ne sont affectés par la correction.

## 8. Résultat de la suite complète

`node --check` (extraction `<script>`) : `SYNTAX_OK`. **28 fichiers `tests/*.test.js` (27
préexistants + le nouveau) : 0 échec**, y compris les 8 fichiers dédiés à chaque qualité HYP
(Force/Puissance/Explosivité/Réactivité/Absorption/Stabilisation/Endurance/Mobilité),
`hypV1Normalization.test.js`, `hypClinicalSynthesis01.test.js`, `tfmHypCsmMigration.test.js`,
`hypClinicalSynthesisUI.test.js`. Aucun test existant modifié ni supprimé.

## 9. Confirmation — HYP/CSM/TFM non modifiés

- **8 moteurs HYP** : aucune ligne touchée (`git diff` : la seule zone modifiée est à l'intérieur de
  `computeMoteur()`, après les 8 blocs de remplacement HYP, jamais à l'intérieur d'un des 8
  `computeHypXxx01`). Vérifié par test (§7 point 4, `state`/`status`/`support`/`convergence`/
  `diagnostic` identiques avant/après via comparaison JSON stricte).
- **`computeHypClinicalSynthesis01`** : aucune ligne touchée. `clinicalSynthesis.objectified`
  rigoureusement identique avant/après sur le cas reproduit (§3) — CSM n'a jamais utilisé le
  comparateur fautif (il ne hiérarchise jamais, par construction).
- **`HYP_QUALITY_RELATIONS`**, **`TFM`**, **`VAR_REL3`**, **`capaciteScores`** : aucune ligne
  touchée (confirmé par `git diff --stat` : une seule zone de 6 lignes ajoutées, 1 ligne remplacée,
  toutes à l'intérieur de la construction de `deficits`).
- **Design/couleurs/libellés** : aucun changement (le correctif ne touche à aucune chaîne de
  caractères affichée, aucun style, aucun composant UI ou template PDF — seule la logique de tri en
  amont change, ce que l'UI/le PDF reflètent automatiquement puisqu'ils consomment `priorities`
  sans le recalculer).

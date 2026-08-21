# Implémentation finale — Cohérence clinique HYP/CSM du widget « Priorités d'intervention »

Suite directe de `IMPLEMENTATION_POST_AUDIT_CLINIQUE_V1.md`, dernier élément explicitement laissé
hors périmètre à l'issue de cette mission-là. Diff : `index.html` **+87/-25 lignes**, deux fichiers
de test ajoutés (`tests/prioritesInterventionCsm.test.js`, 22 tests). Aucune ligne des 8 moteurs
HYP, de `computeHypClinicalSynthesis01`, `HYP_QUALITY_RELATIONS`, `TFM`, seuils, normes, règles de
convergence ou de la construction de `priorities`/`statusPriorityRank()` n'est modifiée.

---

## 1. Audit avant modification

**Où le widget est calculé.** Il n'y a pas de calcul propre au widget : il consomme directement
`pri` = `res.priorities`, produit par `computeMoteur()` (`deficits` = au plus 3 qualités parmi les 9
`FUNCTIONS`, statut rouge/orange, triées par `statusPriorityRank()` — Mission B, non modifiée). Ce
mécanisme ne distingue à aucun moment qualité couverte par un moteur HYP et qualité TFM seule
(Contrôle Frontal, Contrôle Sensoriel) : les deux entrent dans `priorities` par le même filtre
`status==='rouge'||status==='orange'`.

**Comment Impact/Urgence sont déterminés (source réelle, jamais une sortie HYP/CSM).**
```js
var hasRouge=p.deficitTests&&p.deficitTests.some(function(dt){return dt.status==='rouge';});
var urgence=hasRouge?'Élevée':'Moyenne';
var impact=p.status==='rouge'?'Élevé':'Moyen';
```
- **Impact** : remap direct et redondant de `p.status` (déjà affiché par la couleur du badge/rang) —
  aucune information nouvelle.
- **Urgence** : dérivée de `p.deficitTests` (tests TFM bruts pondérés ≥2 en statut rouge/orange pour
  la qualité concernée, construits dans `computeMoteur()`), un signal réel mais jamais validé comme
  seuil clinique indépendant — juste une présence/absence de rouge parmi des tests TFM.

Ni l'un ni l'autre ne provient de HYP ou CSM ; aucune norme ni seuil dédié à "Impact"/"Urgence"
n'existe dans `THRESHOLDS`/`NORMS`.

**Rang** (`p.rang`) : position dans le tableau trié — reflète fidèlement la sévérité relative
(Mission B), mais son affichage sous forme de numéro ordinal (cercle "1", "2", "3") **implique une
hiérarchie individuelle même entre deux qualités de sévérité strictement identique** — exactement ce
que CSM refuse de déterminer.

**Tous les consommateurs identifiés** (recherche exhaustive de `p.rang`/`pri.map` avec rendu
numéroté) :
1. Dashboard, widget "Priorités d'intervention" (`AnalyseView`) — rang + Impact + Urgence.
2. PDF sportif, section "Priorités d'intervention" (`buildSportifReport`) — rang (cercle numéroté),
   sans Impact/Urgence.
3. Onglet UI "Orientations" (`ExpertView`, `tab==='orientations'`) — rang (cercle numéroté),
   sans Impact/Urgence.
4. PDF expert, section "Orientations" (`buildExpertReport`) — rang textuel ("1. Force").

Aucune autre vue ne consomme `p.rang` avec un rendu ordinal.

**Combinaison de sources utilisée** : TFM (`priorities`, `deficitTests`, `contrib`), `priorities`
(construction non modifiée), HYP (`status` par qualité, déjà garanti fidèle à HYP par une migration
antérieure — `AUDIT_MIGRATION_TFM_HYP_CSM.md`). **Jamais CSM directement** — le widget n'a jamais lu
`clinicalSynthesis` avant cette mission.

---

## 2. Règle clinique appliquée

Nouvelle fonction pure `priHypObjectifiedSplit(pri, csm)` : sépare `pri` en `hyp` (qualités
appartenant à `HYP_CSM_QUALITIES` **et** `csm.qualities[q].objectified === true` — donc réellement
objectivées par leur propre moteur HYP, jamais non_determinable, jamais suspectee — ces deux états ne
produisent de toute façon jamais un statut rouge/orange, cf. `hypStatusFromState`, non modifié, donc
n'atteignent jamais `priorities`) et `tfmOnly` (tout le reste — qualité sans moteur HYP). Vérifié
empiriquement (§10) : cette condition suffit à garantir les 5 critères de la mission (preuve HYP
objectivée, état réellement déficitaire, jamais non_determinable, jamais une simple hypothèse
explicative, jamais un poids TFM seul).

---

## 3. Rôle réel d'Impact/Urgence — décision

**Option B retenue** (audit §1) : aucune base clinique indépendante documentée, seuls des remaps
d'informations déjà affichées. **Décision : suppression**, pas repositionnement — "Impact" étant
strictement redondant avec le badge de statut déjà visible (0 bit d'information supplémentaire), le
repositionner en "information secondaire" aurait simplement dupliqué une information déjà présente
sans jamais la clarifier ; "Urgence" est retirée avec lui pour la même raison (absence de seuil
validé, et champ de niveau différent — non recalculable sans données supplémentaires). Aucun nouveau
seuil inventé pour les remplacer, conformément à la consigne. Le rang numéroté est retiré aux 4
emplacements identifiés en §1, remplacé par la pastille de sévérité déjà utilisée ailleurs dans la
Synthèse clinique (cohérence visuelle avec "Qualités suspectées"/"non déterminables").

---

## 4. Comportement avant/après

**Avant** (scénario Mobilité + Réactivité + Absorption + Stabilisation toutes objectivées, 3 dans
`priorities` par la limite structurelle à 3) :
```
🎯 PRIORITÉ PRINCIPALE : CHEVILLE          [déjà corrigé, mission précédente]
PRIORITÉS D'INTERVENTION
① MOBILITÉ · CHEVILLE   Impact: Élevé   Urgence: Élevée
② RÉACTIVITÉ            Impact: Élevé   Urgence: Élevée
③ ABSORPTION            Impact: Élevé   Urgence: Moyenne
```
**Après** :
```
DÉFICITS À INVESTIGUER
Qualités objectivées par un moteur HYP — même niveau de priorité clinique, aucun classement entre elles.
● MOBILITÉ · CHEVILLE
● RÉACTIVITÉ
● ABSORPTION
```
Scénario avec une qualité TFM seule (Contrôle Frontal, orange, aux côtés de Stabilisation, rouge,
HYP) — **avant** : les deux mélangées dans la même liste numérotée, indiscernables l'une de l'autre
au premier coup d'œil. **Après** :
```
DÉFICITS À INVESTIGUER                              INFORMATION TFM SECONDAIRE (HORS HYP)
● STABILISATION                                      ● CONTRÔLE FRONTAL
```

---

## 5. Cas cliniques testés

Les 10 cas mandatés (Problème 5), tous vérifiés sur le pipeline réel (`tests/
prioritesInterventionCsm.test.js`) :

1. Une seule qualité HYP déficitaire → seule dans `split.hyp`.
2. Deux qualités HYP déficitaires → toutes deux dans `split.hyp`, à égalité.
3. Trois qualités HYP déficitaires → toutes trois dans `split.hyp` ; aucun chiffre de rang trouvé
   dans le PDF généré.
4. Sévérités différentes (rouge + orange) → toutes les qualités réellement objectivées apparaissent
   dans `split.hyp`, indépendamment de leur sévérité relative.
5. Qualité HYP rouge (Stabilisation) + qualité TFM orange hors HYP (Contrôle Frontal) → strictement
   séparées (`split.hyp` / `split.tfmOnly`), jamais mélangées dans le PDF.
6. Qualité non_determinable (Explosivité) avec des valeurs saisies délibérément défavorables →
   reste absente de `priorities`, de `split.hyp` et de `split.tfmOnly` — **jamais une "priorité
   clinique"**.
7. Qualité suspectee (Endurance) → statut `jaune`, jamais rouge/orange, absente de `priorities`.
8. Aucune qualité HYP objectivée → aucun bloc affiché dans le PDF (ni "Déficits à investiguer", ni
   "Information TFM secondaire").
9. Relation HYP documentée entre deux qualités déficitaires (Mobilité ↔ Stabilisation) → les deux
   apparaissent à égalité dans `split.hyp`, la relation n'introduit aucun rang.
10. Relation TFM seule (référentiel statique `TFM`/`VAR_REL3`) sans aucune donnée patient → aucune
    qualité ne peut en découler dans `priorities` sans preuve objectivée.

Plus 1 test de pureté : appeler `priHypObjectifiedSplit()` entre deux calculs de `computeMoteur()`
ne modifie ni `functionScores`, ni `clinicalSynthesis`, ni `priorities`.

**Résultat dans tous les cas : aucune qualité non_determinable n'est jamais devenue une priorité
clinique ; aucun simple poids TFM n'a jamais dépassé/rejoint une qualité HYP objectivée dans
`split.hyp`.**

---

## 6. Vérification UI

Parcours réel (Playwright) sur deux scénarios :
- **3 qualités HYP à égalité** (Mobilité/Réactivité/Stabilisation, toutes rouges) : le dashboard
  affiche "DÉFICITS À INVESTIGUER" avec 3 pastilles rouges sans numéro, sous-titre explicite ; aucun
  Impact/Urgence.
- **1 qualité HYP + 1 qualité TFM seule** (Stabilisation rouge HYP + Contrôle Frontal orange TFM) :
  dashboard, widget "Déficits à investiguer" ET onglet "Orientations" affichent tous deux la même
  séparation stricte — Stabilisation sous "Déficits à investiguer"/carte normale, Contrôle Frontal
  sous "Information TFM secondaire (hors HYP)" avec un style visuellement distinct. Confirmé
  également que la carte "Déficits objectivés" (dashboard, section 01) utilise déjà
  `csmSafeQualityNote` pour ce cas à un seul élément : *« Déficit objectivé par le moteur HYP dédié
  (HYP-STA-01) — voir la Synthèse clinique pour le détail. »*

---

## 7. Vérification PDF

PDF sportif régénéré réellement (`buildFullReportHtml('sportif', ...)`) et inspecté (capture d'écran
+ recherche textuelle) pour le scénario à 3 qualités objectivées (Mobilité/Réactivité/Absorption) :
section "3 · DÉFICITS À INVESTIGUER" avec 3 cartes à pastille colorée (rouge), sans cercle numéroté,
sans Impact/Urgence, chacune conservant Objectif/Pourquoi ?/Actions/Tests de suivi/Critère de sortie
(contenu actionnable inchangé). "Priorités d'intervention" n'apparaît plus nulle part dans le
document. PDF expert : section "Orientations" vérifiée sans numérotation (`"1. Force"` → `"Force"`).

---

## 8. Non-régression

- **HYP** : comparaison stricte de la séquence complète des champs `state`/`status` des 8 moteurs
  HYP sur un scénario couvrant les 8 qualités, avant/après l'ensemble des modifications de cette
  mission — **identique caractère pour caractère** (`diff`, code de sortie 0).
- **CSM** : `computeHypClinicalSynthesis01` — zéro ligne modifiée (confirmé par `git diff`). Un test
  dédié vérifie explicitement qu'appeler la nouvelle fonction de présentation entre deux calculs de
  `computeMoteur()` ne change ni `functionScores`, ni `clinicalSynthesis`, ni `priorities`.
- **Diff scope** : `git diff` confirme 7 zones modifiées, toutes à l'intérieur de la nouvelle
  fonction `priHypObjectifiedSplit` (avant `computeMoteur`), `buildSportifReport`,
  `buildExpertReport`, `AnalyseView`, `ExpertView` — aucune à l'intérieur d'un `computeHypXxx01`,
  de `computeMoteur()` lui-même, ni de `computeHypClinicalSynthesis01`.
- **Suite complète** : **31 fichiers `tests/*.test.js` (30 préexistants + 1 nouveau), 0 échec.**

---

## 9. Ce qui reste volontairement inchangé

- `priorities` (construction, `deficits`, tri par `statusPriorityRank`) : intacte — la limite
  structurelle à 3 qualités maximum (déjà présente avant cette mission) n'est pas modifiée.
- Le contenu actionnable de chaque carte (Objectif/Pourquoi ?/Actions/Tests de suivi/Critère de
  sortie) : inchangé, y compris le routage HYP/CSM du champ "Pourquoi ?" déjà mis en place par la
  mission précédente.
- L'édition praticien (`ReportPreview`, "Modifier le rapport", section "Priorités
  (réordonnables...)") : intacte — reste le seul endroit où un praticien peut explicitement
  réordonner/curer manuellement une liste de priorités ; ce n'est pas une narration
  auto-générée et reste hors périmètre.
- `TFM`, `VAR_REL3`, `deficitTests` (donnée) : intacts en tant que données — seule leur *utilisation*
  pour fabriquer "Impact"/"Urgence" est retirée.

## 10. Limites restantes

- Les 4 points de consommation corrigés couvrent tous les rendus identifiés par l'audit exhaustif
  (§1) ; aucun autre mécanisme de rang numéroté n'a été trouvé ailleurs dans `index.html`.
- La limite structurelle "3 qualités maximum" dans `priorities` (donc dans "Déficits à investiguer")
  demeure : une qualité objectivée au-delà de la 3ᵉ position (sévérité) n'apparaîtra pas dans ce
  widget — comportement hérité, déjà documenté dans les missions précédentes, non traité ici (aucune
  modification de `priorities` n'était autorisée).

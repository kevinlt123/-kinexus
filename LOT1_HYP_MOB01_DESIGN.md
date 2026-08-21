# LOT 1 exécutable — `HYP_CATALOG` et `computeHypothesisEngine()` pour `HYP-MOB-01`

## Statut

Premier incrément codable du moteur HYP###, tel qu'identifié dans `IMPLEMENTATION_READINESS_HYP.md`
§5-§6 (LOT 1). Livrables : `hyp_engine_lot1.js` (code), `tests/hypEngineLot1.test.js` (preuve
d'exécution contre les primitives réelles d'`index.html`), ce document (conception). **`index.html`
n'est pas modifié — diff vérifié nul.** Aucun branchement UI, aucun appel depuis un composant ou un
écran existant.

---

## 1. Ce qui a été construit

### `HYP_CATALOG['HYP-MOB-01']`
Transcription directe de `HYP_ARCHITECTURE_PHASE_C.md` (section HYP-MOB-01), structurée selon le
modèle de données de `PHASE_H_TECHNICAL_SPECIFICATION.md` §1 :
- 1 preuve diagnostique (`wblt_distance`), aucune preuve confirmative indépendante (la confirmative
  listée est auto-référentielle, dérivée de la même mesure), 0 preuve explicative.
- `convergence.requiredMechanisms = 1`, `ruleVariant = 'mobilite_exception'` — le même marqueur que
  `PHASE_H_TECHNICAL_SPECIFICATION.md`/ADR-008 avaient déjà prévu pour porter cette exception, sans
  introduire de champ supplémentaire.
- 1 orientation clinique associée (`CLI020`).

### `computeHypothesisEngine(testData, normPop, normAge, deps)`
Fonction pure, restreinte à `HYP-MOB-01` pour ce LOT. Ne redéfinit aucune primitive existante :
`deps = { applyThr, bestVal, autoLSI }` sont les fonctions déjà présentes dans `index.html`
(`:3516`, `:3286`, `:3537`), injectées en paramètre. Le fichier ne contient donc aucune logique de
seuil dupliquée ni susceptible de diverger de celle déjà en production.

Pipeline appliqué, conforme à `PHASE_H_TECHNICAL_SPECIFICATION.md` §3.3 :
1. Évaluation de la preuve diagnostique (`evaluateWbltDistance`) — lit `testData.wblt`, applique
   `applyThr('wblt_distance', ...)` sur chaque côté (D/G) plus `autoLSI`, avec la même lecture
   "pire côté" que `computeTestStatus()` applique déjà à tout test unilatéral. `computeTestStatus()`
   lui-même n'est pas appelé : sa logique d'agrégation multi-KPI/escalade est conçue pour des tests
   à plusieurs KPI et n'apporte rien pour un test à un seul KPI comme WBLT.
2. Calcul de la convergence (ici triviale : 1 mécanisme, ADR-005).
3. Détermination de l'état — `absente` ou `retenue_faible` **directement**, sans état `suspectee`
   intermédiaire (ADR-005 : aucun seuil de convergence à ne pas encore atteindre avec un seul
   mécanisme).
4. Détermination du support — plafonné à `{level:'faible'}` par construction : la confirmative est
   évaluée et enregistrée (transparence) mais jamais appliquée pour progresser vers `'moderee'`
   (ADR-008) ; la couche explicative reste `[]`, rendant `'forte'` inatteignable sans code de garde
   supplémentaire.
5. Évaluation de `CLI020` — déclenchée si et seulement si l'état est `retenue_faible`, support
   transmis en métadonnée (`ADR-004`).

---

## 2. Ce qui n'a pas été fait, délibérément

- **Aucune modification d'`index.html`.** Le fichier reste un module autonome, chargeable
  aujourd'hui uniquement par le harnais de test (`eval` dans la même portée que les primitives
  extraites — même convention que les fichiers existants de `tests/`).
- **Aucun appel depuis `AnalyseView`, `computeMoteur()`, ou tout autre composant.** Rien dans
  l'application ne référence `HYP_CATALOG` ni `computeHypothesisEngine` aujourd'hui.
- **Aucune autre qualité.** `HYP_CATALOG` ne contient qu'une entrée — les 7 autres qualités prêtes
  (Force, Puissance, Réactivité, Explosivité, Stabilisation, Endurance — hors Absorption, en attente
  de l'exception SLLT) restent à ajouter dans un incrément séparé, selon le même patron.
- **Aucune interface utilisateur.** Aucun onglet, aucun écran, aucune chaîne de caractère destinée
  à l'affichage praticien n'a été créée.

---

## 3. Preuve d'exécution

`node tests/hypEngineLot1.test.js` — 13 assertions, exécutées contre les primitives réelles
extraites d'`index.html` (pas des réimplémentations) :
- `HYP_CATALOG` conforme à la structure attendue (1 seule entrée, 0 explicative).
- Cas A (`PHASE_D_LOGICAL_VALIDATION.md`, activation évidente) : `wblt_distance` nettement
  déficitaire → `retenue_faible`, `CLI020` déclenchée.
- Cas Absente : `wblt_distance` normal des deux côtés → `absente`, support `null`, `CLI020` non
  déclenchée.
- Cas limite (asymétrie D/G) : un seul côté déficitaire suffit.
- Données indisponibles (test inactif, ou totalement absent du bilan) : aucune erreur levée.
- Vérification dédiée (`PHASE_D_LOGICAL_VALIDATION.md`) : des données massivement déficitaires sur
  d'autres tests n'affectent jamais `HYP-MOB-01` — seul `testData.wblt` est lu.
- Garantie ADR-008 : le support n'atteint jamais `'moderee'`/`'forte'`, y compris sur des données
  extrêmes ; la confirmative auto-référentielle est enregistrée mais n'élève jamais le support.
- Pureté : deux appels identiques produisent un résultat identique (hors horodatage) ;
  `HYP-CSM-01` n'apparaît que dans `suspendedHypotheses`, jamais calculée.

**Résultat : 13/13 passed.**

---

## 4. Point d'intégration futur (décrit, non réalisé)

Lorsque le passage au LOT 2 (`IMPLEMENTATION_READINESS_HYP.md`) sera engagé, l'intégration se
limiterait à un seul ajout dans `AnalyseView` (`index.html:5920`), à côté de l'appel existant
`res=computeMoteur(...)` :

```
var hypRes = computeHypothesisEngine(bilan.testData, effectiveNormPop(athlete), athleteAge,
  { applyThr: applyThr, bestVal: bestVal, autoLSI: autoLSI });
```

— une ligne, aucune modification de `computeMoteur()` ni d'aucun consommateur existant de
`res.functionScores`. Cette ligne n'est **pas ajoutée par ce document** : elle est décrite pour
montrer que le point d'intégration futur est minimal et localisé, conformément à la contrainte
« sans impact sur le comportement existant ».

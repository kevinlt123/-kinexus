# Implémentation — HYP-MOB-01 dans Kinexus

**Statut** : implémenté et branché en production dans `index.html`. `fSc['Mobilité']` (sortie de
`computeMoteur()`) est désormais produit par le raisonnement clinique HYP-MOB-01, pas par la
boucle TFM générique.

Source de vérité clinique : `hyp_engine_lot1.js` (LOT 1, logique déjà validée et testée,
non rouverte, non modifiée) et `HYP_ARCHITECTURE_PHASE_C.md` (section HYP-MOB-01).

---

## 1. Vérification du diagnostic (avant toute décision de branchement)

| Élément | Constat vérifié dans le code |
|---|---|
| Variable diagnostique | `wblt_distance` (unique — `TBK.wblt`, unilatéral D/G, KPI `distance`, `dir:'max'`) |
| Seuil disponible | `THRESHOLDS.wblt_distance = {vert:12, jaune:10, orange:8, dir:'max'}` — **aucune** entrée `NORMS` |
| Conséquence | Toujours classifiable dès qu'une valeur brute existe, **indépendamment de la population** de l'athlète (contrairement à Force/Puissance/Absorption, où plusieurs variables dépendent de `NORMS`) |
| Règle de convergence | ADR-005 (exception Mobilité) : **1 seul mécanisme** requis — pas de seuil de convergence intermédiaire, jamais d'état `Suspectée` |
| États produits | `Absente` (normal des deux côtés) → `Retenue/Faible` directement dès qu'un côté est déficitaire (orange/rouge) |
| Comportement sans norme | Sans objet pour `NORMS` (aucune n'existe) ; si le test `wblt` est inactif/absent, le moteur renvoie `dataAvailable:false` et le score TFM générique déjà calculé est conservé (repli documenté, jamais un statut inventé) |

**Verdict** : diagnostic stable, seuil universellement disponible, comportement défini pour tous
les cas dégradés → **HYP-MOB-01 est suffisamment stable pour être branché en production.** Aucune
logique clinique déjà validée n'a été modifiée.

## 2. Variables explicatives de Mobilité

| Variable | Rôle clinique | Norme actuelle ? | Faisabilité |
|---|---|---|---|
| `wblt_lsi` (LSI D/G, `autoLSI`/`data.lsiAuto`) | Confirmatif auto-référentiel (dérivée de la même mesure que le diagnostic) | N/A — pas un statut catégoriel, une valeur de comparaison | Opérationnel, mais n'élève jamais le support (ADR-008) |
| `wblt_asymmetry` (écart absolu D/G) | Modificateur / précision (cité par `CLI020`/`CLI021`) | Non | **Variable cliniquement pertinente — aucun mécanisme de calcul n'existe dans `index.html` aujourd'hui.** Ce n'est pas un défaut de norme mais d'implémentation du calcul lui-même (le LSI existe déjà ; un écart absolu D/G serait un calcul supplémentaire trivial à partir des mêmes données, non fait ici — aucune modification apportée) |
| `wblt_relative_distance` | Confirmatif (cité par `CLI020`) | Non | Même statut — aucun mécanisme de calcul trouvé |
| Concepts Vierge_7 (`ankle_joint_stiffness`, `soleus_tonus`, `ankle_motor_control`, etc.) | Explicatif physiologique/biomécanique visé par la source clinique | Sans objet | **Ne sont pas des variables Kinexus** — jamais implémentées comme KPI d'aucun test. Ce ne sont pas des variables "sans norme" à conserver dans le raisonnement, ce sont des concepts qui n'existent tout simplement pas dans le logiciel aujourd'hui |

Aucune de ces variables n'est transformée en preuve diagnostique. `wblt_asymmetry` et
`wblt_relative_distance` sont explicitement conservées dans le modèle (champ
`precision.wblt_asymmetry`, statut `'non_calcule'`) plutôt que supprimées, conformément à la
nouvelle règle de travail (rôle clinique ≠ faisabilité actuelle).

## 3. Absence de norme — traitement

Aucune variable explicative *mesurée par Kinexus* n'a été exclue faute de norme : la couche
explicative de Mobilité est **structurellement vide** (documentée comme telle dans
`HYP_ARCHITECTURE_PHASE_C.md`, "Couverture explicative... Nulle"), pas amputée par ce moteur.
`wblt_asymmetry`/`wblt_relative_distance` sont conservées et explicitement marquées "non calculé"
plutôt que retirées.

---

## 4. Branchement production

### Fichiers modifiés

- **`index.html`** — seul fichier de production modifié. Purement additif : **+82 lignes,
  0 suppression** (`git diff --stat`). Deux insertions :
  1. `computeHypMobilityWblt` + `computeHypMobility01`, insérées juste avant `computeMoteur()`,
     immédiatement après le bloc HYP-REA-01.
  2. Un bloc d'intégration dans `computeMoteur()`, juste après le bloc HYP-REA-01 et avant
     `var sysSc={}`, qui remplace `fSc['Mobilité']`.

### Fichiers créés

- `tests/hypMobility01.test.js` — 13 tests.
- Ce document.

### Primitives réutilisées, aucune dupliquée

`applyThr`, `bestVal`, `autoLSI`, `testKpiDir` — les mêmes déjà utilisées par
`computeHypAbsorption01`/`computeHypReactivity01`. Aucun nouveau seuil, aucune nouvelle norme,
aucune formule dupliquée.

### Intégration

Après le bloc HYP-REA-01 (inchangé), un bloc dédié réévalue **uniquement** `fSc['Mobilité']` :

- si `dataAvailable` (le test `wblt` a des données) → remplacement complet (`status` dérivé de
  `state`, `directTests:['wblt']`, `hypMob01` = objet complet pour traçabilité) ;
- sinon → repli documenté sur le score TFM générique déjà calculé (jamais un statut inventé),
  avec `hypMob01` ajouté pour traçabilité.

Aucune autre qualité (`fSc[autre_fn]`), aucun autre output de `computeMoteur` n'est touché par ce
bloc.

---

## 5. Tests

`tests/hypMobility01.test.js` — **13 tests, tous passants** :

- Mobilité normale (14/14 cm) → `absente`, vert.
- Mobilité déficitaire (9/9 cm, bande orange) → `retenue_faible`, orange.
- Mobilité franchement déficitaire (6/6 cm, bande rouge) → `retenue_faible`, rouge.
- Très déficitaire des deux côtés → support toujours `faible`, jamais `moderee`/`forte` (ADR-008).
- Asymétrie (6/14 cm) → `retenue_faible` (lecture pire côté), LSI exposé en précision.
- Données incomplètes (`wblt` inactif ou absent) → repli TFM, aucun crash.
- Population totalement inconnue → repli THRESHOLDS fonctionne réellement (confirme qu'aucune
  `NORMS` n'a jamais été nécessaire pour cette variable).
- `wblt_asymmetry` exposé comme `'non_calcule'`, jamais supprimé.
- Non-régression : variable Mobilité seule ne change ni Réactivité ni Absorption (les deux autres
  qualités déjà pilotées par HYP) ; structure complète de `computeMoteur()` préservée ; pureté
  fonctionnelle.

**Point méthodologique découvert en écrivant les tests, non causé par ce moteur** : `wblt` porte un
poids `TFM` générique pour plusieurs fonctions (`wblt:{mobilite:3,reactivite:1,absorption:1,
stabilisation:1}`). Une qualité qui n'est pas encore reprise par un moteur HYP (ex. Stabilisation)
continue de lire `wblt` via le repli TFM générique — un changement de `wblt_distance` peut donc
légitimement faire varier ces qualités *non encore implémentées*, sans lien avec ce moteur. Le test
de non-régression est volontairement restreint aux qualités déjà pilotées par HYP (Réactivité,
Absorption), où ce mécanisme ne s'applique plus.

**Régression complète** : les 17 fichiers de tests (dont ce nouveau fichier) réexécutés
intégralement — **tous passants, aucun changement de résultat**. Vérification syntaxique complète
du contenu `<script>` d'`index.html` (`node --check`) — **OK**. `git diff` confirmé purement
additif (+82/-0 dans `index.html`).

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+82/-0 lignes).
- **Fichiers créés** : `tests/hypMobility01.test.js`, `IMPLEMENTATION_HYP_MOB01.md`.
- **Tests ajoutés** : 13, tous passants.
- **Tests existants passés** : tous (16 fichiers préexistants, aucune régression).
- **Autres qualités modifiées** : NON — vérifié par tests et relecture (le bloc HYP-MOB-01 n'écrit
  que `fSc['Mobilité']`).
- **HYP-MOB-01 réellement actif** : OUI, dès que le test WBLT a des données ; repli documenté
  sinon.

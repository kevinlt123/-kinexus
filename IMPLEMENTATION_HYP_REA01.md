# Implémentation — HYP-REA-01 dans Kinexus

**Statut** : implémenté et branché en production dans `index.html`. `fSc['Réactivité']` (sortie de
`computeMoteur()`) est désormais produit par le raisonnement clinique HYP-REA-01, pas par la boucle
TFM générique.

Source de vérité clinique : `CARTOGRAPHIE_REACTIVITE_HYP_REA01.md` / `ARBITRAGE_CLINIQUE_REACTIVITE.md`
(décisions déjà gelées, non rouvertes ici) et `KINEXUS_REASONING_ENGINE_V1.md` §2-4 (cycle à 5
états, règle de convergence — modèle **standard**, pas l'exception Mobilité).

---

## 1. Fichiers modifiés

- **`index.html`** — seul fichier de production modifié. Purement additif : **+170 lignes,
  0 suppression** (`git diff --stat`). Deux insertions :
  1. Un nouveau bloc de fonctions (`computeHypReactivityDj`, `computeHypReactivitySldj`,
     `computeHypReactivityConfirmative`, `computeHypReactivityExplanatory`,
     `computeHypReactivity01`), inséré juste avant `function computeMoteur(...)`, immédiatement
     après le bloc HYP-ABS-01 V2.
  2. Un bloc de 20 lignes inséré **à l'intérieur** de `computeMoteur()`, immédiatement après le
     bloc d'intégration HYP-ABS-01 V2 et avant `var sysSc={}`, qui remplace `fSc['Réactivité']`
     par le résultat de `computeHypReactivity01(...)` quand une donnée réelle existe.

## 2. Fichiers créés

- **`tests/hypReactivity01.test.js`** — 18 tests, contre le moteur réellement intégré dans
  `index.html` (même convention que `tests/hypAbsorption01.test.js`).
- Ce document (`IMPLEMENTATION_HYP_REA01.md`).

Aucun autre fichier créé ou modifié.

---

## 3. Ancienne logique remplacée

Avant cette mission, `fSc['Réactivité']` était produit par la boucle générique de `computeMoteur()`
(`FUNCTIONS.forEach`) : moyenne pondérée des statuts de tous les tests ayant un poids `reactivite`
dans `TFM` — y compris `cmjr:{reactivite:3}` (poids maximal, identique à `dj`/`sldj`),
`repeated_hop:{reactivite:2}`, `heel_raise:{reactivite:1}`, `soleus_iso`/`gastro_iso`/
`seated_calf_raise`/`standing_calf_raise:{reactivite:2}`, `hip_rot_ext:{reactivite:1}` — aucune
distinction diagnostique/confirmative/explicative, la même architecture indifférenciée déjà
documentée pour Absorption.

## 4. Nouvelle logique intégrée

`computeHypReactivity01(testData, normPop, normAge)` — fonction pure, aucune dépendance externe.

### Variables diagnostiques (Niveau 1)

Vérifiées directement dans `index.html` avant écriture du moteur :

| Variable | Test | Mécanisme | Direction | Résolution |
|---|---|---|---|---|
| `dj_rsi` | `dj` (bilatéral, `TBK.dj.bilateral=true`) | NORMS (18 populations) + repli THRESHOLDS (vert≥1.5/jaune≥1.0/orange≥0.7) | max | `bestVal(trials.rsi,'max')` puis `applyThr('dj_rsi',...)` |
| `sldj_rsi` | `sldj` (unilatéral, `TBK.sldj.bilateral=false`) | NORMS (3 populations) + repli THRESHOLDS (vert≥1.2/jaune≥0.8/orange≥0.5) | max | `bestVal` par côté (D/G) + `applyThr` par côté, lecture "pire côté" — même pattern que `evaluateWbltDistance` (HYP-MOB-01) |

Les deux sont **toujours classifiables** dès qu'une valeur brute existe, grâce au repli
`THRESHOLDS` (vérifié par le test "Population sans norme").

### Règle de convergence (ADR-003, modèle standard)

Réactivité fait partie des "6 des 8 qualités actives" utilisant la règle standard
(`KINEXUS_REASONING_ENGINE_V1.md` §4) : convergence à l'échelle de **2 mécanismes indépendants**
(`dj`, `sldj`), pas l'exception Mobilité à 1 mécanisme. `dj_rsi` et `sldj_rsi` proviennent de deux
tests distincts — aucun risque de double-comptage d'un même essai.

### Cycle d'états — modèle déjà validé, aucun nouveau système

| État | Condition réellement implémentée |
|---|---|
| `absente` | Aucun mécanisme déficitaire (les deux normaux, ou données absentes des deux côtés) |
| `suspectee` | Exactement 1 des 2 mécanismes déficitaire |
| `retenue_faible` | Les 2 mécanismes déficitaires (seuil de convergence atteint), aucune confirmative/explicative convergente |
| `retenue_moderee` | Mécanisme générique conservé (jamais atteint aujourd'hui — voir §5) |
| `retenue_forte` | Mécanisme générique conservé (jamais atteint aujourd'hui — voir §5) |

## 5. Variables confirmatives / explicatives — lues, jamais classifiées

Vérification directe (`INVENTAIRE_COMPLET_VARIABLES_NORMEES.md`) : **aucune** des variables
confirmatives/explicatives documentées pour HYP-REA-01 n'a de seuil dans `index.html` :

- **Confirmatives** (documentées) : `dj_contact_time`, `dj_height`, `dj_peak_prop_force`,
  `dj_peak_prop_power`, `dj_peak_landing_force`, `dj_landing_impulse`, `dj_leg_stiffness`, et
  équivalents `sldj_*` — lues et exposées en valeur brute (`computeHypReactivityConfirmative`),
  jamais classifiées.
- **Explicatives biomécaniques** — CMJR (`mean_ct`, `mean_stiffness`, `mean_rebound_height`,
  `mean_rsi`, `rsi_decay`, `stiffness_decay`) : décision gelée respectée — **jamais diagnostique**,
  même si `TFM` lui donne un poids 3 identique à `dj`/`sldj` (poids TFM, pas un seuil — jamais
  interprété comme tel). Lu et exposé en valeur brute (`computeHypReactivityExplanatory`).
- **Repeated Hop** (`mean_rsi`) : décision gelée respectée — explicatif seul, jamais diagnostique.
  Lu et exposé en valeur brute.

**Conséquence directe** : aucune confirmative ni explicative n'étant classifiable aujourd'hui, le
support ne peut jamais dépasser `Retenue/Faible` en pratique. Le mécanisme générique de progression
(Faible→Modérée→Forte) est conservé tel quel dans le code (pour ne pas devoir réécrire le moteur si
un seuil est ajouté plus tard), mais `confirmativeConvergent`/`explanatoryConvergent` restent
toujours `false` avec la couverture actuelle — vérifié par le test "jamais forcé au-delà de faible".
**Ce n'est pas une exception clinique comme Mobilité (ADR-005)** : c'est une limite de données,
documentée comme telle.

## 6. Tests exclus — Heel Raise et Side Hop

Conformément à la décision gelée, **`heel_raise` et `side_hop` ne sont jamais lus** par
`computeHypReactivity01` — aucun rôle, ni diagnostique, ni confirmatif, ni explicatif. Vérifié par
2 tests dédiés : ajouter des données Heel Raise/Side Hop extrêmes à un profil par ailleurs
identique ne change strictement rien au résultat HYP (`assert.deepStrictEqual`).

## 7. Asymétrie — précision uniquement

`sldj_lsi` (LSI D/G, calculé via `autoLSI` ou `lsiAuto` déjà stocké — même primitive que pour
`dj_rsi`/Mobilité) est exposé dans `precision.sldj_lsi`, jamais lu par le calcul du Niveau 1.
Aucun autre mécanisme d'asymétrie documenté n'a été trouvé pour Réactivité dans le code (`dj` est
un test bilatéral sans distinction D/G, donc sans asymétrie intrinsèque calculable).

## 8. Intégration dans `computeMoteur()`

Après le calcul générique de `fSc[fn]` pour toutes les fonctions (boucle inchangée) et après le
bloc HYP-ABS-01 V2 (inchangé), un bloc dédié réévalue **uniquement** `fSc['Réactivité']` :

- si `dataAvailable` (au moins `dj` ou `sldj` a une donnée réelle) → `fSc['Réactivité']` est
  entièrement remplacé (`status` dérivé de `state`, `directTests:['dj','sldj']`,
  `directStatuses` = catégories `dj_rsi`/`sldj_rsi` disponibles, `hypRea01` = objet complet pour
  traçabilité) ;
- sinon → le résultat TFM générique déjà calculé est **conservé tel quel** (repli documenté,
  jamais un statut inventé — même principe que HYP-ABS-01 V2), avec `hypRea01` ajouté pour
  traçabilité.

Mapping état → statut : `absente`→`vert`, `suspectee`→`jaune`, `retenue_*`→`orange` (ou `rouge` si
`dj_rsi` **et** `sldj_rsi` sont tous deux littéralement `'rouge'`, même logique d'escalade que
HYP-ABS-01 V2).

Aucune autre qualité (`fSc[autre_fn]`), aucun autre output de `computeMoteur`
(`testStatuses`/`systemScores`/`rtpStatus`/`qualityScores`/`capaciteScores`) n'est touché par ce
bloc — vérifié par relecture (le bloc n'écrit que `fSc['Réactivité']`) et par tests.

---

## 9. Tests

`tests/hypReactivity01.test.js` — **18 tests, tous passants**, contre le code réellement intégré
dans `index.html`. Couvre :

1. DJ normal + SLDJ normal → `absente`, vert.
2. DJ déficitaire + SLDJ normal → `suspectee` (1 mécanisme), jaune.
3. DJ normal + SLDJ déficitaire → `suspectee` (1 mécanisme), jaune.
4. DJ déficitaire + SLDJ déficitaire → `retenue_faible` (2/2), orange, jamais au-delà de faible.
4bis. Les deux `rouge` → escalade à rouge.
5. SLDJ jamais testé → DJ seul évalué, aucun crash.
6. Population sans norme → repli THRESHOLDS fonctionne réellement.
7. DJ/SLDJ tous deux inactifs → repli sur le score TFM générique.
- CMJR très déficitaire, DJ/SLDJ normaux → Réactivité reste `absente` (CMJR jamais diagnostique).
- Repeated Hop très déficitaire, DJ/SLDJ normaux → Réactivité reste `absente`.
- Heel Raise très déficitaire → aucun effet (jamais lu).
- Side Hop très déficitaire → aucun effet (jamais lu).
- `sldj_lsi` exposé, jamais générateur.
- `dj_rsi` utilise exactement `applyThr('dj_rsi',...)`.
- Non-régression : variable non classifiable → aucune fonction ne change ; structure complète de
  `computeMoteur()` préservée ; Absorption (HYP-ABS-01 V2) inchangée ; pureté fonctionnelle.

**Régression complète** : les 16 fichiers de tests préexistants (dont `tests/hypAbsorption01.test.js`)
réexécutés intégralement — **tous passants, aucun changement de résultat**. Vérification
syntaxique complète du contenu `<script>` d'`index.html` (`node --check`) — **OK**. `git diff`
confirmé purement additif (+170/-0 dans `index.html`).

---

## CE QUI CHANGE POUR LE PRATICIEN

**Avant** : le score Réactivité venait d'une moyenne TFM générique mêlant `dj`/`sldj` (poids 3,
réellement diagnostiques) avec CMJR (poids 3, alors qu'il n'a jamais été une preuve diagnostique
valide), Repeated Hop (poids 2), Heel Raise (poids 1) et plusieurs tests de force segmentaire
(poids 2) sans lien diagnostique établi avec la réactivité.

**Après** : le diagnostic de Réactivité repose exclusivement sur `dj_rsi` **et** `sldj_rsi`,
conjointement déficitaires pour retenir l'hypothèse (règle "2/2" déjà documentée) ; une seule
preuve déficitaire produit un signal (`Suspectée`), jamais un diagnostic retenu.

- **Variables diagnostiques** : `dj_rsi`, `sldj_rsi` — les deux seules, toujours classifiables.
- **Variables explicatives** : temps de contact, hauteur de saut, force/puissance propulsive et
  d'atterrissage (DJ/SLDJ), CMJR, Repeated Hop — lues et exposées pour traçabilité, mais
  aujourd'hui **aucune n'a de seuil clinique** : elles ne peuvent jamais faire progresser la
  confiance du diagnostic au-delà de « Retenue/Faible ».
- **Rôle des asymétries** : le LSI D/G de SLDJ précise le profil, ne déclenche jamais de diagnostic
  à lui seul.
- **Tests exclus** : Heel Raise et Side Hop n'ont plus aucun rôle dans le score de Réactivité,
  quelle que soit leur valeur.
- **États possibles** : Absente / Suspectée / Retenue-Faible (Retenue-Modérée/Forte existent dans
  le modèle mais ne sont jamais atteints aujourd'hui, faute de seuil sur les confirmatives/
  explicatives).
- **Limites** : CMJR, Repeated Hop et les variables mécaniques secondaires de DJ/SLDJ sont
  mesurées mais ne peuvent aujourd'hui rien confirmer numériquement — elles restent visibles dans
  le détail technique (`hypRea01`), pas encore affichées à l'écran (aucun écran n'a été modifié par
  cette mission).

---

## RÉSUMÉ FINAL

- **Tests ajoutés** : 18 (`tests/hypReactivity01.test.js`).
- **Tests existants passés** : tous (16 fichiers `tests/*.test.js` préexistants, aucune
  régression).
- **Fichiers modifiés** : `index.html` (+170/-0 lignes).
- **Fichiers créés** : `tests/hypReactivity01.test.js`, `IMPLEMENTATION_HYP_REA01.md`.
- **Confirmation** : les 7 autres qualités (Mobilité, Force, Puissance, Explosivité, Absorption,
  Stabilisation, Endurance) produisent des sorties strictement inchangées — vérifié par tests
  dédiés et par relecture du code (le bloc HYP-REA-01 n'écrit que `fSc['Réactivité']`).

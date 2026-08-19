# Implémentation — HYP-PUI-01 dans Kinexus

**Statut** : implémenté et branché en production dans `index.html`. `fSc['Puissance']` (sortie de
`computeMoteur()`) est désormais produit **intégralement** par le raisonnement clinique
HYP-PUI-01, y compris quand il ne peut rien déterminer aujourd'hui.

Règle diagnostique gelée, non rouverte : `cmj_peak_power` **et** `slcmj_peak_power` conjointement
déficitaires (2/2). Une seule des deux déficitaire = pas de diagnostic retenu.

---

## 1. Fichiers modifiés

- **`index.html`** — seul fichier de production modifié. Purement additif : **+202 lignes,
  0 suppression** (`git diff --stat`). Deux insertions, immédiatement après le bloc HYP-MOB-01 :
  1. `computeHypPowerCmj`, `computeHypPowerSlcmj`, `computeHypPowerSubstitutes`,
     `computeHypPowerCapacite`, `computeHypPowerStrategie`, `computeHypPower01` — avant
     `computeMoteur()`.
  2. Un bloc d'intégration à l'intérieur de `computeMoteur()`, après le bloc HYP-MOB-01, qui
     remplace `fSc['Puissance']`.

## 2. Fichiers créés

- `tests/hypPower01.test.js` — 15 tests.
- Ce document.

---

## 3. Ce qui change par rapport à Absorption / Réactivité / Mobilité — divergence assumée

Les trois moteurs déjà en production conservent un **repli sur l'ancien score TFM générique**
quand HYP ne peut rien déterminer. Pour HYP-PUI-01, sur instruction explicite de la mission
(*"Mieux vaut NON DÉTERMINABLE qu'un diagnostic faux construit avec une variable de substitution
non validée"*), **ce repli n'existe pas** : `fSc['Puissance']` est **toujours** entièrement
remplacé par le résultat HYP, y compris quand celui-ci vaut `status:null` (non déterminable). Ce
choix est documenté ici précisément parce qu'il diverge du pattern établi — ce n'est pas un oubli.

## 4. Variables diagnostiques — vérification réelle

| Variable | Test | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `cmj_peak_power` | `cmj` (bilatéral) | NORMS très large (41 populations + 4 par âge) | **Classifiable** |
| `slcmj_peak_power` | `slcmj` (unilatéral D/G) | Aucune (ni NORMS ni THRESHOLDS) | **Jamais classifiable aujourd'hui** |

`slcmj_peak_power` est résolu par côté (`bestVal` D/G) avec lecture "pire côté", même pattern que
`sldj_rsi` (HYP-REA-01) et `wblt_distance` (HYP-MOB-01).

## 5. Preuves de substitution (gel point 5)

`dj_peak_prop_power`, `sldj_peak_prop_power`, `cmjr_peak_power` sont lues et structurées dans
`substitution.candidates`, mobilisées **uniquement** si `slcmj_peak_power` est indisponible
(jamais en renfort à poids égal — décision déjà gelée, non rouverte). Vérification directe :
**aucune des trois n'a de seuil** dans `index.html` aujourd'hui — la branche de substitution est
donc structurellement inerte, mais le mécanisme complet (recherche, sélection du premier substitut
classifiable) est implémenté et testé, prêt à s'activer automatiquement dès qu'une norme existera
pour l'une des trois (aucun code à réécrire).

## 6. Logique du Niveau 1

```
cmjClassified = cmj_peak_power a un statut réel (vert/jaune/orange/rouge)
secondClassified = (slcmj_peak_power OU le premier substitut classifiable) a un statut réel

si NON (cmjClassified ET secondClassified) :
    state = 'non_determinable'   ← jamais 'absente', jamais un statut inventé
sinon :
    2 déficitaires → 'retenue_faible'
    1 déficitaire  → 'suspectee'
    0 déficitaire  → 'absente'
```

`support` reste plafonné à `{level:'faible'}` quand `retenue_faible` — aucune confirmative ni
explicative n'est aujourd'hui classifiable, donc jamais `moderee`/`forte` (même limite déjà
documentée pour Réactivité).

## 7. `cmj_height` — confirmative gelée, jamais une deuxième preuve

`cmj_height` est classifiable (THRESHOLDS + NORMS large) mais **structurellement exclue** du
calcul de convergence : `confirmativeEvidence.cmj_height.countsAsDiagnostic` est toujours `false`,
et son statut n'entre jamais dans `convergence.mechanismsInvolved`. Vérifié explicitement par
test (cas 6, mission §10) : un `cmj_height` très déficitaire, avec `slcmj_peak_power`
non classifiable, laisse le résultat à `non_determinable` — **jamais** transformé en diagnostic
via `cmj_height`.

## 8. Capacité / Stratégie

Structure préservée (`HYP_PUI01_REGLE_FINALE_GELEE.md`), jamais rouverte :

- **Capacité** (physiologique — Force/RFD/TTPF/Profil Force-Vitesse) : extrait représentatif
  (`iso_belt_squat_n`, `imtp_rfd100`, `imtp_ttpf`, `profil_fv_v0`) des 34 variables documentées.
  Les variables « force » du CMJ/SLCMJ **ne sont jamais déplacées ici** — la Capacité reste fondée
  sur les tests de force dédiés, conformément à l'instruction explicite de la mission.
- **Stratégie** (biomécanique — exécution CMJ/SLCMJ) : extrait représentatif (`cmj_depth`,
  `cmj_conc_rfd`) des 29 variables documentées.

Ces deux branches sont exposées pour traçabilité, **jamais classifiées, jamais génératrices** du
Niveau 1 — vérifié par test (cas 7, mission §10).

**Non implémenté ici, volontairement** : le sous-modèle Capacité/Stratégie/Mixte/Non-discriminable
complet (`HYP_PUI01_REGLE_FINALE_GELEE.md`, machine à états à part entière) n'est pas construit
dans ce moteur. Il présuppose un déficit de Puissance déjà retenu (2/2) pour s'activer — hors
d'atteinte aujourd'hui puisque `slcmj_peak_power` n'a aucun seuil. L'implémenter maintenant
reviendrait à construire une machine à états qui ne recevra jamais d'entrée réelle avant qu'une
norme n'existe — hors périmètre utile de cette mission, qui porte sur le diagnostic 2/2 lui-même.

## 9. Intégration dans `computeMoteur()`

Après le bloc HYP-MOB-01 (inchangé), un bloc dédié réécrit **intégralement** `fSc['Puissance']` :
`status` vaut `null` si `state==='non_determinable'`, sinon dérivé de l'état
(`absente`→vert, `suspectee`→jaune, `retenue_*`→orange, ou rouge si les deux preuves sont
littéralement `'rouge'`). `hypPui01` (objet complet) est toujours attaché pour traçabilité.
`fSc[fn]` reste un objet non-`null` (jamais l'ancienne convention `fSc[fn]=null` du moteur
générique) — les consommateurs existants (`deficits`, priorités) traitent `status:null` exactement
comme l'absence de déficit, sans modification nécessaire de leur logique.

Aucune autre qualité, aucun autre output de `computeMoteur` n'est touché par ce bloc.

---

## 10. Tests

`tests/hypPower01.test.js` — **15 tests, tous passants** :

1-4, 8. Les 4 combinaisons "non déterminable" (SLCMJ non classifiable, CMJ+SLCMJ non classifiables,
CMJ seul actif, aucune donnée) → toutes `non_determinable`, `status:null`.
5. Substitution DJ tentée mais non classifiable → reste `non_determinable`, jamais "normale".
6. `cmj_height` déficitaire → ne devient jamais une deuxième preuve.
7. Capacité/Stratégie déficitaires → ne créent jamais le diagnostic seules.
- 3 tests supplémentaires **valident le mécanisme de convergence lui-même** (2/2 → `retenue_faible`,
  1/2 → `suspectee`, 0/2 → `absente`) en injectant temporairement une norme de test pour un
  substitut, en mémoire, uniquement le temps du test — **aucune norme n'est ajoutée dans
  `index.html`** ; ceci prouve que le moteur est réellement prêt à exploiter une deuxième preuve
  dès qu'une norme réelle existera, sans preuve numérique fictive dans le code de production.
- Non-régression : Réactivité et Mobilité (les deux autres qualités déjà pilotées par HYP)
  inchangées ; structure complète de `computeMoteur()` préservée ; pureté fonctionnelle.

**Point méthodologique découvert en écrivant les tests, non causé par ce moteur** : `cmj_peak_power`
appartient au test `cmj`, dont le statut générique (`computeTestStatus`) alimente encore, via le
repli TFM, plusieurs qualités non pilotées par HYP (Force, Explosivité, Endurance, Stabilisation) —
et le repli TFM d'Absorption elle-même quand son Core HYP est non déterminable. Le test de
non-régression est donc restreint à Réactivité et Mobilité, seules qualités totalement
indépendantes de `cmj` aujourd'hui.

**Régression complète** : les 18 fichiers de tests (dont ce nouveau fichier) réexécutés
intégralement — **tous passants, aucun changement de résultat**. Vérification syntaxique complète
du contenu `<script>` d'`index.html` (`node --check`) — **OK**. `git diff` confirmé purement
additif (+202/-0 dans `index.html`).

---

## CE QUI CHANGE POUR LE PRATICIEN

Le diagnostic de Puissance repose désormais sur **CMJ Peak Power + SLCMJ Peak Power**, avec une
exigence de convergence 2/2 (les deux déficitaires conjointement).

### LIMITATION ACTUELLE

`cmj_peak_power` est normé. `slcmj_peak_power` ne l'est pas actuellement, ni aucune des trois
preuves de substitution prévues pour son absence (`dj_peak_prop_power`, `sldj_peak_prop_power`,
`cmjr_peak_power`). **Le moteur est prêt**, mais le diagnostic reste aujourd'hui `non_determinable`
dans l'immense majorité des cas — dès qu'une norme fiable existera pour l'une de ces quatre
variables, le diagnostic s'activera automatiquement, sans modification de code.

### CE QUI NE CHANGE PAS

`cmj_height` reste confirmative — jamais une deuxième preuve, quel que soit son statut. Les
variables explicatives (Capacité physiologique, Stratégie d'exécution CMJ/SLCMJ) restent
explicatives — aucune n'est promue diagnostique.

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+202/-0 lignes).
- **Fichiers créés** : `tests/hypPower01.test.js`, `IMPLEMENTATION_HYP_PUI01.md`.
- **Tests ajoutés** : 15, tous passants.
- **Tests existants passés** : tous (17 fichiers préexistants, aucune régression).
- **Autres qualités modifiées** : NON — vérifié par tests et relecture (le bloc HYP-PUI-01 n'écrit
  que `fSc['Puissance']`).
- **Règle 2/2 modifiée** : NON.
- **Seuil inventé** : NON.
- **HYP-PUI-01 réellement actif** : le moteur est branché et opère à chaque calcul, mais produit
  aujourd'hui `non_determinable` (`status:null`) dans la quasi-totalité des cas réels, faute de
  seconde norme — comportement honnête et voulu.

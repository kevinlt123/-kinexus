# Implémentation — Lot A UX Saisie
« Sécuriser et fluidifier la saisie »

Mission d'implémentation faisant suite à `AUDIT_UX_SAISIE_KINEXUS_V1.md` (lecture seule, commit
`b0afde5`). Périmètre strictement UX de saisie — **aucune modification** des 8 moteurs HYP, de
CSM, de `HYP_QUALITY_RELATIONS`, des règles diagnostiques/confirmatives/explicatives/de convergence,
des normes, des seuils, de `TFM`, de `VAR_REL3`, du catalogue de tests (`TBK`), ni du design global.
Aucun nouveau système visuel : tous les éléments ajoutés réutilisent `Btn`, la barre de progression
et le motif de callout déjà présents dans le code.

---

## 1. Perte de données

Confirmé exactement comme documenté par l'audit, avant toute modification : un bilan en cours de
saisie n'existe qu'en état React local (`TestEntry`) jusqu'au clic « Analyser ». Le bouton
« ← Retour » du bas de la liste de tests appelait directement `props.onCancel()`, qui renvoie à la
fiche sportif sans jamais avoir persisté `testData`. Reproduit : WBLT rempli à 25 cm, clic direct
sur ce bouton → « Aucun bilan réalisé. » (confirmé avant modification, voir historique de conversation
de la mission d'audit).

---

## 2. Solution

Le bouton « ← Retour » du bas de liste passe désormais par `requestLeave()` :

```js
function requestLeave(){
  if(bilanHasRealData(testData))setConfirmLeave(true);
  else props.onCancel();
}
```

Si aucune valeur réelle n'existe (CAS A), le retour est immédiat, sans confirmation inutile —
conforme à l'Objectif 1/Scénario 1. Sinon (CAS B), un bandeau de confirmation apparaît, réutilisant
le motif déjà présent dans l'application (callout bordé + 2 boutons, même famille visuelle que le
bandeau « Validation expert requise » de `AnalyseView`) :

> **⚠️ Mesures non enregistrées**
> Vous avez des mesures non enregistrées. Voulez-vous vraiment quitter ce bilan ?
> [Continuer le bilan] [Quitter le bilan]

Aucun terme technique (« React », « état local », « session », « données non persistées ») —
uniquement le vocabulaire du praticien, conforme à l'instruction explicite de la mission.

**Ajustement fait pendant l'implémentation, non prévu explicitement par la mission** : l'exemple de
la mission proposait le libellé « Quitter » pour l'action destructive. Or l'application affiche déjà
en permanence, dans l'en-tête, un bouton « Quitter » global (déconnexion complète, visible en mode
« Continuer sans compte »). Les deux boutons « Quitter » auraient coexisté à l'écran avec des
conséquences radicalement différentes (fermer un bilan vs se déconnecter) — risque de confusion
directement contraire à l'esprit de la mission (« message clair, orienté utilisateur »). Le bouton de
confirmation a donc été libellé **« Quitter le bilan »**, sans ambiguïté avec le bouton d'en-tête,
repéré et corrigé lors de la vérification navigateur réelle (Partie 11).

---

## 3. Définition d'une donnée saisie

Nouvelle fonction pure `testHasAnyTrialValue(data)` (ajoutée près de `computeTestStatus`, jamais
lue par HYP/CSM/TFM) : vraie si `data.trials`, `data.D.trials` ou `data.G.trials` contient au moins
une valeur non nulle. `bilanHasRealData(testData)` l'applique à tous les tests du bilan.

Inventaire des 8 cas demandés par l'Objectif 1A, chacun vérifié par un test unitaire dédié
(`tests/uxSaisieLotA.test.js`) :

| Cas | Comportement |
|---|---|
| Test sélectionné sans valeur | Ne déclenche jamais la confirmation (`{active:true}` → `false`) |
| Une seule valeur | Déclenche la confirmation |
| Plusieurs essais (dont certains vides) | Déclenche dès qu'un seul essai réel existe |
| Valeur à Droite uniquement | Déclenche |
| Valeur à Gauche uniquement | Déclenche |
| Import CSV | Déclenche — `onImport()` écrit dans exactement la même structure `trials` que la saisie manuelle, donc couvert sans code spécifique |
| Valeur calculée automatiquement (`lsiAuto`) | Ne compte jamais seule — un LSI ne peut de toute façon exister sans essais réels en amont ; vérifié explicitement pour ne jamais produire un faux positif |
| Suppression de la dernière valeur | Le calcul est refait à chaque rendu à partir de `testData` (pas de drapeau persistant) — supprimer le seul essai réel fait retomber `bilanHasRealData` à `false` immédiatement |

Comportement cohérent sur les 8 cas — aucune exception, aucun cas particulier codé en dur.

---

## 4. États de complétion UX

Nouvelle fonction pure `testCompletion(test,data)` : compte, sur le total de KPI d'un test, combien
ont au moins une valeur réellement saisie (`filled`/`total`). **Jamais un statut clinique** — un
KPI sans seuil compte de la même façon qu'un KPI diagnostique, c'est un simple décompte de champs
remplis.

Dans la liste de tests (`TestEntry`), le rendu de chaque ligne distingue désormais :

- **Non commencé** (inchangé) : case non cochée, aucune mention.
- **Sélectionné, aucune valeur** (Objectif 2A) : case cochée, chip gris neutre
  « Sélectionné · non renseigné » — **le point de couleur clinique n'apparaît plus jamais** pour un
  test à 0 valeur (avant ce lot, `computeTestStatus` retombait sur `'jaune'` par défaut faute de
  valeur, indiscernable d'un vrai résultat « à surveiller » — corrigé en ne calculant `status` que
  lorsque `comp.filled>0`, sans toucher à `computeTestStatus` lui-même).
- **En cours / Renseigné** : dès qu'au moins une valeur existe, un chip discret « X/N » (compte des
  KPI remplis) apparaît à côté du point de couleur clinique existant (inchangé, même fonction
  `computeTestStatus`, même seuils).

---

## 5. Validation du bilan

`AnalyseView` calcule désormais `canValidate=bilanHasRealData(td)`. Quand `canValidate` est faux, le
bouton « Valider le bilan » est **remplacé** (pas seulement désactivé, pour éviter l'ambiguïté d'un
bouton grisé sans explication) par : « Ajoutez au moins une mesure avant de valider le bilan. »
(orange, même registre que les autres messages d'alerte de l'app). Aucune règle « 100 % des tests
obligatoires » n'a été inventée — un bilan partiel (ex. 3 tests renseignés sur 8 cochés) reste
validable dès qu'au moins une mesure réelle existe, conformément au comportement déjà en place et à
l'instruction explicite de l'Objectif 3.

---

## 6. Navigation

`TestDetailPage` reçoit 4 nouvelles props purement additives : `navIndex`, `navTotal`, `onPrev`,
`onNext`. Calculées dans `TestEntry` à partir de `activeTestKeys=TESTS.filter(actifs).map(key)` —
**l'ordre du catalogue déjà existant**, jamais un nouvel ordre clinique (Objectif 4A). Le bouton
« ‹ Test précédent » / « Test suivant › » n'apparaît que lorsque `navTotal>1`, et seulement dans le
sens où un test existe (pas de retour circulaire). Le parcours existant (liste complète via
« ← Retour ») reste intact et inchangé — c'est un raccourci ajouté, pas un remplacement.

Aucune étape de « validation » séparée n'a été nécessaire entre deux tests : `onChange` écrit déjà
dans `testData` à chaque frappe (mécanisme préexistant, non modifié) — passer directement au test
suivant ne perd donc jamais la saisie du test quitté, sans code supplémentaire.

---

## 7. Progression

La barre de progression déjà utilisée pour les qualités fonctionnelles (`Card` + piste grise 7px +
remplissage arrondi) est réutilisée à l'identique dans `TestEntry` (sous l'en-tête) et dans
`AnalyseView` (dans le bandeau de validation), avec un seul changement délibéré : la couleur de
remplissage est `C.teal` (accent neutre de l'application), **jamais** `SC[status]` (palette
clinique vert/jaune/orange/rouge) — conformément à l'Objectif 6 (« la progression ne doit jamais
être interprétée comme une qualité ou un score »). Libellé : « X / Y tests renseignés », où Y est
le nombre de tests cochés et X le nombre de tests cochés avec au moins une valeur réelle
(`testHasAnyTrialValue`).

---

## 8. Asymétries

Inventaire exhaustif effectué avant toute décision (Objectif 5), par lecture directe du code
(commentaires déjà rédigés par une mission antérieure, `CMJ_VAR_META`/`ASYM_PERFORMANCE_EQUIVALENT`/
`ASYM_SIDE_PAIRS`, lignes ~4265-4340 avant ce lot) :

| KPI d'asymétrie (CMJ) | Paire G/D dans `TBK` ? | Formule G/D→asymétrie déjà codée dans Kinexus ? | Décision |
|---|---|---|---|
| `ecc_decel_rfd_asym` | Oui (`ecc_decel_rfd_L`/`_R`) | **Non** | Saisie manuelle conservée |
| `landing_peak_force_asym` | Oui (`landing_peak_force_L`/`_R`) | **Non** | Saisie manuelle conservée |
| `ecc_decel_impulse_asym` | Non | Non | Saisie manuelle conservée |
| `conc_force_impulse_asym` | Non | Non | Saisie manuelle conservée |
| `force_peak_power_asym` | Non | Non | Saisie manuelle conservée |
| `p2_conc_impulse_asym` | Non | Non | Saisie manuelle conservée |

**Constat déterminant** : `ASYM_SIDE_PAIRS` (référentiel déjà présent, non modifié) existe bien pour
2 des 6 KPI, mais il sert **exclusivement** à `asymMembreDominant()` — une fonction qui détermine
qualitativement quel côté est le moins bon (« Gauche »/« Droit »/« Indéterminé »), **jamais** à
calculer la valeur numérique du pourcentage d'asymétrie lui-même. Le KPI `_asym` est, dans le code
actuel, toujours lu comme une valeur directement saisie ou importée
(`cmjValues[kpiKey]` dans `asymEntryBuild`), jamais dérivée d'un calcul Gauche/Droite. Kinexus n'a
donc, à ce jour, **jamais défini** la formule de conversion Gauche/Droite → pourcentage d'asymétrie
pour aucun des 6 KPI — y compris les 2 qui disposent d'une paire de valeurs brutes.

---

## 9. Formules réutilisées

**Aucune.** Conformément à l'Objectif 5B (« NE PAS inventer une formule ») : comme documenté en
Partie 8, il n'existe aucune formule Gauche/Droite→asymétrie déjà utilisée par Kinexus à réutiliser
— seulement une convention de détermination du côté dominant, qui n'est pas une formule de calcul
de valeur. Inventer une formule (ex. `(G-D)/moyenne×100`, convention ForceDecks courante mais non
documentée dans ce logiciel) aurait été une invention non vérifiable, explicitement interdite deux
fois par la mission. **Les 6 KPI restent donc en saisie manuelle, sans aucune modification de
`TrialIn`, `TBK.cmj`, ni d'aucune autre donnée.** Documenté et testé (`tests/uxSaisieLotA.test.js`,
CAS 13/14) : `ASYM_SIDE_PAIRS` reste identique avant/après, `TBK` reste identique avant/après.

---

## 10. Tests

Nouveau fichier `tests/uxSaisieLotA.test.js` (46 assertions), couvrant les 15 cas mandatés par
l'Objectif 9 :

1-2. Retour sans données / avec données — `testHasAnyTrialValue` sur les 8 cas de l'Objectif 1A.
3. Confirmation — `bilanHasRealData` sur bilans à 1/plusieurs tests, avec/sans valeur réelle.
4-5. Annulation/sortie confirmée — comportement de câblage (Continuer/Quitter) vérifié en
   navigateur réel (Partie 11), les fonctions de décision sous-jacentes testées ici.
6-7. Test sélectionné sans valeur / réellement renseigné — `testCompletion` sur WBLT (1 KPI) et
   CMJ (51 KPI, partiellement rempli).
8-9. Validation bilan vide (bloquée) / bilan partiel (autorisée + progression) — `bilanHasRealData`
   + comptage `testsCnt`/`testsFilledCnt`, et vérification explicite qu'aucune règle « 100 % »
   n'est appliquée.
10-11. Navigation test suivant/précédent — ordre `activeTestKeys` dérivé du catalogue `TESTS`,
   bornes (pas de suivant depuis le dernier, pas de précédent depuis le premier).
12. Conservation des données pendant la navigation — `activeTestKeys` est une dérivation pure,
   aucune mutation de `testData` ; `updateTrials` non modifié.
13-14. Asymétries calculée/non dérivable — inventaire figé par test (Partie 8/9).
15. Non-régression stricte — `functionScores`/`priorities`/`clinicalSynthesis`/`TFM`/`VAR_REL3`/
   `HYP_QUALITY_RELATIONS`/`TBK` comparés `deepStrictEqual` avant (`b0afde5`) / après, sur 4
   scénarios réels.

Résultat : **46 passés, 0 échoué**. Suite complète : **35 fichiers de tests, 0 échec**.

---

## 11. Vérification navigateur

Serveur local + Chromium/Playwright, scénario réel reproduisant exactement le cas de l'audit
(création d'un sportif, bilan Performance/Pré-saison, WBLT = 25 cm) :

- **Scénario 1** (test sélectionné, 0 valeur, retour) : confirmation absente — confirmé.
- **Scénario 2/3** (WBLT=25 cm, retour bas-de-liste) : bandeau « ⚠️ Mesures non enregistrées »
  affiché, capture à l'appui — la naissance ambiguë du libellé « Quitter » (collision avec le bouton
  d'en-tête) a été détectée à cette étape et corrigée en « Quitter le bilan » (Partie 2).
- **Annulation** (« Continuer le bilan ») : bandeau disparaît, écran de saisie inchangé, aucune
  perte.
- **Sortie confirmée** (« Quitter le bilan ») : retour à la fiche sportif — perte du brouillon non
  analysé, mais désormais **un choix informé du praticien**, plus jamais silencieux.
- **Chip « Sélectionné · non renseigné »** : capturé sur « Isometric Belt Squat » coché sans
  donnée — aucun point de couleur, aucun faux signal clinique.
- **Navigation directe** : avec 2 tests actifs, « 2 / 2 de la batterie » affiché correctement,
  « ‹ Test précédent » ramène directement sur WBLT sans repasser par la liste de 49 lignes.
  Avec 1 seul test actif, aucun bouton de navigation affiché (pas de faux raccourci vers nulle
  part).
- **Progression** : « 1 / 2 tests renseignés » (barre teal, 50 %) sur l'écran de saisie ;
  « 0 / 1 tests renseignés » + message de blocage sur `AnalyseView` pour un bilan à 0 valeur ;
  « Valider le bilan » redevient disponible dès qu'au moins une valeur existe, même bilan partiel.

Toutes les captures et sorties console ont été inspectées directement (pas seulement les tests
unitaires), conformément à l'instruction explicite de l'Objectif 10.

---

## 12. Non-régression

Comparaison stricte automatisée (`deepStrictEqual`) entre le commit `b0afde5` (dernier commit avant
ce lot) et l'état courant, sur 4 scénarios cliniques (WBLT, CMJ/Absorption, Force/imtp+slimtp,
aucune donnée) :

- `functionScores`, `priorities`, `clinicalSynthesis` : **identiques bit à bit**.
- `TFM`, `VAR_REL3`, `HYP_QUALITY_RELATIONS`, `TBK` (catalogue de tests/KPI) : **identiques**.

Aucune régression détectée. Seules les fonctions de présentation/navigation (`TestEntry`,
`TestDetailPage`, `AnalyseView`) et 3 nouvelles fonctions pures additives
(`testHasAnyTrialValue`, `bilanHasRealData`, `testCompletion`) ont changé — aucune d'elles n'est
lue par le pipeline `computeMoteur()`.

---

## 13. Éléments volontairement non modifiés

- Les 8 moteurs HYP, CSM, `HYP_QUALITY_RELATIONS`, les règles diagnostiques/confirmatives/
  explicatives/de convergence, les normes, les seuils, `TFM`, `VAR_REL3` — vérifié par
  `deepStrictEqual` (Partie 12).
- `TBK` (catalogue de 49 tests, tous les KPI, y compris les 6 KPI d'asymétrie CMJ) — inchangé,
  vérifié par test dédié.
- `updateTrials`, `TrialIn.add()/set()/del()`, `onImport()` — mécanismes de saisie déjà existants,
  strictement inchangés ; la navigation directe et la confirmation de sortie s'appuient dessus sans
  les modifier.
- `computeTestStatus` — non modifié ; simplement plus jamais appelé quand aucune valeur n'existe
  (l'appel est gaté en amont dans `TestEntry`, pas dans la fonction elle-même).
- Le design global, les couleurs de statut clinique (`SC`/`SL`), le composant `Btn`, le motif de
  callout, la barre de progression — tous réutilisés à l'identique, aucune nouvelle identité
  graphique créée.
- Le PDF (`buildSportifReport`/`buildExpertReport`) — non concerné par ce lot, aucune donnée de
  saisie nouvelle n'a été introduite qui nécessiterait d'y apparaître.
- Le parcours de saisie existant (liste complète des 49 tests) — conservé intact ; la navigation
  directe est un raccourci additif, jamais un remplacement.

---

## 14. Limites restantes

- **CAS A/B du non-déterminable** (distinguer « jamais testé » de « testé sans norme applicable »,
  identifié par l'audit de productisation antérieur) reste hors périmètre de ce lot — non touché.
- Le chip de complétion « X/N » ne distingue pas les KPI réellement attendus des KPI purement
  informatifs pour les tests à très nombreux KPI (CMJ, 51 KPI) — un praticien qui n'utilise que
  l'import CSV pour ces tests (chemin recommandé par l'audit) ne sera de toute façon jamais bloqué
  par ce chip, puisqu'il ne s'affiche que pour information, jamais comme condition.
- Les 6 KPI d'asymétrie CMJ restent en saisie manuelle (Partie 8/9) — une amélioration future
  nécessiterait une décision clinique explicite du praticien sur la formule à adopter, hors
  périmètre technique de ce lot.
- Aucune présélection de tests par type de bilan (Performance/RTP/Screening/Suivi) n'a été ajoutée
  — identifiée par l'audit comme amélioration UTILE, pas CRITIQUE/IMPORTANT, donc non traitée dans
  ce Lot A.
- Le plafond de 3 essais par KPI n'est toujours pas explicitement documenté à l'écran avant le
  premier clic — identifié par l'audit comme amélioration mineure, non traité ici.

---

## 15. Proposition éventuelle du Lot B

Reprend directement la proposition de `AUDIT_UX_SAISIE_KINEXUS_V1.md` §16-17 (LOT B — Amélioration
UX intermédiaire), à valider séparément : mise en avant contextuelle de l'import CSV sur les tests à
forte densité de KPI (CMJ, `repeated_hop`), présélection de tests par type de bilan, et
documentation explicite du plafond de 3 essais. Aucune de ces pistes ne touche au raisonnement
clinique ni au design global — même philosophie que ce Lot A.

---

## Résumé des fichiers modifiés

- `index.html` : 113 insertions / 5 suppressions (présentation/navigation/wording uniquement,
  syntaxe vérifiée par `node --check` après chaque lot de modifications).
- `tests/uxSaisieLotA.test.js` (nouveau, 46 assertions).

# IMPLEMENTATION_PREVALIDATION_KINEXUS_V1.md — 3 corrections finales avant gel produit

**Type** : Mission d'implémentation, strictement bornée à 3 objectifs (pagination PDF expert, navigation
Expert, formulations résiduelles). Aucune modification du moteur clinique, des données, des seuils ou des
règles diagnostiques.

## 1. Objectifs

1. Corriger la pagination du PDF expert (pages presque vides sur bilan peu renseigné).
2. Clarifier la navigation Expert (10 sous-onglets, collision de libellé « Raisonnement » / « Fil de
   Raisonnement »), sans supprimer ni fusionner aucune vue.
3. Nettoyer les deux formulations explicitement identifiées (« Confiance elevee », « de Absorption ») et
   effectuer un balayage ciblé du même type d'erreur ailleurs dans l'interface et les PDF.

Périmètre volontairement petit : aucune amélioration clinique, aucune refonte de design, aucun nouveau
moteur. Toute idée sortant de ce périmètre est documentée en §13 comme candidate V1.1, jamais codée.

## 2. État initial

Point de départ : verdict B de `AUDIT_FINAL_UX_UI_KINEXUS_V1.md` (commit `c9d75a3`), qui identifiait
précisément les trois problèmes ci-dessus comme seuls obstacles à un verdict A. Tous les éléments listés
comme stabilisés dans ce même audit (8 moteurs HYP, CSM, Synthèse clinique, Déficits à investiguer, saisie
Lot A, 4 vues Fonctions/Variables/Capacités/Raisonnement, PDF sportif) ont été traités comme gelés dès le
départ — voir §12.

## 3. Correction PDF expert (Objectif 1)

**Cause exacte** : `buildExpertReport()` enveloppe chacune de ses 3 sections (Fonctions+Synthèse clinique ;
Résultats bruts ; Systèmes+Hypothèses+Orientations+RTP) dans un `<div class="print-page">`, dont la classe
partagée impose `min-height:100vh; page-break-after:always`. Quand une section est courte (peu de tests
actifs), le navigateur la remplit quand même à la hauteur d'une page pleine avant de forcer un saut de page
— d'où des pages presque vides. Cette même classe `.print-page` est utilisée par `buildSportifReport()`
pour ses propres pages (fond plein-bleed page 2, mise en page à 3 pages fixes) : il fallait donc corriger
sans jamais toucher au comportement de `.print-page` seul.

**Fix appliqué** (`index.html`) :
- Nouvelle classe modificatrice `.print-page-expert`, ajoutée en plus de `print-page` (jamais à sa place)
  sur les 3 divs de `buildExpertReport()` uniquement. Sélecteur composé `.print-page.print-page-expert`
  (2 classes, spécificité CSS supérieure à `.print-page` seul) : `min-height:0; page-break-after:auto` —
  les sections s'enchaînent désormais selon leur contenu réel, jamais forcées à occuper une page pleine.
  `buildSportifReport()` n'applique jamais cette classe : son comportement est inchangé par construction,
  pas seulement par vérification (voir §10).
- `.print-header` et `.print-section-title` (exclusivement utilisées par le rapport expert) : ajout de
  `page-break-after:avoid` pour qu'un titre ne reste jamais seul en bas de page.
- `.print-card` et `.print-rtp-box` (idem, expert uniquement) : `page-break-inside:avoid`, pour qu'une
  carte (hypothèse, orientation, statut RTP) ne soit jamais coupée entre deux pages.
- `.print-table` : `tr{page-break-inside:avoid}` (une ligne de résultat n'est jamais coupée) et
  `thead{display:table-header-group}` (si le tableau des résultats bruts s'étend malgré tout sur plusieurs
  pages, l'en-tête se répète — jamais de colonnes de chiffres sans légende).

Ces règles sont dupliquées à l'identique dans les deux endroits où le CSS d'impression existe dans le code
(le `<style>` global de l'application, utilisé par l'aperçu imprimé de secours, et le `<style>` autonome
généré par `buildFullReportHtml()`, qui accompagne le fichier HTML téléchargé) — comportement cohérent que
le praticien ouvre le fichier téléchargé ou imprime directement depuis l'application.

**Aucun contenu supprimé ni condensé, aucun ordre clinique modifié, texte de la Synthèse clinique
inchangé** — seule la mise en page a changé.

## 4. Tests PDF (CAS A/B/C)

Trois bilans réels générés via le moteur réel (`computeMoteur` + `buildFullReportHtml('expert', …)`,
extraits tels quels du code de production, jamais réimplémentés) puis rendus en PDF réel (impression
Chromium via Playwright, format A4) :

| Cas | Contenu | Pages avant | Pages après |
|---|---|---|---|
| A — très peu de données | 1 test actif (WBLT seul) | 4 | **2** |
| B — bilan moyen | 4 tests (WBLT, CMJ, Landing Unilatéral, Isometric Belt Squat) | 4 | **2** |
| C — bilan très complet | 16 tests actifs, 6 catégories | 4 | **2** |

Avant correction, les 3 cas produisaient systématiquement 4 pages physiques quelle que soit la quantité de
données — signature exacte du bug (`min-height:100vh` forçant un dépassement d'une page pleine par
section, y compris pour un contenu minime). Après correction, les 3 cas produisent 2 pages, dont le
contenu s'ajuste à la quantité réelle de données (CAS C, le plus dense, remplit visiblement plus les 2
pages que CAS A sans jamais déborder sur une 3e page inutile).

Inspection visuelle (capture d'écran du HTML réel, mode écran) sur CAS A et CAS C : aucune page quasi
vide, aucun titre de section isolé en bas de page, le tableau « Résultats bruts par test » (jusqu'à 9
lignes sur CAS C) reste un bloc continu et lisible, les cartes « Hypothèses cliniques » / « Orientations »
(y compris les 4 puces de sous-domaines d'Absorption) restent intactes et groupées. Le PDF sportif a été
régénéré séparément (même harnais) : structure à 3 pages strictement identique à l'avant (voir §10).

## 5. Audit des 13 destinations Expert (Objectif 2)

| Destination | Fonction réelle | Public cible | Fréquence | Risque de confusion | Recommandation |
|---|---|---|---|---|---|
| Expert (onglet) | Point d'entrée du détail par bilan | Kiné | Très haute | Aucun | Ne rien changer |
| Mouvement (onglet) | Analyse biomécanique CMJ par phase | Kiné/expert | Moyenne | Aucun | Ne rien changer |
| Fil de Raisonnement (onglet) | Chaîne de priorités phase par phase, avec l'arbre de conditions vérifiées | Kiné/expert | Moyenne | **Oui — avec le sous-onglet "Raisonnement"** | Garder ce libellé (déjà distinctif), renommer l'autre |
| Historique (onglet) | Bilans précédents du même athlète | Kiné | Basse | Aucun | Ne rien changer |
| Fonctions (sous-onglet) | Détail par qualité (couverture, confiance, tests contributeurs) | Kiné | Très haute | Aucun | Ne rien changer |
| Synthèse clinique (sous-onglet) | Synthèse narrative objectivé/suspecté/non-déterminable | Kiné/médecin | Très haute | Aucun | Ne rien changer |
| Résultats (sous-onglet) | Valeurs KPI brutes par test, D/G | Kiné | Moyenne | Aucun | Ne rien changer |
| Variables (sous-onglet) | Variables individuelles filtrables par qualité | Kiné/expert | Moyenne | Aucun | Ne rien changer |
| Capacités (sous-onglet) | Vue par capacité sportive (4 capacités × sous-capacités) | Préparateur | Moyenne | Aucun | Ne rien changer |
| Systèmes (sous-onglet) | Statut par système anatomique | Kiné | Basse | Aucun | Ne rien changer |
| Hypothèses (sous-onglet) | Formulations cliniques par qualité prioritaire | Kiné/médecin | Moyenne | Aucun | Ne rien changer |
| Orientations (sous-onglet) | Plan d'action par qualité prioritaire | Kiné/préparateur | Haute | Aucun | Ne rien changer |
| Couverture (sous-onglet) | Vue comparative des % de couverture, toutes qualités | Kiné/expert | Basse | Aucun (déjà bien nommé, contenu distinct — comparatif global vs détail carte par carte de Fonctions) | Ne rien changer |
| Raisonnement (sous-onglet) | Relations structure→qualité du référentiel clinique (Contribution/Confiance/Spécificité) | Expert kiné | Basse | **Oui — avec l'onglet "Fil de Raisonnement"** | **Renommer** |

**Verdict de l'audit** : sur 13 destinations, une seule paire pose un problème réel et démontré (le
sous-onglet « Raisonnement » a fait échouer un script de navigation automatisé cherchant le texte
« Raisonnement » lors de l'audit précédent, parce que « Fil de Raisonnement » le contient comme
sous-chaîne). Aucune autre destination n'a de fonction redondante avec une autre — confirmé par la lecture
du contenu réel de chacune en navigateur (Résultats affiche des valeurs KPI brutes différentes de
Variables ; Systèmes regroupe par anatomie, différent de Fonctions qui regroupe par qualité ; Couverture
est un comparatif global, différent des cartes détaillées de Fonctions). Aucune vue n'est supprimée ni
fusionnée.

## 6. Clarification navigation (Objectif 2, implémentation)

- **Renommage** : le sous-onglet « Raisonnement » devient **« Relations structure-qualité »** — décrit
  exactement son contenu (le tableau « Relations structure → qualité issues du référentiel de raisonnement
  clinique KINEXUS » qu'il affiche déjà) et ne partage plus aucun mot avec « Fil de Raisonnement ». La clé
  de données interne (`'raisonnement'`) n'a pas changé, seul le libellé affiché. L'onglet « Fil de
  Raisonnement » n'a pas été touché (déjà distinctif, pas besoin de renommer les deux).
- **Regroupement visuel léger** (`TabBar`, nouveau prop optionnel `groupBreaks`, rétrocompatible — le
  deuxième point d'appel de `TabBar`, dans l'écran de saisie Tests/Questionnaires, n'y passe rien et reste
  identique à l'octet près) : 4 légendes muettes insérées dans la même rangée de 10 sous-onglets, sans
  aucun réordonnancement ni suppression :
  - **Vue d'ensemble** — Fonctions, Synthèse clinique
  - **Détail des données** — Résultats, Variables, Capacités, Systèmes
  - **Interprétation** — Hypothèses, Orientations
  - **Référence** — Couverture, Relations structure-qualité

Justification du regroupement : il répond directement au principe de la mission (« la navigation doit
répondre à des questions utilisateur ») sans déplacer aucun onglet de sa position actuelle — un praticien
qui connaît déjà l'emplacement d'un onglet le retrouve à l'identique, la légende ajoute simplement un
repère de lecture.

## 7. Nettoyage des formulations (Objectif 3)

**Les deux problèmes explicitement identifiés** :
- `CONFIDENCE_LABEL = {elevee:'élevée', moderee:'modérée', faible:'faible'}` — nouvelle table de libellés
  purement présentationnelle (même principe que `CSM_STATE_LABEL`, déjà existante), appliquée aux 2 seuls
  points où `sc.confidence` était affiché tel quel : la carte de qualité de l'onglet Fonctions, et la
  colonne « Confiance » du tableau « Fonctions évaluées » du PDF expert. Le champ de données
  `fSc[fn].confidence` lui-même n'est jamais modifié (toujours `'elevee'`/`'moderee'`/`'faible'` en
  interne).
- Élision « de »/« d' » : la fonction `deElided(mot)` existait déjà dans le code (ligne ~4353, avec un
  commentaire explicite « Absorption, Explosivité, Endurance ») mais n'était pas utilisée à tous ses points
  d'usage naturels. Balayage ciblé de ce type d'erreur précis (jamais élargi à une réécriture éditoriale) :
  9 occurrences corrigées, toutes en réutilisant cette même fonction déjà validée, jamais une nouvelle
  règle de grammaire inventée :
  - `computeHypClinicalSynthesisRelationships()` (texte « Les déficits concomitants » de la Synthèse
    clinique et de l'onglet Hypothèses) — le cas explicitement cité par la mission.
  - `buildMultiQualityNarrative()` (7 occurrences : conclusion, conséquences et libellés de la chaîne
    causale affichée en Fonctions/PDF sportif) — chaîne partagée par l'écran et le PDF sportif, donc la
    correction s'y propage aussi (vérifié §10, ligne « et de absorption » → « et d'absorption », seule
    différence entre les deux versions du PDF sportif).
  - `tfmSecondaryContributorNote()` (1 occurrence).
  - Deux textes de repli non accentués (« Deficit de X identifie. », « Travailler les qualites de X. »),
    utilisés uniquement quand une qualité n'a pas de texte `HYPO`/`ORI` dédié — corrigés en
    « Déficit d'X identifié. » / « Travailler les qualités d'X. » avec accents complets, pas seulement
    l'élision.

**Balayage plus large effectué, sans modification** : recherche de tous les autres usages de
`quality.toLowerCase()`/`fn.toLowerCase()` précédés de « pour » (jamais concerné, « pour » ne s'élide
jamais) ; recherche des autres tokens internes non accentués affichés tels quels (aucun autre trouvé,
au-delà des deux déjà corrigés) ; recherche d'anglicismes résiduels visibles (aucun nouveau trouvé — le
Lot Productisation Clinique 1 antérieur avait déjà traité ce point).

**Un dernier point identifié mais volontairement non corrigé**, documenté ici plutôt que codé sans
justification : `computeHypClinicalSynthesisNarrative()` construit un champ interne
`s.deficitsObjectives` qui, dans la branche où au moins une qualité est objectivée, concatène l'état HYP
brut (`o.state`, ex. `"retenue_faible"` avec le tiret bas) au lieu du libellé `CSM_STATE_LABEL` déjà
existant. Vérifié par lecture des deux seuls appelants (`buildSportifReport`, `buildExpertReport`) : ce
champ n'est en pratique **jamais lu** dans cette branche (les deux appelants reconstruisent leur propre
texte propre dès qu'il y a au moins une qualité objectivée, et ne retombent sur `narrative.deficitsObjectives`
que dans la branche « aucun déficit », où le texte est déjà correct). Latent, invisible au praticien
aujourd'hui, mais fragile si un futur appelant lisait ce champ sans le même garde-fou — **candidate
V1.1**, non corrigée ici car non visible et car la corriger aurait nécessité de toucher une branche de
`computeHypClinicalSynthesisNarrative()`, fonction listée dans le gel clinique.

## 8. Vérification navigateur (Objectif 5)

Parcours réel (Chromium/Playwright, injection d'un bilan via `localStorage` puis navigation par clics
réels — plus fiable que la ressaisie manuelle, déjà source d'un faux problème lors de l'audit précédent) :
Dashboard → connexion locale → athlète → bilan → Expert (dashboard 01-06) → chacun des 10 sous-onglets
(Fonctions, Synthèse clinique, Résultats, Variables, Capacités, Systèmes, Hypothèses, Orientations,
Couverture, **Relations structure-qualité**) → Fil de Raisonnement.

Constats :
- Zéro erreur JavaScript (`pageerror`) sur l'ensemble du parcours ; les seules entrées console sont des
  échecs de chargement réseau (police Google Fonts, hors ligne dans cet environnement de test — préexistant,
  sans rapport avec cette mission).
- Le sous-onglet renommé s'atteint sans ambiguïté par un sélecteur texte exact
  (`/^Relations structure-qualité$/`), alors que l'ancien libellé « Raisonnement » aurait été trouvé en
  premier comme sous-chaîne de « Fil de Raisonnement » — preuve directe, reproduite dans cette mission,
  que la collision qui avait fait échouer l'audit précédent n'existe plus.
- Les 4 légendes de regroupement (Vue d'ensemble / Détail des données / Interprétation / Référence)
  s'affichent correctement avant le premier onglet de chaque groupe, sans rien déplacer.
- Les 10 sous-onglets restent tous accessibles (défilement horizontal existant, inchangé) — aucune
  destination rendue inaccessible.
- « Confiance élevée » s'affiche avec accent sur les cartes Mobilité et Absorption ; les autres cartes
  affichaient déjà « Confiance faible », correct, non touché.
- « Les déficits de Mobilité et d'Absorption sont concomitants » s'affiche correctement élidé, identique
  dans l'onglet Synthèse clinique et l'onglet Hypothèses.

## 9. Vérification PDF (Objectif 6)

Voir §4 pour les 3 cas PDF expert (page count avant/après, inspection visuelle). PDF sportif régénéré avec
le même harnais et inspecté visuellement (capture pleine page) : structure à 3 pages strictement identique
(page 1 dashboard, page 2 fond navy plein-bleed, page 3 Mouvement/CMJ), seule différence visible « et
d'absorption » au lieu de « et de absorption » dans le résumé clinique de la page 1 — correction attendue
et désirée, pas une régression (voir §7 et §10).

## 10. Tests de non-régression (Objectif 4)

Comparaison automatisée avant (commit `c9d75a3`) / après, sur 4 scénarios (bilan riche partiel, bilan
vide, bilan riche avec valeurs normales, bilan riche avec plusieurs qualités concordantes sans relation
documentée — ce dernier choisi spécifiquement pour exercer la branche corrigée) :

- `res.functionScores`, `res.priorities`, `res.testStatuses`, `res.systemScores`, `res.rtpStatus` : **strictement
  identiques**, sur les 4 scénarios, à l'exception de deux champs de texte narratif
  (`clinicalSynthesis.relationships[8].narrative` et `clinicalSynthesis.narrative.relationsExplicatives`)
  qui contiennent l'unique correction d'élision intentionnelle (« de Absorption » → « d'Absorption »).
  Aucun autre champ, aucune valeur numérique, aucun statut, aucune confiance interne n'a changé.
- `HYP_QUALITY_RELATIONS`, `TFM`, `VAR_REL3` : **identiques byte pour byte** (comparaison JSON complète),
  sur les 4 scénarios.
- `buildSportifReport()` / `buildFullReportHtml('sportif', …)` : contenu HTML strictement identique à
  l'exception des 4 occurrences de la même correction d'élision (voir §7) ; nombre de `<div class="print-page">`
  inchangé (3 avant, 3 après) ; aucune classe `print-page-expert` n'apparaît dans le rapport sportif.
- Suite de tests existante (34 fichiers, `tests/*.test.js`, incluant les non-régressions historiques
  `rationalisationVuesLot1.test.js` et `uxSaisieLotA.test.js`) : exécutée intégralement après les
  modifications. Une seule assertion préexistante (`tests/hypV1Normalization.test.js`) échouait — parce
  qu'elle attendait littéralement le texte bogué « Déficit concordant de explosivité » comme résultat
  correct. Corrigée pour attendre « Déficit concordant d'explosivité » (la formulation désormais correcte),
  avec un commentaire renvoyant à cette mission. **Résultat final : 34/34 fichiers de tests, 0 échec.**

## 11. Vérification navigateur — captures

Toutes les vérifications ci-dessus ont été faites avec un navigateur réel (Chromium/Playwright) sur
l'application servie localement, jamais par lecture de code seule, conformément à l'exigence de la
mission.

## 12. Éléments volontairement non touchés

- Les 8 moteurs HYP, HYP_QUALITY_RELATIONS, CSM (`computeHypClinicalSynthesis01`), les règles de
  convergence, les seuils, les normes, TFM, VAR_REL3 : aucune ligne modifiée dans ces fonctions/données.
- Le contenu clinique de la Synthèse clinique, des Déficits à investiguer, des Hypothèses et des
  Orientations : aucune phrase de fond changée, seules les 9 corrections d'élision/accent listées en §7
  (toutes des corrections de grammaire sur du texte déjà décidé, jamais une reformulation de sens).
- La saisie (Lot A) : aucun fichier de saisie touché.
- Le design (palette, Body map, cartes, typographie globale, système de couleurs) : aucune modification —
  les seules nouvelles règles CSS (page-break-inside/after, thead sticky) sont invisibles à l'écran et ne
  changent que le comportement d'impression/export du rapport expert.
- Les 13 destinations de navigation elles-mêmes : aucune supprimée, aucune fusionnée, aucune déplacée.
  Seul un libellé a changé et des légendes de regroupement ont été ajoutées.
- `computeHypClinicalSynthesisNarrative()` : la branche latente documentée en §7 n'a pas été modifiée
  (fonction listée dans le gel clinique, problème non visible aujourd'hui).

## 13. Problèmes restants (hors périmètre, candidats V1.1)

- Le champ interne `clinicalSynthesis.narrative.deficitsObjectives` peut exposer un état HYP brut
  (`retenue_faible`) si un futur point de consommation le lit sans le même garde-fou que les 2 appelants
  actuels. Fix suggéré pour V1.1 : appliquer `CSM_STATE_LABEL`/`deElided` directement dans
  `computeHypClinicalSynthesisNarrative()` plutôt que de compter sur chaque appelant pour re-nettoyer le
  texte — nécessite de toucher une fonction listée dans le gel clinique, donc hors périmètre de cette
  mission.
- La distinction visuelle HYP-gouvernée / TFM seule sur l'onglet Fonctions (déjà identifiée par l'audit de
  rationalisation des vues, toujours hors périmètre ici).
- Le guidage de sélection de tests par objectif clinique dans la longue liste de 49 tests (déjà identifié
  par l'audit UX Saisie, toujours hors périmètre ici — mission de saisie, pas de navigation Expert).

Aucun de ces trois points n'est bloquant pour une validation terrain.

## 14. Verdict final

**A — Prêt pour validation terrain.**

Les 3 objectifs de cette mission — seuls obstacles identifiés par l'audit précédent à un verdict A —
sont corrigés, vérifiés en navigateur réel et en PDF réel, et couverts par une non-régression stricte
(34/34 tests, comparaison avant/après des 6 sorties listées par la mission strictement identiques hors les
corrections de formulation explicitement demandées). Aucun problème nouveau n'a été découvert pendant cette
mission qui justifierait de revenir à un verdict B, et aucun des trois points documentés en §13 n'est
suffisamment visible ou bloquant pour empêcher une mise en situation réelle — ce sont des améliorations
"agréables" post-validation, pas des conditions préalables.

## 15. Recommandation pour validation terrain

Kinexus V1 est gelé fonctionnellement à l'issue de cette mission. Aucune autre modification de code n'est
proposée ici (conformément à l'Objectif 10) ; ce qui suit est une méthodologie, pas du code.

- **Kiné** : 2 à 3 praticiens, chacun un bilan réel complet (saisie → validation → lecture de la Synthèse
  clinique et des Orientations → export PDF sportif) en conditions de consultation réelles, sans
  assistance. Recueillir : temps total, points de blocage, verbatims sur la navigation à 13 destinations
  (le regroupement suffit-il, ou faut-il aller plus loin en V1.1 ?).
- **Médecin** : remise du PDF expert (pas le PDF sportif) sur un cas réel, sans contexte préalable sur
  l'outil — vérifier que la pagination corrigée (§3-4) tient sur un vrai cas clinique de leur patientèle,
  pas seulement les 3 cas synthétiques testés ici.
- **Préparateur physique** : lecture du PDF sportif + Orientations sur un athlète réel, avec un focus sur
  la compréhension du plan d'action sans explication de l'architecture.
- **Sportif** (optionnel, en complément) : remise du seul PDF sportif, test de compréhension à 30 secondes
  déjà validé par l'audit précédent — à reconfirmer une fois sur un athlète réel plutôt que sur le
  scénario synthétique de cette mission.

Fin de la phase de construction. Prochaine étape : retours de terrain, pas nouveau développement.

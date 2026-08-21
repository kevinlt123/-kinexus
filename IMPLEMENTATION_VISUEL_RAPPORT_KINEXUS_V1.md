# IMPLEMENTATION_VISUEL_RAPPORT_KINEXUS_V1.md — Évolution visuelle du rapport

**Type** : Mission de présentation visuelle uniquement. Le moteur clinique (8 moteurs HYP, CSM,
HYP_QUALITY_RELATIONS, règles diagnostiques/de convergence, seuils, normes, TFM, VAR_REL3) n'a
reçu aucune modification — confirmé par comparaison automatisée (§16).

## 1. Architecture visuelle choisie

Tous les nouveaux éléments visuels sont des fonctions de présentation pures, ajoutées une seule
fois en portée globale (`index.html`, juste après `CONFIDENCE_LABEL`, aux côtés de
`CSM_STATE_LABEL` — même emplacement, même esprit) et appelées par `buildSportifReport()` et
`buildExpertReport()`. Aucune ne recalcule quoi que ce soit : chacune prend en entrée un champ déjà
produit par `computeMoteur()`/CSM et le met en forme.

| Fonction | Rôle | Source lue |
|---|---|---|
| `computeGlobalProfileLevel(fSc,evFns)` | Niveau vert/jaune/orange/rouge du profil global | Extraction exacte de la formule `distStatus` déjà utilisée par `buildSportifReport` |
| `profileGaugeHTML(level,captionLabel,opts)` | Jauge segmentée + curseur | Le niveau ci-dessus, `PROFILE_LABELS` (déjà existant, sorti de la portée locale) |
| `coverageRingSVG(pct,color,size)` | Anneau de progression | `fSc[q].coverage`, `fSc[q].status` |
| `csmEtatLabel(csmQ)` | Objectivée / Suspectée / Non déterminable | `clinicalSynthesis.qualities[q].objectified/suspected/nonDeterminable` |
| `qualitiesRingsGridHTML(evFns,fSc,clinicalSynthesis,opts)` | Grille d'anneaux, une carte par qualité | Les deux ci-dessus |
| `computeLsiItems(td)` | Liste des tests bilatéraux avec D et G réellement présents | Extraction exacte du calcul déjà utilisé par `buildSportifReport` (section "Asymétries majeures") |
| `lsiMirrorBarsHTML(lsiItems,limit)` | Barres miroir G/D | `computeLsiItems`, `lsiSt()` (déjà utilisé partout dans l'app pour colorer le LSI) |
| — repère anatomique | Localisation | Réutilise `muscleMapHTML(sysSc,{...})`, le Body map déjà existant — aucune nouvelle fonction créée |

Aucun de ces ajouts ne modifie une fonction existante autrement que par extraction pure (voir §2) :
`buildSportifReport` et `buildExpertReport` restent les deux seules fonctions qui construisent le
HTML des rapports, avec exactement les mêmes sections qu'avant, plus les nouvelles.

## 2. Sources de données utilisées

Aucune valeur n'est inventée. Table de correspondance exhaustive :

| Élément visuel | Champ lu | Déjà utilisé ailleurs dans Kinexus ? |
|---|---|---|
| Jauge de profil | `fSc[q].status` (agrégé par qualité) | Oui — formule déjà utilisée par `buildSportifReport` (`distStatus`) |
| Anneau (remplissage) | `fSc[q].coverage` | Oui — déjà affiché en texte brut ("Couverture X%") dans les deux rapports et à l'écran |
| Anneau (couleur) | `fSc[q].status` | Oui — couleur de statut déjà utilisée partout |
| État clinique (badge sous l'anneau) | `clinicalSynthesis.qualities[q].objectified/suspected/nonDeterminable` | Oui — ces trois booléens existent déjà dans CSM, simplement non affichés directement avant cette mission |
| Sous-domaines Absorption | `absorptionSousDomainesSummary(fSc)` | Oui — déjà affiché dans les deux rapports depuis une mission antérieure, non touché |
| Repère anatomique | `sysSc` (systemScores) | Oui — Body map déjà existant, appelé tel quel |
| Comparaison D/G | `bestVal`, `autoLSI`/`data.lsiAuto`, `lsiSt` | Oui — calcul déjà utilisé par `buildSportifReport` |

## 3. Jauge (objectif 1)

`computeGlobalProfileLevel()` est une extraction littérale de la formule déjà en place dans
`buildSportifReport` (`fnDist`/`distStatus` : le pire statut vert/jaune/orange/rouge parmi les
qualités réellement évaluées). Aucune nouvelle formule, aucun nouveau seuil.

Le mot « risque » n'apparaît nulle part dans la jauge. Le libellé retenu est **« Profil global »**,
qui reprend `PROFILE_LABELS` — déjà utilisé mot pour mot par `buildSportifReport` pour la carte
« Profil global » du mode pré-saison ("Profil optimal / satisfaisant / en développement / à
développer"). Cette table a été déplacée de la portée locale de `buildSportifReport` vers la portée
globale (déclaration identique, zéro changement de valeur) pour être partagée avec la jauge du
rapport expert.

La jauge conserve les 4 niveaux réellement utilisés par Kinexus (vert/jaune/orange/rouge) — pas une
réduction à 3 niveaux, qui aurait été une simplification non demandée par la donnée existante.

Dans `buildSportifReport`, la jauge remplace l'ancienne rangée de pastilles de couleur (un point par
statut présent) directement dans la carte "Profil global"/"Performance globale" déjà existante — le
texte de statut (`hVal`, déjà validé) reste affiché juste en dessous, sans duplication. Dans
`buildExpertReport`, qui n'avait aucun équivalent avant cette mission, la jauge ouvre la nouvelle
section "Vue d'ensemble".

## 4. Anneaux (objectif 3)

`buildSportifReport` : la grille "Qualités fonctionnelles" (page 2) — auparavant une rangée
icône + libellé + badge de statut — est remplacée par la grille d'anneaux. `buildExpertReport` :
section "Couverture par qualité" ajoutée dans la nouvelle "Vue d'ensemble".

## 5. Couverture des données (objectif 3A)

Chaque grille d'anneaux porte une légende explicite, en italique, juste au-dessus :

> « Le remplissage de l'anneau représente la couverture des données disponibles pour cette
> qualité — jamais un score de performance. « — » signifie qu'aucune donnée n'est disponible. »

Vérifié à l'écran (capture réelle) : une qualité à 100 % de couverture (Mobilité, Absorption) est
un anneau plein coloré selon son statut réel ; une qualité à 17 % (Stabilisation, cas B) est un
anneau à peine entamé, alors que son statut clinique est "À surveiller" — la couverture et la
sévérité affichée ne sont jamais confondues visuellement, exactement l'exemple donné par la mission
("100 % de couverture ≠ 100 % de performance").

## 6. États cliniques (objectif 3B)

`csmEtatLabel()` lit exclusivement les trois booléens `objectified`/`suspected`/`nonDeterminable`
déjà produits par `computeHypClinicalSynthesis01` (non touché). Rien n'est déduit du pourcentage de
couverture — les deux informations sont rendues indépendamment sous chaque anneau (statut en
couleur, état en petit texte majuscule en dessous).

Pour les deux qualités hors moteur HYP (Contrôle Frontal, Contrôle Sensoriel — TFM seul),
`csmEtatLabel()` retourne `null` et l'appelant affiche **« Information complémentaire (TFM) »** —
le libellé exact déjà établi par le Lot Rationalisation Vues 1 pour ce même cas de figure ailleurs
dans l'application, repris à l'identique plutôt que d'inventer un nouveau texte.

## 7. Absorption (objectif 4)

Non touché. `absorptionSousDomainesSummary()` était déjà appelée par les deux rapports avant cette
mission (Orientations pour le rapport expert, Déficits à investiguer pour le rapport sportif) et
continue de l'être exactement de la même façon. Vérifié sur capture réelle (CAS B/C) : les 4 puces
(Freinage/décélération, Capacité excentrique, Stratégie, Absorption réactive) sont toujours
présentes sous la carte Absorption des Orientations, inchangées.

## 8. Repère anatomique (objectif 5)

Décision de conception : plutôt que de dessiner un nouveau schéma simplifié, le repère anatomique
réutilise **`muscleMapHTML(sysSc,{...})`** — le Body map déjà existant, déjà gelé, déjà utilisé par
`buildSportifReport` dans sa section "Pourquoi ? Où ?". C'est la lecture la plus stricte possible de
l'objectif 16 ("ne pas refaire le body map") : au lieu de créer un visuel parallèle, le rapport
expert (qui n'avait aucune vue anatomique avant cette mission) appelle désormais la même fonction.

Affiché uniquement si au moins un système dispose réellement d'un score (`SYSTEMS.some(s=>sysSc[s])`)
— sur un bilan sans aucun test actif, la section n'apparaît pas du tout plutôt que d'afficher un
schéma vide (objectif 8, hiérarchie dépendante des données disponibles).

Le sous-titre "Repère anatomique — localisation, pas causalité" est ajouté au-dessus, en toutes
lettres, pour prévenir toute lecture causale (objectif 5) — le Body map lui-même n'a pas été modifié,
seul le texte qui l'introduit dans le rapport expert est nouveau.

## 9. Comparaisons D/G (objectif 6)

`computeLsiItems()` est une extraction littérale du calcul déjà utilisé par `buildSportifReport`
(itère `TESTS`, ne retient une entrée que si `test.bilateral===false` ET que D et G existent
réellement — `if(lsi!=null&&dV!=null&&gV!=null)`). Aucune valeur manquante n'est jamais interpolée.

`lsiMirrorBarsHTML()` est une extraction littérale du rendu déjà utilisé par la section "Asymétries
majeures" du rapport sportif — même barres miroir, même coloration par `lsiSt()` (la classification
LSI déjà utilisée partout dans Kinexus, y compris à l'écran dans `ResultsBrowser`). Ce n'est pas une
nouvelle règle de couleur clinique inventée pour ce visuel (objectif 6B) : c'est la convention déjà
en place, réutilisée à l'identique pour ne pas introduire une deuxième façon de colorer le LSI dans
la même application.

Sur l'objectif 6A ("l'asymétrie est une information de précision, jamais un diagnostic à elle
seule"), un rappel textuel explicite a été ajouté au-dessus du visuel, dans les deux rapports :

> « Information de précision — une asymétrie n'équivaut pas, à elle seule, à un diagnostic. »

Ce rappel est nouveau (la mission le demande explicitement) ; le visuel lui-même (barres, couleurs)
ne l'était pas dans `buildSportifReport` et a été repris à l'identique dans `buildExpertReport`, qui
n'avait aucune comparaison visuelle D/G avant cette mission (seulement des colonnes de chiffres bruts
dans le tableau "Résultats bruts par test", toujours présent, inchangé).

## 10. Gestion des données manquantes (objectif 9)

- **Anneau à 0 % de couverture** : affiche « — » plutôt que « 0 % », avec un tracé gris neutre
  plutôt que la couleur de statut, pour ne jamais donner l'impression d'une mesure ratée. Vérifié
  visuellement sur le CAS A (bilan à un seul test) : les 8 qualités non couvertes affichent toutes
  « — », jamais « 0 % ».
- **Anneau à couverture partielle non nulle** (ex. Stabilisation à 17 % dans les CAS B/C) : affiche
  le vrai pourcentage, distinct visuellement du cas "aucune donnée" — cette distinction existe déjà
  nativement dans la donnée (`coverage===0` vs `coverage>0`) ; rien n'a été inventé pour la
  matérialiser, seul le seuil d'affichage (`pct>0`) a été ajouté à la fonction de rendu.
- **Comparaison D/G** : n'affiche une ligne que si les deux côtés existent réellement
  (`computeLsiItems`, voir §9) — un test partiellement rempli (un seul côté) n'apparaît jamais dans
  cette section (il reste visible dans le tableau "Résultats bruts par test", inchangé).
- **Repère anatomique** : masqué entièrement si aucun système n'a de score (§8).
- **Section "Vue d'ensemble" du rapport expert dans son ensemble** : conditionnée à
  `res.clinicalSynthesis && evFns.length` — sur un bilan totalement vide, elle ne s'affiche pas du
  tout plutôt que de montrer une jauge et des anneaux sans aucun sens.

Point non distingué, documenté par honnêteté plutôt que masqué : le champ `.absent` produit par CSM
(distinct de `.nonDeterminable`) s'est révélé toujours `false` dans les scénarios testés, y compris
quand `state==='absente'` — la synthèse clinique existante (non touchée par cette mission) regroupe
déjà ces deux cas sous un seul texte "Non déterminable" ; les nouveaux badges d'état suivent la même
convention, déjà établie, plutôt que d'inventer une distinction que la donnée ne permet pas
d'afficher de façon fiable aujourd'hui.

## 11. Tableau brut (objectif 7)

Aucune table supprimée ni condensée. `buildExpertReport` conserve à l'identique : le tableau
"Fonctions évaluées" (statut/couverture/confiance), le tableau "Résultats bruts par test" (KPI par
KPI, D/G, LSI, statut), et toutes les cartes "Hypothèses cliniques"/"Orientations"/"Statut RTP" —
le nouveau bloc "Vue d'ensemble" est ajouté avant, jamais à la place.

## 12. PDF sportif (objectif 11)

Généré réellement (`computeMoteur()` + `buildFullReportHtml('sportif',…)`, jamais réimplémenté) et
imprimé en PDF réel (Chromium/Playwright, `page.pdf()`) sur 3 cas :

| Cas | Contenu | Pages PDF avant cette mission | Pages PDF après |
|---|---|---|---|
| A — peu de données (1 test) | | 5 (non mesuré isolément — structure à 3 `.print-page` fixes, inchangée) | 5 |
| B — profil intermédiaire (4 tests) | | 5 | **5 (inchangé)** |
| C — profil riche (16 tests) | | — | 5 |

La structure à 3 pages physiques (`.print-page`, fond plein-bleed page 2, page Mouvement
conditionnelle) n'a pas été touchée — seules les sections "Profil global" (jauge ajoutée) et
"Qualités fonctionnelles" (anneaux) ont changé de contenu interne, sans changer le nombre de pages
réel (vérifié : CAS B produit 5 pages avant et après, à l'octet du nombre de pages près). Synthèse
clinique, Déficits à investiguer, limites, relations, body map, plan de prise en charge : tous
strictement inchangés (vérifiés visuellement, capture pleine page).

## 13. PDF expert (objectif 12)

Généré et imprimé de la même façon, sur les 3 mêmes cas :

| Cas | Pages PDF avant cette mission (post pré-validation) | Pages PDF après |
|---|---|---|
| A | 2 | 3 |
| B | 2 | 4 |
| C | 2 | 4 |

L'augmentation du nombre de pages est attendue et honnête : la section "Vue d'ensemble" ajoute un
contenu réel (jauge, 9 anneaux, body map, barres D/G) qui occupe physiquement de la place — ce n'est
pas une régression de la correction de pagination de la mission précédente (qui visait les pages
*vides*, pas le nombre total de pages). Vérifié visuellement sur les 3 cas (capture pleine page,
mode écran) : aucune page quasi vide, aucun titre orphelin, aucun tableau coupé de façon incohérente
— les règles `page-break-inside:avoid`/`page-break-after:avoid` de la mission précédente
s'appliquent normalement au nouveau contenu (mêmes classes CSS, non modifiées).

Aucun tableau détaillé n'a été supprimé (§11). Le rapport expert n'a pas été transformé en rapport
sportif simplifié : les tableaux bruts, la synthèse clinique complète et les cartes Hypothèses/
Orientations restent le corps du document, la "Vue d'ensemble" n'en est qu'une introduction.

## 14. Tests navigateur (objectif 14)

Chromium/Playwright, deux méthodes complémentaires :

1. **Harnais headless** (`computeMoteur()` + `buildFullReportHtml()` extraits tels quels du code de
   production) → rendu du HTML réel dans Chromium, captures pleine page pour les 3 cas × 2 types de
   rapport (6 captures), zéro erreur JavaScript (`pageerror`) sur l'ensemble.
2. **Application réelle** : injection d'un bilan via `localStorage`, navigation par clics réels
   (connexion locale → athlète → bilan → "👁 Aperçu du rapport"), capture de l'aperçu affiché dans
   l'application elle-même — confirme que la jauge, le texte "Profil à développer" et l'élision
   "d'absorption" (mission précédente) s'affichent correctement en conditions réelles, pas seulement
   dans le harnais. Zéro erreur JavaScript sur ce parcours.

Vérifié spécifiquement : jauge (position du curseur cohérente avec le niveau réel), anneaux
(remplissage = couverture, jamais confondu avec le statut), légende de couverture, états cliniques
(Objectivée/Suspectée/Non déterminable/Information complémentaire), repère anatomique (affiché
seulement quand pertinent), comparaison D/G (barres miroir avec valeurs réelles), tableau brut
(toujours présent, inchangé).

## 15. Tests PDF (objectif 10, 14)

Voir §12/§13 pour le détail par cas. Complément : les fichiers PDF réels ont été inspectés en comptant
mécaniquement le nombre d'objets `/Type /Page` (pas `/Type /Pages`, le nœud racine) dans chaque
fichier binaire — méthode indépendante de la capture d'écran, confirmant que le nombre de pages
physiques annoncé correspond bien au PDF réellement produit, pas seulement à son rendu à l'écran.

## 16. Non-régression clinique (objectif 13)

Comparaison automatisée avant (dernier commit avant cette mission) / après, sur 4 scénarios (bilan
riche partiel, bilan vide, bilan riche à valeurs normales, bilan riche à 9 tests) :

- `computeMoteur()` — sortie complète (`functionScores`, `priorities`, `clinicalSynthesis`,
  `testStatuses`, `systemScores`, `rtpStatus`, et donc les 8 sorties HYP qu'elle contient) :
  **0 différence sur les 4 scénarios**, y compris le scénario vide et le scénario à 9 tests.
- `HYP_QUALITY_RELATIONS`, `TFM`, `VAR_REL3` : **identiques byte pour byte**.
- Suite de tests existante (34 fichiers `tests/*.test.js`) exécutée intégralement après les
  modifications : **34/34, 0 échec** — y compris les non-régressions historiques
  `rationalisationVuesLot1.test.js`, `uxSaisieLotA.test.js` et `hypV1Normalization.test.js`, qui
  comparent déjà `functionScores`/`priorities`/`clinicalSynthesis` avant/après en `deepStrictEqual`
  strict.

Aucune modification de données, aucune nouvelle règle diagnostique, aucun seuil ou norme touché.

## 17. Éléments non implémentés (par choix, documentés plutôt que codés)

- **Distinction "aucune donnée" vs "données normatives insuffisantes"** dans les badges d'état des
  anneaux : la donnée CSM actuelle (`.absent` toujours `false` observé) ne permet pas de la tracer
  fiablement (voir §10) — non affichée plutôt qu'approximée.
- **Coloration "neutre" (non clinique) des barres D/G**, envisagée un temps lors de la conception
  (objectif 6B au sens le plus strict) : finalement non retenue au profit de la réutilisation exacte
  de la convention `lsiSt()` déjà en place partout ailleurs dans Kinexus — introduire une deuxième
  convention de couleur pour le même indicateur (LSI) aurait créé une incohérence visuelle que
  l'objectif 16 ("s'intégrer au design existant") demande justement d'éviter. Documenté ici comme un
  arbitrage assumé, pas un oubli.

## 18. Éléments candidats V1.1

- **Frise d'évolution longitudinale** — explicitement exclue de cette mission (objectif 15). Pas
  implémentée, aucune donnée historique inventée.
- **Repère anatomique par zone plus fine** (actuellement, le Body map existant gère déjà la
  granularité par système anatomique — aucun changement nécessaire ici, ce point est fermé).
- **Icônes par qualité dans la grille d'anneaux** (le rapport utilise déjà `FN_ICON` à l'écran) :
  non ajoutées aux anneaux du rapport pour garder les cartes compactes sur PDF ; à évaluer après
  retour terrain si la densité actuelle (nom + anneau + statut + état) est jugée suffisante.

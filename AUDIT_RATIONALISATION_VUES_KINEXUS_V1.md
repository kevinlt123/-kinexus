# Audit de rationalisation des vues Kinexus V1
« Fonctions / Variables / Capacités / Raisonnement »

Audit **exclusivement en lecture** — aucun fichier de production, aucun test, aucun onglet n'a été
modifié, supprimé, fusionné ou renommé. Commit de référence : `c7c06af` (fin du Lot Productisation
clinique 1). Objectif unique : déterminer la valeur réelle de chacune des quatre vues, pas décider
de leur avenir.

---

## 1. Méthodologie

- Cartographie exhaustive du code source des quatre vues (composant `ExpertView`, lignes
  8738-8899) : localisation exacte de chaque bloc de rendu, des fonctions de calcul associées
  (`computeCapaciteStatus`, `computeQualityStatus`, `varRelHTML`, `capaciteHTML`,
  `tfmQualityDiagnosticGate`) et des quatre structures de données sources (`TFM`, `VAR_REL3`,
  `CAPACITES_DATA`, `STR_QUAL_DETAIL`).
- Exécution réelle de `computeMoteur()` (extraction du moteur depuis `index.html`, `eval()`, même
  convention que `tests/*.test.js`) sur les 3 scénarios cliniques mandatés (Partie 4) + inspection
  automatisée de ce que chacune des 4 vues afficherait réellement pour chacun.
- Inventaire exhaustif, par lecture directe des objets chargés en mémoire (pas par estimation), de
  **toutes** les valeurs de vocabulaire réellement présentes dans `TFM`, `VAR_REL3`,
  `CAPACITES_DATA`, `STR_QUAL_DETAIL` — comptage précis, pas d'échantillon.
- Recherche active de collisions de nommage entre les identifiants de qualité utilisés par chaque
  registre (`HYP_CSM_HYP_KEY`, `HYP_CSM_QUALITIES`, `CAPACITES_DATA[...].qualitesContributrices[].quality`,
  `VAR_REL3[...].measures[].function`) — recherche qui a mis au jour plusieurs incohérences de
  frappe non documentées jusqu'ici (Partie 9).
- Réutilisation des constats déjà établis et non remis en cause par les 3 audits précédents de
  cette session (`AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md`, `AUDIT_UX_UI_KINEXUS_V1.md`,
  `AUDIT_PRODUCTISATION_CLINIQUE_KINEXUS_V1.md`) — cités explicitement partout où ils recoupent
  cette mission, jamais reproduits sans vérification indépendante.
- Aucune capture d'écran navigateur supplémentaire n'a été nécessaire : les quatre vues sont des
  lectures directes de données déjà calculées (aucune ne recalcule un statut clinique dans le
  rendu, sauf Variables qui appelle `kpiStatus()` en direct — vérifié), donc l'inspection du code +
  l'exécution réelle du moteur donnent une image fidèle et plus précise que des captures.

---

## 2. FONCTIONS

**Emplacement** : `index.html:8805`, une seule ligne, `tab==='fonctions'` (onglet par défaut à
l'ouverture d'Expert View, `useState('fonctions')`, ligne 8739).

**Objectif apparent** : vue de synthèse par qualité fonctionnelle, une carte par qualité évaluée.

**Objectif réel dans le code** : liste plate de `res.functionScores`, décorée d'une deuxième donnée
totalement indépendante (les poids `TFM` bruts des tests actifs). Ce n'est ni une vue HYP, ni une
vue CSM — c'est `functionScores` (qui, pour 8 des 10 qualités, contient déjà le verdict HYP une
fois celui-ci calculé) affiché sans aucun contenu propre à HYP (`hypAbs01`, `hypFor01`,
`explanatoryEvidence`, `precision`, `sousDomaines`… aucun n'est lu ici).

**Source de données** : `fSc = res.functionScores` (`.status`, `.coverage`, `.confidence`
uniquement) + `TFM` lu **brut** (`TFM[tk][fk]`, pas `effectiveTFMWeight()` — donc un test que le
profil de qualité active a explicitement marqué `visible`/`ignored` pour exclusion du score
apparaît quand même ici comme contributeur).

**Données affichées** : nom de la qualité, `Couverture X%`, `Confiance` (`elevee`/`moderee`/`faible`
— affiché brut, non accentué, jamais capitalisé), un `Badge` de statut, une rangée de chips « test ·
Direct/Majeur/Mineur » pour chaque test actif lié par un poids TFM non nul.

**Données calculées dans le rendu** : la liste des tests contributeurs et le mapping 3/2/1 →
Direct/Majeur/Mineur sont recalculés à chaque rendu, à partir de `TFM` brut — pas mémoïsés, pas
partagés avec aucune autre vue.

**Vocabulaire** : `Direct`/`Majeur`/`Mineur` (masculin, propre à cette vue — nulle part ailleurs
dans le logiciel), `Couverture`, `Confiance` (minuscule, non accentué : `elevee`/`moderee`/`faible`
— distinct du `Confiance` accentué de l'onglet Raisonnement, Partie 9).

**Relation avec HYP** : pour les 8 qualités HYP-gouvernées, `.status`/`.coverage`/`.confidence`
proviennent directement du moteur HYP (vérifié ligne par ligne — ex. Absorption :
`coverage` = 0/50/100 selon le nombre de preuves diagnostiques classifiables, ligne 6013 ;
Mobilité : `confidence` = `hypMob01.dataAvailable?'elevee':'faible'`, ligne 6049). C'est donc une
lecture fidèle, pas une réinterprétation.

**Relation avec CSM** : **aucune**. `res.clinicalSynthesis` n'est jamais lu par ce bloc.

**Relation avec TFM** : la rangée de chips est **exclusivement** TFM — pour une qualité HYP-gouvernée,
ces chips ne représentent JAMAIS le rôle HYP réel du test (diagnostique/confirmatif/explicatif),
seulement son poids TFM générique, qui peut diverger (Partie 9).

**Public cible réel** : le seul onglet qui répond, par qualité, à « quels tests précis ont
contribué, avec quel poids relatif ? » — utile pour un praticien qui veut comprendre rapidement la
composition d'un statut sans ouvrir la Synthèse clinique complète.

**Question clinique unique à laquelle cette vue répond** (déterminée par le code, pas préformulée) :
*« Pour cette qualité, quel est mon statut actuel et quels tests, avec quel poids générique, y sont
rattachés ? »* — une question de **composition**, pas d'explication clinique (le « pourquoi » du
statut, lui, vient de la Synthèse clinique/Raisonnement HYP, jamais lu ici).

**Test 10 secondes** : un kiné sans connaissance de Kinexus comprend immédiatement le badge de
statut et le pourcentage de couverture (vocabulaire intuitif). Il ne comprend PAS ce que
« Direct/Majeur/Mineur » signifie sans explication (aucun libellé de légende dans la vue), et ne
peut pas deviner que ces chips sont indépendantes du diagnostic affiché juste au-dessus.

**Test 30 secondes** : « qu'est-ce que cette vue m'apporte que la Synthèse clinique ne m'apportait
pas ? » → la liste des tests liés et leur poids relatif — une information réelle et absente
ailleurs. **Pas une redondance totale**, mais partiellement redondante avec le statut lui-même
(déjà visible dans Synthèse clinique, dashboard, PDF).

---

## 3. VARIABLES

**Emplacement** : `index.html:8807-8829`, IIFE, `tab==='variables'`.

**Objectif apparent** : explorateur de la « base de connaissances » variable-à-variable du logiciel.

**Objectif réel dans le code** : rendu direct de `VAR_REL3` (283 entrées), une carte par variable
active du bilan, chacune listant ses 7 registres de relation (amont/aval/corrélées/même
test/mesure/estime/mécanismes) — **c'est un explorateur de graphe de dépendances techniques**, pas
une vue clinique par qualité, malgré le filtre par qualité proposé en tête.

**Source de données** : `VAR_REL3` (défini ligne 4009, littéral unique de 283 entrées) pour le
contenu ; `HYP_CSM_QUALITIES` pour les 8 chips de filtre ; `kpiStatus()` appelé en direct dans le
rendu (seul recalcul clinique réel des 4 vues) pour le badge de statut par variable.

**Données affichées** : intro textuelle (« 283 variables »), 8 chips de filtre par qualité + « Toutes »,
une carte par variable active avec label de test + KPI + badge de statut + les 7 sections
`varRelHTML()` (Expliqué par/Peut contribuer à/Associé à/Précisé par/Mesure/Estime/Influence).

**Données calculées dans le rendu** : le filtrage (`varMatchesQuality`) et le statut par variable
(`kpiStatus`) sont recalculés à chaque rendu ; le contenu des 7 sections est du formatage pur de
données déjà stockées.

**Vocabulaire** : titres de section francisés (Lot Productisation 1) ; poids `Determinante`/
`Majeure`/`Moderee`/`Mineure` — **féminin, non accentué dans les données** (`Determinante`,
`Moderee` n'ont jamais d'accent, contrairement à leur affichage). Couleurs de poids (`WCOL`)
strictement identiques aux couleurs de statut clinique (`SC`) — voir Partie 9.

**Relation avec HYP** : **aucune donnée HYP native n'est lue** ici (pas `hyp.diagnosticEvidence`,
pas de rôle diagnostique/confirmatif/explicatif) — seul le badge de statut par variable
(`kpiStatus`) reflète un seuil, indépendamment de tout moteur HYP.

**Relation avec CSM** : aucune.

**Relation avec TFM** : les 3 registres `explainedBy`/`explains`/`correlatedWith` (les plus
consultés, 6 des 7 sections) sont dérivés de la hiérarchie de tests/TFM, pas d'un raisonnement
clinique par qualité. `measures`/`estimates` proviennent à 30% (85/283) du référentiel clinique
(`measuresSource:'document'`) et à 70% (198/283) d'un calcul algorithmique TFM
(`'algorithmique_TFM'`) — la seule marque de provenance est le suffixe discret `(calculé)`, jamais
mis en avant.

**Public cible réel** : profil très technique — data/dev interne, ou praticien expert cherchant à
auditer la traçabilité d'une variable précise. Le vocabulaire (« amont/aval », « corrélées »,
poids à 4 niveaux) suppose une familiarité avec un modèle de graphe, pas avec un raisonnement
clinique.

**Question clinique unique à laquelle cette vue répond** : *« Pour cette variable technique
précise, quelles sont ses relations documentées avec d'autres variables et qualités ? »* — une
question de **traçabilité technique**, pas une question clinique au sens où l'entend le praticien
(« qu'est-ce qui explique mon patient ? »).

**Test 10 secondes** : NON. Un kiné sans connaissance de Kinexus ne comprend pas ce qu'il regarde —
aucune indication ne dit que ces relations sont indépendantes du diagnostic HYP déjà vu ailleurs, le
vocabulaire de graphe (« amont/aval », « Precisé par ») n'est pas un vocabulaire clinique courant.

**Test 30 secondes** : le filtre par qualité (nouveauté du Lot UX/UI 1) devrait répondre
« montre-moi seulement les variables de CETTE qualité » — **mais un bug réel casse cette promesse
pour Mobilité** (Partie 9) : le filtre échoue silencieusement.

**BUG CONCRET DÉCOUVERT PENDANT CET AUDIT (Partie 9 détail complet)** : le filtre par qualité
compare `HYP_CSM_QUALITIES` (accentué : `'Mobilité'`) à `VAR_REL3[...].measures[].function`/`.estimates[].function`
(orthographe incohérente à l'intérieur même de `VAR_REL3`). Résultat vérifié par exécution réelle :
cliquer le chip **« Mobilité »** affiche systématiquement *« Aucune variable active liée à
Mobilité »*, **même pour un patient avec un WBLT actif** (le test de mobilité), car les 21 entrées
`VAR_REL3` qui documentent une relation avec la Mobilité utilisent l'orthographe non accentuée
`'Mobilite'`. Un praticien lit cela comme « aucune donnée de mobilité pour ce patient » alors que le
test a bien été réalisé et est bien montré (sans filtre) juste au-dessus.

---

## 4. CAPACITÉS

**Emplacement** : `index.html:8830-8840` (rendu) + `computeCapaciteStatus()` (4089-4111) +
`capaciteHTML()` (4112-4136), `tab==='capacites'`.

**Objectif apparent** : vue « capacités sportives » (Saut, Accélération, Réception, Changement de
direction), décomposées en sous-capacités, chacune reliée aux qualités fonctionnelles qui la
composent — un axe de lecture **orienté performance sportive**, distinct de l'axe « qualité isolée »
des trois autres vues.

**Objectif réel dans le code** : rendu de `res.capaciteScores`, lui-même produit par
`computeCapaciteStatus()` qui prend le référentiel statique `CAPACITES_DATA` (4 capacités × 3
sous-capacités × 4-5 qualités = 52 liens, un seul littéral fixe, identique pour tout athlète/sport)
et colore chaque qualité contributrice via `tfmQualityDiagnosticGate(fSc, quality, ...)` — c'est
la SEULE des 4 vues qui applique explicitement la logique de séparation HYP/TFM
(`hypGoverned`/`tfmStatus`/`status`), un point positif réel.

**Source de données** : `CAPACITES_DATA` (littéral statique, 4012, jamais dépendant du patient) ;
`res.capaciteScores` (calculé une fois par `computeMoteur()`) ; transitivement `functionScores`
(pour les 5 qualités HYP-gouvernées référencées) et `VAR_REL3` via `computeQualityStatus()` (pour
les 3 qualités non-HYP référencées : `Force maximale`, `Propulsion`, `Contrôle moteur`).

**Données affichées** : intro statique, une carte par capacité (4), un statut par sous-capacité (12
au total) avec libellé + couleur, une liste de qualités contributrices par sous-capacité avec
marque ✓/✗/○ + statut, et, uniquement pour les qualités HYP-gouvernées dont le TFM diverge, une note
« Information complémentaire (secondaire) ». Le poids (`Determinante`/`Majeure`/`Moderee`) de
chaque qualité contributrice **n'est jamais affiché** (donné calculé, jamais rendu).

**Données calculées dans le rendu** : aucune — tout (y compris la moyenne pondérée par
sous-capacité) est déjà calculé par `computeCapaciteStatus()` en amont ; le rendu est un
`dangerouslySetInnerHTML` de HTML pré-construit.

**Vocabulaire** : `Optimal`/`À surveiller`/`Déficitaire`/`Critique` (`SL`, vocabulaire clinique
partagé avec tout le reste du logiciel — bon signe de cohérence) ; `non évaluable` (sous-capacité
sans qualité testable) ; `non déterminable` (qualité HYP dont le moteur retourne null) ; `non
testé` (qualité non-HYP sans donnée VAR_REL3) — **trois nuances proches mais distinctes**, chacune
correctement câblée sur sa vraie cause (à vérifier par le praticien, jamais expliquée dans la vue
elle-même).

**Relation avec HYP** : pour 5 des 8 noms de qualité référencés par `CAPACITES_DATA`
(`Puissance`, `Explosivité`, `Réactivité`, `Stabilisation`, `Absorption`), le statut affiché est
**littéralement identique** à `functionScores[q].status` — donc identique à ce qui est déjà visible
dans Fonctions, Synthèse clinique, dashboard, PDF. Aucune information HYP nouvelle (pas de
sous-domaine, pas de preuve, pas de nuance de support) n'est ajoutée par ce passage à travers
`CAPACITES_DATA`.

**Relation avec CSM** : aucune lecture directe de `clinicalSynthesis` — mais indirectement
cohérente puisque `functionScores[q].status` est la même donnée que CSM synthétise par ailleurs.

**Relation avec TFM** : pour 3 des 8 noms de qualité (`Force maximale`, `Propulsion`, `Contrôle
moteur`), le statut vient **exclusivement** de `computeQualityStatus()` (moyenne pondérée
`POIDS_RANK` sur `VAR_REL3`) — c'est une information réellement nouvelle, mais **jamais marquée
comme TFM à l'écran** (voir Partie 9, incohérence (a)).

**Public cible réel** : préparateur physique orienté performance sportive (les 4 capacités —
saut, accélération, réception, changement de direction — sont un vocabulaire d'entraînement, pas
un vocabulaire clinique de bilan). Potentiellement la vue la plus proche des attentes d'un
préparateur physique parmi les 4 auditées.

**Question clinique unique à laquelle cette vue répond** : *« Pour telle capacité sportive
(sauter, accélérer, encaisser une réception, changer de direction), quelles qualités
fonctionnelles limitent aujourd'hui cette capacité, et laquelle est la plus déterminante ? »* — une
question de **priorisation par cas d'usage sportif**, différente des 3 autres vues qui raisonnent
par qualité isolée.

**Test 10 secondes** : partiellement. Le nom de la capacité (« Saut ») et le statut coloré se
comprennent immédiatement. Ce qui ne se comprend pas sans explication : pourquoi la même qualité
(ex. Absorption) réapparaît, avec le même statut, dans 5 sous-capacités différentes réparties sur 3
capacités (Partie 8, Scénario 2) — donne une impression de répétition plutôt que d'analyse
supplémentaire.

**Test 30 secondes** : pour les 5 qualités HYP-gouvernées, la réponse honnête est largement
« rien de nouveau, seulement une nouvelle organisation visuelle du même statut » (Partie 8/9). Pour
les 3 qualités non-HYP (Force maximale/Propulsion/Contrôle moteur), la réponse est « une
information réellement nouvelle, jamais visible ailleurs » — **la valeur de cet onglet est donc
inégale selon la qualité regardée**, jamais nulle mais jamais uniforme non plus.

---

## 5. RAISONNEMENT

**Emplacement** : `index.html:8870-8897`, `tab==='raisonnement'`.

**Objectif apparent** : détail du raisonnement clinique structure-anatomique → qualité
fonctionnelle, avec un niveau de granularité (Contribution/Confiance/Spécificité/Sens) qui suggère
une analyse individualisée fine.

**Objectif réel dans le code** : rendu **statique** de `STR_QUAL_DETAIL` (11 systèmes anatomiques ×
56 liens système→qualité au total). **Aucune donnée du patient n'est lue** (ni `td`, ni `sysSc`, ni
`fSc`) — c'est un référentiel fixe, identique pour tous les bilans, tous les patients, tous les
sports.

**Source de données** : `STR_QUAL_DETAIL` (littéral, lignes 1200-1212) + `SYS_COMPENSATIONS`
(littéral, 1184-1195, texte libre par système) + `SYSTEMS` (liste d'itération).

**Données affichées** : intro statique (nettoyée du Lot Productisation 1 : « il s'agit
d'estimations, pas de mesures brutes »), une carte par système anatomique, une ligne par qualité
liée avec `Contribution`/`Confiance`/`Spécificité`/`Sens`, et un bloc « Compensations attendues »
(texte libre) quand disponible.

**Données calculées dans le rendu** : aucune — parcours pur de deux constantes.

**Vocabulaire** : `Contribution` ∈ {Majeure, Modérée, Mineure} (13/25/18 occurrences — **jamais
« Determinante »**, contrairement à `VAR_REL3`/`CAPACITES_DATA` qui l'utilisent) ; `Confiance` ∈
{Élevée, Modérée, Faible} (23/25/8) — **accentué, capitalisé, distinct du `confidence` non accentué
de l'onglet Fonctions** ; `Spécificité` ∈ {Directe, Indirecte} (27/29) ; `Sens` = `'+'` dans 100%
des 56 cas (jamais `'-'`, donc décoratif en l'état — aucune relation inverse n'est aujourd'hui
documentée dans ce référentiel).

**Relation avec HYP** : **aucune** — ce référentiel est indépendant des 8 moteurs HYP, jamais
croisé avec un état `objectified`/`suspected`/`non_determinable`.

**Relation avec CSM** : aucune.

**Relation avec TFM** : aucune — `STR_QUAL_DETAIL` est un troisième registre, séparé de `TFM` et de
`VAR_REL3`, avec son propre vocabulaire de poids (Partie 9).

**Public cible réel** : profil pédagogique/formation ou médecin voulant comprendre le modèle
biomécanique général sous-jacent au logiciel — **pas** un profil qui cherche une information sur
CE patient. C'est la seule des 4 vues honnêtement présentée (par son disclaimer, déjà corrigé au
Lot Productisation 1) comme non spécifique au patient — mais le placement de cette vue **dans**
l'onglet Expert View d'un bilan patient (à côté de Synthèse clinique, Hypothèses, Orientations)
invite structurellement à la lire comme un résultat du patient, contrairement à son contenu réel.

**Question clinique unique à laquelle cette vue répond** : *« De façon générale (indépendamment de
ce patient), quelles structures anatomiques contribuent à quelles qualités fonctionnelles, et avec
quelle force/confiance/spécificité ? »* — une question de **référentiel pédagogique**, pas une
question sur le bilan en cours.

**Test 10 secondes** : NON, de façon structurelle. Rien dans le rendu (hors la phrase d'intro,
discrète) ne signale au praticien que ce tableau ne dépend PAS du patient ouvert — un kiné pressé
peut légitimement croire lire un résultat individualisé.

**Test 30 secondes** : la réponse honnête, pour n'importe quel patient, est *« cette vue ne change
jamais, quel que soit mon patient »* — ce qui n'est pas une redondance avec une autre vue (aucune
autre vue ne montre ce contenu), mais soulève une question différente : est-ce la bonne place pour
un référentiel statique dans un rapport individualisé (Partie 15/17) ?

---

## 6. Sources de données — résumé croisé

| Vue | Source primaire | Patient-dépendante ? | Recalcul dans le rendu | Registre de poids |
|---|---|---|---|---|
| Fonctions | `functionScores` (+ `TFM` brut pour les chips) | Oui | Oui (liste de chips + mapping 3/2/1) | TFM : `Direct/Majeur/Mineur` |
| Variables | `VAR_REL3` | Oui (filtrage par variables actives) | Oui (`kpiStatus`, filtre) | VAR_REL3 : `Determinante/Majeure/Moderee/Mineure` |
| Capacités | `CAPACITES_DATA` (statique) + `functionScores`/`VAR_REL3` (dynamique) | Partiellement — la structure (4 capacités, 52 liens) est fixe ; les statuts sont patient-dépendants | Non | `CAPACITES_DATA` : `Determinante/Majeure/Moderee` (jamais Mineure), jamais affiché |
| Raisonnement | `STR_QUAL_DETAIL` (statique) | **Non, jamais** | Non | `Contribution` : `Majeure/Modérée/Mineure` (jamais Determinante) |

Quatre registres de poids distincts, quatre vocabulaires, aucune table de correspondance déclarée
entre eux dans le code (confirmé — aucune fonction ne convertit un poids TFM en poids VAR_REL3 ou
inversement).

---

## 7. Matrice des informations

Classification par information transversale, sur l'échelle demandée (A—unique et utile ;
B—utile mais redondante ; C—technique, utile seulement en Expert ; D—purement redondante ;
E—potentiellement contradictoire) :

| Information | Fonctions | Variables | Capacités | Raisonnement | Classe |
|---|---|---|---|---|---|
| Statut clinique par qualité (vert/jaune/orange/rouge) | Affiché (badge) | Affiché (par variable, pas par qualité) | Affiché (répété par sous-capacité, jusqu'à 5×) | Absent | **B** — utile dans Fonctions (résumé), redondant dans Capacités (répétition sans valeur ajoutée pour les 5 qualités HYP-gouvernées) |
| Preuve HYP nommée (quelle variable a généré CE diagnostic) | Absent | Absent (relations techniques, pas de rôle diagnostique HYP) | Absent | Absent | **Absente des 4 vues** — déjà signalé comme lacune centrale par `AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md` §3 ; ni Fonctions ni Variables ne la comblent malgré leur richesse apparente |
| Poids TFM d'un test pour une qualité | Affiché (Direct/Majeur/Mineur) | Absent (VAR_REL3 a son propre poids, non le poids TFM) | Absent | Absent | **A** dans Fonctions — seule vue qui l'expose |
| Relations variable-à-variable (amont/aval/corrélées) | Absent | Affiché (cœur de la vue) | Absent | Absent | **A** — unique à Variables |
| Sous-domaines Absorption (freinage/excentrique/stratégie/réactive) | Absent | Absent | Absent | Absent | **Absente des 4 vues** (et de tout le logiciel — cf. audit clinique précédent) |
| Contribution structure anatomique → qualité (référentiel) | Absent | Absent | Absent | Affiché (cœur de la vue) | **A** — unique à Raisonnement |
| Décomposition capacité sportive → sous-capacité → qualités | Absent | Absent | Affiché (cœur de la vue) | Absent | **A** — unique à Capacités |
| Statut d'une qualité non-HYP (Force maximale/Propulsion/Contrôle moteur) | Calculé mais jamais lu (`qualityScores`, code mort) | Filtrable en théorie (chip absent — ces noms ne sont pas dans `HYP_CSM_QUALITIES`) | Affiché | Absent | **A** dans Capacités — seul endroit où cette information atteint réellement le praticien |
| Mécanismes biomécaniques influencés (`influences`) | Absent | Affiché | Absent | Absent | **C** — technique, jamais relié à un statut clinique |
| Contribution/Confiance/Spécificité structure→qualité | Absent | Absent | Absent | Affiché | **C** — utile en formation/Expert, pas actionnable pour un bilan patient précis (référentiel statique) |
| Distinction HYP-gouverné vs TFM-seul pour une qualité | Absent (aucune marque visuelle) | Absent | Affiché, mais seulement quand `tfmStatus≠status` (Partie 9) | Absent | **E** — Fonctions et Variables ne distinguent JAMAIS visuellement HYP de TFM ; Capacités le fait partiellement |

---

## 8. Redondances — trois scénarios réels exécutés

Pipeline réel (`computeMoteur()`), résultats bruts obtenus par exécution, pas par lecture de code
seule.

### Scénario 1 — Force déficitaire (`imtp`+`slimtp` saisis, valeurs dégradées)

Résultat CSM : **Force reste `non_determinable`** (confirme la limite normative déjà documentée par
l'audit clinique précédent — `imtp_n`/`slimtp_n` sans norme).

- **Fonctions** : carte « Force » avec `status=null` → `Badge` ne rend RIEN (retourne `null` si
  `!props.status`) ; la bordure colorée de la carte devient invalide (`'3px solid '+SC[null]` →
  `'3px solid undefined'`, pas de couleur visible) ; mais `Couverture 0% · Confiance faible` **et**
  la rangée de chips TFM (`imtp:Direct, slimtp:Direct`) s'affichent quand même. Un praticien voit
  une carte sans badge coloré ni explication, à côté de chips qui semblent indiquer une évidence
  forte (« Direct »).
- **Capacités** : toutes les sous-capacités liées à `Force maximale` restent `—` (non testé/non
  déterminable selon `hypGoverned`) — cohérent, aucune fausse confirmation.
- **Variables** : les 2 variables actives (`imtp_n`, `slimtp_n`) s'affichent normalement avec leurs
  7 sections de relations, sans aucune mention que ces deux mesures, malgré leur saisie, ne peuvent
  structurellement jamais confirmer Force aujourd'hui (limite déjà documentée, jamais transmise ici
  non plus).
- **Raisonnement** : identique pour tout patient (statique) — montre `Quadriceps→force :
  Contribution Majeure, Confiance Élevée` **malgré que Force soit non déterminable pour CE patient** —
  juxtaposition qui peut se lire comme une contradiction si le praticien passe de Fonctions à
  Raisonnement sans lire attentivement le disclaimer.
- **Information répétée** : aucune (aucune vue n'atteint un vrai statut Force ici).
- **Information unique à une seule vue** : les chips TFM Direct (Fonctions) et les 7 sections
  VAR_REL3 (Variables) — toutes deux invitent à une lecture de « preuve solide » que le statut
  final contredit.

### Scénario 2 — Absorption déficitaire (`cmj` freinage dégradé)

Résultat CSM : **Absorption `retenue_faible`, rouge, objectivée**.

- **Fonctions** : 1 carte, `Absorption: rouge, coverage=100%, confidence=elevee`, 1 chip
  `cmj · Majeur`.
- **Capacités** : le MÊME statut rouge d'Absorption se propage, sans nuance ni information
  supplémentaire, dans **5 sous-capacités réparties sur 3 capacités différentes** (Sécurité du saut,
  Dissipation des contraintes, Contrôle de la réception, Décélération, Réorientation) — 5 lignes
  identiques « ✗ Absorption (Déficitaire) », aucune ne distinguant la cause (freinage vs capacité
  excentrique vs stratégie, cf. sous-domaines jamais transmis).
- **Variables** : 1 variable active (`cmj_braking_rfd` ou équivalent), ses relations affichées.
- **Raisonnement** : identique pour tout patient — ne réagit pas au fait qu'Absorption soit
  déficitaire pour ce patient précis.
- **Information répétée 5 fois sans valeur ajoutée** : le statut « Absorption rouge », visible dans
  Fonctions, dans le dashboard, dans Synthèse clinique, ET dans 5 lignes de Capacités —
  **exactement le cas concret que la Partie 13 de la mission demande d'identifier** : après avoir vu
  la 2ᵉ occurrence dans Capacités, la réponse à « qu'est-ce que ça m'apporte de plus » est « rien »
  pour les occurrences 3, 4 et 5.
- **Information unique** : la liste précise des sous-capacités concernées (« Sécurité du saut » vs
  « Décélération ») — une vraie information de mise en contexte sportif, mais noyée par la
  répétition du même statut brut sans plus de détail exploitable.

### Scénario 3 — Plusieurs qualités déficitaires (Mobilité + Stabilisation, relation HYP active)

Résultat CSM : **Mobilité + Stabilisation objectivées rouge, relation `HYP_QUALITY_RELATIONS`
active entre elles**.

- **Fonctions** : 3 cartes rouge/orange visibles côte à côte et visuellement indiscernables dans
  leur registre de preuve : `Mobilité (rouge, HYP)`, `Stabilisation (rouge, HYP)`, **`Contrôle
  Frontal (orange, TFM SEUL — aucun moteur HYP pour cette qualité)`** — rien dans le rendu ne
  signale que la 3ᵉ carte n'a pas la même nature de preuve que les 2 premières.
- **Capacités** : quasiment **toutes les 12 sous-capacités des 4 capacités** ressortent `rouge` —
  mélange, dans une même moyenne pondérée, de statuts HYP (Stabilisation) et TFM (Propulsion,
  Contrôle moteur), sans étiquette de provenance sur le résultat agrégé.
- **Variables** : 3 tests actifs (`wblt`, `landing_uni`, `landing_bi`). **Le filtre « Mobilité »
  échoue silencieusement** ici (Partie 3, bug documenté) — malgré un WBLT actif et déficitaire, le
  praticien qui clique ce filtre lit « Aucune variable active liée à Mobilité ».
- **Raisonnement** : identique, statique.
- **Information répétée** : le statut rouge se propage dans jusqu'à 12 lignes de Capacités à partir
  d'une seule vraie donnée patient (Stabilisation rouge).
- **Information unique à une seule vue, et cassée** : le filtre Mobilité de Variables — censé être
  la fonctionnalité de navigation la plus utile de cette vue pour ce scénario précis, il produit un
  faux négatif.

---

## 9. Contradictions potentielles

Cinq constats vérifiés par exécution ou lecture directe, classés par sévérité :

**(1) CRITIQUE, nouveau — incohérence d'orthographe dans `VAR_REL3` casse le filtre Variables et
sous-alimente les comptes TFM.** `VAR_REL3[...].measures[].function`/`.estimates[].function` utilise
deux orthographes différentes pour la même qualité, à l'intérieur du même objet : `'Mobilité'` (0
occurrence) vs `'Mobilite'` (21), `'Explosivité'` (19) vs `'Explosivite'` (129), `'Réactivité'` (25)
vs `'Reactivite'` (87), `'Contrôle Frontal'` (0) vs `'Controle Frontal'` (65). Le filtre par qualité
de l'onglet Variables (`HYP_CSM_QUALITIES`, toujours accentué) ne matche donc **jamais** la majorité
des entrées réelles pour 3 des 8 qualités, et **zéro** entrée pour Mobilité. Effet démontré au
Scénario 3 : un WBLT actif et déficitaire, filtré sur « Mobilité », rend « Aucune variable active ».
**Aucune règle clinique n'est en cause — c'est une faute de frappe de données, présente dans
`VAR_REL3` lui-même (donnée que la mission interdit de modifier).**

**(2) CRITIQUE, nouveau — `Force` (HYP) et `Force maximale` (CAPACITES_DATA/VAR_REL3) sont deux
identifiants différents pour, vraisemblablement, le même concept clinique.** `HYP_CSM_HYP_KEY`
(la table qui décide si une qualité est HYP-gouvernée) utilise la clé `'Force'`. `CAPACITES_DATA`
n'utilise jamais `'Force'` — uniquement `'Force maximale'` (19 occurrences dans ses 52 liens).
Conséquence vérifiée par exécution (Scénario 1) : `tfmQualityDiagnosticGate(fSc,'Force maximale',...)`
retourne systématiquement `hypGoverned:false`, **même quand HYP-FOR-01 a un statut réel** — dans
l'onglet Capacités, Force apparaît donc **toujours** comme une simple moyenne TFM/VAR_REL3, jamais
comme un diagnostic HYP, à cause d'une différence de chaîne de caractères entre deux référentiels,
pas d'une absence réelle de moteur HYP pour Force. C'est l'inverse du risque nommé par la mission
(« information TFM interprétée comme HYP ») : ici, une véritable information HYP est
**structurellement invisible** dans cette vue précise, remplacée sans le dire par du TFM.

**(3) IMPORTANT — palette de couleur des poids VAR_REL3 identique à la palette de statut
clinique.** `WCOL` (`Determinante:'#22C55E', Majeure:'#F97316', Moderee:'#FACC15', Mineure:'#94A3B8'`)
réutilise **exactement** les mêmes codes hexadécimaux que `SC`/`C` pour vert/orange/jaune. Une carte
Variables affiche donc un badge de statut clinique ET une rangée de chips de poids technique dans
les mêmes couleurs — un chip orange « Majeure » (poids technique) est visuellement identique à un
badge orange « Déficitaire » (statut clinique), alors que les deux concepts n'ont aucun rapport.

**(4) IMPORTANT — Fonctions liste des qualités TFM-seules (Contrôle Frontal, Contrôle Sensoriel)
dans le même format visuel que les 8 qualités HYP-gouvernées**, sans aucune marque distinctive
(pas de badge « TFM », pas de style différent). Un praticien voit 3 cartes rouge/orange en série
(Scénario 3) sans indice que la 3ᵉ repose sur un registre de preuve structurellement différent
(moyenne pondérée générique vs convergence diagnostique HYP à seuils cliniques).

**(5) MODÉRÉ — la rangée de chips TFM de Fonctions utilise `TFM[tk][fk]` brut, pas
`effectiveTFMWeight()`** (la fonction, ligne 793, qui applique le réglage `used`/`visible`/`ignored`
du profil de qualité actif). Un test explicitement exclu du calcul de score peut donc apparaître
comme contributeur « Direct » dans cette vue, juste sous un badge que ce test n'a en réalité pas
influencé.

**Non trouvé, vérifié activement** : aucune des 4 vues n'affiche jamais un statut ouvertement
contradictoire avec HYP (ex. « vert » pour une qualité que CSM dit rouge) — la logique de gating
(`tfmQualityDiagnosticGate`) protège correctement ce cas précis partout où elle est utilisée
(Capacités). Le risque réel n'est donc pas une contradiction affichée, mais une **absence de
distinction visuelle** entre deux registres de preuve de force très différente, aggravée par 2 vrais
bugs de données ((1) et (2)) qui rendent certaines informations HYP réelles invisibles ou
certaines informations TFM introuvables.

---

## 10. HYP vs TFM — vue par vue

| Vue | Information HYP | Information TFM | Autre système | Risque de confusion HYP/TFM |
|---|---|---|---|---|
| Fonctions | `.status`/`.coverage`/`.confidence` pour les 8 qualités HYP-gouvernées | Chips `Direct/Majeur/Mineur` pour TOUTES les qualités listées, y compris les 8 HYP-gouvernées | — | **Élevé** — le badge (HYP) et les chips juste dessous (TFM pur) sont juxtaposés sans étiquette, et les 2 qualités TFM-only (Contrôle Frontal/Sensoriel) partagent le même format de carte |
| Variables | Aucune (seul `kpiStatus` = simple seuil, pas un rôle HYP) | La quasi-totalité du contenu (`explainedBy`/`explains`/`correlatedWith`/`refinedBy`/`influences`) | — | **Modéré** — le contenu est presque entièrement TFM/VAR_REL3, mais rien ne le prétend être un diagnostic HYP ; le risque est plutôt la confusion via la couleur (constat 9.3) et le filtre cassé (constat 9.1) |
| Capacités | `.status` pour 5/8 noms de qualité référencés, via `functionScores` | `.status` pour 3/8 noms (`Force maximale`/`Propulsion`/`Contrôle moteur`), via `computeQualityStatus` | Moyenne pondérée mixte par sous-capacité (`POIDS_RANK`) | **Élevé** — c'est la seule vue qui *tente* de distinguer (`hypGoverned`), mais l'agrégat par sous-capacité mélange les deux sans étiquette de provenance sur le résultat final, et `Force` en particulier bascule à tort en TFM-only (constat 9.2) |
| Raisonnement | Aucune | Aucune | `STR_QUAL_DETAIL`, référentiel indépendant, statique | **Faible** — ce contenu ne se présente jamais comme HYP ni comme TFM, le risque est ailleurs (Partie 5 : lu comme spécifique au patient alors qu'il ne l'est pas) |

**Cas où une information TFM pourrait être interprétée comme un diagnostic HYP** : Fonctions
(chips sous un badge HYP), Capacités (agrégat de sous-capacité sans étiquette). **Cas où une
information HYP réelle est rendue invisible/remplacée par du TFM sans le dire** : Capacités, pour
Force spécifiquement (constat 9.2) — nouveau, pas identifié par les audits précédents.

---

## 11. Valeur clinique / valeur technique / risque de confusion

| Vue | Valeur clinique | Valeur technique | Risque de confusion | Justification courte |
|---|---|---|---|---|
| **Fonctions** | **2 — utile** | 2 — utile | **3 — élevé** | Le badge et la couverture/confiance sont un résumé HYP fidèle et rapide à lire ; mais les chips TFM juxtaposées sans étiquette, appliquées uniformément aux qualités HYP et TFM-only, créent un risque réel de surinterprétation d'un poids TFM comme preuve HYP |
| **Variables** | **1 — faible** | **4 — essentielle** | **3 — élevé** (2 dans le meilleur cas si le filtre était réparé) | Aucune valeur diagnostique directe (aucun rôle HYP exposé), mais richesse de traçabilité technique réelle pour un profil expert/dev ; le bug de filtre (constat 9.1) et la collision de couleur (9.3) élèvent le risque au-delà de ce que la donnée elle-même justifierait |
| **Capacités** | **2 — utile**, inégale selon la qualité (0 pour les 5 qualités HYP-dupliquées, 3 pour les 3 qualités TFM-only réellement nouvelles) | 2 — utile | **3 — élevé** | Seule vue à appliquer une vraie logique HYP/TFM, mais l'agrégat par sous-capacité et le bug Force (9.2) neutralisent une partie de cet effort ; la répétition du même statut HYP dans jusqu'à 5 lignes (Scénario 2) dilue le signal utile |
| **Raisonnement** | **1 — faible**, pour CE patient précis (0 si on exige une info patient-dépendante ; 2-3 en tant que référentiel pédagogique général) | 2 — utile | **2 — modéré** | Contenu honnête sur sa propre nature (disclaimer déjà corrigé), mais son emplacement dans un rapport de bilan individualisé, sans jamais varier selon le patient, crée une confusion de contexte plutôt qu'une confusion de diagnostic |

---

## 12. Standard vs Expert

Les 4 vues sont aujourd'hui uniquement dans **Expert View** (jamais dans le dashboard standard, ni
dans le PDF sportif — vérifié : aucune des 4 fonctions de rendu de ces vues n'est appelée par
`buildSportifReport`). Seul le PDF **expert** (`buildExpertReport`) lit des données proches
(`STR_QUAL_DETAIL` via une section séparée) — à confirmer que Capacités/Variables n'y apparaissent
pas non plus (vérifié : aucun appel à `capaciteHTML`/`varRelHTML` trouvé dans `buildExpertReport`).

| Vue | Interface standard | Interface Expert | PDF sportif | PDF expert |
|---|---|---|---|---|
| Fonctions | Absente | **Présente, onglet par défaut** | Absente | Absente |
| Variables | Absente | Présente | Absente | Absente |
| Capacités | Absente | Présente | Absente | Absente |
| Raisonnement | Absente | Présente | Absente | Partiellement (STR_QUAL_DETAIL via une section séparée de `buildExpertReport`, non vérifiée en détail ici — hors périmètre des 4 vues UI) |

**Constat clé** : les 4 vues sont déjà, de fait, réservées à un public technique (Expert View
seulement, jamais montrées au sportif ni dans le document qui lui est destiné). Le risque de
confusion documenté en Partie 9-11 concerne donc un public qui a déjà activement choisi
« Expert » — pas un praticien qui tomberait dessus par accident. Cela **réduit** la gravité
pratique des risques identifiés (l'audience est avertie) sans les annuler (un médecin ou un kiné en
formation peut très bien ouvrir Expert View en croyant y trouver plus de détail sur SON patient,
et tomber sur Raisonnement, qui n'en dépend jamais).

Aucune des 4 vues n'a manifestement sa place dans le PDF sportif (déjà bien calibré pour son public
selon `AUDIT_UX_UI_KINEXUS_V1.md`). Fonctions et Capacités pourraient avoir une valeur en PDF expert
si présentées clairement comme complémentaires (cohérent avec la proposition « Chantier 3 » de
l'audit de productisation) — non recommandé ici sans validation du besoin.

---

## 13. Options d'architecture

**Option A — Conserver les 4 vues séparées, telles quelles.**
- Avantages : zéro effort, zéro risque de régression, chaque vue reste individuellement
  utilisable par qui sait déjà ce qu'elle contient.
- Inconvénients : les 5 constats de la Partie 9 (dont 2 bugs de données concrets) restent non
  signalés au praticien ; la redondance du Scénario 2/3 continue à donner une impression de
  surcharge.
- Information perdue : aucune.
- Complexité : nulle (statu quo).
- Risque clinique : nul.
- Intérêt UX : faible (ne résout aucun problème identifié).

**Option B — Conserver les 4 mais mieux les hiérarchiser** (repositionnement + bandeau de
repositionnement, déjà esquissé par `AUDIT_PRODUCTISATION_CLINIQUE_KINEXUS_V1.md`, Chantier 3).
- Avantages : effort modéré, aucune perte d'information, corrige directement les constats 9.3/9.4
  (via une légende ou un bandeau explicite « Information complémentaire, pas un diagnostic ») sans
  toucher aux données. Peut aussi corriger le bug 9.1 (filtre Variables) et 9.2 (Force maximale)
  par un simple alias d'affichage (`'Force maximale'`→statut réel de `'Force'` si HYP existe), sans
  toucher à `VAR_REL3`/`CAPACITES_DATA` eux-mêmes.
- Inconvénients : ne réduit pas la redondance structurelle du Scénario 2 (Capacités continuera de
  répéter le même statut HYP plusieurs fois, juste en le signalant mieux).
- Information perdue : aucune.
- Complexité : modérée (wording + éventuellement une fonction d'alias de nom de qualité, testée).
- Risque clinique : nul si le garde-fou « ne jamais promouvoir TFM au rang de preuve » (déjà établi
  au Lot Productisation 1) est respecté.
- Intérêt UX : élevé — répond directement aux constats les plus concrets sans reconception.

**Option C — Fusionner certaines vues.**
- Candidats réalistes : Fonctions + Variables (les deux répondent, à des granularités
  différentes, à « quels tests soutiennent cette qualité ? ») ; ou Capacités absorbée en sous-onglet
  de Fonctions (elle réutilise déjà 5/8 statuts identiques).
- Avantages : réduit le nombre d'onglets à parcourir, réduit mécaniquement la redondance visible
  du Scénario 2.
- Inconvénients : Variables sert un public (technique/traçabilité) différent de Fonctions (lecture
  clinique rapide) — une fusion risque de surcharger la vue rapide avec le détail technique, ou
  d'atrophier le détail technique dans une vue résumée. Risque de perte d'utilité pour le profil qui
  utilise spécifiquement Variables comme explorateur de graphe.
- Information perdue : potentiellement le niveau de détail technique de Variables si mal fusionné.
- Complexité : élevée (refonte de composant, pas un simple changement de wording).
- Risque clinique : nul en théorie (aucune donnée ne change), mais risque UX réel de mal doser la
  fusion.
- Intérêt UX : élevé si bien exécuté, risqué si précipité — nécessite une maquette et une
  validation avant tout développement.

**Option D — Transformer certaines vues en détails secondaires** (ex. Raisonnement et Variables
deviennent des panneaux « en savoir plus » accessibles depuis Fonctions/Capacités plutôt que des
onglets de premier niveau).
- Avantages : préserve toute l'information, réduit la largeur de la barre d'onglets, rend explicite
  la hiérarchie « résumé clinique d'abord, détail technique sur demande » déjà recommandée par
  `AUDIT_UX_UI_KINEXUS_V1.md` (Partie 15, niveau 5 : « Onglet Variables/Raisonnement… déjà séparé du
  reste par sa position en fin de liste »).
- Inconvénients : demande une navigation à ajouter (lien « voir le détail » depuis chaque carte de
  qualité) — développement réel, pas un simple wording.
- Information perdue : aucune.
- Complexité : modérée à élevée selon la profondeur d'intégration recherchée.
- Risque clinique : nul.
- Intérêt UX : élevé — c'est la direction déjà pointée par deux audits précédents (Partie 8 «
  amélioration #6 » de `AUDIT_UX_UI_KINEXUS_V1.md`, Chantier 3 de l'audit de productisation),
  cohérente avec cette mission.

**Non retenu d'office, à ne pas exclure non plus** : aucune option ne recommande de **supprimer**
une vue — chacune porte au moins une information réellement unique (Partie 7 : classe A pour
chacune des 4 sur au moins un critère). Une suppression pure perdrait de l'information réelle sans
justification clinique démontrée par cet audit.

---

## 14. Recommandation

**Aucune des 4 vues n'est superflue — chacune répond à une question réellement différente
(Parties 2-5) — mais aucune ne le communique clairement aujourd'hui, et deux bugs de données
concrets (Partie 9, constats 1-2) sapent la fiabilité perçue de deux d'entre elles.**

Recommandation : **Option B en premier (repositionnement + légendes + garde-fous d'affichage),
avec un chemin explicite vers l'Option D pour Variables et Raisonnement dans un lot ultérieur.**
Justification :

1. Les 4 vues ont chacune une raison claire d'exister, démontrée par le code, pas supposée :
   - **Fonctions** existe parce que c'est le seul endroit qui relie un statut de qualité à SES
     tests contributeurs avec un poids relatif — une vraie question de composition.
   - **Variables** existe parce que c'est le seul explorateur de la richesse relationnelle
     variable-à-variable du logiciel (283 entrées, 7 registres) — utile en traçabilité technique,
     jamais remplaçable par un résumé clinique.
   - **Capacités** existe parce que c'est le seul endroit qui relie le vocabulaire d'un préparateur
     physique (Saut, Accélération, Réception, Changement de direction) aux qualités fonctionnelles —
     et la seule vue qui introduit 3 qualités (Force maximale/Propulsion/Contrôle moteur) sans
     équivalent HYP, une information réelle nulle part ailleurs.
   - **Raisonnement** existe parce que c'est le seul référentiel pédagogique structure→qualité du
     logiciel — utile en formation ou pour un médecin qui veut comprendre le modèle sous-jacent.
2. Le problème n'est donc **pas** « trop d'onglets » — c'est que rien ne dit au praticien laquelle
   de ces 4 questions il est en train de poser en ouvrant chacune, et deux erreurs de données
   concrètes (accents/orthographe incohérents dans `VAR_REL3`, nom de qualité divergent entre
   `HYP_CSM_HYP_KEY` et `CAPACITES_DATA`) créent des symptômes visibles (filtre cassé, Force
   invisible comme HYP dans Capacités) qui, eux, ressemblent à des bugs plutôt qu'à une conception
   volontaire.
3. Une fusion (Option C) risquerait de résoudre le symptôme (surcharge apparente) en perdant la
   vraie information différenciante de chaque vue (Partie 7) — non justifié par cet audit.

**Ce lot recommandé n'implique aucune fusion ni suppression** — seulement des corrections de
présentation (légendes/bandeaux HYP-vs-TFM, alias d'affichage pour la collision `Force`/`Force
maximale`, correction de la comparaison de chaîne dans le filtre Variables **sans modifier
`VAR_REL3` lui-même** — la correction porterait sur la fonction de comparaison, pas sur la donnée)
et, dans un second temps, un repositionnement de navigation (Option D) pour Variables et
Raisonnement vers un statut de « détail secondaire » accessible depuis les vues cliniques
principales plutôt que des onglets de premier niveau — cohérent avec la hiérarchie déjà validée par
`AUDIT_UX_UI_KINEXUS_V1.md`.

---

## 15. Parcours utilisateur cible

Parcours actuel : Dashboard → Synthèse clinique (onglet dédié) → onglets Expert (Fonctions en
premier par défaut, puis Résultats/Variables/Capacités/Systèmes/Hypothèses/Orientations/
Couverture/Raisonnement, dans cet ordre fixe) — aucun lien direct entre une qualité de la Synthèse
clinique et sa carte dans Fonctions (déjà signalé, `AUDIT_UX_UI_KINEXUS_V1.md` Partie 8).

Parcours cible proposé (aucune implémentation ici — proposition à valider) :

```
DASHBOARD
  ↓
SYNTHÈSE CLINIQUE  (HYP/CSM — le verdict et sa fiabilité, déjà bon, ne pas toucher)
  ↓
QUALITÉ (carte individuelle — fusion visuelle de ce que Fonctions montre aujourd'hui :
          statut + couverture/confiance HYP + lien "voir le détail")
  ↓          ↓                              ↓
CAPACITÉS   VARIABLES                    RAISONNEMENT
(si utile   (détail technique de         (référentiel pédagogique,
 au patient  traçabilité — Option D,      clairement signalé "hors
 —garder     accessible en un clic         bilan de ce patient",
 Expert)     depuis la carte Qualité,      accessible depuis un lien
             pas un onglet de              "en savoir plus sur le
             premier niveau)               modèle" plutôt qu'un onglet
                                            de premier niveau)
```

Placement recommandé :
- **Fonctions** garde un rôle de premier niveau (résumé par qualité), mais gagnerait à absorber un
  lien direct depuis Synthèse clinique (déjà recommandé par `AUDIT_UX_UI_KINEXUS_V1.md`).
- **Capacités** reste un onglet de premier niveau en Expert View — public cible distinct
  (préparateur physique), question distincte, ne bloque personne d'autre.
- **Variables** et **Raisonnement** sont les deux meilleures candidates à devenir des vues de
  détail secondaire (Option D) plutôt que des onglets de premier niveau : leur contenu est soit
  très technique (Variables), soit non spécifique au patient (Raisonnement) — les deux gagnent à
  être présentées comme un niveau de détail supplémentaire, pas comme une alternative de même rang
  que la Synthèse clinique.

---

## 16. Éléments à conserver (non remis en cause par cet audit)

Conformément à la Partie 14 de la mission — non ré-audités ici, aucune proposition ne les concerne :
Synthèse clinique, Déficits à investiguer, liste Qualités fonctionnelles (dashboard), Body map,
système de couleurs de statut clinique (`SC`/`C`), présentation Absorption actuelle, filtre
Variables **en tant que fonctionnalité** (son intention reste bonne — seul son implémentation
contient le bug documenté en Partie 9.1).

Également à conserver, identifiés par cet audit lui-même :
- La logique de gating `tfmQualityDiagnosticGate` — correcte, protège déjà bien l'onglet Capacités.
- Les 4 structures de données `TFM`/`VAR_REL3`/`CAPACITES_DATA`/`STR_QUAL_DETAIL` elles-mêmes —
  aucune n'est « à supprimer », chacune porte une information réelle (Partie 7).
- Le disclaimer de l'onglet Raisonnement (déjà corrigé au Lot Productisation 1) — honnête, à garder
  tel quel.
- Le vocabulaire `Optimal/À surveiller/Déficitaire/Critique` (`SL`) — cohérent sur les 4 vues,
  aucun problème trouvé.

---

## 17. Éléments à améliorer (constats de cet audit, non implémentés)

Classés par gain/effort, sans aucune implémentation dans cette mission :

1. **CRITIQUE** — corriger la comparaison de chaîne du filtre Variables pour qu'elle tolère les
   variantes orthographiques déjà présentes dans `VAR_REL3` (ex. normalisation accent-insensible
   au moment du filtrage, sans jamais modifier `VAR_REL3` lui-même) — corrige un vrai faux-négatif
   utilisateur (« Aucune variable active liée à Mobilité » alors que le test existe).
2. **CRITIQUE** — résoudre la divergence de nom `'Force'`/`'Force maximale'` entre
   `HYP_CSM_HYP_KEY` et `CAPACITES_DATA`, pour que l'onglet Capacités reconnaisse Force comme
   HYP-gouvernée quand HYP-FOR-01 a un statut — probablement un alias de lecture (`'Force
   maximale'`→`'Force'`) dans `tfmQualityDiagnosticGate` ou son appelant, pas une modification de
   `CAPACITES_DATA`.
3. **IMPORTANT** — ajouter une étiquette de provenance visible (HYP vs TFM) sur les chips de
   Fonctions et sur le statut agrégé de chaque sous-capacité de Capacités — sans quoi les constats
   9.3/9.4 restent vrais.
4. **IMPORTANT** — différencier visuellement la palette de poids VAR_REL3 (`WCOL`) de la palette de
   statut clinique (`SC`), pour éliminer la collision de couleur du constat 9.3.
5. **UTILE** — dans Capacités, afficher explicitement quand un statut de sous-capacité résulte
   d'un mélange HYP+TFM (au lieu de silencieusement moyenner les deux registres) — cf. constat 9
   « Efficacité mécanique » du Scénario 3.
6. **UTILE** — envisager (Option D, avec validation préalable) de repositionner Variables et
   Raisonnement en détail accessible depuis les vues cliniques plutôt qu'en onglets de premier
   niveau — reprend et précise le Chantier 3 déjà proposé par l'audit de productisation.
7. **OPTIONNEL** — dans Fonctions, utiliser `effectiveTFMWeight()` au lieu de `TFM[tk][fk]` brut
   pour la liste de chips, afin qu'un test explicitement exclu du score ne s'affiche plus comme
   contributeur « Direct ».

---

## 18. Prochain lot recommandé

**« Lot Rationalisation des vues 1 — Signalisation HYP/TFM et corrections de nommage »**, limité
strictement aux points 1-4 de la Partie 17 (les deux bugs critiques + les deux incohérences
visuelles les plus documentées), sur le même modèle que le Lot Productisation clinique 1 :
présentation et alias de lecture uniquement, aucune modification de `TFM`, `VAR_REL3`,
`CAPACITES_DATA`, `STR_QUAL_DETAIL`, `HYP_QUALITY_RELATIONS`, ni d'aucun moteur HYP/CSM ; tests
dédiés avant/après (notamment : le filtre Variables retrouve des résultats non-vides pour
Mobilité/Explosivité/Réactivité/Contrôle Frontal sur un scénario avec test actif correspondant ; le
statut Force affiché dans Capacités correspond à `functionScores['Force'].status` quand HYP-FOR-01
a un statut) ; vérification navigateur réelle sur les 3 scénarios déjà exécutés dans cet audit.

Les points 5-7 et l'Option D (repositionnement de navigation) restent des **décisions à valider
avec le praticien avant conception** — hors périmètre d'un lot minimal, cohérent avec la prudence
déjà appliquée par les missions précédentes de cette session pour toute question qui touche à la
présentation d'une nuance clinique (ex. affichage des sous-domaines Absorption, encore non
implémenté pour la même raison).

---

## Verdict

Les quatre vues Fonctions/Variables/Capacités/Raisonnement ne sont **pas** quatre systèmes
redondants qui expliquent la même chose — chacune répond, de façon vérifiée par le code et par
exécution réelle sur 3 scénarios cliniques, à une question différente (composition par qualité,
traçabilité technique variable-à-variable, décomposition par capacité sportive, référentiel
pédagogique structure→qualité). Le risque réel n'est pas la redondance conceptuelle mais (a) une
absence quasi totale de signalisation de la provenance HYP vs TFM d'une information affichée, (b)
une répétition visuelle du même statut HYP jusqu'à 5 fois dans Capacités sans valeur ajoutée
proportionnelle, et (c) deux erreurs de données concrètes et vérifiées — un filtre cassé par une
incohérence d'accents dans `VAR_REL3`, et une divergence de nom (`Force`/`Force maximale`) qui rend
une vraie information HYP invisible dans Capacités. Aucune suppression, fusion ou refonte n'est
justifiée par cet audit ; un lot de corrections ciblées (présentation + alias de lecture, zéro
donnée clinique modifiée) résoudrait la quasi-totalité des risques identifiés.

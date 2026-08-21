# Audit de productisation clinique — Kinexus V1

Audit **exclusivement en lecture** — aucun fichier de production n'a été modifié. Méthode : sweep
exhaustif du texte affiché (grep systématique sur les chaînes de caractères rendues, pas les
commentaires), lecture des 4 onglets de raisonnement et de leurs fonctions de rendu, relecture de la
taxonomie réelle des états HYP/CSM (déjà cartographiée en détail dans
`AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md`), inspection du parcours de saisie et du PDF
expert déjà vérifiés en navigateur réel lors des missions précédentes de cette session.

---

## Chantier 1 — Fuites techniques

### Problème constaté
Plusieurs formulations affichées au praticien nomment directement un composant interne (« moteur
HYP », un identifiant `HYP-XXX-01`, « TFM », un nom de variable brut) au lieu d'une conclusion
clinique.

### Exemples réels (vérifiés par grep + lecture du code, pas hypothétiques)

1. **`csmSafeQualityNote()`, ligne 5843** — texte affiché quand une qualité est objectivée sans
   relation documentée : *« Déficit objectivé par le moteur HYP dédié (HYP-STA-01) — voir la
   Synthèse clinique pour le détail. »* Exactement l'exemple cité par la mission. Consommé par : UI
   onglets « Hypothèses » et « Orientations » (cas sans relation), PDF sportif champ « Pourquoi ? »,
   PDF expert section « Hypothèses cliniques ».
2. **`HYP_QUALITY_RELATIONS[].via`, lignes 4260-4267** — chaque relation embarque directement un nom
   de variable technique et un code moteur dans le texte source : `'wblt_distance (explicative «
   mobilité de cheville » de HYP-STA-01)'`. Ce champ `via` est interpolé tel quel dans la phrase
   finale (`csmRelationshipNarrative`, ligne 5638) : *« Le déficit de Mobilité constitue une
   hypothèse explicative possible du déficit de Stabilisation (wblt_distance (explicative «
   mobilité de cheville » de HYP-STA-01)), sans en établir la cause. »* **C'est le texte le plus
   visible de toute l'application** — il apparaît dans le bloc phare « Relations explicatives
   possibles » de la Synthèse clinique (UI + PDF sportif + PDF expert), constaté dans quasiment
   toutes les captures générées lors des missions précédentes de cette session.
3. **Onglet Variables, ligne 8764** — en-têtes de section en anglais technique mêlé au français :
   *« Explained by (amont) »*, *« Explains (aval) »*, *« Correlated with (liées) »*, *« Refined by
   (même test) »*. Vocabulaire de graphe de dépendances de données, jamais traduit.
4. **Onglet Capacités (`capaciteHTML`)** — un statut peut afficher littéralement *« (non déterminable
   — HYP) »*, le mot « HYP » directement accolé au libellé clinique.
5. **« Information relationnelle TFM (secondaire) »** (ligne 4128, panneau du Fil de Raisonnement) et
   **« Élément relationnel TFM associé… »** (3 occurrences, `tfmSecondaryContributorNote`/
   `csmSafeQualityNote`) — le sigle « TFM » employé directement dans une phrase adressée au
   praticien.
6. **« Information TFM secondaire (hors HYP) »** (3 occurrences — dashboard, PDF sportif, PDF
   expert) — en-tête de groupe utilisant les deux sigles internes comme seul vocabulaire.

### Impact praticien
Un médecin ou un kiné qui lit « HYP-STA-01 » ou « wblt_distance » comprend qu'il est face à un
export de base de données, pas à une conclusion clinique rédigée. C'est précisément le signal
« logiciel interne » identifié dans la réflexion préalable à cette mission.

### Éléments réutilisables
`csmSafeQualityNote()`, `csmRelationshipNarrative()`/`csmSuspectedNote()` et
`tfmSecondaryContributorNote()` sont déjà les points de passage uniques pour ce texte — les corriger
là corrige simultanément tous leurs points de consommation (UI et PDF), sans toucher à CSM ni HYP.
`HYP_QUALITY_RELATIONS[].via` reste utile *en tant que donnée* (traçabilité, déjà exploitée par les
tests) ; seul son usage direct dans la phrase finale doit changer.

### Proposition
- Remplacer `'... (HYP-STA-01) ...'` par une formulation sans identifiant : *« Déficit objectivé par
  les résultats des tests évalués — voir la Synthèse clinique pour le détail. »*
- Ne plus interpoler `rel.via` tel quel dans `csmRelationshipNarrative()`. `via` contient déjà,
  entre guillemets français, un fragment cliniquement lisible (ex. « mobilité de cheville ») séparé
  du nom de variable et du code HYP par une syntaxe régulière (`variable (explicative « gloss » de
  HYP-XXX-01)`). Une extraction du seul fragment entre guillemets (déjà présent, jamais à
  réinventer) permet une phrase du type : *« … (mobilité de cheville), sans en établir la cause. »*
  — sans jamais afficher `wblt_distance` ni `HYP-STA-01`. Si un `via` ne contient pas ce format
  (aucun cas trouvé aujourd'hui, mais à sécuriser), replier sur la phrase sans parenthèse plutôt que
  d'afficher le texte brut.
- Remplacer « Explained by (amont) »/« Explains (aval) »/« Correlated with (liées) »/« Refined by
  (même test) » par des intitulés français cliniques (voir matrice, Lot 10).
- Retirer « — HYP » du libellé de statut dans l'onglet Capacités ; utiliser le vocabulaire déjà
  existant `CSM_STATE_LABEL.non_determinable`.
- Remplacer « TFM »/« Information TFM secondaire » par « Information complémentaire » (voir Lot 3).

### Priorité
**CRITIQUE** pour les points 1 et 2 (visibilité maximale, cœur de la Synthèse clinique) ; IMPORTANT
pour 3-6.

### Risque de modification
Nul sur le plan clinique — uniquement des chaînes de caractères. Risque technique mineur : `via`
doit garder un format extractible de façon fiable (regex simple sur les guillemets français déjà
utilisés systématiquement) ; à tester sur les 8 relations existantes avant tout déploiement.

### À ne surtout pas toucher
`HYP_QUALITY_RELATIONS` (la donnée elle-même, ses 8 entrées, leurs conditions d'activation),
`csmRelationshipNarrative()`'s logique de sélection (quel `level`, quelle relation), `hypId` comme
champ de données (traçabilité interne, tests) — seul son **affichage** change.

---

## Chantier 2 — Note de développement dans l'onglet Variables

### Problème constaté
Ligne 8764 : *« Relations variable-à-variable pour chacune des 283 variables du logiciel… Poids
calculés automatiquement (TFM + hiérarchie des tests), sauf Measures/Estimates qui viennent du
référentiel clinique fourni quand disponible — à valider par l'équipe clinique. »* — une note de
recette/QA interne, montrée telle quelle au praticien. **Même défaut trouvé une seconde fois**, non
signalé par la mission mais découvert pendant cet audit : onglet **Raisonnement**, ligne 8820 :
*« … doivent être validées par l'équipe clinique. »*

### Impact praticien
« à valider par l'équipe clinique » dit littéralement au praticien : *ce que vous lisez n'est pas
encore fiable*. C'est le contraire de l'effet recherché — ça sape la confiance dans un contenu par
ailleurs correct.

### Éléments réutilisables
Le nombre de variables (« 283 ») et la mention du référentiel clinique peuvent rester — c'est la
phrase de validation interne, seule, qui doit disparaître de l'affichage.

### Proposition
- Onglet Variables : *« Visualisez les relations entre les mesures et les différentes qualités
  fonctionnelles. »* (reprend l'exemple de la mission).
- Onglet Raisonnement : formulation équivalente, ex. *« Contribution des structures corporelles aux
  qualités fonctionnelles, à titre indicatif. »* — sans inventer une validation clinique qui n'existe
  pas, sans non plus afficher qu'elle est en attente.

### Priorité
IMPORTANT (visibilité moindre que le Chantier 1, mais même nature de problème).

### Risque
Nul — texte statique, aucune donnée affectée.

### À ne pas toucher
`VAR_REL3`, `STR_QUAL_DETAIL` (données), le calcul des poids lui-même.

---

## Chantier 3 — Les 4 onglets de raisonnement

### Problème constaté
Fonctions (TFM, poids Direct/Majeur/Mineur), Variables (VAR_REL3, poids Determinante/Majeure/
Moderee/Mineure + vocabulaire anglais), Capacités (CAPACITES_DATA, même échelle Determinante/
Majeure/Moderee), Raisonnement (STR_QUAL_DETAIL, Contribution/Confiance/Spécificité) répondent tous,
partiellement, à « pourquoi ce résultat ? » — avec 4 vocabulaires de poids non harmonisés et aucune
indication de quel onglet fait autorité.

### Impact praticien
Un praticien qui consulte Fonctions puis Variables pour la même qualité peut voir une variable
étiquetée « Majeur » dans l'un et « Determinante » dans l'autre pour un rôle proche mais pas
identique (poids TFM vs poids VAR_REL3, deux systèmes distincts) — perçu comme une incohérence, pas
comme une nuance voulue.

### Éléments réutilisables
Rien à supprimer : TFM, VAR_REL3, CAPACITES_DATA, STR_QUAL_DETAIL restent des données utiles et déjà
correctement gouvernées (aucune n'affiche jamais un statut contredisant HYP — vérifié par les
missions précédentes, `tfmQualityDiagnosticGate`/`hypEvidenceRoleForTest`).

### Proposition — hiérarchie de présentation (pas de suppression)
Conserver les 4 onglets techniquement, mais :
1. **Ne jamais** présenter leur contenu comme la source de vérité du diagnostic — c'est déjà
   respecté par le code, à renforcer par le wording (Lot 10).
2. Ajouter, en tête de chacun des 4 onglets, une phrase courte de repositionnement explicite : *«
   Information complémentaire — le diagnostic clinique se trouve dans l'onglet Synthèse clinique. »*
3. Repositionner ces 4 onglets, dans la barre d'onglets, après Synthèse clinique/Résultats/
   Orientations plutôt qu'avant (actuellement : Fonctions, Synthèse clinique, Résultats, Variables,
   Capacités, Systèmes, Hypothèses, Orientations, Couverture, Raisonnement — Variables/Capacités/
   Raisonnement sont aujourd'hui mélangés dans l'ordre avec les onglets cliniques).
4. Harmoniser le VOCABULAIRE AFFICHÉ (jamais les données internes) — voir Lot 10.

### Priorité
IMPORTANT (structurel mais non bloquant — chaque onglet reste utilisable isolément aujourd'hui).

### Risque
Faible : réordonner une liste d'onglets et ajouter une phrase d'en-tête ne touche aucune donnée.

### À ne pas toucher
TFM, VAR_REL3, CAPACITES_DATA, STR_QUAL_DETAIL (données et poids), la logique de gating HYP/TFM déjà
en place.

---

## Chantier 4 — Non déterminable

### Problème constaté
Puissance, Explosivité, Endurance sont aujourd'hui structurellement souvent `non_determinable`
(lacune normative documentée, jamais un bug — cf. `AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md`
§5). Le message affiché ne distingue pas les cas.

### États réellement disponibles dans les sorties HYP/CSM (audit, pas d'invention)
- `state` par qualité : `absente` / `suspectee` / `retenue_faible|moderee|forte` / `non_determinable`.
- `csmNonDeterminableHasPartialEvidence(quality,csm)` (déjà existante, `index.html:5858`) : distingue,
  **au sein même de `non_determinable`**, si au moins une preuve diagnostique a réellement été
  classifiée (norme + valeur disponibles) sans que la convergence globale soit atteinte, contre
  aucune preuve classifiable du tout.

### Mapping proposé — SANS créer de nouvel état clinique (Lot 4 l'interdit explicitement)
| Libellé mission | État réel utilisé | Disponible aujourd'hui ? |
|---|---|---|
| E — Diagnostic retenu | `state ∈ {retenue_faible, retenue_moderee, retenue_forte}` | Oui, déjà exposé (`objectified`) |
| F — Diagnostic non retenu / absence de signal | `state === 'absente'` | Oui |
| D — Signal présent, convergence insuffisante | `state === 'suspectee'` | Oui, déjà un état propre (`csmSuspectedNote`) |
| C — Mesures présentes, références insuffisantes | `state==='non_determinable' && csmNonDeterminableHasPartialEvidence===true` | Oui, calculable dès aujourd'hui par simple lecture |
| A/B — Non testé / données insuffisantes | `state==='non_determinable' && csmNonDeterminableHasPartialEvidence===false` | Oui pour le résultat groupé ; **non** séparable en A vs B aujourd'hui (voir limite ci-dessous) |

**Limite honnête** : la mission propose 6 états (A à F), mais A (« non testé ») et B (« données
insuffisantes ») ne sont **pas distinguables aujourd'hui** avec les données déjà calculées au niveau
qualité — `status:'indisponible'` sur une variable individuelle ne dit pas, dans la majorité des
moteurs (Stabilisation, Endurance, Force), si le test correspondant n'a jamais été saisi ou s'il a
été saisi sans norme applicable (confirmé par lecture directe des moteurs lors de l'audit clinique
précédent). Les séparer proprement demanderait de croiser, mécanisme par mécanisme, `testData[test]
.active` avec le statut renvoyé — un ajout de présentation pur, sans risque clinique, mais un vrai
développement, pas une simple relecture. **Recommandation : fusionner A+B en un seul libellé («
Résultat non déterminable — données actuellement insuffisantes ») pour ce lot, et documenter la
séparation fine A/B comme piste pour un lot ultérieur.**

### Proposition de wording (Lot 5)
- Générique (A/B) : *« Résultat non déterminable. Les données actuellement disponibles ne permettent
  pas de conclure pour cette qualité. »*
- Spécifique (C, cas Puissance/Explosivité aujourd'hui le plus fréquent) : *« Résultat non
  déterminable. Les mesures sont disponibles, mais les références nécessaires à la confirmation de
  cette qualité ne sont pas actuellement exploitables dans cette population. »* — reprend
  littéralement la formulation demandée par la mission, atteignable sans invention car
  `csmNonDeterminableHasPartialEvidence` fournit déjà le booléen nécessaire.
- Signal présent (D) : le texte existant (`csmSuspectedNote`, *« Un premier signal existe pour X,
  mais la convergence diagnostique n'est pas suffisante pour retenir le déficit. »*) répond déjà
  exactement à l'esprit demandé — **rien à changer ici**, seulement à le documenter comme conforme.
- Jamais afficher un nom de variable technique ni un identifiant de seuil (déjà garanti : ces
  fonctions ne lisent jamais `THRESHOLDS`/`NORMS` directement).

### Priorité
IMPORTANT — affecte 3 des 8 qualités en permanence, sur presque tous les bilans.

### Risque
Nul cliniquement (aucune règle de convergence touchée) ; le seul risque technique est de mal câbler
la condition C/A-B (confondre les deux) — à couvrir par des tests dédiés reprenant les scénarios déjà
utilisés dans `AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md`.

### À ne pas toucher
`applyThr`, `THRESHOLDS`, `NORMS`, les règles de convergence (2/2, 2/4, ≥2/6…), tout mécanisme qui
déciderait `state`.

---

## Chantier 5 — PDF expert : Résultats bruts

### Problème constaté
La section « Résultats bruts par test » (`buildExpertReport`, table KPI par KPI) a aujourd'hui la
même mise en forme (titre `print-section-title`, même taille, même poids) que « Fonctions évaluées »
et « Synthèse clinique » plus haut dans le document — rien ne signale visuellement qu'elle est une
annexe.

### Impact praticien
Un médecin qui feuillette rapidement peut s'arrêter sur ce tableau de chiffres bruts en pensant
qu'il s'agit du contenu principal, ou au contraire être découragé par sa densité avant d'atteindre la
Synthèse clinique si l'ordre des pages le place trop tôt.

### Éléments réutilisables
`subtleHeader()` existe déjà dans `buildSportifReport` et est utilisé précisément pour ce rôle
(section discrète, faible contraste, « Informations pratiques ») — le même traitement peut
s'appliquer à cette table dans le PDF expert sans créer de nouveau composant.

### Proposition
- Ajouter un bandeau discret au-dessus de la table : *« DONNÉES TECHNIQUES — DÉTAIL PAR TEST »*
  (même traitement visuel que `subtleHeader`), pour signaler explicitement le changement de registre
  sans retirer aucune ligne du tableau.
- Vérifier l'ordre des sections du PDF expert (aujourd'hui : Fonctions évaluées → Résultats bruts →
  Systèmes contributeurs → Synthèse clinique → Hypothèses → Orientations) : la Synthèse clinique
  arrive **après** le tableau brut — à inverser pour que le contenu interprété précède le détail
  technique, cohérent avec la hiérarchie demandée par la mission (clinique → explication → détail).

### Priorité
UTILE (le PDF sportif, document destiné en premier lieu au sportif/praticien de terrain, n'a pas ce
problème — seul le PDF expert, plus dense par nature, est concerné).

### Risque
Nul — réordonnancement de sections et ajout d'un bandeau, aucune donnée retirée ni modifiée.

### À ne pas toucher
Le contenu du tableau lui-même (aucune ligne à supprimer, conformément à l'instruction explicite de
la mission).

---

## Lot 6 — Saisie (audit de workflow, sans refonte)

Constat déjà établi lors des missions précédentes (tentatives directes d'automatisation de saisie
cette session) : chaque KPI d'un test dispose de son propre bouton « + Essai » indépendant, qu'il
faut cliquer autant de fois qu'il y a d'essais, puis remplir un champ numérique qui apparaît. Pour un
test à 5-6 KPI avec 3 essais chacun, cela représente une quinzaine d'interactions successives avant
de pouvoir passer au test suivant, pour un seul test parmi plusieurs dizaines de la batterie.

**Points de friction identifiés** (sans quantification chronométrée, non réalisée dans cet audit) :
- Le geste « + Essai » est répété identiquement à chaque KPI, alors qu'un essai correspond en
  réalité à **un seul saut/mouvement** produisant plusieurs KPI simultanément (ex. un CMJ donne
  Height + RSI Mod + Peak Power + … en une seule exécution) — la saisie actuelle traite chaque KPI
  comme un essai indépendant plutôt que de regrouper par essai physique.
- Aucun regroupement visuel « essai 1 / essai 2 / essai 3 » commun à tous les KPI d'un même test — le
  praticien doit se souvenir lui-même de quel essai correspond à quelle valeur across KPI.
- Retour à la liste des tests après chaque test (« ← Retour ») avant de pouvoir en ouvrir un autre —
  cohérent avec une liste de formulaire, pas avec l'idée de « batterie » enchaînée.

**Proposition minimale** (conforme à l'instruction « ne pas implémenter cette structure si elle
nécessite une refonte excessive avant audit ») : ce lot documente le problème et le principe cible
(BATTERIE → TEST → ESSAIS → VALIDATION, un tableau essai×KPI plutôt qu'un bouton par KPI) mais **ne
propose pas d'implémentation immédiate** — cela nécessiterait de restructurer le composant de saisie
existant plus profondément que les autres chantiers de ce lot, donc un lot dédié séparé, à cadrer
avec le praticien avant tout développement (quel regroupement par essai est réellement souhaité,
quels tests s'y prêtent).

### Priorité
IMPORTANT pour l'expérience réelle d'un préparateur physique en conditions de terrain, mais
correctement **hors périmètre du lot de développement minimal** proposé ci-dessous (Partie finale).

---

## Lot 9 — Test « 10 secondes / 30 secondes » par profil (raisonné, sans nouvelles captures)

Cet audit ne re-génère pas de nouveaux profils navigateur/PDF — il s'appuie sur les scénarios déjà
produits et inspectés lors des 3 missions précédentes (`AUDIT_FINAL_CLINIQUE_KINEXUS_V1.md`,
`IMPLEMENTATION_FINAL_PRIORITES_CSM.md`, `IMPLEMENTATION_UX_UI_LOT1.md`), qui couvrent déjà les
profils A (normal), B (une qualité), C (plusieurs déficits), D (plusieurs non déterminables), et
partiellement E/F (données CMJ riches, peu de diagnostics confirmables pour Puissance/Explosivité).

| Profil | 10 secondes (aujourd'hui) | 30 secondes (aujourd'hui) | Frein identifié |
|---|---|---|---|
| A — quasi normal | Comprend : peu/pas de déficit, body map neutre | Confirme via Synthèse clinique | Aucun |
| B — une qualité objectivée | Comprend : la qualité + son statut | Lit « Déficits à investiguer », comprend l'action | Aucun majeur |
| C — plusieurs déficits | Comprend : la liste à égalité (corrigé, Lot 1 UX) | Lit les relations — **mais tombe sur `HYP-STA-01`/`wblt_distance`** si une relation existe (Chantier 1) | Fuite technique |
| D — plusieurs non déterminables | Voit les badges gris — ne sait pas si c'est un problème logiciel ou une limite normative (Chantier 4) | Idem, sans plus d'explication actuellement | Wording insuffisant |
| E — riche mais peu confirmable | Idem D, amplifié (3 qualités souvent concernées) | Peut consulter Variables/Raisonnement — **tombe sur « à valider par l'équipe clinique »** (Chantier 2) et sur le vocabulaire anglais (Chantier 1/3) | Fuite technique + incohérence de vocabulaire |
| F — données techniques abondantes | Body map/qualités fonctionnelles restent lisibles | PDF expert : peut confondre le tableau de résultats bruts avec le contenu principal (Chantier 5) | Hiérarchie PDF |

---

## Lot 11 — Inspection « produit fini » par audience

Reprend et formalise l'échange qui a précédé cette mission (déjà transmis au praticien) :

1. **Médecin** : le mot « HYP-STA-01 » ou « moteur HYP » dans une phrase médicale rompt immédiatement
   la crédibilité clinique — c'est le signal le plus fort de « logiciel interne » pour cette
   audience.
2. **Kiné** : la densité de la saisie (Lot 6) et la profusion de « Non déterminable » sans
   explication (Chantier 4) sont les frictions les plus concrètes au quotidien.
3. **Préparateur physique** : les 4 onglets concurrents (Chantier 3) et le vocabulaire anglais de
   l'onglet Variables sont ceux qui donneraient le plus l'impression d'un outil de développeur.
4. **Sportif** (destinataire du PDF sportif, pas expert) : le PDF sportif est aujourd'hui le document
   le plus abouti de l'application (déjà audité et confirmé propre — `AUDIT_UX_UI_KINEXUS_V1.md`) ;
   le principal risque pour cette audience est la relation explicative citant `wblt_distance`
   (Chantier 1, point 2), visible dans ce document précis.

---

## Lot 10 — Matrice de vocabulaire

| Terme actuel affiché | Source | Rôle réel | Nouveau terme proposé |
|---|---|---|---|
| « moteur HYP dédié (HYP-XXX-01) » | `csmSafeQualityNote` | Signale la source diagnostique | *(supprimé — remplacé par « résultats des tests évalués »)* |
| nom de variable + code HYP dans `via` | `HYP_QUALITY_RELATIONS` | Trace la preuve d'une relation | *(le fragment entre guillemets français uniquement, déjà présent dans `via`)* |
| « TFM » / « Information TFM secondaire » | TFM, plusieurs fonctions | Information secondaire, non-diagnostique | **Information complémentaire** |
| « Determinante » (VAR_REL3/CAPACITES_DATA) | VAR_REL3, CAPACITES_DATA | Rôle diagnostique fort (variable) | **Preuve principale** (uniquement si le rôle HYP réel est diagnostique — sinon ne pas utiliser ce terme, cf. garde-fou ci-dessous) |
| « Majeure »/« Direct » (TFM, VAR_REL3) | TFM, VAR_REL3 | Rôle confirmatif ou explicatif selon le moteur | **Élément confirmatif** / **Élément explicatif** selon le rôle HYP réel de la variable (`hypEvidenceRoleForTest`, déjà existant) |
| « Moderee »/« Mineur »/« Mineure » | TFM, VAR_REL3, CAPACITES_DATA | Rôle secondaire non-HYP | **Information complémentaire** |
| « Contribution / Confiance / Spécificité » (onglet Raisonnement) | STR_QUAL_DETAIL | Référentiel structure→qualité indépendant de HYP | Conservés tels quels, mais explicitement présentés comme complémentaires (pas une preuve HYP) |
| « Explained by (amont) »/« Explains (aval) »/« Correlated with » | `varRelHTML` | Graphe de dépendance de variables | **Variables en amont** / **Variables en aval** / **Variables corrélées** |
| « Refined by (même test) » | `varRelHTML` | KPI du même test | **Autres mesures du même test** |
| « Non déterminable — HYP » | `capaciteHTML` | État non déterminable | **Non déterminable** *(déjà le libellé standard `CSM_STATE_LABEL`, à réutiliser sans suffixe)* |

**Garde-fou explicite (repris de la mission)** : le nouveau vocabulaire ne doit **jamais** promouvoir
une information TFM/VAR_REL3/CAPACITES_DATA au rang de « preuve » — seul un rôle HYP réellement
diagnostique/confirmatif/explicatif (déjà déterminé par `hypEvidenceRoleForTest`/le moteur lui-même)
peut recevoir ces termes. Une variable purement TFM reste « Information complémentaire », quel que
soit son poids TFM.

---

## Lot de développement minimal recommandé

Classé par gain UX / effort, en respectant strictement l'interdiction de modifier le raisonnement
clinique :

1. **Chantier 1, points 1-2** (retirer `HYP-XXX-01`/nom de variable brut de `csmSafeQualityNote` et
   `csmRelationshipNarrative`) — gain maximal (le texte le plus visible de l'app), effort minimal
   (2 fonctions déjà centralisées).
2. **Chantier 2** (retirer « à valider par l'équipe clinique » des onglets Variables et Raisonnement)
   — gain élevé, effort trivial (2 chaînes de caractères).
3. **Chantier 1, points 3-6** (vocabulaire anglais de `varRelHTML`, « HYP » dans `capaciteHTML`, «
   TFM »/« Information TFM secondaire ») — gain élevé, effort faible (Lot 10 fournit déjà la
   matrice).
4. **Chantier 4/5** (wording non-déterminable enrichi via `csmNonDeterminableHasPartialEvidence` déjà
   disponible ; bandeau « Données techniques » sur le tableau brut du PDF expert) — gain élevé
   (concerne 3 qualités sur presque tous les bilans), effort modéré (nouvelle branche de wording,
   tests dédiés).
5. Chantier 3 (repositionnement des 4 onglets + phrase de repositionnement) — gain modéré, effort
   modéré (changement de structure de la barre d'onglets).
6. Lot 6 (saisie) et Chantier 3's fine-grained A/B split (Chantier 4) — documentés comme lots
   séparés, nécessitant une validation du besoin avec le praticien avant conception, hors périmètre
   de ce lot minimal.

**Ce lot minimal ne modifie aucun seuil, aucune norme, aucun diagnostic, aucune règle de
convergence, aucun rôle de variable, aucune relation HYP — uniquement du texte affiché, des
en-têtes, et l'ordre de sections déjà existantes.**

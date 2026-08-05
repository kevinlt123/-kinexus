# Architecture Clinique de Kinexus

> Kinexus n'a pas pour objectif unique d'analyser des tests. Il a pour objectif d'aider le
> clinicien à prendre une décision éclairée, que ce soit pour sécuriser un retour au sport ou
> optimiser la performance, en expliquant de façon transparente les éléments qui conduisent à
> cette décision.

> La mission de Kinexus n'est pas de produire davantage d'informations, mais de transformer des
> données complexes en une décision clinique compréhensible, argumentée et exploitable.

## Statut de ce document

Document de référence, validé par le praticien le 05/08/2026, à l'issue d'une discussion
approfondie sur la manière dont Kinexus doit raisonner sur un sportif.

Ce n'est pas une note technique décrivant un moteur particulier — c'est le document qui décrit
**comment Kinexus pense**, indépendamment du test, du moteur ou de l'écran concerné. Toute
évolution future du logiciel (nouveau test, nouvel écran, nouvelle narration) doit être cohérente
avec ce document. En cas de conflit apparent entre une évolution envisagée et ce qui est décrit
ici, la ligne directrice ne doit pas être modifiée sans validation explicite du praticien.

Ce document a été formalisé alors que Kinexus n'implémente concrètement cette philosophie que
pour un seul test (le CMJ). C'est volontaire : la philosophie est pensée dès le départ pour aller
au-delà du CMJ, et sa formulation ne doit contenir aucune référence qui ne survivrait pas à
l'ajout d'un futur test (Drop Jump, SLCMJ, Isométrie, batteries RTP...).

---

## La mission de Kinexus

Ce principe précède tous les autres dans ce document. Il doit être lu et compris avant la
description des trois niveaux qui suit — les trois niveaux ne sont pas l'objectif de Kinexus,
ils sont les outils qui permettent de l'atteindre.

Kinexus ne cherche pas à remplacer le raisonnement du clinicien. Il organise, hiérarchise et
explique objectivement les informations issues des différents moteurs afin d'aider le praticien
dans sa prise de décision.

Tous les moteurs, toutes les analyses, toutes les interfaces construites dans Kinexus — les
qualités physiques, les phases biomécaniques, les profils biomécaniques, les asymétries, les
indices biomécaniques, les alertes, le Moteur de Confiance, Le Fil de Raisonnement — **ne sont
pas une finalité en soi**. Ce sont des briques au service de deux objectifs cliniques majeurs,
et de ces deux objectifs seulement.

### 1. Retour au sport (RTP)

La question à laquelle Kinexus doit être capable de répondre n'est pas "quelles sont les valeurs
mesurées", mais :

> Ce sportif est-il réellement prêt à retourner sur le terrain ?

Et si la réponse est non, Kinexus doit pouvoir expliquer objectivement :

- pourquoi il ne l'est pas ;
- quelles qualités sont encore insuffisantes ;
- quels déficits biomécaniques persistent ;
- quelles asymétries restent présentes ;
- quels éléments convergent vers cette conclusion ;
- quel est le niveau de confiance de cette conclusion.

Kinexus a vocation à dépasser les batteries RTP classiques, qui reposent souvent sur quelques
seuils ou quelques tests isolés, au profit d'une analyse globale, multicritère, qui explique
réellement le raisonnement clinique plutôt que de se limiter à un verdict.

### 2. Performance

L'objectif n'est pas seulement de détecter des déficits. Kinexus doit être capable d'identifier
tout le potentiel du sportif :

- ses principales qualités ;
- ses points forts ;
- ses points faibles ;
- sa stratégie biomécanique ;
- ses axes d'amélioration ;
- ses axes d'optimisation.

L'objectif est de comprendre le sportif dans sa globalité — pas uniquement de rechercher ce qui
ne va pas.

### Conséquence : les trois niveaux ne sont jamais des objectifs

Ceci confirme et encadre le principe d'organisation décrit plus bas : les qualités physiques, les
phases biomécaniques et les profils biomécaniques (ainsi que tout ce qui en dérive — asymétries,
indices, alertes, confiance, narration) ne sont que des outils. Ils n'ont de valeur que dans la
mesure où ils font progresser la réponse à l'une des deux questions ci-dessus.

Note de cohérence avec les trois registres de narration (détaillés plus bas) : "Déficit confirmé"
et "Signal biomécanique isolé" servent avant tout la question du Retour au sport ; "Observation de
performance" sert la question de la Performance. Ce n'est pas une coïncidence — c'est la
conséquence directe du fait que ces registres ont été pensés pour ces deux finalités.

### Test de pertinence pour toute évolution future

Avant d'ajouter une fonctionnalité au cœur de Kinexus, elle doit pouvoir répondre "oui" à cette
question :

> Est-ce que cette évolution améliore la capacité de Kinexus à répondre à l'un de ces deux
> objectifs (Retour au sport ou Performance) ?

Si la réponse est non, cette fonctionnalité n'a probablement pas sa place dans le cœur du
logiciel — quelle que soit par ailleurs sa qualité technique ou son intérêt isolé.

---

## Principe d'organisation : la complémentarité des trois niveaux

> Les qualités physiques, les phases biomécaniques et les profils biomécaniques ne sont pas
> trois niveaux qui se remplacent l'un l'autre. Ce sont **trois lectures complémentaires d'un
> même sportif**.

Selon les situations, ces trois lectures :

- **peuvent converger** — elles racontent alors la même histoire depuis trois angles différents,
  ce qui renforce la confiance dans la conclusion ;
- **peuvent s'expliquer mutuellement** — l'une éclaire pourquoi l'autre observe ce qu'elle
  observe ;
- **peuvent attirer l'attention l'une sur l'autre** — une observation fine à un niveau peut
  justifier de vérifier un autre niveau qui, seul, n'aurait rien signalé ;
- **mais doivent toujours conserver leur indépendance conceptuelle**. Aucune des trois lectures
  n'est structurellement subordonnée aux deux autres. Aucune ne doit être mise "au service" d'une
  autre par construction logicielle.

Ce principe a une conséquence directe sur la conception : **aucun écran, aucun moteur, aucune
narration ne doit être construit en supposant qu'un de ces trois niveaux valide, dérive ou
subordonne les deux autres.** Chacun doit pouvoir être interrogé, affiché et compris seul.

### Principe d'étanchéité : le moteur des qualités reste la seule source de vérité

> Le moteur des qualités reste la seule source de vérité sur les capacités physiques du sportif.
>
> Les moteurs spécialisés (CMJ aujourd'hui, puis Drop Jump, SLCMJ, Isométrie, etc.) ne recalculent
> jamais ces capacités.
>
> Leur rôle est d'enrichir leur interprétation clinique en répondant à trois questions
> complémentaires :
>
> - Pourquoi cette limitation apparaît-elle ?
> - Où se situe-t-elle dans le mouvement ?
> - Comment le sportif réalise-t-il ce mouvement (stratégie biomécanique) ?
>
> Ils enrichissent donc la compréhension clinique du sportif sans jamais modifier l'évaluation des
> qualités physiques.

Ce principe rend explicite, pour tout moteur spécialisé présent ou futur, une contrainte qui
découle directement de l'indépendance conceptuelle des trois niveaux ci-dessus : le flux
d'information entre le niveau 1 (qualités) et les niveaux 2/3 (phases, profils) est **strictement
à sens unique et en lecture seule**. Un moteur spécialisé peut *consulter* le statut d'une qualité
pour qualifier sa propre conclusion (déficit confirmé / signal isolé / observation de
performance — voir "Les trois registres de narration" ci-dessous), mais ne doit jamais :

- recalculer, pondérer différemment, ou court-circuiter le moteur des qualités ;
- écrire dans `functionScores` (ou l'équivalent futur) une valeur dérivée d'un moteur spécialisé ;
- conditionner le résultat d'une qualité à la présence, l'absence ou la valeur d'un test
  biomécanique spécifique.

Les trois questions (Pourquoi / Où / Comment) ne créent pas un niveau supplémentaire aux trois
niveaux de lecture ci-dessous : "Où" correspond au niveau 2 (phases), "Comment" au niveau 3
(profils), et "Pourquoi" à la justification qui accompagne déjà chaque conclusion des niveaux 2 et
3 (l'arbre de preuve du Specification Pattern, transversal aux deux — jamais un niveau séparé).

*Traduction actuelle dans le code (index.html)* : `computeMoteur()` — signature
`(testData, questData, normPop, normAge)`, aucune dépendance vers `computeMouvementAnalysis()` ou
tout autre moteur spécialisé. `functionScores` (sa sortie) est transmis en 4ᵉ paramètre, en lecture
seule, à `computeMouvementAnalysis()` ; aucune écriture dans `functionScores` n'existe nulle part
dans le code. Vérifié explicitement le 05/08 au moment du branchement CMJ ↔ qualités.

**État de fait à ne pas travestir** : aujourd'hui, le moteur des qualités ne lit *pas* les
variables individuellement. `computeMoteur()` s'appuie sur `tSt[testKey]`, un agrégat déjà moyenné
par `computeTestStatus()` sur l'ensemble des KPIs d'un test, avant même que `TFM` n'intervienne. À
l'inverse, les moteurs Phases (`CMJ_VAR_META`) et Profils (`BiomechanicalProfiles.
variablesDiscriminantes`) lisent les variables brutes directement, sans agrégation intermédiaire.
Le moteur des qualités est donc, à ce jour, l'exception plutôt que la référence pour la lecture
directe des variables — voir le pipeline ci-dessous. Ce document décrit cet état tel qu'il est ;
il ne prescrit pas de le corriger.

---

## Le pipeline : preuve → interprétation → conclusion → narration

> Une variable n'est pas, par elle-même, un signal clinique. C'est une **preuve**. Elle ne devient
> un constat clinique que lorsqu'un moteur l'interprète.

Tout moteur de Kinexus — présent ou futur — transforme l'information selon la même séquence,
quelle que soit la question clinique à laquelle il répond :

1. **Variables (preuves objectives)** — les données élémentaires disponibles pour un test :
   valeurs brutes des KPIs (`TBK`).
2. **Normalisation** — la comparaison de cette valeur à une population de référence (percentile,
   bande vert/jaune/orange/rouge via `classifyBand`/`normPercentile`). **Cette étape appartient
   encore à la preuve, pas à l'interprétation** : elle rend une valeur comparable, elle ne répond à
   aucune question clinique.
3. **Moteurs spécialisés (interprétation)** — Qualités, Phases, Profils, et tout futur moteur
   (Drop Jump, Isométrie...). Chacun applique sa propre logique métier (pondérations, règles,
   seuils, convergences — `TFM`, `ThresholdBandClassifier`, le Specification Pattern) à un
   ensemble de preuves pour répondre à **une** question clinique qui lui est propre.
4. **Conclusions cliniques** — le résultat produit par un moteur (`conclusionAutomatique`,
   `conclusionRelative`, `phasePresentation().pourquoi`, le `dossier` de `dossierPreuvesPhase`).
5. **Narration** — `composeNarrativeParagraph()` raconte une **conclusion**, jamais une preuve
   brute, et la situe dans l'un des trois registres (déficit confirmé / signal isolé / observation
   de performance — voir ci-dessous).

Ce pipeline s'arrête à la narration : il décrit comment un **moteur unique** transforme ses propres
preuves en un constat compréhensible. Ce qui se passe *après*, une fois que plusieurs moteurs (et,
demain, plusieurs tests) ont chacun produit leur narration, n'est plus le pipeline lui-même mais une
couche transversale qui les survole — voir "Orientation clinique" plus bas.

**Règle qui en découle directement** : une variable, normalisée ou non, n'est jamais éligible à un
registre narratif. Seule une conclusion produite par un moteur peut être "déficit confirmé", un
"signal isolé" ou une "observation de performance". Une variable élevée ou abaissée à elle seule
(ex. Contact Time augmenté au Drop Jump) reste une preuve tant qu'aucun moteur ne l'a interprétée
— même si le moteur des qualités conclut, sur cette même variable combinée à d'autres, que la
qualité correspondante reste satisfaisante. Les deux conclusions (qualité satisfaisante / preuve
isolée à surveiller) peuvent coexister sans se contredire : elles répondent à des questions
différentes, produites par des moteurs différents, à partir du même substrat de preuves.

**L'asymétrie n'est pas une quatrième question clinique.** Elle ne répond ni à "que", ni à "où",
ni à "comment" par elle-même : c'est une dimension transversale qui **qualifie** une lecture
existante quand elle s'y prête, plutôt qu'une lecture indépendante. *Traduction actuelle dans le
code* : `computeAsymEngine()` n'a pas de "question clinique" propre — son résultat apparaît comme
une ligne supplémentaire ("Asymétrie") dans les preuves du moteur Phases via `phaseEvidence()`,
jamais comme un moteur autonome au même rang que Qualités/Phases/Profils.

Ce pipeline reste valable quel que soit le nombre de moteurs spécialisés disponibles pour un test
donné : un futur test (Isométrie, Hop Tests) peut n'avoir que le moteur des qualités et rester
parfaitement cohérent avec cette architecture — les niveaux 2 et 3 (et toute dimension
transversale comme l'asymétrie) ne s'ajoutent que lorsque le test s'y prête, sans jamais devenir un
prérequis.

---

## Les trois niveaux de lecture

### Niveau 1 — Les qualités physiques

**Question clinique : Que limite le sportif ?**

Lecture fonctionnelle et **transversale** : elle agrège les informations provenant de toute la
batterie de tests réalisés par le sportif (pas seulement le test concerné par une analyse
biomécanique donnée). C'est une évaluation de la capacité — ce que le sportif est capable de
produire, indépendamment de la manière dont il l'obtient.

C'est le niveau qui doit guider la décision clinique en premier lieu, et qui constitue **le
langage principal du Dashboard** : c'est par une qualité physique qu'un praticien doit entrer
dans un bilan, jamais par un test ou un moteur spécifique.

*Traduction actuelle dans le code (index.html)* : `FUNCTIONS`, `computeMoteur()`, `functionScores`
— construit à partir de `TFM` (Test-Fonction-Mapping), qui pondère la contribution de chaque test
de la batterie (WBLT, Force Segmentaire, IMTP, CMJ, Hop Tests...) à chaque qualité (Force
maximale, Absorption, Contrôle Frontal, Propulsion / Production de force, Mobilité...).

### Niveau 2 — Les phases biomécaniques

**Question clinique : Où se situe cette limitation dans le mouvement ?**

Lecture biomécanique plus fine, **spécifique au test concerné** (le CMJ aujourd'hui). Elle
localise un déficit dans la séquence du mouvement — à quelle étape précise (Unloading, Braking,
Concentric, Flight, Landing pour le CMJ) la performance s'écarte des normes. C'est une lecture
**absolue** (comparaison du sportif à une population de référence), simplement plus granulaire
que le niveau 1.

Ce niveau localise le déficit ; il ne décrit pas encore la stratégie motrice employée pour y
arriver — c'est le rôle du niveau 3.

*Traduction actuelle dans le code* : `CMJ_VAR_META`, `computeBiomecaEngine`/`computeBiomecaPhase`,
les 5 `CMJ_PHASES`. Conçu explicitement pour être rejoué à l'identique sur un futur test
biomécanique (même architecture moteur générique + référentiel de données par test).

### Niveau 3 — Les profils biomécaniques

**Question clinique : Comment le sportif réalise-t-il son mouvement ?**

Lecture **comparative** : elle décrit la stratégie motrice employée par le sportif, en le
comparant à lui-même plutôt qu'à une population de référence. Elle est **indépendante de la
sévérité du déficit** — deux sportifs peuvent présenter le même déficit au niveau 1 ou au niveau
2, avec des profils biomécaniques totalement différents (l'un compense en Absorbeur, l'autre en
Propulsif), et inversement deux sportifs peuvent partager le même profil dominant sans partager
le même niveau de performance absolue.

*Traduction actuelle dans le code* : `BiomechanicalProfiles` (5 profils : Propulsif, Absorbeur,
Réactif, Explosif, Contrôle), `BiomechanicalProfileEngine`, `computeSignatureBiomecanique`.

### Synthèse des trois questions

| Niveau | Question | Portée | Type de lecture |
|---|---|---|---|
| 1 — Qualités | Que limite le sportif ? | Toute la batterie de tests | Absolue, agrégée |
| 2 — Phases | Où se situe cette limitation ? | Le test concerné (CMJ aujourd'hui) | Absolue, localisée |
| 3 — Profils | Comment réalise-t-il son mouvement ? | Le test concerné (CMJ aujourd'hui) | Comparative (au sportif lui-même) |

---

## Les trois registres de narration

Une conclusion biomécanique (niveau 2 ou 3) peut se trouver dans l'une de trois situations
distinctes vis-à-vis du niveau 1, et **la narration doit le dire explicitement** plutôt que de
présenter toute observation sur le même ton :

1. **Déficit confirmé** — la qualité physique correspondante est elle-même déficitaire, et
   l'observation biomécanique en explique le mécanisme. C'est le cas le plus fort : plusieurs
   niveaux convergent vers la même conclusion.
2. **Signal biomécanique isolé** — l'observation biomécanique révèle un écart aux normes qu'aucune
   qualité physique ne signale encore (dilué dans une moyenne agrégée sur toute la batterie, ou
   pas encore assez sévère pour faire basculer une qualité). Reste un signal à surveiller, mais
   sans confirmation fonctionnelle à ce stade.
3. **Observation de performance** — aucun déficit n'est identifié à aucun niveau ; l'observation
   biomécanique met en évidence une particularité de stratégie (souvent au niveau 3, profils) qui
   constitue un axe d'optimisation chez un sportif par ailleurs sain.

**Ces trois registres ne doivent jamais être racontés avec le même vocabulaire.** Un axe
d'optimisation présenté avec le vocabulaire d'une alerte clinique ("priorité", "déficitaire")
serait trompeur et userait la confiance du praticien dans le système. La distinction doit être
visible aussi bien dans le texte narratif que dans le traitement visuel (couleur, urgence,
positionnement à l'écran).

**Prérequis technique — résolu (05/08)** : distinguer ces trois registres suppose que le moteur
produisant une observation aux niveaux 2/3 sache si la qualité physique correspondante (niveau 1)
est ou non déficitaire pour ce même bilan. `computeMouvementAnalysis()` reçoit désormais
`functionScores` en 4ᵉ paramètre (lecture seule, transmis depuis `computeMoteur()` — voir le
"Principe d'étanchéité" ci-dessus), et `dossierPreuvesPhase()` en dérive `countMoteurs` : le
système distingue donc structurellement un "déficit confirmé" (`countMoteurs>=2`, profil ET
qualité déficients) d'un "signal isolé" (`countMoteurs===1`). La distinction visuelle des trois
registres dans Le Fil de Raisonnement (badge par thread + section "Observation de performance")
est également implémentée. Voir "État d'implémentation actuel" ci-dessous.

---

## Orientation clinique : la couche transversale

**L'orientation clinique n'est pas une étape du pipeline.** Le pipeline (preuve → interprétation →
conclusion → narration, ci-dessus) décrit comment **un moteur unique** raisonne sur ses propres
preuves. L'orientation clinique intervient *après* — une fois que tous les moteurs disponibles pour
un bilan ont chacun produit leur narration — et les survole. C'est une couche transversale,
indépendante de tout moteur particulier, pas le prolongement du dernier d'entre eux.

Cette distinction n'est pas cosmétique. Aujourd'hui, Kinexus ne raisonne que sur le CMJ. Demain,
un même bilan combinera plusieurs tests biomécaniques (Drop Jump, SLCMJ, isométrie, hop tests,
questionnaires...), chacun avec ses propres moteurs et ses propres conclusions. **L'orientation
clinique ne devra jamais être le prolongement d'un moteur ou d'un test particulier, mais la mise en
cohérence de tous les moteurs de tous les tests d'un même bilan.** Si elle était pensée comme une
étape du pipeline, elle risquerait d'hériter implicitement du test qui l'a déclenchée (le CMJ
aujourd'hui) — exactement l'écueil que le "Principe d'étanchéité" ci-dessus met déjà en garde
contre, transposé un cran plus haut.

**Aucun moteur ne peut, à lui seul, définir l'orientation clinique d'un bilan.** Celle-ci résulte
toujours de la synthèse de l'ensemble des moteurs disponibles, pondérée par leur domaine
d'expertise et la qualité des preuves qu'ils apportent.

**Cette couche ne produit jamais une nouvelle connaissance clinique.** Elle ne fait qu'observer
l'ensemble des conclusions déjà produites par les différents moteurs et les organiser pour le
praticien. Elle ne doit jamais :

- recalculer une conclusion déjà produite par un moteur ;
- réinterpréter une preuve — elle ne lit jamais les variables ni les valeurs normalisées
  directement, seulement les conclusions et les registres déjà produits par narration (même
  contrainte de lecture seule que le "Principe d'étanchéité" ci-dessus) ;
- introduire une nouvelle règle clinique (seuil, pondération, mapping) ;
- proposer un raisonnement qui n'existe dans aucun moteur.

Elle doit uniquement : hiérarchiser, synthétiser, orienter l'attention du praticien, faciliter la
prise de décision — sans jamais la prendre à sa place. Un test simple pour vérifier qu'une phrase
relève bien de cette couche et non d'une règle clinique cachée : *elle doit pouvoir être produite
par pur tri, filtre ou regroupement de conclusions déjà existantes, sans inventer aucun seuil ni
aucune règle nouvelle.* Si ce n'est pas le cas, ce n'est pas de l'orientation clinique — c'est une
règle métier qui doit d'abord être validée avec le praticien, comme n'importe quel autre seuil de
Kinexus.

**Vocabulaire : deux usages, deux publics.** "Orientation clinique" est le terme d'architecture —
il décrit la fonction de cette couche dans ce document. Dans l'interface utilisateur, le libellé
retenu est **"Points d'attention clinique"** : plus immédiatement compréhensible pour le praticien,
et il évite la collision avec le champ `orientation` déjà présent dans `computeMoteur()` (voir
ci-dessous), dont la portée est différente. Le document décrit une fonction ; l'interface décrit ce
que voit le praticien — les deux objectifs ne sont pas identiques, les deux vocabulaires n'ont pas
à être identiques non plus.

**État actuel dans le code : une version non disciplinée existe déjà, sous trois formes.** Ce
n'est pas une capacité qui manque à Kinexus — c'est une discipline qui manque autour de ce qui
existe déjà, mélangé directement dans les moteurs d'interprétation plutôt qu'isolé dans une couche à
part :

- `computeMoteur()` produit déjà, par priorité, un champ `hypothese` (affiché sous l'icône
  "Pourquoi ?") et un champ `orientation` (affiché sous l'icône **"Actions"**, avec des verbes à
  l'impératif — "Renforcer...", "Développer..."). C'est aujourd'hui le fragment le plus exposé au
  risque de paraître prescriptif, alors même qu'il précède cette réflexion.
- `composeNarrativeParagraph()` ajoute déjà une phrase de relance ("cette conclusion mérite d'être
  recontrôlée...") quand la confiance est faible — une recommandation d'action glissée à
  l'intérieur de la narration plutôt qu'isolée comme telle.

Ce document ne prescrit pas de corriger ces trois fragments maintenant. Il documente leur existence
pour qu'une future discipline de l'orientation clinique en tienne compte plutôt que d'en ajouter un
quatrième non gouverné — et pour rappeler que les deux fragments existants sont aujourd'hui
accrochés à `computeMoteur()`, donc à un seul moteur : exactement la forme que la couche transversale
ne devra pas prendre une fois plusieurs tests en jeu.

> Kinexus ne fournit pas des réponses. Il organise des niveaux de preuve. Les variables sont des
> preuves ; les moteurs interprètent ces preuves ; les conclusions synthétisent ces
> interprétations ; la narration les rend compréhensibles ; l'orientation clinique les hiérarchise,
> par-dessus tous les moteurs. La décision reste, à chaque niveau, celle du praticien.

---

## Comment ce principe doit guider la conception

- **Dashboard** : structuré par les qualités physiques (niveau 1). Jamais par phase ou par profil
  d'un test spécifique. Un utilisateur doit pouvoir comprendre "ce que ce sportif ne sait pas
  encore bien faire" sans jamais avoir entendu parler de CMJ.
- **Drill-down** : les niveaux 2 et 3 sont atteints *depuis* une qualité (ou depuis un bilan),
  jamais présentés en concurrence frontale avec le niveau 1 sur le même écran d'entrée.
- **Narration (Fil de Raisonnement et équivalents futurs)** : chaque conclusion doit indiquer
  explicitement dans lequel des trois registres (déficit confirmé / signal isolé / observation de
  performance) elle se situe, avec un vocabulaire et un traitement visuel distincts pour chacun.
- **Orientation clinique ("Points d'attention clinique" dans l'UI)** : couche transversale, pas le
  prolongement d'un moteur ou d'un test — elle synthétise les conclusions de tous les moteurs
  disponibles pour un bilan, pas seulement celles du dernier test analysé. Ne lit jamais les
  preuves ni les variables — uniquement les conclusions et registres déjà produits en amont.
  Toujours formulée à l'interrogatif ou au nominal ("Priorité d'investigation : Absorption"),
  jamais à l'impératif ("Renforcez l'absorption") : le mode grammatical est ce qui distingue
  concrètement une mise en perspective d'une prescription.
- **Futurs modules** : tout nouveau test qui construit une lecture "où" (localisation) ou
  "comment" (stratégie) s'inscrit dans les niveaux 2/3 — jamais un niveau 4 séparé. Le niveau 1
  reste unique et transversal par construction (`TFM` s'étend naturellement à un nouveau test sans
  changer de logique).
- **Aucun nouveau seuil clinique n'est défini par ce document.** Il décrit une relation entre trois
  lectures déjà produites par des moteurs existants — il ne remplace, ni ne contourne, l'exigence
  déjà en vigueur dans Kinexus de ne jamais inventer une équivalence, un mapping ou un seuil
  clinique sans confirmation explicite du praticien.

---

## État d'implémentation actuel

À la date de ce document, seul le CMJ dispose des trois niveaux :

- Niveau 1 (qualités) : opérationnel, transversal (déjà alimenté par plusieurs tests au-delà du
  CMJ).
- Niveau 2 (phases CMJ) et Niveau 3 (profils CMJ) : opérationnels pour le CMJ uniquement.
- Le branchement niveau 1 ↔ niveaux 2/3 (`functionScores` dans `computeMouvementAnalysis`) est
  fait (05/08), en lecture seule — voir "Principe d'étanchéité" ci-dessus.
- La distinction visuelle des trois registres de narration dans Le Fil de Raisonnement est faite
  (05/08).
- L'orientation clinique (couche transversale, pas une étape du pipeline) n'existe pas encore comme
  couche à part dans le code. Trois fragments non disciplinés en tiennent lieu aujourd'hui
  (`hypothese`/`orientation` dans `computeMoteur()`, la relance de confiance dans
  `composeNarrativeParagraph()`) — voir "Orientation clinique" ci-dessus. Ce document ne prescrit
  pas de les corriger ; il fixe la référence à laquelle une future discipline de l'orientation
  clinique devra se conformer.

Ce document ne constitue pas une demande d'implémentation. Il fixe la référence à laquelle ces
implémentations, une fois entreprises, devront se conformer.

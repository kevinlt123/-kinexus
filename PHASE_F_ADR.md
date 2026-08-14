# Phase F — Architectural Decision Records (ADR)

## Statut de ce document

Les Phases A à E sont terminées. Ce document ne modifie ni les fiches `HYP_ARCHITECTURE_PHASE_C.md`,
ni les `CLI###` de Vierge_7, ni Vierge_7 lui-même. Il transforme les 6 points ouverts identifiés en
Phase E (`PHASE_E_INFERENCE_ENGINE.md`, Livrable final §3) en décisions d'architecture explicites,
selon le format ADR demandé : contexte, options, avantages/inconvénients, compatibilité,
risques, recommandation, impact documentaire. Chaque recommandation reste **une proposition
soumise à validation**, pas une décision actée — même logique que `HYP_ARCHITECTURE_FREEZE.md`.
Aucun code, aucune implémentation, aucune configuration, aucune pondération numérique.

---

# ADR-001 — Mécanisme d'affaiblissement d'une hypothèse

### Contexte
`KINEXUS_CLINICAL_ARCHITECTURE.md` nomme "affaiblir" comme l'un des quatre comportements possibles
d'une variable isolée, aux côtés de générer/renforcer/réfuter. `PHASE_E_INFERENCE_ENGINE.md`
(Partie 2 et 3, cas Puissance : `cmj_peak_power`↓ + Hop normal) a montré qu'aucune fiche
`HYP_ARCHITECTURE_PHASE_C.md` ni aucun `CLI###` ne précise ce qu'une preuve confirmative ou
explicative **normale** doit faire à une hypothèse déjà générée (Suspectée) ou retenue. Phase E a
retenu un traitement neutre par défaut, explicitement signalé comme un point à arbitrer plutôt
qu'une conformité acquise.

### Options possibles
- **A. Neutre (statu quo Phase E)** — une preuve confirmative/explicative normale ne modifie
  jamais l'état ni le support d'une hypothèse déjà générée.
- **B. Affaiblissement plafonnant** — une confirmative ou explicative normale empêche l'hypothèse
  de monter au-delà du support Faible, sans jamais la faire redescendre (Retenue reste Retenue,
  Suspectée reste Suspectée).
- **C. Affaiblissement régressif** — symétrique au renforcement : une confirmative/explicative
  normale peut faire redescendre l'état (Retenue→Suspectée, Suspectée→Absente).
- **D. Affaiblissement différencié par catégorie** — seule la confirmative peut affaiblir (rôle
  miroir de "renforcer", qui lui est explicitement attribué) ; l'explicative ne le peut jamais
  (elle répond à "pourquoi", jamais à "si").

### Avantages
- **A** : aucune extrapolation au-delà du texte de Vierge_7 ; comportement déjà documenté et
  compris depuis Phase E ; zéro risque de sur-interprétation d'un silence.
- **B** : donne un sens concret et borné au verbe "affaiblir" sans jamais annuler une convergence
  diagnostique réelle ; cohérent avec la hiérarchie déjà validée (diagnostique > confirmative/
  explicative en autorité décisionnelle).
- **C** : symétrie complète et esthétiquement simple entre renforcer et affaiblir ; traite toutes
  les preuves de façon uniforme dans les deux sens.
- **D** : reflète une distinction déjà implicite dans le modèle — la confirmative a un rôle nommé
  et bidirectionnel naturel ("confirmer" implique aussi "infirmer"), l'explicative répond à une
  question différente qui n'a pas de sens à inverser.

### Inconvénients
- **A** : le verbe "affaiblir" du principe fondateur reste sans aucune traduction opérationnelle ;
  asymétrie persistante entre un mécanisme de renforcement pleinement opérationnalisé et un
  mécanisme d'affaiblissement resté théorique.
- **B** : introduit une règle non écrite explicitement par Vierge_7 (extrapolation) ; complexifie
  légèrement le modèle de transition (distinguer "confirmative jamais vue" de "confirmative vue et
  normale").
- **C** : risque de faire annuler une hypothèse générée par une preuve diagnostique réelle sur la
  base d'une preuve de rang inférieur dans la hiérarchie — contredit directement le constat déjà
  établi en Phase E ("le niveau diagnostique a toujours l'autorité décisive sur l'état de
  l'hypothèse").
- **D** : complexifie le modèle (deux règles distinctes au lieu d'une) ; reste, comme B, une
  extrapolation non explicitement écrite par Vierge_7.

### Compatibilité avec
- **Principe fondateur Kinexus** : B et D restent dans l'esprit du verbe "affaiblir" sans jamais
  laisser une preuve de rang inférieur réfuter une preuve diagnostique — cohérent. C viole la
  hiérarchie diagnostique>confirmative déjà validée. A reste compatible mais incomplet.
- **HYP_ARCHITECTURE_PHASE_C** : aucune option ne nécessite de modifier une fiche — le mécanisme
  se situe entièrement dans le moteur d'inférence, pas dans le contenu clinique des hypothèses.
- **PHASE_D_LOGICAL_VALIDATION** : les cas déjà validés (Cas C notamment) restent valides sous les
  quatre options — aucun ne remet en cause "explicative déficiente + diagnostique normal ⇒
  Absente".
- **PHASE_E_INFERENCE_ENGINE** : B et D affinent directement le point ouvert n°1 du Livrable final
  de Phase E ; A confirme le statu quo déjà écrit ; C le contredirait (Phase E établit explicitement
  l'autorité décisive du diagnostique).
- **CLI###** : aucun impact — le mécanisme agit avant le franchissement du seuil `CLI###`, jamais
  sur son texte.
- **Absence de pondération** : respectée par les quatre options — aucune ne introduit de score ou
  de somme, seulement des règles de transition d'état.

### Risques
- **Faux positifs** : A ne réduit aucun faux positif existant (statu quo) ; B/D réduisent le
  risque qu'une hypothèse Faible soit présentée avec une confiance qu'aucune convergence ne
  soutient ; C introduit un risque nouveau et inverse (faux négatif, voir ci-dessous).
- **Faux négatifs** : C est la seule option à risque réel de faux négatif — une hypothèse
  diagnostiquement fondée pourrait disparaître sur la foi d'une preuve de rang inférieur.
- **Complexité** : A < D ≈ B < C en complexité de mise en œuvre conceptuelle.
- **Maintenabilité** : A et D les plus simples à maintenir (règles peu nombreuses, bien
  circonscrites) ; B intermédiaire ; C la plus fragile (risque de divergences d'interprétation
  qualité par qualité).
- **Explicabilité** : B offre l'explication la plus intuitive au praticien ("le signal existe mais
  reste isolé, donc la confiance reste limitée") ; A est simple mais laisse une question sans
  réponse ; C serait difficile à justifier cliniquement au praticien ("pourquoi ce déficit mesuré a
  disparu ?").

### Recommandation
**Option B.** Elle donne un contenu réel au verbe "affaiblir" — sans lequel il resterait un mot du
principe fondateur sans traduction, comme A le laisse — tout en respectant strictement la
hiérarchie diagnostique-décisive déjà établie en Phase E, que C romprait. D est plausible mais
introduit une distinction supplémentaire (confirmative vs explicative) que rien dans Vierge_7 ne
vient étayer explicitement ; B reste la version la plus simple qui répond complètement à la
question posée.

### Impact
- `PHASE_E_INFERENCE_ENGINE.md` — Partie 2 (tableau des rôles par catégorie) et Partie 7 (tableau
  de cohérence, ligne "affaiblir" passerait de ⚠️ à une conformité conditionnelle).
- Aucun impact sur `HYP_ARCHITECTURE_PHASE_C.md`, `PHASE_D_LOGICAL_VALIDATION.md`, les `CLI###`
  ou Vierge_7.

---

# ADR-002 — Mécanisme de réfutation d'une hypothèse

### Contexte
Le principe fondateur nomme "réfuter" comme comportement possible d'une variable. Phase E a
conservé l'état **Réfutée** dans le cycle (Partie 1) tout en constatant qu'aucune des 8 fiches
`HYP_ARCHITECTURE_PHASE_C.md` ni aucun `CLI###` ne définit de condition de rejet — un vide déjà
repéré en Phase C ("Conditions de rejet : aucune formalisée") et confirmé en Phase D pour chaque
qualité. C'est, de l'aveu de Phase E elle-même, la contradiction la plus significative révélée
jusqu'ici entre le vocabulaire déjà validé et le corpus clinique source disponible.

### Options possibles
- **A. Accepter l'absence** — "Réfutée" reste un état théorique du cycle, structurellement
  inatteignable pour les 8 qualités actuelles, documenté comme une limite du corpus source
  (Vierge_7), pas du moteur lui-même.
- **B. Solliciter un enrichissement de Vierge_7** — soumettre formellement au praticien la
  nécessité de spécifier, qualité par qualité, une condition de rejet explicite, avant que
  "Réfutée" devienne opérationnel pour une qualité donnée.
- **C. Inférer une condition de réfutation générique interne à Kinexus** — ex. "retour à la
  normale de toutes les variables diagnostiques sur un bilan ultérieur ⇒ Réfutée" — une résolution
  temporelle plutôt qu'une preuve contradictoire à l'intérieur d'un même bilan.
- **D. Retirer l'état Réfutée du cycle** — le fusionner avec Absente, puisqu'aucun mécanisme
  n'existe aujourd'hui pour le distinguer opérationnellement d'un simple retour à la normale.

### Avantages
- **A** : honnête, ne modifie rien, conforme à la règle méthodologique déjà appliquée en Phase C
  ("aucune logique clinique nouvelle... l'absence est documentée telle quelle").
- **B** : seule option qui respecte pleinement la gouvernance du projet (Vierge_7 = source de
  vérité, enrichie par le praticien, jamais par une inférence de ce chantier) ; réversible et
  traçable.
- **C** : débloquerait "réfuter" sans attendre un enrichissement externe de Vierge_7.
- **D** : simplifie le modèle en retirant un état qui, en l'état, ne produit jamais de comportement
  observable.

### Inconvénients
- **A** : le principe fondateur reste partiellement non implémenté indéfiniment, sans échéance ni
  action proposée pour combler le vide.
- **B** : dépend d'un travail extérieur au chantier (le praticien doit compléter Vierge_7), sans
  calendrier garanti — ne débloque rien à court terme.
- **C** : introduit une notion **temporelle** (bilans répétés, historique) totalement absente de la
  portée du raisonnement HYP### jusqu'ici (pensé "à un instant donné", un seul bilan) — une
  extension d'architecture non demandée, à la limite de la phase de conception que `CLAUDE.md`
  considère close sauf besoin produit réel identifié. Confond en outre deux notions cliniquement
  distinctes : "réfuté par une preuve contraire" et "résolu dans le temps".
- **D** : contredit frontalement le principe fondateur, qui nomme "réfuter" comme un comportement
  distinct de l'absence de preuve — supprimer l'état reviendrait à trancher silencieusement que
  l'architecture validée le 07/08 a tort sur ce point, ce que `CLAUDE.md` interdit explicitement
  ("ne pas l'implémenter silencieusement... signaler explicitement la contradiction").

### Compatibilité avec
- **Principe fondateur Kinexus** : A et B le préservent sans le trahir (l'état reste nommé, son
  absence de contenu est assumée et signalée). C l'étend au-delà de ce qui a été validé (dimension
  temporelle). D le contredit directement.
- **HYP_ARCHITECTURE_PHASE_C** : A et B ne modifient aucune fiche. C nécessiterait, si retenue,
  d'ajouter une condition à chacune des 8 fiches — hors périmètre de cet ADR ("ne pas modifier les
  HYP"). D ne modifie pas non plus les fiches mais changerait le vocabulaire du moteur qui les
  consomme.
- **PHASE_D_LOGICAL_VALIDATION** : cohérent avec le constat déjà posé ("Conditions de rejet :
  aucune formalisée" pour les 8 qualités) — aucune option ne contredit ce constat, chacune y répond
  différemment.
- **PHASE_E_INFERENCE_ENGINE** : A confirme le traitement déjà écrit ; B en fait une action
  concrète plutôt qu'un simple constat ; C et D réviseraient la Partie 1 (cycle à 4 états).
- **CLI###** : aucun impact pour A/B/D. C nécessiterait potentiellement un nouveau type
  d'orientation ("hypothèse résolue") non prévu par Vierge_7 — hors périmètre.
- **Absence de pondération** : respectée par les quatre options.

### Risques
- **Faux positifs** : aucune option ne réduit un faux positif existant à court terme (aucune ne
  produit de réfutation opérationnelle avant que B aboutisse, si elle est retenue).
- **Faux négatifs** : D pourrait, à terme, être interprété comme "toute hypothèse une fois générée
  reste valide indéfiniment" si mal documenté — un risque de confiance excessive, pas de faux
  négatif à proprement parler mais un affaiblissement de la rigueur affichée du modèle.
- **Complexité** : A la plus faible (aucun changement) ; C la plus élevée (dimension temporelle
  nouvelle) ; B et D intermédiaires.
- **Maintenabilité** : A et D les plus simples ; C introduirait une dépendance à l'historique des
  bilans, un chantier de conception à part entière.
- **Explicabilité** : A et B restent limpides ("cet état existe en théorie, aucune condition n'est
  encore définie") ; C serait difficile à expliquer sans confondre réfutation et résolution
  clinique ; D masquerait une limite réelle du modèle plutôt que de la nommer.

### Recommandation
**Option B, avec A comme traitement intérimaire.** Retirer l'état (D) contredirait silencieusement
le principe fondateur, ce que la gouvernance du projet interdit explicitement. Inventer une
condition (C) créerait une logique clinique nouvelle non mandatée. B est la seule option qui agisse
réellement sur le problème plutôt que de le documenter passivement — mais elle dépend d'une
décision du praticien sur *quoi* enrichir dans Vierge_7, ce qui dépasse le périmètre de cet ADR.
En attendant cette clarification, A reste le comportement effectif du moteur : l'état existe, il
est nommé, il n'est simplement jamais atteint.

### Impact
- `PHASE_E_INFERENCE_ENGINE.md` — Partie 7 (tableau, ligne "réfuter") et Livrable final (point 2)
  passeraient de "point ouvert" à "action proposée au praticien, en attente".
- Vierge_7 (document externe, hors dépôt Kinexus) — enrichissement potentiel, à la seule initiative
  du praticien, hors périmètre de ce chantier.
- Aucun impact sur `HYP_ARCHITECTURE_PHASE_C.md`, les `CLI###` ou `PHASE_D_LOGICAL_VALIDATION.md`.

---

# ADR-003 — Granularité de convergence (même test ou tests différents)

### Contexte
Les seuils `CLI###` s'expriment généralement en "≥2 preuves diagnostiques déficitaires", sans
préciser si ces preuves doivent provenir de tests distincts ou peuvent provenir de plusieurs KPIs
d'un seul et même test. Phase D a identifié cette ambiguïté pour Absorption, dont le diagnostic
inclut à la fois `landing_uni_tts`/`landing_bi_tts` (1 KPI par test) et les 5 KPIs diagnostiques de
SLLT (`sllt_peak_landing_force`, `ttplf`, `loading_rate`, `tts`, `cop_path`) — une convergence "2
preuves" pourrait aujourd'hui être satisfaite entièrement à l'intérieur d'un seul essai SLLT, sans
qu'aucun autre test ne soit sollicité. Phase E (Livrable final, point 3) reprend ce point comme
généralisable à toute qualité dont le diagnostic regroupe plusieurs tests inégalement riches en
KPIs.

### Options possibles
- **A. Littérale** — toute combinaison de 2 preuves diagnostiques compte, qu'elles proviennent du
  même test ou de tests différents ; lecture strictement fidèle au texte de Vierge_7, qui ne
  mentionne jamais l'indépendance des tests comme condition.
- **B. Tests distincts obligatoires** — la convergence doit provenir d'au moins deux mécanismes de
  mesure indépendants (deux passations différentes), jamais de deux KPIs dérivés du même essai.
- **C. Différenciée par qualité** — appliquer la règle B uniquement aux qualités dont au moins un
  test contribue, à lui seul, plusieurs variables diagnostiques (aujourd'hui : Absorption via
  SLLT) ; laisser A s'appliquer de fait ailleurs, où chaque test ne contribue qu'un seul KPI
  diagnostique et où la distinction est de toute façon sans effet (Réactivité, Puissance...).

### Avantages
- **A** : fidèle au texte littéral de Vierge_7 ; la règle la plus simple à énoncer et à vérifier.
- **B** : renforce réellement l'indépendance des preuves exigée par l'esprit du principe de
  convergence ("plusieurs preuves indépendantes renforcent" — pas une répétition de la même
  mesure) ; évite qu'un seul geste (une chute au sol en SLLT) ne suffise à lui seul à faire
  basculer une hypothèse en Retenue.
- **C** : la plus fidèle à la réalité de chaque qualité ; n'impose pas une contrainte
  supplémentaire là où elle n'a aucun effet (Réactivité, Puissance — 2 preuves = automatiquement 2
  tests dans leur cas) ; ne pénalise pas artificiellement Absorption.

### Inconvénients
- **A** : statistiquement plus faible pour les qualités dont le diagnostic est concentré sur un
  seul test riche en KPIs — 5 KPIs d'un seul essai SLLT sont corrélés (même mouvement, même
  passation), leur convergence est beaucoup moins indépendante que deux tests séparés ; risque de
  surestimer la robustesse d'une hypothèse Retenue construite sur un seul geste.
- **B** : pour Absorption spécifiquement, si Landing (1 seul KPI diagnostique, sous-instrumenté —
  gel point 10) est le seul autre test candidat, exiger deux tests distincts rendrait la
  convergence presque toujours dépendante du test le moins bien instrumenté de la qualité — un
  effet paradoxal qui pourrait rendre Absorption plus difficile à faire converger que ce que
  Vierge_7 semble viser en citant SLLT en détail.
- **C** : complexité de mise en œuvre — chaque qualité peut potentiellement avoir sa propre règle à
  documenter et vérifier ; risque d'incohérence perçue par le praticien si la différence entre
  qualités n'est pas clairement expliquée ("pourquoi Absorption a-t-elle une règle différente des
  sept autres ?").

### Compatibilité avec
- **Principe fondateur Kinexus** : B est la lecture la plus fidèle à l'esprit de "convergence de
  preuves indépendantes" implicite dans le principe fondateur ; A s'en tient à la lettre plutôt
  qu'à l'esprit ; C tente de concilier les deux.
- **HYP_ARCHITECTURE_PHASE_C** : aucune option ne modifie le contenu des fiches — la question porte
  uniquement sur l'interprétation du mot "preuves" dans les conditions déjà écrites (`CLI060`
  notamment).
- **PHASE_D_LOGICAL_VALIDATION** : reprend exactement l'ambiguïté déjà nommée pour Absorption sans
  la trancher à l'époque — cet ADR est la suite directe de ce constat.
- **PHASE_E_INFERENCE_ENGINE** : correspond au point ouvert n°3 du Livrable final ; aucune des
  trois options ne contredit le cycle d'états défini en Partie 1 (toutes opèrent uniquement sur la
  définition de "seuil de convergence diagnostique franchi").
- **CLI###** : aucune modification du texte Vierge_7 — la question reste une interprétation du
  moteur, jamais une réécriture de la condition `CLI060`.
- **Absence de pondération** : respectée — aucune option n'introduit de poids, seulement une règle
  structurelle sur la composition du seuil.

### Risques
- **Faux positifs** : A porte le risque le plus élevé pour Absorption (Retenue déclarée sur la
  seule variabilité interne d'un essai SLLT).
- **Faux négatifs** : B porte le risque inverse pour Absorption (convergence bloquée si Landing,
  sous-instrumenté, ne peut jamais apporter sa part) — pourrait rendre `HYP-ABS-01` durablement
  plus difficile à atteindre que les autres qualités sans que cela ne reflète une réalité clinique.
- **Complexité** : A la plus faible, B intermédiaire, C la plus élevée (règle par qualité, à documenter).
- **Maintenabilité** : A et B uniformes donc simples à maintenir ; C nécessite une révision à chaque
  fois qu'une qualité verrait son catalogue de KPIs diagnostiques évoluer.
- **Explicabilité** : B est la plus simple à justifier au praticien dans l'absolu ("deux mesures
  indépendantes") ; C nécessite une explication qualité par qualité mais reste défendable si
  documentée clairement ; A est simple à expliquer mais laisse une faiblesse statistique non dite.

### Recommandation
**Option C.** En pratique, cette option ne complexifie le modèle que pour la seule qualité où la
distinction a un effet réel (Absorption, via SLLT) — pour les 7 autres, elle est strictement
équivalente à A ou B puisque chaque test n'y contribue qu'un seul KPI diagnostique. C'est donc une
option qui **paraît** complexe en théorie mais qui, une fois appliquée à l'état réel du corpus
(déjà cartographié en Phase C), se réduit à une seule règle supplémentaire, ciblée, plutôt qu'à un
principe générique qui pénaliserait ou avantagerait artificiellement des qualités où la question ne
se pose pas.

### Impact
- `PHASE_E_INFERENCE_ENGINE.md` — Partie 2 (règle de convergence) et Livrable final (point 3).
- `HYP_ARCHITECTURE_PHASE_C.md` — aucune modification du contenu, mais la fiche Absorption
  deviendrait la référence documentée de l'application de cette règle si elle est validée.
- Aucun impact sur les `CLI###`, `PHASE_D_LOGICAL_VALIDATION.md` ou Vierge_7.

---

# ADR-004 — Transmission du niveau de support (Faible/Modéré/Fort) vers CLI###

### Contexte
`KINEXUS_CLINICAL_ARCHITECTURE.md` a validé un système de support à trois niveaux
(Fort/Modéré/Faible) pour les hypothèses. Les conditions d'activation `CLI###` lues en Phase C sont
toutes binaires (seuil franchi ou non), sans distinction de support. Phase E (Partie 5) a constaté
qu'une hypothèse Retenue/Faible et une hypothèse Retenue/Fort déclenchent aujourd'hui la même
orientation clinique, de la même façon, sans que la nuance de confiance déjà validée ne soit jamais
transmise au praticien à ce niveau.

### Options possibles
- **A. Statu quo** — `CLI###` se déclenche uniquement sur le franchissement du seuil diagnostique,
  sans distinction de support, comme aujourd'hui.
- **B. Métadonnée d'affichage** — la `CLI###` déclenchée porte une étiquette (Faible/Modéré/Fort)
  reprise du HYP### qui l'a générée, sans que la condition de déclenchement elle-même ne change.
- **C. Second seuil de déclenchement** — une `CLI###` ne se déclencherait qu'à partir d'un support
  minimal (ex. jamais sur Faible, seulement à partir de Modéré).
- **D. Orientation distincte selon le support** — une `CLI###` "à instruire" séparée pour les
  hypothèses Retenue/Faible, distincte de l'orientation pleine pour Modéré/Fort.

### Avantages
- **A** : aucune modification, strictement fidèle à ce que Vierge_7 écrit (les `CLI###` ne
  mentionnent jamais de gradation) ; la plus simple.
- **B** : n'invente aucune règle clinique nouvelle — pur enrichissement de présentation, testable
  directement contre la règle déjà écrite pour la couche "orientation clinique" dans
  `KINEXUS_CLINICAL_ARCHITECTURE.md` ("elle doit pouvoir être produite par pur tri, filtre ou
  regroupement de conclusions déjà existantes, sans inventer aucun seuil").
- **C** : aligne strictement l'urgence perçue de l'orientation sur la robustesse de la preuve qui
  la fonde.
- **D** : distingue clairement une orientation "à instruire" d'une orientation "confirmée", sans
  supprimer aucune des deux.

### Inconvénients
- **A** : perd une information déjà validée et potentiellement utile au praticien — le système
  Fort/Modéré/Faible existe précisément pour nuancer la confiance, et cette nuance disparaît dès
  que l'orientation clinique est produite.
- **B** : nécessite que la conception technique future (hors périmètre de cet ADR) fasse voyager
  cette métadonnée à travers la chaîne jusqu'à la présentation `CLI###` — un détail d'implémentation
  à concevoir en aval, pas un problème d'architecture, mais un chantier réel.
- **C** : introduit un second seuil clinique non écrit dans Vierge_7 — une extrapolation contraire
  à la règle méthodologique "aucune logique clinique nouvelle" déjà appliquée tout au long de la
  Phase C ; risquerait de masquer une orientation légitime (une hypothèse Faible reste une
  hypothèse réelle, générée par une vraie convergence diagnostique) simplement parce qu'elle n'a
  pas encore de confirmative.
- **D** : double potentiellement le nombre d'orientations par qualité — une complexité de
  présentation significative, non demandée par Vierge_7, qui s'approche dangereusement de
  "inventer une nouvelle `CLI###`" non écrite par le référentiel source.

### Compatibilité avec
- **Principe fondateur Kinexus** : B respecte pleinement l'absence de pondération (un label n'est
  pas un score) ; C et D introduisent, de fait, une forme de seuil supplémentaire non validé.
- **HYP_ARCHITECTURE_PHASE_C** : aucune option ne nécessite de modifier une fiche HYP.
- **PHASE_D_LOGICAL_VALIDATION** : sans impact — les cas déjà validés ne dépendent pas de ce choix.
- **PHASE_E_INFERENCE_ENGINE** : B est exactement la piste déjà esquissée en Partie 5 de Phase E
  ("transmettre le niveau de support comme métadonnée... pas comme un second seuil").
- **CLI###** : A, B et D ne modifient aucun texte Vierge_7 ; C non plus, mais en changerait
  l'application (une `CLI###` textuellement déclenchée pourrait ne pas s'afficher).
- **Absence de pondération** : B seule la respecte sans réserve ; C introduit une hiérarchie de
  seuils qui, sans être numérique, fonctionne comme un filtrage à deux niveaux non prévu par
  Vierge_7.

### Risques
- **Faux positifs** : A ne change rien au risque déjà existant ; B ne change rien non plus (aucune
  modification du déclenchement) ; C réduit les faux positifs perçus comme "urgents" à tort ; D
  a le même effet que C via une voie différente.
- **Faux négatifs** : C est la seule option qui introduit un risque nouveau — une orientation
  légitime (Faible) pourrait ne jamais être présentée si le seuil est fixé trop haut.
- **Complexité** : A la plus faible, B faible à modérée (transport de métadonnée), C modérée
  (nouveau seuil à calibrer), D la plus élevée (doublement des orientations).
- **Maintenabilité** : A et B les plus simples à maintenir dans la durée ; C et D introduisent des
  règles supplémentaires à faire évoluer si le corpus Vierge_7 change.
- **Explicabilité** : B améliore directement l'explicabilité (le praticien voit pourquoi faire
  confiance ou non à l'orientation) sans rien changer d'autre ; A reste explicable mais incomplet ;
  C et D compliquent l'explication ("pourquoi cette orientation n'apparaît-elle pas alors que le
  déficit est bien réel ?").

### Recommandation
**Option B.** C'est la seule option qui enrichit l'information transmise au praticien sans rien
inventer cliniquement — cohérente avec la règle déjà écrite pour la couche orientation ("pur tri,
filtre ou regroupement, sans inventer aucun seuil"). A perd une information déjà validée sans
raison suffisante ; C et D introduisent une règle clinique que ni Vierge_7 ni le gel n'ont jamais
posée, et s'éloignent du principe méthodologique constant de ce chantier.

### Impact
- `PHASE_E_INFERENCE_ENGINE.md` — Partie 5, passerait de "point ouvert" à "décidé".
- Aucune modification de `HYP_ARCHITECTURE_PHASE_C.md`, des `CLI###` ou de Vierge_7.
- Un chantier de conception d'affichage (comment présenter la métadonnée) resterait à mener en
  aval — hors périmètre de cet ADR et de toute Phase de conception clinique.

---

# ADR-005 — Exception Mobilité (activation sur une seule preuve)

### Contexte
`CLI020` accepte une seule variable (`wblt_distance`) comme suffisante pour déclencher
l'orientation Mobilité, en apparente contradiction avec "une variable isolée ne valide jamais
seule une hypothèse". La fiche de qualité Mobilité elle-même justifie ce choix en toutes lettres
("la mobilité de cheville repose exclusivement sur ce test"). Signalée sans être tranchée en Phase
C, D et E — un point que ce chantier a systématiquement refusé de résoudre par analogie avec les
autres qualités, conformément à la méthodologie retenue depuis la Phase C.

### Options possibles
- **A. Confirmer l'exception telle quelle** — Mobilité reste la seule qualité à cycle dégénéré à
  deux états (Absente/Retenue), validée explicitement comme cas particulier légitime parce que
  Vierge_7 le formule sans ambiguïté.
- **B. Refuser l'exception** — exiger, comme pour les 7 autres qualités actives, une seconde preuve
  diagnostique convergente avant Retenue ; en l'absence d'une deuxième variable diagnostique
  disponible dans Vierge_7 pour cette qualité, `HYP-MOB-01` resterait plafonnée à Suspectée en
  permanence, sans jamais déclencher `CLI020`.
- **C. Chercher une deuxième variable diagnostique ailleurs** — mobiliser une variable aujourd'hui
  confirmative/explicative (`wblt_lsi`, `wblt_asymmetry`) comme second diagnostique pour sortir
  Mobilité de l'exception plutôt que l'accepter.

### Avantages
- **A** : fidèle au texte explicite de Vierge_7, qui justifie lui-même l'exception — ce n'est pas
  un oubli rédactionnel mais une affirmation volontaire de la fiche de qualité ; cohérent avec la
  méthodologie constante de ce chantier ("ne rien arbitrer par analogie, documenter l'absence
  plutôt que compléter").
- **B** : uniformité totale du modèle — aucune exception à documenter ni à expliquer au praticien.
- **C** : résoudrait l'exception sans la contredire ni l'accepter platement, en trouvant une
  véritable deuxième preuve indépendante.

### Inconvénients
- **A** : crée une incohérence structurelle visible entre 8 qualités à cycle à 4 états et 1 qualité
  à cycle à 2 états — pourrait sembler un traitement de faveur si mal expliqué au praticien final,
  malgré sa justification textuelle solide.
- **B** : contredit frontalement le texte explicite de Vierge_7 pour cette qualité précise —
  reviendrait à faire prévaloir la cohérence interne du moteur sur le contenu clinique source,
  l'inverse de la hiérarchie de gouvernance de ce projet (Vierge_7 = source de vérité) ;
  `HYP-MOB-01` ne produirait plus jamais d'orientation clinique, alors qu'un déficit de mobilité
  réel et mesuré resterait signalé mais jamais orienté — une perte clinique nette sur un objectif
  fondateur du projet (le retour au sport en sécurité inclut la mobilité de cheville).
- **C** : `wblt_lsi`/`wblt_asymmetry` portent déjà un rôle défini et distinct — explicatif pour
  `HYP-MOB-01`, diagnostique seulement pour l'orientation *différente* `CLI021` (asymétrie), jamais
  pour `CLI020` (mobilité générale). Leur attribuer un second rôle diagnostique pour la mobilité
  générale créerait exactement le type de double-rôle contradictoire déjà repéré comme point
  structurel en Phase C — en pire, puisqu'ici ce serait une extrapolation de ce chantier et non
  une lecture directe de Vierge_7, contraire à la règle "aucune logique clinique nouvelle".

### Compatibilité avec
- **Principe fondateur Kinexus** : techniquement, aucune des trois options ne rend l'exception
  pleinement conforme au "jamais seule" — A la maintient en la signalant explicitement comme
  exception sanctionnée par le texte source, ce qui satisfait la règle de `CLAUDE.md` ("signaler
  la contradiction, pas l'implémenter silencieusement") sans la faire disparaître ; B la supprime
  au prix d'un contre-sens clinique ; C la masque par une extrapolation.
- **HYP_ARCHITECTURE_PHASE_C** : A ne modifie rien (déjà construite ainsi). B et C nécessiteraient
  une révision de la fiche Mobilité — hors périmètre de cet ADR ("ne pas modifier les HYP").
- **PHASE_D_LOGICAL_VALIDATION** : cohérent avec la tension déjà signalée sans être résolue à
  l'époque — A confirme formellement ce qui restait, jusqu'ici, une observation.
- **PHASE_E_INFERENCE_ENGINE** : A valide exactement la construction retenue en Partie 6 (cycle à
  deux états).
- **CLI###** : A ne modifie rien (`CLI020` déjà écrit ainsi par Vierge_7) ; B et C impliqueraient
  de facto une réinterprétation du texte source, ce que cet ADR ne mandate pas.
- **Absence de pondération** : respectée par les trois options — un seuil à 1 preuve reste un
  seuil, pas un poids.

### Risques
- **Faux positifs** : légèrement plus élevé pour Mobilité que pour les 7 autres qualités sous
  l'option A (une seule mesure, pas de convergence) — un risque déjà inhérent au texte de Vierge_7
  lui-même, non introduit par le choix d'architecture.
- **Faux négatifs** : B aggraverait fortement ce risque — un déficit de mobilité réel ne
  produirait plus jamais d'orientation, faute de seconde preuve qui n'existe pas dans le
  référentiel.
- **Complexité** : A introduit une petite complexité (une qualité différente des sept autres) mais
  minimale et déjà documentée depuis Phase C ; B et C n'ajoutent pas de complexité au cycle mais
  déplacent le problème (B vers une qualité muette, C vers un double-rôle contradictoire).
- **Maintenabilité** : A est isolée à une seule qualité, donc simple à maintenir sans effet de bord
  sur les 7 autres.
- **Explicabilité** : A reste explicable si le praticien confirme comprendre et valider la
  justification déjà écrite par Vierge_7 ; B et C seraient plus difficiles à justifier
  cliniquement.

### Recommandation
**Option A.** C'est la seule option qui ne modifie ni Vierge_7, ni la hiérarchie de gouvernance du
projet, ni la valeur clinique déjà identifiée pour l'objectif "retour au sport en sécurité". Rejeter
l'exception (B) pour une pure cohérence technique du moteur contredirait directement l'esprit de
`CLAUDE.md` ("jamais [de développement justifié] par son seul intérêt technique"). Inventer une
deuxième variable (C) créerait une logique clinique nouvelle que ce chantier s'est systématiquement
interdit depuis la Phase C.

### Impact
- `PHASE_E_INFERENCE_ENGINE.md` — Partie 6 et Livrable final (point 5) passeraient de "à confirmer
  par le praticien" à "confirmé".
- Aucun impact sur `HYP_ARCHITECTURE_PHASE_C.md`, les `CLI###` ou Vierge_7.

---

# ADR-006 — Exception Explosivité (plafond lié au proxy RFD non fenêtré)

### Contexte
`HYP_ARCHITECTURE_FREEZE.md` (point 4) a déjà validé le principe d'un "plafond de confiance
structurel, distinct de l'incertitude clinique" pour Explosivité, en raison de l'absence de RFD
fenêtré (`cmj_conc_rfd` sert de proxy non fenêtré à 3 des 4 variables visées par Vierge_7). Phase E
(Partie 6) a proposé une traduction concrète de ce plafond : `HYP-EXP-01` ne pourrait jamais
atteindre le support Fort, plafonnée à Modéré. Cet ADR réexamine cette proposition à la lumière de
la décision déjà actée au gel, qui demandait explicitement une **distinction**, pas une **fusion**
des deux notions de confiance.

### Options possibles
- **A. Confirmer le plafonnement de support (proposition Phase E)** — `HYP-EXP-01` ne peut jamais
  atteindre Fort tant que le RFD n'est pas fenêtré, quelle que soit la convergence par ailleurs.
- **B. Ne pas plafonner** — laisser `HYP-EXP-01` suivre le cycle standard à quatre niveaux comme
  les huit autres qualités, en acceptant que "Fort" y soit atteint sur la base d'un proxy non
  fenêtré, sans distinction affichée par rapport aux autres qualités.
- **C. Distinction séparée (fidèle au gel, point 4)** — garder le cycle à quatre niveaux standard
  (Fort atteignable normalement) mais accoler une étiquette indépendante ("confiance limitée par
  l'instrumentation") au support, plutôt que de plafonner ce dernier — reprend explicitement la
  distinction déjà demandée au gel entre confiance clinique et confiance structurelle/instrumentale.

### Avantages
- **A** : simple à raisonner (un seul axe de graduation) ; empêche mécaniquement toute confusion
  entre "Fort" et une preuve réellement complète.
- **B** : uniformité totale entre les 9 qualités, aucune règle spéciale à documenter.
- **C** : fidèle à la décision déjà validée au gel (distinction explicite plutôt que fusion) ;
  garde le système de support à 3 niveaux propre et homogène pour les 8 qualités actives — pas
  d'exception structurelle supplémentaire, à la différence de Mobilité (ADR-005) qui, elle, est
  réellement justifiée par le texte de Vierge_7 ; sépare clairement "ce que disent les preuves" de
  "à quel point on peut faire confiance à l'instrument qui les a produites".

### Inconvénients
- **A** : mélange deux dimensions différentes — le niveau de convergence des preuves cliniques, et
  la qualité de l'instrumentation — dans un seul indicateur ; contredit légèrement l'esprit du gel
  (point 4), qui demandait explicitement de distinguer les deux plutôt que de faire plafonner l'une
  par l'autre.
- **B** : masquerait précisément le plafond de confiance déjà acté et validé au gel — ce ne serait
  pas seulement un oubli, mais la contradiction d'une décision déjà prise.
- **C** : complexité légèrement supérieure à A (deux axes d'information à présenter au praticien
  plutôt qu'un seul) ; nécessite une conception d'affichage à préciser en aval, hors périmètre de
  cet ADR.

### Compatibilité avec
- **Principe fondateur Kinexus** : les trois options respectent l'absence de pondération ; C est la
  plus fidèle à l'esprit "cohérence des preuves, pas accumulation de scores" en gardant deux
  informations distinctes plutôt que de les fondre.
- **HYP_ARCHITECTURE_PHASE_C** : la fiche Explosivité mentionne déjà conceptuellement le plafond de
  données (tableau "Ce qui est réellement mesuré, approché, ou impossible") — cohérent avec C sans
  modification de la fiche.
- **PHASE_D_LOGICAL_VALIDATION** : `HYP-EXP-01` y est déjà noté "Sous réserve" indépendamment de ce
  choix — aucune des trois options ne remet en cause ce constat.
- **PHASE_E_INFERENCE_ENGINE** : cet ADR **révise** la proposition A initialement écrite en Partie
  6 de Phase E, au profit de C — une révision assumée et explicitement signalée ici, pas silencieuse.
- **CLI###** : aucune modification du texte Vierge_7 pour les trois options.
- **Absence de pondération** : respectée par les trois options.

### Risques
- **Faux positifs** : B porte le risque le plus élevé cliniquement — un "Fort" atteint sur un proxy
  incomplet pourrait laisser croire à une certitude diagnostique que l'instrumentation actuelle ne
  permet pas réellement d'atteindre, exactement le risque déjà nommé au gel (point 4).
- **Faux négatifs** : aucune option n'introduit de risque de faux négatif spécifique — le
  plafonnement (A/C) ne masque jamais un déficit réel, il nuance seulement la confiance affichée.
- **Complexité** : A la plus simple ; C intermédiaire (deux axes) ; B la plus simple en apparence
  mais au prix de la perte d'une information déjà validée.
- **Maintenabilité** : A et B les plus simples à maintenir ; C nécessite de maintenir deux
  dimensions séparées mais reste circonscrite à une seule qualité aujourd'hui.
- **Explicabilité** : C offre l'explication la plus complète et la plus honnête au praticien (deux
  raisons distinctes de nuancer la confiance) ; A confond les deux raisons en une seule ; B ne
  donne aucune indication du tout.

### Recommandation
**Option C.** C'est l'option la plus fidèle à ce qui a déjà été validé par le praticien au gel
(distinction explicite, non fusionnée) — cet ADR corrige donc, à la réflexion, la proposition
initiale de Phase E (le plafonnement du support à Modéré, option A), qui s'avère en tension légère
avec une décision antérieure déjà actée. C'est signalé ici comme une révision explicite de Phase E,
pas comme une simple confirmation.

### Impact
- `PHASE_E_INFERENCE_ENGINE.md` — Partie 6 (révision du mécanisme proposé pour Explosivité) et
  Livrable final (point 6, tableau de maturité par HYP).
- Aucune modification de `HYP_ARCHITECTURE_PHASE_C.md`, des `CLI###` ou de `HYP_ARCHITECTURE_FREEZE.md`
  (dont la décision de fond, point 4, est appliquée fidèlement ici, pas rouverte).

---

# ARCHITECTURE_DECISION_SUMMARY

| ADR | Décision recommandée | Niveau de confiance | Impact estimé | Blocant pour implémentation ? |
|---|---|---|---|---|
| **ADR-001** — Affaiblissement | Option B — affaiblissement plafonnant (jamais régressif, jamais annulant un diagnostic) | 🟡 Modéré — extrapolation raisonnée, non écrite littéralement par Vierge_7 | 🟢 Faible — mécanique interne au moteur, aucune fiche HYP/CLI touchée | **Non** — le traitement neutre (statu quo) reste un repli fonctionnel en attendant validation |
| **ADR-002** — Réfutation | Option B (solliciter Vierge_7) avec A en traitement intérimaire | 🔴 Faible — dépend d'une action externe du praticien, hors du contrôle de ce chantier | 🟡 Élevé si B aboutit un jour (potentiellement les 8 fiches) ; nul dans l'immédiat | **Non** pour lancer une implémentation partielle (3 états sur 4 restent utilisables) — mais bloquant pour considérer le cycle "complet" au sens du principe fondateur |
| **ADR-003** — Granularité de convergence | Option C — règle différenciée par qualité (effectivement : tests distincts exigés pour Absorption seule) | 🟡 Modéré | 🟡 Faible à modéré — concerne principalement Absorption, sans effet ailleurs | **Oui pour Absorption** spécifiquement — sans cette décision, le seuil "2 preuves" y reste ambigu ; **Non** pour les 7 autres qualités |
| **ADR-004** — Transmission du support vers CLI### | Option B — métadonnée d'affichage, sans nouveau seuil | 🟢 Élevé — cohérent avec une règle déjà écrite dans l'architecture normative | 🟡 Modéré — nécessite une conception de présentation en aval, aucune nouvelle règle clinique | **Non** — le statu quo (A) reste fonctionnel en attendant |
| **ADR-005** — Exception Mobilité | Option A — confirmer l'exception telle qu'écrite par Vierge_7 | 🟢 Élevé — texte source explicite et non ambigu | ⚪ Nul — confirme la construction déjà retenue depuis Phase C | **Oui** — tant que le praticien n'a pas confirmé explicitement cette exception (demandée sans réponse formelle depuis la Phase C), l'implémentation de `HYP-MOB-01` reposerait sur une hypothèse non validée |
| **ADR-006** — Exception Explosivité | Option C — distinction séparée (révise la proposition initiale de Phase E) | 🟡 Modéré — révision d'une proposition antérieure, nécessite validation explicite | 🟡 Modéré — révise Phase E Partie 6, nécessite une conception d'affichage à deux axes en aval | **Oui pour Explosivité** spécifiquement — sans cette décision, le niveau "Fort" y reste mal défini |

## Lecture transversale

- **Aucun ADR ne modifie** `HYP_ARCHITECTURE_PHASE_C.md`, les `CLI###` de Vierge_7, ou Vierge_7
  lui-même — conformément à la consigne. Les impacts documentaires se concentrent sur
  `PHASE_E_INFERENCE_ENGINE.md`, qu'ils précisent ou, pour ADR-006, révisent explicitement.
- **Deux décisions sont bloquantes pour une implémentation complète** (ADR-005 Mobilité, ADR-006
  Explosivité) — toutes deux concernent une seule qualité chacune, jamais l'ensemble du moteur.
  ADR-003 est bloquant pour une seule qualité supplémentaire (Absorption).
- **Aucune décision n'est bloquante pour les 5 qualités restantes** (Force, Puissance, Réactivité,
  Stabilisation, Endurance) — leur cycle d'inférence, tel que formalisé en Phase E, ne dépend
  d'aucun des 6 points ici traités.
- **ADR-002 (réfutation) reste la décision la moins mûre** de ce document : elle ne peut pas être
  tranchée par ce chantier seul, puisqu'elle dépend d'un enrichissement du corpus source
  (Vierge_7) que seul le praticien peut engager.

Ce document clôt la Phase F. **Aucune implémentation n'est proposée ici.** Les décisions
ci-dessus sont soumises au praticien avant que l'architecture HYP### puisse être considérée comme
gelée.

# Gel de l'architecture HYP### — points à arbitrer et proposition finale

## Statut de ce document

Dernière étape avant la Phase C (implémentation). Ce document a deux parties :

**Partie 1** — chaque point resté ouvert pendant les Phases A et B, analysé selon la même grille
(problème, impact clinique, impact sur HYP###, impact sur les orientations cliniques futures,
impact sur les recommandations futures, options, avantages/inconvénients, recommandation
argumentée).

**Partie 2** — une proposition d'architecture HYP### figée, intégrant les recommandations de la
Partie 1. **Ce sont des recommandations, pas des décisions unilatérales** : chaque point garde son
statu quo (documenté en Phase B) tant que le praticien ne l'a pas validé explicitement. Aucun code,
aucune configuration, aucune implémentation dans ce document.

---

# Partie 1 — Points à arbitrer

## 1. Stabilisation vs Contrôle Sensori-moteur

**Description du problème** : Vierge_7 spécifie, mot pour mot, la même base de preuves
diagnostiques et confirmatives (SLS, EO/EF, Strobo, Landing) pour deux qualités officiellement
distinctes. Leurs définitions textuelles diffèrent ("maintenir le contrôle postural après une
contrainte" vs "intégrer les informations sensorielles pour ajuster le contrôle moteur"), mais
aucune preuve mesurée ne permet de les différencier opérationnellement.

**Impact clinique** : sans preuve distinctive, les deux hypothèses (`HYP-STA-01`, `HYP-CSM-01`)
se déclencheront systématiquement ensemble, sur le même signal. Le praticien recevrait deux
conclusions redondantes présentées comme deux constats indépendants — un faux sentiment de
convergence de preuves, alors qu'il s'agit d'une seule mesure comptée deux fois.

**Impact sur HYP###** : si les deux hypothèses restent séparées sans preuve distinctive, le
principe fondateur "une variable isolée ne valide jamais seule, plusieurs preuves indépendantes
renforcent" est structurellement compromis pour ce couple — les deux hypothèses ne sont jamais
réellement indépendantes.

**Impact sur les orientations cliniques futures** : un module d'orientation qui recevrait ces deux
hypothèses côte à côte risquerait de proposer deux axes de travail formulés différemment
("stabilisation posturale" et "intégration sensorielle") pour un seul et même déficit mesuré — une
source de confusion pour le praticien au moment de la décision.

**Impact sur les recommandations futures** : même risque de doublon, en aval, si des principes
d'entraînement distincts étaient un jour associés à chacune séparément alors qu'elles décrivent le
même signal.

**Options** :
- **A. Fusionner** les deux qualités en une seule hypothèse pour la Phase C, garder Contrôle
  Sensori-moteur comme note de couverture dans Vierge_7 en attendant un enrichissement futur.
- **B. Garder séparées**, en l'état, en acceptant la redondance comme un fait temporaire de
  Vierge_7 à corriger plus tard.
- **C. Garder séparées mais suspendre `HYP-CSM-01`** (ne pas l'implémenter en Phase C) jusqu'à ce
  que le praticien enrichisse Vierge_7 avec une preuve réellement distinctive.
- **D. Demander au praticien de trancher avant toute chose**, sans proposer de défaut.

**Avantages/inconvénients** :
- A : simple, évite la redondance immédiatement ; inconvénient — perd la distinction conceptuelle
  que Vierge_7 tente de faire, même imparfaitement exprimée.
- B : ne perd rien du texte source ; inconvénient — livre un défaut connu en Phase C, contraire à
  l'objectif même de cette Phase B/gel.
- C : préserve la possibilité de réactiver Contrôle Sensori-moteur plus tard sans perte de travail ;
  inconvénient — laisse une qualité entière du référentiel des 10 qualités inactive en pratique.
- D : le plus prudent, mais retarde la Phase C sur un point que l'audit a déjà largement instruit.

**Recommandation argumentée** : **Option C.** Fusionner franchement (option A) effacerait une
distinction clinique que Vierge_7 affirme vouloir faire, même si elle ne l'a pas encore opérée
dans les preuves — ce n'est pas à cet audit de trancher que la distinction est fausse. Garder les
deux actives sans preuve distinctive (option B) contredit directement le principe fondateur du
modèle HYP###. Suspendre `HYP-CSM-01` en Phase C (option C) est la seule option qui respecte à la
fois le texte de Vierge_7 (rien n'est supprimé) et la rigueur du modèle (rien de redondant n'est
activé) — réversible dès que le praticien précise la distinction.

---

## 2. Peak Landing Force dans Stabilisation

**Description du problème** : la fiche Stabilisation de Vierge_7 cite `landing_bi_peak_landing_force`
(et l'équivalent `landing_uni_*`, inexistant dans Kinexus) dans sa section diagnostique ("Landing
stability"), puis exclut explicitement les mêmes variables dans sa propre section d'exclusion
("variables d'absorption pure... la capacité à encaisser la charge, pas le maintien du contrôle
postural secondaire").

**Impact clinique** : si la variable est traitée comme diagnostique, un déficit d'absorption pur
(force d'impact élevée, freinage insuffisant) pourrait être compté comme un déficit de
stabilisation — exactement la confusion Absorption/Stabilisation déjà documentée et jugée critique
en Phase A pour `sllt`.

**Impact sur HYP###** : `HYP-STA-01` gagnerait une preuve diagnostique en doublon direct avec
`HYP-ABS-01`, réintroduisant par la bande le problème que le retrait de `sllt` de Stabilisation
était censé résoudre.

**Impact sur les orientations/recommandations futures** : même risque que pour `sllt` — un
déficit de freinage orienterait, à tort, vers un travail de "stabilisation" plutôt que
d'absorption.

**Options** :
- **A. Retenir comme diagnostique** (suivre la section "Landing stability").
- **B. Retenir comme exclue** (suivre la section "Variables exclues").
- **C. Ne l'inclure dans aucun rôle** tant que le praticien n'a pas tranché.

**Avantages/inconvénients** :
- A : cohérent avec le fait que Landing est explicitement une famille diagnostique de
  Stabilisation ; inconvénient — contredit une exclusion nommée et argumentée dans la même fiche,
  et réintroduit un risque de confusion Absorption/Stabilisation déjà jugé critique ailleurs.
- B : cohérent avec la distinction physiologique que Vierge_7 pose lui-même en toutes lettres au
  début de la fiche ("l'absorption = encaisser/freiner" vs "la stabilisation = maintenir le
  contrôle") ; inconvénient — retire un signal potentiellement utile de la famille Landing.
- C : le plus prudent ; inconvénient — appauvrit `HYP-STA-01` d'une preuve possiblement légitime
  en attendant.

**Recommandation argumentée** : **Option B.** La section d'exclusion est plus explicite et mieux
justifiée que la mention diagnostique (qui se limite à lister la variable sans la distinguer de
`tts`/`post_stability`), et surtout, elle est **cohérente avec la définition même que Vierge_7
donne de Stabilisation en ouverture de fiche** et avec la décision déjà prise pour `sllt` sur le
même principe. Traiter `peak_landing_force` comme exclu de Stabilisation (tout en le laissant
diagnostique/confirmatif pour Absorption, où il est déjà bien placé) aligne cette qualité sur la
même logique de non-contamination déjà retenue pour `sllt`.

---

## 3. Statut des asymétries

**Description du problème** : Vierge_7 cite des variables d'asymétrie (`ecc_decel_rfd_asym`,
`landing_peak_force_asym`, `sllt_loading_rate_asym`, etc.) comme preuves confirmatives pour
Absorption. Aucune n'existe sous ces noms dans `VAR_REL3`/`TFM`/le catalogue de KPIs — mais
Kinexus possède un moteur d'asymétrie séparé et déjà fonctionnel (`computeAsymEngine`, cluster
Mouvement/Phases CMJ, hors périmètre Qualités).

**Impact clinique** : si l'information d'asymétrie existe déjà ailleurs dans Kinexus mais n'est
jamais consultée par le raisonnement de qualité, une information cliniquement pertinente
(asymétrie de freinage) reste invisible au niveau Qualités alors qu'elle est déjà calculée au
niveau Phases.

**Impact sur HYP###** : deux architectures possibles ont des implications structurelles
opposées — dupliquer le calcul d'asymétrie à l'intérieur du moteur des qualités violerait le
"principe d'étanchéité" déjà posé dans `KINEXUS_CLINICAL_ARCHITECTURE.md` (le moteur des qualités
comme source de vérité unique, lu par les moteurs avals, jamais l'inverse) — ici ce serait
l'inverse : le moteur des qualités consommerait une sortie d'un moteur aval.

**Impact sur les orientations/recommandations futures** : si l'asymétrie de freinage n'est jamais
remontée au niveau Qualités, une orientation clinique générée uniquement à partir d'`HYP-ABS-01`
pourrait ignorer une asymétrie déjà connue du cluster Mouvement, produisant un tableau clinique
incomplet malgré une donnée déjà disponible ailleurs dans l'outil.

**Options** :
- **A. Réimplémenter** le calcul d'asymétrie comme preuve interne à `HYP-ABS-01` (dupliquer la
  logique déjà existante dans `computeAsymEngine`).
- **B. Ne jamais consulter l'asymétrie au niveau Qualités** — la laisser entièrement au cluster
  Mouvement, `HYP-ABS-01` reste construite uniquement sur les valeurs G/D brutes déjà listées.
- **C. Référencer, sans dupliquer** — `HYP-ABS-01` peut recevoir la conclusion déjà calculée par
  `computeAsymEngine` comme une preuve d'entrée externe en lecture seule (même modèle que
  `functionScores` déjà consommé en lecture seule par le cluster Mouvement, mais dans le sens
  inverse).

**Avantages/inconvénients** :
- A : preuve immédiatement disponible dans la fiche ; inconvénient — duplique une logique
  existante, risque de divergence entre deux calculs du même phénomène, contraire à l'esprit du
  principe d'étanchéité.
- B : le plus simple, aucun risque de duplication ; inconvénient — perd une information déjà
  calculée et potentiellement pertinente.
- C : cohérent avec l'architecture à trois niveaux déjà posée dans `KINEXUS_CLINICAL_ARCHITECTURE.md`
  ; inconvénient — introduit une dépendance croisée Qualités↔Phases qui n'existait pas jusqu'ici
  dans ce sens, à concevoir soigneusement en Phase C pour ne pas rouvrir le principe d'étanchéité
  dans l'autre sens.

**Recommandation argumentée** : **Option C, avec prudence.** Ignorer une donnée déjà calculée
(option B) serait un choix par défaut plus qu'un choix réfléchi. Dupliquer (option A) crée un
risque de divergence que rien ne justifie puisque le calcul existe déjà. Référencer en lecture
seule (option C) est cohérent avec un précédent architectural déjà établi et validé
(`functionScores` lu en lecture seule par le cluster Mouvement) — seule la direction est inversée
ici, ce qui mérite d'être explicitement validé par le praticien avant Phase C plutôt que traité
comme un simple détail d'implémentation.

---

## 4. Explosivité — absence de RFD fenêtré

**Description du problème** : la preuve diagnostique que Vierge_7 vise pour Explosivité (RFD du
CMJ à des fenêtres temporelles précises — 100/150/200 ms) n'est pas calculée par Kinexus, qui ne
produit qu'un RFD concentrique unique non fenêtré (`cmj_conc_rfd`) et une impulsion à 100 ms
(`cmj_conc_impulse_100`).

**Impact clinique** : un RFD non fenêtré mélange toute la phase concentrique, potentiellement
plus lente en fin de mouvement — un athlète explosif en tout début de montée en force mais
globalement plus lent pourrait être mal classé, et inversement.

**Impact sur HYP###** : c'est la seule qualité, sur les 9, où la reconstruction complète du
raisonnement (au-delà de toute question de pondération) ne peut pas atteindre exactement la
question clinique de Vierge_7 avec les données actuelles — un plafond de confiance structurel,
distinct d'une incertitude clinique liée au patient.

**Impact sur les orientations/recommandations futures** : si ce plafond n'est pas explicitement
marqué, un déficit d'explosivité rapporté avec une confiance apparemment "normale" pourrait laisser
croire à une certitude diagnostique que l'instrumentation actuelle ne permet pas réellement
d'atteindre.

**Options** :
- **A. Lancer `HYP-EXP-01` maintenant** avec `cmj_conc_rfd` comme proxy, sans mention particulière.
- **B. Reporter l'implémentation d'Explosivité** en Phase C jusqu'à ce que le pipeline CMJ soit
  enrichi avec un RFD fenêtré.
- **C. Lancer maintenant avec un marqueur structurel explicite** distinguant, dans la conception
  même de l'hypothèse, "confiance limitée par l'instrumentation" de "confiance limitée par la
  clinique" — et consigner l'enrichissement du pipeline CMJ comme un chantier produit séparé, non
  bloquant.

**Avantages/inconvénients** :
- A : simplicité, aucune dépendance externe ; inconvénient — masque une limite réelle derrière une
  hypothèse présentée comme équivalente aux 8 autres.
- B : la plus rigoureuse vis-à-vis de Vierge_7 ; inconvénient — bloque toute la Phase C sur une
  seule qualité sur 9, alors que les 8 autres n'ont pas ce problème.
- C : ne bloque rien, reste honnête sur la limite ; inconvénient — nécessite que le modèle HYP###
  (encore à concevoir en détail en Phase C) sache représenter cette distinction, un peu de
  complexité supplémentaire pour un seul cas à ce stade.

**Recommandation argumentée** : **Option C.** Bloquer 8 qualités saines pour une seule qui a un
problème d'instrumentation (option B) serait disproportionné. Ignorer le problème (option A)
romprait la transparence que tout cet audit a cherché à construire. Le marqueur structurel
(option C) est la seule option qui avance sans rien cacher — à valider avec le praticien
uniquement sur le principe (le détail de représentation appartient à la conception technique de
Phase C, pas à ce document).

---

## 5. « Diagnostique contextuel » — statut de rang non formalisé (Puissance)

**Problème** : Vierge_7 introduit, pour Puissance, un rôle informel "diagnostique contextuel"
(`dj_peak_prop_power`, `sldj_peak_prop_power`, `cmjr_peak_power` — utilisés seulement quand
CMJ/SLCMJ indisponibles) qui n'existe dans aucune des 3 catégories officielles du modèle
(diagnostique/confirmative/explicative).

**Impact clinique** : sans définition formelle, ces trois variables pourraient être traitées soit
comme un vrai diagnostic (risque de doublon avec `cmj_peak_power`), soit comme une simple
confirmative (perte de leur capacité à porter le diagnostic en l'absence du test principal).

**Impact sur HYP###** : c'est un trou dans le modèle à 3 niveaux lui-même, pas seulement un détail
de cette qualité — le même besoin pourrait resurgir ailleurs (implicitement déjà pressenti pour
Puissance, potentiellement généralisable).

**Impact sur les orientations/recommandations futures** : sans ce rang, un bilan sans CMJ/SLCMJ
actif perdrait toute capacité diagnostique sur Puissance, même avec un DJ/SLDJ/CMJR disponible et
informatif.

**Options** : **A.** Ignorer la nuance, traiter ces 3 variables comme confirmatives strictes.
**B.** Les traiter comme diagnostiques à part entière, au même titre que `cmj_peak_power`.
**C.** Formaliser un 4ᵉ rôle explicite dans le modèle HYP### : "preuve diagnostique secondaire",
mobilisée uniquement en l'absence de la preuve diagnostique principale, jamais en renfort à poids
égal.

**Recommandation argumentée** : **Option C.** C'est la lecture la plus fidèle du texte de
Vierge_7 ("diagnostique... contextuel"), et elle a déjà été proposée dans l'audit Phase A
(§1.2bis) sans avoir été formellement actée. La formaliser maintenant, comme règle générale du
modèle (pas seulement une exception pour Puissance), évite de la redécouvrir qualité par qualité
en Phase C.

---

## 6. Contradiction Jump Height (Puissance) — tableau récapitulatif vs section détaillée

**Problème** : le tableau récapitulatif en tête de la fiche Puissance liste `CMJ_JH`/`SLCMJ_JH`
comme "Diagnostique", tandis que la section détaillée les classe en confirmative.

**Impact clinique** : mineur en soi (`cmj_height` reste une preuve utile quel que soit son rang),
mais s'il est traité comme diagnostique, il dilue à nouveau `cmj_peak_power` au même titre que
d'autres tests déjà retirés du diagnostic de Puissance en Phase A.

**Impact sur HYP###/orientations/recommandations** : risque de réintroduire, pour une seule
variable, exactement le problème de dilution diagnostique qui a motivé tout le chantier HYP###.

**Options** : **A.** Suivre le tableau récapitulatif (diagnostique). **B.** Suivre la section
détaillée (confirmative).

**Recommandation argumentée** : **Option B.** Sur l'ensemble des 9 fiches auditées, la section
détaillée (avec justification explicite "pourquoi ?") s'est révélée systématiquement plus fiable
que les résumés/tableaux introductifs, chaque fois qu'un écart a été trouvé entre les deux. Traiter
`cmj_height`/`slcmj_height` comme confirmatives, pas diagnostiques.

---

## 7. Chevauchement confirmative / explicative biomécanique — motif récurrent non codifié

**Problème** : sur au moins 4 qualités (Puissance/CMJR, Réactivité/DJ-SLDJ, Absorption/CMJ,
Stabilisation-CSM/SLS-Landing-Strobo), Vierge_7 liste les mêmes variables mot pour mot en
confirmative et en explicative biomécanique, sans jamais énoncer explicitement que ce
chevauchement est une règle générale plutôt qu'une redite.

**Impact clinique** : faible en soi — la variable garde une utilité claire dans les deux cas.

**Impact sur HYP###** : sans règle explicite, chaque implémentation qualité par qualité risque de
traiter ce chevauchement différemment (doublon accidentel, ou suppression arbitraire d'un des deux
rôles).

**Options** : **A.** Traiter comme un doublon rédactionnel, ne garder qu'un rôle par variable
(explicative biomécanique, la plus spécifique). **B.** Codifier explicitement la règle : "une
variable brute d'un test diagnostique peut porter simultanément un rôle confirmatif et explicatif
biomécanique — les deux sont conservés."

**Recommandation argumentée** : **Option B.** La récurrence sur 4 qualités indépendantes rend
l'hypothèse du "doublon rédactionnel" peu probable — c'est plus vraisemblablement une propriété
volontaire mais jamais énoncée explicitement par Vierge_7. La codifier comme règle générale du
modèle HYP### évite l'arbitraire d'un retrait qualité par qualité.

---

## 8. `repeated_hop` cité sans KPI précis en confirmative de Réactivité

**Problème** : la fiche Réactivité cite le test `repeated_hop` en confirmative sans préciser de
KPI, alors que la fiche Endurance assigne un rôle diagnostique explicite et exhaustif à 14 des 15
KPIs du même test.

**Impact clinique/HYP###** : si un KPI `repeated_hop_*` était ajouté par erreur au diagnostic ou
à la confirmative de Réactivité, cela réintroduirait la confusion réactivité/endurance déjà
identifiée comme la violation la plus sévère de l'audit Phase A (Réactivité, TFM).

**Options** : **A.** Chercher à deviner quel KPI Vierge_7 visait. **B.** Ne rattacher aucun KPI
`repeated_hop_*` à Réactivité, la fiche Endurance faisant foi de façon plus précise et exhaustive.

**Recommandation argumentée** : **Option B**, déjà appliquée dans `HYP_ARCHITECTURE_PHASE_B.md`
fiche 4. La fiche Endurance est plus récente dans l'ordre du document, plus précise (KPI par KPI)
et plus cohérente avec la règle de fond ("les variables d'endurance... ne doivent jamais
participer au calcul du score de réactivité"). Formalisée ici comme figée.

---

## 9. Tests Kinexus non couverts par Vierge_7 (`sh_iso_*`, `iso_squat_hold` partiel, `seated_calf_raise`/`standing_calf_raise`)

**Problème** : plusieurs tests existants et mesurés dans Kinexus n'apparaissent dans **aucune**
fiche Vierge_7 lue à ce jour (`sh_iso_9020`/`9090`/`3030`/`6060` systématiquement absents ;
`iso_squat_hold` présent sur certaines qualités seulement, sans logique apparente ;
`seated_calf_raise`/`standing_calf_raise` absents partout, alors que leur nature répétée en ferait
des candidats naturels pour Endurance).

**Impact clinique** : ces tests, aujourd'hui utilisés par `TFM` (souvent en excès, Phase A), ne
seraient simplement plus utilisés du tout par HYP### tant que Vierge_7 ne leur assigne pas de
rôle — perte d'information potentiellement utile, mais pas un risque de contamination.

**Impact sur HYP###/orientations/recommandations** : aucun risque de confusion (silence, pas
d'erreur active) ; risque d'appauvrissement si ces tests sont réellement pertinents et
seulement absents par oubli rédactionnel de Vierge_7.

**Options** : **A.** Leur assigner un rôle par analogie avec des tests similaires déjà couverts
(ex. traiter `sh_iso_*` comme la famille segmentaire "force explicative"). **B.** Les exclure de
HYP### v1, strictement, jusqu'à ce que Vierge_7 leur assigne un rôle explicite.

**Recommandation argumentée** : **Option B.** Assigner un rôle par analogie (option A) serait une
extrapolation clinique que cet audit n'a pas mandat de faire — le principe déjà établi
("N'intègre que des variables réellement mesurées... aucune hypothèse non mesurée") s'étend
logiquement à "aucun rôle non spécifié explicitement par Vierge_7". Ces tests restent
**consignés** ici comme candidats à soumettre au praticien pour enrichissement futur de Vierge_7,
sans y intégrer d'assignation par défaut.

---

## 10. Couverture très limitée des tests Landing et Strobo — plafond de données cross-qualité

**Problème** : `landing_uni`/`landing_bi` ne calculent, dans Kinexus, qu'un sous-ensemble minime
des KPIs attendus par Vierge_7 (`tts` seul, ou `tts`+`peak_landing_force`, contre 4-5 KPIs
attendus par test) ; `strobo` ne calcule que `surface` (contre 3 KPIs attendus). Ce plafond touche
simultanément Absorption, Stabilisation et Contrôle Sensori-moteur.

**Impact clinique** : la richesse diagnostique de ces trois qualités reste structurellement
limitée à 1-2 signaux par test, quel que soit le modèle de raisonnement retenu.

**Impact sur HYP###** : contrairement à Explosivité (une preuve manquante sur une qualité), ce
plafond touche 3 qualités à la fois par un mécanisme partagé (même famille de tests
sous-instrumentés) — un chantier produit potentiellement plus rentable s'il est traité une fois
pour les 3 qualités plutôt que qualité par qualité.

**Options** : **A.** Accepter la limitation pour la Phase C, lancer les 3 qualités avec les KPIs
disponibles. **B.** Reporter les 3 qualités jusqu'à enrichissement du pipeline. **C.** Accepter la
limitation avec le même marqueur de confiance structurelle proposé pour Explosivité (point 4),
et consigner l'enrichissement (Landing : loading_rate/impulse/cop_path ; Strobo : cop_path/cop_vel)
comme un chantier produit unique couvrant les 3 qualités.

**Recommandation argumentée** : **Option C**, par cohérence directe avec la recommandation du
point 4 — même nature de problème (plafond instrumental, pas une erreur de conception), même
traitement.

---

## 11. Correspondance de nommage `cmj_ecc_dec_*` / `ecc_decel_*` / `cmj_braking_*`

**Problème** : Vierge_7 utilise 3 graphies différentes pour ce qui semble être le même phénomène
physique (freinage/décélération excentrique du CMJ) dans une seule fiche (Absorption), et Kinexus
calcule cette famille sous une 4ᵉ convention (`cmj_braking_*`).

**Impact clinique** : aucun si la correspondance est correcte ; un déficit de freinage pourrait
rester invisible en Absorption/Explosivité si la correspondance est erronée et qu'aucune variable
n'est finalement rattachée.

**Impact sur HYP###** : bloque, tant qu'elle n'est pas confirmée, l'intégration propre de la
famille CMJ excentrique dans `HYP-ABS-01` et `HYP-EXP-01`.

**Options** : **A.** Adopter `cmj_braking_*` comme nom canonique interne, traiter les 3 graphies
Vierge_7 comme son équivalent éditorial. **B.** Laisser la correspondance non confirmée et exclure
ces variables de HYP### jusqu'à validation.

**Recommandation argumentée** : **Option A.** La correspondance conceptuelle est forte (même
phase du mouvement, même grandeurs physiques — RFD et impulsion de la phase de freinage), et les
fiches Puissance/Absorption/Explosivité de Vierge_7 ne laissent pas de doute sur le fait qu'un seul
phénomène est visé sous ces graphies. Exclure ces variables (option B) appauvrirait sans raison
forte deux qualités. Décision réversible si le praticien identifie une distinction réelle.

---

## 12. Fiche Force dupliquée — décision déjà prise, à figer formellement

**Problème** (rappel) : Vierge_7 contient deux fiches Force complètes et contradictoires. Décision
déjà prise en Phase A avec validation du praticien : la version en nommage `snake_case` fait foi.

**Statut** : **Déjà tranché, non rouvert ici.** Consigné dans ce document uniquement pour mémoire
et traçabilité de la décision finale.

---

# Partie 2 — Proposition d'architecture HYP### figée

Cette proposition reprend intégralement `HYP_ARCHITECTURE_PHASE_B.md` (les 9 fiches, inchangées
sauf mention explicite ci-dessous) et y applique les recommandations de la Partie 1. **Chaque
amendement reste une proposition soumise à validation, pas une décision actée.**

## Décisions proposées, par point

| # | Point | Décision proposée |
|---|---|---|
| 1 | Stabilisation vs Contrôle Sensori-moteur | `HYP-CSM-01` **suspendue** en Phase C (non implémentée), conservée documentée dans la fiche 7, réactivable dès qu'une preuve distinctive existe |
| 2 | Peak Landing Force / Stabilisation | `landing_bi_peak_landing_force` **exclu** de Stabilisation (et de Contrôle Sensori-moteur par cohérence) — reste diagnostique/confirmatif pour Absorption uniquement |
| 3 | Asymétries | Référencées en lecture seule depuis `computeAsymEngine` comme preuve d'entrée externe de `HYP-ABS-01`, jamais recalculées dans le moteur des qualités — modalité technique à préciser en Phase C |
| 4 | RFD fenêtré / Explosivité | `HYP-EXP-01` lancée avec `cmj_conc_rfd` comme proxy, marquée d'un plafond de confiance structurel distinct de l'incertitude clinique |
| 5 | Diagnostique contextuel | Nouveau rang formel "preuve diagnostique secondaire" ajouté au modèle HYP### (Puissance : `dj_peak_prop_power`, `sldj_peak_prop_power`, `cmjr_peak_power`) |
| 6 | Jump Height | `cmj_height`/`slcmj_height` confirmatives (jamais diagnostiques) |
| 7 | Confirmative/explicative-biomécanique | Règle générale codifiée : chevauchement autorisé et attendu, pas un doublon à corriger |
| 8 | `repeated_hop` / Réactivité | Aucun KPI `repeated_hop_*` dans la fiche Réactivité — fiche Endurance seule fait foi |
| 9 | Tests non couverts | Exclus de HYP### v1, consignés comme candidats d'enrichissement futur de Vierge_7 |
| 10 | Couverture Landing/Strobo | Même traitement que le point 4 — plafond de confiance structurel, chantier d'enrichissement consigné pour les 3 qualités concernées |
| 11 | Nommage `cmj_braking_*` | Adopté comme nom canonique, correspondance actée pour Absorption et Explosivité |
| 12 | Fiche Force dupliquée | Déjà figé (version `snake_case`) |

## Fiches modifiées par rapport à `HYP_ARCHITECTURE_PHASE_B.md`

- **Fiche 5 (Absorption)** : ajout d'une preuve confirmative externe référencée (asymétries via
  `computeAsymEngine`, point 3) ; `cmj_braking_rfd`/`cmj_braking_impulse` confirmés comme
  correspondance actée, plus "à confirmer" (point 11).
- **Fiche 6 (Stabilisation)** : `landing_bi_peak_landing_force` formellement exclu, plus listé
  comme point ouvert (point 2) ; le point sur la quasi-duplication avec la fiche 7 devient une
  décision (`HYP-CSM-01` suspendue), plus une simple observation (point 1).
- **Fiche 7 (Contrôle Sensori-moteur)** : fiche **suspendue** pour la Phase C (point 1) — conservée
  intégralement comme document de référence pour une réactivation future, non implémentée.
- **Fiche 2 (Puissance)** : rang "preuve diagnostique secondaire" formalisé pour
  `dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power` (point 5) ; `cmj_height`/
  `slcmj_height` confirmées confirmatives, pas diagnostiques (point 6).
- **Fiche 4 (Réactivité)** : suppression définitive de toute mention `repeated_hop_*`, déjà
  absente du brouillon Phase B mais désormais actée sans ambiguïté (point 8).
- **Fiche 3 (Explosivité)** : `HYP-EXP-01` marquée d'un plafond de confiance structurel (point 4).

Les fiches 1 (Force), 8 (Endurance) et 9 (Mobilité) restent inchangées — aucun point ouvert ne les
concerne directement.

## Ce qui reste hors de ce gel

- La modalité technique exacte du "plafond de confiance structurel" (points 4/10) et de la
  référence en lecture seule à `computeAsymEngine` (point 3) — conception de Phase C, pas
  d'architecture clinique.
- Les qualités Contrôle Frontal (non encore auditée) — `ybt` reste sans domicile tant qu'elle n'est
  pas lue.
- Toute décision de correction effective de `TFM`/`VAR_REL3` — hors périmètre de ce document et de
  la Phase B/C telles que cadrées jusqu'ici.

**Ce document ne devient l'architecture figée qu'après validation explicite du praticien, point
par point ou en bloc.**

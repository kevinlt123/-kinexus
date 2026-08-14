# Phase E — Moteur d'inférence HYP### (formalisation du raisonnement)

## Statut de ce document

Les Phases A à D sont terminées. Ce document ne construit aucune hypothèse clinique nouvelle et
ne modifie aucun contenu des 8 fiches `HYP_ARCHITECTURE_PHASE_C.md` : il formalise **comment** le
moteur doit faire évoluer une hypothèse déjà conçue en fonction des preuves disponibles, en
réponse directe au vide de spécification identifié en Phase D (**Constat C0**). Aucun code, aucune
implémentation, aucune configuration, aucune pondération numérique.

**Ancrage normatif obligatoire** : `KINEXUS_CLINICAL_ARCHITECTURE.md` a déjà validé, le 07/08, une
partie de ce que ce document doit formaliser — notamment l'étape de pipeline *"Évaluation du niveau
de support de chaque hypothèse (**Fort / Modéré / Faible** — jamais un score numérique)"* et la
règle de fond *"une variable isolée ne valide jamais, seule, une hypothèse. Une variable peut
seulement : **générer**, **renforcer**, **affaiblir**, **réfuter**."* Ce document ne réinvente pas
ce vocabulaire : il l'opérationnalise. Toute proposition ci-dessous qui s'écarterait de ce
vocabulaire déjà validé est signalée explicitement comme un écart, jamais silencieusement.

Convention de marquage : 📄 = directement fondé sur `KINEXUS_CLINICAL_ARCHITECTURE.md` ou Vierge_7
(fiches de qualité / `CLI###`), cité ou paraphrasé fidèlement. 🔧 = formalisation nécessaire à ce
document — aucune des deux sources ne détaille ce niveau de mécanique, une construction est requise
pour répondre à la question posée par le praticien.

---

# Partie 1 — Cycle de vie d'une hypothèse

## États retenus

🔧 Le cycle proposé ne remplace pas le vocabulaire déjà validé (Fort/Modéré/Faible, générer/
renforcer/affaiblir/réfuter) — il l'organise en une séquence d'états observables :

```
ABSENTE  →  SUSPECTÉE  →  RETENUE (Faible → Modéré → Fort)  →  [ RÉFUTÉE à tout moment ]
```

| État | Définition | Déclencheur |
|---|---|---|
| **Absente** | Aucune preuve diagnostique déficitaire pour cette qualité. L'hypothèse n'existe pas — il n'y a rien à raisonner. | Statut normal sur l'ensemble des variables diagnostiques. |
| **Suspectée** | Exactement une preuve diagnostique déficitaire (ou, pour les qualités à seuil >2, un nombre de preuves inférieur au seuil `CLI###`). L'hypothèse existe, mais n'a **pas** encore la convergence requise pour produire une orientation clinique. | Une variable diagnostique **génère** l'hypothèse — application directe du verbe "générer" déjà validé. |
| **Retenue** | Le seuil de convergence diagnostique propre à la qualité (`CLI###`, ex. "≥2 preuves déficitaires") est atteint. L'hypothèse devient éligible à produire une orientation clinique. Se subdivise en trois niveaux de support, repris tels quels de l'architecture déjà validée : | Convergence diagnostique atteinte (**renforcée** ensuite par confirmatives/explicatives). |
| — Retenue / Faible | Seuil diagnostique atteint, aucune convergence confirmative ni explicative. | |
| — Retenue / Modéré | Seuil diagnostique atteint + au moins une preuve confirmative convergente. | |
| — Retenue / Fort | Seuil diagnostique atteint + convergence confirmative **et** explicative (physiologique ou biomécanique) sur un mécanisme cohérent. | |
| **Réfutée** | Une preuve identifiée comme réfutante contredit explicitement l'hypothèse, quel que soit son état antérieur. | Application du verbe "réfuter" déjà validé — **voir Partie 7 : cet état est actuellement inatteignable pour les 8 qualités construites, faute de condition de rejet formalisée par Vierge_7.** |

## Justification de chaque état

- **Absente** n'est pas une "valeur par défaut technique" mais un état clinique à part entière :
  l'absence de preuve diagnostique est en elle-même une information ("cette qualité n'appelle
  aucune investigation"), cohérente avec le principe déjà établi que le pipeline ne doit jamais
  présenter une variable non interprétée comme une conclusion.
- **Suspectée** est l'état qui manquait structurellement et que le Constat C0 a mis en évidence.
  Sans lui, une preuve diagnostique isolée n'avait **aucune destination** dans le modèle : ni
  "Absente" (faux — une preuve existe), ni "Retenue" (faux — le seuil `CLI###` n'est pas atteint).
  Le nommer explicitement répond directement à la question de la Phase D sans toucher au seuil
  d'activation des orientations `CLI###` elles-mêmes (voir Partie 5).
- **Retenue** correspond très précisément à l'étape "Hypothèses retenues" déjà présente dans le
  schéma de pipeline validé le 07/08 — ce document ne fait que préciser ce que "retenue" signifie
  en pratique (le franchissement du seuil `CLI###`) et comment son support se gradue ensuite
  (Faible/Modéré/Fort), sans jamais introduire de somme ni de score.
- **Réfutée** est conservée dans le cycle, même si elle est aujourd'hui vide de contenu concret
  pour les 8 qualités (voir Partie 7), parce que le principe fondateur nomme explicitement le verbe
  "réfuter" — retirer cet état reviendrait à contredire silencieusement la règle de fond déjà
  validée. Il reste dans le modèle comme un état légitime, en attente d'un contenu clinique à
  spécifier par le praticien.

## Ce qui n'a délibérément pas été retenu

🔧 Le praticien proposait, à titre d'exemple, "Suspectée / Probable / Confirmée / Forte". Ce
document ne reprend pas ce séquencement à quatre niveaux **entre** Suspectée et Réfutée, parce que
`KINEXUS_CLINICAL_ARCHITECTURE.md` a déjà validé un système à **trois** niveaux de support
(Fort/Modéré/Faible), pas quatre — ajouter "Probable" et "Confirmée" comme états distincts aurait
introduit un vocabulaire concurrent à celui déjà arbitré le 07/08. "Retenue" est utilisée ici comme
le terme générique (déjà présent dans le pipeline validé) qui se décline ensuite en Faible/Modéré/
Fort, plutôt que comme une invention.

---

# Partie 2 — Rôle des preuves

## Comportement par catégorie

| Catégorie | Peut générer (Absente→Suspectée) ? | Peut faire franchir le seuil `CLI###` (→Retenue) ? | Peut faire monter le support (Faible→Modéré→Fort) ? | Peut réfuter ? |
|---|---|---|---|---|
| **Diagnostique** | 📄 Oui — seule catégorie habilitée. Une variable diagnostique déficitaire isolée génère l'hypothèse (état Suspectée). | 📄 Oui — c'est la convergence **entre variables diagnostiques** (ex. `dj_rsi` **et** `sldj_rsi`) qui constitue le seuil `CLI###` lui-même, jamais une autre catégorie. | 🔧 Indirectement — une 3ᵉ ou 4ᵉ preuve diagnostique déficitaire au-delà du seuil minimal renforce la robustesse du franchissement, sans être formellement requise par Vierge_7 pour distinguer Modéré de Fort. | 📄 Non documenté — voir Partie 7. |
| **Confirmative** | 📄 Non, jamais seule — validé sur tous les cas C de la Phase D (déficit confirmatif isolé, diagnostique normal ⇒ hypothèse reste Absente). | 📄 Non — aucun seuil `CLI###` lu à ce jour ne compte une confirmative dans le calcul de la convergence diagnostique. | 📄 Oui — c'est son rôle nommé explicitement dans plusieurs `CLI###` ("Contact Time et Jump Height... renforcent la confiance", `CLI050`). Fait passer Faible→Modéré. | 📄 Non documenté. |
| **Explicative physiologique** | 📄 Non, jamais seule (même validation que confirmative). | 📄 Non. | 📄 Oui, en complément d'une confirmative convergente — fait passer Modéré→Fort en apportant un mécanisme causal plausible ("pourquoi"). | 📄 Non documenté. |
| **Explicative biomécanique** | 📄 Non, jamais seule. | 📄 Non. | 📄 Oui, même rôle que l'explicative physiologique — les deux sont **cumulables**, pas substituables l'une à l'autre (une hypothèse peut être Fort sur explicative physio seule, biomécanique seule, ou les deux). | 📄 Non documenté. |

## Réponses directes aux questions posées

**Une seule variable diagnostique suffit-elle ?**
📄🔧 Cela dépend de ce qu'on entend par "suffire". Elle suffit à **générer** l'hypothèse (état
Suspectée) — c'est une lecture directe du verbe "générer" déjà validé. Elle ne suffit **pas** à la
faire atteindre "Retenue" pour les 7 qualités dont le seuil `CLI###` exige explicitement ≥2 preuves
(Force, Puissance, Réactivité, Explosivité, Absorption, Stabilisation, Endurance). **Exception
assumée** : Mobilité (`CLI020`, une seule variable, `wblt_distance`) — voir Partie 6.

**Quand une hypothèse devient-elle forte ?**
🔧 Quand, en plus du seuil diagnostique franchi, au moins une preuve confirmative **et** au moins
une preuve explicative (physiologique ou biomécanique) convergent sur le même mécanisme clinique.
Ce n'est **jamais** un compte de preuves ("3 preuves = Fort") — c'est une convergence de
**catégories** différentes de preuves, cohérente avec "le moteur raisonne par cohérence des
preuves, jamais par accumulation de scores" déjà validé. Deux preuves diagnostiques supplémentaires
du même test ne suffisent pas à elles seules à atteindre Fort si aucune confirmative ni explicative
ne converge.

**Peut-elle exister sans variable confirmative ?**
📄 Oui — rien dans Vierge_7 ni dans `KINEXUS_CLINICAL_ARCHITECTURE.md` ne conditionne l'état
Retenue à la présence d'une confirmative. Une hypothèse peut être Retenue/Faible sur la seule
convergence diagnostique (c'est d'ailleurs le cas nominal de `HYP-PUI-01` et `HYP-REA-01`, dont le
diagnostic repose sur exactement 2 variables sans marge). Elle reste alors plafonnée à Faible —
elle ne peut pas atteindre Modéré ni Fort sans confirmative, par construction (tableau ci-dessus).

**Peut-elle être réfutée malgré une variable diagnostique déficitaire ?**
📄 C'est la question la plus importante de cette partie, et la réponse est un constat, pas une
règle : **en théorie oui** (le principe fondateur nomme "réfuter" comme un comportement possible
de n'importe quelle variable), **en pratique aucune des 8 fiches `HYP_ARCHITECTURE_PHASE_C.md`,
ni aucun `CLI###` lu à ce jour, ne spécifie de condition qui jouerait ce rôle.** Ce n'est pas une
omission de ce document — c'est un vide déjà repéré en Phase C ("Conditions de rejet : aucune
formalisée") et confirmé qualité par qualité en Phase D. Développé en Partie 7.

---

# Partie 3 — Gestion des preuves contradictoires

## Cas théoriques demandés

### Force : IMTP ↓, Iso Belt Squat normal
🔧 `imtp_n` et `iso_belt_squat_n` sont deux des quatre variables **diagnostiques** de
`HYP-FOR-01` (avec `slimtp_n`, `sl_iso_push_n`). Une seule déficitaire sur quatre : le seuil
`CLI010` (≥2/4) n'est pas atteint. **Ce n'est pas une contradiction — c'est le cas nominal de
l'état Suspectée.** Le moteur ne doit rien "réconcilier" : il constate une preuve diagnostique
générative, sans convergence suffisante pour Retenue. Rien dans Vierge_7 ne suggère qu'un second
test diagnostique **normal** doive activement affaiblir la portée du premier — le statut Suspectée
reste stable tant qu'aucune 2ᵉ preuve déficitaire n'apparaît, favorable ou non.

### Puissance : CMJ_PP ↓, Hop normal
🔧 Point plus subtil : `single_hop_distance`/`triple_hop_distance` sont des variables
**confirmatives** de `HYP-PUI-01`, pas diagnostiques (le second diagnostique est
`slcmj_peak_power`, non mentionné dans ce cas). Il s'agit donc d'un diagnostique déficitaire
(Suspectée, faute du second diagnostique) **et** d'une confirmative normale. Ici, une vraie
question se pose que Vierge_7 ne tranche pas : une confirmative **normale** doit-elle **affaiblir**
l'hypothèse déjà générée (application du verbe "affaiblir" déjà validé), ou rester neutre (ne
renforce pas, mais ne retire rien) ? **Aucun `CLI###` ni aucune fiche de qualité ne répond à cette
question pour les 8 qualités construites.** Traité ici comme neutre par défaut (silence de
Vierge_7 = absence de règle, pas une règle implicite de neutralité) — **point à arbitrer,
Partie 7.**

### Réactivité : DJ_RSI ↓, SLDJ_RSI normal
🔧 Structure identique à Force : les deux variables sont diagnostiques, une seule déficitaire sur
deux, seuil `CLI050` (≥2, tel que retenu par la fiche de qualité) non atteint. **Même traitement
que le cas Force — Suspectée, pas une contradiction.**

## Constat transversal sur les trois cas
🔧 Les trois cas proposés par le praticien partagent une même structure : **ils ne sont pas des
contradictions au sens fort (deux preuves qui s'opposent sur la même conclusion), mais des cas de
convergence diagnostique incomplète.** Le moteur n'a, dans ces trois cas, aucune tension réelle à
résoudre — il doit seulement représenter honnêtement un état "Suspectée" plutôt que forcer une
conclusion binaire (Absente ou Retenue). Le seul cas des trois qui soulève une vraie question
ouverte est Puissance, parce que la preuve normale y est une **confirmative** et non un second
diagnostique — c'est la première fois dans ce chantier qu'une confirmative normale entre en jeu
alors que le diagnostique est déjà déficitaire.

## Un vrai cas de contradiction, pour comparaison
🔧 Déjà résolu en Phase D (Force, Cas C) et rappelé ici pour compléter la typologie : un déficit
**explicatif** segmentaire (`knee_ext_n`↓) avec un diagnostique global **normal** (les 4 tests
diagnostiques normaux). Ici, la hiérarchie de preuve tranche sans ambiguïté : une explicative
déficitaire ne peut ni générer ni faire remonter l'hypothèse au-delà d'Absente — validé
explicitement par la fiche de qualité Force elle-même. C'est le seul type de "contradiction"
réellement arbitré par Vierge_7 à ce jour : **le niveau diagnostique a toujours l'autorité décisive
sur l'état de l'hypothèse ; les niveaux confirmatif et explicatif ne peuvent que graduer un état déjà
généré, jamais le générer ou le contredire eux-mêmes.**

## Chevauchement explicatif entre deux hypothèses actives (constat complémentaire)
🔧 Recherche systématique menée pour cette partie : Absorption et Stabilisation, bien que
diagnostiquement disjointes (déjà validé en Phase D), **partagent des variables explicatives
physiologiques** — `hip_abd_rfd100`, `hip_ext_rfd100`, `hip_add_rfd100` apparaissent dans les deux
fiches. Si `HYP-ABS-01` et `HYP-STAB-01` sont actives simultanément et que ces variables de hanche
sont déficitaires, le moteur ne doit **pas** les compter deux fois comme deux mécanismes distincts
— c'est la même preuve physiologique qui explique en partie deux conclusions indépendantes. Ce
n'est pas une contradiction, mais un point de vigilance pour la narration en aval (déjà couvert par
la règle existante : "les deux conclusions peuvent coexister sans se contredire, elles répondent à
des questions différentes").

---

# Partie 4 — Priorisation

## Principe de départ
📄 Aucune pondération numérique. `KINEXUS_CLINICAL_ARCHITECTURE.md` établit déjà qu'un axe
d'optimisation ne doit jamais être présenté avec le vocabulaire d'une alerte clinique, et que les
conclusions de moteurs différents "peuvent coexister sans se contredire". La priorisation
n'est donc pas un classement qui masquerait ou supprimerait une hypothèse au profit d'une autre —
c'est une aide à **l'ordre d'attention** du praticien, jamais une décision automatique.

## Règles de raisonnement proposées

**Règle 1 — Le niveau de support prime.** 🔧 Entre deux hypothèses actives, celle dont le support
est Fort mérite l'attention en premier, non parce qu'elle serait "plus grave", mais parce que la
convergence de preuves y est la plus complète — c'est une application directe du système
Fort/Modéré/Faible déjà validé, pas une règle nouvelle.

**Règle 2 — Une hypothèse qui explique une autre est examinée en amont.** 🔧 Quand les variables
diagnostiques (ou explicatives) d'une hypothèse A apparaissent comme variables **explicatives**
d'une hypothèse B également active, A est un mécanisme candidat pour B — l'examiner en premier peut
éclaircir B sans qu'il faille pour autant traiter B comme secondaire ou moins réel. Exemple
appliqué au cas demandé :

> **Force↓, Puissance↓, Réactivité↓ simultanément** — les trois ensembles diagnostiques sont
> disjoints (aucune variable partagée, déjà validé en Phase D). Mais `imtp_n`/`slimtp_n` (deux des
> quatre variables diagnostiques de Force) apparaissent comme variables **explicatives
> physiologiques** de `HYP-PUI-01` **et** de `HYP-REA-01`. `CLI040` cite même explicitement "Force"
> comme qualité explicative de Puissance. **Règle appliquée** : Force devient le premier axe
> d'examen, non pas parce qu'elle serait prioritaire en soi, mais parce qu'elle est le seul des
> trois mécanismes à apparaître comme explication possible des deux autres. Puissance et Réactivité
> restent des hypothèses pleinement valides et retenues indépendamment — ce n'est pas une fusion,
> c'est un chemin de lecture suggéré.

**Règle 3 — Aucune hypothèse ne supprime une autre.** 📄 Conformément au principe déjà validé
("les deux conclusions peuvent coexister"), la priorisation ne doit jamais faire disparaître une
hypothèse Retenue au profit d'une autre, même quand la Règle 2 s'applique. Le praticien voit les
trois, avec un chemin de lecture suggéré, pas un filtrage.

**Règle 4 — Finalité clinique en dernier recours.** 🔧 Quand plusieurs hypothèses ont un support
équivalent et qu'aucune ne s'explique par une autre (cas non résolu par les Règles 1-2), la seule
boussole disponible et déjà légitime dans ce projet est la valeur clinique pour l'un des deux
objectifs fondateurs de Kinexus (retour au sport en sécurité, optimisation de la performance) —
jamais un ordre arbitraire de qualités. Ce n'est pas un critère automatisable : c'est un rappel que
la priorisation, à ce stade, redevient une décision du praticien, pas du moteur.

---

# Partie 5 — Relation HYP ↔ CLI

**Une HYP suspectée peut-elle produire une CLI ?**
📄 Non. Les 9 conditions d'activation `CLI###` lues en Phase C exigent toutes une convergence
diagnostique (≥2 preuves, sauf Mobilité) — c'est exactement la frontière entre Suspectée et
Retenue définie en Partie 1. **C'est la réponse structurelle au Constat C0** : une variable isolée
peut désormais légitimement "générer" quelque chose (l'état Suspectée, visible en interne), sans
que cela ne force le seuil `CLI###` à s'abaisser. Le vide de spécification identifié en Phase D
n'était donc pas dans le seuil `CLI###` lui-même (qui reste inchangé), mais dans l'absence d'un état
nommé pour ce qui se passe *avant* qu'il ne soit atteint.

**Faut-il une HYP confirmée, ou Retenue suffit-elle ?**
🔧 Retenue suffit, à n'importe quel niveau de support (Faible, Modéré ou Fort) — aucun `CLI###` lu
à ce jour ne module sa condition de déclenchement en fonction du support. **Limite identifiée ici,
distincte de C0** : le moteur peut aujourd'hui produire la même orientation `CLI###` pour une
hypothèse Retenue/Faible (convergence diagnostique minimale, aucune confirmative) et une hypothèse
Retenue/Fort (convergence complète) — la nuance de confiance que le système Fort/Modéré/Faible est
censé porter n'est pas transmise à la couche d'orientation. 🔧 Recommandation pour discussion en
Partie 7 : transmettre le niveau de support comme **métadonnée** de la `CLI###` déclenchée (pas
comme un second seuil), pour que le praticien voie la nuance sans que le déclenchement lui-même ne
change.

**Comment gérer les CLI segmentaires (Niveau 2, Force uniquement) ?**
📄🔧 `CLI200`-`211` posent une condition à deux niveaux, déjà écrite dans Vierge_7 : *"au moins une
variable diagnostique globale déficitaire ET déficit local [segmentaire] confirmé"*. Traduit dans
le modèle de cette Partie : (1) `HYP-FOR-01` doit d'abord être **Retenue** (le volet global) ; (2)
une variable explicative physiologique segmentaire spécifique (ex. `knee_ext_n`) doit elle-même
être déficitaire pour que le `CLI200` correspondant se déclenche. Ce n'est **pas** une contradiction
avec la règle "une explicative ne génère ni ne confirme jamais l'hypothèse" (Partie 2) : la
variable segmentaire ne génère ni ne confirme `HYP-FOR-01` elle-même, elle **filtre quelle
orientation Niveau 2** se déclenche une fois que `HYP-FOR-01` est déjà Retenue par ses propres
variables diagnostiques. C'est le même principe déjà observé pour Mobilité en Phase C (le rôle
d'une variable dépend du niveau d'orientation visé, pas seulement de la qualité) — appliqué ici de
façon cohérente, pas une règle nouvelle inventée pour l'occasion.

---

# Partie 6 — Cas particuliers déjà identifiés

**Mobilité (activation possible sur une seule preuve)**
🔧 Le cycle général (Absente→Suspectée→Retenue) **dégénère** pour cette qualité : avec une seule
variable diagnostique réelle (`wblt_distance`, LSI dérivé de la même mesure), il n'existe
structurellement aucun état intermédiaire possible entre "aucune preuve" et "la seule preuve
disponible est déficitaire". `HYP-MOB-01` passe donc directement d'Absente à Retenue, sans
transiter par Suspectée — **pas parce que la règle générale serait suspendue pour elle, mais parce
que Suspectée suppose l'existence d'un seuil de convergence à ne pas encore atteindre, et que ce
seuil n'existe pas pour une qualité à une seule variable.** Le support plafonne également à Faible/
Modéré (jamais Fort, faute de couche explicative mesurable — déjà établi en Phase C). **Reste, comme
en Phase D, une exception à faire confirmer explicitement par le praticien** : ce document ne
tranche pas que l'exception est légitime, il documente comment le modèle général l'absorbe sans
contradiction si elle l'est.

**Explosivité (proxy RFD)**
🔧 Le plafond de confiance structurel déjà acté au gel (point 4) se traduit ici comme un **plafond
de support** : `HYP-EXP-01` peut atteindre Retenue/Modéré (convergence diagnostique + confirmative,
toutes deux mesurées et complètes), mais ne devrait pas pouvoir atteindre Fort tant que la couche
explicative biomécanique repose sur `cmj_conc_rfd`, un proxy non fenêtré remplaçant 3 des 4
variables que Vierge_7 vise — la convergence "explicative" qui permettrait de passer Modéré→Fort ne
peut pas être démontrée de façon fiable avec une seule variable faisant office de trois. **Point à
arbitrer** : ce plafonnement n'est écrit nulle part dans Vierge_7 (qui ignore l'existence même du
proxy) — c'est une construction de ce document, à valider.

**Stabilisation (absence de CLI Landing)**
🔧 Conséquence directe de la Partie 5 combinée à l'incohérence déjà démontrée en Phase D : si
`landing_uni_tts`/`landing_bi_tts` sont les deux seules variables déficitaires, `HYP-STAB-01` peut
légitimement atteindre l'état **Retenue** (elles sont diagnostiques selon la fiche de qualité), mais
aucune `CLI###` connue ne peut la recevoir (`CLI070`/`CLI071` ne mentionnent pas Landing). **Le
modèle doit tolérer explicitement cet état : "Retenue, sans orientation clinique correspondante."**
Ce n'est pas une erreur du cycle d'états (qui reste correct — l'hypothèse est bien Retenue) mais un
vide de couverture de la couche `CLI###` elle-même, déjà signalé, pas résolu ici.

**Contrôle Sensori-moteur suspendu**
📄 Aucun état ne s'applique — le cycle ne s'instancie pas pour une hypothèse suspendue,
conformément à `HYP_ARCHITECTURE_FREEZE.md` (point 1). Rien à ajouter ici.

**Asymétries (lecture seule)**
📄🔧 Cohérent avec la Partie 2 : aucune qualité ne traite l'asymétrie comme preuve diagnostique.
Une conclusion d'asymétrie issue de `computeAsymEngine`, lue en lecture seule (gel, point 3), ne
peut jouer qu'un rôle confirmatif ou explicatif — elle peut faire monter le support d'une hypothèse
déjà générée par ailleurs (ex. Faible→Modéré), jamais la générer elle-même ni la faire franchir le
seuil Retenue à elle seule.

---

# Partie 7 — Cohérence avec les principes fondateurs

| Principe fondateur | Compatible avec le moteur proposé ? | Détail |
|---|---|---|
| 📄 "Une variable isolée peut générer une hypothèse" | ✅ Oui | Formalisé explicitement par l'état **Suspectée** (Partie 1), qui n'existait dans aucun document avant celui-ci. |
| 📄 "Une variable isolée ne valide jamais seule une hypothèse" | ✅ Oui | Le passage à **Retenue** exige la convergence diagnostique définie par `CLI###` (≥2 dans 7 qualités sur 8 actives) — Suspectée n'est jamais confondue avec Retenue. |
| 📄 Séparation diagnostique / confirmative / explicative | ✅ Oui | Préservée dans toutes les règles de la Partie 2 — aucune catégorie ne peut jouer le rôle d'une autre ; seule la catégorie diagnostique génère ou fait franchir le seuil. |
| 📄 Absence de pondération numérique | ✅ Oui | Toutes les règles de ce document sont des transitions d'état conditionnées par la **nature** des preuves convergentes, jamais par une somme, un score ou un poids. |
| 📄 "Renforcer" / "affaiblir" | ⚠️ Partiellement compatible | "Renforcer" est pleinement opérationnalisé (Faible→Modéré→Fort, Partie 2). **"Affaiblir" ne l'est pas** : aucune fiche `HYP_ARCHITECTURE_PHASE_C.md`, aucun `CLI###`, ne spécifie ce qu'une preuve normale-en-sens-favorable devrait faire à une hypothèse déjà Suspectée ou Retenue (cas Puissance de la Partie 3). Ce document choisit un traitement neutre par défaut, **explicitement signalé comme un point à arbitrer, pas une conformité acquise.** |
| 📄 "Réfuter" | 🔴 Non opérationnalisé | Le verbe est nommé dans le principe fondateur et conservé comme état du cycle (Partie 1), mais **aucune des 8 qualités construites en Phase C ne porte de condition de rejet formalisée par Vierge_7.** C'est la contradiction la plus significative révélée par ce document : le vocabulaire validé le 07/08 prévoit un comportement que le corpus clinique source (Vierge_7) ne permet, à ce jour, d'implémenter pour aucune qualité. **Signalé au praticien conformément à `CLAUDE.md` — non résolu silencieusement.** |

## Contradiction complémentaire, non demandée explicitement mais découverte en construisant ce document

🔧 Le système de support Fort/Modéré/Faible (validé le 07/08) et les seuils binaires `CLI###`
(validés par Vierge_7, gel Phase B/C) ont été conçus et validés **séparément**, à des moments
différents du chantier, sans jamais être mis en regard l'un de l'autre jusqu'à cette Phase E. Leur
articulation (Partie 5, "faut-il une HYP confirmée") n'a jamais été spécifiée : aujourd'hui, une
hypothèse Faible et une hypothèse Fort déclenchent la même orientation, de la même façon. Ce n'est
pas une erreur de ce document ni de Phase C — c'est un angle mort qui n'existait pas tant que les
deux pièces n'avaient pas été assemblées.

---

# Livrable final

## 1. Moteur d'inférence théorique — résumé
Cycle à quatre états (Absente / Suspectée / Retenue[Faible|Modéré|Fort] / Réfutée), gouverné par
une hiérarchie stricte de preuves (diagnostique = seule catégorie génératrice et seuil-franchissante ;
confirmative et explicative = graduantes uniquement), sans pondération numérique à aucune étape.

## 2. Règles de transition entre états

| Transition | Condition |
|---|---|
| Absente → Suspectée | 📄🔧 ≥1 variable diagnostique déficitaire (toute qualité sauf Mobilité, qui saute directement à Retenue). |
| Suspectée → Retenue/Faible | 📄 Seuil de convergence diagnostique `CLI###` atteint (≥2 preuves déficitaires pour 7 qualités ; ≥1 pour Mobilité). |
| Retenue/Faible → Retenue/Modéré | 📄 ≥1 preuve confirmative convergente. |
| Retenue/Modéré → Retenue/Fort | 📄 ≥1 preuve explicative (physio ou biomécanique) convergente, en plus de la confirmative. *(Plafonnée à Modéré pour Explosivité — Partie 6.)* |
| N'importe quel état → Réfutée | 🔴 Non spécifiée par Vierge_7 pour les 8 qualités actives — état théoriquement présent, structurellement inatteignable aujourd'hui. |
| Retenue → aucune `CLI###` | 🔧 État toléré, pas une erreur (cas Landing/Stabilisation, Partie 6). |

## 3. Points restant à arbitrer avant toute implémentation

1. **Mécanisme d'affaiblissement** — une preuve confirmative ou explicative normale doit-elle
   affaiblir une hypothèse Suspectée/Retenue, ou rester neutre (traitement par défaut retenu ici) ?
2. **Mécanisme de réfutation** — Vierge_7 doit-il être enrichi de conditions de rejet explicites
   par qualité, ou "réfuter" reste-t-il un état théorique non instancié pour ce référentiel ?
3. **"Deux preuves" — même test ou tests différents ?** Ambiguïté déjà relevée en Phase D pour
   Absorption, généralisable à toute qualité dont le diagnostic regroupe plusieurs tests.
4. **Transmission du support (Faible/Modéré/Fort) à la couche `CLI###`** — comme métadonnée
   d'affichage, sans modifier le seuil de déclenchement lui-même ?
5. **Confirmation de l'exception Mobilité** — cycle à deux états au lieu de quatre, jugé cohérent
   ici avec la règle de fond de la qualité, mais jamais formellement validé par le praticien.
6. **Confirmation du plafonnement Explosivité** — Retenue/Modéré comme maximum tant que le RFD
   fenêtré n'est pas mesuré, une construction de ce document sans équivalent écrit dans Vierge_7.

## 4. Recommandation de maturité par HYP (pour la couche moteur d'inférence, distincte de la grille "prêt pour implémentation" de la Phase D)

| HYP_ID | Le cycle d'états s'applique-t-il proprement ? | Réserve principale |
|---|---|---|
| `HYP-FOR-01` | 🟢 Oui, sans adaptation | Aucune — cycle à 4 états standard, y compris la déclinaison segmentaire (Partie 5). |
| `HYP-PUI-01` | 🟢 Oui, sans adaptation | Le cas "confirmative normale + diagnostique déficitaire" (Partie 3) reste ouvert, mais n'empêche pas le cycle de fonctionner en l'état. |
| `HYP-REA-01` | 🟢 Oui, sans adaptation | Aucune. |
| `HYP-EXP-01` | 🟡 Oui, avec adaptation | Nécessite le plafonnement de support proposé en Partie 6 (point 6 ci-dessus) — sans lui, le cycle laisserait croire à une confiance non atteignable. |
| `HYP-ABS-01` | 🟡 Oui, avec clarification | Nécessite la clarification "même test / tests différents" (point 3) pour que le passage Suspectée→Retenue soit sans ambiguïté. |
| `HYP-STAB-01` | 🟡 Oui, avec tolérance explicite | Nécessite que le modèle admette l'état "Retenue sans `CLI###`" (Partie 6) — sinon le cycle produirait une incohérence silencieuse déjà démontrée en Phase D. |
| `HYP-END-01` | 🟢 Oui, sans adaptation | Aucune. |
| `HYP-MOB-01` | 🟡 Oui, avec dégénérescence assumée | Nécessite la confirmation du cycle à deux états (point 5) — le cycle général reste cohérent, mais sous une forme réduite propre à cette qualité. |

**Aucune implémentation n'est proposée ici.** Ce document construit le raisonnement ; les 6 points
de la section 3 sont soumis au praticien avant toute Phase F.

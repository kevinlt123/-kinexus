# Audit final clinique de Kinexus V1 — « comme le praticien »

Audit exclusivement en lecture — **aucun fichier de production n'a été modifié pendant cet audit.**
Seul ce document a été créé. HYP, CSM, TFM, seuils, normes, relations, convergence, `priorities` et
`statusPriorityRank()` n'ont pas été touchés.

Méthode : (1) parcours réel dans le navigateur (Playwright + serveur local, même méthode que les
missions précédentes) avec un bilan riche construit sur des données **réellement classifiables**
dans l'application telle qu'elle est déployée aujourd'hui (voir §0) ; (2) génération réelle du PDF
(sportif et expert) à partir du même bilan ; (3) vérification empirique de chacun des 8 moteurs HYP
via `computeMoteur()` réel (pas de seuil simulé/`monkeypatché`) ; (4) lecture du code source des 8
moteurs HYP et de HYP-CSM-01 pour confirmer chaque constat par la règle qui le produit.

---

## 0. Préalable méthodologique — un constat qui conditionne tout le reste

Avant même d'auditer le rendu, il a fallu déterminer quelles données permettent réellement à
chaque qualité d'atteindre un état confirmé dans l'application déployée aujourd'hui — **par
opposition** aux données synthétiques utilisées dans les missions précédentes (`FIX_PRIORITIES_
STATUS_RANKING.md`, `AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md`), qui simulaient un statut « rouge »
pour Force via l'IMTP en modifiant temporairement `THRESHOLDS.imtp_n` dans le test — une valeur qui
**n'existe nulle part dans `index.html` réel** (`imtp_n`/`slimtp_n` : aucun seuil, ni `NORMS` ni
`THRESHOLDS`, confirmé programmatiquement, cf. `INVENTAIRE_COMPLET_VARIABLES_NORMEES.md` et
vérification refaite pour cet audit). Ce n'était pas une erreur des missions précédentes — leur
objet (bug de tri, rendu) ne dépendait pas de la qualité utilisée pour produire un « rouge » — mais
cela signifie que ces missions n'ont jamais fait la preuve qu'un praticien réel peut obtenir ce
statut avec les données que l'application accepte réellement. Cet audit corrige cet angle mort en
vérifiant, moteur par moteur, quelles combinaisons sont **réellement atteignables** (§4).

---

## 1. Parcours praticien réel

Parcours simulé : connexion démo → création d'une sportive (« Marie Curie », Basketball, population
de référence « Basketball — Homme NCAA 2024/25 », 26 ans) → bilan Performance → saisie de tests
réellement normés pour cette population/ces seuils (CMJ, Landing Unilatéral, Land and Hold, Drop
Jump, Single Leg Drop Jump, WBLT, Isometric Belt Squat, Heel Raise, Single Leg Jump) → Analyser →
tableau de bord → onglets Expert (Fonctions, Synthèse clinique, Hypothèses) → PDF.

**Ce qu'on comprend immédiatement (section 01 · Synthèse globale, capture `aud_02_analyse_top.png`)** :
Retour au sport 100 % « Prêt », Risque global « Élevé », Priorité principale « Cheville ». **Ce qui
manque** : aucune indication, à ce stade, que 4 des 8 qualités ne seront jamais déterminables avec
les tests actuellement supportés (voir §4) — le praticien ne le découvre qu'en descendant jusqu'à
l'onglet Synthèse clinique. **Ce qui est ambigu** : « Priorité principale : Cheville » désigne une
*structure anatomique*, alors que le reste du système (HYP, CSM, les 8 qualités) raisonne en
*qualités fonctionnelles* — la cheville n'est un résultat que d'un seul test (WBLT → Mobilité) parmi
9 saisis, présentée pourtant comme LA priorité, avant même que le praticien n'ait vu la moindre
qualité. **Ce qui pourrait être mal interprété** : voir §13 (Hypothèses) et §8 (priorités) — la
« Priorité principale » et les « Priorités d'intervention » numérotées (1/2/3) affirment une
hiérarchie explicite, que CSM refuse explicitement de déterminer (§7 de ses limites : *« CSM ne
détermine jamais une cause principale, une hiérarchie entre déficits [...] ni priorité
thérapeutique »*). Ces deux affirmations, à quelques centimètres l'une de l'autre dans la même
application, se contredisent.

---

## 2. Test « 10 secondes »

En 10 secondes sur la page d'analyse (section 01 + panneau « Qualités fonctionnelles ») : le
praticien identifie correctement (barres rouges "Critique") Mobilité, Réactivité, Stabilisation
comme déficitaires. Il voit aussi Contrôle Frontal (orange, « Déficitaire ») et Endurance (jaune,
« À surveiller ») — deux nuances utiles. **Il NE PEUT PAS**, en 10 secondes, savoir que Force,
Puissance, Absorption et Explosivité sont *non déterminables* plutôt que *normales* : leurs barres
sont vides, sans étiquette, visuellement indiscernables d'une qualité qui serait simplement basse
sur l'échelle — seul un examen attentif (aucune barre colorée, aucun texte) permet de le déduire.
**Il NE PEUT PAS** identifier si des déficits sont concordants ou s'il existe une relation
explicative — cette information n'existe que dans l'onglet Synthèse clinique, à un clic de plus (~2e
niveau, cohérent avec la Partie 3 de la mission, mais alors la promesse « en 10 secondes » du
panneau du haut est partiellement fausse : il affiche une « Priorité principale » unique sans
signaler qu'elle contredit ce que la Synthèse clinique dira ensuite).

**Pourquoi ce n'est pas totalement possible** : le panneau « Qualités fonctionnelles » encode
*statut* (rouge/orange/jaune/vide) mais pas *déterminabilité* — une barre vide peut vouloir dire
« non testé », « non déterminable malgré des données saisies » ou « qualité non couverte par un
moteur HYP » (Contrôle Sensoriel). Les trois cas sont visuellement identiques.

---

## 3. Test « 30 secondes »

Depuis l'onglet Synthèse clinique (~+15 s), le praticien obtient : *pourquoi* (badges de statut +
phrase « Un déficit est objectivé pour... », vocabulaire clinique propre depuis
`AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md`), *quelles données soutiennent le diagnostic* (le libellé
« Confirmé — support faible » signale un niveau de preuve, mais sans détail des variables — il faut
descendre à l'onglet Fonctions pour voir les tests utilisés), *ce qui est seulement explicatif*
(bloc « Relations explicatives possibles » séparé, correctement hedgé : *« hypothèse explicative
possible [...] sans en établir la cause »*), *les limitations* (bloc dédié, honnête). La descente à 4
niveaux (Synthèse → Qualité → Sous-domaine → Variable/Test) fonctionne réellement dans l'onglet
Fonctions puis Résultats/Variables — **mais uniquement pour les qualités objectivées ou non
déterminables** : une qualité `suspectée` (Endurance dans notre scénario) n'a **aucune entrée** au
Niveau 1 (Synthèse clinique) pour amorcer cette descente — voir §5/§22 finding CRITIQUE.

---

## 4. HYP — vérité diagnostique (constat central de cet audit)

Vérifié pour les 8 moteurs, par lecture de code (chaque moteur documente sa propre couverture de
seuils dans son commentaire d'en-tête, avant tout raisonnement) et par exécution réelle
(`computeMoteur()`, données ci-dessous, aucun seuil simulé) :

| Qualité | Règle de convergence | Variables réellement classifiables aujourd'hui | Meilleur état atteignable, quelles que soient les données saisies |
|---|---|---|---|
| **Mobilité** | 1 mécanisme (`wblt_distance`) | 1/1 — toujours (THRESHOLDS universel) | `retenue_faible` (plein) |
| **Réactivité** | 2 mécanismes (`dj_rsi`, `sldj_rsi`) | 2/2 — toujours (THRESHOLDS universel) | `retenue_faible` (plafonné, aucune confirmative/explicative normée) |
| **Absorption** | 2 candidats Core (`cmj_braking_rfd`, `cmj_force_zero_vel`) | 2/2 — si population NORMS couvrante (7 pop. dont bball2425_*, foot_f_*) | `retenue_faible` (population-dépendant) |
| **Stabilisation** | ≥2 des 6 mécanismes | 2/6 (`landing_uni_tts`, `landing_bi_tts` — THRESHOLDS universel) | `retenue_faible` (seule la « famille Landing » est opérationnelle ; SLS/EO/EF/Strobo restent 100 % non classifiables) |
| **Force** | ≥2 des 4 preuves globales | 2/4 en théorie, **0 population NORMS ne couvre `iso_belt_squat_n` ET `sl_iso_push_n` simultanément** (confirmé, limitation auto-documentée dans le code) | **`suspectee` (jaune) au mieux — jamais `retenue`, quelle que soit la population choisie** |
| **Puissance** | 2/2 strict (`cmj_peak_power` ET `slcmj_peak_power`) | `slcmj_peak_power` : **aucun seuil nulle part**, aucun substitut normé | **`non_determinable` — TOUJOURS, quelles que soient les données** |
| **Explosivité** | 2/2 strict (`cmj_conc_rfd` ET `cmj_conc_impulse_100`) | **Aucune des deux : aucun seuil nulle part** | **`non_determinable` — TOUJOURS, quelles que soient les données** |
| **Endurance** | ≥2 des 6 mécanismes | 1/6 (`heel_raise_reps` seul — les 5 mécanismes `repeated_hop` : aucun seuil) | **`suspectee` (jaune) au mieux — jamais `retenue`, quelles que soient les données** |

**Constat vérifié empiriquement** (extraits, données réelles, sans population truquée) :

```
cmj_peak_power = 25 (très inférieur à la borne basse de la population NCAA 2024/25, 47.1)
  → functionScores.Puissance.status = null, hypPui01.state = 'non_determinable'
    (malgré un signal cmj clairement rouge)

iso_belt_squat_n = 500 + sl_iso_push_nkg = 0.5, population générale par âge
  → functionScores.Force.status = 'jaune', hypFor01.state = 'suspectee'
    (jamais 'retenue' : sl_iso_push_N — la variable diagnostique, pas nkg — n'est
    couverte par NORMS que pour 3 populations football, qu'aucune population ne
    partage avec les 15 populations couvrant iso_belt_squat_n)
```

**Aucune information UI/PDF ne contredit le moteur** dans le sens où le rendu n'invente jamais un
statut que le moteur n'a pas produit — le badge, la couleur, le texte de chaque qualité *objectivée*
sont fidèles à `functionScores[qualité].status`/`.hypXxx01.state`, vérifié pour les 4 qualités
objectivées de notre scénario (Mobilité/Réactivité/Absorption/Stabilisation). En revanche, voir §22
finding n°1 : **l'application ne dit jamais explicitement au praticien que 4 qualités sur 8 sont
structurellement bloquées** — il le découvre uniquement en constatant, bilan après bilan, qu'elles
restent invariablement grises.

---

## 5. Non déterminable

Testé : Force sans normes IMTP/SLIMTP (rouge foncé confirmé — toujours `non_determinable`, §4) ;
Puissance sans seconde preuve normée (`non_determinable`, §4) ; Explosivité sans normes
(`non_determinable`, §4) ; Stabilisation avec données insuffisantes (SLS/EO/EF/Strobo saisis sans
seuil → n'affectent jamais le résultat, restent `indisponible`, jamais interprétés comme normaux —
vérifié dans `hypSta01.diagnostic.sls.status === 'indisponible'`) ; Endurance sans normes Repeated
Hop (`suspectee`, jamais `retenue`, §4).

**Dans tous les cas testés, non déterminable n'est jamais présenté comme normal, bon, déficitaire ou
prioritaire** — la Synthèse clinique dit explicitement *« non déterminable n'équivaut jamais à
normal »* et liste ces qualités séparément, avec un badge gris neutre distinct des badges de statut
colorés. La formulation est immédiatement compréhensible.

**Découverte non anticipée par la mission mais directement liée à cette question — CRITIQUE** :
l'état intermédiaire **`suspectee`** (preuve partielle — ex. Endurance avec un seul mécanisme sur
deux confirmé) n'est **ni présenté comme déterminable, ni comme non déterminable : il est absent de
la Synthèse clinique.** Preuve directe (`csmIsObjectified`/`csmIsNonDeterminable`, `index.html`
lignes 5576-5583, et construction de `objectified`/`nonDeterminable` lignes 5705-5711) :

```
csm.objectified      = ['Mobilité','Réactivité','Absorption','Stabilisation']
csm.nonDeterminable  = ['Force','Puissance','Explosivité']
csm.suspected        = [{quality:'Endurance', state:'suspectee'}]   ← jamais lu par l'UI ni le PDF
```

`csm.suspected` existe dans la structure de données (CSM ne perd pas l'information) mais n'est lu
nulle part dans l'onglet « Synthèse clinique » ni dans les sections « Synthèse clinique » des deux
PDF (`buildSportifReport`/`buildExpertReport` — vérifié par lecture de code : ces fonctions ne
référencent que `.objectified`/`.nonDeterminable`/`.explanatoryHypotheses`/`.relationships`, jamais
`.suspected`). Confirmé dans le PDF réellement généré pour ce scénario : le mot « Endurance »
n'apparaît nulle part dans la section Synthèse clinique du PDF, alors qu'il apparaît (« À
surveiller ») dans le tableau « Qualités fonctionnelles » de la même page et dans l'onglet
« Fonctions » de l'UI. Un praticien qui ne lit que la Synthèse clinique (UI ou PDF) ignorera qu'
Endurance présente un signal partiel réel. Classé CRITIQUE en §22.

---

## 6. Relations

Quatre cas testés (via le scénario riche + lecture de `HYP_QUALITY_RELATIONS`/`csmRelationshipNarrative`) :

**A. Deux qualités déficitaires sans relation documentée** — Réactivité + Absorption (aucune paire
`HYP_QUALITY_RELATIONS` connue) : rendu comme *concordance*, texte neutre : *« Les déficits de
Réactivité et de Absorption sont concomitants, mais les données actuellement disponibles ne
permettent pas d'identifier une relation explicative documentée entre eux. »* Aucune causalité
suggérée. ✅

**B. Deux qualités déficitaires avec relation documentée** — Mobilité → Stabilisation
(`wblt_distance`, relation `HYP-STA-01`) : rendu comme *hypothèse explicative*, texte :
*« Le déficit de Mobilité constitue une hypothèse explicative possible du déficit de Stabilisation
(wblt_distance [...]), sans en établir la cause. »* Formulation exemplaire — jamais « cause »,
jamais « explique » sans réserve. ✅

**C. Une qualité déficitaire + une qualité non déterminable** — Mobilité (objectivée) + Force (non
déterminable) : aucune relation générée (la relation `explanatory_hypothesis` exige les DEUX
qualités objectivées ; le niveau bascule à `not_applicable_non_determinable` avec un texte dédié :
*« La contribution de [...] ne peut pas être déterminée avec les données actuellement
classifiables. »*). ✅ conforme.

**D. Qualité TFM déficitaire mais HYP non déterminable** — Contrôle Frontal (orange, TFM
seulement, pas de moteur HYP) : absent de CSM par construction (limite explicite n°3 : *« Les
qualités non couvertes par un moteur HYP [...] ne sont pas synthétisées ici »*). Correct au sens
strict de CSM, mais Contrôle Frontal reste visible et « Déficitaire » ailleurs (dashboard,
onglet Hypothèses/Orientations) sans jamais être mis en regard des 8 qualités HYP dans la Synthèse
clinique — un praticien pressé peut légitimement se demander pourquoi une qualité orange n'apparaît
jamais dans la synthèse. Comportement documenté et volontaire (pas un bug), mais mériterait une
phrase explicite dans la Synthèse clinique elle-même plutôt que dans le seul texte des limites déjà
dense.

**Dans les 4 cas, DÉFICIT ≠ CONCORDANCE ≠ RELATION EXPLICATIVE ≠ CAUSALITÉ sont bien distingués** —
recherche ciblée du mot « cause » utilisé comme verbe direct (« X cause Y ») dans le PDF généré :
aucune occurrence. La seule occurrence du mot « cause » est *« sans en établir la cause »* — la
négation explicite de la causalité, exactement l'usage attendu.

---

## 7. Asymétries

Non re-testé en profondeur dans cette mission (déjà couvert et validé par
`AUDIT_COHERENCE_NARRATIVE_CSM_VS_LEGACY.md` §11, cas dédiés à l'asymétrie-modificateur). Confirmé
à nouveau ici en creux : dans le scénario riche, toutes les valeurs D/G saisies étaient identiques
(LSI 100 %) — le tableau « Asymétries majeures » du dashboard affiche bien des puces vertes (« LSI
100 % ») sans jamais élever un statut au rang de diagnostic à partir de la seule asymétrie, cohérent
avec la conclusion déjà établie : l'asymétrie reste un modificateur/une précision, jamais un
diagnostic autonome dans HYP/CSM.

---

## 8. Priorités

Testé (cf. `FIX_PRIORITIES_STATUS_RANKING.md` pour les 8 cas numérotés déjà couverts + revérification
sur ce scénario) : `priorities` = `['Mobilité:rouge','Réactivité:rouge','Absorption:rouge']` — ROUGE
avant ORANGE avant AUTRE respecté (Contrôle Frontal, orange, n'apparaît pas dans le top). ✅ le bug
corrigé en Mission B tient.

**Mais un problème distinct, non couvert par la Mission B, demeure** — CRITIQUE/IMPORTANT :
`priorities` (et le panneau dashboard qui en découle : « Priorité principale », « Priorités
d'intervention » n°1/2/3) **hiérarchise explicitement** des qualités que CSM, à quelques clics de
là, refuse explicitement de hiérarchiser (*« CSM ne détermine jamais [...] une hiérarchie entre
déficits [...] ni priorité thérapeutique »*). Dans notre scénario, trois qualités sont TOUTES
« rouge » (Mobilité, Réactivité, Stabilisation) avec un support de preuve strictement identique
(« support faible » partout) — `priorities` les numérote pourtant 1/2/3 avec des libellés « Impact :
Élevé » / « Urgence : Élevée/Moyenne » qui suggèrent un raisonnement gradué inexistant dans les
données (les trois moteurs HYP ne produisent aucune notion d'urgence ni d'impact comparatif). Ce
n'est pas le bug de tri (corrigé) : c'est la question de fond que la Mission B, à raison, n'avait
pas pour mandat de traiter (« ne pas inventer de nouveau mécanisme de départage ») — mais qui reste
un residual à documenter : **une information TFM/legacy secondaire (`impact`/`urgence`, jamais issus
de HYP) peut être lue par le praticien comme plus certaine qu'un déficit HYP objectivé**, simplement
parce qu'elle s'affiche en premier, avec des chiffres et un rang.

---

## 9. Rapport PDF — lecture en professionnel extérieur

PDF sportif généré pour le scénario riche (`aud_pdf_sportif.html`, capture équivalente à
`crop1_v2.png`/`csm_rich_pdf_full_v2.png` de la mission précédente, revérifié pour ce scénario).

**Première impression** : professionnelle, sobre, cohérente avec l'identité Kinexus. **Profil
global** : clair (RTP, risque, priorité). **Synthèse** : lisible, vocabulaire clinique propre depuis
la Mission d'optimisation (badges, phrase de déficits, sections séparées relations/concordances).
**Priorités** : présentes, mais héritent du problème de hiérarchie de §8. **Détails** : complets,
KPI par KPI. **Cohérence des formulations** : bonne à l'intérieur de la section Synthèse clinique ;
**mauvaise entre sections** — la section « Priorité principale »/« Chaîne causale principale »
(légataire) utilise un registre de certitude (« Le déficit de réactivité observé semble
principalement influencé par... ») que la section Synthèse clinique, plus bas dans le même document,
contredit frontalement en refusant toute causalité (§13). **Lisibilité** : bonne, densité
raisonnable, pas de sur-longueur. **Utilité clinique** : réelle, mais amoindrie par la
contradiction interne et par l'absence totale d'Endurance dans la Synthèse clinique (§5).

**Réponse honnête à la question centrale** — *« Pourrais-je transmettre ce PDF à un médecin, un
entraîneur ou un sportif sans devoir expliquer comment Kinexus fonctionne ? »* : **Non, pas sans
réserve.** Le document contient deux voix qui ne racontent pas rigoureusement la même histoire (la
voix « Chaîne causale/Hypothèses », confiante et causale ; la voix « Synthèse clinique », prudente
et non causale) sur les MÊMES qualités (Réactivité, Stabilisation). Un lecteur externe n'a aucun
moyen de savoir laquelle des deux fait foi — ni que la première n'est pas dérivée des données
réellement mesurées (§13).

---

## 10. UI

Même audit réalisé en direct dans le navigateur (§1-§6). **Comparaison UI vs PDF sur ce scénario** :
même diagnostic (Mobilité/Réactivité/Stabilisation/Absorption objectivées, Force/Puissance/
Explosivité non déterminables, Endurance ni l'un ni l'autre — identique dans les deux) ; même
distinction concordance/relation explicative (vérifié texte pour texte, identique) ; même gestion du
non_determinable (identique, y compris le même angle mort sur `suspectee`, §5). **La présentation
diffère (attendu), le sens clinique ne diffère pas entre UI et PDF** pour tout ce que la Synthèse
clinique couvre effectivement — la réserve de §5/§9 s'applique identiquement aux deux supports, ce
qui est au moins cohérent (le bug est reproduit à l'identique, pas alourdi par le PDF).

---

## 11. Cohérence des 8 qualités

| Qualité | Diagnostic compréhensible | Variables visibles | Explication | Non déterminable clair | Relations | Cohérence UI/PDF |
|---|---|---|---|---|---|---|
| Mobilité | Oui | Oui (1 test) | Couche explicative nulle par construction (aucune variable documentée au-delà de WBLT) — visible et assumé, pas un bug | Oui (rare, cas ADR-005 : jamais suspectée) | Oui (source de la relation Mobilité→Stabilisation) | Oui |
| Réactivité | Oui | Oui (2 tests) | Support plafonné « faible » (aucune confirmative normée) — visible, assumé | Oui | Oui (concordances) | Oui |
| Absorption | Oui, mais dépend fortement de la population choisie | Oui (1 test, 2 KPI) | Sous-domaine « Réception/Impact » non implémenté (annoncé) | Oui | Oui (concordances) | Oui |
| Stabilisation | Oui, mais seule la « famille Landing » (2/6 mécanismes prévus) fonctionne — écart documenté avec la fiche clinique d'origine (CLI070/SLS), assumé dans le code, pas exposé au praticien | Oui pour Landing ; SLS/EO/EF/Strobo saisissables mais inertes | Oui (Mobilité→Stabilisation) | Oui | Oui | Oui |
| Force | **Toujours plafonné à `suspectee`, jamais confirmé** | Oui, mais 2 des 4 variables diagnostiques ne seront jamais classifiables | Oui | Oui (message clair) | Non testable (jamais objectivée) | Oui (mais toujours « non déterminable » ou « jaune », jamais « rouge ») |
| Puissance | **Toujours `non_determinable`, quelle que soit la donnée** | 1/2 seulement jamais classifiable | Oui, note explicite sur le blocage | Oui (message clair) | Non testable | Oui (toujours grisée) |
| Explosivité | **Toujours `non_determinable`** — la qualité la plus bloquée du système (0/2 variables diagnostiques normées) | Aucune des 2 variables diagnostiques classifiable | Oui, note explicite | Oui (message clair) | Non testable | Oui (toujours grisée) |
| Endurance | Plafonné à `suspectee` | 1/6 seulement | Oui | **Non — invisible dans la Synthèse clinique (§5, CRITIQUE)** | Non testable (jamais objectivée dans notre scénario) | **Non — visible dans « Fonctions »/dashboard, absente de « Synthèse clinique »** |

Constat explicite, sans chercher à uniformiser artificiellement : la moitié des qualités (Mobilité,
Réactivité, Absorption, Stabilisation) fonctionne bien pour un praticien qui saisit des données
réelles ; l'autre moitié (Force, Puissance, Explosivité, Endurance) ne pourra, dans l'état actuel des
seuils implémentés, **jamais atteindre l'état « confirmé »** — un fait honnêtement assumé par le code
lui-même (chaque moteur documente sa propre limite) mais **jamais communiqué au praticien** dans
l'UI ou le PDF.

---

## 12. Dix profils patients synthétiques

Construits analytiquement à partir de la matrice §4 (chaque combinaison a été vérifiée soit
directement par `computeMoteur()` dans cet audit, soit dans les missions précédentes citées).

**Profil 1 — Tout normal.** Toutes les variables classifiables saisies au-dessus du seuil vert.
HYP : 8/8 `absente` (ou `non_determinable` pour Puissance/Explosivité — même avec des données
excellentes, ces deux qualités resteront non déterminables, jamais confirmées « normales » via HYP).
CSM : `objectified=[]`, `nonDeterminable=['Puissance','Explosivité']` au minimum. UI/PDF : cohérents.
Interprétation praticien : correcte si attentive, mais risque réel de lire « tout est vide/gris » =
« tout va bien », alors que 2 qualités n'ont simplement pas pu être évaluées.

**Profil 2 — Force déficitaire seule.** Impossible d'obtenir `retenue_faible` pour Force seule
(§4) : au mieux `suspectee` (jaune), jamais rouge. CSM ne l'objective jamais. **Ambiguïté forte** :
un praticien qui saisit un IMTP franchement pathologique (le test le plus utilisé cliniquement pour
la Force) ne verra JAMAIS Kinexus confirmer un déficit de Force à partir de ce test, quelle que soit
la sévérité — IMTP n'a aucun seuil implémenté.

**Profil 3 — Puissance + Explosivité déficitaires.** Impossible par construction (§4) : les deux
qualités restent `non_determinable` quelles que soient les données. CSM : `nonDeterminable=
['Puissance','Explosivité']`, jamais `objectified`. Le profil demandé par la mission **ne peut
exister** dans Kinexus V1 — c'est en soi le résultat de l'audit pour ce profil.

**Profil 4 — Force + Puissance + Stabilisation déficitaires.** Stabilisation atteignable (rouge, via
Landing) ; Force plafonne à jaune ; Puissance reste grise. Résultat réel : 1 qualité rouge
(Stabilisation), 1 jaune (Force), 1 grise (Puissance) — pas « 3 déficits » au sens de CSM. C'est
notre scénario riche §1-§10, moins Mobilité/Réactivité/Absorption.

**Profil 5 — Absorption + Réactivité déficitaires.** Atteignable si population NORMS couvrant
Absorption est choisie (ex. bball2425_ncaa_m). Les deux atteignent `retenue_faible`. CSM les relie
en concordance (aucune relation documentée entre elles dans `HYP_QUALITY_RELATIONS`, vérifié).
Rendu propre, cas B/A des relations testées en §6.

**Profil 6 — Mobilité + Force déficitaires.** Mobilité atteint rouge facilement ; Force plafonne à
jaune (§4) — impossible d'obtenir « Mobilité + Force toutes deux rouges ». `HYP_QUALITY_RELATIONS`
documente une relation Mobilité→Stabilisation, pas Mobilité→Force : donc même si Force atteignait
`retenue`, aucune relation explicative ne serait générée entre elles — concordance neutre seulement.

**Profil 7 — Endurance seule déficitaire.** Meilleur cas atteignable : `suspectee` (heel_raise seul).
**C'est exactement le scénario qui révèle le finding CRITIQUE de §5** : Endurance n'apparaît dans
aucune des deux listes de la Synthèse clinique — un praticien testant CE profil verrait une Synthèse
clinique qui dit essentiellement « rien à signaler » (`objectified=[]`, `nonDeterminable=[]` si
Endurance est la seule qualité testée), alors que le patient a un déficit réel (< seuil orange) sur
le seul test saisi. C'est le profil le plus trompeur des dix.

**Profil 8 — Nombreuses qualités non déterminables.** Trivial à obtenir (il suffit de peu saisir, ou
de saisir Puissance/Explosivité qui le sont structurellement). Rendu correct : liste claire, jamais
interprété comme normal.

**Profil 9 — Plusieurs déficits avec relations HYP autorisées.** Notre scénario riche (Mobilité +
Stabilisation, relation documentée). Rendu exemplaire, séparation nette relation/concordance (§6).

**Profil 10 — TFM riche mais peu de diagnostics HYP déterminables.** Facilement atteignable en
saisissant beaucoup de tests segmentaires/RFD/TTPF (aucun n'a de seuil, §4/Inventaire) : le praticien
peut remplir des dizaines de champs, voir des cartes TFM riches dans les onglets Fonctions/
Systèmes/Raisonnement (poids, contributions, spécificité), sans qu'un seul octet de cette richesse
n'influence jamais la Synthèse clinique HYP — comportement voulu et documenté (VAR_REL3/TFM =
information secondaire, jamais diagnostique) mais un praticien peu familier du modèle pourrait
raisonnablement s'attendre à ce que « plus de données » signifie « diagnostic plus précis », ce qui
n'est vrai qu'à l'intérieur des 39 variables réellement normées.

---

## 13. Recherche des « fausses certitudes »

Recherche ciblée de « cause », « responsable », « explique », « principal », « déficit confirmé »,
« influencé par » dans le rendu (UI capturé + PDF généré).

- **CSM (Synthèse clinique, UI et PDF)** : usage rigoureux — « cause » n'apparaît que niée (« sans en
  établir la cause ») ; « confirmé » n'apparaît que comme état vérifiable (« Confirmé — support
  faible », toujours accompagné du niveau de preuve) ; aucune occurrence de « responsable »,
  « explique » (sans réserve) ou « principal ». ✅
- **Onglet « Hypothèses » (mécanisme légataire, `pri`/`p.hypothese`, `index.html:8543`) — CRITIQUE** :
  contient des phrases au registre de certitude bien plus fort, non hedgées, et **non dérivées des
  données mesurées dans le scénario** :
  - *« Le déficit de réactivité observé semble **principalement influencé par** une altération des
    propriétés élastiques du membre inférieur. »* — aucune variable « propriétés élastiques » n'est
    mesurée ni référencée par `HYP-REA-01` (qui ne lit que `dj_rsi`/`sldj_rsi`) ; phrase générique
    par qualité, pas générée à partir du raisonnement HYP réel.
  - *« Le déficit de stabilisation semble **influencé par** une altération du contrôle postural
    dynamique. »* — même défaut : générique, non dérivée de `landing_uni_tts`/`landing_bi_tts`
    (les deux seules preuves réellement utilisées par `HYP-STA-01`).
  - Ces deux phrases apparaissent aussi dans le PDF (`buildSportifReport`, confirmé : « influencé
    par » trouvé dans le PDF généré pour ce scénario).
  Un praticien qui ne consulte que cet onglet — toujours présent, adjacent à « Synthèse clinique »
  dans la même barre d'onglets — repart avec une histoire causale spécifique que ni les données ni
  CSM ne soutiennent.
- **« Priorité principale » / « Priorités d'intervention » (dashboard, §1/§8)** : n'emploie pas de
  mot interdit littéralement, mais la structure elle-même (une case, un nom, un rang 1/2/3) *est* une
  fausse certitude au sens de la mission — elle affirme une hiérarchie que le système, par ailleurs,
  déclare explicitement indéterminable.
- **« problème »/« anomalie »/« limitation »** : non trouvés utilisés de façon vague dans la Synthèse
  clinique (toujours rattachés à une qualité et un état précis) ; « limitation » n'apparaît que dans
  le bloc dédié « Limites de cette synthèse », correctement précis.

---

## 14. Recherche des « faux normaux »

Vérifié systématiquement pour Force/Puissance/Explosivité (les 3 qualités testées avec absence de
norme délibérée, §4/§5) : aucune des trois n'est jamais affichée comme « Optimal »/vert/« normal ».
Le statut reste `null`/gris, jamais transformé en positif par défaut — confirmé par lecture de code
(`hypStatusFromState` ne retourne un statut que pour les états `absente`/`suspectee`/`retenue_*`,
jamais pour `non_determinable`, qui garde `status:null` explicitement à chaque moteur) et par le
rendu réel (barres vides, jamais vertes). **Aucun faux normal trouvé.**

---

## 15. Recherche des « faux déficits »

Vérifié : TFM déficitaire mais HYP non déterminable (Contrôle Frontal, orange, cas D §6) ne génère
jamais de diagnostic HYP — Contrôle Frontal n'a pas de moteur HYP, reste dans son propre registre
(TFM), jamais mélangé aux 8 qualités de CSM. Variables explicatives/confirmatives déficitaires
(ex. `cmj_conc_rfd`/`cmj_conc_impulse_100` saisis à des valeurs extrêmes, §4) : confirmé qu'elles
**ne génèrent jamais** un diagnostic Explosivité — elles restent `indisponible` faute de seuil,
jamais transformées en évidence par leur seule valeur brute. Asymétries : voir §7, jamais
génératrices seules. **Aucun faux déficit trouvé** — le système est si prudent dans ce sens qu'il en
devient plutôt sous-diagnostique (§4) que sur-diagnostique.

---

## 16. Qualité des explications

| Qualité | Explique suffisamment le résultat ? |
|---|---|
| Mobilité | Oui |
| Réactivité | Partiellement — le score est expliqué (2 tests), mais l'onglet Hypothèses ajoute une explication non justifiée (§13) qui sème la confusion sur ce qui est réellement « expliqué » |
| Absorption | Oui |
| Stabilisation | Partiellement — même défaut qu'au-dessus (§13), et l'écart avec la fiche clinique d'origine (2/6 mécanismes seulement) n'est jamais communiqué au praticien |
| Force | Non — le praticien voit « suspectée » sans jamais comprendre qu'aucune saisie ne permettra d'aller plus loin (IMTP, le test qu'il utilisera le plus naturellement, ne compte jamais) |
| Puissance | Non — même défaut, en pire (jamais aucun état au-delà de non déterminable) |
| Explosivité | Non — idem, la qualité la plus opaque du système |
| Endurance | Non — invisible dans la Synthèse clinique (§5), seul un examen minutieux d'un autre onglet révèle un signal partiel |

**Besoin futur identifié, documenté ici sans modification des règles cliniques** (conformément à la
consigne de la Partie 16) : un message explicite, au niveau de chaque qualité structurellement
plafonnée (Force/Puissance/Explosivité/Endurance), du type *« Cette qualité ne peut pas encore être
confirmée avec les tests actuellement normés dans Kinexus — indépendamment des données saisies pour
ce patient »* permettrait de distinguer « ce patient manque de données » de « cette qualité n'est
pas encore opérationnelle dans le logiciel ». C'est une évolution de présentation (aucune règle
clinique nouvelle), mais elle touche à ce que le praticien peut légitimement conclure du silence de
l'application — elle est documentée ici, non implémentée, conformément au périmètre de cet audit.

---

## 17. Actionnabilité

Pour les qualités objectivées (Mobilité, Réactivité, Absorption, Stabilisation) : la chaîne
DIAGNOSTIC → COMPRÉHENSION → INVESTIGATION fonctionne (Synthèse → onglet Fonctions → tests
concernés listés avec leur poids). Aucune prescription thérapeutique n'est inventée — les
« Recommandations » du dashboard restent génériques par qualité (*« Améliorer la mobilité
fonctionnelle de cheville en chaîne fermée »*), pas des exercices spécifiques — conforme à la
consigne. **Pour les 4 qualités plafonnées (§4)**, la chaîne s'arrête net : le praticien sait qu'un
signal existe (Force « suspectée », par exemple) mais n'a **aucune indication de ce qu'il pourrait
investiguer de plus** — contrairement à un vrai « non déterminable par manque de données pour CE
patient » (qui inviterait à retester), c'est un plafond structurel qu'aucun nouveau test du
praticien ne débloquera. L'actionnabilité réelle serait : « ne comptez pas sur Kinexus pour confirmer
cette qualité aujourd'hui » — information absente du produit (cf. §16).

---

## 18. Design / Premium

Sans chercher à refaire le design (déjà audité et partiellement retravaillé dans
`AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md`) : le rendu reste professionnel, lisible, hiérarchisé,
crédible pour un usage clinique/sportif — cohérent avec le constat déjà établi. Seule amélioration à
réelle valeur clinique identifiée ici (pas esthétique) : un signal visuel distinct pour l'état
`suspectee` dans la Synthèse clinique elle-même (aujourd'hui, seul le panneau « Fonctions »/dashboard
le montre) — directement lié au finding CRITIQUE de §5, pas une préférence de design.

---

## 19. Bugs de rendu

Recherche active de `undefined`/`null`/`NaN`/enums internes/IDs techniques/anglais inattendu/
singulier-pluriel/contradictions UI-PDF/badges sans texte/couleurs incohérentes, sur les 8 qualités,
UI et PDF.

- **Aucune occurrence de « undefined » ou « NaN »** trouvée dans le rendu UI (captures) ni dans le
  PDF généré pour le scénario riche — confirmation directe que les deux correctifs de
  `AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md`/`IMPLEMENTATION_SYNTHESE_CLINIQUE_UI_PDF.md` (badge PDF
  sportif, table « Fonctions évaluées » PDF expert) tiennent en usage réel, pas seulement dans le
  scénario synthétique utilisé à l'époque.
- **Aucun enum interne** (`retenue_faible`, `non_determinable`, etc.) trouvé exposé tel quel — la
  traduction `CSM_STATE_LABEL` fonctionne partout où elle est utilisée.
- **Aucune contradiction UI/PDF** trouvée pour ce qui EST rendu par les deux (cf. §10) — la
  contradiction trouvée (§5, §13) est interne à chaque support pris séparément (entre ses propres
  sections), pas entre UI et PDF.
- **Un badge sans texte visuel n'a pas été trouvé**, mais un défaut apparenté existe : les qualités
  non déterminables affichent une barre de progression totalement vide et sans étiquette dans le
  panneau « Qualités fonctionnelles » (§2) — pas un « undefined », mais un vide non explicite qui
  peut se lire comme une absence d'information plutôt qu'un résultat.
- Aucune erreur de console JavaScript pendant tout le parcours (vérifié via l'écouteur d'erreurs
  Playwright — seules des erreurs réseau attendues liées au bac à sable, sans rapport avec
  l'application, ont été loguées).
- Pas de texte anglais inattendu ni de problème singulier/pluriel repéré dans les zones auditées.

---

## 20. Audit de la première page (PDF)

Page 1 du PDF sportif (identique en substance à la section « 01 · Synthèse globale » de l'UI) :
Profil, Retour au sport, Risque global, **Priorité principale (« Cheville »)**, badges des qualités
déficitaires, phrase de synthèse. **Si le praticien ne lit QUE cette page** : il comprend le profil
général et le niveau de risque, mais **hérite intégralement du problème de §1/§8/§13** — une
« priorité » nommée qui contredit la position de CSM sur la page suivante, sans qu'aucun signal ne
l'avertisse que cette première page dépend d'un mécanisme différent (legacy `priorities`) que la
Synthèse clinique qui suit. Informations qui devraient être immédiatement visibles et ne le sont
pas : la mention explicite qu'une ou plusieurs qualités restent structurellement non confirmables
(§4/§16) — actuellement invisible avant l'onglet/la section Synthèse clinique.

---

## 21. Ce qui n'a pas été modifié

Conformément à la mission : HYP (les 8 moteurs), CSM (`computeHypClinicalSynthesis01`), TFM, tous
les seuils/normes/relations/règles de convergence, `priorities`, `statusPriorityRank()` — **rien de
tout cela n'a été touché**. `git status`/`git diff` : vides pour `index.html` à l'issue de cet audit
(seul ce document a été créé). Chaque problème clinique identifié (§4, §5, §8, §13) est **documenté
ici uniquement**, jamais corrigé dans cette mission.

---

## 22. Problèmes classés

| # | Problème | Sévérité | Où | Action proposée |
|---|---|---|---|---|
| 1 | 4/8 qualités HYP (Force, Puissance, Explosivité, Endurance) ne peuvent structurellement jamais atteindre l'état confirmé, quelles que soient les données saisies — non communiqué au praticien | **CRITIQUE** | Moteurs HYP (seuils manquants) + absence de message dans l'UI/PDF | Corriger dans un prochain lot : ajouter un message explicite de plafond structurel par qualité (§16) — n'exige aucune modification des règles cliniques, uniquement de la présentation |
| 2 | L'état `suspectee` (preuve partielle) est absent de la Synthèse clinique (UI + PDF), alors que présent ailleurs (dashboard/Fonctions) — incohérence interne à l'application sur la même qualité | **CRITIQUE** | `index.html` (rendu Synthèse clinique UI + `buildSportifReport`/`buildExpertReport`), lit `csm.objectified`/`csm.nonDeterminable`, jamais `csm.suspected` | Corriger dans un prochain lot : ajouter un bloc « Qualités suspectées (preuve partielle) » lisant `csm.suspected`, strictement additif, aucune donnée CSM à recalculer |
| 3 | Onglet « Hypothèses » (légataire) utilise un vocabulaire causal confiant et générique, non dérivé des données, contredisant CSM sur les mêmes qualités — présent aussi dans le PDF | **CRITIQUE** | `index.html:8543` (`tab==='hypotheses'`), `p.hypothese`/texte narratif légataire | Signaler au praticien (CLAUDE.md : ne pas résoudre silencieusement) — proposer soit une révision du texte de `hypothese` pour aligner son registre sur CSM, soit un avertissement visuel que cet onglet est un mécanisme distinct et plus ancien |
| 4 | « Priorité principale »/« Priorités d'intervention » (dashboard, legacy `priorities`) affirment une hiérarchie que CSM refuse explicitement de déterminer | **IMPORTANTE** | `index.html` (section « 01 · Synthèse globale », `pri[0]`) | Signaler au praticien — proposer une reformulation moins catégorique (« Piste prioritaire suggérée » plutôt que « Priorité principale ») ou un renvoi explicite vers la Synthèse clinique |
| 5 | Contrôle Frontal (TFM seul) déficitaire n'est jamais mis en regard des 8 qualités HYP dans la Synthèse clinique, sans explication visible à cet endroit précis | **MINEURE** | Comportement voulu, déjà documenté dans les limites CSM, mais pas assez visible | Envisager une phrase courte et visible (pas seulement dans le bloc limites) |
| 6 | Panneau « Qualités fonctionnelles » : barre vide pour non-déterminable visuellement proche d'une absence d'information | **MINEURE** | `index.html:7971-7979` | Envisager une étiquette neutre explicite (« Non déterminable ») plutôt qu'une barre vide sans texte |
| 7 | Écart documenté (mais non exposé) entre la fiche clinique d'origine de Stabilisation (SLS/EO/EF/Strobo attendus) et son implémentation réelle (Landing seul) | **MINEURE** | `HYP-STA-01`, déjà auto-documenté dans le code | Aucune action requise à court terme — déjà transparent dans le code, juste pas dans l'UI |

---

## 23. Recommandations

- Corriger en priorité (prochain lot, présentation uniquement, zéro impact sur le raisonnement) :
  #1 et #2 — les deux sont des additions pures de présentation lisant des données déjà produites par
  CSM (`csm.suspected` pour #2 ; un texte statique par qualité pour #1), directement dans l'esprit de
  `AUDIT_OPTIMISATION_SYNTHESE_CLINIQUE.md`.
- Signaler explicitement au praticien (conformément à `CLAUDE.md`) et faire trancher : #3 et #4 —
  ces deux problèmes touchent à des mécanismes narratifs légataires (`hypothese`, `priorities`
  affichées comme hiérarchie) que les missions précédentes ont délibérément laissés intacts hors
  périmètre. Une décision explicite du praticien est nécessaire : faire évoluer leur texte, les
  retirer de la navigation Expert, ou les faire cohabiter avec un avertissement.
- #5, #6, #7 : à corriger dans un lot ultérieur, aucune urgence clinique.

---

## 24. Verdict final

**C — CORRECTIONS NÉCESSAIRES AVANT UTILISATION.**

Justification, fondée strictement sur les observations ci-dessus, pas sur une préférence : deux
problèmes CRITIQUES (#1, #2) créent un risque réel d'interprétation clinique erronée — un praticien
peut légitimement croire qu'une qualité est « sans données » alors qu'elle est structurellement
bloquée (#1), ou qu'elle n'a « rien à signaler » alors qu'elle porte un signal partiel réel et
invisible (#2). Un troisième problème CRITIQUE (#3) expose, dans le même produit et le même PDF, une
voix narrative confiante et non fondée à côté d'une voix CSM rigoureuse — exactement le risque que
`AUDIT_COHERENCE_NARRATIVE_CSM_VS_LEGACY.md` avait pour mandat de traquer, et qui subsiste dans un
mécanisme (`hypothese`) que cette audit-là n'avait pas examiné au niveau du texte lui-même.

Ce n'est **pas** un verdict D (architecture à revoir) : l'architecture HYP → CSM → UI/PDF elle-même
est saine, cohérente et honnête dans son design (chaque moteur documente ses propres limites,
chaque état a une sémantique claire) — les problèmes trouvés sont tous **des lacunes de présentation
ou des reliquats narratifs légataires**, corrigibles sans toucher au raisonnement clinique, pas des
défauts de conception du modèle HYP/CSM lui-même.

---

## 25. Verdict final — synthèse en une phrase

*« Pour un patient qui obtient un déficit réel de Force, de Puissance, d'Explosivité ou d'Endurance
avec les tests aujourd'hui disponibles, Kinexus V1 ne le confirmera jamais — et ne le dit pas ; pour
les qualités qu'il confirme, il le fait bien et sans fausse causalité dans la Synthèse clinique, mais
un onglet voisin, toujours visible, raconte encore une histoire plus confiante que les données ne le
permettent. »*

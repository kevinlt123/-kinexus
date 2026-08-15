# Audit — Contrôle Sensoriel / Contrôle Sensori-moteur : qualité distincte ou sous-composante de Stabilisation ?

## Statut

Audit clinique et architectural, factuel uniquement. Aucune proposition de solution, aucune
implémentation, aucun arbitrage. Sources : lecture directe de `/home/user/-kinexus/index.html`, des
trois extraits texte de Vierge_7 disponibles (limite déjà signalée dans `AUDIT_CONTROLE_FRONTAL.md`
§3.1, applicable ici aussi), et de l'ensemble des documents du chantier — notamment
`HYP_ARCHITECTURE_FREEZE.md` (point 1, déjà validé et non rouvert ici) et
`HYP_ARCHITECTURE_PHASE_C.md` (encadré de maturité de `HYP-STAB-01`).

---

# 1. Références trouvées

## Dans le code
- **`Contrôle Sensoriel`** — 9ᵉ des 10 `FUNCTIONS` (`index.html:742`), alimentée par 5 tests
  (`eo`, `ef`, `strobo`, `sls` à poids 3 ; `ybt` à poids 1 — `TFM`, `:750`). Usages détaillés
  (calcul/affichage/PDF/historique/priorisation) déjà documentés dans
  `AUDIT_TFM_VS_HYP_QUALITES.md` §4 — non répétés ligne à ligne ici.
- **`eo`, `ef`, `strobo`, `sls`** — 4 tests distincts dans le catalogue Kinexus, chacun avec ses
  propres KPI (`sls` : `ttf, cop_path, cop_vel, ellipse_area, cop_range_ml, cop_range_ap,
  mean_velocity` — 7 KPI ; `eo`/`ef` : `surface` — 1 KPI chacun ; `strobo` : `surface` — 1 KPI
  mesuré, `cop_path`/`cop_vel` **non calculés par Kinexus** malgré leur présence dans Vierge_7, voir
  §2).
- **Aucune trace d'un calcul de "dépendance visuelle" ou "dépendance sensorielle"** (différence
  EO/EF, ratio ou delta) n'a été trouvée dans `index.html` — recherche `EO.*EF|dependance|
  dépendance` sans résultat pertinent. `eo_surface` et `ef_surface` sont traités comme deux tests
  indépendants, jamais comparés entre eux.

## Dans les documents du chantier
- **`HYP_ARCHITECTURE_FREEZE.md`, point 1** ("Stabilisation vs Contrôle Sensori-moteur", déjà
  validé, non rouvert) : *"Vierge_7 spécifie, mot pour mot, la même base de preuves diagnostiques et
  confirmatives (SLS, EO/EF, Strobo, Landing) pour deux qualités officiellement distinctes... aucune
  preuve mesurée ne permet de les différencier opérationnellement."* Décision retenue : `HYP-CSM-01`
  suspendue, non supprimée.
- **`HYP_ARCHITECTURE_PHASE_C.md`, encadré de maturité de `HYP-STAB-01`** (déjà écrit, non rouvert) :
  note complémentaire déjà présente — *"`CLI090` (CSM) couvre EO/EC/Strobo/SLS ensemble comme
  déclencheur, contre SLS seul pour `CLI070` (Stabilisation) — une différenciation réelle qui
  n'existait pas au niveau des fiches de qualité."* Cette observation, déjà écrite en Phase C, est
  développée et vérifiée directement contre le texte de Vierge_7 en §2 ci-dessous.
- **`HYP_ARCHITECTURE_PHASE_B.md`** : contient la fiche B "Contrôle sensori-moteur" (fiche 7),
  jamais mise à niveau vers la structure Phase C — `HYP-CSM-01` reste au niveau de détail de la
  Phase B, suspendue avant la Phase C.

---

# 2. Vérifications directes

## 2.1 Ce que dit Vierge_7 — fiche « Contrôle sensori-moteur »
📄 Citations directes (`vierge7_p2.txt:2572` et suivantes) :

- **Définition** : *"Capacité du système neuromusculaire à intégrer les informations sensorielles
  et à ajuster le contrôle postural ou fonctionnel en conséquence."*
- **Question clinique** : *"Cet athlète est-il capable d'intégrer correctement les informations
  sensorielles pour stabiliser et ajuster son contrôle moteur ?"*
- **"Il ne se confond pas avec"** : la fiche énumère explicitement 7 qualités (mobilité, force
  maximale, puissance, explosivité, réactivité, absorption, endurance) dont elle se distingue.
  **Stabilisation n'apparaît pas dans cette liste.**
- **Preuves diagnostiques** (`vierge7_p2.txt:2660-2760`) : SLS (7 KPI, "diagnostique principal") ·
  EO/EF (`eo_surface`/`ef_surface`, "diagnostique principal **sensoriel**") · Strobo (`strobo_
  surface/cop_path/cop_vel`, "diagnostique principal **sous contrainte**") · Landing uni/bi (10 KPI,
  "diagnostique principal **contextuel**"). **Quatre sous-rôles diagnostiques explicitement
  nommés et différenciés par le texte lui-même** — absent de ce niveau de détail dans la fiche
  Stabilisation (qui ne différencie pas ses preuves diagnostiques par sous-rôle).
- **Preuves explicatives physiologiques** (`vierge7_p2.txt:2910-2960`) : `hip_abd_rfd100/200`,
  `hip_ext_rfd100/200`, `hip_add_rfd100`, `inv_iso_rfd100`, `ev_iso_rfd100`, `df_iso_rfd100`,
  `wblt_distance` — **variable pour variable identiques** à celles déjà transcrites pour
  `HYP-STAB-01` — plus 4 concepts non mesurables (`sensorimotor_control`, `postural_control`,
  `balance_strategy`, `perturbation_response`, aucun ne correspond à une clé de test/KPI Kinexus
  existante).
- **Règle de fond figée** (`vierge7_p2.txt:3218-3255`) : *"Les variables de stabilisation, de
  perturbation et de contrôle du centre de pression **peuvent expliquer** un déficit de contrôle
  sensori-moteur, mais **ne doivent pas le remplacer**."* — Vierge_7 emploie ici le terme
  "stabilisation" au sens générique (mécanisme), pas nécessairement en référence à la qualité
  "Stabilisation" elle-même ; cité tel quel, sans interprétation supplémentaire.

## 2.2 Ce que dit la fiche « Stabilisation », pour comparaison directe
📄 `vierge7_p1.txt:3145` et suivantes :
- **Définition** : *"Capacité du système neuromusculaire à maintenir ou retrouver le contrôle
  postural après une contrainte, un appui unipodal, un atterrissage ou une perturbation."*
- **"Elle se distingue"** : de l'absorption, de la réactivité, de la mobilité. **Contrôle
  sensori-moteur n'apparaît pas dans cette liste non plus** — omission symétrique à celle relevée en
  §2.1.
- **Preuves diagnostiques** : SLS, EO/EF, Strobo, Landing — mêmes tests que CSM, sans les
  sous-rôles différenciés ("diagnostique principal sensoriel/sous contrainte/contextuel") présents
  dans la fiche CSM.

## 2.3 Ce que disent les `CLI###`
📄 Contenu exact, jamais transcrit intégralement avant ce document :

| `CLI###` | Qualité cible | Déclencheur | Diagnostiques | Confirmatives | Explicatives | Condition |
|---|---|---|---|---|---|---|
| `CLI070` (Stabilisation) | Stabilisation | Score Stabilisation diminué | **SLS** | EO, EC | Hip Abd, Hip Ext, Inv, Ev *(déjà transcrit en Phase C)* | Deux preuves diagnostiques déficitaires |
| `CLI090` (CSM) | Contrôle sensori-moteur | Score Contrôle sensori-moteur diminué | **EO, EC, Strobo, SLS** (4 familles) | Landing Stability | Hip Abd RFD, Hip Ext RFD, Inv RFD, Ev RFD | Deux preuves diagnostiques déficitaires (parmi les 4 familles) |
| `CLI091` (CSM) | Contrôle sensori-moteur | *(non précisé)* | **EO Surface, EC Surface** | Strobo | Sensorimotor Control | *(non précisée)* |
| `CLI092` (CSM) | Contrôle sensori-moteur | *(non précisé)* | Strobo *(suite non capturée)* | — | — | — |

**Constat direct** : `CLI070` restreint son diagnostique à SLS seul ; `CLI090` exige une
convergence entre 4 familles distinctes (EO, EC, Strobo, SLS). **C'est une différence de
construction réelle et vérifiable**, pas seulement une nuance rédactionnelle — confirmée par lecture
directe du texte, au-delà de ce que Phase C avait déjà noté.

**`CLI091` — "Réduire la dépendance visuelle"** est l'unique endroit de tout le corpus consulté où
le concept de "dépendance visuelle/sensorielle" apparaît comme une orientation clinique à part
entière, diagnostiquée par la comparaison implicite EO Surface / EC Surface (cohérent avec le texte
de la fiche CSM : *"Cette différence renseigne directement la dépendance aux informations
sensorielles"*). **Aucune orientation équivalente n'existe sous `CLI070`/`CLI071`
(Stabilisation).**

## 2.4 Ce qui distingue réellement Contrôle Sensoriel de Stabilisation — synthèse des faits vérifiés

| Niveau | Constat |
|---|---|
| Définition textuelle | Deux définitions distinctes, mais chacune omet l'autre qualité de sa propre liste de distinctions — fait symétrique, vérifié dans les deux fiches |
| Variables diagnostiques (fiche qualité) | Identiques (SLS, EO, EF, Strobo, Landing) |
| Variables explicatives physiologiques (fiche qualité) | Identiques, variable pour variable |
| Rôles diagnostiques internes | CSM différencie 4 sous-rôles (principal/sensoriel/sous contrainte/contextuel) ; Stabilisation ne différencie pas |
| Condition d'activation `CLI###` | Différente et vérifiée : `CLI070`=SLS seul ; `CLI090`=convergence sur 4 familles |
| Orientation clinique unique | `CLI091` ("dépendance visuelle") n'a aucun équivalent sous Stabilisation |
| Calcul actuel dans Kinexus (`index.html`) | Aucun calcul de "dépendance" (delta EO/EF) n'existe — `eo`/`ef` traités comme deux tests indépendants, sans lien calculé entre eux |

---

# 3. Réponse factuelle

**C. Impossible à conclure avec certitude à partir des documents disponibles — avec une tension
documentée dans les deux sens, précisément localisée plutôt que laissée vague.**

- **Éléments allant dans le sens B (sous-composante de Stabilisation)** : au niveau de la fiche de
  qualité elle-même, les preuves diagnostiques et explicatives physiologiques sont identiques,
  variable pour variable — c'est le fondement déjà établi de la décision de suspension (gel, point
  1), non remis en cause ici.
- **Éléments allant dans le sens A (qualité distincte)** : au niveau des orientations `CLI###`, une
  différence de construction réelle existe (`CLI070` vs `CLI090` n'ont pas la même condition de
  déclenchement), et `CLI091` porte une question clinique ("dépendance visuelle") qu'aucune
  orientation de Stabilisation ne pose. Ces éléments n'étaient pas encore vérifiés directement
  contre le texte de Vierge_7 avant ce document.
- **Vierge_7 ne tranche cette tension nulle part explicitement** : aucun passage trouvé n'affirme
  "Contrôle sensori-moteur est une sous-partie de Stabilisation", ni l'inverse, ni une distinction
  clinique opérationnelle qui permettrait de les différencier au niveau des tests eux-mêmes.

---

# 4. Ce qui serait perdu si `HYP-CSM-01` restait suspendue

- **`CLI091` — "Réduire la dépendance visuelle"** ne serait jamais généré, quelles que soient les
  données du bilan. C'est la seule orientation clinique identifiée dans tout le corpus consulté qui
  pose spécifiquement la question de la dépendance aux informations visuelles pour l'équilibre — 
  aucune autre `CLI###` active ne pose cette question.
- **`CLI092` — "Améliorer la réponse aux perturbations"** (axée sur Strobo) ne serait pas généré non
  plus ; `CLI071` (Stabilisation, "Réduire les oscillations posturales") reste diagnostiquée par COP
  Path, une lecture différente bien que voisine.
- **La convergence à 4 familles de `CLI090`** (EO+EC+Strobo+SLS, condition "2 sur 4") ne serait
  jamais évaluée en tant que telle — seule la convergence plus étroite de `CLI070` (SLS) resterait
  active.
- **Les 4 sous-rôles diagnostiques explicitement nommés par Vierge_7 pour CSM** (principal /
  principal sensoriel / principal sous contrainte / principal contextuel) resteraient sans
  traduction dans aucune hypothèse active — `HYP-STAB-01` traite ses 4 familles de preuves de façon
  uniforme, sans cette granularité.
- **Ce qui resterait disponible ailleurs** : les données brutes des 4 tests (`sls`, `eo`, `ef`,
  `strobo`) continueraient d'être saisies, affichées et exportées comme aujourd'hui (`TFM`/
  `FUNCTIONS`, inchangé tant que TFM reste actif) ; `HYP-STAB-01` continuerait de produire
  `CLI070`/`CLI071` à partir des mêmes tests, pour la question clinique de Stabilisation.

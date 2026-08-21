# Implémentation — HYP-FOR-01 dans Kinexus

**Statut** : implémenté et branché en production dans `index.html`. `fSc['Force']` (sortie de
`computeMoteur()`) est désormais produit **intégralement** par le raisonnement clinique
HYP-FOR-01, y compris quand il ne peut rien déterminer.

---

## CE QUI CHANGE

**Diagnostic global (Niveau 1)** : `CLI010`, au moins 2 des 4 preuves (`imtp_n`, `slimtp_n`,
`iso_belt_squat_n`, `sl_iso_push_n`) déficitaires conjointement. Aujourd'hui, seules
`iso_belt_squat_n` et `sl_iso_push_n` sont classifiables (population-dépendant) —
`imtp_n`/`slimtp_n` restent sans seuil. La règle reste évaluable dès que 2 des 4 le sont, quels
que soient les 2 autres.

**Niveau 2** : localisation segmentaire (15 tests, `CLI200`-`211`) déclenchée **uniquement** si le
Niveau 1 est retenu **et** que le segment est localement déficitaire — jamais un déficit
segmentaire isolé créant seul le diagnostic global.

**Explication** : RFD (`rfd50`/`100`/`150`/`200`) et TTPF des tests diagnostiques, exposés en
valeur brute, jamais classifiés (aucun seuil), jamais générateurs.

**Précision** : force relative (`_nkg`, orientation `CLI011` distincte, jamais comptée dans le
2/4) et asymétries D/G (LSI) pour les tests unilatéraux (`slimtp`, `sl_iso_push`).

---

## LIMITATIONS ACTUELLES

- **`imtp_n`/`slimtp_n`** : aucune norme (ni `NORMS` ni `THRESHOLDS`) — jamais classifiables
  aujourd'hui, malgré un poids `TFM=3` (le plus élevé), jamais interprété comme un seuil.
- **Groupes segmentaires sans aucune norme** : `df_iso`, `inv_iso`, `ev_iso`, `sh_iso_3030`,
  `sh_iso_6060` — retournent `localStatus:'non_classifiable'`, jamais `'normal'` par défaut.
- **RFD/TTPF** (tous tests, diagnostiques et segmentaires) : aucune norme, sur aucune variable —
  exposées en valeur brute uniquement.
- **Constat découvert en écrivant les tests** : aucune population `NORMS` réelle ne couvre à la
  fois `iso_belt_squat_n` (`fd_*`/`general_*`) et `sl_iso_push_n` (`foot_*`) simultanément —
  vérifié directement (`'iso_belt_squat_n' in NORMS.foot_m_senior` = faux). En pratique, le
  diagnostic global ne peut donc aujourd'hui atteindre `retenue_faible` que si un athlète est
  suivi avec une population couvrant les deux (aucune connue à ce jour), ou si l'un des deux
  seuls est déficitaire aux côtés d'un signal isolé — sinon le moteur reste à `suspectee` au mieux.

Le moteur ne transforme jamais ces absences en statut « normal » — `non_determinable`
(`status:null`) uniquement quand **aucune** des 4 preuves globales n'est classifiable ;
`suspectee` (signal partiel honnête) sinon.

---

## Détail technique

### Architecture

`computeHypForce01(testData, normPop, normAge)` — fonction pure, réutilise exclusivement
`applyThr`/`bestVal`/`autoLSI`/`testKpiDir`. Une fonction générique unique,
`computeHypForceKpi(testData, testKey, kpi, bilateral, pop, age)`, gère la lecture de **tous** les
KPI de force (`_n`/`_nkg`, bilatéraux ou unilatéraux) — réutilisée identiquement pour les 4 tests
diagnostiques globaux et les 15 tests segmentaires du Niveau 2, sans duplication de logique.

### Niveau 1 — état

| État | Condition |
|---|---|
| `non_determinable` | 0 des 4 preuves classifiables |
| `absente` | ≥1 classifiable, 0 déficitaire |
| `suspectee` | ≥1 classifiable, 1 déficitaire |
| `retenue_faible` | ≥2 déficitaires (parmi celles classifiables) |
| `retenue_moderee` | `retenue_faible` + une confirmative `_nkg` du même test déficitaire aussi (mécanique HYP existante — jamais une nouvelle règle) |
| `retenue_forte` | + une explicative RFD/TTPF convergente — jamais atteint aujourd'hui, aucune RFD classifiable |

### Niveau 2 — 15 tests segmentaires

Table complète vérifiée dans `index.html` (`AUDIT_SEUILS_HYP_FOR01.md`,
`CARTOGRAPHIE_ROLE_CLINIQUE_HYP_FORCE.md`) :

| Groupe | `CLI` | `_n` | `_nkg` |
|---|---|---|---|
| Quadriceps | `CLI200` | Aucune norme | THRESHOLDS |
| Soléaire | `CLI201` | NORMS (3 pop.) | THRESHOLDS |
| Gastrocnémien | `CLI202` | Aucune norme | THRESHOLDS |
| Ischio-jambiers | `CLI203` | Aucune norme | THRESHOLDS |
| Extenseurs de hanche | `CLI204` | Aucune norme | THRESHOLDS |
| Abducteurs de hanche | `CLI205` | NORMS (3 pop.) | THRESHOLDS |
| Adducteurs | `CLI206` | NORMS (3 pop.) | THRESHOLDS |
| Fléchisseurs de hanche | `CLI207` | NORMS (3 pop.) | THRESHOLDS |
| Dorsiflexeurs | `CLI208` | Aucune | Aucune — **non classifiable** |
| Inverseurs | `CLI209` | Aucune | Aucune — **non classifiable** |
| Éverseurs | `CLI210` | Aucune | Aucune — **non classifiable** |
| Épaule 90/20, 90/90 | `CLI211` | Aucune | THRESHOLDS |
| Épaule 30/30, 60/60 | `CLI211` | Aucune | Aucune — **non classifiable** |

`localStatus` d'un segment est `'deficitaire'` si `_n` **ou** `_nkg` est déficitaire (double voie
quand disponible), `'non_classifiable'` si ni l'un ni l'autre n'a de seuil, `'normal'` sinon.
`orientationTriggered` n'est jamais vrai sans Niveau 1 retenu — vérifié par test (cas 8 vs 9).

### Intégration

Après le bloc HYP-PUI-01 (inchangé), un bloc dédié réécrit **intégralement** `fSc['Force']` — même
principe que HYP-PUI-01, divergent d'Absorption/Réactivité/Mobilité (pas de repli TFM) :
`status:null` explicite quand `non_determinable`, sinon dérivé de l'état (`absente`→vert,
`suspectee`→jaune, `retenue_*`→orange, ou rouge si tous les tests déficitaires sont littéralement
`'rouge'`). `hypFor01` (objet complet, y compris les 15 segments) toujours attaché pour
traçabilité. Aucune autre qualité, aucun autre output de `computeMoteur` n'est touché.

---

## Fichiers modifiés / créés

- **`index.html`** — seul fichier de production modifié. Purement additif : **+205 lignes,
  0 suppression**.
- **`tests/hypForce01.test.js`** — 19 tests, dont les 14 cas mandatés.
- **`tests/hypAbsorption01.test.js`** — 1 test mis à jour (voir note ci-dessous).
- Ce document.

**Note sur `tests/hypAbsorption01.test.js`** : l'implémentation de HYP-FOR-01 rend une ancienne
assertion obsolète — ce test vérifiait que Force restait dérivée de
`computeTestStatus('cmj',...)` (boucle TFM générique) quand seul `cmj` est actif. Force n'étant
plus jamais dérivée de TFM (elle est désormais intégralement pilotée par `computeHypForce01`, qui
ne lit aucune variable CMJ), l'assertion a été mise à jour pour vérifier le même principe sous-jacent
(le bloc HYP-ABS-01 n'intercepte jamais `fSc['Force']`) avec le comportement réel actuel :
`non_determinable` (`status:null`), honnête, puisqu'aucun test de force n'est fourni dans ce cas.
Ce n'est pas une régression — c'est la conséquence directe et attendue de cette mission.

---

## Tests

`tests/hypForce01.test.js` — **19 tests, tous passants**, couvrant les 14 cas mandatés (§12) :
tous globaux normaux → absente ; 1 déficitaire → suspectee ; 2 déficitaires → retenue (mécanisme
validé via une norme combinée injectée en mémoire pour la durée du test uniquement, aucune
modification d'`index.html` — voir note ci-dessous) ; support jamais forcé au-delà du réellement
permis ; 1 seule variable disponible → suspectee, jamais un 2/4 forcé ; localisation segmentaire
correcte (déclenchée seulement avec le global retenu, jamais isolément) ; RFD explicative jamais
comptée ; asymétrie en précision seule ; orientation force relative (`CLI011`) jamais comptée dans
le 2/4 ; variable segmentaire sans norme jamais "normale" par défaut.

**Régression complète** : les 19 fichiers de tests réexécutés intégralement — **tous passants**,
1 assertion obsolète corrigée dans `tests/hypAbsorption01.test.js` (voir ci-dessus, conséquence
attendue, pas une régression). Vérification syntaxique complète du contenu `<script>` d'`index.html`
(`node --check`) — **OK**. `git diff` confirmé purement additif (+205/-0 dans `index.html`).

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+205/-0 lignes), `tests/hypAbsorption01.test.js`
  (1 assertion mise à jour, conséquence attendue).
- **Fichiers créés** : `tests/hypForce01.test.js`, `IMPLEMENTATION_HYP_FOR01.md`.
- **Tests ajoutés** : 19, tous passants.
- **Tests existants passés** : tous (18 fichiers préexistants, 1 assertion mise à jour, aucune
  régression réelle).
- **Autres qualités modifiées** : NON — vérifié par tests dédiés (Réactivité, Mobilité, Puissance
  inchangées quand seules les données Force varient) et par relecture.
- **Règle 2/4 modifiée** : NON.
- **Seuil inventé** : NON.
- **HYP-FOR-01 réellement actif** : OUI — Niveau 1 opérationnel dès que 2 des 4 preuves sont
  classifiables (aujourd'hui, en pratique, aucune population connue ne couvre les deux seules
  preuves classifiables simultanément — voir Limitations) ; Niveau 2 opérationnel pour 8 des 15
  segments ; honnête (`non_determinable`) partout ailleurs.

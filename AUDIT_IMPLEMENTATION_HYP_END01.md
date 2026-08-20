# Audit clinique final + implémentation — HYP-END-01 (Endurance)

**Statut** : audit complet réalisé en premier, conclusion **GO**, implémenté et branché en
production dans `index.html`. `fSc['Endurance']` (sortie de `computeMoteur()`) est désormais
produit **intégralement** par le raisonnement clinique HYP-END-01, y compris quand il ne peut rien
déterminer (`status:null` explicite — même principe que HYP-PUI-01/HYP-FOR-01/HYP-EXP-01/
HYP-STA-01).

Sources consultées et vérifiées directement dans `index.html` (`TBK`, `THRESHOLDS`, `NORMS`,
`TFM`) : `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-END-01), `CARTOGRAPHIE_CLINIQUE_HYP_ENDURANCE.md`,
`CARTOGRAPHIE_ROLE_CLINIQUE_HYP_ENDURANCE.md`, `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` (section
ENDURANCE), `CARTOGRAPHIE_VARIABLES_HYP.md`, `KINEXUS_REASONING_ENGINE_V1.md` (§7, gelé),
`KINEXUS_CLINICAL_ARCHITECTURE.md`.

C'est la qualité HYP dont la documentation source s'est révélée **la plus propre et la moins
ambiguë** à ce jour : aucun écart entre la fiche de qualité et l'orientation `CLI080` (contrairement
à Stabilisation/`CLI070`), toutes les sources concordent exactement sur les 6 mêmes variables
diagnostiques et la même règle de convergence.

---

## PARTIE 1 — AUDIT CLINIQUE FINAL (résumé)

### 1. Variables diagnostiques (vérifiées dans `TBK`/`THRESHOLDS`/`NORMS`)

| Variable | Test | Rôle clinique | Diagnostique ? | Norme disponible ? | Statut |
|---|---|---|---|---|---|
| `heel_raise_reps` | Heel Raise (unilatéral) | Endurance musculaire locale du mollet | Oui (fiche + `CLI080`) | **`THRESHOLDS`** (vert 25/jaune 20/orange 15, dir max) | **Toujours classifiable, opérationnel** |
| `repeated_hop_n_hops` | Repeated Hop (unilatéral) | Volume de sauts répétés maintenu | Oui (fiche ; omis de la liste littérale `CLI080`, écart mineur explicitement noté « sans conséquence ») | **Aucune** | Rôle conservé, **jamais classifiable aujourd'hui** |
| `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue` | Repeated Hop | Dégradation/fatigue intra-série | Oui (fiche + `CLI080`, mêmes 4 variables citées littéralement) | **Aucune** | Rôle conservé, **jamais classifiables** |

**Constat de méthode** : sur 6 mécanismes diagnostiques documentés, **5 (tout le Repeated Hop)
n'ont aujourd'hui aucune norme**. Seul `heel_raise_reps` est réellement opérationnel. Conformément
à la méthode gelée, les 5 mécanismes bloqués restent dans l'architecture, jamais retirés, jamais
interprétés comme « normaux ».

### 2. Repeated Hop — point central

Traité comme un ensemble de **variables distinctes**, jamais comme un raccourci « Repeated Hop ↓ =
Endurance ↓ ». 15 KPI réellement présents dans `TBK.repeated_hop` (vérifiés un par un) : 5
diagnostiques (`n_hops`, `rsi_fatigue`, `height_fatigue`, `ct_drift`, `stiffness_fatigue`),
9 confirmatifs (`mean_height`, `mean_rsi`, `mean_peak_force`, `mean_ct`, `best_height`, `best_rsi`,
`height_cv`, `ct_cv`, `rsi_cv`) et 1 sans rôle assigné par aucune source (`mean_stiffness`,
ci-dessous). Aucune norme sur ces 15 KPI aujourd'hui → chacun retourne honnêtement
`status:'indisponible'`, jamais un statut inventé.

### 3. Règle de convergence

📄 **SOURCE EXPLICITE**, gelée, concordante à trois niveaux documentaires (aucun écart à arbitrer,
contrairement à Stabilisation) :
- `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` : *« Condition (SOURCE EXPLICITE) : au moins 2 preuves
  diagnostiques déficitaires. »*
- `HYP_ARCHITECTURE_PHASE_C.md` : `CLI080` — *« deux preuves diagnostiques déficitaires »*.
- `KINEXUS_REASONING_ENGINE_V1.md` §7 (référence gelée) : `HYP-END-01` → **« ≥2/6 preuves
  diagnostiques »**, support max atteignable **Forte**, robustesse **élevée**, statut **« Prêt »**
  (le plus favorable de toutes les qualités auditées jusqu'ici, sans réserve documentée).

Seule note non bloquante : le statut « local » de `heel_raise_reps` (mollet, par opposition au
Repeated Hop plus général) — explicitement documenté comme *« non tranché »* mais **non bloquant**
et **ne modifie ni le décompte ni le seuil de convergence** (`KINEXUS_REASONING_ENGINE_V1.md` §7 et
§8). `heel_raise_reps` compte comme 1 des 6 preuves à égalité avec les 5 autres.

### 4. Heel Raise

`heel_raise_reps` a un rôle **diagnostique explicitement documenté** (fiche + `CLI080`, source
directe, pas une inférence à partir de la présence d'un seuil). Conservé comme tel — 1 des 6
preuves diagnostiques, jamais confirmatif ni explicatif (vérifié par test). Aucune autre variable
Heel Raise n'existe dans `TBK` (un seul KPI, `reps`).

### 5. Hop Tests

Le seul « Hop Test » documenté pour Endurance est le **Repeated Hop** (`repeated_hop`, unilatéral,
15 KPI, cf. point 2). Single Hop / Triple Hop / Crossover Hop / Side Hop / Time Hop ne sont
**mentionnés nulle part** dans les sources HYP pour Endurance — confirmé absent de la fiche
HYP-END-01 (« Variables contributrices ») et de `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`. Ces variantes
sont documentées ailleurs comme territoire Puissance/Réactivité (`single_hop_distance`,
`triple_hop_distance`, `crossover_hop_distance` explicitement exclus de Stabilisation également) —
aucun rôle ne leur est attribué ici par analogie.

### 6. Fatigue vs performance

La distinction est **explicitement documentée** et respectée dans l'architecture : les 5 KPI
diagnostiques (`n_hops`, `rsi_fatigue`, `height_fatigue`, `ct_drift`, `stiffness_fatigue`) mesurent
la **dégradation/le maintien** (comparaison intra-série), tandis que les 9 KPI confirmatifs
(`mean_*`, `best_*`, `*_cv`) mesurent le **niveau de performance moyen/maximal atteint**. Cette
séparation diagnostique/confirmatif est celle documentée par la fiche — aucun sous-domaine
supplémentaire (« récupération », etc.) n'est inventé au-delà.

### 7. Sous-domaines

Aucune décomposition « endurance générale / endurance locale / résistance à la fatigue » n'est
documentée comme architecture formelle distincte — la fiche HYP-END-01 traite Endurance comme une
qualité unique avec 2 tests contributeurs (Heel Raise, Repeated Hop). Aucun sous-domaine inventé.

### 8-9. Normes / voies potentielles

Voir tableau « Tableau récapitulatif rôle × norme » de `CARTOGRAPHIE_ROLE_CLINIQUE_HYP_ENDURANCE.md`
(non reproduit intégralement ici, déjà consolidé) : `heel_raise_reps`, `iso_belt_squat_n`/`nkg`,
`sl_iso_push_n`/`nkg` opérationnels. Repeated Hop (15 KPI) → voie potentielle VALD (rapport dédié,
absent du dépôt) / norme interne / norme sportive. Aucune recherche ni création de norme effectuée
dans cette mission — uniquement documentée.

### 10. Asymétries

Aucun mécanisme d'asymétrie inter-test propre à Endurance au-delà du LSI intrinsèque déjà exposé
(`rawD`/`rawG`/`lsi`) pour les tests unilatéraux (Heel Raise, Repeated Hop). Ne génère jamais seule
un déficit — vérifié par test.

---

## PARTIE 2 — ARCHITECTURE CLINIQUE

| Catégorie | Contenu | Statut |
|---|---|---|
| **A. DIAGNOSTIC** | `heel_raise_reps` + 5 KPI `repeated_hop_*` (fatigue/dégradation), ≥2 déficitaires requis | Implémenté, 1/6 opérationnel |
| **B. CONFIRMATION** | 9 KPI `repeated_hop_*` (moyenne/meilleure performance/variabilité) — réellement indépendants des 6 diagnostiques (pas d'auto-référence, contrairement à Stabilisation) | Implémenté, structurellement inerte aujourd'hui (0 norme) |
| **C. EXPLICATION** | Force de fond (4 tests globaux + 11 familles segmentaires, `_n`/`_nkg`) + cinétique RFD (15 familles, valeur brute) | Implémenté |
| **D. PRÉCISION** | LSI intrinsèque des tests unilatéraux (Heel Raise, Repeated Hop) — précision uniquement | Implémenté |
| **E. VALIDATION CROISÉE** | Force/Explosivité citées par `CLI080` comme qualités explicatives (niveau qualité, pas variable) | Non implémenté en tant que mécanisme dédié — aucune source ne formalise de règle croisée au-delà de la mention |

---

## PARTIE 3 — RELATION AVEC LES AUTRES QUALITÉS

Étanchéité vérifiée par lecture du code et par test dédié : aucune variable CMJ/SLCMJ/DJ/SLDJ/CMJR
(Puissance/Réactivité), `wblt_distance`/`lsi`/`asymmetry` (Mobilité), SLS/EO/EF/Strobo
(Stabilisation), Landing/SLLT (Absorption) n'est lue par `computeHypEndurance01` — confirmé par
test (« wblt/SLS/.../Landing jamais lus »). Les variables de force segmentaire/cinétique RFD sont
lues en lecture seule, à titre explicatif uniquement, sans jamais devenir diagnostiques d'Endurance
ni être renvoyées vers Force (chaque quality garde son propre rôle par variable — aucun transfert
automatique par analogie).

---

## PARTIE 4 — DÉCISION AVANT CODE

| Élément | Décision | Statut |
|---|---|---|
| Variables diagnostiques | 6 mécanismes indépendants (`heel_raise_reps` + 5 KPI `repeated_hop_*`) — fiche + `CLI080` concordants | SOURCE |
| Règle de convergence | ≥2 preuves diagnostiques déficitaires — SOURCE EXPLICITE, gelée, aucun écart fiche/`CLI###` (contrairement à Stabilisation) | SOURCE / GELÉ |
| Repeated Hop | Ensemble de 15 variables distinctes (5 diagnostiques, 9 confirmatives, 1 sans rôle) — jamais un raccourci global | SOURCE |
| Heel Raise | Diagnostique (1 des 6 preuves), rôle explicite, jamais confirmatif/explicatif | SOURCE |
| Hop Tests | Seul Repeated Hop documenté pour Endurance ; Single/Triple/Crossover/Side/Time Hop absents des sources Endurance | SOURCE (absence confirmée) |
| Fatigue | Distinction diagnostique (dégradation) / confirmatif (niveau moyen/max) documentée et respectée | SOURCE |
| Asymétries | Aucun mécanisme propre au-delà du LSI intrinsèque déjà exposé — jamais générateur seul | SOURCE |
| Sous-domaines | Aucune décomposition formelle documentée — qualité unique, 2 tests contributeurs | SOURCE (absence confirmée) |

### GO IMPLÉMENTATION

Justification : la règle de convergence est source-confirmée et gelée à trois niveaux
documentaires **parfaitement concordants**, sans le moindre écart entre la fiche de qualité et
l'orientation clinique `CLI080` (contrairement à Stabilisation/`CLI070`). Aucune règle fondamentale
manquante n'a nécessité d'invention.

---

## IMPLÉMENTATION

`computeHypEndurance01(testData, normPop, normAge)` — fonction pure, isolée, testable, sans
duplication de seuils, suit les conventions déjà établies (`computeHypForce01`,
`computeHypStabilization01`, etc.). Architecture : `computeHypEnduranceKpi` (lecteur générique
bilatéral/unilatéral D/G, pire côté — réécriture locale, moteur isolé) ; `computeHypEnduranceDiagnostic`
(6 mécanismes) ; `computeHypEnduranceConfirmative` (9 KPI Repeated Hop) ;
`computeHypEnduranceExplanatory` (force de fond globale + 11 segments `_n`/`_nkg` + 15 familles
RFD, valeur brute) ; `computeHypEndurance01` (point d'entrée, état + support).

**Intégration** : après le bloc HYP-STA-01 (inchangé) et avant `var sysSc={};`, un bloc dédié
réécrit **intégralement** `fSc['Endurance']` — `status:null` explicite quand `non_determinable`,
sinon dérivé de l'état (`absente`→vert, `suspectee`→jaune, `retenue_*`→orange, ou rouge si toutes
les preuves déficitaires sont catégorisées `'rouge'`). `hypEnd01` (objet complet) toujours attaché
pour traçabilité. Aucune autre qualité, aucun autre output de `computeMoteur` n'est touché.

---

## PARTIE 12 — RAPPORT

### 1. DIAGNOSTIC

6 mécanismes indépendants : `heel_raise_reps`, `repeated_hop_n_hops`, `repeated_hop_rsi_fatigue`,
`repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue`. Règle de
convergence : ≥2 déficitaires parmi les classifiables (SOURCE EXPLICITE, `CLI080`, gelée).

### 2. CONFIRMATION

9 KPI Repeated Hop, réellement indépendants des 6 diagnostiques (aucune auto-référence) :
`mean_height`, `mean_rsi`, `mean_peak_force`, `mean_ct`, `best_height`, `best_rsi`, `height_cv`,
`ct_cv`, `rsi_cv`. Faible → Modéré si au moins une est déficitaire et classifiable.

### 3. EXPLICATION

Force de fond : `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push` (`_n`/`_nkg`) + 11 familles
segmentaires (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`,
`hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`, `_n`/`_nkg`). Cinétique : RFD100 des 15
familles ci-dessus, valeur brute uniquement (aucune norme). Modéré → Forte si au moins une variable
de force de fond/segmentaire est déficitaire et classifiable, après confirmative.

### 4. PRÉCISION

LSI intrinsèque (D/G) déjà exposé pour Heel Raise et Repeated Hop (tests unilatéraux) — précision
uniquement, jamais générateur seul (vérifié par test). Aucune fatigue asymétrique documentée comme
mécanisme distinct au-delà de ce LSI.

### 5. NORMES DISPONIBLES

`heel_raise_reps` (`THRESHOLDS`) ; `iso_belt_squat_n`/`nkg` (`NORMS`, 15/13 pop.) ;
`sl_iso_push_n`/`nkg` (`NORMS` 3 pop. / `THRESHOLDS`) ; une partie de la force segmentaire
(`soleus_iso_n`, `hip_flex_n`, `hip_abd_n`, `hip_add_n` en `NORMS` ; `knee_ext_nkg`,
`knee_flex_nkg`, `soleus_iso_nkg`, `gastro_iso_nkg`, `hip_flex_nkg`, `hip_ext_nkg`,
`hip_abd_nkg`, `hip_add_nkg` en `THRESHOLDS`).

### 6. LIMITATIONS

Les 15 KPI Repeated Hop (5 diagnostiques + 9 confirmatifs + `mean_stiffness`) sont **intégralement
sans norme** — pivot diagnostique ET confirmatif documenté, bloqué en totalité. Conséquence directe :
au plus 1 des 6 mécanismes diagnostiques (`heel_raise_reps`) est classifiable aujourd'hui →
`retenue_faible` **structurellement inatteignable avec des données réelles** tant qu'aucune norme
Repeated Hop n'existe (contrairement à Stabilisation, où 2 des 6 mécanismes l'étaient déjà via
Landing) → au mieux `suspectee`. `imtp`/`slimtp` (`_n`/`_nkg`), `df_iso`/`inv_iso`/`ev_iso` (`_n`/
`_nkg`) et l'intégralité de la cinétique RFD (15 familles) restent également sans norme.

### 7. DÉCISIONS CLINIQUES RESTANTES

Aucun arbitrage bloquant restant. Seul point non tranché, non bloquant, déjà documenté par la
source elle-même : le statut « local » (mollet) de `heel_raise_reps` par rapport au caractère plus
général du Repeated Hop — n'affecte ni le décompte ni le seuil de convergence, signalé pour mémoire
uniquement (`KINEXUS_REASONING_ENGINE_V1.md` §7-8).

### 8. IMPLÉMENTATION

- `computeHypEnduranceKpi`, `computeHypEnduranceDiagnostic`, `computeHypEnduranceConfirmative`,
  `computeHypEnduranceExplanatory`, `computeHypEndurance01` dans `index.html`.
- Bloc d'intégration dans `computeMoteur()` remplaçant intégralement `fSc['Endurance']`.
- `tests/hypEndurance01.test.js` (16 tests, couvrant les 10 cas mandatés).
- `index.html` : **+175 lignes, 0 suppression** (`git diff --stat`).
- Suite complète : 22 fichiers de tests, tous passants, aucune modification requise ailleurs.
- Aucune autre qualité modifiée (vérifié par tests dédiés — Force, Réactivité, Stabilisation,
  Puissance, Explosivité, Mobilité inchangées ; le moteur clinique `HYP-ABS-01` lui-même inchangé,
  seul le repli TFM générique préexistant d'Absorption peut varier — fait pré-existant, non
  introduit ici, documenté par transparence, cf. `TFM.heel_raise.absorption = 1`).
- Aucun seuil `THRESHOLDS`/`NORMS` créé ou modifié. Aucune table `TFM` modifiée.

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+175/-0 lignes).
- **Fichiers créés** : `tests/hypEndurance01.test.js`, `AUDIT_IMPLEMENTATION_HYP_END01.md`.
- **Tests ajoutés** : 16, tous passants.
- **Tests existants passés** : tous (21 fichiers préexistants, aucune régression).
- **Autres qualités modifiées** : NON.
- **Règle de convergence modifiée** : NON.
- **Seuil inventé** : NON.
- **Repeated Hop/Heel Raise traités comme diagnostiques par défaut** : NON — rôle strictement issu
  des sources.
- **HYP-END-01 réellement actif** : OUI — `suspectee` atteignable aujourd'hui avec des données
  réelles (`heel_raise_reps` seul déficitaire) ; `retenue_faible` structurellement prêt et validé
  par mécanisme temporaire (jamais dans `index.html`), honnêtement non atteignable avec des
  données réelles tant qu'aucune norme Repeated Hop n'existe.

---

## Bilan des 8 qualités HYP

Avec HYP-END-01, les **8 qualités** du modèle Kinexus (`KINEXUS_REASONING_ENGINE_V1.md` §7) sont
désormais toutes soit implémentées en production (Mobilité, Réactivité, Absorption, Puissance,
Force, Explosivité, Stabilisation, Endurance), soit explicitement suspendues par instruction
(Contrôle Sensori-moteur, `HYP-CSM-01`, hors modèle V1). Aucune qualité ne reste sur un repli TFM
générique non documenté.

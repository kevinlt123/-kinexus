# Gap Analysis — HYP-ABS-01 V2 vs comportement actuel du code

**Statut** : analyse d'écart uniquement. Aucun code modifié — vérifié : `git diff --stat` reste vide
pour `index.html` après cette mission. Rien n'est cassé, rien n'est implémenté.

**Méthode** : le code réel (`index.html`) fait foi pour le comportement actuel, pas les documents
précédents. Chaque fait technique de ce document a été vérifié par lecture directe du code pendant
cette mission ; les éléments déjà établis dans des audits antérieurs (`PHASE_I_CODE_REALITY_CHECK.md`,
`IMPLEMENTATION_READINESS_HYP.md`) sont repris et référencés, pas redémontrés.

---

## 1. Comportement actuel — cartographie du code réel

### 1.1 Comment Absorption est calculée aujourd'hui

**Il existe deux mécanismes de calcul totalement séparés et indépendants** — découverte centrale de
cette mission.

**A. `functionScores.Absorption`** (le score "officiel", affiché et utilisé partout) :
- Calculé par `computeMoteur()` (`index.html:4184-4245`).
- Pour chaque test, `computeTestStatus(key,data,pop,age)` (`index.html:4171-4182`) calcule un statut
  unique en agrégeant **tous les KPI du test qui possèdent un seuil résolvable** (via `applyThr` —
  seuil catégoriel fixe, ou norme statistique par population), **avec un poids identique (w=3 pour un
  test bilatéral)** pour chaque KPI. Il n'existe **aucune distinction** entre KPI "diagnostique",
  "confirmatif" ou "explicatif" à ce niveau — **tous les KPI d'un test comptent à égalité** pour
  produire le statut du test.
- Ce statut de test unique est ensuite pondéré par `TFM[test][fonction]` (`index.html:750`) pour
  produire `functionScores.Absorption` — `TFM.cmj.absorption:2`, `TFM.landing_bi.absorption:3`,
  `TFM.landing_uni.absorption:3`, `TFM.sllt` (poids à vérifier séparément), `TFM.dj.absorption:2`,
  `TFM.sldj.absorption:2`.
- **Conséquence directe et non documentée jusqu'ici** : `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`,
  `cmj_braking_rfd` comptent **exactement comme** les ~40 autres KPI du CMJ (hauteur, RSI-Mod,
  puissance de pic, etc.) dans le calcul du statut `cmj` — **rien dans TFM ne les traite
  spécifiquement comme "diagnostiques d'Absorption"**. Le statut `cmj` ainsi obtenu est ensuite
  réutilisé, **identique**, pour Force, Explosivité, Puissance, Réactivité et Absorption
  (`TFM.cmj:{explosivite:3,puissance:3,force:1,reactivite:1,absorption:2}`) — seul le **poids test →
  fonction** diffère, jamais la composition du statut lui-même.

**B. Le "Profil Absorbeur"** (moteur biomécanique par phase, séparé) :
- `BiomechanicalProfileDefinition('absorbeur','Absorbeur',...)` (`index.html:1987-1997`), variables :
  - **Discriminantes** : `cmj:force_zero_vel`, `cmj:braking_rfd` (commenté *"// EDRFD"* dans le code
    lui-même), `cmj:landing_peak_force`, `cmj:landing_impulse`.
  - **Confirmatoires** : `cmj:ecc_mean_power`, `cmj:time_to_stab`.
  - **Descriptive** : `cmj:landing_duration`.
- Ce profil alimente `computeMouvementAnalysis()` (`index.html:3345`), appelée uniquement si
  `testData.cmj.active` (`index.html:4550` pour le PDF, `5922` pour l'écran) — **totalement
  indépendante de `computeMoteur()`/`TFM`/`functionScores`**, bien qu'elle **reçoive** `functionScores`
  en paramètre pour croiser ses conclusions avec le score TFM (`raisonnementBiomecanique`,
  `computeMoteurAlerte`, `index.html:2916`).

**Constat central** : **une architecture très proche de HYP-ABS-01 V2 existe déjà dans le code**,
mais dans le "Profil Absorbeur", pas dans `functionScores`/TFM. `cmj_force_zero_vel` et
`cmj_braking_rfd` y sont **déjà** "discriminants" — exactement le rôle Core proposé par V2. Ce n'est
**pas** une simple coïncidence de nommage à vérifier — c'est une réutilisation potentielle directe
(§9).

**Différences notables entre le Profil Absorbeur existant et HYP-ABS-01 V2** (ni erreur, ni
contradiction — deux systèmes construits séparément) :
- `cmj_braking_impulse` n'apparaît **pas** dans le Profil Absorbeur (V2 le classe pourtant Core).
- `cmj_ecc_peak_vel` n'apparaît **pas** dans le Profil Absorbeur (seul `ecc_mean_power` y figure, en
  confirmatoire, pas discriminante).
- `cmj_time_to_stab` (CMJ lui-même, **distinct** de `landing_uni_tts`/`landing_bi_tts`/`sllt_tts`) y
  est confirmatoire — **variable jamais mentionnée dans aucune fiche HYP-ABS-01 (V1 ou V2)**,
  découverte de cette mission, à signaler (§4).
- `cmj_landing_peak_force`/`cmj_landing_impulse` (déjà classées ❓ NON DÉTERMINABLE pour HYP dans
  `VARIABLES_DIAGNOSTIQUES_ABSORPTION.md`) sont ici **discriminantes** du Profil Absorbeur — leur
  rôle "manquant" côté HYP est donc bien réel ailleurs dans le code, pas un oubli du référentiel.

### 1.2 Asymétries
`computeAsymEngine` (déjà cartographié, non modifié, non relu en détail ici — hors périmètre de
vérification supplémentaire de cette mission) reste la source unique de calcul d'asymétrie, en lecture
seule, jamais génératrice (`KINEXUS_REASONING_ENGINE_V1.md` §6, principe déjà gelé et non remis en
cause par cette mission).

### 1.3 Consommateurs identifiés (vérifiés dans le code)
- `computeMoteur()` → `functionScores`, `priorities` (Priorisation, `index.html:4213-4231`), `rtpStatus`.
- `computeMouvementAnalysis(bilan,pop,age,functionScores)` (`index.html:3345`) → Mouvement/Fil de
  Raisonnement.
- `buildSportifReport()` (`index.html:4550`, déjà cartographié en Phase I comme contenant un appel
  interne à `computeMoteur()`) → Rapport PDF.
- Rendu écran (`index.html:5922`) → probablement `AnalyseView`/Dashboard (nom du composant non
  re-vérifié dans cette mission — cohérent avec `PHASE_I_CODE_REALITY_CHECK.md`).
- `qualityScores` : calculé (`computeQualityStatus`, `index.html:4070`, appelé ligne 4240) mais
  **confirmé mort** — seules 2 occurrences dans tout le fichier (définition + retour), aucun
  consommateur trouvé, cohérent avec `PHASE_I_CODE_REALITY_CHECK.md`. **Absorption y figure comme nom
  de qualité partagé avec `FUNCTIONS`, sans conséquence puisque le code est mort.**

---

## 2. Comportement cible V2 — rôles attendus

| Rôle | Variables |
|---|---|
| DIAGNOSTIC (Core, sous-domaine A) | `cmj_braking_rfd`, `cmj_braking_impulse`, `cmj_force_zero_vel` |
| CONFIRMATION | (aucune nouvelle — celles de V1 conservées : `landing_bi_peak_landing_force`, `cmj_depth`, etc.) |
| EXPLICATION (sous-domaine B) | `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` (rôle inversé depuis V1) |
| STRATÉGIE (sous-domaine C) | `cmj_depth`, `cmj_braking_duration` |
| RÉACTIF (sous-domaine D) | `dj_rsi`, `dj_contact_time` (caractérisation, jamais Niveau 1) |
| IMPACT (sous-domaine E) | `sllt_peak_landing_force`, `landing_bi_peak_landing_force`, `dj/sldj_peak_landing_force` (désambiguïsées) |
| ASYMÉTRIE | `ecc_decel_rfd_asym`, `ecc_decel_impulse_asym`, `landing_peak_force_asym` (lecture seule) |
| FUTUR/NON DISPONIBLE | Eccentric Peak Power, CMJ Stiffness, DJ Eccentric/Concentric Impulse, Force at Zero Velocity Asymmetry, Absorption horizontale/multidirectionnelle |

---

## 3. Matrice V1 → V2 → code actuel

| Variable | Rôle V1 | Rôle V2 | Rôle actuel dans le code | Action nécessaire |
|---|---|---|---|---|
| `cmj_ecc_mean_power` | Diagnostique | Explicative | Dans `functionScores` : KPI parmi ~40 autres, non distingué. Dans le Profil Absorbeur : déjà **confirmatoire** (pas discriminante) | CHANGEMENT DE RÔLE (côté HYP/`functionScores` uniquement) — **déjà conforme au rôle V2 dans le Profil Absorbeur** |
| `cmj_ecc_peak_vel` | Diagnostique | Explicative | `functionScores` : idem, non distingué. Profil Absorbeur : **absente** | CHANGEMENT DE RÔLE côté `functionScores` — sans équivalent à réutiliser côté Profil Absorbeur |
| `cmj_braking_rfd` | Diagnostique | Diagnostique (Core, priorité renforcée) | `functionScores` : non distingué. Profil Absorbeur : **déjà discriminante** | CONSERVÉE — **déjà disponible mais non utilisée par `functionScores`/HYP** |
| `cmj_braking_impulse` | Diagnostique | Diagnostique (Core) | `functionScores` : non distingué. Profil Absorbeur : **absente** | CONSERVÉE côté définition HYP — sans équivalent Profil Absorbeur à réutiliser |
| `cmj_force_zero_vel` | Aucun rôle HYP | Diagnostique (Core) | `functionScores` : compte dans le statut `cmj` sans distinction. Profil Absorbeur : **déjà discriminante** | AJOUTÉE AU RAISONNEMENT côté HYP — **déjà disponible et déjà utilisée ailleurs (Profil Absorbeur)** |
| `landing_uni_tts` | Diag. Absorption + Stabilisation | Diag. Stabilisation seule | `TFM.landing_uni:{absorption:3,stabilisation:3,...}` — les deux poids existent toujours dans le code | RETIRÉE DU DIAGNOSTIC (côté HYP uniquement) |
| `landing_bi_tts` | Diag. Absorption + Stabilisation | Diag. Stabilisation seule | `TFM.landing_bi:{absorption:3,stabilisation:2,...}` | RETIRÉE DU DIAGNOSTIC (côté HYP uniquement) |
| `dj_rsi` | Exclu d'Absorption | Caractérisation sous-domaine D | `TFM.dj:{reactivite:3,absorption:2,...}` — **`dj` a déjà un poids `absorption:2` dans TFM aujourd'hui**, indépendamment de HYP | AJOUTÉE AU RAISONNEMENT côté HYP (rôle nouveau, distinct de TFM) |
| `cmj_time_to_stab` | Non mentionnée | Non mentionnée | Profil Absorbeur : **déjà confirmatoire** | ❓ NON DÉTERMINABLE pour HYP — variable active dans le code mais absente de toute fiche HYP-ABS-01 (V1 ou V2), découverte de cette mission |
| `cmj_landing_peak_force`/`landing_impulse` | ❓ Non déterminé | Non mentionnées explicitement comme Core | Profil Absorbeur : **déjà discriminantes** | DÉJÀ DISPONIBLE MAIS NON UTILISÉE par HYP |
| "Eccentric Peak Power" | — | Explicative (si dispo) | N'existe pas | NON DISPONIBLE |
| "CMJ Stiffness" | — | Stratégie (si dispo) | N'existe pas | NON DISPONIBLE |

---

## 4. Variables changées — vérification point par point (mission §4)

**A/B. `cmj_ecc_mean_power`/`cmj_ecc_peak_vel`** : utilisées aujourd'hui exclusivement (1) comme KPI
parmi d'autres dans `computeTestStatus('cmj',...)`, sans distinction de rôle, et (2) pour
`ecc_mean_power` seulement, comme variable confirmatoire du Profil Absorbeur. Aucune des deux n'est
"diagnostique" au sens où `functionScores.Absorption` fait aujourd'hui un usage différencié — le
changement de rôle V1→V2 n'a donc **aucun effet mesurable sur `functionScores`** (qui ne distinguait
déjà pas les rôles), mais **alignerait le futur moteur HYP sur le Profil Absorbeur existant** pour
`ecc_mean_power`.

**C/D. `landing_uni_tts`/`landing_bi_tts`** : le retrait du diagnostic Absorption ne changerait
**rien** à `TFM` (poids `absorption` et `stabilisation` inchangés dans le code, seule la fiche
clinique HYP change) — voir §5, point de sécurité.

**E. `dj_rsi`** : pour obtenir le comportement V2 (caractérisation du sous-domaine D, jamais
générateur du Niveau 1), il faudrait, dans une future implémentation HYP :
- Lire `dj_rsi` **séparément** de la logique de seuil Core (sous-domaine A) ;
- **Ne jamais** le faire contribuer à un état "Déficitaire" du Niveau 1 seul (règle déjà énoncée dans
  `HYP-ABS-01_V2.md` §7, non codée) ;
- Rien à modifier dans `TFM`/`computeMoteur()` — `dj_rsi` n'y a **aucun** poids `absorption` dans TFM
  aujourd'hui (seul `dj` en tant que test entier a `absorption:2`, agrégeant tous ses KPI, dont
  potentiellement `dj_rsi` si un seuil existe pour lui — à vérifier avant implémentation, non fait
  ici).

**F. Force at Zero Velocity** : ✅ existe (`cmj_force_zero_vel`, `valdName` *"Force at Zero
Velocity"*, `index.html:189`/`117`) ; ✅ déjà calculée/importée comme n'importe quel KPI CMJ (via
import ForceDecks) ; ✅ **déjà utilisée** aujourd'hui — comme variable discriminante du Profil
Absorbeur (`index.html:1988`) ; ❓ affichage direct non vérifié dans cette mission (probablement via
l'écran de détail de test générique, non confirmé) ; **peut être consommée par HYP sans nouveau
calcul** — sa valeur brute et son statut catégoriel (via `applyThr`/normes) existent déjà dans le
pipeline de données.

---

## 5. TTS — point de sécurité

**Aucune modification de `TFM` n'est nécessaire ni proposée.** Le retrait de `landing_uni_tts`/
`landing_bi_tts` du diagnostic Absorption est un changement de **destination clinique dans la fiche
HYP-ABS-01 uniquement** — `TFM.landing_uni`/`TFM.landing_bi` conservent leurs poids `absorption`
**et** `stabilisation` actuels dans le code, tant qu'aucune implémentation HYP n'est décidée (hors
périmètre de cette mission). Le calcul TTS lui-même (`landing_*_tts`, KPI du test) n'est ni supprimé
ni modifié — seule une future couche HYP, non codée, lirait cette variable différemment de TFM.

---

## 6. Frontière Absorption / Stabilisation

**Chevauchements restants, signalés, non corrigés** :
- `TFM.landing_uni:{absorption:3,stabilisation:3,...}` et `TFM.landing_bi:{absorption:3,
  stabilisation:2,...}` — **TFM continue de pondérer les deux tests dans les deux fonctions
  simultanément**, indépendamment de toute future décision HYP. C'est un chevauchement du moteur de
  production actuel, préexistant, non lié à V2, non corrigé (hors périmètre : "ne pas modifier TFM").
- `TFM.sllt` — poids exact non revérifié dans cette mission (probablement `absorption` uniquement,
  cohérent avec l'exclusion de SLLT de Stabilisation déjà établie ; à confirmer avant toute
  implémentation).
- `cmj_time_to_stab` (Profil Absorbeur, confirmatoire) — measure conceptuellement proche de la
  "stabilisation après contrainte", mais **jamais mentionnée pour Stabilisation** dans aucune source
  HYP consultée. Chevauchement conceptuel potentiel, non tranché, signalé.

---

## 7. Frontière Absorption / Réactivité

- `dj_rsi` : reste diagnostique de Réactivité (`TFM.dj:{reactivite:3,...}`, inchangé) — **et**
  reçoit, dans la fiche clinique V2, un rôle nouveau de caractérisation pour Absorption (sous-domaine
  D). **Ce n'est pas une contradiction** : les deux rôles opèrent à des niveaux différents (diagnostic
  plein pour Réactivité, caractérisation secondaire jamais générative pour Absorption) — exactement
  le principe déjà énoncé dans `HYP-ABS-01_V2.md` §7 et à respecter strictement dans toute future
  implémentation pour éviter une double lecture ambiguë à l'écran.
- `dj_contact_time` : confirmative de Réactivité **et** de Absorption depuis V1, rôle inchangé par
  V2 — partage déjà existant, non nouveau.
- **Risque de double interprétation identifié** : si une future UI affiche `dj_rsi` à la fois dans
  l'écran Réactivité (diagnostic) et dans l'écran Absorption (caractérisation), sans libellé
  distinguant clairement les deux registres, un praticien pourrait lire une contradiction là où il
  n'y en a pas. Point à traiter au moment de la conception d'écran, pas résolu ici.

---

## 8. Core Absorption — localisation exacte dans le code

| Variable cible | KPI Kinexus | Où elle est calculée | Où elle est consommée aujourd'hui | Qualité(s) actuelle(s) | Rôle HYP V2 |
|---|---|---|---|---|---|
| Eccentric Deceleration RFD/BM | `cmj_braking_rfd` | Import CSV ForceDecks (`fdVal`/`FD_KPI_PATTERNS`, non détaillé ici) | `computeTestStatus('cmj',...)` (non distingué) **+** Profil Absorbeur (`index.html:1989`, discriminante) | Force, Explosivité, Puissance, Réactivité, Absorption (via `cmj`, poids TFM) **+** "Absorbeur" (profil biomécanique) | Diagnostique Core |
| Eccentric Deceleration Impulse/BM | `cmj_braking_impulse` | idem | `computeTestStatus('cmj',...)` uniquement — **absente du Profil Absorbeur** | idem (via `cmj`) | Diagnostique Core |
| Force at Zero Velocity | `cmj_force_zero_vel` | idem | `computeTestStatus('cmj',...)` **+** Profil Absorbeur (`index.html:1988`, discriminante) | idem (via `cmj`) **+** "Absorbeur" | Diagnostique Core, nouvellement intégré côté HYP |

**Aucun seuil, aucun poids, aucune règle supplémentaire créés** — les seuils/normes déjà présents
dans le code (`THRESHOLDS`/`NORMS`, déjà utilisés par `applyThr` pour ces trois KPI) suffisent à
produire un statut catégoriel exploitable sans rien inventer.

---

## 9. Architecture d'intégration minimale (schéma, non codé)

```
INPUTS (testData.cmj, testData.dj, testData.sldj, testData.landing_*, testData.sllt — inchangés)
   ↓
[nouvelle couche HYP-ABS-01 V2 — à construire]
   ↓
NIVEAU 1 — diagnostic global (Core : cmj_braking_rfd, cmj_braking_impulse, cmj_force_zero_vel)
   ↓
NIVEAU 2 — sous-domaine (A/B/C/D/E)
   ↓
NIVEAU 3 — variables individuelles (statuts déjà produits par applyThr, réutilisés tels quels)
   ↓
NIVEAU 4 — tests responsables (cmj/dj/sldj/landing_*/sllt)
   ↓
EXPLICATION / VALIDATION CROISÉE (sous-domaines B et D, jamais générateurs du Niveau 1)
```

**Fonctions existantes réutilisables, sans réécriture** :
- `applyThr(key,val,pop,age)` — calcul de statut catégoriel par KPI, déjà exploitable KPI par KPI
  (contrairement à `computeTestStatus`, qui agrège tout un test sans distinction).
- `bestVal`, `autoLSI`, `lsiSt` — primitives déjà utilisées pour LOT 1 (`HYP-MOB-01`), directement
  réutilisables pour lire les valeurs brutes de `cmj_braking_rfd` etc.
- **La logique "discriminante/confirmatoire/descriptive" du Profil Absorbeur** (`ProfileVariable`,
  `BiomechanicalProfileDefinition`) — structurellement très proche de "diagnostique/explicative" — un
  point de réutilisation potentiel majeur à évaluer avant d'écrire une nouvelle logique HYP
  spécifique, plutôt qu'une simple analogie de vocabulaire.
- `computeAsymEngine` — inchangé, réutilisé en lecture seule comme déjà prévu par le principe gelé.

**Ne pas réécrire** : `computeMoteur()`, `computeTestStatus()`, `TFM`, le Profil Absorbeur existant —
tous restent la référence du comportement actuel, non modifiée par une future implémentation HYP en
parallèle (cohérent avec le modèle Shadow Mode déjà retenu, `IMPLEMENTATION_READINESS_HYP.md`).

---

## 10. Risque de cascade

| Consommateur | Impact si `functionScores.Absorption` change | Impact si seulement une nouvelle couche HYP parallèle est ajoutée |
|---|---|---|
| `computeMoteur()` | Direct — c'est la fonction qui produirait le nouveau score | Aucun — non modifiée |
| `qualityScores` | Confirmé mort, aucun consommateur — impact nul dans les deux cas | Aucun |
| `functionScores` (consommé par `computeMouvementAnalysis`, Priorisation, RTP) | Direct si le score TFM lui-même change | Aucun si HYP reste une couche additive séparée |
| `computeAsymEngine` | Aucun — architecture séparée, non touchée par un changement de rôle de variable individuelle | Aucun |
| Priorisation (`priorities` dans `computeMoteur`) | Direct — utilise `fSc[fn].status` | Aucun si HYP n'alimente pas encore `priorities` |
| Fil de Raisonnement / `computeMouvementAnalysis` | Indirect — reçoit `functionScores` en paramètre, croise avec le Profil Absorbeur existant | Aucun, sauf si une nouvelle sortie HYP y est ajoutée volontairement |
| ExpertView (9 onglets, dont `hypotheses`/`orientations`/`raisonnement` — collision de nommage déjà identifiée en Phase I) | Indirect via `functionScores` | Risque de collision de nommage si une sortie HYP est affichée sans renommage préalable des onglets existants |
| Historique | Indirect — les bilans historiques utilisent le score TFM au moment de leur création, non recalculé rétroactivement | Aucun |
| Rapport PDF (`buildSportifReport`) | Direct — contient un second appel à `computeMoteur()` déjà identifié en Phase I | Aucun si HYP n'y est pas encore branché |
| Dashboard | Indirect via `functionScores` | Aucun |
| `reportOverrides` | Risque déjà identifié en Phase I (compatibilité avec `reportOverrides.priorities` pour les bilans historiques) — non revérifié dans le détail ici | Aucun tant que HYP n'écrit pas dans `reportOverrides` |

**Conclusion de cette section** : **toute modification de `functionScores.Absorption` lui-même
aurait un impact large et en cascade** sur pratiquement tous les consommateurs déjà cartographiés en
Phase I. **Une couche HYP strictement additive et parallèle (Shadow Mode) a un impact nul sur ces
mêmes consommateurs.**

---

## 11. Plus petit lot implémentable (Shadow Mode)

**Objectif** : calculer le sous-domaine A (Core) de `HYP-ABS-01 V2` en parallèle, sans toucher au
comportement existant.

- **Fichiers à créer** : un nouveau fichier `hyp_engine_abs01_lot1.js` (même pattern que
  `hyp_engine_lot1.js` pour `HYP-MOB-01`), + `tests/hypEngineAbs01Lot1.test.js`.
- **Fichiers à modifier** : **aucun fichier de production** (`index.html` non touché).
- **Fonctions concernées** : réutilisation de `applyThr`, `bestVal`, `autoLSI` extraites d'
  `index.html` par le même mécanisme d'`eval()` déjà utilisé pour LOT 1 (`tests/hypEngineLot1.test.js`).
- **Données utilisées** : `testData.cmj` uniquement pour ce premier lot (KPI `braking_rfd`,
  `braking_impulse`, `force_zero_vel`) — aucune donnée nouvelle, aucune modification du format de
  stockage.
- **Données conservées en parallèle** : `functionScores.Absorption` (TFM) continue d'être le score
  affiché — le nouveau calcul HYP reste silencieux, non branché à l'UI.
- **Tests nécessaires** :
  1. Vérifier que les 3 KPI Core sont lisibles depuis `testData.cmj` avec les primitives existantes.
  2. Reproduire les 6 profils RFD/Impulse/Force@0V de `HYP-ABS-01_V2.md` §4 comme cas synthétiques.
  3. Vérifier `git diff --stat index.html` vide après le lot (non-régression, même méthode que LOT 1).
  4. Cas limite : `cmj_braking_impulse`/`cmj_force_zero_vel` sans seuil/norme résolvable pour la
     population sélectionnée → statut "indisponible", jamais simulé.
- **Aucune conséquence clinique avant validation** : ce lot ne modifie ni n'affiche rien au
  praticien — c'est un calcul silencieux, testé hors production, exactement comme LOT 1 pour
  `HYP-MOB-01`.

**Lot 2 (non fait ici, juste identifié)** : intégrer le sous-domaine D (`dj_rsi`/`dj_contact_time`,
caractérisation) puis E (Peak Landing Force désambiguïsé) — chacun un incrément séparé, testable
indépendamment, avant toute discussion d'affichage.

---

## Rappel — ce qui ne doit surtout pas être modifié

`index.html`, `computeMoteur()`, `computeTestStatus()`, `TFM`, `CLI###`, `computeAsymEngine`, le
Profil Absorbeur existant et les autres profils biomécaniques, les écrans, les rapports, `TFM`
lui-même, `qualityScores` (même mort, non touché), les autres qualités HYP###. Rien de tout cela n'a
été modifié pendant cette mission — uniquement lu.

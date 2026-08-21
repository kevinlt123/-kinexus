# LOT 1B — Validation croisée TFM.mobilite ↔ HYP-MOB-01

## Statut

Analyse hors production, exécutée par `analysis/lot1b_cross_validation.js`. **Aucune modification
d'`index.html`, aucun branchement UI, aucune activation de Shadow Mode.** Le script évalue
`index.html` dans un processus Node isolé pour accéder en lecture seule aux fonctions réelles
(`computeMoteur`, `computeTestStatus`, `effectiveNormPop`), et charge séparément
`hyp_engine_lot1.js` (LOT 1). `git diff --stat index.html` reste vide.

---

## 1. Sources de données localisées

| Donnée | Source réelle | Fonction |
|---|---|---|
| `functionScores.Mobilité` (TFM) | `computeMoteur(testData, questData, pop, age).functionScores['Mobilité']` | `index.html:4184-4244` |
| Statut wblt isolé (comparatif) | `computeTestStatus('wblt', testData.wblt, pop, age)` | `index.html:4171-4182` |
| `HYP-MOB-01` | `computeHypothesisEngine(testData, pop, age, deps).hypotheses['HYP-MOB-01']` | `hyp_engine_lot1.js` (LOT 1) |

Les deux moteurs sont rejouables sur le **même** `testData` d'un bilan — aucune transformation de
données requise, conforme au constat déjà établi (rien n'est persisté au-delà de `testData`/
`questData`, `PHASE_H_TECHNICAL_SPECIFICATION.md` §6).

---

## 2. Limite méthodologique — absence de corpus de bilans réels

**Aucun bilan réel n'est accessible dans cet environnement.** Kinexus persiste exclusivement en
`localStorage` du navigateur (clé `kinexus_v5`, `index.html:4351`) — rien n'est exporté, sérialisé
côté serveur, ni committé dans le dépôt Git (vérifié : aucun fichier `.json`/seed/fixture de bilan
dans le dépôt). Il n'existe donc, dans cette session, aucun jeu de données de production sur
lequel mesurer un taux de concordance réel.

**Ce document présente deux choses distinctes, à ne pas confondre :**
1. Un **outil fonctionnel et vérifié** (`analysis/lot1b_cross_validation.js`), prouvé contre les
   fonctions réelles d'`index.html`, prêt à être exécuté sur un export réel.
2. Un **résultat obtenu sur un jeu de 10 bilans synthétiques**, construits délibérément pour
   exercer les mécanismes de divergence identifiés par lecture du code (pas pour représenter une
   population de patients réelle). Les taux de concordance ci-dessous **ne mesurent pas le
   comportement réel de HYP-MOB-01 sur la patientèle** — ils démontrent que l'outil de mesure
   fonctionne et documentent les catégories de divergence attendues.

**Pour obtenir une mesure réelle** : exporter le contenu de `localStorage.getItem('kinexus_v5')`
depuis un navigateur où l'application a été utilisée (konsole développeur : `copy(localStorage.
getItem('kinexus_v5'))`), l'enregistrer en fichier JSON, puis exécuter :
```
node analysis/lot1b_cross_validation.js chemin/vers/export.json
```
Le script accepte tout tableau d'objets `{id, athlete, testData}` — voir l'en-tête du fichier pour
le format exact.

---

## 3. Résultat sur le jeu de bilans synthétiques

*Sortie réelle de `node analysis/lot1b_cross_validation.js` (aucune valeur modifiée à la main).*

| Bilan | TFM (statut / déficit) | HYP-MOB-01 (état / déficit) | Concordant ? | Cause |
|---|---|---|---|---|
| B01-concordant-normal | vert / normal | absente / normal | ✅ Oui | — |
| B02-concordant-deficitaire-uniforme | orange / déficitaire | retenue_faible / déficitaire | ✅ Oui | — |
| B03-dilution-tfm-masque-hyp-positif | jaune / normal | retenue_faible / déficitaire | ❌ Non | différence attendue (dilution TFM) |
| B04-dilution-tfm-signale-hyp-absent | vert / normal | absente / normal | ✅ Oui | — |
| B05-wblt-seul-lsi-faible-cotes-normaux | orange / déficitaire | retenue_faible / déficitaire | ✅ Oui | — |
| B06-asymetrie-franche-un-cote-rouge | jaune / normal | retenue_faible / déficitaire | ❌ Non | différence attendue (dilution TFM) |
| B07-wblt-indisponible | vert / normal | absente / normal | ✅ Oui | — |
| B08-wblt-seul-aucun-autre-test-actif-deficitaire | orange / déficitaire | retenue_faible / déficitaire | ✅ Oui | — |
| B09-wblt-seul-aucun-autre-test-actif-normal | vert / normal | absente / normal | ✅ Oui | — |
| B10-borderline-jaune-des-deux-cotes | vert / normal | absente / normal | ✅ Oui | — |

### Détail des preuves

| Bilan | Preuve diagnostique (HYP) | Preuve confirmative (HYP) | Statut wblt seul (TFM, `computeTestStatus`) |
|---|---|---|---|
| B01 | wblt_distance=normal | wblt_distance_lsi=normal | vert |
| B02 | wblt_distance=deficitaire | wblt_distance_lsi=deficitaire | orange |
| B03 | wblt_distance=deficitaire | wblt_distance_lsi=deficitaire | orange |
| B04 | wblt_distance=normal | wblt_distance_lsi=normal | vert |
| B05 | wblt_distance=deficitaire | wblt_distance_lsi=deficitaire | orange |
| B06 | wblt_distance=deficitaire | wblt_distance_lsi=deficitaire | rouge |
| B07 | wblt_distance=indisponible | wblt_distance_lsi=indisponible | (indisponible) |
| B08 | wblt_distance=deficitaire | wblt_distance_lsi=deficitaire | orange |
| B09 | wblt_distance=normal | wblt_distance_lsi=normal | vert |
| B10 | wblt_distance=normal | wblt_distance_lsi=normal | jaune |

---

## 4. Classification des divergences — mécanismes identifiés par le code

Deux mécanismes de divergence, distincts, mesurés séparément par le script (comparaison à trois
termes : TFM complet / wblt seul via `computeTestStatus` / HYP-MOB-01) :

### a) Différence attendue — dilution TFM
`TFM['Mobilité']` agrège **5 tests pondérés** (`index.html:750`) :
`wblt`(poids 3) · `df_iso`(2) · `inv_iso`(1) · `ev_iso`(1) · `ybt`(1) — alors que `HYP-MOB-01` ne
lit que `wblt_distance`, conformément à la règle déjà actée dans `HYP_ARCHITECTURE_PHASE_C.md`
("la mobilité de cheville repose exclusivement sur ce test"). Toute divergence où le statut wblt
seul (`computeTestStatus`) diffère du statut TFM complet, en présence de données actives sur
`df_iso`/`inv_iso`/`ev_iso`/`ybt`, relève de ce mécanisme. **Observé sur B03 et B06** : dans les
deux cas, wblt seul est déjà déficitaire (orange/rouge), mais le poids combiné des 4 autres tests
(tous excellents) dilue l'agrégat TFM jusqu'à jaune — sous le seuil de déficit TFM (rouge/orange),
alors que `HYP-MOB-01`, ignorant ces tests par construction, reste correctement déficitaire.

### b) Différence due au modèle d'état
`computeTestStatus()` pondère un signal LSI (poids 3, via `lsiSt()`, `index.html:3517`) en plus des
deux côtés (poids 2 chacun), avec une règle d'escalade catégorielle (`hasR&&vert→jaune`,
`maj>=2→orange`) ; `computeHypothesisEngine()` (LOT 1) retient uniquement "un côté rouge/orange
⇒ déficitaire", sans LSI ni escalade — un choix de conception déjà documenté dans
`LOT1_HYP_MOB01_DESIGN.md` §1.

**Constat empirique sur ce jeu de 10 bilans : aucune divergence de ce type n'a été observée.**
Analyse du mécanisme : les bandes de seuil de `wblt_distance` (`vert:12, jaune:10, orange:8`) sont
suffisamment resserrées pour qu'un écart D/G assez large pour faire échouer le signal LSI
(`lsiSt`, seuils 95/90/80) coïncide quasi systématiquement avec au moins un côté franchissant déjà
le seuil orange/rouge d'`applyThr` — auquel cas `HYP-MOB-01` détecte le déficit par sa propre règle
"pire côté", indépendamment du LSI. Une divergence pure "modèle d'état" (sans dilution) semble donc
**structurellement rare, voire inatteignable, pour ce test précis** compte tenu des seuils actuels
— un résultat empirique, pas une supposition, mais qui n'a été vérifié que sur des cas construits
à la main, pas sur une distribution réelle de valeurs.

### c) Anomalie potentielle
Aucune occurrence sur ce jeu — catégorie conservée dans le script pour toute divergence qui ne
s'expliquerait ni par la dilution ni par le modèle d'état.

---

## 5. Résumé

- **Bilans analysés** : 10 (synthétiques — voir limite méthodologique, §2)
- **Taux de concordance** : 8/10 (80 %)
- **Taux de divergence** : 2/10 (20 %)
- **Typologie des divergences** : 2/2 — dilution TFM (mécanisme a). 0 — modèle d'état. 0 — anomalie.

**Cette mesure ne peut pas être généralisée à la patientèle réelle** : le jeu de bilans a été conçu
pour démontrer les mécanismes, pas échantillonné depuis des données réelles. Le taux de divergence
réel dépendra de la fréquence, en pratique clinique, des profils où `wblt` diverge des 4 autres
tests contribuant à `TFM['Mobilité']` — une question qui ne peut être tranchée qu'avec un export
réel (§2).

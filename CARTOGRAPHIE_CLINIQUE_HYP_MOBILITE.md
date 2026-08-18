# Cartographie clinique HYP — Mobilité

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.
`HYP-MOB-01` est déjà entièrement spécifiée et prototypée (additif, hors production) dans
`hyp_engine_lot1.js` — cette fiche resynthétise l'état réel sans rouvrir ces décisions.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `wblt_distance` | Weight-Bearing Lunge Test (unilatéral, 1 seul KPI) | Distance (cm) | ↓ | Diagnostique unique (documenté) |

Convergence documentée : **1 seule variable suffit** — `ruleVariant:'mobilite_exception'`
(`hyp_engine_lot1.js`), exception explicite au principe transversal "≥2 preuves" appliqué aux
autres qualités. Un côté (D ou G) suffisamment déficitaire (orange/rouge) rend la preuve
déficitaire — lecture "pire côté", pas une règle nouvelle.

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `wblt_distance` | Non revérifiée dans cette analyse (repli déjà confirmé suffisant) | **Oui** (vert 12/jaune 10/orange 8, dir min) | **Toujours** |

Test unilatéral : `bestVal` sur chaque côté (D/G), LSI calculé (`autoLSI` ou `lsiAuto` stocké).

États réellement productibles (modèle 5 états, seule qualité à l'utiliser réellement dans le code
prototype) : `absente` (les deux côtés normaux) ou `retenue_faible` directement (un côté
déficitaire) — **aucun état intermédiaire `suspectee`/`retenue_moderee`/`retenue_forte`** :
mécanisme à preuve unique, aucun seuil de convergence intermédiaire n'existe structurellement pour
cette qualité (ADR-005). Support plafonné à `'faible'` (ADR-008) — jamais `'moderee'`/`'forte'`,
la couche explicative étant structurellement vide.

---

### 2. EXPLICATION DU DÉFICIT

**Aucune variable explicative** — fait déjà établi (`HYP_ARCHITECTURE_PHASE_C.md`), pas une
lacune de cette analyse. `explanatoryPhysio`/`explanatoryBiomeca` sont des listes vides par
construction dans `hyp_engine_lot1.js` (`HYP_CATALOG['HYP-MOB-01']`).

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **`wblt_lsi`** : confirmative auto-référentielle (dérivée de la même mesure que le diagnostic,
  ADR-008) — enregistrée pour traçabilité, **n'élève jamais le support** au-delà de `'faible'`.
- **`wblt_asymmetry`** : documentée dans la fiche de qualité, rôle non revérifié dans cette
  analyse (hors périmètre du diagnostic Core, déjà tranché).
- **Aucun autre test de validation croisée documenté** pour Mobilité.

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- « Déficit de mobilité de cheville objectivé par `wblt_distance` (6 cm), sous le seuil clinique. »
- « Un seul côté est déficitaire (D : 6 cm, G : 14 cm) — suffisant pour retenir l'hypothèse, lecture
  du pire côté. »
- « Le LSI confirme l'asymétrie, mais n'élève pas le niveau de support au-delà de faible — aucune
  variable explicative disponible pour renforcer davantage. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut jamais dire « support modéré » ou « support fort » — couche explicative
  structurellement vide, plafond ADR-008 respecté.
- Il ne peut pas expliquer *pourquoi* la mobilité est réduite (aucune variable physiologique ou
  biomécanique documentée pour cette qualité).
- Il ne peut pas croiser ce déficit avec un autre test — aucun test de validation croisée
  documenté.

---

### 6. Vérification directe dans le code

`wblt_distance` vérifié `TESTS` (`TBK.wblt`, bilateral:false, kpis:[{key:'distance',dir:'max'}]),
`THRESHOLDS` (`wblt_distance:{vert:12,jaune:10,orange:8}`, repris tel quel dans
`hyp_engine_lot1.js` et `tests/hypEngineLot1.test.js`, 13 tests passants).

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `wblt_distance` | Oui, seule variable, toujours classifiable | — | — | Code + document | **Opérationnel** (déjà prototypé, non branché en production) |
| `wblt_lsi` | Non | — | Confirmative auto-référentielle, jamais génératrice | Document | Rôle documenté, respecté |
| `wblt_asymmetry` | Non revérifiée ici | Non revérifiée ici | — | Document | NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES (hors périmètre de cette analyse) |

# Cartographie clinique HYP — Puissance

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.

**Mise à jour (MISSION P3, mise à jour documentaire)** : ce document contenait des affirmations
devenues obsolètes sur la couverture de `slcmj_peak_power` (section 1, 4, 5, 6 et tableau final),
corrigées ci-dessous suite à l'audit clinique P2 de HYP-PUI-01 (`HYP_PUI01_REGLE_FINALE_GELEE.md`
non concerné, AND strict inchangé). Aucun changement de code, de seuil, de norme ou de règle
clinique n'accompagne cette mise à jour.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `cmj_peak_power` | CMJ (bilatéral) | Peak Power (W/kg) | ↓ | Diagnostique principal (documenté) |
| `slcmj_peak_power` | SLCMJ (unilatéral) | Peak Power (W/kg) | ↓ | Diagnostique principal unilatéral (documenté) |
| `dj_peak_prop_power` / `sldj_peak_prop_power` / `cmjr_peak_power` | DJ/SLDJ/CMJR | Puissance de propulsion | ↓ | Diagnostique **secondaire** — mobilisé uniquement en l'absence des deux tests principaux, jamais en renfort à poids égal (`HYP_ARCHITECTURE_PHASE_C.md`, gel point 5) |

Convergence documentée (`CLI040`) : les **deux** preuves principales déficitaires **conjointement**
(`cmj_peak_power` **et** `slcmj_peak_power`) — la condition la plus stricte identifiée dans toute
la matrice Niveau 1.

**Vérification code — seuils réellement disponibles** (mise à jour P3 : les deux variables passent
par `computeStatusWithNormsV2()`, qui interroge `NORMS_V2` UNIQUEMENT si `normSelections` fournit un
sélecteur explicite — objet `{population_vald, source_id, sexe, age_band}` — pour le test concerné ;
en l'absence de sélecteur objet, le mécanisme retombe sur le référentiel legacy `NORMS`/`applyThr`,
strictement inchangé) :

| Variable | NORMS (legacy) | NORMS_V2 | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|---|
| `cmj_peak_power` | Oui — 45 populations (`NORMS[pop].cmj_peak_power`) | Oui — 60 entrées | Non | Presque toujours (legacy sans sélecteur objet ; NORMS_V2 si sélecteur objet fourni et couvert) |
| `slcmj_peak_power` | **Aucune** (0 population) | **Oui — 36 entrées, 9 `population_vald` distinctes** | **Aucun** | **Conditionnelle : classifiable UNIQUEMENT si un sélecteur `normSelections.slcmj` (objet) explicite et couvert par NORMS_V2 est fourni ; jamais par défaut, jamais choisi implicitement par le système** |

**Constat corrigé (obsolète avant P3)** : l'ancienne affirmation « `slcmj_peak_power` n'a aucune
entrée `NORMS` ni `THRESHOLDS` [...] ne peut jamais être classifié » ne tenait pas compte de
`NORMS_V2`, un troisième référentiel (distinct de `NORMS`/`THRESHOLDS`) déjà actif dans le code et
consommé par `computeHypPowerSlcmj()` via `computeStatusWithNormsV2()`. En réalité :
- `slcmj_peak_power` **peut** être classifié vert/jaune/orange/rouge, mais **seulement** quand
  l'appelant fournit explicitement un sélecteur de population NORMS_V2 pour le test `slcmj`, et que
  ce sélecteur résout une entrée `NORMS_V2.slcmj_peak_power` réelle et cliniquement active ;
- sans sélecteur explicite (cas le plus courant en pratique aujourd'hui, ex. absence de
  `normSelections.slcmj`), ou si la population demandée n'est pas couverte par les 9
  `population_vald` disponibles, `slcmj_peak_power` reste **non classifiable** — jamais par choix
  automatique d'une population de repli (comportement volontaire, cf. `computeStatusWithNormsV2`,
  LOCKED) ;
- `CLI040` exige toujours les **deux** preuves déficitaires conjointement (`cmj_peak_power` **et**
  `slcmj_peak_power`) — cette exigence n'est **pas** modifiée par cette correction documentaire.

États réellement productibles pour la règle stricte documentée : le "2/2" est **techniquement
atteignable**, mais seulement lorsque (a) `cmj_peak_power` est classifiable (cas fréquent) **et**
(b) `slcmj_peak_power` est explicitement sélectionné pour une population couverte par les 9
`population_vald` de `NORMS_V2.slcmj_peak_power`. En l'absence de cette sélection explicite pour
SLCMJ — situation la plus fréquente en l'état actuel des saisies — `cmj_peak_power` seul reste
insuffisant, au sens strict de `CLI040`, pour retenir un déficit global de Puissance ; le moteur
reste alors `non_determinable`, jamais un faux positif ou un repli sur une seule preuve.

---

### 2. EXPLICATION DU DÉFICIT

| Variable | Mécanisme renseigné | Relation avec le déficit | Rôle |
|---|---|---|---|
| `imtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf`, `slimtp_*` | Force et vitesse de production de force | Peut expliquer un déficit de puissance par un déficit de force ou de RFD sous-jacent | Explicatif uniquement (documenté) |
| `profil_fv_nkg`, `profil_fv_v0` | Profil force-vitesse | Situe le déficit sur l'axe force ou vitesse | Explicatif uniquement |
| Force segmentaire `_n`/`_nkg` (mêmes 8 familles que Force, **sans** `sh_iso_*` — non cité dans la fiche Puissance) | Contribution locale | Explicatif | Explicatif uniquement |
| Stratégie CMJ/SLCMJ (`cmj_peak_vel`, `cmj_tto`, `cmj_depth`, `cmj_conc_mean_force`, `cmj_conc_rfd`, `cmj_braking_duration`, etc. — 29 KPIs documentés dans `HYP_ARCHITECTURE_PHASE_B.md`) | Stratégie d'exécution du saut | Peut expliquer *comment* la puissance est produite | Explicatif biomécanique uniquement |

Aucune de ces variables n'est promue diagnostique — respecté ici.

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **`cmj_height`, `single_hop_distance`, `triple_hop_distance`** : confirmatives, jamais
  diagnostiques (gel, point 6 — `cmj_height` en particulier explicitement exclue du rôle
  diagnostique malgré la tentation de l'utiliser comme proxy de puissance).
- **Aucune décomposition segmentaire dédiée** (`HYP_ARCHITECTURE_PHASE_C.md`, note structurelle) —
  un déficit de puissance expliqué par la force segmentaire renvoie au Niveau 2 de **Force**
  (`CLI200`-`211`), pas à une section propre à Puissance.
- **Preuve secondaire (DJ/SLDJ/CMJR)** : rôle de suppléance uniquement — ne module jamais la
  confiance d'un diagnostic déjà établi par les tests principaux (gel, point 5).

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- « `cmj_peak_power` est réduit — signal isolé, insuffisant pour conclure à un déficit global de
  Puissance selon la règle des deux preuves conjointes. »
- « Ce signal est associé à un profil force-vitesse orienté force (`profil_fv_v0` réduit), pouvant
  contribuer à expliquer le résultat. »
- « `slcmj_peak_power` n'est pas classifiable pour cette sélection — soit aucun sélecteur NORMS_V2
  explicite n'a été fourni pour SLCMJ, soit la population demandée n'est pas couverte — deuxième
  preuve requise non disponible dans ce contexte. »
- « `slcmj_peak_power` est classifiable pour la population sélectionnée (NORMS_V2) — la seconde
  preuve requise par `CLI040` est disponible ; la conclusion dépend alors de la convergence avec
  `cmj_peak_power`. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut dire « déficit de Puissance confirmé (2/2) » au sens strict de `CLI040` que si
  `slcmj_peak_power` a été explicitement sélectionné pour une population couverte par NORMS_V2 —
  sans cette sélection, la deuxième preuve reste indisponible et la conclusion 2/2 impossible.
- Il ne doit **jamais** choisir lui-même une population de repli pour rendre `slcmj_peak_power`
  classifiable — l'absence de sélection explicite doit rester `non classifiable`, jamais interprétée
  comme une preuve préservée ni comme un déficit.
- Il ne peut pas s'appuyer sur la preuve secondaire (`dj_peak_prop_power` etc.) : vérifié dans le
  code (`computeHypPowerSubstitutes`), ces 3 substituts n'ont aujourd'hui aucun seuil — branche
  structurellement inerte, conservée pour activation automatique future.
- Il ne peut pas substituer l'asymétrie/LSI de `slcmj_peak_power` à sa performance absolue : le
  statut diagnostique de `slcmj_peak_power` (`computeHypPowerSlcmj`) est dérivé exclusivement de la
  classification absolue du pire côté (D ou G) via NORMS_V2/`computeStatusWithNormsV2` ; le champ
  `symmetryEvidence` (LSI D/G) est calculé séparément et n'entre jamais dans ce statut diagnostique.
- Il ne peut pas relier un déficit de puissance à un segment musculaire précis (aucune section
  Niveau 2 dédiée).

---

### 6. Vérification directe dans le code

`cmj_peak_power`/`slcmj_peak_power` vérifiés `TESTS`/`CMJ_VAR_META` (`index.html:112,123`) ;
`NORMS` legacy (45 populations pour `cmj_peak_power`, **0** pour `slcmj_peak_power`) ; `THRESHOLDS`
(`index.html:1214`, aucune entrée pour l'un ou l'autre) ; `NORMS_V2` (`index.html:1973` pour
`slcmj_peak_power`, 36 entrées / 9 `population_vald` distinctes ; entrée `cmj_peak_power` également
présente, 60 entrées) — consommé exclusivement via `computeStatusWithNormsV2()`
(`index.html:2190`), jamais directement, et jamais sans sélecteur objet explicite par test.

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `cmj_peak_power` | Oui (classifiable — legacy NORMS ou NORMS_V2 selon sélection) | — | — | Code + document | Opérationnel seul, insuffisant pour la règle 2/2 |
| `slcmj_peak_power` | Oui — **classifiable conditionnellement** (NORMS_V2, sélecteur explicite requis, 9 populations couvertes) | — | — | Code + document | Bloquant en l'absence de sélection explicite couverte — règle 2/2 alors non atteinte (jamais un bug : comportement volontaire) |
| `dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power` | Diagnostique secondaire documenté, seuils non revérifiés ici | — | — | Document | NON DÉTERMINABLE (seuils à vérifier séparément) |
| `imtp`/`slimtp` (RFD, force) | Non | Oui | — | Document | Rôle documenté, seuils non revérifiés ici |
| `profil_fv_nkg`/`v0` | Non | Oui | — | Document | Rôle documenté |
| Stratégie CMJ/SLCMJ (29 KPIs) | Non | Oui | — | Document | Rôle documenté |
| `cmj_height`/`single_hop_distance`/`triple_hop_distance` | Non | — | Confirmative | Document | Rôle documenté |

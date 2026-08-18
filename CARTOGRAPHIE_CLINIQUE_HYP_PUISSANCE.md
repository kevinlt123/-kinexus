# Cartographie clinique HYP — Puissance

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.

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

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `cmj_peak_power` | Oui — très large (≥15 populations sport + tables générales) | Non | Presque toujours |
| `slcmj_peak_power` | **Aucune** | **Aucun** | **Jamais** |

**Constat important** : `slcmj_peak_power` n'a **aucune entrée `NORMS` ni `THRESHOLDS`** dans le
code actuel (apparaît uniquement dans le catalogue de métadonnées, `index.html:4009`) —
contrairement à `cmj_peak_power`, très largement couvert. Or `CLI040` exige explicitement les
**deux** preuves déficitaires conjointement. **Cette condition, telle que documentée, ne peut
aujourd'hui jamais être satisfaite** : `slcmj_peak_power` ne peut jamais être classifié
vert/jaune/orange/rouge.

États réellement productibles pour la règle stricte documentée : **aucun** — la condition "2/2"
est structurellement inatteignable avec la couverture de seuils actuelle. Seul `cmj_peak_power`
peut aujourd'hui produire un statut individuel — insuffisant, au sens strict de `CLI040`, pour
retenir un déficit global de Puissance.

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
- « `slcmj_peak_power` n'est pas classifiable pour cette population — deuxième preuve requise non
  disponible aujourd'hui. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut **jamais** dire « déficit de Puissance confirmé (2/2) » au sens strict de `CLI040` —
  `slcmj_peak_power` n'a aucun seuil.
- Il ne peut pas s'appuyer sur la preuve secondaire (`dj_peak_prop_power` etc.) sans vérification
  séparée de leurs seuils — non vérifiés dans cette analyse (hors périmètre des 2 diagnostiques
  principaux).
- Il ne peut pas relier un déficit de puissance à un segment musculaire précis (aucune section
  Niveau 2 dédiée).

---

### 6. Vérification directe dans le code

`cmj_peak_power`/`slcmj_peak_power` vérifiés `TESTS`/`CMJ_VAR_META` (`index.html:112,123`),
`NORMS` (multiples occurrences pour `cmj_peak_power`, aucune pour `slcmj_peak_power`),
`THRESHOLDS` (`index.html:1214`, aucune entrée pour l'un ou l'autre).

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `cmj_peak_power` | Oui (seul, classifiable) | — | — | Code + document | Opérationnel seul, insuffisant pour la règle 2/2 |
| `slcmj_peak_power` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant — règle 2/2 inatteignable |
| `dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power` | Diagnostique secondaire documenté, seuils non revérifiés ici | — | — | Document | NON DÉTERMINABLE (seuils à vérifier séparément) |
| `imtp`/`slimtp` (RFD, force) | Non | Oui | — | Document | Rôle documenté, seuils non revérifiés ici |
| `profil_fv_nkg`/`v0` | Non | Oui | — | Document | Rôle documenté |
| Stratégie CMJ/SLCMJ (29 KPIs) | Non | Oui | — | Document | Rôle documenté |
| `cmj_height`/`single_hop_distance`/`triple_hop_distance` | Non | — | Confirmative | Document | Rôle documenté |

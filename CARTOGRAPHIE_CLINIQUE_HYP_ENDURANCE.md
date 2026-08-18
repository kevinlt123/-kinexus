# Cartographie clinique HYP — Endurance

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `heel_raise_reps` | Heel Raise (unilatéral) | Répétitions | ↓ | Diagnostique (documenté) |
| `repeated_hop_n_hops` | Hop Test (unilatéral) | Nombre de sauts | ↓ | Diagnostique (documenté, fiche de qualité — omis de `CLI080`, écart mineur déjà noté sans conséquence) |
| `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue` | Hop Test | Indices de dégradation (%) | ↑ (fatigue/dérive) | Diagnostique (documenté) |

Convergence documentée (`CLI080`) : **deux preuves diagnostiques déficitaires**.

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `heel_raise_reps` | Non | **Oui** (vert 25/jaune 20/orange 15, dir max) | **Toujours** |
| `repeated_hop_n_hops` | **Aucune** | **Aucun** | **Jamais** |
| `repeated_hop_rsi_fatigue` | **Aucune** | **Aucun** | **Jamais** |
| `repeated_hop_height_fatigue` | **Aucune** | **Aucun** | **Jamais** |
| `repeated_hop_ct_drift` | **Aucune** | **Aucun** | **Jamais** |
| `repeated_hop_stiffness_fatigue` | **Aucune** | **Aucun** | **Jamais** |

**Constat important, non documenté ailleurs** : sur les 6 variables diagnostiques citées, **seule
`heel_raise_reps` a un seuil clinique** dans le code actuel (repli `THRESHOLDS` fixe, sans donnée
`NORMS`). Les 5 variables `repeated_hop_*` — la majorité du pool diagnostique documenté — n'ont
**aucune** entrée `NORMS` ni `THRESHOLDS`, malgré leur rôle central dans la fiche de qualité et
`CLI080`. **La règle documentée "deux preuves diagnostiques déficitaires" est aujourd'hui
inatteignable** : une seule des 6 variables citées peut jamais produire un statut.

États réellement productibles : un statut individuel sur `heel_raise_reps` seul (`ok`/déficitaire
isolé) — jamais un "2/2" au sens strict de `CLI080`, faute d'une seconde preuve classifiable.

---

### 2. EXPLICATION DU DÉFICIT

| Variable | Mécanisme renseigné | Relation avec le déficit | Rôle |
|---|---|---|---|
| `imtp_n`/`nkg`, `slimtp_*`, `iso_belt_squat_*`, `sl_iso_push_*` | Force maximale | Peut expliquer une fatigabilité par un déficit de force sous-jacent | Explicatif uniquement (documenté) |
| Force segmentaire complète (`n`/`nkg`, 11 familles) | Contribution locale | Explicatif | Explicatif uniquement |
| Cinétique complète (15 familles RFD) | Vitesse de production de force | Explicatif | Explicatif uniquement |
| `repeated_hop_mean_height`/`mean_rsi`/`mean_peak_force`/`mean_ct`, `best_height`/`best_rsi`, `height_cv`/`ct_cv`/`rsi_cv` | Performance moyenne/meilleure/variabilité du Hop Test | Double rôle confirmatif/explicatif (documenté) | Confirmatif/explicatif — jamais diagnostique |

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **Aucune décomposition segmentaire dédiée** — `CLI080` cite génériquement les *qualités* "Force,
  Explosivité" comme explicatives, pas des variables individuelles (même motif d'abstraction que
  Puissance/`CLI040` et Absorption/`CLI060`).
- **Coefficients de variation** (`height_cv`, `ct_cv`, `rsi_cv`) : confirmatifs, renforcent la
  confiance sans générer seuls le diagnostic.
- **`repeated_hop_mean_stiffness`** : seul KPI du test sans rôle assigné par Vierge_7, nulle part —
  laissé tel quel, non attribué arbitrairement.

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- « `heel_raise_reps` est réduit — signal isolé, insuffisant pour retenir un déficit global
  d'Endurance selon la règle des deux preuves. »
- « Ce signal est associé à une force maximale réduite du soléaire (`soleus_iso_n`), pouvant
  contribuer à expliquer le résultat. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut **jamais** dire « déficit d'Endurance confirmé (2/2) » au sens strict de `CLI080` —
  une seule des 6 variables diagnostiques documentées est classifiable.
- Il ne peut jamais utiliser les indices de fatigue du Hop Test (`rsi_fatigue`, `height_fatigue`,
  `ct_drift`, `stiffness_fatigue`) ni `n_hops` comme preuve — aucun seuil.
- Il ne peut pas relier un déficit d'endurance à un groupe musculaire précis (aucune section
  Niveau 2).

---

### 6. Vérification directe dans le code

`heel_raise_reps` confirmé dans `THRESHOLDS` (`index.html:1214`). `repeated_hop_*` vérifiés
`TESTS` (`index.html:140`, 14 KPI), absents de `NORMS`/`THRESHOLDS`.

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `heel_raise_reps` | Oui, toujours classifiable | — | — | Code + document | Opérationnel seul, insuffisant pour la règle 2/2 |
| `repeated_hop_n_hops` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `repeated_hop_rsi_fatigue`/`height_fatigue`/`ct_drift`/`stiffness_fatigue` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `repeated_hop_mean_height`/`mean_rsi`/`mean_peak_force`/`mean_ct`/`best_*`/`*_cv` | Non | Oui (documenté) | Confirmative | Document | NON DÉTERMINABLE (seuils non revérifiés ici) |
| `imtp`/`slimtp`/`iso_belt_squat`/`sl_iso_push` (force) | Non | Oui | — | Document | Rôle documenté |
| `repeated_hop_mean_stiffness` | Non | Non | Aucun rôle assigné | Document | NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES |

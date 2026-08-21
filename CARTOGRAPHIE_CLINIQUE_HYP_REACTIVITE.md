# Cartographie clinique HYP — Réactivité

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.
Reprend et confirme les arbitrages déjà gelés dans `ARBITRAGE_CLINIQUE_REACTIVITE.md` — non
rouverts ici.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `dj_rsi` | Drop Jump (bilatéral) | RSI | ↓ | Diagnostique principal (documenté) |
| `sldj_rsi` | Single Leg Drop Jump (bilatéral au sens code — 2 côtés indépendants) | RSI | ↓ | Diagnostique principal unilatéral (documenté) |

Convergence documentée (`CLI050`, filtrée par le gel `ARBITRAGE_CLINIQUE_REACTIVITE.md`) : les
**deux** variables diagnostiques réelles déficitaires conjointement. `cmjr_mean_rsi` peut converger
en confirmation, **jamais** compter comme l'une des deux preuves exigées (contradiction `CLI050`
brute déjà signalée et arbitrée dans le gel — non rouverte).

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `dj_rsi` | Oui — très large (≥15 populations) | Oui (vert 1.5/jaune 1.0/orange 0.7) | **Toujours** (repli THRESHOLDS) |
| `sldj_rsi` | Oui (3 populations `foot_*`) | Oui (vert 1.2/jaune 0.8/orange 0.5) | **Toujours** (repli THRESHOLDS) |

**Constat** : contrairement à Force/Puissance/Explosivité, les deux variables diagnostiques de
Réactivité sont **toujours** classifiables grâce au repli `THRESHOLDS`, indépendamment de la
population de l'athlète. C'est la seule qualité (avec Mobilité) dont le Niveau 1 documenté est
réellement, entièrement atteignable dans le code actuel.

États réellement productibles : `ok` (les deux normales), un déficit isolé sur une seule variable
(insuffisant pour "2/2"), `deficitaire` (les deux effectivement déficitaires) — les trois états
sont réellement atteignables.

---

### 2. EXPLICATION DU DÉFICIT

| Variable | Mécanisme renseigné | Relation avec le déficit | Rôle |
|---|---|---|---|
| `imtp_rfd100`/`rfd200`/`ttpf`, `slimtp_*`, `iso_belt_squat_*`, `sl_iso_push_*`, `iso_squat_hold_*` | Vitesse de production de force | Peut expliquer une réactivité réduite par une limitation de RFD isométrique | Explicatif uniquement |
| Cinétique segmentaire (11 familles RFD) | Contribution locale | Explicatif | Explicatif uniquement |
| `profil_fv_nkg`/`v0` | Profil force-vitesse | Explicatif | Explicatif uniquement |
| `dj_contact_time`/`leg_stiffness`/`peak_landing_force`/`landing_impulse`/`peak_prop_force`/`peak_prop_power` (et équivalents `sldj_*`) | Mécanique du contact au sol | Double rôle confirmative/explicative (documenté) | Explicatif/confirmatif — **jamais diagnostique** |
| `cmjr_mean_ct`, `mean_stiffness`, `mean_rebound_height`, `mean_rsi`, `rsi_decay`, `stiffness_decay` | CMJR — contact/raideur/décroissance répétée | **Entièrement explicatif** — jamais diagnostique, malgré `CLI050` (contradiction déjà exposée et arbitrée dans le gel `ARBITRAGE_CLINIQUE_REACTIVITE.md`) | Explicatif uniquement, décision gelée |

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **Confirmatives** (`dj_contact_time`, `dj_peak_prop_force`, `dj_peak_prop_power`,
  `dj_leg_stiffness`, `dj_height`, `dj_landing_impulse`, `dj_peak_landing_force`, équivalents
  `sldj_*`, `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance`) : documentées,
  renforcent la confiance sans générer seules le diagnostic.
- **Repeated Hop, Heel Raise, Side Hop** : exclus de Réactivité par le gel
  (`ARBITRAGE_CLINIQUE_REACTIVITE.md`) malgré des poids `reactivite` non nuls dans `TFM` — écart
  `TFM`/HYP déjà exposé et non corrigé (hors périmètre HYP, `TFM` inchangé).
- **Aucune décomposition segmentaire dédiée** — `CLI050` cite génériquement "RFD"/"Stiffness"
  comme explicatives, sans groupe musculaire précis.

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- « Déficit de réactivité objectivé par `dj_rsi` et `sldj_rsi`, tous deux réduits. »
- « Ce déficit est associé à un temps de contact allongé (`dj_contact_time`), pouvant contribuer à
  expliquer le résultat. »
- « Le CMJR montre une décroissance marquée du RSI (`cmjr_rsi_decay`) — signal explicatif
  concordant, jamais un renfort diagnostique. »
- « Une seule des deux preuves principales est déficitaire (`dj_rsi` normal, `sldj_rsi` réduit) —
  signal isolé, insuffisant pour retenir un déficit global de Réactivité. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut pas relier un déficit de réactivité à un groupe musculaire précis (aucune section
  Niveau 2).
- Il ne peut pas utiliser `cmjr_mean_rsi` comme preuve diagnostique — rôle explicatif gelé, même si
  `CLI050` brut le suggère.
- Il ne peut pas s'appuyer sur `repeated_hop`/`heel_raise`/`side_hop` pour Réactivité — exclus par
  le gel, malgré leur présence dans `TFM`.

---

### 6. Vérification directe dans le code

`dj_rsi`/`sldj_rsi` vérifiés `TESTS` (`index.html:125-126`), `THRESHOLDS` (`index.html:1214`,
entrées confirmées pour les deux), `NORMS` (larges pour `dj_rsi`, restreintes pour `sldj_rsi` —
sans conséquence grâce au repli `THRESHOLDS`).

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `dj_rsi` | Oui, toujours classifiable | — | — | Code + document | **Opérationnel** |
| `sldj_rsi` | Oui, toujours classifiable | — | — | Code + document | **Opérationnel** |
| `cmjr_mean_rsi` et variables CMJR | Non (gelé) | Oui | — | Document (gel) | Rôle gelé, respecté |
| `dj_contact_time`/`leg_stiffness`/`peak_landing_force`/`landing_impulse` (+ `sldj_*`) | Non | Oui | Confirmative | Document | Rôle documenté, seuils non revérifiés ici |
| `repeated_hop`/`heel_raise`/`side_hop` | Non | Non | — | Document (gel) | Exclus, écart `TFM` non corrigé |
| `imtp`/`slimtp`/etc. (RFD) | Non | Oui | — | Document | Rôle documenté |

# Cartographie clinique HYP — Explosivité

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `cmj_conc_rfd` | CMJ (bilatéral) | Concentric Rate of Force (N/s) | ↓ | Diagnostique (documenté — 2 des 4 variables visées par Vierge_7 sont réellement calculées, voir ci-dessous) |
| `cmj_conc_impulse_100` | CMJ (bilatéral) | Impulsion concentrique @100ms (Ns/kg) | ↓ | Diagnostique (documenté) |

Vierge_7 vise 4 variables (`CMJ_RFD100`/`150`/`200` + `CMJ_IMPULSE100MS`) ; Kinexus n'en calcule
réellement que 2 (`cmj_conc_rfd` en proxy non fenêtré, `cmj_conc_impulse_100` en correspondance
directe) — déjà documenté dans `HYP_ARCHITECTURE_PHASE_C.md`.

Convergence documentée (`CLI030`) : **≥ 2 des 4 variables déficitaires** — en pratique, comme seules
2 sont mesurées, cela revient à exiger les 2 variables disponibles toutes deux déficitaires
(inférence déjà actée dans le document source, pas nouvelle ici).

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `cmj_conc_rfd` | **Aucune** | **Aucun** | **Jamais** |
| `cmj_conc_impulse_100` | **Aucune** | **Aucun** | **Jamais** |

**Constat important, non documenté ailleurs** : les 2 seules variables réellement calculées et
diagnostiques pour Explosivité n'ont **ni l'une ni l'autre** de seuil `NORMS` ou `THRESHOLDS` dans
le code actuel — elles apparaissent uniquement dans le catalogue de métadonnées narratif
(`index.html:4009`). **Le Niveau 1 diagnostique d'Explosivité est aujourd'hui entièrement
inatteignable** : aucune des deux variables ne peut produire de statut vert/jaune/orange/rouge,
quelle que soit la population de l'athlète.

États réellement productibles : **aucun**. `non_determinable` est le seul état atteignable pour le
diagnostic Explosivité avec la couverture de seuils actuelle.

---

### 2. EXPLICATION DU DÉFICIT

| Variable | Mécanisme renseigné | Relation avec le déficit | Rôle |
|---|---|---|---|
| `imtp_rfd100`/`rfd200`/`ttpf`, `slimtp_*`, `iso_belt_squat_*`, `sl_iso_push_*`, `iso_squat_hold_*` | Vitesse de production de force isométrique | Peut expliquer un déficit de RFD concentrique par une limitation de RFD isométrique | Explicatif uniquement (documenté ; `CLI030` cite une liste plus étroite que la fiche, omettant `sl_iso_push`/`iso_squat_hold` — écart signalé dans le document source, non arbitré ici) |
| Cinétique segmentaire (11 familles RFD) | Contribution locale à la vitesse de force | Explicatif | Explicatif uniquement |
| `profil_fv_nkg`/`v0` | Profil force-vitesse | Explicatif | Explicatif uniquement |
| `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` | Stratégie/capacité excentrique CMJ | Explicatif biomécanique | Explicatif uniquement |
| `cmj_braking_rfd` | Freinage excentrique | 🔧 Correspondance de nommage inférée (`CMJ_ECC_DECEL_RFD`), non confirmée par le praticien (gel point 11) | Explicatif, avec réserve documentée |

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **Aucune décomposition segmentaire dédiée** (note structurelle `HYP_ARCHITECTURE_PHASE_C.md`).
- **Confirmatives** (`cmj_peak_power`, `cmj_conc_peak_force`, `cmj_conc_mean_force`,
  `cmj_conc_impulse`) : documentées, seuils non revérifiés dans cette analyse (hors périmètre du
  Core diagnostique, déjà bloqué en amont — voir §5).
- **Orientations `CLI030`/`CLI031`** : niveaux de preuve différents (2 variables RFD pour `CLI030`,
  1 seule — RFD100 — pour `CLI031`), asymétrie déjà signalée dans le document source.

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- Rien de diagnostique aujourd'hui — aucune combinaison de `cmj_conc_rfd`/`cmj_conc_impulse_100`
  ne peut produire de statut, faute de seuil.
- « `cmj_conc_rfd` est mesuré à telle valeur, mais aucun seuil clinique n'est disponible pour la
  classer. » (constat descriptif, pas un diagnostic)

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut dire **aucun** énoncé diagnostique sur Explosivité aujourd'hui — les deux seules
  variables diagnostiques réellement mesurées sont toutes deux sans seuil.
- Il ne peut pas non plus s'appuyer sur les 2 variables fenêtrées (`RFD150`/`RFD200`) — non
  calculées du tout par Kinexus (déjà documenté, pas une découverte de cette analyse).
- Il ne peut pas relier un déficit à un mécanisme explicatif tant qu'aucun déficit ne peut être
  établi en amont.

---

### 6. Vérification directe dans le code

`cmj_conc_rfd`/`cmj_conc_impulse_100` vérifiés `CMJ_VAR_META` (`index.html:113-114`), absents de
`NORMS` et `THRESHOLDS` (`index.html:1214`, aucune entrée), présents uniquement dans le catalogue
de métadonnées (`index.html:4009`).

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `cmj_conc_rfd` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `cmj_conc_impulse_100` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `cmj_peak_power`/`conc_peak_force`/`conc_mean_force`/`conc_impulse` | Non | — | Confirmative documentée | Document | NON DÉTERMINABLE (seuils non revérifiés ici) |
| `imtp`/`slimtp`/`iso_belt_squat`/`sl_iso_push`/`iso_squat_hold` (RFD) | Non | Oui | — | Document | Rôle documenté, seuils non revérifiés ici |
| Cinétique segmentaire (11 familles) | Non | Oui | — | Document | Rôle documenté |
| `cmj_braking_rfd` | Non | Oui (réserve nommage) | — | Document | 🔧 correspondance non confirmée |

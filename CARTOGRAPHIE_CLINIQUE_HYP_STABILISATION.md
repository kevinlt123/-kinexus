# Cartographie clinique HYP — Stabilisation

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity` | Single Leg Stand (unilatéral, 7 KPIs) | Temps de maintien / trajectoire et vitesse du centre de pression | ↓ (`ttf`) / ↑ (les 6 autres, `dir:'min'`) | Diagnostique (documenté) |
| `eo_surface` | Eyes Open (bilatéral) | Surface de balancement (mm²) | ↑ | Diagnostique (documenté) |
| `ef_surface` | Eyes Closed (bilatéral) | Surface de balancement (mm²) | ↑ | Diagnostique (documenté) |
| `landing_uni_tts`, `landing_bi_tts` | Landing uni/bi | Time to Stabilization | ↑ | Diagnostique contextuel (documenté — voir point ouvert ci-dessous) |

Convergence documentée (`CLI070`) : **deux preuves diagnostiques déficitaires** — mais `CLI070` ne
cite explicitement que **SLS** comme diagnostique ; EO/EC apparaissent en confirmative, pas en
diagnostique ; Strobo/Landing n'apparaissent dans aucune orientation `CLI070`/`CLI071` connue.
Écart déjà documenté (`HYP_ARCHITECTURE_PHASE_C.md`), non arbitré ici.

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `sls_ttf` | **Aucune** | **Aucun** | **Jamais** |
| `sls_cop_path`/`cop_vel`/`ellipse_area`/`cop_range_ml`/`cop_range_ap`/`mean_velocity` | **Aucune** | **Aucun** | **Jamais** |
| `eo_surface` | **Aucune** | **Aucun** | **Jamais** |
| `ef_surface` | **Aucune** | **Aucun** | **Jamais** |
| `landing_uni_tts`, `landing_bi_tts` | Non | **Oui** (vert 0.8/1.2/1.8 et 0.6/1.0/1.5, dir min) | Toujours |

**Constat important, non documenté ailleurs** : **les 7 KPI de SLS et les surfaces EO/EF n'ont
aucun seuil clinique dans le code actuel** — ni `NORMS` ni `THRESHOLDS`, malgré leur rôle
diagnostique central documenté. Seuls `landing_uni_tts`/`landing_bi_tts` sont réellement
classifiables aujourd'hui pour Stabilisation. Le déclencheur diagnostique explicite de `CLI070`
(SLS) est donc structurellement **inatteignable**, alors même que les deux variables non citées
comme diagnostiques par `CLI070` (Landing) sont les seules réellement opérationnelles.

États réellement productibles : un statut ne peut aujourd'hui provenir **que** de
`landing_uni_tts`/`landing_bi_tts` — jamais de SLS/EO/EF/Strobo. La règle documentée "deux preuves
diagnostiques" ne peut donc porter que sur ces 2 variables Landing au mieux.

---

### 2. EXPLICATION DU DÉFICIT

| Variable | Mécanisme renseigné | Relation avec le déficit | Rôle |
|---|---|---|---|
| `hip_abd_rfd100`/`rfd200`, `hip_ext_rfd100`/`rfd200`, `hip_add_rfd100`, `inv_iso_rfd100`, `ev_iso_rfd100`, `df_iso_rfd100` | Vitesse de production de force des stabilisateurs | Peut expliquer un déficit de stabilisation par une limitation neuromusculaire locale | Explicatif uniquement (documenté) |
| `wblt_distance` | Mobilité fonctionnelle de cheville | Peut expliquer une stratégie de stabilisation compensée | Explicatif uniquement |
| `strobo_surface` | Contrôle visuel dynamique | Double rôle confirmative/explicative (documenté) | Explicatif/confirmatif |

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **`landing_bi_peak_landing_force`** : exclu de Stabilisation par le gel — absent de
  `CLI070`/`CLI071`, cohérent avec l'exclusion (aucun changement).
- **SLLT** : absent de toute section Stabilisation, sous quelque nom que ce soit — cohérence
  renforcée avec la décision déjà actée en amont (SLLT n'a aucune place légitime ici).
- **Point ouvert, non résolu ici** : `landing_uni_tts` est diagnostique dans la fiche de qualité
  mais absent des deux seules orientations `CLI###` connues de Stabilisation — écart de couverture
  entre le niveau diagnostique et le niveau orientation, documenté, pas arbitré.
- **Quasi-duplication documentée avec `HYP-CSM-01`** (`CLI090` couvre EO/EC/Strobo/SLS ensemble) —
  `HYP-CSM-01` reste suspendue par instruction explicite, non traitée ici.

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- « `landing_uni_tts` et `landing_bi_tts` sont tous deux allongés — signal de stabilisation
  réduite après réception. »
- « Ce signal est associé à une RFD réduite des abducteurs de hanche (`hip_abd_rfd100`), pouvant
  contribuer à expliquer le résultat. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut **jamais** dire « déficit de stabilisation confirmé par SLS » — aucun des 7 KPI SLS
  n'a de seuil.
- Il ne peut jamais utiliser EO/EF (`eo_surface`/`ef_surface`), pourtant citées comme diagnostiques
  — aucun seuil.
- Il ne peut pas atteindre la règle documentée "2 preuves diagnostiques" sur son périmètre complet
  — seules 2 variables (Landing TTS) sont classifiables, sur un total de 10 documentées.
- Il ne peut pas déclencher `CLI070` (orientation Vierge_7) puisque celle-ci exige un déficit SLS,
  structurellement inatteignable.

---

### 6. Vérification directe dans le code

`sls`/`eo`/`ef`/`strobo` vérifiés `TESTS` (`index.html:130-133`), absents de `NORMS`/`THRESHOLDS`.
`landing_uni_tts`/`landing_bi_tts` confirmés dans `THRESHOLDS` (`index.html:1214`).

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `sls_ttf`/`cop_path`/`cop_vel`/`ellipse_area`/`cop_range_ml`/`cop_range_ap`/`mean_velocity` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `eo_surface` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `ef_surface` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Bloquant |
| `landing_uni_tts` | Oui, toujours classifiable | — | Absent de `CLI070`/`CLI071` (écart non résolu) | Code + document | Opérationnel, orientation clinique absente |
| `landing_bi_tts` | Oui, toujours classifiable | — | — | Code + document | Opérationnel |
| `strobo_surface` | Non (aucun seuil) | Oui (documenté) | — | Document | NON DÉTERMINABLE (aucun seuil) |
| `hip_abd`/`hip_ext`/`hip_add`/`inv_iso`/`ev_iso`/`df_iso` (RFD) | Non | Oui | — | Document | Rôle documenté |
| `wblt_distance` | Non (pour Stabilisation) | Oui | — | Document | Rôle documenté |

# Phase B — Matrice VARIABLE → QUALITÉ → RÔLE

## Statut de ce document

Compagnon de `HYP_ARCHITECTURE_PHASE_B.md`, construit pour identifier immédiatement les doublons,
conflits et contaminations potentielles entre les 9 fiches HYP### avant la Phase C. Sans
correction, sans arbitrage.

**Légende des rôles** : D = diagnostique · C = confirmative · EP = explicative physiologique ·
EB = explicative biomécanique · 🚫 = explicitement exclue · *(vide)* = non mentionnée par Vierge_7
pour cette qualité.

**Deux niveaux de granularité** :
- **Partie 1** — matrice condensée par **test** (pas KPI), pour les tests dont le rôle est
  homogène sur tous leurs KPIs au sein d'une même qualité. Couvre la majorité des cas.
- **Partie 2** — matrice détaillée par **KPI**, pour les tests dont le rôle varie selon le KPI et
  la qualité (CMJ, SLCMJ, DJ, SLDJ, CMJR, Repeated Hop) — une vue par test aurait masqué les
  conflits réels.

---

## Partie 1 — Matrice condensée par test

| Test | Force | Puissance | Explosivité | Réactivité | Absorption | Stabilisation | Contrôle Sensori-moteur | Endurance | Mobilité |
|---|---|---|---|---|---|---|---|---|---|
| `imtp` | **D** | EP | EP | EP | EP | 🚫 | 🚫 | EP | 🚫 |
| `slimtp` | **D** | EP | EP | EP | EP | · | 🚫 | EP | · |
| `iso_belt_squat` | **D** | EP | EP | EP | EP | · | 🚫 | EP | · |
| `sl_iso_push` | **D** | EP | EP | EP | EP | · | 🚫 | EP | · |
| `iso_squat_hold` | · | EP | EP | EP | · | · | · | · | · |
| `knee_ext` | EP | EP | EP | EP | EP | 🚫 | · | EP | 🚫 |
| `knee_flex` | EP | EP | EP | EP | · | · | · | EP | · |
| `soleus_iso` | EP | EP | EP | EP | EP | 🚫 | · | EP | 🚫 |
| `gastro_iso` | EP | EP | EP | EP | EP | 🚫 | · | EP | 🚫 |
| `hip_flex` | EP | EP | EP | EP | EP | · | · | EP | · |
| `hip_ext` | EP | EP | EP | EP | EP | EP | EP | EP | · |
| `hip_abd` | EP | EP | EP | EP | EP | EP | EP | EP | · |
| `hip_add` | EP | EP | EP | EP | EP | EP | EP | EP | · |
| `df_iso` | EP | EP | EP | EP | · | EP | EP | EP | · |
| `inv_iso` | EP | EP | EP | EP | · | EP | EP | EP | · |
| `ev_iso` | EP | EP | EP | EP | · | EP | EP | EP | · |
| `rs_hip_push` | **EB** | · | · | · | · | · | · | · | · |
| `rs_knee_push` | **EB** | · | · | · | · | · | · | · | · |
| `rs_ankle_push` | **EB** | · | · | · | · | · | · | · | · |
| `profil_fv` | · | EP | EP | EP | · | · | · | · | · |
| `single_hop` (distance) | · | C | · | C | 🚫 | · | · | · | · |
| `triple_hop` (distance) | · | C | · | C | 🚫 | · | · | · | · |
| `crossover_hop` (distance) | · | · | · | C | 🚫 | · | · | · | · |
| `landing_uni` (`tts`) | 🚫 | · | · | 🚫 | **D** | **D** | **D** | 🚫 | 🚫 |
| `landing_bi` (`tts`) | 🚫 | · | · | · | **D** | **D** | **D** | 🚫 | · |
| `sllt` | 🚫 | · | · | 🚫 | **D/C/EB** | 🚫 *(exclu, mais actif dans TFM/VAR_REL3 actuels — Phase A)* | 🚫 | 🚫 | · |
| `sls` | · | · | · | 🚫 | · | **D/C/EB** | **D/C/EB** | 🚫 | · |
| `eo` | · | · | · | · | · | **D** | **D** | · | · |
| `ef` | · | · | · | · | · | **D** | **D** | · | · |
| `strobo` | · | · | · | · | · | **D/C/EB** | **D/C/EB** | 🚫 | · |
| `wblt` (`distance`) | 🚫 | 🚫 | 🚫 | 🚫 | EP | EP | EP | 🚫 | **D/C** |
| `heel_raise` | · | · | · | 🚫 | 🚫 | · | 🚫 | **D** | · |

---

## Partie 2 — Matrice détaillée par KPI (tests à rôle non homogène)

### CMJ

| KPI | Force | Puissance | Explosivité | Réactivité | Absorption | Stabilisation | CSM | Endurance | Mobilité |
|---|---|---|---|---|---|---|---|---|---|
| `cmj_peak_power` | 🚫 | **D** | 🚫 | · | · | 🚫 | 🚫 | 🚫 | 🚫 |
| `cmj_height` | 🚫 | C | 🚫 | · | · | 🚫 | 🚫 | 🚫 | · |
| `cmj_conc_rfd` | 🚫 | · | **D** | · | · | 🚫 | 🚫 | 🚫 | · |
| `cmj_conc_impulse_100` | 🚫 | · | **D** | · | · | 🚫 | 🚫 | 🚫 | · |
| `cmj_conc_peak_force` | 🚫 | · | C | · | C | 🚫 | 🚫 | 🚫 | · |
| `cmj_conc_mean_force` | 🚫 | · | C | · | C | 🚫 | 🚫 | 🚫 | · |
| `cmj_conc_impulse` | 🚫 | · | C | · | · | 🚫 | 🚫 | 🚫 | · |
| `cmj_depth` | 🚫 | · | EB | · | C | 🚫 | 🚫 | 🚫 | · |
| `cmj_conc_duration` | 🚫 | · | EB | · | C | 🚫 | 🚫 | 🚫 | · |
| `cmj_rsi_mod` | 🚫 | · | EB | · | C | 🚫 | 🚫 | 🚫 | · |
| `cmj_ecc_mean_power` | 🚫 | · | EB | · | **D** | 🚫 | 🚫 | 🚫 | · |
| `cmj_ecc_peak_vel` | 🚫 | · | EB | · | **D** | 🚫 | 🚫 | 🚫 | · |
| `cmj_braking_rfd`* | 🚫 | · | EB | · | **D** | 🚫 | 🚫 | 🚫 | · |
| `cmj_braking_impulse`* | 🚫 | · | · | · | **D** | 🚫 | 🚫 | 🚫 | · |
| `cmj_braking_duration` | 🚫 | · | · | · | C/EB | 🚫 | 🚫 | 🚫 | · |
| `cmj_landing_impulse` | 🚫 | · | · | · | C | 🚫 | 🚫 | 🚫 | · |

*\* correspondance probable de `cmj_ecc_dec_rfd`/`cmj_ecc_dec_impulse`, non confirmée par le
praticien — voir annexe vocabulaire, `AUDIT_VAR_REL3_VS_VIERGE7.md`.*

**⚠️ Conflit identifié (déjà signalé Phase A, non arbitré) : `cmj_peak_power` et `cmj_height`
sont simultanément la preuve diagnostique/confirmative de Puissance ET explicitement exclues de 6
autres qualités.** C'est cohérent avec l'intention Vierge_7 (Puissance est la seule qualité
"propriétaire" de ces deux variables), pas un doublon problématique — signalé ici uniquement pour
visibilité, aucune action requise.

### SLCMJ (miroir unilatéral du CMJ, mêmes rôles que ci-dessus)

| KPI | Puissance | Explosivité | Autres qualités |
|---|---|---|---|
| `slcmj_peak_power` | **D** (diagnostique principal unilatéral) | 🚫 | 🚫 partout ailleurs |
| `slcmj_height` etc. | C (implicite, non détaillé par Vierge_7 au même degré que CMJ) | 🚫 | 🚫 |

### DJ / SLDJ

| KPI | Force | Puissance | Explosivité | Réactivité | Absorption | Stabilisation | CSM | Endurance | Mobilité |
|---|---|---|---|---|---|---|---|---|---|
| `dj_rsi` / `sldj_rsi` | · | · | 🚫 | **D** | 🚫 | 🚫 | · | · | 🚫 |
| `dj_peak_prop_power` / `sldj_peak_prop_power` | · | **D** *(contextuel)* | 🚫 | C | · | · | · | · | · |
| `dj_contact_time` / `sldj_contact_time` | · | · | 🚫 | C/EB | C/EB | · | · | · | · |
| `dj_height` / `sldj_height` | · | · | 🚫 | C | · | · | · | · | · |
| `dj_peak_prop_force` / `sldj_peak_prop_force` | · | · | · | C/EB | · | · | · | · | · |
| `dj_leg_stiffness` / `sldj_leg_stiffness` | · | · | · | C/EB | · | · | · | · | · |
| `dj_landing_impulse` / `sldj_landing_impulse` | · | · | · | C/EB | C | · | · | · | · |
| `dj_peak_landing_force` / `sldj_peak_landing_force` | · | · | · | C/EB | C | · | · | · | · |

**⚠️ Conflit le plus important de toute la matrice : `dj_rsi`/`sldj_rsi` sont la preuve
diagnostique principale de Réactivité ET explicitement exclues d'Absorption, de Stabilisation et
de Mobilité.** Cohérent avec l'intention Vierge_7 (rôle unique et non ambigu), mais c'est
précisément la variable dont la contamination via `computeTestStatus` a été documentée comme
risque actif en Phase A (`AUDIT_TFM_VS_VIERGE7.md` §6.4) — à surveiller particulièrement en Phase
C si un modèle KPI-level est implémenté sans garde-fou explicite.

### CMJR

| KPI | Réactivité | Toutes les autres qualités |
|---|---|---|
| `cmjr_mean_rsi`, `cmjr_mean_ct`, `cmjr_mean_rebound_height`, `cmjr_mean_stiffness`, `cmjr_rsi_decay`, `cmjr_stiffness_decay` | **EB** (jamais diagnostique) | 🚫 partout (Puissance, Absorption, Stabilisation, CSM, Endurance, Mobilité) |
| `cmjr_peak_power` | C | 🚫 partout |

**Point positif à noter** : contrairement à `dj_rsi`, le traitement de CMJR est **entièrement
cohérent** dans les 9 fiches — jamais diagnostique nulle part, explicative uniquement pour
Réactivité, exclue explicitement partout ailleurs. Aucun conflit.

### Repeated Hop

| KPI | Réactivité | Endurance | Toutes les autres qualités |
|---|---|---|---|
| `repeated_hop_n_hops` | · | **D** | 🚫 (Force, Puissance, Absorption, Stabilisation, CSM, Mobilité) |
| `repeated_hop_rsi_fatigue`, `height_fatigue`, `ct_drift`, `stiffness_fatigue` | 🚫 | **D** | 🚫 |
| `repeated_hop_mean_height/rsi/peak_force/ct`, `best_height/rsi`, `height_cv/ct_cv/rsi_cv` | 🔶 *(citée en confirmative sans KPI précisé — voir fiche 4)* | C/EB | 🚫 |
| `repeated_hop_mean_stiffness` | · | *(non assignée par Vierge_7 — seul KPI du test sans rôle)* | · |

**⚠️ Point de spécification non résolu, hérité de Phase A** : la fiche Réactivité cite
`repeated_hop` en confirmative sans préciser de KPI, alors que la quasi-totalité de ses KPIs sont
diagnostiques d'Endurance. Documenté, non arbitré (voir `HYP_ARCHITECTURE_PHASE_B.md`, fiche 4).

---

## Synthèse des doublons et contaminations potentielles

### Doublons intentionnels (même preuve, plusieurs qualités — cohérents avec Vierge_7)

| Variable(s) | Qualités partageant le rôle diagnostique | Statut |
|---|---|---|
| `landing_uni_tts`, `landing_bi_tts` | Absorption, Stabilisation, Contrôle Sensori-moteur (les 3 en diagnostique) | Intentionnel chez Vierge_7 — même test, trois questions cliniques différentes posées sur le même signal |
| `sls_*` (7 KPIs) | Stabilisation, Contrôle Sensori-moteur (diagnostique dans les deux, mot pour mot identique) | 🔶 Point à arbitrer — voir `HYP_ARCHITECTURE_PHASE_B.md` fiches 6/7, écart de spécification Vierge_7 non résolu |
| `strobo_surface` | Stabilisation, Contrôle Sensori-moteur | Idem |

### Contaminations actives déjà documentées en Phase A (rappel, pas une nouvelle découverte)

| Variable(s) | Qualité propriétaire (diagnostique légitime) | Qualité(s) où une contamination a été confirmée active dans `TFM`/`VAR_REL3` actuels |
|---|---|---|
| `sllt_*` | Absorption | Stabilisation (poids maximal dans `TFM`, `Determinante` dans `VAR_REL3`) |
| `cmjr_*` | Réactivité (explicatif uniquement) | Réactivité elle-même, à tort en diagnostique (poids maximal `TFM` ; inerte mais intentionné `VAR_REL3`) |
| `dj_rsi`/`sldj_rsi` | Réactivité | Absorption (risque, via `computeTestStatus`, non confirmé faute d'audit `NORMS`) |

### Contradictions internes à Vierge_7 lui-même (documentées, non arbitrées)

- `landing_bi_peak_landing_force` : cité comme diagnostique (Stabilisation, "Landing stability")
  et explicitement exclu ("absorption pure") **dans la même fiche**.
- `repeated_hop` (bare) : cité comme confirmative de Réactivité sans KPI précisé, alors que ses
  KPIs sont diagnostiques d'Endurance.
- Fiche Stabilisation vs fiche Contrôle Sensori-moteur : sections diagnostique/confirmative
  quasi identiques mot pour mot pour deux qualités nominalement distinctes.

**Aucun de ces trois points n'est tranché dans cette matrice ni dans les fiches HYP### — ils
restent des questions ouvertes pour le praticien avant la Phase C.**

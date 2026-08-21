# Variables diagnostiques d'Absorption — extraction exhaustive

**Statut** : extraction, pas une nouvelle cartographie ni une nouvelle règle. Aucun code modifié,
aucune modification de `HYP-ABS-01`. Reprend et complète `CARTOGRAPHIE_ABSORPTION_HYP_ABS01.md` avec
un niveau de détail supplémentaire trouvé dans `HYP_ARCHITECTURE_PHASE_B.md` (source antérieure à la
consolidation Phase C).

**Légende** : 📄 SOURCE EXPLICITE · 🔧 INFERENCE (correspondance de nommage) · **CONTRADICTION DE
SOURCE** · NON DÉTERMINABLE.

---

## 1. Inventaire complet — variables diagnostiques d'Absorption

| # | Variable | Test | Statut |
|---|---|---|---|
| 1 | `landing_uni_tts` | Landing Unilatéral | 📄 |
| 2 | `landing_bi_tts` | Land and Hold (bilatéral) | 📄 |
| 3 | `sllt_peak_landing_force` | SLLT | 📄 |
| 4 | `sllt_ttplf` | SLLT | 📄 |
| 5 | `sllt_loading_rate` | SLLT | 📄 |
| 6 | `sllt_tts` | SLLT | 📄 |
| 7 | `sllt_cop_path` | SLLT | 📄 |
| 8 | `cmj_ecc_mean_power` | CMJ | 📄 |
| 9 | `cmj_ecc_peak_vel` | CMJ | 📄 |
| 10 | `cmj_braking_rfd` | CMJ | 🔧 (correspondance de nommage, §3) |
| 11 | `cmj_braking_impulse` | CMJ | 🔧 (correspondance de nommage, §3) |

**10 KPI réels sur 3 tests** (SLLT compte pour 5). Aucune autre variable, dans aucune des sources
listées par la mission, n'est documentée comme diagnostique d'Absorption.

**Variables demandées par Vierge_7 mais n'existant pas dans Kinexus** (📄 SOURCE EXPLICITE,
`HYP_ARCHITECTURE_PHASE_B.md` ligne 269-272, note de couverture non résolue) :
`landing_uni_peak_landing_force`, `landing_uni_loading_rate`, `landing_uni_impulse`,
`landing_uni_cop_path`, `landing_bi_loading_rate`, `landing_bi_impulse`. Ces six variables seraient,
si elles existaient, potentiellement diagnostiques ou confirmatives — mais **elles ne sont pas
implémentées dans le catalogue de tests Kinexus**, vérifié absentes de `TESTS` (`index.html`). C'est
la cause documentée de la couverture "limitée" de Landing déjà notée dans
`CARTOGRAPHIE_ABSORPTION_HYP_ABS01.md` §1 (*"🟠 limitée pour Landing, 1-2 KPI sur 4-5 attendus"*).

---

## 2. Classement par test

### A — SLLT (5 KPI, tous diagnostiques)
`sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`, `sllt_cop_path`.

### B — Landing (2 KPI diagnostiques, sur 2 tests distincts)
`landing_uni_tts` (test Landing Unilatéral, qui ne possède **qu'un seul** KPI dans Kinexus — `tts`) ·
`landing_bi_tts` (test Land and Hold, qui possède `tts` et `peak_landing_force`, ce dernier
**confirmatif**, pas diagnostique).

### C — CMJ (4 KPI diagnostiques)
`cmj_ecc_mean_power`, `cmj_ecc_peak_vel` (📄) · `cmj_braking_rfd`, `cmj_braking_impulse` (🔧).

### D — SLCMJ
**Aucun KPI diagnostique.** ⚪ Vérifié : aucune variable `slcmj_*` n'apparaît dans les listes
diagnostique/confirmative/explicative d'Absorption (`CARTOGRAPHIE_VARIABLES_HYP.md`,
`HYP_ARCHITECTURE_PHASE_B/C.md`). Les variables excentriques du SLCMJ (`slcmj_edrfd_bm`,
`slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_ecc_duration`)
sont utilisées ailleurs (Puissance, explicative) — jamais pour Absorption.

### E — DJ
**Aucun KPI diagnostique.** Rôle confirmatif/explicatif uniquement (§8).

### F — SLDJ
**Aucun KPI diagnostique.** idem.

### G — Autres tests
**Aucun.** Aucune variable diagnostique en dehors de SLLT, Landing, et CMJ.

---

## 3. Focus — variables excentriques/freinage/décélération

| Variable | Test | Diag. Absorption ? | Confirmative ? | Explicative ? | Autre qualité | Source |
|---|---|---|---|---|---|---|
| `cmj_ecc_mean_power` | CMJ | ✅ | — | — | — | 📄 |
| `cmj_ecc_peak_vel` | CMJ | ✅ | — | — | 🟢 Explicative Explosivité | 📄 |
| `cmj_braking_rfd` | CMJ | ✅ | — | — | 🟢 Explicative Explosivité | 🔧 — correspondance probable avec le nom Vierge_7 `cmj_ecc_dec_rfd`, "nommage à confirmer" (`HYP_ARCHITECTURE_PHASE_B.md` ligne 265-267) |
| `cmj_braking_impulse` | CMJ | ✅ | — | — | — | 🔧 — correspondance probable avec `cmj_ecc_dec_impulse`, même réserve |
| `cmj_braking_duration` | CMJ | ❌ | — | ✅ (double rôle) | 🟡 Explicative Puissance | 📄 |
| `cmj_ecc_peak_force` | CMJ | ❌ | — | — | — | NON DÉTERMINABLE — variable existante (`index.html`, tier "info"), aucun rôle HYP### repéré pour aucune qualité |
| `cmj_ecc_mean_force` | CMJ | ❌ | — | — | — | NON DÉTERMINABLE, même statut |
| `cmj_ecc_decel` | CMJ | ❌ | — | — | 🟡 Explicative Puissance | 📄 (exclue d'Absorption, appartenance à Puissance confirmée) |
| `cmj_braking_eff` | CMJ | ❌ | — | — | 🟡 Explicative Puissance | 📄 |
| `cmj_braking_peak_force` | CMJ | ❌ | — | — | — | NON DÉTERMINABLE |
| `cmj_braking_rfd_abs` | CMJ | ❌ | — | — | — | 📄 tier "info" uniquement, jamais utilisée pour un score, aucune qualité |
| `dj_leg_stiffness`/`sldj_leg_stiffness` | DJ/SLDJ | ❌ | — | ✅ (double rôle Réactivité) | 🟢 Explicative Réactivité | 📄 — pas une variable "excentrique" nommée comme telle, mais liée à la dynamique de contact |
| `slcmj_edrfd_bm`/`braking_rfd`/`peak_braking_force`/`braking_impulse`/`ecc_duration` | SLCMJ | ❌ | — | ❌ | 🟡 Explicative Puissance | 📄 — aucune n'est utilisée par Absorption |

**Réponse explicite à la consigne "ne pas considérer automatiquement qu'une variable excentrique est
diagnostique"** : vérifié — plusieurs variables authentiquement excentriques
(`cmj_ecc_decel`, `cmj_braking_eff`, toutes les variables excentriques du SLCMJ) **ne sont pas**
diagnostiques d'Absorption, certaines appartenant exclusivement à Puissance. Le simple fait de
mesurer la phase excentrique ne suffit pas.

---

## 4. Variables CMJ/SLCMJ — vérification nommée

| Variable demandée par la mission | Existe dans Kinexus sous ce nom ? | Correspondance réelle | Rôle Absorption |
|---|---|---|---|
| `cmj_braking_rfd` | ✅ Oui, tel quel | — | 🔴 Diagnostique (🔧) |
| `cmj_depth` | ✅ Oui | — | 🟠 Confirmative |
| `cmj_conc_duration` | ✅ Oui | — | 🟠 Confirmative |
| `cmj_eccentric_mean_power` | ❌ N'existe pas sous ce nom | = `cmj_ecc_mean_power` | 🔴 Diagnostique |
| `cmj_eccentric_peak_velocity` | ❌ N'existe pas sous ce nom | = `cmj_ecc_peak_vel` | 🔴 Diagnostique |
| `cmj_eccentric_deceleration_rfd` | ❌ N'existe pas sous ce nom | = `cmj_braking_rfd` (🔧 correspondance documentée en Phase B avec l'hypothèse `cmj_ecc_dec_rfd`) | 🔴 Diagnostique (🔧) |
| `cmj_eccentric_deceleration_impulse` | ❌ N'existe pas sous ce nom | = `cmj_braking_impulse` (🔧 idem, `cmj_ecc_dec_impulse`) | 🔴 Diagnostique (🔧) |

**Point de méthode** : les noms proposés par la mission correspondent au **nommage Vierge_7
probable**, pas aux clés réelles Kinexus — exactement la correspondance déjà documentée comme
non confirmée à 100% dans `HYP_ARCHITECTURE_PHASE_B.md`. Aucune nouvelle variable n'est créée ici ;
la correspondance est rappelée, pas inventée.

---

## 5. Landing / TTS

| Variable | Absorption | Stabilisation | Réactivité | Autre |
|---|---|---|---|---|
| `landing_uni_tts` | 🔴 Diagnostique | 🔴 **Diagnostique aussi** (double destination conservée, non supprimée) | ⚪ | — |
| `landing_bi_tts` | 🔴 Diagnostique | 🔴 **Diagnostique aussi** | ⚪ | — |
| `landing_bi_peak_landing_force` | 🟠 Confirmative | ⚪ Exclue (gel) | ⚪ | — |
| `landing_uni_peak_landing_force` | N'existe pas dans Kinexus (§1) | — | — | — |
| `landing_uni_loading_rate`, `landing_uni_impulse`, `landing_uni_cop_path`, `landing_bi_loading_rate`, `landing_bi_impulse` | N'existent pas dans Kinexus (§1) | — | — | — |

La double destination `landing_uni_tts`/`landing_bi_tts` (Absorption **et** Stabilisation) est
**conservée telle quelle**, conformément à la consigne — ce n'est pas une contradiction, c'est un
rôle diagnostique partagé documenté dans les deux fiches.

---

## 6. SLLT — KPI individuels et question de convergence

| KPI | Diagnostique | Confirmatif | Explicatif |
|---|---|---|---|
| `sllt_peak_landing_force` | ✅ | — | — |
| `sllt_ttplf` | ✅ | — | — |
| `sllt_loading_rate` | ✅ | — | — |
| `sllt_tts` | ✅ | — | — |
| `sllt_cop_path` | ✅ | — | — |

**« SLLT constitue-t-il une seule preuve, ou plusieurs preuves indépendantes ? »**

**NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES — signalé, pas inventé.** `KINEXUS_REASONING_ENGINE_V1.md`
§4 (ADR-003) établit le principe général (des KPI d'un même essai ne comptent pas automatiquement
comme preuves indépendantes) et note explicitement, mot pour mot : *"le praticien a demandé que cette
exception soit documentée explicitement... l'énoncé précis de l'exception SLLT reste à rédiger."*
Aucune règle de comptage n'existe à ce jour pour ses 5 KPI. Ce document ne la formule pas.

---

## 7. Peak Landing Force — désambiguïsation complète

| Variable exacte | Test | Absorption | Stabilisation | Réactivité | Rôle |
|---|---|---|---|---|---|
| `sllt_peak_landing_force` | SLLT | 🔴 Diagnostique | ⚪ Exclue (gel) | ⚪ | — |
| `landing_bi_peak_landing_force` | Land and Hold | 🟠 Confirmative | ⚪ Exclue (gel) | ⚪ | — |
| `landing_uni_peak_landing_force` | Landing Unilatéral | N'existe pas dans Kinexus | — | — | — |
| `dj_peak_landing_force` | Drop Jump | 🟠 Confirmative | ⚪ | 🟠/🟢 (double rôle) | Partagée Absorption/Réactivité |
| `sldj_peak_landing_force` | SLDJ | 🟠 Confirmative | ⚪ | 🟠/🟢 | idem |
| `cmjr_peak_landing_force` | CMJ Rebound | ⚪ Non utilisée | — | ⚪ Non repérée | NON DÉTERMINABLE |
| `slcmj_peak_landing_force` | SLCMJ | ⚪ Non utilisée | — | ⚪ | 🟡 Explicative de Puissance uniquement |
| `cmj_landing_peak_force` | CMJ (nommage inversé) | ⚪ Non utilisée | — | ⚪ | NON DÉTERMINABLE |

**Cinq variables portent un nom proche de "Peak Landing Force" sans jouer le même rôle** — seule
`sllt_peak_landing_force` est diagnostique.

---

## 8. DJ / SLDJ — tableau complet

| Variable | Rôle Absorption | Rôle Réactivité |
|---|---|---|
| `dj_rsi` | AUCUN — 📄 exclue explicitement | 🔴 DIAGNOSTIQUE |
| `sldj_rsi` | AUCUN — 📄 exclue explicitement | 🔴 DIAGNOSTIQUE |
| `dj_contact_time`/`sldj_contact_time` | 🟠 CONFIRMATIF | 🟠 CONFIRMATIF / 🟢 EXPLICATIF |
| `dj_height`/`sldj_height` | AUCUN — non repérée dans Absorption | 🟠 CONFIRMATIF |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | 🟠 CONFIRMATIF | 🟠/🟢 |
| `dj_landing_impulse`/`sldj_landing_impulse` | 🟢 EXPLICATIF (double rôle) | 🟠/🟢 |
| `dj_leg_stiffness`/`sldj_leg_stiffness` | AUCUN — non repérée dans Absorption | 🟢 EXPLICATIF |
| `dj_peak_prop_force`/`power`, `sldj_*` | 🟢 EXPLICATIF (double rôle) | 🟠/🟢 |
| `sldj_tts` | NON DÉTERMINABLE — présente dans le code, aucun rôle repéré dans aucune fiche | NON DÉTERMINABLE |

---

## 9. Matrice finale

| Variable | Test | Abs. diagnostic | Abs. confirmation | Abs. explication | Stabilisation | Réactivité | Statut |
|---|---|---|---|---|---|---|---|
| `landing_uni_tts` | Landing Uni | ✅ | — | — | ✅ diagnostic | — | 📄 |
| `landing_bi_tts` | Land and Hold | ✅ | — | — | ✅ diagnostic | — | 📄 |
| `landing_bi_peak_landing_force` | Land and Hold | — | ✅ | — | ⚪ exclue | — | 📄 |
| `sllt_peak_landing_force` | SLLT | ✅ | — | — | ⚪ exclue | — | 📄 |
| `sllt_ttplf` | SLLT | ✅ | — | — | ⚪ | — | 📄 |
| `sllt_loading_rate` | SLLT | ✅ | — | — | ⚪ | — | 📄 |
| `sllt_tts` | SLLT | ✅ | — | — | ⚪ | — | 📄 |
| `sllt_cop_path` | SLLT | ✅ | — | — | ⚪ | — | 📄 |
| `cmj_ecc_mean_power` | CMJ | ✅ | — | — | ⚪ | — | 📄 |
| `cmj_ecc_peak_vel` | CMJ | ✅ | — | — | ⚪ | — | 📄 |
| `cmj_braking_rfd` | CMJ | ✅ | — | — | ⚪ | — | 🔧 |
| `cmj_braking_impulse` | CMJ | ✅ | — | — | ⚪ | — | 🔧 |
| `cmj_depth` | CMJ | — | ✅ | — | ⚪ | — | 📄 |
| `cmj_conc_duration` | CMJ | — | ✅ | — | ⚪ | — | 📄 |
| `cmj_rsi_mod` | CMJ | — | ✅ | — | ⚪ | — | 📄 |
| `cmj_conc_peak_force` | CMJ | — | ✅ | — | ⚪ | — | 📄 |
| `cmj_conc_mean_force` | CMJ | — | ✅ | — | ⚪ | — | 📄 |
| `cmj_landing_impulse` | CMJ | — | ✅ | — | ⚪ | — | 📄 |
| `cmj_braking_duration` | CMJ | — | — | ✅ | ⚪ | — | 📄 |
| `cmj_braking_eff` | CMJ | — | — | — | ⚪ | — | 📄 exclue (Puissance) |
| `cmj_ecc_decel` | CMJ | — | — | — | ⚪ | — | 📄 exclue (Puissance) |
| `dj_contact_time` | DJ | — | ✅ | — | ⚪ | ✅ | 📄 |
| `dj_peak_landing_force` | DJ | — | ✅ | — | ⚪ | ✅ | 📄 |
| `dj_landing_impulse` | DJ | — | — | ✅ | ⚪ | ✅ | 📄 |
| `dj_leg_stiffness` | DJ | — | — | — | ⚪ | ✅ | 📄 exclue Absorption |
| `dj_rsi` | DJ | — | — | — | ⚪ | ✅ diagnostic | 📄 exclue explicitement |
| `sldj_*` (équivalents) | SLDJ | idem `dj_*` | | | ⚪ | idem | 📄 |
| `sldj_tts` | SLDJ | — | — | — | ? | ? | NON DÉTERMINABLE |
| `cmjr_peak_landing_force` | CMJR | — | — | — | ? | ? | NON DÉTERMINABLE |
| `cmj_landing_peak_force` | CMJ | — | — | — | ⚪ | ⚪ | NON DÉTERMINABLE |
| `slcmj_*` (toutes) | SLCMJ | — | — | — | ⚪ | ⚪ | 📄 exclue (Puissance uniquement) |
| RFD 9 tests isométriques + `wblt_distance` | divers | — | — | ✅ | partagé (`wblt`) | — | 📄 |

---

## 10. Réponse à la question centrale

**« Les variables diagnostiques d'Absorption sont-elles principalement des variables excentriques ? »**

### A — OUI, explicitement diagnostiques d'Absorption ET de nature excentrique/freinage
- `cmj_ecc_mean_power` (📄)
- `cmj_ecc_peak_vel` (📄)
- `cmj_braking_rfd` (🔧 correspondance de nommage)
- `cmj_braking_impulse` (🔧 correspondance de nommage)

*(4 des 10 variables diagnostiques totales — soit 40%.)*

### B — Excentriques/de freinage mais seulement explicatives ou confirmatives, jamais diagnostiques
- `cmj_braking_duration` (🟢 explicative, double rôle)
- `cmj_braking_eff` (📄 exclue d'Absorption — explicative de Puissance uniquement)
- `cmj_ecc_decel` (📄 exclue d'Absorption — explicative de Puissance uniquement)
- `dj_leg_stiffness`/`sldj_leg_stiffness` (raideur pendant le contact — apparentée à la gestion de
  charge, mais explicative de Réactivité uniquement, absente d'Absorption)
- variables excentriques du SLCMJ (`slcmj_edrfd_bm`, `slcmj_braking_rfd`,
  `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_ecc_duration`) — toutes explicatives de
  Puissance uniquement, aucun rôle Absorption

### C — NON DÉTERMINABLE avec les sources actuelles
- `cmj_ecc_peak_force`, `cmj_ecc_mean_force`, `cmj_braking_peak_force` — variables excentriques
  existantes dans le code, sans rôle HYP### repéré pour aucune qualité vérifiée.

**Réponse directe** : les variables diagnostiques d'Absorption **ne sont pas majoritairement**
excentriques — sur les 10 KPI diagnostiques réels, **6** relèvent de la dimension "récupération/
stabilisation" (`landing_uni_tts`, `landing_bi_tts`, `sllt_tts`, `sllt_ttplf`, `sllt_loading_rate`,
`sllt_cop_path`) et **4 seulement** sont de nature excentrique/freinage (catégorie A). L'association
"Absorption = excentrique" est **partiellement vraie mais incomplète** : la majorité du diagnostic
repose en réalité sur des mesures de temps de récupération et de trajectoire du centre de pression,
pas sur la phase de freinage elle-même.

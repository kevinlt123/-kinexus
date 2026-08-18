# HYP-ABS-01 V2 — Absorption

**Statut : nouvelle source de vérité clinique pour Absorption, remplaçant la fiche V1**
(`HYP_ARCHITECTURE_PHASE_C.md` §HYP-ABS-01). Document de spécification clinique uniquement — aucun
code modifié (`index.html`, `computeMoteur()`, `TFM`, `CLI###`, `computeAsymEngine`, écrans,
rapports, données existantes tous inchangés). Non implémentée dans l'application.

**Légende de preuve, appliquée à chaque variable** : 📄 SOURCE EXPLICITE (déjà établi par Vierge_7,
repris sans changement) · 🔗 CORRESPONDANCE DE NOM (variable Kinexus vérifiée, nom aligné avec le
libellé cible) · 🔧 INFERENCE (correspondance non confirmée à 100%) · 🔴 NOUVELLE RÈGLE CLINIQUE
(décision prise dans cette V2, absente de V1/Vierge_7 telle quelle) · ⛔ NON DISPONIBLE (variable
inexistante dans Kinexus, non créée).

---

## 1. Définition fonctionnelle 🔴 NOUVELLE RÈGLE CLINIQUE

**Absorption = capacité à accepter, freiner, décélérer et dissiper efficacement une charge ou un
momentum.**

Englobe : le freinage, la décélération, la gestion de la charge excentrique, la dissipation de
l'énergie, la réception/l'atterrissage, le contrôle de la stratégie utilisée pour absorber.

**Absorption ≠ capacité excentrique.** Les qualités excentriques sont un moyen explicatif important,
pas l'objectif fonctionnel lui-même — reformulation qui **inverse explicitement** le rôle diagnostique
que `cmj_ecc_mean_power`/`cmj_ecc_peak_vel` avaient en V1 (voir §6, changelog point 3-4).

---

## 2. Structure — 7 sous-domaines

| Domaine | Statut |
|---|---|
| A. Capacité de freinage / décélération (Core) | Actif |
| B. Capacité excentrique | Actif, explicatif |
| C. Stratégie d'absorption | Actif |
| D. Absorption réactive | Actif |
| E. Réception / Impact | Actif |
| F. Absorption horizontale | 🔵 Futur — non implémenté |
| G. Absorption multidirectionnelle | 🔵 Futur — non implémenté |

---

## 3. Niveaux de raisonnement 🔴 NOUVELLE RÈGLE CLINIQUE

### Niveau 1 — Diagnostic global
Trois états : **OK / À surveiller / Déficitaire**.

**Règle** : le diagnostic global n'est **pas** une moyenne de toutes les variables. Les variables du
sous-domaine A (Core — freinage/décélération) ont une **priorité diagnostique supérieure** aux
variables explicatives (sous-domaine B) et aux variables de sous-domaines complémentaires (C, D, E).
Une anomalie en B, C, D ou E seule, sans anomalie Core, **ne produit pas** "Absorption Déficitaire" au
Niveau 1 — elle enrichit la lecture aux Niveaux 2-3 sans faire basculer le Niveau 1.

*Aucun poids numérique n'est fixé ici* — la priorité est qualitative (Core prioritaire), pas
quantifiée. Fixer un poids serait une invention non demandée.

### Niveau 2 — Sous-domaine
Localise le problème parmi : Freinage/Décélération · Capacité excentrique · Stratégie · Absorption
réactive · Réception/Impact.

### Niveau 3 — Variables
Liste les variables individuelles anormales, par sous-domaine (§4-§9 ci-dessous).

### Niveau 4 — Tests
Identifie les tests responsables : CMJ, SLDJ, DJ, Landing, SLLT (SLCMJ : aucune variable rattachée à
ce jour, voir §8).

---

## 4. A — Capacité de freinage / décélération (CORE)

| Variable cible | Nom Kinexus | Existe ? | Statut |
|---|---|---|---|
| Eccentric Deceleration RFD / BM | `cmj_braking_rfd` | ✅ (`valdName` exact : *"Eccentric Deceleration RFD / BM (EDRFD)"*) | 🔗 nom vérifié / 🔧 identification comme variable Vierge_7 non confirmée à 100% (héritée de V1, non re-tranchée ici) |
| Eccentric Deceleration Impulse / BM | `cmj_braking_impulse` | ✅ (`valdName` : *"Eccentric Deceleration Impulse"*) | 🔗 / 🔧, même réserve |
| Force at Zero Velocity | `cmj_force_zero_vel` | ✅ (`valdName` exact : *"Force at Zero Velocity"*) | 🔗 nom vérifié · 🔴 **son intégration au diagnostic Core est une décision nouvelle de cette V2** — aucun rôle HYP### en V1 |

**Questions fonctionnelles associées** (🔴, formulées pour cette V2) :
- RFD : *"À quelle vitesse l'athlète peut-il développer de la force pour freiner son mouvement ?"*
- Impulse : *"L'athlète est-il capable de produire une quantité suffisante de freinage sur l'ensemble
  de la phase ?"*
- Force @ 0V : *"L'athlète arrive-t-il à produire suffisamment de force pour terminer efficacement son
  freinage ?"*

### Logique de profils Core 🔴 NOUVELLE RÈGLE CLINIQUE

| Profil | Interprétation |
|---|---|
| RFD↓ + Impulse↓ | Déficit global de capacité de freinage |
| RFD↓ + Impulse= | Capacité de freinage globalement conservée, vitesse de développement de force insuffisante |
| RFD= + Impulse↓ | Capacité de montée en force conservée, production/maintien de force insuffisant sur la phase |
| RFD↓ + Impulse↓ + Force@0V↓ | Déficit global de freinage/décélération |
| RFD= + Impulse= + Force@0V↓ | Déficit spécifique de la fin du freinage |

Ces cinq profils sont une **grille de lecture proposée**, pas une règle de seuil numérique — aucun
chiffre n'accompagne "↓"/"="/"↑" dans ce document, conformément à la consigne.

---

## 5. B — Capacité excentrique (EXPLICATIVE — rôle inversé depuis V1)

| Variable cible | Nom Kinexus | Existe ? | Statut |
|---|---|---|---|
| Eccentric Peak Power / BM | — | ⛔ **N'existe pas** — vérifié dans `TESTS`/`CMJ_VAR_META`, aucun KPI de puissance de pic excentrique | ⛔ NON DISPONIBLE, non créé |
| Eccentric Mean Power / BM | `cmj_ecc_mean_power` | ✅ | 🔗 nom vérifié · 🔴 **rôle explicatif, plus diagnostique** (changement V1→V2) |
| Eccentric Peak Velocity | `cmj_ecc_peak_vel` | ✅ (`valdName` exact) | 🔗 · 🔴 rôle explicatif, plus diagnostique |

**Principe (🔴)** : une variable excentrique déficitaire seule **ne produit jamais** "Absorption
déficitaire" au Niveau 1. Elle produit une explication de type : *"Capacité excentrique réduite
pouvant contribuer à la limitation de l'Absorption."* — jamais un diagnostic autonome.

---

## 6. C — Stratégie d'absorption

| Variable cible | Nom Kinexus | Existe ? | Statut |
|---|---|---|---|
| Countermovement Depth | `cmj_depth` | ✅ | 🔗 · rôle conservé (confirmative/stratégie) |
| Eccentric Deceleration Phase Duration | `cmj_braking_duration` | ✅ (`valdName` exact) | 🔗 · rôle conservé (explicative/stratégie) |
| CMJ Stiffness | — | ⛔ **N'existe pas pour le CMJ bilatéral** — seuls DJ/SLDJ (`leg_stiffness`) et CMJR (`mean_stiffness`) en possèdent un | ⛔ NON DISPONIBLE, conservée comme variable future, non créée |

**Question associée** : *"Comment l'athlète absorbe-t-il ?"* — lectures possibles : stratégie plus
raide, amplitude réduite, freinage plus long, descente plus lente, stratégie protectrice. 🔴 Grille
de lecture qualitative, aucun seuil chiffré.

---

## 7. D — Absorption réactive

| Variable cible | Nom Kinexus | Existe ? | Statut |
|---|---|---|---|
| DJ RSI | `dj_rsi` | ✅ | 🔗 · 🔴 **rôle nouveau** — caractérisation du sous-domaine D uniquement, jamais diagnostique du Niveau 1 (rupture avec V1, où `dj_rsi` était **explicitement exclu** de toute la qualité Absorption) |
| DJ Contact Time | `dj_contact_time` | ✅ | 🔗 · rôle conservé (confirmative en V1) + rôle complémentaire explicite pour D |
| DJ Eccentric Impulse | — | ⛔ N'existe pas sous ce nom | ⛔ NON DISPONIBLE — le concept le plus proche déjà utilisé (`dj_landing_impulse`) reste dans son rôle V1 (confirmative/explicative pour A/E), pas renommé "eccentric impulse" |
| DJ Concentric Impulse | — | ⛔ N'existe pas | ⛔ NON DISPONIBLE |

**Principe (🔴)** : *CMJ → capacité de freinage/décélération contrôlée. DJ → capacité à absorber
rapidement une charge puis à réutiliser la force.* Le sous-domaine D fonctionne comme une
**validation fonctionnelle complémentaire**, distincte du diagnostic Core (Niveau 1) — un déficit ici
seul ne bascule jamais le Niveau 1 vers "Déficitaire" (voir §10, cas 14).

---

## 8. E — Réception / Impact

*Désambiguïsation stricte maintenue, aucune fusion de variables homonymes.*

| Variable exacte | Test | Statut |
|---|---|---|
| `sllt_peak_landing_force` | SLLT | 📄 conservée, rôle inchangé depuis V1 |
| `landing_bi_peak_landing_force` | Land and Hold | 📄 conservée, rôle inchangé |
| `landing_uni_peak_landing_force` | Landing Unilatéral | ⛔ N'existe pas dans Kinexus |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | DJ/SLDJ | 📄 conservées, rôle inchangé |
| `cmj_landing_peak_force_asym` (+`_L`/`_R`) | CMJ | ❓ rôle non déterminé, inchangé depuis V1 |
| `slcmj_peak_landing_force` | SLCMJ | ⚪ non utilisée pour Absorption (explicative Puissance uniquement — aucun changement) |

**Principe (🔴, reformulation explicite)** : Peak Landing Force **n'est pas automatiquement
"mauvais"** — une valeur élevée peut correspondre à une stratégie plus raide (voir §6). À interpréter
conjointement avec la stratégie (C), l'asymétrie (§9), et le niveau de performance — jamais isolément.

---

## 9. Asymétries — lecture seule, jamais génératrices

| Variable | Existe ? | Statut |
|---|---|---|
| Eccentric Deceleration RFD Asymmetry | ✅ `ecc_decel_rfd_asym` (+ `ecc_decel_rfd_L`/`_R`) | 🔗 vérifiée dans `index.html` (`ASYM_PERFORMANCE_EQUIVALENT`) |
| Eccentric Deceleration Impulse Asymmetry | ✅ `ecc_decel_impulse_asym` | 🔗 idem |
| Force at Zero Velocity Asymmetry | ⛔ **N'existe pas** — absente de `ASYM_PERFORMANCE_EQUIVALENT`, vérifiée | ⛔ NON DISPONIBLE, non créée |
| Peak Landing Force Asymmetry | ✅ `landing_peak_force_asym` (+`_L`/`_R`) | 🔗 — rattachée à `cmj_landing_peak_force`, dont le rôle Absorption reste ❓ non déterminé (§8) |
| DJ asymmetries | Non vérifiées dans cette mission | ❓ NON DÉTERMINABLE — aucune entrée DJ trouvée dans `ASYM_PERFORMANCE_EQUIVALENT` (référentiel propre au CMJ) ; existence d'un mécanisme équivalent pour DJ non confirmée |

**Règle (📄, principe déjà gelé, non modifié)** : une asymétrie ne crée jamais seule "Absorption
Déficitaire" — elle produit "Absorption asymétrique", un modificateur/précision, jamais un
générateur. `computeAsymEngine` reste la source unique de calcul, non recalculé par HYP.

---

## 10. Frontières — Stabilisation et Réactivité

### TTS → Stabilisation exclusivement 🔴 NOUVELLE RÈGLE CLINIQUE (remplace la double destination V1)

| | Ancien modèle (V1) | Nouveau modèle (V2) |
|---|---|---|
| `landing_uni_tts` | 🔴 Diagnostique Absorption **et** Stabilisation | 🔴 Diagnostique **Stabilisation uniquement** — retiré du diagnostic Absorption |
| `landing_bi_tts` | 🔴 Diagnostique Absorption **et** Stabilisation | 🔴 Diagnostique **Stabilisation uniquement** — retiré |
| `sllt_tts` | 🔴 Diagnostique Absorption uniquement (SLLT jamais rattaché à Stabilisation) | **Inchangé** — reste diagnostique d'Absorption ; cette décision ne concerne que `landing_uni_tts`/`landing_bi_tts`, pas `sllt_tts` |

**Point de rigueur, non extrapolé au-delà de ce qui a été demandé** : la mission ne mentionne que
`landing_uni_tts`/`landing_bi_tts` — `sllt_tts` **n'est pas retiré** d'Absorption, aucune instruction
ne le concernant.

### Réactivité

`dj_rsi`, `dj_contact_time` reçoivent un rôle **nouveau** dans le sous-domaine D (§7), en rupture
avec l'exclusion totale de V1. Toutes les autres variables déjà exclues de V1 (`sldj_rsi`,
`cmjr_mean_rsi`, `cmjr_mean_rebound_height`, `single_hop_distance`, `triple_hop_distance`,
`crossover_hop_distance`, `repeated_hop_mean_rsi`, `heel_raise_reps`, `repeated_hop_ct_drift`,
`repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`) restent exclues, non réexaminées ici.

---

## 11. Logique générale de raisonnement 🔴 NOUVELLE RÈGLE CLINIQUE

```
UNE VARIABLE               → UNE INFORMATION
PLUSIEURS VARIABLES        → DIAGNOSTIC (si convergentes, sous-domaine A prioritaire)
  CONCORDANTES
VARIABLES SECONDAIRES      → EXPLICATION (sous-domaine B)
ASYMÉTRIES                 → MODIFICATEUR / PRÉCISION
AUTRES TESTS                → VALIDATION CROISÉE (sous-domaine D notamment)
CONTEXTE SPORTIF/CLINIQUE   → INTERPRÉTATION FINALE (hors périmètre du moteur HYP lui-même)
```

### Exemple de raisonnement complet (🔴, illustratif)

```
Eccentric Deceleration RFD ↓ + Eccentric Deceleration Impulse ↓ + Force at Zero Velocity ↓
  → DIAGNOSTIC : "Déficit de capacité de freinage / décélération."

+ Eccentric Peak Power ↓ (si disponible — actuellement ⛔ non disponible dans Kinexus)
  → EXPLICATION : "Une capacité excentrique réduite peut contribuer à limiter la capacité
    de freinage observée."

+ Deceleration Duration ↑ + Countermovement Depth ↓
  → STRATÉGIE : "La stratégie de mouvement est caractérisée par une durée de freinage
    augmentée et/ou une amplitude réduite."
```

### Cas — capacité conservée mais absorption réactive limitée

```
CMJ : RFD= , Impulse= , Force@0V=
DJ : RSI↓ , Contact Time↑
  → "Capacité de freinage excentrique générale conservée, mais capacité à absorber
    rapidement une charge et à réutiliser la force limitée."
```

**Ne transforme jamais automatiquement ce cas en "déficit global de capacité d'Absorption"** — le
Niveau 1 reste gouverné par le sous-domaine A (Core), resté normal ici.

---

## 12. Modules futurs — non implémentés

### F. Absorption horizontale 🔵 FUTUR
Peak Deceleration, Mean Deceleration, Deceleration Time, Deceleration Distance, Braking Impulse.

### G. Absorption multidirectionnelle 🔵 FUTUR
Lateral Braking, COD Braking, Force Redirection, Re-acceleration.

Aucune de ces variables n'existe dans Kinexus. Conservées dans l'architecture comme axes futurs,
non intégrées au raisonnement actuel.

---

## 13. Ce que cette V2 remplace explicitement

Cette fiche devient la source de vérité clinique pour `HYP-ABS-01`, remplaçant la fiche V1
(`HYP_ARCHITECTURE_PHASE_C.md`). Le détail des changements est consolidé dans
`HYP_ABS01_V2_CHANGELOG.md`.

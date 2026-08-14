# Phase C — Moteur de raisonnement clinique HYP### (fiches complètes)

## Statut de ce document

Construction des HYP### complets, à partir des décisions figées dans `HYP_ARCHITECTURE_FREEZE.md`
(validées en bloc par le praticien) et de `HYP_ARCHITECTURE_PHASE_B.md`. Aucun code, aucune
configuration, aucune recommandation d'entraînement — uniquement le moteur de raisonnement
clinique. Commence par Force, Puissance, Réactivité ; les 6 qualités restantes suivront.

## ⚠️ Découverte préalable : une couche Vierge_7 non lue jusqu'ici, directement pertinente

En cherchant les données nécessaires aux champs "Conditions minimales d'activation", "Orientations
cliniques possibles" et "Liens vers déficits segmentaires", j'ai localisé une section de Vierge_7
non lue en Phase A/B : une **matrice clinique explicite**, structurée en identifiants `CLI###`,
organisée en 4 niveaux :

- **Niveau 1 — Orientations par qualité physique** (`CLI010`-`CLI092`) : une orientation clinique
  générale par qualité, avec déclencheur, variables diagnostiques/confirmatives/explicatives, et
  condition d'activation.
- **Niveau 2 — Orientations spécifiques de Force** (`CLI200`-`CLI213`) : un lien direct entre un
  déficit global de Force et un déficit segmentaire précis (quadriceps, ischio-jambiers,
  gastrocnémien, soléaire, extenseurs/abducteurs/adducteurs/fléchisseurs de hanche,
  dorsiflexeurs/inverseurs/éverseurs de cheville, **épaule**).
- **Niveau 3 — Fonctions motrices** (`CLI301`-`CLI309`) et **Niveau 4 — Objectifs cliniques /
  sorties** (`CLI400`+) : des niveaux d'agrégation au-dessus des qualités individuelles (proches du
  niveau Capacités déjà cartographié dans `KINEXUS_ENGINE_MAP.md`) — **hors périmètre de ce
  document**, une fiche HYP### restant au niveau d'une seule qualité.

Cette matrice **résout une ambiguïté ouverte depuis la Phase A** et **en révèle une nouvelle**,
documentées ci-dessous sans être arbitrées au-delà de ce qui a déjà été validé dans le gel.

### Résolution : la famille `sh_iso_*` identifiée
Signalée à répétition en Phase A comme "test Kinexus non couvert par Vierge_7" (Puissance, Force,
Réactivité, Absorption, Stabilisation...), la famille `sh_iso_9020`/`9090`/`3030`/`6060` est en
réalité couverte — par le Niveau 2, pas par les fiches de qualité elles-mêmes. `CLI211`
("Restaurer la force de l'épaule") l'identifie sans ambiguïté comme la force isométrique de
**l'épaule** (`sh` = shoulder), à différents angles de test (90/20, 90/90, 30/30, 60/60), utilisée
en confirmative/explicative du lien Force↔déficit segmentaire de l'épaule. Intégrée ci-dessous
dans la fiche Force.

### Nouvelle incohérence détectée (documentée, non arbitrée) : `cmjr_mean_rsi` diagnostique dans `CLI050`
`CLI050` ("Améliorer la réactivité") liste `CMJR_MEAN_RSI` comme **variable diagnostique**, aux
côtés de `dj_rsi`/`sldj_rsi` — alors que la fiche de qualité Réactivité elle-même (déjà auditée en
Phase A/B) classe `cmjr_mean_rsi` en confirmative/explicative biomécanique uniquement, jamais
diagnostique, et que le gel d'architecture n'a pas rouvert ce point. C'est une contradiction entre
deux sections différentes de Vierge_7 (la fiche de qualité vs la matrice d'orientation), du même
type que celles déjà rencontrées et jamais arbitrées unilatéralement. **Traitement retenu ici** :
la fiche de qualité (plus détaillée, plus justifiée, et cohérente avec le gel déjà validé) continue
de faire foi pour les critères diagnostiques du HYP### lui-même ; la mention de `CLI050` est
rapportée telle quelle dans le champ "Orientations cliniques possibles" ci-dessous, avec la
contradiction signalée en note, pas silencieusement alignée.

---

## HYP-FOR-01 — Force

### Question clinique
*Cet athlète est-il capable de produire un niveau de force maximale suffisant pour répondre aux
exigences de son activité physique ou sportive ?*

### Critères diagnostiques
`imtp_n` · `slimtp_n` · `iso_belt_squat_n` · `sl_iso_push_n`

### Critères confirmatifs
`imtp_nkg` · `slimtp_nkg` · `iso_belt_squat_nkg` · `sl_iso_push_nkg`

### Variables explicatives physiologiques
Force segmentaire (`n`/`nkg`) : `knee_ext` · `knee_flex` · `soleus_iso` · `gastro_iso` ·
`hip_flex` · `hip_ext` · `hip_abd` · `hip_add` · `df_iso` · `inv_iso` · `ev_iso` ·
**`sh_iso_9020`/`9090`/`3030`/`6060`** (épaule — identifié via `CLI211`, absent des sections de la
fiche de qualité elle-même, ajouté ici sur cette base)
Cinétique de production de force : familles RFD (`rfd50`/`100`/`150`/`200`/`ttpf`) des 15 tests
ci-dessus et des 4 tests diagnostiques.

### Variables explicatives biomécaniques
`rs_hip_push_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` · `rs_knee_push_*` · `rs_ankle_push_*`

### Conditions minimales d'activation
Vierge_7 ne fixe pas de seuil numérique dans la fiche de qualité, mais la matrice d'orientation
(`CLI010`) précise : **au moins deux des quatre variables diagnostiques déficitaires** pour que
l'orientation "Améliorer la force maximale globale" se déclenche. Retenu comme condition
d'activation de `HYP-FOR-01` lui-même, par cohérence — une seule variable diagnostique déficitaire
reste, conformément au principe transversal, insuffisante pour établir l'hypothèse à elle seule.

### Conditions de rejet
Vierge_7 ne formalise pas de condition de rejet explicite au-delà de l'absence de déficit sur les
critères diagnostiques (statut normal sur les 4 tests globaux). Aucune condition de rejet
"active" (un signal qui invaliderait l'hypothèse malgré un déficit apparent) n'est spécifiée dans
le texte source.

### Conditions de confiance
`CLI010`/`CLI011` distinguent implicitement deux profils de confiance : convergence sur plusieurs
tests globaux (confiance renforcée, "une divergence importante invite à rechercher une explication
physiologique ou biomécanique" — texte de la fiche de qualité) vs déficit isolé sur un seul test
avec les 3 autres normaux (confiance réduite, orientation vers une explication segmentaire avant de
conclure à un déficit global).

### Orientations cliniques possibles
*(telles que nommées par Vierge_7, Niveau 1 — reprises sans reformulation ni ajout de modalité
d'entraînement)*
- **`CLI010`** — Améliorer la force maximale globale (déclencheur : score Force diminué, ≥ 2
  variables diagnostiques déficitaires).
- **`CLI011`** — Améliorer la force relative (déclencheur : score Force normal mais force relative
  diminuée — critères sur les variables `_nkg`).
- **`CLI012`** — Réduire les asymétries de force (déclencheur : asymétrie de force au-delà du
  seuil clinique — LSI des tests globaux).

### Liens vers déficits segmentaires
*(Niveau 2, `CLI200`-`CLI212` — seule qualité dotée par Vierge_7 d'une décomposition segmentaire
complète)*

| Segment | CLI | Confirmative | Explicative |
|---|---|---|---|
| Quadriceps | `CLI200` | `knee_ext_n`/`nkg` | `knee_ext_rfd50`-`200`/`ttpf` |
| Soléaire | `CLI201` | `soleus_iso_n`/`nkg` | `soleus_iso_rfd50`-`200`/`ttpf` |
| Gastrocnémien | `CLI202` | `gastro_iso_n`/`nkg` | `gastro_iso_rfd50`-`200`/`ttpf` |
| Ischio-jambiers | `CLI203` | `knee_flex_n`/`nkg` | `knee_flex_rfd50`-`200`/`ttpf` |
| Extenseurs de hanche | `CLI204` | `hip_ext_n`/`nkg` | `hip_ext_rfd50`-`200`/`ttpf` |
| Abducteurs de hanche | `CLI205` | `hip_abd_n`/`nkg` | `hip_abd_rfd50`-`200`/`ttpf` |
| Adducteurs | `CLI206` | `hip_add_n`/`nkg` | `hip_add_rfd50`-`200`/`ttpf` |
| Fléchisseurs de hanche | `CLI207` | `hip_flex_n`/`nkg` | `hip_flex_rfd50`-`200`/`ttpf` |
| Dorsiflexeurs | `CLI208` | `df_iso_n`/`nkg` | `df_iso_rfd50`-`200`/`ttpf` |
| Inverseurs | `CLI209` | `inv_iso_n`/`nkg` | `inv_iso_rfd50`-`200`/`ttpf` |
| Éverseurs | `CLI210` | `ev_iso_n`/`nkg` | `ev_iso_rfd50`-`200`/`ttpf` |
| Épaule | `CLI211` | `sh_iso_9020`/`9090`/`3030`/`6060_n` | RFD/ttpf des 4 variantes |

Condition commune à chacun (`CLI200`-`211`) : *"au moins une variable diagnostique globale
déficitaire ET déficit local [du segment] confirmé"*. `CLI212` ("améliorer la force unilatérale
globale") et `CLI213` ("réduire un déficit local multiple") sont des orientations composites
au-dessus de ce tableau, déclenchées respectivement par ≥2 tests unilatéraux globaux déficitaires
et ≥3 groupes musculaires déficitaires simultanément.

### Variables contributrices (inventaire consolidé)
Tous les tests cités ci-dessus, quel que soit leur rôle : `imtp` · `slimtp` · `iso_belt_squat` ·
`sl_iso_push` · `knee_ext` · `knee_flex` · `soleus_iso` · `gastro_iso` · `hip_flex` · `hip_ext` ·
`hip_abd` · `hip_add` · `df_iso` · `inv_iso` · `ev_iso` · `sh_iso_9020`/`9090`/`3030`/`6060` ·
`rs_hip_push` · `rs_knee_push` · `rs_ankle_push`.

### Variables exclues
Toutes les variables de CMJ, SLCMJ, DJ, SLDJ, CMJR (puissance) · `wblt_distance`, `wblt_lsi`
(mobilité) · toutes les variables de SLS, EO, EF, Strobo (stabilisation) · toutes les variables de
Landing (uni/bi), SLLT (absorption)

---

## HYP-PUI-01 — Puissance

### Question clinique
*Cet athlète est-il capable de produire un niveau élevé de puissance mécanique lors d'une action
explosive (saut vertical) ?*

### Critères diagnostiques
`cmj_peak_power` (principal) · `slcmj_peak_power` (principal unilatéral)

**Preuve diagnostique secondaire** *(rang formalisé au gel, point 5)* — mobilisée uniquement en
l'absence des tests principaux, jamais en renfort à poids égal : `dj_peak_prop_power` ·
`sldj_peak_prop_power` · `cmjr_peak_power`

### Critères confirmatifs
`cmj_height` · `single_hop_distance` · `triple_hop_distance`
*(`cmj_height`/`slcmj_height` confirmées confirmatives, jamais diagnostiques — gel, point 6)*

### Variables explicatives physiologiques
`imtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` · `slimtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` ·
`profil_fv_nkg` · `profil_fv_v0` · Force segmentaire complète (`n`/`nkg`, 11 familles, mêmes que
Force — **sans `sh_iso_*`**, non mentionné dans la fiche de qualité Puissance) : `knee_ext` ·
`knee_flex` · `soleus_iso` · `gastro_iso` · `hip_flex` · `hip_ext` · `hip_abd` · `hip_add` ·
`sl_iso_push` · `iso_belt_squat` · `iso_squat_hold`

### Variables explicatives biomécaniques
Stratégie CMJ/SLCMJ (29 KPIs déjà listés dans `HYP_ARCHITECTURE_PHASE_B.md` fiche 2) — `cmj_peak_vel`,
`cmj_tto`, `cmj_depth`, `cmj_conc_mean_force`, `cmj_conc_rfd`, `cmj_braking_duration`, etc.

### Conditions minimales d'activation
`CLI040` : **"deux preuves diagnostiques déficitaires"** — exige explicitement `cmj_peak_power`
**et** `slcmj_peak_power` déficitaires conjointement, pas l'un ou l'autre isolément. C'est la
condition la plus stricte identifiée dans toute la matrice Niveau 1 lue à ce stade (les autres
qualités acceptent une déficience sur une variable diagnostique parmi plusieurs).

### Conditions de rejet
Aucune condition de rejet active formalisée par Vierge_7. Statut normal sur `cmj_peak_power` et
`slcmj_peak_power` = absence de déficit, pas de mécanisme de rejet actif au-delà.

### Conditions de confiance
La preuve diagnostique secondaire (`dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power`)
ne renforce jamais la confiance d'un diagnostic déjà établi par `cmj_peak_power`/`slcmj_peak_power`
— son rôle est exclusivement de suppléance en cas d'indisponibilité du test principal, pas de
renforcement (gel, point 5).

### Orientations cliniques possibles
- **`CLI040`** — Augmenter la puissance maximale (déclencheur : score Puissance diminué ; condition
  : les deux preuves diagnostiques déficitaires). Variables explicatives citées par Vierge_7 à ce
  niveau : "Force" et "Explosivité" — c'est-à-dire que l'orientation elle-même pointe vers les
  *qualités* Force et Explosivité comme explication possible, pas vers des variables individuelles
  — un niveau d'abstraction différent de celui des fiches de qualité, noté tel quel.
- **`CLI041`** — Augmenter la puissance relative (déclencheur : "PP/BM diminuée" — pas de condition
  numérique fournie pour cette entrée dans Vierge_7, contrairement à `CLI040`).

### Liens vers déficits segmentaires
**Aucun lien segmentaire dédié.** Contrairement à Force, Vierge_7 ne consacre aucune section
Niveau 2 à Puissance — `CLI040` renvoie génériquement aux *qualités* Force et Explosivité comme
explication, sans décomposition par groupe musculaire. Un déficit de puissance expliqué par la
force segmentaire devrait, en l'état de Vierge_7, être investigué via le Niveau 2 de **Force**
(`CLI200`-`211` ci-dessus), pas via une section propre à Puissance.

### Variables contributrices (inventaire consolidé)
`cmj` · `slcmj` · `dj` (KPI `peak_prop_power` uniquement) · `sldj` (KPI `peak_prop_power`
uniquement) · `cmjr` (KPI `peak_power` uniquement) · `imtp` · `slimtp` · `profil_fv` ·
`knee_ext` · `knee_flex` · `soleus_iso` · `gastro_iso` · `hip_flex` · `hip_ext` · `hip_abd` ·
`hip_add` · `sl_iso_push` · `iso_belt_squat` · `iso_squat_hold` · `single_hop` · `triple_hop`

### Variables exclues
`wblt_distance` (mobilité) · toutes les variables de Landing (uni/bi), SLLT (absorption pure) ·
toutes les variables de `heel_raise`, `repeated_hop` (endurance/résistance)

---

## HYP-REA-01 — Réactivité

### Question clinique
*Cet athlète est-il capable de restituer rapidement la force après un contact au sol ou une
contrainte de freinage ?*

### Critères diagnostiques
`dj_rsi` (principal) · `sldj_rsi` (principal unilatéral)

### Critères confirmatifs
`dj_contact_time` · `dj_peak_prop_force` · `dj_peak_prop_power` · `dj_leg_stiffness` · `dj_height`
· `dj_landing_impulse` · `dj_peak_landing_force` · équivalents `sldj_*` · `single_hop_distance` ·
`triple_hop_distance` · `crossover_hop_distance`

### Variables explicatives physiologiques
`imtp_rfd100`/`rfd200`/`ttpf` · `slimtp_rfd100`/`rfd200`/`ttpf` ·
`iso_belt_squat_rfd100`/`rfd200`/`ttpf` · `sl_iso_push_rfd100`/`rfd200`/`ttpf` ·
`iso_squat_hold_rfd100`/`rfd200`/`ttpf` · cinétique segmentaire complète (11 familles RFD) ·
`profil_fv_nkg` · `profil_fv_v0`

### Variables explicatives biomécaniques
`dj_contact_time`/`leg_stiffness`/`peak_landing_force`/`landing_impulse`/`peak_prop_force`/
`peak_prop_power` (double rôle confirmative/explicative) · équivalents `sldj_*` ·
`cmjr_mean_ct` · `cmjr_mean_stiffness` · `cmjr_mean_rebound_height` · `cmjr_mean_rsi` ·
`cmjr_rsi_decay` · `cmjr_stiffness_decay` (CMJR entièrement explicatif — **jamais diagnostique**,
malgré `CLI050`, voir avertissement en tête de document)

### Conditions minimales d'activation
`CLI050` : **"deux variables RSI déficitaires"** parmi `dj_rsi`/`sldj_rsi`/`cmjr_mean_rsi`. Cette
condition, prise telle quelle, intègre `cmjr_mean_rsi` comme variable diagnostique au même titre
que `dj_rsi`/`sldj_rsi` — ce que la fiche de qualité contredit. **Condition retenue pour
`HYP-REA-01`, en cohérence avec la fiche de qualité et le gel déjà validé** : au moins les deux
variables diagnostiques réelles (`dj_rsi` **et** `sldj_rsi`) déficitaires — `cmjr_mean_rsi` peut
converger en confirmation, jamais compter comme l'une des "deux preuves" exigées.

### Conditions de rejet
Aucune condition de rejet active formalisée par Vierge_7 au-delà du statut normal sur `dj_rsi`/
`sldj_rsi`.

### Conditions de confiance
`CLI050` cite `Contact Time` et `Jump Height` comme confirmatives renforçant la confiance
(correspondant à `dj_contact_time`/`sldj_contact_time` et `dj_height`/`sldj_height` de la fiche de
qualité) ; `CLI051` ("réduire le temps de contact", déclenchée par `dj_contact_time`/
`sldj_contact_time`, confirmée par `dj_rsi`) décrit une lecture complémentaire centrée sur le temps
de contact plutôt que le RSI — les deux angles convergeant renforcent la confiance globale dans
`HYP-REA-01`.

### Orientations cliniques possibles
- **`CLI050`** — Améliorer la réactivité (déclencheur : score Réactivité diminué ; condition : deux
  variables RSI déficitaires — voir réserve ci-dessus sur `cmjr_mean_rsi`).
- **`CLI051`** — Réduire le temps de contact (pas de déclencheur ni de condition numérique fournis
  pour cette entrée dans Vierge_7, contrairement à `CLI050` — asymétrie de formalisation entre les
  deux orientations de la même qualité, notée sans être corrigée).

### Liens vers déficits segmentaires
**Aucun lien segmentaire dédié**, comme pour Puissance — pas de section Niveau 2 propre à
Réactivité dans Vierge_7. `CLI050` cite génériquement "RFD" et "Stiffness" comme explicatives, sans
décomposition par groupe musculaire.

### Variables contributrices (inventaire consolidé)
`dj` · `sldj` · `cmjr` (rôle explicatif uniquement, voir avertissement) · `single_hop` ·
`triple_hop` · `crossover_hop` · `imtp` · `slimtp` · `iso_belt_squat` · `sl_iso_push` ·
`iso_squat_hold` · `profil_fv` · famille segmentaire RFD complète (11 tests)

### Variables exclues
`wblt_distance`, `ybt_*`, toutes les variables de SLS, EO, EF, Strobo (mobilité/équilibre/contrôle
sensoriel) · toutes les variables de Landing (uni/bi), SLLT (absorption pure) · `heel_raise_reps` ·
toutes les variables `repeated_hop_*` de fatigue/dégradation (voir Endurance)

---

## Prochaines qualités

Explosivité, Absorption, Stabilisation (Contrôle Sensori-moteur suspendue), Endurance, Mobilité —
avec vérification systématique de la présence ou non d'une section Niveau 2 dédiée dans Vierge_7
pour chacune, sur le même principe que celui appliqué ici à Force/Puissance/Réactivité.

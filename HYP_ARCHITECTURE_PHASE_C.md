# Phase C — Moteur de raisonnement clinique HYP### (fiches complètes)

## Statut de ce document

Construction des HYP### complets, à partir des décisions figées dans `HYP_ARCHITECTURE_FREEZE.md`
(validées en bloc par le praticien) et de `HYP_ARCHITECTURE_PHASE_B.md`. Aucun code, aucune
configuration, aucune recommandation d'entraînement — uniquement le moteur de raisonnement
clinique. Force, Puissance, Réactivité construites en premier ; Explosivité, Absorption,
Stabilisation, Endurance, Mobilité ci-dessous complètent la couverture (Contrôle Sensori-moteur
reste suspendue, conformément au gel).

**Méthodologie renforcée à partir de cette livraison** (consignes du praticien) :
- **Aucune logique clinique nouvelle.** Si une orientation, un lien segmentaire ou une condition
  d'activation n'est explicitement supporté ni par la fiche de qualité, ni par un `CLI###`, ni par
  une autre section formelle de Vierge_7, l'absence est documentée telle quelle — jamais complétée
  par analogie avec une autre qualité.
- **Séparation systématique** entre 📄 ce qui est explicitement écrit dans Vierge_7 (fiche de
  qualité ou `CLI###`, cité ou paraphrasé fidèlement) et 🔧 ce qui relève d'une inférence
  nécessaire à la construction du HYP### (rapprochement de nommage, déduction de structure) —
  marqué à chaque fois que la distinction n'est pas triviale.
- **Encadré "Niveau de maturité de la qualité"** en fin de chaque fiche : couverture
  diagnostique/confirmative/explicative physiologique/explicative biomécanique/`CLI###`, données
  manquantes, ambiguïtés restantes.

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

## Note structurelle valable pour les 5 fiches suivantes

Vérification faite (relecture des parties 2 et 3 de Vierge_7, structure complète de la matrice
CLI### de la partie 2) : **aucune des 5 qualités ci-dessous ne dispose d'une section "Niveau 2 —
Orientations spécifiques" dédiée.** Force reste la seule qualité dotée de cette décomposition
segmentaire (`CLI200`-`213`). 📄 Constat documenté, pas une inférence — la section "NIVEAU 3 -
FONCTIONS MOTRICES" suit directement le bloc Force dans le document, sans qu'aucune autre section
"NIVEAU 2" n'apparaisse pour une autre qualité.

Mapping `CLI###` → qualité confirmé pour l'ensemble du document (Niveau 1) : `CLI010`-`012`=Force ·
`CLI020`-`021`=Mobilité · `CLI030`-`031`=Explosivité · `CLI040`-`041`=Puissance ·
`CLI050`-`051`=Réactivité · `CLI060`-`061`=Absorption · `CLI070`-`071`=Stabilisation ·
`CLI080`-`081`=Endurance · `CLI090`-`092`=Contrôle Sensori-moteur.

---

## HYP-EXP-01 — Explosivité

### Question clinique
📄 *Cet athlète est-il capable de développer rapidement une force importante dans les tâches où la
montée en force est un enjeu central ?*

### Critères diagnostiques
📄 `cmj_conc_rfd` · 📄 `cmj_conc_impulse_100`
*(voir décomposition mesuré/proxy/impossible ci-dessous — ce sont les 2 seules variables
réellement calculées par Kinexus parmi les 4 que Vierge_7 vise)*

### Critères confirmatifs
📄 `cmj_peak_power` · `cmj_conc_peak_force` · `cmj_conc_mean_force` · `cmj_conc_impulse`
*(fiche de qualité ; `CLI030` cite les mêmes trois premières sous les libellés génériques
`CMJ_PP_BM`/`CMJ_PEAK_FORCE`/`CMJ_CONCENTRIC_IMPULSE` — cohérent, aucun conflit)*

### Variables explicatives physiologiques
📄 `imtp_rfd100`/`rfd200`/`ttpf` · `slimtp_rfd100`/`rfd200`/`ttpf` ·
`iso_belt_squat_rfd100`/`rfd200`/`ttpf` · `sl_iso_push_rfd100`/`rfd200`/`ttpf` ·
`iso_squat_hold_rfd100`/`rfd200`/`ttpf` · cinétique segmentaire complète (11 familles RFD) ·
`profil_fv_nkg`/`v0` (fiche de qualité).
⚠️ `CLI030` cite une liste plus étroite ("Toutes les RFD IMTP, Belt Squat, SLIMTP, segmentaires") —
**omet explicitement `sl_iso_push` et `iso_squat_hold`**, pourtant présents dans la fiche de
qualité. 📄 Écart documenté entre les deux sections, non arbitré ; la fiche de qualité (plus
complète) reste la source retenue pour `HYP-EXP-01`, conformément au principe déjà appliqué
ailleurs (section détaillée > résumé, gel point 6).

### Variables explicatives biomécaniques
📄 `cmj_depth` · `cmj_conc_duration` · `cmj_rsi_mod` · `cmj_ecc_mean_power` · `cmj_ecc_peak_vel` ·
🔧 `cmj_braking_rfd` (correspondance inférée de `CMJ_ECC_DECEL_RFD`, non confirmée par le
praticien — gel point 11, décision déjà actée d'adopter cette correspondance)

### Conditions minimales d'activation
📄 `CLI030` : **"au moins deux variables RFD déficitaires"** parmi les 4 citées (`CMJ_RFD100`,
`CMJ_RFD150`, `CMJ_RFD200`, `CMJ_IMPULSE100MS`). 🔧 Inférence nécessaire pour l'implémentation :
comme seules 2 de ces 4 variables sont réellement mesurées (`cmj_conc_rfd`, `cmj_conc_impulse_100`
— voir ci-dessous), la condition "deux déficitaires parmi quatre" ne peut aujourd'hui porter que
sur ces deux-là. Vierge_7 ne prévoit pas explicitement ce cas de figure (une condition portant sur
un ensemble de variables partiellement indisponibles) — l'application de la condition aux 2
variables disponibles est une inférence, pas une règle écrite.

### Conditions de rejet
📄 Aucune formalisée, comme pour les autres qualités déjà construites.

### Conditions de confiance
📄 `CLI031` ("Optimiser le recrutement explosif") : condition "RFD100 sous le seuil" seule (une
variable), contre "deux variables RFD déficitaires" pour `CLI030` — donc, structurellement, `CLI031`
accepte un niveau de preuve plus faible pour une orientation plus spécifique. 📄 Constat rapporté
tel quel, pas harmonisé avec `CLI030`.

### Orientations cliniques possibles
- 📄 **`CLI030`** — Améliorer la vitesse de développement de force (déclencheur : score
  Explosivité diminué ; condition : ≥ 2 variables RFD déficitaires).
- 📄 **`CLI031`** — Optimiser le recrutement explosif (condition : RFD100 sous le seuil — pas de
  déclencheur explicite fourni pour cette entrée).

### Liens vers déficits segmentaires
📄 **Aucun lien segmentaire dédié** (pas de section Niveau 2 pour Explosivité — voir note en tête
de section).

### Variables contributrices (inventaire consolidé)
`cmj` (KPIs cités ci-dessus) · `imtp` · `slimtp` · `iso_belt_squat` · `sl_iso_push` ·
`iso_squat_hold` · `profil_fv` · famille segmentaire RFD complète (11 tests)

### Variables exclues
📄 Variables de puissance pure du CMJ/SLCMJ (`cmj_height`, `cmj_peak_vel`, `cmj_conc_mean_power`,
équivalents SLCMJ) · toutes les variables DJ, SLDJ, CMJR · `wblt_distance`/`lsi`/`asymmetry`
(mobilité) · toutes les variables de SLS, EO, EF, Strobo (stabilisation) · toutes les variables de
Landing, SLLT (absorption)

### 🔍 Ce qui est réellement mesuré, approché, ou impossible aujourd'hui (demande explicite)

| Variable Vierge_7 | Statut réel dans Kinexus |
|---|---|
| `CMJ_IMPULSE100MS` | **Mesuré directement** — correspond exactement à `cmj_conc_impulse_100`, déjà calculé |
| `CMJ_RFD100`, `CMJ_RFD150`, `CMJ_RFD200` | **Approché par proxy** — Kinexus ne calcule qu'un `cmj_conc_rfd` unique, non fenêtré sur la phase concentrique entière ; ce proxy remplace 3 variables distinctes attendues par Vierge_7, avec une perte de résolution temporelle |
| RFD fenêtrée à 100/150/200 ms spécifiquement | **Impossible à mesurer aujourd'hui** — nécessiterait un calcul de pente force-temps sur des fenêtres glissantes depuis l'onset du mouvement, non implémenté dans le pipeline CMJ actuel de Kinexus |

### 📋 Niveau de maturité de la qualité

| Critère | Évaluation |
|---|---|
| Couverture diagnostique | 🟠 Partielle — 2 des 4 variables visées par Vierge_7 sont mesurées, sous forme de proxy pour les 3 variantes fenêtrées |
| Couverture confirmative | 🟢 Complète — les 4 variables confirmatives (fiche + `CLI030`) sont toutes mesurées |
| Couverture explicative physiologique | 🟢 Complète (fiche de qualité) — écart mineur avec `CLI030`, qui en cite un sous-ensemble |
| Couverture explicative biomécanique | 🟡 Quasi complète — une correspondance de nommage non confirmée (`cmj_braking_rfd`) |
| Couverture `CLI###` | 🟢 Complète — 2 orientations Niveau 1, aucune section Niveau 2 |
| Données manquantes | RFD fenêtrée du CMJ (100/150/200 ms) — plafond de confiance structurel déjà acté au gel |
| Ambiguïtés restantes | Écart de périmètre entre la fiche de qualité et `CLI030` sur les variables explicatives (`sl_iso_push`/`iso_squat_hold` omis dans `CLI030`) ; correspondance `cmj_braking_rfd` non confirmée par le praticien |

---

## HYP-ABS-01 — Absorption

### Question clinique
📄 *Cet athlète sait-il freiner et dissiper correctement la charge sans perte excessive de
contrôle, de temps ou de symétrie ?*

### Critères diagnostiques
📄 `landing_uni_tts` · `landing_bi_tts` · `sllt_peak_landing_force`, `sllt_ttplf`,
`sllt_loading_rate`, `sllt_tts`, `sllt_cop_path` · `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` ·
🔧 `cmj_braking_rfd`, `cmj_braking_impulse` (correspondance inférée, gel point 11)

### Critères confirmatifs
📄 `landing_bi_peak_landing_force` · `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`,
`cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_landing_impulse` · `dj_contact_time`,
`dj_landing_impulse`, `dj_peak_landing_force` · équivalents `sldj_*`

### Variables explicatives physiologiques
📄 `imtp_rfd100`/`rfd200` · `slimtp_rfd100`/`rfd200` · `iso_belt_squat_rfd100`/`rfd200` ·
`sl_iso_push_rfd100`/`rfd200` · `knee_ext_rfd100`/`rfd150`/`rfd200` · `soleus_iso_rfd100`/`rfd200`
· `gastro_iso_rfd100`/`rfd200` · `hip_abd_rfd100` · `hip_add_rfd100` · `hip_ext_rfd100` ·
`hip_flex_rfd100` · `wblt_distance`

### Variables explicatives biomécaniques
📄 `cmj_braking_duration` (double rôle) · `dj_contact_time`/`leg_stiffness`/`peak_landing_force`/
`landing_impulse`/`peak_prop_force`/`peak_prop_power` (double rôle) · équivalents `sldj_*`

### Conditions minimales d'activation
📄 `CLI060` : **"deux preuves diagnostiques déficitaires"**.

### Conditions de rejet
📄 Aucune formalisée.

### Conditions de confiance
📄 `CLI060`/`CLI061` citent systématiquement "Peak Landing Force" et "Time To Stabilization"
comme les deux piliers (diagnostique/confirmative croisés selon l'orientation) — convergence entre
ces deux signaux comme facteur principal de confiance, cohérent avec la fiche de qualité.

### Orientations cliniques possibles
- 📄 **`CLI060`** — Améliorer la capacité d'absorption (déclencheur : score Absorption diminué ;
  diagnostiques : "Peak Landing Force", "Time To Stabilization" ; confirmatives : "COP", "Post
  Stability" ; explicatives : "Force, Mobilité, Stabilisation" — 3 *qualités* citées comme
  explicatives, pas des variables individuelles, même motif d'abstraction que `CLI040`/Puissance ;
  condition : deux preuves diagnostiques déficitaires).
- 📄 **`CLI061`** — Réduire les pics d'impact (diagnostique : "Peak Landing Force" ; confirmative :
  "Time To Stabilization" ; explicative : "Force excentrique" ; pas de condition numérique fournie).

### Liens vers déficits segmentaires
📄 **Aucun lien segmentaire dédié.**

### Variables contributrices (inventaire consolidé)
`landing_uni` · `landing_bi` · `sllt` · `cmj` (KPIs cités) · `dj` · `sldj` · `imtp` · `slimtp` ·
`iso_belt_squat` · `sl_iso_push` · `knee_ext` · `soleus_iso` · `gastro_iso` · `hip_abd` ·
`hip_add` · `hip_ext` · `hip_flex` · `wblt`

### Variables exclues
📄 `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`, `cmjr_mean_rebound_height`, `single_hop_distance`,
`triple_hop_distance`, `crossover_hop_distance`, `repeated_hop_mean_rsi` (réactivité pure) ·
`heel_raise_reps`, `repeated_hop_ct_drift`, `repeated_hop_rsi_fatigue`,
`repeated_hop_height_fatigue` (endurance)

### 🔎 Réexamen demandé : `landing_bi_peak_landing_force`, `sllt`, `landing_uni`, `sls` à la lumière de `CLI###`

- **`landing_bi_peak_landing_force`** : 📄 `CLI060` et `CLI061` citent tous deux "Peak Landing
  Force" comme variable pivot d'Absorption (diagnostique dans les deux). **Corrobore la décision
  du gel** (variable exclue de Stabilisation, conservée pour Absorption) — aucun changement.
- **`sllt`** : 📄 aucune mention de SLLT dans `CLI060`/`061`, ni sous ce nom ni sous un libellé
  générique reconnaissable. Le lien reste établi uniquement via la fiche de qualité (diagnostique
  principal unilatéral). **Pas de contradiction avec le gel — silence, pas un désaccord.**
- **`landing_uni`** : 📄 "Time To Stabilization" apparaît dans `CLI060` (confirmative) et `CLI061`
  (confirmative) sans distinguer `landing_uni`/`landing_bi`/`sllt` — cohérent avec le rôle
  diagnostique déjà retenu pour `landing_uni_tts`. **Aucun changement.**
- **`sls`** : 📄 SLS n'apparaît dans aucune section de `CLI060`/`CLI061` — cohérent avec son
  absence du référentiel Absorption (SLS appartient à Stabilisation/CSM, jamais cité pour
  Absorption dans la fiche de qualité non plus). **Aucun changement.**

**Conclusion du réexamen pour Absorption** : les arbitrages du gel restent cohérents avec les
sections `CLI###` nouvellement découvertes — aucune révision nécessaire.

### 📋 Niveau de maturité de la qualité

| Critère | Évaluation |
|---|---|
| Couverture diagnostique | 🟢 Forte pour SLLT (5/5 KPIs) et la phase excentrique CMJ (sous réserve de la correspondance de nommage) ; 🟠 limitée pour Landing (1-2 KPIs sur 4-5 attendus par test) |
| Couverture confirmative | 🟢 Bonne — 13 variables mesurées, aucune manquante identifiée |
| Couverture explicative physiologique | 🟢 Complète sur les familles citées |
| Couverture explicative biomécanique | 🟡 Partielle — dépend de la correspondance `cmj_braking_*` non confirmée |
| Couverture `CLI###` | 🟢 2 orientations Niveau 1, cohérentes avec la fiche de qualité, aucune section Niveau 2 |
| Données manquantes | KPIs Landing (`loading_rate`/`impulse`/`cop_path` pour `landing_uni` et `landing_bi`) non calculés par Kinexus |
| Ambiguïtés restantes | Statut des asymétries (gel point 3, non résolu ici) ; correspondance `cmj_braking_*` non confirmée |

---

## HYP-STAB-01 — Stabilisation

### Question clinique
📄 *Cet athlète est-il capable de stabiliser efficacement son corps après une contrainte, un appui
ou une perturbation ?*

### Critères diagnostiques
📄 `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`,
`sls_cop_range_ap`, `sls_mean_velocity` · `eo_surface`, `ef_surface` · `strobo_surface` ·
`landing_uni_tts`, `landing_bi_tts` *(fiche de qualité — voir réexamen ci-dessous : `CLI070` ne
couvre qu'une partie de cette liste)*

### Critères confirmatifs
📄 Mêmes variables SLS · `strobo_surface` (double rôle) · `landing_uni_tts`, `landing_bi_tts`
(double rôle) — fiche de qualité.

### Variables explicatives physiologiques
📄 `hip_abd_rfd100`/`rfd200` · `hip_ext_rfd100`/`rfd200` · `hip_add_rfd100` · `inv_iso_rfd100` ·
`ev_iso_rfd100` · `df_iso_rfd100` · `wblt_distance`

### Variables explicatives biomécaniques
📄 `sls_cop_path`, `sls_cop_vel`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_ellipse_area`,
`sls_mean_velocity` (double rôle) · `strobo_surface`, `landing_uni_tts`, `landing_bi_tts` (triple
rôle)

### Conditions minimales d'activation
📄 `CLI070` : **"deux preuves diagnostiques déficitaires"**. ⚠️ Mais le diagnostique de `CLI070`
ne cite que **SLS** — EO/EC apparaissent en confirmative, pas en diagnostique, et Strobo/Landing
n'apparaissent nulle part dans `CLI070`/`CLI071` (voir réexamen ci-dessous). 🔧 Inférence
nécessaire : appliquer "deux preuves diagnostiques déficitaires" au sens de la fiche de qualité
(4 familles) suppose d'étendre le périmètre de `CLI070`, ce que Vierge_7 ne fait pas
explicitement — écart signalé, pas résolu.

### Conditions de rejet
📄 Aucune formalisée.

### Conditions de confiance
📄 `CLI070` : SLS diagnostique + EO/EC confirmatives, cohérence renforcée si les deux convergent.

### Orientations cliniques possibles
- 📄 **`CLI070`** — Améliorer la stabilité posturale (déclencheur : score Stabilisation diminué ;
  diagnostique : SLS ; confirmatives : EO, EC *(libellé Vierge_7 — "EC" ici, "EF" dans la fiche de
  qualité et dans `TFM`/`VAR_REL3`, variante de nommage non harmonisée par Vierge_7 lui-même)* ;
  explicatives : Hip Abd, Hip Ext, Inv, Ev ; condition : deux preuves diagnostiques déficitaires).
- 📄 **`CLI071`** — Réduire les oscillations posturales (diagnostique : COP Path ; confirmative :
  COP Velocity ; explicative : "Force des stabilisateurs" ; pas de condition numérique fournie).

### Liens vers déficits segmentaires
📄 **Aucun lien segmentaire dédié.**

### Variables contributrices (inventaire consolidé)
`sls` · `eo` · `ef` · `strobo` · `landing_uni` · `landing_bi` · `hip_abd` · `hip_ext` · `hip_add` ·
`inv_iso` · `ev_iso` · `df_iso` · `wblt`

### Variables exclues
📄 🚫 `sllt_peak_landing_force`, `sllt_loading_rate` (voir réexamen ci-dessous) · `cmj_peak_power`,
`slcmj_peak_power`, `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`, `single_hop_distance`,
`triple_hop_distance`, `crossover_hop_distance`, `repeated_hop_mean_rsi` (puissance/réactivité) ·
`imtp_n`/`nkg`, `knee_ext_n`, `soleus_iso_n`, `gastro_iso_n` (force maximale) ·
`landing_bi_peak_landing_force` (gel point 2)

### 🔎 Réexamen demandé : `landing_bi_peak_landing_force`, `sllt`, `landing_uni`, `sls` à la lumière de `CLI###`

- **`landing_bi_peak_landing_force`** : 📄 absent de `CLI070`/`CLI071` — aucune mention, ni sous ce
  nom ni générique. **Corrobore la décision du gel** (exclusion) — le silence de la matrice
  d'orientation sur ce point ne contredit pas l'exclusion, il ne la contredit pas non plus
  activement ; c'est une absence cohérente avec l'exclusion déjà actée.
- **`sllt`** : 📄 également absent de `CLI070`/`CLI071`, sous quelque nom que ce soit. **Corrobore
  fortement la décision du gel** — SLLT n'apparaît dans aucune section de Stabilisation, ni la
  fiche de qualité (hors exclusion explicite), ni la matrice d'orientation. Renforce la conclusion
  déjà établie en Phase A : SLLT n'a structurellement aucune place légitime dans Stabilisation.
- **`landing_uni`** (`tts`) : ⚠️ **point nouveau, non résolu.** La fiche de qualité le classe
  diagnostique principal contextuel, mais `CLI070`/`CLI071` — les deux seules orientations
  Stabilisation trouvées dans Vierge_7 — **ne le mentionnent nulle part**. Le diagnostic
  `HYP-STAB-01` continue de l'inclure (fiche de qualité, source retenue par défaut), mais aucune
  orientation clinique connue ne se déclenche actuellement sur ce signal si Landing est le seul
  déficit trouvé. **Documenté comme un écart de couverture entre le niveau diagnostique et le
  niveau orientation, pas arbitré.**
- **`sls`** : 📄 confirmé comme le seul déclencheur diagnostique explicite de `CLI070`. **Renforce**
  son statut de variable diagnostique centrale de Stabilisation, déjà établi.

**Conclusion du réexamen pour Stabilisation** : les arbitrages du gel sur `sllt`/
`landing_bi_peak_landing_force` restent cohérents, corroborés par une nouvelle source
indépendante. **Un point nouveau apparaît cependant** : Landing (`tts`) est diagnostique dans la
fiche de qualité mais absent des deux orientations `CLI###` connues de Stabilisation — signalé au
praticien, pas résolu ici.

### 📋 Niveau de maturité de la qualité

| Critère | Évaluation |
|---|---|
| Couverture diagnostique | 🟢 SLS (7/7 KPIs), EO/EF (1/1 chacun) ; 🟠 Strobo (1 KPI sur 3 attendus) ; 🟠 Landing (1-2 KPIs sur 4-5 attendus, et absent de la matrice d'orientation, voir réexamen) |
| Couverture confirmative | 🟢 Bonne, entièrement réutilisée de la liste diagnostique |
| Couverture explicative physiologique | 🟢 Complète sur les 6 familles citées |
| Couverture explicative biomécanique | 🟢 Complète |
| Couverture `CLI###` | 🟡 Partielle — 2 orientations trouvées, périmètre plus étroit (SLS seul en diagnostique) que la fiche de qualité (4 familles) |
| Données manquantes | KPIs Strobo (`cop_path`/`cop_vel`) et Landing (`loading_rate`/`impulse`/`cop_path`) non calculés |
| Ambiguïtés restantes | Landing absent de la matrice d'orientation malgré son statut diagnostique en fiche de qualité (nouveau, non résolu) ; quasi-duplication avec Contrôle Sensori-moteur (gel point 1, `HYP-CSM-01` suspendue) — **note complémentaire** : `CLI090` (CSM) couvre EO/EC/Strobo/SLS ensemble comme déclencheur, contre SLS seul pour `CLI070` (Stabilisation) — une différenciation réelle qui n'existait pas au niveau des fiches de qualité, potentiellement pertinente pour une future réouverture du point 1, non traitée ici car `HYP-CSM-01` reste suspendue par instruction explicite |

---

## HYP-END-01 — Endurance

### Question clinique
📄 *Cet athlète est-il capable de répéter l'effort sans chute précoce et excessive de
performance ?* (résistance à la fatigue spécifique)

### Critères diagnostiques
📄 `heel_raise_reps` · `repeated_hop_n_hops` · `repeated_hop_rsi_fatigue`,
`repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue`
*(fiche de qualité ; `CLI080` cite exactement les mêmes 5 variables de fatigue/dégradation +
`heel_raise_reps`, sans `n_hops` — omission mineure notée, sans conséquence car `n_hops` reste
soutenu par la fiche de qualité)*

### Critères confirmatifs
📄 `repeated_hop_mean_height`, `mean_rsi`, `mean_peak_force`, `mean_ct` · `best_height`, `best_rsi`
· `height_cv`, `ct_cv`, `rsi_cv`

### Variables explicatives physiologiques
📄 `imtp_n`/`nkg` · `slimtp_n`/`nkg` · `iso_belt_squat_n`/`nkg` · `sl_iso_push_n`/`nkg` · force
segmentaire complète (`n`/`nkg`, 11 familles) · cinétique complète (15 familles RFD)

### Variables explicatives biomécaniques
📄 `repeated_hop_mean_ct`, `ct_drift`, `height_cv`, `ct_cv`, `rsi_cv` (double rôle) ·
`repeated_hop_mean_height`, `best_height`, `mean_rsi`, `best_rsi`, `mean_peak_force` (double rôle)

### Conditions minimales d'activation
📄 `CLI080` : **"deux preuves diagnostiques déficitaires"**.

### Conditions de rejet
📄 Aucune formalisée.

### Conditions de confiance
📄 `CLI080` cite "Mean RSI, Mean Height, Coefficient of Variation" comme confirmatives renforçant
la confiance — cohérent avec la fiche de qualité.

### Orientations cliniques possibles
- 📄 **`CLI080`** — Améliorer la résistance à la fatigue (déclencheur : score Endurance diminué ;
  explicatives : "Force, Explosivité" — deux *qualités* citées, même motif d'abstraction que
  `CLI040`/Puissance et `CLI060`/Absorption ; condition : deux preuves diagnostiques déficitaires).
- 📄 **`CLI081`** — Réduire la dégradation de performance (diagnostique : RSI Fatigue ;
  confirmative : Height Fatigue ; explicative : Force ; pas de condition numérique fournie).

### Liens vers déficits segmentaires
📄 **Aucun lien segmentaire dédié.**

### Variables contributrices (inventaire consolidé)
`repeated_hop` · `heel_raise` · `imtp` · `slimtp` · `iso_belt_squat` · `sl_iso_push` · famille
segmentaire complète (11 tests)

### Variables exclues
📄 Toutes les variables de CMJ, SLCMJ, DJ, SLDJ, CMJR (puissance) · `wblt_distance`/`lsi`/`asymmetry`
(mobilité) · toutes les variables de SLS, EO, EF, Strobo (stabilisation) · toutes les variables de
Landing, SLLT (absorption)

### 📋 Niveau de maturité de la qualité

| Critère | Évaluation |
|---|---|
| Couverture diagnostique | 🟢 Complète — 6 variables, toutes mesurées, cohérence totale fiche/`CLI080` |
| Couverture confirmative | 🟢 Complète |
| Couverture explicative physiologique | 🟢 Complète |
| Couverture explicative biomécanique | 🟢 Complète |
| Couverture `CLI###` | 🟢 2 orientations Niveau 1, cohérentes, aucune section Niveau 2 |
| Données manquantes | Aucune — seule qualité, avec Force, sans aucun KPI manquant identifié |
| Ambiguïtés restantes | Dépendance `NORMS` non filtrée pour `repeated_hop` (Phase A, opérationnelle, pas une ambiguïté de spécification) ; `repeated_hop_mean_stiffness` reste le seul KPI du test sans rôle assigné par Vierge_7, nulle part |

---

## HYP-MOB-01 — Mobilité

### Question clinique
📄 *L'athlète dispose-t-il d'une mobilité de cheville suffisante en charge pour permettre des
appuis, freinages, réceptions et transferts de charge efficaces ?* (dorsiflexion fonctionnelle de
cheville uniquement)

### Critères diagnostiques
📄 `wblt_distance` · 🔧 LSI calculé (`autoLSI`/`data.lsiAuto`, mécanisme générique déjà existant,
correspond à `wblt_lsi`)

### Critères confirmatifs
📄 `wblt_distance`, LSI calculé — Vierge_7 : *"la mobilité de cheville repose exclusivement sur ce
test, donc les variables confirmatives sont essentiellement des nuances de la même preuve"*.

### Variables explicatives physiologiques
📄 **Aucune** — toutes les variables explicatives physiologiques citées par Vierge_7 pour cette
qualité sont non mesurables (voir liste en fin de fiche).

### Variables explicatives biomécaniques
📄 **Aucune**, même constat.

### Conditions minimales d'activation
📄 `CLI020` : **"distance inférieure au seuil"** (une seule variable, `wblt_distance`) — la
condition la plus simple de toutes les qualités auditées (une seule variable, pas de convergence
requise entre plusieurs preuves), cohérent avec la règle de fond ("évaluée uniquement par le
WBLT").

### Conditions de rejet
📄 Aucune formalisée.

### Conditions de confiance
⚠️ **Point structurel observé, pas une règle explicite de Vierge_7** : `CLI020` et `CLI021`
attribuent des rôles différents aux mêmes variables selon l'orientation visée — `wblt_lsi` est
explicative dans `CLI020` (orientation générale) mais diagnostique dans `CLI021` (orientation
spécifique à l'asymétrie), et symétriquement pour `wblt_distance`/`wblt_asymmetry`. 🔧 Interprété
ici comme une propriété du modèle CLI### (le rôle d'une variable dépend de l'orientation clinique
visée, pas seulement de la qualité), distincte du rôle fixé par la fiche de qualité pour le
diagnostic `HYP-MOB-01` lui-même (qui reste inchangé). Non traité comme une contradiction à
arbitrer — un niveau d'analyse différent.

### Orientations cliniques possibles
- 📄 **`CLI020`** — Améliorer la mobilité de cheville (déclencheur : score Mobilité diminué ;
  diagnostique : `wblt_distance` ; confirmative : `wblt_relative_distance` ; explicatives :
  `wblt_lsi`, `wblt_asymmetry` ; condition : distance inférieure au seuil).
- 📄 **`CLI021`** — Réduire l'asymétrie de mobilité (diagnostique : `wblt_lsi` ; confirmative :
  `wblt_asymmetry` ; explicative : `wblt_distance` ; condition : LSI inférieur au seuil).

### Liens vers déficits segmentaires
📄 **Aucun lien segmentaire dédié** — cohérent avec la règle de fond de Mobilité elle-même
("jamais à partir de tests de force").

### Variables contributrices (inventaire consolidé)
`wblt` (`distance`, LSI calculé ; `wblt_asymmetry`/`wblt_relative_distance` cités par `CLI020`/
`021` mais non calculés par Kinexus aujourd'hui — voir note de couverture, `HYP_ARCHITECTURE_PHASE_B.md`
fiche 9)

### Variables exclues
📄 `imtp_n`/`nkg`, `knee_ext_n`, `soleus_iso_n`, `gastro_iso_n` (force) · `cmj_peak_power`,
`slcmj_peak_power`, `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi` (puissance/réactivité) ·
`landing_uni_tts`, `landing_uni_peak_landing_force`, `sls_cop_path`, `sls_cop_vel`,
`strobo_surface` (absorption/stabilisation)

### Éléments Vierge_7 exclus car non mesurables
📄 `ankle_joint_stiffness`, `soleus_tonus`, `gastro_tonus`, `achilles_complex_stiffness` ·
`protective_guarding`, `ankle_motor_control`, `calf_bracing_strategy` ·
`pain_related_restriction`, `post_injury_swelling`, `ankle_capsular_irritability` ·
`reduced_tibial_progression`, `early_heel_lift`, `reduced_knee_translation`,
`compensatory_pronation`, `compensatory_hip_flexion`, `reduced_landing_depth`,
`earlier_braking_strategy`, `increased_trunk_lean`, `reduced_anterior_shin_advance`

### 📋 Niveau de maturité de la qualité

| Critère | Évaluation |
|---|---|
| Couverture diagnostique | 🟡 Partielle — `wblt_distance` mesuré directement, LSI calculable génériquement ; `wblt_asymmetry`/`wblt_relative_distance` non calculés |
| Couverture confirmative | 🟡 Identique au diagnostique (variables auto-référentielles) |
| Couverture explicative physiologique | 🔴 **Nulle** — intégralement composée de concepts non mesurables |
| Couverture explicative biomécanique | 🔴 **Nulle**, même constat |
| Couverture `CLI###` | 🟢 2 orientations Niveau 1, cohérentes avec la fiche de qualité |
| Données manquantes | `wblt_asymmetry` (écart absolu D/G), `wblt_relative_distance` (référence normative) — aucun mécanisme de calcul existant |
| Ambiguïtés restantes | Rôle variable de `wblt_lsi`/`wblt_distance` selon l'orientation `CLI020`/`021` (point structurel, pas une contradiction) ; statut de la couche explicative entièrement non mesurable — point à soumettre au praticien (gel implicite, déjà noté en Phase B) |

---

## Tableau de synthèse — 8 qualités construites (Contrôle Sensori-moteur suspendue)

| HYP_ID | Question clinique (résumé) | Maturité globale | Variables diagnostiques | Variables confirmatives | Variables explicatives (physio + biomécanique) | `CLI###` | Points ouverts |
|---|---|---|---|---|---|---|---|
| `HYP-FOR-01` | Capacité de production de force maximale | 🟢 Élevée | 4 | 4 | ~90 (11 familles segmentaires + épaule + cinétique) | 3 (Niveau 1) + 12 (Niveau 2 segmentaire) | Aucun majeur |
| `HYP-PUI-01` | Capacité de puissance de saut | 🟢 Élevée | 2 (+ 3 secondaires) | 3 | ~60 (RFD + biomécanique CMJ/SLCMJ) | 2 | Aucun majeur |
| `HYP-REA-01` | Capacité de restitution rapide de force | 🟡 Moyenne | 2 | 17 | ~55 | 2 | Contradiction `CLI050`/fiche de qualité sur `cmjr_mean_rsi` (documentée, tranchée en faveur de la fiche) |
| `HYP-EXP-01` | Vitesse de montée en force | 🟠 Limitée | 2 mesurées sur 4 visées | 4 | ~50 | 2 | Plafond de données (RFD fenêtré), écart de périmètre `CLI030`/fiche |
| `HYP-ABS-01` | Capacité de freinage/dissipation de charge | 🟢 Élevée | 13 | 13 | ~30 | 2 | Statut des asymétries (gel, non résolu) |
| `HYP-STAB-01` | Maintien du contrôle postural | 🟡 Moyenne | 11 | 11 (mêmes variables) | ~15 | 2 (périmètre plus étroit que la fiche) | Landing absent de la matrice d'orientation ; quasi-duplication CSM (gel, suspendue) |
| `HYP-END-01` | Résistance à la fatigue sur efforts répétés | 🟢 Élevée | 6 | 9 | ~90 | 2 | Aucun majeur |
| `HYP-MOB-01` | Dorsiflexion fonctionnelle de cheville | 🔴 Structurelle | 1 (+ LSI calculé) | 1 (mêmes variables) | 0 | 2 | Couche explicative entièrement non mesurable ; 2 variables Vierge_7 non calculées |

*Maturité globale = synthèse qualitative des 6 lignes de l'encadré "Niveau de maturité" de chaque
fiche, pas une moyenne calculée. `HYP-CSM-01` (Contrôle Sensori-moteur) absente de ce tableau,
suspendue conformément à `HYP_ARCHITECTURE_FREEZE.md`.*

Sans recommandation d'implémentation — ce tableau clôture la construction du moteur clinique
théorique, avant toute Phase D.

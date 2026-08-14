# Phase B — Architecture cible HYP### (9 qualités)

## Statut de ce document

Conception de l'architecture cible du moteur de raisonnement HYP###, à partir de Vierge_7 comme
seule source de vérité clinique, en ignorant délibérément les limitations actuelles de `TFM`/
`VAR_REL3` documentées en Phase A. **Aucun code, aucune pondération numérique, aucune
recommandation d'entraînement, aucune orientation clinique** — uniquement le squelette de
raisonnement (variables → rôle) par qualité.

**Règle stricte appliquée systématiquement** : seules les variables réellement mesurées et
stockées dans Kinexus aujourd'hui apparaissent dans ces fiches. Toute variable citée par Vierge_7
mais non calculable dans Kinexus (douleur, gonflement, irritabilité capsulaire, appréhension,
examen manuel, stratégie de protection perçue, contrôle sensorimoteur générique non instrumenté,
compensations observées visuellement, etc.) est explicitement listée en fin de fiche sous
« Éléments Vierge_7 exclus car non mesurables », jamais intégrée au moteur — conformément à la
consigne du praticien, ce ne sont pas des manques à combler silencieusement, ce sont des éléments
qui resteront du ressort du raisonnement du praticien lui-même.

**Existence vérifiée** : chaque variable listée a été confirmée existante dans le catalogue de
KPIs Kinexus (`index.html`) pendant les audits de Phase A (`AUDIT_VAR_REL3_VS_VIERGE7.md`,
`AUDIT_TFM_VS_VIERGE7.md`). Quand Vierge_7 nomme une variable sous une convention différente de
celle de Kinexus (nommage à codes, ou correspondance probable type `cmj_ecc_dec_rfd`/
`cmj_braking_rfd`), la variable Kinexus réelle est utilisée, avec une note.

**Portée** : les 9 qualités demandées par le praticien (Force, Puissance, Explosivité, Réactivité,
Absorption, Stabilisation, Contrôle Sensori-moteur, Endurance, Mobilité). Contrôle Frontal n'est
pas encore auditée en Phase A et n'apparaît donc pas ici — `ybt`, dont le rattachement dépend de
cette qualité non lue, n'est inclus dans aucune des 9 fiches ci-dessous.

---

## 1. Force

### Question clinique
*Cet athlète est-il capable de produire un niveau de force maximale suffisant pour répondre aux
exigences de son activité physique ou sportive ?*

### Variables diagnostiques
`imtp_n` · `slimtp_n` · `iso_belt_squat_n` · `sl_iso_push_n`
*(4 tests globaux de production de force maximale — aucun n'est segmentaire ni dynamique)*

### Variables confirmatives
`imtp_nkg` · `slimtp_nkg` · `iso_belt_squat_nkg` · `sl_iso_push_nkg`
*(versions normalisées au poids de corps des 4 tests diagnostiques — confirment sans redéfinir)*

### Variables explicatives physiologiques
**Force segmentaire** (localise l'origine d'un déficit global déjà confirmé) :
`knee_ext_n`/`nkg` · `knee_flex_n`/`nkg` · `soleus_iso_n`/`nkg` · `gastro_iso_n`/`nkg` ·
`hip_flex_n`/`nkg` · `hip_ext_n`/`nkg` · `hip_abd_n`/`nkg` · `hip_add_n`/`nkg` ·
`df_iso_n`/`nkg` · `inv_iso_n`/`nkg` · `ev_iso_n`/`nkg`

**Cinétique de production de force** :
`imtp_rfd100`/`rfd200`/`ttpf` · `slimtp_rfd100`/`rfd200`/`ttpf` ·
`iso_belt_squat_rfd100`/`rfd200`/`ttpf` · `sl_iso_push_rfd100`/`rfd200`/`ttpf` ·
`knee_ext_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` · `knee_flex_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` ·
`soleus_iso_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` · `gastro_iso_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` ·
`hip_flex_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` · `hip_ext_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` ·
`hip_abd_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` · `hip_add_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` ·
`df_iso_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` · `inv_iso_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf` ·
`ev_iso_rfd50`/`rfd100`/`rfd150`/`rfd200`/`ttpf`

### Variables explicatives biomécaniques
**Expression fonctionnelle de la force** :
`rs_hip_push_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` · `rs_knee_push_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` ·
`rs_ankle_push_n`/`nkg`/`rfd100`/`rfd200`/`ttpf`

### Variables explicitement exclues
Toutes les variables de CMJ, SLCMJ, DJ, SLDJ, CMJR (puissance) · `wblt_distance`, `wblt_lsi`
(mobilité) · toutes les variables de SLS, EO, EF, Strobo (stabilisation) · toutes les variables de
Landing (uni/bi), SLLT (absorption)

### Conditions minimales de validité
Vierge_7 ne fixe pas de seuil numérique explicite pour Force au-delà du principe transversal :
une variable diagnostique isolée ne valide jamais seule l'hypothèse. Le texte insiste en revanche
sur la **convergence inter-tests** entre les 4 tests diagnostiques comme facteur de confiance
("une convergence entre plusieurs tests globaux de force augmente fortement la confiance... une
divergence importante invite à rechercher une explication") — un principe qualitatif, pas un
seuil chiffré.

### Règles de non-contamination
Puissance, Mobilité, Stabilisation, Absorption ne doivent jamais participer au diagnostic de
Force (règle de fond Vierge_7, explicite). Réactivité n'est pas nommée explicitement dans la liste
d'exclusion de la fiche Force, mais aucune variable de Réactivité (DJ/SLDJ isolées) n'apparaît non
plus dans ses sections diagnostique/confirmative/explicative — absence cohérente avec la même
logique.

### Éléments Vierge_7 exclus car non mesurables
Aucun — la fiche Force (version retenue, voir `AUDIT_TFM_VS_VIERGE7.md` §2.0) est entièrement
construite sur des KPIs force-plate/dynamomètre déjà mesurés.

---

## 2. Puissance

### Question clinique
*Cet athlète est-il capable de produire un niveau élevé de puissance mécanique lors d'une action
explosive (saut vertical) ?*

### Variables diagnostiques
`cmj_peak_power` (diagnostique principal) · `slcmj_peak_power` (diagnostique principal
unilatéral)

**Diagnostiques secondaires/contextuelles** (utilisées quand CMJ/SLCMJ indisponibles — jamais à
poids égal, jamais substituts par défaut) : `dj_peak_prop_power` · `sldj_peak_prop_power` ·
`cmjr_peak_power`

### Variables confirmatives
`cmj_height` · `single_hop_distance` · `triple_hop_distance`

### Variables explicatives physiologiques
`imtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` · `slimtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf` ·
`profil_fv_nkg` · `profil_fv_v0` ·
Force segmentaire complète (mêmes 11 familles que Force, en `n`/`nkg`) :
`knee_ext` · `knee_flex` · `soleus_iso` · `gastro_iso` · `hip_flex` · `hip_ext` · `hip_abd` ·
`hip_add` · `sl_iso_push` · `iso_belt_squat` · `iso_squat_hold`

### Variables explicatives biomécaniques
Stratégie d'expression du CMJ/SLCMJ : `cmj_peak_vel` · `cmj_tto` · `cmj_depth` ·
`cmj_conc_mean_force` · `cmj_conc_mean_vel` · `cmj_conc_rfd` · `cmj_conc_duration` ·
`cmj_conc_displacement` · `cmj_braking_duration` · `cmj_propulsion_eff` · `cmj_braking_eff` ·
`cmj_ft_ct_ratio` · `cmj_ecc_decel` · `cmj_landing_rfd` · `cmj_landing_mean_power` ·
`slcmj_rsi_mod` · `slcmj_peak_conc_force` · `slcmj_peak_conc_vel` · `slcmj_edrfd_bm` ·
`slcmj_braking_rfd` · `slcmj_peak_braking_force` · `slcmj_braking_impulse` · `slcmj_depth` ·
`slcmj_contraction_time` · `slcmj_ecc_duration` · `slcmj_conc_duration` ·
`slcmj_peak_landing_force` · `slcmj_landing_impulse` · `slcmj_time_to_stab`

### Variables explicitement exclues
`wblt_distance` (mobilité) · toutes les variables de Landing (uni/bi), SLLT (absorption pure) ·
toutes les variables de `heel_raise`, `repeated_hop` (endurance/résistance)

### Conditions minimales de validité
Aucun seuil chiffré dans Vierge_7. Principe explicite : les diagnostiques secondaires
(`dj_peak_prop_power`, `sldj_peak_prop_power`, `cmjr_peak_power`) ne remplacent `cmj_peak_power`/
`slcmj_peak_power` qu'en leur absence — jamais un renforcement à poids égal.

### Règles de non-contamination
Mobilité, absorption ne doivent jamais contribuer (exclusion explicite). Aucune mention de Force,
Réactivité, Stabilisation dans la liste d'exclusion de Puissance — cohérent avec le fait que
`imtp`/`slimtp` (Force) sont utilisés ici en explicatif (jamais diagnostique), et qu'aucune
variable de Réactivité pure (`dj_rsi`/`sldj_rsi`) n'apparaît dans les sections retenues.

### Éléments Vierge_7 exclus car non mesurables
Aucun.

---

## 3. Explosivité

### Question clinique
*Cet athlète est-il capable de développer rapidement une force importante dans les tâches où la
montée en force est un enjeu central ?*

### Variables diagnostiques
`cmj_conc_rfd` (meilleure approximation mesurée du RFD concentriques précoce visé par Vierge_7 —
la fenêtre temporelle exacte 100/150/200 ms n'est pas calculée dans Kinexus, voir note ci-dessous)
· `cmj_conc_impulse_100`

### Variables confirmatives
`cmj_peak_power` · `cmj_conc_peak_force` · `cmj_conc_mean_force` · `cmj_conc_impulse`

### Variables explicatives physiologiques
`imtp_rfd100`/`rfd200`/`ttpf` · `slimtp_rfd100`/`rfd200`/`ttpf` ·
`iso_belt_squat_rfd100`/`rfd200`/`ttpf` · `sl_iso_push_rfd100`/`rfd200`/`ttpf` ·
`iso_squat_hold_rfd100`/`rfd200`/`ttpf` ·
Cinétique segmentaire complète (mêmes 11 familles RFD que Force) ·
`profil_fv_nkg` · `profil_fv_v0`

### Variables explicatives biomécaniques
`cmj_depth` · `cmj_conc_duration` · `cmj_rsi_mod` · `cmj_ecc_mean_power` · `cmj_ecc_peak_vel` ·
`cmj_braking_rfd` (correspondance probable de `CMJ_ECC_DECEL_RFD`, nommage à confirmer avec le
praticien — voir annexe vocabulaire de `AUDIT_VAR_REL3_VS_VIERGE7.md`)

### Variables explicitement exclues
Toutes les variables de puissance pure du CMJ/SLCMJ (`cmj_height`, `cmj_peak_vel`,
`cmj_takeoff_vel`, `cmj_conc_mean_power`, `cmj_flight_time`, équivalents SLCMJ) · toutes les
variables DJ, SLDJ, CMJR · `wblt_distance`, `wblt_lsi`, `wblt_asymmetry` (mobilité) · toutes les
variables de SLS, EO, EF, Strobo (stabilisation) · toutes les variables de Landing, SLLT
(absorption)

### Conditions minimales de validité
Aucun seuil chiffré. Note structurelle propre à cette qualité (documentée en Phase A, non résolue
ici) : la preuve diagnostique visée par Vierge_7 (RFD fenêtré 100/150/200 ms) n'est que
partiellement mesurable — `cmj_conc_rfd` (non fenêtré) reste la meilleure approximation
disponible aujourd'hui.

### Règles de non-contamination
Force maximale, mobilité, stabilisation, absorption, réactivité ne doivent jamais participer
(règle de fond explicite). Les variables segmentaires/RFD peuvent expliquer, jamais remplacer le
diagnostic.

### Éléments Vierge_7 exclus car non mesurables
Aucun concept non mesurable dans cette fiche — l'écart porte sur une résolution temporelle
manquante (RFD non fenêtré), pas sur une variable non instrumentée.

---

## 4. Réactivité

### Question clinique
*Cet athlète est-il capable de restituer rapidement la force après un contact au sol ou une
contrainte de freinage ?*

### Variables diagnostiques
`dj_rsi` (diagnostique principal) · `sldj_rsi` (diagnostique principal unilatéral)

### Variables confirmatives
`dj_contact_time` · `dj_peak_prop_force` · `dj_peak_prop_power` · `dj_leg_stiffness` ·
`dj_height` · `dj_landing_impulse` · `dj_peak_landing_force` ·
`sldj_contact_time` · `sldj_tts` · `sldj_peak_prop_force` · `sldj_peak_prop_power` ·
`sldj_leg_stiffness` · `sldj_height` · `sldj_landing_impulse` · `sldj_peak_landing_force` ·
`single_hop_distance` · `triple_hop_distance` · `crossover_hop_distance`

### Variables explicatives physiologiques
`imtp_rfd100`/`rfd200`/`ttpf` · `slimtp_rfd100`/`rfd200`/`ttpf` ·
`iso_belt_squat_rfd100`/`rfd200`/`ttpf` · `sl_iso_push_rfd100`/`rfd200`/`ttpf` ·
`iso_squat_hold_rfd100`/`rfd200`/`ttpf` · Cinétique segmentaire complète (11 familles RFD) ·
`profil_fv_nkg` · `profil_fv_v0`

### Variables explicatives biomécaniques
`dj_contact_time` · `dj_leg_stiffness` · `dj_peak_landing_force` · `dj_landing_impulse` ·
`dj_peak_prop_force` · `dj_peak_prop_power` (double rôle confirmative/explicative, motif
récurrent chez Vierge_7 — voir `AUDIT_VAR_REL3_VS_VIERGE7.md` §1.8/2.8) ·
équivalents `sldj_*` ·
`cmjr_mean_ct` · `cmjr_mean_stiffness` · `cmjr_mean_rebound_height` · `cmjr_mean_rsi` ·
`cmjr_rsi_decay` · `cmjr_stiffness_decay` (CMJR entièrement en explicatif — jamais diagnostique)

### Variables explicitement exclues
`wblt_distance`, `ybt_*`, toutes les variables de SLS, EO, EF, Strobo (mobilité/équilibre/contrôle
sensoriel) · toutes les variables de Landing (uni/bi), SLLT (absorption pure) ·
`heel_raise_reps` · toutes les variables `repeated_hop_*` de fatigue/dégradation
(`mean_height`, `best_height`, `mean_rsi`, `best_rsi`, `mean_peak_force`, `n_hops`, `mean_ct`,
`ct_drift`, `rsi_fatigue`, `height_fatigue`, `stiffness_fatigue`, `height_cv`, `ct_cv`, `rsi_cv` —
endurance/fatigue, voir Endurance ci-dessous)

### Conditions minimales de validité
Aucun seuil chiffré. Note de spécification non tranchée (documentée, pas arbitrée) : Vierge_7 cite
le test `repeated_hop` en confirmative sans préciser de KPI exact, alors que la quasi-totalité de
ses KPIs sont, dans la fiche Endurance, assignés au diagnostic d'une autre qualité — voir
`AUDIT_TFM_VS_VIERGE7.md` §9.0/9.2. Aucune variable `repeated_hop` n'est donc incluse dans cette
fiche Réactivité tant que ce point n'est pas clarifié par le praticien.

### Règles de non-contamination
Mobilité, absorption, endurance ne doivent jamais participer (exclusion explicite et nommée).
Puissance n'est pas nommément exclue mais aucune variable CMJ/SLCMJ (hors DJ/SLDJ/CMJR, qui sont
des tests de contact/rebond, pas de puissance pure) n'apparaît dans les sections retenues —
absence cohérente.

### Éléments Vierge_7 exclus car non mesurables
Aucun.

---

## 5. Absorption

### Question clinique
*Cet athlète sait-il freiner et dissiper correctement la charge sans perte excessive de contrôle,
de temps ou de symétrie ?*

### Variables diagnostiques
`landing_uni_tts` (diagnostique principal) · `landing_bi_tts` (diagnostique principal de base) ·
`sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`, `sllt_cop_path`
(diagnostique principal unilatéral) ·
`cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd`, `cmj_braking_impulse`
(diagnostique principal **indirect** — phase excentrique du CMJ ; `cmj_braking_rfd`/
`cmj_braking_impulse` sont la correspondance probable de `cmj_ecc_dec_rfd`/`cmj_ecc_dec_impulse`,
nommage à confirmer)

*Note de couverture (documentée, non résolue)* : `landing_uni_peak_landing_force`,
`landing_uni_loading_rate`, `landing_uni_impulse`, `landing_uni_cop_path`,
`landing_bi_loading_rate`, `landing_bi_impulse` sont demandées par Vierge_7 mais **n'existent pas**
dans le catalogue Kinexus — seul `landing_bi_peak_landing_force` existe et est ajouté ci-dessous.

### Variables confirmatives
`landing_bi_peak_landing_force` (existe, non wiré jusqu'ici — voir note ci-dessus) ·
`cmj_depth` · `cmj_conc_duration` · `cmj_rsi_mod` · `cmj_conc_peak_force` · `cmj_conc_mean_force` ·
`cmj_landing_impulse` ·
`dj_contact_time` · `dj_landing_impulse` · `dj_peak_landing_force` ·
`sldj_contact_time` · `sldj_landing_impulse` · `sldj_peak_landing_force`

### Variables explicatives physiologiques
`imtp_rfd100`/`rfd200` · `slimtp_rfd100`/`rfd200` · `iso_belt_squat_rfd100`/`rfd200` ·
`sl_iso_push_rfd100`/`rfd200` · `knee_ext_rfd100`/`rfd150`/`rfd200` ·
`soleus_iso_rfd100`/`rfd200` · `gastro_iso_rfd100`/`rfd200` ·
`hip_abd_rfd100` · `hip_add_rfd100` · `hip_ext_rfd100` · `hip_flex_rfd100` ·
`wblt_distance` (mobilité disponible — explicatif uniquement)

### Variables explicatives biomécaniques
`cmj_braking_duration` (double rôle confirmative/explicative) ·
`dj_contact_time`/`leg_stiffness`/`peak_landing_force`/`landing_impulse`/`peak_prop_force`/
`peak_prop_power` (double rôle) · équivalents `sldj_*`

### Variables explicitement exclues
`dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`, `cmjr_mean_rebound_height`, `single_hop_distance`,
`triple_hop_distance`, `crossover_hop_distance`, `repeated_hop_mean_rsi` (réactivité pure) ·
`heel_raise_reps`, `repeated_hop_ct_drift`, `repeated_hop_rsi_fatigue`,
`repeated_hop_height_fatigue` (endurance/répétition)

### Conditions minimales de validité
Aucun seuil chiffré. 🔶 **Point à arbitrer, non tranché** : les asymétries de freinage
(`ecc_decel_rfd_asym`, `ecc_decel_impulse_asym`, `landing_peak_force_asym`,
`landing_impulse_asym`, `sllt_loading_rate_asym`, `sllt_tts_asym`) n'existent sous aucun nom dans
Kinexus — Vierge_7 les cite en confirmative, mais Kinexus possède un moteur d'asymétrie séparé
(`computeAsymEngine`) dont le rôle par rapport à cette fiche reste à clarifier avec le praticien
avant Phase C. Non intégrées ici en l'absence de clarification.

### Règles de non-contamination
Réactivité pure, force maximale sans contexte de freinage (`q_iso_pvf`, `soleus_iso_pvf`,
`gastro_iso_pvf`, `imtp_pvf` — **aucune n'existe dans Kinexus**, donc sans objet), endurance ne
doivent jamais participer.

### Éléments Vierge_7 exclus car non mesurables
`postural_control`, `sensorimotor_control`, `single_leg_balance`, `reaction_to_perturbation`
("Qualité du contrôle moteur", explicative physiologique) — concepts cliniques non instrumentés
dans Kinexus, retirés sans substitut.

---

## 6. Stabilisation

### Question clinique
*Cet athlète est-il capable de stabiliser efficacement son corps après une contrainte, un appui
ou une perturbation ?*

### Variables diagnostiques
`sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`,
`sls_cop_range_ap`, `sls_mean_velocity` (diagnostique principal) ·
`eo_surface`, `ef_surface` (diagnostique principal sensoriel) ·
`strobo_surface` (diagnostique principal sous contrainte — `strobo_cop_path`/`cop_vel` demandés
par Vierge_7 n'existent pas dans Kinexus) ·
`landing_uni_tts`, `landing_bi_tts` (diagnostique principal contextuel — la plupart des autres
KPIs Landing demandés par Vierge_7 pour cette famille, `cop_path`/`cop_vel`/`post_stability`,
n'existent pas dans Kinexus)

*Contradiction interne à cette fiche même chez Vierge_7 (documentée, non arbitrée)* :
`landing_bi_peak_landing_force` **existe** dans Kinexus (contrairement à son équivalent
`landing_uni_peak_landing_force`, absent). Vierge_7 le cite implicitement dans "Landing stability"
(diagnostique contextuel) tout en excluant explicitement, dans la même fiche, "les variables
d'absorption pure" `landing_uni_peak_landing_force`/`landing_bi_peak_landing_force` — déjà
documenté en Phase A (`AUDIT_TFM_VS_VIERGE7.md` §7.10 pt.1). Non inclus dans la liste diagnostique
ci-dessus tant que le praticien n'a pas tranché laquelle des deux sections fait foi.

### Variables confirmatives
`sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`,
`sls_cop_range_ap`, `sls_mean_velocity` (mêmes variables que diagnostique, Vierge_7 les
réutilise telles quelles) · `strobo_surface` (double rôle) ·
`landing_uni_tts`, `landing_bi_tts` (mêmes variables, double rôle)

### Variables explicatives physiologiques
`hip_abd_rfd100`/`rfd200` · `hip_ext_rfd100`/`rfd200` · `hip_add_rfd100` · `inv_iso_rfd100` ·
`ev_iso_rfd100` · `df_iso_rfd100` · `wblt_distance` (mobilité disponible)

### Variables explicatives biomécaniques
`sls_cop_path`, `sls_cop_vel`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_ellipse_area`,
`sls_mean_velocity` (double rôle diagnostique/explicatif) ·
`strobo_surface` (triple rôle) · `landing_uni_tts`, `landing_bi_tts` (triple rôle)

### Variables explicitement exclues
🚫 **`sllt_peak_landing_force`, `sllt_loading_rate`** (variables d'absorption pure — exclusion
directement violée dans `TFM` et `VAR_REL3` actuels, voir Phase A ; **toute la famille SLLT
n'apparaît nulle part ailleurs dans cette fiche et n'a donc aucune place ici**) ·
`cmj_peak_power`, `slcmj_peak_power`, `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`,
`single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance`,
`repeated_hop_mean_rsi` (puissance/réactivité) ·
`imtp_n`/`nkg`, `knee_ext_n`, `soleus_iso_n`, `gastro_iso_n` (force maximale sans contrainte
posturale)

### Conditions minimales de validité
Aucun seuil chiffré.

### Règles de non-contamination
Puissance, réactivité, absorption (**y compris et surtout SLLT**, contamination déjà confirmée
active dans les deux mécanismes actuels), force maximale ne doivent jamais participer.

### Éléments Vierge_7 exclus car non mesurables
`sensorimotor_control`, `postural_control`, `balance_strategy`, `perturbation_response`
("Contrôle sensorimoteur", explicative physiologique) — retirés sans substitut.

### 🔶 Point à arbitrer avant Phase C, hérité de Phase A, non tranché ici
Vierge_7 spécifie, mot pour mot, la même base de preuves diagnostiques et confirmatives pour
Stabilisation et Contrôle Sensori-moteur (§9 de `AUDIT_TFM_VS_VIERGE7.md`). Les deux fiches
ci-dessus (5 et 6) sont donc, en l'état de Vierge_7, quasi identiques sur ces deux sections — non
fusionnées ni différenciées artificiellement ici, écart de spécification transmis tel quel au
praticien.

---

## 7. Contrôle Sensori-moteur

*(Vierge_7 nomme cette fiche "Contrôle Sensori-moteur" ; Kinexus la nomme "Contrôle Sensoriel"
dans son référentiel actuel — même quantité, deux noms.)*

### Question clinique
*Cet athlète est-il capable d'intégrer correctement les informations sensorielles pour stabiliser
et ajuster son contrôle moteur ?*

### Variables diagnostiques
`sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`,
`sls_cop_range_ap`, `sls_mean_velocity` (diagnostique principal) ·
`eo_surface`, `ef_surface` (diagnostique principal sensoriel) ·
`strobo_surface` (diagnostique principal sous contrainte) ·
`landing_uni_tts`, `landing_bi_tts` (diagnostique principal contextuel)

*(Base diagnostique identique, KPI pour KPI, à celle de Stabilisation — voir point à arbitrer en
fin de fiche 6 et de la présente fiche.)*

### Variables confirmatives
Mêmes variables SLS (Vierge_7 les réutilise telles quelles) · `strobo_surface` (double rôle) ·
`landing_uni_tts`, `landing_bi_tts` (double rôle)

### Variables explicatives physiologiques
`hip_abd_rfd100`/`rfd200` · `hip_ext_rfd100`/`rfd200` · `hip_add_rfd100` · `inv_iso_rfd100` ·
`ev_iso_rfd100` · `df_iso_rfd100` · `wblt_distance`

### Variables explicatives biomécaniques
`sls_cop_path`, `sls_cop_vel`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_ellipse_area`,
`sls_mean_velocity` (double rôle) · `strobo_surface`, `landing_uni_tts`, `landing_bi_tts`
(triple rôle, section fusionnée "Stabilité sous contrainte" chez Vierge_7)

### Variables explicitement exclues
`imtp_n`/`nkg`, `slimtp_n`/`nkg`, `iso_belt_squat_n`/`nkg`, `sl_iso_push_n`/`nkg` (force
maximale — périmètre plus large que Stabilisation, qui n'exclut que 4 variables ciblées) ·
toutes les variables de CMJ, SLCMJ, DJ, SLDJ, CMJR (puissance/explosivité/réactivité) ·
🚫 **toutes les variables de Landing et SLLT** — *contradiction interne à cette fiche même,
documentée non arbitrée* : la section diagnostique cite `landing_uni_tts`/`landing_bi_tts` comme
preuve principale contextuelle, tandis que la section d'exclusion exclut "toutes les variables de
Landing" sans distinction. Les deux variables Landing sont conservées en diagnostique ci-dessus
car la section diagnostique est plus spécifique et mieux justifiée ("mesure la capacité à
retrouver un contrôle efficace") — à trancher explicitement par le praticien avant Phase C, pas
une décision prise ici · `heel_raise_reps`, `repeated_hop_mean_height`, `repeated_hop_mean_rsi`,
`repeated_hop_ct_drift`, `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue` (endurance)

### Conditions minimales de validité
Aucun seuil chiffré.

### Règles de non-contamination
Force maximale (périmètre large), puissance, explosivité, réactivité, endurance ne doivent jamais
participer. Le statut de Landing/SLLT reste ouvert (voir contradiction ci-dessus).

### Éléments Vierge_7 exclus car non mesurables
`sensorimotor_control`, `postural_control`, `balance_strategy`, `perturbation_response` — mêmes
concepts que Stabilisation, retirés sans substitut.

---

## 8. Endurance

### Question clinique
*Cet athlète est-il capable de répéter l'effort sans chute précoce et excessive de performance ?*
*(résistance à la fatigue spécifique — explicitement pas l'endurance cardio-respiratoire
générale)*

### Variables diagnostiques
`heel_raise_reps` (diagnostique principal local) ·
`repeated_hop_n_hops` (diagnostique principal de volume) ·
`repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`,
`repeated_hop_stiffness_fatigue` (diagnostique principal)

### Variables confirmatives
`repeated_hop_mean_height`, `repeated_hop_mean_rsi`, `repeated_hop_mean_peak_force`,
`repeated_hop_mean_ct` (niveau moyen) ·
`repeated_hop_best_height`, `repeated_hop_best_rsi` (meilleure répétition) ·
`repeated_hop_height_cv`, `repeated_hop_ct_cv`, `repeated_hop_rsi_cv` (variabilité)

### Variables explicatives physiologiques
`imtp_n`/`nkg` · `slimtp_n`/`nkg` · `iso_belt_squat_n`/`nkg` · `sl_iso_push_n`/`nkg` ·
Force segmentaire complète (`n`/`nkg`) : `knee_ext` · `knee_flex` · `soleus_iso` · `gastro_iso` ·
`hip_flex` · `hip_ext` · `hip_abd` · `hip_add` · `df_iso` · `inv_iso` · `ev_iso` ·
Cinétique complète (mêmes 15 familles RFD que Force/Explosivité)

### Variables explicatives biomécaniques
`repeated_hop_mean_ct`, `repeated_hop_ct_drift`, `repeated_hop_height_cv`, `repeated_hop_ct_cv`,
`repeated_hop_rsi_cv` (stratégie de répétition — double rôle confirmative/explicative) ·
`repeated_hop_mean_height`, `repeated_hop_best_height`, `repeated_hop_mean_rsi`,
`repeated_hop_best_rsi`, `repeated_hop_mean_peak_force` (expression fonctionnelle — double rôle)

### Variables explicitement exclues
Toutes les variables de CMJ, SLCMJ, DJ, SLDJ, CMJR (puissance) · `wblt_distance`, `wblt_lsi`,
`wblt_asymmetry` (mobilité) · toutes les variables de SLS, EO, EF, Strobo (stabilisation) ·
toutes les variables de Landing, SLLT (absorption)

### Conditions minimales de validité
Aucun seuil chiffré. Note opérationnelle (documentée en Phase A, pas une condition Vierge_7) :
`repeated_hop` ne dispose d'aucun seuil de secours statique dans Kinexus — sa validité dépend
entièrement d'une couverture normative par population, non auditée ici.

### Règles de non-contamination
Puissance, force maximale (au sens dynamique — CMJ/SLCMJ/DJ/SLDJ), mobilité, stabilisation,
réactivité, absorption ne doivent jamais participer (règle de fond explicite).

### Éléments Vierge_7 exclus car non mesurables
Aucun — fiche entièrement construite sur des KPIs mesurés.

---

## 9. Mobilité

### Question clinique
*L'athlète dispose-t-il d'une mobilité de cheville suffisante en charge pour permettre des
appuis, freinages, réceptions et transferts de charge efficaces ?*
*(dorsiflexion fonctionnelle de cheville uniquement — pas la souplesse globale ni la mobilité de
toute la chaîne membre inférieur)*

### Variables diagnostiques
`wblt_distance` (diagnostique principal) ·
LSI calculé (`autoLSI`/`data.lsiAuto`, mécanisme générique déjà existant pour tout test
unilatéral — correspond à `wblt_lsi`, diagnostique principal unilatéral, réellement calculable
aujourd'hui bien que non exposé sous ce nom dans le catalogue de KPIs)

*Note de couverture (documentée, non résolue)* : `wblt_asymmetry` (écart absolu D/G) et
`wblt_relative_distance` (rapporté à une référence normative) sont demandées par Vierge_7 comme
diagnostiques complémentaire/contextuel mais **ne sont calculées par aucun mécanisme existant**
dans Kinexus.

### Variables confirmatives
`wblt_distance`, LSI calculé (Vierge_7 : "la mobilité de cheville repose exclusivement sur ce
test, donc les variables confirmatives sont essentiellement des nuances de la même preuve")

### Variables explicatives physiologiques
**Aucune** — la totalité des variables explicatives physiologiques citées par Vierge_7 pour cette
qualité (`ankle_joint_stiffness`, `soleus_tonus`, `gastro_tonus`, `achilles_complex_stiffness`,
`protective_guarding`, `ankle_motor_control`, `calf_bracing_strategy`, `pain_related_restriction`,
`post_injury_swelling`, `ankle_capsular_irritability`) sont des concepts d'évaluation clinique
manuelle, non instrumentés — voir « Éléments exclus » ci-dessous.

### Variables explicatives biomécaniques
**Aucune** — même constat : `reduced_tibial_progression`, `early_heel_lift`,
`reduced_knee_translation`, `compensatory_pronation`, `compensatory_hip_flexion`,
`reduced_landing_depth`, `earlier_braking_strategy`, `increased_trunk_lean`,
`reduced_anterior_shin_advance` sont des observations de compensation, non mesurées.

### Variables explicitement exclues
`imtp_n`/`nkg`, `knee_ext_n`, `soleus_iso_n`, `gastro_iso_n` (force) · `cmj_peak_power`,
`slcmj_peak_power`, `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi` (puissance/réactivité) ·
`landing_uni_tts`, `landing_uni_peak_landing_force`, `sls_cop_path`, `sls_cop_vel`,
`strobo_surface` (absorption/stabilisation)

### Conditions minimales de validité
Aucun seuil chiffré. Règle de fond explicite : *"le score de mobilité ne doit jamais être
construit à partir de tests de force, de puissance, de réactivité, d'absorption ou de
stabilisation"* — la plus stricte et la plus univoque de toutes les qualités auditées.

### Règles de non-contamination
Force, puissance, réactivité, absorption, stabilisation ne doivent **jamais**, sans aucune
exception, participer au diagnostic de Mobilité.

### Éléments Vierge_7 exclus car non mesurables
`ankle_joint_stiffness`, `soleus_tonus`, `gastro_tonus`, `achilles_complex_stiffness`
(raideur musculo-tendineuse) · `protective_guarding`, `ankle_motor_control`,
`calf_bracing_strategy` (contrôle moteur/protection) · `pain_related_restriction`,
`post_injury_swelling`, `ankle_capsular_irritability` (contexte tissulaire) ·
`reduced_tibial_progression`, `early_heel_lift`, `reduced_knee_translation`,
`compensatory_pronation`, `compensatory_hip_flexion`, `reduced_landing_depth`,
`earlier_braking_strategy`, `increased_trunk_lean`, `reduced_anterior_shin_advance`
(conséquences biomécaniques observées). **Conséquence directe et non contournable de la règle
"variables mesurées uniquement"** : Mobilité est la seule des 9 qualités dont l'architecture
HYP### repose exclusivement sur des preuves diagnostiques/confirmatives (WBLT), sans aucune
couche explicative — ni physiologique, ni biomécanique. 🔶 Point à soumettre au praticien : accepter
cette qualité comme structurellement "diagnostic seul", ou envisager un futur champ de saisie
manuelle pour la couche explicative, hors périmètre de cette architecture.

---

*(La matrice VARIABLE → QUALITÉ → RÔLE suit dans un document séparé,
`HYP_VARIABLE_MATRIX.md`.)*

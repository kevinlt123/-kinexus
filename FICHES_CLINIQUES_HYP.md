# Fiches cliniques — Moteur de raisonnement HYP###

Documentation praticien. Pour chacune des 8 qualités physiques actives, ce document décrit
uniquement le raisonnement clinique : la question posée, les preuves qui y répondent, et comment
elles s'articulent pour aboutir à une orientation. Aucune référence au code, à l'implémentation ou
aux décisions d'architecture — uniquement la logique clinique telle qu'elle a été validée.

**Convention commune aux 8 qualités** :
- Une **variable diagnostique** peut, seule, générer un signal — mais il faut la convergence de
  plusieurs preuves diagnostiques indépendantes pour que l'hypothèse soit véritablement retenue.
- Une **variable confirmative** ne génère jamais l'hypothèse — elle renforce la confiance dans un
  diagnostic déjà posé.
- Une **variable explicative** ne génère ni ne confirme — elle répond à la question "pourquoi ?"
  une fois le déficit déjà établi.
- Le niveau de confiance d'une hypothèse retenue se décline en trois paliers : **Faible** (preuves
  diagnostiques seules), **Modérée** (+ confirmatives), **Forte** (+ explicatives cohérentes).

---

# 1. MOBILITÉ

## 1. Question clinique
*L'athlète dispose-t-il d'une mobilité de cheville suffisante en charge pour permettre des appuis,
freinages, réceptions et transferts de charge efficaces ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `wblt_distance` | Weight Bearing Lunge Test (WBLT) | Seule et unique preuve diagnostique — suffit à elle seule à retenir l'hypothèse |

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| LSI calculé (WBLT) | WBLT | Nuance de la même mesure que la preuve diagnostique — pas une preuve indépendante |

## 4. Variables explicatives
**Aucune.** Aucune variable mesurée par Kinexus n'explique aujourd'hui le "pourquoi" d'un déficit
de mobilité de cheville (les causes cliniques possibles — raideur, douleur, stratégie de
compensation — ne sont pas mesurables par l'outil).

## 5. Variables exclues
Force maximale (`imtp`, `knee_ext`, `soleus_iso`, `gastro_iso`) · Puissance/Réactivité
(`cmj_peak_power`, `slcmj_peak_power`, `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`) · Absorption/
Stabilisation (`landing_uni_tts`, `landing_uni_peak_landing_force`, `sls_cop_path`, `sls_cop_vel`,
`strobo_surface`).

## 6. Logique de raisonnement
`wblt_distance` est la seule porte d'entrée : dès qu'elle est déficitaire, l'hypothèse est
directement retenue — il n'existe pas de deuxième preuve indépendante à attendre. Le niveau de
confiance ne peut cependant jamais dépasser un palier modéré, faute de toute variable explicative
capable de le confirmer davantage.

## 7. Arbre de décision
```
Si wblt_distance déficitaire
  → hypothèse directement retenue, niveau Faible.
(Pas de palier "signal isolé" pour cette qualité — un seul test existe.)
(Pas de palier "Forte" atteignable — aucune preuve explicative disponible.)
```

---

# 2. FORCE

## 1. Question clinique
*Cet athlète est-il capable de produire un niveau de force maximale suffisant pour répondre aux
exigences de son activité physique ou sportive ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `imtp_n` | Isometric Mid-Thigh Pull (IMTP) | Preuve diagnostique — génère l'hypothèse si déficitaire |
| `slimtp_n` | Single Leg IMTP | Preuve diagnostique unilatérale |
| `iso_belt_squat_n` | Iso Belt Squat | Preuve diagnostique |
| `sl_iso_push_n` | Single Leg Iso Push | Preuve diagnostique |

*Au moins 2 de ces 4 variables déficitaires simultanément sont nécessaires pour retenir l'hypothèse.*

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `imtp_nkg` | IMTP | Force relative — renforce sans générer |
| `slimtp_nkg` | SLIMTP | Force relative unilatérale |
| `iso_belt_squat_nkg` | Iso Belt Squat | Force relative |
| `sl_iso_push_nkg` | SL Iso Push | Force relative |

## 4. Variables explicatives

**Force (segmentaire — 12 groupes musculaires)** : `knee_ext`, `knee_flex`, `soleus_iso`,
`gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`
(force absolue et relative) · `sh_iso_9020`/`9090`/`3030`/`6060` (épaule, 4 angles de test).

**Biomécanique** : cinétique de production de force (vitesse de développement de la force) des 15
tests ci-dessus et des 4 tests diagnostiques · `rs_hip_push`, `rs_knee_push`, `rs_ankle_push`
(force et cinétique).

**Contrôle moteur** : aucune. **Asymétrie** : aucune (traitée par un module séparé, non intégré
ici). **Mobilité** : aucune. **Autre** : aucune.

## 5. Variables exclues
Toutes les variables de CMJ/SLCMJ/DJ/SLDJ/CMJR (puissance/réactivité) · `wblt_distance`/LSI
(mobilité) · toutes les variables SLS/EO/EF/Strobo (stabilisation) · toutes les variables Landing
(uni/bi)/SLLT (absorption).

## 6. Logique de raisonnement
Un déficit isolé sur une seule des 4 variables diagnostiques reste un signal à surveiller — la
force maximale n'est pas encore une hypothèse retenue. Dès que 2 des 4 tests sont déficitaires,
l'hypothèse est retenue à un niveau Faible. Un déficit également marqué en force relative
(confirmative) fait passer au niveau Modéré. Un déficit segmentaire cohérent (par exemple les
quadriceps ou les fléchisseurs plantaires) fait passer au niveau Fort, et ouvre un lien direct vers
un travail localisé sur le groupe musculaire en cause — Force est la seule qualité dotée de cette
décomposition segmentaire complète.

## 7. Arbre de décision
```
Si 1 test global déficitaire (sur 4)
  → signal isolé, hypothèse non retenue.

Si 2 tests globaux déficitaires (sur 4)
  → hypothèse Faible ("Améliorer la force maximale globale").

Si 2 tests globaux + force relative déficitaire
  → hypothèse Modérée.

Si 2 tests globaux + force relative + déficit segmentaire cohérent
  → hypothèse Forte, avec orientation vers le groupe musculaire concerné.
```

---

# 3. PUISSANCE

## 1. Question clinique
*Cet athlète est-il capable de produire un niveau élevé de puissance mécanique lors d'une action
explosive (saut vertical) ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `cmj_peak_power` | Counter Movement Jump (CMJ) | Preuve diagnostique principale |
| `slcmj_peak_power` | Single Leg CMJ | Preuve diagnostique principale unilatérale |
| `dj_peak_prop_power` | Drop Jump | Preuve de secours — utilisée uniquement si CMJ/SLCMJ indisponibles |
| `sldj_peak_prop_power` | Single Leg Drop Jump | Preuve de secours unilatérale |
| `cmjr_peak_power` | CMJ Rebound | Preuve de secours |

*Les deux preuves principales (CMJ + SLCMJ) doivent être déficitaires ensemble — l'une des deux
seule ne suffit pas. Les preuves de secours ne renforcent jamais un diagnostic déjà posé, elles ne
font que suppléer une absence de données.*

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `cmj_height` | CMJ | Hauteur de saut — renforce sans générer |
| `single_hop_distance` | Single Hop | Confirme via une tâche horizontale |
| `triple_hop_distance` | Triple Hop | Confirme via une tâche répétée |

## 4. Variables explicatives

**Force** : `imtp`, `slimtp` (force et cinétique) · `profil_fv_nkg`, `profil_fv_v0` (profil
force-vitesse) · force segmentaire complète (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`,
`hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `sl_iso_push`, `iso_belt_squat`, `iso_squat_hold`).

**Biomécanique** : stratégie complète du CMJ/SLCMJ — vitesse de décollage, profondeur de
contre-mouvement, force concentrique moyenne, vitesse de développement de force, durée de
freinage, et l'ensemble des variables de stratégie de saut associées.

**Contrôle moteur** : aucune. **Asymétrie** : aucune. **Mobilité** : aucune. **Autre** : aucune.

## 5. Variables exclues
`wblt_distance` (mobilité) · toutes les variables Landing (uni/bi)/SLLT (absorption pure) · toutes
les variables `heel_raise`/`repeated_hop` (endurance).

## 6. Logique de raisonnement
Contrairement à Force, Puissance exige la convergence stricte des deux preuves principales : un
saut bilatéral déficitaire avec un profil unilatéral normal (ou l'inverse) reste un signal isolé,
pas une hypothèse retenue. Si les deux convergent, l'hypothèse est Faible. L'ajout d'une hauteur de
saut ou d'une performance en hop test déficitaire la fait passer à Modérée. Un déficit de force ou
un profil force-vitesse cohérent (par exemple un déficit vers l'extrémité "force" du profil) la
fait passer à Forte — l'orientation cite alors la Force et l'Explosivité comme causes possibles à
investiguer.

## 7. Arbre de décision
```
Si CMJ_PP seul déficitaire (SLCMJ_PP normal)
  → signal isolé, hypothèse non retenue.

Si CMJ_PP + SLCMJ_PP déficitaires
  → hypothèse Faible.

Si + hauteur de saut / hop tests déficitaires
  → hypothèse Modérée.

Si + déficit de force ou profil force-vitesse cohérent
  → hypothèse Forte.
```

---

# 4. RÉACTIVITÉ

## 1. Question clinique
*Cet athlète est-il capable de restituer rapidement la force après un contact au sol ou une
contrainte de freinage ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `dj_rsi` | Drop Jump | Preuve diagnostique principale (indice de réactivité) |
| `sldj_rsi` | Single Leg Drop Jump | Preuve diagnostique principale unilatérale |

*Les deux doivent être déficitaires ensemble.*

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `dj_contact_time`, `dj_peak_prop_force`, `dj_peak_prop_power`, `dj_leg_stiffness`, `dj_height`, `dj_landing_impulse`, `dj_peak_landing_force` | Drop Jump | Renforcent le diagnostic |
| Équivalents `sldj_*` | Single Leg Drop Jump | Renforcent le diagnostic unilatéral |
| `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance` | Hop tests | Renforcent via des tâches fonctionnelles |

## 4. Variables explicatives

**Force** : `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push`, `iso_squat_hold` (cinétique) ·
cinétique segmentaire complète (11 familles) · `profil_fv_nkg`, `profil_fv_v0`.

**Biomécanique** : temps de contact, raideur de jambe, force de pic à l'atterrissage, impulsion
d'atterrissage, force/puissance propulsive de pic (DJ et SLDJ) · temps de contact moyen, raideur
moyenne, hauteur de rebond moyenne, indice de réactivité moyen et sa dégradation dans le temps
(CMJ Rebound — **jamais diagnostique**, uniquement explicatif).

**Contrôle moteur** : aucune. **Asymétrie** : aucune. **Mobilité** : aucune. **Autre** : aucune.

## 5. Variables exclues
`wblt_distance`, variables Y-Balance, toutes les variables SLS/EO/EF/Strobo (mobilité/équilibre/
contrôle sensoriel) · toutes les variables Landing (uni/bi)/SLLT (absorption pure) ·
`heel_raise_reps` et toutes les variables `repeated_hop_*` de fatigue/dégradation (endurance).

**Point d'attention clinique** : l'indice de réactivité du CMJ Rebound (`cmjr_mean_rsi`) mesure un
phénomène proche, mais n'est **jamais** traité comme un diagnostic de réactivité — il ne sert qu'à
confirmer ou expliquer un déficit déjà établi par le Drop Jump.

## 6. Logique de raisonnement
Même structure que Puissance : convergence stricte exigée entre DJ et SLDJ. Un déficit bilatéral
isolé (SLDJ normal) reste un signal. La convergence donne un niveau Faible. Un temps de contact
allongé ou une hauteur de rebond réduite (confirmatives) élève à Modéré. Un déficit de cinétique de
force ou de raideur segmentaire cohérent élève à Fort.

## 7. Arbre de décision
```
Si DJ_RSI seul déficitaire (SLDJ_RSI normal)
  → signal isolé, hypothèse non retenue.

Si DJ_RSI + SLDJ_RSI déficitaires
  → hypothèse Faible.

Si + temps de contact allongé / hauteur de rebond réduite
  → hypothèse Modérée.

Si + déficit de cinétique de force / raideur cohérent
  → hypothèse Forte.
```

---

# 5. EXPLOSIVITÉ

## 1. Question clinique
*Cet athlète est-il capable de développer rapidement une force importante dans les tâches où la
montée en force est un enjeu central ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `cmj_conc_rfd` | CMJ | Vitesse de développement de force en phase concentrique — preuve diagnostique |
| `cmj_conc_impulse_100` | CMJ | Impulsion à 100 ms — preuve diagnostique |

*Les deux doivent être déficitaires ensemble. Ce sont, à ce jour, les 2 seules variables
réellement mesurées pour cette qualité — moins riche que les autres.*

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `cmj_peak_power` | CMJ | Renforce sans générer |
| `cmj_conc_peak_force`, `cmj_conc_mean_force` | CMJ | Renforcent |
| `cmj_conc_impulse` | CMJ | Renforce |

## 4. Variables explicatives

**Force** : `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push`, `iso_squat_hold` (cinétique) ·
cinétique segmentaire complète (11 familles) · `profil_fv_nkg`, `profil_fv_v0`.

**Biomécanique** : profondeur de contre-mouvement, durée de la phase concentrique, indice de
raideur modifié, puissance et vitesse excentriques de pic, vitesse de développement de force en
phase de freinage.

**Contrôle moteur** : aucune. **Asymétrie** : aucune. **Mobilité** : aucune. **Autre** : aucune.

## 5. Variables exclues
Variables de puissance pure du CMJ/SLCMJ (hauteur de saut, vitesse de décollage, puissance
concentrique moyenne) · toutes les variables DJ/SLDJ/CMJ Rebound · `wblt`/Y-Balance (mobilité) ·
toutes les variables SLS/EO/EF/Strobo (stabilisation) · toutes les variables Landing/SLLT
(absorption).

**Point d'attention clinique** : cette qualité repose sur une mesure moins riche que les 7 autres —
la vitesse de développement de force n'est pas décomposée par fenêtre temporelle (0-100/150/200 ms
comme souhaité), seule une moyenne globale est disponible. Un profil "explosif tôt, mais lent
ensuite" (ou l'inverse) peut donc être lissé par la mesure actuelle et ne pas apparaître clairement.

## 6. Logique de raisonnement
Comme les 2 seules variables diagnostiques doivent converger, atteindre le niveau Faible exige déjà
la totalité de la preuve diagnostique disponible — il n'existe pas de marge supplémentaire (à la
différence de Force, où 2 preuves suffisent sur 4 possibles). Les confirmatives (puissance, force de
pic) élèvent à Modéré. Un déficit de force ou de cinétique cohérent élève à Fort.

## 7. Arbre de décision
```
Si cmj_conc_rfd OU cmj_conc_impulse_100 seul déficitaire
  → signal isolé, hypothèse non retenue.

Si les deux sont déficitaires
  → hypothèse Faible (déjà le maximum de preuve diagnostique disponible).

Si + puissance / force de pic déficitaires
  → hypothèse Modérée.

Si + déficit de force / cinétique cohérent
  → hypothèse Forte.
```

---

# 6. ABSORPTION

## 1. Question clinique
*Cet athlète sait-il freiner et dissiper correctement la charge sans perte excessive de contrôle,
de temps ou de symétrie ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `landing_uni_tts`, `landing_bi_tts` | Landing (uni/bi) | Temps de retour à la stabilité — preuve diagnostique |
| `sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`, `sllt_cop_path` | Single Leg Land and Hold (SLLT) | Preuves diagnostiques (magnitude de force et récupération) |
| `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` | CMJ (phase excentrique) | Preuves diagnostiques |
| `cmj_braking_rfd`, `cmj_braking_impulse` | CMJ (phase de freinage) | Preuves diagnostiques |

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `landing_bi_peak_landing_force` | Landing bilatéral | Confirme sans générer |
| `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_landing_impulse` | CMJ | Confirment |
| `dj_contact_time`, `dj_landing_impulse`, `dj_peak_landing_force`, équivalents `sldj_*` | Drop Jump | Confirment |

## 4. Variables explicatives

**Force** : `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push` (cinétique) · `knee_ext`,
`soleus_iso`, `gastro_iso`, `hip_abd`, `hip_add`, `hip_ext`, `hip_flex` (cinétique).

**Biomécanique** : durée de freinage du CMJ · temps de contact/raideur/force de pic/impulsion
d'atterrissage/force et puissance propulsives (Drop Jump et Single Leg Drop Jump).

**Contrôle moteur** : aucune.

**Asymétrie** : une information d'asymétrie de freinage peut compléter le tableau clinique, à
titre indicatif.

**Mobilité** : `wblt_distance` (une mobilité de cheville limitée peut altérer la stratégie
d'absorption).

**Autre** : aucune.

## 5. Variables exclues
`dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`, `cmjr_mean_rebound_height`, `single_hop`/`triple_hop`/
`crossover_hop_distance`, `repeated_hop_mean_rsi` (réactivité pure) · `heel_raise_reps`,
`repeated_hop_ct_drift`/`rsi_fatigue`/`height_fatigue` (endurance).

## 6. Logique de raisonnement
Cette qualité répond à deux dimensions réunies dans une seule question : la magnitude de la force
encaissée (Peak Landing Force, Loading Rate) et le temps nécessaire pour retrouver l'équilibre
(Time To Stabilization). Les deux peuvent être déficitaires indépendamment. Deux preuves
diagnostiques déficitaires, issues de mécanismes de mesure différents, retiennent l'hypothèse à un
niveau Faible. Des confirmatives cohérentes élèvent à Modéré. Un déficit de force excentrique ou de
cinétique de freinage cohérent élève à Fort.

## 7. Arbre de décision
```
Si une seule variable diagnostique déficitaire
  → signal isolé, hypothèse non retenue.

Si deux variables diagnostiques déficitaires (mécanismes de mesure différents)
  → hypothèse Faible.

Si + confirmatives (temps de contact, force de pic) déficitaires
  → hypothèse Modérée.

Si + déficit de force excentrique / cinétique de freinage cohérent
  → hypothèse Forte.
```

---

# 7. STABILISATION

## 1. Question clinique
*Cet athlète est-il capable de stabiliser efficacement son corps après une contrainte, un appui ou
une perturbation ?*

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity` | Single Leg Stance (SLS) | Preuve diagnostique principale (équilibre unipodal) |
| `eo_surface`, `ef_surface` | Yeux ouverts / yeux fermés | Preuve diagnostique (contribution sensorielle) |
| `strobo_surface` | Stroboscopie | Preuve diagnostique (sous contrainte visuelle perturbée) |
| `landing_uni_tts`, `landing_bi_tts` | Landing (uni/bi) | Preuve diagnostique contextuelle (retour au contrôle après réception) |

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| Mêmes variables SLS | SLS | Rôle double : diagnostique et confirmatif |
| `strobo_surface`, `landing_uni_tts`, `landing_bi_tts` | Strobo / Landing | Rôle double |

## 4. Variables explicatives

**Force** : `hip_abd`, `hip_ext`, `hip_add`, `inv_iso`, `ev_iso`, `df_iso` (cinétique).

**Biomécanique** : trajectoire et vitesse du centre de pression, amplitude d'oscillation
(médio-latérale et antéro-postérieure), aire de l'ellipse de posture (SLS) — rôle double avec le
diagnostic · `strobo_surface`, `landing_uni_tts`, `landing_bi_tts` — rôle triple.

**Contrôle moteur** : aucune variable classée séparément — le contrôle moteur est directement
capturé par les variables diagnostiques SLS/EO/EF/Strobo elles-mêmes.

**Asymétrie** : aucune. **Mobilité** : `wblt_distance`. **Autre** : aucune.

## 5. Variables exclues
`sllt_peak_landing_force`, `sllt_loading_rate` (réservées à Absorption) · `cmj_peak_power`,
`slcmj_peak_power`, `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`, hop tests (puissance/réactivité) ·
`imtp_n`/`nkg`, `knee_ext_n`, `soleus_iso_n`, `gastro_iso_n` (force maximale) ·
`landing_bi_peak_landing_force` — **explicitement exclu**, y compris quand il est mesuré : c'est un
signal d'absorption (magnitude de force), pas de stabilisation (maintien du contrôle).

**Point d'attention clinique** : le signal "Landing" peut, dans certains cas, être identifié comme
déficitaire sans qu'aucune orientation clinique explicite n'en découle automatiquement — un déficit
peut donc être visible sans piste de travail directement associée.

## 6. Logique de raisonnement
Le déclenchement diagnostique repose principalement sur SLS ; EO/EF/Strobo apparaissent
généralement en confirmation d'un même constat postural. Deux preuves diagnostiques déficitaires
retiennent l'hypothèse à un niveau Faible. La convergence entre SLS et une seconde source (EO/EF ou
Landing) élève à Modéré. Un déficit de force des stabilisateurs de hanche/cheville cohérent élève à
Fort.

## 7. Arbre de décision
```
Si une seule variable SLS déficitaire
  → signal isolé, hypothèse non retenue.

Si deux preuves diagnostiques déficitaires (par exemple SLS + EO/EF)
  → hypothèse Faible.

Si + confirmatives cohérentes
  → hypothèse Modérée.

Si + déficit de force des stabilisateurs (hanche/cheville)
  → hypothèse Forte.
```

---

# 8. ENDURANCE

## 1. Question clinique
*Cet athlète est-il capable de répéter l'effort sans chute précoce et excessive de performance ?*
(résistance à la fatigue spécifique)

## 2. Variables diagnostiques

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `heel_raise_reps` | Heel Raise | Preuve diagnostique locale (endurance du mollet) |
| `repeated_hop_n_hops` | Repeated Hop | Preuve diagnostique (volume répété) |
| `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue` | Repeated Hop | Preuves diagnostiques de dégradation |

## 3. Variables confirmatives

| Nom Kinexus | Test d'origine | Rôle exact |
|---|---|---|
| `repeated_hop_mean_height`, `mean_rsi`, `mean_peak_force`, `mean_ct` | Repeated Hop | Confirment le niveau moyen |
| `best_height`, `best_rsi` | Repeated Hop | Confirment la meilleure performance atteinte |
| `height_cv`, `ct_cv`, `rsi_cv` | Repeated Hop | Confirment via la variabilité (coefficient de variation) |

## 4. Variables explicatives

**Force** : `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push` (absolue et relative) · force
segmentaire complète (11 familles, absolue et relative).

**Biomécanique** : cinétique complète (15 familles de vitesse de développement de force) ·
dérive du temps de contact et coefficients de variation (rôle double avec la confirmative) ·
hauteur moyenne/meilleure, indice de réactivité moyen/meilleur, force de pic moyenne (rôle double).

**Contrôle moteur** : aucune. **Asymétrie** : aucune. **Mobilité** : aucune. **Autre** : aucune.

## 5. Variables exclues
Toutes les variables CMJ/SLCMJ/DJ/SLDJ/CMJR (puissance) · `wblt` (mobilité) · toutes les variables
SLS/EO/EF/Strobo (stabilisation) · toutes les variables Landing/SLLT (absorption).

**Point d'attention clinique** : cette qualité isole spécifiquement la dégradation de performance
dans la répétition — à distinguer d'un déficit de réactivité mesuré sur un seul contact isolé, qui
relève d'une autre qualité.

## 6. Logique de raisonnement
Deux variables de fatigue déficitaires (sur les 6 diagnostiques) retiennent l'hypothèse à un niveau
Faible. Des confirmatives cohérentes (coefficient de variation élevé, moyenne dégradée) élèvent à
Modéré. Un déficit de force de fond cohérent élève à Fort.

## 7. Arbre de décision
```
Si une seule variable de fatigue déficitaire
  → signal isolé, hypothèse non retenue.

Si deux variables déficitaires (sur les 6 diagnostiques)
  → hypothèse Faible.

Si + confirmatives cohérentes (variabilité, moyenne dégradée)
  → hypothèse Modérée.

Si + déficit de force de fond cohérent
  → hypothèse Forte.
```

---

# 9. TABLEAU FINAL

| Qualité | Variables diagnostiques | Variables confirmatives | Variables explicatives | Variables exclues |
|---|---|---|---|---|
| **Mobilité** | 1 (`wblt_distance`) | 1 (LSI, même mesure) | 0 | Force, Puissance/Réactivité, Absorption/Stabilisation |
| **Force** | 4 (IMTP, SLIMTP, Iso Belt Squat, SL Iso Push) | 4 (mêmes tests, force relative) | ~90 (12 groupes segmentaires + cinétique + épaule) | Puissance/Réactivité, Mobilité, Stabilisation, Absorption |
| **Puissance** | 2 principales + 3 de secours (CMJ/SLCMJ + DJ/SLDJ/CMJR) | 3 (hauteur de saut, hop tests) | ~60 (force + stratégie CMJ/SLCMJ) | Mobilité, Absorption, Endurance |
| **Réactivité** | 2 (DJ, SLDJ) | 17 (temps de contact, forces, hop tests) | ~55 (force + cinétique DJ/CMJR) | Mobilité, Stabilisation, Absorption, Endurance |
| **Explosivité** | 2 (RFD concentrique, impulsion 100ms) | 4 (puissance, forces de pic) | ~50 (force + stratégie CMJ) | Puissance pure, Réactivité, Mobilité, Stabilisation, Absorption |
| **Absorption** | 11 (Landing, SLLT, CMJ excentrique/freinage) | 13 (Landing, CMJ, DJ) | ~30 (force + cinétique + asymétrie + mobilité) | Réactivité, Endurance |
| **Stabilisation** | 11 (SLS, EO/EF, Strobo, Landing) | 11 (mêmes variables) | ~15 (force stabilisateurs + biomécanique posturale + mobilité) | Absorption (SLLT), Puissance/Réactivité, Force maximale |
| **Endurance** | 6 (Heel Raise, Repeated Hop) | 9 (moyennes, meilleures perfs, variabilité) | ~90 (force + cinétique complète) | Puissance, Mobilité, Stabilisation, Absorption |

*Les comptages de variables explicatives incluent toutes les déclinaisons (absolue/relative,
fenêtres temporelles de RFD) d'une même famille de test — pas un décompte de tests distincts.*

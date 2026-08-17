# Logique clinique du moteur HYP### — Mesure → Diagnostic → Confirmation → Explication → Mécanisme → Orientation

Document praticien, autonome — aucune lecture préalable requise. Le sujet est exclusivement le
raisonnement clinique : comment une mesure devient un diagnostic, comment un diagnostic est
confirmé, pourquoi un déficit existe, et vers quelle orientation il oriente.

**Convention de statut, appliquée à chaque affirmation de ce document :**
- **SOURCE EXPLICITE** — écrit tel quel dans la documentation de référence (fiches de qualité,
  matrice d'orientation `CLI###`).
- **[INFERENCE]** — déduction forte mais non écrite mot pour mot dans la source.
- **[À VALIDER]** — relation plausible, construite pour illustrer le raisonnement demandé, mais
  **non documentée** — à ne jamais traiter comme une règle déjà validée.
- **non documenté** — absence d'information constatée, jamais masquée.

Référence pour la liste exhaustive de chaque variable (noms KPI complets par test) :
`CARTOGRAPHIE_VARIABLES_HYP.md`. Ce document-ci ne les reproduit pas intégralement — il organise
les mêmes variables par mécanisme explicatif et les relie à une orientation.

---

# MOBILITÉ

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `wblt_distance` | WBLT | Distance sous le seuil normatif (un côté suffit) | Diagnostique — seule variable, suffit seule à retenir l'hypothèse (SOURCE EXPLICITE) |

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `wblt_distance` (LSI calculé) | WBLT | Nuance de la même mesure diagnostique — pas une preuve indépendante | Aucun — ne peut jamais faire progresser le support au-delà du niveau déjà atteint par le diagnostic (SOURCE EXPLICITE) |

*Rappel : une variable confirmative ne peut jamais créer seule un diagnostic — ici, il n'y a même
pas de variable confirmative réellement indépendante à appliquer ce principe.*

## Niveau 3 — Explication du déficit
**non documenté.** Aucune variable mesurée par Kinexus n'explique aujourd'hui pourquoi
`wblt_distance` est déficitaire (les causes cliniques possibles — raideur articulaire, douleur,
stratégie de compensation — sont explicitement identifiées par la documentation de référence comme
non mesurables par l'outil).

## Relations causales
Aucune — absence de variable explicative (non documenté).

## Profils de déficit
Un seul profil possible, structurellement :
```
wblt_distance ↓
→ hypothèse retenue directement (SOURCE EXPLICITE)
```
Aucune combinaison supplémentaire n'existe pour cette qualité.

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| `wblt_distance` ↓ | non documenté | Améliorer la mobilité de cheville (`CLI020`) | SOURCE EXPLICITE |
| `wblt_distance` (asymétrie) ↓ | non documenté | Réduire l'asymétrie de mobilité (`CLI021`) | SOURCE EXPLICITE |

## Arbre de décision
```
1. La qualité est-elle déficitaire ? → wblt_distance sous le seuil ?
2. Preuves diagnostiques convergentes ? → une seule preuve possible, pas de convergence à évaluer.
3. Confirmatives ? → aucune indépendante.
4. Explicatives déficitaires ? → aucune variable disponible.
5. Mécanismes compatibles ? → non documenté.
6. Orientation ? → CLI020 (général) ou CLI021 (si l'asymétrie D/G domine le tableau).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `wblt_distance` | WBLT | Diagnostique | — (c'est le déficit lui-même, pas une explication) | `CLI020` | SOURCE EXPLICITE |
| `wblt_distance` (LSI) | WBLT | Confirmative | — | `CLI021` (si asymétrie dominante) | SOURCE EXPLICITE |

---

# FORCE

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `imtp_n` | IMTP | Force absolue sous le seuil | Diagnostique |
| `slimtp_n` | SLIMTP | Force absolue sous le seuil | Diagnostique |
| `iso_belt_squat_n` | Iso Belt Squat | Force absolue sous le seuil | Diagnostique |
| `sl_iso_push_n` | SL Iso Push | Force absolue sous le seuil | Diagnostique |

*Condition de convergence (SOURCE EXPLICITE, `CLI010`) : au moins 2 de ces 4 variables déficitaires
simultanément pour que l'hypothèse soit retenue.*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `imtp_nkg` | IMTP | Force relative (rapportée au poids de corps) | Fait passer le support de Faible à Modéré si déficitaire (SOURCE EXPLICITE) |
| `slimtp_nkg` | SLIMTP | Force relative | Idem |
| `iso_belt_squat_nkg` | Iso Belt Squat | Force relative | Idem |
| `sl_iso_push_nkg` | SL Iso Push | Force relative | Idem |

*Rappel : ces 4 variables ne peuvent jamais, seules, générer l'hypothèse Force — même toutes
déficitaires, sans au moins 2 variables diagnostiques déficitaires, l'hypothèse n'est pas retenue.*

## Niveau 3 — Explication du déficit

```
Force déficitaire
│
├── Cause potentielle : déficit de force absolue/relative d'un groupe musculaire spécifique
│   (SOURCE EXPLICITE — Vierge_7 nomme "Force segmentaire" comme catégorie explicative dédiée)
│   ├── knee_ext_n, knee_ext_nkg (quadriceps)
│   ├── knee_flex_n, knee_flex_nkg (ischio-jambiers)
│   ├── soleus_iso_n, soleus_iso_nkg (soléaire)
│   ├── gastro_iso_n, gastro_iso_nkg (gastrocnémien)
│   ├── hip_flex_n, hip_flex_nkg (fléchisseurs de hanche)
│   ├── hip_ext_n, hip_ext_nkg (extenseurs de hanche)
│   ├── hip_abd_n, hip_abd_nkg (abducteurs de hanche)
│   ├── hip_add_n, hip_add_nkg (adducteurs de hanche)
│   ├── df_iso_n, df_iso_nkg (dorsiflexeurs de cheville)
│   ├── inv_iso_n, inv_iso_nkg (inverseurs de cheville)
│   ├── ev_iso_n, ev_iso_nkg (éverseurs de cheville)
│   └── sh_iso_9020/9090/3030/6060 _n/_nkg (épaule, 4 angles)
│
└── Cause potentielle : déficit de vitesse de développement de force (pas la force elle-même, sa rapidité d'atteinte)
    (SOURCE EXPLICITE — Vierge_7 nomme "cinétique de production de force" comme catégorie distincte)
    ├── Cinétique des 4 tests diagnostiques : imtp_rfd100/rfd200/ttpf, slimtp_(mêmes), iso_belt_squat_(mêmes), sl_iso_push_(mêmes)
    ├── Cinétique des 11 groupes segmentaires ci-dessus (rfd50/rfd100/rfd150/rfd200/ttpf chacun)
    └── rs_hip_push, rs_knee_push, rs_ankle_push (n/nkg/rfd100/rfd200/ttpf — protocole spécifique à la course)
```

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `knee_ext_n` | Force | Explicatif | Déficit de force absolue du quadriceps | SOURCE EXPLICITE |
| `knee_ext_rfd100` | Force | Explicatif biomécanique | Déficit de vitesse de développement de force du quadriceps | SOURCE EXPLICITE |
| `hip_abd_n` | Force | Explicatif | Déficit de force absolue des abducteurs de hanche | SOURCE EXPLICITE |
| `sh_iso_9020_n` | Force | Explicatif | Déficit de force de l'épaule (angle 90/20) | SOURCE EXPLICITE |
| `rs_hip_push_rfd100` | Force | Explicatif biomécanique | Déficit de vitesse de développement de force en contexte spécifique course | [INFERENCE] — la catégorie "Run-Specific" existe, mais Vierge_7 ne précise pas explicitement le mécanisme clinique visé au-delà du nom du test |

*(Relation exhaustive : chaque variable listée en Niveau 3 suit exactement ce même schéma —
`<variable> → Force → Explicatif [biomécanique si RFD/ttpf] → déficit de force [absolue/relative si
n/nkg ; de vitesse de développement si rfd/ttpf] du groupe musculaire concerné`, SOURCE EXPLICITE
pour tous, sauf les 3 tests Run-Specific qui restent [INFERENCE] sur le mécanisme précis.)*

## Profils de déficit
```
FORCE ↓ (2 tests globaux sur 4)
+ force relative (nkg) normale
→ orientation : force absolue insuffisante, pas un problème de gabarit (SOURCE EXPLICITE — CLI010)

FORCE globale normale (0-1 test sur 4)
+ force relative (nkg) déficitaire
→ orientation : force relative insuffisante (SOURCE EXPLICITE — CLI011)

FORCE ↓
+ asymétrie marquée entre côtés
→ orientation : réduire l'asymétrie (SOURCE EXPLICITE — CLI012)

FORCE ↓
+ déficit segmentaire isolé sur un seul groupe (ex. quadriceps)
→ orientation vers ce groupe précis (SOURCE EXPLICITE — CLI200-211, condition : "au moins une
  variable diagnostique globale déficitaire ET déficit local confirmé")

FORCE ↓
+ ≥3 groupes segmentaires déficitaires simultanément
→ orientation vers un déficit local multiple (SOURCE EXPLICITE — CLI213)

FORCE ↓ sur les 4 tests
+ RFD déficitaire sur les mêmes tests
+ RFD normal sur les groupes segmentaires
→ [À VALIDER] — hypothèse plausible d'un déficit de force "en régime établi" plutôt que de vitesse
  de développement, mais aucune orientation Vierge_7 distincte ne cible spécifiquement ce profil.
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| Force globale (2/4 tests) | non précisé au-delà du diagnostic global | Améliorer la force maximale globale | SOURCE EXPLICITE (`CLI010`) |
| Force relative | Le gabarit/poids de corps dilue une force absolue par ailleurs correcte | Améliorer la force relative | SOURCE EXPLICITE (`CLI011`) |
| Asymétrie de force | non précisé | Réduire les asymétries de force | SOURCE EXPLICITE (`CLI012`) |
| Déficit segmentaire (1 groupe) | Déficit localisé sur le groupe musculaire identifié | Travail localisé sur ce groupe (12 orientations possibles, une par groupe — `CLI200`-`211`) | SOURCE EXPLICITE |
| Déficit segmentaire multiple (≥3) | Déficit diffus sur plusieurs groupes | Réduire un déficit local multiple | SOURCE EXPLICITE (`CLI213`) |

*Distinction rappelée : ce que ce tableau nomme "orientation" est une piste de travail à instruire
par le praticien — pas un principe d'entraînement ni une prescription de séance.*

## Arbre de décision
```
1. Force déficitaire ? → ≥2 des 4 tests diagnostiques sous le seuil.
2. Convergence ? → lesquels des 4 (IMTP/SLIMTP/Iso Belt Squat/SL Iso Push) sont déficitaires.
3. Confirmatives ? → force relative (nkg) déficitaire ou non, sur les mêmes tests.
4. Explicatives déficitaires ? → quels groupes segmentaires (n/nkg) et quelles cinétiques (rfd/ttpf).
5. Mécanismes compatibles ? → force absolue vs relative vs segmentaire vs cinétique.
6. Orientation ? → CLI010/011/012 (global) ou CLI200-213 (segmental), selon le profil ci-dessus.
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `imtp_n` | IMTP | Diagnostique | — | `CLI010` | SOURCE EXPLICITE |
| `imtp_nkg` | IMTP | Confirmative | Force relative insuffisante | `CLI011` | SOURCE EXPLICITE |
| `knee_ext_n` | Knee Extension | Explicative | Déficit de force absolue du quadriceps | `CLI200` | SOURCE EXPLICITE |
| `knee_ext_rfd100` | Knee Extension | Explicative | Déficit de vitesse de développement de force du quadriceps | `CLI200` | SOURCE EXPLICITE |
| *(les 10 autres groupes segmentaires suivent le même schéma — voir `CARTOGRAPHIE_VARIABLES_HYP.md`)* | | | | | |
| `sh_iso_9020_n` | Épaule 90/20 | Explicative | Déficit de force de l'épaule | `CLI211` | SOURCE EXPLICITE |
| `rs_hip_push_n` | Run-Specific Hip | Explicative | Déficit de force en contexte course | non documenté (aucune `CLI###` dédiée) | [À VALIDER] |

---

# PUISSANCE

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `cmj_peak_power` | CMJ | Puissance de pic sous le seuil | Diagnostique principal |
| `slcmj_peak_power` | SLCMJ | Puissance de pic sous le seuil (unilatéral) | Diagnostique principal |
| `dj_peak_prop_power` | Drop Jump | idem | Diagnostique secondaire — uniquement si CMJ/SLCMJ indisponibles (SOURCE EXPLICITE) |
| `sldj_peak_prop_power` | SLDJ | idem | Diagnostique secondaire |
| `cmjr_peak_power` | CMJ Rebound | idem | Diagnostique secondaire |

*Condition de convergence (SOURCE EXPLICITE, `CLI040`) : `cmj_peak_power` **et**
`slcmj_peak_power` doivent être déficitaires ensemble — la condition la plus stricte du corpus. Les
preuves secondaires ne renforcent jamais un diagnostic déjà posé, elles suppléent seulement une
absence de données.*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `cmj_height` | CMJ | Hauteur de saut cohérente avec un déficit de puissance | Faible → Modéré si déficitaire |
| `single_hop_distance` | Single Hop | Confirme via une tâche fonctionnelle horizontale | Faible → Modéré |
| `triple_hop_distance` | Triple Hop | idem, tâche répétée | Faible → Modéré |

## Niveau 3 — Explication du déficit
```
Puissance déficitaire
│
├── Cause potentielle : déficit de force
│   (SOURCE EXPLICITE — Vierge_7 cite "Force" comme catégorie explicative, et CLI040 cite
│   explicitement "Force" comme qualité explicative de Puissance)
│   ├── imtp_n, imtp_nkg
│   ├── slimtp_n, slimtp_nkg
│   ├── profil_fv_nkg (F0 — capacité de force du profil force-vitesse)
│   └── force segmentaire (n/nkg) : knee_ext, knee_flex, soleus_iso, gastro_iso, hip_flex,
│       hip_ext, hip_abd, hip_add, sl_iso_push, iso_belt_squat, iso_squat_hold
│
├── Cause potentielle : déficit de vitesse (profil orienté force plutôt que vitesse)
│   (SOURCE EXPLICITE — profil_fv_v0 est nommément la composante vitesse du profil force-vitesse)
│   └── profil_fv_v0
│
└── Cause potentielle : stratégie biomécanique d'exécution du saut
    (SOURCE EXPLICITE — Vierge_7 nomme "Stratégie d'expression du CMJ/SLCMJ")
    ├── cmj_peak_vel, cmj_tto, cmj_depth, cmj_conc_mean_force, cmj_conc_mean_vel, cmj_conc_rfd,
    │   cmj_conc_duration, cmj_conc_displacement, cmj_braking_duration, cmj_propulsion_eff,
    │   cmj_braking_eff, cmj_ft_ct_ratio, cmj_ecc_decel, cmj_landing_rfd, cmj_landing_mean_power
    └── slcmj_rsi_mod, slcmj_peak_conc_force, slcmj_peak_conc_vel, slcmj_edrfd_bm,
        slcmj_braking_rfd, slcmj_peak_braking_force, slcmj_braking_impulse, slcmj_depth,
        slcmj_contraction_time, slcmj_ecc_duration, slcmj_conc_duration,
        slcmj_peak_landing_force, slcmj_landing_impulse, slcmj_time_to_stab
```

*Point complémentaire, SOURCE EXPLICITE : `CLI040` cite aussi "Explosivité" comme qualité
explicative de Puissance — une relation entre deux qualités entières, pas entre une variable et
Puissance. Ce document ne développe pas cette relation qualité-à-qualité au niveau variable, faute
de détail source à ce niveau.*

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `imtp_n` | Puissance | Explicatif | Déficit de force globale | SOURCE EXPLICITE |
| `profil_fv_nkg` | Puissance | Explicatif | Profil orienté déficit de force (F0) | SOURCE EXPLICITE |
| `profil_fv_v0` | Puissance | Explicatif | Profil orienté déficit de vitesse (V0) | SOURCE EXPLICITE |
| `cmj_depth` | Puissance | Explicatif biomécanique | Stratégie d'exécution (profondeur de contre-mouvement) | SOURCE EXPLICITE |
| `cmj_conc_rfd` | Puissance | Explicatif biomécanique | Stratégie d'exécution (vitesse de développement de force en phase concentrique) | SOURCE EXPLICITE |
| `slcmj_braking_rfd` | Puissance | Explicatif biomécanique | Stratégie de freinage unilatérale | SOURCE EXPLICITE |

## Profils de déficit
```
PUISSANCE ↓
+ FORCE (HYP-FOR-01) également retenue
→ Force citée comme cause possible (SOURCE EXPLICITE, CLI040 — au niveau qualité, pas variable)

PUISSANCE ↓
+ profil_fv_nkg (F0) déficitaire, profil_fv_v0 normal
→ [À VALIDER] orientation vers un déficit de force plutôt que de vitesse — cohérent avec la
  signification physique du profil force-vitesse, mais aucune orientation CLI### distincte ne
  cible ce sous-profil précis.

PUISSANCE ↓
+ FORCE normale
+ variables de stratégie CMJ/SLCMJ anormales
→ [À VALIDER] orientation vers un problème de stratégie/technique d'exécution plutôt que de
  capacité de force sous-jacente — cohérent avec la séparation Force/stratégie déjà documentée,
  mais Vierge_7 ne formalise pas cette règle de branchement comme une orientation distincte.

PUISSANCE ↓ (absolue)
+ score normal après ajustement au poids de corps
→ orientation vers puissance relative (SOURCE EXPLICITE — CLI041, bien que sans condition
  numérique précisée dans la source)
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| CMJ_PP + SLCMJ_PP | non précisé au-delà du diagnostic ; Force et Explosivité citées comme causes possibles au niveau qualité | Augmenter la puissance maximale | SOURCE EXPLICITE (`CLI040`) |
| Puissance relative (PP/poids de corps) | non précisé | Augmenter la puissance relative | SOURCE EXPLICITE (`CLI041`) |

## Arbre de décision
```
1. Puissance déficitaire ? → cmj_peak_power ET slcmj_peak_power sous le seuil.
2. Convergence ? → les deux ensemble (ou preuve secondaire si tests principaux absents).
3. Confirmatives ? → hauteur de saut / hop tests déficitaires ou non.
4. Explicatives déficitaires ? → force (imtp/slimtp/segmentaire/profil F-V) et/ou stratégie CMJ/SLCMJ.
5. Mécanismes compatibles ? → déficit de force vs déficit de vitesse vs stratégie d'exécution.
6. Orientation ? → CLI040 (global) ou CLI041 (puissance relative).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `cmj_peak_power` | CMJ | Diagnostique | — | `CLI040` | SOURCE EXPLICITE |
| `cmj_height` | CMJ | Confirmative | — | `CLI040` (renfort) | SOURCE EXPLICITE |
| `imtp_n` | IMTP | Explicative | Déficit de force globale | `CLI040` (cause possible) | SOURCE EXPLICITE |
| `profil_fv_v0` | Profil F-V | Explicative | Profil orienté vitesse insuffisante | non documenté (pas de `CLI###` distincte) | [À VALIDER] |
| `cmj_conc_rfd` | CMJ | Explicative biomécanique | Stratégie d'exécution | non documenté | [À VALIDER] |

---

# RÉACTIVITÉ

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `dj_rsi` | Drop Jump | Indice de réactivité sous le seuil | Diagnostique principal |
| `sldj_rsi` | SLDJ | idem, unilatéral | Diagnostique principal |

*Condition de convergence (SOURCE EXPLICITE) : les deux doivent être déficitaires ensemble.
`cmjr_mean_rsi` (CMJ Rebound) mesure un phénomène proche mais **n'est jamais comptée comme
diagnostique** — une contradiction relevée entre deux sections de Vierge_7 (la matrice
d'orientation la cite comme diagnostique, la fiche de qualité ne le fait pas) a été tranchée en
faveur de la fiche de qualité, plus détaillée. Signalé, pas masqué.*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `dj_contact_time`, `sldj_contact_time` | Drop Jump / SLDJ | Temps de contact cohérent avec le déficit de RSI | Faible → Modéré |
| `dj_height`, `sldj_height` | Drop Jump / SLDJ | Hauteur de rebond cohérente | Faible → Modéré |
| `dj_peak_prop_force`/`power`, `dj_leg_stiffness`, `dj_landing_impulse`, `dj_peak_landing_force` (+ équivalents `sldj_*`) | Drop Jump / SLDJ | Cohérence globale du profil de contact | Faible → Modéré |
| `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance` | Hop tests | Confirmation fonctionnelle | Faible → Modéré |

## Niveau 3 — Explication du déficit
```
Réactivité déficitaire
│
├── Cause potentielle : déficit de vitesse de développement de force (jamais de force absolue —
│   Vierge_7 ne cite ici que les variantes RFD/ttpf, jamais n/nkg, pour cette qualité)
│   (SOURCE EXPLICITE)
│   ├── imtp_rfd100/rfd200/ttpf, slimtp_(mêmes), iso_belt_squat_(mêmes), sl_iso_push_(mêmes),
│   │   iso_squat_hold_(mêmes)
│   ├── cinétique des 11 groupes segmentaires (rfd50/100/150/200/ttpf chacun)
│   └── profil_fv_nkg, profil_fv_v0
│
├── Cause potentielle : stratégie de contact au sol (raideur, temps de contact, force propulsive)
│   (SOURCE EXPLICITE — double rôle confirmative/explicative déjà noté dans la fiche de qualité)
│   └── dj_contact_time, dj_leg_stiffness, dj_peak_landing_force, dj_landing_impulse,
│       dj_peak_prop_force, dj_peak_prop_power (+ équivalents sldj_*)
│
└── Cause potentielle : dégradation de la réactivité sur des contacts répétés
    (SOURCE EXPLICITE — entièrement explicatif, jamais diagnostique, pour cmjr_*)
    └── cmjr_mean_ct, cmjr_mean_stiffness, cmjr_mean_rebound_height, cmjr_mean_rsi,
        cmjr_rsi_decay, cmjr_stiffness_decay
```

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `imtp_rfd100` | Réactivité | Explicatif | Déficit de vitesse de développement de force globale | SOURCE EXPLICITE |
| `dj_leg_stiffness` | Réactivité | Explicatif biomécanique | Raideur de jambe insuffisante au contact | SOURCE EXPLICITE |
| `cmjr_rsi_decay` | Réactivité | Explicatif | Dégradation de la réactivité sur contacts répétés | SOURCE EXPLICITE (jamais diagnostique) |

## Profils de déficit
```
RÉACTIVITÉ ↓
+ déficit de vitesse de développement de force (RFD) cohérent
→ [À VALIDER] orientation vers un travail de production rapide de force — cohérent avec le
  mécanisme documenté, mais aucune CLI### distincte ne cible ce sous-profil précis face à CLI050.

RÉACTIVITÉ ↓
+ dj_contact_time / sldj_contact_time nettement allongé
→ orientation vers la réduction du temps de contact (SOURCE EXPLICITE — CLI051)

RÉACTIVITÉ ↓
+ cmjr_rsi_decay marqué (dégradation sur contacts répétés), RSI initial normal
→ [À VALIDER] hypothèse d'un problème d'endurance réactive plutôt que de réactivité de base —
  cohérent avec la séparation déjà établie entre Réactivité et Endurance, mais Vierge_7 ne
  formalise pas d'orientation spécifique pour ce croisement.
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| DJ_RSI + SLDJ_RSI | non précisé au-delà du diagnostic | Améliorer la réactivité | SOURCE EXPLICITE (`CLI050`) |
| Temps de contact allongé | Stratégie de contact inefficace | Réduire le temps de contact | SOURCE EXPLICITE (`CLI051`) |

## Arbre de décision
```
1. Réactivité déficitaire ? → dj_rsi ET sldj_rsi sous le seuil.
2. Convergence ? → les deux, jamais cmjr_mean_rsi seul.
3. Confirmatives ? → temps de contact, hauteur, forces de contact.
4. Explicatives déficitaires ? → cinétique de force et/ou raideur/stratégie de contact et/ou dégradation répétée.
5. Mécanismes compatibles ? → vitesse de développement de force vs stratégie de contact vs endurance réactive.
6. Orientation ? → CLI050 (global) ou CLI051 (temps de contact spécifiquement).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `dj_rsi` | Drop Jump | Diagnostique | — | `CLI050` | SOURCE EXPLICITE |
| `dj_contact_time` | Drop Jump | Confirmative + Explicative | Stratégie de contact | `CLI051` | SOURCE EXPLICITE |
| `imtp_rfd100` | IMTP | Explicative | Déficit de vitesse de développement de force | non documenté (pas de `CLI###` distincte) | [À VALIDER] |
| `cmjr_mean_rsi` | CMJ Rebound | Explicative uniquement (jamais diagnostique) | Tendance réactive générale | non documenté | SOURCE EXPLICITE (le rôle, pas l'orientation) |

---

# EXPLOSIVITÉ

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `cmj_conc_rfd` | CMJ | Vitesse de développement de force concentrique sous le seuil | Diagnostique |
| `cmj_conc_impulse_100` | CMJ | Impulsion à 100ms sous le seuil | Diagnostique |

*Condition (SOURCE EXPLICITE) : les deux doivent être déficitaires ensemble — ce sont les 2 seules
variables réellement mesurées parmi les 4 que la documentation de référence vise (RFD fenêtré à
100/150/200ms non disponible aujourd'hui).*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `cmj_peak_power` | CMJ | Puissance de pic cohérente | Faible → Modéré |
| `cmj_conc_peak_force` | CMJ | Force de pic concentrique cohérente | Faible → Modéré |
| `cmj_conc_mean_force` | CMJ | Force moyenne concentrique cohérente | Faible → Modéré |
| `cmj_conc_impulse` | CMJ | Impulsion totale cohérente | Faible → Modéré |

## Niveau 3 — Explication du déficit
```
Explosivité déficitaire
│
├── Cause potentielle : déficit de vitesse de développement de force (jamais de force absolue —
│   même principe que Réactivité, uniquement RFD/ttpf)
│   (SOURCE EXPLICITE)
│   ├── imtp_rfd100/rfd200/ttpf, slimtp_(mêmes), iso_belt_squat_(mêmes), sl_iso_push_(mêmes),
│   │   iso_squat_hold_(mêmes)
│   ├── cinétique des 11 groupes segmentaires (rfd50/100/150/200/ttpf chacun)
│   └── profil_fv_nkg, profil_fv_v0
│
└── Cause potentielle : stratégie biomécanique du contre-mouvement
    (SOURCE EXPLICITE, sauf mention contraire)
    ├── cmj_depth, cmj_conc_duration, cmj_rsi_mod, cmj_ecc_mean_power, cmj_ecc_peak_vel
    └── cmj_braking_rfd [INFERENCE — correspondance de nommage entre la variable Vierge_7
        (graphiée différemment selon les sections du document source) et la variable Kinexus
        réelle, non confirmée mot pour mot par le praticien]
```

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `imtp_rfd100` | Explosivité | Explicatif | Déficit de vitesse de développement de force globale | SOURCE EXPLICITE |
| `cmj_depth` | Explosivité | Explicatif biomécanique | Stratégie de contre-mouvement (profondeur) | SOURCE EXPLICITE |
| `cmj_braking_rfd` | Explosivité | Explicatif biomécanique | Capacité de freinage/décélération excentrique | [INFERENCE] — correspondance de nom non confirmée mot pour mot |

## Profils de déficit
```
EXPLOSIVITÉ ↓
+ déficit de vitesse de développement de force (RFD) cohérent sur les tests globaux/segmentaires
→ [À VALIDER] orientation vers un travail de développement rapide de force — cohérent avec le
  mécanisme documenté, sans orientation CLI### distincte pour ce sous-profil.

EXPLOSIVITÉ ↓
+ cmj_depth / cmj_conc_duration anormaux, cinétique de force par ailleurs normale
→ [À VALIDER] hypothèse d'un problème de stratégie de contre-mouvement plutôt que de capacité de
  force — plausible mais non formalisée comme orientation distincte.
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| RFD concentrique + impulsion 100ms | non précisé au-delà du diagnostic | Améliorer la vitesse de développement de force | SOURCE EXPLICITE (`CLI030`) |
| RFD100 seul sous le seuil | non précisé | Optimiser le recrutement explosif | SOURCE EXPLICITE (`CLI031`, condition à une seule variable — structurellement plus permissive que `CLI030`, signalé sans être harmonisé) |

## Arbre de décision
```
1. Explosivité déficitaire ? → cmj_conc_rfd ET cmj_conc_impulse_100 sous le seuil.
2. Convergence ? → les deux, seules variables diagnostiques disponibles.
3. Confirmatives ? → puissance et forces de pic du CMJ.
4. Explicatives déficitaires ? → vitesse de développement de force et/ou stratégie de contre-mouvement.
5. Mécanismes compatibles ? → déficit de force rapide vs stratégie biomécanique.
6. Orientation ? → CLI030 (global) ou CLI031 (recrutement explosif, seuil RFD100 seul).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `cmj_conc_rfd` | CMJ | Diagnostique | — | `CLI030` | SOURCE EXPLICITE |
| `cmj_peak_power` | CMJ | Confirmative | — | `CLI030` (renfort) | SOURCE EXPLICITE |
| `imtp_rfd100` | IMTP | Explicative | Déficit de vitesse de développement de force | non documenté | [À VALIDER] |
| `cmj_braking_rfd` | CMJ | Explicative biomécanique | Capacité de freinage excentrique | non documenté | [INFERENCE] |

---

# ABSORPTION

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `landing_uni_tts` | Landing Unilatéral | Temps de stabilisation sous le seuil | Diagnostique |
| `landing_bi_tts` | Land and Hold | idem, bilatéral | Diagnostique |
| `sllt_peak_landing_force` | SLLT | Force de réception sous le seuil | Diagnostique |
| `sllt_ttplf` | SLLT | Temps jusqu'au pic de force anormal | Diagnostique |
| `sllt_loading_rate` | SLLT | Vitesse de charge anormale | Diagnostique |
| `sllt_tts` | SLLT | Temps de stabilisation sous le seuil | Diagnostique |
| `sllt_cop_path` | SLLT | Trajectoire du centre de pression anormale | Diagnostique |
| `cmj_ecc_mean_power` | CMJ | Puissance excentrique sous le seuil | Diagnostique |
| `cmj_ecc_peak_vel` | CMJ | Vitesse excentrique de pic anormale | Diagnostique |
| `cmj_braking_rfd` | CMJ | Vitesse de développement de force de freinage anormale | Diagnostique |
| `cmj_braking_impulse` | CMJ | Impulsion de freinage anormale | Diagnostique |

*Condition (SOURCE EXPLICITE) : au moins 2 preuves diagnostiques déficitaires, provenant de
mécanismes de mesure différents (pas seulement 2 KPIs du même test).*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `landing_bi_peak_landing_force` | Land and Hold | Magnitude de force cohérente | Faible → Modéré |
| `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_landing_impulse` | CMJ | Cohérence de la stratégie de réception | Faible → Modéré |
| `dj_contact_time`, `dj_landing_impulse`, `dj_peak_landing_force` (+ équivalents `sldj_*`) | Drop Jump / SLDJ | Cohérence du profil de réception | Faible → Modéré |

## Niveau 3 — Explication du déficit
```
Absorption déficitaire
│
├── Cause potentielle : déficit de force excentrique / de freinage (RFD partiel, pas la cinétique
│   complète comme pour Force/Réactivité)
│   (SOURCE EXPLICITE)
│   ├── imtp_rfd100/rfd200, slimtp_(mêmes), iso_belt_squat_(mêmes), sl_iso_push_(mêmes)
│   ├── knee_ext_rfd100/rfd150/rfd200, soleus_iso_rfd100/rfd200, gastro_iso_rfd100/rfd200
│   └── hip_abd_rfd100, hip_add_rfd100, hip_ext_rfd100, hip_flex_rfd100
│
├── Cause potentielle : stratégie biomécanique de freinage
│   (SOURCE EXPLICITE)
│   ├── cmj_braking_duration
│   └── dj_contact_time, dj_leg_stiffness, dj_peak_landing_force, dj_landing_impulse,
│       dj_peak_prop_force, dj_peak_prop_power (+ équivalents sldj_*)
│
└── Cause potentielle : mobilité de cheville limitée
    (SOURCE EXPLICITE que wblt_distance est explicative pour Absorption ; le mécanisme précis —
    "une mobilité limitée peut altérer la stratégie d'absorption" — est vérifié mot pour mot pour
    Contrôle Sensori-moteur, une qualité voisine, et retenu par analogie de structure pour
    Absorption [INFERENCE] plutôt que vérifié mot pour mot dans la fiche Absorption elle-même)
    └── wblt_distance
```

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `hip_abd_rfd100` | Absorption | Explicatif | Déficit de force excentrique des abducteurs de hanche | SOURCE EXPLICITE |
| `dj_leg_stiffness` | Absorption | Explicatif biomécanique | Stratégie de freinage/raideur au contact | SOURCE EXPLICITE |
| `wblt_distance` | Absorption | Explicatif | Mobilité de cheville limitant la stratégie d'absorption | [INFERENCE] sur le libellé exact du mécanisme |

## Profils de déficit
```
ABSORPTION ↓ (Peak Landing Force + Loading Rate déficitaires)
+ Time To Stabilization normal
→ profil "mauvaise atténuation de force, récupération d'équilibre normale" (SOURCE EXPLICITE —
  déjà validé comme un profil clinique réel distinct dans la logique du moteur)

ABSORPTION ↓ (Time To Stabilization seul)
+ Peak Landing Force et Loading Rate normaux
→ profil inverse : magnitude de force correcte, récupération d'équilibre lente (SOURCE EXPLICITE,
  même logique de distinction)

ABSORPTION ↓
+ déficit de force excentrique cohérent
→ [À VALIDER] orientation vers un travail de force excentrique — cohérent avec le mécanisme
  documenté, sans CLI### distincte pour ce sous-profil face à CLI060.

ABSORPTION ↓ (Peak Landing Force)
→ orientation spécifique à la magnitude de force (SOURCE EXPLICITE — CLI061, explicative "Force
  excentrique")
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| ≥2 preuves diagnostiques | non précisé au-delà du diagnostic ; Force, Mobilité, Stabilisation citées comme qualités explicatives possibles | Améliorer la capacité d'absorption | SOURCE EXPLICITE (`CLI060`) |
| Peak Landing Force élevé | Force excentrique insuffisante | Réduire les pics d'impact | SOURCE EXPLICITE (`CLI061`) |

## Arbre de décision
```
1. Absorption déficitaire ? → ≥1 preuve diagnostique déficitaire (Landing, SLLT, ou CMJ excentrique/freinage).
2. Convergence ? → ≥2 preuves de mécanismes de mesure différents.
3. Confirmatives ? → magnitude de force et cohérence de stratégie de réception.
4. Explicatives déficitaires ? → force excentrique et/ou stratégie de freinage et/ou mobilité de cheville.
5. Mécanismes compatibles ? → déficit de force excentrique vs stratégie biomécanique vs mobilité.
6. Orientation ? → CLI060 (global) ou CLI061 (pics d'impact spécifiquement).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `sllt_peak_landing_force` | SLLT | Diagnostique | — | `CLI061` | SOURCE EXPLICITE |
| `landing_uni_tts` | Landing Unilatéral | Diagnostique | — | `CLI060` | SOURCE EXPLICITE |
| `hip_abd_rfd100` | Hip Abduction | Explicative | Déficit de force excentrique | non documenté (cité comme cause possible au niveau qualité, `CLI060`) | SOURCE EXPLICITE (le rôle) / [À VALIDER] (l'orientation précise) |
| `wblt_distance` | WBLT | Explicative | Mobilité de cheville limitant l'absorption | non documenté | [INFERENCE] |

---

# STABILISATION

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity` | Single Leg Stand | Contrôle postural unipodal anormal | Diagnostique (déclencheur principal selon `CLI070`) |
| `eo_surface` | Eyes Open | Surface d'oscillation anormale | Diagnostique (fiche de qualité) / confirmative (`CLI070`) — écart entre les deux niveaux de la documentation, signalé |
| `ef_surface` | Eyes Closed | idem | idem |
| `strobo_surface` | Strobo | Surface sous contrainte visuelle perturbée | Diagnostique |
| `landing_uni_tts`, `landing_bi_tts` | Landing | Retour au contrôle après réception anormal | Diagnostique selon la fiche de qualité — **absent des orientations `CLI070`/`CLI071` connues** (incohérence déjà signalée : un déficit peut être identifié sans qu'aucune orientation n'en découle) |

*Condition (SOURCE EXPLICITE) : au moins 2 preuves diagnostiques déficitaires.*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| Mêmes variables SLS | Single Leg Stand | Rôle double diagnostique/confirmatif | Faible → Modéré |
| `strobo_surface` | Strobo | Rôle double | Faible → Modéré |
| `landing_uni_tts`, `landing_bi_tts` | Landing | Rôle double | Faible → Modéré |

## Niveau 3 — Explication du déficit
```
Stabilisation déficitaire
│
├── Cause potentielle : déficit de force des stabilisateurs de hanche/cheville
│   (SOURCE EXPLICITE — vérifié directement dans le texte de référence, sous-catégorie nommée)
│   ├── hip_abd_rfd100, hip_abd_rfd200
│   ├── hip_ext_rfd100, hip_ext_rfd200
│   ├── hip_add_rfd100
│   ├── inv_iso_rfd100
│   ├── ev_iso_rfd100
│   └── df_iso_rfd100
│
├── Cause potentielle : stratégie de contrôle postural (gestion du centre de pression)
│   (SOURCE EXPLICITE — double/triple rôle avec le diagnostic déjà noté)
│   ├── sls_cop_path, sls_cop_vel, sls_cop_range_ml, sls_cop_range_ap, sls_ellipse_area,
│   │   sls_mean_velocity
│   └── strobo_surface, landing_uni_tts, landing_bi_tts
│
└── Cause potentielle : mobilité de cheville limitée
    (SOURCE EXPLICITE que wblt_distance est explicative pour Stabilisation ; mécanisme précis
    vérifié mot pour mot pour Contrôle Sensori-moteur, qualité aux preuves quasi identiques, et
    retenu par analogie [INFERENCE] plutôt que vérifié directement dans la fiche Stabilisation)
    └── wblt_distance
```

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `hip_abd_rfd100` | Stabilisation | Explicatif | Déficit de force des abducteurs de hanche, stabilisateurs du bassin | SOURCE EXPLICITE |
| `sls_cop_vel` | Stabilisation | Explicatif biomécanique (rôle double avec diagnostique) | Vitesse d'oscillation du centre de pression | SOURCE EXPLICITE |
| `wblt_distance` | Stabilisation | Explicatif | Mobilité de cheville limitant le contrôle postural | [INFERENCE] sur le libellé exact |

## Profils de déficit
```
STABILISATION ↓ (SLS seul)
→ orientation générale (SOURCE EXPLICITE — CLI070, SLS cité comme seul déclencheur explicite)

STABILISATION ↓
+ déficit de force des stabilisateurs de hanche/cheville cohérent
→ [À VALIDER] orientation vers un renforcement ciblé de ces groupes — cohérent avec le mécanisme
  documenté, sans CLI### distincte pour ce sous-profil face à CLI070.

STABILISATION ↓ (Landing isolé, SLS/EO/EF/Strobo normaux)
→ [RELATION À VALIDER] — l'hypothèse peut être techniquement retenue selon la fiche de qualité,
  mais aucune orientation CLI### connue ne s'y applique ; un déficit peut donc rester sans piste de
  travail associée dans ce cas précis. Signalé comme un vide de couverture, pas une règle.
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| SLS déficitaire (≥2 preuves) | non précisé au-delà du diagnostic | Améliorer la stabilité posturale | SOURCE EXPLICITE (`CLI070`) |
| Trajectoire du centre de pression anormale | Force des stabilisateurs insuffisante | Réduire les oscillations posturales | SOURCE EXPLICITE (`CLI071`) |

## Arbre de décision
```
1. Stabilisation déficitaire ? → ≥1 preuve diagnostique (SLS, EO/EF, Strobo, Landing).
2. Convergence ? → ≥2 preuves diagnostiques.
3. Confirmatives ? → mêmes familles, rôle double.
4. Explicatives déficitaires ? → force des stabilisateurs et/ou stratégie de centre de pression et/ou mobilité de cheville.
5. Mécanismes compatibles ? → déficit de force locale vs stratégie posturale vs mobilité.
6. Orientation ? → CLI070 (global) ou CLI071 (oscillations posturales/COP Path spécifiquement) —
   ou aucune orientation si le seul signal est Landing isolé (vide de couverture connu).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `sls_ttf` | Single Leg Stand | Diagnostique | — | `CLI070` | SOURCE EXPLICITE |
| `sls_cop_path` | Single Leg Stand | Diagnostique + Explicative | Trajectoire du centre de pression | `CLI071` | SOURCE EXPLICITE |
| `hip_abd_rfd100` | Hip Abduction | Explicative | Déficit de force des stabilisateurs | non documenté (`CLI071` cite "Force des stabilisateurs" au niveau générique) | SOURCE EXPLICITE (le rôle) |
| `landing_uni_tts` | Landing Unilatéral | Diagnostique (fiche) | — | **aucune** — vide de couverture connu | [À VALIDER] / signalé |

---

# ENDURANCE

## Niveau 1 — Diagnostic
| Variable | Test | Condition de déficit | Rôle |
|---|---|---|---|
| `heel_raise_reps` | Heel Raise | Nombre de répétitions sous le seuil | Diagnostique (local, mollet) |
| `repeated_hop_n_hops` | Repeated Hop | Volume répété insuffisant | Diagnostique |
| `repeated_hop_rsi_fatigue` | Repeated Hop | Dégradation de l'indice de réactivité | Diagnostique |
| `repeated_hop_height_fatigue` | Repeated Hop | Dégradation de la hauteur de saut | Diagnostique |
| `repeated_hop_ct_drift` | Repeated Hop | Dérive du temps de contact | Diagnostique |
| `repeated_hop_stiffness_fatigue` | Repeated Hop | Dégradation de la raideur de jambe | Diagnostique |

*Condition (SOURCE EXPLICITE) : au moins 2 preuves diagnostiques déficitaires.*

## Niveau 2 — Confirmation
| Variable | Test | Ce qu'elle confirme | Effet sur le support |
|---|---|---|---|
| `repeated_hop_mean_height`, `repeated_hop_mean_rsi`, `repeated_hop_mean_peak_force`, `repeated_hop_mean_ct` | Repeated Hop | Niveau moyen cohérent | Faible → Modéré |
| `repeated_hop_best_height`, `repeated_hop_best_rsi` | Repeated Hop | Meilleure performance atteinte cohérente | Faible → Modéré |
| `repeated_hop_height_cv`, `repeated_hop_ct_cv`, `repeated_hop_rsi_cv` | Repeated Hop | Variabilité cohérente avec une dégradation | Faible → Modéré |

## Niveau 3 — Explication du déficit
```
Endurance déficitaire
│
├── Cause potentielle : déficit de force de fond
│   (SOURCE EXPLICITE)
│   ├── imtp_n/nkg, slimtp_n/nkg, iso_belt_squat_n/nkg, sl_iso_push_n/nkg
│   └── force segmentaire complète (n/nkg) : knee_ext, knee_flex, soleus_iso, gastro_iso,
│       hip_flex, hip_ext, hip_abd, hip_add, df_iso, inv_iso, ev_iso
│
├── Cause potentielle : déficit de vitesse de développement de force
│   (SOURCE EXPLICITE — Vierge_7 sépare "force" de "cinétique complète (15 familles)")
│   └── cinétique (rfd*/ttpf) des 4 tests globaux + des 11 groupes segmentaires ci-dessus
│
└── Cause potentielle : dégradation/variabilité dans la répétition
    (SOURCE EXPLICITE — double rôle confirmative/explicative déjà noté)
    └── repeated_hop_mean_ct, repeated_hop_ct_drift, repeated_hop_height_cv, repeated_hop_ct_cv,
        repeated_hop_rsi_cv, repeated_hop_mean_height, repeated_hop_best_height,
        repeated_hop_mean_rsi, repeated_hop_best_rsi, repeated_hop_mean_peak_force
```

## Relations causales
| Variable | Explique quoi ? | Qualité | Mécanisme | Statut |
|---|---|---|---|---|
| `imtp_n` | Endurance | Explicatif | Déficit de force de fond globale | SOURCE EXPLICITE |
| `knee_ext_rfd100` | Endurance | Explicatif biomécanique | Déficit de vitesse de développement de force du quadriceps | SOURCE EXPLICITE |
| `repeated_hop_ct_drift` | Endurance | Explicatif (rôle double avec confirmative) | Dérive du temps de contact — dégradation neuromusculaire répétée | SOURCE EXPLICITE |

## Profils de déficit
```
ENDURANCE ↓ (repeated_hop, ≥2 des 5 KPIs de fatigue)
+ heel_raise_reps normal
→ [À VALIDER] profil de "dégradation neuromusculaire réactive répétée" sans déficit d'endurance
  musculaire locale du mollet — plausible, cohérent avec la séparation des deux tests, mais aucune
  orientation CLI### distincte pour ce sous-profil.

ENDURANCE ↓ (heel_raise_reps seul)
+ repeated_hop entièrement normal
→ [À VALIDER] — heel_raise_reps porte le statut "diagnostique local" dans la documentation, ce qui
  pourrait justifier une conclusion locale distincte, mais cette distinction n'est pas formalisée
  comme condition d'activation séparée.

ENDURANCE ↓
+ déficit de force de fond cohérent
→ orientation citant la Force comme cause possible (SOURCE EXPLICITE — CLI080, "Force" cité comme
  qualité explicative)
```

## Orientations cliniques
| Déficit | Mécanisme suspecté | Orientation clinique | Statut |
|---|---|---|---|
| ≥2 preuves diagnostiques | non précisé au-delà du diagnostic ; Force et Explosivité citées comme qualités explicatives | Améliorer la résistance à la fatigue | SOURCE EXPLICITE (`CLI080`) |
| RSI Fatigue élevé | Force insuffisante citée comme explication | Réduire la dégradation de performance | SOURCE EXPLICITE (`CLI081`) |

## Arbre de décision
```
1. Endurance déficitaire ? → ≥1 variable de fatigue déficitaire (repeated_hop ou heel_raise).
2. Convergence ? → ≥2 preuves diagnostiques.
3. Confirmatives ? → moyennes, meilleures performances, coefficients de variation.
4. Explicatives déficitaires ? → force de fond et/ou vitesse de développement de force et/ou variabilité de répétition.
5. Mécanismes compatibles ? → déficit de force sous-jacent vs dégradation neuromusculaire pure.
6. Orientation ? → CLI080 (global) ou CLI081 (dégradation de performance spécifiquement).
```

## Tableau final
| Variable | Test | Rôle | Si déficitaire, explique quoi ? | Orientation associée | Statut |
|---|---|---|---|---|---|
| `heel_raise_reps` | Heel Raise | Diagnostique | — | `CLI080` | SOURCE EXPLICITE |
| `repeated_hop_rsi_fatigue` | Repeated Hop | Diagnostique | — | `CLI081` | SOURCE EXPLICITE |
| `imtp_n` | IMTP | Explicative | Déficit de force de fond | `CLI080` (cause possible) | SOURCE EXPLICITE |
| `repeated_hop_ct_drift` | Repeated Hop | Explicative | Dérive du temps de contact | non documenté | [À VALIDER] |

---

# MATRICE TRANSVERSALE — VARIABLE → QUALITÉ(S) → RÔLE → MÉCANISME → ORIENTATION

*Un test peut apparaître pour plusieurs qualités avec des rôles et mécanismes différents dans
chacune — chaque ligne précise une seule combinaison.*

| Variable (représentative par test) | Qualité(s) | Rôle | Mécanisme explicatif | Orientation | Statut |
|---|---|---|---|---|---|
| `wblt_distance` | Mobilité | Diagnostique | — | `CLI020`/`CLI021` | SOURCE EXPLICITE |
| `wblt_distance` | Absorption | Explicative | Mobilité de cheville limitant l'absorption | non documenté | [INFERENCE] |
| `wblt_distance` | Stabilisation | Explicative | Mobilité de cheville limitant le contrôle postural | non documenté | [INFERENCE] |
| `imtp_n` | Force | Diagnostique | — | `CLI010` | SOURCE EXPLICITE |
| `imtp_nkg` | Force | Confirmative | Force relative | `CLI011` | SOURCE EXPLICITE |
| `imtp_n`/`nkg` | Puissance | Explicative | Déficit de force globale | `CLI040` (cause possible) | SOURCE EXPLICITE |
| `imtp_rfd100` | Réactivité | Explicative | Déficit de vitesse de développement de force | non documenté | [À VALIDER] |
| `imtp_rfd100` | Explosivité | Explicative | Déficit de vitesse de développement de force | non documenté | [À VALIDER] |
| `imtp_rfd100` | Absorption | Explicative | Déficit de force excentrique | `CLI060` (cause possible, générique) | SOURCE EXPLICITE (rôle) |
| `imtp_n`/`nkg` | Endurance | Explicative | Déficit de force de fond | `CLI080` (cause possible) | SOURCE EXPLICITE |
| Force segmentaire (`hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`, `hip_ext`, etc.) | Force | Explicative | Déficit local du groupe musculaire | `CLI200`-`CLI211` | SOURCE EXPLICITE |
| Force segmentaire | Puissance, Endurance | Explicative | Déficit de force globale/de fond | Qualité-niveau uniquement | SOURCE EXPLICITE |
| Force segmentaire (RFD) | Réactivité, Explosivité, Endurance | Explicative biomécanique | Déficit de vitesse de développement de force | non documenté | [À VALIDER] pour l'orientation précise |
| `hip_abd`, `hip_add`, `hip_ext`, `inv_iso`, `ev_iso`, `df_iso` (RFD partiel) | Absorption | Explicative | Déficit de force excentrique | `CLI060` (générique) | SOURCE EXPLICITE (rôle) |
| `hip_abd`, `hip_add`, `hip_ext`, `inv_iso`, `ev_iso`, `df_iso` (RFD partiel) | Stabilisation | Explicative | Déficit de force des stabilisateurs | `CLI071` (générique) | SOURCE EXPLICITE (rôle) |
| `cmj_peak_power` | Puissance | Diagnostique | — | `CLI040` | SOURCE EXPLICITE |
| `cmj_conc_rfd` | Explosivité | Diagnostique | — | `CLI030` | SOURCE EXPLICITE |
| `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd`, `cmj_braking_impulse` | Absorption | Diagnostique | — | `CLI060`/`CLI061` | SOURCE EXPLICITE |
| `cmj_braking_rfd` | Explosivité | Explicative | Capacité de freinage/décélération | non documenté | [INFERENCE] |
| Stratégie CMJ/SLCMJ (`cmj_depth`, `cmj_conc_duration`, etc.) | Puissance | Explicative biomécanique | Stratégie d'exécution du saut | non documenté | SOURCE EXPLICITE (rôle) / [À VALIDER] (orientation précise) |
| `dj_rsi`, `sldj_rsi` | Réactivité | Diagnostique | — | `CLI050` | SOURCE EXPLICITE |
| `dj_contact_time` | Réactivité | Confirmative + Explicative | Stratégie de contact | `CLI051` | SOURCE EXPLICITE |
| `dj_contact_time`, `dj_leg_stiffness`, etc. | Absorption | Confirmative + Explicative | Stratégie de freinage | `CLI060` (générique) | SOURCE EXPLICITE |
| `cmjr_mean_rsi`, `cmjr_rsi_decay` | Réactivité | Explicative uniquement (jamais diagnostique) | Dégradation sur contacts répétés | non documenté | SOURCE EXPLICITE (rôle) |
| `landing_uni_tts`, `landing_bi_tts` | Absorption | Diagnostique | — | `CLI060` | SOURCE EXPLICITE |
| `landing_uni_tts`, `landing_bi_tts` | Stabilisation | Diagnostique (fiche) | — | **aucune orientation connue** | signalé, non résolu |
| `sllt_*` (5 KPIs) | Absorption | Diagnostique | — | `CLI060`/`CLI061` | SOURCE EXPLICITE |
| `sls_*` (7 KPIs) | Stabilisation | Diagnostique + Confirmative + Explicative | Contrôle postural unipodal | `CLI070`/`CLI071` | SOURCE EXPLICITE |
| `eo_surface`, `ef_surface` | Stabilisation | Diagnostique (fiche) / confirmative (`CLI070`) | Contrôle sensoriel de l'équilibre | `CLI070` | écart de niveau documentaire signalé |
| `strobo_surface` | Stabilisation | Diagnostique + Confirmative + Explicative | Contrôle sous perturbation visuelle | `CLI070` | SOURCE EXPLICITE |
| `single_hop_distance`, `triple_hop_distance` | Puissance | Confirmative | — | `CLI040` (renfort) | SOURCE EXPLICITE |
| `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance` | Réactivité | Confirmative | — | `CLI050` (renfort) | SOURCE EXPLICITE |
| `heel_raise_reps` | Endurance | Diagnostique (local) | — | `CLI080` | SOURCE EXPLICITE |
| `repeated_hop_*` (fatigue) | Endurance | Diagnostique | — | `CLI080`/`CLI081` | SOURCE EXPLICITE |
| `profil_fv_nkg`, `profil_fv_v0` | Puissance, Réactivité, Explosivité | Explicative | Profil de force ou de vitesse insuffisant | non documenté | SOURCE EXPLICITE (rôle) / [À VALIDER] (orientation précise) |
| `sh_iso_9020/9090/3030/6060` | Force | Explicative | Déficit de force de l'épaule | `CLI211` | SOURCE EXPLICITE |
| `rs_hip_push`, `rs_knee_push`, `rs_ankle_push` | Force | Explicative | Déficit de force en contexte course | non documenté | [INFERENCE] (existence) / [À VALIDER] (mécanisme précis) |

---

# CE QUE LE MOTEUR SAIT ACTUELLEMENT FAIRE

- Poser, pour chacune des 8 qualités, une question clinique précise et distincte, jamais confondue
  avec une autre.
- Générer une hypothèse à partir d'une seule preuve diagnostique isolée, sans jamais la confondre
  avec une hypothèse réellement retenue.
- Retenir une hypothèse uniquement par convergence de preuves diagnostiques indépendantes (sauf
  Mobilité, exception documentée et assumée).
- Graduer la confiance d'une hypothèse retenue (Faible/Modérée/Forte) selon la convergence de
  preuves confirmatives puis explicatives — jamais par un score numérique.
- Rattacher un déficit de Force à un groupe musculaire précis parmi 12 (seule qualité dotée de
  cette décomposition).
- Distinguer, pour Force, Puissance et Endurance, un déficit de force absolue d'un déficit de
  vitesse de développement de force (deux mécanismes physiologiques différents, deux jeux de
  variables différents).
- Distinguer, pour Absorption, un déficit de magnitude de force (Peak Landing Force) d'un déficit
  de temps de récupération d'équilibre (Time To Stabilization) — deux mécanismes indépendants.
- Isoler un déficit de réactivité pure (contact unique) d'un déficit d'endurance réactive
  (contacts répétés) — deux qualités différentes, deux jeux de tests différents, jamais confondus.
- Produire une orientation clinique différenciée selon le profil exact du déficit pour 7 des 8
  qualités (orientation "globale" vs orientation "spécifique", chacune avec son propre
  déclencheur).

---

# CE QUE LE MOTEUR NE SAIT PAS ENCORE DÉDUIRE

- **Aucune explication du déficit de Mobilité.** Le moteur détecte le déficit mais ne peut désigner
  aucune cause.
- **Aucune règle combinatoire multi-variables formalisée.** Toutes les combinaisons présentées dans
  ce document au-delà d'une seule variable explicative (par exemple "Puissance normale en force
  mais stratégie CMJ anormale → orientation vers la technique") sont marquées [À VALIDER] — le
  moteur ne les applique pas aujourd'hui comme des règles.
- **Aucune priorisation automatique entre deux mécanismes explicatifs concurrents** pour une même
  qualité (par exemple : si à la fois la force et la stratégie biomécanique sont anormales pour
  Puissance, le moteur ne sait pas dire laquelle des deux causes est la plus probable).
- **Le mécanisme précis reliant la mobilité de cheville à un déficit d'Absorption ou de
  Stabilisation reste une inférence**, pas une phrase directement vérifiée dans la fiche de chacune
  de ces deux qualités.
- **La correspondance exacte de `cmj_braking_rfd`** (utilisée comme explicative pour Explosivité et
  diagnostique pour Absorption) reste une correspondance de nommage non confirmée mot pour mot.
- **Un déficit de Stabilisation porté uniquement par le signal Landing peut ne produire aucune
  orientation clinique** — un vide de couverture connu, pas une règle absente par erreur de
  conception.
- **Le moteur ne sait pas encore réfuter une hypothèse.** Une fois générée, une hypothèse ne peut
  être ni redescendue ni annulée par un signal contraire — seulement plafonnée dans sa progression.
- **Les tests Run-Specific (`rs_hip_push`, `rs_knee_push`, `rs_ankle_push`)** sont explicatifs pour
  Force par construction, mais aucun mécanisme clinique précis au-delà de "contexte spécifique à la
  course" n'est documenté pour eux.

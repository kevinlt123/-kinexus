# Cartographie exhaustive des variables — Moteur HYP###

Listes complètes, noms exacts Kinexus (`test_kpi`), sans regroupement conceptuel. Pour chaque
qualité : variables diagnostiques, confirmatives, explicatives. En fin de document : cartographie
VARIABLE → QUALITÉ → RÔLE.

---

# MOBILITÉ

## Variables diagnostiques
| Variable Kinexus | Test |
|---|---|
| `wblt_distance` | WBLT |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `wblt_distance` (LSI calculé sur la même mesure) | WBLT |

## Variables explicatives
Aucune.

---

# FORCE

## Variables diagnostiques
| Variable Kinexus | Test |
|---|---|
| `imtp_n` | IMTP |
| `slimtp_n` | SLIMTP |
| `iso_belt_squat_n` | Iso Belt Squat |
| `sl_iso_push_n` | SL Iso Push |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `imtp_nkg` | IMTP |
| `slimtp_nkg` | SLIMTP |
| `iso_belt_squat_nkg` | Iso Belt Squat |
| `sl_iso_push_nkg` | SL Iso Push |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `knee_ext` | `knee_ext_n`, `knee_ext_nkg`, `knee_ext_rfd50`, `knee_ext_rfd100`, `knee_ext_rfd150`, `knee_ext_rfd200`, `knee_ext_ttpf` |
| `knee_flex` | `knee_flex_n`, `knee_flex_nkg`, `knee_flex_rfd50`, `knee_flex_rfd100`, `knee_flex_rfd150`, `knee_flex_rfd200`, `knee_flex_ttpf` |
| `soleus_iso` | `soleus_iso_n`, `soleus_iso_nkg`, `soleus_iso_rfd50`, `soleus_iso_rfd100`, `soleus_iso_rfd150`, `soleus_iso_rfd200`, `soleus_iso_ttpf` |
| `gastro_iso` | `gastro_iso_n`, `gastro_iso_nkg`, `gastro_iso_rfd50`, `gastro_iso_rfd100`, `gastro_iso_rfd150`, `gastro_iso_rfd200`, `gastro_iso_ttpf` |
| `hip_flex` | `hip_flex_n`, `hip_flex_nkg`, `hip_flex_rfd50`, `hip_flex_rfd100`, `hip_flex_rfd150`, `hip_flex_rfd200`, `hip_flex_ttpf` |
| `hip_ext` | `hip_ext_n`, `hip_ext_nkg`, `hip_ext_rfd50`, `hip_ext_rfd100`, `hip_ext_rfd150`, `hip_ext_rfd200`, `hip_ext_ttpf` |
| `hip_abd` | `hip_abd_n`, `hip_abd_nkg`, `hip_abd_rfd50`, `hip_abd_rfd100`, `hip_abd_rfd150`, `hip_abd_rfd200`, `hip_abd_ttpf` |
| `hip_add` | `hip_add_n`, `hip_add_nkg`, `hip_add_rfd50`, `hip_add_rfd100`, `hip_add_rfd150`, `hip_add_rfd200`, `hip_add_ttpf` |
| `df_iso` | `df_iso_n`, `df_iso_nkg`, `df_iso_rfd50`, `df_iso_rfd100`, `df_iso_rfd150`, `df_iso_rfd200`, `df_iso_ttpf` |
| `inv_iso` | `inv_iso_n`, `inv_iso_nkg`, `inv_iso_rfd50`, `inv_iso_rfd100`, `inv_iso_rfd150`, `inv_iso_rfd200`, `inv_iso_ttpf` |
| `ev_iso` | `ev_iso_n`, `ev_iso_nkg`, `ev_iso_rfd50`, `ev_iso_rfd100`, `ev_iso_rfd150`, `ev_iso_rfd200`, `ev_iso_ttpf` |
| `sh_iso_9020` | `sh_iso_9020_n`, `sh_iso_9020_nkg`, `sh_iso_9020_rfd100`, `sh_iso_9020_rfd200`, `sh_iso_9020_ttpf` |
| `sh_iso_9090` | `sh_iso_9090_n`, `sh_iso_9090_nkg`, `sh_iso_9090_rfd100`, `sh_iso_9090_rfd200`, `sh_iso_9090_ttpf` |
| `sh_iso_3030` | `sh_iso_3030_n`, `sh_iso_3030_nkg`, `sh_iso_3030_rfd100`, `sh_iso_3030_rfd200`, `sh_iso_3030_ttpf` |
| `sh_iso_6060` | `sh_iso_6060_n`, `sh_iso_6060_nkg`, `sh_iso_6060_rfd100`, `sh_iso_6060_rfd200`, `sh_iso_6060_ttpf` |
| `imtp` (cinétique, en plus de `n`/diagnostique) | `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` |
| `slimtp` (cinétique) | `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` |
| `iso_belt_squat` (cinétique) | `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` |
| `sl_iso_push` (cinétique) | `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` |
| `rs_hip_push` | `rs_hip_push_n`, `rs_hip_push_nkg`, `rs_hip_push_rfd100`, `rs_hip_push_rfd200`, `rs_hip_push_ttpf` |
| `rs_knee_push` | `rs_knee_push_n`, `rs_knee_push_nkg`, `rs_knee_push_rfd100`, `rs_knee_push_rfd200`, `rs_knee_push_ttpf` |
| `rs_ankle_push` | `rs_ankle_push_n`, `rs_ankle_push_nkg`, `rs_ankle_push_rfd100`, `rs_ankle_push_rfd200`, `rs_ankle_push_ttpf` |

---

# PUISSANCE

## Variables diagnostiques
| Variable Kinexus | Test | Rôle exact |
|---|---|---|
| `cmj_peak_power` | CMJ | Diagnostique principal |
| `slcmj_peak_power` | SLCMJ | Diagnostique principal unilatéral |
| `dj_peak_prop_power` | Drop Jump | Diagnostique secondaire (suppléance si CMJ/SLCMJ indisponibles) |
| `sldj_peak_prop_power` | SLDJ | Diagnostique secondaire |
| `cmjr_peak_power` | CMJ Rebound | Diagnostique secondaire |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `cmj_height` | CMJ |
| `single_hop_distance` | Single Hop |
| `triple_hop_distance` | Triple Hop |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `imtp` | `imtp_n`, `imtp_nkg`, `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` |
| `slimtp` | `slimtp_n`, `slimtp_nkg`, `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` |
| `profil_fv` | `profil_fv_nkg`, `profil_fv_v0` |
| `knee_ext` | `knee_ext_n`, `knee_ext_nkg` |
| `knee_flex` | `knee_flex_n`, `knee_flex_nkg` |
| `soleus_iso` | `soleus_iso_n`, `soleus_iso_nkg` |
| `gastro_iso` | `gastro_iso_n`, `gastro_iso_nkg` |
| `hip_flex` | `hip_flex_n`, `hip_flex_nkg` |
| `hip_ext` | `hip_ext_n`, `hip_ext_nkg` |
| `hip_abd` | `hip_abd_n`, `hip_abd_nkg` |
| `hip_add` | `hip_add_n`, `hip_add_nkg` |
| `sl_iso_push` | `sl_iso_push_n`, `sl_iso_push_nkg` |
| `iso_belt_squat` | `iso_belt_squat_n`, `iso_belt_squat_nkg` |
| `iso_squat_hold` | `iso_squat_hold_n`, `iso_squat_hold_nkg` |
| `cmj` (stratégie) | `cmj_peak_vel`, `cmj_tto`, `cmj_depth`, `cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_conc_displacement`, `cmj_braking_duration`, `cmj_propulsion_eff`, `cmj_braking_eff`, `cmj_ft_ct_ratio`, `cmj_ecc_decel`, `cmj_landing_rfd`, `cmj_landing_mean_power` |
| `slcmj` (stratégie) | `slcmj_rsi_mod`, `slcmj_peak_conc_force`, `slcmj_peak_conc_vel`, `slcmj_edrfd_bm`, `slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_depth`, `slcmj_contraction_time`, `slcmj_ecc_duration`, `slcmj_conc_duration`, `slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab` |

---

# RÉACTIVITÉ

## Variables diagnostiques
| Variable Kinexus | Test | Rôle exact |
|---|---|---|
| `dj_rsi` | Drop Jump | Diagnostique principal |
| `sldj_rsi` | SLDJ | Diagnostique principal unilatéral |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `dj_contact_time` | Drop Jump |
| `dj_peak_prop_force` | Drop Jump |
| `dj_peak_prop_power` | Drop Jump |
| `dj_leg_stiffness` | Drop Jump |
| `dj_height` | Drop Jump |
| `dj_landing_impulse` | Drop Jump |
| `dj_peak_landing_force` | Drop Jump |
| `sldj_contact_time` | SLDJ |
| `sldj_peak_prop_force` | SLDJ |
| `sldj_peak_prop_power` | SLDJ |
| `sldj_leg_stiffness` | SLDJ |
| `sldj_height` | SLDJ |
| `sldj_landing_impulse` | SLDJ |
| `sldj_peak_landing_force` | SLDJ |
| `single_hop_distance` | Single Hop |
| `triple_hop_distance` | Triple Hop |
| `crossover_hop_distance` | Crossover Hop |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `imtp` | `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` |
| `slimtp` | `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` |
| `iso_belt_squat` | `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` |
| `sl_iso_push` | `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` |
| `iso_squat_hold` | `iso_squat_hold_rfd100`, `iso_squat_hold_rfd200`, `iso_squat_hold_ttpf` |
| `knee_ext` | `knee_ext_rfd50`, `knee_ext_rfd100`, `knee_ext_rfd150`, `knee_ext_rfd200`, `knee_ext_ttpf` |
| `knee_flex` | `knee_flex_rfd50`, `knee_flex_rfd100`, `knee_flex_rfd150`, `knee_flex_rfd200`, `knee_flex_ttpf` |
| `soleus_iso` | `soleus_iso_rfd50`, `soleus_iso_rfd100`, `soleus_iso_rfd150`, `soleus_iso_rfd200`, `soleus_iso_ttpf` |
| `gastro_iso` | `gastro_iso_rfd50`, `gastro_iso_rfd100`, `gastro_iso_rfd150`, `gastro_iso_rfd200`, `gastro_iso_ttpf` |
| `hip_flex` | `hip_flex_rfd50`, `hip_flex_rfd100`, `hip_flex_rfd150`, `hip_flex_rfd200`, `hip_flex_ttpf` |
| `hip_ext` | `hip_ext_rfd50`, `hip_ext_rfd100`, `hip_ext_rfd150`, `hip_ext_rfd200`, `hip_ext_ttpf` |
| `hip_abd` | `hip_abd_rfd50`, `hip_abd_rfd100`, `hip_abd_rfd150`, `hip_abd_rfd200`, `hip_abd_ttpf` |
| `hip_add` | `hip_add_rfd50`, `hip_add_rfd100`, `hip_add_rfd150`, `hip_add_rfd200`, `hip_add_ttpf` |
| `df_iso` | `df_iso_rfd50`, `df_iso_rfd100`, `df_iso_rfd150`, `df_iso_rfd200`, `df_iso_ttpf` |
| `inv_iso` | `inv_iso_rfd50`, `inv_iso_rfd100`, `inv_iso_rfd150`, `inv_iso_rfd200`, `inv_iso_ttpf` |
| `ev_iso` | `ev_iso_rfd50`, `ev_iso_rfd100`, `ev_iso_rfd150`, `ev_iso_rfd200`, `ev_iso_ttpf` |
| `profil_fv` | `profil_fv_nkg`, `profil_fv_v0` |
| `dj` (biomécanique — double rôle avec confirmative) | `dj_contact_time`, `dj_leg_stiffness`, `dj_peak_landing_force`, `dj_landing_impulse`, `dj_peak_prop_force`, `dj_peak_prop_power` |
| `sldj` (double rôle) | `sldj_contact_time`, `sldj_leg_stiffness`, `sldj_peak_landing_force`, `sldj_landing_impulse`, `sldj_peak_prop_force`, `sldj_peak_prop_power` |
| `cmjr` (entièrement explicatif, jamais diagnostique) | `cmjr_mean_ct`, `cmjr_mean_stiffness`, `cmjr_mean_rebound_height`, `cmjr_mean_rsi`, `cmjr_rsi_decay`, `cmjr_stiffness_decay` |

---

# EXPLOSIVITÉ

## Variables diagnostiques
| Variable Kinexus | Test |
|---|---|
| `cmj_conc_rfd` | CMJ |
| `cmj_conc_impulse_100` | CMJ |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `cmj_peak_power` | CMJ |
| `cmj_conc_peak_force` | CMJ |
| `cmj_conc_mean_force` | CMJ |
| `cmj_conc_impulse` | CMJ |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `imtp` | `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` |
| `slimtp` | `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` |
| `iso_belt_squat` | `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` |
| `sl_iso_push` | `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` |
| `iso_squat_hold` | `iso_squat_hold_rfd100`, `iso_squat_hold_rfd200`, `iso_squat_hold_ttpf` |
| `knee_ext` | `knee_ext_rfd50`, `knee_ext_rfd100`, `knee_ext_rfd150`, `knee_ext_rfd200`, `knee_ext_ttpf` |
| `knee_flex` | `knee_flex_rfd50`, `knee_flex_rfd100`, `knee_flex_rfd150`, `knee_flex_rfd200`, `knee_flex_ttpf` |
| `soleus_iso` | `soleus_iso_rfd50`, `soleus_iso_rfd100`, `soleus_iso_rfd150`, `soleus_iso_rfd200`, `soleus_iso_ttpf` |
| `gastro_iso` | `gastro_iso_rfd50`, `gastro_iso_rfd100`, `gastro_iso_rfd150`, `gastro_iso_rfd200`, `gastro_iso_ttpf` |
| `hip_flex` | `hip_flex_rfd50`, `hip_flex_rfd100`, `hip_flex_rfd150`, `hip_flex_rfd200`, `hip_flex_ttpf` |
| `hip_ext` | `hip_ext_rfd50`, `hip_ext_rfd100`, `hip_ext_rfd150`, `hip_ext_rfd200`, `hip_ext_ttpf` |
| `hip_abd` | `hip_abd_rfd50`, `hip_abd_rfd100`, `hip_abd_rfd150`, `hip_abd_rfd200`, `hip_abd_ttpf` |
| `hip_add` | `hip_add_rfd50`, `hip_add_rfd100`, `hip_add_rfd150`, `hip_add_rfd200`, `hip_add_ttpf` |
| `df_iso` | `df_iso_rfd50`, `df_iso_rfd100`, `df_iso_rfd150`, `df_iso_rfd200`, `df_iso_ttpf` |
| `inv_iso` | `inv_iso_rfd50`, `inv_iso_rfd100`, `inv_iso_rfd150`, `inv_iso_rfd200`, `inv_iso_ttpf` |
| `ev_iso` | `ev_iso_rfd50`, `ev_iso_rfd100`, `ev_iso_rfd150`, `ev_iso_rfd200`, `ev_iso_ttpf` |
| `profil_fv` | `profil_fv_nkg`, `profil_fv_v0` |
| `cmj` (biomécanique) | `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd` |

---

# ABSORPTION

## Variables diagnostiques
| Variable Kinexus | Test |
|---|---|
| `landing_uni_tts` | Landing Unilatéral |
| `landing_bi_tts` | Land and Hold (bilatéral) |
| `sllt_peak_landing_force` | SLLT |
| `sllt_ttplf` | SLLT |
| `sllt_loading_rate` | SLLT |
| `sllt_tts` | SLLT |
| `sllt_cop_path` | SLLT |
| `cmj_ecc_mean_power` | CMJ |
| `cmj_ecc_peak_vel` | CMJ |
| `cmj_braking_rfd` | CMJ |
| `cmj_braking_impulse` | CMJ |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `landing_bi_peak_landing_force` | Land and Hold (bilatéral) |
| `cmj_depth` | CMJ |
| `cmj_conc_duration` | CMJ |
| `cmj_rsi_mod` | CMJ |
| `cmj_conc_peak_force` | CMJ |
| `cmj_conc_mean_force` | CMJ |
| `cmj_landing_impulse` | CMJ |
| `dj_contact_time` | Drop Jump |
| `dj_landing_impulse` | Drop Jump |
| `dj_peak_landing_force` | Drop Jump |
| `sldj_contact_time` | SLDJ |
| `sldj_landing_impulse` | SLDJ |
| `sldj_peak_landing_force` | SLDJ |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `imtp` | `imtp_rfd100`, `imtp_rfd200` |
| `slimtp` | `slimtp_rfd100`, `slimtp_rfd200` |
| `iso_belt_squat` | `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200` |
| `sl_iso_push` | `sl_iso_push_rfd100`, `sl_iso_push_rfd200` |
| `knee_ext` | `knee_ext_rfd100`, `knee_ext_rfd150`, `knee_ext_rfd200` |
| `soleus_iso` | `soleus_iso_rfd100`, `soleus_iso_rfd200` |
| `gastro_iso` | `gastro_iso_rfd100`, `gastro_iso_rfd200` |
| `hip_abd` | `hip_abd_rfd100` |
| `hip_add` | `hip_add_rfd100` |
| `hip_ext` | `hip_ext_rfd100` |
| `hip_flex` | `hip_flex_rfd100` |
| `wblt` | `wblt_distance` |
| `cmj` (biomécanique) | `cmj_braking_duration` |
| `dj` (biomécanique, double rôle) | `dj_contact_time`, `dj_leg_stiffness`, `dj_peak_landing_force`, `dj_landing_impulse`, `dj_peak_prop_force`, `dj_peak_prop_power` |
| `sldj` (double rôle) | `sldj_contact_time`, `sldj_leg_stiffness`, `sldj_peak_landing_force`, `sldj_landing_impulse`, `sldj_peak_prop_force`, `sldj_peak_prop_power` |

---

# STABILISATION

## Variables diagnostiques
| Variable Kinexus | Test |
|---|---|
| `sls_ttf` | Single Leg Stand |
| `sls_cop_path` | Single Leg Stand |
| `sls_cop_vel` | Single Leg Stand |
| `sls_ellipse_area` | Single Leg Stand |
| `sls_cop_range_ml` | Single Leg Stand |
| `sls_cop_range_ap` | Single Leg Stand |
| `sls_mean_velocity` | Single Leg Stand |
| `eo_surface` | Eyes Open |
| `ef_surface` | Eyes Closed |
| `strobo_surface` | Strobo |
| `landing_uni_tts` | Landing Unilatéral |
| `landing_bi_tts` | Land and Hold (bilatéral) |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity` | Single Leg Stand (double rôle) |
| `strobo_surface` | Strobo (double rôle) |
| `landing_uni_tts`, `landing_bi_tts` | Landing (double rôle) |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `hip_abd` | `hip_abd_rfd100`, `hip_abd_rfd200` |
| `hip_ext` | `hip_ext_rfd100`, `hip_ext_rfd200` |
| `hip_add` | `hip_add_rfd100` |
| `inv_iso` | `inv_iso_rfd100` |
| `ev_iso` | `ev_iso_rfd100` |
| `df_iso` | `df_iso_rfd100` |
| `wblt` | `wblt_distance` |
| `sls` (biomécanique, double rôle) | `sls_cop_path`, `sls_cop_vel`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_ellipse_area`, `sls_mean_velocity` |
| `strobo`/`landing` (biomécanique, triple rôle) | `strobo_surface`, `landing_uni_tts`, `landing_bi_tts` |

---

# ENDURANCE

## Variables diagnostiques
| Variable Kinexus | Test |
|---|---|
| `heel_raise_reps` | Heel Raise |
| `repeated_hop_n_hops` | Repeated Hop |
| `repeated_hop_rsi_fatigue` | Repeated Hop |
| `repeated_hop_height_fatigue` | Repeated Hop |
| `repeated_hop_ct_drift` | Repeated Hop |
| `repeated_hop_stiffness_fatigue` | Repeated Hop |

## Variables confirmatives
| Variable Kinexus | Test |
|---|---|
| `repeated_hop_mean_height` | Repeated Hop |
| `repeated_hop_mean_rsi` | Repeated Hop |
| `repeated_hop_mean_peak_force` | Repeated Hop |
| `repeated_hop_mean_ct` | Repeated Hop |
| `repeated_hop_best_height` | Repeated Hop |
| `repeated_hop_best_rsi` | Repeated Hop |
| `repeated_hop_height_cv` | Repeated Hop |
| `repeated_hop_ct_cv` | Repeated Hop |
| `repeated_hop_rsi_cv` | Repeated Hop |

## Variables explicatives
| Test | Variables Kinexus (KPI) |
|---|---|
| `imtp` | `imtp_n`, `imtp_nkg` |
| `slimtp` | `slimtp_n`, `slimtp_nkg` |
| `iso_belt_squat` | `iso_belt_squat_n`, `iso_belt_squat_nkg` |
| `sl_iso_push` | `sl_iso_push_n`, `sl_iso_push_nkg` |
| `knee_ext` | `knee_ext_n`, `knee_ext_nkg` |
| `knee_flex` | `knee_flex_n`, `knee_flex_nkg` |
| `soleus_iso` | `soleus_iso_n`, `soleus_iso_nkg` |
| `gastro_iso` | `gastro_iso_n`, `gastro_iso_nkg` |
| `hip_flex` | `hip_flex_n`, `hip_flex_nkg` |
| `hip_ext` | `hip_ext_n`, `hip_ext_nkg` |
| `hip_abd` | `hip_abd_n`, `hip_abd_nkg` |
| `hip_add` | `hip_add_n`, `hip_add_nkg` |
| `df_iso` | `df_iso_n`, `df_iso_nkg` |
| `inv_iso` | `inv_iso_n`, `inv_iso_nkg` |
| `ev_iso` | `ev_iso_n`, `ev_iso_nkg` |
| `imtp`/`slimtp`/`iso_belt_squat`/`sl_iso_push` (cinétique) | `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf`, `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf`, `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf`, `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` |
| `knee_ext`/`knee_flex`/`soleus_iso`/`gastro_iso`/`hip_flex`/`hip_ext`/`hip_abd`/`hip_add`/`df_iso`/`inv_iso`/`ev_iso` (cinétique) | `knee_ext_rfd50/rfd100/rfd150/rfd200/ttpf`, `knee_flex_rfd50/rfd100/rfd150/rfd200/ttpf`, `soleus_iso_rfd50/rfd100/rfd150/rfd200/ttpf`, `gastro_iso_rfd50/rfd100/rfd150/rfd200/ttpf`, `hip_flex_rfd50/rfd100/rfd150/rfd200/ttpf`, `hip_ext_rfd50/rfd100/rfd150/rfd200/ttpf`, `hip_abd_rfd50/rfd100/rfd150/rfd200/ttpf`, `hip_add_rfd50/rfd100/rfd150/rfd200/ttpf`, `df_iso_rfd50/rfd100/rfd150/rfd200/ttpf`, `inv_iso_rfd50/rfd100/rfd150/rfd200/ttpf`, `ev_iso_rfd50/rfd100/rfd150/rfd200/ttpf` |
| `repeated_hop` (biomécanique, double rôle) | `repeated_hop_mean_ct`, `repeated_hop_ct_drift`, `repeated_hop_height_cv`, `repeated_hop_ct_cv`, `repeated_hop_rsi_cv`, `repeated_hop_mean_height`, `repeated_hop_best_height`, `repeated_hop_mean_rsi`, `repeated_hop_best_rsi`, `repeated_hop_mean_peak_force` |

---

# CARTOGRAPHIE — VARIABLE → QUALITÉ → RÔLE

*Organisée par test source. Chaque ligne = une variable, une qualité, un rôle. Les variables non
listées ici n'influencent aucune des 8 qualités actives.*

## WBLT
| Variable | Qualité | Rôle |
|---|---|---|
| `wblt_distance` | Mobilité | Diagnostique |
| `wblt_distance` (LSI) | Mobilité | Confirmative |
| `wblt_distance` | Absorption | Explicative |
| `wblt_distance` | Stabilisation | Explicative |

## IMTP
| Variable | Qualité | Rôle |
|---|---|---|
| `imtp_n` | Force | Diagnostique |
| `imtp_nkg` | Force | Confirmative |
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | Force | Explicative |
| `imtp_n`, `imtp_nkg` | Puissance | Explicative |
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | Puissance | Explicative |
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | Réactivité | Explicative |
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | Explosivité | Explicative |
| `imtp_rfd100`, `imtp_rfd200` | Absorption | Explicative |
| `imtp_n`, `imtp_nkg` | Endurance | Explicative |
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | Endurance | Explicative |

## SLIMTP
| Variable | Qualité | Rôle |
|---|---|---|
| `slimtp_n` | Force | Diagnostique |
| `slimtp_nkg` | Force | Confirmative |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | Force | Explicative |
| `slimtp_n`, `slimtp_nkg` | Puissance | Explicative |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | Puissance | Explicative |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | Réactivité | Explicative |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | Explosivité | Explicative |
| `slimtp_rfd100`, `slimtp_rfd200` | Absorption | Explicative |
| `slimtp_n`, `slimtp_nkg` | Endurance | Explicative |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | Endurance | Explicative |

## Iso Belt Squat
| Variable | Qualité | Rôle |
|---|---|---|
| `iso_belt_squat_n` | Force | Diagnostique |
| `iso_belt_squat_nkg` | Force | Confirmative |
| `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` | Force | Explicative |
| `iso_belt_squat_n`, `iso_belt_squat_nkg` | Puissance | Explicative |
| `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` | Réactivité | Explicative |
| `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` | Explosivité | Explicative |
| `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200` | Absorption | Explicative |
| `iso_belt_squat_n`, `iso_belt_squat_nkg` | Endurance | Explicative |
| `iso_belt_squat_rfd100`, `iso_belt_squat_rfd200`, `iso_belt_squat_ttpf` | Endurance | Explicative |

## SL Iso Push
| Variable | Qualité | Rôle |
|---|---|---|
| `sl_iso_push_n` | Force | Diagnostique |
| `sl_iso_push_nkg` | Force | Confirmative |
| `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` | Force | Explicative |
| `sl_iso_push_n`, `sl_iso_push_nkg` | Puissance | Explicative |
| `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` | Réactivité | Explicative |
| `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` | Explosivité | Explicative |
| `sl_iso_push_rfd100`, `sl_iso_push_rfd200` | Absorption | Explicative |
| `sl_iso_push_n`, `sl_iso_push_nkg` | Endurance | Explicative |
| `sl_iso_push_rfd100`, `sl_iso_push_rfd200`, `sl_iso_push_ttpf` | Endurance | Explicative |

## Iso Squat Hold
| Variable | Qualité | Rôle |
|---|---|---|
| `iso_squat_hold_n`, `iso_squat_hold_nkg` | Puissance | Explicative |
| `iso_squat_hold_rfd100`, `iso_squat_hold_rfd200`, `iso_squat_hold_ttpf` | Réactivité | Explicative |
| `iso_squat_hold_rfd100`, `iso_squat_hold_rfd200`, `iso_squat_hold_ttpf` | Explosivité | Explicative |

## Force segmentaire (knee_ext, knee_flex, soleus_iso, gastro_iso, hip_flex, hip_ext, hip_abd, hip_add, df_iso, inv_iso, ev_iso)
| Variable | Qualité | Rôle |
|---|---|---|
| `<test>_n`, `<test>_nkg`, `<test>_rfd50`, `<test>_rfd100`, `<test>_rfd150`, `<test>_rfd200`, `<test>_ttpf` | Force | Explicative |
| `<test>_n`, `<test>_nkg` | Puissance | Explicative |
| `<test>_rfd50`, `<test>_rfd100`, `<test>_rfd150`, `<test>_rfd200`, `<test>_ttpf` | Réactivité | Explicative |
| `<test>_rfd50`, `<test>_rfd100`, `<test>_rfd150`, `<test>_rfd200`, `<test>_ttpf` | Explosivité | Explicative |
| `<test>_n`, `<test>_nkg` | Endurance | Explicative |
| `<test>_rfd50`, `<test>_rfd100`, `<test>_rfd150`, `<test>_rfd200`, `<test>_ttpf` | Endurance | Explicative |
| `hip_abd_rfd100`, `hip_add_rfd100`, `hip_ext_rfd100`, `hip_flex_rfd100`, `knee_ext_rfd100`, `knee_ext_rfd150`, `knee_ext_rfd200`, `soleus_iso_rfd100`, `soleus_iso_rfd200`, `gastro_iso_rfd100`, `gastro_iso_rfd200` | Absorption | Explicative |
| `hip_abd_rfd100`, `hip_abd_rfd200`, `hip_ext_rfd100`, `hip_ext_rfd200`, `hip_add_rfd100`, `inv_iso_rfd100`, `ev_iso_rfd100`, `df_iso_rfd100` | Stabilisation | Explicative |

## Épaule (sh_iso_9020, sh_iso_9090, sh_iso_3030, sh_iso_6060)
| Variable | Qualité | Rôle |
|---|---|---|
| `sh_iso_9020_n`/`nkg`/`rfd100`/`rfd200`/`ttpf`, idem `9090`/`3030`/`6060` | Force | Explicative (seule qualité concernée) |

## CMJ / SLCMJ
| Variable | Qualité | Rôle |
|---|---|---|
| `cmj_peak_power`, `slcmj_peak_power` | Puissance | Diagnostique |
| `cmj_height` | Puissance | Confirmative |
| `cmj_peak_vel`, `cmj_tto`, `cmj_depth`, `cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_conc_displacement`, `cmj_braking_duration`, `cmj_propulsion_eff`, `cmj_braking_eff`, `cmj_ft_ct_ratio`, `cmj_ecc_decel`, `cmj_landing_rfd`, `cmj_landing_mean_power` | Puissance | Explicative |
| `slcmj_rsi_mod`, `slcmj_peak_conc_force`, `slcmj_peak_conc_vel`, `slcmj_edrfd_bm`, `slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_depth`, `slcmj_contraction_time`, `slcmj_ecc_duration`, `slcmj_conc_duration`, `slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab` | Puissance | Explicative |
| `cmj_conc_rfd`, `cmj_conc_impulse_100` | Explosivité | Diagnostique |
| `cmj_peak_power`, `cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_conc_impulse` | Explosivité | Confirmative |
| `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd` | Explosivité | Explicative |
| `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd`, `cmj_braking_impulse` | Absorption | Diagnostique |
| `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_conc_peak_force`, `cmj_conc_mean_force`, `cmj_landing_impulse` | Absorption | Confirmative |
| `cmj_braking_duration` | Absorption | Explicative |

## Drop Jump / SLDJ
| Variable | Qualité | Rôle |
|---|---|---|
| `dj_rsi`, `sldj_rsi` | Réactivité | Diagnostique |
| `dj_contact_time`, `dj_peak_prop_force`, `dj_peak_prop_power`, `dj_leg_stiffness`, `dj_height`, `dj_landing_impulse`, `dj_peak_landing_force`, `sldj_contact_time`, `sldj_peak_prop_force`, `sldj_peak_prop_power`, `sldj_leg_stiffness`, `sldj_height`, `sldj_landing_impulse`, `sldj_peak_landing_force` | Réactivité | Confirmative |
| `dj_contact_time`, `dj_leg_stiffness`, `dj_peak_landing_force`, `dj_landing_impulse`, `dj_peak_prop_force`, `dj_peak_prop_power`, `sldj_contact_time`, `sldj_leg_stiffness`, `sldj_peak_landing_force`, `sldj_landing_impulse`, `sldj_peak_prop_force`, `sldj_peak_prop_power` | Réactivité | Explicative |
| `dj_peak_prop_power`, `sldj_peak_prop_power` | Puissance | Diagnostique secondaire |
| `dj_contact_time`, `dj_landing_impulse`, `dj_peak_landing_force`, `sldj_contact_time`, `sldj_landing_impulse`, `sldj_peak_landing_force` | Absorption | Confirmative |
| `dj_contact_time`, `dj_leg_stiffness`, `dj_peak_landing_force`, `dj_landing_impulse`, `dj_peak_prop_force`, `dj_peak_prop_power`, `sldj_contact_time`, `sldj_leg_stiffness`, `sldj_peak_landing_force`, `sldj_landing_impulse`, `sldj_peak_prop_force`, `sldj_peak_prop_power` | Absorption | Explicative |

## CMJ Rebound
| Variable | Qualité | Rôle |
|---|---|---|
| `cmjr_peak_power` | Puissance | Diagnostique secondaire |
| `cmjr_mean_ct`, `cmjr_mean_stiffness`, `cmjr_mean_rebound_height`, `cmjr_mean_rsi`, `cmjr_rsi_decay`, `cmjr_stiffness_decay` | Réactivité | Explicative (jamais diagnostique) |

## Landing (uni / bi) / SLLT
| Variable | Qualité | Rôle |
|---|---|---|
| `landing_uni_tts`, `landing_bi_tts` | Absorption | Diagnostique |
| `sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`, `sllt_cop_path` | Absorption | Diagnostique |
| `landing_bi_peak_landing_force` | Absorption | Confirmative |
| `landing_uni_tts`, `landing_bi_tts` | Stabilisation | Diagnostique + Confirmative (double rôle) |

## Single Leg Stand / EO / EF / Strobo
| Variable | Qualité | Rôle |
|---|---|---|
| `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity` | Stabilisation | Diagnostique + Confirmative + Explicative (triple rôle) |
| `eo_surface` | Stabilisation | Diagnostique |
| `ef_surface` | Stabilisation | Diagnostique |
| `strobo_surface` | Stabilisation | Diagnostique + Confirmative + Explicative (triple rôle) |

## Hop tests (Single/Triple/Crossover Hop)
| Variable | Qualité | Rôle |
|---|---|---|
| `single_hop_distance`, `triple_hop_distance` | Puissance | Confirmative |
| `single_hop_distance`, `triple_hop_distance`, `crossover_hop_distance` | Réactivité | Confirmative |

## Heel Raise / Repeated Hop
| Variable | Qualité | Rôle |
|---|---|---|
| `heel_raise_reps` | Endurance | Diagnostique |
| `repeated_hop_n_hops`, `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`, `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue` | Endurance | Diagnostique |
| `repeated_hop_mean_height`, `repeated_hop_mean_rsi`, `repeated_hop_mean_peak_force`, `repeated_hop_mean_ct`, `repeated_hop_best_height`, `repeated_hop_best_rsi`, `repeated_hop_height_cv`, `repeated_hop_ct_cv`, `repeated_hop_rsi_cv` | Endurance | Confirmative |
| `repeated_hop_mean_ct`, `repeated_hop_ct_drift`, `repeated_hop_height_cv`, `repeated_hop_ct_cv`, `repeated_hop_rsi_cv`, `repeated_hop_mean_height`, `repeated_hop_best_height`, `repeated_hop_mean_rsi`, `repeated_hop_best_rsi`, `repeated_hop_mean_peak_force` | Endurance | Explicative (double rôle avec confirmative) |

## Profil Force-Vitesse
| Variable | Qualité | Rôle |
|---|---|---|
| `profil_fv_nkg`, `profil_fv_v0` | Puissance | Explicative |
| `profil_fv_nkg`, `profil_fv_v0` | Réactivité | Explicative |
| `profil_fv_nkg`, `profil_fv_v0` | Explosivité | Explicative |

## Run-Specific (rs_hip_push, rs_knee_push, rs_ankle_push)
| Variable | Qualité | Rôle |
|---|---|---|
| `rs_hip_push_n`/`nkg`/`rfd100`/`rfd200`/`ttpf`, `rs_knee_push_*`, `rs_ankle_push_*` | Force | Explicative (seule qualité concernée) |

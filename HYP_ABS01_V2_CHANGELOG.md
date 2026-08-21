# Changelog — HYP-ABS-01 V1 → V2

**Statut** : document de traçabilité. Aucun code modifié. `HYP-ABS-01_V2.md` remplace la fiche V1 en
tant que source de vérité clinique ; ce changelog documente précisément ce qui change.

---

## 1. Ce qui change par rapport à V1

- Introduction de 4 niveaux de raisonnement (Diagnostic global → Sous-domaine → Variables → Tests),
  absents de V1.
- Introduction de 7 sous-domaines organisés (A-G), remplaçant la liste plate diagnostique/
  confirmative/explicative de V1.
- Le Niveau 1 (diagnostic global) n'est plus une lecture plate du seuil `CLI060` ("2 preuves parmi
  10") — il devient hiérarchisé, avec le sous-domaine A (Core) prioritaire sur les autres.
- Intégration de `cmj_force_zero_vel` au diagnostic Core — absente de tout rôle HYP### en V1.
- Intégration de `dj_rsi`/`dj_contact_time` au sous-domaine D (Absorption réactive) — absents de
  toute utilisation en V1 pour `dj_rsi` (explicitement exclu).
- `landing_uni_tts`/`landing_bi_tts` retirés du diagnostic Absorption (voir point 5).

## 2. Ce qui est supprimé

- **Rien n'est supprimé au sens de "rendu inaccessible"** — aucune variable n'est retirée du code, du
  catalogue de tests, ni de `TFM`/`CLI###` (inchangés). Ce qui change, c'est le **rôle clinique**
  attribué à certaines variables dans la fiche HYP elle-même :
  - `landing_uni_tts`/`landing_bi_tts` : retirés du diagnostic **Absorption** (restent diagnostiques
    de Stabilisation).
  - Le statut diagnostique de `cmj_ecc_mean_power`/`cmj_ecc_peak_vel` est retiré (voir point 3).

## 3. Ce qui devient explicatif (était diagnostique en V1)

| Variable | V1 | V2 |
|---|---|---|
| `cmj_ecc_mean_power` | 🔴 Diagnostique | 🟢 Explicative (sous-domaine B) |
| `cmj_ecc_peak_vel` | 🔴 Diagnostique | 🟢 Explicative (sous-domaine B) |

Conséquence directe du principe "Absorption ≠ capacité excentrique" (§1 de `HYP-ABS-01_V2.md`) : ces
deux variables ne peuvent plus, seules, faire basculer le Niveau 1 vers "Déficitaire".

## 4. Ce qui devient diagnostique (était absent ou hors rôle en V1)

| Variable | V1 | V2 |
|---|---|---|
| `cmj_force_zero_vel` | Aucun rôle HYP### | 🔴 Diagnostique Core (sous-domaine A) |
| `cmj_braking_rfd` | 🔴 Diagnostique (déjà) | 🔴 Diagnostique Core — **confirmé comme variable prioritaire du Niveau 1** (rôle renforcé, pas nouveau) |
| `cmj_braking_impulse` | 🔴 Diagnostique (déjà) | idem — priorité confirmée |
| `dj_rsi`, `dj_contact_time` | Exclu (`dj_rsi`) / confirmative (`dj_contact_time`) | 🔴 Rôle nouveau dans le sous-domaine D (Absorption réactive) — **jamais générateurs du Niveau 1**, uniquement caractérisation de sous-domaine |

## 5. Ce qui passe à Stabilisation

| Variable | Ancien modèle | Nouveau modèle |
|---|---|---|
| `landing_uni_tts` | Diagnostique Absorption **et** Stabilisation | Diagnostique **Stabilisation uniquement** |
| `landing_bi_tts` | Diagnostique Absorption **et** Stabilisation | Diagnostique **Stabilisation uniquement** |

**Non concernée par ce changement** : `sllt_tts` reste diagnostique d'Absorption — SLLT n'a jamais
appartenu à Stabilisation (exclusion déjà actée en amont de V1), aucune double destination à trancher
pour ce KPI précis. Le retrait ne porte que sur `landing_uni_tts`/`landing_bi_tts`.

## 6. Ce qui reste indisponible (non créé)

- `cmj_eccentric_peak_power` / "Eccentric Peak Power / BM" — inexistant dans Kinexus.
- "CMJ Stiffness" pour le CMJ bilatéral — inexistant (seuls DJ/SLDJ/CMJR ont un KPI de raideur).
- "DJ Eccentric Impulse" / "DJ Concentric Impulse" — inexistants sous ces noms.
- "Force at Zero Velocity Asymmetry" — inexistante (absente de `ASYM_PERFORMANCE_EQUIVALENT`).
- Six variables `landing_uni_*`/`landing_bi_*` déjà signalées manquantes dans
  `VARIABLES_DIAGNOSTIQUES_ABSORPTION.md` §1 (`landing_uni_peak_landing_force`,
  `landing_uni_loading_rate`, `landing_uni_impulse`, `landing_uni_cop_path`,
  `landing_bi_loading_rate`, `landing_bi_impulse`).
- DJ asymmetries — existence non confirmée, `ASYM_PERFORMANCE_EQUIVALENT` étant un référentiel propre
  au CMJ ; statut NON DÉTERMINABLE, pas NON DISPONIBLE (différence signalée : pour le premier groupe,
  l'absence est vérifiée ; pour les asymétries DJ, elle n'a simplement pas été vérifiée dans cette
  mission).

## 7. Ce qui est futur

- **F. Absorption horizontale** : Peak/Mean Deceleration, Deceleration Time/Distance, Braking
  Impulse — aucune variable existante, aucun test associé.
- **G. Absorption multidirectionnelle** : Lateral Braking, COD Braking, Force Redirection,
  Re-acceleration — idem.

Les deux modules restent nommés dans l'architecture cible (§12 de `HYP-ABS-01_V2.md`) sans aucune
tentative d'intégration au raisonnement actuel.

---

## Rappel

Aucune de ces évolutions n'est implémentée dans le logiciel. `index.html`, `computeMoteur()`, `TFM`,
`CLI###`, `computeAsymEngine`, les écrans et les rapports restent strictement inchangés. Ce changelog
documente un changement de **source de vérité clinique**, pas un déploiement.

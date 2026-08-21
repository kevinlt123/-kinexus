# Cartographie clinique — rôle vs faisabilité — HYP-FOR-01 (Force)

**Principe appliqué** (nouvelle règle de travail) : le rôle clinique d'une variable est déterminé
indépendamment de l'existence actuelle d'un seuil. Une variable sans norme reste dans la
cartographie, marquée « non automatisable actuellement », jamais supprimée.

Sources : `HYP_ARCHITECTURE_PHASE_C.md` (fiche Force), `AUDIT_SEUILS_HYP_FOR01.md`,
`SOURCES_NORMATIVES_FORCE.md`, `INVENTAIRE_COMPLET_VARIABLES_NORMEES.md` — faits déjà vérifiés
dans le code, non rerecherchés ici sauf mention contraire.

---

## A — Variables diagnostiques

| Variable | Test | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|---|
| `imtp_n` | IMTP | Diagnostique (`CLI010`, ≥2/4) | Aucune | Bloqué — non automatisable |
| `slimtp_n` | SLIMTP | Diagnostique (`CLI010`, ≥2/4) | Aucune | Bloqué — non automatisable |
| `iso_belt_squat_n` | Isometric Belt Squat | Diagnostique (`CLI010`, ≥2/4) | NORMS (13 pop. sport + 2 générales) | **Automatisable, opérationnel** |
| `sl_iso_push_n` | Single Leg Isometric Squat Hold | Diagnostique (`CLI010`, ≥2/4) | NORMS (3 pop. football) | **Automatisable, opérationnel (étroit)** |

Règle de convergence (inchangée, non rouverte) : ≥2 des 4 variables ci-dessus déficitaires.

## B — Variables confirmatives

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| `imtp_nkg` | Confirmative (force relative) | Aucune | Bloqué |
| `slimtp_nkg` | Confirmative | Aucune | Bloqué |
| `iso_belt_squat_nkg` | Confirmative | NORMS (13 pop.) | **Opérationnel** |
| `sl_iso_push_nkg` | Confirmative | THRESHOLDS (vert 2.5/jaune 2.0/orange 1.5) | **Opérationnel, universel** |

## C — Variables explicatives

| Variable / famille | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| RFD (`rfd50`/`100`/`150`/`200`) des 4 tests diagnostiques + 11 familles segmentaires + épaule | Explicative physiologique (vitesse de production de force) | Aucune, sur aucune variable | Bloqué en totalité — variable cliniquement pertinente, seuil à construire |
| TTPF des mêmes tests | Explicative physiologique | Aucune | Bloqué |
| `rs_hip_push`/`rs_knee_push`/`rs_ankle_push` (`n`/`nkg`/RFD/TTPF) | Explicative biomécanique (force en chaîne fermée) | Aucune | Bloqué |

## D — Variables modificatrices / précision

| Variable | Rôle clinique | Norme Kinexus | Faisabilité |
|---|---|---|---|
| LSI des 4 tests globaux (`autoLSI`) | Modificateur — asymétrie (`CLI012`) | Mécanisme générique déjà existant (pas une norme par variable, un calcul) | **Opérationnel** (calcul disponible dès que D/G mesurés) |
| Force segmentaire `_n`/`_nkg` (12 groupes, `CLI200`-`211`) | Précision — filtre quelle orientation segmentaire se déclenche, jamais générateur du volet global | Voir tableau détaillé ci-dessous | Variable selon le groupe |

### Détail segmentaire (12 groupes)

| Groupe | `CLI` | `_n` | `_nkg` |
|---|---|---|---|
| Quadriceps | `CLI200` | Aucune norme | THRESHOLDS (opérationnel) |
| Soléaire | `CLI201` | NORMS (3 pop. football) | THRESHOLDS (opérationnel) |
| Gastrocnémien | `CLI202` | Aucune norme | THRESHOLDS (opérationnel) |
| Ischio-jambiers | `CLI203` | Aucune norme | THRESHOLDS (opérationnel) |
| Extenseurs de hanche | `CLI204` | Aucune norme | THRESHOLDS (opérationnel) |
| Abducteurs de hanche | `CLI205` | NORMS (3 pop.) | THRESHOLDS (opérationnel) |
| Adducteurs | `CLI206` | NORMS (3 pop.) | THRESHOLDS (opérationnel) |
| Fléchisseurs de hanche | `CLI207` | NORMS (3 pop.) | THRESHOLDS (opérationnel) |
| Dorsiflexeurs | `CLI208` | Aucune norme | Aucune norme — **bloqué en totalité** |
| Inverseurs | `CLI209` | Aucune norme | Aucune norme — **bloqué en totalité** |
| Éverseurs | `CLI210` | Aucune norme | Aucune norme — **bloqué en totalité** |
| Épaule 90/20, 90/90 | `CLI211` | Aucune norme | THRESHOLDS (opérationnel) |
| Épaule 30/30, 60/60 | `CLI211` | Aucune norme | Aucune norme — **bloqué en totalité** |

Rôle clinique conservé pour les 5 entrées "bloqué en totalité" (`df_iso`, `inv_iso`, `ev_iso`,
`sh_iso_3030`, `sh_iso_6060`) — non supprimées, marquées non automatisables.

## E — Validation croisée

| Élément | Rôle clinique | Faisabilité |
|---|---|---|
| Absorption / Puissance (variables Core CMJ) | Explicitement **exclues** de Force par la fiche de qualité — pas une validation croisée, une étanchéité | N/A — décision déjà gelée |
| `CLI212`/`CLI213` (composites unilatéraux/multi-groupes) | Validation croisée interne à Force elle-même (≥2 tests unilatéraux déficitaires / ≥3 groupes déficitaires simultanément) | Dépend des mêmes variables Niveau 1/2 ci-dessus — même faisabilité |

---

## Tableau récapitulatif rôle × norme (extrait des variables les plus significatives)

| Variable | Rôle clinique | Norme Kinexus | Source à rechercher | Utilisable maintenant |
|---|---|---|---|---|
| `imtp_n` | Diagnostique | Non | VALD (rapport dédié IMTP) ou norme interne | Non |
| `slimtp_n` | Diagnostique | Non | VALD ou norme interne | Non |
| `iso_belt_squat_n` | Diagnostique | Oui (NORMS) | — | Oui |
| `sl_iso_push_n` | Diagnostique | Oui (NORMS, étroit) | Élargir à d'autres sports si besoin | Oui (populations limitées) |
| `imtp_rfd100`/`200`, tout `_ttpf` | Explicative | Non | Norme à construire (littérature ou interne) | Non |
| `df_iso_n`/`nkg`, `inv_iso_n`/`nkg`, `ev_iso_n`/`nkg` | Précision segmentaire | Non | VALD/interne | Non |
| `sh_iso_3030`/`6060` | Précision segmentaire | Non | VALD/interne | Non |
| LSI (tous tests bilatéraux) | Modificateur | Mécanisme générique, pas une norme | — | Oui |

---

## Voies de normes potentielles (identification uniquement, aucune norme créée)

| Variable/famille | Voie(s) envisageable(s) |
|---|---|
| `imtp_n`/`slimtp_n` | 1. Normes VALD existantes (rapport dédié IMTP, non présent dans le dépôt aujourd'hui) · 3. Normes internes Kinexus (population de patients déjà suivis) |
| RFD/TTPF (tous tests) | 2. Normes de littérature (RFD isométrique largement documentée en recherche) · 3. Normes internes |
| Chevilles (`df_iso`/`inv_iso`/`ev_iso`) | 1. VALD (si un rapport dédié existe) · 4. Normes par population sportive (peu de littérature générale sur ces mouvements spécifiques) |
| Épaule 30/30, 60/60 | 1. VALD (rapport spécifique épaule) · 4. Normes sportives (lanceurs, sports de raquette) |
| Force segmentaire `_n` manquants | 1. VALD (rapports déjà utilisés pour `_nkg` pourraient contenir `_n`, à vérifier auprès du praticien) |

---

## Synthèse par priorité

### DIAGNOSTIC → variables nécessaires
`imtp_n`, `slimtp_n`, `iso_belt_squat_n`, `sl_iso_push_n` — 2/4 automatisables aujourd'hui.

### EXPLICATION → variables utiles
RFD/TTPF de tous les tests Force (diagnostiques et segmentaires) — 0 automatisable aujourd'hui,
rôle clinique entièrement conservé.

### PRÉCISION → variables complémentaires
LSI (automatisable), force segmentaire `_n`/`_nkg` par groupe (7-8/12 groupes automatisables via
`_nkg` ou `_n`, 4-5/12 bloqués).

### NORMES → ce qui est disponible actuellement
`iso_belt_squat_n`/`nkg`, `sl_iso_push_n`/`nkg`, et 8 des 12 groupes segmentaires (au moins une
variante `_n` ou `_nkg`).

### BLOCAGES → ce qui manque pour automatiser
Aucune norme IMTP/SLIMTP dans le dépôt ; aucune norme RFD/TTPF pour aucun test ; aucune norme
`df_iso`/`inv_iso`/`ev_iso`/`sh_iso_3030`/`6060` sous aucune forme (`_n` ni `_nkg`).

# KINEXUS_REASONING_ENGINE_V1.md — Moteur HYP### V1 (source de vérité unique)

## Statut de ce document

Document de **consolidation et de normalisation documentaire uniquement**. Il fusionne les
décisions déjà validées par le praticien dans `HYP_ARCHITECTURE_FREEZE.md`,
`HYP_ARCHITECTURE_PHASE_C.md`, `PHASE_D_LOGICAL_VALIDATION.md`, `PHASE_E_INFERENCE_ENGINE.md` et
`PHASE_F_ADR.md`, plus la validation explicite des ADR du 14/08/2026. **Aucune règle n'est
modifiée, aucune décision n'est réinterprétée, aucune décision nouvelle n'est créée ici.** En cas
de doute sur la formulation exacte d'une variable, d'un seuil ou d'une condition, `Vierge_7` et
`HYP_ARCHITECTURE_PHASE_C.md` restent les sources canoniques de détail — ce document consolide le
**mécanisme du moteur** (comment une hypothèse évolue), pas l'inventaire exhaustif de chaque
variable par qualité, déjà figé et non rouvert ici.

**Ce document devient, à compter de sa publication, la référence unique pour le fonctionnement du
moteur d'inférence HYP### V1**, conformément à la demande du praticien du 14/08/2026.

### Provenance (traçabilité)

| Section de ce document | Source(s) consolidée(s) |
|---|---|
| §1 Pipeline général | `KINEXUS_CLINICAL_ARCHITECTURE.md` (non modifié, cité) |
| §2 Cycle de vie d'une hypothèse | `PHASE_E_INFERENCE_ENGINE.md` Partie 1, révisé par la validation ADR-002 (14/08) |
| §3 Rôle des preuves | `PHASE_E_INFERENCE_ENGINE.md` Partie 2, révisé par la validation ADR-001 (14/08) |
| §4 Règle de convergence | `PHASE_E_INFERENCE_ENGINE.md` Partie 2/3, révisé par la validation ADR-003 (14/08) |
| §5 Relation HYP↔CLI### | `PHASE_E_INFERENCE_ENGINE.md` Partie 5, révisé par la validation ADR-004 (14/08) |
| §6 Cas particuliers | `HYP_ARCHITECTURE_FREEZE.md` (points 1-11), `PHASE_E_INFERENCE_ENGINE.md` Partie 6, révisé par les validations ADR-002/005/006 (14/08) |
| §7 Application par qualité | `HYP_ARCHITECTURE_PHASE_C.md` (fiches complètes, référence canonique), `PHASE_D_LOGICAL_VALIDATION.md` (tableau de synthèse) |
| §8 Hors périmètre V1 | `HYP_ARCHITECTURE_FREEZE.md` point 1, `PHASE_F_ADR.md` ADR-002 |
| §9 Synthèse de gel | Nouvelle consolidation, sans nouvelle décision |

---

# §1 — Pipeline général de raisonnement (rappel, non modifié)

📄 Validé le 07/08/2026 dans `KINEXUS_CLINICAL_ARCHITECTURE.md`, non rouvert par ce chantier :

```
Variables (preuves objectives)
        ↓
Qualités physiques
        ↓
Variables diagnostiques
        ↓
Génération d'hypothèses cliniques (HYP###)
        ↓
Recherche de preuves — diagnostiques / confirmatives / explicatives / indirectes
        ↓
Évaluation du niveau de support (Fort / Modéré / Faible — jamais un score numérique)
        ↓
Hypothèses retenues
        ↓
Cibles physiologiques (CIB###) → Principes d'entraînement (PR###) → Orientations cliniques (CLI###)
```

Règle de fond, inchangée : *"une variable isolée ne valide jamais, seule, une hypothèse. Une
variable peut seulement : générer, renforcer, affaiblir, réfuter."* Les §2 à §6 ci-dessous
opérationnalisent cette règle pour le moteur V1 — ils ne la remplacent pas.

---

# §2 — Cycle de vie d'une hypothèse (moteur V1, gelé)

## États du cycle V1

```
ABSENTE  →  SUSPECTÉE  →  RETENUE / FAIBLE  →  RETENUE / MODÉRÉE  →  RETENUE / FORTE
```

| État | Définition | Déclencheur |
|---|---|---|
| **Absente** | Aucune preuve diagnostique déficitaire. L'hypothèse n'existe pas. | Statut normal sur toutes les variables diagnostiques. |
| **Suspectée** | Au moins une preuve diagnostique déficitaire, sous le seuil de convergence propre à la qualité. Existe, mais insuffisante pour produire une orientation `CLI###`. | Une variable diagnostique **génère** l'hypothèse. |
| **Retenue / Faible** | Seuil de convergence diagnostique atteint (voir §4), aucune preuve confirmative convergente. | Convergence diagnostique minimale. |
| **Retenue / Modérée** | Seuil diagnostique atteint + ≥1 preuve confirmative convergente. | Une confirmative **renforce**. |
| **Retenue / Forte** | Seuil diagnostique atteint + confirmative **et** explicative (physiologique ou biomécanique) convergentes sur un mécanisme cohérent. | Une explicative **renforce** davantage. |

## État Réfutée — hors périmètre opérationnel du V1

⏸️ **Décision ADR-002 (non validée le 14/08/2026)** : le principe de réfutation reste explicitement
ouvert. L'état **Réfutée** demeure nommé dans le modèle théorique (cohérence avec le principe
fondateur), mais **n'est pas implémenté dans le moteur V1** — aucune condition de rejet n'est
inventée en dehors de Vierge_7. Il devient opérationnel uniquement après un enrichissement explicite
de Vierge_7 par le praticien, en dehors du périmètre de ce gel. **Réservé pour une version future.**

## Règles de transition — moteur V1

| Transition | Condition (V1) |
|---|---|
| Absente → Suspectée | ≥1 variable diagnostique déficitaire (sauf Mobilité — §6). |
| Suspectée → Retenue/Faible | Seuil de convergence diagnostique atteint (§4). |
| Retenue/Faible → Retenue/Modérée | ≥1 preuve confirmative convergente. |
| Retenue/Modérée → Retenue/Forte | ≥1 preuve explicative (physio ou biomécanique) convergente, en plus de la confirmative. |
| — Affaiblissement (✅ ADR-001, validé) | Une confirmative ou explicative **normale** (non convergente) **plafonne** la progression du support au niveau déjà atteint — elle **ne fait jamais redescendre** l'état, et **n'annule jamais** une preuve diagnostique déjà établie. |
| — Réfutation | Non implémentée (voir ci-dessus). |

---

# §3 — Rôle des preuves par catégorie (moteur V1, gelé)

| Catégorie | Génère (Absente→Suspectée) ? | Fait franchir le seuil (→Retenue) ? | Fait monter le support (Faible→Modéré→Fort) ? | Peut plafonner (affaiblissement) ? |
|---|---|---|---|---|
| **Diagnostique** | ✅ Oui — seule catégorie habilitée. | ✅ Oui — par convergence entre variables diagnostiques. | 🔧 Indirectement (au-delà du seuil minimal, sans être requis). | Non concerné (autorité décisive, jamais plafonné par une autre catégorie — cf. hiérarchie ci-dessous). |
| **Confirmative** | ❌ Non, jamais seule. | ❌ Non. | ✅ Oui — fait passer Faible→Modéré. | ✅ Oui (ADR-001) — normale, plafonne la progression sans redescendre. |
| **Explicative physiologique** | ❌ Non, jamais seule. | ❌ Non. | ✅ Oui — fait passer Modéré→Fort. | ✅ Oui (ADR-001), même mécanique. |
| **Explicative biomécanique** | ❌ Non, jamais seule. | ❌ Non. | ✅ Oui — cumulable avec l'explicative physiologique, non substituable. | ✅ Oui (ADR-001), même mécanique. |

**Hiérarchie décisive (non modifiée)** : le niveau diagnostique a toujours l'autorité sur
l'existence de l'état (générer/faire-seuil) ; confirmative et explicative ne peuvent jamais générer
ni faire seuil, uniquement graduer le support une fois l'hypothèse déjà générée — et, depuis
ADR-001, le plafonner si elles sont discordantes, jamais l'annuler.

**Preuve diagnostique secondaire** (📄 gel, point 5) : rang formel réservé aux variables mobilisées
uniquement en l'absence de la preuve diagnostique principale (ex. Puissance :
`dj_peak_prop_power`/`sldj_peak_prop_power`/`cmjr_peak_power`), jamais en renfort à poids égal —
suit ensuite les mêmes règles de génération/seuil que toute variable diagnostique une fois
mobilisée.

---

# §4 — Règle de convergence (moteur V1, gelé)

✅ **Décision ADR-003 (validée le 14/08/2026)** : la convergence diagnostique requise pour
atteindre Retenue s'évalue **à l'échelle des mécanismes/tests indépendants**, pas par simple
comptage de variables issues d'un même test. Deux KPIs dérivés d'un seul et même essai ne
constituent pas, par défaut, deux preuves indépendantes.

**Application par défaut** : pour 6 des 8 qualités actives (Force, Puissance, Réactivité,
Explosivité, Stabilisation, Endurance), chaque test diagnostique ne contribue qu'un nombre limité
de KPIs diagnostiques par mécanisme — la règle de diversité s'applique sans effet perceptible
supplémentaire par rapport à une lecture littérale du seuil `CLI###`.

**Exception à documenter explicitement — Absorption/SLLT** : ⚠️ le diagnostic `HYP-ABS-01`
regroupe des KPIs SLLT multiples (`sllt_peak_landing_force`, `ttplf`, `loading_rate`, `tts`,
`cop_path`) au sein d'un même test/mécanisme. Le praticien a demandé que cette exception soit
**documentée explicitement** ; ce document consolide la décision de principe (diversité des
mécanismes) mais **l'énoncé précis de l'exception SLLT reste à rédiger** — voir §9.3 (zones
ouvertes). Ce n'est pas un point bloquant pour le moteur en général, seulement pour la
formalisation complète de la convergence d'`HYP-ABS-01`.

---

# §5 — Relation HYP### ↔ CLI### (moteur V1, gelé)

- **Une hypothèse Suspectée ne produit jamais de `CLI###`.** Seul le franchissement du seuil de
  convergence (état Retenue, tout niveau de support confondu) rend une hypothèse éligible à une
  orientation `CLI###` — inchangé depuis Phase E, non rouvert par les ADR.
- ✅ **Décision ADR-004 (validée le 14/08/2026)** : le niveau de support (Faible/Modéré/Forte) est
  transmis à la couche `CLI###` **comme métadonnée d'affichage et d'interprétation uniquement**.
  **Aucun nouveau seuil de déclenchement `CLI###` n'est créé** — une hypothèse Retenue/Faible et une
  hypothèse Retenue/Forte déclenchent la même orientation ; seule l'étiquette de confiance qui
  l'accompagne diffère. La modalité technique exacte de cette transmission reste un chantier de
  conception d'affichage, hors périmètre clinique de ce gel.
- **CLI### segmentaires (Niveau 2, Force uniquement)** : 📄🔧 condition à deux niveaux, non
  modifiée — `HYP-FOR-01` doit d'abord être Retenue (volet global) ; une variable explicative
  segmentaire spécifique (ex. `knee_ext_n`) filtre ensuite quelle orientation `CLI200`-`211` se
  déclenche, sans jamais générer ni confirmer `HYP-FOR-01` elle-même.

---

# §6 — Cas particuliers (moteur V1, gelé)

## Mobilité — exception validée (ADR-005)
✅ Mobilité reste une **exception volontaire** du modèle général. Une seule preuve diagnostique
déficitaire (`wblt_distance`) **suffit à retenir l'hypothèse** — aucune convergence supplémentaire
n'est requise. Conséquence directe sur le cycle : `HYP-MOB-01` passe **directement d'Absente à
Retenue**, sans transiter par Suspectée (il n'existe structurellement aucun seuil de convergence à
ne pas encore atteindre avec une seule variable diagnostique). Le support reste plafonné à Faible/
Modéré en pratique (couche confirmative auto-référentielle, couche explicative nulle — §7) — jamais
Fort, sans que cela ne remette en cause l'exception elle-même.

## Explosivité — séparation confiance clinique / confiance instrumentale (ADR-006)
✅ Le support clinique de `HYP-EXP-01` (Faible/Modéré/Forte) **n'est pas plafonné** par les
limites de mesure — il suit les mêmes règles de convergence que les 7 autres qualités actives (§2-
§4), et peut atteindre Retenue/Forte si diagnostique + confirmative + explicative convergent. Les
limitations de mesure (RFD du CMJ non fenêtré — `cmj_conc_rfd` en proxy de 3 des 4 variables visées
par Vierge_7, gel point 4) sont transmises **séparément**, comme une information distincte de
**confiance instrumentale**, jamais fusionnée avec le niveau de support clinique. **Cette décision
révise explicitement** la proposition initiale de `PHASE_E_INFERENCE_ENGINE.md` (Partie 6), qui
avait suggéré un plafonnement du support à Modéré — cette proposition est **superseded** par
ADR-006 et ne s'applique plus. La modalité d'affichage de la confiance instrumentale reste un
chantier de conception, hors périmètre clinique de ce gel.

## Stabilisation — état "Retenue sans orientation `CLI###`" toléré
🔧 Si `landing_uni_tts`/`landing_bi_tts` sont les seules variables déficitaires, `HYP-STAB-01` peut
légitimement atteindre Retenue (Landing est diagnostique selon la fiche de qualité), mais aucune
`CLI###` connue (`CLI070`/`CLI071`) ne peut la recevoir — démontré par cas concret en Phase D. **Le
moteur V1 tolère explicitement cet état** : ce n'est pas une erreur du cycle, mais un vide de
couverture de Vierge_7 lui-même, déjà signalé et non résolu par ce gel.

## Contrôle Sensori-moteur — suspendu, hors modèle V1
📄 `HYP-CSM-01` reste **suspendue** (gel, point 1) : aucune preuve mesurée ne la distingue
opérationnellement de Stabilisation. N'est instanciée dans aucun état du cycle V1. Réactivable dès
qu'une preuve distinctive existera dans Vierge_7.

## Asymétries — lecture seule, jamais génératrices
📄 Une conclusion d'asymétrie (`computeAsymEngine`, gel point 3) ne joue jamais de rôle diagnostique
— uniquement confirmatif ou explicatif, en lecture seule. Peut faire monter le support d'une
hypothèse déjà générée (Faible→Modéré), jamais la générer ni lui faire franchir le seuil Retenue à
elle seule.

---

# §7 — Application du moteur V1 par qualité (référence : `HYP_ARCHITECTURE_PHASE_C.md`)

*Ce tableau consolide le seuil de convergence et le statut de robustesse déjà validés ailleurs. Le
détail exhaustif des variables (diagnostiques/confirmatives/explicatives) de chaque HYP### reste
dans `HYP_ARCHITECTURE_PHASE_C.md`, non reproduit ni modifié ici.*

| HYP_ID | Seuil de convergence (V1) | Support max atteignable | Exception/particularité applicable | Statut Phase D | `CLI###` |
|---|---|---|---|---|---|
| `HYP-FOR-01` | ≥2/4 preuves diagnostiques (tests indépendants) | Forte | Filtrage segmentaire Niveau 2 (`CLI200`-`213`) — §5 | Robustesse élevée, **Prêt** | `CLI010`-`012` + `CLI200`-`213` |
| `HYP-PUI-01` | 2/2 preuves diagnostiques (les deux exigées, `CLI040`) | Forte | Preuve diagnostique secondaire (rang formel, §3) | Robustesse élevée, **Prêt** (sous réserve Constat C0 — résolu par l'état Suspectée, §2) | `CLI040`-`041` |
| `HYP-REA-01` | 2/2 preuves diagnostiques réelles (`cmjr_mean_rsi` exclue du compte, gel) | Forte | Contradiction `CLI050`/`cmjr_mean_rsi` déjà tranchée (fiche de qualité fait foi) | Robustesse élevée, **Prêt** (Constat C0 résolu) | `CLI050`-`051` |
| `HYP-EXP-01` | ≥2/2 variables réellement mesurées (proxy des 4 visées par Vierge_7) | **Forte** (non plafonnée — ADR-006) | Confiance instrumentale transmise séparément (§6) | Robustesse modérée, **Prêt sous réserve instrumentale** (révisé — n'est plus "sous réserve de plafonnement") | `CLI030`-`031` |
| `HYP-ABS-01` | ≥2 preuves diagnostiques, **mécanismes indépendants** (ADR-003) | Forte | Exception SLLT à documenter explicitement (§4, §9.3) | Robustesse élevée, **Prêt sous réserve de la documentation d'exception SLLT** | `CLI060`-`061` |
| `HYP-STAB-01` | ≥2/4 familles diagnostiques (SLS/EO/EF/Strobo/Landing selon la fiche) | Forte | État "Retenue sans `CLI###`" toléré pour Landing isolé (§6) | Robustesse modérée, **Prêt sous réserve** (incohérence Landing/`CLI070` documentée, non bloquante) | `CLI070`-`071` |
| `HYP-END-01` | ≥2/6 preuves diagnostiques | Forte | Statut "local" de `heel_raise_reps` non tranché par Vierge_7 (non bloquant) | Robustesse élevée, **Prêt** | `CLI080`-`081` |
| `HYP-MOB-01` | **1/1** preuve diagnostique (exception, ADR-005) | Faible/Modérée (jamais Forte — couche explicative nulle) | Exception validée — pas de Suspectée, pas de convergence supplémentaire (§6) | Robustesse élevée, **Prêt** (exception confirmée) | `CLI020`-`021` |
| `HYP-CSM-01` | — | — | **Suspendue, hors modèle V1** (§6, §8) | Non évaluée (suspendue avant Phase D) | `CLI090`-`092` (non exploitées) |

---

# §8 — Ce qui reste explicitement hors du périmètre V1

- **`HYP-CSM-01`** — suspendue depuis le gel (point 1), aucune preuve distinctive de Stabilisation
  identifiée à ce jour dans Vierge_7. Réactivable, pas supprimée.
- **État Réfutée** — réservé pour une version future (ADR-002, non validé le 14/08/2026). Aucune
  condition de rejet ne doit être inventée en dehors d'un enrichissement explicite de Vierge_7 par
  le praticien.
- **Modalités techniques d'affichage** — transmission du support en métadonnée `CLI###` (ADR-004)
  et transmission de la confiance instrumentale séparée pour Explosivité (ADR-006) : décidées sur
  le principe, non conçues dans le détail — chantier d'implémentation, hors périmètre clinique.
- **Modalité technique de référence en lecture seule à `computeAsymEngine`** (gel, point 3) — même
  statut : décidée sur le principe, à concevoir en implémentation.
- **Correction effective de `TFM`/`VAR_REL3`** — hors périmètre de toute Phase de ce chantier
  depuis le gel.

---

# §9 — Synthèse de gel (livrable demandé)

## 9.1 Contradictions résiduelles détectées

Aucune contradiction de fond n'a été trouvée entre les 5 documents sources et les validations du
14/08/2026. Deux points de **formulation** méritent cependant d'être signalés pour la cohérence de
lecture future, sans qu'aucun ne constitue une contradiction de contenu :

1. **`PHASE_D_LOGICAL_VALIDATION.md` (tableau de synthèse, ligne `HYP-EXP-01`)** emploie
   l'expression *"plafond de confiance à formaliser avant implémentation"*, rédigée avant
   l'existence d'ADR-006. La décision validée le 14/08/2026 ne plafonne plus le support clinique —
   elle sépare confiance clinique et confiance instrumentale (§6). Le **constat sous-jacent** de
   Phase D (risque de faux négatif élevé, dépendance forte à un proxy non fenêtré) **reste
   entièrement valide et n'est pas remis en cause** ; seul le mécanisme de traitement de ce constat
   a changé. Ce document (§7) reflète déjà la décision à jour.
2. **`PHASE_E_INFERENCE_ENGINE.md` (Partie 6, Explosivité)** proposait explicitement un
   plafonnement du support à Modéré. Cette proposition est **superseded** par ADR-006 (voir §6).
   `PHASE_E_INFERENCE_ENGINE.md` n'a pas été modifié rétroactivement (consigne : ne rien modifier),
   mais doit être lu à la lumière de cette révision assumée et déjà tracée dans
   `PHASE_F_ADR.md`.

## 9.2 Constat de clôture — Constat C0 (Phase D) résolu

Le vide de spécification identifié en Phase D (aucun état pour une preuve diagnostique isolée sous
le seuil de convergence) est **résolu** par l'état **Suspectée** (§2), validé dans le cycle V1. Ceci
répond notamment à l'ambiguïté Phase D explicitement notée pour `HYP-PUI-01` (Cas B — déficit
bilatéral CMJ isolé, profil unilatéral SLCMJ normal) : ce cas est désormais nommé et représenté
(état Suspectée), sans qu'aucune orientation `CLI###` ne s'en trouve modifiée.

## 9.3 Zones encore ouvertes (non bloquantes, mais à traiter avant une implémentation complète)

- **Exception SLLT/Absorption (§4)** : le principe de convergence par mécanismes indépendants est
  validé ; l'énoncé précis de l'exception nécessaire pour Absorption reste à rédiger, comme demandé
  explicitement par le praticien.
- **Modalités d'affichage** de la métadonnée de support (ADR-004) et de la confiance instrumentale
  (ADR-006) — décisions de principe actées, conception d'affichage non traitée par ce chantier
  clinique.
- **Modalité technique de la lecture seule `computeAsymEngine`** (gel, point 3) — même statut.
- **Vides d'orientation non comblés par Vierge_7**, sans impact sur le fonctionnement du moteur :
  déficit global de Force sans cause segmentaire identifiable (aucune orientation `CLI###`
  correspondante) ; condition numérique manquante pour `CLI041` (Puissance) et `CLI051`
  (Réactivité) ; statut "local" non tranché de `heel_raise_reps` (Endurance). Ces trois points sont
  des silences de Vierge_7, déjà documentés depuis la Phase C/D, non résolus par ce gel et non
  requis pour que le moteur V1 fonctionne correctement sur les autres cas.
- **Réfutation (ADR-002)** — explicitement laissée ouverte par le praticien ; nécessite un
  enrichissement futur de Vierge_7, hors périmètre et hors calendrier de ce chantier.

## 9.4 Éléments réellement bloquants pour l'implémentation

**Aucun blocage pour les 8 qualités actives.** Les deux points identifiés comme bloquants en Phase F
(exception Mobilité, exception Explosivité) sont désormais validés (ADR-005, ADR-006). Le seul point
partiellement bloquant est **local à `HYP-ABS-01`** : l'exception de convergence SLLT doit être
rédigée explicitement (§9.3) avant que le seuil de convergence de cette qualité précise soit
totalement non ambigu — cela ne bloque ni les 7 autres qualités, ni le moteur en général.

`HYP-CSM-01` reste bloquée par construction (suspendue), mais ce n'est pas un blocage du V1 —
c'est son périmètre validé.

## 9.5 Éléments implémentables immédiatement, sans nouvel arbitrage

- Le cycle à 5 états (Absente/Suspectée/Retenue Faible-Modérée-Forte) et ses règles de transition
  (§2), y compris l'affaiblissement plafonnant (ADR-001).
- La hiérarchie des rôles de preuve (§3) pour les 8 qualités actives.
- La règle de convergence par mécanismes indépendants (§4) pour les 7 qualités où elle ne requiert
  aucune exception (Force, Puissance, Réactivité, Explosivité, Stabilisation, Endurance, Mobilité).
- La transmission du support comme métadonnée `CLI###`, sans nouveau seuil (§5, ADR-004).
- Les 8 fiches HYP### complètes de `HYP_ARCHITECTURE_PHASE_C.md`, telles qu'amendées par le gel —
  aucune n'est modifiée par ce document.
- L'exception Mobilité (§6, ADR-005) et la séparation confiance clinique/instrumentale
  d'Explosivité (§6, ADR-006), toutes deux validées sans réserve.
- L'état "Retenue sans `CLI###`" toléré pour Stabilisation (§6) — un comportement à accepter tel
  quel, pas une construction supplémentaire à valider.

---

**Ce document clôt le chantier de conception théorique du moteur HYP### V1.** Toute évolution
future (implémentation technique, enrichissement de Vierge_7, réouverture de l'état Réfutée) devra
être proposée comme un nouveau chantier explicite, conformément à `CLAUDE.md` — la phase de
conception reste close sauf besoin produit réel identifié.

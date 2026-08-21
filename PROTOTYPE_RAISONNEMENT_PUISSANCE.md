# Prototype de raisonnement clinique — Puissance (HYP-PUI-01)

**Statut** : prototype de raisonnement, pas un document d'architecture logicielle. Aucun code,
aucune modification de moteur, aucune nouvelle qualité, aucune nouvelle variable, aucune règle
présentée comme validée sans l'être réellement.

**Note de nommage** : la mission désigne cette qualité `HYP-PWR-01`. Comme déjà signalé dans
`PHASE_D_LOGICAL_VALIDATION.md` (note d'ouverture), l'identifiant retenu dans tous les documents de
gel est `HYP-PUI-01` — même hypothèse, écart de nommage déjà tranché sans conflit de fond. Ce
document reprend `HYP-PUI-01` par cohérence avec `HYP_ARCHITECTURE_PHASE_C.md` et
`KINEXUS_REASONING_ENGINE_V1.md`.

**Sources utilisées** : `CARTOGRAPHIE_VARIABLES_HYP.md`, `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`,
`HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-PUI-01), `KINEXUS_REASONING_ENGINE_V1.md` (§2-§7),
`PHASE_D_LOGICAL_VALIDATION.md` (cas testés HYP-PUI-01), `ADR-001` (affaiblissement),
`ADR-007_DISCORDANT_EVIDENCE.md` (Option C). Aucune autre source n'est consultée. Aucune donnée
Vierge_7 n'est relue en dehors de ce qui est déjà cité dans ces documents.

**Légende des statuts de preuve** (identique à `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`) :
- **SOURCE EXPLICITE** — énoncé littéralement dans les documents source.
- **[INFERENCE]** — cohérent avec les sources, mais non énoncé littéralement ; à traiter comme une
  hypothèse de travail, pas un fait établi.
- **[À VALIDER]** — relation plausible mais non documentée ; nécessite un arbitrage du praticien.
- **non documenté** — absence d'information constatée, écrite explicitement comme telle.

---

## 1. QUESTION CLINIQUE

**"Qu'est-ce qu'un déficit de Puissance signifie dans Kinexus ?"**

Selon `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-PUI-01, question clinique) : *cet athlète est-il
capable de produire un niveau élevé de puissance mécanique lors d'une action explosive (saut
vertical) ?* SOURCE EXPLICITE.

Concrètement, dans le modèle V1 (`KINEXUS_REASONING_ENGINE_V1.md` §2-§4), un déficit de Puissance
est un état du cycle de vie de l'hypothèse `HYP-PUI-01`, atteint lorsque la production de puissance
mécanique de pic mesurée lors d'un saut vertical (CMJ) — bilatéral **et** unilatéral — est sous le
seuil retenu, sur les deux tests simultanément. Ce n'est pas un score continu ni un pourcentage : le
moteur V1 ne raisonne qu'en états (Absente / Suspectée / Retenue-Faible / -Modérée / -Forte), jamais
en valeur numérique agrégée. SOURCE EXPLICITE (§2).

### Ce que le moteur peut réellement faire

| Capacité | Portée | Statut |
|---|---|---|
| **Diagnostiquer** | Détecter un déficit de puissance de pic sur CMJ bilatéral et/ou unilatéral | SOURCE EXPLICITE |
| **Confirmer** | Renforcer via une tâche fonctionnelle convergente (hauteur de saut, hop tests) | SOURCE EXPLICITE |
| **Expliquer** | Identifier des mécanismes physiologiques (force, profil force-vitesse) et biomécaniques (stratégie d'exécution du saut) associés à un déficit déjà diagnostiqué | SOURCE EXPLICITE |
| **Orienter** | Produire une orientation clinique générique (`CLI040`/`CLI041`), pas une prescription | SOURCE EXPLICITE |

### Ce qu'il ne peut pas actuellement déterminer

| Limite | Détail | Statut |
|---|---|---|
| **Cause unique** | Aucune règle de priorisation entre mécanismes explicatifs simultanément déficitaires (voir §6) | non documenté |
| **Orientation différenciée par mécanisme** | `CLI040`/`CLI041` ne varient pas selon la cause identifiée (voir §7) | SOURCE EXPLICITE (absence constatée) |
| **Cas "signal isolé"** | Puissance déficitaire sans aucune explicative physiologique convergente : la fiche Phase C ne précise pas comment présenter ce cas — jugé hors périmètre du moteur de raisonnement lui-même, relevant du Fil de Raisonnement en aval | SOURCE EXPLICITE (`PHASE_D_LOGICAL_VALIDATION.md`) |
| **Réfutation** | Aucun mécanisme de rejet d'une hypothèse déjà générée | SOURCE EXPLICITE (ADR-002 non validé) |

---

## 2. DIAGNOSTIC DE PUISSANCE

### Variables diagnostiques exactes (SOURCE EXPLICITE, `HYP_ARCHITECTURE_PHASE_C.md` + `CARTOGRAPHIE_VARIABLES_HYP.md`)

| Variable | Test | Rôle | Condition de déficit |
|---|---|---|---|
| `cmj_peak_power` | CMJ | Diagnostique principal (bilatéral) | Puissance de pic sous le seuil — seuil non chiffré dans les sources disponibles |
| `slcmj_peak_power` | SLCMJ | Diagnostique principal (unilatéral) | idem |
| `dj_peak_prop_power` | Drop Jump | Diagnostique **secondaire** | idem — mobilisé **uniquement** si CMJ/SLCMJ indisponibles |
| `sldj_peak_prop_power` | SLDJ | Diagnostique secondaire | idem |
| `cmjr_peak_power` | CMJ Rebound | Diagnostique secondaire | idem |

**Règle de rang, non renégociable ici** (gel, point 5, rappelée dans `KINEXUS_REASONING_ENGINE_V1.md`
§3) : la preuve diagnostique secondaire **supplée** une absence de test principal — elle ne
**renforce jamais** un diagnostic déjà posé par `cmj_peak_power`/`slcmj_peak_power`. Un
`cmjr_peak_power` déficitaire en plus de `cmj_peak_power`/`slcmj_peak_power` déjà déficitaires
n'ajoute rien au diagnostic.

### Condition de convergence (SOURCE EXPLICITE, `CLI040`)

`cmj_peak_power` **et** `slcmj_peak_power` doivent être déficitaires **conjointement**. C'est la
condition la plus stricte de toute la matrice V1 — les 7 autres qualités actives acceptent une
déficience sur une variable diagnostique parmi plusieurs (Force : ≥2/4 ; Absorption : ≥2 mécanismes
indépendants ; etc., `KINEXUS_REASONING_ENGINE_V1.md` §7). Puissance exige littéralement **2/2**, pas
une proportion.

Aucun seuil numérique de puissance (W, W/kg) n'est présent dans les documents consultés — la
condition de déficit par variable renvoie à un statut catégoriel (déficitaire/normal) déjà calculé
en amont du moteur HYP###, pas à une valeur chiffrée que ce prototype pourrait citer sans
l'inventer.

### Scénarios diagnostiques

**A. Aucune preuve diagnostique déficitaire**
`cmj_peak_power` normal, `slcmj_peak_power` normal (et preuves secondaires non mobilisées, car les
tests principaux sont disponibles). État : **Absente**. Aucune hypothèse n'existe. SOURCE EXPLICITE
(`KINEXUS_REASONING_ENGINE_V1.md` §2).

**B. Une seule preuve diagnostique déficitaire**
`cmj_peak_power`↓ seul, `slcmj_peak_power` normal (ou l'inverse). La condition `CLI040` n'est **pas**
remplie. État : **Suspectée** — l'hypothèse existe, mais reste insuffisante pour produire une
orientation. C'est le cas nommé « Constat C0 » en Phase D pour `HYP-PUI-01` (Cas B : *déficit
bilatéral CMJ isolé, profil unilatéral SLCMJ normal*), explicitement résolu par l'introduction de
l'état Suspectée dans le cycle V1 (`KINEXUS_REASONING_ENGINE_V1.md` §9.2). SOURCE EXPLICITE.
Remarque propre à Puissance (Phase D, signalée telle quelle) : comme il n'existe que 2 variables
diagnostiques principales (contre 4 pour Force), « une seule déficitaire » représente ici **la
moitié** du diagnostic disponible — un poids proportionnellement plus lourd que pour Force, sans que
cela ne change la règle elle-même.

**C. Convergence des preuves diagnostiques**
`cmj_peak_power`↓ **et** `slcmj_peak_power`↓. Condition `CLI040` remplie. État : **Retenue/Faible**
au minimum (progression ultérieure selon confirmatives/explicatives, §4 ci-dessous). SOURCE
EXPLICITE.

**D. Preuves diagnostiques discordantes**
Il n'existe pas, au niveau diagnostique, de scénario "discordant" à proprement parler pour Puissance :
la condition est une conjonction stricte (ET), pas une règle de comptage sur un ensemble de
mécanismes indépendants comme pour Force. Un `cmj_peak_power`↓ avec `slcmj_peak_power` normal n'est
pas une "discordance" entre deux preuves diagnostiques concurrentes — c'est le scénario B
(Suspectée) ci-dessus, déjà couvert. La discordance, dans le modèle V1, s'applique aux catégories
**confirmative** et **explicative** (ADR-007, §5 de ce document), jamais à la catégorie
diagnostique elle-même (`KINEXUS_REASONING_ENGINE_V1.md` §3 : "Diagnostique... non concerné [par le
plafonnement], autorité décisive"). Point clarifié plutôt qu'un scénario supplémentaire inventé.

---

## 3. UNE FOIS PUISSANCE DIAGNOSTIQUÉE : POURQUOI ?

Vérification explicite des 5 familles demandées, une par une, contre les sources.

### A. Déficit de force absolue / relative

**Variables** : `imtp_n`, `imtp_nkg`, `slimtp_n`, `slimtp_nkg`, `profil_fv_nkg` (composante force —
F0 — du profil force-vitesse), et force segmentaire en magnitude uniquement : `knee_ext_n/nkg`,
`knee_flex_n/nkg`, `soleus_iso_n/nkg`, `gastro_iso_n/nkg`, `hip_flex_n/nkg`, `hip_ext_n/nkg`,
`hip_abd_n/nkg`, `hip_add_n/nkg`, `sl_iso_push_n/nkg`, `iso_belt_squat_n/nkg`,
`iso_squat_hold_n/nkg`.

**Rôle** : explicatives physiologiques de `HYP-PUI-01`.
**Qualité qu'elles expliquent** : Puissance (ici) — les mêmes variables `n`/`nkg` sont aussi
diagnostiques/explicatives de `HYP-FOR-01` (Force), sans que cela ne constitue une contamination
(Phase D, Cas D, voir §5).
**Source** : `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-PUI-01, "variables explicatives
physiologiques"), reproduit à l'identique dans `CARTOGRAPHIE_VARIABLES_HYP.md`.
**Niveau de preuve** : **SOURCE EXPLICITE** — ces variables sont nommément listées comme explicatives
de Puissance.

**Différence importante avec la fiche Force elle-même** : la liste segmentaire de Puissance
**exclut** `sh_iso_*` (épaule) — présent dans la liste explicative de Force, absent de celle de
Puissance. SOURCE EXPLICITE, signalé dans `HYP_ARCHITECTURE_PHASE_C.md` ("sans `sh_iso_*`, non
mentionné dans la fiche de qualité Puissance").

### B. Déficit de vitesse de développement de force (RFD)

**Variables** : `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf`, `slimtp_rfd100`, `slimtp_rfd200`,
`slimtp_ttpf`.

**Rôle** : explicatives physiologiques de `HYP-PUI-01`.
**Source** : ces six variables sont bien listées nommément dans la fiche Phase C de Puissance
("`imtp_n`/`nkg`/`rfd100`/`rfd200`/`ttpf`" et l'équivalent slimtp) — donc **SOURCE EXPLICITE** pour
leur appartenance à l'ensemble explicatif de Puissance.

**Mais** — point à ne pas confondre — la **catégorisation** "RFD = mécanisme distinct de la force
absolue" n'est, elle, **pas narrée explicitement dans la fiche Puissance elle-même**. Cette
distinction magnitude/RFD est nommée littéralement par Vierge_7 pour **Explosivité**
(`CLI030` : *"Améliorer la vitesse de développement de force"*, condition "≥2 variables RFD
déficitaires" — `HYP_ARCHITECTURE_PHASE_C.md`), pas pour Puissance. Traiter RFD comme un mécanisme B
**séparé** de la force absolue, pour Puissance spécifiquement, est donc **[INFERENCE]** — cohérent
par analogie avec le traitement du RFD ailleurs dans le corpus, mais non affirmé littéralement dans
la fiche source de cette qualité précise. Point vérifié explicitement, comme demandé, plutôt que
supposé.

**Différence supplémentaire avec Force/Explosivité/Réactivité/Endurance** : le RFD explicatif de
Puissance se limite à `imtp`/`slimtp` — **aucun RFD segmentaire** (`knee_ext_rfd*`, `hip_ext_rfd*`,
etc.) n'apparaît dans la liste explicative de Puissance, alors que ces variables existent et sont
utilisées comme explicatives ailleurs (Réactivité, Explosivité — voir `CARTOGRAPHIE_VARIABLES_HYP.md`).
SOURCE EXPLICITE (absence constatée par comparaison directe des listes).

### C. Profil force-vitesse

**Variables** : `profil_fv_nkg` (F0, déjà comptée en A), `profil_fv_v0` (V0 — composante vitesse).

**Rôle** : explicative physiologique.
**Source** : `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` (« `profil_fv_v0` est nommément la composante
vitesse du profil force-vitesse »), cohérent avec `HYP_ARCHITECTURE_PHASE_C.md`.
**Niveau de preuve** : **SOURCE EXPLICITE** pour l'appartenance des deux variables à l'ensemble
explicatif ; **[INFERENCE]** pour l'idée qu'un `profil_fv_v0`↓ isolé (F0 normal) oriente
spécifiquement vers "un problème de vitesse plutôt que de force" — cohérent avec la signification
physique du modèle force-vitesse, mais aucune orientation `CLI###` distincte ne cible ce sous-profil
(déjà signalé dans `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`).

### D. Stratégie biomécanique

**Variables** — stratégie CMJ (15 KPI) : `cmj_peak_vel`, `cmj_tto`, `cmj_depth`,
`cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`,
`cmj_conc_displacement`, `cmj_braking_duration`, `cmj_propulsion_eff`, `cmj_braking_eff`,
`cmj_ft_ct_ratio`, `cmj_ecc_decel`, `cmj_landing_rfd`, `cmj_landing_mean_power`.
Stratégie SLCMJ (14 KPI) : `slcmj_rsi_mod`, `slcmj_peak_conc_force`, `slcmj_peak_conc_vel`,
`slcmj_edrfd_bm`, `slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`,
`slcmj_depth`, `slcmj_contraction_time`, `slcmj_ecc_duration`, `slcmj_conc_duration`,
`slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab`.

**Rôle** : explicative biomécanique.
**Source** : `HYP_ARCHITECTURE_PHASE_C.md` cite littéralement *"Stratégie d'expression du
CMJ/SLCMJ"* comme catégorie explicative de Puissance, avec la liste des 29 KPI reprise depuis
`HYP_ARCHITECTURE_PHASE_B.md`.
**Niveau de preuve** : **SOURCE EXPLICITE** pour la catégorie et son contenu. Ces 29 KPI ne sont
**pas** subdivisés en sous-mécanismes internes par les sources (pas de séparation
"freinage"/"propulsion"/"raideur" formalisée pour Puissance) — traiter cette liste comme un seul bloc
non subdivisé, pas comme plusieurs sous-arbres, est donc le choix le plus fidèle aux sources.

### E. Autres mécanismes explicitement documentés

**Explosivité, comme qualité explicative de Puissance** — `CLI040` cite littéralement "Force" et
**"Explosivité"** comme variables explicatives de l'orientation. SOURCE EXPLICITE pour la citation
elle-même.

**Limite à ne pas masquer** : cette citation opère à un **niveau d'abstraction différent** — une
*qualité* entière (Explosivité) cité comme explication d'une autre *qualité* (Puissance), pas une
variable individuelle citée comme explicative d'une variable. Le modèle de données V1
(`PHASE_H_TECHNICAL_SPECIFICATION.md`) ne formalise les relations explicatives qu'au niveau
variable→qualité, jamais qualité→qualité. Opérationnaliser cette citation (par exemple : "si
`HYP-EXP-01` est Retenue, renforcer automatiquement le support explicatif de `HYP-PUI-01`")
constituerait une **règle nouvelle**, non déjà écrite dans les documents figés. **[À VALIDER]** — la
citation existe, mais son mécanisme d'application reste non spécifié.

Aucune autre famille explicative n'a été trouvée dans les sources consultées pour cette itération.

---

## 4. ARBRES CAUSAUX

Un arbre par mécanisme, statut affiché à chaque nœud.

### Arbre A — Force absolue/relative

```
PUISSANCE ↓
└── Déficit de force (magnitude)                              [VALIDÉE — SOURCE EXPLICITE : appartenance à l'ensemble explicatif]
    ├── imtp_n, imtp_nkg                                       [VALIDÉE — SOURCE EXPLICITE]
    ├── slimtp_n, slimtp_nkg                                   [VALIDÉE — SOURCE EXPLICITE]
    ├── profil_fv_nkg (F0)                                     [VALIDÉE — SOURCE EXPLICITE]
    └── force segmentaire n/nkg (11 tests, sans sh_iso_*)       [VALIDÉE — SOURCE EXPLICITE]
```

### Arbre B — Vitesse de développement de force (RFD)

```
PUISSANCE ↓
└── Déficit de RFD                                              [INFERENCE — appartenance des variables validée, la catégorisation "mécanisme distinct" ne l'est pas pour Puissance]
    ├── imtp_rfd100, imtp_rfd200, imtp_ttpf                     [VALIDÉE — SOURCE EXPLICITE, appartenance seule]
    └── slimtp_rfd100, slimtp_rfd200, slimtp_ttpf               [VALIDÉE — SOURCE EXPLICITE, appartenance seule]
```

### Arbre C — Profil force-vitesse

```
PUISSANCE ↓
└── Profil force-vitesse déséquilibré                           [VALIDÉE — SOURCE EXPLICITE : catégorie citée]
    ├── profil_fv_nkg (F0 — orientation "déficit de force")     [INFERENCE — interprétation du sous-profil]
    └── profil_fv_v0 (V0 — orientation "déficit de vitesse")    [INFERENCE — interprétation du sous-profil]
```

### Arbre D — Stratégie biomécanique d'exécution du saut

```
PUISSANCE ↓
└── Stratégie d'exécution CMJ/SLCMJ altérée                     [VALIDÉE — SOURCE EXPLICITE : catégorie et contenu]
    ├── bloc CMJ (15 KPI, non subdivisé)                        [VALIDÉE — SOURCE EXPLICITE]
    └── bloc SLCMJ (14 KPI, non subdivisé)                      [VALIDÉE — SOURCE EXPLICITE]
```

### Arbre E — Explosivité comme cause possible (niveau qualité)

```
PUISSANCE ↓
└── Explosivité (HYP-EXP-01) également retenue                  [VALIDÉE — SOURCE EXPLICITE : citation CLI040]
    └── (aucune variable individuelle formalisée à ce niveau)    [À VALIDER — mécanisme d'application non spécifié]
```

**Rappel explicite** (répété volontairement) : aucune de ces relations n'est transformée en règle
validée du seul fait qu'elle paraît physiologiquement logique. Les statuts ci-dessus reflètent
exactement ce que les documents autorisent à affirmer, pas au-delà.

---

## 5. PROFILS COMBINATOIRES

C'est la section centrale demandée. Pour chaque profil : variables nécessaires, mécanisme(s)
compatible(s), niveau de confiance, orientation possible, statut de preuve.

### Profil 1 — Puissance ↓ + Force ↓ + RFD ↓

**Variables nécessaires** : `cmj_peak_power`↓ + `slcmj_peak_power`↓ (diagnostic) ; `imtp_n`↓ (ou
`slimtp_n`↓) **et** `imtp_rfd100`↓ (ou équivalent) (explicatif).
**Mécanisme(s) compatible(s)** : Arbre A **et** Arbre B simultanément.
**Niveau de confiance** : Retenue/Forte atteignable (explicative physiologique convergente,
`KINEXUS_REASONING_ENGINE_V1.md` §2, transition Modérée→Forte) — sous réserve d'une confirmative
convergente déjà acquise (voir §2 du cycle : Forte nécessite confirmative **et** explicative).
**Orientation possible** : `CLI040` (aucune distinction d'orientation entre "force pure" et "force +
RFD", §7).
**Statut de preuve** : **SOURCE EXPLICITE** pour l'activation et la progression d'état (règles
générales du moteur) ; **[INFERENCE]** pour l'idée que "force + RFD ensemble" constituerait un
sous-profil clinique distinct de "force seule" — le moteur V1 ne les distingue pas dans son
orientation (voir Profil 5 ci-dessous, non discriminable).

### Profil 2 — Puissance ↓ + Force normale + RFD ↓

**Variables nécessaires** : `cmj_peak_power`↓ + `slcmj_peak_power`↓ ; `imtp_n`/`slimtp_n` normaux ;
`imtp_rfd100`/`slimtp_rfd100` (ou équivalents) ↓.
**Mécanisme(s) compatible(s)** : Arbre B seul.
**Niveau de confiance** : Retenue/Forte atteignable via l'explicative RFD seule (une explicative
physiologique convergente suffit à la transition Modérée→Forte, §3 : "cumulable... non
substituable" ne signifie pas "toutes requises").
**Orientation possible** : `CLI040`.
**Statut de preuve** : **[À VALIDER]** pour la lecture clinique "problème de vitesse de production de
force plutôt que de capacité de force" — cohérente avec la séparation magnitude/RFD généralement
admise, mais non formalisée comme un sous-profil distinct de Puissance dans les sources, et la
catégorisation RFD elle-même reste [INFERENCE] pour cette qualité (§3.B).

### Profil 3 — Puissance ↓ + Force normale + RFD normale + anomalies biomécaniques

**Variables nécessaires** : `cmj_peak_power`↓ + `slcmj_peak_power`↓ ; ensemble explicatif
physiologique (A+B) normal ; variables de stratégie CMJ/SLCMJ (Arbre D) anormales.
**Mécanisme(s) compatible(s)** : Arbre D seul.
**Niveau de confiance** : Retenue/Forte atteignable via l'explicative biomécanique seule (§3 :
"cumulable avec l'explicative physiologique, non substituable" — l'un ou l'autre suffit à la
transition Modérée→Forte, la formule "cumulable" décrit leur compatibilité, pas une obligation de
coexistence).
**Orientation possible** : `CLI040` — inchangée.
**Statut de preuve** : **[À VALIDER]** pour la lecture "problème de technique d'exécution plutôt que
de capacité sous-jacente" — cohérente avec la distinction Force/stratégie déjà documentée
(`HYP_ARCHITECTURE_PHASE_C.md` sépare bien les deux catégories), mais Vierge_7 ne formalise pas ce
branchement comme une orientation ou une lecture clinique distincte. Déjà signalé identiquement dans
`LOGIQUE_CLINIQUE_VARIABLES_HYP.md`.

### Profil 4 — Puissance ↓ + plusieurs mécanismes déficitaires (Force + RFD + biomécanique)

**Variables nécessaires** : diagnostic positif + déficit sur A, B et D simultanément.
**Mécanisme(s) compatible(s)** : tous les mécanismes physiologiques et biomécaniques identifiés.
**Niveau de confiance** : Retenue/Forte (le seuil Forte est déjà atteint dès qu'**une**
confirmative **et** une explicative convergent — au-delà, le moteur V1 ne prévoit aucun niveau de
support supérieur à "Forte", `KINEXUS_REASONING_ENGINE_V1.md` §2). L'accumulation de mécanismes
supplémentaires **ne modifie pas l'état** au-delà de Forte.
**Orientation possible** : `CLI040`, identique aux profils 1-3.
**Statut de preuve** : **SOURCE EXPLICITE** pour le plafond d'état (Forte est le maximum du cycle) ;
**NON DISCRIMINABLE AVEC LES DONNÉES ACTUELLES** entre ce profil et les profils 1/2/3 du point de
vue de l'*état* et de l'*orientation* produits par le moteur — les quatre profils produisent
exactement le même triplet (état=Retenue/Forte, orientation=`CLI040`, aucune préséance de mécanisme).
Seule la couche de présentation en aval (Fil de Raisonnement) pourrait, en théorie, énumérer les
mécanismes déficitaires différemment — non spécifié par les sources consultées.

### Profil 5 — Puissance ↓ isolée, sans aucune explicative convergente ("signal isolé")

**Variables nécessaires** : `cmj_peak_power`↓ + `slcmj_peak_power`↓ ; toutes les explicatives (A, B,
C, D) normales.
**Mécanisme(s) compatible(s)** : aucun identifié.
**Niveau de confiance** : Retenue/Faible (aucune confirmative ni explicative convergente) ou
Retenue/Modérée (si une confirmative fonctionnelle — `cmj_height`, hop tests — est convergente sans
qu'aucune explicative ne le soit).
**Orientation possible** : `CLI040` — déclenchée dès Retenue, indépendamment du niveau de support
(ADR-004 : le support est une métadonnée d'affichage, pas un nouveau seuil de déclenchement).
**Statut de preuve** : **SOURCE EXPLICITE** — ce cas est explicitement nommé dans
`PHASE_D_LOGICAL_VALIDATION.md` ("Puissance faible sans déficit de force... la fiche Phase C ne
spécifie pas comment ce cas 'signal isolé' doit être présenté — hors périmètre de HYP### lui-même").
Le moteur produit un état et une orientation, mais **aucune explication causale** — signalé comme
une limite réelle, pas comblée ici (voir §9).

### Profil 6 — Discordance entre confirmative et explicative (ADR-007)

**Variables nécessaires** : `cmj_peak_power`↓ + `slcmj_peak_power`↓ ; `cmj_height` normale
(confirmative discordante) ; `imtp_n`↓ (explicative physiologique convergente).
**Mécanisme(s) compatible(s)** : Arbre A, mais confirmation fonctionnelle absente.
**Niveau de confiance** : selon ADR-007 (Option C, validée) — une preuve discordante **au sein d'une
catégorie donnée plafonne la transition que cette catégorie gouverne**, sans affecter les autres
catégories. Ici, la confirmative discordante plafonne la transition Faible→Modérée — l'état reste
**Retenue/Faible**, **même si** l'explicative physiologique convergente serait normalement
suffisante pour atteindre Forte (qui nécessite explicative **et** confirmative convergentes, §2).
**Orientation possible** : `CLI040` (Retenue = éligible, indépendamment du niveau de support).
**Statut de preuve** : **SOURCE EXPLICITE** — application directe et littérale de la règle ADR-007,
sans extrapolation.

### Profil 7 — Puissance absolue déficitaire, puissance relative normale (CLI041)

**Variables nécessaires** : `cmj_peak_power`↓ + `slcmj_peak_power`↓ (déficit en valeur absolue) ;
signal normal une fois ajusté au poids de corps (PP/BM).
**Mécanisme(s) compatible(s)** : non spécifié — ce profil touche la **relation entre deux
formulations d'une même mesure** (absolue vs relative au poids), pas un mécanisme explicatif distinct
des arbres A-E.
**Niveau de confiance** : dépend des confirmatives/explicatives disponibles, comme les profils
précédents — cette dimension (absolu/relatif) est orthogonale au niveau de support.
**Orientation possible** : `CLI041` plutôt que `CLI040` — orientation distincte "Augmenter la
puissance relative", SOURCE EXPLICITE (`HYP_ARCHITECTURE_PHASE_C.md`), **mais** : *"pas de condition
numérique fournie pour cette entrée dans Vierge_7, contrairement à `CLI040`"* — la condition exacte
de déclenchement de `CLI041` (quel écart absolu/relatif la déclenche précisément) reste
**non documenté**. Point déjà signalé dans `KINEXUS_REASONING_ENGINE_V1.md` §9.3 comme "vide
d'orientation non comblé par Vierge_7", repris ici sans y ajouter de règle.
**Statut de preuve** : **SOURCE EXPLICITE** pour l'existence de la distinction absolu/relatif et de
`CLI041` ; **non documenté** pour son seuil de déclenchement exact.

---

## 6. HIÉRARCHISER LES CAUSES

**Question posée** : si plusieurs mécanismes explicatifs sont déficitaires simultanément (ex. Force
↓ + RFD ↓), le moteur doit-il produire une cause principale, plusieurs causes simultanées, ou une
cause principale + facteurs contributifs ?

### Ce que les documents permettent déjà de faire

`KINEXUS_REASONING_ENGINE_V1.md` §3 est explicite : les catégories explicative physiologique et
explicative biomécanique sont *"cumulable[s]... non substituable[s]"* — c'est-à-dire qu'elles
peuvent coexister sans que l'une prime sur l'autre pour faire progresser l'état. Rien dans le modèle
de données (`PHASE_H_TECHNICAL_SPECIFICATION.md` §1) ni dans les règles de transition (§2 de ce
document) ne prévoit de champ de rang, de poids relatif, ou de sélection d'une explicative "gagnante"
parmi plusieurs convergentes. Le fait que `CLI040` cite **conjointement** "Force" **et**
"Explosivité" comme explications possibles, sans en privilégier une, va dans le même sens :
l'architecture actuelle traite nativement la **coexistence** de plusieurs causes possibles, jamais
leur **arbitrage**.

**Conclusion directe** : ce que les documents permettent aujourd'hui, sans rien inventer, c'est
**Option 2 — plusieurs causes simultanées, listées à plat, non hiérarchisées**. C'est la seule des
trois options qui ne nécessite aucune règle nouvelle.

### Ce qui nécessiterait une nouvelle règle clinique

**Option 1 (cause unique)** nécessiterait un critère de sélection (magnitude du déficit ? nombre de
mécanismes convergents ? antériorité temporelle ?) — **aucun de ces critères n'existe dans les
sources**. L'imposer maintenant reviendrait à inventer une causalité, ce que la mission interdit
explicitement.

**Option 3 (cause principale + facteurs contributifs)** nécessiterait la même chose qu'Option 1
(un critère de priorisation), plus une définition formelle de ce que "contributif" signifie
(seuil de significativité ? proximité du seuil de déficit ?) — **non documenté**.

### Ce document ne choisit pas silencieusement

Aucune des trois options n'est retenue comme réponse définitive par ce prototype. Option 2 est
identifiée comme la seule **actuellement supportée sans extension des règles**. Le choix d'investir
dans Option 1 ou Option 3 est une **décision clinique** à soumettre au praticien — pas une inférence
technique que ce document peut trancher.

---

## 7. PASSAGE VERS L'ORIENTATION CLINIQUE

| Mécanisme | Orientation `CLI###` | Formulation clinique | Principe d'intervention |
|---|---|---|---|
| Arbre A — Force absolue/relative | `CLI040` | *Augmenter la puissance maximale* (SOURCE EXPLICITE) | [À CONSTRUIRE] — non détaillé par Vierge_7 au-delà de la formulation d'orientation elle-même |
| Arbre B — RFD | `CLI040` | idem | [À CONSTRUIRE] |
| Arbre C — Profil force-vitesse | `CLI040` | idem | [À CONSTRUIRE] |
| Arbre D — Stratégie biomécanique | `CLI040` | idem | [À CONSTRUIRE] |
| Arbre E — Explosivité (niveau qualité) | `CLI040` | idem | [À CONSTRUIRE] |
| Puissance absolue ↓, relative normale | `CLI041` | *Augmenter la puissance relative* (SOURCE EXPLICITE) | [À CONSTRUIRE] |

**Constat central de cette section, à ne pas minimiser** : contrairement à Force (dont le Niveau 2
segmentaire `CLI200`-`213` fait varier l'orientation selon le groupe musculaire déficitaire),
**aucun `CLI###` mécanisme-spécifique n'existe pour Puissance**. Quel que soit le mécanisme
identifié parmi A-E, l'orientation clinique produite reste `CLI040` (ou `CLI041` selon la lecture
absolue/relative, orthogonale au mécanisme) — SOURCE EXPLICITE, déjà noté dans
`HYP_ARCHITECTURE_PHASE_C.md` : *"Aucun lien segmentaire dédié... `CLI040` renvoie génériquement aux
qualités Force et Explosivité... sans décomposition par groupe musculaire."*

Le moteur explique **pourquoi** (mécanisme) sans que cela ne change **quoi faire** (orientation) au
niveau où le modèle V1 est aujourd'hui spécifié. Un déficit de force segmentaire identifié comme
cause de Puissance doit, selon les sources, être investigué via le Niveau 2 **propre à Force**
(`CLI200`-`211`), pas via une entrée spécifique à Puissance.

---

## 8. EXEMPLES CONCRETS

**Rappel** : les 7 profils suivants sont **synthétiques**, construits pour illustrer les mécanismes
identifiés ci-dessus. Ils ne représentent aucun patient réel.

### Patient A — Convergence complète, mécanisme Force
- `cmj_peak_power`↓, `slcmj_peak_power`↓ (diagnostic : convergent)
- `cmj_height`↓ (confirmative : convergente)
- `imtp_n`↓, `slimtp_n`↓ (explicative physiologique : convergente, Arbre A)
- variables de stratégie CMJ/SLCMJ normales

→ **Diagnostic** : `CLI040` éligible (2/2 diagnostiques déficitaires).
→ **Mécanismes** : Arbre A (Force absolue) seul, biomécanique et RFD non convergents.
→ **Support** : Retenue/Forte (confirmative + explicative physiologique convergentes).
→ **Orientation** : `CLI040` — *Augmenter la puissance maximale*, mécanisme cité : Force.

### Patient B — Suspectée (Constat C0, Cas B de Phase D)
- `cmj_peak_power`↓, `slcmj_peak_power` normal

→ **Diagnostic** : condition `CLI040` non remplie (une seule des deux preuves).
→ **Mécanismes** : non évalués — l'hypothèse n'atteint pas le seuil de convergence.
→ **Support** : Suspectée.
→ **Orientation** : aucune — une hypothèse Suspectée ne produit jamais de `CLI###`
(`KINEXUS_REASONING_ENGINE_V1.md` §5).

### Patient C — Retenue/Faible nue, aucune confirmative ni explicative
- `cmj_peak_power`↓, `slcmj_peak_power`↓ (diagnostic convergent)
- `cmj_height`, hop tests non testés ou normaux
- toutes les explicatives normales

→ **Diagnostic** : `CLI040` éligible.
→ **Mécanismes** : aucun identifié — Profil 5 (signal isolé), voir §5 et §9.
→ **Support** : Retenue/Faible.
→ **Orientation** : `CLI040` produite quand même (ADR-004 : le support est une métadonnée
d'affichage, pas une condition de déclenchement) — mais sans mécanisme explicatif à afficher.

### Patient D — Retenue/Modérée, confirmative seule
- `cmj_peak_power`↓, `slcmj_peak_power`↓
- `single_hop_distance`↓, `triple_hop_distance`↓ (confirmative convergente)
- toutes les explicatives normales

→ **Diagnostic** : `CLI040` éligible.
→ **Mécanismes** : aucun identifié.
→ **Support** : Retenue/Modérée (confirmative convergente, pas d'explicative).
→ **Orientation** : `CLI040`, avec métadonnée de confiance "Modérée".

### Patient E — Discordance ADR-007 (Profil 6)
- `cmj_peak_power`↓, `slcmj_peak_power`↓
- `cmj_height` **normale** (confirmative discordante)
- `imtp_n`↓ (explicative physiologique convergente)

→ **Diagnostic** : `CLI040` éligible.
→ **Mécanismes** : Arbre A (Force) convergent au niveau explicatif.
→ **Support** : Retenue/**Faible**, plafonné — la confirmative discordante empêche la transition
Faible→Modérée (ADR-007, Option C), malgré une explicative par ailleurs convergente. Le support
**ne redescend pas** en dessous de Faible et le diagnostic **n'est jamais annulé** (ADR-001).
→ **Orientation** : `CLI040`, métadonnée de confiance "Faible" malgré la convergence explicative —
illustration directe de la règle de plafonnement par catégorie.

### Patient F — Mécanisme biomécanique isolé (Profil 3)
- `cmj_peak_power`↓, `slcmj_peak_power`↓
- `imtp_n`, `slimtp_n`, RFD normaux
- `cmj_depth`, `cmj_conc_duration` anormaux (Arbre D)

→ **Diagnostic** : `CLI040` éligible.
→ **Mécanismes** : Arbre D (stratégie biomécanique) seul.
→ **Support** : Retenue/Forte si une confirmative convergente accompagne (sinon Modérée).
→ **Orientation** : `CLI040` — identique au Patient A malgré un mécanisme entièrement différent
(constat de §7).

### Patient G — Puissance relative (Profil 7, CLI041)
- `cmj_peak_power`↓, `slcmj_peak_power`↓ en valeur absolue
- signal normalisé au poids de corps (PP/BM) dans la norme

→ **Diagnostic** : `CLI040` éligible sur le critère absolu.
→ **Mécanismes** : non applicable — la distinction est de nature absolue/relative, pas causale.
→ **Support** : selon confirmatives/explicatives disponibles (non détaillé ici, orthogonal).
→ **Orientation** : **`CLI041`** plutôt que `CLI040` en présentation — *Augmenter la puissance
relative* — sous réserve de la condition de déclenchement exacte, **non documentée** (voir §5,
Profil 7).

---

## 9. CE QUE HYP-PUI-01 NE SAIT PAS ENCORE FAIRE

- **Expliquer un signal isolé.** Quand Puissance est déficitaire sans qu'aucune explicative
(physiologique ou biomécanique) ne converge, le moteur produit un état et une orientation, mais
aucune cause. Ce cas est explicitement nommé en Phase D et jugé hors périmètre du moteur de
raisonnement lui-même — non résolu ici.
- **Différencier les 7 profils combinatoires par l'orientation produite.** Les profils 1 à 6 (§5)
produisent tous, une fois Retenue atteinte, la même orientation `CLI040` — seule la métadonnée de
support diffère. Le moteur ne fabrique aujourd'hui aucune orientation mécanisme-spécifique pour
Puissance (contrairement à Force).
- **Prioriser entre mécanismes simultanément déficitaires.** Aucune règle de hiérarchisation
n'existe (§6) — c'est une décision clinique en attente, pas un vide technique comblable par
inférence.
- **Confirmer que "RFD" constitue, pour Puissance spécifiquement, un mécanisme réellement distinct
de "force absolue".** Les variables RFD (`imtp_rfd*`, `slimtp_rfd*`) sont bien explicatives de
Puissance (SOURCE EXPLICITE), mais leur statut de mécanisme séparé repose sur une analogie avec
d'autres qualités (Explosivité), pas sur une narration propre à la fiche Puissance elle-même
([INFERENCE], §3.B).
- **Fixer la condition de déclenchement de `CLI041`.** *"PP/BM diminuée"* est cité sans seuil
numérique ni règle de calcul — silence de Vierge_7 déjà signalé dans
`KINEXUS_REASONING_ENGINE_V1.md` §9.3, non résolu par ce prototype.
- **Opérationnaliser la relation Explosivité → Puissance (Arbre E).** La citation existe au niveau
qualité (`CLI040`), mais aucun mécanisme technique (quand, comment, à quel effet sur le support) n'a
été formalisé — traiter cette citation comme une règle automatique serait une invention.
- **Subdiviser le bloc "stratégie biomécanique CMJ/SLCMJ" (29 KPI).** Ce bloc reste un ensemble non
subdivisé faute de source plus fine — impossible de dire aujourd'hui si un sous-ensemble de ces
KPI (ex. freinage vs propulsion) mérite un statut causal distinct pour Puissance.
- **Distinguer un déficit "récent" d'un déficit "chronique".** Aucune dimension temporelle n'existe
dans le modèle V1 (état courant uniquement, pas d'historique de transitions au sein du raisonnement
HYP###) — non traité ici, hors périmètre du modèle figé.
- **Réfuter l'hypothèse.** Comme pour les 7 autres qualités actives, aucune condition de rejet n'est
implémentée (ADR-002, non validé) — un `HYP-PUI-01` Retenue le reste tant qu'aucune règle future
n'introduit un mécanisme de réfutation.

---

## 10. CONCLUSION

### Tableau 1 — Variables diagnostiques de Puissance

| Variable | Test | Rôle |
|---|---|---|
| `cmj_peak_power` | CMJ | Diagnostique principal |
| `slcmj_peak_power` | SLCMJ | Diagnostique principal (unilatéral) |
| `dj_peak_prop_power` | Drop Jump | Diagnostique secondaire (suppléance) |
| `sldj_peak_prop_power` | SLDJ | Diagnostique secondaire (suppléance) |
| `cmjr_peak_power` | CMJ Rebound | Diagnostique secondaire (suppléance) |

### Tableau 2 — Variables explicatives de Puissance

| Variable | Mécanisme | Statut |
|---|---|---|
| `imtp_n`, `imtp_nkg` | A — Force absolue/relative | SOURCE EXPLICITE |
| `slimtp_n`, `slimtp_nkg` | A — Force absolue/relative | SOURCE EXPLICITE |
| force segmentaire n/nkg (11 tests, sans `sh_iso_*`) | A — Force absolue/relative | SOURCE EXPLICITE |
| `imtp_rfd100`, `imtp_rfd200`, `imtp_ttpf` | B — RFD | SOURCE EXPLICITE (appartenance) / [INFERENCE] (catégorisation "mécanisme distinct") |
| `slimtp_rfd100`, `slimtp_rfd200`, `slimtp_ttpf` | B — RFD | idem |
| `profil_fv_nkg` (F0) | A / C — Force / Profil F-V | SOURCE EXPLICITE |
| `profil_fv_v0` (V0) | C — Profil force-vitesse | SOURCE EXPLICITE |
| 15 KPI stratégie CMJ | D — Stratégie biomécanique | SOURCE EXPLICITE |
| 14 KPI stratégie SLCMJ | D — Stratégie biomécanique | SOURCE EXPLICITE |
| (Explosivité, niveau qualité) | E — citation `CLI040` | SOURCE EXPLICITE (citation) / [À VALIDER] (mécanisme) |

### Tableau 3 — Mécanisme → Profil de déficit → Orientation clinique → Niveau de preuve

| Mécanisme | Profil de déficit associé | Orientation clinique | Niveau de preuve |
|---|---|---|---|
| A — Force absolue/relative | Profil 1, 2 (partiel), 4 | `CLI040` | SOURCE EXPLICITE |
| B — RFD | Profil 1, 2 | `CLI040` | [INFERENCE] pour la catégorisation |
| C — Profil force-vitesse | non couvert par un profil dédié (§5) | `CLI040` | SOURCE EXPLICITE (variables) / [À VALIDER] (lecture clinique du sous-profil) |
| D — Stratégie biomécanique | Profil 3, 4 | `CLI040` | SOURCE EXPLICITE (variables) / [À VALIDER] (lecture clinique) |
| E — Explosivité (qualité) | Profil 4 (coexistence) | `CLI040` | SOURCE EXPLICITE (citation) / [À VALIDER] (mécanisme) |
| Aucun mécanisme convergent | Profil 5 (signal isolé) | `CLI040` | SOURCE EXPLICITE (limite documentée) |
| Discordance intra-catégorie | Profil 6 | `CLI040`, support plafonné | SOURCE EXPLICITE (ADR-007) |
| Absolu vs relatif | Profil 7 | `CLI040` **ou** `CLI041` | SOURCE EXPLICITE (existence) / non documenté (seuil) |

### Réponse à la question finale

**"Si Kinexus détecte aujourd'hui une Puissance faible, jusqu'où peut-il réellement expliquer
POURQUOI elle est faible avec les données actuellement disponibles ?"**

Le moteur peut identifier, parmi cinq familles de mécanismes réellement documentées (force
absolue/relative, RFD, profil force-vitesse, stratégie biomécanique, et — à un niveau d'abstraction
différent — la qualité Explosivité), lesquelles sont concrètement déficitaires chez un athlète donné,
et graduer sa confiance clinique en conséquence (Faible/Modérée/Forte), y compris en présence de
preuves discordantes (plafonnement par catégorie, ADR-007). C'est un réel apport explicatif par
rapport à un score agrégé sans détail causal.

**Mais il s'arrête là.** Il ne peut pas dire *laquelle* de ces causes, lorsque plusieurs sont
présentes, est la plus déterminante (§6) — il ne peut pas produire une orientation clinique
différente selon le mécanisme identifié, puisqu'un seul couple d'orientations (`CLI040`/`CLI041`)
existe pour toute la qualité, sans variante mécanisme-spécifique (§7) — et il ne peut rien dire du
tout quand aucun mécanisme ne converge, alors même que le diagnostic est positif (Profil 5, cas
explicitement documenté et non résolu en Phase D). Entre "détecter un déficit" et "produire une
prescription", Kinexus V1 se situe aujourd'hui exactement au niveau intermédiaire attendu du
raisonnement clinique : il nomme des causes possibles avec un niveau de preuve tracé, sans les
classer ni les traduire en geste thérapeutique.

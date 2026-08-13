# Audit TFM vs Vierge_7 — trace de travail

## Statut de ce document

Document de travail (pas normatif). Nouvelle mission ouverte le 07/08/2026 après la cartographie
`KINEXUS_ENGINE_MAP.md`, qui a établi que `TFM` — pas `VAR_REL3` — est le seul moteur qui produit
les qualités, jauges, priorités, hypothèses et orientations réellement affichées au praticien.
`VAR_REL3` reste audité séparément dans `AUDIT_VAR_REL3_VS_VIERGE7.md` (pertinent pour Capacités et
le détail de variable, ExpertView). Ce document-ci recentre l'audit Phase A sur le mécanisme qui
compte pour la sortie clinique actuelle.

**Différence méthodologique avec l'audit VAR_REL3** : `TFM` pondère au niveau **test** (poids entier
1 à 3, table `test:{fonction:poids}`, ligne 750 de `index.html`), pas au niveau KPI comme `VAR_REL3`
(4 paliers Determinante/Majeure/Moderee/Mineure). Un poids `3` dans `TFM` est traité par
`computeMoteur()` comme un "test direct" (`directTests`, poids maximal, capable à lui seul de fixer
la borne haute du statut — voir le mécanisme de plafonnement `directStatuses.every(...)` aux
lignes 4202-4205). Les notions diagnostique/confirmative/explicative de Vierge_7 sont donc comparées ici
à un test entier, jamais à un KPI isolé — une nuance à garder en tête pour la Phase C (voir 1.8 sur
la conception cible).

**Conventions reprises de `AUDIT_VAR_REL3_VS_VIERGE7.md`** (mêmes échelles, pour rester comparable) :
- Légende : ✅ conforme · ⚠️ à reclasser · ❌ en excès · 🚫 exclusion violée · ➕ manquant.
- Gravité : 🟢 Conforme · 🟡 Écart mineur · 🟠 Écart important · 🔴 Écart critique.
- Typologie : **classification** (mauvais rôle, donnée correcte) · **couverture** (KPI/test
  inexistant dans Kinexus) · **nommage** (même info, nom différent) · **spécification**
  (incohérence interne à Vierge_7).
- Structure par qualité (8 points demandés par le praticien) : 1. Tests contribuant actuellement —
  2. Poids actuels — 3. Rôle Vierge_7 par test — 4. Violations directes — 5. Tests manquants —
  6. Gravité globale — 7. Impact produit — 8. Proposition de structure cible HYP###.

Mission actuelle : valider la méthodologie sur **une seule qualité (Mobilité)** avant de lancer
l'audit complet des 10 fonctions `TFM`.

## Méthodologie validée après Mobilité (07/08)

**Règle stricte "variables mesurées uniquement"** : l'audit — et la future architecture HYP### —
ne travaillent qu'avec des variables réellement mesurées, stockées et exploitables dans Kinexus
(catalogue de KPIs `index.html`). Douleur, gonflement, irritabilité, stratégie de protection,
raideur perçue et tout autre facteur clinique non objectivé par un test restent du ressort du
raisonnement du praticien — jamais intégrés à l'architecture du moteur. Quand Vierge_7 cite une
preuve explicative non mesurable dans Kinexus (rare, vu pour Mobilité), c'est noté comme hors
périmètre HYP###, pas comme un manque à combler.

**Structure fixe par qualité, à partir de Force** (remplace la structure en 8 points utilisée pour
Mobilité) :
1. Question clinique cible (Vierge_7)
2. Question réellement évaluée par TFM (compte tenu des tests actuellement utilisés)
3. Tests actuellement utilisés dans TFM (poids + rôle réel dans le score)
4. Comparaison avec Vierge_7 (diagnostique / confirmatif / explicatif / explicitement exclu, par
   test)
5. Violations identifiées (tests exclus utilisés / contaminations croisées / dilution du
   diagnostic / redondances)
6. Écart de question clinique (le moteur répond-il réellement à la question visée ? pourquoi,
   dans quelle mesure)
7. Gravité globale (🟢🟡🟠🔴)
8. Impact produit (ce qui changerait concrètement pour l'utilisateur si reconstruit selon
   Vierge_7)
9. Structure cible HYP### — uniquement variables mesurées/stockées/exploitables

**Ordre d'audit validé par le praticien** : Force → Puissance → Réactivité → Explosivité →
Absorption → Stabilisation → Contrôle Sensori-moteur → Endurance (Mobilité déjà terminée).

**Objectif final** (à l'issue des 9 qualités) : synthèse transversale — motifs récurrents,
contaminations croisées entre qualités, violations d'exclusions, écarts de question clinique,
qualités nécessitant une simple reconfiguration vs une reconstruction HYP### vs de nouvelles
données.

---

## 1. Mobilité

### 1.1 — Tests contribuant actuellement au score TFM

D'après `TFM.wblt`, `TFM.df_iso`, `TFM.inv_iso`, `TFM.ev_iso`, `TFM.ybt` (ligne 750) — recherche
exhaustive de `mobilite:` dans la table `TFM` :

| Test | Poids `mobilite` dans TFM |
|---|---|
| `wblt` (WBLT — Weight Bearing Lunge Test) | **3** (poids maximal — "test direct") |
| `df_iso` (force isométrique dorsiflexion cheville) | 2 |
| `inv_iso` (force isométrique inversion cheville) | 1 |
| `ev_iso` (force isométrique éversion cheville) | 1 |
| `ybt` (Y-Balance Test) | 1 |

**5 tests contribuent aujourd'hui** au score TFM de Mobilité.

### 1.2 — Poids actuels (rappel synthétique)

Échelle TFM : 1 = mineur, 2 = modéré, 3 = direct (poids maximal, capable de plafonner seul le
statut de la fonction — voir mécanisme de plafonnement lignes 4202-4205 de `index.html`).

- `wblt` : 3/3 — poids maximal.
- `df_iso` : 2/3 — poids modéré, deuxième plus haut palier possible.
- `inv_iso`, `ev_iso`, `ybt` : 1/3 chacun — poids mineur, mais tous trois comptent quand même
  dans la moyenne pondérée du statut final (`tw+=w; ts+=sc*w`, ligne 4194).

### 1.3 — Rôle selon Vierge_7, par test

| Test | Rôle Vierge_7 | Type d'écart |
|---|---|---|
| `wblt` | **Diagnostique principal** (les 4 KPIs `wblt_distance`/`wblt_lsi`/`wblt_asymmetry`/`wblt_relative_distance` sont diagnostiques ou diagnostiques-contextuels ; les mêmes variables servent aussi de "confirmatives" — Vierge_7 le dit explicitement : "la mobilité de cheville repose exclusivement sur ce test") | ✅ Conforme |
| `df_iso` | **Explicitement hors-diagnostic.** Vierge_7 : "Le score de mobilité ne doit **jamais** être construit à partir de tests de **force**" (règle de fond figée). `df_iso` est un test de force isométrique de la cheville — même catégorie que `knee_ext_n`/`soleus_iso_n`/`gastro_iso_n`, nommément exclus dans la liste "Variables de force" de la fiche Mobilité | Classification — 🔴 violation directe de la règle de fond |
| `inv_iso` | Idem — test de force isométrique (inverseurs de cheville), même catégorie exclue | Classification — 🔴 violation directe |
| `ev_iso` | Idem — test de force isométrique (éverseurs de cheville) | Classification — 🔴 violation directe |
| `ybt` | **N'apparaît dans aucune section de la fiche Mobilité de Vierge_7** (ni diagnostique, ni confirmative, ni explicative, ni même dans la liste d'exclusion — qui ne mentionne explicitement que force/puissance-réactivité/absorption-stabilisation). Mais la règle de fond est sans ambiguïté : "évaluée **uniquement** par le WBLT" — ce mot "uniquement" exclut structurellement tout autre test, YBT compris, même non nommé individuellement | Classification — 🟠 violation du principe général, bien que non nommé individuellement dans la liste d'exclusion |

### 1.4 — Tests qui violent directement la spécification (🚫)

**4 des 5 tests actuellement pondérés violent la règle de fond de Vierge_7** ("évaluée
uniquement par le WBLT, jamais à partir de tests de force, de puissance, de réactivité,
d'absorption ou de stabilisation") :

| Test | Poids TFM | Nature de la violation |
|---|---|---|
| `df_iso` | 2 | Test de force — nommément visé par l'exclusion "Variables de force" |
| `inv_iso` | 1 | Test de force — même catégorie |
| `ev_iso` | 1 | Test de force — même catégorie |
| `ybt` | 1 | Hors du périmètre "uniquement WBLT" — non nommé individuellement mais couvert par la règle générale |

Seul `wblt` (poids 3) est légitime. C'est, en proportion, **la violation la plus étendue relevée
depuis le début de la Phase A** : 4 tests sur 5 (80 %) devraient sortir du calcul, contre des
proportions bien moindres pour les qualités déjà auditées côté VAR_REL3.

**Nuance de gravité clinique** : `df_iso` (poids 2) a un impact numérique réel sur le score actuel
puisqu'il pèse presque autant que `wblt` (3) — un déficit isolé de force en dorsiflexion peut donc
aujourd'hui faire baisser artificiellement le score de Mobilité même si le WBLT lui-même est normal.
`inv_iso`/`ev_iso`/`ybt` (poids 1 chacun) ont un effet de dilution plus marginal mais réel dans une
moyenne pondérée à 4-5 contributeurs.

### 1.5 — Tests manquants

**Aucun test manquant.** Vierge_7 ne définit qu'un seul test pour cette qualité (WBLT) et il est
déjà présent dans `TFM` au poids maximal.

Nuance de grain, pas un manque : `TFM` pondère `wblt` comme un bloc unique, alors que Vierge_7
distingue 4 rôles différents pour les 4 KPIs du WBLT (diagnostique principal / diagnostique
principal unilatéral / diagnostique complémentaire unilatéral / diagnostique contextuel). Cette
distinction est structurellement invisible pour `TFM` (poids par test, pas par KPI) — ce n'est pas
un défaut de `TFM` en soi, c'est une limite de grain inhérente à sa conception, qui n'a de sens à
corriger qu'en passant à un modèle KPI-level (voir 1.8).

Point secondaire (déjà documenté dans `AUDIT_VAR_REL3_VS_VIERGE7.md`, non ré-audité ici car hors
périmètre TFM) : `wblt_lsi` n'existe pas comme KPI nommé dans le catalogue Kinexus, mais l'app
calcule déjà un LSI générique pour tout test unilatéral (`autoLSI`/`data.lsiAuto`, utilisé avec un
poids fort dans `computeTestStatus`) — la donnée existe donc en pratique, simplement pas exposée
sous ce nom. `wblt_asymmetry` et `wblt_relative_distance` restent, eux, un vrai écart de
couverture (aucun mécanisme générique ne les calcule).

### 1.6 — Gravité globale de l'écart

**🔴 Critique.** Deux raisons :
1. 80 % des tests actuellement pondérés (4/5) violent une règle de fond exprimée sans aucune
   ambiguïté par Vierge_7 ("uniquement... jamais"). C'est la proportion de violation la plus élevée
   de tout l'audit Phase A à ce stade (VAR_REL3 compris).
2. Contrairement aux qualités déjà auditées côté VAR_REL3 (où la contamination touchait
   généralement des KPIs secondaires à faible poids), ici la contamination touche un poids 2/3
   (`df_iso`) — un niveau d'influence significatif sur le statut final affiché au praticien.

### 1.7 — Impact produit

| Écart | Nature | Ce qui est nécessaire |
|---|---|---|
| `df_iso`, `inv_iso`, `ev_iso` retirés de `mobilite` dans `TFM` | Classification | Modification pure de la table `TFM` — une ligne de configuration, aucun développement |
| `ybt` retiré de `mobilite` dans `TFM` | Classification | Idem — modification de configuration seule |
| Distinction des 4 rôles WBLT (diagnostique principal/unilatéral/complémentaire/contextuel) | Nommage/grain — hors de portée de `TFM` | Nécessite un modèle KPI-level (HYP###), pas une correction de `TFM` |
| `wblt_asymmetry`/`wblt_relative_distance` | Couverture | Décision produit — développement (calcul ou import) si le praticien juge ces KPIs cliniquement utiles |

**Ce que verrait réellement le praticien après correction** : le score de Mobilité ne dépendrait
plus que du WBLT seul. Concrètement, un athlète avec une bonne mobilité de cheville au WBLT mais une
force de dorsiflexion ou d'inversion/éversion réduite ne serait plus vu comme ayant une "Mobilité
diminuée" — ce déficit de force resterait visible ailleurs (Force, Stabilisation), mais ne
contaminerait plus le score de Mobilité. Inversement, un déficit réel de dorsiflexion fonctionnelle
au WBLT ne serait plus dilué/masqué par un bon score de force ou de YBT. C'est un changement de
statut potentiellement visible sur des bilans réels dès la simple correction de configuration
`TFM` — pas besoin d'attendre HYP### pour ce gain clinique précis.

### 1.8 — Proposition de structure cible compatible HYP###

Mobilité est, par la simplicité de sa spécification Vierge_7 (un seul test, une seule question
clinique), le candidat le plus simple pour prototyper le modèle HYP### :

- **`HYP-MOB-01`** — "Dorsiflexion fonctionnelle de cheville limitée en charge", générée uniquement
  par les preuves diagnostiques `wblt_distance` (diagnostic principal) et `wblt_lsi` (diagnostic
  principal unilatéral, déjà calculable via `autoLSI` existant).
- Preuves diagnostiques secondaires : `wblt_asymmetry`/`wblt_relative_distance` (si développées,
  voir 1.7) en preuves diagnostiques complémentaires/contextuelles — jamais seules suffisantes à
  générer l'hypothèse (cohérent avec la règle transversale "une variable isolée ne valide jamais
  seule").
- Preuves explicatives physiologiques/biomécaniques : **couche actuellement vide dans Kinexus.**
  Les 17 variables explicatives listées par Vierge_7 (`ankle_joint_stiffness`, `soleus_tonus`,
  `protective_guarding`, `pain_related_restriction`, `reduced_tibial_progression`, etc.) sont toutes
  des concepts d'évaluation clinique manuelle (raideur perçue, douleur, stratégie de protection,
  compensations observées) — **aucune n'existe comme KPI issu de force-plate dans Kinexus, et
  aucune ne peut raisonnablement en devenir une** (ce sont des observations qualitatives, pas des
  mesures instrumentées). 🔶 **Point à arbitrer avec le praticien** : soit ces preuves explicatives
  restent hors du système et Mobilité n'aura jamais de couche explicative automatisée dans
  Kinexus (seulement diagnostique), soit elles justifient un futur champ de saisie manuelle/
  questionnaire clinique dédié — décision produit, pas un manque à corriger silencieusement.
- Preuves indirectes potentielles (non listées par Vierge_7, mais cohérentes avec le principe
  "une mobilité faible peut expliquer des déficits dans d'autres qualités") : un déficit de
  Puissance/Réactivité/Absorption non expliqué par ailleurs pourrait devenir une preuve indirecte
  *renforçant* `HYP-MOB-01` a posteriori — sens inverse de ce que fait `TFM` aujourd'hui (qui fait
  contribuer des tests de force AU score de Mobilité, alors que le raisonnement clinique correct va
  de la Mobilité VERS l'explication d'un déficit ailleurs, jamais l'inverse). C'est exactement la
  distinction que le modèle HYP### est censé rendre explicite.

---

## Comparaison explicite — TFM actuel vs Vierge_7 (Mobilité)

| Test | TFM aujourd'hui | Vierge_7 | Verdict |
|---|---|---|---|
| `wblt` | mobilite: 3 | Seul test légitime — diagnostique/confirmatif | ✅ **Conserver**, poids maximal justifié |
| `df_iso` | mobilite: 2 | Explicitement exclu ("Variables de force") | ❌ **Retirer** de `mobilite` dans `TFM` |
| `inv_iso` | mobilite: 1 | Explicitement exclu (même catégorie) | ❌ **Retirer** |
| `ev_iso` | mobilite: 1 | Explicitement exclu (même catégorie) | ❌ **Retirer** |
| `ybt` | mobilite: 1 | Non mentionné, mais hors périmètre par la règle "uniquement WBLT" | ❌ **Retirer** |
| *(KPI-level, hors TFM)* `wblt_lsi`/`wblt_asymmetry`/`wblt_relative_distance` | Non représentables (TFM = niveau test) | Diagnostique unilatéral/complémentaire/contextuel | ⚠️ **Reclasser** — nécessite le passage à un modèle KPI-level (HYP###), pas une correction TFM |

**Synthèse en une phrase** : sur les 5 tests actuellement pondérés pour Mobilité dans `TFM`, un
seul (`wblt`) est légitime — les 4 autres doivent disparaître de `mobilite`, sans exception ni
nuance, la règle de fond de Vierge_7 étant ici particulièrement explicite et non ambiguë.

---

## 2. Force

### 2.0 — Préalable : résolution de la duplication Vierge_7 (validée avec le praticien le 07/08)

La fiche "Force" apparaît deux fois, consécutivement, dans Vierge_7 (partie 1, lignes 4294-5019
puis fin partie 1/début partie 2). Les deux versions sont substantiellement différentes, pas de
simples variantes rédactionnelles :

| Point | Section 1 (codes `IMTP001_PEAK_FORCE`...) | Section 2 (`imtp_n`... — retenue) |
|---|---|---|
| Tests segmentaires (quadriceps/soléaire/gastro) | Diagnostique segmentaire principal | Explicative physiologique uniquement |
| Versions normalisées poids de corps (`_nkg`) | Diagnostique principal relatif | Confirmative uniquement |
| Variables CMJ/SLCMJ/DJ/SLDJ | Confirmatives + explicatives biomécaniques | **Exclues en bloc** |

**Décision validée** : audit mené contre la **Section 2**, seule cohérente en nommage avec les 5
qualités déjà auditées (`imtp_n`, `knee_ext_n`... — format Kinexus natif) et dotée d'une règle de
fond explicite et non ambiguë : *"La qualité Force est évaluée exclusivement à partir des tests
globaux de production de force maximale. Les tests segmentaires servent uniquement à expliquer
l'origine d'un déficit observé. Les variables de puissance, de mobilité, de stabilisation, de
réactivité et d'absorption ne doivent jamais participer au calcul du score de force."* La
Section 1 est écartée de l'audit, conservée ici pour mémoire — pas corrigée ni fusionnée
silencieusement dans Vierge_7 lui-même.

### 2.1 — Question clinique cible (Vierge_7)

*"Cet athlète est-il capable de produire un niveau de force maximale suffisant pour répondre aux
exigences de son activité physique ou sportive ?"* — une question strictement bornée à la capacité
maximale de production de force, explicitement détachée de la vitesse d'exécution, de la
puissance, de la réactivité, de l'absorption, de la stabilisation et de la mobilité (Vierge_7 le
précise lui-même dans sa définition).

### 2.2 — Question réellement évaluée par TFM

Avec 40 tests pondérés sur `force` — soit le plus grand nombre de contributeurs de toutes les
qualités auditées à ce stade (8× plus que Mobilité) —, la question réellement posée par `TFM`
aujourd'hui se rapproche de : *"Cet athlète performe-t-il bien, tous tests confondus (force,
puissance, réactivité, absorption, équilibre fonctionnel, sauts), sur à peu près l'ensemble du
référentiel Kinexus ?"* — une question globale de performance générale, pas une question ciblée
sur la capacité maximale de force. C'est l'antithèse de la question clinique visée par Vierge_7.

### 2.3 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `force:` dans la table `TFM` (ligne 750) — 40 tests, groupés par palier de
poids :

**Poids 3 (maximal — 17 tests, "tests directs")**

| Test | Rôle réel dans le score aujourd'hui |
|---|---|
| `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push` | Contributeurs à poids maximal — **seuls légitimes de ce groupe** |
| `knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `df_iso`, `soleus_iso`, `gastro_iso` | Contributeurs à poids **maximal**, à égalité stricte avec les 4 tests globaux ci-dessus |
| `profil_fv` | Contributeur à poids maximal |
| `sh_iso_9020`, `sh_iso_9090`, `sh_iso_6060`, `iso_squat_hold` | Contributeurs à poids maximal |
| `seated_calf_raise`, `standing_calf_raise` | Contributeurs à poids maximal |

**Poids 2 (10 tests)**

`hip_abd`, `hip_add`, `inv_iso`, `ev_iso`, `hip_rot_int`, `hip_rot_ext`, `sh_iso_3030`,
`rs_hip_push`, `rs_knee_push`, `rs_ankle_push`

**Poids 1 (12 tests)**

`cmj`, `slcmj`, `dj`, `sldj`, `landing_bi`, `landing_uni`, `sllt`, `ybt`, `side_hop`,
`single_hop`, `triple_hop`, `crossover_hop`

### 2.4 — Comparaison avec Vierge_7 (par test)

| Test | Poids TFM | Rôle Vierge_7 | Verdict |
|---|---|---|---|
| `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push` | 3 | **Diagnostique (principal / principal unilatéral)** | ✅ Conforme — les 4 seuls tests légitimes |
| `knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `df_iso` | 3 | Explicative physiologique uniquement ("Force segmentaire" — nommément listés) | ❌ Classification — poids maximal pour un rôle qui ne devrait jamais peser dans le diagnostic |
| `soleus_iso`, `gastro_iso` | 3 | Idem — explicative physiologique uniquement | ❌ Classification |
| `profil_fv` | 3 | **Absent de la fiche Force** — appartient au référentiel Puissance (déjà identifié en 1.4 de l'audit VAR_REL3 : "chaîne force-vitesse", explicatif physiologique de Puissance) | ❌ Contamination croisée — poids maximal pour un test d'une autre qualité |
| `sh_iso_9020`, `sh_iso_9090`, `sh_iso_6060`, `iso_squat_hold`, `seated_calf_raise`, `standing_calf_raise` | 3 | **Non mentionnés dans la fiche Force** (ni diagnostique, ni confirmatif, ni explicatif, ni exclu — même motif déjà observé sur Puissance, audit VAR_REL3 §1.7) | ⚠️ Hors référentiel Vierge_7 — à clarifier avant Phase C, mais poids maximal aujourd'hui pour des tests que Vierge_7 ne discute jamais pour Force |
| `hip_abd`, `hip_add`, `inv_iso`, `ev_iso` | 2 | Explicative physiologique uniquement ("Force segmentaire" — nommément listés) | ❌ Classification — poids important pour un rôle explicatif |
| `hip_rot_int`, `hip_rot_ext`, `sh_iso_3030` | 2 | Non mentionnés dans la fiche Force | ⚠️ Hors référentiel |
| `rs_hip_push`, `rs_knee_push`, `rs_ankle_push` | 2 | Explicative **biomécanique** uniquement ("Expression fonctionnelle de la force" — nommément listés) | ❌ Classification — rôle explicatif traité avec un poids de second rang |
| `cmj`, `slcmj`, `dj`, `sldj` | 1 | **Exclusion explicite et nommée** — "Variables de puissance... toutes les variables de CMJ/SLCMJ/DJ/SLDJ/CMJR... ne doivent jamais participer au calcul du score de force" | 🚫 **Violation d'exclusion directe** |
| `landing_bi`, `landing_uni`, `sllt` | 1 | **Exclusion explicite et nommée** — "Variables d'absorption... toutes les variables de Landing/SLLT" | 🚫 **Violation d'exclusion directe** |
| `ybt` | 1 | Non nommé individuellement, mais couvert par la règle de fond ("les variables de mobilité... ne doivent jamais participer") | ❌ Violation du principe général |
| `side_hop`, `single_hop`, `triple_hop`, `crossover_hop` | 1 | Non nommés individuellement, mais tests de puissance/réactivité horizontale (déjà établis comme tels dans les audits Puissance/Réactivité) — couverts par la règle de fond ("variables de puissance... de réactivité... ne doivent jamais participer") | ❌ Violation du principe général |

### 2.5 — Violations identifiées

- **Tests exclus directement utilisés (🚫, le plus sévère)** : `cmj`, `slcmj`, `dj`, `sldj`,
  `landing_bi`, `landing_uni`, `sllt` — 7 tests nommément exclus par Vierge_7 ("ne doivent jamais
  participer au calcul du score de force"), tous actuellement pondérés dans `TFM`.
- **Contamination croisée entre qualités** : `profil_fv` (poids 3, appartient au référentiel
  Puissance) est le cas le plus net. `side_hop`/`single_hop`/`triple_hop`/`crossover_hop`/`ybt`
  relèvent du même phénomène — des tests dont le rôle clinique est établi ailleurs (Puissance,
  Réactivité, Mobilité) contribuent aussi à Force sans justification Vierge_7.
- **Dilution du diagnostic, la plus sévère observée dans tout l'audit à ce stade** : 7 tests
  segmentaires (`knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `df_iso`, `soleus_iso`,
  `gastro_iso`) pèsent **à égalité stricte (poids 3)** avec les 4 vrais tests diagnostiques. Le
  score de Force actuel ne peut donc pas distinguer un déficit de force globale réelle d'un déficit
  localisé à un seul groupe musculaire — exactement la situation que la règle de fond de Vierge_7
  cherche à empêcher ("Les tests segmentaires servent uniquement à expliquer l'origine d'un déficit
  observé", jamais à le construire).
- **Redondance / absence de hiérarchie** : sur les 40 tests pondérés, **4 seulement (10 %)** sont
  légitimes selon Vierge_7. Aucun autre test audité en Phase A (VAR_REL3 ou TFM) n'atteint un tel
  écart en proportion.

### 2.6 — Écart de question clinique

**Non, le moteur ne répond pas à la question clinique visée — et l'écart est le plus important
identifié depuis le début de la Phase A.**

- *Pourquoi* : la question de Vierge_7 ("cet athlète peut-il produire un niveau de force maximale
  suffisant ?") suppose un score construit sur 4 tests globaux de force isométrique maximale,
  clairement délimités. Le score `TFM` actuel agrège 40 tests couvrant en réalité 5 des 10
  qualités du référentiel (force, puissance/explosivité via `profil_fv`, réactivité via
  `dj`/`sldj`/hop tests, absorption via `landing_bi`/`landing_uni`/`sllt`, mobilité/équilibre via
  `ybt`) — ce n'est plus une mesure de "Force" au sens de Vierge_7, c'est un indice de performance
  générale déguisé en score de qualité unique.
- *Dans quelle mesure* : seuls 4 tests sur 40 (10 %) répondent réellement à la question posée. Les
  36 autres soit répondent à une question différente (puissance, réactivité, absorption, mobilité),
  soit répondent à une sous-question légitime mais au mauvais niveau de preuve (segmentaire traité
  comme global).

### 2.7 — Gravité globale de l'écart

**🔴 Critique — le plus sévère de tout l'audit Phase A à ce stade** (VAR_REL3 et TFM confondus).
Combine les trois facteurs de gravité déjà identifiés séparément sur d'autres qualités mais jamais
réunis avec une telle ampleur : violation d'exclusion directe (7 tests), contamination croisée
inter-qualités (`profil_fv` et les tests de saut/équilibre), et dilution du diagnostic par des
tests segmentaires à poids maximal (7 tests à poids 3, égal aux tests légitimes). Proportion de
tests à corriger : 36/40 (90 %).

### 2.8 — Impact produit

Si Force était reconstruite selon Vierge_7 (4 tests globaux seulement, poids maximal réservé à
`imtp`/`slimtp`/`iso_belt_squat`/`sl_iso_push`), ce que verrait concrètement le praticien :

- Un athlète avec un déficit de force isolé à un seul groupe musculaire (ex. quadriceps) mais des
  tests globaux (IMTP, Iso Belt Squat) normaux **ne serait plus vu comme ayant une "Force
  diminuée"** — le déficit resterait visible, mais comme explication segmentaire d'un test global
  par ailleurs normal, pas comme un déficit de la qualité elle-même. C'est très probablement la
  source du plus grand nombre de faux positifs actuels sur cette qualité précise.
- Un bon profil de saut (CMJ/SLCMJ/DJ/SLDJ élevés) ou une bonne mobilité (YBT) ne pourrait plus
  "compenser" artificiellement un déficit réel de force maximale dans le score affiché — et
  inversement, un déficit de saut ne ferait plus baisser le score de Force.
- Le score de Force redeviendrait indépendant de la Puissance (`profil_fv` retiré) — condition
  nécessaire pour que les deux qualités restent des questions cliniques distinctes dans le futur
  modèle HYP###, au lieu de deux mesures partiellement redondantes du même signal.
- **Correction de configuration pure** : comme pour Mobilité, l'essentiel du gain clinique ici ne
  nécessite aucun développement — seulement une modification de la table `TFM` (retirer 36 entrées
  `force:` sur 40, ou les repondérer à 0). Aucune donnée manquante, aucun nouveau test à développer.

### 2.9 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-FOR-01`** — "Déficit de force maximale globale du membre inférieur", générée uniquement
  par les preuves diagnostiques mesurées : `imtp_n` (diagnostic principal), `slimtp_n` (diagnostic
  principal unilatéral), `iso_belt_squat_n` (diagnostic principal), `sl_iso_push_n` (diagnostic
  principal unilatéral) — 4 KPIs existants, tous déjà mesurés et stockés dans Kinexus, aucun
  développement requis.
- Preuves confirmatives (mesurées, déjà présentes) : `imtp_nkg`, `slimtp_nkg`,
  `iso_belt_squat_nkg`, `sl_iso_push_nkg` (versions normalisées au poids de corps) — renforcent
  sans jamais suffire seules, conforme à la règle transversale.
- Preuves explicatives physiologiques (mesurées, déjà présentes) : la famille "force segmentaire"
  complète — `knee_ext_n/nkg`, `knee_flex_n/nkg`, `soleus_iso_n/nkg`, `gastro_iso_n/nkg`,
  `hip_flex_n/nkg`, `hip_ext_n/nkg`, `hip_abd_n/nkg`, `hip_add_n/nkg`, `df_iso_n/nkg`,
  `inv_iso_n/nkg`, `ev_iso_n/nkg` — sert à localiser l'origine d'un déficit de force globale déjà
  confirmé, jamais à le générer.
- Preuves explicatives (cinétique de production de force, mesurées) : familles RFD/ttpf des mêmes
  tests globaux et segmentaires (`imtp_rfd100/200/ttpf`, etc.) — décrivent le profil neuromusculaire
  sans redéfinir le niveau de force maximale.
- Preuves explicatives biomécaniques (mesurées) : `rs_hip_push_*`, `rs_knee_push_*`,
  `rs_ankle_push_*` — décrivent comment la force maximale se transfère dans une tâche fonctionnelle
  spécifique.
- **Aucune variable non mesurable n'intervient dans cette qualité** (contrairement à Mobilité) —
  la fiche Force de Vierge_7 (Section 2) est entièrement construite sur des KPIs force-plate/
  dynamomètre déjà présents dans Kinexus. C'est la qualité la plus simple à reconstruire
  intégralement en HYP### sans aucun développement de collecte de données.
- Tests non couverts par Vierge_7 (`sh_iso_9020/9090/3030/6060`, `iso_squat_hold`,
  `seated_calf_raise`, `standing_calf_raise`, `hip_rot_int`, `hip_rot_ext`) : 🔶 **Point à
  arbitrer** — à clarifier avec le praticien avant Phase C (même statut que pour Puissance, voir
  audit VAR_REL3 §1.7) : rattacher à la famille "force segmentaire" explicative, ou considérer
  hors-scope de Force ?

---

## 3. Puissance

### 3.1 — Question clinique cible (Vierge_7)

*"Cet athlète est-il capable de produire un niveau élevé de puissance mécanique lors d'une action
explosive (saut vertical) ?"* — mesurée par la puissance instantanée maximale développée pendant
la phase concentrique d'un saut, bilatéral (CMJ) et unilatéral (SLCMJ). Vierge_7 est explicite :
cette qualité ne cherche ni à décrire la force maximale statique, ni la vitesse de développement de
la force (réactivité), ni la stratégie biomécanique utilisée pour l'exprimer — uniquement le niveau
de puissance produit.

### 3.2 — Question réellement évaluée par TFM

25 tests pondèrent aujourd'hui `puissance` dans `TFM` — 5× plus que les 2 tests diagnostiques de
Vierge_7. Au palier de poids maximal (3), seuls 2 des 5 tests présents (`cmj`, `slcmj`) sont
légitimes ; les 3 autres (`imtp`, `slimtp`, `profil_fv`) sont des tests de force/profil
force-vitesse que Vierge_7 réserve explicitement à l'explicatif. La question réellement posée par
`TFM` se rapproche de : *"cet athlète a-t-il, à la fois, une bonne capacité de saut et une bonne
force maximale et un bon profil force-vitesse ?"* — trois questions cliniquement différentes
(déjà séparées comme telles dans les fiches Force et Puissance de Vierge_7) fusionnées en une
seule mesure.

### 3.3 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `puissance:` dans la table `TFM` — 25 tests :

**Poids 3 (maximal — 5 tests)**

| Test | Rôle réel dans le score aujourd'hui |
|---|---|
| `cmj`, `slcmj` | Contributeurs à poids maximal — **seuls légitimes de ce groupe** |
| `imtp`, `slimtp`, `profil_fv` | Contributeurs à poids **maximal**, à égalité stricte avec `cmj`/`slcmj` |

**Poids 2 (14 tests)**

`knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `soleus_iso`, `gastro_iso`, `sl_iso_push`,
`iso_belt_squat`, `single_hop`, `triple_hop`, `crossover_hop`, `cmjr`, `seated_calf_raise`,
`standing_calf_raise`

**Poids 1 (6 tests)**

`hip_abd`, `hip_add`, `dj`, `sh_iso_9020`, `sh_iso_6060`, `iso_squat_hold`

### 3.4 — Comparaison avec Vierge_7 (par test)

| Test | Poids TFM | Rôle Vierge_7 | Verdict |
|---|---|---|---|
| `cmj` | 3 | **Diagnostique principal** (`cmj_peak_power`) | ✅ Conforme |
| `slcmj` | 3 | **Diagnostique principal unilatéral** (`slcmj_peak_power`) | ✅ Conforme |
| `imtp`, `slimtp` | 3 | Explicative physiologique uniquement ("production de force globale" — déjà établi, audit VAR_REL3 §1.2) | ❌ Classification — poids maximal pour un rôle explicatif, à égalité avec les 2 tests diagnostiques réels |
| `profil_fv` | 3 | Explicative physiologique uniquement ("chaîne force-vitesse" — déjà établi, audit VAR_REL3 §1.2) | ❌ Classification — même écart |
| `dj` | 1 | **Diagnostique principal contextuel** (`dj_peak_prop_power` — utilisé quand CMJ/SLCMJ indisponibles, voir audit VAR_REL3 §1.2bis) | ⚠️ Rôle directionnellement correct mais **sous-pondéré** (poids 1, le plus bas, pour un rôle diagnostique même contextuel) |
| `cmjr` | 2 | **Diagnostique contextuel** (`cmjr_peak_power`, idem §1.2bis) | ⚠️ Poids proportionné (inférieur à `cmj`/`slcmj`, cohérent avec son statut secondaire) — pas une violation franche |
| `single_hop`, `triple_hop` | 2 | Confirmative (tests horizontaux/fonctionnels) | ⚠️ Poids raisonnable pour une confirmative, mais toujours au même niveau qu'un test explicatif (`knee_ext` etc.) — hiérarchie interne floue |
| `crossover_hop` | 2 | **Non listé en confirmative pour Puissance** — Vierge_7 ne cite que `single_hop_distance`/`triple_hop_distance` pour cette qualité (`crossover_hop_distance` est confirmative de **Réactivité**, pas de Puissance) | ❌ Contamination croisée depuis Réactivité |
| `knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `soleus_iso`, `gastro_iso`, `sl_iso_push`, `iso_belt_squat` | 2 | Explicative physiologique uniquement ("force segmentaire/globale" — audit VAR_REL3 §1.4) | ❌ Classification — 8 tests, poids important pour un rôle explicatif |
| `hip_abd`, `hip_add`, `iso_squat_hold` | 1 | Explicative physiologique uniquement (idem §1.4) | ❌ Classification, mais poids mineur — l'écart le moins sévère de l'audit à ce stade |
| `seated_calf_raise`, `standing_calf_raise`, `sh_iso_9020`, `sh_iso_6060` | 2 / 2 / 1 / 1 | **Non mentionnés dans la fiche Puissance de Vierge_7** (déjà noté comme anomalie hors-référentiel dans l'audit VAR_REL3 §1.7) | ⚠️ Hors référentiel — statut à clarifier avant Phase C |

### 3.5 — Violations identifiées

- **Aucune violation d'exclusion directe (🚫)** — contrairement à Force. `wblt` (mobilité),
  `landing_bi`/`landing_uni`/`sllt` (absorption), `heel_raise`/`repeated_hop` (endurance) sont
  tous absents de la liste `puissance` dans `TFM`. C'est la première qualité TFM auditée sans
  aucune violation d'exclusion — le problème ici est entièrement un problème de **classification**
  et de **contamination croisée**, pas d'exclusions bafouées.
- **Contamination croisée entre qualités** : `imtp`/`slimtp` (Force), `profil_fv` (leur propre
  rôle explicatif de Puissance, mais traité comme diagnostique), `crossover_hop` (Réactivité).
- **Dilution du diagnostic au palier le plus influent** : au poids maximal (3), seuls 2 tests sur
  5 sont légitimes — `cmj`/`slcmj` partagent la borne haute du score avec 3 tests qui, selon
  Vierge_7, ne devraient jamais y figurer. Même mécanisme que Force, à une échelle un peu moindre
  (2/5 légitimes au palier max ici, contre 4/17 pour Force).
- **Pas de redondance flagrante** : les tests contextuels (`dj`, `cmjr`) et confirmatifs
  (`single_hop`, `triple_hop`) ont des rôles Vierge_7 réels, simplement mal calibrés en poids —
  différent des tests purement hors-sujet (`imtp`, `profil_fv`, `crossover_hop`).

### 3.6 — Écart de question clinique

**Oui, mais moins radicalement que pour Force.** Le moteur `TFM` répond partiellement à la bonne
question — `cmj`/`slcmj` sont bien présents et à poids maximal — mais cette réponse est diluée par
3 tests (`imtp`, `slimtp`, `profil_fv`) qui pèsent **autant** que les tests diagnostiques réels.
Sur 25 tests pondérés, environ 19 (76 %) nécessitent une correction (retrait ou repondération) —
un ratio élevé mais inférieur à celui de Force (90 %), et sans aucune violation d'exclusion directe
contrairement à Force. Le score de Puissance actuel se rapproche donc d'un "indice de capacité
globale du membre inférieur" plutôt que d'une mesure ciblée de la puissance de saut.

### 3.7 — Gravité globale de l'écart

**🔴 Critique**, mais d'une nature différente de Force : ici, la gravité vient exclusivement de la
**dilution par des tests explicatifs mal pondérés** (poids 3 pour un rôle qui ne devrait jamais
compter dans le diagnostic) et d'une **contamination croisée limitée** (`crossover_hop`), pas de
violations d'exclusion. Les 2 tests diagnostiques réels sont au moins présents et correctement
pondérés au maximum — ce n'est pas encore le cas pour toutes les qualités restantes à auditer.

### 3.8 — Impact produit

Si Puissance était reconstruite selon Vierge_7 (diagnostic porté uniquement par `cmj`/`slcmj`,
`dj`/`cmjr` en diagnostic contextuel secondaire) :

- Un athlète avec une bonne force maximale (IMTP) ou un bon profil force-vitesse mais une puissance
  de saut réellement diminuée (`cmj_peak_power` bas) **ne serait plus vu comme ayant une "Puissance
  normale"** grâce à la contribution d'`imtp`/`profil_fv` — inversement, une bonne puissance de saut
  ne serait plus masquée par un déficit de force isométrique statique.
- Le score de Puissance redeviendrait indépendant du score de Force (`imtp`/`slimtp` retirés des
  deux côtés de la contamination croisée identifiée en Force §2.4) — condition nécessaire pour que
  Force et Puissance restent deux questions cliniques distinctes.
- **Correction de configuration pure**, comme pour Mobilité et Force : aucune donnée manquante,
  uniquement une modification de la table `TFM`.

### 3.9 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-PUI-01`** — "Déficit de puissance de saut", générée uniquement par les preuves
  diagnostiques mesurées : `cmj_peak_power` (diagnostic principal), `slcmj_peak_power` (diagnostic
  principal unilatéral) — déjà mesurées et stockées, aucun développement requis.
- Preuves diagnostiques secondaires/contextuelles (mesurées, déjà présentes) : `dj_peak_prop_power`,
  `sldj_peak_prop_power`, `cmjr_peak_power` — utilisées quand CMJ/SLCMJ indisponibles, jamais comme
  substituts à poids égal (point déjà tranché en Phase A, audit VAR_REL3 §1.2bis, proposition
  reprise ici).
- Preuves confirmatives (mesurées) : `cmj_height`, `single_hop_distance`, `triple_hop_distance`.
- Preuves explicatives physiologiques (mesurées) : `imtp_*`, `slimtp_*`, `profil_fv_nkg`/`v0`,
  famille "force segmentaire" complète (`knee_ext_*`, `knee_flex_*`, `soleus_iso_*`, `gastro_iso_*`,
  `hip_flex_*`, `hip_ext_*`, `hip_abd_*`, `hip_add_*`, `sl_iso_push_*`, `iso_belt_squat_*`,
  `iso_squat_hold_*`) — toutes déjà mesurées, servent à expliquer un déficit de puissance déjà
  confirmé, jamais à le construire.
- Preuves explicatives biomécaniques (mesurées) : les 30 KPIs CMJ/SLCMJ déjà cartographiés en
  excès diagnostique dans l'audit VAR_REL3 §1.2/1.5 (`cmj_peak_vel`, `cmj_depth`,
  `cmj_conc_mean_force`, `slcmj_rsi_mod`, etc.) — décrivent la stratégie d'expression, jamais le
  niveau de puissance lui-même.
- `crossover_hop_distance` : à retirer du référentiel Puissance (contamination confirmée depuis
  Réactivité) — reste une preuve confirmative légitime de Réactivité, où elle est déjà correctement
  positionnée.
- `seated_calf_raise`, `standing_calf_raise`, `sh_iso_9020`, `sh_iso_6060` : 🔶 **Point à
  arbitrer**, même statut que pour Force (§2.9) — hors référentiel Vierge_7, à trancher une seule
  fois pour les deux qualités plutôt que séparément.

---

## 4. Réactivité

### 4.1 — Question clinique cible (Vierge_7)

*"Cet athlète est-il capable de restituer rapidement la force après un contact au sol ou une
contrainte de freinage ?"* — mesurée par le RSI (Reactive Strength Index) du Drop Jump bilatéral
(DJ) et unilatéral (SLDJ). Vierge_7 est explicite : cette qualité "ne se confond ni avec la
puissance pure, ni avec l'absorption seule, ni avec la force maximale."

### 4.2 — Question réellement évaluée par TFM

19 tests pondèrent aujourd'hui `reactivite` dans `TFM`. Au palier de poids maximal (3), 3 tests
sont présents (`dj`, `sldj`, `cmjr`) — mais un seul des trois (`cmjr`) n'a en réalité aucun rôle
diagnostique selon Vierge_7 : le CMJR n'y figure qu'en confirmative et en explicative
biomécanique. La question réellement posée se rapproche de : *"cet athlète restitue-t-il bien la
force au premier contact ET sur des contacts répétés ?"* — une fusion de deux questions cliniques
que Vierge_7 sépare précisément (réactivité "au premier contact" vs. réactivité "répétée dans le
temps", cette dernière frôlant l'endurance/fatigue — voir l'incohérence Vierge_7 déjà documentée en
§2.8 de l'audit VAR_REL3).

### 4.3 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `reactivite:` dans la table `TFM` — 19 tests :

**Poids 3 (maximal — 3 tests)**

| Test | Rôle réel dans le score aujourd'hui |
|---|---|
| `dj`, `sldj` | Contributeurs à poids maximal — **seuls légitimes de ce groupe** |
| `cmjr` | Contributeur à poids **maximal**, à égalité stricte avec `dj`/`sldj` |

**Poids 2 (7 tests)**

`soleus_iso`, `gastro_iso`, `repeated_hop`, `triple_hop`, `crossover_hop`, `seated_calf_raise`,
`standing_calf_raise`

**Poids 1 (9 tests)**

`wblt`, `hip_rot_ext`, `sl_iso_push`, `cmj`, `slcmj`, `side_hop`, `single_hop`, `heel_raise`,
`rs_ankle_push`

### 4.4 — Comparaison avec Vierge_7 (par test)

| Test | Poids TFM | Rôle Vierge_7 | Verdict |
|---|---|---|---|
| `dj` | 3 | **Diagnostique principal** (`dj_rsi`) | ✅ Conforme |
| `sldj` | 3 | **Diagnostique principal unilatéral** (`sldj_rsi`) | ✅ Conforme |
| `cmjr` | 3 | Confirmative + explicative biomécanique uniquement — **jamais diagnostique** dans la fiche Réactivité | ❌ Classification — poids maximal pour un rôle qui ne devrait jamais fixer le diagnostic, à égalité stricte avec `dj`/`sldj`. Fait écho à un écart déjà repéré côté VAR_REL3 (§2.6/2.8), où le même excès était présent mais rendu inerte par l'anomalie d'orthographe (§0) — ici, dans `TFM`, il est **actif et réel** |
| `triple_hop`, `crossover_hop` | 2 | Confirmative (tests horizontaux/fonctionnels — les deux explicitement listés pour Réactivité, contrairement à Puissance où `crossover_hop` était une contamination) | ⚠️ Rôle correct, poids raisonnable — pas une violation franche |
| `soleus_iso`, `gastro_iso` | 2 | Explicative physiologique uniquement ("production de force rapide" — famille RFD) | ❌ Classification — poids important pour un rôle explicatif |
| `repeated_hop` | 2 | **Rôle ambigu dans Vierge_7 lui-même** — cité comme confirmative au niveau test, mais la quasi-totalité de ses KPIs sont explicitement listés comme exclusion "endurance/fatigue" (incohérence déjà signalée, audit VAR_REL3 §2.8 pt.1) | 🔶 Non tranchable sans clarification de Vierge_7 — ni classé conforme ni classé violation ici |
| `seated_calf_raise`, `standing_calf_raise` | 2 | Non mentionnés dans la fiche Réactivité de Vierge_7 | ⚠️ Hors référentiel |
| `wblt` | 1 | **Exclusion explicite et nommée** — "variables de mobilité... ne doivent pas construire le diagnostic de réactivité" | 🚫 **Violation d'exclusion directe** |
| `heel_raise` | 1 | **Exclusion explicite et nommée** — "variables d'endurance/fatigue" | 🚫 **Violation d'exclusion directe** |
| `cmj`, `slcmj` | 1 | **N'apparaissent dans aucune section de la fiche Réactivité** — le CMJ "simple" est absent de cette qualité chez Vierge_7 (seuls DJ/SLDJ/CMJR y figurent) | ❌ Contamination croisée depuis Puissance |
| `single_hop` | 1 | Confirmative (tests horizontaux/fonctionnels) | ⚠️ Rôle correct, poids un peu bas mais pas une violation |
| `sl_iso_push` | 1 | Explicative physiologique uniquement ("production de force rapide globale") | ❌ Classification, poids mineur — écart peu sévère |
| `hip_rot_ext`, `rs_ankle_push`, `side_hop` | 1 | Non mentionnés dans la fiche Réactivité de Vierge_7 | ⚠️ Hors référentiel / contamination mineure (`side_hop` a son rôle principal en Contrôle Frontal selon `TFM` lui-même) |

### 4.5 — Violations identifiées

- **2 violations d'exclusion directes (🚫)** : `wblt` (mobilité) et `heel_raise` (endurance/fatigue)
  — moins nombreuses que Force (7) mais bien réelles, contrairement à Puissance (0). Réactivité se
  positionne donc **entre les deux profils déjà observés**.
- **Contamination croisée** : `cmj`/`slcmj` (Puissance, absents de la fiche Réactivité), `side_hop`
  (rôle principal Contrôle Frontal selon `TFM` lui-même).
- **Dilution du diagnostic au palier le plus influent** : comme pour Force et Puissance, le palier
  de poids maximal (3) mélange les vrais tests diagnostiques (`dj`, `sldj`) avec un test qui n'a
  aucun rôle diagnostique chez Vierge_7 (`cmjr`) — 2 tests légitimes sur 3 au palier max (67 %),
  un ratio intermédiaire entre Puissance (2/5 = 40 %) et Force (4/17 = 24 %).
- **Redondance conceptuelle confirmée** : l'excès de `cmjr` ici, actif dans `TFM`, est le même excès
  que celui déjà repéré dans `VAR_REL3` (§2.6) mais qui y était rendu inerte par l'anomalie
  d'orthographe (section 0 de l'audit VAR_REL3). Ce recoupement indépendant, sur deux mécanismes
  différents, renforce la confiance dans ce diagnostic : ce n'est pas un artefact d'un seul moteur,
  c'est une confusion clinique réelle et répétée entre "réactivité au premier contact" et
  "réactivité répétée" dans la conception même du référentiel actuel.

### 4.6 — Écart de question clinique

**Oui, modérément — Réactivité se situe entre Puissance et Force sur ce critère.** Le diagnostic
`dj`/`sldj` est présent et correctement pondéré au maximum (comme pour Puissance), mais il est dilué
par `cmjr` au même palier (mécanisme de dilution proche de Force, bien que moins étendu). Sur 19
tests pondérés, 2 violations d'exclusion actives (comme Force, en plus petit nombre) plutôt
qu'aucune (comme Puissance). Environ 13-14 tests sur 19 (68-74 %) nécessitent une correction —
ratio proche de celui de Puissance (76 %), mais la présence de violations d'exclusion rapproche le
profil qualitatif de Réactivité de celui de Force.

**Réactivité suit un modèle hybride, ni franchement "Mobilité/Force" ni franchement "Puissance"** :
- Comme Force/Mobilité : violations d'exclusion actives et nommées (`wblt`, `heel_raise`).
- Comme Puissance : le gros du volume d'écart vient de la dilution/classification (13 tests sur
  19), pas des exclusions (2 tests sur 19) — et le ratio global de correction est du même ordre de
  grandeur.
- Signal propre à Réactivité, absent des deux autres : une **incohérence de spécification
  Vierge_7 elle-même** (`repeated_hop`) qui empêche de trancher une partie de l'audit sans
  clarification du praticien.

### 4.7 — Gravité globale de l'écart

**🔴 Critique** — 2 violations d'exclusion actives + dilution au palier maximal + contamination
croisée. Moins sévère que Force (violations d'exclusion moins nombreuses, dilution moins étendue
en proportion) mais plus sévère que Puissance sur le critère spécifique des exclusions (0 → 2).

### 4.8 — Impact produit

Si Réactivité était reconstruite selon Vierge_7 (diagnostic porté uniquement par `dj`/`sldj`) :

- Un athlète en fatigue de contacts répétés (`cmjr`/`repeated_hop` dégradés) mais avec un premier
  contact réactif normal (`dj`/`sldj` bons) **ne serait plus vu comme ayant une "Réactivité
  diminuée"** — ce signal redeviendrait ce qu'il est cliniquement : un indice d'endurance/fatigue,
  pas un déficit de réactivité de base. C'est la correction la plus significative de cette qualité.
- Un déficit isolé de mobilité de cheville (WBLT) ou d'endurance (heel raise) ne pourrait plus, même
  marginalement, faire baisser le score de Réactivité affiché.
- Le score de Réactivité redeviendrait indépendant de celui de Puissance (`cmj`/`slcmj` retirés).
- **Correction de configuration pure** pour l'essentiel — seul le statut de `repeated_hop` nécessite
  une clarification de Vierge_7 avant toute correction de `TFM` sur ce point précis.

### 4.9 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-REA-01`** — "Déficit de réactivité au premier contact", générée uniquement par
  `dj_rsi` (diagnostic principal) et `sldj_rsi` (diagnostic principal unilatéral) — déjà mesurées,
  aucun développement requis.
- Preuves confirmatives (mesurées) : `dj_height`, `dj_contact_time`, `dj_peak_prop_force`,
  `dj_peak_prop_power`, `dj_leg_stiffness`, `sldj_*` équivalents, `single_hop_distance`,
  `triple_hop_distance`, `crossover_hop_distance`.
- Preuves explicatives physiologiques (mesurées) : familles RFD (`imtp_rfd*`, `slimtp_rfd*`,
  `soleus_iso_rfd*`, `gastro_iso_rfd*`, `sl_iso_push_rfd*`, etc.), `profil_fv_nkg`/`v0`.
- Preuves explicatives biomécaniques (mesurées) : KPIs DJ/SLDJ de stratégie (contact time, leg
  stiffness, landing impulse/force), `cmjr_mean_ct`/`mean_stiffness`/`mean_rebound_height`/
  `rsi_decay`/`stiffness_decay` — **le CMJR entier passe en preuve explicative biomécanique, jamais
  diagnostique**, corrigeant à la fois l'écart `TFM` (§4.4) et l'écart `VAR_REL3` (§2.2/2.6) par la
  même décision de conception.
- **Preuve indirecte candidate, distincte du diagnostic principal** : une dégradation de
  `repeated_hop_mean_rsi` dans le temps, en présence d'un `dj_rsi` normal, deviendrait une preuve
  d'une hypothèse *différente* ("déficit d'endurance de réactivité"), pas un renforcement de
  `HYP-REA-01`. 🔶 **Point à arbitrer avec le praticien** avant Phase C : cette hypothèse distincte
  fait-elle partie du périmètre "Réactivité", ou bascule-t-elle entièrement dans "Endurance" (qualité
  encore non auditée) ? Vierge_7 ne tranche pas explicitement ce point (voir 4.4).
- `wblt`, `heel_raise`, `cmj`/`slcmj`, `side_hop` : retirés — aucun rôle, quel qu'il soit, dans le
  référentiel Réactivité de Vierge_7.

### 4.10 — Observation pour la synthèse transversale (famille A/B/C)

Réactivité **ne confirme ni n'infirme proprement** l'hypothèse à trois familles évoquée par le
praticien — elle illustre plutôt qu'une qualité peut cumuler des traits de plusieurs familles à la
fois : des violations d'exclusion réelles mais limitées (trait "Famille A"), une hiérarchisation
interne largement absente au palier maximal (trait "Famille B"), et un point de couverture non
résolu — le statut de `repeated_hop` — qui touche autant à une ambiguïté de spécification qu'à une
question de couverture de données. Trois qualités seulement auditées à ce stade côté `TFM` :
prématuré pour figer la typologie, mais le motif "dilution au palier maximal par un test au rôle
confirmatif/explicatif mal calibré" (`imtp`/`profil_fv` pour Puissance, tests segmentaires pour
Force, `cmjr` pour Réactivité) apparaît désormais sur les 3 qualités sans exception — c'est,
à ce stade, le motif récurrent le plus solide de toute la Phase A.

---

## 5. Explosivité

### 5.0 — Anomalie de nommage interne à la fiche Vierge_7 (documentée, non résolue)

Contrairement à Force (deux fiches complètes dupliquées), l'anomalie ici touche **une seule fiche**
mais avec une rupture de convention en son sein : les sections "PREUVES DIAGNOSTIQUES", "PREUVES
CONFIRMATIVES" et "VARIABLES EXCLUES" utilisent des codes majuscules (`CMJ_RFD_100`, `CMJ_PP_BM`,
`DJ_PEAK_PROP_POWER`...), tandis que la section "PREUVES EXPLICATIVES PHYSIOLOGIQUES", **dans la
même fiche**, utilise le nommage `snake_case` natif Kinexus (`imtp_rfd100`, `knee_ext_rfd50`...).
Je documente ce constat sans le corriger : la correspondance code→variable utilisée ci-dessous
(`CMJ_PP_BM` → `cmj_peak_power`, `CMJ_JH` → `cmj_height`, etc.) est une interprétation raisonnable
mais non validée par le praticien, à vérifier avant Phase C si un doute clinique apparaît sur un
mapping précis.

### 5.1 — Question clinique cible (Vierge_7)

*"Cet athlète est-il capable de développer rapidement une force importante dans les tâches où la
montée en force est un enjeu central ?"* — Vierge_7 la distingue explicitement de la force maximale,
de la puissance pure, de la réactivité, de l'absorption, de la stabilisation et de la mobilité.
Opérationnellement, Vierge_7 cible la **vitesse de développement de la force en phase concentrique
précoce du CMJ** (RFD à 100/150/200 ms + impulsion à 100 ms) — un sous-ensemble temporel très
spécifique de la courbe force-temps.

### 5.2 — Question réellement évaluée par TFM

**TFM et Vierge_7 ne mesurent pas la même chose, et la divergence est double** (nouveauté par
rapport aux 4 qualités précédentes) :
1. **Divergence de configuration** (déjà vue sur Force/Puissance/Réactivité) : 23 tests pondèrent
   `explosivite`, la plupart hors du périmètre Vierge_7.
2. **Divergence de couverture de données, propre à cette qualité** : même en imaginant `TFM`
   parfaitement reconfiguré pour ne garder que `cmj`/`slcmj`, la preuve diagnostique que Vierge_7
   demande (RFD fenêtré à 100/150/200 ms) **n'existe pas dans le catalogue de KPIs CMJ de
   Kinexus** — celui-ci n'a qu'un `conc_rfd` unique non fenêtré et un `conc_impulse_100` (un seul
   des deux "compléments" demandés). Voir 5.5.

La question réellement évaluée aujourd'hui se rapproche donc de : *"cet athlète a-t-il, au sens
large, une bonne force/puissance/explosivité du membre inférieur ?"* — et même après correction de
`TFM`, la question resterait *"cet athlète saute-t-il haut/vite ?"* plutôt que la question ciblée
de Vierge_7 sur la fenêtre temporelle précoce de la montée en force.

### 5.3 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `explosivite:` dans la table `TFM` — 23 tests :

**Poids 3 (maximal — 2 tests)**

| Test | Rôle réel dans le score aujourd'hui |
|---|---|
| `cmj`, `slcmj` | Seuls tests où vit, en théorie, la preuve diagnostique Vierge_7 — mais voir 5.4/5.5 pour la réserve structurelle majeure |

**Poids 2 (16 tests)**

`knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `soleus_iso`, `gastro_iso`, `sl_iso_push`,
`iso_belt_squat`, `profil_fv`, `imtp`, `slimtp`, `rs_hip_push`, `rs_knee_push`, `rs_ankle_push`,
`seated_calf_raise`, `standing_calf_raise`

**Poids 1 (5 tests)**

`sh_iso_9020`, `sh_iso_3030`, `sh_iso_6060`, `iso_squat_hold`, `cmjr`

### 5.4 — Promoteurs diagnostiques illégitimes (section dédiée)

**Au palier de poids maximal (3) : aucun.** C'est une première dans cet audit — `cmj` et `slcmj`
sont, tous deux, des tests où la preuve diagnostique Vierge_7 vit réellement (même si elle n'y est
pas complètement calculable, voir 5.5). Contrairement à Force (7 tests segmentaires promus à
poids 3), Puissance (`imtp`/`slimtp`/`profil_fv` promus à poids 3) et Réactivité (`cmjr` promu à
poids 3), **aucun test structurellement illégitime n'occupe le palier maximal pour Explosivité.**

**Mais un promoteur illégitime opère probablement à l'intérieur même de `cmj`/`slcmj`, invisible au
niveau de la table `TFM`.** `computeTestStatus()` (ligne 4171) calcule un statut unique par test en
moyennant tous les KPIs de ce test qui possèdent un seuil exploitable (`NORMS` ou, à défaut,
`THRESHOLDS`). Or `THRESHOLDS` (ligne 1214) ne couvre, pour `cmj`, que `cmj_height` et
`cmj_rsi_mod` — **aucun seuil statique pour `cmj_conc_rfd`, `cmj_conc_impulse_100`, ni aucune autre
variable réellement diagnostique d'Explosivité.** `cmj_height` (= `CMJ_JH`) est en outre
**explicitement exclue** du diagnostic d'Explosivité par Vierge_7. Sous réserve de la couverture
effective de `NORMS` par population (non auditée ici, hors périmètre de cette mission), le statut
"cmj" qui alimente `explosivite` à poids maximal risque donc d'être **dominé, dans la pratique, par
une variable explicitement exclue** — un promoteur illégitime caché par la granularité de `TFM`,
pas visible dans sa table de configuration. C'est un cas de **limite structurelle de TFM** distinct
de tout ce qui a été observé sur les 4 qualités précédentes.

### 5.5 — Comparaison avec Vierge_7 (par test)

| Test | Poids TFM | Rôle Vierge_7 | Verdict |
|---|---|---|---|
| `cmj`, `slcmj` | 3 | Diagnostique (RFD fenêtré 100/150/200ms + impulsion 100ms) — **mais la majorité de ces KPIs n'existe pas dans le catalogue Kinexus** (`cmj_conc_rfd` existe, non fenêtré ; `cmj_conc_impulse_100` existe ; pas d'équivalent RFD-150/200) | 🔶 Test correct en principe, **écart de couverture** sur la preuve elle-même + réserve structurelle (5.4) |
| `imtp`, `slimtp`, `iso_belt_squat`, `sl_iso_push` | 2 | Explicative physiologique uniquement ("production de force rapide globale") | ❌ Classification |
| `knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `soleus_iso`, `gastro_iso` | 2 | Explicative physiologique uniquement ("production de force segmentaire") | ❌ Classification (6 tests) |
| `profil_fv` | 2 | Explicative physiologique uniquement ("chaîne force-vitesse") | ❌ Classification |
| `iso_squat_hold` | 1 | Explicative physiologique uniquement (nommément listé) | ❌ Classification, mais poids mineur — peu sévère |
| `rs_hip_push`, `rs_knee_push`, `rs_ankle_push` | 2 | **Non mentionnés dans la fiche Explosivité** (rôle établi ailleurs — explicative biomécanique de Force) | ⚠️ Hors référentiel / contamination croisée |
| `seated_calf_raise`, `standing_calf_raise`, `sh_iso_9020`, `sh_iso_3030`, `sh_iso_6060` | 2/2/1/1/1 | Non mentionnés dans la fiche Explosivité | ⚠️ Hors référentiel |
| `cmjr` | 1 | **Exclusion explicite et nommée** ("CMJR_PEAK_POWER, CMJR_MEAN_RSI, CMJR_MEAN_REBOUND_HEIGHT... ne doivent pas construire le diagnostic") | 🚫 **Violation d'exclusion directe** |
| `dj`, `sldj` | — | Exclusion explicite et nommée (variables de puissance/réactivité) | 🟢 **Correctement absents** de `TFM.explosivite` |

### 5.6 — Violations identifiées

- **1 violation d'exclusion directe (🚫)** : `cmjr` — la moins nombreuse des 4 qualités TFM
  auditées avec au moins une violation (Force : 7, Réactivité : 2, Explosivité : 1), et la seule où
  les autres familles explicitement exclues (`dj`/`sldj`, mobilité, stabilisation, absorption) sont
  **toutes** correctement absentes.
- **Aucune contamination croisée au palier maximal** — nouveauté de cette qualité (voir 5.4).
- **Contamination croisée aux paliers inférieurs** : `rs_hip_push`/`rs_knee_push`/`rs_ankle_push`
  (rôle réel = Force), `seated_calf_raise`/`standing_calf_raise`/`sh_iso_*` (hors référentiel
  Vierge_7 dans toutes les qualités auditées jusqu'ici).
- **Dilution du diagnostic classique** : 11 tests explicatifs physiologiques (RFD segmentaire +
  globale + profil F-V) pèsent à poids 2, un cran sous `cmj`/`slcmj` — hiérarchie respectée en
  apparence, mais toujours un rôle qui ne devrait jamais peser dans le diagnostic.
- **Donnée manquante — nouveau, dominant sur cette qualité** : la preuve diagnostique elle-même
  (RFD fenêtré CMJ à 100/150/200 ms) n'existe qu'à moitié dans Kinexus. Aucune des 4 qualités
  précédentes n'avait ce problème — leurs preuves diagnostiques (peak_power, RSI, peak_force au
  test global) sont toutes déjà pleinement capturées.

### 5.7 — Écart de question clinique

**Oui, et c'est la première qualité où l'écart persiste même après correction complète de `TFM`.**
Pour Force/Puissance/Réactivité, une reconfiguration pure de `TFM` (retirer les tests illégitimes)
suffirait à aligner le score sur la question clinique de Vierge_7. Pour Explosivité, **même
`cmj`/`slcmj` seuls, correctement isolés, ne répondraient pas à la question posée** — Kinexus ne
capture pas la fenêtre temporelle précoce (100/150/200 ms) sur laquelle Vierge_7 fonde tout son
diagnostic. Le score corrigé se rapprocherait au mieux d'un indicateur RFD généraliste
(`cmj_conc_rfd`, non fenêtré) — une approximation de la question clinique, pas une réponse exacte.

### 5.8 — Nature dominante de l'écart

| Cause | Rôle |
|---|---|
| **Donnée manquante** | **Dominante** — première qualité TFM où ce facteur prime sur la classification. La preuve diagnostique visée par Vierge_7 (RFD CMJ fenêtré) n'est que partiellement calculable dans Kinexus |
| Limite structurelle TFM | Secondaire mais significative — `computeTestStatus` agrège tous les KPIs seuillés d'un test sans distinguer leur rôle clinique ; combinée à la couverture étroite de `THRESHOLDS`, elle risque de faire porter le statut "cmj" par `cmj_height`, une variable explicitement exclue |
| Dilution diagnostique | Secondaire — 11 tests explicatifs à poids 2 |
| Contamination croisée | Secondaire — `rs_*`, tests hors référentiel |
| Violation d'exclusion | Mineure — 1 seul test (`cmjr`), poids faible |
| Mauvaise question clinique | Présente mais dérivée des causes ci-dessus, pas une cause première indépendante ici |

### 5.9 — Gravité globale de l'écart

**🔴 Critique**, mais d'une nature qualitativement différente des 4 qualités précédentes : la
gravité ne vient pas principalement de tests illégitimes à corriger (il y en a peu au palier
maximal — une première), mais du fait que **la correction de configuration seule ne suffira pas** à
aligner le moteur sur Vierge_7. C'est la première qualité de l'audit où un plafond de données
limite le gain atteignable par une simple reconfiguration de `TFM`.

### 5.10 — Ratio de dilution

- **Contributeurs TFM : 23**
- **Contributeurs diagnostiques attendus (Vierge_7) : 2** (`cmj`, `slcmj` — au niveau test ; 0 au
  niveau KPI si l'on exige la fenêtre RFD 100/150/200ms exacte, faute de couverture, voir 5.5)
- **Ratio de dilution : 23/2 ≈ 11,5×** — le plus élevé des 5 qualités TFM auditées à ce stade
  (comparaison ci-dessous), alors même que la gravité qualitative (peu de tests au palier max)
  serait, prise isolément, la moins alarmante.

### 5.11 — Impact produit

Si Explosivité était reconstruite selon Vierge_7 :

- Un athlète avec une bonne force maximale (IMTP), une bonne puissance de saut (CMJ peak power) ou
  un bon profil force-vitesse mais une montée en force réellement lente en phase précoce du CMJ
  **ne serait plus vu comme "Explosivité normale"** par simple compensation d'autres qualités —
  sous réserve du plafond de couverture de données (5.7).
- Retirer `cmjr` élimine une contamination directe avec la réactivité répétée.
- **Contrairement aux 4 qualités précédentes, le gain clinique ici est plafonné par les données
  disponibles** : une reconfiguration de `TFM` seule rapprochera le score de la question clinique
  sans jamais l'atteindre complètement, sauf développement d'un RFD fenêtré CMJ (100/150/200 ms)
  dans le pipeline d'extraction — décision produit, pas seulement une correction de configuration.

### 5.12 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-EXP-01`** — "Déficit de montée rapide en force", générée par les preuves diagnostiques
  **effectivement mesurées** : `cmj_conc_rfd` (RFD concentrique non fenêtré — la meilleure
  approximation disponible), `cmj_conc_impulse_100` (impulsion à 100ms — correspond bien à
  `CMJ_IMPULSE_100MS`), et leurs équivalents `slcmj_edrfd_bm`/`slcmj_braking_rfd` pour la version
  unilatérale (à confirmer avec le praticien — ces KPIs SLCMJ ne sont pas des correspondances
  exactes du concept concentrique visé, voir 5.0).
- **Aucune preuve diagnostique fenêtrée (150/200ms) disponible** — 🔶 **Point à arbitrer** : le
  praticien souhaite-t-il ouvrir un chantier d'enrichissement du pipeline CMJ (ajout de RFD fenêtré,
  comme cela existe déjà pour IMTP/SLIMTP/tests segmentaires) pour aligner Kinexus sur la
  spécification Vierge_7, ou accepter `cmj_conc_rfd` non fenêtré comme approximation durable ?
  Décision produit, pas un manque à corriger silencieusement.
- Preuves confirmatives (mesurées) : `cmj_peak_power`, `cmj_conc_peak_force`, `cmj_conc_mean_force`,
  `cmj_conc_impulse`.
- Preuves explicatives physiologiques (mesurées) : familles RFD `imtp_rfd*`, `slimtp_rfd*`,
  `iso_belt_squat_rfd*`, `sl_iso_push_rfd*`, `iso_squat_hold_rfd*`, RFD segmentaire complète,
  `profil_fv_nkg`/`v0`.
- Preuves explicatives biomécaniques (mesurées) : `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`,
  `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, `cmj_braking_rfd` (probable équivalent de
  `CMJ_ECC_DECEL_RFD`, même correspondance de nommage déjà notée pour Absorption).
- `cmjr` : retiré intégralement — aucun rôle dans le référentiel Explosivité de Vierge_7.
- `rs_hip_push`/`rs_knee_push`/`rs_ankle_push`, `seated_calf_raise`/`standing_calf_raise`,
  `sh_iso_*` : 🔶 même point à arbitrer que pour Force/Puissance (hors référentiel Vierge_7).

### 5.13 — Comparaison transversale (Mobilité, Force, Puissance, Réactivité, Explosivité, Absorption)

| Qualité | Contributeurs TFM (X) | Diagnostiques attendus (Y) | Ratio X/Y | Violations d'exclusion actives | Promoteurs illégitimes au palier max | Profil dominant |
|---|---|---|---|---|---|---|
| Mobilité | 5 | 1 | 5,0 | 4 | 3 (`df_iso`, `inv_iso`, `ev_iso`, + `ybt` hors-nommé) | Violation d'exclusion |
| Force | 40 | 4 | 10,0 | 7 | 13 (7 segmentaires + `profil_fv` + 5 hors-référentiel) | Violation d'exclusion + dilution |
| Puissance | 25 | 2 | 12,5 | 0 | 3 (`imtp`, `slimtp`, `profil_fv`) | Dilution diagnostique pure |
| Réactivité | 19 | 2 | 9,5 | 2 | 1 (`cmjr`) | Hybride (dilution + exclusion) |
| Explosivité | 23 | 2 | 11,5 | 1 | 0 | Donnée manquante |
| **Absorption** | **35** | **4** | **8,75** | **4** | **0** | **Limite structurelle TFM (nouveau)** |

**Explosivité ne rejoint aucun des trois profils déjà observés — elle constitue une nouvelle
famille d'écarts.** Elle a le ratio de dilution le plus élevé après Puissance/Force, mais quasiment
aucun promoteur illégitime au palier maximal (le point fort de Mobilité/Force/Réactivité) — sa
gravité vient d'ailleurs : de l'indisponibilité partielle de la preuve diagnostique elle-même, un
facteur qu'aucune reconfiguration de `TFM` ne peut résoudre seule. C'est la première qualité de
l'audit qui articule concrètement la distinction demandée par le praticien entre "reconfiguration
suffisante" et "reconstruction/enrichissement de données nécessaire" — un signal fort et direct
pour la synthèse transversale finale, et une première piste concrète pour l'hypothèse des 3
familles évoquée par le praticien (une possible "Famille C — donnée manquante", à confirmer sur les
qualités restantes plutôt que figée ici).

---

## 6. Absorption

### 6.1 — Question clinique cible (Vierge_7)

*"Cet athlète sait-il freiner et dissiper correctement la charge sans perte excessive de contrôle,
de temps ou de symétrie ?"* — évaluée par 4 familles diagnostiques : Landing bipodal, Landing
unipodal, SLLT (Single Leg Land and Hold), et la phase excentrique du CMJ ("diagnostique principal
**indirect**" — seule famille des 4 qualifiée différemment des 3 autres, qualificatif informel déjà
signalé comme non défini formellement par Vierge_7, audit VAR_REL3 §1.8 pt.3, motif identique ici).

### 6.2 — Question réellement évaluée par TFM

Meilleur alignement de tout l'audit TFM à ce stade sur le palier de poids maximal : `TFM` place les
3 tests "diagnostique principal" (`landing_bi`, `landing_uni`, `sllt`) exactement là où ils doivent
être, à poids 3. La question réellement évaluée s'écarte de Vierge_7 sur deux points précis
seulement : (1) la 4ᵉ famille diagnostique (CMJ excentrique) est reléguée au palier 2, sous-pesée
par rapport à son statut "diagnostique... indirect", et (2) plusieurs tests confirmatifs/explicatifs
légitimes (`dj`, `sldj`, `cmj`) risquent d'être contaminés en interne par des KPI hors sujet (voir
6.4) — un problème invisible dans la table `TFM` elle-même.

### 6.3 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `absorption:` dans la table `TFM` — 35 tests, le 2ᵉ plus grand nombre de
contributeurs de l'audit après Force (40) :

**Poids 3 (maximal — 3 tests)**

| Test | Rôle réel aujourd'hui |
|---|---|
| `landing_bi`, `landing_uni`, `sllt` | **Les 3 tests légitiment conformes** — première qualité TFM où le palier maximal est intégralement correct |

**Poids 2 (12 tests)**

`knee_ext`, `knee_flex`, `hip_ext`, `sl_iso_push`, `iso_belt_squat`, `cmj`, `slcmj`, `dj`, `sldj`,
`sh_iso_9020`, `sh_iso_9090`, `sh_iso_6060`

**Poids 1 (20 tests)**

`wblt`, `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`, `hip_rot_int`, `hip_rot_ext`,
`soleus_iso`, `gastro_iso`, `single_hop`, `triple_hop`, `crossover_hop`, `heel_raise`,
`sh_iso_3030`, `iso_squat_hold`, `imtp`, `slimtp`, `seated_calf_raise`, `standing_calf_raise`

### 6.4 — Promoteurs diagnostiques illégitimes (section dédiée)

**Au palier de poids maximal (3) : aucun** — 2ᵉ qualité consécutive (après Explosivité) où ce
constat est possible, et ici de façon plus solide : les 3 tests de poids 3 correspondent
**exactement** aux 3 familles "diagnostique principal" de Vierge_7, sans reste ni omission à ce
palier.

**Mais, comme pour Explosivité, un promoteur illégitime opère probablement à l'intérieur de
certains tests du palier 2, invisible dans la table `TFM`** — avec une nuance importante par
rapport à Explosivité : ici, le risque touche des tests **eux-mêmes légitimement pondérés**
(`dj`/`sldj` sont confirmatives réelles pour Absorption), pas des tests hors sujet.
`THRESHOLDS` (ligne 1214) contient un seuil statique pour `dj_rsi`
(`vert:1.5, jaune:1.0, orange:0.7`) — or `dj_rsi` est **explicitement exclu** du diagnostic
d'Absorption par Vierge_7 ("variables de réactivité pure"). `computeTestStatus('dj')` (ligne 4171)
agrège tous les KPIs de DJ dotés d'un seuil, `dj_rsi` inclus s'il est bien le premier/principal KPI
du test — le statut "dj" qui alimente Absorption à poids 2 risque donc d'être significativement
influencé par une variable explicitement exclue, exactement le même mécanisme que pour `cmj_height`
sur Explosivité (§5.4), mais sur une **deuxième qualité indépendante** — ce n'est plus un cas
isolé, c'est un motif structurel de `TFM` qui se reproduit.

**Nuance positive propre à Absorption** : `landing_bi`/`landing_uni` sont structurellement à l'abri
de ce risque — leur catalogue de KPIs est si limité (`tts` seul, ou `tts`+`peak_landing_force` pour
`landing_bi`, voir audit VAR_REL3 §3.8) qu'il n'y a quasiment rien d'autre à agréger que la bonne
variable. **La pauvreté de couverture de ces deux tests les protège, par accident, de la
contamination interne** — un lien inattendu entre le problème de couverture (déjà identifié côté
VAR_REL3) et la robustesse du calcul `TFM`. `cmj` (poids 2) n'a pas cette chance : ses seuils
statiques disponibles (`cmj_height`, `cmj_rsi_mod`) ne sont ni franchement faux ni franchement
justes pour Absorption — `cmj_rsi_mod` est une preuve confirmative légitime de la fiche Absorption,
`cmj_height` n'est ni cité ni exclu. Résultat mitigé plutôt que clairement problématique, contraste
net avec le cas `cmj_height`/Explosivité (§5.4) où la contamination était nette.

### 6.5 — Comparaison avec Vierge_7 (par test)

| Test | Poids TFM | Rôle Vierge_7 | Verdict |
|---|---|---|---|
| `landing_bi`, `landing_uni`, `sllt` | 3 | Diagnostique principal (les 3 familles nommément) | ✅ Conforme |
| `cmj`, `slcmj` | 2 | Diagnostique principal **indirect** (CMJ phase excentrique) | ⚠️ Rôle correct, poids sous-calibré par rapport à son statut diagnostique (même palier que des tests purement explicatifs) — voir aussi 6.4 sur la contamination interne possible |
| `dj`, `sldj` | 2 | Confirmative (contact time, landing impulse/force) | ⚠️ Rôle correct, poids raisonnable — mais risque de contamination interne par `dj_rsi`/`sldj_rsi` (exclus), voir 6.4 |
| `knee_ext`, `hip_ext`, `sl_iso_push`, `iso_belt_squat` | 2 | Explicative physiologique uniquement ("production de force excentrique") | ❌ Classification |
| `knee_flex` | 2 | **Non listé** dans la famille "production de force excentrique" de Vierge_7 (qui cite `knee_ext`, pas `knee_flex`, pour Absorption) | ⚠️ Hors référentiel, contamination probable depuis Puissance/Force |
| `sh_iso_9020`, `sh_iso_9090`, `sh_iso_6060` | 2 | Non mentionnés dans la fiche Absorption | ⚠️ Hors référentiel |
| `wblt` | 1 | Explicative physiologique uniquement ("mobilité disponible" — nommément listé) | ⚠️ Classification, mais poids déjà bas — le mieux calibré des `wblt` observés dans tout l'audit à ce stade |
| `hip_abd`, `hip_add`, `soleus_iso`, `gastro_iso`, `imtp`, `slimtp` | 1 | Explicative physiologique uniquement (nommément listés) | ⚠️ Classification, poids bas — écart peu sévère |
| `df_iso`, `inv_iso`, `ev_iso`, `hip_rot_int`, `hip_rot_ext`, `sh_iso_3030`, `iso_squat_hold`, `seated_calf_raise`, `standing_calf_raise` | 1 | Non mentionnés dans la fiche Absorption | ⚠️ Hors référentiel, poids bas |
| `single_hop`, `triple_hop`, `crossover_hop` | 1 | **Exclusion explicite et nommée** — "variables de réactivité pure" | 🚫 **Violation d'exclusion** (3 tests) |
| `heel_raise` | 1 | **Exclusion explicite et nommée** — "variables d'endurance/répétition" | 🚫 **Violation d'exclusion** |

### 6.6 — Violations identifiées

- **4 violations d'exclusion directes (🚫)** : `single_hop`, `triple_hop`, `crossover_hop`
  (réactivité pure), `heel_raise` (endurance) — plus nombreuses que Réactivité (2) et Explosivité
  (1), mais toutes à poids 1 (le plus faible palier), contrairement à Force où les violations
  atteignaient un poids substantiel. **Nombreuses mais individuellement peu sévères** — profil
  distinct des qualités précédentes.
- **Contamination croisée interne, structurelle** (nouveau motif confirmé sur 2 qualités) :
  `dj`/`sldj` — risque de contamination par `dj_rsi`/`sldj_rsi` via `computeTestStatus` (6.4).
- **Dilution modérée au palier 2** : la 4ᵉ famille diagnostique (`cmj`/`slcmj`, indirecte) partage
  son palier avec des tests purement explicatifs (`knee_ext`, `hip_ext`, `sl_iso_push`,
  `iso_belt_squat`) — dilution réelle mais moins sévère que sur Force/Puissance/Explosivité, où le
  palier maximal lui-même était touché.
- **Aucune dilution au palier maximal** — seule qualité, avec Explosivité, dans ce cas.

### 6.7 — Nature dominante de l'écart

| Cause | Rôle |
|---|---|
| **Limite structurelle TFM** (contamination interne `dj`/`sldj` par KPI exclus) | **Dominante** — 2ᵉ occurrence indépendante de ce motif, désormais structurel plutôt qu'isolé |
| Violation d'exclusion | Significative en nombre (4) mais faible en poids individuel (1 chacune) |
| Dilution diagnostique | Secondaire, limitée au palier 2 (`cmj`/`slcmj` sous-pondérés) |
| Contamination croisée | Mineure — `knee_flex`, quelques tests hors référentiel |
| Donnée manquante / couverture | Présente mais **indirecte** ici : la pauvreté du catalogue KPI de `landing_bi`/`landing_uni` (déjà documentée côté VAR_REL3) ne nuit pas au score `TFM` — elle le **protège** de la contamination interne (voir 6.4). Le problème de couverture existe toujours pour la richesse du futur raisonnement HYP###, mais n'aggrave pas le score actuel comme c'était le cas pour Explosivité |
| Mauvaise question clinique | Faible — le palier maximal étant intégralement correct, la question posée par `TFM` reste proche de celle de Vierge_7 |

### 6.8 — Dépendances critiques

- **`THRESHOLDS`/`NORMS`** : la validité réelle de `dj`/`sldj`/`cmj` pour Absorption dépend
  entièrement de quelles variables y sont seuillées — un sujet non audité exhaustivement ici (hors
  périmètre de cette mission, seule la couverture statique de `THRESHOLDS` a été vérifiée). Une
  vérification complète de `NORMS` par population serait nécessaire avant de conclure avec
  certitude sur l'ampleur réelle de la contamination `dj_rsi`/`sldj_rsi`.
- **Audit Réactivité (déjà fait)** : la légitimité de l'exclusion de `dj_rsi`/`sldj_rsi`
  d'Absorption dépend de leur statut déjà confirmé comme diagnostiques de Réactivité (§4) — les
  deux audits se corroborent mutuellement.
- **Audit VAR_REL3 Absorption (déjà fait)** : la limite de couverture des KPIs `landing_bi`/
  `landing_uni` (§3.8 de l'audit VAR_REL3) est la même donnée sous-jacente qui, ici, protège
  paradoxalement le score `TFM` — les deux audits partagent une dépendance commune au même
  catalogue de KPIs Kinexus, pas deux constats indépendants.

### 6.9 — Gravité globale de l'écart

**🟠 Important** — première fois dans l'audit TFM que la gravité descend sous 🔴. Le palier
maximal est intégralement correct (fait unique avec Explosivité, mais sans le plafond de données
qui touchait celle-ci), les violations d'exclusion sont nombreuses mais de faible poids, et le seul
point structurellement préoccupant (`dj`/`sldj`, §6.4) reste une **hypothèse fondée mais non
confirmée** faute d'audit complet de `NORMS`.

### 6.10 — Ratio de dilution

- **Contributeurs TFM : 35**
- **Contributeurs diagnostiques attendus (Vierge_7) : 4** (`landing_bi`, `landing_uni`, `sllt`,
  `cmj`/`slcmj` réunis comme 4ᵉ famille indirecte)
- **Ratio de dilution : 35/4 = 8,75×** — proche de celui de Réactivité (9,5) mais avec une
  composition très différente : ici, le ratio élevé vient du nombre de tests à faible poids (20 à
  poids 1) plutôt que d'une contamination du palier maximal.

### 6.11 — Impact produit

Si Absorption était reconstruite selon Vierge_7 :

- Le gain le plus net concerne `dj`/`sldj` : si la contamination interne par `dj_rsi`/`sldj_rsi`
  est confirmée (§6.4/6.8), un athlète très réactif mais avec une absorption réellement déficiente
  pourrait aujourd'hui apparaître plus performant en Absorption qu'il ne l'est — correction
  proportionnée mais pas radicale, la contribution étant déjà à poids 2, pas 3.
- Retirer `single_hop`/`triple_hop`/`crossover_hop`/`heel_raise` supprime une dilution par des
  tests de réactivité/endurance — gain marginal individuellement (poids 1 chacun) mais cumulatif.
- Remonter `cmj`/`slcmj` à un poids reflétant leur statut diagnostique (même indirect) donnerait
  plus de poids réel à la phase excentrique du CMJ, aujourd'hui noyée parmi des tests explicatifs.
- **Contrairement à Explosivité, aucun plafond de données ne limite le gain atteignable** — c'est
  une correction de configuration + une clarification `NORMS`/`THRESHOLDS`, pas un chantier de
  collecte de nouvelles données.

### 6.12 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-ABS-01`** — "Déficit d'absorption/freinage", générée par les preuves diagnostiques
  mesurées des 3 familles principales : `landing_bi_tts`, `landing_uni_tts`,
  `sllt_peak_landing_force`/`ttplf`/`loading_rate`/`tts`/`cop_path` (déjà pleinement mesurées) — et,
  en preuve diagnostique indirecte de rang secondaire, `cmj_ecc_mean_power`/`cmj_ecc_peak_vel`
  (existent) ; `cmj_braking_rfd`/`cmj_braking_impulse` en correspondance probable de
  `cmj_ecc_dec_rfd`/`cmj_ecc_dec_impulse` (nommage à confirmer, déjà noté audit VAR_REL3 annexe
  vocabulaire).
- Preuves confirmatives (mesurées) : `dj_contact_time`, `dj_landing_impulse`, `dj_peak_landing_force`,
  `sldj_contact_time`, `sldj_landing_impulse`, `sldj_peak_landing_force`, `cmj_rsi_mod`,
  `cmj_depth`, `cmj_braking_duration`.
- Preuves explicatives physiologiques (mesurées) : familles RFD excentrique (`imtp_rfd100/200`,
  `slimtp_rfd*`, `iso_belt_squat_rfd*`, `sl_iso_push_rfd*`, `knee_ext_rfd100/150/200`,
  `soleus_iso_rfd100/200`, `gastro_iso_rfd100/200`, `hip_abd_rfd100`, `hip_add_rfd100`,
  `hip_ext_rfd100`), `wblt_distance` ("mobilité disponible").
- **Exclu explicitement de la structure HYP### (règle "variables mesurées uniquement")** :
  `postural_control`/`sensorimotor_control`/`single_leg_balance`/`reaction_to_perturbation` —
  concepts cliniques non mesurés dans Kinexus (déjà signalés côté VAR_REL3 §3.8), retirés sans
  ambiguïté par la nouvelle règle stricte plutôt que laissés en "point à arbitrer".
- `dj_rsi`/`sldj_rsi` : à exclure explicitement du calcul du statut "dj"/"sldj" quand celui-ci
  alimente Absorption — nécessite, en Phase C, un modèle KPI-level capable de cette distinction (ce
  que `TFM` ne peut structurellement pas faire, §6.4).
- Tests hors référentiel (`sh_iso_*`, `iso_squat_hold`, `seated_calf_raise`, `standing_calf_raise`,
  `df_iso`/`inv_iso`/`ev_iso`, `hip_rot_int`/`hip_rot_ext`, `knee_flex`) : 🔶 même point à arbitrer
  récurrent, à trancher une fois pour toutes les qualités concernées plutôt que qualité par
  qualité.

### 6.13 — Retour explicite sur la tendance VAR_REL3 (demande du praticien)

**Oui, la tendance se confirme, avec une nuance importante.** L'audit VAR_REL3 d'Absorption avait
déjà montré moins d'erreurs de classification pures que Force/Puissance, mais davantage de
problèmes de couverture (landing_uni/landing_bi presque sans KPI). Côté `TFM`, le même schéma
apparaît : **la classification au niveau test est la meilleure de tout l'audit** (palier maximal
100 % conforme, plusieurs tests à poids réduit correctement calibrés — `wblt`, `imtp`/`slimtp`,
`hip_abd`/`hip_add`). Mais la couverture ne se manifeste pas de la même façon dans `TFM` que dans
`VAR_REL3` : au niveau test, elle **protège** paradoxalement `landing_bi`/`landing_uni` de la
contamination interne (§6.4), alors qu'elle limitait directement la richesse diagnostique côté
`VAR_REL3`. La couverture reste donc bien le facteur dominant pour cette qualité, mais son *effet*
sur la gravité observée dépend du mécanisme audité — un signal utile pour la synthèse transversale
finale : gravité TFM et gravité VAR_REL3 ne sont pas simplement corrélées, elles dépendent de la
manière dont chaque moteur expose (ou masque) le même problème de données sous-jacent.

---

## 7. Stabilisation

### 7.1 — Question clinique cible (Vierge_7)

*"Cet athlète est-il capable de stabiliser efficacement son corps après une contrainte, un appui ou
une perturbation ?"* — 4 familles diagnostiques : Single Leg Stance (SLS), Eyes Open/Eyes Closed
(EO/EF), Stroboscopic balance, et Landing stability (uni + bi, qualifiée "contextuelle").

### 7.2 — Contamination SLLT ↔ Stabilisation (section dédiée, demande explicite)

**Confirmée, active, et au palier de poids maximal — c'est la violation la plus directe retrouvée
dans `TFM` à ce stade, à égalité de sévérité avec les violations d'exclusion de Force.**

`sllt` est pondéré `stabilisation: 3` dans `TFM` (ligne 750) — poids maximal, exactement le même
palier que `landing_uni`, le seul test réellement diagnostique. Or Vierge_7 est doublement
catégorique sur ce point dans la fiche Stabilisation elle-même :
- SLLT n'apparaît **dans aucune** des 4 familles diagnostiques, confirmatives ou explicatives de
  Stabilisation.
- La section "VARIABLES EXCLUES DU DIAGNOSTIC DE STABILISATION > Variables d'absorption pure"
  nomme explicitement `sllt_peak_landing_force`/`sllt_loading_rate` : *"Elles relèvent
  principalement de la capacité à encaisser la charge, pas du maintien du contrôle postural
  secondaire."*
- SLLT est par ailleurs le test diagnostique **le plus propre de tout l'audit** pour Absorption —
  100 % conforme, voir §6.5. Sa présence ici n'est donc pas une ambiguïté de couverture, c'est un
  test parfaitement identifié ailleurs et faussement réutilisé ici.

C'est la **confirmation indépendante, par un second mécanisme (`TFM`), d'un écart déjà identifié
dans l'audit `VAR_REL3`** (§4.3/4.7/4.9 de l'audit VAR_REL3, où toute la famille SLLT — 4 KPIs —
était taguée Determinante pour Stabilisation). Les deux moteurs, construits indépendamment, avec
des mécanismes de pondération différents, contiennent la même erreur de fond — signal fort que ce
n'est pas un artefact d'implémentation isolé, mais une confusion clinique structurelle entre
"encaisser une charge" (Absorption) et "maintenir le contrôle postural après une charge"
(Stabilisation) dans la conception du référentiel actuel de Kinexus.

### 7.3 — Diagnostic réel de Stabilisation : TFM répond-il à la question clinique ?

**Non — et le mécanisme est inhabituel : ce n'est pas une dilution par des tests hors sujet, mais
une inversion de hiérarchie entre un test illégitime et les tests légitimes eux-mêmes.**

| Test | Poids TFM | Rôle Vierge_7 | Concordance |
|---|---|---|---|
| `landing_uni` | 3 | Diagnostique principal contextuel | ✅ Conforme |
| `sllt` | **3** | **Exclu explicitement** | 🚫 **Contamination majeure — voir 7.2** |
| `sls` | 2 | **Diagnostique principal** (famille complète) | ❌ Sous-pondéré — 1 palier sous le test illégitime `sllt` |
| `ef` | 2 | **Diagnostique principal sensoriel** | ❌ Sous-pondéré |
| `strobo` | 2 | **Diagnostique principal sous contrainte** | ❌ Sous-pondéré |
| `landing_bi` | 2 | Diagnostique principal contextuel (même famille que `landing_uni`) | ❌ Sous-pondéré par rapport à son pendant unilatéral |
| `eo` | **1** | **Diagnostique principal sensoriel** (même famille qu'`ef`) | ❌ Sous-pondéré, et **incohérent avec `ef`** — même famille diagnostique, traitement différent (voir 7.3bis) |

**7.3bis — Incohérence interne à `TFM` lui-même (pas à Vierge_7)** : `eo` et `ef` forment une seule
et même famille diagnostique chez Vierge_7 ("Eyes open / eyes closed... diagnostique principal
sensoriel", les deux cités ensemble, sans distinction de poids). `TFM` les traite pourtant
différemment (`eo:1`, `ef:2`) sans justification apparente dans la logique du référentiel. C'est
une incohérence de configuration de `TFM`, distincte des écarts vis-à-vis de Vierge_7.

**Réponse à la question posée par le praticien** : `TFM` répond partiellement à *"le contrôle
postural est-il maintenu ?"* — les 4 familles diagnostiques sont bien présentes, contrairement à
d'autres qualités où des familles entières étaient absentes — mais leur poids relatif est **inversé
par rapport à un test qui n'a rien à voir avec la question posée**. Un `sllt` dégradé (déficit
d'absorption réel) peut aujourd'hui peser aussi lourd, ou plus lourd relativement, que les 4 vrais
tests de stabilisation réunis.

### 7.4 — Construction KPI → Test : EO / EF / Strobo / SLS (section dédiée, demande explicite)

Vérification explicite de quels KPIs alimentent `computeTestStatus()` pour chacun des 4 tests
diagnostiques, et si une contamination KPI→Test existe (motif découvert sur Explosivité §5.4 et
Absorption §6.4) :

| Test | KPIs du catalogue Kinexus (`index.html` l.130-133) | Cohérence avec Vierge_7 | Contamination KPI→Test |
|---|---|---|---|
| `eo` | `surface` (1 seul KPI) | ✅ Exactement le KPI diagnostique attendu (`eo_surface`) | **Aucune — structurellement impossible**, un seul KPI, et c'est le bon |
| `ef` | `surface` (1 seul KPI) | ✅ Exactement le KPI diagnostique attendu (`ef_surface`) | **Aucune** — idem |
| `strobo` | `surface` (1 seul KPI) | ✅ Exactement le KPI diagnostique attendu (`strobo_surface`) — les KPIs additionnels que Vierge_7 mentionne (`strobo_cop_path`/`cop_vel`) n'existent de toute façon pas dans Kinexus (déjà noté audit VAR_REL3 §4.8) | **Aucune** — le seul KPI disponible est le bon |
| `sls` | `ttf`, `cop_path`, `cop_vel`, `ellipse_area`, `cop_range_ml`, `cop_range_ap`, `mean_velocity` (7 KPIs) | ✅ **Les 7 KPIs correspondent exactement aux 7 variables listées comme diagnostiques par Vierge_7** pour Single Leg Stance — aucun KPI "étranger" dans le catalogue | **Aucune** — même si tous les KPIs sont agrégés sans distinction de rôle par `computeTestStatus`, ils sont tous légitimement diagnostiques |

**Résultat net, à documenter même s'il est négatif comme demandé** : sur ces 4 tests précis, **le
mécanisme de contamination KPI→Test découvert sur Explosivité (`cmj_height`) et Absorption (`dj_rsi`)
ne se reproduit pas**. La raison structurelle est la même dans les 4 cas : soit un seul KPI existe
dans le catalogue (`eo`/`ef`/`strobo`), soit tous les KPIs existants sont légitimement diagnostiques
(`sls`) — il n'y a simplement aucune variable "étrangère" disponible pour contaminer le calcul. Ce
n'est pas une propriété de conception de `TFM` (qui reste aveugle au rôle des KPIs dans tous les
cas), c'est une coïncidence de couverture de catalogue, comme déjà noté pour `landing_bi`/
`landing_uni` en Absorption (§6.4). **La contamination réelle de cette qualité est donc entièrement
au niveau Test↔Qualité (`sllt`, `sldj` — voir 7.5), pas au niveau KPI↔Test.**

### 7.5 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `stabilisation:` dans la table `TFM` — 32 tests :

**Poids 3 (2 tests)** : `landing_uni` ✅, `sllt` 🚫 (voir 7.2)

**Poids 2 (15 tests)** : `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`, `hip_rot_int`,
`hip_rot_ext`, `sldj`, `landing_bi`, `ybt`, `side_hop`, `ef`, `strobo`, `sh_iso_9090`, `sls`

**Poids 1 (15 tests)** : `wblt`, `knee_ext`, `knee_flex`, `hip_flex`, `hip_ext`, `soleus_iso`,
`gastro_iso`, `eo`, `sh_iso_9020`, `sh_iso_3030`, `sh_iso_6060`, `rs_hip_push`, `rs_knee_push`,
`seated_calf_raise`, `standing_calf_raise`

### 7.6 — Comparaison avec Vierge_7 (tests restants, hors 7.2/7.3)

| Test | Poids TFM | Rôle Vierge_7 | Verdict |
|---|---|---|---|
| `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso` | 2 | Explicative physiologique uniquement ("force des groupes stabilisateurs", nommément listés) | ❌ Classification — poids important pour un rôle explicatif |
| `hip_ext` | 1 | Idem, nommément listé | ⚠️ Classification mais poids bas — **incohérence interne supplémentaire** : même famille explicative que `hip_abd`/`hip_add` (poids 2) mais traité à poids 1 sans raison apparente |
| `sldj` | 2 | **Non mentionné** dans la fiche Stabilisation — et `sldj_rsi` spécifiquement exclu ailleurs (variables de réactivité) | ❌ Contamination croisée + risque de contamination KPI→Test si `sldj_rsi` est thresholdé (même mécanisme que `dj`/Absorption, §6.4, non confirmé faute d'audit `NORMS`) |
| `ybt` | 2 | Non mentionné (statut toujours en suspens, dépend de l'audit Contrôle Frontal à venir) | 🔶 Point à arbitrer, inchangé depuis l'audit VAR_REL3 |
| `side_hop`, `hip_rot_int`, `hip_rot_ext`, `sh_iso_9090` | 2 | Non mentionnés | ⚠️ Hors référentiel |
| `wblt` | 1 | Explicative physiologique uniquement (nommément listé, "mobilité disponible") | ⚠️ Classification, poids bas — bien calibré (même constat que sur Absorption) |
| `knee_ext`, `soleus_iso`, `gastro_iso` | 1 | **Exclusion explicite et nommée** — "force maximale sans contrainte posturale" | 🚫 **Violation d'exclusion** (3 tests, poids mineur chacun — mêmes 3 tests déjà trouvés en excès dans l'audit VAR_REL3, confirmation indépendante) |
| `knee_flex`, `hip_flex`, `rs_hip_push`, `rs_knee_push`, `sh_iso_9020`, `sh_iso_3030`, `sh_iso_6060`, `seated_calf_raise`, `standing_calf_raise` | 1 | Non mentionnés | ⚠️ Hors référentiel — **15 tests sur 32 (47 %) ne sont mentionnés nulle part dans la fiche Stabilisation de Vierge_7**, la proportion la plus élevée de l'audit à ce stade, bien qu'à poids faible pour la plupart |

### 7.7 — Violations identifiées (synthèse)

- **1 contamination Test↔Qualité majeure, au palier maximal** : `sllt` (7.2) — confirmation
  indépendante d'un écart déjà vu côté VAR_REL3.
- **4 violations d'exclusion additionnelles** : `knee_ext`, `soleus_iso`, `gastro_iso` (force
  maximale sans contrainte posturale, poids 1 chacune) — même triplette que VAR_REL3.
- **Aucune contamination KPI→Test sur les 4 tests diagnostiques eux-mêmes** (7.4) — point
  rassurant, contrastant avec Explosivité/Absorption.
- **Risque de contamination KPI→Test non confirmé sur `sldj`** (via `sldj_rsi`), motif similaire à
  `dj`/Absorption mais sur un test qui, ici, n'est même pas sanctionné par Vierge_7 pour
  Stabilisation — double problème superposé plutôt que contamination pure.
- **Incohérences de configuration internes à `TFM`** (nouveau type d'observation, distinct d'un
  écart vis-à-vis de Vierge_7) : `eo`(1) vs `ef`(2) — même famille diagnostique Vierge_7, poids
  différent ; `hip_ext`(1) vs `hip_abd`/`hip_add`(2) — même famille explicative, poids différent.
- **Proportion la plus élevée de tests hors référentiel de tout l'audit** : 15/32 (47 %).

### 7.8 — Gravité globale de l'écart

**🔴 Critique.** La contamination `sllt` à poids maximal (7.2), doublement confirmée
(`VAR_REL3` + `TFM`), suffit à elle seule à justifier cette note — c'est un déficit d'absorption
pure qui peut aujourd'hui fausser directement le score de Stabilisation affiché au praticien, sur
le mécanisme qui compte réellement. S'y ajoutent 4 vrais tests diagnostiques tous sous-pondérés et
3 violations d'exclusion supplémentaires.

### 7.9 — Ratio de dilution

- **Contributeurs TFM : 32**
- **Contributeurs diagnostiques attendus (Vierge_7) : 6** (`sls`, `eo`, `ef`, `strobo`,
  `landing_uni`, `landing_bi`)
- **Ratio de dilution : 32/6 ≈ 5,33×** — le **plus bas (meilleur) ratio brut de tout l'audit TFM**,
  ce qui illustre bien pourquoi ce chiffre seul ne suffit pas à qualifier la gravité : le problème
  dominant de Stabilisation n'est pas le volume de dilution, c'est la **nature** d'un seul
  contributeur au palier maximal.

### 7.10 — Impact produit

Si Stabilisation était reconstruite selon Vierge_7 (diagnostic porté par `sls`/`eo`/`ef`/`strobo`/
`landing_uni`/`landing_bi`, `sllt` totalement retiré) :

- Un athlète avec un déficit isolé d'absorption (SLLT dégradé) mais un contrôle postural
  réellement normal (SLS/EO/EF/Strobo normaux) **ne serait plus vu comme ayant une "Stabilisation
  diminuée"** — correction directe et significative, le déficit d'absorption restant visible là où
  il doit l'être (Absorption, déjà 100 % conforme).
- Les 4 vraies familles diagnostiques (SLS, EO, EF, Strobo), aujourd'hui reléguées sous le poids de
  `sllt`, retrouveraient un poids cohérent avec leur statut réel.
- Un déficit isolé de force segmentaire (quadriceps, soléaire, gastrocnémien) ne pourrait plus,
  même marginalement, faire baisser le score de Stabilisation (3 violations d'exclusion corrigées).
- **Correction de configuration pure** — aucune donnée manquante identifiée pour cette qualité,
  contrairement à Explosivité.

### 7.11 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-STA-01`** — "Déficit de contrôle postural", générée par les preuves diagnostiques
  mesurées des 4 familles : `sls_ttf`/`cop_path`/`cop_vel`/`ellipse_area`/`cop_range_ml`/
  `cop_range_ap`/`mean_velocity`, `eo_surface`, `ef_surface`, `strobo_surface`,
  `landing_uni_tts`, `landing_bi_tts` — toutes déjà mesurées, aucun développement requis.
- Preuves confirmatives (mesurées) : mêmes variables SLS (Vierge_7 les réutilise telles quelles en
  confirmative), `strobo_surface` (double rôle diagnostique/confirmatif déjà noté comme motif
  récurrent chez Vierge_7).
- Preuves explicatives physiologiques (mesurées) : `hip_abd_rfd100/200`, `hip_add_rfd100`,
  `hip_ext_rfd100/200`, `inv_iso_rfd100`, `ev_iso_rfd100`, `df_iso_rfd100`, `wblt_distance`.
- **`sllt` retiré intégralement de Stabilisation** — reste une preuve exclusivement d'Absorption,
  où il est déjà pleinement et correctement modélisé.
- `sldj` : retiré, avec le même garde-fou que `dj`/Absorption pour la Phase C (exclusion explicite
  de `sldj_rsi` du calcul si un modèle KPI-level est utilisé).
- Tests hors référentiel (`ybt`, `side_hop`, `hip_rot_int`/`hip_rot_ext`, `sh_iso_*`, `knee_flex`,
  `hip_flex`, `rs_hip_push`/`rs_knee_push`, `seated_calf_raise`/`standing_calf_raise`) : 🔶 point à
  arbitrer récurrent, `ybt` dépendant spécifiquement de l'audit Contrôle Frontal à venir.

### 7.12 — Positionnement dans les familles d'écarts (sans forcer la classification)

Stabilisation ne correspond intégralement à aucun des 6 profils déjà observés, mais emprunte des
traits précis à trois d'entre eux :

- **Comme Mobilité/Force** : un test structurellement illégitime occupe le palier de poids
  maximal (`sllt`), phénomène absent de Puissance/Explosivité/Absorption.
- **Comme Absorption** : le mécanisme dominant vis-à-vis de Vierge_7 est une **contamination entre
  qualités voisines mais cliniquement distinctes** (Absorption↔Stabilisation ici,
  Réactivité↔Absorption là-bas via `dj_rsi`), plutôt qu'une dilution par des tests franchement hors
  sujet.
- **Différence majeure avec toutes les qualités précédentes** : le ratio de dilution brut (5,33)
  est le plus bas de tout l'audit, alors que la gravité qualitative reste 🔴 — la première fois que
  ces deux mesures divergent aussi nettement. Cela confirme, comme annoncé dans la synthèse
  d'Explosivité, que le ratio X/Y seul ne suffit pas à classer une qualité : il faut le croiser
  avec la *nature* du ou des tests illégitimes au palier maximal.

**Si une famille doit être esquissée pour la synthèse finale**, Stabilisation illustre moins une
nouvelle famille qu'un **sous-type du profil "violation d'exclusion"** (Mobilité/Force) où
l'exclusion se joue à l'échelle d'une **qualité entière mal réattribuée** (SLLT→Absorption tout
entier) plutôt qu'à l'échelle de tests isolés — une nuance à garder pour la synthèse transversale,
pas une quatrième famille indépendante à ce stade.

### 7.13 — Tableau transversal (mis à jour)

| Qualité | Ratio dilution (X/Y) | Exclusions actives | Promoteurs illégitimes au palier max | Contamination KPI→Test | Profil dominant |
|---|---|---|---|---|---|
| Mobilité | 5/1 = 5,0 | 4 | 3 | Non vérifié | Violation d'exclusion |
| Force | 40/4 = 10,0 | 7 | 13 | Non vérifié | Exclusion + dilution |
| Puissance | 25/2 = 12,5 | 0 | 3 | Non vérifié | Dilution diagnostique pure |
| Réactivité | 19/2 = 9,5 | 2 | 1 | Non vérifié | Hybride (dilution + exclusion) |
| Explosivité | 23/2 = 11,5 | 1 | 0 | **Oui** (`cmj_height`, via `cmj`) | Donnée manquante |
| Absorption | 35/4 = 8,75 | 4 | 0 | **Oui** (`dj_rsi`/`sldj_rsi`, hypothèse) | Limite structurelle TFM |
| **Stabilisation** | **32/6 = 5,33** | **4** | **1 (`sllt`)** | **Non sur les 4 tests diagnostiques ; hypothèse ouverte sur `sldj`** | **Violation d'exclusion inter-qualités (sous-type)** |

---

## 8. Contrôle Sensori-moteur

*Note de nommage : Vierge_7 nomme cette qualité "Contrôle Sensori-moteur" (avec trait d'union,
titre exact de la fiche) ; Kinexus la nomme "Contrôle Sensoriel" dans `FUNCTIONS`
(`FN_KEY: controle_sensoriel`). Même quantité auditée, deux noms différents — ajouté à l'annexe
Normalisation du vocabulaire (voir fin de document).*

### 8.1 — Question clinique réelle : TFM vs Vierge_7 (section dédiée, demande explicite)

**Vierge_7** : *"Cet athlète est-il capable d'intégrer correctement les informations sensorielles
pour stabiliser et ajuster son contrôle moteur ?"* — la fiche prend soin de préciser qu'elle ne se
confond avec aucune des 7 autres qualités déjà auditées (mobilité, force, puissance, explosivité,
réactivité, absorption, endurance) — **Stabilisation n'est pas citée dans cette liste de
distinction**, alors que Vierge_7 l'a soigneusement listée pour toutes les autres qualités
proches. C'est le premier indice, dans le texte même de Vierge_7, d'un chevauchement volontaire ou
non avec Stabilisation — développé en 8.2.

**TFM (`controle_sensoriel`)** : avec seulement 5 tests pondérés — le plus petit nombre de
contributeurs de tout l'audit — et 4 d'entre eux exactement alignés sur les 4 familles
diagnostiques attendues (`eo`, `ef`, `strobo`, `sls`, tous à poids maximal), `TFM` répond à une
question très proche de celle de Vierge_7 : *"cet athlète maintient-il son équilibre avec/sans
vision, sous perturbation sensorielle, en appui unipodal ?"* — **c'est la meilleure concordance de
question clinique de tout l'audit TFM à ce stade.** La seule divergence : la famille "Landing
stability" (contextuelle chez Vierge_7) est totalement absente de `TFM.controle_sensoriel` — la
question posée aujourd'hui ignore donc le "contrôle retrouvé après une contrainte mécanique",
présent chez Vierge_7.

**Confusions vérifiées explicitement, comme demandé** :
- *Avec Stabilisation* : confusion réelle, mais côté **spécification Vierge_7**, pas côté
  implémentation `TFM` — voir 8.2.
- *Avec Équilibre / Contrôle postural* : ce sont les mêmes construits que "Stabilisation" et
  "Contrôle Sensori-moteur" chez Vierge_7 — pas une confusion supplémentaire, la même déjà
  identifiée.
- *Avec Mobilité* : aucune — `wblt` n'apparaît même pas dans `TFM.controle_sensoriel` (contrairement
  à son omniprésence ailleurs), et Vierge_7 ne le classe qu'en explicatif mineur pour cette qualité.
- *Avec Contrôle Frontal* : `ybt` est le seul test présent qui pourrait suggérer un lien — mais à
  poids 1 (le plus bas), et son rattachement principal selon `TFM` lui-même est `controle_frontal`
  (poids 3, voir table `TFM` l.750). Pas une confusion active ici, plutôt une trace résiduelle
  mineure. Statut définitif encore en suspens jusqu'à l'audit de Contrôle Frontal.

### 8.2 — Frontière avec Stabilisation (section dédiée, demande explicite)

**Constat le plus important de cet audit : la frontière est déjà floue dans Vierge_7 lui-même, avant
même toute question d'implémentation `TFM`.**

Comparaison directe des fiches Vierge_7 Stabilisation (§7 de cet audit) et Contrôle Sensori-moteur :

| Section | Stabilisation | Contrôle Sensori-moteur | Écart |
|---|---|---|---|
| Diagnostique SLS | 7 variables (`sls_ttf`...`mean_velocity`) | **Mêmes 7 variables, à l'identique** | Aucun |
| Diagnostique EO/EF | `eo_surface`, `ef_surface` | **Identique** | Aucun |
| Diagnostique Strobo | `strobo_surface/cop_path/cop_vel` | **Identique** | Aucun |
| Diagnostique Landing | 10 variables uni+bi | **Identiques** | Aucun |
| Confirmative | Mêmes 3 blocs (SLS, Strobo, Landing) | **Identiques**, à une variable près (`strobo_ttf` en plus ici) | Quasi nul |
| Explicative physiologique | "Contrôle sensorimoteur" (4 concepts non mesurés) + force des stabilisateurs + WBLT | **Identique**, mot pour mot | Aucun |
| Explicative biomécanique | 3 sous-sections | 2 sous-sections (fusionnées) | Cosmétique |
| Exclusions | Puissance/réactivité (KPI ciblés) + absorption (2 KPI ciblés) + force max (5 KPI ciblés) | Force max (8 KPI, périmètre plus large) + puissance/explosivité/réactivité (**tests entiers**) + absorption (**tests entiers**) + endurance (catégorie absente chez Stabilisation) | Périmètre d'exclusion plus large et plus radical ici, mais même intention |

**Vierge_7 spécifie donc, mot pour mot, la même base de preuves diagnostiques et confirmatives pour
deux qualités officiellement distinctes.** Ce n'est pas une contamination d'implémentation à
corriger dans `TFM` — c'est une caractéristique du document source, à documenter et signaler,
conformément à la consigne de ne pas trancher les contradictions de Vierge_7.

**Côté `TFM`, la frontière EST numériquement marquée, mais dans un seul sens** :

| | Stabilisation (`TFM`) | Contrôle Sensori-moteur (`TFM`) |
|---|---|---|
| Nombre de tests pondérés | 32 | 5 |
| `sls`, `eo`, `ef`, `strobo` | Présents, poids 1-2 (dilués par 28 autres tests) | Présents, poids 3 (seuls, sans dilution) |
| `ybt` | Poids 2 | Poids 1 |
| `sllt`, tests segmentaires, `sldj`, etc. | Présents (contamination, voir §7) | **Absents** |
| `landing_uni`/`landing_bi` | Présents (poids 2-3) | **Absents** — alors que Vierge_7 les cite comme diagnostiques pour les deux qualités |

**Tests communs** : `sls`, `eo`, `ef`, `strobo`, `ybt` — les 5 seuls tests de
`controle_sensoriel` sont, sans exception, également présents dans `stabilisation`.
**Tests spécifiques à Stabilisation uniquement** : les 27 autres (dont `sllt`, `landing_bi`,
`landing_uni`, `sldj`, toute la famille segmentaire).
**Tests spécifiques à Contrôle Sensori-moteur uniquement** : aucun.

**Contamination croisée identifiée** : aucune dans le sens Contrôle-Sensori-moteur→Stabilisation
(les tests supplémentaires de Stabilisation ne sont pas illégitimement empruntés à Contrôle
Sensori-moteur, ils viennent d'ailleurs — Absorption via `sllt`, Force via les tests segmentaires).
**Constat inattendu** : paradoxalement, `TFM.controle_sensoriel`, en ne retenant que les 4 tests
purs, se rapproche **davantage** de ce que devrait être un score de contrôle postural "propre" selon
Vierge_7 que `TFM.stabilisation` lui-même — alors que c'est nominalement "Stabilisation" qui est
censée porter ce rôle. Signal à remonter explicitement au praticien pour la synthèse : la qualité la
mieux implémentée de l'audit répond, en partie, à la question qu'une autre qualité était censée
porter.

### 8.3 — Tests actuellement utilisés dans TFM (poids et rôle réel)

Recherche exhaustive de `controle_sensoriel:` dans la table `TFM` — **5 tests, le plus petit
nombre de contributeurs de tout l'audit** :

| Test | Poids | Rôle Vierge_7 |
|---|---|---|
| `eo` | 3 | Diagnostique principal sensoriel |
| `ef` | 3 | Diagnostique principal sensoriel |
| `strobo` | 3 | Diagnostique principal sous contrainte |
| `sls` | 3 | Diagnostique principal |
| `ybt` | 1 | Non mentionné (statut en suspens, voir 8.1) |

### 8.4 — Promoteurs diagnostiques illégitimes (section dédiée, demande explicite)

**Aucun, à aucun palier.** C'est la première qualité de tout l'audit TFM dans ce cas — pas
seulement au palier maximal (déjà vu pour Explosivité et Absorption), mais **sur l'intégralité de
la table de poids**. Les 4 tests à poids 3 sont les 4 familles diagnostiques exactes de Vierge_7
(à l'omission de Landing près, qui est un manque, pas un excès). Le seul test restant (`ybt`, poids
1) n'est pas "promu" — il occupe le palier le plus bas possible et n'est même pas mentionné par
Vierge_7, donc structurellement incapable de fausser le diagnostic de façon significative.

### 8.5 — Violations d'exclusion — surveillance ciblée YBT/EO/EF/Strobo/SLS/Landing/WBLT (demande explicite)

| Test | Présent dans `controle_sensoriel` ? | Bonne qualité selon Vierge_7 ? |
|---|---|---|
| `ybt` | Oui, poids 1 | Non tranché (hors référentiel des deux fiches Stabilisation/CSM lues à ce jour) |
| `eo` | Oui, poids 3 | ✅ Oui — diagnostique principal sensoriel |
| `ef` | Oui, poids 3 | ✅ Oui — diagnostique principal sensoriel |
| `strobo` | Oui, poids 3 | ✅ Oui — diagnostique principal sous contrainte |
| `sls` | Oui, poids 3 | ✅ Oui — diagnostique principal |
| `landing_bi`/`landing_uni` | **Non — absents** | Devraient l'être selon Vierge_7 (diagnostique contextuel), mais `TFM` ne les y attache pas |
| `wblt` | **Non — absent** | Cohérent : Vierge_7 ne le classe qu'en explicatif mineur, son absence à `controle_sensoriel` n'est donc pas une perte |

**Aucune violation d'exclusion trouvée** — 3ᵉ qualité dans ce cas après Puissance et (partiellement)
Stabilisation pour les tests hors sllt. Le seul écart de cette liste est une omission (`landing_*`),
pas une intrusion.

### 8.6 — Construction KPI → Test : EO / EF / Strobo / SLS / YBT (section dédiée, demande explicite)

| Test | KPIs du catalogue Kinexus | Cohérence Vierge_7 | Contamination KPI→Test |
|---|---|---|---|
| `eo` | `surface` (1 seul) | ✅ Exact | **Aucune** |
| `ef` | `surface` (1 seul) | ✅ Exact | **Aucune** |
| `strobo` | `surface` (1 seul) | ✅ Exact (les KPIs `cop_path`/`cop_vel`/`ttf` que Vierge_7 mentionne n'existent pas dans Kinexus, comme déjà noté pour Stabilisation) | **Aucune** |
| `sls` | `ttf`, `cop_path`, `cop_vel`, `ellipse_area`, `cop_range_ml`, `cop_range_ap`, `mean_velocity` (7) | ✅ Les 7 correspondent exactement aux 7 variables diagnostiques Vierge_7 | **Aucune** |
| `ybt` | `ant`, `pm`, `pl`, `composite` (4) | Aucun de ces 4 KPIs n'est mentionné par Vierge_7 pour cette qualité | **Non applicable** — le test entier est hors référentiel, indépendamment du KPI qui porte son statut ; ce n'est pas une contamination d'un test par ailleurs légitime (contrairement à `cmj`/Explosivité ou `dj`/Absorption), c'est un test qui n'a de toute façon aucune place ici |

**Conclusion, documentée comme demandé même si négative : aucune contamination KPI→Test identifiée
sur les 5 tests de cette qualité.** 3ᵉ vérification consécutive (après Stabilisation) confirmant
que ce mécanisme, bien réel sur Explosivité et Absorption, ne se généralise pas à toutes les
qualités — il dépend spécifiquement de la richesse du catalogue de KPIs du test concerné (`cmj`,
`dj`, `sldj` sont riches et donc exposés ; `eo`/`ef`/`strobo` n'ont qu'un seul KPI chacun ; `sls` a 7
KPIs mais tous légitimes).

### 8.7 — Ratio de dilution

- **Contributeurs TFM : 5**
- **Contributeurs diagnostiques attendus (Vierge_7) : 6** (`sls`, `eo`, `ef`, `strobo`,
  `landing_uni`, `landing_bi` — mêmes 6 tests qu'en Stabilisation, évidence quasi identique §8.2)
- **Ratio de dilution : 5/6 ≈ 0,83×** — **premier ratio inférieur à 1 de tout l'audit.** Ce n'est
  plus un ratio de dilution mais un ratio de **sous-couverture de configuration** : `TFM` pondère
  *moins* de tests que Vierge_7 n'en attend, faute d'avoir rattaché `landing_uni`/`landing_bi` à
  cette qualité — pas une donnée manquante (les deux tests existent et sont même déjà pondérés
  ailleurs, y compris pour Stabilisation), un simple oubli de configuration.

### 8.8 — Nature dominante de l'écart

| Cause | Rôle |
|---|---|
| **Confusion entre qualités voisines, au niveau spécification** (Stabilisation ↔ Contrôle Sensori-moteur, Vierge_7 lui-même) | **Dominante** — nouveau type de motif, distinct d'une contamination d'implémentation |
| Sous-couverture de configuration (`landing_*` non rattachés) | Secondaire — un oubli de configuration, pas un manque de donnée |
| Violation d'exclusion | **Absente** |
| Dilution diagnostique | **Quasi absente** — la plus faible de tout l'audit |
| Contamination croisée | **Absente** |
| Construction KPI→Test | **Absente** (vérifiée explicitement, §8.6) |
| Limite structurelle TFM | Non observée sur cette qualité (contrairement à Explosivité/Absorption) |
| Mauvaise question clinique | Non côté `TFM` (question bien ciblée) — **oui côté Vierge_7 lui-même**, qui pose une question quasi identique à celle de Stabilisation sans jamais le reconnaître explicitement dans son propre texte |

### 8.9 — Dépendances critiques (section dédiée, demande explicite)

- **Dépend uniquement de `TFM`** pour l'essentiel — la configuration actuelle (5 tests, 4 corrects)
  est déjà proche de l'optimal atteignable par une simple reconfiguration (ajouter
  `landing_uni`/`landing_bi`).
- **Dépend de `computeTestStatus`** seulement de façon marginale et déjà vérifiée saine (§8.6) — pas
  un point de vigilance ici, contrairement à Absorption/Explosivité.
- **Ne dépend d'aucun autre moteur intermédiaire** (pas de lien avec le cluster Mouvement/Phases
  CMJ, ni avec `VAR_REL3`/Capacités).
- **Dépend, de façon critique et bloquante pour la Phase C, d'une clarification du praticien sur
  Vierge_7 lui-même** : tant que la relation Stabilisation/Contrôle Sensori-moteur n'est pas
  clarifiée (deux qualités réellement distinctes avec des preuves à différencier, ou une qualité
  unique que Vierge_7 a doublée), aucune reconstruction HYP### propre n'est possible pour l'une
  sans l'autre. C'est la première dépendance de l'audit qui pointe vers le document source plutôt
  que vers le code.

### 8.10 — Gravité globale de l'écart

**🟡 Mineur — première qualité de l'audit TFM sous 🔴/🟠.** Le score `controle_sensoriel` actuel
est, budget de dilution et de contamination mis à part, la meilleure approximation de son intention
Vierge_7 de tout l'audit. L'écart residuel (Landing absent, ratio 0,83) est mineur en gravité
clinique, même s'il soulève une question de fond majeure sur la spécification elle-même (§8.2),
qui elle, mérite l'attention du praticien indépendamment de la gravité technique.

### 8.11 — Impact produit

- Ajouter `landing_uni`/`landing_bi` à `controle_sensoriel` (à un poids cohérent avec leur statut
  "contextuel") complèterait la couverture des 4 familles Vierge_7 — gain marginal, pure
  configuration.
- **Le vrai gain produit n'est pas ici, mais dans la clarification Stabilisation/Contrôle
  Sensori-moteur** : si le praticien confirme que ce sont deux questions cliniques réellement
  distinctes, il faudra enrichir Vierge_7 lui-même (préciser en quoi les preuves diffèrent) avant
  toute reconstruction HYP### fidèle. Si au contraire il confirme qu'il s'agit largement de la même
  question, `TFM.controle_sensoriel` (déjà propre) pourrait devenir la base de référence commune,
  et `stabilisation` serait alors la qualité à corriger en priorité (retrait de `sllt` et des tests
  segmentaires, §7.11) plutôt que reconstruite en parallèle d'un doublon.

### 8.12 — Structure cible HYP### (variables mesurées uniquement)

- **`HYP-CSM-01`** — "Déficit d'intégration sensorielle pour le contrôle postural", générée par
  `sls_*` (7 KPIs), `eo_surface`, `ef_surface`, `strobo_surface` — déjà mesurées, aucun
  développement requis.
- Ajout recommandé, cohérent avec Vierge_7 : `landing_uni_tts`, `landing_bi_tts` en preuve
  diagnostique contextuelle secondaire.
- Preuves explicatives physiologiques (mesurées) : `hip_abd_rfd100/200`, `hip_ext_rfd100/200`,
  `hip_add_rfd100`, `inv_iso_rfd100`, `ev_iso_rfd100`, `df_iso_rfd100`, `wblt_distance`.
- **🔶 Point à arbitrer, prioritaire avant toute autre décision de conception pour cette qualité**
  (voir 8.9) : `HYP-CSM-01` et `HYP-STA-01` (proposée §7.11) doivent-elles rester deux hypothèses
  distinctes alimentées par la quasi-totalité des mêmes preuves diagnostiques, ou le praticien
  souhaite-t-il fusionner/redéfinir l'une des deux qualités avant la Phase C ? Décision qui dépasse
  le périmètre de cet audit.

### 8.13 — Positionnement dans les familles d'écarts (sans forcer la classification)

Contrôle Sensori-moteur ne rejoint aucun des 7 profils déjà observés — elle a le profil le plus
propre de l'audit sur toutes les dimensions d'implémentation (dilution, exclusion, contamination,
KPI→Test), ce qui l'exclut de fait de Mobilité/Force/Puissance/Réactivité/Explosivité/Absorption/
Stabilisation. Elle introduit un axe d'écart qu'aucune qualité précédente n'a isolé aussi
nettement : **un problème situé dans la spécification Vierge_7 elle-même plutôt que dans son
implémentation**, ce qui la rapproche davantage des incohérences déjà signalées (répétition
`ecc_dec`/`braking`, contradiction `peak_landing_force` de Stabilisation) que des écarts
d'implémentation des 7 autres qualités. Si une famille doit être esquissée : **"Famille D —
confusion de spécification entre qualités voisines"**, provisoire, à confirmer sur Endurance et sur
une éventuelle relecture d'ensemble en synthèse finale plutôt qu'affirmée ici.

### 8.14 — Tableau transversal (mis à jour, avec gravité)

| Qualité | Ratio dilution (X/Y) | Exclusions actives | Promoteurs illégitimes au palier max | KPI→Test | Profil dominant | Gravité |
|---|---|---|---|---|---|---|
| Mobilité | 5/1 = 5,0 | 4 | 3 | Non vérifié | Violation d'exclusion | 🔴 |
| Force | 40/4 = 10,0 | 7 | 13 | Non vérifié | Exclusion + dilution | 🔴 |
| Puissance | 25/2 = 12,5 | 0 | 3 | Non vérifié | Dilution diagnostique pure | 🔴 |
| Réactivité | 19/2 = 9,5 | 2 | 1 | Non vérifié | Hybride (dilution + exclusion) | 🔴 |
| Explosivité | 23/2 = 11,5 | 1 | 0 | **Oui** (`cmj_height`) | Donnée manquante | 🔴 |
| Absorption | 35/4 = 8,75 | 4 | 0 | **Oui** (`dj_rsi`, hypothèse) | Limite structurelle TFM | 🟠 |
| Stabilisation | 32/6 = 5,33 | 4 | 1 (`sllt`) | Non sur les 4 diag. ; hypothèse ouverte sur `sldj` | Exclusion inter-qualités (sous-type) | 🔴 |
| **Contrôle Sensori-moteur** | **5/6 = 0,83** | **0** | **0** | **Non — vérifié, aucune** | **Confusion de spécification (nouveau)** | **🟡** |

---

## Annexe B — Registre cumulatif des motifs architecturaux (7 qualités TFM auditées)

Accumulation structurée, sans synthèse finale à ce stade (demande explicite du praticien).

| Motif | Qualités concernées | Nb. qualités | Gravité observée | Exemples représentatifs |
|---|---|---|---|---|
| **Violation d'exclusion** | Mobilité, Force, Réactivité, Explosivité, Absorption, Stabilisation | 6/8 | Très variable — de 🟡 (poids 1, ex. `heel_raise`/Absorption) à 🔴 (poids 3, ex. tests segmentaires/Force, `sllt`/Stabilisation) | `df_iso`/`inv_iso`/`ev_iso` (Mobilité, poids 2-3) ; tests segmentaires (Force, poids 3) ; `sllt` (Stabilisation, poids 3) |
| **Dilution diagnostique** | Toutes sauf Contrôle Sensori-moteur | 7/8 | Variable, corrélée au ratio X/Y — la plus sévère quand elle touche le palier maximal (Force, Puissance, Stabilisation via `sllt`) | `imtp`/`slimtp`/`profil_fv` à poids 3 pour Puissance ; 7 tests segmentaires à poids 3 pour Force |
| **Contamination croisée** (test d'une autre qualité, hors exclusion nommée) | Force, Puissance, Réactivité, Explosivité, Absorption, Stabilisation | 6/8 | Généralement 🟡-🟠, poids rarement maximal sauf `profil_fv`/Force (🔴) | `crossover_hop` (Puissance) ; `cmj`/`slcmj` (Réactivité) ; `rs_*` (Explosivité) ; `sldj` (Stabilisation) |
| **Donnée manquante** (KPI Vierge_7 non calculable dans Kinexus) | Explosivité (dominant) | 1/8, avec mention secondaire sur Absorption/Mobilité (couverture KPI limitée mais sans impact `TFM`) | 🔴 sur Explosivité (plafonne le gain atteignable même après correction complète) | RFD CMJ fenêtré 100/150/200ms absent du catalogue |
| **Construction KPI→Test** (contamination interne à `computeTestStatus`, invisible dans la table `TFM`) | Explosivité (confirmée), Absorption (confirmée), Stabilisation (hypothèse ouverte sur `sldj`, clean sur 4/5 tests vérifiés) | 2 confirmées / 3 vérifiées / 8 auditées | 🔴 sur Explosivité (variable exclue dominante probable), 🟠 sur Absorption (variable exclue probable mais poids modéré) | `cmj_height` (exclu, probable dominant du statut `cmj`/Explosivité) ; `dj_rsi` (exclu, probable contributeur du statut `dj`/Absorption) |
| **Confusion entre qualités voisines — spécification Vierge_7** (evidence quasi identique entre deux fiches, indépendant de `TFM`) | Contrôle Sensori-moteur ↔ Stabilisation | 2/8 (1 paire) | Non technique — question de fond pour le praticien, pas une gravité `TFM` | Sections diagnostique/confirmative/explicative physiologique quasi mot pour mot identiques entre les deux fiches |
| **Limite structurelle TFM** (grain test, pas KPI — propriété de conception, indépendante d'une contamination confirmée) | Mobilité (WBLT à 4 rôles KPI non distinguables), Explosivité, Absorption, Stabilisation | Présente en principe sur 8/8 (propriété de conception), **confirmée avec impact concret sur 3/8** | Variable | Impossibilité de séparer `wblt_distance`/`wblt_lsi`/`wblt_asymmetry`/`wblt_relative_distance` (Mobilité) ; agrégation aveugle au rôle clinique du KPI (Explosivité/Absorption) |
| **Incohérence de configuration interne à `TFM`** (indépendante de Vierge_7 — deux tests de même famille Vierge_7 traités différemment par `TFM`) | Stabilisation (`eo` vs `ef`, `hip_ext` vs `hip_abd`/`hip_add`) | 1/8 à ce stade | 🟡-🟠 | `eo:1` / `ef:2` pour une même famille diagnostique Vierge_7 |

**Non encore vérifié systématiquement sur toutes les qualités** : la construction KPI→Test n'a été
auditée en détail que sur Explosivité, Absorption et Stabilisation/Contrôle Sensori-moteur (tests
sensoriels). Mobilité, Force, Puissance et Réactivité n'ont pas fait l'objet de la même vérification
explicite — signalé comme limite méthodologique de ce registre, pas comme absence du motif.

---

## Qualités restantes à auditer (TFM)

Endurance — Force, Puissance, Réactivité, Explosivité, Absorption, Stabilisation et Contrôle
Sensori-moteur terminées, en attente de validation avant de poursuivre.

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

## Qualités restantes à auditer (TFM)

Force · Explosivité · Puissance · Réactivité · Absorption · Stabilisation · Contrôle Frontal ·
Contrôle Sensoriel · Endurance — en attente de validation de la méthodologie sur Mobilité par le
praticien avant de poursuivre.

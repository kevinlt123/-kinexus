# Audit — Pourquoi « Contrôle Frontal » a disparu du moteur HYP###

## Statut

Audit factuel, documentaire uniquement. Aucune proposition d'implémentation, aucune nouvelle
qualité créée, aucun document existant modifié. Sources : lecture directe de
`/home/user/-kinexus/index.html`, des trois extraits texte de Vierge_7 disponibles
(`vierge7_p1.txt`, `p2.txt`, `p3.txt` — limite de couverture explicitée en §3.1), et de l'ensemble
des documents `.md` du chantier (Phases A à I, `HYP_ARCHITECTURE_*`, `PHASE_*`, `ADR-*`,
`KINEXUS_*`).

---

# 1. Références à « Contrôle Frontal » — inventaire

## Dans le code (`index.html`)
- **`TFM`** (`:750`) : 16 tests contribuent à `controle_frontal` — `hip_abd`, `hip_add`,
  `landing_uni`, `ybt`, `side_hop` (poids 3) ; `df_iso`, `inv_iso`, `ev_iso`, `hip_rot_int`,
  `hip_rot_ext`, `sllt`, `crossover_hop` (poids 2) ; `hip_flex`, `hip_ext`, `sldj`, `ef`, `strobo`
  (poids 1).
- **`FUNCTIONS`** (`:742`) : `'Contrôle Frontal'` est le 8ᵉ des 10 noms de qualité.
- **Rapport PDF** : `buildExpertReport` (`:5156`, table complète, sans exclusion) ; `buildSportifReport`
  (`:4618-4621`, item de checklist RTP nommément dédié, aux côtés de Mobilité et Absorption).
- **Historique** : `HistoriqueView` (`:6645`), comparaison entre bilans sans exclusion.
- **Priorisation (fonction)** : `computeMoteur()` (`:4213`), éligible au top-3 comme toute qualité.
- **RTP** : inclus explicitement dans la checklist de retour au sport du rapport sportif (`:4618`).
- **Affichages** : onglets `'fonctions'` et `'couverture'` d'`ExpertView` (`:6557`, `:6587`), icône
  dédiée `🛡️` (`:6434`), configurable dans `QualityConfigView` (`:5500`).

*(Détail complet déjà produit dans `AUDIT_TFM_VS_HYP_QUALITES.md` §3 — non reproduit ligne à ligne
ici, seulement résumé.)*

## Dans les documents du chantier HYP###
- **`HYP_ARCHITECTURE_FREEZE.md`** (ligne 464, section "Ce qui reste hors de ce gel") : *"Les
  qualités Contrôle Frontal (non encore auditée) — `ybt` reste sans domicile tant qu'elle n'est pas
  lue."* — mention explicite et unique de ce type dans ce document.
- **`AUDIT_TFM_VS_VIERGE7.md`** (Phase A) : 4 occurrences, toutes formulées comme un point en
  **attente**, jamais comme une conclusion : *"non mentionné (statut toujours en suspens, dépend de
  l'audit Contrôle Frontal à venir)"* (ligne 1226), *"Statut définitif encore en suspens jusqu'à
  l'audit de Contrôle Frontal"* (ligne 1376), et pour `side_hop` : *"a son rôle principal en
  Contrôle Frontal selon `TFM` lui-même"* (ligne 601/609).
- **`HYP_ARCHITECTURE_PHASE_B.md`** (ligne 27) : *"Contrôle Frontal n'est [pas audité]"* — mention
  de portée, cohérente avec les deux documents précédents.
- **`KINEXUS_ENGINE_MAP.md`** (ligne 24) : cite `'Contrôle Frontal'` uniquement dans l'énumération
  brute des 10 `FUNCTIONS`, sans commentaire.
- **Aucune mention** dans `HYP_ARCHITECTURE_PHASE_C.md`, `HYP_VARIABLE_MATRIX.md`,
  `PHASE_D_LOGICAL_VALIDATION.md`, `PHASE_E_INFERENCE_ENGINE.md`, `PHASE_F_ADR.md`,
  `PHASE_G_IMPLEMENTATION_PLAN.md`, `PHASE_H_TECHNICAL_SPECIFICATION.md`, `ADR-001` à `ADR-008` —
  recherche exhaustive, aucune occurrence.

---

# 2. Tests, KPI et déficits cliniques réellement capturés

## Les 16 tests TFM et leur nature clinique
| Test | Poids `controle_frontal` | Nature clinique du signal |
|---|---|---|
| `hip_abd`, `hip_add` | 3 | Force isométrique des abducteurs/adducteurs de hanche — stabilisateurs frontaux du bassin |
| `landing_uni` | 3 | Contrôle du membre inférieur à la réception unipodale (incluant la composante frontale du valgus dynamique) |
| `ybt` | 3 | Y-Balance Test — portée dynamique en équilibre unipodal, dont une direction postéro-latérale (`ybt_pl`) sollicitant explicitement le plan frontal |
| `side_hop` | 3 | Saut latéral répété — sollicitation frontale directe (déplacement dans le plan frontal) |
| `df_iso`, `inv_iso`, `ev_iso` | 2 | Force isométrique de cheville, dont inversion/éversion — stabilisateurs frontaux de cheville |
| `hip_rot_int`, `hip_rot_ext` | 2 | Force isométrique des rotateurs de hanche (plan transverse, contigu au plan frontal dans le contrôle du valgus dynamique) |
| `sllt` | 2 | Single Leg Land and Hold — réception unipodale avec maintien |
| `crossover_hop` | 2 | Saut croisé — changement de direction latéral |
| `hip_flex`, `hip_ext` | 1 | Force isométrique de hanche (plan sagittal principalement, contribution mineure ici) |
| `sldj` | 1 | Single Leg Drop Jump — réactivité unipodale, contribution frontale mineure |
| `ef`, `strobo` | 1 | Équilibre yeux fermés / stroboscopique — contrôle postural, contribution mineure |

**Déficit clinique agrégé que `controle_frontal` prétend capturer** : la capacité du membre
inférieur à résister à un effondrement dans le plan frontal (valgus dynamique du genou,
instabilité latérale de hanche/cheville) lors d'appuis unipodaux, réceptions et changements de
direction — un déterminant classique du risque de blessure (notamment ligamentaire du genou) dans
la littérature sportive, distinct de la force maximale, de la puissance ou de la stabilisation
posturale générale au sens strict.

## KPI
Le détail KPI par KPI de chacun de ces 16 tests n'a pas été retracé exhaustivement dans cet audit
(hors périmètre du temps imparti) — seule la contribution au niveau test, telle qu'elle apparaît
dans `TFM`, a été vérifiée. **[HYPOTHÈSE]** : la contribution réelle à `controle_frontal` s'exerce
vraisemblablement via les mêmes KPI que ceux déjà utilisés ailleurs pour ces mêmes tests (ex.
`hip_abd_n`/`nkg`, `ybt_pl`/`ybt_composite`, `landing_uni_tts`) — non vérifié KPI par KPI ici.

---

# 3. Vérification dans les documents du chantier

## 3.1 Vierge_7 — recherche directe, avec limite explicite
**Limite méthodologique** : seuls 3 extraits texte (`vierge7_p1.txt`, `p2.txt`, `p3.txt`) sont
disponibles pour recherche directe dans cette session, correspondant à une partie non précisément
délimitée des 462 pages du document source (5 parties PDF au total). **Cette recherche n'est donc
pas exhaustive du document complet.**

**Trois constats directs, dans ce périmètre partiel** :

1. **`ybt_ant`/`ybt_pm`/`ybt_pl`/`ybt_composite` apparaissent deux fois, toujours dans une liste de
   variables EXCLUES** — une fois sous l'intitulé "Variables de mobilité / équilibre / contrôle
   sensoriel" (contexte Puissance, `vierge7_p1.txt:1400-1420`), une fois explicitement sous
   "VARIABLES EXCLUES DU DIAGNOSTIC DE RÉACTIVITÉ" (`vierge7_p1.txt:2237-2255`). Dans les deux cas,
   `ybt_*` est regroupé avec `wblt_distance` et `sls_ttf`/`sls_cop_path`/`sls_cop_vel` — c'est-à-dire
   avec des variables diagnostiques de Mobilité et de Stabilisation/Contrôle Sensori-moteur. **Aucune
   occurrence positive (diagnostique/confirmative/explicative) de `ybt_*` n'a été trouvée dans le
   périmètre recherché.**
2. **`crossover_hop_distance` apparaît 4 fois** (`vierge7_p1.txt:749,1838,3013,3659`), toujours dans
   des listes "Tests horizontaux/fonctionnels" en confirmative de Puissance et de Réactivité —
   cohérent avec le contenu déjà transcrit dans `HYP_ARCHITECTURE_PHASE_C.md` (confirmative de
   `HYP-REA-01`). Aucune mention en lien avec un contrôle frontal/latéral.
3. **`hip_abd_*`/`hip_add_*`/`inv_iso_*`/`ev_iso_*` apparaissent** (`vierge7_p1.txt:943-1018,
   2008+`) dans une section "PREUVES EXPLICATIVES PHYSIOLOGIQUES" — cohérent avec leur statut déjà
   transcrit d'explicatives physiologiques de `HYP-STAB-01` (Stabilisation).
4. **Un CIB explicite existe pour le concept clinique "perte de contrôle dans les plans frontal et
   transverse"** : `CIB172`, texte exact *"Réduire la perte de contrôle dans les plans frontal et
   transverse."* (`vierge7_p3.txt:4295-4298`). **Ce CIB appartient à la section "17. PIVOT /
   ROTATION"** (`vierge7_p3.txt:4265`), elle-même partie d'un catalogue de 11 sections numérotées
   10 à 20 (`PROPULSION, DÉCÉLÉRATION/FREINAGE, CHANGEMENT DE DIRECTION, SAUT, COURSE, APPUI
   UNIPODAL, RÉCEPTION/ATTERRISSAGE, PIVOT/ROTATION, TOLÉRANCE À LA FATIGUE FONCTIONNELLE,
   REPRISE/RETOUR AU SPORT, PERFORMANCE GLOBALE`) — organisé **par type de tâche motrice**, pas par
   qualité physique. Ce catalogue correspond structurellement au "Niveau 3 — Fonctions motrices"
   déjà identifié dans `HYP_ARCHITECTURE_PHASE_C.md` comme hors périmètre des fiches HYP###. Les
   sections numérotées 1 à 9 de ce même catalogue **n'ont pas été localisées** dans le texte
   disponible — leur contenu (susceptible de contenir une entrée dédiée) reste inconnu.

## 3.2 `CLI###`
`HYP_ARCHITECTURE_PHASE_C.md` établit un mapping exhaustif et déjà validé : `CLI010`-`012`=Force ·
`CLI020`-`021`=Mobilité · `CLI030`-`031`=Explosivité · `CLI040`-`041`=Puissance ·
`CLI050`-`051`=Réactivité · `CLI060`-`061`=Absorption · `CLI070`-`071`=Stabilisation ·
`CLI080`-`081`=Endurance · `CLI090`-`092`=Contrôle Sensori-moteur. **Aucune plage `CLI###` n'est
attribuée à un « Contrôle Frontal ».** Le seul contenu directement lié au concept clinique de
contrôle frontal identifié dans Vierge_7 (§3.1, point 4) se situe au niveau `CIB172`, une couche
différente et plus en aval (Cible physiologique, Niveau 3, générée depuis une hypothèse déjà
retenue) — pas au niveau `CLI` de Niveau 1.

## 3.3 `HYP###`
Aucune fiche `HYP-###` ne porte ce nom, active ou suspendue. Seules `HYP-CSM-01` (Contrôle
Sensori-moteur) est suspendue pour une tout autre raison (quasi-duplication avec Stabilisation,
gel point 1) — sans lien direct établi avec Contrôle Frontal.

## 3.4 Phases A à I
- **Phase A** : Contrôle Frontal n'a jamais fait partie de la séquence d'audit TFM (Mobilité → Force
  → Puissance → Réactivité → Explosivité → Absorption → Stabilisation → Contrôle Sensori-moteur →
  Endurance — 9 qualités, ordre fixé dès la première instruction du praticien). Chaque occurrence
  rencontrée en cours d'audit a été explicitement notée comme point en attente (§1), jamais tranchée.
- **Phase B/C** : les 9 fiches construites correspondent exactement à cette même liste de 9
  qualités — Contrôle Frontal n'y figure à aucun moment, ni comme fiche, ni comme point à arbitrer.
- **`HYP_ARCHITECTURE_FREEZE.md`** : la seule mention du chantier de gel se trouve dans la section
  "Ce qui reste hors de ce gel" (§1), c'est-à-dire explicitement listée comme **non couverte par le
  gel**, plutôt que tranchée d'une façon ou d'une autre.
- **Phases D à H** : aucune mention. Ces phases opèrent toutes sur les 9 qualités déjà couvertes ; le
  périmètre n'a jamais été rouvert.
- **Phase I / `AUDIT_TFM_VS_HYP_QUALITES.md`** : redécouverte et documentation de l'écart, sans
  nouvelle information sur son origine.

---

# 4. Détermination

## Éléments factuels établis
- Contrôle Frontal a été **explicitement exclu du périmètre d'audit dès la première instruction de
  la Phase A** (liste de 9 qualités, pas 10) — ce n'est pas un oubli survenu en cours de route, c'est
  une exclusion de portée fixée dès le départ.
- Cette exclusion a été **signalée à répétition, jamais silencieusement absorbée** (`HYP_
  ARCHITECTURE_FREEZE.md`, `AUDIT_TFM_VS_VIERGE7.md` ×4, `HYP_ARCHITECTURE_PHASE_B.md`).
- **5 des 16 tests contribuant à Contrôle Frontal** (`hip_abd`, `hip_add`, `inv_iso`, `ev_iso`,
  `df_iso`) sont réutilisés dans Vierge_7 — confirmé directement dans le texte source — comme
  **preuves explicatives physiologiques de Stabilisation**, pas comme diagnostic d'une qualité
  frontale autonome.
- **`ybt` (3 des 16 tests, poids max)** n'apparaît, dans le périmètre de texte disponible, que dans
  des listes d'exclusion — jamais positivement rattaché à une qualité, y compris Stabilisation ou
  Contrôle Sensori-moteur.
- **Le concept clinique "contrôle dans les plans frontal et transverse" existe bien dans
  Vierge_7** (`CIB172`), mais à un niveau architectural différent (Niveau 3, catalogue organisé par
  fonction motrice/tâche — Pivot/Rotation), pas au niveau Niveau 1 (qualités physiques) où TFM
  place Contrôle Frontal.
- La recherche dans Vierge_7 **n'est pas exhaustive** (limite de couverture texte, §3.1).

## Réponse à la question posée

**Aucun des cas A, B ou C ne rend compte, seul, de l'ensemble des faits observés.**

- **Ce n'est pas le cas A pur** ("oublié pendant la reconstruction") : l'exclusion est antérieure à
  la reconstruction elle-même (fixée dès la première instruction de Phase A) et a été signalée sans
  relâche à chaque occurrence — un oubli, par définition, ne laisse pas 4 traces documentaires
  explicites répétant "en attente".
- **Ce n'est pas le cas B pur** ("déjà absorbé par une ou plusieurs qualités HYP existantes") :
  seuls 5 des 16 tests contributeurs sont réutilisés ailleurs, et uniquement en tant que preuves
  *explicatives* de Stabilisation (pas diagnostiques) — pas une absorption complète de la
  construction clinique "contrôle frontal" en tant que telle. `ybt`, `side_hop`, `landing_uni`
  (déjà diagnostique d'Absorption/Stabilisation pour d'autres raisons), `crossover_hop`, `sllt`,
  `hip_rot_int/ext`, `sldj`, `ef`, `strobo` ne sont rattachés à aucune construction "contrôle
  frontal" retrouvée dans Vierge_7.
- **Ce n'est pas le cas C pur** ("volontairement abandonné par Vierge_7") : aucun texte trouvé
  n'exprime un abandon ou un rejet explicite de ce concept — au contraire, le concept clinique
  "perte de contrôle en plans frontal/transverse" existe dans Vierge_7 sous forme de `CIB172`,
  simplement à un autre niveau d'architecture (Niveau 3, motricité) que celui où TFM le place
  (Niveau 1, qualité).

**Le cas le plus proche des faits établis est le cas D — les documents actuels ne permettent pas
de conclure avec certitude —, avec la nuance suivante, elle-même établie par les faits ci-dessus,
pas déduite au-delà d'eux** : Contrôle Frontal n'a jamais été *évalué* par le chantier HYP### (ni
inclus, ni exclu sur le fond) — il a été mis hors périmètre dès l'origine et ce périmètre n'a jamais
été rouvert. Ce que Vierge_7 dit réellement de ce concept clinique, en dehors des 5 tests déjà
partiellement réutilisés et du `CIB172` situé à un autre niveau, reste non déterminé par la
documentation actuelle — en partie parce que la recherche dans Vierge_7 reste elle-même
incomplète (§3.1).

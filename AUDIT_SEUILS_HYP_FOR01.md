# Audit des seuils réels — HYP-FOR-01 (Force)

**Statut** : audit uniquement. Aucun code modifié, aucun seuil proposé, aucune recherche externe.
Toute affirmation vérifiée directement dans `index.html` (`NORMS`, `THRESHOLDS`, `TFM`, `TESTS`).

---

## 1. Cartographie des seuils — variables diagnostiques HYP-FOR-01

| Variable | Diagnostique HYP | Seuil réel ? | Source | Fonction qui l'applique | Direction | Population/norme |
|---|---|---|---|---|---|---|
| `imtp_n` | Oui (`CLI010`) | **Non** | — | `applyThr('imtp_n',...)` retourne toujours `null` | `max` (documenté `TBK`) | Aucune |
| `slimtp_n` | Oui (`CLI010`) | **Non** | — | `applyThr('slimtp_n',...)` retourne toujours `null` | `max` | Aucune |
| `iso_belt_squat_n` | Oui (`CLI010`) | **Oui** | `NORMS` uniquement (pas de repli `THRESHOLDS`) | `applyThr('iso_belt_squat_n',...)` | `max` | 15 populations : 13 sport `fd_*` (`index.html:1358-1370`) + `general_m`/`general_f` par âge (`index.html:1374,1378`) |
| `sl_iso_push_n` | Oui (`CLI010`) | **Oui** | `NORMS` uniquement | `applyThr('sl_iso_push_n',...)` | `max` | 3 populations football : `foot_m_senior`, `foot_f_senior`, `foot_f_youth` (`index.html:1346,1350,1352`) |

**2 des 4 variables diagnostiques documentées sont utilisables aujourd'hui, et seulement pour les
populations couvertes.**

---

## 2. Variables déjà opérationnelles — `iso_belt_squat_n` / `sl_iso_push_n`

### Comment le seuil est défini
Aucun des deux n'a de repli `THRESHOLDS` (vérifié : aucune entrée `iso_belt_squat_n:{...dir...}`
ni `sl_iso_push_n:{...dir...}` dans `THRESHOLDS`, `index.html:1214`). Le seuil vient
**exclusivement** de `NORMS` — des bandes de percentiles par population, extraites de rapports VALD
réels (documenté en commentaire à proximité des tables, ex. `index.html:1347-1349` : "Enrichi
(04/08)... extrait du même rapport VALD Women's Super League 2025/26").

### Comment il est appliqué
Via `applyThr(key,val,pop,age)` : `if(pop&&NORMS[pop]&&NORMS[pop][key]!=null){bands=resolveBands(...);
ps=pctStatus(bands,val);if(ps)return ps;}` — sans correspondance de population, la fonction retombe
sur `THRESHOLDS[key]`, **inexistant ici**, donc retourne `null`. **Conséquence directe** :
`iso_belt_squat_n`/`sl_iso_push_n` ne sont classifiables **que** pour un athlète dont la population
de normes sélectionnée figure explicitement dans `NORMS` — pour toute autre population (y compris
"aucune norme sélectionnée"), ces deux variables sont tout aussi non classifiables qu'`imtp_n`.

### États qu'elles peuvent produire
`vert`/`jaune`/`orange`/`rouge` (via `pctStatus` sur les bandes de percentiles) quand la population
est couverte ; `null` (non classifiable) sinon. Aucun état supplémentaire.

### Peuvent-elles alimenter `CLI010` ?
Oui, structurellement — ce sont deux des quatre entrées de la liste `CLI010`. Mais `CLI010` exige
"au moins deux des quatre variables diagnostiques déficitaires" : avec seulement ces deux
classifiables, la condition ne peut être remplie qu'en exigeant **les deux, conjointement**
(voir §4).

### Seules ou en convergence ?
**Seules, chacune peut produire un statut individuel** (déficit isolé sur `iso_belt_squat_n` par
exemple). Mais pour respecter la règle documentée "≥2/4", un déficit isolé sur une seule des deux
reste, au sens strict de `CLI010`, **insuffisant** pour retenir HYP-FOR-01 — exactement le même
principe que pour les autres qualités déjà auditées (Puissance, Réactivité).

---

## 3. IMTP et SLIMTP — pourquoi aucun seuil n'existe

Vérifications effectuées, dans l'ordre demandé :

1. **Normes ailleurs dans le code ?** Non. `imtp_n`/`slimtp_n`/`imtp_nkg`/`slimtp_nkg` n'apparaissent
   dans **aucune** entrée de `NORMS`, sous aucune population. La note de description de
   `general_m`/`general_f` (`index.html:1298-1299`) affirme une source "IMTP, CMJ" — mais l'objet
   `NORMS` réel pour ces deux populations (`index.html:1373-1380`) ne contient que
   `iso_belt_squat_n` et `cmj_height`. **Écart entre la description et le contenu réel de la
   donnée**, constaté tel quel, non corrigé.
2. **Normes dans les documents HYP ?** Non. Recherche dans `HYP_ARCHITECTURE_PHASE_C.md` (section
   Force complète) : aucune mention de seuil, valeur, ou référence normative pour IMTP/SLIMTP — la
   fiche cite les noms de variables et les rôles cliniques, jamais de valeurs.
3. **Valeurs de référence dans `TFM` ?** `TFM` contient `imtp:{force:3,explosivite:2,puissance:3,
   absorption:1}` et `slimtp:{force:3,explosivite:2,puissance:3,absorption:1}` — ce sont des
   **poids de contribution** (utilisés par la boucle générique de `computeMoteur()` pour pondérer
   `computeTestStatus` dans le score TFM d'une fonction), **pas des seuils cliniques**. Le poids 3
   (maximal) indique qu'IMTP est traité comme la variable la plus importante pour Force dans
   l'ancien mécanisme TFM — ce qui rend d'autant plus notable qu'elle ne puisse produire aucun
   statut réel. Conformément à l'instruction de la mission, **cette valeur n'est pas interprétée ici
   comme un seuil**.
4. **Mentionnées uniquement comme variables ?** Oui — c'est le cas. `imtp_n`/`imtp_nkg` apparaissent
   dans le catalogue de métadonnées narratif (`index.html:4009`, structure `explainedBy`) comme
   noms de KPI reconnus, sans aucune valeur numérique associée.

**Conclusion** : aucune information exploitable n'existe dans le code pour dériver un seuil
IMTP/SLIMTP, ni directement, ni par transformation d'une donnée existante. Aucun seuil n'est
proposé ici, conformément à l'instruction.

---

## 4. Impact sur le diagnostic global

Avec seulement `iso_belt_squat_n`/`sl_iso_push_n` disponibles (et sans `imtp_n`/`slimtp_n`), la
règle documentée "≥2/4" ne peut, en pratique, être évaluée que sur ces deux variables — ce qui
revient, avec seulement 2 variables disponibles sur 4, à exiger **les deux conjointement**.

**Profils diagnosticables** :
- Athlète avec population `NORMS` couverte pour les deux tests (parmi les 13 populations `fd_*` +
  `general_m`/`general_f` pour `iso_belt_squat_n`, et les 3 populations `foot_*` pour
  `sl_iso_push_n` — intersection réelle probablement réduite, une seule population `NORMS` étant
  sélectionnée par athlète) **et** les deux tests réalisés et actifs → un déficit conjoint sur les
  deux est diagnosticable comme déficit global de Force.

**Profils devenant NON DÉTERMINABLES** :
- Tout athlète dont la population de normes sélectionnée ne couvre ni `iso_belt_squat_n` ni
  `sl_iso_push_n` (aucune des populations disponibles ne correspond) → aucune des 4 variables
  diagnostiques n'est classifiable → HYP-FOR-01 entièrement non déterminable.
- Tout athlète n'ayant réalisé qu'IMTP/SLIMTP (sans Belt Squat ni Single Leg Push) → 0 variable
  classifiable, même si la population est par ailleurs bien couverte pour Belt Squat/Push.
- Tout athlète avec un déficit réel isolé sur IMTP ou SLIMTP (déficit global réel de force
  maximale, visible uniquement sur ces tests) → **invisible** pour le moteur, quel que soit le
  niveau du déficit — faux négatif structurel, pas un cas limite.
- Un déficit sur une seule des deux variables classifiables (`iso_belt_squat_n` **ou**
  `sl_iso_push_n`, pas les deux) → signal isolé, insuffisant pour "≥2/4" au sens strict.

---

## 5. Niveau 2 segmentaire — vérification réelle, groupe par groupe

Condition documentée par segment (`CLI200`-`211`) : *"au moins une variable diagnostique globale
déficitaire ET déficit local confirmé"*. Le "déficit local confirmé" s'appuie sur `_n`/`_nkg` du
segment (fiche de qualité). Vérification de la classifiabilité réelle de ces deux variantes par
groupe :

| Segment | `CLI` | `_n` : seuil réel ? | `_nkg` : seuil réel ? | Diagnostic local possible ? |
|---|---|---|---|---|
| Quadriceps (`knee_ext`) | `CLI200` | Non (aucune `NORMS`/`THRESHOLDS`) | Oui — `THRESHOLDS` (vert 3.0/jaune 2.5/orange 2.0) | Via `_nkg` seul |
| Ischio-jambiers (`knee_flex`) | `CLI203` | Non | Oui — `THRESHOLDS` (vert 1.8/jaune 1.5/orange 1.2) | Via `_nkg` seul |
| Soléaire (`soleus_iso`) | `CLI201` | Oui — `NORMS` (3 pop. `foot_*`) | Oui — `THRESHOLDS` (vert 2.5/jaune 2.0/orange 1.5) | Oui, deux voies (population-dépendant pour `_n`, toujours pour `_nkg`) |
| Gastrocnémien (`gastro_iso`) | `CLI202` | Non | Oui — `THRESHOLDS` (vert 2.0/jaune 1.6/orange 1.2) | Via `_nkg` seul |
| Extenseurs de hanche (`hip_ext`) | `CLI204` | Non | Oui — `THRESHOLDS` (vert 2.5/jaune 2.0/orange 1.5) | Via `_nkg` seul |
| Abducteurs de hanche (`hip_abd`) | `CLI205` | Oui — `NORMS` (3 pop. `foot_*`) | Oui — `THRESHOLDS` (vert 2.0/jaune 1.6/orange 1.2) | Oui, deux voies |
| Adducteurs (`hip_add`) | `CLI206` | Oui — `NORMS` (3 pop. `foot_*`) | Oui — `THRESHOLDS` (vert 1.8/jaune 1.4/orange 1.0) | Oui, deux voies |
| Fléchisseurs de hanche (`hip_flex`) | `CLI207` | Oui — `NORMS` (3 pop. `foot_*`) | Oui — `THRESHOLDS` (vert 2.0/jaune 1.6/orange 1.2) | Oui, deux voies |
| Dorsiflexeurs (`df_iso`) | `CLI208` | Non | **Non** (absent de `THRESHOLDS`) | **Non — aucune voie** |
| Inverseurs (`inv_iso`) | `CLI209` | Non | **Non** | **Non — aucune voie** |
| Éverseurs (`ev_iso`) | `CLI210` | Non | **Non** | **Non — aucune voie** |
| Épaule (`sh_iso_9020`/`9090`) | `CLI211` | Non | Oui — `THRESHOLDS` (`9020`: vert 2.0/jaune 1.6/orange 1.2 ; `9090`: vert 1.5/jaune 1.2/orange 0.9) | Via `_nkg` seul, pour ces 2 variantes |
| Épaule (`sh_iso_3030`/`6060`) | `CLI211` | Non | **Non** (absentes de `THRESHOLDS`) | **Non — aucune voie** |

**Constat** : sur 12 groupes, **4 restent totalement non diagnosticables localement**
(`df_iso`, `inv_iso`, `ev_iso`, `sh_iso_3030`/`6060`), **4 ne le sont que via `_nkg`**
(`knee_ext`, `knee_flex`, `gastro_iso`, `hip_ext`, `sh_iso_9020`/`9090` — soit 5 en comptant les
variantes d'épaule séparément), et **4 disposent d'une double voie** (`soleus_iso`, `hip_abd`,
`hip_add`, `hip_flex` — `_n` et `_nkg` classifiables). Ne pas supposer qu'un groupe documenté dans
la fiche fonctionne réellement : la moitié environ des groupes ne peut aujourd'hui produire aucun
diagnostic local, quelle que soit la sévérité réelle du déficit.

Par ailleurs, **la condition globale du Niveau 2 elle-même** ("variable diagnostique globale
déficitaire") hérite du blocage du §4 — même un segment localement diagnosticable ne peut
déclencher `CLI200`-`211` que si le volet global (`iso_belt_squat_n`/`sl_iso_push_n`) a
préalablement produit un déficit classifiable.

---

## 6. Absolu (`_n`) vs relatif (`_nkg`)

| Variable | `_n` seuil réel | `_nkg` seuil réel |
|---|---|---|
| `imtp` | Non | Non |
| `slimtp` | Non | Non |
| `iso_belt_squat` | Oui (`NORMS`) | Oui (`NORMS`, mêmes 13 pop. `fd_*`, pas de repli `THRESHOLDS`) |
| `sl_iso_push` | Oui (`NORMS`, 3 pop.) | Oui (`THRESHOLDS` — vert 2.5/jaune 2.0/orange 1.5) |
| 12 segments (Niveau 2) | Oui pour 4/12 (`NORMS`, mêmes 3 pop. `foot_*`) | Oui pour 10/12 (`THRESHOLDS`) |

**Vérification demandée par la mission (§6)** — `_nkg` ne devient pas une deuxième preuve
diagnostique indépendante de `_n` : confirmé, aucune ambiguïté trouvée. `HYP_ARCHITECTURE_PHASE_C.md`
liste explicitement `_nkg` (des 4 tests diagnostiques) sous "Critères confirmatifs", jamais sous
"Critères diagnostiques" — rôle respecté dans les documents source. **Point notable, non une
violation, mais à garder en tête** : pour `sl_iso_push` et pour 10 des 12 segments, `_nkg` est
aujourd'hui **plus souvent classifiable que `_n`** (repli `THRESHOLDS` disponible), ce qui veut
dire que la preuve confirmative est parfois la seule preuve réellement disponible pour un
segment/test donné — sans jamais, dans le code actuel, être utilisée comme preuve diagnostique à sa
place (aucun mécanisme HYP-FOR-01 n'existe encore pour promouvoir `_nkg` — l'exercice reste
théorique tant que HYP-FOR-01 n'est pas implémenté).

---

## 7. RFD / TTPF

Recherche exhaustive dans `NORMS` et `THRESHOLDS` pour toutes les variantes RFD (`rfd50`/`100`/
`150`/`200`) et TTPF des 4 tests diagnostiques et des 12 segments : **aucune entrée trouvée, pour
aucune variable RFD/TTPF, sur aucun test.**

- **Seuil réel** : aucune.
- **Utilisables comme variables explicatives** : non plus, au sens de produire un statut
  vert/jaune/orange/rouge — seule une valeur brute peut être affichée, sans classification. Leur
  rôle documenté ("variables explicatives physiologiques/biomécaniques") ne peut aujourd'hui se
  traduire en aucune lecture qualitative (↓/=) faute de seuil, exactement comme
  `cmj_braking_impulse` pour Absorption.
- **Inutilisables faute de seuil** : la totalité des variables RFD/TTPF de Force (diagnostiques et
  segmentaires), sans exception trouvée.

Rappel : cette section ne cherche pas à les rendre diagnostiques (elles ne le sont pas dans les
sources) — le constat porte uniquement sur leur inutilisabilité même comme explicatives
classifiées.

---

## 8. Décision technique — classement des variables

**A — Opérationnelles maintenant** (seuil réel, population-dépendant) :
`iso_belt_squat_n`, `iso_belt_squat_nkg`, `sl_iso_push_n`, `sl_iso_push_nkg`, `soleus_iso_n`,
`soleus_iso_nkg`, `hip_abd_n`, `hip_abd_nkg`, `hip_add_n`, `hip_add_nkg`, `hip_flex_n`,
`hip_flex_nkg`, `knee_ext_nkg`, `knee_flex_nkg`, `gastro_iso_nkg`, `hip_ext_nkg`,
`sh_iso_9020_nkg`, `sh_iso_9090_nkg`.

**B — Utilisables après ajout d'un seuil clinique validé** (variable existante, mesurée, aucun
seuil aujourd'hui — nécessiterait une source normative fiable, non recherchée ici) :
`imtp_n`, `imtp_nkg`, `slimtp_n`, `slimtp_nkg`, `knee_ext_n`, `knee_flex_n`, `hip_ext_n`,
`gastro_iso_n`, `df_iso_n`, `df_iso_nkg`, `inv_iso_n`, `inv_iso_nkg`, `ev_iso_n`, `ev_iso_nkg`,
`sh_iso_3030_n`/`nkg`, `sh_iso_6060_n`/`nkg`, toutes les variantes RFD/TTPF (diagnostiques et
segmentaires).

**C — Non déterminables avec les sources actuelles** :
aucune variable de cette liste ne relève de la catégorie C au sens strict (« aucune information
ne permet même de savoir si elle est diagnostique/confirmative/explicative ») — le **rôle** de
chaque variable est documenté sans ambiguïté dans les sources cliniques ; c'est uniquement la
**disponibilité du seuil** qui manque (catégorie B). Aucune variable n'a été trouvée dont le rôle
lui-même serait indéterminable.

---

## 9. Proposition minimale

**Le plus petit changement permettant d'améliorer réellement HYP-FOR-01 sans inventer de nouvelle
règle clinique et sans transformer une donnée existante en seuil** :

**Ne rien changer dans l'immédiat** — conserver les variables déjà opérationnelles
(`iso_belt_squat_n`/`sl_iso_push_n` pour le Niveau 1, `_nkg` en confirmatif) telles quelles, et
documenter explicitement, au moment d'une future implémentation, que HYP-FOR-01 fonctionnera en
mode dégradé (2/4 variables Niveau 1, 4-10/12 groupes Niveau 2 selon la variante) tant qu'aucune
nouvelle source normative n'est apportée pour IMTP/SLIMTP/RFD/TTPF.

Si une amélioration réelle est souhaitée, la seule voie conforme à l'instruction ("si une source
clinique fiable existe déjà") serait : **vérifier si le praticien dispose, en dehors du code
actuel, d'un rapport normatif VALD couvrant IMTP/SLIMTP** — les tables `NORMS` existantes
(`fd_*`, `foot_*`, `general_m`/`general_f`) montrent que Kinexus sait déjà intégrer ce type de
données quand la source existe (même méthode que pour `iso_belt_squat`/`sl_iso_push`/segments
`foot_*`). C'est une question de **données disponibles chez le praticien**, pas une question de
code ou de règle clinique à inventer — hors du périmètre de cette mission, qui se limite au
constat.

---

## CONCLUSION

**FORCE** :
- **Diagnostic global (Niveau 1)** : **partiel** — 2 des 4 variables documentées opérationnelles
  (`iso_belt_squat_n`, `sl_iso_push_n`), population-dépendantes ; `imtp_n`/`slimtp_n`
  structurellement inatteignables.
- **Niveau 2 (segmentaire)** : **partiel** — 4/12 groupes disposent d'une double voie de
  confirmation locale, 5/12 (en comptant les variantes d'épaule séparément) seulement via `_nkg`,
  4/12 totalement bloqués (`df_iso`, `inv_iso`, `ev_iso`, `sh_iso_3030`/`6060`).
- **Explication (RFD/TTPF)** : **bloquée** — aucune variable explicative RFD/TTPF, diagnostique ou
  segmentaire, ne dispose d'un seuil ; toutes restent au stade de la valeur brute non classifiée.
- **Prochaine action recommandée** : aucune action de code. Vérifier auprès du praticien
  l'existence éventuelle d'un rapport normatif VALD couvrant IMTP/SLIMTP (et RFD/TTPF si
  disponible) avant d'envisager toute implémentation de HYP-FOR-01 — sans cette source, HYP-FOR-01
  ne peut être implémenté qu'en mode volontairement dégradé, documenté comme tel.

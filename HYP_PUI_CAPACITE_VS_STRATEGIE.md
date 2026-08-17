# HYP-PUI-01 — Déficit de capacité vs problème de stratégie d'exécution

**Statut** : évolution clinique **ciblée** de `HYP-PUI-01` uniquement. Aucun code, aucune
modification des autres qualités, aucune nouvelle variable, aucun seuil inventé. Ce document acte le
**principe** de la distinction Capacité/Stratégie (déjà validé par le praticien dans la mission) et
analyse **précisément ce qui est déjà supporté par les sources** vs **ce qui reste à valider** vs
**ce qui n'est pas discriminable**. Il ne modifie ni le modèle de données HYP###, ni les `CLI###`.

**Sources** : `CARTOGRAPHIE_VARIABLES_HYP.md`, `INTERPRETATION_VARIABLES_PUISSANCE.md`,
`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`, `ORIENTATIONS_PUISSANCE_V2.md`, `HYP_ARCHITECTURE_PHASE_C.md`,
`KINEXUS_REASONING_ENGINE_V1.md`. Aucune autre source, aucune variable ajoutée.

**Légende (imposée)** :
- 🟢 **[SOURCE EXPLICITE]** — écrit littéralement dans une source.
- 🟠 **[INFERENCE]** — cohérent avec les sources, non écrit littéralement.
- 🔴 **[NOUVELLE RÈGLE À VALIDER]** — proposition soumise à l'arbitrage du praticien.

**Continuité avec `ORIENTATIONS_PUISSANCE_V2.md`** : la distinction demandée ici (Capacité vs
Stratégie) correspond exactement à la candidate identifiée comme **la mieux fondée sur les
sources** dans ce document précédent (§7, point 1) — la séparation entre "variables explicatives
physiologiques" et "variables explicatives biomécaniques", nommées séparément dans la fiche Phase C
de Puissance elle-même. Cette mission ne réintroduit donc pas la Branche "magnitude vs RFD"
(candidate plus faible, §7 point 2 du document précédent) comme une troisième branche — elle reste,
par défaut, **à l'intérieur** de la Branche Capacité, sans sous-division supplémentaire, conformément
au périmètre resserré de cette mission.

---

## 1. Les deux grandes branches

```
PUISSANCE DÉFICITAIRE (HYP-PUI-01 Retenue)
│
├── A. DÉFICIT DE CAPACITÉ
│      "l'athlète ne possède pas suffisamment les qualités physiologiques nécessaires
│       à la production de puissance"
│
└── B. PROBLÈME DE STRATÉGIE D'EXÉCUTION
       "les capacités physiologiques disponibles sont relativement conservées, mais leur
        expression lors du mouvement est inefficiente ou atypique"
```

Le matériau brut de cette distinction existe déjà 🟢 : `HYP_ARCHITECTURE_PHASE_C.md` sépare, pour
`HYP-PUI-01`, deux catégories explicatives distinctes — *"variables explicatives physiologiques"*
(Branche A) et *"variables explicatives biomécaniques"* (Branche B). Ce que ce document ajoute,
c'est l'analyse de ce que cette séparation permet réellement de conclure, et à quelles conditions.

---

## 2. Branche A — Déficit de capacité

### Variables mobilisables (reprises exactement, aucune ajoutée)

| Famille | Variables exactes | Ce qu'elles mesurent | Ce qu'une valeur déficitaire signifie | Comment elle peut expliquer Puissance ↓ | Preuve |
|---|---|---|---|---|---|
| Force absolue | `imtp_n`, `slimtp_n`, + `_n` des 11 tests segmentaires (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `sl_iso_push`, `iso_belt_squat`, `iso_squat_hold`) | Force isométrique de pic, en valeur absolue (N) | Capacité maximale de production de force insuffisante, en valeur absolue | Catégorie "Force" citée comme explicative de Puissance | 🟢 appartenance / 🟠 mécanisme précis |
| Force relative | `imtp_nkg`, `slimtp_nkg`, + `_nkg` des 11 tests segmentaires | Force isométrique de pic, rapportée au poids de corps (N/kg) | Capacité de force insuffisante une fois ajustée à la morphologie | idem | 🟢 / 🟠 |
| RFD | `imtp_rfd100`, `imtp_rfd200`, `slimtp_rfd100`, `slimtp_rfd200` | Pente de la courbe force-temps sur un intervalle fixe | Vitesse de production de force insuffisante | Catégorie "Force" (même catégorie source que la magnitude — voir remarque ci-dessous) | 🟢 appartenance / 🟠 statut de sous-mécanisme distinct pour Puissance |
| TTPF | `imtp_ttpf`, `slimtp_ttpf` | Délai pour atteindre la force de pic | Production de force anormalement lente (délai long) | idem | 🟢 / 🟠 |
| Profil force-vitesse | `profil_fv_nkg` (F0), `profil_fv_v0` (V0) | Composantes théoriques force/vitesse du modèle force-vitesse | Capacité de force (F0) ou de vitesse (V0) théorique insuffisante | Catégorie "Profil force-vitesse", explicitement citée à part | 🟢 appartenance / 🟠 lecture du sous-profil |

**34 variables au total**, exactement celles déjà listées comme "explicatives physiologiques" de
`HYP-PUI-01` (`CARTOGRAPHIE_VARIABLES_HYP.md`, `INTERPRETATION_VARIABLES_PUISSANCE.md` §1).

### Absence de hiérarchie imposée entre Force et RFD (consigne explicite de la mission)

🟢 Les sources ne permettent pas de hiérarchiser Force et RFD entre elles — les deux appartiennent à
la même catégorie source ("variables explicatives physiologiques") sans priorité relative formulée.
Ce document **ne les hiérarchise pas** — une variable de magnitude déficitaire et une variable de RFD
déficitaire comptent, l'une comme l'autre, comme une preuve physiologique déficitaire pour la Branche
A, sans qu'aucune ne soit traitée comme plus déterminante. `ORIENTATIONS_PUISSANCE_V2.md` avait
identifié une candidate de sous-séparation Force/RFD (§7, point 2) — **non reprise ici**,
conformément au périmètre resserré de cette mission (distinction Capacité/Stratégie uniquement).

---

## 3. Branche B — Problème de stratégie d'exécution

### Variables mobilisables (reprises exactement, aucune ajoutée)

| Sous-ensemble | Variables exactes | Ce qu'elle mesure | Caractéristique de stratégie renseignée | Comment une anomalie est compatible avec Puissance ↓ | Preuve |
|---|---|---|---|---|---|
| CMJ — phase unloading | `cmj_depth`, `cmj_braking_duration`, `cmj_tto` | Profondeur du contre-mouvement, durée de la phase de préparation, temps de contraction total | Amplitude et rythme de la préparation du saut | Une préparation non optimale peut réduire la puissance exprimée sans que la force sous-jacente soit en cause | 🟢 mesure / 🟠 mécanisme |
| CMJ — phase braking | `cmj_ecc_decel`, `cmj_braking_eff` | Décélération excentrique, efficacité de la phase de freinage | Qualité de la transition freinage→propulsion | Une transition inefficace peut limiter le transfert d'énergie vers la phase propulsive | 🟢 / 🟠 |
| CMJ — phase concentric | `cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_conc_displacement`, `cmj_propulsion_eff`, `cmj_peak_vel` | Force/vitesse/rythme/amplitude de la phase de poussée | Exécution de la phase propulsive elle-même | Anomalie directement dans la phase où la puissance est produite | 🟢 / 🟠 |
| CMJ — phase flight | `cmj_ft_ct_ratio` | Rapport temps de vol / temps de contact | Résultat global du mouvement | Reflète une performance de saut réduite sans préciser la cause en amont | 🟢 / 🟠 |
| CMJ — phase landing | `cmj_landing_rfd`, `cmj_landing_mean_power` | RFD et puissance moyenne à l'atterrissage | Contrôle de la phase post-propulsive | Postérieure à la production de puissance — lien avec la stratégie d'exécution **du saut dans son ensemble**, pas avec la phase propulsive spécifiquement | 🟢 mesure / 🟠 mécanisme, le plus faible du lot (déjà signalé, `INTERPRETATION_VARIABLES_PUISSANCE.md` §3.5) |
| SLCMJ — équivalents unilatéraux | `slcmj_rsi_mod`, `slcmj_peak_conc_force`, `slcmj_peak_conc_vel`, `slcmj_edrfd_bm`, `slcmj_braking_rfd`, `slcmj_peak_braking_force`, `slcmj_braking_impulse`, `slcmj_depth`, `slcmj_contraction_time`, `slcmj_ecc_duration`, `slcmj_conc_duration`, `slcmj_peak_landing_force`, `slcmj_landing_impulse`, `slcmj_time_to_stab` | idem, version unilatérale | idem | idem | 🟢 mesure / 🟠 mécanisme, regroupement de phase lui-même 🟠 (pas de métadonnée de phase équivalente à celle du CMJ, `INTERPRETATION_VARIABLES_PUISSANCE.md` §3.6) |

**29 variables au total**, exactement celles déjà listées comme "explicatives biomécaniques" de
`HYP-PUI-01`.

### Ce que ces variables permettent réellement de dire — distinction demandée explicitement

**"Les capacités sont disponibles mais leur expression mécanique est inefficiente"** — c'est
l'affirmation **forte**, celle que la Branche B est censée soutenir. Elle suppose de savoir, en plus
de l'anomalie biomécanique elle-même, que les capacités physiologiques (Branche A) sont par ailleurs
suffisantes. **Aucune variable de la Branche B ne peut établir cela à elle seule** — une anomalie
biomécanique ne dit rien, en soi, sur l'état des capacités physiologiques sous-jacentes.

**"La stratégie est atypique"** — c'est l'affirmation **faible**, celle que les variables de la
Branche B permettent réellement d'établir directement : une valeur hors norme sur une variable de
phase (freinage, propulsion, atterrissage) signale une exécution différente de la référence, sans
préjuger de sa cause.

🟢 Ces deux conclusions **ne doivent pas être confondues**, conformément à la consigne. La première
(inefficience malgré des capacités préservées) nécessite une information supplémentaire — l'état de
la Branche A — traitée en §5.

---

## 4. Condition pour retenir « Déficit de capacité »

```
PUISSANCE ↓
+
preuve(s) physiologique(s) déficitaire(s) (Branche A)
→ profil compatible avec DÉFICIT DE CAPACITÉ
```

**Ce qui est déjà explicitement supporté** 🟢 :
- Qu'une variable physiologique déficitaire (n'importe laquelle des 34 de la Branche A) puisse faire
  progresser le support de `HYP-PUI-01` (`KINEXUS_REASONING_ENGINE_V1.md` §2-§3, transition
  Modérée→Forte via l'explicative physiologique).
- Que cette catégorie soit distincte, dans la source, de la catégorie biomécanique.

**Ce qui nécessite une nouvelle règle** 🔴 :
- **Le nombre ou la nature des preuves physiologiques déficitaires nécessaires** pour qualifier le
  profil de "compatible avec un déficit de capacité" au niveau de la branche (une seule variable sur
  34 suffit-elle ? faut-il une convergence entre plusieurs sous-familles — magnitude **et** RFD, ou
  plusieurs tests segmentaires ?). **Aucun nombre n'est proposé ici** — la mission demande
  explicitement de ne pas l'inventer.
- **Le statut d'une seule variable segmentaire isolée** (ex. `hip_ext_n` seule déficitaire parmi les
  34) comme preuve suffisante de "déficit de capacité" à l'échelle de la qualité entière, plutôt que
  comme un signal local — non tranché par les sources.

**Ce qui ne peut pas être déterminé actuellement** :
- Si un profil avec une seule variable physiologique déficitaire et 33 normales doit être traité
  identiquement à un profil avec plusieurs variables physiologiques déficitaires — NON DOCUMENTÉ, la
  granularité de preuve à l'intérieur même de la Branche A n'est pas spécifiée par les sources
  au-delà du principe général "cumulable, non substituable" (`KINEXUS_REASONING_ENGINE_V1.md` §3).

---

## 5. Condition pour retenir « Problème de stratégie d'exécution »

```
PUISSANCE ↓
+
variable(s) biomécanique(s) anormale(s) (Branche B)
+
capacités physiologiques suffisamment conservées
→ profil compatible avec PROBLÈME DE STRATÉGIE D'EXÉCUTION
```

### Analyse de « capacités physiologiques suffisamment conservées »

C'est, comme signalé explicitement par la mission, une condition **potentiellement nouvelle** — elle
n'est formulée nulle part dans les sources consultées pour Puissance. Analyse de ce qu'elle pourrait
signifier avec les variables et statuts déjà existants, **sans inventer de seuil numérique** :

**Ce qui est déjà disponible pour la construire** 🟢 : chaque variable de la Branche A possède déjà
un statut catégoriel (normal/déficitaire/indisponible) calculé en amont du moteur HYP### — c'est le
même mécanisme catégoriel que celui utilisé pour toute autre variable diagnostique/confirmative/
explicative (`applyThr` et équivalents, déjà utilisés partout ailleurs dans le moteur). Aucun nouveau
mode de calcul n'est nécessaire pour obtenir, pour chaque variable de la Branche A, un statut
"normal" ou "déficitaire" déjà existant.

**Ce qui nécessite une nouvelle règle** 🔴 : transformer 34 statuts individuels en une seule
conclusion "conservées" nécessite une règle d'agrégation qui n'existe pas — combien de variables
normales sur 34 suffisent ? Toutes ? Une majorité ? Uniquement celles effectivement testées ? Aucun
seuil n'est proposé ici, conformément à la consigne.

**Point de rigueur essentiel, à ne pas manquer** 🟠 : "suffisamment conservées" ne peut être évalué
que sur les variables **effectivement testées**. Une variable physiologique **non testée**
(statut "indisponible", pas "normal") ne peut pas être comptée comme une preuve de conservation —
l'absence de preuve de déficit n'est pas une preuve de capacité préservée. Si peu ou aucune variable
de la Branche A n'a été testée, la condition "capacités suffisamment conservées" ne peut **pas** être
affirmée, même en l'absence de tout déficit physiologique observé — le profil correct dans ce cas est
**NON DISCRIMINABLE**, pas "stratégie par défaut" (voir §7-§8).

**Ce qui ne peut pas être déterminé actuellement** :
- Le nombre minimal de variables de la Branche A devant être testées pour que la condition
  "conservées" soit seulement évaluable (indépendamment du seuil de normalité lui-même) — NON
  DOCUMENTÉ.

---

## 6. Cas mixtes

```
PUISSANCE ↓
+
CAPACITÉ ↓ (Branche A)
+
STRATÉGIE ANORMALE (Branche B)
```

**Question posée** : le moteur doit-il produire "déficit de capacité" **et** "problème de stratégie"
simultanément ?

**Réponse honnête, sans hiérarchisation inventée** :

Le moteur peut aujourd'hui, **sans règle nouvelle**, présenter les deux constats **côte à côte**
(**CAUSES MULTIPLES**) — c'est le comportement déjà permis par le principe "cumulable, non
substituable" entre catégories explicatives (`KINEXUS_REASONING_ENGINE_V1.md` §3), déjà identifié
comme la seule option non-inventée pour les profils mixtes dans `ORIENTATIONS_PUISSANCE_V2.md` (§5,
Branche 5) et `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` (§6, Option 2).

**Mais un point plus profond doit être signalé, plutôt que masqué par ce constat rassurant** :
présenter "deux causes" **présuppose qu'elles sont indépendantes**. Rien dans les sources ne permet
d'établir cette indépendance. Une anomalie biomécanique de la Branche B, en présence d'un déficit de
capacité avéré dans la Branche A, pourrait être :
- une **cause véritablement indépendante** (un problème technique qui existerait même avec une force
  normale), ou
- une **conséquence** du déficit de force (le mouvement s'exécute différemment *parce que* la force
  manque), ou
- une **compensation** (une stratégie adaptée délibérément pour pallier le manque de force).

🔴 **Aucune donnée du modèle actuel ne permet de trancher entre ces trois lectures.** Le modèle HYP###
V1 n'a pas de dimension temporelle ni de mécanisme d'inférence causale au-delà de la convergence de
preuves (`KINEXUS_REASONING_ENGINE_V1.md`, non rouvert ici) — il peut dire que les deux catégories
sont *statistiquement* déficitaires/anormales en même temps, jamais laquelle *cause* l'autre.

**Proposition de structure, à valider** :
- **CAUSES MULTIPLES (présentation à plat)** — ce que le moteur peut faire aujourd'hui sans règle
  nouvelle : lister Capacité et Stratégie comme deux constats coexistants, sans lien de causalité
  affirmé entre eux. 🟢 déjà permis par l'architecture.
- **CAUSE UNIQUE** — non supporté, nécessiterait une règle de priorisation absente des sources. 🔴 si
  proposé, mais ce document ne le recommande pas.
- **PROFIL NON DISCRIMINABLE (au sens causal)** — la lecture la plus honnête du cas mixte tel que
  décrit : le moteur peut constater la coexistence, mais ne peut pas dire si la stratégie anormale
  est cause, conséquence ou compensation du déficit de capacité. Ce n'est pas une limite technique
  temporaire — c'est une limite structurelle du modèle de données actuel (absence de toute donnée
  permettant d'établir une antériorité ou une relation causale entre catégories de preuve). 🟢 constat
  honnête, pas une inférence.

**Ce document recommande** de ne **pas** confondre "présenter les deux constats" (déjà possible,
sans invention) avec "affirmer une relation causale entre eux" (non discriminable, quelle que soit la
règle qu'on ajouterait) — les deux questions sont indépendantes et ne doivent pas être résolues comme
une seule.

---

## 7. Cas non discriminables — identification explicite

Situations où les données actuelles ne permettent pas de distinguer Capacité et Stratégie, ou de
qualifier leur relation :

1. **Capacités non testées, stratégie anormale** — comme détaillé en §5 : sans test des variables de
   la Branche A, "capacités conservées" ne peut pas être affirmé. Le profil n'est ni "capacité" ni
   "stratégie" de façon fiable — **NON DISCRIMINABLE AVEC LES DONNÉES ACTUELLES**.
2. **Capacité déficitaire ET stratégie anormale simultanément** (§6) — la coexistence est
   observable, mais la relation causale entre les deux (cause / conséquence / compensation) ne l'est
   pas — **NON DISCRIMINABLE AVEC LES DONNÉES ACTUELLES** au niveau causal, même si la coexistence
   elle-même peut être rapportée factuellement.
3. **Une seule variable physiologique déficitaire, parmi 34, sans confirmation ni convergence
   supplémentaire** — le statut de cette variable isolée comme preuve suffisante d'un "déficit de
   capacité" à l'échelle de la qualité n'est pas tranché (§4) — **NON DISCRIMINABLE** tant qu'une
   règle de nombre/convergence n'est pas validée par le praticien.
4. **Variables biomécaniques anormales dans une seule phase du mouvement** (ex. uniquement en phase
   d'atterrissage) — leur pertinence pour expliquer spécifiquement la phase de production de
   puissance (concentrique/propulsive) plutôt qu'une autre partie du mouvement n'est pas établie
   (`INTERPRETATION_VARIABLES_PUISSANCE.md` §3.5, déjà signalé pour les variables de landing) —
   **NON DISCRIMINABLE** entre "stratégie de production de puissance" et "stratégie d'atterrissage
   sans lien direct avec la puissance elle-même".

Aucune conclusion n'est forcée dans ces quatre situations.

---

## 8. Analyse des `CLI###` existants (sans modification)

| `CLI###` | Peut déjà servir à... | Trop général pour... | Séparation future potentielle |
|---|---|---|---|
| `CLI040` (*"Augmenter la puissance maximale"*) | Servir de base commune aux deux branches — c'est la seule orientation aujourd'hui déclenchée que la cause soit Capacité, Stratégie, ou les deux | Distinguer Capacité de Stratégie — son texte ne varie jamais selon le mécanisme (`ORIENTATIONS_PUISSANCE_V2.md` §1) | 🔴 candidate à une déclinaison en deux variantes (une orientée capacité, une orientée stratégie) — non créée ici |
| `CLI041` (*"Augmenter la puissance relative"*) | Rester inchangée — dimension orthogonale (absolu/relatif), pas liée à Capacité/Stratégie | Servir de base à cette distinction — ne la couvre pas du tout | Aucune — dimension indépendante, pas concernée par cette mission |

**Constat, sans modification proposée** : aucun `CLI###` existant ne sépare aujourd'hui Capacité et
Stratégie pour Puissance. `CLI040` est **trop général** pour cette distinction, exactement comme déjà
établi dans `ORIENTATIONS_PUISSANCE_V2.md`. Une évolution future pourrait décliner `CLI040` en deux
variantes — non actée ici, seulement documentée comme piste (🔴), conformément à la consigne "ne pas
modifier les `CLI###` dans cette mission."

---

## 9. Profils synthétiques

*Rappel : profils synthétiques, aucun patient réel.*

### Profil 1 — Puissance ↓ + capacité ↓ + biomécanique normale
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : `imtp_n`↓ (Branche A) ; toutes les variables de Branche B normales.
- **Branche** : Capacité.
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : profil compatible avec un déficit de capacité — la seule
  catégorie explicative convergente est physiologique.
- **Ce qu'il ne peut pas conclure** : le nombre de variables physiologiques déficitaires nécessaire
  pour que cette conclusion soit "forte" plutôt que "compatible" (§4, 🔴).

### Profil 2 — Puissance ↓ + capacité conservée + stratégie anormale
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : les 34 variables de Branche A testées et normales ; `cmj_depth`,
  `cmj_conc_rfd` anormaux (Branche B).
- **Branche** : Stratégie.
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : profil compatible avec un problème de stratégie d'exécution —
  condition "capacités suffisamment conservées" satisfaite au sens le plus strict (toutes testées,
  toutes normales).
- **Ce qu'il ne peut pas conclure** : si un sous-ensemble plus restreint de variables testées
  normales (pas la totalité) suffirait également — règle d'agrégation non définie (§5, 🔴).

### Profil 3 — Puissance ↓ + capacité ↓ + stratégie anormale
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : `slimtp_n`↓ (Branche A) ; `cmj_braking_eff` anormal (Branche B).
- **Branche** : Mixte.
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : coexistence factuelle des deux catégories de preuve (causes
  multiples, présentation à plat déjà permise, §6).
- **Ce qu'il ne peut pas conclure** : si la stratégie anormale est une cause indépendante, une
  conséquence, ou une compensation du déficit de capacité — **NON DISCRIMINABLE AVEC LES DONNÉES
  ACTUELLES** (§6-§7, point 2).

### Profil 4 — Puissance ↓ + force ↓
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : `imtp_n`/`imtp_nkg`↓ (magnitude, sous-famille de Branche A), RFD non testée ou
  normale, biomécanique normale.
- **Branche** : Capacité.
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : profil compatible avec un déficit de capacité — sans
  distinction interne magnitude/RFD (non hiérarchisée, §2).
- **Ce qu'il ne peut pas conclure** : rien de plus fin sur la nature du déficit de capacité
  (magnitude vs vitesse de production) — hors périmètre de cette mission, déjà signalé dans
  `ORIENTATIONS_PUISSANCE_V2.md`.

### Profil 5 — Puissance ↓ + RFD ↓ avec force conservée
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : `imtp_rfd100`↓ (RFD, sous-famille de Branche A) ; `imtp_n`/`imtp_nkg` normaux ;
  biomécanique normale.
- **Branche** : Capacité (toujours — la mission ne demande pas de sous-distinguer Force/RFD dans
  cette évolution).
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : profil compatible avec un déficit de capacité, spécifiquement
  sur la composante vitesse de production de force — reste dans la Branche A, sans que cela nécessite
  une branche supplémentaire pour ce document.
- **Ce qu'il ne peut pas conclure** : si ce sous-profil (RFD isolé, magnitude normale) mérite un
  traitement distinct de la Branche A générale — question laissée ouverte, hors périmètre (renvoi à
  `ORIENTATIONS_PUISSANCE_V2.md`).

### Profil 6 — Puissance ↓ + variables physiologiques conservées + stratégie biomécanique anormale
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : ensemble de la Branche A testé et normal ; plusieurs variables de Branche B
  anormales (`cmj_conc_mean_force`, `cmj_propulsion_eff`, `slcmj_peak_conc_force`).
- **Branche** : Stratégie.
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : profil compatible avec un problème de stratégie d'exécution,
  avec plusieurs signaux biomécaniques convergents en phase concentrique (bilatéral et unilatéral).
- **Ce qu'il ne peut pas conclure** : lequel de ces signaux biomécaniques est le plus déterminant —
  non discriminable entre eux (déjà établi, `INTERPRETATION_VARIABLES_PUISSANCE.md` §4).

### Profil 7 — Puissance ↓ + plusieurs mécanismes physiologiques déficitaires
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : `imtp_n`↓, `imtp_rfd100`↓, `profil_fv_nkg`↓ (magnitude, RFD et profil F-V
  simultanément déficitaires, tous en Branche A) ; biomécanique normale.
- **Branche** : Capacité (avec convergence interne forte).
- **Orientation actuelle** : `CLI040`.
- **Ce que Kinexus peut conclure** : profil compatible avec un déficit de capacité, avec une
  convergence plus large que le Profil 1 (plusieurs sous-familles physiologiques déficitaires plutôt
  qu'une seule).
- **Ce qu'il ne peut pas conclure** : si cette convergence plus large doit se traduire par un niveau
  de confiance différent dans la conclusion "capacité" par rapport au Profil 1 — pas de règle de
  pondération entre sous-familles (§4, 🔴).

### Profil 8 — Puissance ↓ + données insuffisantes pour discriminer capacité/stratégie
- **Diagnostic** : `cmj_peak_power`↓ + `slcmj_peak_power`↓.
- **Mécanismes** : aucune variable de Branche A testée (tests IMTP/SLIMTP/segmentaires/profil F-V
  non réalisés) ; aucune variable de Branche B testée non plus, ou testée sans anomalie franche.
- **Branche** : Non discriminable.
- **Orientation actuelle** : `CLI040`, déclenchée quand même (le diagnostic suffit, indépendamment du
  support — ADR-004).
- **Ce que Kinexus peut conclure** : Puissance est déficitaire.
- **Ce qu'il ne peut pas conclure** : ni Capacité, ni Stratégie — **NON DISCRIMINABLE AVEC LES
  DONNÉES ACTUELLES**, cas déjà nommé "signal isolé" dans `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §5
  (Profil 5), ici reformulé du point de vue Capacité/Stratégie plutôt que du point de vue mécanisme
  générique.

---

## 10. Tableaux finaux

### Tableau 1 — Profils

| Profil | Puissance | Capacité physiologique | Stratégie | Conclusion HYP | Orientation | Preuve |
|---|---|---|---|---|---|---|
| 1 | ↓ | ↓ | normale | Capacité | `CLI040` | 🟢 coexistence / 🔴 seuil de convergence |
| 2 | ↓ | conservée (testée, normale) | anormale | Stratégie | `CLI040` | 🟢 coexistence / 🔴 règle d'agrégation "conservée" |
| 3 | ↓ | ↓ | anormale | Mixte — causal non discriminable | `CLI040` | 🟢 coexistence / 🔴 lien causal non établissable |
| 4 | ↓ | ↓ (magnitude) | normale | Capacité | `CLI040` | 🟢 / 🔴 |
| 5 | ↓ | ↓ (RFD) | normale | Capacité | `CLI040` | 🟢 / 🔴 |
| 6 | ↓ | conservée | ↓ (plusieurs) | Stratégie | `CLI040` | 🟢 / 🔴 |
| 7 | ↓ | ↓ (plusieurs sous-familles) | normale | Capacité (convergence large) | `CLI040` | 🟢 / 🔴 |
| 8 | ↓ | non testée | non testée/normale | Non discriminable | `CLI040` | 🟢 constat honnête |

### Tableau 2 — Variables

| Variable | Branche | Rôle | Interprétation | Condition nécessaire | Statut |
|---|---|---|---|---|---|
| `imtp_n`/`nkg`, `slimtp_n`/`nkg`, 11×`_n`/`_nkg` segmentaires | Capacité | Explicative physiologique | Force (magnitude) insuffisante | Testée + statut déficitaire | 🟢 appartenance / 🟠 interprétation |
| `imtp_rfd100`/`rfd200`, `slimtp_rfd100`/`rfd200` | Capacité | Explicative physiologique | Vitesse de production de force insuffisante | idem | 🟢 / 🟠 |
| `imtp_ttpf`, `slimtp_ttpf` | Capacité | Explicative physiologique | Délai anormalement long | idem | 🟢 / 🟠 |
| `profil_fv_nkg`, `profil_fv_v0` | Capacité | Explicative physiologique | Composante force/vitesse théorique insuffisante | idem | 🟢 / 🟠 |
| 15 KPI stratégie CMJ | Stratégie | Explicative biomécanique | Exécution non optimale d'une phase du mouvement | Testée + statut anormal | 🟢 appartenance / 🟠 interprétation |
| 14 KPI stratégie SLCMJ | Stratégie | Explicative biomécanique | idem, unilatéral | idem | 🟢 / 🟠 |
| Toute variable de Capacité **non testée** | — | — | Ne peut pas servir à affirmer "capacités conservées" | Absence de test ≠ normalité | 🟢 constat logique |

---

## 11. Décision

### Ce que nous pouvons acter dès maintenant

- 🟢 La distinction Capacité/Stratégie **repose sur un matériau déjà existant et validé** : la
  séparation entre variables explicatives physiologiques et biomécaniques est déjà nommée
  séparément dans la fiche source de `HYP-PUI-01`.
- 🟢 Les deux listes de variables (34 pour Capacité, 29 pour Stratégie) sont **complètes et
  définitives** — aucune variable supplémentaire n'est nécessaire pour instancier cette distinction
  au niveau conceptuel.
- 🟢 Force et RFD ne sont **pas hiérarchisées** à l'intérieur de la Branche Capacité — décision
  cohérente avec l'absence de fondement source pour une telle hiérarchie, et avec le périmètre
  resserré de cette mission.
- 🟢 Un profil biomécanique anormal **ne peut jamais, à lui seul**, être transformé en preuve
  automatique d'un problème de stratégie — il faut, en plus, que les capacités physiologiques
  **testées** soient normales. Une variable physiologique basse **ne peut jamais, à elle seule**,
  être transformée en preuve automatique d'une cause unique — les cas mixtes restent mixtes,
  jamais arbitrairement simplifiés.
- 🟢 Pour les profils mixtes, la coexistence des deux catégories peut être rapportée factuellement
  (causes multiples, à plat) — mais **jamais** comme une relation causale entre elles.

### Ce qui nécessite encore une validation clinique

- 🔴 Le nombre/la nature des variables physiologiques déficitaires nécessaires pour qualifier un
  profil "compatible avec un déficit de capacité" (§4).
- 🔴 La règle d'agrégation permettant de dire que les capacités sont "suffisamment conservées"
  (combien de variables testées, combien doivent être normales) (§5).
- 🔴 La modalité de présentation des profils mixtes (liste à plat validée en principe, mais format
  exact non spécifié) (§6).
- 🔴 L'opportunité, dans une évolution future, de décliner `CLI040` en deux variantes
  (Capacité/Stratégie) — non actée, seulement documentée comme piste (§8).

### Ce qui n'est pas discriminable avec les données actuelles

- 🔴/🟢 La relation causale entre un déficit de capacité et une anomalie biomécanique coexistants —
  cause indépendante, conséquence, ou compensation — **structurellement non déterminable** par le
  modèle de données actuel, indépendamment de toute règle future de comptage ou de seuil.
- 🔴/🟢 Le statut "conservé" des capacités physiologiques lorsque leurs variables ne sont **pas
  testées** — l'absence de déficit observé n'équivaut jamais à une preuve de conservation.
- 🔴/🟢 Le profil "signal isolé" (Profil 8) — Puissance déficitaire sans aucune donnée exploitable
  dans l'une ou l'autre branche — reste, comme déjà établi dans les documents antérieurs, hors de
  portée de toute granularité d'orientation, quelle qu'elle soit.

# Audit — Profil Absorbeur (code existant) vs HYP-ABS-01 V2

**Statut** : audit uniquement. Aucun code modifié — vérifié (`git status` propre après lecture).
Aucune modification de `index.html`/`TFM`/`computeMoteur()`/`computeAsymEngine`/`functionScores`/UI/
rapports/Historique/ExpertView. TTS reste dans Stabilisation, non réintroduit dans Absorption.

**Méthode** : lecture directe et complète du bloc "BIOMECHANICAL PROFILE ENGINE" (`index.html:1808`
à `2030` environ) et de ses dépendances (`effectiveBiomecaBands`, `BIOMECA_DEFAULT_BANDS`,
`computeMouvementAnalysis`), pas seulement les lignes déjà repérées dans `GAP_ANALYSIS_HYP_ABS_V2.md`.

---

## 1. Cartographie complète du Profil Absorbeur

**Définition exacte** (`index.html:1987-1997`) :

```js
BiomechanicalProfileDefinition('absorbeur','Absorbeur',
  'Est-ce que l\'athlète absorbe efficacement les contraintes ?',
  [ // discriminantes
    ProfileVariable('cmj:force_zero_vel','discriminante'),
    ProfileVariable('cmj:braking_rfd','discriminante'), // EDRFD
    ProfileVariable('cmj:landing_peak_force','discriminante'),
    ProfileVariable('cmj:landing_impulse','discriminante')
  ],
  [ // confirmatoires
    ProfileVariable('cmj:ecc_mean_power','confirmatoire'),
    ProfileVariable('cmj:time_to_stab','confirmatoire')
  ],
  [ // descriptives
    ProfileVariable('cmj:landing_duration','descriptive')
  ]
)
```

| Variable | Utilisation actuelle | Rôle dans Profil Absorbeur | Correspondance HYP-ABS V2 |
|---|---|---|---|
| `cmj_force_zero_vel` | Percentile pondéré (poids 1) | Discriminante | Core (§2) |
| `cmj_braking_rfd` | Percentile pondéré (poids 1) | Discriminante | Core (§3) |
| `cmj_landing_peak_force` | Percentile pondéré (poids 1) | Discriminante | ❓ Non nommée dans V2 — variable CMJ distincte de `sllt`/`landing_bi`/`dj`/`sldj_peak_landing_force` (§8 audit précédent) |
| `cmj_landing_impulse` | Percentile pondéré (poids 1) | Discriminante | Confirmative en V1/V2 (rôle différent) |
| `cmj_ecc_mean_power` | Percentile pondéré (poids 0.5) | Confirmatoire | Explicative en V2 (B), diagnostique en V1 |
| `cmj_time_to_stab` | Percentile pondéré (poids 0.5) | Confirmatoire | Non mentionnée en V1/V2 (§8) |
| `cmj_landing_duration` | Poids 0 (n'influence jamais le score) | Descriptive, affichage seul | Non mentionnée en V1/V2 |
| `cmj_braking_impulse` | **Absente du Profil Absorbeur** | — | Core en V1/V2 |
| `cmj_ecc_peak_vel` | **Absente du Profil Absorbeur** | — | Explicative en V2, diagnostique en V1 |

### Fonctions appelées, dans l'ordre d'exécution réel

1. `resolveProfilePercentiles(definition, valuesByTest, pop, age)` (`index.html:1946-1958`) — pour
   chaque variable, `validateTechnical()` (validité de la donnée brute), puis
   `normPercentile(testKey,kpiKey,pop,age,raw,dir)` — **calcul de percentile continu 0-100 par
   rapport à une population normative**, pas un statut catégoriel vert/jaune/orange/rouge.
2. `BiomechanicalProfileEngine.compute(definition, percentiles)` (`index.html:1891-1934`) :
   - Filtre les variables discriminantes disponibles ; si le ratio disponible/total est sous
     `effectiveMissingDataThreshold()`, retourne `sufficient:false` avec un message explicite.
   - Sinon, calcule un **percentile global** = moyenne pondérée par rôle (discriminante=1,
     confirmatoire=0.5, descriptive=0, poids configurables).
   - Calcule une **cohérence interne** = écart-type (`stdDevOf()`) des percentiles des variables
     discriminantes disponibles.
   - Classe les deux résultats via `classifyBand(effectiveBiomecaBands('niveauAbsolu'), ...)` et
     `classifyBand(effectiveBiomecaBands('coherenceInterne'), ...)`.
   - Identifie les "variables fortes" (percentile ≥60) et "variables faibles" (<40).
   - Génère un **texte automatique** (`buildConclusion`) — ex. *"Le profil 'Absorbeur' est élevé
     (73e percentile, niveau 'Excellent'), avec une cohérence interne 'Bonne'. Variable(s)
     faible(s) : cmj:landing_impulse (32e percentile)."*
3. `computeAllBiomechanicalProfiles()` (`index.html:2025-2030`) calcule les 5 profils (Propulsif,
   Absorbeur, Réactif, Explosif, Contrôle) pour un athlète.
4. Consommé par `computeMouvementAnalysis()` (`index.html:3345-3374`, déjà cartographié) — 
   `profileResults` alimente `computeSignatureBiomecanique`, `computeMoteurRaisonnementBiomecanique`,
   `computePriorisationClinique`, `computeConfianceKinexus`, `explicationConclusionPhase`,
   `computeMoteurAlerte` — **une chaîne de consommation réelle et déjà en production** (commentaire
   du code lui-même, ligne 3369 : *"MouvementView déjà en production"*).

### Seuils utilisés

`BIOMECA_DEFAULT_BANDS.niveauAbsolu` (`index.html:816-826`) — bandes de percentile :
`Exceptionnel [95-100]` / `Excellent [90-95[` / `Très bon [75-90[` / `Dans les normes [40-75[` /
`À surveiller [25-40[` / `Déficitaire [10-25[` / `Déficit majeur [-1-10[`.

**Provenance explicitement documentée dans le code lui-même** (`index.html:811-814`) : *"AUCUNE de
ces bandes n'est une donnée VALD ni un seuil validé par la littérature — ce sont des valeurs Kinexus
par défaut, un point de départ raisonnable, entièrement modifiables via la Configuration
clinique."* Ce ne sont **pas** des seuils cliniques Vierge_7, contrairement aux conditions `CLI060`
de `HYP-ABS-01`.

---

## 2. `cmj_force_zero_vel`

- **Définition** : `valdName` VALD *"Force at Zero Velocity"* (`index.html:189`), KPI `force_zero_vel`
  du test `cmj` (`index.html:117`), unité N/kg, `dir:max`.
- **Seuil** : aucun seuil catégoriel fixe (`THRESHOLDS`) trouvé pour cette variable dans cette
  mission — sa classification passe exclusivement par le système de percentiles normatifs
  (`normPercentile`), cohérent avec les tables `NORMS` déjà repérées dans les missions précédentes
  (ex. `bball2425_ncaa_m.cmj_force_zero_vel`).
- **Calcul** : `resolveProfilePercentiles` → `normPercentile('cmj','force_zero_vel',pop,age,raw,'max')`.
- **Utilisation dans le Profil Absorbeur** : discriminante, poids 1 (le maximum).
- **Utilisation ailleurs** : uniquement le Profil Absorbeur, confirmé — aucune autre occurrence de
  `force_zero_vel` trouvée en dehors de `CMJ_VAR_META`, `TESTS`, `NORMS`, et cette définition de
  profil.

**Correspondance avec "FORCE AT ZERO VELOCITY" de V2** : ✅ **SOURCE CODE DIRECTE**. Nom, unité et
direction identiques. Aucune nouvelle variable à créer.

---

## 3. `cmj_braking_rfd`

- **Définition** : `valdName` *"Eccentric Deceleration RFD / BM (EDRFD)"* (`index.html:190`), KPI
  `braking_rfd` du test `cmj`, unité N/kg/s, `dir:max`. Le commentaire du code lui-même
  (`// EDRFD`, `index.html:1989`) confirme cette identification, **écrite par les développeurs du
  Profil Absorbeur eux-mêmes**, indépendamment de HYP.
- **Seuil** : percentile normatif, pas de seuil catégoriel fixe trouvé.
- **Calcul** : idem §2.
- **Utilisation dans le Profil Absorbeur** : discriminante, poids 1.
- **Utilisation ailleurs** : `computeTestStatus('cmj',...)` (agrégation TFM non différenciée, déjà
  documentée dans `GAP_ANALYSIS_HYP_ABS_V2.md`) ; aucune autre occurrence spécifique trouvée.

**Correspondance avec "ECCENTRIC DECELERATION RFD / BM"** : ✅ **SOURCE CODE DIRECTE**, la plus
solide des trois — nommage VALD et commentaire du code convergent tous deux, indépendamment l'un de
l'autre.

---

## 4. `cmj_braking_impulse`

- **Existe réellement** : ✅ oui — `valdName` *"Eccentric Deceleration Impulse"*, KPI
  `braking_impulse` du test `cmj` (`index.html:191`), unité Ns/kg (`dir:max`).
- **Où calculée** : import CSV ForceDecks, comme tout KPI CMJ — non re-vérifié en détail dans cette
  mission (hors périmètre, déjà établi ailleurs).
- **Où utilisée** : `computeTestStatus('cmj',...)` uniquement (TFM, non différencié).
- **A-t-elle déjà des seuils ?** Aucun seuil catégoriel fixe trouvé, et **aucune table `NORMS`
  contenant `cmj_braking_impulse` n'a été repérée** dans cette mission (contrairement à
  `cmj_braking_rfd`/`cmj_ecc_peak_vel`/`cmj_force_zero_vel`, qui apparaissent dans les tables
  normatives déjà vues en mission précédente) — à vérifier plus précisément avant toute
  implémentation, non fait exhaustivement ici.
- **Déjà utilisée dans le Profil Absorbeur ?** ❌ **Non — absente de sa définition**, vérifié
  explicitement en relisant l'intégralité du bloc.
- **Diagnostique/explicative ailleurs ?** Non trouvée dans les autres profils biomécaniques
  (Propulsif, Réactif, Explosif, Contrôle) non plus.

**Conséquence pour V2** : `cmj_braking_impulse` reste une variable Core de `HYP-ABS-01 V2` **sans
équivalent réutilisable côté Profil Absorbeur** — contrairement à `force_zero_vel` et `braking_rfd`,
son intégration nécessiterait de calculer son percentile/statut indépendamment, avec les primitives
existantes (`normPercentile`/`applyThr`), mais sans profiter d'une définition de profil déjà
construite.

---

## 5. Comparaison Core HYP-ABS V2 vs Profil Absorbeur

| Élément | Profil Absorbeur | HYP-ABS V2 | Compatible ? |
|---|---|---|---|
| `cmj_force_zero_vel` | Discriminante (poids 1) | Diagnostique Core | ✅ Compatible en substance |
| `cmj_braking_rfd` | Discriminante (poids 1) | Diagnostique Core | ✅ Compatible en substance |
| `cmj_braking_impulse` | **Absente** | Diagnostique Core | ⚠️ Pas de socle existant, à construire |
| `cmj_landing_peak_force`/`landing_impulse` | Discriminantes | Non nommées Core, rôle E (Réception) | ⚠️ Périmètre différent — le Profil Absorbeur les traite comme cœur du profil, HYP V2 les traite comme un sous-domaine séparé |
| `cmj_ecc_mean_power` | Confirmatoire (poids 0.5) | Explicative (B) | ✅ Compatible en substance |
| `cmj_time_to_stab` | Confirmatoire (poids 0.5) | Non mentionnée | ⚠️ Écart de périmètre, §8 |
| **Nature du résultat** | Percentile continu 0-100 + cohérence interne + texte narratif | État discret (Absente/Suspectée/Retenue-Faible/Modérée/Forte) | ❌ **Logiques incompatibles telles quelles** |
| **Seuils** | Bandes de percentile, non cliniques, configurables (`BIOMECA_DEFAULT_BANDS`) | `CLI060` : "2 preuves diagnostiques déficitaires", clinique, Vierge_7 | ❌ Natures différentes, non interchangeables |
| **Rôle des asymétries** | Peuvent être **discriminantes** d'un profil (ex. `cmj:ecc_decel_rfd_asym` pour "Contrôle", `index.html:2015`) | Jamais génératrices, uniquement modificateur/précision | ❌ Principe différent — signalé, pas une erreur du Profil Absorbeur (architecture antérieure et distincte) |

### A. Variables communes
`cmj_force_zero_vel`, `cmj_braking_rfd`, `cmj_ecc_mean_power`.

### B. Variables uniquement HYP (V2)
`cmj_braking_impulse`, `cmj_ecc_peak_vel` (absentes du Profil Absorbeur).

### C. Variables uniquement Profil Absorbeur
`cmj_landing_peak_force`, `cmj_landing_impulse` (discriminantes du profil, rôle E/confirmative en
HYP), `cmj_time_to_stab` (confirmatoire du profil, non mentionnée en HYP), `cmj_landing_duration`
(descriptive, jamais scorée, non mentionnée en HYP).

### D. Différences de seuils
Percentile continu configurable (Profil Absorbeur) vs seuil catégoriel clinique `CLI060` (HYP) — pas
directement transposables l'un dans l'autre sans décision explicite.

### E. Différences de logique
Moyenne pondérée continue (Profil Absorbeur) vs machine à états par convergence de preuves
discrètes (HYP). Le Profil Absorbeur ne connaît pas la notion de preuve "diagnostique vs
confirmative vs explicative" au sens HYP — sa hiérarchie (discriminante/confirmatoire/descriptive)
est un système de **pondération**, pas de **catégories de preuve distinctes gouvernant des
transitions d'état**.

### F. Différences de finalité
Profil Absorbeur : caractériser la position d'un athlète par rapport à une population normative, sur
un mécanisme biomécanique donné — une lecture "où en est cet athlète ?". HYP-ABS-01 : établir si un
déficit clinique existe et pourquoi — une lecture "y a-t-il un problème, et par quel mécanisme ?".
Ce sont deux questions différentes, pas deux implémentations de la même question.

---

## 6. Point critique — ne pas dupliquer la logique

**Verdict, fondé sur le code lu, pas décidé arbitrairement** : le Profil Absorbeur **ne doit pas**
devenir automatiquement le calcul de `HYP-ABS-01 V2`, et HYP-ABS-01 V2 **ne doit pas** recopier la
logique de pondération continue du Profil Absorbeur. Les deux répondent à des questions différentes
(§5.F) avec des mécaniques différentes (§5.E).

**L'architecture correcte, d'après ce qui existe** :

```
Profil Absorbeur existant (calculs de percentile déjà faits, réutilisables)
   ↓ (source de VALEURS/PERCENTILES, pas de VERDICT)
HYP-ABS-01 V2 (nouvelle couche de raisonnement clinique, catégorielle, à construire)
   ↓
diagnostic global → sous-domaines → explications
```

**Ce qui peut réellement être réutilisé n'est pas le "profil" lui-même (le percentile composite, la
cohérence interne, le texte narratif) mais les primitives qui produisent les valeurs par variable** :
`normPercentile()`, `validateTechnical()`, `testKpiDir()` — la même donnée d'entrée
(percentile individuel de `cmj_braking_rfd` pour cet athlète) peut nourrir **les deux** systèmes,
sans dupliquer le calcul du percentile lui-même. **Une seule source de calcul de percentile, deux
interprétations distinctes** (le composite pondéré du Profil Absorbeur d'un côté, l'éventuel statut
catégoriel HYP de l'autre) — cohérent avec l'objectif "une seule source de calcul, une seule
interprétation HYP" formulé dans la mission, à condition de bien distinguer *calcul de la donnée*
(réutilisable) et *interprétation clinique* (propre à chaque système, non fusionnée).

---

## 7. Profil biomécanique ou diagnostic clinique ?

**Réponse, fondée sur la lecture du code, pas une supposition** : **A — une question de PROFIL
biomécanique.**

Preuves directes :
- La sortie est un **percentile continu** + une **cohérence interne** (écart-type) + un **texte
  descriptif comparatif** ("est élevé/dans les normes/faible par rapport à la norme") — jamais un
  état "Retenue"/"Suspectée" ni une orientation `CLI###`.
- Le moteur (`BiomechanicalProfileEngine`) est **explicitement générique** — *"le moteur ne connaît
  JAMAIS la logique d'un profil particulier"* (`index.html:1810`) — il n'a aucune notion de
  "diagnostic clinique", seulement de rôle statistique (discriminante/confirmatoire/descriptive).
- Le module qui **croise** ce profil avec la clinique (`functionScores`, `CLI###`, hypothèses) est
  **séparé et postérieur** : `computeMoteurRaisonnementBiomecanique`, `computeSyntheseBiomecanique`,
  qui reçoivent `profileResults` **et** `functionScores` comme deux entrées distinctes à réconcilier
  — la distinction entre "profil" et "diagnostic" est donc **déjà actée dans l'architecture du
  code lui-même**, pas une interprétation ajoutée par cet audit.

Le Profil Absorbeur ne "mélange" donc pas les deux — il reste, par construction, du côté du profil ;
c'est un autre module, déjà séparé, qui fait le pont vers la clinique aujourd'hui (pour le score TFM,
pas pour HYP, qui n'est pas encore branché).

---

## 8. `cmj_time_to_stab`

- **Ce qu'elle mesure** : temps de stabilisation après la phase d'atterrissage du CMJ lui-même
  (`valdName`/label *"Time to Stabilization (s)"*, `dir:min`) — même grandeur physique que
  `landing_uni_tts`/`landing_bi_tts`/`sllt_tts`/`slcmj_time_to_stab`, mais mesurée sur un test
  différent (le CMJ, pas un test de Landing dédié).
- **Utilisation actuelle** : confirmatoire du Profil Absorbeur (poids 0.5) — contribue au percentile
  composite "Absorbeur", jamais seule.
- **Compatible avec Absorption ?** Oui, dans la mesure où le Profil Absorbeur biomécanique
  l'utilise déjà à ce titre — mais ceci reflète la logique du Profil (percentile composite d'un
  mécanisme), pas une conclusion sur son rôle clinique dans `HYP-ABS-01`.
- **Semble-t-elle plutôt relever de Stabilisation ?** Question posée par la mission — **aucune
  source consultée (Vierge_7, `HYP_ARCHITECTURE_PHASE_B/C.md`, `CLI060/061/070/071`) ne mentionne
  `cmj_time_to_stab` du tout**, ni pour Absorption ni pour Stabilisation. Le seul fait qu'elle
  ressemble structurellement à `landing_*_tts` (déjà partagée Absorption/Stabilisation, §5 de
  `CARTOGRAPHIE_ABSORPTION_HYP_ABS01.md`) ne permet pas de lui attribuer un rôle par analogie —
  interdit explicitement par la mission.

**Conclusion** : ❓ **NON DÉTERMINABLE.** Utilisée réellement dans le code (Profil Absorbeur), absente
de toute fiche clinique HYP (V1, V2) ou de toute source Vierge_7 consultée. Aucun rôle ne lui est
attribué ici.

---

## 9. `cmj_ecc_peak_vel` — pourquoi absente du Profil Absorbeur ?

- **Utilisation Profil Absorbeur** : ❌ absente, vérifiée sur la liste complète des 7 variables du
  profil (§1).
- **Utilisation HYP** : diagnostique en V1, explicative en V2.
- **Différence de philosophie, pas une erreur** : le Profil Absorbeur (migration du référentiel PTM
  du 04/08, `index.html:1967-1974`) a été construit par le praticien lui-même à une date antérieure,
  avec un ensemble de variables **délibérément restreint** à 4 discriminantes + 2 confirmatoires +
  1 descriptive — un choix éditorial de parcimonie (*"aucune variable nécessitant une interprétation
  n'a été ajoutée... à discuter ensemble avant tout ajout"*, commentaire explicite du code,
  `index.html:1972-1974`). La fiche HYP-ABS-01, elle, a été construite indépendamment à partir de
  Vierge_7, avec son propre ensemble de variables diagnostiques/explicatives. **Les deux référentiels
  ont simplement été peuplés séparément, à des moments différents, par des méthodes différentes** —
  ce n'est pas un oubli à corriger, c'est deux constructions indépendantes qui se recoupent
  partiellement.

---

## 10. Ce qui peut être réutilisé

### A. Réutilisable directement
- `normPercentile(testKey,kpiKey,pop,age,raw,dir)` — calcul de percentile individuel, applicable à
  n'importe quel KPI CMJ, y compris les 3 variables Core de HYP-ABS V2.
- `validateTechnical(kpiKey,raw)` — validation technique de la donnée brute, déjà générique.
- `testKpiDir(testKey,kpiKey)` — lecture du sens du seuil déjà défini dans `TESTS`.
- Les valeurs déjà calculées de `cmj_force_zero_vel` et `cmj_braking_rfd` pour un athlète donné,
  puisqu'elles sont déjà présentes dans le pipeline de données existant (aucun nouveau calcul requis).

### B. Réutilisable après adaptation
- La structure `ProfileVariable`/`BiomechanicalProfileDefinition` — le **vocabulaire**
  discriminante/confirmatoire/descriptive pourrait inspirer une structure de données HYP équivalente,
  mais la **mécanique de scoring** (moyenne pondérée continue) devrait être remplacée par la machine
  à états HYP déjà spécifiée (`KINEXUS_REASONING_ENGINE_V1.md`) — adaptation de vocabulaire/structure,
  pas de logique.
- Le percentile individuel de `cmj_ecc_mean_power`/`cmj_time_to_stab` (déjà calculé pour le Profil
  Absorbeur) pourrait informer, après seuillage clinique séparé, un statut HYP — mais le seuillage
  lui-même resterait à définir cliniquement, pas hérité du percentile.

### C. Non réutilisable
- Le percentile composite "Absorbeur" lui-même (moyenne pondérée) — ne peut pas remplacer l'état
  discret HYP sans perdre la sémantique clinique attendue (Absente/Suspectée/Retenue).
- Les bandes `BIOMECA_DEFAULT_BANDS.niveauAbsolu` — explicitement non cliniques, configurables sans
  validation Vierge_7 ; les utiliser comme seuil clinique HYP serait une invention non tracée.
- Le rôle "discriminante" pour les asymétries (utilisé par le profil "Contrôle") — contraire au
  principe HYP déjà gelé (asymétrie = modificateur seul, jamais générateur).

---

## 11. Architecture cible (schéma)

```
CALCULS EXISTANTS (normPercentile, validateTechnical, testKpiDir — réutilisés tels quels)
   ↓
Profil Absorbeur (reste INCHANGÉ, continue de répondre à sa propre question de profil)
   ↓ (fournit des VALEURS/PERCENTILES par variable, pas un verdict clinique)
HYP-ABS-01 V2 (nouvelle couche de raisonnement, séparée, à construire)
   ↓
NIVEAU 1 : Absorption (état discret : OK / À surveiller / Déficitaire)
   ↓
NIVEAU 2 : Freinage/Décélération · Capacité excentrique · Stratégie · Absorption réactive · Réception/Impact
   ↓
NIVEAU 3 : Variables (statuts individuels, produits par un seuillage clinique propre à HYP, pas par
           les bandes de percentile du Profil Absorbeur)
   ↓
NIVEAU 4 : Tests (CMJ, DJ, SLDJ, Landing, SLLT)
```

**Le Profil Absorbeur ne devient pas une deuxième source de vérité clinique** — il reste ce qu'il
est déjà (un profil biomécanique comparatif), et HYP-ABS-01 V2 devient la seule couche de
raisonnement clinique, en réutilisant les calculs de valeur/percentile sans réutiliser le verdict de
percentile composite lui-même.

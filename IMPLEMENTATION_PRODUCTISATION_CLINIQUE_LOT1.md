# Implémentation — Lot Productisation clinique 1 « Nettoyage du langage praticien »

Mission d'implémentation faisant suite à `AUDIT_PRODUCTISATION_CLINIQUE_KINEXUS_V1.md` (lecture
seule, commit `b6e3e6a`). Périmètre strictement présentation/wording — **aucune modification** des
8 moteurs HYP, de `computeHypClinicalSynthesis01()` (et de ses fonctions internes non séparables
`computeHypClinicalSynthesisQualities`/`Relationships`/`Narrative`/`csmRelationshipNarrative`), de
`HYP_QUALITY_RELATIONS`, de `TFM`, des normes, des seuils, des règles de convergence, des rôles de
variables, des statuts, des relations cliniques, de `priorities`, ni de `statusPriorityRank()`. Ce
document couvre les 13 sections mandatées par la mission.

---

## 1. Occurrences trouvées (recherche exhaustive, classification A/B/C)

Recherche systématique de six familles de fuites/frictions dans `index.html`, avant toute
modification :

| # | Motif recherché | Occurrences totales | Rendues (A) | Code interne non rendu (B) | Déjà neutralisées en amont (C) |
|---|---|---|---|---|---|
| 1 | `HYP-[A-Z]{3}-\d{2}` (identifiants moteur) | ~60 | 1 (`via` de `HYP_QUALITY_RELATIONS`, exposé tel quel dans 3 consommateurs `.narrative`) | ~59 (commentaires, `hypId:`, `version:`) | — |
| 2 | `moteur HYP` (texte brut) | 9 | 4 (`csmSafeQualityNote`, libellé "Qualités objectivées…", libellé "Aucun déficit… moteurs HYP", limitations CSM) | 0 | 5 (déjà routées via `CSM_TEXT_CLEANUPS` avant cette passe ou visées par elle) |
| 3 | `à valider par l'équipe clinique` | 3 | 2 (intro Variables, intro Raisonnement) | 1 (commentaire ligne 1198, jamais rendu) | — |
| 4 | `Explained by`/`Explains (`/`Correlated with`/`Refined by`/`Measures`/`Estimates`/`Influences` | 7 (dans `varRelHTML`) | 7 | 0 | — |
| 5 | Acronymes bruts `HYP`/`TFM`/`CSM` hors vue technique | 11 | 8 (dont 2 découvertes lors du balayage final : "Aucun déficit… moteurs HYP" ligne 8770, "Synthèse clinique (HYP/CSM)" ligne 8847) | 0 | 3 (Variables tab, explicitement technique — conservé) |
| 6 | Formulation "non déterminable" pauvre (PDF + chip UI) | 3 | 2 (PDF sportif, PDF expert) | — | 1 (chip UI, déjà correctement conditionnée, conservée telle quelle) |

**Classification A/B/C appliquée systématiquement avant toute édition** (mandat "NE PAS modifier
aveuglément toutes les occurrences") :
- **A — vivante et rendue** : modifiée dans ce lot.
- **B — code interne jamais rendu** (commentaires, `hypId`, `version`, `csmId`) : **non touchée**
  intentionnellement — cf. section 13.
- **C — déjà neutralisée par un mécanisme de présentation existant** (`csmSafeText`,
  `csmSafeQualityNote`) : vérifiée mais non dupliquée.

Deux exemples de traçage de consommateurs avant modification, pour éviter tout excès de
prudence ou de zèle :
- `s.elementsPrecision` et `s.relationsExplicatives` (calculés dans
  `computeHypClinicalSynthesisNarrative`) : **zéro consommateur UI/PDF** trouvé dans tout le
  fichier → laissés tels quels (catégorie B de fait, jamais rendus).
- `HYP_QUALITY_RELATIONS[].via` : **3 consommateurs réels** (`buildMultiQualityNarrative`,
  `csmSafeQualityNote` via `csmCleanExplanatoryText`, et les 3 sites `explanatoryHypotheses[].narrative`
  dans le PDF sportif/expert/UI) → tous routés vers le nouvel extracteur `hypRelationGloss()`.

---

## 2. Occurrences supprimées

- `HYP-XXX-NN` et `moteur HYP` disparus de toute phrase rendue au praticien (Synthèse clinique UI,
  PDF sportif, PDF expert, onglet Hypothèses, onglet Capacités).
- `à valider par l'équipe clinique` / `doivent être validées par l'équipe clinique` retirés des
  intros Variables et Raisonnement.
- `Explained by (amont)`, `Explains (aval)`, `Correlated with (liées)`, `Refined by (même test)`,
  `Measures`, `Estimates`, `Influences (mécanismes)` : vocabulaire anglais entièrement francisé
  dans `varRelHTML()`.
- `(non déterminable — HYP)` → `(non déterminable)` (`capaciteHTML`).
- `Information TFM secondaire (hors HYP)` → `Information complémentaire (hors diagnostic
  clinique)` (3 occurrences UI + PDF).
- `Qualités objectivées par un moteur HYP` → `Qualités objectivées` (2 occurrences).
- `CSM ne détermine` → `Cette synthèse ne détermine` (2 occurrences, texte CSM natif, routé via
  `csmSafeText`).
- `Formulations alignées sur la Synthèse clinique (HYP/CSM).` → `Formulations alignées sur la
  Synthèse clinique.` (onglet Hypothèses).
- `Aucun déficit n'est objectivé par les moteurs HYP avec les données actuellement disponibles.` →
  `…objectivé avec les données actuellement disponibles.` (onglet Synthèse clinique UI).
- Formulation pauvre du non-déterminable à preuve partielle (PDF sportif + expert) enrichie —
  voir section 6.

---

## 3. Occurrences conservées et pourquoi

- **`hypId:`, `version:`, `csmId:`, tous les commentaires source contenant `HYP-XXX-NN`** :
  jamais lus par un consommateur UI/PDF (vérifié par recherche exhaustive des accès à ces champs) —
  catégorie B, hors périmètre d'une mission de wording praticien.
- **`HYP_QUALITY_RELATIONS[].via` (structure de données elle-même)** : conservée telle quelle —
  seule sa *lecture* en présentation est nettoyée (`hypRelationGloss`), jamais la donnée source, qui
  reste la référence documentée du registre de relations qualité-à-qualité.
- **`TFM + hiérarchie des tests` (intro onglet Variables, ligne 8815)** : conservé volontairement.
  Contrairement à la Synthèse clinique ou à l'onglet Hypothèses (langage praticien), l'onglet
  Variables affiche déjà des clés de test brutes, des poids numériques et des noms de KPI
  techniques — c'est la vue explicitement technique visée par l'exception de la mission ("garder
  HYP/TFM uniquement dans les vues explicitement techniques/développeur").
- **`« mobilité de cheville »` etc. dans `HYP_QUALITY_RELATIONS[].via`** : conservés à la source
  (glose déjà rédigée par la mission de normalisation précédente) — réutilisés en lecture seule par
  `hypRelationGloss()`, jamais réécrits.
- **Chip UI `· données normatives insuffisantes`** (onglet Synthèse clinique) : conservé tel quel.
  Contrairement au PDF (paragraphe complet), un chip est un espace contraint — la formulation était
  déjà correcte et concise (conditionnée par `csmNonDeterminableHasPartialEvidence`, jamais affichée
  hors du cas pertinent) ; l'enrichissement de phrase mandaté par la mission cible explicitement le
  PDF, pas les chips.

---

## 4. Nouveau vocabulaire (table de traduction code → concept clinique → langage praticien)

| Code / concept interne | Sens réel | Langage praticien retenu |
|---|---|---|
| `HYP-XXX-01` (identifiant moteur) | Traçabilité technique du moteur clinique | Jamais affiché au praticien ; disponible uniquement dans le code/commentaires |
| `moteur HYP` | Le sous-système de diagnostic clinique par qualité | *diagnostic clinique* (ou omis quand le sujet est déjà clair) |
| `TFM` (poids de test générique) | Pondération statistique de repli, hors diagnostic HYP | *information complémentaire (hors diagnostic clinique)* |
| `CSM` / `Cette synthèse` | Synthèse multi-qualités (agrégation des 8 moteurs) | *cette synthèse* / *la Synthèse clinique* |
| `Explained by (amont)` | Variables amont qui expliquent la variable courante | *Expliqué par (amont)* |
| `Explains (aval)` | Variables avales que la variable courante peut expliquer | *Peut contribuer à (aval)* — "peut" conserve le registre non causal |
| `Correlated with (liées)` | Association statistique sans lien explicatif documenté | *Associé à (liées)* |
| `Refined by (même test)` | Autre KPI du même test, précisant la mesure | *Précisé par (même test)* |
| `Measures` / `Estimates` | Origine référentiel clinique (mesure directe / estimation) | *Mesure* / *Estime* (+ tag source inchangé) |
| `Influences (mécanismes)` | Mécanismes biomécaniques influencés | *Influence (mécanismes)* |
| `(non déterminable — HYP)` | État non classifiable par le moteur | *(non déterminable)* |
| `hypothèse explicative` (relation qualité-à-qualité) | Registre 2/3 (ni association simple, ni causalité) | *hypothèse explicative possible*, jamais *cause* |

**Principe transversal** : un même concept garde le même mot partout où il apparaît (UI ET PDF
sportif ET PDF expert) — vérifié explicitement par les tests de la section 11 (mêmes assertions de
présence/absence appliquées aux deux PDF et, pour les intitulés `varRelHTML`, à la fonction
elle-même).

---

## 5. Relations explicatives — nouvelle formulation

`HYP_QUALITY_RELATIONS[].via` mélangeait, dans une seule chaîne, un nom de variable technique, une
glose clinique entre guillemets français (présente pour seulement 4 des 8 relations) et un
identifiant `HYP-XXX-01`. Nouvelle fonction `hypRelationGloss(via)` : extrait uniquement le
fragment entre guillemets quand il existe, retourne `null` sinon (jamais de reconstruction
inventée).

`csmCleanExplanatoryText(rel)` (nouvelle fonction, présentation pure) construit la phrase affichée
à partir de la glose extraite :
- **Avec glose** (ex. relation Mobilité → Stabilisation) : *« La mobilité de cheville peut
  constituer une hypothèse explicative possible du déficit de Stabilisation, sans en établir la
  cause. »*
- **Sans glose** (4 des 8 relations, ex. Force → Puissance) : repli au niveau de la qualité — *« Le
  déficit de Force peut constituer une hypothèse explicative possible du déficit de Puissance, sans
  en établir la cause. »*

Dans les deux cas : jamais de nom de variable brut (`wblt_distance`), jamais d'identifiant
`HYP-XXX-01`, et la clause *« sans en établir la cause »* est conservée dans toutes les phrases pour
préserver explicitement le registre non causal déjà validé par les missions précédentes
(`AUDIT_TRANSVERSAL_HYP_V1.md` §10, `IMPLEMENTATION_FINAL_PRIORITES_CSM.md`). Les 3 consommateurs
réels (PDF sportif, PDF expert, onglet Synthèse clinique UI) appellent tous
`csmCleanExplanatoryText(rel)` au lieu de `rel.narrative` brut.

Le registre **concordance** (`concordant_no_relation`, aucune relation documentée) n'est pas
concerné par ce nettoyage — son narratif était déjà exempt de fuite technique.

---

## 6. Non déterminable — nouvelle formulation

`csmNonDeterminableHasPartialEvidence(quality, csm)` (fonction déjà existante, non modifiée)
distingue, pour une qualité non déterminable, l'absence totale de mesure exploitable d'une
situation où au moins une preuve diagnostique est classifiable mais où le verdict global reste
bloqué par une autre preuve non classifiable (ex. Puissance : CMJ déficitaire et classifiable,
SLCMJ jamais classifiable faute de seuil).

Ancienne formulation (PDF sportif + expert) : *« Diagnostic non déterminable avec les données
normatives actuellement disponibles pour : Puissance. »* — répétait l'étiquette sans expliquer le
pourquoi.

Nouvelle formulation, reprenant littéralement le wording demandé par la mission : *« Résultat non
déterminable pour Puissance : les mesures sont disponibles, mais les références nécessaires à la
confirmation de cette qualité ne sont pas actuellement exploitables dans cette population. »*
(accord au pluriel — *ces qualités* — géré automatiquement si plusieurs qualités concernées).

Aucun nouvel état, aucune nouvelle taxonomie inventée : seule la phrase affichée change, à partir
d'un booléen déjà exposé par CSM. Le chip UI (contexte contraint, déjà correctement conditionné)
est laissé inchangé — cf. section 3.

---

## 7. UI — changements

- Onglet **Variables** : intro sans "à valider par l'équipe clinique" ; en-têtes de section
  `varRelHTML()` entièrement francisés (7 libellés).
- Onglet **Raisonnement** : intro remplace "doivent être validées par l'équipe clinique" par "il
  s'agit d'estimations, pas de mesures brutes" — honnête sur le statut (valeurs proposées, pas
  mesurées) sans inventer un processus de validation qui n'existe pas.
- Onglet **Synthèse clinique** : 3 chaînes nettoyées ("Qualités objectivées…", "Aucun déficit… par
  les moteurs HYP…", limitations CSM via `csmSafeText`).
- Onglet **Capacités** : suffixe `(non déterminable — HYP)` → `(non déterminable)`.
- Onglet **Hypothèses** : caption `(HYP/CSM)` retirée.
- Onglet **Orientations** : libellé "Information TFM secondaire (hors HYP)" → "Information
  complémentaire (hors diagnostic clinique)".

Aucun changement de mise en page, de couleur, de navigation ou de hiérarchie visuelle — uniquement
le texte des chaînes déjà identifiées.

---

## 8. PDF — changements

Identiques dans le PDF sportif (`buildSportifReport`) et le PDF expert (`buildExpertReport`), pour
garantir la cohérence de vocabulaire mandatée par la mission :
- Section "Relations explicatives possibles" : phrase nettoyée via `csmCleanExplanatoryText`.
- Phrase "Résultat non déterminable…" enrichie (section 6).
- "Information TFM secondaire" → "Information complémentaire".
- Note de limites CSM : "CSM ne détermine" → "Cette synthèse ne détermine".

Confirmé par génération réelle des deux PDF (scénario Mobilité+Absorption+Stabilisation
déficitaires, relation HYP_QUALITY_RELATIONS active) — voir section 10.

---

## 9. Tests

Nouveau fichier `tests/productisationCliniqueLot1.test.js` (46 assertions), 7 catégories :
1. Relation explicative flagship (Mobilité → Stabilisation) : aucun `HYP-XXX-NN`, aucun
   `wblt_distance` brut, registre "hypothèse explicative" présent, aucun mot d'escalade causale
   ("provoque", "entraîne une altération", "est la cause de", …).
2. PDF sportif + PDF expert : mêmes vérifications appliquées au rendu réel complet.
3. Non-déterminable à preuve partielle (Puissance, scénario CMJ déficitaire + SLCMJ non
   classifiable) : nouvelle phrase présente, ancienne formulation absente.
4. `varRelHTML()` : aucun terme anglais résiduel, 3 libellés français vérifiés explicitement.
5. Intros Variables/Raisonnement : absence directe des notes internes dans le HTML source.
6. Identifiant HYP retiré de `capaciteHTML` et du libellé "Qualités objectivées…".
7. **Non-régression stricte** : `functionScores`, `priorities`, `clinicalSynthesis` comparés par
   `assert.deepStrictEqual` sur 5 scénarios entre le commit pré-mission (`b6e3e6a`) et l'état
   courant ; `HYP_QUALITY_RELATIONS` et `TFM` comparés en tant que structures de données complètes.

Résultat : **46 passés, 0 échoué**. Ajustement nécessaire d'un test préexistant
(`tests/prioritesInterventionCsm.test.js`, 2 assertions) pour refléter le renommage "Information TFM
secondaire" → "Information complémentaire" décidé par ce lot (changement de wording légitime, pas
une régression du comportement testé).

Suite complète : **33 fichiers de tests, 0 échec** (`for f in tests/*.test.js; do node "$f"; done`).

---

## 10. Non-régression

Comparaison stricte automatisée (section 9, catégorie 7) entre le commit `b6e3e6a` (dernier commit
avant ce lot) et l'état courant, sur 5 scénarios cliniques distincts (Mobilité seule, Mobilité +
Stabilisation avec relation active, Puissance non déterminable à preuve partielle, Puissance
normale, aucune donnée) :
- `functionScores` (sorties des 8 moteurs HYP) : **identiques bit à bit**.
- `priorities` : **identiques bit à bit**.
- `clinicalSynthesis` (sortie complète de `computeHypClinicalSynthesis01`) : **identiques bit à
  bit**.
- `HYP_QUALITY_RELATIONS` (structure de données) : **identique** (seule sa présentation change).
- `TFM` (table de poids complète) : **identique**.

Aucune régression détectée. Le harnais de comparaison charge le code "avant" via `new Function(...)`
(même royaume JS que le code "après", pour éviter un faux échec `deepStrictEqual` dû à une
comparaison inter-royaume) plutôt que `vm.createContext` — détail technique documenté dans le test
lui-même.

---

## 11. Vérification navigateur (réelle, Playwright)

Serveur local (`python3 -m http.server`) servant une copie de `index.html` avec React/ReactDOM
vendorisés localement (CDN → fichiers locaux), navigateur Chromium piloté par Playwright.

- **Onglet Variables** (capture d'écran, carte WBLT dépliée) : confirmé visuellement —
  "EXPLIQUÉ PAR (AMONT)", "PEUT CONTRIBUER À (AVAL)", "ASSOCIÉ À (LIÉES)", "PRÉCISÉ PAR (MÊME
  TEST)", "MESURE (RÉFÉRENTIEL CLINIQUE)", "ESTIME (RÉFÉRENTIEL CLINIQUE)", "INFLUENCE
  (MÉCANISMES)" — texte en majuscules via CSS (`text-transform:uppercase`), contenu HTML réellement
  francisé. Intro de l'onglet confirmée sans "à valider par l'équipe clinique".
- **Onglet Raisonnement** : intro confirmée — "…il s'agit d'estimations, pas de mesures brutes.",
  ancienne formulation absente.
- **Onglet Synthèse clinique / Déficits à investiguer** : libellé "Qualités objectivées — même
  niveau de priorité clinique, aucun classement entre elles." confirmé (sans "par un moteur HYP").
- Aucune erreur console pertinente (les 2 erreurs réseau observées concernent des appels
  Supabase/ressources externes attendus en environnement sandbox sans accès réseau, sans rapport
  avec cette mission).

---

## 12. Vérification PDF (réelle, génération + capture)

PDF sportif et PDF expert générés via le harnais Node réel (`computeMoteur()` +
`buildFullReportHtml('sportif'|'expert', athlete, bilan, res)`) sur le scénario flagship (Mobilité,
Absorption, Stabilisation déficitaires ; relation Mobilité→Stabilisation active), capturés en image
via Playwright.

**Confirmation visuelle du correctif phare** : la section "Relations explicatives possibles"
affiche désormais *« La mobilité de cheville peut constituer une hypothèse explicative possible du
déficit de Stabilisation, sans en établir la cause. »* — remplaçant l'ancien texte brut
`wblt_distance (explicative « mobilité de cheville » de HYP-STA-01)`.

Vérifications automatisées sur le HTML généré : 0 occurrence de `HYP-XXX-NN`, 0 occurrence de
`wblt_distance`, 0 occurrence de `moteur HYP`, 0 `undefined`, 0 `null` orphelin, 0 badge "Priorité
N" résiduel, note de limites CSM affichant "Cette synthèse ne détermine" (au lieu de "CSM ne
détermine").

---

## 13. Éléments volontairement non modifiés

- **`HYP_QUALITY_RELATIONS` (la structure de données, y compris `via`)** : donnée source, seule sa
  lecture en présentation est nettoyée.
- **Tous les moteurs HYP (8), `computeHypClinicalSynthesis01()` et ses fonctions internes non
  séparables, `TFM`, `VAR_REL3`, normes, seuils, règles de convergence, rôles de variables, statuts,
  relations cliniques, `priorities`, `statusPriorityRank()`** : Règle Absolue de la mission,
  respectée intégralement — vérifiée par la non-régression stricte (section 10).
- **`hypId:`, `version:`, `csmId:` et tous les commentaires source contenant `HYP-XXX-NN`** :
  catégorie B (jamais rendus), hors périmètre.
- **Vocabulaire technique de l'onglet Variables** (`TFM + hiérarchie des tests`) : exception
  documentée de la mission pour les vues explicitement techniques (section 3).
- **Chip UI "· données normatives insuffisantes"** : déjà correct et concis, l'enrichissement de
  phrase ciblait explicitement le PDF (section 3, 6).
- **Aucune nouvelle taxonomie "non déterminable" à 6 états** : réutilisation stricte de
  `csmNonDeterminableHasPartialEvidence`, aucun nouvel état ajouté.
- **Aucun changement de design, layout, couleur ou navigation** : uniquement du texte.

---

## Résumé des fichiers modifiés

- `index.html` : 90 insertions / 39 suppressions (présentation/wording uniquement, syntaxe
  vérifiée par `node --check` après chaque lot de modifications).
- `tests/productisationCliniqueLot1.test.js` (nouveau, 46 assertions).
- `tests/prioritesInterventionCsm.test.js` : 2 assertions ajustées au renommage "Information TFM
  secondaire" → "Information complémentaire" (wording, pas de régression de comportement).

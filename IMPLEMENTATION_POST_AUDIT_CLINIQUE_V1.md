# Implémentation — Correction des contradictions cliniques post-audit final HYP/CSM

Suite directe de `AUDIT_FINAL_CLINIQUE_KINEXUS_V1.md` (verdict C — corrections nécessaires avant
utilisation). Diff : `index.html` **+148/-16 lignes** (`git diff --stat`), un fichier de test ajouté
(`tests/postAuditCliniqueContradictions.test.js`, 26 tests). Aucune ligne des 8 moteurs HYP, de
`computeHypClinicalSynthesis01`, `HYP_QUALITY_RELATIONS`, `TFM`, seuils, normes, règles de
convergence, `priorities` (construction) ou `statusPriorityRank()` n'est modifiée — vérifié par
lecture du diff (§13) et par comparaison stricte des 8 moteurs HYP avant/après (§13).

---

## 1. Problèmes corrigés

1. **État "suspectée" invisible dans la Synthèse clinique** (UI + PDF sportif + PDF expert) —
   corrigé, additif (§6).
2. **Onglet "Hypothèses" (legacy) produisant des formulations causales génériques** contredisant
   CSM, présentes aussi dans 3 autres points de consommation du PDF/dashboard — corrigé (§7).
3. **"Priorité principale" affirmant une hiérarchie unique que CSM refuse explicitement** —
   corrigé (§8).
4. **Qualités structurellement bloquées (Force/Puissance/Explosivité/Endurance) sans indication
   que la limite est normative, pas un manque de saisie pour ce patient** — corrigé, additif,
   affiché uniquement quand pertinent (§9).

---

## 2. Cartographie avant correction (mini-audit technique, réalisé avant toute modification)

**1. Calcul de "suspectée"** : `csmIsSuspected(h)` (`index.html`, section HYP-CSM-01, non modifiée)
→ `qualities[q].suspected` → exposé au niveau supérieur par `computeHypClinicalSynthesis01` sous
`clinicalSynthesis.suspected` (tableau `{quality,state}[]`, déjà calculé, jamais lu par aucun
consommateur avant cette mission).

**2. Consommateurs UI/PDF de l'état** : recherche exhaustive de `csm.objectified`/
`csm.nonDeterminable` — 3 points trouvés, tous lisant strictement `objectified`/`nonDeterminable`/
`explanatoryHypotheses`/`relationships`, jamais `suspected` : l'onglet UI "Synthèse clinique"
(`ExpertView`, `tab==='synthese'`), `buildSportifReport`, `buildExpertReport`.

**3. Générations de texte "Hypothèses"** : une seule source, `var HYPO={...}`, un objet de phrases
génériques par qualité codées en dur (`'Le déficit de réactivité observé semble principalement
influencé par...'`, etc.), assigné à `hypotheseTxt` dans `computeMoteur()` (non modifié — reste la
donnée `priorities[].hypothese`, éditable par le praticien via "Modifier le rapport"). **4 points de
consommation identifiés**, présentant ce texte comme une conclusion clinique :
   - Onglet UI "Hypothèses" (`ExpertView`, `tab==='hypotheses'`).
   - Carte dashboard "Priorité principale" (`AnalyseView`).
   - Carte PDF "Priorité principale" (`buildSportifReport`, `kpiCard`, 3 occurrences selon
     `reportMode`).
   - Section PDF sportif "Priorités d'intervention" (`buildSportifReport`, champ "🔍 Pourquoi ?").
   - Section PDF expert "Hypothèses cliniques" (`buildExpertReport`).
   Mécanisme déjà partiellement corrigé par une mission antérieure : `tfmSecondaryContributorNote()`
   remplaçait déjà `HYPO()` dans le seul cas où le contributeur TFM a un rôle explicatif/segmental
   dans le moteur HYP — mais **jamais** dans les cas "rôle diagnostique" ou "aucun contributeur",
   qui restent le chemin le plus fréquent (c'est précisément ce chemin que l'audit final a
   observé : Réactivité/Stabilisation, contributeurs diagnostiques).

**4. Occurrences de "Priorité principale"** : 4 (1 dashboard `AnalyseView`, 3 PDF sportif
`buildSportifReport` selon `reportMode` ∈ {preseason, performance, rtp}). Aucune dans
`buildExpertReport` (confirmé, pas de carte équivalente).

**5. Mécanismes causaux legacy supplémentaires recherchés** (recherche exhaustive de "influencé
par"/"responsable"/"entraîne un(e)"/"explique le/la" dans tout `index.html`) :
   - `buildMultiQualityNarrative()`/`causalSteps` ("Chaîne causale principale", dashboard + PDF) :
     **déjà conforme**, normalisé par une mission antérieure — vérifie `findHypQualityRelation`
     avant tout texte, n'emploie jamais "cause"/"entraîne", toujours "hypothèse explicative...
     sans en établir la cause" ou "déficits concordants... sans relation explicative documentée".
     Non modifié.
   - `capaciteHTML()` (onglet "Capacités") : **déjà conforme**, marque explicitement toute
     information TFM divergente comme "secondaire... ne constitue pas un diagnostic HYP". Non
     modifié.
   - Onglet "Orientations" (`p.orientation`, texte d'action générique, ex. "Travailler les qualités
     de Force.") : pas une affirmation diagnostique/causale, hors périmètre. Non modifié.
   - `HYPO` reste donc la **seule** source de texte causal non conforme trouvée dans tout le
     fichier.

---

## 3. Décisions d'architecture

- **Routage par fonction pure additive, jamais un second moteur.** Trois fonctions nouvelles,
  purement présentationnelles, lecture seule de `clinicalSynthesis` déjà calculé — `csmSafeQualityNote`,
  `csmSuspectedNote`, `csmNonDeterminableHasPartialEvidence` — plus un utilitaire pur sur `priorities`,
  `topSeverityGroup`. Aucune ne recalcule, ne relit de seuil, ni n'appelle un moteur HYP. Placées
  juste après `CSM_STATE_LABEL`, avant `computeMoteur()`, dans la continuité du pattern déjà établi
  par la mission d'optimisation de la Synthèse clinique.
- **`HYPO`/`hypotheseTxt`/`priorities[].hypothese` restent des données intactes.** Ils continuent
  d'exister, d'être calculés exactement comme avant, et restent éditables par le praticien via
  "Modifier le rapport" (`ReportPreview`) — cette édition est un jugement clinique humain explicite,
  catégoriquement différent d'une narration auto-générée non hedgée, et hors du périmètre de cette
  mission. **Principe appliqué à chaque point de consommation concerné par une surcharge
  praticien possible** (`buildSportifReport`, seul endroit où `bilan.reportOverrides.priorities`
  peut exister) : si le praticien a explicitement sauvegardé une surcharge, son texte fait foi tel
  quel ; sinon (cas par défaut, la quasi-totalité des bilans), le texte est routé vers CSM.
  `buildExpertReport` et l'UI live (`ExpertView`/`AnalyseView`) n'ont jamais de mécanisme de
  surcharge — routage systématique, sans condition.
- **"Priorité principale" → "Déficits objectivés" plutôt qu'un remplacement synonyme.** Conforme à
  l'option B de la mission : quand plusieurs qualités sont à égalité de sévérité
  (`topSeverityGroup`), toutes sont affichées, jamais une seule choisie arbitrairement ; l'ordre de
  tri par sévérité (`statusPriorityRank`, Mission B, non modifié) reste utilisé pour déterminer LE
  groupe le plus sévère, jamais pour départager à l'intérieur de ce groupe.
- **Problème 4 sans toucher `computeHypClinicalSynthesis01`** (explicitement interdit) : la
  distinction "aucune mesure" vs "mesures insuffisamment normées" est recalculée à la couche de
  présentation à partir de `csm.qualities[q].hyp.diagnosticEvidence`, déjà exposé tel quel par CSM
  (`qualities[q].hyp`, jamais copié ni modifié) — zéro ligne ajoutée dans la fonction CSM elle-même.

---

## 4. Modifications UI

- **Onglet "Synthèse clinique"** (`ExpertView`) : nouveau bloc "Qualités suspectées (preuve
  partielle)" entre "Qualités non déterminables" et "Relations explicatives possibles", lisant
  `csm.suspected` ; le bloc "Qualités non déterminables" affiche désormais, pour chaque qualité
  concernée, " · données normatives insuffisantes" quand `csmNonDeterminableHasPartialEvidence`
  est vrai (silencieux sinon).
- **Onglet "Hypothèses"** (`ExpertView`) : le texte entre guillemets n'est plus `p.hypothese` brut
  mais `csmSafeQualityNote(p.fonction, res.clinicalSynthesis)` ; une phrase d'en-tête a été ajoutée
  ("Formulations alignées sur la Synthèse clinique (HYP/CSM).").
- **Dashboard, carte "🎯"** (`AnalyseView`) : renommée "Déficits objectivés" ; affiche désormais
  `topSeverityGroup(pri)` (toutes les qualités à égalité de sévérité maximale, jamais une seule) et
  un sous-titre routé via `csmSafeQualityNote` (ou une phrase neutre si plusieurs qualités à
  égalité).

---

## 5. Modifications PDF

- **`buildSportifReport`** :
  - 3 occurrences de la carte "Priorité principale" (`preseason`/`performance`/`rtp`) remplacées par
    des variables précalculées (`prioCardTitle`/`prioCardValue`/`prioCardColor`/`prioCardSubtitle`),
    gérant la distinction surcharge praticien / défaut décrite en §3.
  - Section "Priorités d'intervention", champ "🔍 Pourquoi ?" : routé de la même façon
    (`prioCardOverridden ? p.hypothese : csmSafeQualityNote(...)`).
  - Section "Synthèse clinique" : ajout du bloc "Qualités suspectées (preuve partielle)" et de la
    note italique Problème 4, mêmes données que l'UI.
- **`buildExpertReport`** :
  - Section "Hypothèses cliniques" : `p.hypothese` remplacé sans condition par `csmSafeQualityNote`
    (pas de mécanisme de surcharge praticien dans ce rapport).
  - Section "Synthèse clinique" : mêmes ajouts (suspectées + note Problème 4) que le PDF sportif.

---

## 6. Gestion de "suspectée" (Problème 1)

`clinicalSynthesis.suspected` (déjà calculé, jamais modifié) est désormais lu à 3 endroits :
onglet UI Synthèse clinique, PDF sportif, PDF expert — chacun affichant, pour chaque qualité
suspectée, `csmSuspectedNote(quality)` : *« Un premier signal existe pour [qualité], mais la
convergence diagnostique n'est pas suffisante pour retenir le déficit. »* Formulation unique,
réutilisée aux 3 endroits (garantit un vocabulaire strictement identique, même principe que
`CSM_STATE_LABEL`). Vérifié (§10/CAS A) : jamais transformée en "normal", "déficit confirmé" ou
"non déterminable" à aucun niveau (HYP/CSM/PDF).

---

## 7. Gestion du legacy "Hypothèses" (Problème 2)

`HYPO`/`hypotheseTxt` restent inchangés comme mécanisme de calcul et comme donnée éditable par le
praticien. `csmSafeQualityNote(quality, csm)` route désormais l'affichage vers HYP/CSM à chacun des
4 points de consommation identifiés en §2 :
- qualité objectivée avec relation CSM documentée (explicative ou concordance) → narrative CSM
  déjà rédigée (`rel.narrative`) ;
- qualité objectivée sans relation → phrase neutre factuelle ("Déficit objectivé par le moteur HYP
  dédié... — voir la Synthèse clinique pour le détail.") ;
- qualité non déterminable → libellé CSM_STATE_LABEL ;
- qualité suspectée → `csmSuspectedNote` (même texte qu'en §6) ;
- qualité non couverte par un moteur HYP (Contrôle Frontal, Contrôle Sensoriel) → texte neutre
  "information TFM secondaire", jamais le texte causal `HYPO`.
Vérifié (§10/CAS B) : plus aucune occurrence de "X cause Y" / "influencé par" / "entraîne" dans les
PDF générés pour un scénario où l'ancien mécanisme les aurait produits.

---

## 8. Gestion de "Priorité principale" (Problème 3)

Remplacée par "Déficits objectivés" (dashboard + PDF sportif, 4 emplacements). Contenu : le groupe
`topSeverityGroup(pri)` — toutes les qualités partageant le statut le plus sévère de `priorities`
(déjà trié par `statusPriorityRank`, non modifié) — jamais un seul élément choisi arbitrairement en
cas d'égalité. Aucun nouveau départage inventé ; aucune modification de `statusPriorityRank` ni de
la construction de `priorities`. Quand le praticien a explicitement sauvegardé une surcharge
(`buildSportifReport` uniquement), l'ancien intitulé "Priorité principale" et son unique élément
sont conservés tels quels — c'est désormais un jugement humain explicite, pas une narration
auto-générée. Vérifié (§10/CAS C) : "Priorité principale" n'apparaît plus dans aucun PDF généré
pour un scénario à plusieurs qualités à égalité de sévérité sans surcharge praticien.

---

## 9. Gestion des non_determinable structurels (Problème 4)

`csmNonDeterminableHasPartialEvidence(quality, csm)` lit `csm.qualities[quality].hyp.
diagnosticEvidence` (déjà exposé par CSM) et retourne vrai si au moins une preuve diagnostique est
évaluable (`status !== 'indisponible'`) malgré un état global `non_determinable`. Quand vrai, une
phrase courte est ajoutée : *« Diagnostic non déterminable avec les données normatives actuellement
disponibles pour : [qualités]. »* — une seule ligne, groupée, jamais un avertissement par qualité
(conforme à l'instruction "ne pas transformer chaque non_determinable en long avertissement").
Silencieuse quand aucune qualité n'a de preuve partielle (ex. Force/Explosivité dans un scénario où
rien n'a été saisi pour elles).

---

## 10. Tests

`tests/postAuditCliniqueContradictions.test.js` — **26 tests**, 3 cas mandatés + non-régression :
- **CAS A (suspectée)** : 10 tests — HYP/CSM/source-UI/PDF sportif/PDF expert tous cohérents,
  jamais transformée en normal/déficit confirmé/non déterminable.
- **CAS B (contradiction legacy)** : 6 tests — qualité objectivée + qualité non déterminable +
  relation TFM existante, aucun texte causal ("X cause Y"/"influencé par"/"entraîne") dans les deux
  PDF ni dans `csmSafeQualityNote`, onglet Hypothèses vérifié au niveau du code source.
- **CAS C (multiples déficits)** : 9 tests — aucun rang automatique dans CSM, "Priorité principale"
  absente des deux PDF, les 3 déficits tous visibles, relations/concordances séparées.
- **Non-régression** : 1 test — pureté stricte de `computeMoteur()` (functionScores/
  clinicalSynthesis/priorities identiques sur deux appels identiques).

---

## 11. Résultats navigateur

Parcours réel (Playwright, scénario riche : Mobilité/Réactivité/Stabilisation rouges HYP, Endurance
suspectée, Force/Puissance/Explosivité non déterminables) :
- Dashboard : carte "DÉFICITS OBJECTIVÉS" affiche "CHEVILLE · RÉACTIVITÉ · STABILISATION" avec le
  sous-titre neutre "Plusieurs qualités présentent le même niveau de sévérité — voir la Synthèse
  clinique pour le détail de chacune." — plus de "Priorité principale".
- Onglet "Synthèse clinique" : nouveau bloc "Qualités suspectées (preuve partielle)" affiche
  Endurance avec la formulation attendue ; "Qualités non déterminables" affiche "Absorption ·
  données normatives insuffisantes" quand pertinent.
- Onglet "Hypothèses" : légende "Formulations alignées sur la Synthèse clinique (HYP/CSM)." ;
  Réactivité affiche désormais la concordance réelle ("... sont concomitants, mais les données...
  ne permettent pas d'identifier une relation explicative documentée entre eux.") au lieu de
  "semble principalement influencé par une altération des propriétés élastiques...".
- Onglet "Capacités" : confirmé déjà conforme (information TFM secondaire déjà étiquetée comme
  telle), aucun changement nécessaire.

---

## 12. Résultats PDF

PDF sportif et PDF expert régénérés réellement pour le même scénario (`buildFullReportHtml`) et
inspectés (capture d'écran + recherche textuelle) :
- Aucune occurrence de "undefined", d'enum interne, de "Priorité principale", d'"influencé par".
- "Qualités suspectées (preuve partielle)" présent avec Endurance dans les deux PDF.
- "Diagnostic non déterminable avec les données normatives actuellement disponibles pour : ..."
  présent uniquement pour les qualités concernées (Puissance dans le scénario testé), absent pour
  les qualités sans aucune donnée saisie.
- Carte "Déficits objectivés" (PDF sportif) affiche les qualités à égalité, section "Priorités
  d'intervention" affiche pour chaque carte un "Pourquoi ?" désormais fidèle à CSM (relation
  documentée ou concordance neutre, jamais de texte générique inventé).

---

## 13. Non-régression HYP

Comparaison stricte, avant/après l'ensemble des modifications, de la séquence complète des champs
`state`/`status` produits par les 8 moteurs HYP sur les mêmes données réelles (scénario couvrant
Puissance, Explosivité, Endurance, Force, Stabilisation, Réactivité, Mobilité, Absorption) :
**identique caractère pour caractère** (`diff`, code de sortie 0). `git diff` confirme que les 11
zones modifiées de `index.html` sont exclusivement : les 3 nouvelles fonctions de présentation
(avant `computeMoteur`), `buildSportifReport`, `buildExpertReport`, `AnalyseView`, `ExpertView` —
aucune à l'intérieur d'un `computeHypXxx01`, de `computeMoteur()` (hors zone d'insertion des
helpers, avant sa définition), ni de `computeHypClinicalSynthesis01`.

## 14. Non-régression CSM

`computeHypClinicalSynthesis01` : zéro ligne modifiée (confirmé par diff). Structure de sortie
(`objectified`/`nonDeterminable`/`suspected`/`relationships`/`explanatoryHypotheses`/`limitations`/
`narrative`) strictement identique avant/après sur tous les scénarios testés — les nouvelles
fonctions de présentation ne font que LIRE des champs déjà produits (`csm.suspected` en particulier,
présent mais inutilisé avant cette mission). Suite complète : **30 fichiers `tests/*.test.js`
(29 préexistants + 1 nouveau), 0 échec**, y compris tous les tests dédiés à chaque moteur HYP et à
`computeHypClinicalSynthesis01`.

---

## 15. Ce qui reste volontairement inchangé

- Les 8 moteurs HYP, leurs seuils/normes/règles de convergence : intacts.
- `HYP_QUALITY_RELATIONS`, `computeHypClinicalSynthesis01`, le contrat HYP V1 : intacts.
- `TFM`, `SYSTEM_TESTS`, `VAR_REL3`, `capaciteScores`/`capaciteHTML` (déjà conforme) : intacts.
- `priorities` (construction, tri par `statusPriorityRank`), `HYPO`/`hypotheseTxt` comme données
  éditables par le praticien : intacts — seule leur consommation par défaut à 4 endroits a changé.
- `buildMultiQualityNarrative`/"Chaîne causale principale" (déjà conforme, normalisée par une
  mission antérieure) : non touchée.
- Le widget "Priorités d'intervention" numéroté 1/2/3 (dashboard) avec ses libellés "Impact"/
  "Urgence" : signalé dans l'audit final comme un residual distinct (une hiérarchie affichée en
  plus de la sévérité), mais **hors du périmètre explicite du Problème 3 de cette mission**
  ("Priorité principale" au singulier) — non modifié, à traiter séparément si le praticien le
  souhaite.
- Le mécanisme d'édition praticien (`ReportPreview`, "Modifier le rapport") : totalement intact et
  toujours prioritaire sur le routage HYP/CSM automatique dès qu'une surcharge est sauvegardée.

## 16. Limites restantes

- Les données de "suspectée" et de "non déterminable avec preuve partielle" restent absentes des
  onglets Fonctions (qui les affichait déjà correctement avant cette mission) — cette mission a
  comblé l'angle mort de la Synthèse clinique spécifiquement, pas modifié un mécanisme qui
  fonctionnait déjà.
- Le widget "Priorités d'intervention" (Impact/Urgence) reste, comme documenté en §15, un residual
  non traité par cette mission.
- Aucun nouveau seuil, aucune nouvelle norme : les qualités structurellement bloquées (Force/
  Puissance/Explosivité/Endurance) restent bloquées — c'est un problème de données normatives,
  explicitement hors périmètre de correction ici (Problème 4 ne fait qu'expliquer la limite, jamais
  la lever).

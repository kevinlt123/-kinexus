# Audit — Optimisation du rendu de la Synthèse clinique HYP-CSM-01

Mission de présentation uniquement. Aucune ligne des 8 moteurs HYP, de
`computeHypClinicalSynthesis01()`, de `HYP_QUALITY_RELATIONS`, de `TFM`/`VAR_REL3`, de `priorities`
ou de `statusPriorityRank()` n'a été modifiée — vérifié par diff (`git diff --stat`, périmètre
détaillé en §9) et par test (pureté `computeMoteur()`, §8).

Cet audit fait suite à `AUDIT_COHERENCE_NARRATIVE_CSM_VS_LEGACY.md` (cohérence narrative, lecture
seule) et à `FIX_PRIORITIES_STATUS_RANKING.md` (correction du bug de tri). Il ne rouvre aucune des
conclusions de ces deux missions.

---

## 1. État réel capturé (code + rendu)

### 1.1 Onglet UI "Synthèse clinique" (`ExpertView`, `tab==='synthese'`)

Structure avant modification (`index.html`, bloc `tab==='synthese'`) : 4 blocs `Card` empilés —
"Qualités objectivement déficitaires" (badges + libellé d'état via une table `CSM_STATE_LABEL`
**redéfinie localement** à cet endroit), "Qualités non déterminables" (puces), "Concordances et
relations explicatives" (un seul bloc, texte brut = `csm.narrative.relationsExplicatives`), "Limites
de cette synthèse" (liste).

### 1.2 PDF sportif (`buildSportifReport`) et PDF expert (`buildExpertReport`)

Vérifié par génération réelle (scénario riche : Force/Puissance/Stabilisation confirmées rouge par
leurs moteurs HYP, Mobilité/Explosivité/Réactivité/Absorption/Endurance `non_determinable`,
Contrôle Frontal orange TFM) puis capture d'écran Playwright du HTML généré (`csm_rich_pdf_full_v2.png`,
`csm_rich_pdf_expert_v3.png` et recadrages) — pas seulement lecture de code, conformément à
l'exigence de la mission.

Deux défauts de rendu réel, invisibles à la seule lecture du code, ont été trouvés à cette étape :

- **PDF sportif**, page "Qualités fonctionnelles" : le badge d'une qualité `non_determinable`
  affichait littéralement le texte **"undefined"** (`badge(s,txt)` local à `buildSportifReport`
  n'avait aucun garde pour `s===null` ; `bgMap[null]`/`txtMap[null]`/`lblMap[null]` valent tous
  `undefined`, concaténés tels quels dans le HTML).
- **PDF expert**, table "Fonctions évaluées" : même défaut, code différent
  (`buildExpertReport` ne réutilise pas le `badge()` de `buildSportifReport` ; template inline
  `'<span class="print-badge '+sc.status+'">'+SL[sc.status]+'</span>'` sans garde).

Ces deux bugs sont des défauts de présentation purs — aucune valeur `status`/`state` n'était
recalculée ou mal interprétée, seul le texte affiché était cassé pour le cas `null`. Corrigés en
§7.

### 1.3 Fuite de vocabulaire interne dans le PDF

`csmPdf.narrative.deficitsObjectives` (chaîne pré-rédigée par
`computeHypClinicalSynthesis01`) concatène le `state` interne tel quel dans certaines
formulations (ex. `"retenue_faible"`, `"support faible"` comme enum brut plutôt que phrase). Ce
n'est pas un bug de `computeHypClinicalSynthesis01` (la fonction n'a pas vocation à connaître le
vocabulaire d'affichage du PDF) mais un couplage de présentation à corriger côté présentation
uniquement (§7).

### 1.4 Registres "relation explicative" et "concordance" fusionnés

`csm.narrative.relationsExplicatives` (une seule chaîne narrative) et le bloc UI "Concordances et
relations explicatives" mélangent deux registres de preuve structurellement distincts dans le CSM
lui-même (`csm.explanatoryHypotheses` — relation documentée dans `HYP_QUALITY_RELATIONS`, entre
deux qualités objectivées — vs `csm.relationships.filter(level==='concordant_no_relation')` — même
statut, aucune relation documentée) en un seul paragraphe, sans distinction visuelle. Contraire à
l'exigence de la mission (Partie 3) : ces deux registres ne doivent jamais être visuellement
confondus.

---

## 2. Classification des éléments affichés (A-essentiel / B-utile / C-secondaire / D-inutile)

| Élément | Classe | Commentaire |
|---|---|---|
| Badges qualités objectivées (statut + nom) | A-essentiel | Réponse directe à "qu'est-ce qui ne va pas" (Niveau 1). |
| Phrase "Un déficit est objectivé pour…" | A-essentiel | Синthèse en une phrase, condition du "10 secondes". |
| Liste qualités non déterminables | A-essentiel | Distinction non_determinable ≠ normal, exigence explicite de la mission. |
| Relations explicatives possibles | B-utile | Niveau 2/3 ("comment reliées", "pourquoi") — jamais affirmées comme diagnostic. |
| Concordances sans relation documentée | C-secondaire | Utile pour la traçabilité, mais registre plus faible que les relations documentées — doit rester visuellement en retrait. |
| Limites de la synthèse | A-essentiel | Garde-fou clinique obligatoire, jamais à masquer. |
| `csm.qualities` (objet verbeux complet) | D-inutile pour l'affichage | Déjà non utilisé en UI/PDF avant cette mission — confirmé, aucun changement nécessaire. |

Aucun élément classé D n'était affiché ; rien n'a donc été supprimé de l'affichage — conforme à
l'instruction de ne rien retirer sans justification séparée.

---

## 3–9. Séparation des registres (DIAGNOSTIC OBJECTIVÉ / NON DÉTERMINABLE / CONCORDANCE / RELATION EXPLICATIVE / LIMITATION)

Problème constaté (§1.4) : les cinq registres exigés par la mission existent déjà comme *données*
distinctes dans `clinicalSynthesis` (`objectified`, `nonDeterminable`, `relationships` scindable par
`level`, `limitations`) mais n'étaient pas tous *rendus* distinctement — concordance et relation
explicative étaient fusionnées, et le texte "déficits objectivés" pouvait laisser filtrer du
vocabulaire interne.

Décision : présentation corrigée pour que chacun des cinq registres ait son propre bloc (Card en
UI, sous-titre dédié en PDF), sans jamais recalculer ni réinterpréter les valeurs sous-jacentes
(détail des modifications en §7 et dans `IMPLEMENTATION_SYNTHESE_CLINIQUE_UI_PDF.md`).

---

## 10–11. Lisibilité, hiérarchie, densité — cohérence UI/PDF

**Déjà bon (non modifié) :**
- L'ordre des blocs (déficits → non-déterminable → relations → limites) suit déjà le modèle à 4
  niveaux visé par la mission (Niveau 1 → Niveau 4) — conservé tel quel.
- Les badges de statut (couleurs, formes) sont déjà cohérents avec le reste de l'application
  (`Badge` React, `bgMap`/`txtMap`/`lblMap` PDF) — non touchés.
- Le style "Card" / `panel()` / `subtleHeader()` existant est repris à l'identique pour les
  nouveaux blocs (aucune nouvelle primitive visuelle introduite).

**Insuffisant (corrigé) :**
- UI et PDF ne racontaient pas exactement la même synthèse : l'UI recalculait localement une table
  `CSM_STATE_LABEL` (avec un accord grammatical légèrement différent : "Confirmée" au féminin) que
  le PDF n'utilisait pas du tout (le PDF affichait la phrase narrative brute de CSM). Unifié via
  une constante partagée unique (§7).
- Le PDF affichait "undefined" pour les qualités non déterminables (§1.2) — rupture de lisibilité
  la plus grave trouvée (un praticien pourrait la lire comme une erreur logicielle, pas comme une
  information clinique).

---

## 12. Passerelle vers les 8 fiches qualité

Confirmé inchangé et déjà correct : la Synthèse clinique reste un résumé de niveau supérieur ;
chaque qualité individuelle continue d'avoir sa propre fiche détaillée (onglets
Fonctions/Résultats/Variables/Capacités) non remplacée par cette synthèse. Aucune modification
nécessaire ici — la mission demandait de préserver ce rôle de passerelle, pas de l'implémenter
(déjà en place).

---

## 13. Aucune réintroduction de classement/score

Confirmé : aucune des modifications n'introduit de tri, de score global ou de hiérarchisation
nouvelle entre qualités. `csm.objectified`, `csm.nonDeterminable`, `csm.explanatoryHypotheses`
et `relationships` sont affichés dans leur ordre natif (celui déjà produit par
`computeHypClinicalSynthesis01`), jamais re-triés par la couche de présentation.
`statusPriorityRank()` et `priorities` ne sont ni lus ni référencés dans le rendu de la Synthèse
clinique (onglet UI, PDF sportif, PDF expert) — vérifié par lecture du diff (§9) : aucune des
zones modifiées n'appelle ces symboles.

---

## 14. Scénarios de test — voir §8 (tests ajoutés) et le fichier dédié

Voir `tests/hypCsmSynthesisPresentation.test.js` pour le détail des scénarios exécutés (18 tests).

---

## 15–17. Objectif de lisibilité et périmètre des changements autorisés

Tous les changements effectués (détaillés en §7 et dans `IMPLEMENTATION_SYNTHESE_CLINIQUE_UI_PDF.md`)
sont strictement de nature : texte affiché, regroupement, séparation de blocs, garde-fou de rendu
null/undefined. Aucun changement de raisonnement, de seuil, de calcul ou de tri.

---

## 18. Tests

`tests/hypCsmSynthesisPresentation.test.js` — 18 tests couvrant : traduction `CSM_STATE_LABEL`
(pas de fuite d'enum interne), absence de "undefined" dans les deux PDF, présence de "Non
déterminable" pour une qualité non déterminable, séparation effective des blocs "Relations
explicatives possibles" / "Concordances (sans relation documentée)", absence de causalité affirmée
("X cause Y" jamais généré), unicité de la définition de `CSM_STATE_LABEL` et son usage partagé par
les deux fonctions PDF, pureté de `computeMoteur()` (non-régression HYP/CSM), non-régression de
l'ordre `priorities` (rouge toujours avant orange).

## 19. Non-régression

- Suite complète : 29 fichiers `tests/*.test.js` (28 préexistants + 1 nouveau), **0 échec**.
- `node --check` sur le bloc `<script>` extrait : `SYNTAX_OK`.
- Test de pureté dédié : deux appels identiques à `computeMoteur()` sur les mêmes données
  produisent un `clinicalSynthesis` et un `priorities` strictement identiques (JSON égal).

## 20. Capture/vérification du rendu réel

Vérifié par génération + capture d'écran Playwright, à deux reprises (avant/après chaque correctif) :
`csm_rich_pdf_full_v2.png`/`crop1_v2.png` (PDF sportif, après correctif) et
`csm_rich_pdf_expert_v3.png`/`expert_crop_v3.png` (PDF expert, après correctif) — dans les deux cas,
badges corrects, phrase de déficits en français clinique, sections "Relations explicatives
possibles" et "Concordances (sans relation documentée)" visuellement distinctes, "Non déterminable"
affiché proprement pour les qualités sans support suffisant.

## 21. Limites de cet audit/optimisation

- N'a pas revisité la question, déjà tranchée dans `AUDIT_COHERENCE_NARRATIVE_CSM_VS_LEGACY.md`, de
  savoir si `causalSteps` (limité à 2 qualités) devrait un jour être remplacé par CSM — hors
  périmètre de cette mission (présentation uniquement de la Synthèse clinique elle-même).
- La vue `AnalyseView` ("Le Fil de Raisonnement", gauge-list `SL[status]` ~ligne 7977) présente un
  risque résiduel mineur similaire (valeur `undefined` sans garde) mais rend un blanc, pas le texte
  "undefined" — jugé hors du périmètre strict "Synthèse clinique" de cette mission, signalé et non
  modifié.
- L'occurrence `ord[status]||0` de `HistoriqueView` (`index.html:8528`, déjà documentée dans
  `FIX_PRIORITIES_STATUS_RANKING.md`) reste non modifiée — mécanisme différent, hors périmètre de
  cette mission également.

## 22. Décision

**Modifications de présentation justifiées et effectuées** (pas de simple embellissement) : les
deux bugs "undefined" auraient pu être lus par le praticien comme un dysfonctionnement logiciel
plutôt qu'une information clinique (non déterminable), et le mélange concordance/relation
explicative contrevenait directement à l'exigence explicite de la mission de ne jamais confondre
ces deux registres de preuve. Le détail technique de chaque changement est documenté dans
`IMPLEMENTATION_SYNTHESE_CLINIQUE_UI_PDF.md`.

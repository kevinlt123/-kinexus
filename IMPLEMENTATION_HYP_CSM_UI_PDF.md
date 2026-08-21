# Implémentation — Branchement de HYP-CSM-01 à l'UI et au PDF

## Statut

Branchement pur — `computeHypClinicalSynthesis01` **n'a reçu aucune modification**. `index.html` :
**+70/-2 lignes** (`git diff --stat`), les 2 lignes remplacées sont (a) le `return` de
`computeMoteur()` (ajout d'un seul champ `clinicalSynthesis`) et (b) le tableau `tabs` de
`ExpertView` (ajout d'une seule entrée `['synthese','Synthèse clinique']`) — tout le reste est
additif. Aucun seuil, aucune norme, aucune règle de convergence, aucun état HYP, aucune relation
HYP, `HYP_QUALITY_RELATIONS` : non modifiés. 27 fichiers `tests/*.test.js` (26 préexistants + 1
nouveau), 0 échec.

---

## 1. Architecture avant

```
8 HYP ──► fSc (functionScores) ──► computeMoteur() return { functionScores, priorities, ... }
                                            │
                                            ├─► UI (ExpertView : Fonctions/Capacités/Hypothèses/...)
                                            └─► PDF (buildSportifReport/buildExpertReport :
                                                     résumé, priorités, chaîne causale, "Pourquoi ?")

computeHypClinicalSynthesis01(functionScores) : fonction pure, définie, testée (22+9 tests),
JAMAIS appelée depuis computeMoteur() ni depuis aucun consommateur UI/PDF.
```

## 2. Architecture après

```
8 HYP ──► fSc ──► computeHypClinicalSynthesis01(fSc) [UNE SEULE FOIS, fin de computeMoteur()]
                            │                                    │
                            │                                    ▼
                            │                          clinicalSynthesis
                            │                                    │
                            ▼                                    ▼
                  computeMoteur() return { ..., clinicalSynthesis }
                            │                                    │
              ┌─────────────┴──────────┐            ┌────────────┴────────────┐
              ▼                        ▼            ▼                         ▼
   UI existante (inchangée)   UI : nouvel onglet   PDF sportif : nouvelle   PDF expert : nouvelle
   Fonctions/Capacités/...    "Synthèse clinique"  section "Synthèse       section "Synthèse
                              (ExpertView)          clinique" (page 1,      clinique" (page 1,
                                                     après les priorités)   après le tableau
                                                                            Fonctions évaluées)
```

Les diagnostics individuels (`fSc[quality]`, onglets Fonctions/Capacités/Hypothèses, tableau
"Fonctions évaluées" du PDF expert) restent **strictement inchangés** — aucun n'a été retiré,
remplacé ou masqué.

## 3. Point de branchement

`computeMoteur()`, juste avant son `return`, **après** que les 8 blocs de remplacement HYP aient
tous écrit dans `fSc` (donc après le dernier `fSc['Endurance']=...`) :

```js
var clinicalSynthesis=computeHypClinicalSynthesis01(fSc);
return{functionScores:fSc, ..., clinicalSynthesis:clinicalSynthesis};
```

C'est le point le plus sûr identifié (Partie 1/2 de la mission) : `fSc` y est garanti complet et
définitif (plus aucune écriture ne le modifie ensuite), et `computeMoteur()` est le seul endroit du
code qui produit `functionScores` — brancher ailleurs (UI ou PDF) aurait obligé chaque consommateur
à appeler `computeHypClinicalSynthesis01` séparément, avec risque de calculs multiples (interdit
par la mission §17) ou d'appels sur un `fSc` incomplet.

## 4. Données consommées par CSM

Exactement `fSc` (alias `functionScores`), rien d'autre — **inchangé par rapport à l'appel déjà
utilisé par les 31 tests CSM/migration préexistants**. CSM ne lit jamais `testData`, `TFM`,
`VAR_REL3`, `capaciteScores`, `priorities`. Vérifié structurellement (aucun de ces objets n'apparaît
dans la signature ni le corps de `computeHypClinicalSynthesis01`, non modifié) et par test (CAS
"Cohérence des 8 moteurs HYP" de `tests/hypClinicalSynthesisUI.test.js` : `fSc` byte-identique
avant/après lecture de `clinicalSynthesis`).

## 5. Intégration UI

Nouvel onglet **"Synthèse clinique"** dans `ExpertView` (entre "Fonctions" et "Résultats"). Contenu,
en 4 blocs, mappés directement sur les Parties 5/9 de la mission :
1. **Qualités objectivement déficitaires** — badge de statut (réutilise `Badge`/`SC` déjà existants)
   + nom de qualité + état lisible (`CSM_STATE_LABEL`, nouvelle table de libellés français
   purement présentationnelle : `retenue_faible → "Confirmée — support faible"`, etc. — ne
   modifie aucune valeur, ne fait que traduire ce que `state` contient déjà).
2. **Qualités non déterminables** — liste simple, avec rappel explicite "non déterminable
   n'équivaut jamais à normal" (texte fixe, reprend le principe déjà documenté dans
   `csm.limitations`).
3. **Concordances et relations explicatives** — reprend mot pour mot `csm.narrative.relationsExplicatives`.
4. **Limites de cette synthèse** — reprend mot pour mot `csm.limitations` (liste à puces).

Aucun onglet existant modifié. Aucun champ CSM reformulé au-delà d'un habillage visuel (badge/carte)
— les phrases affichées sont celles produites par `computeHypClinicalSynthesisNarrative`, non
réécrites.

## 6. Intégration PDF

**Rapport sportif** (`buildSportifReport`) : nouvelle section 4 "Synthèse clinique", page 1, juste
après la section 3 "Priorités d'intervention" et juste avant le pied de page — conforme à la
recommandation de la mission ("après le profil global / avant le détail des qualités", le détail
par qualité vivant page 2 "Qualités fonctionnelles"). Réutilise les helpers déjà définis dans la
fonction (`sectionTitle`, `panel`, `badge`) — aucun nouveau système de style introduit.

**Rapport expert** (`buildExpertReport`) : nouvelle section "Synthèse clinique", page 1, juste après
le tableau "Fonctions évaluées" (les diagnostics détaillés par qualité) — la synthèse complète le
tableau immédiatement après lui plutôt que de l'attendre en page 3, cohérent avec la structure déjà
plus compacte de ce rapport (pas de page dédiée "profil global" séparée du tableau dans ce type de
rapport).

Contenu identique dans les deux rapports : badges `objectified` + les 4 champs de
`csm.narrative` (`deficitsObjectives`/`qualitesNonDeterminables`/`relationsExplicatives`/`limites`),
sans reformulation. Vérifié visuellement (capture d'écran, rapport sportif, scénario Force+Puissance
déficitaires) — la section s'insère proprement dans la mise en page existante, aucun débordement,
aucun élément existant déplacé ou masqué.

## 7. Gestion des diagnostics individuels

Non touchés. `fSc[quality].status` reste la seule source consultée par les onglets
Fonctions/Capacités/Hypothèses et par le tableau "Fonctions évaluées" du PDF expert — CSM ne les
duplique ni ne les recalcule ; il les **synthétise** dans une section séparée, clairement
identifiée, jamais fusionnée avec eux.

## 8. Gestion du `non_determinable`

Aucune transformation. `csm.nonDeterminable` (déjà produit tel quel par le moteur, non modifié)
est affiché séparément de `csm.objectified`, jamais fusionné, avec le rappel explicite "non
déterminable n'équivaut jamais à normal" reproduit dans l'UI. Vérifié par test (CAS 4/8/9 de
`tests/hypClinicalSynthesisUI.test.js`) : aucune qualité `non_determinable` n'apparaît dans
`objectified`, aucune occurrence de `"Puissance ... déficitaire"` ni `"... est normal"` dans le
texte PDF généré pour ces scénarios.

## 9. Gestion des relations

Aucune transformation. `csm.explanatoryHypotheses`/`csm.relationships` sont affichés uniquement via
`csm.narrative.relationsExplicatives`, déjà produit par le moteur avec la formulation prudente
existante ("hypothèse explicative... sans en établir la cause" / "déficits concordants... aucune
relation explicative documentée"). Aucune formulation causale ("entraîne", "est responsable de",
"cause principale de") n'a été ajoutée à aucun endroit du branchement — vérifié par test regex sur
la sortie PDF complète pour 6 scénarios différents (CAS 2/3/4/7/9/10).

## 10. Séparation HYP / TFM

Non affectée par cette mission (déjà traitée par la migration partielle précédente). La nouvelle
section "Synthèse clinique" ne lit que `fSc`/`clinicalSynthesis` (100 % HYP) — elle n'introduit
aucun nouveau point de contact avec `TFM`/`VAR_REL3`/`capaciteScores`. L'onglet Capacités n'a pas
été touché (toujours présent, toujours étiqueté "information secondaire" depuis la mission
précédente).

## 11. Anciennes narrations remplacées

Aucune. Décision retenue (Partie 12 de la mission), documentée explicitement pour chaque
mécanisme :

| Mécanisme | Décision | Justification |
|---|---|---|
| `hypothese`/`contributeurPrincipal` ("Pourquoi ?", "Priorité principale") | **C — reste information secondaire** | Déjà gouverné par HYP depuis la migration précédente (gate sur `fSc.status`, rôle HYP vérifié pour le contributeur) ; répond à une question que CSM ne couvre pas (quel système anatomique) — le remplacer romprait une information utile sans que CSM puisse la reproduire |
| `priorities` (rang/orientation/tests de suivi/critère de sortie RTP) | **C — reste information secondaire** | Structure opérationnelle (plan de prise en charge, suivi RTP) hors du périmètre de CSM (synthèse diagnostique, pas plan de traitement) |
| `causalSteps`/`conclusion`/`consequences` (`buildMultiQualityNarrative`, page "Pourquoi ? Où ?"/"Avis clinique") | **C — reste information secondaire, coexiste avec CSM** | Déjà non-causaliste (mission de normalisation antérieure) et intégrée à la mise en page existante (frise "Avis clinique") ; la remplacer par CSM aurait exigé de réorganiser une page entière du PDF — hors du périmètre strict "brancher, ne pas modifier le raisonnement/la structure sauf nécessité" de cette mission. CSM apparaît juste en dessous (section 4), en complément, pas en remplacement |
| Onglet **Hypothèses** (écran) | **C — reste information secondaire** | Même mécanisme que `hypothese`/`contributeurPrincipal`, déjà gouverné par HYP |
| Onglet **Capacités** (écran) | **C — reste information secondaire** (inchangé depuis la mission précédente) | TFM/VAR_REL3, déjà clairement distingué du diagnostic HYP |

Aucun mécanisme n'est classé **A** (remplacé) ou **D** (rendu inutilisé) dans cette mission — la
mission demande explicitement de ne pas supprimer brutalement, et le périmètre strict
("implémenter uniquement le branchement") ne justifie pas une réorganisation plus large sans
validation du praticien.

## 12. Choix des informations affichées

Conforme à la Partie 13 de la mission : aucun `hypId`/`csmId`, aucun poids TFM, aucun nom de
fonction technique n'est exposé dans l'UI ou le PDF. Seuls sont affichés : nom de qualité (déjà
utilisé partout ailleurs dans l'app), statut coloré (`vert`/`jaune`/`orange`/`rouge`, déjà le
vocabulaire visuel de toute l'application), état en français (nouvelle table de libellés,
présentationnelle uniquement), et les phrases narratives déjà rédigées par le moteur.

## 13. Tests

`tests/hypClinicalSynthesisUI.test.js` — 13 tests :
- Présence et pureté de `clinicalSynthesis` (identique à un appel direct, calculé une seule fois,
  ne modifie jamais `fSc`).
- Les 10 CAS mandatés (Partie 14) : synthèse neutre, Force seule, Force+Puissance avec hypothèse
  explicative, Force+Puissance-non-déterminable sans relation inventée, Absorption+Stabilisation
  sans relation (étanchéité respectée), Réactivité seule, multi-déficits sans hiérarchie,
  non-déterminable jamais "normal", TFM-rouge/HYP-non-déterminable absent de la synthèse, relation
  TFM sans le second diagnostic HYP jamais présentée comme causale.
- Cohérence UI/PDF : le rapport expert ne mentionne jamais une qualité non déterminable comme
  déficitaire dans sa section Synthèse clinique.

Tous verts. `tests/tfmHypCsmMigration.test.js` (mission précédente, 9 tests) et
`tests/hypClinicalSynthesis01.test.js` (22 tests) : inchangés, toujours verts, non dupliqués ici.

## 14. Non-régression

`node --check` (extraction `<script>`) : `SYNTAX_OK`. 27 fichiers `tests/*.test.js` (26
préexistants + le nouveau) : **0 échec**. `git diff --stat -- index.html` : +70/-2, les 2 lignes
remplacées correspondent exactement aux 2 points d'intégration (`return` de `computeMoteur()`,
tableau `tabs` de `ExpertView`) — aucune ligne des 8 `computeHypXxx01`, de
`computeHypClinicalSynthesis01`, de `HYP_QUALITY_RELATIONS`, de `TFM`/`VAR_REL3`/`THRESHOLDS`/
`NORMS` modifiée. Vérification visuelle : capture d'écran du PDF sportif généré (scénario Force +
Puissance déficitaires) confirmant que la section 4 "Synthèse clinique" s'insère proprement, sans
chevauchement ni régression de mise en page sur les sections 1-3 existantes.

## 15. Limitations restantes

- La nouvelle section CSM (UI et PDF) est **additive** — elle coexiste avec `hypothese`/
  `contributeurPrincipal`/`causalSteps`, qui restent la source des pages "Pourquoi ? Où ?"/"Avis
  clinique"/onglet Hypothèses. Une consolidation plus poussée (faire de CSM la source **unique** de
  toute narration multi-qualités, au-delà de la simple coexistence) est une décision de conception
  plus large, non tranchée ici (mission §12, décision C retenue pour tous les mécanismes existants).
- Le rapport "Mouvement" (page 3, analyse CMJ biomécanique) n'a pas été touché — il repose sur un
  système d'analyse distinct (`computeMouvementAnalysis`), hors périmètre HYP/CSM.
- Aucun test de rendu React réel (jsdom/DOM) n'a été ajouté pour l'onglet "Synthèse clinique" —
  conforme à la convention déjà en vigueur dans ce dépôt (aucun fichier `tests/*.test.js` existant
  ne rend de composant React ; tous testent les fonctions de calcul pures et, pour le PDF, les
  chaînes HTML produites par les fonctions `build*Report`). Vérification visuelle effectuée via
  capture d'écran du PDF (§14) ; l'onglet UI partage strictement les mêmes composants
  (`Card`/`Badge`) et le même flux de données que les onglets déjà en production.
- Collision `HYP-CSM-01` (Partie 19 de la mission) : décision de travail confirmée (conserver
  `HYP-CSM-01` pour la synthèse multi-qualités) — aucune collision technique active trouvée dans le
  code lui-même (la collision reste documentaire, entre `HYP_ARCHITECTURE_FREEZE.md`/
  `DECISION_MEMO_CSM.md` et `IMPLEMENTATION_HYP_CSM01.md`, déjà consignée dans les deux audits
  précédents) — aucune référence à modifier n'a été trouvée nécessitant une action dans cette
  mission.

---

## DECISIONS_RESTANT_A_VALIDER

Aucune modification clinique n'a semblé nécessaire pour ce branchement — cette section reste vide
de ce point de vue. Décisions de conception, non cliniques, restant à la main du praticien :

1. Faut-il, à terme, faire converger `hypothese`/`contributeurPrincipal`/`causalSteps` vers CSM
   comme source unique de la narration multi-qualités (au lieu de coexister) ? Nécessiterait une
   mission dédiée de réorganisation du PDF, hors périmètre de celle-ci.
2. Le renommage final de `capaciteScores` (mission de migration précédente, toujours non tranché).
3. La collision d'identifiant `HYP-CSM-01` (renommage éventuel du moteur de synthèse ou réservation
   d'un nouvel identifiant pour l'ancien "Contrôle Sensori-Moteur" suspendu) — toujours non
   tranchée, aucune action requise dans l'immédiat.

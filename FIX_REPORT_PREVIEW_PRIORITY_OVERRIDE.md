# FIX_REPORT_PREVIEW_PRIORITY_OVERRIDE — Correction du parcours « Aperçu du rapport »

Date : 2026-08-21
Branche : `claude/rapport-visuel-tp5afc` (issue de la fusion PR #2 dans `main`, commit `7eb63ca`)

## 1. Reproduction

Un test du parcours utilisateur réel sur `main` (bilan → Analyse → **👁 Aperçu du rapport**) a
montré que l'aperçu affichait systématiquement :

> **🎯 Priorité principale → Cheville**

alors même que le bilan n'avait subi aucune édition, et que Mobilité et Absorption étaient
toutes deux objectivées **Critique** (égalité de sévérité) — cas dans lequel le rapport doit
afficher le titre neutre **« Déficits objectivés »** listant toutes les qualités concernées,
sans en désigner une seule.

Le bouton de téléchargement direct (**⬇ Rapport PDF → Télécharger**, sans passer par l'aperçu)
affichait, lui, correctement « Déficits objectivés ». Seul le chemin « Aperçu du rapport »
était affecté.

## 2. Cause

`ReportPreview` (`index.html`, ~L7697) construit, dès son premier rendu, un objet
`reportOverrides.priorities` à partir de `res.priorities` par défaut (`initialPriorities()`,
`currentOverrides()`), et le transmet immédiatement à `buildFullReportHtml` via `previewBilan`
— **même si le praticien n'a rien modifié ni enregistré**.

Le rapport (`buildSportifReport`/`buildExpertReport`, ~L6811) interprète la simple présence de
cet objet comme la preuve d'une décision clinique explicite :

```js
var prioCardOverridden = reportOv.priorities != null;   // toujours vrai depuis ReportPreview
var prioCardTitle = prioCardOverridden ? 'Priorité principale' : 'Déficits objectivés';
```

Résultat : le chemin « neutre » (`Déficits objectivés`, plusieurs qualités à égalité) était
mathématiquement inatteignable via l'aperçu — `prioCardOverridden` valait toujours `true`, quel
que soit le bilan.

## 3. Correction

Une seule distinction ajoutée dans `ReportPreview` : **priorité automatique ≠ priorité
explicitement choisie par le praticien**.

- Nouvel état `prioritiesTouched` (`useState(false)`), mis à `true` uniquement par une action
  réelle du praticien sur les priorités (`updatePriority`, `removePriority`, `addPriority`,
  `movePriority` — édition, ajout, suppression, réordonnancement).
- `savedHasExplicitPriorities` : vrai si le bilan porte déjà une décision enregistrée lors
  d'une session précédente (`bilan.reportOverrides.priorities != null`).
- `renderOverrides` = les overrides complets **seulement si** `prioritiesTouched ||
  savedHasExplicitPriorities` ; sinon, une copie sans la clé `priorities` (`undefined`), pour
  que `reportOv.priorities != null` redevienne `false` côté rapport.
- `previewBilan` (l'iframe d'aperçu), `handleDownload` (bouton Télécharger de l'aperçu) et
  `handleSave` (bouton Enregistrer) utilisent tous les trois `renderOverrides` — plus jamais un
  objet `priorities` fabriqué automatiquement.

Aucune autre logique n'est modifiée : le mécanisme d'enregistrement d'une décision explicite du
praticien reste intact et pleinement fonctionnel (voir CAS 5).

**Diff exact** (`index.html`, fonction `ReportPreview` uniquement) :
- +1 état (`prioritiesTouched`)
- +1 ligne `setPrioritiesTouched(true)` dans chacun des 4 mutateurs de priorités
- +2 variables dérivées (`savedHasExplicitPriorities`, `renderOverrides`)
- `previewBilan`/`handleSave` pointent vers `renderOverrides` au lieu de `overridesForPreview`

Aucune ligne des moteurs HYP, de CSM, de TFM, de VAR_REL3, de `HYP_QUALITY_RELATIONS`, des
seuils, normes, règles de convergence, diagnostics, relations cliniques ou de la construction de
`priorities` (`computeMoteur`) n'a été touchée — confirmé par diff exhaustif du script extrait
(voir §6).

## 4. Distinction priorité automatique / priorité praticien — comportement final

| Situation | `prioritiesTouched` | `savedHasExplicitPriorities` | Titre affiché |
|---|---|---|---|
| Aperçu ouvert, aucune édition | `false` | `false` | **Déficits objectivés** (toutes les qualités à égalité) |
| Praticien édite/réordonne une priorité (session en cours, non enregistrée) | `true` | `false` | **Priorité principale** (reflète l'édition en cours, visible en direct dans l'aperçu) |
| Décision déjà enregistrée lors d'une session précédente | `false` (nouvelle session) | `true` | **Priorité principale** (décision respectée) |
| Bouton direct « Rapport PDF » (bilan brut, sans passer par l'aperçu) | n/a | dépend de `bilan.reportOverrides` réel | Inchangé — jamais affecté par ce bug |

## 5. Cas testés

Suite dédiée : `tests/reportPreviewPriorityOverride.test.js` — exerce le **vrai composant
`ReportPreview`** (hooks React réels via un mini moteur de rendu à état persistant : clics et
saisies passent par les véritables gestionnaires `onClick`/`onChange` du composant, pas par un
appel direct à une fonction isolée), conformément à la mission.

| Cas | Attendu | Résultat |
|---|---|---|
| 1 — Mobilité + Absorption, même sévérité critique, aucune édition | « Déficits objectivés » avec les deux qualités, jamais « Priorité principale » | ✅ |
| 2 — Force + Puissance + Stabilisation, même sévérité, aucune édition | Les 3 à égalité, aucun classement 1/2/3 | ✅ |
| 3 — Une seule qualité objectivée, aucune édition | « Déficits objectivés » (pas transformé en « Priorité principale ») | ✅ |
| 4 — Aucune qualité objectivée | Aucune « Priorité principale » | ✅ |
| 5 — Édition réelle d'une priorité (via les vrais handlers) + enregistrement | « Priorité principale » apparaît, se sauvegarde, et est respectée à la ré-ouverture | ✅ |
| 6 — Aperçu → Télécharger, sans édition, vs bouton direct | Les deux PDF sont produits par le même code (`buildFullReportHtml`) avec des overrides strictement équivalents | ✅ |
| Non-régression | `functionScores`/`clinicalSynthesis`/`priorities` inchangés après ouverture de l'aperçu | ✅ |

Résultat : **7/7 tests dédiés passent.**

## 6. Vérification navigateur

Parcours réel exécuté dans Chromium (Playwright), sur `main` corrigé localement, avec le
scénario riche déjà utilisé lors de l'audit pré-fusion (Léo Fournier, 12 tests, Mobilité et
Absorption critiques) :

**bilan → Analyse → Aperçu du rapport → Télécharger**, comparé à **bilan → Analyse → Rapport
PDF → Télécharger (Sportif)** (bouton direct) :

```
preview iframe contains "Priorité principale": false
preview iframe contains "Déficits objectivés": true
downloaded-from-preview contains "Priorité principale": false
downloaded-from-direct contains "Priorité principale": false
downloaded-from-preview === downloaded-from-direct (byte identical): true
```

Les deux fichiers HTML téléchargés (aperçu vs bouton direct) sont **strictement identiques
octet pour octet** quand aucune priorité n'a été explicitement enregistrée — exactement le
comportement demandé au CAS 6.

Scénario CAS 5 (édition réelle + enregistrement), même parcours navigateur :

```
après édition réelle — contient "Priorité principale": true
après édition réelle — contient le libellé édité: true
reportOverrides.priorities persisté après Enregistrer: "Cheville (décision clinique réelle du praticien)"
```

Le mécanisme d'enregistrement d'une décision explicite du praticien fonctionne toujours
correctement, en temps réel et après sauvegarde.

Aucune erreur JavaScript de l'application pendant ce parcours (les 3 erreurs console restantes
— `fonts.googleapis.com`, `favicon.ico` — sont des artefacts du bac à sable réseau local, déjà
identifiés lors du contrôle de déploiement précédent, sans rapport avec le code).

## 7. Suite de tests complète

**36/36 fichiers de tests passent** (`node tests/*.test.js`), incluant le nouveau
`reportPreviewPriorityOverride.test.js` et les 35 fichiers existants (aucune régression).

## 8. Non-régression clinique

Le script extrait d'`index.html` a été comparé littéralement avant/après correction : le diff
est confiné exactement au bloc `ReportPreview` (état `prioritiesTouched`, 4 appels
`setPrioritiesTouched(true)`, `renderOverrides`, et le branchement de `previewBilan`/
`handleSave` sur `renderOverrides`) — aucune autre ligne du fichier n'a changé.

`computeMoteur()` a été exécuté sur le même scénario avant/après correction, et sa sortie
(`functionScores`, `clinicalSynthesis`, `priorities`) ainsi que `HYP_QUALITY_RELATIONS` ont été
sérialisés et comparés :

```
diff FIX_res.json FIX2_res.json
→ aucune différence (fichiers strictement identiques)
```

Le rapport produit par le bouton de téléchargement direct (`buildFullReportHtml` appelé sur le
bilan brut, sans passer par `ReportPreview`) est également **strictement identique octet pour
octet** avant/après correction — confirmant que cette correction n'affecte que le chemin
« Aperçu du rapport », rien d'autre.

Cette correction ne touche : ni HYP (les 8 moteurs), ni CSM, ni TFM, ni VAR_REL3, ni
`HYP_QUALITY_RELATIONS`, ni les seuils, ni les normes, ni les règles de convergence, ni les
diagnostics, ni les relations cliniques, ni la construction clinique de `priorities`
(`computeMoteur`). Le mécanisme permettant au praticien d'enregistrer une décision explicite
n'a pas été supprimé — il a été rendu fiable (il ne se déclenche plus par accident).

## Verdict final

🟢 **PRÊT POUR VALIDATION TERRAIN**

La divergence entre les deux chemins de génération du rapport est corrigée et vérifiée
exhaustivement (composant React réel, navigateur réel, comparaison octet à octet des deux
chemins de téléchargement, suite de tests complète, non-régression clinique confirmée). Kinexus
V1 peut être considéré comme gelé de nouveau — aucune nouvelle amélioration ne doit être
ajoutée avant validation terrain.

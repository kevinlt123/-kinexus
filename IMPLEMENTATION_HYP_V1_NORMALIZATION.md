# Implémentation — Normalisation architecturale HYP V1

**Statut** : implémentée en production dans `index.html`. Réponse aux 3 problèmes identifiés par
`AUDIT_TRANSVERSAL_HYP_V1.md` (contrat de sortie hétérogène, contradiction HYP/TFM pour 3 qualités,
causalité TFM non fondée dans le rapport). **Aucune règle clinique, aucun seuil, aucune règle de
convergence, aucune variable diagnostique modifiée** — voir §« Absence de modification des règles
cliniques » ci-dessous pour la vérification explicite.

---

## Fichiers modifiés

- **`index.html`** (+342/-112 lignes) — seul fichier de production modifié.
- **`tests/hypAbsorption01.test.js`** — 1 assertion mise à jour (repli TFM devenu obsolète, cf.
  ci-dessous).
- **`tests/hypReactivity01.test.js`** — 1 assertion mise à jour (idem).
- **`tests/hypMobility01.test.js`** — 2 assertions mises à jour (idem).

## Fichiers créés

- **`tests/hypV1Normalization.test.js`** — 26 tests dédiés à cette normalisation.
- **`HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md`**.
- Ce document.

---

## Fonctions modifiées

### Nouvelles fonctions (additions pures, aucune logique préexistante retirée)

| Fonction | Rôle |
|---|---|
| `hypStatusFromState(state, deficientCategories)` | Dérive `status` (vert/jaune/orange/rouge/null) à partir de `state` — centralise une formule auparavant dupliquée, à l'identique, dans chaque bloc d'intégration de `computeMoteur()`. |
| `HYP_QUALITY_RELATIONS` / `findHypQualityRelation(a,b)` | Registre des 8 relations qualité-à-qualité déjà codées dans les moteurs HYP (transcription, aucune invention). |
| `buildMultiQualityNarrative(pri)` | Construit la narration multi-qualités (association/hypothèse explicative), remplace l'ancienne logique causale dupliquée à 3 endroits. |

### Fonctions modifiées (additions de champs de contrat, comportement clinique inchangé)

`computeHypAbsorption01`, `computeHypReactivity01`, `computeHypMobility01`, `computeHypPower01`,
`computeHypForce01`, `computeHypExplosivity01`, `computeHypStabilization01`,
`computeHypEndurance01` — chacune reçoit les champs `quality`/`status`/`diagnostic`/`confirmative`/
`explanatory`/`limitations` en plus de ses champs historiques (jamais retirés). Aucune modification
de la logique de calcul de `state`/`support`/`convergence`/`diagnosticEvidence`/
`confirmativeEvidence`/`explanatoryEvidence` dans aucune des 8 fonctions.

### `computeMoteur()` — blocs d'intégration modifiés

| Qualité | Avant | Après |
|---|---|---|
| Absorption | `if(niveau1!=='non_determinable'){...}else if(fSc['Absorption']){/* repli TFM conservé */}` | Remplacement intégral, `status:hypAbs01.status` (null si non_determinable), `tfmFallback` conservé séparément |
| Réactivité | `if(dataAvailable){...}else if(fSc['Réactivité']){/* repli TFM conservé */}` | Remplacement intégral, `status:hypRea01.status` (null si `!dataAvailable`), `tfmFallback` conservé |
| Mobilité | idem | idem, `status:hypMob01.status` |
| Puissance/Force/Explosivité/Stabilisation/Endurance | Formule de dérivation du statut recalculée inline | **Inchangé structurellement** — la formule inline reste en place (risque de régression minimisé), mais elle produit désormais exactement la même valeur que `hypXxx01.status` (vérifié par test dédié) |

---

## Comportement avant / après

### Contrat de sortie

**Avant** : Absorption seule sans `hypId`/`state`/`support`/`convergence` structuré ; les 7 autres
moteurs partageaient un schéma proche mais non formalisé, avec des variantes mineures (Mobilité
sans `distinctMechanismsObserved`/`thresholdMet`/`mechanismsInvolved` dans `convergence`).

**Après** : les 8 moteurs exposent `hypId`/`quality`/`state`/`status`/`support`/`convergence`/
`diagnostic`/`confirmative`/`explanatory`/`precision`/`limitations`. Absorption expose en plus
`niveau1`/`profilCore`/`sousDomaines`/`asymetrie` (inchangés, jamais retirés — voir §« Cas
Absorption »).

### Source de vérité (Absorption/Réactivité/Mobilité)

**Avant** : `fSc[fn].status` pouvait être un score TFM générique sans rapport avec la conclusion du
moteur HYP, y compris quand ce dernier disait explicitement « absente »/« aucune donnée ».
Reproduit et documenté dans `AUDIT_TRANSVERSAL_HYP_V1.md` §6 (`hypRea01.state==='absente'`,
`dataAvailable:false`, mais `fSc['Réactivité'].status==='orange'`).

**Après** : `fSc[fn].status` est **toujours** `hypXxx01.status` — `null` explicite quand HYP n'a
rien à dire, jamais un repli TFM contradictoire. Le résultat TFM générique reste calculé et exposé
sous `fSc[fn].tfmFallback` (nouveau champ), jamais supprimé.

### `priorities` / narration causale

**Avant** : `defaultReportTexts()`, `buildSportifReport()` (page rapport PDF) et le composant React
d'écran (« Chaîne causale principale ») construisaient chacun, indépendamment, une phrase du type
*« Le déficit de X entraîne une altération de la capacité de Y »* à partir des 2 premières entrées
de `priorities` (classement TFM), sans jamais vérifier qu'une relation existe réellement entre elles
ni consulter `state`/`support` d'aucun moteur HYP.

**Après** : les trois consommateurs appellent `buildMultiQualityNarrative(pri)` :
- 1 seule qualité déficitaire → simple constat, aucune narration inter-qualités.
- ≥2 qualités déficitaires, relation `HYP_QUALITY_RELATIONS` documentée entre les deux premières →
  *« Le déficit de X peut constituer une hypothèse explicative compatible avec le déficit de Y,
  sans en établir la cause »* — jamais « entraîne »/« cause ».
- ≥2 qualités déficitaires, aucune relation documentée → *« X et Y présentent des déficits
  concordants »* — association neutre uniquement.
- 3ᵉ priorité éventuelle : jamais chaînée causalement aux deux premières (« Déficit concordant »
  uniquement, jamais « Répercussion sur »).

**Effet indirect important, vérifié empiriquement** : comme `fSc[fn].status` est désormais
garanti HYP-fidèle pour les 8 qualités (correction ci-dessus), `priorities` (qui filtre sur
`fSc[fn].status==='rouge'||'orange'`) ne peut plus jamais inclure une qualité HYP sans preuve réelle
— le cas concret de l'audit (Réactivité en tête de rapport alors que son moteur dit « absente,
aucune donnée ») est structurellement impossible désormais : Réactivité n'apparaît même plus dans
`priorities` dans ce cas (vérifié, `tests/hypV1Normalization.test.js`, section « PARTIE 13 »).

---

## Relations TFM — inventaire et décision

Conformément à la mission (« ne pas supprimer les relations TFM, ne pas les considérer comme
obsolètes sans audit ») :

| Système | Décision | Justification |
|---|---|---|
| `TFM` (poids test→qualité) | **Conservé intégralement, aucune ligne modifiée** | Continue d'alimenter la boucle générique de premier niveau (qualités non-HYP), `qualityScores`/`capaciteScores`, et `priorities` (`contributeurPrincipal`/`hypothese`/`orientation`). |
| `VAR_REL3` (283 variables, `explainedBy`/`explains`/`measures`/`estimates`) | **Conservé intégralement** | Continue d'alimenter `qualityScores`/`capaciteScores` et `deriveRootCauses` (`priorities[i].rootCauses`, champ déjà inerte car `rootCausesHTML` n'est appelée nulle part — constat pré-existant, non introduit par cette mission, non corrigé ici car hors périmètre). |
| `SYS_COMPENSATIONS` | **Conservé intégralement** | Continue d'alimenter `priorities[i].compensations`. |
| **Relation « X entraîne Y » entre 2 qualités, dérivée du seul classement `deficits`** | **Repositionnée** | Remplacée par `HYP_QUALITY_RELATIONS` (relations déjà codées dans les moteurs HYP, jamais des relations TFM brutes) + graduation association/hypothèse explicative. C'est la seule relation TFM effectivement retirée — elle n'était d'ailleurs pas une « relation TFM documentée » au sens propre, mais un artefact de tri (ordre de `FUNCTIONS`, poids, statut), sans variable ni preuve associée. |

Aucune relation TFM individuelle (poids test→qualité, `VAR_REL3.explainedBy`/`explains`) n'a été
supprimée, désactivée, ni modifiée.

---

## Cas Absorption (Partie 3 de la mission)

`niveau1` (raisonnement clinique original, `computeHypAbsorptionCore`) **n'a subi aucune
modification** — mêmes conditions (`evaluable`/`deficient`/seuils), mêmes 4 valeurs possibles.
`sousDomaines.A_core/B_capaciteExcentrique/C_strategie/D_absorptionReactive/E_receptionImpact`
inchangés — mêmes fonctions (`computeHypAbsorptionCapaciteEcc`/`Strategie`/`Reactive`/
`ReceptionImpact`), aucune ligne modifiée. `asymetrie` inchangé (`computeHypAbsorptionAsymetrie`,
non touchée).

Seul ajout : `state` (relabelage bijectif de `niveau1`), `status` (formule identique à celle
retirée de `computeMoteur`), `support:null` (honnête, jamais inventé), `convergence` (description
du même calcul déjà fait par `computeHypAbsorptionCore`), `diagnostic`/`confirmative`/`explanatory`
(alias des sous-domaines existants), `limitations` (transcription des commentaires déjà présents).

**Test dédié** (`tests/hypV1Normalization.test.js`, TEST 3) : vérifie que `niveau1`/`profilCore`
produisent exactement les mêmes valeurs pour les 2 cas de référence déjà documentés dans
`tests/hypAbsorption01.test.js` (`ok` et `deficitaire`), et que capacité excentrique/stratégie/DJ
RSI/TTS-SLLT restent lus à l'identique.

---

## Tests

### `tests/hypV1Normalization.test.js` — 26 tests, tous passants

Couvre : contrat commun sur les 8 moteurs (TEST 1) ; conservation des champs spécifiques existants
(TEST 2) ; normalisation Absorption sans changement clinique (TEST 3) ; HYP prioritaire sur TFM pour
Mobilité/Réactivité/Absorption (TEST 4/5/6) ; conservation du `tfmFallback` (TEST 4bis) ; Puissance/
Force/Explosivité restant `non_determinable` sans norme (TEST 7/8/9) ; Stabilisation/Endurance
inchangées (TEST 10/11) ; double rôle `cmj_conc_rfd` conservé (TEST 12) ; DJ/SLDJ toujours
diagnostiques de Réactivité uniquement (TEST 13) ; TTS Landing toujours diagnostique de
Stabilisation uniquement (TEST 14) ; isolation Force/Puissance/Explosivité/Endurance (TEST 15) ;
absence de double comptage diagnostique `iso_belt_squat_n` (TEST 16) ; cas de causalité spécifiques
de la mission Partie 13 (Réactivité absente n'apparaît plus dans `priorities`, Force+Puissance sans
« entraîne » automatique, relation documentée → hypothèse explicative jamais cause, absence de
relation → association uniquement, 1/0/3 qualités) ; non-régression de la structure complète de
`computeMoteur()`.

### Tests existants modifiés (comportement attendu, documenté, non silencieux)

`tests/hypAbsorption01.test.js` (1 test), `tests/hypReactivity01.test.js` (1 test),
`tests/hypMobility01.test.js` (2 tests) : ces 4 tests asservissaient explicitement l'ancien
comportement de repli TFM (`assert.strictEqual(r.functionScores[X], null)` quand aucun test actif,
ou vérification d'un repli implicite). Devenus obsolètes par la correction demandée en Partie 4/5/14
de la mission (« le TFM ne doit plus pouvoir contredire HYP »). Mis à jour pour vérifier le nouveau
comportement correct : objet toujours produit (jamais littéralement `null`, comme les 5 autres
moteurs « remplacement intégral »), `status:null` explicite, `tfmFallback` exposé séparément.

### Suite complète

**24 fichiers de tests, tous passants** (23 préexistants + 1 nouveau). Vérification syntaxique
complète du contenu `<script>` d'`index.html` (`node --check`) — **OK**.

---

## Non-régression

- Tous les tests HYP existants (8 fichiers `hypXxx01.test.js`) — passants, avec les 4 mises à jour
  documentées ci-dessus (conséquence attendue et exigée par la mission, pas une régression).
- Tous les tests historiques (`moteur*.test.js`, `mouvementAnalysis.test.js`,
  `rapportMouvementPDF.test.js`, `filDeRaisonnement.test.js`, `syntheseExperteKinexus.test.js`,
  `biomechanicalProfileEngine.test.js`, `importForceDecks.test.js`) — passants, sans aucune
  modification.
- `computeMouvementAnalysis`/`buildSportifReport`/consommateurs de `functionScores` — vérifiés
  fonctionnels (les tests `mouvementAnalysis.test.js`/`rapportMouvementPDF.test.js` couvrent ces
  chemins et passent sans modification).
- Badges/statuts visibles : `status` reste toujours l'une des valeurs `'vert'|'jaune'|'orange'|
  'rouge'|null` déjà gérées par tout le code de rendu existant (aucun nouveau type de valeur
  introduit).

---

## Absence de modification des règles cliniques

Vérifié explicitement, qualité par qualité :

- **Seuils** : aucune entrée `THRESHOLDS`/`NORMS` créée, modifiée ou supprimée.
- **Règles de convergence** : 1/1 (Mobilité), 2/2 (Puissance/Explosivité/Réactivité), 2/4 (Force),
  2/6 (Stabilisation/Endurance), 2/2 de facto (Absorption) — toutes identiques, aucun seuil de
  décompte modifié.
- **Variables diagnostiques** : identiques pour les 8 qualités — aucune variable ajoutée, retirée,
  ni déplacée entre rôles (diagnostique/confirmative/explicative).
- **Décisions gelées** : `landing_uni_tts`/`landing_bi_tts` → Stabilisation uniquement (vérifié par
  test) ; DJ RSI/SLDJ RSI → Réactivité uniquement (vérifié par test) ; CMJR/Repeated Hop restent
  explicatifs, jamais diagnostiques (non touchés) ; architecture Capacité/Stratégie de Puissance
  (non touchée, `computeHypPowerCapacite`/`Strategie` inchangées) ; règles d'Absorption V2 (`niveau1`
  et ses 4 fonctions `computeHypAbsorption*` non modifiées, voir §« Cas Absorption »).

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+342/-112 lignes), 3 fichiers de tests (4 assertions mises
  à jour, conséquence attendue et documentée).
- **Fichiers créés** : `tests/hypV1Normalization.test.js` (26 tests),
  `HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md`, ce document.
- **Tests existants passés** : tous (24 fichiers, aucune régression réelle).
- **Règles cliniques modifiées** : NON.
- **Seuils créés/modifiés** : NON.
- **Relations TFM supprimées** : NON — seule la construction ad hoc « X entraîne Y » (jamais une
  relation TFM documentée au sens propre) a été repositionnée en association/hypothèse explicative.
- **HYP = source de vérité du statut pour les 8 qualités** : OUI, garanti par construction et par
  test (`fSc[fn].status === hypXxx01.status` toujours, jamais un repli TFM contradictoire).
- **`priorities`/`causalSteps` supprimés** : NON — conservés comme système relationnel/legacy,
  uniquement leur narration causale inter-qualités a été rendue prudente.
- **Système prêt pour HYP-CSM-01** : OUI — contrat commun aux 8 moteurs, source de vérité garantie,
  distinction association/hypothèse explicative/causalité opérationnelle et testée.

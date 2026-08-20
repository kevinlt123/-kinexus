# Implémentation — Migration partielle TFM → HYP/CSM

## Statut

Implémentation de la **migration partielle (décision B)** actée par `AUDIT_MIGRATION_TFM_HYP_CSM.md`.
`index.html` : **+96/-7 lignes** (`git diff --stat`), purement additif à 96 lignes près — les 7
lignes remplacées sont exactement les points d'intégration identifiés par l'audit
(`computeCapaciteStatus`, `capaciteHTML`, la construction de `priorities`, les appels
`qualityScores`/`capaciteScores`). **Aucune ligne à l'intérieur d'un des 8 `computeHypXxx01` n'a été
modifiée** (vérifié par `git diff`, aucune occurrence dans les blocs correspondants). Aucun seuil,
aucune règle de convergence, aucune variable diagnostique, aucune relation TFM/`HYP_QUALITY_RELATIONS`,
aucune ligne de `computeHypClinicalSynthesis01` modifiée. 26 fichiers `tests/*.test.js` (25
préexistants + 1 nouveau), 0 échec.

---

## 1. Problème initial

`capaciteScores` (onglet Capacités, on-screen) et `contributeurPrincipal`/`hypothese`
("Priorité principale"/"Pourquoi ?", PDF + écran) restaient calculés exclusivement à partir de
TFM/VAR_REL3, sans jamais consulter `fSc[qualité].status` (HYP) ni le rôle réel d'une variable dans
le moteur HYP de la qualité concernée — pouvant afficher un badge de déficit ou citer un
"contributeur" alors que HYP concluait `non_determinable` ou n'accordait à cette variable aucun rôle
diagnostique.

## 2. Divergence démontrée (rappel, `AUDIT_MIGRATION_TFM_HYP_CSM.md` §8)

Avec uniquement `imtp`/`slimtp` déficitaires (aucune donnée de saut) : HYP-PUI-01 et HYP-ABS-01 V2
concluent honnêtement `non_determinable`, mais `computeQualityStatus('Puissance'/'Absorption',...)`
retournait `rouge` — visible dans l'onglet Capacités — parce que `VAR_REL3.imtp_n.measures` inclut
`Puissance:Determinante` et `.estimates` inclut `Absorption:Mineure`. Reproduit et vérifié à nouveau
par `tests/tfmHypCsmMigration.test.js` (CAS 1/2) **après** implémentation : le badge affiché est
maintenant `null` (non déterminable), la donnée TFM brute reste disponible sous `tfmStatus`.

## 3. Architecture avant

```
TFM/VAR_REL3 ──► computeQualityStatus/computeCapaciteStatus ──► capaciteScores ──► onglet Capacités
                                                                  (status = diagnostic affiché, TFM pur)

TFM (poids) ──► contrib[0] (premier système non-vert, ordre SYSTEMS) ──► contributeurPrincipal
                                                                          ──► hypothese/"Pourquoi ?"
                                                                          (aucune vérification du rôle
                                                                           réel dans le moteur HYP)
```

## 4. Architecture après

```
TFM/VAR_REL3 ──► computeQualityStatus (INCHANGÉ) ──┐
                                                     ├─► tfmQualityDiagnosticGate(fSc, quality, tfmStatus)
fSc[quality].status (HYP, INCHANGÉ) ────────────────┘         │
                                                                ├─► status (diagnostic affiché) = fSc.status si HYP-gouverné, sinon tfmStatus
                                                                └─► tfmStatus (information secondaire, toujours exposée)
                                                                       │
                                                                       ▼
                                                          capaciteScores / qualityScores / capaciteHTML

TFM (poids, contrib[] INCHANGÉ) ──► hypEvidenceRoleForTest(hyp, testKey)
                                     (lit diagnostic/confirmative/explanatory/segments — contrat HYP V1,
                                      INCHANGÉ) ──► rôle réel du candidat dans le moteur HYP
                                                     │
                                                     ├─ diagnostic/confirmative ──► contributeurPrincipal + hypothese (HYPO, INCHANGÉ, wording existant)
                                                     ├─ segmental/explanatory ────► contributeurPrincipal conservé + hypothese = note explicative dédiée
                                                     └─ aucun rôle ───────────────► contributeurPrincipal = null (jamais forcé)
```

## 5. Rôle de `capaciteScores`

Reste calculé exactement comme avant (`computeQualityStatus`/`computeCapaciteStatus` non modifiées
dans leur logique de calcul). Change uniquement de **statut architectural** : pour une qualité
dotée d'un moteur HYP, le champ `status` renvoyé par `computeCapaciteStatus`/exposé dans
`capaciteScores` **est désormais `fSc[qualité].status`**, jamais recalculé — le résultat TFM brut
est conservé, inchangé, sous un nouveau champ `tfmStatus`, avec un indicateur `hypGoverned`. Rien
n'a été supprimé, rien n'a été renommé au niveau du nom `capaciteScores`/`qualityScores` eux-mêmes
(mission §17, priorité à la sécurité fonctionnelle sur le renommage esthétique — non tranché ici).

## 6. Rôle du TFM

Inchangé : `TFM`, `VAR_REL3`, `SYSTEM_TESTS`, `SYSTEMS`, `SYS_COMPENSATIONS`, `CAPACITES_DATA`,
`effectiveTFMWeight` restent exactement tels quels (`git diff` : aucune ligne touchée). Le TFM
continue de définir *quels candidats sont éligibles* (`contrib`, poids ≥2 + statut non-vert) —
seule l'étape *suivante* (lequel de ces candidats peut être présenté comme contributeur, et
comment) consulte désormais le moteur HYP.

## 7. Rôle de HYP

Confirmé comme source unique du diagnostic affiché, pour les 8 qualités couvertes, à deux niveaux
supplémentaires par rapport à la mission de normalisation précédente : (a) `capaciteScores`/
`qualityScores` ne peuvent plus afficher un statut concurrent (§5), (b) `contributeurPrincipal` ne
peut plus citer un système dont le test n'a, dans le moteur HYP de la qualité, strictement aucun
rôle documenté (§9). Les 8 `computeHypXxx01` eux-mêmes : **aucune ligne modifiée**.

## 8. Rôle de CSM

`computeHypClinicalSynthesis01` : **aucune ligne modifiée**, comme demandé. Ses données d'entrée
(`functionScores`) sont produites exactement comme avant — CSM n'a jamais consulté `capaciteScores`
ni `contributeurPrincipal`, donc n'était pas exposé à la divergence corrigée ici ; sa cohérence
après migration est vérifiée par `tests/tfmHypCsmMigration.test.js` CAS 8 (scénario Force+Puissance,
synthèse identique à ce qu'elle aurait produit avant).

## 9. Nouvelle gestion de `contributeurPrincipal`

Nouvelle fonction `hypEvidenceRoleForTest(hyp, testKey)` : consulte les champs déjà garantis par le
contrat HYP V1 commun (`diagnostic`/`confirmative`/`explanatory`, présents sur les 8 moteurs depuis
la mission de normalisation) et, quand il existe, `segments` (Force, Niveau 2) — recherche une clé
égale ou préfixée par `testKey`. Retourne `'diagnostic'`, `'segmental'`, `'explanatory'` ou `null`.
Aucune nouvelle donnée clinique : uniquement une lecture structurelle de ce que chaque moteur
documente déjà lui-même.

`contrib` (liste des systèmes éligibles par poids TFM ≥2 + statut non-vert) est **inchangé**. Ce qui
change : parmi `contrib`, seul le premier candidat dont `hypEvidenceRoleForTest` retourne une valeur
non nulle peut devenir `main`/`contributeurPrincipal` — implémenté par un filtre
(`contribGated`), pas par une nouvelle règle clinique. Qualités sans moteur HYP (Contrôle Frontal,
Contrôle Sensoriel) : `contribGated=contrib` (comportement 100 % inchangé, `hypObjFn` étant `null`
pour elles).

`hypothese` : quand le rôle du contributeur retenu est `'diagnostic'` (ou qu'aucun contributeur
n'est retenu), le texte `HYPO[fn](main)` existant est utilisé **mot pour mot, inchangé** — y compris
son traitement déjà correct de `main=null` (chaque entrée `HYPO` bascule déjà vers une formulation
générique non attributive). Quand le rôle est `'segmental'`/`'explanatory'`, une nouvelle fonction
`tfmSecondaryContributorNote(fn, sys)` est utilisée à la place, avec une formulation dédiée
("élément relationnel TFM associé, à titre explicatif — ne constitue pas une preuve diagnostique de
...").

## 10. Cas `knee_ext`

Vérifié empiriquement (`tests/tfmHypCsmMigration.test.js` CAS 5) : avec Force réellement
déficitaire (`imtp`/`slimtp`) et `knee_ext` (Quadriceps, poids TFM Force=3, le poids maximal)
également déficitaire, `contributeurPrincipal` reste `'Quadriceps'` (le candidat existe toujours,
rien n'est supprimé), mais `hypEvidenceRoleForTest` retourne `'segmental'` (knee_ext n'apparaît que
dans `hypFor01.segments`, jamais dans `.diagnostic`/`.confirmative`/`.explanatory`) — la phrase
générée devient *"Élément relationnel TFM associé, à titre explicatif — ne constitue pas une preuve
diagnostique de force (quadriceps)."*, jamais la formulation précédente qui aurait pu se lire comme
une attribution diagnostique.

## 11. Cas IMTP/SLIMTP

Vérifié empiriquement (CAS 1/2) : avec uniquement `imtp`/`slimtp` déficitaires, `fSc['Force'].status`
`= 'rouge'` (HYP-FOR-01 diagnostique normalement), `fSc['Puissance'].status`
`= null` et `fSc['Absorption'].status = null` (HYP non_determinable, inchangé). Dans
`capaciteScores`, les entrées Puissance/Absorption ont désormais `status: null` (diagnostic affiché
= HYP) et `tfmStatus` conserve la valeur TFM brute (`'rouge'` dans ce scénario), `hypGoverned: true`.

## 12. UI

Un seul point modifié : `capaciteHTML` (onglet **Capacités**, `ExpertView`, écran uniquement — ce
mécanisme n'est jamais rendu dans le PDF, confirmé par l'audit). Changements strictement additifs :
- Le libellé d'une qualité au statut `null` distingue désormais *"(non déterminable — HYP)"* de
  *"(non testé)"* (auparavant les deux cas produisaient le même texte).
- Une ligne secondaire, discrète (taille de police réduite, italique, gris), apparaît **uniquement**
  quand une information TFM existe et diverge du diagnostic affiché : *"Information relationnelle
  TFM (secondaire) : [statut] — ne constitue pas un diagnostic HYP."*
- Aucun autre onglet, aucune couleur/badge existant, aucune structure de carte modifiée. Le design
  global n'est pas touché (conforme à la mission §12, "ne pas refaire toute l'UI").

## 13. PDF

Consommateurs identifiés par l'audit (`buildSportifReport`, `buildExpertReport`, "Priorité
principale", "🔍 Pourquoi ?", critère RTP via `muscleLsiFor`) : **aucun changement de code dans ces
fonctions elles-mêmes** — elles consomment `priorities[i].hypothese`/`.contributeurPrincipal`, déjà
corrigés en amont (§9). Le PDF hérite donc automatiquement de la correction sans qu'aucune ligne de
mise en page/génération PDF n'ait été modifiée. `capaciteScores` n'étant jamais lu par le PDF
(confirmé par l'audit), aucun changement PDF n'était nécessaire pour ce mécanisme.

## 14. Tests

`tests/tfmHypCsmMigration.test.js` — 9 tests couvrant les 10 CAS mandatés (CAS 1 et 2 fusionnés en
un seul scénario empirique), tous verts :

1. IMTP/SLIMTP déficitaires seuls → Force diagnostiquée HYP, Puissance/Absorption non_determinable
   malgré `tfmStatus` déficitaire (CAS 1/2).
2. TFM déficitaire / HYP normale (`absente`) → diagnostic affiché reste `'vert'`, jamais un déficit
   concurrent (CAS 3).
3. TFM déficitaire / HYP déficitaire → diagnostic HYP conservé, `tfmStatus` toujours exposé (CAS 4).
4. `knee_ext` (poids TFM Force=3, rôle HYP segmental) → jamais présenté comme preuve diagnostique
   (CAS 5, branche réellement exercée — `contributeurPrincipal==='Quadriceps'` vérifié).
5. Aucun contributeur compatible (Quadriceps non-vert mais aucun rôle dans HYP-PUI-01) →
   `contributeurPrincipal=null`, jamais forcé au poids TFM (CAS 6, branche réellement exercée).
6. Structures TFM non altérées : tailles de `TFM`/`VAR_REL3`(283)/`CAPACITES_DATA`(4)/
   `SYS_COMPENSATIONS`/`HYP_QUALITY_RELATIONS`(8) inchangées (CAS 7).
7. CSM cohérent après migration, scénario Force+Puissance (CAS 8).
8. Aucune donnée → tous les statuts HYP-gouvernés (`fSc` et `capaciteScores`) restent `null` (CAS 9).
9. Les 8 moteurs HYP restent purs/déterministes (CAS 10 — combiné à la non-régression des 24 fichiers
   `tests/*.test.js` spécifiques à chacun des 8 moteurs, tous verts sans modification).

## 15. Non-régression

`node --check` (extraction `<script>`) : `SYNTAX_OK`. 26 fichiers `tests/*.test.js` exécutés
(25 préexistants + le nouveau) : **0 échec**, y compris les 8 fichiers dédiés à chaque qualité
(Force/Puissance/Explosivité/Réactivité/Absorption/Stabilisation/Endurance/Mobilité) et
`hypV1Normalization.test.js`/`hypClinicalSynthesis01.test.js`. `git diff --stat -- index.html` :
+96/-7, les 7 lignes supprimées correspondent exactement aux 4 points d'intégration modifiés,
aucune autre ligne (en particulier aucune ligne des 8 `computeHypXxx01`, de
`computeHypClinicalSynthesis01`, de `HYP_QUALITY_RELATIONS`, de `TFM`, de `VAR_REL3`, de
`CAPACITES_DATA`, de `THRESHOLDS`/`NORMS`) n'a été touchée.

## 16. Limitations restantes

- **`qualityScores`** reçoit le même traitement (`tfmQualityDiagnosticGate`) que `capaciteScores`
  par cohérence de code, mais reste un champ **jamais rendu** (aucun consommateur) — aucun impact
  utilisateur, mentionné pour traçabilité uniquement.
- **`compensations`/`rootCauses`/`rootCausesHTML`** : toujours calculés mais jamais rendus (confirmé
  par l'audit précédent) — non touchés par cette mission, latents comme avant.
- **`contributeurSecondaire`** : dérivé du même `contribGated` que `contributeurPrincipal` (donc
  bénéficie de la même gate), mais aucun test dédié ne le vérifie explicitement — la mission ne
  l'exigeait pas nommément (elle cite uniquement "contributeur principal").
- **Nom de `capaciteScores`** : non renommé (mission §17 — priorité à la sécurité fonctionnelle,
  décision de renommage explicitement laissée au praticien).
- **Collision `HYP-CSM-01`** : ni renommée ni modifiée dans cette mission (mission §18 — décision de
  travail actée : conserver `HYP-CSM-01` pour la synthèse multi-qualités ; aucune ligne de code liée
  à cette collision n'a été touchée, aucune collision active dans le code lui-même — le conflit est
  documentaire, entre `HYP_ARCHITECTURE_FREEZE.md`/`DECISION_MEMO_CSM.md` et `IMPLEMENTATION_HYP_CSM01.md`,
  déjà consigné dans les deux audits précédents).
- **`hypEvidenceRoleForTest` reste un test structurel générique** (préfixe de clé), pas une
  vérification clinique variable par variable pour les 44 tests × 8 qualités — il s'appuie
  entièrement sur ce que chaque moteur HYP expose déjà (`diagnostic`/`confirmative`/`explanatory`/
  `segments`), sans jamais inventer de rôle qui n'y figurerait pas. Si un moteur HYP venait à
  exposer une variable sous une clé qui ne commence pas par le `testKey` correspondant (schéma non
  observé aujourd'hui sur les 8 moteurs), la détection pourrait manquer ce rôle — signalé ici par
  prudence, aucun cas de ce type trouvé lors des vérifications de cette mission.

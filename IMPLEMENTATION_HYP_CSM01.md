# Implémentation — HYP-CSM-01 (Synthèse clinique multi-qualités)

**Statut** : implémenté en production dans `index.html`, **purement additif** (+198 lignes,
0 suppression) — `computeMoteur()` et les 8 moteurs HYP existants n'ont **pas été touchés d'un
seul caractère**. HYP-CSM-01 n'est ni une 9e qualité, ni un moteur diagnostique : c'est une
fonction de synthèse en lecture seule, appelée séparément, qui consomme le `functionScores` déjà
produit par `computeMoteur()`.

---

## 1. Objectif

Répondre à *« qu'est-ce que les 8 moteurs HYP permettent de dire ensemble ? »* — jamais à
*« qu'est-ce qui est probablement déficitaire ? »* (question déjà tranchée par les 8 moteurs).
CSM regroupe, compare, met en relation et formule des hypothèses explicatives prudentes ; il
n'invente, ne reclasse, ne recalcule et n'amplifie jamais rien.

## 2. Architecture

```
8 MOTEURS HYP (déjà appelés par computeMoteur(), inchangés)
        ↓
functionScores[quality].hypXxx01  (contrat HYP V1 commun — cf. HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md)
        ↓
computeHypClinicalSynthesis01(functionScores)   ← nouvelle fonction, pure, isolée
        ↓
{ qualities, objectified, nonDeterminable, suspected, relationships,
  explanatoryHypotheses, explanatoryNotes, precision, limitations, narrative }
```

`computeHypClinicalSynthesis01` **n'est appelée nulle part dans `computeMoteur()`** — elle doit
être invoquée séparément par un futur consommateur (UI, rapport), avec `res.functionScores` en
argument. Elle n'appelle elle-même aucun des 8 `computeHypXxx01` — ils ont déjà été appelés par
`computeMoteur()` en amont ; CSM ne fait que relire leur résultat déjà produit.

## 3. Sources consommées

`HYP_V1_CONTRACT_AND_SOURCE_OF_TRUTH.md` (contrat commun réellement implémenté — `hypId`/
`quality`/`state`/`status`/`support`/`convergence`/`diagnostic`/`confirmative`/`explanatory`/
`precision`/`limitations`, vérifié directement dans le code des 8 moteurs, pas supposé) ;
`AUDIT_TRANSVERSAL_HYP_V1.md` (matrice variable→qualité→rôle, relations déjà codées) ;
`IMPLEMENTATION_HYP_V1_NORMALIZATION.md` (`HYP_QUALITY_RELATIONS`, `dataAvailable` comme signal
fiable pour Réactivité/Mobilité). Aucune nouvelle lecture du code des 8 moteurs au-delà de ce que
le contrat expose déjà.

## 4. Contrat CSM

```
{
  csmId: 'HYP-CSM-01', version: '1.0',
  qualities: { [quality]: { quality, hypId, state, status, support, convergence,
                             objectified, nonDeterminable, suspected, absent, hyp } },
  objectified: [{ quality, state, support, status }],       // déficits réellement objectivés par HYP
  nonDeterminable: [{ quality, state, reason }],
  suspected: [{ quality, state }],                          // état 'suspectee' — signal partiel, pas encore retenu
  relationships: [{ explains, explained, via, level, narrative }],
  explanatoryHypotheses: [...],                              // sous-ensemble de relationships, level='explanatory_hypothesis'
  explanatoryNotes: [{ quality, note }],                      // capacité/stratégie (Puissance/Explosivité)
  precision: { [quality]: hypXxx01.precision },
  limitations: [string...],
  narrative: { deficitsObjectives, qualitesNonDeterminables, relationsExplicatives, elementsPrecision, limites }
}
```

Les 10 champs minimaux demandés par la mission sont tous présents. `qualities[q].hyp` conserve
une **référence complète et non modifiée** vers l'objet `hypXxx01` d'origine — traçabilité totale
sans duplication ni recalcul (Partie 15).

## 5. Diagnostics objectivés

`csmIsObjectified(h)` = `h.state` ∈ {`retenue_faible`, `retenue_moderee`, `retenue_forte`} — la
**seule** condition. Aucun autre critère (score, poids TFM, nombre de variables) n'intervient.
Vérifié par test : une qualité au support « faible » est objectivée au même titre qu'une qualité
au support « forte » — CSM ne graduelle jamais l'appartenance à `objectified` selon le support.

## 6. Non_determinable

`csmIsNonDeterminable(h)` = `h.state==='non_determinable'` **OU** (`'dataAvailable' in h` et
`h.dataAvailable===false`) — cette deuxième condition est nécessaire car Réactivité et Mobilité
n'ont structurellement jamais d'état `non_determinable` littéral (leur `state` retombe sur
`absente` sans donnée, cf. `AUDIT_TRANSVERSAL_HYP_V1.md` §6) ; sans elle, CSM aurait pu
silencieusement traiter « aucune donnée » comme « confirmé normal ». Une qualité
`nonDeterminable` n'apparaît **jamais** dans `objectified`, et la narrative dédiée (§`narrative.
qualitesNonDeterminables`) ne contient jamais le mot « normal » comme affirmation positive
(vérifié par test, CAS 10).

## 7. Relations TFM/HYP

CSM ne relit **aucune** pondération `TFM` ni entrée `VAR_REL3` — il réutilise exclusivement
`HYP_QUALITY_RELATIONS` (registre déjà construit lors de la normalisation V1, 8 relations
transcrites depuis le code des moteurs HYP eux-mêmes, jamais des poids TFM). Pour chaque relation
`{explains, explained}`, `computeHypClinicalSynthesisRelationships` calcule un `level` :

| `level` | Condition | Formulation |
|---|---|---|
| `explanatory_hypothesis` | Les deux qualités sont `objectified` | « Le déficit de X constitue une hypothèse explicative possible du déficit de Y (…), sans en établir la cause. » |
| `not_applicable_non_determinable` | L'une des deux (ou les deux) est `nonDeterminable` | « La contribution de X ne peut pas être déterminée avec les données actuellement classifiables. » |
| `not_supported` | La relation existe mais la qualité « explicative » n'est pas elle-même `objectified` (absente/suspectee) | Relation documentée mais non retenue, explicitement dit pourquoi. |
| `concordant_no_relation` | Deux qualités `objectified` sans relation `HYP_QUALITY_RELATIONS` documentée entre elles | « Les déficits de X et de Y sont concomitants, mais les données actuellement disponibles ne permettent pas d'identifier une relation explicative documentée entre eux. » |

Aucune relation n'est supprimée ni désactivée — `HYP_QUALITY_RELATIONS` reste identique à celui de
la normalisation V1.

## 8. Hypothèses explicatives

`explanatoryHypotheses` = `relationships.filter(level==='explanatory_hypothesis')`. Formulations
utilisées, systématiquement : « constitue une hypothèse explicative possible », « sans en établir
la cause » — jamais « cause », « entraîne », « est responsable de » (vérifié par test sur
l'intégralité de la sortie JSON, CAS 15).

## 9. Gestion de la causalité

Aucun mécanisme du moteur ne peut produire une affirmation causale forte. Vérifié explicitement
(CAS 4, 14, 15) : recherche de `entraîne`/`est la cause`/`est responsable de` sur la sortie CSM
complète, dans plusieurs profils multi-déficits — absents dans tous les cas. Les seules occurrences
du mot « cause » dans la sortie sont dans la formule de garde-fou elle-même (« sans en établir la
cause », « CSM ne détermine jamais une cause principale ») — jamais comme affirmation positive.

## 10. Profils multi-déficits

Aucune hiérarchie automatique : `objectified` est une **liste plate**, sans champ `rank`/
`priority`/`primaryDeficit`/`mainCause` nulle part dans le contrat (vérifié par test, CAS 16).
Le score, le support, le nombre de variables déficitaires ou le poids TFM ne désignent jamais une
qualité comme « principale ». Testé jusqu'à 7 qualités simultanément objectivées (CAS 9) — la
sortie reste une liste plate + un ensemble de relations, jamais une hiérarchie inventée.

## 11. Capacité / stratégie

`csmCapaciteStrategieNote(quality, h)` relit exclusivement les champs déjà classifiés par
`computeHypPowerCapacite`/`computeHypExplosivityExplanatory` (jamais de nouvelle lecture de
variable brute, jamais de nouveau seuil) et produit une note prudente distincte pour Puissance et
Explosivité, sans jamais choisir arbitrairement l'une des deux dimensions comme cause principale
(cf. §11 de la mission). Retourne `null` (rien ajouté) si aucune des deux dimensions n'est
aujourd'hui classifiable comme déficitaire — honnête, jamais forcé.

## 12. Traçabilité

Chaque entrée de `objectified`/`nonDeterminable`/`relationships` porte directement `state`/
`support`/`convergence` (ou peut les retrouver via `qualities[q].hyp`, référence complète et non
modifiée vers l'objet `hypXxx01` d'origine). Un praticien peut toujours retracer : CSM → relation
utilisée (`via`) → qualité HYP (`hypId`) → état (`state`) → support/convergence → variables
concernées (`hyp.diagnostic`/`hyp.explanatory`).

## 13. Tests

`tests/hypClinicalSynthesis01.test.js` — **22 tests, tous passants**, couvrant intégralement les
20 cas mandatés par la mission (Partie 17) : aucun déficit (1), Force seule (2), Puissance seule
(3), Force+Puissance sans causalité (4), Force+Puissance+Explosivité sans hiérarchie (5),
Absorption+Stabilisation distinguées (6), Réactivité+Absorption sans promotion de `dj_rsi` (7),
Force+Endurance sans déduction automatique (8), profil multi-déficits à 7 qualités (9), qualité
`non_determinable` jamais normale (10), relation TFM/HYP existante exploitée (11), relation absente
→ association uniquement (12), relation avec qualité `non_determinable` → jamais présentée comme
déficitaire (13), relation explicative valide avec formulation vérifiée mot pour mot (14), absence
de causalité automatique sur l'intégralité de la sortie (15), absence de hiérarchie automatique
(16), variables explicatives correctement remontées sans promotion diagnostique (17), asymétrie
traitée comme précision (18), aucun diagnostic HYP modifié par CSM (19), aucune autre qualité/sortie
de `computeMoteur()` modifiée par l'appel CSM (20) — plus 2 tests de régression (pureté, contrat de
sortie complet).

## 14. Non-régression

Suite complète : **25 fichiers de tests, tous passants** (24 préexistants, inchangés, + 1 nouveau).
Vérification syntaxique complète du contenu `<script>` d'`index.html` (`node --check`) — **OK**.
`git diff --stat` confirmé **purement additif** (+198/-0 dans `index.html`) — preuve directe,
au-delà des tests, qu'aucune ligne des 8 moteurs HYP ni de `computeMoteur()` n'a été modifiée.
Vérifié explicitement par test (CAS 19/20) : les 8 `hypXxx01` et la totalité de la sortie de
`computeMoteur()` (`functionScores`/`testStatuses`/`systemScores`/`priorities`/`rtpStatus`/
`qualityScores`/`capaciteScores`) restent strictement identiques (comparaison JSON symétrique)
avant et après un appel à `computeHypClinicalSynthesis01`.

## 15. Limites actuelles

- **Non branché à l'UI/au rapport** : cette mission livre le moteur et ses tests, pas son
  affichage. Aucune modification de `buildSportifReport`/de la vue React — hors périmètre déclaré
  de cette mission (« construire HYP-CSM-01 », pas « l'intégrer au rapport »).
- **`HYP_QUALITY_RELATIONS` reste le registre défini lors de la normalisation V1** (8 relations) —
  CSM ne l'étend pas ; toute relation supplémentaire nécessiterait qu'elle soit d'abord codée et
  vérifiée dans un moteur HYP, puis transcrite dans ce registre (jamais l'inverse).
  Conséquence directe : de nombreuses paires de qualités objectivées simultanément retomberont sur
  `concordant_no_relation`, honnêtement, faute de relation aujourd'hui documentée entre elles.
  Ce n'est pas un défaut de CSM — c'est le reflet fidèle de ce que les 8 moteurs savent
  effectivement expliquer aujourd'hui.
- **`explanatoryNotes` (capacité/stratégie)** n'est implémenté que pour Puissance et Explosivité —
  seules qualités où cette distinction est explicitement gelée dans les sources HYP. Aucune
  extension par analogie à d'autres qualités.
- **Cause vs conséquence vs compensation, hiérarchie entre déficits, priorité thérapeutique**
  restent explicitement `NON DÉTERMINABLE` par construction — CSM ne cherche jamais à les
  résoudre ; c'est un choix de conception assumé, pas une lacune à corriger sans nouvelle règle
  clinique validée par le praticien.

---

## RÉSUMÉ

- **Fichiers modifiés** : aucun (index.html : additions uniquement, +198/-0).
- **Fichiers créés** : `tests/hypClinicalSynthesis01.test.js` (22 tests), ce document.
- **Nouvelle qualité créée** : NON.
- **Moteurs HYP existants modifiés** : NON (vérifié par test ET par `git diff` purement additif).
- **Seuils créés/modifiés** : NON.
- **Règles de convergence modifiées** : NON.
- **Relations TFM supprimées** : NON.
- **Causalité automatique produite** : NON (vérifié explicitement sur toute la sortie, plusieurs
  profils).
- **Hiérarchie automatique produite** : NON (vérifié explicitement).
- **Tests existants passés** : tous (24 fichiers préexistants, aucune régression).
- **HYP-CSM-01 réellement fonctionnel** : OUI — synthétise fidèlement ce que les 8 moteurs HYP
  permettent de dire ensemble aujourd'hui, sans jamais dépasser leur niveau de preuve réel.

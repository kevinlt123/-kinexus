# Contrat HYP V1 et source de vérité clinique

**Statut** : normalisation architecturale, implémentée en production dans `index.html`. **Aucune
règle clinique, aucun seuil, aucune règle de convergence, aucune variable diagnostique n'a été
modifiée.** Cette normalisation rend les 8 moteurs HYP consommables de façon homogène et fait de
HYP la source de vérité du diagnostic de qualité, tout en conservant intégralement le TFM comme
réseau relationnel/explicatif.

---

## 1. Pourquoi le contrat commun est nécessaire

Avant cette mission, l'audit transversal (`AUDIT_TRANSVERSAL_HYP_V1.md`) avait identifié que les 8
moteurs HYP, bien que cliniquement rigoureux chacun individuellement, exposaient des formes de
sortie hétérogènes (Absorption n'avait ni `hypId`, ni `state`, ni `support`, ni `convergence`
structuré — elle utilisait `niveau1` avec un vocabulaire propre). Un futur consommateur générique
(HYP-CSM-01, devant comparer plusieurs qualités entre elles) aurait dû connaître la structure
interne spécifique de chacun des 8 moteurs. Le contrat commun élimine ce couplage.

## 2. Contrat de sortie HYP V1

Chaque `computeHypXxx01()` retourne désormais, au minimum, les champs suivants — **en plus**, pas à
la place, de ses champs spécifiques historiques (aucun champ existant n'a été supprimé) :

| Champ | Type | Signification |
|---|---|---|
| `hypId` | string | Identifiant de la qualité HYP (ex. `'HYP-FOR-01'`) — déjà présent partout, inchangé. |
| `quality` | string | Nom de la qualité au sens `FUNCTIONS` (ex. `'Force'`) — **nouveau**, ajouté pour permettre un consommateur générique sans dictionnaire de correspondance externe. |
| `state` | string | État du cycle standard (`non_determinable`/`absente`/`suspectee`/`retenue_faible`/`retenue_moderee`/`retenue_forte`) — déjà présent partout. Pour Absorption, relabelage bijectif de `niveau1` (voir §6). |
| `status` | `'vert'|'jaune'|'orange'|'rouge'|null` | **Nouveau** : statut visible dérivé de `state` via `hypStatusFromState()`, calculé et exposé directement par le moteur — un consommateur n'a plus besoin de connaître la formule de dérivation (auparavant dupliquée, avec de légères variantes, dans `computeMoteur()`). |
| `support` | `{level}` ou `null` | Niveau de support gradué (Faible/Modérée/Forte) — déjà présent partout. `null` pour Absorption (jamais documenté, non inventé). |
| `convergence` | objet | Détail de la règle de convergence (mécanismes requis/observés/impliqués) — déjà présent partout, structure variable selon la qualité (règle propre à chacune, jamais harmonisée artificiellement). |
| `diagnostic` | objet | **Nouveau nom d'alias** du champ historique `diagnosticEvidence` (conservé à l'identique, jamais renommé — les deux coexistent, pointent vers le même objet). |
| `confirmative` | objet | Alias de `confirmativeEvidence` (idem). Objet vide `{}` si aucune confirmative indépendante n'est documentée (Mobilité, Stabilisation) — honnête, jamais inventée. |
| `explanatory` | objet | Alias de `explanatoryEvidence` (idem). |
| `precision` | objet | Déjà présent partout (asymétries/LSI/notes de précision). |
| `limitations` | `string[]` | **Nouveau** : liste de phrases décrivant les blocages normatifs connus de la qualité (transcription directe des commentaires déjà présents en tête de chaque moteur — aucune nouvelle information, juste rendue programmatiquement accessible). |

**Principe respecté** : le contrat est un **socle additif**, jamais une réduction. Toute donnée
spécifique déjà exposée (`activeSecondProof`/`substitution` pour Puissance, `segments`/
`relativeOrientation` pour Force, `sousDomaines`/`asymetrie`/`niveau1`/`profilCore` pour Absorption,
`dataAvailable` pour Réactivité/Mobilité, `note` partout où déjà présent) reste exactement où elle
était. Vérifié par test (`tests/hypV1Normalization.test.js`, TEST 2).

## 3. Définition des états

Inchangée — reprend le cycle 5 états déjà gelé (`KINEXUS_REASONING_ENGINE_V1.md` §2-4) :
`non_determinable` (aucune preuve classifiable) → `absente` (0 déficitaire) → `suspectee` (preuve
partielle) → `retenue_faible/moderee/forte` (convergence atteinte, gradation par confirmative/
explicative). Réactivité et Mobilité n'ont structurellement jamais de valeur `non_determinable`
littérale (leur état retombe sur `absente` même sans donnée) — le signal fiable pour elles reste
`dataAvailable` (champ historique, inchangé). Voir §8 pour la conséquence de cette nuance sur
`status`.

## 4. Définition du support

Inchangée — Faible/Modérée/Forte, gradué par convergence confirmative puis explicative, jamais
inventé au-delà de ce qui est structurellement atteignable aujourd'hui (documenté qualité par
qualité dans chaque `IMPLEMENTATION_HYP_*.md`/`AUDIT_IMPLEMENTATION_HYP_*.md`). Absorption V2 n'a
jamais documenté de mécanisme de support gradué — `support:null` explicite, non inventé.

## 5. Définition de la convergence

Inchangée — chaque qualité conserve sa propre règle, source-justifiée individuellement (1/1 pour
Mobilité par exception ADR-005, 2/2 pour Puissance/Explosivité/Réactivité, 2/4 pour Force, 2/6 pour
Stabilisation/Endurance, 2/2 de facto pour Absorption). Aucune règle harmonisée artificiellement.

## 6. Source de vérité clinique

**Principe désormais appliqué aux 8 qualités, sans exception** : lorsqu'un moteur HYP existe pour
une qualité, `functionScores[qualité].status` **est** `hypXxx01.status` — jamais une valeur
recalculée indépendamment, jamais un repli TFM qui pourrait le contredire.

Avant cette mission, 3 qualités (Absorption, Réactivité, Mobilité) dérogeaient à ce principe : leur
`fSc[fn]` restait le résultat de la boucle TFM générique tant que le moteur HYP ne produisait pas de
conclusion positive. L'audit transversal a démontré, sur un cas reproductible, que cela pouvait
produire une contradiction interne (`hypRea01.state==='absente'`/`dataAvailable:false` **et**
`fSc['Réactivité'].status==='orange'` simultanément, cf. `AUDIT_TRANSVERSAL_HYP_V1.md` §6). Ce
comportement est corrigé : les 8 qualités suivent désormais exactement le même schéma
d'intégration dans `computeMoteur()` — remplacement intégral, `status:null` explicite quand HYP ne
peut rien déterminer.

**HYP-ABS-01 V2** (Absorption) : `niveau1` reste la valeur de référence du raisonnement clinique,
**strictement inchangée** (`ok`/`a_surveiller`/`deficitaire`/`non_determinable`, mêmes conditions,
mêmes seuils). `state` est un **relabelage bijectif** de `niveau1` (`ok→absente`,
`a_surveiller→suspectee`, `deficitaire→retenue_faible`) ajouté uniquement pour le contrat commun —
aucun recalcul, aucune nouvelle condition. Vérifié identique avant/après par test dédié (TEST 3).

## 7. Rôle relationnel du TFM

Le TFM (`TFM`, `effectiveTFMWeight`, `SYSTEM_TESTS`, `SYS_COMPENSATIONS`, `VAR_REL3`) **n'est ni
supprimé ni réduit**. Il continue d'alimenter, exactement comme avant :

- `qualityScores`/`capaciteScores` (`computeQualityStatus`/`computeCapaciteStatus`) — système
  parallèle, taxonomie distincte (`'Force maximale'`, `'Propulsion'`, etc.), totalement inchangé.
- `priorities` (`contributeurPrincipal`/`contributeurSecondaire`/`hypothese`/`orientation` par
  qualité, `rootCauses`/`compensations`) — inchangé dans sa construction interne (toujours dérivé du
  classement TFM/`effectiveTFMWeight`, comme avant).
- `tfmFallback` — **nouveau champ**, exposé sur `fSc['Absorption']`/`['Réactivité']`/`['Mobilité']`,
  contenant exactement l'ancien objet TFM générique qui aurait été affiché comme `.status` avant
  cette mission. Jamais supprimé, disponible pour tout consommateur legacy/relationnel qui en aurait
  besoin — simplement plus jamais utilisé comme statut clinique affiché.

Ce qui change : le TFM ne peut plus **contredire visuellement** un diagnostic HYP. Il reste
l'instrument de pondération historique et le réseau relationnel exploité par `priorities`/
`qualityScores`, mais n'est plus jamais présenté comme conclusion clinique de qualité quand un
moteur HYP existe pour cette qualité.

## 8. Association / hypothèse explicative / causalité

Trois niveaux de preuve, désormais distingués explicitement (mission §7, `AUDIT_TRANSVERSAL_HYP_V1.md`
§10) :

| Niveau | Formulation | Condition |
|---|---|---|
| **Association** | « X et Y présentent des déficits concordants. » | Deux qualités déficitaires simultanément (HYP-confirmé), **aucune** relation documentée entre elles. |
| **Hypothèse explicative** | « Le déficit de X peut constituer une hypothèse explicative compatible avec le déficit de Y, sans en établir la cause. » | Deux qualités déficitaires simultanément **et** une relation HYP_QUALITY_RELATIONS documentée existe entre elles (variable diagnostique de l'une lue en explicative par l'autre, cf. §10). |
| **Causalité** | « X cause/entraîne Y. » | **Jamais généré automatiquement.** Aucun mécanisme du système ne permet aujourd'hui de démontrer une causalité clinique — le mot « entraîne » a été retiré de toute génération automatique. |

`HYP_QUALITY_RELATIONS` (`index.html`, juste après `hypStatusFromState`) recense les **8 relations
déjà codées et vérifiées** dans les moteurs HYP eux-mêmes (Force→Puissance, Force→Explosivité,
Force→Endurance, Force→Stabilisation, Puissance↔Explosivité, Mobilité→Stabilisation,
Réactivité→Endurance) — aucune relation nouvelle inventée, uniquement rendues consultables pour
graduer une phrase, jamais pour l'affirmer sans preuve.

`buildMultiQualityNarrative(pri)` (fonction pure, isolée, testée) remplace l'ancienne construction
de `conclusion`/`consequences`/`causalSteps`/`interpretationTxt` — utilisée aux **trois** endroits
où elle était auparavant dupliquée : `defaultReportTexts()` (résumé clinique du rapport PDF),
`buildSportifReport()` (page « Chaîne causale » du rapport imprimé), et la vue React « Analyse » à
l'écran (composant `AnalyseView`, section « Chaîne causale principale »). Les trois consommaient
auparavant un texte quasi identique, dupliqué trois fois avec le même défaut — corrigés ensemble,
au même endroit, sans divergence entre eux.

## 9. Fallback

Résumé opérationnel (voir aussi §6-7) :

- **Qualité couverte par un moteur HYP, HYP concluant** (`state` ≠ `non_determinable`, et pour
  Réactivité/Mobilité `dataAvailable===true`) → `status` = couleur dérivée de `state`. Source
  unique : HYP.
- **Qualité couverte par un moteur HYP, HYP sans donnée exploitable** → `status:null` explicite.
  Le TFM générique reste calculé et exposé sous `tfmFallback` (Absorption/Réactivité/Mobilité) ou
  simplement non affiché (Puissance/Force/Explosivité/Stabilisation/Endurance, comme avant cette
  mission — elles n'ont jamais eu de repli TFM).
- **Qualité non couverte par HYP** (Contrôle Frontal, Contrôle Sensoriel) → inchangée, toujours
  entièrement pilotée par la boucle TFM générique de premier niveau. Hors périmètre de cette
  mission (aucun moteur HYP n'existe pour elles).

## 10. Non_determinable

Principe réaffirmé et désormais garanti au niveau du `status` visible pour les 8 qualités, sans
exception : `non_determinable` (ou absence de donnée pour Réactivité/Mobilité) ne peut **jamais**
devenir `'vert'` (normal) ni `'orange'`/`'rouge'` (déficit) — `status:null` uniquement. Vérifié par
test pour les 8 qualités (`tests/hypV1Normalization.test.js` TEST 4/5/6/7/8/9, et les tests dédiés
préexistants de chaque qualité).

## 11. Préparation pour HYP-CSM-01

Le futur HYP-CSM-01 peut désormais :

- Itérer sur les 8 `hypXxx01` sans connaître leur structure interne spécifique — lire
  `quality`/`state`/`status`/`support`/`convergence`/`diagnostic`/`confirmative`/`explanatory`/
  `precision`/`limitations` de façon uniforme.
- Faire confiance à `functionScores[quality].status` comme source de vérité diagnostique, sans avoir
  à vérifier lui-même si un repli TFM a pu la contredire.
- Consulter `HYP_QUALITY_RELATIONS`/`findHypQualityRelation()` pour ses propres besoins de mise en
  relation, en réutilisant la distinction association/hypothèse explicative/causalité déjà en place,
  plutôt que de la réinventer.

**Point de vigilance signalé, non traité ici** (déjà noté dans `AUDIT_TRANSVERSAL_HYP_V1.md` §15,
point 6) : HYP-CSM-01 lira très probablement `eo_surface`/`ef_surface`/`strobo_surface`/`sls_*` —
exactement les mêmes variables diagnostiques que Stabilisation. Cette réutilisation devra être
explicitement justifiée par un mécanisme distinct (rôle diagnostique de CSM ≠ rôle diagnostique de
Stabilisation pour les mêmes variables), pas supposée par proximité — à traiter explicitement lors
de l'audit clinique préalable à HYP-CSM-01, selon la méthode déjà établie (audit avant code).

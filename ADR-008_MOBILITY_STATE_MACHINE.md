# ADR-008 — Mobility State Machine

## Statut

Analyse ciblée d'une ambiguïté technique identifiée dans `PHASE_H_TECHNICAL_SPECIFICATION.md` §2.3/
§9.2 (point 2), avant démarrage des modules H1-H14. Compatible avec `KINEXUS_REASONING_ENGINE_V1.md`,
`PHASE_F_ADR.md` (ADR-003, ADR-005), `PHASE_G_IMPLEMENTATION_PLAN.md`,
`PHASE_H_TECHNICAL_SPECIFICATION.md`. ADR-003 et ADR-005 ne sont pas rouverts — ce document en
applique les principes déjà validés à un cas que ni l'un ni l'autre n'avait explicitement couvert.
Aucun concept architectural nouveau introduit. Vierge_7 non consulté (non nécessaire — le contenu
déjà transcrit dans `HYP_ARCHITECTURE_PHASE_C.md`, non rouvert, suffit).

## 1. Problème

`HYP-MOB-01` (Mobilité) est mono-test (`wblt_distance`, seule variable diagnostique) et bénéficie
d'une exception déjà validée (ADR-005) : une seule preuve diagnostique suffit à atteindre Retenue,
sans transiter par Suspectée. `PHASE_H_TECHNICAL_SPECIFICATION.md` §2.3 laisse ouverte la question de
savoir si les paliers Retenue/Modérée et Retenue/Forte restent réellement atteignables pour cette
qualité, étant donné que sa couche confirmative est décrite par Vierge_7 lui-même comme
"essentiellement des nuances de la même preuve" et que sa couche explicative est entièrement vide
(`HYP_ARCHITECTURE_PHASE_C.md`, fiche Mobilité — fait déjà établi, non rouvert ici).

## 2. Analyse

**Forte — inatteignable par construction, indépendamment de toute décision de cet ADR.** La
transition Modérée→Forte exige au moins une `ExplanatoryEvidence` convergente
(`KINEXUS_REASONING_ENGINE_V1.md` §2). La fiche Mobilité ne contient aucune variable explicative
mesurable (couverture "🔴 Nulle" en physiologique comme en biomécanique,
`HYP_ARCHITECTURE_PHASE_C.md`). Le tableau `explanatoryEvidence` de `HYP-MOB-01` est donc toujours
vide, par construction des données — aucune règle nouvelle n'est nécessaire pour bloquer Forte, cela
découle directement d'un fait déjà établi.

**Modérée — la seule vraie question de cet ADR.** La transition Faible→Modérée exige au moins une
`ConfirmativeEvidence` convergente. La confirmative de Mobilité (`wblt_lsi`, dérivé de la même
passation que `wblt_distance`) est structurellement identique, en nature, à l'exemple qui a motivé
ADR-003 (validé) : plusieurs KPIs issus d'un seul et même test/mécanisme ne constituent pas des
preuves indépendantes. ADR-003 a été formulé pour le seuil diagnostique (SLLT/Absorption), mais son
principe — *"la convergence doit être évaluée à l'échelle des mécanismes/tests indépendants et non
par simple comptage de variables issues d'un même test"* — n'est pas spécifique au rang
diagnostique : c'est une propriété de ce que signifie "converger", applicable à toute catégorie de
preuve. Appliqué de façon cohérente à la confirmative de Mobilité, `wblt_lsi` ne constitue pas un
mécanisme indépendant de `wblt_distance` — **la confirmative de Mobilité ne peut donc pas, par
cohérence avec un principe déjà validé, faire progresser le support vers Modérée.**

**Conséquence combinée** : sous une lecture cohérente d'ADR-003, `HYP-MOB-01` n'atteint jamais,
dans les faits, que deux états réellement observables — Absente et Retenue/Faible — quel que soit le
mécanisme technique retenu pour l'exprimer (§3-5 ci-dessous).

## 3. Options

### A. Cycle complet conservé
`HYP-MOB-01` utilise le même type `TransitionState` à 5 valeurs que les 7 autres qualités ; le
plafonnement à Faible est appliqué par une logique dédiée dans le moteur (`computeHypothesisEngine`),
sans trace au niveau du type.

### B. Cycle simplifié spécifique à Mobilité
Mobilité reçoit son propre type d'état restreint (ex. un sous-ensemble de `TransitionState` limité à
`'absente' | 'retenue_faible'`), empêchant structurellement, au niveau du système de types, toute
valeur `'retenue_moderee'`/`'retenue_forte'`/`'suspectee'`.

### C. Réutilisation du marqueur d'exception déjà existant (`Convergence.ruleVariant`)
`TransitionState` reste unique et inchangé pour les 8 qualités (aucune modification du modèle de
données). Le champ `Convergence.ruleVariant = 'mobilite_exception'` — **déjà spécifié dans
`PHASE_H_TECHNICAL_SPECIFICATION.md` §1.2/1.3** pour gouverner le seuil diagnostique à 1 preuve
(ADR-005) — est **relu par la logique d'évaluation de la catégorie confirmative** pour désactiver la
progression vers Modérée pour cette qualité spécifiquement. Un seul marqueur, déjà conçu, gouverne
les deux exceptions (diagnostique et confirmative) de la même qualité.

## 4. Comparaison

**Conséquences du caractère mono-test** : dans les trois options, `HYP-MOB-01` n'atteint jamais
Forte (fait déjà établi, §2) et n'atteint Modérée dans aucune des trois si l'analyse ADR-003 ci-dessus
est retenue. La différence entre A/B/C porte uniquement sur **où et comment** cette contrainte est
représentée techniquement, pas sur le résultat clinique observable.

**Conséquences d'ADR-005** : pleinement compatibles avec les trois options — ADR-005 ne concerne que
la transition Absente→Retenue (déjà actée, non rouverte), aucune des trois options n'y touche.

**Atteignabilité réelle** : Faible — toujours atteignable (ADR-005). Modérée — **structurellement
inatteignable dans les trois options**, par cohérence avec ADR-003 (§2). Forte — **toujours
inatteignable, indépendamment de cet ADR** (couche explicative vide).

**Cohérence avec ADR-003** : les trois options appliquent la même conclusion de fond ; elles ne
diffèrent que par le véhicule technique.

**Impact sur le modèle de données** :
- **A** : aucun.
- **B** : **introduit une hétérogénéité de type entre qualités** — `Hypothesis.state` ne serait plus
  uniformément `TransitionState` pour les 8 qualités, ce qui modifie une décision déjà prise dans
  `PHASE_H_TECHNICAL_SPECIFICATION.md` §1 (un type `Hypothesis` unique pour toutes les qualités). Ce
  n'est pas la réouverture d'un ADR clinique, mais c'est la modification la plus significative des
  trois options vis-à-vis de la spécification technique déjà produite.
- **C** : **aucun** — réutilise un champ déjà spécifié, sans en ajouter ni en modifier la forme.

**Impact sur l'implémentation** :
- **A** : logique de plafonnement dispersée dans le moteur, sans lien explicite avec le marqueur
  d'exception déjà prévu pour la même qualité — deux mécanismes non reliés pour une seule exception
  clinique.
- **B** : nécessite un typage conditionnel ou une interface `Hypothesis` paramétrée par qualité — la
  complexité la plus élevée des trois pour un bénéfice (garantie au niveau du compilateur plutôt que
  du runtime) réel mais disproportionné au regard d'une seule qualité concernée sur huit.
- **C** : une seule condition supplémentaire dans l'étape d'évaluation de la catégorie confirmative
  (§3.3 de `PHASE_H_TECHNICAL_SPECIFICATION.md`, Étape 2a) : *si `ruleVariant ===
  'mobilite_exception'`, ne pas évaluer la confirmative comme convergente*. Cohérent avec l'endroit
  où l'exception diagnostique est déjà gérée.

## 5. Recommandation

**Option C.** Elle produit exactement le même comportement observable que B (Mobilité plafonnée à
Retenue/Faible) sans introduire l'hétérogénéité de type que B impose à un modèle de données
autrement uniforme pour les 8 qualités — un coût que la portée de l'exception (une seule qualité, un
seul palier concerné) ne justifie pas. Elle est également plus traçable qu'A : les deux
conséquences de l'exception Mobilité (seuil diagnostique à 1 preuve, confirmative non indépendante)
sont gouvernées par un seul et même marqueur déjà existant, plutôt que par deux mécanismes
distincts et non reliés dans le code. C'est la lecture qui applique ADR-003 avec la plus grande
économie de moyens.

## 6. Impact sur `PHASE_H_TECHNICAL_SPECIFICATION.md`

**Aucun changement du modèle de données (§1).** `Convergence.ruleVariant` reste tel que déjà
spécifié ; son usage est simplement étendu à un second point de lecture dans le pipeline (§3.3), pas
à une nouvelle propriété.

**§2.3, Exception Mobilité** — remplacer *"⚠️ Atteignabilité de Retenue/Modérée non tranchée"* par :
Retenue/Modérée est structurellement inatteignable pour `HYP-MOB-01`, par cohérence avec ADR-003 —
`Convergence.ruleVariant = 'mobilite_exception'` désactive la convergence confirmative pour cette
qualité. Le cycle observable de `HYP-MOB-01` se réduit en pratique à `Absente → Retenue/Faible`,
sans modification du type `TransitionState` lui-même.

**§7.5, tableau des cas de test** — la ligne `HYP-MOB-01`, colonne "cas limite", peut désormais
inclure explicitement : *vérifier que `state` n'atteint jamais `'retenue_moderee'` ni
`'retenue_forte'` quelles que soient les données d'entrée*.

## 7. Impact sur l'implémentation H1-H14

- **H4** : ajout d'une condition unique dans l'évaluation de la catégorie confirmative, gouvernée
  par `ruleVariant` déjà prévu — aucune nouvelle structure.
- **H6** : le test "Mobilité ne dépasse jamais Faible" devient un cas de test explicite et
  non-ambigu (§6 ci-dessus).
- **H1, H3, H7** : non concernés, aucun impact.

---

# Synthèse commune — ADR-007 et ADR-008

## Ces ADR modifient-ils le modèle de données ?
**Non, aucun des deux.** ADR-007 utilise les champs `status` déjà spécifiés dans
`ConfirmativeEvidence`/`ExplanatoryEvidence`. ADR-008 (Option C) réutilise `Convergence.ruleVariant`
déjà spécifié. Le modèle de données de `PHASE_H_TECHNICAL_SPECIFICATION.md` §1 reste intégralement
valide, sans amendement.

## Ces ADR bloquent-ils le démarrage de H1, H3, H6, H7 ?
**Non.** H1 (audit `THRESHOLDS`) et H7 (wiring `asymEngine`) portent sur des sujets indépendants de
ces deux ambiguïtés. H3 (objets de données) n'est pas affecté puisqu'aucun changement de modèle de
données n'est requis par l'une ou l'autre décision. **H6 (suite de tests) est en réalité débloqué
plutôt que contraint** : les cas de test qui ne pouvaient pas être rédigés sans ambiguïté avant ces
deux ADR (preuves mixtes convergentes/discordantes ; plafond de Mobilité) peuvent désormais l'être
explicitement.

## L'architecture peut-elle être considérée comme définitivement gelée après validation de ces deux ADR ?
**Partiellement, et il faut le préciser plutôt que répondre par oui ou non.** Ces deux ADR
lèvent les deux seules **ambiguïtés techniques bloquantes pour l'implémentation du moteur d'états
lui-même (H4)**, identifiées comme telles dans `PHASE_H_TECHNICAL_SPECIFICATION.md` §9.2 (points 1
et 2). Une fois validées, **le moteur pour les 7 qualités actives hors Absorption peut être
considéré comme spécifié sans ambiguïté technique résiduente** — H1 à H7 peuvent démarrer sans
aucune décision métier ou architecturale supplémentaire de ce type.

Cela ne signifie pas que l'ensemble de l'architecture est définitivement gelé au sens large :
quatre points restent ouverts, mais aucun n'est de même nature que les deux traités ici — ce sont
des dépendances déjà identifiées et correctement classées, pas des ambiguïtés nouvelles :
- **Exception Absorption/SLLT** (point 3 de `PHASE_H_TECHNICAL_SPECIFICATION.md` §9.2) — dépendance
  externe (rédaction du praticien), hors chemin critique (module H8), non traitée par ces deux ADR.
- **Besoin d'audit/traçabilité historique**, **intégration au Fil de Raisonnement**, **extension
  `ReportPreview`/`HistoriqueView` pour `asymEngine`** (points 4-6) — décisions produit, déjà
  classées comme telles dans `PHASE_G_IMPLEMENTATION_PLAN.md` §7.2, jamais requises pour démarrer
  H1-H7.

**Conclusion** : le socle technique du moteur HYP### V1 (H1-H7, 7 qualités) est prêt à être
implémenté sans réserve après validation d'ADR-007 et ADR-008. L'architecture globale du projet
reste, par construction, ouverte sur ces quatre points identifiés — pas parce que ces deux ADR
auraient échoué à la clore, mais parce que ces quatre points n'ont jamais été de nature technique
bloquante.

# ADR-007 — Discordant Evidence

## Statut

Analyse ciblée d'une ambiguïté technique identifiée dans `PHASE_H_TECHNICAL_SPECIFICATION.md` §2.1/
§9.2 (point 1), avant démarrage des modules H1-H14. Compatible avec `KINEXUS_REASONING_ENGINE_V1.md`,
`PHASE_F_ADR.md`, `PHASE_G_IMPLEMENTATION_PLAN.md`, `PHASE_H_TECHNICAL_SPECIFICATION.md`. Aucune
décision déjà validée n'est rouverte ; aucun concept architectural nouveau n'est introduit ; Vierge_7
non consulté (non nécessaire).

## 1. Problème

`PHASE_H_TECHNICAL_SPECIFICATION.md` §2.1 signale que le comportement exact du moteur n'est pas
disambiguë lorsqu'une preuve convergente (statut `deficitaire`, pointant vers l'hypothèse) et une
preuve discordante (statut `normal`) coexistent **simultanément, dans la même catégorie de preuve**,
pour la même hypothèse. ADR-001 (validé, `PHASE_F_ADR.md`) a déjà tranché le principe général
("affaiblissement plafonnant, jamais régressif, jamais annulant un diagnostic") mais sans préciser
l'arbitrage exact quand plusieurs preuves de même rang se contredisent entre elles.

## 2. Analyse

**Les 4 exemples cités ne sont pas tous au même niveau d'ambiguïté.**

- *Preuve diagnostique déficitaire + preuve confirmative normale* et *preuve diagnostique
  déficitaire + preuve explicative non cohérente* : **déjà résolus par la hiérarchie existante**,
  sans besoin de nouvel arbitrage. Une confirmative/explicative ne gouverne jamais la transition
  Suspectée→Retenue (gouvernée exclusivement par la convergence diagnostique, `Convergence.
  thresholdMet`) — sa discordance ne peut donc mécaniquement affecter que la transition propre à sa
  propre catégorie (Faible→Modérée pour une confirmative, Modérée→Forte pour une explicative),
  jamais le franchissement du seuil lui-même. C'est une conséquence directe et déjà actée de la
  séparation stricte diagnostique/confirmative/explicative (`KINEXUS_REASONING_ENGINE_V1.md` §3) —
  pas un point à trancher ici.
- *Plusieurs preuves convergentes + une preuve discordante* et *plusieurs preuves discordantes + une
  preuve convergente* (les deux **au sein d'une même catégorie**, ex. 3 confirmatives déficitaires +
  1 confirmative normale) : **c'est ici, et uniquement ici, que réside l'ambiguïté réelle.** La
  règle de progression ("≥1 preuve confirmative convergente") et la règle d'affaiblissement ("une
  confirmative normale plafonne") sont toutes deux vraies simultanément dans ce cas, sans qu'aucun
  document validé ne précise laquelle l'emporte.

## 3. Options

### A. La preuve discordante annule la progression
Toute preuve discordante au sein d'une catégorie **annule** l'effet des preuves convergentes de la
même catégorie, quel que soit leur nombre.

### B. La preuve discordante diminue le support
Une preuve discordante peut faire **redescendre** le support déjà atteint (ex. Retenue/Modérée →
Retenue/Faible), au-delà d'un simple plafonnement.

### C. La preuve discordante empêche uniquement certaines transitions
Une preuve discordante, au sein d'une catégorie donnée, **plafonne** la transition que cette
catégorie gouverne (Faible→Modérée pour une confirmative, Modérée→Forte pour une explicative) — sans
jamais toucher aux transitions gouvernées par une autre catégorie, et sans jamais faire redescendre
un état déjà atteint.

### D. Preuve discordante neutre — seule l'absence totale de convergence bloque
Une preuve discordante n'a **aucun effet** tant qu'au moins une preuve convergente existe dans la
même catégorie ; elle ne compte que si elle est la **seule** preuve évaluée dans cette catégorie.

## 4. Avantages / risques par option

| Option | Cohérence hiérarchie Diagnostique > Confirmative > Explicative | Cohérence ADR-001 | Cohérence absence de réfutation | Impact clinique | Impact technique |
|---|---|---|---|---|---|
| **A** | Cohérente sur le fait qu'aucune transition diagnostique n'est concernée, mais donne à une **seule** preuve discordante un pouvoir de veto supérieur à celui de plusieurs preuves convergentes de même rang — non justifié par un texte source, extension au-delà de ce que la hiérarchie établit | Le verbe employé par le praticien pour A ("annule") est plus fort que celui déjà validé par ADR-001 ("plafonne") — **dépasse ce qui a été validé** | Reste techniquement en dehors de la réfutation (n'affecte pas `state` en dessous de Retenue), mais se comporte comme une réfutation locale de la catégorie concernée, un risque de dérive conceptuelle | Risque de faux négatifs élevé : en pratique, une seule variable normale sur plusieurs déficitaires est un cas courant (variabilité biologique) — Modérée/Forte deviendraient rarement atteignables | Simple à coder (test booléen), mais sémantiquement floue ("annuler" jusqu'où ?) |
| **B** | Ferait dépendre l'état déjà atteint (Retenue, établi par le diagnostique) d'une catégorie de rang inférieur — **contredit directement** l'autorité décisive du diagnostique déjà établie | **Contredit frontalement ADR-001**, qui a explicitement validé "jamais régressive" comme principe déjà tranché | Une régression déclenchée par une catégorie inférieure au diagnostique s'apparente à une réfutation partielle, non autorisée (ADR-002 non validé) | Risque clinique élevé : une hypothèse valablement générée par le diagnostique pourrait disparaître sur la foi d'un signal de rang inférieur | Réouvrirait de facto ADR-001 — **hors périmètre de cet ADR** |
| **C** | Cohérente sans réserve : chaque catégorie ne gouverne que sa propre transition, jamais celle d'une autre, conformément à la séparation stricte déjà établie | **Reprend le verbe exact déjà validé** ("plafonne la progression") — application littérale, aucune extension | Aucune ambiguïté : ne touche jamais `state`, uniquement le franchissement d'une transition à venir | Conservateur mais prévisible : une catégorie n'est jugée "convergente" que si aucune de ses preuves ne la contredit — cohérent avec l'exigence de convergence déjà au cœur du modèle | Aucun nouveau champ requis — utilise les tableaux `ConfirmativeEvidence[]`/`ExplanatoryEvidence[]` déjà spécifiés (§1 de `PHASE_H_TECHNICAL_SPECIFICATION.md`) |
| **D** | Cohérente sur le papier, mais rend en pratique l'affaiblissement quasi inerte dès qu'une seule preuve convergente existe — vide le principe "affaiblir" d'une bonne part de son sens opérationnel | Compatible littéralement, mais réduit la portée d'ADR-001 à un cas marginal (catégorie enregistrant une seule preuve, entièrement discordante) | Aucune ambiguïté, comme C | Risque inverse de A : un déficit réel accompagné de plusieurs signaux normaux serait jugé aussi solide qu'un déficit unanimement confirmé — affaiblit la valeur informative du niveau de support | Simple à coder, mais sémantiquement en tension avec l'intention déjà validée d'ADR-001 |

## 5. Recommandation

**Option C.** Elle reprend littéralement le verbe déjà validé par ADR-001 ("plafonne la
progression"), sans l'étendre (contrairement à A, qui emploie "annule" — un registre plus fort que
ce qui a été validé) ni le contredire (contrairement à B, qui réouvrirait de facto ADR-001 en
autorisant une régression). Elle reste également plus fidèle à l'intention du modèle que D, qui rend
l'affaiblissement pratiquement sans effet dès qu'une preuve convergente coexiste — un résultat qui
viderait de sens la distinction entre catégories "toutes convergentes" et "partiellement
discordantes" que le système de support est précisément censé représenter.

**Règle retenue** : au sein d'une catégorie de preuve donnée (confirmative ou explicative),
**la présence d'au moins une preuve discordante plafonne la transition que cette catégorie gouverne
au niveau déjà atteint, indépendamment du nombre de preuves convergentes coexistantes dans la même
catégorie.** Cette règle s'applique indépendamment par catégorie : une confirmative discordante ne
plafonne jamais la transition Modérée→Forte (gouvernée par l'explicative), et réciproquement.

## 6. Impact sur `PHASE_H_TECHNICAL_SPECIFICATION.md`

**Aucun changement du modèle de données (§1).** `ConfirmativeEvidence[]`/`ExplanatoryEvidence[]`
contiennent déjà, pour chaque preuve, le `status` nécessaire à l'application de la règle — aucune
propriété supplémentaire requise.

**§2.1** — les deux mentions *"⚠️ Précision non tranchée par les documents source"* (transitions
Faible→Modérée et Modérée→Forte) sont levées : remplacer par la règle retenue en §5 ci-dessus.

**§3.3, Étape 2** — préciser que 2a/2b évaluent, pour chaque catégorie, une preuve booléenne
"au moins une discordance dans la catégorie" avant d'autoriser la transition correspondante.

## 7. Impact sur l'implémentation H1-H14

- **H4** (`computeHypothesisEngine()`) : la règle est directement codable, aucune ambiguïté
  résiduelle sur ce point pour cette étape.
- **H6** (suite de tests) : les cas "plusieurs preuves convergentes + une discordante" et
  "plusieurs discordantes + une convergente" (§7.5 de `PHASE_H_TECHNICAL_SPECIFICATION.md`)
  deviennent des cas de test explicitement rédigeables, alors qu'ils ne l'étaient pas avant cette
  décision.
- **H1, H3, H7** : non concernés, aucun impact.

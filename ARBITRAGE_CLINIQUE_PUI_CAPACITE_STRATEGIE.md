# Arbitrage clinique — HYP-PUI-01 : Capacité vs Stratégie d'exécution

**Statut** : document d'arbitrage. Rien n'est décidé ici — chaque question attend une réponse du
praticien. Aucun code, aucune modification de HYP###, aucune modification de `CLI###`, aucune
généralisation aux autres qualités. Lisible seul, sans relecture des documents précédents.

**Légende** : 🟢 déjà supporté par les sources · 🟠 inférence · 🔴 nouvelle décision clinique.

**Rappel du cadre** (issu de `HYP_PUI_CAPACITE_VS_STRATEGIE.md`) : Puissance est déjà diagnostiquée
par `cmj_peak_power` + `slcmj_peak_power` (2/2, condition déjà figée, non rouverte ici). Une fois
cette hypothèse Retenue, deux familles de variables explicatives existent : **34 variables
physiologiques** (Capacité — force absolue/relative, RFD, TTPF, profil force-vitesse) et **29
variables biomécaniques** (Stratégie — KPI de phase CMJ/SLCMJ). 🟢 Aucune variable explicative,
physiologique ou biomécanique, ne peut faire apparaître `HYP-PUI-01` elle-même ou lui faire franchir
le seuil Retenue — seule la preuve diagnostique le peut (règle déjà validée, non rouverte). Les
questions ci-dessous portent uniquement sur ce qui se passe **une fois `HYP-PUI-01` déjà Retenue** :
comment qualifier la branche (Capacité / Stratégie / Mixte / Non discriminable).

---

## Question 1 — Quand retenir « Déficit de capacité » ?

*(Précision de cadrage, 🟢 : comme rappelé ci-dessus, aucune option ci-dessous ne "génère" HYP-PUI-01
— celle-ci existe déjà via le diagnostic. Les trois options portent sur le seuil pour **étiqueter**
la branche Capacité une fois l'hypothèse déjà Retenue. Le principe "une variable diagnostique génère
une hypothèse faible" ne s'applique donc pas ici au sens strict — il s'applique déjà, en amont, à
`cmj_peak_power`/`slcmj_peak_power`.)*

### Option A — Une preuve suffit
Une seule variable parmi les 34 (ex. `hip_abd_n` seule déficitaire) → "Capacité potentiellement
déficitaire".
- **Sur les données Kinexus actuelles** : se déclenche très facilement — 34 variables candidates,
  souvent partiellement testées ; un seul test segmentaire hors norme suffirait.
- **Avantage** : sensibilité élevée, rien n'est manqué.
- **Risque** : surinterprétation. Une variable isolée parmi 34 (ex. un seul groupe musculaire) peut
  refléter une limite locale sans rapport avec la puissance globale du saut — faux positif probable.
- **Faux positif** : `hip_add_n` seule déficitaire, tout le reste normal → conclusion "capacité"
  potentiellement excessive pour un signal aussi localisé.
- **Faux négatif** : aucun — c'est l'option la plus permissive.
- **Compatibilité avec le principe HYP** : 🟠 compatible par analogie avec l'esprit "un signal
  suffit à générer un état bas" (Suspectée), mais applique ce principe à un niveau (étiquetage de
  branche) différent de celui pour lequel il a été validé (génération de l'hypothèse elle-même).

### Option B — Convergence de plusieurs variables
Plusieurs variables physiologiques déficitaires (nombre non précisé ici) → "Déficit de capacité".
- **Sur les données actuelles** : se déclenche moins souvent — nécessite au moins deux signaux
  convergents parmi les 34, sans exiger qu'ils viennent de familles différentes.
- **Avantage** : plus robuste qu'A, sans la rigueur exigeante de C.
- **Risque** : si peu de variables physiologiques sont testées pour un patient donné (protocole
  incomplet), le seuil peut ne jamais être atteint même en présence d'un déficit réel.
- **Faux positif** : plus rare qu'A (ex. deux tests segmentaires voisins déficitaires par corrélation
  anatomique plutôt que par déficit réel de puissance).
- **Faux négatif** : patient avec un seul test physiologique réalisé, déficitaire → jamais qualifié
  "capacité" faute de convergence, malgré un signal réel.
- **Compatibilité avec le principe HYP** : 🟢 cohérente avec la logique de graduation déjà utilisée
  ailleurs dans le moteur (Faible→Modérée→Forte via convergence croissante de preuves).

### Option C — Convergence de mécanismes
Une seule famille (ex. uniquement des tests segmentaires de magnitude) ne suffit pas ; il faut une
convergence entre familles différentes (ex. magnitude **et** RFD, ou magnitude **et** profil F-V).
- **Sur les données actuelles** : se déclenche rarement — exige des tests de nature différente,
  souvent non tous réalisés dans un même bilan.
- **Avantage** : forte spécificité, écarte le risque de sur-lecture d'une seule famille de mesure.
- **Risque** : peut manquer des déficits réels mais mono-familiaux (ex. un déficit de force pur,
  bien confirmé par 5 tests segmentaires convergents, mais tous de la même famille "magnitude").
- **Faux positif** : très rare.
- **Faux négatif** : patient avec un déficit de force massif mais confirmé uniquement par des
  variables de magnitude (aucun test RFD réalisé) → jamais qualifié "capacité" malgré un signal fort
  et cohérent.
- **Compatibilité avec le principe HYP** : 🟢 la plus cohérente architecturalement — reprend
  directement le principe déjà validé ailleurs (ADR-003 : convergence évaluée à l'échelle des
  mécanismes/tests indépendants, pas par simple comptage de variables).

**Recommandation** (à titre indicatif seulement) : B — meilleur compromis entre robustesse et
faisabilité pratique compte tenu du taux de tests souvent incomplet ; C, bien que le plus cohérent
architecturalement, risque une sous-détection trop fréquente vu la variabilité des protocoles de
bilan réels.

**DÉCISION DU PRATICIEN : A / B / C / AUTRE** → _______________

---

## Question 2 — Force et RFD dans la branche Capacité

*(Rappel : la non-hiérarchisation Force/RFD reste acquise, non rouverte. Cette question porte sur
leur mode de combinaison, pas sur leur priorité relative.)*

### Option A — Deux mécanismes indépendants, chacun suffisant seul
Force seule déficitaire → signal de capacité. RFD seule déficitaire → signal de capacité. Aucune
exigence de les voir ensemble.
- **Conséquence clinique** : un patient avec seulement un déficit de RFD (force normale) est traité
  identiquement, en termes de qualification de branche, à un patient avec un déficit de force pure.
- **Avantage** : simple, sensible, cohérent avec l'absence de hiérarchie déjà décidée.
- **Risque** : traite deux profils physiologiquement différents (déficit de magnitude vs déficit de
  vitesse de production) comme équivalents au niveau de la conclusion "capacité" — perd
  l'information qui a motivé, ailleurs, la distinction magnitude/RFD.
- **Exemple** : Profil 5 de `HYP_PUI_CAPACITE_VS_STRATEGIE.md` (RFD↓, force conservée) → "capacité"
  au même titre que le Profil 4 (force↓ seule).

### Option B — Convergence nécessaire pour un déficit "fort"
Force seule ou RFD seule → signal de capacité "faible"/"suspecté". Force **et** RFD convergents →
"déficit de capacité" au niveau le plus assuré.
- **Conséquence clinique** : introduit une gradation interne à la branche Capacité, sans rejeter
  aucun des deux signaux prise isolément.
- **Avantage** : 🟢 **ne nécessite pas de nouvelle règle** — c'est une application directe du
  mécanisme de graduation du support déjà validé pour tout le moteur HYP### (une preuve seule =
  support plus bas ; convergence = support plus élevé, `KINEXUS_REASONING_ENGINE_V1.md` §2). Rien
  n'est inventé, seulement réutilisé.
- **Risque** : aucun risque technique nouveau — le seul point à trancher est si cette gradation de
  support doit se refléter dans le **texte** affiché au praticien (voir Question 8), ce qui reste,
  lui, une décision nouvelle.
- **Exemple** : Profil 7 (`imtp_n`↓ + `imtp_rfd100`↓ + `profil_fv_nkg`↓ simultanément) → capacité
  avec le niveau de confiance le plus élevé disponible.

### Option C — Deux explications parallèles, sans règle de convergence
Force et RFD restent deux signaux affichés indépendamment, sans tentative de les combiner en un
niveau de confiance unique.
- **Conséquence clinique** : le praticien voit "force ↓" et/ou "RFD ↓" séparément, sans synthèse
  "capacité faible/forte".
- **Avantage** : le plus simple à mettre en œuvre, aucune règle de combinaison à définir.
- **Risque** : reporte sur le praticien tout le travail de synthèse que le moteur pourrait faire —
  moins utile qu'un système qui distingue déjà "un signal" d'"une convergence".

**Recommandation** (à titre indicatif) : B — n'ajoute aucune règle nouvelle, réutilise un mécanisme
déjà validé, tout en conservant l'information de convergence utile au praticien.

**DÉCISION DU PRATICIEN : A / B / C / AUTRE** → _______________

---

## Question 3 — Quand retenir « Stratégie d'exécution » ?

*(Rappel acquis, non rouvert : absence de déficit observé ≠ preuve que la capacité est normale.)*

### Option A — Stratégie possible, même sans capacités testées
Puissance ↓ + biomécanique anormale → "stratégie potentiellement problématique", que les capacités
physiologiques aient été testées ou non.
- **Conséquence** : la branche Stratégie peut être évoquée même en l'absence totale de données sur la
  branche Capacité.
- **Risque principal** : contredit directement le principe déjà acquis ("absence de déficit observé
  ≠ preuve de capacité normale") — une biomécanique anormale chez un patient dont la force n'a jamais
  été testée serait qualifiée "stratégie" sans qu'on sache si un déficit de capacité, non détecté
  faute de test, n'en est pas la véritable cause.
- **Faux positif** : patient avec un déficit de force réel mais jamais testé, biomécanique anormale
  en conséquence (compensation) → étiqueté "stratégie" alors que la cause réelle est un déficit de
  capacité non mesuré.

### Option B — Stratégie retenue uniquement si les capacités pertinentes sont testées et normales
Puissance ↓ + capacités pertinentes évaluées et non déficitaires + biomécanique anormale →
"stratégie". Sinon → "non discriminable".
- **Conséquence** : la branche Stratégie devient plus rare à afficher, mais chaque fois qu'elle
  l'est, la condition "capacités non déficitaires" a été vérifiée sur des données réelles, pas
  supposée.
- **Avantage** : seule option cohérente avec le principe déjà acquis.
- **Risque** : nécessite de définir "capacités pertinentes évaluées" — reporté à la Question 4, pas
  résolu ici.
- **Faux négatif** : patient réellement en problème de stratégie pure, mais dont peu de tests
  physiologiques ont été réalisés → reste "non discriminable" plutôt que "stratégie", même si la
  conclusion clinique réelle est probablement juste.

### Option C — Stratégie uniquement confirmative, jamais une branche autonome
Les variables biomécaniques ne permettent jamais, seules, d'afficher "Stratégie" comme conclusion —
elles ne font que renforcer/nuancer une conclusion déjà établie par ailleurs.
- **Conséquence** : la branche Stratégie, telle que demandée dans cette mission (B), ne serait
  jamais affichée comme conclusion autonome — revient, de fait, à ne pas implémenter cette
  distinction pour le moment, seulement à conserver les 29 variables comme contexte descriptif.
- **Avantage** : le plus prudent, zéro risque de faux positif de type "stratégie".
- **Risque** : annule une partie de l'objectif clinique de cette mission (pouvoir dire "stratégie
  inefficiente" quand c'est le cas) — à signaler explicitement comme une option qui **réduit** la
  portée de la distinction demandée, pas seulement qui la sécurise.

**Recommandation** (à titre indicatif) : B — seule option cohérente avec le principe déjà acquis,
au prix d'exiger une définition de "capacités pertinentes évaluées" (Question 4).

**DÉCISION DU PRATICIEN : A / B / C / AUTRE** → _______________

---

## Question 4 — Quelles capacités doivent être testées ? *(si Option B retenue en Q3)*

### Niveau 1 — Au moins une mesure physiologique globale disponible
Ex. un seul test parmi les 34 (n'importe lequel) suffit à considérer les capacités "évaluées".
- **Avantage** : très facile à satisfaire, la branche Stratégie devient utilisable dans la majorité
  des bilans.
- **Limite** : un seul test parmi 34 ne couvre qu'une fraction infime de la capacité physiologique
  réelle — force du quadriceps normale ne dit rien de la force des adducteurs, du RFD, ou du profil
  force-vitesse.
- **Risque de faux diagnostic de stratégie** : élevé — une seule mesure normale parmi 34 possibles
  ne garantit pas l'absence de déficit ailleurs.

### Niveau 2 — Les principales capacités physiologiques liées à la puissance sont mesurées
Ex. les tests globaux (`imtp`/`slimtp`, magnitude **et** RFD) testés et normaux, sans exiger les 11
tests segmentaires ni le profil force-vitesse.
- **Avantage** : couvre les mesures les plus directement rattachées à la puissance dans la fiche
  source (IMTP/SLIMTP sont les tests de force globaux cités en premier dans
  `HYP_ARCHITECTURE_PHASE_C.md`), sans exiger un bilan exhaustif.
- **Limite** : nécessite de définir précisément ce qu'est "principal" — un choix qui, lui-même,
  n'est pas neutre (pourquoi IMTP/SLIMTP et pas le profil force-vitesse ?).
- **Risque de faux diagnostic de stratégie** : modéré — un déficit segmentaire isolé (ex. un seul
  groupe musculaire) resterait possible sans être détecté par ce niveau.

### Niveau 3 — Toutes les familles physiologiques pertinentes disponibles dans Kinexus sont mesurées
Les 34 variables (ou au minimum une par famille : magnitude, RFD, TTPF, profil F-V) testées et
normales.
- **Avantage** : le plus rigoureux, écarte au maximum le risque de faux diagnostic de stratégie.
- **Limite** : très exigeant — un bilan complet sur les 34 variables est rarement réalisé en pratique
  clinique courante ; la branche Stratégie deviendrait rarement mobilisable.
- **Risque de faux diagnostic de stratégie** : le plus faible des trois niveaux, par construction.

**Recommandation** (à titre indicatif) : Niveau 2 — équilibre entre rigueur et faisabilité, mais la
définition exacte de "principales capacités" reste elle-même une décision à arbitrer, pas un fait
déjà établi par les sources.

**DÉCISION DU PRATICIEN : NIVEAU 1 / 2 / 3 / AUTRE** → _______________

---

## Question 5 — Cas mixte (Capacité ↓ + Stratégie anormale)

### Option A — Capacité prioritaire (orientation unique)
- **Conséquence** : le praticien ne voit que "déficit de capacité", la stratégie anormale disparaît
  de la conclusion affichée.
- **Risque** : perte d'information réelle et mesurée (les 29 variables biomécaniques restent
  disponibles dans le détail, mais la synthèse les masque).
- **Statut de la règle nécessaire** : 🔴 aucune règle de priorité Capacité > Stratégie n'existe dans
  les sources — pure invention si retenue.

### Option B — Stratégie prioritaire (orientation unique)
- **Conséquence** : symétrique à A — le déficit de capacité, pourtant mesuré, disparaît de la
  conclusion affichée.
- **Statut de la règle nécessaire** : 🔴 même remarque, aucun fondement source pour cette priorité
  inverse.

### Option C — Profil mixte, deux mécanismes affichés sans hiérarchie
- **Conséquence** : le praticien voit les deux constats, sans qu'aucun ne soit présenté comme "la"
  cause.
- **Avantage** : 🟢 seule option qui ne nécessite aucune règle nouvelle — reprend le principe déjà
  validé "cumulable, non substituable" entre catégories explicatives.
- **Limite déjà signalée** (`HYP_PUI_CAPACITE_VS_STRATEGIE.md` §6) : présenter "deux causes" ne
  résout pas la question, plus profonde, de savoir si la stratégie anormale est une cause
  indépendante, une conséquence, ou une compensation du déficit de capacité — question non
  discriminable avec le modèle actuel, quelle que soit l'option choisie ici.

### Option D — Hiérarchisation automatique selon des règles supplémentaires
- **Conséquence** : nécessiterait de définir un critère de priorité (magnitude du déficit ? nombre de
  preuves convergentes ? antériorité temporelle — inexistante dans le modèle ?).
- **Statut** : 🔴 **nécessite explicitement de nouvelles règles absentes des sources**, comme demandé
  à signaler. Aucun critère de ce type n'existe aujourd'hui dans `HYP-PUI-01` ni ailleurs dans le
  moteur V1.

**Recommandation** (à titre indicatif) : C — la seule option qui ne demande aucune règle nouvelle et
reste honnête sur la limite causale non résolue.

**DÉCISION DU PRATICIEN : A / B / C / D** → _______________

---

## Question 6 — Une seule branche mesurée (biomécanique anormale, capacité non testée)

### Option A — « Stratégie suspectée »
- **Conséquence** : affiche une conclusion orientée alors que la condition retenue en Q3 (si Option
  B) ne serait, par construction, pas remplie — incohérent avec Q3-B.
- **Risque** : réintroduit exactement le faux positif que Q3-B cherchait à éviter (biomécanique
  anormale compensant un déficit de capacité non détecté, faute de test).

### Option B — « Puissance déficitaire — mécanisme non déterminable »
- **Conséquence** : reconnaît le déficit diagnostique sans avancer de mécanisme, cohérent avec
  l'absence de données exploitables sur l'une des deux branches.
- **Avantage** : honnête, ne perd aucune information (rien n'est affirmé à tort).

### Option C — « Données insuffisantes »
- **Conséquence** : proche de B, avec une formulation qui pointe explicitement vers l'action
  attendue (compléter le bilan) plutôt que vers un constat clinique figé.
- **Avantage** : peut orienter le praticien vers la donnée manquante plutôt que de simplement
  constater une limite.

**Conséquence commune à B et C** : cohérentes avec le principe déjà acquis (absence de test ≠
capacité normale) — contrairement à A.

**DÉCISION DU PRATICIEN : A / B / C / AUTRE** → _______________

---

## Question 7 — Données contradictoires

*(Consigne explicite : pas de recommandation sur cette question.)*

Exemples donnés :
- Force ↓ + RFD normale + biomécanique anormale.
- Force normale + RFD ↓ + biomécanique normale.

**Remarque de cadrage, sans trancher** : ces deux exemples ne sont pas, à proprement parler,
"contradictoires" au sens d'un conflit entre preuves opposées — ce sont des profils déjà couverts par
les Questions 1-2 (RFD seule = Question 2) et par la Question 5 (capacité + stratégie = cas mixte).
Le choix fait en Q1/Q2/Q5 détermine donc déjà, mécaniquement, comment ces deux exemples seraient
traités — cette question ne demande pas une règle supplémentaire indépendante, mais confirme que les
réponses aux questions précédentes couvrent bien ces cas.

Options, reprises telles que formulées, sans préférence exprimée :
- **A. Conserver plusieurs mécanismes simultanément** — cohérent avec Q5-C si retenue.
- **B. Choisir le mécanisme le plus probable** — nécessiterait la même règle de priorité que Q5-A/B,
  🔴 absente des sources.
- **C. Afficher "profil mixte / non discriminable"** — cohérent avec Q5-C/Q6-B selon le cas.
- **D. Autre.**

**DÉCISION DU PRATICIEN : A / B / C / D** → _______________

---

## Question 8 — Niveau de langage à afficher

*(Propositions, pas des formulations imposées — à ajuster librement.)*

| Registre | Capacité | Stratégie | Mixte | Non discriminable |
|---|---|---|---|---|
| **Signal** (une preuve, avant convergence) | *"Signal en faveur d'un déficit de capacité"* | *"Signal en faveur d'une stratégie d'exécution atypique"* | — | — |
| **Hypothèse** (plausible, pas encore assez de preuve) | *"Déficit de capacité physiologique suspecté"* | *"Stratégie d'exécution potentiellement inefficiente"* | — | — |
| **Conclusion retenue** (condition de branche satisfaite) | *"Profil compatible avec un déficit de capacité physiologique"* | *"Profil compatible avec une stratégie d'exécution inefficiente"* | *"Profil associant un déficit de capacité et une anomalie de stratégie, sans lien de cause établi entre les deux"* | *"Puissance déficitaire — mécanisme explicatif non discriminable avec les données disponibles"* |
| **Orientation** (rattachée à `CLI040`, texte inchangé) | *"Augmenter la puissance maximale — travailler la capacité de production de force"* | *"Augmenter la puissance maximale — travailler l'expression du mouvement"* | *"Augmenter la puissance maximale — capacité et stratégie d'exécution à considérer conjointement"* | *"Augmenter la puissance maximale — mécanisme à préciser par un bilan complémentaire"* |

**Point à trancher** : ces textes seraient des **compléments d'affichage** autour de `CLI040`
inchangée, pas une modification de `CLI040` elle-même (cohérent avec "aucune modification de
`CLI###`"). Reste à décider si un tel complément textuel est souhaité à ce stade, ou si seule la
qualification de branche (sans texte narratif) suffit pour l'instant.

**DÉCISION DU PRATICIEN** (formulations à garder / modifier / reporter) → _______________

---

## Tableau final des décisions

| Question | Options | Recommandation Claude | Décision praticien |
|---|---|---|---|
| 1. Seuil capacité | A / B / C | B | |
| 2. Force vs RFD | A / B / C | B | |
| 3. Seuil stratégie | A / B / C | B | |
| 4. Niveau de tests requis | 1 / 2 / 3 | Niveau 2 | |
| 5. Cas mixte | A / B / C / D | C | |
| 6. Une seule branche mesurée | A / B / C | B ou C | |
| 7. Données contradictoires | A / B / C / D | *(aucune, cf. cadrage Q7)* | |
| 8. Niveau de langage | formulations proposées | *(à ajuster librement)* | |

---

## Rappel — minimum de règles

Sur les 8 questions, si les recommandations ci-dessus étaient toutes retenues, le nombre de règles
**réellement nouvelles** serait limité à :
- Q1 (seuil "plusieurs variables" pour Capacité) — 🔴 nouvelle règle, nombre exact non fixé ici.
- Q3 (capacités testées et normales requises pour Stratégie) — 🔴 nouvelle règle.
- Q4 (définition de "capacités pertinentes évaluées") — 🔴 nouvelle règle.
- Q6 (formulation du cas "une seule branche mesurée") — 🔴 nouvelle règle légère, purement textuelle.

Q2 et Q5 (si B/C retenues) ne demandent **aucune règle nouvelle** — elles réutilisent des mécanismes
déjà validés ailleurs dans le moteur V1. Q7 est mécaniquement résolue par Q1/Q2/Q5. Q8 est un choix
de formulation, pas une règle de raisonnement. Le minimum réel de décisions cliniques nouvelles
tient donc en trois points : le seuil de convergence pour Capacité, la condition d'éligibilité pour
Stratégie, et la définition de "capacités pertinentes évaluées".

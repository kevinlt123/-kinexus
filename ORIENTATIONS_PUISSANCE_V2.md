# Granularité des orientations cliniques de Puissance — analyse et proposition

**Statut** : document d'analyse et de proposition. Aucun code, aucune modification de HYP###,
aucune modification de `CLI###`. Rien de ce document n'est validé par défaut — chaque proposition
porte un statut explicite et doit être arbitrée par le praticien avant toute évolution réelle.

**Légende (imposée, trois valeurs)** :
- 🟢 **SOURCE EXPLICITE** — écrit littéralement dans les documents source.
- 🟠 **INFERENCE** — cohérent avec les sources, non écrit littéralement.
- 🔴 **NOUVELLE RÈGLE À VALIDER** — ne constitue pas une conclusion, seulement une proposition
  soumise à l'arbitrage du praticien.

**Sources** : `PROTOTYPE_RAISONNEMENT_PUISSANCE.md`, `INTERPRETATION_VARIABLES_PUISSANCE.md`,
`CARTOGRAPHIE_VARIABLES_HYP.md`, `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`, `HYP_ARCHITECTURE_PHASE_C.md`
(fiches HYP-PUI-01, HYP-FOR-01, HYP-EXP-01), `KINEXUS_REASONING_ENGINE_V1.md`. Aucune autre source
consultée, aucune donnée Vierge_7 relue au-delà de ce qui est déjà cité dans ces documents.

---

## 1. État actuel de `CLI040`

**Quelle question clinique couvre `CLI040` ?**
🟢 *"Augmenter la puissance maximale"* — déclenchée quand le score de Puissance est diminué,
c'est-à-dire quand `HYP-PUI-01` atteint l'état Retenue (`cmj_peak_power` **et**
`slcmj_peak_power` déficitaires conjointement, condition la plus stricte du corpus,
`HYP_ARCHITECTURE_PHASE_C.md`). La question posée par `CLI040` est donc : *"la capacité de ce
patient à produire un pic de puissance mécanique lors d'un saut vertical est-elle insuffisante ?"* —
pas encore *"pourquoi"*.

**Quelles variables/mécanismes y sont actuellement associés ?**
🟢 Le déclencheur est strictement diagnostique (`cmj_peak_power`/`slcmj_peak_power`). Les
explicatives citées par Vierge_7 au niveau de l'orientation elle-même sont **deux qualités
entières** : *"Force"* et *"Explosivité"* — pas des variables individuelles
(`HYP_ARCHITECTURE_PHASE_C.md` : *"l'orientation elle-même pointe vers les qualités Force et
Explosivité... un niveau d'abstraction différent de celui des fiches de qualité"*). En pratique
(`CARTOGRAPHIE_VARIABLES_HYP.md`, `INTERPRETATION_VARIABLES_PUISSANCE.md`), 61 variables
explicatives individuelles (magnitude de force, RFD/TTPF, profil force-vitesse, 29 KPI de stratégie
CMJ/SLCMJ) peuvent chacune faire progresser le support de `HYP-PUI-01` sans jamais changer
l'orientation produite — toutes convergent vers `CLI040`.

**Pourquoi 61 variables peuvent-elles converger vers cette même orientation ?**
🟢 Parce que le modèle de données V1 attache l'orientation à l'**hypothèse** (`HYP-PUI-01`), pas au
**mécanisme explicatif** qui l'a fait progresser (`KINEXUS_REASONING_ENGINE_V1.md` §5 : *"une
hypothèse Retenue/Faible et une hypothèse Retenue/Forte déclenchent la même orientation ; seule
l'étiquette de confiance qui l'accompagne diffère"*). Le support (Faible/Modérée/Forte) transmet une
métadonnée de confiance, jamais une métadonnée de cause. Aucune règle du moteur V1 ne relie un
sous-ensemble de variables explicatives à une orientation distincte pour Puissance — contrairement à
Force, dont le Niveau 2 (`CLI200`-`213`) relie explicitement chaque variable segmentaire à une
orientation propre.

**Cette convergence est-elle cohérente ou trop grossière ?**
Question à traiter avec prudence, sans réponse binaire :
- Elle est **cohérente** avec la hiérarchie décisive du moteur (`KINEXUS_REASONING_ENGINE_V1.md`
  §3) : le niveau diagnostique a l'autorité sur l'existence de l'hypothèse, les niveaux
  confirmatif/explicatif ne font que graduer un support déjà acquis, jamais créer une orientation
  distincte. Ce n'est donc pas un bug du moteur — c'est le comportement prévu d'une architecture qui
  n'a jamais été conçue, pour Puissance, avec une couche d'orientation différenciée par mécanisme.
- Elle apparaît **potentiellement trop grossière** du point de vue clinique si — et seulement si —
  certains de ces 61 mécanismes appellent réellement des interventions de nature différente. C'est
  précisément la question analysée dans ce document (§2-§7), sans réponse préjugée ici.

**Quelles informations cliniques sont perdues lorsqu'elles convergent toutes vers `CLI040` ?**
🟢/🟠 Ce qui est réellement perdu au niveau de l'*orientation* (pas au niveau du raisonnement, qui
reste disponible ailleurs — Fil de Raisonnement, matrice explicative) :
- La distinction entre un déficit de **magnitude de force** et un déficit de **vitesse de
  production de force** (RFD) — deux catégories de variables réellement distinctes
  (`INTERPRETATION_VARIABLES_PUISSANCE.md` §4), mais dont l'orientation finale ne varie pas.
- La distinction entre une cause **physiologique** (force, profil F-V) et une cause
  **biomécanique/technique** (stratégie d'exécution du saut) — également non répercutée dans le
  texte de l'orientation.
- Toute indication, dans l'orientation elle-même, du **nombre** ou de la **nature** des mécanismes
  convergents (un seul mécanisme déficitaire vs plusieurs simultanément) — cette information existe
  dans les données de l'hypothèse (`triggeredOrientations`, `explanatoryEvidence`,
  `PHASE_H_TECHNICAL_SPECIFICATION.md` §1) mais n'est pas reflétée dans le libellé `CLI040` transmis
  au praticien.

Aucune correction n'est proposée à ce stade — ce point est développé en §5-§7.

---

## 2. Mécanismes explicatifs actuellement reconnus

Reconstruction stricte, sans ajout, à partir de `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §3 et
`INTERPRETATION_VARIABLES_PUISSANCE.md` §1-3.

| Famille | Variables (nombre) | Ce qu'elles mesurent | Mécanisme explicatif | Orientation `CLI` actuelle | Niveau de preuve |
|---|---|---|---|---|---|
| **Force absolue/relative** | `imtp_n`/`nkg`, `slimtp_n`/`nkg`, + 11 tests segmentaires `_n`/`_nkg` (26 variables) | Force isométrique de pic, en valeur absolue ou relative au poids de corps | Capacité de production de force maximale | `CLI040` | 🟢 appartenance / 🟠 mécanisme précis |
| **RFD / vitesse de développement de force** | `imtp_rfd100`/`rfd200`/`ttpf`, `slimtp_rfd100`/`rfd200`/`ttpf` (6 variables) | Pente de la courbe force-temps sur un intervalle fixe, ou délai pour atteindre le pic | Vitesse à laquelle la force est produite, indépendamment de sa magnitude finale | `CLI040` | 🟢 appartenance / 🟠 statut de mécanisme distinct pour Puissance (🟢 pour Explosivité uniquement, `CLI030`) |
| **Profil force-vitesse** | `profil_fv_nkg` (F0), `profil_fv_v0` (V0) (2 variables) | Composantes théoriques force/vitesse du modèle force-vitesse extrapolé | Orientation du profil individuel vers la force ou vers la vitesse | `CLI040` | 🟢 catégorie / 🟠 lecture du sous-profil |
| **Stratégie biomécanique CMJ** | 15 KPI de phase (unloading/braking/concentric/flight/landing) | Exécution du mouvement de saut, phase par phase | Technique d'exécution, indépendante de la capacité de force sous-jacente | `CLI040` | 🟢 catégorie / 🟠 mécanisme par variable |
| **Stratégie biomécanique SLCMJ** | 14 KPI équivalents, unilatéraux | idem, version unilatérale | idem | `CLI040` | 🟢 catégorie / 🟠 mécanisme par variable, regroupement de phase lui-même 🟠 (pas de métadonnée équivalente à `CMJ_VAR_META` pour SLCMJ) |
| **Explosivité (niveau qualité)** | aucune variable individuelle formalisée | — | `HYP-EXP-01` citée comme qualité explicative possible de Puissance | `CLI040` (mention narrative uniquement) | 🟢 citation / 🔴 mécanisme d'application non spécifié |
| **Puissance relative** | lecture PP/BM du diagnostic lui-même (pas une variable explicative séparée) | Rapport entre puissance absolue et poids de corps | Distinction absolu/relatif, orthogonale aux mécanismes ci-dessus | `CLI041` (déjà distincte) | 🟢 existence de l'orientation / 🟢 absence de condition numérique documentée |

Aucune famille n'est ajoutée par rapport à `INTERPRETATION_VARIABLES_PUISSANCE.md`.

---

## 3. Analyse de la granularité actuelle

### Distinction cause / orientation (point 4 de la mission, traité ici explicitement)

Un principe à appliquer strictement avant le tableau ci-dessous : **expliquer n'est pas
orienter différemment**. Deux mécanismes physiologiquement distincts peuvent légitimement partager
la même orientation si l'intervention qu'ils appellent est, à ce niveau d'abstraction (orientation,
pas prescription), identique. Inversement, deux variables d'une même famille pourraient en
principe justifier des orientations différentes si leur implication clinique diverge réellement.
Aucune des deux directions n'est tranchée a priori — chaque ligne du tableau ci-dessous est
argumentée séparément.

| Mécanisme | Orientation actuelle | Orientation différente potentiellement pertinente ? | Pourquoi ? | Preuve | Statut |
|---|---|---|---|---|---|
| Force absolue/relative (magnitude) | `CLI040` | Oui, candidate | Un déficit de *capacité* de force et un déficit de *vitesse* de production de force appellent, en théorie du geste sportif, des registres d'intervention distincts (développer une capacité vs développer une qualité neuromusculaire de rapidité) — mais cette distinction n'est **écrite nulle part pour Puissance elle-même** | 🟠 | 🔴 À VALIDER |
| RFD / vitesse de développement de force | `CLI040` | Oui, candidate | Même raisonnement, dans le sens inverse. Un précédent structurel existe dans le corpus : `CLI030` (Explosivité) sépare déjà explicitement "améliorer la vitesse de développement de force" comme orientation autonome — preuve que ce type de distinction est **plausible dans l'architecture Vierge_7**, sans être **écrit pour Puissance** | 🟠 (précédent réel ailleurs) | 🔴 À VALIDER |
| Profil force-vitesse (F0/V0) | `CLI040` | Faible — se recoupe largement avec les deux lignes ci-dessus | F0 mesure une composante "force", V0 une composante "vitesse" — une orientation distincte pour ce sous-profil ferait doublon avec une éventuelle séparation magnitude/RFD, sans ajouter d'information nouvelle | 🟠 | 🔴 À VALIDER (probablement à fusionner avec les deux lignes précédentes plutôt qu'à séparer davantage) |
| Stratégie biomécanique (CMJ/SLCMJ, 29 KPI) | `CLI040` | Oui, candidate forte | Une cause "technique d'exécution" (comment le mouvement est réalisé) est conceptuellement distincte d'une cause "capacité physique sous-jacente" (ce que le corps peut produire) — cette séparation Force/stratégie est déjà nommée comme deux catégories distinctes dans la fiche Phase C elle-même (`HYP_ARCHITECTURE_PHASE_C.md` : "variables explicatives physiologiques" vs "variables explicatives biomécaniques"), un niveau de preuve plus fort que pour la distinction magnitude/RFD | 🟢 (catégories nommées séparément) / 🟠 (lien vers une orientation distincte) | 🔴 À VALIDER, mais avec un fondement source plus solide |
| Explosivité (niveau qualité) | `CLI040` (mention narrative) | Non — ferait doublon | `HYP-EXP-01` a déjà sa propre orientation autonome (`CLI030`/`CLI031`). Créer une orientation Puissance-spécifique pour ce mécanisme dupliquerait une orientation existante plutôt que d'en créer une nouvelle légitimement distincte | 🟢 (l'orientation existe déjà ailleurs) | Pas une candidate à la séparation — plutôt une candidate au **renvoi croisé** (voir §7) |
| Force segmentaire individuelle (13 tests pris un par un) | `CLI040` | Non | Ce niveau de granularité (par muscle) est déjà couvert par le Niveau 2 de **Force** (`CLI200`-`213`) — Vierge_7 le dit explicitement : *"Aucun lien segmentaire dédié... devrait être investigué via le Niveau 2 de Force, pas via une section propre à Puissance"* (`HYP_ARCHITECTURE_PHASE_C.md`) | 🟢 | Tranché par les sources — pas une candidate |
| Puissance absolue vs relative | `CLI041` | Déjà séparée | — | 🟢 | Déjà résolu, cité pour mémoire |

---

## 4. Profils cliniques de Puissance

*Synthétiques, ne représentent aucun patient réel. Construits pour couvrir chaque combinaison
pertinente de mécanismes identifiés en §2.*

### Profil A — Force ↓ isolée
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; `imtp_n`/`slimtp_n` (ou segmentaire) ↓ ; RFD normale ;
biomécanique normale.
- **Mécanisme(s)** : Force absolue/relative seule.
- **Orientation actuelle** : `CLI040`.
- **Orientation potentiellement différente** : 🔴 "restaurer une capacité de force maximale" —
  distincte de la RFD (Profil B) et de la stratégie (Profil D).
- **Informations manquantes** : aucune spécifique à ce profil.
- **Statut** : 🔴 À VALIDER.

### Profil B — RFD ↓ isolé
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; force magnitude normale ; `imtp_rfd100`/`slimtp_rfd100`↓ ;
biomécanique normale.
- **Mécanisme(s)** : RFD seule.
- **Orientation actuelle** : `CLI040`.
- **Orientation potentiellement différente** : 🔴 "développer la vitesse de production de force" —
  précédent structurel `CLI030` (Explosivité), mais non écrit pour Puissance.
- **Informations manquantes** : fréquence réelle de ce profil isolé en pratique clinique — NON
  DOCUMENTÉ, question empirique que ce document ne peut pas trancher.
- **Statut** : 🔴 À VALIDER.

### Profil C — Force ↓ et RFD ↓ simultanément
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; magnitude **et** RFD déficitaires ensemble.
- **Mécanisme(s)** : les deux.
- **Orientation actuelle** : `CLI040`.
- **Orientation potentiellement différente** : 🔴 Si les Profils A et B recevaient chacun une
  orientation propre, ce profil poserait directement la question non résolue de §6/§7 du prototype :
  présenter les deux orientations simultanément, ou une orientation combinée ? Aucune règle de
  priorisation n'existe (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §6).
- **Informations manquantes** : règle de présentation en cas de cumul — absente des sources.
- **Statut** : 🔴 À VALIDER — dépend directement de la décision prise pour A et B.

### Profil D — Stratégie biomécanique anormale isolée
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; Force et RFD normales ; une ou plusieurs variables de
stratégie CMJ/SLCMJ anormales.
- **Mécanisme(s)** : stratégie biomécanique seule.
- **Orientation actuelle** : `CLI040`.
- **Orientation potentiellement différente** : 🔴 "corriger la stratégie d'exécution du mouvement de
  saut" — candidate la mieux fondée du lot (catégorie déjà nommée séparément par la source, §3).
- **Informations manquantes** : laquelle des 29 variables, si plusieurs sont anormales, devrait être
  mise en avant — non traité par ce document (déjà signalé comme non discriminable,
  `INTERPRETATION_VARIABLES_PUISSANCE.md` §4).
- **Statut** : 🔴 À VALIDER.

### Profil E — Profil force-vitesse déséquilibré (V0 ↓, F0 normal)
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; `profil_fv_v0`↓, `profil_fv_nkg` normal ; force/RFD
segmentaires non déterminantes.
- **Mécanisme(s)** : profil force-vitesse, composante vitesse.
- **Orientation actuelle** : `CLI040`.
- **Orientation potentiellement différente** : 🔴 se recoupe avec le Profil B (RFD) sans qu'il soit
  établi si "V0 bas" et "RFD bas" représentent le même phénomène ou deux phénomènes différents — déjà
  signalé NON DISCRIMINABLE AVEC LES SOURCES ACTUELLES (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md`, Arbre
  C).
- **Informations manquantes** : relation exacte entre le profil F-V et les variables RFD segmentaires
  — non documentée.
- **Statut** : 🔴 À VALIDER, avec un niveau de preuve plus faible que les Profils A/B/D.

### Profil F — Puissance absolue ↓, relative normale
`cmj_peak_power`↓ + `slcmj_peak_power`↓ en valeur absolue ; signal normalisé au poids de corps dans
la norme.
- **Mécanisme(s)** : non applicable — distinction de nature (absolu/relatif), pas causale.
- **Orientation actuelle** : `CLI040` sur le critère absolu, mais **déjà** `CLI041` disponible si la
  lecture relative devient le critère pertinent.
- **Orientation potentiellement différente** : aucune proposition nécessaire — **déjà résolu**.
- **Informations manquantes** : condition numérique de déclenchement de `CLI041` — silence de
  Vierge_7 déjà documenté, sans lien avec la question de granularité traitée ici.
- **Statut** : 🟢 déjà séparée — cité comme exemple de ce qu'une granularité fonctionnelle produit
  déjà.

### Profil G — Signal isolé, aucun mécanisme convergent
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; toutes les explicatives (Force, RFD, profil F-V,
stratégie) normales.
- **Mécanisme(s)** : aucun identifié.
- **Orientation actuelle** : `CLI040`, déclenchée quand même (ADR-004 : le support est une
  métadonnée d'affichage, pas une condition de déclenchement).
- **Orientation potentiellement différente** : sans objet — il n'y a rien à différencier puisque
  rien n'est identifié.
- **Informations manquantes** : la cause elle-même. Ce n'est pas un problème de granularité
  d'orientation, c'est un problème de couverture explicative (déjà nommé "cas signal isolé",
  `PHASE_D_LOGICAL_VALIDATION.md`, non résolu).
- **Statut** : 🟢 constat déjà établi — ne relève pas de ce document.

### Profil H — Force ↓ et Explosivité (`HYP-EXP-01`) également Retenue
`cmj_peak_power`↓ + `slcmj_peak_power`↓ ; `imtp_n`↓ (Force, active indépendamment) ; `cmj_conc_rfd`↓
(diagnostique d'Explosivité, active indépendamment).
- **Mécanisme(s)** : Force (magnitude) + citation qualité-niveau d'Explosivité.
- **Orientation actuelle** : `CLI040`, avec un lien narratif possible vers `HYP-FOR-01`/`HYP-EXP-01`
  déjà actives séparément (Phase D, Cas D : ensembles diagnostiques disjoints, coexistence sans
  contamination).
- **Orientation potentiellement différente** : 🔴 pas une nouvelle orientation à créer — plutôt un
  **renvoi croisé** vers les orientations déjà existantes de Force (`CLI010`-`012`) et d'Explosivité
  (`CLI030`-`031`), qui sont déjà déclenchées indépendamment si ces hypothèses atteignent elles-mêmes
  Retenue. Créer une troisième orientation dupliquerait un contenu déjà couvert.
- **Informations manquantes** : modalité d'affichage d'un tel renvoi croisé entre orientations de
  qualités différentes — non spécifiée par les sources, question de présentation plutôt que de
  contenu clinique.
- **Statut** : 🔴 À VALIDER, mais orienté vers "ne pas créer de nouvelle orientation" plutôt que vers
  "en créer une".

---

## 5. Proposition de granularité cible

**Rappel impératif** : ce qui suit est un exemple de **structure**, pas une règle clinique
prévalidée. Aucune branche n'est présentée comme décidée.

```
PUISSANCE DÉFICITAIRE (HYP-PUI-01 Retenue)
│
├── Branche 1 — Profil "capacité de force"
│      → orientation candidate : restaurer une capacité de force maximale
│      → 🔴 À VALIDER
│
├── Branche 2 — Profil "vitesse de production de force"
│      → orientation candidate : développer la vitesse de production de force
│      → 🔴 À VALIDER
│
├── Branche 3 — Profil "stratégie d'exécution"
│      → orientation candidate : corriger la stratégie d'exécution du mouvement
│      → 🔴 À VALIDER (fondement source le plus solide des trois)
│
├── Branche 4 — Profil "puissance relative"
│      → orientation : augmenter la puissance relative
│      → 🟢 DÉJÀ EXISTANTE (`CLI041`)
│
└── Branche 5 — Profil mixte (plusieurs branches convergentes)
       → plusieurs orientations présentées simultanément, sans hiérarchie
       → 🔴 À VALIDER (modalité de présentation, pas le contenu clinique lui-même)
```

*(Le "profil force-vitesse déséquilibré", Profil E ci-dessus, n'apparaît pas comme branche autonome
— il se recoupe avec les Branches 1 et 2 sans ajouter d'information discriminante, §4.)*

### Branche 1 — Profil "capacité de force"

- **Pourquoi cliniquement distincte ?** Une capacité de force insuffisante et une vitesse de
  production de force insuffisante sont deux entités mesurables séparément (magnitude vs pente d'une
  courbe force-temps) — distinction déjà opérée par les sources au niveau de la mesure
  (`INTERPRETATION_VARIABLES_PUISSANCE.md` §4), mais pas encore au niveau de l'orientation pour
  Puissance.
- **Variables déclenchantes** : `imtp_n`/`nkg`, `slimtp_n`/`nkg`, force segmentaire `_n`/`_nkg` (13
  tests), `profil_fv_nkg`.
- **Variables confirmantes** : `cmj_height`, hop tests (confirmatives diagnostiques de Puissance déjà
  établies) si convergentes en même temps.
- **Variables réfutant ou rendant moins probable cette branche** : RFD normale (`imtp_rfd100`/`200`
  normaux) et stratégie biomécanique normale — orienterait vers une autre branche plutôt que
  celle-ci.
- **Existe déjà dans les sources ?** Non, pour Puissance spécifiquement. La catégorie "Force" existe
  (🟢), mais pas une orientation Puissance dédiée à cette seule catégorie.
- **Statut** : 🔴 nouvelle règle à définir avec le praticien.

### Branche 2 — Profil "vitesse de production de force"

- **Pourquoi cliniquement distincte ?** Précédent structurel réel : `CLI030` (Explosivité) sépare
  déjà cette même distinction ("améliorer la vitesse de développement de force") comme orientation
  autonome — cohérence architecturale avec ce qui existe ailleurs dans Vierge_7, sans que ce soit
  écrit pour Puissance.
- **Variables déclenchantes** : `imtp_rfd100`/`rfd200`/`ttpf`, `slimtp_rfd100`/`rfd200`/`ttpf`,
  `profil_fv_v0`.
- **Variables confirmantes** : mêmes confirmatives que Branche 1 (`cmj_height`, hop tests) — non
  discriminantes entre les deux branches (ce sont des preuves de puissance en général, pas de
  mécanisme).
- **Variables réfutant ou rendant moins probable cette branche** : magnitude de force normale et
  stratégie normale.
- **Existe déjà dans les sources ?** Non pour Puissance. Existe pour Explosivité (`CLI030`) —
  argument de cohérence, pas une preuve directe.
- **Statut** : 🔴 nouvelle règle à définir.

### Branche 3 — Profil "stratégie d'exécution"

- **Pourquoi cliniquement distincte ?** La fiche Phase C de Puissance nomme déjà deux catégories
  explicatives séparées — "variables explicatives physiologiques" (Branches 1-2) et "variables
  explicatives biomécaniques" (cette branche) — SOURCE EXPLICITE pour la séparation catégorielle
  elle-même, même si le lien vers une orientation distincte reste à valider.
- **Variables déclenchantes** : les 29 KPI de stratégie CMJ/SLCMJ (§2, `INTERPRETATION_VARIABLES_PUISSANCE.md`
  §3.5-3.6).
- **Variables confirmantes** : mêmes confirmatives générales (non discriminantes).
- **Variables réfutant ou rendant moins probable cette branche** : Force et RFD anormales
  simultanément — orienterait plutôt vers les Branches 1/2, ou vers un profil mixte.
- **Existe déjà dans les sources ?** La catégorie existe (🟢) ; l'orientation distincte n'existe pas
  (🔴).
- **Statut** : 🔴 nouvelle règle à définir — candidate la mieux fondée des trois, mais non validée.

### Branche 4 — Profil "puissance relative"

- **Pourquoi cliniquement distincte ?** Déjà tranché par Vierge_7 elle-même — `CLI041` existe
  indépendamment de `CLI040`.
- **Variables déclenchantes** : lecture PP/BM du diagnostic (pas de variable explicative séparée).
- **Statut** : 🟢 SOURCE EXPLICITE, aucune validation supplémentaire nécessaire ; seule la condition
  numérique de déclenchement reste non documentée (question distincte de la granularité).

### Branche 5 — Profil mixte

- **Pourquoi cliniquement distincte ?** Ne l'est pas en soi — c'est une conséquence mécanique de
  l'existence des Branches 1-3 : si elles existaient, un patient déficitaire sur plusieurs branches à
  la fois poserait la question de leur présentation conjointe.
- **Ce que les documents permettent déjà de faire** : présenter plusieurs mécanismes comme
  coexistants, sans hiérarchie (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §6, Option 2 — la seule
  supportée sans règle nouvelle).
- **Ce qui nécessiterait une nouvelle règle** : toute forme de priorisation ("cause principale +
  facteurs contributifs") — non fondée dans les sources.
- **Statut** : 🔴 pour la modalité de présentation ; 🟢 pour le principe de non-hiérarchisation déjà
  établi ailleurs.

---

## 6. Orientations qui pourraient être fusionnées (rester fusionnées)

- **Les 13 tests de force segmentaire pris individuellement** ne doivent **pas** recevoir chacun une
  orientation Puissance-spécifique — ce niveau de granularité est déjà couvert par le Niveau 2 de
  Force (`CLI200`-`213`). Créer une déclinaison segmentaire propre à Puissance dupliquerait un
  contenu existant. 🟢, tranché par les sources.
- **Le profil force-vitesse (F0/V0)** ne justifie probablement pas une branche autonome distincte des
  Branches 1/2 proposées ci-dessus — F0 et V0 recoupent conceptuellement "magnitude" et "vitesse", sans
  ajouter d'information nouvelle à ce niveau d'orientation. 🔴 à confirmer avec le praticien, mais
  recommandation de fusion plutôt que de séparation.
- **La citation qualité-niveau d'Explosivité** ne doit pas devenir une orientation Puissance
  spécifique — elle ferait doublon avec `CLI030`/`CLI031`, déjà existantes et déclenchées
  indépendamment si `HYP-EXP-01` est elle-même Retenue. 🟢/🔴 (le renvoi croisé, pas une nouvelle
  orientation, est la piste à documenter — voir Profil H, §4).

---

## 7. Orientations qui devraient potentiellement être séparées

Classées par force de l'argument, du plus solide au moins solide :

1. **Stratégie biomécanique vs mécanismes physiologiques** (Branche 3 vs Branches 1-2) — argument le
   mieux fondé : la fiche source elle-même nomme deux catégories explicatives séparées
   ("physiologiques" / "biomécaniques"). 🟢 pour la séparation catégorielle source, 🔴 pour son
   application à l'orientation.
2. **Magnitude de force vs RFD** (Branche 1 vs Branche 2) — argument de cohérence architecturale
   (précédent `CLI030` pour Explosivité), mais non écrit pour Puissance elle-même. 🔴, avec un
   fondement partiel (🟠 précédent structurel ailleurs dans le corpus).
3. **Aucune autre séparation n'est soutenue par un niveau de preuve comparable** — toute
   décomposition plus fine (par phase biomécanique CMJ, par KPI individuel de stratégie) resterait
   NON DISCRIMINABLE AVEC LES SOURCES ACTUELLES (`INTERPRETATION_VARIABLES_PUISSANCE.md` §4),
   au-delà du simple regroupement descriptif déjà disponible.

---

## 8. Règles nécessitant une validation du praticien

### Question centrale (point 7 de la mission)

**"Si deux patients ont exactement la même Puissance déficitaire, mais des mécanismes explicatifs
différents, Kinexus doit-il nécessairement leur proposer la même orientation ?"**

**Arguments pour maintenir une orientation unique (`CLI040`)** :
- C'est le comportement actuel, validé et cohérent avec la hiérarchie du moteur V1
  (`KINEXUS_REASONING_ENGINE_V1.md` §3) — rien ne l'invalide techniquement.
- Une orientation unique reste simple à interpréter et ne risque pas de créer une fausse précision
  clinique là où les mécanismes eux-mêmes restent, pour plusieurs branches, au niveau INFERENCE
  plutôt que SOURCE EXPLICITE.
- Le raisonnement détaillé (quelles variables sont convergentes) reste disponible ailleurs dans
  l'application (Fil de Raisonnement, matrice explicative) — l'orientation `CLI###` n'est pas le seul
  vecteur d'information pour le praticien.

**Arguments pour différencier l'orientation** :
- Une orientation identique pour "manque de force" et "problème de technique d'exécution" peut
  masquer une différence d'intervention réelle et cliniquement significative pour le praticien qui
  lit uniquement l'orientation, sans nécessairement consulter le détail explicatif.
- La fiche source distingue déjà ces catégories explicatives — ne pas répercuter cette distinction au
  niveau de l'orientation laisse une information structurée inutilisée.
- Un précédent existe ailleurs dans l'architecture (Force/`CLI200`-`213`, Explosivité/`CLI030`-`031`)
  — la granularité n'est pas étrangère au modèle Vierge_7, seulement absente pour Puissance
  spécifiquement.

**Ce qui est déjà décidé dans les documents** :
- La hiérarchie diagnostique/confirmative/explicative ne change pas (`KINEXUS_REASONING_ENGINE_V1.md`
  §3, non rouvert par ce document).
- `CLI041` existe déjà comme granularité fonctionnelle (absolu/relatif) — preuve que différencier une
  orientation à l'intérieur de Puissance est structurellement possible sans rien casser.
- Aucune priorisation entre mécanismes n'existe (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §6) —
  n'importe quelle granularité nouvelle devra composer avec cette absence, pas la résoudre
  silencieusement.

**Ce qui reste une décision clinique du praticien** :
- Si les Branches 1/2/3 proposées en §5 correspondent à des réalités cliniques suffisamment
  distinctes pour justifier une orientation séparée — ce document ne peut pas trancher cette
  question, elle dépend de jugement clinique, pas de logique documentaire.
- La formulation exacte de toute nouvelle orientation (le document ne propose que des niveaux
  d'abstraction — "restaurer", "développer", "corriger" — jamais un texte final).
- La fréquence clinique réelle de chaque profil (§4) — sans laquelle il est impossible de savoir si
  cette granularité supplémentaire serait utile en pratique ou rarement mobilisée.

**Ce qui relèverait d'une future règle du moteur** (uniquement après validation clinique) :
- La modalité technique de rattachement d'une orientation à un sous-ensemble de variables
  explicatives plutôt qu'à l'hypothèse entière — non spécifiée par `PHASE_H_TECHNICAL_SPECIFICATION.md`
  aujourd'hui.
- La règle de présentation en cas de profil mixte (Branche 5) — liste à plat vs autre format, déjà
  signalé comme non tranché.

---

## 9. Ce qui ne doit surtout pas être inventé

- **Aucune prescription d'entraînement** — ni volume, ni fréquence, ni exercice nommé. Les niveaux
  d'abstraction utilisés dans ce document ("restaurer une capacité", "développer une vitesse de
  production de force", "corriger une stratégie d'exécution") sont les plus détaillés que les
  sources permettent d'envisager pour Puissance — au-delà, tout est hors périmètre.
- **Aucun seuil numérique** — ni pour distinguer un profil "capacité" d'un profil "RFD", ni pour la
  condition de déclenchement de `CLI041` (déjà signalée non documentée), ni pour aucune des branches
  proposées.
- **Aucune hiérarchie entre mécanismes simultanément déficitaires** (Profil C, Branche 5) — répété
  volontairement une dernière fois : ni ce document ni aucun document antérieur du projet ne fonde
  une règle de priorisation.
- **Aucune des trois branches proposées en §5 ne doit être lue comme actée.** Chacune porte
  explicitement le statut 🔴 — une structure candidate, pas une évolution déjà décidée.
- **Aucune modification de `CLI040`/`CLI041` eux-mêmes n'est proposée** — ce document analyse s'il
  serait pertinent d'en créer de nouvelles, jamais de modifier le contenu ou la condition des deux
  orientations existantes.
- **Aucun mécanisme de réfutation n'est introduit** par ce document — une orientation candidate non
  déclenchée reste simplement absente, jamais activement "rejetée" (cohérent avec ADR-002, non
  validé).

---

## 10. Proposition finale à valider

**Constat de départ confirmé, sans modification** : 61 des 63 variables explicatives de Puissance
convergent aujourd'hui vers une orientation unique (`CLI040`), un comportement cohérent avec
l'architecture actuelle du moteur mais qui laisse structurellement inutilisée une partie de
l'information explicative déjà calculée.

**Ce que ce document permet de conclure, avec le niveau de preuve indiqué** :
- 🟢 Le problème n'est ni un défaut de mesure, ni un défaut de raisonnement — c'est une question de
  granularité de la couche d'orientation, déjà correctement isolée par le praticien avant ce
  document.
- 🟢 La séparation "capacité physiologique" vs "stratégie biomécanique" (Branche 3) est la candidate
  la mieux fondée sur les sources actuelles — les deux catégories sont déjà nommées séparément par
  Vierge_7 pour Puissance elle-même.
- 🟠 La séparation "magnitude de force" vs "RFD" (Branches 1/2) est une candidate raisonnable par
  analogie avec un précédent réel ailleurs dans le corpus (`CLI030`/Explosivité), mais non écrite pour
  Puissance.
- 🟢 Le profil force-vitesse (F0/V0) ne mérite probablement pas de branche autonome — il se recoupe
  avec les Branches 1/2 sans ajouter d'information discriminante.
- 🟢 Aucune granularité supplémentaire n'est fondée pour la stratégie biomécanique elle-même
  (au-delà de "stratégie" comme catégorie unique) ni pour la force segmentaire (déjà couverte par
  Force elle-même) — toute tentative d'aller plus loin serait NON DISCRIMINABLE AVEC LES SOURCES
  ACTUELLES.
- 🔴 La question de fond — "cela vaut-il la peine, cliniquement, de complexifier `CLI040` pour ce
  gain d'information ?" — **reste entièrement ouverte et n'est pas tranchée par ce document.** C'est
  une décision du praticien, pas une conclusion technique.

**Proposition minimale soumise à validation** (rappel : rien n'est acté) :
1. Étudier, avec le praticien, si les Branches 1 ("capacité de force"), 2 ("vitesse de production de
   force") et 3 ("stratégie d'exécution") correspondent à des réalités d'intervention suffisamment
   distinctes en pratique pour justifier trois orientations séparées, ou si une séparation plus
   simple à deux branches ("physiologique" vs "biomécanique", fusionnant 1 et 2) suffirait.
2. Ne rien faire du profil force-vitesse (F0/V0) au-delà de son rattachement actuel — pas assez
   discriminant pour justifier une branche séparée.
3. Ne rien faire de la force segmentaire ni de la citation Explosivité — déjà couvertes ailleurs,
   toute duplication serait une régression, pas une amélioration.
4. Si une séparation est retenue, traiter en priorité, avec le praticien, la règle de présentation
   d'un profil mixte (Branche 5/Profil C) **avant** d'introduire les nouvelles orientations —
   sinon le gain de granularité serait immédiatement neutralisé par l'absence de règle de
   présentation en cas de cumul.

Aucune de ces quatre étapes n'est engagée par ce document. Elles constituent une liste de décisions
à soumettre, pas un plan d'implémentation.

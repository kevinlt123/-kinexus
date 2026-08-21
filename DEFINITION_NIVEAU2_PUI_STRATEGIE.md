# Définition du Niveau 2 — « Capacités pertinentes évaluées » (HYP-PUI-01)

**Statut** : formalisation d'un point unique, dans le cadre déjà acté (Q1/Q2/Q3 de
`ARBITRAGE_FINAL_PUI_CAPACITE_STRATEGIE.md`). Ces trois décisions ne sont pas rouvertes. Aucun code,
aucune modification de HYP###, aucune modification de `CLI###`, aucune nouvelle variable, aucun
seuil numérique inventé.

**Objectif unique** : définir précisément quelles capacités physiologiques doivent avoir été
réellement évaluées pour autoriser une conclusion « Stratégie d'exécution » (Niveau 2, déjà retenu).

**Légende** : 🟢 déjà établi par les sources ou par les décisions actées · 🟠 lecture cohérente mais
non littéralement énoncée · 🔴 À VALIDER PAR LE PRATICIEN.

---

## 1. Décisions déjà actées (rappel, non rouvertes)

- **Q1 (A)** : Capacité et Stratégie peuvent coexister, affichées simultanément, sans hiérarchie ni
  tentative de causalité.
- **Q2 (C)** : une variable physiologique isolée génère un signal faible ; retenir un déficit de
  capacité **fortement** exige une convergence entre **au moins deux familles physiologiques
  distinctes** (deux variables d'une même famille ne suffisent pas). Force et RFD sont deux familles
  distinctes, non hiérarchisées.
- **Q3 (Niveau 2)** : Stratégie n'est éligible que si les **principales capacités physiologiques
  pertinentes** ont été réellement évaluées. Absence de mesure ≠ capacité conservée.

Ce document répond uniquement à : **que signifie "principales capacités physiologiques pertinentes"
?**

---

## 2. Familles physiologiques existantes (recensement, rien ajouté)

| Famille | Tests | Variables | Rôle dans HYP-PUI-01 | Statut |
|---|---|---|---|---|
| Force (magnitude) | IMTP, SLIMTP, + 11 tests segmentaires (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `sl_iso_push`, `iso_belt_squat`, `iso_squat_hold`) | `_n` (absolu) et `_nkg` (relatif) de chaque test | Explicative physiologique — capacité à produire un pic de force | 🟢 SOURCE EXPLICITE (`HYP_ARCHITECTURE_PHASE_C.md`) |
| RFD | IMTP, SLIMTP **uniquement** (pas de RFD segmental dans la liste explicative de Puissance) | `imtp_rfd100`/`rfd200`, `slimtp_rfd100`/`rfd200` | Explicative physiologique — vitesse de production de force | 🟢 SOURCE EXPLICITE |
| TTPF | IMTP, SLIMTP uniquement | `imtp_ttpf`, `slimtp_ttpf` | Explicative physiologique — délai pour atteindre le pic | 🟢 SOURCE EXPLICITE pour l'appartenance ; 🔴 pour son statut de famille propre ou sous-famille de RFD (§5) |
| Profil Force-Vitesse | Profil Force-Vitesse (test dédié) | `profil_fv_nkg` (F0), `profil_fv_v0` (V0) | Explicative physiologique — composantes théoriques du modèle force-vitesse | 🟢 SOURCE EXPLICITE, catégorie listée séparément dans la fiche source |

**Aucune autre famille physiologique n'a été trouvée** dans les 9 documents listés en source pour
Puissance. Les 29 variables biomécaniques (stratégie CMJ/SLCMJ) ne sont pas des candidates ici — elles
relèvent de la branche Stratégie elle-même, pas de la couverture "capacité" à vérifier.

---

## 3. Distinction test / famille — principe

Point essentiel avant toute analyse : **les documents source ne nomment jamais explicitement de
"familles".** Le regroupement Force/RFD/TTPF/Profil F-V utilisé depuis
`HYP_PUI_CAPACITE_VS_STRATEGIE.md` est une **organisation par type de mesure**, construite à partir
des KPI listés dans `HYP_ARCHITECTURE_PHASE_C.md`, pas une taxonomie énoncée telle quelle par
Vierge_7. Ce que Q2 confirme, en revanche, c'est que cette organisation est bien celle retenue par le
praticien : *"Force et RFD restent deux familles distinctes"* — au singulier, pas *"IMTP et SLIMTP
restent deux familles distinctes"*. Ceci **tranche déjà**, par le texte même de Q2, la question
IMTP/SLIMTP posée en §4.

---

## 4. IMTP / SLIMTP

**A. Deux familles indépendantes ? B. Une même famille "force globale" avec deux tests ? C. Autre
chose ?**

**Réponse : B.** 🟢, fondée directement sur le texte de Q2 (§3 ci-dessus), pas sur une déduction
physiologique. IMTP et SLIMTP sont deux **tests** (bilatéral / unilatéral) du même dispositif de
mesure, contribuant chacun aux mêmes familles (Force, RFD, TTPF) — pas deux familles séparées.
Conséquence directe : une variable `imtp_n` déficitaire et une variable `slimtp_n` déficitaire
comptent, toutes deux, comme des preuves de la **même** famille "Force" — pas comme deux familles
distinctes au sens de la convergence Q2.

**Cohérence avec ADR-003** (non rouverte, citée pour vérification uniquement) : *"deux KPIs dérivés
d'un seul et même essai ne constituent pas, par défaut, deux preuves indépendantes"*
(`KINEXUS_REASONING_ENGINE_V1.md` §4). IMTP et SLIMTP sont des essais distincts, pas le même essai —
ADR-003 ne les fusionne donc pas automatiquement au niveau de la *preuve*, mais cela ne contredit pas
leur appartenance à la même *famille* au sens où Q2 emploie ce mot (type de mesure, pas essai
individuel). Aucune contradiction trouvée entre B et ADR-003.

---

## 5. Force / RFD / TTPF

- **Force et RFD : deux familles distinctes.** 🟢, décision Q2 littérale, non rouverte.
- **TTPF : famille propre, ou sous-famille de RFD ?** 🔴 **À VALIDER PAR LE PRATICIEN.** Q2 ne nomme
  que "Force" et "RFD" comme exemple de familles distinctes — TTPF n'est mentionnée nulle part dans
  la décision Q2. Deux lectures restent possibles, aucune tranchée par les sources :
  - TTPF fait partie de la famille RFD (les deux mesurent la "vitesse de production de force", sous
    des formes différentes — pente vs délai).
  - TTPF est une troisième famille physiologique distincte (mesure structurellement différente : un
    délai, `dir:min`, pas une pente, `dir:max` — différence de sens de seuil déjà documentée dans
    `INTERPRETATION_VARIABLES_PUISSANCE.md` §3.3).
  Ce document ne choisit pas — la définition du Niveau 2 proposée en §7 traite ce point comme un
  paramètre ouvert (§9).

---

## 6. Profil Force-Vitesse

**Obligatoire ou facultatif pour l'éligibilité Stratégie ?** Non tranché ici, arguments des deux
côtés :

**Pour l'obligation** :
- Catégorie explicative listée séparément dans la fiche source (`HYP_ARCHITECTURE_PHASE_C.md`), pas
  fondue dans "Force" — un argument pour la traiter comme une famille à part entière, donc à couvrir
  si l'on veut une évaluation réellement complète des capacités.
- `profil_fv_v0` (V0) est la seule variable de tout l'ensemble physiologique de Puissance qui
  renseigne spécifiquement une composante "vitesse" au niveau du profil de force — sans elle, un
  déficit isolé sur cette dimension resterait invisible même avec Force/RFD normaux.

**Pour le caractère facultatif** :
- Test dédié, potentiellement moins systématiquement réalisé en pratique qu'IMTP/SLIMTP (aucune
  donnée réelle disponible pour vérifier cette fréquence — limite déjà signalée pour l'ensemble du
  projet, `LOT1B_CROSS_VALIDATION_REPORT.md`).
- `profil_fv_nkg` (F0) recoupe conceptuellement la famille "Force" — le rendre obligatoire ajoute une
  exigence dont la composante F0 est partiellement redondante avec ce que Force couvre déjà.

**🔴 À VALIDER PAR LE PRATICIEN.**

---

## 7. Règle de non-mesure (formalisation explicite)

**MESURÉ + NON DÉFICITAIRE ≠ NON MESURÉ.**

Formalisée ainsi, sans exception, pour toute variable ou toute famille :
- Une variable **non testée** ne peut jamais contribuer à satisfaire une condition de couverture,
  quel que soit le nombre d'autres variables testées et normales par ailleurs.
- Une famille pour laquelle **aucune** variable n'a été testée est une famille **non couverte**, pas
  une famille "présumée normale".
- Cette règle s'applique de façon identique à chacune des options A/B/C proposées en §8 — elle n'est
  pas une variante supplémentaire, elle est une condition transversale à toutes.

---

## 8. Propositions Niveau 2

*Selon les familles confirmées en §2-§6 : Force (🟢), RFD (🟢), Profil F-V (🔴 statut d'obligation
ouvert), TTPF (🔴 rattachement ouvert).*

### Option A — Couverture minimale
- **Familles obligatoires** : une seule, parmi Force ou RFD (l'une ou l'autre suffit), testée et
  normale.
- **Familles facultatives** : toutes les autres (l'autre famille physiologique magnitude/RFD non
  testée, TTPF, Profil F-V, tests segmentaires).
- **Stratégie éligible** : dès qu'une seule mesure physiologique globale (ex. `imtp_n` seul) est
  testée et normale.
- **Reste Non discriminable** : uniquement si aucune mesure physiologique n'a été réalisée du tout.
- **Avantage** : le plus praticable, la branche Stratégie devient utilisable dans la quasi-totalité
  des bilans comportant au moins un test de force.
- **Risque** : contredit potentiellement l'esprit de Q2, qui traite Force et RFD comme deux familles
  **non hiérarchisées et toutes deux pertinentes** — ne vérifier qu'une seule des deux laisse ouverte
  la possibilité qu'un déficit réel de l'autre famille (jamais testée) explique en réalité le
  déficit de Puissance, sans que Kinexus ne puisse le détecter avant de conclure "Stratégie".

### Option B — Couverture intermédiaire
- **Familles obligatoires** : Force **et** RFD toutes deux testées et normales (en pratique : IMTP
  et/ou SLIMTP testés sur leurs 4 KPI magnitude+RFD).
- **Familles facultatives** : TTPF, Profil Force-Vitesse, les 11 tests segmentaires.
- **Stratégie éligible** : Force et RFD toutes deux couvertes et normales, quel que soit le statut de
  TTPF/Profil F-V/segmentaire.
- **Reste Non discriminable** : si Force **ou** RFD n'a pas été testée, même si l'autre l'a été.
- **Avantage** : couvre les deux familles explicitement nommées comme non hiérarchisées par Q2 — la
  seule option qui traite Force et RFD à égalité, cohérent avec la décision déjà actée.
- **Risque** : exclut Profil F-V et TTPF de toute exigence, alors que rien ne permet de dire qu'ils
  sont moins pertinents — seulement qu'ils ne sont pas nommément cités dans Q2.

### Option C — Couverture complète
- **Familles obligatoires** : toutes les familles confirmées et candidates — Force, RFD, Profil
  Force-Vitesse (et TTPF si le praticien la retient comme famille propre, §5) — chacune testée et
  normale au moins une fois.
- **Familles facultatives** : les 11 tests segmentaires eux-mêmes restent facultatifs sous cette
  lecture (IMTP/SLIMTP suffisent à représenter la famille Force, §4) — **sauf** si le praticien
  souhaite une lecture encore plus stricte exigeant chaque test segmentaire individuellement, non
  recommandée ici car disproportionnée par rapport à l'objectif de Q3 (qui parle de "familles", pas
  de tests individuels).
- **Stratégie éligible** : uniquement si toutes les familles retenues sont couvertes et normales.
- **Reste Non discriminable** : dès qu'une seule famille manque.
- **Avantage** : le plus rigoureux, écarte au maximum le risque qu'un déficit non détecté (faute de
  test) explique en réalité le déficit de Puissance.
- **Risque** : la branche Stratégie deviendrait rarement mobilisable en pratique si le Profil
  Force-Vitesse n'est pas systématiquement réalisé.

**Aucune de ces trois options n'est recommandée par ce document** — la mission ne le demande pas ici
et le §3 précédent (`ARBITRAGE_FINAL_PUI_CAPACITE_STRATEGIE.md`) avait déjà proposé une option
intermédiaire similaire à titre indicatif seulement.

---

## 9. Cas concrets

*Hypothèse de lecture pour tous les cas : "mesurée" signifie testée et trouvée **normale** (pas
seulement testée) — signalé explicitement car les cas de la mission ne précisent pas toujours le
statut, seulement la couverture.*

| Cas | Données | Sous Option A | Sous Option B | Sous Option C | Robustesse |
|---|---|---|---|---|---|
| **1** | Force mesurée, RFD mesurée, biomécanique anormale | Éligible | Éligible | Non éligible (Profil F-V manquant) | Résultat **dépend de l'option** — pas robuste |
| **2** | Force mesurée, RFD non mesurée, biomécanique anormale | Éligible (Force seule suffit) | Non éligible (RFD manquante) → Non discriminable | Non éligible | Dépend de l'option |
| **3** | Force non mesurée, RFD mesurée, biomécanique anormale | Éligible (RFD seule suffit, symétrique du Cas 2) | Non éligible (Force manquante) → Non discriminable | Non éligible | Dépend de l'option |
| **4** | Force mesurée, RFD mesurée, Profil F-V non mesuré, biomécanique anormale | Éligible | Éligible | Non éligible (Profil F-V manquant) — teste directement la question du §6 | Dépend de l'option, **et directement de la décision §6** |
| **5** | Aucune famille physiologique suffisante, biomécanique anormale | Non éligible | Non éligible | Non éligible | **Robuste** — Non discriminable quelle que soit l'option |
| **6** | Force ↓, RFD ↓ (déficitaires, pas normales), biomécanique anormale | — | — | — | **Ne relève pas de cette question.** Force et RFD étant *déficitaires* (pas simplement non testées), Q2(C) est directement satisfaite : convergence de deux familles distinctes → Capacité retenue. Combiné à la biomécanique anormale et à Q1(A), le résultat est `PROFIL MIXTE` — la condition de "couverture" de ce document ne s'applique qu'à l'éligibilité de la Stratégie **seule** (capacités testées et *normales*), pas au cas où Capacité est positive. **Robuste**, indépendant du choix A/B/C. |

**Constat transversal** : seuls les Cas 1, 2, 3 et 4 sont sensibles au choix d'option — c'est
précisément sur ces quatre cas que porte la décision demandée. Les Cas 5 et 6 sont robustes,
quel que soit le choix retenu.

---

## 10. Points nécessitant validation du praticien

1. **Choix de l'option A / B / C** (§8) — non tranché ici.
2. **Statut de TTPF** (§5) — famille propre ou sous-famille de RFD. Affecte la définition exacte de
   "toutes les familles" pour l'Option C, et pourrait affecter B/A si le praticien souhaitait
   l'inclure explicitement.
3. **Caractère obligatoire ou facultatif du Profil Force-Vitesse** (§6) — affecte directement le
   résultat du Cas 4 et le contenu de l'Option C.

Aucun autre point n'a été identifié comme non résolu par les sources dans le périmètre de cette
mission.

---

## 11. Définition proposée du Niveau 2 (structure, sans choix final)

```
NIVEAU 2 — « Principales capacités physiologiques pertinentes évaluées »

Familles confirmées, distinctes, non hiérarchisées entre elles :
  • Force (magnitude, IMTP/SLIMTP — les 11 tests segmentaires représentent la même famille, §4)
  • RFD (IMTP/SLIMTP uniquement)

Familles au statut à confirmer :
  • TTPF — famille propre ou sous-famille de RFD ? 🔴 À VALIDER (§5)
  • Profil Force-Vitesse — obligatoire ou facultative ? 🔴 À VALIDER (§6)

Règle de non-mesure, transversale à toute option retenue :
  MESURÉ + NON DÉFICITAIRE ≠ NON MESURÉ.
  Une famille non testée n'est jamais comptée comme "conservée",
  quel que soit le nombre d'autres familles testées et normales.

Couverture minimale requise : Option A, B ou C — 🔴 À CHOISIR PAR LE PRATICIEN (§8).
```

Cette structure ne peut pas être close en une définition unique et opérationnelle tant que les trois
points de §10 ne sont pas arbitrés — signalé explicitement plutôt que résolu par défaut, conformément
à la règle absolue de cette mission.

# HYP-PUI-01 V1 — Formalisation Capacité / Stratégie d'exécution

**Statut** : formalisation des décisions cliniques déjà arbitrées. Ce document n'explore rien de
nouveau, n'ajoute aucun concept au-delà de ce qui a été décidé, n'invente aucun seuil ni aucune
causalité. Aucun code, aucune modification des autres qualités, aucune modification de `CLI###`,
aucune nouvelle variable.

**Sources** : les 5 décisions cliniques fournies dans la mission (reprises telles quelles),
`HYP_PUI_CAPACITE_VS_STRATEGIE.md`, `ARBITRAGE_CLINIQUE_PUI_CAPACITE_STRATEGIE.md`,
`CARTOGRAPHIE_VARIABLES_HYP.md`, `KINEXUS_REASONING_ENGINE_V1.md` (cycle d'états, ADR-001/003/007).

**Légende** : 🟢 déjà supporté par les sources/décisions actées · 🟠 inférence/extension par
analogie · 🔴 point non résolu, nécessitant encore un choix clinique ou opérationnel.

---

## 1. Décisions cliniques actées

Reprises sans reformulation substantielle, numérotées pour référence dans le reste du document :

- **D1 — Capacité, graduation** : 1 preuve physiologique déficitaire → signal/hypothèse de capacité
  faible. Plusieurs preuves physiologiques concordantes → mécanisme de capacité retenu, support
  supérieur. Réutilise la mécanique de graduation déjà existante, aucun nombre de variables inventé.
- **D2 — Force et RFD** : deux familles explicatives physiologiques distinctes, non hiérarchisées.
  Chacune peut générer un signal seule ou converger avec l'autre pour faire progresser le support.
  Aucune hiérarchie Force>RFD ni RFD>Force, aucun seuil numérique.
- **D3 — Stratégie, conditions de rétention** : une anomalie biomécanique seule ne suffit jamais.
  Quatre conditions requises (Puissance diagnostiquement déficitaire ; biomécanique compatible ;
  capacités pertinentes réellement évaluées ; aucune déficience physiologique pertinente
  n'explique directement le déficit). Absence de mesure ≠ capacité conservée → si non évaluées,
  résultat = NON DISCRIMINABLE, jamais "Stratégie" par défaut.
- **D4 — Profil mixte** : coexistence de signaux Capacité et Stratégie → `PROFIL MIXTE`, sans
  hiérarchisation, sans tentative de déterminer cause principale/secondaire/conséquence/compensation.
- **D5 — Non discriminable** : si les données ne permettent pas de trancher (capacité, stratégie, ou
  les deux) → `NON DISCRIMINABLE`, jamais de branche forcée.

**Point de cohérence identifié entre D3 et D4 — signalé explicitement, pas résolu silencieusement**
(voir aussi §7, §10) : la condition 4 de D3 ("aucune déficience physiologique pertinente n'explique
directement le déficit") lue littéralement empêcherait toute rétention de Stratégie **dès qu'une**
déficience physiologique existe — ce qui semblerait interdire le scénario même que D4 décrit
(Capacité↓ ET Stratégie anormale coexistantes). Ce document résout cette tension de la façon la plus
fidèle aux deux décisions prises ensemble : **D3-condition 4 gouverne l'éligibilité de la branche
Stratégie SEULE (exclusive)** ; **D4 définit un chemin séparé, `PROFIL MIXTE`, qui s'applique
précisément quand une déficience physiologique ET une anomalie biomécanique coexistent** — un
chemin qui prend le pas sur le blocage de D3-condition 4 dans ce cas précis, puisque D4 nomme
explicitement ce scénario. 🔴 Cette lecture est la plus cohérente que ce document a pu construire
sans ajouter de règle — **elle doit être confirmée explicitement par le praticien avant toute
implémentation**, car elle repose sur une interprétation d'articulation entre deux décisions, pas sur
une décision unique et non ambiguë.

---

## 2. Architecture logique cible

```
HYP-PUI-01 DIAGNOSTIQUEMENT RETENUE
(cmj_peak_power ET slcmj_peak_power déficitaires — inchangé, gouverné uniquement par le diagnostic)
              │
              ▼
   ┌──────────────────────┐        ┌──────────────────────┐
   │   Analyse Capacité    │        │   Analyse Stratégie   │
   │  (34 variables physio)│        │  (29 variables biomeca)│
   └──────────┬────────────┘        └──────────┬────────────┘
              │                                  │
     ≥1 variable          ≥1 variable   condition D3 (1-4)   condition D3
     déficitaire  ────►  Niveau 2       remplie  ────►  Niveau 3   non remplie
     (isolée)            "Hypothèse                     "Stratégie          │
                          capacité                       retenue"           ▼
                          faible"                                    (jamais "Stratégie"
              │                                                       par défaut — D3)
     ≥2 preuves concordantes
     (familles/variables — 🔴 nombre
     non fixé, §10) ────► Niveau 3
                          "Mécanisme capacité retenu",
                          support gradué (Faible/Modérée/Forte,
                          mécanique déjà existante)
              │                                  │
              └────────────────┬─────────────────┘
                                ▼
                  Capacité retenue ET Stratégie retenue
                  simultanément (D4) ──► PROFIL MIXTE
                                │
                  Ni l'une ni l'autre retenue,
                  ou Stratégie bloquée par D3-condition 3 (non évaluée)
                                │
                                ▼
                        NON DISCRIMINABLE (D5)
```

**Conditions exactes de passage d'un état à l'autre** — détaillées séparément par branche en §3-§4,
pour éviter toute ambiguïté de lecture du schéma ci-dessus.

---

## 3. Distinction des niveaux (les deux branches)

| Niveau | Capacité | Stratégie |
|---|---|---|
| **1 — Signal** | ≥1 variable physiologique (des 34) au statut déficitaire, isolée. | ≥1 variable biomécanique (des 29) au statut anormal, isolée — **ne constitue qu'un signal, jamais une conclusion** (rappel D3, mission §2). |
| **2 — Hypothèse/mécanisme suspecté** | Le signal seul, sans convergence supplémentaire : *"hypothèse de capacité faible"* (D1). | Le signal biomécanique seul, sans que les conditions D3 1-4 soient encore vérifiées : *"stratégie potentiellement atypique"* — reste une hypothèse, ne progresse pas automatiquement au niveau 3. |
| **3 — Mécanisme retenu** | Convergence de plusieurs preuves physiologiques concordantes (D1-D2) → support gradué via la mécanique déjà existante du moteur (Faible→Modérée→Forte). | **Uniquement** si les 4 conditions de D3 sont réunies : (1) Puissance diagnostiquement déficitaire [déjà acquis] ; (2) biomécanique compatible [Niveau 1] ; (3) capacités pertinentes réellement évaluées ; (4) aucune déficience physiologique pertinente ne l'explique directement (sous réserve du chemin D4 séparé, §1). |
| **4 — Orientation** | `CLI040` (inchangée, §9). | `CLI040` (inchangée, §9). |

**Rappel explicite (mission §2)** : une variable biomécanique anormale ne fait **jamais**
automatiquement progresser la branche Stratégie au-delà du Niveau 1/2 — le passage au Niveau 3
exige la vérification des 4 conditions, jamais l'anomalie biomécanique seule. 🟢, application directe
de D3.

---

## 4. Branche Capacité

### Variables (reprises exactement de `CARTOGRAPHIE_VARIABLES_HYP.md` /
`HYP_PUI_CAPACITE_VS_STRATEGIE.md`, aucune ajoutée)

| Famille | Variables | Rôle | Condition de déficit | Rôle dans la génération du signal (Niveau 1-2) | Rôle dans la progression du support (Niveau 3) |
|---|---|---|---|---|---|
| Force absolue | `imtp_n`, `slimtp_n`, + `_n` des 11 tests segmentaires | Explicative physiologique | Statut déficitaire (calcul déjà existant, inchangé) | Une seule variable de cette famille suffit à générer le signal Niveau 2 (D1) | Contribue à la convergence si concordante avec une autre famille (D2) |
| Force relative | `imtp_nkg`, `slimtp_nkg`, + `_nkg` des 11 tests segmentaires | idem | idem | idem | idem |
| RFD | `imtp_rfd100`, `imtp_rfd200`, `slimtp_rfd100`, `slimtp_rfd200` | Explicative physiologique | idem | idem — non hiérarchisée par rapport à Force (D2) | idem |
| TTPF | `imtp_ttpf`, `slimtp_ttpf` | Explicative physiologique | Délai anormalement long (sens de seuil inversé, déjà établi) | idem | idem |
| Profil force-vitesse | `profil_fv_nkg`, `profil_fv_v0` | Explicative physiologique | Statut déficitaire | idem | idem |

**34 variables au total**, identique à `HYP_PUI_CAPACITE_VS_STRATEGIE.md` §2. Aucune famille
supplémentaire n'a été identifiée dans les sources.

### Règle de génération et de progression (D1-D2 formalisées)

- **Niveau 2 (signal/hypothèse faible)** : déclenché par **une seule** variable déficitaire, quelle
  que soit sa famille (Force, RFD, TTPF, profil F-V) — 🟢 D1, littéral.
- **Niveau 3 (mécanisme retenu)** : déclenché par **plusieurs preuves physiologiques concordantes**
  — 🟢 principe D1, 🔴 nombre exact et définition de "concordantes" non fixés (§10).
- **Support gradué (Faible/Modérée/Forte)** au sein du Niveau 3 : réutilise directement la mécanique
  de graduation déjà existante du moteur HYP### V1 — 🟢 pas une nouvelle mécanique, une application
  au niveau du sous-mécanisme plutôt qu'au niveau de l'hypothèse entière (🟠 cette application à un
  niveau différent de celui pour lequel la mécanique a été conçue à l'origine est elle-même une
  extension, validée par D1, pas une simple lecture des sources antérieures).

---

## 5. Branche Stratégie

### Variables (reprises exactement, aucune ajoutée)

| Sous-ensemble | Variables | Anomalie observée | Interprétation biomécanique | Compatibilité avec Stratégie | Condition nécessaire pour retenir la branche |
|---|---|---|---|---|---|
| CMJ — unloading | `cmj_depth`, `cmj_braking_duration`, `cmj_tto` | Statut hors norme | Préparation du saut non optimale | Signal Niveau 1 uniquement | D3 (1-4) intégralement |
| CMJ — braking | `cmj_ecc_decel`, `cmj_braking_eff` | idem | Transition freinage→propulsion non optimale | idem | idem |
| CMJ — concentric | `cmj_conc_mean_force`, `cmj_conc_mean_vel`, `cmj_conc_rfd`, `cmj_conc_duration`, `cmj_conc_displacement`, `cmj_propulsion_eff`, `cmj_peak_vel` | idem | Exécution de la phase propulsive | idem | idem |
| CMJ — flight | `cmj_ft_ct_ratio` | idem | Résultat global du saut | idem | idem |
| CMJ — landing | `cmj_landing_rfd`, `cmj_landing_mean_power` | idem | Contrôle post-propulsif (lien le plus faible avec la puissance elle-même, déjà signalé) | idem, la plus incertaine du lot | idem |
| SLCMJ — 14 équivalents unilatéraux | (liste identique à `INTERPRETATION_VARIABLES_PUISSANCE.md` §3.6) | idem | idem, version unilatérale | idem | idem |

**29 variables au total.** Aucune transformée automatiquement en "preuve de stratégie" — chacune ne
produit, seule, qu'un signal Niveau 1 (🟢 D3, mission §4 : *"ne pas les transformer automatiquement
en preuve de stratégie"*).

### Ce que ces variables permettent, formellement, dans ce modèle

- **Seules** : Niveau 1 (signal) uniquement — jamais Niveau 3, quel que soit leur nombre ou leur
  ampleur, tant que les conditions 3 et 4 de D3 ne sont pas vérifiées. 🟢 D3, appliqué strictement.
- **Avec conditions D3 1-4 réunies** : Niveau 3 (mécanisme Stratégie retenu). 🟢.
- **Avec condition 3 non remplie** (capacités non évaluées) : **blocage** — jamais de progression au
  Niveau 3, résultat global = `NON DISCRIMINABLE` (D3, D5). 🟢, littéral.

---

## 6. Condition « Capacités physiologiques pertinentes évaluées »

**Ce qui peut être formalisé sans nouveau choix clinique** 🟢 :
- Chacune des 34 variables de la Branche Capacité possède déjà un statut catégoriel
  (normal/déficitaire/indisponible), calculé par les mécanismes déjà existants du moteur, en amont de
  HYP###. Une variable "indisponible" ne peut jamais compter comme "évaluée" — distinction déjà
  disponible sans rien construire de nouveau.
- Le principe "absence de mesure ≠ capacité conservée" (D3) s'applique donc directement à ce statut
  déjà existant : seules les variables au statut "normal" (testées, non déficitaires) comptent pour
  la condition "capacités évaluées et non déficitaires".

**Ce qui nécessite un choix clinique non tranché ici** 🔴 **À DÉFINIR** — trois niveaux candidats,
directement repris de `ARBITRAGE_CLINIQUE_PUI_CAPACITE_STRATEGIE.md` (Question 4), non répondue à ce
jour :

| Niveau candidat | Définition | Statut |
|---|---|---|
| 1 | Au moins une variable physiologique quelconque testée et normale | 🔴 À DÉFINIR |
| 2 | Les tests globaux (IMTP/SLIMTP, magnitude et RFD) testés et normaux, sans exiger les 11 tests segmentaires ni le profil force-vitesse | 🔴 À DÉFINIR |
| 3 | Au moins une variable par famille (Force absolue, Force relative, RFD, TTPF, Profil F-V) testée et normale | 🔴 À DÉFINIR |

**Ce document ne choisit pas parmi ces trois niveaux** — conformément à la consigne. Tant qu'un
niveau n'est pas retenu par le praticien, la condition 3 de D3 ne peut pas être évaluée
opérationnellement, ce qui signifie que **la branche Stratégie ne peut pas encore être formellement
instanciée**, même si son principe (§5) est entièrement formalisé.

---

## 7. Profil Mixte

Reprend D4 littéralement : Capacité retenue (Niveau 3) **et** Stratégie retenue (Niveau 3)
simultanément → `PROFIL MIXTE`, sans hiérarchie, sans détermination de cause
principale/secondaire/conséquence/compensation. 🟢, D4 littéral.

**Rappel de la limite déjà établie** (`HYP_PUI_CAPACITE_VS_STRATEGIE.md` §6, non rouverte ici) :
présenter les deux mécanismes côte à côte ne résout pas la question de leur relation causale —
question que ce modèle ne cherche pas à résoudre, conformément à D4.

**Dépendance au point de cohérence signalé en §1** : ce chemin `PROFIL MIXTE` ne peut fonctionner
que si l'articulation proposée entre D3-condition 4 et D4 est confirmée par le praticien — sans quoi
D3-condition 4, lue strictement, empêcherait ce cas de se produire.

---

## 8. Profil Non discriminable

Reprend D5 littéralement. Se produit dans deux situations distinctes, à ne pas confondre :

1. **Aucune donnée exploitable dans les deux branches** (ni signal Capacité, ni signal Stratégie) —
   🟢 D5, cas le plus direct.
2. **Signal Stratégie présent (Niveau 1-2), mais condition 3 de D3 non remplie** (capacités
   pertinentes non évaluées) — 🟢 D3, résultat explicitement prescrit : `NON DISCRIMINABLE`, jamais
   "Stratégie" par défaut.

**Formulation praticien proposée** (reprise telle quelle de la mission, non modifiée) : *"Puissance
déficitaire — mécanisme explicatif non discriminable avec les données disponibles."*

**Cas à ne pas confondre avec Non Discriminable** (signalé pour éviter une erreur de lecture future) :
le cas où Capacité **et** Stratégie sont toutes deux testées et **normales** (Puissance déficitaire
sans aucun mécanisme identifié dans les deux branches, malgré une couverture de test complète) n'est
**pas** un cas "Non Discriminable" au sens de D5 — les données sont suffisantes et concluantes
(absence de mécanisme identifiable), ce n'est pas un déficit de données. C'est le cas déjà documenté
et non résolu ailleurs sous le nom "signal isolé" (`PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §9,
`HYP_PUI_CAPACITE_VS_STRATEGIE.md` Profil 8, note terminologique) — une limite de couverture du moteur
HYP### déjà connue, distincte de la question traitée par ce document, non résolue ici (voir CAS 6,
§9).

---

## 9. Matrice des 10 cas

*Vérifiés un par un contre la logique formalisée en §3-§8, pas simplement recopiés depuis l'énoncé de
la mission.*

| Cas | Données | Niveau Capacité | Niveau Stratégie | Résultat | Vérification |
|---|---|---|---|---|---|
| 1 | Capacité↓, Stratégie normale | 3 (retenu, ≥1 preuve — au moins signal, voir §10 pour le seuil exact de "retenu") | 0 (aucun signal) | **CAPACITÉ** | 🟢 conforme à l'attendu — aucune ambiguïté, Stratégie n'a même pas de signal Niveau 1. |
| 2 | Capacité non déficitaire (testée), Stratégie↓, capacités pertinentes évaluées | 0 (aucun signal, testée normale) | 3 (conditions D3 1-4 réunies) | **STRATÉGIE** | 🟢 conforme — condition 4 de D3 satisfaite car Capacité explicitement testée-normale, pas seulement non-testée. |
| 3 | Capacité↓, Stratégie↓ | 3 | 3 (sous réserve de l'articulation D3/D4, §1) | **MIXTE** | 🟠 conforme à l'attendu, **sous réserve explicite** de la résolution du point de cohérence §1 — sans cette résolution, D3-condition 4 bloquerait Stratégie ici. |
| 4 | Capacités non suffisamment évaluées, Stratégie↓ | 0 (aucune donnée exploitable — non évaluées ≠ normales) | 1-2 (signal présent, bloqué au Niveau 2, condition 3 de D3 non remplie) | **NON DISCRIMINABLE** | 🟢 conforme — cas explicite de D3 (§8, point 2). |
| 5 | Capacité↓, Stratégie non documentée (aucune donnée biomécanique) | 3 | 0 (aucune donnée, pas même un signal) | **CAPACITÉ** | 🟢 conforme — absence de données Stratégie n'empêche pas Capacité de conclure seule, ce sont deux analyses indépendantes en entrée. |
| 6 | Capacité non déficitaire (testée), Stratégie normale (testée) | 0 | 0 | **Aucun mécanisme identifié — "signal isolé"** | 🟢 **vérifié, pas inventé** : ce n'est **pas** un cas `NON DISCRIMINABLE` au sens de D5 (les données sont complètes et concluantes) — c'est la limite déjà documentée ailleurs (§8, note), hors périmètre de résolution de ce document. Le moteur peut seulement conclure "Puissance déficitaire, aucun mécanisme Capacité ou Stratégie identifié" — rien de plus ne peut être affirmé sans inventer. |
| 7 | Force↓, RFD normale | 2 (signal/hypothèse faible, une seule famille — Force) | — (non renseigné dans l'énoncé) | **Capacité — hypothèse faible, support non gradué au-delà** | 🟢 **vérifié** : conforme à D1 littéral — une seule famille physiologique déficitaire ne fait pas progresser au-delà du Niveau 2/support Faible ; RFD normale ne contribue à aucune convergence. |
| 8 | Force normale, RFD↓ | 2 (signal/hypothèse faible, une seule famille — RFD) | — | **Capacité — hypothèse faible, symétrique du Cas 7** | 🟢 **vérifié** : D2 confirme explicitement l'absence de hiérarchie — RFD seule produit exactement le même résultat que Force seule (Cas 7), aucune différence de traitement. |
| 9 | Force↓, RFD↓ | 3 (convergence de deux familles concordantes) | — | **Capacité — mécanisme retenu, support supérieur ("profil mixte physiologique", intra-branche)** | 🟢 **vérifié** : conforme à D1-D2. **Terminologie à ne pas confondre** (signalée explicitement) : ce "profil mixte" est **interne à la branche Capacité** (deux familles physiologiques convergentes) — différent du `PROFIL MIXTE` de D4 (Capacité **et** Stratégie ensemble, §7). Les deux partagent le mot "mixte" sans désigner la même chose. |
| 10 | Aucune donnée explicative exploitable (ni Capacité ni Stratégie) | 0 | 0 | **NON DISCRIMINABLE** | 🟢 conforme — cas direct de D5 (§8, point 1). |

---

## 10. Compatibilité avec HYP V1

| Élément | Compatibilité | Détail |
|---|---|---|
| Cycle d'états HYP V1 (Absente→Suspectée→Retenue/Faible→Modérée→Forte) | **Compatible avec HYP V1.** | Le cycle d'état de `HYP-PUI-01` elle-même reste gouverné exclusivement par le diagnostic (`cmj_peak_power`/`slcmj_peak_power`), inchangé. La distinction Capacité/Stratégie opère strictement en aval, une fois l'état Retenue déjà atteint — un sous-mécanisme, pas une modification du cycle. |
| Hiérarchie diagnostique/confirmative/explicative | **Compatible avec HYP V1.** | Aucune variable de la Branche Capacité ou Stratégie n'est reclassée — toutes restent "explicative" (physiologique ou biomécanique), comme déjà établi. Aucune ne devient diagnostique ou confirmative. |
| ADR-001 (affaiblissement, plafonnement, jamais régressif/annulant) | **Compatible avec HYP V1, par extension non re-validée explicitement dans cette mission.** | Le principe (une preuve discordante plafonne, ne fait jamais régresser, n'annule jamais) n'est pas contredit par D1-D5, mais son application précise **à l'intérieur** du sous-mécanisme Capacité (ex. une variable physiologique redevenant normale après avoir été déficitaire) n'est pas explicitement retraitée par cette mission — extension par analogie, 🟠. |
| ADR-003 (convergence par mécanismes indépendants, pas simple comptage de KPI) | **Point de vigilance, pas une incompatibilité tranchée.** | D1/D2 parlent de "plusieurs preuves physiologiques concordantes" sans préciser si deux KPIs de la **même** famille (ex. deux tests segmentaires de force absolue) comptent comme une convergence suffisante, ou si ADR-003 imposerait une convergence **entre familles différentes** (Force, RFD, TTPF, profil F-V) pour rester cohérent avec son principe déjà validé ailleurs. **Non tranché** — signalé en §10 comme point résiduel. |
| ADR-007 (plafonnement par catégorie, discordance) | **Compatible avec HYP V1, par extension non re-validée explicitement.** | Même statut qu'ADR-001 — cohérent en principe, non retraité explicitement pour le sous-mécanisme. |
| Mécanisme de support existant (Faible/Modérée/Forte) | **Compatible avec HYP V1 — réutilisé intentionnellement.** | D1 demande explicitement de réutiliser cette mécanique plutôt que d'en inventer une nouvelle — appliqué tel quel en §4. |
| "Une variable peut générer mais ne valide pas nécessairement seule" | **Compatible avec HYP V1.** | Directement implémenté par la distinction Niveau 2 (signal/hypothèse, une variable) vs Niveau 3 (mécanisme retenu, convergence) — §3. |

**Synthèse** : à l'exception du point de vigilance ADR-003 (convergence intra-famille vs
inter-familles, non tranché) et du point de cohérence D3/D4 (§1, résolu par une lecture proposée mais
non encore confirmée), le modèle formalisé dans ce document est **compatible avec HYP V1**.

---

## 11. Impact sur `CLI040`

`CLI040` **n'est pas modifiée**, conformément à la consigne.

**Ce qu'elle continue à faire** : elle reste l'orientation unique déclenchée dès que `HYP-PUI-01`
atteint l'état Retenue, indépendamment du résultat de l'analyse Capacité/Stratégie/Mixte/Non
discriminable — exactement comme avant cette mission.

**Pourquoi elle reste trop générale pour distinguer Capacité vs Stratégie** : son texte et sa
condition de déclenchement restent fondés sur le seul diagnostic (`cmj_peak_power`/
`slcmj_peak_power`) — elle n'a jamais été conçue pour varier selon un mécanisme explicatif, et cette
mission n'introduit aucune modification à ce niveau. Formaliser Capacité/Stratégie/Mixte/Non
discriminable **enrichit ce que le moteur sait**, sans changer **ce qu'il affiche** au niveau de
l'orientation elle-même.

**La distinction peut-elle être portée en amont sans changer `CLI040` ?** 🟢 Oui, par analogie
directe avec un mécanisme déjà validé : ADR-004 transmet déjà le niveau de support
(Faible/Modérée/Forte) à la couche `CLI###` **comme métadonnée d'affichage, sans créer de nouveau
seuil de déclenchement**. La même architecture s'applique structurellement à la conclusion
Capacité/Stratégie/Mixte/Non discriminable : elle peut être transmise comme métadonnée
supplémentaire accompagnant `CLI040`, sans que `CLI040` elle-même ait besoin d'être scindée. 🟠 Cette
application au cas Capacité/Stratégie est une extension du même principe, pas une règle déjà
explicitement énoncée pour ce cas précis — mais elle ne nécessite aucune nouvelle invention
architecturale.

**Si une nouvelle orientation `CLI` distincte s'avérait nécessaire** (par exemple pour formuler
différemment "développer une capacité" vs "corriger une stratégie d'exécution") : **non créée ici**.
🔴 **FUTURE DÉCISION CLI.**

---

## 12. Règles restant à définir

Consolidation de tous les points 🔴 identifiés dans ce document :

1. **Définition de "capacités physiologiques pertinentes évaluées"** (§6) — trois niveaux candidats
   proposés, aucun retenu. Bloque l'instanciation opérationnelle de la condition 3 de D3.
2. **Nombre exact de preuves physiologiques concordantes** nécessaire pour passer du Niveau 2
   (signal/hypothèse) au Niveau 3 (mécanisme retenu) dans la branche Capacité (§4) — intentionnellement
   non fixé par ce document, conformément à la consigne "ne pas inventer un nombre précis".
3. **Convergence intra-famille vs inter-familles** (§10, point ADR-003) — deux tests segmentaires de
   la même famille comptent-ils comme une convergence suffisante, ou faut-il une convergence entre
   familles différentes pour rester cohérent avec ADR-003 ? Non tranché.
4. **Articulation D3-condition 4 / D4** (§1, §7) — une lecture est proposée (D4 prime pour le cas
   simultané), mais elle constitue une interprétation, pas une confirmation explicite du praticien.
5. **Future déclinaison éventuelle de `CLI040`** (§11) — non créée, marquée pour une décision future
   distincte de cette mission.

---

## 13. Résumé praticien

**La phrase demandée, telle qu'elle peut être écrite avec le niveau de certitude actuel :**

> Quand Kinexus détecte une Puissance déficitaire, il examine ensuite, séparément, les 34 variables
> physiologiques et les 29 variables biomécaniques déjà cartographiées : si les variables
> physiologiques convergent, il retient un déficit de capacité (avec un support gradué selon leur
> nombre) ; si les variables biomécaniques sont anormales **et** que les capacités physiologiques
> pertinentes ont été réellement testées et trouvées normales, il retient un problème de stratégie
> d'exécution ; si les deux convergent en même temps, il retient un profil mixte, sans chercher
> lequel des deux est la cause ; et si les capacités n'ont pas été suffisamment testées, ou si aucun
> mécanisme ne ressort d'aucune des deux analyses, il le dit explicitement plutôt que de trancher à
> tort.

**Cette phrase peut être écrite sans ambiguïté au niveau de la structure logique.** Elle reste
toutefois adossée à des paramètres non encore fixés qui ne changent pas la structure, mais son
fonctionnement opérationnel exact :

- "les capacités physiologiques pertinentes ont été réellement testées" (§6, 🔴) — le périmètre exact
  de "pertinentes" reste à choisir parmi 3 niveaux candidats.
- "si les variables physiologiques convergent" (§4, 🔴) — le nombre exact de variables concordantes
  nécessaire reste non fixé, volontairement.
- Le cas simultané Capacité+Stratégie (`PROFIL MIXTE`, D4) repose sur une articulation avec
  D3-condition 4 qui doit être confirmée explicitement (§1) avant toute implémentation — sans cette
  confirmation, la phrase ci-dessus resterait correcte pour les branches Capacité seule et Stratégie
  seule, mais son traitement du cas mixte resterait, formellement, en suspens.

Ces trois points ne bloquent pas la compréhension de la logique d'ensemble — ils déterminent
uniquement les seuils exacts qui, une fois choisis par le praticien, rendent le modèle directement
implémentable sans ambiguïté résiduelle.

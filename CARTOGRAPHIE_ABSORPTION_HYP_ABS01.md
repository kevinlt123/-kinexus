# Cartographie clinique — HYP-ABS-01 (Absorption)

**Statut** : cartographie clinique uniquement. Aucune modification du code (`index.html`,
`computeMoteur()`, `TFM`, `qualityScores`), aucun écran modifié, aucun branchement HYP
supplémentaire, aucune modification de `HYP-ABS-01` ni des `CLI###`. `HYP-CSM-01` reste suspendue,
non réactivée ici.

**Légende** : 🔴 Diagnostique · 🟠 Confirmative · 🟡 Explicative physiologique · 🟢 Explicative
biomécanique · ⚪ Non utilisée · 📄 SOURCE EXPLICITE · 🔧 INFERENCE (correspondance de nommage
nécessaire) · **CONTRADICTION DE SOURCE** · NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES.

**Sources** : `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-ABS-01, lignes 412-501, et fiche
HYP-STAB-01 pour la frontière), `CARTOGRAPHIE_VARIABLES_HYP.md` (sections Absorption et
Stabilisation), `KINEXUS_REASONING_ENGINE_V1.md` §4 (ADR-003, exception SLLT), `index.html`
(`TESTS`, `TFM`).

---

## Réponses directes aux 13 questions posées

1. **Diagnostic** : 10 KPI répartis sur 3 tests (`landing_uni`/`landing_bi`, `SLLT`, `CMJ` — 2
   KPI CMJ marqués 🔧 inférence de nommage) — §1.
2. **Charge encaissée** : `sllt_peak_landing_force`, `sllt_loading_rate`, `cmj_braking_rfd`/
   `impulse`, `cmj_ecc_mean_power`/`peak_vel` — §2.A.
3. **Récupération/stabilisation** : `landing_uni_tts`, `landing_bi_tts`, `sllt_tts`,
   `sllt_ttplf`, `sllt_cop_path` — §2.B.
4. **Interaction des deux mécanismes** : convergence simple (2 preuves parmi l'ensemble
   diagnostique, sans distinction formelle "magnitude" vs "récupération" au niveau de la règle de
   seuil elle-même) — §2, §12.
5. **Confirmatives** : 13 variables (Landing bilatéral, CMJ, DJ/SLDJ) — §1.
6. **Explicatives** : cinétique RFD de 9 tests isométriques + WBLT + biomécanique DJ/SLDJ/CMJ —
   §5 (reprise directe de la cartographie déjà établie, pas de nouveau travail).
7. **Réactivité à ne pas contaminer** : `dj_rsi`, `sldj_rsi`, `cmjr_mean_rsi`,
   `cmjr_mean_rebound_height`, hop tests — **explicitement exclus**, §6.
8. **Stabilisation à ne pas utiliser** : `sls_*`, `eo_surface`, `ef_surface`, `strobo_surface` —
   exclues ; mais `landing_uni_tts`/`landing_bi_tts` sont **légitimement partagées** avec
   Stabilisation, pas une contamination — §9.
9. **SLLT** : diagnostique fort (5/5 KPI), mécanisme de convergence encore non formalisé pour
   son cas précis — §3.
10. **Peak Landing Force** : plusieurs variables distinctes portent ce nom selon le test — rôles
    différents, aucune contradiction une fois désambiguïsées — §4.
11. **TTS** : diagnostique partagé Absorption/Stabilisation pour `landing_*`, diagnostique pour
    Absorption seule pour `sllt_tts`, rôle non déterminable pour `sldj_tts` — §5.
12. **DJ/SLDJ RSI** : explicitement exclus d'Absorption (réponse D) — §6.
13. **Différence Absorption/Réactivité/Stabilisation** : voir §16 (conclusion praticien).

---

## 1. Preuves diagnostiques principales

**Vérifiées directement dans `HYP_ARCHITECTURE_PHASE_C.md` (lignes 418-421).**

| Variable | Test | Mesure | Unité | Direction déficit | Rôle | Source |
|---|---|---|---|---|---|---|
| `landing_uni_tts` | Landing Unilatéral | Temps de stabilisation | s | `dir:min` (haut = déficit) | Diagnostique | 📄 SOURCE EXPLICITE |
| `landing_bi_tts` | Land and Hold (bilatéral) | Temps de stabilisation | s | `dir:min` | Diagnostique | 📄 |
| `sllt_peak_landing_force` | SLLT | Force de pic à l'atterrissage | N/kg | `dir:min` | Diagnostique | 📄 |
| `sllt_ttplf` | SLLT | Temps jusqu'à la force de pic | ms | `dir:max` (bas = déficit — inversé) | Diagnostique | 📄 |
| `sllt_loading_rate` | SLLT | Taux de charge | N/s | `dir:min` | Diagnostique | 📄 |
| `sllt_tts` | SLLT | Temps de stabilisation | s | `dir:min` | Diagnostique | 📄 |
| `sllt_cop_path` | SLLT | Longueur du trajet du centre de pression | mm | `dir:min` | Diagnostique | 📄 |
| `cmj_ecc_mean_power` | CMJ | Puissance moyenne excentrique | W/kg | non documentée dans `TESTS` (unité W/kg par convention CMJ) | Diagnostique | 📄 |
| `cmj_ecc_peak_vel` | CMJ | Vitesse de pic excentrique | m/s | `dir:max` | Diagnostique | 📄 |
| `cmj_braking_rfd` | CMJ | RFD de la phase de freinage | N/kg/s | `dir:max` | Diagnostique | 🔧 **INFERENCE** — correspondance de nommage nécessaire, gel point 11, pas une lecture littérale du nom Vierge_7 |
| `cmj_braking_impulse` | CMJ | Impulsion de freinage | Ns/kg | `dir:max` | Diagnostique | 🔧 **INFERENCE**, même réserve |

**Point de rigueur** : `cmj_braking_rfd`/`cmj_braking_impulse` sont marquées 🔧 (inférence de
correspondance de nommage) dans la fiche source elle-même — pas une lecture 📄 directe. Ce statut
est **repris tel quel**, pas renforcé ni affaibli par ce document.

**Aucune variable de test dynamique de saut simple (DJ/SLDJ/CMJR) n'est diagnostique** — vérifié,
absentes de cette liste (voir §6 pour leur exclusion explicite).

---

## 2. Les deux dimensions d'Absorption

**Question fondamentale posée par la mission** : Vierge_7 formalise-t-elle ces deux dimensions comme
deux mécanismes diagnostiques réellement indépendants ?

**Réponse** : 🔧 **INFERENCE, pas SOURCE EXPLICITE.** La fiche `HYP-ABS-01` ne nomme jamais
explicitement "magnitude/charge" et "récupération/stabilisation" comme deux catégories formelles de
preuve — elle liste 10 KPI diagnostiques dans une seule catégorie plate, avec une seule condition de
seuil (`CLI060` : "deux preuves diagnostiques déficitaires", sans distinction de catégorie). La
distinction en deux dimensions est une **lecture de synthèse**, cohérente avec la nature des
variables elles-mêmes (certaines mesurent une force/vitesse au moment de l'impact, d'autres un temps
de retour à l'équilibre), mais **ce découpage n'est écrit nulle part comme une règle du moteur**. Ne
pas le transformer en règle HYP — ce document le documente comme grille de lecture, pas comme
mécanisme de convergence séparé.

### A — Magnitude / charge encaissée

| Variable | Test | Rôle | `CLI` associée | Source |
|---|---|---|---|---|
| `sllt_peak_landing_force` | SLLT | 🔴 Diagnostique | `CLI060`/`CLI061` (*"Peak Landing Force"*) | 📄 |
| `sllt_loading_rate` | SLLT | 🔴 Diagnostique | non nommée séparément dans `CLI060`/`061` | 📄 (appartenance) |
| `cmj_braking_rfd`, `cmj_braking_impulse` | CMJ | 🔴 Diagnostique | non nommées | 🔧 |
| `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` | CMJ | 🔴 Diagnostique | non nommées | 📄 |
| `landing_bi_peak_landing_force` | Land and Hold | 🟠 Confirmative | *"Peak Landing Force"*, `CLI060`/`061` | 📄 |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | DJ/SLDJ | 🟠 Confirmative | non nommées | 📄 |

### B — Récupération / retour à la stabilité

| Variable | Test | Rôle | `CLI` associée | Source |
|---|---|---|---|---|
| `landing_uni_tts` | Landing Unilatéral | 🔴 Diagnostique | *"Time To Stabilization"*, `CLI060`/`061` | 📄 |
| `landing_bi_tts` | Land and Hold | 🔴 Diagnostique | idem | 📄 |
| `sllt_tts` | SLLT | 🔴 Diagnostique | idem | 📄 |
| `sllt_ttplf` | SLLT | 🔴 Diagnostique | non nommée séparément | 📄 (appartenance) |
| `sllt_cop_path` | SLLT | 🔴 Diagnostique | *"COP"*, confirmative `CLI060` | 📄 |

---

## 3. SLLT — point central

| KPI | Rôle | Ce qu'il mesure |
|---|---|---|
| `sllt_peak_landing_force` | 🔴 Diagnostique | Amplitude de la force au moment de l'atterrissage |
| `sllt_ttplf` | 🔴 Diagnostique | Délai avant d'atteindre cette force de pic |
| `sllt_loading_rate` | 🔴 Diagnostique | Vitesse de montée en charge |
| `sllt_tts` | 🔴 Diagnostique | Temps pour revenir à un état stable |
| `sllt_cop_path` | 🔴 Diagnostique | Trajet du centre de pression après l'atterrissage |

**Les 5 KPI sont diagnostiques — tous les 5.** 📄 SOURCE EXPLICITE. Aucun n'est confirmatif ni
explicatif — SLLT est le seul test dont **l'intégralité** des KPI mesurés relève de la catégorie
diagnostique.

**Distinction demandée, respectée explicitement** : "SLLT mesure la capacité à encaisser" (📄, ce que
ses 5 KPI documentent collectivement) ≠ "SLLT prouve à lui seul une cause physiologique précise" (❌ —
aucun des 5 KPI ne renseigne un mécanisme causal, uniquement un résultat fonctionnel mesuré au moment
et après le contact au sol ; la cause physiologique relève des variables **explicatives**, §5,
distinctes de SLLT).

**Point non résolu, signalé tel quel (mission §12, ADR-003)** : ces 5 KPI proviennent d'**un seul
essai** — la règle générale (ADR-003, `KINEXUS_REASONING_ENGINE_V1.md` §4) précise que des KPI d'un
même essai ne constituent pas, par défaut, des preuves indépendantes. Une **exception a été demandée
explicitement par le praticien** pour ce cas précis, mais **son énoncé formel n'a jamais été rédigé**
— citation littérale : *"l'énoncé précis de l'exception SLLT reste à rédiger"*
(`KINEXUS_REASONING_ENGINE_V1.md` §4). Ce document ne le rédige pas non plus — il consolide ce qui
est déjà su (le principe existe, sa formalisation exacte pour SLLT n'existe pas), sans inventer la
règle manquante.

---

## 4. Peak Landing Force

**Variantes réellement présentes dans le code, vérifiées** :

| Variable | Existe dans `index.html` ? | Rôle Absorption | Rôle Stabilisation | Rôle Réactivité | Autre |
|---|---|---|---|---|---|
| `sllt_peak_landing_force` | ✅ Oui (test SLLT) | 🔴 Diagnostique | ⚪ Exclue (gel) | ⚪ | — |
| `landing_bi_peak_landing_force` | ✅ Oui (test `landing_bi`) | 🟠 Confirmative | ⚪ Exclue (gel) | ⚪ | — |
| `landing_uni_peak_landing_force` | ❌ **N'existe pas** — `landing_uni` ne possède qu'un KPI `tts`, vérifié dans `TESTS` (`index.html` ligne 128) | — | — | — | Cité par la mission comme variante à vérifier ; absente du code |
| `dj_peak_landing_force` | ✅ Oui | 🟠 Confirmative | ⚪ | 🟠 Confirmative / 🟢 Explicative (double rôle, `CARTOGRAPHIE_REACTIVITE_HYP_REA01.md` §7) | — |
| `sldj_peak_landing_force` | ✅ Oui | 🟠 Confirmative | ⚪ | 🟠 / 🟢 (double rôle) | — |
| `cmjr_peak_landing_force` | ✅ Oui (test CMJR) | ⚪ **Non utilisée** | ⚪ | ⚪ **Non repérée non plus dans Réactivité** | 🔴 NON DÉTERMINABLE — absente de toutes les listes vérifiées |
| `slcmj_peak_landing_force` | ✅ Oui (test SLCMJ) | ⚪ | ⚪ | ⚪ | 🟡 Explicative de **Puissance** (`CARTOGRAPHIE_CMJ_SLCMJ_PUISSANCE.md` §5) |
| `cmj_landing_peak_force` | ✅ Oui (test CMJ, nommage inversé "landing_peak_force") | ⚪ | ⚪ | ⚪ | 🔴 NON DÉTERMINABLE — absente de toute cartographie HYP### vérifiée (déjà signalé identiquement pour Puissance) |

**Gel déjà acté, non remis en question** : Peak Landing Force (sous toutes ses variantes utilisées)
exclue de Stabilisation, conservée pour Absorption.

**Contradiction historique évoquée par la mission — vérifiée, résolue par désambiguïsation, pas par
correction silencieuse** : il n'existe **pas** de contradiction réelle une fois les variables
distinguées. `sllt_peak_landing_force` (diagnostique) et `landing_bi_peak_landing_force`
(confirmative) sont **deux KPI différents, de deux tests différents** — la fiche source les traite
différemment parce que ce sont des mesures différentes, pas une incohérence. La citation croisée dans
`CLI060`/`CLI061` (*"Peak Landing Force"* comme diagnostique **et** confirmative selon l'orientation)
reflète ce même fait : `CLI060` s'appuie sur la version SLLT (diagnostique), `CLI061` sur une lecture
plus générale du même concept — 📄 SOURCE EXPLICITE, *"Conditions de confiance"*,
`HYP_ARCHITECTURE_PHASE_C.md` ligne 445-447. **Aucune contradiction ne subsiste** pour ce point
précis, contrairement à `cmjr_mean_rsi` (Réactivité) ou à `landing_*_tts` (§9, ci-dessous).

---

## 5. Time to Stabilization / TTS

| Variable | Test | Qualité(s) | Rôle | Direction | Unité | Source |
|---|---|---|---|---|---|---|
| `landing_uni_tts` | Landing Unilatéral | **Absorption ET Stabilisation** | 🔴 Diagnostique dans les deux | `dir:min` | s | 📄 SOURCE EXPLICITE, vérifié dans les deux fiches |
| `landing_bi_tts` | Land and Hold | **Absorption ET Stabilisation** | 🔴 Diagnostique dans les deux | `dir:min` | s | 📄 idem |
| `sllt_tts` | SLLT | Absorption uniquement | 🔴 Diagnostique | `dir:min` | s | 📄 |
| `sldj_tts` | SLDJ | Aucune identifiée | — | `dir:min` (KPI existe, `index.html` ligne 126) | s | 🔴 **NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES** — présente dans le code, absente de toute liste HYP### vérifiée (Absorption, Réactivité, Stabilisation). Aucun rôle attribué par analogie, conformément à la consigne. |

**Point signalé, pas résolu** : `landing_uni_tts`/`landing_bi_tts` sont **diagnostiques des deux
qualités simultanément** — un cas différent des variables partagées vues jusqu'ici dans ce projet
(qui ne partageaient jamais le rang diagnostique entre deux qualités). Ce n'est pas une contradiction
au sens strict (les deux fiches, lues séparément, l'affirment cohéremment chacune), mais cela rompt
le principe de disjonction diagnostique observé partout ailleurs (Force/Puissance/Réactivité)
— déjà noté ailleurs comme *"état 'Retenue sans orientation `CLI###`' toléré"* pour Stabilisation
(`KINEXUS_REASONING_ENGINE_V1.md` §6). Documenté, non arbitré davantage ici.

---

## 6. DJ / SLDJ RSI — vérification du risque de contamination

| Variable | Réactivité | Absorption | Rôle exact dans chaque qualité |
|---|---|---|---|
| `dj_rsi` | 🔴 Diagnostique principal | ⚪ **Explicitement exclue** | 📄 SOURCE EXPLICITE, "Variables exclues" de la fiche Absorption (ligne 467) : *"`dj_rsi`, `sldj_rsi`... (réactivité pure)"* |
| `sldj_rsi` | 🔴 Diagnostique principal unilatéral | ⚪ **Explicitement exclue** | idem |

**Réponse à la question posée (A/B/C/D)** : **D — explicitement exclues d'Absorption.** 📄 SOURCE
EXPLICITE, sans ambiguïté. Ni diagnostique, ni confirmative, ni explicative.

---

## 7. Autres variables DJ / SLDJ

| Variable | Absorption | Réactivité | Autre qualité | Rôle |
|---|---|---|---|---|
| `dj_contact_time`/`sldj_contact_time` | 🟠 Confirmative | 🟠 Confirmative / 🟢 Explicative | — | Double rôle Absorption/Réactivité, jamais diagnostique |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | 🟠 Confirmative | 🟠 / 🟢 | — | idem |
| `dj_landing_impulse`/`sldj_landing_impulse` | 🟢 Explicative (double rôle avec confirmative, `HYP_ARCHITECTURE_PHASE_C.md`) | 🟠 / 🟢 | — | idem |
| `dj_leg_stiffness`/`sldj_leg_stiffness` | ⚪ **Non repérée dans Absorption** | 🟢 Explicative | — | Réactivité uniquement — vérifié, absente de la fiche Absorption |
| `dj_peak_prop_force`/`power`, `sldj_*` | 🟢 Explicative biomécanique (double rôle) | 🟠 / 🟢 | — | Double rôle |
| `dj_height`/`sldj_height` | ⚪ Non utilisée | 🟠 Confirmative | — | Réactivité uniquement |
| `dj_rsi`/`sldj_rsi` | ⚪ **Exclue** | 🔴 Diagnostique | — | §6 |

**Distinction demandée** : la capacité de **restitution réactive** est portée par `dj_rsi`/`sldj_rsi`
(Réactivité seule) ; la capacité à **absorber la charge** est portée par les variables de force/
impulsion d'atterrissage (`peak_landing_force`, `landing_impulse`), partagées entre les deux
qualités ; la **raideur de jambe** (`leg_stiffness`) n'est, dans les sources vérifiées, rattachée
qu'à Réactivité pour ces deux tests, pas à Absorption.

---

## 8. CMJ / SLCMJ dans Absorption

| Variable | Diagnostique ? | Confirmative ? | Explicative ? | Statut |
|---|---|---|---|---|
| `cmj_ecc_mean_power` | ✅ | — | — | 📄 SOURCE EXPLICITE |
| `cmj_ecc_peak_vel` | ✅ | — | — | 📄 |
| `cmj_braking_rfd` | ✅ | — | — | 🔧 **INFERENCE** (correspondance de nommage, gel point 11) — **à ne pas confondre avec `cmj_conc_rfd`** |
| `cmj_braking_impulse` | ✅ | — | — | 🔧 INFERENCE, même réserve |
| `cmj_depth` | — | ✅ | — | 📄 |
| `cmj_conc_duration` | — | ✅ | — | 📄 |
| `cmj_rsi_mod` | — | ✅ | — | 📄 |
| `cmj_conc_peak_force` | — | ✅ | — | 📄 |
| `cmj_conc_mean_force` | — | ✅ | — | 📄 |
| `cmj_landing_impulse` | — | ✅ | — | 📄 |
| `cmj_braking_duration` | — | — | ✅ (double rôle) | 📄 |
| **`cmj_conc_rfd`** | ❌ | ❌ | ❌ | ⚪ **Non utilisée par Absorption sous aucun rôle** — variable de Puissance (explicative) et Explosivité (diagnostique), **jamais Absorption**. Vérifiée absente de toutes les listes de la fiche source. |

**Distinction demandée, vérifiée avec certitude** : `cmj_braking_rfd` (freinage, phase excentrique)
et `cmj_conc_rfd` (concentrique, propulsion) sont deux variables **structurellement différentes**
(phases opposées du mouvement) et n'ont **aucun rôle commun** — la première est diagnostique
d'Absorption (par inférence de nommage) et explicative d'Explosivité ; la seconde est explicative de
Puissance et diagnostique d'Explosivité. Confusion explicitement écartée.

---

## 9. Absorption vs Stabilisation — frontière

| Variable/Test | Absorption | Stabilisation | Pourquoi |
|---|---|---|---|
| `sllt_*` (5 KPI) | 🔴 Diagnostique | ⚪ **Exclue** (gel) | 📄 Aucune mention de SLLT dans la fiche Stabilisation ni dans `CLI070`/`071` |
| `landing_bi_peak_landing_force` | 🟠 Confirmative | ⚪ **Exclue** (gel) | 📄 Corroboré par relecture `CLI060`/`061`, `HYP_ARCHITECTURE_PHASE_C.md` ligne 474-476 |
| `landing_uni_tts`/`landing_bi_tts` | 🔴 Diagnostique | 🔴 **Diagnostique aussi** | 📄 **Partagées légitimement** — pas une contamination, cas signalé §5 |
| `sls_*` (7 KPI) | ⚪ Non utilisée | 🔴 Diagnostique | 📄 SLS absent de toute mention `CLI060`/`061`, cohérent avec son absence de la fiche Absorption |
| `eo_surface`, `ef_surface`, `strobo_surface` | ⚪ Non utilisée | 🔴 Diagnostique (Stabilisation) / confirmative-explicative (`strobo_surface`) | 📄 |
| `ybt_*` | ⚪ Non utilisée | ⚪ **Non utilisée non plus** | 📄 Absente des deux fiches — malgré `stabilisation:2` dans TFM (`index.html` ligne 750) : écart HYP↔TFM, non corrigé ici |
| `wblt_distance` | 🟡 Explicative | 🟡 Explicative | 📄 Partagée, même rôle catégoriel dans les deux |

**Ce qui permet réellement de distinguer "problème d'Absorption" vs "problème de Stabilisation"** :
📄 la magnitude/dynamique de l'atterrissage lui-même (SLLT, Peak Landing Force — exclusifs à
Absorption) d'un côté ; le contrôle postural statique/répété (SLS, tests visuels EO/EF/Strobo —
exclusifs à Stabilisation) de l'autre. **Le point de recouvrement réel et documenté** est le temps de
stabilisation après un atterrissage (`landing_*_tts`) — légitimement diagnostique des deux, sans
qu'aucune règle ne priorise l'une sur l'autre en cas de double déficit (non traité par ce document,
hors périmètre). 🔧 Cette synthèse est une lecture, pas une phrase écrite telle quelle dans
Vierge_7 — aucune distinction plus fine n'est inventée au-delà de ce que les listes de variables
permettent déjà de constater.

---

## 10. Absorption vs Réactivité — frontière

| Variable/Test | Absorption | Réactivité | Pourquoi |
|---|---|---|---|
| `dj_rsi`/`sldj_rsi` | ⚪ **Exclue** (§6) | 🔴 Diagnostique | 📄 Exclusion explicite |
| CMJR (tous KPI) | ⚪ **Exclue** (`cmjr_mean_rsi`, `cmjr_mean_rebound_height` cités nommément) | 🟢 Explicative (contradiction déjà documentée, `ARBITRAGE_CLINIQUE_REACTIVITE.md` — non réouverte ici) | 📄 |
| Repeated Hop (`repeated_hop_mean_rsi` et 3 KPI de fatigue) | ⚪ **Exclue nommément** | ⚪ Exclue également (Endurance, `ARBITRAGE_CLINIQUE_REACTIVITE.md`, décision déjà actée, non réouverte) | 📄 |
| `single_hop`/`triple_hop`/`crossover_hop_distance` | ⚪ **Exclues nommément** | 🟠 Confirmative | 📄 |
| `dj_contact_time`/`peak_landing_force`/`landing_impulse` (+ `sldj_*`) | 🟠/🟢 | 🟠/🟢 | Double rôle légitime, §7 |
| Landing (`landing_uni`/`landing_bi`), SLLT | 🔴 Diagnostique | ⚪ Non utilisée | 📄 Absentes de l'inventaire Réactivité |
| `landing_*_tts` | 🔴 Diagnostique | ⚪ Non utilisée | idem |

**Décisions déjà actées pour Réactivité, non réouvertes** (rappel, `ARBITRAGE_CLINIQUE_REACTIVITE.md`) :
CMJR non diagnostique ; Repeated Hop explicatif uniquement ; Heel Raise et Side Hop hors Réactivité.
Ces décisions n'ont aucun effet sur les rôles Absorption documentés ici, qui restent indépendants.

---

## 11. Diagnostic vs Explication — matrice

| Variable | Diagnostique Absorption | Confirmative | Explicative | Autre qualité |
|---|---|---|---|---|
| `landing_uni_tts`/`landing_bi_tts` | ✅ | — | — | Diagnostique aussi Stabilisation |
| `sllt_*` (5 KPI) | ✅ | — | — | — |
| `cmj_ecc_mean_power`/`peak_vel` | ✅ | — | — | — |
| `cmj_braking_rfd`/`impulse` | ✅ (🔧) | — | — | Explicative Explosivité |
| `landing_bi_peak_landing_force` | — | ✅ | — | — |
| `cmj_depth`/`conc_duration`/`rsi_mod`/`conc_peak_force`/`conc_mean_force`/`landing_impulse` | — | ✅ | — | Certaines partagées avec Puissance/Explosivité selon la variable |
| `dj_*`/`sldj_*` (contact time, landing force, landing impulse) | — | ✅ | — | Réactivité (double rôle) |
| RFD 9 tests isométriques + `wblt_distance` | — | — | ✅ | Partagées Force/Puissance/Réactivité selon variable |
| `cmj_braking_duration` | — | — | ✅ | — |

**Vérification demandée** : aucune variable explicative ne peut, dans cette matrice, créer seule
`HYP-ABS-01` — cohérent avec le principe transversal déjà gelé, non rouvert ici.

---

## 12. Règle de convergence

**Formalisation exacte, reprise sans invention** :

- `CLI060` : *"deux preuves diagnostiques déficitaires"* — 📄 SOURCE EXPLICITE.
- **Nombre de preuves** : 2, parmi les 10 KPI diagnostiques listés en §1.
- **Tests distincts requis ?** ✅ Oui, en pratique — ADR-003 (`KINEXUS_REASONING_ENGINE_V1.md` §4) :
  *"la convergence diagnostique requise pour atteindre Retenue s'évalue à l'échelle des
  mécanismes/tests indépendants, pas par simple comptage de variables issues d'un même test."*
- **Rôle spécifique de SLLT** : ses 5 KPI, provenant d'un seul essai, **ne constituent pas
  automatiquement 5 preuves indépendantes** — le principe général l'interdit. **Mais l'énoncé précis
  de l'exception nécessaire pour SLLT (comment compter ses KPI dans la règle des "2 preuves") reste
  non rédigé** — citation exacte déjà donnée en §3. Ce document ne le rédige pas.
- **Interaction Peak Landing Force / TTS** : `CLI060`/`CLI061` les citent tous deux comme "piliers"
  convergents (§4) — leur convergence renforce la confiance, mais aucune règle numérique
  supplémentaire n'est formulée au-delà du seuil général "2 preuves".
- **Preuves multiples** : au-delà de 2, aucune règle de gradation supplémentaire n'est documentée
  spécifiquement pour Absorption (le mécanisme général de support Faible/Modérée/Forte du moteur V1
  s'applique, non détaillé différemment ici).

---

## 13. Cas cliniques synthétiques

| Cas | Données | État HYP | Mécanisme identifié | `CLI` | Ce que le moteur ne peut PAS conclure |
|---|---|---|---|---|---|
| **1** | SLLT↓, PLF normale (Land and Hold), TTS normal | Selon le KPI SLLT précis en cause, 1 à 5 preuves du même essai — **convergence exacte non formalisée** (§3, §12) | Charge encaissée (A) potentiellement, mécanisme non détaillable avec certitude | Éligible si "2 preuves" au sens retenu | Le nombre exact de KPI SLLT nécessaires pour ces "2 preuves" |
| **2** | SLLT normal, PLF (Land and Hold) déficitaire, TTS normal | PLF (Land and Hold) est **confirmative**, pas diagnostique — seule, elle ne génère rien | Absente (pas de preuve diagnostique déficitaire) | Non éligible | Que la Land and Hold PLF puisse, seule, faire progresser `HYP-ABS-01` |
| **3** | SLLT normal, PLF normale, TTS déficitaire | Si `landing_uni_tts`/`landing_bi_tts` : 1 preuve diagnostique → Suspectée | Récupération (B) suspectée | Non éligible (1 preuve) | Une conclusion ferme sur 1 seule preuve |
| **4** | SLLT↓, PLF (Land and Hold)↓, TTS normal | SLLT↓ = preuve(s) diagnostique(s) ; PLF Land and Hold = confirmative, pas comptée dans le seuil diagnostique | Charge encaissée | Selon le nombre de KPI SLLT retenus comme preuves distinctes (§3, non tranché) | Un chiffre certain sans la règle SLLT manquante |
| **5** | SLLT↓, PLF normale, TTS↓ (`landing_*_tts`) | 2 tests distincts déficitaires (SLLT + Landing) → convergence claire, tests différents | Charge encaissée **et** récupération, deux tests distincts | `HYP-ABS-01` **Retenue**, `CLI060` éligible | Lequel des deux mécanismes (A ou B) est la cause principale — aucune priorisation formalisée |
| **6** | SLLT↓, PLF↓, TTS↓ | Convergence large (SLLT + Land and Hold + Landing) | Les deux dimensions simultanément | Retenue, support probablement élevé | Une hiérarchie entre les 3 signaux — non formalisée |
| **7** | `dj_rsi`↓, `sldj_rsi`↓, SLLT normal, Landing normal | Réactivité Retenue (DJ/SLDJ, 2/2) ; Absorption **Absente** — `dj_rsi`/`sldj_rsi` explicitement exclus (§6) | Réactivité uniquement | `CLI050` (Réactivité), pas `CLI060` | Que le déficit de RSI explique ou contamine Absorption |
| **8** | `dj_rsi`/`sldj_rsi` normaux, SLLT↓ | Absorption : signal/Retenue selon nombre de KPI SLLT retenus ; Réactivité **Absente** | Absorption seule, indépendamment de Réactivité | `CLI060` potentiellement éligible | — |
| **9** | `landing_*_tts`↓, SLS/EO/EF/Strobo↓ | **Les deux hypothèses peuvent être Retenues simultanément** — `landing_*_tts` diagnostique des deux qualités (§5, §9), SLS/EO/EF/Strobo diagnostiques de Stabilisation uniquement | Absorption (via TTS) **et** Stabilisation (via SLS/EO/EF/Strobo **et** TTS partagé) | `CLI060` et orientation Stabilisation, potentiellement toutes deux | Si le déficit de TTS "appartient" plus à l'une qu'à l'autre — non discriminable, cas de recouvrement légitime documenté §5 |
| **10** | PLF (Land and Hold)↓, SLLT normal, TTS normal | PLF Land and Hold = confirmative seule, aucune preuve diagnostique déficitaire | Absente | Non éligible | Que Kinexus puisse aujourd'hui dire "Absorption compromise" sur la seule base d'un signal confirmatif — limite du raisonnement, la hiérarchie diagnostique/confirmative l'interdit structurellement |

---

## 14. Variables à double rôle — liste exhaustive

| Variable | Absorption | Stabilisation | Réactivité | Autre | Rôle exact |
|---|---|---|---|---|---|
| `landing_uni_tts`/`landing_bi_tts` | 🔴 Diagnostique | 🔴 Diagnostique | ⚪ | — | Partagées légitimement entre 2 qualités, cas unique dans le corpus vérifié à ce jour |
| `sllt_*` (5 KPI) | 🔴 Diagnostique | ⚪ Exclue (gel) | ⚪ | — | Absorption exclusivement |
| `landing_bi_peak_landing_force` | 🟠 Confirmative | ⚪ Exclue (gel) | ⚪ | — | Absorption exclusivement |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | 🟠 Confirmative | ⚪ | 🟠/🟢 | — | Absorption + Réactivité |
| `dj_landing_impulse`/`sldj_landing_impulse` | 🟢 Explicative | ⚪ | 🟠/🟢 | — | idem |
| `dj_contact_time`/`sldj_contact_time` | 🟠 Confirmative | ⚪ | 🟠/🟢 | — | idem |
| `cmj_braking_rfd`/`impulse` | 🔴 Diagnostique (🔧) | ⚪ | ⚪ | 🟢 Explicative Explosivité | Absorption + Explosivité, jamais Réactivité/Stabilisation |
| `wblt_distance` | 🟡 Explicative | 🟡 Explicative | ⚪ | 🔴 Diagnostique Mobilité | Trois qualités au total |
| `cmj_depth`/`conc_duration` | 🟠 Confirmative | ⚪ | ⚪ | 🟡 Explicative Puissance/Explosivité | Absorption + Puissance/Explosivité |

---

## 15. Contradictions et zones non arbitrées

| Point | Détail | Statut |
|---|---|---|
| Convergence SLLT (règle des "2 preuves" appliquée à 5 KPI d'un seul essai) | Principe général (ADR-003) documenté ; exception SLLT explicitement demandée par le praticien mais **jamais rédigée** (`KINEXUS_REASONING_ENGINE_V1.md` §4, citation exacte reprise en §3/§12) | **ZONE NON ARBITRÉE**, déjà signalée avant cette mission, non résolue ici |
| `landing_*_tts` diagnostique de deux qualités | Absorption **et** Stabilisation, sans priorité formalisée en cas de double déficit | **ZONE NON ARBITRÉE** — signalée pour la première fois avec ce niveau de précision dans cette mission |
| `sllt` — contamination TFM → Stabilisation | HYP exclut SLLT de Stabilisation ; TFM lui attribue `stabilisation:3` (`index.html` ligne 750 : `sllt:{absorption:3,stabilisation:3,...}`) | **CONTRADICTION DE SOURCE (HYP ↔ TFM)**, déjà identifiée dans le contexte fourni, confirmée ici par lecture directe du code, non corrigée |
| `ybt` — écart TFM → Stabilisation/Absorption | TFM attribue `stabilisation:2` à YBT ; ni Absorption ni Stabilisation ne l'utilisent dans HYP | **CONTRADICTION DE SOURCE (HYP ↔ TFM)**, découverte dans cette mission, non corrigée |
| `sldj_tts` | KPI existant dans le code, sans rôle identifié dans aucune fiche HYP### vérifiée | **NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES** — pas de rôle attribué par analogie |
| `cmjr_peak_landing_force`, `cmj_landing_peak_force` | KPI existants, sans rôle identifié dans aucune fiche HYP### vérifiée | **NON DÉTERMINABLE AVEC LES SOURCES ACTUELLES** |

---

## 16. Conclusion praticien

**Comment Kinexus doit-il raisonner lorsqu'un patient présente un problème d'Absorption ?**

1. **Ce qui diagnostique Absorption** : deux preuves parmi dix, réparties sur trois tests
   (Landing unilatéral/bilatéral, SLLT, et la phase de freinage/atterrissage du CMJ) — jamais une
   seule preuve isolée.
2. **Ce qui explique le déficit** : la vitesse de production de force sur neuf tests isométriques
   (globaux et segmentaires), la mobilité de cheville (WBLT), et le détail biomécanique du contact au
   sol sur Drop Jump/SLDJ.
3. **Charge encaissée vs retour à la stabilité** : ce sont deux façons de lire les mêmes dix preuves
   diagnostiques — la première regarde la force et la vitesse au moment de l'impact, la seconde le
   temps nécessaire pour redevenir stable. Cette distinction aide à la lecture clinique, mais
   Kinexus ne l'utilise pas aujourd'hui comme une règle de calcul séparée — les deux comptent de la
   même façon dans le seuil "deux preuves".
4. **Le rôle de SLLT** : c'est le test le plus complet pour Absorption — ses cinq mesures sont toutes
   diagnostiques. Un point technique reste cependant non résolu : la règle exacte pour compter
   plusieurs de ses mesures comme des preuves suffisamment indépendantes n'a jamais été rédigée.
5. **Le rôle de Peak Landing Force** : il existe plusieurs mesures de "force à l'atterrissage" selon
   le test (SLLT, Land and Hold, Drop Jump, SLDJ) — seule celle du SLLT est diagnostique, les autres
   confirment ou expliquent, jamais ne diagnostiquent seules.
6. **Le rôle de TTS** : c'est la seule famille de variables aujourd'hui diagnostique à la fois pour
   Absorption et pour Stabilisation — un patient présentant un temps de stabilisation anormal peut
   légitimement recevoir les deux conclusions, sans que Kinexus ne tranche laquelle est la plus
   probable.
7. **Ce qui appartient à Réactivité** : tout ce qui touche au Drop Jump/SLDJ en tant qu'indice de
   restitution rapide de force (RSI), au CMJ Rebound, et aux tests de saut horizontal répété —
   jamais utilisé pour diagnostiquer Absorption.
8. **Ce qui appartient à Stabilisation** : l'équilibre statique unipodal et les tests visuels (yeux
   ouverts/fermés/strobo) — jamais utilisés pour Absorption, malgré un chevauchement bien réel et
   documenté sur le temps de stabilisation après atterrissage (point 6).
9. **Ce qui ne doit surtout pas contaminer Absorption** : l'indice de réactivité (`dj_rsi`/`sldj_rsi`,
   explicitement exclu), tout ce qui vient du CMJ Rebound, et les tests d'équilibre statique — ces
   exclusions sont écrites noir sur blanc dans la fiche source, pas déduites.

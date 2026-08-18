# Audit — Architecture cible Absorption vs référentiel HYP actuel

**Statut** : audit de confrontation uniquement. L'architecture cible soumise n'est **pas** validée
par Vierge_7 du seul fait de cet audit — chaque élément est vérifié individuellement. Aucun code
modifié, aucune modification de `HYP-ABS-01`/`TFM`/`CLI###`, aucun seuil ni poids créé, `TTS` non
réintégré dans Absorption.

**Sources** : `CARTOGRAPHIE_ABSORPTION_HYP_ABS01.md`, `VARIABLES_DIAGNOSTIQUES_ABSORPTION.md`,
`HYP_ARCHITECTURE_PHASE_B/C.md`, `KINEXUS_REASONING_ENGINE_V1.md`, `index.html` (`TESTS`,
`CMJ_VAR_META`).

**Légende (statuts obligatoires)** : 📄 SOURCE EXPLICITE · 🔗 CORRESPONDANCE DE NOM · 🔧 INFERENCE ·
🔴 NOUVELLE RÈGLE À VALIDER · ⛔ NON DISPONIBLE DANS KINEXUS · ❓ NON DÉTERMINABLE.

---

## 1. Table de confrontation variable par variable

| Architecture cible | Nom exact Kinexus | Existe dans le code ? | Présent Vierge_7 ? | HYP actuel | Rôle actuel | Statut |
|---|---|---|---|---|---|---|
| Eccentric Deceleration RFD / BM | `cmj_braking_rfd` | ✅ (`valdName` exact : *"Eccentric Deceleration RFD / BM (EDRFD)"*) | Rôle diagnostique cité, nommage exact non confirmé | 🔴 Diagnostique Absorption | Correspondance déjà retenue par le gel | 🔗 pour le nom du KPI Kinexus / 🔧 pour son identification comme LA variable Vierge_7 |
| Eccentric Deceleration Impulse / BM | `cmj_braking_impulse` | ✅ (`valdName` : *"Eccentric Deceleration Impulse"*, sans suffixe "/BM" dans le libellé Kinexus lui-même) | idem | 🔴 Diagnostique Absorption | idem | 🔗 / 🔧 |
| Force at Zero Velocity | `cmj_force_zero_vel` | ✅ (`valdName` exact : *"Force at Zero Velocity"*) | Non repérée dans la fiche `HYP-ABS-01` ni ailleurs | ⚪ **Aucun rôle HYP### actuellement** | Utilisée uniquement par le moteur biomécanique par phase (architecture distincte) | 📄 pour l'existence du KPI / 🔴 **NOUVELLE RÈGLE À VALIDER** pour tout rôle Absorption — non inventé ici |
| Eccentric Peak Power / BM | — | ⛔ **N'existe pas** — vérifié dans `TESTS`/`CMJ_VAR_META`, aucun KPI "peak power excentrique" distinct | — | — | — | ⛔ NON DISPONIBLE DANS KINEXUS |
| Eccentric Mean Power / BM | `cmj_ecc_mean_power` | ✅ | ✅ | 🔴 Diagnostique | Déjà retenu | 📄 SOURCE EXPLICITE |
| Eccentric Peak Velocity | `cmj_ecc_peak_vel` | ✅ (`valdName` exact) | ✅ | 🔴 Diagnostique | Déjà retenu | 📄 |
| Eccentric Deceleration Phase Duration | `cmj_braking_duration` | ✅ (`valdName` exact) | ✅ | 🟢 Explicative | Déjà retenu | 📄 |
| CMJ Depth (Countermovement Depth) | `cmj_depth` | ✅ | ✅ | 🟠 Confirmative | Déjà retenu | 📄 |
| CMJ Stiffness | — | ⛔ **N'existe pas pour le CMJ bilatéral** — vérifié : `stiffness`/`leg_stiffness` n'apparaît dans aucun KPI du test `cmj` dans `TESTS` (`index.html`). Seuls DJ/SLDJ (`leg_stiffness`) et CMJR (`mean_stiffness`) en possèdent un | — | — | — | ⛔ NON DISPONIBLE DANS KINEXUS (pour CMJ) |
| DJ RSI | `dj_rsi` | ✅ | ✅ | 🔴 Diagnostique **Réactivité**, ⚪ **exclue explicitement d'Absorption** | Déjà tranché | 📄 |
| DJ Contact Time | `dj_contact_time` | ✅ | ✅ | 🟠 Confirmative Absorption | Déjà retenu | 📄 |
| DJ Eccentric Impulse | — | ⛔ **N'existe pas sous ce nom** — le test DJ ne possède pas de KPI "eccentric impulse" distinct (vérifié dans `TESTS`) ; le concept le plus proche déjà utilisé est `dj_landing_impulse` (déjà confirmative/explicative), qui n'est pas nommé "eccentric" | — | 🟢 Explicative/🟠 Confirmative (sous le nom `dj_landing_impulse`, pas "eccentric impulse") | — | ⛔ NON DISPONIBLE sous ce nom / 🔗 possible avec `dj_landing_impulse`, non confirmée |
| DJ Concentric Impulse | — | ⛔ **N'existe pas** — aucun KPI de ce nom pour DJ | — | — | — | ⛔ NON DISPONIBLE DANS KINEXUS |
| Asymétries (générique) | `computeAsymEngine` (lecture seule) | ✅ | ✅ (principe déjà gelé) | Modificateur, jamais générateur | Déjà tranché, non rouvert | 📄 |
| Peak Landing Force (générique) | Plusieurs variables distinctes selon le test — voir §6 | ✅ | ✅ | Variable selon le test | Déjà cartographié en détail | 📄 (désambiguïsé, pas regroupé) |
| Peak Landing Force Asymmetry | `cmj_landing_peak_force_asym` (+ `_L`/`_R`) | ✅ (vérifié `index.html` ligne 121) | Non repérée dans `HYP-ABS-01` | ⚪ Aucun rôle HYP### | Rattachée à `cmj_landing_peak_force`, elle-même déjà classée ❓ NON DÉTERMINABLE ailleurs (`VARIABLES_DIAGNOSTIQUES_ABSORPTION.md`) | 📄 pour l'existence / ❓ pour tout rôle Absorption |
| TTS (générique) | `landing_uni_tts`, `landing_bi_tts`, `sllt_tts` | ✅ | ✅ | 🔴 Diagnostique **Absorption et Stabilisation** (double, déjà documenté) | Statut actuel non modifié | 📄 — **divergence avec l'architecture cible**, voir §7 |

---

## 2. Freinage / Décélération

| Élément | Nom Kinexus | Nom Vierge_7 | Correspondance | Rôle HYP actuel | Rôle proposé | Preuve |
|---|---|---|---|---|---|---|
| Eccentric Deceleration RFD / BM | `cmj_braking_rfd` | Non cité littéralement — Phase B propose l'hypothèse `cmj_ecc_dec_rfd` | 🔗 le `valdName` Kinexus correspond mot pour mot au libellé proposé, mais cela reste un identifiant interne VALD, pas une citation de Vierge_7 | 🔴 Diagnostique | Diagnostique (déjà le cas) | `HYP_ARCHITECTURE_PHASE_B.md` ligne 265-267 : *"correspondance probable... nommage à confirmer"* |
| Eccentric Deceleration Impulse / BM | `cmj_braking_impulse` | idem, hypothèse `cmj_ecc_dec_impulse` | 🔗 | 🔴 Diagnostique | Diagnostique (déjà le cas) | idem |
| Force at Zero Velocity | `cmj_force_zero_vel` | **Non identifiable** dans les sources Vierge_7 consultées | ❓ aucune correspondance documentée | Aucun | Diagnostique/explicative *(proposition)* | **Rien** — ce document ne l'invente pas |

**Point explicitement demandé, traité sans invention** : "Force at Zero Velocity" existe bien dans le
code Kinexus (`valdName` exact), mais **aucune source consultée** (fiche `HYP-ABS-01`, `CLI060`/`061`,
Phase B/C) ne l'identifie comme variable clinique d'Absorption. Son intégration à l'architecture
cible serait une **🔴 NOUVELLE RÈGLE À VALIDER**, pas une redécouverte d'un rôle déjà existant.

---

## 3. Capacité excentrique

| Variable | Rôle |
|---|---|
| `cmj_ecc_mean_power` | 🔴 DIAGNOSTIQUE (📄) |
| `cmj_ecc_peak_vel` | 🔴 DIAGNOSTIQUE (📄) |
| "Eccentric Peak Power / BM" | ⛔ N'existe pas dans Kinexus |

**Vérification de l'affirmation** : *"Les capacités excentriques expliquent l'Absorption mais ne
doivent pas diagnostiquer seules l'Absorption."*

**Statut : contredite par les faits actuels, pas confirmée.** Les deux variables excentriques
réellement présentes (`cmj_ecc_mean_power`, `cmj_ecc_peak_vel`) sont **actuellement diagnostiques**,
pas explicatives, dans `HYP-ABS-01` — 📄 SOURCE EXPLICITE. L'affirmation proposée par l'architecture
cible **inverserait** ce rôle (diagnostique → explicative uniquement). Ce n'est donc **pas** une
lecture de ce qui existe déjà : c'est une **🔴 NOUVELLE RÈGLE CLINIQUE À VALIDER**, potentiellement
en tension directe avec le rôle diagnostique déjà gelé de ces deux variables. Signalé explicitement,
pas arbitré.

---

## 4. Stratégie d'absorption

| Élément | Rôle réel | Rôle HYP actuel | Statut source |
|---|---|---|---|
| `cmj_depth` | Profondeur du contre-mouvement | 🟠 Confirmative | 📄 |
| `cmj_braking_duration` | Durée de la phase de décélération excentrique | 🟢 Explicative | 📄 |
| "CMJ Stiffness" | — | Aucun (variable inexistante pour CMJ) | ⛔ |

**Point de vigilance respecté** : la distinction clinique *"capacité d'absorption correcte avec
stratégie différente"* est **cliniquement intéressante mais non formalisée comme règle du moteur**.
`HYP-ABS-01` ne distingue aujourd'hui aucune sous-catégorie "stratégie" séparée d'une catégorie
"capacité" au niveau du seuil de convergence (`CLI060` : deux preuves parmi un ensemble plat, sans
sous-catégorisation) — même limite déjà documentée pour Puissance
(`HYP_PUI_CAPACITE_VS_STRATEGIE.md`). Présenter cette distinction comme acquise pour Absorption
serait une **🔴 NOUVELLE RÈGLE À VALIDER**, pas une lecture existante.

---

## 5. Absorption réactive

| Variable | Diagnostique Absorption ? | Diagnostique Réactivité ? | Confirmatif Absorption ? | Explicatif Absorption ? | Statut |
|---|---|---|---|---|---|
| `dj_rsi` | ❌ **Exclue explicitement** | ✅ | ❌ | ❌ | 📄 |
| `dj_contact_time` | ❌ | — | ✅ | — | 📄 |
| "DJ Eccentric Impulse" | — | — | — | — | ⛔ Variable inexistante sous ce nom |
| "DJ Concentric Impulse" | — | — | — | — | ⛔ Variable inexistante |
| Asymétries (DJ) | Jamais seules — modificateur uniquement | idem | — | — | 📄 (principe déjà gelé) |

**Point central déjà vérifié, reconfirmé ici** : le fait que DJ soit diagnostique de Réactivité
**ne rend aucune de ses autres variables automatiquement diagnostique d'Absorption** — `dj_contact_time`
reste confirmative (jamais diagnostique) et `dj_rsi` reste explicitement exclue. 📄, cohérent avec
`CARTOGRAPHIE_ABSORPTION_HYP_ABS01.md` §6-7.

---

## 6. Réception / impact

*Reprise directe de `VARIABLES_DIAGNOSTIQUES_ABSORPTION.md` §7 — aucune variable regroupée sous un
même nom générique.*

| Variable exacte | Test | Rôle Absorption |
|---|---|---|
| `sllt_peak_landing_force` | SLLT | 🔴 Diagnostique |
| `landing_bi_peak_landing_force` | Land and Hold | 🟠 Confirmative |
| `landing_uni_peak_landing_force` | Landing Unilatéral | ⛔ N'existe pas dans Kinexus |
| `dj_peak_landing_force`/`sldj_peak_landing_force` | DJ/SLDJ | 🟠 Confirmative |
| `cmj_landing_peak_force_asym` (+`_L`/`_R`) | CMJ (asymétrie) | ❓ Aucun rôle HYP### repéré |

Cinq variables portant un nom proche — **aucune n'est traitée comme équivalente aux autres**,
conformément à la consigne.

---

## 7. TTS — exclusion d'Absorption (architecture cible) vs référentiel actuel

**Architecture cible** : TTS → Stabilisation exclusivement, retiré d'Absorption.

**Référentiel HYP actuel, vérifié, non modifié** : `landing_uni_tts`, `landing_bi_tts` sont 📄
**diagnostiques des deux qualités simultanément** ; `sllt_tts` est 📄 diagnostique d'Absorption
uniquement (SLLT n'appartient pas à Stabilisation, exclusion déjà gelée).

**Statut** : 🔴 **DIVERGENCE ENTRE ARCHITECTURE CIBLE ET RÉFÉRENTIEL HYP ACTUEL** — pas une erreur à
corriger silencieusement. Retirer `landing_uni_tts`/`landing_bi_tts` du diagnostic d'Absorption
constituerait une modification réelle de `HYP-ABS-01`, qui **nécessite une décision clinique
explicite du praticien avant toute implémentation** — non prise ici, non recommandée dans un sens ou
l'autre par ce document. Distinct du cas de `sllt_tts`, qui n'a jamais appartenu à Stabilisation et
ne pose donc aucune divergence.

---

## 8. Diagnostic vs Explication — matrice (architecture proposée, non validée par Vierge_7)

| Variable | Peut diagnostiquer Absorption (référentiel actuel) ? | Peut expliquer Absorption ? | Pourquoi | Preuve |
|---|---|---|---|---|
| `landing_uni_tts`/`landing_bi_tts` | ✅ | — | Diagnostique déjà gelé | 📄 |
| `sllt_*` (5 KPI) | ✅ | — | idem | 📄 |
| `cmj_ecc_mean_power`/`ecc_peak_vel` | ✅ | — | idem | 📄 |
| `cmj_braking_rfd`/`braking_impulse` | ✅ | — | idem, sous réserve de correspondance de nom (🔧) | 📄/🔧 |
| `cmj_braking_duration`, `cmj_depth`, etc. | ❌ | ✅ | Catégorie explicative/confirmative, jamais seuil | 📄 |
| Asymétries | ❌ | Modificateur, jamais diagnostique seule | Principe déjà gelé | 📄 |
| `dj_contact_time`/`peak_landing_force` | ❌ | ✅ (confirmative/explicative) | idem | 📄 |

**Hiérarchie "VARIABLE CORE / VARIABLE SECONDAIRE / ASYMÉTRIE / AUTRE TEST" proposée par
l'architecture cible** : 🔴 **NON VALIDÉE PAR VIERGE_7.** Le référentiel actuel distingue
diagnostique/confirmative/explicative — une terminologie et une hiérarchie **différentes** de celle
proposée (CORE/SECONDAIRE/ASYMÉTRIE/VALIDATION CROISÉE). Cette dernière n'est écrite nulle part dans
les sources ; elle recouvre partiellement la hiérarchie déjà gelée sans lui être identique. Présentée
ici comme une proposition, pas comme un fait déjà établi.

---

## 9. Score global — pondération différenciée

**Proposition** : *"Le score global ne doit pas être calculé à partir de toutes les variables avec
le même poids."*

**Vérification** : 🔴 **NOUVELLE RÈGLE À VALIDER — n'existe pas explicitement dans les sources HYP.**
`KINEXUS_REASONING_ENGINE_V1.md` ne définit aucune pondération différenciée entre variables
diagnostiques d'une même qualité — le seuil `CLI060` ("deux preuves diagnostiques déficitaires") ne
distingue pas les 10 KPI diagnostiques entre eux par un poids. **TFM**, à l'inverse, pratique déjà une
pondération par test (`index.html` ligne 750) — mais TFM est une architecture distincte de HYP, déjà
signalée comme non transposable telle quelle (`CARTOGRAPHIE_REACTIVITE_HYP_REA01.md` §2). Aucun poids
numérique n'est proposé ni suggéré ici, conformément à la consigne.

---

## 10. Règle de convergence — rappel de ce qui est gelé vs ouvert

**Gelé** (📄, non rouvert) : `CLI060`, "deux preuves diagnostiques déficitaires", parmi les 10 KPI de
§1 de `VARIABLES_DIAGNOSTIQUES_ABSORPTION.md`. Principe général ADR-003 : convergence évaluée à
l'échelle des mécanismes/tests indépendants, pas par comptage brut de KPI.

**Ouvert** (non résolu, non inventé ici) : l'énoncé précis de l'exception SLLT (comment compter ses 5
KPI issus d'un seul essai dans la règle des "2 preuves") — citation exacte déjà reprise trois fois
dans les documents précédents, non rédigée à ce jour, **pas rédigée non plus par ce document**.

---

## 11. Asymétries

**Vérification de compatibilité** : ✅ **Compatible avec le référentiel HYP actuel, sans
modification.** Le principe déjà gelé (`KINEXUS_REASONING_ENGINE_V1.md` §6 : *"une conclusion
d'asymétrie ne joue jamais de rôle diagnostique — uniquement confirmatif ou explicatif, en lecture
seule"*) s'applique sans exception aux variables d'asymétrie CMJ pertinentes pour Absorption
(`cmj_landing_peak_force_asym`, etc.). Aucun recalcul n'est proposé — le moteur continuerait
d'utiliser `computeAsymEngine` existant, non modifié par ce document.

---

## 12. Futur horizontal / multidirectionnel

**Absorption horizontale, Absorption multidirectionnelle** : 🔵 **FUTUR / HORS PÉRIMÈTRE ACTUEL.**
Aucune variable, aucun test, aucune mention dans les sources consultées ne couvre une dimension
horizontale ou multidirectionnelle de l'absorption — tous les tests actuels (SLLT, Landing, CMJ, DJ,
SLDJ) mesurent une absorption verticale (atterrissage après un saut). Aucune tentative d'intégration
au moteur actuel n'est faite ici.

---

## 13. Tableau final

| Élément | Architecture cible | Déjà supporté | Partiellement supporté | Nouvelle règle | Non disponible |
|---|---|---|---|---|---|
| Eccentric Deceleration RFD/BM | Freinage | — | ✅ (nom 🔗, rôle diagnostique déjà gelé) | — | — |
| Eccentric Deceleration Impulse/BM | Freinage | — | ✅ (idem) | — | — |
| Force at Zero Velocity | Freinage | — | — | ✅ | — |
| Eccentric Peak Power/BM | Capacité excentrique | — | — | — | ✅ |
| Eccentric Mean Power/BM | Capacité excentrique | ✅ | — | — | — |
| Eccentric Peak Velocity | Capacité excentrique | ✅ | — | — | — |
| "Excentrique = explicatif jamais diagnostique" | Principe | — | — | ✅ (contredit le rôle actuel) | — |
| Eccentric Deceleration Phase Duration | Stratégie | ✅ (explicative) | — | — | — |
| CMJ Depth | Stratégie | ✅ (confirmative) | — | — | — |
| CMJ Stiffness | Stratégie | — | — | — | ✅ |
| DJ RSI dans Absorption | Absorption réactive | — | — | — | Exclue explicitement (pas "non disponible" — activement écartée) |
| DJ Eccentric/Concentric Impulse | Absorption réactive | — | — | — | ✅ |
| Peak Landing Force (désambiguïsé) | Réception | ✅ (selon variable) | — | — | — |
| Peak Landing Force Asymmetry | Réception | — | — | — | ❓ (existe, rôle non déterminé) |
| TTS exclu d'Absorption | Stabilisation | — | — | ✅ (divergence à trancher) | — |
| Score pondéré différemment | Global | — | — | ✅ | — |
| Hiérarchie CORE/SECONDAIRE/ASYMÉTRIE/CROISÉE | Global | — | ✅ recouvrement partiel avec diagnostique/confirmative/explicative | ✅ pour la terminologie elle-même | — |
| Absorption horizontale/multidirectionnelle | Futur | — | — | — | 🔵 Futur, hors périmètre |

### A. Ce que nous pouvons figer maintenant sans inventer
Rien de nouveau — les seuls éléments "déjà supportés" (Eccentric Mean Power, Eccentric Peak Velocity,
Eccentric Deceleration Phase Duration, CMJ Depth, Peak Landing Force désambiguïsée) sont **déjà**
figés dans `HYP-ABS-01` tel qu'il existe. Aucune fixation supplémentaire n'est nécessaire pour ces
éléments — ils sont déjà actés.

### B. Ce qui nécessite une décision clinique
- Le rôle de "Force at Zero Velocity" (aucun rôle actuel — à intégrer ou non).
- L'inversion proposée "excentrique = explicatif jamais diagnostique" (contredit le rôle diagnostique
  actuel de `cmj_ecc_mean_power`/`cmj_ecc_peak_vel`).
- L'exclusion de TTS d'Absorption (divergence directe avec le référentiel actuel, double diagnostic
  Absorption/Stabilisation à trancher).
- L'adoption ou non de la hiérarchie CORE/SECONDAIRE/ASYMÉTRIE/VALIDATION CROISÉE comme
  reformulation ou remplacement de diagnostique/confirmative/explicative.
- La pondération différenciée du score global (aucune formalisée aujourd'hui).

### C. Ce qui nécessite de nouvelles données/tests
- "Eccentric Peak Power / BM", "CMJ Stiffness", "DJ Eccentric Impulse", "DJ Concentric Impulse" —
  aucune de ces variables n'existe dans le catalogue Kinexus actuel ; leur intégration nécessiterait
  soit un nouveau calcul (si les données brutes existent déjà côté capteur, non vérifié ici), soit un
  nouveau test.
- Les six variables `landing_uni_*`/`landing_bi_*` déjà identifiées comme demandées par Vierge_7 mais
  absentes du catalogue (`VARIABLES_DIAGNOSTIQUES_ABSORPTION.md` §1).

### D. Ce qui est purement futur
Absorption horizontale, Absorption multidirectionnelle — aucune trace dans les sources actuelles.

---

## 14. Conclusion praticien

**Ce que l'architecture Absorption veut réellement mesurer** — comparé à ce que le référentiel
actuel mesure réellement :

| Dimension proposée | Ce que le référentiel HYP actuel couvre aujourd'hui |
|---|---|
| **DIAGNOSTIC** — problème fonctionnel d'absorption | ✅ Couvert : `landing_*_tts`, 5 KPI SLLT, `cmj_ecc_mean_power`/`ecc_peak_vel`/`braking_rfd`/`braking_impulse` |
| **EXPLICATION** — capacité excentrique | ⚠️ **Partiellement en tension** : deux des variables les plus "excentriques" (`ecc_mean_power`, `ecc_peak_vel`) sont aujourd'hui **diagnostiques**, pas explicatives — l'architecture cible propose l'inverse, non tranché |
| **STRATÉGIE** — manière d'effectuer le freinage | ✅ Partiellement couvert (`cmj_braking_duration`, `cmj_depth`), sans catégorie "stratégie" formalisée séparément |
| **RÉCEPTION** — gestion de l'impact | ✅ Couvert, avec plusieurs variables homonymes à ne jamais confondre (§6) |
| **ASYMÉTRIE** — caractère symétrique ou non | ✅ Couvert en lecture seule via `computeAsymEngine`, jamais générateur |
| **STABILISATION** — récupération après perturbation, notamment TTS | ⚠️ **Point de divergence central** : TTS est aujourd'hui diagnostique d'Absorption **et** de Stabilisation ; l'architecture cible veut le réserver à Stabilisation seule — non tranché, nécessite une décision clinique explicite (§7) |

**Parties non encore supportées par les sources, signalées explicitement** : "Force at Zero
Velocity" comme variable clinique d'Absorption ; "Eccentric Peak Power/BM" et "CMJ Stiffness"
(inexistantes) ; "DJ Eccentric/Concentric Impulse" (inexistantes) ; toute pondération différenciée du
score global ; l'inversion diagnostique→explicative des variables excentriques ; l'exclusion de TTS
d'Absorption ; l'ensemble "Absorption horizontale/multidirectionnelle" (futur).

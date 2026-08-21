# Audit clinique final + implémentation — HYP-STA-01 (Stabilisation)

**Statut** : audit complet réalisé en premier, conclusion **GO**, implémenté et branché en
production dans `index.html`. `fSc['Stabilisation']` (sortie de `computeMoteur()`) est désormais
produit **intégralement** par le raisonnement clinique HYP-STA-01, y compris quand il ne peut rien
déterminer (`status:null` explicite — même principe que HYP-PUI-01/HYP-FOR-01/HYP-EXP-01).

Sources consultées et vérifiées directement dans `index.html` (`TBK`, `THRESHOLDS`, `NORMS`,
`TFM`) : `HYP_ARCHITECTURE_PHASE_C.md` (fiche HYP-STAB-01), `CARTOGRAPHIE_CLINIQUE_HYP_
STABILISATION.md`, `CARTOGRAPHIE_ROLE_CLINIQUE_HYP_STABILISATION.md`, `LOGIQUE_CLINIQUE_
VARIABLES_HYP.md` (section STABILISATION), `CARTOGRAPHIE_VARIABLES_HYP.md`,
`KINEXUS_REASONING_ENGINE_V1.md` (§6-7, gelé), `KINEXUS_CLINICAL_ARCHITECTURE.md`.

---

## PARTIE 1 — AUDIT CLINIQUE FINAL

### 1. Variables diagnostiques (vérifiées dans `TBK`/`THRESHOLDS`/`NORMS`)

| Variable | Test | Rôle clinique | Diagnostique ? | Norme disponible ? | Statut |
|---|---|---|---|---|---|
| `sls_ttf`, `sls_cop_path`, `sls_cop_vel`, `sls_ellipse_area`, `sls_cop_range_ml`, `sls_cop_range_ap`, `sls_mean_velocity` | Single Leg Stand (unilatéral, 7 KPI) | Contrôle postural unipodal | Oui (fiche + `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`, source explicite) | **Aucune** (ni `NORMS` ni `THRESHOLDS`) | Rôle conservé, **jamais classifiable aujourd'hui** |
| `eo_surface` | Eyes Open (bilatéral) | Surface de balancement, contrôle visuel statique | Oui (fiche) | **Aucune** | Rôle conservé, **jamais classifiable** |
| `ef_surface` | Eyes Closed (bilatéral) | Idem, yeux fermés | Oui (fiche) | **Aucune** | Rôle conservé, **jamais classifiable** |
| `strobo_surface` | Strobo (bilatéral) | Contrôle sous perturbation visuelle dynamique | Oui (fiche + `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`, source explicite) | **Aucune** | Rôle conservé, **jamais classifiable** |
| `landing_uni_tts` | Landing Unilatéral | Retour au contrôle après réception unipodale | Oui (fiche) | **`THRESHOLDS`** (vert 0.8/jaune 1.2/orange 1.8, dir min) | **Toujours classifiable, opérationnel** |
| `landing_bi_tts` | Land and Hold (bilatéral) | Idem, bipodal | Oui (fiche) | **`THRESHOLDS`** (vert 0.6/jaune 1.0/orange 1.5, dir min) | **Toujours classifiable, opérationnel** |

**Constat de méthode important** : sur 6 mécanismes diagnostiques documentés, **4 (SLS, EO, EF,
Strobo) n'ont aujourd'hui aucune norme**, malgré un rôle diagnostique central et explicitement
documenté dans 3 sources concordantes (`HYP_ARCHITECTURE_PHASE_C.md`, `LOGIQUE_CLINIQUE_
VARIABLES_HYP.md`, `KINEXUS_REASONING_ENGINE_V1.md`). Seuls `landing_uni_tts`/`landing_bi_tts`
sont réellement opérationnels. Conformément à la méthode gelée (rôle clinique ≠ disponibilité
normative), les 4 mécanismes bloqués **restent dans l'architecture**, jamais retirés, jamais
interprétés comme « normaux ».

**Divergence documentaire relevée** : `CARTOGRAPHIE_CLINIQUE_HYP_STABILISATION.md` (cartographie
secondaire d'une session antérieure) exclut `strobo_surface` du rôle diagnostique (le classe
confirmatif/explicatif seul). Cette lecture est minoritaire — `HYP_ARCHITECTURE_PHASE_C.md` (la
fiche elle-même), `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` et `KINEXUS_REASONING_ENGINE_V1.md` §7
(« SLS/EO/EF/Strobo/Landing selon la fiche ») convergent tous les trois pour retenir `strobo_
surface` comme diagnostique. Sources primaires retenues, divergence signalée, non arbitrée
silencieusement.

### 2. Règle de convergence

📄 **SOURCE EXPLICITE**, retenue et gelée à trois niveaux documentaires concordants :
- `LOGIQUE_CLINIQUE_VARIABLES_HYP.md` (Niveau 1 — Diagnostic) : *« Condition (SOURCE EXPLICITE) :
  au moins 2 preuves diagnostiques déficitaires. »*
- `KINEXUS_REASONING_ENGINE_V1.md` §7 (référence gelée) : `HYP-STAB-01` → **« ≥2/4 familles
  diagnostiques (SLS/EO/EF/Strobo/Landing selon la fiche) »**, support max atteignable **Forte**.
- `KINEXUS_REASONING_ENGINE_V1.md` §6 (« Stabilisation — état "Retenue sans orientation `CLI###`"
  toléré ») : **exemple concret et explicite** — *« Si `landing_uni_tts`/`landing_bi_tts` sont les
  seules variables déficitaires, `HYP-STAB-01` peut légitimement atteindre Retenue [...] Le moteur
  V1 tolère explicitement cet état. »*

**Point vérifié avant implémentation, potentiellement bloquant, résolu par la source elle-même** :
`CLI070` (l'orientation clinique concrète) ne cite littéralement que **SLS** comme déclencheur
diagnostique — EO/EF y sont confirmatives, Strobo/Landing n'y apparaissent pas du tout. Ceci
crée un écart réel entre le périmètre de la fiche de qualité (4-6 mécanismes) et celui de
l'orientation `CLI070` (SLS seul). **Cet écart est explicitement anticipé, documenté et jugé non
bloquant par la source gelée elle-même** (`KINEXUS_REASONING_ENGINE_V1.md` §6-7 : *« Prêt sous
réserve (incohérence Landing/`CLI070` documentée, **non bloquante**) »*) — ce n'est donc pas une
règle manquante à valider (🔴), mais une règle **déjà arbitrée**, avec un vide de couverture
« orientation clinique » assumé et toléré. Ce point a été vérifié en profondeur avant tout code,
conformément à l'instruction de la mission de ne rien implémenter sur une supposition.

**Convention appliquée pour la granularité du décompte** (documentée ici, non un nouveau seuil) :
le pool des preuves diagnostiques compte **6 mécanismes indépendants** — SLS, EO, EF, Strobo,
`landing_uni_tts`, `landing_bi_tts` — cohérent avec l'exemple concret du §6 (`landing_uni` +
`landing_bi`, comptés comme 2 preuves distinctes, suffisent à eux seuls à atteindre Retenue).

### 3. Landing / TTS — point critique

**GELÉ, vérifié dans le code** : `landing_uni_tts`/`landing_bi_tts` → Stabilisation, diagnostique
(rôle double avec confirmatif selon la fiche). Ils ne sont **plus** diagnostiques d'Absorption —
vérifié directement dans `computeHypAbsorption01` (sous-domaine E, `computeHypAbsorption01ReceptionImpact`
retourne `{available:false,reason:'aucun_seuil_disponible'}` sans jamais lire `landing_uni`/
`landing_bi`) : **le gel est déjà respecté par le code existant**, avant même ce mission — vérifié
par test dédié (cas 7).

### 4. SLLT

`sllt_tts` et les autres KPI SLLT (`sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`,
`sllt_cop_path`) sont **absents de toute section Stabilisation**, sous quelque nom que ce soit,
dans les trois sources consultées (fiche, `LOGIQUE_CLINIQUE_VARIABLES_HYP.md`, `CLI070`/`CLI071`).
La décision `landing_uni_tts`/`landing_bi_tts` → Stabilisation **ne s'étend pas** à SLLT — SLLT
reste hors Stabilisation (déjà gelé pour Absorption ailleurs). Aucune ambiguïté ici : GELÉ / exclu.
Vérifié par test (SLLT fourni n'a aucun effet sur `HYP-STA-01`).

### 5. Y Balance Test

`ybt_composite` a un poids TFM pour Stabilisation (`TFM.ybt.stabilisation = 2`, vérifié directement
dans le code) **mais n'apparaît dans aucune des sources cliniques HYP consultées** pour
Stabilisation (absent de la fiche `HYP_ARCHITECTURE_PHASE_C.md`, absent de `LOGIQUE_CLINIQUE_
VARIABLES_HYP.md`, absent de `CLI070`/`CLI071`). C'est le **cas C** explicitement prévu par la
mission : *aucune décision source → NON DÉTERMINABLE / À VALIDER*. Le poids TFM n'est **jamais**
utilisé comme preuve clinique — `ybt_composite` n'est **jamais lu** par `computeHypStabilization01`
(vérifié par test : données YBT fournies, aucun effet, jamais dans la sortie du moteur).
**🔶 À VALIDER avec le praticien** si un rôle doit lui être attribué à l'avenir — non tranché ici.

### 6. SLS / EO / EF / Strobo — cartographie KPI (vérifiée dans `TBK`)

| Test | KPI (vérifiés `TBK`) | Rôle | Norme | Seuil | Classifiable aujourd'hui |
|---|---|---|---|---|---|
| `sls` (unilatéral, D/G) | `ttf`, `cop_path`, `cop_vel`, `ellipse_area`, `cop_range_ml`, `cop_range_ap`, `mean_velocity` | Diagnostique + confirmatif + explicatif (rôle triple documenté) | Aucune | Aucun | Non |
| `eo` (bilatéral) | `surface` | Diagnostique (fiche) | Aucune | Aucun | Non |
| `ef` (bilatéral) | `surface` | Diagnostique (fiche) | Aucune | Aucun | Non |
| `strobo` (bilatéral) | `surface` | Diagnostique + confirmatif + explicatif | Aucune | Aucun | Non |

L'absence de norme **ne retire aucun de ces KPI de l'architecture** — ils restent structurellement
lus par le moteur (`computeHypStabilizationSls`, `computeHypStabilizationKpi`), retournent
honnêtement `status:'indisponible'`, jamais `'normal'`.

### 7. Normes — séparation rôle clinique / faisabilité normative

Appliquée systématiquement : chaque variable diagnostique/explicative garde son rôle documenté
dans le code (présente dans `diagnosticEvidence`/`explanatoryEvidence`), indépendamment de la
disponibilité d'un seuil. Aucune absence de norme n'est jamais transformée en `'normal'` — vérifié
par test dédié (cas 5).

### 8. Asymétries

Aucun mécanisme d'asymétrie **inter-test** propre à Stabilisation n'est documenté au-delà du LSI
intrinsèque déjà exposé par le lecteur générique (`rawD`/`rawG`/`lsi`) pour les tests unilatéraux
(SLS, `landing_uni`, WBLT). Une asymétrie D/G ne génère jamais seule un déficit — le statut dépend
uniquement du dépassement de seuil, jamais de l'écart D/G lui-même (vérifié par test : asymétrie
forte mais sous le seuil des deux côtés → `normal`).

---

## PARTIE 2 — ARCHITECTURE CLINIQUE

| Catégorie | Contenu | Statut |
|---|---|---|
| **A. DIAGNOSTIC** | SLS, EO, EF, Strobo, `landing_uni_tts`, `landing_bi_tts` (6 mécanismes, ≥2 déficitaires requis) | Implémenté, 2/6 opérationnels |
| **B. CONFIRMATION** | Mêmes variables (rôle double, fiche) — auto-référentielles (ADR-008), jamais génératrices seules ; convention appliquée : une 3ᵉ preuve du même pool, au-delà du minimum de 2, compte comme convergence confirmative | Implémenté, structurellement inerte aujourd'hui (jamais 3 preuves classifiables simultanément) |
| **C. EXPLICATION** | RFD hanche/cheville (`hip_abd`/`hip_ext`/`hip_add`/`inv_iso`/`ev_iso`/`df_iso`, aucun seuil, valeur brute) + `wblt_distance` (opérationnel) | Implémenté |
| **D. PRÉCISION** | LSI intrinsèque des tests unilatéraux (SLS, `landing_uni`, WBLT) — précision uniquement, jamais générateur | Implémenté |
| **E. VALIDATION CROISÉE** | Aucune documentée au-delà des variables déjà listées ; `HYP-CSM-01` reste suspendue (hors périmètre, non traitée) | Non implémenté (rien à implémenter — pas de source) |

---

## PARTIE 3 — RELATION AVEC ABSORPTION

Étanchéité vérifiée : `computeHypAbsorption01` ne lit **jamais** `landing_uni_tts`/`landing_bi_tts`
(confirmé par lecture du code et par test dédié). `landing_bi_peak_landing_force` reste exclu de
Stabilisation (gel, non concerné par ce moteur). Aucune modification apportée à `computeHypAbsorption01`.

**Fait pré-existant, non introduit par cette mission, documenté par transparence** : le repli TFM
générique (utilisé par `fSc['Absorption']` quand `HYP-ABS-01` niveau 1 est `non_determinable`)
pondère toujours `landing_uni`/`landing_bi` dans `absorption` (`TFM.landing_uni.absorption = 3`,
`TFM.landing_bi.absorption = 3`, poids pré-existant, jamais modifié par aucune mission HYP à ce
jour). Ce fait, déjà documenté pour d'autres qualités (contamination TFM inter-qualités), n'est
**pas** dans le périmètre de cette mission (qui porte sur `HYP-STA-01`, pas sur une refonte de la
table `TFM`) et n'affecte jamais le moteur clinique `HYP-ABS-01` lui-même (vérifié : `hypAbs01`
identique, seul le repli générique `fSc['Absorption'].status` peut varier — signalé, non corrigé).

---

## PARTIE 4 — RELATION AVEC RÉACTIVITÉ

Vérifié : `dj_rsi`, `sldj_rsi`, `cmjr_*`, `single_hop_distance`, `triple_hop_distance`,
`crossover_hop_distance`, `repeated_hop_mean_rsi` sont **exclus** de la liste « Variables exclues »
de la fiche HYP-STAB-01 (`HYP_ARCHITECTURE_PHASE_C.md`). Aucun de ces noms n'apparaît dans
`computeHypStabilization01` ni ses helpers — aucune réintroduction par analogie.

---

## PARTIE 5 — DÉCISION AVANT CODE

| Élément | Décision possible | Statut |
|---|---|---|
| Preuves diagnostiques | 6 mécanismes indépendants (SLS, EO, EF, Strobo, `landing_uni_tts`, `landing_bi_tts`) — fiche de qualité, corroborée par 3 sources concordantes | SOURCE |
| Règle de convergence | ≥2 preuves diagnostiques déficitaires (parmi les classifiables) — SOURCE EXPLICITE (`LOGIQUE_CLINIQUE_VARIABLES_HYP.md`) + gelée avec exemple concret (`KINEXUS_REASONING_ENGINE_V1.md` §6) | SOURCE / GELÉ |
| Écart `CLI070` (SLS seul) vs fiche (6 mécanismes) | Écart réel, mais explicitement jugé non bloquant par la source gelée elle-même | SOURCE (tolérance documentée) |
| TTS Landing | Stabilisation, jamais Absorption — déjà respecté dans le code existant | SOURCE / GELÉ |
| SLLT | Exclu de Stabilisation (gel + réexamen corroborant) | SOURCE / GELÉ |
| YBT | Aucune source clinique ne l'associe à Stabilisation — seul le poids TFM le fait, jamais utilisé comme preuve | SOURCE / À VALIDER (cas C, aucun rôle attribué) |
| SLS/EO/EF/Strobo | Rôle diagnostique documenté, 0 norme → jamais classifiables aujourd'hui, jamais supprimés | SOURCE (rôle) / bloqué (norme) |
| Asymétries | Aucun mécanisme propre au-delà du LSI intrinsèque déjà exposé — jamais générateur seul | SOURCE |

### GO IMPLÉMENTATION

Justification : la règle de convergence — l'unique point qui aurait pu justifier un NO-GO — est
**source-confirmée et gelée** à trois niveaux documentaires concordants, avec un exemple concret
qui correspond exactement au seul cas aujourd'hui atteignable (`landing_uni_tts` +
`landing_bi_tts` tous deux déficitaires). L'écart `CLI070`/fiche est réel mais **déjà arbitré comme
non bloquant** par la source gelée. Aucune règle fondamentale manquante n'a nécessité d'invention.

---

## PARTIE 6 — IMPLÉMENTATION

`computeHypStabilization01(testData, normPop, normAge)` — fonction pure, isolée, testable, sans
duplication de seuils, suit les conventions déjà établies (`computeHypForce01`, `computeHypPower01`,
`computeHypExplosivity01`, `computeHypReactivity01`, `computeHypAbsorption01`).

**Architecture** : `computeHypStabilizationKpi` (lecteur générique bilatéral/unilatéral D/G, pire
côté — réécriture locale de la même convention que `computeHypForceKpi`/`computeHypMobilityWblt`,
pour rester un moteur isolé, sans appel cross-qualité) ; `computeHypStabilizationSls` (réduction
« pire résultat » des 7 KPI SLS en 1 statut de famille) ; `computeHypStabilizationDiagnostic` (les
6 mécanismes) ; `computeHypStabilizationExplanatory` (RFD + WBLT) ; `computeHypStabilization01`
(point d'entrée, état + support).

**Intégration** : après le bloc HYP-EXP-01 (inchangé) et avant `var sysSc={};`, un bloc dédié
réécrit **intégralement** `fSc['Stabilisation']` — `status:null` explicite quand
`non_determinable`, sinon dérivé de l'état (`absente`→vert, `suspectee`→jaune, `retenue_*`→orange,
ou rouge si toutes les preuves déficitaires sont catégorisées `'rouge'`). `hypSta01` (objet
complet) toujours attaché pour traçabilité. Aucune autre qualité, aucun autre output de
`computeMoteur` n'est touché.

---

## PARTIE 7 — DIAGNOSTIC ET DONNÉES MANQUANTES

Appliqué systématiquement : 0 preuve classifiable → `non_determinable` (jamais `'normal'`).
Variable non testée → jamais comptée comme preuve normale (`status:'indisponible'`, filtrée du
pool `classifiable`). 1 seule preuve déficitaire sur les preuves classifiables → `suspectee`,
jamais `retenue` de force.

---

## PARTIE 8 — SOUS-DOMAINES

Aucun sous-domaine supplémentaire inventé. Les catégories A-E de la Partie 2 sont les seules
documentées par les sources. `hypSta01` est entièrement exposé dans `functionScores['Stabilisation']`
mais **non affiché dans l'UI/le rapport PDF à ce jour** — même situation que les 5 autres qualités
HYP déjà implémentées (l'affichage détaillé du raisonnement HYP reste un chantier de présentation
distinct, hors périmètre de cette mission qui ne modifie pas l'UI).

---

## PARTIE 9 — TESTS

`tests/hypStabilization01.test.js` — **16 tests, tous passants**, couvrant les 14 cas mandatés
(toutes preuves normales, une seule déficitaire, plusieurs déficitaires — cas concret §6 réel
sans injection de norme —, données insuffisantes, variable diagnostique sans norme jamais
« normale », TTS Landing utilisé comme Stabilisation, TTS Landing absent du diagnostic Absorption,
SLLT jamais lu, YBT jamais lu, asymétrie seule insuffisante, non-régression Force/Réactivité/
Absorption, données Stabilisation isolées) + support gradué jamais forcé + structure de sortie +
pureté.

---

## PARTIE 10 — NON-RÉGRESSION

Les 21 fichiers de tests réexécutés intégralement (`hypStabilization01` inclus) — **tous
passants, aucune modification requise dans un autre fichier de test**. Vérification syntaxique
complète du contenu `<script>` d'`index.html` (`node --check`) — **OK**. `git diff --stat` confirmé
purement additif (+178/-0 dans `index.html`). Aucune régression sur Force, Puissance, Réactivité,
Mobilité, Absorption ; Stabilisation, Endurance restées intactes (aucune norme, aucune variable de
Stabilisation modifiée les concernant).

---

## PARTIE 11 — RAPPORT

### CE QUI EST CLINIQUEMENT ACTÉ

- 6 mécanismes diagnostiques indépendants : SLS, EO, EF, Strobo, `landing_uni_tts`,
  `landing_bi_tts`.
- Règle de convergence : ≥2 preuves diagnostiques déficitaires (SOURCE EXPLICITE + gelée,
  exemple concret validé pour le cas Landing isolé).
- `landing_uni_tts`/`landing_bi_tts` → Stabilisation, jamais Absorption.
- SLLT → exclu de Stabilisation.
- Variables explicatives (RFD hanche/cheville, `wblt_distance`) conservées quel que soit leur état
  normatif.

### CE QUI EST ACTUELLEMENT AUTOMATISABLE

- `landing_uni_tts`, `landing_bi_tts` (2 des 6 mécanismes) — toujours classifiables.
- `wblt_distance` (explicative) — toujours classifiable.
- L'état `retenue_faible` (support `faible`) est **réellement atteignable aujourd'hui** avec des
  données réelles, sans aucune injection de norme — cas Landing isolé, vérifié par test sans repli
  sur un mécanisme de test spécial.

### CE QUI EST BLOQUÉ PAR LES NORMES

- SLS (7 KPI), `eo_surface`, `ef_surface`, `strobo_surface` — aucune norme (ni `NORMS` ni
  `THRESHOLDS`) — 4 des 6 mécanismes diagnostiques jamais classifiables aujourd'hui.
- Toute la famille RFD hanche/cheville (explicative) — aucune norme, exposée en valeur brute
  uniquement.
- Conséquence : le support ne peut aujourd'hui jamais dépasser `faible` en pratique (confirmative
  et explicative nécessitent une 3ᵉ preuve classifiable, jamais atteignable tant que SLS/EO/EF/
  Strobo restent sans seuil).

### CE QUI RESTE À VALIDER CLINIQUEMENT

- 🔶 **YBT (`ybt_composite`)** : aucun rôle documenté pour Stabilisation dans les sources cliniques
  HYP consultées, malgré un poids TFM. Aucun rôle attribué ici — à valider avec le praticien si un
  rôle doit lui être créé.
- Divergence documentaire mineure : `CARTOGRAPHIE_CLINIQUE_HYP_STABILISATION.md` (session
  antérieure) exclut `strobo_surface` du rôle diagnostique ; les 3 autres sources (dont la fiche
  elle-même et le document gelé `KINEXUS_REASONING_ENGINE_V1.md`) l'incluent. Sources primaires
  retenues ici — signalé pour le praticien, non re-arbitré silencieusement.
- Convention appliquée (non un nouveau seuil) pour la réduction des 7 KPI SLS en 1 statut de
  famille (« pire résultat ») — cohérente avec les conventions déjà établies (Force/Mobilité),
  mais non formulée mot pour mot dans la fiche pour ce cas précis. Sans effet observable
  aujourd'hui (SLS reste non classifiable).

### CE QUI A ÉTÉ IMPLÉMENTÉ

- `computeHypStabilizationKpi`, `computeHypStabilizationSls`, `computeHypStabilizationDiagnostic`,
  `computeHypStabilizationExplanatory`, `computeHypStabilization01` dans `index.html`.
- Bloc d'intégration dans `computeMoteur()` remplaçant intégralement `fSc['Stabilisation']`.
- `tests/hypStabilization01.test.js` (16 tests).
- Ce document.
- `index.html` : **+178 lignes, 0 suppression** (`git diff --stat`).

### CE QUI N'A PAS ÉTÉ MODIFIÉ

- Aucune autre qualité (Force, Puissance, Réactivité, Mobilité, Absorption, Explosivité, Endurance)
  — vérifié par tests dédiés et par relecture du bloc d'intégration.
- Aucun seuil `THRESHOLDS`/`NORMS` créé ou modifié.
- Aucune table `TFM` modifiée (y compris le poids `ybt.stabilisation` non retiré, non utilisé).
- `computeHypAbsorption01` — inchangé, non touché.
- Aucune modification de l'UI/du rapport PDF.
- Règle de convergence — non modifiée, appliquée telle que documentée et gelée.

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+178/-0 lignes).
- **Fichiers créés** : `tests/hypStabilization01.test.js`, `AUDIT_IMPLEMENTATION_HYP_STA01.md`.
- **Tests ajoutés** : 16, tous passants.
- **Tests existants passés** : tous (20 fichiers préexistants, aucune régression, aucune
  modification requise).
- **Autres qualités modifiées** : NON.
- **Règle de convergence modifiée** : NON.
- **Seuil inventé** : NON.
- **YBT utilisé comme preuve clinique** : NON.
- **SLLT réintroduit dans Stabilisation** : NON.
- **`landing_uni_tts`/`landing_bi_tts` réintroduits dans Absorption** : NON.
- **HYP-STA-01 réellement actif** : OUI — `retenue_faible` (support `faible`) atteignable
  aujourd'hui avec des données réelles (cas Landing isolé, sans injection de norme) ; `suspectee`
  atteignable avec 1 seule preuve Landing déficitaire ; honnête (`non_determinable`) partout où
  SLS/EO/EF/Strobo seraient nécessaires.

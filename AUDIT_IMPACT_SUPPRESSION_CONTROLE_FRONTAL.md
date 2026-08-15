# Audit d'impact — Conséquences de la décision « Contrôle Frontal n'est pas une qualité HYP### autonome »

## Statut

Audit factuel uniquement, en suite directe d'`AUDIT_CONTROLE_FRONTAL.md`. Aucun code, aucun
changement d'architecture, aucune nouvelle qualité, aucun arbitrage clinique, aucune correction
silencieuse. Toutes les affirmations sont reliées à une lecture directe de
`/home/user/-kinexus/index.html` et de `HYP_ARCHITECTURE_PHASE_C.md` (les 8 fiches HYP### actives).
Ce document décrit un impact **hypothétique** — celui d'une bascule complète vers HYP### telle que
décrite dans `PHASE_G_IMPLEMENTATION_PLAN.md` (Stade 3) — sans qu'aucune bascule ne soit engagée ni
recommandée ici. TFM reste aujourd'hui le moteur actif en production, inchangé.

---

# 1. Inventaire des utilisations actuelles de « Contrôle Frontal »

| Emplacement | Rôle actuel | Données utilisées | Visibilité praticien | Dépendance réelle |
|---|---|---|---|---|
| **`FUNCTIONS`** (`:742`) | Déclare 'Contrôle Frontal' comme 8ᵉ des 10 qualités calculées | Aucune (liste statique) | Indirecte (nomme la qualité affichée partout ailleurs) | Toute la chaîne ci-dessous en dépend pour exister |
| **`TFM`** (`:750`) | Pondère la contribution de 16 tests à `controle_frontal` | Poids statiques 1-3 par test | Indirecte (visible via le détail des tests reliés, onglet `'fonctions'`) | `computeMoteur()` (`effectiveTFMWeight`, `:4191-4192`) |
| **`QualityConfigView`** (`:5500`) | Permet au praticien de désactiver/réactiver individuellement chaque test contribuant à Contrôle Frontal (`qualityVarState`) | `qualityProfilesState` (persisté `localStorage`) | **Directe** — écran de configuration dédié, 'Contrôle Frontal' est l'une des 10 cartes affichées | `effectiveTFMWeight()`, donc tout le calcul de `functionScores['Contrôle Frontal']` |
| **Dashboard** (`:5537`) | Aucun | Aucune donnée de scoring lue | **Nulle** | Aucune |
| **Rapport PDF — `buildExpertReport`** (`:5156`) | Ligne de tableau complète (`FUNCTIONS.forEach`, `:5156`), au même titre que les 9 autres qualités | `fSc['Contrôle Frontal']` (statut, couverture, confiance) | **Directe** — visible dans le rapport expert imprimé | `res.functionScores` |
| **Rapport PDF — `buildSportifReport`** (RTP) | Item de checklist RTP **nommément dédié** (`:4618-4621`, aux côtés de Mobilité et Absorption) — seule qualité, avec ces deux autres, à recevoir ce traitement explicite | `fSc['Contrôle Frontal'].status` | **Directe** — item "Contrôle Frontal (norme)" visible dans le rapport sportif imprimé | `res.functionScores` |
| **Historique** (`:6645`) | Ligne de comparaison entre deux bilans, comme les 9 autres qualités | `r1.functionScores['Contrôle Frontal']` / `r2....` | **Directe** — visible dans le tableau de comparaison | `computeMoteur()` ×2 |
| **RTP** | Voir "Rapport PDF — `buildSportifReport`" ci-dessus — seul point d'intégration RTP identifié | `fSc['Contrôle Frontal'].status` | Directe (dans le rapport) | Idem |
| **Priorisation (fonction)** (`computeMoteur`, `:4213`) | Éligible au top-3 des priorités si statut rouge/orange, comme les 9 autres | `fSc['Contrôle Frontal']` | **Directe** — apparaît dans `pri`, donc dans `ExpertView` (onglets `'hypotheses'`/`'orientations'`), les rapports PDF, et l'écran `AnalyseView` | `computeMoteur()` |
| **Priorisation clinique (Mouvement)** | **Aucun** — confirmé en `AUDIT_TFM_VS_HYP_QUALITES.md` §3 : absent de `CMJ_PHASE_TO_QUALITY` | — | Nulle | — |
| **ExpertView — onglet `'fonctions'`** (`:6557`) | Carte dédiée avec statut, couverture, confiance, liste des tests reliés | `fSc['Contrôle Frontal']`, `TFM` | **Directe** | `res.functionScores` |
| **ExpertView — onglet `'couverture'`** (`:6587`) | Barre de couverture (%) dédiée | `fSc['Contrôle Frontal'].coverage` | **Directe** | Idem |
| **`FN_ICON`/`FN_KEY`** (`:6434`, `:744`) | Icône (`🛡️`) et clé technique dédiées | — | Indirecte (affichage) | Toutes les lignes ci-dessus |
| **Fil de Raisonnement / raisonnement clinique (Mouvement)** | **Aucun** — confirmé, cohérent avec l'absence dans `CMJ_PHASE_TO_QUALITY` | — | Nulle | — |

---

# 2. Impact d'une bascule complète vers HYP### (hypothétique, Stade 3)

## Ce que le praticien perdrait
- **Un statut agrégé unique répondant spécifiquement à la question "le contrôle frontal du membre
  inférieur est-il adéquat ?"** — cette question, aujourd'hui posée par un seul chiffre
  (`fSc['Contrôle Frontal'].status`, vert/jaune/orange/rouge), n'a d'équivalent dans aucune des 8
  fiches HYP### actives (`AUDIT_CONTROLE_FRONTAL.md` §4) : aucune ne pose cette question comme
  telle.
- **L'item de checklist RTP "Contrôle Frontal (norme)"** (`buildSportifReport`, `:4618`) perdrait sa
  source de donnée.
- **La ligne de comparaison "Contrôle Frontal" dans l'Historique** perdrait sa source.
- **La carte "Contrôle Frontal" dans `ExpertView`** (onglets `'fonctions'`/`'couverture'`) et son
  éligibilité à la priorisation (fonction) disparaîtraient en tant que telles.
- **La possibilité, pour le praticien, de désactiver spécifiquement un test au titre de sa
  contribution à "Contrôle Frontal"** via `QualityConfigView` — cet écran de configuration perdrait
  cette entrée.

## Ce qui resterait disponible ailleurs
- **Les données brutes de chacun des 16 tests** (`hip_abd`, `hip_add`, `landing_uni`, `ybt`,
  `side_hop`, `df_iso`, `inv_iso`, `ev_iso`, `hip_rot_int`, `hip_rot_ext`, `sllt`, `crossover_hop`,
  `hip_flex`, `hip_ext`, `sldj`, `ef`, `strobo`) resteraient intégralement saisies, stockées et
  consultables via `TestEntry`, l'onglet `'kpi'`/`ResultsBrowser` d'`ExpertView`, et les tests
  individuels du rapport (`computeTestStatus` par test, indépendant de toute qualité agrégée).
- **9 des 16 tests** réapparaîtraient, sous forme de preuve (diagnostique, confirmative ou
  explicative), dans une ou plusieurs fiches HYP### actives — pour une **autre question clinique**
  que celle posée aujourd'hui par Contrôle Frontal (détail §3-§4).

## Ce qui deviendrait invisible
- **La synthèse elle-même** ("contrôle frontal : rouge/jaune/vert") — même si les 9 tests
  réutilisés continuent d'exister ailleurs, ils n'y répondent jamais à la même question ; la
  synthèse frontale telle qu'elle existe aujourd'hui ne serait reconstituable par aucune
  combinaison des sorties HYP###.
- **4 des 16 tests** (`ybt`, `side_hop`, `hip_rot_int`, `hip_rot_ext`) perdraient toute destination
  Niveau 1 — leurs données resteraient saisissables et consultables au niveau test brut, mais
  cesseraient d'alimenter quelque synthèse de qualité que ce soit, HYP### ou TFM.

## Ce qui serait implicitement couvert par Stabilisation
9 des 16 tests apparaissent, sous une forme ou une autre, dans `HYP-STAB-01` : `hip_abd`, `hip_add`,
`landing_uni`, `df_iso`, `inv_iso`, `ev_iso`, `hip_ext`, `ef`, `strobo` (détail exact des rôles —
diagnostique/confirmative/explicative — en §3). **Cette couverture est indirecte** : ces tests
servent la question clinique de Stabilisation ("maintenir le contrôle postural après une
contrainte"), pas une question de contrôle frontal en tant que telle — voir la distinction A/B/C/D
en §4.

---

# 3. Cartographie Variable/Test → Contrôle Frontal → Destination HYP###

| Test (poids `controle_frontal`) | Destination HYP### actuelle | Rôle | Destination future potentielle (Vierge_7) | Aucune destination connue |
|---|---|---|---|---|
| `hip_abd` (3) | `HYP-FOR-01` (explicative + `CLI205` segmental) · `HYP-STAB-01` (explicative physio) · `HYP-ABS-01` (explicative physio) | Explicative dans les 3 cas, jamais diagnostique d'un contrôle frontal | — | — |
| `hip_add` (3) | `HYP-FOR-01` (explicative + `CLI206`) · `HYP-STAB-01` (explicative) · `HYP-ABS-01` (explicative) | Idem | — | — |
| `landing_uni` (3) | `HYP-STAB-01` (**diagnostique**, `landing_uni_tts`) | Diagnostique — mais pour "contrôle postural", pas "contrôle frontal" ; rappel : ce diagnostic souffre déjà d'un écart connu et documenté (`PHASE_D_LOGICAL_VALIDATION.md` — absent de `CLI070`/`CLI071`) | — | — |
| `ybt` (3) | **Aucune** | — | `CIB172` ("Réduire la perte de contrôle dans les plans frontal et transverse"), Niveau 3, section "Pivot/Rotation" — hors périmètre HYP### (`AUDIT_CONTROLE_FRONTAL.md` §3.1) | ✅ |
| `side_hop` (3) | **Aucune** | — | Non identifiée dans le périmètre Vierge_7 recherché | ✅ |
| `df_iso` (2) | `HYP-FOR-01` (explicative + `CLI208`) · `HYP-STAB-01` (explicative) | Explicative uniquement | — | — |
| `inv_iso` (2) | `HYP-FOR-01` (explicative + `CLI209`) · `HYP-STAB-01` (explicative) | Explicative uniquement | — | — |
| `ev_iso` (2) | `HYP-FOR-01` (explicative + `CLI210`) · `HYP-STAB-01` (explicative) | Explicative uniquement | — | — |
| `hip_rot_int` (2) | **Aucune** | — | Non identifiée — absent des 12 segments `CLI200`-`211` de Force, absent de la liste explicative de Stabilisation | ✅ |
| `hip_rot_ext` (2) | **Aucune** | — | Idem | ✅ |
| `sllt` (2) | `HYP-ABS-01` (**diagnostique**, 5 KPIs) | Diagnostique — pour "encaisser la charge", explicitement **exclu** de Stabilisation (gel, point 2) | — | — |
| `crossover_hop` (2) | `HYP-REA-01` (confirmative, `crossover_hop_distance`) | Confirmative — pour "restitution rapide de force", pas contrôle frontal | — | — |
| `hip_flex` (1) | `HYP-FOR-01` (explicative + `CLI207`) · `HYP-ABS-01` (explicative) | Explicative uniquement | — | — |
| `hip_ext` (1) | `HYP-FOR-01` (explicative + `CLI204`) · `HYP-ABS-01` (explicative) · `HYP-STAB-01` (explicative) | Explicative uniquement | — | — |
| `sldj` (1) | `HYP-REA-01` (**diagnostique**, `sldj_rsi`) · `HYP-ABS-01` (confirmative) | Diagnostique — pour "réactivité", pas contrôle frontal | — | — |
| `ef` (1) | `HYP-STAB-01` (diagnostique selon la fiche / confirmative selon `CLI070` — ambiguïté déjà documentée en Phase C) | Idem — pour "contrôle postural" | `CLI090` (Contrôle Sensori-moteur, **suspendue**) citerait aussi EO/EC selon la fiche | — |
| `strobo` (1) | `HYP-STAB-01` (même ambiguïté que `ef`) | Idem | `CLI090` (suspendue) | — |

---

# 4. Classement A/B/C/D par test

**Aucun des 16 tests n'atteint le statut "A — déjà couvert par HYP###"** au sens strict de la
question clinique posée par Contrôle Frontal. Dans les 12 cas où le test réapparaît dans une fiche
HYP### active, il y répond systématiquement à une **autre** question clinique (Force, Stabilisation,
Absorption, Réactivité) — jamais à "le contrôle frontal du membre inférieur est-il adéquat ?". Ce
classement retient donc **B** pour ces cas (couverture partielle du test, aucune couverture de la
construction clinique d'origine), réservant **A** au seul cas où une équivalence de question
clinique aurait été trouvée — cas qui ne s'est présenté pour aucun des 16 tests.

| Test | Classement | Justification |
|---|---|---|
| `hip_abd`, `hip_add` | **B** | Réutilisés (explicative, 3 fiches chacun), jamais pour la question frontale |
| `landing_uni` | **B** | Diagnostique de Stabilisation, question différente |
| `df_iso`, `inv_iso`, `ev_iso` | **B** | Réutilisés (explicative, 2 fiches chacun), jamais pour la question frontale |
| `hip_flex`, `hip_ext` | **B** | Réutilisés (explicative), jamais pour la question frontale |
| `sllt` | **B** | Diagnostique fort d'Absorption, mais explicitement exclu de Stabilisation, question différente |
| `crossover_hop` | **B** | Confirmative de Réactivité, question différente |
| `sldj` | **B** | Diagnostique de Réactivité + confirmative d'Absorption, question différente |
| `ef`, `strobo` | **B** | Diagnostique/confirmative ambigu de Stabilisation (écart déjà documenté), question différente |
| `ybt` | **C**, sous réserve méthodologique (§ ci-dessous) | Aucune occurrence positive trouvée dans le périmètre Vierge_7 recherché |
| `side_hop` | **C**, sous réserve méthodologique | Idem |
| `hip_rot_int`, `hip_rot_ext` | **C**, sous réserve méthodologique | Absents de toutes les 8 fiches actives, y compris de la décomposition segmentaire de Force qui couvre pourtant 12 groupes musculaires |

**Réserve méthodologique** : la recherche directe dans Vierge_7 reste incomplète (3 des 5 parties
du document PDF disponibles en texte recherchable, `AUDIT_CONTROLE_FRONTAL.md` §3.1). Le classement
**C** ci-dessus s'appuie sur la convergence de deux sources indépendantes (recherche directe dans le
texte disponible, et absence de toute mention dans les 8 fiches déjà construites en Phase C à partir
d'une lecture plus large de Vierge_7) — une convergence forte, mais qui ne permet pas d'exclure
formellement une mention dans les parties du document non recherchées. Aucun test n'est classé **D**
isolément : cette réserve s'applique de façon transversale aux classements **C**, sans qu'elle ne
suffise à les invalider au vu de la convergence observée.

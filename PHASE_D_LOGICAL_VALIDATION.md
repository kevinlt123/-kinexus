# Phase D — Validation logique du moteur HYP###

## Statut de ce document

Validation de la **cohérence logique** des 8 fiches HYP### construites en Phase C
(`HYP_ARCHITECTURE_PHASE_C.md`), au moyen de cas cliniques théoriques. **Aucun code, aucune
donnée réelle, aucune implémentation.** L'objectif est exclusivement de tester le raisonnement tel
que spécifié — pas de le corriger. Chaque cas est résolu par déduction pure à partir de ce qui est
déjà écrit dans les fiches Phase C et dans Vierge_7 (fiches de qualité + `CLI###`), jamais par
une règle nouvelle.

*Note de nommage* : le praticien a utilisé "HYP-POW-01" dans la demande ; la fiche construite en
Phase C porte l'identifiant `HYP-PUI-01` (Puissance). Les deux désignent la même hypothèse — repris
ici sous `HYP-PUI-01` par cohérence avec `HYP_ARCHITECTURE_PHASE_C.md`, écart de nommage signalé
sans y voir de conflit de fond.

---

## Constat transversal préalable (s'applique à 6 des 8 qualités, référencé plutôt que redémontré)

**Aucune des conditions d'activation `CLI###` ne définit d'état intermédiaire entre "hypothèse non
activée" et "hypothèse activée".** Chaque condition est un seuil binaire ("deux preuves
diagnostiques déficitaires", "au moins deux variables RFD déficitaires", etc.). Cela entre en
tension directe avec le principe fondateur déjà validé au tout début de ce chantier : *"une
variable isolée ne valide jamais seule — elle peut générer, renforcer, affaiblir ou réfuter"*. Le
verbe "générer" suppose qu'une seule preuve diagnostique déficitaire puisse au moins **proposer**
une hypothèse à un niveau de confiance faible — mais aucune fiche Phase C, ni aucun `CLI###`, ne
précise ce que devient le raisonnement en-dessous du seuil de validation. Ce n'est pas une
incohérence à corriger ici, mais un **vide de spécification** qui touche Force, Puissance,
Réactivité, Explosivité, Absorption et Endurance (pas Stabilisation ni Mobilité, dont les
conditions ont une structure différente, voir leurs fiches respectives). Référencé comme
**Constat C0** dans les fiches suivantes plutôt que redémontré à chaque fois.

---

## HYP-FOR-01 — Force

### Cas A — Activation évidente
`imtp_n`↓, `slimtp_n`↓, `iso_belt_squat_n`↓, `sl_iso_push_n`↓ (4/4), confirmatives `_nkg`
également déficitaires. **L'hypothèse s'active** — condition `CLI010` (≥2/4) largement dépassée.
Preuves activatrices : les 4 diagnostiques. `CLI###` généré : `CLI010` uniquement (`CLI011`
suppose un score global normal avec force relative isolément diminuée — non applicable ici,
puisque le score global est lui-même anormal ; `CLI012` suppose une asymétrie, non testée dans ce
cas).

### Cas B — Activation partielle
Un seul test diagnostique déficitaire (`imtp_n`↓), les 3 autres normaux. La condition explicite
`CLI010` (≥2) **n'est pas remplie** — l'hypothèse ne devrait pas s'activer au sens de `CLI010`.
**Constat C0** s'applique intégralement ici : rien dans Phase C ne précise si ce cas doit rester
totalement silencieux ou générer une hypothèse à confiance faible.

### Cas C — Faux positif potentiel
`knee_ext_n`↓ (segmentaire) déficitaire, les 4 diagnostiques normaux. **L'hypothèse reste
inactive** — validé sans ambiguïté : la fiche de qualité Force porte la règle la plus explicite de
tout le corpus sur ce point précis ("les tests segmentaires servent uniquement à expliquer...
jamais à le remplacer"). Aucun `CLI200`-`213` ne se déclenche non plus, leur condition exigeant
elle-même "au moins une variable diagnostique globale déficitaire" — porte double verrouillée,
correctement conçue.

### Cas D — Conflit entre hypothèses (Force↓, Puissance↓, Réactivité normale)
Les ensembles diagnostiques de `HYP-FOR-01` (`imtp_n`/`slimtp_n`/`iso_belt_squat_n`/
`sl_iso_push_n`) et `HYP-PUI-01` (`cmj_peak_power`/`slcmj_peak_power`) sont **disjoints** —
aucune variable commune au niveau diagnostique. Les deux hypothèses peuvent s'activer
indépendamment sans contamination croisée ; si les deux s'activent ensemble, la couche explicative
de Puissance (qui cite Force comme explication possible, `CLI040`) fournit un lien narratif
cohérent sans dupliquer le diagnostic. Réactivité reste inactive (ensemble diagnostique
`dj_rsi`/`sldj_rsi`, disjoint des deux autres). **Validé — aucune contamination détectée.**

### Cas E — Cas limite
Valeurs d'`imtp_n`/`slimtp_n` juste à la frontière du seuil normal/déficitaire (2 des 4 tests).
Aucune instabilité de raisonnement identifiable dans la logique elle-même — mais **le
comportement au voisinage du seuil dépend entièrement d'un mécanisme de classification catégorielle
non spécifié par HYP###** (hérité, en l'état, du système de seuils/percentiles déjà existant dans
Kinexus, hors périmètre de ce document). Aucune hystérésis ni marge de tolérance n'est prévue dans
les fiches Phase C.

### Vérifications spécifiques
- **Déficit global, segmentaire normal** : `HYP-FOR-01` s'active, aucun `CLI200`-`213` ne se
  déclenche (aucun segment déficitaire à confirmer). **Ambiguïté détectée** : Vierge_7 ne prévoit
  aucune orientation pour un déficit global *sans* cause segmentaire identifiable — un vide
  d'orientation, pas une erreur de diagnostic.
- **Déficit segmentaire isolé, force globale normale** : couvert par le Cas C ci-dessus — validé,
  aucune activation.
- **Plusieurs déficits segmentaires simultanés** (≥3 groupes) : `CLI213` se déclenche comme conçu,
  en plus du diagnostic global s'il est également déficitaire. Cohérent.

### Synthèse HYP-FOR-01
- Cas testés : 8 (5 génériques + 3 spécifiques)
- Cas validés : 6
- Incohérences détectées : 0
- Ambiguïtés détectées : 2 (Constat C0 ; absence d'orientation pour un déficit global sans cause
  segmentaire)
- Contradictions avec Vierge_7 : 0
- Modification éventuelle de Phase C : aucune correction de contenu — seulement noter l'absence
  d'orientation pour "déficit global inexpliqué" comme un vide à signaler au praticien, pas à
  combler ici.

---

## HYP-PUI-01 — Puissance

### Cas A — Activation évidente
`cmj_peak_power`↓ et `slcmj_peak_power`↓ (2/2), confirmatives `cmj_height`↓, `single_hop`↓/
`triple_hop`↓ également déficitaires. **S'active** — condition `CLI040` ("deux preuves
diagnostiques déficitaires", ici les 2 seules preuves existantes) remplie. `CLI###` généré :
`CLI040`. `CLI041` non déterminable avec certitude (sa condition d'activation n'est pas fournie
par Vierge_7, voir "ambiguïtés" ci-dessous).

### Cas B — Activation partielle
`cmj_peak_power`↓ seul, `slcmj_peak_power` normal. La condition `CLI040` exige explicitement les
**deux** preuves — non remplie avec une seule. **Constat C0** s'applique, mais avec une
conséquence plus marquée que pour Force : Puissance n'a que 2 variables diagnostiques au total (pas
4), donc "une seule déficitaire" équivaut ici à **la moitié** du diagnostic disponible, pas un
quart. La preuve diagnostique secondaire (`dj_peak_prop_power` etc.) ne s'applique pas à ce cas —
son rôle, figé au gel, est réservé à l'indisponibilité du test principal, pas à un résultat
discordant entre deux tests disponibles. **Ambiguïté détectée** : un déficit bilatéral (CMJ)
isolé, avec un profil unilatéral (SLCMJ) normal, est un résultat clinique réel et interprétable
(asymétrie de puissance) que la condition actuelle ne permet de traiter d'aucune façon — ni
validation, ni rejet explicite.

### Cas C — Faux positif potentiel
`imtp_n`↓ et `profil_fv_v0`↓ (explicatives) déficitaires, `cmj_peak_power`/`slcmj_peak_power`
normaux. **L'hypothèse reste inactive** — validé, conforme au principe transversal
diagnostique/explicative déjà vérifié pour Force.

### Cas D — Conflit entre hypothèses
Couvert dans la fiche `HYP-FOR-01` ci-dessus (même scénario, testé depuis les deux côtés) —
**validé, aucune contamination.**

### Cas E — Cas limite
Même constat que Force : comportement au seuil non spécifié par HYP### lui-même, hérité du système
de classification externe.

### Vérifications spécifiques
- **Puissance faible expliquée par un déficit de force** : `cmj_peak_power`/`slcmj_peak_power`↓ +
  `imtp_n`/`slimtp_n`↓. `HYP-PUI-01` s'active ; si `imtp_n`/`slimtp_n` comptent pour ≥2/4 du
  diagnostic Force, `HYP-FOR-01` s'active *indépendamment* aussi — narration cohérente ("déficit
  de puissance confirmé, expliqué par un déficit de force lui-même confirmé"), exactement le motif
  de convergence de preuves recherché par l'architecture. **Validé, cas positif à retenir.**
- **Puissance faible sans déficit de force** : `cmj_peak_power`/`slcmj_peak_power`↓, `imtp_n`/
  `slimtp_n` normaux. `HYP-PUI-01` s'active seule, sans explication physiologique de force
  identifiée. La fiche Phase C ne spécifie pas comment ce cas "signal isolé" doit être présenté —
  hors périmètre de HYP### lui-même (relève du Fil de Raisonnement / de la narration en aval, déjà
  distingué dans `KINEXUS_CLINICAL_ARCHITECTURE.md`), pas une lacune du moteur de raisonnement.
- **Puissance faible avec biomécanique altérée** : `cmj_depth`/`cmj_conc_duration` anormaux en
  plus du diagnostic déficitaire. Couche explicative biomécanique correctement mobilisée sans
  redéfinir le diagnostic. Validé.

### Synthèse HYP-PUI-01
- Cas testés : 8
- Cas validés : 6
- Incohérences détectées : 0
- Ambiguïtés détectées : 2 (Constat C0, aggravé par le diagnostic à 2 variables seulement ;
  condition d'activation de `CLI041` non fournie par Vierge_7)
- Contradictions avec Vierge_7 : 0
- Modification éventuelle de Phase C : aucune — signaler au praticien l'absence de condition
  numérique pour `CLI041`, déjà noté comme tel dans la fiche existante.

---

## HYP-REA-01 — Réactivité

### Cas A — Activation évidente
`dj_rsi`↓ et `sldj_rsi`↓ (2/2), confirmatives `dj_contact_time`↑/`sldj_contact_time`↑ et
`dj_height`↓/`sldj_height`↓. **S'active** — condition `CLI050` remplie sur les deux variables
diagnostiques réelles (`cmjr_mean_rsi` non comptée, voir réserve déjà actée en Phase C). `CLI###`
généré : `CLI050`.

### Cas B — Activation partielle
`dj_rsi`↓ seul, `sldj_rsi` normal. Condition non remplie (**Constat C0**, même structure que
Puissance : diagnostic à 2 variables, donc "une seule" = la moitié).

### Cas C — Faux positif potentiel
`imtp_rfd100`↓, `knee_ext_rfd50`↓ (explicatives) déficitaires, `dj_rsi`/`sldj_rsi` normaux.
**Reste inactive** — validé.

### Cas D — Conflit entre hypothèses
Couvert dans `HYP-FOR-01`/`HYP-PUI-01` ci-dessus — **validé, ensemble diagnostique disjoint des
deux autres qualités.**

### Cas E — Cas limite
Même constat générique (seuil externe non spécifié par HYP###).

### Vérifications spécifiques
- **RSI faible avec force normale** : `dj_rsi`/`sldj_rsi`↓, `imtp_n`/`slimtp_n` normaux.
  S'active seule, sans explication de force — cohérent, pas de contamination Force↔Réactivité.
- **RSI faible avec temps de contact élevé** : `dj_rsi`/`sldj_rsi`↓ + `dj_contact_time`↑/
  `sldj_contact_time`↑. Confiance renforcée par la confirmative citée dans `CLI050`
  ("Contact Time") — mécanisme explicatif biomécanique cohérent (temps de contact long = cycle
  étirement-raccourcissement inefficace). Validé.
- **RSI faible avec puissance normale** : `dj_rsi`/`sldj_rsi`↓, `cmj_peak_power`/
  `slcmj_peak_power` normaux. `HYP-REA-01` s'active seule ; `HYP-PUI-01` reste inactive
  (ensembles diagnostiques disjoints, DJ/SLDJ absents du diagnostic Puissance). **C'est
  précisément le résultat que la Phase A visait à obtenir** — un déficit de réactivité au premier
  contact ne dilue plus, ni ne contamine, le diagnostic de puissance. **Validation positive à
  souligner explicitement.**

### Synthèse HYP-REA-01
- Cas testés : 8
- Cas validés : 7
- Incohérences détectées : 0
- Ambiguïtés détectées : 1 (Constat C0)
- Contradictions avec Vierge_7 : 0 *(la contradiction `CLI050`/`cmjr_mean_rsi` déjà documentée en
  Phase C n'est pas retestée ici — traitement déjà tranché, pas rouverte par cette validation)*
- Modification éventuelle de Phase C : aucune.

---

## HYP-EXP-01 — Explosivité

### Cas A — Activation évidente
`cmj_conc_rfd`↓ et `cmj_conc_impulse_100`↓ (2/2 des variables *réellement mesurées*).
**S'active** — mais voir remarque ci-dessous : la condition `CLI030` ("≥2 déficitaires parmi 4")
devient, de fait, "2 déficitaires parmi 2 disponibles" — un seuil plus strict que celui prévu par
Vierge_7 pour cette qualité précisément parce que la moitié des variables visées n'existe pas.

### Cas B — Activation partielle
`cmj_conc_rfd`↓ seul, `cmj_conc_impulse_100` normal. Ne remplit pas la condition. **Constat C0
combiné à la limite de couverture** : dans la conception originale de Vierge_7 (4 variables), 1
déficitaire sur 4 pouvait faire partie d'un ensemble "2 sur 4" encore atteignable par ailleurs
(ex. RFD150/RFD200 également déficitaires, non mesurés aujourd'hui). Avec seulement 2 variables
disponibles, ce chemin est **structurellement fermé** — c'est la qualité où le vide de
spécification du Constat C0 a la conséquence pratique la plus lourde de tout le corpus.

### Cas C — Faux positif potentiel
Familles RFD segmentaires/globales (explicatives) déficitaires, `cmj_conc_rfd`/
`cmj_conc_impulse_100` normaux. **Reste inactive** — validé, même principe que les autres
qualités.

### Cas D — Conflit entre hypothèses
Ensemble diagnostique disjoint de Force/Puissance/Réactivité (aucune variable partagée au niveau
diagnostique). **Validé.**

### Cas E — Cas limite
Idem constat générique.

### Dépendance au proxy `cmj_conc_rfd` — situations d'erreur possibles (demande explicite)

`cmj_conc_rfd` est une **moyenne non fenêtrée** sur toute la phase concentrique. Trois mécanismes
concrets de conclusion erronée en découlent, tous de nature à produire un **faux négatif**
(masquer un déficit réel), pas un faux positif :

1. **RFD précoce faible, RFD tardif fort** : un athlète explosif tardivement mais lent à démarrer
   verrait sa moyenne se rapprocher de la normale, masquant un déficit précisément sur la fenêtre
   0-100 ms que `CMJ_RFD100` (non mesuré) aurait détecté.
2. **RFD précoce fort, RFD tardif faible** : symétriquement, un profil "qui part vite mais
   s'essouffle" dans la montée en force serait lui aussi lissé par la moyenne.
3. **Durée concentrique atypiquement courte** : une pente moyenne calculée sur un intervalle très
   court peut apparaître élevée sans refléter fidèlement la qualité d'explosivité au sens où
   Vierge_7 la définit (fenêtres fixes), créant un résultat "normal" potentiellement optimiste par
   rapport à ce qu'une analyse fenêtrée révélerait.

**Aucun mécanisme identifié ne produirait, à l'inverse, un faux positif** (le proxy ne peut pas
indiquer un déficit qui n'existe pas dans le signal moyen — il ne fait que lisser, jamais
inventer). Le risque est donc structurellement asymétrique : sous-détection, jamais
sur-détection.

### Synthèse HYP-EXP-01
- Cas testés : 6 (5 génériques + 3 mécanismes de proxy, ce dernier bloc compté comme 1 vérification
  structurée)
- Cas validés : 4
- Incohérences détectées : 0
- Ambiguïtés détectées : 1 (seuil `CLI030` implicitement durci par la limite de couverture)
- Contradictions avec Vierge_7 : 0
- Modification éventuelle de Phase C : aucune correction — le plafond de confiance structurel déjà
  acté au gel devrait explicitement mentionner que la condition d'activation elle-même (pas
  seulement la confiance) est affectée par la limite de couverture — nuance à ajouter en Phase E si
  le praticien le juge utile, pas un changement de contenu clinique.

---

## HYP-ABS-01 — Absorption

### Cas A — Activation évidente
`sllt_peak_landing_force`↓, `sllt_tts`↓, `landing_uni_tts`↓, `cmj_ecc_mean_power`↓ (4 preuves
diagnostiques déficitaires sur au moins 2 tests différents). **S'active** largement au-delà du
seuil `CLI060` (≥2).

### Cas B — Activation partielle
Une seule variable déficitaire (`sllt_tts`↓ isolé). Ne remplit pas la condition. **Constat C0**,
avec une nuance propre à Absorption : le diagnostic regroupe **4 familles de tests distinctes**
(Landing uni/bi, SLLT, CMJ excentrique) totalisant une quinzaine de variables — Vierge_7 ne précise
pas si les "deux preuves" doivent provenir de tests différents ou peuvent provenir du même test
(ex. `sllt_tts` + `sllt_loading_rate`, tous deux SLLT). **Ambiguïté détectée, propre à cette
qualité.**

### Cas C — Faux positif potentiel
`imtp_rfd100`↓ (explicative), diagnostiques normaux. **Reste inactive** — validé.

### Cas D — Conflit entre hypothèses (Absorption↓, Stabilisation↓)
Voir section dédiée dans `HYP-STAB-01` ci-dessous — les deux fiches partagent l'analyse.

### Cas E — Cas limite
Constat générique.

### Vérifications spécifiques (Peak Landing Force / Loading Rate / TTS, et inversement)

- **Peak Landing Force élevé + Loading Rate élevé (tous deux `dir:'min'`, donc en zone
  déficitaire) + TTS normal** : `sllt_peak_landing_force` et `sllt_loading_rate` sont 2 des 5
  variables diagnostiques SLLT — **2 preuves déficitaires du même test suffisent** à activer
  `HYP-ABS-01` sans que la composante temporelle (`tts`) soit elle-même anormale. Ce cas capture
  correctement un profil clinique réel et distinct : "mauvaise atténuation de force, mais
  récupération de l'équilibre post-choc normale."
- **TTS élevé isolé (déficitaire), Peak Landing Force et Loading Rate normaux** : si un seul `tts`
  (ex. `sllt_tts` seul) est déficitaire, la condition à 2 preuves n'est **pas remplie** par cette
  seule variable — retombe sur le Constat C0/ambiguïté ci-dessus. Si en revanche `landing_uni_tts`
  **et** `sllt_tts` sont tous deux déficitaires (2 tests différents), la condition est remplie.
- **Réponse à la question "encaisser la charge"** : le diagnostic couvre bien les deux composantes
  de l'absorption (magnitude de force et temps de récupération), et permet leur activation
  indépendante l'une de l'autre — **validé, conforme à la question clinique visée par Vierge_7.**

### Synthèse HYP-ABS-01
- Cas testés : 8
- Cas validés : 6
- Incohérences détectées : 0
- Ambiguïtés détectées : 2 (Constat C0 ; "deux preuves" — même test ou tests différents, non
  précisé par Vierge_7)
- Contradictions avec Vierge_7 : 0
- Modification éventuelle de Phase C : aucune — l'ambiguïté "même test vs tests différents" est à
  signaler au praticien, pas à trancher ici.

---

## HYP-STAB-01 — Stabilisation

### Cas A — Activation évidente
`sls_ttf`↓, `sls_cop_path`↓ (≥2 des 7 variables SLS). **S'active** — condition `CLI070` remplie,
`CLI070` ("Améliorer la stabilité posturale") généré.

### Cas B — Activation partielle
Une seule variable SLS déficitaire. Ne remplit pas la condition — **Constat C0**, même structure
qu'Absorption (plusieurs KPI possibles au sein d'un même test).

### Cas C — Faux positif potentiel
`hip_abd_rfd100`↓ (explicative) déficitaire, SLS/EO/EF/Strobo/Landing tous normaux. **Reste
inactive** — validé.

### Cas D — Conflit entre hypothèses (Absorption↓, Stabilisation↓) — analyse commune avec HYP-ABS-01
Scénario : `sllt_peak_landing_force`↓/`sllt_loading_rate`↓ (Absorption) + `sls_ttf`↓/
`sls_cop_path`↓ (Stabilisation), le reste normal. **Résultat** : `HYP-ABS-01` s'active sur ses
preuves SLLT propres ; `HYP-STAB-01` s'active sur ses preuves SLS propres — **aucune variable
commune entre les deux ensembles de preuves qui ont réellement déclenché chaque hypothèse dans ce
cas**. Les deux s'activent légitimement et indépendamment, décrivant deux déficits réels et
distincts chez le même athlète — pas une contamination.

**Vérification explicite demandée : la contamination SLLT n'existe plus.** Confirmée : `sllt` est
absent du diagnostic, de la confirmative et de l'explicative de `HYP-STAB-01` (seule mention :
🚫 exclusion explicite). Un déficit d'absorption pur (SLLT anormal, SLS/EO/EF/Strobo/Landing
normaux) **n'active plus** `HYP-STAB-01` — testé et validé positivement.

### Cas E — Cas limite
Constat générique, plus une nuance propre : le seuil `CLI070` ("2 preuves") porte explicitement
sur SLS seul (voir ci-dessous) — un cas limite où SLS est juste sous le seuil mais où EO/EF/Strobo
seraient nettement anormaux illustre directement l'incohérence identifiée ci-après.

### Vérifications spécifiques (SLS altéré isolé / Landing normal / Absorption altérée mais stabilisation normale)

- **SLS altéré isolé** (EO/EF/Strobo/Landing tous normaux) : `HYP-STAB-01` s'active si ≥2 des 7
  KPIs SLS sont déficitaires — cohérent avec `CLI070`, qui cite SLS comme seul déclencheur
  explicite. **Validé.**
- **Landing normal, tout le reste normal** : n'affecte pas l'activation (Landing n'est de toute
  façon pas un déclencheur de `CLI070`, voir incohérence ci-dessous).
- **Absorption altérée mais Stabilisation normale** : couvert au Cas D — validé, aucune
  contamination.

### 🔴 Incohérence détectée, révélée par ce test (pas nouvelle en soi, déjà signalée en Phase C, mais concrètement démontrée ici)

Si **seules** `landing_uni_tts`/`landing_bi_tts` sont déficitaires (EO/EF/Strobo/SLS tous
normaux) : la **fiche de qualité** de Stabilisation classe Landing en diagnostique principal
contextuel — au sens strict de la fiche, `HYP-STAB-01` pourrait s'activer sur ce seul signal (si
2 variables Landing comptent comme "2 preuves"). **Mais `CLI070`/`CLI071` — les deux seules
orientations connues de Stabilisation — ne mentionnent Landing nulle part.** Résultat concret :
**l'hypothèse peut être techniquement "active" selon la fiche de qualité, sans qu'aucune
orientation clinique connue de Vierge_7 ne puisse en découler.** C'est une incohérence réelle
entre deux niveaux de la même spécification, démontrée ici par un cas concret plutôt que simplement
énoncée en abstrait comme en Phase C.

### Synthèse HYP-STAB-01
- Cas testés : 8
- Cas validés : 6
- Incohérences détectées : 1 (Landing diagnostique en fiche de qualité, absent de toute
  orientation `CLI###` — démontrée par cas concret)
- Ambiguïtés détectées : 1 (Constat C0)
- Contradictions avec Vierge_7 : 0 (l'incohérence ci-dessus est interne à Vierge_7 lui-même, pas
  une contradiction de la construction HYP###)
- Modification éventuelle de Phase C : envisager d'annoter le champ "Liens vers déficits
  segmentaires"/"Orientations cliniques possibles" de `HYP-STAB-01` pour signaler explicitement
  que Landing, bien que diagnostique, ne déclenche aujourd'hui aucune orientation connue — pas une
  correction de contenu, une clarification de portée.

---

## HYP-END-01 — Endurance

### Cas A — Activation évidente
`repeated_hop_rsi_fatigue`↓, `repeated_hop_ct_drift`↓ (2/5 des variables `repeated_hop`).
**S'active** — condition `CLI080` (≥2) remplie.

### Cas B — Activation partielle
Une seule variable `repeated_hop` déficitaire. Ne remplit pas la condition — **Constat C0**.

### Cas C — Faux positif potentiel
Familles RFD segmentaires (explicatives) déficitaires, tous les diagnostiques `repeated_hop`/
`heel_raise` normaux. **Reste inactive** — validé.

### Cas D — Conflit entre hypothèses
Ensemble diagnostique disjoint des 7 autres qualités actives — aucun chevauchement diagnostique
identifié dans la construction Phase C. **Validé.**

### Cas E — Cas limite
Constat générique.

### Vérifications spécifiques (repeated hop / heel raise / fatigue progressive)

- **`repeated_hop` déficitaire (≥2 des 5 KPIs de fatigue), `heel_raise_reps` normal** : s'active
  sur la seule famille `repeated_hop` — capture un déficit "neuromusculaire réactif répété" sans
  déficit d'endurance musculaire locale du mollet. Cohérent.
- **`heel_raise_reps` déficitaire seul, `repeated_hop` entièrement normal** : une seule variable
  déficitaire sur l'ensemble diagnostique (6 variables au total) — ne remplit pas "2 preuves" au
  sens strict. **Ambiguïté détectée, propre à Endurance** : `heel_raise_reps` porte le qualificatif
  Vierge_7 "diagnostique principal **local**" (par opposition à "diagnostique principal de
  volume"/"diagnostique principal" pour les variables `repeated_hop`) — un statut qui pourrait
  justifier qu'il suffise seul pour une conclusion *locale* d'endurance du mollet, séparément d'une
  conclusion plus générale nécessitant convergence sur `repeated_hop`. Vierge_7 ne tranche pas
  cette distinction. Même structure que la distinction global/segmentaire déjà identifiée pour
  Force.
- **Fatigue progressive** (`ct_drift`↑, `rsi_fatigue`↑, `height_fatigue`↑ convergents, avec
  `mean_rsi` confirmatif resté correct) : s'active avec une confiance renforcée par la convergence
  de 3 signaux de dégradation, tout en confirmant via la confirmative que la performance de
  *départ* était normale — isole bien un phénomène de fatigue pure, distinct d'un déficit de
  réactivité de base (`HYP-REA-01`, qui n'utilise aucune variable `repeated_hop`). **Bonne
  séparation Endurance/Réactivité, validée.**

### Synthèse HYP-END-01
- Cas testés : 8
- Cas validés : 6
- Incohérences détectées : 0
- Ambiguïtés détectées : 2 (Constat C0 ; statut "local" de `heel_raise_reps` pouvant justifier une
  activation autonome, non tranché par Vierge_7)
- Contradictions avec Vierge_7 : 0
- Modification éventuelle de Phase C : aucune.

---

## HYP-MOB-01 — Mobilité

### Cas A — Activation évidente
`wblt_distance`↓. **S'active** — condition `CLI020` ("distance inférieure au seuil") remplie sur
**une seule variable**. `CLI020` généré.

⚠️ **Tension logique identifiée, propre à cette qualité** : le principe fondateur du projet
("une variable isolée ne valide jamais seule") est ici en tension directe avec la condition
explicite de Vierge_7 lui-même, qui accepte `wblt_distance` seul comme suffisant. C'est cohérent
avec la règle de fond de la fiche de qualité ("la mobilité de cheville repose exclusivement sur ce
test") — Mobilité semble être une **exception assumée** au principe général plutôt qu'une
violation accidentelle, mais Phase C ne le formule pas explicitement comme telle. À signaler au
praticien pour confirmation que cette exception est voulue.

### Cas B — Activation partielle
Non applicable au sens habituel — Mobilité n'a qu'une seule variable diagnostique effective
(`wblt_distance`, plus un LSI calculé de la même mesure). Il n'existe pas de scénario "certaines
preuves présentes, d'autres absentes" avec seulement une source de preuve. Cas structurellement
vide pour cette qualité — noté comme tel plutôt que forcé.

### Cas C — Faux positif potentiel
Aucune variable explicative n'existe pour Mobilité (couche explicative vide, déjà établi en
Phase C) — **structurellement impossible de tester ce cas**, faute de variable explicative à
rendre déficitaire. Noté comme absence de cas testable, pas comme un résultat "validé" au même
titre que les autres qualités.

### Cas D — Conflit entre hypothèses
Ensemble diagnostique (`wblt_distance` + LSI) totalement disjoint des 7 autres qualités, et
exclusion explicite et stricte ("jamais... à partir de tests de force, de puissance, de
réactivité, d'absorption, de stabilisation"). **Validé, aucune contamination possible par
construction.**

### Cas E — Cas limite
Constat générique (seuil externe non spécifié).

### Vérification explicite demandée : rien d'autre ne peut activer `HYP-MOB-01`
Confirmé par construction : diagnostique + confirmative se limitent à `wblt_distance`/LSI,
explicative vide, exclusion couvrant les 5 autres familles de qualités. **Aucun chemin
d'activation alternatif identifié — validation la plus nette de tout le corpus, précisément parce
que la base de preuves est minimale.**

### Synthèse HYP-MOB-01
- Cas testés : 4 (A, D, E, + vérification dédiée — B et C structurellement non applicables, notés
  comme tels)
- Cas validés : 3
- Incohérences détectées : 0
- Ambiguïtés détectées : 1 (tension entre le principe fondateur "jamais une variable seule" et la
  condition `CLI020` à variable unique — probable exception assumée, non confirmée comme telle)
- Contradictions avec Vierge_7 : 0
- Modification éventuelle de Phase C : suggérer d'annoter explicitement `HYP-MOB-01` comme
  exception documentée au principe fondateur, sous réserve de confirmation du praticien — pas une
  correction de contenu.

---

## Tableau de synthèse finale

| HYP_ID | Robustesse logique | Risque de faux positif | Risque de faux négatif | Dépendance à des proxies | Dépendance à des arbitrages | Prêt pour implémentation |
|---|---|---|---|---|---|---|
| `HYP-FOR-01` | Élevée | Faible (double verrouillage global/segmentaire vérifié) | Faible | Aucune | Aucun arbitrage actif restant | **Oui** |
| `HYP-PUI-01` | Élevée | Faible | Modéré (seuil à 2/2 rigide, aucun cas pour un profil discordant CMJ/SLCMJ) | Aucune | Aucun | **Oui, sous réserve du Constat C0** |
| `HYP-REA-01` | Élevée | Faible | Modéré (même structure à 2/2) | Aucune | 1 (contradiction `CLI050`/`cmjr_mean_rsi`, déjà tranchée) | **Oui, sous réserve du Constat C0** |
| `HYP-EXP-01` | Modérée | Faible | **Élevé** (proxy non fenêtré + seuil implicitement durci par la perte de 2 des 4 variables prévues) | **Forte** (`cmj_conc_rfd` pour 3 variables visées) | 1 (correspondance `cmj_braking_*`) | **Sous réserve** (plafond de confiance à formaliser avant implémentation) |
| `HYP-ABS-01` | Élevée | Faible | Modéré (Constat C0 + ambiguïté "même test/tests différents") | Modérée (`cmj_braking_*`) | 2 (asymétries, `cmj_braking_*`) | **Oui, sous réserve** |
| `HYP-STAB-01` | Modérée | Faible (contamination SLLT confirmée absente) | Modéré (Landing techniquement actif sans orientation `CLI###` correspondante) | Aucune | 1 (quasi-duplication CSM, suspendue) | **Sous réserve** (incohérence Landing/`CLI070` à clarifier) |
| `HYP-END-01` | Élevée | Faible | Faible-modéré (statut autonome de `heel_raise_reps` non tranché) | Aucune | Aucun | **Oui, sous réserve du Constat C0** |
| `HYP-MOB-01` | Élevée (base de preuves minimale, contamination structurellement impossible) | Nulle identifiée | Faible | Aucune | 1 (exception au principe fondateur, à confirmer) | **Oui, sous réserve de confirmation de l'exception à variable unique** |

**Aucune correction n'est proposée dans ce document.** Les réserves listées ci-dessus sont des
points à trancher par le praticien avant la Phase E, pas des défauts à corriger unilatéralement ici.

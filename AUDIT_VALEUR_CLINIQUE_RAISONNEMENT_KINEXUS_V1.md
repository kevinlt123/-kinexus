# Audit de la valeur clinique du raisonnement Kinexus V1

Audit **exclusivement en lecture** — aucun fichier de production n'a été modifié pendant cette
mission. Méthode : lecture intégrale des 8 moteurs HYP dans `index.html` (mappage factuel réalisé
en parallèle par 4 sous-agents dédiés, deux qualités chacun, vérifications croisées ensuite
effectuées personnellement), exécution réelle de `computeMoteur()`/`computeHypClinicalSynthesis01()`
sur des scénarios synthétiques via le pipeline complet, génération réelle de PDF (`buildFullReportHtml`),
inspection du rendu réel (texte extrait des HTML générés). Aucun seuil, aucune norme, aucun
diagnostic, aucune règle de convergence, aucun rôle diagnostique/confirmatif, aucune relation HYP
n'a été modifié — cet audit ne fait que lire ce qui existe déjà.

---

## 1. Résumé exécutif

Kinexus V1 **diagnostique correctement** : les 8 moteurs HYP appliquent des règles de convergence
rigoureuses, honnêtes sur leurs limites (aucune n'a jamais menti — chaque moteur documente
explicitement, dans ses propres commentaires et son objet `limitations`, les raisons exactes de ses
états `non_determinable`). Le problème central de cet audit n'est **pas** un problème de justesse du
diagnostic, mais un problème de **transmission de la preuve** : une quantité substantielle
d'information cliniquement utile — déjà calculée, déjà correctement classée en
diagnostic/confirmative/explicative/précision par les moteurs eux-mêmes — **n'atteint jamais le
praticien**, ni dans l'UI, ni dans le PDF.

Trois constats structurent tout le reste de l'audit :

1. **5 des 8 qualités (Force, Puissance, Explosivité, Stabilisation, Endurance) sont aujourd'hui
   structurellement limitées dans leur capacité à atteindre un état confirmé** (`retenue_faible` ou
   mieux), pour une raison purement normative (seuils/normes manquants sur au moins une des preuves
   diagnostiques requises) — jamais expliquée au praticien avec la variable précise en cause.
2. **Absorption**, qualité prioritaire de cet audit, calcule un découpage en 4 sous-domaines
   cliniques (freinage, capacité excentrique, stratégie, absorption réactive) mais ce découpage
   (`sousDomaines`) n'est **jamais lu** par aucun code UI ou PDF — confirmé par recherche exhaustive.
   Le praticien ne voit jamais que « Absorption déficitaire », jamais pourquoi.
3. Il existe **deux registres explicatifs parallèles et non réconciliés** : le registre HYP
   (diagnostic/confirmative/explanatory, correctement gelé et documenté) et le registre TFM/VAR_REL3
   (poids Direct/Majeur/Mineur, Determinante/Majeure/Mineure) consommé par les onglets « Fonctions »
   et « Variables ». Ce second registre attribue parfois un poids « Determinante » à une variable que
   le moteur HYP correspondant traite comme purement explicative, jamais génératrice — un praticien
   consultant l'onglet « Variables » pourrait légitimement croire qu'une variable a *causé* un
   diagnostic alors qu'elle ne l'a jamais pu, structurellement.

Aucune fausse certitude au sens strict (Partie 13) n'a été trouvée dans le texte actuellement
affiché par défaut — le travail des missions précédentes (routage vers `csmSafeQualityNote`,
suppression des « Priorité principale »/rangs numérotés, `tfmSecondaryContributorNote`) a
effectivement neutralisé la surinterprétation *affichée*. Le texte causal legacy (`HYPO[fn]`,
« semble principalement influencé par… ») subsiste néanmoins comme **valeur de pré-remplissage** du
champ éditable « Pourquoi ? » dans « Modifier le rapport » — un résidu mineur mais réel.

**Verdict (Partie 22) : C — NON, le diagnostic est correct mais l'explication est insuffisante.**

---

## 2. Méthode

- Cartographie factuelle des 8 moteurs HYP confiée à 4 agents de recherche en parallèle (aucune
  modification, lecture seule), chacun couvrant 2 qualités : rôles diagnostic/confirmatif/
  explicatif/précision, règle de convergence, sous-domaines, cross-référence UI (10 onglets
  ExpertView), cross-référence PDF (`buildSportifReport`/`buildExpertReport`), classification des
  variables orphelines. Rapports vérifiés par recoupement avec des lectures directes du code par
  l'auditeur principal.
- Exécution réelle de `computeMoteur()` sur 12+ scénarios synthétiques (extraction du moteur depuis
  `index.html`, `eval()`, mêmes conventions que `tests/*.test.js`).
- Génération réelle de PDF (`buildFullReportHtml`) pour plusieurs scénarios, recherche textuelle et
  inspection de sections précises du HTML produit.
- Vérification croisée `THRESHOLDS`/`NORMS` pour confirmer ou infirmer, variable par variable, si un
  état `non_determinable` reflète une vraie absence de norme (jamais un bug de seuil).
- Aucune capture d'écran navigateur supplémentaire n'a été nécessaire au-delà des vérifications déjà
  produites lors des missions précédentes (le rendu UI des onglets concernés — Synthèse clinique,
  Hypothèses, Orientations, Fonctions, Variables — a été vérifié visuellement à plusieurs reprises
  dans les missions précédentes de cette session ; cet audit se concentre sur ce que CES rendus déjà
  vérifiés omettent, question à laquelle la lecture de code répond de façon plus précise que de
  nouvelles captures).

---

## 3. Diagnostic → preuve

Pour chacune des 8 qualités, la question posée est : « le praticien peut-il retrouver, sans deviner,
quelles variables ont généré ce diagnostic ? »

| Qualité | Variable(s) diagnostique(s) | Visible en tant que TELLE (rôle nommé) quelque part ? |
|---|---|---|
| Mobilité | `wblt_distance` (seul mécanisme, exception ADR-005) | Non — valeur brute visible génériquement (onglet Résultats), jamais annotée « ceci est la preuve diagnostique de Mobilité » |
| Force | `imtp_n`, `slimtp_n`, `iso_belt_squat_n`, `sl_iso_push_n` (2/4 requis) | Non — mêmes 4 valeurs visibles génériquement, jamais annotées comme le socle 2/4 |
| Puissance | `cmj_peak_power` + `slcmj_peak_power` (2/2 strict) | Non |
| Explosivité | `cmj_conc_rfd` + `cmj_conc_impulse_100` (2/2 strict) | Non |
| Réactivité | `dj_rsi` + `sldj_rsi` (2 mécanismes indépendants) | Non |
| Absorption | `braking_rfd` + `force_zero_vel` (2/2, sous-domaine A) | Non |
| Stabilisation | 6 mécanismes (`sls`,`eo_surface`,`ef_surface`,`strobo_surface`,`landing_uni_tts`,`landing_bi_tts`), ≥2 requis | Non |
| Endurance | `heel_raise_reps` + 5 KPI Repeated Hop, ≥2 requis | Non |

**Constat unanime et vérifié pour les 8 qualités : aucune ne nomme, dans l'UI ou le PDF, sa ou ses
variable(s) diagnostique(s) avec la mention explicite de ce rôle.** Ce que le praticien voit à la
place : un badge de statut par qualité (correct), une valeur brute par KPI dans l'onglet Résultats
(correcte mais non reliée au diagnostic), et un système/muscle comme « Contributeur » (system-level,
jamais le nom exact de la variable). Le praticien doit aujourd'hui **deviner** — en croisant
mentalement l'onglet Résultats avec sa propre connaissance clinique de chaque fiche HYP — quelle
valeur a réellement déclenché quel diagnostic.

Ce constat est **le même pour toutes les qualités**, ce n'est donc pas un défaut isolé d'une fiche
mais une caractéristique structurelle de la couche de présentation actuelle : elle a été construite
pour afficher des **verdicts** (statut par qualité) et des **synthèses inter-qualités** (CSM), jamais
pour exposer la preuve **intra-qualité**.

---

## 4. Diagnostic ≠ explication

La distinction interne DIAGNOSTIC/CONFIRMATION/EXPLICATION/PRÉCISION est **rigoureusement respectée
par les 8 moteurs eux-mêmes** — c'est le résultat le plus rassurant de cet audit :

- Aucun moteur ne classe jamais une variable explicative comme preuve diagnostique. Vérifié
  explicitement pour Réactivité (CMJR/Repeated Hop, commentaire : « CMJR = explicatif, jamais
  diagnostique, même si CLI050 brut et TFM… suggèrent le contraire »), pour Absorption (sous-domaines
  B/C/D, commentaire : « jamais générateurs du Niveau 1 »), pour Puissance/Explosivité (`capacite`/
  `strategie`, `forceCapacite`/`biomecanique`, toutes `classifiable:false`, jamais comptées dans la
  convergence).
- Aucun moteur ne présente une variable confirmative comme génératrice du diagnostic : Force lit les
  KPI `_nkg` comme un second regard sur la même mesure (« jamais une cinquième/deuxième preuve
  indépendante »), jamais compté dans le 2/4 ; Stabilisation documente honnêtement qu'aucune
  confirmative indépendante n'existe et utilise une convention explicite (3ᵉ mécanisme déficient =
  équivalent-confirmation), jamais une nouvelle preuve.
- Aucune asymétrie ne remplace un diagnostic global — vérifié systématiquement (voir Partie 9).

**Le problème n'est donc jamais que cette distinction soit violée à l'intérieur des moteurs ; il est
que cette distinction, une fois calculée, n'est presque jamais transmise à la couche de
présentation.** La seule fonction qui lit ce rôle pour l'afficher (`hypEvidenceRoleForTest`)
**fusionne diagnostic et confirmative en une seule étiquette** (`'diagnostic'`, ligne du code :
`if(hasKey(hyp.diagnostic)||hasKey(hyp.confirmative))return'diagnostic';`) et ne sert qu'à décider
si un *système* (ex. « Quadriceps ») peut apparaître comme `contributeurPrincipal` — jamais à afficher
le nom de la variable ni son rôle exact.

---

## 5. Audit des 8 qualités

### MOBILITÉ

- **Diagnostic** : `wblt_distance` (pire côté D/G) — seul mécanisme, exception clinique gelée
  (ADR-005, « jamais d'état "suspectee" pour cette qualité »).
- **Confirmation** : `wblt_lsi`, structurellement inerte (« auto-référentiel — jamais élévateur »).
- **Explication** : objet vide, « aucune variable Kinexus documentée » — absence honnête, pas un
  manque de développement caché.
- **Précision** : `wblt_asymmetry`, documentée mais non implémentée (« aucun mécanisme de calcul »).
- **Le praticien peut-il comprendre le résultat ?** Oui, dans une large mesure — un seul mécanisme,
  un seul test, un résultat binaire honnêtement présenté (support toujours plafonné à « faible »).
  C'est la qualité la plus simple à comprendre de tout Kinexus, précisément parce qu'elle n'a
  qu'une seule variable.

### FORCE

- **Niveau 1 (globale) vs Niveau 2 (segmentaire)** : 4 tests globaux diagnostiques (`imtp_n`,
  `slimtp_n`, `iso_belt_squat_n`, `sl_iso_push_n`), règle « ≥2 parmi 4 » ; 15 tests segmentaires
  (CLI200-CLI211) en précision/localisation, activés seulement si le Niveau 1 est déjà déficitaire
  (« un déficit segmentaire isolé sans déficit global ne crée jamais HYP-FOR-01 » — non-causalité
  bien respectée).
- **RFD/TTPF** : 5 variables explicatives, toutes `classifiable:false` — jamais génératrices, valeur
  brute conservée mais jamais colorée.
- **Asymétries** : `precision.asymmetries` (LSI sur les 2 tests unilatéraux) — calculé, jamais lu
  hors du moteur.
- **CONSTAT CRITIQUE (nouveau, découvert par cet audit)** : `imtp_n`/`slimtp_n` n'ont **aucune norme
  dans aucune population** du fichier. `iso_belt_squat_n` et `sl_iso_push_n` ont des normes, mais
  dans des **ensembles de populations disjoints** (aucune population réelle ne couvre les deux à la
  fois) — fait explicitement vérifié et documenté dans `tests/hypForce01.test.js` (« aucune
  population réelle ne couvre à la fois iso_belt_squat_n ET sl_iso_push_n aujourd'hui »), qui doit
  injecter une norme fusionnée artificielle *en mémoire, pour la durée du test uniquement* pour
  pouvoir seulement démontrer que le mécanisme 2/4 fonctionne. **Conséquence pratique : avec les
  données réellement disponibles aujourd'hui, Force ne peut jamais atteindre `retenue_faible` — au
  mieux `suspectee` (1 preuve évaluable et déficitaire).** Cette limite n'est écrite nulle part à
  destination du praticien.
- **Peut-il comprendre le résultat ?** Partiellement pour « Force globale déficitaire » (quand ça
  arrive — rarement, voir ci-dessus) ; la localisation segmentaire (« groupe musculaire concerné »)
  EST montrée (`contributeurPrincipal`, ex. « Quadriceps ») mais reste au niveau du système, jamais
  du test CLI précis ni de sa valeur.

### PUISSANCE

- **Diagnostic strict 2/2** : `cmj_peak_power` (largement normé) + `slcmj_peak_power` (ou 3
  substituts). **`slcmj_peak_power` et ses 3 substituts n'ont aucune norme, ni NORMS ni THRESHOLDS,
  nulle part dans le fichier** — confirmé par grep exhaustif.
- **Conséquence directe, documentée dans le moteur lui-même** (`limitations`, jamais lue en dehors) :
  Puissance est **structurellement toujours `non_determinable`** avec des données réelles
  aujourd'hui, quelle que soit la qualité des mesures saisies pour `cmj_peak_power` seul.
- **Le praticien peut-il comprendre pourquoi le diagnostic est non déterminable ?** Non — le message
  affiché (`csm.qualities['Puissance']` non déterminable, suffixe optionnel « données normatives
  insuffisantes ») ne nomme jamais `slcmj_peak_power` ni n'explique qu'aucune norme n'existe pour la
  seconde preuve requise. La limitation *existe déjà, rédigée en français, dans le moteur* — elle
  n'est simplement jamais lue par l'UI ou le PDF.

### EXPLOSIVITÉ

- **Diagnostic strict 2/2** : `cmj_conc_rfd` + `cmj_conc_impulse_100` — **aucune norme (ni NORMS ni
  THRESHOLDS) pour ces deux clés, nulle part dans le fichier**, confirmé par grep exhaustif.
- Comme pour Puissance, la limitation est **normative, réelle et honnêtement documentée dans le
  moteur** — jamais présentée comme un résultat « normal ». Mais elle non plus n'est jamais expliquée
  au praticien avec les noms précis des deux variables manquantes ; le message reste générique.
- Risque additionnel identifié (Partie 6/8) : le registre VAR_REL3 (onglet « Variables ») étiquette
  `cmj_conc_rfd` « Determinante » pour Explosivité **et** Puissance, sans aucune mention de son
  absence totale de norme — un praticien consultant cet onglet seul pourrait croire cette variable
  opérante alors qu'elle ne l'est jamais aujourd'hui.

### RÉACTIVITÉ

- **Diagnostic** : `dj_rsi` + `sldj_rsi`, 2 mécanismes réellement indépendants (contrairement à
  Force/Puissance, ces deux clés SONT normées largement — Réactivité est l'une des qualités les plus
  solides du système).
- **Confirmation/Explication (CMJR, Repeated Hop)** : correctement gelées comme jamais génératrices —
  décision clinique explicite, documentée, respectée. Mais toutes deux **structurellement inertes**
  (aucun seuil), donc le support ne dépasse jamais « faible » en pratique — limite de données, pas
  une exception clinique comme Mobilité, mais le résultat final (support toujours faible) est
  identique visuellement pour le praticien, qui ne peut pas distinguer les deux cas.
- **Peut-il comprendre le résultat ?** Oui pour le « quoi » (2 tests clairs, DJ/SLDJ, RSI) ; non pour
  le « pourquoi le support ne progresse jamais au-delà de faible ».

### ABSORPTION (qualité prioritaire de cet audit)

- **Sous-domaines réellement implémentés** : A/Core (`braking_rfd`+`force_zero_vel`, seul générateur
  du diagnostic), B/Capacité excentrique (`ecc_mean_power`+`ecc_peak_vel`, explicatif), C/Stratégie
  (`depth`+`braking_duration`, explicatif), D/Absorption réactive (`dj_rsi`+`dj_contact_time`,
  explicatif — réutilise en lecture seule le même `dj_rsi` que Réactivité, avec un rôle différent,
  jamais expliqué au praticien).
- **Sous-domaine E (Réception/Impact)** : explicitement **NON implémenté** — `available:false,
  reason:'aucun_seuil_disponible'` — jamais de seuil inventé pour compenser, conformément à la règle
  du projet. Correctement documenté dans `limitations`.
- **Vérification TTS** : confirmée définitivement — **aucune ligne de code exécutable dans
  `computeHypAbsorption01` ni ses 5 fonctions auxiliaires ne lit une clé `tts`**. Les seules
  occurrences de « tts » dans ces ~260 lignes sont deux commentaires documentant précisément
  pourquoi le sous-domaine E (qui aurait pu en dépendre) n'est PAS implémenté. La règle « TTS reste
  Stabilisation, jamais Absorption » est donc déjà strictement respectée dans le code — pas
  seulement en intention.
- **CONSTAT CENTRAL, LE PLUS IMPORTANT DE CET AUDIT** : le moteur expose un objet `sousDomaines`
  complet (A à E, avec chaque variable et son statut) sur le retour de `computeHypAbsorption01()`,
  stocké intact sur `fSc['Absorption'].hypAbs01.sousDomaines` — **mais cet objet n'est lu par aucun
  code ExpertView, aucun `buildSportifReport`, aucun `buildExpertReport`**, confirmé par recherche
  exhaustive (`grep` de `sousDomaines`/`capaciteExcentrique`/`absorptionReactive` dans tout le
  fichier : chaque occurrence est interne au moteur lui-même). Vérifié aussi par génération réelle
  de PDF sur un scénario Absorption déficitaire (freinage) : aucune mention de « freinage »,
  « capacité excentrique », « stratégie » liée à Absorption dans le document généré. (Le mot
  « excentrique » apparaît bien dans le PDF, mais dans la phrase d'orientation générique et
  invariante `ORI['Absorption']` : « Améliorer le contrôle excentrique et la dissipation des
  contraintes mécaniques » — identique quel que soit le sous-domaine réellement en cause, donc sans
  valeur diagnostique différenciante.)
- **Nuance à noter** : il existe par ailleurs une vue « Fil de Raisonnement »/section « Mouvement »
  (biomécanique par phase de CMJ, moteurs distincts issus des tâches #71-96) qui utilise un
  vocabulaire proche (« Freinage », « Réception ») — mais il s'agit de **phases de mouvement**
  calculées par un moteur biomécanique entièrement différent, jamais de `hypAbs01.sousDomaines`. La
  coïncidence lexicale n'est pas une contradiction actuelle, mais crée un risque de confusion latent
  (deux systèmes indépendants employant un vocabulaire voisin pour des concepts voisins mais non
  identiques) à surveiller.
- **Peut-il comprendre « Le déficit porte sur la capacité de freinage » plutôt que juste « Absorption
  déficitaire » ?** Non, aujourd'hui, jamais — malgré que cette information soit déjà calculée à
  100 % et prête à afficher.

### STABILISATION

- **6 mécanismes diagnostiques** : SLS (agrégat de 7 KPI), EO, EF, Strobo (surfaces), Landing
  unilatéral/bilatéral (TTS). Règle ≥2/6 déficients pour `retenue_faible`.
- **CONSTAT** : SLS/EO/EF/Strobo n'ont **aucune norme (ni NORMS ni THRESHOLDS) nulle part** —
  confirmé par grep exhaustif des deux objets. **Seuls les 2 mécanismes Landing sont aujourd'hui
  jamais classifiables** parmi les 6 documentés — donc `retenue_faible` nécessite que les 2 seuls
  mécanismes réellement opérants soient TOUS DEUX déficients (le mécanisme prévu pour 6 sources
  indépendantes fonctionne aujourd'hui avec seulement 2).
- **Distinction utilisé/disponible-mais-inutilisé/manquant** : le code **ne distingue pas** ces 3
  états — « test actif mais aucun seuil » et « test jamais entré » aboutissent tous deux au même
  `status:'indisponible'`. Cette distinction n'existe que dans les commentaires du code, jamais dans
  la donnée elle-même ni dans l'UI.
- **Peut-il comprendre ce qui a généré le diagnostic ?** Partiellement — les 2 mécanismes Landing,
  quand ils sont seuls responsables, restent visibles comme test réalisé, mais rien ne signale au
  praticien que SLS/EO/EF/Strobo, même saisis, ne comptent jamais.

### ENDURANCE

- **6 mécanismes diagnostiques** : `heel_raise_reps` + 5 KPI Repeated Hop
  (`repeated_hop_n_hops`, `repeated_hop_rsi_fatigue`, `repeated_hop_height_fatigue`,
  `repeated_hop_ct_drift`, `repeated_hop_stiffness_fatigue`). Règle : 0 évaluable →
  `non_determinable` ; 1 déficient → `suspectee` ; ≥2 → `retenue_faible`.
- **CONSTAT** : seul `heel_raise_reps` a une norme (`THRESHOLDS`) — **aucun des 5 KPI Repeated Hop,
  ni les 9 confirmatives, n'a de norme nulle part**, confirmé par grep exhaustif. Documenté
  explicitement dans le moteur (« retenue_faible structurellement inatteignable avec des données
  réelles »).
- **Le praticien comprend-il pourquoi un signal peut être suspecté mais le diagnostic rester non
  déterminable ?** La distinction `suspectee` vs `non_determinable` vs confirmé EST correctement
  visible dans l'UI (badges/labels distincts, `CSM_STATE_LABEL`) — c'est un point positif clair. Ce
  qui manque : la raison précise (norme manquante sur 5 des 6 mécanismes) n'est jamais nommée.

---

## 6. Sous-domaines : audit

Seule **Absorption** possède une architecture de sous-domaines explicite (A-E). Elle est **calculée
en entier et invisible en entier** (Partie 5, Absorption). Les 7 autres qualités n'ont pas de
sous-domaines au sens strict, mais Force a un équivalent fonctionnel à deux niveaux (Global/
Segmentaire) — celui-ci **est partiellement visible** (le système contributeur, ex. « Quadriceps »,
apparaît), contrairement à Absorption dont rien n'apparaît. C'est une incohérence de traitement entre
deux qualités ayant toutes deux une structure interne riche : Force expose au moins un niveau
grossier de son détail interne, Absorption n'en expose aucun.

---

## 7. Variables explicatives — audit

Question centrale : une fois le diagnostic posé, Kinexus donne-t-il assez d'information pour
comprendre le mécanisme ?

Réponse uniforme sur les 8 qualités : **les variables explicatives sont correctement CALCULÉES et
correctement JAMAIS transformées en diagnostic (aucune violation de la règle "explicatif ≠ cause"
trouvée) — mais elles ne sont quasiment JAMAIS INTERPRÉTÉES ni RELIÉES au diagnostic dans le texte
présenté au praticien.** L'unique fonction conçue pour ce rôle précis, `csmCapaciteStrategieNote()`
(qui produirait une phrase du type « associé à des éléments compatibles avec une limitation de
capacité (force maximale) »), existe, est correctement hedgée, mais :
- ne couvre que Puissance et Explosivité (retourne `null` sans condition pour les 6 autres qualités) ;
- et pour ces deux-là, elle est **mathématiquement inatteignable aujourd'hui** — elle exige que la
  qualité soit `objectified`, ce que Puissance/Explosivité ne peuvent structurellement jamais devenir
  (Partie 5). C'est donc du code mort en pratique, jamais exécuté avec des données réelles
  actuelles.

Exemple concret vérifié (Absorption, scénario synthétique avec `ecc_mean_power`/`ecc_peak_vel`
délibérément dégradés en plus du diagnostic) : le PDF généré affiche « Absorption déficitaire »,
puis l'orientation générique « Améliorer le contrôle excentrique… » — **jamais** la phrase attendue
par la mission, « capacité excentrique réduite pouvant contribuer au déficit observé », alors que la
donnée `ecc_peak_vel` était bien classifiée `rouge` par le moteur au moment du calcul.

---

## 8. Variables orphelines — audit

Classification A (rôle documenté et utilisé) / B (documenté mais non affiché) / C (disponible, rôle
non déterminé) / D (réellement orpheline), consolidée à partir des 4 rapports factuels :

| Catégorie | Exemples représentatifs (liste non exhaustive, voir Partie 5 par qualité pour le détail complet) |
|---|---|
| **A — utilisée, rôle affiché** | `wblt_distance`, `imtp_n`/`slimtp_n`/`iso_belt_squat_n`/`sl_iso_push_n` (valeur visible, rôle non nommé mais statut affiché via le badge de qualité), `dj_rsi`/`sldj_rsi`, `braking_rfd`/`force_zero_vel`, `landing_uni_tts`/`landing_bi_tts`, `heel_raise_reps` — leur valeur influence visiblement un badge de statut, même si le lien exact "cette variable → ce statut" n'est jamais épelé |
| **B — documentée, jamais affichée avec son rôle** | La quasi-totalité des variables confirmatives/explicatives des 8 moteurs : RFD/TTPF de Force, `cmj_height`/`capacite`/`strategie` de Puissance, `confirmative`/`biomecanique` d'Explosivité, CMJR/Repeated Hop de Réactivité, sous-domaines B/C/D d'Absorption en entier, `forceStabilisateurs`/`mobiliteCheville` de Stabilisation, `forceDeFond`/`forceSegmentaire`/`cinetique` d'Endurance. `sousDomaines` (Absorption), `precision.asymmetries` (Force), `csm.precision`, `csm.explanatoryNotes` — tous calculés, jamais lus hors de leur propre moteur/de CSM. |
| **C — disponible, rôle non déterminé** | `wblt_asymmetry` (Mobilité, `status:'non_calcule'`, mécanisme documenté mais jamais implémenté), `braking_impulse`/`braking_duration`/`dj_contact_time` (Absorption, jamais classifiables faute de seuil, mais lus « pour traçabilité ») |
| **D — réellement orpheline** | `repeated_hop_mean_stiffness` (Endurance, jamais lue par aucun moteur, aucun rôle assigné) ; `ybt_composite` (explicitement signalée par le moteur Stabilisation comme un piège à éviter — associée par un poids TFM sans jamais être lue par le moteur HYP) |

**Constat global** : la catégorie B domine très largement. Ce n'est **pas** un problème de variables
mal conçues ou inutiles — c'est un problème de **couche de présentation qui ne consomme pas la
richesse déjà produite par la couche de raisonnement.**

---

## 9. Informations perdues — audit

Chaîne `TEST → VARIABLE → HYP → CSM → UI → PDF` vérifiée qualité par qualité. Le point de perte est
**systématiquement le même** : entre **HYP** (où l'information existe, correctement structurée) et
**CSM/UI/PDF** (où elle est réduite à un statut + une phrase générique par qualité). CSM lui-même ne
perd presque rien de ce que HYP lui donne au niveau qualité (`objectified`/`nonDeterminable`/
`suspected`/relations) — le problème est en amont de CSM : **les moteurs HYP ne transmettent même pas
leurs champs `precision`/`explanatoryEvidence`/`limitations`/`sousDomaines` à `computeHypClinicalSynthesis01`**
au niveau de détail nécessaire, à l'exception de `precision` qui EST recopié dans `csm.precision`
mais ensuite jamais lu en aval. Donc la perte a lieu à deux endroits distincts :
1. **HYP → CSM** : `sousDomaines` (Absorption) n'est jamais transmis à CSM du tout.
2. **CSM → UI/PDF** : `csm.precision` et `csm.explanatoryNotes` SONT transmis par CSM mais jamais lus
   par la couche de présentation (confirmé par grep : zéro occurrence de `csm.precision`/
   `.explanatoryNotes` hors de leur propre définition).

---

## 10. Relations inter-qualités — audit

`HYP_QUALITY_RELATIONS` contient 8 relations documentées (Force→Puissance, Force→Explosivité,
Force→Endurance, Force→Stabilisation, Puissance→Explosivité, Explosivité→Puissance, Mobilité→
Stabilisation, Réactivité→Endurance). Chacune précise la ou les variables qui la soutiennent (`via`).
Vérifié via scénario réel (Mobilité+Stabilisation, toutes deux objectivées) : la relation est
correctement détectée, la narrative produite (`csm.explanatoryHypotheses`) est bien hedgée : « Le
déficit de Mobilité constitue une hypothèse explicative possible du déficit de Stabilisation
(wblt_distance…), sans en établir la cause. » — **exactement la formulation attendue**, jamais «
cause ». Ce mécanisme fonctionne bien et communique correctement le "pourquoi cette relation est
pertinente" (la variable `via` est citée dans le texte). C'est le seul endroit de tout le logiciel où
une variable précise (`wblt_distance`) est explicitement nommée dans le texte final présenté au
praticien — un signal encourageant qui montre que le problème des Parties 3/7/8 est résoluble avec le
même schéma.

**Limite non corrigible sans nouvelle règle (documentée, non implémentée)** : aucune relation
n'implique Absorption. Étant donné qu'Absorption est la qualité prioritaire de cet audit et que ses
sous-domaines (capacité excentrique, stratégie) recoupent conceptuellement Force et Puissance, une
future relation HYP_QUALITY_RELATIONS impliquant Absorption pourrait avoir de la valeur clinique —
**DÉCISION CLINIQUE À VALIDER, non implémentée ici.**

---

## 11. Asymétries — audit

Vérifié qu'aucune formulation n'énonce automatiquement « déficit d'absorption » à partir d'une seule
asymétrie — le mécanisme d'asymétrie (`computeAsymEngine`, précision uniquement) reste séparé du
Niveau 1 pour toutes les qualités concernées (Force, Absorption, Réactivité/`sldj_lsi`, Stabilisation
LSI intrinsèque). La règle « l'asymétrie ne doit jamais remplacer le diagnostic principal » est bien
respectée structurellement — chaque `precision`/`asymetrie` est un champ séparé, jamais fusionné dans
`state`/`status`. **Mais, comme les autres champs de précision, ces données sont calculées puis jamais
lues par la couche de présentation** (à l'exception de `sldj_lsi`/`wblt_lsi` visibles génériquement
comme LSI% dans les cartes KPI) — donc l'asymétrie n'apporte aujourd'hui à peu près aucune
information *exploitable* supplémentaire au praticien, alors qu'elle ne pollue jamais non plus le
diagnostic principal. Neutre plutôt que nuisible, mais sous-exploitée.

---

## 12. Chaîne de raisonnement — reconstruction

Pour chacune des 8 qualités, la chaîne `MESURE → VARIABLE ANORMALE → CONVERGENCE → DIAGNOSTIC →
SOUS-DOMAINE → EXPLICATION → PRÉCISION → RELATIONS ÉVENTUELLES` a été vérifiée. Résultat uniforme :
les 4 premières étapes (mesure, variable anormale, convergence, diagnostic) sont **toujours
reconstructibles** en lisant le code (et produisent un statut correct et fiable) ; les 3 étapes
suivantes (sous-domaine, explication, précision) existent dans les données mais **ne sont
reconstructibles par le praticien qu'en lisant le code source** — jamais depuis l'UI ou le PDF ;
la dernière étape (relations) fonctionne bien mais seulement pour les 8 paires documentées, et
uniquement quand les deux qualités concernées sont simultanément objectivées (rare en pratique compte
tenu des Parties 3/5).

---

## 13. 12 profils cliniques synthétiques testés

Exécutés sur le pipeline réel (`computeMoteur()`). Résultats bruts (état HYP, CSM, ce que voit le
praticien, ce qui manque) :

**Profil 1 — Tout normal** (aucune donnée) : les 8 qualités `non_determinable`/`absente` selon le cas
(0 test entré). CSM : 8/8 non déterminables. Praticien : voit correctement « aucun déficit
objectivé », comprend qu'aucune conclusion n'est possible faute de données. *Rien ne manque —
comportement honnête et attendu.*

**Profil 2 — Force avec localisation segmentaire** : tentative avec `imtp`+`iso_belt_squat`+
`knee_ext` délibérément dégradés — **résultat : Force reste `non_determinable`** malgré des valeurs
saisies nettement anormales, parce qu'`imtp_n` n'a aucune norme et qu'aucune population ne couvre
2 tests globaux à la fois (Partie 5, Force). *Manque : aucune indication au praticien que le problème
est normatif, pas clinique — il pourrait légitimement penser que ses données sont insuffisantes plutôt
que de savoir que le système ne peut structurellement pas conclure ici.*

**Profil 3 — Puissance déficitaire** : `cmj`+`slcmj` avec `peak_power` bas — **résultat :
`non_determinable`**, confirmant Partie 5 (Puissance). CSM : « non déterminable ». *Manque :
`slcmj_peak_power` non normé, jamais nommé.*

**Profil 4 — Explosivité déficitaire** : `cmj_conc_rfd`/`cmj_conc_impulse_100` bas — **résultat :
`non_determinable`**, confirmant Partie 5. *Même manque.*

**Profil 5 — Réactivité déficitaire** : `dj_rsi`+`sldj_rsi` bas — **résultat : `retenue_faible`,
statut rouge, CSM objectified=["Réactivité"]**. Fonctionne bien ; praticien comprend le « quoi » ;
« pourquoi » limité au support « faible » sans plus de détail (CMJR/Repeated Hop jamais mobilisables).

**Profil 6 — Absorption déficitaire par freinage** : `braking_rfd`+`force_zero_vel` bas — **résultat :
`retenue_faible`, rouge, CSM objectified=["Absorption"]**. PDF généré et inspecté : mention
"Absorption" uniquement, aucune mention de « freinage » lié au diagnostic (seule l'orientation
générique invariante mentionne « excentrique »). *Manque confirmé : le sous-domaine réel (freinage,
sous-domaine A) n'est jamais nommé, alors qu'il est connu du moteur.*

**Profil 7 — Absorption + capacité excentrique explicative** : même scénario + `ecc_mean_power`/
`ecc_peak_vel` dégradés — **résultat : statut identique au Profil 6, aucune différence de texte
produite** malgré que le moteur ait calculé un `ecc_peak_vel` rouge. *Confirme précisément la faille
centrale (Partie 5/7) : deux scénarios cliniquement différents (freinage seul vs freinage + capacité
excentrique réduite) produisent un texte strictement identique au praticien.*

**Profil 8 — Stabilisation déficitaire** : `landing_uni`+`landing_bi` (TTS) dégradés — **résultat :
`retenue_faible`, rouge, CSM objectified=["Stabilisation"]**. Fonctionne bien pour le mécanisme
Landing (le seul réellement opérant aujourd'hui) ; le praticien ne peut pas savoir que SLS/EO/EF/
Strobo, même saisis, n'auraient jamais compté.

**Profil 9 — Endurance suspectée** : `heel_raise` D=5/G=null (asymétrie D/G, un seul côté évaluable)
— **résultat : `suspectee`, jaune, CSM.suspected=["Endurance"]**. Fonctionne comme attendu ; message
`csmSuspectedNote` correctement hedgé (« un premier signal existe… convergence pas suffisante »).

**Profil 10 — Plusieurs déficits avec relation (Mobilité + Stabilisation)** : les deux qualités
objectivées rouge, relation HYP_QUALITY_RELATIONS détectée — **résultat : narrative correcte et
hedgée** (Partie 10). C'est le cas de figure le mieux traité par tout le système.

**Profil 11 — Plusieurs déficits sans relation (Force + Explosivité)** : tentative — **résultat :
les deux qualités restent `non_determinable`** avec les données saisies (mêmes limites normatives que
Profils 2/4 cumulées) ; aucune relation ne peut donc même être testée dans ce cas puisqu'aucune des
deux qualités n'est objectivée. *Illustration supplémentaire que les limites normatives des Parties 3/5
empêchent aussi, en cascade, de tester correctement les scénarios multi-qualités les plus courants
dans un cabinet réel (Force et Explosivité sont deux qualités très demandées).*

**Profil 12 — Nombreuses mesures, plusieurs non déterminables** : CMJ/SLCMJ richement rempli (peak
power, conc_rfd, conc_impulse_100) — **résultat : Puissance ET Explosivité restent `non_determinable`**
malgré un volume de données important, confirmant que le volume de données n'est jamais le facteur
limitant pour ces deux qualités — seule l'absence de norme l'est. *Risque réel : un praticien qui
constate « j'ai pourtant tout saisi » sans comprendre pourquoi le système ne conclut jamais.*

---

## 14. Test praticien (3 questions)

Appliqué systématiquement sur les 12 profils ci-dessus :

- **Q1 « Qu'est-ce qui est déficitaire ? »** — Réponse immédiate et fiable dans tous les cas où un
  diagnostic existe (badges, Synthèse clinique). **Toujours répondable.**
- **Q2 « Pourquoi le logiciel dit-il cela ? »** — Répondable pour la qualité globale
  (« objectivé par HYP-XXX-01 ») mais **jamais** au niveau de la variable ou du sous-domaine précis
  (Parties 3, 5, 13). **Systématiquement incomplète.**
- **Q3 « Qu'est-ce que je dois regarder ensuite ? »** — Répondable de façon générique (orientation
  standard par qualité, ex. « Renforcer les capacités de production de force maximale ») mais jamais
  reliée aux tests/variables qui ont concrètement généré CE diagnostic précis (pas de retour
  variable → test). **Partiellement répondable.**

---

## 15. Score d'explication par qualité déficitaire

Barème : 0=aucune, 1=diagnostic visible mais explication insuffisante, 2=explication partielle,
3=explication cliniquement exploitable. **Score non modifié artificiellement — reflète l'état réel.**

| Qualité | Score | Justification courte |
|---|---|---|
| Mobilité | 2 | Un seul mécanisme, honnêtement présenté ; peu à expliquer par conception (pas un manque logiciel) |
| Force | 1 | Diagnostic quasi inatteignable aujourd'hui (normes) ; localisation segmentaire système-level seulement |
| Puissance | 1 | Structurellement toujours non déterminable ; raison jamais nommée |
| Explosivité | 1 | Idem Puissance |
| Réactivité | 2 | Diagnostic clair et fiable ; explication mécanistique jamais enrichie (données inertes) |
| Absorption | 1 | Diagnostic clair mais sous-domaine (freinage/excentrique/stratégie/réactive) 100% invisible malgré calcul complet |
| Stabilisation | 1 | Diagnostic reposant sur 2 mécanismes sur 6 documentés, sans que cela soit su du praticien |
| Endurance | 1 | Diagnostic quasi toujours suspectee/non_determinable ; raison jamais nommée |

**Moyenne : 1,25/3 — explication insuffisante de façon large et homogène, pas isolée à une
qualité.**

---

## 16. Surinterprétation — recherche

Recherche exhaustive des formulations interdites (« cause », « responsable », « entraîne »,
« principalement dû à », « origine », « facteur causal ») dans tout `index.html`.

- **Aucune occurrence** dans le texte actuellement affiché par défaut (UI ou PDF) pour un praticien
  qui n'a pas explicitement édité ses priorités.
- `buildMultiQualityNarrative()` respecte strictement les 3 niveaux (constat seul / hypothèse
  explicative hedgée / déficits concordants sans lien) — vérifié par lecture complète, formulation «
  sans en établir la cause » présente explicitement dans le code.
- **Résidu identifié (MODÉRÉ)** : le registre legacy `HYPO[fn]` (« semble principalement influencé
  par… ») existe toujours dans le code et **pré-remplit** la valeur initiale du champ éditable
  « Pourquoi ? » dans « Modifier le rapport » (`h('textarea',{value:p.hypothese,...})`). Il n'est
  jamais affiché par défaut nulle part ailleurs (confirmé — tous les autres points de consommation
  sont gatés par `prioCardOverridden` ou routés vers `csmSafeQualityNote`). Un praticien qui ouvre
  cet écran d'édition et ne modifie pas ce champ avant de valider pourrait donc réintroduire, sans le
  vouloir, une formulation causale non hedgée dans son propre rapport édité. Risque réel mais limité
  (nécessite une action explicite du praticien, et l'écran est clairement un écran d'édition
  manuelle, pas une sortie automatique).

---

## 17. Sous-interprétation — recherche

C'est le constat central de cet audit (Parties 3, 5, 7, 13). Résumé : Kinexus **possède l'information
et refuse correctement de la déformer**, mais **échoue à la transmettre**. Cas les plus flagrants,
classés par sévérité :

1. **Absorption** : sous-domaines A-E calculés à 100 %, transmis à 0 % (CRITIQUE).
2. **Puissance/Explosivité/Endurance** : raison précise du `non_determinable` structurel (variable
   manquante nommée) calculée à 100 %, transmise à 0 % (CRITIQUE × 3).
3. **Force** : limite structurelle de convergence (aucune population ne couvre 2/4) invisible
   (CRITIQUE).
4. **Stabilisation** : 4 des 6 mécanismes documentés silencieusement inertes (IMPORTANT).
5. **Toutes les qualités** : variables explicatives calculées mais jamais reliées en prose au
   diagnostic (IMPORTANT, transversal).

---

## 18. Non déterminable — vérification

Vérifié systématiquement (12 profils + lecture de `CSM_STATE_LABEL`, `csmSafeQualityNote`,
`csmSuspectedNote`) : `non_determinable` n'est **jamais** confondu avec `normal` — chaque qualité non
déterminable reste hors de `objectified`/`suspected`, avec un texte dédié (« Non déterminable avec
les données actuellement disponibles… non déterminable n'équivaut jamais à normal »). `suspectee` et
`non_determinable` restent deux états visuellement et textuellement distincts (`CSM_STATE_LABEL`
distinct, badges de couleur différents jaune/gris). **Ce point, explicitement demandé par la
mission, est correctement traité — aucun problème trouvé.**

---

## 19. Audit UI

Les 10 onglets ExpertView ont été audités (Fonctions, Synthèse clinique, Résultats, Variables,
Capacités, Systèmes, Hypothèses, Orientations, Couverture, Raisonnement). Constat transversal :
**trois registres coexistent sans être réconciliés** :
1. Le registre HYP/CSM natif (onglets Synthèse clinique, Hypothèses, Orientations) — correct, hedgé,
   mais peu détaillé au niveau variable.
2. Le registre TFM/VAR_REL3 (onglets Fonctions, Variables) — riche en détail variable-à-variable mais
   **indépendant** du rôle HYP réel (Partie 1, résumé exécutif — mésalignement documenté pour
   Puissance/Explosivité).
3. Le registre référentiel statique (onglets Capacités, Raisonnement, `STR_QUAL_DETAIL`/
   `CAPACITES_DATA`) — non spécifique au bilan du patient courant, contribution/confiance/spécificité
   génériques par système, pas par variable individuelle du patient.

Un praticien naviguant entre ces onglets ne trouve **nulle part** la synthèse qui relierait
explicitement : « ce statut Absorption vient de CETTE valeur de braking_rfd (rouge) ET CETTE valeur
de force_zero_vel (rouge), et est explicable en partie par CETTE valeur de ecc_peak_vel (rouge) ».
Chaque brique existe séparément ; aucune vue ne les assemble.

---

## 20. Audit PDF

Lu comme un praticien externe (PDF sportif ET expert générés réellement pour plusieurs scénarios) :
lisibilité, hiérarchie et cohérence UI/PDF **bonnes** (confirmé lors des missions précédentes) — le
document reste court, bien structuré, sans jargon interne visible (`undefined`, enums bruts — déjà
corrigés). Le problème n'est **pas** de forme mais de **fond** : pour chaque qualité déficitaire, la
question « Pourquoi cette qualité est-elle déficitaire ? » reçoit la même réponse générique
qu'à l'écran (Partie 17). Longueur/densité : appropriées, pas de répétition excessive trouvée.
Cohérence UI/PDF : **confirmée** — les deux consomment les mêmes fonctions de présentation
(`csmSafeQualityNote`, `CSM_STATE_LABEL`), donc racontent la même histoire, aussi incomplète
soit-elle des deux côtés de façon identique (pas de divergence UI/PDF trouvée).

---

## 21. Bugs de rendu — recherche

Recherche active de `undefined`/`null`/`NaN`/enums internes/textes anglais/incohérences dans les
sorties générées lors de cet audit : **aucune nouvelle occurrence trouvée** — les corrections des
missions précédentes (badges `undefined`, `CSM_STATE_LABEL`) tiennent. Aucun bug de rendu détecté
dans cette mission.

---

## 22. Première page (PDF)

La première page (profil global, priorités, synthèse) permet de comprendre le profil général du
patient — statut par qualité visible, déficits objectivés listés (Partie 5/13, confirmé
visuellement lors des missions précédentes). Ce qu'elle ne permet **jamais** de comprendre, même en
lisant l'intégralité du document : le mécanisme précis derrière chaque déficit (Parties 3, 17). Ce
n'est pas spécifique à la première page — c'est vrai de tout le document.

---

## 23. Problèmes classés

| # | Problème | Classification | Corriger maintenant / lot suivant / ne pas corriger |
|---|---|---|---|
| 1 | Sous-domaines Absorption (A-E) calculés, jamais affichés | **CRITIQUE** | Lot suivant — changement de présentation pur (lecture de `sousDomaines`), aucune règle clinique nouvelle |
| 2 | Puissance/Explosivité structurellement toujours `non_determinable`, raison précise jamais nommée | **CRITIQUE** | Lot suivant — afficher les `limitations`/`.note` déjà rédigées par le moteur |
| 3 | Force : convergence 2/4 quasi inatteignable avec les données réelles actuelles, jamais expliqué | **CRITIQUE** | Documentation + lot suivant pour l'affichage ; la question de fond (faut-il revoir la règle 2/4 ou les normes ?) est une **DÉCISION CLINIQUE À VALIDER**, non traitée ici |
| 4 | Endurance : 5 des 6 mécanismes structurellement inertes, jamais expliqué | **IMPORTANT** | Lot suivant, même traitement que #2 |
| 5 | Stabilisation : 4 des 6 mécanismes structurellement inertes, jamais expliqué | **IMPORTANT** | Lot suivant |
| 6 | Registre TFM/VAR_REL3 (onglet Variables) non réconcilié avec les rôles HYP réels (ex. « Determinante » pour une variable jamais génératrice) | **IMPORTANT** | Lot suivant — a minima un avertissement/légende ; réconciliation complète = DÉCISION CLINIQUE À VALIDER |
| 7 | `hypEvidenceRoleForTest` fusionne diagnostic/confirmative en un seul label | **IMPORTANT** | Lot suivant si un affichage plus fin est souhaité |
| 8 | `csm.precision`/`csm.explanatoryNotes` calculés, jamais lus | **IMPORTANT** | Lot suivant — donnée déjà prête |
| 9 | Résidu `HYPO[fn]` causal comme valeur de pré-remplissage de l'éditeur | **MODÉRÉ** | Lot suivant (remplacer la valeur de seed par `csmSafeQualityNote`, laisse l'édition manuelle intacte) |
| 10 | Distinction "testé sans norme" vs "jamais entré" absente dans `status:'indisponible'` (Stabilisation notamment) | **MODÉRÉ** | Lot suivant si jugé utile |
| 11 | Asymétries/précision calculées mais quasi jamais lues | **MODÉRÉ** | Lot suivant, priorité basse (neutre, non nuisible) |
| 12 | Vocabulaire "Mouvement"/CMJ-phase proche du vocabulaire des sous-domaines Absorption sans être la même donnée | **MINEUR** | Surveiller ; ne pas corriger sans besoin démontré |
| 13 | Suffixe "données normatives insuffisantes" trop générique (ne nomme pas la variable) | **MINEUR** | Lot suivant, faible priorité |
| 14 | Relation HYP_QUALITY_RELATIONS absente pour Absorption | **OPPORTUNITÉ** | Ne pas corriger ici — DÉCISION CLINIQUE À VALIDER |
| 15 | `csmCapaciteStrategieNote` code mort pour Puissance/Explosivité (inatteignable aujourd'hui) | **OPPORTUNITÉ** | Laisser en l'état, deviendra utile si des normes sont ajoutées |

---

## 24. Recommandations

Toutes les recommandations ci-dessous sont des **changements de présentation additifs** (lire des
champs déjà calculés, jamais recalculer/réinterpréter) — cohérentes avec la contrainte de cette
mission (audit uniquement, aucune implémentation) :

1. Afficher `hypAbs01.sousDomaines` (au moins le sous-domaine A/Core, responsable du diagnostic, et
   tout sous-domaine B/C/D dont au moins une variable est `rouge`/`orange`) dans la Synthèse clinique
   et le PDF pour Absorption.
2. Remplacer les phrases génériques de `non_determinable` par les `limitations`/`.note` déjà rédigées
   par chaque moteur (Puissance, Explosivité, Endurance, Force) — texte déjà écrit, jamais lu.
3. Documenter clairement, pour le praticien (dans les limitations de la Synthèse clinique), que
   Force/Puissance/Explosivité/Endurance/Stabilisation ont aujourd'hui une couverture normative
   partielle qui plafonne structurellement leur diagnostic — transparence plutôt que silence.
4. Corriger le texte de pré-remplissage de l'éditeur de priorités pour utiliser `csmSafeQualityNote`
   au lieu du texte causal `HYPO[fn]`.

**Aucune de ces recommandations n'implique de modifier un seuil, une norme, une règle de convergence,
un rôle diagnostique/confirmatif, ou une relation HYP.** Conformément à l'instruction de la mission,
**rien n'a été implémenté** — cette liste est fournie pour une mission ultérieure explicite.

---

## 25. Verdict final

« Kinexus ne se contente-t-il pas de dire QUOI est déficitaire, mais permet-il réellement de
comprendre POURQUOI ? »

**Verdict : C — NON, le diagnostic est correct mais l'explication est insuffisante.**

Justification : sur les 8 qualités, aucune fausse certitude ni faux normal n'a été trouvé dans le
texte affiché par défaut (surinterprétation/sous-interprétation systématiquement recherchées, Parties
16-18) — le raisonnement interne des 8 moteurs HYP est rigoureux, honnête sur ses limites, et
correctement séparé en diagnostic/confirmation/explication/précision. Mais cette rigueur **s'arrête à
la frontière du moteur** : sur les 8 qualités, 5 (Force, Puissance, Explosivité, Stabilisation,
Endurance) souffrent aujourd'hui d'une limitation structurelle normative jamais expliquée au
praticien, et la qualité prioritaire de cet audit (Absorption) calcule un découpage clinique détaillé
en 4 sous-domaines qui n'atteint jamais l'utilisateur final. Le score moyen d'explication (1,25/3)
reflète un système qui **sait** mais **ne dit pas** — pas un système qui se trompe. C'est un problème
structurel de présentation, homogène sur l'ensemble des 8 qualités plutôt que localisé, mais
entièrement réparable par des changements additifs de lecture de données déjà existantes, sans
toucher au raisonnement clinique lui-même.

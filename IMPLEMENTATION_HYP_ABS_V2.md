# Implémentation — HYP-ABS-01 V2 dans Kinexus

**Statut** : implémenté et branché en production dans `index.html`. Ce n'est plus un prototype
silencieux ni un Shadow Mode — `fSc['Absorption']` (sortie de `computeMoteur()`) est désormais
produit par le raisonnement clinique HYP-ABS-01 V2, pas par la boucle TFM générique.

Source de vérité clinique : `HYP-ABS-01_V2.md` / `HYP_ABS01_V2_CHANGELOG.md`. Ce document ne
rouvre aucune décision clinique déjà validée — il documente ce qui a été réellement construit, où,
et une dépendance inattendue découverte pendant l'implémentation (non improvisée, voir §"Dépendance
inattendue").

---

## 1. Fichiers modifiés

- **`index.html`** — seul fichier de production modifié. Purement additif : **+151 lignes, 0
  suppression** (`git diff --stat`). Deux insertions, aucune autre ligne touchée :
  1. Un nouveau bloc de fonctions (`computeHypAbsorptionCore`, `computeHypAbsorptionCapaciteEcc`,
     `computeHypAbsorptionStrategie`, `computeHypAbsorptionReactive`,
     `computeHypAbsorptionReceptionImpact`, `computeHypAbsorptionAsymetrie`,
     `computeHypAbsorption01`), inséré juste avant `function computeMoteur(...)`.
  2. Un bloc de 20 lignes inséré **à l'intérieur** de `computeMoteur()`, immédiatement après la
     fermeture de `FUNCTIONS.forEach(...)` et avant `var sysSc={}`, qui remplace `fSc['Absorption']`
     par le résultat de `computeHypAbsorption01(...)` quand celui-ci est déterminable.

## 2. Fichiers créés

- **`tests/hypAbsorption01.test.js`** — 17 tests, extension du moteur réellement intégré dans
  `index.html` (pas un fichier séparé non chargé, contrairement à `hyp_engine_lot1.js` pour
  HYP-MOB-01 — voir §"Décision d'architecture : pas de fichier `.js` séparé").
- Ce document (`IMPLEMENTATION_HYP_ABS_V2.md`).

Aucun autre fichier créé ou modifié.

## 3. Décision d'architecture : pas de fichier `.js` séparé

`index.html` est une application mono-fichier : il ne charge localement aucun script externe (les
deux seuls `<script src=...>` du fichier pointent vers le CDN React/ReactDOM). `hyp_engine_lot1.js`
(HYP-MOB-01) suit délibérément ce même constat en sens inverse : c'est un fichier **jamais chargé**
par `index.html`, exécuté uniquement par ses tests via `eval()` — un prototype hors production, pas
une intégration réelle.

Comme cette mission demande une intégration réelle ("il ne s'agit plus d'un prototype silencieux"),
le moteur HYP-ABS-01 V2 est écrit **directement dans `index.html`**, au même titre que
`computeMoteur()`, `applyThr()`, `computeAsymEngine()`, etc. Créer un fichier séparé chargé via
`<script src="hyp_engine_abs01.js">` aurait introduit la première dépendance de chargement de
fichier local de tout le projet — un changement d'architecture de déploiement non anodin
(l'application cesserait d'être mono-fichier) et non demandé explicitement. Cette décision n'a donc
pas été prise silencieusement : c'est la seule option cohérente avec l'architecture mono-fichier
déjà en place, signalée ici explicitement plutôt que simplement appliquée sans commentaire.

Le fichier de test réutilise la même convention `eval()` que tous les autres fichiers de
`tests/*.test.js` (extraction d'une tranche d'`index.html`), donc les 17 tests s'exécutent contre le
code réellement en production, pas contre une copie.

## 4. Cartographie des consommateurs (avant modification)

Consommateurs de `functionScores.Absorption` identifiés avant toute modification (reprend et
confirme `GAP_ANALYSIS_HYP_ABS_V2.md` §1/§10) :

| Consommateur | Lit `functionScores.Absorption` | Effet de ce changement |
|---|---|---|
| `computeMoteur()` (calcul de `priorities`, lignes suivant `FUNCTIONS.forEach`) | Oui — `deficits`/`priorities` filtrent sur `.status` | Reflète désormais le diagnostic HYP dès que déterminable — changement intentionnel, mission §19/§20 |
| `computeMouvementAnalysis()` | Reçoit `functionScores` en 4ᵉ paramètre optionnel, dégrade proprement en son absence | Fonctionne sans changement — la forme `{status,confidence,coverage,directTests,directStatuses}` est préservée à l'identique, `hypAbs01` est un champ additif ignoré par ce consommateur |
| `AnalyseView` / `ExpertView` / `Historique` / `Dashboard` (écrans) | Lisent `.status`/`.confidence`/`.coverage` pour l'affichage | Fonctionnent sans changement (même forme) ; n'affichent pas encore le détail `hypAbs01` (voir §9, hors périmètre forcé de cette mission) |
| `buildSportifReport` (PDF) | Idem | Idem |
| `reportOverrides` | Ne lit pas `functionScores.Absorption` directement (système de surcharge manuelle indépendant) | Aucun effet |
| `TFM` / `computeTestStatus` / `tSt` (testStatuses) | Ne dépendent jamais de `functionScores` (sens inverse : `functionScores` dépend de `tSt`) | Intégralement inchangés — confirmé par tests |

Aucun consommateur n'a été modifié : la forme de sortie `{status, confidence, coverage,
directTests, directStatuses}` est strictement préservée, avec un unique champ additif `hypAbs01`
(objet de traçabilité complet, ignoré par tout code qui ne le lit pas explicitement).

## 5. Ancienne logique remplacée

Avant cette mission, `fSc['Absorption']` était produit exactement comme toute autre qualité, par la
boucle générique de `computeMoteur()` (`index.html`, `FUNCTIONS.forEach`) : moyenne pondérée des
statuts de **tous** les tests ayant un poids `absorption` dans `TFM`, sans aucune distinction entre
KPI diagnostique/confirmatif/explicatif — la même architecture indifférenciée déjà documentée dans
`GAP_ANALYSIS_HYP_ABS_V2.md`. 34 tests avaient un poids `absorption` dans `TFM` (de 1 à 3), y
compris des tests de force segmentaire sans lien avec un raisonnement d'absorption clinique
(`knee_ext`, `hip_abd`, `df_iso`, etc.).

## 6. Nouvelle logique intégrée

`computeHypAbsorption01(testData, normPop, normAge)` — fonction pure, aucune dépendance externe,
n'appelle que des primitives déjà existantes :

- **Sous-domaine A (Core)** — `cmj_braking_rfd`, `cmj_force_zero_vel`, `cmj_braking_impulse`, lus
  via `resolveCmjValues()` (déjà existant, jamais dupliqué) puis `applyThr()`. Niveau 1 :
  - `non_determinable` si aucune des 2 variables classifiables (RFD/Force@0V) n'a de statut ;
  - `deficitaire` si les 2 sont déficitaires (orange/rouge) ;
  - `a_surveiller` si une seule des variables disponibles est déficitaire ;
  - `ok` sinon.
- **Sous-domaine B (Capacité excentrique)** — `cmj_ecc_mean_power`, `cmj_ecc_peak_vel`, jamais
  générateurs du Niveau 1 (explicatif seul, HYP-ABS-01_V2.md §5).
- **Sous-domaine C (Stratégie)** — `cmj_depth`, `cmj_braking_duration`, jamais générateurs.
- **Sous-domaine D (Absorption réactive)** — `dj_rsi`, `dj_contact_time`, caractérisation
  uniquement, jamais générateurs du Niveau 1 (HYP-ABS-01_V2.md §7).
- **Sous-domaine E (Réception/Impact)** — **non implémenté**, retourne
  `{available:false, reason:'aucun_seuil_disponible'}` de façon explicite. Voir §8.
- **Asymétrie** — relit `computeAsymEngine()` (déjà figé, déjà utilisé ailleurs), phase `'braking'`
  uniquement, en lecture seule, jamais générateur.

Intégration dans `computeMoteur()` : après le calcul générique de `fSc[fn]` pour toutes les
fonctions (boucle inchangée), un bloc dédié réévalue **uniquement** `fSc['Absorption']` :
- si `niveau1 !== 'non_determinable'` → `fSc['Absorption']` est entièrement remplacé (status dérivé
  de `niveau1`, `directTests:['cmj']`, `directStatuses` = statuts RFD/Force@0V disponibles,
  `hypAbs01` = objet complet pour traçabilité) ;
- sinon → le résultat TFM générique déjà calculé est **conservé tel quel** (repli documenté, jamais
  un statut inventé), avec `hypAbs01` ajouté pour traçabilité.

Aucune autre qualité (`fSc[autre_fn]`), ni `testStatuses`, `systemScores`, `rtpStatus`,
`qualityScores`, `capaciteScores` ne sont touchés — vérifié par relecture (le bloc n'écrit que
`fSc['Absorption']`) et par tests (§10).

## 7. Variables utilisées / retirées du diagnostic

| Variable | Rôle avant | Rôle après |
|---|---|---|
| `cmj_braking_rfd` | Diagnostique (déjà, mais jamais isolé du reste du test `cmj` dans TFM) | Diagnostique Core, prioritaire |
| `cmj_force_zero_vel` | Aucun rôle HYP | Diagnostique Core, prioritaire |
| `cmj_braking_impulse` | Aucun rôle HYP, KPI existant sans seuil | Lu, jamais classifié (aucun seuil — voir §8) |
| `cmj_ecc_mean_power` / `cmj_ecc_peak_vel` | Diagnostiques (V1) | Explicatifs seuls |
| `dj_rsi` | Exclu (V1) | Caractérisation sous-domaine D, jamais générateur |
| `dj_contact_time` | Confirmatif (V1), sans seuil réel | Lu, jamais classifié (aucun seuil) |
| `landing_uni_tts` / `landing_bi_tts` | Diagnostiques Absorption **et** Stabilisation (TFM `absorption:3`) | **Retirés du raisonnement Absorption** — plus jamais lus par ce moteur. Restent inchangés pour Stabilisation (TFM/`computeTestStatus` non modifiés) |
| `sllt_*` (5 KPI) | Diagnostiques (TFM `absorption:3`) | Non lus par ce moteur — voir §8, découverte importante |
| Tests de force segmentaire (`knee_ext`, `hip_abd`, `df_iso`, etc., poids `absorption` 1-2 dans TFM) | Contribuaient (faiblement) à l'ancien score TFM générique | Ne contribuent plus à `fSc['Absorption']` |

## 8. Dépendance inattendue — découverte pendant l'implémentation, non improvisée

Avant d'écrire le moteur, chaque variable candidate a été vérifiée directement dans `index.html`
(recherche des entrées `NORMS`/`THRESHOLDS`), conformément à l'interdiction explicite d'inventer un
seuil. Résultat, non anticipé par `HYP-ABS-01_V2.md`/`AUDIT_PROFIL_ABSORBEUR_VS_HYP.md` :

**Aucune des 5 variables du sous-domaine E (`sllt_peak_landing_force`, `sllt_ttplf`,
`sllt_loading_rate`, `sllt_tts`, `sllt_cop_path`) ni `landing_bi_peak_landing_force` ne possède de
seuil clinique dans `index.html`** — ni `NORMS`, ni repli `THRESHOLDS`. Conséquence directe dans le
code déjà existant (non modifié par cette mission) : `computeTestStatus('sllt', ...)` ne peut
jamais produire de statut réel pour SLLT — `applyThr` retourne toujours `null` pour ses 5 KPI, donc
`sts` reste vide, et la ligne `if(!sts.length)return'jaune'` fait retourner **'jaune' de façon
neutre et constante, indépendamment des données réelles de l'athlète**, y compris avant cette
mission. Le poids `sllt:{absorption:3}` dans `TFM` — présenté dans toute la cartographie clinique
antérieure comme la preuve diagnostique la plus forte d'Absorption — n'a donc **jamais** produit de
signal réel dans `fSc['Absorption']`, quelle que soit la sévérité clinique du SLLT importé.

De même, `cmj_braking_impulse` et `dj_contact_time` — tous deux des KPI réels, présents dans le
catalogue de métadonnées et dans `TBK` — n'ont aucun seuil (ni `NORMS` ni `THRESHOLDS`) : ils ne
peuvent jamais produire de statut vert/jaune/orange/rouge dans l'état actuel du code.

**Ce document n'improvise aucun seuil pour compenser cette absence** (interdiction explicite de la
mission). Conséquences concrètes sur ce qui a été implémenté :
- Sous-domaine E est retourné explicitement `{available:false}`, jamais simulé.
- `cmj_braking_impulse`/`dj_contact_time` sont lus et exposés (valeur brute), jamais classifiés.
- Aucun des 5 profils Core nommés dans `HYP-ABS-01_V2.md` §4 n'est actuellement atteignable (ils
  nécessitent tous une lecture qualitative de l'Impulse) — le moteur retourne un statut de profil
  explicite `non_couvert_impulse_non_classifiable` plutôt que de forcer un cas dans une catégorie
  existante (conforme à la mission §15).

**Ce n'est pas une régression introduite par cette mission** — le mécanisme (`applyThr` sans seuil
→ `null` → `computeTestStatus` neutre) préexistait intégralement. C'est une découverte factuelle
sur l'état réel des données, documentée ici comme demandé plutôt que corrigée silencieusement :
ajouter des seuils SLLT/Impulse/Contact Time est une décision clinique et de données qui dépasse le
périmètre de cette mission (elle nécessiterait soit des données normatives réelles, soit une
validation clinique du praticien — aucune des deux n'est disponible ici).

Corollaire rassurant : puisque SLLT et `landing_uni`/`landing_bi` (hors `tts`) n'ont jamais produit
de signal réel, retirer ces tests du raisonnement Absorption ne supprime aucun signal diagnostique
réel au-delà du retrait de TTS déjà explicitement décidé dans `HYP-ABS-01_V2.md` §10.

## 9. Ce qui n'a pas été fait (hors périmètre, non requis par la mission)

- Aucun écran (`AnalyseView`, `ExpertView`, `Historique`, `Dashboard`, PDF) n'a été réécrit pour
  afficher le détail `hypAbs01` (sous-domaines, profil Core, asymétrie) — la mission §20 demande la
  donnée correcte en priorité, pas la réécriture de la présentation graphique "sauf nécessaire". La
  donnée est disponible (`functionScores.Absorption.hypAbs01`), prête pour un futur lot d'affichage.
- Aucune tentative d'ajouter un seuil SLLT/Impulse/Contact Time (voir §8).
- Aucune modification du `TFM`, de `computeTestStatus`, ni du Profil Absorbeur
  (`BiomechanicalProfileEngine`) — module biomécanique distinct, non touché, non réutilisé pour le
  calcul clinique (une seule source de raisonnement clinique, conformément à
  `AUDIT_PROFIL_ABSORBEUR_VS_HYP.md`).

## 10. Tests

`tests/hypAbsorption01.test.js` — **17 tests, tous passants**, contre le code réellement intégré
dans `index.html` (pas un fichier séparé). Couvre les 13 cas mandatés par la mission (§22),
reformulés autour de la couverture réelle des seuils constatée en §8 :

1. RFD↓+Force@0V↓ (Impulse non classifiable) → déficitaire, profil non forcé.
2. RFD normal, Force@0V absente → jamais de profil forcé sur donnée manquante.
3. RFD↓+Impulse↓+Force@0V↓ → déficitaire.
4. RFD=Impulse=Force@0V= → OK.
5. Core conservé + DJ RSI↓ → OK, caractérisation D sans bascule Niveau 1.
6. Asymétrie de freinage marquée, Core normal → aucune bascule.
7. Capacité excentrique↓ (`ecc_peak_vel`), Core conservé → OK, explicatif seul.
8. Stratégie anormale (`depth`), Core conservé → OK, caractérisation C seule.
9. `landing_uni_tts`↓ → aucun impact sur le diagnostic Absorption.
10. `landing_bi_tts`↓ → aucun impact.
11. `sllt_tts`↓ → sous-domaine E non implémenté, rôle non modifié par ce moteur.
12. Aucune donnée CMJ → non déterminable, repli sur le score TFM générique.
13. Ancien bilan (CMJ sans Core) → aucun crash, repli documenté.

Plus 4 tests de non-régression : isolation des variables non classifiables, dérivation de `Force`
inchangée depuis `computeTestStatus('cmj',...)`, structure complète de `computeMoteur()` préservée,
pureté fonctionnelle.

**Régression complète** : les 14 fichiers de tests préexistants (`tests/*.test.js`, hors le nouveau
fichier) ont été réexécutés intégralement — **tous passants, aucun changement de résultat**.
Vérification syntaxique complète de l'intégralité du contenu `<script>` d'`index.html`
(`node --check`) — **OK**.

## 11. Compatibilité avec les anciens bilans

`resolveCmjValues()` (primitive déjà existante, non modifiée) retourne simplement `undefined` pour
toute clé absente d'un ancien bilan — `computeHypAbsorptionCore` traite alors ces variables comme
`raw:null, status:null`, aboutissant à `niveau1:'non_determinable'` et au repli documenté sur le
score TFM déjà calculé (voir §6, cas de test 13). Aucun ancien bilan ne peut provoquer d'erreur ;
aucune migration de données n'est nécessaire ni effectuée.

## 12. Résumé final

- **Fichiers modifiés** : `index.html` (1 fichier, +151/-0 lignes).
- **Fichiers créés** : `tests/hypAbsorption01.test.js`, `IMPLEMENTATION_HYP_ABS_V2.md`.
- **Nombre de tests** : 17 (nouveau fichier) + 14 fichiers préexistants réexécutés en intégralité.
- **Tests passés** : 17/17 (nouveau) + tous les tests préexistants (aucune régression).
- **Régression détectée** : NON.
- **Autres qualités modifiées** : NON (vérifié par tests et par relecture — le bloc HYP-ABS-01
  n'écrit que `fSc['Absorption']`).
- **HYP-ABS-01 V2 réellement actif** : OUI, dans `computeMoteur()`, dès que le Core CMJ
  (`cmj_braking_rfd`/`cmj_force_zero_vel`) est disponible et classifiable pour la population de
  l'athlète ; repli documenté (jamais un statut inventé) sinon.

---

## CE QUI A CHANGÉ POUR LE PRATICIEN

1. **Le diagnostic d'Absorption est maintenant piloté par le freinage/la décélération réels du CMJ**
   (Braking RFD, Force at Zero Velocity), plus par une moyenne indifférenciée de 34 tests dont
   beaucoup n'avaient aucun lien clinique direct avec l'absorption.
2. **Le Time to Stabilization (`landing_uni_tts`/`landing_bi_tts`) ne compte plus dans le diagnostic
   d'Absorption** — il reste inchangé pour Stabilisation. `sllt_tts` n'est pas concerné par ce
   changement (il n'a jamais produit de signal réel, voir point 6).
3. **Le RSI du Drop Jump (`dj_rsi`) caractérise désormais une composante réactive de l'absorption**,
   sans jamais, à lui seul, déclencher un diagnostic global d'Absorption déficitaire.
4. **La capacité excentrique (Eccentric Mean Power/Peak Velocity) devient explicative, pas
   diagnostique** — un CMJ avec une capacité excentrique réduite mais un freinage (Core) conservé
   ne sera plus étiqueté "Absorption déficitaire".
5. **Les asymétries de freinage restent un modificateur, jamais un déclencheur** d'un diagnostic
   d'Absorption à elles seules.
6. **Découverte importante, indépendante de cette mission** : le SLLT (Single Leg Landing Test) et
   les KPI hors TTS de `landing_bi`/`landing_uni` n'ont jamais alimenté de signal réel dans le
   diagnostic d'Absorption, faute de seuils clinique/normatifs enregistrés pour ces variables dans
   Kinexus — avant comme après cette mission. Ajouter ces seuils est une décision de données/
   clinique distincte, non traitée ici (aucun seuil n'a été inventé).
7. **Rien n'est perdu** : les anciens bilans restent lisibles à l'identique ; quand le Core CMJ n'est
   pas disponible pour un athlète, l'ancien score général reste affiché, avec le détail du nouveau
   raisonnement déjà calculé en arrière-plan pour un futur affichage enrichi.

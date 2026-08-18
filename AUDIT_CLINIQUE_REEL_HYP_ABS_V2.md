# Audit clinique réel — HYP-ABS-01 V2 après implémentation

**Statut** : audit uniquement. Aucun code modifié. Toute affirmation ci-dessous est vérifiée
directement dans `index.html` (fonctions `computeHypAbsorption01` et dépendances, lignes
4184-4396) — pas dans les documents théoriques antérieurs (`HYP-ABS-01_V2.md`,
`HYP_ABS01_V2_CHANGELOG.md`) quand ceux-ci divergent du code réellement exécuté. Les divergences
sont signalées explicitement, jamais silencieusement alignées sur la théorie.

---

## 1. Le code réel

### Fonctions et primitives réellement utilisées

`computeHypAbsorption01(testData, normPop, normAge)` orchestre 6 fonctions, toutes lues
directement dans `index.html` :

- `computeHypAbsorptionCore` — sous-domaine A.
- `computeHypAbsorptionCapaciteEcc` — sous-domaine B.
- `computeHypAbsorptionStrategie` — sous-domaine C.
- `computeHypAbsorptionReactive` — sous-domaine D.
- `computeHypAbsorptionReceptionImpact` — sous-domaine E.
- `computeHypAbsorptionAsymetrie` — modificateur asymétrie.

Primitives réutilisées, sans exception : `applyThr(key,val,pop,age)` (NORMS puis repli
THRESHOLDS, sinon `null`), `resolveCmjValues({testData})`, `testKpiDir(testKey,kpiKey)`,
`bestVal(trials,dir)`, `computeAsymEngine(cmjValues,pop,age)`. Aucune nouvelle formule, aucun
nouveau seuil dans ce code.

### Variables par rôle, tel qu'écrit dans le code (pas tel que documenté ailleurs)

- **Diagnostiques (génèrent le Niveau 1)** : `cmj_braking_rfd`, `cmj_force_zero_vel`. Ce sont
  **les deux seules** variables lues par `computeHypAbsorptionCore` qui entrent dans le calcul de
  `niveau` (ligne `var evaluable=[rfdSt,fzvSt].filter(Boolean)`). `cmj_braking_impulse` est lue,
  mais **exclue explicitement** de `evaluable` — elle ne participe jamais au Niveau 1 dans le code
  actuel, malgré sa présence dans le triplet Core théorique de `HYP-ABS-01_V2.md` §4.
- **Confirmatives** : aucune. Le code n'a pas de couche confirmative distincte pour Absorption —
  contrairement au modèle HYP-MOB-01 (`hyp_engine_lot1.js`, `confirmativeEvidence`), rien
  d'équivalent n'existe dans `computeHypAbsorption01`.
- **Explicatives** : `cmj_ecc_mean_power`, `cmj_ecc_peak_vel` (sous-domaine B) — lues, statut
  calculé si possible, **jamais lues par le calcul du Niveau 1** (vérifié : `core.niveau` ne
  dépend que de `computeHypAbsorptionCore`, qui ne reçoit jamais `capaciteEcc`).
- **Stratégie** : `cmj_depth`, `cmj_braking_duration` — mêmes garanties de non-génération.
- **Réactives** : `dj_rsi`, `dj_contact_time` — idem, jamais lues par le Niveau 1.
- **Impact** : aucune. `computeHypAbsorptionReceptionImpact()` ne lit **aucun paramètre** (la
  fonction n'a même pas de signature d'entrée) et retourne toujours
  `{available:false,reason:'aucun_seuil_disponible'}`, quelles que soient les données de
  l'athlète.
- **Asymétrie** : `ecc_decel_rfd_asym`/`ecc_decel_impulse_asym`, lues via
  `computeAsymEngine(...).cartographie`, phase `'braking'` uniquement. Jamais lue par le calcul du
  Niveau 1 (appelée après, jamais transmise à `computeHypAbsorptionCore`).

### Seuils réellement disponibles (vérifiés dans `NORMS`/`THRESHOLDS`, `index.html`)

| Variable | NORMS | Repli THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `cmj_braking_rfd` | Oui (plusieurs populations sport) | Non | Seulement si la population de l'athlète est couverte |
| `cmj_force_zero_vel` | Oui (plusieurs populations sport) | Non | Idem |
| `cmj_braking_impulse` | Non | Non | **Jamais** |
| `cmj_ecc_mean_power` | Partielle (peu de populations) | Non | Rarement |
| `cmj_ecc_peak_vel` | Partielle (tables bball2425) | Non | Selon population |
| `cmj_depth` | Partielle (tables bball2425) | Non | Selon population |
| `cmj_braking_duration` | Non | Non | **Jamais** |
| `dj_rsi` | Oui (large couverture sport) | Oui (vert 1.5/jaune 1.0/orange 0.7) | Presque toujours (si DJ actif) |
| `dj_contact_time` | Non | Non | **Jamais** |
| `sllt_peak_landing_force`/`ttplf`/`loading_rate`/`tts`/`cop_path` | Non | Non | **Jamais** |
| `landing_bi_peak_landing_force` | Non | Non | **Jamais** |
| `landing_uni_tts`/`landing_bi_tts` | Non | Oui | Toujours classifiables — mais **jamais lues par ce moteur** (retirées du raisonnement Absorption par décision clinique, pas par manque de seuil) |

**Divergence avec la documentation théorique** : `HYP-ABS-01_V2.md` §4 présente le Core comme un
triplet à 3 variables (RFD/Impulse/Force@0V) avec 5 profils narratifs combinant les trois. Le code
réel n'utilise que 2 de ces 3 variables pour tout calcul de statut — Impulse est structurellement
inerte pour le Niveau 1. Aucun des 5 profils n'est implémenté comme règle de branchement dans le
code : `computeHypAbsorptionCore` ne contient aucune structure `if/else` correspondant à ces 5
libellés ; elle retourne uniquement `'non_couvert_impulse_non_classifiable'` ou `'non_couvert'`
(cette seconde valeur n'est jamais atteinte en pratique puisqu'aucune donnée ne permet aujourd'hui
de classifier Impulse — voir tableau ci-dessus).

---

## 2. Tableau variable → rôle réel

| Variable | Existe ? | Seuil disponible ? | Utilisée par HYP-ABS ? | Rôle réel dans le code | Peut modifier le diagnostic (Niveau 1) ? |
|---|---|---|---|---|---|
| `cmj_braking_rfd` | Oui | Oui (NORMS, population-dépendant) | Oui | Core, générateur | **Oui** |
| `cmj_force_zero_vel` | Oui | Oui (NORMS, population-dépendant) | Oui | Core, générateur | **Oui** |
| `cmj_braking_impulse` | Oui | **Non** | Oui (lue, exposée) | Descriptive seule | Non |
| `cmj_ecc_mean_power` | Oui | Partiel (NORMS rare) | Oui | Explicative (B) | Non |
| `cmj_ecc_peak_vel` | Oui | Partiel (NORMS selon pop) | Oui | Explicative (B) | Non |
| `cmj_depth` | Oui | Partiel (NORMS selon pop) | Oui | Stratégie (C) | Non |
| `cmj_braking_duration` | Oui | **Non** | Oui (lue, exposée) | Descriptive seule (C) | Non |
| `dj_rsi` | Oui | Oui (NORMS + THRESHOLDS) | Oui | Réactive, caractérisation (D) | Non |
| `dj_contact_time` | Oui | **Non** | Oui (lue, exposée) | Descriptive seule (D) | Non |
| `sllt_peak_landing_force`/`ttplf`/`loading_rate`/`tts`/`cop_path` | Oui | **Non** | **Non** | Aucun — sous-domaine E inerte | Non |
| `landing_bi_peak_landing_force` | Oui | **Non** | Non | Aucun | Non |
| `landing_uni_tts` | Oui | Oui | **Non (retirée par décision clinique)** | Aucun pour Absorption | Non |
| `landing_bi_tts` | Oui | Oui | **Non (retirée par décision clinique)** | Aucun pour Absorption | Non |
| `sllt_tts` | Oui | **Non** | Non | Aucun (inchangé, jamais lu par ce moteur) | Non |
| `ecc_decel_rfd_asym` / `ecc_decel_impulse_asym` (phase `braking`) | Oui | Oui (via `computeAsymEngine`) | Oui | Modificateur/annotation seule | Non |

---

## 3. Diagnostic global — ce que le code produit réellement

**Constat préalable, important** : le modèle à 5 états Absente/Suspectée/Retenue-Faible/
Retenue-Modérée/Retenue-Forte (ADR-005/ADR-008, utilisé pour HYP-MOB-01 dans
`hyp_engine_lot1.js`) **n'est pas implémenté pour HYP-ABS-01 V2**. Il n'y a dans le code ni valeur
`'suspectee'`, ni `'retenue_faible'`, ni `'retenue_moderee'`, ni `'retenue_forte'` pour Absorption.
Le code produit exactement 4 valeurs de `niveau1` — `'ok'`, `'a_surveiller'`, `'deficitaire'`,
`'non_determinable'` — ensuite converties en statut catégoriel `vert`/`jaune`/`orange`/`rouge`
consommé par `fSc['Absorption'].status`. Ne pas supposer que la terminologie à 5 états s'applique
ici : ce serait reprendre un document théorique contredit par le code réel.

Combinaisons réellement possibles (lues directement dans `computeHypAbsorptionCore` et le bloc
d'intégration de `computeMoteur()`) :

| `rfdSt` | `fzvSt` | `niveau1` | `status` final |
|---|---|---|---|
| `null` | `null` | `non_determinable` | repli sur l'ancien score TFM générique (jamais un statut HYP inventé) |
| une valeur, l'autre `null` | — | `a_surveiller` si la valeur dispo est orange/rouge, `ok` si vert/jaune | `jaune` ou `vert` |
| `vert`/`jaune` | `vert`/`jaune` (aucun orange/rouge) | `ok` | `vert` |
| exactement un des deux orange/rouge | — | `a_surveiller` | `jaune` |
| les deux orange/rouge, **au moins un pas rouge** | | `deficitaire` | `orange` |
| les deux **rouge** | | `deficitaire` | `rouge` |

Point non trivial vérifié dans le code : un statut `'jaune'` (légèrement réduit, pas franchement
déficitaire) sur une variable Core **ne compte jamais comme "déficient"** — seul `orange`/`rouge`
compte (`deficient=evaluable.filter(s=>s==='orange'||s==='rouge')`). Deux variables Core toutes
deux `'jaune'` produisent `niveau1='ok'`, pas `'a_surveiller'`.

---

## 4. Sous-domaines — état réel

| Sous-domaine | État | Pourquoi |
|---|---|---|
| **A. Freinage/Décélération (Core)** | **Partiellement opérationnel** | 2 des 3 variables documentées (RFD, Force@0V) sont classifiables, mais seulement pour les populations couvertes par `NORMS` (pas de repli `THRESHOLDS`). La 3ᵉ (Impulse) n'a aucun seuil et n'est jamais classifiable — le Core théorique à 3 variables fonctionne en pratique comme un Core à 2 variables. |
| **B. Capacité excentrique** | **Partiellement opérationnel** | Les deux variables sont lues et statuées quand `NORMS` couvre la population, mais cette couverture est rare/partielle. Par construction (voulue), ne génère jamais de conclusion de Niveau 1 — le sous-domaine "fonctionne" tel que conçu, mais reste peu alimenté en données classifiables. |
| **C. Stratégie** | **Partiellement opérationnel** | `cmj_depth` classifiable selon population ; `cmj_braking_duration` jamais classifiable (aucun seuil). Une des deux variables documentées est structurellement inerte. |
| **D. Absorption réactive** | **Partiellement opérationnel** | `dj_rsi` fonctionne bien (seuil quasi toujours résolvable) ; `dj_contact_time` jamais classifiable. Conçu pour ne jamais générer le Niveau 1 seul — respecté dans le code. |
| **E. Réception/Impact** | **Non opérationnel** | `computeHypAbsorptionReceptionImpact()` ne prend aucun paramètre et retourne une constante fixe `{available:false}` — aucune donnée n'est lue, aucune tentative de classification n'est faite. 0% fonctionnel, par construction explicite (pas un bug : le code documente lui-même l'absence de seuil SLLT comme raison). |

---

## 5. Cas cliniques synthétiques (10 minimum)

Population utilisée pour les cas nécessitant une couverture `NORMS` réelle : `bball2425_ncaa_m`,
26 ans (`cmj_braking_rfd:[42,66,87,118,174]`, `cmj_force_zero_vel:[18.8,21.9,24.0,26.4,30.5]`,
`cmj_depth`, `cmj_ecc_peak_vel` également couverts pour cette population — vérifié dans `NORMS`).
Valeurs choisies pour retomber sans ambiguïté dans les bandes hautes/basses de ces tables réelles,
et validées par exécution effective du code (`tests/hypAbsorption01.test.js`, 17/17 passants).

| # | Entrée | Résultat HYP réel | Sous-domaine | Explication | Limites |
|---|---|---|---|---|---|
| 1 | Braking RFD ↓ seul (RFD=1, Force@0V absente) | `a_surveiller` (jaune) | A | Une seule preuve Core disponible, déficitaire | Le manque de la seconde preuve empêche de conclure à un déficit global ; l'engine ne sait pas si Force@0V serait normale ou déficitaire |
| 2 | Force @ Zero Velocity ↓ seul (Force@0V=1, RFD absente) | `a_surveiller` (jaune) | A | Symétrique au cas 1 | Idem |
| 3 | Braking RFD ↓ + Force @0V ↓ (les deux à 1) | `deficitaire` (orange, ou rouge si les deux statuts sont exactement `'rouge'`) | A | 2/2 preuves Core disponibles, déficitaires | Impulse jamais lue — aucun des 5 profils narratifs de `HYP-ABS-01_V2.md` n'est produit, seulement le niveau agrégé |
| 4 | Core normal (RFD=174, Force@0V=30.5) + capacité excentrique ↓ (`ecc_peak_vel` très bas) | `ok` (vert) | A=ok, B=déficitaire en explicatif | Sous-domaine B expose un statut réduit sans jamais influencer le Niveau 1 | Le praticien ne voit aujourd'hui que le badge global "vert" — le détail B n'est affiché sur aucun écran actuel (voir §9 de `IMPLEMENTATION_HYP_ABS_V2.md`) |
| 5 | Core normal + DJ RSI ↓ (rsi=0.3) | `ok` (vert) | A=ok, D=caractérisation réduite | Même limite que le cas 4, pour le sous-domaine D | Idem — caractérisation non visible sans lecture directe de `hypAbs01` |
| 6 | Core déficitaire (RFD=1, Force@0V=1) + capacité excentrique ↓ | `deficitaire` (orange) | A déficitaire, B confirme/renforce narrativement (non testé structurellement — voir limite) | Le Niveau 1 vient uniquement de A ; B n'ajoute aucune pondération numérique | Le code ne calcule aucune "convergence" formelle entre A et B — pas de mécanisme de renforcement du support, contrairement au modèle HYP-MOB-01 |
| 7 | Core déficitaire + stratégie anormale (`cmj_depth` hors norme) | `deficitaire` (orange) | A déficitaire, C caractérise | Idem cas 6 | Idem |
| 8 | Asymétrie de freinage importante, Core normal (`ecc_decel_rfd_asym`≈57%) | `ok` (vert) | A=ok, modificateur asymétrie renseigné | L'asymétrie est retournée dans `hypAbs01.asymetrie` mais ne modifie jamais `niveau1` | Comme B/C/D, invisible sans lecture directe de la structure interne |
| 9 | SLLT anormal (`sllt_tts` très dégradé) | Aucun effet — statut Absorption inchangé | E (`available:false`) | Le moteur ne lit jamais `testData.sllt` | Le praticien peut avoir un SLLT cliniquement alarmant sans que rien n'apparaisse dans le diagnostic Absorption — risque documenté §9 |
| 10 | Données insuffisantes (aucun test CMJ actif) | `non_determinable` → repli sur l'ancien score TFM générique | — | `hypAbs01` est tout de même calculé et attaché pour traçabilité même quand `fSc['Absorption']` vient de l'ancien mécanisme | Le repli peut donner un statut basé sur des tests qui n'ont clinique­ment rien à voir avec l'absorption (segmentaire, etc. — voir §8) |

---

## 6. Question centrale

« Aujourd'hui, HYP-ABS-01 V2 est-il réellement capable de distinguer : »

- **A. Déficit de capacité de freinage** → **PARTIELLEMENT.** Le moteur distingue correctement un
  déficit Core quand RFD et Force@0V sont tous deux classifiables et déficitaires (cas 3). Mais il
  ne peut classifier ces variables que pour les populations `NORMS` couvertes, et ne peut jamais
  faire intervenir Impulse (aucun seuil). Avec une seule preuve disponible, il ne conclut qu'à "à
  surveiller", jamais à un déficit confirmé.

- **B. Déficit de capacité excentrique** → **NON**, au sens d'un diagnostic distinct. Le moteur
  peut *afficher* un statut réduit pour `cmj_ecc_mean_power`/`cmj_ecc_peak_vel` (sous-domaine B),
  mais ne produit jamais de conclusion clinique séparée à ce sujet — par construction voulue
  (`HYP-ABS-01_V2.md` §1 : "Absorption ≠ capacité excentrique"), ces variables ne peuvent jamais
  élever le diagnostic au-delà de leur simple exposition brute, et aucun écran actuel n'affiche
  cette exposition (voir §9 de `IMPLEMENTATION_HYP_ABS_V2.md`).

- **C. Problème de stratégie** → **NON**, mêmes raisons que B : `cmj_depth`/`cmj_braking_duration`
  sont lues et statuées quand possible, mais ne produisent jamais de conclusion clinique distincte
  ni de sortie visible aujourd'hui.

- **D. Limitation d'absorption réactive** → **NON**, mêmes raisons : `dj_rsi` est correctement
  caractérisé en interne, mais ne devient jamais une conclusion clinique séparée ni visible.

- **E. Problème de réception/impact** → **NON**, sans nuance : la fonction correspondante ne lit
  aucune donnée et retourne toujours la même constante. Ce sous-domaine n'existe pas
  fonctionnellement aujourd'hui.

**Résumé** : seul le domaine A (freinage/décélération Core) peut aujourd'hui produire un résultat
clinique visible et différencié (`fSc['Absorption'].status`). B, C et D sont calculés en interne
mais n'atteignent aujourd'hui aucune sortie consommée par un écran ou un rapport — ils existent
dans `hypAbs01` mais restent invisibles pour le praticien tant qu'aucun consommateur ne les lit. E
n'existe pas fonctionnellement.

---

## 7. SLLT — impact documenté

Vérifié directement dans le code (`NORMS`, `THRESHOLDS`) :

- Le test SLLT existe (`TESTS`/`TBK.sllt`).
- Ses 5 KPI existent (`sllt_peak_landing_force`, `sllt_ttplf`, `sllt_loading_rate`, `sllt_tts`,
  `sllt_cop_path` — présents dans le catalogue de métadonnées).
- **Aucun de ces 5 KPI n'a d'entrée `NORMS` ni `THRESHOLDS`.**
- Conséquence directe et déjà présente **avant** cette mission : `applyThr` retourne toujours
  `null` pour ces 5 variables ; `computeTestStatus('sllt',...)` ne peut jamais produire de statut
  réel (repli neutre `'jaune'` constant, indépendant des données).
- Conséquence pour HYP-ABS-01 V2 : `computeHypAbsorptionReceptionImpact()` ne tente même pas de
  lire ces variables — le sous-domaine E est un stub permanent.

**Aucun seuil n'est proposé ici. Aucune correction n'est apportée.** Ce constat est répété tel
quel depuis `IMPLEMENTATION_HYP_ABS_V2.md` §8, confirmé par relecture directe du code à l'occasion
de cet audit.

---

## 8. Comparaison avec l'ancien TFM

**Ancien modèle (TFM Absorption)** : moyenne pondérée des statuts de **34 tests** ayant un poids
`absorption` dans `TFM` (de 1 à 3 — `cmj:2`, `dj:2`, `landing_bi:3`, `landing_uni:3`, `sllt:3`,
mais aussi `knee_ext:2`, `hip_abd:1`, `df_iso:1`, `imtp:1`, etc.), via l'agrégation générique et
indifférenciée de `computeTestStatus` (aucune distinction diagnostique/confirmative/explicative
KPI par KPI).

**Nouveau modèle (HYP-ABS-01 V2)** : 2 variables Core (RFD, Force@0V) génèrent le Niveau 1 ; le
reste (B/C/D) est calculé mais n'influence rien de visible aujourd'hui ; E est inerte.

- **Ce que l'ancien modèle détectait que le nouveau ne détecte plus** : tout signal issu de
  `landing_uni_tts`/`landing_bi_tts` (réellement seuillé, contribuait avec un poids "direct" de 3)
  — retiré du raisonnement Absorption par décision clinique explicite (reste disponible pour
  Stabilisation). Également : toute contribution des ~30 tests de force segmentaire/mobilité/
  isométrie pondérés `absorption:1` ou `2` dans TFM (`knee_ext`, `hip_abd`, `df_iso`, `imtp`,
  `soleus_iso`, etc.) — ils n'influencent plus `fSc['Absorption']` du tout.
- **Ce que le nouveau détecte mieux** : quand la population est couverte, un déficit Core
  (RFD/Force@0V) est désormais directement traçable à un mécanisme clinique documenté, au lieu
  d'être noyé dans une moyenne à 34 contributeurs sans lien causal établi avec l'absorption pour la
  plupart d'entre eux.
- **Informations réellement perdues** (existaient et étaient réelles avant, n'existent plus) :
  la contribution de `landing_uni_tts`/`landing_bi_tts` à `fSc['Absorption']` — c'était un signal
  réel (seuil existant), désormais exclu par décision clinique, pas par accident.
- **Informations simplement devenues non déterminables** (n'étaient jamais réelles, seulement en
  apparence) : la contribution de `sllt:{absorption:3}` — comme démontré §7, ce poids n'a **jamais**
  produit de signal réel (statut neutre constant), avant comme après cette mission. Ce n'est donc
  pas une perte, malgré l'apparence d'un poids élevé (3) dans l'ancien modèle.
- **Informations désormais mieux interprétées** : le signal Core RFD/Force@0V, auparavant dilué
  dans le score générique du test `cmj` (poids 2 parmi 34 contributeurs), est désormais la source
  directe et unique du diagnostic quand il est disponible.

**Ne pas conclure que l'ancien modèle était meilleur** parce qu'il "couvrait" 34 tests : la grande
majorité de ces poids (segmentaire, mobilité) n'avait aucune justification clinique établie dans la
cartographie HYP-ABS-01 documentée précédemment — davantage de signaux agrégés sans lien causal
clair n'est pas une garantie de meilleure validité diagnostique, c'est un signal statistiquement
plus "rempli" mais cliniquement moins spécifique.

---

## 9. Risques cliniques réellement présents

- **Faux négatif possible** : quand une seule des deux variables Core est classifiable (l'autre
  `null` faute de couverture `NORMS` pour la population de l'athlète) et qu'elle est déficitaire,
  le moteur plafonne à `'a_surveiller'` (jaune), jamais `'deficitaire'` — alors que l'athlète peut
  être réellement dans un déficit global si la seconde variable, non mesurable ici, l'était aussi.
  Le statut affiché ne distingue pas "à surveiller car réellement limite" de "à surveiller car une
  preuve manque" — ces deux réalités cliniques très différentes produisent le même badge.
- **Information non disponible, non signalée à l'écran** : sous-domaines B/C/D/E et l'asymétrie
  sont calculés dans `hypAbs01` mais aucun écran/rapport actuel ne les affiche (confirmé
  `IMPLEMENTATION_HYP_ABS_V2.md` §9) — un SLLT ou un DJ RSI cliniquement parlant peuvent exister
  sans qu'aucune trace n'atteigne le praticien via l'interface actuelle.
- **Variable sans seuil, lue mais silencieuse** : `cmj_braking_impulse`, `dj_contact_time`,
  `cmj_braking_duration`, les 5 KPI SLLT, `landing_bi_peak_landing_force` — toutes existent dans le
  code, aucune ne peut jamais produire de statut.
- **Hypothèse non discriminable depuis le badge affiché** : le statut `'jaune'` (à surveiller) peut
  provenir soit d'une variable réellement à la limite, soit d'une seule variable disponible sur
  deux — ces deux cas ne sont pas distingués dans `fSc['Absorption'].status`/`.confidence` sans
  lecture du détail `hypAbs01.sousDomaines.A_core` (champ `coverage` à 50% étant le seul indice
  actuellement exposé de cette ambiguïté, non mis en avant par un écran).

Aucun autre risque n'est ajouté au-delà de ce qui est directement observable dans le code.

---

## 10. Conclusion

| Domaine | État actuel | Ce que HYP sait faire | Ce qu'il ne sait pas faire |
|---|---|---|---|
| A. Freinage/Décélération | Partiellement opérationnel | Détecter un déficit Core quand RFD **et** Force@0V sont classifiables (population couverte) | Utiliser Impulse ; conclure à un déficit confirmé avec une seule preuve disponible |
| B. Capacité excentrique | Calculé, invisible | Statuer `ecc_mean_power`/`ecc_peak_vel` quand la population le permet | Produire une conclusion clinique distincte ; l'afficher à l'écran aujourd'hui |
| C. Stratégie | Calculé, invisible | Statuer `cmj_depth` selon population | Statuer `cmj_braking_duration` (aucun seuil) ; produire une conclusion visible |
| D. Absorption réactive | Calculé, invisible | Statuer `dj_rsi` de façon quasi fiable | Statuer `dj_contact_time` (aucun seuil) ; produire une conclusion visible |
| E. Réception/Impact | Non opérationnel | Rien | Tout — SLLT et landing_bi sans seuil clinique disponible |

### VERDICT

**« HYP-ABS-01 V2 est-il suffisamment opérationnel pour être conservé en production tel quel, en
attendant les prochaines qualités ? »**

**OUI** — sous conditions explicites, sans modification de code proposée ici :

1. Le moteur est **strictement plus sûr** que l'ancien TFM générique : il n'invente jamais de
   seuil, ne force jamais un profil non couvert dans une catégorie existante, et son unique canal
   de diagnostic visible (sous-domaine A) repose sur deux variables réellement seuillées, pas sur
   une moyenne de 34 tests sans lien causal établi.
2. Il ne provoque aucune régression sur les autres qualités (déjà vérifié à l'implémentation).
3. Ses limites (B/C/D/E invisibles à l'écran, sous-domaine E inerte, ambiguïté du badge
   `'a_surveiller'`) sont des **limites de données et d'exposition à l'écran**, pas des défauts de
   raisonnement — les corriger nécessiterait soit de nouveaux seuils cliniques (interdit dans le
   périmètre de cette mission comme de la précédente), soit un nouvel écran de restitution (hors
   périmètre "ne rien modifier" de cet audit).

**Ne rien modifier.** Les blocages identifiés, à garder en tête pour un futur lot (non traité ici,
non corrigé ici) :

- Sous-domaine E structurellement inerte tant qu'aucun seuil SLLT/landing_bi n'existe.
- `cmj_braking_impulse`, `dj_contact_time`, `cmj_braking_duration` : lus, jamais classifiables,
  tant qu'aucun seuil n'existe.
- L'ambiguïté du badge `'a_surveiller'` (borderline réel vs preuve manquante) n'est visible qu'en
  lisant `hypAbs01` directement — aucun écran ne l'expose aujourd'hui.
- Les sous-domaines B/C/D/E et l'asymétrie sont calculés mais invisibles pour le praticien tant
  qu'aucun écran ne lit `functionScores.Absorption.hypAbs01`.

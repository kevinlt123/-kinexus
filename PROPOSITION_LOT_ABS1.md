# Proposition — LOT ABS-1

**Statut** : proposition uniquement, non exécutée. Aucun fichier de production créé ou modifié par
ce document — seule une proposition écrite.

**Principe** : même pattern que LOT 1 (`HYP-MOB-01`) — fichier hors production, additif, silencieux,
testé, sans branchement UI. Objectif : calculer le sous-domaine A (Core) de `HYP-ABS-01 V2`
(`cmj_braking_rfd`, `cmj_braking_impulse`, `cmj_force_zero_vel`) en réutilisant les primitives déjà
identifiées dans `AUDIT_PROFIL_ABSORBEUR_VS_HYP.md`, sans dupliquer le Profil Absorbeur existant.

---

## Fichiers

- **Créé** : `hyp_engine_abs01_lot1.js` — nouveau fichier, même structure que
  `hyp_engine_lot1.js` (`HYP_CATALOG`, une fonction d'évaluation par variable, une fonction
  d'orchestration).
- **Créé** : `tests/hypEngineAbs01Lot1.test.js` — même pattern que
  `tests/hypEngineLot1.test.js` (extraction par `eval()` d'une tranche d'`index.html`, assertions
  `test(name, fn)`).
- **Non modifié** : `index.html`, `hyp_engine_lot1.js` (fichier existant pour `HYP-MOB-01`, non
  touché), tout le reste du code de production.

## Fonctions réutilisées (extraites par `eval()`, pas réécrites)

- `applyThr(key, val, pop, age)` — si un seuil catégoriel existe pour un KPI Core.
- `normPercentile(testKey, kpiKey, pop, age, raw, dir)` — pour lire la même donnée percentile que
  le Profil Absorbeur, sans dupliquer son calcul.
- `validateTechnical(kpiKey, raw)`, `testKpiDir(testKey, kpiKey)` — validation et sens de seuil,
  déjà génériques.
- `bestVal` — si nécessaire pour résoudre une valeur brute depuis les essais (`trials`).

**Non réutilisé, volontairement** : `BiomechanicalProfileEngine.compute()` lui-même (moyenne
pondérée continue) — logique incompatible avec la machine à états HYP (§5-6 de l'audit).

## Variables consommées

`testData.cmj` uniquement pour ce lot : `braking_rfd`, `braking_impulse`, `force_zero_vel`. Aucune
donnée nouvelle, aucun nouveau test requis, aucune modification du format de stockage `testData`.

## Ce que le lot calcule (silencieusement, sans affichage)

Pour un `testData.cmj` donné :
1. Statut individuel de chacune des 3 variables Core (via `applyThr` si un seuil catégoriel existe,
   sinon via une lecture du percentile normatif — **à trancher selon ce qui est réellement
   disponible pour chaque KPI**, vérifié variable par variable avant l'implémentation réelle, pas
   supposé ici).
2. Application des 5 profils RFD/Impulse/Force@0V déjà documentés (`HYP-ABS-01_V2.md` §4) — lecture
   qualitative uniquement (↓/=), sans seuil chiffré nouveau.
3. Sortie structurée (état du sous-domaine A), **jamais consommée par aucun autre module** —
   strictement un objet retourné par une fonction, non branché à `functionScores`, à l'UI, ni aux
   rapports.

## Tests nécessaires — 8 cas synthétiques (mission §13)

*Rappel : aucun seuil n'est inventé — chaque cas suppose un statut déjà déterminé par les primitives
existantes (`applyThr`/`normPercentile`), pas une valeur numérique choisie arbitrairement par ce
document.*

| # | Cas | Attendu |
|---|---|---|
| 1 | RFD↓ + Force@0V↓ | Profil "RFD↓ + Force@0V↓" — combinaison non explicitement couverte par les 5 profils déjà documentés (qui traitent RFD+Impulse+Force@0V ensemble, ou RFD+Impulse seuls) → à traiter comme cas non couvert, signalé, pas forcé dans un profil existant |
| 2 | RFD↓ + Impulse↓ | "Déficit global de capacité de freinage" (profil 1, `HYP-ABS-01_V2.md` §4) |
| 3 | RFD↓ + Impulse↓ + Force@0V↓ | "Déficit global de freinage/décélération" (profil 4) |
| 4 | RFD= + Impulse= + Force@0V= | Aucun déficit Core — sous-domaine A "OK" |
| 5 | Core conservé + DJ RSI↓ | Sous-domaine A "OK" ; sous-domaine D signale une caractérisation "absorption réactive limitée" sans faire basculer le Niveau 1 (cas déjà illustré, `HYP-ABS-01_V2.md` §11, "capacité conservée mais absorption réactive limitée") |
| 6 | Asymétrie d'absorption (`ecc_decel_rfd_asym` ou `ecc_decel_impulse_asym` anormale, Core par ailleurs normal) | Modificateur/précision uniquement — jamais un déficit Core généré seul (principe déjà gelé, non rouvert) |
| 7 | Capacité excentrique déficitaire (`cmj_ecc_mean_power`/`cmj_ecc_peak_vel`↓) mais Core conservé | Sous-domaine A "OK" ; sous-domaine B produit une explication ("capacité excentrique réduite pouvant contribuer...") sans jamais faire basculer le Niveau 1 |
| 8 | Stratégie anormale (`cmj_depth`/`cmj_braking_duration` hors norme) mais Core conservé | Sous-domaine A "OK" ; sous-domaine C produit une caractérisation de stratégie, jamais un déficit global |

**Cas 1, signalé explicitement plutôt que forcé** : la combinaison RFD↓+Force@0V↓ sans mention
d'Impulse n'est couverte par aucun des 5 profils déjà rédigés dans `HYP-ABS-01_V2.md` §4 — ce lot ne
doit **pas** inventer une sixième règle de profil pour le faire rentrer artificiellement dans une
catégorie existante ; le test doit vérifier que le moteur retourne une caractérisation honnête (les
deux signaux individuellement, sans conclusion de profil forcée), pas un profil inventé pour
l'occasion.

## Aucune conséquence clinique avant validation

Ce lot ne modifie, n'affiche, ni n'exporte rien vers le praticien. Il produit un objet JavaScript en
mémoire, dans un fichier de test, exécuté hors production (`node tests/hypEngineAbs01Lot1.test.js`).
Aucun impact sur `functionScores`, `TFM`, les écrans, l'Historique, l'ExpertView ou les rapports.

## Prochain lot (non fait ici, identifié seulement)

**LOT ABS-2** : sous-domaine E (Réception/Impact), désambiguïsation des variables Peak Landing Force
déjà cartographiées — indépendant de LOT ABS-1, testable séparément.

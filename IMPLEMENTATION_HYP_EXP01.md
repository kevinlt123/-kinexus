# Implémentation — HYP-EXP-01 dans Kinexus

**Statut** : implémenté et branché en production dans `index.html`. `fSc['Explosivité']` (sortie de
`computeMoteur()`) est désormais produit **intégralement** par le raisonnement clinique
HYP-EXP-01, y compris quand il ne peut rien déterminer (`status:null` explicite, même principe que
HYP-PUI-01 et HYP-FOR-01 — jamais de repli TFM silencieux).

---

### DIAGNOSTIC

Convergence obligatoire des deux seules preuves diagnostiques gelées : `cmj_conc_rfd` +
`cmj_conc_impulse_100`. Une seule preuve déficitaire → hypothèse non retenue (`suspectee`), jamais
de règle de proportion inventée. Aucune norme (ni `NORMS` ni `THRESHOLDS`) ne couvre aujourd'hui
ces deux variables — le moteur produit donc honnêtement `non_determinable` tant qu'au moins une des
deux preuves n'est pas classifiable. Il est structurellement prêt : dès qu'un seuil clinique
valide sera intégré pour l'une ou l'autre, la convergence 2/2 s'active automatiquement, sans
modification du moteur.

### EXPLICATION

- **Force/RFD** : distinction conservée — `iso_belt_squat_n` (capacité de force, lu en lecture
  seule, jamais reclassifié comme preuve diagnostique d'Explosivité) ; `imtp_rfd100`/`imtp_ttpf`
  (vitesse de développement de force, exposés en valeur brute, aucun seuil).
- **Biomécanique CMJ** : `cmj_depth`, `cmj_conc_duration`, `cmj_rsi_mod`, `cmj_ecc_mean_power`,
  `cmj_ecc_peak_vel` normés et classifiables (population-dépendant) ; `cmj_braking_rfd` conservé
  avec la réserve de nomenclature déjà documentée ailleurs dans le projet.
- Aucune de ces variables ne devient diagnostique du seul fait qu'elle est normée — leur rôle reste
  strictement explicatif, conformément à la règle « rôle clinique ≠ disponibilité normative ».

### PRÉCISION

`cmj` est un test bilatéral sans distinction D/G dans les sources consultées — aucun mécanisme
d'asymétrie propre n'existe pour Explosivité (à la différence de Force, où le LSI des tests
unilatéraux joue ce rôle). Documenté explicitement dans le champ `precision` du moteur plutôt que
d'inventer une asymétrie inexistante.

### LIMITATION

`cmj_conc_rfd` et `cmj_conc_impulse_100` n'ont aujourd'hui aucun seuil clinique exploitable (ni
`NORMS` ni `THRESHOLDS`) — vérifié directement dans `index.html`. Le diagnostic réel reste donc
`non_determinable` en pratique dans tous les cas réels actuels. Le moteur est prêt et testé
(mécanisme de convergence validé via injection temporaire de seuils en mémoire, jamais dans
`index.html`) pour devenir immédiatement opérationnel dès qu'une norme valide sera intégrée pour
l'une ou l'autre variable.

---

## CE QUI CHANGE

**Double rôle légitime de `cmj_conc_rfd`** : diagnostique pour Explosivité (ce moteur) ;
explicative pour Puissance (`computeHypPowerStrategie`, HYP-PUI-01, inchangé). Les deux moteurs
lisent la même donnée brute via deux chemins de code indépendants, sans état partagé ni promotion
automatique de l'un vers l'autre — conforme au principe d'étanchéité déjà établi entre Force et
Puissance.

**Variables explicitement exclues du diagnostic** (mission §6) : `cmj_peak_power` (conservé
uniquement comme confirmative documentée, jamais lu comme preuve diagnostique),
`slcmj_peak_power`, `cmj_height`, `slcmj_height`, DJ RSI, SLDJ RSI — aucun de ces noms n'apparaît
dans la logique diagnostique du moteur (vérifié par test dédié sur la sérialisation complète de
`hypExp01`).

**États** : modèle HYP existant réutilisé sans extension — `non_determinable` (0 ou 1 preuve
classifiable sur 2), `absente` (2 classifiables, 0 déficitaire), `suspectee` (2 classifiables, 1
déficitaire), `retenue_faible/moderee/forte` (2 classifiables et déficitaires, graduée par
convergence de `cmj_peak_power` puis des explicatives biomécaniques — mécanisme structurellement
présent, jamais atteint aujourd'hui faute de seuil diagnostique réel).

---

## Détail technique

### Architecture

`computeHypExplosivity01(testData, normPop, normAge)` — fonction pure, isolée, basée exclusivement
sur les primitives existantes (`applyThr`, `bestVal`, `testKpiDir`). Un helper générique unique,
`computeHypExplosivityCmjKpi(testData, kpi, key, pop, age)`, centralise la lecture de tout KPI CMJ
(diagnostique, confirmatif ou explicatif) sans duplication de logique de seuil.

### Intégration

Après le bloc HYP-FOR-01 (inchangé) et avant `var sysSc={};`, un bloc dédié réécrit
**intégralement** `fSc['Explosivité']` : `status:null` explicite quand `non_determinable`, sinon
dérivé de l'état (`absente`→vert, `suspectee`→jaune, `retenue_*`→orange, ou rouge si les deux
preuves sont littéralement catégorisées `'rouge'`). `hypExp01` (objet complet) toujours attaché
pour traçabilité. Aucune autre qualité, aucun autre output de `computeMoteur` n'est touché.

---

## Fichiers modifiés / créés

- **`index.html`** — seul fichier de production modifié. Purement additif : **+148 lignes,
  0 suppression** (`git diff --stat`).
- **`tests/hypExplosivity01.test.js`** — 15 tests, dont les 9 cas mandatés (§11) + mécanisme de
  convergence + exclusion de variables + non-régression.
- Ce document.

---

## Tests

`tests/hypExplosivity01.test.js` — **15 tests, tous passants** : les 6 combinaisons
normal/déficitaire/non-classifiable des deux preuves (cas 1 à 7, toutes → `non_determinable` avec
les normes réelles actuelles) ; cas 8 (explicatives déficitaires sans preuve diagnostique
suffisante → jamais d'hypothèse forcée) ; mécanisme de convergence validé via seuils temporaires
injectés en mémoire (jamais dans `index.html`) : absente/vert, suspectee/jaune, et cas 9
(`retenue_faible` + confirmative/explicatives présentes, support gradué correctement) ; exclusion
vérifiée de `cmj_height`/`dj_rsi`/etc. de toute la sortie sérialisée du moteur.

**Régression complète** : les 20 fichiers de tests réexécutés intégralement (`hypExplosivity01`
inclus) — **tous passants, aucune modification requise dans un autre fichier de test** (à la
différence de la mission HYP-FOR-01, aucune assertion préexistante ne supposait Explosivité
TFM-dérivée). Vérification syntaxique complète du contenu `<script>` d'`index.html`
(`node --check`) — **OK**. `git diff --stat` confirmé purement additif (+148/-0 dans `index.html`).

---

## RÉSUMÉ

- **Fichiers modifiés** : `index.html` (+148/-0 lignes).
- **Fichiers créés** : `tests/hypExplosivity01.test.js`, `IMPLEMENTATION_HYP_EXP01.md`.
- **Tests ajoutés** : 15, tous passants.
- **Tests existants passés** : tous (19 fichiers préexistants, aucune régression, aucune
  modification requise).
- **Autres qualités modifiées** : NON — vérifié par tests dédiés (Réactivité, Mobilité inchangées ;
  Absorption/Puissance/Force restent pilotées par leurs propres moteurs HYP) et par relecture du
  bloc d'intégration.
- **Règle de convergence 2/2 modifiée** : NON.
- **Seuil inventé** : NON.
- **`cmj_height`/`slcmj_height`/DJ RSI/SLDJ RSI utilisés comme preuve** : NON (vérifié par test).
- **`cmj_peak_power` traité comme preuve diagnostique d'Explosivité** : NON — conservé strictement
  comme confirmative documentée.
- **HYP-EXP-01 réellement actif** : OUI — moteur branché et évalué à chaque calcul ; diagnostic
  réel `non_determinable` en pratique aujourd'hui (aucune norme sur les deux preuves), honnête
  partout, prêt à devenir opérationnel dès l'intégration d'un seuil clinique valide.

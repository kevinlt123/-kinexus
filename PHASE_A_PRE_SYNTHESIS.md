# Phase A — Pré-synthèse (clôture de l'audit TFM vs Vierge_7)

## Statut de ce document

Document de clôture de la Phase A, produit à la demande du praticien après l'audit des 9 qualités
`TFM` (`AUDIT_TFM_VS_VIERGE7.md`). **Ce n'est pas une synthèse finale** : aucune recommandation,
aucune proposition de correction, aucun arbitrage des contradictions Vierge_7 relevées en cours
d'audit. Uniquement une consolidation objective de ce qui a déjà été documenté, pour préparer la
décision du praticien sur la suite (Phase B).

**Périmètre** : ce document couvre l'audit `TFM` (9 qualités, seul mécanisme qui produit
effectivement les qualités/jauges/priorités/hypothèses/orientations affichées au praticien —
établi par `KINEXUS_ENGINE_MAP.md`). L'audit `VAR_REL3` (`AUDIT_VAR_REL3_VS_VIERGE7.md`, 4 qualités :
Puissance, Réactivité, Absorption, Stabilisation) reste un document séparé, pertinent pour le
panneau Capacités et le détail de variable dans ExpertView — il est cité ici uniquement quand ses
constats corroborent ou éclairent un constat `TFM`.

---

## 1. Vue d'ensemble — les 9 qualités

| Qualité | Gravité | Ratio dilution (X/Y) | Profil dominant | Principales violations |
|---|---|---|---|---|
| Mobilité | 🔴 Critique | 5/1 = 5,0 | Violation d'exclusion | `df_iso`, `inv_iso`, `ev_iso` (tests de force, poids 1-2) et `ybt` (poids 1) — 4 des 5 contributeurs (80 %) violent la règle "évaluée uniquement par le WBLT" |
| Force | 🔴 Critique | 40/4 = 10,0 | Exclusion + dilution | 7 tests explicitement exclus actifs (CMJ/SLCMJ/DJ/SLDJ/Landing/SLLT) ; 7 tests segmentaires à poids maximal (3), à égalité stricte avec les tests diagnostiques réels ; `profil_fv` (Puissance) contaminant à poids maximal — 36/40 contributeurs (90 %) à corriger |
| Puissance | 🔴 Critique | 25/2 = 12,5 | Dilution diagnostique pure | Aucune violation d'exclusion, mais `imtp`/`slimtp`/`profil_fv` à poids maximal (3), à égalité avec `cmj`/`slcmj` — 19/25 contributeurs (76 %) à corriger |
| Réactivité | 🔴 Critique | 19/2 = 9,5 | Hybride (dilution + exclusion) | `cmjr` à poids maximal (3, aucun rôle diagnostique chez Vierge_7) ; `wblt` et `heel_raise` explicitement exclus mais actifs ; `cmj`/`slcmj` contaminants (Puissance) |
| Explosivité | 🔴 Critique | 23/2 = 11,5 | Donnée manquante | `cmjr` exclu actif (seul, poids 1) ; surtout — la preuve diagnostique Vierge_7 (RFD CMJ fenêtré 100/150/200ms) n'existe qu'à moitié dans Kinexus, plafonnant le gain atteignable même après correction complète de `TFM` |
| Absorption | 🟠 Important | 35/4 = 8,75 | Limite structurelle TFM | 4 violations d'exclusion à poids faible (`single_hop`/`triple_hop`/`crossover_hop`/`heel_raise`) ; risque de contamination interne de `dj`/`sldj` par `dj_rsi`/`sldj_rsi` (exclus) via `computeTestStatus`, non confirmé faute d'audit `NORMS` complet |
| Stabilisation | 🔴 Critique | 32/6 = 5,33 | Exclusion inter-qualités (sous-type) | `sllt` à poids maximal (3) alors qu'il appartient exclusivement au diagnostic d'Absorption — confirmé indépendamment côté `VAR_REL3` ; 3 violations mineures (`knee_ext`/`soleus_iso`/`gastro_iso`) ; incohérence interne `TFM` (`eo`:1 vs `ef`:2, même famille Vierge_7) |
| Contrôle Sensori-moteur | 🟡 Mineur | 5/6 = 0,83 | Confusion de spécification (Vierge_7) | Aucune violation d'exclusion, aucun promoteur illégitime — seul écart : la famille "Landing" (diagnostique chez Vierge_7) n'est pas rattachée à `TFM` ; Vierge_7 spécifie une base de preuves quasi identique à celle de Stabilisation |
| Endurance | 🟡 Mineur | 9/2 = 4,5 | Violation d'exclusion isolée | `cmjr` seul (poids 2) ; palier maximal (`repeated_hop`/`heel_raise`) intégralement conforme, aucune contamination KPI→Test possible |

**Répartition de gravité** : 6 qualités sur 9 en 🔴 Critique, 1 en 🟠 Important, 2 en 🟡 Mineur.
Aucune qualité en 🟢 Conforme.

---

## 2. Motifs architecturaux observés (classement par fréquence)

| Rang | Motif | Fréquence | Nature |
|---|---|---|---|
| 1 | **Violation d'exclusion** — un test explicitement exclu par Vierge_7 est activement pondéré | 7/9 qualités | Écart de classification, gravité très variable selon le poids (🟡 à 🔴) |
| 1 | **Dilution diagnostique** — des tests confirmatifs/explicatifs partagent le poids des tests diagnostiques réels | 7/9 qualités | Écart de classification, le plus sévère quand il touche le palier de poids maximal |
| 1 | **Contamination croisée** — un test légitime d'une autre qualité, sans exclusion nommée, est pondéré ici | 7/9 qualités | Écart de classification, généralement à poids modéré |
| 4 | **Limite structurelle TFM** (grain test, pas KPI) | Présente en principe sur 9/9 qualités (propriété de conception de `TFM`) ; **confirmée avec impact concret sur 3/9** (Mobilité, Explosivité, Absorption) ; **explicitement infirmée sur 2/9** (Contrôle Sensori-moteur, Endurance) | Propriété structurelle, pas systématiquement un défaut actif |
| 5 | **Construction KPI→Test** (sous-catégorie de la limite structurelle, contamination interne à `computeTestStatus`) | Vérifiée explicitement sur 5/9 qualités ; **confirmée active sur 2/9** (Explosivité via `cmj_height`, Absorption — hypothèse — via `dj_rsi`/`sldj_rsi`) ; **confirmée absente sur 3/9** (Stabilisation, Contrôle Sensori-moteur, Endurance) | Non vérifiée sur Mobilité/Force/Puissance/Réactivité — limite méthodologique du registre, pas absence du motif |
| 6 | **Confusion entre qualités voisines — spécification Vierge_7** (evidence quasi identique entre deux fiches) | 1 paire (Stabilisation ↔ Contrôle Sensori-moteur) + 1 résidu mineur déjà clarifié (Réactivité ↔ Endurance) | Écart de spécification, indépendant de `TFM` |
| 7 | **Donnée manquante** (KPI Vierge_7 non calculable dans Kinexus) | 1/9 dominant (Explosivité) | Seule qualité où la correction de `TFM` seule ne suffit pas |
| 8 | **Incohérence de configuration interne à `TFM`** (indépendante de Vierge_7) | 1/9 (Stabilisation) | `eo`/`ef` et `hip_ext`/`hip_abd`/`hip_add` traités différemment sans justification |
| 9 | **Dépendance `NORMS` non filtrée** (statut d'un test sans seuil statique de secours) | 1/9 identifiée (`repeated_hop`/Endurance), non recherchée systématiquement ailleurs | Risque opérationnel distinct d'une contamination |

---

## 3. Familles d'écarts observées

Regroupements descriptifs, avec niveau de confiance explicite — aucun n'a été forcé pendant les
audits individuels.

### Famille « Violation d'exclusion dominante, poids fort »
**Qualités** : Mobilité, Force.
**Confiance** : Élevée — dans les deux cas, la majorité des contributeurs (80–90 %) sont des tests
explicitement exclus par Vierge_7, à des poids substantiels (2-3).
**Contre-exemple** : Stabilisation partage le trait "violation d'exclusion à poids maximal" (`sllt`)
mais avec un seul test concerné, pas une majorité de contributeurs — traitée comme un sous-type
distinct plutôt qu'un membre plein de cette famille (voir audit TFM §7.12).

### Famille « Dilution diagnostique pure, sans exclusion »
**Qualités** : Puissance (seul exemple net).
**Confiance** : Modérée (n=1) — le trait distinctif (zéro violation d'exclusion, dilution
uniquement au palier maximal) n'a pas d'autre occurrence aussi propre dans l'audit.
**Contre-exemple** : Contrôle Sensori-moteur et Endurance ont aussi zéro/quasi-zéro violation
d'exclusion, mais sans dilution significative — trait opposé, pas voisin.

### Famille « Hybride dilution + exclusion, sévérité intermédiaire »
**Qualités** : Réactivité.
**Confiance** : Modérée (n=1) — combine des traits des deux familles précédentes sans dominance
claire de l'une sur l'autre.

### Famille « Donnée manquante, plafond au-delà de la reconfiguration »
**Qualités** : Explosivité (seul exemple confirmé).
**Confiance** : Élevée pour cette qualité spécifique, mais aucune généralisation possible — c'est
la seule qualité où l'audit a établi qu'une correction complète de `TFM` ne suffirait pas.
**Contre-exemple à surveiller en Phase B** : Absorption a un problème de couverture KPI
documenté côté `VAR_REL3` (landing_uni/landing_bi pauvres en KPIs), mais celui-ci n'affecte pas le
score `TFM` de la même façon (protège même certains tests de la contamination interne, audit TFM
§6.4) — la couverture de données n'a donc pas un effet uniforme selon le mécanisme audité.

### Famille « Contamination d'une qualité entière, concentrée sur un seul test au palier maximal »
**Qualités** : Stabilisation (`sllt` = Absorption tout entier).
**Confiance** : Élevée pour ce cas précis, corroboré indépendamment par l'audit `VAR_REL3`.
**Généralisable ?** Non établi — aucune autre qualité TFM ne présente une contamination aussi
concentrée sur un seul test à poids maximal (Réactivité s'en approche avec `cmjr`, mais Réactivité
cumule aussi de la dilution diffuse, ce que Stabilisation ne fait pas au même degré).

### Famille « Configuration quasi propre, fidèle à Vierge_7 »
**Qualités** : Contrôle Sensori-moteur, Endurance.
**Confiance** : Élevée — les deux partagent : palier maximal intégralement conforme, dilution
quasi nulle, et (vérifié explicitement) aucune contamination KPI→Test.
**Différence entre les deux** : Endurance conserve une violation d'exclusion isolée (`cmjr`) ;
Contrôle Sensori-moteur n'en a aucune mais porte à la place une confusion de spécification avec
Stabilisation.

### Axe transversal, indépendant des familles ci-dessus : « Confusion de spécification Vierge_7 »
**Qualités concernées** : Contrôle Sensori-moteur ↔ Stabilisation (majeure), Réactivité ↔
Endurance (mineure, largement clarifiée par la lecture croisée effectuée pendant l'audit
Endurance).
**Confiance** : Élevée sur l'existence du chevauchement textuel (vérifié mot pour mot) ; aucune
confiance à établir sur sa cause (économie rédactionnelle vs redondance conceptuelle réelle) —
question ouverte pour le praticien, pas pour cet audit.

---

## 4. Top 10 des constats les plus structurants de la Phase A

Sans recommandation. Sans solution. Uniquement des constats objectivement supportés par les
audits déjà documentés (`KINEXUS_ENGINE_MAP.md`, `AUDIT_VAR_REL3_VS_VIERGE7.md`,
`AUDIT_TFM_VS_VIERGE7.md`).

1. **Deux mécanismes de pondération coexistent dans Kinexus, avec des responsabilités très
   inégales.** `TFM` produit seul les qualités, jauges, priorités, hypothèses et orientations
   affichées au praticien. `VAR_REL3` alimente uniquement le panneau Capacités et le détail de
   variable (ExpertView) ; son propre calcul de score par qualité (`qualityScores`, 9 noms) est
   généré à chaque bilan mais n'est consommé par aucun écran — un moteur fantôme confirmé.

2. **Sur 9 qualités `TFM` auditées, 6 sont en gravité 🔴 Critique, 1 en 🟠, 2 en 🟡 — aucune en
   🟢.** Aucune qualité n'est aujourd'hui pleinement conforme à Vierge_7, y compris les deux
   qualités les plus propres (Contrôle Sensori-moteur, Endurance).

3. **Un même motif domine 7 des 9 qualités : au palier de poids maximal de `TFM`, des tests
   confirmatifs ou explicatifs (jamais diagnostiques selon Vierge_7) partagent le même poids que
   les vrais tests diagnostiques**, sans aucune hiérarchie interne entre les deux catégories.
   Observé sous des formes différentes sur Force (7 tests segmentaires), Puissance (`imtp`/
   `slimtp`/`profil_fv`), Réactivité (`cmjr`) et Stabilisation (`sllt`).

4. **Force cumule la plus grande sévérité de l'audit** : 40 tests contributeurs contre 4 attendus
   par Vierge_7, 7 violations d'exclusion actives, et 90 % des contributeurs actuels à retirer ou
   reclasser — la proportion la plus élevée de toute la Phase A, `VAR_REL3` compris.

5. **`sllt` est activement pondéré au poids maximal pour Stabilisation dans `TFM`, alors que
   Vierge_7 l'exclut nommément de cette qualité et le réserve entièrement à Absorption (où il est
   par ailleurs 100 % conforme).** Ce constat a été établi indépendamment sur deux mécanismes de
   pondération distincts (`VAR_REL3` et `TFM`, conçus séparément) — c'est la confirmation la plus
   solide de tout l'audit qu'il s'agit d'une confusion clinique de fond, pas d'un artefact
   d'implémentation isolé.

6. **`cmjr` est activement pondéré au poids maximal pour Réactivité dans `TFM`, sans aucun rôle
   diagnostique chez Vierge_7 (confirmative et explicative biomécanique uniquement).** Le même
   excès existe côté `VAR_REL3`, où il est cependant rendu inerte par une anomalie d'orthographe
   documentée séparément (accord `Réactivité`/`Reactivite`) — deux mécanismes indépendants
   contiennent la même erreur, l'un actif, l'autre neutralisé par accident.

7. **Explosivité est la seule qualité où une reconfiguration complète de `TFM` ne suffirait pas à
   atteindre la question clinique de Vierge_7.** La preuve diagnostique visée (RFD du CMJ fenêtré
   à 100/150/200 ms) n'existe que partiellement dans le catalogue de KPIs Kinexus, qui ne calcule
   qu'un RFD concentrique non fenêtré et une impulsion à 100 ms.

8. **`computeTestStatus()` agrège tous les KPIs seuillés d'un test sans distinguer leur rôle
   clinique — un mécanisme confirmé actif sur 2 qualités et explicitement vérifié absent sur 3
   autres.** Sur Explosivité, le statut du test `cmj` risque d'être dominé par `cmj_height`
   (explicitement exclu). Sur Absorption, le statut de `dj`/`sldj` risque d'être influencé par
   `dj_rsi`/`sldj_rsi` (explicitement exclus). À l'inverse, sur Stabilisation, Contrôle
   Sensori-moteur et Endurance, la vérification explicite n'a trouvé aucune contamination possible
   — soit parce que le test n'a qu'un seul KPI (`eo`, `ef`, `strobo`, `heel_raise`), soit parce que
   la quasi-totalité de son catalogue de KPIs est légitimement diagnostique pour la qualité
   concernée (`sls`, `repeated_hop`).

9. **Vierge_7 lui-même contient des redondances et incohérences documentées, indépendantes de
   toute question d'implémentation Kinexus.** La fiche "Force" existe en double, avec deux
   philosophies cliniques contradictoires (résolu par le choix de la version cohérente en
   nommage, avec validation du praticien). La fiche "Explosivité" mélange deux conventions de
   nommage en son sein. Les fiches "Stabilisation" et "Contrôle Sensori-moteur" spécifient, mot
   pour mot, la même base de preuves diagnostiques et confirmatives pour deux qualités
   nominalement distinctes — sans qu'aucun de ces trois constats ne soit tranché par cet audit.

10. **Les deux qualités les plus fidèles à Vierge_7 (Contrôle Sensori-moteur, Endurance) doivent
    leur propreté à une même propriété structurelle involontaire** : leurs tests diagnostiques
    principaux ont, dans le catalogue Kinexus, soit un seul KPI possible (`eo`, `ef`, `strobo`,
    `heel_raise`), soit un catalogue de KPIs presque entièrement composé de variables légitimement
    diagnostiques pour cette qualité (`sls`, `repeated_hop`) — les protégeant, par construction,
    de la contamination interne que subissent des tests plus riches en KPIs comme `cmj`, `dj` ou
    `sldj`. La propreté de ces deux qualités n'est donc pas le résultat d'une conception
    délibérée, mais d'une coïncidence de couverture de catalogue.

---

## Documents sources de cette pré-synthèse

- `KINEXUS_ENGINE_MAP.md` — cartographie des moteurs réels de Kinexus.
- `AUDIT_TFM_VS_VIERGE7.md` — audit complet des 9 qualités `TFM` (source principale de ce document).
- `AUDIT_VAR_REL3_VS_VIERGE7.md` — audit complémentaire de 4 qualités `VAR_REL3` (Puissance,
  Réactivité, Absorption, Stabilisation), cité ici en corroboration.

# HYP-PUI-01 — Règle finale gelée : Capacité / Stratégie / Mixte / Non discriminable

**Statut : GELÉ.** Toutes les décisions cliniques (Q1, Q2, Niveau 2, résolution D3/D4) sont actées
et validées explicitement par le praticien. Ce document consolide, sans les rouvrir, les documents
`HYP_PUI_CAPACITE_VS_STRATEGIE.md`, `HYP_PUI_CAPACITE_STRATEGIE_V1.md`,
`ARBITRAGE_CLINIQUE_PUI_CAPACITE_STRATEGIE.md`, `ARBITRAGE_FINAL_PUI_CAPACITE_STRATEGIE.md`,
`DEFINITION_NIVEAU2_PUI_STRATEGIE.md`. Aucun code n'est modifié. Aucune autre qualité n'est
concernée. Aucun `CLI###` n'est modifié.

**⚠️ Point de contradiction signalé, non résolu silencieusement** : le message de mission suivant
("CARTOGRAPHIE CLINIQUE CMJ/SLCMJ") recopie dans son contexte à la fois *"Force + RFD obligatoires
pour l'éligibilité de la branche Stratégie"* **et**, deux lignes plus loin, *"RFD facultative...
elle ne doit pas être obligatoire pour conclure à une Stratégie"* — ces deux formulations sont
directement contradictoires. Ce document fige la règle sur la base de la validation explicite et non
ambiguë reçue juste avant ("Force + RFD = familles obligatoires... TTPF + Profil F-V = facultatifs").
**Si la seconde formulation reflète un changement d'avis réel (RFD devenue facultative), ce document
devra être révisé** — à confirmer.

---

## 1. Règle finale en langage praticien

> Quand Kinexus détecte une Puissance déficitaire, il regarde séparément les variables
> physiologiques (force, RFD, TTPF, profil force-vitesse) et les variables biomécaniques du saut.
> Une seule famille physiologique déficitaire donne un signal faible de déficit de capacité ; deux
> familles distinctes déficitaires ou plus permettent de retenir ce déficit plus fermement. Pour
> qu'un problème de stratégie d'exécution soit retenu, il faut que la force **et** le RFD aient été
> réellement testés (peu importe le résultat) — sans ce test, impossible de conclure, quelle que
> soit l'anomalie biomécanique observée. Si une déficience physiologique est présente en même temps
> qu'une anomalie biomécanique compatible, les deux sont affichées ensemble comme un profil mixte,
> sans que l'une ne soit désignée comme la cause principale.

## 2. Matrice des états

| Capacité (physiologique) | Stratégie — couverture (Force+RFD testées) | Stratégie — biomécanique anormale | **Résultat** |
|---|---|---|---|
| Absente (0 famille ↓) | ✓ | Oui | **STRATÉGIE** |
| Absente (0 famille ↓) | ✓ | Non | Aucun mécanisme identifié (« signal isolé », hors périmètre) |
| Absente ou signal | ✗ (Force et/ou RFD non testées) | Oui | **NON DISCRIMINABLE** |
| Absente | ✗ | Non | **NON DISCRIMINABLE** |
| Signal faible (1 famille ↓) | ✓ | Oui | **MIXTE** (capacité signal faible + stratégie retenue) |
| Retenue (≥2 familles ↓) | ✓ | Oui | **MIXTE** (capacité retenue + stratégie retenue) |
| Signal faible ou Retenue | — | Non | **CAPACITÉ** (signal faible ou retenue selon convergence) |

*Familles physiologiques : Force, RFD (obligatoires pour la couverture Stratégie) · TTPF, Profil
Force-Vitesse (facultatives pour la couverture, mais actives dans l'analyse Capacité si testées).*

## 3. Les 10 cas synthétiques

| # | Force | RFD | TTPF | Profil F-V | Biomécanique | **Résultat** |
|---|---|---|---|---|---|---|
| 1 | ↓ | normale | non testée | non testée | normale | CAPACITÉ — signal faible |
| 2 | ↓ | ↓ | — | — | normale | CAPACITÉ — retenue |
| 3 | normale | normale | non testée | non testée | anormale | STRATÉGIE |
| 4 | normale | **non testée** | — | — | anormale | NON DISCRIMINABLE |
| 5 | ↓ | normale | — | — | anormale | MIXTE (signal faible + stratégie) |
| 6 | ↓ | ↓ | — | — | anormale | MIXTE (retenue + stratégie) |
| 7 | normale | normale | **↓** | non testée | normale | CAPACITÉ — signal faible (via TTPF) |
| 8 | normale | normale | non testée | **↓** | anormale | MIXTE (signal via F-V + stratégie) |
| 9 | **non testée** | **non testée** | non testée | non testée | anormale | NON DISCRIMINABLE |
| 10 | normale | normale | normale | normale | normale | Aucun mécanisme identifié (« signal isolé ») |

## 4. Fichiers à modifier lors de l'implémentation (non fait ici)

- `hyp_engine_lot1.js` — extension de `HYP_CATALOG['HYP-PUI-01']` et de
  `computeHypothesisEngine()` : ajout des 34 variables physiologiques (4 familles) et des 29
  variables biomécaniques CMJ/SLCMJ, ajout de la logique Capacité/Stratégie/Mixte/Non discriminable
  décrite ci-dessus.
- `tests/hypEngineLot1.test.js` (ou nouveau fichier de test dédié) — couverture des 10 cas
  synthétiques ci-dessus comme assertions.
- `PHASE_H_TECHNICAL_SPECIFICATION.md` — modèle de données `Hypothesis`/`Support` (§1.3) à étendre
  pour transporter la sous-classification Capacité/Stratégie/Mixte/Non discriminable comme métadonnée
  — pas de code, mise à jour de la spécification au moment de l'implémentation réelle.
- **`index.html` — non concerné à ce stade** (Shadow Mode non activé, aucune UI à modifier).
- **`CLI###` — non concernés**, confirmé inchangés (§9 de `HYP_PUI_CAPACITE_STRATEGIE_V1.md`).

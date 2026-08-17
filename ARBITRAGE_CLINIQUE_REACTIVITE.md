# Arbitrage et gel clinique — HYP-REA-01 (Réactivité)

**Statut : décisions actées par le praticien, transcrites ci-dessous.** Aucun code modifié, aucune
modification de `TFM`, aucune modification de `CLI###`, aucun écran modifié. Ce document fige le
comportement clinique **cible** de `HYP-REA-01` — aucune implémentation n'est faite ici.

---

## 1. Décision globale

`HYP-REA-01` repose sur **deux preuves diagnostiques uniquement** : `dj_rsi` et `sldj_rsi`
(conjointement, 2/2 — règle déjà gelée, non rouverte). Aucun autre test ne peut générer ni faire
retenir `HYP-REA-01`. CMJR et Repeated Hop peuvent, sous condition, contribuer à **expliquer** un
déficit déjà diagnostiqué — jamais à le créer. Heel Raise et Side Hop restent hors Réactivité.

---

## 2. CMJR

**Décision : `cmjr_mean_rsi` = NON DIAGNOSTIQUE pour `HYP-REA-01`.**

**Contradiction affichée, non résolue** :
> FICHE HYP (*"jamais diagnostique"*) ≠ `CLI050` (*compte `cmjr_mean_rsi` parmi les preuves
> diagnostiques*) ≠ TFM (`reactivite:3`, poids maximal, identique à DJ/SLDJ)

**Raisonnement retenu** : la fiche de qualité de Réactivité fait foi pour `HYP-REA-01` — `dj_rsi` et
`sldj_rsi` restent les seules preuves diagnostiques. Le poids maximal de TFM (3/3) ne suffit pas à
transformer `cmjr_mean_rsi` en preuve diagnostique HYP — les deux moteurs n'obéissent pas à la même
logique (score continu pondéré vs catégories discrètes). La contradiction avec `CLI050` n'est **pas**
arbitrée pour de bon ici : elle est actée pour la construction de `HYP-REA-01`, et reste documentée
comme non résolue au niveau de Vierge_7 lui-même.

**Règle retenue** : `cmjr_mean_rsi` ne peut jamais, seule, générer ou faire retenir `HYP-REA-01`. Elle
peut servir d'information complémentaire/explicative **si** son rôle explicatif est explicitement
établi par les sources (déjà le cas pour les 6 KPI CMJR listés dans la fiche de qualité,
`CARTOGRAPHIE_REACTIVITE_HYP_REA01.md` §5).

---

## 3. Repeated Hop

**Décision : Repeated Hop = EXPLICATIF pour Réactivité, pour l'instant. Jamais diagnostique. Ne peut
pas générer `HYP-REA-01`.**

**Justification retenue** : les sources ne démontrent pas qu'un déficit de Repeated Hop constitue une
preuve diagnostique autonome de Réactivité. TFM lui attribue `reactivite:2` ; `HYP-REA-01` l'exclut du
diagnostic (`CARTOGRAPHIE_REACTIVITE_HYP_REA01.md` §4, "Variables exclues" de la fiche). Cette
divergence est documentée, pas corrigée.

**Règle retenue** : DJ/SLDJ → diagnostic de Réactivité. Repeated Hop → caractérisation/explication du
profil, jamais générateur. Si les sources futures permettent d'établir un rôle confirmatif précis, il
pourra être ajouté ultérieurement — non fait ici.

**Point laissé explicitement ouvert (non tranché par cette décision)** : la portée exacte de
l'exclusion textuelle (*"toutes les variables `repeated_hop_*` de fatigue/dégradation"*) — lecture
stricte vs lecture large — reste non arbitrée. La décision ci-dessus ("explicatif, jamais
diagnostique") s'applique quelle que soit la lecture retenue pour cette ambiguïté résiduelle.

---

## 4. Heel Raise

**Décision : Heel Raise = HORS RÉACTIVITÉ.** Aucun rôle diagnostique, confirmatif, ni explicatif dans
`HYP-REA-01`.

**Justification** : `HYP-REA-01` l'exclut explicitement (`heel_raise_reps` cité nommément dans
"Variables exclues"). TFM lui attribue `reactivite:1` — ce poids n'est pas considéré comme une preuve
suffisante pour lui attribuer une destination clinique dans Réactivité.

**Important** : cela ne signifie pas que Heel Raise est inutile. Le test reste présent dans Kinexus
et pourra recevoir une destination dans une autre qualité (Endurance, déjà identifiée comme
diagnostique pour `heel_raise_reps` ailleurs) si le référentiel clinique le justifie — non traité ici.

---

## 5. Side Hop

**Décision : Side Hop = HORS RÉACTIVITÉ.** Aucun rôle diagnostique, confirmatif, ni explicatif dans
`HYP-REA-01`.

**Justification** : Side Hop n'apparaît dans aucun inventaire vérifié de `HYP-REA-01`. TFM lui
attribue `reactivite:1`. Aucune source suffisamment solide ne permet aujourd'hui de lui attribuer une
destination clinique dans Réactivité.

**Important** : son rôle n'est pas déduit de sa nature biomécanique. Il reste disponible dans Kinexus
et pourra recevoir une destination ultérieure si le référentiel est enrichi — non fait ici.

---

## 6. Règle HYP-REA-01 résultante

```
                    RÉACTIVITÉ
                        │
             ┌──────────┴──────────┐
             │                     │
        DIAGNOSTIC            EXPLICATION
             │                     │
        DJ RSI                 CMJR
        SLDJ RSI               Repeated Hop
             │
             ↓
        HYP-REA-01
```

Heel Raise et Side Hop **ne sont pas ajoutés** à ce schéma, dans aucune branche.

---

## 7. Cas cliniques figés

| Cas | Données | Conclusion |
|---|---|---|
| **A** | DJ↓, SLDJ normal, CMJR↓ | CMJR ne permet pas de retenir Réactivité à lui seul. Réactivité reste dépendante de la règle diagnostique DJ/SLDJ — ici, 1/2 seulement → au mieux Suspectée, jamais Retenue du seul fait de CMJR. |
| **B** | DJ normal, SLDJ normal, CMJR↓ | `HYP-REA-01` **non retenue** sur la seule base de CMJR. |
| **C** | DJ↓, SLDJ↓, CMJR normal | Réactivité **retenue** selon la règle diagnostique HYP (2/2), indépendamment du statut de CMJR. |
| **D** | DJ↓, SLDJ↓, Repeated Hop↓ | Réactivité diagnostiquée par DJ/SLDJ. Repeated Hop apporte une information explicative supplémentaire. Il ne constitue pas une preuve diagnostique indépendante. |
| **E** | DJ normal, SLDJ normal, Repeated Hop↓ | Repeated Hop seul **ne génère pas** `HYP-REA-01`. |
| **F** | DJ normal, SLDJ normal, Heel Raise↓ | Aucune conclusion Réactivité — Heel Raise hors Réactivité. |
| **G** | DJ normal, SLDJ normal, Side Hop↓ | Aucune conclusion Réactivité — Side Hop hors Réactivité. |

---

## 8. Écart HYP-REA-01 ↔ TFM

| Test | Rôle HYP-REA-01 (cible) | Poids TFM (`reactivite`) | Écart |
|---|---|---|---|
| CMJR | Explicatif, jamais diagnostique | 3 (poids maximal, = DJ/SLDJ) | Écart maximal — TFM traite CMJR comme aussi déterminant que les vraies preuves diagnostiques |
| Repeated Hop | Explicatif, jamais diagnostique | 2 | Écart significatif — TFM le compte dans le score alors que HYP l'exclut du diagnostic |
| Heel Raise | Hors Réactivité | 1 | Écart — TFM lui donne un poids non nul dans un score dont HYP l'exclut totalement |
| Side Hop | Hors Réactivité | 1 | idem |

**TFM n'est pas corrigé par ce document.** Ces quatre écarts restent actifs dans le score affiché
aujourd'hui au praticien, tant qu'aucune implémentation n'est décidée séparément.

---

## 9. Points restant ouverts

Non tranchés ici, volontairement :
- Le rôle confirmatif précis de CMJR (au-delà de son rôle explicatif déjà établi).
- Les sous-catégories exactes des variables Repeated Hop (portée de l'exclusion textuelle, §3).
- La destination future éventuelle de Heel Raise (probablement Endurance, non actée ici).
- La destination future éventuelle de Side Hop.
- Toute nouvelle orientation `CLI` qui ne figure pas déjà dans les sources — aucune n'est créée.

---

## Tableau final

| Élément | Rôle HYP-REA-01 | Peut diagnostiquer ? | Peut expliquer ? | Statut |
|---|---|---|---|---|
| DJ RSI | Diagnostique | Oui | — | Acté |
| SLDJ RSI | Diagnostique | Oui | — | Acté |
| CMJR | Explicatif / complémentaire si source confirmée | NON | Oui si explicitement établi | Acté |
| Repeated Hop | Explicatif | NON | Oui | Acté |
| Heel Raise | Hors Réactivité | NON | NON | Acté |
| Side Hop | Hors Réactivité | NON | NON | Acté |

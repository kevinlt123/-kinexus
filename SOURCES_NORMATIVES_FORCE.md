# Sources normatives disponibles — déblocage de Force

**Statut** : recherche uniquement. Aucun code modifié, aucun seuil créé, aucune recherche externe
(Internet). Recherche limitée au dépôt et aux fichiers du projet.

---

## 1. Recherche des sources existantes

Recherche effectuée dans l'intégralité du dépôt (`*.md`, `index.html`, `tests/*.js`,
`analysis/*.js`) pour : VALD, IMTP, SLIMTP, "isometric mid-thigh pull", "single-leg IMTP", normes,
norms, normative, reference values, percentile, population, age, sex, sport.

**Constat structurel préalable** : le dépôt ne contient **aucun fichier PDF, aucun fichier de
données brutes (CSV/JSON/XLS) et aucun autre fichier binaire ou texte contenant des tables
normatives**. Toutes les données normatives présentes dans le projet vivent **exclusivement**
dans l'objet `NORMS` d'`index.html` (`index.html:1214-1470` environ). L'historique des tâches du
projet mentionne des sources externes désormais absentes du dépôt : *"Extraire les données
normatives de 4 rapports PDF VALD"*, *"Extraire les tables normatives ForceDecks du guide Force
Plates"*, *"Ajouter les normes de population générale par âge (IMTP + CMJ par âge/sexe)"* — ces
PDF sources ne sont **plus présents dans le dépôt aujourd'hui** ; seul ce qui a été effectivement
transcrit dans `NORMS` est vérifiable.

Recherche des 6 fichiers `.md` mentionnant "VALD" (`AUDIT_SEUILS_HYP_FOR01.md`,
`AUDIT_PROFIL_ABSORBEUR_VS_HYP.md`, `AUDIT_ARCHITECTURE_ABSORPTION_VS_HYP.md`,
`COMPARAISON_FORCE_PUISSANCE_ETANCHEITE.md`, `INTERPRETATION_VARIABLES_PUISSANCE.md`,
`AUDIT_VAR_REL3_VS_VIERGE7.md`) : toutes les occurrences renvoient à `valdName` (convention de
nommage VALD des KPI, ex. *"Peak Power / BM"*) ou à des constats déjà documentés dans
`AUDIT_SEUILS_HYP_FOR01.md` — **aucune ne contient de table de valeurs normatives**. Recherche des
23 fichiers `.md` mentionnant `df_iso`/`inv_iso`/`ev_iso`/`sh_iso_3030`/`sh_iso_6060` : toutes les
occurrences sont des références de rôle clinique (variable citée dans une fiche, un tableau de
statut, une matrice) — **aucune ne contient de valeur numérique de percentile ou de seuil**.

Aucune simple mention textuelle n'a été retenue comme norme exploitable, conformément à
l'instruction.

---

## 2. IMTP (`imtp_n`)

Recherché : population, sexe, âge, unité, valeur de référence, percentiles.

**Résultat : rien de ce qui précède n'existe dans le dépôt pour `imtp_n`.** Ni dans `NORMS`
(vérifié à nouveau, aucune entrée), ni dans `THRESHOLDS`, ni dans aucun document `.md`, ni dans
aucun fichier de test. La seule occurrence du nom `imtp_n` en dehors de sa définition de KPI
(`index.html:106`) est dans le catalogue de métadonnées narratif (`index.html:4009`) — un nom de
variable, sans valeur.

**« Aucun seuil clinique exploitable actuellement disponible. »**

---

## 3. SLIMTP (`slimtp_n`)

Même recherche, même résultat : aucune population, aucun âge, aucune unité de référence, aucun
percentile trouvé nulle part dans le dépôt pour `slimtp_n`.

**« Aucun seuil clinique exploitable actuellement disponible. »**

---

## 4. Vérification des données VALD réellement présentes

Les seules données normatives réellement présentes et exploitables aujourd'hui vivent dans
`NORMS` (`index.html`). Elles couvrent, pour Force :

| Population | Variables Force couvertes | Sexe/âge | Utilisable |
|---|---|---|---|
| 13 populations sport `fd_*` (ForceDecks — football américain, basketball, soccer, athlétisme, rugby, hockey, AFL) | `iso_belt_squat_n`, `iso_belt_squat_nkg` | Par sport, H/F | Oui |
| `general_m` / `general_f` (population générale par âge) | `iso_belt_squat_n` **uniquement** (malgré une description de source citant "IMTP, CMJ", `index.html:1298-1299`) | Par tranche d'âge, H/F | Oui pour `iso_belt_squat_n` ; **aucune donnée `imtp_n` malgré la description** |
| `foot_m_senior` / `foot_f_senior` / `foot_f_youth` (football, VALD Women's Super League 2025/26) | `sl_iso_push_n`, `hip_flex_n`, `hip_add_n`, `hip_abd_n`, `soleus_iso_n` | Football, H/F, senior/jeune | Oui, pour ces 5 variables uniquement |

**Aucune de ces populations ne contient `imtp_n`, `slimtp_n`, `knee_ext_n`, `knee_flex_n`,
`hip_ext_n`, `gastro_iso_n`, `df_iso_n`, `inv_iso_n`, `ev_iso_n`, ni aucune variante
`sh_iso_3030`/`sh_iso_6060`, ni aucune variable RFD/TTPF.**

Ces données ne peuvent pas être reliées entre elles pour combler IMTP : ce sont des tests
biomécaniquement différents (IMTP = tirage isométrique bilatéral ; Belt Squat = squat isométrique
en ceinture ; Single Leg Push = poussée isométrique unilatérale) — utiliser la norme d'un test pour
en déduire un seuil pour un autre reviendrait à extrapoler une norme d'un test vers un autre,
explicitement exclu par la mission. Aucune extrapolation de ce type n'est proposée ici.

---

## 5. Conclusion — pas de seuil créé

Pour `imtp_n` et `slimtp_n` : **« Aucun seuil clinique exploitable actuellement disponible. »**
Aucun chiffre n'est proposé.

---

## 6. Autres variables Force bloquées (Niveau 2)

| Variable | Recherchée dans | Résultat |
|---|---|---|
| `df_iso_n`/`nkg` | `NORMS`, `THRESHOLDS`, tous `.md` | Aucune donnée trouvée |
| `inv_iso_n`/`nkg` | idem | Aucune donnée trouvée |
| `ev_iso_n`/`nkg` | idem | Aucune donnée trouvée |
| `sh_iso_3030_n`/`nkg` | idem | Aucune donnée trouvée |
| `sh_iso_6060_n`/`nkg` | idem | Aucune donnée trouvée |
| `knee_ext_n`, `knee_flex_n`, `hip_ext_n`, `gastro_iso_n` (`_n` seul — `_nkg` déjà opérationnel via `THRESHOLDS`) | idem | Aucune donnée `_n` trouvée (rappel : `_nkg` de ces 4 fonctionne déjà via `THRESHOLDS`, cf. `AUDIT_SEUILS_HYP_FOR01.md` §5) |
| Toutes variantes RFD/TTPF (diagnostiques et segmentaires) | idem | Aucune donnée trouvée, pour aucune variable |

**« Aucun seuil clinique exploitable actuellement disponible »** pour l'ensemble de ces variables.

---

## Tableau final

| Variable | Source normative trouvée ? | Population | Donnée exploitable ? | Action possible |
|---|---|---|---|---|
| `imtp_n` | Non | — | Non | Aucune — attendre une source normative du praticien |
| `slimtp_n` | Non | — | Non | Aucune |
| `iso_belt_squat_n`/`nkg` | Oui (déjà utilisée) | 13 `fd_*` + `general_m`/`f` (pour `_n`) | Oui | Aucune (déjà opérationnel) |
| `sl_iso_push_n`/`nkg` | Oui (déjà utilisée) | 3 `foot_*` | Oui | Aucune (déjà opérationnel) |
| `knee_ext_n`, `knee_flex_n`, `hip_ext_n`, `gastro_iso_n` | Non pour `_n` (Oui pour `_nkg`, déjà utilisée) | — | Partiel | Aucune — `_nkg` déjà opérationnel |
| `hip_abd_n`, `hip_add_n`, `hip_flex_n`, `soleus_iso_n` | Oui (déjà utilisée) | 3 `foot_*` | Oui | Aucune (déjà opérationnel) |
| `df_iso_n`/`nkg`, `inv_iso_n`/`nkg`, `ev_iso_n`/`nkg` | Non | — | Non | Aucune |
| `sh_iso_3030`/`sh_iso_6060` (`_n`/`nkg`) | Non | — | Non | Aucune |
| Toutes variables RFD/TTPF | Non | — | Non | Aucune |

---

## VERDICT

**B. Aucune source normative exploitable n'est actuellement disponible** dans le dépôt pour
combler `imtp_n`, `slimtp_n`, `df_iso`, `inv_iso`, `ev_iso`, `sh_iso_3030`, `sh_iso_6060`, ou les
variables RFD/TTPF. Les seules données normatives réellement présentes et exploitables sont celles
déjà intégrées et déjà utilisées par `iso_belt_squat_n`/`sl_iso_push_n` et un sous-ensemble du
Niveau 2 (`soleus_iso`, `hip_abd`, `hip_add`, `hip_flex` en `_n` ; 10 segments en `_nkg`).

Toute couverture supplémentaire nécessiterait une nouvelle source normative apportée par le
praticien (ex. un rapport VALD IMTP/SLIMTP réel) — hors du périmètre de cette mission, qui se
limite à constater l'absence de source exploitable dans le dépôt actuel.

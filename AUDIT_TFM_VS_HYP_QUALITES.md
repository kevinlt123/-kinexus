# Audit — Correspondance des qualités TFM ↔ HYP###

## Statut

Audit ciblé, documentaire uniquement. Aucune solution proposée, aucune correction, aucun code
modifié. Toutes les affirmations sont reliées à une lecture directe de
`/home/user/-kinexus/index.html` effectuée pour ce document (compléments à
`PHASE_I_CODE_REALITY_CHECK.md`, non répétés ici sauf nécessité). Sources de comparaison :
`var FUNCTIONS` (`index.html:742`) côté TFM, les 8 fiches actives + 1 suspendue de
`HYP_ARCHITECTURE_PHASE_C.md`/`KINEXUS_REASONING_ENGINE_V1.md` côté HYP###.

---

# 1. Table TFM → HYP###

| Qualité TFM (`FUNCTIONS`) | Tests TFM contribuant (poids max observé) | Équivalent HYP### | Statut |
|---|---|---|---|
| Mobilité | `wblt` (3), `df_iso`/`inv_iso`/`ev_iso` (1-2), `ybt` (1) | `HYP-MOB-01` | **Équivalent exact** (même nom) |
| Force | `knee_ext`/`knee_flex`/`soleus_iso`/`gastro_iso`/`sl_iso_push`/`iso_belt_squat`/`sh_iso_*`/`imtp`/`slimtp` (3), nombreux autres (1-2) | `HYP-FOR-01` | **Équivalent exact** |
| Explosivité | `cmj`/`slcmj` (3), `knee_ext`/`knee_flex`/`soleus_iso`/`gastro_iso`/`sl_iso_push`/`iso_belt_squat`/`imtp`/`slimtp` (2) | `HYP-EXP-01` | **Équivalent exact** |
| Puissance | `cmj`/`slcmj`/`profil_fv`/`imtp`/`slimtp` (3), autres (1-2) | `HYP-PUI-01` | **Équivalent exact** |
| Réactivité | `dj`/`sldj`/`cmjr` (3), `wblt`/`sl_iso_push`/`rs_ankle_push` (1) | `HYP-REA-01` | **Équivalent exact** |
| Absorption | `landing_bi`/`landing_uni`/`sllt` (3), `cmj`/`slcmj`/`dj`/`sldj` (2) | `HYP-ABS-01` | **Équivalent exact** |
| Stabilisation | `sllt`/`landing_uni` (3), `hip_abd`/`hip_add`/`df_iso`/`inv_iso`/`ev_iso`/`hip_rot_int`/`hip_rot_ext`/`sldj`/`ybt`/`side_hop`/`ef`/`strobo` (1-2) | `HYP-STAB-01` | **Équivalent exact** |
| **Contrôle Frontal** | 16 tests contribuent : `hip_abd`/`hip_add`/`landing_uni`/`ybt`/`side_hop` (3), `df_iso`/`inv_iso`/`ev_iso`/`hip_rot_int`/`hip_rot_ext`/`sllt`/`crossover_hop` (2), `hip_flex`/`hip_ext`/`sldj`/`ef`/`strobo` (1) | **Aucun** | **Sans équivalent** |
| **Contrôle Sensoriel** | 5 tests : `eo`/`ef`/`strobo`/`sls` (3), `ybt` (1) | `HYP-CSM-01` *(nom différent — "Contrôle Sensori-moteur")* | **Suspendu**, et correspondance de nom **non vérifiée** (voir §4) |
| Endurance | `repeated_hop`/`seated_calf_raise`/`standing_calf_raise` (3), `heel_raise`/`triple_hop`/`side_hop`/`cmjr` (1-2) | `HYP-END-01` | **Équivalent exact** |

*Décompte des poids TFM effectué par relecture directe de la déclaration `TFM` (`index.html:750`),
non recalculé automatiquement — vérification manuelle des clés `controle_frontal`/
`controle_sensoriel` sur les 44 tests listés.*

---

# 2. Qualités qui disparaîtraient lors d'une bascule HYP### complète

**2 des 10 qualités TFM n'ont, à ce jour, aucune destination active dans le moteur HYP### :**

- **Contrôle Frontal** — disparaîtrait intégralement. Aucune fiche `HYP-###`, active ou suspendue,
  ne porte ce nom ni ne couvre ce périmètre clinique. 16 tests (§1) perdraient leur seule
  destination Niveau 1 actuelle.
- **Contrôle Sensoriel** — disparaîtrait dans les faits. Une fiche existe (`HYP-CSM-01`,
  "Contrôle Sensori-moteur") mais elle est **suspendue** (`HYP_ARCHITECTURE_FREEZE.md`, point 1) —
  aucun calcul n'est produit pour elle tant qu'elle reste dans cet état, quelle que soit la
  correspondance exacte de nom avec la qualité TFM (§4). 5 tests (§1) perdraient leur seule
  destination Niveau 1 actuelle dans l'intervalle.

**Les 8 autres qualités TFM (Mobilité, Force, Explosivité, Puissance, Réactivité, Absorption,
Stabilisation, Endurance) ont toutes un équivalent HYP### exact et actif.**

---

# 3. `Contrôle Frontal` — usage réel dans l'application

| Contexte | Utilisé ? | Détail vérifié |
|---|---|---|
| **Calcul** | ✅ Oui | 16 entrées dans `TFM` (`index.html:750`) contribuent à `controle_frontal` (clé `FN_KEY['Contrôle Frontal']`, `:744`) ; calculé dans la boucle `functionScores` de `computeMoteur()` (`:4187-4208`) au même titre que les 9 autres qualités |
| **Affichage (écran)** | ✅ Oui | Onglet `'fonctions'` d'`ExpertView` (`:6557`) — itère `evFns` (dérivé de `FUNCTIONS`, `:6547`/`:5924`), affiche 'Contrôle Frontal' si `fSc['Contrôle Frontal']` existe ; onglet `'couverture'` (`:6587`) — itère `FUNCTIONS` sans exclusion ; icône dédiée `🛡️` définie (`FN_ICON`, `:6434`) |
| **Rapport PDF** | ✅ Oui, à deux endroits distincts | (1) `buildExpertReport` (`:5156`) — tableau complet `FUNCTIONS.forEach`, inclut 'Contrôle Frontal' sans exclusion. (2) `buildSportifReport` — **inclusion nommée explicite** : `['Contrôle Frontal','Mobilité','Absorption'].forEach(...)` (`:4618-4621`), ajoute un item "Contrôle Frontal (norme)" à la checklist RTP du rapport, à partir de `fSc['Contrôle Frontal'].status` |
| **Historique** | ✅ Oui | `HistoriqueView` (`:6645`) — `FUNCTIONS.map`, compare `r1.functionScores['Contrôle Frontal']`/`r2.functionScores[...]` sans exclusion |
| **Dashboard** | ❌ Non | `Dashboard` (`:5537`) ne lit aucune donnée de scoring, quelle que soit la qualité (confirmé `PHASE_I_CODE_REALITY_CHECK.md` §3.9) |
| **Priorisation (fonction)** | ✅ Oui, potentiellement | `computeMoteur()` (`:4213`) — `FUNCTIONS.filter(...)` pour les top-3 priorités, sans exclusion de 'Contrôle Frontal' ; apparaîtrait dans `priorities` si son statut est rouge/orange |
| **Priorisation clinique (Mouvement)** | ❌ Non | `CMJ_PHASE_TO_QUALITY` (`:2220`) ne référence jamais 'Contrôle Frontal' — seules 5 phases CMJ existent, mappées à `'Absorption'` (1 correspondance réelle) et 4 libellés qui ne correspondent à **aucune** qualité `FUNCTIONS` existante (commentaire du code lui-même, `:2213-2219`) |
| **Raisonnement (Fil de Raisonnement)** | ❌ Non | Conséquence directe du point précédent : `dossierPreuvesPhase()`/`syntheseCoherenceQualites()`/`buildRaisonnementBoardCMJ()` lisent `functionScores[qualiteNom]` où `qualiteNom` provient exclusivement de `CMJ_PHASE_TO_QUALITY` — 'Contrôle Frontal' n'y apparaît jamais, ne peut donc jamais être lu par cette chaîne |
| **Configuration praticien** | ✅ Oui | `QualityConfigView` (`:5500`) — `FUNCTIONS.map`, 'Contrôle Frontal' configurable comme les 9 autres qualités |

---

# 4. `Contrôle Sensoriel` — usage réel dans l'application

| Contexte | Utilisé ? | Détail vérifié |
|---|---|---|
| **Calcul** | ✅ Oui | 5 entrées `TFM` contribuent à `controle_sensoriel` (`eo`, `ef`, `strobo`, `sls` à poids 3 ; `ybt` à poids 1) — calculé dans `computeMoteur()` comme toute qualité `FUNCTIONS` |
| **Affichage (écran)** | ✅ Oui | Mêmes emplacements que 'Contrôle Frontal' : onglet `'fonctions'` (`:6557`), onglet `'couverture'` (`:6587`), icône dédiée `👁️` (`FN_ICON`, `:6434`) |
| **Rapport PDF** | ✅ Oui, partiellement | `buildExpertReport` (`:5156`) — tableau complet, inclus sans exclusion. `buildSportifReport` — **absent** de la liste nommée `['Contrôle Frontal','Mobilité','Absorption']` (`:4618`) ; peut néanmoins apparaître dans le rapport via `pri` (top-3 priorités) si déficitaire, comme n'importe quelle qualité |
| **Historique** | ✅ Oui | `HistoriqueView` (`:6645`), même mécanisme que 'Contrôle Frontal', sans exclusion |
| **Dashboard** | ❌ Non | Identique à toutes les qualités (§3) |
| **Priorisation (fonction)** | ✅ Oui, potentiellement | Identique à 'Contrôle Frontal' — `FUNCTIONS.filter` sans exclusion (`:4213`) |
| **Priorisation clinique (Mouvement)** | ❌ Non | Même raison que 'Contrôle Frontal' — absent de `CMJ_PHASE_TO_QUALITY` (`:2220`) |
| **Raisonnement (Fil de Raisonnement)** | ❌ Non | Même conséquence, même chaîne de lecture (`functionScores[qualiteNom]` via `CMJ_PHASE_TO_QUALITY` uniquement) |
| **Configuration praticien** | ✅ Oui | `QualityConfigView` (`:5500`), configurable comme les 9 autres |
| **Point additionnel — nom voisin non équivalent** | — | `SYSTEMS` contient une entrée `'Sensoriel'` (`index.html:743`), utilisée pour `systemScores` (regroupement anatomique, mécanisme distinct de `FUNCTIONS`/`functionScores`) — `STR_QUAL_DETAIL['Sensoriel']` (`:1211`) documente sa contribution à `controle_sensoriel`, mais ce sont deux objets et deux mécanismes de calcul différents (`sysSc` vs `fSc`), qui partagent seulement une racine de nom |

---

# 5. Écarts documentés (synthèse, sans proposition)

- **2 qualités TFM sur 10 (Contrôle Frontal, Contrôle Sensoriel) n'ont aucun chemin de calcul actif
  vers HYP### aujourd'hui** — l'une par absence totale de fiche, l'autre par suspension.
- **21 tests TFM au total** (16 pour Contrôle Frontal, 5 pour Contrôle Sensoriel, avec chevauchement
  de `ybt` compté dans les deux) contribuent, à des poids parfois maximaux (3), à ces deux qualités
  sans équivalent actif.
- **Contrôle Frontal et Contrôle Sensoriel sont calculés, affichés (2 onglets), exportés (2
  fonctions de rapport PDF), comparés dans l'historique, et éligibles à la priorisation fonction** —
  un usage large et actif dans l'application actuelle, pas une qualité marginale ou déjà en
  désuétude.
- **Ni Contrôle Frontal ni Contrôle Sensoriel n'apparaissent jamais dans la chaîne de priorisation
  clinique (Mouvement) ni dans le Fil de Raisonnement** — `CMJ_PHASE_TO_QUALITY` ne les référence
  pas, un fait déjà partiellement documenté par un commentaire du code lui-même (`:2213-2219`) pour
  4 des 5 phases CMJ, mais jamais formulé du point de vue spécifique de ces deux qualités avant ce
  document.
- **`buildSportifReport` traite les deux qualités de façon asymétrique** : Contrôle Frontal reçoit
  un item de checklist RTP nommément dédié (`:4618`, aux côtés de Mobilité et Absorption) ;
  Contrôle Sensoriel n'a pas cette inclusion explicite, seulement une éligibilité générique via les
  priorités.
- **La correspondance de nom "Contrôle Sensoriel" (TFM) ↔ "Contrôle Sensori-moteur" (`HYP-CSM-01`)
  n'est confirmée par aucun document du chantier HYP### (Phases A à I)** — elle reste une
  correspondance implicite, non vérifiée, y compris dans le présent document.

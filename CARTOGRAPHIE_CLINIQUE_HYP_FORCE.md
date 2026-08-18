# Cartographie clinique HYP — Force

**Statut** : analyse uniquement, aucun code modifié. Noms vérifiés directement dans `index.html`
(`TESTS`, `NORMS`, `THRESHOLDS`) — pas repris tels quels de `HYP_ARCHITECTURE_PHASE_C.md` sans
recontrôle.

---

### 1. DIAGNOSTIC

| Variable | Test source | Mesure | Direction déficit | Rôle |
|---|---|---|---|---|
| `imtp_n` | IMTP (bilatéral) | Force absolue (N) | ↓ | Diagnostique (documenté) |
| `slimtp_n` | SLIMTP (unilatéral) | Force absolue (N) | ↓ | Diagnostique (documenté) |
| `iso_belt_squat_n` | Isometric Belt Squat (bilatéral) | Force absolue (N) | ↓ | Diagnostique (documenté) |
| `sl_iso_push_n` | Single Leg Isometric Squat Hold (unilatéral) | Force absolue (N) | ↓ | Diagnostique (documenté) |

Convergence documentée (`HYP_ARCHITECTURE_PHASE_C.md`, `CLI010`) : **≥ 2 des 4 variables
déficitaires**.

**Vérification code — seuils réellement disponibles** :

| Variable | NORMS | THRESHOLDS | Classifiable en pratique |
|---|---|---|---|
| `imtp_n` | **Aucune** | **Aucun** | **Jamais** |
| `slimtp_n` | **Aucune** | **Aucun** | **Jamais** |
| `iso_belt_squat_n` | Oui — large (13 populations ForceDecks sport + `general_m`/`general_f` par âge) | Non | Presque toujours |
| `sl_iso_push_n` | Oui — étroite (3 populations football `foot_m_senior`/`foot_f_senior`/`foot_f_youth`) | Non | Selon population |

**Constat important, non documenté ailleurs** : `imtp_n` et `slimtp_n` — deux des quatre variables
diagnostiques citées par Vierge_7 — n'ont **aucune entrée `NORMS` ni `THRESHOLDS`** dans le code
actuel, malgré la note de population `general_m`/`general_f` qui se présente comme sourcée sur
« IMTP, CMJ » (`index.html:1298-1299`) : l'objet réel ne contient que `iso_belt_squat_n` et
`cmj_height`, aucune entrée `imtp_n`. `imtp_n`/`slimtp_n` apparaissent uniquement dans le catalogue
de métadonnées narratif (`index.html:4009`), jamais dans une table de seuils. **En pratique, la
règle "≥2/4" ne peut aujourd'hui porter que sur 2 des 4 variables documentées**
(`iso_belt_squat_n`, `sl_iso_push_n`), et seulement pour les populations couvertes.

États réellement productibles : `ok` si les variables classifiables sont normales ; un déficit sur
la seule variable classifiable disponible reste une preuve isolée (jamais "≥2/4" au sens strict
tant qu'`imtp_n`/`slimtp_n` restent sans seuil) ; `non_determinable` si aucune des 2 variables
classifiables n'a de statut pour la population de l'athlète.

---

### 2. EXPLICATION DU DÉFICIT

| Variable | Mécanisme renseigné | Relation avec le déficit | Rôle |
|---|---|---|---|
| Force segmentaire `_n`/`_nkg` (`knee_ext`, `knee_flex`, `soleus_iso`, `gastro_iso`, `hip_flex`, `hip_ext`, `hip_abd`, `hip_add`, `df_iso`, `inv_iso`, `ev_iso`, `sh_iso_9020`/`9090`/`3030`/`6060`) | Contribution locale par groupe musculaire | Peut expliquer *où* le déficit global se situe | Explicatif uniquement (documenté, `HYP_ARCHITECTURE_PHASE_C.md`) |
| Cinétique RFD (`rfd50`/`100`/`150`/`200`/`ttpf` des 15 tests ci-dessus + des 4 tests diagnostiques) | Vitesse de production de la force | Peut nuancer un déficit de force maximale sans l'expliquer entièrement | Explicatif uniquement |
| `rs_hip_push`/`rs_knee_push`/`rs_ankle_push` (`n`/`nkg`/`rfd100`/`rfd200`/`ttpf`) | Force en chaîne cinétique fermée | Explicatif biomécanique | Explicatif uniquement |

Aucune de ces variables n'est promue diagnostique dans les sources — respecté ici, non réinterprété.

---

### 3. PRÉCISION / MODIFICATION DU DIAGNOSTIC

- **Décomposition segmentaire (`CLI200`-`213`)** : seule qualité dotée d'un Niveau 2 complet dans
  Vierge_7. Condition documentée par segment : *"au moins une variable diagnostique globale
  déficitaire ET déficit local confirmé"* — jamais un déclencheur autonome.
- **Force relative (`_nkg`)** : confirmative, jamais diagnostique (`CLI011` — déclenchée par un
  score Force normal mais force relative diminuée, un cas distinct, pas un renforcement du
  déficit global).
- **Asymétrie (`CLI012`)** : LSI des 4 tests globaux — modificateur, orientation clinique dédiée
  ("réduire les asymétries de force"), jamais un déclencheur du déficit global lui-même.

---

### 4. CE QUE LE MOTEUR PEUT DIRE

- « Déficit de force objectivé par `iso_belt_squat_n` et `sl_iso_push_n`, tous deux réduits. »
- « Ce déficit est associé à une réduction de `knee_ext_n`, pouvant contribuer à expliquer le
  résultat. »
- « Une asymétrie sur `iso_belt_squat_n` (LSI) précise le profil — orientation possible vers
  `CLI012`. »
- « Force globale conservée mais force relative (`_nkg`) réduite — profil distinct de force
  absolue préservée / force relative diminuée. »

### 5. CE QUE LE MOTEUR NE PEUT PAS DIRE

- Il ne peut pas dire « déficit confirmé par IMTP » ni « par SLIMTP » — **variables sans seuil,
  jamais classifiables aujourd'hui**.
- Il ne peut pas atteindre la règle documentée "≥2/4" au sens strict — seulement 2 des 4 variables
  sont jamais classifiables, et seulement pour les populations couvertes.
- Il ne peut pas dire si `sh_iso_*` (épaule) est déficitaire de façon fiable — seuils non vérifiés
  dans cette analyse (hors périmètre des 4 diagnostiques principaux), à vérifier séparément si
  besoin.

---

### 6. Vérification directe dans le code

Tous les noms ci-dessus vérifiés dans `TESTS`/`TBK` (`index.html:103-107`), `NORMS`
(`index.html:1298-1380`), `THRESHOLDS` (`index.html:1214`). Aucun nom approximatif repris sans
recontrôle.

---

## Tableau final

| Variable | Diagnostique | Explicative | Précision / modificateur | Source | Statut |
|---|---|---|---|---|---|
| `imtp_n` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Écart code/document |
| `slimtp_n` | Documenté, **non classifiable (aucun seuil)** | — | — | Code + document | Écart code/document |
| `iso_belt_squat_n` | Oui (population-dépendant) | — | — | Code + document | Opérationnel |
| `sl_iso_push_n` | Oui (3 populations) | — | — | Code + document | Opérationnel, étroit |
| `imtp_nkg`/`slimtp_nkg`/`iso_belt_squat_nkg`/`sl_iso_push_nkg` | Non | — | Confirmative documentée | Document | NON DÉTERMINABLE (seuils non revérifiés ici) |
| Force segmentaire `_n`/`_nkg` (11 familles) | Non | Oui | Précision par segment (`CLI200`-`213`) | Document | Rôle documenté, seuils non revérifiés ici |
| RFD (toutes familles) | Non | Oui | — | Document | Rôle documenté, seuils non revérifiés ici |
| LSI des 4 tests globaux | Non | — | Modificateur (asymétrie, `CLI012`) | Document | Rôle documenté |

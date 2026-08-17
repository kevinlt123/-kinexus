# Arbitrage final — HYP-PUI-01 : Capacité vs Stratégie (3 points ouverts)

**Statut** : arbitrage uniquement. Aucune nouvelle règle créée, aucun document précédent modifié,
aucun code. Rien n'est décidé ici — trois cases à remplir à la fin.

---

## Question 1 — Capacité + Stratégie simultanées

**A — OUI, les deux coexistent, sans hiérarchie**
- Conséquence clinique : le praticien voit "déficit de capacité" **et** "problème de stratégie"
  ensemble, sans qu'aucun ne soit présenté comme la cause.
- Conséquence sur le moteur : aucune règle nouvelle à créer — réutilise directement le principe déjà
  validé "cumulable, non substituable" (`KINEXUS_REASONING_ENGINE_V1.md` §3).
- Risque de surinterprétation : faible — rien n'est affirmé au-delà de ce qui est mesuré ; le seul
  risque est que le praticien lise les deux constats comme liés (cause/conséquence) alors que cette
  relation n'est jamais établie par le moteur.

**B — NON, une seule branche principale**
- Conséquence clinique : simplifie l'affichage, mais fait disparaître une information mesurée (l'un
  des deux constats n'est plus montré).
- Conséquence sur le moteur : nécessite une **règle de priorité nouvelle** (magnitude du déficit ?
  nombre de preuves ? aucun critère de ce type n'existe aujourd'hui).
- Risque de surinterprétation : élevé — présenter une seule cause là où deux sont mesurées suggère au
  praticien une certitude causale que les données ne permettent pas.

**Recommandation** : aucune contradiction trouvée pour l'option A avec les documents existants —
c'est l'option cohérente avec le principe déjà en place ("causes multiples non hiérarchisées",
confirmé dans `PROTOTYPE_RAISONNEMENT_PUISSANCE.md` §6 et `ORIENTATIONS_PUISSANCE_V2.md` §5).
L'option B nécessiterait d'inventer un critère de priorité qui n'existe nulle part dans les sources.
Ceci n'est qu'une indication de cohérence documentaire, pas une décision.

**DÉCISION DU PRATICIEN : ______**

---

## Question 2 — Convergence pour retenir « Capacité »

| | **A — Une preuve** | **B — Deux preuves, même famille** | **C — Deux familles distinctes** |
|---|---|---|---|
| **Exemple concret** | `imtp_n` seule déficitaire | `imtp_n` **et** `hip_ext_n` déficitaires (deux tests, tous deux famille "Force absolue") | `imtp_n` (Force) **et** `imtp_rfd100` (RFD) déficitaires |
| **Avantage** | Sensibilité maximale, aucun signal manqué | Écarte le risque qu'un seul test isolé (souvent local) suffise | Spécificité maximale, cohérent avec un mécanisme déjà validé ailleurs (ADR-003) |
| **Risque de faux positif** | Élevé — un déficit local (ex. un seul groupe musculaire) peut suffire à conclure "capacité" | Modéré — deux tests de la même famille peuvent être corrélés anatomiquement sans révéler un déficit global | Faible |
| **Risque de faux négatif** | Aucun — la plus permissive | Modéré — un patient avec un seul test réalisé dans une famille (ex. seul `imtp_rfd100` testé) ne peut jamais atteindre 2 preuves dans cette famille | Élevé — un déficit de force confirmé par 5 tests segmentaires (tous "Force absolue") ne suffirait jamais si aucun test RFD n'a été réalisé |
| **Compatibilité HYP V1** | Compatible avec l'esprit "un signal suffit à générer un état bas", mais applique ce principe au niveau "retenue" plutôt qu'au niveau "signal faible" (nuance déjà signalée dans `HYP_PUI_CAPACITE_STRATEGIE_V1.md` §4) | Partiellement compatible — ne reprend pas explicitement le principe ADR-003 (convergence par mécanismes indépendants) | La plus directement alignée avec ADR-003 déjà validé |
| **Impact sur le volume de patients classés « Capacité »** | Le plus élevé (qualitatif — aucune donnée réelle disponible pour chiffrer, `LOT1B_CROSS_VALIDATION_REPORT.md` avait déjà signalé cette même limite d'absence de corpus réel) | Intermédiaire | Le plus faible |

**Aucune quatrième option n'est proposée. Aucune préférence pour C n'est affirmée au motif qu'elle
semblerait "plus robuste".**

**DÉCISION DU PRATICIEN : A / B / C**

---

## Question 3 — « Capacités pertinentes évaluées »

| | **Niveau 1** | **Niveau 2** | **Niveau 3** |
|---|---|---|---|
| **Définition** | Au moins une mesure physiologique globale | Les familles "principales" pour la Puissance testées | Toutes les familles physiologiques pertinentes testées |
| **Exemple réel Kinexus** | `imtp_n` (ou `imtp_nkg`) seul testé — IMTP est le test de force globale cité en premier dans `HYP_ARCHITECTURE_PHASE_C.md` | `imtp`/`slimtp` testés, magnitude (`_n`/`_nkg`) **et** RFD (`_rfd100`/`_rfd200`/`_ttpf`) — 🔴 ce regroupement "principal" n'est **pas défini par les sources**, c'est une proposition de lecture, pas un fait établi | Au moins une variable par famille testée : Force absolue, Force relative, RFD, TTPF, Profil force-vitesse (les 5 familles listées dans `HYP_PUI_CAPACITE_STRATEGIE_V1.md` §4) |
| **Ce qui reste non testé** | Les 33 autres variables (11 tests segmentaires, profil F-V, RFD/TTPF) | Les 11 tests segmentaires et le profil force-vitesse | Rien, par définition de ce niveau |
| **Stratégie retenue quand** | Dès qu'une seule mesure globale est normale | Dès qu'`imtp`/`slimtp` (magnitude+RFD) sont normaux | Uniquement si les 5 familles sont couvertes et normales |
| **Reste « Non discriminable » quand** | Aucune mesure physiologique du tout | `imtp`/`slimtp` non réalisés (même si des tests segmentaires isolés le sont) | Toute famille manquante, même une seule |

**Point à isoler explicitement, comme demandé** : 🔴 la définition de "principale"/"pertinente"
(Niveau 2) **dépend d'un choix clinique non tranché par les sources** — le regroupement IMTP/SLIMTP
proposé ci-dessus est une hypothèse de travail, pas une conclusion. Si le Niveau 2 est retenu, ce
regroupement précis devra être confirmé séparément.

**DÉCISION DU PRATICIEN : NIVEAU 1 / 2 / 3**

---

## Cas concrets

*Puissance déjà diagnostiquée déficitaire dans tous les cas (`cmj_peak_power` + `slcmj_peak_power`,
inchangé, non concerné par cet arbitrage).*

### CAS A — Force ↓ + Stratégie anormale
- **Selon Q2** : A → Capacité retenue (Force seule suffit). B → dépend du nombre de tests de force
  déficitaires disponibles (1 seul test = pas encore "retenue", reste signal). C → **pas retenue**
  seule (une seule famille, Force) — reste signal Niveau 2, sauf si un test RFD est aussi déficitaire.
- **Selon Q1** : si A → affiché comme `PROFIL MIXTE` (Capacité, quel que soit son niveau selon Q2 +
  Stratégie). Si B → nécessiterait une règle de priorité non définie.

### CAS B — Force normale + RFD ↓ + Stratégie normale
- Une seule famille physiologique (RFD) déficitaire, Stratégie sans signal.
- **Selon Q2** : A → Capacité retenue (RFD seule). B → pas retenue si un seul test RFD est
  disponible (reste signal). C → **pas retenue** (une seule famille) — reste signal Niveau 2.
- Q1 non concernée (pas de signal Stratégie ici).

### CAS C — Force/RFD normales + Stratégie anormale + toutes capacités pertinentes testées
- **Résultat identique quelle que soit la réponse à Q1, Q2 ou Q3** : Stratégie retenue. La condition
  "toutes les capacités pertinentes testées" satisfait n'importe lequel des 3 niveaux de Q3, et
  Capacité n'a aucun signal (Q2 non déterminante ici) — cas le plus simple de la matrice.

### CAS D — Stratégie anormale + capacités insuffisamment testées
- **Résultat identique quel que soit le niveau choisi en Q3** (1, 2 ou 3) : par construction, "
  insuffisamment testées" signifie sous le seuil retenu, quel qu'il soit → `NON DISCRIMINABLE`,
  jamais "Stratégie" par défaut. Q1 et Q2 non déterminantes (pas de signal Capacité).

### CAS E — Force ↓ + RFD ↓ + Stratégie anormale
- **Selon Q2** : A → Capacité retenue (l'une ou l'autre suffit déjà). C → Capacité retenue
  directement (deux familles distinctes, exactement l'exemple de l'option C). **B — point à noter** :
  si un seul test de Force et un seul test de RFD sont déficitaires (un chacun), cela ne constitue
  **pas** "deux preuves dans la même famille" au sens strict de B — resterait, sous une lecture
  stricte de B, à deux signaux Niveau 2 séparés plutôt qu'une Capacité "retenue". Point de
  vigilance : B peut produire un résultat contre-intuitif sur ce cas précis.
- **Selon Q1** : si A → `PROFIL MIXTE`. Si B → priorité non définie.

### CAS F — Une seule variable physiologique déficitaire
- **A** : Capacité retenue directement.
- **B** : reste signal Niveau 2 (pas de deuxième preuve dans la même famille).
- **C** : reste signal Niveau 2 (pas de deuxième famille).
- Illustre directement l'écart pratique entre A et B/C.

---

```
┌─────────────────────────────────────────────┐
│ DÉCISIONS DU PRATICIEN                       │
│                                               │
│ Q1 — Capacité + Stratégie : ______            │
│                                               │
│ Q2 — Convergence Capacité : ______            │
│                                               │
│ Q3 — Capacités évaluées : ______              │
│                                               │
└─────────────────────────────────────────────┘
```

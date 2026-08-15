# Mémo de décision — HYP-CSM-01 : suspension maintenue ou réactivation ?

*Synthèse à partir de `AUDIT_CONTROLE_SENSORIEL.md`, `HYP_ARCHITECTURE_FREEZE.md` (point 1),
`HYP_ARCHITECTURE_PHASE_B.md`, `HYP_ARCHITECTURE_PHASE_C.md`, `KINEXUS_REASONING_ENGINE_V1.md`.*

## 1. Arguments factuels pour maintenir la suspension

- **Aucune variable diagnostique distinctive.** Les preuves diagnostiques et explicatives
  physiologiques de `HYP-CSM-01` sont, variable pour variable, identiques à celles de `HYP-STAB-01`
  (SLS, EO, EF, Strobo, Landing ; `hip_abd/hip_ext/hip_add/inv_iso/ev_iso/df_iso/wblt_distance` en
  explicative). Aucune mesure propre à Contrôle Sensori-moteur n'existe dans Kinexus.
- **Symétrie de l'ambiguïté dans Vierge_7 lui-même.** Les deux fiches de qualité omettent
  chacune l'autre de leur propre liste de distinctions ("ne se confond pas avec"). Vierge_7 ne
  tranche nulle part explicitement la différence opérationnelle entre les deux qualités.
- **Le risque clinique déjà identifié au gel reste entier.** Activer les deux hypothèses sur une
  base de preuve quasi identique romprait le principe fondateur ("des preuves indépendantes
  renforcent") — le praticien recevrait deux conclusions présentées comme convergentes alors
  qu'elles proviennent des mêmes 4 tests.
- **Aucune mesure de "dépendance visuelle" n'existe aujourd'hui.** `CLI091`, l'orientation la plus
  spécifiquement propre à CSM, dépend d'une comparaison EO/EF que Kinexus ne calcule pas — la
  réactiver ne produirait, dans l'immédiat, aucune sortie supplémentaire réellement nouvelle sans
  développement additionnel.

## 2. Arguments factuels pour réactiver HYP-CSM-01

- **Différence réelle et vérifiée au niveau des orientations `CLI###`.** `CLI070` (Stabilisation)
  se déclenche sur SLS seul ; `CLI090` (CSM) exige une convergence entre 4 familles (EO, EC, Strobo,
  SLS). Ce n'est pas une redite : c'est une logique de déclenchement différente, confirmée par
  lecture directe du texte source.
- **`CLI091` ("Réduire la dépendance visuelle") et `CLI092` ("Améliorer la réponse aux
  perturbations") n'ont aucun équivalent sous Stabilisation.** Ce sont des questions cliniques que
  le moteur, en l'état suspendu, ne pose jamais.
- **Vierge_7 nomme explicitement 4 sous-rôles diagnostiques pour CSM** (principal / sensoriel / sous
  contrainte / contextuel), une granularité clinique que la fiche Stabilisation ne porte pas.
- **La suspension a été actée comme réversible, pas définitive** (`HYP_ARCHITECTURE_FREEZE.md`,
  point 1 : *"réversible dès que le praticien précise la distinction"*) — `AUDIT_CONTROLE_SENSORIEL.md`
  constitue précisément le travail de clarification que le gel anticipait.

## 3. Conséquences cliniques de chaque choix

**Maintien de la suspension** : le praticien continue de recevoir une lecture posturale unique via
Stabilisation. Il perd la question spécifique "dépendance à l'information visuelle pour
l'équilibre" — une question cliniquement reconnue (risque de chute, stratégies compensatoires) mais
aujourd'hui absente sous toute forme active. Risque de redondance nul.

**Réactivation** : le praticien gagnerait potentiellement `CLI091`/`CLI092`, mais sans garantie que
le moteur, tel que spécifié aujourd'hui, empêche la double lecture d'un même déficit (SLS/EO/EF/
Strobo) comme deux conclusions indépendantes — exactement le risque que le gel visait à éviter.
Ce risque n'est pas théorique : il a motivé la suspension initiale, sur la base des mêmes faits que
ceux confirmés par cet audit.

## 4. Conséquences sur le moteur HYP###

**Maintien** : aucun impact. `KINEXUS_REASONING_ENGINE_V1.md`, `PHASE_G_IMPLEMENTATION_PLAN.md` et
`PHASE_H_TECHNICAL_SPECIFICATION.md` restent valides tels quels ; H1-H7 (7 qualités actives)
inchangés.

**Réactivation** : introduirait un cas non couvert par l'architecture actuelle — deux hypothèses
actives partageant une base diagnostique **identique**, distinct du cas déjà traité (Absorption/
Stabilisation ne partagent que des preuves *explicatives*, jamais diagnostiques). La règle de
convergence par mécanismes indépendants (ADR-003) et les règles de priorisation
(`KINEXUS_REASONING_ENGINE_V1.md`, section preuves contradictoires) n'ont jamais été conçues pour ce
cas précis. Nécessiterait a minima : un 9ᵉ `HYP_CATALOG`, une révision de toute mention "8 qualités
actives" dans les documents déjà produits, et une clarification de la façon dont deux hypothèses à
diagnostic partagé coexistent sans double comptage — aucun de ces points n'est aujourd'hui résolu.

## 5. Recommandation finale argumentée

**Maintenir la suspension de `HYP-CSM-01`.**

Le fondement du gel (absence de variable diagnostique distinctive) reste intact et n'est contredit
par aucun fait nouveau — les différences trouvées se situent toutes au niveau des orientations
`CLI###`, une couche en aval qui présuppose déjà une hypothèse valablement distincte pour exister.
Réactiver sur cette seule base reviendrait à construire une différenciation clinique à partir d'un
niveau de la spécification (les orientations) plutôt que du niveau qui la justifierait (les
preuves) — et le moteur HYP### n'a, à ce jour, aucun mécanisme pour faire coexister deux hypothèses
à diagnostic identique sans recréer le risque que la suspension visait précisément à écarter.

Ceci n'est pas une clôture définitive : le gel prévoyait explicitement une réactivation possible, et
`CLI091`/`CLI092` constituent des candidats concrets à instruire si le praticien souhaite engager ce
travail — mais cela suppose soit un enrichissement de Vierge_7 avec une preuve réellement
distinctive, soit une décision explicite d'accepter la complexité de conception que le point 4
ci-dessus décrit. Aucun des deux n'est acquis à ce stade.

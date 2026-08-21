# Implémentation — Lot UX/UI 1 : correction de la hiérarchie visuelle + Absorption

Suite directe de `AUDIT_UX_UI_KINEXUS_V1.md`. Diff : `index.html` **+97/-18 lignes**, un fichier de
test ajouté (`tests/uxUiLot1.test.js`, 20 tests). Aucune ligne des 8 moteurs HYP, de
`computeHypClinicalSynthesis01`, `HYP_QUALITY_RELATIONS`, `TFM`, `VAR_REL3`, seuils, normes, rôles
diagnostique/confirmatif/explicatif, `priorities` ou `statusPriorityRank()` n'est modifiée — vérifié
par diff et par comparaison stricte de 8 scénarios (`functionScores`, `priorities`,
`clinicalSynthesis.objectified`, `.relationships`) avant/après, identiques caractère pour caractère.

---

## 1. Audit du Plan de prise en charge

**Localisation** : `buildSportifReport()`, section 5 « Plan de prise en charge », `index.html`
(anciennement lignes 6993-7017). Seul consommateur dans tout le fichier — recherche exhaustive
confirmée (aucune occurrence dans `buildExpertReport` ni dans l'UI).

**Données utilisées** : `pri.slice(0,3)` — exactement le même tableau `priorities` que « Déficits à
investiguer », déjà correctement construit et déjà non modifié depuis la mission
`IMPLEMENTATION_FINAL_PRIORITES_CSM.md`.

**Construction du badge « Priorité N »** : `'Priorité '+p.rang` — rang positionnel brut, sans
filtrage HYP/TFM (contrairement à « Déficits à investiguer », qui utilise déjà
`priHypObjectifiedSplit`).

**Construction de RENFORCER/DÉVELOPPER/INTÉGRER** :
```js
var recVerbs=[{icon:'💪',verb:'Renforcer'},{icon:'✨',verb:'Développer'},{icon:'🏃',verb:'Intégrer'}];
...
var rv=recVerbs[i]||recVerbs[0];   // i = index dans pri.slice(0,3), PAS une propriété de la qualité
```

---

## 2. Décision sur RENFORCER/DÉVELOPPER/INTÉGRER

**Verdict de l'audit préalable : Option B — hiérarchie déguisée.** `recVerbs[i]` assigne le verbe
par **position dans le tableau**, jamais par une caractéristique propre à la qualité : la qualité en
rang 0 reçoit toujours « Renforcer », celle en rang 1 toujours « Développer », celle en rang 2
toujours « Intégrer » — quelle que soit la qualité réelle. Ce n'est donc pas une vraie catégorie
fonctionnelle indépendante d'un classement ; c'est un synonyme de « 1er/2e/3e » habillé en verbe
d'action. Conformément à l'Objectif 1C, **aucune nouvelle classification n'a été inventée** pour les
remplacer.

## 3. Suppression du classement

- `recVerbs` (variable et son usage) **supprimée** du code.
- Le badge `Priorité '+p.rang` **supprimé**.
- L'en-tête de chaque carte est remplacé par le même motif déjà utilisé et déjà validé dans
  « Déficits à investiguer » — pastille de sévérité (couleur du statut réel de la qualité, `colMap
  [p.status]`) + nom de la qualité (`p.fonction`), sans verbe ni numéro liés à la position. Contenu
  inchangé (Objectif/Actions/Critères de réussite).
- Titre de section conservé (« Plan de prise en charge » — déjà neutre, ne revendique aucun ordre).

**Avant** (3 qualités rouge à égalité) :
```
💪 RENFORCER          ✨ DÉVELOPPER         🏃 INTÉGRER
Objectif: Mobilité    Objectif: Absorption  Objectif: Stabilisation
...                   ...                   ...
[Priorité 1]          [Priorité 2]          [Priorité 3]
```
**Après** :
```
● MOBILITÉ            ● ABSORPTION          ● STABILISATION
Objectif: Cheville    Objectif: Absorption  Objectif: Stabilisation
...                   ...                   ...
```
(aucun badge de fin de carte)

Vérifié par génération réelle de PDF (§10) : la contradiction avec « Déficits à investiguer » —
identifiée par l'audit comme CRITIQUE UX — a disparu ; les deux sections présentent maintenant
exactement les mêmes 3 qualités, au même niveau, dans le même document.

---

## 4. Design Absorption

Nouvelle fonction pure `absorptionSousDomainesSummary(functionScores)` (placée juste après
`priHypObjectifiedSplit`, avant `computeMoteur()`) : lit `fSc['Absorption'].hypAbs01.sousDomaines`
(A_core/B_capaciteExcentrique/C_strategie/D_absorptionReactive), **jamais recalculé, jamais un
nouveau statut inventé**. Pour chaque sous-domaine, le statut affiché est le pire statut réellement
classifiable (`status` non `null`) parmi ses variables ; si aucune n'est classifiable, `status:null`
— l'appelant affiche alors le vocabulaire déjà existant `CSM_STATE_LABEL.non_determinable`, jamais
« normal ».

**Sous-domaine E (Réception/Impact) volontairement exclu** de l'affichage : il n'a aujourd'hui aucun
mécanisme implémenté (`E_receptionImpact.available` toujours `false`), donc afficher un chip pour lui
laisserait croire qu'une mesure a été tentée — contraire à l'Objectif 2B (« ne pas afficher de bloc
vide »). Seuls les 4 sous-domaines réellement documentés par le moteur sont représentés, exactement
ceux listés par la mission (Freinage/décélération, Capacité excentrique, Stratégie, Absorption
réactive).

**Rendu** : rangée de chips compacts (pastille de couleur + libellé si classifiable, gris + « Non
déterminable » sinon) — réutilise le style de chip déjà présent ailleurs dans l'app (fond
`C.surface`/`#F3F6F8`, bordure `C.border`), aucune nouvelle famille de composant créée.

---

## 5. Utilisation des sous-domaines existants — surfaces câblées

Ajouté à **4 emplacements**, tous consommant la même fonction, tous gatés sur `p.fonction==='Absorption'`
uniquement (aucun autre bloc n'est affecté) :

1. Dashboard, widget « Déficits à investiguer » (`AnalyseView`).
2. Onglet UI « Orientations » (`ExpertView`).
3. PDF sportif, cartes « Déficits à investiguer » (`buildSportifReport`).
4. PDF expert, section « Orientations » (`buildExpertReport`).

**Bug corrigé pendant la vérification** : la première implémentation dans `buildExpertReport`
utilisait `colMap[sd.status]`, une variable qui n'existe que dans le scope de `buildSportifReport` —
`colMap is not defined` a été levée dès la première génération réelle du PDF expert. Corrigée en
utilisant `SC[sd.status]` (le registre de couleurs global déjà utilisé ailleurs dans
`buildExpertReport`). Sans la génération PDF réelle mandatée par l'Objectif 9, ce bug serait resté
invisible jusqu'à l'usage en production — confirme la valeur de cette étape.

## 6. Filtre Variables

Ajouté sans refonte : `var [varFilter,setVarFilter]=useState('Toutes')` dans `ExpertView`, une
rangée de boutons pill (« Toutes » + les 8 valeurs de `HYP_CSM_QUALITIES`, référentiel déjà
existant, aucune nouvelle liste inventée) au-dessus de la liste. Filtrage : une variable correspond à
une qualité si `VAR_REL3[testKey_kpiKey].measures` ou `.estimates` contient une entrée dont
`.function` égale la qualité sélectionnée — lecture pure de données déjà présentes, aucun recalcul.
Vérifié en navigateur réel (§10) : le filtre « Absorption » réduit correctement la liste et affiche
les variables dont VAR_REL3 les relie à Absorption (measures ou estimates).

---

## 7. Éléments visuels conservés

- Body map, système de couleurs, badges, cartes, typographie, structure générale du PDF (couverture
  → leviers → pourquoi/où → déficits → synthèse → détails → mouvement) — **aucun changement**.
- Widget « Déficits à investiguer », onglet Orientations (contenu textuel), Synthèse clinique (UI +
  PDF) — structure et contenu inchangés, seuls les 4 emplacements listés en §5 reçoivent un ajout
  additif (les chips de sous-domaines), jamais une modification de ce qui existait déjà.
- `RadarChart` — non touché, toujours sans consommateur (conformément à l'Objectif 3 : ne pas lui
  redonner de rôle, ne pas le supprimer brutalement).
- Aucune interaction de navigation nouvelle créée pour Absorption (Objectif 2C) : les sous-domaines
  restent une présentation statique — le contenu (rôle des variables, tests associés) reste
  accessible via les onglets Résultats/Variables déjà existants, sans nouvelle architecture de clic.

---

## 8. Modifications effectuées (résumé)

1. `buildSportifReport()` — section « Plan de prise en charge » : suppression de `recVerbs` et du
   badge « Priorité N », remplacés par pastille de sévérité + nom de qualité.
2. Nouvelle fonction `absorptionSousDomainesSummary(functionScores)` (lecture pure de
   `hypAbs01.sousDomaines`).
3. Dashboard (`AnalyseView`), widget « Déficits à investiguer » : ajout des chips de sous-domaines
   pour la carte Absorption.
4. Onglet UI « Orientations » (`ExpertView`) : même ajout.
5. PDF sportif, cartes « Déficits à investiguer » : même ajout.
6. PDF expert, section « Orientations » : même ajout (bug `colMap` corrigé en `SC`).
7. Onglet UI « Variables » (`ExpertView`) : filtre par qualité (`varFilter`/`setVarFilter`),
   réutilisant `HYP_CSM_QUALITIES` et `VAR_REL3.measures/estimates` déjà existants.

---

## 9. Tests

`tests/uxUiLot1.test.js` — **20 tests, tous verts**, couvrant les 8 cas mandatés (Objectif 7) :

1. Plusieurs déficits de même sévérité (pré-requis du scénario).
2. Absence de « Priorité 1/2/3 » artificielle dans le PDF sportif généré réellement + présence des 3
   qualités sans classement dans « Plan de prise en charge ».
3. `recVerbs` n'est plus déclaré comme code exécutable ; aucune étiquette « Renforcer »/
   « Développer »/« Intégrer » dans le PDF.
4. Absorption avec 4 sous-domaines : `absorptionSousDomainesSummary` retourne exactement A-D (jamais
   E) ; le statut de chaque sous-domaine reflète fidèlement `hypAbs01.sousDomaines` ; les 4 libellés
   apparaissent dans le PDF ; aucune mention du sous-domaine E.
5. Absorption avec sous-domaines non classifiables (Stratégie/Réactive sans données) : statut `null`,
   vocabulaire « Non déterminable » affiché dans le PDF, jamais « normal ».
6. Absorption non déterminable (aucune donnée) : les 4 sous-domaines sont `status:null`.
7. Absence de régression des 8 moteurs HYP : `functionScores` strictement identique (JSON) avant/
   après un appel à `absorptionSousDomainesSummary` intercalé entre deux calculs de `computeMoteur()`.
8. Absence de modification de CSM : `clinicalSynthesis` strictement identique sur deux calculs
   successifs ; ordre de `priorities` toujours rouge avant orange (`statusPriorityRank` intact).

Plus 2 tests de cohérence pour le filtre Variables (référentiel `HYP_CSM_QUALITIES` et structure
`VAR_REL3` déjà existants, non modifiés).

---

## 10. Vérification navigateur

Serveur local + Playwright (React/ReactDOM servis localement, `cdnjs` bloqué par la politique réseau
du bac à sable). Scénario testé : bilan avec CMJ (braking_rfd/force_zero_vel/peak_eccentric_velocity
dégradés) + WBLT dégradé.

- **Onglet Variables** : capture réelle confirmant la rangée de filtres (« Toutes » + 8 qualités),
  clic sur « Absorption » → liste réduite aux variables liées à Absorption dans `VAR_REL3`
  (« Time to Take Off », « Countermovement Depth », etc., chacune listant `Absorption · Moderee` sous
  Estimates/Measures) — filtre fonctionnel, aucune erreur console, aucun `undefined`.
- **Dashboard / widget « Déficits à investiguer »** : capturé avec Mobilité objectivée (aucune
  erreur, rendu identique au comportement pré-existant) ; l'entrée de données CMJ via automatisation
  navigateur s'est révélée peu fiable dans cet environnement pour faire apparaître Absorption comme
  objectivée dans le même run (limite déjà rencontrée lors de missions précédentes de cette session,
  non spécifique à ce lot). Compensé par : (a) le code du widget dashboard appelle exactement la même
  fonction `absorptionSousDomainesSummary()` que celle déjà vérifiée visuellement dans les deux PDF
  (§11), avec le même motif de rendu ; (b) `tests/uxUiLot1.test.js` CAS 4/5/6 exercent directement
  cette fonction sur le pipeline réel.

---

## 11. Vérification PDF

PDF sportif et PDF expert régénérés réellement (`buildFullReportHtml`) sur le scénario à 3 qualités
objectivées (Mobilité rouge, Absorption rouge avec freinage + capacité excentrique dégradés,
Stabilisation rouge, relation Mobilité→Stabilisation) et inspectés par capture d'écran complète :

- **PDF sportif** : section 3 « Déficits à investiguer » — carte Absorption affiche désormais 4
  chips (« Freinage / décélération » rouge, « Capacité excentrique » rouge, « Stratégie · Non
  déterminable » gris, « Absorption réactive · Non déterminable » gris) juste sous l'en-tête, avant
  le bloc Objectif — aucune régression du reste de la carte. Section 5 « Plan de prise en charge » —
  3 cartes (Mobilité/Absorption/Stabilisation), pastille + nom, **aucun badge « Priorité N »**,
  **aucune étiquette Renforcer/Développer/Intégrer**. Aucun `undefined`, aucun `null` visible, aucune
  incohérence de couleur détectée sur l'ensemble des 3 pages.
- **PDF expert** : section « Orientations » — carte Absorption affiche les mêmes 4 chips ; le reste
  du document (Fonctions évaluées, Synthèse clinique, Résultats bruts, Systèmes contributeurs)
  inchangé et cohérent avec le PDF sportif (mêmes statuts, même vocabulaire).

---

## 12. Non-régression

- **Diff scope** : `git diff --stat` — 1 fichier (`index.html`), +97/-18 lignes, toutes contenues
  dans `buildSportifReport`, `buildExpertReport`, `AnalyseView`, `ExpertView`, et la nouvelle
  fonction `absorptionSousDomainesSummary`/`priHypObjectifiedSplit` (zone déjà utilisée par la
  mission précédente). Aucune ligne à l'intérieur d'un `computeHypXxx01`, de `computeMoteur()`
  lui-même, ni de `computeHypClinicalSynthesis01`.
- **Comparaison stricte** (script dédié, 8 scénarios couvrant les 8 qualités + un scénario vide) :
  `functionScores` (state/status des 8 moteurs HYP), `priorities`, `clinicalSynthesis.objectified`,
  `clinicalSynthesis.relationships` — **identiques caractère pour caractère avant/après** (`diff`,
  code de sortie 0).
- **Suite complète** : **32 fichiers `tests/*.test.js` (31 préexistants + 1 nouveau), 0 échec.**

---

## 13. Éléments volontairement laissés pour un prochain lot

- **Sous-domaine E (Réception/Impact)** : reste non implémenté côté moteur (hors périmètre de cette
  mission) et donc non affiché — si un mécanisme y est ajouté un jour, `absorptionSousDomainesSummary`
  devra être étendu (lecture seule, même principe).
- **Interaction sous-domaine → détails** (Objectif 2C, optionnelle) : non implémentée — les chips
  restent statiques ; construire une navigation dédiée (clic sur un chip → onglet Résultats filtré
  sur les tests du sous-domaine) nécessiterait un état de navigation supplémentaire, jugé hors
  périmètre du lot 1 conformément à l'instruction « si cela nécessite trop de code, rester sur une
  présentation statique claire ».
- **Fiche qualité unifiée** (mentionnée dans l'audit, Partie 13) : les informations d'une qualité
  restent réparties entre plusieurs onglets/cartes — non traité ici, nécessiterait une validation du
  besoin avant conception.
- **Vocabulaire « Priorité » à 3 sens** (audit Partie 4.2) : la section « Fil de Raisonnement »/
  Mouvement continue d'employer « Priorité clinique » pour les phases de mouvement CMJ — légitimement
  un concept différent (une seule qualité, plusieurs phases), non modifié ; à documenter si jugé
  nécessaire dans un prochain lot.

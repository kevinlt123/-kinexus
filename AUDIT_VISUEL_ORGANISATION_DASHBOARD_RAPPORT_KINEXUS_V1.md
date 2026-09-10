# ÉTAT DES LIEUX — Visuel du Dashboard/Rapport KINEXUS et organisation des écrans

**Type** : Audit de lecture seule (aucun moteur, aucune donnée, aucun composant modifié).
**Périmètre** : (1) le système visuel (palette, typographie, mise en page) tel qu'il se manifeste sur le Dashboard, le profil athlète, l'écran d'Analyse et les deux rapports (Sportif/Expert) ; (2) l'organisation de ces écrans (arborescence de navigation, regroupements, nommage).
**Question centrale** : à quoi ressemble Kinexus aujourd'hui, écran par écran, et son organisation actuelle sert-elle ou gêne-t-elle la lecture clinique par le praticien ?
**Ce que ce document n'est pas** : ni une proposition de refonte, ni un lot d'implémentation. Aucun changement n'a été demandé à ce stade — seulement un constat, avec preuves.

---

## 1. Méthodologie

Constat obtenu par exécution réelle de l'application dans un navigateur (Chromium via Playwright), avec un jeu de données cliniques riche et réaliste (athlète « Léo Fournier », bilan RTP · LCA, 11 tests actifs couvrant CMJ, SLCMJ, Drop Jump, SLDJ, WBLT, YBT, isométriques mollet, Belt Squat, Landing Unilatéral, SLLT) injecté directement dans le `localStorage` de l'application — jamais par relecture de code seule pour les captures d'écran, uniquement pour la vérification des causes une fois un comportement observé. 12 captures ont été produites en suivant le parcours praticien complet : Dashboard → profil athlète → écran d'Analyse (4 vues de premier niveau × 11 sous-onglets Expert) → aperçu du rapport → rapport sportif complet rendu.

Deux audits antérieurs de ce cycle (`AUDIT_FINAL_UX_UI_KINEXUS_V1.md`, `AUDIT_RATIONALISATION_VUES_KINEXUS_V1.md`) couvrent des vues en détail plus fin (fil de raisonnement clinique, cohérence des relations structure-qualité). Ce document ne les répète pas : il vérifie ce qui a changé depuis, et se concentre sur le visuel et l'organisation, pas sur l'exactitude clinique du contenu.

---

## 2. Système visuel actuel

**Palette** (`index.html:79`, objet `C`, un seul jeu de tokens, pas de mode sombre) :
- Fond de page `bg` #EEF2F5, cartes `card` #FFFFFF sur fond de section `surface` #F3F6F8, bordures `border` #E1E8EE — un gris bleuté froid cohérent sur tout le logiciel, jamais de blanc pur en fond de page.
- `petrol` #1B4F6A (bleu-pétrole foncé) pour l'en-tête et la colonne latérale du profil athlète — sert d'ancre d'identité visuelle constante pendant toute la navigation dans un bilan.
- `teal` #2A9D8F comme couleur d'accent/action (onglet actif, boutons secondaires).
- Un vocabulaire sémantique à 4 couleurs strictement respecté partout : `vert` (Optimal), `jaune` (À surveiller), `orange` (Déficitaire), `rouge` (Critique), chacune avec sa variante `*Bg` en aplat léger. Ce vocabulaire est le même sur les jauges de qualités fonctionnelles, la légende de la Body Map, les puces de statut, les pastilles du tableau d'asymétries, les cartes d'orientations, les bandeaux du rapport PDF. **C'est le point le plus solide du système visuel actuel** : un praticien qui a compris le code couleur sur le Dashboard le retrouve identique jusque dans le PDF remis à l'athlète.

**Typographie et densité** : pas d'échelle typographique déclarée (pas de token `fontSize` réutilisable) — chaque élément fixe sa propre taille en pixels inline (`fontSize:13`, `fontSize:11`, `fontSize:10.5`…). En pratique le rendu reste lisible et cohérent car les valeurs se répètent par convention (titres de carte ≈13, corps ≈11, légendes ≈10), mais rien ne garantit cette cohérence structurellement : un futur ajout peut dériver sans qu'aucune règle ne le signale.

**Motif de mise en page dominant** : cartes blanches à coins arrondis, sur fond gris-bleu, organisées en sections numérotées (« 01 · SYNTHÈSE GLOBALE », « 02 · BODY MAP MUSCULAIRE », etc.). Cette numérotation n'est pas décorative : elle encode un ordre de lecture clinique volontaire (du pronostic global vers le détail), cohérent sur Dashboard, Analyse et rapport PDF. C'est un choix pertinent, à condition que l'ordre soit vraiment le même partout (voir §4).

**Cohérence latérale** : la colonne de gauche (identité athlète, âge/taille/poids/sexe, objectif du bilan, actions Modifier/Aperçu/PDF) reste identique et fixe entre le profil athlète et toutes les sous-vues de l'Analyse — bon point d'ancrage, le praticien ne perd jamais le contexte patient en changeant d'onglet.

---

## 3. Carte de l'organisation actuelle

```
Dashboard (liste des athlètes)
 └─ Profil athlète (métadonnées + badges normes + liste des bilans)
     └─ Bilan → écran d'Analyse
         ├─ Expert (vue par défaut) — 11 sous-onglets en 4 groupes :
         │    Vue d'ensemble    : Fonctions · Synthèse clinique · CSM V2
         │    Détail des données: Résultats · Variables · Capacités · Systèmes
         │    Interprétation    : Hypothèses · Orientations
         │    Référence         : Couverture · Relations structure-qualité
         ├─ Mouvement
         ├─ Fil de Raisonnement
         └─ Historique
     └─ Aperçu du rapport (iframe) → Rapport Sportif ou Rapport Expert (PDF)
```

Soit **15 destinations de navigation** atteignables depuis un seul bilan (4 vues de premier niveau + 11 sous-onglets Expert), confirmant — en la précisant — la mise en garde des audits précédents sur le nombre de vues empilées dans un seul écran. Vérifié directement dans le code : `index.html:17030` (liste des 11 tabs), `index.html:16429` (les 4 vues de premier niveau).

**Un point de confusion identifié par les audits précédents semble corrigé** : l'ancien sous-onglet « Raisonnement » (qui entrait en collision de nom avec l'onglet supérieur « Fil de Raisonnement ») s'appelle aujourd'hui **« Relations structure-qualité »** (`index.html:17030`, `17286`). Le libellé est sans ambiguïté avec « Fil de Raisonnement ». C'est une amélioration réelle par rapport à l'état documenté dans `AUDIT_FINAL_UX_UI_KINEXUS_V1.md` §2.

Un onglet **« CSM V2 »** est apparu dans le groupe « Vue d'ensemble » depuis le dernier audit de navigation (qui en comptait 10, il y en a 11 aujourd'hui) — cohérent avec les missions CSM V2 livrées entre-temps dans ce cycle, mais qui alourdit encore la première rangée d'onglets.

---

## 4. Revue écran par écran

**Dashboard** (`01_dashboard.png`) — en-tête sobre, titre « Tableau de bord », recherche/filtres, une carte par athlète (avatar, nom, sport, date du dernier bilan, nombre de bilans, actions). Écran clair, peu chargé, aucun problème visuel constaté.

**Profil athlète** (`02_athlete_profile.png`) — fil d'Ariane, avatar, métadonnées, une rangée de badges de population de référence : un badge de population globale choisie manuellement, et plusieurs badges 🤖 à bordure pointillée pour les sélections automatiques NORMS_V2 par test. La distinction visuelle manuel/automatique est claire (bordure pleine vs pointillée, icône robot). Liste des bilans avec statut coloré (« Validé » en vert). Aucun problème constaté.

**Expert · Fonctions** (`03_analyse_expert_fonctions.png`) — vue la plus dense de l'application : synthèse globale (4 cartes), 8 jauges de qualités fonctionnelles, Body Map musculaire avec légende, synthèse clinique (points forts/limitants/non évalués/à investiguer), tableau d'asymétries majeures, chaîne causale, recommandations, puis le détail par fonction en cartes à bordure colorée. Tout cela **avant même d'arriver au contenu propre du sous-onglet « Fonctions »**, qui n'apparaît qu'après un défilement long. Le bloc 01-06 (synthèse) se répète identique en haut de chaque sous-onglet Expert (confirmé sur les 05 captures suivantes) — cohérent pour l'ancrage clinique, mais signifie que changer de sous-onglet ne change en réalité que le bas de l'écran, ce qui n'est pas évident au premier coup d'œil puisque rien ne signale visuellement où s'arrête la partie fixe.

**Expert · Synthèse clinique** (`04_analyse_synthese_clinique.png`) — présentation par paliers de certitude (Qualités objectivement déficitaires / suspectées / non déterminables), relations explicatives en citations à filet coloré, et un bloc « Limites de cette synthèse » explicite. Formulation prudente et bien exposée (« ni normal, ni confirmé, ni non déterminable », « non déterminable n'équivaut jamais à normal ») — bon niveau de rigueur visuelle pour un contenu à haut risque d'interprétation hâtive.

**Expert · Orientations** (`05_analyse_orientations.png`) — 3 cartes courtes à puce colorée, une par déficit objectivé. Contenu clair, mais redondant à l'identique avec le bloc « 06 · RECOMMANDATIONS » déjà affiché plus haut dans la partie fixe de l'écran (mêmes 3 phrases, mot pour mot) — un sous-onglet entier dont le contenu est déjà visible sans avoir à y cliquer.

**Expert · Variables — PANNE BLOQUANTE** (`06_analyse_variables_CRASH.png`) — voir §5, constat critique séparé.

**Expert · Capacités** (`07_analyse_capacites.png`) — 4 groupes (Saut, Accélération, Réception, Changement de direction), chacun décliné en 3 sous-capacités avec liste de qualités contributives et statut. Dense mais organisé, cohérent avec le référentiel clinique déclaré en tête de section.

**Expert · Relations structure-qualité** (`08_analyse_raisonnement.png`) — écran de référence quasi-statique (Contribution/Confiance/Spécificité par muscle × qualité), couvrant 11 groupes musculaires (`SYSTEMS`, `index.html:1018` : Quadriceps, Ischio-jambiers, Fléchisseurs de hanche, Extenseurs de hanche, Adducteurs, Abducteurs, Rotateurs de hanche, Cheville, Soléaire, Gastrocnémien, Sensoriel). Capture en pleine page : **6002 px de hauteur pour cet unique sous-onglet**, largement le plus long de toute l'application — confirme le constat de `AUDIT_RATIONALISATION_VUES_KINEXUS_V1.md` sur le caractère peu actionnable de cette vue (référentiel, pas données du patient). Point de vigilance visuel propre à cet audit : les libellés **« Adducteurs »** et **« Abducteurs »** apparaissent en sections consécutives dans une liste par ailleurs très répétitive visuellement (même structure de carte, même 5 lignes Force/Explosivité/Puissance/Absorption/Stabilisation) — deux mots qui ne diffèrent que d'une lettre, dans le seul contexte de l'application où ils sont voisins visuellement. Risque de confusion à la lecture rapide, à surveiller si cette vue reste dans son format actuel.

**Fil de Raisonnement** (`09_fil_de_raisonnement.png`) — présentation en priorités numérotées avec preuves convergentes, taux de confiance, variables responsables et logique « pourquoi cette conclusion plutôt qu'une autre » entièrement dépliée. C'est visuellement la vue la plus travaillée du logiciel (bandeau de résumé chiffré Descente/Freinage/Propulsion/Vol/Réception, badges de preuve, indice de confiance global) — cohérente avec la mention en commentaire de code d'une référence UX dédiée (`kinexus_reasoning_ui.html`, `index.html:4871`).

**Mouvement** (`10_mouvement.png`) — schéma de phases de saut (silhouettes + courbe de force annotée, phase limitante surlignée en rouge) suivi d'un texte structuré Pourquoi/Preuves convergentes/Conclusion. Bonne association visuel-texte, cohérent avec le Fil de Raisonnement dont il partage la logique explicative.

**Aperçu du rapport (coquille)** (`11_report_preview_shell.png`) — barre d'actions (Modifier/Enregistrer/Télécharger/Retour) au-dessus d'un iframe contenant le rendu réel du PDF. Fonctionne, rien à signaler sur cette coquille.

**Rapport Sportif complet** (`12_report_sportif_full.png`) — rendu réel de `buildFullReportHtml`, très long (9196 px de haut à largeur A4-like), organisé en sections numérotées cohérentes avec le reste de l'app (couleurs identiques, mêmes codes de statut). Il alterne contenu grand public (bandeaux sombres « Votre bilan en quelques mots », langage simple) et données techniques brutes (ex. « BILT — Force maximale : 4272 N / 55,72 N/kg », valeurs de RSI, N/kg par côté) dans le même document destiné à l'athlète. Ce mélange de registres au sein d'un même rapport « Sportif » est un choix qui mérite d'être confirmé comme intentionnel — un rapport plus long qu'un rapport expert type n'est pas un problème en soi si le praticien le présente en séance, mais vaut d'être noté puisque le rapport dit « Sportif » contient autant de chiffres bruts que d'explications en langage clair.

---

## 5. Constat critique : l'onglet « Variables » plante entièrement l'écran d'Analyse

**Reproductible à 100 %**, sur toute donnée réelle. En ouvrant Expert → Variables sur un bilan comportant un test actif dans `VAR_REL3` (c'est-à-dire pratiquement toujours), la console révèle :

```
ReferenceError: normSelections is not defined   (index.html:17234)
```

**Cause exacte** — dans `ExpertView` (`index.html:17016`), le bloc de rendu du sous-onglet `variables` appelle :

```js
// index.html:17234
var st=kpiStatus(v.testKey,v.kpi.key,td,effectiveNormPop(athlete),athleteAge,normSelections);
```

Or `ExpertView` ne déclare `normSelections` nulle part dans sa propre portée — sa signature ne fournit que `props.res, props.evFns, props.testData, props.questData, props.athlete, props.athleteAge` (`index.html:17021-17023`), et le seul site d'appel du composant (`index.html:16431`) ne lui passe pas non plus cette valeur. À titre de comparaison, le composant voisin `ResultsBrowser` (utilisé par le sous-onglet « Résultats ») calcule correctement la sienne en interne : `var normSelections=effectiveNormSelections(athlete).normSelections;` (`index.html:16963`). Le sous-onglet Variables n'a jamais reçu l'équivalent — ni en le calculant localement, ni en le recevant en prop depuis `AnalyseView`, qui pourtant calcule déjà `effNormSel` pour ses propres besoins (`index.html:16126`).

**Impact** — React 18 démonte tout l'arbre de composants au premier rendu qui lève une exception non interceptée (aucun ErrorBoundary dans l'application). Résultat : l'écran devient entièrement blanc (capture `06_analyse_variables_CRASH.png` : uniquement le fond `#EEF2F5`, plus aucun élément), et **toute l'interface — pas seulement l'onglet Variables — cesse de répondre** jusqu'à un rechargement complet de la page. Le praticien perd sa navigation en cours dans le bilan.

**Statut par rapport aux audits précédents** — ni `AUDIT_FINAL_UX_UI_KINEXUS_V1.md` ni `AUDIT_RATIONALISATION_VUES_KINEXUS_V1.md` ne mentionnent ce plantage ; les deux documentent au contraire le sous-onglet Variables comme fonctionnel (avec un bug de filtrage par accents, corrigé depuis, `index.html:17225` `normalizeQualityKey`). Cela signale une **régression introduite après ces deux audits**, vraisemblablement par une mission ultérieure ayant fait évoluer `kpiStatus`/`computeStatusWithNormsV2` pour accepter un paramètre `normSelections` (les missions NORMS_V2 / auto-sélection des normes) sans mettre à jour tous les appelants existants.

Ce point n'appelle pas de proposition de correction dans ce document (audit en lecture seule) mais doit être signalé comme le constat le plus sévère de cet état des lieux : il s'agit d'un blocage fonctionnel complet sur un sous-onglet placé dans le groupe « Détail des données », pas d'un défaut cosmétique.

---

## 6. Comparaison avec les audits précédents

| Constat antérieur | Statut aujourd'hui |
|---|---|
| Confiance « elevee » sans accent (`AUDIT_FINAL…§?`) | **Corrigé** — `CONFIDENCE_LABEL` (`index.html:13235`) porte l'accent, commentaire de code confirmant le correctif. |
| Collision de nom « Raisonnement » / « Fil de Raisonnement » | **Corrigé** — le sous-onglet est renommé « Relations structure-qualité ». |
| Filtre Variables cassé par incohérence d'accents dans `VAR_REL3` | **Corrigé** — normalisation explicite via `normalizeQualityKey` avant comparaison (`index.html:17225`). |
| 13 destinations de navigation dans un seul écran d'Analyse | **Toujours vrai, aggravé** — 15 aujourd'hui avec l'ajout de l'onglet CSM V2. |
| Vue « Relations structure-qualité » très longue, peu actionnable, référentiel statique | **Toujours vrai** — confirmé visuellement (6002 px, 11 groupes musculaires quasi identiques). |
| Onglet Variables fonctionnel | **Régression** — plantage bloquant intégral, non documenté auparavant (voir §5). |

---

## 7. Constats classés par sévérité (sans proposition de correctif)

**P0 — bloquant** : le plantage de l'onglet Variables (§5) rend une partie du produit inutilisable et interrompt la session de travail du praticien.

**P1 — organisation** : 15 destinations de navigation dans un seul écran d'Analyse, réparties sur 2 niveaux (4 vues + 11 sous-onglets), avec un contenu de synthèse (blocs 01-06) répété à l'identique en tête de chaque sous-onglet Expert sans indication visuelle claire de la frontière entre partie fixe et contenu propre au sous-onglet. Le sous-onglet Orientations duplique mot pour mot le contenu déjà visible dans le bloc Recommandations plus haut sur le même écran.

**P2 — lisibilité fine** : absence d'échelle typographique déclarée (dérive silencieuse possible) ; proximité visuelle des libellés « Adducteurs »/« Abducteurs » dans une liste très répétitive ; mélange de registres (langage patient / valeurs techniques brutes) au sein du même rapport « Sportif » destiné à l'athlète, à confirmer comme un choix assumé.

**Point fort à préserver** : le vocabulaire sémantique à 4 couleurs (vert/jaune/orange/rouge) est appliqué avec une cohérence remarquable sur l'intégralité du parcours, du Dashboard jusqu'au PDF — c'est l'élément le plus solide du système visuel actuel et il ne doit pas être perturbé par une éventuelle évolution future.

---

## 8. Hors périmètre de ce document

- L'exactitude clinique du contenu (raisonnement, seuils, relations) — déjà couverte par les audits `AUDIT_*` et les missions de tests dédiées (dossier `tests/`).
- Le rapport « Expert » (PDF praticien, distinct du rapport « Sportif » capturé ici) n'a pas été régénéré dans cette passe.
- Aucune estimation d'effort ni aucun choix d'implémentation n'est proposé ici — conformément au cadrage du document, une évolution éventuelle devra être justifiée par sa valeur clinique pour le praticien, pas par son seul intérêt visuel.

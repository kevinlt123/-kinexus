# AUDIT FINAL UX/UI KINEXUS V1 — Parcours complet après stabilisation

**Type** : Audit de lecture seule (aucune donnée, aucun moteur, aucun composant modifié)
**Périmètre couvert** : parcours complet praticien (saisie → analyse → synthèse → 4 vues expert + 6 vues supplémentaires découvertes → PDF sportif → PDF expert), sur la base des correctifs Lot Rationalisation Vues 1 et Lot A UX Saisie déjà livrés et validés dans ce même cycle de travail.
**Question centrale** : un kiné, un médecin ou un préparateur physique qui découvre Kinexus aujourd'hui peut-il comprendre naturellement quoi faire, ce que le logiciel mesure, ce que les résultats signifient, ce qui est certain, ce qui reste incertain, où trouver le détail et comment obtenir un rapport — sans qu'on lui explique l'architecture interne ?

---

## 1. Méthodologie

L'audit a combiné trois sources de preuve, toutes vérifiées dans un navigateur réel (Chromium via Playwright) ou par exécution directe du moteur de calcul (`computeMoteur`), jamais par relecture de code seule :

1. **Parcours navigateur complet** : création d'athlète, sélection de batterie, saisie de 4 tests (WBLT, CMJ, Landing Unilatéral, Isometric Belt Squat), navigation, validation, puis exploration exhaustive de l'écran d'analyse — les 4 onglets haut niveau (**Expert / Mouvement / Fil de Raisonnement / Historique**) et, sous « Expert », les **10 sous-onglets** (Fonctions, Synthèse clinique, Résultats, Variables, Capacités, Systèmes, Hypothèses, Orientations, Couverture, Raisonnement).
2. **Génération réelle des deux PDF** (sportif et expert) via le harnais headless `computeMoteur()` + `buildFullReportHtml()` extrait tel quel du code de production (pas de réimplémentation), avec capture d'écran Playwright du HTML produit — donc le PDF réellement généré par l'application, pas une maquette.
3. **Vérification croisée navigateur / calcul direct** sur un scénario clinique riche (déficit de Mobilité cheville confirmé + déficit d'Absorption confirmé, avec plusieurs qualités non déterminables), plus deux scénarios de contrôle (profil sans aucune donnée, profil aux valeurs normales) pour vérifier que le moteur ne bascule jamais artificiellement vers un diagnostic quand l'évidence ne le justifie pas, et qu'il sait aussi rassurer quand tout va bien.

**Incident méthodologique et sa résolution** — Lors du premier passage au clavier-souris en direct, la saisie CMJ n'a pas été prise en compte par le script d'automatisation (problème déjà rencontré plus tôt dans ce cycle), ce qui faisait apparaître à tort l'Absorption comme « non déterminable » dans une capture d'écran. Le recalcul direct du même jeu de données via `computeMoteur()` a produit `Absorption : rouge / retenue_faible` — confirmant que le moteur est correct et que l'anomalie venait du script de test, pas de l'application. Ce point est important pour la suite de l'audit : partout où ce document affirme qu'un comportement est correct, c'est sur la base d'une vérification qui contourne ce piège (injection directe des données via `localStorage`, puis clic réel dans l'interface).

Rappel du cadre : audit **strictement en lecture seule**. Aucun moteur HYP, CSM, TFM, VAR_REL3, aucune norme, aucun seuil, aucune règle de convergence ou de relation n'a été modifié. Toutes les observations ci-dessous portent sur la présentation, la navigation et la formulation.

---

## 2. Découverte majeure préalable : la carte réelle des vues est plus large que ce que documentaient les audits précédents

Les audits précédents de ce cycle (Rationalisation des vues, UX Saisie) ont raisonné sur « 4 vues » de l'écran d'analyse : Fonctions, Variables, Capacités, Raisonnement. C'était vrai en surface mais incomplet. L'exploration exhaustive de cet audit révèle que l'écran d'analyse expose en réalité :

- **4 onglets de premier niveau** : Expert, Mouvement, Fil de Raisonnement, Historique.
- **10 sous-onglets** sous « Expert », dans une seule rangée horizontale : Fonctions, Synthèse clinique, Résultats, Variables, Capacités, Systèmes, Hypothèses, Orientations, Couverture, Raisonnement.

Soit **13 destinations de navigation distinctes** dans l'écran d'analyse d'un seul bilan (en comptant Expert lui-même), dont deux portent presque le même nom (« Raisonnement » en sous-onglet, « Fil de Raisonnement » en onglet supérieur) — un piège qui a d'ailleurs fait échouer un script d'automatisation par correspondance textuelle approximative pendant cet audit, signe que la proximité des libellés est réelle et pas seulement un artefact de test.

Cette découverte recadre plusieurs parties de cet audit : la question n'est plus seulement « les 4 vues qu'on connaissait sont-elles complémentaires ou redondantes » (question à laquelle le Lot Rationalisation Vues 1 a bien répondu), mais « treize destinations dans un seul écran sont-elles navigables sans notice pour un praticien qui découvre l'outil ». La réponse à cette deuxième question est nettement plus réservée, et c'est le constat le plus important de cet audit.

---

## 3. Parcours complet — Saisie → Validation

Ce module a déjà fait l'objet d'un audit dédié (`AUDIT_UX_SAISIE_KINEXUS_V1.md`) suivi d'un lot correctif livré et vérifié (`IMPLEMENTATION_UX_SAISIE_LOTA.md`). Cet audit a re-vérifié en conditions réelles, sur un nouveau parcours (création d'un athlète « Léo Fournier », bilan « Performance · Pré-saison », 4 tests), que les correctifs tiennent :

- Le bandeau de confirmation avant sortie sans enregistrement (« ⚠️ Mesures non enregistrées ») se déclenche bien uniquement quand des mesures réelles existent, et son bouton destructeur porte bien le libellé « Quitter le bilan », distinct du bouton « Quitter » (déconnexion) du bandeau global — plus de collision entre les deux.
- La liste des tests distingue bien un test simplement sélectionné-mais-vide (« Sélectionné · non renseigné », puce grise) d'un test partiellement ou totalement renseigné (« X/N », puce colorée) — l'ambiguïté « sélectionné = fait » relevée dans l'audit précédent est résolue.
- La navigation « ‹ Test précédent / Test suivant ›" et le compteur « n / N de la batterie » fonctionnent et se désactivent correctement en début/fin de liste.
- La barre de progression de validation (« X/N tests renseignés ») et le blocage du bouton « Valider le bilan » tant qu'aucune mesure réelle n'existe sont opérationnels — testé en navigateur avec un bilan à 4 tests renseignés sur 4, barre pleine, bouton actif.

Aucun problème résiduel **critique** n'a été identifié sur ce module lors de cette repasse. Le seul point encore observable, déjà connu et hors périmètre du Lot A (car il touche à la structure de la batterie, pas à sa sécurisation), est que la liste de sélection de tests reste une longue liste plate de 49 tests groupés par catégorie technique (Mobilité, Force Segmentaire, Force Globale, Force-Vitesse, Sauts, Landing, Sensoriel, Tests Fonctionnels) sans réduction ni recommandation contextuelle — un praticien pressé doit connaître à l'avance quels tests il veut faire.

---

## 4. Parcours complet — Analyse (vue d'ensemble)

Le clic sur un bilan renseigné mène directement à l'écran d'analyse, sans étape intermédiaire « Analyser » superflue si des données existent déjà — bon point de fluidité. Le haut de cet écran (sections numérotées 01 à 06 : Synthèse globale, Body Map musculaire, Synthèse clinique courte, Asymétries majeures, Chaîne causale, Recommandations) est **commun à tous les sous-onglets Expert** : il reste affiché en haut de la page quel que soit le sous-onglet sélectionné en dessous. C'est une bonne décision de conception — le praticien garde toujours sous les yeux le verdict global pendant qu'il explore le détail — mais elle a un coût : sur un écran de 1400×1000, ce bloc commun occupe l'essentiel de la première fenêtre, et il faut défiler pour atteindre la barre des 10 sous-onglets puis leur contenu. Un praticien qui ouvre l'écran pour la première fois voit d'abord un tableau de bord dense (4 cases de synthèse, une silhouette anatomique avant/arrière, une liste de 9 qualités avec barres colorées, un panneau de synthèse clinique, un tableau d'asymétries, une chaîne causale illustrée, une liste de recommandations) avant même de savoir qu'il existe encore 10 autres vues en dessous.

---

## 5. Saisie — problèmes résiduels (Partie 5 de la mission)

Conformément à la consigne de ne documenter que ce qui **reste** après le Lot A, et pas de refaire l'audit UX Saisie en entier :

- **Résolu et vérifié** : perte silencieuse de données, ambiguïté sélectionné/rempli, absence de navigation test-à-test, validation possible sur bilan vide.
- **Non résolu, mineur** : aucune indication, au moment de choisir les tests dans la longue liste de 49, de « ce que je dois cocher pour évaluer X » — le lien entre un objectif clinique (« je veux évaluer l'absorption ») et les tests à sélectionner (CMJ, Landing Unilatéral, Drop Jump...) n'est pas assisté. C'est un problème de guidage, pas de sécurité, donc à raison hors scope du Lot A qui visait explicitness la sécurisation.

---

## 6. Synthèse clinique

Confirmé sur capture pleine page en conditions réelles : c'est, comme les audits précédents l'avaient déjà établi, **l'écran le plus clair de l'application**, et cette repasse ne trouve rien qui contredise ce constat. Structure observée : un bandeau « Qualités objectivées — même niveau de priorité clinique, aucun classement entre elles » suivi de deux cartes (Mobilité · Cheville / Absorption) présentées à égalité, sans hiérarchie artificielle ; une section « Qualités suspectées (preuve partielle) » ; une section « Non déterminable avec les données actuellement disponibles » qui énumère explicitement les qualités concernées (Réactivité, Force, Puissance, Explosivité, Endurance) au lieu de les faire disparaître silencieusement ; une section « Concordances (sans relation documentée) » qui explique honnêtement que deux déficits coexistent sans qu'un lien de causalité ait pu être établi dans le référentiel. Le texte est rédigé en langage clinique courant, sans jargon de moteur (pas de « HYP-ABS-01 » ni de « CSM » visibles), et les limites de l'analyse sont assumées plutôt que masquées (« Cette synthèse ne détermine ni la relation de cause à conséquence, ni la priorité thérapeutique »).

Un défaut mineur et récurrent, déjà repéré ailleurs (voir Partie 16) : la formulation générée automatiquement produit « déficits de Mobilité et de Absorption » au lieu de « d'Absorption » — l'élision manque quand le nom de la qualité commence par une voyelle. Ce même texte généré apparaît à l'identique dans l'onglet Hypothèses et dans le PDF expert, donc l'erreur se propage aux trois surfaces.

---

## 7. Qualités fonctionnelles (bloc « 01 · Synthèse globale » / liste de qualités)

La liste des 9 qualités (Mobilité, Force, Explosivité, Puissance, Réactivité, Absorption, Stabilisation, Contrôle Frontal, Endurance) avec barre colorée et statut textuel est lisible et cohérente avec le reste. Deux points :

- Le champ de confiance s'affiche « Confiance elevee » sans accent — un jeton interne (`elevee`, `moderee`, `faible`) imprimé tel quel au lieu d'être traduit en « Confiance élevée ». Ce défaut, déjà noté dans un audit antérieur de ce cycle, est **toujours présent** après tous les lots livrés depuis — confirmé de nouveau sur cette capture.
- Rien dans cette liste ne distingue visuellement une qualité gouvernée par le moteur HYP (comme Mobilité ou Absorption ici) d'une qualité purement TFM (comme Contrôle Frontal) — les deux sont présentées dans des cartes identiques. Ce constat avait déjà été fait par l'audit de rationalisation des vues et volontairement laissé hors périmètre du Lot 1 (qui ne touchait qu'à Capacités et Variables). Il reste donc, comme prévu, un point ouvert.

---

## 8. Fonctions

Le sous-onglet « Fonctions » est la vue par défaut de l'écran Expert et reprend, sous forme de cartes détaillées (une par qualité, avec couverture %, confiance et tests contributeurs), le même contenu que la liste de qualités du haut de page — en plus complet. C'est une extension naturelle et non une redite : le haut de page donne le résumé, « Fonctions » donne le détail par qualité avec la liste des tests qui y contribuent et leur poids (Direct / Mineur / Majeur). Bonne complémentarité.

---

## 9. Variables

Confirmé cohérent avec l'audit de rationalisation des vues : un système de puces de filtre par qualité (« Toutes / Mobilité / Réactivité / Absorption / Force / Puissance / Explosivité / Stabilisation / Endurance ») permet d'explorer les variables individuelles associées à chaque qualité. C'est la vue la plus fine-grain : elle descend au niveau de la variable brute (ex. « braking_rfd »), là où Fonctions reste au niveau de la qualité agrégée. La correction du Lot Rationalisation Vues 1 (normalisation des accents pour le filtre) est confirmée fonctionnelle.

---

## 10. Capacités

Confirmé sur capture pleine page : les 4 capacités sportives (avec leurs sous-capacités) affichent bien, pour chaque qualité, soit un statut avec l'étiquette « · information complémentaire » quand seul le TFM (référentiel générique) est disponible, soit le statut HYP prioritaire quand il existe — la réconciliation livrée par le Lot Rationalisation Vues 1 fonctionne dans ce nouveau scénario, plus riche que celui testé à l'époque. Le motif de redondance déjà documenté (le même statut « non déterminable » ou « information complémentaire » se répète sur de nombreuses lignes de sous-capacités) est présent mais reste, comme conclu par cet audit antérieur, un choix assumé (Option retenue : ne pas fusionner) et non une régression.

---

## 11. Raisonnement — attention, deux destinations portent ce nom

C'est le point de vigilance terminologique le plus concret de cet audit. Il existe :

1. Un **sous-onglet « Raisonnement »** (sous Expert) : une vue technique de type documentation, listant les relations structure → qualité du référentiel clinique (ex. « Quadriceps → Force / Explosivité / Puissance / Absorption »), avec pour chaque relation trois champs explicitement qualifiés dans l'interface elle-même de *« valeurs proposées par KINEXUS à partir du référentiel — il s'agit d'estimations, pas de mesures brutes »* (Contribution, Confiance, Spécificité). C'est la vue la plus « ingénieur » de toute l'application (voir Partie 16) : elle assume et documente sa propre nature de référentiel plutôt que de résultat mesuré, ce qui est honnête, mais son vocabulaire (Contribution/Confiance/Spécificité, blocs dépliables « + ») est clairement écrit pour un lecteur qui sait déjà ce qu'est un référentiel de relations, pas pour un sportif ni un médecin généraliste.
2. Un **onglet de premier niveau « Fil de Raisonnement »** : un écran complet séparé, avec sa propre mise en page (bandeau, choix de test « CMJ bilatéral », indicateur « Confiance globale »), qui déroule une chaîne de priorités cliniques phase par phase (ex. « Braking — la principale limitation biomécanique concerne la phase de Braking », avec le détail « pourquoi cette conclusion plutôt qu'une autre » sous forme d'arbre de conditions vérifiées/non vérifiées). C'est un contenu riche et bien structuré, mais son nom partage la quasi-totalité de son libellé avec le sous-onglet précédent.

Deux personnes différentes cherchant « le raisonnement de Kinexus » peuvent atterrir sur deux vues au contenu et au registre totalement différents (référentiel documentaire vs. chaîne de décision phase par phase sur un mouvement précis) sans qu'aucun indice dans les deux libellés ne permette de savoir laquelle contient quoi avant de cliquer.

---

## 12. Orientations

Confirmé positivement : le sous-onglet Orientations affiche, pour chaque qualité en priorité (ici Mobilité et Absorption), une recommandation d'action concrète (« Améliorer la mobilité fonctionnelle de cheville en chaîne fermée »), et pour Absorption spécifiquement, **les 4 sous-domaines** (Freinage/décélération, Capacité excentrique, Stratégie, Absorption réactive) sous forme de puces — un point rouge sur le sous-domaine confirmé (Freinage/décélération), trois puces grisées « Non déterminable » pour les sous-domaines sans données. C'est lisible, honnête, et répond directement à la question de la Partie 11 de la mission : oui, un praticien peut comprendre que le déficit d'Absorption est spécifiquement documenté sur le freinage, pas sur les trois autres mécanismes, sans confondre « non déterminable » avec « normal ». Cette même présentation apparaît à l'identique dans le PDF expert (voir Partie 14), ce qui est un bon point de cohérence.

---

## 13. PDF sportif — lecture réelle

Le PDF a été généré par la fonction réelle de production (`buildFullReportHtml('sportif', ...)`), pas recréé. Trois pages :

- **Page 1** : bandeau « Bilan fonctionnel — Synthèse clinique », un score « Profil à développer » avec étoiles, un résumé clinique en une phrase (« Le bilan met en évidence des déficits concordants de Mobilité et d'Absorption... »), une carte « Prochaine évaluation » (retour au sport, avis clinique), une silhouette anatomique avant/arrière avec la légende « Optimal / À surveiller / Déficitaire / Critique », une liste « Déficits à investiguer » (deux cartes symétriques : Mobilité-Cheville, Absorption), une carte « Synthèse clinique » condensée.
- **Page 2** : grille des 9 qualités fonctionnelles avec statut ; « Les tests réalisés » groupés par fonction (Force, Puissance, Fonction) ; « Asymétries majeures » avec barres LSI ; « Pourquoi cette conclusion » (chaîne causale illustrée) ; « Plan de prise en charge » en 3 cartes (Mobilité, Absorption, Contrôle Frontal) chacune avec objectif/actions/critères de réussite ; informations pratiques.
- **Page 3** : « Mouvement — Countermovement Jump, analyse par phase », séquence illustrée (Descente → Freinage → Propulsion → Vol → Réception), priorité de préoccupation sur la phase de Braking, asymétries confirmées, stratégie dominante, synthèse en une phrase.

**Lu comme un sportif ou un préparateur physique** : le document se comprend sans notice. Le langage est concret (« Améliorer le contrôle excentrique et la dissipation des contraintes mécaniques » plutôt que « déficit HYP-ABS-01 »), la hiérarchie visuelle guide l'œil (couleurs, icônes, cartes), et la mention explicite « Retour au sport non recommandé » avec sa justification est le genre de phrase qu'un sportif retient immédiatement. C'est un très bon document, cohérent avec le constat déjà établi (Lot Productisation Clinique, cité dans les échanges précédents de ce cycle) que le PDF sportif est l'endroit où Kinexus explique le mieux ce qu'il fait.

---

## 14. PDF expert — lecture réelle, et un défaut de mise en page réel

Généré de la même façon, également réel. Contenu : un tableau « Fonctions évaluées » (Fonction / Statut / Couverture / Confiance) ; une section « Synthèse clinique » textuelle identique en substance à l'écran Synthèse clinique (avec le même défaut « de Absorption ») ; un tableau « Résultats bruts par test » (Test / KPI / Droite / Gauche / LSI % / Statut) ; une section « Systèmes contributeurs » ; « Hypothèses cliniques » (identiques à l'onglet Hypothèses) ; « Orientations » (identiques à l'onglet Orientations, avec les 4 puces de sous-domaines d'Absorption bien présentes).

**Défaut concret constaté à l'écran** : chaque section du PDF expert est encapsulée dans un conteneur avec `min-height:100vh` et `page-break-after:always` — ce qui est correct en intention (forcer un saut de page net entre sections) mais produit, dès que le contenu d'une section est court (ce qui est le cas typique d'un bilan avec peu de tests, situation très fréquente en pratique réelle, notamment en tout début de suivi), une page quasiment blanche avec quelques lignes de texte en haut et un vide immense en dessous. Sur le scénario testé (4 tests actifs), au moins deux des « pages » du PDF expert sont ainsi remplies à moins de 15 % par du contenu réel. Ce n'est pas un artefact de la capture d'écran : c'est un effet direct des règles CSS `.print-page{min-height:100vh}` définies deux fois dans le code (dans le style global et dans `buildFullReportHtml`), qui se traduira de la même façon à l'impression ou à l'export PDF réel. Pour un médecin ou un chirurgien qui reçoit ce document en pièce jointe, un rapport de 5 pages dont 2 sont presque vides est un signal de qualité négatif — le genre de détail qui, sans toucher au contenu clinique, fait paraître le document « pas fini ».

---

## 15. Cohérence UI / PDF sportif / PDF expert

Bon point structurel : Hypothèses (UI) ↔ « Hypothèses cliniques » (PDF expert) et Orientations (UI) ↔ « Orientations » (PDF expert) utilisent very exactement le même texte généré et la même structure de puces — pas de divergence de contenu entre l'écran et le document exporté, ce qui est rassurant pour la confiance du praticien (« ce que je vois à l'écran est ce que je remets au patient/collègue »). Le PDF sportif, en revanche, reformule et hiérarchise différemment (registre plus narratif, moins tabulaire) que l'écran Expert — c'est cohérent avec son public différent, pas une incohérence.

---

## 16. Design

Sans proposer de refonte (hors périmètre), quelques observations facturelles : la palette de couleurs de statut (vert/jaune/orange/rouge) est utilisée de façon cohérente sur toutes les surfaces (écran, PDF sportif, PDF expert) — un vrai point fort, rare dans ce type de logiciel clinique. La densité d'information de l'écran Expert (bloc 01-06 fixe + 10 sous-onglets) est élevée mais chaque carte individuelle reste lisible en elle-même. Le PDF sportif a manifestement reçu plus d'attention de mise en page que le PDF expert (grilles équilibrées, hiérarchie typographique plus travaillée contre des tableaux plus bruts côté expert) — cohérent avec des publics différents, mais l'écart de finition entre les deux documents est net.

---

## 17. Dernières fuites techniques (« construit par des ingénieurs »)

Liste consolidée, vérifiée sur cette session :

1. **« Confiance elevee »** sans accent (onglet Fonctions, cartes de qualité) — toujours présent.
2. **« Les déficits de Mobilité et de Absorption »** — élision manquante devant voyelle, présent à l'identique dans Synthèse clinique (écran), Hypothèses (écran), et PDF expert.
3. Le sous-onglet **Raisonnement** (relations structure→qualité) est le point le plus technique de l'application : vocabulaire de référentiel (Contribution/Confiance/Spécificité), mention explicite « estimations, pas mesures brutes », blocs dépliables. Assumé et documenté, mais clairement écrit pour un lecteur déjà formé au modèle interne de Kinexus.
4. Le sous-onglet **Couverture** affiche uniquement les pourcentages de couverture déjà visibles sur chaque carte du sous-onglet Fonctions (« Couverture 100% » y figure déjà) — une vue entière dédiée à une métrique de QA / complétude de données, qui parle davantage à quelqu'un qui construit le système qu'à quelqu'un qui l'utilise en consultation.
5. La collision de libellé **Raisonnement / Fil de Raisonnement** (Partie 11) — pas une fuite de vocabulaire technique au sens strict, mais un symptôme du même phénomène : une architecture interne (deux mécanismes de raisonnement distincts, l'un référentiel, l'autre biomécanique par phase) qui s'est traduite dans l'interface par deux noms presque identiques au lieu d'être unifiée derrière un vocabulaire pensé pour l'utilisateur.

Aucune de ces cinq observations ne remet en cause la justesse clinique du contenu ; toutes sont des corrections de formulation ou de nommage, à faible risque, localisées.

---

## 18. Test des 10 premières secondes

- **Tableau de bord / liste d'athlètes** : compréhensible immédiatement (carte par athlète, bouton « Nouveau bilan » visible).
- **Écran de saisie (liste de 49 tests)** : compréhensible dans l'intention (« coche les tests que tu veux faire ») mais dense — 10 secondes suffisent à comprendre le mécanisme, pas à savoir quoi cocher.
- **Écran Expert (bloc 01-06)** : le score global et le statut couleur sautent aux yeux en moins de 10 secondes ; comprendre qu'il existe encore 10 sous-onglets en dessous demande de faire défiler la page, donc pas acquis en 10 secondes pour un premier visiteur.
- **Synthèse clinique** : compréhensible en 10 secondes — c'est sa force distinctive, confirmée de nouveau ici.
- **PDF sportif page 1** : compréhensible en 10 secondes (score, silhouette, verdict retour au sport).

---

## 19. Test des 30 secondes (valeur perçue)

Sur chacune des surfaces testées, 30 secondes suffisent à un praticien pour répondre à « ce bilan m'apprend-il quelque chose d'exploitable ? » — à l'exception du sous-onglet Raisonnement (référentiel) et du sous-onglet Couverture, où 30 secondes suffisent à comprendre le contenu mais pas nécessairement à en percevoir l'utilité clinique immédiate par rapport aux 8 autres vues déjà consultées.

---

## 20. Test « demain en consultation » (45–60 min réalistes)

Scénario réaliste : un kiné reçoit un sportif, fait passer WBLT + CMJ + Landing Unilatéral + Isometric Belt Squat (4 tests, situation courante en début de suivi plutôt qu'une batterie de 15 tests), valide le bilan, et doit en tirer une conclusion actionnable avant la fin de la séance. Le chemin **Saisie → Valider → Synthèse clinique → Orientations → PDF sportif** couvre ce besoin en quelques clics et donne une réponse claire et défendable (« Mobilité cheville et Absorption freinage à travailler, retour au sport non recommandé en l'état »). Le kiné n'a, dans ce scénario réaliste à données partielles, aucune raison fonctionnelle de visiter Résultats, Systèmes, Couverture ou le sous-onglet Raisonnement — ce qui confirme que ces vues sont bien secondaires/optionnelles dans l'usage courant, mais aussi qu'elles restent visibles et sollicitent l'attention sans qu'on en ait besoin.

---

## 21. Test « expliquer Kinexus en 30 secondes »

Formulation qui tient dans le temps imparti sur la base de ce qui a été vérifié : *« Vous rentrez les résultats de vos tests, Kinexus vous dit quelles qualités physiques sont clairement déficitaires, lesquelles sont juste suspectes, et lesquelles on ne peut pas encore savoir faute de données — jamais l'inverse. Vous obtenez une explication en langage clair, un plan d'action, et un PDF à donner au sportif ou à un confrère. »* Cette phrase couvre fidèlement le cœur du produit (Synthèse clinique + Orientations + PDF sportif) mais laisse volontairement de côté les 10 sous-onglets Expert — signe que le cœur de valeur tient en une phrase, alors que l'écran qui l'entoure ne le laisse pas deviner aussi facilement.

---

## 22. Problèmes observés — liste consolidée

| # | Problème | Sévérité | Surface |
|---|---|---|---|
| 1 | 10 sous-onglets Expert + 4 onglets de premier niveau (13 destinations) sans hiérarchie de découverte pour un nouvel utilisateur | 🟠 Important | Écran Analyse |
| 2 | Libellés « Raisonnement » (sous-onglet) et « Fil de Raisonnement » (onglet) quasi identiques pour deux contenus très différents | 🟠 Important | Navigation |
| 3 | PDF expert : pages presque vides quand les données sont peu nombreuses (`min-height:100vh` par section) | 🟠 Important | PDF expert |
| 4 | Sous-onglet Couverture redondant avec les pourcentages déjà affichés dans Fonctions | 🟡 Modéré | Écran Analyse |
| 5 | « Confiance elevee » sans accent | 🟡 Modéré | Fonctions (écran) |
| 6 | « de Absorption » au lieu de « d'Absorption » (3 surfaces) | 🟡 Modéré | Synthèse clinique, Hypothèses, PDF expert |
| 7 | Fonctions : aucune distinction visuelle entre qualité HYP-gouvernée et qualité TFM seule | 🟡 Modéré | Fonctions (déjà connu, hors scope Lot 1) |
| 8 | Liste de 49 tests sans aide au choix par objectif clinique | 🟢 Mineur | Sélection de tests |
| 9 | Sous-onglet Raisonnement au vocabulaire très technique (Contribution/Confiance/Spécificité, estimations) | 🟢 Mineur, assumé et documenté dans l'UI elle-même | Raisonnement |

Aucun problème 🔴 critique n'a été trouvé lors de cette repasse — les problèmes critiques identifiés par l'audit UX Saisie précédent (perte de données, ambiguïté sélectionné/rempli) sont résolus et vérifiés tenir.

---

## 23. Priorisation (sans gonflage)

**🟠 À traiter avant généralisation du produit** :
- Corriger le défaut de mise en page du PDF expert (retirer ou conditionner `min-height:100vh` quand le contenu d'une section est court) — correctif localisé, faible risque, impact visible immédiat sur un document remis à des tiers.
- Renommer l'un des deux « Raisonnement » pour lever l'ambiguïté (proposition à valider avec le praticien, pas à trancher unilatéralement ici).
- Regrouper visuellement les 10 sous-onglets Expert en 2-3 groupes logiques (ex. « Vue clinique » : Fonctions/Synthèse/Orientations/Hypothèses vs. « Détail technique » : Résultats/Variables/Capacités/Systèmes/Couverture/Raisonnement) plutôt que de les laisser à plat dans une seule rangée — sans supprimer aucune vue.

**🟡 Correctifs de formulation, faible risque, à grouper dans un même lot** :
- Accent de « Confiance élevée ».
- Élision « d'Absorption ».

**🟢 Amélioration future, non bloquante** :
- Guidage de sélection de tests par objectif clinique.
- Marquage visuel HYP vs TFM dans Fonctions (déjà identifié, toujours en attente d'un lot dédié).

Aucun de ces points ne remet en cause le moteur, les données ou l'architecture clinique. Ce sont, sans exception, des corrections de présentation et de navigation.

---

## 24. Éléments à geler (à ne plus retoucher sans besoin produit explicite)

Sur la base de cet audit et de l'ensemble du cycle de travail précédent (Rationalisation Vues 1, UX Saisie, Lot A) :

- Les **moteurs HYP** (HYP-MOB-01, HYP-ABS-01, etc.) et leurs règles de convergence.
- **CSM** (`computeHypClinicalSynthesis01`) et ses helpers couplés.
- **HYP_QUALITY_RELATIONS** et les relations de concordance sans causalité affichées en Synthèse clinique.
- L'écran **Synthèse clinique** dans sa structure actuelle (objectivé / suspecté / non déterminable / concordances / limites).
- La section **Déficits à investiguer** (dashboard + PDF sportif).
- La **structure à 4+10 vues** de l'écran Expert *dans son contenu* (chaque vue apporte une information réellement distincte, confirmé de nouveau dans cet audit) — seule sa **présentation/regroupement** doit évoluer, pas sa liste de vues.
- La mécanique de saisie sécurisée du **Lot A** (confirmation de sortie, distinction sélectionné/rempli, navigation test-à-test, blocage de validation).
- Le **Body map** et le **système de couleurs de statut** (vert/jaune/orange/rouge), cohérents sur toutes les surfaces.
- Le contenu et la structure du **PDF sportif**.

---

## 25. Lots éventuels (maximum 3)

**Lot 1 — Fiabiliser l'export PDF expert.** Corriger le défaut de pages quasi vides (`min-height:100vh` conditionné à la présence de contenu réel dans la section). Périmètre strictement CSS/présentation du document déjà généré, aucune donnée touchée.

**Lot 2 — Clarifier la navigation de l'écran Expert.** Renommer l'un des deux « Raisonnement » pour lever l'ambiguïté (à valider avec le praticien) ; regrouper visuellement les 10 sous-onglets en 2-3 catégories logiques sans en supprimer aucun. Périmètre présentation/navigation uniquement, zéro donnée touchée.

**Lot 3 — Nettoyage de formulation.** Corriger « Confiance elevee » → « Confiance élevée » et l'élision manquante « d'Absorption » (et vérifier s'il existe des cas symétriques avec d'autres qualités commençant par une voyelle, ex. « Endurance »). Périmètre chaînes de caractères uniquement.

Aucun quatrième lot n'est justifié à ce stade : au-delà de ces trois points, toute autre évolution proposée le serait par intérêt technique et non par besoin clinique identifié, ce qui contredirait le principe directeur du projet.

---

## 26. Préparation à la validation terrain, par public

- **Kiné (utilisateur principal, écran Expert)** : prêt pour une validation terrain encadrée, à condition que le Lot 2 (navigation) soit livré en amont ou en parallèle — sans lui, le risque n'est pas une erreur clinique mais une perte de temps/confiance face à la densité de navigation en première utilisation.
- **Médecin / chirurgien destinataire du PDF expert** : prêt sur le fond, pas sur la forme tant que le Lot 1 (pagination) n'est pas livré — un document professionnel à moitié vide desservirait la crédibilité du bilan avant même sa lecture.
- **Préparateur physique** : prêt, le PDF sportif et la Synthèse clinique répondent directement à son usage (plan d'action, retour au sport).
- **Sportif (lecteur du PDF sportif uniquement)** : prêt sans réserve — c'est la surface la plus aboutie de l'ensemble de l'application.

---

## 27. Verdict final

**B — Prêt pour une validation terrain encadrée, sous réserve de corrections UX ciblées, pas d'une refonte.**

Justification : le cœur clinique de Kinexus (moteurs HYP, Synthèse clinique, distinction objectivé/suspecté/non-déterminable, cohérence UI↔PDF sur Hypothèses/Orientations, PDF sportif) est solide, honnête dans sa formulation, et a été vérifié de nouveau dans cet audit sans régression après trois lots correctifs successifs. Ce n'est pas un logiciel qui a besoin d'être repensé.

Ce qui empêche un verdict A sans réserve est concret et borné : la navigation de l'écran Expert a grandi (10 sous-onglets, découverte faite dans cet audit) plus vite que sa lisibilité pour un nouvel utilisateur, deux libellés se chevauchent au point de tromper une recherche textuelle automatisée, et le PDF destiné aux médecins souffre d'un défaut de mise en page qui nuit à sa crédibilité dès la première page tournée. Ces trois points sont résolubles par les trois lots proposés ci-dessus, sans toucher à un seul moteur, une seule donnée ou une seule règle clinique — ce qui exclut explicitement le verdict C. Conformément à la consigne de cet audit, ce verdict B n'est pas retenu par principe de perfectionnisme : c'est parce que le PDF envoyé à un médecin serait aujourd'hui, factuellement, à moitié vide, et parce que treize destinations de navigation sans regroupement sont une friction mesurée, pas supposée.

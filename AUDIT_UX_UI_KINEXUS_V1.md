# Audit UX/UI et optimisation visuelle de Kinexus V1

Audit **exclusivement en lecture** — aucun fichier de production n'a été modifié. Méthode :
inspection du code source de tous les composants visuels (UI + PDF), navigation réelle dans
l'application (serveur local, Playwright, capture d'écran du dashboard en état vide — état par
défaut, aucune donnée saisie), génération réelle de 2 PDF (sportif + expert) sur un scénario à 3
qualités objectivées avec relation HYP documentée (Mobilité/Cheville, Absorption, Stabilisation —
toutes rouge, Mobilité→Stabilisation reliées), capture et inspection visuelle de chaque page.
Recoupé avec le travail visuel déjà audité/vérifié lors des missions précédentes de cette session
(dashboard, onglets Synthèse clinique/Orientations, PDF sportif/expert — captures déjà passées en
revue au fil des missions HYP/CSM).

**Incident méthodologique corrigé en cours d'audit** : au démarrage de cette mission, la copie
locale du dépôt s'est révélée en retard de 17 commits sur `origin/claude/rapport-visuel-tp5afc`
(reliquat d'un redémarrage de conteneur antérieur). Une première génération de PDF sur le code
périmé a fait apparaître un faux problème (« Priorité principale : Contrôle Frontal » malgré deux
qualités rouge plus sévères) qui n'existe plus dans le code réel — corrigé par `git fetch` +
fast-forward avant de tirer la moindre conclusion. Tous les constats ci-dessous sont vérifiés sur le
code réellement à jour (`83464b4`, `git status` propre, 31/31 tests verts).

---

## 1. État actuel

Kinexus V1 dispose déjà d'un système visuel cohérent et largement premium :

- **Identité** : palette pétrole/blanc cassé/accents teal-vert, typographie sans-serif dense mais
  lisible, cartes (`Card`) à coins arrondis et ombre légère, badges de statut colorés (`Badge`,
  `bgMap`/`txtMap`) réutilisés à l'identique dans toute l'UI et les 2 PDF.
- **Structure** : dashboard en 3 colonnes (Qualités fonctionnelles / Body Map / Synthèse clinique),
  onglets ExpertView (Fonctions, Synthèse clinique, Résultats, Variables, Capacités, Systèmes,
  Hypothèses, Orientations, Couverture, Raisonnement), 2 PDF (sportif en 3 pages orientées
  narration, expert plus dense orienté données).
- **Body map** : diagramme musculaire photoréaliste (face/dos), légende à 4 couleurs, points
  cliquables sur les structures déficitaires — élément visuel fort et déjà abouti.
- **Synthèse clinique** (UI + PDF) : depuis les missions précédentes de cette session, correctement
  structurée en blocs distincts (déficits objectivés / suspectées / non déterminables / relations
  explicatives / concordances / limites), vocabulaire clinique cohérent (`CSM_STATE_LABEL`), badge
  « Non déterminable » systématiquement gris neutre — jamais coloré comme un statut réel.
- **Widget « Déficits à investiguer »** (ex-« Priorités d'intervention ») : corrigé par la mission
  précédente — pastille de sévérité sans numéro, aucun classement artificiel entre qualités à égalité
  de sévérité, séparation stricte HYP/TFM.

Ce socle est solide. Cette mission ne le remet pas en cause — elle cherche les points précis où la
présentation ne traduit pas encore fidèlement ce que HYP/CSM ont déjà déterminé.

---

## 2. Éléments visuels déjà réussis (à conserver absolument — catégorie A)

1. **Body map musculaire** — photoréaliste, légende claire, jamais retravaillée sans raison. **A.**
2. **Système de couleurs de statut** (vert/jaune/orange/rouge + gris neutre pour non déterminable) —
   cohérent sur 100 % des surfaces vérifiées (UI, PDF sportif, PDF expert). **A.**
3. **Carte « Déficits objectivés »** (dashboard section 01) — présente correctement un GROUPE de
   qualités à égalité de sévérité (« CHEVILLE · ABSORPTION · STABILISATION »), avec la mention
   explicite « Plusieurs qualités présentent le même niveau de sévérité — voir la Synthèse clinique
   pour le détail de chacune. » **A — exactement le comportement demandé par la Partie 4 de cette
   mission.**
4. **Widget « Déficits à investiguer »** — pastille de sévérité, pas de numéro, séparation HYP/TFM
   explicite (« Information TFM secondaire (hors HYP) »). **A.**
5. **Synthèse clinique** (UI et PDF) — séparation claire Relations explicatives possibles
   (accent teal) vs Concordances (gris) vs Limites (footer discret). **A.**
6. **Structure générale du PDF sportif** (couverture → leviers de performance → pourquoi/où →
   déficits → synthèse → page 2 détails → page 3 mouvement) — logique, progressive, pas de rupture
   de niveau brutale. **A.**
7. **Body map + qualités fonctionnelles côte à côte** (dashboard section 02/03) — permet un premier
   coup d'œil correct. **A.**

---

## 3. Points faibles

Voir Parties 5-15 pour le détail ; résumé court : (a) une incohérence de hiérarchie réelle et
actuellement visible dans le PDF sportif (Partie 4/9 ci-dessous — trouvaille centrale de cet audit),
(b) un composant `RadarChart` mort (jamais rendu nulle part), (c) une sous-exploitation visuelle des
sous-domaines déjà calculés pour Absorption (déjà documentée par l'audit clinique précédent, jamais
retravaillée visuellement), (d) une navigation Synthèse→Qualité→Variable qui s'arrête au niveau
qualité (pas de lien direct vers les variables sous-jacentes).

---

## 4. Problèmes UX

### 4.1 CRITIQUE UX — Contradiction de hiérarchie au sein du MÊME document PDF

Vérifié en générant réellement le PDF sportif sur un scénario à 3 qualités objectivées de même
sévérité (Mobilité·Cheville, Absorption, Stabilisation, toutes rouge) :

- **Section 3 « Déficits à investiguer »** (page 1) : les traite correctement à égalité, aucun
  classement — comportement exemplaire, exactement ce que demande la Partie 4 de cette mission.
- **Section 5 « Plan de prise en charge »** (page 2, cartes RENFORCER/DÉVELOPPER/INTÉGRER,
  `buildSportifReport`, ligne ~7013) : **affiche un badge « Priorité 1 » / « Priorité 2 » /
  « Priorité 3 »** sur ces trois mêmes qualités déjà présentées à égalité deux sections plus haut,
  dans le **même document, à quelques centimètres d'écart**.

C'est précisément l'exemple donné par la Partie 4 de cette mission (« 3 déficits HYP de même statut
≠ 1er/2e/3e ») — et il est aujourd'hui réellement visible dans le rendu produit. Cette section n'a
pas été touchée par la mission de correction précédente (`IMPLEMENTATION_FINAL_PRIORITES_CSM.md`),
qui n'a corrigé que « Priorités d'intervention »/« Orientations » — « Plan de prise en charge » est
un troisième bloc de rendu, distinct, itérant sur la même donnée (`pri`/`priorities`), resté
inchangé.

**Recommandation (présentation uniquement)** : remplacer le badge « Priorité N » par la même
pastille de sévérité sans numéro déjà utilisée en section 3, ou par un badge neutre reprenant le
verbe d'action (RENFORCER/DÉVELOPPER/INTÉGRER est déjà un bon identifiant visuel, le numéro est la
seule pièce à retirer). Aucune donnée nouvelle à calculer — `p.rang` existe déjà, il suffit de ne
plus l'afficher comme un rang.

### 4.2 IMPORTANT — Vocabulaire « Priorité » à 3 sens différents dans le même document

Le mot « Priorité » est employé pour trois concepts distincts, jamais explicitement différenciés
visuellement au-delà du contexte : (1) rang de sévérité entre qualités (section 5, ci-dessus,
problématique) ; (2) « Priorité clinique » d'une **phase de mouvement CMJ** (page 3, moteur
biomécanique séparé — légitimement un autre système de hiérarchisation, portant sur une seule
qualité de mouvement, pas entre 8 qualités) ; (3) implicitement, la carte « Déficits objectivés » qui
n'utilise plus ce mot du tout (bon signe). Un praticien lisant le document de bout en bout rencontre
« Priorité » deux fois avec des règles différentes sans repère visuel pour les distinguer.

### 4.3 IMPORTANT — Absorption : sous-domaines calculés, jamais représentés visuellement

Déjà établi par l'audit clinique précédent (`AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md`) :
`hypAbs01.sousDomaines` (freinage, capacité excentrique, stratégie, absorption réactive) est calculé
à 100 % et n'apparaît dans aucun composant visuel — ni carte de qualité, ni PDF. C'est un problème de
VALEUR CLINIQUE transmise (déjà documenté) mais c'est aussi, du point de vue strictement visuel de
cette mission, une opportunité concrète de design : la donnée existe, il ne manque qu'une
représentation (voir Partie 15, proposition pilote).

### 4.4 UTILE — Radar mort

`RadarChart` (défini `index.html:6167`) n'a **aucun consommateur** dans tout le fichier (vérifié par
recherche exhaustive). Le radar n'est donc affiché nulle part aujourd'hui — ni UI ni PDF — remplacé
depuis une mission antérieure (tâche historique « Replace radar chart with gauge-card grid ») par la
liste à barres « Qualités fonctionnelles », qui remplit correctement ce rôle. Code mort à documenter,
pas un problème pour le praticien puisqu'il ne le voit jamais.

---

## 5. Problèmes PDF

- Constat 4.1/4.2 ci-dessus (contradiction de hiérarchie, vocabulaire).
- Longueur/densité : le PDF sportif reste raisonnable (3 pages) même avec 3 qualités objectivées et
  une relation ; pas de répétition excessive observée au-delà de la reprise normale (attendue et
  correcte) du texte de relation sur les 2 cartes qui la partagent (Mobilité et Stabilisation).
- Page 2 « Qualités fonctionnelles » : bon exemple de densité maîtrisée — badges courts, une ligne
  par qualité, jamais de sur-affichage.
- « Fonction » (WBLT unique) affichée sous « Cheville · Objectif » en section 3 (carte Mobilité) —
  léger doublon terminologique (« Cheville » comme structure, « Mobilité » comme qualité, « WBLT »
  comme test) qui reste compréhensible mais demande un moment de recoupement mental — mineur.

---

## 6. Problèmes UI

- Aucune contradiction de hiérarchie détectée côté UI équivalente à celle du PDF (le widget «
  Déficits à investiguer » et l'onglet Orientations sont correctement alignés — vérifié dans les
  missions précédentes).
- Aucune donnée de test manipulable de façon fiable n'a permis, dans le temps imparti à cet audit,
  de capturer une nouvelle vue live à déficits multiples via automatisation navigateur (l'entrée de
  données CMJ par script s'est révélée peu fiable dans cet environnement) — compensé par (a) la
  génération PDF réelle (donnée strictement identique à ce que l'UI calcule, puisque les deux
  consomment `computeMoteur()`/`clinicalSynthesis` sans reformuler), et (b) les captures déjà
  vérifiées lors des missions précédentes de cette session pour un scénario à déficits mixtes
  HYP+TFM (Stabilisation rouge + Contrôle Frontal orange), qui confirment un rendu cohérent.

---

## 7. Problèmes de densité

Aucun endroit n'affiche aujourd'hui une masse d'information brute sans hiérarchie — le système en 3
niveaux (constat clinique → explication → données techniques) est globalement respecté :
- Dashboard : niveau 1 (cartes de synthèse) séparé visuellement du niveau 3 (onglets techniques en
  bas de page).
- PDF : sections numérotées 1-5 suivent l'ordre clinique → détail → données techniques → mouvement.
Seul point de friction : la section « Les tests réalisés » (PDF page 2) mélange test par test sans
distinction visuelle immédiate entre « a contribué au diagnostic » et « saisi mais non déterminant »
— cohérent avec la trouvaille de l'audit clinique précédent (les tests confirmatifs/explicatifs
jamais classifiables apparaissent au même niveau visuel que les tests diagnostiques).

---

## 8. Problèmes de navigation

Parcours Dashboard → Synthèse → Fonction → Qualité → Variable → Test audité :
- **Dashboard → Synthèse clinique** : direct (onglet dédié), pas de rupture.
- **Synthèse clinique → Fonctions (badge par qualité)** : les deux onglets existent côte à côte,
  mais rien dans l'onglet Synthèse clinique ne pointe explicitement vers l'onglet Fonctions pour la
  qualité concernée (pas de lien cliquable « voir le détail de Absorption »).
- **Fonctions → Variables** : l'onglet Fonctions montre les tests liés par poids TFM (« Direct/
  Majeur/Mineur ») ; l'onglet Variables est une liste plate des 283 variables, sans filtre par
  qualité ni recherche — retrouver LES variables d'une qualité précise demande de parcourir toute la
  liste. C'est le point de friction de navigation le plus concret trouvé.
- **Retour** : chaque écran dispose d'un fil d'Ariane et d'un bouton retour clair — pas de problème
  identifié ici.

**Recommandation (présentation uniquement)** : ajouter un filtre ou une ancre par qualité dans
l'onglet Variables (regroupement visuel, pas de nouveau calcul — les données de rattachement
qualité↔variable existent déjà dans `VAR_REL3`).

---

## 9. Problèmes de hiérarchie

Repris de la Partie 4 : le point 4.1 (« Plan de prise en charge ») est le seul cas concret trouvé
où la hiérarchie visuelle affirme quelque chose que CSM ne détermine pas. Partout ailleurs (Synthèse
clinique, Déficits objectivés, Déficits à investiguer, Orientations), la hiérarchie visuelle reflète
fidèlement ce qui est réellement établi : niveau 1 (objectivé, en couleur pleine) vs niveau 2
(suspecté/non déterminable, gris/jaune neutre) vs niveau 3 (comment les qualités se combinent,
Synthèse clinique) vs niveau 4 (preuves, onglet Résultats) — cette chaîne existe déjà et fonctionne.

---

## 10. Analyse du radar

Cf. Partie 4.4 — le radar n'est plus utilisé dans l'application (composant mort). Il n'y a donc rien
à optimiser dans son rendu actuel puisqu'il n'est jamais rendu. La liste « Qualités fonctionnelles »
(barres horizontales + badge) le remplace déjà et répond correctement à la question posée par la
Partie 9 (« le radar apporte-t-il une information supplémentaire, ou est-il décoratif ? ») — la
réponse est qu'aujourd'hui rien ne remplace un éventuel radar puisqu'aucune vue actuelle n'affiche
simultanément les 8 qualités sur des axes comparables ; la liste à barres remplit ce rôle de façon
plus lisible qu'un radar ne l'aurait fait (un radar à 8-9 axes avec des statuts discrets
vert/jaune/orange/rouge/gris est généralement plus difficile à lire qu'une liste, particulièrement
en noir et blanc à l'impression). **Recommandation : ne rien changer — la liste actuelle est un
meilleur choix que ne le serait la réintroduction d'un radar.**

---

## 11. Analyse de la body map

Déjà un composant abouti (Partie 2). Fonctionne comme représentation de la localisation Force
(structures musculaires) — pertinente pour Force/Niveau 2 segmentaire, moins pour les 7 autres
qualités qui ne sont pas localisées par structure musculaire (Absorption, Réactivité, etc. sont des
propriétés fonctionnelles, pas des groupes musculaires). Le composant l'assume déjà correctement
(seuls les points liés à un système musculaire réellement contributeur s'allument) — aucune confusion
trouvée entre « structure colorée » et « qualité déficitaire non localisable ». **Aucune
amélioration nécessaire identifiée.**

---

## 12. Analyse de la Synthèse clinique

Déjà largement optimisée par la mission précédente (`IMPLEMENTATION_SYNTHESE_CLINIQUE_UI_PDF.md`).
Vérifié à nouveau ici sur un scénario à 3 qualités + 1 relation + 5 non-déterminables : blocs
immédiatement identifiables, visuellement distincts (pills colorées / accent teal / gris / footer
discret), peu chargés, cohérents entre UI et PDF. **Aucun problème trouvé — catégorie A, conserver
tel quel.**

---

## 13. Analyse des fiches qualité

Il n'existe pas aujourd'hui de « fiche qualité » dédiée au sens où la Partie 7 de la mission
l'envisage (nom + statut + sous-domaines + éléments importants + détails, sur un seul écran/carte).
Ce que l'utilisateur voit aujourd'hui pour une qualité est dispersé : le badge dans « Qualités
fonctionnelles », la carte dans « Déficits à investiguer » (Objectif/Pourquoi/Actions/Tests de
suivi/Critère de sortie — déjà riche), la ligne dans l'onglet Fonctions (tests liés par poids TFM), et
le paragraphe dans Synthèse clinique. Chacun de ces éléments est individuellement bien fait, mais
aucun ne réunit tout sur un seul écran comme le modèle conceptuel de la Partie 7 le décrit. C'est
l'écart le plus net entre la maquette conceptuelle donnée par la mission et l'existant.

---

## 14. Analyse d'Absorption (cas pilote)

**État actuel** : la carte « Déficits à investiguer » pour Absorption affiche aujourd'hui : pastille
rouge, « Absorption », Objectif (« Absorption »), Pourquoi (texte générique ou de concordance),
Actions (« Améliorer le contrôle excentrique et la dissipation des contraintes mécaniques » —
identique quel que soit le sous-domaine réellement en cause), Tests de suivi (liste des tests CMJ
liés), Critère de sortie. Le sous-domaine réel (freinage vs capacité excentrique vs stratégie vs
réactive) n'apparaît nulle part, alors que `hypAbs01.sousDomaines` le contient déjà entièrement.

**Composants réutilisables identifiés pour représenter cette richesse sans surcharge** (aucun
nouveau composant à créer — cf. Partie 1 de la mission) :
- Le motif « pastille de couleur + libellé court » déjà utilisé pour les qualités elles-mêmes
  (`Déficits à investiguer`) peut être répété à l'échelle du sous-domaine, en plus petit, sous le nom
  de la qualité — même grammaire visuelle, échelle différente.
- Le style « chip neutre » déjà utilisé pour les tests de suivi (fond `#F3F6F8`, texte discret)
  convient pour les sous-domaines non contributeurs (« Stratégie — » comme dans l'exemple conceptuel
  de la mission).

**Proposition (conceptuelle, non codée)** — mockup textuel utilisant exclusivement les composants
déjà existants :

```
● ABSORPTION                                    [ Déficitaire ]

  ● Freinage / décélération        (rouge, sous-domaine générateur du diagnostic)
  ○ Capacité excentrique            (gris — non classifiable aujourd'hui, ou orange si dégradée)
  ○ Stratégie                       (gris — non classifiable, cmj_braking_duration sans seuil)
  ○ Absorption réactive             (gris — non classifiable, dj_contact_time sans seuil)

  → Objectif / Actions / Tests de suivi / Critère de sortie (inchangé, déjà bon)
```

Cette rangée de 4 pastilles + libellés vient s'insérer entre le titre de carte existant et le bloc
« Objectif » déjà présent — un seul ajout, aucune carte supplémentaire, aucune restructuration. Elle
répond directement à l'exemple conceptuel donné par la Partie 7/8 de la mission. **Important : cette
proposition est une pure question de présentation — elle ne fait que lire `sousDomaines`, déjà
calculé, jamais recalculé.** Reste néanmoins une **décision à valider avec le praticien avant tout
codage** : faut-il présenter les sous-domaines B/C/D « non classifiables aujourd'hui » (gris, faute
de seuil) de la même façon qu'un sous-domaine réellement absent (gris aussi, mais pour une autre
raison) ? Une distinction fine ("non classifiable" vs "classifiable et normal") serait à trancher
cliniquement avant implémentation — non traitée ici, conformément au périmètre audit-seul.

---

## 15. Proposition de hiérarchie visuelle

Reprend et confirme le modèle déjà en place, avec un seul changement de traitement (retrait du
rang numéroté en section 5) :

```
NIVEAU 1 — CE QUI EST OBJECTIVÉ
  Dashboard « Déficits objectivés » + Synthèse clinique bloc 1 (déjà bon)

NIVEAU 2 — SUSPECTÉ / NON DÉTERMINABLE
  Synthèse clinique blocs 2-3, badges gris/jaune neutres (déjà bon)

NIVEAU 3 — COMMENT LES QUALITÉS SE COMBINENT
  Synthèse clinique blocs 4-5 (relations / concordances) (déjà bon)

NIVEAU 4 — LES PREUVES
  Onglet Résultats / section « Les tests réalisés » PDF (déjà bon, mais gagnerait à distinguer
  visuellement test diagnostique vs test confirmatif/explicatif jamais classifiable — cf. Partie 7)

NIVEAU 5 — DÉTAILS TECHNIQUES
  Onglet Variables / Raisonnement (déjà bon, séparé du reste par sa position en fin de liste
  d'onglets)
```

Aucun de ces niveaux n'a besoin d'être recréé — le travail restant est ponctuel (section 5 PDF,
Absorption, filtre Variables), pas une refonte.

---

## 16. Top 10 améliorations

| # | Amélioration | Classification | Portée |
|---|---|---|---|
| 1 | Retirer le badge « Priorité N » de la section « Plan de prise en charge » (PDF sportif, `buildSportifReport` ~ligne 7013), remplacer par la pastille de sévérité déjà utilisée en section 3 | **CRITIQUE UX** | Présentation pure, `p.rang` déjà disponible |
| 2 | Absorption : afficher les 4 sous-domaines (pastilles + libellés courts) dans la carte « Déficits à investiguer » et la fiche PDF | **IMPORTANT** | Lecture de `sousDomaines`, déjà calculé — décision à valider sur le traitement visuel des sous-domaines non classifiables (cf. Partie 14) |
| 3 | Filtrer/regrouper l'onglet Variables par qualité (au moins une ancre ou un filtre) | **IMPORTANT** | Présentation, donnée de rattachement déjà présente dans `VAR_REL3` |
| 4 | Distinguer visuellement, dans « Les tests réalisés » (PDF) et l'onglet Résultats (UI), un test diagnostique d'un test confirmatif/explicatif jamais classifiable | **IMPORTANT** | Présentation pure — lecture des champs `diagnostic`/`confirmative`/`explanatory` déjà exposés par chaque moteur HYP |
| 5 | Retirer le composant mort `RadarChart` (jamais utilisé) ou documenter clairement pourquoi il est conservé | **UTILE** | Nettoyage de code, zéro impact visuel puisque déjà invisible |
| 6 | Ajouter un lien direct « voir le détail » depuis chaque bloc de la Synthèse clinique vers l'onglet Fonctions de la qualité concernée | **UTILE** | Navigation, composants de lien déjà existants ailleurs dans l'app |
| 7 | Uniformiser le vocabulaire « Priorité » (réserver le mot aux phases de mouvement CMJ ; qualités = « déficits »/« sévérité », jamais « priorité ») | **UTILE** | Wording pur |
| 8 | Regrouper les informations d'une qualité aujourd'hui dispersées (badge, carte, ligne Fonctions, paragraphe Synthèse) en une vue unique optionnelle « fiche qualité » (Partie 13) | **OPTIONNEL** | Nouveau regroupement visuel possible, mais l'existant remplit déjà chaque rôle séparément — à valider si le besoin est réel avant de construire |
| 9 | Réduire le léger doublon terminologique Cheville/Mobilité/WBLT dans la carte « Déficits à investiguer » (préciser une seule fois la structure entre parenthèses) | **OPTIONNEL** | Wording |
| 10 | Documenter dans le PDF, en une phrase discrète, la distinction entre les 3 usages du mot « priorité » rencontrés dans le document | **OPTIONNEL** | Wording, ou rendu inutile si #7 est fait |

---

## 17. Éléments volontairement inchangés

- Body map (déjà abouti, Partie 11).
- Système de couleurs de statut (Partie 2/9 — cohérent partout, aucune justification à le changer).
- Structure générale du PDF (couverture → leviers → pourquoi/où → déficits → synthèse → détails →
  mouvement) — conservée telle quelle.
- Widget « Déficits à investiguer », onglet Orientations, Synthèse clinique (UI + PDF) — déjà
  corrigés par la mission précédente, aucune régression trouvée, rien à refaire.
- Composants `Card`/`Badge`/`panel`/`kpiCard` — réutilisés partout, aucune raison de les remplacer.
- Aucun moteur clinique, seuil, norme, règle de convergence, rôle diagnostique/confirmatif/
  explicatif, relation HYP, `priorities`, `statusPriorityRank()`, `TFM`, `VAR_REL3` n'a été modifié —
  conformément au périmètre de cette mission.

---

## Verdict

Le travail visuel déjà réalisé sur Kinexus est solide et ne nécessite pas de refonte. L'essentiel du
système (couleurs, badges, cartes, body map, Synthèse clinique) traduit déjà fidèlement ce que
HYP/CSM déterminent. Une trouvaille critique et concrète a été identifiée — une contradiction de
hiérarchie visible dans le même document PDF (Partie 4.1/9) — ainsi qu'une opportunité de valeur
forte pour Absorption (sous-domaines déjà calculés, jamais représentés). Les deux sont des
corrections additives de présentation, sans toucher au raisonnement clinique. **Aucune modification
de code n'a été effectuée dans cette mission — la liste ci-dessus attend validation avant tout
développement, conformément à l'instruction explicite de la mission.**

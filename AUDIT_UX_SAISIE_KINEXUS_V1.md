# Audit UX de la saisie Kinexus V1
« Passer d'une saisie de données à un workflow de bilan »

Audit **exclusivement en lecture** — aucun fichier de production, aucun test, aucune donnée,
aucun moteur, aucun PDF, aucun design n'a été modifié. Commit de référence : `40d6b93`. L'objectif
unique de cette mission est de répondre à une question : *« Si je suis un kiné et que je veux
réaliser un bilan sportif complet, est-ce que Kinexus me permet de saisir mes mesures de manière
naturelle, rapide et compréhensible ? Si non, où exactement le workflow casse-t-il ? »*

---

## 1. Méthodologie

- Cartographie exhaustive du code de saisie (composant `TestEntry`, `TestDetailPage`, `TrialIn`,
  `YBTEntry`, `BilanForm`, `AnalyseView`) réalisée par un sous-agent dédié en lecture seule —
  chaque affirmation de ce document vérifiée par ligne de code citée.
- Parcours réel dans le navigateur (serveur local, Chromium piloté par Playwright) : création d'un
  sportif Basketball NCAA, ouverture d'un bilan Performance/Pré-saison, saisie réelle d'essais sur
  WBLT (Mobilité), inspection réelle des écrans CMJ (Puissance/Absorption), Isometric Belt Squat
  (Force), Drop Jump (Réactivité), Landing Unilatéral (Stabilisation/Absorption), Heel Raise et Hop
  Test (Endurance).
- **Deux comportements critiques rejoués et confirmés en conditions réelles** (pas seulement lus
  dans le code) : la perte silencieuse d'un bilan en cours de saisie (Partie 5/11), et la validation
  d'un bilan sans aucune valeur saisie (Partie 11).
- Aucune capture d'écran n'a été mise en scène pour appuyer une conclusion prédéterminée — chaque
  capture citée dans ce document est un résultat brut d'exécution.

---

## 2. Workflow actuel

Chaîne complète, du clic « + Bilan » au retour à la fiche sportif :

```
AthleteProfile (« Démarrer un bilan » / « + Bilan »)
  → BilanForm (type Performance/RTP/Screening/Suivi + sous-type + commentaire) → « Commencer le bilan »
    → TestEntry (liste plate de 49 tests, 8 catégories, jamais quitté-sauvegardé avant « Analyser »)
      → TestDetailPage (une carte par KPI, essais D/G ou simple)  ⇄  « ← Retour » (retour à la liste)
    → « Analyser (n tests) → » : PREMIÈRE ET SEULE sauvegarde réelle du bilan
      → AnalyseView (calcul HYP/CSM, dashboard clinique) → « Valider le bilan » (aucune condition)
```

**Constat central, vérifié par lecture de code ET par exécution réelle** : le bilan en cours de
saisie n'existe que dans un état React local (`draft`, jamais écrit dans `athlete.bilans`) jusqu'au
clic sur « Analyser ». Aucune sauvegarde automatique, aucun brouillon persistant, aucun
avertissement de perte de données. Le bouton « ← Retour » du bas de l'écran de liste (celui qui
quitte tout le bilan, différent du « ← Retour » qui quitte juste un test) **efface silencieusement
tout ce qui a été saisi** — reproduit en conditions réelles (Partie 5).

Erreurs de saisie : aucune validation de valeur (pas de `min`/`max`, valeurs négatives ou
aberrantes acceptées telles quelles) — voir Partie 8. Conservation des données : uniquement après
« Analyser », dans `localStorage` + synchronisation Supabase débouncée. Apparition des résultats :
immédiate et locale (mini-graphique par KPI, badge de statut par test dans la liste) — mais le
badge ne distingue pas « non rempli » de « résultat réel neutre » (Partie 11).

---

## 3. Batterie testée

Simulation réelle couvrant les 8 catégories demandées par la mission :

| Qualité demandée | Test(s) réellement saisi(s)/inspecté(s) | Catégorie de saisie réelle |
|---|---|---|
| Mobilité | WBLT (3 essais Droite : 32/33/31 cm) | MOBILITÉ |
| Force | Isometric Belt Squat (ouvert, coché) + Knee Extension (inspecté) | FORCE GLOBALE / FORCE SEGMENTAIRE |
| Puissance | Countermovement Jump (inspecté en détail — 51 KPI) | SAUTS |
| Explosivité | (partagé avec CMJ/Force — aucun test dédié distinct dans le catalogue, cf. Partie 4) | SAUTS / FORCE SEGMENTAIRE |
| Réactivité | Drop Jump (inspecté) | SAUTS |
| Stabilisation | Landing Unilatéral (inspecté) | LANDING |
| Absorption | CMJ (partagé) + Landing Unilatéral (partagé) | SAUTS / LANDING |
| Endurance | Heel Raise (inspecté) + Hop Test = `repeated_hop` (inspecté — 15 KPI) | TESTS FONCTIONNELS |

Cette table confirme un fait structurel important pour la Partie 5 : **la batterie de saisie ne
reproduit pas la liste des 8 qualités**. Un même test (CMJ, DJ) alimente plusieurs qualités à la
fois ; certaines qualités (Explosivité, Puissance) n'ont pas de test qui leur soit dédié
exclusivement dans l'écran de saisie — elles émergent de la même poignée de tests ForceDecks. Ce
n'est pas un défaut en soi (conforme à la logique clinique HYP), mais cela confirme qu'un futur
regroupement « par qualité » côté saisie répéterait certains tests dans plusieurs sections.

---

## 4. Cartographie des écrans

| Écran | Rôle | Navigation entrante | Navigation sortante |
|---|---|---|---|
| `AthleteProfile` | Fiche sportif, liste des bilans | Dashboard | « + Bilan » / « Démarrer un bilan » / ouvrir un bilan existant |
| `BilanForm` | Type + sous-type + commentaire | « + Bilan » | « Annuler » ou « Commencer le bilan » |
| `TestEntry` | Liste plate de 49 tests, 8 catégories, jamais paginée, jamais repliable | `BilanForm` (ou reprise d'un brouillon) | Cliquer un test → `TestDetailPage` ; « ← Retour » (bas de liste) → **quitte tout le bilan** ; « Analyser » → `AnalyseView` |
| `TestDetailPage` | Une carte par KPI, essais D/G ou simple | Clic sur une ligne de test | **Seul retour possible : « ← Retour » vers la liste** — aucune navigation directe vers le test suivant |
| `AnalyseView` | Dashboard clinique HYP/CSM + « Valider le bilan » | « Analyser » | Modifier / Aperçu rapport / PDF |

**Deux boutons visuellement identiques, portée radicalement différente** : le « ← Retour » en haut
de `TestDetailPage` (quitte un test, données conservées) et le « ← Retour » en bas de `TestEntry`
(quitte tout le bilan, données perdues si jamais analysé). Rien dans le texte ou la couleur des deux
boutons ne signale cette différence de conséquence.

---

## 5. Friction mesurée

Mesures réelles, pas estimées, sur les tests effectivement saisis :

| Test | Clics « + Essai » | Champs à remplir | Changements de contexte | Répétitions d'information |
|---|---|---|---|---|
| WBLT (1 KPI, D/G, 3 essais/côté) | 6 (3×D + 3×G) | 6 valeurs | 1 (liste → test → liste) | Aucune |
| Isometric Belt Squat (5 KPI, simple) | jusqu'à 15 (3×5) | jusqu'à 15 | 1 | Aucune |
| Countermovement Jump (**51 KPI**, simple) | jusqu'à **153** (3×51) | jusqu'à **153** | 1 | 3 KPI répètent une information déjà dérivable d'autres KPI (asymétrie % + valeur Gauche + valeur Droite pour 6 familles distinctes — 18 champs au total, cf. Partie 7) |
| Drop Jump (8 KPI, simple) | jusqu'à 24 | jusqu'à 24 | 1 | Aucune |
| Landing Unilatéral (D/G) | variable selon nb. KPI ×2 | idem ×2 | 1 | Aucune |
| Hop Test = `repeated_hop` (**15 KPI**, simple) | jusqu'à 45 | jusqu'à 45 | 1 | 4 des 15 KPI sont des indices « Fatigue »/« CV » dérivables statistiquement des 11 autres si le logiciel source (force plate) les exporte déjà — actuellement retapés à la main un par un |
| Bilan complet (8 tests choisis) | 8 changements de contexte liste↔test minimum | — | **8** (un aller-retour complet par test, aucun raccourci) | — |

**Décision clinique vs contrainte informatique (Partie 4), appliquée systématiquement :**

| Action | Nature |
|---|---|
| Choisir quel test réaliser | Décision clinique/organisationnelle — légitime |
| Cliquer « + Essai » une fois par valeur | Contrainte informatique partiellement nécessaire (3 essais = protocole réel), mais l'absence de saisie groupée (Partie 6) en aggrave le coût pour les tests à K KPI |
| Retaper une valeur d'asymétrie déjà calculable depuis Gauche/Droite (CMJ) | **Contrainte informatique pure, sans valeur clinique ajoutée** — le calcul existe déjà (`_asym` à côté de `_L`/`_G` et `_R`/`_D`), rien n'empêche de le dériver au lieu de le faire retaper |
| Retourner à la liste de 49 tests pour passer au test suivant | **Friction pure** — aucune décision clinique n'est prise à cet instant, c'est uniquement une contrainte de navigation (pas de bouton « test suivant ») |
| Cocher un test avant même de savoir s'il sera rempli | Contrainte informatique — le clic sur la ligne fait à la fois cocher ET ouvrir, sans distinction (Partie 11) |
| Revenir en arrière avec le bouton de bas de liste | **Risque, pas juste friction** — l'action semble anodine mais efface tout un bilan non analysé (Partie 11) |

**Constat global** : le nombre de clics « + Essai » lui-même n'est pas le problème (3 essais par
mesure est un protocole clinique légitime, la mission le dit explicitement) — le problème mesuré
est la **densité par écran** (jusqu'à 51 cartes KPI identiques sur une seule page pour CMJ) et
**l'absence de toute continuité entre tests** (retour systématique à une liste de 49 lignes).

---

## 6. Système d'essais

Mécanique exacte de `TrialIn` (index.html:6444-6468) : un clic sur « + Essai » ajoute
immédiatement un champ vide (aucune confirmation, aucun prompt) ; retaper dans un champ existant
modifie l'essai en place à chaque frappe ; un bouton « × » par essai le supprime instantanément
**sans confirmation ni annulation possible** ; le bouton « + Essai » disparaît de lui-même au-delà
de 3 essais (plafond en dur, jamais expliqué à l'écran). Les essais déjà saisis restent visibles en
permanence (champ + mini-graphique de barres au-dessus, avec ligne de norme en pointillé) — bonne
visibilité, confirmée visuellement (capture WBLT).

Classification par test, telle que demandée par la Partie 6 :

| Catégorie | Tests concernés | Justification |
|---|---|---|
| **A — déjà adapté** | WBLT, Isometric Belt Squat/IMTP (1 KPI ou peu, D/G ou simple) | 3 essais max, saisie rapide, graphique immédiat, aucune friction identifiée au-delà du strict nécessaire |
| **B — quelques améliorations suffiraient** | Knee Extension et les 21 autres tests « Force Segmentaire » (5-7 KPI chacun, D/G) ; Drop Jump/DJ (8 KPI) | Le système d'essai lui-même fonctionne, mais le nombre de cartes KPI identiques à faire défiler (14-16 avec D/G) est haut pour un protocole où l'essentiel de l'information tient dans 1-2 valeurs par côté |
| **C — un workflow différent serait nettement meilleur** | CMJ (51 KPI), `repeated_hop` (15 KPI), et plus largement tout test alimenté par un export force-plate (ForceDecks/VALD) | Ces tests ne sont, dans la réalité clinique, presque jamais retapés à la main un par un — ils sont exportés en CSV. Le workflow manuel actuel (51 cartes à ouvrir/remplir) n'est probablement pas le chemin réellement emprunté par un praticien équipé d'une force plate ; l'import CSV existant (bouton « 📂 Import CSV », déjà présent) est la vraie réponse pour ces tests-là — voir Partie 9 |

Aucun test n'a permis de connaître à l'avance le nombre d'essais attendu autrement que par
convention clinique implicite (3, plafond en dur) — rien à l'écran ne dit « 3 essais recommandés »
avant le premier clic.

---

## 7. KPI multiples

Aucune hiérarchie visuelle n'existe entre KPI « à saisir », « calculé », « dérivé » ou «
informatif » — chaque KPI d'un test reçoit exactement la même carte (label, cible de norme,
graphique, champ(s) d'essai). Le catalogue de tests (`TBK`) ne porte aucun indicateur
« computed »/« derived » sur les KPI eux-mêmes. **Une seule exception dans tout le logiciel** :
le KPI composite du Y-Balance Test, explicitement étiqueté « Composite % (auto) » et **jamais**
présenté comme un champ à remplir (calculé et affiché en lecture seule).

Cas concret vérifié (CMJ) : les familles `eccentric_deceleration_rfd`, `peak_landing_force`, etc.
possèdent chacune 3 champs — `_asym` (%), `_L`/`Gauche`, `_R`/`Droit` — **tous trois présentés comme
des essais à taper**, alors que l'asymétrie est arithmétiquement dérivable des deux autres. Rien
n'indique au praticien lequel des trois taper en premier, ni que les trois devraient rester
cohérents entre eux (aucune vérification croisée, Partie 8).

Le seul signal auto-calculé réellement présenté comme tel pendant la saisie D/G est le « LSI auto »
(pied de carte, lecture seule, jamais un champ). C'est un bon précédent réutilisable : le mécanisme
existe déjà pour distinguer visuellement une valeur dérivée d'une valeur saisie — il n'est
simplement pas généralisé aux autres KPI dérivés (asymétries CMJ notamment).

**Rappel du périmètre** : cette mission ne recommande aucun changement de rôle clinique — seulement
un constat sur la présentation. Le rôle diagnostique/confirmatif/explicatif de chaque KPI (défini
dans les moteurs HYP) n'est de toute façon déjà pas visible pendant la saisie, conforme à la
Partie 14 de la mission (ne pas mélanger saisie et interprétation).

---

## 8. Gestion des erreurs

Testé et vérifié directement dans le code (aucune de ces situations n'est bloquée) :

| Situation testée | Comportement actuel |
|---|---|
| Valeur absente | Acceptée — un essai ajouté puis jamais rempli reste `null` dans le tableau, silencieusement ignoré par les calculs |
| Valeur négative/impossible (ex. -9999) | Acceptée telle quelle, aucune borne `min`/`max` sur le champ, affichée sur le mini-graphique (qui se redimensionne autour d'elle) |
| Essai incomplet (test avec 5 KPI, un seul rempli) | Aucun signal — le test est compté « actif » dès qu'il est coché, indépendamment du remplissage |
| Suppression d'un essai | Immédiate, bouton « × », **aucune confirmation, aucun annuler** — les essais suivants se renumérotent (E3 devient E2) |
| Modification d'un essai déjà saisi | Directe, retype en place — aucun souci identifié ici |
| Changement de test après saisie partielle | Les données du test quitté sont conservées tant qu'on ne quitte pas tout le bilan (Partie 5) — correct |
| Retour arrière (bouton bas de liste) | **Perte totale du bilan non analysé** — confirmé en conditions réelles (Partie 5) |
| Données incohérentes (asymétrie % ≠ écart réel entre Gauche/Droit) | Aucune vérification croisée nulle part |

**Ce que le praticien comprend** : rien ne l'avertit d'aucune de ces situations — pas de message
d'erreur, pas de bordure rouge, pas de résumé « valeurs manquantes ». Le seul message d'erreur
existant dans tout le flux de saisie concerne l'import CSV (fichier invalide/aucun test reconnu),
pas la saisie manuelle.

**Risque principal identifié** : le doublon des deux boutons « ← Retour » (Partie 4/11) est la
seule situation d'erreur avec un impact clinique réel (perte de données) — tout le reste
(valeurs non bornées, essais incomplets) est un risque de qualité de données silencieuse plutôt
qu'un blocage.

---

## 9. Saisie rapide

Mise en situation : *« Je suis kiné, j'ai mes valeurs sur ma tablette/mon papier, je veux les
rentrer vite. »*

- **Navigation inutile** : chaque test, quel qu'il soit, impose un aller-retour complet vers une
  liste de 49 lignes réparties sur 8 catégories sans recherche ni filtre — pour une batterie de 8-10
  tests, c'est 8-10 défilements de la même liste longue.
- **Attente** : aucune latence identifiée (calculs synchrones, pas de round-trip réseau pendant la
  saisie).
- **Clics répétitifs** : le motif « + Essai » ×3 par KPI est répété identiquement pour chaque KPI
  d'un même test, jusqu'à 51 fois de suite pour CMJ — aucun raccourci « dupliquer le nombre
  d'essais » ni saisie en lot.
- **Changement de contexte** : élevé — toujours retourner à la liste, jamais de test suivant direct.
- **Perte de visibilité des essais** : aucune — les essais restent visibles tant qu'on reste sur
  l'écran du test (bon point).
- **Nécessité de mémoriser des informations** : faible pour les tests simples (WBLT), mais réelle
  pour CMJ/`repeated_hop` où le praticien doit retrouver, dans 51/15 champs identiquement présentés,
  lequel correspond à quelle valeur de son export — la seule aide est le libellé texte, pas de
  regroupement visuel par phase de mouvement (freinage/concentrique/atterrissage, pourtant utilisé
  ailleurs dans l'app comme vocabulaire, ex. « Fil de Raisonnement »).
- **Le vrai raccourci existe déjà et est sous-utilisé** : le bouton « 📂 Import CSV » (visible en
  permanence sur l'écran de liste) permet d'importer directement un export ForceDecks/DynaMo/VALD/
  Vitruve — c'est la réponse structurelle à la friction des tests à K KPI (Partie 6, catégorie C),
  déjà présente, jamais mise en avant ni contextualisée au moment où un praticien ouvre justement un
  test à 51 champs.

---

## 10. Saisie guidée

Aujourd'hui, l'écran de saisie **ne guide pas** — il liste. Aucun texte d'objectif, aucune
description de position/protocole, aucune image de démonstration n'accompagne un test avant sa
saisie (contrairement à l'exemple conceptuel de la mission
`TEST → OBJECTIF → POSITION → ESSAIS → VALIDATION`). Parcours réalisé sans connaissance préalable
du code (Partie 10 de la mission) :

1. **Où commencer ?** — Compréhensible en 2 clics (« Démarrer un bilan » → type de bilan) ; le
   premier écran est clair.
2. **Quels tests réaliser ?** — La liste de 49 tests, sans aucune recommandation ni présélection
   liée au type de bilan choisi (Performance/RTP/Screening/Suivi n'influence jamais la liste
   affichée — vérifié par le code), oblige un praticien non expérimenté à déjà savoir quels tests
   sont pertinents. C'est une charge cognitive reportée sur l'utilisateur, pas résolue par l'outil.
3. **Où saisir les essais ?** — Clair une fois dans un test (bouton « + Essai » explicite).
4. **Comment passer au test suivant ?** — **Pas clair du tout** : il faut deviner qu'il faut cliquer
   « ← Retour » (qui ressemble à un abandon) pour ensuite rechercher le test suivant dans la longue
   liste.
5. **Comment savoir ce qui est terminé ?** — Ambigu (Partie 11) : un test coché-mais-vide affiche le
   même point de couleur qu'un test réellement rempli avec un résultat neutre.
6. **Comment savoir ce qui reste à faire ?** — Aucun résumé de progression par catégorie ou par
   qualité — seul le compteur global « Analyser (n) », qui compte les tests cochés, pas les tests
   réellement complets.

**Utilité d'un mode guidé (Partie 13, évaluation seulement)** : oui, potentiellement utile pour un
praticien peu familier — mais la mission demande d'évaluer, pas de trancher. Le besoin réel semble
concentré sur 3 points précis (recommandation de tests par type de bilan, navigation test-suivant,
distinction rempli/non rempli) plutôt que sur un mode entièrement parallèle — voir Partie 15/16.

---

## 11. Batterie complète

**Il n'existe aujourd'hui aucune notion fiable de « bilan terminé » au sens du contenu.** Vérifié
par lecture de code et par exécution réelle :

- Le seul état persistant est `statut` ∈ {`'Brouillon'`, `'Validé'`} sur le bilan — un attribut
  administratif, jamais lié au taux de remplissage.
- Le bouton « Valider le bilan » **n'a aucune condition** — vérifié en conditions réelles : un
  bilan avec un seul test coché et strictement aucune valeur saisie a été validé sans blocage,
  affichant « ✓ Bilan validé ».
- **« Non réalisé » et « non renseigné » ne sont pas distingués.** Un test jamais coché (« non
  réalisé ») et un test coché puis quitté sans donnée (« non renseigné ») aboutissent tous deux à
  une absence de valeur exploitable par les moteurs HYP — mais seul le second affiche un point de
  couleur dans la liste (jaune par défaut, faute de valeur — capture à l'appui, Partie 5), qui se
  confond visuellement avec un vrai résultat clinique neutre.
- **Reprise d'un bilan** : possible (« ✎ Modifier » depuis `AnalyseView`, ou ré-ouverture d'un
  bilan existant), et un bilan déjà « Validé » reste éditable sans restriction — aucun verrouillage.
- **Aucun indicateur de progression par catégorie ou par qualité** n'existe sur l'écran de liste —
  seul le compteur global de tests cochés.

Rien n'a été inventé ici — ce constat documente strictement ce qui existe (ou n'existe pas)
aujourd'hui, conformément à l'instruction explicite de la mission.

---

## 12. Éléments existants réutilisables

Composants déjà présents dans le code, dont la réutilisation éviterait toute nouvelle construction
pour un futur lot (Partie 16 de la mission) :

| Composant existant | Où il est utilisé aujourd'hui | Réutilisable pour la saisie ? |
|---|---|---|
| `Card`, `Badge`, `Btn`, `SecTitle`, `TabBar` | Partout dans l'app | **Oui** — déjà la base de `TestEntry`/`TestDetailPage` |
| Barre de progression horizontale (`SC[status]`, largeur en %) | Dashboard, cartes de qualité | **Oui** — pourrait exprimer un taux de remplissage par catégorie sans nouveau composant |
| `FunctionGaugeCard` (jauge semi-circulaire + rangée de puces) | Dashboard | Oui, pour un futur écran de synthèse de progression, si jugé utile |
| `KpiResultCard` (mini-graphique 3 barres en lecture seule) | `ResultsBrowser` | **Oui** — jumeau visuel exact de `TrialIn`, pourrait servir de résumé compact « ce qui a déjà été saisi » sans ouvrir chaque test |
| Sélecteur à onglets/pilules (3 variantes déjà codées séparément) | Auth, `AnalyseView`, `ResultsBrowser` | Oui — un motif déjà répété 3 fois indépendamment ; une version pourrait servir de sélecteur « Mode rapide / Mode guidé » sans nouveau composant visuel |
| Rangée de chips de test avec pastille de statut (`ResultsBrowser`) | `ResultsBrowser` | **Oui, directement pertinent** — c'est déjà, presque telle quelle, une liste de tests avec indicateur d'état ; la plus proche base existante d'un futur sélecteur de batterie plus compact que la liste actuelle |
| Accordéon simple (`QualityConfigView`, un seul ouvert à la fois) | Configuration des qualités | Oui — pourrait regrouper les 8 catégories de tests en sections repliables sans nouveau composant |
| Accordéon multiple (`FilDeRaisonnementView`, plusieurs ouverts) | Fil de Raisonnement | Oui, alternative si plusieurs catégories doivent rester ouvertes simultanément |
| Motif « confirmer en ligne » (🗑 → Supprimer/✕, sans modale) | Suppression d'un sportif, d'un bilan | **Oui, directement applicable** — ce motif existe déjà ailleurs mais n'est PAS utilisé pour les deux actions destructives de la saisie (décocher un test, quitter tout le bilan) alors qu'il résoudrait directement le risque de la Partie 5/11 sans aucun nouveau composant |
| `CSVImportModal` | Import de données brutes | **Oui, déjà la meilleure réponse pour les tests à K KPI** (Partie 6/9) |
| `TestKpiChart` (graphique en barres + ligne de norme) | Déjà dans `TestDetailPage` | Déjà utilisé, aucun changement nécessaire |

**Conclusion de cette partie** : la quasi-totalité de ce qu'un futur lot pourrait vouloir construire
(indicateur de progression, confirmation avant perte de données, sélecteur de test plus compact,
résumé de ce qui est déjà saisi) a déjà un composant frère ailleurs dans le code. Aucun nouveau
composant n'est nécessaire pour traiter les problèmes CRITIQUE/IMPORTANT identifiés (Partie 14).

---

## 13. Problèmes UX

Test 10 secondes et 30 secondes appliqués aux captures réelles (`s5_test_list.txt`, écran de liste
au premier chargement d'un bilan) :

**Test 10 secondes** : où commencer est clair (liste visible, catégories nommées). Ce qu'il faut
saisir est clair une fois un test ouvert. **Ce qui est terminé n'est PAS clair** — aucune
distinction visuelle entre « je n'ai pas encore touché ce test » et « je l'ai ouvert par erreur ».
**Ce qui reste à faire n'est pas clair** — pas de compteur par catégorie, seulement un total global
de tests cochés.

**Test 30 secondes** : « comment réaliser une batterie complète » reste incomplet après 30
secondes d'observation — il manque un signal de fin (« votre batterie standard comporte N tests,
vous en avez rempli M ») que rien à l'écran ne fournit aujourd'hui.

Liste consolidée des problèmes, avec, pour chacun, la question clé de la Partie 4 :

1. **Perte silencieuse d'un bilan non analysé** (bouton bas-de-liste) — contrainte informatique,
   zéro valeur clinique, risque réel de perte de travail. **CRITIQUE.**
2. **Test coché-vide indiscernable d'un résultat clinique neutre** — contrainte informatique subie
   par le modèle de données actuel (`toggle` sépare mal « sélectionné » de « rempli »). **CRITIQUE**
   au sens clinique (un praticien pressé pourrait valider un bilan croyant un test rempli).
3. **« Valider le bilan » sans aucune condition de remplissage** — même racine que #2.
   **IMPORTANT.**
4. **Aucune navigation vers le test suivant** — obliger 8-10 retours dans une liste de 49 lignes
   est une pure friction de navigation, sans décision clinique associée. **IMPORTANT.**
5. **Densité extrême des tests à K KPI** (CMJ 51, `repeated_hop` 15) sans hiérarchie visuelle ni
   regroupement par phase — friction réelle pour la saisie manuelle, atténuée par l'import CSV déjà
   existant mais non mis en avant à cet endroit précis. **IMPORTANT** pour la saisie manuelle,
   **UTILE** si l'import CSV est le chemin réel emprunté par la majorité des praticiens équipés.
6. **KPI dérivés (asymétries CMJ) présentés comme des champs à saisir, sans distinction visuelle**
   ni vérification de cohérence avec les valeurs sources. **UTILE.**
7. **Aucune recommandation de tests selon le type de bilan choisi** (Performance/RTP/Screening/
   Suivi) — la donnée existe déjà (`bilan.type`) mais n'influence jamais la liste. **UTILE.**
8. **Deux boutons « ← Retour » identiques, conséquences opposées** — recoupe #1, à traiter comme un
   seul problème (le second bouton devrait avertir avant d'agir, pas juste être renommé).
   **CRITIQUE** (même racine que #1).
9. **Absence de validation de valeur** (bornes, cohérence) — risque de qualité de donnée silencieuse,
   pas de blocage utilisateur direct. **UTILE.**
10. **Pas d'aide contextuelle (objectif/position du test)** — écart avec l'exemple de mode guidé de
    la mission, mais aucune preuve que son absence bloque aujourd'hui un praticien expérimenté.
    **OPTIONNEL.**

---

## 14. Priorisation

| # | Problème | Classement | Impact réel observé |
|---|---|---|---|
| 1/8 | Perte silencieuse du bilan (bouton bas-de-liste) | **CRITIQUE** | Reproduit en conditions réelles — un bilan entier avec une valeur saisie a disparu sans avertissement |
| 2 | Test coché-vide = même indicateur qu'un résultat neutre | **CRITIQUE** | Capture à l'appui — un point orange identique pour « rien saisi » et « résultat réel » |
| 3 | Validation sans condition de remplissage | **IMPORTANT** | Reproduit en conditions réelles — bilan vide validé sans blocage |
| 4 | Pas de navigation test-suivant | **IMPORTANT** | Mesuré — 8 à 10 retours à une liste de 49 lignes pour une batterie représentative |
| 5 | Densité CMJ/`repeated_hop` (51/15 KPI) | **IMPORTANT** (saisie manuelle) / **UTILE** (si CSV) | Mesuré — jusqu'à 153 clics « + Essai » possibles sur un seul test |
| 6 | KPI dérivés non distingués (asymétries) | **UTILE** | Constaté sur 6 familles CMJ, pas de vérification croisée |
| 7 | Pas de présélection de tests par type de bilan | **UTILE** | `bilan.type` existe, jamais exploité côté liste |
| 9 | Pas de validation de valeur (bornes) | **UTILE** | Aucun incident direct observé, risque de qualité de donnée |
| 10 | Pas d'aide contextuelle par test | **OPTIONNEL** | Écart avec l'exemple de la mission, aucun blocage observé |

Aucun problème n'a été ajouté artificiellement — cette liste reflète strictement ce qui a été
observé et mesuré dans les Parties 5 à 11.

---

## 15. Workflow cible

L'ordre proposé par la mission (`MOBILITÉ → FORCE → PUISSANCE → RÉACTIVITÉ → CONTRÔLE/STABILISATION
→ ABSORPTION → ENDURANCE`) suit la logique des 8 qualités HYP — **mais elle ne correspond pas à la
logique de mesure actuelle** (Partie 3/5) : plusieurs tests alimentent plusieurs qualités à la fois
(CMJ → Puissance ET Absorption ; DJ → Réactivité ET Absorption), donc un ordre strictement par
qualité forcerait à répéter la saisie du même test à plusieurs endroits ou à choisir arbitrairement
où le placer.

**Ordre réellement pertinent, déduit de l'interface et du protocole de mesure existants** (pas de
l'ordre diagnostique HYP) — reprend la logique déjà en place dans les 8 catégories, mais les
regroupe en une progression de séance cohérente avec un protocole réel (échauffement → tests
statiques → tests dynamiques → tests de fatigue) :

```
BILAN (type + sous-type)
  ↓
MOBILITÉ (WBLT — souvent réalisé en premier, échauffement)
  ↓
FORCE (Force Segmentaire + Force Globale + Force-Vitesse — protocole isométrique, un bloc cohérent)
  ↓
SAUTS (CMJ, SLCMJ, CMJR, DJ, SLDJ — un seul bloc dynamique, couvre Puissance/Explosivité/Réactivité/Absorption)
  ↓
LANDING + SENSORIEL (réception, équilibre — logique de fatigue croissante, souvent en fin de séance)
  ↓
TESTS FONCTIONNELS (Y-Balance, hop battery, Heel Raise, Hop Test — tests de fond/fatigue, naturellement en dernier)
  ↓
RÉCAPITULATIF (nouveauté proposée — résumé de ce qui est rempli/manquant par catégorie, pas par qualité HYP)
  ↓
BILAN TERMINÉ (nécessiterait une condition minimale, à définir avec le praticien — hors périmètre de cet audit)
```

Ce workflow **conserve** les 8 catégories déjà en place (elles sont déjà cohérentes avec un
protocole réel de séance de test) et ajoute seulement un récapitulatif de fin — pas de
réorganisation par qualité HYP, qui casserait la mutualisation actuelle des tests entre qualités.

---

## 16. Options de développement

**MODE A — Saisie rapide vs MODE B — Saisie guidée (Partie 13 de la mission)** : évaluation, pas de
décision. Un mode guidé (objectif/position/essais/validation par test) aurait de la valeur pour un
praticien peu familier, mais rien dans l'audit ne démontre qu'un praticien expérimenté est
aujourd'hui bloqué par l'absence de guidage — son obstacle réel est la navigation (#4) et
l'ambiguïté de complétion (#2/#3), pas l'absence d'explication clinique. **Recommandation de cette
partie : traiter d'abord les problèmes CRITIQUE/IMPORTANT communs aux deux modes avant d'envisager
de dupliquer l'interface en deux parcours.**

**LOT A — Corrections minimales**
- Contenu : #1/#8 (avertir avant de quitter un bilan non analysé, ou distinguer clairement les deux
  boutons « ← Retour » — réutilise le motif « confirmer en ligne » déjà existant, Partie 12), #2/#3
  (distinguer visuellement « coché sans donnée » de « rempli », condition minimale avant « Valider »
  ou au moins un avertissement).
- Gain attendu : élimine le seul risque de perte de données et la seule ambiguïté à impact clinique
  direct.
- Effort : faible — réutilise des composants existants (motif confirmer-en-ligne, `Badge`), pas de
  nouvelle donnée ni de nouveau calcul.
- Risque : très faible — aucune donnée clinique concernée, uniquement de la présentation et un
  garde-fou de navigation.
- Composants réutilisables : motif « confirmer en ligne » (🗑→Supprimer/✕), `Badge`.
- Éléments modifiés : `TestEntry` (bouton bas de liste, indicateur de statut par ligne),
  `AnalyseView` (bouton Valider).
- Éléments inchangés : tout le reste — moteurs, PDF, design global, les 4 vues d'analyse, les 49
  tests et leurs KPI.

**LOT B — Amélioration UX intermédiaire**
- Contenu : LOT A + navigation « test suivant » directe depuis `TestDetailPage` (#4), compteur de
  progression par catégorie plutôt que global (réutilise la barre de progression déjà existante,
  Partie 12), mise en avant contextuelle de l'import CSV sur les tests à forte densité de KPI (#5),
  distinction visuelle des KPI dérivés type asymétrie (#6, réutilise le motif « LSI auto »).
- Gain attendu : réduit la friction de navigation mesurée (Partie 5/9) sans toucher à la structure
  des 8 catégories existantes.
- Effort : modéré — nouvelle logique de navigation dans `TestEntry`/`TestDetailPage`, pas de nouveau
  composant visuel.
- Risque : faible — présentation et navigation uniquement.
- Composants réutilisables : barre de progression, chips de statut (`ResultsBrowser`), `Badge`.
- Éléments modifiés : `TestEntry`, `TestDetailPage`.
- Éléments inchangés : moteurs, PDF, les 8 catégories et leur contenu, la structure des KPI.

**LOT C — Refonte complète éventuelle**
- Contenu : mode guidé optionnel (Partie 13), présélection de tests par type de bilan (#7),
  validation de valeur (#9), aide contextuelle par test (#10), éventuellement un écran « batterie »
  distinct de la liste actuelle.
- Gain attendu : le plus complet, répond à l'intégralité des constats.
- Effort : élevé — nouvelle architecture d'écran, nouvelles données de configuration (batteries
  recommandées par type de bilan), tests dédiés étendus.
- Risque : modéré — surface de changement large, nécessite une validation clinique du contenu des
  batteries recommandées avant tout développement (décision hors périmètre technique).
- Composants réutilisables : l'essentiel de la Partie 12, mais assemblés différemment.
- Éléments modifiés : potentiellement toute la couche de saisie.
- Éléments inchangés (à garantir explicitement si ce lot est un jour engagé) : moteurs HYP/CSM/TFM,
  PDF, design global, les 4 vues d'analyse déjà auditées.

---

## 17. Recommandation

**LOT A, puis LOT B si validé par l'usage.** Justification : les deux problèmes CRITIQUE identifiés
(#1/#8 perte de données, #2/#3 ambiguïté de complétion) sont les seuls à avoir un impact démontré —
reproduits en conditions réelles, pas supposés — et se corrigent avec des composants déjà présents
dans le code, sans toucher à un seul moteur, seuil, test ou donnée clinique. Le LOT B (navigation,
progression, mise en avant du CSV) apporte un gain de confort réel et mesuré, mais sans le risque
direct du LOT A — il peut suivre une fois le LOT A validé. Le LOT C (refonte, mode guidé) n'est
justifié par aucun blocage observé dans cet audit — il resterait une option à instruire séparément,
avec une validation clinique préalable du contenu des batteries recommandées, plutôt qu'un chantier
à engager maintenant.

---

## 18. LOT suivant recommandé

**« Lot Saisie 1 — Garde-fous de complétion et de navigation »**, limité au périmètre du LOT A ci-
dessus : distinguer visuellement/textuellement « test coché sans donnée » de « test rempli »,
avertir avant de quitter un bilan non analysé (ou fusionner les deux comportements de « ← Retour »
en un seul, sans ambiguïté), et documenter clairement à l'écran le plafond de 3 essais. Aucune
modification de HYP, CSM, TFM, VAR_REL3, norme, seuil, test, calcul, structure de données, PDF ou
design global. Tests dédiés avant/après (non-régression stricte sur `testData`/`functionScores`,
identique à la méthode des lots précédents de cette session) et vérification réelle navigateur
reproduisant les deux scénarios critiques de cet audit (perte de bilan, validation sans données).

---

## Verdict

**Non — Kinexus ne permet pas encore une saisie pleinement naturelle, rapide et compréhensible.**
Le moteur clinique et les 4 vues d'analyse sont solides (confirmé par les audits précédents de
cette session) ; la couche de saisie, elle, casse à deux endroits précis et vérifiés : la perte
silencieuse d'un bilan non analysé, et l'impossibilité de distinguer un test réellement rempli d'un
test simplement coché — les deux à impact clinique réel, les deux réparables sans toucher au
raisonnement clinique ni au design global, avec des composants déjà présents dans le code. Le reste
(densité des tests à nombreux KPI, absence de navigation test-suivant, absence de mode guidé) relève
du confort et de la vitesse, pas du blocage — important, mais non critique.

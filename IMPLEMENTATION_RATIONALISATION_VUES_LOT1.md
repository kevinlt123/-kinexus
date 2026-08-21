# Implémentation — Lot Rationalisation des vues 1
« Réconcilier l'affichage HYP/TFM sans toucher aux données »

Mission d'implémentation faisant suite à `AUDIT_RATIONALISATION_VUES_KINEXUS_V1.md` (lecture seule,
commit `5fb7b7e`). Périmètre strictement lecture/normalisation de comparaison/alias de
présentation/wording — **aucune modification** des 8 moteurs HYP, de `computeHypClinicalSynthesis01()`,
de `HYP_QUALITY_RELATIONS`, de `TFM`, de `VAR_REL3`, de `CAPACITES_DATA`, des normes, des seuils, des
règles de convergence, des rôles de variables, ni des scores cliniques. Les 4 vues
(Fonctions/Variables/Capacités/Raisonnement) restent séparées, ne sont ni fusionnées ni renommées ;
l'onglet Raisonnement n'a reçu aucune modification (Partie 7 de la mission).

---

## 1. Problème Mobilité

`VAR_REL3[...].measures[]`/`.estimates[].function` mélange deux orthographes pour la même qualité :
`'Mobilité'` (accentué, jamais utilisé — 0 occurrence) et `'Mobilite'` (non accentué, 21
occurrences). Le filtre par qualité de l'onglet Variables compare le chip cliqué (`HYP_CSM_QUALITIES`,
toujours accentué) à `m.function` par égalité stricte — donc **aucune des 21 entrées ne matchait
jamais** avant ce lot.

**Précision par rapport à l'audit** : l'exemple donné par l'audit (« WBLT actif et déficitaire,
filtre Mobilité → aucune variable ») décrivait le symptôme utilisateur observé, mais `wblt_distance`
lui-même n'apparaît **jamais** dans un champ `measures`/`estimates` d'aucune entrée VAR_REL3 (il est
la variable racine de la catégorie Mobilité, pas une variable qui « mesure/estime » Mobilité au sens
du graphe) — donc même après correction, WBLT ne sera jamais retrouvé PAR ce filtre précis. Les 21
variables réellement concernées sont les tests isométriques de cheville qui **estiment** Mobilité
dans le référentiel (`df_iso`, `inv_iso`, `ev_iso`, etc., cf. `df_iso_n`). Vérifié par exécution
réelle avant correction :

```
kpiStatus('df_iso_n', ...) → classifiable
df_iso_n matche le filtre "Mobilité" (comparaison stricte, avant ce lot) ? false
```

Après correction (comparaison normalisée), `df_iso_n` matche correctement.

---

## 2. Problème Explosivité

Même divergence : `'Explosivité'` (19 occurrences) et `'Explosivite'` (129 occurrences). Avant ce
lot, filtrer sur « Explosivité » ne retrouvait que 19 des 148 variables réellement liées — 87 % de
l'information disponible était invisible au filtrage. Même constat pour Réactivité (`'Réactivité'`
25 + `'Reactivite'` 87 → 111 variables réellement distinctes désormais retrouvées, contre 25 avant).

---

## 3. Audit des alias (Problème 1A)

Recherche exhaustive de toutes les divergences accent/casse/espace entre les registres de noms de
qualité (`HYP_CSM_QUALITIES`, `HYP_CSM_HYP_KEY`, `VAR_REL3[...].function`, `VAR_REL3[...].category`,
`CAPACITES_DATA[...].quality`, `TFM` (clés déjà normalisées en interne), `STR_QUAL_DETAIL` (clés
déjà normalisées en interne)) — comparaison par normalisation NFD + suppression des diacritiques +
minuscule + espaces réduits, appliquée à **toutes** les valeurs de ces registres, pas seulement aux
deux cas cités par la mission :

| Divergence trouvée | Variantes | Nature |
|---|---|---|
| Mobilité | `Mobilité` (0) / `Mobilite` (21) dans VAR_REL3 | Accent — alias créé |
| Explosivité | `Explosivité` (19) / `Explosivite` (129) dans VAR_REL3 | Accent — alias créé |
| Réactivité | `Réactivité` (25) / `Reactivite` (87) dans VAR_REL3 | Accent — alias créé |
| Contrôle Frontal | `Contrôle Frontal` (FUNCTIONS) / `Controle Frontal` (65, VAR_REL3) | Accent — couvert par la même normalisation générique (aucun code ne compare aujourd'hui ce nom via VAR_REL3, mais la correction le protège pour l'avenir sans coût supplémentaire) |
| Force / Force maximale | `Force` (183, VAR_REL3+HYP_CSM_HYP_KEY) / `Force maximale` (19, VAR_REL3+CAPACITES_DATA) | **PAS un accent/casse — un mot en plus.** Alias explicite séparé (Partie 5), jamais couvert par la normalisation générique. |

**Aucun autre alias créé.** Vérifié explicitement, aucun équivalent HYP réel n'existe pour
`Propulsion` (36, VAR_REL3 + 8, CAPACITES_DATA), `Contrôle moteur` (17, VAR_REL3 + 9, CAPACITES_DATA)
et `Résistance neuromusculaire` (11, VAR_REL3) — ces trois libellés restent, à raison,
`hypGoverned:false` dans tous les cas. `Force`/`Puissance`/`Stabilisation`/`Absorption`/`Endurance`
n'ont, eux, aucune divergence orthographique dans les données (une seule graphie chacun, partout) —
confirmé, rien à corriger pour ces 5 qualités.

---

## 4. Solution de normalisation de lecture

Nouvelle fonction pure `normalizeQualityKey(s)` (index.html, avant `computeQualityStatus`) :

```js
function normalizeQualityKey(s){
  if(!s)return'';
  return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
}
```

Utilisée à exactement deux points de comparaison, tous deux déjà existants (aucune nouvelle
fonction de filtrage créée) :

1. **`varMatchesQuality`** (onglet Variables, filtre par qualité) — compare désormais
   `normalizeQualityKey(m.function)===normalizeQualityKey(q)` au lieu de `m.function===q`.
2. **`computeQualityStatus`** (agrégation TFM par qualité, consommée par `computeCapaciteStatus` et
   par le code mort `qualityScores`) — même changement, sur la comparaison `.function` interne.

`VAR_REL3` lui-même n'est jamais lu, écrit ni réécrit différemment — seule la comparaison change.
Confirmé par test (`deepStrictEqual(VAR_REL3, <avant>)`, section 11).

**Volontairement pas agressif** : `normalizeQualityKey` unifie uniquement accent/casse/espaces —
elle ne fusionne jamais deux chaînes qui diffèrent par un mot entier (`normalizeQualityKey('Force')
!== normalizeQualityKey('Force maximale')`, vérifié par test explicite). C'est ce choix qui a rendu
nécessaire un alias séparé pour le Problème 2 plutôt qu'une normalisation plus large.

---

## 5. Problème Force

`CAPACITES_DATA` nomme la qualité `'Force maximale'` (19 liens) ; `HYP_CSM_HYP_KEY` (la table qui
détermine si une qualité est HYP-gouvernée) utilise `'Force'`. Avant ce lot,
`tfmQualityDiagnosticGate(fSc, 'Force maximale', tfmStatus)` retournait toujours
`hypGoverned:false` — même quand `functionScores['Force']` avait un statut HYP réel — et affichait
donc systématiquement le TFM à la place du diagnostic HYP, sans jamais le signaler.

---

## 6. Mapping Force maximale → Force

Alias explicite, à un seul cas, séparé de `normalizeQualityKey` :

```js
var CAPACITE_QUALITY_HYP_ALIAS={'Force maximale':'Force'};
function tfmQualityDiagnosticGate(fSc,quality,tfmStatus){
  var hypQuality=CAPACITE_QUALITY_HYP_ALIAS[quality]||quality;
  var hypGoverned=!!(fSc&&HYP_CSM_HYP_KEY.hasOwnProperty(hypQuality)&&fSc[hypQuality]);
  return{
    tfmStatus:tfmStatus,
    hypGoverned:hypGoverned,
    status:hypGoverned?fSc[hypQuality].status:tfmStatus
  };
}
```

Ni `CAPACITES_DATA` ni `HYP_CSM_HYP_KEY` ne sont modifiés — l'alias ne sert qu'à retrouver, en
lecture, la bonne clé `functionScores` pour un nom qui en désigne une autre. Le calcul TFM lui-même
(`computeQualityStatus('Force maximale', ...)`) continue de n'agréger que les entrées VAR_REL3
littéralement étiquetées `'Force maximale'` — il n'est jamais mélangé aux entrées `'Force'` : ce sont
deux informations distinctes (la donnée TFM/VAR_REL3 « Force maximale » d'un côté, le diagnostic
HYP-FOR-01 de l'autre), l'alias ne fait que décider QUEL diagnostic HYP consulter, jamais QUELLES
variables agréger pour le TFM.

---

## 7. Priorité HYP vs TFM (Problème 2A)

Comportement de `tfmQualityDiagnosticGate` (préexistant, non modifié dans son principe — seule la
résolution du nom de qualité change) : quand `hypGoverned` est vrai, `status` est **toujours**
`fSc[hypQuality].status` — jamais le TFM, quelle que soit sa valeur. Le TFM reste disponible sous
`tfmStatus`, affiché par `capaciteHTML` uniquement comme note secondaire explicite quand il diverge
du diagnostic (« Information complémentaire (secondaire) : … — ne constitue pas un diagnostic
clinique confirmé. », vocabulaire déjà établi par le Lot Productisation clinique 1, inchangé).
L'alias corrige uniquement le cas où ce mécanisme, déjà correct, ne se déclenchait jamais pour Force
faute de reconnaître son nom.

---

## 8. Cas non déterminable (Problème 2B)

Déjà correctement géré par le gate existant, une fois l'alias appliqué : quand
`fSc['Force'].status` est `null` (HYP non déterminable), `hypGoverned` reste vrai (une clé
`HYP_CSM_HYP_KEY['Force']` existe et `fSc['Force']` existe), donc `status` reste `null` — jamais
remplacé par le TFM, même défavorable. `capaciteHTML` affiche alors `'(non déterminable)'`
(jamais un statut coloré), avec la note TFM secondaire toujours disponible mais jamais promue en
diagnostic. Confirmé par test dédié et par capture d'écran réelle (Partie 12) : « Force maximale
(non déterminable) » suivi de « Information complémentaire (secondaire) : Critique — ne constitue
pas un diagnostic clinique confirmé. », jamais « Force maximale (Critique) » avec une marque ✗.

---

## 9. Cas sans HYP (Problème 2C)

Pour les qualités sans équivalent HYP (`Propulsion`, `Contrôle moteur`, `Résistance
neuromusculaire`), le comportement TFM est **inchangé** — vérifié par test de non-régression sur
`tfmQualityDiagnosticGate`. Seule addition de ce lot (wording, `capaciteHTML`) : quand une telle
qualité a un statut, un suffixe discret `· information complémentaire` (même registre visuel que la
note secondaire déjà existante — italique, gris, sans nouveau badge ni nouvelle couleur) signale
qu'il ne s'agit jamais d'un diagnostic HYP, pour que le système ET l'affichage sachent tous deux
distinguer HYP-gouverné de TFM-seul (la mission demandait explicitement que « le système sache » —
cette addition minimale l'étend à ce que l'affichage le dise aussi, sans réintroduire les mots
« TFM »/« HYP »/« VAR_REL3 » dans le texte praticien, conformément au vocabulaire du Lot
Productisation clinique 1).

---

## 10. Tests

Nouveau fichier `tests/rationalisationVuesLot1.test.js` (40 assertions), couvrant les 7 cas + l'audit
des alias + la non-régression :

- **CAS 1 (Mobilité)** : `df_iso_n` matche désormais le filtre « Mobilité » ; 21 entrées VAR_REL3 au
  total matchées (0 avant ce lot) ; `VAR_REL3` reste inchangé (la clé brute `'Mobilite'` existe
  toujours telle quelle) ; scénario réel via `computeMoteur()`.
- **CAS 2 (Explosivité)** : 148 entrées désormais matchées (19 avant) ; Réactivité 111 (25 avant).
- **CAS 3 (Force HYP diagnostiquée)** : `tfmQualityDiagnosticGate('Force maximale', ...)` résout
  vers `fSc.Force` et retourne le statut HYP, jamais le TFM ; non-régression sur `'Force'` (nom déjà
  correct) ; scénario réel de bout en bout sur Absorption (qualité HYP atteignant fiablement un état
  confirmé avec les normes réelles actuellement disponibles — Force elle-même reste structurellement
  quasi toujours `non_determinable` avec les normes réelles, limite déjà documentée par
  `AUDIT_VALEUR_CLINIQUE_RAISONNEMENT_KINEXUS_V1.md` §5, non traitée par ce lot ; le mécanisme du
  gate est identique pour les deux qualités et donc validé par ce scénario).
- **CAS 4 (Force non déterminable + TFM défavorable)** : le gate retourne `status:null` même avec
  `tfmStatus:'rouge'` ; `capaciteHTML` affiche « (non déterminable) », jamais de marque ✗, jamais le
  mot « Critique » dans la ligne principale.
- **CAS 5 (Force diagnostiquée + TFM différent)** : HYP reste prioritaire ; la note secondaire
  s'affiche correctement quand HYP et TFM divergent.
- **CAS 6 (qualité sans HYP)** : `Propulsion`/`Contrôle moteur` restent `hypGoverned:false`,
  comportement TFM inchangé ; nouveau suffixe « information complémentaire » vérifié.
- **CAS 7 (aucune donnée)** : `computeMoteur({})` → Force reste non déterminable ;
  `computeCapaciteStatus` ne fabrique aucun statut sans donnée ; le gate avec `fSc` vide ne fabrique
  rien non plus.
- **Audit des alias** : `normalizeQualityKey('Force') !== normalizeQualityKey('Force maximale')` ;
  aucun alias créé pour Propulsion/Contrôle moteur/Résistance neuromusculaire ;
  `CAPACITE_QUALITY_HYP_ALIAS` contient exactement un alias, rien de plus.

Résultat : **40 passés, 0 échoué**. Suite complète : **34 fichiers de tests, 0 échec**
(`for f in tests/*.test.js; do node "$f"; done`) — aucun test préexistant n'a nécessité
d'ajustement (contrairement au Lot Productisation clinique 1, ce lot ne change aucun texte déjà
couvert par un test existant).

---

## 11. Non-régression

Comparaison stricte automatisée (`deepStrictEqual`) entre le commit `5fb7b7e` (dernier commit avant
ce lot, fin de l'audit) et l'état courant, sur 5 scénarios cliniques distincts (df_iso isolé, CMJ
Absorption, WBLT Mobilité, Force imtp/slimtp, aucune donnée) :

- `functionScores` (8 moteurs HYP) : **identiques bit à bit**.
- `priorities` : **identiques bit à bit**.
- `clinicalSynthesis` : **identiques bit à bit**.
- `TFM` (donnée source complète) : **identique**.
- `VAR_REL3` (donnée source complète, y compris les orthographes divergentes non touchées) :
  **identique**.
- `CAPACITES_DATA` (donnée source complète) : **identique**.
- `HYP_QUALITY_RELATIONS` : **identique**.

Aucune régression détectée. Seules les fonctions de LECTURE (`varMatchesQuality`,
`computeQualityStatus`, `tfmQualityDiagnosticGate`, `capaciteHTML`) ont changé de comportement — les
données qu'elles lisent n'ont pas bougé.

---

## 12. Vérification navigateur

Serveur local (`python3 -m http.server`) servant une copie de `index.html` avec React/ReactDOM
vendorisés localement, navigateur Chromium piloté par Playwright, scénario réel (WBLT déficitaire +
Ankle Dorsiflexion actif, création d'un sportif Basketball NCAA).

- **Onglet Variables, filtre « Mobilité » actif** (capture d'écran) : confirmé — les 7 cartes
  « Ankle Dorsiflexion » (test qui estime Mobilité dans VAR_REL3 sous l'orthographe non accentuée
  `'Mobilite'`) apparaissent désormais, chacune avec la section « ESTIME (CALCULÉ) » affichant le
  chip « Mobilité · Moderee ». Le message « Aucune variable active liée à Mobilité » (symptôme
  documenté par l'audit) a été recherché dans le texte de la page et confirmé absent.
- **Onglet Capacités** (capture d'écran, scénario riche en qualités TFM-seules et HYP non
  déterminables) : confirmé — « Force maximale (non déterminable) » avec la note « Information
  complémentaire (secondaire) : Critique — ne constitue pas un diagnostic clinique confirmé. »
  systématiquement en dessous, jamais de marque ✗ ni de statut coloré emprunté au TFM pour cette
  qualité ; « Propulsion (Critique) · information complémentaire » et « Contrôle moteur (Critique) ·
  information complémentaire » confirment le nouveau suffixe pour les qualités sans HYP.
- **Onglet Fonctions** : non modifié par ce lot (aucune fuite de vocabulaire technique introduite —
  hors périmètre, la mission ne demandait de corriger que les connexions Variables/Capacités).

Une tentative de capture d'un cas positif (Absorption réellement diagnostiquée rouge par HYP-ABS-01,
visible dans Capacités) via automatisation navigateur n'a pas abouti dans cette session (la saisie
CMJ automatisée n'a pas été prise en compte par l'état de l'application lors de ce run précis —
problème d'automatisation, sans rapport avec le code modifié). Le même mécanisme (le gate
`tfmQualityDiagnosticGate`, identique pour toutes les qualités HYP-gouvernées) est néanmoins vérifié
de façon déterministe et fiable par le test « CAS 3 » (Partie 10), qui exécute réellement
`computeMoteur()` + `computeCapaciteStatus()` sur un scénario Absorption avec des normes réelles et
confirme que le statut affiché dans Capacités est bit-à-bit identique à `functionScores['Absorption'].status`.

---

## 13. Vérification PDF

**Non applicable à ce lot** — vérifié par recherche exhaustive des consommateurs de `capaciteHTML`
et `computeCapaciteStatus` : les deux ne sont appelés qu'à un seul endroit (`index.html`, rendu de
l'onglet Capacités de `ExpertView`, ligne ~8877-8881). Ni `buildSportifReport` ni `buildExpertReport`
ne lisent `res.capaciteScores` ni n'appellent `capaciteHTML` — l'onglet Capacités n'apparaît dans
aucun des deux PDF, confirmant le constat déjà établi par `AUDIT_RATIONALISATION_VUES_KINEXUS_V1.md`
§12. Conformément à l'instruction conditionnelle de la mission (« génération PDF si l'onglet
Capacités est repris dans le PDF »), aucune génération de PDF n'a été effectuée pour ce lot.
L'onglet Variables n'est pas non plus dans le PDF (même vérification, `varRelHTML` jamais appelé
hors de l'onglet lui-même).

---

## 14. Éléments volontairement non modifiés

- **`HYP_CSM_HYP_KEY`, `CAPACITES_DATA`, `VAR_REL3`, `TFM`** : aucune de ces structures de données
  n'a été modifiée — vérifié par `deepStrictEqual` avant/après (Partie 11).
- **`Propulsion`, `Contrôle moteur`, `Résistance neuromusculaire`** : aucun alias HYP créé pour ces
  trois libellés — vérifié explicitement, aucun équivalent HYP réel n'existe pour eux (Partie 3).
  Leur comportement TFM reste strictement identique à avant ce lot.
- **L'agrégation TFM/VAR_REL3 elle-même pour « Force maximale »** (`computeQualityStatus`) : non
  modifiée dans son principe — elle continue de ne lire que les entrées littéralement étiquetées
  `'Force maximale'`, jamais mélangées aux entrées `'Force'` (Partie 6). Seule la résolution du nom
  de qualité HYP à consulter (`tfmQualityDiagnosticGate`) a changé.
- **Onglet Raisonnement** : aucune modification, conformément à la Partie 7 de la mission — reste un
  référentiel pédagogique statique, structure et contenu inchangés.
- **Onglet Fonctions** : aucune modification — reste la vue de composition par qualité, chips TFM
  brutes inchangées (hors périmètre explicite de cette mission, qui ne visait que les connexions
  Variables/Capacités).
- **Aucun nouveau composant, aucune fusion, aucune suppression, aucun renommage d'onglet.**
  `normalizeQualityKey`, `CAPACITE_QUALITY_HYP_ALIAS` et le suffixe « information complémentaire »
  sont les seuls ajouts, tous des fonctions/chaînes de présentation pures.

---

## Résumé des fichiers modifiés

- `index.html` : 57 insertions / 13 suppressions (lecture/normalisation/alias/wording uniquement,
  syntaxe vérifiée par `node --check` après chaque lot de modifications).
- `tests/rationalisationVuesLot1.test.js` (nouveau, 40 assertions).

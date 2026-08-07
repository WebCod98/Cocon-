# Cocon 💞

**L'application des couples à distance.** Une mascotte partagée qu'on élève à deux, les rituels du
matin et du soir, un Polaroid qui s'efface au bout de 24 h, le compteur exact de votre relation, et
quinze mini-jeux pour jouer ensemble même à six fuseaux horaires d'écart.

Cocon est une **PWA** : elle s'installe depuis le navigateur, sans passer par un store, et s'ouvre en
plein écran comme une application native.

---

## Ce que fait l'application

### 🐧 Mascotte & habitat

- **Trois compagnons** au style kawaii — le pingouin, la chatte, le chien — choisis **ensemble** :
  tant que les deux votes ne concordent pas, personne n'est adopté.
- **Trois habitats dessinés** en SVG : l'Iglou moderne, le Salon cosy, le Jardin d'aventures. Chacun
  a ses objets interactifs (gamelle, toboggan, piscine à balles…) qui remontent une jauge précise.
- **Trois jauges synchronisées** — Faim, Affection, Énergie. Elles descendent avec le temps et
  remontent dès que l'un des deux s'occupe de la mascotte, sur les deux écrans à la fois. Elle ne
  meurt jamais : négligée, elle s'endort.
- **« Super Heureux »** se débloque quand vous vous en êtes occupés **tous les deux** dans la journée.
- **Animations** de respiration, clignements, cœurs et petits sauts (Framer Motion + SVG).
- **Boutique** : accessoires portés par la mascotte, friandises qui remontent les jauges, meubles
  posés dans l'habitat — payés avec les pièces gagnées à l'Arcade.

### 🌅 Rituels, intimité, présence

- **Mot du matin & Déclaration du soir**, avec le fuseau horaire de chacun affiché en clair.
- **Notes vocales** enregistrées directement dans le navigateur.
- **Polaroid 24 h** : filtre rétro, effacement automatique au bout de vingt-quatre heures.
- **Bouton Pensée** : une pression déclenche une vibration en battement de cœur sur l'autre
  téléphone, plus une animation plein écran.
- **Météo émotionnelle** : six humeurs, la mascotte adapte sa posture.
- **Statut de présence** (disponible / occupé·e / je dors).

### 💗 Compteur, calendrier, retrouvailles

- **Love Counter** au dixième de seconde : années, mois, jours, heures, minutes, secondes.
- **Jalons** détectés automatiquement (1 mois, 100 jours, 6 mois, 1 an, 500 j, 2 ans, 1000 j, 3, 5 et
  10 ans) avec confettis et badge souvenir.
- **Calendrier partagé** : anniversaires récurrents, fêtes, rendez-vous visio, avec rappels.
- **Compte à rebours des retrouvailles** et **Mode Retrouvailles** (billets, vol, logement).
- **Bucket list** validable par une photo souvenir.
- **Widget dual-time & météo** avec le décalage horaire calculé.

### 🎁 Surprises & secrets

- **Lettres « À ouvrir quand… »** — mauvaise journée, insomnie, dispute… Une question de confirmation
  protège l'ouverture, et la lettre ne s'ouvre qu'une fois.
- **Capsule temporelle** scellée jusqu'à une date future.
- **Roue des décisions** personnalisable, pour trancher les hésitations à distance.

### 🎮 L'Arcade du Couple — 15 mini-jeux

| Catégorie | Jeux |
| --- | --- |
| Quiz & Connaissance | Qui de nous deux ?, Master-Quiz, Tu préfères…, Mots Croisés du Couple |
| Créativité & Rires | Dessinez & Devinez, Cadavre Exquis, Blind Test Privé, Mimes audio/GIF |
| Réflexe & Compétition | Bataille Tap-Tap, Morpion 2.0, Puissance 4, Memory Souvenirs |
| Mystère & Logique | Action ou Vérité, Le Code Secret, Petit Bac Éclair |

Six d'entre eux (Qui de nous deux, Tu préfères, Dessinez & Devinez, Cadavre Exquis, Mimes,
Puissance 4) sont **asynchrones** : l'un dépose son coup, l'autre le retrouve en ouvrant l'app.
Le Blind Test synthétise ses mélodies avec l'API Web Audio — aucun fichier son, donc jouable
hors-ligne. Le Memory se joue avec vos propres Polaroid tant qu'ils sont en ligne.

### 🌙 Mode Sommeil Étoilé

Toute la palette bascule en sombre le soir (automatiquement de 21 h à 6 h, heure locale, ou
manuellement). La mascotte met son bonnet de nuit, le ciel se remplit d'étoiles.

---

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes :

```bash
npm run build      # typecheck + build de production dans dist/
npm run preview    # sert le build de production
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
node scripts/generate-icons.mjs   # régénère les icônes PNG de la PWA
```

### Tester à deux sur une seule machine

1. Ouvrez l'app, choisissez **« Créer notre Cocon »** et notez le **Code d'Amour à 6 chiffres**.
2. Ouvrez une **seconde fenêtre** (ou une fenêtre privée sur le même navigateur) sur la même URL.
3. Choisissez **« J'ai déjà un code »**, saisissez les 6 chiffres.

Les deux fenêtres se synchronisent alors en direct : nourrissez la mascotte d'un côté, la jauge monte
de l'autre.

---

## Comment c'est construit

| | |
| --- | --- |
| Framework | React 18 + TypeScript, compilé par Vite 5 |
| Styles | Tailwind CSS 3.4, palette et composants repris de la maquette |
| Animations | Framer Motion |
| Icônes | lucide-react |
| Routage | react-router-dom |
| Dépendances runtime | **5** — aucune librairie de state, de charts ou de composants |

```
src/
  components/       AppHeader, BottomNav, Companion, habitats/, Sheet, Confetti…
    companions/     Les corps SVG du pingouin, de la chatte et du chien
    habitats/       Les trois décors + la scène interactive
  data/             Compagnons, villes, boutique, catalogue des jeux, contenus
  lib/              Persistance, synchronisation, haptique, notifications, PWA, média
  pages/            Une page par écran
    games/          Les 15 mini-jeux, chargés à la demande
  state/            CoupleContext — le magasin partagé
  types/            Le modèle de données complet
  utils/            Temps (fuseaux, compteur d'amour) et texte
```

### Le modèle de données

Deux objets, et la frontière entre les deux est nette :

- **`CoupleDoc`** — tout ce qui appartient au couple : la mascotte, les jauges, les mots, les
  Polaroid, le calendrier, les lettres, les parties en cours. C'est ce document qui est persisté et
  synchronisé.
- **`DeviceSettings`** — tout ce qui appartient à l'appareil : quel partenaire le tient, son thème,
  ses autorisations. Ne quitte jamais le téléphone.

### La synchronisation

Le document du couple est diffusé sur un `BroadcastChannel` nommé d'après le Code d'Amour, avec un
repli sur l'événement `storage`. La résolution de conflit est un dernier-écrivain-gagne sur un numéro
de révision. Concrètement : **deux fenêtres du même navigateur se synchronisent en temps réel.**

Pour synchroniser deux téléphones réellement distants, il faut un serveur. Tout est prévu pour :
`src/lib/sync.ts` définit une interface `SyncTransport` à trois méthodes
(`publish` / `subscribe` / `close`). Brancher Supabase Realtime, Firebase ou un WebSocket maison
revient à en fournir une autre implémentation — le reste de l'application n'a pas à changer.

Deux autres points suivent la même logique, et sont volontairement explicites plutôt que simulés en
douce :

- **Notifications.** L'app utilise l'API `Notification` locale, relayée par le service worker. Les
  vraies notifications *push* (qui réveillent le téléphone app fermée) demandent un serveur détenant
  les clés VAPID.
- **Météo.** Elle est dérivée de la ville et du jour, donc identique et stable chez les deux
  partenaires, mais ce n'est pas une vraie météo. `weatherFor()` dans `src/data/cities.ts` est le
  seul point à remplacer par un appel à un service météo.

### Le partenaire de démonstration

Sans second appareil, l'app resterait figée en attente. Un module optionnel
(`src/state/useDemoPartner.ts`) fait donc réagir le/la partenaire : il vote pour la mascotte, répond
aux mots doux, s'occupe de l'animal, joue son tour dans les jeux asynchrones. **Il est signalé
comme tel et se désactive dans Réglages.**

### Le thème

Chaque teinte Tailwind (`cream`, `frost`, `ink`, `coral`…) pointe vers une variable CSS. Le Mode
Sommeil Étoilé se contente de réécrire ces variables sur `:root[data-theme="night"]` : toute
l'interface bascule sans qu'une seule classe change dans les composants. Seul `paper` reste clair en
permanence — c'est la couleur du texte posé sur les surfaces sombres.

### La PWA

- `public/manifest.webmanifest` — nom, icônes (dont une *maskable*), affichage plein écran,
  raccourcis vers les Rituels, le Polaroid et l'Arcade.
- `public/sw.js` — coquille en cache à l'installation ; navigations en *réseau d'abord* avec repli
  hors-ligne, bundles hashés en *cache d'abord*, polices mises en cache.
- Les icônes sont **générées** par `scripts/generate-icons.mjs` : encodage PNG à la main avec
  `node:zlib`, cœur tracé par son équation implicite, anticrénelage par sur-échantillonnage. Aucune
  dépendance de build.
- Les polices sont chargées sans bloquer le rendu : un réseau lent ne retarde jamais le premier
  affichage.

### Stockage

Tout tient dans `localStorage`. Les photos sont recompressées (900 px, JPEG 0,72) avant d'être
stockées, et l'écriture dégrade proprement en cas de dépassement de quota : les Polaroid les plus
anciens sont lâchés en premier, puisqu'ils sont de toute façon éphémères.

---

## Déploiement

L'app est **100 % statique** : une fois construite, ce n'est qu'un dossier de fichiers. Aucun serveur
à louer, aucune base de données — donc un hébergement gratuit suffit, et le restera.

Les fichiers de configuration sont déjà dans le dépôt (`netlify.toml`, `vercel.json`,
`public/_redirects`) : il n'y a **rien à régler** dans l'interface de l'hébergeur.

| Hébergeur | Adresse offerte | À savoir |
| --- | --- | --- |
| **Netlify** | `votre-nom.netlify.app` | 100 Go de trafic par mois, usage commercial autorisé |
| **Cloudflare Pages** | `votre-nom.pages.dev` | Trafic illimité, 500 constructions par mois |
| **Vercel** | `votre-nom.vercel.app` | Le plan gratuit interdit l'usage commercial |

La marche à suivre, sans ligne de commande : créer un compte, cliquer sur « importer depuis GitHub »,
choisir ce dépôt, laisser les réglages détectés, déployer. Chaque `git push` redéploie ensuite tout
seul.

Le HTTPS est fourni gratuitement dans les trois cas — c'est indispensable, une PWA ne s'installe pas
sans lui.

### ⚠️ Ce que le déploiement ne fait pas

Mettre l'app en ligne ne relie pas les deux téléphones. Comme expliqué plus haut, la synchronisation
passe aujourd'hui par le navigateur : chaque partenaire aurait **son propre Cocon**, sans voir les
messages de l'autre.

Pour un vrai partage entre deux appareils distants, il faut brancher un serveur de synchronisation
sur l'interface `SyncTransport`. Supabase propose un plan gratuit qui suffit largement (base
PostgreSQL, Realtime, authentification), mais cette étape demande du développement.

---

## État du projet

Vérifié à chaque modification : `tsc --noEmit` sans erreur, `vite build` réussi, ESLint sans erreur.
Un parcours navigateur complet a été rejoué de bout en bout — inscription, appairage, adoption,
rituels, agenda, surprises, **les 15 jeux**, boutique, mode nuit et persistance après rechargement.

Ce qu'il reste à brancher pour une mise en production : le serveur de synchronisation, les
notifications push et un vrai service météo — les trois points d'extension décrits plus haut.

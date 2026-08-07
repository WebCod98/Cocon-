/* --------------------------------------------------------------------------
 * Contenu des 15 mini-jeux de l'Arcade.
 * Les textes utilisent {me} et {them} : ils sont remplaces par les prenoms du
 * couple au moment de l'affichage (voir `fillNames` dans utils/text.ts).
 * ------------------------------------------------------------------------ */

/* --- Qui de nous deux ? -------------------------------------------------- */

export const quiQuestions: string[] = [
  'Qui craque le premier après une dispute ?',
  'Qui parle le plus fort au téléphone ?',
  'Qui a le plus de mal à se lever le matin ?',
  'Qui dépense le plus en cadeaux inutiles ?',
  'Qui rirait le premier pendant un fou rire interdit ?',
  'Qui ferait demi-tour pour un chien croisé dans la rue ?',
  'Qui oublie le plus souvent de répondre aux messages ?',
  'Qui prendrait le plus de valises pour trois jours ?',
  'Qui pleure devant les films ?',
  'Qui a la meilleure playlist ?',
  'Qui prendrait la parole en premier devant une foule ?',
  'Qui cuisinerait un dîner surprise sans prévenir ?',
  'Qui râle le plus dans les transports ?',
  'Qui garde le mieux un secret ?',
  'Qui dirait « je t’aime » en premier chaque matin ?',
];

/* --- Master-Quiz du Couple ----------------------------------------------- */

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  /** Index de la bonne reponse : c'est la reponse « officielle » du couple. */
  answer: number;
  hint?: string;
}

export const masterQuiz: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Où vous êtes-vous vus pour la toute première fois ?',
    choices: ['Chez des amis', 'Au travail', 'En ligne', 'En vacances'],
    answer: 2,
    hint: 'Rejouez la scène dans votre tête…',
  },
  {
    id: 'q2',
    question: 'Quel a été votre premier repas ensemble ?',
    choices: ['Des pâtes', 'Un burger', 'Des sushis', 'Une pizza'],
    answer: 3,
  },
  {
    id: 'q3',
    question: 'Quelle chanson vous rappelle immédiatement l’autre ?',
    choices: ['La première dansée', 'Celle du road-trip', 'Celle de la gare', 'Celle du réveil'],
    answer: 1,
  },
  {
    id: 'q4',
    question: 'Qui a envoyé le tout premier message ?',
    choices: ['{me}', '{them}', 'Un ami commun', 'Personne ne s’en souvient'],
    answer: 0,
  },
  {
    id: 'q5',
    question: 'Quelle est la manie de l’autre qui fait le plus sourire ?',
    choices: [
      'Chanter faux sous la douche',
      'Parler aux plantes',
      'Ranger par couleur',
      'Raconter la fin des films',
    ],
    answer: 0,
  },
  {
    id: 'q6',
    question: 'Combien de temps a duré votre plus long appel ?',
    choices: ['Moins d’une heure', 'Deux heures', 'Une demi-nuit', 'Jusqu’au lever du soleil'],
    answer: 3,
  },
  {
    id: 'q7',
    question: 'Quel est le surnom que personne d’autre ne connaît ?',
    choices: ['Le premier trouvé', 'Celui du deuxième mois', 'Celui de la gare', 'Celui du soir'],
    answer: 0,
  },
  {
    id: 'q8',
    question: 'Quelle destination revient toujours dans vos projets ?',
    choices: ['Le Japon', 'L’Italie', 'Le Canada', 'La Grèce'],
    answer: 1,
  },
  {
    id: 'q9',
    question: 'Quel objet de l’autre garderiez-vous à vie ?',
    choices: ['Un pull', 'Une lettre', 'Une photo', 'Un porte-clés'],
    answer: 1,
  },
  {
    id: 'q10',
    question: 'Quelle heure est la plus douce pour s’appeler ?',
    choices: ['Le petit matin', 'La pause déjeuner', 'Juste avant de dormir', 'En pleine nuit'],
    answer: 2,
  },
];

/* --- Tu préfères… -------------------------------------------------------- */

export const tuPreferes: { id: string; a: string; b: string }[] = [
  { id: 'p1', a: 'Un appel de 3 h par semaine', b: 'Dix appels de 10 min par jour' },
  { id: 'p2', a: 'Se retrouver un week-end par mois', b: 'Deux semaines entières tous les six mois' },
  { id: 'p3', a: 'Recevoir une lettre papier', b: 'Recevoir un vocal de 5 minutes' },
  { id: 'p4', a: 'Vivre dans ta ville à toi', b: 'Vivre dans une ville nouvelle à deux' },
  { id: 'p5', a: 'Un dîner aux chandelles', b: 'Un pique-nique à minuit' },
  { id: 'p6', a: 'Lire dans le même lit sans parler', b: 'Parler toute la nuit sans dormir' },
  { id: 'p7', a: 'Un chat qui casse tout', b: 'Un chien qui réveille à 6 h' },
  { id: 'p8', a: 'Voyager sans photo', b: 'Rester ici avec mille photos' },
  { id: 'p9', a: 'Savoir toutes ses pensées', b: 'Garder un peu de mystère' },
  { id: 'p10', a: 'Une surprise organisée un mois avant', b: 'Une folie décidée le matin même' },
  { id: 'p11', a: 'Danser mal devant tout le monde', b: 'Chanter faux rien que pour l’autre' },
  { id: 'p12', a: 'Un réveil ensemble à la montagne', b: 'Un coucher de soleil ensemble à la mer' },
];

/* --- Mots Croisés du Couple ---------------------------------------------- */

/** '.' = case noire. La grille est verifiee : aucune suite parasite. */
export const crosswordGrid: string[] = [
  'CALIN..',
  'H...O..',
  'A...I..',
  'TENDRES',
  '..U...O',
  '..I...I',
  '..TENIR',
];

export const crosswordClues: Record<'across' | 'down', Record<number, string>> = {
  across: {
    1: 'Ce qu’on s’envoie quand les bras manquent (5)',
    3: 'Vos mots du soir sont toujours… (7)',
    6: 'Se … la main : ce qui vous manque le plus (5)',
  },
  down: {
    1: 'Le compagnon qui ronronne dès que vous vous écrivez (4)',
    2: 'Le café que l’un boit sans sucre (4)',
    4: 'Quand il fait jour chez l’un, c’est la … chez l’autre (4)',
    5: 'Le moment de la Déclaration (4)',
  },
};

/* --- Dessinez & Devinez -------------------------------------------------- */

export const drawWords: string[] = [
  'valise',
  'aéroport',
  'câlin',
  'pingouin',
  'gare',
  'parapluie',
  'gâteau',
  'téléphone',
  'coucher de soleil',
  'bague',
  'chaussettes dépareillées',
  'lit défait',
  'tasse de thé',
  'billet d’avion',
  'plaid',
  'guirlande',
  'boîte aux lettres',
  'appareil photo',
];

/* --- Cadavre Exquis ------------------------------------------------------ */

export const cadavrePrompts: string[] = [
  'Commence l’histoire : « Le jour où {me} a décidé de… »',
  'Continue : décris le lieu où tout se passe.',
  'Ajoute un imprévu complètement absurde.',
  'Fais entrer {them} dans l’histoire.',
  'Ajoute une réplique que quelqu’un crie.',
  'Fais intervenir votre compagnon virtuel.',
  'Écris le rebondissement le plus improbable.',
  'Termine l’histoire sur une phrase très romantique.',
];

/* --- Blind Test Privé ---------------------------------------------------- */

export interface Melody {
  id: string;
  title: string;
  /** Notation scientifique : C4, D#4… ; duree en croches. */
  notes: [string, number][];
  choices: string[];
}

/** Mélodies traditionnelles du domaine public, synthétisées dans le navigateur. */
export const melodies: Melody[] = [
  {
    id: 'm1',
    title: 'Au clair de la lune',
    notes: [
      ['C4', 2],
      ['C4', 2],
      ['C4', 2],
      ['D4', 2],
      ['E4', 4],
      ['D4', 4],
      ['C4', 2],
      ['E4', 2],
      ['D4', 2],
      ['D4', 2],
      ['C4', 6],
    ],
    choices: ['Au clair de la lune', 'À la claire fontaine', 'Frère Jacques', 'Sur le pont d’Avignon'],
  },
  {
    id: 'm2',
    title: 'Frère Jacques',
    notes: [
      ['C4', 2],
      ['D4', 2],
      ['E4', 2],
      ['C4', 2],
      ['C4', 2],
      ['D4', 2],
      ['E4', 2],
      ['C4', 2],
      ['E4', 2],
      ['F4', 2],
      ['G4', 4],
    ],
    choices: ['Frère Jacques', 'Vive le vent', 'Au clair de la lune', 'Ah ! vous dirai-je maman'],
  },
  {
    id: 'm3',
    title: 'Ah ! vous dirai-je maman',
    notes: [
      ['C4', 2],
      ['C4', 2],
      ['G4', 2],
      ['G4', 2],
      ['A4', 2],
      ['A4', 2],
      ['G4', 4],
      ['F4', 2],
      ['F4', 2],
      ['E4', 2],
      ['E4', 2],
      ['D4', 2],
      ['D4', 2],
      ['C4', 4],
    ],
    choices: ['Ah ! vous dirai-je maman', 'Frère Jacques', 'Une souris verte', 'Il était un petit navire'],
  },
  {
    id: 'm4',
    title: 'Vive le vent',
    notes: [
      ['E4', 2],
      ['E4', 2],
      ['E4', 4],
      ['E4', 2],
      ['E4', 2],
      ['E4', 4],
      ['E4', 2],
      ['G4', 2],
      ['C4', 3],
      ['D4', 1],
      ['E4', 6],
    ],
    choices: ['Vive le vent', 'Petit Papa Noël', 'Frère Jacques', 'Au clair de la lune'],
  },
  {
    id: 'm5',
    title: 'Sur le pont d’Avignon',
    notes: [
      ['C4', 2],
      ['G4', 2],
      ['G4', 2],
      ['A4', 2],
      ['A4', 2],
      ['G4', 4],
      ['F4', 2],
      ['E4', 2],
      ['D4', 2],
      ['C4', 4],
    ],
    choices: ['Sur le pont d’Avignon', 'Alouette', 'Au clair de la lune', 'Ah ! vous dirai-je maman'],
  },
  {
    id: 'm6',
    title: 'À la claire fontaine',
    notes: [
      ['G4', 2],
      ['G4', 2],
      ['A4', 2],
      ['G4', 2],
      ['C5', 4],
      ['B4', 4],
      ['A4', 2],
      ['G4', 2],
      ['A4', 2],
      ['B4', 2],
      ['C5', 6],
    ],
    choices: ['À la claire fontaine', 'Le temps des cerises', 'Frère Jacques', 'Vive le vent'],
  },
];

/* --- Mimes audio / GIF --------------------------------------------------- */

export const mimeSubjects: { id: string; label: string; kind: 'emotion' | 'action' | 'objet' }[] = [
  { id: 'mi1', label: 'Tu me manques', kind: 'emotion' },
  { id: 'mi2', label: 'Je suis jaloux·se', kind: 'emotion' },
  { id: 'mi3', label: 'J’ai trop mangé', kind: 'emotion' },
  { id: 'mi4', label: 'Rater son train', kind: 'action' },
  { id: 'mi5', label: 'Faire semblant de dormir', kind: 'action' },
  { id: 'mi6', label: 'Danser tout seul dans la cuisine', kind: 'action' },
  { id: 'mi7', label: 'Un aspirateur', kind: 'objet' },
  { id: 'mi8', label: 'Une machine à café', kind: 'objet' },
  { id: 'mi9', label: 'Un chat qui réclame', kind: 'objet' },
  { id: 'mi10', label: 'Attendre à l’aéroport', kind: 'action' },
  { id: 'mi11', label: 'Être très fier de toi', kind: 'emotion' },
  { id: 'mi12', label: 'Un parapluie retourné par le vent', kind: 'objet' },
];

/** Palette d'emojis pour composer un « GIF » quand le micro n'est pas dispo. */
export const mimeEmojis = [
  '😍', '😴', '😭', '😂', '🤔', '😳', '🥺', '😤', '🤗', '🙃',
  '✈️', '🚆', '☕', '🐱', '🌧️', '🎶', '💃', '🧹', '📞', '🕰️',
  '🍕', '🎁', '🌙', '❤️', '🫠', '🫶', '👀', '💤', '🏃', '🎬',
];

/* --- Morpion : les gages ------------------------------------------------- */

export const gages: string[] = [
  'Envoie un vocal en chantant la première chanson qui passe.',
  'Écris trois raisons pour lesquelles tu es fier·e de l’autre.',
  'Prends un Polaroid de ta pire tête et publie-le.',
  'Dis « je t’aime » dans une langue que tu ne parles pas.',
  'Raconte un souvenir de vous que l’autre a peut-être oublié.',
  'Promets une surprise avant la fin de la semaine.',
  'Envoie une photo de ce que tu vois par la fenêtre, là, maintenant.',
  'Compose un poème de quatre lignes en moins de deux minutes.',
];

/* --- Action ou Vérité ---------------------------------------------------- */

export const wheelCategories = [
  { id: 'douceur', label: 'Douceur', emoji: '🫶', color: '#F9D2DE' },
  { id: 'verite', label: 'Vérité', emoji: '🔎', color: '#8FC9B4' },
  { id: 'gage', label: 'Gage', emoji: '🎯', color: '#F3C36B' },
] as const;

export type WheelCategory = (typeof wheelCategories)[number]['id'];

export const wheelCards: Record<WheelCategory, string[]> = {
  douceur: [
    'Dis à l’autre ce que tu as préféré de sa semaine.',
    'Décris le premier moment où tu t’es dit « c’est lui/elle ».',
    'Envoie un message à sa version d’il y a un an.',
    'Nomme trois choses qui te rassurent chez l’autre.',
    'Décris précisément votre prochaine première minute de retrouvailles.',
    'Dis une chose que tu n’oses jamais dire à voix haute.',
  ],
  verite: [
    'Quel message tu as écrit puis effacé sans l’envoyer ?',
    'Qu’est-ce qui te fait le plus peur dans la distance ?',
    'Quelle habitude de l’autre t’agace un peu ?',
    'À quoi tu penses quand tu ne réponds pas tout de suite ?',
    'Quel mensonge minuscule tu as déjà dit pour éviter une dispute ?',
    'Qu’est-ce qui te manque le plus physiquement ?',
  ],
  gage: [
    'Envoie un selfie sans filtre, tout de suite.',
    'Enregistre un vocal de 20 secondes en imitant l’autre.',
    'Écris un message doux à programmer pour dans trois jours.',
    'Laisse l’autre choisir ta photo de profil pour la semaine.',
    'Fais une déclaration en trois emojis seulement.',
    'Danse 15 secondes en visio, sans musique.',
  ],
};

/* --- Petit Bac Éclair ---------------------------------------------------- */

export const petitBacCategories = [
  { id: 'prenom', label: 'Prénom', emoji: '🙋' },
  { id: 'plat', label: 'Plat', emoji: '🍲' },
  { id: 'motdoux', label: 'Mot doux', emoji: '💌' },
  { id: 'pays', label: 'Pays', emoji: '🌍' },
] as const;

export const petitBacLetters = 'ABCDEFGHIJLMNOPRSTV'.split('');

/* --- Le Code Secret ------------------------------------------------------ */

export const codeColors = [
  { id: 'coral', label: 'Corail', hex: '#E8748F' },
  { id: 'mint', label: 'Menthe', hex: '#8FC9B4' },
  { id: 'sun', label: 'Soleil', hex: '#F3C36B' },
  { id: 'sky', label: 'Ciel', hex: '#7FB3D5' },
  { id: 'plum', label: 'Prune', hex: '#9B7EBD' },
  { id: 'cream', label: 'Crème', hex: '#F3E3D3' },
] as const;

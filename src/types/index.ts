/* --------------------------------------------------------------------------
 * Modele de donnees de Cocon.
 *
 * Tout ce qui appartient au couple vit dans `CoupleDoc` : c'est le document
 * partage, persiste et synchronise entre les deux telephones. Tout ce qui
 * appartient a l'appareil (quel partenaire je suis, mon theme, mes
 * autorisations) vit dans `DeviceSettings` et ne quitte jamais le telephone.
 * ------------------------------------------------------------------------ */

export type Species = 'penguin' | 'cat' | 'dog';

export type Vote = Species | null;

/** Les deux places du couple. Le premier inscrit prend « one ». */
export type PartnerSlot = 'one' | 'two';

export type PinguMood = 'happy' | 'super' | 'sleepy' | 'love' | 'listening';

export type GaugeKey = 'food' | 'love' | 'energy';

export type Availability = 'free' | 'busy' | 'sleeping';

export interface SpeciesOption {
  id: Species;
  /** Prenom propose par defaut lors de l'adoption. */
  name: string;
  label: string;
  emoji: string;
  description: string;
  homeLabel: string;
}

export interface Weather {
  label: string;
  icon: string;
  temp: number;
}

export interface PartnerProfile {
  slot: PartnerSlot;
  name: string;
  emoji: string;
  city: string;
  timeZone: string;
  weather: Weather;
}

export interface Companion {
  species: Species;
  name: string;
  adoptedAt: string;
}

/* --- Rituels ------------------------------------------------------------- */

export type Moment = 'morning' | 'evening';

export interface LoveNote {
  id: string;
  author: PartnerSlot;
  moment: Moment;
  text: string;
  /** Note vocale : dataURL audio enregistree dans le navigateur. */
  audio?: string;
  createdAt: number;
  readAt?: number;
}

export interface Polaroid {
  id: string;
  author: PartnerSlot;
  caption: string;
  url: string;
  postedAt: number;
}

export type MoodKey = 'happy' | 'tired' | 'stressed' | 'cuddles' | 'inlove' | 'down';

export interface MoodEntry {
  id: string;
  author: PartnerSlot;
  mood: MoodKey;
  note?: string;
  createdAt: number;
}

/** Un appui sur le bouton Pensee (empreinte digitale). */
export interface Thought {
  id: string;
  from: PartnerSlot;
  createdAt: number;
  seen: boolean;
}

/* --- Calendrier & retrouvailles ------------------------------------------ */

export type KeyDateKind = 'birthday' | 'couple' | 'holiday' | 'reunion' | 'video';

export interface KeyDate {
  id: string;
  title: string;
  month: number;
  day: number;
  /** Annee fixee pour les evenements non recurrents (visio, retrouvailles). */
  year?: number;
  kind: KeyDateKind;
  emoji: string;
  reminder: boolean;
  /** Heure « HH:MM » pour les rendez-vous visio. */
  time?: string;
}

export interface BucketItem {
  id: string;
  label: string;
  done: boolean;
  /** Photo souvenir qui valide l'activite. */
  photo?: string;
  doneAt?: number;
}

export interface TripDoc {
  id: string;
  title: string;
  detail: string;
  type: 'flight' | 'train' | 'stay' | 'ticket';
}

export interface Milestone {
  id: string;
  label: string;
  days: number;
  emoji: string;
}

/* --- Surprises ----------------------------------------------------------- */

export type LetterCondition =
  | 'bad-day'
  | 'miss-you'
  | 'cant-sleep'
  | 'good-news'
  | 'need-courage'
  | 'angry';

export interface LockedLetter {
  id: string;
  author: PartnerSlot;
  condition: LetterCondition;
  text: string;
  audio?: string;
  createdAt: number;
  openedAt?: number;
}

export interface TimeCapsule {
  id: string;
  title: string;
  text: string;
  photo?: string;
  sealedBy: PartnerSlot[];
  openAt: number;
  createdAt: number;
  openedAt?: number;
}

/* --- Boutique ------------------------------------------------------------ */

export type ShopKind = 'accessory' | 'treat' | 'furniture';

export interface ShopItem {
  id: string;
  kind: ShopKind;
  label: string;
  emoji: string;
  price: number;
  description: string;
  /** Un meuble n'est propose que dans l'habitat de son espece. */
  species?: Species;
  /** Gain applique aux jauges pour les friandises. */
  boost?: Partial<Record<GaugeKey, number>>;
}

/* --- Arcade -------------------------------------------------------------- */

export type GameCategory = 'quiz' | 'creative' | 'reflex' | 'mystery';

export interface GameMeta {
  id: string;
  title: string;
  category: GameCategory;
  tagline: string;
  emoji: string;
  /** Pieces gagnees pour une partie reussie. */
  reward: number;
  /** Un jeu asynchrone se joue chacun son tour, sans etre connectes ensemble. */
  async?: boolean;
}

export interface GameScore {
  plays: number;
  wins: number;
  best: number;
  lastPlayedAt: number;
}

/* --- Defis asynchrones --------------------------------------------------- */

/**
 * Partie jouee chacun son tour, sans etre connectes en meme temps : l'un depose
 * son coup, l'autre le retrouve en ouvrant l'app. `payload` est propre a chaque
 * jeu (grille, dessin, votes...).
 */
export interface Challenge {
  id: string;
  game: string;
  from: PartnerSlot;
  /** A qui de jouer. */
  turn: PartnerSlot;
  status: 'open' | 'closed';
  createdAt: number;
  updatedAt: number;
  payload: Record<string, unknown>;
}

/* --- Journal ------------------------------------------------------------- */

export interface FeedEvent {
  id: string;
  author: PartnerSlot;
  icon: string;
  text: string;
  createdAt: number;
}

/* --- Document partage ---------------------------------------------------- */

export interface CoupleDoc {
  schema: number;
  /** Revision logique : la plus haute gagne lors d'une synchronisation. */
  rev: number;
  updatedAt: number;

  loveCode: string;
  createdAt: string;
  since: string;
  reunionAt: string | null;
  paired: boolean;

  partners: Record<PartnerSlot, PartnerProfile>;
  availability: Record<PartnerSlot, Availability>;

  votes: Record<PartnerSlot, Vote>;
  companion: Companion | null;

  gauges: Record<GaugeKey, number>;
  lastDecayAt: number;
  /** Jour « YYYY-MM-DD » ou chacun s'est occupe de la mascotte. */
  caredOn: Record<PartnerSlot, string | null>;

  coins: number;
  owned: string[];
  equipped: string[];
  placed: string[];

  notes: LoveNote[];
  polaroids: Polaroid[];
  moods: MoodEntry[];
  thoughts: Thought[];

  keyDates: KeyDate[];
  bucket: BucketItem[];
  tripDocs: TripDoc[];
  milestonesSeen: string[];

  letters: LockedLetter[];
  capsules: TimeCapsule[];

  scores: Record<string, GameScore>;
  challenges: Challenge[];
  feed: FeedEvent[];
}

/* --- Reglages locaux a l'appareil ---------------------------------------- */

export type ThemeMode = 'auto' | 'day' | 'night';

export interface DeviceSettings {
  schema: number;
  /** La place occupee par la personne qui tient ce telephone. */
  slot: PartnerSlot;
  theme: ThemeMode;
  notifications: boolean;
  haptics: boolean;
  /** Fait reagir le partenaire pour explorer l'app en solo. */
  demoPartner: boolean;
  onboarded: boolean;
}

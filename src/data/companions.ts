import type { GaugeKey, Species, SpeciesOption } from '../types';

export const speciesCatalog: SpeciesOption[] = [
  {
    id: 'penguin',
    name: 'Pingu',
    label: 'Le pingouin',
    emoji: '🐧',
    description: 'Doux et patient, il traverse la banquise pour porter vos mots.',
    homeLabel: 'Iglou',
  },
  {
    id: 'cat',
    name: 'Miya',
    label: 'La chatte',
    emoji: '🐱',
    description: 'Câline et espiègle, elle ronronne dès que vous vous écrivez.',
    homeLabel: 'Salon',
  },
  {
    id: 'dog',
    name: 'Nino',
    label: 'Le chien',
    emoji: '🐶',
    description: 'Fidèle et joyeux, il fête chaque message comme une fête.',
    homeLabel: 'Jardin',
  },
];

export function speciesOption(id: Species | null | undefined): SpeciesOption {
  return speciesCatalog.find((item) => item.id === id) ?? speciesCatalog[0];
}

/* --- Habitats ------------------------------------------------------------ */

export interface HabitatSpot {
  id: string;
  label: string;
  hint: string;
  emoji: string;
  gauge: GaugeKey;
  /** position en % de la scene */
  x: number;
  y: number;
}

export interface CompanionPose {
  x: number;
  y: number;
  scale: number;
  rotate?: number;
}

export interface HabitatConfig {
  name: string;
  /** ambiance textuelle affichee sous le nom de l'habitat */
  mood: string;
  spots: HabitatSpot[];
  awake: CompanionPose;
  asleep: CompanionPose;
  /** Emplacements libres ou poser les meubles achetes en boutique. */
  decorSlots: { x: number; y: number }[];
}

export const habitats: Record<Species, HabitatConfig> = {
  cat: {
    name: 'Salon cosy',
    mood: 'Vieux rose & beige, plantes et laine',
    awake: { x: 50, y: 62, scale: 1 },
    asleep: { x: 24, y: 58, scale: 0.78, rotate: -6 },
    decorSlots: [
      { x: 40, y: 30 },
      { x: 60, y: 33 },
      { x: 88, y: 82 },
      { x: 9, y: 34 },
    ],
    spots: [
      {
        id: 'sofa',
        label: 'Mini-canapé',
        hint: 'Velours moutarde — sieste en boule',
        emoji: '🛋️',
        gauge: 'energy',
        x: 21,
        y: 60,
      },
      {
        id: 'scratch',
        label: 'Poteau à griffer',
        hint: 'Il l’aiguise quand vous gagnez',
        emoji: '🐾',
        gauge: 'love',
        x: 87,
        y: 52,
      },
      {
        id: 'bowl',
        label: 'Gamelle & croquettes',
        hint: 'Un vrai repas de chat',
        emoji: '🥣',
        gauge: 'food',
        x: 71,
        y: 82,
      },
    ],
  },
  dog: {
    name: 'Jardin d’aventures',
    mood: 'Vert menthe, ciel bleu et pommier',
    awake: { x: 44, y: 64, scale: 1 },
    asleep: { x: 76, y: 60, scale: 0.72, rotate: 4 },
    decorSlots: [
      { x: 55, y: 28 },
      { x: 36, y: 32 },
      { x: 90, y: 84 },
      { x: 8, y: 30 },
    ],
    spots: [
      {
        id: 'kennel',
        label: 'Niche pastel',
        hint: 'Coussins moelleux pour les siestes',
        emoji: '🏠',
        gauge: 'energy',
        x: 77,
        y: 48,
      },
      {
        id: 'ballpit',
        label: 'Piscine à balles',
        hint: 'Il saute dedans quand vous jouez',
        emoji: '🎾',
        gauge: 'love',
        x: 25,
        y: 84,
      },
      {
        id: 'puzzle',
        label: 'Cache-croquettes',
        hint: 'Cachez une friandise à deviner',
        emoji: '🦴',
        gauge: 'food',
        x: 11,
        y: 62,
      },
    ],
  },
  penguin: {
    name: 'Iglou moderne',
    mood: 'Bleu glacial, aurore boréale',
    awake: { x: 52, y: 64, scale: 1 },
    asleep: { x: 22, y: 58, scale: 0.74, rotate: -4 },
    decorSlots: [
      { x: 40, y: 28 },
      { x: 62, y: 31 },
      { x: 90, y: 80 },
      { x: 9, y: 30 },
    ],
    spots: [
      {
        id: 'igloo',
        label: 'Iglou en verre',
        hint: 'Lit en laine polaire à l’intérieur',
        emoji: '🛏️',
        gauge: 'energy',
        x: 20,
        y: 50,
      },
      {
        id: 'slide',
        label: 'Toboggan de glace',
        hint: 'Récompense de la question du jour',
        emoji: '⛷️',
        gauge: 'love',
        x: 76,
        y: 50,
      },
      {
        id: 'pond',
        label: 'Bassin de pêche',
        hint: 'Il pêche des pièces virtuelles',
        emoji: '🐟',
        gauge: 'food',
        x: 50,
        y: 89,
      },
    ],
  },
};

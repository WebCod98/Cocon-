import type { ShopItem } from '../types';

/**
 * Boutique alimentee par les pieces gagnees a l'Arcade.
 * Les accessoires sont dessines par `Companion.tsx`, les meubles apparaissent
 * dans l'habitat, les friandises remontent les jauges.
 */
export const shopItems: ShopItem[] = [
  /* --- Accessoires ------------------------------------------------------ */
  {
    id: 'scarf',
    kind: 'accessory',
    label: 'Écharpe menthe',
    emoji: '🧣',
    price: 0,
    description: 'Offerte à l’adoption — elle ne la quitte plus.',
  },
  {
    id: 'beanie',
    kind: 'accessory',
    label: 'Bonnet de nuit',
    emoji: '🎩',
    price: 40,
    description: 'Se pose tout seul quand le mode nuit s’allume.',
  },
  {
    id: 'glasses',
    kind: 'accessory',
    label: 'Lunettes rondes',
    emoji: '👓',
    price: 60,
    description: 'Pour l’air studieux pendant vos quiz.',
  },
  {
    id: 'crown',
    kind: 'accessory',
    label: 'Couronne dorée',
    emoji: '👑',
    price: 220,
    description: 'La récompense des grands champions de l’Arcade.',
  },
  {
    id: 'bowtie',
    kind: 'accessory',
    label: 'Nœud papillon',
    emoji: '🎀',
    price: 90,
    description: 'Tenue de soirée pour vos rendez-vous visio.',
  },
  {
    id: 'flower',
    kind: 'accessory',
    label: 'Fleur sur l’oreille',
    emoji: '🌸',
    price: 70,
    description: 'Cueillie dans son habitat, un matin de printemps.',
  },

  /* --- Friandises ------------------------------------------------------- */
  {
    id: 'treat-fish',
    kind: 'treat',
    label: 'Petit poisson',
    emoji: '🐟',
    price: 12,
    description: 'Remplit bien la jauge de faim.',
    boost: { food: 30 },
  },
  {
    id: 'treat-cake',
    kind: 'treat',
    label: 'Part de gâteau',
    emoji: '🍰',
    price: 20,
    description: 'Un peu de faim, beaucoup de bonheur.',
    boost: { food: 18, love: 14 },
  },
  {
    id: 'treat-berry',
    kind: 'treat',
    label: 'Barquette de fruits',
    emoji: '🍓',
    price: 16,
    description: 'Léger et vitaminé : de l’énergie en plus.',
    boost: { food: 14, energy: 18 },
  },
  {
    id: 'treat-cocoa',
    kind: 'treat',
    label: 'Chocolat chaud',
    emoji: '☕',
    price: 24,
    description: 'Réconfort garanti après une mauvaise journée.',
    boost: { love: 24, energy: 12 },
  },

  /* --- Meubles & décorations ------------------------------------------- */
  {
    id: 'furn-lamp',
    kind: 'furniture',
    label: 'Lampe douce',
    emoji: '🕯️',
    price: 55,
    description: 'Une lumière chaude pour les soirées d’hiver.',
  },
  {
    id: 'furn-plant',
    kind: 'furniture',
    label: 'Petite plante',
    emoji: '🪴',
    price: 45,
    description: 'Elle grandit un peu chaque semaine.',
  },
  {
    id: 'furn-frame',
    kind: 'furniture',
    label: 'Cadre photo',
    emoji: '🖼️',
    price: 110,
    description: 'Accroche votre plus beau Polaroid au mur.',
  },
  {
    id: 'furn-rug',
    kind: 'furniture',
    label: 'Tapis moelleux',
    emoji: '🧶',
    price: 65,
    description: 'Le coin sieste préféré de votre compagnon.',
    species: 'cat',
  },
  {
    id: 'furn-swing',
    kind: 'furniture',
    label: 'Balançoire',
    emoji: '🪁',
    price: 130,
    description: 'Un jardin, ça se vit dehors.',
    species: 'dog',
  },
  {
    id: 'furn-aurora',
    kind: 'furniture',
    label: 'Aurore boréale',
    emoji: '🌌',
    price: 160,
    description: 'Le ciel de la banquise s’illumine la nuit.',
    species: 'penguin',
  },
  {
    id: 'furn-garland',
    kind: 'furniture',
    label: 'Guirlande',
    emoji: '✨',
    price: 80,
    description: 'Des petites lumières tout autour de l’habitat.',
  },
];

export function shopItem(id: string) {
  return shopItems.find((item) => item.id === id);
}

import type { CoupleDoc, KeyDate, Milestone, PartnerSlot } from '../types';
import { weatherFor } from './cities';

export const SCHEMA = 3;

/** Jalons celebres automatiquement (confettis + badge souvenir). */
export const milestones: Milestone[] = [
  { id: 'm-30', label: '1 mois', days: 30, emoji: '🌱' },
  { id: 'm-100', label: '100 jours', days: 100, emoji: '💯' },
  { id: 'm-182', label: '6 mois', days: 182, emoji: '🌗' },
  { id: 'm-365', label: '1 an', days: 365, emoji: '🎂' },
  { id: 'm-500', label: '500 jours', days: 500, emoji: '⭐' },
  { id: 'm-730', label: '2 ans', days: 730, emoji: '💞' },
  { id: 'm-1000', label: '1000 jours', days: 1000, emoji: '🏆' },
  { id: 'm-1095', label: '3 ans', days: 1095, emoji: '🌹' },
  { id: 'm-1825', label: '5 ans', days: 1825, emoji: '👑' },
  { id: 'm-3650', label: '10 ans', days: 3650, emoji: '💎' },
];

export const defaultHolidays: KeyDate[] = [
  { id: 'h-valentin', title: 'Saint-Valentin', month: 2, day: 14, kind: 'holiday', emoji: '💌', reminder: true },
  { id: 'h-noel', title: 'Noël', month: 12, day: 25, kind: 'holiday', emoji: '🎄', reminder: true },
  { id: 'h-nouvelan', title: 'Nouvel An', month: 1, day: 1, kind: 'holiday', emoji: '🎆', reminder: false },
];

function makePartner(slot: PartnerSlot, name: string, emoji: string, city: string, timeZone: string) {
  return { slot, name, emoji, city, timeZone, weather: weatherFor(city) };
}

interface NewDocInput {
  loveCode: string;
  since: string;
  myName: string;
  myCity: string;
  myTimeZone: string;
  myEmoji: string;
  partnerName: string;
  partnerCity: string;
  partnerTimeZone: string;
  partnerEmoji: string;
  slot: PartnerSlot;
}

/** Document vierge cree a la fin de l'inscription. */
export function createDoc(input: NewDocInput): CoupleDoc {
  const mine = makePartner(input.slot, input.myName, input.myEmoji, input.myCity, input.myTimeZone);
  const otherSlot: PartnerSlot = input.slot === 'one' ? 'two' : 'one';
  const other = makePartner(
    otherSlot,
    input.partnerName,
    input.partnerEmoji,
    input.partnerCity,
    input.partnerTimeZone
  );

  const now = Date.now();

  // Jalons deja franchis a l'inscription : on ne celebre que ceux des 3
  // derniers jours, sinon l'app enchainerait toutes les celebrations passees.
  const start = new Date(`${input.since}T00:00:00`);
  const totalDays = Math.floor((now - start.getTime()) / 86400000);
  const alreadySeen = milestones.filter((item) => item.days <= totalDays - 3).map((item) => item.id);

  return {
    schema: SCHEMA,
    rev: 1,
    updatedAt: now,
    loveCode: input.loveCode,
    createdAt: new Date().toISOString(),
    since: input.since,
    reunionAt: null,
    paired: false,
    partners: {
      one: input.slot === 'one' ? mine : other,
      two: input.slot === 'one' ? other : mine,
    },
    availability: { one: 'free', two: 'free' },
    votes: { one: null, two: null },
    companion: null,
    gauges: { food: 70, love: 70, energy: 70 },
    lastDecayAt: now,
    caredOn: { one: null, two: null },
    coins: 60,
    owned: ['scarf'],
    equipped: ['scarf'],
    placed: [],
    notes: [],
    polaroids: [],
    moods: [],
    thoughts: [],
    keyDates: defaultHolidays.map((item) => ({ ...item })),
    bucket: [],
    tripDocs: [],
    milestonesSeen: alreadySeen,
    letters: [],
    capsules: [],
    scores: {},
    challenges: [],
    feed: [],
  };
}

/**
 * Contenu de demonstration : permet de decouvrir l'app immediatement, sans
 * attendre que le partenaire ait rempli quoi que ce soit.
 */
export function demoSeed(doc: CoupleDoc): CoupleDoc {
  const partner = doc.partners[doc.partners.one.slot === 'one' ? 'two' : 'one'];
  const now = Date.now();
  const hour = 3600 * 1000;

  return {
    ...doc,
    notes: [
      {
        id: 'seed-note-1',
        author: 'two',
        moment: 'morning',
        text: `Réveille-toi doucement. Aujourd’hui tu n’as rien à prouver à personne — je suis déjà fier·e de toi. Prends ton café comme si j’étais assis·e en face.`,
        createdAt: now - 6 * hour,
      },
      {
        id: 'seed-note-2',
        author: 'two',
        moment: 'evening',
        text: 'Pose ton téléphone après ça. Ferme les yeux et imagine ma main dans tes cheveux. Bonne nuit mon amour, on se retrouve demain.',
        createdAt: now - 20 * hour,
      },
    ],
    polaroids: [
      {
        id: 'seed-p1',
        author: 'two',
        caption: 'Il pleut ici, mais je pense à toi',
        url: '/memories/memory-rain.jpg',
        postedAt: now - 5 * hour,
      },
      {
        id: 'seed-p2',
        author: 'one',
        caption: 'Notre banc, sans toi',
        url: '/memories/memory-bench.jpg',
        postedAt: now - 19 * hour,
      },
      {
        id: 'seed-p3',
        author: 'two',
        caption: 'Thé de minuit',
        url: '/memories/memory-tea.jpg',
        postedAt: now - 23 * hour,
      },
    ],
    bucket: [
      { id: 'b1', label: 'Petit-déj dans le café du coin', done: false },
      { id: 'b2', label: 'Une rando et une photo au sommet', done: false },
      { id: 'b3', label: 'Refaire la photo du pont', done: false },
    ],
    feed: [
      {
        id: 'seed-f1',
        author: 'two',
        icon: '💌',
        text: `${partner.name} a déposé son mot du matin`,
        createdAt: now - 6 * hour,
      },
    ],
  };
}

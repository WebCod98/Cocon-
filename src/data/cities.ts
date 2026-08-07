import type { Weather } from '../types';

export interface CityOption {
  id: string;
  city: string;
  country: string;
  timeZone: string;
}

/**
 * Villes proposees a l'inscription. Le fuseau sert au decalage horaire reel ;
 * la meteo est deduite localement (voir `weatherFor`) faute de service externe.
 */
export const cities: CityOption[] = [
  { id: 'paris', city: 'Paris', country: 'France', timeZone: 'Europe/Paris' },
  { id: 'lyon', city: 'Lyon', country: 'France', timeZone: 'Europe/Paris' },
  { id: 'marseille', city: 'Marseille', country: 'France', timeZone: 'Europe/Paris' },
  { id: 'bruxelles', city: 'Bruxelles', country: 'Belgique', timeZone: 'Europe/Brussels' },
  { id: 'geneve', city: 'Genève', country: 'Suisse', timeZone: 'Europe/Zurich' },
  { id: 'londres', city: 'Londres', country: 'Royaume-Uni', timeZone: 'Europe/London' },
  { id: 'madrid', city: 'Madrid', country: 'Espagne', timeZone: 'Europe/Madrid' },
  { id: 'lisbonne', city: 'Lisbonne', country: 'Portugal', timeZone: 'Europe/Lisbon' },
  { id: 'rome', city: 'Rome', country: 'Italie', timeZone: 'Europe/Rome' },
  { id: 'berlin', city: 'Berlin', country: 'Allemagne', timeZone: 'Europe/Berlin' },
  { id: 'casablanca', city: 'Casablanca', country: 'Maroc', timeZone: 'Africa/Casablanca' },
  { id: 'alger', city: 'Alger', country: 'Algérie', timeZone: 'Africa/Algiers' },
  { id: 'tunis', city: 'Tunis', country: 'Tunisie', timeZone: 'Africa/Tunis' },
  { id: 'dakar', city: 'Dakar', country: 'Sénégal', timeZone: 'Africa/Dakar' },
  { id: 'abidjan', city: 'Abidjan', country: "Côte d'Ivoire", timeZone: 'Africa/Abidjan' },
  { id: 'douala', city: 'Douala', country: 'Cameroun', timeZone: 'Africa/Douala' },
  { id: 'montreal', city: 'Montréal', country: 'Canada', timeZone: 'America/Toronto' },
  { id: 'quebec', city: 'Québec', country: 'Canada', timeZone: 'America/Toronto' },
  { id: 'newyork', city: 'New York', country: 'États-Unis', timeZone: 'America/New_York' },
  { id: 'losangeles', city: 'Los Angeles', country: 'États-Unis', timeZone: 'America/Los_Angeles' },
  { id: 'saopaulo', city: 'São Paulo', country: 'Brésil', timeZone: 'America/Sao_Paulo' },
  { id: 'dubai', city: 'Dubaï', country: 'Émirats', timeZone: 'Asia/Dubai' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thaïlande', timeZone: 'Asia/Bangkok' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japon', timeZone: 'Asia/Tokyo' },
  { id: 'seoul', city: 'Séoul', country: 'Corée du Sud', timeZone: 'Asia/Seoul' },
  { id: 'sydney', city: 'Sydney', country: 'Australie', timeZone: 'Australia/Sydney' },
  { id: 'reunion', city: 'Saint-Denis', country: 'La Réunion', timeZone: 'Indian/Reunion' },
  { id: 'fortdefrance', city: 'Fort-de-France', country: 'Martinique', timeZone: 'America/Martinique' },
];

export function findCity(city: string): CityOption | undefined {
  return cities.find((item) => item.city.toLowerCase() === city.toLowerCase());
}

const conditions: Weather[] = [
  { label: 'Grand soleil', icon: '☀️', temp: 24 },
  { label: 'Quelques nuages', icon: '⛅', temp: 19 },
  { label: 'Couvert', icon: '☁️', temp: 15 },
  { label: 'Pluie fine', icon: '🌧️', temp: 12 },
  { label: 'Orageux', icon: '⛈️', temp: 17 },
  { label: 'Brume', icon: '🌫️', temp: 10 },
  { label: 'Neige', icon: '❄️', temp: -2 },
];

/**
 * Meteo « plausible » et stable : elle depend de la ville et du jour, donc les
 * deux partenaires voient exactement la meme chose. A remplacer par un appel a
 * un service meteo le jour ou l'app a un serveur (voir README).
 */
export function weatherFor(city: string, date = new Date()): Weather {
  const day = Math.floor(date.getTime() / 86400000);
  let hash = day;
  for (let index = 0; index < city.length; index += 1) {
    hash = (hash * 31 + city.charCodeAt(index)) % 100000;
  }
  const base = conditions[Math.abs(hash) % conditions.length];
  const drift = (Math.abs(hash >> 3) % 9) - 4;
  return { ...base, temp: base.temp + drift };
}

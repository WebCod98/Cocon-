export function timeIn(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone
  }).format(date);
}

export function hourIn(timeZone: string, date = new Date()) {
  const value = new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    hour12: false,
    timeZone
  }).format(date);
  return Number(value.replace(/\D/g, ''));
}

export function dayLabelIn(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone
  }).format(date);
}

export type Moment = 'morning' | 'evening';

export function momentForHour(hour: number): Moment {
  return hour >= 5 && hour < 17 ? 'morning' : 'evening';
}

export function nextOccurrence(month: number, day: number, from = new Date()) {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day, 0, 0, 0);
  if (candidate.getTime() < new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) {
    return new Date(year + 1, month - 1, day, 0, 0, 0);
  }
  return candidate;
}

export function daysUntil(target: Date, from = new Date()) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round((target.getTime() - start) / 86400000);
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function countdownTo(target: Date, from = new Date()): Countdown {
  const diff = Math.max(0, target.getTime() - from.getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff % 86400000 / 3600000),
    minutes: Math.floor(diff % 3600000 / 60000),
    seconds: Math.floor(diff % 60000 / 1000)
  };
}

export function hoursLeftFrom(postedAt: number, windowHours = 24, now = Date.now()) {
  const remaining = postedAt + windowHours * 3600000 - now;
  return {
    expired: remaining <= 0,
    hours: Math.max(0, Math.floor(remaining / 3600000)),
    minutes: Math.max(0, Math.floor(remaining % 3600000 / 60000))
  };
}
/* --------------------------------------------------------------------------
 * Ajouts Cocon : cle de journee par fuseau, compteur d'amour et jalons.
 * ------------------------------------------------------------------------ */

/** « 2026-08-07 » dans le fuseau demande — sert a savoir si c'est un jour neuf. */
export function dateKeyIn(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(date);
}

/** Decalage en heures entre deux fuseaux, a l'instant donne. */
export function offsetBetween(a: string, b: string, date = new Date()) {
  const read = (timeZone: string) =>
    Number(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone,
      }).format(date)
    );
  let diff = read(b) - read(a);
  if (diff > 12) diff -= 24;
  if (diff < -12) diff += 24;
  return diff;
}

export interface LoveDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

/** Duree exacte de la relation, decomposee comme un calendrier. */
export function loveDuration(since: string, now = new Date()): LoveDuration {
  const start = new Date(`${since}T00:00:00`);
  if (Number.isNaN(start.getTime()) || start > now) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += previousMonth;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return { years, months, days, hours, minutes, seconds, totalDays };
}

/** Date exacte du n-ieme jour de la relation. */
export function dayNumberDate(since: string, dayCount: number) {
  const start = new Date(`${since}T00:00:00`);
  return new Date(start.getTime() + dayCount * 86400000);
}

/** Formatage court « 12 sept. 2026 ». */
export function shortDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function longDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** « il y a 3 h », « à l'instant »… */
export function relativeFrom(timestamp: number, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  return `il y a ${days} jours`;
}

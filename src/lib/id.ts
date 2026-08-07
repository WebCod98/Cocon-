/** Identifiants courts, uniques a l'echelle d'un couple. */
export function uid(prefix = 'x') {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

/** Le Code d'Amour a 6 chiffres genere a l'inscription. */
export function makeLoveCode() {
  const buffer = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    buffer[0] = Math.floor(Math.random() * 1e9);
  }
  return String(100000 + (buffer[0] % 900000));
}

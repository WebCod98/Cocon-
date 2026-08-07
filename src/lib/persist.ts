/**
 * Persistance locale. Les Polaroid et les notes vocales sont stockes en
 * dataURL : on garde donc un oeil sur le quota et on purge en cas de dépassement.
 */

export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota depasse : on previent l'appelant pour qu'il allege le document.
    return false;
  }
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* rien a faire */
  }
}

export const KEYS = {
  doc: (loveCode: string) => `cocon.doc.${loveCode}`,
  settings: 'cocon.settings',
  session: 'cocon.session',
  theme: 'cocon.theme',
} as const;

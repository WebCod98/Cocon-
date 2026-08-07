/** Remplace {me} et {them} par les prenoms du couple. */
export function fillNames(template: string, me: string, them: string) {
  return template.replace(/\{me\}/g, me).replace(/\{them\}/g, them);
}

/** Melange stable : la meme graine donne toujours le meme ordre. */
export function shuffle<T>(items: T[], seed = Date.now()): T[] {
  const copy = [...items];
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 16807) % 2147483647;
    const swap = state % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/** Compare deux saisies libres : sans accents, sans ponctuation, sans casse. */
export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Genere les icones PNG de la PWA sans dependance externe.
 *
 * Le dessin est celui de l'app : un carre arrondi rose poudre et un coeur
 * corail, trace via l'equation implicite du coeur (x² + y² − 1)³ − x²y³ ≤ 0.
 * Les pixels sont sur-echantillonnes 3× puis moyennes, ce qui lisse les bords.
 *
 *   node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../public/icons');

const COLORS = {
  frost: [251, 231, 238],
  coral: [232, 116, 143],
  night: [74, 47, 60],
  paper: [255, 246, 248],
};

/** Encodage PNG minimal : IHDR + IDAT (filtre 0) + IEND. */
function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0; // filtre « None »
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const crcTable = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buffer) => {
    let c = 0xffffffff;
    for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profondeur
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Vrai si (x, y), normalise dans [-1, 1], tombe dans le coeur. */
function insideHeart(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function insideRoundedSquare(x, y, radius) {
  const dx = Math.max(Math.abs(x) - (1 - radius), 0);
  const dy = Math.max(Math.abs(y) - (1 - radius), 0);
  return Math.hypot(dx, dy) <= radius;
}

/**
 * @param {number} size        cote en pixels
 * @param {object} options     background/foreground/heartScale/padding
 */
function drawIcon(size, { background, foreground, heartScale = 0.62, square = true }) {
  const rgba = Buffer.alloc(size * size * 4);
  const samples = 3;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let bg = 0;
      let fg = 0;

      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const x = ((px + (sx + 0.5) / samples) / size) * 2 - 1;
          const y = ((py + (sy + 0.5) / samples) / size) * 2 - 1;

          if (square ? insideRoundedSquare(x, y, 0.42) : Math.hypot(x, y) <= 1) bg += 1;

          // Le coeur est centre puis legerement remonte pour l'equilibre optique.
          const hx = x / heartScale;
          const hy = -(y + 0.06) / heartScale;
          if (insideHeart(hx, hy)) fg += 1;
        }
      }

      const total = samples * samples;
      const bgAlpha = bg / total;
      const fgAlpha = fg / total;
      const offset = (py * size + px) * 4;

      const mix = (channel) =>
        Math.round(background[channel] * (1 - fgAlpha) + foreground[channel] * fgAlpha);

      rgba[offset] = mix(0);
      rgba[offset + 1] = mix(1);
      rgba[offset + 2] = mix(2);
      rgba[offset + 3] = Math.round(Math.max(bgAlpha, fgAlpha) * 255);
    }
  }

  return encodePNG(size, size, rgba);
}

mkdirSync(outDir, { recursive: true });

const files = [
  ['icon-192.png', drawIcon(192, { background: COLORS.frost, foreground: COLORS.coral })],
  ['icon-512.png', drawIcon(512, { background: COLORS.frost, foreground: COLORS.coral })],
  // Maskable : le coeur reste dans la zone sûre centrale (80 %).
  ['maskable-512.png', drawIcon(512, { background: COLORS.coral, foreground: COLORS.paper, heartScale: 0.46 })],
  ['apple-touch-icon.png', drawIcon(180, { background: COLORS.frost, foreground: COLORS.coral })],
  ['badge-72.png', drawIcon(72, { background: COLORS.night, foreground: COLORS.paper, heartScale: 0.7 })],
];

for (const [name, buffer] of files) {
  writeFileSync(resolve(outDir, name), buffer);
  console.log(`${name} — ${(buffer.length / 1024).toFixed(1)} Ko`);
}

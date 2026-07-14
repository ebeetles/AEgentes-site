/**
 * Renders public/og.png (1200×630) from an inline SVG.
 * Run after changing the brand:  node scripts/og.mjs
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const W = 1200, H = 630;
const pine = '#1c3a2e', bottle = '#0f251d', plaster = '#eff0e2', brass = '#d8b25c', signal = '#e04a22';

const word = 'ÆGENTES';
const cellW = 92, cellH = 128, gap = 10;
const rowW = word.length * cellW + (word.length - 1) * gap;
const x0 = (W - rowW) / 2, y0 = 210;

const cells = [...word]
  .map((ch, i) => {
    const x = x0 + i * (cellW + gap);
    return `
      <rect x="${x}" y="${y0}" width="${cellW}" height="${cellH}" rx="10" fill="${bottle}"/>
      <rect x="${x}" y="${y0}" width="${cellW}" height="${cellH / 2}" rx="10" fill="#12291f"/>
      <text x="${x + cellW / 2}" y="${y0 + cellH / 2}" text-anchor="middle" dominant-baseline="central"
        font-family="Menlo, 'DejaVu Sans Mono', monospace" font-weight="700" font-size="72" fill="${plaster}">${ch === '&' ? '&amp;' : ch}</text>
      <rect x="${x}" y="${y0 + cellH / 2 - 1.5}" width="${cellW}" height="3" fill="rgba(0,0,0,0.6)"/>`;
  })
  .join('');

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${pine}"/>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="${brass}" stroke-width="2.5" opacity="0.6" rx="6"/>
  <text x="${W / 2}" y="150" text-anchor="middle" font-family="Menlo, 'DejaVu Sans Mono', monospace" font-size="26" letter-spacing="14" fill="${brass}">WEB STUDIO — EST. 2026</text>
  ${cells}
  <circle cx="${W / 2 - 250}" cy="440" r="7" fill="${signal}"/>
  <text x="${W / 2 - 228}" y="440" dominant-baseline="central" font-family="Menlo, 'DejaVu Sans Mono', monospace" font-size="27" letter-spacing="6" fill="${plaster}">WEBSITES FOR SMALL BUSINESSES</text>
  <text x="${W / 2}" y="530" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="${brass}">aegentes.com</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(new URL('../public/og.png', import.meta.url), png);
console.log('public/og.png written', png.length, 'bytes');

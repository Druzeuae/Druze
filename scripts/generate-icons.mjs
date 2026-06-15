// Generates PWA / mobile app icons from the DRUZE UAE logo mark.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, "..", "public");
mkdirSync(pub, { recursive: true });

// Full-bleed app icon (512x512): purple gradient background + centered white "D" + gold star.
// Background fills the whole square so it works as an Android maskable icon and iOS icon.
const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4C2A85"/>
      <stop offset="50%" stop-color="#6C449E"/>
      <stop offset="100%" stop-color="#8B63CC"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4C2A85"/>
      <stop offset="50%" stop-color="#6C449E"/>
      <stop offset="100%" stop-color="#8B63CC"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#F0D375"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(96,96) scale(8)">
    <path d="M11 9.5C11 8.67157 11.6716 8 12.5 8H18.5C24.8513 8 30 13.1487 30 19.5V20.5C30 26.8513 24.8513 32 18.5 32H12.5C11.6716 32 11 31.3284 11 30.5V9.5Z" fill="#FBF8FF"/>
    <path d="M16.5 12.5H18.5C22.6421 12.5 26 15.8579 26 20C26 24.1421 22.6421 27.5 18.5 27.5H16.5V12.5Z" fill="url(#brand)"/>
    <path d="M30.5 4.5L31.6 7.05L34.3 7.4L32.35 9.3L32.85 12L30.5 10.7L28.15 12L28.65 9.3L26.7 7.4L29.4 7.05L30.5 4.5Z" fill="url(#gold)"/>
  </g>
</svg>`;

const buf = Buffer.from(iconSvg);

const targets = [
  { file: "pwa-192x192.png", size: 192 },
  { file: "pwa-512x512.png", size: 512 },
  { file: "pwa-maskable-512x512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  await sharp(buf).resize(t.size, t.size).png().toFile(resolve(pub, t.file));
  console.log(`generated ${t.file} (${t.size}x${t.size})`);
}
console.log("done");

import fs from 'fs';
import path from 'path';

const base64Png = 'iVBOR0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

const iconsDir = path.join('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  fs.writeFileSync(path.join(iconsDir, `${size}.png`), buffer);
  console.log(`Created ${size}.png`);
});

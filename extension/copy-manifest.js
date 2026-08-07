import fs from 'fs';
import path from 'path';

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy manifest.json
fs.copyFileSync('manifest.json', 'dist/manifest.json');
console.log('Copied manifest.json to dist/manifest.json');

// Copy icons
const srcIcons = path.join('public', 'icons');
const destIcons = path.join('dist', 'icons');

if (!fs.existsSync(destIcons)) {
  fs.mkdirSync(destIcons, { recursive: true });
}

fs.readdirSync(srcIcons).forEach((file) => {
  fs.copyFileSync(path.join(srcIcons, file), path.join(destIcons, file));
});
console.log('Copied extension icons to dist/icons/');

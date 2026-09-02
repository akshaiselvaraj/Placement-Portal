import fs from 'fs';
import path from 'path';

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy manifest.json to dist
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

// Sync dist compiled JS files back to root directory so loading root extension directory works identically
if (fs.existsSync('dist/popup.js')) {
  fs.copyFileSync('dist/popup.js', 'popup.js');
}
if (fs.existsSync('dist/popup.html')) {
  fs.copyFileSync('dist/popup.html', 'popup.html');
}
if (fs.existsSync('dist/background.js')) {
  fs.copyFileSync('dist/background.js', 'background.js');
}
if (fs.existsSync('dist/content.js')) {
  fs.copyFileSync('dist/content.js', 'content.js');
}
console.log('Synced dist JS files to extension root directory.');

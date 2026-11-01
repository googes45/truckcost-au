import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const webDir = resolve(root, 'www');
const files = [
  'index.html',
  'cloud-auth.js',
  'sw.js',
  'manifest.webmanifest',
  'privacy.html',
  'terms.html',
  'icons',
];

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
for (const file of files) {
  await cp(resolve(root, file), resolve(webDir, file), { recursive: true });
}
console.log('Prepared Capacitor web assets in ./www');

import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../www/index.html', import.meta.url);
let html = await readFile(path, 'utf8');
if (!html.includes('native-bridge.js')) {
  html = html.replace('<head>', '<head>\n<script src="./native-bridge.js"></script>');
  await writeFile(path, html);
}
console.log('Injected native bridge into Capacitor app shell');

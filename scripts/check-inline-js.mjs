import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes]) => !/\bsrc\s*=/.test(attributes))
  .map(([, , source], index) => ({ filename: `index.html:inline-script-${index + 1}`, source }));

for (const item of inlineScripts) new vm.Script(item.source, { filename: item.filename });
const cloudAuth = await readFile(new URL('../cloud-auth.js', import.meta.url), 'utf8');
new vm.Script(cloudAuth, { filename: 'cloud-auth.js' });
console.log(`Syntax OK: ${inlineScripts.length} inline script(s) and cloud-auth.js`);

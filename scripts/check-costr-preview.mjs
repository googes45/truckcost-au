import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = fs.readFileSync(new URL('../previews/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(script, 'preview script must exist');
new vm.Script(script[1], { filename: 'previews/index.html' });
for (const text of ['HeavyCostr AU', 'RailCostr AU', 'AeroCostr AU', 'Calculate estimated margin', 'No customer data']) {
  assert.ok(html.includes(text), 'Missing preview element: ' + text);
}
for (const field of ['type="number"', 'min=', 'required']) {
  assert.ok(html.includes(field), 'Missing input validation: ' + field);
}
console.log('COSTR preview source and JavaScript syntax passed');

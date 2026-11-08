import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const fileUrl = pathToFileURL(path.resolve('previews/index.html')).href;
  await page.goto(fileUrl);

  async function assertProfit(kind, expectedProfit, expectedUnitCost) {
    await page.locator('[data-kind="' + kind + '"]').click();
    await page.getByRole('button', { name: 'Calculate estimated margin' }).click();
    const results = await page.locator('#results').innerText();
    assert.ok(results.includes(expectedProfit), kind + ': expected profit ' + expectedProfit + ', got ' + results);
    assert.ok(results.includes(expectedUnitCost), kind + ': expected unit cost ' + expectedUnitCost + ', got ' + results);
  }

  await assertProfit('heavy', '$500.00', '$100.00');
  await assertProfit('rail', '$3,000.00', '$0.01');
  await assertProfit('aero', '$600.00', '$600.00');

  await page.locator('[data-kind="heavy"]').click();
  await page.locator('input[name="hours"]').fill('0');
  await page.getByRole('button', { name: 'Calculate estimated margin' }).click();
  assert.equal(await page.locator('#results').innerText(), '', 'zero hours must not yield results');

  await page.locator('input[name="hours"]').fill('10');
  await page.locator('input[name="revenue"]').fill('0');
  await page.getByRole('button', { name: 'Calculate estimated margin' }).click();
  assert.ok((await page.locator('#results').innerText()).includes('N/A'), 'zero revenue margin should be N/A');
  assert.deepEqual(errors, [], 'browser JavaScript errors');
  console.log('COSTR browser smoke tests passed');
} finally {
  await browser.close();
}

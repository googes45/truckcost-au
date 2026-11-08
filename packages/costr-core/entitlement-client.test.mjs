import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEntitlementDisplay } from './entitlement-client.mjs';
const opts = { projectUrl: 'https://yxbuafwhfyxyrfvzbzpb.supabase.co', accessToken: 'session-token', publishableKey: 'public-key', now: Date.parse('2026-11-09T00:00:00Z') };
test('authenticated GET maps verified server snapshot', async () => {
  let called = false;
  const value = await loadEntitlementDisplay({ ...opts, fetchImpl: async (url, init) => {
    called = true;
    assert.equal(url, opts.projectUrl + '/functions/v1/billing-entitlement');
    assert.equal(init.headers.Authorization, 'Bearer session-token');
    assert.equal(init.cache, 'no-store');
    assert.equal(init.credentials, 'omit');
    assert.equal(init.redirect, 'error');
    return { ok: true, json: async () => ({ entitlement: { plan: 'diary', subscription_status: 'active', period_end: '2026-12-09T00:00:00Z' } }) };
  }});
  assert.ok(called);
  assert.equal(value.plan, 'diary');
});
test('errors and missing auth fall back to free', async () => {
  for (const fetchImpl of [
    async () => ({ ok: false }),
    async () => { throw new Error('offline'); },
    async () => ({ ok: true, json: async () => { throw new Error('bad json'); } })
  ]) assert.equal((await loadEntitlementDisplay({ ...opts, fetchImpl })).plan, 'free');
  assert.equal((await loadEntitlementDisplay({ ...opts, accessToken: '', fetchImpl: () => { throw Error('should not call'); } })).plan, 'free');
});
test('invalid project URL is rejected', async () => {
  assert.equal((await loadEntitlementDisplay({ ...opts, projectUrl: 'https://evil.example' })).plan, 'free');
});

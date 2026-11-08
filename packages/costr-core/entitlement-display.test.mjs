import test from 'node:test';
import assert from 'node:assert/strict';
import { showPaidFeatures, validateEntitlementSnapshot } from './entitlement-display.mjs';
const now = Date.parse('2026-11-09T00:00:00Z');
test('verified-account snapshot can display active plan', () => {
  const value = showPaidFeatures({ user_id: 'u1', plan: 'owner', status: 'active', expires_at: '2026-12-09T00:00:00Z' }, 'u1', now);
  assert.equal(value.plan, 'owner');
  assert.ok(value.features.includes('advanced_costing'));
});
test('wrong account, expired, revoked and unknown plan show free', () => {
  for (const snapshot of [
    { user_id: 'u2', plan: 'fleet', status: 'active', expires_at: '2026-12-09T00:00:00Z' },
    { user_id: 'u1', plan: 'fleet', status: 'active', expires_at: '2026-11-08T00:00:00Z' },
    { user_id: 'u1', plan: 'fleet', status: 'revoked', expires_at: '2026-12-09T00:00:00Z' },
    { user_id: 'u1', plan: 'unknown', status: 'active', expires_at: '2026-12-09T00:00:00Z' }
  ]) assert.equal(showPaidFeatures(snapshot, 'u1', now).plan, 'free');
});
test('missing expiry is not valid for paid plans', () => {
  assert.throws(() => validateEntitlementSnapshot({ user_id: 'u1', plan: 'diary', status: 'active' }, 'u1', now));
});
test('free tier has no paid capabilities', () => {
  assert.deepEqual(showPaidFeatures({ user_id: 'u1', plan: 'free' }, 'u1', now).features, ['basic_costing']);
});

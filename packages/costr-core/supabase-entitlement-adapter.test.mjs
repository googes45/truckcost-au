import test from 'node:test';
import assert from 'node:assert/strict';
import { displayFromServerEntitlement } from './supabase-entitlement-adapter.mjs';
const now = Date.parse('2026-11-09T00:00:00Z');
test('maps existing Supabase response fields', () => {
  assert.equal(displayFromServerEntitlement({ plan:'owner', subscription_status:'active', period_end:'2026-12-09T00:00:00Z' },now).plan,'owner');
  assert.equal(displayFromServerEntitlement({ plan:'fleet', subscription_status:'cancelled', period_end:'2026-12-09T00:00:00Z' },now).plan,'fleet');
});
test('lifetime grant and expired subscriptions', () => {
  assert.equal(displayFromServerEntitlement({ plan:'lifetime_free', lifetime_free:true },now).lifetimeFree,true);
  assert.equal(displayFromServerEntitlement({ plan:'lifetime_free', lifetime_free:false },now).plan,'free');
  assert.equal(displayFromServerEntitlement({ plan:'diary', subscription_status:'active', period_end:'2026-11-08T00:00:00Z' },now).plan,'free');
});
test('revoked, unknown and malformed responses fail closed', () => {
  for(const p of [null,{}, {plan:'fleet',subscription_status:'revoked',period_end:'2026-12-09T00:00:00Z'}, {plan:'fleet',subscription_status:'active',period_end:'bad'}]) {
    assert.equal(displayFromServerEntitlement(p,now).plan,'free');
  }
});

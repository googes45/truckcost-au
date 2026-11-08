// Shared client-side display policy only. NOT payment verification or an access-control boundary.
// Server must verify store transactions and return a signed-in account's entitlements.
export const PLAN_FEATURES = Object.freeze({
  free: Object.freeze(['basic_costing']),
  diary: Object.freeze(['basic_costing', 'manual_diary']),
  owner: Object.freeze(['basic_costing', 'manual_diary', 'advanced_costing']),
  fleet: Object.freeze(['basic_costing', 'manual_diary', 'advanced_costing', 'fleet_workspace'])
});
const ORDER = Object.freeze(['free', 'diary', 'owner', 'fleet']);
export function validateEntitlementSnapshot(snapshot, expectedUserId, now = Date.now()) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new TypeError('invalid entitlement snapshot');
  if (typeof expectedUserId !== 'string' || !expectedUserId) throw new TypeError('expectedUserId required');
  if (snapshot.user_id !== expectedUserId) throw new Error('entitlement belongs to another user');
  if (!ORDER.includes(snapshot.plan)) throw new Error('unrecognised entitlement plan');
  if (snapshot.plan !== 'free') {
    if (snapshot.status !== 'active' && snapshot.status !== 'grace') throw new Error('paid entitlement not active');
    const expiry = Date.parse(snapshot.expires_at);
    if (!Number.isFinite(expiry) || expiry <= now) throw new Error('entitlement expired');
  }
  return { plan: snapshot.plan, features: [...PLAN_FEATURES[snapshot.plan]] };
}
export function showPaidFeatures(snapshot, expectedUserId, now = Date.now()) {
  try { return validateEntitlementSnapshot(snapshot, expectedUserId, now); }
  catch { return { plan: 'free', features: [...PLAN_FEATURES.free] }; }
}

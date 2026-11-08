// Adapter for the existing TruckingCostr AU Supabase billing-entitlement response.
// DISPLAY ONLY. The backend must verify purchases and enforce paid access.
import { PLAN_FEATURES } from './entitlement-display.mjs';
const PLANS = new Set(['free','diary','owner','fleet','lifetime_free']);
const STATUSES = new Set(['active','grace_period','cancelled']);
export function displayFromServerEntitlement(payload, now = Date.now()) {
  const fallback = { plan: 'free', features: [...PLAN_FEATURES.free], lifetimeFree: false };
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !PLANS.has(payload.plan)) return fallback;
  if (payload.plan === 'free') return fallback;
  if (payload.plan === 'lifetime_free') {
    if (payload.lifetime_free !== true) return fallback;
    return { plan: 'lifetime_free', features: [...PLAN_FEATURES.fleet], lifetimeFree: true };
  }
  if (!STATUSES.has(payload.subscription_status)) return fallback;
  const end = typeof payload.period_end === 'string' ? Date.parse(payload.period_end) : NaN;
  if (!Number.isFinite(end) || end <= now) return fallback;
  return { plan: payload.plan, features: [...PLAN_FEATURES[payload.plan]], lifetimeFree: false };
}

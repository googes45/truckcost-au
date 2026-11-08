// Browser-side fetch for the deployed, authenticated Supabase billing-entitlement function.
// This does not verify purchases or enforce access: those are server responsibilities.
import { displayFromServerEntitlement } from './supabase-entitlement-adapter.mjs';

export async function loadEntitlementDisplay({ projectUrl, accessToken, publishableKey, fetchImpl = fetch, signal, now = Date.now() }) {
  const free = displayFromServerEntitlement(null, now);
  if (typeof projectUrl !== 'string' || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(projectUrl)) return free;
  if (typeof accessToken !== 'string' || !accessToken.trim() || typeof publishableKey !== 'string' || !publishableKey.trim()) return free;
  try {
    const response = await fetchImpl(projectUrl.replace(/\/$/, '') + '/functions/v1/billing-entitlement', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + accessToken, apikey: publishableKey, Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal
    });
    if (!response.ok) return free;
    const payload = await response.json();
    return displayFromServerEntitlement(payload, now);
  } catch {
    // Network, malformed JSON, and abort errors all fail closed.
    return free;
  }
}

'use strict';
(() => {
  const URL = 'https://yxbuafwhfyxyrfvzbzpb.supabase.co';
  const KEY = 'sb_publishable_7Bf7EPeN_AsCz1ZQbPcc3w_WeHDUDgK';
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return;
  const client = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let session = null, timer = null, syncing = false, pending = false, lifetimeFree = false, recoveringPassword = false;
  const login = document.getElementById('login');
  const app = document.getElementById('app');
  const originalSave = window.save;
  // Recovery links can establish a session before the PASSWORD_RECOVERY event is delivered.
  // Keep the password form visible until the user chooses a new password.
  const recoveryLink = /(?:[?#&])type=recovery(?:[&#]|$)/.test(location.href);
  if (recoveryLink) recoveringPassword = true;
  function message(text) { const el = document.getElementById('cloudAuthMessage'); if (el) el.textContent = text; }
  function status(text) { const el = document.getElementById('cloudStatus'); if (el) el.textContent = text; }
  function showLogin() { if (app) app.classList.add('hidden'); if (login) { login.classList.remove('hidden'); login.innerHTML = '<div class="loginbox"><div class="logo">TruckingCostr <span>AU</span></div><div class="eyebrow">Know what your truck really costs.</div><h2>Driver account</h2><p class="muted">If you have been invited to lifetime free access, create your account using the exact email address the owner invited. Your access will be recognised automatically.</p><div class="field"><label>Email address</label><input id="cloudEmail" type="email" autocomplete="email" placeholder="you@example.com"></div><div class="field"><label>Password</label><input id="cloudPassword" type="password" autocomplete="current-password" minlength="8" placeholder="At least 8 characters"></div><button id="cloudSignIn" class="btn" style="width:100%">Sign in</button><button id="cloudSignUp" class="btn secondary" style="width:100%;margin-top:8px">Create account</button><button id="cloudReset" class="btn secondary" style="width:100%;margin-top:8px">Forgot password?</button><button id="cloudResume" class="btn" style="width:100%;margin-top:8px;display:none">Resume saved workspace</button><button id="cloudDemo" class="btn secondary" style="width:100%;margin-top:8px">Start fresh demo workspace</button><p id="cloudAuthMessage" class="small muted" role="status" aria-live="polite"></p><p class="small"><a href="privacy.html">Privacy policy</a> · <a href="terms.html">Terms of use</a> · <a href="https://github.com/googes45/truckcost-au/issues" target="_blank" rel="noopener">Report a problem</a></p></div>'; document.getElementById('cloudSignIn').onclick = () => auth('signin'); document.getElementById('cloudSignUp').onclick = () => auth('signup'); document.getElementById('cloudReset').onclick = () => auth('reset'); const resume = document.getElementById('cloudResume'); const saved = state && state.user && ['demo@truckingcostr.au','Local operator'].includes(state.user.email); if (saved) { resume.style.display = 'block'; resume.onclick = () => window.showApp(); } document.getElementById('cloudDemo').onclick = () => { if (saved && !confirm('Start a fresh demo? This replaces the saved browser workspace, including your test jobs. Export a backup first if you need them.')) return; if (typeof window.createDemo === 'function') window.createDemo(); }; } }
  async function auth(mode) {
    const email = document.getElementById('cloudEmail').value.trim();
    const password = document.getElementById('cloudPassword').value;
    if (!email) return message('Enter your email address.');
    if (mode !== 'reset' && password.length < 8) return message('Enter a password of at least 8 characters.');
    const redirectTo = window.TruckingCostrNative?.isNative ? 'truckingcostrau://auth/callback' : location.origin + location.pathname;
    message(mode === 'signup' ? 'Creating account…' : mode === 'reset' ? 'Sending password reset link…' : 'Signing in…');
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        return message('Password reset link sent. Check your email.');
      }
      const result = mode === 'signup'
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
        : await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (result.data.session) await loadWorkspace(result.data.session);
      else message('Account created. Check your email for the confirmation link, then sign in here.');
    } catch (e) {
      message(e.message || 'Authentication failed.');
    }
  }
  function showPasswordRecovery() {
    if (app) app.classList.add('hidden');
    if (!login) return;
    login.classList.remove('hidden');
    login.innerHTML = '<div class="loginbox"><div class="logo">TruckingCostr <span>AU</span></div><h2>Choose a new password</h2><p class="muted">Use at least 8 characters. This updates the password for your account.</p><div class="field"><label>New password</label><input id="newPassword" type="password" autocomplete="new-password" minlength="8"></div><button id="saveNewPassword" class="btn" style="width:100%">Save new password</button><p id="cloudAuthMessage" class="small muted" role="status" aria-live="polite"></p></div>';
    document.getElementById('saveNewPassword').onclick = async () => {
      const nextPassword = document.getElementById('newPassword').value;
      if (nextPassword.length < 8) return message('Use at least 8 characters.');
      message('Updating password…');
      try {
        const { error } = await client.auth.updateUser({ password: nextPassword });
        if (error) throw error;
        recoveringPassword = false;
        if (recoveryLink) history.replaceState(null, '', location.pathname);
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (data.session) await loadWorkspace(data.session);
        else message('Password updated. Sign in with your new password.');
      } catch (e) {
        message(e.message || 'Could not update password.');
      }
    };
  }
  function hasLocalData() { return ['vehicles','jobs','expenses','maintenance','tyres','trips','diaryEntries','weighReports','jokes','atoReminders'].some(k => Array.isArray(state[k]) && state[k].length); }
  async function sync() { if (!session) return; if (syncing) { pending = true; return; } syncing = true; try { const payload = Object.assign({}, state, { user: { email: session.user.email || '', id: session.user.id } }); const { error } = await client.from('user_workspaces').upsert({ user_id: session.user.id, workspace: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); if (error) throw error; status(lifetimeFree ? '★ LIFETIME FREE ACCESS' : '● CLOUD SYNCED'); } catch (e) { status('● SYNC ISSUE'); console.error('TruckingCostr cloud sync failed', e); } finally { syncing = false; if (pending) { pending = false; sync(); } } }
  async function loadWorkspace(nextSession) { session = nextSession; status('● LOADING CLOUD'); try { const { data, error } = await client.from('user_workspaces').select('workspace').eq('user_id', session.user.id).maybeSingle(); if (error) throw error; if (data && data.workspace && Object.keys(data.workspace).length) { state = normalise(data.workspace); state.user = { email: session.user.email || '', id: session.user.id }; originalSave(); } else { if (hasLocalData() && confirm('This account has no cloud data yet. Upload the records currently saved on this device? Choose Cancel to start with an empty cloud workspace.')) { state.user = { email: session.user.email || '', id: session.user.id }; } else { state = emptyState(); state.user = { email: session.user.email || '', id: session.user.id }; } await sync(); } const { data: grant, error: grantError } = await client.from('lifetime_access_grants').select('grant_type,reason,granted_at').eq('user_id', session.user.id).maybeSingle(); if (grantError) throw grantError; lifetimeFree = !!grant && grant.grant_type === 'lifetime_free'; window.showApp(); status(lifetimeFree ? '★ LIFETIME FREE ACCESS' : '● CLOUD SYNCED'); } catch (e) { session = null; status('● CLOUD ERROR'); showLogin(); message('Could not load your cloud workspace: ' + (e.message || 'Try again.')); } }
  window.save = function () { originalSave(); if (session) { clearTimeout(timer); timer = setTimeout(sync, 900); } };
  window.signOut = async function () { const { error } = await client.auth.signOut(); if (error) message(error.message); };
  window.deleteAccount = async function () {
    if (!session) return message('Sign in before requesting account deletion.');
    if (!confirm('Permanently delete your TruckingCostr AU account and its cloud workspace? This cannot be undone. Export a backup first if you want to keep your records.')) return;
    message('Deleting your account and cloud data…');
    try {
      const { error } = await client.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
      session = null;
      lifetimeFree = false;
      try { await client.auth.signOut({ scope: 'local' }); } catch (_) {}
      localStorage.removeItem('truckcost_au_v1');
      state = emptyState();
      showLogin();
      message('Your account and cloud workspace have been deleted.');
    } catch (e) {
      message(e.message || 'Account deletion failed. Please try again or contact support.');
    }
  };
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') { session = null; lifetimeFree = false; state = emptyState(); originalSave(); showLogin(); }
    if (event === 'PASSWORD_RECOVERY') { recoveringPassword = true; showPasswordRecovery(); }
    if (event === 'SIGNED_IN' && recoveringPassword) showPasswordRecovery();
  });
  if (recoveringPassword) showPasswordRecovery(); else showLogin();
  client.auth.getSession().then(({ data, error }) => { if (error) return message(error.message); if (recoveringPassword) return showPasswordRecovery(); if (data.session) loadWorkspace(data.session); });
})();

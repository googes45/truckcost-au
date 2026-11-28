'use strict';
(() => {
  const URL = 'https://yxbuafwhfyxyrfvzbzpb.supabase.co';
  const KEY = 'sb_publishable_7Bf7EPeN_AsCz1ZQbPcc3w_WeHDUDgK';
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return;
  let backupAuthRequests = 0, backupAuthGeneration = 0, backupSessionKnown = false, backupAuthHasSession = false;
  // A file can finish reading after an account change; fail closed during auth.
  window.localBackupRestoreContext = () => backupSessionKnown && !backupAuthRequests && !backupAuthHasSession && !session && !recoveringPassword ? backupAuthGeneration : null;
  const client = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let session = null, workspace = null, timer = null, leaving = false, lifetimeFree = false, recoveringPassword = false;
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
    if (mode !== 'reset') { backupAuthRequests++; backupAuthGeneration++; }
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
    } finally {
      if (mode !== 'reset') backupAuthRequests--;
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
  function setSyncState(scope, label) {
    if (workspace === scope) status(label);
  }
  function invalidateWorkspace() {
    clearTimeout(timer);
    timer = null;
    workspace = null;
    session = null;
    lifetimeFree = false;
  }
  function markDirty(scope) {
    scope.revision++;
    setSyncState(scope, '● SYNC PENDING');
    clearTimeout(timer);
    timer = setTimeout(() => { if (!leaving) void sync(scope); }, 900);
  }
  function sync(scope = workspace) {
    if (!scope || workspace !== scope || !scope.ready || scope.saved === scope.revision) return Promise.resolve(true);
    if (scope.inFlight) return scope.inFlight;
    const revision = scope.revision;
    scope.inFlight = Promise.resolve().then(async () => {
      if (workspace !== scope || session?.user.id !== scope.user.id) return false;
      try {
        const payload = JSON.parse(JSON.stringify(state));
        payload.user = { email: scope.user.email || '', id: scope.user.id };
        const { error } = await client.from('user_workspaces').upsert({ user_id: scope.user.id, workspace: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        if (error) throw error;
        if (workspace !== scope) return false;
        scope.saved = revision;
        setSyncState(scope, scope.saved === scope.revision
          ? (lifetimeFree ? '★ LIFETIME FREE ACCESS' : '● CLOUD SYNCED')
          : '● SYNC PENDING');
        return true;
      } catch (e) {
        setSyncState(scope, '● SYNC ISSUE');
        console.error('TruckingCostr cloud sync failed', e);
        return false;
      }
    }).then(ok => {
      scope.inFlight = null;
      if (ok && workspace === scope && !leaving && scope.saved < scope.revision) void sync(scope);
      return ok;
    });
    return scope.inFlight;
  }
  async function loadWorkspace(nextSession) {
    if (workspace?.user.id === nextSession.user.id) return;
    invalidateWorkspace();
    if (app) app.classList.add('hidden');
    const scope = { user: nextSession.user, ready: false, revision: 0, saved: 0, inFlight: null };
    workspace = scope;
    session = nextSession;
    status('● LOADING CLOUD');
    try {
      const { data, error } = await client.from('user_workspaces').select('workspace').eq('user_id', scope.user.id).maybeSingle();
      if (workspace !== scope) return;
      if (error) throw error;
      const hasCloud = data?.workspace && Object.keys(data.workspace).length;
      const localOwner = state.user?.id;
      const isLocalDemo = !localOwner && ['demo@truckingcostr.au', 'Local operator'].includes(state.user?.email);
      const canImport = (localOwner === scope.user.id || isLocalDemo) && hasLocalData();
      if (hasCloud) state = normalise(data.workspace);
      else if (!canImport || !confirm('This account has no cloud data yet. Upload the records currently saved on this device? Choose Cancel to start with an empty cloud workspace.')) state = emptyState();
      state.user = { email: scope.user.email || '', id: scope.user.id };
      originalSave();
      const { data: grant, error: grantError } = await client.from('lifetime_access_grants').select('grant_type,reason,granted_at').eq('user_id', scope.user.id).maybeSingle();
      if (workspace !== scope) return;
      if (grantError) throw grantError;
      lifetimeFree = !!grant && grant.grant_type === 'lifetime_free';
      scope.ready = true;
      if (!hasCloud) markDirty(scope);
      window.showApp();
      if (scope.saved === scope.revision) status(lifetimeFree ? '★ LIFETIME FREE ACCESS' : '● CLOUD SYNCED');
    } catch (e) {
      if (workspace !== scope) return;
      invalidateWorkspace();
      status('● CLOUD ERROR');
      showLogin();
      message('Could not load your cloud workspace: ' + (e.message || 'Try again.'));
    }
  }
  window.save = function () {
    originalSave();
    if (workspace?.ready) markDirty(workspace);
  };
  window.signOut = async function () {
    if (leaving) return;
    const scope = workspace;
    if (scope && state.activeTrip?.status === 'recording') return toast('Finish or pause the active trip before signing out.');
    leaving = true;
    if (app) app.inert = true;
    clearTimeout(timer);
    let deadline;
    try {
      const timeout = new Promise(resolve => { deadline = setTimeout(() => resolve(false), 8000); });
      while (scope && workspace === scope && scope.saved < scope.revision) {
        if (!await Promise.race([sync(scope), timeout])) {
          setSyncState(scope, '● SYNC ISSUE');
          return toast('Your latest changes are not confirmed in the cloud. You are still signed in. Try again or export a backup.');
        }
      }
      if (scope && workspace !== scope) return;
      const { error } = await client.auth.signOut();
      if (error) throw error;
    } catch (e) {
      toast('Sign-out failed. Please try again.');
    } finally {
      clearTimeout(deadline);
      leaving = false;
      if (app) app.inert = false;
    }
  };
  window.deleteAccount = async function () {
    if (leaving) return;
    if (!session || !workspace?.ready) return message('Sign in before requesting account deletion.');
    if (!confirm('Permanently delete your TruckingCostr AU account and its cloud workspace? This cannot be undone. Export a backup first if you want to keep your records.')) return;
    const scope = workspace;
    leaving = true;
    if (app) app.inert = true;
    clearTimeout(timer);
    message('Deleting your account and cloud data…');
    try {
      if (scope.inFlight) await scope.inFlight;
      if (workspace !== scope) return;
      const { error } = await client.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
      invalidateWorkspace();
      try { await client.auth.signOut({ scope: 'local' }); } catch (_) {}
      localStorage.removeItem('truckcost_au_v1');
      state = emptyState();
      showLogin();
      message('Your account and cloud workspace have been deleted.');
    } catch (e) {
      const details = await e?.context?.json?.().catch(() => null);
      if (details?.error === 'cancel_subscription_before_deletion') {
        toast('Contact support to cancel your existing renewal before deleting your account.');
        return;
      }
      toast('Account deletion failed. Please try again or contact support.');
    } finally {
      leaving = false;
      if (app) app.inert = false;
    }
  };
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') { backupAuthGeneration++; backupAuthHasSession = false; invalidateWorkspace(); state = emptyState(); originalSave(); showLogin(); }
    if (event === 'PASSWORD_RECOVERY') { backupAuthGeneration++; recoveringPassword = true; showPasswordRecovery(); }
    if (event === 'SIGNED_IN') { backupAuthGeneration++; backupAuthHasSession = true; if (recoveringPassword) showPasswordRecovery(); }
  });
  if (recoveringPassword) showPasswordRecovery(); else showLogin();
  client.auth.getSession().then(({ data, error }) => { if (error) return message(error.message); backupSessionKnown = true; backupAuthHasSession ||= !!data.session; if (recoveringPassword) return showPasswordRecovery(); if (data.session) loadWorkspace(data.session); });
})();

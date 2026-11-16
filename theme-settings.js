'use strict';
/* TruckingCostr AU customer themes. All entitlements are read from RLS-protected Supabase rows. */
(() => {
 const api=window.TruckingCostrThemes;
 const URL='https://yxbuafwhfyxyrfvzbzpb.supabase.co';
 const KEY='sb_publishable_7Bf7EPeN_AsCz1ZQbPcc3w_WeHDUDgK';
 const client=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const css=document.createElement('style');
 css.textContent='body.theme-preview{--bg:var(--customer-bg);--panel:var(--customer-panel);--panel2:var(--customer-panel);--accent:var(--customer-accent);--text:var(--customer-text);background:var(--customer-bg)!important;color:var(--customer-text)!important}body.theme-preview .card{background:var(--customer-panel)!important}body.theme-preview .btn:not(.secondary):not(.danger){background:var(--customer-accent)!important;color:white!important}body.theme-preview .eyebrow{color:var(--customer-accent)!important}';
 document.head.appendChild(css);
 let entitled=false, saved='blue', activeUser=null;
 const note=t=>{const n=document.getElementById('themeNotice');if(n)n.textContent=t;};
 function paint(theme){api.preview(theme);document.body.classList.add('theme-preview');}
 async function load(){
  if(!client)return;
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user){activeUser=null;entitled=false;saved='blue';paint('blue');return;}
  activeUser=user.id;
  const [{data:billing,error:billingError},{data:pref,error:prefError}]=await Promise.all([
   client.from('billing_subscriptions').select('status,current_period_end').eq('user_id',user.id).maybeSingle(),
   client.from('customer_theme_preferences').select('theme').eq('user_id',user.id).maybeSingle()
  ]);
  if(billingError||prefError){entitled=false;paint('blue');note('Could not verify subscription. Premium themes remain locked.');return;}
  entitled=!!billing&&['active','trialing'].includes(billing.status)&&(!!billing.current_period_end&&Date.parse(billing.current_period_end)>Date.now());
  saved=pref?.theme||'blue';paint(api.effectiveTheme(saved,entitled));
  const select=document.getElementById('themeChoice');if(select)select.value=api.effectiveTheme(saved,entitled);
  note(entitled?'Subscription verified. Select a theme and save it.':'A verified active subscription is required to save a premium theme.');
  const btn=document.getElementById('themeSave');if(btn)btn.disabled=!entitled;
 }
 window.openThemeSettings=()=>{
  const c=document.getElementById('content');if(!c)return;
  c.innerHTML='<div class="hero"><div class="eyebrow">Account settings</div><h1>Appearance</h1><p class="muted">Choose your trucking colours.</p></div><div class="card"><div class="field"><label for="themeChoice">Colour scheme</label><select id="themeChoice"><option value="blue">Dark Blue & Silver</option><option value="gold">Black, Gold & Chrome</option><option value="red">Black, Red & White</option></select></div><p id="themeNotice" class="small muted" role="status">Checking your subscription…</p><div class="actions"><button class="btn" id="themeSave" disabled>Save appearance</button><button class="btn secondary" id="themeReset">Reset preview</button><button class="btn secondary" id="themeBack">Back</button></div></div>';
  document.getElementById('themeChoice').onchange=e=>{paint(e.target.value);note('Preview only — save to keep this theme.');};
  document.getElementById('themeSave').onclick=async()=>{
   const btn=document.getElementById('themeSave');btn.disabled=true;
   const choice=document.getElementById('themeChoice').value;
   try{
    const {data:{user}}=await client.auth.getUser();
    if(!user||!entitled||user.id!==activeUser)throw Error('Verified subscription required.');
    const {error}=await client.from('customer_theme_preferences').upsert({user_id:user.id,theme:choice,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error)throw error;
    saved=choice;note('Saved: '+api.themes[choice].name);
   }catch(e){note('Unable to save: '+(e.message||'Try again.'));}
   finally{btn.disabled=!entitled;}
  };
  document.getElementById('themeReset').onclick=()=>{paint(api.effectiveTheme(saved,entitled));document.getElementById('themeChoice').value=api.effectiveTheme(saved,entitled);note('Preview reset.');};
  document.getElementById('themeBack').onclick=()=>{paint(api.effectiveTheme(saved,entitled));go('more');};
  load().catch(()=>note('Could not check subscription.'));
 };
 client?.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){activeUser=null;entitled=false;saved='blue';paint('blue');}else if(event==='SIGNED_IN')setTimeout(()=>load().catch(()=>{}),0);});
 if(client)load().catch(()=>{});
})();

'use strict';
/* Customer-facing billing controls. Server functions remain disabled until configured. */
(() => {
 const endpoint='https://yxbuafwhfyxyrfvzbzpb.supabase.co/functions/v1/';
 const client=window.supabase?.createClient('https://yxbuafwhfyxyrfvzbzpb.supabase.co','sb_publishable_7Bf7EPeN_AsCz1ZQbPcc3w_WeHDUDgK',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 async function invoke(path){
  if(!client)throw Error('Cloud account unavailable');
  const {data:{session},error}=await client.auth.getSession();
  if(error||!session)throw Error('Sign in to your cloud account first.');
  const response=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':'sb_publishable_7Bf7EPeN_AsCz1ZQbPcc3w_WeHDUDgK'},body:'{}'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.message||data.error||'Billing unavailable');
  if(!/^https:\/\/(checkout\.stripe\.com|billing\.stripe\.com)\//.test(data.url||''))throw Error('Invalid checkout destination');
  window.location.assign(data.url);
 }
 window.openBillingSettings=()=>{
  const c=document.getElementById('content');if(!c)return;
  c.innerHTML='<div class="hero"><div class="eyebrow">Account settings</div><h1>Subscription</h1><p class="muted">Individual driver subscription: $5.00 AUD per month including GST.</p></div><div class="card"><b>Billing is being prepared</b><p class="small muted">Secure Stripe checkout and subscription management will be available after configuration and testing. No payment is taken from this screen yet.</p><div class="actions"><button class="btn" disabled>Subscribe — coming soon</button><button class="btn secondary" disabled>Manage subscription — coming soon</button><button class="btn secondary" onclick="go(\'more\')">Back</button></div></div>';
 };
 // These are invoked only after server configuration is verified and UI enabled.
 window.TruckingCostrBilling=Object.freeze({checkout:()=>invoke('billing-checkout'),portal:()=>invoke('billing-portal')});
})();

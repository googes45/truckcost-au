'use strict';
/* Billing remains read-only until Stripe secrets and webhook have passed sandbox verification. */
(() => {
 const URL='https://yxbuafwhfyxyrfvzbzpb.supabase.co';
 const KEY='sb_publishable_7Bf7EPeN_AsCz1ZQbPcc3w_WeHDUDgK';
 const statusNames={active:'Active',trialing:'Trial active',past_due:'Payment overdue',canceled:'Cancelled',unpaid:'Unpaid',paused:'Paused',incomplete:'Payment incomplete',incomplete_expired:'Payment expired',inactive:'Not subscribed'};
 const el=(id)=>document.getElementById(id);
 async function refresh(){
  const target=el('billingStatus');if(!target)return;
  if(!window.supabase?.createClient){target.textContent='Cloud service unavailable';return;}
  try{
   const client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   const {data:{user},error:authError}=await client.auth.getUser();
   if(authError||!user){target.textContent='Sign in to view your subscription';return;}
   const {data,error}=await client.from('billing_subscriptions').select('status,current_period_end').eq('user_id',user.id).maybeSingle();
   if(error)throw error;
   const status=data?.status||'inactive';
   const expiry=data?.current_period_end?new Date(data.current_period_end):null;
   const valid=!!expiry&&!Number.isNaN(expiry.valueOf());
   target.textContent=(statusNames[status]||'Subscription status unavailable')+(valid?' · Period ends '+expiry.toLocaleDateString('en-AU'):'');
  }catch(e){target.textContent='Subscription status unavailable. Please try again later.';console.warn('Billing status lookup failed',e);}
 }
 window.openBillingSettings=()=>{
  const c=el('content');if(!c)return;
  c.innerHTML='<div class="hero"><div class="eyebrow">Account settings</div><h1>Subscription</h1><p class="muted">Individual driver plan: $5.00 AUD per month, GST included.</p></div><div class="card"><b>Your subscription</b><p class="muted" id="billingStatus" role="status" aria-live="polite">Checking…</p><p class="small muted">Online payments are not yet enabled. We will not charge you from this screen.</p><div class="actions"><button class="btn" disabled>Subscribe — coming soon</button><button class="btn secondary" disabled>Manage billing — coming soon</button><button class="btn secondary" onclick="go(\'more\')">Back</button></div></div>';
  void refresh();
 };
})();

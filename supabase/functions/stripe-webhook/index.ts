// Stripe webhook for TruckingCostr AU. Deploy with verify_jwt=false.
// SECURITY: Signature verification against raw body is mandatory. Requires STRIPE_WEBHOOK_SECRET.
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
const json=(status:number,body:object)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const accepted=new Set(["checkout.session.completed","customer.subscription.created","customer.subscription.updated","customer.subscription.deleted","invoice.paid","invoice.payment_failed"]);
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return json(405,{error:"method_not_allowed"});
 const key=Deno.env.get("STRIPE_SECRET_KEY"),secret=Deno.env.get("STRIPE_WEBHOOK_SECRET");
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!key||!secret||!url||!service)return json(503,{error:"webhook_not_configured"});
 const signature=req.headers.get("stripe-signature");
 if(!signature)return json(400,{error:"missing_signature"});
 const stripe=new Stripe(key,{apiVersion:"2024-12-18.acacia"});
 let event:Stripe.Event;
 try{event=await stripe.webhooks.constructEventAsync(await req.text(),signature,secret);}
 catch{return json(400,{error:"invalid_signature"});}
 if(!accepted.has(event.type))return json(200,{received:true,ignored:true});
 const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const {data:already,error:checkError}=await db.from("stripe_webhook_events").select("event_id").eq("event_id",event.id).maybeSingle();
  if(checkError)throw checkError;
  if(already)return json(200,{received:true,duplicate:true});
  let subId:string|null=null;
  if(event.type.startsWith("customer.subscription."))subId=(event.data.object as Stripe.Subscription).id;
  if(event.type==="checkout.session.completed"){
   const checkout=event.data.object as Stripe.Checkout.Session;
   if(checkout.mode!=="subscription")return json(200,{received:true,ignored:true});
   subId=typeof checkout.subscription==="string"?checkout.subscription:checkout.subscription?.id||null;
  }
  if(event.type.startsWith("invoice.")){
   const invoice=event.data.object as Stripe.Invoice;
   // Invoice events are informational: subscription events are the authority for access.
   const {error}=await db.from("stripe_webhook_events").insert({event_id:event.id,event_type:event.type});
   if(error&&error.code!=="23505")throw error;
   return json(200,{received:true,invoice:invoice.id});
  }
  if(!subId)throw Error("missing_subscription");
  const subscription=await stripe.subscriptions.retrieve(subId);
  const userId=subscription.metadata?.supabase_user_id;
  if(!userId||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(userId))throw Error("missing_user_mapping");
  const customerId=typeof subscription.customer==="string"?subscription.customer:subscription.customer.id;
  const {data:owned,error:ownerError}=await db.from("billing_subscriptions").select("user_id").eq("stripe_subscription_id",subscription.id).maybeSingle();
  if(ownerError)throw ownerError;
  if(owned&&owned.user_id!==userId)throw Error("subscription_owner_mismatch");
  const {data:other,error:otherError}=await db.from("billing_subscriptions").select("stripe_subscription_id").eq("user_id",userId).maybeSingle();
  if(otherError)throw otherError;
  if(other?.stripe_subscription_id&&other.stripe_subscription_id!==subscription.id)throw Error("multiple_subscriptions_manual_review");
  const priceId=subscription.items.data[0]?.price.id||null;
  const periodEnd=subscription.items.data[0]?.current_period_end||null;
  const {error:upsertError}=await db.from("billing_subscriptions").upsert({
   user_id:userId,stripe_customer_id:customerId,stripe_subscription_id:subscription.id,
   stripe_price_id:priceId,status:subscription.status,
   current_period_end:periodEnd?new Date(periodEnd*1000).toISOString():null,
   updated_at:new Date().toISOString()
  },{onConflict:"user_id"});
  if(upsertError)throw upsertError;
  const {error:logError}=await db.from("stripe_webhook_events").insert({event_id:event.id,event_type:event.type});
  if(logError&&logError.code!=="23505")throw logError;
  return json(200,{received:true});
 }catch(e){console.error("Webhook processing failed",event.id,e instanceof Error?e.message:"unknown");return json(500,{error:"webhook_processing_failed"});}
});

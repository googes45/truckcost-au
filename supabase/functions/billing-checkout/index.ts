// Supabase Edge Function: billing-checkout
// Deploy with JWT verification enabled. Requires STRIPE_SECRET_KEY and STRIPE_DRIVER_PRICE_ID.
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const origin = "https://googes45.github.io";
const allowed = ["https://googes45.github.io"];
const headers = {"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
function respond(status:number, body:object){return new Response(JSON.stringify(body),{status,headers});}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return respond(405,{error:"method_not_allowed"});
 try{
  const key=Deno.env.get("STRIPE_SECRET_KEY"),price=Deno.env.get("STRIPE_DRIVER_PRICE_ID");
  const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!key||!price||!url||!anon||!service)return respond(503,{error:"billing_not_configured"});
  const bearer=req.headers.get("Authorization")||"";
  if(!/^Bearer\s+\S+$/i.test(bearer))return respond(401,{error:"sign_in_required"});
  const token=bearer.replace(/^Bearer\s+/i,"");
  const auth=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await auth.auth.getUser(token);
  if(error||!user||!user.email)return respond(401,{error:"invalid_session"});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:existing,error:dbError}=await admin.from("billing_subscriptions").select("stripe_customer_id,status").eq("user_id",user.id).maybeSingle();
  if(dbError)throw dbError;
  if(existing&&["active","trialing"].includes(existing.status))return respond(409,{error:"already_subscribed",message:"Manage your existing subscription instead."});
  const stripe=new Stripe(key,{apiVersion:"2024-12-18.acacia"});
  const params:Stripe.Checkout.SessionCreateParams={
   mode:"subscription",line_items:[{price,quantity:1}],client_reference_id:user.id,
   customer_email:existing?.stripe_customer_id?undefined:user.email,
   customer:existing?.stripe_customer_id||undefined,
   success_url:"https://googes45.github.io/truckcost-au/?billing=success",
   cancel_url:"https://googes45.github.io/truckcost-au/?billing=cancelled",
   subscription_data:{metadata:{supabase_user_id:user.id}},
   metadata:{supabase_user_id:user.id}
  };
  const session=await stripe.checkout.sessions.create(params,{idempotencyKey:"checkout-"+user.id+"-"+crypto.randomUUID()});
  if(!session.url||!allowed.some(o=>session.url?.startsWith("https://checkout.stripe.com/")))return respond(502,{error:"checkout_unavailable"});
  return respond(200,{url:session.url});
 }catch(e){console.error("Checkout failed",e instanceof Error?e.message:"unknown");return respond(500,{error:"checkout_failed"});}
});

// Authenticated Stripe Billing Portal session. Deploy with JWT verification enabled.
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
const headers={"Access-Control-Allow-Origin":"https://googes45.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(status:number,data:object)=>new Response(JSON.stringify(data),{status,headers});
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply(405,{error:"method_not_allowed"});
 const key=Deno.env.get("STRIPE_SECRET_KEY"),url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!key||!url||!anon||!service)return reply(503,{error:"billing_not_configured"});
 const bearer=req.headers.get("Authorization")||"";
 if(!/^Bearer\s+\S+$/i.test(bearer))return reply(401,{error:"sign_in_required"});
 try{
  const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await client.auth.getUser(bearer.replace(/^Bearer\s+/i,""));
  if(error||!user)return reply(401,{error:"invalid_session"});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:record,error:dbError}=await admin.from("billing_subscriptions").select("stripe_customer_id").eq("user_id",user.id).maybeSingle();
  if(dbError)throw dbError;
  if(!record?.stripe_customer_id)return reply(404,{error:"no_subscription_found"});
  const stripe=new Stripe(key,{apiVersion:"2024-12-18.acacia"});
  const portal=await stripe.billingPortal.sessions.create({customer:record.stripe_customer_id,return_url:"https://googes45.github.io/truckcost-au/"});
  return reply(200,{url:portal.url});
 }catch(e){console.error("Portal failed",e instanceof Error?e.message:"unknown");return reply(500,{error:"portal_failed"});}
});

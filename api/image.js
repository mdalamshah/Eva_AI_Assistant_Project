import crypto from "crypto";

const LIMIT=10;
const DAY=24*60*60*1000;

function cookie(req,name){
  const m=(req.headers.cookie||"").match(new RegExp("(?:^|;\\s*)"+name+"=([^;]+)"));
  return m?m[1]:null;
}
function sign(payload){
  const s=process.env.EVA_SESSION_SECRET||"";
  return crypto.createHmac("sha256",s).update(payload).digest("hex");
}
function countFor(req){
  const raw=cookie(req,"eva_img");
  if(!raw||!process.env.EVA_SESSION_SECRET)return {count:0,start:Date.now()};
  try{
    const [date,count,sig]=Buffer.from(raw,"base64url").toString().split("|");
    const payload=date+"|"+count;
    const expected=sign(payload);
    if(sig!==expected) return {count:0,start:Date.now()};
    const start=Number(date),n=Number(count);
    if(!Number.isFinite(start)||!Number.isFinite(n)||Date.now()-start>=DAY)return {count:0,start:Date.now()};
    return {count:Math.max(0,Math.min(LIMIT,n)),start};
  }catch{return {count:0,start:Date.now()}}
}
function setCount(res,start,count){
  const payload=start+"|"+count;
  const value=Buffer.from(payload+"|"+sign(payload)).toString("base64url");
  res.setHeader("Set-Cookie",`eva_img=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
}
function loggedIn(req){
  return /(?:^|;\s*)eva_owner=/.test(req.headers.cookie||"")||/(?:^|;\s*)eva_user=/.test(req.headers.cookie||"");
}
export default async function handler(req,res){
  if(req.method!=="POST"&&req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
  if(!loggedIn(req))return res.status(401).json({error:"Login required"});
  const usage=countFor(req);
  if(req.method==="GET")return res.status(200).json({used:usage.count,limit:LIMIT,remaining:Math.max(0,LIMIT-usage.count)});
  if(usage.count>=LIMIT)return res.status(429).json({error:"Aaj ki image limit (10) poori ho gayi hai. 24 ghante baad phir try karein.",used:usage.count,limit:LIMIT,remaining:0});
  const key=process.env.GEMINI_API_KEY;
  if(!key)return res.status(503).json({error:"Nano Banana is not configured. Add GEMINI_API_KEY in Vercel Environment Variables."});
  const body=req.body||{},prompt=String(body.prompt||"").trim().slice(0,6000);
  if(prompt.length<3)return res.status(400).json({error:"Image prompt likhiye."});
  const model=process.env.GEMINI_IMAGE_MODEL||"gemini-nano-banana-2.1";
  try{
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/interactions",{
      method:"POST",
      headers:{"x-goog-api-key":key,"Content-Type":"application/json"},
      body:JSON.stringify({
        model,
        input:prompt,
        response_format:{type:"image",aspect_ratio:String(body.aspectRatio||"1:1")}
      })
    });
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:data?.error?.message||"Nano Banana image generation failed"});
    const image=data?.output_image?.data;
    if(!image)return res.status(502).json({error:"Nano Banana returned no image. Please try again."});
    const next=usage.count+1;setCount(res,usage.start,next);
    return res.status(200).json({image:"data:image/png;base64,"+image,used:next,limit:LIMIT,remaining:LIMIT-next,model});
  }catch(e){return res.status(500).json({error:e.message||"Image generation server error"});}
}

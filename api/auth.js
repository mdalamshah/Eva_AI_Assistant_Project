import crypto from "crypto";
import {sessionToken,isOwner} from "./_auth.js";
export default async function handler(req,res){
  if(req.method==="GET")return res.status(200).json({role:isOwner(req)?"owner":"guest"});
  if(req.method==="DELETE"){res.setHeader("Set-Cookie","eva_owner=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");return res.status(200).json({role:"guest"});}
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  const expected=process.env.EVA_OWNER_SECRET,session=process.env.EVA_SESSION_SECRET,provided=String(req.body?.secret||"");
  if(!expected||!session||session.length<32)return res.status(503).json({error:"Owner authentication is not configured securely."});
  const a=Buffer.from(expected),b=Buffer.from(provided);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:"Invalid owner secret"});
  res.setHeader("Set-Cookie",`eva_owner=${sessionToken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  return res.status(200).json({role:"owner"});
}
import crypto from "crypto";
import {sessionToken,isOwner,userToken} from "./_auth.js";

function getUser(req){
  const cookie=req.headers.cookie||"";
  const m=cookie.match(/(?:^|;\s*)eva_user=([^;]+)/);
  if(!m)return null;
  const raw=m[1];
  try{
    const dot=raw.lastIndexOf(".");
    if(dot<1)return null;
    const encodedName=raw.slice(0,dot),provided=raw.slice(dot+1);
    const name=decodeURIComponent(encodedName);
    if(name==="null"||name.length<2)return null;
    const expected=userToken(name);
    if(!expected)return null;
    const a=Buffer.from(provided),b=Buffer.from(expected);
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
    return name;
  }catch{return null}
}

export default async function handler(req,res){
  const user=getUser(req);
  const owner=isOwner(req);
  if(req.method==="GET"){
    return res.status(200).json({role:owner?"owner":user?"user":"guest",name:owner?"Alam Shah":user||""});
  }
  if(req.method==="DELETE"){
    res.setHeader("Set-Cookie",[
      "eva_owner=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
      "eva_user=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"
    ]);
    return res.status(200).json({role:"guest"});
  }
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});

  const session=process.env.EVA_SESSION_SECRET;
  if(!session||session.length<32)return res.status(503).json({error:"Authentication is not configured securely."});

  const mode=String(req.body?.mode||"user");
  if(mode==="owner"){
    const ownerEmail=String(process.env.EVA_OWNER_EMAIL||"mdalam67860@gmail.com").trim().toLowerCase();
    const providedEmail=String(req.body?.email||"").trim().toLowerCase();
    const expected=process.env.EVA_OWNER_SECRET,provided=String(req.body?.secret||"");
    if(providedEmail!==ownerEmail)return res.status(401).json({error:"Owner email does not match."});
    if(!expected)return res.status(503).json({error:"Owner authentication is not configured."});
    const a=Buffer.from(expected),b=Buffer.from(provided);
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:"Invalid owner secret"});
    res.setHeader("Set-Cookie","eva_owner="+sessionToken()+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000");
    return res.status(200).json({role:"owner",name:"Alam Shah"});
  }

  const name=String(req.body?.name||"").trim().slice(0,60);
  if(name.length<2)return res.status(400).json({error:"Please enter your name."});
  const token=userToken(name);
  if(!token)return res.status(503).json({error:"Authentication is not configured securely."});
  res.setHeader("Set-Cookie","eva_user="+encodeURIComponent(name)+"."+token+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000");
  return res.status(200).json({role:"user",name});
}
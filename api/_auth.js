import crypto from "crypto";

function secret(){
  const s=process.env.EVA_SESSION_SECRET;
  return s&&s.length>=32?s:null;
}

export function sessionToken(){
  const s=secret();
  if(!s)return null;
  return crypto.createHmac("sha256",s).update("owner").digest("hex");
}

export function userToken(name){
  const s=secret();
  if(!s||typeof name!=="string"||name.length<2)return null;
  return crypto.createHmac("sha256",s).update("user:"+name).digest("hex");
}

function cookie(req,name){
  const m=(req.headers.cookie||"").match(new RegExp("(?:^|;\\s*)"+name+"=([^;]+)"));
  return m?m[1]:null;
}

export function isOwner(req){
  const expected=sessionToken(),provided=cookie(req,"eva_owner");
  if(!expected||!provided)return false;
  const a=Buffer.from(provided),b=Buffer.from(expected);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

export function isUser(req){
  const raw=cookie(req,"eva_user");
  if(!raw)return false;
  try{
    const dot=raw.lastIndexOf(".");
    if(dot<1)return false;
    const encodedName=raw.slice(0,dot),provided=raw.slice(dot+1);
    const name=decodeURIComponent(encodedName);
    if(name==="null"||name.length<2)return false;
    const expected=userToken(name);
    if(!expected)return false;
    const a=Buffer.from(provided),b=Buffer.from(expected);
    return a.length===b.length&&crypto.timingSafeEqual(a,b);
  }catch{return false}
}

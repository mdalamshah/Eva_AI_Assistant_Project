import crypto from "crypto";
export function sessionToken(){
  const secret=process.env.EVA_SESSION_SECRET;
  if(!secret||secret.length<32)return null;
  return crypto.createHmac("sha256",secret).update("owner").digest("hex");
}
export function isOwner(req){
  const expected=sessionToken(); if(!expected)return false;
  const cookie=req.headers.cookie||"";
  const m=cookie.match(/(?:^|;\s*)eva_owner=([^;]+)/); if(!m)return false;
  const a=Buffer.from(m[1]),b=Buffer.from(expected);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

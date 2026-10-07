import {isOwner} from "./_auth.js";
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    const {messages=[]}=req.body||{},owner=isOwner(req),key=process.env.OPENAI_API_KEY;
    if(!key)return res.status(503).json({error:"OPENAI_API_KEY is not configured"});
    const input=messages.slice(-24).filter(m=>["user","assistant"].includes(m?.role)&&typeof m.content==="string").map(m=>({role:m.role,content:m.content.slice(0,12000)}));
    const instructions=["You are Eva, a warm, intelligent personal AI assistant created for Alam.","Speak naturally in Hindi, Hinglish, or English according to the user.",owner?"The authenticated user is Alam, the owner. You may personalize responses for the owner.":"The visitor is only a guest user. Never expose or infer private owner information.","Never reveal, request, guess, or repeat the owner authentication secret.","Never claim an external action happened unless a connected tool actually performed it.","Be helpful, concise, and honest about limitations."].join(" ");
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5-mini",instructions,input,max_output_tokens:1200})});
    const data=await response.json();
    if(!response.ok)return res.status(response.status).json({error:data.error?.message||"AI request failed"});
    return res.status(200).json({reply:data.output_text||"I couldn't generate a response."});
  }catch(e){return res.status(500).json({error:e.message||"Server error"});}
}
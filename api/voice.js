import {isOwner,isUser} from "./_auth.js";

export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!isOwner(req)&&!isUser(req))return res.status(401).json({error:"Login required"});
  const key=process.env.ELEVENLABS_API_KEY;
  if(!key)return res.status(503).json({error:"ElevenLabs voice is not configured. Add ELEVENLABS_API_KEY in Vercel Environment Variables."});
  const text=typeof req.body?.text==="string"?req.body.text.trim().slice(0,4000):"";
  if(!text)return res.status(400).json({error:"Text is required"});
  try{
    const voiceId=process.env.EVA_ELEVENLABS_VOICE_ID||"0MMPn5qSfOwEyLdcDSXE";
    const response=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(voiceId),{
      method:"POST",
      headers:{"xi-api-key":key,"Content-Type":"application/json","Accept":"audio/mpeg"},
      body:JSON.stringify({
        text,
        model_id:"eleven_multilingual_v2",
        voice_settings:{stability:0.48,similarity_boost:0.78,style:0.32,use_speaker_boost:true}
      })
    });
    if(!response.ok){
      const detail=await response.text().catch(()=>"");
      console.error("ElevenLabs TTS error",response.status,detail.slice(0,500));
      return res.status(502).json({error:"ElevenLabs could not generate Eva's voice. Check the API key, account credits, and voice access."});
    }
    const audio=Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type","audio/mpeg");
    res.setHeader("Cache-Control","no-store");
    return res.status(200).send(audio);
  }catch(e){
    console.error("Eva voice endpoint error",e?.message||"unknown");
    return res.status(502).json({error:"Eva voice generation failed."});
  }
}

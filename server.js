import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename=fileURLToPath(import.meta.url),__dirname=path.dirname(__filename);
const app=express(),PORT=Number(process.env.PORT)||10000,HOST="0.0.0.0";
const OLLAMA_URL=(process.env.OLLAMA_URL||"http://127.0.0.1:11434").replace(/\/+$/,"");
const OLLAMA_MODEL=process.env.OLLAMA_MODEL||"llama3.2:3b";
const SYSTEM=`You are JARVIS, a fictional Iron Man-inspired personal AI assistant. Be calm, intelligent, polished and slightly witty. Your replies are spoken aloud, so use natural conversational sentences and avoid markdown tables. Never claim you performed a computer action unless the application actually did it.`;
app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(__dirname,"public")));
app.get("/health",(_req,res)=>res.json({ok:true,service:"JARVIS",version:"3.0.0"}));
app.get("/api/config",(_req,res)=>res.json({model:OLLAMA_MODEL,ollamaConfigured:Boolean(process.env.OLLAMA_URL)}));
app.get("/api/ollama-status",async(_req,res)=>{
 try{const r=await fetch(`${OLLAMA_URL}/api/tags`,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error(`Ollama ${r.status}`);
 const d=await r.json(),models=(d.models||[]).map(x=>x.name),installed=models.includes(OLLAMA_MODEL)||models.some(x=>x.split(":")[0]===OLLAMA_MODEL.split(":")[0]);
 res.json({online:true,installed,model:OLLAMA_MODEL,models});
 }catch(e){res.status(503).json({online:false,installed:false,model:OLLAMA_MODEL,error:e.message})}
});
app.post("/api/chat",async(req,res)=>{
 try{
  if(!process.env.OLLAMA_URL)return res.status(503).json({error:"OLLAMA_URL is not configured on Render."});
  const messages=(Array.isArray(req.body?.messages)?req.body.messages:[]).filter(m=>m&&(m.role==="user"||m.role==="assistant")&&typeof m.content==="string").slice(-20);
  if(!messages.length)return res.status(400).json({error:"No conversation messages were supplied."});
  const r=await fetch(`${OLLAMA_URL}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:OLLAMA_MODEL,stream:false,messages:[{role:"system",content:SYSTEM},...messages],options:{temperature:.7}}),signal:AbortSignal.timeout(120000)});
  const body=await r.text();if(!r.ok)return res.status(502).json({error:`Ollama returned HTTP ${r.status}: ${body.slice(0,500)}`});
  const d=JSON.parse(body),reply=d?.message?.content?.trim();if(!reply)return res.status(502).json({error:"Ollama returned an empty response."});
  res.json({reply,model:d.model||OLLAMA_MODEL});
 }catch(e){console.error(e);res.status(502).json({error:"JARVIS could not reach the Ollama server. Check OLLAMA_URL, network access and the Ollama model."})}
});
app.get("*splat",(_req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,HOST,()=>console.log(`JARVIS v3 listening on ${HOST}:${PORT}; Ollama: ${OLLAMA_URL}; Model: ${OLLAMA_MODEL}`));

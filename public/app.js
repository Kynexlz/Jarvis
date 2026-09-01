const $=id=>document.getElementById(id);
const activate=$("activate"),stop=$("stop"),messages=$("messages"),input=$("text");
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,active=false,listening=false,thinking=false,history=[];
const setState=(s,on=false,err=false)=>{$("state").textContent=s;$("dot").className=err?"red":on?"":""};
const add=(who,text)=>{let a=document.createElement("article");a.className=who;a.innerHTML=`<em>${who==="user"?"YOU":"JARVIS"}</em><div></div>`;a.querySelector("div").textContent=text;messages.appendChild(a);messages.scrollTop=messages.scrollHeight};
function voice(){let vs=speechSynthesis.getVoices();return vs.find(v=>/en-GB/i.test(v.lang)&&/daniel|george|male/i.test(v.name))||vs.find(v=>/en-GB/i.test(v.lang))||vs[0]}
function speak(t){return new Promise(done=>{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t),v=voice();if(v)u.voice=v;u.rate=.94;u.pitch=.72;$("voice").textContent="SPEAKING";setState("SPEAKING",true);u.onend=()=>{ $("voice").textContent="READY";done()};u.onerror=done;speechSynthesis.speak(u)})}
function setup(){if(!Recognition){setState("VOICE UNSUPPORTED",false,true);add("jarvis","Voice recognition is unavailable in this browser. Use Chrome or Edge.");return false}
rec=new Recognition();rec.lang="en-GB";rec.continuous=true;rec.interimResults=true;
rec.onstart=()=>{listening=true;$("mic").textContent="ON";if(!thinking)setState(active?"LISTENING":"WAITING FOR JARVIS",active)};
rec.onend=()=>{listening=false;$("mic").textContent="OFF";if(active&&!thinking)setTimeout(start,250)};
rec.onerror=e=>{if(e.error==="not-allowed"){active=false;activate.classList.remove("active");setState("MIC DENIED",false,true);add("jarvis","Microphone access was denied. Allow microphone access and try again.")}};
rec.onresult=e=>{let final="";for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)final+=e.results[i][0].transcript;
if(!final)return;let low=final.toLowerCase();if(!active){if(/\bjarvis\b/.test(low)){active=true;activate.classList.add("active");$("mode").textContent="ACTIVE";let x=final.slice(low.indexOf("jarvis")+6).trim();if(x)ask(x);else speak("Yes. How can I help?")}}else if(!thinking)ask(final.trim())};return true}
function start(){if(rec&&!listening&&!speechSynthesis.speaking)try{rec.start()}catch{}}
async function ask(text){if(!text||thinking)return;thinking=true;setState("THINKING",true);$("mode").textContent="THINKING";add("user",text);history.push({role:"user",content:text});history=history.slice(-20);let t=performance.now();
try{let r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history})}),d=await r.json();if(!r.ok)throw Error(d.error);$("latency").textContent=Math.round(performance.now()-t)+" MS";add("jarvis",d.reply);history.push({role:"assistant",content:d.reply});thinking=false;$("mode").textContent="ACTIVE";await speak(d.reply)}
catch(e){thinking=false;setState("CORE ERROR",false,true);add("jarvis",e.message);await speak(e.message)}finally{if(active)start()}}
activate.onclick=()=>{if(active){active=false;speechSynthesis.cancel();if(rec)try{rec.stop()}catch{}activate.classList.remove("active");$("mode").textContent="PASSIVE";setState("STANDBY")}else{if(!rec&&!setup())return;active=true;activate.classList.add("active");$("mode").textContent="PASSIVE";setState("WAITING FOR JARVIS",true);start()}};
stop.onclick=()=>speechSynthesis.cancel();
$("send").onclick=()=>{let x=input.value.trim();input.value="";if(x)ask(x)};
input.onkeydown=e=>{if(e.key==="Enter")$("send").click()};
$("clear").onclick=()=>{history=[];messages.innerHTML="";add("jarvis","Communication channel cleared. I am ready.")};
setInterval(()=>{$("clock").textContent=new Date().toLocaleTimeString([],{hour12:false})},1000);
async function status(){try{let r=await fetch("/api/status"),d=await r.json();if(d.online&&d.installed){$("ai").textContent="ONLINE";setState("STANDBY")}else{$("ai").textContent="MODEL MISSING";setState("MODEL MISSING",false,true);add("jarvis","Ollama is online, but llama3.2:3b is not installed. Run: ollama pull llama3.2:3b")}}catch{$("ai").textContent="OFFLINE";setState("OLLAMA OFFLINE",false,true);add("jarvis","I cannot find Ollama. Start Ollama and reload this page.")}}
setup();status();speechSynthesis.onvoiceschanged=()=>voice();

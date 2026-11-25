const $ = id => document.getElementById(id);
let tone = "уверенно и спокойно";
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function apiKey(){return $("apiKey").value.trim() || localStorage.getItem("nexora_api_key") || ""}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")}));
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");tone=b.dataset.tone}));
$("settingsBtn").onclick=()=>$("settings").classList.remove("hidden");
$("closeSettings").onclick=()=>$("settings").classList.add("hidden");
$("saveKey").onclick=()=>{const k=$("apiKey").value.trim();if(k)localStorage.setItem("nexora_api_key",k);else localStorage.removeItem("nexora_api_key");$("settings").classList.add("hidden");toast("Настройки сохранены")};
$("apiKey").value=localStorage.getItem("nexora_api_key")||"";
async function post(url,body){const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,apiKey:apiKey()})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Не удалось выполнить запрос");return d}
function busy(btn,on,label){btn.disabled=on;btn.dataset.old ||= btn.innerHTML;btn.innerHTML=on?"обрабатываю...":btn.dataset.old}
$("replyBtn").onclick=async()=>{const btn=$("replyBtn");busy(btn,true);$("replyOutput").classList.add("hidden");try{const d=await post("/api/reply",{comment:$("comment").value,tone});$("replyResult").textContent=d.result;$("replyOutput").classList.remove("hidden")}catch(e){toast(e.message)}finally{busy(btn,false)}};
document.querySelector('[data-copy="replyResult"]').onclick=()=>{navigator.clipboard.writeText($("replyResult").textContent);toast("Скопировано")};
$("slidesBtn").onclick=async()=>{const btn=$("slidesBtn");busy(btn,true);$("slidesOutput").classList.add("hidden");try{const d=await post("/api/slides",{topic:$("topic").value,count:$("count").value,category:$("category").value});const wrap=$("slidesResult");wrap.innerHTML="";if(Array.isArray(d.slides)){d.slides.forEach((s,i)=>{const el=document.createElement("div");el.className="slide-card";const title=document.createElement("b");title.textContent=`СЛАЙД ${i+1}. ${s.title||""}`;const p=document.createElement("p");p.textContent=s.text||"";const small=document.createElement("small");small.textContent="ВИЗУАЛ: "+(s.image_prompt||"");el.append(title,p,small);wrap.append(el)})}else{wrap.textContent=d.result||"Нет результата"}$("slidesOutput").classList.remove("hidden")}catch(e){toast(e.message)}finally{busy(btn,false)}};
$("copySlides").onclick=()=>{navigator.clipboard.writeText($("slidesResult").innerText);toast("Текст слайдов скопирован")};
$("editBtn").onclick=()=>{const ref=$("reference").files[0],assets=[...$("assets").files];if(!ref){toast("Добавь референсное видео");return}const out=$("editOutput");out.innerHTML=`<div class="output-top">ФАЙЛЫ ГОТОВЫ</div><p>Референс: ${ref.name}</p><p>Твоих материалов: ${assets.length}</p><p>Следующий этап: подключить модуль анализа и автоматического монтажа.</p>`;out.classList.remove("hidden")};

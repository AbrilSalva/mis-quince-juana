const CONFIG = {
  eventDate: "2026-11-13T21:00:00-03:00",
  eventTitle: "Mis 15 de Juana",
  eventLocation: "Av. Costanera Rafael Obligado 6340, C1428, CABA",
  driveUrl: "REEMPLAZAR_CON_LINK_DE_GOOGLE_DRIVE",
  appsScriptUrl: "REEMPLAZAR_CON_URL_DE_APPS_SCRIPT"
};

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];
const pad = n => String(n).padStart(2,"0");

const cover = $("#cover");
const invite = $("#invite");
$("#enterBtn").addEventListener("click", () => {
  cover.classList.add("hidden");
  invite.classList.remove("hidden");
  invite.setAttribute("aria-hidden","false");
  window.scrollTo({top:0,behavior:"smooth"});
});

function updateCountdown(){
  const target = new Date(CONFIG.eventDate).getTime();
  const now = Date.now();
  let diff = Math.max(0, target-now);
  const d = Math.floor(diff/86400000); diff%=86400000;
  const h = Math.floor(diff/3600000); diff%=3600000;
  const m = Math.floor(diff/60000); diff%=60000;
  const s = Math.floor(diff/1000);
  $("#days").textContent = pad(d);
  $("#hours").textContent = pad(h);
  $("#minutes").textContent = pad(m);
  $("#seconds").textContent = pad(s);
}
updateCountdown(); setInterval(updateCountdown,1000);

function makeCalendarUrl(){
  const start = new Date(CONFIG.eventDate);
  const end = new Date(start.getTime()+6*60*60*1000);
  const fmt = d => d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + `&text=${encodeURIComponent(CONFIG.eventTitle)}`
    + `&dates=${fmt(start)}/${fmt(end)}`
    + `&location=${encodeURIComponent(CONFIG.eventLocation)}`
    + `&details=${encodeURIComponent("¡Te espero para celebrar mis 15!")}`;
}
$("#calendarLink").href = makeCalendarUrl();

const driveButton = $("#driveButton");
if(CONFIG.driveUrl.startsWith("http")){
  driveButton.href = CONFIG.driveUrl;
} else {
  driveButton.addEventListener("click", e => {
    e.preventDefault();
    toast("Falta agregar el link de Google Drive en app.js");
  });
}

if(window.QRCode){
  const qrTarget = CONFIG.driveUrl.startsWith("http") ? CONFIG.driveUrl : location.href;
  new QRCode(document.getElementById("qrcode"),{
    text:qrTarget,width:188,height:188,colorDark:"#0f2d27",colorLight:"#ffffff",
    correctLevel:QRCode.CorrectLevel.H
  });
}

const backdrop = $("#modalBackdrop");
function openModal(modal){
  backdrop.classList.remove("hidden");
  modal.showModal();
}
function closeModal(modal){
  modal.close();
  backdrop.classList.add("hidden");
}
$$("[data-close]").forEach(btn => btn.addEventListener("click", e => closeModal(e.target.closest("dialog"))));
backdrop.addEventListener("click",() => {
  const opened = $("dialog[open]");
  if(opened) closeModal(opened);
});

$("#giftBtn").addEventListener("click",() => openModal($("#giftModal")));
$("#messageBtn").addEventListener("click",() => openModal($("#messageModal")));
$("#yesBtn").addEventListener("click",() => openModal($("#yesModal")));
$("#noBtn").addEventListener("click",() => openModal($("#noModal")));

$$("[data-copy]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const input = $(btn.dataset.copy);
    await navigator.clipboard.writeText(input.value);
    toast("Copiado");
  });
});

function toast(message){
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2300);
}

$$(".chip").forEach(chip => {
  chip.addEventListener("click",() => {
    $$(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    const filter = chip.dataset.filter;
    $$(".guest-message").forEach(m => {
      m.style.display = (filter==="todos" || m.dataset.category===filter) ? "" : "none";
    });
  });
});

async function sendToBackend(payload){
  if(!CONFIG.appsScriptUrl.startsWith("http")){
    return {local:true};
  }
  await fetch(CONFIG.appsScriptUrl,{
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload)
  });
  return {local:false};
}

$("#messageForm").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    type:"message",
    name:fd.get("name"),
    category:fd.get("category"),
    message:fd.get("message"),
    timestamp:new Date().toISOString()
  };
  try{
    await sendToBackend(payload);
    const card = document.createElement("article");
    card.className="guest-message";
    card.dataset.category=payload.category;
    card.innerHTML=`<div><strong>${escapeHtml(payload.name)}</strong><span>${new Date().toLocaleDateString("es-AR")}</span></div><p>${escapeHtml(payload.message)}</p>`;
    $("#messageList").prepend(card);
    e.target.reset();
    closeModal($("#messageModal"));
    toast("Mensaje enviado 💚");
  }catch(err){
    toast("No se pudo enviar. Probá nuevamente.");
  }
});

let guestCount=1;
function renderGuestFields(){
  $("#guestCount").textContent=guestCount;
  $("#guestFields").innerHTML=Array.from({length:guestCount},(_,i)=>`
    <div class="guest-box">
      <h4>INVITADO ${i+1}</h4>
      <label>Nombre y apellido
        <input name="guest_${i+1}_name" required placeholder="Nombre completo">
      </label>
      <label>Restricciones alimentarias / Aclaraciones
        <input name="guest_${i+1}_restrictions" placeholder="Ej: vegetariano, celíaco, etc.">
      </label>
    </div>`).join("");
}
renderGuestFields();
$("#minusGuest").addEventListener("click",()=>{guestCount=Math.max(1,guestCount-1);renderGuestFields();});
$("#plusGuest").addEventListener("click",()=>{guestCount=Math.min(8,guestCount+1);renderGuestFields();});

$("#yesForm").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const guests=[];
  for(let i=1;i<=guestCount;i++){
    guests.push({
      name:fd.get(`guest_${i}_name`),
      restrictions:fd.get(`guest_${i}_restrictions`)
    });
  }
  const payload={type:"rsvp_yes",guestCount,guests,message:fd.get("message"),timestamp:new Date().toISOString()};
  try{
    await sendToBackend(payload);
    closeModal($("#yesModal"));
    e.target.reset();guestCount=1;renderGuestFields();
    toast("Asistencia confirmada ✨");
  }catch(err){toast("No se pudo enviar. Probá nuevamente.");}
});

$("#noForm").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload={type:"rsvp_no",name:fd.get("name"),message:fd.get("message"),timestamp:new Date().toISOString()};
  try{
    await sendToBackend(payload);
    closeModal($("#noModal"));
    e.target.reset();
    toast("Respuesta enviada. Gracias por avisar.");
  }catch(err){toast("No se pudo enviar. Probá nuevamente.");}
});

function escapeHtml(str=""){
  return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

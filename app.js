/* المنطق الرئيسي للصفحة */
'use strict';

const $ = id => document.getElementById(id);

/* ============ الحالة (في الذاكرة فقط - وضع تجريبي) ============ */
const state = { count: CONFIG.initialCount, drawAt: null };
/* count يجب أن يأتي من قاعدة البيانات عند الربط */

const fmt = n => n.toLocaleString('en-US');
const money = n => n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

/* ============ بناء البطاقات ============ */
function card(id, ic, title, sub, cls=''){
  return `<button class="item sq ${cls}" data-open="${id}"><span class="ico">${icon(ic)}</span><span class="tx"><span class="tt">${title}</span></span></button>`;
}
$('leadList').innerHTML = card('prizes','trophy','لوحة الجوائز','اضغط لمعرفة مكافأة كل فائز من الـ 20 فائز يومياً.','lead');
$('infoList').innerHTML = [
  card('how','help','كيف يعمل السحب','أربع مراحل واضحة من التسجيل حتى الجائزة.'),
  card('fair','shield','الشفافية والتحقق','كل خطوات السحب على بث مباشر يومي.'),
  card('ads','ads','التمويل والإعلانات','ما المطلوب منك فقط.'),
  card('terms','doc','الشروط والأحكام','منصة مجانية بالكامل.')
].join('');

/* ============ النافذة السفلية ============ */
const sheet = $('sheet'), scrim = $('scrim');
let lastFocus = null;
function openSheet(id){
  const s = SHEETS[id]; if (!s) return;
  lastFocus = document.activeElement;
  $('sheetTitle').innerHTML = s.title;
  $('sheetBody').innerHTML = s.html();
  sheet.scrollTop = 0;
  sheet.classList.add('open'); scrim.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(()=>$('sheetClose').focus(), 50);
}
function closeSheet(){
  sheet.classList.remove('open'); scrim.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-open]');
  if (b) openSheet(b.dataset.open);
});
$('sheetClose').addEventListener('click', closeSheet);
scrim.addEventListener('click', closeSheet);
document.addEventListener('keydown', e=>{ if (e.key==='Escape' && sheet.classList.contains('open')) closeSheet(); });
/* سحب النافذة للأسفل لإغلاقها */
let y0=null;
sheet.addEventListener('touchstart', e=>{ if (sheet.scrollTop===0) y0=e.touches[0].clientY; },{passive:true});
sheet.addEventListener('touchend', e=>{ if (y0!==null && e.changedTouches[0].clientY - y0 > 90) closeSheet(); y0=null; },{passive:true});

/* ============ العدّاد والتقدم ============ */
function render(){
  if (state.count >= CONFIG.target){
    if (!state.drawAt) state.drawAt = Date.now() + CONFIG.waitHours*3600*1000;
    document.querySelectorAll('.share').forEach(b=>{ b.classList.add('off'); b.textContent='اكتمل العدد'; });
  }
  tickTimer();
}
function tickTimer(){
  const pill = $('timerPill'), p2 = n=>String(n).padStart(2,'0');
  if (!state.drawAt){
    const H = 3600000, open = CONFIG.openHours*H, cycle = (CONFIG.openHours+CONFIG.gapHours)*H;
    const el = (((Date.now() - new Date(CONFIG.cycleAnchor).getTime()) % cycle) + cycle) % cycle;
    const hms = ms => { const h=Math.floor(ms/H), m=Math.floor(ms%H/60000), s=Math.floor(ms%60000/1000); return `${p2(h)}:${p2(m)}:${p2(s)}`; };
    if (el < open){
      pill.dataset.phase='collect';
      pill.textContent = 'توزيع مكافآت بعد ' + hms(open - el);
    } else {
      pill.dataset.phase='countdown';
      pill.textContent = 'انتهى المؤقت · يتجدد بعد ' + hms(cycle - el);
    }
    return;
  }
  const ms = state.drawAt - Date.now();
  if (ms <= 0){ pill.dataset.phase='countdown'; pill.textContent='حان موعد السحب'; return; }
  const h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000);
  pill.dataset.phase='countdown';
  pill.textContent = `السحب خلال ${p2(h)}:${p2(m)}:${p2(s)}`;
}
setInterval(tickTimer,1000);

/* ============ الشارك + الأكواد ============
   كل صف: زر «شارك» (يفتح رابطه في تبويب جديد) + خانة كود + زر «تأكيد».
   الصف رقم i يقبل CONFIG.codes[i] فقط. الكود الخاطئ لا يُظهر أي شيء.
   عند صحة الأكواد الأربعة يظهر شعار تيليغرام ورابط CONFIG.telegramUrl. */
const SAVED_KEY = 'dz2_codes';
const norm = s => String(s == null ? '' : s).trim().toLowerCase();
const isValid = (i, v) => { const c = norm(CONFIG.codes[i]); return c !== '' && norm(v) === c; };

const savedStore = {
  get(){ try{ const a = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } },
  set(a){ try{ localStorage.setItem(SAVED_KEY, JSON.stringify(a)); }catch(e){} }
};

const rowsEl = $('rows');
const okFlags = CONFIG.codes.map(()=>false);
const entered = CONFIG.codes.map(()=> '');

function buildRows(){
  rowsEl.innerHTML = CONFIG.codes.map((_, i)=>`
    <div class="row" data-i="${i}">
      <a class="btn sm share" href="${CONFIG.shareUrls[i] || '#'}" target="_blank" rel="noopener noreferrer">شارك ${i+1}</a>
      <input class="code-in" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="الكود ${i+1}" aria-label="الكود ${i+1}">
      <button class="ok-btn" type="button">تأكيد</button>
    </div>`).join('');
}

function markOk(i){
  okFlags[i] = true;
  const row = rowsEl.children[i];
  row.classList.add('done');
  row.querySelector('.code-in').readOnly = true;
  const b = row.querySelector('.ok-btn'); b.textContent = '✓'; b.disabled = true;
  if (okFlags.every(Boolean)) $('tgCta').hidden = false;
}

function submitRow(i){
  const input = rowsEl.children[i].querySelector('.code-in');
  if (okFlags[i] || !isValid(i, input.value)) return;   // خاطئ: لا شيء يظهر
  entered[i] = input.value.trim();
  savedStore.set(entered);
  markOk(i);
}

rowsEl.addEventListener('click', e=>{
  const b = e.target.closest('.ok-btn'); if (!b) return;
  submitRow(+b.closest('.row').dataset.i);
});
rowsEl.addEventListener('keydown', e=>{
  if (e.key !== 'Enter' || !e.target.classList.contains('code-in')) return;
  submitRow(+e.target.closest('.row').dataset.i);
});
rowsEl.addEventListener('click', e=>{
  const a = e.target.closest('.share'); if (a && a.classList.contains('off')) e.preventDefault();
});

buildRows();
$('tgCta').href = CONFIG.telegramUrl;
/* استرجاع الأكواد الصحيحة المحفوظة (وتُتجاهل تلقائياً إذا غيّرتَ الأكواد في config.js) */
savedStore.get().forEach((v, i)=>{
  if (i < CONFIG.codes.length && isValid(i, v)){ rowsEl.children[i].querySelector('.code-in').value = v; entered[i] = v; markOk(i); }
});

window.addEventListener('load', ()=> setTimeout(render,200));
tickTimer();

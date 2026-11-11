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
$('menuList').innerHTML = [
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

/* ============ قائمة ☰ (أعلى اليمين) ============ */
const menuBtn = $('menuBtn'), menuPanel = $('menuPanel');
function setMenu(open){
  menuPanel.hidden = !open;
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}
menuBtn.addEventListener('click', e=>{ e.stopPropagation(); setMenu(menuPanel.hidden); });
menuPanel.addEventListener('click', e=>{ if (e.target.closest('[data-open]')) setMenu(false); });
document.addEventListener('click', e=>{ if (!menuPanel.hidden && !menuPanel.contains(e.target)) setMenu(false); });
document.addEventListener('keydown', e=>{ if (e.key==='Escape' && !menuPanel.hidden){ setMenu(false); menuBtn.focus(); } });

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
    /* عدّاد تنازلي يتكرر كل CONFIG.cycleHours (24 ساعة) */
    const H = 3600000, cycle = (CONFIG.cycleHours || 24) * H;
    const el = (((Date.now() - new Date(CONFIG.cycleAnchor).getTime()) % cycle) + cycle) % cycle;
    const left = cycle - el;
    const h=Math.floor(left/H), m=Math.floor(left%H/60000), s=Math.floor(left%60000/1000);
    pill.dataset.phase='collect';
    pill.textContent = 'توزيع مكافآت بعد ' + `${p2(h)}:${p2(m)}:${p2(s)}`;
    return;
  }
  const ms = state.drawAt - Date.now();
  if (ms <= 0){ pill.dataset.phase='countdown'; pill.textContent='حان موعد السحب'; return; }
  const h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000);
  pill.dataset.phase='countdown';
  pill.textContent = `السحب خلال ${p2(h)}:${p2(m)}:${p2(s)}`;
}
setInterval(tickTimer,1000);

/* ============ الشارك + الكود ============
   زر «شارك» يفتح رابطه في تبويب جديد، ثم يُدخل الزائر الكود ويضغط «تأكيد».
   الكود الخاطئ لا يُظهر أي شيء. عند صحة الكود يظهر شعار تيليغرام (CONFIG.telegramUrl).
   لا يتم حفظ شيء: تحديث الصفحة يمسح الكود المدخل. */
const CODE      = CONFIG.code != null ? CONFIG.code : (CONFIG.codes && CONFIG.codes[0]);
const SHARE_URL = CONFIG.shareUrl || (CONFIG.shareUrls && CONFIG.shareUrls[0]) || '#';
const SITE_URL  = CONFIG.siteUrl || 'https://jamalkatab9-ctrl.github.io/Dz2link/';

const norm = s => String(s == null ? '' : s).trim().toLowerCase();
const isValid = v => { const c = norm(CODE); return c !== '' && norm(v) === c; };

const codeRow = $('codeRow'), codeIn = $('codeIn'), okBtn = $('okBtn'), shareBtn = $('shareBtn');
let codeDone = false;

shareBtn.href = SHARE_URL;
shareBtn.addEventListener('click', e=>{ if (shareBtn.classList.contains('off')) e.preventDefault(); });

function submitCode(){
  if (codeDone || !isValid(codeIn.value)) return;   // خاطئ: لا شيء يظهر
  codeDone = true;
  codeRow.classList.add('done');
  codeIn.readOnly = true;
  okBtn.textContent = '✓'; okBtn.disabled = true;
  $('tgCta').hidden = false;
}
okBtn.addEventListener('click', submitCode);
codeIn.addEventListener('keydown', e=>{ if (e.key === 'Enter') submitCode(); });
$('tgCta').href = CONFIG.telegramUrl;

/* ============ مشاركة الموقع مع الأصدقاء ============
   يفتح خيار المشاركة في الهاتف (Web Share API)، وإن لم يتوفر يُنسخ الرابط. */
const shareNote = $('shareNote');
let noteTimer = null;
function note(msg){
  shareNote.textContent = msg;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(()=>{ shareNote.textContent = ''; }, 3500);
}
async function shareSite(){
  const data = { title:'Dz2link', text:'منصة Dz2link: شارك واربح جوائز مالية كل يوم 🎁', url: SITE_URL };
  if (navigator.share){
    try{ await navigator.share(data); return; }
    catch(err){ if (err && err.name === 'AbortError') return; }   // أغلق المستخدم النافذة
  }
  try{
    await navigator.clipboard.writeText(SITE_URL);
    note('تم نسخ الرابط، الصقه عند أصدقائك ✅');
  }catch(err){
    window.prompt('انسخ الرابط وشاركه مع أصدقائك:', SITE_URL);
  }
}
$('shareSite').addEventListener('click', shareSite);

window.addEventListener('load', ()=> setTimeout(render,200));
tickTimer();

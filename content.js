/* المحتوى: الأيقونات + نصوص النوافذ السفلية (لا تحتاج لتعديل يومي) */
/* ============ أيقونات ============ */
const IC = {
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  help:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  lock:'<path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>',
  ads:'<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

/* ============ المحتوى ============ */
const usd = n => '<bdi dir="ltr">$' + Number(n.toFixed(2)) + '</bdi>';
function prizeTable(){
  const rows = TIERS.map(t=>`<div class="tr"><span class="rk">${t.rank}</span><span class="money">${usd(t.each)}</span><span class="tot">${usd(t.each*t.n)}</span></div>`).join('');
  return `<div class="tbl"><div class="tr th"><span>الترتيب</span><span>مكافأة كل فائز</span><span>إجمالي المستوى</span></div>${rows}</div>`;
}

const SHEETS = {
  prizes:{
    title:'<span class="tag g">الجوائز</span> اليومية',
    html:()=>`
      <p>يتم اختيار <b>20 فائز</b> كل يوم بمبلغ جوائز ثابت، وتُرسل الجوائز عبر Binance ID بعد السحب مباشرة.</p>
      ${prizeTable()}`
  },
  how:{
    title:'كيف <span class="tag g">يعمل</span> السحب',
    html:()=>`<ol>
      <li>اضغط على زر <b>«شارك»</b>.</li>
      <li>بعد ذلك تخطَّ الروابط.</li>
      <li>بعد الانتهاء من التخطي سيتم توجيهك إلى قروب تيليغرام، ضع فيه <b>Binance ID</b> الخاص بك.</li>
      <li>سيتم اختيار الفائزين مباشرة بعد انتهاء المؤقت الزمني.</li>
    </ol>
    <div class="box">يُمنع تكرار وضع الـ ID.</div>`
  },
  fair:{
    title:'<span class="tag g">الشفافية</span> والتحقق',
    html:()=>`
      <p>يتم حالياً اختيار فقط <b>20 فائز</b> يومياً ويتم إرسال المال إليهم عبر قناة تيليغرام للمصداقية.</p>
      <p>اشترك في قناتنا ولا تفوت أي جديد 📢🎉</p>`
  },
  ads:{
    title:'<span class="tag g">التمويل</span> والإعلانات',
    html:()=>`
      <p>نعلم أن عدد الفائزين قليل ونسبة الأرباح قليلة لأن منصة <b>Dz2link</b> حديثة الإنشاء، ولكن سنزيد عدد الفائزين ونحسّن نسبة الأرباح في المستقبل القريب، لذا ابقوا معنا وادعمونا ❤️🙂</p>`
  },
  terms:{
    title:'<span class="tag v">الشروط</span> والأحكام',
    html:()=>`
      <p>منصة <b>Dz2link</b> لا تتحمل مسؤولية أي إعلانات مزعجة، والمنصة مجانية بالكامل ولا نطلب منك أي شراء أو دفع، فقط شارك واربح معنا جوائز مالية كل يوم ⛔️🤝</p>`
  }
};

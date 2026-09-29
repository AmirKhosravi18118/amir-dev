<script>
const I18N = {
"tb.text":{"en":"NEW — every app is free to try for a full month. No card needed.","de":"NEU — jede App ist einen ganzen Monat gratis testbar. Keine Karte nötig.","fa":"جدید — هر اپ یک ماه کامل رایگان تست می‌شود. بدون کارت بانکی."},
"tb.cta":{"en":"Pick yours ↗","de":"Wähle deine ↗","fa":"انتخاب کن ↗"},
"nav.products":{"en":"Products","de":"Produkte","fa":"محصولات"},
"nav.pricing":{"en":"Pricing","de":"Preise","fa":"قیمت‌ها"},
"nav.how":{"en":"How it works","de":"So funktioniert's","fa":"نحوه استفاده"},
"nav.support":{"en":"Support","de":"Support","fa":"پشتیبانی"},
"nav.faq":{"en":"FAQ","de":"FAQ","fa":"سؤالات متداول"},
"nav.cta":{"en":"Start free","de":"Gratis starten","fa":"شروع رایگان"},
"ac.navacct":{"en":"My account","de":"Mein Konto","fa":"حساب من"},
"ac.navcart":{"en":"Cart","de":"Warenkorb","fa":"سبد خرید"},
"nl.badge":{"en":"NELURIO SUITE · BY AMIR KHOSRAVI","de":"NELURIO SUITE · VON AMIR KHOSRAVI","fa":"مجموعه نلوریو · ساخته امیر خسروی"},
"nl.h1a":{"en":"Stop juggling tools.","de":"Schluss mit Tool-Chaos.","fa":"وسایل پراکنده را کنار بگذار."},
"nl.h1b":{"en":"Run everything from one library.","de":"Alles aus einer Bibliothek.","fa":"همه‌چیز از یک کتابخانه."},
"nl.sub":{"en":"The product library of Amir Khosravi — focused apps for studying, money, language and real business operations.","de":"Die Produktbibliothek von Amir Khosravi — fokussierte Apps für Studium, Finanzen, Sprache und echte Geschäftsabläufe.","fa":"کتابخانه محصولات امیر خسروی — اپ‌های متمرکز برای تحصیل، مالی، زبان و عملیات واقعی کسب‌وکار."},
"nl.lead":{"en":"Pick an app, start your free month and get productive today. No credit card. No setup. EU-hosted and GDPR-first from day one.","de":"Wähle eine App, starte deinen Gratis-Monat و werde heute produktiv. Keine Kreditkarte. Kein Setup. EU-gehostet und DSGVO-first von Anfang an.","fa":"یک اپ انتخاب کن، ماه رایگانت را شروع کن و همین امروز بهره‌ور شو. بدون کارت بانکی، بدون راه‌اندازی. از روز اول میزبانی اروپا و GDPR-محور."},
"nl.cta.trial0":{"en":"Start your free month","de":"Starte deinen Gratis-Monat","fa":"ماه رایگانت را شروع کن"},
"nl.cta.browse":{"en":"Explore the products","de":"Produkte entdecken","fa":"مشاهده محصولات"},
"nl.builder":{"en":"Built end-to-end by","de":"Komplett gebaut von","fa":"ساخته شده توسط"},
"nl.builder2":{"en":" — developer & BWL student, Rhein-Main. The story behind every product lives on the portfolio.","de":" — Entwickler & BWL-Student, Rhein-Main. Die Geschichte hinter jedem Produkt findest du im Portfolio.","fa":" — توسعه‌دهنده و دانشجوی BWL، راین‌ماین. داستان هر محصول در پورتفولیوست."},
"pf.1":{"en":"4 live products","de":"4 live Produkte","fa":"۴ محصول لایو"},
"pf.2":{"en":"EU-hosted","de":"EU-gehostet","fa":"میزبانی اروپا"},
"pf.3":{"en":"24/7 monitoring","de":"24/7-Monitoring","fa":"مانیتورینگ ۲۴/۷"},
"pf.4":{"en":"GDPR delete anytime","de":"DSGVO-Löschung jederzeit","fa":"حذف GDPR هر زمان"},
"lib.kicker":{"en":"The library","de":"Die Bibliothek","fa":"کتابخانه"},
"lib.h2":{"en":"Four products. One shelf.","de":"Vier Produkte. Ein Regal.","fa":"چهار محصول. یک قفسه."},
"lib.lead":{"en":"Every card is a real, running product — not a demo. Open one and use it right now.","de":"Jede Karte ist ein echtes, laufendes Produkt — keine Demo. Öffne eines und leg sofort los.","fa":"هر کارت یک محصول واقعی و در حال اجراست — نه دمو. یکی را باز کن و همین حالا استفاده کن."},
"st.beta":{"en":"LIVE · BETA — 1 MONTH FREE","de":"LIVE · BETA — 1 MONAT GRATIS","fa":"لایو · بتا — ۱ ماه رایگان"},
"st.live":{"en":"LIVE — 1 MONTH FREE","de":"LIVE — 1 MONAT GRATIS","fa":"لایو — ۱ ماه رایگان"},
"st.daily":{"en":"LIVE · DAILY USE","de":"LIVE · TÄGLICH IM EINSATZ","fa":"لایو · استفاده روزانه"},
"n.trial":{"en":"Start 1-month free trial","de":"1 Monat gratis testen","fa":"شروع تست رایگان ۱ ماهه"},
"n.buy":{"en":"Buy product","de":"Produkt kaufen","fa":"خرید محصول"},
"n1.flag":{"en":"FLAGSHIP APP","de":"LEUCHTTURM-APP","fa":"اپ پرچم‌دار"},
"n1.what":{"en":"AI study assistant for university students — record a lecture, get summaries, spaced-repetition reviews, flashcards & a tutor that answers from your own materials with citations.","de":"KI-Lernassistent für Studierende — Vorlesung aufnehmen, Zusammenfassungen erhalten, Wiederholungen planen, Lernkarten & ein Tutor, der aus deinen eigenen Materialien mit Quellen antwortet.","fa":"دستیار مطالعه هوش مصنوعی برای دانشجوها — ویدیوی کلاس را ضبط کن، خلاصه بگیر، مرورهای فاصله‌دار، فلش‌کارت و یک معلم که از جزوه‌های خودت با ذکر منبع جواب می‌دهد."},
"n1.f1":{"en":"Lecture recording with AI summaries","de":"Vorlesungsaufnahme mit KI-Zusammenfassungen","fa":"ضبط کلاس با خلاصه‌سازی هوش مصنوعی"},
"n1.f2":{"en":"Spaced-repetition review planner","de":"Wiederholungsplaner mit Spaced Repetition","fa":"برنامه‌ریز مرور فاصله‌دار"},
"n1.f3":{"en":"Tutor answers with citations","de":"Tutor antwortet mit Quellen","fa":"معلم با پاسخ مستند"},
"n1.price":{"en":"1-month free trial · then €4.99/mo","de":"1 Monat gratis · danach 4,99 €/Mon.","fa":"۱ ماه رایگان · سپس ۴٫۹۹ € در ماه"},
"n2.flag":{"en":"FINANCE","de":"FINANZEN","fa":"مالی"},
"n2.what":{"en":"Personal finance app for students in Germany — budget calendar with recurring payments, expenses & transactions, and a tax overview for student jobs.","de":"Persönliche Finanz-App für Studierende in Deutschland — Budget-Kalender mit wiederkehrenden Zahlungen, Ausgaben & Transaktionen و Steuer-Überblick für Studentenjobs.","fa":"اپ مالی شخصی برای دانشجوهای آلمان — تقویم بودجه با پرداخت‌های تکرارشونده، هزینه‌ها و تراکنش‌ها و نمای مالیاتی برای کارهای دانشجویی."},
"n2.f1":{"en":"Budget calendar","de":"Budget-Kalender","fa":"تقویم بودجه"},
"n2.f2":{"en":"Recurring payments tracking","de":"Wiederkehrende Zahlungen","fa":"پیگیری پرداخت‌های تکرارشونده"},
"n2.f3":{"en":"Tax overview for mini-jobs","de":"Steuer-Überblick für Minijobs","fa":"نمای مالیاتی مینی‌جاب‌ها"},
"n2.price":{"en":"1-month free trial · then €2.99/mo","de":"1 Monat gratis · danach 2,99 €/Mon.","fa":"۱ ماه رایگان · سپس ۲٫۹۹ € در ماه"},
"n3.flag":{"en":"OPERATIONS","de":"OPERATIONS","fa":"عملیات"},
"n3.what":{"en":"Operations app for a real car-wash business — day-to-day operations, tracking and workflow. In daily use on site since launch.","de":"Operations-App für eine echte Autowaschanlage — Tagesbetrieb, Tracking und Workflow. Seit Launch täglich im Einsatz.","fa":"اپ عملیات برای یک کارواش واقعی — عملیات روزانه، پیگیری و گردش کار. از زمان عرضه هر روز در محل استفاده می‌شود."},
"n3.f1":{"en":"Day-to-day operations","de":"Tagesbetrieb","fa":"عملیات روزانه"},
"n3.f2":{"en":"Real-time tracking","de":"Echtzeit-Tracking","fa":"پیگیری لحظه‌ای"},
"n3.f3":{"en":"Built with a real customer","de":"Mit echtem Kunden gebaut","fa":"ساخته‌شده با مشتری واقعی"},
"n3.price":{"en":"1-month free trial · then €9.99/mo","de":"1 Monat gratis · danach 9,99 €/Mon.","fa":"۱ ماه رایگان · سپس ۹٫۹۹ € در ماه"},
"n4.flag":{"en":"LANGUAGE","de":"SPRACHE","fa":"زبان"},
"n4.what":{"en":"German vocabulary learning platform — structured practice sessions with spaced practice. Nelurio's review engine was born from what I learned here; a rework is in progress.","de":"Plattform zum Deutsch-Vokabeln lernen — strukturierte Übungen mit Spaced Practice. Nelurios Wiederholungs-Engine entstand aus den Erfahrungen hier; eine Überarbeitung läuft.","fa":"پلتفرم یادگیری لغات آلمانی — جلسات تمرین ساختاریافته با تکرار فاصله‌دار. موتور مرور نلوریو از همین‌جا متولد شد؛ بازنویسی در جریان است."},
"n4.f1":{"en":"Structured practice sessions","de":"Strukturierte Übungseinheiten","fa":"جلسات تمرین ساختاریافته"},
"n4.f2":{"en":"Spaced repetition","de":"Spaced Repetition","fa":"تکرار فاصله‌دار"},
"n4.f3":{"en":"Built for the German market","de":"Für den deutschen Markt","fa":"ساخته‌شده برای بازار آلمان"},
"n4.price":{"en":"1-month free trial · then €3.49/mo","de":"1 Monat gratis · danach 3,49 €/Mon.","fa":"۱ ماه رایگان · سپس ۳٫۴۹ € در ماه"},
"pr.kicker":{"en":"Pricing","de":"Preise","fa":"قیمت‌ها"},
"pr.h2":{"en":"Try free for a month. Then pick your plan.","de":"Einen Monat gratis testen. Dann Plan wählen.","fa":"یک ماه رایگان تست کن. بعد پلنت را انتخاب کن."},
"pr.lead":{"en":"Every app starts with a full free month — no credit card. Stay on the free core or go premium.","de":"Jede App startet mit einem ganzen Gratis-Monat — keine Kreditkarte. Bleibe im Gratis-Kern oder werde Premium.","fa":"هر اپ با یک ماه کامل رایگان شروع می‌شود — بدون کارت بانکی. روی هستهٔ رایگان بمان یا پریمیوم شو."},
"pr.flagship":{"en":"FLAGSHIP","de":"FLAGGSCHIFF","fa":"پرچم‌دار"},
"pr.mo":{"en":"/ month","de":"/ Monat","fa":"/ ماه"},
"pr.buy":{"en":"Get started","de":"Loslegen","fa":"شروع کن"},
"pr.yr1":{"en":"or €49.90 / year (2 months free)","de":"oder 49,90 € / Jahr (2 Monate gratis)","fa":"یا ۴۹٫۹۰ € / سال (۲ ماه رایگان)"},
"pr.yr2":{"en":"or €29.90 / year (2 months free)","de":"oder 29,90 € / Jahr (2 Monate gratis)","fa":"یا ۲۹٫۹۰ € / سال (۲ ماه رایگان)"},
"pr.yr3":{"en":"or €34.90 / year (2 months free)","de":"oder 34,90 € / Jahr (2 Monate gratis)","fa":"یا ۳۴٫۹۰ € / سال (۲ ماه رایگان)"},
"pr.yr4":{"en":"or €99.90 / year (2 months free)","de":"oder 99,90 € / Jahr (2 Monate gratis)","fa":"یا ۹۹٫۹۰ € / سال (۲ ماه رایگان)"},
"pr.note":{"en":"All plans start with a 1-month free trial — no credit card required. Cancel anytime.","de":"Alle Pläne starten mit einem 1-Monat-Gratis-Test — keine Kreditkarte. Jederzeit kündbar.","fa":"همه پلن‌ها با یک ماه تست رایگان شروع می‌شوند — بدون کارت بانکی. هر زمان قابل لغو."},
"how.kicker":{"en":"How it works","de":"So funktioniert's","fa":"نحوه استفاده"},
"how.h2":{"en":"From visitor to user in three steps.","de":"Von Besucher zu Nutzer in drei Schritten.","fa":"در سه قدم از بازدیدکننده به کاربر."},
"how.lead":{"en":"No installation, no credit card — pick an app and start.","de":"Keine Installation, keine Kreditkarte — App wählen und starten.","fa":"بدون نصب، بدون کارت بانکی — اپ را انتخاب کن و شروع کن."},
"how.s1t":{"en":"Pick an app","de":"App wählen","fa":"اپ را انتخاب کن"},
"how.s1b":{"en":"Every card above is live. Choose the tool that fits what you need today.","de":"Jede Karte oben ist live. Wähle das Werkzeug, das heute zu dir passt.","fa":"هر کارت بالا لایو است. ابزاری را انتخاب کن که امروز به کارت می‌آید."},
"how.s2t":{"en":"Start your free month","de":"Starte deinen Gratis-Monat","fa":"ماه رایگانت را شروع کن"},
"how.s2b":{"en":"Create your account inside the app — the 30-day trial starts instantly, no card needed.","de":"Erstelle dein Konto in der App — der 30-Tage-Test startet sofort, keine Karte nötig.","fa":"داخل اپ حسابت را بساز — تست ۳۰ روزه فوراً شروع می‌شود، بدون کارت."},
"how.s3t":{"en":"Your data stays yours","de":"Deine Daten bleiben deine","fa":"داده‌هایت مال خودت می‌ماند"},
"how.s3b":{"en":"EU-hosted infrastructure, GDPR-first defaults — and you can delete your account and all its data yourself, any time.","de":"EU-gehostete Infrastruktur, DSGVO-first — und du kannst dein Konto samt Daten jederzeit selbst löschen.","fa":"زیرساخت اروپا، پیش‌فرض‌های GDPR — و هر زمان خودت می‌توانی حسابت و همه داده‌هایش را حذف کنی."},
"su.kicker":{"en":"Support","de":"Support","fa":"پشتیبانی"},
"su.h2":{"en":"Real humans answer. Fast.","de":"Echte Menschen antworten. Schnell.","fa":"آدم‌های واقعی جواب می‌دهند. سریع."},
"su.lead":{"en":"You are not talking to a ticket black hole — the person who built the product answers.","de":"Du redest nicht in ein Ticket-Loch — der Mensch, der das Produkt gebaut hat, antwortet.","fa":"با سیاه‌چالهٔ تیکت حرف نمی‌زنی — کسی که محصول را ساخته جواب می‌دهد."},
"su.o1":{"en":"Email support","de":"E-Mail-Support","fa":"پشتیبانی ایمیلی"},
"su.o1b":{"en":"Write to support@nelurio.com — response within 24 hours on business days, usually much faster.","de":"Schreibe an support@nelurio.com — Antwort innerhalb von 24 Stunden an Werktagen, meist schneller.","fa":"به support@nelurio.com بنویس — پاسخ در ۲۴ ساعت کاری، معمولاً خیلی سریع‌تر."},
"su.mail":{"en":"support@nelurio.com","de":"support@nelurio.com","fa":"support@nelurio.com"},
"su.o2":{"en":"Live chat & WhatsApp","de":"Live-Chat & WhatsApp","fa":"چت زنده و واتساپ"},
"su.o2b":{"en":"Use the chat bubble on every page — WhatsApp or email, straight to the builder.","de":"Nutze die Chat-Blase auf jeder Seite — WhatsApp oder E-Mail, direkt zum Entwickler.","fa":"از حباب چت در گوشهٔ هر صفحه استفاده کن — واتساپ یا ایمیل، مستقیم به سازنده."},
"su.o2c":{"en":"Open chat","de":"Chat öffnen","fa":"باز کردن چت"},
"fq.kicker":{"en":"FAQ","de":"FAQ","fa":"سؤالات متداول"},
"fq.h2":{"en":"Questions, answered.","de":"Fragen, beantwortet.","fa":"سؤالات، پاسخ‌گفته."},
"fq.lead":{"en":"Anything else? support@nelurio.com — answered within 24 hours.","de":"Noch etwas? support@nelurio.com — Antwort innerhalb von 24 Stunden.","fa":"چیز دیگر؟ support@nelurio.com — پاسخ در ۲۴ ساعت."},
"fq.q1":{"en":"Is there a free trial?","de":"Gibt es eine Gratis-Testphase?","fa":"تست رایگان دارید؟"},
"fq.a1":{"en":"Yes — every app comes with a full 1-month free trial. No credit card required, and you keep everything you created.","de":"Ja — jede App kommt mit einem vollen 1-Monat-Gratis-Test. Keine Kreditkarte, und du behältst alles, was du erstellt hast.","fa":"بله — هر اپ یک ماه کامل تست رایگان دارد. بدون کارت بانکی و همه چیزهایی که ساختی برایت می‌ماند."},
"fq.q2":{"en":"Where is my data stored?","de":"Wo werden meine Daten gespeichert?","fa":"داده‌هایم کجا ذخیره می‌شوند؟"},
"fq.a2":{"en":"On EU-hosted infrastructure in Germany/Europe. GDPR-first defaults, and you can delete your account and all data yourself, anytime.","de":"Auf EU-gehosteter Infrastruktur. DSGVO-first, und du kannst Konto und Daten jederzeit selbst löschen.","fa":"روی زیرساخت میزبانی‌شده در اروپا. GDPR-محور و هر زمان خودت می‌توانی حسابت و داده‌ها را حذف کنی."},
"fq.q3":{"en":"How do I pay?","de":"Wie zahle ich?","fa":"چطور پرداخت می‌کنم؟"},
"fq.a3":{"en":"PayPal, Visa/Mastercard/debit via Stripe for Europe — and Zarinpal for customers in Iran. Checkout happens right here on nelurio.com.","de":"PayPal, Visa/Mastercard/Debit via Stripe für Europa — und Zarinpal für Kunden im Iran. Checkout direkt auf nelurio.com.","fa":"پی‌پال، ویزا/مسترکارت/دبیت با استریپ برای اروپا — و زرین‌پال برای کاربران ایران. پرداخت همین‌جا در nelurio.com انجام می‌شود."},
"fq.q4":{"en":"Can I cancel anytime?","de":"Kann ich jederzeit kündigen?","fa":"می‌توانم هر زمان لغو کنم؟"},
"fq.a4":{"en":"Yes. No lock-in, no hidden fees. You keep access until the end of your paid period.","de":"Ja. Kein Lock-in, keine versteckten Kosten. Zugang bleibt bis zum Ende der bezahlten Laufzeit.","fa":"بله. بدون قفل، بدون هزینهٔ پنهان. دسترسی‌ات تا پایان دورهٔ پرداخت‌شده باقی می‌ماند."},
"fq.q5":{"en":"Who builds Nelurio Suite?","de":"Wer baut Nelurio Suite?","fa":"چه کسی Nelurio Suite را می‌سازد؟"},
"fq.a5":{"en":"Amir Khosravi — software developer and BWL student in Rhein-Main, Germany. Every product is designed, built and operated by the same person you email.","de":"Amir Khosravi — Softwareentwickler und BWL-Student in Rhein-Main. Jedes Produkt wird von derselben Person entworfen, gebaut und betrieben, die auch deine E-Mail beantwortet.","fa":"امیر خسروی — توسعه‌دهندهٔ نرم‌افزار و دانشجوی BWL در راین‌ماین آلمان. هر محصول توسط همان کسی طراحی، ساخته و اداره می‌شود که ایمیلت را جواب می‌دهد."},
"fin.h2":{"en":"Your free month is one click away.","de":"Dein Gratis-Monat ist einen Klick entfernt.","fa":"ماه رایگانت یک کلیک فاصله دارد."},
"fin.p":{"en":"Pick an app, create your account and see why the Nelurio library keeps growing.","de":"Wähle eine App, erstelle dein Konto und sieh, warum die Nelurio-Bibliothek weiter wächst.","fa":"یک اپ انتخاب کن، حسابت را بساز و ببین چرا کتابخانهٔ نلوریو بزرگ‌تر می‌شود."},
"fin.cta":{"en":"Start your free month","de":"Starte deinen Gratis-Monat","fa":"ماه رایگانت را شروع کن"},
"ft.about":{"en":"Four production-ready apps on one EU-hosted platform — built and operated by Amir Khosravi.","de":"Vier produktionsreife Apps auf einer EU-gehosteten Plattform — gebaut und betrieben von Amir Khosravi.","fa":"چهار اپ آمادهٔ تولید روی یک پلتفرم اروپایی — ساخته و اداره‌شده توسط امیر خسروی."},
"ft.products":{"en":"Products","de":"Produkte","fa":"محصولات"},
"ft.legal":{"en":"Legal","de":"Rechtliches","fa":"قانونی"},
"f.imprint":{"en":"Impressum","de":"Impressum","fa":"Impressum"},
"f.privacy":{"en":"Privacy Policy","de":"Datenschutzerklärung","fa":"سیاست حریم خصوصی"},
"f.terms":{"en":"Terms & Conditions","de":"AGB","fa":"شرایط و مقررات"},
"f.withdraw":{"en":"Right of Withdrawal","de":"Widerrufsbelehrung","fa":"حق انصراف"},
"f.contact":{"en":"Contact / Support","de":"Kontakt / Support","fa":"تماس / پشتیبانی"},
"f.portfolio":{"en":"Portfolio","de":"Portfolio","fa":"پورتفولیو"},
"cons.text":{"en":"This site uses consent-based, privacy-friendly analytics — page statistics only, no ads, no cross-site tracking. You decide; change your mind anytime by clearing this site's data.","de":"Diese Website nutzt einwilligungsbasierte, datenschutzfreundliche Analytik — nur Seitenstatistik, keine Werbung, kein übergreifendes Tracking. Du entscheidest؛ هر زمان با پاک کردن داده‌های سایت می‌توانی نظرت را عوض کنی.","fa":"این سایت از تحلیل آماری مبتنی بر رضایت استفاده می‌کند — فقط آمار بازدید، بدون تبلیغ و ردیابی بین‌سایتی. تصمیم با توست؛ هر زمان با پاک کردن داده‌های سایت می‌توانی نظرت را عوض کنی."},
"cons.accept":{"en":"Accept","de":"Akzeptieren","fa":"می‌پذیرم"},
"cons.decline":{"en":"Decline","de":"Ablehnen","fa":"رد می‌کنم"}
};
function toggleLangDD(){
  const m = document.getElementById('lang-dd-menu');
  m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}
document.addEventListener('click', e => {
  const dd = document.querySelector('.lang-dd');
  if(dd && !dd.contains(e.target)) { const m = document.getElementById('lang-dd-menu'); if(m) m.style.display = 'none'; }
});
function setLang(l){
  document.documentElement.setAttribute('data-lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = (l === 'fa') ? 'rtl' : 'ltr';
  const lbl = document.getElementById('lang-label');
  if(lbl) lbl.textContent = l.toUpperCase() === 'FA' ? 'فا' : l.toUpperCase();
  const menu = document.getElementById('lang-dd-menu');
  if(menu) menu.style.display = 'none';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const v = I18N[el.getAttribute('data-i18n')];
    if(v && v[l]) el.textContent = v[l];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    const v = I18N[el.getAttribute('data-i18n-aria')];
    if(v && v[l]) el.setAttribute('aria-label', v[l]);
  });
  try{localStorage.setItem('lang',l)}catch(e){}
  document.dispatchEvent(new CustomEvent('langchange'));
}
try{const saved=localStorage.getItem('lang'); if(saved) setLang(saved);}catch(e){}
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const shelfEl = shelf(); if(shelfEl) shelfEl.addEventListener('scroll', shelfEnds, {passive:true});
shelfEnds();
shelfFocus();
const shelf = () => document.querySelector(".lib");
function shelfScroll(dir){
  const el = shelf(); if(!el) return;
  const card = el.querySelector(".prod");
  const step = card ? card.getBoundingClientRect().width + 24 : 400;
  const rtl = document.documentElement.dir === "rtl";
  el.scrollBy({ left: dir * step * (rtl ? -1 : 1), behavior: "smooth" });
}
function shelfEnds(){
  const el = shelf(); if(!el) return;
  const prev = document.getElementById("shelf-prev"), next = document.getElementById("shelf-next");
  if(!prev || !next) return;
  const max = el.scrollWidth - el.clientWidth - 2;
  const pos = Math.abs(el.scrollLeft);
  const rtl = document.documentElement.dir === "rtl";
  const atStart = rtl ? pos >= max : pos <= 2;
  const atEnd = rtl ? pos <= 2 : pos >= max;
  prev.disabled = atStart; next.disabled = atEnd;
}
window.addEventListener("load", shelfEnds);
window.addEventListener("resize", shelfEnds);
document.addEventListener("langchange", shelfEnds);
function cartGet(){ try{ return JSON.parse(localStorage.getItem("nelurio_cart")||"[]"); }catch(e){ return []; } }
function cartSet(v){ try{ localStorage.setItem("nelurio_cart", JSON.stringify(v)); }catch(e){} cartBadge(); }
function shelfFocus(){
  const h = location.hash;
  if(!h || !h.startsWith("#p-")) return;
  const el = document.querySelector(h);
  if(el) el.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
}
window.addEventListener("hashchange", shelfFocus);
function cartBadge(){ const b = document.getElementById("cart-badge"); if(!b) return; const n = cartGet().length; b.textContent = n; b.classList.toggle("hidden", n === 0); }
function addToCart(slug){ const c = cartGet(); if(!c.includes(slug)){ c.push(slug); cartSet(c); } const b = document.getElementById("cart-badge"); if(b){ b.animate([{transform:"scale(1.5)"},{transform:"scale(1)"}],{duration:250}); } }
cartBadge();
</script>
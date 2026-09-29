# SYNC-CHECKPOINT — حالت هماهنگی گیت و نقطه‌ی ادامه (2026-09-29)

> این فایل نقطه‌ی سرگردان است: هر session‌ای که بخواهد هماهنگی گیت‌هاب را از نو
> شروع کند، از همین‌جا شروع می‌کند. آخرین به‌روزرسانی: 2026-09-29 شب.

## وضعیت فعلی (تأیید‌شده)

| ریپو | محلی | origin/main | وضعیت |
|---|---|---|---|
| amir-dev (portfolio) | main | sync | ✅ 58/58 تست سبز، آخرین PR: #74 |
| nelurio-code | main | sync | ✅ تمیز |
| finello | main | sync | ✅ تمیز |
| NexDeutsch | main | sync | ✅ تمیز |
| Waschhalle_App | main | sync | ✅ تمیز |

- هیچ کامیت محلیِ پوش‌نشده وجود ندارد.
- هیچ فایل dirty بدون پوشش وجود ندارد (فقط ابزارها در tools/).
- صفحه‌های لایو روی VPS با origin/main هم‌خوان هستند (دیپلوی 2026-09-29 شب).

## اگر بعداً محدودیت گیت‌هاب پیش آمد

1. **هیچ چیز گم نمی‌شود**: منبع حقیقت = این پوشه‌های محلی + اسنپ‌شات روی VPS
   (`/opt/backups/` — از بایگانی بخواه تازه‌اش کند).
2. تا رفع محدودیت: کار را محلی ادامه بده، کامیت کن (کامیت محلی آزاد است)،
   فقط `push` را نگه دار.
3. بعد از رفع محدودیت: `git push origin main` در هر ریپو + `gh run watch` برای CI.

## چک‌لیست هماهنگ‌سازی مجدد با گیت‌هاب (ترتیب اجرا)

1. `git status --short` در هر ۵ ریپو — باید خالی یا فقط tools/ باشد.
2. `git log origin/main..HEAD` — کامیت‌های عقب‌مانده را push کن.
3. `gh api repos/AmirKhosravi18118/amir-dev/actions/runs?per_page=5` — وضعیت CI.
4. مقایسه webroot های VPS با origin/main:
   `diff <(curl -s https://nelurio.com/checkout.html) checkout.html` (باید خروجی برابر باشد؛
   آدرس صفحات: nelurio.com → platform/index.html, amir → amir/*).
5. ابزارها: `node tools/i18n-audit.mjs` (سه زبان) + `node tools/responsive-audit.mjs`
   (ریسپانسیو) + `npx playwright test` (۵۸ تست) — هر سه باید سبز باشند.

## واگذاری‌های باز به بایگانی (بخش بایگانی طبق قانون شرکت)

- دفتر نقض‌ها: هیچ نقض باز فعلاً ثبت نشده (گارد pre-push یک پوش غیرمجاز را همان
  شب رد کرد — ثبت شد، پرونده بسته).
- یادآوری‌های owner (در انتظار خود امیر): ثبت‌نام زرین‌پال + ۸ لینک پرداخت،
  IBAN/BIC واقعی، آدرس لینکدین برای CV، حذف اتوماسیون‌های قدیمی از صفحه Automations.

## ابزارهای ماندگار این ریپو

- `tools/i18n-audit.mjs` — ممیزی سه‌زبانه (۶ صفحه × ۲ زبان)
- `tools/responsive-audit.mjs` — ممیزی ریسپانسیو (۶ صفحه × ۳ عرض)
- `tools/qc-account.mjs` — QC تصویری پنل کاربری

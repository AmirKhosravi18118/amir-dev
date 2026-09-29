import io, re

p = "chat.html"
s = io.open(p, encoding="utf-8").read()
changed = 0

# 1) route all six hardcoded status strings through a dict lookup
pairs = [
    ("status.textContent = CH_I18N['ch.err.email'] ? CH_I18N['ch.err.email'].fa || 'Enter email' : 'Enter email';",
     "status.textContent = L('ch.err.email');"),
    ("status.textContent = '\u0644\u0637\u0641\u0627\u064b \u067e\u06cc\u0627\u0645\u062a \u0631\u0627 \u0628\u0646\u0648\u06cc\u0633.';",
     "status.textContent = L('ch.err.msg');"),
    ("status.textContent = '\u23f3 Sending\u2026';",
     "status.textContent = L('ch.sending');"),
    ("status.textContent = CH_I18N['ch.ok'] ? CH_I18N['ch.ok'].fa || 'Sent!' : '\u2705 Sent!';",
     "status.textContent = L('ch.ok');"),
    ("status.textContent = '\u274c Failed, please use WhatsApp or email.';",
     "status.textContent = L('ch.err.send');"),
    ("status.textContent = '\u274c Connection error, try WhatsApp.';",
     "status.textContent = L('ch.err.conn');"),
]
for old, new in pairs:
    if old in s:
        s = s.replace(old, new, 1)
        changed += 1

# 2) define L right before the first routed call
ldef = "const L = (k) => { const v = CH_I18N[k]; return (v && (v[(document.documentElement.lang) || 'en'] || v.en)) || k; };\n  "
anchor = "status.textContent = L('ch.err.email');"
if "const L = (k)" not in s:
    assert anchor in s, "L anchor"
    s = s.replace(anchor, ldef + anchor, 1)
    changed += 1

# 3) missing keys
if '"ch.sending"' not in s:
    m = re.search(r'"ch\.err\.send":\{[^}]*\}(,)?', s)
    assert m, "ch.err.send key"
    add = ('"ch.sending":{"en":"\u23f3 Sending\u2026","de":"\u23f3 Wird gesendet\u2026","fa":"\u23f3 \u062f\u0631 \u062d\u0627\u0644 \u0627\u0631\u0633\u0627\u0644\u2026"},\n'
           '"ch.err.conn":{"en":"\u274c Connection error, try WhatsApp.","de":"\u274c Verbindungsfehler \u2013 WhatsApp versuchen.","fa":"\u274c \u062e\u0637\u0627\u06cc \u0627\u062a\u0635\u0627\u0644\u060c \u0648\u0627\u062a\u0633\u0627\u067e \u0631\u0627 \u0627\u0645\u062a\u062d\u0627\u0646 \u06a9\u0646."},\n')
    s = s[:m.start()] + add + s[m.start():]
    changed += 1
if '"ch.msg.ph"' not in s:
    m = re.search(r'"ch\.sending":\{[^}]*\},', s)
    assert m, "ch.sending key"
    s = s[:m.start()] + '"ch.msg.ph":{"en":"Write your question here\u2026","de":"Schreib hier deine Frage\u2026","fa":"\u0633\u0624\u0627\u0644\u062a \u0631\u0627 \u0627\u06cc\u0646\u062c\u0627 \u0628\u0646\u0648\u06cc\u0633\u2026"},\n' + s[m.start():]
    changed += 1

# 4) fa grammar fix on ch.err.send
old_fa = '"fa":"\u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062f\u060c \u0644\u0637\u0641\u0627\u064b \u0648\u0627\u062a\u0633\u0627\u067e \u06cc\u0627 \u0627\u06cc\u0645\u06cc\u0644 \u0631\u0627 \u0645\u0633\u062a\u0642\u06cc\u0645 \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u06a9\u0646."'
if old_fa in s:
    s = s.replace(old_fa, '"fa":"\u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062f\u060c \u0644\u0637\u0641\u0627\u064b \u0645\u0633\u062a\u0642\u06cc\u0645 \u0627\u0632 \u0648\u0627\u062a\u0633\u0627\u067e \u06cc\u0627 \u0627\u06cc\u0645\u06cc\u0644 \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u06a9\u0646."', 1)
    changed += 1

# 5) textarea placeholder i18n
ph_old = 'placeholder="Write your question here\u2026"'
if ph_old in s:
    s = s.replace(ph_old, 'data-i18n-placeholder="ch.msg.ph" placeholder="Write your question here\u2026"', 1)
    changed += 1

# 6) setLang placeholder support
old_set = "    const v = CH_I18N[el.getAttribute('data-i18n')];\n    if(v && v[l]) el.textContent = v[l];\n  });"
new_set = old_set + "\n  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{\n    const v = CH_I18N[el.getAttribute('data-i18n-placeholder')];\n    if(v && v[l]) el.setAttribute('placeholder', v[l]);\n  });"
if "data-i18n-placeholder" in s and "getAttribute('data-i18n-placeholder')" not in s:
    assert old_set in s, "setLang anchor"
    s = s.replace(old_set, new_set, 1)
    changed += 1

# 7) drop dead ch.home key
s2 = re.sub(r'"ch\.home":\{[^}]*\},\n?', "", s, count=1)
if s2 != s:
    s = s2
    changed += 1

io.open(p, "w", encoding="utf-8", newline="").write(s)
print("chat.html:", changed, "changes")

# ---------- account.html remnants ----------
p = "account.html"
s = io.open(p, encoding="utf-8").read()
n = 0
for old, new in [
    ('"fa":"\u062d\u0633\u0627\u0628 \u0633\u0627\u062e\u062a\u0647 \u0634\u062f\u060c \u0648\u0627\u0631\u062f \u0634\u062f\u06cc."',
     '"fa":"\u062d\u0633\u0627\u0628 \u0633\u0627\u062e\u062a\u0647 \u0634\u062f\u060c \u0648\u0627\u0631\u062f \u0634\u062f\u0647\u200c\u0627\u06cc."'),
    ('"fa":"\u0648\u0627\u0634\u0647\u0627\u0644\u0647\u060c \u0639\u0645\u0644\u06cc\u0627\u062a \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631"',
     '"fa":"\u0648\u0627\u0634\u200c\u0647\u0627\u0644\u0647\u060c \u0639\u0645\u0644\u06cc\u0627\u062a \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631"'),
]:
    if old in s:
        s = s.replace(old, new, 1)
        n += 1
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("account.html:", n, "changes")

# ---------- products.html: consent keys + fa + پیشفرض ----------
p = "products.html"
s = io.open(p, encoding="utf-8").read()
m = re.search(r'"cons\.decline":\{[^}]*\},', s)
assert m, "products cons.decline"
new = ('"cons.decline":{"en":"Only essential","de":"Nur notwendige","fa":"\u0641\u0642\u0637 \u0636\u0631\u0648\u0631\u06cc\u200c\u0647\u0627"},\n'
       '"cons.customize":{"en":"Customize","de":"Anpassen","fa":"\u062a\u0646\u0638\u06cc\u0645 \u062f\u0642\u06cc\u0642"},\n'
       '"cons.save":{"en":"Save selection","de":"Auswahl speichern","fa":"\u0630\u062e\u06cc\u0631\u0647 \u0627\u0646\u062a\u062e\u0627\u0628"},\n'
       '"cons.cat.essential":{"en":"Essential \u2014 always active","de":"Notwendig \u2014 immer aktiv","fa":"\u0636\u0631\u0648\u0631\u06cc \u2014 \u0647\u0645\u06cc\u0634\u0647 \u0641\u0639\u0627\u0644"},\n'
       '"cons.cat.essential.desc":{"en":"Session login, shopping cart, language, chat history.","de":"Anmeldung, Warenkorb, Sprache, Chatverlauf.","fa":"\u0648\u0631\u0648\u062f\u060c \u0633\u0628\u062f \u062e\u0631\u06cc\u062f\u060c \u0632\u0628\u0627\u0646\u060c \u062a\u0627\u0631\u06cc\u062e\u0686\u0647 \u0686\u062a."},\n'
       '"cons.cat.stats":{"en":"Statistics","de":"Statistik","fa":"\u0622\u0645\u0627\u0631"},\n'
       '"cons.cat.stats.desc":{"en":"Anonymous page statistics via Google Analytics 4.","de":"Anonyme Seitenstatistik \u00fcber Google Analytics 4.","fa":"\u0622\u0645\u0627\u0631 \u0646\u0627\u0634\u0646\u0627\u0633 \u0628\u0627\u0632\u062f\u06cc\u062f \u0628\u0627 Google Analytics 4."},')
s = s[:m.start()] + new + s[m.end():]
s = s.replace("\u0628\u0647\u200c\u0635\u0648\u0631\u062a \u067e\u06cc\u0634\u0641\u0631\u0636", "\u0628\u0647\u200c\u0635\u0648\u0631\u062a \u067e\u06cc\u0634\u200c\u0641\u0631\u0636")
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("products.html: consent keys + fa")

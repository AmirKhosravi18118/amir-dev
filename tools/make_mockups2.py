# -*- coding: utf-8 -*-
"""Poster-style dashboard mockups (1400x900) for NexDeutsch / Washhalle / Saad Tattoo.
Real screenshots cropped for imagery + branded browser frame + sample data dashboards."""
import os, subprocess
from PIL import Image, ImageEnhance

BASE = r"D:\Z.Ai\portfolio"
M = os.path.join(BASE, "mock2")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# ---------- 1) crop real imagery ----------
def crop(src, box, out, w=None, bright=1.0):
    im = Image.open(os.path.join(M, src)).convert("RGB").crop(box)
    if bright != 1.0:
        im = ImageEnhance.Brightness(im).enhance(bright)
    if w:
        im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    im.save(os.path.join(M, out), quality=90)
    print(out, im.size)

crop("raw_saad.png",     (1046, 92, 1600, 662), "img_hands.jpg", 800, 1.06)   # tattooed hands hero
crop("raw_saad_gal.png", (40, 417, 884, 1252),  "img_eagle.jpg", 800)         # eagle chest tattoo
crop("raw_saad_gal.png", (926, 417, 1538, 1252),"img_feet.jpg", 700)          # fine-line footprints

# ---------- 2) shared shell ----------
def shell(url, content, bg, glows, chips=""):
    dots = "background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px);background-size:26px 26px;"
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1400px;height:900px;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;
  background:{bg};position:relative}}
.g{{position:absolute;border-radius:50%;filter:blur(90px)}}
.grid{{position:absolute;inset:0;{dots}}}
.win{{position:absolute;left:120px;top:82px;width:1160px;border-radius:18px;overflow:hidden;
  border:1px solid rgba(255,255,255,.16);box-shadow:0 70px 140px rgba(0,0,0,.6),0 20px 50px rgba(0,0,0,.45);
  background:#fff}}
.bar{{height:44px;display:flex;align-items:center;gap:8px;padding:0 16px;
  background:linear-gradient(#eef1f6,#e3e8f0);border-bottom:1px solid #cfd6e2}}
.dot{{width:12px;height:12px;border-radius:50%}}
.url{{flex:1;margin-left:10px;background:#fff;border:1px solid #d4dae4;border-radius:9px;height:27px;
  display:flex;align-items:center;padding:0 12px;gap:7px;color:#6b7a90;font-size:12.5px}}
.url b{{font-weight:600;color:#47566c}}
.lock{{width:11px;height:11px;border:1.6px solid #8b98ab;border-radius:3px;position:relative;top:1px}}
.lock:after{{content:'';position:absolute;left:1.6px;top:-6px;width:5px;height:6px;border:1.6px solid #8b98ab;border-bottom:none;border-radius:6px 6px 0 0}}
.content{{height:692px;position:relative}}
.chip{{position:absolute;display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;
  font-size:14px;font-weight:700;color:#fff;backdrop-filter:blur(6px);z-index:5;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);
  box-shadow:0 18px 40px rgba(0,0,0,.4)}}
.pip{{width:8px;height:8px;border-radius:50%}}
</style></head><body>
{glows}{chips}
<div class="grid"></div>
<div class="win">
<div class="bar"><div class="dot" style="background:#ff5f57"></div><div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div>
<div class="url"><div class="lock"></div><b>{url}</b></div></div>
<div class="content">{content}</div>
</div></body></html>'''

def render(name, html):
    p = os.path.join(M, name + ".html")
    open(p, "w", encoding="utf-8").write(html)
    r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--window-size=1400,900", "--virtual-time-budget=5000",
        f"--screenshot={os.path.join(M, name + '.png')}", "file:///" + p.replace("\\", "/")], capture_output=True)
    print(name, os.path.exists(os.path.join(M, name + ".png")))

# ---------- 3) NexDeutsch — RTL dashboard ----------
nex_c = '''
<style>
*{margin:0;padding:0;box-sizing:border-box}
.app{width:1160px;height:692px;background:#0c1523;color:#e9eff9;direction:rtl;font-family:'Segoe UI',Tahoma,sans-serif;display:flex;flex-direction:column}
.top{height:58px;display:flex;align-items:center;gap:18px;padding:0 26px;border-bottom:1px solid rgba(255,255,255,.07)}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px}
.lt{width:30px;height:30px;border-radius:9px;background:linear-gradient(140deg,#b7f34d,#7ed957);color:#0c1523;display:grid;place-items:center;font-weight:900;font-size:16px}
.nav{display:flex;gap:8px;margin-right:auto}
.nav span{padding:7px 15px;border-radius:999px;font-size:13px;color:#9db1cc;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.nav span.on{background:rgba(183,243,77,.14);color:#cff58a;border-color:rgba(183,243,77,.35);font-weight:700}
.streak{display:flex;align-items:center;gap:7px;background:rgba(255,150,60,.12);border:1px solid rgba(255,150,60,.3);color:#ffc593;padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700}
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(140deg,#3d8bfd,#7ed957);display:grid;place-items:center;font-size:14px;font-weight:800;color:#0c1523}
.hero{display:flex;align-items:center;justify-content:space-between;padding:22px 26px 6px}
.hero h1{font-size:26px;font-weight:800}
.hero small{display:block;color:#8fa3bd;font-size:13.5px;margin-top:5px;font-weight:400}
.cta{background:linear-gradient(140deg,#b7f34d,#8fe05a);color:#0c1523;font-weight:800;font-size:14.5px;padding:12px 24px;border-radius:13px;box-shadow:0 12px 30px rgba(143,224,90,.25)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 26px}
.k{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:15px 18px}
.k b{font-size:24px;font-weight:800}
.k small{display:block;color:#8fa3bd;font-size:11.5px;font-weight:700;margin-top:4px;letter-spacing:.02em}
.cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;padding:4px 26px}
.w{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:18px}
.w .de{font-size:19px;font-weight:800;direction:ltr;text-align:right}
.w .fa{color:#9db1cc;font-size:13px;margin-top:5px}
.pill{display:inline-block;margin-top:13px;padding:5px 13px;border-radius:999px;font-size:11.5px;font-weight:800}
.due{background:rgba(255,190,70,.14);color:#ffce7a;border:1px solid rgba(255,190,70,.3)}
.ok{background:rgba(126,217,87,.13);color:#b5ec8f;border:1px solid rgba(126,217,87,.3)}
.ex{background:linear-gradient(150deg,#cfc4ec,#d8cff0);color:#241f3d;border:none}
.ex .de{color:#241f3d}.ex .fa{color:#4f4770}
.ex .sent{direction:ltr;text-align:left;font-size:13.5px;margin-top:11px;background:rgba(255,255,255,.5);border-radius:10px;padding:8px 11px;color:#332c55;font-weight:600}
.bar-row{padding:6px 26px 22px}
.track{height:9px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.fill{height:100%;width:86%;border-radius:999px;background:linear-gradient(90deg,#7ed957,#b7f34d)}
.cap{display:flex;justify-content:space-between;color:#8fa3bd;font-size:12px;font-weight:700;margin-top:8px}
.tabbar{margin-top:auto;height:58px;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 30px;gap:34px}
.tab{display:flex;align-items:center;gap:9px;color:#7d90a9;font-size:13.5px;font-weight:700}
.tab i{width:9px;height:9px;border-radius:50%;background:#33415c}
.tab.on{color:#cff58a}.tab.on i{background:#b7f34d;box-shadow:0 0 0 4px rgba(183,243,77,.15)}
</style>
<div class="app">
<div class="top">
<div class="logo"><div class="lt">N</div>NexDeutsch</div>
<div class="nav"><span class="on">مرور امروز</span><span>واژه‌ها</span><span>پیشرفت</span></div>
<div class="streak">🔥 ۱۲ روز پیوسته</div><div class="av">ا</div>
</div>
<div class="hero"><div><h1>مرور امروز</h1><small>۱۷ واژه بر اساس مرور فاصله‌دار آماده‌ان</small></div><div class="cta">شروع مرور</div></div>
<div class="stats">
<div class="k"><b>۲۴۸</b><small>واژه یادگرفته</small></div>
<div class="k"><b>۸۶٪</b><small>دقت پاسخ‌ها</small></div>
<div class="k"><b>۱۷</b><small>آماده مرور</small></div>
<div class="k"><b>۷۰</b><small>روز با NexDeutsch</small></div>
</div>
<div class="cards">
<div class="w"><div class="de">der Anschluss</div><div class="fa">اتصال · ارتباط</div><span class="pill due">مرور امروز</span></div>
<div class="w"><div class="de">die Brücke</div><div class="fa">پل</div><span class="pill ok">یادگرفته ✓</span></div>
<div class="w ex"><div class="de">eine Pause machen</div><div class="fa">استراحت کردن</div><div class="sent">Heute machen wir eine Pause.</div></div>
<div class="w"><div class="de">die Gewissheit</div><div class="fa">یقین · اطمینان</div><span class="pill due">مرور امروز</span></div>
<div class="w"><div class="de">das Brötchen</div><div class="fa">نان کوچک</div><span class="pill ok">یادگرفته ✓</span></div>
<div class="w ex"><div class="de">sich bewerben</div><div class="fa">درخواست کار دادن</div><div class="sent">Ich bewerbe mich als Werkstudent.</div></div>
</div>
<div class="bar-row"><div class="track"><div class="fill"></div></div>
<div class="cap"><span>پیشرفت سطح B1</span><span>۸۶٪</span></div></div>
<div class="tabbar">
<div class="tab on"><i></i>مرور امروز</div>
<div class="tab"><i></i>واژه‌ها</div>
<div class="tab"><i></i>واژه‌نامه</div>
<div class="tab"><i></i>پیشرفت</div>
<div class="tab" style="margin-right:auto;color:#8fa3bd">تنظیمات</div>
</div>
</div>'''

# ---------- 4) Washhalle — ops dashboard ----------
wash_c = '''
<style>
*{margin:0;padding:0;box-sizing:border-box}
.app{width:1160px;height:692px;background:#f1f6f2;color:#0e2418;display:flex;flex-direction:column}
.top{height:58px;display:flex;align-items:center;gap:14px;padding:0 26px;background:#fff;border-bottom:1px solid #e2ebe4}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px}
.lt{width:30px;height:30px;border-radius:9px;background:linear-gradient(140deg,#1d7a4d,#2a9d63);color:#fff;display:grid;place-items:center;font-weight:900}
.logo small{display:block;font-size:9px;letter-spacing:.35em;color:#7fa78f;font-weight:700}
.date{margin-left:auto;color:#5f7a6a;font-size:13px;font-weight:600}
.shift{display:flex;align-items:center;gap:7px;background:#e7f5ec;border:1px solid #bfe3cc;color:#177a45;font-size:12.5px;font-weight:700;padding:7px 14px;border-radius:999px}
.pip{width:8px;height:8px;border-radius:50%;background:#22a35c;box-shadow:0 0 0 3px rgba(34,163,92,.18)}
.hero{display:flex;align-items:center;justify-content:space-between;padding:20px 26px 4px}
.hero h1{font-size:24px;font-weight:800}
.hero small{color:#5f7a6a;font-size:13px;display:block;margin-top:4px}
.add{background:#155c38;color:#fff;font-weight:700;font-size:13.5px;padding:11px 20px;border-radius:11px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;padding:14px 26px}
.k{background:#fff;border:1px solid #e2ebe4;border-radius:15px;padding:14px 17px;box-shadow:0 4px 14px rgba(14,60,35,.05)}
.k b{font-size:22px;font-weight:800}
.k small{display:block;color:#6d8a79;font-size:11px;font-weight:700;margin-top:3px;letter-spacing:.03em}
.k.hl{background:linear-gradient(140deg,#155c38,#1d7a4d);color:#fff;border:none}
.k.hl small{color:#bfe0cd}
.main{display:grid;grid-template-columns:1.55fr 1fr;gap:14px;padding:4px 26px;flex:1}
.panel{background:#fff;border:1px solid #e2ebe4;border-radius:16px;padding:16px 18px;box-shadow:0 4px 14px rgba(14,60,35,.05)}
.panel h3{font-size:14px;font-weight:800;margin-bottom:12px}
.r{display:flex;align-items:center;gap:12px;padding:10.5px 0;border-top:1px solid #eef4ef;font-size:13px}
.r:first-of-type{border-top:none}
.plate{font-weight:800;font-size:13px;background:#eef3ee;border:1px solid #dbe5dc;border-radius:7px;padding:4px 9px;letter-spacing:.03em;white-space:nowrap}
.r .svc{color:#42584b;font-size:12.5px}
.r .by{color:#8aa394;font-size:11.5px;margin-right:auto}
.r b.price{font-size:13.5px;font-weight:800;white-space:nowrap}
.pill{padding:4px 11px;border-radius:999px;font-size:10.5px;font-weight:800;white-space:nowrap}
.note{margin-top:11px;color:#8aa394;font-size:11px;font-weight:600;border-top:1px solid #eef4ef;padding-top:11px}
.run{background:#e3edfb;color:#2059a8}.chk{background:#fdf1d7;color:#a06b0a}.fin{background:#e4f5ea;color:#177a45}
.wk{display:flex;align-items:flex-end;gap:10px;height:120px;margin-top:6px}
.b{flex:1;border-radius:7px 7px 4px 4px;background:linear-gradient(180deg,#2a9d63,#1d7a4d);position:relative}
.b.dim{background:#dce8de}
.b small{position:absolute;bottom:-19px;left:0;right:0;text-align:center;font-size:10px;color:#7d9486;font-weight:700}
.audit{margin-top:12px;display:flex;gap:9px;align-items:center;background:#eef6f0;border:1px dashed #bcd9c6;border-radius:12px;padding:11px 13px;color:#2c5c41;font-size:12px;font-weight:600}
.sum{display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;padding-top:13px;border-top:1px solid #eef4ef}
.sum b{font-size:19px;font-weight:800}
.sum .up{color:#177a45;font-size:12.5px;font-weight:800;background:#e4f5ea;border-radius:999px;padding:4px 11px}
</style>
<div class="app">
<div class="top">
<div class="logo"><div class="lt">W</div><div>WaschhalleApp<small>F_DS</small></div></div>
<div class="date">Donnerstag, 17.09.2026</div>
<div class="shift"><div class="pip"></div>Schicht aktiv · 06:00–14:00</div>
</div>
<div class="hero"><div><h1>Tagesübersicht</h1><small>Leistungen, Preise und Prüfungen in Echtzeit</small></div><div class="add">+ Leistung erfassen</div></div>
<div class="stats">
<div class="k"><b>128</b><small>WÄSCHE HEUTE</small></div>
<div class="k hl"><b>€1.284</b><small>UMSATZ HEUTE</small></div>
<div class="k"><b>€10,03</b><small>Ø JE WÄSCHE</small></div>
<div class="k"><b>5</b><small>DOUBLE-CHECKS OFFEN</small></div>
</div>
<div class="main">
<div class="panel"><h3>Heutige Leistungen</h3>
<div class="r"><span class="plate">WI-X 622</span><span class="svc">Dampfstrahler · 20 Min</span><span class="by">M. Weber · 09:41</span><b class="price">€36,78</b><span class="pill run">läuft</span></div>
<div class="r"><span class="plate">WI-2080</span><span class="svc">SILO spülen · 30 Min</span><span class="by">A. Schneider · 09:12</span><b class="price">€101,10</b><span class="pill chk">Double-Check</span></div>
<div class="r"><span class="plate">FFS-118</span><span class="svc">Bürstenwäsche Fahrerhaus</span><span class="by">J. Klein · 08:47</span><b class="price">€20,84</b><span class="pill fin">fertig ✓</span></div>
<div class="r"><span class="plate">K-PR 4412</span><span class="svc">LKW 7–9 m · Innenreinigung</span><span class="by">M. Weber · 08:15</span><b class="price">€40,63</b><span class="pill fin">fertig ✓</span></div>
<div class="r"><span class="plate">WI-3310</span><span class="svc">Dampfstrahler · 10 Min</span><span class="by">A. Schneider · 07:58</span><b class="price">€18,39</b><span class="pill fin">fertig ✓</span></div>
<div class="r"><span class="plate">F-KG 77</span><span class="svc">SILO spülen · 20 Min</span><span class="by">J. Klein · 07:31</span><b class="price">€67,40</b><span class="pill fin">fertig ✓</span></div>
<div class="note">Alle Preise netto · Stand 09:41 · Dampfstrahler standard 20 Min</div>
</div>
<div class="panel"><h3>Umsatz · diese Woche</h3>
<div class="wk">
<div class="b dim" style="height:52%"><small>Mo</small></div>
<div class="b" style="height:74%"><small>Di</small></div>
<div class="b dim" style="height:61%"><small>Mi</small></div>
<div class="b" style="height:92%"><small>Do</small></div>
<div class="b dim" style="height:83%"><small>Fr</small></div>
<div class="b dim" style="height:44%"><small>Sa</small></div>
<div class="b dim" style="height:30%"><small>So</small></div>
</div>
<div class="audit">🛡 Alle Eingaben werden protokolliert · Audit-Log aktiv</div>
<div class="sum"><b>€5.412</b><span class="up">+12% zur Vorwoche</span></div>
</div>
</div>
</div>'''

# ---------- 5) Saad Tattoo — dark studio site ----------
saad_c = '''
<style>
*{margin:0;padding:0;box-sizing:border-box}
.app{width:1160px;height:692px;background:#0a0a0a;color:#f2f2f2;display:flex;flex-direction:column;font-family:Georgia,'Times New Roman',serif}
.top{height:58px;display:flex;align-items:center;gap:26px;padding:0 30px;border-bottom:1px solid rgba(255,255,255,.09)}
.logo{font-size:19px;letter-spacing:.3em;font-weight:400}
.logo b{font-weight:400}
.nav{display:flex;gap:22px;margin-left:auto;font-family:'Segoe UI',sans-serif}
.nav span{font-size:12px;color:#b9b9b9;letter-spacing:.06em}
.nav span.on{color:#fff;border-bottom:1px solid #fff;padding-bottom:3px}
.login{display:flex;align-items:center;gap:7px;font-family:'Segoe UI',sans-serif;font-size:12px;color:#dcdcdc;
  border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:7px 15px}
.hero{display:grid;grid-template-columns:1fr 1.05fr;gap:34px;padding:30px 30px 22px;align-items:center}
.hero h1{font-size:40px;line-height:1.16;font-weight:400}
.hero h1 em{font-style:italic;color:#cfcfcf}
.hero p{font-family:'Segoe UI',sans-serif;color:#a8a8a8;font-size:13.5px;margin-top:14px;letter-spacing:.04em}
.btn{display:inline-block;margin-top:22px;font-family:'Segoe UI',sans-serif;font-size:12.5px;font-weight:700;
  letter-spacing:.22em;background:#f2f2f2;color:#0a0a0a;padding:13px 26px}
.heroimg{height:300px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.14);
  box-shadow:0 30px 70px rgba(0,0,0,.6)}
.heroimg img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.06)}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:6px 30px 24px}
.t{height:170px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.12);position:relative}
.t img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.05)}
.t span{position:absolute;left:10px;bottom:10px;font-family:'Segoe UI',sans-serif;font-size:10.5px;font-weight:700;
  letter-spacing:.12em;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);padding:5px 11px;border-radius:999px;color:#eee}
.strip{margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding:0 30px 20px;
  font-family:'Segoe UI',sans-serif;color:#8f8f8f;font-size:12px;letter-spacing:.06em}
.strip b{color:#e8e8e8;font-weight:600}
</style>
<div class="app">
<div class="top">
<div class="logo">SAAD <b>TATTOO</b></div>
<div class="nav"><span class="on">Startseite</span><span>Galerie</span><span>Termin Buchen</span><span>Über uns</span><span>Kontakt &amp; FAQ</span></div>
<div class="login">◉ Anmelden</div>
</div>
<div class="hero">
<div>
<h1>Meisterhafte Tattoos<br><em>in Wiesbaden.</em></h1>
<p>BLACK &amp; GREY · FINELINE · REALISM — JEDES TATTOO EIN UNIKAT.</p>
<span class="btn">JETZT TERMIN SICHERN</span>
</div>
<div class="heroimg"><img src="file:///D:/Z.Ai/portfolio/mock2/img_hands.jpg"></div>
</div>
<div class="gal">
<div class="t"><img src="file:///D:/Z.Ai/portfolio/mock2/img_eagle.jpg"><span>BLACK &amp; GREY</span></div>
<div class="t"><img src="file:///D:/Z.Ai/portfolio/mock2/img_feet.jpg"><span>FINELINE</span></div>
<div class="t"><img src="file:///D:/Z.Ai/portfolio/mock2/img_hands.jpg" style="object-position:center bottom"><span>CUSTOM WORK</span></div>
</div>
<div class="strip"><span><b>Wiesbaden</b> · Termine 2026 offen</span><span>saadtattoo.de</span></div>
</div>'''

# ---------- 6) render all ----------
bg_nex = "linear-gradient(150deg,#080f1c,#0d1a2e 55%,#0a2238)"
g_nex = '<div class="g" style="width:560px;height:560px;right:-120px;top:-160px;background:rgba(163,230,53,.13)"></div><div class="g" style="width:520px;height:520px;left:-140px;bottom:-180px;background:rgba(61,139,253,.16)"></div>'
chips_nex = ('<div class="chip" style="left:170px;top:20px;transform:rotate(-2deg)"><span class="pip" style="background:#b7f34d"></span>+۱۲ واژه امروز</div>'
             '<div class="chip" style="right:170px;bottom:20px;transform:rotate(2deg)"><span class="pip" style="background:#3d8bfd"></span>مرور فاصله‌دار</div>')

bg_wash = "linear-gradient(150deg,#06130c,#0a1f14 55%,#0c2a1a)"
g_wash = '<div class="g" style="width:560px;height:560px;right:-140px;top:-160px;background:rgba(34,163,92,.15)"></div><div class="g" style="width:500px;height:500px;left:-150px;bottom:-170px;background:rgba(45,212,168,.10)"></div>'
chips_wash = ('<div class="chip" style="left:170px;top:20px;transform:rotate(-2deg)"><span class="pip" style="background:#22c55e"></span>Schicht läuft</div>'
              '<div class="chip" style="right:170px;bottom:20px;transform:rotate(2deg)"><span class="pip" style="background:#fbbf24"></span>Monats-Import OK</div>')

bg_saad = "linear-gradient(150deg,#050505,#0d0d0d 55%,#111008)"
g_saad = '<div class="g" style="width:560px;height:560px;right:-140px;top:-170px;background:rgba(255,255,255,.06)"></div><div class="g" style="width:520px;height:520px;left:-150px;bottom:-170px;background:rgba(212,175,55,.08)"></div>'
chips_saad = ('<div class="chip" style="left:170px;top:20px;transform:rotate(-2deg)"><span class="pip" style="background:#fff"></span>Termine 2026 offen</div>'
              '<div class="chip" style="right:170px;bottom:20px;transform:rotate(2deg)"><span class="pip" style="background:#d4af37"></span>Kunden-Website</div>')

render("cover_nexdeutsch", shell("nexdeutsch-92-5-111-34.sslip.io", nex_c, bg_nex, g_nex, chips_nex).replace("{glows_setup}", ""))
render("cover_washhalle",  shell("waschhalle-92-5-111-34.sslip.io", wash_c, bg_wash, g_wash, chips_wash).replace("{glows_setup}", ""))
render("cover_saadtattoo", shell("www.saadtattoo.de", saad_c, bg_saad, g_saad, chips_saad).replace("{glows_setup}", ""))
print("done")

# -*- coding: utf-8 -*-
"""Poster cover for Finello (1400x900) — phone-frame mockup with sample data UI,
matching the make_mockups2.py poster language (glow bg, dot grid, floating chips)."""
import os, subprocess

BASE = r"D:\Z.Ai\portfolio"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT_HTML = os.path.join(BASE, "finello_cover_tmp.html")
OUT_PNG = os.path.join(BASE, "finello.png")

HTML = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1400px;height:900px;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;
  background:radial-gradient(1200px 800px at 20% -10%,#0c2b26,#071411 55%,#04100d);position:relative}
.g{position:absolute;border-radius:50%;filter:blur(100px)}
.grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px);background-size:26px 26px}
.phone{position:absolute;left:505px;top:70px;width:390px;height:760px;border-radius:52px;
  background:#0b1f1a;border:3px solid rgba(255,255,255,.18);
  box-shadow:0 80px 160px rgba(0,0,0,.65),0 0 120px rgba(52,211,153,.18),inset 0 0 0 8px #050b09}
.screen{position:absolute;inset:14px;border-radius:40px;overflow:hidden;background:#08130f}
.notch{position:absolute;top:26px;left:50%;transform:translateX(-50%);width:110px;height:26px;border-radius:16px;background:#050b09;z-index:9}
.hero{margin:64px 16px 0;padding:20px;border-radius:24px;color:#fff;
  background:linear-gradient(140deg,#0f3d33,#134e3f 60%,#0d3a30);box-shadow:0 18px 40px rgba(0,0,0,.4)}
.k{font-size:10px;font-weight:800;letter-spacing:.14em;color:#a7f3d0;text-transform:uppercase}
.bal{font-size:34px;font-weight:800;letter-spacing:-.02em;margin-top:6px}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.14);font-size:10px;font-weight:700;margin-left:8px;vertical-align:middle}
.row{display:flex;gap:10px;margin-top:16px}
.cell{flex:1;padding:12px;border-radius:16px;background:rgba(255,255,255,.08)}
.cell small{font-size:10px;font-weight:700;color:#a7f3d0;display:block;text-transform:uppercase;letter-spacing:.1em}
.cell b{font-size:17px;font-weight:800}
.chip{position:absolute;display:flex;align-items:center;gap:9px;padding:11px 17px;border-radius:999px;
  font-size:14px;font-weight:700;color:#eafff6;backdrop-filter:blur(6px);z-index:5;
  background:rgba(6,26,20,.75);border:1px solid rgba(110,231,183,.3);box-shadow:0 18px 40px rgba(0,0,0,.45)}
.pip{width:9px;height:9px;border-radius:50%}
.c1{left:150px;top:150px}.c2{right:128px;top:235px}.c3{left:196px;bottom:158px}.c4{right:158px;bottom:110px}
.card{margin:14px 16px 0;padding:14px 16px;border-radius:18px;background:#0d241d;border:1px solid rgba(255,255,255,.07)}
.card .t{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;font-weight:700;color:#d9fbee}
.card .t span{color:#6ee7b7;font-weight:800}
.bars{display:flex;align-items:flex-end;gap:7px;height:64px;margin-top:10px}
.b{flex:1;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,#34d399,#0f766e)}
.nav{position:absolute;left:14px;right:14px;bottom:12px;height:58px;border-radius:20px;background:#0c211b;display:flex;align-items:center;justify-content:space-around;border:1px solid rgba(255,255,255,.07)}
.nav i{width:18px;height:18px;border-radius:6px;background:#245a4b}
.nav i.on{background:#34d399;box-shadow:0 0 14px rgba(52,211,153,.7)}
.logo{position:absolute;left:64px;top:74px;display:flex;align-items:center;gap:16px}
.logo .mark{width:56px;height:56px;border-radius:18px;background:linear-gradient(140deg,#34d399,#0d9488);display:grid;place-items:center;font-size:30px;font-weight:900;color:#04211a;box-shadow:0 20px 50px rgba(13,148,136,.5)}
.logo h1{color:#ecfdf5;font-size:44px;font-weight:900;letter-spacing:-.02em}
.logo p{color:#6ee7b7;font-size:15px;font-weight:600;margin-top:2px}
.tag{position:absolute;left:64px;bottom:84px;color:#a7f3d0;font-size:15px;font-weight:600;max-width:330px;line-height:1.6}
.tag b{color:#fff}
</style></head><body>
<div class="g" style="left:-120px;top:-140px;width:560px;height:560px;background:rgba(16,185,129,.28)"></div>
<div class="g" style="right:-160px;bottom:-180px;width:620px;height:620px;background:rgba(13,148,136,.3)"></div>
<div class="grid"></div>
<div class="logo"><div class="mark">F</div><div><h1>Finello</h1><p>Money, sorted.</p></div></div>
<div class="tag">Personal finance for <b>students in Germany</b> — budget calendar, recurring payments, expenses &amp; tax overview in one app.</div>

<div class="phone"><div class="screen">
  <div class="notch"></div>
  <div class="hero">
    <div class="k">October budget</div>
    <div class="bal">1.284,50 € <span class="pill">left 62%</span></div>
    <div class="row">
      <div class="cell"><small>Spent</small><b>789 €</b></div>
      <div class="cell"><small>Saved</small><b>210 €</b></div>
    </div>
  </div>
  <div class="card"><div class="t">Monthly spending <span>+8%</span></div>
    <div class="bars"><div class="b" style="height:38%"></div><div class="b" style="height:62%"></div><div class="b" style="height:47%"></div><div class="b" style="height:80%"></div><div class="b" style="height:55%"></div><div class="b" style="height:92%"></div><div class="b" style="height:68%"></div><div class="b" style="height:74%"></div></div>
  </div>
  <div class="card"><div class="t">Rent — due in 3 days <span>450 €</span></div></div>
  <div class="card"><div class="t">Semesterticket <span>paid ✓</span></div></div>
  <div class="nav"><i class="on"></i><i></i><i></i><i></i><i></i></div>
</div></div>

<div class="chip c1"><span class="pip" style="background:#34d399"></span>Budget calendar</div>
<div class="chip c2"><span class="pip" style="background:#2dd4bf"></span>Recurring payments</div>
<div class="chip c3"><span class="pip" style="background:#5eead4"></span>Tax overview</div>
<div class="chip c4"><span class="pip" style="background:#a7f3d0"></span>Built with React 19 · TypeScript</div>
</body></html>"""

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(HTML)

subprocess.run(
    [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu",
     "--force-device-scale-factor=1", "--window-size=1400,900",
     "--screenshot=" + OUT_PNG.replace("\\", "/"), "file:///" + OUT_HTML.replace("\\", "/")],
    check=True, capture_output=True)
print("wrote", OUT_PNG)

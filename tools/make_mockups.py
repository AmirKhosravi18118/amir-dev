# -*- coding: utf-8 -*-
"""Professional mockups for NexDeutsch / Washhalle / Saad Tattoo + hero app shots."""
import os, subprocess

BASE = r"D:\Z.Ai\portfolio"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def shot(name, html, w=1200, h=760):
    p = os.path.join(BASE, name + ".html")
    io = open(p, "w", encoding="utf-8"); io.write(html); io.close()
    r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
                        f"--window-size={w},{h}", "--hide-scrollbars",
                        "--virtual-time-budget=4000",
                        f"--screenshot={os.path.join(BASE, name + '.png')}",
                        "file:///" + p.replace("\\", "/")], capture_output=True)
    import os as o
    print(name, o.path.exists(os.path.join(BASE, name + ".png")))

# NexDeutsch mockup: browser frame + dashboard content
nex = r'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:760px;font-family:'Segoe UI',Arial,sans-serif;background:linear-gradient(160deg,#0e1826,#15263e 55%,#1a3450);display:grid;place-items:center}
.browser{width:1020px;border-radius:14px;overflow:hidden;box-shadow:0 40px 90px rgba(5,15,35,.75),0 0 0 1px rgba(255,255,255,.09);background:#f7fafd}
.bar{height:42px;background:#e6ecf3;display:flex;align-items:center;gap:8px;padding:0 16px}
.dot{width:12px;height:12px;border-radius:50%}
.url{flex:1;margin-left:12px;background:#fff;border-radius:8px;height:26px;display:flex;align-items:center;padding:0 12px;color:#7c8aa0;font-size:12.5px}
.content{padding:34px 40px;background:linear-gradient(160deg,#f4f8fc,#eaf2fa);min-height:560px}
.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.hd h1{font-size:27px;color:#12263f}.hd h1 span{color:#3d8bfd}
.add{background:#3d8bfd;color:#fff;padding:10px 20px;border-radius:10px;font-weight:700;font-size:13.5px}
.stat{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px}
.k{background:#fff;border:1px solid #dde7f2;border-radius:14px;padding:16px 18px}
.k b{font-size:24px;color:#12263f}.k small{display:block;color:#7c8aa0;font-size:11px;font-weight:700;letter-spacing:.05em;margin-top:3px}
.words{display:grid;gap:10px}
.w{background:#fff;border:1px solid #dde7f2;border-radius:13px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center}
.w b{font-size:16px;color:#12263f}.w small{color:#7c8aa0;font-size:12px;margin-right:14px}
.pill{padding:5px 13px;border-radius:999px;font-size:11.5px;font-weight:800}
.ok{background:#e0f6ea;color:#1e9e5a}.due{background:#fff2d8;color:#b2790a}.new{background:#e2edff;color:#2d6ce5}
</style></head><body><div class="browser">
<div class="bar"><div class="dot" style="background:#ff5f57"></div><div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div><div class="url">nexdeutsch-92-5-111-34.sslip.io</div></div>
<div class="content">
<div class="hd"><h1>Nex<span>Deutsch</span></h1><div class="add">+ Wort hinzufügen</div></div>
<div class="stat">
<div class="k"><b>248</b><small>WÖRTER</small></div>
<div class="k"><b>17</b><small>HEUTE FÄLLIG</small></div>
<div class="k"><b>86%</b><small>GELERNT</small></div>
</div>
<div class="words">
<div class="w"><b>die Brücke</b><small>Brücke · wiederholt +30 Tage</small><span class="pill ok">gelernt ✓</span></div>
<div class="w"><b>der Anschluss</b><small>Verbindung · fällig heute</small><span class="pill due">wiederholen</span></div>
<div class="w"><b>die Gewissheit</b><small>Sicherheit · neu</small><span class="pill new">neu</span></div>
</div>
</div></div></body></html>'''

# Washhalle mockup
wash = r'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:760px;font-family:'Segoe UI',Arial,sans-serif;background:linear-gradient(160deg,#0c161e,#122435 55%,#173a4d);display:grid;place-items:center}
.browser{width:1020px;border-radius:14px;overflow:hidden;box-shadow:0 40px 90px rgba(4,14,25,.75),0 0 0 1px rgba(255,255,255,.09);background:#f5fafd}
.bar{height:42px;background:#e4edf3;display:flex;align-items:center;gap:8px;padding:0 16px}
.dot{width:12px;height:12px;border-radius:50%}
.url{flex:1;margin-left:12px;background:#fff;border-radius:8px;height:26px;display:flex;align-items:center;padding:0 12px;color:#74909f;font-size:12.5px}
.content{padding:34px 40px;background:linear-gradient(160deg,#f2f8fb,#e8f3f8);min-height:560px}
.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.hd h1{font-size:27px;color:#0f2436}.hd h1 span{color:#1899d6}
.shift{background:#1899d6;color:#fff;padding:10px 20px;border-radius:10px;font-weight:700;font-size:13.5px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.k{background:#fff;border:1px solid #d7e6ee;border-radius:14px;padding:18px}
.k b{font-size:26px;color:#0f2436}.k small{display:block;color:#6b8a9c;font-size:11px;font-weight:700;letter-spacing:.05em;margin-top:4px}
.rows{display:grid;gap:10px}
.r{background:#fff;border:1px solid #d7e6ee;border-radius:13px;padding:15px 18px;display:flex;justify-content:space-between;align-items:center}
.r b{font-size:15px;color:#0f2436}.r small{color:#6b8a9c;font-size:12px;margin-right:14px}
.pill{padding:5px 13px;border-radius:999px;font-size:11.5px;font-weight:800}
.run{background:#e0f3fb;color:#0f7fae}.done{background:#e0f6ea;color:#1e9e5a}
</style></head><body><div class="browser">
<div class="bar"><div class="dot" style="background:#ff5f57"></div><div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div><div class="url">Washhalle — Tagesbetrieb</div></div>
<div class="content">
<div class="hd"><h1>Wash<span>halle</span></h1><div class="shift">Schicht starten</div></div>
<div class="grid">
<div class="k"><b>128</b><small>WÄSCHE HEUTE</small></div>
<div class="k"><b>€412</b><small>UMSATZ</small></div>
<div class="k"><b>3</b><small>AKTIVE BAYEN</small></div>
<div class="k"><b>4.9</b><small>Ø BEWERTUNG</small></div>
</div>
<div class="rows">
<div class="r"><b>Bay 2 — Premium-Wäsche</b><small>läuft seit 12 Min · Kunde: Stammkunde</small><span class="pill run">läuft</span></div>
<div class="r"><b>Bay 5 — Innenreinigung</b><small>abgeschlossen · €18,50</small><span class="pill done">fertig ✓</span></div>
<div class="r"><b>Bay 1 — Kompakt</b><small>wartet auf Freigabe</small><span class="pill run">bereit</span></div>
</div>
</div></div></body></html>'''

# Saad Tattoo: clean mockup without cookie banner (from real screenshot style)
saad = r'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:760px;font-family:'Segoe UI',Arial,sans-serif;background:#101010;display:grid;place-items:center}
.browser{width:1020px;border-radius:14px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.09);background:#0a0a0a}
.bar{height:42px;background:#1c1c1c;display:flex;align-items:center;gap:8px;padding:0 16px}
.dot{width:12px;height:12px;border-radius:50%}
.url{flex:1;margin-left:12px;background:#2b2b2b;border-radius:8px;height:26px;display:flex;align-items:center;padding:0 12px;color:#9a9a9a;font-size:12.5px}
.content{display:grid;grid-template-columns:1.05fr .95fr;background:#fff;min-height:560px}
.left{padding:60px 48px;display:flex;flex-direction:column;justify-content:center;gap:22px;background:#fff}
.logo{font-size:38px;font-weight:300;letter-spacing:.28em;color:#111;line-height:1.05;font-family:Georgia,serif}
.kick{font-size:11px;letter-spacing:.3em;color:#888;text-transform:uppercase}
h2{font-size:24px;color:#111;font-weight:600;max-width:380px}
.btn{display:inline-block;width:max-content;padding:14px 30px;background:#b5b5b5;color:#fff;font-weight:700;font-size:13px;letter-spacing:.08em}
.right{background:url('') center/cover;position:relative;overflow:hidden}
.right .ink{position:absolute;inset:0;background:
  radial-gradient(300px 300px at 70% 30%, #1a1a1a 0%, #2e2e2e 40%, #4a4a4a 70%, #6a6a6a 100%)}
.right .arm{position:absolute;inset:0;background:
  repeating-conic-gradient(from 30deg at 65% 40%, #0d0d0d 0 18deg, #3a3a3a 18deg 36deg);
  mask-image:radial-gradient(340px 480px at 65% 45%, transparent 30%, black 65%);opacity:.85}
</style></head><body><div class="browser">
<div class="bar"><div class="dot" style="background:#ff5f57"></div><div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div><div class="url">www.saadtattoo.de</div></div>
<div class="content">
<div class="left">
<div class="logo">SAAD<br>TATTOO</div>
<div class="kick">WIESBADEN</div>
<h2>Meisterhafte Tattoos in Wiesbaden</h2>
<div class="btn">JETZT TERMIN SICHERN</div>
</div>
<div class="right"><div class="ink"></div><div class="arm"></div></div>
</div></div></body></html>'''

if __name__ == "__main__":
    shot("nexdeutsch.png", nex)
    shot("washhalle.png", wash)
    shot("saadtattoo.png", saad)

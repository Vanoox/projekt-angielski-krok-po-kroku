// node run-cdp.js <label> <scn>[@state[@extra]] – scenariusz w prawdziwym czasie (DevTools Protocol), świeży profil.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { start } = require("./gm-server.js");
const EDGE = process.env.EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const [label, spec] = process.argv.slice(2);
const [name, st = "student", extra = ""] = spec.split("@");
const OUT = path.join(__dirname, "out", label);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const server = await start(8765);
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "gm-cdp-"));
  const port = 9300 + Math.floor(Math.random() * 500);
  const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
  try {
    let list;
    for (let k = 0; k < 50; k++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (list.length) break; } catch (e) {} await sleep(200); }
    const page = list.find((t) => t.type === "page");
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r));
    let id = 0; const pend = new Map();
    ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Page.enable");
    await send("Page.navigate", { url: `http://127.0.0.1:8765/?__t=${st}&scn=${name}${extra ? "&" + extra : ""}` });
    let txt = null;
    for (let k = 0; k < 240 && !txt; k++) {
      await sleep(500);
      const r = await send("Runtime.evaluate", { expression: "(document.getElementById('__gm')||{}).textContent||''", returnByValue: true });
      txt = r.result && r.result.result && r.result.result.value;
    }
    fs.writeFileSync(path.join(OUT, `scn-${name}-${st}.txt`), txt || "NO RESULT");
    ws.close();
    console.log(txt ? "ok" : "NO RESULT");
  } finally { edge.kill(); server.close(); }
})().catch((e) => { console.error(e); process.exit(1); });

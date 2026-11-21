// Zdjęcie wzorcowe strony w headless Edge (opis: tools/golden/README.md). Wyniki w tools/golden/out/<label>/.
// Użycie: node tools/golden/run.js <label> [all|dumps|scn:<nazwa>[@stan[@param]],…|prep]
//   all   – zdjęcia DOM wszystkich tras (nowy uczeń + uczeń z postępem) i wszystkie testy klikane (SCENARIOS),
//   dumps – same zdjęcia DOM, scn:… – wybrane scenariusze (scn-<nazwa>.js), prep – od nowa state-student.json i ids.json.
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { start } = require("./gm-server.js");
const EDGE = process.env.EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 8765;
const HERE = __dirname;
const label = process.argv[2] || "before";
const SCENARIOS = "ex,ex@new,flow,flow@new,review,review@new,tests,tests@new,backup,backup@new,media,media@new";
const modeArg = process.argv[3] || "all";
const modes = modeArg === "all" ? ["dumps", "scn:" + SCENARIOS] : [modeArg];
const OUT = path.join(HERE, "out", label);
fs.mkdirSync(OUT, { recursive: true });

function edge(url, budget, prof) {
  return new Promise((ok) => {
    execFile(EDGE, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions",
      `--user-data-dir=${prof}`, `--virtual-time-budget=${budget}`, "--window-size=1280,900", "--dump-dom", url],
    { maxBuffer: 64 * 1024 * 1024, timeout: 120000 }, (e, stdout) => ok(stdout || ""));
  });
}
const profs = [...Array(6)].map((_, i) => path.join(os.tmpdir(), "gm-prof-" + i));

async function pool(jobs, n) {
  let i = 0;
  await Promise.all([...Array(n)].map(async (_, w) => { while (i < jobs.length) { const j = jobs[i++]; await j(profs[w]); } }));
}
// Normalizacja: ?v=<hash>, import map, znaczniki modułów.
const norm = (html) => html.replace(/\?v=[0-9a-f]{6,}/g, "?v=H")
  .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script[^>]*src="js\/[^"]*"[^>]*><\/script>/g, "<script src=APP></script>")
  .replace(/<link rel="modulepreload"[^>]*>\s*/g, "");

function routes(ids) {
  const L = ids.lessons, r = [];
  const tabs = ["", "/vocab", "/practice", "/find", "/test", "/dictation", "/speaking"];
  const n = L.length;
  [0, 1, 20].forEach((i) => tabs.forEach((t) => r.push(`#/lesson/${L[i]}${t}`)));
  [5, 12, 17, 26, 33, 40, 47, 50, 55, n - 1].forEach((i) => { r.push(`#/lesson/${L[i]}`); r.push(`#/lesson/${L[i]}/practice`); });
  r.push("#/", "#/practice", "#/tests", "#/bledy", "#/slowka", "#/vocab", `#/vocab/${ids.vocab[0]}`, `#/vocab/${ids.vocab[ids.vocab.length - 1]}`,
    `#/sprawdzian/${ids.checkpoints[0]}`, `#/sprawdzian/${ids.checkpoints[ids.checkpoints.length - 1]}`, "#/test-poziomu/A1", "#/test-poziomu/b2",
    "#/odmiana", "#/odmiana/go", "#/czasy", "#/czytanki", `#/czytanki/${ids.reading[0]}`, `#/czytanki/${ids.reading[ids.reading.length - 1]}`,
    "#/dialogi", `#/dialogi/${ids.dialogues[0]}`, `#/dialogi/${ids.dialogues[ids.dialogues.length - 1]}`, "#/rozmowy", `#/rozmowy/${ids.chats[0]}`,
    `#/rozmowy/${ids.chats[ids.chats.length - 1]}`, "#/kolejnosc", "#/kolejnosc/kopia", "#/kolejnosc/cel", "#/search/present%20perfect", "#/search/kitchen",
    "#/nie-ma-takiej", "#/lesson/nie-ma", "#/czytanki/nie-ma", "#/sprawdzian/nie-ma", "#bez-ukosnika");
  return r;
}

(async () => {
  const server = await start(PORT);
  const base = `http://127.0.0.1:${PORT}/`;
  try { for (const mode of modes) {
    if (mode === "prep") {
      const html = await edge(`${base}?__t=new&scn=prep`, 8000, profs[0]);
      const m = html.match(/<pre id="__gm">([\s\S]*?)<\/pre>/);
      if (!m) throw new Error("brak wyniku prep:\n" + html.slice(-2000));
      const res = JSON.parse(m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
      if (res.result.crash) throw new Error(res.result.crash);
      fs.writeFileSync(path.join(HERE, "state-student.json"), JSON.stringify(res.result.state, null, 1));
      fs.writeFileSync(path.join(HERE, "ids.json"), JSON.stringify(res.result.ids, null, 1));
      console.log("prep ok; errors:", res.errors);
    } else if (mode === "dumps") {
      const ids = JSON.parse(fs.readFileSync(path.join(HERE, "ids.json"), "utf8"));
      const rs = routes(ids), jobs = [];
      const list = [];
      for (const st of ["new", "student"]) rs.forEach((h, i) => {
        const name = `${st}-${String(i).padStart(3, "0")}`;
        list.push(name + " " + h);
        jobs.push(async (prof) => { fs.writeFileSync(path.join(OUT, name + ".html"), norm(await edge(`${base}?__t=${st}${h}`, 5000, prof))); });
      });
      fs.writeFileSync(path.join(OUT, "_list.txt"), list.join("\n"));
      const t = Date.now();
      await pool(jobs, 6);
      console.log(`${jobs.length} dumps in ${((Date.now() - t) / 1000).toFixed(0)} s`);
    } else if (mode.startsWith("scn:")) {
      const jobs = mode.slice(4).split(",").map((s) => async (prof) => {
        const [name, st = "student", extra = ""] = s.split("@");
        let p = prof; if (/offline/.test(name)) { p = fs.mkdtempSync(path.join(os.tmpdir(), "gm-sw-")); }
        const html = await edge(`${base}?__t=${st}&scn=${name}${extra ? "&" + extra : ""}`, 60000, p);
        const m = html.match(/<pre id="__gm">([\s\S]*?)<\/pre>/);
        fs.writeFileSync(path.join(OUT, `scn-${name}-${st}.txt`), m ? m[1] : "NO RESULT\n" + html.slice(-3000));
      });
      await pool(jobs, 6);
      console.log(`${jobs.length} scenarios done`);
    } else throw new Error("nieznany tryb: " + mode);
  } } finally { server.close(); }
})().catch((e) => { console.error(e); process.exit(1); });

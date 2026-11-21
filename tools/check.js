// Wszystkie szybkie sprawdzenia naraz – przed commitem (hook .githooks/pre-commit) i po każdej zmianie.
// Użycie: npm run check   (= node tools/check.js)
//
// Kroki (każdy wypisuje wynik; na końcu kod wyjścia 1, jeśli któryś się nie udał):
//  1. składnia wszystkich plików JS (node --check): js/, tools/, tests/, sw.js,
//  2. dane kursu: node tools/validate.js (błędy w lekcjach, ćwiczeniach, słówkach, czytankach, dialogach, rozmowach),
//  3. aktualność plików generowanych: data/bundle.js, index.html (?v=, import map) i sw.js muszą być takie,
//     jakie zrobiłby teraz `npm run build` – inaczej strona pokaże stare dane albo telefon nie dostanie nowej wersji,
//  4. testy: node --test (tests/*.test.mjs – sprawdzanie odpowiedzi, typowe błędy, powtórki, dziennik, kopia postępu,
//     dane kursu),
//  5. typy: tsc --noEmit (tools/typecheck.js – JSDoc w js/ i js/types.d.ts, tryb strict). Bez node_modules
//     (TypeScript to jedyna zależność deweloperska: npm install) ten krok jest pomijany z ostrzeżeniem – nie zatrzymuje.
// Bez audytu kolejności nauki (npm run audit – wolniejszy) i bez przeglądarki.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const rel = (p) => path.join(root, p);
const t0 = Date.now();
const results = [];
const step = (name, fn) => {
  const t = Date.now();
  let ok, info = "", skipped = false;
  try { const r = fn(); ok = r === true || (r && r.ok); info = (r && r.info) || ""; skipped = !!(r && r.skipped); } catch (e) { ok = false; info = e.message; }
  results.push(ok);
  console.log(`${ok ? (skipped ? "UWAGA" : "OK  ") : "BŁĄD"} ${name}${info ? " – " + info : ""} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
};
const run = (args, opts = {}) => spawnSync(process.execPath, args, { cwd: root, encoding: "utf8", ...opts });

function jsFiles(dir, ext = /\.(m?js)$/) {
  if (!fs.existsSync(rel(dir))) return [];
  const out = [];
  for (const e of fs.readdirSync(rel(dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...jsFiles(p, ext));
    else if (ext.test(e.name)) out.push(p);
  }
  return out;
}

step("składnia JS", () => {
  const files = [...jsFiles("js"), ...jsFiles("tools"), ...jsFiles("tests"), "sw.js"];
  const bad = files.filter((f) => { const r = run(["--check", f]); if (r.status !== 0) { process.stdout.write(r.stderr); return true; } return false; });
  return { ok: !bad.length, info: bad.length ? `błędy w: ${bad.join(", ")}` : `${files.length} plików` };
});

step("dane kursu (validate.js)", () => {
  const r = run(["tools/validate.js"]);
  const out = (r.stdout + r.stderr).trim().split("\n");
  if (r.status !== 0) { console.log(out.join("\n")); return false; }
  return { ok: true, info: out.filter((l) => !/^UWAGA: (data\/bundle|sw\.js)/.test(l)).pop() };
});

step("pliki generowane aktualne (bundle.js, index.html, sw.js)", () => {
  const build = require("./build-index.js");
  // Końce linii bez znaczenia (git na Windows zamienia LF ↔ CRLF w kopii roboczej).
  const same = (f, s) => fs.readFileSync(rel(f), "utf8").replace(/\r\n/g, "\n") === s.replace(/\r\n/g, "\n");
  const { content } = build.buildBundle();
  const stale = [];
  if (!same(build.BUNDLE, content)) stale.push(build.BUNDLE);
  const html = build.buildIndex(content);
  if (!same("index.html", html)) stale.push("index.html");
  if (!same(build.SW, build.buildSw(html).content)) stale.push(build.SW);
  return { ok: !stale.length, info: stale.length ? `nieaktualne: ${stale.join(", ")} – uruchom: npm run build` : "" };
});

step("testy (node --test)", () => {
  const files = jsFiles("tests", /\.test\.mjs$/);
  const r = run(["--test", "--test-reporter=dot", ...files]);
  const out = (r.stdout + r.stderr).trim();
  if (r.status !== 0) { console.log(out); return false; }
  return { ok: true, info: `${files.length} plików` };
});

step("typy (tsc)", () => require("./typecheck.js").typecheck());

const ok = results.every(Boolean);
console.log(ok ? `\nWszystko w porządku (${((Date.now() - t0) / 1000).toFixed(1)} s).` : "\nSą błędy – popraw je przed commitem.");
process.exit(ok ? 0 : 1);

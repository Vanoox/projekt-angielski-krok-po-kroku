// Buduje dane strony i aktualizuje index.html.
// Użycie: node tools/build-index.js
//
// URUCHAMIAJ PO KAŻDEJ ZMIANIE W data/ (lekcje, ćwiczenia, słownictwo, sprawdziany, order.json).
// Strona NIE czyta plików z data/ bezpośrednio – ładuje tylko data/bundle.js (jeden plik, mniej żądań),
// więc bez przebudowania pokaże stare dane. `node tools/validate.js` ostrzega, gdy bundle jest nieaktualny.
//
// Co robi:
//  1. Wczytuje wszystkie pliki danych w `vm` – w tej samej kolejności, w jakiej ładowałaby je przeglądarka
//     (lekcje według data/lessons/order.json, potem ćwiczenia, słownictwo, sprawdziany).
//  2. Zapisuje data/bundle.js: `window.LESSONS=[…];window.PRACTICE={…};…` jako JSON bez wcięć i komentarzy
//     (jeden wpis na linię, żeby diff w gicie był czytelny). Pliku bundle.js nie edytuj ręcznie.
//  3. W index.html wstawia <script src="data/bundle.js?v=<hash>"> między <!-- DATA:START --> i <!-- DATA:END -->
//     oraz dopisuje ?v=<hash> do css/style.css i js/app.js – po każdej zmianie adres się zmienia,
//     więc przeglądarka nie użyje starej wersji z pamięci podręcznej.
//
// Pliki źródłowe w data/ zostają do edycji; narzędzia z tools/ i tools/audit/ czytają katalogi, nie bundle.
// Kolejność lekcji = kolejność w data/lessons/order.json = ścieżka nauki (lekcja może używać tylko
// gramatyki i słówek z lekcji wcześniejszych – sprawdzisz to: node tools/audit/dump.js && node tools/audit/report.js).
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const root = path.join(__dirname, "..");
const rel = (...p) => path.join(root, ...p);
const BUNDLE = "data/bundle.js";
const GLOBALS = ["LESSONS", "PRACTICE", "VOCAB", "CHECKPOINTS"];

const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
const listJs = (d) => (fs.existsSync(rel(d)) ? fs.readdirSync(rel(d)).filter((f) => f.endsWith(".js")).sort() : []);

// Pliki danych w kolejności ładowania.
function dataFiles() {
  const order = JSON.parse(fs.readFileSync(rel("data/lessons/order.json"), "utf8"));
  const lessonFiles = listJs("data/lessons").map((f) => f.slice(0, -3));
  const missing = lessonFiles.filter((f) => !order.includes(f));
  const ids = order.filter((id) => lessonFiles.includes(id)).concat(missing);
  return {
    lessons: ids.map((id) => `data/lessons/${id}.js`),
    practice: listJs("data/practice").map((f) => `data/practice/${f}`),
    vocab: listJs("data/vocab").map((f) => `data/vocab/${f}`),
    checkpoints: fs.existsSync(rel("data/checkpoints.js")) ? ["data/checkpoints.js"] : [],
  };
}

// Dane muszą przetrwać JSON bez strat (bez funkcji, undefined, NaN, dat, wyrażeń regularnych).
function checkJson(v, where) {
  if (v === null || typeof v === "string" || typeof v === "boolean") return;
  if (typeof v === "number") { if (!Number.isFinite(v)) throw new Error(`${where}: liczba ${v} nie przejdzie przez JSON`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => checkJson(x, `${where}[${i}]`)); return; }
  // Obiekty z kontekstu vm mają własny Object.prototype, więc sprawdzamy nazwę konstruktora.
  const proto = typeof v === "object" ? Object.getPrototypeOf(v) : undefined;
  if (proto === null || (proto && proto.constructor && proto.constructor.name === "Object" && Object.getPrototypeOf(proto) === null)) {
    for (const [k, x] of Object.entries(v)) {
      if (x === undefined) throw new Error(`${where}.${k}: undefined (usuń pole albo daj null)`);
      checkJson(x, `${where}.${k}`);
    }
    return;
  }
  throw new Error(`${where}: wartość typu ${typeof v} nie przejdzie przez JSON`);
}

// Jeden wpis na linię: tablica → elementy, obiekt → klucze.
function serialize(name, v) {
  const json = (x) => JSON.stringify(x);
  if (Array.isArray(v)) return `window.${name}=[\n${v.map(json).join(",\n")}\n];`;
  return `window.${name}={\n${Object.entries(v).map(([k, x]) => `${json(k)}:${json(x)}`).join(",\n")}\n};`;
}

// Zwraca treść data/bundle.js (bez zapisu) – używa jej też validate.js do sprawdzenia aktualności.
function buildBundle() {
  const files = dataFiles();
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of Object.values(files).flat()) vm.runInContext(fs.readFileSync(rel(f), "utf8"), ctx, { filename: f });
  const parts = ["// Plik generowany przez `node tools/build-index.js` z plików w data/ – nie edytuj ręcznie."];
  for (const g of GLOBALS) {
    if (ctx.window[g] === undefined) continue;
    checkJson(ctx.window[g], g); // wyłapie to, co by zginęło w JSON
    parts.push(serialize(g, JSON.parse(JSON.stringify(ctx.window[g]))));
  }
  const extra = Object.keys(ctx.window).filter((k) => !GLOBALS.includes(k));
  if (extra.length) throw new Error(`Nieznane zmienne w danych: window.${extra.join(", window.")} – dopisz je do GLOBALS w tools/build-index.js`);
  return { content: parts.join("\n") + "\n", files };
}

function buildIndex(bundleContent) {
  const ver = (f) => hash(fs.readFileSync(rel(f)));
  let html = fs.readFileSync(rel("index.html"), "utf8");
  if (!/<!-- DATA:START -->[\s\S]*<!-- DATA:END -->/.test(html)) throw new Error("Brak znaczników <!-- DATA:START --> / <!-- DATA:END --> w index.html");
  html = html
    .replace(/<!-- DATA:START -->[\s\S]*<!-- DATA:END -->/, `<!-- DATA:START -->\n  <script src="${BUNDLE}?v=${hash(bundleContent)}"></script>\n  <!-- DATA:END -->`)
    .replace(/(href="css\/style\.css)(\?v=[^"]*)?"/, `$1?v=${ver("css/style.css")}"`)
    .replace(/(src="js\/app\.js)(\?v=[^"]*)?"/, `$1?v=${ver("js/app.js")}"`);
  return html;
}

module.exports = { buildBundle, buildIndex, hash, BUNDLE };

if (require.main === module) {
  try {
    const { content, files } = buildBundle();
    fs.writeFileSync(rel(BUNDLE), content);
    fs.writeFileSync(rel("index.html"), buildIndex(content));
    const n = Object.values(files).flat().length;
    console.log(`${BUNDLE}: ${(Buffer.byteLength(content) / 1024).toFixed(0)} KB z ${n} plików (${files.lessons.length} lekcji, ${files.practice.length} plików ćwiczeń, ${files.vocab.length} plików słownictwa, ${files.checkpoints.length ? "sprawdziany" : "bez sprawdzianów"}).`);
    console.log(`index.html: bundle.js?v=${hash(content)}`);
  } catch (e) {
    console.error("Błąd budowania: " + e.message);
    process.exit(1);
  }
}

// Buduje dane strony i aktualizuje index.html.
// Użycie: npm run build   (= node tools/build-index.js; npm run check sprawdza, czy wszystko jest aktualne)
//
// URUCHAMIAJ PO KAŻDEJ ZMIANIE W data/ (lekcje, ćwiczenia, słownictwo, czytanki, dialogi, rozmowy, sprawdziany, order.json).
// Strona NIE czyta plików z data/ bezpośrednio – ładuje tylko data/bundle.js (jeden plik, mniej żądań),
// więc bez przebudowania pokaże stare dane. `node tools/validate.js` ostrzega, gdy bundle jest nieaktualny.
//
// Co robi:
//  1. Wczytuje wszystkie pliki danych w `vm` – w tej samej kolejności, w jakiej ładowałaby je przeglądarka
//     (lekcje według data/lessons/order.json, potem ćwiczenia, słownictwo, czytanki, dialogi, rozmowy, sprawdziany).
//  2. Zapisuje data/bundle.js: `window.LESSONS=[…];window.PRACTICE={…};…;window.DIALOGUES=[…];window.CHATS=[…]` jako JSON bez wcięć i komentarzy
//     (jeden wpis na linię, żeby diff w gicie był czytelny). Pliku bundle.js nie edytuj ręcznie.
//  3. W index.html wstawia <script src="data/bundle.js?v=<hash>"> między <!-- DATA:START --> i <!-- DATA:END -->
//     oraz dopisuje ?v=<hash> do css/style.css i js/app.js (start strony) – po każdej zmianie adres się zmienia,
//     więc przeglądarka nie użyje starej wersji z pamięci podręcznej.
//     Między <!-- MODULES:START --> i <!-- MODULES:END --> wstawia import map (<script type="importmap">) i
//     <link rel="modulepreload"> dla wszystkich modułów ES z js/ i js/views/ (oprócz app.js): importy w kodzie piszemy
//     zwykle (import … from "./check.js", w widokach "../ui.js"), a import map zamienia je na js/check.js?v=<hash>.
//     Nowy plik w js/ (także w podkatalogu) trafia tu sam.
//  4. W sw.js (service worker – działanie offline, PWA) między // BUILD:START i // BUILD:END wpisuje
//     listę plików „app shell” (adresy z index.html, w tym moduły z import map + manifest + ikony z icons/),
//     adres arkusza fontów i VERSION = skrót ich treści. Zmiana VERSION (także po zmianie jednego modułu) =
//     telefony pobiorą nową wersję i pokażą „Jest nowa wersja”. Bez przebudowania zainstalowana strona zostaje na starej.
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
const SW = "sw.js";
const GLOBALS = ["LESSONS", "PRACTICE", "VOCAB", "CHECKPOINTS", "READING", "DIALOGUES", "CHATS"];

const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
const listJs = (d) => (fs.existsSync(rel(d)) ? fs.readdirSync(rel(d)).filter((f) => f.endsWith(".js")).sort() : []);
// Skrót pliku: tekst liczony po zamianie CRLF → LF (git na Windows zamienia końce linii w kopii roboczej –
// ten sam plik ma dawać ten sam ?v= na każdym komputerze i na GitHubie), obrazki – bajt po bajcie.
const fileHash = (f) => { const b = fs.readFileSync(rel(f)); return /\.(png|jpe?g|ico|webp|woff2?)$/i.test(f) ? hash(b) : hash(b.toString("utf8").replace(/\r\n/g, "\n")); };

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
    reading: listJs("data/reading").map((f) => `data/reading/${f}`),
    dialogues: listJs("data/dialogues").map((f) => `data/dialogues/${f}`),
    chats: listJs("data/chats").map((f) => `data/chats/${f}`),
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

// Moduły ES strony: wszystkie pliki .js w js/ (także w podkatalogach) oprócz js/app.js, który index.html ładuje
// wprost (<script type="module" src="js/app.js?v=…">). Kolejność stała (po nazwie), żeby index.html się nie zmieniał.
function moduleFiles() {
  const out = [];
  const walk = (d) => fs.readdirSync(rel(d), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)).forEach((e) => {
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".js") && p !== "js/app.js") out.push(p);
  });
  walk("js");
  return out;
}

function buildIndex(bundleContent) {
  const ver = fileHash;
  let html = fs.readFileSync(rel("index.html"), "utf8");
  if (!/<!-- DATA:START -->[\s\S]*<!-- DATA:END -->/.test(html)) throw new Error("Brak znaczników <!-- DATA:START --> / <!-- DATA:END --> w index.html");
  if (!/<!-- MODULES:START -->[\s\S]*<!-- MODULES:END -->/.test(html)) throw new Error("Brak znaczników <!-- MODULES:START --> / <!-- MODULES:END --> w index.html");
  if (!/<script type="module" src="js\/app\.js/.test(html)) throw new Error('Brak <script type="module" src="js/app.js"> w index.html');
  // Import map: import "./check.js" w js/app.js → adres js/check.js?v=<hash> (zmiana pliku = nowy adres, jak dla app.js);
  // modulepreload – przeglądarka pobiera wszystkie moduły od razu, a nie dopiero po przeczytaniu importów.
  const mods = moduleFiles().map((f) => [f, `${f}?v=${ver(f)}`]);
  const map = mods.map(([f, u]) => `    ${JSON.stringify("./" + f)}: ${JSON.stringify("./" + u)}`).join(",\n");
  const modBlock = [
    "<!-- MODULES:START -->",
    `  <script type="importmap">\n  { "imports": {\n${map}\n  } }\n  </script>`,
    ...mods.map(([, u]) => `  <link rel="modulepreload" href="${u}">`),
    "  <!-- MODULES:END -->",
  ].join("\n");
  html = html
    .replace(/<!-- DATA:START -->[\s\S]*<!-- DATA:END -->/, `<!-- DATA:START -->\n  <script src="${BUNDLE}?v=${hash(bundleContent)}"></script>\n  <!-- DATA:END -->`)
    .replace(/<!-- MODULES:START -->[\s\S]*<!-- MODULES:END -->/, () => modBlock)
    .replace(/(href="css\/style\.css)(\?v=[^"]*)?"/, `$1?v=${ver("css/style.css")}"`)
    .replace(/(src="js\/app\.js)(\?v=[^"]*)?"/, `$1?v=${ver("js/app.js")}"`);
  return html;
}

// Zwraca treść sw.js z aktualną listą plików i wersją. html = gotowy index.html (po buildIndex).
function buildSw(html) {
  const attr = (re, what) => { const m = html.match(re); if (!m) throw new Error(`Brak ${what} w index.html`); return m[1].replace(/&amp;/g, "&"); };
  const assets = [
    attr(/href="(css\/style\.css[^"]*)"/, "css/style.css"),
    attr(/src="(js\/app\.js[^"]*)"/, "js/app.js"),
    ...[...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((m) => m[1]), // moduły z js/ (import map)
    attr(/src="(data\/bundle\.js[^"]*)"/, BUNDLE),
    attr(/rel="manifest" href="([^"]+)"/, "<link rel=\"manifest\">"),
  ];
  const icons = fs.readdirSync(rel("icons")).filter((f) => f.endsWith(".png")).sort().map((f) => `icons/${f}`);
  const shell = ["./", ...assets, ...icons];
  const fontCss = attr(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/, "arkusza fontów Google");
  // Wersja = skrót index.html i treści wszystkich plików (adres bez ?v=).
  const version = hash(html.replace(/\r\n/g, "\n") + shell.slice(1).map((u) => fileHash(u.split("?")[0])).join(""));
  const block = [
    "// BUILD:START",
    `const VERSION = ${JSON.stringify(version)};`,
    `const SHELL = [\n${shell.map((u) => "  " + JSON.stringify(u)).join(",\n")},\n];`,
    `const FONT_CSS = ${JSON.stringify(fontCss)};`,
    "// BUILD:END",
  ].join("\n");
  const sw = fs.readFileSync(rel(SW), "utf8");
  const re = /\/\/ BUILD:START[\s\S]*\/\/ BUILD:END/;
  if (!re.test(sw)) throw new Error("Brak znaczników // BUILD:START / // BUILD:END w sw.js");
  return { content: sw.replace(re, () => block), version };
}

module.exports = { buildBundle, buildIndex, buildSw, moduleFiles, hash, BUNDLE, SW };

if (require.main === module) {
  try {
    const { content, files } = buildBundle();
    fs.writeFileSync(rel(BUNDLE), content);
    const html = buildIndex(content);
    fs.writeFileSync(rel("index.html"), html);
    const sw = buildSw(html);
    fs.writeFileSync(rel(SW), sw.content);
    const n = Object.values(files).flat().length;
    console.log(`${BUNDLE}: ${(Buffer.byteLength(content) / 1024).toFixed(0)} KB z ${n} plików (${files.lessons.length} lekcji, ${files.practice.length} plików ćwiczeń, ${files.vocab.length} plików słownictwa, ${files.reading.length} plików czytanek, ${files.dialogues.length} plików dialogów, ${files.chats.length} plików rozmów, ${files.checkpoints.length ? "sprawdziany" : "bez sprawdzianów"}).`);
    console.log(`index.html: bundle.js?v=${hash(content)}`);
    console.log(`${SW}: wersja ${sw.version}`);
  } catch (e) {
    console.error("Błąd budowania: " + e.message);
    process.exit(1);
  }
}

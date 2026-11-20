// Generuje listę <script> w index.html na podstawie plików w data/.
// Użycie: node tools/build-index.js   (uruchom po dodaniu nowego pliku z danymi)
// Kolejność lekcji = kolejność w data/lessons/order.json = ścieżka nauki (lekcja może używać tylko
// gramatyki i słówek z lekcji wcześniejszych – sprawdzisz to: node tools/audit/dump.js && node tools/audit/report.js).
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const rel = (...p) => path.join(root, ...p);

const order = JSON.parse(fs.readFileSync(rel("data/lessons/order.json"), "utf8"));
const lessonFiles = fs.readdirSync(rel("data/lessons")).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));
const missing = lessonFiles.filter((f) => !order.includes(f));
const ids = order.filter((id) => lessonFiles.includes(id)).concat(missing);

const practice = fs.existsSync(rel("data/practice")) ? fs.readdirSync(rel("data/practice")).filter((f) => f.endsWith(".js")).sort() : [];
const vocab = fs.existsSync(rel("data/vocab")) ? fs.readdirSync(rel("data/vocab")).filter((f) => f.endsWith(".js")).sort() : [];

const tags = [
  "  <!-- Lekcje (teoria + szybki sprawdzian) -->",
  ...ids.map((id) => `  <script src="data/lessons/${id}.js"></script>`),
  "  <!-- Ćwiczenia, testy i słownictwo do lekcji -->",
  ...practice.map((f) => `  <script src="data/practice/${f}"></script>`),
  "  <!-- Słownictwo tematyczne -->",
  ...vocab.map((f) => `  <script src="data/vocab/${f}"></script>`),
  ...(fs.existsSync(rel("data/checkpoints.js")) ? ["  <!-- Sprawdziany powtórkowe -->", `  <script src="data/checkpoints.js"></script>`] : []),
].join("\n");

const html = fs.readFileSync(rel("index.html"), "utf8");
const out = html.replace(/<!-- DATA:START -->[\s\S]*<!-- DATA:END -->/, `<!-- DATA:START -->\n${tags}\n  <!-- DATA:END -->`);
if (out === html && !html.includes("DATA:START")) { console.error("Brak znaczników <!-- DATA:START --> / <!-- DATA:END --> w index.html"); process.exit(1); }
fs.writeFileSync(rel("index.html"), out);
console.log(`index.html: ${ids.length} lekcji, ${practice.length} plików ćwiczeń, ${vocab.length} plików słownictwa.`);

// Walidator danych. Użycie:
//   node tools/validate.js                 – wszystko (lekcje, ćwiczenia, słownictwo)
//   node tools/validate.js data/practice/have-got.js data/lessons/have-got.js   – wybrane pliki (+ kontekst lekcji)
// Kod wyjścia 1 = są błędy.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const LEVELS = ["A1", "A2", "B1", "B2"];
const CATEGORIES = [
  "Czasy", "Formy czasownika", "Podstawy", "Rzeczowniki i określniki", "Zaimki", "Przymiotniki i przysłówki",
  "Przyimki", "Czasowniki modalne", "Tryby warunkowe", "Konstrukcje zdaniowe", "Słownictwo i łączniki",
];
const SECTION_TYPES = ["text", "formula", "examples", "table", "tip", "warning", "mistakes", "compare"];
const EX_TYPES = ["choice", "gap", "write", "order"];

const listJs = (d) => (fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith(".js")).map((f) => path.join(ROOT, d, f)) : []);
let files = process.argv.slice(2).map((f) => path.resolve(f));
const only = files.length ? new Set(files) : null;
// Zawsze ładujemy wszystkie lekcje (potrzebne do sprawdzenia id/requires), błędy raportujemy tylko dla wskazanych plików.
const all = [...listJs("data/lessons"), ...listJs("data/practice"), ...listJs("data/vocab")];

const errors = [];
const sandbox = { window: {} };
const fileOf = new Map();
for (const file of all) {
  const before = { L: (sandbox.window.LESSONS || []).length, V: (sandbox.window.VOCAB || []).length, P: Object.keys(sandbox.window.PRACTICE || {}) };
  try {
    vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  } catch (e) {
    errors.push(`${path.relative(ROOT, file)}: błąd składni/wykonania: ${e.message}`);
    continue;
  }
  (sandbox.window.LESSONS || []).slice(before.L).forEach((l) => fileOf.set("L:" + l.id, file));
  (sandbox.window.VOCAB || []).slice(before.V).forEach((t) => fileOf.set("V:" + t.id, file));
  Object.keys(sandbox.window.PRACTICE || {}).filter((k) => !before.P.includes(k)).forEach((k) => fileOf.set("P:" + k, file));
}
const report = (key) => !only || only.has(fileOf.get(key));

// ---------- pomocnicze ----------
const strip = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
function tagBalance(s) {
  const st = [];
  for (const m of String(s).matchAll(/<\/?(b|i|em|p|ul|ol|li|code|strong|u)\b[^>]*>/g)) {
    const closing = m[0][1] === "/";
    if (!closing) st.push(m[1]);
    else if (st.pop() !== m[1]) return false;
  }
  return st.length === 0;
}
function checkStrings(obj, err, where = "") {
  if (typeof obj === "string") {
    if (!tagBalance(obj)) err(`${where}: niezamknięte/źle zagnieżdżone tagi HTML: ${obj.slice(0, 80)}`);
    if (/\s{2,}$|^\s+\S/.test(obj) && obj.length < 300) {/* tolerujemy */}
    return;
  }
  if (Array.isArray(obj)) obj.forEach((x, i) => checkStrings(x, err, `${where}[${i}]`));
  else if (obj && typeof obj === "object") for (const [k, v] of Object.entries(obj)) checkStrings(v, err, where ? `${where}.${k}` : k);
}
function braces(a) { // poprawność składni ( ) { | }
  let p = 0, c = 0;
  for (const ch of a) { if (ch === "(") p++; if (ch === ")") p--; if (ch === "{") c++; if (ch === "}") c--; if (p < 0 || c < 0) return false; }
  return p === 0 && c === 0;
}

function checkExercise(x, xe, ctx) {
  if (!x || typeof x !== "object") return xe("puste zadanie");
  if (!EX_TYPES.includes(x.type)) return xe(`nieznany typ "${x.type}" (dozwolone: ${EX_TYPES.join(", ")})`);
  if (!x.explain || !strip(x.explain)) xe("brak explain (krótkie wyjaśnienie po polsku)");
  if (x.type === "choice") {
    if (!x.q) xe("brak q");
    if (!Array.isArray(x.options) || x.options.length < 2) xe("choice potrzebuje min. 2 options");
    else if (new Set(x.options.map((o) => strip(o).toLowerCase())).size !== x.options.length) xe("powtórzone opcje");
    if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer >= (x.options || []).length) xe("answer musi być poprawnym indeksem");
  } else if (x.type === "gap") {
    const n = (String(x.q || "").match(/___/g) || []).length;
    if (!n) xe("gap musi zawierać ___");
    if (!Array.isArray(x.answers) || !x.answers.length) xe("gap potrzebuje answers");
    else if (n > 1) {
      if (x.answers.length !== n || !x.answers.every((a) => Array.isArray(a) && a.length && a.every((s) => typeof s === "string" && s.trim())))
        xe(`q ma ${n} luki → answers musi być tablicą ${n} tablic (warianty dla każdej luki)`);
    } else if (!x.answers.every((a) => typeof a === "string" && a.trim())) xe("answers musi być tablicą niepustych stringów");
    (x.answers || []).flat().forEach((a) => { if (typeof a === "string" && !braces(a)) xe(`niezbalansowane ( ) / { } w odpowiedzi: ${a}`); });
  } else if (x.type === "write") {
    if (!x.q || !strip(x.q)) xe("brak q (polecenie / zdanie do przetłumaczenia lub przekształcenia)");
    if (!Array.isArray(x.answers) || !x.answers.length || !x.answers.every((a) => typeof a === "string" && a.trim())) xe("write potrzebuje answers: [pełne zdania]");
    else {
      x.answers.forEach((a) => {
        if (a.includes("___")) xe(`odpowiedź nie może zawierać ___: ${a}`);
        if (/<[^>]+>/.test(a)) xe(`odpowiedź nie może zawierać HTML: ${a}`);
        if (!braces(a)) xe(`niezbalansowane ( ) / { } w odpowiedzi: ${a}`);
      });
      if (new Set(x.answers.map((a) => a.toLowerCase())).size !== x.answers.length) xe("zdublowane odpowiedzi");
    }
  } else if (x.type === "order") {
    if (!Array.isArray(x.answers) || !x.answers.length) xe("order potrzebuje answers: [zdanie]");
    else {
      const a0 = x.answers[0];
      if (/[(){}|]/.test(a0)) xe("pierwsza odpowiedź w order nie może zawierać ( ) { } | – z niej powstają kafelki");
      if (/<[^>]+>/.test(a0)) xe("odpowiedź nie może zawierać HTML");
      const toks = a0.replace(/[.?!]+$/, "").split(/\s+/);
      if (toks.length < 3) xe("za krótkie zdanie do układania (min. 3 wyrazy)");
      if (toks.length > 16) xe("za długie zdanie do układania (max 16 kafelków)");
      if (x.words) {
        const norm = (s) => s.toLowerCase().replace(/[.?!,]/g, "").split(/\s+/).sort().join(" ");
        if (norm(x.words.join(" ")) !== norm(a0.replace(/[.?!]+$/, ""))) xe("words nie odpowiadają wyrazom z answers[0]");
      }
    }
  }
  if (ctx) {
    const sig = x.type + "|" + strip(x.q || (x.answers || [])[0]).toLowerCase() + (x.type === "choice" ? "|" + (x.options || []).map(strip).join("|") : "");
    if (ctx.has(sig)) xe(`zdublowane zadanie: ${strip(x.q || x.answers[0]).slice(0, 70)}`);
    ctx.add(sig);
  }
  checkStrings({ q: x.q, explain: x.explain, options: x.options, hint: x.hint, task: x.task }, xe, "html");
}

function checkVocabItems(items, err, label) {
  if (!Array.isArray(items) || !items.length) return err(`${label}: brak items`);
  const seen = new Set();
  items.forEach((w, i) => {
    if (!w || !w.en || !w.pl) err(`${label}[${i}]: słowo bez en/pl`);
    const k = strip(w && w.en).toLowerCase();
    if (seen.has(k)) err(`${label}: zdublowane słowo „${k}”`);
    seen.add(k);
    if (w && w.exPl && !w.ex) err(`${label}[${i}]: exPl bez ex`);
  });
  checkStrings(items, err, label);
}

// ---------- lekcje ----------
const lessons = sandbox.window.LESSONS || [];
const ids = new Set();
let exTotal = 0, exampleTotal = 0;
for (const l of lessons) {
  const key = "L:" + l.id;
  const where = `${path.relative(ROOT, fileOf.get(key) || "?")} → ${l.id || "(brak id)"}`;
  const err = (m) => { if (report(key)) errors.push(`${where}: ${m}`); };
  if (!l.id || !/^[a-z0-9-]+$/.test(l.id)) err("id musi być kebab-case");
  if (ids.has(l.id)) err("zduplikowane id");
  ids.add(l.id);
  for (const k of ["title", "titlePl", "summary"]) if (typeof l[k] !== "string" || !l[k]) err(`brak pola ${k}`);
  if (!LEVELS.includes(l.level)) err(`level musi być jednym z ${LEVELS}`);
  if (!CATEGORIES.includes(l.category)) err(`nieznana kategoria "${l.category}"`);
  if (!Array.isArray(l.sections) || !l.sections.length) err("brak sections");
  for (const [i, s] of (l.sections || []).entries()) {
    const se = (m) => err(`sekcja ${i} (${s.type}${s.title ? " „" + strip(s.title).slice(0, 30) + "”" : ""}): ${m}`);
    if (!SECTION_TYPES.includes(s.type)) { se("nieznany typ"); continue; }
    if (["text", "tip", "warning"].includes(s.type) && !s.html) se("brak html");
    if (s.type === "formula") {
      if (!(s.rows || []).every((r) => r.label && r.formula)) se("każdy wiersz potrzebuje label i formula");
      for (const r of s.rows || []) if (r.example && /\s[–—]\s[^<]*[ąćęłńóśźż]/i.test(r.example)) se(`polskie tłumaczenie wewnątrz example – przenieś do examplePl: ${strip(r.example)}`);
    }
    if (s.type === "examples") {
      if (!(s.items || []).length) se("brak items");
      for (const it of s.items || []) { if (!it.en || !it.pl) se("przykład bez en/pl"); exampleTotal++; }
    }
    if (s.type === "table") {
      if (!(s.headers || []).length) se("brak headers");
      for (const r of s.rows || []) if (r.length !== s.headers.length) se(`wiersz ma ${r.length} kolumn zamiast ${s.headers.length}`);
    }
    if (s.type === "mistakes" && !(s.items || []).every((m) => m.wrong && m.right && m.why)) se("każdy błąd potrzebuje wrong/right/why");
    if (s.type === "compare") {
      if (!(s.items || []).every((c) => c.label && c.html)) se("każda kolumna potrzebuje label i html");
      for (const c of s.items || []) for (const e of c.examples || []) {
        if (typeof e === "string" && /\s[–—]\s[^<]*[ąćęłńóśźż]/i.test(e)) se(`polskie tłumaczenie w przykładzie – użyj {en, pl}: ${strip(e)}`);
        if (typeof e === "object" && (!e.en || !e.pl)) se("przykład-obiekt potrzebuje en i pl");
      }
    }
  }
  checkStrings(l.sections, err, "sections");
  if (!Array.isArray(l.exercises) || l.exercises.length < 5) err("potrzeba co najmniej 5 ćwiczeń");
  const ctx = new Set();
  for (const [i, x] of (l.exercises || []).entries()) { exTotal++; checkExercise(x, (m) => err(`ćwiczenie ${i}: ${m}`), ctx); }
}

// ---------- ćwiczenia / testy / słownictwo lekcji ----------
const P = sandbox.window.PRACTICE || {};
let practiceTotal = 0, testTotal = 0, lessonVocab = 0;
for (const [id, p] of Object.entries(P)) {
  const key = "P:" + id;
  const where = `${path.relative(ROOT, fileOf.get(key) || "?")} → ${id}`;
  const err = (m) => { if (report(key)) errors.push(`${where}: ${m}`); };
  if (!ids.has(id)) err("brak lekcji o takim id");
  const lesson = lessons.find((l) => l.id === id);
  for (const r of p.requires || []) if (!ids.has(r)) err(`requires: nieznana lekcja „${r}”`);
  if (p.vocab) { checkVocabItems(p.vocab.items, err, "vocab"); lessonVocab += (p.vocab.items || []).length; }
  const ctx = new Set();
  for (const x of (lesson && lesson.exercises) || []) ctx.add(x.type + "|" + strip(x.q || "").toLowerCase() + (x.type === "choice" ? "|" + (x.options || []).map(strip).join("|") : ""));
  (p.practice || []).forEach((set, si) => {
    const pe = (m) => err(`practice[${si}]${set && set.title ? " „" + strip(set.title).slice(0, 40) + "”" : ""}: ${m}`);
    if (!set.title) pe("brak title");
    if (!Array.isArray(set.items) || set.items.length < 4) pe("zestaw potrzebuje min. 4 zadań");
    (set.items || []).forEach((x, i) => { practiceTotal++; checkExercise(x, (m) => pe(`zadanie ${i}: ${m}`), ctx); });
  });
  (p.test || []).forEach((x, i) => { testTotal++; checkExercise(x, (m) => err(`test[${i}]: ${m}`), ctx); });
}

// ---------- słownictwo tematyczne ----------
const V = sandbox.window.VOCAB || [];
const vids = new Set();
let words = 0;
for (const t of V) {
  const key = "V:" + t.id;
  const where = `${path.relative(ROOT, fileOf.get(key) || "?")} → ${t.id || "(brak id)"}`;
  const err = (m) => { if (report(key)) errors.push(`${where}: ${m}`); };
  if (!t.id || !/^[a-z0-9-]+$/.test(t.id)) err("id musi być kebab-case");
  if (vids.has(t.id)) err("zduplikowane id działu");
  vids.add(t.id);
  for (const k of ["title", "titlePl"]) if (!t[k]) err(`brak ${k}`);
  if (!LEVELS.includes(t.level)) err("zły level");
  if (!Array.isArray(t.groups) || !t.groups.length) err("brak groups");
  const all = (t.groups || []).flatMap((g) => g.items || []);
  (t.groups || []).forEach((g, i) => checkVocabItems(g.items, err, `groups[${i}]${g.title ? " „" + g.title + "”" : ""}`));
  const seen = new Set();
  for (const w of all) { const k = strip(w.en).toLowerCase(); if (seen.has(k)) err(`słowo „${k}” występuje w kilku grupach`); seen.add(k); }
  words += all.length;
}

// ---------- aktualność data/bundle.js, index.html i sw.js (strona ładuje tylko bundle) ----------
// Ostrzeżenie, nie błąd: porównujemy treść, a nie daty plików (git ich nie zachowuje).
try {
  const build = require("./build-index.js");
  const { content } = build.buildBundle();
  const bundlePath = path.join(ROOT, build.BUNDLE);
  const current = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, "utf8") : "";
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const newHtml = build.buildIndex(content);
  if (current !== content || html !== newHtml)
    console.log("UWAGA: data/bundle.js albo index.html są nieaktualne – strona pokaże stare dane. Uruchom: node tools/build-index.js");
  else if (fs.readFileSync(path.join(ROOT, build.SW), "utf8") !== build.buildSw(newHtml).content)
    console.log("UWAGA: sw.js jest nieaktualny – zainstalowana strona (offline) nie dostanie nowej wersji. Uruchom: node tools/build-index.js");
} catch (e) {
  console.log("UWAGA: nie udało się sprawdzić data/bundle.js: " + e.message);
}

if (errors.length) {
  console.log(`BŁĘDY (${errors.length}):\n` + errors.slice(0, 300).map((e) => " - " + e).join("\n") + (errors.length > 300 ? `\n … i ${errors.length - 300} więcej` : ""));
  process.exit(1);
}
console.log(`OK: ${lessons.length} lekcji, ${exampleTotal} przykładów, ${exTotal} zadań w sprawdzianach, ${practiceTotal} zadań w zestawach, ${testTotal} zadań testowych, ${lessonVocab} słówek w lekcjach, ${V.length} działów słownictwa (${words} słówek).`);

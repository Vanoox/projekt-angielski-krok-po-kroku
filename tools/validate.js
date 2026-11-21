// Walidator danych. Użycie:
//   node tools/validate.js                 – wszystko (lekcje, ćwiczenia, słownictwo, czytanki, dialogi, rozmowy)
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
const all = [...listJs("data/lessons"), ...listJs("data/practice"), ...listJs("data/vocab"), ...listJs("data/reading"), ...listJs("data/dialogues"), ...listJs("data/chats")];

const errors = [];
const sandbox = { window: {} };
const fileOf = new Map();
for (const file of all) {
  const before = { L: (sandbox.window.LESSONS || []).length, V: (sandbox.window.VOCAB || []).length, R: (sandbox.window.READING || []).length, D: (sandbox.window.DIALOGUES || []).length, C: (sandbox.window.CHATS || []).length, P: Object.keys(sandbox.window.PRACTICE || {}) };
  try {
    vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  } catch (e) {
    errors.push(`${path.relative(ROOT, file)}: błąd składni/wykonania: ${e.message}`);
    continue;
  }
  (sandbox.window.LESSONS || []).slice(before.L).forEach((l) => fileOf.set("L:" + l.id, file));
  (sandbox.window.VOCAB || []).slice(before.V).forEach((t) => fileOf.set("V:" + t.id, file));
  (sandbox.window.READING || []).slice(before.R).forEach((r) => fileOf.set("R:" + r.id, file));
  (sandbox.window.DIALOGUES || []).slice(before.D).forEach((d) => fileOf.set("D:" + d.id, file));
  (sandbox.window.CHATS || []).slice(before.C).forEach((c) => fileOf.set("C:" + c.id, file));
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
    // „Znajdź błąd” (js/tasks.js, buildFinds) bierze pierwszy wariant wrong (przed „ / ”) i każe kliknąć słowo z <b>…</b>; fix = pełne poprawne zdania.
    if (s.type === "mistakes") for (const m of s.items || []) {
      const w0 = String(m.wrong || "").replace(/\s*\([^()]*\)$/, "").split(/\s+\/\s+/)[0];
      if (m.wrong && !/<b>[^<]*\S[^<]*<\/b>/.test(w0)) se(`wrong bez <b>…</b> w pierwszym wariancie (zadanie „Znajdź błąd” go pominie): ${strip(m.wrong)}`);
      if ("fix" in m && !(Array.isArray(m.fix) && m.fix.length && m.fix.every((f) => typeof f === "string" && f.trim() && !/<[^>]+>|\s\/\s/.test(f))))
        se(`fix musi być niepustą listą pełnych zdań (bez znaczników HTML i „ / ” – warianty jako {a|b}): ${strip(m.wrong)}`);
    }
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

// ---------- czytanki (data/reading/*.js → window.READING, format: tools/FORMAT.md) ----------
const RD = sandbox.window.READING || [];
const rids = new Set();
let rdQuestions = 0;
for (const r of RD) {
  const key = "R:" + r.id;
  const where = `${path.relative(ROOT, fileOf.get(key) || "?")} → ${r.id || "(brak id)"}`;
  const err = (m) => { if (report(key)) errors.push(`${where}: ${m}`); };
  if (!r.id || !/^[a-z0-9-]+$/.test(r.id)) err("id musi być kebab-case");
  if (rids.has(r.id)) err("zduplikowane id czytanki");
  rids.add(r.id);
  for (const k of ["title", "titlePl"]) if (typeof r[k] !== "string" || !r[k].trim()) err(`brak ${k}`);
  if ("topic" in r && (typeof r.topic !== "string" || !r.topic.trim())) err("topic musi być niepustym tekstem");
  if (!LEVELS.includes(r.level)) err(`level musi być jednym z ${LEVELS}`);
  const after = lessons.find((l) => l.id === r.after);
  if (!after) err(`after: nieznana lekcja „${r.after}”`);
  else if (LEVELS.indexOf(r.level) < LEVELS.indexOf(after.level)) err(`level ${r.level} niższy niż poziom lekcji after (${after.level})`);
  if (!Array.isArray(r.text) || !r.text.length) err("text musi być niepustą tablicą akapitów");
  else r.text.forEach((p, i) => {
    if (typeof p !== "string" || !p.trim()) err(`text[${i}]: pusty akapit`);
    else if (/[<>"]/.test(p)) err(`text[${i}]: bez HTML i prostych cudzysłowów (w tekście angielskim “…”): ${p.slice(0, 60)}`);
  });
  if (!r.glossary || typeof r.glossary !== "object" || Array.isArray(r.glossary)) err("glossary musi być obiektem { słowo: tłumaczenie } (może być pusty)");
  else for (const [w, t] of Object.entries(r.glossary)) {
    if (!w.trim() || /[<>]/.test(w) || w !== w.trim()) err(`glossary: złe hasło „${w}”`);
    if (typeof t !== "string" || !t.trim()) err(`glossary „${w}”: brak tłumaczenia`);
  }
  if (!Array.isArray(r.questions) || r.questions.length < 3) err("potrzeba co najmniej 3 pytań (questions)");
  const ctx = new Set();
  (r.questions || []).forEach((x, i) => { rdQuestions++; checkExercise(x, (m) => err(`pytanie ${i}: ${m}`), ctx); });
}

// ---------- dialogi (data/dialogues/*.js → window.DIALOGUES, format: tools/FORMAT.md) ----------
const DL = sandbox.window.DIALOGUES || [];
const dids = new Set();
let dlQuestions = 0, dlLines = 0;
for (const d of DL) {
  const key = "D:" + d.id;
  const where = `${path.relative(ROOT, fileOf.get(key) || "?")} → ${d.id || "(brak id)"}`;
  const err = (m) => { if (report(key)) errors.push(`${where}: ${m}`); };
  if (!d.id || !/^[a-z0-9-]+$/.test(d.id)) err("id musi być kebab-case");
  if (dids.has(d.id)) err("zduplikowane id dialogu");
  dids.add(d.id);
  for (const k of ["title", "titlePl", "setting"]) if (typeof d[k] !== "string" || !d[k].trim()) err(`brak ${k}`);
  if (/[<>]/.test(d.setting || "")) err("setting: bez HTML");
  if ("topic" in d && (typeof d.topic !== "string" || !d.topic.trim())) err("topic musi być niepustym tekstem");
  if (!LEVELS.includes(d.level)) err(`level musi być jednym z ${LEVELS}`);
  const after = lessons.find((l) => l.id === d.after);
  if (!after) err(`after: nieznana lekcja „${d.after}”`);
  else if (LEVELS.indexOf(d.level) < LEVELS.indexOf(after.level)) err(`level ${d.level} niższy niż poziom lekcji after (${after.level})`);
  const ppl = d.people && typeof d.people === "object" ? d.people : null;
  if (!ppl) err("brak people: { A: { name, g }, B: { name, g } }");
  else for (const w of ["A", "B"]) {
    const p = ppl[w];
    if (!p || typeof p.name !== "string" || !p.name.trim() || /[<>]/.test(p.name)) err(`people.${w}: brak name`);
    else if ("g" in p && !["m", "f"].includes(p.g)) err(`people.${w}.g: "m" albo "f"`);
  }
  if (ppl && Object.keys(ppl).some((k) => !["A", "B"].includes(k))) err("people: tylko A i B");
  if (!Array.isArray(d.lines) || d.lines.length < 6 || d.lines.length > 14) err("lines: 6–14 kwestii");
  if (Array.isArray(d.lines)) {
    d.lines.forEach((x, i) => {
      dlLines++;
      if (!x || !["A", "B"].includes(x.who)) err(`lines[${i}]: who musi być "A" albo "B"`);
      if (!x || typeof x.en !== "string" || !x.en.trim()) err(`lines[${i}]: brak en`);
      else {
        if (/[<>"]/.test(x.en)) err(`lines[${i}]: en bez HTML i prostych cudzysłowów: ${x.en.slice(0, 60)}`);
        if (!/[.!?][”’]?$/.test(x.en.trim())) err(`lines[${i}]: en musi kończyć się . ! albo ?: ${x.en.slice(0, 60)}`);
        if (/[ąćęłńóśźż]/i.test(x.en)) err(`lines[${i}]: en wygląda na polski`);
      }
      if (!x || typeof x.pl !== "string" || !x.pl.trim() || /[<>]/.test(x.pl)) err(`lines[${i}]: brak pl (tłumaczenie, bez HTML)`);
    });
    if (!d.lines.some((x) => x && x.who === "A") || !d.lines.some((x) => x && x.who === "B")) err("lines: mówią obie osoby (A i B)");
  }
  if ("glossary" in d) {
    if (!d.glossary || typeof d.glossary !== "object" || Array.isArray(d.glossary)) err("glossary musi być obiektem { słowo: tłumaczenie }");
    else for (const [w, t] of Object.entries(d.glossary)) {
      if (!w.trim() || /[<>]/.test(w) || w !== w.trim()) err(`glossary: złe hasło „${w}”`);
      if (typeof t !== "string" || !t.trim()) err(`glossary „${w}”: brak tłumaczenia`);
    }
  }
  if (!Array.isArray(d.questions) || d.questions.length < 3) err("potrzeba co najmniej 3 pytań (questions)");
  const ctx = new Set();
  (d.questions || []).forEach((x, i) => { dlQuestions++; checkExercise(x, (m) => err(`pytanie ${i}: ${m}`), ctx); });
}

// ---------- rozmowy z wyborem odpowiedzi (data/chats/*.js → window.CHATS, format: tools/FORMAT.md) ----------
// Graf: węzeł z wyborem { say, pl, options: [{ en, pl?, next?, ok?, feedback? }] } albo końcowy { say, pl, end: "ok"|"fail", note? }.
// Sprawdzamy: każdy next istnieje, wszystkie węzły osiągalne ze start, brak pętli, z każdego węzła da się dojść do końca,
// dobre odpowiedzi (ok) zawsze prowadzą dalej i kończą się celem osiągniętym (end "ok") po 5–8 krokach.
const CH = sandbox.window.CHATS || [];
const cids = new Set();
let chNodes = 0, chOptions = 0;
const enLine = (s) => typeof s === "string" && s.trim() && !/[<>"]/.test(s) && /[.!?][”’]?$/.test(s.trim())
  && !/[ąćęłńóśźż]/i.test(s.replace(/(^|[\s(])\p{Lu}\p{L}*/gu, "")); // polskie litery tylko w nazwach (Gdańsk, Kraków)
for (const c of CH) {
  const key = "C:" + c.id;
  const where = `${path.relative(ROOT, fileOf.get(key) || "?")} → ${c.id || "(brak id)"}`;
  const err = (m) => { if (report(key)) errors.push(`${where}: ${m}`); };
  if (!c.id || !/^[a-z0-9-]+$/.test(c.id)) err("id musi być kebab-case");
  if (cids.has(c.id)) err("zduplikowane id rozmowy");
  cids.add(c.id);
  for (const k of ["title", "titlePl", "setting", "goal"]) if (typeof c[k] !== "string" || !c[k].trim() || /[<>]/.test(c[k])) err(`brak ${k} (tekst bez HTML)`);
  if ("topic" in c && (typeof c.topic !== "string" || !c.topic.trim())) err("topic musi być niepustym tekstem");
  if (!LEVELS.includes(c.level)) err(`level musi być jednym z ${LEVELS}`);
  const after = lessons.find((l) => l.id === c.after);
  if (!after) err(`after: nieznana lekcja „${c.after}”`);
  else if (LEVELS.indexOf(c.level) < LEVELS.indexOf(after.level)) err(`level ${c.level} niższy niż poziom lekcji after (${after.level})`);
  const p = c.partner;
  if (!p || typeof p.name !== "string" || !p.name.trim() || /[<>]/.test(p.name)) err("brak partner: { name, g }");
  else if ("g" in p && !["m", "f"].includes(p.g)) err(`partner.g: "m" albo "f"`);
  if ("glossary" in c) {
    if (!c.glossary || typeof c.glossary !== "object" || Array.isArray(c.glossary)) err("glossary musi być obiektem { słowo: tłumaczenie }");
    else for (const [w, t] of Object.entries(c.glossary)) {
      if (!w.trim() || /[<>]/.test(w) || w !== w.trim()) err(`glossary: złe hasło „${w}”`);
      if (typeof t !== "string" || !t.trim()) err(`glossary „${w}”: brak tłumaczenia`);
    }
  }
  const N = c.nodes && typeof c.nodes === "object" && !Array.isArray(c.nodes) ? c.nodes : null;
  if (!N) { err("brak nodes: { id: węzeł }"); continue; }
  if (!N[c.start]) err(`start: nie ma węzła „${c.start}”`);
  for (const [id, n] of Object.entries(N)) {
    chNodes++;
    const nw = `węzeł ${id}`;
    if (!/^[a-z0-9-]+$/i.test(id)) err(`${nw}: id tylko litery, cyfry i „-”`);
    if (!n || typeof n !== "object") { err(`${nw}: pusty`); continue; }
    if (!enLine(n.say)) err(`${nw}: say – kwestia rozmówcy po angielsku, bez HTML i prostych cudzysłowów, zakończona . ! albo ?`);
    if (typeof n.pl !== "string" || !n.pl.trim() || /[<>]/.test(n.pl)) err(`${nw}: brak pl (tłumaczenie, bez HTML)`);
    if ("end" in n) {
      if (!["ok", "fail"].includes(n.end)) err(`${nw}: end musi być "ok" albo "fail"`);
      if ("options" in n) err(`${nw}: węzeł końcowy nie ma options`);
      if ("note" in n && (typeof n.note !== "string" || !n.note.trim() || /[<>]/.test(n.note))) err(`${nw}: note – tekst po polsku bez HTML`);
      continue;
    }
    if (!Array.isArray(n.options) || n.options.length < 2 || n.options.length > 3) { err(`${nw}: options – 2 albo 3 odpowiedzi (albo end: "ok"/"fail")`); continue; }
    if (!n.options.some((o) => o && o.ok)) err(`${nw}: potrzebna co najmniej jedna dobra odpowiedź (ok: true)`);
    const seen = new Set();
    n.options.forEach((o, i) => {
      chOptions++;
      const ow = `${nw}, odpowiedź ${i + 1}`;
      if (!o || !enLine(o.en)) { err(`${ow}: en – po angielsku, bez HTML i prostych cudzysłowów, zakończona . ! albo ?`); return; }
      const k = o.en.trim().toLowerCase();
      if (seen.has(k)) err(`${ow}: powtórzona odpowiedź`);
      seen.add(k);
      if ("ok" in o && typeof o.ok !== "boolean") err(`${ow}: ok musi być true/false`);
      if ("next" in o && !N[o.next]) err(`${ow}: next – nie ma węzła „${o.next}”`);
      if (o.ok && !("next" in o)) err(`${ow}: dobra odpowiedź musi mieć next`);
      if (o.ok && (typeof o.pl !== "string" || !o.pl.trim())) err(`${ow}: dobra odpowiedź potrzebuje pl (lista „do zapamiętania”)`);
      if ("pl" in o && (typeof o.pl !== "string" || /[<>]/.test(o.pl))) err(`${ow}: pl bez HTML`);
      if (!o.ok && (typeof o.feedback !== "string" || !o.feedback.trim() || /[<>]/.test(o.feedback))) err(`${ow}: zła odpowiedź potrzebuje feedback (po polsku, dlaczego nie; bez HTML)`);
      if (o.ok && "feedback" in o && (typeof o.feedback !== "string" || /[<>]/.test(o.feedback))) err(`${ow}: feedback bez HTML`);
    });
  }
  if (!N[c.start]) continue;
  // Osiągalność, pętle, dojście do końca.
  const edges = (id) => (N[id] && !("end" in N[id]) && Array.isArray(N[id].options) ? N[id].options.filter((o) => o && "next" in o && N[o.next]).map((o) => o.next) : []);
  const state = {}; // 1 – w trakcie, 2 – gotowe
  let cycle = false;
  const dfs = (id) => { state[id] = 1; for (const t of edges(id)) { if (state[t] === 1) cycle = true; else if (!state[t]) dfs(t); } state[id] = 2; };
  dfs(c.start);
  if (cycle) err("graf ma pętlę – rozmowa musi zawsze iść do przodu");
  const unreachable = Object.keys(N).filter((id) => !state[id]);
  if (unreachable.length) err(`węzły nieosiągalne ze start: ${unreachable.join(", ")}`);
  if (!cycle) {
    const canEnd = {};
    const ends = (id) => (id in canEnd ? canEnd[id] : (canEnd[id] = "end" in N[id] || edges(id).some(ends)));
    Object.keys(state).forEach((id) => { if (!ends(id)) err(`węzeł ${id}: nie da się z niego dojść do końca rozmowy`); });
    // Ścieżki samych dobrych odpowiedzi: zawsze kończą się „ok”, 5–8 wyborów.
    const lens = [];
    const walk = (id, steps) => {
      const n = N[id];
      if ("end" in n) { if (n.end !== "ok") err(`same dobre odpowiedzi prowadzą do końca „fail” (węzeł ${id})`); lens.push(steps); return; }
      (n.options || []).filter((o) => o && o.ok && N[o.next]).forEach((o) => walk(o.next, steps + 1));
    };
    walk(c.start, 0);
    if (lens.length && (Math.min(...lens) < 5 || Math.max(...lens) > 8)) err(`ścieżka dobrych odpowiedzi ma ${Math.min(...lens)}–${Math.max(...lens)} kroków (ma być 5–8)`);
  }
}

// ---------- aktualność data/bundle.js, index.html i sw.js (strona ładuje tylko bundle) ----------
// Ostrzeżenie, nie błąd: porównujemy treść, a nie daty plików (git ich nie zachowuje); końce linii (LF / CRLF)
// bez znaczenia. Ten sam warunek jako błąd: npm run check (tools/check.js).
try {
  const build = require("./build-index.js");
  const lf = (s) => s.replace(/\r\n/g, "\n");
  const { content } = build.buildBundle();
  const bundlePath = path.join(ROOT, build.BUNDLE);
  const current = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, "utf8") : "";
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const newHtml = build.buildIndex(content);
  if (lf(current) !== lf(content) || lf(html) !== lf(newHtml))
    console.log("UWAGA: data/bundle.js albo index.html są nieaktualne – strona pokaże stare dane. Uruchom: npm run build");
  else if (lf(fs.readFileSync(path.join(ROOT, build.SW), "utf8")) !== lf(build.buildSw(newHtml).content))
    console.log("UWAGA: sw.js jest nieaktualny – zainstalowana strona (offline) nie dostanie nowej wersji. Uruchom: npm run build");
} catch (e) {
  console.log("UWAGA: nie udało się sprawdzić data/bundle.js: " + e.message);
}

if (errors.length) {
  console.log(`BŁĘDY (${errors.length}):\n` + errors.slice(0, 300).map((e) => " - " + e).join("\n") + (errors.length > 300 ? `\n … i ${errors.length - 300} więcej` : ""));
  process.exit(1);
}
console.log(`OK: ${lessons.length} lekcji, ${RD.length} czytanek (${rdQuestions} pytań), ${DL.length} dialogów (${dlLines} kwestii, ${dlQuestions} pytań), ${CH.length} rozmów (${chNodes} węzłów, ${chOptions} odpowiedzi), ${exampleTotal} przykładów, ${exTotal} zadań w sprawdzianach, ${practiceTotal} zadań w zestawach, ${testTotal} zadań testowych, ${lessonVocab} słówek w lekcjach, ${V.length} działów słownictwa (${words} słówek).`);

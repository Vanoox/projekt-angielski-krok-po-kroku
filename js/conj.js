// Odmiana czasownika – logika (tabele form, budowanie zdań, zadania odm~… do „Moich błędów”, hasTask).
// Widok #/odmiana – views/conjugation.js; z tabel korzystają też oś czasów i czytanki.
import { stripTags, esc } from "./util.js";
import { SP_LL } from "./spelling.js";
import { firstVariant, normalize } from "./check.js";
import { speakBtn } from "./ui.js";
import { PATH, BY_ID, lessonNo, TASKS, KEY_OF, DECKS } from "./data.js";

// ---------- Odmiana czasownika (#/odmiana) ----------
// Formy: nieregularne z tabel lekcji irregular-verbs (Bezokolicznik | Past Simple | Past Participle, tabela przedrostków
// i par do pomylenia), regularne według reguł pisowni (-s/-es/-ies, -ed/-ied z podwajaniem, -ing). Czasowniki stanu
// z tabeli lekcji present-simple-vs-continuous. Tabela 13 czasów dla wybranej osoby i ćwiczenie „podaj formę”.
/** @typedef {{ past: string[], pp: string[], ppUS: string[] }} IrrForms */
/**
 * @typedef {{ irr: Map<string, IrrForms>, notes: Map<string, string[]>, stative: Map<string, "amb" | "strict">,
 *   stLesson: Lesson | undefined }} CjTables
 */
/** @typedef {{ verb: string, base: string, rest: string, s3: string, ing: string, past: string[], pp: string[], ppUS: string[], irr: boolean }} CjForms */
/**
 * @typedef {{ id: string, name: string, lesson: string, aux: string[], v: string, sub?: string, cont?: boolean, use?: string }} CjTense
 */
/** @type {CjTables | null} */
let cjData = null;
/** @returns {CjTables} */
export function cjTables() {
  if (cjData) return cjData;
  /** @type {CjTables["irr"]} */
  const irr = new Map();
  /** @type {CjTables["notes"]} */
  const notes = new Map();
  /** @type {CjTables["stative"]} */
  const stative = new Map();
  // „burnt / burned” → ["burnt", "burned"]; „got (US: gotten)” → ["got"] + us: ["gotten"].
  /** @param {string} c */
  const alts = (c) => stripTags(c).toLowerCase().replace(/\([^)]*\)/g, " ").split(/\s*\/\s*/).map((x) => x.trim()).filter((x) => /^[a-z]+$/.test(x));
  /** @param {string} c */
  const us = (c) => { const m = stripTags(c).match(/\((?:US|AmE):\s*([a-z /]+)\)/i); return m ? alts(m[1]) : []; };
  /** @param {string} base @param {string[]} past @param {string[]} pp @param {string[]} [ppUS] */
  const add = (base, past, pp, ppUS) => { if (/^[a-z]+$/.test(base) && past.length && pp.length && !irr.has(base)) irr.set(base, { past, pp, ppUS: ppUS || [] }); };
  const l = BY_ID["irregular-verbs"];
  (l ? l.sections : []).filter((s) => s.type === "table").forEach((s) => {
    const h = (s.headers || []).map(stripTags);
    /** @type {string[][]} */
    const rows = s.rows || [];
    if (h[0] === "Bezokolicznik" && h[1] === "Past Simple") rows.forEach((r) => add(stripTags(r[0]).toLowerCase(), alts(r[1]), alts(r[2]), us(r[2])));
    else if (h[1] === "Z przedrostkiem") rows.forEach((r) => { // „do – did – done” | „undo (cofnąć), redo” → undid/undone, redid/redone
      const f = stripTags(r[0]).toLowerCase().split(/\s+[–-]\s+/);
      if (f.length !== 3 || !/^[a-z]+$/.test(f[0])) return;
      stripTags(r[1]).toLowerCase().replace(/\([^)]*\)/g, " ").split(",").map((x) => x.trim()).forEach((b) => {
        if (!b.endsWith(f[0]) || b === f[0]) return;
        const pre = b.slice(0, -f[0].length);
        add(b, alts(f[1]).map((x) => pre + x), alts(f[2]).map((x) => pre + x));
      });
    });
    else if (h[1] === "BrE") rows.forEach((r) => { // spell – spelt / spelled (formy BrE, gdy różnią się od regularnej)
      const base = stripTags(r[0]).toLowerCase(), f = alts(r[1]);
      if (!/–/.test(stripTags(r[1])) && f.some((x) => x !== cjEd(base))) add(base, f, f);
    });
    else if (/^Pary/.test(stripTags(s.title || ""))) rows.forEach((r) => { // ten sam bezokolicznik w kilku wierszach → uwaga (lie – lay / lie – lied)
      const base = stripTags(r[0]).toLowerCase(), f = stripTags(r[1]);
      if (!/^[a-z]+$/.test(base) || !/^[a-z]+ – /.test(f)) return;
      const ff = f.toLowerCase().split(/\s+–\s+/);
      if (ff.length === 3 && ff[1] !== cjEd(base)) add(base, alts(ff[1]), alts(ff[2])); // pierwsze znaczenie: lie – lay – lain
      let ns = notes.get(base);
      if (!ns) notes.set(base, (ns = []));
      ns.push(`${f} = ${stripTags(r[2]).replace(/:.*$/, "")}`);
    });
  });
  [...notes].forEach(([b, xs]) => { if (xs.length < 2) notes.delete(b); });
  CJ_IRR_MORE.split(", ").forEach((x) => { const [b, p, pp] = x.split(" "); add(b, p.split("/"), pp.split("/")); });
  // Czasowniki stanu: „have (= posiadać)” i grupa „Zmysły (mimowolnie)” – tylko w jednym znaczeniu (amb), reszta – zawsze (strict).
  const sv = BY_ID["present-simple-vs-continuous"];
  const st = sv && sv.sections.find((s) => s.type === "table" && /stanu/.test(s.title || "") && stripTags((s.headers || [])[1]) === "Czasowniki");
  (st && st.rows || []).forEach((/** @type {string[]} */ r) => stripTags(r[1]).split(",").forEach((x) => {
    const w = x.replace(/\([^)]*\)/g, "").trim().toLowerCase();
    if (/^[a-z]+( [a-z]+)?$/.test(w)) stative.set(w, /\(/.test(x) || /\(/.test(stripTags(r[0])) ? "amb" : "strict");
    if (w === "realise" || w === "recognise") stative.set(w.replace(/ise$/, "ize"), /** @type {"amb" | "strict"} */ (stative.get(w)));
  }));
  return (cjData = { irr, notes, stative, stLesson: sv });
}
// Nieregularne spoza tabel lekcji (słówka z działów i czasowniki, które uczeń może wpisać): bezokolicznik II III.
const CJ_IRR_MORE = "shine shone shone, sweep swept swept, forbid forbade forbidden, unwind unwound unwound, reset reset reset, withdraw withdrew withdrawn, " +
  "broadcast broadcast broadcast, cast cast cast, offset offset offset, undergo underwent undergone, oversee oversaw overseen, bear bore borne, " +
  "spill spilt/spilled spilt/spilled, spoil spoilt/spoiled spoilt/spoiled, lean leant/leaned leant/leaned, leap leapt/leaped leapt/leaped, " +
  "kneel knelt/kneeled knelt/kneeled, dwell dwelt/dwelled dwelt/dwelled, arise arose arisen, awake awoke awoken, bleed bled bled, breed bred bred, " +
  "bind bound bound, cling clung clung, creep crept crept, flee fled fled, fling flung flung, forecast forecast forecast, foresee foresaw foreseen, " +
  "grind ground ground, mislead misled misled, misunderstand misunderstood misunderstood, overtake overtook overtaken, overhear overheard overheard, " +
  "sew sewed sewn/sewed, sow sowed sown/sowed, mow mowed mown/mowed, swell swelled swollen/swelled, shed shed shed, shrink shrank shrunk, slide slid slid, " +
  "speed sped sped, spin spun spun, spit spat spat, spring sprang sprung, sting stung stung, stink stank stunk, strike struck struck, swear swore sworn, " +
  "swing swung swung, tread trod trodden, weave wove woven, weep wept wept, wind wound wound, wring wrung wrung, bid bid bid, slit slit slit, " +
  "input input input, outdo outdid outdone, overdo overdid overdone, overeat overate overeaten, rebuild rebuilt rebuilt, retell retold retold, " +
  "rethink rethought rethought, withhold withheld withheld, withstand withstood withstood, outgrow outgrew outgrown, override overrode overridden, " +
  "babysit babysat babysat, stride strode stridden, strive strove striven, string strung strung, thrust thrust thrust, slay slew slain";
const CJ_SP_LL = new Set(SP_LL.split(" ")); // travel → travelled (BrE; AmE traveled przyjmuje spellFold)
const CJ_DOUBLE = new Set("prefer refer admit occur permit regret control commit omit submit transfer equip patrol compel expel propel rebel deter incur confer kidnap worship emit transmit forget begin upset reset offset forbid input babysit".split(" "));
/** @param {string} w */
const cjSyll = (w) => (w.replace(/e$/, "").match(/[aeiouy]+/g) || []).length;
// Podwajanie ostatniej spółgłoski: stop → stopped, plan → planning, prefer → preferred, travel → travelled; visit → visited.
/** @param {string} w */
function cjDoubles(w) {
  if (/[wxy]$/.test(w)) return false;
  if (CJ_DOUBLE.has(w) || CJ_SP_LL.has(w)) return true;
  return cjSyll(w) === 1 && (/(^|[^aeiou])[aeiou][b-df-hj-np-tvz]$/.test(w) || /qu[aeiou][b-df-hj-np-tvz]$/.test(w));
}
/** @param {string} w */
const cjS = (w) => w === "have" ? "has" : /(s|x|z|ch|sh|o)$/.test(w) ? w + "es" : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + "ies" : w + "s";
/** @param {string} w */
function cjIng(w) {
  if (/ie$/.test(w)) return w.slice(0, -2) + "ying"; // lie → lying
  if (/[^aeioy]e$/.test(w) && w !== "be") return w.slice(0, -1) + "ing"; // make → making (ale see → seeing, dye → dyeing)
  if (/[^aeiou]ic$/.test(w) && cjSyll(w) > 1) return w + "king"; // panic → panicking
  return cjDoubles(w) ? w + w.slice(-1) + "ing" : w + "ing";
}
/** @param {string} w */
function cjEd(w) {
  if (/e$/.test(w)) return w + "d";
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ied";
  if (/[^aeiou]ic$/.test(w) && cjSyll(w) > 1) return w + "ked";
  return cjDoubles(w) ? w + w.slice(-1) + "ed" : w + "ed";
}
/** @param {unknown} s */
export const cjClean = (s) => String(s || "").toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim().replace(/^to /, "");
export const CJ_VALID = /^[a-z]+( [a-z']+){0,4}$/;
// { verb, base, rest, s3, ing, past: [...], pp: [...], ppUS: [...], irr } – rest = reszta wyrażenia („wake up” → „up”).
/** @param {string} verb @returns {CjForms} */
export function cjForms(verb) {
  const v = cjClean(verb), [base, ...r] = v.split(" ");
  const irr = cjTables().irr.get(base);
  return { verb: v, base, rest: r.join(" "), s3: base === "be" ? "is" : cjS(base), ing: cjIng(base),
    past: irr ? irr.past : [cjEd(base)], pp: irr ? irr.pp : [cjEd(base)], ppUS: irr ? irr.ppUS : [], irr: !!irr };
}
// Czasownik stanu: "strict" (know, want…), "amb" (have, see, feel… – tylko w jednym znaczeniu) albo "".
/** @param {CjForms} f @returns {"amb" | "strict" | ""} */
export function cjStative(f) {
  const st = cjTables().stative;
  const v = st.get(f.verb);
  if (v) return v;
  return (!f.rest || /^(to|of|about|on|in|with|for|like|from|at)$/.test(f.rest)) && st.get(f.base) || "";
}
// Czasy: aux = słowa przed czasownikiem (BE/WAS/HAVE zależą od osoby), v = forma czasownika, sub = „do” w przeczeniach
// i pytaniach (Present / Past Simple). Opis z tabeli zbiorczej lekcji tenses-overview.
/** @type {CjTense[]} */
export const CJ_TENSES = [
  { id: "ps", name: "Present Simple", lesson: "present-simple", aux: [], v: "s", sub: "do" },
  { id: "pc", name: "Present Continuous", lesson: "present-continuous", aux: ["BE"], v: "ing", cont: true },
  { id: "pas", name: "Past Simple", lesson: "past-simple", aux: [], v: "past", sub: "did" },
  { id: "pac", name: "Past Continuous", lesson: "past-continuous", aux: ["WAS"], v: "ing", cont: true },
  { id: "pp", name: "Present Perfect", lesson: "present-perfect", aux: ["HAVE"], v: "pp" },
  { id: "ppc", name: "Present Perfect Continuous", lesson: "present-perfect-continuous", aux: ["HAVE", "been"], v: "ing", cont: true },
  { id: "pap", name: "Past Perfect", lesson: "past-perfect", aux: ["had"], v: "pp" },
  { id: "papc", name: "Past Perfect Continuous", lesson: "past-perfect-continuous", aux: ["had", "been"], v: "ing", cont: true },
  { id: "fs", name: "Future Simple", lesson: "future-will", aux: ["will"], v: "base" },
  { id: "gt", name: "be going to", lesson: "going-to", aux: ["BE", "going", "to"], v: "base", use: "zamiar, plan; przewidywanie na podstawie tego, co widać" },
  { id: "fc", name: "Future Continuous", lesson: "future-continuous", aux: ["will", "be"], v: "ing", cont: true },
  { id: "fp", name: "Future Perfect", lesson: "future-perfect", aux: ["will", "have"], v: "pp" },
  { id: "fpc", name: "Future Perfect Continuous", lesson: "future-perfect", aux: ["will", "have", "been"], v: "ing", cont: true },
].filter((t) => BY_ID[t.lesson]);
export const CJ_BY_ID = Object.fromEntries(CJ_TENSES.map((t) => [t.id, t]));
(() => {
  const ov = BY_ID["tenses-overview"], tb = ov && ov.sections.find((s) => s.type === "table" && /12 czasów/.test(s.title || ""));
  (tb && tb.rows || []).forEach((/** @type {string[]} */ r) => { const t = CJ_TENSES.find((x) => x.name === stripTags(r[0])); if (t && !t.use) t.use = stripTags(r[2]); });
})();
export const CJ_PERSONS = ["I", "you", "he", "she", "it", "we", "they"];
/** @typedef {"aff" | "neg" | "q"} CjForm */
/** @type {Record<string, string>} CjForm → nazwa */
export const CJ_FORMS = { aff: "twierdzenie", neg: "przeczenie", q: "pytanie" };
/** @type {Dict<string>} */
const CJ_NEG = { is: "isn't", are: "aren't", was: "wasn't", were: "weren't", do: "don't", does: "doesn't", did: "didn't", have: "haven't", has: "hasn't", had: "hadn't", will: "won't" };
/** @type {Dict<string>} */
const CJ_SHORT = { am: "'m", is: "'s", are: "'re", have: "'ve", has: "'s", had: "'d", will: "'ll" };
/** @type {Dict<[string, string]>} */
const CJ_REFL = { I: ["my", "myself"], you: ["your", "yourself"], he: ["his", "himself"], she: ["her", "herself"], it: ["its", "itself"], we: ["our", "ourselves"], they: ["their", "themselves"] };
/** @param {string} s */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// Jedna forma: { main, alts: [inne poprawne zapisy do pokazania], vps: [warianty bez podmiotu – odpowiedzi w ćwiczeniu] }.
/**
 * @param {CjForms} f @param {CjTense} t @param {string} p osoba (CJ_PERSONS) @param {string} form CjForm
 * @returns {{ main: string, alts: string[], vps: string[] }}
 */
export function cjBuild(f, t, p, form) {
  const third = p === "he" || p === "she" || p === "it", plural = p === "you" || p === "we" || p === "they";
  const be = p === "I" ? "am" : third ? "is" : "are", was = plural ? "were" : "was";
  const rest = f.rest.replace(/\byourself\b/g, CJ_REFL[p][1]).replace(/\byour\b/g, CJ_REFL[p][0]);
  const isBe = f.base === "be";
  let aux = t.aux.map((a) => a === "BE" ? be : a === "WAS" ? was : a === "HAVE" ? (third ? "has" : "have") : a);
  /** @type {string[]} */
  let vs; // warianty formy czasownika
  if (t.v === "s") vs = [isBe ? be : third ? f.s3 : f.base];
  else if (t.v === "past") vs = isBe ? [was] : f.past;
  else if (t.v === "pp") vs = f.pp.concat(f.ppUS);
  else if (t.v === "ing") vs = [f.ing];
  else vs = [f.base];
  // be w Present / Past Simple: am/is/are, was/were bez „do”.
  if (isBe && t.sub) { aux = [vs[0]]; vs = [""]; }
  else if (t.sub && form !== "aff") { aux = [t.sub === "did" ? "did" : third ? "does" : "do"]; vs = [f.base]; }
  /** @param {string} v */
  const tail = (v) => [v, rest].filter(Boolean).join(" ");
  /** @param {...string} xs */
  const join = (...xs) => xs.filter(Boolean).join(" ");
  const shown = vs.slice(0, 1).concat(f.ppUS.length && t.v === "pp" ? [] : vs.slice(1)); // gotten (AmE) tylko w odpowiedziach
  if (form === "q") {
    const qs = vs.map((v) => cap(join(aux[0], p, ...aux.slice(1), tail(v))) + "?");
    return { main: qs[0], alts: qs.slice(1, shown.length), vps: qs.map((q) => q.slice(0, -1)) };
  }
  if (form === "neg") {
    const a0 = aux[0], more = aux.slice(1);
    /** @param {string} v */
    const shortNeg = (v) => a0 === "am" ? join("I'm not", ...more, tail(v)) : join(p, CJ_NEG[a0], ...more, tail(v));
    /** @param {string} v */
    const full = (v) => join(p, a0, "not", ...more, tail(v));
    const vps = vs.map((v) => a0 === "am" ? join("am not", ...more, tail(v)) : join(CJ_NEG[a0], ...more, tail(v))); // matches() zna też „has not”
    return { main: shortNeg(vs[0]), alts: [full(vs[0])].concat(shown.slice(1).map(shortNeg)), vps };
  }
  /** @param {string} v */
  const full = (v) => join(p, ...aux, tail(v));
  const sh = aux.length && CJ_SHORT[aux[0]] ? (/** @type {string} */ v) => join(p + CJ_SHORT[aux[0]], ...aux.slice(1), tail(v)) : null;
  const vps = vs.map((v) => join(...aux, tail(v)));
  return { main: full(vs[0]), alts: (sh ? [sh(vs[0])] : []).concat(shown.slice(1).map(full)), vps };
}
// Czasowniki ze słówek: „eat / drink” = „jeść / pić” rozbite na dwa. Czasownik = polski odpowiednik zaczyna się od
// bezokolicznika (-ać, -eć, -ić, -yć, -uć, -ąć, -ść; móc, biec…). Talie lekcji – wszystko; działy tematyczne – do 3 słów.
export const CJ_PL_INF = /^[a-ząćęłńóśźż]+(ać|eć|ić|yć|uć|ąć|ść|źć)$|^(móc|pomóc|biec|piec|upiec|strzec)$/;
const CJ_PL_NOUN = /(ość|ęść|paznokieć|powieść|postać|maść|liść|przepaść|chłopiec)$/;
const CJ_NOT_VERB = /^(can|could|may|might|must|shall|should|will|would|ought|boiler|oven|stove|cooker)\b/; // modalne; rzeczowniki „piec”
/** @typedef {{ verb: string, pl: string, lesson: number }} CjVerb lesson – indeks lekcji na ścieżce (Infinity – tylko w działach) */
/** @type {Map<string, CjVerb> | null} */
let cjVerbList = null;
/** @returns {Map<string, CjVerb>} */
export function cjVerbs() {
  if (cjVerbList) return cjVerbList;
  /** @type {Map<string, CjVerb>} */
  const map = new Map();
  DECKS.forEach((d) => !d.manual && d.items.forEach((w) => {
    const en = stripTags(w.en), pl = stripTags(w.pl || "").split(";")[0].trim();
    const es = en.split(/\s*\/\s*/), ps = pl.split(/\s*\/\s*/);
    if (es.length > 1 && es.length !== ps.length) return;
    es.forEach((e, i) => {
      const v = e.trim(), p = (ps[i] || ps[0]).trim(), first = p.split(/[\s,(]/)[0];
      if (!/^[a-z][a-z' ]*$/.test(v) || CJ_NOT_VERB.test(v) || /^(be|have been|have gone) ./.test(v) || /\b(sb|sth|one's|oneself)\b/.test(v)) return;
      if (!CJ_PL_INF.test(first) || CJ_PL_NOUN.test(first)) return;
      if (!d.lesson && v.split(" ").length > 3) return;
      const x = map.get(v);
      if (!x) map.set(v, { verb: v, pl: p, lesson: d.lesson ? PATH.indexOf(d.lesson) : Infinity });
      else if (d.lesson) x.lesson = Math.min(x.lesson, PATH.indexOf(d.lesson));
    });
  }));
  return (cjVerbList = map);
}
// Ćwiczenie: czasowniki, które uczeń już zna – ze słówek lekcji do bieżącej albo (podstawowe czasowniki z działów,
// np. go, do, watch) użyte jako czasownik w zdaniach z tych lekcji (po to / can / don't / I / you…, he + -s, be + -ing).
/** @type {Map<string, number> | null} */
let cjIntroMap = null;
/** Czasownik → indeks lekcji, od której jest w ćwiczeniu. @returns {Map<string, number>} */
export function cjIntro() {
  if (cjIntroMap) return cjIntroMap;
  /** @type {Map<string, number>} */
  const first = new Map();
  const V = cjVerbs(), texts = PATH.map(() => /** @type {string[]} */ ([]));
  for (const { ex, lesson, src } of TASKS.values()) if (src !== "r" && src !== "g" && ex.type !== "choice" && ex.type !== "finderr") (ex.answers || []).flat().slice(0, 2).forEach((a) => texts[PATH.indexOf(lesson)].push(firstVariant(a)));
  PATH.forEach((l, i) => l.sections.filter((s) => s.type === "examples").forEach((s) => (s.items || []).forEach((/** @type {ExampleItem} */ x) => texts[i].push(stripTags(x.en)))));
  const single = [...V.values()].filter((x) => x.lesson === Infinity && !/ /.test(x.verb));
  /** @type {Map<string, string>} */
  const want = new Map(); // forma → czasownik
  single.forEach((x) => { const f = cjForms(x.verb); want.set("B " + f.base, x.verb); want.set("S " + f.s3, x.verb); want.set("G " + f.ing, x.verb); });
  texts.forEach((ts, i) => ts.forEach((s) => {
    const t = normalize(s).split(" ");
    t.forEach((w, k) => {
      const p = t[k - 1] || "";
      const hit = (/^(to|can|can't|cannot|will|won't|don't|doesn't|didn't|do|does|did|let's|must|should|i|you|we|they)$/.test(p) && want.get("B " + w))
        || (/^(he|she|it)$/.test(p) && want.get("S " + w)) || (/^(am|is|are|was|were|i'm|you're|he's|she's|it's|we're|they're|been)$/.test(p) && want.get("G " + w));
      if (hit && !first.has(hit)) first.set(hit, i);
    });
  }));
  cjIntroMap = new Map([...V.values()].map((x) => [x.verb, Math.min(x.lesson, first.get(x.verb) ?? Infinity)]));
  return cjIntroMap;
}
// Ćwiczenie: tylko czasowniki, które brzmią naturalnie z każdą osobą i bez dopełnienia – czynności (work, cook…) i wyrażenia
// z dopełnieniem ze słówek (have breakfast, play the guitar). Dostępne od lekcji, w której pojawiają się w słówkach / zdaniach
// (cjIntro). Jednorazowe (arrive, wake up…) – bez czasów Perfect Continuous („she had been arriving” brzmi dziwnie).
export const CJ_DRILL_ACT = new Set(("work|study|teach|cook|read|write|play|drive|swim|run|sleep|sing|dance|travel|relax|walk|laugh|cry|talk|chat|cycle|" +
  "exercise|ski|paint|climb|shout|learn|eat|drink|smoke|clean|wash|hurry|worry|concentrate|complain|celebrate|vacuum|tidy|have breakfast|" +
  "have a shower|have a break|do the shopping|eat out|tidy up|ride a bike|play the guitar|play the piano|go jogging|go hiking|go to work|" +
  "stay up late|go out|lose weight").split("|"));
export const CJ_DRILL_PUNCT = new Set(("get up|wake up|go to bed|get up early|fall asleep|get dressed|get home|arrive|move house|get married|get engaged|" +
  "make a decision|win the lottery|get lost|get back|split up|grow up|give up|find out|vote|retire|graduate").split("|"));
export const CJ_PERF_CONT = new Set(["ppc", "papc", "fpc"]);
/** @param {CjTense} t */
export const cjLockedIdx = (t) => PATH.indexOf(BY_ID[t.lesson]);
// Moje błędy: klucz odm~czasownik~czas~osoba~forma – zadanie odtwarzane z generatora (stabilne, dopóki czasownik
// jest w słówkach i czas w CJ_TENSES). Lekcja zadania = lekcja czasu.
/** @param {string} key @returns {TaskRef | null} */
export function cjTask(key) {
  const known = TASKS.get(key);
  if (known) return known;
  const [pre, verbEnc, tid, p, form] = key.split("~");
  const t = CJ_BY_ID[tid], verb = decodeURIComponent(verbEnc || "");
  if (pre !== "odm" || !t || !CJ_PERSONS.includes(p) || !CJ_FORMS[form] || !cjVerbs().has(verb)) return null;
  const f = cjForms(verb), b = cjBuild(f, t, p, form), lesson = BY_ID[t.lesson];
  const subj = p === "I" ? "I" : cap(p);
  /** @type {Exercise} */
  const ex = form === "q"
    ? { type: "gap", q: `___? (${esc(p)} / ${esc(verb)})`, answers: b.vps }
    : { type: "gap", q: `${subj} ___ (${esc(verb)}).`, answers: b.vps };
  ex.task = `<b>${esc(t.name)}</b> · ${CJ_FORMS[form]}`;
  const sentence = form === "q" ? b.main : cap(b.main) + ".";
  // Całe zdanie z podmiotem (w pytaniu odpowiedź już jest całym zdaniem – wtedy tylko głośnik).
  ex.explain = `<span class="cj-ans">${form === "q" ? "" : esc(sentence) + " "}${speakBtn(sentence)}</span> <a href="#/lesson/${lesson.id}">${esc(t.name)} – lekcja ${lessonNo(lesson)}</a>`;
  const rec = { ex, lesson, src: "o", instr: "" };
  TASKS.set(key, rec); KEY_OF.set(ex, key);
  return rec;
}
/** Czy klucz z „Moich błędów” ma zadanie (rejestr TASKS albo trener odmiany). @param {string} k */
export function hasTask(k) { return TASKS.has(k) || (k.startsWith("odm~") && !!cjTask(k)); }

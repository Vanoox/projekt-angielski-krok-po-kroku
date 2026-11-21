// Typowe błędy – tylko opis błędnej odpowiedzi, ocena się nie zmienia (moduł bez DOM; testy: tests/errors.test.mjs).
import { esc, stripTags } from "./util.js";
import { normalize, tokenVariants, variants, expandAnswer, lcs } from "./check.js";
import { spellFold } from "./spelling.js";

// Odpowiedź porównujemy z najbliższym wzorcem (skróty rozwinięte do pełnych form) i nazywamy różnice.
// Heurystyka: przy wątpliwościach „other” (bez etykiety) – lepiej nic nie napisać niż napisać źle.
/** @typedef {{ label: string, tip: string, lesson?: string }} ErrInfo */
/** @typedef {{ known: Set<string>, names: Set<string>, verbs: Set<string>, nouns: Set<string>, irr: Map<string, string> }} ErrDict */
/** @type {Dict<ErrInfo>} */
export const ERR_INFO = {
  s3: { label: "Końcówka -s w 3. osobie", tip: "Po he / she / it czasownik ma -s (she works), ale po does / doesn't / did i po can, will, must już nie (Does she work? She can swim).", lesson: "present-simple" },
  plural: { label: "Liczba mnoga", tip: "Po two, three, many, these, those rzeczownik ma końcówkę -s (two books, these cars), po a / one / this – nie.", lesson: "plural-nouns" },
  ends: { label: "Końcówka -s", tip: "Sprawdź końcówkę -s: czasownik po he / she / it (she works) albo rzeczownik w liczbie mnogiej (two books)." },
  article: { label: "Przedimek a / an / the", tip: "a / an – jedna rzecz, o której mówisz pierwszy raz (an przed samogłoską w wymowie: an apple); the – konkretna, znana już rzecz.", lesson: "articles-basics" },
  aux: { label: "Czasownik posiłkowy", tip: "do / does / did, am / is / are, was / were, have / has muszą pasować do osoby (he does, they do) i do czasu." },
  irr: { label: "Forma czasownika nieregularnego", tip: "Sprawdź, której z trzech form potrzeba: go – went (Past Simple) – gone (po have / has).", lesson: "irregular-verbs" },
  verb: { label: "Forma czasownika", tip: "Sprawdź końcówkę czasownika: -ing (is working), -ed (worked) albo forma podstawowa (can work, didn't work)." },
  prep: { label: "Przyimek", tip: "Przyimki często nie pasują 1:1 do polskich (in / on / at, to / for) – ucz się ich razem z całym wyrażeniem." },
  order: { label: "Szyk wyrazów", tip: "Te same słowa, inna kolejność. W zdaniu: podmiot – czasownik – reszta; w pytaniu czasownik posiłkowy przed podmiotem (Do you…? Is she…?).", lesson: "word-order" },
  typo: { label: "Literówka", tip: "Słowo jest prawie dobre – sprawdź pisownię." },
  missing: { label: "Brakujące słowo", tip: "W zdaniu brakuje wyrazu – porównaj je z poprawną wersją." },
  extra: { label: "Zbędne słowo", tip: "W zdaniu jest wyraz, którego nie powinno być." },
};
export const ERR_KEYS = Object.keys(ERR_INFO);
/** @param {string} s @returns {Set<string | undefined>} (has() przyjmuje też undefined – sąsiednie słowo poza zdaniem) */
const errSet = (s) => new Set(s.split(" "));
const ERR_ART = errSet("a an the");
const ERR_AUX = errSet("do does did am is are was were have has had be been being will would don't doesn't didn't isn't aren't wasn't weren't haven't hasn't hadn't won't wouldn't");
const ERR_PREP = errSet("in on at for from of with by about into onto under over since during until till after before through across between among towards toward behind near above below without inside outside around along");
const ERR_SUBJ3 = errSet("he she it who which this that everyone someone anyone one everything something anything nothing");
const ERR_BASE = errSet("do does did not can could will would should must might may shall to let's let don't doesn't didn't can't cannot couldn't won't wouldn't shouldn't mustn't");
const ERR_PL = errSet("two three four five six seven eight nine ten eleven twelve twenty thirty hundred thousand many some these those few several both all of various");
const ERR_SG = errSet("a an one this that every each another");
const ERR_DET = errSet("my your his her its our their the this that");
const ERR_ADV = errSet("always usually often sometimes never rarely seldom also only just really still hardly ever generally normally even already not");
// Słowniki z danych: wszystkie słowa z odpowiedzi, imiona, formy nieregularne, słowa występujące jako czasownik
// (po he/she/it z -s, po can/don't…) i jako rzeczownik (po a/the/two…). exs – wszystkie zadania kursu (obiekty ex),
// irrL – lekcja z tabelą czasowników nieregularnych (BY_ID["irregular-verbs"]). Budowa trwa ok. 0,3 s – app.js robi to
// raz (errDicts()) i podaje wynik jako D do errClassify.
/** @param {Iterable<Exercise>} exs @param {Lesson | undefined} irrL @returns {ErrDict} */
export function buildErrDict(exs, irrL) {
  const known = new Set(), names = new Set(), lower = new Set(), verbs = new Set(), nouns = new Set(), irr = new Map();
  (irrL ? irrL.sections : []).filter((s) => s.type === "table" && /^Bezokolicznik/.test((s.headers || [])[0] || "")).forEach((s) => (s.rows || []).forEach((/** @type {string[]} */ r) => {
    const base = stripTags(r[0]).toLowerCase();
    if (!/^[a-z]+$/.test(base)) return;
    r.slice(0, 3).forEach((c) => stripTags(c).toLowerCase().split(/[^a-z]+/).forEach((f) => { if (f && f !== "us" && f !== base) irr.set(f, base); }));
  }));
  /** @param {string} w */
  const sing = (w) => /ies$/.test(w) ? w.slice(0, -3) + "y" : /(ch|sh|ss|x|o)es$/.test(w) ? w.slice(0, -2) : w.slice(0, -1);
  for (const ex of exs) {
    const ans = ex.type === "choice" ? [] : (ex.answers || []).flat();
    for (const a of ans) {
      const all = String(a).replace(/[{}()|]/g, " ");
      // Imiona i nazwy: wielka litera w środku zdania i nigdzie małą (odrzuca „– Are you…?” w dialogach).
      all.split(/\s+/).forEach((w, i) => { const c = w.replace(/[^\w']/g, ""); if (/^[a-z]/.test(c)) lower.add(c); else if (i && /^[A-Z][a-z]+$/.test(c)) names.add(c.toLowerCase()); });
      normalize(all).split(" ").forEach((w) => tokenVariants(w).forEach((v) => v.split(" ").forEach((x) => known.add(x))));
      let first = String(a).replace(/[()]/g, "");
      while (/\{[^{}]*\}/.test(first)) first = first.replace(/\{([^{}|]*)[^{}]*\}/g, "$1");
      const t = /** @type {string} */ ([...variants(first)].pop()).split(" ");
      t.forEach((w, i) => {
        const p = t[i - 1];
        if (ERR_BASE.has(p) && p !== "to" && p !== "not") verbs.add(w);
        if ((p === "he" || p === "she" || p === "it") && /s$/.test(w)) verbs.add(sing(w));
        if (ERR_ART.has(p)) nouns.add(w);
        if (ERR_PL.has(p) && p !== "of" && p !== "all" && /s$/.test(w)) nouns.add(sing(w));
      });
    }
  }
  lower.forEach((w) => names.delete(w));
  return { known, names, verbs, nouns, irr };
}
/** @param {string} b */
const errSForms = (b) => [b + "s", b + "es", /[^aeiou]y$/.test(b) ? b.slice(0, -1) + "ies" : "-"];
/** @param {string} w @param {ErrDict} D @returns {Set<string>} */
const errStems = (w, D) => {
  const out = new Set([w]);
  for (const suf of ["ing", "ies", "ied", "es", "ed", "s", "d"]) {
    if (!w.endsWith(suf) || w.length < suf.length + 2) continue;
    const s = w.slice(0, -suf.length);
    out.add(s); out.add(s + "e");
    if (suf === "ies" || suf === "ied") out.add(s + "y");
    if (/([^aeiou])\1$/.test(s)) out.add(s.slice(0, -1));
  }
  const irr = D.irr;
  [...out].forEach((s) => { const b = irr.get(s); if (b !== undefined) out.add(b); });
  return out;
};
/** Odległość edycyjna (zamiana sąsiednich liter liczy się jako jeden błąd). @param {string} a @param {string} b @returns {number} */
function errDist(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
/** Brak / nadmiar -s: base – forma bez -s, missingS – uczeń pominął -s, ctx – wcześniejsze słowa wzorca. @param {string} base @param {boolean} missingS @param {string[]} ctx @param {ErrDict} D @returns {string} */
function errEndS(base, missingS, ctx, D) {
  const k = ctx.filter((w) => !ERR_ADV.has(w)), p = k[k.length - 1], p2 = k[k.length - 2];
  if (missingS) {
    if (ERR_SUBJ3.has(p) || D.names.has(/** @type {string} */ (p))) return "s3";
    if (ERR_PL.has(p) || (/^\d+$/.test(p || "") && p !== "1")) return "plural";
  } else {
    if (ERR_BASE.has(ctx[ctx.length - 1]) || ERR_BASE.has(p)) return "s3";
    if (ERR_SG.has(p)) return "plural";
  }
  const v = D.verbs.has(base), n = D.nouns.has(base);
  if (v && !n) return "s3";
  if (n && !v) return "plural";
  if (missingS && ERR_DET.has(p2) && p && !/s$/.test(p)) return "s3";
  return "ends";
}
/** @param {string} x słowo ucznia @param {string} y słowo wzorca @param {string[]} ctx @param {ErrDict} D @returns {string} */
function errPair(x, y, ctx, D) {
  if (ERR_ART.has(x) && ERR_ART.has(y)) return "article";
  if (ERR_AUX.has(x) && ERR_AUX.has(y)) return "aux";
  if (errSForms(x).includes(y) && !ERR_ADV.has(x)) return errEndS(x, true, ctx, D);
  if (errSForms(y).includes(x) && !ERR_ADV.has(y)) return errEndS(y, false, ctx, D);
  const stem = [...errStems(x, D)].some((s) => errStems(y, D).has(s)), typo = !D.known.has(x) && y.length > 1 && errDist(x, y);
  if (stem && (D.irr.has(x) || D.irr.has(y))) return "irr";
  if (typo === 1) return "typo";
  if (stem) return "verb";
  if ((ERR_PREP.has(x) || x === "to") && (ERR_PREP.has(y) || y === "to")) return "prep";
  if (typo && typo <= (y.length <= 4 ? 1 : 2)) return "typo";
  return "other";
}
/** @param {string} w @param {boolean} missing */
const errLone = (w, missing) => ERR_ART.has(w) ? "article" : ERR_AUX.has(w) ? "aux" : ERR_PREP.has(w) ? "prep" : missing ? "missing" : "extra";
// Zwraca listę kluczy ERR_INFO bez powtórzeń, ["other"] (nie wiadomo) albo [] (brak różnic).
/** @param {string} given @param {readonly string[]} answers @param {ErrDict} D @returns {string[]} */
export function errClassify(given, answers, D) {
  // Warianty od pełnych form (did not) – przy remisie wygrywają one, a nie skróty.
  /** @param {string} s @returns {string[][]} */
  const toks = (s) => [...variants(s)].slice(0, 8).reverse().map((v) => (v ? v.split(" ") : []));
  const ev = answers.flatMap((a) => expandAnswer(a).flatMap(toks));
  // Słowo w innej pisowni (color ↔ colour) zamieniamy na słowo ze wzorca – to nie jest błąd.
  const spell = new Map(ev.flat().map((w) => [spellFold(w), w]));
  const gv = toks(given).map((t) => t.map((w) => spell.get(spellFold(w)) || w));
  /** @param {string[]} t */
  const sorted = (t) => t.slice().sort().join(" ");
  // Najbliższy wzorzec: odległość edycyjna na słowach, podobne słowo (literówka, inna forma, ten sam rodzaj) = pół błędu,
  // te same słowa w innej kolejności = jeden błąd. Przy remisie – dłuższy wzorzec (z opcjonalnymi słowami).
  /** @type {Map<string, number>} */
  const memo = new Map();
  /** @param {string} x @param {string} y @returns {number} */
  const near = (x, y) => {
    const k = x + " " + y;
    if (!memo.has(k)) memo.set(k, (ERR_ART.has(x) && ERR_ART.has(y)) || (ERR_AUX.has(x) && ERR_AUX.has(y)) || (ERR_PREP.has(x) && ERR_PREP.has(y))
      || [...errStems(x, D)].some((s) => errStems(y, D).has(s)) || (Math.min(x.length, y.length) > 2 && errDist(x, y) <= (Math.min(x.length, y.length) <= 4 ? 1 : 2)) ? 0.5 : 1);
    return /** @type {number} */ (memo.get(k));
  };
  /** @param {string[]} a @param {string[]} b */
  const cost = (a, b) => {
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : near(a[i - 1], b[j - 1])));
      prev = cur;
    }
    return prev[b.length];
  };
  /** @type {{ c: number, g: string[], e: string[] } | null} */
  let best = null;
  for (const e of ev) for (const g of gv) {
    const c = sorted(g) === sorted(e) ? (g.join(" ") === e.join(" ") ? 0 : 1) : cost(g, e);
    if (!best || c < best.c || (c === best.c && e.length > best.e.length)) best = { c, g, e };
  }
  if (!best || best.c === 0) return [];
  const { g, e } = best, r = lcs(g, e);
  if (sorted(g) === sorted(e)) return ["order"];
  if (e.length > 2 && r.n < Math.ceil(e.length / 2)) return ["other"];
  // Odcinki różnic między dopasowanymi słowami.
  const A = [...r.inA].sort((p, q) => p - q), B = [...r.inB].sort((p, q) => p - q);
  /** @type {{ x: string[], y: string[], j: number }[]} */
  const segs = [];
  for (let k = 0, pi = -1, pj = -1; k <= A.length; k++) {
    const ai = k < A.length ? A[k] : g.length, bj = k < B.length ? B[k] : e.length;
    if (ai - pi > 1 || bj - pj > 1) segs.push({ x: g.slice(pi + 1, ai), y: e.slice(pj + 1, bj), j: pj + 1 });
    pi = ai; pj = bj;
  }
  /** @type {Set<string>} */
  const out = new Set();
  // Słowo brakujące w jednym miejscu i zbędne w innym = przestawione.
  const miss = segs.flatMap((s) => s.y);
  /** @type {string[]} */
  const moved = [];
  segs.forEach((s) => { s.x = s.x.filter((w) => { const i = miss.indexOf(w); if (i < 0) return true; miss.splice(i, 1); moved.push(w); return false; }); });
  segs.forEach((s) => { s.y = s.y.filter((w) => { const i = moved.indexOf(w); if (i < 0) return true; moved.splice(i, 1); out.add("order"); return false; }); });
  for (const s of segs) {
    const { x, y } = s, ctx = e.slice(0, s.j);
    // Różna długość: z dłuższej strony zdejmujemy przedimki / posiłkowe / przyimki (brakujące albo zbędne).
    while (x.length !== y.length && x.length && y.length) {
      const long = x.length > y.length ? x : y, i = long.findIndex((w) => ERR_ART.has(w) || ERR_AUX.has(w) || ERR_PREP.has(w));
      if (i < 0) break;
      out.add(errLone(long[i], long === y));
      long.splice(i, 1);
    }
    if (x.length && y.length && x.length !== y.length) { out.add("other"); continue; }
    if (!x.length) y.forEach((w) => out.add(errLone(w, true)));
    else if (!y.length) x.forEach((w) => out.add(errLone(w, false)));
    else x.forEach((w, i) => out.add(errPair(w, y[i], ctx.concat(y.slice(0, i)), D)));
  }
  if (out.size > 1) out.delete("other");
  return [...out];
}
// Etykiety pod poprawką przy jednym zadaniu.
/** @param {string[] | undefined} keys @returns {string} */
export const errTagsHtml = (keys) => {
  const k = (keys || []).filter((x) => ERR_INFO[x]);
  return k.length ? `<div class="err-tags">${k.map((x) => `<span class="err-tag" title="${esc(ERR_INFO[x].tip)}">${ERR_INFO[x].label}</span>`).join("")}</div>` : "";
};
// Podsumowanie po zestawie: 1–3 najczęstsze typy błędów (każdy typ liczony raz na zadanie) → [[klucz, ile], …].
// results – wyniki zadań ({ ok, errs }; null = bez odpowiedzi).
/** @param {({ ok: boolean, errs?: string[] } | null | undefined)[]} results @returns {[string, number][]} */
export function errTop(results) {
  /** @type {Map<string, number>} */
  const cnt = new Map();
  results.forEach((r) => { if (r && !r.ok) (r.errs || []).forEach((k) => { if (ERR_INFO[k]) cnt.set(k, (cnt.get(k) || 0) + 1); }); });
  return [...cnt].sort((a, b) => b[1] - a[1] || ERR_KEYS.indexOf(a[0]) - ERR_KEYS.indexOf(b[0])).slice(0, 3);
}

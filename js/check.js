// Sprawdzanie odpowiedzi ucznia (moduł bez DOM; testy: tests/check.test.mjs, tests/data.test.mjs).
// Zmiana czegokolwiek tutaj może po cichu zacząć przyjmować złe albo odrzucać dobre odpowiedzi – po zmianie: npm test.
import { esc, stripTags } from "./util.js";
import { spellFoldStr } from "./spelling.js";

/** Składnia w odpowiedziach: „(that)” = słowo opcjonalne, „{who|that}” = alternatywy. @param {unknown} a @returns {string[]} */
export function expandAnswer(a) {
  let out = [String(a)];
  for (let guard = 0; guard < 12; guard++) {
    let changed = false;
    out = out.flatMap((s) => {
      let m = s.match(/\{([^{}]*)\}/);
      if (m) { const g = m, i = /** @type {number} */ (m.index); changed = true; return g[1].split("|").map((alt) => s.slice(0, i) + alt + s.slice(i + g[0].length)); }
      m = s.match(/\(([^()]*)\)/);
      if (m) { const i = /** @type {number} */ (m.index); changed = true; return [s.slice(0, i) + m[1] + s.slice(i + m[0].length), s.slice(0, i) + s.slice(i + m[0].length)]; }
      return [s];
    });
    if (!changed) break;
  }
  return out.map((s) => s.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim()).slice(0, 64);
}
/** Odpowiedź do pokazania uczniowi: {a|b} → a/b. @param {unknown} a @returns {string} */
export const displayAnswer = (a) => String(a).replace(/\{([^{}]*)\}/g, (_, x) => x.split("|").join("/"));
/** @param {unknown} a @returns {string} */
export const firstVariant = (a) => expandAnswer(a)[0];

/** Diakrytyki ignorujemy (Poznań = Poznan, café = cafe). @param {unknown} s @returns {string} */
export const normalize =(s) => String(s || "").toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”„"«»]/g, "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l")
  .replace(/\b([ap])\.\s?m\b\.?/g, "$1m").replace(/(\d)\s+([ap]m)\b/g, "$1$2").replace(/(\d)([.:])(\d\d)\b/g, "$1:$3")
  .replace(/[.!?,;:…–—]+/g, " ").replace(/(^|\s)-+|-+(\s|$)/g, " ").replace(/\s+/g, " ").trim()
  // Równoważne zapisy tego samego słowa
  .replace(/\bany more\b/g, "anymore").replace(/\ball right\b/g, "alright").replace(/\bokay\b/g, "ok")
  .replace(/\be-mail/g, "email").replace(/\bno-one\b/g, "no one").replace(/\bper cent\b/g, "percent")
  .replace(/\b(some|any|every)body\b/g, "$1one").replace(/\bnobody\b/g, "no one");
/** @type {Dict<string[]>} */
const CONTR = { "won't": ["will not"], "can't": ["cannot", "can not"], "cannot": ["can not", "can't"], "shan't": ["shall not"], "let's": ["let us"],
  "'ll": ["will"], "'d": ["would", "had"], "'s": ["is", "has"], "'m": ["am"], "'re": ["are"], "'ve": ["have"] };
// Po przeczeniu w szyku pytającym (didn't they, isn't it) nie wolno rozwijać: „did not they” jest niegramatyczne.
const SUBJECTS = new Set(["i", "you", "he", "she", "it", "we", "they", "there", "this", "that"]);
// 's = has tylko przed imiesłowem (she's got / she's been / she's finished) – „He's a dog” ≠ „He has a dog”.
/** @param {string | undefined} w */
const looksParticiple = (w) => !!w && (/^(got|been|gone|done|had|made|seen|taken|given|written|eaten|known|left|lost|found|bought|brought|thought|told|said|sent|spent|met|heard|read|run|come|become|begun|broken|chosen|driven|fallen|forgotten|flown|grown|hidden|ridden|risen|shown|spoken|stolen|sworn|thrown|woken|worn|won|sold|kept|slept|felt|paid|put|cut|hit|let|set|shut|hurt|cost|understood|stood|sat|taught|caught|fought|built|learnt|burnt|dreamt|already|just|never|ever|always|not|recently|finally|also|still)$/.test(w) || /(ed|en|wn)$/.test(w));
/** Słowo (po normalize) → możliwe zapisy: ze skrótem i bez (she's → she is / she has). @param {string} t @param {string} [next] następne słowo @returns {string[]} */
export function tokenVariants(t, next) {
  if ((/n't$/.test(t) || t === "cannot") && SUBJECTS.has(/** @type {string} */ (next))) return [t];
  if (CONTR[t]) return [t, ...CONTR[t]];
  let m;
  if ((m = t.match(/^(\w+)n't$/)) && t !== "amn't") return [t, m[1] + " not"]; // „amn't” nie istnieje – nie zaliczamy go jako „am not”
  if ((m = t.match(/^(\w+)'m$/))) return [t, m[1] + " am"];
  if ((m = t.match(/^(\w+)'re$/))) return [t, m[1] + " are"];
  if ((m = t.match(/^(\w+)'ve$/))) return [t, m[1] + " have"];
  if ((m = t.match(/^(\w+)'ll$/))) return [t, m[1] + " will"];
  if ((m = t.match(/^(\w+)'d$/))) return [t, m[1] + " would", m[1] + " had"];
  if ((m = t.match(/^(\w+)'s$/))) return /^(got|been|had)$/.test(/** @type {string} */ (next)) ? [t, m[1] + " has"] : looksParticiple(next) ? [t, m[1] + " is", m[1] + " has"] : [t, m[1] + " is"];
  return [t];
}
/** Wszystkie zapisy zdania (skróty rozwinięte i nie), po normalize. @param {unknown} s @returns {Set<string>} */
export function variants(s) {
  let out = [""];
  const toks = normalize(s).split(" ");
  for (let i = 0; i < toks.length; i++) {
    const vs = tokenVariants(toks[i], toks[i + 1]);
    out = out.flatMap((o) => vs.map((v) => (o ? o + " " + v : v)));
    if (out.length > 4096) out = out.slice(0, 4096);
  }
  return new Set(out.map((x) => x.replace(/\s+/g, " ").trim()));
}
// Luka „bez przedimka” zapisana w answers jako „-”: akceptujemy też typowe zapisy ucznia (0, x, ø, brak).
const NOTHING = new Set(["", "0", "x", "ø", "∅", "brak", "nic", "none", "no article"]);
/** @param {string} given @param {string} expected jeden wariant (bez składni ( ) i { | }) @returns {boolean} */
export const matchOne = (given, expected) => {
  if (normalize(expected) === "") return NOTHING.has(normalize(given));
  const g = new Set([...variants(given)].map(spellFoldStr)); return [...variants(expected)].some((v) => g.has(spellFoldStr(v)));
};
/** Czy odpowiedź ucznia pasuje do którejś z poprawnych (answers – w składni z ( ) i { | }). @param {string} given @param {readonly string[]} answers @returns {boolean} */
export const matches = (given, answers) => answers.some((a) => expandAnswer(a).some((e) => matchOne(given, e)));
// Znajdź błąd – sprawdzanie poprawki. Gdy matches() przyjmuje samo błędne zdanie (różnica tylko w przecinkach albo
// w skrócie: „Yes, I'm.” → „Yes, I am.”, „I amn't” = „am not”, „can not” = „cannot”), porównujemy dokładnie:
// znak po znaku, bez wielkości liter, odstępów i kropki na końcu (7 par). Wynik zapamiętany w zadaniu (ex.strict).
/** @param {unknown} s @returns {string} */
export const feStrictForm = (s) => String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").replace(/\s+([,.!?;:…])/g, "$1").replace(/[\s.!?…]+$/, "").trim();
/** @param {FindErrTask} ex @returns {boolean} */
export const feIsStrict = (ex) => { if (ex.strict === undefined) ex.strict = matches(ex.q, ex.answers); return ex.strict; };
/** @param {string} given @param {FindErrTask} ex @returns {boolean} */
export const feMatch = (given, ex) => feIsStrict(ex)
  ? ex.answers.some((a) => expandAnswer(a).some((e) => feStrictForm(e) === feStrictForm(given)))
  : matches(given, ex.answers);

/**
 * Różnice słowo po słowie (LCS) – pokazuje, czego brakuje, a co jest zbędne.
 * @param {readonly string[]} a
 * @param {readonly string[]} b
 * @returns {{ n: number, inA: Set<number>, inB: Set<number> }} n – długość wspólnego ciągu, inA / inB – indeksy jego słów
 */
export function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const inA = new Set(), inB = new Set();
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) { inA.add(i); inB.add(j); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  return { n: dp[0][0], inA, inB };
}
/**
 * speakBtn(tekst) → HTML przycisku „Posłuchaj” za poprawną wersją (app.js podaje swój; w testach – nic).
 * @param {string} given
 * @param {readonly string[]} answers
 * @param {(text: string) => string} [speakBtn]
 * @returns {string}
 */
export function diffHtml(given, answers, speakBtn = () => "") {
  const gRaw = given.trim().split(/\s+/), gN = gRaw.map((w) => spellFoldStr(normalize(w)));
  /** @type {{ score: number, eRaw: string[], r: ReturnType<typeof lcs> } | null} */
  let best = null;
  // Jeśli uczeń nie używał skrótów, porównujemy z pełną formą wzorca (has not ↔ hasn't), żeby nie zaznaczać fałszywych różnic.
  /** @param {string} s */
  const fullForm = (s) => { const t = s.split(/\s+/); return t.map((w, i) => { const v = tokenVariants(normalize(w), normalize(t[i + 1] || "")); if (!/'/.test(w) || v.length < 2) return w; const f = v[v.length - 1]; return /^[A-Z]/.test(w) ? f.charAt(0).toUpperCase() + f.slice(1) : f; }).join(" "); };
  const useFull = !/['’]/.test(given);
  for (const a of answers) for (const e0 of expandAnswer(a)) {
    const e = useFull ? fullForm(e0) : e0;
    const eRaw = e.split(/\s+/), eN = eRaw.map((w) => spellFoldStr(normalize(w)));
    const r = lcs(gN, eN);
    const score = r.n * 2 - eN.length - gN.length;
    if (!best || score > best.score) best = { score, eRaw, r };
  }
  if (!best) return "";
  const b = best;
  const g = gRaw.map((w, i) => b.r.inA.has(i) ? esc(w) : `<span class="d-extra">${esc(w)}</span>`).join(" ");
  const e = b.eRaw.map((w, j) => b.r.inB.has(j) ? esc(w) : `<span class="d-miss">${esc(w)}</span>`).join(" ");
  return `<div class="diff"><div><span class="d-lbl">Twoja odpowiedź:</span> ${g}</div><div><span class="d-lbl">Poprawnie:</span> ${e} ${speakBtn(b.eRaw.join(" "))}</div></div>`;
}

/** Warianty akceptowane w quizie: „flat / apartment”, „(to) arrive”, „a headache”. @param {string} en @returns {string[]} */
export function vocabAnswers(en) {
  const base = stripTags(en).replace(/\((AmE|BrE|US|UK|pot\.|form\.|inf\.)\)/gi, "");
  const alts = base.split(/\s*[\/;]\s*/).map((s) => s.trim()).filter(Boolean);
  const out = new Set();
  for (const a of alts) {
    for (const v of expandAnswer(a)) {
      const s = v.replace(/\s+/g, " ").trim();
      if (!s) continue;
      out.add(s);
      out.add(s.replace(/^(to|a|an|the)\s+/i, ""));
    }
  }
  return [...out];
}
// Wypełniacze typu „accuse (sb) of” / „do someone a favour” – pomijamy je po obu stronach.
/** @param {string} s @returns {string} */
export const dropFillers = (s) => normalize(s).replace(/\b(sb|sth|somebody|someone|something|one's|sb's)\b/g, " ").replace(/^(to|a|an|the)\s+/, "").replace(/\s+/g, " ").trim();
/** @param {string} given @param {string} en słowo z talii @returns {boolean} */
export const vocabMatch = (given, en) => {
  const g = dropFillers(given);
  return vocabAnswers(en).some((a) => matchOne(g, dropFillers(a)));
};

// Zadanie „ułóż zdanie”: kafelki w poprawnej kolejności (bez tasowania) i znak na końcu zdania.
// Pierwszy wyraz małą literą (żeby wielka litera nie zdradzała początku), chyba że to I / I'm… albo keepCase.
/** @param {Exercise} ex zadanie „order” @returns {{ toks: string[], end: string }} */
export function orderParts(ex) {
  const ans = firstVariant(/** @type {Answers} */ (ex.answers)[0]);
  const end = (ans.match(/[.?!]+$/) || [""])[0];
  const toks = ex.words ? ex.words.slice() : ans.replace(/[.?!]+$/, "").split(/\s+/);
  if (!ex.words && !ex.keepCase && toks.length && !/^I(\b|')/.test(toks[0])) toks[0] = toks[0].charAt(0).toLowerCase() + toks[0].slice(1);
  return { toks, end };
}

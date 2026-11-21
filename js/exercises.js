// Zadania: HTML, sprawdzanie i wynik zestawu (renderExercises, makeController, exercisesShell), różnice słowo
// po słowie i opis typowych błędów (logika – check.js i errors.js).
import { esc } from "./util.js";
import { diffHtml as diffCore, orderParts, matches, displayAnswer, firstVariant, expandAnswer, feMatch, feIsStrict } from "./check.js";
import { buildErrDict, errClassify as classifyErr, errTop, ERR_INFO, errTagsHtml } from "./errors.js";
import { icon } from "./icons.js";
import { $, TYPE_LABEL, badge, shuffle, speakBtn } from "./ui.js";
import { PATH, BY_ID, lessonNo, TASKS, KEY_OF } from "./data.js";
import { state } from "./state.js";
import { saveScore, recordResult, logActivity } from "./record.js";
import { syncTodayCounts } from "./due.js";
import { SLOWER, syncTtsWarn, speak } from "./speech.js";

// ---------- Sprawdzanie odpowiedzi ----------
// Cała logika (składnia ( ) i { | }, skróty, pisownia BrE/AmE, różnice słowo po słowie) – js/check.js i js/spelling.js.
/** @param {string} given @param {readonly string[]} answers */
const diffHtml = (given, answers) => diffCore(given, answers, speakBtn);

/**
 * Wynik zadania: given – odpowiedź (indeks opcji, tekst, wartości luk; null = bez odpowiedzi), extra – HTML pod
 * werdyktem, errs – typy błędów (js/errors.js), canAccept – można zaliczyć samooceną.
 * @typedef {{ ok: boolean, given: number | string | string[] | null, extra?: string, errs?: string[], canAccept?: boolean }} ExResult
 */
/**
 * Kontroler zadania (makeController): evaluate() → wynik, finish(wynik) – pokazuje go i zgłasza, lock() – blokuje
 * zadanie, answered() – czy jest odpowiedź. aLogged / aOk / mPrev – zapis do dziennika i „Moich błędów”
 * (renderExercises).
 * @typedef {{ ex: Exercise, card: HTMLElement, result: ExResult | null, evaluate: () => ExResult,
 *   finish: (r: ExResult) => void, lock: () => void, answered: () => boolean,
 *   aLogged?: boolean, aOk?: boolean, mPrev?: MistakeEntry }} ExControl
 */
/** @typedef {(ctl: ExControl, upgrade: boolean, onlyProgress?: boolean) => void} ExReport */
/**
 * Opcje renderExercises: key – klucz wyniku w scores, mode – "deferred" = sprawdzanie na końcu (testy),
 * showSource – link do lekcji nad zadaniem, onDone – po ostatniej odpowiedzi.
 * @typedef {{ key?: string, mode?: "instant" | "deferred", showSource?: boolean,
 *   onDone?: (correct: number, total: number, ctls: ExControl[]) => void }} ExOpts
 */
/** @typedef {{ ex: Exercise, lesson?: Lesson | null }} ExItem */

// ---------- Typowe błędy (tylko opis błędnej odpowiedzi – ocena się nie zmienia) ----------
// Klasyfikacja – js/errors.js. Słowniki z danych kursu (ok. 0,3 s) budujemy raz: w wolnej chwili po starcie
// (koniec pliku) albo przy pierwszym błędzie.
/** @type {import("./errors.js").ErrDict | null} */
let errDict = null;
/** @returns {import("./errors.js").ErrDict} */
export const errDicts = () => errDict || (errDict = buildErrDict([...TASKS.values()].map((t) => t.ex), BY_ID["irregular-verbs"]));
/** @param {string} given @param {readonly string[]} answers */
const errClassify = (given, answers) => classifyErr(given, answers, errDicts());
/** Podsumowanie po zestawie: 1–3 najczęstsze typy błędów (liczenie – errTop w js/errors.js). @param {ExControl[]} ctls */
function errSummaryHtml(ctls) {
  const top = errTop(ctls.map((c) => c.result));
  if (!top.length) return "";
  // Link do lekcji z wyjaśnieniem tylko wtedy, gdy nie jest dalej na ścieżce niż lekcje z tego zestawu.
  const reach = Math.max(-1, ...ctls.map((c) => { const t = TASKS.get(/** @type {string} */ (KEY_OF.get(c.ex))); return t ? PATH.indexOf(t.lesson) : -1; }));
  return `<div class="err-sum"><div class="err-sum-h">${top.length > 1 ? "Najczęstsze błędy" : "Najczęstszy błąd"}</div><ul>${top.map(([k, n]) => {
    const i = ERR_INFO[k], l = i.lesson && BY_ID[i.lesson] && (reach < 0 || PATH.indexOf(BY_ID[i.lesson]) <= reach) ? BY_ID[i.lesson] : null;
    return `<li><b>${i.label}</b> <span class="err-n">${n}×</span><div class="err-tip">${i.tip}${l ? ` <a href="#/lesson/${l.id}">Lekcja ${lessonNo(l)}: ${esc(l.title)} →</a>` : ""}</div></li>`;
  }).join("")}</ul></div>`;
}

// ---------- Zadania ----------
// Każde zadanie dostaje „kontroler”: evaluate() → {ok, extra} | null (brak odpowiedzi), lock().
/** @param {Exercise} ex @param {number} i @param {string} src HTML źródła nad zadaniem @returns {string} */
function exerciseHtml(ex, i, src) {
  const num = `<span class="ex-num">${i + 1}.</span>`;
  const task = ex.task ? `<div class="ex-task">${ex.task}</div>` : "";
  const hint = ex.hint ? `<div class="ex-hint">${icon("bulb")} ${ex.hint}</div>` : "";
  if (ex.type === "choice") {
    return `<div class="card exercise" data-i="${i}">${src}${task}<div class="ex-q">${num}<div>${String(ex.q).split("___").join("<b>_____</b>")}</div></div>${hint}
        <div class="options">${(ex.options || []).map((o, j) => `<button class="opt" data-j="${j}">${o}</button>`).join("")}</div><div class="fb"></div></div>`;
  }
  if (ex.type === "gap") {
    const parts = String(ex.q).split("___");
    const q = parts.map((p, k) => p + (k < parts.length - 1 ? `<input class="gap-input" data-k="${k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Uzupełnij">` : "")).join("");
    return `<div class="card exercise" data-i="${i}">${src}${task}<div class="ex-q">${num}<div>${q}</div></div>${hint}<div class="gap-actions"></div><div class="fb"></div></div>`;
  }
  if (ex.type === "write") {
    return `<div class="card exercise write" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="w-prompt">${ex.q}</div></div>${hint}
        <div class="w-wrap"><textarea class="w-input" rows="1" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Napisz całe zdanie po angielsku…" aria-label="Twoja odpowiedź"></textarea></div>
        <div class="gap-actions"></div><div class="fb"></div></div>`;
  }
  if (ex.type === "dictation") {
    return `<div class="card exercise write dictation" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="d-controls">
          <button class="btn small d-btn d-play" title="Odtwórz zdanie">${icon("play")} Odtwórz</button><button class="btn small d-btn d-slow" title="Odtwórz wolniej">${icon("slow")} Wolniej</button><span class="d-count muted"></span></div></div>
        <div class="w-wrap"><textarea class="w-input" rows="1" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Zapisz po angielsku to, co słyszysz…" aria-label="Twoja odpowiedź"></textarea></div>
        <div class="gap-actions"></div><div class="fb"></div></div>`;
  }
  if (ex.type === "finderr") {
    let first = true;
    const sent = feParse(ex.html).toks.map((x, k) => x.word
      ? `<button type="button" class="fe-w" data-k="${k}" tabindex="${first ? ((first = false), 0) : -1}">${esc(x.t)}</button>`
      : `<span class="fe-p">${esc(x.t)}</span>`).join(" ");
    return `<div class="card exercise finderr" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="fe-sent" role="group" aria-label="Zdanie – wybierz słowo z błędem">${sent}</div></div>
        ${ex.note ? `<div class="fe-note">(${esc(ex.note)})</div>` : ""}
        <div class="w-wrap fe-fix" hidden><div class="fe-lbl">${icon("check")} Tak, tu jest błąd. Popraw zdanie:</div><textarea class="w-input" rows="1" autocomplete="off" autocapitalize="sentences" spellcheck="false" aria-label="Poprawione zdanie"></textarea></div>
        <div class="gap-actions"><button type="button" class="btn small fe-none">Tu nie ma błędu</button></div><div class="fb"></div></div>`;
  }
  if (ex.type === "order") {
    return `<div class="card exercise order" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="w-prompt">${ex.q || "Ułóż zdanie z podanych wyrazów."}</div></div>${hint}
        <div class="o-line" aria-label="Twoje zdanie"><span class="o-placeholder">Klikaj wyrazy w kolejności…</span></div>
        <div class="o-bank"></div><div class="gap-actions"></div><div class="fb"></div></div>`;
  }
  return "";
}
/** @param {Exercise} ex */
function orderTokens(ex) {
  const { toks, end } = orderParts(ex);
  return { toks: shuffle(toks.concat(ex.extra || [])), end };
}
// Znajdź błąd: zdanie z <b>…</b> → tekst bez znaczników (pojedyncze spacje), tokeny (kawałki między spacjami;
// interpunkcja zostaje przy słowie, np. „film,” – tak da się wskazać zbędny przecinek), bold = token ma choć jeden
// znak w <b>, sel = pierwszy pogrubiony fragment w tekście (zaznaczany w polu poprawki).
/**
 * @param {unknown} html
 * @returns {{ text: string, toks: { t: string, s: number, bold: boolean, word: boolean }[], sel: [number, number] | null }}
 */
function feParse(html) {
  let raw = "", b = false;
  /** @type {boolean[]} */
  const rawB = [];
  String(html || "").replace(/<\/?b>|<[^>]*>|[^<]+/g, (m) => {
    if (m === "<b>") b = true; else if (m === "</b>") b = false;
    else if (m[0] !== "<") for (let i = 0; i < m.length; i++) { raw += m[i]; rawB.push(b); }
    return m;
  });
  let text = "";
  /** @type {boolean[]} */
  const fl = [];
  for (let i = 0; i < raw.length; i++) {
    const sp = /\s/.test(raw[i]);
    if (sp && (!text || text.endsWith(" "))) continue;
    text += sp ? " " : raw[i]; fl.push(rawB[i]);
  }
  while (text.endsWith(" ")) { text = text.slice(0, -1); fl.pop(); }
  /** @type {{ t: string, s: number, bold: boolean, word: boolean }[]} */
  const toks = [];
  text.replace(/\S+/g, (t, /** @type {number} */ s) => { toks.push({ t, s, bold: fl.slice(s, s + t.length).some(Boolean), word: /[\p{L}\p{N}]/u.test(t) }); return t; });
  const a = fl.findIndex((x, i) => x && text[i] !== " ");
  /** @type {[number, number] | null} */
  let sel = null;
  if (a >= 0) { let e = a; while (e < text.length && fl[e]) e++; while (e > a && text[e - 1] === " ") e--; sel = [a, e]; }
  return { text, toks, sel };
}
/**
 * @param {HTMLElement} card
 * @param {Exercise} ex
 * @param {ExOpts["mode"]} mode
 * @param {ExReport} report
 * @returns {ExControl | null}
 */
function makeController(card, ex, mode, report) {
  const deferred = mode === "deferred";
  const actions = $(".gap-actions", card); // brak w zadaniu „choice”
  const fb = $(".fb", card);
  let done = false;
  /** @param {boolean} ok @param {string} [extra] */
  const show = (ok, extra) => {
    card.classList.remove("pending");
    card.classList.add(ok ? "correct" : "wrong");
    fb.innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${ok ? icon("check") + " Dobrze!" : icon("x") + " Niestety."}</span>${extra || ""} <span class="explain">${ex.explain || ""}</span></div>`;
  };
  // evaluate / lock / answered dopisuje niżej gałąź dla typu zadania.
  const ctl = /** @type {ExControl} */ (/** @type {unknown} */ ({ ex, card, result: null }));
  /** @param {ExResult} res */
  const finish = (res) => {
    if (done) return; done = true;
    ctl.result = res;
    ctl.lock();
    if (actions) actions.innerHTML = "";
    show(res.ok, res.extra);
    if ((ex.type === "write" || ex.type === "dictation" || res.canAccept) && !res.ok && res.given) {
      const b = document.createElement("button");
      b.className = "btn small accept"; b.innerHTML = icon("check") + " Moja odpowiedź też jest poprawna";
      b.title = "Automat zna tylko podane warianty. Jeśli jesteś pewien/pewna, że Twoje zdanie jest poprawne – zalicz je.";
      b.addEventListener("click", () => {
        b.remove(); card.classList.remove("wrong"); card.classList.add("correct");
        $(".feedback", fb).className = "feedback ok";
        $(".verdict", fb).innerHTML = icon("check") + " Zaliczone (samoocena).";
        const tags = fb.querySelector(".err-tags"); if (tags) tags.remove();
        res.ok = true; report(ctl, true);
      });
      $(".feedback", fb).appendChild(b);
    }
    report(ctl, false);
  };
  ctl.finish = finish;

  if (ex.type === "choice") {
    const options = ex.options || [], answer = /** @type {number} */ (ex.answer);
    /** @type {number | null} */
    let sel = null;
    const opts = [.../** @type {NodeListOf<HTMLButtonElement>} */ (card.querySelectorAll(".opt"))];
    opts.forEach((btn) => btn.addEventListener("click", () => {
      if (done) return;
      sel = +(btn.dataset.j || 0);
      if (deferred) { opts.forEach((b) => b.classList.toggle("selected", b === btn)); card.classList.add("pending"); report(ctl, false, true); }
      else finish(ctl.evaluate());
    }));
    ctl.evaluate = () => {
      if (sel === null) return { ok: false, given: null, extra: ` Poprawnie: <b>${options[answer]}</b>.` };
      return { ok: sel === answer, given: sel };
    };
    ctl.lock = () => {
      opts.forEach((b) => { b.disabled = true; b.classList.remove("selected"); });
      opts[answer].classList.add("ok");
      if (ctl.result && ctl.result.given !== null && !ctl.result.ok) opts[/** @type {number} */ (ctl.result.given)].classList.add("bad");
    };
    ctl.answered = () => sel !== null;
    return ctl;
  }

  if (ex.type === "gap") {
    const inputs = [.../** @type {NodeListOf<HTMLInputElement>} */ (card.querySelectorAll(".gap-input"))];
    const multi = inputs.length > 1;
    // Warianty dla każdej luki (przy jednej luce answers to od razu lista wariantów).
    const accepted = /** @type {string[][]} */ (multi ? ex.answers : [ex.answers]);
    inputs.forEach((inp, k) => {
      const size = () => { inp.style.width = Math.max(multi ? 8 : 12, inp.value.length + 3) + "ch"; };
      inp.addEventListener("input", () => { size(); if (deferred) report(ctl, false, true); });
      inp.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (k < inputs.length - 1) { inputs[k + 1].focus(); return; }
        if (!deferred && inputs.every((x) => x.value.trim())) { finish(ctl.evaluate()); focusNext(card); }
        else if (deferred) focusNext(card);
      });
    });
    ctl.evaluate = () => {
      const vals = inputs.map((x) => x.value.trim());
      const okEach = vals.map((v, k) => !!v && matches(v, accepted[k] || []));
      const any = vals.some(Boolean);
      const ok = okEach.every(Boolean);
      okEach.forEach((o, k) => inputs[k].classList.add(o ? "ok" : "bad"));
      const show = accepted.map((a) => a.map((x) => esc(displayAnswer(x))).join(" / "));
      // Typ błędu w luce: porównujemy razem z kilkoma słowami przed luką (np. „She ___” → końcówka -s w 3. osobie).
      /** @param {number} k */
      const before = (k) => { const w = String(ex.q).split("___")[k].replace(/\([^)]*\)/g, " ").trim().split(/\s+/).filter(Boolean).slice(-3).join(" "); return w ? w + " " : ""; };
      const errs = ok ? [] : [...new Set(vals.flatMap((v, k) => (v && !okEach[k] ? errClassify(before(k) + v, (accepted[k] || []).map((a) => before(k) + a)) : [])))];
      const extra = ok
        ? (accepted.some((a) => a.length > 1) ? ` <span class="muted">(akceptowane: ${show.join(" … ")})</span>` : "")
        : ` Poprawnie: <b>${show.join("</b> … <b>")}</b>.` + (any ? errTagsHtml(errs) : "");
      return { ok, given: any ? vals : null, extra, errs };
    };
    ctl.lock = () => inputs.forEach((x) => { x.disabled = true; });
    ctl.answered = () => inputs.some((x) => x.value.trim());
    if (!deferred) {
      actions.innerHTML = `<button class="btn small check">Sprawdź</button><button class="btn small giveup">Pokaż odpowiedź</button>`;
      $(".check", actions).addEventListener("click", () => { if (inputs.every((x) => x.value.trim())) finish(ctl.evaluate()); else /** @type {HTMLInputElement} */ (inputs.find((x) => !x.value.trim())).focus(); });
      $(".giveup", actions).addEventListener("click", () => { const r = ctl.evaluate(); r.ok = false; r.given = null; finish(r); });
    }
    return ctl;
  }

  if (ex.type === "write" || ex.type === "dictation") {
    const ta = /** @type {HTMLTextAreaElement} */ ($(".w-input", card));
    const answers = /** @type {string[]} */ (ex.answers), say = String(ex.say);
    if (ex.type === "dictation") {
      let plays = 0;
      const cnt = $(".d-count", card);
      /** @param {HTMLElement} btn @param {number} [rate] */
      const play = (btn, rate) => {
        speak(say, btn, rate, (err) => syncTtsWarn(err));
        plays++; cnt.textContent = plays > 1 ? `odtworzono ${plays}×` : "";
        if (!done) ta.focus({ preventScroll: true });
      };
      const playBtn = $(".d-play", card);
      playBtn.addEventListener("click", () => play(playBtn));
      const slowBtn = $(".d-slow", card);
      slowBtn.addEventListener("click", () => play(slowBtn, SLOWER));
      // Ctrl+spacja w polu – odtwórz jeszcze raz (bez odrywania rąk od klawiatury).
      ta.addEventListener("keydown", (e) => { if (e.key === " " && (e.ctrlKey || e.metaKey)) { e.preventDefault(); play(playBtn); } });
    }
    const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", () => { grow(); if (deferred) report(ctl, false, true); });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!deferred && ta.value.trim()) { finish(ctl.evaluate()); focusNext(card); } else if (deferred) focusNext(card);
      }
    });
    ctl.evaluate = () => {
      const v = ta.value.trim();
      const all = answers.map((a) => esc(displayAnswer(a)));
      if (!v) return { ok: false, given: null, extra: `<div class="w-correct">Poprawnie: <b>${all[0]}</b> ${speakBtn(firstVariant(answers[0]))}${all.length > 1 ? `<div class="muted">Inne poprawne: ${all.slice(1).join(" · ")}</div>` : ""}</div>` };
      const ok = matches(v, answers), errs = ok ? [] : errClassify(v, answers);
      const extra = ok && ex.type === "dictation" ? ` <b>${esc(say)}</b> ${speakBtn(say)}`
        : ok ? ` ${speakBtn(v)}${(() => { const o = answers.filter((a) => !matches(v, [a])).map((a) => esc(displayAnswer(a))); return o.length ? `<div class="muted">Inne poprawne wersje: ${o.join(" · ")}</div>` : ""; })()}`
        : diffHtml(v, answers) + errTagsHtml(errs) + (all.length > 1 ? `<div class="muted">Wszystkie akceptowane: ${all.join(" · ")}</div>` : "");
      return { ok, given: v, extra, errs };
    };
    ctl.lock = () => { ta.disabled = true; ta.classList.add(ctl.result && ctl.result.ok ? "ok" : "bad"); };
    ctl.answered = () => !!ta.value.trim();
    if (!deferred) {
      actions.innerHTML = `<button class="btn small check">Sprawdź</button><button class="btn small giveup">Pokaż odpowiedź</button>`;
      $(".check", actions).addEventListener("click", () => { if (ta.value.trim()) finish(ctl.evaluate()); else ta.focus(); });
      $(".giveup", actions).addEventListener("click", () => { ta.value = ""; finish(ctl.evaluate()); });
    }
    return ctl;
  }

  if (ex.type === "finderr") {
    const fe = /** @type {FindErrTask} */ (ex);
    // Dwa kroki: 1) kliknięcie słowa (każde słowo z <b> się liczy) albo „Tu nie ma błędu”, 2) poprawienie całego zdania
    // w polu wypełnionym błędnym zdaniem (zaznaczony pogrubiony fragment – wystarczy pisać). Źle wskazane miejsce kończy
    // zadanie od razu (z pokazaniem błędu). Zawsze sprawdzane od razu – także w trybie „deferred” (tam tych zadań nie ma).
    const { toks, text, sel } = feParse(ex.html);
    const btns = [.../** @type {NodeListOf<HTMLButtonElement>} */ (card.querySelectorAll(".fe-w"))], sentEl = $(".fe-sent", card);
    const fixBox = $(".fe-fix", card), ta = /** @type {HTMLTextAreaElement} */ ($(".w-input", fixBox));
    /** @param {HTMLElement} b */
    const isTarget = (b) => !ex.ok && toks[+(b.dataset.k || 0)].bold;
    let stage = 0, viaKey = false; // stage: 0 – szukanie, 1 – poprawianie
    /** @type {HTMLElement | "none" | null} */
    let picked = null;
    const why = () => (ex.why ? `<div class="fe-why">${icon("bulb")} ${ex.why}</div>` : "");
    const accepted = () => {
      const all = fe.answers.map((a) => esc(displayAnswer(a)));
      return all.length > 1 || expandAnswer(fe.answers[0]).length > 1 ? `<div class="muted">Wszystkie akceptowane: ${all.join(" · ")}</div>` : "";
    };
    /** @param {string} [lead] */
    const model = (lead) => `${lead ? " " + lead : ""}<div class="w-correct">Poprawnie: <b>${esc(fe.model)}</b> ${speakBtn(fe.model)}</div>${accepted()}`;
    const typical = () => `<div class="fe-typical"><span class="d-lbl">Typowy błąd:</span> <span class="fe-bad">${ex.wrongHtml}</span></div>`;
    // Klawiaturą: strzałki / Home / End przechodzą między słowami (jedno słowo w kolejności Tab), Enter wybiera.
    sentEl.addEventListener("keydown", (e) => {
      const k = btns.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
      if (k < 0) return;
      const n = /** @type {Dict<number>} */ ({ ArrowRight: k + 1, ArrowDown: k + 1, ArrowLeft: k - 1, ArrowUp: k - 1, Home: 0, End: btns.length - 1 })[e.key];
      if (n === undefined) return;
      e.preventDefault();
      const to = btns[Math.max(0, Math.min(btns.length - 1, n))];
      btns.forEach((b) => { b.tabIndex = b === to ? 0 : -1; });
      to.focus();
    });
    const nextCard = () => { if (!viaKey) return; let n = card.nextElementSibling; while (n && !n.querySelector(".fe-w:not(:disabled), textarea:not(:disabled), input:not(:disabled)")) n = n.nextElementSibling; if (n) $(".fe-w[tabindex='0'], textarea, input", n).focus(); };
    const startFix = () => {
      stage = 1;
      btns.forEach((b) => { if (isTarget(b)) b.classList.add("found"); });
      fixBox.hidden = false;
      ta.value = text; grow(); ta.focus();
      if (sel) ta.setSelectionRange(sel[0], sel[1]);
      actions.innerHTML = `<button type="button" class="btn small check">Sprawdź</button><button type="button" class="btn small giveup">Pokaż odpowiedź</button>`;
      $(".check", actions).addEventListener("click", () => { if (ta.value.trim()) finish(ctl.evaluate()); else ta.focus(); });
      $(".giveup", actions).addEventListener("click", () => finish({ ok: false, given: null, extra: model() + why() }));
    };
    const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", grow);
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (ta.value.trim()) { viaKey = true; finish(ctl.evaluate()); nextCard(); } }
    });
    btns.forEach((b) => b.addEventListener("click", (e) => {
      if (done || stage) return;
      picked = b; viaKey = e.detail === 0;
      if (isTarget(b)) { startFix(); return; }
      b.classList.add("miss");
      finish(ex.ok ? { ok: false, given: b.textContent, extra: " To zdanie jest poprawne." + typical() + why() }
        : { ok: false, given: b.textContent, extra: model("Błąd jest w innym miejscu – zaznaczonym w zdaniu.") + why() });
      nextCard();
    }));
    $(".fe-none", card).addEventListener("click", (e) => {
      if (done || stage) return;
      picked = "none"; viaKey = e.detail === 0;
      finish(ex.ok ? { ok: true, given: "none", extra: " To zdanie jest poprawne." + typical() + why() }
        : { ok: false, given: "none", extra: model("W tym zdaniu jest błąd – zaznaczony w zdaniu.") + why() });
      nextCard();
    });
    ctl.evaluate = () => {
      if (stage === 1) {
        const v = ta.value.trim();
        if (!v) return { ok: false, given: null, extra: model() + why() };
        const ok = feMatch(v, fe), strict = feIsStrict(fe), errs = ok || strict ? [] : errClassify(v, fe.answers);
        const extra = ok ? ` ${speakBtn(v)}${(() => { const o = fe.answers.filter((a) => !feMatch(v, { ...fe, answers: [a] })).map((a) => esc(displayAnswer(a))); return o.length ? `<div class="muted">Inne poprawne wersje: ${o.join(" · ")}</div>` : ""; })()}`
          : strict ? model("Tu liczy się każdy znak: przecinki i formy skrócone (I'm / I am).")
          : diffHtml(v, fe.answers) + errTagsHtml(errs) + accepted();
        return { ok, given: v, extra: extra + why(), errs, canAccept: true };
      }
      // Tylko „Zakończ i sprawdź” w trybie deferred: bez odpowiedzi = pominięte.
      return { ok: false, given: null, extra: (ex.ok ? " To zdanie jest poprawne." + typical() : model()) + why() };
    };
    ctl.lock = () => {
      btns.forEach((b) => { b.disabled = true; if (isTarget(b) && stage === 0) b.classList.add("target"); });
      if (ex.ok && ctl.result && ctl.result.ok) sentEl.classList.add("fe-ok");
      ta.disabled = true;
      if (stage === 1) ta.classList.add(ctl.result && ctl.result.ok ? "ok" : "bad");
    };
    ctl.answered = () => picked !== null;
    return ctl;
  }

  if (ex.type === "order") {
    const line = $(".o-line", card), bank = $(".o-bank", card);
    const answers = /** @type {string[]} */ (ex.answers);
    const { toks, end } = orderTokens(ex);
    bank.innerHTML = toks.map((t, k) => `<button class="o-chip" data-k="${k}">${esc(t)}</button>`).join("");
    const placeholder = $(".o-placeholder", line);
    const sync = () => { placeholder.style.display = line.querySelector(".o-chip") ? "none" : ""; if (deferred) report(ctl, false, true); };
    card.addEventListener("click", (e) => {
      const chip = /** @type {Element} */ (e.target).closest(".o-chip"); if (!chip || done) return;
      if (chip.parentElement === bank) line.appendChild(chip); else bank.appendChild(chip);
      sync();
    });
    const sentence = () => [...line.querySelectorAll(".o-chip")].map((c) => c.textContent).join(" ");
    ctl.evaluate = () => {
      const v = sentence();
      const all = answers.map((a) => esc(displayAnswer(a)));
      if (!v) return { ok: false, given: null, extra: ` Poprawnie: <b>${all[0]}</b> ${speakBtn(firstVariant(answers[0]))}` };
      const ok = matches(v, answers), errs = ok ? [] : errClassify(v, answers);
      return { ok, given: v, errs, extra: ok ? ` <b>${esc(v.charAt(0).toUpperCase() + v.slice(1))}${end}</b> ${speakBtn(v)}${all.length > 1 ? `<div class="muted">Też poprawnie: ${all.join(" · ")}</div>` : ""}` : diffHtml(v + end, answers) + errTagsHtml(errs) };
    };
    ctl.lock = () => { /** @type {NodeListOf<HTMLButtonElement>} */ (card.querySelectorAll(".o-chip")).forEach((c) => { c.disabled = true; }); };
    ctl.answered = () => !!line.querySelector(".o-chip");
    if (!deferred) {
      actions.innerHTML = `<button class="btn small check">Sprawdź</button><button class="btn small reset">Wyczyść</button><button class="btn small giveup">Pokaż odpowiedź</button>`;
      $(".check", actions).addEventListener("click", () => { if (bank.querySelector(".o-chip") && !(ex.extra || []).length) { bank.classList.add("nudge"); setTimeout(() => bank.classList.remove("nudge"), 400); return; } finish(ctl.evaluate()); });
      $(".reset", actions).addEventListener("click", () => { line.querySelectorAll(".o-chip").forEach((c) => bank.appendChild(c)); sync(); });
      $(".giveup", actions).addEventListener("click", () => { line.querySelectorAll(".o-chip").forEach((c) => bank.appendChild(c)); sync(); finish(ctl.evaluate()); });
    }
    return ctl;
  }
  return null;
}
/** Fokus w pierwszym wolnym polu w następnych zadaniach. @param {Element} card */
export function focusNext(card) {
  let n = card.nextElementSibling;
  while (n) { const inp = /** @type {HTMLElement | null} */ (n.querySelector("input:not(:disabled), textarea:not(:disabled)")); if (inp) { inp.focus({ preventScroll: false }); return; } n = n.nextElementSibling; }
}
/**
 * Zadania w kontenerze z exercisesShell: wynik, sprawdzanie, zapis do „Moich błędów” i dziennika.
 * @param {HTMLElement} container
 * @param {ExItem[]} items
 * @param {ExOpts} [opts]
 */
export function renderExercises(container, items, opts = {}) {
  const mode = opts.mode || "instant";
  const deferred = mode === "deferred";
  let answered = 0, correct = 0;
  const total = items.length;
  const scoreEl = $(".score", container);
  const resultEl = $(".result-slot", container);
  resultEl.innerHTML = "";
  const list = $(".ex-list", container);
  list.innerHTML = items.map(({ ex, lesson }, i) => {
    const src = lesson && opts.showSource ? `<div class="ex-source">z lekcji: <a href="#/lesson/${lesson.id}">${esc(lesson.title)}</a> ${badge(lesson.level)}${ex.type !== "choice" && ex.type !== "gap" ? ` · ${TYPE_LABEL[ex.type]}` : ""}</div>` : "";
    return exerciseHtml(ex, i, src);
  }).join("");

  /** @type {ExControl[]} */
  const ctls = [];
  const finishAll = () => {
    const p = Math.round((correct / total) * 100);
    const msg = p === 100 ? "Perfekcyjnie! 🎉" : p >= 80 ? "Bardzo dobrze! 👏" : p >= 50 ? "Nieźle – przejrzyj błędy i spróbuj jeszcze raz." : "Warto wrócić do teorii i powtórzyć ćwiczenia.";
    resultEl.innerHTML = `<div class="card result-banner"><b>${correct} / ${total} (${p}%)</b><div>${msg}</div>${errSummaryHtml(ctls)}</div>`;
    if (opts.key) { saveScore(opts.key, correct, total); }
    if (opts.onDone) opts.onDone(correct, total, ctls);
  };
  const updateScore = () => {
    if (deferred && !container.classList.contains("checked")) {
      const n = ctls.filter((c) => c.answered()).length;
      scoreEl.innerHTML = `Odpowiedziano: <b>${n}</b> / ${total}`;
      return;
    }
    scoreEl.innerHTML = `Wynik: <b>${correct}</b> / ${total}` + (answered < total ? ` <span class="muted">(odpowiedziano ${answered})</span>` : "");
  };
  let finished = false;
  // „Moje błędy”: zapis każdej odpowiedzi. Pominięte pytanie w teście (sprawdzanie na końcu) się nie liczy,
  // „Pokaż odpowiedź” – tak. Samoocena „Moja odpowiedź też jest poprawna” cofa zapisany błąd.
  // Dziennik nauki: każde zadanie z odpowiedzią (te same zasady pomijania), samoocena dolicza „dobrze”.
  /** @param {ExControl} ctl @param {boolean} upgrade */
  const trackActivity = (ctl, upgrade) => {
    if (upgrade) { if (ctl.aLogged && !ctl.aOk) { ctl.aOk = true; logActivity({ ok: 1 }); } return; }
    const res = /** @type {ExResult} */ (ctl.result);
    if (deferred && res.given == null) return;
    ctl.aLogged = true; ctl.aOk = !!res.ok;
    logActivity({ t: 1, ok: ctl.aOk ? 1 : 0 });
  };
  /** @param {ExControl} ctl @param {boolean} upgrade */
  const track = (ctl, upgrade) => {
    trackActivity(ctl, upgrade);
    const key = KEY_OF.get(ctl.ex);
    if (!key) return; // np. quiz ze słówek
    if (upgrade) {
      if (!("mPrev" in ctl)) return;
      if (ctl.mPrev) state.mistakes[key] = ctl.mPrev; else delete state.mistakes[key];
      recordResult(key, true);
    } else {
      const res = /** @type {ExResult} */ (ctl.result);
      if (deferred && res.given == null) return;
      ctl.mPrev = state.mistakes[key];
      recordResult(key, res.ok);
    }
    syncTodayCounts();
  };
  /** @type {ExReport} */
  const report = (ctl, upgrade, onlyProgress) => {
    if (onlyProgress) { updateScore(); return; }
    track(ctl, upgrade);
    if (upgrade) { correct++; updateScore(); if (finished) { finishAll(); } return; }
    answered++; if (ctl.result && ctl.result.ok) correct++;
    updateScore();
    if (answered === total && !finished) { finished = true; finishAll(); }
  };
  /** @type {NodeListOf<HTMLElement>} */ (list.querySelectorAll(".exercise")).forEach((card) => {
    const c = makeController(card, items[+(card.dataset.i || 0)].ex, mode, report);
    if (c) ctls.push(c);
  });
  container.classList.remove("checked");
  const checkBtn = /** @type {HTMLElement | null} */ (container.querySelector(".check-all"));
  if (checkBtn) {
    checkBtn.style.display = deferred ? "" : "none";
    checkBtn.onclick = () => {
      const left = ctls.filter((c) => !c.answered()).length;
      if (left && !confirm(`Nie odpowiedziano na ${left} ${left === 1 ? "pytanie" : "pytań"}. Zakończyć test mimo to?`)) return;
      container.classList.add("checked");
      checkBtn.style.display = "none";
      ctls.forEach((c) => c.finish(c.evaluate()));
      resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }
  updateScore();
}
/**
 * HTML zestawu zadań (kontener dla renderExercises).
 * @param {string} title
 * @param {{ id?: string, h3?: boolean, intro?: string, retryLabel?: string, extraBtn?: string }} [opts]
 * @returns {string}
 */
export function exercisesShell(title, opts = {}) {
  return `<div class="exercises" ${opts.id ? `id="${opts.id}"` : ""}>
      <div class="exercises-head">${opts.h3 ? `<h3>${title}</h3>` : `<h2>${title}</h2>`}<span class="score"></span></div>
      ${opts.intro ? `<div class="ex-intro">${opts.intro}</div>` : ""}
      <div class="ex-list"></div>
      <button class="btn primary check-all" style="display:none">Zakończ i sprawdź ${icon("check")}</button>
      <div class="result-slot"></div>
      <div class="ex-footer"><button class="btn retry">${icon("rotate")} ${opts.retryLabel || "Od nowa"}</button>${opts.extraBtn || ""}</div>
    </div>`;
}

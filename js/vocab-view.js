// Słownictwo – komponent wspólny dla lekcji i działów tematycznych: lista, fiszki z ocenami, quiz, pisanie;
// karta z talią Anki do pobrania.
import { stripTags, esc } from "./util.js";
import { vocabMatch } from "./check.js";
import { wordKey, knownEntry } from "./srs.js";
import { icon } from "./icons.js";
import { $, shuffle, speakBtn, closestEl } from "./ui.js";
import { WORDS } from "./data.js";
import { state, save } from "./state.js";
import { rateWord } from "./record.js";
import { syncTodayCounts } from "./due.js";
import { focusNext, renderExercises, exercisesShell } from "./exercises.js";

// ---------- Słownictwo (komponent wspólny: lekcje i działy tematyczne) ----------
// Sprawdzanie odpowiedzi w quizie (vocabAnswers, vocabMatch) – js/check.js.
/** @typedef {{ title?: string, intro?: string, items?: VocabItem[] }} VocabGroup */
/** @typedef {{ k: string, w: VocabItem, deck: string, also?: string[] }} WordCardData karta fiszki (wordCard w state.js) */
/** @param {string} key talia @returns {KnownWords} */
export const knownSet = (key) => (state.known[key] = state.known[key] || {});
/** @param {VocabGroup[]} groups @param {string} key */
function vocabListHtml(groups, key) {
  const known = knownSet(key);
  return groups.map((g) => `
      ${g.title ? `<h3 class="v-group-title">${g.title}</h3>` : ""}
      ${g.intro ? `<p class="v-group-intro">${g.intro}</p>` : ""}
      <div class="card vlist">${(g.items || []).map((w) => `
        <div class="vrow ${known[stripTags(w.en)] ? "known" : ""}" data-en="${esc(stripTags(w.en))}">
          ${speakBtn(w.en.replace(/\((AmE|BrE|US|UK)\)/g, ""))}
          <div class="v-main"><div class="v-en">${w.en}${w.pos ? ` <span class="v-pos">${w.pos}</span>` : ""}</div><div class="v-pl ex-pl">${w.pl}</div>
          ${w.ex ? `<div class="v-ex">${speakBtn(w.ex)}<span><i>${w.ex}</i>${w.exPl ? `<span class="ex-pl v-expl"> – ${w.exPl}</span>` : ""}</span></div>` : ""}
          ${w.note ? `<div class="ex-note">${w.note}</div>` : ""}</div>
          <button class="v-known" title="Oznacz jako znane">${icon("check")}</button>
        </div>`).join("")}</div>`).join("");
}
/** @param {VocabGroup[]} groups @param {string} key @param {{ intro?: string }} [opts] @returns {string} */
export function vocabBlockHtml(groups, key, opts = {}) {
  const n = groups.reduce((s, g) => s + (g.items || []).length, 0);
  const k = Object.keys(knownSet(key)).length;
  return `<div class="vocab-block ${state.showPl ? "" : "hide-pl"}" data-vkey="${esc(key)}">
      <div class="v-toolbar">
        <div class="seg">
          <button class="seg-btn active" data-vmode="list">${icon("list")} Lista</button>
          <button class="seg-btn" data-vmode="cards">${icon("cards")} Fiszki</button>
          <button class="seg-btn" data-vmode="quiz-en">${icon("pen")} Wpisz po angielsku</button>
          <button class="seg-btn" data-vmode="quiz-pl">${icon("type")} Wybierz znaczenie</button>
        </div>
        <span class="v-progress">znasz <b class="v-k">${k}</b> z ${n}</span>
      </div>
      ${opts.intro ? `<div class="v-intro prose">${opts.intro}</div>` : ""}
      <div class="v-pane" data-pane="list">
        <label class="toggle"><input type="checkbox" class="v-pl-toggle" ${state.showPl ? "checked" : ""}> Pokaż tłumaczenia</label>
        ${vocabListHtml(groups, key)}
      </div>
      <div class="v-pane" data-pane="cards" hidden></div>
      <div class="v-pane" data-pane="quiz-en" hidden></div>
      <div class="v-pane" data-pane="quiz-pl" hidden></div>
    </div>`;
}
/** @param {HTMLElement | null} root .vocab-block @param {VocabGroup[]} groups @param {string} key */
export function bindVocabBlock(root, groups, key) {
  if (!root) return;
  const items = groups.flatMap((g) => g.items || []);
  const known = knownSet(key);
  const refreshK = () => { $(".v-k", root).textContent = String(Object.keys(known).length); };
  $(".v-pl-toggle", root).addEventListener("change", (e) => {
    state.showPl = /** @type {HTMLInputElement} */ (e.target).checked; save();
    root.classList.toggle("hide-pl", !state.showPl);
    const art = root.closest(".lesson"); if (art) art.classList.toggle("hide-pl", !state.showPl);
  });
  root.addEventListener("click", (e) => {
    const kb = closestEl(e, ".v-known"); if (!kb) return;
    const row = /** @type {HTMLElement} */ (kb.closest(".vrow")); const w = String(row.dataset.en);
    if (known[w]) delete known[w]; else known[w] = 1;
    // „Znam” bez fiszki = jak przy migracji: pudełko 3 (odznaczenie nie zmienia powtórek).
    const k = wordKey(w);
    if (known[w] && !state.srs[k] && WORDS.has(k)) state.srs[k] = knownEntry(k, key);
    row.classList.toggle("known", !!known[w]); save(); refreshK(); syncTodayCounts();
  });
  const panes = Object.fromEntries([.../** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll(".v-pane"))].map((p) => [String(p.dataset.pane), p]));
  /** @type {Dict<() => void>} */
  const modes = {
    cards: () => runFlashcards(panes.cards, items, key, refreshK),
    "quiz-en": () => runQuiz(panes["quiz-en"], items, "en"),
    "quiz-pl": () => runQuiz(panes["quiz-pl"], items, "pl"),
  };
  /** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll(".seg-btn")).forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x === b));
    const mode = String(b.dataset.vmode);
    for (const [k, p] of Object.entries(panes)) p.hidden = k !== mode;
    if (modes[mode]) modes[mode]();
  }));
}
// Fiszki z oceną „Nie wiem / Trudne / Wiem” – w taliach (lekcja, dział) i w „Słówkach na dziś”.
// cards: [{ k, w, deck, also }]. „Nie wiem” odsłania odpowiedź, a karta wraca na koniec talii.
// opts: { onRate(card, rating), onEnd(stats [nie wiem, trudne, wiem] – pierwsze oceny), top, afterDraw(), note }.
let fcDir = "en"; // co widać na awersie – wspólne dla wszystkich fiszek
/** @type {[string, string][]} */
const RATE_BTNS = [["fc-bad", icon("x") + " Nie wiem"], ["fc-hard", "~ Trudne"], ["fc-ok primary", icon("check") + " Wiem"]];
/**
 * @param {HTMLElement} pane
 * @param {WordCardData[]} cards
 * @param {{ onRate: (c: WordCardData, rating: number) => void, onEnd: (stats: number[]) => void, top?: string,
 *   afterDraw?: () => void, note?: string }} opts
 */
export function flashcards(pane, cards, opts) {
  const queue = cards.slice(), stats = [0, 0, 0];
  /** @type {Set<WordCardData>} */
  const rated = new Set();
  let i = 0;
  const draw = () => {
    if (i >= queue.length) { opts.onEnd(stats); return; }
    const c = queue[i], w = c.w;
    const en = `<div class="fc-word">${w.en}</div>`, pl = `<div class="fc-word">${w.pl}</div>`;
    const also = c.also && c.also.length ? `<div class="fc-also">też: ${c.also.map(esc).join(" · ")}</div>` : "";
    pane.innerHTML = `${opts.note ? `<p class="fc-note">${opts.note}</p>` : ""}
        <div class="fc-top"><span>${i + 1} / ${queue.length}</span>
          <label class="toggle"><input type="checkbox" class="fc-dir" ${fcDir === "pl" ? "checked" : ""}> Najpierw po polsku</label>${opts.top || ""}</div>
        <div class="card flashcard" tabindex="0" title="Kliknij lub naciśnij spację, aby odwrócić">
          <div class="fc-front">${fcDir === "en" ? en : pl}<div class="fc-hint">kliknij, aby odwrócić</div></div>
          <div class="fc-back" hidden>${fcDir === "en" ? pl + also : en}${w.ex ? `<div class="fc-ex"><i>${w.ex}</i>${w.exPl ? `<br><span>${w.exPl}</span>` : ""}</div>` : ""}</div>
        </div>
        <div class="fc-actions">${speakBtn(w.en)}${RATE_BTNS.map(([cls, label], r) => `<button class="btn ${cls}" data-r="${r}">${label}</button>`).join("")}</div>
        <div class="fc-keys">Spacja – odwróć · klawisze 1 / 2 / 3 – ocena</div>`;
    const card = $(".flashcard", pane), front = $(".fc-front", pane), back = $(".fc-back", pane);
    const flip = () => { front.hidden = !front.hidden; back.hidden = !back.hidden; };
    /** @type {(() => void) | null} */
    let next = null; // po „Nie wiem”: odpowiedź widoczna, czekamy na „Dalej”
    /** @param {number} r ocena 0–2 */
    const rate = (r) => {
      if (next) return next();
      if (!rated.has(c)) { rated.add(c); stats[r]++; }
      opts.onRate(c, r);
      if (r !== 0) { i++; draw(); return; }
      queue.push(c);
      front.hidden = true; back.hidden = false;
      next = () => { i++; draw(); };
      $(".fc-actions", pane).innerHTML = `${speakBtn(w.en)}<button class="btn primary fc-next">Dalej →</button>`;
      $(".fc-next", pane).onclick = next;
      card.focus({ preventScroll: true });
    };
    card.onclick = () => { if (!next) flip(); };
    card.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (next) next(); else flip(); }
      else if (["1", "2", "3"].includes(e.key)) { e.preventDefault(); rate(+e.key - 1); }
    };
    /** @type {NodeListOf<HTMLElement>} */ (pane.querySelectorAll("[data-r]")).forEach((b) => { b.onclick = () => rate(+(b.dataset.r || 0)); });
    $(".fc-dir", pane).onchange = (e) => { fcDir = /** @type {HTMLInputElement} */ (e.target).checked ? "pl" : "en"; draw(); };
    if (opts.afterDraw) opts.afterDraw();
    card.focus({ preventScroll: true });
  };
  draw();
}
/** @param {number[]} s [nie wiem, trudne, wiem] */
export const fcStatsHtml = (s) => `Wiem: ${s[2]} · Trudne: ${s[1]} · Nie wiem: ${s[0]}`;
/** @param {HTMLElement} pane @param {VocabItem[]} items @param {string} key @param {() => void} refreshK */
function runFlashcards(pane, items, key, refreshK) {
  const known = knownSet(key);
  let onlyUnknown = items.some((w) => !known[stripTags(w.en)]);
  /** @param {VocabItem} w @param {boolean} k */
  const markRow = (w, k) => {
    const row = /** @type {Element} */ (pane.closest(".vocab-block")).querySelector(`.vrow[data-en="${CSS.escape(stripTags(w.en))}"]`);
    if (row) row.classList.toggle("known", k);
  };
  const start = () => {
    const pool = onlyUnknown ? items.filter((w) => !known[stripTags(w.en)]) : items;
    flashcards(pane, shuffle(pool.length ? pool : items).map((w) => ({ k: wordKey(w.en), w, deck: key })), {
      note: `Oceny trafiają do <a href="#/slowka">${icon("cards")} Słówek na dziś</a> – słówko wróci wtedy, gdy trzeba je powtórzyć.`,
      top: `<label class="toggle"><input type="checkbox" class="fc-only" ${onlyUnknown ? "checked" : ""}> Tylko nieznane</label>`,
      afterDraw: () => { $(".fc-only", pane).onchange = (e) => { onlyUnknown = /** @type {HTMLInputElement} */ (e.target).checked; start(); }; },
      onRate: (c, r) => {
        rateWord(c.k, r, key);
        const en = stripTags(c.w.en);
        if (r === 2) known[en] = 1; else if (r === 0) delete known[en];
        save(); refreshK(); markRow(c.w, !!known[en]); syncTodayCounts();
      },
      onEnd: (st) => {
        pane.innerHTML = `<div class="card fc-done"><b>Koniec talii! 🎉</b><p>${fcStatsHtml(st)}</p>
            <button class="btn primary fc-again">${icon("rotate")} Jeszcze raz (nieznane)</button> <button class="btn fc-all">Cała talia</button></div>`;
        $(".fc-again", pane).onclick = () => { onlyUnknown = true; start(); };
        $(".fc-all", pane).onclick = () => { onlyUnknown = false; start(); };
      },
    });
  };
  start();
}
/** @typedef {{ type: "vocab", q: string, en: string, explain: string }} VocabQuestion pytanie quizu PL→EN */
/** @param {HTMLElement} pane @param {VocabItem[]} items @param {"en" | "pl"} dir */
function runQuiz(pane, items, dir) {
  const N = Math.min(20, items.length);
  const build = () => {
    const pick = shuffle(items).slice(0, N);
    const exs = pick.map((w) => {
      if (dir === "en") {
        return { ex: { type: /** @type {const} */ ("vocab"), q: w.pl, en: w.en, explain: w.ex ? `<i>${w.ex}</i>${w.exPl ? ` – ${w.exPl}` : ""}` : "" } };
      }
      const others = shuffle(items.filter((x) => x !== w && stripTags(x.pl) !== stripTags(w.pl))).slice(0, 3);
      const opts = shuffle([w, ...others]);
      return { ex: { type: /** @type {const} */ ("choice"), q: `<b>${w.en}</b> ${speakBtn(w.en)}`, options: opts.map((o) => o.pl), answer: opts.indexOf(w), explain: w.ex ? `<i>${w.ex}</i>${w.exPl ? ` – ${w.exPl}` : ""}` : "" } };
    });
    pane.innerHTML = exercisesShell(dir === "en" ? "Wpisz słowo po angielsku" : "Wybierz polskie znaczenie", { h3: true, retryLabel: "Nowe losowanie", intro: dir === "en" ? "Wystarczy samo słowo/wyrażenie (bez „to” i przedimka). Losowane " + N + " słówek." : "Losowane " + N + " słówek." });
    const box = /** @type {HTMLElement} */ (pane.firstElementChild);
    if (dir === "en") renderVocabWrite(box, /** @type {{ ex: VocabQuestion }[]} */ (exs));
    else renderExercises(box, /** @type {{ ex: Exercise }[]} */ (exs), {});
    $(".retry", box).onclick = build;
  };
  build();
}
// Quiz PL→EN: osobny prosty renderer (porównanie z wariantami słówka).
/** @param {HTMLElement} box @param {{ ex: VocabQuestion }[]} exs */
function renderVocabWrite(box, exs) {
  let answered = 0, correct = 0;
  const total = exs.length, scoreEl = $(".score", box), list = $(".ex-list", box);
  const upd = () => { scoreEl.innerHTML = `Wynik: <b>${correct}</b> / ${total}`; if (answered === total) $(".result-slot", box).innerHTML = `<div class="card result-banner"><b>${correct} / ${total}</b></div>`; };
  list.innerHTML = exs.map(({ ex }, i) => `<div class="card exercise" data-i="${i}"><div class="ex-q"><span class="ex-num">${i + 1}.</span><div>${ex.q} → <input class="gap-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></div></div><div class="gap-actions"><button class="btn small check">Sprawdź</button><button class="btn small giveup">Nie wiem</button></div><div class="fb"></div></div>`).join("");
  /** @type {NodeListOf<HTMLElement>} */ (list.querySelectorAll(".exercise")).forEach((card) => {
    const ex = exs[+(card.dataset.i || 0)].ex, inp = /** @type {HTMLInputElement} */ (card.querySelector("input"));
    /** @param {string | null} v odpowiedź (null = „Nie wiem”) */
    const fin = (v) => {
      const ok = v != null && vocabMatch(v, ex.en);
      inp.disabled = true; inp.classList.add(ok ? "ok" : "bad"); card.classList.add(ok ? "correct" : "wrong");
      $(".gap-actions", card).remove();
      $(".fb", card).innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${icon(ok ? "check" : "x")}${ok ? " Dobrze!" : ""}</span> <b>${ex.en}</b> ${speakBtn(ex.en)} ${ex.explain ? `<div class="muted">${ex.explain}</div>` : ""}</div>`;
      answered++; if (ok) correct++; upd();
    };
    $(".check", card).onclick = () => { if (inp.value.trim()) fin(inp.value); else inp.focus(); };
    $(".giveup", card).onclick = () => fin(null);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && inp.value.trim()) { fin(inp.value); focusNext(card); } });
  });
  upd();
}

// ---------- Talia Anki do pobrania ----------
const ANKI_FILE = "downloads/Angielski_A1-B2.apkg";
/** @returns {string} */
export function ankiCard() {
  return `<div class="card anki-dl">
      <span class="f-ico">${icon("archive")}</span>
      <div class="anki-txt"><b>Talia Anki do pobrania</b>
        <span>Ok. 4500 słówek A1–B2 (plus trochę C1) w kierunku PL → EN, z transkrypcją IPA i nagraniem wymowy. Otwórz pobrany plik <code>.apkg</code> w programie Anki (na komputerze lub w AnkiDroid), a talia sama się zaimportuje.</span></div>
      <a class="btn primary" href="${ANKI_FILE}" download>${icon("download")} Pobierz (.apkg, ok. 50 MB)</a>
    </div>`;
}

// Słownictwo – komponent wspólny dla lekcji i działów tematycznych: lista, fiszki z ocenami, quiz, pisanie;
// karta z talią Anki do pobrania.
import { stripTags, esc } from "./util.js";
import { vocabMatch } from "./check.js";
import { wordKey, knownEntry } from "./srs.js";
import { icon } from "./icons.js";
import { shuffle, speakBtn } from "./ui.js";
import { WORDS } from "./data.js";
import { state, save } from "./state.js";
import { rateWord } from "./record.js";
import { syncTodayCounts } from "./due.js";
import { focusNext, renderExercises, exercisesShell } from "./exercises.js";

// ---------- Słownictwo (komponent wspólny: lekcje i działy tematyczne) ----------
// Sprawdzanie odpowiedzi w quizie (vocabAnswers, vocabMatch) – js/check.js.
export const knownSet = (key) => (state.known[key] = state.known[key] || {});
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
export function bindVocabBlock(root, groups, key) {
  if (!root) return;
  const items = groups.flatMap((g) => g.items || []);
  const known = knownSet(key);
  const refreshK = () => { root.querySelector(".v-k").textContent = Object.keys(known).length; };
  root.querySelector(".v-pl-toggle").addEventListener("change", (e) => {
    state.showPl = e.target.checked; save();
    root.classList.toggle("hide-pl", !state.showPl);
    const art = root.closest(".lesson"); if (art) art.classList.toggle("hide-pl", !state.showPl);
  });
  root.addEventListener("click", (e) => {
    const kb = e.target.closest(".v-known"); if (!kb) return;
    const row = kb.closest(".vrow"); const w = row.dataset.en;
    if (known[w]) delete known[w]; else known[w] = 1;
    // „Znam” bez fiszki = jak przy migracji: pudełko 3 (odznaczenie nie zmienia powtórek).
    const k = wordKey(w);
    if (known[w] && !state.srs[k] && WORDS.has(k)) state.srs[k] = knownEntry(k, key);
    row.classList.toggle("known", !!known[w]); save(); refreshK(); syncTodayCounts();
  });
  const panes = Object.fromEntries([...root.querySelectorAll(".v-pane")].map((p) => [p.dataset.pane, p]));
  const modes = {
    cards: () => runFlashcards(panes.cards, items, key, refreshK),
    "quiz-en": () => runQuiz(panes["quiz-en"], items, "en"),
    "quiz-pl": () => runQuiz(panes["quiz-pl"], items, "pl"),
  };
  root.querySelectorAll(".seg-btn").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x === b));
    for (const [k, p] of Object.entries(panes)) p.hidden = k !== b.dataset.vmode;
    if (modes[b.dataset.vmode]) modes[b.dataset.vmode]();
  }));
}
// Fiszki z oceną „Nie wiem / Trudne / Wiem” – w taliach (lekcja, dział) i w „Słówkach na dziś”.
// cards: [{ k, w, deck, also }]. „Nie wiem” odsłania odpowiedź, a karta wraca na koniec talii.
// opts: { onRate(card, rating), onEnd(stats [nie wiem, trudne, wiem] – pierwsze oceny), top, afterDraw(), note }.
let fcDir = "en"; // co widać na awersie – wspólne dla wszystkich fiszek
const RATE_BTNS = [["fc-bad", icon("x") + " Nie wiem"], ["fc-hard", "~ Trudne"], ["fc-ok primary", icon("check") + " Wiem"]];
export function flashcards(pane, cards, opts) {
  const queue = cards.slice(), rated = new Set(), stats = [0, 0, 0];
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
    const card = pane.querySelector(".flashcard"), front = pane.querySelector(".fc-front"), back = pane.querySelector(".fc-back");
    const flip = () => { front.hidden = !front.hidden; back.hidden = !back.hidden; };
    let next = null; // po „Nie wiem”: odpowiedź widoczna, czekamy na „Dalej”
    const rate = (r) => {
      if (next) return next();
      if (!rated.has(c)) { rated.add(c); stats[r]++; }
      opts.onRate(c, r);
      if (r !== 0) { i++; draw(); return; }
      queue.push(c);
      front.hidden = true; back.hidden = false;
      next = () => { i++; draw(); };
      pane.querySelector(".fc-actions").innerHTML = `${speakBtn(w.en)}<button class="btn primary fc-next">Dalej →</button>`;
      pane.querySelector(".fc-next").onclick = next;
      card.focus({ preventScroll: true });
    };
    card.onclick = () => { if (!next) flip(); };
    card.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (next) next(); else flip(); }
      else if (["1", "2", "3"].includes(e.key)) { e.preventDefault(); rate(+e.key - 1); }
    };
    pane.querySelectorAll("[data-r]").forEach((b) => { b.onclick = () => rate(+b.dataset.r); });
    pane.querySelector(".fc-dir").onchange = (e) => { fcDir = e.target.checked ? "pl" : "en"; draw(); };
    if (opts.afterDraw) opts.afterDraw();
    card.focus({ preventScroll: true });
  };
  draw();
}
export const fcStatsHtml = (s) => `Wiem: ${s[2]} · Trudne: ${s[1]} · Nie wiem: ${s[0]}`;
function runFlashcards(pane, items, key, refreshK) {
  const known = knownSet(key);
  let onlyUnknown = items.some((w) => !known[stripTags(w.en)]);
  const markRow = (w, k) => {
    const row = pane.closest(".vocab-block").querySelector(`.vrow[data-en="${CSS.escape(stripTags(w.en))}"]`);
    if (row) row.classList.toggle("known", k);
  };
  const start = () => {
    const pool = onlyUnknown ? items.filter((w) => !known[stripTags(w.en)]) : items;
    flashcards(pane, shuffle(pool.length ? pool : items).map((w) => ({ k: wordKey(w.en), w, deck: key })), {
      note: `Oceny trafiają do <a href="#/slowka">${icon("cards")} Słówek na dziś</a> – słówko wróci wtedy, gdy trzeba je powtórzyć.`,
      top: `<label class="toggle"><input type="checkbox" class="fc-only" ${onlyUnknown ? "checked" : ""}> Tylko nieznane</label>`,
      afterDraw: () => { pane.querySelector(".fc-only").onchange = (e) => { onlyUnknown = e.target.checked; start(); }; },
      onRate: (c, r) => {
        rateWord(c.k, r, key);
        const en = stripTags(c.w.en);
        if (r === 2) known[en] = 1; else if (r === 0) delete known[en];
        save(); refreshK(); markRow(c.w, !!known[en]); syncTodayCounts();
      },
      onEnd: (st) => {
        pane.innerHTML = `<div class="card fc-done"><b>Koniec talii! 🎉</b><p>${fcStatsHtml(st)}</p>
            <button class="btn primary fc-again">${icon("rotate")} Jeszcze raz (nieznane)</button> <button class="btn fc-all">Cała talia</button></div>`;
        pane.querySelector(".fc-again").onclick = () => { onlyUnknown = true; start(); };
        pane.querySelector(".fc-all").onclick = () => { onlyUnknown = false; start(); };
      },
    });
  };
  start();
}
function runQuiz(pane, items, dir) {
  const N = Math.min(20, items.length);
  const build = () => {
    const pick = shuffle(items).slice(0, N);
    const exs = pick.map((w) => {
      if (dir === "en") {
        return { ex: { type: "vocab", q: w.pl, en: w.en, explain: w.ex ? `<i>${w.ex}</i>${w.exPl ? ` – ${w.exPl}` : ""}` : "" } };
      }
      const others = shuffle(items.filter((x) => x !== w && stripTags(x.pl) !== stripTags(w.pl))).slice(0, 3);
      const opts = shuffle([w, ...others]);
      return { ex: { type: "choice", q: `<b>${w.en}</b> ${speakBtn(w.en)}`, options: opts.map((o) => o.pl), answer: opts.indexOf(w), explain: w.ex ? `<i>${w.ex}</i>${w.exPl ? ` – ${w.exPl}` : ""}` : "" } };
    });
    pane.innerHTML = exercisesShell(dir === "en" ? "Wpisz słowo po angielsku" : "Wybierz polskie znaczenie", { h3: true, retryLabel: "Nowe losowanie", intro: dir === "en" ? "Wystarczy samo słowo/wyrażenie (bez „to” i przedimka). Losowane " + N + " słówek." : "Losowane " + N + " słówek." });
    const box = pane.firstElementChild;
    if (dir === "en") renderVocabWrite(box, exs);
    else renderExercises(box, exs, {});
    box.querySelector(".retry").onclick = build;
  };
  build();
}
// Quiz PL→EN: osobny prosty renderer (porównanie z wariantami słówka).
function renderVocabWrite(box, exs) {
  let answered = 0, correct = 0;
  const total = exs.length, scoreEl = box.querySelector(".score"), list = box.querySelector(".ex-list");
  const upd = () => { scoreEl.innerHTML = `Wynik: <b>${correct}</b> / ${total}`; if (answered === total) box.querySelector(".result-slot").innerHTML = `<div class="card result-banner"><b>${correct} / ${total}</b></div>`; };
  list.innerHTML = exs.map(({ ex }, i) => `<div class="card exercise" data-i="${i}"><div class="ex-q"><span class="ex-num">${i + 1}.</span><div>${ex.q} → <input class="gap-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></div></div><div class="gap-actions"><button class="btn small check">Sprawdź</button><button class="btn small giveup">Nie wiem</button></div><div class="fb"></div></div>`).join("");
  list.querySelectorAll(".exercise").forEach((card) => {
    const ex = exs[+card.dataset.i].ex, inp = card.querySelector("input");
    const fin = (v) => {
      const ok = v != null && vocabMatch(v, ex.en);
      inp.disabled = true; inp.classList.add(ok ? "ok" : "bad"); card.classList.add(ok ? "correct" : "wrong");
      card.querySelector(".gap-actions").remove();
      card.querySelector(".fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${icon(ok ? "check" : "x")}${ok ? " Dobrze!" : ""}</span> <b>${ex.en}</b> ${speakBtn(ex.en)} ${ex.explain ? `<div class="muted">${ex.explain}</div>` : ""}</div>`;
      answered++; if (ok) correct++; upd();
    };
    card.querySelector(".check").onclick = () => { if (inp.value.trim()) fin(inp.value); else inp.focus(); };
    card.querySelector(".giveup").onclick = () => fin(null);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && inp.value.trim()) { fin(inp.value); focusNext(card); } });
  });
  upd();
}

// ---------- Talia Anki do pobrania ----------
const ANKI_FILE = "downloads/Angielski_A1-B2.apkg";
export function ankiCard() {
  return `<div class="card anki-dl">
      <span class="f-ico">${icon("archive")}</span>
      <div class="anki-txt"><b>Talia Anki do pobrania</b>
        <span>Ok. 4500 słówek A1–B2 (plus trochę C1) w kierunku PL → EN, z transkrypcją IPA i nagraniem wymowy. Otwórz pobrany plik <code>.apkg</code> w programie Anki (na komputerze lub w AnkiDroid), a talia sama się zaimportuje.</span></div>
      <a class="btn primary" href="${ANKI_FILE}" download>${icon("download")} Pobierz (.apkg, ok. 50 MB)</a>
    </div>`;
}

// Widok #/slowka – „Słówka na dziś”: fiszki z powtórkami w odstępach; kafelek „na dziś” dla innych stron.
import { esc, stripTags } from "../util.js";
import { SRS_ROUND, SRS_DAYS, NEW_CHOICES, isDue } from "../srs.js";
import { store } from "../storage.js";
import { icon } from "../icons.js";
import { $, SITE_TITLE, badge, shuffle, zadan, plural, slowek, daysLabel } from "../ui.js";
import { WORDS } from "../data.js";
import { state, save, srsToday, wordCard } from "../state.js";
import { rateWord } from "../record.js";
import { mistakeList, wordsDue, syncTodayCounts } from "../due.js";
import { knownSet, flashcards, fcStatsHtml } from "../vocab-view.js";
import { dueLabel } from "./mistakes.js";

// ---------- Słówka na dziś (#/slowka) ----------
// „12 do powtórki + 10 nowych” (pusty napis, gdy nic na dziś).
const wordsTodayTxt = (q) => [q.due.length ? `${q.due.length} do powtórki` : "", q.fresh.length ? `${q.fresh.length} ${plural(q.fresh.length, "nowe", "nowe", "nowych")}` : ""].filter(Boolean).join(" + ");
const srsEntries = () => Object.entries(state.srs).filter(([k]) => WORDS.has(k)).map(([, e]) => e);
function wTodayHtml(q) {
  const txt = wordsTodayTxt(q), n = q.due.length + q.fresh.length;
  if (n) return `<div class="card m-today"><div><b>Na dziś: ${txt}</b><span>${n > SRS_ROUND ? `Po ${SRS_ROUND} w jednej rundzie. ` : ""}Najpierw powtórki, potem nowe słówka.</span></div><button class="btn primary" data-wrun>Zacznij →</button></div>`;
  const next = srsEntries().map((e) => e.due).sort()[0];
  const nNext = next ? srsEntries().filter((e) => e.due === next).length : 0;
  const more = q.avail ? `Dzienny limit nowych słówek (${state.srsNew}) wykorzystany – kolejne jutro. Możesz zwiększyć limit poniżej.`
    : "Wszystkie słówka z Twoich lekcji i działów są już w powtórkach – nowe dojdą po następnej lekcji.";
  return `<div class="card m-today"><div><b>Na dziś wszystko powtórzone ${icon("check")}</b><span>${next ? `Następna powtórka: ${dueLabel({ due: next })} (${slowek(nNext)}). ` : ""}${more}</span></div></div>`;
}
function wInfoHtml(q) {
  const entries = srsEntries();
  const boxes = SRS_DAYS.map((d, i) => entries.filter((e) => Math.min(e.box, SRS_DAYS.length) === i + 1).length);
  const inDeck = (d) => d.keys.filter((k) => state.srs[k]).length;
  const deckCount = (d) => d.manual ? `dodane: ${Object.values(state.srs).filter((e) => e.deck === d.id).length}` : `w powtórkach: ${inDeck(d)} z ${d.keys.length}`;
  return `<div class="card wd-settings"><span>Nowych słówek dziennie:</span><div class="chips">${NEW_CHOICES.map((n) => `<button class="chip ${state.srsNew === n ? "active" : ""}" data-wnew="${n}">${n}</button>`).join("")}</div></div>
      ${entries.length ? `<h2 class="section-title">Twoje pudełka (${slowek(entries.length)})</h2>
      <div class="wd-boxes">${boxes.map((n, i) => `<div class="card wd-box"><b>${n}</b><span>pudełko ${i + 1}</span><small>co ${daysLabel(SRS_DAYS[i])}</small></div>`).join("")}</div>
      <p class="muted-p">„Wiem” przenosi słówko do następnego pudełka, „Trudne” zostawia w tym samym, „Nie wiem” cofa do pudełka 1. W pudełkach 5–6 są słówka, które znasz już dobrze (${boxes[4] + boxes[5]}).</p>` : ""}
      ${q.decks.length ? `<h2 class="section-title">Skąd są słówka</h2>
      <p class="muted-p">Słownictwo lekcji dochodzi, gdy lekcja jest przerobiona. Dział słownictwa – gdy zaczniesz go ćwiczyć fiszkami albo oznaczysz w nim słówko jako znane (<a href="#/vocab">${icon("book")} Słownictwo</a>). Słówko, które powtarza się w kilku miejscach, uczysz się tylko raz. W czytankach możesz dodać do fiszek pojedyncze słowa (kliknij słowo → „Dodaj do fiszek”).</p>
      <div class="card wd-decks">${q.decks.map((d) => `<a class="wd-deck" href="${d.href}"><span class="wd-deck-t">${d.level ? badge(d.level) + " " : ""}${esc(d.title)}</span><span class="muted">${deckCount(d)}</span></a>`).join("")}</div>` : ""}`;
}
export const wordsView = () => ({ html: renderWords(), title: `Słówka na dziś – ${SITE_TITLE}`, mount: () => { bindWords(); } });
function renderWords() {
  const q = srsToday();
  const head = `<div class="hero"><h1>${icon("cards")} Słówka na dziś</h1><p>Codzienna porcja fiszek: słówka do powtórki i kilka nowych. Oceniaj szczerze: <b>Nie wiem</b> – słówko wróci jutro, <b>Trudne</b> – wróci po tym samym czasie co ostatnio, <b>Wiem</b> – wróci później: po 3, 7, 14, 30, a potem co 60 dni. Tak powtarzasz słówko wtedy, gdy zaczyna Ci uciekać z pamięci.</p></div>`;
  if (!q.decks.length && !srsEntries().length) return `<div class="page">${head}<div class="card empty m-empty"><b>Na razie nie masz słówek do nauki.</b><p>Słówka z lekcji pojawią się tu, gdy oznaczysz lekcję jako przerobioną (albo zdasz jej szybki sprawdzian). Słówka z działów – gdy zaczniesz ćwiczyć dział fiszkami.</p><p><a class="btn primary" href="#/kolejnosc">${icon("compass")} Kolejność nauki</a> <a class="btn" href="#/vocab">${icon("book")} Słownictwo</a></p></div></div>`;
  return `<div class="page words">${head}
      <div id="wToday">${wTodayHtml(q)}</div>
      <div id="wBox"></div>
      <div id="wInfo">${wInfoHtml(q)}</div>
    </div>`;
}
function bindWords() {
  const page = $(".page.words"); if (!page) return;
  const refresh = () => { const q = srsToday(); $("#wToday").innerHTML = wTodayHtml(q); $("#wInfo").innerHTML = wInfoHtml(q); syncTodayCounts(); };
  const run = () => {
    const q = srsToday(), box = $("#wBox");
    const cards = [...shuffle(q.due).map((k) => wordCard(k, state.srs[k].deck)), ...q.fresh.map((f) => wordCard(f.k, f.deck))].slice(0, SRS_ROUND);
    if (!cards.length) { box.innerHTML = ""; refresh(); return; }
    $("#wToday").hidden = true;
    box.innerHTML = `<section class="block wd-session"><h2>Runda: ${slowek(cards.length)}</h2><div class="wd-pane"></div></section>`;
    const pane = box.querySelector(".wd-pane");
    flashcards(pane, cards, {
      onRate: (c, r) => {
        rateWord(c.k, r, c.deck);
        const en = stripTags(c.w.en); // „znam” w talii, z której jest karta – tak samo jak w fiszkach działu
        if (r === 2) knownSet(c.deck)[en] = 1; else if (r === 0 && state.known[c.deck]) delete state.known[c.deck][en];
        save(); syncTodayCounts();
      },
      onEnd: (st) => {
        const left = wordsDue();
        pane.innerHTML = `<div class="card fc-done"><b>Runda skończona! 🎉</b><p>${fcStatsHtml(st)}</p>
            ${left ? `<button class="btn primary wd-more">Następna runda (zostało: ${left}) →</button>` : `<p class="wd-all">${icon("check")} Na dziś wszystko powtórzone. Wróć jutro!</p>`}</div>`;
        const more = pane.querySelector(".wd-more"); if (more) more.onclick = () => { run(); box.scrollIntoView(); };
        $("#wToday").hidden = false; refresh();
      },
    });
    box.scrollIntoView();
  };
  page.addEventListener("click", (e) => {
    const n = e.target.closest("[data-wnew]");
    if (n) { state.srsNew = +n.dataset.wnew; store.set("srsNew", state.srsNew); refresh(); return; }
    if (e.target.closest("[data-wrun]")) run();
  });
}
// Kafelek „Dziś do powtórki” (strona główna; wiersz ze słówkami także na stronie Słownictwo).
export function wordsRow(q) {
  const txt = wordsTodayTxt(q), started = q.decks.length || srsEntries().length;
  return `<a class="tw-row" href="#/slowka"><span>${icon("cards")} Słówka: ${txt ? `<b>${txt}</b>` : started ? "na dziś wszystko powtórzone " + icon("check") : "codzienne fiszki z powtórkami – zacznij ćwiczyć dowolny dział fiszkami"}</span><span class="btn small ${txt ? "primary" : ""}">${txt ? "Ucz się" : "Zobacz"} →</span></a>`;
}
export function todayWidget() {
  const all = mistakeList(), q = srsToday(), rows = [];
  if (q.decks.length || srsEntries().length) rows.push(wordsRow(q));
  if (all.length) {
    const n = all.filter((x) => isDue(x.m)).length;
    rows.push(`<a class="tw-row" href="#/bledy"><span>${icon("repeat")} Moje błędy: ${n ? `<b>${zadan(n)}</b> na dziś` : "na dziś wszystko powtórzone " + icon("check")} (razem na liście: ${all.length})</span><span class="btn small ${n ? "primary" : ""}">${n ? "Powtórz" : "Zobacz"} →</span></a>`);
  }
  if (!rows.length) return "";
  return `<div class="card today-widget"><span class="f-ico">${icon("calendar")}</span><div class="tw-body"><b>Dziś do powtórki</b>${rows.join("")}</div></div>`;
}

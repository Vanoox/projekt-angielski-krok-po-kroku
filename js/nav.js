// Menu boczne: szybkie linki, lekcje wg kategorii z filtrem poziomów, znaczniki przerobionych i zaczętych lekcji.
import { LEVELS, esc } from "./util.js";
import { icon } from "./icons.js";
import { CATEGORIES, $, badge, currentLessonId, closestEl } from "./ui.js";
import { PATH } from "./data.js";
import { state, save } from "./state.js";
import { syncTodayCounts } from "./due.js";
import { syncGoalMini } from "./goal.js";

// ---------- Sidebar ----------
export function renderLevelFilter() {
  $("#levelFilter").innerHTML =
    `<button class="chip ${state.levels.length === 4 ? "active" : ""}" data-all aria-pressed="${state.levels.length === 4}">Wszystkie</button>` +
    LEVELS.map((l) => { const on = state.levels.length < 4 && state.levels.includes(l); return `<button class="chip ${on ? "active" : ""}" data-level="${l}" aria-pressed="${on}" title="Poziom ${l}">${l}</button>`; }).join("");
}
// Stan lekcji w menu: przerobiona (state.done) / zaczęta (jakiś wynik w state.scores) / nie zaczęta.
/** @param {string} id */
export const lessonStarted = (id) => Object.keys(state.scores).some((k) => k === id || k.startsWith(id + "::"));
/** @param {string} id */
const navMark = (id) => state.done[id] ? `<span class="nav-mark is-done" title="Przerobione">${icon("check")}</span>`
  : lessonStarted(id) ? `<span class="nav-mark is-started" title="Zaczęte – są wyniki zadań"></span>`
  : `<span class="nav-mark"></span>`;
// Odświeża znaczniki i liczniki „3/6” w gotowym menu – bez przebudowy i bez przewijania strony.
export function syncNavState() {
  const nav = $("#nav"); if (!nav) return;
  /** @type {NodeListOf<HTMLElement>} */ (nav.querySelectorAll(".nav-item[data-lesson]")).forEach((a) => { $(".nav-mark", a).outerHTML = navMark(String(a.dataset.lesson)); });
  nav.querySelectorAll(".nav-group[data-cat]").forEach((g) => {
    const ids = [.../** @type {NodeListOf<HTMLElement>} */ (g.querySelectorAll(".nav-item[data-lesson]"))].map((a) => String(a.dataset.lesson));
    const d = ids.filter((id) => state.done[id]).length, c = $(".nav-group-count", g);
    c.textContent = `${d}/${ids.length}`; c.title = `Przerobione: ${d} z ${ids.length}`;
    c.classList.toggle("is-full", d === ids.length);
  });
}
export function renderNav() {
  const cur = currentLessonId();
  const h = location.hash;
  const quick = `<div class="nav-group nav-quick">
      <a class="nav-item ${h.startsWith("#/kolejnosc") ? "active" : ""}" href="#/kolejnosc"><span class="nav-ico">${icon("compass")}</span><span class="nav-title">Kolejność nauki</span></a>
      <a class="nav-item ${h.startsWith("#/vocab") ? "active" : ""}" href="#/vocab"><span class="nav-ico">${icon("book")}</span><span class="nav-title">Słownictwo</span></a>
      <a class="nav-item ${h.startsWith("#/slowka") ? "active" : ""}" href="#/slowka"><span class="nav-ico">${icon("cards")}</span><span class="nav-title">Słówka na dziś</span><span class="wd-count nav-count" title="Na dziś" hidden></span></a>
      <a class="nav-item ${h.startsWith("#/czytanki") ? "active" : ""}" href="#/czytanki"><span class="nav-ico">${icon("book-open")}</span><span class="nav-title">Czytanki</span></a>
      <a class="nav-item ${h.startsWith("#/dialogi") ? "active" : ""}" href="#/dialogi"><span class="nav-ico">${icon("chat")}</span><span class="nav-title">Dialogi</span></a>
      <a class="nav-item ${h.startsWith("#/rozmowy") ? "active" : ""}" href="#/rozmowy"><span class="nav-ico">${icon("messages")}</span><span class="nav-title">Rozmowy</span></a>
      <a class="nav-item ${h.startsWith("#/tests") ? "active" : ""}" href="#/tests"><span class="nav-ico">${icon("test")}</span><span class="nav-title">Testy – pisanie zdań</span></a>
      <a class="nav-item ${h.startsWith("#/odmiana") ? "active" : ""}" href="#/odmiana"><span class="nav-ico">${icon("layers")}</span><span class="nav-title">Odmiana czasownika</span></a>
      <a class="nav-item ${h.startsWith("#/czasy") ? "active" : ""}" href="#/czasy"><span class="nav-ico">${icon("timeline")}</span><span class="nav-title">Oś czasów</span></a>
      <a class="nav-item ${h.startsWith("#/practice") ? "active" : ""}" href="#/practice"><span class="nav-ico">${icon("target")}</span><span class="nav-title">Trening mieszany</span></a>
      <a class="nav-item ${h.startsWith("#/bledy") ? "active" : ""}" href="#/bledy"><span class="nav-ico">${icon("repeat")}</span><span class="nav-title">Moje błędy</span><span class="m-count nav-count" title="Na dziś" hidden></span></a>
      <a class="nav-item nav-goal goal-mini" href="#/kolejnosc/cel"><span class="nav-ico gt-ring"></span><span class="nav-title">Cel na dziś</span><span class="gt-txt"></span></a>
    </div>`;
  const groups = CATEGORIES.map((c) => {
    const items = PATH.filter((l) => l.category === c && state.levels.includes(l.level))
      .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
    if (!items.length) return "";
    return `<div class="nav-group" data-cat="${esc(c)}"><div class="nav-group-title"><span>${esc(c)}</span><span class="nav-group-count"></span></div>` +
      items.map((l) => `<a class="nav-item ${l.id === cur ? "active" : ""}" href="#/lesson/${l.id}" data-lesson="${l.id}">
          ${badge(l.level)}<span class="nav-title">${esc(l.title)}</span>${navMark(l.id)}</a>`).join("") +
      `</div>`;
  }).join("");
  $("#nav").innerHTML = quick + (groups || `<div class="nav-empty">Brak lekcji dla wybranych poziomów.</div>`);
  syncNavState();
  syncGoalMini();
  const active = $("#nav .nav-item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
  syncTodayCounts();
}
// Filtr poziomów i otwieranie menu na telefonie.
$("#levelFilter").addEventListener("click", (e) => {
  const b = closestEl(e, ".chip"); if (!b) return;
  const lv = String(b.dataset.level);
  if (b.hasAttribute("data-all")) state.levels = LEVELS.slice();
  else if (state.levels.length === 4) state.levels = [lv];
  else {
    state.levels = state.levels.includes(lv) ? state.levels.filter((x) => x !== lv) : state.levels.concat(lv);
    if (!state.levels.length) state.levels = LEVELS.slice();
  }
  save(); renderLevelFilter(); renderNav();
});
$("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
$("#backdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));

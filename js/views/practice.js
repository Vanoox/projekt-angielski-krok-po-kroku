// Widok #/practice – trening mieszany (losowe zadania z wybranych poziomów i kategorii); ustawienia wspólne z testami.
import { LEVELS, esc } from "../util.js";
import { icon } from "../icons.js";
import { CATEGORIES, $, SITE_TITLE, shuffle } from "../ui.js";
import { PATH, lessonNo, DIALOGUES, withTask } from "../data.js";
import { reachIdx } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { fePairs, feRound, feIntro, dictIntro } from "../drills.js";
import { dlgOpen } from "./dialogues.js";
import { dlgTaskHtml } from "./mistakes.js";

// ---------- Trening mieszany ----------
let practiceCfg = { levels: LEVELS.slice(), cats: [], count: 15, src: "all" };
export const lessonPool = (cfg, filterFn) => PATH.filter((l) => cfg.levels.includes(l.level) && (!cfg.cats.length || cfg.cats.includes(l.category)));
export function setupHtml(cfg, counts, extra) {
  return `<div class="card practice-setup">
        <div><h3>Poziomy</h3><div class="chips" data-f="levels">${LEVELS.map((l) => `<button class="chip ${cfg.levels.includes(l) ? "active" : ""}" data-v="${l}">${l}</button>`).join("")}</div></div>
        <div><h3>Kategorie <span style="text-transform:none;font-weight:400">(nic nie zaznaczone = wszystkie)</span></h3><div class="chips" data-f="cats">${CATEGORIES.filter((c) => PATH.some((l) => l.category === c)).map((c) => `<button class="chip ${cfg.cats.includes(c) ? "active" : ""}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>
        ${extra || ""}
        <div><h3>Liczba pytań</h3><div class="chips" data-f="count">${counts.map((n) => `<button class="chip ${cfg.count === n ? "active" : ""}" data-v="${n}">${n}</button>`).join("")}</div></div>
        <div><button class="btn primary" id="pStart">Losuj pytania →</button> <span id="pInfo" class="muted" style="margin-left:8px"></span></div>
      </div>`;
}
export function bindSetup(cfg, pool, start) {
  const info = () => { $("#pInfo").textContent = `Dostępnych pytań: ${pool().length}` + (REACH_SRC.has(cfg.src) ? ` (${reachLabel()})` : ""); };
  document.querySelectorAll(".practice-setup .chips").forEach((box) => box.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    const f = box.dataset.f, v = b.dataset.v;
    if (f === "count" || f === "src") { cfg[f] = f === "count" ? +v : v; box.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b)); }
    else { cfg[f] = cfg[f].includes(v) ? cfg[f].filter((x) => x !== v) : cfg[f].concat(v); b.classList.toggle("active"); }
    info();
  }));
  $("#pStart").addEventListener("click", start);
  info();
}
const SRC = { all: "Wszystkie", choice: "Wybór i luki", write: "Pisanie zdań", order: "Układanie zdań", dictation: icon("headphones") + " Dyktando", finderr: icon("search") + " Znajdź błąd" };
// Dyktando i „Znajdź błąd” w treningu: tylko lekcje do bieżącej włącznie (pierwsza nieprzerobiona na ścieżce) – żeby nie dawać zdań z gramatyką, której jeszcze nie było.
const REACH_SRC = new Set(["dictation", "finderr"]);
const reachLabel = () => reachIdx() ? `lekcje 1–${reachIdx() + 1}` : "lekcja 1";
export const practiceView = () => ({ html: renderPractice(), title: `Trening – ${SITE_TITLE}`, mount: () => { bindPractice(); } });
function renderPractice() {
  return `<div class="page">
      <div class="hero"><h1>${icon("target")} Trening mieszany</h1><p>Losowe zadania z wielu lekcji (sprawdzane od razu) – dobry sposób, żeby sprawdzić, czy umiesz rozpoznać właściwą konstrukcję, gdy nie wiesz, z jakiej lekcji jest zadanie.</p></div>
      ${setupHtml(practiceCfg, [10, 15, 25, 40], `<div><h3>Rodzaj zadań</h3><div class="chips" data-f="src">${Object.entries(SRC).map(([k, v]) => `<button class="chip ${practiceCfg.src === k ? "active" : ""}" data-v="${k}">${v}</button>`).join("")}</div></div>`)}
      <div id="pBox"></div>
    </div>`;
}
function bindPractice() {
  const reachable = () => lessonPool(practiceCfg).filter((l) => PATH.indexOf(l) <= reachIdx());
  // Dla „Znajdź błąd” pula to pary (każda da zdanie z błędem albo bez – feRound).
  // Dyktando: zdania z przykładów lekcji + kwestie z odblokowanych dialogów (after w tej samej puli lekcji).
  const dlgDict = (ls) => { const set = new Set(ls); return DIALOGUES.filter((d) => set.has(d.lesson) && dlgOpen(d)).flatMap((d) => d.dict.map((ex) => ({ ex: withTask(ex, dlgTaskHtml(d, ex)), lesson: d.lesson }))); };
  const pool = () => practiceCfg.src === "dictation" ? [...reachable().flatMap((l) => l.dict.map((ex) => ({ ex, lesson: l }))), ...dlgDict(reachable())]
    : practiceCfg.src === "finderr" ? fePairs(reachable())
    : lessonPool(practiceCfg).flatMap((l) => [
    ...(l.exercises || []).map((ex) => ({ ex, lesson: l })),
    ...l.practice.flatMap((p) => (p.items || []).map((ex) => ({ ex: withTask(ex, ex.task || p.instruction), lesson: l }))),
  ]).filter(({ ex }) => practiceCfg.src === "all" || (practiceCfg.src === "choice" ? ["choice", "gap"].includes(ex.type) : ex.type === practiceCfg.src));
  const start = () => {
    const fe = practiceCfg.src === "finderr";
    const items = fe ? feRound(pool(), practiceCfg.count) : shuffle(pool()).slice(0, practiceCfg.count);
    const box = $("#pBox");
    const dict = practiceCfg.src === "dictation", cur = PATH[reachIdx()];
    if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.${dict || fe ? ` ${dict ? "Dyktando" : "„Znajdź błąd”"} obejmuje lekcje do bieżącej włącznie (teraz: ${lessonNo(cur)}. ${esc(cur.title)}).` : ""}</div>`; return; }
    box.innerHTML = exercisesShell("Pytania", { retryLabel: "Nowe losowanie" });
    const nDlg = dict ? dlgDict(reachable()).length : 0;
    const reachNote = ` Zdania z lekcji do bieżącej włącznie (${reachLabel()}, teraz: <a href="#/lesson/${cur.id}">${esc(cur.title)}</a>)${nDlg ? ` i kwestie z odblokowanych <a href="#/dialogi">dialogów</a> (${nDlg})` : ""}.`;
    if (dict) box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", dictIntro(reachNote));
    if (fe) box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", feIntro(reachNote));
    renderExercises(box.firstElementChild, items, { showSource: true });
    box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
    box.scrollIntoView();
  };
  bindSetup(practiceCfg, pool, start);
}

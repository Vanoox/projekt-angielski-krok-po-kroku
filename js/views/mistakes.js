// Widok #/bledy – „Moje błędy”: powtórki zadań z błędami w pudełkach.
import { esc, stripTags, LEVELS } from "../util.js";
import { today, DAY } from "../dates.js";
import { isDue, BOX_DAYS } from "../srs.js";
import { icon } from "../icons.js";
import { TYPE_LABEL, $, SITE_TITLE, badge, shuffle, zadan } from "../ui.js";
import { PATH, BY_ID, lessonNo, withTask } from "../data.js";
import { mistakeList, onTodayCounts } from "../due.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { route } from "../router.js";

// ---------- Moje błędy (#/bledy) ----------
const SESSION_MAX = 20;
let mistakesCfg = { level: "", lesson: "" };
const srcLabel = (x) => x.src === "e" ? "szybki sprawdzian" : x.src === "t" ? "test" : x.src === "d" ? "przykłady z lekcji" : x.src === "f" ? "typowe błędy z lekcji" : x.src === "o" ? "trener odmiany" : x.src === "r" ? `czytanka „${esc(x.reading.title)}”` : x.src === "g" ? `dialog „${esc(x.dialogue.title)}”` : esc(stripTags((x.lesson.practice[+x.src.slice(1)] || {}).title || "ćwiczenia"));
export const dueLabel = (m) => {
  const d = Math.round((Date.parse(m.due) - Date.parse(today())) / DAY);
  return d <= 0 ? "<b>na dziś</b>" : d === 1 ? "jutro" : `za ${d} dni`;
};
const filteredMistakes = () => mistakeList().filter((x) => (!mistakesCfg.level || x.lesson.level === mistakesCfg.level) && (!mistakesCfg.lesson || x.lesson.id === mistakesCfg.lesson));
// Pytanie do dialogu / zdanie z dialogu do dyktanda – polecenie z linkiem do dialogu (można go odsłuchać jeszcze raz).
export const dlgTaskHtml = (d, ex) => `${ex.type === "dictation" ? "Zdanie z dialogu" : "Pytanie do dialogu"} <a href="#/dialogi/${d.id}">„${esc(d.title)}”</a> (${esc(d.titlePl)})`;
// Pytanie do czytanki poza tekstem: polecenie z linkiem do czytanki (tekst otwiera się w tej samej karcie).
const rdTaskHtml = (r) => `Pytanie do czytanki <a href="#/czytanki/${r.id}">„${esc(r.title)}”</a> (${esc(r.titlePl)})`;
const sessionItems = (list) => shuffle(list).slice(0, SESSION_MAX).map((x) => ({ ex: x.src[0] === "p" ? withTask(x.ex, x.ex.task || x.instr) : x.src === "r" ? withTask(x.ex, rdTaskHtml(x.reading)) : x.src === "g" ? withTask(x.ex, dlgTaskHtml(x.dialogue, x.ex)) : x.ex, lesson: x.lesson }));
onTodayCounts(() => {
  const tEl = $("#mToday"), lEl = $("#mList"); // na stronie „Moje błędy” – stan na bieżąco w trakcie powtórki
  if (tEl && lEl) { const xs = filteredMistakes(); tEl.innerHTML = mTodayHtml(xs); lEl.innerHTML = mListHtml(xs); }
});
function mTodayHtml(list) {
  const due = list.filter((x) => isDue(x.m));
  if (due.length) return `<div class="card m-today"><div><b>Na dziś: ${zadan(due.length)}</b><span>${due.length > SESSION_MAX ? `Po ${SESSION_MAX} w jednej rundzie.` : "Zadania sprawdzają się od razu."}</span></div><button class="btn primary" data-mrun="due">Powtórz →</button></div>`;
  const next = list.map((x) => x.m.due).sort()[0];
  return `<div class="card m-today"><div><b>Na dziś wszystko powtórzone ${icon("check")}</b><span>${next ? `Następna powtórka: ${dueLabel({ due: next })}. Możesz też poćwiczyć wcześniej (przyciski „Ćwicz teraz” poniżej) – wtedy dobra odpowiedź nie przesuwa zadania dalej.` : ""}</span></div></div>`;
}
function mListHtml(list) {
  const by = new Map();
  list.forEach((x) => { if (!by.has(x.lesson)) by.set(x.lesson, []); by.get(x.lesson).push(x); });
  if (!list.length) return "";
  return `<h2 class="section-title">Wszystkie zadania z błędami (${list.length})</h2>` + [...by].sort((a, b) => PATH.indexOf(a[0]) - PATH.indexOf(b[0])).map(([l, xs]) => {
    const nDue = xs.filter((x) => isDue(x.m)).length;
    xs.sort((a, b) => a.m.due.localeCompare(b.m.due) || b.m.wrong - a.m.wrong);
    return `<div class="card m-group">
        <div class="m-head"><div class="m-title"><a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a> ${badge(l.level)}<span class="muted">${xs.length} zad.${nDue ? ` · ${nDue} na dziś` : ""}</span></div>
          <div class="m-actions"><button class="btn small" data-mrun="${l.id}">Ćwicz teraz</button><a class="btn small" href="#/lesson/${l.id}" title="Teoria i ćwiczenia z tej lekcji">Powtórz lekcję →</a></div></div>
        <ul class="m-list">${xs.map((x) => { const q = x.ex.type === "dictation" ? stripTags(x.ex.pl || "Zapisz zdanie ze słuchu.") : (x.src === "o" ? stripTags(x.ex.task) + ": " : "") + stripTags(x.ex.q || "Ułóż zdanie z wyrazów."); return `<li><span class="m-q">${x.ex.type === "dictation" ? icon("headphones") + " " : x.ex.type === "finderr" ? icon("search") + " " : ""}${esc(q.length > 160 ? q.slice(0, 157) + "…" : q)}</span>
          <span class="m-meta">${srcLabel(x)} · ${TYPE_LABEL[x.ex.type]} · pudełko ${x.m.box}/${BOX_DAYS.length} · powtórka ${dueLabel(x.m)}${x.m.wrong > 1 ? ` · błędy: ${x.m.wrong}` : ""}</span></li>`; }).join("")}</ul>
      </div>`;
  }).join("");
}
export const mistakesView = () => ({ html: renderMistakes(), title: `Moje błędy – ${SITE_TITLE}`, mount: () => { bindMistakes(); } });
function renderMistakes() {
  const all = mistakeList();
  const head = `<div class="hero"><h1>${icon("repeat")} Moje błędy</h1><p>Tu wracają zadania, w których się pomylisz – w lekcjach, ćwiczeniach, testach, treningu i sprawdzianach. Zadanie z błędem wraca następnego dnia, a po każdej dobrej odpowiedzi coraz rzadziej: po 3, 7 i 14 dniach. Czwarta dobra odpowiedź z rzędu – zadanie znika z listy. Nowy błąd – zadanie wraca na początek.</p></div>`;
  if (!all.length) return `<div class="page">${head}<div class="card empty m-empty"><b>Nie masz żadnych zadań do powtórki.</b><p>Rozwiązuj ćwiczenia i testy – zadania z błędami same się tu pojawią.</p><p><a class="btn primary" href="#/kolejnosc">${icon("compass")} Kolejność nauki</a></p></div></div>`;
  const levels = LEVELS.filter((lv) => all.some((x) => x.lesson.level === lv));
  if (mistakesCfg.level && !levels.includes(mistakesCfg.level)) mistakesCfg.level = "";
  const lessons = PATH.filter((l) => all.some((x) => x.lesson === l) && (!mistakesCfg.level || l.level === mistakesCfg.level));
  if (mistakesCfg.lesson && !lessons.some((l) => l.id === mistakesCfg.lesson)) mistakesCfg.lesson = "";
  const list = filteredMistakes();
  return `<div class="page mistakes">${head}
      <div class="card m-filter">
        <div class="chips" data-mf="level"><button class="chip ${!mistakesCfg.level ? "active" : ""}" data-v="">Wszystkie poziomy</button>${levels.map((lv) => `<button class="chip ${mistakesCfg.level === lv ? "active" : ""}" data-v="${lv}">${lv}</button>`).join("")}</div>
        <label class="m-select"><span>Lekcja:</span><select id="mLesson"><option value="">wszystkie (${lessons.length})</option>${lessons.map((l) => `<option value="${l.id}" ${mistakesCfg.lesson === l.id ? "selected" : ""}>${lessonNo(l)}. ${esc(l.title)}</option>`).join("")}</select></label>
      </div>
      <div id="mToday">${mTodayHtml(list)}</div>
      <div id="mBox"></div>
      <div id="mList">${mListHtml(list)}</div>
    </div>`;
}
function bindMistakes() {
  const page = $(".page.mistakes"); if (!page) return;
  const refresh = () => { const list = filteredMistakes(); $("#mToday").innerHTML = mTodayHtml(list); $("#mList").innerHTML = mListHtml(list); };
  page.querySelector(".m-filter .chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    mistakesCfg.level = b.dataset.v; route();
  });
  $("#mLesson").addEventListener("change", (e) => { mistakesCfg.lesson = e.target.value; route(); });
  // „due” = zadania na dziś (z filtrem), id lekcji = wszystkie błędy z tej lekcji (także przed terminem).
  const start = (what) => {
    const pick = () => filteredMistakes().filter((x) => what === "due" ? isDue(x.m) : x.lesson.id === what);
    const box = $("#mBox");
    const run = () => {
      const items = sessionItems(pick());
      if (!items.length) { box.innerHTML = `<div class="card m-done">${icon("check")} Wszystko powtórzone.</div>`; refresh(); return; }
      box.innerHTML = exercisesShell(what === "due" ? "Powtórka na dziś" : `Ćwiczenie: ${esc(BY_ID[what].title)}`, { retryLabel: what === "due" ? "Następna runda" : "Jeszcze raz" });
      renderExercises(box.firstElementChild, items, { showSource: true, onDone: refresh });
      box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
    };
    run();
    box.scrollIntoView();
  };
  page.addEventListener("click", (e) => { const b = e.target.closest("[data-mrun]"); if (b) start(b.dataset.mrun); });
}

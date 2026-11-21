// Widok #/test-poziomu/<poziom> – test poziomu z raportem słabych tematów.
import { esc } from "../util.js";
import { icon } from "../icons.js";
import { LEVEL_INFO, $, SITE_TITLE, badge, shuffle, scorePill } from "../ui.js";
import { PATH, lessonNo } from "../data.js";
import { state, ltKey, ltPassed, ltBadge } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { pickTasks, reportHtml } from "./checkpoint.js";

// ---------- Test poziomu (#/test-poziomu/<poziom>) ----------
// 30 zadań ze wszystkich lekcji poziomu, po równo z każdej (pickTasks: głównie pisanie zdań, co szóste – układanie).
export const LT_SIZE = 30;
export const levelLessons = (lv) => PATH.filter((l) => l.level === lv);
export const levelTestView = (lv) => ({ html: renderLevelTest(lv), title: `Test poziomu ${lv} – ${SITE_TITLE}`, mount: () => { bindLevelTest(lv); } });
function renderLevelTest(lv) {
  const ls = levelLessons(lv);
  if (!ls.length) return `<div class="page empty"><h1>Nie znaleziono testu</h1><p><a href="#/tests">Wróć do testów</a></p></div>`;
  const s = state.scores[ltKey(lv)];
  const nDone = ls.filter((l) => state.done[l.id]).length;
  const last = ls[ls.length - 1], after = PATH[PATH.indexOf(last) + 1];
  return `<div class="page checkpoint" data-level="${lv}">
      <div class="crumbs" data-level="${lv}"><a href="#/kolejnosc">${icon("compass")} Kolejność nauki</a> · ${badge(lv)} <span>${LEVEL_INFO[lv].name}</span></div>
      <h1>${icon("test")} Test poziomu ${lv}</h1>
      <p class="summary">Sprawdza cały poziom ${lv} (${LEVEL_INFO[lv].name}): lekcje ${lessonNo(ls[0])}–${lessonNo(last)}. Zadania są wymieszane i nie widać, z której lekcji pochodzą. Po teście zobaczysz raport: które tematy idą dobrze, a które trzeba powtórzyć.</p>
      <div class="card test-intro">
        <p><b>${LT_SIZE} zadań</b>, po równo z każdej z ${ls.length} lekcji poziomu. Prawie wszystkie to <b>pisanie całych zdań</b> (tłumaczenie, przekształcanie, poprawianie błędów), kilka to układanie zdań z wyrazów. Wynik i poprawki zobaczysz po kliknięciu „Zakończ i sprawdź”. Zaliczenie od <b>80%</b> – dostajesz wtedy odznakę ${icon("medal")} przy poziomie w <a href="#/kolejnosc">kolejności nauki</a>. Każde podejście losuje nowe zadania.</p>
        ${nDone < ls.length ? `<p class="callout warning">Przerobione lekcje tego poziomu: ${nDone} z ${ls.length}. Test obejmuje wszystkie – możesz pisać od razu (np. żeby sprawdzić, co już umiesz), ale najlepiej po przerobieniu całego poziomu.</p>` : ""}
        ${s ? `<p>Twój najlepszy wynik: ${scorePill(s)}${ltPassed(lv) ? ` – <b>zaliczone ${icon("check")}</b> ${ltBadge(lv)}` : ""}</p>` : ""}
      </div>
      <div id="cpBox" class="cp-run">${exercisesShell("Zadania", { h3: true, retryLabel: "Nowe losowanie" })}</div>
      <div id="cpReport"></div>
      <div class="pager">
        <a class="card prev" href="#/lesson/${last.id}"><small>← Ostatnia lekcja poziomu</small>${esc(last.title)} ${badge(last.level)}</a>
        ${after ? `<a class="card next" href="#/lesson/${after.id}"><small>Następny poziom →</small>${badge(after.level)} ${esc(after.title)}</a>` : `<a class="card next" href="#/tests"><small>Dalej →</small>${icon("test")} Testy</a>`}
      </div>
    </div>`;
}
function bindLevelTest(lv) {
  const ls = levelLessons(lv); if (!ls.length) return;
  const box = $("#cpBox").firstElementChild;
  const after = PATH[PATH.indexOf(ls[ls.length - 1]) + 1];
  const run = () => {
    const items = shuffle(pickTasks(ls, LT_SIZE));
    $("#cpReport").innerHTML = "";
    renderExercises(box, items, {
      key: ltKey(lv), mode: "deferred", showSource: true,
      onDone: (correct, total, ctls) => {
        $("#cpReport").innerHTML = reportHtml(items, ctls, correct, total, {
          noun: `Test poziomu ${lv}`,
          after: after && { href: `#/lesson/${after.id}`, label: `Dalej: poziom ${after.level} – ${after.title}` },
        });
      },
    });
  };
  run();
  box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
}

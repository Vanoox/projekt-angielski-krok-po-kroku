// Widok #/tests – testy pisania zdań (sprawdzanie na końcu), sprawdziany powtórkowe i testy poziomu.
import { LEVELS, esc } from "../util.js";
import { icon } from "../icons.js";
import { $, SITE_TITLE, badge, shuffle, scorePill } from "../ui.js";
import { PATH, CHECKPOINTS } from "../data.js";
import { state, cpKey, cpPassed, cpRange, ltKey, ltPassed } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { lessonPool, setupHtml, bindSetup } from "./practice.js";
import { cpSize } from "./checkpoint.js";
import { LT_SIZE, levelLessons } from "./level-test.js";

// ---------- Testy (pisanie zdań, sprawdzanie na końcu) ----------
let testCfg = { levels: LEVELS.slice(), cats: [], count: 20 };
export const testsView = () => ({ html: renderTests(), title: `Testy – ${SITE_TITLE}`, mount: () => { bindTests(); } });
function renderTests() {
  const perLevel = LEVELS.map((lv) => ({ lv, n: levelLessons(lv).length }));
  return `<div class="page">
      <div class="hero"><h1>${icon("test")} Testy</h1><p>Test składa się głównie z zadań, w których <b>samodzielnie piszesz całe zdania</b>: tłumaczenie z polskiego, przekształcanie (np. na stronę bierną, mowę zależną), poprawianie błędów i układanie zdań. Wynik zobaczysz dopiero na końcu – jak na prawdziwym sprawdzianie.</p></div>
      <div class="level-test-row">${perLevel.filter((x) => x.n).map((x) => `<a class="card level-test" data-level="${x.lv}" href="#/test-poziomu/${x.lv}">${badge(x.lv)} <b>Test poziomu ${x.lv}</b><span>${LT_SIZE} zadań ze wszystkich ${x.n} lekcji, z raportem tematów</span><span class="lt-score">${scorePill(state.scores[ltKey(x.lv)])}${ltPassed(x.lv) ? " " + icon("medal") : ""}</span></a>`).join("")}</div>
      ${CHECKPOINTS.length ? `<h2 class="section-title">${icon("flag")} Sprawdziany powtórkowe</h2>
      <p class="muted-p">Co kilka lekcji: zadania z ostatniego bloku lekcji i trochę z wcześniejszych, głównie pisanie całych zdań. Stoją też w <a href="#/kolejnosc">kolejności nauki</a>.</p>
      <div class="results-list">${CHECKPOINTS.map((c) => { const { cur, rev } = cpSize(c); return `<a class="card result-item test-link" href="#/sprawdzian/${c.id}"><h3>${badge(c.level)} Sprawdzian ${c.n}: ${esc(c.title)} <span class="muted" style="font-family:Inter;font-size:14px;font-weight:400">lekcje ${cpRange(c)} · ${cur + rev} zadań</span> ${scorePill(state.scores[cpKey(c)])}${cpPassed(c) ? " " + icon("check") : ""}</h3></a>`; }).join("")}</div>` : ""}
      <h2 class="section-title">Własny test</h2>
      ${setupHtml(testCfg, [10, 20, 30, 50])}
      <div id="pBox"></div>
      <h2 class="section-title">Testy z poszczególnych lekcji</h2>
      <div class="results-list">${PATH.filter((l) => l.test.length).map((l) => `<a class="card result-item test-link" href="#/lesson/${l.id}/test"><h3>${badge(l.level)} ${esc(l.title)} <span class="muted" style="font-family:Inter;font-size:14px;font-weight:400">${l.test.length} zadań</span> ${scorePill(state.scores[l.id + "::test"])}</h3></a>`).join("") || `<div class="empty">Brak testów.</div>`}</div>
    </div>`;
}
function bindTests() {
  const poolFor = (cfg) => lessonPool(cfg).flatMap((l) => l.test.map((ex) => ({ ex, lesson: l })));
  const start = () => {
    const items = shuffle(poolFor(testCfg)).slice(0, testCfg.count);
    const box = $("#pBox");
    if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.</div>`; return; }
    box.innerHTML = exercisesShell("Test", { retryLabel: "Nowy test" });
    renderExercises(box.firstElementChild, items, { showSource: true, mode: "deferred" });
    box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
    box.scrollIntoView();
  };
  bindSetup(testCfg, () => poolFor(testCfg), start);
}

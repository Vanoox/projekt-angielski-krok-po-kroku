// Widok #/ – strona główna „Twój dzień”: następny krok, seria, słówka i błędy na dziś, poziomy.
import { LEVELS, esc } from "../util.js";
import { today, shiftDay, dayDate } from "../dates.js";
import { dayTotal } from "../activity.js";
import { icon } from "../icons.js";
import { LEVEL_INFO, dni, SITE_TITLE, badge, plural } from "../ui.js";
import { PATH, BY_ID, VOCAB, vocabItems, allTasks } from "../data.js";
import { state, streakInfo, streakHint, nextStep } from "../state.js";
import { zadanISlowek, goalHtml } from "../goal.js";
import { lessonStarted } from "../nav.js";
import { backupReminder } from "../backup.js";
import { ankiCard } from "../vocab-view.js";
import { rdNewHtml } from "./reading.js";
import { levelLessons } from "./level-test.js";
import { todayWidget } from "./words.js";

// ---------- Strona główna ----------
// Dwa warianty: nowa osoba (brak jakiegokolwiek postępu) widzi stronę powitalną z dużym nagłówkiem i statystykami
// kursu; osoba, która już się uczy, na górze widzi „Twój dzień” (dayHtml), a opis kursu niżej, w mniejszej formie.
const hasProgress = () => Object.values(state.done).some(Boolean) || Object.keys(state.scores).length > 0
  || Object.keys(state.mistakes).length > 0 || Object.keys(state.srs).length > 0 || Object.keys(state.known).length > 0
  || Object.values(state.activity).some((e) => dayTotal(e) > 0);
const WEEKDAYS_SHORT = ["nd", "pn", "wt", "śr", "cz", "pt", "so"];
// Karta „Następny krok”: następna lekcja albo sprawdzian (nextStep) + postęp poziomu, na którym jest uczeń.
/** @param {ReturnType<typeof nextStep>} next @param {number} nDone */
function nextCardHtml(next, nDone) {
  const lv = /** @type {Level} */ (next ? (next.lesson || /** @type {Checkpoint} */ (next.cp).lessons[/** @type {Checkpoint} */ (next.cp).lessons.length - 1]).level : LEVELS.filter((x) => levelLessons(x).length).pop());
  const ls = levelLessons(lv), d = ls.filter((l) => state.done[l.id]).length;
  const started = next && next.lesson && lessonStarted(next.lesson.id);
  const label = !next ? "Wszystkie lekcje przerobione" : next.cp ? "Teraz sprawdzian powtórkowy" : started ? "Kontynuuj lekcję" : nDone ? "Następna lekcja" : "Pierwsza lekcja";
  const what = !next ? `<b class="nc-title">Gratulacje! ${icon("medal")}</b><span class="nc-pl">Utrwalaj wiedzę w treningu mieszanym, testach i powtórkach.</span>`
    : next.cp ? `<b class="nc-title">${icon("flag")} ${esc(next.title)}</b><span class="nc-pl">Zadania z ostatnich lekcji – głównie pisanie całych zdań.</span>`
    : `<b class="nc-title">${badge(lv)} ${esc(next.lesson.title)}</b>${next.lesson.titlePl ? `<span class="nc-pl">${esc(next.lesson.titlePl)}</span>` : ""}`;
  const btn = !next ? `<a class="btn primary" href="#/practice">Trenuj →</a>`
    : `<a class="btn primary" href="${next.href}">${next.cp ? "Rozwiąż sprawdzian" : started || nDone ? "Kontynuuj" : "Zacznij"} →</a>`;
  return `<section class="card next-card" aria-label="Następny krok">
      <div class="nc-top">
        <div class="nc-what"><span class="nc-label">${label}</span>${what}</div>
        ${btn}
      </div>
      <a class="nc-level" href="#/kolejnosc/lvl-${lv}">
        <span class="nc-level-txt"><span>${badge(lv)} ${LEVEL_INFO[lv].name}: <b>${d}/${ls.length}</b> ${plural(ls.length, "lekcja", "lekcje", "lekcji")}</span><span class="muted">cały kurs: ${nDone}/${PATH.length}</span></span>
        <span class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${ls.length}" aria-valuenow="${d}" aria-label="Postęp ${lv}"><i style="width:${ls.length ? Math.round((d / ls.length) * 100) : 0}%"></i></span>
      </a>
    </section>`;
}
// Karta serii: dni z rzędu (streakInfo) + ostatnie 7 dni jako kropki; pełny kalendarz jest w „Kolejności nauki”.
function streakCardHtml() {
  const s = streakInfo(), t = today();
  let active = 0;
  const week = [6, 5, 4, 3, 2, 1, 0].map((i) => {
    const k = shiftDay(t, -i), d = dayDate(k), n = dayTotal(state.activity[k]);
    if (n) active++;
    const date = d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
    return `<span class="dw-day${n ? " on" : ""}${i ? "" : " today"}" title="${date}: ${n ? `${n} ${zadanISlowek(n)}` : "bez nauki"}"><span class="dw-dot">${n ? icon("check") : ""}</span><span class="dw-lbl">${i ? WEEKDAYS_SHORT[d.getDay()] : "dziś"}</span></span>`;
  }).join("");
  return `<section class="card streak-card" aria-label="Seria dni nauki">
      <div class="act-stat act-streak${s.current ? " on" : ""}"><span class="act-ico" aria-hidden="true">${icon("flame")}</span><div><b>${dni(s.current)} z rzędu</b><span>najdłuższa seria: ${dni(s.best)}</span></div></div>
      <div class="dw" role="img" aria-label="Ostatnie 7 dni: nauka w ${active} z 7">${week}</div>
      <p class="act-hint">${streakHint(s)}</p>
      <a class="sc-link" href="#/kolejnosc/dziennik">Kalendarz nauki →</a>
    </section>`;
}
/** @param {ReturnType<typeof nextStep>} next @param {number} nDone */
function dayHtml(next, nDone) {
  const date = new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
  return `<section class="day" aria-labelledby="dayTitle">
      <div class="day-head"><h1 id="dayTitle">Twój dzień</h1><span class="day-date">${date}</span></div>
      ${nextCardHtml(next, nDone)}
      <div class="day-grid">${goalHtml()}${streakCardHtml()}</div>
      ${todayWidget()}
      ${rdNewHtml()}
    </section>`;
}
export const homeView = () => ({ html: renderHome(), title: SITE_TITLE });
function renderHome() {
  const nEx = PATH.reduce((s, l) => s + l.sections.filter((x) => x.type === "examples").reduce((a, x) => a + (x.items || []).length, 0), 0);
  const nTasks = PATH.reduce((s, l) => s + allTasks(l), 0);
  const nWords = VOCAB.reduce((s, t) => s + vocabItems(t).length, 0);
  const nDone = PATH.filter((l) => state.done[l.id]).length;
  const next = nextStep();
  const overview = BY_ID["tenses-overview"];
  if (!PATH.length) return `<div class="page empty"><h1>Brak lekcji</h1><p>Nie znaleziono plików z danymi w folderze <code>data/</code>.</p></div>`;
  const day = hasProgress();

  return `<div class="page${day ? " home-day" : ""}">
      ${day ? dayHtml(next, nDone) + backupReminder() : ""}
      <section class="hero${day ? " hero-small" : ""}">
        ${day ? `<h2>Gramatyka angielska od A1 do B2</h2>` : `<h1>Gramatyka angielska<br>od A1 do B2</h1>`}
        <p>Wszystkie najważniejsze tematy wyjaśnione po polsku: czasy, czasowniki modalne, tryby warunkowe, strona bierna i dużo więcej. Każda lekcja ma budowę, mnóstwo przykładów z tłumaczeniem, słownictwo, zestawy ćwiczeń i test z pisaniem całych zdań.</p>
        <div class="hero-actions">
          ${day ? "" : next ? `<a class="btn primary" href="${next.href}">${nDone ? "Kontynuuj" : "Zacznij od początku"}: ${next.cp ? icon("flag") + " " : ""}${esc(next.title)} →</a>` : `<a class="btn primary" href="#/practice">Wszystko przerobione! Trenuj →</a>`}
          <a class="btn" href="#/kolejnosc">${icon("compass")} Kolejność nauki (${nDone}/${PATH.length})</a>
          ${overview ? `<a class="btn" href="#/lesson/tenses-overview">${icon("map")} Przegląd wszystkich czasów</a>` : ""}
        </div>
      </section>
      ${day ? "" : todayWidget() + backupReminder()}
      <div class="stats">
        <div class="stat"><b>${PATH.length}</b><span>lekcji</span></div>
        <div class="stat"><b>${nEx}</b><span>przykładów zdań</span></div>
        <div class="stat"><b>${nTasks}</b><span>zadań i pytań testowych</span></div>
        <div class="stat"><b>${nWords}</b><span>słówek w ${VOCAB.length} działach</span></div>
      </div>
      <div class="feature-cards">
        <a class="card feature" href="#/vocab"><span class="f-ico">${icon("book")}</span><b>Słownictwo</b><span>Słówka tematyczne A1–B2: lista z wymową, fiszki i quizy.</span></a>
        <a class="card feature" href="#/tests"><span class="f-ico">${icon("test")}</span><b>Testy</b><span>Tłumaczenie i przekształcanie całych zdań – sprawdzanie na końcu.</span></a>
        <a class="card feature" href="#/practice"><span class="f-ico">${icon("target")}</span><b>Trening mieszany</b><span>Losowe zadania z wielu lekcji – czy rozpoznasz konstrukcję?</span></a>
        <a class="card feature" href="#/odmiana"><span class="f-ico">${icon("layers")}</span><b>Odmiana czasownika</b><span>Dowolny czasownik we wszystkich czasach i ćwiczenie „podaj formę”.</span></a>
        <a class="card feature" href="#/czytanki"><span class="f-ico">${icon("book-open")}</span><b>Czytanki</b><span>Krótkie teksty z pytaniami – kliknięte słowo pokazuje tłumaczenie.</span></a>
        <a class="card feature" href="#/dialogi"><span class="f-ico">${icon("chat")}</span><b>Dialogi</b><span>Scenki czytane dwoma głosami – posłuchaj i odpowiedz na pytania.</span></a>
        <a class="card feature" href="#/rozmowy"><span class="f-ico">${icon("messages")}</span><b>Rozmowy</b><span>Ty wybierasz, co powiesz – rozmowa toczy się zależnie od twoich odpowiedzi.</span></a>
        <a class="card feature" href="#/czasy"><span class="f-ico">${icon("timeline")}</span><b>Oś czasów</b><span>Wszystkie czasy na jednej osi: kiedy którego używamy.</span></a>
      </div>
      ${ankiCard()}
      <div class="level-cards">
        ${LEVELS.map((lv) => {
        const ls = PATH.filter((l) => l.level === lv);
        if (!ls.length) return "";
        const d = ls.filter((l) => state.done[l.id]).length;
        return `<div class="level-card" data-level="${lv}">
            <h2>${badge(lv)} ${LEVEL_INFO[lv].name}</h2>
            <p class="lvl-desc">${LEVEL_INFO[lv].desc}</p>
            <div class="progress-label">${d} z ${ls.length} przerobionych</div>
            <div class="progress"><i style="width:${(d / ls.length) * 100}%"></i></div>
            <ul class="lesson-list">${ls.map((l) => `<li><a href="#/lesson/${l.id}">
              ${state.done[l.id] ? `<span class="done-mark">${icon("check")}</span>` : ""}<span>${esc(l.title)}</span><span class="pl">${esc(l.titlePl)}</span></a></li>`).join("")}</ul>
          </div>`;
      }).join("")}
      </div>
      <h2 class="section-title">Jak korzystać</h2>
      <div class="howto">
        <div><b>1. Słówka i teoria</b>Zacznij od zakładki „Słownictwo” w lekcji, potem przeczytaj teorię. Kliknij ${icon("volume")}, żeby usłyszeć wymowę.</div>
        <div><b>2. Ćwiczenia</b>Zestawy od łatwych do trudnych: wybór, luki, układanie zdań, przekształcenia. Każde zadanie ma wyjaśnienie.</div>
        <div><b>3. Test</b>Na koniec napisz całe zdania sam(a). Wynik i poprawki zobaczysz po zakończeniu testu.</div>
      </div>
      <p class="muted-p backup-note">Postęp zapisuje się w tej przeglądarce. <a href="#/kolejnosc/kopia">${icon("save")} Pobierz albo wczytaj kopię postępu</a> – przyda się na innym urządzeniu.</p>
    </div>`;
}

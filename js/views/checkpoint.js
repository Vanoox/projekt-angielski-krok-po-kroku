// Widok #/sprawdzian/<id> – sprawdzian powtórkowy po bloku lekcji, raport z podziałem na lekcje.
import { esc } from "../util.js";
import { icon } from "../icons.js";
import { doneTick, $, SITE_TITLE, badge, shuffle, scorePill } from "../ui.js";
import { PATH, CHECKPOINTS, CP_BY_ID, lessonNo, withTask } from "../data.js";
import { state, cpKey, cpPassed, cpRange } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";

// ---------- Sprawdziany powtórkowe (#/sprawdzian/<id>) ----------
// Zadania: testy lekcji (pisanie i układanie zdań) + zadania „write” z ćwiczeń.
/** @param {Lesson} l @returns {Exercise[]} */
function cpTasks(l) {
  return [
    ...l.test.filter((ex) => ex.type === "write" || ex.type === "order"),
    ...l.practice.flatMap((p) => (p.items || []).filter((ex) => ex.type === "write").map((ex) => withTask(ex, ex.task || p.instruction))),
  ];
}
// Po kolei z każdej lekcji z listy (równy udział; lekcja może wystąpić kilka razy).
// Głównie pisanie całych zdań, co szóste zadanie – układanie zdania z wyrazów.
/** @param {Lesson[]} lessons @param {number} n @returns {{ ex: Exercise, lesson: Lesson }[]} */
export function pickTasks(lessons, n) {
  /** @type {Map<Lesson, { w: Exercise[], o: Exercise[] }>} */
  const pools = new Map();
  lessons.forEach((l) => { if (!pools.has(l)) { const t = cpTasks(l); pools.set(l, { w: shuffle(t.filter((e) => e.type === "write")), o: shuffle(t.filter((e) => e.type === "order")) }); } });
  const order = shuffle(lessons);
  /** @type {{ ex: Exercise, lesson: Lesson }[]} */
  const out = [];
  for (let k = 0; out.length < n && k < n * 10 && order.length; k++) {
    const l = order[k % order.length], p = /** @type {{ w: Exercise[], o: Exercise[] }} */ (pools.get(l));
    const ex = (out.length % 6 === 5 && p.o.pop()) || p.w.pop() || p.o.pop();
    if (ex) out.push({ ex, lesson: l });
  }
  return out;
}
// Lekcje do powtórki: bez powtórzeń, dopóki się da; niezaliczony (lub nierozwiązany) test lekcji = 2× większa szansa.
/** @param {Lesson[]} prior @param {number} n @returns {Lesson[]} */
function reviewLessons(prior, n) {
  /** @param {Lesson} l */
  const weight = (l) => { const s = state.scores[l.id + "::test"]; return s && s.correct / s.total >= 0.8 ? 1 : 2; };
  let bag = prior.flatMap((l) => Array(weight(l)).fill(l));
  /** @type {Lesson[]} */
  const out = [];
  while (out.length < n && prior.length) {
    if (!bag.length) bag = prior.slice();
    const l = bag[Math.floor(Math.random() * bag.length)];
    out.push(l); bag = bag.filter((x) => x !== l);
  }
  return out;
}
// Długość zależy od liczby lekcji w bloku: 5 zadań na lekcję (max 20) + ok. 40% powtórki (max 10).
/** @param {Checkpoint} c */
export function cpSize(c) {
  const cur = Math.min(5 * c.lessons.length, c.prior.length ? 20 : 25);
  const rev = c.prior.length ? Math.min(Math.round(cur * 0.6), 10) : 0;
  return { cur, rev };
}
/** @param {Checkpoint} c */
const buildCheckpoint = (c) => { const { cur, rev } = cpSize(c); return shuffle([...pickTasks(c.lessons, cur), ...pickTasks(reviewLessons(c.prior, rev), rev)]); };
/** @param {string} id @returns {View} */
export const checkpointView = (id) => ({ html: renderCheckpoint(id), title: CP_BY_ID[id] ? `Sprawdzian ${CP_BY_ID[id].n}: ${CP_BY_ID[id].title} – ${SITE_TITLE}` : SITE_TITLE, mount: () => { bindCheckpoint(id); } });
/** @param {string} id */
function renderCheckpoint(id) {
  const c = CP_BY_ID[id];
  if (!c) return `<div class="page empty"><h1>Nie znaleziono sprawdzianu</h1><p><a href="#/kolejnosc">Wróć do kolejności nauki</a></p></div>`;
  const { cur, rev } = cpSize(c);
  const s = state.scores[cpKey(c)];
  const last = c.lessons[c.lessons.length - 1], after = PATH[PATH.indexOf(last) + 1];
  const todo = c.lessons.filter((l) => !state.done[l.id]);
  return `<div class="page checkpoint" data-level="${c.level}">
      <div class="crumbs" data-level="${c.level}"><a href="#/kolejnosc">${icon("compass")} Kolejność nauki</a> · ${badge(c.level)} <span>Sprawdzian ${c.n} z ${CHECKPOINTS.length}</span></div>
      <h1>${icon("flag")} Sprawdzian ${c.n}: ${esc(c.title)}</h1>
      <p class="summary">Powtórka po lekcjach ${cpRange(c)}${c.prior.length ? ` z dodatkiem zadań z lekcji 1–${lessonNo(c.lessons[0]) - 1}` : ""}. Zadania są wymieszane i nie widać, z której lekcji pochodzą – trzeba samemu rozpoznać, jakiej konstrukcji użyć.</p>
      <div class="card test-intro">
        <p><b>Co sprawdzamy:</b> ${esc(c.focus || "")}</p>
        <p class="cp-lessons"><b>Lekcje:</b> ${c.lessons.map((l) => `<a href="#/lesson/${l.id}">${lessonNo(l)}. ${doneTick(esc(l.title), state.done[l.id])}</a>`).join(" · ")}</p>
        <p><b>${cur + rev} zadań</b>: ${cur} z tych lekcji${rev ? ` i ${rev} z wcześniejszych` : ""}. Prawie wszystkie to <b>pisanie całych zdań</b> (tłumaczenie, przekształcanie, poprawianie błędów), kilka to układanie zdań z wyrazów. Wynik i poprawki zobaczysz po kliknięciu „Zakończ i sprawdź”. Zaliczenie od <b>80%</b>. Każde podejście losuje nowe zadania.</p>
        ${todo.length ? `<p class="callout warning">Możesz pisać od razu, ale najlepiej najpierw przerobić: ${todo.map((l) => `<a href="#/lesson/${l.id}">${esc(l.title)}</a>`).join(", ")}</p>` : ""}
        ${s ? `<p>Twój najlepszy wynik: ${scorePill(s)}${cpPassed(c) ? ` – <b>zaliczone ${icon("check")}</b>` : ""}</p>` : ""}
      </div>
      <div id="cpBox" class="cp-run">${exercisesShell("Zadania", { h3: true, retryLabel: "Nowe losowanie" })}</div>
      <div id="cpReport"></div>
      <div class="pager">
        <a class="card prev" href="#/lesson/${last.id}"><small>← Ostatnia lekcja</small>${esc(last.title)} ${badge(last.level)}</a>
        ${after ? `<a class="card next" href="#/lesson/${after.id}"><small>Następna lekcja →</small>${badge(after.level)} ${esc(after.title)}</a>` : `<a class="card next" href="#/tests"><small>Dalej →</small>${icon("test")} Testy</a>`}
      </div>
    </div>`;
}
// Raport po sprawdzianie / teście poziomu: wynik z podziałem na lekcje, najsłabsze na górze.
// opts: noun („Sprawdzian” / „Test poziomu A1”), isReview(l) – lekcja spoza bloku (dopisek „powtórka”),
// after – { href, label } przycisku „Dalej” po zaliczeniu.
/**
 * @param {{ ex: Exercise, lesson: Lesson }[]} items
 * @param {import("../exercises.js").ExControl[]} ctls
 * @param {number} correct @param {number} total
 * @param {{ noun: string, isReview?: (l: Lesson) => boolean, after?: { href: string, label: string } | null }} opts
 * @returns {string}
 */
export function reportHtml(items, ctls, correct, total, opts) {
  /** @type {Map<Lesson, { ok: number, n: number }>} */
  const by = new Map();
  ctls.forEach((ctl) => {
    const l = items[+(ctl.card.dataset.i || 0)].lesson;
    const r = by.get(l) || { ok: 0, n: 0 };
    r.n++; if (ctl.result && ctl.result.ok) r.ok++;
    by.set(l, r);
  });
  const rows = [...by].sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n || PATH.indexOf(a[0]) - PATH.indexOf(b[0]));
  const weak = rows.filter(([, r]) => r.ok < r.n);
  const passed = correct / total >= 0.8;
  const need = Math.ceil(total * 0.8) - correct;
  const isReview = opts.isReview || (() => false);
  return `<div class="card cp-report">
      <h3>${passed ? `${icon("check")} ${opts.noun} zaliczony` : `Do zaliczenia zabrakło ${need} ${need === 1 ? "punktu" : "punktów"}`}</h3>
      <p>${passed
      ? (weak.length ? "Brawo! Zerknij jeszcze na lekcje z błędami poniżej, zanim pójdziesz dalej." : "Bezbłędnie we wszystkich lekcjach – można iść dalej.")
      : "Przejrzyj poprawki przy zadaniach, powtórz lekcje z błędami (teoria i ćwiczenia), a potem wylosuj nowy zestaw."}</p>
      ${weak.length ? `<p><b>Do powtórki:</b> ${weak.slice(0, 5).map(([l]) => esc(l.title)).join(", ")}${weak.length > 5 ? ` i ${weak.length - 5} więcej` : ""}. Zadania z błędami trafiły do <a href="#/bledy">Moich błędów</a> – wrócą jutro do powtórki.</p>` : ""}
      <table class="cp-table"><thead><tr><th>Lekcja</th><th>Wynik</th><th></th></tr></thead><tbody>
        ${rows.map(([l, r]) => `<tr class="${r.ok < r.n ? "cp-weak" : ""}"><td><a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a> ${badge(l.level)}${isReview(l) ? ' <span class="muted">(powtórka)</span>' : ""}</td>
          <td>${scorePill({ correct: r.ok, total: r.n })}</td>
          <td>${r.ok < r.n ? `<a class="btn small" href="#/lesson/${l.id}/practice" title="Ćwiczenia z tej lekcji">Powtórz →</a>` : icon("check")}</td></tr>`).join("")}
      </tbody></table>
      ${passed && opts.after ? `<p><a class="btn primary" href="${opts.after.href}">${esc(opts.after.label)} →</a></p>` : ""}
    </div>`;
}
/**
 * @param {Checkpoint} c @param {{ ex: Exercise, lesson: Lesson }[]} items @param {import("../exercises.js").ExControl[]} ctls
 * @param {number} correct @param {number} total
 */
function cpReportHtml(c, items, ctls, correct, total) {
  const last = c.lessons[c.lessons.length - 1], after = PATH[PATH.indexOf(last) + 1];
  return reportHtml(items, ctls, correct, total, {
    noun: "Sprawdzian", isReview: (/** @type {Lesson} */ l) => !c.lessons.includes(l),
    after: after && { href: `#/lesson/${after.id}`, label: `Dalej: ${after.title}` },
  });
}
/** @param {string} id */
function bindCheckpoint(id) {
  const c = CP_BY_ID[id]; if (!c) return;
  const box = /** @type {HTMLElement} */ ($("#cpBox").firstElementChild);
  const run = () => {
    const items = buildCheckpoint(c);
    $("#cpReport").innerHTML = "";
    renderExercises(box, items, {
      key: cpKey(c), mode: "deferred", showSource: true,
      onDone: (correct, total, ctls) => { $("#cpReport").innerHTML = cpReportHtml(c, items, ctls, correct, total); },
    });
  };
  run();
  $(".retry", box).addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
}

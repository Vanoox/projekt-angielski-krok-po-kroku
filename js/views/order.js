// Widok #/kolejnosc – ścieżka nauki z postępem, cel dzienny, dziennik nauki, kopia postępu.
import { esc, LEVELS } from "../util.js";
import { today, dayDate, dayStr } from "../dates.js";
import { ACT_WEEKS, dayTotal, actLevel } from "../activity.js";
import { icon } from "../icons.js";
import { LEVEL_INFO, dni, $, SITE_TITLE, badge, scorePill, zadan, plural, slowek } from "../ui.js";
import { PATH, CHECKPOINTS, CP_AFTER } from "../data.js";
import { state, streakInfo, streakHint, cpKey, cpPassed, cpRange, ltKey, ltPassed, ltBadge, nextStep } from "../state.js";
import { goalHtml } from "../goal.js";
import { backupReminder, backupSectionHtml, bindBackup } from "../backup.js";
import { LT_SIZE, levelLessons } from "./level-test.js";

// ---------- Dziennik nauki: kalendarz (eng-activity) ----------
// Kalendarz jak na GitHubie: kolumny = tygodnie (pn–nd), ostatnie ACT_WEEKS tygodni + bieżący.
// Odcień wg liczby zadań + słówek w dniu (ACT_STEPS = dolne progi poziomów 1–4).
const MONTHS_SHORT = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
function activityHtml() {
  const s = streakInfo(), t = today(), now = dayDate(t);
  const start = new Date(now);
  start.setDate(start.getDate() - ((now.getDay() + 6) % 7) - ACT_WEEKS * 7); // poniedziałek ACT_WEEKS tygodni temu
  const cols = [`<span class="act-m"></span>` + ["pn", "", "śr", "", "pt", "", "nd"].map((d) => `<span class="act-d">${d}</span>`).join("")];
  let lastMonthCol = -9;
  for (let w = 0; w <= ACT_WEEKS; w++) {
    const cells = [];
    let label = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + w * 7 + i);
      const k = dayStr(d);
      if (d.getDate() === 1) label = MONTHS_SHORT[d.getMonth()];
      if (k > t) { cells.push(`<span class="act-c act-future"></span>`); continue; }
      const e = state.activity[k], n = dayTotal(e);
      const date = d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
      const info = n ? [e.t ? `${zadan(e.t)} (dobrze: ${e.ok || 0})` : "", e.w ? `${slowek(e.w)} w fiszkach` : ""].filter(Boolean).join(", ") + (e.a ? " – przybliżone z historii" : "") : "bez nauki";
      cells.push(`<span class="act-c act-l${actLevel(n)}${k === t ? " act-today" : ""}" title="${date}: ${info}"></span>`);
    }
    // Nazwa miesiąca nad tygodniem z 1. dniem miesiąca; nad pierwszym tygodniem bez 1. dnia – jego miesiąc, o ile
    // do końca miesiąca zostało ponad tydzień (inaczej nazwy by na siebie nachodziły).
    if (!label && w === 0 && start.getDate() <= 22) label = MONTHS_SHORT[start.getMonth()];
    if (label && w - lastMonthCol < 3) label = "";
    if (label) lastMonthCol = w;
    cols.push(`<span class="act-m">${label}</span>` + cells.join(""));
  }
  const hint = streakHint(s);
  return `<section class="card activity" id="dziennik" aria-label="Dziennik nauki">
      <div class="act-main">
      <div class="act-stats">
        <div class="act-stat act-streak${s.current ? " on" : ""}"><span class="act-ico" aria-hidden="true">${icon("flame")}</span><div><b>${dni(s.current)}</b><span>z rzędu</span></div></div>
        <div class="act-stat"><div><b>${dni(s.best)}</b><span>najdłuższa seria</span></div></div>
        <div class="act-stat"><div><b>${s.days}</b><span>${plural(s.days, "dzień", "dni", "dni")} nauki w sumie</span></div></div>
      </div>
      <p class="act-hint">${hint}</p>
      </div>
      <div class="act-calwrap">
      <div class="act-cal" role="img" aria-label="Kalendarz aktywności z ostatnich ${ACT_WEEKS} tygodni">${cols.map((c) => `<div class="act-col">${c}</div>`).join("")}</div>
      <div class="act-legend" aria-hidden="true">Mniej ${[0, 1, 2, 3, 4].map((l) => `<span class="act-c act-l${l}"></span>`).join("")} Więcej</div>
      </div>
    </section>`;
}

// ---------- Kolejność nauki (#/kolejnosc) ----------
// Widok dla routera (router.js): { html, title, mount(el) } – mount może zwrócić funkcję sprzątającą.
export const orderView = () => ({ html: renderOrder(), title: `Kolejność nauki – ${SITE_TITLE}`, mount: () => { bindOrder(); } });
function renderOrder() {
  if (!PATH.length) return `<div class="page empty"><h1>Brak lekcji</h1></div>`;
  /** @param {number} d @param {number} n */
  const percent = (d, n) => (n ? Math.round((d / n) * 100) : 0);
  const nDone = PATH.filter((l) => state.done[l.id]).length;
  const step = nextStep();
  const next = step && step.lesson;
  const nCp = CHECKPOINTS.filter(cpPassed).length;
  /** @param {Checkpoint} cp */
  const cpRow = (cp) => {
    const passed = cpPassed(cp), s = state.scores[cpKey(cp)];
    const isNext = step && step.cp === cp;
    return `<li class="order-item order-cp${passed ? " is-done" : ""}${isNext ? " is-next" : ""}" data-level="${cp.level}">
            <a href="#/sprawdzian/${cp.id}">
              <span class="order-num" aria-hidden="true">${icon("flag")}</span>
              <span class="order-titles"><span class="order-title">Sprawdzian ${cp.n}: ${esc(cp.title)}</span><span class="order-pl">Powtórka: lekcje ${cpRange(cp)}${cp.prior.length ? " + trochę wcześniejszych" : ""}</span></span>
              ${isNext ? '<span class="order-next-tag">Teraz</span>' : ""}
              ${s ? scorePill(s) : ""}
              <span class="order-check" aria-label="${passed ? "Zaliczony" : "Niezaliczony"}">${passed ? icon("check") : ""}</span>
            </a>
          </li>`;
  };
  // Kafelek na końcu poziomu: test całego poziomu (zaliczenie = odznaka przy nagłówku poziomu).
  /** @param {Level} lv @param {Lesson[]} ls */
  const ltRow = (lv, ls) => {
    const passed = ltPassed(lv), s = state.scores[ltKey(lv)];
    const ready = ls.every((l) => state.done[l.id]);
    return `<li class="order-item order-cp order-lt${passed ? " is-done" : ""}" data-level="${lv}">
            <a href="#/test-poziomu/${lv}">
              <span class="order-num" aria-hidden="true">${icon("test")}</span>
              <span class="order-titles"><span class="order-title">Test poziomu ${lv}</span><span class="order-pl">${LT_SIZE} zadań ze wszystkich lekcji ${lv}${passed ? "" : ready ? " – poziom przerobiony, sprawdź się!" : " – zalicz (80%), a dostaniesz odznakę " + icon("medal")}</span></span>
              ${s ? scorePill(s) : ""}
              <span class="order-check" aria-label="${passed ? "Zaliczony" : "Niezaliczony"}">${passed ? icon("check") : ""}</span>
            </a>
          </li>`;
  };
  const nLt = LEVELS.filter((lv) => levelLessons(lv).length && ltPassed(lv)).length;
  const levelBars = LEVELS.map((lv) => {
    const ls = PATH.filter((l) => l.level === lv);
    if (!ls.length) return "";
    const d = ls.filter((l) => state.done[l.id]).length;
    return `<a class="order-level" href="#/kolejnosc" data-jump="lvl-${lv}" data-level="${lv}">
        <div class="order-level-head">${badge(lv)} <b>${LEVEL_INFO[lv].name}</b>${ltPassed(lv) ? `<span class="lt-mark" title="Test poziomu zaliczony">${icon("medal")}</span>` : ""}<span class="muted">${d}/${ls.length}</span></div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${ls.length}" aria-valuenow="${d}" aria-label="Postęp ${lv}"><i style="width:${percent(d, ls.length)}%"></i></div>
      </a>`;
  }).join("");
  const groups = LEVELS.map((lv) => {
    const ls = PATH.filter((l) => l.level === lv);
    if (!ls.length) return "";
    return `<section class="order-group" id="lvl-${lv}" data-level="${lv}">
        <h2 class="order-group-title">${badge(lv)} ${LEVEL_INFO[lv].name}${ltBadge(lv)}</h2>
        <ol class="order-list">${ls.map((l) => {
        const n = PATH.indexOf(l) + 1;
        const done = !!state.done[l.id];
        const isNext = next && next.id === l.id;
        return `<li class="order-item${done ? " is-done" : ""}${isNext ? " is-next" : ""}" data-level="${l.level}">
            <a href="#/lesson/${l.id}">
              <span class="order-num">${n}</span>
              ${badge(l.level)}
              <span class="order-titles"><span class="order-title">${esc(l.title)}</span>${l.titlePl ? `<span class="order-pl">${esc(l.titlePl)}</span>` : ""}</span>
              ${isNext ? '<span class="order-next-tag">Teraz</span>' : ""}
              <span class="order-check" aria-label="${done ? "Przerobione" : "Nieprzerobione"}">${done ? icon("check") : ""}</span>
            </a>
          </li>${CP_AFTER[l.id] ? cpRow(CP_AFTER[l.id]) : ""}`;
      }).join("")}${ltRow(lv, ls)}</ol>
      </section>`;
  }).join("");
  return `<div class="page order-page">
      <div class="crumbs"><a href="#/">Strona główna</a> · <span>Kolejność nauki</span></div>
      <h1>${icon("compass")} Kolejność nauki</h1>
      <p class="muted-p">Lekcje ułożone tak, jak warto się ich uczyć. Każda korzysta tylko z gramatyki i słówek z lekcji wcześniejszych. Lekcję oznaczysz jako przerobioną przyciskiem w lekcji albo zdając jej test (min. 80%).${CHECKPOINTS.length ? ` Co kilka lekcji czeka ${icon("flag")} <b>sprawdzian powtórkowy</b>: zadania z ostatnich lekcji i trochę z wcześniejszych, głównie pisanie całych zdań.` : ""} Na końcu każdego poziomu jest ${icon("test")} <b>test poziomu</b> – za zaliczenie (80%) dostajesz odznakę ${icon("medal")}.</p>
      <div class="card order-summary">
        <div class="order-total">
          <div><b>${nDone} z ${PATH.length} lekcji</b> <span class="muted">(${percent(nDone, PATH.length)}%)${CHECKPOINTS.length ? ` · sprawdziany: ${nCp}/${CHECKPOINTS.length}` : ""} · testy poziomów: ${nLt}/${LEVELS.filter((lv) => levelLessons(lv).length).length}</span></div>
          ${step ? `<a class="btn primary" href="${step.href}">${nDone ? "Kontynuuj naukę" : "Zacznij naukę"}: ${step.cp ? icon("flag") + " " : ""}${esc(step.title)} →</a>` : `<span class="pill good">Wszystkie lekcje przerobione!</span>`}
        </div>
        <div class="progress big" role="progressbar" aria-valuemin="0" aria-valuemax="${PATH.length}" aria-valuenow="${nDone}" aria-label="Postęp całego kursu"><i style="width:${percent(nDone, PATH.length)}%"></i></div>
        <div class="order-levels">${levelBars}</div>
        <a class="order-backup-link" href="#/kolejnosc/kopia" data-jump="kopia">${icon("save")} Kopia postępu – pobierz albo wczytaj z pliku</a>
      </div>
      ${goalHtml()}
      ${activityHtml()}
      ${backupReminder()}
      ${groups}
      ${backupSectionHtml()}
    </div>`;
}
function bindOrder() {
  /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll(".order-page [data-jump]")).forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(String(a.dataset.jump));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  bindBackup($(".order-page .backup"));
}

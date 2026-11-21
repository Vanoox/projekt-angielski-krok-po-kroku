// „Na dziś”: zadania z „Moich błędów” i słówka do powtórki – liczniki w górnym pasku, w menu i na stronach
// (syncTodayCounts; inne moduły dopisują swoje odświeżanie przez onTodayCounts).
import { isDue } from "./srs.js";
import { $, zadan, slowek } from "./ui.js";
import { TASKS } from "./data.js";
import { state, srsToday } from "./state.js";
import { hasTask } from "./conj.js";

// ---------- Moje błędy i słówka na dziś ----------
// Zasady pudełek (1 → 2 → 3 → 4 → opanowane) – js/srs.js, nextMistake.
/** @typedef {{ key: string, m: MistakeEntry } & TaskRef} MistakeRow wpis „Moich błędów” z zadaniem z rejestru */
/** @returns {MistakeRow[]} */
export const mistakeList = () => Object.entries(state.mistakes).filter(([k]) => hasTask(k)).map(([key, m]) => ({ key, m, .../** @type {TaskRef} */ (TASKS.get(key)) })); // hasTask: wpis w TASKS jest (trener odmiany dopisuje go w cjTask) // hasTask: też zadania z trenera odmiany
const mistakesDue = () => mistakeList().filter((x) => isDue(x.m)).length;
export const wordsDue = () => { const q = srsToday(); return q.due.length + q.fresh.length; };

// ---------- Liczniki „na dziś” ----------
// Liczniki „na dziś” w górnym pasku i w menu: .m-count = Moje błędy (link w pasku widać tylko, gdy są jakieś błędy),
// .wd-count = Słówka na dziś (przy „Słownictwie”), na przycisku ☰ (telefon) – suma obu.
export function syncTodayCounts() {
  const n = mistakesDue(), any = mistakeList().length > 0, w = wordsDue();
  const link = $("#mistakesLink");
  if (link) { link.hidden = !any; link.title = n ? `Moje błędy – ${n} na dziś` : "Moje błędy"; }
  /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll(".m-count")).forEach((el) => { el.textContent = String(n); el.hidden = !n; });
  /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll(".wd-count")).forEach((el) => { el.textContent = String(w); el.hidden = !w; });
  const menu = $(".menu-count");
  if (menu) { menu.textContent = String(n + w); menu.hidden = !(n + w); menu.title = `Na dziś: ${[w ? slowek(w) : "", n ? zadan(n) + " z błędami" : ""].filter(Boolean).join(", ")}`; }
  todayHooks.forEach((f) => f());
}
// Inne moduły dopisują tu, co odświeżyć razem z licznikami (np. listy na stronie „Moje błędy”) – bez zależności w kółko.
/** @type {(() => void)[]} */
const todayHooks = [];
/** @param {() => void} f */
export const onTodayCounts = (f) => { todayHooks.push(f); };

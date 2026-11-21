// Dziennik nauki (eng-activity), dni z rzędu i cel dzienny (eng-goal) – same obliczenia, bez DOM i localStorage
// (testy: tests/activity.test.mjs). Widoki (kalendarz, kółko celu) są w app.js.
import { isObj } from "./util.js";
import { DAY_RE, dayStr, today, shiftDay } from "./dates.js";

// { "RRRR-MM-DD" (data lokalna): { t: zadania, ok: w tym poprawne, w: ocenione słówka, a?: 1 } }.
// Zadania: każda odpowiedź w renderExercises (lekcje, zestawy, testy, trening, sprawdziany, Moje błędy,
// quizy ze słówek); słówka: każda ocena fiszki (rateWord). a: 1 = dzień przybliżony z historii (activityFromHistory).
/** @param {ActivityDay | undefined} e @returns {number} */
export const dayTotal = (e) => (e ? (e.t || 0) + (e.w || 0) : 0);
/** @typedef {"t" | "ok" | "w"} ActivityField */
/** Wpis dnia po dopisaniu liczb d (np. { t: 1, ok: 1 }) – nowy obiekt. @param {ActivityDay | undefined} e @param {Partial<Record<ActivityField, number>>} d @returns {ActivityDay} */
export function addActivity(e, d) {
  /** @type {ActivityDay} */
  const out = { ...(e || {}) };
  for (const [f, n] of /** @type {[ActivityField, number][]} */ (Object.entries(d))) out[f] = (out[f] || 0) + n;
  delete out.a; // od teraz dzień ma prawdziwe dane (przybliżenie było dolnym oszacowaniem, więc tylko dopisujemy)
  return out;
}
// Historia sprzed dziennika: PRZYBLIŻENIE z lastSeen w eng-mistakes (1 zadanie w dniu ostatniej odpowiedzi; poprawne,
// gdy pudełko > 1) i eng-srs (1 słówko w dniu ostatniej oceny). Wcześniejsze odpowiedzi nadpisał nowszy lastSeen,
// więc dni i liczby są zaniżone. s – stan ({ mistakes, srs }).
/** @param {{ mistakes?: Dict<MistakeEntry>, srs?: Dict<WordEntry> }} s @returns {Dict<ActivityDay>} */
export function activityFromHistory(s) {
  /** @type {Dict<ActivityDay>} */
  const act = {};
  /** @param {string | undefined} iso @param {Partial<Record<ActivityField, number>>} f */
  const add = (iso, f) => {
    const d = new Date(/** @type {string} */ (iso));
    if (!iso || isNaN(d.getTime())) return;
    const k = dayStr(d), e = act[k] || (act[k] = { a: 1 });
    for (const [x, n] of /** @type {[ActivityField, number][]} */ (Object.entries(f))) e[x] = (e[x] || 0) + n;
  };
  Object.values(s.mistakes || {}).forEach((m) => isObj(m) && add(m.lastSeen, { t: 1, ok: m.box > 1 ? 1 : 0 }));
  Object.values(s.srs || {}).forEach((m) => isObj(m) && add(m.lastSeen, { w: 1 }));
  return act;
}
// Seria = dni z rzędu z choć 1 zadaniem albo słówkiem, bez dni przerwy. Bieżąca seria kończy się dziś,
// a jeśli dziś jeszcze nic nie zrobiono – wczoraj (seria trwa do końca dnia, w którym można ją przedłużyć).
/**
 * @param {Dict<ActivityDay>} act
 * @param {string} [day] dzisiejsza data „RRRR-MM-DD”
 * @returns {{ current: number, best: number, days: number, todayDone: boolean }}
 */
export function streakInfo(act, day = today()) {
  /** @param {string} k */
  const on = (k) => dayTotal(act[k]) > 0;
  const days = Object.keys(act).filter((k) => DAY_RE.test(k) && on(k)).sort();
  let best = 0, run = 0, prev = "";
  for (const k of days) { run = prev && shiftDay(prev, 1) === k ? run + 1 : 1; best = Math.max(best, run); prev = k; }
  const t = day, todayDone = on(t);
  let cur = 0;
  for (let k = todayDone ? t : shiftDay(t, -1); on(k); k = shiftDay(k, -1)) cur++;
  return { current: cur, best, days: days.length, todayDone };
}
// Kalendarz: odcień wg liczby zadań + słówek w dniu (ACT_STEPS = dolne progi poziomów 1–4).
export const ACT_WEEKS = 16, ACT_STEPS = [1, 10, 25, 50];
/** @param {number} n @returns {number} poziom 0–4 */
export const actLevel = (n) => ACT_STEPS.reduce((lv, s, i) => (n >= s ? i + 1 : lv), 0);

// ---------- Cel dzienny ----------
// Liczy się to samo co w dzienniku: zadania z odpowiedzią + ocenione słówka w fiszkach (dayTotal).
export const GOAL_CHOICES = [10, 20, 30, 50], GOAL_DEFAULT = 20;
/** @param {unknown} g zapisany cel @returns {number} */
export const goalOf = (g) => (typeof g === "number" && GOAL_CHOICES.includes(g) ? g : GOAL_DEFAULT);
/** @param {Dict<ActivityDay>} act @param {string} [day] */
export const goalCount = (act, day = today()) => dayTotal(act[day]);
// Komunikat „Cel na dziś zrobiony” tylko w chwili przekroczenia celu i najwyżej raz dziennie
// (goalDay = dzień ostatniego komunikatu; np. podniesienie celu po jego zrobieniu nie pokaże go drugi raz).
/** @param {number} before @param {number} after @param {number} goal @param {string} goalDay @param {string} day @returns {boolean} */
export const goalJustHit = (before, after, goal, goalDay, day) => before < goal && after >= goal && goalDay !== day;

// Dziennik nauki (eng-activity), dni z rzędu i cel dzienny (eng-goal) – same obliczenia, bez DOM i localStorage
// (testy: tests/activity.test.mjs). Widoki (kalendarz, kółko celu) są w app.js.
import { isObj } from "./util.js";
import { DAY_RE, dayStr, today, shiftDay } from "./dates.js";

// { "RRRR-MM-DD" (data lokalna): { t: zadania, ok: w tym poprawne, w: ocenione słówka, a?: 1 } }.
// Zadania: każda odpowiedź w renderExercises (lekcje, zestawy, testy, trening, sprawdziany, Moje błędy,
// quizy ze słówek); słówka: każda ocena fiszki (rateWord). a: 1 = dzień przybliżony z historii (activityFromHistory).
export const dayTotal = (e) => (e ? (e.t || 0) + (e.w || 0) : 0);
// Wpis dnia po dopisaniu liczb d (np. { t: 1, ok: 1 }) – nowy obiekt.
export function addActivity(e, d) {
  const out = { ...(e || {}) };
  for (const [f, n] of Object.entries(d)) out[f] = (out[f] || 0) + n;
  delete out.a; // od teraz dzień ma prawdziwe dane (przybliżenie było dolnym oszacowaniem, więc tylko dopisujemy)
  return out;
}
// Historia sprzed dziennika: PRZYBLIŻENIE z lastSeen w eng-mistakes (1 zadanie w dniu ostatniej odpowiedzi; poprawne,
// gdy pudełko > 1) i eng-srs (1 słówko w dniu ostatniej oceny). Wcześniejsze odpowiedzi nadpisał nowszy lastSeen,
// więc dni i liczby są zaniżone. s – stan ({ mistakes, srs }).
export function activityFromHistory(s) {
  const act = {};
  const add = (iso, f) => {
    const d = new Date(iso);
    if (!iso || isNaN(d)) return;
    const k = dayStr(d), e = act[k] || (act[k] = { a: 1 });
    for (const [x, n] of Object.entries(f)) e[x] = (e[x] || 0) + n;
  };
  Object.values(s.mistakes || {}).forEach((m) => isObj(m) && add(m.lastSeen, { t: 1, ok: m.box > 1 ? 1 : 0 }));
  Object.values(s.srs || {}).forEach((m) => isObj(m) && add(m.lastSeen, { w: 1 }));
  return act;
}
// Seria = dni z rzędu z choć 1 zadaniem albo słówkiem, bez dni przerwy. Bieżąca seria kończy się dziś,
// a jeśli dziś jeszcze nic nie zrobiono – wczoraj (seria trwa do końca dnia, w którym można ją przedłużyć).
export function streakInfo(act, day = today()) {
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
export const actLevel = (n) => ACT_STEPS.reduce((lv, s, i) => (n >= s ? i + 1 : lv), 0);

// ---------- Cel dzienny ----------
// Liczy się to samo co w dzienniku: zadania z odpowiedzią + ocenione słówka w fiszkach (dayTotal).
export const GOAL_CHOICES = [10, 20, 30, 50], GOAL_DEFAULT = 20;
export const goalOf = (g) => (GOAL_CHOICES.includes(g) ? g : GOAL_DEFAULT);
export const goalCount = (act, day = today()) => dayTotal(act[day]);
// Komunikat „Cel na dziś zrobiony” tylko w chwili przekroczenia celu i najwyżej raz dziennie
// (goalDay = dzień ostatniego komunikatu; np. podniesienie celu po jego zrobieniu nie pokaże go drugi raz).
export const goalJustHit = (before, after, goal, goalDay, day) => before < goal && after >= goal && goalDay !== day;

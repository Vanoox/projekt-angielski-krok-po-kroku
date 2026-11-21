// Zapisywanie postępu: wynik zestawu (saveScore), pudełka „Moich błędów” (recordResult), dziennik nauki (logActivity),
// ocena słówka w fiszkach (rateWord). Po zapisie odświeża menu i cel dzienny.
import { today } from "./dates.js";
import { nextMistake, nextWord } from "./srs.js";
import { dayTotal, addActivity, goalJustHit } from "./activity.js";
import { store } from "./storage.js";
import { state, save } from "./state.js";
import { syncGoal } from "./goal.js";
import { syncNavState } from "./nav.js";

// ---------- Wynik zestawu ----------
export const saveScore = (key, correct, total) => {
  const prev = state.scores[key];
  if (!prev || correct / total >= prev.correct / prev.total) state.scores[key] = { correct, total };
  save();
  syncNavState();
};

// ---------- Moje błędy: system pudełek (eng-mistakes) ----------
export function recordResult(key, ok) {
  const e = nextMistake(state.mistakes[key], ok);
  if (e === undefined) return;
  if (e === null) delete state.mistakes[key]; else state.mistakes[key] = e;
  store.set("mistakes", state.mistakes);
}

// ---------- Dziennik nauki (eng-activity) ----------
// Format wpisów, seria dni z rzędu i przybliżenie z historii – js/activity.js.
export function logActivity(d) {
  const k = today(), before = dayTotal(state.activity[k]), e = addActivity(state.activity[k], d);
  state.activity[k] = e;
  store.set("activity", state.activity);
  // Cel dzienny: komunikat „Cel na dziś zrobiony” tylko w chwili przekroczenia celu i najwyżej raz dziennie (eng-goalDay).
  const hit = goalJustHit(before, dayTotal(e), state.goal, store.get("goalDay", ""), k);
  if (hit) store.set("goalDay", k);
  syncGoal(hit);
}

// ---------- Słówka na dziś: pudełka dla słówek (eng-srs) ----------
// Zasady pudełek, migracja „znam” i kolejka na dziś – js/srs.js.
export function rateWord(k, rating, deck) { // rating: 0 = nie wiem, 1 = trudne, 2 = wiem
  logActivity({ w: 1 }); // każda ocena liczy się do dziennika, także przed terminem
  const e = nextWord(state.srs[k], rating, deck);
  if (!e) return;
  state.srs[k] = e;
  store.set("srs", state.srs);
}

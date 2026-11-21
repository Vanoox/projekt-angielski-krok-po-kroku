// Dziennik nauki, dni z rzędu i cel dzienny (js/activity.js, js/dates.js) przy ustalonej dacie.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dayTotal, addActivity, activityFromHistory, streakInfo, actLevel, goalOf, goalCount, goalJustHit, GOAL_DEFAULT } from "../js/activity.js";
import { dayStr, today, addDays, dayDate, shiftDay } from "../js/dates.js";
import { d } from "./helpers.mjs";

test("daty lokalne", () => {
  assert.equal(dayStr(d(2026, 3, 5)), "2026-03-05");
  assert.equal(today(d(2026, 11, 21, 23, 59, 59)), "2026-11-21");
  assert.equal(today(d(2026, 11, 22, 0, 0, 1)), "2026-11-22");
  assert.equal(addDays(1, d(2026, 2, 28)), "2026-03-01");
  assert.equal(addDays(-1, d(2028, 3, 1)), "2028-02-29"); // rok przestępny
  assert.equal(shiftDay("2026-12-31", 1), "2027-01-01");
  assert.equal(shiftDay("2026-03-29", 1), "2026-03-30"); // zmiana czasu na letni
  assert.equal(shiftDay("2026-10-25", -1), "2026-10-24"); // i na zimowy
  assert.equal(dayDate("2026-11-21").getDate(), 21);
});

test("wpisy dziennika", () => {
  assert.equal(dayTotal(undefined), 0);
  assert.equal(dayTotal({ t: 3, ok: 2, w: 4 }), 7); // ok to część t
  assert.deepEqual(addActivity(undefined, { t: 1, ok: 1 }), { t: 1, ok: 1 });
  assert.deepEqual(addActivity({ t: 2, ok: 1, a: 1 }, { t: 1, ok: 0 }), { t: 3, ok: 1 }); // znacznik przybliżenia znika
  const e = { w: 1 };
  addActivity(e, { w: 1 });
  assert.deepEqual(e, { w: 1 }); // nie zmienia wejścia
});

test("dni z rzędu: przez północ, przerwa, dzisiaj jeszcze nic", () => {
  // odpowiedź o 23:59 i o 0:01 to dwa różne dni
  const act = {};
  for (const t of [d(2026, 11, 20, 23, 59), d(2026, 11, 21, 0, 1)]) { const k = today(t); act[k] = addActivity(act[k], { t: 1, ok: 1 }); }
  assert.deepEqual(Object.keys(act), ["2026-11-20", "2026-11-21"]);
  assert.deepEqual(streakInfo(act, "2026-11-21"), { current: 2, best: 2, days: 2, todayDone: true });
  // dziś jeszcze nic – seria trwa do końca dnia (liczona do wczoraj)
  assert.deepEqual(streakInfo(act, "2026-11-22"), { current: 2, best: 2, days: 2, todayDone: false });
  // dzień przerwy – seria się kończy
  assert.deepEqual(streakInfo(act, "2026-11-23"), { current: 0, best: 2, days: 2, todayDone: false });
  // najdłuższa seria wcześniej, przez koniec miesiąca; dni z zerem i złe klucze się nie liczą
  const a2 = { "2026-10-30": { t: 1 }, "2026-10-31": { w: 2 }, "2026-11-01": { t: 1 }, "2026-11-02": { t: 0, w: 0 }, "2026-11-03": { t: 5 }, zly: { t: 9 } };
  assert.deepEqual(streakInfo(a2, "2026-11-03"), { current: 1, best: 3, days: 4, todayDone: true });
  assert.deepEqual(streakInfo({}, "2026-11-21"), { current: 0, best: 0, days: 0, todayDone: false });
});

test("historia sprzed dziennika (przybliżenie)", () => {
  const s = {
    mistakes: { a: { box: 1, lastSeen: "2026-11-10T09:00:00" }, b: { box: 3, lastSeen: "2026-11-10T20:00:00" }, c: { box: 2 }, x: 5 },
    srs: { w: { box: 2, lastSeen: "2026-11-12T08:00:00" }, v: { box: 1, lastSeen: "zła data" } },
  };
  assert.deepEqual(activityFromHistory(s), { "2026-11-10": { a: 1, t: 2, ok: 1 }, "2026-11-12": { a: 1, w: 1 } });
  assert.deepEqual(activityFromHistory({}), {});
});

test("cel dzienny", () => {
  assert.equal(goalOf(30), 30);
  assert.equal(goalOf(25), GOAL_DEFAULT);
  assert.equal(goalOf(undefined), GOAL_DEFAULT);
  assert.equal(goalCount({ "2026-11-21": { t: 7, ok: 5, w: 3 } }, "2026-11-21"), 10);
  assert.equal(goalCount({}, "2026-11-21"), 0);
  assert.equal(goalJustHit(19, 20, 20, "", "2026-11-21"), true); // właśnie przekroczony
  assert.equal(goalJustHit(20, 21, 20, "", "2026-11-21"), false); // już był zrobiony
  assert.equal(goalJustHit(19, 20, 20, "2026-11-21", "2026-11-21"), false); // komunikat już był dziś
  assert.equal(goalJustHit(19, 20, 20, "2026-11-20", "2026-11-21"), true);
  assert.deepEqual([0, 1, 9, 10, 24, 25, 49, 50, 500].map(actLevel), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
});

// Pudełka „Moich błędów” i „Słówek na dziś” (js/srs.js) – przejścia i terminy przy ustalonej dacie.
import { test } from "node:test";
import assert from "node:assert/strict";
import { isDue, nextMistake, nextWord, knownEntry, migrateKnown, activeDecks, srsToday, wordKey, BOX_DAYS, SRS_DAYS } from "../js/srs.js";
import { d } from "./helpers.mjs";

const NOW = d(2026, 11, 21, 10); // sobota 21.11.2026, 10:00
const ISO = NOW.toISOString();

test("termin: dziś i wcześniej = na dziś", () => {
  assert.equal(isDue({ due: "2026-11-21" }, "2026-11-21"), true);
  assert.equal(isDue({ due: "2026-11-20" }, "2026-11-21"), true);
  assert.equal(isDue({ due: "2026-11-22" }, "2026-11-21"), false);
});

test("Moje błędy: błąd → pudełko 1 na jutro, licznik błędów", () => {
  assert.deepEqual(nextMistake(undefined, false, NOW), { box: 1, due: "2026-11-22", wrong: 1, lastSeen: ISO });
  const prev = { box: 3, due: "2026-12-01", wrong: 2, lastSeen: "x" };
  assert.deepEqual(nextMistake(prev, false, NOW), { box: 1, due: "2026-11-22", wrong: 3, lastSeen: ISO });
});

test("Moje błędy: dobra odpowiedź – pudełka 1 → 2 → 3 → 4 → opanowane", () => {
  assert.equal(nextMistake(undefined, true, NOW), undefined); // zadania nie ma na liście – nic się nie dzieje
  assert.equal(nextMistake({ box: 1, due: "2026-11-22", wrong: 1 }, true, NOW), undefined); // przed terminem – bez zmian
  let e = { box: 1, due: "2026-11-21", wrong: 1, lastSeen: "x" };
  const steps = [];
  for (let t = NOW; e; ) {
    const n = nextMistake(e, true, t);
    if (n === null) { steps.push("opanowane"); break; }
    steps.push(`${n.box}:${n.due}`);
    e = n;
    t = new Date(n.due + "T10:00:00"); // przychodzimy w dniu terminu
  }
  assert.deepEqual(steps, ["2:2026-11-24", "3:2026-12-01", "4:2026-12-15", "opanowane"]);
  assert.deepEqual(BOX_DAYS, [1, 3, 7, 14]);
});

test("terminy przez koniec miesiąca i roku", () => {
  assert.equal(nextMistake(undefined, false, d(2026, 1, 31)).due, "2026-02-01");
  assert.equal(nextMistake(undefined, false, d(2026, 12, 31, 23, 59)).due, "2027-01-01");
  assert.equal(nextMistake({ box: 3, due: "2026-12-25" }, true, d(2026, 12, 25)).due, "2027-01-08");
});

test("Słówka: oceny Nie wiem / Trudne / Wiem", () => {
  assert.deepEqual(nextWord(undefined, 0, "lesson:x", NOW), { box: 1, due: "2026-11-22", deck: "lesson:x", first: "2026-11-21", lastSeen: ISO });
  assert.deepEqual(nextWord(undefined, 1, "lesson:x", NOW), { box: 1, due: "2026-11-22", deck: "lesson:x", first: "2026-11-21", lastSeen: ISO });
  assert.deepEqual(nextWord(undefined, 2, "lesson:x", NOW), { box: 2, due: "2026-11-24", deck: "lesson:x", first: "2026-11-21", lastSeen: ISO });
  const due = { box: 3, due: "2026-11-20", deck: "vocab:a", first: "2026-10-01", lastSeen: "x" };
  assert.deepEqual(nextWord(due, 2, "lesson:y", NOW), { box: 4, due: "2026-12-05", deck: "vocab:a", first: "2026-10-01", lastSeen: ISO }); // talia i first zostają
  assert.deepEqual(nextWord(due, 1, "lesson:y", NOW), { box: 3, due: "2026-11-28", deck: "vocab:a", first: "2026-10-01", lastSeen: ISO });
  const later = { box: 3, due: "2026-11-25", deck: "vocab:a", first: "2026-10-01" };
  assert.equal(nextWord(later, 2, "x", NOW), undefined); // przed terminem – Wiem / Trudne nic nie zmieniają
  assert.equal(nextWord(later, 1, "x", NOW), undefined);
  assert.equal(nextWord(later, 0, "x", NOW).box, 1); // Nie wiem – zawsze od nowa
  assert.equal(nextWord({ box: 6, due: "2026-11-21" }, 2, "x", NOW).due, "2027-01-20"); // pudełko 6 = co 60 dni
  assert.equal(nextWord({ box: 6, due: "2026-11-21" }, 2, "x", NOW).box, SRS_DAYS.length);
  assert.equal(nextWord({ box: 2, due: "2026-11-21" }, 2, "x", NOW).first, ""); // wpis bez first (np. z migracji)
});

test("migracja „znam” → pudełko 3 z terminem rozłożonym na 2 tygodnie", () => {
  const e = knownEntry("hello", "lesson:a", NOW);
  assert.equal(e.box, 3);
  assert.equal(e.deck, "lesson:a");
  assert.ok(e.due >= "2026-11-22" && e.due <= "2026-12-05");
  assert.deepEqual(knownEntry("hello", "lesson:a", NOW), e); // ten sam termin dla tego samego słowa
  const s = { known: { "lesson:a": { Hello: 1, "<b>Bye</b>": true, nope: 1, off: 0 } }, srs: { bye: { box: 5, due: "2027-01-01" } }, srsNew: 7 };
  const n = migrateKnown(s, (k) => ["hello", "bye", "off"].includes(k), NOW);
  assert.equal(n, 1); // „bye” już jest, „nope” nie ma w kursie, „off” nie jest oznaczone
  assert.deepEqual(Object.keys(s.srs).sort(), ["bye", "hello"]);
  assert.equal(s.srs.bye.box, 5);
  assert.equal(s.srsNew, 10); // zły limit nowych → domyślny
  const s2 = { known: {}, srs: null, srsNew: 15 };
  assert.equal(migrateKnown(s2, () => true, NOW), 0);
  assert.deepEqual(s2.srs, {});
  assert.equal(s2.srsNew, 15);
  assert.equal(wordKey("<b>Get</b> up"), "get up");
});

test("kolejka na dziś: zaległe od najstarszych, nowe do limitu, talie aktywne", () => {
  const decks = [
    { id: "lesson:a", lesson: { id: "a" }, keys: ["one", "two", "three", "four"] },
    { id: "lesson:b", lesson: { id: "b" }, keys: ["five", "six"] },
    { id: "vocab:x", keys: ["seven", "one"] },
    { id: "reading", manual: true, keys: ["eight"] },
  ];
  const words = new Set(["one", "two", "three", "four", "five", "six", "seven", "eight", "old"]);
  const st = {
    done: { a: true }, known: { "vocab:x": { seven: 1 } }, srsNew: 3,
    srs: {
      two: { box: 2, due: "2026-11-21", deck: "lesson:a", first: "2026-11-21" },
      three: { box: 1, due: "2026-11-19", deck: "lesson:a", first: "2026-11-10" },
      eight: { box: 1, due: "2026-11-30", deck: "reading" },
      gone: { box: 1, due: "2026-11-01", deck: "lesson:a" }, // słowa nie ma już w kursie
    },
  };
  assert.deepEqual(activeDecks(st, decks).map((x) => x.id), ["lesson:a", "vocab:x", "reading"]);
  const q = srsToday(st, decks, words, "2026-11-21");
  assert.deepEqual(q.due, ["three", "two"]);
  assert.deepEqual(q.fresh, [{ k: "one", deck: "lesson:a" }, { k: "four", deck: "lesson:a" }]); // limit 3, 1 już dziś
  assert.equal(q.avail, 3); // one, four, seven (reading – tylko ręcznie)
});

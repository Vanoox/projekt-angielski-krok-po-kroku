// Stan w localStorage, migracje i kopia postępu (js/storage.js) – z atrapą localStorage.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { fakeLocalStorage, d } from "./helpers.mjs";

const ls = fakeLocalStorage();
globalThis.localStorage = ls;
const S = await import("../js/storage.js");
const { store, loadState, migrateState, parseBackup, mergeData, readAll, writeAll, backupStats, backupDue, BACKUP_APP, BACKUP_VERSION } = S;

const file = (data, extra = {}) => JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, date: "2026-11-10T08:00:00.000Z", data, ...extra });
beforeEach(() => ls.clear());

test("store: JSON z prefiksem eng-, uszkodzony wpis → wartość domyślna", () => {
  store.set("done", { a: true });
  assert.equal(ls.getItem("eng-done"), '{"a":true}');
  assert.deepEqual(store.get("done", {}), { a: true });
  ls.setItem("eng-scores", "{zepsute");
  assert.deepEqual(store.get("scores", { x: 1 }), { x: 1 });
  assert.equal(store.get("brak", 7), 7);
});

test("loadState: wartości domyślne i zły cel dzienny", () => {
  assert.deepEqual(loadState(), { done: {}, scores: {}, levels: ["A1", "A2", "B1", "B2"], showPl: true, known: {}, mistakes: {}, srs: {}, srsNew: 10, activity: {}, goal: 20 });
  store.set("goal", 33);
  assert.equal(loadState().goal, 20);
  store.set("goal", 50);
  assert.equal(loadState().goal, 50);
});

test("migracje: „znam” → powtórki, dziennik z historii tylko raz", () => {
  const s = { known: { "lesson:a": { cat: 1 } }, srs: {}, srsNew: 10, mistakes: { k: { box: 2, lastSeen: "2026-11-10T10:00:00" } }, activity: {} };
  migrateState(s, (k) => k === "cat", d(2026, 11, 21));
  assert.equal(s.srs.cat.box, 3);
  assert.deepEqual(store.get("srs"), s.srs);
  assert.deepEqual(s.activity, { "2026-11-10": { a: 1, t: 1, ok: 1 } });
  assert.deepEqual(store.get("activity"), s.activity);
  // eng-activity już jest – bez zmian (także po wczytaniu kopii z dziennikiem)
  const s2 = { known: {}, srs: {}, srsNew: 10, mistakes: { k: { box: 1, lastSeen: "2026-11-01T10:00:00" } }, activity: { "2026-11-20": { t: 1 } } };
  migrateState(s2, () => true);
  assert.deepEqual(s2.activity, { "2026-11-20": { t: 1 } });
  assert.deepEqual(store.get("activity"), s.activity);
});

test("kopia: dobra, z nowszej wersji, cudza, uszkodzona", () => {
  const good = parseBackup(file({ "eng-done": { a: true }, "eng-theme": "dark", "eng-backup": { last: "x" }, "eng-goalDay": "2026-11-21", "inne": 1 }));
  assert.deepEqual(good, { data: { "eng-done": { a: true }, "eng-theme": "dark" }, date: "2026-11-10T08:00:00.000Z" }); // bez danych tylko z tego urządzenia
  assert.match(parseBackup(file({}, { version: BACKUP_VERSION + 1 })).error, /nowszej wersji/);
  assert.match(parseBackup(file({}, { version: "1" })).error, /nowszej wersji/);
  assert.match(parseBackup(file({}, { app: "inna" })).error, /nie jest kopią/);
  assert.match(parseBackup(JSON.stringify({ app: BACKUP_APP, version: 1 })).error, /nie jest kopią/);
  assert.match(parseBackup("{nie json").error, /zły format/);
  assert.match(parseBackup("[]").error, /nie jest kopią/);
  const bad = [
    { "eng-done": [] }, { "eng-scores": { a: { correct: 1, total: 0 } } }, { "eng-scores": { a: { correct: -1, total: 2 } } }, { "eng-known": { a: 5 } },
    { "eng-levels": [] }, { "eng-levels": ["C1"] }, { "eng-showPl": "tak" }, { "eng-mistakes": { k: { box: 0, due: "2026-11-21" } } },
    { "eng-srs": { k: { box: 1 } } }, { "eng-srsNew": 7 }, { "eng-goal": 25 }, { "eng-voice": "GB" }, { "eng-theme": "blue" },
    { "eng-activity": { "21.11.2026": { t: 1 } } }, { "eng-activity": { "2026-11-21": { t: -1 } } }, { "eng-activity": { "2026-11-21": { w: "3" } } },
  ];
  for (const data of bad) assert.match(parseBackup(file(data)).error || "", /uszkodzony/, JSON.stringify(data));
});

test("łączenie kopii z postępem na tym urządzeniu", () => {
  const cur = {
    "eng-done": { a: true }, "eng-scores": { x: { correct: 8, total: 10 }, y: { correct: 1, total: 2 } }, "eng-known": { d: { cat: 1 } },
    "eng-activity": { "2026-11-20": { t: 5, ok: 4, w: 1 }, "2026-11-01": { t: 1, a: 1 } },
    "eng-mistakes": { k1: { box: 2, due: "2026-11-22", lastSeen: "2026-11-20T10:00:00Z" }, k2: { box: 1, due: "2026-11-22", lastSeen: "2026-11-20T10:00:00Z" } },
    "eng-srs": { cat: { box: 3, due: "2026-11-30" } }, "eng-goal": 10, "eng-theme": "dark", "eng-levels": ["A1"],
  };
  const inc = {
    "eng-done": { b: true }, "eng-scores": { x: { correct: 4, total: 5 }, y: { correct: 2, total: 2 }, z: { correct: 1, total: 1 } }, "eng-known": { d: { dog: 1 }, e: { sun: 1 } },
    "eng-activity": { "2026-11-20": { t: 3, ok: 3, w: 6 }, "2026-11-01": { t: 2, a: 1 }, "2026-10-01": { w: 1 } },
    "eng-mistakes": { k1: { box: 4, due: "2026-12-01", lastSeen: "2026-11-21T10:00:00Z" }, k2: { box: 3, due: "2026-12-01", lastSeen: "2026-11-19T10:00:00Z" }, k3: { box: 1, due: "2026-11-22" } },
    "eng-srs": { cat: { box: 1, due: "2026-11-22", lastSeen: "2026-11-21T10:00:00Z" } }, "eng-goal": 50, "eng-theme": "light", "eng-levels": ["B2"], "eng-showPl": false,
  };
  const m = mergeData(cur, inc);
  assert.deepEqual(m["eng-done"], { a: true, b: true });
  assert.deepEqual(m["eng-scores"], { x: { correct: 8, total: 10 }, y: { correct: 2, total: 2 }, z: { correct: 1, total: 1 } }); // remis 8/10 = 4/5 → to urządzenie
  assert.deepEqual(m["eng-known"], { d: { cat: 1, dog: 1 }, e: { sun: 1 } });
  assert.deepEqual(m["eng-activity"], { "2026-11-20": { t: 5, ok: 4, w: 6 }, "2026-11-01": { t: 2, a: 1 }, "2026-10-01": { w: 1 } }); // maksimum pól, nie suma
  assert.equal(m["eng-mistakes"].k1.box, 4); // świeższy lastSeen wygrywa
  assert.equal(m["eng-mistakes"].k2.box, 1);
  assert.equal(m["eng-mistakes"].k3.box, 1);
  assert.equal(m["eng-srs"].cat.box, 1); // prawdziwa ocena wygrywa z wpisem bez lastSeen
  assert.equal(m["eng-goal"], 10); // ustawienia zostają z tego urządzenia
  assert.equal(m["eng-theme"], "dark");
  assert.deepEqual(m["eng-levels"], ["A1"]);
  assert.equal("eng-showPl" in m, false);
  const twice = mergeData(m, inc);
  assert.deepEqual(twice["eng-activity"], m["eng-activity"]); // ta sama kopia drugi raz niczego nie podwaja
});

test("odczyt i zapis wszystkich kluczy eng-* (motyw jako zwykły tekst)", () => {
  ls.setItem("eng-done", '{"a":true}');
  ls.setItem("eng-theme", "dark");
  ls.setItem("eng-backup", '{"last":"x"}');
  ls.setItem("eng-broken", "{");
  ls.setItem("inna", "1");
  assert.deepEqual(readAll(), { "eng-done": { a: true }, "eng-theme": "dark" });
  assert.equal(writeAll({ "eng-scores": { x: { correct: 1, total: 1 } }, "eng-theme": "light" }, false), true);
  assert.equal(ls.getItem("eng-theme"), "light");
  assert.equal(ls.getItem("eng-done"), '{"a":true}');
  writeAll({ "eng-goal": 30 }, true); // zastąp: usuwa eng-* (oprócz eng-backup / eng-goalDay)
  assert.deepEqual([...ls._map.keys()].sort(), ["eng-backup", "eng-goal", "inna"]);
});

test("liczby w podglądzie kopii", () => {
  const data = {
    "eng-done": { a: true, b: false, old: true }, "eng-scores": { x: {}, y: {} }, "eng-known": { d: { cat: 1, dog: 0 }, e: { sun: true } },
    "eng-mistakes": { k1: {}, gone: {} }, "eng-srs": { cat: {}, old: {} }, "eng-activity": { "2026-11-20": { t: 1 }, "2026-11-21": { t: 0 } },
  };
  const has = { lesson: (id) => id === "a" || id === "b", task: (k) => k === "k1", word: (k) => k === "cat" };
  assert.deepEqual(backupStats(data, has), { done: 1, scores: 2, words: 2, mistakes: 1, srs: 1, days: 1 });
  assert.deepEqual(backupStats({}, has), { done: 0, scores: 0, words: 0, mistakes: 0, srs: 0, days: 0 });
});

test("przypomnienie o kopii co 14 dni, gdy przybyło postępu", () => {
  const now = d(2026, 11, 21, 10);
  assert.equal(backupDue(0, now), false);
  assert.equal(ls.getItem("eng-backup"), null);
  assert.equal(backupDue(3, now), false); // pierwszy raz – zaczynamy liczyć
  assert.deepEqual(store.get("backup"), { since: now.toISOString(), count: 0 });
  assert.equal(backupDue(3, d(2026, 12, 4, 10)), false); // 13 dni
  assert.equal(backupDue(3, d(2026, 12, 5, 10)), true); // 14 dni
  store.set("backup", { last: "x", since: now.toISOString(), count: 3 });
  assert.equal(backupDue(3, d(2026, 12, 25)), false); // bez nowego postępu
  assert.equal(backupDue(4, d(2026, 12, 25)), true);
});

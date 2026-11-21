// Stan ucznia w localStorage (klucze eng-*), migracje i kopia postępu: odczyt, sprawdzenie i łączenie pliku
// (moduł bez DOM; testy: tests/storage.test.mjs). Widok kopii (przyciski, podgląd, pobieranie pliku) – w app.js.
import { LEVELS, isObj } from "./util.js";
import { DAY_RE, DAY } from "./dates.js";
import { NEW_CHOICES, migrateKnown } from "./srs.js";
import { GOAL_CHOICES, GOAL_DEFAULT, goalOf, dayTotal, activityFromHistory } from "./activity.js";

// ---------- Stan (localStorage) ----------
export const store = {
  get(k, d) { try { const v = localStorage.getItem("eng-" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("eng-" + k, JSON.stringify(v)); } catch (e) {} },
};
// Ponownie wywoływane po wczytaniu kopii postępu (Object.assign(state, loadState())).
export const loadState = () => ({
  done: store.get("done", {}),
  scores: store.get("scores", {}),
  levels: store.get("levels", LEVELS.slice()),
  showPl: store.get("showPl", true),
  known: store.get("known", {}),
  mistakes: store.get("mistakes", {}),
  srs: store.get("srs", {}),
  srsNew: store.get("srsNew", 10),
  activity: store.get("activity", {}),
  goal: goalOf(store.get("goal", GOAL_DEFAULT)),
});
// Migracje przy starcie i po wczytaniu kopii (s – stan, zmieniany w miejscu; hasWord(k) – słowo jest w kursie):
// słówka „znam” → wpisy w powtórkach (migrateKnown w srs.js) oraz – raz, gdy eng-activity jeszcze nie ma (także po
// wczytaniu starej kopii) – dziennik nauki przybliżony z historii (activityFromHistory w activity.js).
export function migrateState(s, hasWord, now = new Date()) {
  if (migrateKnown(s, hasWord, now)) store.set("srs", s.srs);
  if (store.get("activity", null) !== null) return;
  s.activity = activityFromHistory(s);
  store.set("activity", s.activity);
}

// ---------- Kopia postępu: eksport / import (sekcja #kopia na stronie „Kolejność nauki”) ----------
// Plik: { app: "angielski", version: 1, date, data: { "eng-done": {...}, "eng-scores": {...}, ... } } –
// wszystkie klucze eng-* z localStorage oprócz BACKUP_SKIP. Wartości zapisane jako JSON trafiają do pliku
// już odczytane (plik da się przeczytać); eng-theme jest w localStorage zwykłym tekstem, stąd RAW_KEYS.
export const BACKUP_APP = "angielski", BACKUP_VERSION = 1;
export const RAW_KEYS = ["eng-theme"];
// Dane przypomnienia o kopii i dzień komunikatu o celu dziennym dotyczą tylko tego urządzenia.
export const BACKUP_SKIP = ["eng-backup", "eng-goalDay"];
const REMIND_DAYS = 14;
// Sprawdzenie typów przy wczytywaniu – plik niezgodny z tym opisem jest odrzucany w całości.
const BACKUP_CHECK = {
  "eng-done": isObj,
  "eng-scores": (v) => isObj(v) && Object.values(v).every((s) => isObj(s) && s.total > 0 && s.correct >= 0),
  "eng-known": (v) => isObj(v) && Object.values(v).every(isObj),
  "eng-levels": (v) => Array.isArray(v) && v.length > 0 && v.every((x) => LEVELS.includes(x)),
  "eng-showPl": (v) => typeof v === "boolean",
  "eng-mistakes": (v) => isObj(v) && Object.values(v).every((m) => isObj(m) && m.box >= 1 && typeof m.due === "string"),
  "eng-srs": (v) => isObj(v) && Object.values(v).every((m) => isObj(m) && m.box >= 1 && typeof m.due === "string"),
  "eng-srsNew": (v) => NEW_CHOICES.includes(v),
  "eng-goal": (v) => GOAL_CHOICES.includes(v),
  "eng-voice": isObj, // pola sprawdza loadVoiceCfg (zły akcent / tempo → wartość domyślna)
  "eng-theme": (v) => v === "light" || v === "dark",
  "eng-activity": (v) => isObj(v) && Object.entries(v).every(([k, e]) => DAY_RE.test(k) && isObj(e) &&
    ["t", "ok", "w"].every((f) => e[f] === undefined || (Number.isFinite(e[f]) && e[f] >= 0))),
};
// Łączenie kopii z postępem na tym urządzeniu (a = to urządzenie, b = kopia), reguła dla każdego klucza.
const ratio = (s) => s.correct / s.total;
const MERGE = {
  "eng-done": (a, b) => ({ ...a, ...b }), // lekcja przerobiona w którymkolwiek miejscu
  "eng-scores": (a, b) => { // lepszy wynik (przy remisie zostaje wynik z tego urządzenia, jak w saveScore)
    const out = { ...a };
    for (const [k, s] of Object.entries(b)) if (!out[k] || ratio(s) > ratio(out[k])) out[k] = s;
    return out;
  },
  "eng-known": (a, b) => { // suma słówek oznaczonych jako „znam”
    const out = { ...a };
    for (const [k, words] of Object.entries(b)) out[k] = { ...(out[k] || {}), ...words };
    return out;
  },
  // Dziennik nauki: dla każdego dnia większa wartość każdego pola (nie suma – ta sama kopia wczytana dwa razy
  // nie może podwoić liczb). Znacznik przybliżenia „a” zostaje tylko wtedy, gdy obie strony mają dzień przybliżony.
  "eng-activity": (a, b) => {
    const out = { ...a };
    for (const [k, e] of Object.entries(b)) {
      const c = out[k];
      if (!c) { out[k] = e; continue; }
      const m = {};
      for (const f of ["t", "ok", "w"]) { const n = Math.max(c[f] || 0, e[f] || 0); if (n) m[f] = n; }
      if (c.a && e.a) m.a = 1;
      out[k] = m;
    }
    return out;
  },
};
// Ustawienia (poziomy w menu, tłumaczenia, motyw, limit nowych słówek, cel dzienny, głos lektora) przy łączeniu zostają takie, jak na tym urządzeniu –
// także gdy tu nie były zmieniane (wartość domyślna), więc z kopii ich nie bierzemy.
const KEEP_LOCAL = ["eng-levels", "eng-showPl", "eng-theme", "eng-srsNew", "eng-goal", "eng-voice"];
// Klucze bez własnej reguły (eng-mistakes, eng-srs – w postaci { klucz: { box, due, lastSeen, … } }):
// obiekty łączymy wpis po wpisie, a gdy wpis jest w obu miejscach, wygrywa ten z późniejszym lastSeen
// (bez lastSeen – ten z tego urządzenia). Inne wartości zostają z tego urządzenia.
// Nowa funkcja z własnymi danymi powinna dopisać do MERGE (i BACKUP_CHECK) regułę dla swojego klucza.
// eng-mistakes celowo bez reguły: przy tym samym zadaniu wygrywa świeższy stan pudełka. (Zadanie opanowane
// na jednym urządzeniu, a wciąż obecne w kopii z drugiego, wraca na listę – lepiej powtórzyć raz za dużo.)
// eng-srs też bez reguły: przy tym samym słówku wygrywa ostatnia ocena; wpisy z migracji „znam” (bez lastSeen)
// przegrywają z każdą prawdziwą oceną. Słówka „znam” bez wpisu dostają go po wczytaniu (migrateKnown).
const lastSeen = (e) => (isObj(e) && Date.parse(e.lastSeen)) || 0;
function mergeDefault(a, b) {
  if (!isObj(a) || !isObj(b)) return a;
  const out = { ...a };
  for (const [k, e] of Object.entries(b)) if (!(k in out) || lastSeen(e) > lastSeen(out[k])) out[k] = e;
  return out;
}
// cur – dane z tego urządzenia, inc – z kopii (obie w postaci { "eng-…": wartość }).
export function mergeData(cur, inc) {
  const out = { ...cur };
  for (const [k, v] of Object.entries(inc)) {
    if (KEEP_LOCAL.includes(k)) continue;
    out[k] = k in cur ? (MERGE[k] || mergeDefault)(cur[k], v) : v;
  }
  return out;
}

function lsKeys() {
  const out = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("eng-") && !BACKUP_SKIP.includes(k)) out.push(k); } } catch (e) {}
  return out;
}
// Wszystkie klucze eng-* (bez BACKUP_SKIP) z localStorage → { "eng-…": wartość }.
export function readAll() {
  const data = {};
  for (const k of lsKeys()) {
    const raw = localStorage.getItem(k);
    if (RAW_KEYS.includes(k)) { data[k] = raw; continue; }
    try { data[k] = JSON.parse(raw); } catch (e) {} // uszkodzony wpis – i tak nie jest używany (store.get daje domyślny)
  }
  return data;
}
// Zapis danych z kopii (replace – najpierw usuń wszystkie eng-* z tego urządzenia). false = błąd zapisu.
export function writeAll(data, replace) {
  try {
    if (replace) lsKeys().forEach((k) => localStorage.removeItem(k));
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, RAW_KEYS.includes(k) ? String(v) : JSON.stringify(v));
    return true;
  } catch (e) { return false; }
}
// Zwraca { data, date } albo { error: "komunikat dla ucznia" }.
export function parseBackup(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { error: "To nie jest plik z kopią postępu (zły format pliku)." }; }
  if (!isObj(obj) || obj.app !== BACKUP_APP || !isObj(obj.data)) return { error: "Ten plik nie jest kopią postępu z tej strony." };
  if (typeof obj.version !== "number" || obj.version > BACKUP_VERSION) return { error: "Ta kopia pochodzi z nowszej wersji strony. Odśwież stronę i spróbuj jeszcze raz." };
  const data = {};
  for (const [k, v] of Object.entries(obj.data)) {
    if (!k.startsWith("eng-") || BACKUP_SKIP.includes(k)) continue;
    if (BACKUP_CHECK[k] && !BACKUP_CHECK[k](v)) return { error: "Plik z kopią jest uszkodzony – nie da się go wczytać." };
    data[k] = v;
  }
  return { data, date: obj.date };
}
// Liczby do podglądu kopii. has = { lesson(id), task(klucz), word(klucz) } – co istnieje w kursie (stare wpisy pomijamy).
export function backupStats(data, has) {
  const done = data["eng-done"] || {}, known = data["eng-known"] || {};
  return {
    done: Object.keys(done).filter((id) => done[id] && has.lesson(id)).length,
    scores: Object.keys(data["eng-scores"] || {}).length,
    words: Object.values(known).reduce((s, o) => s + Object.values(o).filter(Boolean).length, 0),
    mistakes: Object.keys(data["eng-mistakes"] || {}).filter((k) => has.task(k)).length,
    srs: Object.keys(data["eng-srs"] || {}).filter((k) => has.word(k)).length,
    days: Object.values(data["eng-activity"] || {}).filter((e) => dayTotal(e) > 0).length,
  };
}
// Przypomnienie: 14 dni od ostatniej kopii (albo od „Później” / początku nauki), o ile od ostatniej kopii przybyło postępu.
// eng-backup = { last: data ostatniej kopii, since: od kiedy liczymy 14 dni, count: ile było postępu przy ostatniej kopii }.
// n – ile jest teraz postępu (przerobione lekcje + wyniki).
export function backupDue(n, now = new Date()) {
  const b = store.get("backup", null);
  if (!n) return false;
  if (!isObj(b)) { store.set("backup", { since: now.toISOString(), count: 0 }); return false; }
  return n > (b.count || 0) && now.getTime() - (Date.parse(b.since) || 0) >= REMIND_DAYS * DAY;
}

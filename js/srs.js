// Powtórki w odstępach: pudełka „Moich błędów” (eng-mistakes) i „Słówek na dziś” (eng-srs).
// Moduł bez DOM i bez localStorage – app.js zapisuje wynik (testy: tests/srs.test.mjs). now = „teraz” (Date).
import { stripTags, hashStr, isObj } from "./util.js";
import { today, addDays } from "./dates.js";

/** Termin minął (albo jest dziś). @param {{ due: string }} m @param {string} [day] dzisiejsza data „RRRR-MM-DD” */
export const isDue = (m, day = today()) => m.due <= day;

// ---------- Moje błędy ----------
// Wpis: { box: 1–4, due: "RRRR-MM-DD", wrong: liczba błędów, lastSeen: ISO }.
// Błąd (gdziekolwiek) → pudełko 1, powtórka jutro. Dobra odpowiedź, gdy zadanie jest „na dziś”:
// pudełko 1 → 2 (za 3 dni) → 3 (za 7 dni) → 4 (za 14 dni) → zadanie opanowane, znika z listy.
// Dobra odpowiedź przed terminem niczego nie zmienia (żeby nie przeskakiwać pudełek tego samego dnia).
export const BOX_DAYS = [1, 3, 7, 14];
/**
 * Nowy wpis po odpowiedzi: obiekt = zapisz, null = usuń (opanowane), undefined = bez zmian.
 * @param {MistakeEntry | undefined} prev
 * @param {boolean} ok
 * @param {Date} [now]
 * @returns {MistakeEntry | null | undefined}
 */
export function nextMistake(prev, ok, now = new Date()) {
  if (!ok) return { box: 1, due: addDays(BOX_DAYS[0], now), wrong: ((prev && prev.wrong) || 0) + 1, lastSeen: now.toISOString() };
  if (!prev || !isDue(prev, today(now))) return undefined;
  if (prev.box >= BOX_DAYS.length) return null;
  return { ...prev, box: prev.box + 1, due: addDays(BOX_DAYS[prev.box], now), lastSeen: now.toISOString() };
}

// ---------- Słówka na dziś ----------
// Wpis: { box: 1–6, due: "RRRR-MM-DD", deck: talia, z której słowo trafiło do powtórek,
//         first: dzień pierwszej oceny (do dziennego limitu nowych słówek), lastSeen: ISO }.
// Ocena w fiszce: „Nie wiem” → pudełko 1, powtórka jutro (zawsze, także przed terminem).
// „Trudne” → to samo pudełko, „Wiem” → pudełko wyżej; słówko wraca po 1, 3, 7, 14, 30 albo 60 dniach
// (pudełko 6 = co 60 dni, słówka nie znikają). „Trudne” i „Wiem” przed terminem niczego nie zmieniają.
export const SRS_DAYS = [1, 3, 7, 14, 30, 60];
export const NEW_CHOICES = [5, 10, 15, 20];
export const SRS_ROUND = 20;
// Klucz karty: angielskie słowo małymi literami (to samo słowo bywa w kilku lekcjach i działach – jedna karta).
/** @param {string} en @returns {string} */
export const wordKey = (en) => stripTags(en).toLowerCase();
/**
 * Nowy wpis po ocenie; undefined = bez zmian.
 * @param {WordEntry | undefined} prev
 * @param {number} rating 0 = nie wiem, 1 = trudne, 2 = wiem
 * @param {string} deck id talii
 * @param {Date} [now]
 * @returns {WordEntry | undefined}
 */
export function nextWord(prev, rating, deck, now = new Date()) {
  let box;
  if (rating === 0) box = 1;
  else if (prev && !isDue(prev, today(now))) return undefined;
  else box = Math.min((prev ? prev.box : 1) + (rating === 2 ? 1 : 0), SRS_DAYS.length);
  return { box, due: addDays(SRS_DAYS[box - 1], now), deck: (prev && prev.deck) || deck, first: prev ? prev.first || "" : today(now), lastSeen: now.toISOString() };
}
// Migracja (przy starcie i po wczytaniu kopii): słówka oznaczone jako „znam” (✓ albo „Wiem” w fiszkach), których
// nie ma jeszcze w powtórkach, trafiają do pudełka 3. Terminy rozkładamy na 2 tygodnie, żeby nie przyszły naraz.
// Bez first (nie liczą się do limitu nowych) i bez lastSeen (przy łączeniu kopii wygrywa prawdziwa ocena).
// s – stan (zmieniany w miejscu), hasWord(k) – czy słowo jest w kursie. Zwraca liczbę dodanych wpisów.
/** @param {string} k @param {string} deck @param {Date} [now] @returns {WordEntry} */
export const knownEntry = (k, deck, now = new Date()) => ({ box: 3, due: addDays(1 + (parseInt(hashStr(k), 36) % 14), now), deck });
/**
 * @param {{ srs: Dict<WordEntry>, srsNew: number, known?: Dict<KnownWords> }} s
 * @param {(k: string) => boolean} hasWord
 * @param {Date} [now]
 * @returns {number}
 */
export function migrateKnown(s, hasWord, now = new Date()) {
  if (!isObj(s.srs)) s.srs = {};
  if (!NEW_CHOICES.includes(s.srsNew)) s.srsNew = 10;
  let n = 0;
  for (const [deck, words] of Object.entries(s.known || {})) for (const [en, v] of Object.entries(words || {})) {
    const k = wordKey(en);
    if (v && hasWord(k) && !s.srs[k]) { s.srs[k] = knownEntry(k, deck, now); n++; }
  }
  return n;
}
// Talie w codziennej kolejce: słownictwo przerobionych lekcji oraz lekcje i działy, które uczeń zaczął
// (ocenił w nich fiszkę albo oznaczył słowo jako znane). decks – wszystkie talie ({ id, lesson?, keys, manual? }).
/**
 * @template {{ id: string, lesson?: { id: string }, manual?: boolean }} D
 * @param {Pick<AppState, "srs" | "known" | "done">} st
 * @param {D[]} decks
 * @returns {D[]}
 */
export function activeDecks(st, decks) {
  const started = new Set(Object.values(st.srs).map((e) => e.deck));
  for (const [d, ws] of Object.entries(st.known)) if (Object.values(ws || {}).some(Boolean)) started.add(d);
  return decks.filter((d) => (d.lesson && st.done[d.lesson.id]) || started.has(d.id));
}
// Kolejka na dziś: due = słówka z terminem do dziś (najstarsze najpierw), fresh = nowe słówka (do limitu dziennego,
// po kolei z talii: lekcje w kolejności nauki, potem działy), avail = ile nowych czeka w taliach bez limitu.
// words – zbiór kluczy słów kursu (Map/Set z has), day – dzisiejsza data.
/**
 * @template {{ id: string, lesson?: { id: string }, manual?: boolean, keys: string[] }} D
 * @param {Pick<AppState, "srs" | "known" | "done" | "srsNew">} st
 * @param {D[]} decks
 * @param {{ has(k: string): boolean }} words
 * @param {string} [day]
 * @returns {{ due: string[], fresh: { k: string, deck: string }[], avail: number, decks: D[] }}
 */
export function srsToday(st, decks, words, day = today()) {
  const t = day, active = activeDecks(st, decks);
  const due = Object.keys(st.srs).filter((k) => words.has(k) && st.srs[k].due <= t).sort((a, b) => st.srs[a].due.localeCompare(st.srs[b].due));
  const left = Math.max(0, st.srsNew - Object.values(st.srs).filter((e) => e.first === t).length);
  /** @type {{ k: string, deck: string }[]} */
  const fresh = [];
  const seen = new Set();
  let avail = 0;
  for (const d of active) if (!d.manual) for (const k of d.keys) if (!st.srs[k] && !seen.has(k)) { // talia czytanek – tylko „Dodaj do fiszek”
    seen.add(k); avail++;
    if (fresh.length < left) fresh.push({ k, deck: d.id });
  }
  return { due, fresh, avail, decks: active };
}

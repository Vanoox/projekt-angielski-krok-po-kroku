// Stan ucznia (localStorage eng-*, js/storage.js) i to, co z niego wynika: seria dni nauki, kolejka słówek na dziś,
// zaliczone sprawdziany i testy poziomu, zasięg (pierwsza nieprzerobiona lekcja), następny krok na ścieżce.
import { stripTags } from "./util.js";
import { activeDecks as activeDecksOf, srsToday as srsTodayOf } from "./srs.js";
import { streakInfo as streakOf } from "./activity.js";
import { loadState, store } from "./storage.js";
import { icon } from "./icons.js";
import { PATH, CP_AFTER, lessonNo, DECKS, WORDS } from "./data.js";

// ---------- Stan (localStorage) ----------
// store, loadState i migracje stanu (klucze eng-*) – js/storage.js.
export const state = loadState();
export const save = () => { for (const k of Object.keys(state)) store.set(k, state[k]); };

// ---------- Dziennik nauki (eng-activity) ----------
export const streakInfo = () => streakOf(state.activity);
export const streakHint = (s) => !s.days ? "Zrób pierwsze zadanie albo oceń słówko w fiszkach – tu zobaczysz swoje dni nauki."
  : s.todayDone ? "Dziś już się uczysz – seria trwa."
  : s.current ? "Zrób dziś choć jedno zadanie albo słówko, żeby nie przerwać serii."
  : "Zrób dziś choć jedno zadanie albo słówko i zacznij nową serię.";

// ---------- Słówka na dziś: pudełka dla słówek (eng-srs) ----------
const activeDecks = () => activeDecksOf(state, DECKS);
export const srsToday = () => srsTodayOf(state, DECKS, WORDS);
// Treść karty: słowo z podanej talii (albo z pierwszej, w której występuje); inne znaczenia z pozostałych talii jako „też:”.
export function wordCard(k, deckId) {
  const occ = WORDS.get(k), main = occ.find((o) => o.deck.id === deckId) || occ[0];
  const also = [...new Set(occ.map((o) => stripTags(o.w.pl)))].filter((p) => p !== stripTags(main.w.pl)).slice(0, 3);
  return { k, w: main.w, deck: main.deck.id, also };
}
export const cpKey = (c) => "checkpoint:" + c.id;
export const cpPassed = (c) => { const s = state.scores[cpKey(c)]; return !!s && s.correct / s.total >= 0.8; };
export const cpRange = (c) => `${lessonNo(c.lessons[0])}–${lessonNo(c.lessons[c.lessons.length - 1])}`;
// Test poziomu (#/test-poziomu/A1): wynik w scores pod „test-level:A1”, zaliczenie od 80% = odznaka przy poziomie.
export const ltKey = (lv) => "test-level:" + lv;
export const ltPassed = (lv) => { const s = state.scores[ltKey(lv)]; return !!s && s.correct / s.total >= 0.8; };
export const ltBadge = (lv) => ltPassed(lv) ? `<span class="lt-badge" title="Test poziomu ${lv} zaliczony">${icon("medal")} ${lv} zaliczony</span>` : "";
// Następny krok na ścieżce: pierwsza nieprzerobiona lekcja – chyba że tuż przed nią jest sprawdzian,
// którego blok jest już przerobiony, a sam sprawdzian niezaliczony (pominięte starsze sprawdziany nie blokują).
export function nextStep() {
  const i = PATH.findIndex((l) => !state.done[l.id]);
  const before = i < 0 ? PATH[PATH.length - 1] : PATH[i - 1];
  const cp = before && CP_AFTER[before.id];
  if (cp && !cpPassed(cp) && cp.lessons.every((l) => state.done[l.id])) return { cp, href: `#/sprawdzian/${cp.id}`, title: `Sprawdzian ${cp.n}: ${cp.title}` };
  return i < 0 ? null : { lesson: PATH[i], href: `#/lesson/${PATH[i].id}`, title: PATH[i].title };
}

// ---------- Zasięg: lekcje do pierwszej nieprzerobionej ----------
export const reachIdx = () => { const i = PATH.findIndex((l) => !state.done[l.id]); return i < 0 ? PATH.length - 1 : i; };

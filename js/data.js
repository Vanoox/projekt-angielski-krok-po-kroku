// Dane kursu (data/bundle.js → window.LESSONS / PRACTICE / VOCAB / CHECKPOINTS / READING / DIALOGUES / CHATS) przygotowane raz
// przy starcie: ścieżka lekcji w kolejności nauki, sprawdziany, rejestr zadań do „Moich błędów” (TASKS / KEY_OF), czytanki,
// dialogi, rozmowy i talie fiszek (DECKS / WORDS).
import { LEVELS, stripTags, hashStr } from "./util.js";
import { wordKey } from "./srs.js";
import { dictText, buildFinds } from "./tasks.js";

// ---------- Dane ----------
const PRACTICE = window.PRACTICE || {};
const raw = (window.LESSONS || []).map((l, i) => {
  const p = PRACTICE[l.id] || {};
  return { ...l, vocab: p.vocab || l.vocab || null, practice: p.practice || l.practice || [], test: p.test || l.test || [], requires: p.requires || l.requires || [], _i: i };
});
// Rekomendowana ścieżka: kolejność z data/lessons/order.json (kolejność nauki – każda lekcja
// korzysta tylko z tego, co było wcześniej). Poziom tylko jako zabezpieczenie.
export const PATH = raw.slice().sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
export const BY_ID = Object.fromEntries(PATH.map((l) => [l.id, l]));
// Sprawdziany powtórkowe (data/checkpoints.js): każdy obejmuje lekcje od poprzedniego sprawdzianu do `after`.
export const CHECKPOINTS = [];
(window.CHECKPOINTS || []).filter((c) => BY_ID[c.after])
  .sort((a, b) => PATH.indexOf(BY_ID[a.after]) - PATH.indexOf(BY_ID[b.after]))
  .forEach((c) => {
    const end = PATH.indexOf(BY_ID[c.after]);
    const prev = CHECKPOINTS[CHECKPOINTS.length - 1];
    const start = prev ? PATH.indexOf(BY_ID[prev.after]) + 1 : 0;
    if (end < start) return;
    CHECKPOINTS.push({ ...c, n: CHECKPOINTS.length + 1, lessons: PATH.slice(start, end + 1), prior: PATH.slice(0, start), level: PATH[end].level });
  });
export const CP_BY_ID = Object.fromEntries(CHECKPOINTS.map((c) => [c.id, c]));
export const CP_AFTER = Object.fromEntries(CHECKPOINTS.map((c) => [c.after, c]));
export const lessonNo = (l) => PATH.indexOf(l) + 1;
export const VOCAB =(window.VOCAB || []).slice().sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
export const VOCAB_BY_ID = Object.fromEntries(VOCAB.map((t) => [t.id, t]));
export const vocabItems = (t) => (t.groups || []).flatMap((g) => g.items || []);
export const SEARCH_TEXT = Object.fromEntries(PATH.map((l) => [l.id, stripTags(JSON.stringify({ s: l.sections, v: l.vocab, t: l.summary })).toLowerCase()]));
export const HEAD_TEXT = Object.fromEntries(PATH.map((l) => [l.id, (l.title + " " + l.titlePl + " " + l.id.replace(/-/g, " ")).toLowerCase()]));
export const practiceCount = (l) => l.practice.reduce((s, p) => s + (p.items || []).length, 0);
export const allTasks = (l) => (l.exercises || []).length + practiceCount(l) + l.test.length;
// Rejestr zadań do „Moich błędów”. Zadania nie mają id, więc klucz = id lekcji ~ źródło
// (e = szybki sprawdzian, p0, p1… = zestawy ćwiczeń, t = test) ~ skrót treści (typ, pytanie, opcje, odpowiedzi).
// Zmiana treści zadania w data/ daje nowy klucz – stary wpis w eng-mistakes jest wtedy po prostu pomijany.
// Dyktando: zdania z przykładów w teorii lekcji, które da się zapisać ze słuchu (dictText w js/tasks.js).
PATH.forEach((l) => {
  const seen = new Set();
  l.dict = [];
  l.sections.filter((s) => s.type === "examples").forEach((s) => (s.items || []).forEach((e) => {
    const t = dictText(e.en), k = t.toLowerCase();
    if (!t || seen.has(k)) return;
    seen.add(k);
    l.dict.push({ type: "dictation", say: t, answers: [t], pl: e.pl || "", explain: e.pl ? `<span class="d-pl">Po polsku: ${e.pl}</span>` : "" });
  }));
});
// Znajdź błąd: pary { bad, good } z sekcji „mistakes” (zasady w js/tasks.js, buildFinds).
PATH.forEach((l) => { l.finds = buildFinds(l); });
export const TASKS = new Map(); // klucz → { ex, lesson, src, instr }
export const KEY_OF = new WeakMap(); // obiekt zadania → klucz
PATH.forEach((l) => {
  const srcs = [["e", l.exercises || [], ""], ...l.practice.map((p, i) => ["p" + i, p.items || [], p.instruction || ""]), ["t", l.test, ""], ["d", l.dict, ""],
    ["f", l.finds.flatMap((p) => [p.bad, p.good]), ""]];
  for (const [src, items, instr] of srcs) items.forEach((ex) => {
    const base = `${l.id}~${src}~${hashStr([ex.type, ex.q || "", (ex.options || []).join("|"), JSON.stringify(ex.answers ?? ex.answer ?? "")].join("#"))}`;
    let k = base, n = 2;
    while (TASKS.has(k)) k = `${base}~${n++}`; // identyczne zadanie w tym samym zestawie
    TASKS.set(k, { ex, lesson: l, src, instr });
    KEY_OF.set(ex, k);
  });
});
// Czytanki (data/reading/*.js → window.READING, format w tools/FORMAT.md). after = najwcześniejsza lekcja, po której
// tekst jest zrozumiały – czytanka odblokowuje się, gdy ta lekcja jest przerobiona. Kolejność: według lekcji after.
// Pytania trafiają do rejestru zadań („Moje błędy”) z kluczem read~<id>~skrót – niezależnym od after; lekcja zadania =
// lekcja after (grupa na liście błędów, zasięg linków w podsumowaniu typowych błędów), źródło „r”.
export const READING = (window.READING || []).filter((r) => r && BY_ID[r.after] && Array.isArray(r.text))
  .map((r, i) => ({ ...r, lesson: BY_ID[r.after], glossary: r.glossary || {}, questions: r.questions || [], _i: i }))
  .sort((a, b) => PATH.indexOf(a.lesson) - PATH.indexOf(b.lesson) || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
export const RD_BY_ID = Object.fromEntries(READING.map((r) => [r.id, r]));
READING.forEach((r) => r.questions.forEach((ex) => {
  const base = `read~${r.id}~${hashStr([ex.type, ex.q || "", (ex.options || []).join("|"), JSON.stringify(ex.answers ?? ex.answer ?? "")].join("#"))}`;
  let k = base, n = 2;
  while (TASKS.has(k)) k = `${base}~${n++}`;
  TASKS.set(k, { ex, lesson: r.lesson, src: "r", instr: "", reading: r });
  KEY_OF.set(ex, k);
}));
// Dialogi (data/dialogues/*.js → window.DIALOGUES, format w tools/FORMAT.md) – odblokowanie i kolejność jak czytanki.
// Rejestr zadań: pytania i zdania do dyktanda (d.dict – kwestie, które da się zapisać ze słuchu, jak dictText w lekcjach;
// dyktando w Treningu) z kluczem dlg~<id>~skrót, źródło „g”, lekcja = lekcja after.
export const DIALOGUES = (window.DIALOGUES || []).filter((d) => d && BY_ID[d.after] && Array.isArray(d.lines) && d.lines.length)
  .map((d, i) => ({ ...d, lesson: BY_ID[d.after], people: d.people || {}, glossary: d.glossary || {}, questions: d.questions || [], _i: i }))
  .sort((a, b) => PATH.indexOf(a.lesson) - PATH.indexOf(b.lesson) || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
export const DLG_BY_ID = Object.fromEntries(DIALOGUES.map((d) => [d.id, d]));
DIALOGUES.forEach((d) => {
  const seen = new Set();
  d.dict = [];
  d.lines.forEach((x) => {
    const t = dictText(x.en), lk = t.toLowerCase();
    if (!t || seen.has(lk)) return;
    seen.add(lk);
    d.dict.push({ type: "dictation", say: t, answers: [t], pl: x.pl || "", explain: x.pl ? `<span class="d-pl">Po polsku: ${x.pl}</span>` : "" });
  });
  [...d.questions, ...d.dict].forEach((ex) => {
    const base = `dlg~${d.id}~${hashStr([ex.type, ex.q || ex.say || "", (ex.options || []).join("|"), JSON.stringify(ex.answers ?? ex.answer ?? "")].join("#"))}`;
    let k = base, n = 2;
    while (TASKS.has(k)) k = `${base}~${n++}`;
    TASKS.set(k, { ex, lesson: d.lesson, src: "g", instr: "", dialogue: d });
    KEY_OF.set(ex, k);
  });
});
// Rozmowy z wyborem odpowiedzi (data/chats/*.js → window.CHATS, format w tools/FORMAT.md) – odblokowanie i kolejność
// jak czytanki. Graf węzłów: rozmówca mówi (say), uczeń wybiera odpowiedź (options), węzeł z end kończy rozmowę.
// Wynik chat:<id> = wybory dobre od razu / liczba kroków. Bez „Moich błędów” – to rozmowa, a nie zestaw zadań.
export const CHATS = (window.CHATS || []).filter((c) => c && BY_ID[c.after] && c.nodes && c.nodes[c.start])
  .map((c, i) => ({ ...c, lesson: BY_ID[c.after], partner: c.partner || {}, glossary: c.glossary || {}, _i: i }))
  .sort((a, b) => PATH.indexOf(a.lesson) - PATH.indexOf(b.lesson) || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
export const CHAT_BY_ID = Object.fromEntries(CHATS.map((c) => [c.id, c]));
// Liczba kroków (wyborów) na ścieżce samych dobrych odpowiedzi – najkrótszej.
CHATS.forEach((c) => {
  const len = (id, seen) => {
    const n = c.nodes[id];
    if (!n || n.end || seen.has(id) || !Array.isArray(n.options)) return 0;
    const ls = n.options.filter((o) => o.ok && c.nodes[o.next]).map((o) => 1 + len(o.next, new Set([...seen, id])));
    return ls.length ? Math.min(...ls) : 0;
  };
  c.steps = len(c.start, new Set());
});
// Kopia zadania z poleceniem (zestawy ćwiczeń, trening, sprawdziany) – zachowuje klucz oryginału.
export const withTask = (ex, task) => { const c = { ...ex, task }; if (KEY_OF.has(ex)) KEY_OF.set(c, KEY_OF.get(ex)); return c; };
// Rejestr słówek do „Słówek na dziś”. Talia = słownictwo lekcji („lesson:<id>”) albo dział („vocab:<id>”) –
// te same klucze co w state.known. Jedna karta na słowo: klucz = angielskie słowo małymi literami
// (to samo słowo bywa w kilku lekcjach i działach – uczymy się go raz, a nie w każdej talii osobno).
export const DECKS = [
  ...PATH.filter((l) => l.vocab && (l.vocab.items || []).length).map((l) => ({ id: "lesson:" + l.id, items: l.vocab.items, title: `${lessonNo(l)}. ${l.title}`, level: l.level, href: `#/lesson/${l.id}/vocab`, lesson: l })),
  ...VOCAB.map((t) => ({ id: "vocab:" + t.id, items: vocabItems(t), title: `${t.icon || "📘"} ${t.titlePl}`, level: t.level, href: `#/vocab/${t.id}` })),
];
// Talia „Słówka z czytanek”: hasła ze słowniczków czytanek (glossary; przykład = zdanie z tekstu). manual – słowo
// trafia do powtórek tylko przez „Dodaj do fiszek” w czytance, bez codziennej porcji nowych słówek z tej talii.
// Słowo z glossary, które jest też w lekcji / dziale, ma ten sam klucz – karta z talii czytanek pokazuje znaczenie
// z tekstu, a pozostałe jako „też:”.
export const rdSentences = (p) => String(p).match(/[^.!?]+[.!?]+[”’"]*|[^.!?]+$/g) || [];
export const RD_DECK = { id: "reading", title: "📖 Słówka z czytanek", level: "", href: "#/czytanki", manual: true, items: [] };
{
  const seen = new Set();
  READING.forEach((r) => Object.entries(r.glossary).forEach(([en, pl]) => {
    const k = wordKey(en);
    if (!k || seen.has(k)) return;
    seen.add(k);
    const re = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    const ex = r.text.flatMap(rdSentences).map((s) => s.trim()).find((s) => re.test(s));
    RD_DECK.items.push(ex ? { en, pl, ex } : { en, pl });
  }));
  if (RD_DECK.items.length) DECKS.push(RD_DECK);
}
export const WORDS = new Map(); // klucz słowa → [{ deck, w }] – wszystkie miejsca, w których słowo występuje
DECKS.forEach((d) => {
  const keys = new Set();
  d.items.forEach((w) => { const k = wordKey(w.en); if (!k) return; if (!WORDS.has(k)) WORDS.set(k, []); WORDS.get(k).push({ deck: d, w }); keys.add(k); });
  d.keys = [...keys];
});

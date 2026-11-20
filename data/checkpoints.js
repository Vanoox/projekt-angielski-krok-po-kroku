// Sprawdziany powtórkowe w ścieżce nauki.
// Każdy sprawdzian stoi po lekcji `after` i obejmuje lekcje od poprzedniego sprawdzianu do `after`
// (granice liczone według data/lessons/order.json, więc po przestawieniu lekcji sprawdź podział).
// Zasady podziału:
//  - blok ma 2–5 lekcji i kończy się w naturalnym miejscu (temat domknięty, koniec poziomu);
//  - najwyżej 2 nowe czasy w jednym bloku – lekcje z kilkoma czasami dzielimy na mniejsze bloki;
//  - lekcje-kontrasty (np. present simple vs continuous) i lekcje „pomocnicze” (np. irregular verbs)
//    trzymamy razem z czasem, którego dotyczą.
// Zadania losuje js/app.js: ok. 60% z bieżącego bloku, ok. 40% powtórki z wcześniejszych lekcji,
// prawie same zadania z pisaniem całych zdań (testy i ćwiczenia „write”) + trochę układania zdań.
window.CHECKPOINTS = [
  // ---------- A1 ----------
  { id: "cp-a1-1", after: "possessive-s", title: "To be i rzeczowniki",
    focus: "to be, a / an / the, liczba mnoga, this / that / these / those, dopełniacz ’s" },
  { id: "cp-a1-2", after: "imperatives-lets", title: "Present simple i codzienność",
    focus: "present simple, przysłówki częstotliwości, have got, there is / there are, tryb rozkazujący i let’s" },
  { id: "cp-a1-3", after: "can-could", title: "Teraz i wczoraj",
    focus: "present continuous, past simple, can / could" },
  { id: "cp-a1-4", after: "questions", title: "Zaimki, miejsce, ilość i pytania",
    focus: "zaimki osobowe i dzierżawcze, przyimki miejsca, some / any, tworzenie pytań we wszystkich poznanych czasach" },
  // ---------- A2 ----------
  { id: "cp-a2-1", after: "past-continuous", title: "Czynności w toku – teraz i w przeszłości",
    focus: "present simple czy continuous, past continuous (when / while)" },
  { id: "cp-a2-2", after: "indefinite-pronouns", title: "Present perfect",
    focus: "present perfect, czasowniki nieregularne, much / many / a few / a little, someone / anything / nowhere…" },
  { id: "cp-a2-3", after: "conditionals-0-1", title: "Przyszłość i warunki",
    focus: "will, be going to, zerowy i pierwszy tryb warunkowy" },
  { id: "cp-a2-4", after: "articles", title: "Opisywanie i porównywanie",
    focus: "przymiotniki i przysłówki, stopniowanie, przedimki a / an / the / brak" },
  { id: "cp-a2-5", after: "word-order", title: "Obowiązek, rady, czas i szyk",
    focus: "must / have to / mustn’t, przyimki czasu, should / had better, szyk zdania" },
  // ---------- B1 ----------
  { id: "cp-b1-1", after: "present-perfect-continuous", title: "Present perfect – pełny obraz",
    focus: "present perfect czy past simple, present perfect continuous" },
  { id: "cp-b1-2", after: "future-time-clauses", title: "Przeszłość uprzednia i plany",
    focus: "past perfect, czasy teraźniejsze o przyszłości, zdania z when / as soon as / until" },
  { id: "cp-b1-3", after: "too-enough-so-such", title: "Formy czasownika",
    focus: "-ing czy bezokolicznik, used to / would, too / enough / so / such" },
  { id: "cp-b1-4", after: "passive-voice", title: "Drugi tryb i strona bierna",
    focus: "drugi tryb warunkowy, strona bierna w różnych czasach" },
  { id: "cp-b1-5", after: "relative-clauses", title: "Mowa zależna i zdania względne",
    focus: "mowa zależna (zdania, pytania, polecenia), who / which / that / whose / where" },
  { id: "cp-b1-6", after: "phrasal-verbs", title: "Pytania rozłączne, łączniki i phrasal verbs",
    focus: "question tags i krótkie reakcje, although / despite / however…, czasowniki frazowe" },
  // ---------- B2 ----------
  { id: "cp-b2-1", after: "future-continuous", title: "Czasy ciągłe: zaprzeszły i przyszły",
    focus: "past perfect continuous, future continuous" },
  { id: "cp-b2-2", after: "tenses-overview", title: "Future perfect i wszystkie czasy",
    focus: "future perfect i wybór właściwego czasu spośród wszystkich poznanych" },
  { id: "cp-b2-3", after: "conditional-3-mixed", title: "Dedukcja i trzeci tryb",
    focus: "must / can’t / might (have done), trzeci tryb warunkowy i tryby mieszane" },
  { id: "cp-b2-4", after: "causative", title: "Życzenia i zlecanie",
    focus: "wish / if only / I’d rather / it’s time, have / get something done" },
];

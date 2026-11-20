# Format plików z lekcjami

Strona do nauki gramatyki angielskiej (A1–B2) dla Polaków. Każda lekcja to osobny plik `data/lessons/<id>.js`, który dopisuje ją do globalnej tablicy (ćwiczenia, testy i słownictwo do lekcji: `data/practice/<id>.js` – patrz `tools/PRACTICE-FORMAT.md`; po każdej zmianie w `data/` uruchom `node tools/build-index.js` – strona ładuje tylko zbudowany `data/bundle.js`):

```js
window.LESSONS = window.LESSONS || [];
window.LESSONS.push(
  { /* lekcja 1 */ },
  { /* lekcja 2 */ }
);
```

Pliki ładowane są zwykłym `<script>` (strona działa z `file://`), więc: bez `import/export`, bez `fetch`.

## Lekcja

```js
{
  id: "present-simple",              // kebab-case, unikalne w całym projekcie
  title: "Present Simple",           // nazwa angielska
  titlePl: "Czas teraźniejszy prosty",
  level: "A1",                       // "A1" | "A2" | "B1" | "B2"
  category: "Czasy",                 // dokładnie jedna z listy kategorii (patrz niżej)
  summary: "Jedno–dwa zdania po polsku: do czego służy i kiedy używamy.",
  sections: [ /* bloki treści, patrz niżej */ ],
  exercises: [ /* min. 8 ćwiczeń */ ]
}
```

Kategorie (pisownia dokładnie taka): `Czasy`, `Formy czasownika`, `Podstawy`, `Rzeczowniki i określniki`, `Zaimki`, `Przymiotniki i przysłówki`, `Przyimki`, `Czasowniki modalne`, `Tryby warunkowe`, `Konstrukcje zdaniowe`, `Słownictwo i łączniki`.

## Typy sekcji

Pola `html` mogą zawierać proste tagi: `<p> <b> <em> <ul> <ol> <li> <br> <code>`. Pola `en`, `formula`, `wrong`, `right` i komórki tabel też mogą zawierać `<b>` – używaj go do **wyróżnienia omawianej formy** w przykładzie (np. `She <b>works</b> here.`).

```js
{ type: "text", title: "Kiedy używamy?", html: "<p>…</p><ul><li>…</li></ul>" }

{ type: "formula", title: "Budowa", rows: [
    { label: "Twierdzenie (+)", formula: "I / you / we / they + <b>verb</b><br>he / she / it + <b>verb + -s</b>", example: "She <b>works</b> in a bank.", examplePl: "Ona pracuje w banku." },  // examplePl opcjonalne – NIGDY nie dopisuj tłumaczenia do example (🔊 czyta całe pole)
    { label: "Przeczenie (−)", formula: "…", example: "…" },
    { label: "Pytanie (?)", formula: "…", example: "…" },
    { label: "Krótkie odpowiedzi", formula: "…", example: "Yes, I do. / No, she doesn't." }
]}

{ type: "examples", title: "Przykłady: nawyki i rutyna", items: [
    { en: "I <b>get up</b> at seven every day.", pl: "Wstaję o siódmej każdego dnia.", note: "opcjonalny krótki komentarz" }
]}

{ type: "table", title: "Końcówka -s w 3. osobie", headers: ["Zasada", "Przykład"], rows: [["…", "…"]] }

{ type: "tip", title: "Sposób na zapamiętanie", html: "<p>…</p>" }      // zielona ramka „Wskazówka”
{ type: "warning", title: "Uwaga – pułapka dla Polaków", html: "<p>…</p>" }  // pomarańczowa ramka

{ type: "mistakes", title: "Typowe błędy", items: [
    { wrong: "She <b>work</b> in a bank.", right: "She <b>works</b> in a bank.", why: "W 3. osobie l.poj. dodajemy -s." }
]}

{ type: "compare", title: "Present Simple vs Present Continuous", items: [
    { label: "Present Simple", html: "<p>stałe sytuacje, nawyki</p>", examples: ["I <b>work</b> in London."] },
    { label: "Present Continuous", html: "<p>teraz, chwilowo</p>", examples: [{ en: "I<b>'m working</b> from home this week.", pl: "W tym tygodniu pracuję z domu." }] }  // przykład: string (sam angielski) albo {en, pl}
]}
```

## Ćwiczenia

```js
{ type: "choice", q: "She ___ to school every day.", options: ["go", "goes", "going"], answer: 1,
  explain: "He/she/it → czasownik + -s: goes." }

{ type: "gap", q: "They ___ (not / like) coffee.", answers: ["don't like", "do not like"],
  explain: "Przeczenie: don't + bezokolicznik." }
```

- `answer` = indeks poprawnej opcji (od 0). Rozkładaj poprawne odpowiedzi na różne pozycje.
- `gap`: `q` zawiera dokładnie jedno `___`; w nawiasie podpowiedź (czasownik/słowo). `answers` – wszystkie akceptowalne warianty (formy pełne i skrócone, np. `"isn't"`, `"is not"`). Porównanie ignoruje wielkość liter, nadmiarowe spacje, kropkę na końcu i typ apostrofu.
- `explain` po polsku – krótko, DLACZEGO tak jest.

## Zasady redakcyjne

- Wyjaśnienia **po polsku**, przyjaznym językiem, jak dobry nauczyciel. Przykłady po angielsku z polskim tłumaczeniem.
- **Dużo przykładów**: w każdej lekcji łącznie min. 20 przykładów (`examples` + przykłady w `formula`/`compare`), pogrupowanych tematycznie w kilka sekcji `examples` wg zastosowań.
- Każda lekcja: wstęp „kiedy używamy”, budowa (jeśli dotyczy), kilka sekcji przykładów, wyrażenia/słowa-sygnały (jeśli dotyczy), min. 1 `tip` lub `warning` (szczególnie pułapki wynikające z polskiego), sekcja `mistakes` (min. 4 błędy), **min. 8 ćwiczeń** (mieszanka `choice` i `gap`).
- Angielski naturalny, poprawny, współczesny (brytyjski jako baza; ważne różnice US warto wspomnieć).
- Stringi JS w podwójnych cudzysłowach `"…"` (apostrofy w `don't` nie wymagają escape'owania). Nie używaj cudzysłowów `"` wewnątrz tekstu – zamiast nich polskie „…”.
- Typy ćwiczeń `write` (pisanie zdania) i `order` (układanie) – patrz `tools/PRACTICE-FORMAT.md`.
- Po zapisaniu pliku uruchom: `node tools/validate.js data/lessons/TWOJ_PLIK.js` i popraw wszystkie błędy.

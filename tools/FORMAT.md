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
    { wrong: "She <b>work</b> in a bank.", right: "She <b>works</b> in a bank.", why: "W 3. osobie l.poj. dodajemy -s." },
    { wrong: "<b>I'm having</b> a new phone.", right: "I<b>'ve got</b> / I <b>have</b> a new phone.", why: "…", fix: ["I've got a new phone.", "I have a new phone."] }
]}
// Te pary są też zadaniami „Znajdź błąd” (zakładka lekcji, trening): uczeń klika słowo z <b>…</b> w wrong i poprawia całe zdanie.
// – W wrong pogrub całe błędne miejsce (każde pogrubione słowo zalicza wskazanie). Przy kilku wariantach „A / B” zadanie
//   bierze pierwszy; końcowy dopisek w nawiasie, np. „(przez telefon)”, pokazuje się jako podpowiedź pod zdaniem.
// – Poprawne odpowiedzi: warianty z right rozdzielone „ / ”. Gdy to nie są pełne zdania („I've got / I have a new phone.”)
//   albo right gubi część zdania z wrong (kontekst, drugie zdanie), dodaj fix: pełne zdania, składnia jak w answers
//   ({a|b} – alternatywy, (słowo) – opcjonalne). Pierwszy wariant fix to wzór pokazywany uczniowi.

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

## Czytanki (`data/reading/*.js` → `window.READING`)

Krótkie teksty z pytaniami (strona `#/czytanki`). Pliki według poziomu (`a1.js`, `a2.js`, …); nowe teksty dopisuj do tablicy:

```js
window.READING = window.READING || [];
window.READING.push({
  id: "anna-flat",                  // kebab-case, unikalne; adres #/czytanki/anna-flat, wynik w scores pod "read:anna-flat"
  title: "Anna's new flat",         // tytuł angielski
  titlePl: "Nowe mieszkanie Anny",
  level: "A1",                      // nie niższy niż poziom lekcji after
  after: "there-is-are",            // najwcześniejsza lekcja, po której tekst jest zrozumiały – czytanka odblokowuje się po jej przerobieniu
  topic: "Dom",                     // opcjonalnie: krótka etykieta tematu (Dom, Praca, Podróże, Zakupy…)
  text: ["Akapit 1.", "Akapit 2."], // zwykły tekst bez HTML; dialogi w “…” (proste " niedozwolone); zdania kończ . ! ? – tak są dzielone do czytania na głos
  glossary: { "shopping list": "lista zakupów", "left": "pozostały (there isn't any … left = nic już nie zostało)" },
  questions: [ /* 4–6 zadań jak w ćwiczeniach: choice / gap / write (pola jak wyżej i w PRACTICE-FORMAT.md, explain po polsku) */ ]
});
```

- **Kolejność nauki:** tekst i pytania mogą używać tylko gramatyki i słówek z lekcji 1…`after` (kolejność z `data/lessons/order.json`, słówka ze słowniczków lekcji). Słowo spoza nich → do `glossary` z tłumaczeniem. Sprawdź: `node tools/audit/reading.js [id]` – wypisze słowa spoza słówek (z lekcją, w której wchodzą), konstrukcje z późniejszych lekcji (heurystyka) i zbędne wpisy glossary. Przeczytaj też każde zdanie samodzielnie – audyt nie wykryje wszystkiego (np. Present Continuous w znaczeniu przyszłym).
- **glossary** – klucz to forma podstawowa albo zwrot (`go round`, `book`), wartość po polsku. Ma pierwszeństwo przed słówkami kursu, więc służy też do znaczeń zależnych od tekstu (left = pozostały, fit = pasować, suit = garnitur). Kliknięte słowo szuka kolejno: glossary → słowa gramatyczne (zaimki, przyimki, I'm, don't…) → słówka lekcji i działów (z formą podstawową: went → go, shelves → shelf; zwroty: living room, had dinner → have dinner). Hasła glossary trafiają do talii „Słówka z czytanek” („Dodaj do fiszek”).
- Pytania: `choice` / `gap` / `write` (w `write` podaj warianty odpowiedzi – pełne zdania i krótkie, jeśli pasują). Pytania trafiają do „Moich błędów” (źródło „czytanka …”), więc powinny być zrozumiałe także bez tekstu obok (w powtórce jest link do czytanki).
- Po zmianach: `node tools/validate.js` i `node tools/build-index.js`.

## Dialogi (`data/dialogues/*.js` → `window.DIALOGUES`)

Scenki do słuchania czytane dwoma głosami, z pytaniami (strona `#/dialogi`). Pliki według poziomu (`a1.js`, `a2.js`, …):

```js
window.DIALOGUES = window.DIALOGUES || [];
window.DIALOGUES.push({
  id: "at-the-cafe",                 // kebab-case, unikalne wśród dialogów; adres #/dialogi/at-the-cafe, wynik w scores pod "dlg:at-the-cafe"
  title: "At the café", titlePl: "W kawiarni",
  level: "A1",                       // nie niższy niż poziom lekcji after
  after: "countable-uncountable",    // najwcześniejsza lekcja, po której dialog jest zrozumiały – odblokowuje się po jej przerobieniu
  topic: "Jedzenie",                 // opcjonalnie: krótka etykieta tematu
  setting: "Tom wchodzi do kawiarni i zamawia…",          // opis sytuacji po polsku (widoczny przed słuchaniem)
  people: { A: { name: "Kelnerka", g: "f" }, B: { name: "Tom", g: "m" } }, // name – podpis przy kwestii; g – płeć ("m" / "f", opcjonalnie)
  lines: [                           // 6–14 kwestii
    { who: "A", en: "Hello! What would you like?", pl: "Dzień dobry! Co podać?" },
    { who: "B", en: "I'd like a cup of tea, please.", pl: "Poproszę filiżankę herbaty." },
  ],
  glossary: { "here you are": "proszę (gdy coś komuś podajemy)" }, // opcjonalnie: zwroty spoza słówek lekcji 1…after
  questions: [ /* 4–5 zadań: głównie choice / gap (pola jak w ćwiczeniach, explain po polsku) */ ]
});
```

- **en** – zwykły tekst bez HTML i prostych cudzysłowów, zakończony `.`, `!` albo `?`; **pl** – tłumaczenie (pokazywane po kliknięciu „Pokaż tłumaczenie”). Kwestie, które da się zapisać ze słuchu (bez cyfr, nawiasów itp., 3–16 słów – jak dyktando w lekcjach), trafiają do dyktanda w Treningu, gdy dialog jest odblokowany.
- **Głosy:** osoba A – głos z ustawień głosu, B – drugi głos angielski z urządzenia (`secondVoice()`; gdy płeć głosów da się poznać po nazwie, a pasują odwrotnie do `g` – zamiana). Przy jednym głosie obie osoby czyta ten sam głos, B inną wysokością.
- **Kolejność nauki i audyt** jak w czytankach: `node tools/audit/reading.js [id]` sprawdza też dialogi (kwestie i pytania). Słowo spoza słówek → `glossary` (lista „Nowe słowa i zwroty” nad dialogiem, do przejrzenia przed słuchaniem). Przeczytaj każdą kwestię i tłumaczenie samodzielnie.
- **Pytania** sprawdzają rozumienie ze słuchu (tekst jest domyślnie ukryty i odsłania się sam po sprawdzeniu wszystkich pytań). Trafiają do „Moich błędów” (źródło „dialog …”, z linkiem do dialogu).
- Po zmianach: `node tools/validate.js` i `node tools/build-index.js`.

## Rozmowy z wyborem odpowiedzi (`data/chats/*.js` → `window.CHATS`)

Rozgałęziony dialog (strona `#/rozmowy`): rozmówca mówi kwestię, uczeń wybiera jedną z 2–3 odpowiedzi, a rozmowa idzie dalej zależnie od wyboru. Pliki według poziomu (`a1.js`, `a2.js`, …):

```js
window.CHATS = window.CHATS || [];
window.CHATS.push({
  id: "train-ticket",                // kebab-case, unikalne (także względem czytanek i dialogów – audyt filtruje po id); wynik w scores pod "chat:train-ticket"
  title: "Buying a train ticket", titlePl: "Bilet na pociąg",
  level: "A1", after: "questions",   // jak w czytankach: odblokowanie po lekcji after, poziom nie niższy niż jej poziom
  topic: "Podróże",                  // opcjonalnie
  setting: "Jesteś na dworcu…",      // sytuacja po polsku
  goal: "Kup bilet powrotny do Oksfordu na jutro rano…", // cel po polsku – podsumowanie mówi, czy został osiągnięty
  partner: { name: "Kasjer", g: "m" },                   // rozmówca (uczeń to „Ty”); g – płeć do wyboru głosu
  glossary: { "platform": "peron" },                     // opcjonalnie: zwroty spoza słówek lekcji 1…after
  start: "n1",
  nodes: {
    n1: { say: "Good morning. How can I help you?", pl: "Dzień dobry. W czym mogę pomóc?", options: [
      { en: "Good morning. I'd like a ticket to Oxford, please.", pl: "Dzień dobry. Poproszę bilet do Oksfordu.", ok: true, next: "n2" },
      { en: "Good morning. I like a ticket to Oxford, please.", feedback: "„I like” znaczy „lubię”…" },          // bez next – ponowny wybór
      { en: "That's very expensive! Give me a cheap ticket.", next: "w1", feedback: "…Zobacz, jak zareaguje." }, // z next – gorsza ścieżka
    ] },
    end: { say: "You're welcome. Have a good trip!", pl: "Nie ma za co. Miłej podróży!", end: "ok" },
    "end-no": { say: "OK. Next, please!", pl: "Dobrze. Następna osoba, proszę!", end: "fail", note: "Odchodzisz bez biletu…" },
  },
});
```

- **Dobra odpowiedź** (`ok: true`): ma `next` i `pl` (trafia do listy „Kwestie do zapamiętania” w podsumowaniu); opcjonalny `feedback` pokazuje się jako notka.
- **Zła odpowiedź**: zawsze `feedback` po polsku – dlaczego nie (błąd gramatyczny, nieuprzejmie, nie na temat). Bez `next` – informacja i ponowny wybór (najczęstszy przypadek: błędy gramatyczne i odpowiedzi nie na temat). Z `next` – rozmowa idzie gorszą ścieżką (np. po niegrzecznej odpowiedzi rozmówca jest chłodniejszy); z gorszej ścieżki można wrócić na dobrą albo dojść do końca `end: "fail"` (cel nieosiągnięty, `note` wyjaśnia dlaczego).
- **Wynik** `chat:<id>` = kroki, w których pierwszy wybór był dobry / liczba kroków. Każdy krok liczy się do dziennika i celu dziennego. Rozmowy nie trafiają do „Moich błędów”.
- **Walidator** sprawdza graf: każdy `next` istnieje, wszystkie węzły osiągalne ze `start`, brak pętli, z każdego węzła da się dojść do końca, 2–3 odpowiedzi w węźle, co najmniej jedna dobra; same dobre odpowiedzi zawsze prowadzą do `end: "ok"` w 5–8 krokach. Teksty `say` / `en` bez HTML i prostych cudzysłowów, zakończone `.` `!` `?` (polskie litery tylko w nazwach: Gdańsk, Kraków).
- **Kolejność nauki i audyt**: `node tools/audit/reading.js [id]` sprawdza kwestie rozmówcy i wszystkie odpowiedzi (także złe – uczeń je czyta; ich celowych błędów gramatycznych audyt nie zgłasza). Przeczytaj każdą kwestię, tłumaczenie i informację samodzielnie.
- Po zmianach: `node tools/validate.js` i `node tools/build-index.js`.

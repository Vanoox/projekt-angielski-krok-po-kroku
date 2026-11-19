# Ćwiczenia, testy i słownictwo – format i zasady

Uzupełnienie do `tools/FORMAT.md` (format lekcji). Strona działa z `file://` – dane to zwykłe pliki JS ładowane przez `<script>`.

Struktura danych:

- `data/lessons/<id>.js` – lekcja: teoria (`sections`) + szybki sprawdzian (`exercises`). Format JSON-podobny (klucze w cudzysłowach) – zachowaj go przy edycji.
- `data/practice/<id>.js` – **ćwiczenia, test i słownictwo do lekcji** (ten dokument).
- `data/vocab/<poziom>-<n>.js` – działy słownictwa tematycznego.

Wzorcowy plik: **`data/practice/have-got.js`** – przeczytaj go przed pisaniem.

## 1. Plik `data/practice/<id>.js`

```js
window.PRACTICE = window.PRACTICE || {};
window.PRACTICE["present-simple"] = {
  requires: ["to-be"],                // opcjonalnie: id lekcji, które warto znać wcześniej (1–3)
  vocab: {                            // słówka potrzebne do lekcji
    intro: "1–2 zdania po polsku (opcjonalnie)",
    items: [
      { en: "get up", pl: "wstawać", ex: "I get up at 7.", exPl: "Wstaję o 7.", note: "opcjonalna uwaga" },
    ],
  },
  practice: [                         // zestawy ćwiczeń – od łatwych do trudnych
    { title: "1. Końcówka -s", instruction: "Polecenie po polsku (może mieć <b>)", items: [ /* zadania */ ] },
  ],
  test: [ /* zadania – sprawdzane dopiero na końcu */ ],
};
```

Stringi w `"…"`. Wewnątrz tekstu nie używaj `"` – po polsku „…”, po angielsku “…”. Apostrofy (`don't`) bez escape'owania.

## 2. Typy zadań

Każde zadanie ma `explain` – **po polsku, krótko, DLACZEGO** tak jest (reguła, a nie powtórzenie odpowiedzi). Opcjonalnie: `hint` (podpowiedź widoczna od razu) i `task` (krótka etykieta polecenia, np. „Przetłumacz”, „Zamień na pytanie” – szczególnie w `test`, bo tam nie ma instrukcji zestawu).

```js
// wybór – dokładnie JEDNA poprawna opcja
{ type: "choice", q: "She ___ to work by bus.", options: ["go", "goes", "going"], answer: 1, explain: "…" }

// luka – jedna
{ type: "gap", q: "They ___ (not / like) coffee.", answers: ["don't like"], explain: "…" }
// luki – kilka w jednym zdaniu: answers = tablica tablic (warianty dla każdej luki)
{ type: "gap", q: "___ you ___ (like) jazz?", answers: [["Do"], ["like"]], explain: "…" }

// pisanie całego zdania: tłumaczenie, przekształcenie, poprawa błędu, odpowiedź na pytanie
{ type: "write", task: "Przetłumacz", q: "Ona nie pije kawy.", answers: ["She doesn't drink coffee."], explain: "…" }

// układanie zdania z kafelków (kafelki powstają z answers[0], rozdzielone spacjami)
{ type: "order", q: "Czy on pracuje w banku?", answers: ["Does he work in a bank?"], explain: "…" }
// opcjonalnie w order: extra: ["the"] – dodatkowy kafelek-pułapka (nie musi zostać użyty);
// keepCase: true – nie zmieniaj pierwszej litery na małą (zdanie zaczyna się od imienia/nazwy).

// luka „bez przedimka”: answers: ["-"] – akceptowane są też 0, x, ø, „brak”.
```

### Jak działa sprawdzanie (ważne przy pisaniu `answers`)

- Ignorowane: wielkość liter, interpunkcja (kropki, przecinki, ?, !, myślniki, cudzysłowy), nadmiarowe spacje, typ apostrofu.
- **Skróty i formy pełne są równoważne automatycznie**: `don't = do not`, `I'm = I am`, `she's = she is` (oraz `she has` przed got/been/imiesłowem), `won't = will not`, `can't = cannot`, `'d = would/had`, `'ll = will`. Nie musisz wypisywać obu wersji.
- **Składnia skrótowa w answers**: `(that)` = słowo opcjonalne, `{who|that}` = alternatywy. Np. `"She said (that) she was {tired|exhausted}."` akceptuje 4 wersje. Można zagnieżdżać kilka w jednym zdaniu (max ~64 kombinacje). W `order` pierwsza odpowiedź musi być „czysta” (bez nawiasów) – z niej powstają kafelki; alternatywy dopisz jako kolejne elementy `answers`.
- Liczby: jeśli zdanie zawiera liczbę/godzinę, akceptuj oba zapisy: `{8|eight}`, `{at 7|at seven}`.
- Uczeń, którego poprawna wersja nie została przewidziana, może kliknąć „Moja odpowiedź też jest poprawna”, ale **to ostateczność** – Twoim zadaniem jest przewidzieć wszystkie rozsądne wersje.

### Lista kontrolna dla `write`

Dla KAŻDEGO zdania zastanów się, jak inaczej mógłby je poprawnie napisać uczeń, i dodaj warianty:
- synonimy: `{film|movie}`, `{flat|apartment}`, `{child|kid}`, `{mum|mom|mother}`, `{holiday|vacation}`, `{shop|store}`, `{autumn|fall}`, warianty pisowni BrE/AmE (`{colour|color}`, `{realise|realize}`);
- pozycja okolicznika czasu (na początku / na końcu zdania) → osobne elementy `answers`;
- opcjonalne słowa: `(that)`, `(any)`, `(the)`, `(really)`, `(very)`;
- inne poprawne konstrukcje, jeśli polecenie ich nie wyklucza (np. `have got` vs `have`, `going to` vs `will` – jeśli w zdaniu obie są naturalne; jeśli chcesz wymusić konkretną konstrukcję, napisz to w `q` lub `hint`, np. „(użyj present perfect)”);
- przedimki, które mogą się różnić bez zmiany sensu;
- polskie zdanie musi jednoznacznie wskazywać czas/konstrukcję – w razie wątpliwości dodaj kontekst lub wskazówkę w nawiasie.

Zdania do pisania: 4–14 słów, naturalne, z codziennego życia. Unikaj zdań, które da się przetłumaczyć na 10 sposobów (np. idiomatycznych „Dam radę” bez wskazówki).

## 3. Ile zadań i jakich

Ilość zależy od wagi tematu – **tam, gdzie jest dużo do przećwiczenia, daj dużo; tematy wąskie – mniej**. Nie rób 100 zadań dla czegoś, co ma 3 formy.

| Waga tematu | Zestawy (`practice`) | `test` | `vocab` |
|---|---|---|---|
| **S – kluczowy, dużo form/wyjątków** (np. present simple, past simple, present perfect, articles, conditionals, passive) | 7–10 zestawów, łącznie **70–110** zadań | 20–30 | 15–30 |
| **A – ważny** | 5–8 zestawów, łącznie **45–70** | 15–20 | 12–25 |
| **B – wąski** | 4–6 zestawów, łącznie **25–45** | 10–15 | 10–20 |

Zestaw = 6–14 zadań, jeden cel (np. „Końcówka -s: pisownia”, „Pytania z does”, „Present simple czy continuous?”). Kolejność zestawów: rozpoznanie (`choice`) → forma (`gap`) → szyk (`order`) → przekształcenia (`write`) → tłumaczenia (`write`) → zestaw mieszany/kontrastowy (z innymi konstrukcjami, z którymi uczeń myli ten temat).

Przykładowe rodzaje zestawów (dobieraj do tematu):
- pisownia/formy (końcówki, formy nieregularne – `gap`),
- twierdzenie → przeczenie → pytanie (`write` z `task`),
- krótkie odpowiedzi,
- uzupełnianie w kontekście (krótki dialog lub 2–3 zdania w `q`),
- znajdź i popraw błąd (`write`, `task: "Popraw błąd"`) – typowe błędy Polaków,
- przekształcenia „to samo znaczenie” (key word transformation w stylu Cambridge, np. „Use: since”),
- układanie zdań (`order`) – szczególnie szyk pytań, przysłówków, przeczeń,
- tłumaczenie PL→EN (`write`),
- kontrast z myloną konstrukcją.

**Test** (`test`): min. 70% zadań typu `write` (tłumaczenie, przekształcenie, poprawa błędu), reszta `order`/`gap`. Każde zadanie z `task`. Inne zdania niż w zestawach (nie kopiuj).

Nie powtarzaj zdań z sekcji przykładów lekcji ani ze „szybkiego sprawdzianu” (`exercises`) – walidator wykrywa identyczne zadania.

## 4. Słownictwo do lekcji (`vocab`)

Słowa, które uczeń musi znać, żeby skupić się na gramatyce: słówka z przykładów i ćwiczeń tej lekcji + słowa-sygnały (np. dla czasów: *usually, at the moment, yet, since, ago…*), kluczowe czasowniki, stałe wyrażenia związane z tematem. Słowa na poziomie lekcji lub niższym. `en` – forma słownikowa (czasownik bez „to”, rzeczownik bez przedimka; alternatywy rozdziel ` / `, warianty BrE/AmE oznacz `(BrE)`/`(AmE)`). `pl` – naturalne polskie znaczenie (kilka po przecinku, jeśli trzeba). `ex`/`exPl` – przykład przy co najmniej 1/3 słów. `note` – pułapki (fałszywi przyjaciele, nieregularności, niepoliczalność).

## 5. Rozszerzanie teorii w lekcji (`data/lessons/<id>.js`)

Gdzie to ma sens, dopisz nowe sekcje (typy z `tools/FORMAT.md`), np.: dokładniejsze zastosowania i niuanse, reguły pisowni i wymowy (np. wymowa -s/-es, -ed), tabela form, słowa-sygnały, różnice BrE/AmE, „jak to powiedzieć po polsku” (mapowanie polskich konstrukcji), dodatkowe pułapki dla Polaków, porównanie z myloną konstrukcją, krótkie podsumowanie „w pigułce”. Nie powtarzaj tego, co już jest. Wstawiaj sekcje w logicznym miejscu (nie wszystko na końcu). W `formula` przykład angielski w `example`, tłumaczenie w `examplePl`; w `compare` przykłady jako `{ "en": "…", "pl": "…" }` – **nigdy nie wpisuj polskiego tłumaczenia do pola angielskiego** (przycisk 🔊 czyta całe pole).

## 6. Jakość – najważniejsze

- Angielski poprawny, naturalny, współczesny (baza brytyjska). Polski poprawny i naturalny.
- `choice`: sprawdź, czy żadna inna opcja nie jest TEŻ poprawna.
- `gap`: podpowiedź w nawiasie jasno mówi, co wpisać; wszystkie poprawne warianty w `answers`.
- `write`: lista kontrolna z punktu 2.
- W razie wątpliwości co do użycia (kolokacja, BrE/AmE, naturalność) sprawdź w wiarygodnym źródle (Cambridge Dictionary, Oxford Learner's Dictionaries, British Council LearnEnglish). Nie kopiuj ćwiczeń z cudzych stron – pisz własne.
- Po zapisaniu: `node tools/validate.js data/practice/<id>.js data/lessons/<id>.js` → popraw wszystkie błędy.
- Na koniec przeczytaj swój plik jeszcze raz jako surowy recenzent: każdą odpowiedź `choice`, każdą listę `answers` w `write`.

## 7. Dział słownictwa tematycznego (`data/vocab/*.js`)

```js
window.VOCAB = window.VOCAB || [];
window.VOCAB.push({
  id: "a1-family", title: "Family", titlePl: "Rodzina", level: "A1", icon: "👨‍👩‍👧",
  intro: "<p>opcjonalny wstęp, wskazówki</p>",
  groups: [
    { title: "Najbliższa rodzina", intro: "opcjonalnie", items: [
      { en: "mother", pl: "matka", ex: "My mother is a nurse.", exPl: "Moja mama jest pielęgniarką." },
    ] },
  ],
});
```

Jedno słowo nie może się powtarzać w obrębie działu.

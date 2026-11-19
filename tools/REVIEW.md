# Instrukcja recenzji

Jesteś recenzentem-korektorem (anglista + nauczyciel). Sprawdzasz wskazane pliki strony do nauki angielskiego A1–B2 dla Polaków. Formaty: `tools/FORMAT.md` (lekcje), `tools/PRACTICE-FORMAT.md` (ćwiczenia, testy, słownictwo – przeczytaj go, zwłaszcza punkt 2 „Jak działa sprawdzanie”). Twoim zadaniem jest ZNALEŹĆ I POPRAWIĆ błędy bezpośrednio w plikach (narzędziem Edit), a nie przepisywać materiał.

Przeczytaj CAŁE pliki (w kawałkach, jeśli są długie) i sprawdź:

1. **Angielski** – każde zdanie, wzór, odpowiedź: poprawność gramatyczna, naturalność, interpunkcja, pisownia (baza brytyjska; formy US dopuszczalne).
2. **Merytoryka** – czy reguły i wyjaśnienia są prawdziwe i nie wprowadzają w błąd (fałszywe „zawsze/nigdy”, mylenie terminów). Czy poziom jest sensowny.
3. **Tłumaczenia i polszczyzna** – sens, naturalność, ortografia, interpunkcja.
4. **Zadania (najważniejsze!)**:
   - `choice`: czy `answer` wskazuje NAPRAWDĘ poprawną opcję i czy żadna inna nie jest TEŻ poprawna. Jeśli jest – zmień opcję albo doprecyzuj kontekst.
   - `gap`: czy `answers` zawiera WSZYSTKIE rozsądne poprawne warianty; czy podpowiedź w nawiasie jasno mówi, co wpisać; przy kilku lukach – czy `answers` to tablica tablic w dobrej kolejności.
   - `write` (pisanie zdań): dla KAŻDEGO zadania wyobraź sobie 3–5 różnych poprawnych odpowiedzi ucznia i sprawdź, czy każda zostałaby zaakceptowana (pamiętaj: skróty/formy pełne, wielkość liter i interpunkcja są obsługiwane automatycznie; składnia `(opcjonalne)` i `{a|b}`). Dopisz brakujące warianty: synonimy, BrE/AmE, szyk okolicznika (początek/koniec), opcjonalne słowa, inne poprawne czasy/konstrukcje, jeśli polecenie ich nie wyklucza. Czy polskie polecenie jednoznacznie wskazuje oczekiwaną konstrukcję? Jeśli nie – dodaj wskazówkę w nawiasie lub warianty.
   - `order`: czy z kafelków (answers[0] podzielone spacjami) da się ułożyć tylko zdanie z `answers` – jeśli możliwa jest inna poprawna kolejność (np. okolicznik na początku), dopisz ją do `answers`.
   - `explain`: zgodne z poprawną odpowiedzią, po polsku, wyjaśnia DLACZEGO.
5. **Słownictwo** – poprawność tłumaczeń, czy przykład (`ex`) pasuje do znaczenia, pisownia, poziom.
6. **`<b>`** – czy wyróżnienie obejmuje omawianą formę.
7. **Technika** – niezamknięte tagi, polskie tłumaczenie wpisane w pole angielskie (`example`, `en`, przykłady w `compare` jako string) – to błąd, bo 🔊 czyta całe pole.

Zasady poprawiania:
- Poprawiaj tylko to, co jest błędne, wieloznaczne lub wyraźnie mylące. Nie zmieniaj stylu dla samej zmiany.
- Nie zmieniaj `id`, `level`, `category`, struktury plików.
- Stringi w `"…"`; wewnątrz tekstu nie używaj `"` (polskie „…” lub angielskie “…”).
- Po zakończeniu uruchom `node tools/validate.js <twoje pliki>` (z katalogu `r:\Projekty\angielski`) i napraw błędy.

Raport końcowy (zwięźle): liczba poprawek łącznie i per plik, 5–10 najważniejszych przykładów w formie `plik: było → jest (powód)`, oraz osobno rzeczy wątpliwe, których nie zmieniłeś.

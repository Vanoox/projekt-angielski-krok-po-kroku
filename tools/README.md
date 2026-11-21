# Narzędzia

Wszystko działa na samym Node.js (wersja 22 lub nowsza). Jedyna zależność to TypeScript do sprawdzania typów (`devDependencies`, raz: `npm install`) – bez niego działa wszystko poza `npm run typecheck`, a `npm run check` i hook pomijają ten krok z ostrzeżeniem. Nic z `node_modules` nie trafia na stronę. Polecenia uruchamiaj w katalogu głównym repozytorium.

| Polecenie | Co robi |
|---|---|
| `npm run build` | Buduje `data/bundle.js` z plików w `data/`, wpisuje `?v=<hash>`, import map modułów do `index.html` i listę plików do `sw.js` (`tools/build-index.js`). Uruchom po każdej zmianie w `data/`, `js/` albo `css/`. |
| `npm run check` | Wszystkie szybkie sprawdzenia: składnia JS, dane kursu (`validate.js`), aktualność plików z `npm run build`, testy, typy (`tools/check.js`). To samo robi hook przed commitem i GitHub Actions (`.github/workflows/check.yml`, przy każdym pushu i pull requeście). |
| `npm test` | Same testy (`tests/*.test.mjs`, `node --test`). |
| `npm run typecheck` | Same typy: `tsc --noEmit` dla `js/` w trybie `strict` (`tools/typecheck.js`, `tsconfig.json`, ok. 1 s). |
| `npm run validate` | Sama walidacja danych (`tools/validate.js`). |
| `npm run serve` | Strona pod adresem http://localhost:8080/ (`tools/serve.js`). Moduły ES i tryb offline nie działają z pliku (`file:///`), więc stronę sprawdzaj przez serwer. |
| `npm run audit` | Kolejność nauki: słowa i gramatyka przed lekcją, w której są uczone (`tools/audit/dump.js` + `report.js`, raporty w `tools/audit/`). |

## Hook przed commitem

`.githooks/pre-commit` uruchamia `npm run check` i zatrzymuje commit, gdy coś się nie zgadza (np. zapomniany `npm run build` albo zepsuty test). Włącz go raz na komputer:

```
git config core.hooksPath .githooks
```

## Kod strony

Moduły ES w `js/`, bez kroku kompilacji. Importy idą w jedną stronę (bez zależności w kółko): logika → części wspólne → widoki → `app.js`.

- **Logika bez DOM**, z testami w `tests/`: `check.js` (sprawdzanie odpowiedzi), `spelling.js` (pisownia BrE/AmE), `errors.js` (typowe błędy), `srs.js` (pudełka powtórek), `activity.js` (dziennik, seria, cel dzienny), `storage.js` (localStorage, migracje, kopia postępu), `tasks.js` (dyktando, „Znajdź błąd”), `dates.js`, `util.js`.
- **Części wspólne** (DOM): `icons.js` (ikony), `ui.js` (`$`, tytuł strony, odznaki, wyniki, odmiana liczebników, przycisk „Posłuchaj”), `data.js` (dane kursu przygotowane przy starcie: `PATH`, `BY_ID`, `TASKS` / `KEY_OF`, czytanki, dialogi, rozmowy, `DECKS` / `WORDS`), `state.js` (`state`, `save()` i to, co wynika ze stanu: seria, słówka na dziś, zaliczenia, następny krok), `conj.js` (logika trenera odmiany), `due.js` (liczniki „na dziś”), `goal.js` (cel dzienny), `nav.js` (menu boczne), `record.js` (zapis postępu: `saveScore`, `recordResult`, `logActivity`, `rateWord`), `speech.js` (lektor, ustawienia głosu, mikrofon), `exercises.js` (`renderExercises`, `makeController`, `exercisesShell`), `sections.js` (teoria), `drills.js` („Znajdź błąd”, dyktando), `vocab-view.js` (słownictwo: lista, fiszki, quiz), `units.js` (lista czytanek / dialogów / rozmów), `backup.js` (kopia postępu), `theme.js`, `search.js`, `router.js`, `pwa.js`.
- **Widoki** `js/views/*.js` – każdy eksportuje funkcję widoku (np. `lessonView()`), która zwraca `{ html, title, mount(el) }`; `mount` może zwrócić funkcję sprzątającą. Widok może importować części wspólne i inne widoki, ale nie `app.js`.
- **`app.js`** – start: tabela tras `setRoutes([{ match, view }, …])` (pierwsza pasująca), `hashchange`, `window.__ENG` dla testów, pierwsze `route()`.

Nowy widok: funkcja `xxxView()` w `js/views/` + wpis w tabeli tras w `app.js`. Nasłuchy na `window` / `document` dodane w `mount` zdejmuj w zwracanej funkcji sprzątającej (router woła ją przy zmianie strony; lektora i mikrofon zatrzymuje sam). Zdarzenia delegowane na `document` (przyciski „Posłuchaj”, cel dzienny, spis treści…) rejestruje przy załadowaniu moduł, do którego należą. Coś do odświeżenia razem z licznikami „na dziś” – `onTodayCounts(f)` z `due.js` (zamiast importu w kółko). Nowy plik w `js/` trafia do import map i do `sw.js` sam (po `npm run build`).

Formaty danych: `FORMAT.md` (lekcje, czytanki, dialogi, rozmowy), `PRACTICE-FORMAT.md` (ćwiczenia), przegląd treści: `REVIEW.md`.

## Typy (JSDoc)

Kod jest w zwykłym JavaScripcie, a typy są w komentarzach JSDoc – sprawdza je TypeScript (`npm run typecheck`) bez generowania plików, więc strona dalej działa bez kompilacji. Cały `js/` przechodzi tryb `strict` (także `noImplicitAny`).

- **`js/types.d.ts`** – typy danych kursu (`Lesson`, `Section`, `Exercise` + dokładne `ChoiceExercise` / `GapExercise` / `WriteExercise` / `OrderExercise` / `DictationTask` / `FindErrTask`, `Practice`, `VocabItem`, `Checkpoint`, `Reading`, `Dialogue`, `Chat`…), stanu ucznia (`AppState` – klucze `eng-*`, `MistakeEntry`, `WordEntry`, `ActivityDay`, `VoiceCfg`), widoku (`View`, `Route`) i `window.LESSONS` itd. Plik jest globalny – w JSDoc wystarczy nazwa: `/** @param {Lesson} l */`. Zmiana formatu danych (`FORMAT.md`, `PRACTICE-FORMAT.md`) → zmień też typ tutaj.
- Typy z jednego modułu w innym: `/** @type {import("./exercises.js").ExControl} */` (`@typedef` w module, np. `ExControl`, `ExResult`, `ExOpts` w `exercises.js`, `CjForms` / `CjTense` w `conj.js`, `RdEntry` w `views/reading.js`).
- Każda funkcja ma typy parametrów (`@param`), a gdy wynik nie jest oczywisty – `@returns`. Callbacki (`.map((x) => …)`) biorą typ z kontekstu.
- DOM: `$(sel, root)` z `ui.js` zwraca `HTMLElement` (zakładamy, że element jest – jak dotąd); pola formularzy rzutuj w miejscu użycia: `/** @type {HTMLInputElement} */ ($("#search"))`. Delegowanie kliknięć: `closestEl(e, sel)` z `ui.js` (= `e.target.closest(sel)` z typem `HTMLElement | null`). `querySelector` / `querySelectorAll` na elemencie zwraca `Element` – rzutuj na `HTMLElement`, gdy potrzebne `dataset`, `hidden`, `focus()`.
- Bez `// @ts-ignore` / `@ts-expect-error` (dziś: 0). Gdy typ wynika z danych (np. odpowiedź „choice” ma `answer`), rzutowanie `/** @type {number} */ (ex.answer)` z komentarzem dlaczego.
